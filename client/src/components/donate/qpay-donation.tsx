'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';
import { checkPayment, createInvoice, type QPayInvoice } from '@/lib/api';
import { fill, formatMnt } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccount } from '@/components/account/account-provider';
import { AmountPicker, parseAmount, sanitizeAmount } from './amount-picker';
import { DonationSuccess, FormError } from './status';

const MIN_MNT = 1_000;
const MAX_MNT = 100_000_000;
const POLL_MS = 4_000;
/** Stop asking after this long; a donor coming back to the tab still triggers one check. */
const POLL_FOR_MS = 15 * 60_000;

export type Recipient = { id: string; name: string };

type State =
  | { step: 'form' }
  | { step: 'invoice'; invoice: QPayInvoice; amount: number }
  | { step: 'paid'; amount: number };

/**
 * QPay donation to the campaign, or to one student's fundraiser from their own page. Invoices are
 * created and checked by the Express API (/api/v1/donation), which records the donation.
 */
export function QPayDonation({
  copy,
  fundraiser,
  onPaid,
}: {
  copy: Dictionary['qpay'];
  /** Credit this student's total (their own page). Without it the gift goes to the campaign. */
  fundraiser?: Recipient;
  onPaid?: () => void;
}) {
  const { account } = useAccount();
  const [state, setState] = useState<State>({ step: 'form' });
  const [selected, setSelected] = useState<number | null>(copy.presets[2] ?? null);
  const [custom, setCustom] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const amount = custom ? parseAmount(custom) : (selected ?? 0);
  const amountValid = Number.isInteger(amount) && amount >= MIN_MNT && amount <= MAX_MNT;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (creating) return;
    setError(null);
    if (!amountValid) {
      setError(amount > MAX_MNT ? copy.errors.max : copy.errors.min);
      return;
    }

    setCreating(true);
    try {
      const { qpayData } = await createInvoice({
        amount,
        userId: fundraiser?.id,
        name: name.trim() || account?.name || copy.anonymous,
        message: message.trim(),
      });
      setState({ step: 'invoice', invoice: qpayData, amount });
    } catch (err) {
      console.error('Failed to create QPay invoice', err);
      setError(copy.errors.generic);
    } finally {
      setCreating(false);
    }
  }

  if (state.step === 'paid') {
    return (
      <DonationSuccess
        title={copy.successTitle}
        body={
          fundraiser
            ? fill(copy.successBody, { amount: formatMnt(state.amount), name: fundraiser.name })
            : fill(copy.successBodyCampaign, { amount: formatMnt(state.amount) })
        }
        again={copy.again}
        onAgain={() => {
          setMessage('');
          setState({ step: 'form' });
        }}
      />
    );
  }

  if (state.step === 'invoice') {
    return (
      <InvoiceView
        copy={copy}
        invoice={state.invoice}
        amount={state.amount}
        onPaid={() => {
          setState({ step: 'paid', amount: state.amount });
          onPaid?.();
        }}
        onCancel={() => setState({ step: 'form' })}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <AmountPicker
        label={copy.amountLabel}
        presets={copy.presets}
        format={formatMnt}
        selected={selected}
        custom={custom}
        customLabel={copy.customLabel}
        customPlaceholder={copy.customPlaceholder}
        currencySymbol="₮"
        onSelect={(value) => {
          setSelected(value);
          setCustom('');
        }}
        onCustomChange={(value) => setCustom(sanitizeAmount(value, false))}
      />

      <label className="block">
        <span className="text-sm font-semibold text-ink">{copy.nameLabel}</span>
        <Input
          className="mt-2"
          autoComplete="name"
          maxLength={60}
          placeholder={account?.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">{copy.messageLabel}</span>
        <textarea
          rows={3}
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 w-full min-w-0 resize-none rounded-xl border border-input bg-white px-4 py-3 text-base text-ink shadow-[0_1px_2px_rgb(23_43_58/0.04)] transition-[border-color,box-shadow] outline-none placeholder:text-ink/35 focus-visible:border-teal focus-visible:ring-4 focus-visible:ring-teal/15"
        />
      </label>

      <FormError message={error} />

      <Button type="submit" size="lg" className="w-full" disabled={creating}>
        {creating ? (
          <>
            <Loader2 className="animate-spin" />
            {copy.creating}
          </>
        ) : (
          fill(copy.submit, { amount: amountValid ? formatMnt(amount) : '' }).trim()
        )}
      </Button>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-ink-muted">
        <ShieldCheck className="size-3.5 shrink-0" />
        {copy.secure}
      </p>
    </form>
  );
}

function InvoiceView({
  copy,
  invoice,
  amount,
  onPaid,
  onCancel,
}: {
  copy: Dictionary['qpay'];
  invoice: QPayInvoice;
  amount: number;
  onPaid: () => void;
  onCancel: () => void;
}) {
  const invoiceId = invoice.invoice_id;
  const banks = invoice.urls ?? [];
  const checking = useRef(false);
  // Keep the latest callback without restarting the polling interval on every render.
  const paidCallback = useRef(onPaid);
  useEffect(() => {
    paidCallback.current = onPaid;
  });

  useEffect(() => {
    let done = false;
    const check = async () => {
      if (checking.current || done) return;
      checking.current = true;
      try {
        const { status } = await checkPayment(invoiceId);
        if (status === 'PAID' && !done) {
          done = true;
          paidCallback.current();
        }
      } catch {
        // Network hiccup: the next poll will try again.
      } finally {
        checking.current = false;
      }
    };

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      if (Date.now() - startedAt > POLL_FOR_MS) {
        window.clearInterval(timer);
        return;
      }
      // A hidden tab doesn't need answers; the visibility handler catches up on return.
      if (document.visibilityState === 'visible') void check();
    }, POLL_MS);
    // Donors often leave for their bank app and come back; check right away when they do.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      done = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [invoiceId]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        {copy.cancel}
      </button>

      <div className="mt-5 text-center">
        <p className="font-display text-4xl font-extrabold text-ink tabular-nums">{formatMnt(amount)}</p>
        <h3 className="font-display mt-4 text-xl font-bold text-ink">{copy.scanTitle}</h3>
        <p className="mx-auto mt-2 max-w-sm leading-relaxed text-ink-muted">
          {fill(copy.scanBody, { amount: formatMnt(amount) })}
        </p>
      </div>

      <div className="relative mx-auto mt-7 w-full max-w-64 rounded-3xl bg-white p-4 shadow-[0_24px_60px_-30px_rgb(23_43_58/0.45)] ring-1 ring-ink/5">
        <span aria-hidden className="absolute -top-px -left-px size-8 rounded-tl-3xl border-t-4 border-l-4 border-teal" />
        <span aria-hidden className="absolute -right-px -bottom-px size-8 rounded-br-3xl border-r-4 border-b-4 border-coral" />
        <img src={`data:image/png;base64,${invoice.qr_image}`} alt="QPay QR" className="aspect-square w-full" />
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-teal" aria-live="polite">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-teal" />
        </span>
        {copy.waiting}
      </p>

      {banks.length > 0 && (
        <div className="mt-8 md:hidden">
          <p className="text-center text-sm font-semibold text-ink">{copy.appsLabel}</p>
          <ul className="mt-4 grid grid-cols-4 gap-3">
            {banks.map((bank) => (
              <li key={`${bank.name}-${bank.link}`}>
                <a
                  href={bank.link}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-1.5 text-center transition hover:bg-cream-deep/60"
                >
                  {bank.logo ? (
                    <img src={bank.logo} alt="" className="size-12 rounded-xl object-cover shadow-sm" loading="lazy" />
                  ) : (
                    <span className="grid size-12 place-items-center rounded-xl bg-cream-deep font-bold text-ink/60">
                      {bank.name.charAt(0)}
                    </span>
                  )}
                  <span className="line-clamp-2 text-[11px] leading-tight text-ink/70">{bank.description || bank.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

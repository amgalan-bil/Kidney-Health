import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DonationSuccess({
  title,
  body,
  again,
  onAgain,
}: {
  title: string;
  body: string;
  again: string;
  onAgain: () => void;
}) {
  return (
    <div className="animate-in fade-in zoom-in-95 py-8 text-center duration-700">
      <div className="relative mx-auto grid size-20 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-teal/20 [animation-iteration-count:2]" />
        <span className="relative grid size-20 place-items-center rounded-full bg-teal text-white">
          <Check className="size-9" strokeWidth={3} />
        </span>
      </div>
      <h3 className="font-display mt-7 text-3xl font-extrabold text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-sm text-lg leading-relaxed text-ink-muted">{body}</p>
      <Button variant="outline" className="mt-8 text-ink" onClick={onAgain}>
        {again}
      </Button>
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-coral-soft/70 px-4 py-3 text-sm font-medium text-[#9a3a2c]">
      {message}
    </p>
  );
}

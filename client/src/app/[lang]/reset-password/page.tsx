import { notFound } from 'next/navigation';
import { getDictionary, isLocale } from '@/lib/i18n';
import { SiteHeader } from '@/components/site-header';
import { AuthScreen } from '@/components/account/auth-screen';
import { ResetPasswordForm } from '@/components/account/reset-password-form';

export default async function ResetPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <SiteHeader locale={lang} t={t} />
      <main>
        <AuthScreen eyebrow={t.hero.eyebrow} title={t.reset.title} lead={t.reset.leadEmail}>
          <ResetPasswordForm locale={lang} t={t} />
        </AuthScreen>
      </main>
    </>
  );
}

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getDictionary, isLocale } from '@/lib/i18n';
import { SiteHeader } from '@/components/site-header';
import { AuthScreen } from '@/components/account/auth-screen';
import { AuthForm } from '@/components/account/auth-form';

export default async function SignInPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <SiteHeader locale={lang} t={t} />
      <main>
        <AuthScreen eyebrow={t.hero.eyebrow} title={t.auth.signInTitle} lead={t.auth.signInLead}>
          {/* AuthForm reads ?next= from the URL, so it needs a Suspense boundary. */}
          <Suspense>
            <AuthForm mode="sign-in" locale={lang} t={t} />
          </Suspense>
        </AuthScreen>
      </main>
    </>
  );
}

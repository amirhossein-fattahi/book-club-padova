'use server';

import { headers } from 'next/headers';
import { checkPersistenceConfiguration, consumeRegistrationRateLimit, saveRegistration } from '@/lib/db';
import { notifyNewRegistration } from '@/lib/notify';
import { createRecruitmentHandler, type FormState } from '@/lib/registrations';
import { checkCaptchaConfiguration, verifyCaptcha } from '@/lib/security';

export type { FormState } from '@/lib/registrations';

/** An interest submission is a request for contact, never a seat reservation. */
export async function recruitmentInterestAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const requestHeaders = await headers();
  // Vercel sets this header itself. Do not trust arbitrary client-forwarded IPs.
  const trustedIp = process.env.VERCEL === '1'
    ? requestHeaders.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    : undefined;
  const handle = createRecruitmentHandler({
    checkConfiguration: () => checkPersistenceConfiguration() ?? checkCaptchaConfiguration(),
    verifyCaptcha,
    consumeRateLimit: (email) => consumeRegistrationRateLimit(email, trustedIp),
    save: saveRegistration,
    notify: notifyNewRegistration,
    reportError: () => console.error('[registrations] Submission failed; check storage health.')
  });
  return handle(formData);
}

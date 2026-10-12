'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export type CaptchaStatus = 'loading' | 'ready' | 'error' | 'expired' | 'unconfigured';

interface Props {
  resetKey?: number;
  onTokenChange?: (token: string) => void;
  onStateChange?: (status: CaptchaStatus) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
  }
}

/** Create a fresh challenge after failed submissions and manual retries. */
export default function TurnstileWidget({ resetKey = 0, onTokenChange, onStateChange }: Props) {
  const t = useTranslations('Registration');
  const locale = useLocale();
  const holder = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<CaptchaStatus>(SITE_KEY ? 'loading' : 'unconfigured');

  useEffect(() => {
    let cancelled = false;
    let widgetId: string | null = null;
    let script: HTMLScriptElement | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const update = (nextStatus: CaptchaStatus, token = '') => {
      if (cancelled) return;
      setStatus(nextStatus);
      onTokenChange?.(token);
      onStateChange?.(nextStatus);
    };

    if (!SITE_KEY) {
      update('unconfigured');
      return;
    }
    update('loading');

    const fail = () => {
      if (timer) clearTimeout(timer);
      update('error');
    };
    const render = () => {
      if (cancelled || !holder.current || widgetId !== null) return;
      if (timer) clearTimeout(timer);
      if (!window.turnstile) {
        fail();
        return;
      }
      try {
        widgetId = window.turnstile.render(holder.current, {
          sitekey: SITE_KEY,
          theme: 'light',
          // The compact widget also fits 320px screens with form padding.
          size: 'compact',
          language: locale,
          'response-field': false,
          callback: (token: string) => update('ready', token),
          'error-callback': () => update('error'),
          'expired-callback': () => update('expired'),
          'timeout-callback': () => update('expired'),
          'refresh-expired': 'auto'
        });
      } catch {
        fail();
      }
    };
    const onLoad = () => {
      if (script) script.dataset.turnstileStatus = 'ready';
      render();
    };
    const onError = () => {
      if (script) script.dataset.turnstileStatus = 'error';
      fail();
    };

    if (window.turnstile) {
      render();
    } else {
      script = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
      if (script?.dataset.turnstileStatus === 'error') {
        script.remove();
        script = null;
      }
      const needsAppend = !script;
      if (!script) {
        script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = 'true';
        script.dataset.turnstileStatus = 'loading';
      }
      // Attach listeners before insertion, including when another form is loading it.
      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);
      timer = setTimeout(() => {
        if (script) script.dataset.turnstileStatus = 'error';
        fail();
      }, 15000);
      if (needsAppend) document.head.appendChild(script);
      else if (script.dataset.turnstileStatus === 'ready') render();
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      script?.removeEventListener('load', onLoad);
      script?.removeEventListener('error', onError);
      if (widgetId !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // Navigation may already have removed the widget container.
        }
      }
    };
  }, [resetKey, attempt, locale, onTokenChange, onStateChange]);

  if (!SITE_KEY) return null;
  return (
    <div className="mt-1 space-y-2">
      <div ref={holder} />
      <p role="status" aria-live="polite" className="text-sm text-ink/70">
        {status === 'loading' && t('captchaLoading')}
        {status === 'error' && t('captchaError')}
        {status === 'expired' && t('captchaExpired')}
      </p>
      {(status === 'error' || status === 'expired') && (
        <button type="button" onClick={() => setAttempt((value) => value + 1)} className="rounded-lg border border-clay-200 px-3 py-2 text-sm font-semibold text-clay-800 hover:bg-clay-50">
          {t('captchaRetry')}
        </button>
      )}
    </div>
  );
}

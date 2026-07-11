'use client';

import { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile CAPTCHA widget.
 *
 * When it renders inside a <form>, Turnstile injects a hidden input named
 * `cf-turnstile-response` holding the token — the server action verifies it.
 *
 * If NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set, this renders nothing, so forms
 * keep working locally / before Cloudflare is configured (honeypot still active).
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
  }
}

export default function TurnstileWidget() {
  const holder = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !holder.current || !window.turnstile) return;
      if (widgetId.current) return; // guard against double render
      widgetId.current = window.turnstile.render(holder.current, {
        sitekey: SITE_KEY,
        theme: 'light'
      });
    };

    if (window.turnstile) {
      render();
    } else {
      let script = document.querySelector<HTMLScriptElement>(
        'script[data-turnstile]'
      );
      if (!script) {
        script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = 'true';
        document.head.appendChild(script);
      }
      script.addEventListener('load', render);
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* already gone */
        }
        widgetId.current = null;
      }
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={holder} className="mt-1" />;
}

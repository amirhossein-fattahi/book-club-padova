'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { BookGroup } from '@/data/groups';
import BookCover from './BookCover';
import JoinGroupModal from './JoinGroupModal';

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.5 9h17M8 3.5v3M16 3.5v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 19.5a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function GroupCard({ group }: { group: BookGroup }) {
  const t = useTranslations('Groups');
  const tDays = useTranslations('Days');
  const tGenres = useTranslations('Genres');
  const [open, setOpen] = useState(false);

  const seatsLeft = group.totalSeats - group.takenSeats;
  const isFull = seatsLeft <= 0;
  const day = tDays(group.day);

  return (
    <>
      <article className="flex flex-col overflow-hidden rounded-2xl border border-clay-100 bg-white shadow-card transition-transform duration-200 hover:-translate-y-1">
        <div className="flex gap-4 p-4">
          <div className="w-24 shrink-0 sm:w-28">
            <BookCover
              title={group.title}
              author={group.author}
              cover={group.cover}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="mb-1 inline-flex w-fit rounded-full bg-clay-50 px-2 py-0.5 text-[11px] font-semibold text-clay-700">
              {tGenres(group.genre)}
            </span>
            <h3 className="font-serif text-lg font-bold leading-snug text-ink">
              {group.title}
            </h3>
            <p className="text-sm text-ink/60">{group.author}</p>

            <div className="mt-3 flex items-center gap-1.5 text-sm text-ink/70">
              <span className="text-clay-500">
                <UserIcon />
              </span>
              <span className="truncate">
                <span className="text-ink/50">{t('facilitatorLabel')}: </span>
                {group.facilitator}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-2 border-t border-clay-100 px-4 py-3">
          <div className="flex items-center gap-1.5 text-sm text-ink/70">
            <span className="text-clay-500">
              <CalendarIcon />
            </span>
            {t('atTime', { day, time: group.time })}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-ink/70">
            <span className="text-clay-500">
              <PinIcon />
            </span>
            {group.location}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-clay-100 px-4 py-3">
          <span
            className={[
              'text-sm font-semibold',
              isFull ? 'text-ink/40' : 'text-forest-600'
            ].join(' ')}
          >
            {isFull ? t('full') : t('seatsLeft', { count: seatsLeft })}
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={isFull}
            className="rounded-full bg-clay-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-clay-700 disabled:cursor-not-allowed disabled:bg-clay-200 disabled:text-ink/40"
          >
            {t('join')}
          </button>
        </div>
      </article>

      {open && (
        <JoinGroupModal group={group} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

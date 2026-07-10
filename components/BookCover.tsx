interface BookCoverProps {
  title: string;
  author: string;
  cover: [string, string];
  className?: string;
}

/**
 * Renders a CSS-gradient "book cover" so we don't depend on external images
 * or ship broken <img> links while running on simulated data.
 */
export default function BookCover({
  title,
  author,
  cover,
  className = ''
}: BookCoverProps) {
  const [from, to] = cover;
  return (
    <div
      className={`relative flex aspect-[3/4] w-full flex-col justify-between overflow-hidden rounded-lg p-4 text-white shadow-inner ${className}`}
      style={{
        backgroundImage: `linear-gradient(140deg, ${from} 0%, ${to} 100%)`
      }}
      aria-hidden="true"
    >
      {/* Spine highlight */}
      <span className="absolute inset-y-0 left-3 w-px bg-white/25" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">
        Circolo del Libro
      </span>
      <div>
        <p className="font-serif text-lg font-bold leading-tight drop-shadow-sm">
          {title}
        </p>
        <p className="mt-1 text-xs font-medium text-white/80">{author}</p>
      </div>
    </div>
  );
}

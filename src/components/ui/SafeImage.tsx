import { useState } from 'react';
import { Package } from 'lucide-react';
import { cn } from '../../lib/cn';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({ src, alt, className, fallbackTitle }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'flex flex-col items-center justify-center gap-2 bg-[#F8F8F7] text-[#737373] p-4 text-center',
          className
        )}
      >
        <Package className="h-7 w-7 stroke-[1.5]" aria-hidden="true" />
        <span className="text-xs font-medium text-[#525252] line-clamp-2">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

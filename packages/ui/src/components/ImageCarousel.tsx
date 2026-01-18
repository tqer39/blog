'use client';

import { cn } from '@blog/utils';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface ImageData {
  alt: string;
  src: string;
}

interface ImageCarouselProps {
  content: string;
  className?: string;
}

/**
 * Parses markdown-style image syntax from the content.
 * Supports: ![alt text](url)
 */
function parseImages(content: string): ImageData[] {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images: ImageData[] = [];
  let match: RegExpExecArray | null;

  match = imageRegex.exec(content);
  while (match !== null) {
    images.push({
      alt: match[1] || '',
      src: match[2],
    });
    match = imageRegex.exec(content);
  }

  return images;
}

export function ImageCarousel({ content, className }: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const images = parseImages(content);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  if (images.length === 0) {
    return (
      <div className="my-4 rounded-lg border border-dashed border-muted-foreground/50 p-4 text-center text-muted-foreground">
        No images found. Use markdown image syntax: ![alt](url)
      </div>
    );
  }

  // Single image - no carousel needed
  if (images.length === 1) {
    return (
      <figure className={cn('my-4', className)}>
        {/* biome-ignore lint/performance/noImgElement: External URLs from user content require native img element */}
        <img
          src={images[0].src}
          alt={images[0].alt}
          className="mx-auto max-h-[500px] w-auto rounded-lg object-contain"
          onError={() => handleImageError(0)}
        />
        {images[0].alt && (
          <figcaption className="mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
            {images[0].alt}
          </figcaption>
        )}
      </figure>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <section
      className={cn(
        'image-carousel rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        className
      )}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: Carousel needs keyboard navigation for accessibility
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Image carousel"
    >
      <div className="relative overflow-visible">
        {/* Carousel viewport */}
        <div ref={emblaRef} className="overflow-hidden rounded-lg">
          <div className="flex" style={{ backfaceVisibility: 'hidden' }}>
            {images.map((image, index) => (
              <div
                key={index}
                className="relative"
                style={{ flex: '0 0 100%', minWidth: 0 }}
              >
                {imageErrors[index] ? (
                  <div className="flex h-[200px] w-full items-center justify-center text-center text-muted-foreground">
                    <div>
                      <p>Failed to load image</p>
                      <p className="text-sm">{image.alt || image.src}</p>
                    </div>
                  </div>
                ) : (
                  // biome-ignore lint/performance/noImgElement: External URLs from user content require native img element
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="max-h-[500px] w-full object-contain"
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons - positioned outside viewport to avoid clipping */}
        <button
          type="button"
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Caption bar below image */}
      <div className="mt-3 flex items-center justify-between gap-4 px-1 text-sm text-stone-600 dark:text-stone-400">
        <span className="truncate">{currentImage?.alt || ''}</span>
        <div className="flex shrink-0 items-center gap-3">
          {/* Dot pagination - timeline style like TOC */}
          <div className="flex items-center">
            {images.map((_, index) => {
              const isActive = index === currentIndex;
              const isPast = index < currentIndex;
              const isLast = index === images.length - 1;
              return (
                <div key={index} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => emblaApi?.scrollTo(index)}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: isActive ? '#3b82f6' : '#d1d5db',
                      backgroundColor: isActive
                        ? '#3b82f6'
                        : isPast
                          ? '#9ca3af'
                          : 'white',
                      transition: 'all 0.2s',
                    }}
                    aria-label={`Go to image ${index + 1}`}
                  />
                  {!isLast && (
                    <div
                      style={{
                        height: '2px',
                        width: '16px',
                        backgroundColor: '#d1d5db',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {/* Counter */}
          <span className="text-sm text-stone-500 dark:text-stone-400">
            {currentIndex + 1}/{images.length}
          </span>
        </div>
      </div>
    </section>
  );
}

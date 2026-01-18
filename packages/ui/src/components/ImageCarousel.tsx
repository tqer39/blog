"use client";

import { cn } from "@blog/utils";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
      alt: match[1] || "",
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

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
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
      <figure className={cn("my-4", className)}>
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
    <div className={cn("image-carousel", className)}>
      <div className="relative">
        {/* Carousel viewport */}
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex" style={{ backfaceVisibility: "hidden" }}>
            {images.map((image, index) => (
              <div
                key={index}
                className="relative"
                style={{ flex: "0 0 100%", minWidth: 0 }}
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
                    className="max-h-[500px] w-full rounded-lg object-contain"
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <button
          type="button"
          onClick={scrollPrev}
          className="image-carousel__button absolute left-4 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-lg transition-colors hover:bg-black/80"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          className="image-carousel__button absolute right-4 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-lg transition-colors hover:bg-black/80"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Caption and pagination */}
      <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
        <span className="truncate">{currentImage?.alt || ""}</span>
        <div className="flex shrink-0 items-center gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "image-carousel__dot h-1.5 w-1.5 rounded-full transition-colors",
                index === currentIndex
                  ? "bg-primary"
                  : "bg-stone-300 hover:bg-stone-400 dark:bg-stone-600 dark:hover:bg-stone-500",
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
          <span className="ml-1 text-stone-500">
            {currentIndex + 1}/{images.length}
          </span>
        </div>
      </div>
    </div>
  );
}


"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useCallback } from "react";

export interface TestimonialItem {
  quote: string;
  name: string;
  title: string;
  avatar?: string;
  rating?: number;
}

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: {
  items: TestimonialItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  const getSpeed = useCallback(() => {
    if (containerRef.current) {
      const duration = speed === "fast" ? "25s" : speed === "normal" ? "45s" : "90s";
      containerRef.current.style.setProperty("--animation-duration", duration);
    }
  }, [speed]);

  const getDirection = useCallback(() => {
    if (containerRef.current) {
      const dir = direction === "left" ? "forwards" : "reverse";
      containerRef.current.style.setProperty("--animation-direction", dir);
    }
  }, [direction]);

  useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }, [getDirection, getSpeed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full max-w-[90vw] overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-6 py-8 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <TestimonialCard key={`${item.name}-${idx}`} item={item} />
        ))}
      </ul>
    </div>
  );
};

const TestimonialCard = ({ item }: { item: TestimonialItem }) => {
  return (
    <li className="group relative w-[380px] max-w-[85vw] flex-shrink-0 md:w-[440px]">
      {/* Glow effect on hover */}
      <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-rose-500/20 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100" />
      
      {/* Card container */}
      <div className="relative h-full rounded-3xl border border-white/[0.08] bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950/90 p-8 backdrop-blur-xl transition-all duration-300 group-hover:border-white/[0.15] group-hover:shadow-2xl">
        {/* Decorative corner accent */}
        <div className="absolute right-6 top-6 h-12 w-12 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-600/5 blur-2xl" />
        
        {/* Quote icon */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10">
            <svg
              className="h-5 w-5 text-amber-400/80"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>
          
          {/* Rating stars */}
          {item.rating && (
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    "h-4 w-4 transition-colors",
                    i < item.rating! ? "text-amber-400" : "text-zinc-700"
                  )}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
        </div>

        {/* Quote text */}
        <blockquote className="relative z-10 mb-8">
          <p className="font-serif text-[17px] font-light leading-[1.75] tracking-wide text-zinc-200/90">
            "{item.quote}"
          </p>
        </blockquote>

        {/* Divider */}
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

        {/* Author info */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/20 opacity-60 blur-sm" />
            {item.avatar ? (
              <img
                src={item.avatar}
                alt={item.name}
                className="relative h-12 w-12 rounded-full object-cover ring-2 ring-white/10"
              />
            ) : (
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 ring-2 ring-white/10">
                <span className="text-lg font-medium text-amber-300/80">
                  {item.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Name and title */}
          <div className="flex flex-col">
            <span className="text-[15px] font-medium tracking-wide text-zinc-100">
              {item.name}
            </span>
            <span className="text-[13px] font-light tracking-wide text-zinc-500">
              {item.title}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
};
;

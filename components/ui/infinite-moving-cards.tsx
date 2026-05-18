/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useCallback, useRef } from "react";

export interface MovingCardItem {
  quote: string;
  name: string;
  title: string;
  avatar?: string;
  rating?: number;
}

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
  gradientEdges = true,
  cardClassName,
}: {
  items: MovingCardItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
  gradientEdges?: boolean;
  cardClassName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  const getSpeedDuration = useCallback(() => {
    const speeds = {
      fast: "20s",
      normal: "40s",
      slow: "80s",
    };
    return speeds[speed];
  }, [speed]);

  const getDirectionStyle = useCallback(() => {
    return direction === "left" ? "forwards" : "reverse";
  }, [direction]);

  const addAnimation = useCallback(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      
      // Clone items for seamless infinite scroll
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      // Apply CSS variables
      containerRef.current.style.setProperty(
        "--animation-direction",
        getDirectionStyle()
      );
      containerRef.current.style.setProperty(
        "--animation-duration",
        getSpeedDuration()
      );

      setStart(true);
    }
  }, [getDirectionStyle, getSpeedDuration]);

  useEffect(() => {
    addAnimation();
  }, [addAnimation]);

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex gap-0.5 mt-2">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={cn(
              "w-4 h-4",
              i < rating ? "text-yellow-400" : "text-gray-600"
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full overflow-hidden",
        gradientEdges &&
          "[mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]",
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
        style={{
          animationDirection: "var(--animation-direction)",
          animationDuration: "var(--animation-duration)",
        }}
      >
        {items.map((item, idx) => (
          <li
            key={`${item.name}-${idx}`}
            className={cn(
              "w-[380px] max-w-full relative rounded-2xl overflow-hidden",
              "flex-shrink-0 transition-all duration-300 hover:scale-105",
              "border border-white/10 shadow-2xl",
              "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
              "backdrop-blur-sm",
              cardClassName
            )}
          >
            {/* Decorative gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20 rounded-2xl" />
            
            {/* Card content */}
            <div className="relative p-6 z-10">
              {/* Quote icon */}
              <svg
                className="w-8 h-8 text-white/10 mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              {/* Quote text */}
              <p className="text-gray-200 text-base leading-relaxed mb-6 line-clamp-4">
                {item.quote}
              </p>

              {/* Author section */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                {/* Avatar */}
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {item.name.charAt(0)}
                  </div>
                )}

                {/* Author info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {item.name}
                  </p>
                  <p className="text-gray-400 text-xs truncate">{item.title}</p>
                  {renderStars(item.rating)}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Add required CSS animations
const styles = `
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-50% - 0.75rem));
  }
}

.animate-scroll {
  animation: scroll var(--animation-duration) linear infinite;
  animation-direction: var(--animation-direction);
}
`;

// Inject styles (you can also add this to your global CSS)
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
import React from "react";
import { format } from "date-fns";
import { Star, Quote } from "lucide-react";

export interface ReviewProps {
  id: number;
  rating: number;
  feedback?: string;
  name?: string;
  createdAt: Date;
}

const getInitials = (name?: string) => {
  if (!name) return "A";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
};

const RatingsCard = ({ rating, feedback, name, createdAt }: ReviewProps) => {
  return (
    <article className="group mb-3 rounded-xl border border-[#acc2ef] bg-gray-50 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#acc2ef] bg-white text-sm font-semibold text-gray-700"
            aria-hidden="true"
          >
            {getInitials(name)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700">
              {name || "Anonymous"}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(createdAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-0.5"
            role="img"
            aria-label={`${rating} out of 5 stars`}
          >
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="rounded-full border border-[#acc2ef] bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">
            {rating}.0
          </span>
        </div>
      </header>

      {feedback && (
        <div className="relative rounded-lg border border-[#acc2ef]/60 bg-white/70 p-3 pl-9">
          <Quote
            className="absolute left-2.5 top-2.5 h-4 w-4 text-[#acc2ef]"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-gray-700 text-pretty">
            {feedback}
          </p>
        </div>
      )}
    </article>
  );
};

export default RatingsCard;

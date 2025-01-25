import React from 'react';
import { format } from 'date-fns';
import { Star } from 'lucide-react';

export interface ReviewProps {
  id: number;
  rating: number;
  feedback?: string;
  name?: string;
  createdAt: Date;
}

const RatingsCard = ({ rating, feedback, name, createdAt }: ReviewProps) => {
  return (
    <div className="bg-gray-50 hover:bg-gray-100 transition-colors p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                }`}
            />
          ))}
        </div>
        <span className="ml-2 text-lg font-semibold text-gray-600">{rating}.0</span>
      </div>
      <div className="flex flex-col gap-2">
        {feedback && <p className="text-gray-700">{feedback}</p>}
        <div className="flex text-sm text-muted-foreground items-center justify-between">
          <div className="flex items-center">
            <span>Rated at {format(new Date(createdAt), "MMM d, yyyy")}</span>
          </div>
          <span className="ml-2 text-lg font-semibold text-gray-600"> {name}</span>
        </div>
      </div>
    </div>

  )
}

export default RatingsCard

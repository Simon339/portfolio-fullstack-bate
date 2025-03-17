/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';
import RatingsCard from '@/components/Dashboard/RatingsCard';
import { FetchRatings } from '@/server/actions/ratingaction';
import ReviewModal from '@/components/Dashboard/ReviewModal';

interface Rating {
  id: number;
  rating: number;
  feedback?: string;
  name?: string;
  createdAt: Date;
}

const Ratings = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [pageSize, setPageSize] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(ratings.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRatings = ratings.slice(startIndex, endIndex);

  useEffect(() => {
    // Fetch ratings and update state
    const fetchData = async () => {
      const result = await FetchRatings();
      if (result.success && result.data) {
        setRatings(result.data);
      } else {
        alert("Something happened while fetching data.");
      }
    };

    fetchData();
  }, []);

  return (
    <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
      <div className=" text-center p-2 border-b mb-2 border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800">Customer Reviews</h1>
        <span className='text-sm text-gray-700'>View our customer reviews and ratings for all products. Ensure customer feedback is accurately reflected in the system.</span>
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4"></div>
          <div className="flex items-center gap-2">
            <ReviewModal />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden mt-1">
        <ScrollArea className="h-full pr-2">
          <div className="flex-1 overflow-auto">
            {currentRatings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                <p className="text-2xl font-semibold mb-2">No Reviews yet</p>
                <p className="text-sm text-center">When a start to reviwe, they will appear here.</p>
              </div>
            ) : (
              currentRatings.map((reviews) => (
                <RatingsCard
                  key={reviews.id}
                  id={reviews.id}
                  name={reviews.name}
                  feedback={reviews.feedback}
                  rating={reviews.rating}
                  createdAt={reviews.createdAt}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <footer className="flex justify-between text-gray-600 py-3 mt-auto">
        <div className="flex text-sm text-muted-foreground">
          You have {ratings.length} Reviwes.
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronFirst className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronLast className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default Ratings;
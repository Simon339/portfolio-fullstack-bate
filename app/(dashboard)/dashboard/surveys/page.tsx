/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, MessageSquareText, Star } from 'lucide-react';
import { FetchRatings } from '@/server/actions/ratingaction';
import ReviewModal from '@/components/Dashboard/ReviewModal';
import { format } from 'date-fns';
import { authClient } from '@/hooks/getcurrectuser';

interface Rating {
  id: string;
  rating: number;
  feedback: string | null;
  name: string | null;
  createdAt: Date;
}

const Ratings = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(ratings.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRatings = ratings.slice(startIndex, endIndex);

  const averageRating = useMemo(() => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  }, [ratings]);

  useEffect(() => {
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto flex flex-col overflow-hidden">
        <header className="border-b border-[#acc2ef] px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#acc2ef] bg-gray-50 text-gray-700"
                aria-hidden="true"
              >
                <MessageSquareText className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold text-gray-700 text-balance">
                  Customer Reviews
                </h1>
                <p className="mt-1 text-sm text-gray-500 text-pretty">
                  View and manage customer reviews and ratings for all products.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 rounded-full border border-[#acc2ef] bg-gray-50 px-4 py-2 text-sm text-gray-700"
                aria-label={`Average rating ${averageRating.toFixed(1)} out of 5`}
              >
                <Star
                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  aria-hidden="true"
                />
                <span className="font-semibold">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{ratings.length} total</span>
              </div>
              <ReviewModal />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[500px]">
            {currentRatings.length === 0 ? (
              <div className="flex h-[400px] flex-col items-center justify-center text-gray-700">
                <div
                  className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#acc2ef] bg-gray-50"
                  aria-hidden="true"
                >
                  <MessageSquareText className="h-6 w-6 text-gray-500" />
                </div>
                <p className="mb-1 text-lg font-semibold text-gray-700">
                  No reviews yet
                </p>
                <p className="max-w-xs text-center text-sm text-gray-500 text-pretty">
                  When customers start leaving reviews, they will appear here.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50 border-b border-[#acc2ef]">
                  <tr className="text-left text-sm font-medium text-gray-600">
                    <th className="px-6 py-4 w-16">#</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Feedback</th>
                    <th className="px-6 py-4 w-40">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#acc2ef]/50">
                  {currentRatings.map((review, index) => (
                    <tr
                      key={review.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#acc2ef] to-[#685189] flex items-center justify-center text-white text-sm font-semibold shadow-md ring-1 ring-gray-200">
                            {review.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {review.name || 'Anonymous'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderStars(review.rating)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                          {review.feedback || 'No feedback provided'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ScrollArea>
        </div>

        <footer className="mt-auto flex flex-col gap-3 border-t border-[#acc2ef] bg-gray-50 px-6 py-4 text-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {startIndex + 1}-{Math.min(endIndex, ratings.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {ratings.length}
              </span>{" "}
              review{ratings.length === 1 ? "" : "s"}
            </p>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-sm border border-[#acc2ef] rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#acc2ef]"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                aria-label="First page"
                className="h-8 w-8 border-[#acc2ef] bg-white text-gray-700 hover:bg-[#acc2ef]/10 hover:text-gray-700 disabled:opacity-50"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronFirst className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous page"
                className="h-8 w-8 border-[#acc2ef] bg-white text-gray-700 hover:bg-[#acc2ef]/10 hover:text-gray-700 disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next page"
                className="h-8 w-8 border-[#acc2ef] bg-white text-gray-700 hover:bg-[#acc2ef]/10 hover:text-gray-700 disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Last page"
                className="h-8 w-8 border-[#acc2ef] bg-white text-gray-700 hover:bg-[#acc2ef]/10 hover:text-gray-700 disabled:opacity-50"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronLast className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
};

export default Ratings;
import { useState, useEffect } from 'react';
import { Review } from '@/lib/types';
import { Check, X, AlertTriangle, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { getAllReviews, updateReviewStatus, rejectAndDeleteReview } from '@/lib/reviews-service';
import { toast } from "@/components/ui/use-toast";

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<Array<{barberId: string | number, barberName: string, reviews: Review[]}>>([]);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    loadReviews();
  }, []);
  
  // Load reviews from the service
  const loadReviews = async () => {
    setLoading(true);
    try {
      const reviewsData = await getAllReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get all reviews across all barbers
  const getAllBarberReviews = () => {
    const allReviews: { review: Review; barberId: string | number; barberName: string }[] = [];
    
    reviews.forEach((barberData) => {
      if (barberData.reviews && barberData.reviews.length > 0) {
        barberData.reviews.forEach((review) => {
          allReviews.push({ 
            review, 
            barberId: barberData.barberId,
            barberName: barberData.barberName 
          });
        });
      }
    });
    
    return allReviews;
  };
  
  // Filter reviews based on the selected filter
  const filteredReviews = getAllBarberReviews().filter((item) => {
    if (filter === 'all') return true;
    return filter === 'pending' ? !item.review.approved : item.review.approved;
  });
  
  // Toggle the expanded state of a review
  const toggleExpand = (reviewId: string) => {
    setExpandedReviewId(expandedReviewId === reviewId ? null : reviewId);
  };
  
  // Approve a review
  const handleApproveReview = async (barberId: string | number, reviewId: string) => {
    try {
      const updatedReview = await updateReviewStatus(barberId, reviewId, true);
      // Update local state instead of reloading all reviews
      setReviews(prevReviews =>
        prevReviews.map(barberData =>
          barberData.barberId === barberId // Ensure we are modifying the correct barber's review list
            ? {
                ...barberData,
                reviews: barberData.reviews.map(r =>
                  r.id === reviewId ? updatedReview : r
                ),
              }
            : barberData
        )
      );
      toast({
        title: "Review Approved",
        description: "The review has been approved and is now visible to clients."
      });
    } catch (error) {
      console.error('Error approving review:', error);
      toast({
        title: "Error",
        description: "There was a problem approving the review. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Reject a review (now deletes it)
  const handleRejectReview = async (barberId: string | number, reviewId: string) => {
    try {
      await rejectAndDeleteReview(reviewId); // Call the delete function
      // Update local state to remove the review
      setReviews(prevReviews =>
        prevReviews.map(barberData => ({
          ...barberData,
          reviews: barberData.reviews.filter(r => r.id !== reviewId),
        }))
      );
      toast({
        title: "Review Rejected",
        description: "The review has been rejected and removed."
      });
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast({
        title: "Error",
        description: "There was a problem rejecting the review. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= Math.round(rating)
                ? 'text-amber-500 fill-amber-500'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">({rating.toFixed(1)})</span>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
          <p className="text-gray-500 mt-1">
            Manage and approve client reviews for your barbers
          </p>
        </div>
        
        {/* Filter tabs */}
        <div className="flex space-x-2 bg-gray-50 p-1 rounded-lg">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'pending'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'approved'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'all'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'pending'
              ? "There are no pending reviews waiting for approval."
              : filter === 'approved'
              ? "There are no approved reviews yet."
              : "There are no reviews in the system."}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredReviews.map(({ review, barberId, barberName }) => (
              <li key={review.id} className="hover:bg-gray-50">
                <div className="px-6 py-4">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpand(review.id)}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Barber Image */}
                      <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                        <span className="text-gray-500 text-lg font-semibold">
                          {barberName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Review Summary */}
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{review.clientName}</p>
                          <span className="mx-2 text-gray-300">•</span>
                          <p className="text-sm text-gray-500">
                            For {barberName}
                          </p>
                          <span className="mx-2 text-gray-300">•</span>
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {/* Star Rating */}
                        <div className="mt-1">
                          {renderStarRating(review.rating)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Status Badge */}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          review.approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {review.approved ? 'Approved' : 'Pending'}
                      </span>
                      
                      {/* Expand/Collapse */}
                      {expandedReviewId === review.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedReviewId === review.id && (
                    <div className="mt-4 pl-16">
                      {/* Review Text */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                      
                      {/* Client Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">Client Name:</span>
                          <span className="ml-2 font-medium">{review.clientName}</span>
                        </div>
                        
                        {review.clientEmail && (
                          <div>
                            <span className="text-gray-500">Client Email:</span>
                            <span className="ml-2 font-medium">{review.clientEmail}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      {!review.approved && (
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleRejectReview(barberId, review.id)}
                            className="flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                          
                          <button
                            onClick={() => handleApproveReview(barberId, review.id)}
                            className="flex items-center justify-center px-4 py-2 border border-green-300 text-green-700 bg-green-50 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;

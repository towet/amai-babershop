import { Review, ReviewSubmission } from './types';
import { supabase } from '@/lib/supabaseClient';
import { createReview, getReviewsByBarber as fetchBarberReviews, fetchAllReviewsFromDb, updateReviewApproval, deleteReviewById } from './services/review-service';

// Function to calculate average rating based on approved reviews
export const calculateAverageRating = (reviews: Review[]): number => {
  const approvedReviews = reviews.filter(review => review.approved);
  if (approvedReviews.length === 0) return 0;
  
  const sum = approvedReviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / approvedReviews.length) * 10) / 10; // Round to 1 decimal place
};

// Function to add a new review to a barber
export const submitBarberReview = async (barberId: string, reviewData: Omit<Review, 'id' | 'createdAt' | 'approved' | 'barberId'>): Promise<Review> => {
  try {
    const reviewSubmission: ReviewSubmission = {
      barberId: barberId.toString(),
      rating: reviewData.rating,
      comment: reviewData.comment,
      clientName: reviewData.clientName,
      clientEmail: reviewData.clientEmail, // Ensure this is optional if Review type allows
    };
    
    const newReview = await createReview(reviewSubmission);
    return newReview;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

// Function to get all reviews for a specific barber
export const getBarberReviews = async (barberId: number | string): Promise<Review[]> => {
  try {
    // Call the review service to get barber reviews
    return await fetchBarberReviews(barberId.toString());
  } catch (error) {
    console.error('Error getting barber reviews:', error);
    throw error;
  }
};

// Function to get all reviews for all barbers
export const getAllReviews = async (): Promise<{barberId: number | string, barberName: string, reviews: Review[]}[]> => {
  try {
    const allReviews = await fetchAllReviewsFromDb(); // Fetch all reviews

    if (!allReviews || allReviews.length === 0) {
      return [];
    }

    // Get all barbers to map names
    const { data: barbersData, error: barbersError } = await supabase
      .from('barbers')
      .select('id, name');

    if (barbersError) {
      console.error('Error fetching barbers for getAllReviews:', barbersError);
      throw barbersError;
    }
    if (!barbersData) {
        console.warn('No barbers found for getAllReviews');
        return [];
    }

    const barbersMap = new Map(barbersData.map(b => [b.id, b.name]));

    // Group reviews by barberId
    const reviewsByBarber: { [key: string]: Review[] } = {};
    allReviews.forEach(review => {
      if (!reviewsByBarber[review.barberId]) {
        reviewsByBarber[review.barberId] = [];
      }
      reviewsByBarber[review.barberId].push(review);
    });

    // Format results
    const result = Object.keys(reviewsByBarber).map(barberId => {
      const barberName = barbersMap.get(barberId) || 'Unknown Barber';
      return {
        barberId: barberId,
        barberName: barberName,
        reviews: reviewsByBarber[barberId],
      };
    });

    return result;
  } catch (error) {
    console.error('Error in getAllReviews:', error);
    throw error;
  }
};

// Function to update a review's approval status
export const updateReviewStatus = async (
  barberId: number | string, // This parameter is currently unused but kept for potential future use
  reviewId: string, 
  approved: boolean
): Promise<Review> => {
  try {
    // Call the actual service function to update the review's approval status
    const updatedReview = await updateReviewApproval(reviewId, approved);
    return updatedReview;
  } catch (error) {
    console.error(`Error in updateReviewStatus for reviewId ${reviewId}:`, error);
    // Re-throw the error to be handled by the calling component (e.g., to show a toast message)
    throw error;
  }
};

// Function to reject (delete) a review
export const rejectAndDeleteReview = async (reviewId: string): Promise<void> => {
  try {
    await deleteReviewById(reviewId);
    // console.log(`Review ${reviewId} successfully deleted.`);
  } catch (error) {
    console.error(`Error in rejectAndDeleteReview for reviewId ${reviewId}:`, error);
    throw error;
  }
};

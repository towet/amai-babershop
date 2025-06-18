import { supabase } from '@/lib/supabaseClient';
import { Review, ReviewSubmission } from '@/lib/types';

// Map database review (snake_case) to Review type (camelCase)
const mapDbReviewToReview = (dbReview: any): Review => {
  return {
    id: dbReview.id,
    barberId: dbReview.barber_id,
    rating: dbReview.rating,
    comment: dbReview.comment,
    clientName: dbReview.client_name,
    clientEmail: dbReview.client_email,
    approved: dbReview.approved,
    createdAt: dbReview.created_at,
  };
};

/**
 * Creates a new review.
 * @param reviewData - The data for the new review.
 * @returns The created review.
 */
export const createReview = async (reviewData: ReviewSubmission): Promise<Review> => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([
      {
        barber_id: reviewData.barberId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        client_name: reviewData.clientName,
        client_email: reviewData.clientEmail,
        approved: false // Explicitly set to false for manager approval
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    throw error; // Re-throw the error to be caught by the calling function
  }
  // console.log('[review-service] Insert successful. Data from insert:', data); // Logging can be more concise or removed if not needed for prod
  return mapDbReviewToReview(data);
};

/**
 * Fetches approved reviews for a specific barber.
 * @param barberId - The ID of the barber.
 * @param limit - The maximum number of reviews to fetch (default is 5).
 * @returns A list of approved reviews.
 */
export const getReviewsByBarber = async (barberId: string, limit: number = 5): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('barber_id', barberId)
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching reviews by barber:', error);
    throw error;
  }
  return data ? data.map(mapDbReviewToReview) : [];
};

/**
 * Fetches all reviews from the database, regardless of approval status.
 * Intended for manager dashboard.
 * @returns A list of all reviews.
 */
export const fetchAllReviewsFromDb = async (): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all reviews:', error);
    throw error;
  }
  return data ? data.map(mapDbReviewToReview) : [];
};

/**
 * Updates the approval status of a specific review.
 * @param reviewId - The ID of the review to update.
 * @param approved - The new approval status (true or false).
 * @returns The updated review object.
 */
export const updateReviewApproval = async (reviewId: string, approved: boolean): Promise<Review> => {
  const { data, error } = await supabase
    .from('reviews')
    .update({ approved })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error updating review approval status:', error);
    throw error;
  }
  if (!data) {
    console.error('No data returned after updating review approval status for reviewId:', reviewId);
    throw new Error('Failed to update review: No data returned.');
  }
  return mapDbReviewToReview(data);
};

/**
 * Deletes a specific review by its ID.
 * @param reviewId - The ID of the review to delete.
 * @returns A promise that resolves if the deletion was successful.
 */
export const deleteReviewById = async (reviewId: string): Promise<void> => {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    console.error('Error deleting review by ID:', reviewId, error);
    throw error;
  }
  // console.log('Review deleted successfully:', reviewId);
};
import { useState } from 'react';
import { Barber, Review } from '@/lib/types';
import { Star } from 'lucide-react';

interface BarberRatingFormProps {
  barber: Barber;
  onSubmit: (barberId: string, review: Review) => void;
  onCancel: () => void;
}

const BarberRatingForm = ({ barber, onSubmit, onCancel }: BarberRatingFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMouseOver = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleClick = (starRating: number) => {
    setRating(starRating);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Please leave a comment';
    }

    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const newReview: Review = {
      id: `review-${Date.now()}-${Math.random().toString(36).substring(7)}`, // Made ID slightly more unique for client-side
      barberId: barber.id,
      rating,
      comment,
      clientName: name,
      clientEmail: email,
      createdAt: new Date().toISOString(),
      approved: false // Defaulted to false, backend might override or use this
    };

    onSubmit(barber.id, newReview);
  };

  const renderStar = (position: number) => {
    const filled = (hoveredRating || rating) >= position;

    return (
      <Star
        key={position}
        size={32}
        className={`cursor-pointer transition-colors ${
          filled ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
        }`}
        onMouseOver={() => handleMouseOver(position)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(position)}
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Rate your experience with {barber.name}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Stars */}
        <div className="flex flex-col items-center space-y-2">
          <label className="text-lg font-semibold">Your Rating</label>
          <div className="flex space-x-2" onMouseLeave={handleMouseLeave}>
            {[1, 2, 3, 4, 5].map((star) => renderStar(star))}
          </div>
          {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
        </div>
        
        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Your Review
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.comment ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-gray-900`}
            placeholder="Share your experience with this barber..."
          />
          {errors.comment && <p className="text-red-500 text-sm mt-1">{errors.comment}</p>}
        </div>
        
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-gray-900`}
            placeholder="John Doe"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Your Email (optional)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-gray-900"
            placeholder="johndoe@example.com"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default BarberRatingForm;

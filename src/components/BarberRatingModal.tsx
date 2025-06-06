import { useState } from 'react';
import { Barber, Review } from '@/lib/types';
import { X } from 'lucide-react';
import BarberRatingForm from './BarberRatingForm';

interface BarberRatingModalProps {
  barber: Barber;
  onClose: () => void;
  onSubmitReview: (barberId: string, review: Review) => void;
}

const BarberRatingModal = ({ barber, onClose, onSubmitReview }: BarberRatingModalProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (barberId: string, review: Review) => {
    onSubmitReview(barberId, review);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {!isSubmitted ? 'Rate Your Experience' : 'Thank You!'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!isSubmitted ? (
            <BarberRatingForm 
              barber={barber} 
              onSubmit={handleSubmit} 
              onCancel={onClose}
            />
          ) : (
            <div className="text-center py-8">
              <div className="mb-4 text-5xl">🎉</div>
              <h3 className="text-2xl font-bold mb-2">Thank you for your feedback!</h3>
              <p className="text-gray-600 mb-6">
                Your review has been submitted and will be visible after approval by our management team.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarberRatingModal;

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star, Scissors, Award, Calendar, Users, ChevronRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingModal } from "./BookingModal";
import BarberRatingModal from "./BarberRatingModal";
import { toast } from '@/components/ui/use-toast';
import { getBarbersForLandingPage } from '@/lib/services/barber-service'; // To fetch real barber data
import { createReview } from "@/lib/services/review-service"; // For submitting reviews
import { Barber, Review, ReviewSubmission } from "@/lib/types"; // Updated to use main Barber type

export const BarbersTeamSection = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedBarberForRating, setSelectedBarberForRating] = useState<Barber | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hoveredBarber, setHoveredBarber] = useState<string | null>(null);

  // Parallax effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, (sectionRef.current?.offsetHeight || 0) - window.innerHeight]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setIsLoading(true);
        const fetchedBarbers = await getBarbersForLandingPage(3); // Fetch 3 reviews per barber
        setBarbers(fetchedBarbers);
        setError(null);
      } catch (err) {
        console.error("Error fetching barbers:", err);
        setError(err instanceof Error ? err.message : 'Failed to load barbers.');
      }
      setIsLoading(false);
    };

    fetchBarbers();
  }, []);

  const handleBooking = (barberName: string) => {
    setSelectedBarber(barberName);
    setIsBookingModalOpen(true);
  };

  const handleRating = (barber: Barber) => {
    setSelectedBarberForRating(barber); // Now barber is the full object from state
    setIsRatingModalOpen(true);
  };

  const handleSubmitReview = async (barberId: string, review: Review) => { // Signature changed
    console.log('[BarbersTeamSection] handleSubmitReview called. Barber ID:', barberId, 'Review object:', review); // Added for debugging

    if (!review) {
      console.error('[BarbersTeamSection] handleSubmitReview called with an undefined review object for barberId:', barberId);
      toast({
        title: "Review Submission Error",
        description: "Failed to submit review: review data was missing. Please try again.",
        variant: "destructive",
      });
      return; // Prevent further execution if review is undefined
    }

    const reviewSubmissionData: ReviewSubmission = {
      barberId: barberId,
      rating: review.rating,
      comment: review.comment,
      clientName: review.clientName,
      clientEmail: review.clientEmail, // Ensure clientEmail is optional if not always provided
    };
    try {
      await createReview(reviewSubmissionData); // Use the constructed object
      toast({
        title: "Review Submitted",
        description: "Thank you! Your review has been submitted."
      });
      // Re-fetch barbers to show updated review/rating immediately
      const updatedBarbers = await getBarbersForLandingPage(3);
      setBarbers(updatedBarbers);
      setIsRatingModalOpen(false); // Close modal on success
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error Submitting Review",
        description: error instanceof Error ? error.message : "There was a problem submitting your review. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Generate star rating display
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-4 h-4 fill-amber-500 text-amber-500" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-400" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
        </div>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-400" />
      );
    }

    return stars;
  };

  return (
    <section
      ref={sectionRef}
      id="barbers-team"
      className="py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[150px] animate-float-slow"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-400/5 rounded-full blur-[130px] animate-float"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          style={{ y, opacity }}
        >
          <h2 className="text-6xl md:text-7xl font-['Bebas_Neue'] leading-none tracking-tight mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">MEET OUR</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 ml-3">MASTER BARBERS</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto mb-6"></div>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Skilled artists dedicated to crafting your perfect look
          </p>
        </motion.div>

        {/* Barbers grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading && <p className="text-center text-white col-span-full">Loading barbers...</p>}
          {error && <p className="text-center text-red-500 col-span-full">Error: {error}</p>}
          {!isLoading && !error && barbers.map((barber, index) => (
            <motion.div
              key={barber.id}
              className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl transform transition-all duration-300 ${hoveredBarber === barber.id ? 'scale-[1.02]' : ''}`}
              onMouseEnter={() => setHoveredBarber(barber.id)}
              onMouseLeave={() => setHoveredBarber(null)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Profile image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={barber.photoUrl || '/barbers/default-barber.png'}
                  alt={barber.name}
                  className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent opacity-60"></div>

                {/* Floating scissors decoration */}
                <motion.div
                  className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full p-0.5 shadow-lg"
                  animate={{ rotate: [0, 15, 0, -15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-full h-full bg-gray-900/70 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-white" />
                  </div>
                </motion.div>

                {/* Rating stars */}
                <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-gray-900/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <div className="flex">
                    {renderStars(barber.rating || 0)}
                  </div>
                  <span className="text-amber-400 text-sm font-semibold tracking-wider uppercase">{barber.specialty || 'General Barbering'}</span>
                </div>
              </div>

              {/* Barber info */}
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-semibold text-white mb-1 group-hover:text-yellow-400 transition-colors duration-300">{barber.name}</h3>
                <p className="text-sm text-yellow-400 mb-2 flex items-center"><Award className="w-4 h-4 mr-1.5" /> {barber.specialty || 'N/A'}</p>

                <div className="flex items-center text-yellow-400 mb-3">
                  {renderStars(barber.rating || 0)}
                  <span className="ml-2 text-sm text-gray-300">({(barber.rating || 0).toFixed(1)} - {barber.reviews?.length || 0} reviews)</span>
                </div>

                <div>
                  {/* Redundant specialty label removed */}
                  <div className="mt-4 flex gap-3">
                    <Button
                      variant={"default"}
                      className="bg-black text-white hover:bg-gray-900 flex items-center gap-2"
                      onClick={() => handleBooking(barber.name)}
                    >
                      <Calendar size={16} />
                      Book Now
                    </Button>

                    <Button
                      variant={"outline"}
                      className="border-amber-500 text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                      onClick={() => handleRating(barber)}
                    >
                      <MessageSquare size={16} />
                      Rate & Review
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-sm mb-1">Experience</div>
                  <div className="flex items-center space-x-2">
                    <Scissors className="w-4 h-4 text-amber-500" />
                    <span className="text-white">{(barber.totalCuts || 0).toLocaleString()} cuts</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}

      {/* Rating Modal */}
      {isRatingModalOpen && selectedBarberForRating && (
        <BarberRatingModal
          barber={selectedBarberForRating!} // selectedBarberForRating is checked before rendering modal
          onClose={() => setIsRatingModalOpen(false)}
          onSubmitReview={(barberIdFromModal, reviewFromForm) => {
            handleSubmitReview(barberIdFromModal, reviewFromForm);
          }}
        />
      )}
    </section>
  );
};

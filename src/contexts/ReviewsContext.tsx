import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

// Review interface
export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Review stats interface
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: {
    [key: number]: number;
  };
}

// Define the context type
interface ReviewsContextType {
  reviews: Review[];
  reviewStats: ReviewStats;
  userReview: {
    rating: number;
    comment: string;
  };
  isSubmittingReview: boolean;
  showReviewForm: boolean;
  setShowReviewForm: (show: boolean) => void;
  fetchProductReviews: (productId: string) => Promise<void>;
  handleRatingChange: (rating: number) => void;
  handleCommentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmitReview: (e: React.FormEvent, productId: string) => Promise<boolean>;
  formatDate: (dateString: string) => string;
  renderStars: (rating: number) => JSX.Element[];
  renderInteractiveStars: () => JSX.Element[];
}

// Create the context
const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

// Create a provider component
export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
  });
  const [userReview, setUserReview] = useState({
    rating: 5,
    comment: ""
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch reviews for a product
  // In the ReviewsProvider component
const fetchProductReviews = useCallback(async (productId: string) => {
    console.log("✅ Gọi API lấy đánh giá cho sản phẩm:", productId);
    try {
      // Make sure productId is properly formatted before sending the request
      if (!productId || productId.trim() === '') {
        console.error("Invalid product ID for fetching reviews");
        return;
      }
      
      const res = await axios.get(`http://localhost:5000/api/reviews/product/${productId}`);
      setReviews(res.data.reviews || []);
      setReviewStats(res.data.stats || {
        averageRating: 0,
        totalReviews: 0,
        ratingCounts: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        }
      });
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
    }
  }, []); // Empty dependency array to ensure stable reference

  // Format date for reviews
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Handle rating change
  const handleRatingChange = (rating: number) => {
    setUserReview(prev => ({
      ...prev,
      rating
    }));
  };

  // Handle comment change
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserReview(prev => ({
      ...prev,
      comment: e.target.value
    }));
  };

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh giá sản phẩm");
      return false;
    }

    if (userReview.comment.trim().length < 10) {
      toast.error("Vui lòng nhập đánh giá ít nhất 10 ký tự");
      return false;
    }

    setIsSubmittingReview(true);

    try {
      const reviewData = {
        productId: productId,
        userId: user._id,           
        userName: user.name || user.email, 
        rating: userReview.rating,
        comment: userReview.comment
      };

      const res = await axios.post("http://localhost:5000/api/reviews", reviewData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      await fetchProductReviews(productId);
      
      // Reset form
      setUserReview({
        rating: 5,
        comment: ""
      });
      
      setShowReviewForm(false);
      toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
      return true;
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      toast.error("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.");
      return false;
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Render stars for rating display
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="text-yellow-400"><FaStar /></span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400"><FaStarHalfAlt /></span>);
      } else {
        stars.push(<span key={i} className="text-yellow-400"><FaRegStar /></span>);
      }
    }
    
    return stars;
  };

  // Render interactive stars for review form
  const renderInteractiveStars = () => {
    return [1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => handleRatingChange(star)}
        className="focus:outline-none"
      >
        {star <= userReview.rating ? (
          <span className="text-yellow-400 text-2xl"><FaStar /></span>
        ) : (
          <span className="text-yellow-400 text-2xl"><FaRegStar /></span>
        )}
      </button>
    ));
  };

  return (
    <ReviewsContext.Provider value={{
      reviews,
      reviewStats,
      userReview,
      isSubmittingReview,
      showReviewForm,
      setShowReviewForm,
      fetchProductReviews,
      handleRatingChange,
      handleCommentChange,
      handleSubmitReview,
      formatDate,
      renderStars,
      renderInteractiveStars
    }}>
      {children}
    </ReviewsContext.Provider>
  );
};

// Create a custom hook to use the reviews context
export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};

import Review from '../models/Review.js';
export const addReview = async (req, res) => {
  const { productId, userId, userName, rating, comment } = req.body;
  if (!productId || !userId || !userName || !rating || !comment) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const review = new Review({ productId, userId, userName, rating, comment });
  await review.save();
  res.status(201).json(review);
};
export const getReviews = async (req, res) => {
  const { productId } = req.params;
  const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

  // Tính toán stats
  const total = reviews.length;
  const average = total ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total) : 0;
  const ratingCounts = [1,2,3,4,5].reduce((acc, star) => {
    acc[star] = reviews.filter(r => r.rating === star).length;
    return acc;
  }, {});

  res.json({
    reviews,
    stats: {
      averageRating: average,
      totalReviews: total,
      ratingCounts
    }
  });
};
export const getReviewSummary = async (req, res) => {
  const { productId } = req.params;
  const reviews = await Review.find({ productId });
  const total = reviews.length;
  const average = total ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total) : 0;
  const breakdown = [1,2,3,4,5].reduce((acc, star) => {
    acc[star] = reviews.filter(r => r.rating === star).length;
    return acc;
  }, {});
  res.json({ average, total, breakdown });
};
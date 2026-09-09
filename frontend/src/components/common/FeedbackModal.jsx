import React, { useState } from 'react';
import { Star, X, MessageSquare, Send, CheckCircle } from 'lucide-react';
import feedbackService from '../../services/feedbackService';

export const FeedbackModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('General Feedback');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const categories = [
    'General Feedback',
    'Music Recommendations',
    'AI Music Generator',
    'Emotion Detection',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      setError('Please select a star rating.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const fullComment = `[Category: ${category}] ${comment.trim()}`;
      await feedbackService.submitFeedback(null, null, rating, fullComment);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setComment('');
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#13111C] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-harmony-muted hover:text-white rounded-lg hover:bg-white/5 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold text-white">Thank You!</h3>
            <p className="text-sm text-harmony-muted">
              Your feedback has been received and helps us improve GenHarmony.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white shadow-md">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Send Feedback</h3>
                <p className="text-xs text-harmony-muted">We'd love to hear your thoughts</p>
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-harmony-muted mb-2">
                Feedback Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left truncate ${
                      category === cat
                        ? 'bg-harmony-primary text-white border border-purple-500/30'
                        : 'bg-white/5 text-harmony-muted hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold text-harmony-muted mb-2">
                Your Rating
              </label>
              <div className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-125"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-white/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comments Input */}
            <div>
              <label className="block text-xs font-semibold text-harmony-muted mb-2">
                Your Feedback & Suggestions
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share what you like or what we can improve..."
                rows={4}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder-harmony-muted/50 focus:outline-none focus:border-harmony-primary/50 transition-all resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 font-semibold bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-harmony-muted hover:bg-white/5 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-harmony-primary hover:bg-violet-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;

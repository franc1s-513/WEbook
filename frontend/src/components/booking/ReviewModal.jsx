import React, { useState } from 'react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Star, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const ReviewModal = ({ bookingId, onClose, onSuccess }) => {
  const { showToast } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reviews', {
        bookingId,
        rating,
        comment
      });
      showToast('Thank you! Your review has been published.', 'success');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!bookingId) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem' }}>Rate Your Experience</h3>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.6rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Star Rating Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>How satisfied are you with this service?</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ background: 'transparent', padding: '4px', cursor: 'pointer' }}
                >
                  <Star
                    size={32}
                    fill={(hoverRating || rating) >= star ? '#f59e0b' : 'transparent'}
                    color={(hoverRating || rating) >= star ? '#f59e0b' : 'var(--text-muted)'}
                    style={{ transition: 'transform 0.15s ease' }}
                  />
                </button>
              ))}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b' }}>
              {rating === 5 ? 'Excellent (5/5)' :
               rating === 4 ? 'Very Good (4/5)' :
               rating === 3 ? 'Average (3/5)' :
               rating === 2 ? 'Below Expectations (2/5)' : 'Poor (1/5)'}
            </span>
          </div>

          {/* Feedback text */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Detailed Feedback (Optional)
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the vehicle handling, cleanliness, promptness, or mechanic advice..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;

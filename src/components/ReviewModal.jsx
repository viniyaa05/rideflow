import React, { useState } from 'react';
import { 
  X, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  Car, 
  KeyRound, 
  Users 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReviewModal({ targetItem, onClose, onReviewSubmitted }) {
  const { addReview } = useAuth();
  
  const [targetType, setTargetType] = useState(targetItem?.targetType || 'driver');
  const [targetName, setTargetName] = useState(targetItem?.targetName || 'Karthik Subramanian');
  const [targetModel, setTargetModel] = useState(targetItem?.targetModel || 'Toyota Innova Crysta');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(['Smooth Driving', 'Chilled AC']);
  const [comment, setComment] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const availableTags = [
    'Smooth Driving',
    'Chilled AC',
    'Punctual Captain',
    'Clean Vehicle',
    'Safe Speed',
    'Courteous & Polite',
    'Keyless Unlock Worked Great',
    'Great Highway Conversation'
  ];

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newRev = addReview({
      targetType,
      targetName,
      targetModel,
      rating,
      tags: selectedTags,
      comment
    });

    setIsSuccess(true);
    if (onReviewSubmitted) {
      onReviewSubmitted(newRev);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative">
        
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Rate & Review Your Experience</h3>
                  <p className="text-xs text-slate-500 font-medium">Help keep Tamil Nadu mobility safe & high quality</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">What are you reviewing?</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'driver', label: 'Private Driver', icon: Car },
                  { id: 'rental', label: 'Self-Drive Car', icon: KeyRound },
                  { id: 'carpool', label: 'Carpool Host', icon: Users },
                ].map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setTargetType(type.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                        targetType === type.id
                          ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-200'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Name & Vehicle input */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Driver / Partner Name</label>
                <input
                  type="text"
                  required
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-400 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Vehicle Model / Plate</label>
                <input
                  type="text"
                  value={targetModel}
                  onChange={(e) => setTargetModel(e.target.value)}
                  placeholder="e.g. Innova Crysta (TN-01)"
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-400 shadow-xs"
                />
              </div>
            </div>

            {/* Interactive Star Rating */}
            <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <label className="block text-xs font-extrabold text-slate-700">Overall Rating</label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300 fill-slate-100'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-700 block">
                {rating === 5 && 'Outstanding Experience! ⭐⭐⭐⭐⭐'}
                {rating === 4 && 'Very Good Ride ⭐⭐⭐⭐'}
                {rating === 3 && 'Average Experience ⭐⭐⭐'}
                {rating <= 2 && 'Needs Improvement ⭐⭐'}
              </span>
            </div>

            {/* Compliment Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Highlight Key Positives:</label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Review */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Feedback</label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share how the trip went, cleanliness, driving safety, and punctual arrival..."
                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-400 shadow-xs"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Submit Verified Review</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Confirmation View */
          <div className="text-center py-6 space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase text-emerald-700 tracking-wider">
                Review Published!
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">Thank You for Your Feedback</h3>
              <p className="text-xs text-slate-500">
                Your rating has been added to {targetName}'s verified public profile.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm transition-all"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

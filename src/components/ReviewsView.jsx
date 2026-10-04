import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Car, 
  KeyRound, 
  Users, 
  MessageSquare, 
  PlusCircle, 
  ShieldCheck, 
  Sparkles, 
  ThumbsUp, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReviewModal from './ReviewModal';

export default function ReviewsView() {
  const { reviews } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  const filteredReviews = useMemo(() => {
    if (selectedFilter === 'all') return reviews;
    return reviews.filter((r) => r.targetType === selectedFilter);
  }, [reviews, selectedFilter]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return '5.0';
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    return (sum / reviews.length).toFixed(2);
  }, [reviews]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white/95 space-y-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              Verified Community Feedback
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ratings & Reviews
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium">
              Read authentic feedback from commuters across Tamil Nadu for private drivers, self-drive rental cars, and shared carpools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shadow-xs">
              <div className="text-center">
                <span className="text-2xl font-black text-slate-900 departure-digit">{averageRating}</span>
                <div className="flex items-center justify-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="text-xs font-bold text-slate-900 block">{reviews.length} Verified Reviews</span>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  100% Ride Confirmed
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Reviews', count: reviews.length },
            { id: 'driver', label: 'Private Drivers', count: reviews.filter((r) => r.targetType === 'driver').length },
            { id: 'rental', label: 'Self-Drive Rentals', count: reviews.filter((r) => r.targetType === 'rental').length },
            { id: 'carpool', label: 'Carpool Hosts', count: reviews.filter((r) => r.targetType === 'carpool').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Review Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((rev) => {
          const isDriver = rev.targetType === 'driver';
          const isRental = rev.targetType === 'rental';
          return (
            <div
              key={rev.id}
              className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header: Reviewer & Stars */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={rev.userName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.userName}</h4>
                      <p className="text-[10px] text-slate-400">{rev.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-xs font-extrabold text-amber-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{rev.rating}</span>
                  </div>
                </div>

                {/* Target Badge */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-3 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                    {isDriver && <Car className="w-3.5 h-3.5 text-blue-600" />}
                    {isRental && <KeyRound className="w-3.5 h-3.5 text-amber-600" />}
                    {!isDriver && !isRental && <Users className="w-3.5 h-3.5 text-teal-600" />}
                    <span>{rev.targetName}</span>
                  </div>
                  {rev.targetModel && (
                    <p className="text-[10px] text-slate-500 font-medium pl-5">{rev.targetModel}</p>
                  )}
                </div>

                {/* Feedback Comment */}
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  "{rev.comment}"
                </p>
              </div>

              {/* Tags Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1">
                {rev.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal Dialog */}
      {isWriteModalOpen && (
        <ReviewModal
          onClose={() => setIsWriteModalOpen(false)}
        />
      )}

    </div>
  );
}

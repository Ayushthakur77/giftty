import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { 
  Loader2, Search, Star, MessageSquare, Trash2, ShieldAlert,
  CheckCircle, XCircle, Flag, StarHalf, Reply
} from "lucide-react";

export default function AdminReviews() {
  const { token } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, APPROVED, REJECTED, REPORTED
  
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReviews();
  }, [token]);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        if (selectedReview && selectedReview.review.id === id) {
          setSelectedReview({ ...selectedReview, review: { ...selectedReview.review, status: newStatus } });
        }
        fetchReviews();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFeatureToggle = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}/feature`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isFeatured: !currentStatus })
      });
      if (res.ok) {
        if (selectedReview && selectedReview.review.id === id) {
          setSelectedReview({ ...selectedReview, review: { ...selectedReview.review, isFeatured: !currentStatus } });
        }
        fetchReviews();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review permanently?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        if (selectedReview && selectedReview.review.id === id) setSelectedReview(null);
        fetchReviews();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText) return;
    try {
      const res = await fetch(`/api/admin/reviews/${selectedReview.review.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ adminReply: replyText })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedReview({ ...selectedReview, review: { ...selectedReview.review, adminReply: updated.adminReply } });
        fetchReviews();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const rvw = r.review;
    const usr = r.user;
    const prd = r.product;
    
    const matchesSearch = 
      (usr?.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (prd?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rvw.comment && rvw.comment.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesStatus = 
      statusFilter === "ALL" || 
      (statusFilter === "REPORTED" ? rvw.isReported : rvw.status === statusFilter);
      
    return matchesSearch && matchesStatus;
  });

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-warning text-warning' : 'fill-surface text-outline'}`} />
    ));
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Reviews</h1>
          <p className="text-sm text-on-surface-variant">Moderate customer reviews and respond to feedback.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'REPORTED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border ${
                statusFilter === st 
                  ? 'bg-primary text-on-primary border-primary' 
                  : 'bg-surface text-on-surface-variant border-outline hover:bg-surface-container'
              } ${st === 'REPORTED' && statusFilter !== 'REPORTED' ? 'text-error border-error/50' : ''}`}
            >
              {st === 'REPORTED' && <Flag className="w-3 h-3 inline-block mr-1" />}
              {st}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-outline rounded-lg bg-surface text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-outline-variant rounded-2xl bg-surface text-on-surface-variant">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-bold">No reviews found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col max-h-[800px]">
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {filteredReviews.map(r => (
                <div 
                  key={r.review.id} 
                  onClick={() => {
                    setSelectedReview(r);
                    setReplyText(r.review.adminReply || "");
                  }}
                  className={`p-4 border rounded-xl cursor-pointer transition-colors ${
                    selectedReview?.review.id === r.review.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 bg-surface-container rounded-full flex items-center justify-center font-bold text-xs">
                        {r.user?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{r.user?.name || 'Anonymous'}</p>
                        <p className="text-xs text-on-surface-variant">{new Date(r.review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-0.5">{renderStars(r.review.rating)}</div>
                      {r.review.status === 'PENDING' && <span className="bg-warning/10 text-warning px-2 py-0.5 rounded text-[10px] font-bold uppercase">Pending</span>}
                      {r.review.status === 'APPROVED' && <span className="bg-success/10 text-success px-2 py-0.5 rounded text-[10px] font-bold uppercase">Approved</span>}
                      {r.review.status === 'REJECTED' && <span className="bg-error/10 text-error px-2 py-0.5 rounded text-[10px] font-bold uppercase">Rejected</span>}
                    </div>
                  </div>
                  
                  <p className="text-xs font-bold text-primary mb-1 line-clamp-1">{r.product?.name}</p>
                  
                  <p className="text-sm text-on-surface mb-3 line-clamp-2">{r.review.comment}</p>
                  
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex gap-3">
                      {r.review.isFeatured && (
                        <span className="text-secondary font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-secondary" /> Featured</span>
                      )}
                      {r.review.isReported && (
                        <span className="text-error font-bold flex items-center gap-1"><Flag className="w-3 h-3" /> Reported ({r.review.reportCount})</span>
                      )}
                      {r.review.adminReply && (
                        <span className="text-info font-bold flex items-center gap-1"><Reply className="w-3 h-3" /> Replied</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {selectedReview ? (
              <div className="bg-surface p-6 rounded-2xl border border-outline-variant sticky top-6">
                <div className="flex justify-between items-start mb-4 border-b border-outline-variant pb-4">
                  <div>
                    <h2 className="text-lg font-bold">Review Details</h2>
                    <p className="text-xs text-on-surface-variant mt-1">ID: {selectedReview.review.id}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(selectedReview.review.id)}
                    className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Product</p>
                    <p className="text-sm font-bold text-primary">{selectedReview.product?.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Customer</p>
                    <p className="text-sm font-semibold">{selectedReview.user?.name}</p>
                    <p className="text-xs text-on-surface-variant">{selectedReview.user?.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Rating & Comment</p>
                    <div className="flex gap-1 mb-2">{renderStars(selectedReview.review.rating)}</div>
                    <p className="text-sm p-3 bg-surface-container-low rounded-lg italic">
                      "{selectedReview.review.comment}"
                    </p>
                  </div>
                  
                  {selectedReview.review.isReported && (
                    <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm flex items-start gap-2">
                      <Flag className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold">This review was reported</p>
                        <p className="text-xs mt-1">Reported {selectedReview.review.reportCount} times.</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-outline-variant">
                    <p className="text-xs font-bold text-on-surface-variant uppercase mb-3">Moderation Actions</p>
                    <div className="flex gap-2 mb-4">
                      <button 
                        onClick={() => handleStatusUpdate(selectedReview.review.id, 'APPROVED')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                          selectedReview.review.status === 'APPROVED' 
                            ? 'bg-success text-on-success border-success' 
                            : 'bg-surface text-on-surface border-outline hover:bg-success/10 hover:border-success'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 mx-auto mb-1" /> Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(selectedReview.review.id, 'REJECTED')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                          selectedReview.review.status === 'REJECTED' 
                            ? 'bg-error text-on-error border-error' 
                            : 'bg-surface text-on-surface border-outline hover:bg-error/10 hover:border-error'
                        }`}
                      >
                        <XCircle className="w-4 h-4 mx-auto mb-1" /> Reject
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleFeatureToggle(selectedReview.review.id, selectedReview.review.isFeatured)}
                      className={`w-full py-2 text-sm font-bold rounded-lg border flex items-center justify-center gap-2 ${
                        selectedReview.review.isFeatured 
                          ? 'bg-secondary text-on-secondary border-secondary' 
                          : 'bg-surface text-on-surface border-outline hover:bg-surface-container'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${selectedReview.review.isFeatured ? 'fill-on-secondary' : ''}`} /> 
                      {selectedReview.review.isFeatured ? 'Featured Review' : 'Feature this Review'}
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-outline-variant">
                    <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Admin Reply</p>
                    <textarea 
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Write a public reply to the customer..."
                      className="w-full h-24 p-3 border border-outline rounded-lg text-sm bg-surface resize-none focus:outline-none focus:border-primary mb-2"
                    />
                    <button 
                      onClick={handleReply}
                      disabled={!replyText || replyText === selectedReview.review.adminReply}
                      className="w-full py-2 bg-primary text-on-primary font-bold text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {selectedReview.review.adminReply ? 'Update Reply' : 'Post Reply'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface p-6 rounded-2xl border border-outline-variant h-full flex flex-col items-center justify-center text-center text-on-surface-variant">
                <MessageSquare className="w-12 h-12 opacity-20 mb-4" />
                <p className="font-bold">Select a review to moderate</p>
                <p className="text-xs mt-1">Approve, reject, or reply to customer feedback.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

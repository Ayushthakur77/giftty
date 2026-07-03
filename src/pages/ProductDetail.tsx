import { useParams, Link } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { Heart, ShoppingBag, ArrowLeft, Star, Flag, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function ProductDetail() {
  const { id } = useParams();
  const products = useProductStore((state) => state.products);
  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
  const { token, user } = useAuthStore();
  
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const product = products.find(p => p.id === id);

  useEffect(() => {
    if (product) {
      // Note: we fetch reviews filtering by APPROVED
      fetch(`/api/products/${product.id}/reviews`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
             setReviews(data);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingReviews(false));
    }
  }, [product]);

  const handleReport = async (reviewId: number) => {
    if (!token) return alert("Please log in to report a review.");
    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Review reported successfully.");
        // Hide or mark as reported in UI if desired, or just leave it
      }
    } catch (err: any) {
      alert("Failed to report review.");
    }
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-on-surface-variant font-medium">Product not found.</p>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-10 py-8">
      <Link to="/shop" className="inline-flex items-center text-sm font-bold text-on-surface-variant hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="rounded-3xl overflow-hidden bg-surface-container aspect-square relative border border-outline-variant">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex flex-col justify-center space-y-6">
          {product.badge && (
            <div>
               <span className={`inline-block px-3 py-1 text-[10px] font-black rounded uppercase tracking-tighter ${product.badgeColor || 'bg-primary text-white'}`}>
                  {product.badge}
               </span>
            </div>
          )}
          
          <h1 className="text-4xl font-bold tracking-tight text-on-surface">{product.name}</h1>
          <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
          <p className="text-base text-on-surface-variant leading-relaxed">
            {product.description}
          </p>

          <div className="pt-6 border-t border-outline-variant space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-on-surface">Quantity:</span>
              <div className="flex items-center border border-outline rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-surface-container-low transition-colors">-</button>
                <span className="px-4 py-2 font-bold text-sm w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-surface-container-low transition-colors">+</button>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => addItem(product, quantity)}
                className="flex-1 bg-primary text-on-primary font-bold py-4 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </button>
              <button 
                onClick={() => inWishlist ? removeWishlist(product.id) : addWishlist(product)}
                className={`p-4 rounded-xl border transition-all active:scale-[0.98] flex items-center justify-center ${inWishlist ? 'bg-primary-container border-primary-container text-primary' : 'bg-surface border-outline text-on-surface-variant hover:border-primary/50 hover:text-primary'}`}
              >
                <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-16 border-t border-outline-variant">
        <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
        
        {loadingReviews ? (
          <p className="text-on-surface-variant">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-outline-variant rounded-2xl bg-surface text-on-surface-variant">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((r, i) => (
              <div key={i} className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold">{r.user?.name || 'Anonymous'}</p>
                    <p className="text-xs text-on-surface-variant">{new Date(r.review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array(5).fill(0).map((_, j) => (
                      <Star key={j} className={`w-4 h-4 ${j < r.review.rating ? 'fill-warning text-warning' : 'fill-surface text-outline'}`} />
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-on-surface mb-4">{r.review.comment}</p>
                
                {r.review.adminReply && (
                  <div className="mt-4 bg-surface-container-low p-4 rounded-lg border border-outline-variant">
                    <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">GiftJoy Team</p>
                    <p className="text-sm">{r.review.adminReply}</p>
                  </div>
                )}
                
                <button 
                  onClick={() => handleReport(r.review.id)}
                  className="absolute bottom-4 right-4 text-xs font-bold text-on-surface-variant flex items-center gap-1 hover:text-error transition-colors"
                  title="Report Abuse"
                >
                  <Flag className="w-3 h-3" /> Report
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

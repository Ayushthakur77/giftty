import { useParams, Link } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams();
  const products = useProductStore((state) => state.products);
  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === id);

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
    </div>
  );
}

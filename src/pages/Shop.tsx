import { Link } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { Heart } from "lucide-react";

export default function Shop() {
  const products = useProductStore((state) => state.products);
  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();

  return (
    <div className="w-full max-w-[1280px] mx-auto px-10 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-on-surface">Storefront</h1>
          <p className="text-sm text-on-surface-variant">All our curated gifts in one place.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="group bg-surface rounded-2xl p-4 border border-outline-variant hover:border-primary/30 hover:shadow-xl transition-all flex flex-col">
            <Link to={`/product/${product.id}`} className="block relative mb-4 overflow-hidden rounded-xl aspect-square bg-surface-container">
              <img 
                src={product.image} 
                alt={product.name}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
              />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  isInWishlist(product.id) ? removeWishlist(product.id) : addWishlist(product);
                }}
                className={`absolute top-3 right-3 p-2 backdrop-blur-sm rounded-full transition-colors z-10 cursor-pointer ${isInWishlist(product.id) ? 'bg-primary text-white' : 'bg-white/80 text-on-surface-variant hover:text-primary'}`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
              {product.badge && (
                <div className={`absolute bottom-3 left-3 px-2 py-1 text-[9px] font-black rounded uppercase tracking-tighter ${product.badgeColor || 'bg-primary text-white'}`}>
                  {product.badge}
                </div>
              )}
            </Link>
            <div className="space-y-1 px-1 flex-1 flex flex-col">
              <Link to={`/product/${product.id}`}>
                <h4 className="font-bold text-sm mb-1 hover:text-primary transition-colors">{product.name}</h4>
              </Link>
              <p className="text-xs text-on-surface-variant mb-3 line-clamp-1">{product.description}</p>
              <div className="flex justify-between items-center mt-auto pt-2">
                <span className="font-bold text-lg text-primary shrink-0">${product.price.toFixed(2)}</span>
                <button onClick={() => addItem(product)} className="bg-secondary text-on-secondary text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

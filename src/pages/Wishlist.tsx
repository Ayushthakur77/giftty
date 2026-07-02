import { Link } from "react-router-dom";
import { useWishlistStore } from "../store/useWishlistStore";
import { useCartStore } from "../store/useCartStore";
import { Heart, ShoppingBag } from "lucide-react";

export default function Wishlist() {
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-10 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-on-surface">Your Wishlist</h1>
      <p className="text-sm text-on-surface-variant mb-8">Save your favorites for later.</p>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-surface-container rounded-3xl border border-outline-variant">
          <Heart className="w-12 h-12 text-outline-variant mx-auto mb-4" />
          <p className="text-lg text-on-surface-variant font-medium mb-6">Nothing here yet.</p>
          <Link to="/shop" className="inline-flex bg-primary text-on-primary px-8 py-3 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
            Explore Gifts
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((product) => (
            <div key={product.id} className="group bg-surface rounded-2xl p-4 border border-outline-variant hover:border-primary/30 hover:shadow-xl transition-all flex flex-col">
              <div className="relative mb-4 overflow-hidden rounded-xl aspect-square bg-surface-container">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                />
                <button 
                  onClick={() => removeItem(product.id)}
                  className="absolute top-3 right-3 p-2 backdrop-blur-sm rounded-full transition-colors z-10 cursor-pointer bg-primary text-white hover:bg-error"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
              <div className="space-y-1 px-1 flex-1 flex flex-col">
                <Link to={`/product/${product.id}`}>
                  <h4 className="font-bold text-sm mb-1 hover:text-primary transition-colors">{product.name}</h4>
                </Link>
                <div className="flex justify-between items-center mt-auto pt-2">
                  <span className="font-bold text-lg text-primary shrink-0">${product.price.toFixed(2)}</span>
                  <button 
                    onClick={() => {
                      addItem(product);
                      removeItem(product.id);
                    }} 
                    className="bg-secondary text-on-secondary p-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer z-10"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

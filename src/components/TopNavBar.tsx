import { Link } from "react-router-dom";
import { Search, Heart, ShoppingCart, User as UserIcon } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useAuthStore } from "../store/useAuthStore";

export function TopNavBar() {
  const totalCartItems = useCartStore((state) => state.totalItems());
  const totalWishlistItems = useWishlistStore((state) => state.items.length);
  const { user, isAuthenticated } = useAuthStore();

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface border-b border-outline h-20 transition-all duration-300">
      <div className="flex justify-between items-center w-full px-10 max-w-[1280px] mx-auto h-full">
        {/* Brand Identity */}
        <Link to="/" className="text-2xl font-bold tracking-tight text-primary shrink-0">
          GiftJoy
        </Link>
        
        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search for the perfect gift..." 
              className="w-full h-11 pl-12 pr-4 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/wishlist" className="p-2 text-on-surface-variant hover:text-primary transition-colors duration-200 relative group">
              <Heart className="w-6 h-6" />
              {totalWishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-surface">
                  {totalWishlistItems}
                </span>
              )}
            </Link>
            <Link to="/cart" className="p-2 text-on-surface-variant hover:text-primary transition-colors duration-200 relative">
              <ShoppingCart className="w-6 h-6" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-surface">
                  {totalCartItems}
                </span>
              )}
            </Link>
          </div>
          {isAuthenticated ? (
            <Link to="/account" className="flex items-center gap-2 p-2 text-on-surface-variant hover:text-primary transition-colors">
              <UserIcon className="w-5 h-5" />
              <span className="text-sm font-semibold hidden md:inline-block">Account</span>
            </Link>
          ) : (
            <Link to="/login" className="hidden md:block bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

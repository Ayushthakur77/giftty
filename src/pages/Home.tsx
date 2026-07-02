import { Link } from "react-router-dom";
import { ArrowRight, Cake, Heart, Package, Banknote, Home as HomeIcon, ShoppingBag } from "lucide-react";
import { useProductStore } from "../store/useProductStore";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";

const CATEGORIES = [
  { name: "All Gifts", icon: null, active: true },
  { name: "Birthday", icon: Cake, active: false },
  { name: "Anniversary", icon: Heart, active: false },
  { name: "Custom Boxes", icon: Package, active: false },
  { name: "Under $49", icon: Banknote, active: false },
  { name: "Housewarming", icon: HomeIcon, active: false },
];

export default function Home() {
  const products = useProductStore((state) => state.products);
  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();

  const TRENDING_GIFTS = products.slice(0, 4);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] md:h-[800px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBHtzcJU-iqHsTmj3cnQl8Mt0qypZAx1xTKKgTVPaRI4as9SvOC-i3OGnfk8RFjMO-Ru21eNwWGWk6KeyWZR6zM66P29YD01KoX9AIgD0YwiyjrXOuj9YBg8UHOTJb2L3GErBAd2mskCsH2q-d0J67x_p4BDl7annG_aChlpljBkE4muf5ElR6nhEGkzHQZ2---YPq39Wo7zts4LtrW40UnCZxShpcqr4n7YIUZGaPHGW9TQvg94HTRTw')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent md:from-background/60"></div>
        </div>
        
        <div className="relative z-10 h-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop flex flex-col justify-center items-start">
          <span className="text-xs font-bold text-primary mb-6 uppercase tracking-widest">
            Thoughtful Gifting
          </span>
          <h1 className="text-4xl md:text-[64px] md:leading-[72px] font-bold tracking-tight text-on-surface max-w-2xl mb-4">
            Unwrap the <br/><span className="text-primary italic font-serif">Perfect Moment</span>
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-md mb-8">
            Hand-picked collections designed to celebrate the people you love. Joy, delivered to their doorstep.
          </p>
          <Link 
            to="/shop" 
            className="bg-secondary text-on-secondary text-sm font-bold px-8 py-3 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Category Chips */}
      <section className="py-lg max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop overflow-hidden">
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <button 
                key={i} 
                className={`flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border ${
                  cat.active 
                    ? "bg-primary text-on-primary border-primary" 
                    : "bg-surface border-outline-variant text-on-surface-variant hover:border-primary/30 hover:text-primary"
                }`}
              >
                {Icon && <Icon className="w-[18px] h-[18px]" />}
                {cat.name}
              </button>
            )
          })}
        </div>
      </section>

      {/* Trending Gifts Grid */}
      <section className="py-xl max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-on-surface">Trending Gifts</h2>
            <p className="text-sm text-on-surface-variant">Our community's favorite ways to say "I care".</p>
          </div>
          <Link to="/shop" className="text-primary text-xs font-bold hover:underline underline-offset-8 flex items-center gap-2">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TRENDING_GIFTS.map((product) => (
            <div key={product.id} className="group bg-surface rounded-2xl p-4 border border-outline-variant hover:border-primary/30 hover:shadow-xl transition-all flex flex-col">
              <div className="relative mb-4 overflow-hidden rounded-xl aspect-square bg-surface-container">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                />
                <button 
                  onClick={() => isInWishlist(product.id) ? removeWishlist(product.id) : addWishlist(product)}
                  className={`absolute top-3 right-3 p-2 backdrop-blur-sm rounded-full transition-colors z-10 cursor-pointer ${isInWishlist(product.id) ? 'bg-primary text-white' : 'bg-white/80 text-on-surface-variant hover:text-primary'}`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
                {product.badge && (
                  <div className={`absolute bottom-3 left-3 px-2 py-1 text-[9px] font-black rounded uppercase tracking-tighter ${product.badgeColor || 'bg-primary text-white'}`}>
                    {product.badge}
                  </div>
                )}
              </div>
              <div className="space-y-1 px-1 flex-1 flex flex-col">
                <h4 className="font-bold text-sm mb-1">{product.name}</h4>
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
      </section>

      {/* Promotional Banner */}
      <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop pb-xl">
        <div className="mt-auto bg-secondary rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between text-on-secondary relative overflow-hidden gap-8">
          <div className="absolute top-0 right-0 w-64 h-full bg-primary -skew-x-12 translate-x-20 opacity-20 hidden md:block"></div>
          <div className="flex-1 space-y-2 z-10">
            <h2 className="text-xl font-bold mb-1">Build Your Own Joy Box</h2>
            <p className="text-on-secondary/70 text-sm">
              Mix and match any 5 items and get a premium custom box with a handwritten note for free.
            </p>
          </div>
          <Link 
            to="/builder"
            className="bg-surface text-secondary font-bold px-8 py-3 rounded-xl text-sm z-10 shrink-0 hover:shadow-lg transition-all"
          >
            Start Crafting
          </Link>
        </div>
      </section>
    </div>
  );
}

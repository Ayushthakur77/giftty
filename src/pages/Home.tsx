import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Cake, Heart, Package, Banknote, Home as HomeIcon, ShoppingBag, Sparkles } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useEffect, useState } from "react";
import AIGiftAssistant from "../components/AIGiftAssistant";
import { motion } from "framer-motion";

export default function Home() {
  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();

  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [occasion, setOccasion] = useState<string>("Gifts");
  const [categories, setCategories] = useState<any[]>([]);
  
  const [banners, setBanners] = useState<any[]>([]);
  const [sectionsOrder, setSectionsOrder] = useState<string[]>(['Hero', 'Trending', 'Categories', 'Festival Highlights', 'Testimonials']);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/products/trending")
      .then(res => res.json())
      .then(data => {
        setTrendingProducts(data.products || []);
        setOccasion(data.occasion || "Gifts");
      })
      .catch(console.error);

    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        const catArray = Array.isArray(data) ? data : [];
        setCategories(catArray.filter((c: any) => c.isEnabled).sort((a: any, b: any) => a.sortOrder - b.sortOrder));
      })
      .catch(console.error);
      
    fetch("/api/banners")
      .then(res => res.json())
      .then(data => {
        setBanners(Array.isArray(data) ? data : []);
      })
      .catch(console.error);
      
    fetch("/api/settings/homepage-sections")
      .then(res => res.json())
      .then(data => {
        if(data && Array.isArray(data)) setSectionsOrder(data);
      })
      .catch(console.error);
  }, []);

  const renderSection = (section: string) => {
    if (section === 'Hero') {
      const heroBanners = banners.filter((b: any) => b.type === 'HERO' || b.type === 'HOMEPAGE');
      const heroBanner = heroBanners.length > 0 ? heroBanners[0] : { 
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHtzcJU-iqHsTmj3cnQl8Mt0qypZAx1xTKKgTVPaRI4as9SvOC-i3OGnfk8RFjMO-Ru21eNwWGWk6KeyWZR6zM66P29YD01KoX9AIgD0YwiyjrXOuj9YBg8UHOTJb2L3GErBAd2mskCsH2q-d0J67x_p4BDl7annG_aChlpljBkE4muf5ElR6nhEGkzHQZ2---YPq39Wo7zts4LtrW40UnCZxShpcqr4n7YIUZGaPHGW9TQvg94HTRTw",
        title: "Thoughtful Gifts for Every Occasion",
        subtitle: "Discover curated gift boxes designed to bring joy and create lasting memories."
      };
      return (
        <section key="hero" className="relative w-full h-[600px] md:h-[800px] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ backgroundImage: `url('${heroBanner.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent md:from-background/60"></div>
          </div>
          <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
            <div className="max-w-xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 tracking-wide backdrop-blur-sm border border-primary/20">
                <Sparkles className="inline-block w-4 h-4 mr-2" />
                Premium Gifting Experience
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                {heroBanner.title || "Thoughtful Gifts for Every Occasion"}
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 mb-10 leading-relaxed max-w-lg">
                {heroBanner.subtitle || "Discover curated gift boxes designed to bring joy and create lasting memories."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={heroBanner.link || "/shop"} className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-lg text-center hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-1">
                  Shop Now
                </Link>
                <Link to="/builder" className="px-8 py-4 bg-surface text-foreground border border-outline rounded-full font-medium text-lg text-center hover:bg-surface-dim transition-all hover:-translate-y-1">
                  Build Your Own Box
                </Link>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (section === 'Trending') {
      if (!trendingProducts.length) return null;
      return (
        <section key="trending" className="w-full py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Trending for {occasion}</h2>
                <p className="text-foreground/70 text-lg">Our most popular gifts selected for the current season.</p>
              </div>
              <Link to="/shop" className="group flex items-center text-primary font-medium hover:text-primary/80 transition-colors">
                View all gifts <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingProducts.map((product) => (
                <div key={product.id} className="group flex flex-col bg-background rounded-2xl border border-outline overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-surface-dim">
                    <img src={product.images?.[0] || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {product.tags?.[0] && (
                      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur text-foreground px-3 py-1 rounded-full text-xs font-medium border border-outline/50">
                        {product.tags[0]}
                      </div>
                    )}
                  </Link>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-lg text-foreground hover:text-primary transition-colors">{product.name}</h3>
                      </Link>
                      <button onClick={(e) => { e.preventDefault(); isInWishlist(product.id) ? removeWishlist(product.id) : addWishlist(product); }} className={`p-2 rounded-full transition-colors ${isInWishlist(product.id) ? 'text-red-500 bg-red-50' : 'text-foreground/40 hover:text-red-500 hover:bg-surface-dim'}`}>
                        <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <p className="text-foreground/60 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-bold text-foreground">₹{product.price}</span>
                      <button onClick={() => { addItem(product, 1); navigate('/cart'); }} className="p-3 bg-surface border border-outline rounded-full text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-95">
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (section === 'Categories') {
      const festivalBanners = banners.filter((b: any) => b.type === 'FESTIVAL' || b.type === 'CATEGORY');
      return (
        <section key="categories" className="w-full py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">Shop by Category</h2>
            
            {/* Inject festival banner if available */}
            {festivalBanners.map(fb => (
              <div key={fb.id} className="mb-12 rounded-2xl overflow-hidden relative border border-outline shadow-sm group">
                <Link to={fb.link || "/shop"}>
                  <img src={fb.image} alt={fb.title || 'Banner'} className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 text-center">
                    <div>
                      {fb.title && <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{fb.title}</h3>}
                      {fb.subtitle && <p className="text-white/90 text-lg">{fb.subtitle}</p>}
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {categories.slice(0,8).map((cat, i) => (
                <Link key={cat.id} to={`/shop?category=${cat.id}`} className="group relative rounded-2xl overflow-hidden aspect-square border border-outline">
                  <div className="absolute inset-0 bg-surface-dim">
                    {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-center">
                    <h3 className="text-white font-semibold text-xl tracking-wide group-hover:-translate-y-2 transition-transform">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      );
    }
    
    // Add Testimonials or Festival Highlights if requested...
    return null;
  };

  return (
    <div className="w-full">
      {sectionsOrder.map(section => renderSection(section))}

      {/* AI Assistant FAB */}
      <AIGiftAssistant />
    </div>
  );
}

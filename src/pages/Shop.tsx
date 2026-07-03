import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { Heart, Package } from "lucide-react";

export default function Shop() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    // Read category from URL on mount
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if (catParam) setSelectedCategory(Number(catParam));

    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/admin/gift-boxes?boxType=READY_MADE', { // Ideally public endpoint, using admin for now as requested by instructions implicitly
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage') as string).state?.token : ''}`
        }
      }).then(res => res.ok ? res.json() : []).catch(() => []),
      fetch('/api/categories').then(res => res.ok ? res.json() : []).catch(() => [])
    ]).then(([prods, boxes, cats]) => {
      const formattedBoxes = Array.isArray(boxes) ? boxes.filter((b: any) => b.status === 'PUBLISHED').map((b: any) => ({
        ...b,
        image: b.coverImage,
        isGiftBox: true
      })) : [];
      const prodsArray = Array.isArray(prods) ? prods : [];
      setItems([...prodsArray, ...formattedBoxes].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      
      const catsArray = Array.isArray(cats) ? cats : [];
      setCategories(catsArray.filter((c: any) => c.isEnabled).sort((a: any, b: any) => a.sortOrder - b.sortOrder));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filteredItems = selectedCategory 
    ? items.filter(item => item.categoryId === selectedCategory || (item.isGiftBox && item.allowedCategoryIds?.includes(selectedCategory)))
    : items;

  if (loading) {
    return <div className="p-20 text-center text-on-surface-variant font-bold uppercase tracking-widest text-sm">Loading storefront...</div>;
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-10 py-8 flex flex-col md:flex-row gap-12">
      
      {/* Category Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <div className="space-y-2">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectedCategory === null ? 'bg-primary text-on-primary' : 'hover:bg-surface-container text-on-surface-variant'}`}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectedCategory === cat.id ? 'bg-primary text-on-primary' : 'hover:bg-surface-container text-on-surface-variant'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-on-surface">Storefront</h1>
            <p className="text-sm text-on-surface-variant">
              {selectedCategory 
                ? `Showing items in ${categories.find(c => c.id === selectedCategory)?.name}` 
                : "All our curated gifts and ready-made boxes in one place."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((product) => {
          const itemLink = product.isGiftBox ? `/gift-boxes/${product.id}` : `/product/${product.id}`;
          return (
          <div key={`${product.isGiftBox ? 'box' : 'prod'}-${product.id}`} className="group bg-surface rounded-2xl p-4 border border-outline-variant hover:border-primary/30 hover:shadow-xl transition-all flex flex-col">
            <Link to={itemLink} className="block relative mb-4 overflow-hidden rounded-xl aspect-square bg-surface-container">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                 <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant">
                   No image
                 </div>
              )}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  isInWishlist(product.id) ? removeWishlist(product.id) : addWishlist(product);
                }}
                className={`absolute top-3 right-3 p-2 backdrop-blur-sm rounded-full transition-colors z-10 cursor-pointer ${isInWishlist(product.id) ? 'bg-primary text-white' : 'bg-white/80 text-on-surface-variant hover:text-primary'}`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
              
              {product.isGiftBox && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-secondary text-on-secondary text-[9px] font-black rounded uppercase tracking-widest flex items-center gap-1 shadow-sm">
                  <Package className="w-3 h-3" />
                  Gift Box
                </div>
              )}
              
              {product.isFeatured && !product.isGiftBox && (
                <div className={`absolute bottom-3 left-3 px-2 py-1 text-[9px] font-black rounded uppercase tracking-tighter bg-primary text-white`}>
                  Featured
                </div>
              )}
            </Link>
            <div className="space-y-1 px-1 flex-1 flex flex-col">
              <Link to={itemLink}>
                <h4 className="font-bold text-sm mb-1 hover:text-primary transition-colors line-clamp-1">{product.name}</h4>
              </Link>
              <p className="text-xs text-on-surface-variant mb-3 line-clamp-2 min-h-[32px]">{product.description || (product.isGiftBox ? "Curated gift box" : "")}</p>
              <div className="flex justify-between items-center mt-auto pt-2">
                <span className="font-bold text-lg text-primary shrink-0">${Number(product.isGiftBox ? product.basePrice : product.price).toFixed(2)}</span>
                <button onClick={() => addItem(product)} className="bg-secondary text-on-secondary text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>
        )})}
        </div>
      </div>
    </div>
  );
}

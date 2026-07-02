import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { useCartStore } from "../store/useCartStore";
import { Product, CustomBox } from "../types";
import { Package, Plus, Minus, Check } from "lucide-react";

export default function CustomBoxBuilder() {
  const products = useProductStore((state) => state.products);
  const addCustomBox = useCartStore((state) => state.addCustomBox);
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [giftNote, setGiftNote] = useState("");

  const MAX_ITEMS = 5;
  const currentTotal = selectedItems.reduce((total, item) => total + item.price, 0);

  const toggleItem = (product: Product) => {
    if (selectedItems.find(i => i.id === product.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== product.id));
    } else {
      if (selectedItems.length < MAX_ITEMS) {
        setSelectedItems([...selectedItems, product]);
      }
    }
  };

  const handleAddToCart = () => {
    if (selectedItems.length === 0) return;
    
    const box: CustomBox = {
      id: Math.random().toString(36).substr(2, 9),
      items: selectedItems.map(p => ({ product: p })),
      giftNote: giftNote.trim() || undefined,
      totalPrice: currentTotal
    };

    addCustomBox(box);
    navigate('/cart');
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-10 py-8 flex flex-col lg:flex-row gap-12">
      <div className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-on-surface">Custom Box Builder</h1>
        <p className="text-sm text-on-surface-variant mb-8">Select up to {MAX_ITEMS} items to curate your perfect gift.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map((product) => {
            const isSelected = !!selectedItems.find(i => i.id === product.id);
            const isDisabled = !isSelected && selectedItems.length >= MAX_ITEMS;

            return (
              <div 
                key={product.id} 
                onClick={() => !isDisabled && toggleItem(product)}
                className={`group rounded-2xl p-4 border transition-all cursor-pointer flex gap-4
                  ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant bg-surface hover:border-primary/30'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container flex-shrink-0 relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-primary text-white rounded-full p-1"><Check className="w-4 h-4" /></div>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-sm mb-1">{product.name}</h4>
                  <p className="font-bold text-primary text-xs">${product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-center">
                  {isSelected ? (
                    <Minus className="w-5 h-5 text-primary" />
                  ) : (
                    <Plus className={`w-5 h-5 ${isDisabled ? 'text-outline' : 'text-outline-variant group-hover:text-primary'}`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant sticky top-28">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-on-surface">Your Box</h2>
            <span className="text-xs font-bold bg-surface-container px-3 py-1 rounded-full text-on-surface-variant">
              {selectedItems.length}/{MAX_ITEMS}
            </span>
          </div>

          <div className="space-y-4 mb-6 min-h-[200px]">
            {selectedItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <Package className="w-12 h-12 text-outline-variant mb-4" />
                <p className="text-sm text-on-surface-variant">Select items to start building.</p>
              </div>
            ) : (
              selectedItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-outline pb-2 last:border-0">
                  <span className="text-on-surface-variant line-clamp-1 flex-1 pr-4">{item.name}</span>
                  <span className="font-bold">${item.price.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Add a Gift Note (Optional)</label>
            <textarea 
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              placeholder="Write a sweet message..."
              className="w-full border border-outline p-4 rounded-xl text-sm bg-surface outline-none focus:ring-1 focus:ring-primary resize-none h-24"
            />
          </div>

          <div className="border-t border-outline-variant pt-6 mb-8">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-on-surface">Total</span>
              <span className="font-bold text-2xl text-primary">${currentTotal.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={selectedItems.length === 0}
            className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Box to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

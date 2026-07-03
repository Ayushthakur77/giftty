import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { Loader2, Package, Plus, Minus, Check, AlertCircle } from "lucide-react";

export default function CustomBoxBuilder() {
  const addCustomBox = useCartStore((state) => state.addCustomBox);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [boxes, setBoxes] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  
  const [selectedBox, setSelectedBox] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [giftNote, setGiftNote] = useState("");
  const [selectedCard, setSelectedCard] = useState<string>("");
  const [selectedRibbon, setSelectedRibbon] = useState<string>("");
  const [selectedFiller, setSelectedFiller] = useState<string>("");

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/gift-boxes?boxType=CUSTOM_BUILDER', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage') as string).state?.token : ''}` }
      }).then(res => res.ok ? res.json() : []),
      fetch('/api/products').then(res => res.ok ? res.json() : [])
    ]).then(([fetchedBoxes, fetchedProducts]) => {
      const publishedBoxes = fetchedBoxes.filter((b: any) => b.status === 'PUBLISHED');
      setBoxes(publishedBoxes);
      setAllProducts(fetchedProducts);
      
      if (publishedBoxes.length === 1) {
        handleSelectBox(publishedBoxes[0], fetchedProducts);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleSelectBox = (box: any, prods: any[] = allProducts) => {
    setSelectedBox(box);
    setGiftNote(box.defaultNote || "");
    
    // Auto-add required products
    if (box.requiredProductIds && box.requiredProductIds.length > 0) {
      const required = prods.filter(p => box.requiredProductIds.includes(p.id));
      setSelectedItems(required);
    } else {
      setSelectedItems([]);
    }
  };

  const getAvailableProducts = () => {
    if (!selectedBox) return [];
    
    let available = allProducts;
    
    // If explicit allowed categories
    if (selectedBox.allowedCategoryIds && selectedBox.allowedCategoryIds.length > 0) {
      available = available.filter(p => p.categoryId && selectedBox.allowedCategoryIds.includes(p.categoryId));
    }
    
    // If explicit allowed products
    if (selectedBox.allowedProductIds && selectedBox.allowedProductIds.length > 0) {
      // If categories were also set, usually it's an AND or OR. Prompt says: "if set, only products in these categories are selectable, in addition to/instead of the explicit allowedProductIds list"
      // Let's do union (OR) if both exist to be safe, or just intersect (AND). "filtered further by" implies AND.
      // Actually prompt says: "If empty, allows anything from allowed categories (or all if both empty)." in the admin form we wrote.
      available = available.filter(p => selectedBox.allowedProductIds.includes(p.id));
    }

    return available;
  };

  if (loading) {
    return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
  }

  if (boxes.length === 0) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-10 py-20 text-center">
        <Package className="w-16 h-16 text-outline-variant mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Custom Box Builder is Currently Unavailable</h2>
        <p className="text-on-surface-variant">We're updating our curation options. Please check back later or explore our ready-made gift boxes.</p>
      </div>
    );
  }

  if (!selectedBox) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-10 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Step 1: Choose Your Box</h1>
        <p className="text-sm text-on-surface-variant mb-8">Select a premium box to start building your gift.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boxes.map(box => (
            <div key={box.id} onClick={() => handleSelectBox(box)} className="bg-surface border border-outline rounded-2xl overflow-hidden cursor-pointer hover:border-primary transition-colors group">
              <div className="aspect-square bg-surface-container relative">
                {box.coverImage ? (
                   <img src={box.coverImage} alt={box.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-on-surface-variant"><Package className="w-12 h-12 opacity-50" /></div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-1">{box.name}</h3>
                <p className="text-primary font-bold mb-3">${Number(box.basePrice).toFixed(2)} Base Price</p>
                <ul className="text-xs text-on-surface-variant space-y-1">
                  <li>Up to {box.maxProducts || box.capacity} items</li>
                  {box.material && <li>{box.material}</li>}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const MAX_ITEMS = selectedBox.maxProducts || selectedBox.capacity || 5;
  const availableProducts = getAvailableProducts();
  const currentTotal = Number(selectedBox.basePrice) + selectedItems.reduce((total, item) => total + Number(item.price), 0);
  const isValid = selectedItems.length > 0 && 
                  (!selectedBox.mandatoryGreetingCard || selectedCard) && 
                  (!selectedBox.mandatoryNote || giftNote.trim());

  const toggleItem = (product: any) => {
    // If it's a required product, prevent removal
    if (selectedBox.requiredProductIds?.includes(product.id)) {
      return;
    }

    const index = selectedItems.findIndex(i => i.id === product.id);
    if (index >= 0) {
      // Removing
      const newItems = [...selectedItems];
      newItems.splice(index, 1);
      setSelectedItems(newItems);
    } else {
      // Adding
      if (selectedItems.length < MAX_ITEMS) {
        setSelectedItems([...selectedItems, product]);
      }
    }
  };

  const handleAddToCart = () => {
    if (!isValid) return;
    
    const box = {
      id: Math.random().toString(36).substr(2, 9),
      name: selectedBox.name,
      basePrice: selectedBox.basePrice,
      image: selectedBox.coverImage,
      isGiftBox: true,
      items: selectedItems.map(p => ({ product: p, quantity: 1 })),
      giftNote: giftNote.trim() || undefined,
      greetingCard: selectedCard || undefined,
      ribbon: selectedRibbon || undefined,
      filler: selectedFiller || undefined,
      totalPrice: currentTotal
    };

    addCustomBox(box);
    navigate('/cart');
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-10 py-8 flex flex-col lg:flex-row gap-12">
      <div className="flex-1">
        {boxes.length > 1 && (
           <button onClick={() => setSelectedBox(null)} className="text-xs font-bold text-primary mb-4 hover:underline">&larr; Change Box</button>
        )}
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-on-surface">Curate Your {selectedBox.name}</h1>
        <p className="text-sm text-on-surface-variant mb-8">Select up to {MAX_ITEMS} items to curate your perfect gift.</p>

        {availableProducts.length === 0 ? (
          <div className="p-8 bg-surface-container rounded-2xl text-center text-on-surface-variant">
            No products available for this box configuration.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {availableProducts.map((product) => {
              const isSelected = !!selectedItems.find(i => i.id === product.id);
              const isRequired = selectedBox.requiredProductIds?.includes(product.id);
              const isDisabled = !isSelected && selectedItems.length >= MAX_ITEMS && !isRequired;

              return (
                <div 
                  key={product.id} 
                  onClick={() => !isDisabled && toggleItem(product)}
                  className={`group rounded-2xl p-4 border transition-all cursor-pointer flex gap-4
                    ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant bg-surface hover:border-primary/30'}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isRequired ? 'ring-2 ring-primary border-transparent' : ''}
                  `}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container flex-shrink-0 relative">
                    {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="bg-primary text-white rounded-full p-1"><Check className="w-4 h-4" /></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-bold text-sm mb-1">{product.name}</h4>
                    <p className="font-bold text-primary text-xs">${Number(product.price).toFixed(2)}</p>
                    {isRequired && <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">Required</span>}
                  </div>
                  <div className="flex items-center justify-center">
                    {isSelected ? (
                      isRequired ? <Check className="w-5 h-5 text-primary" /> : <Minus className="w-5 h-5 text-primary hover:text-error transition-colors" />
                    ) : (
                      <Plus className={`w-5 h-5 ${isDisabled ? 'text-outline' : 'text-outline-variant group-hover:text-primary'}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full lg:w-[400px] flex-shrink-0">
        <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant sticky top-28">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-on-surface">Your Box</h2>
            <span className="text-xs font-bold bg-surface-container px-3 py-1 rounded-full text-on-surface-variant">
              {selectedItems.length}/{MAX_ITEMS}
            </span>
          </div>

          <div className="space-y-4 mb-6 min-h-[150px]">
            <div className="flex justify-between items-center text-sm border-b border-outline pb-2 font-bold text-primary">
              <span className="flex-1 pr-4">Box Base Price</span>
              <span>${Number(selectedBox.basePrice).toFixed(2)}</span>
            </div>
            {selectedItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-4">
                <p className="text-xs text-on-surface-variant">Select items to start building.</p>
              </div>
            ) : (
              selectedItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-outline pb-2 last:border-0">
                  <span className="text-on-surface-variant line-clamp-1 flex-1 pr-4">{item.name}</span>
                  <span className="font-bold">${Number(item.price).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          {selectedBox.mandatoryGreetingCard && (
             <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl">
               <label className="block text-xs font-bold text-error flex items-center gap-1 mb-2 uppercase tracking-widest"><AlertCircle className="w-3 h-3"/> Mandatory Greeting Card</label>
               <select value={selectedCard} onChange={e => setSelectedCard(e.target.value)} className="w-full p-2 text-sm border border-outline rounded-lg bg-surface">
                 <option value="">Select a card...</option>
                 {selectedBox.availableGreetingCards?.map((c: string) => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
          )}

          {(!selectedBox.mandatoryGreetingCard && selectedBox.availableGreetingCards?.length > 0) && (
            <div className="mb-6">
              <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Greeting Card (Optional)</label>
              <select value={selectedCard} onChange={e => setSelectedCard(e.target.value)} className="w-full p-2 text-sm border border-outline rounded-lg bg-surface">
                <option value="">None</option>
                {selectedBox.availableGreetingCards?.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {selectedBox.ribbonOptions?.length > 0 && (
            <div className="mb-6">
              <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Ribbon Color (Optional)</label>
              <select value={selectedRibbon} onChange={e => setSelectedRibbon(e.target.value)} className="w-full p-2 text-sm border border-outline rounded-lg bg-surface">
                <option value="">None</option>
                {selectedBox.ribbonOptions?.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {selectedBox.fillerOptions?.length > 0 && (
            <div className="mb-6">
              <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Box Filler (Optional)</label>
              <select value={selectedFiller} onChange={e => setSelectedFiller(e.target.value)} className="w-full p-2 text-sm border border-outline rounded-lg bg-surface">
                <option value="">None</option>
                {selectedBox.fillerOptions?.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div className="mb-8">
            <label className={`block text-xs font-bold mb-2 uppercase tracking-widest ${selectedBox.mandatoryNote ? 'text-error flex items-center gap-1' : 'text-on-surface-variant'}`}>
              {selectedBox.mandatoryNote && <AlertCircle className="w-3 h-3"/>}
              Gift Note {selectedBox.mandatoryNote ? '(Required)' : '(Optional)'}
            </label>
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
            disabled={!isValid}
            className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Box to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

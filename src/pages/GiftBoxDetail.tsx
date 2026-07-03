import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { ArrowLeft, Loader2, Package } from "lucide-react";

export default function GiftBoxDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [box, setBox] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    // In a real app we'd have a public endpoint GET /api/gift-boxes/:id
    // Here we'll just fetch all and find
    fetch(`/api/admin/gift-boxes?boxType=READY_MADE`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage') as string).state?.token : ''}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const found = data.find((b: any) => b.id === Number(id));
        setBox(found);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!box) {
    return <div className="p-20 text-center font-bold text-xl">Gift box not found.</div>;
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-8 pb-32">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-on-surface mb-8">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-surface-container rounded-3xl overflow-hidden aspect-square border border-outline p-8 flex items-center justify-center relative">
           {box.coverImage ? (
              <img src={box.coverImage} alt={box.name} className="w-full h-full object-cover rounded-2xl" />
           ) : (
              <Package className="w-32 h-32 text-on-surface-variant opacity-50" />
           )}
        </div>
        
        <div className="flex flex-col">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-secondary text-on-secondary text-xs font-black uppercase tracking-widest rounded mb-4">
              Curated Gift Box
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-on-surface leading-tight">
              {box.name}
            </h1>
            <div className="text-3xl font-bold text-primary mb-6">
              ${Number(box.basePrice).toFixed(2)}
            </div>
            
            <p className="text-on-surface-variant leading-relaxed mb-8">
              {box.description || "A beautifully curated gift box ready to be sent to your loved ones."}
            </p>
          </div>
          
          <div className="bg-surface-container-low border border-outline rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-sm uppercase tracking-widest text-on-surface mb-4">What's Inside</h3>
            <ul className="space-y-3">
              {box.includedProductIds?.map((item: any) => (
                <li key={item.productId} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {item.quantity}x
                  </div>
                  <span className="text-sm font-medium text-on-surface-variant">Product ID #{item.productId} (Check store for details)</span>
                </li>
              ))}
              {(!box.includedProductIds || box.includedProductIds.length === 0) && (
                <li className="text-sm text-on-surface-variant">Curated surprise items</li>
              )}
            </ul>
          </div>

          <button 
            onClick={() => addItem({ ...box, isGiftBox: true, image: box.coverImage })}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useNavigate } from "react-router-dom";

export default function AIGiftAssistant() {
  const [prompt, setPrompt] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Since we don't have CustomBoxBuilder.tsx code to integrate with yet,
  // we will handle the editable preview locally or redirect to a builder page.
  // For now, we'll display a preview here.
  const [result, setResult] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  const addCustomBox = useCartStore(state => state.addCustomBox);
  const navigate = useNavigate();

  const handleBuild = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    try {
      // First, get products for preview
      if (products.length === 0) {
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data);
        }
      }

      const res = await fetch("/api/ai/auto-build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, budget: budget ? Number(budget) : undefined }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to build gift");
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!result) return;
    
    // Convert result to CustomBoxItem[]
    // If quantity is > 1, add it multiple times or adjust type, 
    // but CustomBoxItem only takes `product`. Let's add it quantity times.
    const customBoxItems: any[] = [];
    result.productSelections.forEach((sel: any) => {
      const p = products.find(prod => prod.id === sel.productId);
      if (p) {
        for (let i = 0; i < sel.quantity; i++) {
          customBoxItems.push({ product: p });
        }
      }
    });

    const boxCost = result.boxId === 1 ? 15 : result.boxId === 2 ? 5 : 10;
    
    const totalPrice = boxCost + customBoxItems.reduce((acc: number, item: any) => acc + Number(item.product.price), 0);

    addCustomBox({
      id: Math.random().toString(),
      items: customBoxItems,
      giftNote: result.giftNote,
      totalPrice
    });
    
    navigate("/checkout");
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-tertiary" />
        </div>
        <h2 className="text-2xl font-bold text-on-surface tracking-tight">Type & Build</h2>
      </div>
      
      {!result ? (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Describe who the gift is for and the occasion. Our AI will curate the perfect box.
          </p>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Girlfriend ke liye Valentine's gift, roses pasand hai..."
            className="w-full bg-surface-container border border-outline-variant rounded-xl p-4 min-h-[120px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
          />
          <input 
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Budget (Optional)"
            className="w-full bg-surface-container border border-outline-variant rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />
          
          {error && <p className="text-error text-sm">{error}</p>}
          
          <button 
            onClick={handleBuild}
            disabled={loading || !prompt}
            className="w-full bg-on-surface text-surface font-semibold py-4 rounded-xl hover:bg-on-surface/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4"/> Build My Gift</>}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-surface-container p-4 rounded-xl border border-outline-variant">
            <h3 className="font-bold text-sm mb-2 text-on-surface">AI Reasoning</h3>
            <p className="text-sm text-on-surface-variant italic">{result.reasoning}</p>
          </div>
          
          <div>
            <h3 className="font-bold text-sm mb-2 text-on-surface">Box Selected</h3>
            <div className="p-4 border border-outline-variant rounded-xl text-sm font-medium">
              Box ID: {result.boxId}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-2 text-on-surface">Products</h3>
            <div className="space-y-3">
              {result.productSelections.map((sel: any, i: number) => {
                const prod = products.find(p => p.id === sel.productId);
                if (!prod) return null;
                return (
                  <div key={i} className="flex justify-between items-center p-3 border border-outline-variant rounded-xl text-sm">
                    <span className="font-medium">{prod.name}</span>
                    <span className="text-on-surface-variant">Qty: {sel.quantity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-2 text-on-surface">Gift Note</h3>
            <textarea 
              value={result.giftNote}
              onChange={(e) => setResult({ ...result, giftNote: e.target.value })}
              className="w-full bg-surface-container border border-outline-variant rounded-xl p-4 min-h-[100px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setResult(null)}
              className="flex-1 border border-outline text-on-surface font-medium py-3 rounded-xl hover:bg-surface-container transition-colors"
            >
              Start Over
            </button>
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Add to Cart <ArrowRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

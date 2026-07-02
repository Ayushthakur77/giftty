import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { Trash2, ArrowRight } from "lucide-react";

export default function Cart() {
  const { items, customBoxes, updateQuantity, removeItem, removeCustomBox, totalPrice } = useCartStore();
  const navigate = useNavigate();

  const isEmpty = items.length === 0 && customBoxes.length === 0;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-10 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8 text-on-surface">Your Cart</h1>
      
      {isEmpty ? (
        <div className="text-center py-20 bg-surface-container rounded-3xl border border-outline-variant">
          <p className="text-lg text-on-surface-variant font-medium mb-6">Your cart is feeling a bit empty.</p>
          <Link to="/shop" className="inline-flex bg-primary text-on-primary px-8 py-3 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-6 p-4 bg-surface rounded-2xl border border-outline-variant">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-on-surface">{item.product.name}</h3>
                      <p className="text-xs text-on-surface-variant line-clamp-1">{item.product.description}</p>
                    </div>
                    <p className="font-bold text-primary">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border border-outline rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-3 py-1 hover:bg-surface-container-low transition-colors">-</button>
                      <span className="px-3 py-1 font-bold text-xs text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-3 py-1 hover:bg-surface-container-low transition-colors">+</button>
                    </div>
                    <button onClick={() => removeItem(item.product.id)} className="text-error hover:text-error-container transition-colors p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {customBoxes.map((box, index) => (
               <div key={box.id} className="flex gap-6 p-4 bg-surface rounded-2xl border border-primary/30 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-12 translate-x-10 pointer-events-none"></div>
                 <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-sm text-on-surface">Custom Gift Box #{index + 1}</h3>
                      <p className="font-bold text-primary">${box.totalPrice.toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4">{box.items.length} items curated by you</p>
                    {box.giftNote && (
                      <p className="text-xs text-on-surface italic bg-surface-container-low p-2 rounded border border-outline-variant mb-4">
                        "{box.giftNote}"
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-[10px] font-bold text-primary tracking-widest uppercase bg-primary-container px-2 py-1 rounded">Custom</span>
                      <button onClick={() => removeCustomBox(box.id)} className="text-error hover:text-error-container transition-colors p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                 </div>
               </div>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant sticky top-28">
              <h2 className="text-lg font-bold mb-6 text-on-surface">Order Summary</h2>
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-bold text-on-surface">${totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Shipping</span>
                  <span className="font-bold text-on-surface">Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t border-outline-variant pt-4 mb-8">
                <div className="flex justify-between">
                  <span className="font-bold text-on-surface">Total</span>
                  <span className="font-bold text-xl text-primary">${totalPrice().toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')} className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-sm hover:opacity-90 transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

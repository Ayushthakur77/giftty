import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useOrderStore } from "../store/useOrderStore";
import { useAuthStore } from "../store/useAuthStore";

export default function Checkout() {
  const { items, customBoxes, totalPrice, clearCart } = useCartStore();
  const addOrder = useOrderStore((state) => state.addOrder);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const newOrder = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user?.id || 'guest',
        items: [...items, ...customBoxes],
        totalAmount: totalPrice(),
        status: 'PENDING' as const,
        createdAt: new Date().toISOString()
      };
      
      addOrder(newOrder);
      clearCart();
      setIsProcessing(false);
      navigate('/account'); // Or an order success page
    }, 1500);
  };

  if (items.length === 0 && customBoxes.length === 0) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-10 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">No items to checkout</h1>
        <button onClick={() => navigate('/shop')} className="text-primary hover:underline font-bold text-sm">Return to Shop</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-10 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8 text-on-surface">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6 bg-surface-container-low p-8 rounded-2xl border border-outline-variant">
            <h2 className="text-xl font-bold text-on-surface mb-4">Shipping Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Full Name</label>
                <input required type="text" value={shippingDetails.fullName} onChange={e => setShippingDetails({...shippingDetails, fullName: e.target.value})} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Email</label>
                <input required type="email" value={shippingDetails.email} onChange={e => setShippingDetails({...shippingDetails, email: e.target.value})} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Address</label>
                <input required type="text" value={shippingDetails.address} onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">City</label>
                <input required type="text" value={shippingDetails.city} onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">State</label>
                <input required type="text" value={shippingDetails.state} onChange={e => setShippingDetails({...shippingDetails, state: e.target.value})} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Zip Code</label>
                <input required type="text" value={shippingDetails.zip} onChange={e => setShippingDetails({...shippingDetails, zip: e.target.value})} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
          </form>
        </div>

        <div>
          <div className="bg-surface rounded-2xl p-8 border border-outline-variant sticky top-28">
             <h2 className="text-xl font-bold mb-6 text-on-surface">Order Summary</h2>
             <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant"><span className="font-bold text-on-surface">{item.quantity}x</span> {item.product.name}</span>
                    <span className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {customBoxes.map((box, i) => (
                  <div key={box.id} className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant"><span className="font-bold text-primary">1x</span> Custom Box #{i+1}</span>
                    <span className="font-bold">${box.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
             </div>
             <div className="border-t border-outline-variant pt-4 space-y-4 text-sm mb-8">
               <div className="flex justify-between">
                 <span className="text-on-surface-variant">Subtotal</span>
                 <span className="font-bold">${totalPrice().toFixed(2)}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-on-surface-variant">Shipping</span>
                 <span className="font-bold text-primary">Free</span>
               </div>
             </div>
             <div className="border-t border-outline-variant pt-4 mb-8">
               <div className="flex justify-between items-center">
                 <span className="font-bold text-lg">Total</span>
                 <span className="font-bold text-2xl text-primary">${totalPrice().toFixed(2)}</span>
               </div>
             </div>

             <button 
                type="submit" 
                form="checkout-form"
                disabled={isProcessing}
                className="w-full bg-secondary text-on-secondary font-bold py-4 rounded-xl shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
             >
                {isProcessing ? 'Processing...' : 'Place Order & Pay'}
             </button>
             <p className="text-[10px] text-center text-on-surface-variant mt-4 uppercase tracking-widest">
               Secure checkout powered by Simulated Razorpay
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

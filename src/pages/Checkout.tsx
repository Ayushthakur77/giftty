import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useOrderStore } from "../store/useOrderStore";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2, Tag, Truck, CheckCircle2, AlertCircle, ShoppingBag } from "lucide-react";

export default function Checkout() {
  const { items, customBoxes, totalPrice, clearCart } = useCartStore();
  const addOrder = useOrderStore((state) => state.addOrder);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "Maharashtra",
    zip: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Delivery calculator states
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Debounced dynamic shipping rate retrieval
  useEffect(() => {
    const calculateShipping = async () => {
      if (!shippingDetails.state) return;
      setDeliveryLoading(true);
      try {
        const res = await fetch("/api/delivery/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            state: shippingDetails.state,
            city: shippingDetails.city,
            pincode: shippingDetails.zip,
            orderSubtotal: totalPrice()
          })
        });
        const data = await res.json();
        setDeliveryInfo(data);
      } catch (err) {
        console.error("Shipping calculation error:", err);
      } finally {
        setDeliveryLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      calculateShipping();
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [shippingDetails.state, shippingDetails.city, shippingDetails.zip, items, customBoxes]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);
    try {
      const mappedItems = [
        ...items.map(i => ({ productId: i.product.id, categoryId: (i.product as any).categoryId || (i.product as any).category_id, price: i.product.price, quantity: i.quantity })),
        ...customBoxes.map(b => ({ productId: null, categoryId: null, price: b.totalPrice, quantity: 1 }))
      ];
      
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          orderTotal: totalPrice(),
          items: mappedItems
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to validate coupon");
      }
      setAppliedCoupon(data);
      setCouponSuccess(`Coupon successfully applied! Saved ₹${data.discountAmount.toFixed(2)}`);
    } catch (err: any) {
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Final price calculations
  const subtotal = totalPrice();
  const isDeliverable = deliveryInfo ? deliveryInfo.deliverable : true;
  
  // Calculate delivery charge: base zone charge, or zero if freeShippingApplied or Coupon is free shipping
  let deliveryCharge = deliveryInfo?.deliverable ? Number(deliveryInfo.charge) : 0;
  if (appliedCoupon?.isFreeShipping) {
    deliveryCharge = 0;
  }

  const discountAmount = appliedCoupon ? Number(appliedCoupon.discountAmount) : 0;
  const finalTotal = Math.max(0, subtotal + deliveryCharge - discountAmount);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDeliverable) {
      alert("We are currently unable to ship to the selected address.");
      return;
    }
    
    setIsProcessing(true);

    try {
      // In checkout, we submit the verified order to our backend
      const orderData = {
        totalAmount: String(finalTotal),
        shippingAddress: JSON.stringify(shippingDetails),
        couponId: appliedCoupon ? appliedCoupon.couponId : null,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        items: [
          ...items.map(i => ({ product: i.product, quantity: i.quantity })),
          ...customBoxes.map(b => ({ totalPrice: b.totalPrice, items: b.items, engraving: (b as any).engraving }))
        ]
      };

      // Since we are running in a container, we trigger a verified write directly:
      const res = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: "sim_" + Math.random().toString(36).substr(2, 9),
          razorpay_payment_id: "pay_" + Math.random().toString(36).substr(2, 9),
          razorpay_signature: "signature",
          orderData
        })
      });

      if (!res.ok) {
        throw new Error("Failed to process transaction in database.");
      }

      clearCart();
      setIsProcessing(false);
      navigate("/account");
    } catch (err: any) {
      alert(err.message || "Checkout failed");
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && customBoxes.length === 0) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-10 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-on-surface-variant mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">No items to checkout</h1>
        <button onClick={() => navigate("/shop")} className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-sm hover:opacity-90">
          Return to Shop
        </button>
      </div>
    );
  }

  const INDIAN_STATES_LIST = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
  ];

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-10 py-8">
      <h1 className="text-3xl font-black tracking-tight mb-8 text-on-surface">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form panel */}
        <div>
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6 bg-surface p-6 md:p-8 rounded-2xl border border-outline-variant shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Shipping Address
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Full Name</label>
                <input required type="text" value={shippingDetails.fullName} onChange={e => setShippingDetails({...shippingDetails, fullName: e.target.value})} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary font-medium" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Email Address</label>
                <input required type="email" value={shippingDetails.email} onChange={e => setShippingDetails({...shippingDetails, email: e.target.value})} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary font-medium" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Street Address</label>
                <input required type="text" value={shippingDetails.address} onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">City</label>
                <input required type="text" value={shippingDetails.city} onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">State</label>
                <select value={shippingDetails.state} onChange={e => setShippingDetails({...shippingDetails, state: e.target.value})} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary font-medium">
                  {INDIAN_STATES_LIST.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Pincode (Zip)</label>
                <input required type="text" value={shippingDetails.zip} onChange={e => setShippingDetails({...shippingDetails, zip: e.target.value})} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary font-medium" />
              </div>
            </div>
          </form>

          {/* Coupon Code Panel */}
          <div className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm mt-6">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-3">Have a discount coupon?</h3>
            {!appliedCoupon ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="ENTER CODE (e.g. MONSOON)"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 border border-outline px-3 py-2 text-sm bg-surface rounded-lg outline-none uppercase font-bold tracking-widest focus:ring-1 focus:ring-primary"
                />
                <button 
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                >
                  {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                </button>
              </form>
            ) : (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-success" />
                  <span className="text-sm font-black text-success uppercase">{appliedCoupon.code}</span>
                  <span className="text-xs text-on-surface-variant font-bold">Applied</span>
                </div>
                <button onClick={handleRemoveCoupon} className="text-xs text-error font-extrabold hover:underline">
                  Remove
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-error font-bold mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {couponError}</p>}
            {couponSuccess && <p className="text-xs text-success font-bold mt-2 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {couponSuccess}</p>}
          </div>
        </div>

        {/* Order Summary panel */}
        <div>
          <div className="bg-surface rounded-2xl p-6 md:p-8 border border-outline-variant sticky top-28 shadow-sm">
             <h2 className="text-xl font-bold mb-6 text-on-surface">Order Summary</h2>
             
             <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant"><span className="font-bold text-on-surface">{item.quantity}x</span> {item.product.name}</span>
                    <span className="font-bold text-on-surface">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {customBoxes.map((box, i) => (
                  <div key={box.id} className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant"><span className="font-bold text-primary">1x</span> Custom Box #{i+1}</span>
                    <span className="font-bold text-on-surface">₹{box.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
             </div>

             <div className="border-t border-outline-variant pt-4 space-y-4 text-sm mb-6">
               <div className="flex justify-between">
                 <span className="text-on-surface-variant">Subtotal</span>
                 <span className="font-bold text-on-surface">₹{subtotal.toFixed(2)}</span>
               </div>
               
               <div className="flex justify-between items-center">
                 <span className="text-on-surface-variant flex items-center gap-1">
                   Shipping
                   {deliveryLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                 </span>
                 <span className="font-bold text-on-surface">
                   {deliveryLoading ? (
                     <span className="text-xs text-on-surface-variant font-medium">Calculating...</span>
                   ) : !isDeliverable ? (
                     <span className="text-xs text-error font-extrabold uppercase">Undeliverable</span>
                   ) : deliveryCharge === 0 ? (
                     <span className="text-success font-black uppercase flex flex-col items-end text-xs">
                       Free Shipping
                       {deliveryInfo?.freeShippingRuleName && (
                         <span className="text-[10px] text-on-surface-variant font-medium capitalize">({deliveryInfo.freeShippingRuleName})</span>
                       )}
                     </span>
                   ) : (
                     `₹${deliveryCharge.toFixed(2)}`
                   )}
                 </span>
               </div>

               {appliedCoupon && (
                 <div className="flex justify-between text-success">
                   <span>Discount ({appliedCoupon.code})</span>
                   <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
                 </div>
               )}

               {deliveryInfo?.deliverable && deliveryInfo?.estimatedDays && (
                 <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant flex items-center gap-2">
                   <Truck className="w-4 h-4 text-primary" />
                   <span className="text-xs font-semibold text-on-surface-variant">
                     Estimated delivery: <span className="font-bold text-on-surface">{deliveryInfo.estimatedDays} days</span>
                   </span>
                 </div>
               )}
             </div>

             {/* Deliverability Warnings block */}
             {!isDeliverable && (
               <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/30 flex items-start gap-2.5 mb-6">
                 <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                 <div>
                   <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">Shipping Restriction</h4>
                   <p className="text-xs">{deliveryInfo?.message || "We do not deliver to this region yet."}</p>
                 </div>
               </div>
             )}

             <div className="border-t border-outline-variant pt-4 mb-8">
               <div className="flex justify-between items-center">
                 <span className="font-bold text-lg">Total</span>
                 <span className="font-black text-2xl text-primary">₹{finalTotal.toFixed(2)}</span>
               </div>
             </div>

             <button 
                type="submit" 
                form="checkout-form"
                disabled={isProcessing || !isDeliverable || deliveryLoading}
                className="w-full bg-secondary text-on-secondary font-black py-4 rounded-xl shadow-sm hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
                {isProcessing ? "Processing..." : "Place Order & Pay"}
             </button>
             
             <p className="text-[10px] text-center text-on-surface-variant mt-4 uppercase tracking-widest font-medium">
               Secure checkout powered by Simulated Razorpay
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

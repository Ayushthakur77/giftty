const fs = require('fs');

let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

const replacement = `
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDeliverable) {
      alert("We are currently unable to ship to the selected address.");
      return;
    }
    
    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const orderData = {
        totalAmount: String(finalTotal),
        shippingAddress: JSON.stringify(shippingDetails),
        couponId: appliedCoupon ? appliedCoupon.couponId : null,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        items: [
          ...items.map(i => ({ productId: Number(i.product.id), quantity: i.quantity, price: Number(i.product.price) }))
        ]
      };

      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${token}\`
        },
        body: JSON.stringify({ amount: finalTotal })
      });
      
      if (!createRes.ok) throw new Error("Failed to create order");
      const { orderId, keyId } = await createRes.json();
      
      // Load script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onerror = () => { alert('Razorpay SDK failed to load'); setIsProcessing(false); };
      script.onload = async () => {
        const options = {
          key: keyId,
          amount: finalTotal * 100,
          currency: "INR",
          name: "GiftJoy",
          description: "Order Payment",
          order_id: orderId,
          handler: async function (response: any) {
             const res = await fetch("/api/checkout/verify", {
               method: "POST",
               headers: {
                 "Content-Type": "application/json",
                 "Authorization": \`Bearer \${token}\`
               },
               body: JSON.stringify({
                 razorpay_order_id: response.razorpay_order_id,
                 razorpay_payment_id: response.razorpay_payment_id,
                 razorpay_signature: response.razorpay_signature,
                 orderData
               })
             });
             
             if (res.ok) {
               clearCart();
               clearCustomBoxes();
               navigate("/account?success=true");
             } else {
               alert("Payment verification failed");
               setIsProcessing(false);
             }
          },
          prefill: {
            name: shippingDetails.fullName,
            email: shippingDetails.email,
          },
          theme: {
            color: "#000000"
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
            }
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);

    } catch (error) {
      console.error(error);
      alert("Checkout failed. Please try again.");
      setIsProcessing(false);
    }
  };
`;

code = code.replace(/const handleCheckout = async \(e: React\.FormEvent\) => \{[\s\S]*?catch \(error\) \{[\s\S]*?setIsProcessing\(false\);\n    \}\n  \};/g, replacement.trim());

fs.writeFileSync('src/pages/Checkout.tsx', code);

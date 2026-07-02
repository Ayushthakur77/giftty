import Razorpay from 'razorpay';

let razorpayClient: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayClient) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      console.warn("Razorpay keys missing, falling back to mock");
      // Use mock or throw
    }
    
    // We will initialize with dummy if not present to avoid crash, but backend will fail gracefully
    razorpayClient = new Razorpay({
      key_id: key_id || 'dummy_key',
      key_secret: key_secret || 'dummy_secret'
    });
  }
  return razorpayClient;
}

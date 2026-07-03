import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrderStore } from "../store/useOrderStore";
import { Package, LogOut, Gift, Heart, Sparkles } from "lucide-react";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Account() {
  const { user, token, isAuthenticated, login, logout, syncUser } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    // Check for redirect result on load
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setIsLoading(true);
          const currentToken = await result.user.getIdToken();
          await syncUser(currentToken);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Redirect login error:", err);
        setError(`Sign-in failed: ${err.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    if (!isAuthenticated) {
      checkRedirect();
    }
  }, [isAuthenticated, syncUser]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const currentToken = await result.user.getIdToken();
      await syncUser(currentToken);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(`Sign-in failed: This domain is not authorized in Firebase. Please add this preview URL to Firebase Console -> Authentication -> Settings -> Authorized domains.`);
      } else {
        setError(`Sign-in failed: ${err.message || 'Unknown error'}`);
      }
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
        
        {/* Left Side: Brand & Messaging */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-on-surface leading-tight">
            Curate Perfect <br className="hidden md:block"/> Moments
          </h1>
          <p className="text-lg text-on-surface-variant mb-10 leading-relaxed max-w-md">
            Sign in to access your customized orders, track your special deliveries, and manage your personalized wishlist for the people you love.
          </p>
          
          <div className="hidden md:flex gap-6 items-center">
            <div className="flex -space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-[3px] border-surface shadow-sm relative z-30">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center border-[3px] border-surface shadow-sm relative z-20">
                <Heart className="w-5 h-5 text-secondary" />
              </div>
              <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center border-[3px] border-surface shadow-sm relative z-10">
                <Sparkles className="w-5 h-5 text-tertiary" />
              </div>
            </div>
            <p className="text-sm font-medium text-on-surface-variant">
              Join <strong className="text-on-surface">10,000+</strong> happy gifters
            </p>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-md relative">
          {/* Decorative elements behind card */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-tertiary/20 rounded-full blur-3xl"></div>
          
          <div className="relative bg-surface p-10 rounded-[2rem] border border-outline-variant shadow-xl text-center">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Heart className="w-8 h-8 text-primary" fill="currentColor" />
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight mb-2 text-on-surface">
              Welcome Back
            </h2>
            <p className="text-sm text-on-surface-variant mb-8">
              Sign in to your GiftJoy account.
            </p>
            
            {error && (
              <div className="mb-6 p-4 bg-error-container/50 text-error text-sm rounded-xl text-left border border-error-container">
                {error}
              </div>
            )}
            
            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoading}
              className="w-full bg-white text-gray-700 border border-gray-300 font-semibold py-3.5 px-4 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow transition-all disabled:opacity-50 disabled:hover:bg-white flex items-center justify-center text-[15px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <GoogleIcon />
                  Sign In with Google
                </>
              )}
            </button>
            
            <div className="mt-8 text-xs text-on-surface-variant">
              By signing in, you agree to our <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-10 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-on-surface">Hello, {user?.name}</h1>
          <p className="text-sm text-on-surface-variant">{user?.email}</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-sm font-bold text-error hover:bg-error-container px-4 py-2 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {user?.role === 'ADMIN' && (
        <div className="bg-primary-container text-on-primary-container p-6 rounded-2xl mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold mb-1">Admin Access</h2>
            <p className="text-sm">You have super admin privileges.</p>
          </div>
          <a href="/admin" className="bg-primary text-white text-sm font-bold px-6 py-2 rounded-lg">Go to Dashboard</a>
        </div>
      )}

      <h2 className="text-xl font-bold mb-6 text-on-surface">Your Orders</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-surface-container rounded-2xl border border-outline-variant">
          <Package className="w-10 h-10 text-outline-variant mx-auto mb-4" />
          <p className="text-sm text-on-surface-variant font-medium">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-surface border border-outline-variant rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4 border-b border-outline pb-4">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Order #{order.id}</p>
                  <p className="text-sm text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-primary">${Number(order.totalAmount).toFixed(2)}</p>
                  <span className="inline-block mt-1 px-3 py-1 bg-surface-container text-[10px] font-bold rounded uppercase tracking-wider">{order.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

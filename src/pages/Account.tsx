import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrderStore } from "../store/useOrderStore";
import { Package, LogOut } from "lucide-react";
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

export default function Account() {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [isAuthenticated, token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const dbUser = await res.json();
        login(dbUser, token);
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto px-10 py-20">
        <div className="bg-surface p-8 rounded-2xl border border-outline-variant shadow-sm text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-on-surface">
            Welcome Back
          </h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Sign in to access your orders and wishlist.
          </p>
          
          <button 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
            className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In with Google'}
          </button>
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

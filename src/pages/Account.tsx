import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrderStore } from "../store/useOrderStore";
import { Package, LogOut } from "lucide-react";

export default function Account() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const getUserOrders = useOrderStore(state => state.getUserOrders);
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto px-10 py-20">
        <div className="bg-surface p-8 rounded-2xl border border-outline-variant shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-on-surface">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-on-surface-variant mb-6">
            {isLogin ? 'Sign in to access your orders and wishlist.' : 'Join GiftJoy to start curating perfect moments.'}
          </p>
          
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const isAdmin = email === 'admin@giftjoy.com';
            login({
              id: Math.random().toString(36).substr(2, 9),
              email,
              name: name || email.split('@')[0],
              role: isAdmin ? 'ADMIN' : 'USER',
              createdAt: new Date().toISOString()
            });
          }}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-outline p-3 rounded-lg text-sm bg-surface outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button type="submit" className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-primary hover:underline">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
          {isLogin && <p className="text-center text-xs mt-4 text-outline-variant">Use admin@giftjoy.com for admin access</p>}
        </div>
      </div>
    );
  }

  const orders = getUserOrders(user!.id);

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
          {orders.map(order => (
            <div key={order.id} className="bg-surface border border-outline-variant rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4 border-b border-outline pb-4">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Order #{order.id}</p>
                  <p className="text-sm text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-primary">${order.totalAmount.toFixed(2)}</p>
                  <span className="inline-block mt-1 px-3 py-1 bg-surface-container text-[10px] font-bold rounded uppercase tracking-wider">{order.status}</span>
                </div>
              </div>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="text-sm flex justify-between">
                    <span className="text-on-surface-variant">
                      {'product' in item ? `${item.quantity}x ${item.product.name}` : `1x Custom Box (${item.items.length} items)`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

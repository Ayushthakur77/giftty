import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LayoutDashboard, Package, ShoppingBag, LogOut } from "lucide-react";
import { useEffect } from "react";

export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/account');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  const NAV_ITEMS = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  ];

  return (
    <div className="flex h-screen bg-surface-dim overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-outline flex flex-col">
        <div className="h-20 flex items-center px-8 border-b border-outline">
          <Link to="/" className="text-xl font-bold tracking-tight text-primary">
            GiftJoy Admin
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8">
          <ul className="space-y-2 px-4">
            {NAV_ITEMS.map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-4 border-t border-outline">
          <button 
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-error hover:bg-error-container transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-surface border-b border-outline flex items-center justify-between px-10">
          <h2 className="text-lg font-bold text-on-surface">
            {NAV_ITEMS.find(i => i.path === location.pathname)?.name || 'Admin'}
          </h2>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase">
               {user.name[0]}
             </div>
             <span className="text-sm font-bold text-on-surface">{user.name}</span>
          </div>
        </header>
        <div className="p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

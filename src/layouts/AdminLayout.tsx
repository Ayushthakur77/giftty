import { CheckSquare, Square, LayoutDashboard, Package, ShoppingBag, LogOut, Tags, Map, FileText, Settings, Shield, BarChart, Truck, Box } from "lucide-react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";

export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  
  // Session Timeout Logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/settings/security", {
          headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
        });
        const data = await res.json();
        let timeoutMinutes = 60; // default
        if (data && Array.isArray(data)) {
          const setting = data.find((s: any) => s.key === 'session_timeout_minutes');
          if (setting) timeoutMinutes = parseInt(setting.value);
        }
        
        const resetTimeout = () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            logout();
            navigate('/admin/login');
          }, timeoutMinutes * 60 * 1000);
        };
        
        // Listen for activity
        window.addEventListener('mousemove', resetTimeout);
        window.addEventListener('keypress', resetTimeout);
        resetTimeout();
        
        return () => {
          clearTimeout(timeoutId);
          window.removeEventListener('mousemove', resetTimeout);
          window.removeEventListener('keypress', resetTimeout);
        };
      } catch (err) {
        console.error(err);
      }
    };
    
    if (isAuthenticated && user?.role === 'ADMIN') {
      checkSession();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/admin/login');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  const NAV_ITEMS = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Gift Boxes', path: '/admin/gift-boxes', icon: Box },
    { name: 'Inventory', path: '/admin/inventory', icon: Package },
    { name: 'Delivery', path: '/admin/delivery', icon: Truck },
    { name: 'Coupons', path: '/admin/coupons', icon: Tags },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', path: '/admin/customers', icon: Package },
    { name: 'Reviews', path: '/admin/reviews', icon: Package },
    { name: 'Banners', path: '/admin/banners', icon: Map },
    { name: 'CMS', path: '/admin/cms', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Security', path: '/admin/security', icon: Shield },
    { name: 'Reports', path: '/admin/analytics', icon: BarChart },
    { name: 'Permissions', path: '/admin/permissions', icon: CheckSquare },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: Square },
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
        
        <div className="flex-1 overflow-y-auto py-8 scrollbar-thin">
          <ul className="space-y-1 px-4">
            {NAV_ITEMS.map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <Icon className="w-4 h-4 opacity-70" />
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
              navigate('/admin/login');
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-error hover:bg-error-container transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-surface-dim">
        <header className="h-20 bg-surface border-b border-outline flex items-center justify-between px-10 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-on-surface">
            {NAV_ITEMS.find(i => i.path === location.pathname)?.name || 'Admin'}
          </h2>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase">
               {user.name?.[0] || 'A'}
             </div>
             <span className="text-sm font-bold text-on-surface">{user.name || 'Admin'}</span>
          </div>
        </header>
        <div className="p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

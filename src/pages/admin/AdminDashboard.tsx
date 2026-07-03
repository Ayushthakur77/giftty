import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch('/api/admin/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  if (loading || !stats) {
    return <div className="animate-pulse flex space-x-4 p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Top row stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Today's Sales</p>
          <p className="text-3xl font-bold text-primary">${Number(stats.todaySales).toFixed(2)}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Monthly Sales</p>
          <p className="text-3xl font-bold text-primary">${Number(stats.monthlySales).toFixed(2)}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-on-surface">${Number(stats.totalRevenue).toFixed(2)}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-on-surface">{stats.totalOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Pending Orders</p>
          <p className="text-2xl font-bold text-amber-500">{stats.pendingOrders}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Low Stock Products</p>
          <p className="text-2xl font-bold text-error">{stats.lowStockProducts}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">New Customers (30d)</p>
          <p className="text-2xl font-bold text-on-surface">{stats.newCustomers}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Active Products</p>
          <p className="text-2xl font-bold text-on-surface">{stats.activeProducts}</p>
        </div>
      </div>

      {/* Charts & Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales Chart */}
        <div className="bg-surface rounded-2xl border border-outline shadow-sm p-6">
          <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface mb-6">Sales (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="var(--color-primary, #000)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recently Added Products */}
        <div className="bg-surface rounded-2xl border border-outline shadow-sm p-6">
          <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface mb-6">Recently Added Products</h3>
          <div className="space-y-4">
            {stats.recentlyAddedProducts?.map((product: any) => (
              <div key={product.id} className="flex items-center gap-4">
                <img src={product.image} alt={product.name} className="w-12 h-12 rounded object-cover" />
                <div className="flex-1">
                  <p className="font-bold text-sm">{product.name}</p>
                  <p className="text-xs text-on-surface-variant">${Number(product.price).toFixed(2)}</p>
                </div>
                <div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${product.inventoryCount <= product.lowStockThreshold ? 'bg-error-container text-error' : 'bg-surface-container text-on-surface-variant'}`}>
                    Stock: {product.inventoryCount}
                  </span>
                </div>
              </div>
            ))}
            {(!stats.recentlyAddedProducts || stats.recentlyAddedProducts.length === 0) && (
              <p className="text-sm text-on-surface-variant">No products found.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

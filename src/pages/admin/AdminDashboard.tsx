import { useOrderStore } from "../../store/useOrderStore";
import { useProductStore } from "../../store/useProductStore";

export default function AdminDashboard() {
  const orders = useOrderStore(state => state.getAllOrders());
  const products = useProductStore(state => state.products);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-primary">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-on-surface">{orders.length}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Total Products</p>
          <p className="text-3xl font-bold text-on-surface">{products.length}</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-outline shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline">
          <h3 className="font-bold text-lg text-on-surface">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low text-on-surface-variant">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Order ID</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Date</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Customer</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {orders.slice(0, 5).map(order => (
                <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-medium">{order.id}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{order.userId}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-surface-container text-[10px] font-bold rounded uppercase tracking-wider">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-right">${order.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

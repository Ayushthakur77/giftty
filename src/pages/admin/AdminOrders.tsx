import { useOrderStore } from "../../store/useOrderStore";

export default function AdminOrders() {
  const orders = useOrderStore(state => state.getAllOrders());
  const updateOrderStatus = useOrderStore(state => state.updateOrderStatus);

  return (
    <div className="bg-surface rounded-2xl border border-outline shadow-sm overflow-hidden">
      <div className="p-6 border-b border-outline">
        <h3 className="font-bold text-lg text-on-surface">All Orders</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Order ID</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Date</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Customer</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Amount</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-6 py-4 font-medium">{order.id}</td>
                <td className="px-6 py-4 text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-on-surface-variant">{order.userId}</td>
                <td className="px-6 py-4 font-bold">${order.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <select 
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                    className="bg-surface border border-outline rounded p-1 text-xs font-bold uppercase"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </td>
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
  );
}

import { useProductStore } from "../../store/useProductStore";

export default function AdminProducts() {
  const products = useProductStore(state => state.products);

  return (
    <div className="bg-surface rounded-2xl border border-outline shadow-sm overflow-hidden">
      <div className="p-6 border-b border-outline flex justify-between items-center">
        <h3 className="font-bold text-lg text-on-surface">All Products</h3>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold">Add Product</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Image</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Name</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Category</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-6 py-4">
                  <div className="w-10 h-10 rounded bg-surface-container overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">{product.name}</td>
                <td className="px-6 py-4 text-on-surface-variant">{product.category}</td>
                <td className="px-6 py-4 font-bold">${product.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

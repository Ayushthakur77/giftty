import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader2, Plus, Edit, Copy, Trash2, ExternalLink, CheckSquare, Square, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminProducts() {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkPayload, setBulkPayload] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (statusFilter) q.append('status', statusFilter);
      
      const res = await fetch(`/api/admin/products?${q.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token, search, statusFilter]);

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await fetch(`/api/admin/products/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    if (bulkAction === 'delete' && !confirm(`Delete ${selectedIds.size} products?`)) return;
    
    let payload: any = null;
    if (bulkAction === 'statusUpdate') payload = { status: bulkPayload };
    if (bulkAction === 'categoryAssign') payload = { categoryId: Number(bulkPayload) };
    if (bulkAction === 'imageUpdate') payload = { imageUrl: bulkPayload };
    if (bulkAction === 'priceUpdate') payload = { type: 'percent', value: Number(bulkPayload) }; // simplified

    try {
      await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          productIds: Array.from(selectedIds),
          action: bulkAction,
          payload
        })
      });
      setSelectedIds(new Set());
      setBulkAction("");
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Products</h2>
        <Link 
          to="/admin/products/new"
          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-surface rounded-2xl border border-outline shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline flex flex-wrap gap-4 items-center justify-between bg-surface-container-low">
          <div className="flex gap-4 items-center flex-1">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 border border-outline rounded-lg text-sm w-64 bg-surface"
            />
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-outline rounded-lg text-sm bg-surface"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 bg-primary-container px-4 py-2 rounded-lg">
              <span className="text-sm font-bold text-on-primary-container">{selectedIds.size} selected</span>
              <select 
                value={bulkAction} 
                onChange={e => setBulkAction(e.target.value)}
                className="px-3 py-1.5 border border-outline rounded text-sm bg-surface"
              >
                <option value="">Bulk Action...</option>
                <option value="delete">Delete</option>
                <option value="statusUpdate">Update Status</option>
                <option value="priceUpdate">Update Price (%)</option>
              </select>
              {bulkAction && bulkAction !== 'delete' && (
                <input 
                  type="text" 
                  placeholder={bulkAction === 'statusUpdate' ? 'PUBLISHED/DRAFT' : 'Value'}
                  value={bulkPayload}
                  onChange={e => setBulkPayload(e.target.value)}
                  className="px-3 py-1.5 border border-outline rounded text-sm bg-surface w-32"
                />
              )}
              <button 
                onClick={handleBulkAction}
                className="bg-primary text-on-primary px-3 py-1.5 rounded text-sm font-bold"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <button onClick={toggleSelectAll}>
                      {selectedIds.size === products.length && products.length > 0 ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs">Product</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs">SKU</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs">Price</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs">Stock</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs">Status</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(product.id)}>
                        {selectedIds.has(product.id) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-on-surface-variant" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img src={product.image} alt="" className="w-10 h-10 rounded object-cover border border-outline" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-surface-container border border-outline flex items-center justify-center">
                            <span className="text-xs text-on-surface-variant">No img</span>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-on-surface">{product.name}</p>
                          <div className="flex gap-1 mt-1">
                            {product.isFeatured && <span className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container text-[8px] uppercase tracking-wider font-bold rounded">Featured</span>}
                            {product.isBestseller && <span className="px-1.5 py-0.5 bg-tertiary-container text-on-tertiary-container text-[8px] uppercase tracking-wider font-bold rounded">Bestseller</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant font-mono text-xs">{product.sku || '-'}</td>
                    <td className="px-4 py-3 font-bold">${Number(product.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${product.inventoryCount <= product.lowStockThreshold ? 'bg-error-container text-error' : 'bg-surface-container text-on-surface-variant'}`}>
                        {product.inventoryCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        product.status === 'PUBLISHED' ? 'bg-primary-container text-on-primary-container' : 
                        product.status === 'DRAFT' ? 'bg-surface-container text-on-surface-variant' : 
                        'bg-error-container text-error'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/products/${product.id}/edit`} className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant hover:text-primary transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDuplicate(product.id)} className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant hover:text-primary transition-colors" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 hover:bg-error-container rounded text-on-surface-variant hover:text-error transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <a href={`/product/${product.id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant hover:text-primary transition-colors" title="View">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

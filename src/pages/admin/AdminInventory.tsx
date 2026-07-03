import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { 
  Loader2, Plus, History, AlertTriangle, Search, TrendingUp, 
  TrendingDown, ShieldAlert, ArrowLeftRight, CheckCircle, XCircle 
} from "lucide-react";

export default function AdminInventory() {
  const { token } = useAuthStore();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "alerts">("overview");
  const [error, setError] = useState<string | null>(null);

  // Modal State for Movement
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [movementForm, setMovementForm] = useState({
    type: "INCOMING",
    quantity: 1,
    warehouse: "Main Warehouse",
    note: ""
  });
  const [movementSubmitting, setMovementSubmitting] = useState(false);

  // Modal State for History
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<any>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inventory", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load inventory data");
      const data = await res.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInventory();
    }
  }, [token]);

  const handleOpenMovementModal = (product: any) => {
    setSelectedProduct(product);
    setMovementForm({
      type: "INCOMING",
      quantity: 1,
      warehouse: product.warehouse || "Main Warehouse",
      note: ""
    });
    setShowMovementModal(true);
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setMovementSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory/movement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          ...movementForm
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to log stock movement");
      }
      setShowMovementModal(false);
      fetchInventory();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setMovementSubmitting(false);
    }
  };

  const handleOpenHistoryModal = async (product: any) => {
    setHistoryProduct(product);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/admin/inventory/${product.id}/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch product history");
      const data = await res.json();
      setHistoryLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Filter and Search logic
  const filteredProducts = inventory.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeTab === "alerts") {
      return matchesSearch && p.isLowStock;
    }
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-[1280px] mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Inventory Management</h1>
          <p className="text-sm text-on-surface-variant">Track stock levels, log movements, and manage alerts.</p>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex bg-surface-container p-1 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "overview" ? "bg-surface text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            All Stock Overview ({inventory.length})
          </button>
          <button 
            onClick={() => setActiveTab("alerts")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "alerts" ? "bg-error text-on-error shadow-sm font-extrabold" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <AlertTriangle className="w-4 h-4" />
            Stock Alerts ({inventory.filter(p => p.isLowStock).length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-outline rounded-lg bg-surface text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl border border-error/30 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-outline-variant rounded-2xl bg-surface">
          <AlertTriangle className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">No products found</h3>
          <p className="text-xs text-on-surface-variant">Try modifying your search or filters.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="p-4 pl-6">Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4 text-center">Live Stock</th>
                  <th className="p-4 text-center">Reserved</th>
                  <th className="p-4 text-center">Damaged</th>
                  <th className="p-4">Warehouse</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-sm">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-surface-container" />
                      <div>
                        <div className="font-bold text-on-surface">{p.name}</div>
                        <div className="text-xs text-on-surface-variant flex items-center gap-1">
                          Threshold: <span className="font-semibold">{p.lowStockThreshold || 5}</span>
                          {p.isLowStock && (
                            <span className="bg-error/10 text-error px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Low Stock</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant font-mono text-xs">{p.sku || "N/A"}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.isLowStock ? "bg-error-container text-on-error-container border border-error/20" : "bg-success-container text-on-success-container"}`}>
                        {p.currentStock}
                      </span>
                    </td>
                    <td className="p-4 text-center font-semibold text-on-surface-variant">
                      {p.reservedStock || 0}
                    </td>
                    <td className="p-4 text-center font-semibold text-error">
                      {p.damagedStock || 0}
                    </td>
                    <td className="p-4 text-on-surface-variant">{p.warehouse}</td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenMovementModal(p)}
                          className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-1 shadow-sm"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          Adjust Stock
                        </button>
                        <button 
                          onClick={() => handleOpenHistoryModal(p)}
                          className="px-3 py-1.5 border border-outline rounded-lg text-xs font-bold text-on-surface hover:bg-surface-container flex items-center gap-1"
                        >
                          <History className="w-3.5 h-3.5" />
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movement Form Modal */}
      {showMovementModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 border border-outline shadow-2xl relative">
            <h2 className="text-xl font-bold mb-2">Log Stock Movement</h2>
            <p className="text-xs text-on-surface-variant mb-4">
              Log changes for <span className="font-semibold text-on-surface">{selectedProduct.name}</span>. Current live stock is <span className="font-bold text-primary">{selectedProduct.currentStock}</span>.
            </p>

            <form onSubmit={handleMovementSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-on-surface-variant">Movement Type</label>
                <select 
                  value={movementForm.type}
                  onChange={e => setMovementForm({...movementForm, type: e.target.value})}
                  className="w-full p-2.5 text-sm border border-outline rounded-lg bg-surface focus:outline-none"
                >
                  <option value="INCOMING">Incoming (Increases stock)</option>
                  <option value="OUTGOING">Outgoing (Decreases stock)</option>
                  <option value="DAMAGED">Damaged (Decreases stock, logs damage)</option>
                  <option value="RESERVED">Reserved (Sets aside stock, no count change)</option>
                  <option value="ADJUSTMENT">Adjustment (Overrides current live count)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-on-surface-variant">Quantity / New Count</label>
                  <input 
                    type="number" 
                    min="1"
                    value={movementForm.quantity}
                    onChange={e => setMovementForm({...movementForm, quantity: Number(e.target.value)})}
                    className="w-full p-2.5 text-sm border border-outline rounded-lg bg-surface focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-on-surface-variant">Warehouse</label>
                  <input 
                    type="text" 
                    value={movementForm.warehouse}
                    onChange={e => setMovementForm({...movementForm, warehouse: e.target.value})}
                    className="w-full p-2.5 text-sm border border-outline rounded-lg bg-surface focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-on-surface-variant">Note / Reason</label>
                <textarea 
                  value={movementForm.note}
                  onChange={e => setMovementForm({...movementForm, note: e.target.value})}
                  placeholder="e.g. Received weekly batch shipment, Order fulfillment, Damaged in packaging"
                  className="w-full p-2.5 text-sm border border-outline rounded-lg bg-surface focus:outline-none h-20 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 border border-outline rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={movementSubmitting}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {movementSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Log Modal */}
      {showHistoryModal && historyProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl max-w-2xl w-full p-6 border border-outline shadow-2xl relative max-h-[85vh] flex flex-col">
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Stock History Log
            </h2>
            <p className="text-xs text-on-surface-variant mb-4">
              Chronological inventory activity for <span className="font-semibold text-on-surface">{historyProduct.name}</span>.
            </p>

            <div className="flex-1 overflow-y-auto min-h-[250px] pr-2">
              {historyLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-low">
                  <History className="w-8 h-8 text-on-surface-variant mx-auto mb-2" />
                  <p className="text-sm font-bold text-on-surface">No logs recorded yet</p>
                  <p className="text-xs text-on-surface-variant">Adjust stock or record movements to populate.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyLogs.map((log) => {
                    const isPositive = log.type === 'INCOMING' || (log.type === 'ADJUSTMENT' && log.quantity >= 0);
                    return (
                      <div key={log.id} className="p-3 border border-outline-variant rounded-xl bg-surface-container-low flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              log.type === 'INCOMING' ? 'bg-success/15 text-success' :
                              log.type === 'OUTGOING' ? 'bg-primary/15 text-primary' :
                              log.type === 'DAMAGED' ? 'bg-error/15 text-error font-extrabold' :
                              log.type === 'RESERVED' ? 'bg-warning/15 text-warning' :
                              'bg-surface-container text-on-surface-variant'
                            }`}>
                              {log.type}
                            </span>
                            <span className="text-xs text-on-surface-variant font-medium">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-on-surface mt-1.5">{log.note}</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">
                            Logged by: <span className="font-semibold">{log.createdByEmail || 'System'}</span> • Whse: <span className="font-semibold">{log.warehouse || 'N/A'}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-base font-bold flex items-center gap-1 ${isPositive ? 'text-success' : log.type === 'RESERVED' ? 'text-warning' : 'text-error'}`}>
                            {isPositive ? '+' : ''}{log.quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-outline-variant mt-4 flex-shrink-0">
              <button 
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 border border-outline rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

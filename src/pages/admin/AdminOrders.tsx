import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { 
  Loader2, Search, Filter, Eye, Printer, Package, Truck, 
  CheckCircle, XCircle, Clock, FileText, Download, ShieldAlert,
  ArrowRight, Undo, CornerDownLeft
} from "lucide-react";

export default function AdminOrders() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [cancelReason, setCancelReason] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [newNote, setNewNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTrackingUpdate = async () => {
    if (!selectedOrder || !trackingNumber) return;
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/tracking`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ trackingNumber })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedOrder({ ...selectedOrder, trackingNumber: updated.trackingNumber });
        fetchOrders();
        setTrackingNumber("");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason) return;
    if (!confirm("Are you sure you want to cancel this order? Stock will be restored.")) return;
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cancelledReason: cancelReason })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedOrder({ ...selectedOrder, status: 'CANCELLED', cancelledReason: updated.cancelledReason });
        fetchOrders();
        setCancelReason("");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRefund = async () => {
    if (!selectedOrder || !refundAmount || !refundReason) return;
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          refundStatus: 'COMPLETED',
          refundAmount,
          refundReason
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedOrder({ 
          ...selectedOrder, 
          refundStatus: updated.refundStatus, 
          refundAmount: updated.refundAmount, 
          refundReason: updated.refundReason 
        });
        fetchOrders();
        setRefundAmount("");
        setRefundReason("");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddNote = async () => {
    if (!selectedOrder || !newNote) return;
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ note: newNote })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedOrder({ ...selectedOrder, internalNotes: updated.internalNotes });
        setNewNote("");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePrintInvoice = async (orderId: number) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/invoice`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to generate invoice");
      const invoiceData = await res.json();
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${invoiceData.order.invoiceNumber || orderId}</title>
              <style>
                body { font-family: sans-serif; padding: 40px; color: #111; }
                .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                .store-info { text-align: right; }
                h1 { margin: 0 0 10px 0; color: #333; }
                .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f9f9f9; font-weight: bold; }
                .totals { text-align: right; margin-top: 20px; }
                .totals p { margin: 5px 0; }
                .total { font-size: 20px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div>
                  <h1>INVOICE</h1>
                  <p>Invoice #: <strong>${invoiceData.order.invoiceNumber || 'N/A'}</strong></p>
                  <p>Date: ${new Date(invoiceData.order.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="store-info">
                  <h2>${invoiceData.storeInfo.name}</h2>
                  <p>${invoiceData.storeInfo.address}</p>
                  <p>GST: ${invoiceData.storeInfo.gst}</p>
                </div>
              </div>
              
              <div class="details">
                <div>
                  <h3>Bill To:</h3>
                  <p>${invoiceData.customer.name}</p>
                  <p>${invoiceData.customer.email}</p>
                </div>
                <div>
                  <h3>Ship To:</h3>
                  <p>${invoiceData.order.shippingAddress?.fullName || invoiceData.customer.name}</p>
                  <p>${invoiceData.order.shippingAddress?.address}</p>
                  <p>${invoiceData.order.shippingAddress?.city}, ${invoiceData.order.shippingAddress?.state} ${invoiceData.order.shippingAddress?.zip}</p>
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceData.items.map((i: any) => `
                    <tr>
                      <td>${i.isCustomBox ? 'Custom Gift Box' : 'Product ID: ' + i.productId}</td>
                      <td>${i.quantity}</td>
                      <td>₹${Number(i.price).toFixed(2)}</td>
                      <td>₹${(Number(i.price) * i.quantity).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="totals">
                <p>Order Total: <strong>₹${Number(invoiceData.order.totalAmount).toFixed(2)}</strong></p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (err: any) {
      alert("Failed to generate invoice: " + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-warning/10 text-warning px-2 py-1 rounded text-xs font-bold uppercase">Pending</span>;
      case 'PROCESSING': return <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold uppercase">Processing</span>;
      case 'SHIPPED': return <span className="bg-info/10 text-info px-2 py-1 rounded text-xs font-bold uppercase">Shipped</span>;
      case 'DELIVERED': return <span className="bg-success/10 text-success px-2 py-1 rounded text-xs font-bold uppercase">Delivered</span>;
      case 'CANCELLED': return <span className="bg-error/10 text-error px-2 py-1 rounded text-xs font-bold uppercase">Cancelled</span>;
      default: return <span className="bg-surface-variant text-on-surface px-2 py-1 rounded text-xs font-bold uppercase">{status}</span>;
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toString().includes(searchQuery) || 
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.user && o.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.user && o.user.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (selectedOrder) {
    return (
      <div className="w-full max-w-[1280px] mx-auto p-6">
        <button 
          onClick={() => setSelectedOrder(null)}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Orders
        </button>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Order #{selectedOrder.id}</h1>
            <p className="text-sm text-on-surface-variant">
              Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => handlePrintInvoice(selectedOrder.id)}
              className="px-4 py-2 border border-outline rounded-lg text-sm font-bold flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant">
              <h2 className="text-lg font-bold mb-4 border-b border-outline-variant pb-2">Items Ordered</h2>
              <div className="space-y-4">
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-outline-variant/50 last:border-0">
                    <div>
                      <p className="font-bold">{item.isCustomBox ? 'Custom Gift Box' : `Product ID: ${item.productId}`}</p>
                      {item.isCustomBox && item.engravingText && (
                        <p className="text-xs text-on-surface-variant mt-1">Engraving: {item.engravingText}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{item.price} x {item.quantity}</p>
                      <p className="text-sm text-primary font-black">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center text-lg font-black">
                <span>Total Amount:</span>
                <span className="text-primary">₹{Number(selectedOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant">
              <h2 className="text-lg font-bold mb-4 border-b border-outline-variant pb-2">Internal Notes</h2>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {selectedOrder.internalNotes && selectedOrder.internalNotes.map((n: any, i: number) => (
                  <div key={i} className="bg-surface-container-low p-3 rounded-lg text-sm">
                    <p className="mb-1">{n.note}</p>
                    <p className="text-[10px] text-on-surface-variant font-bold">By {n.addedBy} at {new Date(n.addedAt).toLocaleString()}</p>
                  </div>
                ))}
                {(!selectedOrder.internalNotes || selectedOrder.internalNotes.length === 0) && (
                  <p className="text-sm text-on-surface-variant">No internal notes.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Add an internal note..." 
                  className="flex-1 border border-outline rounded-lg px-3 py-2 text-sm bg-surface"
                />
                <button 
                  onClick={handleAddNote}
                  disabled={!newNote}
                  className="px-4 bg-secondary text-on-secondary font-bold text-sm rounded-lg disabled:opacity-50"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant">
              <h2 className="text-lg font-bold mb-4 border-b border-outline-variant pb-2">Customer & Shipping</h2>
              <div className="text-sm space-y-3">
                <div>
                  <p className="text-on-surface-variant font-bold text-xs uppercase mb-1">Customer</p>
                  <p className="font-semibold">{selectedOrder.user?.name}</p>
                  <p className="text-on-surface-variant">{selectedOrder.user?.email}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-bold text-xs uppercase mb-1">Shipping Address</p>
                  <p className="font-semibold">{selectedOrder.shippingAddress?.fullName}</p>
                  <p>{selectedOrder.shippingAddress?.address}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                  <p>{selectedOrder.shippingAddress?.zip}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant">
              <h2 className="text-lg font-bold mb-4 border-b border-outline-variant pb-2">Order Status</h2>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-sm text-on-surface-variant">Current Status:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                
                {selectedOrder.status !== 'CANCELLED' && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleStatusUpdate(selectedOrder.id, st)}
                        disabled={selectedOrder.status === st}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                          selectedOrder.status === st ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline hover:bg-surface-container'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedOrder.status !== 'CANCELLED' && (
                <div className="mt-4 pt-4 border-t border-outline-variant">
                  <label className="text-xs font-bold text-on-surface-variant uppercase mb-2 block">Tracking Number</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      placeholder={selectedOrder.trackingNumber || "Enter tracking ID"} 
                      className="flex-1 border border-outline rounded-lg px-3 py-2 text-sm bg-surface"
                    />
                    <button 
                      onClick={handleTrackingUpdate}
                      disabled={!trackingNumber}
                      className="px-3 bg-secondary text-on-secondary font-bold text-xs rounded-lg disabled:opacity-50"
                    >
                      Update
                    </button>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <p className="text-xs mt-2 text-success font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Current: {selectedOrder.trackingNumber}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Cancellations & Refunds */}
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant">
              <h2 className="text-lg font-bold mb-4 border-b border-outline-variant pb-2">Actions</h2>
              
              {selectedOrder.status !== 'CANCELLED' ? (
                <div className="mb-6">
                  <label className="text-xs font-bold text-error uppercase mb-2 block">Cancel Order</label>
                  <input 
                    type="text" 
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation..." 
                    className="w-full mb-2 border border-outline rounded-lg px-3 py-2 text-sm bg-surface focus:border-error outline-none"
                  />
                  <button 
                    onClick={handleCancelOrder}
                    disabled={!cancelReason}
                    className="w-full px-4 py-2 bg-error/10 text-error font-bold text-sm rounded-lg hover:bg-error hover:text-on-error transition-colors disabled:opacity-50"
                  >
                    Cancel & Restore Stock
                  </button>
                </div>
              ) : (
                <div className="mb-6 bg-error-container text-on-error-container p-3 rounded-lg text-sm">
                  <p className="font-bold mb-1">Order Cancelled</p>
                  <p className="text-xs">Reason: {selectedOrder.cancelledReason}</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-outline-variant">
                <label className="text-xs font-bold text-info uppercase mb-2 block">Process Refund</label>
                {selectedOrder.refundStatus !== 'COMPLETED' ? (
                  <>
                    <input 
                      type="number" 
                      value={refundAmount}
                      onChange={e => setRefundAmount(e.target.value)}
                      placeholder="Refund Amount (₹)" 
                      className="w-full mb-2 border border-outline rounded-lg px-3 py-2 text-sm bg-surface"
                    />
                    <input 
                      type="text" 
                      value={refundReason}
                      onChange={e => setRefundReason(e.target.value)}
                      placeholder="Refund Reason" 
                      className="w-full mb-2 border border-outline rounded-lg px-3 py-2 text-sm bg-surface"
                    />
                    <button 
                      onClick={handleRefund}
                      disabled={!refundAmount || !refundReason}
                      className="w-full px-4 py-2 border border-info text-info font-bold text-sm rounded-lg hover:bg-info hover:text-on-info transition-colors disabled:opacity-50"
                    >
                      Mark as Refunded
                    </button>
                  </>
                ) : (
                  <div className="bg-success/10 text-success p-3 rounded-lg text-sm">
                    <p className="font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Refund Completed</p>
                    <p className="text-xs mt-1">Amount: ₹{selectedOrder.refundAmount}</p>
                    <p className="text-xs">Reason: {selectedOrder.refundReason}</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Orders</h1>
          <p className="text-sm text-on-surface-variant">Manage customer orders, track shipments, and handle refunds.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border ${
                statusFilter === st 
                  ? 'bg-primary text-on-primary border-primary' 
                  : 'bg-surface text-on-surface-variant border-outline hover:bg-surface-container'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search Order ID, Name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-outline rounded-lg bg-surface text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-outline-variant rounded-2xl bg-surface text-on-surface-variant">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-bold">No orders found.</p>
        </div>
      ) : (
        <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-black">Order ID</th>
                  <th className="px-6 py-4 font-black">Customer</th>
                  <th className="px-6 py-4 font-black">Date</th>
                  <th className="px-6 py-4 font-black">Status</th>
                  <th className="px-6 py-4 font-black">Total</th>
                  <th className="px-6 py-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4 font-bold">#{order.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold">{order.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-on-surface-variant">{order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 font-black text-primary">
                      ₹{Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 text-xs font-bold border border-outline rounded-lg hover:bg-surface-container text-on-surface"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { 
  Loader2, Search, Filter, Users, ShieldAlert,
  ArrowRight, Download, CheckCircle, XCircle, Ban
} from "lucide-react";

export default function AdminCustomers() {
  const { token } = useAuthStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [blacklistFilter, setBlacklistFilter] = useState("ALL"); // ALL, ACTIVE, BLACKLISTED
  
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [blacklistReason, setBlacklistReason] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCustomers();
  }, [token]);

  const fetchCustomerDetails = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch customer details");
      const data = await res.json();
      setSelectedCustomer(data);
      setBlacklistReason(data.blacklistReason || "");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBlacklistToggle = async (isBlacklisted: boolean) => {
    if (isBlacklisted && !blacklistReason) return alert("Reason is required to blacklist.");
    try {
      const res = await fetch(`/api/admin/customers/${selectedCustomer.id}/blacklist`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isBlacklisted, blacklistReason: isBlacklisted ? blacklistReason : null })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedCustomer({ ...selectedCustomer, isBlacklisted: updated.isBlacklisted, blacklistReason: updated.blacklistReason });
        fetchCustomers();
        if (!isBlacklisted) setBlacklistReason("");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Name,Email,Join Date,Total Orders,Total Spent,Blacklisted\n"
      + customers.map(c => `${c.id},${c.name},${c.email},${new Date(c.createdAt).toLocaleDateString()},${c.totalOrders},${c.totalSpent},${c.isBlacklisted}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesBlacklist = 
      blacklistFilter === "ALL" || 
      (blacklistFilter === "BLACKLISTED" && c.isBlacklisted) ||
      (blacklistFilter === "ACTIVE" && !c.isBlacklisted);
      
    return matchesSearch && matchesBlacklist;
  });

  if (selectedCustomer) {
    return (
      <div className="w-full max-w-[1280px] mx-auto p-6">
        <button 
          onClick={() => setSelectedCustomer(null)}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Customers
        </button>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{selectedCustomer.name}</h1>
            <p className="text-sm text-on-surface-variant">
              Customer since {new Date(selectedCustomer.createdAt).toLocaleDateString()}
            </p>
          </div>
          {selectedCustomer.isBlacklisted && (
            <span className="bg-error text-on-error px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
              <Ban className="w-4 h-4" /> Blacklisted
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant">
              <h2 className="text-lg font-bold mb-4 border-b border-outline-variant pb-2">Order History</h2>
              {selectedCustomer.orders?.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-4">No orders placed yet.</p>
              ) : (
                <div className="space-y-4">
                  {selectedCustomer.orders?.map((order: any) => (
                    <div key={order.id} className="flex justify-between items-center py-2 border-b border-outline-variant/50 last:border-0">
                      <div>
                        <p className="font-bold">Order #{order.id}</p>
                        <p className="text-xs text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{Number(order.totalAmount).toFixed(2)}</p>
                        <p className="text-xs text-on-surface-variant">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant">
              <h2 className="text-lg font-bold mb-4 border-b border-outline-variant pb-2">Contact Info</h2>
              <p className="text-sm mb-2"><span className="font-bold text-on-surface-variant">Email:</span> {selectedCustomer.email}</p>
              <p className="text-sm"><span className="font-bold text-on-surface-variant">User ID:</span> {selectedCustomer.id}</p>
            </div>
            
            <div className="bg-surface p-6 rounded-2xl border border-outline-variant">
              <h2 className="text-lg font-bold mb-4 border-b border-outline-variant pb-2">Account Status</h2>
              {!selectedCustomer.isBlacklisted ? (
                <div>
                  <p className="text-sm mb-4">Account is currently active and can place orders.</p>
                  <label className="text-xs font-bold text-error uppercase mb-2 block">Blacklist Customer</label>
                  <input 
                    type="text" 
                    value={blacklistReason}
                    onChange={e => setBlacklistReason(e.target.value)}
                    placeholder="Reason for blacklist..." 
                    className="w-full mb-2 border border-outline rounded-lg px-3 py-2 text-sm bg-surface focus:border-error outline-none"
                  />
                  <button 
                    onClick={() => handleBlacklistToggle(true)}
                    disabled={!blacklistReason}
                    className="w-full px-4 py-2 bg-error/10 text-error font-bold text-sm rounded-lg hover:bg-error hover:text-on-error transition-colors disabled:opacity-50"
                  >
                    Blacklist
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-4 bg-error-container text-on-error-container p-3 rounded-lg text-sm">
                    <p className="font-bold mb-1">Account Blacklisted</p>
                    <p className="text-xs">Reason: {selectedCustomer.blacklistReason}</p>
                  </div>
                  <button 
                    onClick={() => handleBlacklistToggle(false)}
                    className="w-full px-4 py-2 border border-outline text-on-surface font-bold text-sm rounded-lg hover:bg-surface-container transition-colors"
                  >
                    Remove from Blacklist
                  </button>
                </div>
              )}
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
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Customers</h1>
          <p className="text-sm text-on-surface-variant">Manage customer accounts and track order history.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-surface border border-outline hover:bg-surface-container text-on-surface px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {['ALL', 'ACTIVE', 'BLACKLISTED'].map(f => (
            <button
              key={f}
              onClick={() => setBlacklistFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold border ${
                blacklistFilter === f 
                  ? 'bg-primary text-on-primary border-primary' 
                  : 'bg-surface text-on-surface-variant border-outline hover:bg-surface-container'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search Name, Email..."
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
      ) : filteredCustomers.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-outline-variant rounded-2xl bg-surface text-on-surface-variant">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-bold">No customers found.</p>
        </div>
      ) : (
        <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-black">Customer</th>
                  <th className="px-6 py-4 font-black">Join Date</th>
                  <th className="px-6 py-4 font-black">Total Orders</th>
                  <th className="px-6 py-4 font-black">Total Spent</th>
                  <th className="px-6 py-4 font-black">Status</th>
                  <th className="px-6 py-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold">{c.name}</p>
                      <p className="text-xs text-on-surface-variant">{c.email}</p>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {c.totalOrders || 0}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      ₹{Number(c.totalSpent || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {c.isBlacklisted ? (
                        <span className="bg-error/10 text-error px-2 py-1 rounded text-xs font-bold uppercase">Blacklisted</span>
                      ) : (
                        <span className="bg-success/10 text-success px-2 py-1 rounded text-xs font-bold uppercase">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => fetchCustomerDetails(c.id)}
                        className="px-3 py-1.5 text-xs font-bold border border-outline rounded-lg hover:bg-surface-container text-on-surface"
                      >
                        View Profile
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

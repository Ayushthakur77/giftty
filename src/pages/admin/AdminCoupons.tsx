import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { 
  Loader2, Plus, Edit, Trash2, ShieldAlert, CheckCircle, Search, 
  Tag, Calendar, Percent, IndianRupee, Gift, AlertCircle 
} from "lucide-react";

export default function AdminCoupons() {
  const { token } = useAuthStore();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENT", // PERCENT, FLAT, FREE_SHIPPING
    discountValue: "10",
    expiryDate: "",
    usageLimit: "",
    minOrderValue: "",
    maxDiscount: "",
    applicableCategoryIds: [] as number[],
    applicableProductIds: [] as number[],
    customerRestriction: "ALL", // ALL, NEW_CUSTOMERS_ONLY
    isFestivalCoupon: false
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [couponsRes, catsRes, prodsRes] = await Promise.all([
        fetch("/api/admin/coupons", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/categories"),
        fetch("/api/admin/inventory", { headers: { "Authorization": `Bearer ${token}` } }) // Reuses inventory route to get all products with images
      ]);

      if (!couponsRes.ok) throw new Error("Failed to load coupons");
      const couponsData = await couponsRes.json();
      setCoupons(Array.isArray(couponsData) ? couponsData : []);

      if (catsRes.ok) {
        const catsData = await catsRes.json();
        setCategories(Array.isArray(catsData) ? catsData : []);
      }
      if (prodsRes.ok) {
        const prodsData = await prodsRes.json();
        setProductsList(Array.isArray(prodsData) ? prodsData : []);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const showSuccessMsg = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleOpenForm = (coupon: any = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      // Format date for input field: YYYY-MM-DD
      const dateVal = coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : "";
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: String(coupon.discountValue),
        expiryDate: dateVal,
        usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
        minOrderValue: coupon.minOrderValue ? String(coupon.minOrderValue) : "",
        maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
        applicableCategoryIds: coupon.applicableCategoryIds || [],
        applicableProductIds: coupon.applicableProductIds || [],
        customerRestriction: coupon.customerRestriction || "ALL",
        isFestivalCoupon: !!coupon.isFestivalCoupon
      });
    } else {
      setEditingCoupon(null);
      // Set tomorrow's date by default
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7);
      setFormData({
        code: "",
        discountType: "PERCENT",
        discountValue: "10",
        expiryDate: tomorrow.toISOString().split('T')[0],
        usageLimit: "",
        minOrderValue: "",
        maxDiscount: "",
        applicableCategoryIds: [],
        applicableProductIds: [],
        customerRestriction: "ALL",
        isFestivalCoupon: false
      });
    }
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingCoupon ? `/api/admin/coupons/${editingCoupon.id}` : "/api/admin/coupons";
      const method = editingCoupon ? "PUT" : "POST";
      
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: String(formData.discountValue),
        expiryDate: new Date(formData.expiryDate).toISOString(),
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        minOrderValue: formData.minOrderValue ? String(formData.minOrderValue) : null,
        maxDiscount: formData.maxDiscount ? String(formData.maxDiscount) : null,
        applicableCategoryIds: formData.applicableCategoryIds,
        applicableProductIds: formData.applicableProductIds
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save coupon");
      }

      setShowFormModal(false);
      showSuccessMsg(editingCoupon ? "Coupon updated successfully!" : "New coupon code published!");
      fetchData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate and delete this coupon?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete coupon");
      showSuccessMsg("Coupon successfully deleted.");
      fetchData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleCategoryInList = (catId: number) => {
    const list = formData.applicableCategoryIds;
    if (list.includes(catId)) {
      setFormData({
        ...formData,
        applicableCategoryIds: list.filter(id => id !== catId)
      });
    } else {
      setFormData({
        ...formData,
        applicableCategoryIds: [...list, catId]
      });
    }
  };

  const toggleProductInList = (prodId: number) => {
    const list = formData.applicableProductIds;
    if (list.includes(prodId)) {
      setFormData({
        ...formData,
        applicableProductIds: list.filter(id => id !== prodId)
      });
    } else {
      setFormData({
        ...formData,
        applicableProductIds: [...list, prodId]
      });
    }
  };

  const filteredCoupons = coupons.filter(c => {
    return c.code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full max-w-[1280px] mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Coupon & Campaign Rules</h1>
          <p className="text-sm text-on-surface-variant">Create coupon campaign codes, category limitations, and order discounts.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="px-4 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Coupon
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex justify-end items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search coupon codes..."
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

      {success && (
        <div className="mb-6 p-4 bg-success-container text-on-success-container rounded-xl border border-success/30 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{success}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-outline-variant rounded-2xl bg-surface">
          <Tag className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">No coupons available</h3>
          <p className="text-xs text-on-surface-variant mb-4">You have not launched any active campaigns yet.</p>
          <button onClick={() => handleOpenForm()} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold">
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => {
            const isExpired = new Date(coupon.expiryDate).getTime() < Date.now();
            return (
              <div 
                key={coupon.id} 
                className={`bg-surface p-5 rounded-2xl border ${isExpired ? 'border-outline-variant opacity-80' : 'border-outline-variant'} shadow-sm flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />
                      <span className="text-lg font-black tracking-wider text-on-surface uppercase">{coupon.code}</span>
                    </div>
                    {isExpired ? (
                      <span className="bg-error/10 text-error text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Expired</span>
                    ) : (
                      <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Active</span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-black text-primary">
                      {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    </span>
                    <span className="text-xs text-on-surface-variant font-bold uppercase">
                      {coupon.discountType === 'PERCENT' ? "Off Percent" : "Flat Discount"}
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-b border-outline-variant/60 py-3 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-medium">Times Redeemed:</span>
                      <span className="font-bold text-on-surface">
                        {coupon.timesUsed} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "(No Limit)"}
                      </span>
                    </div>
                    {coupon.minOrderValue && (
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant font-medium">Min Order:</span>
                        <span className="font-bold text-on-surface">₹{coupon.minOrderValue}</span>
                      </div>
                    )}
                    {coupon.maxDiscount && coupon.discountType === 'PERCENT' && (
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant font-medium">Max Limit:</span>
                        <span className="font-bold text-on-surface">₹{coupon.maxDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-medium">Ends Date:</span>
                      <span className="font-bold text-on-surface">
                        {new Date(coupon.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    {(coupon.applicableCategoryIds?.length > 0 || coupon.applicableProductIds?.length > 0) && (
                      <div className="pt-1.5 flex flex-col gap-1">
                        <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-wider">Restrictions active:</span>
                        <span className="bg-warning/10 text-warning text-[10px] px-2 py-0.5 rounded font-bold w-fit">
                          Limited Products/Categories ({coupon.applicableCategoryIds?.length || 0} categories, {coupon.applicableProductIds?.length || 0} products)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button 
                    onClick={() => handleOpenForm(coupon)}
                    className="px-3 py-1.5 text-xs font-bold border border-outline rounded-lg text-on-surface hover:bg-surface-container flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Coupon
                  </button>
                  <button 
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="px-3 py-1.5 text-xs font-bold border border-outline rounded-lg text-error hover:bg-error-container flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl max-w-lg w-full p-6 border border-outline shadow-2xl relative max-h-[90vh] flex flex-col">
            <h2 className="text-lg font-bold mb-4 flex-shrink-0">
              {editingCoupon ? "Edit Coupon Campaign" : "Create Coupon Campaign"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Promo Code (Unique)</label>
                  <input 
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g. WELCOME100, DIWALI50"
                    className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none font-black tracking-widest text-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Expiry Date</label>
                  <input 
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Discount Type</label>
                  <select 
                    value={formData.discountType}
                    onChange={e => setFormData({...formData, discountType: e.target.value})}
                    className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none"
                  >
                    <option value="PERCENT">PERCENT (%)</option>
                    <option value="FLAT">FLAT AMOUNT (₹)</option>
                    <option value="FREE_SHIPPING">FREE SHIPPING</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Discount Value</label>
                  <input 
                    type="number"
                    min="0"
                    value={formData.discountValue}
                    onChange={e => setFormData({...formData, discountValue: e.target.value})}
                    className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none font-bold"
                    required
                    disabled={formData.discountType === 'FREE_SHIPPING'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Usage Limit</label>
                  <input 
                    type="number"
                    min="1"
                    placeholder="No limit"
                    value={formData.usageLimit}
                    onChange={e => setFormData({...formData, usageLimit: e.target.value})}
                    className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Min Order (₹)</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="No minimum"
                    value={formData.minOrderValue}
                    onChange={e => setFormData({...formData, minOrderValue: e.target.value})}
                    className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Max Cap (₹)</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="No maximum"
                    value={formData.maxDiscount}
                    onChange={e => setFormData({...formData, maxDiscount: e.target.value})}
                    className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none"
                    disabled={formData.discountType !== 'PERCENT'}
                  />
                </div>
              </div>

              {/* Restrictions lists */}
              <div className="border-t border-outline-variant/60 pt-3">
                <span className="block text-xs font-black text-on-surface-variant uppercase tracking-wider mb-2">Category Exclusions (Optional)</span>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border border-outline-variant rounded-lg bg-surface-container-low">
                  {categories.map((cat) => {
                    const selected = formData.applicableCategoryIds.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => toggleCategoryInList(cat.id)}
                        className={`px-2.5 py-1 rounded text-xs border font-semibold flex items-center gap-1 transition-all ${
                          selected 
                            ? 'bg-primary text-on-primary border-primary' 
                            : 'bg-surface border-outline-variant hover:bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="block text-xs font-black text-on-surface-variant uppercase tracking-wider mb-2">Product Exclusions (Optional)</span>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-outline-variant rounded-lg bg-surface-container-low">
                  {productsList.map((prod) => {
                    const selected = formData.applicableProductIds.includes(prod.id);
                    return (
                      <button
                        type="button"
                        key={prod.id}
                        onClick={() => toggleProductInList(prod.id)}
                        className={`px-2 py-0.5 rounded text-xs border font-semibold flex items-center gap-1 transition-all ${
                          selected 
                            ? 'bg-primary text-on-primary border-primary' 
                            : 'bg-surface border-outline-variant hover:bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {prod.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4 pt-2 border-t border-outline-variant/60">
                <label className="flex items-center gap-2 font-semibold">
                  <input 
                    type="checkbox"
                    checked={formData.isFestivalCoupon}
                    onChange={e => setFormData({...formData, isFestivalCoupon: e.target.checked})}
                    className="rounded text-primary border-outline focus:ring-0"
                  />
                  Mark as Festival Event Promo Code
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant flex-shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-outline rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

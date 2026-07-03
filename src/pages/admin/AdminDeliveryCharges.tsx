import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { 
  Loader2, Plus, Edit, Trash2, ShieldAlert, CheckCircle, XCircle, 
  Settings, Truck, Gift, Calendar, HelpCircle, MapPin 
} from "lucide-react";

export default function AdminDeliveryCharges() {
  const { token } = useAuthStore();
  const [activeSubTab, setActiveSubTab] = useState<"zones" | "rules" | "holidays">("zones");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // States
  const [zones, setZones] = useState<any[]>([]);
  const [shippingRules, setShippingRules] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);

  // Modals / Forms state
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [zoneForm, setZoneForm] = useState({
    state: "Maharashtra",
    city: "",
    pincode: "",
    charge: "50",
    estimatedDays: 5,
    isCodAvailable: true,
    isExpressAvailable: false,
    isSameDayAvailable: false,
    isDeliverable: true
  });

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    name: "",
    minOrderValue: "999",
    appliesToStates: [] as string[],
    isActive: true
  });
  const [ruleStateInput, setRuleStateInput] = useState("");

  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    date: "",
    description: "",
    appliesToStates: [] as string[]
  });
  const [holidayStateInput, setHolidayStateInput] = useState("");

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCharge, setBulkCharge] = useState("50");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [zonesRes, rulesRes, holidaysRes] = await Promise.all([
        fetch("/api/admin/delivery-zones", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/admin/shipping-rules", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/admin/delivery-holidays", { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (!zonesRes.ok || !rulesRes.ok || !holidaysRes.ok) {
        throw new Error("Failed to fetch delivery management data");
      }

      const [zonesData, rulesData, holidaysData] = await Promise.all([
        zonesRes.json(),
        rulesRes.json(),
        holidaysRes.json()
      ]);

      setZones(zonesData);
      setShippingRules(rulesData);
      setHolidays(holidaysData);
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

  // ZONES ACTIONS
  const handleOpenZoneModal = (zone: any = null) => {
    if (zone) {
      setEditingZone(zone);
      setZoneForm({
        state: zone.state,
        city: zone.city || "",
        pincode: zone.pincode || "",
        charge: zone.charge,
        estimatedDays: zone.estimatedDays || 5,
        isCodAvailable: zone.isCodAvailable,
        isExpressAvailable: zone.isExpressAvailable,
        isSameDayAvailable: zone.isSameDayAvailable,
        isDeliverable: zone.isDeliverable
      });
    } else {
      setEditingZone(null);
      setZoneForm({
        state: "Maharashtra",
        city: "",
        pincode: "",
        charge: "50",
        estimatedDays: 5,
        isCodAvailable: true,
        isExpressAvailable: false,
        isSameDayAvailable: false,
        isDeliverable: true
      });
    }
    setShowZoneModal(true);
  };

  const handleZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingZone ? `/api/admin/delivery-zones/${editingZone.id}` : "/api/admin/delivery-zones";
      const method = editingZone ? "PUT" : "POST";
      const payload = {
        ...zoneForm,
        city: zoneForm.city.trim() || null,
        pincode: zoneForm.pincode.trim() || null
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save delivery zone");
      setShowZoneModal(false);
      showSuccessMsg(editingZone ? "Delivery zone updated successfully!" : "New delivery zone added!");
      fetchData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteZone = async (id: number) => {
    if (!confirm("Are you sure you want to delete this delivery zone?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/delivery-zones/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete zone");
      showSuccessMsg("Delivery zone deleted.");
      fetchData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // BULK ACTIONS
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSubmitting(true);
    try {
      const res = await fetch("/api/admin/delivery-zones/bulk-default", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ defaultCharge: Number(bulkCharge) })
      });
      if (!res.ok) throw new Error("Failed to bulk create default rates");
      const result = await res.json();
      setShowBulkModal(false);
      showSuccessMsg(`Successfully configured default rates for ${result.addedCount} states!`);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBulkSubmitting(false);
    }
  };

  // SHIPPING RULES ACTIONS
  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...ruleForm,
        minOrderValue: ruleForm.minOrderValue ? String(ruleForm.minOrderValue) : null,
        appliesToStates: ruleForm.appliesToStates.length > 0 ? ruleForm.appliesToStates : null
      };
      const res = await fetch("/api/admin/shipping-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save shipping rule");
      setShowRuleModal(false);
      showSuccessMsg("Free shipping rule created!");
      fetchData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm("Are you sure you want to delete this shipping rule?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shipping-rules/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete rule");
      showSuccessMsg("Shipping rule deleted.");
      fetchData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const addStateToRule = () => {
    if (!ruleStateInput.trim()) return;
    if (!ruleForm.appliesToStates.includes(ruleStateInput.trim())) {
      setRuleForm({
        ...ruleForm,
        appliesToStates: [...ruleForm.appliesToStates, ruleStateInput.trim()]
      });
    }
    setRuleStateInput("");
  };

  const removeStateFromRule = (st: string) => {
    setRuleForm({
      ...ruleForm,
      appliesToStates: ruleForm.appliesToStates.filter(s => s !== st)
    });
  };

  // HOLIDAY ACTIONS
  const handleHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...holidayForm,
        appliesToStates: holidayForm.appliesToStates.length > 0 ? holidayForm.appliesToStates : null
      };
      const res = await fetch("/api/admin/delivery-holidays", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save holiday");
      setShowHolidayModal(false);
      showSuccessMsg("Holiday added successfully!");
      fetchData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    if (!confirm("Are you sure you want to delete this holiday rule?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/delivery-holidays/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete holiday");
      showSuccessMsg("Holiday removed.");
      fetchData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const addStateToHoliday = () => {
    if (!holidayStateInput.trim()) return;
    if (!holidayForm.appliesToStates.includes(holidayStateInput.trim())) {
      setHolidayForm({
        ...holidayForm,
        appliesToStates: [...holidayForm.appliesToStates, holidayStateInput.trim()]
      });
    }
    setHolidayStateInput("");
  };

  const removeStateFromHoliday = (st: string) => {
    setHolidayForm({
      ...holidayForm,
      appliesToStates: holidayForm.appliesToStates.filter(s => s !== st)
    });
  };

  const INDIAN_STATES_LIST = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
  ];

  return (
    <div className="w-full max-w-[1280px] mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Delivery & Shipping Rules</h1>
          <p className="text-sm text-on-surface-variant">Configure deliverable zones, free shipping limits, and holiday schedules.</p>
        </div>
      </div>

      {/* Sub tabs switcher */}
      <div className="flex border-b border-outline-variant gap-4 mb-6">
        <button 
          onClick={() => setActiveSubTab("zones")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeSubTab === "zones" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
        >
          <Truck className="w-4 h-4" />
          Delivery Zones ({zones.length})
        </button>
        <button 
          onClick={() => setActiveSubTab("rules")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeSubTab === "rules" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
        >
          <Gift className="w-4 h-4" />
          Free Shipping Rules ({shippingRules.length})
        </button>
        <button 
          onClick={() => setActiveSubTab("holidays")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeSubTab === "holidays" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
        >
          <Calendar className="w-4 h-4" />
          Holiday Dispatch Pauses ({holidays.length})
        </button>
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
      ) : (
        <>
          {/* TAB 1: DELIVERY ZONES */}
          {activeSubTab === "zones" && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <p className="text-xs text-on-surface-variant max-w-xl">
                  Define shipping rates and capabilities (COD, Express) state-wide, or define specific postal code overlays to enforce precision.
                </p>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button 
                    onClick={() => setShowBulkModal(true)}
                    className="px-4 py-2 border border-outline rounded-lg text-xs font-bold hover:bg-surface-container flex items-center gap-1.5"
                  >
                    <Settings className="w-4 h-4" />
                    Set Default for All States
                  </button>
                  <button 
                    onClick={() => handleOpenZoneModal()}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Zone Rate
                  </button>
                </div>
              </div>

              {zones.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-outline-variant rounded-2xl bg-surface">
                  <Truck className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-1">No Delivery Zones configured</h3>
                  <p className="text-xs text-on-surface-variant mb-4">You have not registered any deliverable regions.</p>
                  <button onClick={() => setShowBulkModal(true)} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold">
                    Configure Indian Default Rates Now
                  </button>
                </div>
              ) : (
                <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container border-b border-outline-variant text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          <th className="p-4 pl-6">Region</th>
                          <th className="p-4 text-center">Shipping Charge</th>
                          <th className="p-4 text-center">COD</th>
                          <th className="p-4 text-center">Express</th>
                          <th className="p-4 text-center">Same-Day</th>
                          <th className="p-4 text-center">Est. Delivery</th>
                          <th className="p-4 text-center">Deliverable</th>
                          <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant text-sm">
                        {zones.map((zone) => (
                          <tr key={zone.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="p-4 pl-6">
                              <div className="font-bold text-on-surface">{zone.state}</div>
                              <div className="text-xs text-on-surface-variant font-medium mt-0.5">
                                {zone.city ? `City: ${zone.city}` : "All Cities"}
                                {zone.pincode ? ` • Pincode: ${zone.pincode}` : " • All Pincodes"}
                              </div>
                            </td>
                            <td className="p-4 text-center font-bold text-primary">
                              ₹{zone.charge}
                            </td>
                            <td className="p-4 text-center">
                              {zone.isCodAvailable ? (
                                <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">Yes</span>
                              ) : (
                                <span className="bg-error/10 text-error text-[10px] font-bold px-2 py-0.5 rounded-full">No</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {zone.isExpressAvailable ? (
                                <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">Yes</span>
                              ) : (
                                <span className="bg-on-surface-variant/10 text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">No</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {zone.isSameDayAvailable ? (
                                <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">Yes</span>
                              ) : (
                                <span className="bg-on-surface-variant/10 text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">No</span>
                              )}
                            </td>
                            <td className="p-4 text-center font-semibold">
                              {zone.estimatedDays} days
                            </td>
                            <td className="p-4 text-center">
                              {zone.isDeliverable ? (
                                <span className="text-success flex items-center justify-center gap-1 text-xs font-bold">
                                  <CheckCircle className="w-4 h-4" /> Active
                                </span>
                              ) : (
                                <span className="text-error flex items-center justify-center gap-1 text-xs font-bold">
                                  <XCircle className="w-4 h-4" /> Blocked
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right pr-6">
                              <div className="flex justify-end gap-1.5">
                                <button 
                                  onClick={() => handleOpenZoneModal(zone)}
                                  className="p-1.5 border border-outline rounded-lg text-on-surface hover:bg-surface-container"
                                  title="Edit Zone"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteZone(zone.id)}
                                  className="p-1.5 border border-outline rounded-lg text-error hover:bg-error-container"
                                  title="Delete Zone"
                                >
                                  <Trash2 className="w-4 h-4" />
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
            </div>
          )}

          {/* TAB 2: SHIPPING RULES */}
          {activeSubTab === "rules" && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <p className="text-xs text-on-surface-variant max-w-xl">
                  Set triggers for free delivery. When active, customers meeting the threshold will not be charged shipping fees.
                </p>
                <button 
                  onClick={() => {
                    setRuleForm({ name: "", minOrderValue: "999", appliesToStates: [], isActive: true });
                    setShowRuleModal(true);
                  }}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Free Shipping Rule
                </button>
              </div>

              {shippingRules.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-outline-variant rounded-2xl bg-surface">
                  <Gift className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-1">No Free Shipping rules</h3>
                  <p className="text-xs text-on-surface-variant">Click "Add Free Shipping Rule" to set thresholds.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shippingRules.map((rule) => (
                    <div key={rule.id} className="bg-surface p-5 rounded-2xl border border-outline-variant shadow-sm relative flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-base font-bold text-on-surface">{rule.name}</h3>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rule.isActive ? 'bg-success/15 text-success' : 'bg-on-surface-variant/15 text-on-surface-variant'}`}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-2xl font-black text-primary mb-3">
                          Min Order: ₹{rule.minOrderValue || "0.00"}
                        </p>
                        <div className="mb-4">
                          <span className="text-xs font-bold text-on-surface-variant block mb-1">Applicable Regions:</span>
                          {rule.appliesToStates && rule.appliesToStates.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {rule.appliesToStates.map((st: string) => (
                                <span key={st} className="bg-surface-container px-2 py-0.5 rounded-md text-xs border border-outline-variant text-on-surface-variant font-medium">
                                  {st}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-success flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Pan-India (All States)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-outline-variant">
                        <button 
                          onClick={() => handleDeleteRule(rule.id)}
                          className="px-3 py-1.5 text-xs text-error font-bold border border-outline rounded-lg hover:bg-error-container flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Rule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HOLIDAYS */}
          {activeSubTab === "holidays" && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <p className="text-xs text-on-surface-variant max-w-xl">
                  Register public or warehouse holiday dates. Our checkout system will dynamically adjust shipping duration estimates to account for transit pauses.
                </p>
                <button 
                  onClick={() => {
                    setHolidayForm({ date: "", description: "", appliesToStates: [] });
                    setShowHolidayModal(true);
                  }}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Schedule Delivery Holiday
                </button>
              </div>

              {holidays.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-outline-variant rounded-2xl bg-surface">
                  <Calendar className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-1">No holidays scheduled</h3>
                  <p className="text-xs text-on-surface-variant">Add warehouse holidays to adjust user transit calculations.</p>
                </div>
              ) : (
                <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container border-b border-outline-variant text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                        <th className="p-4 pl-6">Holiday Date</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Applies To</th>
                        <th className="p-4 text-right pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant text-sm">
                      {holidays.map((hol) => (
                        <tr key={hol.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="p-4 pl-6 font-bold text-on-surface">
                            {new Date(hol.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                          </td>
                          <td className="p-4 text-on-surface-variant font-medium">{hol.description}</td>
                          <td className="p-4">
                            {hol.appliesToStates && hol.appliesToStates.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {hol.appliesToStates.map((s: string) => (
                                  <span key={s} className="bg-surface-container px-2 py-0.5 rounded text-[10px] border border-outline-variant font-semibold">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-primary uppercase">All States (Pan-India)</span>
                            )}
                          </td>
                          <td className="p-4 text-right pr-6">
                            <button 
                              onClick={() => handleDeleteHoliday(hol.id)}
                              className="p-1.5 border border-outline rounded-lg text-error hover:bg-error-container"
                              title="Delete Holiday"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ZONE MODAL */}
      {showZoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 border border-outline shadow-2xl relative">
            <h2 className="text-lg font-bold mb-4">{editingZone ? "Edit Delivery Zone" : "Add Delivery Zone"}</h2>

            <form onSubmit={handleZoneSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">State</label>
                <select 
                  value={zoneForm.state}
                  onChange={e => setZoneForm({...zoneForm, state: e.target.value})}
                  className="w-full p-2 text-sm border border-outline rounded-lg bg-surface focus:outline-none"
                >
                  {INDIAN_STATES_LIST.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">City (Optional override)</label>
                  <input 
                    type="text"
                    value={zoneForm.city}
                    onChange={e => setZoneForm({...zoneForm, city: e.target.value})}
                    placeholder="e.g. Mumbai"
                    className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Pincode (Optional overlay)</label>
                  <input 
                    type="text"
                    value={zoneForm.pincode}
                    onChange={e => setZoneForm({...zoneForm, pincode: e.target.value})}
                    placeholder="e.g. 400001"
                    className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Charge Amount (₹)</label>
                  <input 
                    type="number"
                    min="0"
                    value={zoneForm.charge}
                    onChange={e => setZoneForm({...zoneForm, charge: e.target.value})}
                    className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Est. Days</label>
                  <input 
                    type="number"
                    min="1"
                    value={zoneForm.estimatedDays}
                    onChange={e => setZoneForm({...zoneForm, estimatedDays: Number(e.target.value)})}
                    className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-outline-variant">
                <label className="flex items-center gap-2 font-semibold">
                  <input 
                    type="checkbox"
                    checked={zoneForm.isCodAvailable}
                    onChange={e => setZoneForm({...zoneForm, isCodAvailable: e.target.checked})}
                    className="rounded text-primary border-outline focus:ring-0"
                  />
                  Allow Cash on Delivery (COD)
                </label>
                <label className="flex items-center gap-2 font-semibold">
                  <input 
                    type="checkbox"
                    checked={zoneForm.isExpressAvailable}
                    onChange={e => setZoneForm({...zoneForm, isExpressAvailable: e.target.checked})}
                    className="rounded text-primary border-outline focus:ring-0"
                  />
                  Express Shipping available
                </label>
                <label className="flex items-center gap-2 font-semibold">
                  <input 
                    type="checkbox"
                    checked={zoneForm.isSameDayAvailable}
                    onChange={e => setZoneForm({...zoneForm, isSameDayAvailable: e.target.checked})}
                    className="rounded text-primary border-outline focus:ring-0"
                  />
                  Same-Day delivery available
                </label>
                <label className="flex items-center gap-2 font-semibold text-success">
                  <input 
                    type="checkbox"
                    checked={zoneForm.isDeliverable}
                    onChange={e => setZoneForm({...zoneForm, isDeliverable: e.target.checked})}
                    className="rounded text-success border-outline focus:ring-0"
                  />
                  Deliverable (Uncheck to block shipping to this zone entirely)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button 
                  type="button"
                  onClick={() => setShowZoneModal(false)}
                  className="px-4 py-2 border border-outline rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90"
                >
                  Save Zone Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 border border-outline shadow-2xl relative">
            <h2 className="text-lg font-bold mb-2">Set Default State Shipping Fee</h2>
            <p className="text-xs text-on-surface-variant mb-4">
              Apply a generic shipping rate to every Indian state that is not explicitly configured yet. Custom city and pincode overrides will remain untouched.
            </p>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Default Flat Rate (₹)</label>
                <input 
                  type="number"
                  min="0"
                  value={bulkCharge}
                  onChange={e => setBulkCharge(e.target.value)}
                  className="w-full p-2.5 border border-outline rounded-lg bg-surface focus:outline-none text-base font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 border border-outline rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={bulkSubmitting}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                >
                  {bulkSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generate Defaults
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RULE MODAL */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 border border-outline shadow-2xl relative">
            <h2 className="text-lg font-bold mb-4 font-sans tracking-tight">Create Free Shipping Rule</h2>

            <form onSubmit={handleRuleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Rule Name</label>
                <input 
                  type="text"
                  value={ruleForm.name}
                  onChange={e => setRuleForm({...ruleForm, name: e.target.value})}
                  placeholder="e.g. Monsoon Free Shipping Promo, Festive Pan-India Free Delivery"
                  className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Minimum Order Threshold (₹)</label>
                <input 
                  type="number"
                  min="0"
                  value={ruleForm.minOrderValue}
                  onChange={e => setRuleForm({...ruleForm, minOrderValue: e.target.value})}
                  className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Restrict to Specific States (Optional)</label>
                <div className="flex gap-2">
                  <select 
                    value={ruleStateInput}
                    onChange={e => setRuleStateInput(e.target.value)}
                    className="flex-1 p-2 border border-outline rounded-lg bg-surface focus:outline-none"
                  >
                    <option value="">Select state...</option>
                    {INDIAN_STATES_LIST.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={addStateToRule}
                    className="px-3 bg-secondary text-on-secondary rounded-lg text-xs font-bold hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
                {ruleForm.appliesToStates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 p-2 border border-dashed border-outline-variant rounded-lg bg-surface-container-low max-h-24 overflow-y-auto">
                    {ruleForm.appliesToStates.map(s => (
                      <span key={s} className="bg-surface px-2 py-0.5 rounded text-xs border border-outline-variant text-on-surface flex items-center gap-1 font-semibold">
                        {s}
                        <button type="button" onClick={() => removeStateFromRule(s)} className="text-error font-bold ml-1 hover:scale-110">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <span className="text-[10px] text-on-surface-variant mt-1 block">If no states are selected, the rule will apply to all orders nationwide.</span>
              </div>

              <div>
                <label className="flex items-center gap-2 font-semibold">
                  <input 
                    type="checkbox"
                    checked={ruleForm.isActive}
                    onChange={e => setRuleForm({...ruleForm, isActive: e.target.checked})}
                    className="rounded text-primary border-outline focus:ring-0"
                  />
                  Activate this rule immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button 
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 border border-outline rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HOLIDAY MODAL */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 border border-outline shadow-2xl relative">
            <h2 className="text-lg font-bold mb-4 font-sans tracking-tight">Schedule Dispatch Pauses</h2>

            <form onSubmit={handleHolidaySubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Holiday Date</label>
                <input 
                  type="date"
                  value={holidayForm.date}
                  onChange={e => setHolidayForm({...holidayForm, date: e.target.value})}
                  className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Holiday Description</label>
                <input 
                  type="text"
                  value={holidayForm.description}
                  onChange={e => setHolidayForm({...holidayForm, description: e.target.value})}
                  placeholder="e.g. Diwali National Holiday, Warehouse Annual Maintenance"
                  className="w-full p-2 border border-outline rounded-lg bg-surface focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-on-surface-variant uppercase tracking-wider">Holiday Applies To (Optional)</label>
                <div className="flex gap-2">
                  <select 
                    value={holidayStateInput}
                    onChange={e => setHolidayStateInput(e.target.value)}
                    className="flex-1 p-2 border border-outline rounded-lg bg-surface focus:outline-none"
                  >
                    <option value="">Select state...</option>
                    {INDIAN_STATES_LIST.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={addStateToHoliday}
                    className="px-3 bg-secondary text-on-secondary rounded-lg text-xs font-bold hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
                {holidayForm.appliesToStates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 p-2 border border-dashed border-outline-variant rounded-lg bg-surface-container-low max-h-24 overflow-y-auto">
                    {holidayForm.appliesToStates.map(s => (
                      <span key={s} className="bg-surface px-2 py-0.5 rounded text-xs border border-outline-variant text-on-surface flex items-center gap-1 font-semibold">
                        {s}
                        <button type="button" onClick={() => removeStateFromHoliday(s)} className="text-error font-bold ml-1 hover:scale-110">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <span className="text-[10px] text-on-surface-variant mt-1 block">If no states are specified, transit pauses apply to all dispatch channels.</span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button 
                  type="button"
                  onClick={() => setShowHolidayModal(false)}
                  className="px-4 py-2 border border-outline rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90"
                >
                  Schedule Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

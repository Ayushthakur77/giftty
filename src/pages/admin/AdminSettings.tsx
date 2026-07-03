import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader2, Save } from "lucide-react";

export default function AdminSettings() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'store' | 'ai' | 'payments' | 'security'>('store');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: "",
    store_logo: "",
    store_favicon: "",
    contact_email: "",
    contact_phone: "",
    business_address: "",
    social_instagram: "",
    social_facebook: "",
    tax_gst_number: "",
    currency: "INR",
    tax_percentage: "0",
    order_prefix: "ORD-",
    invoice_prefix: "INV-",
    email_template_order: "",
    ai_enabled: "true",
    ai_prompt_recommend: "",
    ai_prompt_greeting: "",
    ai_fallback_mode: "hide",
    razorpay_mode: "test",
    razorpay_webhook: "",
    refund_auto_approve: "false",

    session_timeout_minutes: "60",
    admin_mfa_enabled: "false"

  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const newSettings = { ...settings };
      data.forEach((s: any) => {
        if (s.key in newSettings || s.key.startsWith('razorpay_') || s.key.startsWith('ai_') || s.key === 'session_timeout_minutes' || s.key === 'admin_mfa_enabled') {
          newSettings[s.key] = s.value;
        }
      });
      setSettings(newSettings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSettings();
  }, [token]);

  const handleSave = async (group: string, keysToSave: string[]) => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      keysToSave.forEach(k => payload[k] = settings[k]);
      
      await fetch(`/api/admin/settings/${group}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword !== confirmPassword) {
      return setPasswordError("New passwords do not match.");
    }
    setSaving(true);
    try {
      // Import auth at top if not done, but we'll use dynamic import or assume window.firebase
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("../../lib/firebase");
      
      const email = useAuthStore.getState().user?.email || "";
      await signInWithEmailAndPassword(auth, email, currentPassword);
      
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      if (!res.ok) throw new Error("Failed to change password");
      
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.message || "Failed to change password. Check your current password.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (k: string, v: string) => {
    setSettings(prev => ({ ...prev, [k]: v }));
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b">
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'store' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('store')}
          >
            Store Settings
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'ai' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('ai')}
          >
            AI Settings
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'payments' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('payments')}
          >
            Payment Settings
          </button>

          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'security' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('security')}
          >
            Security Settings
          </button>

        </div>

        <div className="p-6">
          {activeTab === 'store' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                    <input type="text" value={settings.store_name} onChange={e => handleChange('store_name', e.target.value)} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select value={settings.currency} onChange={e => handleChange('currency', e.target.value)} className="w-full p-2 border rounded">
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                    <input type="text" value={settings.store_logo} onChange={e => handleChange('store_logo', e.target.value)} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                    <input type="text" value={settings.store_favicon} onChange={e => handleChange('store_favicon', e.target.value)} className="w-full p-2 border rounded" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={settings.contact_email} onChange={e => handleChange('contact_email', e.target.value)} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" value={settings.contact_phone} onChange={e => handleChange('contact_phone', e.target.value)} className="w-full p-2 border rounded" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                    <textarea value={settings.business_address} onChange={e => handleChange('business_address', e.target.value)} className="w-full p-2 border rounded" rows={3} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Config</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Number Prefix</label>
                    <input type="text" value={settings.order_prefix} onChange={e => handleChange('order_prefix', e.target.value)} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number Prefix</label>
                    <input type="text" value={settings.invoice_prefix} onChange={e => handleChange('invoice_prefix', e.target.value)} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input type="text" value={settings.tax_gst_number} onChange={e => handleChange('tax_gst_number', e.target.value)} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax %</label>
                    <input type="number" value={settings.tax_percentage} onChange={e => handleChange('tax_percentage', e.target.value)} className="w-full p-2 border rounded" />
                  </div>
                </div>
              </div>

              
              <div className="pt-8 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Admin Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
                  {passwordSuccess && <div className="text-green-600 text-sm">{passwordSuccess}</div>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-2 border rounded bg-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border rounded bg-white" minLength={8} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded bg-white" minLength={8} required />
                  </div>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button 
                  onClick={() => handleSave('store', ['store_name', 'store_logo', 'store_favicon', 'contact_email', 'contact_phone', 'business_address', 'currency', 'order_prefix', 'invoice_prefix', 'tax_gst_number', 'tax_percentage'])}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-indigo-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Store Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">AI Configuration</h3>
                
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md mb-6 text-sm">
                  <strong>Note:</strong> Gemini API Key (<code>GEMINI_API_KEY</code>) is stored securely in environment variables via the platform secrets panel. It cannot be edited here for security reasons.
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <input 
                    type="checkbox" 
                    id="ai_enabled"
                    checked={settings.ai_enabled === "true"}
                    onChange={e => handleChange('ai_enabled', e.target.checked ? "true" : "false")}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                  />
                  <label htmlFor="ai_enabled" className="text-sm font-medium text-gray-700">Enable AI Features Site-wide</label>
                </div>

                {settings.ai_enabled !== "true" && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fallback Mode (When AI is off)</label>
                    <select value={settings.ai_fallback_mode} onChange={e => handleChange('ai_fallback_mode', e.target.value)} className="w-full p-2 border rounded max-w-md">
                      <option value="hide">Hide AI features entirely</option>
                      <option value="rule_based">Use simple rule-based fallback</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Prompts</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gift Recommendation Prompt</label>
                    <p className="text-xs text-gray-500 mb-2">Instructions sent to Gemini for the Gift Recommender. Use this to tune tone and logic.</p>
                    <textarea 
                      value={settings.ai_prompt_recommend} 
                      onChange={e => handleChange('ai_prompt_recommend', e.target.value)} 
                      className="w-full p-3 border rounded font-mono text-sm" 
                      rows={6}
                      placeholder="Default system prompt..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Greeting Card Prompt</label>
                    <p className="text-xs text-gray-500 mb-2">Instructions sent to Gemini for generating personalized greeting messages.</p>
                    <textarea 
                      value={settings.ai_prompt_greeting} 
                      onChange={e => handleChange('ai_prompt_greeting', e.target.value)} 
                      className="w-full p-3 border rounded font-mono text-sm" 
                      rows={6}
                      placeholder="Default system prompt..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button 
                  onClick={() => handleSave('ai', ['ai_enabled', 'ai_fallback_mode', 'ai_prompt_recommend', 'ai_prompt_greeting'])}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-indigo-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save AI Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Razorpay Configuration</h3>
                
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md mb-6 text-sm">
                  <strong>Note:</strong> <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> must be set in your platform environment variables. They are not editable here.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Mode</label>
                    <select value={settings.razorpay_mode} onChange={e => handleChange('razorpay_mode', e.target.value)} className="w-full p-2 border rounded">
                      <option value="test">Test Mode</option>
                      <option value="live">Live Mode</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refund Auto-Approve</label>
                    <select value={settings.refund_auto_approve} onChange={e => handleChange('refund_auto_approve', e.target.value)} className="w-full p-2 border rounded">
                      <option value="false">Require Manual Approval</option>
                      <option value="true">Auto-Approve via API</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Webhooks</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure this URL in your Razorpay dashboard: <code className="bg-gray-100 px-2 py-1 rounded select-all">{window.location.origin}/api/webhooks/razorpay</code>
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret (Masked)</label>
                  <input 
                    type="password" 
                    value={settings.razorpay_webhook ? '********' : ''} 
                    disabled
                    className="w-full p-2 border rounded bg-gray-50 text-gray-500" 
                    placeholder="Set via Platform Secrets"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button 
                  onClick={() => handleSave('payments', ['razorpay_mode', 'refund_auto_approve'])}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-indigo-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Payment Settings
                </button>
              </div>
            </div>
          )}
        
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Session Security</h3>
                <p className="text-sm text-gray-500 mb-4">Configure automatic logouts for admin accounts.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (Minutes)</label>
                    <input type="number" value={settings.session_timeout_minutes} onChange={e => handleChange('session_timeout_minutes', e.target.value)} className="w-full p-2 border rounded" min="5" max="1440" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Multi-Factor Authentication</h3>
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="checkbox" 
                    id="admin_mfa_enabled"
                    checked={settings.admin_mfa_enabled === "true"}
                    onChange={e => handleChange('admin_mfa_enabled', e.target.checked ? "true" : "false")}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                  />
                  <label htmlFor="admin_mfa_enabled" className="text-sm font-medium text-gray-700">Require 2FA for Admin Logins</label>
                </div>
                <p className="text-xs text-gray-500 italic">Coming soon: Individual admins will need to configure their TOTP authenticator app.</p>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button 
                  onClick={() => handleSave('security', ['session_timeout_minutes', 'admin_mfa_enabled'])}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-indigo-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Security Settings
                </button>
              </div>
            </div>
          )}
</div>
      </div>
    </div>
  );
}

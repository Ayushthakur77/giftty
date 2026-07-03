import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Shield, UserPlus, Lock, CheckCircle2 } from "lucide-react";

export default function AdminPermissions() {
  const { user } = useAuthStore();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const permissions = [
    { id: 'manage_products', name: 'Manage Products', desc: 'Can add, edit, and delete products' },
    { id: 'manage_orders', name: 'Manage Orders', desc: 'Can view and update order statuses' },
    { id: 'view_reports', name: 'View Reports', desc: 'Can access financial and sales reports' },
    { id: 'manage_settings', name: 'Manage Settings', desc: 'Can change store and payment settings' },
    { id: 'manage_cms', name: 'Manage CMS', desc: 'Can update banners and text pages' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" /> Admin & Permissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage staff accounts and their access levels.</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Invite Staff Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Current Staff Accounts</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 border border-indigo-100 bg-indigo-50/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-xs font-medium border border-indigo-200">Super Admin</span>
                  <span>(You)</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center text-green-600 text-sm font-medium gap-1">
                <CheckCircle2 className="w-4 h-4" /> Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Permission Scopes (Preview)</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6">
            These roles will be available when multi-admin support is fully activated. Super Admins always have all permissions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.map(p => (
              <div key={p.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <h3 className="font-medium text-gray-900">{p.name}</h3>
                </div>
                <p className="text-sm text-gray-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400"></div>
            <h2 className="text-xl font-bold mb-2">Invite Staff Member</h2>
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm mb-6 flex gap-3">
              <Shield className="w-5 h-5 shrink-0" />
              <p><strong>Coming Soon:</strong> Multi-admin support is currently in development. This invite feature is disabled to ensure proper security and role enforcement across the platform.</p>
            </div>
            
            <div className="space-y-4 opacity-50 pointer-events-none">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" className="w-full p-2 border rounded" disabled placeholder="staff@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Permissions</label>
                <div className="space-y-2">
                  {permissions.slice(0,3).map(p => (
                    <label key={p.id} className="flex items-center gap-2">
                      <input type="checkbox" disabled className="w-4 h-4 text-indigo-600 rounded" />
                      <span className="text-sm">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSettings.tsx', 'utf-8');

const securityTabHeader = `
          <button 
            className={\`px-6 py-3 text-sm font-medium \${activeTab === 'security' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}\`}
            onClick={() => setActiveTab('security')}
          >
            Security Settings
          </button>
`;

code = code.replace(/<button \n            className=\{\`px-6 py-3 text-sm font-medium \$\{activeTab === 'payments'[\s\S]*?<\/button>/, match => match + "\n" + securityTabHeader);

const defaultKeys = `
    session_timeout_minutes: "60",
    admin_mfa_enabled: "false"
`;

code = code.replace(/refund_auto_approve: "false"/, `refund_auto_approve: "false",\n${defaultKeys}`);
code = code.replace(/s\.key\.startsWith\('ai_'\)/, `s.key.startsWith('ai_') || s.key === 'session_timeout_minutes' || s.key === 'admin_mfa_enabled'`);

const securityTabContent = `
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
`;

code = code.replace(/(<\/div>\s*)<\/div>\s*<\/div>\s*\);\s*\}/, match => securityTabContent + match);

fs.writeFileSync('src/pages/admin/AdminSettings.tsx', code);

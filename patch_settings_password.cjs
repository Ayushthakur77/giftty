const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSettings.tsx', 'utf-8');

const changePasswordState = `
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
          Authorization: \`Bearer \${token}\`
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
`;

code = code.replace(/const handleChange = \(k: string, v: string\) => \{/, changePasswordState + '\n  const handleChange = (k: string, v: string) => {');

const changePasswordUI = `
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
`;

code = code.replace(/<div className="flex justify-end pt-4 border-t">[\s\S]*?Save Security Settings[\s\S]*?<\/button>\s*<\/div>/, match => changePasswordUI + '\n              ' + match);

fs.writeFileSync('src/pages/admin/AdminSettings.tsx', code);

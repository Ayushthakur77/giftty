import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function AdminSetup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSetupAllowed, setIsSetupAllowed] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { syncUser } = useAuthStore();

  useEffect(() => {
    fetch('/api/admin/check-setup')
      .then(res => res.json())
      .then(data => {
        if (data.isSetup) {
          navigate('/admin/login');
        } else {
          setIsSetupAllowed(true);
        }
      })
      .catch(err => {
        console.error(err);
        setIsSetupAllowed(false);
      });
  }, [navigate]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      // 2. Call our setup endpoint to mark as admin
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Setup failed");
      }
      
      // 3. Sync user data
      await syncUser(token);
      
      // 4. Redirect to admin login or dashboard
      navigate('/admin/login');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to setup admin");
    } finally {
      setLoading(false);
    }
  };

  if (isSetupAllowed === null) {
    return <div className="h-screen flex items-center justify-center">Checking setup...</div>;
  }

  if (isSetupAllowed === false) {
    return <div className="h-screen flex items-center justify-center">Setup not allowed.</div>;
  }

  return (
    <div className="h-screen flex items-center justify-center bg-surface-dim">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2">Super Admin Setup</h1>
        <p className="text-on-surface-variant text-center mb-8 text-sm">Create the initial Super Admin account.</p>
        
        {error && (
          <div className="bg-error-container text-error px-4 py-3 rounded-lg text-sm mb-6 font-bold">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Admin Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-opacity-90 transition-opacity mt-4 disabled:opacity-70"
          >
            {loading ? "Setting up..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}

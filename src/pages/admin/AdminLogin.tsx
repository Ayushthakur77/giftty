import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { syncUser } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Brute force check
      const checkRes = await fetch("/api/admin/login-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!checkRes.ok) {
        const data = await checkRes.json();
        throw new Error(data.error || "Too many failed attempts.");
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      await syncUser(token);
      
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid admin credentials");
      
      // Log failed attempt if it was an invalid credential
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        fetch("/api/admin/login-failed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        }).catch(console.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-surface-dim">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2">Admin Login</h1>
        <p className="text-on-surface-variant text-center mb-8 text-sm">Access the Super Admin panel.</p>
        
        {error && (
          <div className="bg-error-container text-error px-4 py-3 rounded-lg text-sm mb-6 font-bold">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Email</label>
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminLogin.tsx', 'utf-8');

const loginLogic = `
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
`;

code = code.replace(/const handleLogin = async \(e: React\.FormEvent\) => \{[\s\S]*?finally \{\n      setLoading\(false\);\n    \}\n  \};/, loginLogic.trim());

fs.writeFileSync('src/pages/admin/AdminLogin.tsx', code);

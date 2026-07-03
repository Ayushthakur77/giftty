const fs = require('fs');
let code = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf-8');

const sessionLogic = `
  // Session Timeout Logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/settings/security", {
          headers: { Authorization: \`Bearer \${useAuthStore.getState().token}\` }
        });
        const data = await res.json();
        let timeoutMinutes = 60; // default
        if (data && Array.isArray(data)) {
          const setting = data.find((s: any) => s.key === 'session_timeout_minutes');
          if (setting) timeoutMinutes = parseInt(setting.value);
        }
        
        const resetTimeout = () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            logout();
            navigate('/admin/login');
          }, timeoutMinutes * 60 * 1000);
        };
        
        // Listen for activity
        window.addEventListener('mousemove', resetTimeout);
        window.addEventListener('keypress', resetTimeout);
        resetTimeout();
        
        return () => {
          clearTimeout(timeoutId);
          window.removeEventListener('mousemove', resetTimeout);
          window.removeEventListener('keypress', resetTimeout);
        };
      } catch (err) {
        console.error(err);
      }
    };
    
    if (isAuthenticated && user?.role === 'ADMIN') {
      checkSession();
    }
  }, [isAuthenticated, user]);
`;

code = code.replace(/useEffect\(\(\) => \{\n    if \(\!isAuthenticated \|\| user\?\.role \!\=\= 'ADMIN'\) \{/s, match => sessionLogic + "\n  " + match);

fs.writeFileSync('src/layouts/AdminLayout.tsx', code);

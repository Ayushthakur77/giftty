const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const authEffect = `
import { useEffect } from 'react';
import { auth } from './lib/firebase';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        useAuthStore.setState({ token, isAuthenticated: true });
      } else {
        useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
      }
    });
    return () => unsubscribe();
  }, []);
`;

code = code.replace(/import \{ useEffect \} from 'react';\nimport \{ auth \} from '\.\/lib\/firebase';\nimport \{ useAuthStore \} from '\.\/store\/useAuthStore';\n\nexport default function App\(\) \{\n  useEffect\(\(\) => \{\n    const unsubscribe = auth\.onIdTokenChanged\(async \(user\) => \{\n      if \(user\) \{\n        const token = await user\.getIdToken\(\);\n        useAuthStore\.setState\(\{ token \}\);\n      \}\n    \}\);\n    return \(\) => unsubscribe\(\);\n  \}, \[\]\);/g, authEffect.trim());

fs.writeFileSync('src/App.tsx', code);

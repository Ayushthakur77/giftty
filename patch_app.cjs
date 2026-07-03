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
        useAuthStore.setState({ token });
      }
    });
    return () => unsubscribe();
  }, []);
`;

code = code.replace(/export default function App\(\) \{/, authEffect);

fs.writeFileSync('src/App.tsx', code);

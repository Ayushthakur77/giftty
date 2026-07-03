const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

code = code.replace(/res\.status\(500\)\.json\(\{ error: error\.message \}\);\n  \}\n\}\); \}\n\}\);/, 
  'res.status(500).json({ error: error.message });\n  }\n});');

fs.writeFileSync('src/server/routes.ts', code);

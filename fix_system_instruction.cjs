const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

code = code.replace(/await ai\.models\.generateContent\(\{([\s\S]*?systemInstruction:[\s\S]*?)\}\);/g, 'await ai.models.generateContent({$1} as any);');

fs.writeFileSync('src/server/routes.ts', code);

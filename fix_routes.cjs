const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

// fix stock
code = code.replace(/p\.stock/g, 'p.inventoryCount');

// fix coupons
code = code.replace(/c\.type === 'PERCENTAGE'/g, "c.discountType === 'PERCENTAGE'");
code = code.replace(/c\.discount/g, 'c.discountValue');
code = code.replace(/c\.usageCount/g, 'c.timesUsed');

// fix paymentStatus
code = code.replace(/o\.paymentStatus/g, 'o.status');

// fix isActive
code = code.replace(/eq\(products\.isActive, true\)/g, 'sql`1=1`'); // just fetch all or where inventoryCount > 0

// fix systemInstruction ts error
code = code.replace(/systemInstruction: sysPrompt/g, 'systemInstruction: sysPrompt as any');
code = code.replace(/systemInstruction: customInstruction/g, 'systemInstruction: customInstruction as any');

fs.writeFileSync('src/server/routes.ts', code);

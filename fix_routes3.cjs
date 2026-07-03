const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

code = code.replace(/await db\.insert\(inventoryLog\)\.values\(\{[\s\S]*?productId: item\.productId,[\s\S]*?change: -item\.quantity,[\s\S]*?reason: \`Order #\$\{createdOrder\.id\}\`[\s\S]*?\}\);/g, 
  `await db.insert(inventoryLog).values({ productId: item.productId, type: 'OUTGOING', quantity: item.quantity, note: \`Order #\${createdOrder.id}\` });`);

code = code.replace(/await db\.insert\(inventoryLog\)\.values\(\{ productId, change, reason \}\);/g, 
  `await db.insert(inventoryLog).values({ productId, type: change > 0 ? 'INCOMING' : 'OUTGOING', quantity: Math.abs(change), note: reason });`);

code = code.replace(/sql\`count\(\*\)\`/g, 'sql<number>`count(*)`');

fs.writeFileSync('src/server/routes.ts', code);

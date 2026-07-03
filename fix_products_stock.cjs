const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

// replace .set({ stock: sql`${products.stock} - ${qty}` })
code = code.replace(/products\.stock/g, 'products.inventoryCount');
code = code.replace(/stock:/g, 'inventoryCount:');
code = code.replace(/stockCount/g, 'inventoryCount');

fs.writeFileSync('src/server/routes.ts', code);

const fs = require('fs');

// 1. AdminLayout imports
let layoutCode = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf-8');
layoutCode = layoutCode.replace(/import \{ LayoutDashboard/g, 'import { CheckSquare, Square, LayoutDashboard');
fs.writeFileSync('src/layouts/AdminLayout.tsx', layoutCode);

// 2. coupons createdAt -> id
let routesCode = fs.readFileSync('src/server/routes.ts', 'utf-8');
routesCode = routesCode.replace(/desc\(coupons\.createdAt\)/g, 'desc(coupons.id)');
fs.writeFileSync('src/server/routes.ts', routesCode);

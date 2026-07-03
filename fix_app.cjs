const fs = require('fs');

// App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(/<Route path="cms" element=\{<PlaceholderPage name="CMS Pages" phase=\{6\} \/>\} \/>\n/, '');
fs.writeFileSync('src/App.tsx', appCode);

// AdminSettings.tsx
let settingsCode = fs.readFileSync('src/pages/admin/AdminSettings.tsx', 'utf-8');
settingsCode = settingsCode.replace(/useState<'store' \| 'ai' \| 'payments'>/g, "useState<'store' | 'ai' | 'payments' | 'security'>");
fs.writeFileSync('src/pages/admin/AdminSettings.tsx', settingsCode);

// AdminLayout.tsx
let layoutCode = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf-8');
layoutCode = layoutCode.replace(
  /\{ name: 'Reports', path: '\/admin\/analytics', icon: BarChart \},/,
  `{ name: 'Reports', path: '/admin/analytics', icon: BarChart },\n    { name: 'Permissions', path: '/admin/permissions', icon: CheckSquare },\n    { name: 'Audit Logs', path: '/admin/audit-logs', icon: Square },`
);
fs.writeFileSync('src/layouts/AdminLayout.tsx', layoutCode);

// Home.tsx
let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
homeCode = homeCode.replace(/via\.placeholder\.com\/([0-9x]+)/g, 'picsum.photos/1024/400');
fs.writeFileSync('src/pages/Home.tsx', homeCode);

// AdminBanners.tsx
let bannersCode = fs.readFileSync('src/pages/admin/AdminBanners.tsx', 'utf-8');
bannersCode = bannersCode.replace(/via\.placeholder\.com\/([0-9x]+)/g, 'picsum.photos/1024/400');
fs.writeFileSync('src/pages/admin/AdminBanners.tsx', bannersCode);


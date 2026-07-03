const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

// The pattern to replace:
// await db.insert(auditLogs).values({
//   adminId: req.user.id,
//   action: "...",
//   resourceType: "...",
//   resourceId: ...,
//   details: { ... }
// });
// To:
// await db.insert(auditLogs).values({
//   userId: req.dbUser.id,
//   action: "...",
//   details: JSON.stringify({ resourceId: ..., ...details })
// });

code = code.replace(/await db\.insert\(auditLogs\)\.values\(\{[\s\S]*?adminId:[\s\S]*?\}\);/g, (match) => {
  let actionMatch = match.match(/action:\s*("[^"]*")/);
  let detailsMatch = match.match(/details:\s*(\{.*?\})/);
  if (!detailsMatch) {
    detailsMatch = match.match(/details:\s*([^\n]+)/); // fallback
  }
  let resourceIdMatch = match.match(/resourceId:\s*([^,]+)/);
  
  let action = actionMatch ? actionMatch[1] : '"UNKNOWN"';
  let details = detailsMatch ? detailsMatch[1] : '{}';
  let resourceId = resourceIdMatch ? resourceIdMatch[1] : 'null';
  
  return `await db.insert(auditLogs).values({
      action: ${action},
      details: JSON.stringify({ resourceId: ${resourceId}, payload: ${details} }),
      userId: req.dbUser.id
    });`;
});

fs.writeFileSync('src/server/routes.ts', code);

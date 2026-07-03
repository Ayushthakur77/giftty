const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

const auditLogic = `
apiRouter.get("/admin/audit-logs", requireAdmin, async (req: any, res) => {
  try {
    const { action, start, end } = req.query;
    
    let baseLogs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
    
    if (action) {
      baseLogs = baseLogs.filter(l => l.action.toLowerCase().includes(String(action).toLowerCase()));
    }
    
    if (start) {
      const s = new Date(start);
      baseLogs = baseLogs.filter(l => new Date(l.createdAt) >= s);
    }
    
    if (end) {
      const e = new Date(end);
      e.setHours(23, 59, 59, 999);
      baseLogs = baseLogs.filter(l => new Date(l.createdAt) <= e);
    }
    
    res.json(baseLogs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
`;

code = code.replace(/apiRouter\.get\("\/admin\/audit-logs", requireAdmin, async \(req: any, res\) => \{[\s\S]*?\}\);/, auditLogic.trim());

fs.writeFileSync('src/server/routes.ts', code);

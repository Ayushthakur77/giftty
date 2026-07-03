const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

const loginCheckRoute = `
// Brute force check
apiRouter.post("/admin/login-check", async (req, res) => {
  try {
    const { email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    // Cleanup old records (> 15 mins)
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const { failedLoginAttempts } = require('../db/schema.ts');
    const { eq, and, gt } = require('drizzle-orm');
    
    const recentAttempts = await db.select().from(failedLoginAttempts)
      .where(and(
        eq(failedLoginAttempts.email, email),
        gt(failedLoginAttempts.attemptedAt, fifteenMinsAgo)
      ));
      
    if (recentAttempts.length >= 5) {
      return res.status(429).json({ error: "Too many failed attempts. Please try again in 15 minutes." });
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/admin/login-failed", async (req, res) => {
  try {
    const { email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || '';
    
    const { failedLoginAttempts } = require('../db/schema.ts');
    await db.insert(failedLoginAttempts).values({
      email,
      ipAddress: ip,
      userAgent
    });
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
`;

code = code.replace(/export const apiRouter = Router\(\);/, 'export const apiRouter = Router();\n' + loginCheckRoute);

fs.writeFileSync('src/server/routes.ts', code);

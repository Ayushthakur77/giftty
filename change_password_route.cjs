const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

const changePasswordRoute = `
// Admin Password Change
apiRouter.post("/admin/change-password", requireAdmin, async (req: any, res) => {
  try {
    const { newPassword } = req.body;
    const uid = req.user.uid;
    
    // Update in Firebase Auth
    const admin = require('firebase-admin');
    await admin.auth().updateUser(uid, { password: newPassword });
    
    // Update in DB
    await db.update(users).set({ lastPasswordChangeAt: new Date() }).where(eq(users.firebaseUid, uid));
    
    // Log audit
    await db.insert(auditLogs).values({
      userId: uid,
      action: 'CHANGE_PASSWORD',
      details: JSON.stringify({ message: "Admin changed their password" })
    });
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
`;

code = code.replace(/export const apiRouter = Router\(\);/, 'export const apiRouter = Router();\n' + changePasswordRoute);

fs.writeFileSync('src/server/routes.ts', code);

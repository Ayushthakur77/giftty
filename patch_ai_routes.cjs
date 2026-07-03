const fs = require('fs');

let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

const checkAiStatus = `
    const aiSetting = await db.select().from(settings).where(eq(settings.key, 'ai_enabled')).limit(1);
    if (aiSetting.length && aiSetting[0].value === 'false') {
      return res.status(403).json({error: "AI features are currently disabled."});
    }
`;

// Inject into /ai/recommend
code = code.replace(/apiRouter\.post\("\/ai\/recommend", aiRateLimiter, async \(req, res\) => \{\n  try \{/g, 
  'apiRouter.post("/ai/recommend", aiRateLimiter, async (req: any, res) => {\n  try {\n' + checkAiStatus);

// Inject into /ai/greeting
code = code.replace(/apiRouter\.post\("\/ai\/greeting", aiRateLimiter, async \(req, res\) => \{\n  try \{/g, 
  'apiRouter.post("/ai/greeting", aiRateLimiter, async (req: any, res) => {\n  try {\n' + checkAiStatus);

// Inject into /ai/auto-build
code = code.replace(/apiRouter\.post\("\/ai\/auto-build", aiRateLimiter, async \(req, res\) => \{\n  try \{/g, 
  'apiRouter.post("/ai/auto-build", aiRateLimiter, async (req: any, res) => {\n  try {\n' + checkAiStatus);

fs.writeFileSync('src/server/routes.ts', code);

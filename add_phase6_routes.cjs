const fs = require('fs');

const routes = `
// Banners Phase 6
apiRouter.put("/admin/banners/:id", requireAdmin, async (req, res) => {
  try {
    const updated = await db.update(banners).set(req.body).where(eq(banners.id, Number(req.params.id))).returning();
    await db.insert(auditLogs).values({ action: 'UPDATE_BANNER', details: JSON.stringify({ resourceId: updated[0].id }), userId: req.dbUser.id });
    res.json(updated[0]);
  } catch(e) { res.status(500).json({error: e.message}); }
});

apiRouter.patch("/admin/banners/:id/reorder", requireAdmin, async (req, res) => {
  try {
    const updated = await db.update(banners).set({ sortOrder: req.body.sortOrder }).where(eq(banners.id, Number(req.params.id))).returning();
    res.json(updated[0]);
  } catch(e) { res.status(500).json({error: e.message}); }
});

// CMS
apiRouter.get("/admin/cms", requireAdmin, async (req, res) => {
  try { res.json(await db.select().from(cmsPages)); } catch(e) { res.status(500).json({error: e.message}); }
});
apiRouter.get("/admin/cms/:slug", requireAdmin, async (req, res) => {
  try { 
    const result = await db.select().from(cmsPages).where(eq(cmsPages.slug, req.params.slug)).limit(1);
    res.json(result[0] || null);
  } catch(e) { res.status(500).json({error: e.message}); }
});
apiRouter.put("/admin/cms/:slug", requireAdmin, async (req, res) => {
  try {
    const existing = await db.select().from(cmsPages).where(eq(cmsPages.slug, req.params.slug)).limit(1);
    let result;
    if (existing.length) {
      result = await db.update(cmsPages).set({...req.body, updatedAt: new Date()}).where(eq(cmsPages.slug, req.params.slug)).returning();
    } else {
      result = await db.insert(cmsPages).values({slug: req.params.slug, ...req.body}).returning();
    }
    await db.insert(auditLogs).values({ action: 'UPDATE_CMS', details: JSON.stringify({ resourceId: result[0].id }), userId: req.dbUser.id });
    res.json(result[0]);
  } catch(e) { res.status(500).json({error: e.message}); }
});

apiRouter.get("/cms/:slug", async (req, res) => {
  try { 
    const result = await db.select().from(cmsPages).where(and(eq(cmsPages.slug, req.params.slug), eq(cmsPages.isPublished, true))).limit(1);
    if (!result.length) return res.status(404).json({error: 'Not found'});
    res.json(result[0]);
  } catch(e) { res.status(500).json({error: e.message}); }
});

// Settings aliases for phase 6
apiRouter.get("/admin/settings/:group", requireAdmin, async (req, res) => {
  try { res.json(await db.select().from(settings)); } catch(e) { res.status(500).json({error: e.message}); }
});
apiRouter.put("/admin/settings/:group", requireAdmin, async (req, res) => {
  try { 
    for(const k of Object.keys(req.body)) {
      const existing = await db.select().from(settings).where(eq(settings.key, k));
      if(existing.length) {
        await db.update(settings).set({value: req.body[k]}).where(eq(settings.key, k));
      } else {
        await db.insert(settings).values({key: k, value: String(req.body[k])});
      }
    }
    await db.insert(auditLogs).values({ action: \`UPDATE_SETTINGS_\${req.params.group.toUpperCase()}\`, details: JSON.stringify({ keys: Object.keys(req.body) }), userId: req.dbUser.id });
    res.json({success: true}); 
  } catch(e) { res.status(500).json({error: e.message}); }
});

apiRouter.get("/banners", async (req, res) => {
  try {
    const now = new Date();
    // Fetch active banners, ignoring those where now is outside startDate/endDate
    const activeBanners = await db.select().from(banners).where(eq(banners.isActive, true)).orderBy(banners.sortOrder);
    const valid = activeBanners.filter(b => {
      if (b.startDate && new Date(b.startDate) > now) return false;
      if (b.endDate && new Date(b.endDate) < now) return false;
      return true;
    });
    res.json(valid);
  } catch(e) { res.status(500).json({error: e.message}); }
});
`;

let code = fs.readFileSync('src/server/routes.ts', 'utf-8');
code = code.replace('apiRouter.patch("/admin/orders/:id/status"', routes + '\napiRouter.patch("/admin/orders/:id/status"');
fs.writeFileSync('src/server/routes.ts', code);

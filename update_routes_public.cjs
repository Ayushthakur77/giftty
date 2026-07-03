const fs = require('fs');

let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

const publicRoutes = `
// Public settings
apiRouter.get("/settings/homepage-sections", async (req, res) => {
  try {
    const existing = await db.select().from(settings).where(eq(settings.key, 'homepage_sections_order')).limit(1);
    if (existing.length && existing[0].value) {
      res.json(JSON.parse(existing[0].value));
    } else {
      res.json(['Hero', 'Trending', 'Categories', 'Festival Highlights', 'Testimonials']);
    }
  } catch(e) { res.status(500).json({error: e.message}); }
});
apiRouter.get("/settings/store", async (req, res) => {
  try {
    const keys = ['store_name', 'store_logo', 'store_favicon', 'contact_email', 'contact_phone', 'business_address', 'social_instagram', 'social_facebook'];
    const result = await db.select().from(settings).where(inArray(settings.key, keys));
    res.json(result);
  } catch(e) { res.status(500).json({error: e.message}); }
});
`;

code = code.replace('apiRouter.get("/banners"', publicRoutes + '\napiRouter.get("/banners"');
fs.writeFileSync('src/server/routes.ts', code);

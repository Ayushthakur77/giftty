const fs = require('fs');

let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

const aiRoutes = `
// AI endpoints
apiRouter.post("/ai/recommend", aiRateLimiter, async (req: any, res) => {
  try {
    const aiSetting = await db.select().from(settings).where(eq(settings.key, 'ai_enabled')).limit(1);
    if (aiSetting.length && aiSetting[0].value === 'false') {
      return res.status(403).json({error: "AI features are currently disabled."});
    }

    const promptSetting = await db.select().from(settings).where(eq(settings.key, 'ai_prompt_recommend')).limit(1);
    const customInstruction = promptSetting.length && promptSetting[0].value 
      ? promptSetting[0].value 
      : 'You are a gift recommender. Suggest 3 gift categories.';

    const { context } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      systemInstruction: customInstruction,
      contents: "Context: " + context,
    });
    res.json({ recommendation: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/ai/greeting", aiRateLimiter, async (req: any, res) => {
  try {
    const aiSetting = await db.select().from(settings).where(eq(settings.key, 'ai_enabled')).limit(1);
    if (aiSetting.length && aiSetting[0].value === 'false') {
      return res.status(403).json({error: "AI features are currently disabled."});
    }

    const promptSetting = await db.select().from(settings).where(eq(settings.key, 'ai_prompt_greeting')).limit(1);
    const customInstruction = promptSetting.length && promptSetting[0].value 
      ? promptSetting[0].value 
      : 'Write a short heartfelt greeting message.';

    const { occasion, relationship, tone } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      systemInstruction: customInstruction,
      contents: "Occasion: " + occasion + ", To: " + relationship + ", Tone: " + tone,
    });
    res.json({ greeting: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/ai/auto-build", aiRateLimiter, async (req: any, res) => {
  try {
    const aiSetting = await db.select().from(settings).where(eq(settings.key, 'ai_enabled')).limit(1);
    if (aiSetting.length && aiSetting[0].value === 'false') {
      return res.status(403).json({error: "AI features are currently disabled."});
    }

    const { prompt } = req.body;
    const allProducts = await db.select().from(products).where(eq(products.isActive, true));
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const sysPrompt = "You are an AI that builds custom gift boxes. The user provides a request. Select exactly 3 products from the available inventory. Return ONLY a JSON array of the 3 product IDs. Available products: " + JSON.stringify(allProducts.map(p => ({id: p.id, name: p.name, tags: p.tags})));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      systemInstruction: sysPrompt,
      contents: prompt,
    });
    
    let text = response.text || "[]";
    text = text.replace(/\\x60\\x60\\x60json/g, "").replace(/\\x60\\x60\\x60/g, "").trim();
    
    const suggestedIds = JSON.parse(text);
    const suggestedProducts = allProducts.filter(p => suggestedIds.includes(p.id));
    
    res.json({ products: suggestedProducts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
`;

code = code.replace(/\/\/ AI endpoints[\s\S]*?apiRouter\.post\("\/ai\/auto-build"[\s\S]*?\}\);\n\}\);/, aiRoutes);

fs.writeFileSync('src/server/routes.ts', code);

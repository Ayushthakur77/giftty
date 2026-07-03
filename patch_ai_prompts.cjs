const fs = require('fs');

let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

const recommendLogic = `
    const promptSetting = await db.select().from(settings).where(eq(settings.key, 'ai_prompt_recommend')).limit(1);
    const customInstruction = promptSetting.length && promptSetting[0].value 
      ? promptSetting[0].value 
      : 'You are a gift recommender. Suggest 3 gift categories.';
`;

const greetingLogic = `
    const promptSetting = await db.select().from(settings).where(eq(settings.key, 'ai_prompt_greeting')).limit(1);
    const customInstruction = promptSetting.length && promptSetting[0].value 
      ? promptSetting[0].value 
      : 'Write a short heartfelt greeting message.';
`;

code = code.replace(/const { context } = req\.body;\s*const aiSetting =[\s\S]*?const ai = new GoogleGenAI\(\{ apiKey: process\.env\.GEMINI_API_KEY \}\);\s*const response = await ai\.models\.generateContent\(\{[\s\S]*?\}\);/, 
  `const { context } = req.body;
    const aiSetting = await db.select().from(settings).where(eq(settings.key, 'ai_enabled')).limit(1);
    if (aiSetting.length && aiSetting[0].value === 'false') {
      return res.status(403).json({error: "AI features are currently disabled."});
    }
` + recommendLogic + `
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      systemInstruction: customInstruction,
      contents: "Context: " + context,
    });`
);

code = code.replace(/const { occasion, relationship, tone } = req\.body;\s*const aiSetting =[\s\S]*?const ai = new GoogleGenAI\(\{ apiKey: process\.env\.GEMINI_API_KEY \}\);\s*const response = await ai\.models\.generateContent\(\{[\s\S]*?\}\);/, 
  `const { occasion, relationship, tone } = req.body;
    const aiSetting = await db.select().from(settings).where(eq(settings.key, 'ai_enabled')).limit(1);
    if (aiSetting.length && aiSetting[0].value === 'false') {
      return res.status(403).json({error: "AI features are currently disabled."});
    }
` + greetingLogic + `
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      systemInstruction: customInstruction,
      contents: "Occasion: " + occasion + ", To: " + relationship + ", Tone: " + tone,
    });`
);

fs.writeFileSync('src/server/routes.ts', code);

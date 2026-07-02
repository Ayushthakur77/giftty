import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.ts";
import { db } from "../db/index.ts";
import { users, products, categories, orders, orderItems, reviews, coupons, deliveryCharges, settings, auditLogs, banners } from "../db/schema.ts";
import { getOrCreateUser } from "../db/users.ts";
import { getRazorpay } from "../lib/razorpay.ts";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { eq, desc, and } from "drizzle-orm";

export const apiRouter = Router();

// Auth sync
apiRouter.post("/auth/sync", requireAuth, async (req: any, res) => {
  try {
    const { email, uid, name } = req.user;
    const dbUser = await getOrCreateUser(uid, email, name || email.split("@")[0]);
    res.json(dbUser);
  } catch (error: any) {
    console.error("Auth sync error:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

// Products
apiRouter.get("/products", async (req, res) => {
  try {
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
    res.json(allProducts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Categories
apiRouter.get("/categories", async (req, res) => {
  try {
    const allCategories = await db.select().from(categories).orderBy(categories.name);
    res.json(allCategories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI endpoints
apiRouter.post("/ai/recommend", async (req, res) => {
  try {
    const { context } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on this user context: "${context}", suggest 3 gift categories or types. Keep it brief.`,
    });
    res.json({ recommendation: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/ai/greeting", async (req, res) => {
  try {
    const { occasion, relationship, tone } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a short, heartfelt greeting card message for a ${occasion} to a ${relationship}, in a ${tone} tone. Limit to 3 sentences.`,
    });
    res.json({ message: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Orders & Checkout
apiRouter.post("/checkout/create-order", requireAuth, async (req: any, res) => {
  try {
    const { amount, receipt } = req.body; // amount in smallest currency unit (paise)
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: receipt || `rcpt_${Date.now()}`
    });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/checkout/verify", requireAuth, async (req: any, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (key_secret) {
      const generated_signature = crypto.createHmac('sha256', key_secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');
        
      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({ error: "Invalid signature" });
      }
    }

    // Save order in DB
    const dbUser = await getOrCreateUser(req.user.uid, req.user.email, req.user.name || "");
    
    const newOrder = await db.insert(orders).values({
      userId: dbUser.id,
      totalAmount: orderData.totalAmount,
      status: "PROCESSING",
      shippingAddress: orderData.shippingAddress,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    }).returning();
    
    // Insert order items
    // (In a real app we'd map and insert all items, simplified here)
    if (orderData.items && orderData.items.length > 0) {
      const itemsToInsert = orderData.items.map((i: any) => ({
        orderId: newOrder[0].id,
        productId: i.product?.id || null, // null for custom boxes
        quantity: i.quantity || 1,
        price: i.product ? i.product.price : i.totalPrice,
        isCustomBox: !!i.items, // custom boxes have items array
        customBoxDetails: i.items || null,
        engravingText: i.engraving || null
      }));
      await db.insert(orderItems).values(itemsToInsert);
    }

    res.json(newOrder[0]);
  } catch (error: any) {
    console.error("Verify error:", error);
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/orders", requireAuth, async (req: any, res) => {
  try {
    const dbUser = await getOrCreateUser(req.user.uid, req.user.email, req.user.name || "");
    const userOrders = await db.select().from(orders).where(eq(orders.userId, dbUser.id)).orderBy(desc(orders.createdAt));
    res.json(userOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoints
apiRouter.get("/admin/dashboard", requireAdmin, async (req, res) => {
  res.json({ message: "Admin dashboard data" });
});

import { relations } from 'drizzle-orm';
import { 
  integer, 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  boolean,
  decimal,
  jsonb,
  varchar
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('USER'), // 'USER' or 'ADMIN'
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  image: text('image').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  badge: text('badge'),
  badgeColor: text('badge_color'),
  inventoryCount: integer('inventory_count').notNull().default(0),
  isCustomizable: boolean('is_customizable').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, PROCESSING, SHIPPED, DELIVERED
  shippingAddress: jsonb('shipping_address').notNull(),
  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  isCustomBox: boolean('is_custom_box').notNull().default(false),
  customBoxDetails: jsonb('custom_box_details'), // array of product ids and gift note
  engravingText: text('engraving_text'),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountType: text('discount_type').notNull(), // 'PERCENT' or 'FLAT'
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  expiryDate: timestamp('expiry_date').notNull(),
  usageLimit: integer('usage_limit'),
  timesUsed: integer('times_used').notNull().default(0),
});

export const deliveryCharges = pgTable('delivery_charges', {
  id: serial('id').primaryKey(),
  stateName: text('state_name').notNull().unique(),
  charge: decimal('charge', { precision: 10, scale: 2 }).notNull().default('0.00'),
  isDeliverable: boolean('is_deliverable').notNull().default(true),
});

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  action: text('action').notNull(),
  details: text('details').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const banners = pgTable('banners', {
  id: serial('id').primaryKey(),
  image: text('image').notNull(),
  link: text('link'),
  isActive: boolean('is_active').notNull().default(true),
});

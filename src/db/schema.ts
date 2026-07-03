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
  varchar,
  AnyPgColumn
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('USER'), // 'USER' or 'ADMIN'
  isBlacklisted: boolean('is_blacklisted').default(false),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: text('two_factor_secret'),
  lastPasswordChangeAt: timestamp('last_password_change_at'),
  blacklistReason: text('blacklist_reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: integer('parent_id').references((): AnyPgColumn => categories.id),
  bannerImage: text('banner_image'),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0),
  isEnabled: boolean('is_enabled').default(true),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  type: text('type').default('CATEGORY'), // 'CATEGORY'/'OCCASION'/'FESTIVAL'/'RELATIONSHIP'/'PRICE_COLLECTION'
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
  occasionTags: jsonb('occasion_tags').$type<string[]>().default([]),
  
  slug: text('slug').unique(),
  shortDescription: text('short_description'),
  sku: text('sku').unique(),
  barcode: text('barcode'),
  salePrice: decimal('sale_price', { precision: 10, scale: 2 }),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  gstPercent: decimal('gst_percent', { precision: 5, scale: 2 }),
  lowStockThreshold: integer('low_stock_threshold').default(5),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  dimensions: jsonb('dimensions'), // { length, width, height }
  galleryImages: jsonb('gallery_images').$type<string[]>().default([]),
  video: text('video'),
  tags: jsonb('tags').$type<string[]>().default([]),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  status: text('status').default('DRAFT'), // 'DRAFT'/'PUBLISHED'/'ARCHIVED'
  isFeatured: boolean('is_featured').default(false),
  isTrending: boolean('is_trending').default(false),
  isBestseller: boolean('is_bestseller').default(false),
  isRecommended: boolean('is_recommended').default(false),
  isCustomizationEnabled: boolean('is_customization_enabled').default(false),
  isPersonalizationEnabled: boolean('is_personalization_enabled').default(false),
  hasGreetingCard: boolean('has_greeting_card').default(false),
  isGiftBoxCompatible: boolean('is_gift_box_compatible').default(true),
  estimatedDelivery: text('estimated_delivery'),
  returnPolicy: text('return_policy'),
  warranty: text('warranty'),
  subcategoryId: integer('subcategory_id').references((): AnyPgColumn => categories.id),
  brand: text('brand'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const productCustomizationOptions = pgTable('product_customization_options', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  canEngrave: boolean('can_engrave').default(false),
  canUploadImage: boolean('can_upload_image').default(false),
  canUploadLogo: boolean('can_upload_logo').default(false),
  canWriteMessage: boolean('can_write_message').default(false),
  characterLimit: integer('character_limit'),
  availableFonts: jsonb('available_fonts').$type<string[]>().default([]),
  availableColors: jsonb('available_colors').$type<string[]>().default([]),
  availableEngravingPositions: jsonb('available_engraving_positions').$type<string[]>().default([]),
  availableRibbonColors: jsonb('available_ribbon_colors').$type<string[]>().default([]),
  availableGreetingCardTemplates: jsonb('available_greeting_card_templates').$type<string[]>().default([]),
  maxCustomizations: integer('max_customizations').default(1),
  extraCharge: decimal('extra_charge', { precision: 10, scale: 2 }).default('0.00'),
});

export const giftBoxes = pgTable('gift_boxes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  coverImage: text('cover_image'),
  galleryImages: jsonb('gallery_images').$type<string[]>().default([]),
  boxType: text('box_type').notNull(), // 'READY_MADE' or 'CUSTOM_BUILDER'
  material: text('material'),
  color: text('color'),
  shape: text('shape'),
  capacity: integer('capacity'),
  maxWeight: decimal('max_weight', { precision: 10, scale: 2 }),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull().default('0.00'),
  offerPrice: decimal('offer_price', { precision: 10, scale: 2 }),
  ribbonOptions: jsonb('ribbon_options').$type<string[]>().default([]),
  fillerOptions: jsonb('filler_options').$type<string[]>().default([]),
  availableGreetingCards: jsonb('available_greeting_cards').$type<string[]>().default([]),
  includedProductIds: jsonb('included_product_ids').$type<number[]>().default([]),
  allowedProductIds: jsonb('allowed_product_ids').$type<number[]>().default([]),
  maxProducts: integer('max_products'),
  allowedCategoryIds: jsonb('allowed_category_ids').$type<number[]>().default([]),
  requiredProductIds: jsonb('required_product_ids').$type<number[]>().default([]),
  mandatoryGreetingCard: boolean('mandatory_greeting_card').default(false),
  mandatoryNote: boolean('mandatory_note').default(false),
  defaultNote: text('default_note'),
  stock: integer('stock').notNull().default(0),
  isFeatured: boolean('is_featured').default(false),
  isTrending: boolean('is_trending').default(false),
  visibility: text('visibility').default('PUBLIC'),
  status: text('status').default('PUBLISHED'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const inventoryLog = pgTable('inventory_log', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  type: text('type').notNull(), // 'INCOMING'/'OUTGOING'/'DAMAGED'/'RESERVED'/'ADJUSTMENT'
  quantity: integer('quantity').notNull(),
  warehouse: text('warehouse'),
  note: text('note'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const deliveryZones = pgTable('delivery_zones', {
  id: serial('id').primaryKey(),
  state: text('state').notNull(),
  city: text('city'), // nullable
  pincode: text('pincode'), // nullable
  charge: decimal('charge', { precision: 10, scale: 2 }).notNull().default('0.00'),
  isCodAvailable: boolean('is_cod_available').default(true),
  isExpressAvailable: boolean('is_express_available').default(false),
  isSameDayAvailable: boolean('is_same_day_available').default(false),
  estimatedDays: integer('estimated_days').default(3),
  isDeliverable: boolean('is_deliverable').default(true),
});

export const cmsPages = pgTable('cms_pages', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content'),
  isPublished: boolean('is_published').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountType: text('discount_type').notNull(), // 'PERCENT' or 'FLAT'
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  expiryDate: timestamp('expiry_date').notNull(),
  usageLimit: integer('usage_limit'),
  timesUsed: integer('times_used').notNull().default(0),
  applicableCategoryIds: jsonb('applicable_category_ids').$type<number[]>().default([]),
  applicableProductIds: jsonb('applicable_product_ids').$type<number[]>().default([]),
  minOrderValue: decimal('min_order_value', { precision: 10, scale: 2 }),
  maxDiscount: decimal('max_discount', { precision: 10, scale: 2 }),
  customerRestriction: text('customer_restriction').default('ALL'), // 'ALL'/'NEW_CUSTOMERS_ONLY'
  isFestivalCoupon: boolean('is_festival_coupon').default(false),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, PROCESSING, SHIPPED, DELIVERED
  shippingAddress: jsonb('shipping_address').notNull(),
  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  trackingNumber: text('tracking_number'),
  internalNotes: jsonb('internal_notes').$type<any[]>().default([]), // array of { note, addedBy, addedAt }
  refundStatus: text('refund_status').default('NONE'), // NONE, REQUESTED, APPROVED, REJECTED, COMPLETED
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
  refundReason: text('refund_reason'),
  cancelledReason: text('cancelled_reason'),
  invoiceNumber: text('invoice_number').unique(),
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
  status: text('status').default('PENDING'), // PENDING, APPROVED, REJECTED
  adminReply: text('admin_reply'),
  isFeatured: boolean('is_featured').default(false),
  reportCount: integer('report_count').default(0),
  isReported: boolean('is_reported').default(false),
  createdAt: timestamp('created_at').defaultNow(),
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
  type: text('type').notNull().default('HOMEPAGE'), // 'HOMEPAGE'/'CATEGORY'/'FESTIVAL'/'OFFER'/'SLIDER'/'HERO'/'POPUP'
  title: text('title'),
  subtitle: text('subtitle'),
  image: text('image').notNull(),
  mobileImage: text('mobile_image'),
  link: text('link'),
  sortOrder: integer('sort_order').default(0),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const shippingRules = pgTable('shipping_rules', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  minOrderValue: decimal('min_order_value', { precision: 10, scale: 2 }),
  appliesToStates: jsonb('applies_to_states').$type<string[]>(),
  isActive: boolean('is_active').default(true),
});

export const deliveryHolidays = pgTable('delivery_holidays', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  description: text('description'),
  appliesToStates: jsonb('applies_to_states').$type<string[]>(),
});


export const failedLoginAttempts = pgTable('failed_login_attempts', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  attemptedAt: timestamp('attempted_at').defaultNow(),
});

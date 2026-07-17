import { pgTable, uuid, text, decimal, integer, boolean, timestamp, serial, pgEnum, AnyPgColumn } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const storeStatusEnum = pgEnum('store_status', ['active', 'pending', 'suspended']);
export const productStatusEnum = pgEnum('product_status', ['active', 'draft', 'archived']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
export const transactionTypeEnum = pgEnum('transaction_type', ['payment', 'charge', 'refund', 'adjustment']);

// Stores Table
export const stores = pgTable('stores', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(), // The admin/user ID owning this store
  name: text('name').notNull(),
  contactName: text('contact_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  address: text('address').notNull(),
  creditLimit: decimal('credit_limit', { precision: 12, scale: 2 }).default('0').notNull(),
  currentBalance: decimal('current_balance', { precision: 12, scale: 2 }).default('0').notNull(),
  paymentTerms: text('payment_terms'),
  isFrozen: boolean('is_frozen').default(false).notNull(),
  frozenReason: text('frozen_reason'),
  status: storeStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Categories Table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  parentId: uuid('parent_id').references((): AnyPgColumn => categories.id),
});

// Products Table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  barcode: text('barcode').unique(),
  brand: text('brand'),
  model: text('model'),
  description: text('description'),
  categoryId: uuid('category_id').references(() => categories.id),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  stockQuantity: integer('stock_quantity').default(0).notNull(),
  minOrderQty: integer('min_order_qty').default(1).notNull(),
  imageUrl: text('image_url'),
  nameHe: text('name_he'),
  brandHe: text('brand_he'),
  modelHe: text('model_he'),
  status: productStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Orders Table
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').references(() => stores.id).notNull(),
  orderNumber: serial('order_number').notNull(),
  status: orderStatusEnum('status').default('pending').notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  itemsCount: integer('items_count').notNull(),
  shippingMethod: text('shipping_method'),
  comaxRef: text('comax_ref'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Order Items Table
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Transactions Table (Financial Ledger)
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').references(() => stores.id).notNull(),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Search Engine Mappings (Hebrew -> English translation dictionary)
export const searchMappings = pgTable('search_mappings', {
  id: serial('id').primaryKey(),
  hebrewTerm: text('hebrew_term').notNull().unique(),
  englishTerm: text('english_term').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Search Analytics Logs
export const searchLogs = pgTable('search_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  query: text('query').notNull(),
  resultsCount: integer('results_count').notNull(),
  userId: text('user_id'), // clerk user id
  userEmail: text('user_email'),
  platform: text('platform'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

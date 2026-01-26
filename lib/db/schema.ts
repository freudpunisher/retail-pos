import { pgTable, text, integer, timestamp, numeric, uuid, pgEnum, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "cashier"])
export const transactionTypeEnum = pgEnum("transaction_type", ["sale", "purchase", "credit_payment"])
export const transactionStatusEnum = pgEnum("transaction_status", ["completed", "pending", "cancelled"])
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "credit", "card"])
export const poStatusEnum = pgEnum("po_status", ["pending", "received", "cancelled"])
export const stockMovementTypeEnum = pgEnum("stock_movement_type", ["sale", "purchase", "adjustment"])
export const creditStatusEnum = pgEnum("credit_status", ["paid", "partial", "overdue", "pending"])
export const creditPaymentMethodEnum = pgEnum("credit_payment_method", ["cash", "card"])
export const inventoryAdjustmentTypeEnum = pgEnum("inventory_adjustment_type", ["stock_count", "damage", "loss", "return", "transfer", "correction", "opening_stock"])
export const inventorySessionStatusEnum = pgEnum("inventory_session_status", ["in_progress", "completed", "reconciled"])

// Tables
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    role: userRoleEnum("role").notNull().default("cashier"),
    password: text("password").notNull(),
    avatar: text("avatar"),
})

export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
})

export const products = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    sku: text("sku").notNull().unique(),
    name: text("name").notNull(),
    categoryId: uuid("category_id").references(() => categories.id),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    cost: numeric("cost", { precision: 12, scale: 2 }),
    stock: integer("stock").notNull().default(0), // Kept for backward compatibility/simplicity
    minStock: integer("min_stock").notNull().default(0),
    image: text("image"),
})

export const stock = pgTable("stock", {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    quantityOnHand: integer("quantity_on_hand").notNull().default(0),
    quantityReserved: integer("quantity_reserved").notNull().default(0),
    reorderLevel: integer("reorder_level").notNull().default(10),
    reorderQuantity: integer("reorder_quantity").notNull().default(20),
    lastCountedDate: timestamp("last_counted_date"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const stockAdjustments = pgTable("stock_adjustments", {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    quantityChange: integer("quantity_change").notNull(),
    adjustmentType: inventoryAdjustmentTypeEnum("adjustment_type").notNull(),
    reason: text("reason").notNull(),
    referenceNumber: text("reference_number"),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    createdDate: timestamp("created_date").notNull().defaultNow(),
    notes: text("notes"),
})

export const inventory = pgTable("inventory", {
    id: uuid("id").primaryKey().defaultRandom(),
    countDate: timestamp("count_date").notNull().defaultNow(),
    countedBy: uuid("counted_by").notNull().references(() => users.id),
    status: inventorySessionStatusEnum("status").notNull().default("in_progress"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const inventoryItems = pgTable("inventory_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    inventoryId: uuid("inventory_id").notNull().references(() => inventory.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    quantityInStock: integer("quantity_in_stock").notNull().default(0),
    physicalQuantity: integer("physical_quantity").notNull(),
    variance: integer("variance").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clients = pgTable("clients", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    creditBalance: numeric("credit_balance", { precision: 12, scale: 2 }).notNull().default("0"),
    creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }).notNull().default("0"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const suppliers = pgTable("suppliers", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    isActive: boolean("is_active").notNull().default(true),
})

export const transactions = pgTable("transactions", {
    id: uuid("id").primaryKey().defaultRandom(),
    type: transactionTypeEnum("type").notNull(),
    date: timestamp("date").notNull().defaultNow(),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    status: transactionStatusEnum("status").notNull().default("completed"),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    clientId: uuid("client_id").references(() => clients.id),
    userId: uuid("user_id").notNull().references(() => users.id),
})

export const transactionItems = pgTable("transaction_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    transactionId: uuid("transaction_id").notNull().references(() => transactions.id),
    productId: uuid("product_id").notNull().references(() => products.id),
    productName: text("product_name").notNull(), // Denormalized for records
    quantity: integer("quantity").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
})

export const purchaseOrders = pgTable("purchase_orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
    date: timestamp("date").notNull().defaultNow(),
    status: poStatusEnum("status").notNull().default("pending"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
})

export const purchaseOrderItems = pgTable("purchase_order_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    purchaseOrderId: uuid("purchase_order_id").notNull().references(() => purchaseOrders.id),
    productId: uuid("product_id").notNull().references(() => products.id),
    productName: text("product_name").notNull(), // Denormalized
    quantity: integer("quantity").notNull(),
    cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
})

export const stockMovements = pgTable("stock_movements", {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => products.id),
    productName: text("product_name").notNull(), // Denormalized
    type: stockMovementTypeEnum("type").notNull(),
    quantity: integer("quantity").notNull(),
    date: timestamp("date").notNull().defaultNow(),
    userId: uuid("user_id").notNull().references(() => users.id),
    notes: text("notes"),
})

export const creditRecords = pgTable("credit_records", {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id").notNull().references(() => clients.id),
    transactionId: uuid("transaction_id").notNull().references(() => transactions.id),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    dueDate: timestamp("due_date").notNull(),
    status: creditStatusEnum("status").notNull().default("pending"),
})

export const creditPayments = pgTable("credit_payments", {
    id: uuid("id").primaryKey().defaultRandom(),
    creditRecordId: uuid("credit_record_id").notNull().references(() => creditRecords.id),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    date: timestamp("date").notNull().defaultNow(),
    method: creditPaymentMethodEnum("method").notNull(),
})

export const storeSettings = pgTable("store_settings", {
    id: uuid("id").primaryKey().defaultRandom(), // Added ID for Drizzle
    name: text("name").notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    currencySymbol: text("currency_symbol").notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    transactions: many(transactions),
    stockMovements: many(stockMovements),
    stockAdjustments: many(stockAdjustments),
    inventorySessions: many(inventory),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    stock: one(stock, {
        fields: [products.id],
        references: [stock.productId],
    }),
    stockAdjustments: many(stockAdjustments),
    transactionItems: many(transactionItems),
    purchaseOrderItems: many(purchaseOrderItems),
    stockMovements: many(stockMovements),
    inventoryItems: many(inventoryItems),
}))

export const stockRelations = relations(stock, ({ one }) => ({
    product: one(products, {
        fields: [stock.productId],
        references: [products.id],
    }),
}))

export const stockAdjustmentsRelations = relations(stockAdjustments, ({ one }) => ({
    product: one(products, {
        fields: [stockAdjustments.productId],
        references: [products.id],
    }),
    user: one(users, {
        fields: [stockAdjustments.createdBy],
        references: [users.id],
    }),
}))

export const inventoryRelations = relations(inventory, ({ one, many }) => ({
    user: one(users, {
        fields: [inventory.countedBy],
        references: [users.id],
    }),
    items: many(inventoryItems),
}))

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
    session: one(inventory, {
        fields: [inventoryItems.inventoryId],
        references: [inventory.id],
    }),
    product: one(products, {
        fields: [inventoryItems.productId],
        references: [products.id],
    }),
}))

export const clientsRelations = relations(clients, ({ many }) => ({
    transactions: many(transactions),
    creditRecords: many(creditRecords),
}))

export const suppliersRelations = relations(suppliers, ({ many }) => ({
    purchaseOrders: many(purchaseOrders),
}))

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
    client: one(clients, {
        fields: [transactions.clientId],
        references: [clients.id],
    }),
    user: one(users, {
        fields: [transactions.userId],
        references: [users.id],
    }),
    items: many(transactionItems),
    creditRecord: one(creditRecords, {
        fields: [transactions.id],
        references: [creditRecords.transactionId],
    }),
}))

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
    transaction: one(transactions, {
        fields: [transactionItems.transactionId],
        references: [transactions.id],
    }),
    product: one(products, {
        fields: [transactionItems.productId],
        references: [products.id],
    }),
}))

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
    supplier: one(suppliers, {
        fields: [purchaseOrders.supplierId],
        references: [suppliers.id],
    }),
    items: many(purchaseOrderItems),
}))

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
    purchaseOrder: one(purchaseOrders, {
        fields: [purchaseOrderItems.purchaseOrderId],
        references: [purchaseOrders.id],
    }),
    product: one(products, {
        fields: [purchaseOrderItems.productId],
        references: [products.id],
    }),
}))

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
    product: one(products, {
        fields: [stockMovements.productId],
        references: [products.id],
    }),
    user: one(users, {
        fields: [stockMovements.userId],
        references: [users.id],
    }),
}))

export const creditRecordsRelations = relations(creditRecords, ({ one, many }) => ({
    client: one(clients, {
        fields: [creditRecords.clientId],
        references: [clients.id],
    }),
    transaction: one(transactions, {
        fields: [creditRecords.transactionId],
        references: [transactions.id],
    }),
    payments: many(creditPayments),
}))

export const creditPaymentsRelations = relations(creditPayments, ({ one }) => ({
    creditRecord: one(creditRecords, {
        fields: [creditPayments.creditRecordId],
        references: [creditRecords.id],
    }),
}))

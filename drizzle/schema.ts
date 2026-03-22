import {
  bigint,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  date,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Dados para Woovi / PIX
  fullName: varchar("fullName", { length: 255 }),
  cpf: varchar("cpf", { length: 14 }),
  phone: varchar("phone", { length: 20 }),
  pixKey: varchar("pixKey", { length: 255 }),
  pixKeyType: mysqlEnum("pixKeyType", ["cpf", "email", "phone", "random"]),
  // Status do perfil
  profileComplete: boolean("profileComplete").default(false).notNull(),
  // Saldo disponível para saque (em centavos)
  availableBalance: bigint("availableBalance", { mode: "number" }).default(0).notNull(),
  // Total acumulado ganho (em centavos)
  totalEarned: bigint("totalEarned", { mode: "number" }).default(0).notNull(),
  // Total de cotas possuídas
  totalShares: int("totalShares").default(0).notNull(),
  // Membro da comunidade WhatsApp
  joinedWhatsapp: boolean("joinedWhatsapp").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de cotas (ações) compradas pelos acionistas.
 * Cada registro representa um lote de cotas de uma compra.
 */
export const sharesPurchases = mysqlTable("shares_purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  quantity: int("quantity").notNull(), // Quantidade de cotas compradas
  pricePerShare: decimal("pricePerShare", { precision: 10, scale: 2 }).notNull(), // R$ 9,90
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(), // Total pago
  // Dados Woovi
  wooviChargeId: varchar("wooviChargeId", { length: 255 }),
  wooviCorrelationId: varchar("wooviCorrelationId", { length: 255 }),
  pixQrCode: text("pixQrCode"), // QR Code PIX
  pixCopyPaste: text("pixCopyPaste"), // Código copia e cola
  // Status do pagamento
  status: mysqlEnum("status", ["pending", "paid", "expired", "cancelled"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  // Lock de 12 meses
  lockUntil: timestamp("lockUntil"), // Data até quando as cotas ficam bloqueadas
  // Elegibilidade para revenda
  canSell: boolean("canSell").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SharesPurchase = typeof sharesPurchases.$inferSelect;
export type InsertSharesPurchase = typeof sharesPurchases.$inferInsert;

/**
 * Tabela de ganhos diários lançados pelo admin.
 * Registra o total de comissões do dia e a distribuição.
 */
export const dailyEarnings = mysqlTable("daily_earnings", {
  id: int("id").autoincrement().primaryKey(),
  date: date("date").notNull(), // Data de referência
  totalCommission: decimal("totalCommission", { precision: 12, scale: 2 }).notNull(), // Total bruto
  distributedAmount: decimal("distributedAmount", { precision: 12, scale: 2 }).notNull(), // 95% distribuído
  retainedAmount: decimal("retainedAmount", { precision: 12, scale: 2 }).notNull(), // 5% retido
  totalSharesAtTime: int("totalSharesAtTime").notNull(), // Total de cotas no momento
  activeShareholdersAtTime: int("activeShareholdersAtTime").notNull(), // Acionistas ativos
  notes: text("notes"), // Observações do admin
  processedAt: timestamp("processedAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(), // Admin que lançou
});

export type DailyEarning = typeof dailyEarnings.$inferSelect;
export type InsertDailyEarning = typeof dailyEarnings.$inferInsert;

/**
 * Tabela de distribuições individuais por acionista.
 * Cada registro representa o crédito de um acionista em um dia.
 */
export const shareholderEarnings = mysqlTable("shareholder_earnings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  dailyEarningId: int("dailyEarningId").notNull(),
  date: date("date").notNull(),
  sharesAtTime: int("sharesAtTime").notNull(), // Cotas do acionista no momento
  percentageAtTime: decimal("percentageAtTime", { precision: 10, scale: 6 }).notNull(), // % do total
  amount: decimal("amount", { precision: 12, scale: 4 }).notNull(), // Valor creditado (em reais)
  amountCents: bigint("amountCents", { mode: "number" }).notNull(), // Valor em centavos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShareholderEarning = typeof shareholderEarnings.$inferSelect;
export type InsertShareholderEarning = typeof shareholderEarnings.$inferInsert;

/**
 * Tabela de saques solicitados pelos acionistas.
 */
export const withdrawals = mysqlTable("withdrawals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(), // Valor solicitado
  amountCents: bigint("amountCents", { mode: "number" }).notNull(), // Em centavos
  pixKey: varchar("pixKey", { length: 255 }).notNull(), // Chave PIX do acionista
  pixKeyType: varchar("pixKeyType", { length: 20 }).notNull(),
  // Dados Woovi
  wooviPaymentId: varchar("wooviPaymentId", { length: 255 }),
  wooviCorrelationId: varchar("wooviCorrelationId", { length: 255 }),
  // Status
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending").notNull(),
  processedAt: timestamp("processedAt"),
  failureReason: text("failureReason"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = typeof withdrawals.$inferInsert;

/**
 * Tabela de links de afiliados gerenciados pelo admin.
 */
export const affiliateLinks = mysqlTable("affiliate_links", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["shopee", "mercadolivre"]).notNull(),
  url: text("url").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  validFrom: date("validFrom"),
  validUntil: date("validUntil"),
  clickCount: int("clickCount").default(0).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type InsertAffiliateLink = typeof affiliateLinks.$inferInsert;

/**
 * Tabela de notificações para usuários.
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "earning_credited",
    "share_purchase_confirmed",
    "withdrawal_approved",
    "withdrawal_processed",
    "withdrawal_failed",
    "new_affiliate_link",
    "system_message",
    "admin_new_purchase",
    "admin_withdrawal_request",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  metadata: text("metadata"), // JSON com dados extras
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Tabela de configurações globais da plataforma.
 */
export const platformSettings = mysqlTable("platform_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;

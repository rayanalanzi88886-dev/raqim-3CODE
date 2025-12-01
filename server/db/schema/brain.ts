import { pgTable, uuid, text, timestamp, pgEnum, jsonb, integer } from 'drizzle-orm/pg-core';

// Enums
export const noteTypeEnum = pgEnum('note_type', ['idea', 'decision', 'insight', 'task', 'reference']);

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Notes table
export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id),
  title: text('title').notNull(),
  content: text('content'),
  type: noteTypeEnum('type').default('idea'),
  tags: jsonb('tags').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Conversation sessions table
export const conversationSessions = pgTable('conversation_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id),
  title: text('title').notNull(),
  summary: text('summary'),
  messageCount: integer('message_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Messages table with quality evaluations
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => conversationSessions.id),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  // Quality evaluation fields
  qualityScore: integer('quality_score'),
  lengthScore: integer('length_score'),
  repetitionScore: integer('repetition_score'),
  structureScore: integer('structure_score'),
  evaluation: jsonb('evaluation').$type<{
    length: { score: number; feedback: string };
    repetition: { score: number; feedback: string };
    structure: { score: number; feedback: string };
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Decision logs table
export const decisionLogs = pgTable('decision_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id),
  sessionId: uuid('session_id').references(() => conversationSessions.id),
  title: text('title').notNull(),
  description: text('description'),
  reasoning: text('reasoning'),
  outcome: text('outcome'),
  status: text('status').default('pending'), // pending, implemented, rejected
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Types for TypeScript
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export type ConversationSession = typeof conversationSessions.$inferSelect;
export type NewConversationSession = typeof conversationSessions.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type DecisionLog = typeof decisionLogs.$inferSelect;
export type NewDecisionLog = typeof decisionLogs.$inferInsert;

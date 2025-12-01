import { pgTable, uuid, text, timestamp, pgEnum, jsonb, integer } from 'drizzle-orm/pg-core';
import { projects } from './brain';

// Enums
export const workflowTypeEnum = pgEnum('workflow_type', ['content', 'research', 'project']);
export const stageTypeEnum = pgEnum('stage_type', ['idea', 'research', 'outline', 'draft', 'improve', 'schedule']);

// Workflows table
export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id),
  name: text('name').notNull(),
  description: text('description'),
  type: workflowTypeEnum('type').default('content'),
  currentStage: stageTypeEnum('current_stage').default('idea'),
  status: text('status').default('active'), // active, completed, paused
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Workflow stages (template)
export const workflowStages = pgTable('workflow_stages', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').references(() => workflows.id),
  stage: stageTypeEnum('stage').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  order: integer('order').notNull(),
  isCompleted: text('is_completed').default('false'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Workflow states (saves progress for each stage)
export const workflowStates = pgTable('workflow_states', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').references(() => workflows.id),
  stage: stageTypeEnum('stage').notNull(),
  content: text('content'), // Main content for the stage
  metadata: jsonb('metadata').$type<{
    notes?: string;
    sources?: string[];
    keywords?: string[];
    targetAudience?: string;
    tone?: string;
    wordCount?: number;
    scheduledDate?: string;
    platform?: string;
  }>(),
  status: text('status').default('not_started'), // not_started, in_progress, completed
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Types for TypeScript
export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;

export type WorkflowStage = typeof workflowStages.$inferSelect;
export type NewWorkflowStage = typeof workflowStages.$inferInsert;

export type WorkflowState = typeof workflowStates.$inferSelect;
export type NewWorkflowState = typeof workflowStates.$inferInsert;

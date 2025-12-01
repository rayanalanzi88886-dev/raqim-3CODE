import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as brainSchema from './schema/brain';
import * as workbenchSchema from './schema/workbench';

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/raqim';

// For query purposes
const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, {
  schema: { ...brainSchema, ...workbenchSchema },
});

export * from './schema/brain';
export * from './schema/workbench';

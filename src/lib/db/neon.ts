import { neon } from '@neondatabase/serverless';

// Create a SQL client using the Neon serverless driver
// Use as a tagged template: sql`SELECT * FROM users WHERE id = ${id}`
export const sql = neon(process.env.DATABASE_URL!);

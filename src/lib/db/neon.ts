import { neon } from '@neondatabase/serverless';

// Create a SQL client using the Neon serverless driver
// Use as a tagged template: sql`SELECT * FROM users WHERE id = ${id}`
// Uses a dummy URL during build time to prevent errors, actual URL is used at runtime
export const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy.neon.tech/dummy');

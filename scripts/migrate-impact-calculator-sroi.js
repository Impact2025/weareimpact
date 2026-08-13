// Run with: node scripts/migrate-impact-calculator-sroi.js
// Adds investering_kosten, avoided_verzuim_euro, sroi_ratio to impact_calculator_leads
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }
  const sql = neon(databaseUrl);

  console.log('Migrating impact_calculator_leads — adding SROI columns...\n');
  try {
    await sql`ALTER TABLE impact_calculator_leads ADD COLUMN IF NOT EXISTS investering_kosten NUMERIC(10,2)`;
    console.log('  investering_kosten added');
    await sql`ALTER TABLE impact_calculator_leads ADD COLUMN IF NOT EXISTS avoided_verzuim_euro NUMERIC(12,2)`;
    console.log('  avoided_verzuim_euro added');
    await sql`ALTER TABLE impact_calculator_leads ADD COLUMN IF NOT EXISTS sroi_ratio NUMERIC(6,2)`;
    console.log('  sroi_ratio added');
    console.log('\nMigration complete.');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrate();

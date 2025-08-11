import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

/**
 * Initialize the scheduling database schema
 * Creates tables at runtime to avoid committing binary database changes
 */
export function initializeSchedulingSchema(db: Database.Database): void {
  try {
    console.log('Initializing scheduling database schema...');
    
    // Read and execute the schema SQL file
    const schemaPath = join(__dirname, 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute within a transaction for atomicity
    const transaction = db.transaction(() => {
      for (const statement of statements) {
        try {
          db.exec(statement);
        } catch (error) {
          console.error(`Error executing SQL statement: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    });
    
    transaction();
    
    console.log('✅ Scheduling database schema initialized successfully');
    
    // Verify tables were created
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name LIKE '%' 
      ORDER BY name
    `).all();
    
    const schedulingTables = tables.filter((table: any) => 
      ['event_types', 'availability_rules', 'availability_exceptions', 'bookings', 'invitees', 'event_type_questions', 'question_answers', 'notifications'].includes(table.name)
    );
    
    console.log(`📊 Scheduling tables created: ${schedulingTables.map((t: any) => t.name).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Failed to initialize scheduling database schema:', error);
    throw error;
  }
}

/**
 * Get scheduling database statistics
 */
export function getSchedulingStats(db: Database.Database) {
  try {
    const stats = {
      eventTypes: db.prepare('SELECT COUNT(*) as count FROM event_types WHERE is_active = 1').get(),
      availabilityRules: db.prepare('SELECT COUNT(*) as count FROM availability_rules WHERE is_active = 1').get(),
      totalBookings: db.prepare('SELECT COUNT(*) as count FROM bookings').get(),
      activeBookings: db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'").get(),
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting scheduling stats:', error);
    return null;
  }
}
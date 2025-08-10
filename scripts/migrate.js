#!/usr/bin/env node

// Migration script to populate SQLite database with initial data
const { migrationService } = require('../src/lib/migration.ts');

async function runMigration() {
  console.log('🚀 Starting database migration...\n');
  
  try {
    // Run complete migration
    const result = await migrationService.runCompleteMigration();
    
    if (result.success) {
      console.log('✅ Migration completed successfully!');
      console.log(`📊 ${result.message}`);
      
      // Show migration status
      const status = await migrationService.checkMigrationStatus();
      if (status.success) {
        console.log('\n📈 Database Status:');
        console.log(`   - Blog Posts: ${status.details.blogPosts}`);
        console.log(`   - Projects: ${status.details.projects}`);
        console.log(`   - Contact Messages: ${status.details.contactMessages}`);
      }
    } else {
      console.error('❌ Migration failed:', result.message);
      if (result.details) {
        console.error('Details:', result.details);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
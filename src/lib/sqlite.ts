// Re-export everything from database.ts for compatibility
export * from './database';

// Additional SQLite-specific utilities
import { db } from './database';

export const sqliteUtils = {
  // Backup database
  backup(backupPath: string) {
    try {
      db.backup(backupPath);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get database info
  getInfo() {
    try {
      const info = {
        filename: db.name,
        open: db.open,
        inTransaction: db.inTransaction,
        readonly: db.readonly,
        memory: db.memory
      };
      return { data: info, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Optimize database
  optimize() {
    try {
      db.pragma('optimize');
      db.exec('VACUUM');
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get table info
  getTableInfo(tableName: string) {
    try {
      const info = db.pragma(`table_info(${tableName})`);
      return { data: info, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Execute raw SQL (use with caution)
  executeRaw(sql: string, params: any[] = []) {
    try {
      const result = db.prepare(sql).all(...params);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};
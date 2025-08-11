import Database from 'better-sqlite3';

export interface AuditLogEntry {
  admin_user: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Admin audit logging service
 * Records all admin actions for compliance and security
 */
export class AdminAuditService {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Log an admin action
   */
  logAction(entry: AuditLogEntry): void {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO admin_audit_logs (
          admin_user, action, resource_type, resource_id, 
          old_values, new_values, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        entry.admin_user,
        entry.action,
        entry.resource_type,
        entry.resource_id || null,
        entry.old_values ? JSON.stringify(entry.old_values) : null,
        entry.new_values ? JSON.stringify(entry.new_values) : null,
        entry.ip_address || null,
        entry.user_agent || null
      );
    } catch (error) {
      console.error('Failed to log admin action:', error);
      // Don't throw - audit logging shouldn't break the main operation
    }
  }

  /**
   * Get audit logs with pagination and filtering
   */
  getLogs(options: {
    limit?: number;
    offset?: number;
    admin_user?: string;
    resource_type?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
  } = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        admin_user,
        resource_type,
        action,
        start_date,
        end_date
      } = options;

      let query = 'SELECT * FROM admin_audit_logs';
      const conditions: string[] = [];
      const params: any[] = [];

      if (admin_user) {
        conditions.push('admin_user = ?');
        params.push(admin_user);
      }

      if (resource_type) {
        conditions.push('resource_type = ?');
        params.push(resource_type);
      }

      if (action) {
        conditions.push('action = ?');
        params.push(action);
      }

      if (start_date) {
        conditions.push('created_at >= ?');
        params.push(start_date);
      }

      if (end_date) {
        conditions.push('created_at <= ?');
        params.push(end_date);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const logs = this.db.prepare(query).all(...params);

      return logs.map((log: any) => ({
        ...log,
        old_values: log.old_values ? JSON.parse(log.old_values) : null,
        new_values: log.new_values ? JSON.parse(log.new_values) : null
      }));
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit log statistics
   */
  getStats(): {
    total_logs: number;
    recent_actions: number;
    unique_admins: number;
  } {
    try {
      const totalLogs = this.db.prepare('SELECT COUNT(*) as count FROM admin_audit_logs').get() as any;
      
      const recentActions = this.db.prepare(`
        SELECT COUNT(*) as count FROM admin_audit_logs 
        WHERE created_at >= datetime('now', '-24 hours')
      `).get() as any;
      
      const uniqueAdmins = this.db.prepare(`
        SELECT COUNT(DISTINCT admin_user) as count FROM admin_audit_logs
      `).get() as any;

      return {
        total_logs: totalLogs.count,
        recent_actions: recentActions.count,
        unique_admins: uniqueAdmins.count
      };
    } catch (error) {
      console.error('Failed to get audit stats:', error);
      return {
        total_logs: 0,
        recent_actions: 0,
        unique_admins: 0
      };
    }
  }
}
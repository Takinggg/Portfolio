let db: any = null;

export function initializeDatabase() {
  if (!db) {
    db = {}; // Remplace {} par l'initialisation réelle selon ta stack (ex: new SQL.Database())
    // ...autre logique d'initialisation...
  }
  return db;
}

export function getDatabase() {
  return db;
}

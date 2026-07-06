import { db } from './index.ts';
import { clients, communications, projects, notes, reminders, documents, activities } from './schema.ts';

export async function seedDatabase() {
  try {
    console.log('Resetting and purging any old fictional seed data to preserve clean workspace state...');
    
    // Purge old mock lists cascadingly
    await db.delete(communications);
    await db.delete(projects);
    await db.delete(notes);
    await db.delete(reminders);
    await db.delete(documents);
    await db.delete(activities);
    await db.delete(clients);
    
    console.log('Fictional client database portfolios cleared successfully. Standard empty slate loaded.');
  } catch (err) {
    console.error('Error or issue when resetting/clearing database:', err);
  }
}

import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, name: string = '', role: string = 'Employee') {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        name,
        role,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database query failed in getOrCreateUser:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

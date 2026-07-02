import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, name: string) {
  // Check for Super Admin based on env variable
  const superAdminEmail = process.env.ADMIN_EMAIL || 'admin@giftjoy.com';
  const role = email === superAdminEmail ? 'ADMIN' : 'USER';

  const result = await db.insert(users)
    .values({
      uid,
      email,
      name,
      role
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
        name,
        role // Always update role if config changed
      },
    })
    .returning();

  return result[0];
}

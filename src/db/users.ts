import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name: string) {
  const existingUser = await db.select().from(users).where(eq(users.uid, uid));

  if (existingUser.length > 0) {
    // Check if we need to upgrade to admin based on env var, but never downgrade an existing admin
    const superAdminEmail = process.env.ADMIN_EMAIL || 'admin@giftjoy.com';
    let updatedRole = existingUser[0].role;
    if (email === superAdminEmail && updatedRole !== 'ADMIN') {
      updatedRole = 'ADMIN';
    }

    const result = await db.update(users).set({
      email,
      name,
      role: updatedRole
    }).where(eq(users.uid, uid)).returning();
    
    return result[0];
  }

  // Check for Super Admin based on env variable for initial creation
  const superAdminEmail = process.env.ADMIN_EMAIL || 'admin@giftjoy.com';
  const role = email === superAdminEmail ? 'ADMIN' : 'USER';

  const result = await db.insert(users)
    .values({
      uid,
      email,
      name,
      role
    })
    .returning();

  return result[0];
}

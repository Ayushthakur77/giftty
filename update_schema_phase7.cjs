const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf-8');

// Add to users
code = code.replace(
  "isBlacklisted: boolean('is_blacklisted').default(false),",
  "isBlacklisted: boolean('is_blacklisted').default(false),\n  twoFactorEnabled: boolean('two_factor_enabled').default(false),\n  twoFactorSecret: text('two_factor_secret'),\n  lastPasswordChangeAt: timestamp('last_password_change_at'),"
);

// Add failed_login_attempts
const table = `
export const failedLoginAttempts = pgTable('failed_login_attempts', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  attemptedAt: timestamp('attempted_at').defaultNow(),
});
`;

code += "\n" + table;
fs.writeFileSync('src/db/schema.ts', code);

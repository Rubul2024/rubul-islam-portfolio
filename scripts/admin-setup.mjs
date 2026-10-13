// Generates the admin login variables for .env.local.
//
//   npm run admin:setup
//   npm run admin:setup -- "your-strong-password"
//
// Prints a bcrypt hash of the password and a random session secret. The
// password itself is never stored anywhere.

import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import bcrypt from "bcrypt";

let password = process.argv[2];

if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question("Choose an admin password (12+ characters): ");
  rl.close();
}

if (!password || password.length < 12) {
  console.error("\n✖ Use a password of at least 12 characters.\n");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const secret = randomBytes(32).toString("base64url");

console.log(`
Add these lines to .env.local (and to your host's environment variables):

ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD_HASH=${hash.replace(/\$/g, "\\$")}
ADMIN_SESSION_SECRET=${secret}

• Replace ADMIN_EMAIL with the email you'll sign in with.
• The "\\$" escapes stop .env files from treating "$" as a variable; the app
  accepts the hash with or without them, so paste it the same way on Vercel.
• Changing ADMIN_SESSION_SECRET signs you out everywhere.
`);

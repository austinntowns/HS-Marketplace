import { db } from "../src/db"
import { users } from "../src/db/schema/auth"
import { eq } from "drizzle-orm"

const email = process.argv[2] || "austin@hellosugar.salon"

async function grantAdmin() {
  const result = await db
    .update(users)
    .set({ role: "admin", sellerAccess: true })
    .where(eq(users.email, email))
    .returning({ id: users.id, email: users.email, role: users.role })

  if (result.length === 0) {
    console.log(`No user found with email: ${email}`)
    process.exit(1)
  }

  console.log(`Granted admin + seller access to: ${result[0].email}`)
  process.exit(0)
}

grantAdmin().catch(console.error)

import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { migrate } from "drizzle-orm/neon-http/migrator"
import { config } from "dotenv"

config({ path: ".env.local" })

async function main() {
  if (!process.env.DATABASE_URL_DIRECT) {
    throw new Error("DATABASE_URL_DIRECT is required for migrations")
  }

  const sql = neon(process.env.DATABASE_URL_DIRECT)
  const db = drizzle(sql)

  console.log("Running migrations...")
  await migrate(db, { migrationsFolder: "drizzle" })
  console.log("Migrations complete")
  process.exit(0)
}

main().catch((e) => {
  console.error("Migration failed:", e)
  process.exit(1)
})

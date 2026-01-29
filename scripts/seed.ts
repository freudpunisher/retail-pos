/**
 * Master seed script - runs all seeds in order
 * Usage: npx tsx scripts/seed.ts
 */

import { execSync } from "child_process"

const scripts = [
  { name: "Admin User", script: "seed-admin.ts" },
  { name: "Categories", script: "seed-categories.ts" },
  { name: "Products", script: "seed-products.ts" }
]

async function runSeeds() {
  console.log("🌱 Starting database seeding...\n")

  for (const { name, script } of scripts) {
    try {
      console.log(`▶ Running ${name} seed...`)
      execSync(`npx tsx scripts/${script}`, { stdio: "inherit" })
      console.log("")
    } catch (error) {
      console.error(`✗ Failed to seed ${name}`)
      process.exit(1)
    }
  }

  console.log("✅ All seeds completed successfully!")
  process.exit(0)
}

runSeeds()

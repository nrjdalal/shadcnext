#!/usr/bin/env node
import { create } from "@/src/commands/create"
import { Command } from "commander"
import packageJson from "../package.json"

process.on("SIGINT", () => process.exit(0))
process.on("SIGTERM", () => process.exit(0))

async function main() {
  const program = new Command()
    .name("shadcnext")
    .description("shadcn but for tailwind v4")
    .version(
      packageJson.version || "1.0.0",
      "-v, --version",
      "display the version number",
    )

  program.addCommand(create)

  program.parse()
}

main()

import { appendFile } from "fs/promises"
import { Command } from "commander"
import { execa } from "execa"
import ora from "ora"
import { detect } from "package-manager-detector/detect"

export const create = new Command()
  .name("create")
  .description("create a shadcn project with tailwind v4")
  .action(async () => {
    const spinner = ora("detecting package manager...").start()

    const pm = (await detect()) as {
      name: string
      agent: string
      execute: string
    }

    if (!pm) {
      spinner.fail("package manager not detected.")
      process.exit(1)
    }

    pm.execute =
      pm.agent === "bun"
        ? "bunx"
        : pm.agent === "pnpm"
          ? "pnpm dlx"
          : pm.agent === "yarn"
            ? "yarn dlx"
            : "npx"

    const tmpCwd = "shadcnext"

    const { stdout: gitignore } = await execa("grep", [
      tmpCwd,
      ".gitignore",
    ]).catch(() => ({ stdout: "false" }))

    if (gitignore === "false") {
      spinner.info(`adding ${tmpCwd} to .gitignore...`)
      await appendFile(".gitignore", `\n${tmpCwd}/\n`)
    }

    await execa("rm", ["-rf", tmpCwd])
    await execa("mkdir", ["-p", tmpCwd])

    const execaOpts = { cwd: tmpCwd }
    spinner.start("creating next.js project...")
    await execa(
      pm.execute,
      [
        "create-next-app",
        ".",
        "--ts",
        "--eslint",
        "--tailwind",
        "--src-dir",
        "--app",
        "--import-alias",
        "@/*",
        "--turbopack",
      ],
      execaOpts,
    )
    spinner.succeed("next.js project created.")

    spinner.start("initializing shadcn...")
    await execa(pm.execute, ["shadcn@latest", "init", "-d"], execaOpts)
    spinner.succeed("shadcn initialized.")

    spinner.start("adding shadcn components...")
    await execa(pm.execute, ["shadcn@latest", "add", "-a"], execaOpts)
    spinner.succeed("shadcn components added.")

    spinner.start("upgrading tailwindcss to v4...")
    await execa(pm.execute, ["@tailwindcss/upgrade@next", "--force"], execaOpts)
    spinner.succeed("tailwindcss upgraded to v4.")

    const cleanup = [".git", "node_modules"]

    spinner.start("cleaning up...")
    await execa("rm", ["-rf", ...cleanup], execaOpts)
    spinner.succeed("cleanup complete.")

    spinner.succeed("shadcnext setup complete.")
  })

import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../apps/pocketbase/", import.meta.url).pathname;
const migrations = join(root, "pb_migrations");
const hooks = join(root, "pb_hooks");

for (const dir of [migrations, hooks]) {
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".js"))) {
    execFileSync(process.execPath, ["--check", join(dir, file)], { stdio: "inherit" });
  }
}

console.log("PocketBase JavaScript migrations and hooks: syntax OK");

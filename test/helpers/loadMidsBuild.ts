import fs from "node:fs";

export async function loadMidsBuild(path: string): Promise<string> {
  const raw = await fs.promises.readFile(path, "utf-8");
  return raw.trim();
}
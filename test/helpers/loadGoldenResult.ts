import fs from "node:fs";

export function loadGoldenResult(path: string) {
  return JSON.parse(
    fs.readFileSync(path, "utf-8")
  );
}

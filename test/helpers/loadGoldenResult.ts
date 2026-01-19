import fs from "node:fs";
import { TotalStatistics } from "../../src/core/TotalStatistics";

export function loadGoldenResult(path: string) {
  return JSON.parse(
    fs.readFileSync(path, "utf-8")
  ) as TotalStatistics;
}

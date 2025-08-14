import {
  config as dotenvConfig,
  DotenvConfig,
} from "https://deno.land/x/dotenv/mod.ts";

const env: DotenvConfig = dotenvConfig();

export const FILE_PREFIX: string = env.FILE_PREFIX ?? "DTF-";
export const DEFAULT_FOLDERS: string[] = [
  "Documents",
  "Downloads",
  "Desktop",
  "Pictures",
  "Videos",
  "Music",
];

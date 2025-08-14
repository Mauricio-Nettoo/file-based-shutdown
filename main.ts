import * as path from "jsr:@std/path";

import { config, DotenvConfig } from "https://deno.land/x/dotenv/mod.ts";

const env: DotenvConfig = config();
const FILE_PREFIX = env.FILE_PREFIX || "DTF-";
const DEFAULT_FOLDERS: string[] = [
  "Documents",
  "Downloads",
  "Desktop",
  "Pictures",
  "Videos",
  "Music",
];

function getHomeDir(): string {
  const home: string | undefined = Deno.env.get("USERPROFILE") ??
    Deno.env.get("HOME");
  if (!home) throw new Error("User home folder was not found.");
  return home;
}

async function findFileInFolders(
  filePrefix: string,
  baseDir: string,
  folders: string[],
): Promise<string | null> {
  for (const folder of folders) {
    const dir: string = path.join(baseDir, folder);
    try {
      for await (const entry of Deno.readDir(dir)) {
        if (entry.isFile && entry.name.startsWith(filePrefix)) {
          return path.join(dir, entry.name);
        }
      }
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) continue;
      throw err;
    }
  }
  return null;
}

function stripFileNameFromTime(fileName: string): string {
  return fileName.split(FILE_PREFIX)[1];
}

function convertStringToTimeInSeconds(textTime: string): number {
  const hours: number = Number(textTime.match(/(\d+)h/)?.[1] ?? 0);
  const minutes: number = Number(textTime.match(/(\d+)m/)?.[1] ?? 0);
  const seconds: number = Number(textTime.match(/(\d+)s/)?.[1] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function sleep(timeMs: number): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(timeMs), timeMs);
  });
}

async function turnOffPc(
  timeInSeconds: number,
  dryRun: boolean = false,
): Promise<void> {
  console.log("Press CTRL+C to cancel.");

  const controller: AbortController = new AbortController();
  const signal: AbortSignal = controller.signal;

  Deno.addSignalListener("SIGINT", () => {
    console.log("\nShutdown canceled!");
    controller.abort();
  });

  for (let i = timeInSeconds; i > 0; i--) {
    await sleep(1000); // 1 sec
    await Deno.stdout.write(new TextEncoder().encode(`\rShutdown in: ${i}s`));
    if (signal.aborted) return;
  }

  console.log("\nShuting down…");
  if (!dryRun) {
    await new Deno.Command("cmd", {
      args: ["/c", "shutdown", "/s", "/t", "0"],
    }).output();
  } else {
    console.log("(No shutdown: Just testing!)");
  }
}

// Teste of something that can or not work out.
async function main() {
  const home: string = getHomeDir();
  const filePath = await findFileInFolders(FILE_PREFIX, home, DEFAULT_FOLDERS);
  if (!filePath) {
    console.error("App file not found.");
    Deno.exit(1);
  }

  const time: string = stripFileNameFromTime(filePath);
  const timeInSeconds: number = convertStringToTimeInSeconds(time);
  await turnOffPc(timeInSeconds);
}

if (import.meta.main) {
  await main();
}

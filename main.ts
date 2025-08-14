import * as os from "node:os";
import * as path from "jsr:@std/path";

import { config, DotenvConfig } from "https://deno.land/x/dotenv/mod.ts";

const env: DotenvConfig = config();
const FILE_PREFIX = env.FILE_PREFIX || "DTF-";

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

async function getAppExecutablePath(): Promise<string | null> {
  const placesToLookFor: string[] = [
    "Documents",
    "Downloads",
    "Desktop",
    "Pictures",
    "Videos",
    "Music",
  ];
  const home: string = getHomeDir();

  for (const folder of placesToLookFor) {
    const dir: string = path.join(home, folder);
    try {
      for await (const entry of Deno.readDir(dir)) {
        if (entry.isFile && entry.name.startsWith(FILE_PREFIX)) {
          return path.join(dir, entry.name);
        }
      }
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) continue;
      if (err instanceof Error) {
        console.warn(`Ignoring dir ${dir}: ${err.message}`);
      }
    }
  }

  console.error("File not found in default places.");
  return null;
}

function stripFileNameFromTime(fileName: string): string {
  return fileName.split(FILE_PREFIX)[1];
}

function convertStringToTimeInSeconds(textTime: string): number {
  let hours: number = 0;
  let minutes: number = 0;
  let seconds: number = 0;

  let previousChars: string = "";

  for (const char of textTime) {
    if (isLetter(char) && char == "h") {
      hours += Number(previousChars);
      previousChars = "";
      continue;
    }

    if (isLetter(char) && char == "m") {
      minutes += Number(previousChars);
      previousChars = "";
      continue;
    }

    if (isLetter(char) && char == "s") {
      seconds += Number(previousChars);
      break;
    }

    previousChars += char;
  }

  const timeInSeconds: number = (hours * 60 * 60) + (minutes * 60) + seconds;

  return timeInSeconds;
}

function isLetter(value: string): boolean {
  return /^[a-zA-Z]$/.test(value);
}

function sleep(timeMs: number): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(timeMs), timeMs);
  });
}

async function turnOffPc(timeInSeconds: number): Promise<void> {
  do {
    console.log(`Turning off PC in: ${timeInSeconds}`);
    timeInSeconds--;
    await sleep(1000);
    console.clear();
  } while (timeInSeconds > 0);
  const outpout = await new Deno.Command("cmd", {
    args: ["/c", "shutdown /s /t 0"],
  }).output();
  console.log(outpout);
}

// Teste of something that can or not work out.
async function main() {
  const appFileName: string | null = await getAppExecutableName();
  if (!appFileName) throw new Error("file name not found");
  const time: string = stripFileNameFromTime(appFileName);
  const timeInSeconds: number = convertStringToTimeInSeconds(time);
  await turnOffPc(timeInSeconds);
}

if (import.meta.main) {
  await main();
}

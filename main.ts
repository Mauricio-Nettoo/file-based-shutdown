import * as os from "node:os";
import * as path from "jsr:@std/path";

import { config, DotenvConfig } from "https://deno.land/x/dotenv/mod.ts";

const env: DotenvConfig = config();
const FILE_BASE_NAME = env.FILE_BASE_NAME || "DTF-";

async function getAppExecutableName(): Promise<string | null> {
  const placesToLookFor: string[] = [
    "Documents",
    "Downloads",
    "Desktop",
    "Pictures",
    "Videos",
    "Music",
  ];

  const userHomeFolder: string = os.homedir();

  for (const folder of placesToLookFor) {
    const filePath: string = path.join(userHomeFolder, folder);

    for await (const entry of Deno.readDir(filePath)) {
      if (!entry.isFile) continue;

      if (entry.name.includes(FILE_BASE_NAME)) return entry.name;
    }
  }

  console.error("File not found ANYWHERE!");

  return null;
}

function stripFileNameFromTime(fileName: string): string {
  return fileName.split(FILE_BASE_NAME)[1];
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

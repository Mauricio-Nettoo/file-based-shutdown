import { DEFAULT_FOLDERS, FILE_PREFIX } from "./config.ts";
import { extractTimeFromFileNameV1Sync } from "./utils/extract-time-from-file-name.ts";
import { findFileInFolders } from "./utils/find-file.ts";

function getHomeDir(): string {
  const home: string | undefined = Deno.env.get("USERPROFILE") ??
    Deno.env.get("HOME");
  if (!home) throw new Error("User home folder was not found.");
  return home;
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
    controller.abort();
    console.log("\nShutdown canceled!");
  });

  for (let i = timeInSeconds; i > 0; i--) {
    if (signal.aborted) return;
    await Deno.stdout.write(new TextEncoder().encode(`\rShutdown in: ${i}s`));
    await sleep(1000); // 1 sec
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

  const time: string = extractTimeFromFileNameV1Sync(filePath);
  const timeInSeconds: number = convertStringToTimeInSeconds(time);
  await turnOffPc(timeInSeconds);
}

if (import.meta.main) {
  await main();
}

import { DEFAULT_FOLDERS, FILE_PREFIX } from "./config.ts";
import { convertTimeStringToNumberSecondsSyncV1 } from "./utils/convert-time-string-to-seconds.ts";
import { extractTimeFromFileNameV1Sync } from "./utils/extract-time-from-file-name.ts";
import { findFileInFolders } from "./utils/find-file.ts";
import { getUserHomeDirSync } from "./utils/get-user-home-dir.ts";
import { shutodwn } from "./utils/shutdown.ts";

async function main() {
  const home: string = getUserHomeDirSync();
  const filePath = await findFileInFolders(FILE_PREFIX, home, DEFAULT_FOLDERS);
  if (!filePath) {
    console.error("App file not found.");
    Deno.exit(1);
  }

  const time: string = extractTimeFromFileNameV1Sync(filePath);
  const timeInSeconds: number = convertTimeStringToNumberSecondsSyncV1(time);

  await shutodwn(timeInSeconds);
}

if (import.meta.main) {
  await main();
}

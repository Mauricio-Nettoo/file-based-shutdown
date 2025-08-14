import { FILE_PREFIX } from "../config.ts";

export function extractTimeFromFileNameV1Sync(fileName: string): string {
  return fileName.split(FILE_PREFIX)[1].split(".")[0];
}

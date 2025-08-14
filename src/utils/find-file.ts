import * as path from "jsr:@std/path";

export async function findFileInFolders(
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

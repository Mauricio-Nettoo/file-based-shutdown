import { sleep } from "./sleep.ts";

export async function showTimer(
  startTimeSeconds: number,
  signal: AbortSignal,
): Promise<void> {
  for (let remaining: number = startTimeSeconds; remaining >= 0; remaining--) {
    if (signal.aborted) return;

    const seconds: number = remaining % 60;
    const totalMinutes: number = Math.floor(remaining / 60);
    const minutes: number = totalMinutes % 60;
    const hours: number = Math.floor(totalMinutes / 60);

    const display: string = `Shutdown in: ${
      hours.toString().padStart(2, "0")
    }:${
      minutes
        .toString()
        .padStart(2, "0")
    }:${seconds.toString().padStart(2, "0")}`;

    await Deno.stdout.write(new TextEncoder().encode(`\r${display}`));

    await sleep(1000);
  }
}

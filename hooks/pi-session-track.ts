import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const stateDir =
  process.env.TMUX_ASSISTANT_RESURRECT_DIR ||
  join(process.env.XDG_RUNTIME_DIR || process.env.TMPDIR || tmpdir(), "tmux-assistant-resurrect");

function writeState(sessionId: string, sessionFile: string, cwd: string) {
  mkdirSync(stateDir, { recursive: true, mode: 0o700 });
  const pid = process.pid;
  const stateFile = join(stateDir, `pi-${pid}.json`);
  const tmpFile = `${stateFile}.tmp.${Date.now()}`;

  writeFileSync(
    tmpFile,
    JSON.stringify(
      {
        tool: "pi",
        session_id: sessionId,
        session_file: sessionFile,
        ppid: pid,
        cwd,
        updated_at: new Date().toISOString(),
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  renameSync(tmpFile, stateFile);
}

export default function (pi: ExtensionAPI) {
  pi.on("session_start", (_event, ctx) => {
    writeState(ctx.sessionManager.getSessionId(), ctx.sessionManager.getSessionFile(), ctx.cwd);
  });

  pi.on("session_shutdown", (_event, ctx) => {
    writeState(ctx.sessionManager.getSessionId(), ctx.sessionManager.getSessionFile(), ctx.cwd);
  });
}

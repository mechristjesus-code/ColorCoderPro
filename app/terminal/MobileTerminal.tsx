"use client";

import { useState, useEffect, useRef } from "react";
import { Send, RotateCcw, Copy, Check, Menu, X, Eye, EyeOff, Wifi, WifiOff } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Line {
  id: number;
  type: "input" | "stdout" | "stderr" | "info" | "exit" | "banner";
  text: string;
  exitCode?: number;
  duration?: number;
}

interface SessionInfo { sessionId: string; cwd: string }

// ── Constants ─────────────────────────────────────────────────────────────────

const PASS_KEY   = "colorAdminToken";
const GOLD       = "#C9A84C";
const GREEN      = "#4ADE80";
const RED        = "#F87171";
const CYAN       = "#67E8F9";
const DIM        = "rgba(240,237,232,0.45)";
const BG         = "#040408";

let _lineId = 0;
const lid = () => ++_lineId;

const BANNER_LINES = [
  "╔══════════════════════════════════════╗",
  "║  144,000 Color Project               ║",
  "║  Remote Terminal · v1.0              ║",
  "║  Type 'help' for command reference   ║",
  "╚══════════════════════════════════════╝",
];

const HELP_TEXT = `
Available commands:
  help          Show this help
  clear         Clear the terminal
  pwd           Print working directory
  ls [path]     List files
  cat <file>    Read a file
  git status    Git status
  git log       Recent commits
  git add .     Stage all changes
  git push      Push to GitHub
  tsc           TypeScript check
  db:push       Push DB schema
  ps            Server status

Or type any shell command — full bash access.

Termux / external access:
  curl -s -X POST /api/admin/shell \\
    -H "x-admin-password: <pw>" \\
    -d '{"action":"create"}' | jq .sessionId

  curl -s -X POST /api/admin/shell \\
    -H "x-admin-password: <pw>" \\
    -d '{"action":"exec","sessionId":"SID","command":"git status"}'
`.trim();

// ── Line renderer ─────────────────────────────────────────────────────────────

function TermLine({ line, cwd }: { line: Line; cwd: string }) {
  const shortCwd = cwd.replace("/home/ubuntu/workspace/project", "~/project");

  if (line.type === "banner") {
    return <pre style={{ color: GOLD, fontSize: 11, lineHeight: 1.5, margin: "0 0 8px 0" }}>{line.text}</pre>;
  }
  if (line.type === "info") {
    return <div style={{ color: CYAN, fontSize: 12, lineHeight: 1.6, marginBottom: 2 }}>{line.text}</div>;
  }
  if (line.type === "input") {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 2 }}>
        <span style={{ color: GOLD, fontSize: 11, flexShrink: 0, marginTop: 1 }}>{shortCwd} $</span>
        <span style={{ color: "#F0EDE8", fontSize: 13, flex: 1, wordBreak: "break-all" }}>{line.text}</span>
        <CopyBtn text={line.text} />
      </div>
    );
  }
  if (line.type === "exit") {
    return (
      <div style={{ fontSize: 11, color: line.exitCode === 0 ? GREEN : RED, marginBottom: 6, opacity: 0.7 }}>
        {line.exitCode === 0 ? "✓" : `✗ exit ${line.exitCode}`} {line.duration ? `· ${line.duration}ms` : ""}
      </div>
    );
  }
  if (line.type === "stderr") {
    return <pre style={{ color: RED, fontSize: 12, margin: "0 0 1px 0", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.55 }}>{line.text}</pre>;
  }
  // stdout
  return <pre style={{ color: "#C8E0D0", fontSize: 12, margin: "0 0 1px 0", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.55 }}>{line.text}</pre>;
}

// ── Auth Gate ─────────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }: { onAuth: (pw: string) => void }) {
  const [pw, setPw]     = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr]   = useState("");
  const [checking, setChecking] = useState(false);

  async function attempt() {
    if (!pw.trim()) return;
    setChecking(true); setErr("");
    const r = await fetch("/api/admin/git", { headers: { "x-admin-password": pw } });
    if (r.ok) { localStorage.setItem(PASS_KEY, pw); onAuth(pw); }
    else { setErr("Wrong password"); setChecking(false); }
  }

  return (
    <div style={{ minHeight: "100dvh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "monospace" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <pre style={{ color: GOLD, fontSize: 12, lineHeight: 1.5, marginBottom: 28 }}>
{BANNER_LINES.join("\n")}
        </pre>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: CYAN, marginBottom: 6 }}>$ authenticate</div>
          <div style={{ position: "relative" }}>
            <input type={show ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === "Enter" && attempt()}
              placeholder="enter admin password"
              autoFocus
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${err ? RED : "rgba(255,255,255,0.12)"}`, borderRadius: 8, padding: "12px 44px 12px 14px", fontSize: 14, color: "#F0EDE8", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }}
            />
            <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: DIM }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {err && <div style={{ fontSize: 12, color: RED, marginTop: 5 }}>{err}</div>}
        </div>
        <button onClick={attempt} disabled={checking || !pw.trim()}
          style={{ width: "100%", padding: 12, borderRadius: 8, background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, border: "none", color: BG, fontWeight: 700, fontSize: 14, fontFamily: "monospace", cursor: "pointer", opacity: checking ? 0.6 : 1 }}>
          {checking ? "authenticating..." : "connect →"}
        </button>
        <div style={{ marginTop: 20, fontSize: 11, color: DIM, lineHeight: 1.7 }}>
          default: <span style={{ color: GOLD }}>ColorAdmin144</span><br />
          set ADMIN_PASSWORD in .env to change
        </div>
      </div>
    </div>
  );
}

// ── Main Terminal ─────────────────────────────────────────────────────────────

function Terminal({ password }: { password: string }) {
  const [lines, setLines]       = useState<Line[]>([]);
  const [input, setInput]       = useState("");
  const [cwd, setCwd]           = useState("/home/ubuntu/workspace/project");
  const [running, setRunning]   = useState(false);
  const [connected, setConnected] = useState(true);
  const [session, setSession]   = useState<SessionInfo | null>(null);
  const [history, setHistory]   = useState<string[]>([]);
  const [histIdx, setHistIdx]   = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  const addLines = (newLines: Line[]) =>
    setLines(prev => [...prev, ...newLines]);

  // Init: print banner + create session
  useEffect(() => {
    addLines(BANNER_LINES.map(t => ({ id: lid(), type: "banner" as const, text: t })));
    addLines([{ id: lid(), type: "info", text: "establishing session..." }]);
    createSession();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  async function createSession() {
    try {
      const r = await fetch("/api/admin/shell", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ action: "create" }),
      });
      const d = await r.json();
      if (d.sessionId) {
        setSession({ sessionId: d.sessionId, cwd: d.cwd });
        setCwd(d.cwd);
        setConnected(true);
        addLines([{ id: lid(), type: "info", text: `session ${d.sessionId} · ready` }]);
      }
    } catch {
      addLines([{ id: lid(), type: "stderr", text: "session error — using direct exec mode" }]);
    }
  }

  async function runCommand(cmd: string) {
    if (!cmd.trim() || running) return;
    setRunning(true);
    setHistory(h => [cmd, ...h.slice(0, 99)]);
    setHistIdx(-1);
    addLines([{ id: lid(), type: "input", text: cmd }]);

    // Local commands
    if (cmd === "clear") { setLines([]); setRunning(false); return; }
    if (cmd === "help")  { addLines([{ id: lid(), type: "stdout", text: HELP_TEXT }]); setRunning(false); return; }
    if (cmd === "exit")  { addLines([{ id: lid(), type: "info", text: "Session ended. Refresh to reconnect." }]); setConnected(false); setRunning(false); return; }

    // Alias shortcuts
    const aliases: Record<string, string> = {
      "tsc":      "npx tsc --noEmit",
      "db:push":  "pnpm drizzle-kit push",
      "ps":       "curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:13000 && echo ' — server OK'",
    };
    const resolved = aliases[cmd] ?? cmd;

    // Try streaming first (for long-running commands)
    const isLong = /^(pnpm|npm|npx|git pull|git push|drizzle)/.test(resolved);
    if (isLong) {
      await runStreaming(resolved);
    } else {
      await runDirect(resolved);
    }
    setRunning(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function runDirect(cmd: string) {
    try {
      const r = await fetch("/api/admin/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ command: cmd, cwd }),
      });
      const d = await r.json();
      if (d.stdout) addLines([{ id: lid(), type: "stdout", text: d.stdout }]);
      if (d.stderr) addLines([{ id: lid(), type: "stderr", text: d.stderr }]);
      addLines([{ id: lid(), type: "exit", text: "", exitCode: d.exitCode ?? 0, duration: d.duration }]);
    } catch (e) {
      addLines([{ id: lid(), type: "stderr", text: `Network error: ${String(e)}` }]);
    }
  }

  async function runStreaming(cmd: string) {
    try {
      const r = await fetch("/api/admin/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ command: cmd, cwd }),
      });
      if (!r.body) { await runDirect(cmd); return; }
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          if (!part.trim()) continue;
          try {
            const ev = JSON.parse(part);
            if (ev.type === "stdout" && ev.data) addLines([{ id: lid(), type: "stdout", text: ev.data.replace(/\n$/, "") }]);
            if (ev.type === "stderr" && ev.data) addLines([{ id: lid(), type: "stderr", text: ev.data.replace(/\n$/, "") }]);
            if (ev.type === "exit") addLines([{ id: lid(), type: "exit", text: "", exitCode: ev.code, duration: ev.duration }]);
          } catch {}
        }
      }
    } catch { await runDirect(cmd); }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") { runCommand(input); setInput(""); return; }
    if (e.key === "ArrowUp") {
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx); setInput(history[idx] ?? "");
    }
    if (e.key === "ArrowDown") {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx); setInput(idx === -1 ? "" : history[idx] ?? "");
    }
  }

  const shortCwd = cwd.replace("/home/ubuntu/workspace/project", "~/project");

  const quickCmds = [
    { label: "status",  cmd: "git status --short" },
    { label: "tsc",     cmd: "tsc" },
    { label: "push",    cmd: "git push origin main" },
    { label: "logs",    cmd: "tail -n 30 /var/log/supervisor/dev-server.stderr.log" },
    { label: "server",  cmd: "ps" },
    { label: "ls",      cmd: "ls" },
  ];

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: BG, fontFamily: "monospace", overflow: "hidden" }}>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, background: "rgba(5,5,8,0.95)" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? GREEN : RED, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: GOLD, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {shortCwd}
        </span>
        <span style={{ fontSize: 10, color: DIM }}>
          {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
        </span>
        <button onClick={() => setMenuOpen(m => !m)} style={{ background: "none", border: "none", cursor: "pointer", color: DIM, padding: 4 }}>
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Slide-down menu */}
      {menuOpen && (
        <div style={{ background: "#0A0A0F", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {quickCmds.map(q => (
            <button key={q.label} onClick={() => { runCommand(q.cmd); setMenuOpen(false); }}
              style={{ padding: "6px 12px", borderRadius: 7, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", fontSize: 12, cursor: "pointer", fontFamily: "monospace" }}>
              {q.label}
            </button>
          ))}
          <button onClick={() => { setLines([]); setMenuOpen(false); }}
            style={{ padding: "6px 12px", borderRadius: 7, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: RED, fontSize: 12, cursor: "pointer", fontFamily: "monospace" }}>
            clear
          </button>
        </div>
      )}

      {/* Output */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", WebkitOverflowScrolling: "touch" }}>
        {lines.map(l => <TermLine key={l.id} line={l} cwd={cwd} />)}
        {running && (
          <div style={{ color: DIM, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ animation: "pulse 1s infinite" }}>▌</span> running…
          </div>
        )}
        <div ref={bottomRef} style={{ height: 4 }} />
      </div>

      {/* Quick tap bar (mobile) */}
      <div style={{ display: "flex", gap: 4, padding: "6px 10px", borderTop: "1px solid rgba(255,255,255,0.06)", overflowX: "auto", flexShrink: 0, background: "#060610" }}>
        {quickCmds.map(q => (
          <button key={q.label} onClick={() => runCommand(q.cmd)} disabled={running}
            style={{ padding: "5px 10px", borderRadius: 6, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: GOLD, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "monospace" }}>
            {q.label}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "#060610", flexShrink: 0 }}>
        <span style={{ color: GOLD, fontSize: 11, flexShrink: 0 }}>$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={running}
          placeholder={running ? "running…" : "enter command"}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#F0EDE8", fontSize: 14, fontFamily: "monospace" }}
        />
        <button onClick={() => { runCommand(input); setInput(""); }} disabled={running || !input.trim()}
          style={{ background: `linear-gradient(135deg,${GOLD},#E8C96A)`, border: "none", borderRadius: 8, padding: "8px 14px", color: BG, fontWeight: 700, cursor: "pointer", opacity: running || !input.trim() ? 0.4 : 1, flexShrink: 0 }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export function MobileTerminal() {
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(PASS_KEY);
    if (stored) {
      // verify stored token
      fetch("/api/admin/git", { headers: { "x-admin-password": stored } })
        .then(r => { if (r.ok) setPassword(stored); else localStorage.removeItem(PASS_KEY); });
    }
  }, []);

  if (!password) return <AuthScreen onAuth={setPassword} />;
  return <Terminal password={password} />;
}

// ── Copy Button ───────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}
      style={{ background: "none", border: "none", cursor: "pointer", color: done ? GOLD : DIM, padding: "2px 4px", flexShrink: 0 }}>
      {done ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

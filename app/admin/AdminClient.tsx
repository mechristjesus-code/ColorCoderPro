"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Terminal, FolderOpen, Database, GitBranch, FileText,
  Zap, Lock, CheckCircle, XCircle, ChevronRight, ChevronDown,
  Play, RotateCcw, Copy, Check, ArrowLeft, Save, Eye, EyeOff,
  Activity, AlertTriangle,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────

const GOLD = "#C9A84C";
const BG   = "#050508";
const CARD = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.09)";
const FG   = "#F0EDE8";
const DIM  = "rgba(240,237,232,0.5)";
const PASS_KEY = "colorAdminToken";

type Panel = "terminal" | "files" | "db" | "git" | "logs" | "quick";

// ── Placeholder exports ───────────────────────────────────────────────────────

export function AdminClient() {
  // auth state
  const [authed, setAuthed]         = useState(false);
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [authError, setAuthError]   = useState("");
  const [activePanel, setActivePanel] = useState<Panel>("terminal");

  useEffect(() => {
    const stored = localStorage.getItem(PASS_KEY);
    if (stored) verifyToken(stored);
  }, []);

  async function verifyToken(pw: string) {
    const res = await fetch("/api/admin/git", {
      headers: { "x-admin-password": pw },
    });
    if (res.ok) {
      localStorage.setItem(PASS_KEY, pw);
      setAuthed(true);
      setAuthError("");
    } else {
      localStorage.removeItem(PASS_KEY);
    }
  }

  async function handleLogin() {
    setAuthError("");
    const res = await fetch("/api/admin/git", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      localStorage.setItem(PASS_KEY, password);
      setAuthed(true);
    } else {
      setAuthError("Invalid password — check ADMIN_PASSWORD in .env");
    }
  }

  if (!authed) return <AuthGate password={password} setPassword={setPassword}
    showPass={showPass} setShowPass={setShowPass} error={authError} onLogin={handleLogin} />;

  return <AdminShell activePanel={activePanel} setActivePanel={setActivePanel} password={password || (localStorage.getItem(PASS_KEY) ?? "")} />;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

async function apiExec(cmd: string, pw: string, cwd?: string) {
  const r = await fetch("/api/admin/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": pw },
    body: JSON.stringify({ command: cmd, cwd }),
  });
  return r.json();
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}
      style={{ background: "none", border: "none", cursor: "pointer", color: done ? GOLD : DIM, padding: 2 }}>
      {done ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

// ── Auth Gate ────────────────────────────────────────────────────────────────

function AuthGate({ password, setPassword, showPass, setShowPass, error, onLogin }: {
  password: string; setPassword: (v: string) => void;
  showPass: boolean; setShowPass: (v: boolean) => void;
  error: string; onLogin: () => void;
}) {
  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Terminal size={22} color={BG} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-playfair)", fontSize: 20, fontWeight: 700, color: FG }}>Admin Terminal</div>
            <div style={{ fontSize: 12, color: DIM }}>144,000 Color Project</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: DIM, display: "block", marginBottom: 6 }}>Admin Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onLogin()}
              placeholder="Enter ADMIN_PASSWORD"
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${error ? "#ff6b6b" : BORDER}`, borderRadius: 10, padding: "11px 44px 11px 14px", fontSize: 14, color: FG, outline: "none", boxSizing: "border-box" }}
            />
            <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: DIM, padding: 0 }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <div style={{ fontSize: 12, color: "#ff6b6b", marginTop: 6 }}>{error}</div>}
        </div>

        <button onClick={onLogin} style={{ width: "100%", padding: "12px 0", borderRadius: 10, background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, border: "none", color: BG, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          Enter Admin Terminal
        </button>

        <div style={{ marginTop: 20, padding: 14, borderRadius: 10, background: "rgba(201,168,76,0.06)", border: `1px solid rgba(201,168,76,0.15)` }}>
          <div style={{ fontSize: 11, color: DIM, lineHeight: 1.6 }}>
            Default password: <code style={{ color: GOLD }}>ColorAdmin144</code><br />
            Change via <code style={{ color: GOLD }}>ADMIN_PASSWORD</code> in <code style={{ color: GOLD }}>.env</code>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Terminal Panel ────────────────────────────────────────────────────────────

interface HistoryEntry { cmd: string; stdout: string; stderr: string; exitCode: number; duration: number; ts: string }

function TerminalPanel({ password }: { password: string }) {
  const [input, setInput]       = useState("");
  const [history, setHistory]   = useState<HistoryEntry[]>([]);
  const [running, setRunning]   = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx]   = useState(-1);
  const [cwd, setCwd]           = useState("/home/ubuntu/workspace/project");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  async function run() {
    if (!input.trim() || running) return;
    const cmd = input.trim();
    setInput(""); setRunning(true);
    setCmdHistory(h => [cmd, ...h.slice(0, 99)]);
    setHistIdx(-1);

    // Handle cd locally
    if (cmd.startsWith("cd ")) {
      const target = cmd.slice(3).trim();
      const next = target.startsWith("/") ? target : `${cwd}/${target}`;
      const res = await apiExec(`cd ${next} && pwd`, password);
      const newCwd = res.stdout?.trim() || cwd;
      setCwd(newCwd);
      setHistory(h => [...h, { cmd, stdout: newCwd, stderr: res.stderr || "", exitCode: res.exitCode ?? 0, duration: res.duration ?? 0, ts: new Date().toLocaleTimeString() }]);
    } else if (cmd === "clear") {
      setHistory([]);
    } else {
      const res = await apiExec(cmd, password, cwd);
      setHistory(h => [...h, { cmd, stdout: res.stdout || "", stderr: res.stderr || "", exitCode: res.exitCode ?? 0, duration: res.duration ?? 0, ts: new Date().toLocaleTimeString() }]);
    }
    setRunning(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") { run(); return; }
    if (e.key === "ArrowUp") {
      const idx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(idx);
      setInput(cmdHistory[idx] ?? "");
    }
    if (e.key === "ArrowDown") {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? "" : cmdHistory[idx] ?? "");
    }
  }

  const shortCwd = cwd.replace("/home/ubuntu/workspace/project", "~/project");

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", background: "#0A0A0F", border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
      {/* Output area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", fontFamily: "monospace", fontSize: 13, lineHeight: 1.65 }}>
        <div style={{ color: GOLD, marginBottom: 12, opacity: 0.7, fontSize: 12 }}>
          ◈ 144K Color Project Admin Terminal · type commands below · ↑↓ history · clear to reset
        </div>
        {history.map((h, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: GOLD, opacity: 0.6, fontSize: 11 }}>{h.ts}</span>
              <span style={{ color: "#7AE88C" }}>$</span>
              <span style={{ color: FG }}>{h.cmd}</span>
              <CopyBtn text={h.cmd} />
              <span style={{ marginLeft: "auto", fontSize: 11, color: h.exitCode === 0 ? "#4ADE80" : "#ff6b6b" }}>
                {h.exitCode === 0 ? "✓" : `✗ ${h.exitCode}`} {h.duration}ms
              </span>
            </div>
            {h.stdout && <pre style={{ margin: "4px 0 0 0", color: "#C8D4E0", whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12 }}>{h.stdout}</pre>}
            {h.stderr && <pre style={{ margin: "4px 0 0 0", color: "#FF9F9F", whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12 }}>{h.stderr}</pre>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {/* Input */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, background: "#080810" }}>
        <span style={{ color: GOLD, fontSize: 12, fontFamily: "monospace", flexShrink: 0 }}>{shortCwd} $</span>
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder={running ? "running…" : "type a command"}
          disabled={running}
          autoFocus
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: FG, fontFamily: "monospace", fontSize: 13 }}
        />
        <button onClick={run} disabled={running || !input.trim()}
          style={{ background: `linear-gradient(135deg,${GOLD},#E8C96A)`, border: "none", borderRadius: 7, padding: "5px 14px", color: BG, fontWeight: 700, fontSize: 12, cursor: "pointer", opacity: running || !input.trim() ? 0.4 : 1 }}>
          <Play size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Quick Actions Panel ───────────────────────────────────────────────────────

interface QResult { label: string; out: string; ok: boolean }

function QuickPanel({ password }: { password: string }) {
  const [results, setResults] = useState<QResult[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  const actions = [
    { label: "TypeScript Check",        cmd: "npx tsc --noEmit",                 icon: "✓", color: "#7AE88C" },
    { label: "Git Status",              cmd: "git status --short",               icon: "⎇", color: "#7C9EE8" },
    { label: "Git Diff",                cmd: "git diff --stat",                  icon: "∆", color: "#C9A84C" },
    { label: "Git Add All",             cmd: "git add .",                        icon: "+", color: "#4ADE80" },
    { label: "Git Push",                cmd: "git push origin main",             icon: "↑", color: GOLD },
    { label: "Git Pull",                cmd: "git pull origin main",             icon: "↓", color: GOLD },
    { label: "DB Push (drizzle)",       cmd: "pnpm drizzle-kit push",            icon: "⬡", color: "#C084FC" },
    { label: "List DB Tables",          cmd: `psql "${process.env.DATABASE_URL}" -c "\\dt" 2>/dev/null || echo "use DB panel"`, icon: "⊞", color: "#FB923C" },
    { label: "Restart Dev Server",      cmd: "pkill -f 'next dev' 2>/dev/null; sleep 1 && pnpm dev &", icon: "↺", color: "#38BDF8" },
    { label: "Check Port 13000",        cmd: "curl -s -o /dev/null -w '%{http_code}' http://localhost:13000", icon: "◉", color: "#4ADE80" },
    { label: "Show Log Errors",         cmd: "grep -i error /var/log/supervisor/dev-server.stderr.log 2>/dev/null | tail -20 || echo 'no errors found'", icon: "⚠", color: "#F87171" },
    { label: "Disk & Memory",           cmd: "df -h / && free -h",              icon: "⊙", color: "#94A3B8" },
    { label: "Node / pnpm versions",    cmd: "node -v && pnpm -v",              icon: "N", color: "#84CC16" },
    { label: "Recent git log",          cmd: "git log --oneline -8",            icon: "☰", color: DIM },
    { label: "Count survey responses",  cmd: `psql "${process.env.DATABASE_URL ?? ''}" -t -c "SELECT COUNT(*) FROM survey_responses" 2>/dev/null || echo "use DB panel"`, icon: "#", color: "#FB923C" },
    { label: "Count posts",             cmd: `psql "${process.env.DATABASE_URL ?? ''}" -t -c "SELECT COUNT(*) FROM posts" 2>/dev/null || echo "use DB panel"`, icon: "#", color: "#FB923C" },
  ];

  async function runAction(label: string, cmd: string) {
    setRunning(label);
    const res = await apiExec(cmd, password);
    setResults(r => [{ label, out: [res.stdout, res.stderr].filter(Boolean).join("\n"), ok: res.exitCode === 0 }, ...r.slice(0, 19)]);
    setRunning(null);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: "calc(100vh - 120px)", overflow: "auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 11, color: DIM, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Quick Commands</div>
        {actions.map(a => (
          <button key={a.label} onClick={() => runAction(a.label, a.cmd)} disabled={!!running}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: running === a.label ? `${a.color}18` : CARD, border: `1px solid ${running === a.label ? a.color : BORDER}`, borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
            <span style={{ fontSize: 14, color: a.color, width: 20, textAlign: "center", flexShrink: 0 }}>{a.icon}</span>
            <span style={{ fontSize: 13, color: FG }}>{a.label}</span>
            {running === a.label && <span style={{ marginLeft: "auto", fontSize: 11, color: a.color }}>running…</span>}
          </button>
        ))}
      </div>
      <div>
        <div style={{ fontSize: 11, color: DIM, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Results</div>
        {results.length === 0 && <div style={{ color: DIM, fontSize: 13 }}>Click an action to see output here</div>}
        {results.map((r, i) => (
          <div key={i} style={{ marginBottom: 12, background: "#0A0A0F", border: `1px solid ${r.ok ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`, borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              {r.ok ? <CheckCircle size={13} color="#4ADE80" /> : <XCircle size={13} color="#F87171" />}
              <span style={{ fontSize: 12, fontWeight: 600, color: r.ok ? "#4ADE80" : "#F87171" }}>{r.label}</span>
              <CopyBtn text={r.out} />
            </div>
            <pre style={{ margin: 0, fontSize: 11, color: "#C8D4E0", whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 180, overflowY: "auto" }}>{r.out || "(no output)"}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Git Panel ─────────────────────────────────────────────────────────────────

function GitPanel({ password }: { password: string }) {
  const [info, setInfo]         = useState<{ branch: string; status: string; log: string } | null>(null);
  const [commitMsg, setCommitMsg] = useState("");
  const [opResult, setOpResult] = useState<{ op: string; out: string; ok: boolean } | null>(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { loadGit(); }, []);

  async function loadGit() {
    const r = await fetch("/api/admin/git", { headers: { "x-admin-password": password } });
    if (r.ok) setInfo(await r.json());
  }

  async function runOp(op: string, args?: string) {
    setLoading(true);
    const r = await fetch("/api/admin/git", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ op, args }),
    });
    const d = await r.json();
    setOpResult({ op, out: [d.out, d.err].filter(Boolean).join("\n"), ok: d.ok });
    setLoading(false);
    loadGit();
  }

  const gitOps = [
    { op: "status",  label: "Status",     color: "#7C9EE8" },
    { op: "diff",    label: "Diff",       color: "#C9A84C" },
    { op: "add",     label: "Add All",    color: "#4ADE80" },
    { op: "push",    label: "Push",       color: GOLD },
    { op: "pull",    label: "Pull",       color: "#38BDF8" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: "calc(100vh - 120px)", overflow: "auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {info && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: DIM, marginBottom: 4 }}>Current Branch</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: GOLD, marginBottom: 14 }}>⎇ {info.branch}</div>
            <div style={{ fontSize: 12, color: DIM, marginBottom: 6 }}>Working Tree</div>
            <pre style={{ margin: 0, fontSize: 12, color: info.status ? "#FFD166" : "#4ADE80", fontFamily: "monospace" }}>{info.status || "clean — nothing to commit"}</pre>
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {gitOps.map(g => (
            <button key={g.op} onClick={() => runOp(g.op)} disabled={loading}
              style={{ padding: "8px 16px", borderRadius: 9, background: CARD, border: `1px solid ${BORDER}`, color: g.color, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {g.label}
            </button>
          ))}
        </div>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, color: DIM, marginBottom: 8 }}>Commit Message</div>
          <input value={commitMsg} onChange={e => setCommitMsg(e.target.value)}
            placeholder="describe your changes…"
            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: FG, outline: "none", boxSizing: "border-box", marginBottom: 10 }}
          />
          <button onClick={() => runOp("commit", commitMsg)} disabled={!commitMsg.trim() || loading}
            style={{ padding: "9px 20px", borderRadius: 9, background: `linear-gradient(135deg,${GOLD},#E8C96A)`, border: "none", color: BG, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: commitMsg.trim() ? 1 : 0.4 }}>
            Commit
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {info && (
          <div style={{ background: "#0A0A0F", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, flex: 1 }}>
            <div style={{ fontSize: 12, color: DIM, marginBottom: 8 }}>Recent Commits</div>
            <pre style={{ margin: 0, fontSize: 12, color: "#C8D4E0", fontFamily: "monospace", lineHeight: 1.7 }}>{info.log || "no commits"}</pre>
          </div>
        )}
        {opResult && (
          <div style={{ background: "#0A0A0F", border: `1px solid ${opResult.ok ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {opResult.ok ? <CheckCircle size={14} color="#4ADE80" /> : <AlertTriangle size={14} color="#F87171" />}
              <span style={{ fontSize: 13, fontWeight: 600, color: opResult.ok ? "#4ADE80" : "#F87171" }}>{opResult.op}</span>
            </div>
            <pre style={{ margin: 0, fontSize: 12, color: "#C8D4E0", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{opResult.out || "(done)"}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Files Panel ───────────────────────────────────────────────────────────────

function FilesPanel({ password }: { password: string }) {
  const [path, setPath]       = useState("");
  const [entries, setEntries] = useState<{ name: string; type: string; size: number; path: string }[]>([]);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadDir(""); }, []);

  async function loadDir(p: string) {
    setLoading(true); setFileContent(null); setEditing(false);
    const r = await fetch(`/api/admin/files?path=${encodeURIComponent(p)}`, { headers: { "x-admin-password": password } });
    const d = await r.json();
    if (d.type === "dir") { setEntries(d.entries); setPath(p); }
    else if (d.type === "file") { setFileContent(d.content); setEditContent(d.content); setPath(p); setEntries([]); }
    setLoading(false);
  }

  async function saveFile() {
    const r = await fetch("/api/admin/files", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ path, content: editContent }),
    });
    const d = await r.json();
    setSaveMsg(d.success ? "✓ Saved" : `✗ ${d.error}`);
    setTimeout(() => setSaveMsg(""), 2500);
    if (d.success) setFileContent(editContent);
  }

  const breadcrumbs = ["root", ...path.split("/").filter(Boolean)];

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        {breadcrumbs.map((b, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => loadDir(breadcrumbs.slice(1, i + 1).join("/"))}
              style={{ background: "none", border: "none", color: i === breadcrumbs.length - 1 ? GOLD : DIM, cursor: "pointer", fontSize: 13, padding: "2px 4px" }}>{b}</button>
            {i < breadcrumbs.length - 1 && <ChevronRight size={12} color={DIM} />}
          </span>
        ))}
        {loading && <span style={{ fontSize: 11, color: DIM, marginLeft: 8 }}>loading…</span>}
      </div>

      {/* Directory listing */}
      {entries.length > 0 && (
        <div style={{ flex: 1, overflow: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6, alignContent: "start" }}>
          {path && (
            <button onClick={() => loadDir(path.split("/").slice(0, -1).join("/"))}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 9, cursor: "pointer", color: DIM, fontSize: 13 }}>
              <ArrowLeft size={13} /> ..
            </button>
          )}
          {entries.map(e => (
            <button key={e.name} onClick={() => loadDir(e.path)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 9, cursor: "pointer", textAlign: "left", overflow: "hidden" }}>
              <span style={{ color: e.type === "dir" ? GOLD : "#7C9EE8", flexShrink: 0 }}>{e.type === "dir" ? <FolderOpen size={14} /> : <FileText size={14} />}</span>
              <span style={{ fontSize: 12, color: FG, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
              {e.type === "file" && <span style={{ fontSize: 10, color: DIM, marginLeft: "auto", flexShrink: 0 }}>{(e.size / 1024).toFixed(1)}k</span>}
            </button>
          ))}
        </div>
      )}

      {/* File viewer / editor */}
      {fileContent !== null && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => loadDir(path.split("/").slice(0, -1).join("/"))}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, color: DIM, fontSize: 12, cursor: "pointer" }}>
              <ArrowLeft size={12} /> Back
            </button>
            <button onClick={() => setEditing(!editing)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: editing ? `rgba(201,168,76,0.15)` : CARD, border: `1px solid ${editing ? GOLD : BORDER}`, borderRadius: 8, color: editing ? GOLD : DIM, fontSize: 12, cursor: "pointer" }}>
              {editing ? <Save size={12} /> : <Activity size={12} />} {editing ? "Editing" : "Edit"}
            </button>
            {editing && (
              <button onClick={saveFile}
                style={{ padding: "6px 14px", background: `linear-gradient(135deg,${GOLD},#E8C96A)`, border: "none", borderRadius: 8, color: BG, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                Save
              </button>
            )}
            {saveMsg && <span style={{ fontSize: 12, color: saveMsg.startsWith("✓") ? "#4ADE80" : "#F87171" }}>{saveMsg}</span>}
            <span style={{ marginLeft: "auto", fontSize: 11, color: DIM }}>{path}</span>
          </div>
          {editing
            ? <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                style={{ flex: 1, background: "#0A0A0F", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px", color: FG, fontFamily: "monospace", fontSize: 12, lineHeight: 1.6, outline: "none", resize: "none" }} />
            : <pre style={{ flex: 1, background: "#0A0A0F", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px", color: "#C8D4E0", fontFamily: "monospace", fontSize: 12, lineHeight: 1.6, overflowY: "auto", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{fileContent}</pre>
          }
        </div>
      )}
    </div>
  );
}

// ── DB Panel ──────────────────────────────────────────────────────────────────

function DbPanel({ password }: { password: string }) {
  const [sql, setSql]         = useState("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
  const [result, setResult]   = useState<{ rows: Record<string, unknown>[]; rowCount: number; duration: number } | null>(null);
  const [error, setError]     = useState("");
  const [force, setForce]     = useState(false);
  const [running, setRunning] = useState(false);

  const presets = [
    { label: "List Tables",     sql: "SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;" },
    { label: "Survey Count",    sql: "SELECT COUNT(*), primary_color_group FROM survey_responses GROUP BY primary_color_group ORDER BY count DESC;" },
    { label: "Posts Count",     sql: "SELECT post_type, COUNT(*) FROM posts GROUP BY post_type;" },
    { label: "Recent Posts",    sql: "SELECT id, post_type, color_group_id, visibility, created_at FROM posts ORDER BY created_at DESC LIMIT 10;" },
    { label: "Reactions",       sql: "SELECT reaction, COUNT(*) FROM post_reactions GROUP BY reaction ORDER BY count DESC;" },
    { label: "DB Size",         sql: "SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size;" },
  ];

  async function runQuery() {
    if (!sql.trim()) return;
    setRunning(true); setError("");
    const r = await fetch("/api/admin/db", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ sql, force }),
    });
    const d = await r.json();
    if (d.error) { setError(d.error + (d.hint ? `\n${d.hint}` : "")); setResult(null); }
    else setResult(d);
    setRunning(false);
  }

  const cols = result?.rows?.[0] ? Object.keys(result.rows[0]) : [];

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {presets.map(p => (
          <button key={p.label} onClick={() => setSql(p.sql)}
            style={{ padding: "5px 12px", borderRadius: 8, background: CARD, border: `1px solid ${BORDER}`, color: DIM, fontSize: 12, cursor: "pointer" }}>{p.label}</button>
        ))}
      </div>
      <textarea value={sql} onChange={e => setSql(e.target.value)}
        style={{ background: "#0A0A0F", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px", color: FG, fontFamily: "monospace", fontSize: 13, lineHeight: 1.6, outline: "none", resize: "none", height: 100 }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={runQuery} disabled={running}
          style={{ padding: "9px 22px", borderRadius: 9, background: `linear-gradient(135deg,${GOLD},#E8C96A)`, border: "none", color: BG, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {running ? "Running…" : "Run Query"}
        </button>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: DIM, cursor: "pointer" }}>
          <input type="checkbox" checked={force} onChange={e => setForce(e.target.checked)} />
          Allow write ops
        </label>
        {result && <span style={{ fontSize: 12, color: "#4ADE80", marginLeft: "auto" }}>{result.rowCount} rows · {result.duration}ms</span>}
      </div>
      {error && <pre style={{ color: "#F87171", fontSize: 13, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: 12, margin: 0, whiteSpace: "pre-wrap" }}>{error}</pre>}
      {result && cols.length > 0 && (
        <div style={{ flex: 1, overflow: "auto", background: "#0A0A0F", border: `1px solid ${BORDER}`, borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "monospace" }}>
            <thead><tr>{cols.map(c => <th key={c} style={{ padding: "8px 14px", textAlign: "left", color: GOLD, borderBottom: `1px solid ${BORDER}`, background: "#0D0D18", position: "sticky", top: 0, whiteSpace: "nowrap" }}>{c}</th>)}</tr></thead>
            <tbody>{result.rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                {cols.map(c => <td key={c} style={{ padding: "7px 14px", color: "#C8D4E0", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{String(row[c] ?? "")}</td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Logs Panel ────────────────────────────────────────────────────────────────

function LogsPanel({ password }: { password: string }) {
  const [lines, setLines]   = useState<string[]>([]);
  const [file, setFile]     = useState<"stderr" | "stdout">("stderr");
  const [count, setCount]   = useState(100);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => { loadLogs(); }, [file, count]);

  async function loadLogs() {
    setLoading(true);
    const r = await fetch(`/api/admin/logs?file=${file}&lines=${count}`, { headers: { "x-admin-password": password } });
    const d = await r.json();
    setLines(d.lines ?? []);
    setLoading(false);
  }

  const filtered = filter ? lines.filter(l => l.toLowerCase().includes(filter.toLowerCase())) : lines;

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {(["stderr", "stdout"] as const).map(f => (
          <button key={f} onClick={() => setFile(f)}
            style={{ padding: "6px 14px", borderRadius: 9, background: file === f ? `rgba(201,168,76,0.15)` : CARD, border: `1px solid ${file === f ? GOLD : BORDER}`, color: file === f ? GOLD : DIM, fontSize: 12, cursor: "pointer" }}>{f}</button>
        ))}
        {[50, 100, 200, 500].map(n => (
          <button key={n} onClick={() => setCount(n)}
            style={{ padding: "5px 10px", borderRadius: 8, background: count === n ? `rgba(124,158,232,0.15)` : CARD, border: `1px solid ${count === n ? "#7C9EE8" : BORDER}`, color: count === n ? "#7C9EE8" : DIM, fontSize: 12, cursor: "pointer" }}>{n}</button>
        ))}
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="filter…"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 10px", fontSize: 12, color: FG, outline: "none" }} />
        <button onClick={loadLogs} style={{ padding: "6px 12px", borderRadius: 9, background: CARD, border: `1px solid ${BORDER}`, color: DIM, fontSize: 12, cursor: "pointer" }}>
          <RotateCcw size={12} />
        </button>
        <span style={{ fontSize: 11, color: DIM, marginLeft: "auto" }}>{filtered.length} lines {loading ? "· loading…" : ""}</span>
      </div>
      <div style={{ flex: 1, overflow: "auto", background: "#0A0A0F", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", fontFamily: "monospace", fontSize: 12, lineHeight: 1.65 }}>
        {filtered.map((line, i) => {
          const isError = /error|fail|exception/i.test(line);
          const isWarn  = /warn|warning/i.test(line);
          const color   = isError ? "#FF9F9F" : isWarn ? "#FFD166" : "#C8D4E0";
          return <div key={i} style={{ color, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{line}</div>;
        })}
      </div>
    </div>
  );
}

// ── Shell placeholder — filled below ─────────────────────────────────────────

function AdminShell({ activePanel, setActivePanel, password }: {
  activePanel: Panel; setActivePanel: (p: Panel) => void; password: string;
}) {
  const nav: { id: Panel; label: string; icon: React.ReactNode }[] = [
    { id: "terminal", label: "Terminal",   icon: <Terminal size={15} /> },
    { id: "quick",    label: "Quick Actions", icon: <Zap size={15} /> },
    { id: "git",      label: "Git",        icon: <GitBranch size={15} /> },
    { id: "files",    label: "Files",      icon: <FolderOpen size={15} /> },
    { id: "db",       label: "Database",   icon: <Database size={15} /> },
    { id: "logs",     label: "Logs",       icon: <FileText size={15} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: "0 20px", display: "flex", alignItems: "center", gap: 16, height: 52, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Terminal size={18} color={GOLD} />
          <span style={{ fontFamily: "var(--font-playfair)", fontSize: 15, fontWeight: 700, color: FG }}>Admin Terminal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80" }} />
          <span style={{ fontSize: 11, color: DIM }}>connected</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setActivePanel(n.id)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.15s",
                background: activePanel === n.id ? `rgba(201,168,76,0.15)` : "transparent",
                color: activePanel === n.id ? GOLD : DIM,
              }}>
              {n.icon}{n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel area */}
      <div style={{ flex: 1, overflow: "hidden", padding: 20 }}>
        {activePanel === "terminal" && <TerminalPanel password={password} />}
        {activePanel === "quick"    && <QuickPanel    password={password} />}
        {activePanel === "git"      && <GitPanel      password={password} />}
        {activePanel === "files"    && <FilesPanel    password={password} />}
        {activePanel === "db"       && <DbPanel       password={password} />}
        {activePanel === "logs"     && <LogsPanel     password={password} />}
      </div>
    </div>
  );
}

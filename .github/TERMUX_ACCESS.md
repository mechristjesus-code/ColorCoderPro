# 📱 Termux & Phone Access Guide
## The 144,000 Color Project — Remote Terminal Setup

> This guide covers every way to control the project from your phone.
> Three access methods: Browser Terminal, Termux HTTP scripting, and curl one-liners.
> No SSH server required — everything runs over HTTPS through the app itself.

---

## 🔑 Before You Start

| What | Value |
|---|---|
| **Admin Password** | `ColorAdmin144` (default) |
| **Change password** | Edit `ADMIN_PASSWORD` in `.env` on the server |
| **Browser terminal** | `https://your-app-url/terminal` |
| **Admin panel** | `https://your-app-url/admin` |

Replace `your-app-url` with your actual deployed domain everywhere in this guide.

---

## Method 1 — Browser Terminal (Easiest, No Install)

Open this URL on any phone browser (Safari, Chrome, Firefox):

```
https://your-app-url/terminal
```

**What you get:**
- Full-screen black terminal, no distractions
- Quick-tap buttons above the keyboard: `status` `tsc` `push` `logs` `server` `ls`
- Hamburger menu (top right) for more commands
- Type `help` to see all available commands
- ↑↓ arrows scroll command history

**Best for:** Quick checks, one-off commands, browsing files.

---

## Method 2 — Termux on Android (Full Power)

### Step 1 — Install Termux

Download from **F-Droid** (recommended) or Google Play:
- F-Droid: `https://f-droid.org/packages/com.termux/`
- Do NOT use the outdated Play Store version if possible

### Step 2 — Install dependencies in Termux

```bash
pkg update && pkg upgrade -y
pkg install curl jq python -y
```

> `curl` — makes HTTP requests
> `jq` — parses JSON responses (makes reading output easy)
> `python` — alternative JSON parsing if jq isn't available

### Step 3 — Set your app URL and password

```bash
# Paste these into Termux (edit the URL and password)
export APP_URL="https://your-app-url"
export ADMIN_PW="ColorAdmin144"
```

**Tip:** Add these to `~/.bashrc` so they persist:
```bash
echo 'export APP_URL="https://your-app-url"' >> ~/.bashrc
echo 'export ADMIN_PW="ColorAdmin144"' >> ~/.bashrc
source ~/.bashrc
```

### Step 4 — Test the connection

```bash
curl -s -X GET "$APP_URL/api/admin/git" \
  -H "x-admin-password: $ADMIN_PW" | jq .branch
```

You should see your current git branch name printed. If you get `401`, check your password.

---

## 🛠️ Core Termux Commands

### Check git status
```bash
curl -s -X GET "$APP_URL/api/admin/git" \
  -H "x-admin-password: $ADMIN_PW" | jq '{branch, status, log}'
```

### Run any shell command
```bash
curl -s -X POST "$APP_URL/api/admin/exec" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d '{"command":"git log --oneline -5"}' | jq '{stdout, exitCode}'
```

### Git add + commit + push (3 commands)
```bash
# Add all changes
curl -s -X POST "$APP_URL/api/admin/git" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d '{"op":"add"}' | jq .out

# Commit with message
curl -s -X POST "$APP_URL/api/admin/git" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d '{"op":"commit","args":"your commit message here"}' | jq .out

# Push to GitHub
curl -s -X POST "$APP_URL/api/admin/git" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d '{"op":"push"}' | jq .out
```

### TypeScript check
```bash
curl -s -X POST "$APP_URL/api/admin/exec" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d '{"command":"npx tsc --noEmit"}' | jq '{exitCode, stderr}'
```

### Check if server is running
```bash
curl -s -X POST "$APP_URL/api/admin/exec" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d '{"command":"curl -s -o /dev/null -w \"%{http_code}\" http://localhost:13000"}' | jq .stdout
```

### Read dev server error logs
```bash
curl -s "$APP_URL/api/admin/logs?file=stderr&lines=50" \
  -H "x-admin-password: $ADMIN_PW" | jq -r '.lines[]'
```

### Read any file
```bash
curl -s "$APP_URL/api/admin/files?path=app/page.tsx" \
  -H "x-admin-password: $ADMIN_PW" | jq -r .content
```

### Run a DB query
```bash
curl -s -X POST "$APP_URL/api/admin/db" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d '{"sql":"SELECT COUNT(*) FROM posts"}' | jq '.rows'
```

---

## 🔄 Method 3 — Stateful Shell Sessions (Most Powerful)

Sessions remember your working directory across commands — like a real shell.

### Create a session

```bash
SID=$(curl -s -X POST "$APP_URL/api/admin/shell" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d '{"action":"create"}' | jq -r .sessionId)

echo "Session: $SID"
```

### Run commands in the session

```bash
# Each command runs in the same directory context
curl -s -X POST "$APP_URL/api/admin/shell" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"exec\",\"sessionId\":\"$SID\",\"command\":\"git status\"}" \
  | jq -r .stdout
```

### Change directory in the session

```bash
curl -s -X POST "$APP_URL/api/admin/shell" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"cd\",\"sessionId\":\"$SID\",\"path\":\"app\"}" \
  | jq .cwd
```

### Check session info + command history

```bash
curl -s "$APP_URL/api/admin/shell?sessionId=$SID" \
  -H "x-admin-password: $ADMIN_PW" | jq '{cwd, history}'
```

### Destroy session when done

```bash
curl -s -X POST "$APP_URL/api/admin/shell" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"destroy\",\"sessionId\":\"$SID\"}" | jq .
```

---

## 🌊 Method 4 — Streaming (Watch Long Commands Live)

For commands that take a while (git push, pnpm install, etc.) — see output as it arrives:

```bash
curl -N -s -X POST "$APP_URL/api/admin/stream" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d '{"command":"git log --oneline -10"}' \
  | while IFS= read -r line; do
      echo "$line" | python3 -c "
import sys, json
try:
    ev = json.load(sys.stdin)
    if ev['type'] in ('stdout','stderr'):
        print(ev['data'], end='')
    elif ev['type'] == 'exit':
        print(f\"\\n[exit {ev['code']} · {ev['duration']}ms]\")
except: pass
"
    done
```

**Simpler version (raw ndjson, one line per event):**
```bash
curl -N -s -X POST "$APP_URL/api/admin/stream" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d '{"command":"ls -la"}'
```

---

## 📋 Useful Termux Aliases

Add these to `~/.bashrc` for fast access:

```bash
# Paste all at once into Termux
cat >> ~/.bashrc << 'EOF'

# 144K Color Project shortcuts
export APP_URL="https://your-app-url"
export ADMIN_PW="ColorAdmin144"

alias cstatus='curl -s -X GET "$APP_URL/api/admin/git" -H "x-admin-password: $ADMIN_PW" | jq "{branch,status}"'
alias cpush='curl -s -X POST "$APP_URL/api/admin/git" -H "x-admin-password: $ADMIN_PW" -H "Content-Type: application/json" -d "{\"op\":\"push\"}" | jq .out'
alias ctsc='curl -s -X POST "$APP_URL/api/admin/exec" -H "x-admin-password: $ADMIN_PW" -H "Content-Type: application/json" -d "{\"command\":\"npx tsc --noEmit\"}" | jq "{exitCode,stderr}"'
alias clogs='curl -s "$APP_URL/api/admin/logs?file=stderr&lines=40" -H "x-admin-password: $ADMIN_PW" | jq -r ".lines[]"'
alias cserver='curl -s -o /dev/null -w "%{http_code}\n" "$APP_URL/api/health"'
alias cdb='curl -s -X POST "$APP_URL/api/admin/db" -H "x-admin-password: $ADMIN_PW" -H "Content-Type: application/json" -d "{\"sql\":\"SELECT COUNT(*) as surveys FROM survey_responses; SELECT COUNT(*) as posts FROM posts;\"}" | jq .rows'

EOF

source ~/.bashrc
echo "Aliases loaded. Try: cstatus"
```

**After loading, you can just type:**
```bash
cstatus     # git branch + status
cpush       # push to GitHub
ctsc        # TypeScript check
clogs       # last 40 error lines
cserver     # check if server is up
cdb         # survey + post counts
```

---

## 🔄 Full Workflow Example — Make a Change from Phone

```bash
# 1. Check current state
cstatus

# 2. Run a command (e.g. drizzle DB push after schema change)
curl -s -X POST "$APP_URL/api/admin/exec" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d '{"command":"pnpm drizzle-kit push"}' | jq '{stdout, exitCode}'

# 3. TypeScript check
ctsc

# 4. Stage all changes
curl -s -X POST "$APP_URL/api/admin/git" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d '{"op":"add"}' | jq .out

# 5. Commit
curl -s -X POST "$APP_URL/api/admin/git" \
  -H "x-admin-password: $ADMIN_PW" \
  -H "Content-Type: application/json" \
  -d '{"op":"commit","args":"fix: update from phone"}' | jq .out

# 6. Push to GitHub
cpush
```

---

## 🛡️ Security Notes

- The admin password is your only protection — change it from `ColorAdmin144` to something strong
- Edit `ADMIN_PASSWORD=your-strong-password` in the `.env` file on the server
- Never share your password in plain text or commit it to git
- Sessions expire after 30 minutes of inactivity
- The exec API has blocked patterns (rm -rf /, fork bombs) but use common sense

---

## 📡 API Reference — Quick Card

| Endpoint | Method | What it does |
|---|---|---|
| `/api/admin/git` | GET | Get branch, status, recent log |
| `/api/admin/git` | POST `{op, args?}` | Run git op (status/diff/add/commit/push/pull) |
| `/api/admin/exec` | POST `{command, cwd?}` | Run any shell command |
| `/api/admin/stream` | POST `{command}` | Stream command output (ndjson) |
| `/api/admin/shell` | POST `{action,...}` | Stateful session (create/exec/cd/destroy) |
| `/api/admin/shell` | GET `?sessionId=` | Inspect session |
| `/api/admin/files` | GET `?path=` | Browse/read files |
| `/api/admin/files` | POST `{path, content}` | Write a file |
| `/api/admin/db` | POST `{sql, force?}` | Run SQL query |
| `/api/admin/logs` | GET `?file=&lines=` | Read server logs |

**All endpoints require header:** `x-admin-password: YOUR_PASSWORD`

---

*144,000 Color Project — Remote Access Guide · July 2026*

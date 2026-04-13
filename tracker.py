#!/usr/bin/env python3
"""
FlowMind OS v3.0 — Python Activity Tracker
Tracks your active window and sends to Spring Boot backend.

Install:  pip install psutil requests
Optional: pip install pygetwindow  (Windows only, better accuracy)
Run:      python tracker.py harshit pass123
"""
import sys, time, platform, subprocess, threading, requests
from datetime import datetime

BACKEND_URL   = "http://localhost:8080"
POLL_INTERVAL = 5      # seconds
MIN_DURATION  = 2000   # ms

USERNAME = sys.argv[1] if len(sys.argv) > 1 else "harshit"
PASSWORD = sys.argv[2] if len(sys.argv) > 2 else "pass123"
OS       = platform.system()
TOKEN    = None

PRODUCTIVE_KW   = ['code','vscode','visual studio','intellij','pycharm','terminal','bash','cmd',
                   'classroom','github','gitlab','notion','eclipse','jupyter','stackoverflow']
UNPRODUCTIVE_KW = ['youtube','netflix','instagram','tiktok','twitter','reddit','twitch','hulu','discord']
BROWSER_KW      = ['chrome','firefox','edge','safari','opera','brave']

current_app   = None
current_title = None
session_start = None

def ts():  return datetime.now().strftime("%H:%M:%S")
def log(m): print(f"[{ts()}] {m}")

# ── Window detection ───────────────────────────────────────────────────────────
def get_active_window():
    title, app = "Unknown", "Unknown"
    try:
        if OS == "Windows":
            try:
                import ctypes
                hwnd   = ctypes.windll.user32.GetForegroundWindow()
                length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
                if length > 0:
                    buf = ctypes.create_unicode_buffer(length + 1)
                    ctypes.windll.user32.GetWindowTextW(hwnd, buf, length + 1)
                    title = buf.value or "Unknown"
            except Exception:
                try:
                    import pygetwindow as gw
                    w = gw.getActiveWindow()
                    if w: title = w.title
                except ImportError:
                    pass
        elif OS == "Darwin":
            r = subprocess.run(
                ['osascript','-e','tell application "System Events" to get {name, title of front window} of first application process whose frontmost is true'],
                capture_output=True, text=True, timeout=3)
            parts = r.stdout.strip().split(', ', 1)
            app   = parts[0].strip() if parts else "Unknown"
            title = parts[1].strip() if len(parts)>1 else app
        else:
            try:
                r = subprocess.run(['xdotool','getactivewindow','getwindowname'],
                                   capture_output=True, text=True, timeout=3)
                title = r.stdout.strip() or "Unknown"
            except FileNotFoundError:
                pass
    except Exception as e:
        log(f"Window error: {e}")
    if app == "Unknown":
        app = derive_app(title)
    return title, app

def derive_app(title):
    if not title or title == "Unknown": return "Unknown"
    t = title.lower()
    mapping = {
        'youtube':'YouTube','netflix':'Netflix','classroom':'Classroom',
        'github.com':'GitHub','whatsapp':'WhatsApp','discord':'Discord',
        'slack':'Slack','spotify':'Spotify','notion':'Notion',
        'instagram':'Instagram','twitter':'Twitter/X','x.com':'Twitter/X',
        'stackoverflow':'StackOverflow','jupyter':'Jupyter',
        'android studio':'Android Studio','intellij':'IntelliJ',
        'pycharm':'PyCharm','visual studio code':'VS Code','vscode':'VS Code',
        '— code':'VS Code','-  code':'VS Code',
        'terminal':'Terminal','bash':'Terminal','zsh':'Terminal',
        'powershell':'Terminal','cmd.exe':'Terminal',
        'google chrome':'Chrome','chrome':'Chrome',
        'firefox':'Firefox','microsoft edge':'Edge','safari':'Safari',
    }
    for k, v in mapping.items():
        if k in t: return v
    parts = [p.strip() for p in title.split(' - ')]
    if len(parts) > 1 and len(parts[-1]) < 30:
        return parts[-1]
    return title[:25].strip()

def categorize(app):
    a = app.lower()
    if any(k in a for k in PRODUCTIVE_KW):   return 'PRODUCTIVE'
    if any(k in a for k in UNPRODUCTIVE_KW): return 'UNPRODUCTIVE'
    return 'NEUTRAL'

# ── Backend ────────────────────────────────────────────────────────────────────
def login():
    global TOKEN
    try:
        r = requests.post(f"{BACKEND_URL}/auth/login",
                          json={"username":USERNAME,"password":PASSWORD}, timeout=5)
        d = r.json()
        if 'token' in d:
            TOKEN = d['token']
            log(f"✓ Logged in as [{USERNAME}]")
            return True
        log(f"✗ Login failed: {d.get('error','unknown')}")
    except requests.ConnectionError:
        log(f"✗ Cannot connect to {BACKEND_URL} — is Spring Boot running?")
    except Exception as e:
        log(f"✗ Login error: {e}")
    return False

def send(app_name, window_title, duration_ms, start_ts, end_ts):
    if not TOKEN: return
    try:
        requests.post(f"{BACKEND_URL}/activity",
            json={"appName":app_name,"windowTitle":window_title[:120],
                  "durationMs":duration_ms,"startTime":start_ts,"endTime":end_ts,
                  "userId":USERNAME,"category":categorize(app_name),"source":"python_tracker"},
            headers={"X-Token":TOKEN}, timeout=4)
    except Exception as e:
        log(f"Send error: {e}")

def heartbeat():
    while True:
        time.sleep(60)
        try: requests.get(f"{BACKEND_URL}/auth/me", headers={"X-Token":TOKEN}, timeout=3)
        except: pass

# ── Main loop ──────────────────────────────────────────────────────────────────
def main():
    global current_app, current_title, session_start
    print("="*55)
    print("  FlowMind OS — Python Activity Tracker v3.0")
    print("="*55)
    print(f"  OS:      {OS}")
    print(f"  Backend: {BACKEND_URL}")
    print(f"  User:    {USERNAME}")
    print("="*55)

    for attempt in range(3):
        if login(): break
        log(f"Retry {attempt+1}/3 in 5s…"); time.sleep(5)
    else:
        log("FATAL: Could not connect. Exiting."); sys.exit(1)

    threading.Thread(target=heartbeat, daemon=True).start()
    log(f"Tracking started (poll every {POLL_INTERVAL}s) — Ctrl+C to stop")
    session_start = time.time()

    while True:
        try:
            title, app = get_active_window()
            now = time.time()
            if app != current_app:
                if current_app and current_app != "Unknown" and session_start:
                    dur_ms = int((now - session_start) * 1000)
                    if dur_ms >= MIN_DURATION:
                        send(current_app, current_title or current_app, dur_ms,
                             int(session_start * 1000), int(now * 1000))
                        log(f"Recorded: [{current_app}] {dur_ms//1000}s")
                current_app, current_title, session_start = app, title, now
                log(f"Active: [{app}] — {title[:60]}")
            time.sleep(POLL_INTERVAL)
        except KeyboardInterrupt:
            if current_app and current_app != "Unknown":
                now = time.time()
                dur_ms = int((now - session_start) * 1000)
                if dur_ms >= MIN_DURATION:
                    send(current_app, current_title or current_app, dur_ms,
                         int(session_start * 1000), int(now * 1000))
            log("Tracker stopped."); break
        except Exception as e:
            log(f"Loop error: {e}"); time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()

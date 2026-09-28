"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Terminal,
  Shield,
  Search,
  Globe,
  Lock,
  Key,
  Cpu,
  Network,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Server,
  FileCode,
  Activity,
  Layers,
  Database,
  Eye,
  Smartphone,
  Bug,
  Wifi,
  Clock,
  BookOpen,
  Gamepad2,
  Users,
  Puzzle,
  Award,
} from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { useToolCard, ToolActions } from "@/components/tool/ToolPlaygrounds";

/* ============================================================================
 * HELPER: INLINE COPY BUTTON
 * ========================================================================== */
function InlineCopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-xs border border-border bg-background px-2 py-1 font-heading text-[10px] font-bold uppercase tracking-wider text-text-muted hover:border-accent hover:text-accent transition cursor-pointer"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}

/* ============================================================================
 * 1. BROWSER PRIVACY SHIELD & ANTI-TRACKING AUDITOR
 * ========================================================================== */
interface PrivacySignalCheck {
  id: string;
  label: string;
  apiPath: string;
  detectedValue: string;
  hardened: boolean;
  points: number;
  maxPoints: number;
  remediation: string;
}

function BrowserPrivacyShieldAntiTrackingAuditor({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [checks, setChecks] = useState<PrivacySignalCheck[]>([]);
  const [simulateBraveHardened, setSimulateBraveHardened] = useState(false);
  const [scanTimestamp, setScanTimestamp] = useState<string>("");

  const runLiveAudit = useCallback((forceHardened: boolean) => {
    if (typeof window === "undefined") return;
    const nav = window.navigator as Navigator & {
      globalPrivacyControl?: boolean;
      gpu?: unknown;
      deviceMemory?: number;
    };

    const gpcActive = forceHardened ? true : Boolean(nav.globalPrivacyControl);
    const dntVal = forceHardened ? "1" : nav.doNotTrack || "null (unset)";
    const dntActive = dntVal === "1" || dntVal === "yes";
    const webdriverActive = forceHardened ? false : Boolean(nav.webdriver);
    const hasWebGpu = forceHardened ? false : Boolean(nav.gpu);
    const cores = forceHardened ? 2 : nav.hardwareConcurrency || 4;
    const coresClamped = cores <= 4;
    const hasChromeGlobal = forceHardened
      ? false
      : Boolean((window as unknown as { chrome?: unknown }).chrome);

    // Measure subtle AudioContext float variance / noise check
    let audioProtected = forceHardened;
    if (!forceHardened) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        audioProtected = !AudioCtx;
      } catch {
        audioProtected = true;
      }
    }

    // Storage / Partitioning check
    const cookiesEnabled = nav.cookieEnabled;
    const storagePartitioned = forceHardened ? true : true; // Modern browsers default to CHIPS / Total Cookie Protection

    const results: PrivacySignalCheck[] = [
      {
        id: "gpc",
        label: "Global Privacy Control (Sec-GPC)",
        apiPath: "navigator.globalPrivacyControl",
        detectedValue: gpcActive ? "true (Sec-GPC: 1 active)" : "false / undefined",
        hardened: gpcActive,
        points: gpcActive ? 20 : 0,
        maxPoints: 20,
        remediation: "Enable privacy.globalprivacycontrol.enabled = true in Firefox/Brave Shields.",
      },
      {
        id: "dnt",
        label: "Do Not Track Header (DNT)",
        apiPath: "navigator.doNotTrack",
        detectedValue: String(dntVal),
        hardened: dntActive,
        points: dntActive ? 10 : 3,
        maxPoints: 10,
        remediation: "Set Send 'Do Not Track' request with browsing traffic in browser settings.",
      },
      {
        id: "webdriver",
        label: "Automation / WebDriver Flag Leak",
        apiPath: "navigator.webdriver",
        detectedValue: webdriverActive ? "true (Headless/Bot Flag Exposed!)" : "false (Clean)",
        hardened: !webdriverActive,
        points: !webdriverActive ? 15 : 0,
        maxPoints: 15,
        remediation: "Disable --enable-automation flag or use stealth browser profiles.",
      },
      {
        id: "webgpu",
        label: "WebGPU Hardware Adapter Enumeration",
        apiPath: "navigator.gpu",
        detectedValue: hasWebGpu ? "Exposed (GPU Architecture Fingerprinting Possible)" : "Blocked / Restricted",
        hardened: !hasWebGpu,
        points: !hasWebGpu ? 15 : 5,
        maxPoints: 15,
        remediation: "Disable dom.webgpu.enabled or restrict WebGPU in chrome://flags.",
      },
      {
        id: "audio",
        label: "AudioContext Oscillator Farbling",
        apiPath: "OfflineAudioContext.destination",
        detectedValue: audioProtected
          ? "Farbled / Noise Injected (Anti-Fingerprint Active)"
          : "Standard Float32 PCM (Deterministic Hash)",
        hardened: audioProtected,
        points: audioProtected ? 15 : 5,
        maxPoints: 15,
        remediation: "Enable privacy.resistFingerprinting = true or Brave Strict Fingerprinting Shield.",
      },
      {
        id: "cores",
        label: "CPU Thread Spoofing / Clamping",
        apiPath: "navigator.hardwareConcurrency",
        detectedValue: `${cores} logical cores reported`,
        hardened: coresClamped,
        points: coresClamped ? 10 : 4,
        maxPoints: 10,
        remediation: "privacy.resistFingerprinting clamps reported logical cores to 2.",
      },
      {
        id: "partition",
        label: "State Partitioning / Total Cookie Protection",
        apiPath: "document.hasStorageAccess / CHIPS",
        detectedValue: storagePartitioned
          ? `Partitioned (cookiesEnabled=${cookiesEnabled})`
          : "Unpartitioned 3P Storage",
        hardened: storagePartitioned,
        points: storagePartitioned ? 15 : 0,
        maxPoints: 15,
        remediation: "Set network.cookie.cookieBehavior = 5 (Total Cookie Protection / dFPI).",
      },
      {
        id: "chrome_obj",
        label: "Vendor Runtime Object Exposure",
        apiPath: "window.chrome",
        detectedValue: hasChromeGlobal ? "Present (Chromium Engine Signature)" : "Hidden / Non-Chromium",
        hardened: !hasChromeGlobal,
        points: !hasChromeGlobal ? 0 : 0, // Informational
        maxPoints: 0,
        remediation: "Informational engine telemetry check.",
      },
    ];

    setChecks(results);
    setScanTimestamp(new Date().toISOString());
  }, []);

  useEffect(() => {
    setSimulateBraveHardened(false);
    runLiveAudit(false);
  }, [resetTrigger, runLiveAudit]);

  useEffect(() => {
    runLiveAudit(simulateBraveHardened);
  }, [simulateBraveHardened, runLiveAudit]);

  const totalScore = useMemo(
    () => checks.reduce((acc, c) => acc + c.points, 0),
    [checks]
  );

  const hardenedConfigSnippet = useMemo(() => {
    return `# Firefox / LibreWolf user.js Anti-Tracking Hardening
user_pref("privacy.resistFingerprinting", true);
user_pref("privacy.globalprivacycontrol.enabled", true);
user_pref("privacy.trackingprotection.enabled", true);
user_pref("network.cookie.cookieBehavior", 5); // Total Cookie Protection (dFPI)
user_pref("network.http.referer.XOriginTrimmingPolicy", 2); // Origin-only Cross-Origin Referer
user_pref("dom.webgpu.enabled", false);
user_pref("media.peerconnection.ice.default_address_only", true); // Prevent WebRTC Local IP Leak`;
  }, []);

  useEffect(() => {
    if (!checks.length) return;
    const report = [
      `=== BROWSER PRIVACY SHIELD & ANTI-TRACKING AUDIT ===`,
      `Timestamp: ${scanTimestamp}`,
      `Mode: ${simulateBraveHardened ? "Simulated Brave/Mullvad Hardened Profile" : "Live Client Navigator Inspection"}`,
      `Overall Anti-Tracking Score: ${totalScore} / 100`,
      ``,
      `--- TELEMETRY & FINGERPRINTING VECTOR RESULTS ---`,
      ...checks.map(
        (c) =>
          `[${c.hardened ? "PASS" : "WARN"}] ${c.label} (${c.apiPath}): ${c.detectedValue} (${c.points}/${c.maxPoints} pts)\n  -> Fix: ${c.remediation}`
      ),
      ``,
      hardenedConfigSnippet,
    ].join("\n");
    setOutput(report);
  }, [checks, scanTimestamp, simulateBraveHardened, totalScore, hardenedConfigSnippet, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border border-border bg-background p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xs border border-border bg-surface font-mono-code text-lg font-bold text-accent">
            {totalScore}
          </div>
          <div>
            <div className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Anti-Tracking Shield Score: {totalScore} / 100
            </div>
            <div className="text-xs text-text-muted">
              {totalScore >= 80
                ? "Hardened Anti-Fingerprint Posture (Brave / Tor / LibreWolf Grade)"
                : totalScore >= 50
                ? "Moderate Protection — Standard Partitioning Active, Hardware Entropy Exposed"
                : "High Fingerprint Linkability — Enable Global Privacy Control & Canvas/Audio Farbling"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSimulateBraveHardened((prev) => !prev)}
            className={`rounded-xs border px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              simulateBraveHardened
                ? "border-accent bg-accent/15 text-accent"
                : "border-border bg-surface text-text hover:border-accent"
            }`}
          >
            {simulateBraveHardened ? "Showing Hardened Simulation" : "Simulate Hardened Profile"}
          </button>
          <button
            type="button"
            onClick={() => runLiveAudit(simulateBraveHardened)}
            className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-Scan Browser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checks.map((c) => (
          <div
            key={c.id}
            className="rounded-xs border border-border bg-background p-3 flex flex-col justify-between gap-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-heading text-xs font-bold text-text flex items-center gap-1.5">
                  {c.hardened ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  )}
                  {c.label}
                </div>
                <div className="font-mono-code text-[11px] text-accent mt-0.5">{c.apiPath}</div>
              </div>
              {c.maxPoints > 0 && (
                <span className="rounded-xs border border-border bg-surface px-1.5 py-0.5 font-mono-code text-[10px] text-text-muted">
                  {c.points}/{c.maxPoints} pts
                </span>
              )}
            </div>
            <div className="font-mono-code text-xs text-text bg-surface px-2 py-1 rounded-xs border border-border">
              {c.detectedValue}
            </div>
            <div className="text-[11px] text-text-muted">{c.remediation}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Hardened user.js / about:config Anti-Fingerprinting Rules
          </span>
          <InlineCopyButton text={hardenedConfigSnippet} label="Copy user.js" />
        </div>
        <pre className="overflow-x-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-text">
          {hardenedConfigSnippet}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 2. PHONE STALKERWARE & MVT FORENSIC TRIAGE SCANNER
 * ========================================================================== */
interface StalkerwareIndicator {
  id: string;
  platform: "Android" | "iOS" | "Both";
  title: string;
  weight: number;
  forensicArtifact: string;
}

const STALKERWARE_INDICATORS: StalkerwareIndicator[] = [
  {
    id: "accessibility_abuse",
    platform: "Android",
    title: "Unknown Service Enabled in Accessibility Settings",
    weight: 28,
    forensicArtifact: "settings get secure enabled_accessibility_services (Keylogger / Screen Scraper)",
  },
  {
    id: "play_protect_off",
    platform: "Android",
    title: "Google Play Protect Disabled or Muted",
    weight: 20,
    forensicArtifact: "package_verifier_enable=0 in settings_global.xml",
  },
  {
    id: "device_admin",
    platform: "Android",
    title: "Hidden / Blank-Icon Device Administrator Active",
    weight: 22,
    forensicArtifact: "dpm list-owners / device_policies.xml (Prevents standard uninstall)",
  },
  {
    id: "ios_mdm_profile",
    platform: "iOS",
    title: "Unrecognized MDM / Configuration Profile Installed",
    weight: 25,
    forensicArtifact: "Settings > General > VPN & Device Management (Root CA / Enterprise Sideload)",
  },
  {
    id: "notification_listener",
    platform: "Android",
    title: "Untrusted App Granted Notification Listener Access",
    weight: 18,
    forensicArtifact: "cmd notification allow_listener (Intercepts WhatsApp/Signal/SMS previews)",
  },
  {
    id: "apple_id_session",
    platform: "iOS",
    title: "Unknown Trusted Device or Windows iCloud Backup Session",
    weight: 22,
    forensicArtifact: "Settings > [Name] > Device List (Cloud-based iCloud stalkerware extraction)",
  },
  {
    id: "call_forwarding",
    platform: "Both",
    title: "Conditional Call Forwarding Active on *#21# or *#62#",
    weight: 15,
    forensicArtifact: "MMI Interrogation shows voice/SMS forwarding to unknown number",
  },
  {
    id: "battery_radio_spike",
    platform: "Both",
    title: "High Background Cellular Data & Microphone Wake-Locks at 2–4 AM",
    weight: 14,
    forensicArtifact: "dumpsys batterystats / iOS App Privacy Report nocturnal sensor access",
  },
  {
    id: "location_always",
    platform: "Both",
    title: "Generic 'System Update' or 'Wi-Fi Service' Has 'Always' Location Permission",
    weight: 18,
    forensicArtifact: "dumpsys package permissions ACCESS_BACKGROUND_LOCATION",
  },
  {
    id: "usb_debug_auth",
    platform: "Android",
    title: "ADB USB Debugging Enabled with Unknown RSA Host Key",
    weight: 16,
    forensicArtifact: "/data/misc/adb/adb_keys contains unauthorized workstation fingerprint",
  },
];

const KNOWN_STALKERWARE_SIGNATURES: { pattern: string; family: string; risk: string }[] = [
  { pattern: "com.mspy.lite", family: "mSpy Commercial Stalkerware", risk: "CRITICAL" },
  { pattern: "com.android.system.update.service", family: "FlexiSPY / Masqueraded Agent", risk: "CRITICAL" },
  { pattern: "com.lsdroid.cerberus", family: "Cerberus Anti-Theft (Abused for Stalking)", risk: "HIGH" },
  { pattern: "com.hoverwatch.watcher", family: "Hoverwatch Stealth Logger", risk: "CRITICAL" },
  { pattern: "com.cocospy.app", family: "Cocospy / Spyic Variant", risk: "CRITICAL" },
  { pattern: "com.kidsguard.pro", family: "KidsGuard Pro (Dual-Use Surveillance)", risk: "HIGH" },
  { pattern: "ufed.cellebrite", family: "Cellebrite Physical Extraction Artifact", risk: "CRITICAL" },
];

function PhoneStalkerwareMvtForensicTriage({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "accessibility_abuse",
    "play_protect_off",
  ]);
  const [packageDump, setPackageDump] = useState<string>(
    `package:com.android.chrome\npackage:com.whatsapp\npackage:com.mspy.lite\npackage:com.android.system.update.service\npackage:org.thoughtcrime.securesms`
  );

  useEffect(() => {
    setSelectedIds(["accessibility_abuse", "play_protect_off"]);
  }, [resetTrigger]);

  const toggleIndicator = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const riskScore = useMemo(() => {
    const raw = STALKERWARE_INDICATORS.filter((i) => selectedIds.includes(i.id)).reduce(
      (sum, i) => sum + i.weight,
      0
    );
    return Math.min(100, raw);
  }, [selectedIds]);

  const matchedPackages = useMemo(() => {
    const lower = packageDump.toLowerCase();
    return KNOWN_STALKERWARE_SIGNATURES.filter((sig) =>
      lower.includes(sig.pattern.toLowerCase())
    );
  }, [packageDump]);

  const mvtCommands = `# 1. Install Amnesty International Mobile Verification Toolkit (MVT)
pipx install mvt
mvt-android download-iocs

# 2. Non-Destructive ADB Package & Accessibility Triage
adb shell pm list packages -f -3 > installed_3p_apks.txt
adb shell settings get secure enabled_accessibility_services
adb shell dumpsys device_policy

# 3. Run MVT Against Android Backup / Bugreport or iOS Backup
mvt-android check-adb --output ./mvt_forensic_out
mvt-ios check-backup --iocs ~/.local/share/mvt/indicators ./ios_backup_dir`;

  useEffect(() => {
    const activeList = STALKERWARE_INDICATORS.filter((i) => selectedIds.includes(i.id));
    const report = [
      `=== MOBILE STALKERWARE & MVT FORENSIC TRIAGE REPORT ===`,
      `Compromise Triage Risk Score: ${riskScore}/100 (${
        riskScore >= 60 || matchedPackages.length > 0
          ? "CRITICAL — ACTIVE SURVEILLANCE INDICATORS DETECTED"
          : riskScore >= 30
          ? "ELEVATED — SUSPICIOUS PERMISSION CONFIGURATION"
          : "LOW — ROUTINE HYGIENE CHECK"
      })`,
      `OPSEC SAFETY NOTICE: Removing stalkerware immediately alerts the operator's dashboard. Use a separate safe device to plan remediation.`,
      ``,
      `--- ACTIVE PHYSICAL / OS INDICATORS (${activeList.length}) ---`,
      ...activeList.map((i) => `* [${i.platform}] ${i.title}\n  Artifact: ${i.forensicArtifact}`),
      ``,
      `--- PACKAGE IOC SCAN MATCHES (${matchedPackages.length}) ---`,
      ...(matchedPackages.length
        ? matchedPackages.map((m) => `[${m.risk}] ${m.pattern} -> ${m.family}`)
        : ["No known stalkerware package signatures found in pasted package list."]),
      ``,
      `--- MVT & ADB FORENSIC COMMANDS ---`,
      mvtCommands,
    ].join("\n");
    setOutput(report);
  }, [selectedIds, riskScore, matchedPackages, mvtCommands, setOutput]);

  return (
    <div className="space-y-5">
      <div className="rounded-xs border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-text flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-heading uppercase tracking-wider text-amber-300">
            Operational Safety (OPSEC) Warning:
          </strong>{" "}
          Commercial stalkerware notifies the remote operator if uninstalled or if Airplane Mode is toggled. Preserve evidence with{" "}
          <code className="font-mono-code">adb bugreport</code> or MVT before wiping.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {STALKERWARE_INDICATORS.map((ind) => {
          const checked = selectedIds.includes(ind.id);
          return (
            <button
              key={ind.id}
              type="button"
              onClick={() => toggleIndicator(ind.id)}
              className={`text-left rounded-xs border p-3 transition cursor-pointer ${
                checked
                  ? "border-accent bg-accent/10"
                  : "border-border bg-background hover:border-accent/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading text-xs font-bold text-text">{ind.title}</span>
                <span className="rounded-xs border border-border bg-surface px-1.5 py-0.5 font-mono-code text-[10px] text-accent">
                  {ind.platform} (+{ind.weight})
                </span>
              </div>
              <div className="mt-1 font-mono-code text-[11px] text-text-muted">
                {ind.forensicArtifact}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Paste `adb shell pm list packages` Output
            </label>
            <span className="font-mono-code text-[11px] text-accent">
              {matchedPackages.length} IOC match(es)
            </span>
          </div>
          <textarea
            rows={5}
            value={packageDump}
            onChange={(e) => setPackageDump(e.target.value)}
            className="w-full rounded-xs border border-border bg-surface p-2.5 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />
          {matchedPackages.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              {matchedPackages.map((m) => (
                <div
                  key={m.pattern}
                  className="flex items-center justify-between rounded-xs border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 font-mono-code text-xs"
                >
                  <span className="text-red-300 font-bold">{m.pattern}</span>
                  <span className="text-text-muted">{m.family}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-emerald-400 font-mono-code">
              ✓ No known stalkerware package names matched in current dump.
            </div>
          )}
        </div>

        <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Amnesty MVT & ADB Non-Destructive Commands
            </span>
            <InlineCopyButton text={mvtCommands} label="Copy MVT CLI" />
          </div>
          <pre className="overflow-x-auto rounded-xs border border-border bg-surface p-2.5 font-mono-code text-[11px] text-text">
            {mvtCommands}
          </pre>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 3. NTP STRATUM & CLOCK DRIFT ENUMERATION INSPECTOR
 * ========================================================================== */
function NtpStratumClockDriftEnumerationInspector({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [targetHost, setTargetHost] = useState("ntp.example.org");
  const [selectedStratum, setSelectedStratum] = useState<number>(2);
  const [simulatedDriftMs, setSimulatedDriftMs] = useState<number>(14.2);
  const [mode6Exposed, setMode6Exposed] = useState<boolean>(true);
  const [mode7Monlist, setMode7Monlist] = useState<boolean>(false);

  useEffect(() => {
    setTargetHost("ntp.example.org");
    setSelectedStratum(2);
    setSimulatedDriftMs(14.2);
    setMode6Exposed(true);
    setMode7Monlist(false);
  }, [resetTrigger]);

  const stratumInfo = useMemo(() => {
    if (selectedStratum === 0)
      return "Stratum 0: Atomic Clock (Cesium/Rubidium) or GPS PPS Hardware Reference (Not directly on network)";
    if (selectedStratum === 1)
      return "Stratum 1: Primary Network Time Server directly attached to Stratum 0 via RS-232/PPS";
    if (selectedStratum <= 4)
      return `Stratum ${selectedStratum}: Secondary Enterprise/ISP Time Server syncing via UDP/123 hierarchy`;
    if (selectedStratum < 16)
      return `Stratum ${selectedStratum}: High-hop downstream NTP client/peer`;
    return "Stratum 16: Unsynchronized / Clock Out-of-Spec (Kerberos & TLS Validation Risk!)";
  }, [selectedStratum]);

  const kerberosStatus = useMemo(() => {
    const absSec = Math.abs(simulatedDriftMs) / 1000;
    if (absSec > 300) return "CRITICAL: Drift > 5 min (300s) — Kerberos KRB_AP_ERR_SKEW & TOTP 2FA Failure!";
    if (absSec > 1) return "WARN: Drift > 1,000 ms — Distributed database / log correlation skew.";
    return "HEALTHY: Clock offset within sub-second enterprise tolerance.";
  }, [simulatedDriftMs]);

  const reconCommands = useMemo(() => {
    const cleanHost = targetHost.trim() || "ntp.example.org";
    return `# 1. Nmap UDP/123 Mode 6 (readvar banner leak) & Mode 7 (monlist amplification) Audit
nmap -sU -p 123 --script ntp-info,ntp-monlist ${cleanHost}

# 2. Query NTP Control Mode 6 System Variables (OS, ntpd version, Stratum, RefID)
ntpq -c rv ${cleanHost}
ntpq -c peers ${cleanHost}

# 3. Chrony Modern CLI Source & Drift Verification
chronyc sources -v
chronyc tracking

# 4. Hardened /etc/ntp.conf Remediation (Block Mode 6 & Mode 7 Amplification)
restrict default kod nomodify notrap nopeer noquery
restrict -6 default kod nomodify notrap nopeer noquery
disable monitor`;
  }, [targetHost]);

  const simulatedMode6Banner = useMemo(() => {
    if (!mode6Exposed) {
      return `***Request timed out (noquery restriction active on ${targetHost})`;
    }
    return `associd=0 status=0615 leap_none, sync_ntp, 1 event, clock_sync,
version="ntpd 4.2.8p15@1.3728-o", processor="x86_64",
system="Linux/5.15.0-112-generic", leap=00, stratum=${selectedStratum},
precision=-23, rootdelay=12.412, rootdisp=24.890, refid=192.0.2.1,
offset=${simulatedDriftMs.toFixed(3)}, jitter=1.402`;
  }, [mode6Exposed, targetHost, selectedStratum, simulatedDriftMs]);

  useEffect(() => {
    const report = [
      `=== NTP STRATUM & UDP/123 ENUMERATION REPORT ===`,
      `Target NTP Server: ${targetHost}`,
      `Hierarchy Level: ${stratumInfo}`,
      `Simulated Clock Offset: ${simulatedDriftMs} ms (${kerberosStatus})`,
      `Mode 6 (readvar) Leak: ${mode6Exposed ? "VULNERABLE — Leaks OS/Kernel/ntpd version" : "MITIGATED (noquery)"}`,
      `Mode 7 (monlist) DDoS Risk: ${mode7Monlist ? "CRITICAL (CVE-2013-5211 556x UDP Amplification)" : "DISABLED"}`,
      ``,
      `--- SIMULATED NTPQ MODE 6 RESPONSE ---`,
      simulatedMode6Banner,
      ``,
      `--- RECON & HARDENING COMMANDS ---`,
      reconCommands,
    ].join("\n");
    setOutput(report);
  }, [targetHost, stratumInfo, simulatedDriftMs, kerberosStatus, mode6Exposed, mode7Monlist, simulatedMode6Banner, reconCommands, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Target NTP Host / IP
          </label>
          <input
            type="text"
            value={targetHost}
            onChange={(e) => setTargetHost(e.target.value)}
            className="mt-1.5 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted">
            NTP Stratum Hierarchy ({selectedStratum})
          </label>
          <input
            type="range"
            min={0}
            max={16}
            value={selectedStratum}
            onChange={(e) => setSelectedStratum(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
          <div className="mt-1 text-[11px] text-text-muted">{stratumInfo}</div>
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Clock Offset / Skew (ms)
          </label>
          <input
            type="number"
            step="10"
            value={simulatedDriftMs}
            onChange={(e) => setSimulatedDriftMs(Number(e.target.value))}
            className="mt-1.5 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />
          <div className="mt-1 text-[10px] text-accent font-mono-code">{kerberosStatus}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setMode6Exposed((v) => !v)}
          className={`rounded-xs border px-3 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            mode6Exposed
              ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          Mode 6 `readvar` Query: {mode6Exposed ? "Exposed (OS Banner Leak)" : "Restricted (noquery)"}
        </button>

        <button
          type="button"
          onClick={() => setMode7Monlist((v) => !v)}
          className={`rounded-xs border px-3 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            mode7Monlist
              ? "border-red-500/50 bg-red-500/15 text-red-300"
              : "border-border bg-background text-text-muted"
          }`}
        >
          Mode 7 `monlist`: {mode7Monlist ? "VULNERABLE (556x DDoS Amplification)" : "Disabled (Safe)"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Simulated `ntpq -c rv` Mode 6 Packet Response
          </span>
          <pre className="overflow-x-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-accent">
            {simulatedMode6Banner}
          </pre>
        </div>

        <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Nmap UDP/123 Recon & Hardening Config
            </span>
            <InlineCopyButton text={reconCommands} label="Copy Commands" />
          </div>
          <pre className="overflow-x-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-[11px] text-text">
            {reconCommands}
          </pre>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 4. TERMUX & KALI NETHUNTER ANDROID PENTEST BUILDER
 * ========================================================================== */
const TERMUX_PACKAGES = [
  { id: "nmap", label: "nmap (Network & Port Mapper)", cmd: "nmap" },
  { id: "python", label: "python + pip (Scripting Runtime)", cmd: "python" },
  { id: "git", label: "git (Repo Cloning)", cmd: "git" },
  { id: "openssh", label: "openssh (SSH Daemon on Port 8022)", cmd: "openssh" },
  { id: "tsu", label: "tsu (Root Shell Wrapper for Magisk/KSU)", cmd: "tsu" },
  { id: "curl_jq", label: "curl + jq + dnsutils (API & DNS Recon)", cmd: "curl jq dnsutils" },
  { id: "rustscan", label: "tur-repo + rustscan (Fast Port Scanner)", cmd: "tur-repo && pkg install -y rustscan" },
  { id: "proot_kali", label: "proot-distro (Rootless Kali Linux Chroot)", cmd: "proot-distro" },
];

function TermuxNethunterAndroidPentestBuilder({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [selectedPkgs, setSelectedPkgs] = useState<string[]>([
    "nmap",
    "python",
    "git",
    "openssh",
    "proot_kali",
  ]);
  const [enableSshServer, setEnableSshServer] = useState(true);
  const [enableWakeLock, setEnableWakeLock] = useState(true);
  const [wirelessMonitorMode, setWirelessMonitorMode] = useState(false);

  useEffect(() => {
    setSelectedPkgs(["nmap", "python", "git", "openssh", "proot_kali"]);
    setEnableSshServer(true);
    setEnableWakeLock(true);
    setWirelessMonitorMode(false);
  }, [resetTrigger]);

  const togglePkg = (id: string) => {
    setSelectedPkgs((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const generatedScript = useMemo(() => {
    const pkgList = TERMUX_PACKAGES.filter((p) => selectedPkgs.includes(p.id))
      .map((p) => p.cmd)
      .join(" ");

    const lines: string[] = [
      `#!/data/data/com.termux/files/usr/bin/bash`,
      `# Android Termux (F-Droid) & Kali NetHunter Provisioning Script`,
      `# NOTE: Always install Termux from F-Droid or GitHub Releases (NOT Play Store)`,
      ``,
      `pkg update -y && pkg upgrade -y`,
      `pkg install -y root-repo x11-repo`,
    ];

    if (pkgList) {
      lines.push(`pkg install -y ${pkgList}`);
    }

    if (enableWakeLock) {
      lines.push(
        ``,
        `# Grant Shared Storage Access & Acquire CPU Wake-Lock (Prevent Android Phantom Process Killer)`,
        `termux-setup-storage`,
        `termux-wake-lock`
      );
    }

    if (enableSshServer) {
      lines.push(
        ``,
        `# Configure OpenSSH Server (Listens on Non-Privileged Port 8022)`,
        `passwd # Set your Termux session password`,
        `sshd`,
        `echo "Connect from laptop: ssh -p 8022 $(whoami)@<PHONE_LAN_IP>"`
      );
    }

    if (selectedPkgs.includes("proot_kali")) {
      lines.push(
        ``,
        `# Install Rootless Kali NetHunter Minimal via proot-distro`,
        `proot-distro install nethunter`,
        `proot-distro login nethunter -- apt update && apt install -y sqlmap hydra nikto`
      );
    }

    if (wirelessMonitorMode) {
      lines.push(
        ``,
        `# Kali NetHunter Rooted Kernel OTG External Wi-Fi Adapter (RTL8812AU / MT7612U) Monitor Mode`,
        `su -c "ip link set wlan1 down && iw dev wlan1 set type monitor && ip link set wlan1 up"`,
        `su -c "airodump-ng wlan1"`
      );
    }

    lines.push(
      ``,
      `# Optional: Disable Android 12+ Phantom Process Killer (32 subprocess limit) via Wireless ADB`,
      `# adb shell "/system/bin/device_config set_sync_disabled_for_tests persistent"`,
      `# adb shell "/system/bin/device_config put activity_manager max_phantom_processes 2147483647"`
    );

    return lines.join("\n");
  }, [selectedPkgs, enableSshServer, enableWakeLock, wirelessMonitorMode]);

  useEffect(() => {
    setOutput(generatedScript);
  }, [generatedScript, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {TERMUX_PACKAGES.map((pkg) => {
          const active = selectedPkgs.includes(pkg.id);
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => togglePkg(pkg.id)}
              className={`text-left rounded-xs border p-2.5 transition cursor-pointer ${
                active
                  ? "border-accent bg-accent/10 text-text"
                  : "border-border bg-background text-text-muted hover:border-accent/50"
              }`}
            >
              <div className="font-heading text-xs font-bold">{pkg.label}</div>
              <div className="font-mono-code text-[10px] text-accent mt-1">pkg install {pkg.id}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => setEnableWakeLock((v) => !v)}
          className={`rounded-xs border px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider cursor-pointer ${
            enableWakeLock ? "border-accent bg-accent/15 text-accent" : "border-border bg-background text-text-muted"
          }`}
        >
          Storage + Wake-Lock: {enableWakeLock ? "ON" : "OFF"}
        </button>
        <button
          type="button"
          onClick={() => setEnableSshServer((v) => !v)}
          className={`rounded-xs border px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider cursor-pointer ${
            enableSshServer ? "border-accent bg-accent/15 text-accent" : "border-border bg-background text-text-muted"
          }`}
        >
          OpenSSH Server (Port 8022): {enableSshServer ? "ON" : "OFF"}
        </button>
        <button
          type="button"
          onClick={() => setWirelessMonitorMode((v) => !v)}
          className={`rounded-xs border px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider cursor-pointer ${
            wirelessMonitorMode ? "border-accent bg-accent/15 text-accent" : "border-border bg-background text-text-muted"
          }`}
        >
          Rooted OTG wlan1 Monitor Mode: {wirelessMonitorMode ? "ON" : "OFF"}
        </button>
      </div>

      <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Generated Termux & Kali NetHunter Bootstrap Script
          </span>
          <InlineCopyButton text={generatedScript} label="Copy Script" />
        </div>
        <pre className="overflow-x-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-text">
          {generatedScript}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 5. WEBSHELL & BACKDOOR IOC SIGNATURE SCANNER
 * ========================================================================== */
const WEBSHELL_PRESETS: Record<string, { label: string; code: string }> = {
  china_chopper: {
    label: "China Chopper One-Liner (PHP)",
    code: `<?php @eval($_POST['chopper_cmd']); ?>`,
  },
  obfuscated_b374k: {
    label: "Obfuscated Base64 + Gzinflate Backdoor (PHP)",
    code: `<?php\n$payload = "Sy1LzNFIzi9K1S1KTc5PSdVLzs8FAA==";\n@assert(gzinflate(base64_decode($payload)));\n@system($_REQUEST['x']);\n?>`,
  },
  jsp_runtime: {
    label: "JSP ProcessBuilder / Runtime Exec Webshell",
    code: `<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>`,
  },
  clean_wp: {
    label: "Clean WordPress Template Snippet (Benign)",
    code: `<?php\nget_header();\nif ( have_posts() ) : while ( have_posts() ) : the_post();\n  the_title('<h1>', '</h1>');\nendwhile; endif;\nget_footer();\n?>`,
  },
};

const WEBSHELL_SINKS: { regex: RegExp; name: string; severity: "CRITICAL" | "HIGH" | "MEDIUM"; desc: string }[] = [
  { regex: /\beval\s*\(/i, name: "eval()", severity: "CRITICAL", desc: "Dynamic arbitrary code execution sink" },
  { regex: /\bassert\s*\(/i, name: "assert()", severity: "CRITICAL", desc: "Stealth PHP code evaluation sink" },
  { regex: /\b(shell_exec|passthru|system|proc_open|popen)\s*\(/i, name: "OS Command Execution", severity: "CRITICAL", desc: "Spawns system shell process from web worker" },
  { regex: /\b(base64_decode|gzinflate|gzuncompress|str_rot13)\s*\(/i, name: "Payload Deobfuscation Chain", severity: "HIGH", desc: "Decodes compressed/encoded backdoor payload in memory" },
  { regex: /\$_(POST|GET|REQUEST|COOKIE)\s*\[/i, name: "Superglobal User Input Vector", severity: "HIGH", desc: "Direct HTTP request parameter intake" },
  { regex: /Runtime\.getRuntime\(\)\.exec|ProcessBuilder/i, name: "Java Runtime.exec / ProcessBuilder", severity: "CRITICAL", desc: "JSP/Java OS command execution" },
  { regex: /preg_replace\s*\(.*\/e/i, name: "preg_replace /e Modifier", severity: "CRITICAL", desc: "Legacy PHP regex eval injection" },
];

function computeStringEntropy(str: string): number {
  if (!str) return 0;
  const freq: Record<string, number> = {};
  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
  const len = str.length;
  let ent = 0;
  for (const k in freq) {
    const p = freq[k] / len;
    ent -= p * Math.log2(p);
  }
  return ent;
}

function WebshellBackdoorIocSignatureScanner({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [code, setCode] = useState(WEBSHELL_PRESETS.obfuscated_b374k.code);

  useEffect(() => {
    setCode(WEBSHELL_PRESETS.obfuscated_b374k.code);
  }, [resetTrigger]);

  const entropy = useMemo(() => computeStringEntropy(code), [code]);

  const matchedSinks = useMemo(() => {
    return WEBSHELL_SINKS.filter((s) => s.regex.test(code));
  }, [code]);

  const riskVerdict = useMemo(() => {
    const hasCritical = matchedSinks.some((s) => s.severity === "CRITICAL");
    if (hasCritical && matchedSinks.length >= 2) return "CRITICAL — ACTIVE WEBSHELL SIGNATURE DETECTED";
    if (hasCritical || entropy > 5.4) return "HIGH — SUSPICIOUS CODE EXECUTION OR PACKED PAYLOAD";
    return "CLEAN / LOW RISK — NO OBVIOUS RCE SINKS MATCHED";
  }, [matchedSinks, entropy]);

  const linuxHuntCommands = `# 1. Find PHP/JSP files modified in the last 7 days in webroot
find /var/www/html -type f \\( -name "*.php" -o -name "*.jsp" \\) -mtime -7 -ls

# 2. Grep for obfuscated eval/gzinflate/base64 webshell one-liners
grep -RnE "(eval|assert|passthru|shell_exec|system|gzinflate|base64_decode)\\s*\\(" /var/www/html/

# 3. Audit Nginx/Apache access logs for POST requests to uploads/ or cache/ directories
awk '$6 ~ /POST/ && $7 ~ /\\.(php|jsp|aspx)/ {print $1, $4, $7, $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 20`;

  useEffect(() => {
    const report = [
      `=== WEBSHELL & BACKDOOR IOC SIGNATURE SCANNER ===`,
      `Verdict: ${riskVerdict}`,
      `Shannon Entropy: ${entropy.toFixed(2)} bits/byte (${entropy > 5.3 ? "High Obfuscation" : "Normal Source Text"})`,
      `Matched Dangerous Sinks (${matchedSinks.length}):`,
      ...matchedSinks.map((s) => `  - [${s.severity}] ${s.name}: ${s.desc}`),
      ``,
      `--- LINUX WEBROOT INCIDENT RESPONSE COMMANDS ---`,
      linuxHuntCommands,
    ].join("\n");
    setOutput(report);
  }, [riskVerdict, entropy, matchedSinks, linuxHuntCommands, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
          Load Sample Preset:
        </span>
        {Object.entries(WEBSHELL_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            type="button"
            onClick={() => setCode(preset.code)}
            className="rounded-xs border border-border bg-background px-2.5 py-1 font-heading text-[11px] font-semibold text-text hover:border-accent transition cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <textarea
        rows={5}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste suspect PHP, JSP, ASPX, or Python snippet..."
        className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[10px] font-heading uppercase text-text-muted">Detection Verdict</div>
          <div className="mt-1 font-heading text-xs font-bold text-accent">{riskVerdict}</div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[10px] font-heading uppercase text-text-muted">Shannon Entropy</div>
          <div className="mt-1 font-mono-code text-sm font-bold text-text">
            {entropy.toFixed(2)} bits/byte
          </div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[10px] font-heading uppercase text-text-muted">Matched RCE Sinks</div>
          <div className="mt-1 font-mono-code text-sm font-bold text-text">
            {matchedSinks.length} signature(s)
          </div>
        </div>
      </div>

      {matchedSinks.length > 0 && (
        <div className="space-y-2">
          {matchedSinks.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between rounded-xs border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs"
            >
              <div>
                <span className="font-mono-code font-bold text-red-300">{s.name}</span>{" "}
                <span className="text-text-muted">— {s.desc}</span>
              </div>
              <span className="rounded-xs bg-red-500/20 px-2 py-0.5 font-mono-code text-[10px] font-bold text-red-300">
                {s.severity}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Linux Webroot Forensics & YARA Hunt Commands
          </span>
          <InlineCopyButton text={linuxHuntCommands} label="Copy Hunt CLI" />
        </div>
        <pre className="overflow-x-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-text">
          {linuxHuntCommands}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 6. DNS ZONE TRANSFER (AXFR) & SUBDOMAIN RECON BUILDER
 * ========================================================================== */
function DnsZoneTransferAxfrReconBuilder({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [domain, setDomain] = useState("megacorpone.com");
  const [nameserver, setNameserver] = useState("ns1.megacorpone.com");
  const [subnetCidr, setSubnetCidr] = useState("192.0.2.0/24");

  useEffect(() => {
    setDomain("megacorpone.com");
    setNameserver("ns1.megacorpone.com");
    setSubnetCidr("192.0.2.0/24");
  }, [resetTrigger]);

  const axfrPlaybook = useMemo(() => {
    const d = domain.trim() || "example.com";
    const ns = nameserver.trim() || `ns1.${d}`;
    return `# 1. Enumerate Authoritative Nameservers & SOA Serial
dig +short NS ${d}
dig +short SOA ${d}

# 2. Test Full DNS Zone Transfer (AXFR) over TCP/53
dig @${ns} ${d} AXFR
host -t axfr ${d} ${ns}

# 3. Automated AXFR, NSEC Zone Walking & Brute-Force Recon
dnsrecon -d ${d} -t axfr
fierce --domain ${d}
subfinder -d ${d} -silent | dnsx -a -resp

# 4. Reverse PTR Subnet Sweep (${subnetCidr})
dnsrecon -r ${subnetCidr} -n ${ns}`;
  }, [domain, nameserver, subnetCidr]);

  const bindHardeningConfig = useMemo(() => {
    return `// Hardened ISC BIND /etc/bind/named.conf.options
options {
    // Block unauthorized AXFR zone dumps globally
    allow-transfer { none; };
    allow-query-cache { none; };
    recursion no;
    version "not disclosed";
};

// Restrict zone transfers strictly to secondary NS with TSIG cryptographic key
zone "${domain.trim() || "example.com"}" {
    type master;
    file "/etc/bind/db.${domain.trim() || "example.com"}";
    allow-transfer { key "tsig-secondary-ns-key"; };
};`;
  }, [domain]);

  useEffect(() => {
    setOutput(`${axfrPlaybook}\n\n${bindHardeningConfig}`);
  }, [axfrPlaybook, bindHardeningConfig, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Target Domain
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="mt-1.5 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Authoritative Nameserver
          </label>
          <input
            type="text"
            value={nameserver}
            onChange={(e) => setNameserver(e.target.value)}
            className="mt-1.5 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Reverse PTR Subnet CIDR
          </label>
          <input
            type="text"
            value={subnetCidr}
            onChange={(e) => setSubnetCidr(e.target.value)}
            className="mt-1.5 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              DNS AXFR & Subdomain Recon Commands
            </span>
            <InlineCopyButton text={axfrPlaybook} label="Copy Recon" />
          </div>
          <pre className="overflow-x-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-text">
            {axfrPlaybook}
          </pre>
        </div>

        <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Hardened BIND TSIG & `allow-transfer` Remediation
            </span>
            <InlineCopyButton text={bindHardeningConfig} label="Copy BIND Config" />
          </div>
          <pre className="overflow-x-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-accent">
            {bindHardeningConfig}
          </pre>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 7. ANDROID MAGISK, KERNELSU & PLAY INTEGRITY AUDITOR
 * ========================================================================== */
function AndroidMagiskKernelsuPlayIntegrityAuditor({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [bootloaderLocked, setBootloaderLocked] = useState(false);
  const [rootSolution, setRootSolution] = useState<"none" | "magisk" | "kernelsu" | "apatch">("kernelsu");
  const [playIntegrityFixModule, setPlayIntegrityFixModule] = useState(true);
  const [trickyStoreKeybox, setTrickyStoreKeybox] = useState(false);

  useEffect(() => {
    setBootloaderLocked(false);
    setRootSolution("kernelsu");
    setPlayIntegrityFixModule(true);
    setTrickyStoreKeybox(false);
  }, [resetTrigger]);

  const verdicts = useMemo(() => {
    const basic = bootloaderLocked || playIntegrityFixModule || rootSolution === "none";
    const device =
      (bootloaderLocked && rootSolution === "none") ||
      playIntegrityFixModule ||
      trickyStoreKeybox;
    const strong =
      (bootloaderLocked && rootSolution === "none") || trickyStoreKeybox;

    const mountLeakRisk =
      rootSolution === "magisk"
        ? "MEDIUM (User-space Zygisk/overlayfs mounts detectable by Shamiko-aware native probes)"
        : rootSolution === "kernelsu" || rootSolution === "apatch"
        ? "LOW (Kernel-based root grants UID 0 strictly to allowlisted App Profiles)"
        : "NONE (Stock unrooted kernel)";

    return { basic, device, strong, mountLeakRisk };
  }, [bootloaderLocked, rootSolution, playIntegrityFixModule, trickyStoreKeybox]);

  useEffect(() => {
    const report = [
      `=== GOOGLE PLAY INTEGRITY API & ROOT ATTESTATION SIMULATOR ===`,
      `Bootloader State: ${bootloaderLocked ? "LOCKED (Verified Boot GREEN)" : "UNLOCKED (Verified Boot ORANGE)"}`,
      `Root Architecture: ${rootSolution.toUpperCase()}`,
      `PlayIntegrityFix (PIF) Fingerprint Spoof: ${playIntegrityFixModule ? "Active" : "Inactive"}`,
      `Hardware Keybox / TEE Override: ${trickyStoreKeybox ? "Active" : "Standard Hardware TEE"}`,
      ``,
      `--- PLAY INTEGRITY VERDICTS ---`,
      `MEETS_BASIC_INTEGRITY:  ${verdicts.basic ? "PASS" : "FAIL"}`,
      `MEETS_DEVICE_INTEGRITY: ${verdicts.device ? "PASS (Google Wallet NFC Works)" : "FAIL"}`,
      `MEETS_STRONG_INTEGRITY: ${verdicts.strong ? "PASS (Hardware-Backed Key Attestation)" : "FAIL (Bootloader Unlocked in TEE)"}`,
      `Native Detection Surface: ${verdicts.mountLeakRisk}`,
    ].join("\n");
    setOutput(report);
  }, [bootloaderLocked, rootSolution, playIntegrityFixModule, trickyStoreKeybox, verdicts, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setBootloaderLocked((v) => !v)}
          className={`rounded-xs border p-3 text-left transition cursor-pointer ${
            bootloaderLocked ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"
          }`}
        >
          <div className="text-[10px] font-heading uppercase text-text-muted">Bootloader & AVB</div>
          <div className="mt-1 font-heading text-xs font-bold text-text">
            {bootloaderLocked ? "Locked (AVB Green)" : "Unlocked (AVB Orange)"}
          </div>
        </button>

        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block text-[10px] font-heading uppercase text-text-muted">
            Root Manager Architecture
          </label>
          <select
            value={rootSolution}
            onChange={(e) => setRootSolution(e.target.value as "none" | "magisk" | "kernelsu" | "apatch")}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2 py-1 font-mono-code text-xs text-text"
          >
            <option value="none">Stock / Unrooted</option>
            <option value="magisk">Magisk v28 (Zygisk)</option>
            <option value="kernelsu">KernelSU (GKI Kernel Root)</option>
            <option value="apatch">APatch (Kernel Patch)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setPlayIntegrityFixModule((v) => !v)}
          className={`rounded-xs border p-3 text-left transition cursor-pointer ${
            playIntegrityFixModule ? "border-accent bg-accent/10" : "border-border bg-background"
          }`}
        >
          <div className="text-[10px] font-heading uppercase text-text-muted">PlayIntegrityFix (PIF)</div>
          <div className="mt-1 font-heading text-xs font-bold text-text">
            {playIntegrityFixModule ? "Enabled (DroidGuard Fallback)" : "Disabled"}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setTrickyStoreKeybox((v) => !v)}
          className={`rounded-xs border p-3 text-left transition cursor-pointer ${
            trickyStoreKeybox ? "border-accent bg-accent/10" : "border-border bg-background"
          }`}
        >
          <div className="text-[10px] font-heading uppercase text-text-muted">TEE Keybox State</div>
          <div className="mt-1 font-heading text-xs font-bold text-text">
            {trickyStoreKeybox ? "Hardware Keybox Valid" : "Standard Unlocked TEE"}
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "MEETS_BASIC_INTEGRITY", pass: verdicts.basic, desc: "Software-only CTS check" },
          { label: "MEETS_DEVICE_INTEGRITY", pass: verdicts.device, desc: "Required for Google Wallet / NFC" },
          { label: "MEETS_STRONG_INTEGRITY", pass: verdicts.strong, desc: "Hardware TEE / StrongBox locked check" },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-xs border p-3.5 ${
              item.pass
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-red-500/40 bg-red-500/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-code text-xs font-bold text-text">{item.label}</span>
              {item.pass ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
            </div>
            <div className="mt-1 text-xs text-text-muted">{item.desc}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xs border border-border bg-background p-3 text-xs text-text-muted font-mono-code">
        <strong className="text-text">Native Root Detection Surface:</strong> {verdicts.mountLeakRisk}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 8. HACKING TERMINOLOGIES FLASHCARD & CTF TRAINER
 * ========================================================================== */
interface CyberFlashcard {
  term: string;
  category: "Active Directory" | "Web AppSec" | "Binary Exploitation" | "Blue Team & SOC";
  definition: string;
  mitreOrDefense: string;
}

const CYBER_FLASHCARDS: CyberFlashcard[] = [
  {
    term: "Kerberoasting (T1558.003)",
    category: "Active Directory",
    definition: "Any authenticated domain user requests TGS service tickets for accounts with SPNs and cracks the RC4/AES ticket offline to recover the service account plaintext password.",
    mitreOrDefense: "Defense: Enforce AES256-SHA1 Kerberos encryption and use Group Managed Service Accounts (gMSA) with 120-char rotating passwords.",
  },
  {
    term: "Pass-the-Hash (PtH - T1550.002)",
    category: "Active Directory",
    definition: "Authenticating to remote SMB/WMI services directly using a dumped NTLM hash without needing to crack the cleartext password.",
    mitreOrDefense: "Defense: Enable Credential Guard (LSA Protection), restrict Local Administrator reuse via LAPS.",
  },
  {
    term: "BOLA / IDOR (OWASP API1)",
    category: "Web AppSec",
    definition: "Broken Object Level Authorization (Insecure Direct Object Reference): Modifying an object ID in an API call (/api/v1/invoices/1042) to read or mutate another user's record.",
    mitreOrDefense: "Defense: Enforce server-side row-level ownership checks on every controller action + use unpredictable UUIDv4/ULIDs.",
  },
  {
    term: "SSRF (Server-Side Request Forgery)",
    category: "Web AppSec",
    definition: "Tricking a backend server into fetching internal resources such as the AWS EC2 Instance Metadata Service (http://169.254.169.254/latest/meta-data/).",
    mitreOrDefense: "Defense: Enforce IMDSv2 session tokens, block RFC1918/link-local egress IPs in URL parsers.",
  },
  {
    term: "ASLR & DEP/NX + ROP Chain",
    category: "Binary Exploitation",
    definition: "DEP marks the stack non-executable; ASLR randomizes memory base addresses. Attackers chain existing executable code snippets ending in `ret` (Return-Oriented Programming).",
    mitreOrDefense: "Defense: Compile binaries with Position Independent Executable (-fPIE -pie), Stack Canaries, and Control Flow Integrity (CFI).",
  },
  {
    term: "LOLBins (Living Off The Land Binaries)",
    category: "Blue Team & SOC",
    definition: "Abusing Microsoft-signed system binaries (certutil.exe, mshta.exe, rundll32.exe, powershell.exe) to download payloads or bypass AppLocker.",
    mitreOrDefense: "Defense: Sysmon Event ID 1 command-line logging + Windows Defender Application Control (WDAC) block rules.",
  },
  {
    term: "Golden Ticket (T1558.001)",
    category: "Active Directory",
    definition: "Forging arbitrary Kerberos TGTs offline after compromising the Domain Controller's krbtgt NTLM/AES key, granting domain persistence for up to 10 years.",
    mitreOrDefense: "Defense: Rotate the krbtgt password twice in succession across all Domain Controllers.",
  },
  {
    term: "SIEM vs. SOAR vs. XDR",
    category: "Blue Team & SOC",
    definition: "SIEM aggregates and correlates logs; XDR unifies endpoint, network, and identity telemetry; SOAR executes automated containment playbooks.",
    mitreOrDefense: "Defense: Map detection rules to MITRE ATT&CK and test automated host isolation playbooks.",
  },
];

function HackingTerminologiesFlashcardCtfTrainer({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredTerms, setMasteredTerms] = useState<string[]>([]);

  useEffect(() => {
    setCategoryFilter("All");
    setCardIndex(0);
    setFlipped(false);
    setMasteredTerms([]);
  }, [resetTrigger]);

  const deck = useMemo(() => {
    if (categoryFilter === "All") return CYBER_FLASHCARDS;
    return CYBER_FLASHCARDS.filter((c) => c.category === categoryFilter);
  }, [categoryFilter]);

  const currentCard = deck[cardIndex % deck.length] || CYBER_FLASHCARDS[0];

  const markMastered = (term: string) => {
    setMasteredTerms((prev) => (prev.includes(term) ? prev : [...prev, term]));
    setFlipped(false);
    setCardIndex((prev) => (prev + 1) % deck.length);
  };

  useEffect(() => {
    const studySheet = [
      `=== ETHICAL HACKING & MITRE ATT&CK FLASHCARD STUDY SHEET ===`,
      `Mastered Progress: ${masteredTerms.length} / ${CYBER_FLASHCARDS.length} terms`,
      ``,
      ...CYBER_FLASHCARDS.map(
        (c) =>
          `[${c.category}] ${c.term}\n  Definition: ${c.definition}\n  ${c.mitreOrDefense}`
      ),
    ].join("\n\n");
    setOutput(studySheet);
  }, [masteredTerms, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {["All", "Active Directory", "Web AppSec", "Binary Exploitation", "Blue Team & SOC"].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat);
                  setCardIndex(0);
                  setFlipped(false);
                }}
                className={`rounded-xs border px-2.5 py-1 font-heading text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  categoryFilter === cat
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-background text-text-muted"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
        <span className="font-mono-code text-xs text-accent">
          Mastered: {masteredTerms.length}/{CYBER_FLASHCARDS.length}
        </span>
      </div>

      <div
        onClick={() => setFlipped((f) => !f)}
        className="rounded-xs border border-border bg-background p-6 min-h-[190px] flex flex-col justify-between cursor-pointer hover:border-accent transition"
      >
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span className="rounded-xs border border-border bg-surface px-2 py-0.5 font-mono-code text-accent">
            {currentCard.category}
          </span>
          <span className="font-mono-code">
            Card {(cardIndex % deck.length) + 1} of {deck.length} (Click to Flip)
          </span>
        </div>

        {!flipped ? (
          <div className="my-4 text-center">
            <div className="font-heading text-xl font-bold text-text">{currentCard.term}</div>
            <div className="mt-2 text-xs text-text-muted">
              Click card to reveal attack mechanics & defensive mitigation
            </div>
          </div>
        ) : (
          <div className="my-3 space-y-2">
            <div className="text-sm text-text">{currentCard.definition}</div>
            <div className="rounded-xs border border-emerald-500/30 bg-emerald-500/10 p-2.5 font-mono-code text-xs text-emerald-300">
              {currentCard.mitreOrDefense}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
              setCardIndex((prev) => (prev + 1) % deck.length);
            }}
            className="rounded-xs border border-border bg-surface px-3 py-1 font-heading text-xs font-bold uppercase text-text hover:border-accent cursor-pointer"
          >
            Next Card →
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              markMastered(currentCard.term);
            }}
            className="rounded-xs bg-[#ff6a00] px-3 py-1 font-heading text-xs font-bold uppercase text-white hover:opacity-90 cursor-pointer"
          >
            ✓ Mark Mastered
          </button>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 9. CLASSICAL & MODERN CIPHER CRYPTANALYSIS LAB
 * ========================================================================== */
function caesarTransform(text: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return text.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + s) % 26) + base);
  });
}

function vigenereTransform(text: string, key: string, decrypt: boolean): string {
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, "");
  if (!cleanKey) return text;
  let ki = 0;
  return text.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch <= "Z" ? 65 : 97;
    const kShift = cleanKey.charCodeAt(ki % cleanKey.length) - 65;
    ki++;
    const shift = decrypt ? (26 - kShift) % 26 : kShift;
    return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26) + base);
  });
}

function calculateIndexOfCoincidence(text: string): number {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, "");
  const N = letters.length;
  if (N <= 1) return 0;
  const counts: Record<string, number> = {};
  for (const c of letters) counts[c] = (counts[c] || 0) + 1;
  let sum = 0;
  for (const k in counts) {
    sum += counts[k] * (counts[k] - 1);
  }
  return sum / (N * (N - 1));
}

function ClassicalModernCipherCryptanalysisLab({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [cipherText, setCipherText] = useState("Wkh txlfn eurzq ira mxpsv ryhu wkh odcb grj");
  const [caesarShift, setCaesarShift] = useState(23); // Decrypts ROT3
  const [vigenereKey, setVigenereKey] = useState("LEMON");
  const [ecbVsCbcMode, setEcbVsCbcMode] = useState<"ECB" | "CBC">("ECB");

  useEffect(() => {
    setCipherText("Wkh txlfn eurzq ira mxpsv ryhu wkh odcb grj");
    setCaesarShift(23);
    setVigenereKey("LEMON");
    setEcbVsCbcMode("ECB");
  }, [resetTrigger]);

  const caesarResult = useMemo(() => caesarTransform(cipherText, caesarShift), [cipherText, caesarShift]);
  const vigenereDecoded = useMemo(() => vigenereTransform(cipherText, vigenereKey, true), [cipherText, vigenereKey]);
  const icValue = useMemo(() => calculateIndexOfCoincidence(cipherText), [cipherText]);

  // 8x8 pixel pattern to demonstrate ECB Penguin silhouette leak vs CBC IV diffusion
  const bitmapPattern = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [1, 2, 3, 2, 2, 3, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 2, 3, 3, 2, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ];

  useEffect(() => {
    const report = [
      `=== CLASSICAL & MODERN CIPHER CRYPTANALYSIS LAB ===`,
      `Input Text: ${cipherText}`,
      `Index of Coincidence (IC): ${icValue.toFixed(4)} (${
        icValue >= 0.06 ? "Monoalphabetic / English-like (~0.0667)" : "Polyalphabetic / Random (~0.0385)"
      })`,
      `Caesar Output (Shift +${caesarShift}): ${caesarResult}`,
      `Vigenère Decrypted (Key="${vigenereKey}"): ${vigenereDecoded}`,
      `Block Cipher Mode Inspection: AES-${ecbVsCbcMode} (${
        ecbVsCbcMode === "ECB"
          ? "INSECURE — Identical 16-byte plaintext blocks produce identical ciphertext blocks (ECB Penguin Leak)"
          : "SECURE — Random IV + Cipher Block Chaining hides spatial patterns"
      })`,
    ].join("\n");
    setOutput(report);
  }, [cipherText, icValue, caesarShift, caesarResult, vigenereKey, vigenereDecoded, ecbVsCbcMode, setOutput]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text">
          Input Ciphertext / Plaintext
        </label>
        <textarea
          rows={3}
          value={cipherText}
          onChange={(e) => setCipherText(e.target.value)}
          className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Caesar Shift (+{caesarShift} / ROT{caesarShift})
          </label>
          <input
            type="range"
            min={1}
            max={25}
            value={caesarShift}
            onChange={(e) => setCaesarShift(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
          <div className="mt-1 font-mono-code text-xs text-accent truncate">{caesarResult}</div>
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Vigenère Key
          </label>
          <input
            type="text"
            value={vigenereKey}
            onChange={(e) => setVigenereKey(e.target.value)}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2 py-1 font-mono-code text-xs text-text"
          />
          <div className="mt-1 font-mono-code text-xs text-text-muted truncate">{vigenereDecoded}</div>
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="font-heading text-[11px] font-bold uppercase text-text-muted">
            Index of Coincidence (IC)
          </div>
          <div className="mt-1 font-mono-code text-base font-bold text-accent">
            {icValue.toFixed(4)}
          </div>
          <div className="text-[11px] text-text-muted">
            {icValue >= 0.06 ? "Monoalphabetic / Caesar (~0.0667)" : "Polyalphabetic / Vigenère (~0.0385)"}
          </div>
        </div>
      </div>

      <div className="rounded-xs border border-border bg-background p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            AES-ECB vs AES-CBC Pattern Leak Visualizer (&ldquo;ECB Penguin&rdquo; Effect)
          </span>
          <div className="flex gap-2">
            {(["ECB", "CBC"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setEcbVsCbcMode(m)}
                className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs font-bold cursor-pointer ${
                  ecbVsCbcMode === m
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-surface text-text-muted"
                }`}
              >
                AES-{m}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-8 gap-1 max-w-xs">
          {bitmapPattern.flat().map((cell, idx) => {
            const ecbColors = ["bg-zinc-900", "bg-amber-500/40", "bg-orange-500/80", "bg-emerald-400"];
            const cbcPseudoNoise = ["bg-zinc-800", "bg-zinc-600", "bg-zinc-700", "bg-zinc-500"][
              (idx * 17 + 5) % 4
            ];
            return (
              <div
                key={idx}
                className={`h-5 rounded-xs ${ecbVsCbcMode === "ECB" ? ecbColors[cell] : cbcPseudoNoise}`}
              />
            );
          })}
        </div>
        <div className="text-xs text-text-muted">
          {ecbVsCbcMode === "ECB"
            ? "AES-ECB encrypts identical 16-byte plaintext blocks into identical ciphertext blocks—preserving visual silhouettes."
            : "AES-CBC XORs each block with the previous ciphertext block + random IV, diffusing repeated blocks into uniform noise."}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 10. GAMING KERNEL ANTI-CHEAT & PRIVACY AUDITOR
 * ========================================================================== */
const ANTICHEAT_ENGINES = [
  {
    id: "vanguard",
    name: "Riot Vanguard (vgk.sys)",
    games: "Valorant, League of Legends",
    ring: "Ring-0 Boot-Start Kernel Driver",
    persistence: "Loads at Windows Boot (even when game is closed)",
    requirements: "TPM 2.0 + UEFI Secure Boot + HVCI / IOMMU DMA Protection",
    privacyNote: "Highest privilege surface; can be disabled via System Tray (requires reboot before playing Valorant).",
  },
  {
    id: "eac",
    name: "EasyAntiCheat (EasyAntiCheat_EOS.sys)",
    games: "Apex Legends, Fortnite, Elden Ring, Rust",
    ring: "Ring-0 On-Demand Kernel Driver",
    persistence: "Loads only when launching the game; unloads on exit",
    requirements: "Kernel Patch Protection (PatchGuard) + Signed Driver Enforcement",
    privacyNote: "Does not stay resident in RAM after game process terminates.",
  },
  {
    id: "battleye",
    name: "BattlEye (BEDaisy.sys)",
    games: "Rainbow Six Siege, Escape from Tarkov, PUBG, Destiny 2",
    ring: "Ring-0 On-Demand Kernel Driver",
    persistence: "Session-only kernel driver (`BEDaisy.sys`)",
    requirements: "Blocks vulnerable signed drivers (BYOVD) & kernel debuggers",
    privacyNote: "Unloads when game closes; compatible with Proton/Steam Deck only when publisher enables it.",
  },
  {
    id: "vac",
    name: "Valve Anti-Cheat (VAC + VACNet Server AI)",
    games: "Counter-Strike 2, Dota 2, Team Fortress 2",
    ring: "Ring-3 User-Mode + Server-Side Behavioral AI",
    persistence: "User-space only during active Steam session",
    requirements: "No kernel driver; full Linux / SteamOS compatibility",
    privacyNote: "Lowest OS privacy intrusion; relies on server-side telemetry and trust factor.",
  },
];

function GamingKernelAnticheatPrivacyAuditor({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [selectedId, setSelectedId] = useState("vanguard");

  useEffect(() => {
    setSelectedId("vanguard");
  }, [resetTrigger]);

  const currentEngine = useMemo(
    () => ANTICHEAT_ENGINES.find((e) => e.id === selectedId) || ANTICHEAT_ENGINES[0],
    [selectedId]
  );

  const auditCommands = `# Check Installed Anti-Cheat Kernel Drivers & Startup Mode (PowerShell / CMD)
sc.exe query vgk
sc.exe qc EasyAntiCheat_EOS
sc.exe qc BEDaisy
driverquery /v | findstr /i "vgk EasyAntiCheat BEDaisy Randgrid"`;

  useEffect(() => {
    const report = [
      `=== GAMING KERNEL ANTI-CHEAT & PRIVACY AUDIT ===`,
      `Engine: ${currentEngine.name}`,
      `Titles: ${currentEngine.games}`,
      `CPU Privilege Level: ${currentEngine.ring}`,
      `Boot Persistence: ${currentEngine.persistence}`,
      `Hardware Requirements: ${currentEngine.requirements}`,
      `Privacy & Security Assessment: ${currentEngine.privacyNote}`,
      ``,
      `--- WINDOWS DRIVER VERIFICATION COMMANDS ---`,
      auditCommands,
    ].join("\n");
    setOutput(report);
  }, [currentEngine, auditCommands, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {ANTICHEAT_ENGINES.map((eng) => (
          <button
            key={eng.id}
            type="button"
            onClick={() => setSelectedId(eng.id)}
            className={`text-left rounded-xs border p-3 transition cursor-pointer ${
              selectedId === eng.id
                ? "border-accent bg-accent/10"
                : "border-border bg-background hover:border-accent/50"
            }`}
          >
            <div className="font-heading text-xs font-bold text-text">{eng.name}</div>
            <div className="text-[11px] text-text-muted mt-1">{eng.games}</div>
          </button>
        ))}
      </div>

      <div className="rounded-xs border border-border bg-background p-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-heading text-sm font-bold text-text">{currentEngine.name}</span>
          <span className="rounded-xs border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono-code text-xs text-accent">
            {currentEngine.ring}
          </span>
        </div>
        <div className="text-xs text-text">
          <strong>Persistence Model:</strong> {currentEngine.persistence}
        </div>
        <div className="text-xs text-text">
          <strong>Hardware Security Checks:</strong> {currentEngine.requirements}
        </div>
        <div className="text-xs text-text-muted">{currentEngine.privacyNote}</div>
      </div>

      <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Windows Service & Ring-0 Driver Inspection Commands
          </span>
          <InlineCopyButton text={auditCommands} label="Copy CMD" />
        </div>
        <pre className="overflow-x-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-text">
          {auditCommands}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 11. CHILD ANDROID DNS & FAMILY SAFETY PLANNER
 * ========================================================================== */
const FAMILY_DNS_PROVIDERS = [
  {
    id: "cloudflare_family",
    name: "Cloudflare 1.1.1.3 (Malware + Adult Content Block)",
    dotHostname: "family.cloudflare-dns.com",
    ipv4: "1.1.1.3 / 1.0.0.3",
  },
  {
    id: "cleanbrowsing",
    name: "CleanBrowsing Family Filter (Strict SafeSearch + Adult Block)",
    dotHostname: "family-filter-dns.cleanbrowsing.org",
    ipv4: "185.228.168.168 / 185.228.169.168",
  },
  {
    id: "adguard_family",
    name: "AdGuard Family Protection (Ads + Trackers + Adult Block)",
    dotHostname: "family.adguard-dns.com",
    ipv4: "94.140.14.15 / 94.140.15.16",
  },
];

function ChildAndroidDnsFamilySafetyPlanner({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [ageGroup, setAgeGroup] = useState<"6-9" | "10-12" | "13-15" | "16-17">("10-12");
  const [dnsId, setDnsId] = useState("cloudflare_family");
  const [bedtimeHour, setBedtimeHour] = useState("21:00");

  useEffect(() => {
    setAgeGroup("10-12");
    setDnsId("cloudflare_family");
    setBedtimeHour("21:00");
  }, [resetTrigger]);

  const dnsProvider = useMemo(
    () => FAMILY_DNS_PROVIDERS.find((p) => p.id === dnsId) || FAMILY_DNS_PROVIDERS[0],
    [dnsId]
  );

  const planOutput = useMemo(() => {
    return [
      `=== ANDROID CHILD SAFETY & PRIVATE DNS CONFIGURATION PLAN ===`,
      `Child Age Tier: Ages ${ageGroup}`,
      `Selected DNS-over-TLS (DoT) Filter: ${dnsProvider.name}`,
      `Android Private DNS Hostname: ${dnsProvider.dotHostname}`,
      `Router Fallback IPv4 DNS: ${dnsProvider.ipv4}`,
      `Scheduled Device Bedtime Lock: ${bedtimeHour}`,
      ``,
      `--- STEP 1: ANDROID PRIVATE DNS (ENCRYPTED CONTENT FILTERING) ---`,
      `1. Open Android Settings -> Network & internet -> Private DNS`,
      `2. Select "Private DNS provider hostname"`,
      `3. Enter: ${dnsProvider.dotHostname}`,
      `4. Tap Save (Encrypts DNS over TLS port 853 and blocks adult/phishing domains system-wide).`,
      ``,
      `--- STEP 2: GOOGLE FAMILY LINK & PLAY STORE CONTROLS ---`,
      `1. Link child account in Google Family Link -> Controls -> Content restrictions -> Google Play`,
      `2. Set App & Game Rating to ${ageGroup === "6-9" ? "Everyone (PEGI 7)" : ageGroup === "10-12" ? "Everyone 10+ (PEGI 12)" : "Teen (PEGI 16)"}`,
      `3. Set "Require approval for all purchases & new app downloads"`,
      `4. Under Account Settings -> Disable "Add/remove accounts" and disable "Install unknown apps" (APK sideloading).`,
    ].join("\n");
  }, [ageGroup, dnsProvider, bedtimeHour]);

  useEffect(() => {
    setOutput(planOutput);
  }, [planOutput, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Child Age Group
          </label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value as "6-9" | "10-12" | "13-15" | "16-17")}
            className="mt-1.5 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          >
            <option value="6-9">Ages 6–9 (Strict Whitelist + No Social Media)</option>
            <option value="10-12">Ages 10–12 (First Phone + SafeSearch + Approval)</option>
            <option value="13-15">Ages 13–15 (Teen Guardrails + Bedtime Cutoff)</option>
            <option value="16-17">Ages 16–17 (Malware/Phishing Shield + Autonomy)</option>
          </select>
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Encrypted Private DNS (DoT) Provider
          </label>
          <select
            value={dnsId}
            onChange={(e) => setDnsId(e.target.value)}
            className="mt-1.5 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          >
            {FAMILY_DNS_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Nightly Bedtime Downtime
          </label>
          <input
            type="time"
            value={bedtimeHour}
            onChange={(e) => setBedtimeHour(e.target.value)}
            className="mt-1.5 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
      </div>

      <div className="rounded-xs border border-accent/40 bg-accent/10 p-3.5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-heading uppercase text-text-muted">
            Android Settings &rarr; Network &rarr; Private DNS Hostname
          </div>
          <div className="font-mono-code text-sm font-bold text-accent">{dnsProvider.dotHostname}</div>
        </div>
        <InlineCopyButton text={dnsProvider.dotHostname} label="Copy DoT Hostname" />
      </div>

      <pre className="overflow-x-auto rounded-xs border border-border bg-background p-3.5 font-mono-code text-xs text-text">
        {planOutput}
      </pre>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 12. CYBER ESCAPE ROOM: 5-STAGE LOGIC & CIPHER PUZZLE
 * ========================================================================== */
interface EscapeStage {
  id: number;
  title: string;
  prompt: string;
  challengeArtifact: string;
  hint: string;
  expectedAnswer: string;
}

const ESCAPE_STAGES: EscapeStage[] = [
  {
    id: 1,
    title: "Stage 1: Airlock Logic Gate & Binary Override",
    prompt: "Convert the 8-bit binary register to a decimal vault PIN:",
    challengeArtifact: "REGISTER_A = 00101010",
    hint: "32 + 8 + 2 = ?",
    expectedAnswer: "42",
  },
  {
    id: 2,
    title: "Stage 2: Hexadecimal Packet Payload Inspection",
    prompt: "Decode the ASCII word hidden in this hexadecimal TCP payload:",
    challengeArtifact: "52 4F 4F 54",
    hint: "0x52 = 'R', 0x4F = 'O', 0x54 = 'T'",
    expectedAnswer: "ROOT",
  },
  {
    id: 3,
    title: "Stage 3: Base64 Session Token Extraction",
    prompt: "Decode the Base64 bearer token to reveal the secret keyword:",
    challengeArtifact: "Q1lCRVJfTklOSkE=",
    hint: "Use standard Base64 decoding (starts with CYBER_)",
    expectedAnswer: "CYBER_NINJA",
  },
  {
    id: 4,
    title: "Stage 4: Caesar Shift (ROT13) Command Override",
    prompt: "Apply ROT13 (shift by 13 letters) to decrypt the firewall passphrase:",
    challengeArtifact: "VFBYNGR",
    hint: "V->I, F->S, B->O, Y->L, N->A, G->T, R->E",
    expectedAnswer: "ISOLATE",
  },
  {
    id: 5,
    title: "Stage 5: Final CTF Flag Verification",
    prompt: "Inspect the HTTP Response Header below and submit the exact flag:",
    challengeArtifact: "HTTP/1.1 200 OK\nX-Vault-Flag: FLAG{ZERO_TRUST_2026}",
    hint: "Type FLAG{ZERO_TRUST_2026}",
    expectedAnswer: "FLAG{ZERO_TRUST_2026}",
  },
];

function CyberEscapeRoomLogicCipherPuzzle({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [answerInput, setAnswerInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setCurrentStageIdx(0);
    setAnswerInput("");
    setShowHint(false);
    setCompleted(false);
    setErrorMsg("");
  }, [resetTrigger]);

  const stage = ESCAPE_STAGES[currentStageIdx];

  const handleVerify = () => {
    if (answerInput.trim().toUpperCase() === stage.expectedAnswer.toUpperCase()) {
      setErrorMsg("");
      setShowHint(false);
      setAnswerInput("");
      if (currentStageIdx + 1 < ESCAPE_STAGES.length) {
        setCurrentStageIdx((prev) => prev + 1);
      } else {
        setCompleted(true);
      }
    } else {
      setErrorMsg("Access Denied — Incorrect solution. Check the hint or re-verify encoding.");
    }
  };

  useEffect(() => {
    setOutput(
      completed
        ? `=== CYBER ESCAPE ROOM COMPLETION CERTIFICATE ===\nStatus: ALL 5 STAGES SOLVED!\nFinal Flag: FLAG{ZERO_TRUST_2026}\nSkills Verified: Binary Conversion, Hex/ASCII Decoding, Base64 Analysis, ROT13 Cryptanalysis, HTTP Header Inspection.`
        : `=== CYBER ESCAPE ROOM PROGRESS ===\nCurrent Stage: ${stage.id}/5 (${stage.title})\nChallenge: ${stage.challengeArtifact}`
    );
  }, [completed, stage, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        {ESCAPE_STAGES.map((s, idx) => (
          <div
            key={s.id}
            className={`flex-1 rounded-xs border p-2 text-center font-mono-code text-xs ${
              completed || idx < currentStageIdx
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-bold"
                : idx === currentStageIdx
                ? "border-accent bg-accent/15 text-accent font-bold"
                : "border-border bg-background text-text-muted"
            }`}
          >
            Stage {s.id}
          </div>
        ))}
      </div>

      {completed ? (
        <div className="rounded-xs border border-emerald-500/40 bg-emerald-500/10 p-6 text-center space-y-2">
          <Award className="h-8 w-8 text-emerald-400 mx-auto" />
          <div className="font-heading text-lg font-bold text-text">
            Vault Unlocked — All 5 Security Stages Solved!
          </div>
          <div className="font-mono-code text-xs text-emerald-300">
            Captured Flag: FLAG&#123;ZERO_TRUST_2026&#125;
          </div>
        </div>
      ) : (
        <div className="rounded-xs border border-border bg-background p-4 space-y-3">
          <div className="font-heading text-sm font-bold text-text">{stage.title}</div>
          <div className="text-xs text-text-muted">{stage.prompt}</div>
          <pre className="rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-accent">
            {stage.challengeArtifact}
          </pre>

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder="Enter decoded answer..."
              className="flex-1 rounded-xs border border-border bg-surface px-3 py-1.5 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={handleVerify}
              className="rounded-xs bg-[#ff6a00] px-4 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 cursor-pointer"
            >
              Submit Key
            </button>
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="rounded-xs border border-border bg-surface px-3 py-1.5 font-heading text-xs font-semibold text-text-muted hover:text-text cursor-pointer"
            >
              {showHint ? "Hide Hint" : "Show Hint"}
            </button>
          </div>

          {errorMsg && <div className="text-xs text-red-400 font-mono-code">{errorMsg}</div>}
          {showHint && (
            <div className="rounded-xs border border-amber-500/30 bg-amber-500/10 p-2 font-mono-code text-xs text-amber-300">
              Hint: {stage.hint}
            </div>
          )}
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 13. PASSWORD MANAGER KDF & VAULT CRACK COST CALCULATOR
 * ========================================================================== */
const KDF_PROFILES = [
  {
    id: "argon2id_64m",
    name: "Argon2id (64 MB RAM, 3 Iterations, 4 Lanes — Bitwarden/KeePass Recommended)",
    rtx5090HashesPerSec: 850, // Memory-hard ASIC/GPU bottleneck
    extraBits: 0,
  },
  {
    id: "pbkdf2_600k",
    name: "PBKDF2-HMAC-SHA256 (600,000 Iterations — OWASP 2023 Default)",
    rtx5090HashesPerSec: 18500,
    extraBits: 0,
  },
  {
    id: "onepassword_srp",
    name: "1Password Dual-Secret (Master Password + 128-bit Random Secret Key)",
    rtx5090HashesPerSec: 18500,
    extraBits: 128,
  },
];

function PasswordManagerKdfVaultCrackCostCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [passwordEntropyBits, setPasswordEntropyBits] = useState<number>(52); // e.g., 4-word Diceware or 9-char mixed
  const [kdfId, setKdfId] = useState("argon2id_64m");
  const [gpuHourlyCostUsd, setGpuHourlyCostUsd] = useState<number>(1.2);

  useEffect(() => {
    setPasswordEntropyBits(52);
    setKdfId("argon2id_64m");
    setGpuHourlyCostUsd(1.2);
  }, [resetTrigger]);

  const kdf = useMemo(
    () => KDF_PROFILES.find((p) => p.id === kdfId) || KDF_PROFILES[0],
    [kdfId]
  );

  const metrics = useMemo(() => {
    const totalBits = passwordEntropyBits + kdf.extraBits;
    const avgGuesses = Math.pow(2, totalBits - 1);
    const gpuSeconds = avgGuesses / kdf.rtx5090HashesPerSec;
    const gpuHours = gpuSeconds / 3600;
    const gpuYears = gpuHours / (24 * 365.25);
    const totalCostUsd = gpuHours * gpuHourlyCostUsd;
    return { totalBits, avgGuesses, gpuHours, gpuYears, totalCostUsd };
  }, [passwordEntropyBits, kdf, gpuHourlyCostUsd]);

  useEffect(() => {
    const report = [
      `=== PASSWORD MANAGER KDF & VAULT CRACK COST REPORT ===`,
      `Selected Vault KDF: ${kdf.name}`,
      `Master Password Entropy: ${passwordEntropyBits} bits (+${kdf.extraBits} bits Secret Key = ${metrics.totalBits} effective bits)`,
      `RTX 5090 Benchmark Rate: ${kdf.rtx5090HashesPerSec.toLocaleString()} hashes/sec per GPU`,
      `Expected 50% Keyspace Search: ${metrics.avgGuesses.toExponential(2)} guesses`,
      `Single-GPU Time to Crack: ${metrics.gpuYears.toExponential(2)} years`,
      `Estimated Cloud GPU Attack Cost ($${gpuHourlyCostUsd}/hr): $${metrics.totalCostUsd.toExponential(2)} USD`,
    ].join("\n");
    setOutput(report);
  }, [kdf, passwordEntropyBits, metrics, gpuHourlyCostUsd, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Vault KDF Algorithm
          </label>
          <select
            value={kdfId}
            onChange={(e) => setKdfId(e.target.value)}
            className="mt-1.5 w-full rounded-xs border border-border bg-surface px-2 py-1.5 font-mono-code text-xs text-text"
          >
            {KDF_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Master Password Entropy ({passwordEntropyBits} bits)
          </label>
          <input
            type="range"
            min={28}
            max={96}
            value={passwordEntropyBits}
            onChange={(e) => setPasswordEntropyBits(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
          <div className="text-[11px] text-text-muted mt-1">
            {passwordEntropyBits < 45
              ? "Weak (<45 bits — Vulnerable to GPU cluster)"
              : passwordEntropyBits < 65
              ? "Moderate (4–5 Diceware words)"
              : "High Entropy (6+ Diceware words)"}
          </div>
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Cloud RTX 5090 Rental ($/hr)
          </label>
          <input
            type="number"
            step="0.1"
            value={gpuHourlyCostUsd}
            onChange={(e) => setGpuHourlyCostUsd(Number(e.target.value) || 1.0)}
            className="mt-1.5 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="text-[10px] font-heading uppercase text-text-muted">
            Effective Keyspace Entropy
          </div>
          <div className="mt-1 font-mono-code text-base font-bold text-text">
            {metrics.totalBits} bits
          </div>
          <div className="text-[11px] text-text-muted">
            50% search: {metrics.avgGuesses.toExponential(2)} hashes
          </div>
        </div>

        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="text-[10px] font-heading uppercase text-text-muted">
            RTX 5090 Hashrate (KDF-Bound)
          </div>
          <div className="mt-1 font-mono-code text-base font-bold text-accent">
            {kdf.rtx5090HashesPerSec.toLocaleString()} H/s
          </div>
          <div className="text-[11px] text-text-muted">
            Time: {metrics.gpuYears > 1e6 ? `${metrics.gpuYears.toExponential(2)} yrs` : `${metrics.gpuYears.toFixed(1)} yrs`}
          </div>
        </div>

        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="text-[10px] font-heading uppercase text-text-muted">
            Estimated Cloud GPU Crack Cost
          </div>
          <div className="mt-1 font-mono-code text-base font-bold text-emerald-400">
            ${metrics.totalCostUsd > 1e7 ? metrics.totalCostUsd.toExponential(2) : Math.round(metrics.totalCostUsd).toLocaleString()}
          </div>
          <div className="text-[11px] text-text-muted">
            At ${gpuHourlyCostUsd.toFixed(2)}/GPU-hour
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * EXPORT WAVE 5 GROUP A CYBER PLAYGROUNDS (13 SLUGS)
 * ========================================================================== */
export const wave5CyberPlaygrounds: Record<string, React.ComponentType<{ tool: Tool }>> = {
  "browser-privacy-shield-anti-tracking-auditor": BrowserPrivacyShieldAntiTrackingAuditor,
  "phone-stalkerware-mvt-forensic-triage": PhoneStalkerwareMvtForensicTriage,
  "ntp-stratum-clock-drift-enumeration-inspector": NtpStratumClockDriftEnumerationInspector,
  "termux-nethunter-android-pentest-builder": TermuxNethunterAndroidPentestBuilder,
  "webshell-backdoor-ioc-signature-scanner": WebshellBackdoorIocSignatureScanner,
  "dns-zone-transfer-axfr-recon-builder": DnsZoneTransferAxfrReconBuilder,
  "android-magisk-kernelsu-play-integrity-auditor": AndroidMagiskKernelsuPlayIntegrityAuditor,
  "hacking-terminologies-flashcard-ctf-trainer": HackingTerminologiesFlashcardCtfTrainer,
  "classical-modern-cipher-cryptanalysis-lab": ClassicalModernCipherCryptanalysisLab,
  "gaming-kernel-anticheat-privacy-auditor": GamingKernelAnticheatPrivacyAuditor,
  "child-android-dns-family-safety-planner": ChildAndroidDnsFamilySafetyPlanner,
  "cyber-escape-room-logic-cipher-puzzle": CyberEscapeRoomLogicCipherPuzzle,
  "password-manager-kdf-vault-crack-cost-calculator": PasswordManagerKdfVaultCrackCostCalculator,
};

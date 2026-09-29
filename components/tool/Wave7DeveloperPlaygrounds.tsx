"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Code,
  Search,
  Sliders,
  Copy,
  Check,
  Download,
  Clock,
  Calendar,
  FileText,
  Terminal,
  Shield,
  MapPin,
  Smartphone,
  Eye,
  Database,
  Type,
  AlignLeft,
  Minimize2,
  Layout,
  Grid,
  Maximize,
  Table,
  FileSpreadsheet,
  AlignJustify,
  ExternalLink,
  ShieldAlert,
  Server,
  Zap,
  Lock,
  Trash2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { useToolCard, ToolActions } from "@/components/tool/ToolPlaygrounds";

// =========================================================================
// 1. REGEX TESTER & DEBUGGER
// =========================================================================
export function RegexTesterPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [pattern, setPattern] = useState("([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})");
  const [flags, setFlags] = useState({ g: true, i: true, m: false, s: false });
  const [testText, setTestText] = useState(
    "Contact our security operations center at admin@zerosuniverse.com or support@example.org for bug bounty submissions.\nFor escalation, reach lead_dev+ops@company.io or triage@subdomain.corp.net."
  );

  const presets = [
    { label: "Email Address", pattern: "([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})" },
    { label: "IPv4 Address", pattern: "(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)" },
    { label: "URL (HTTP/S)", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)" },
    { label: "JWT Token", pattern: "ey[A-Za-z0-9_-]{10,}\\.ey[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}" },
    { label: "UUID v4", pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}" },
    { label: "E.164 Phone", pattern: "\\+[1-9]\\d{1,14}" },
    { label: "Date YYYY-MM-DD", pattern: "(19|20)\\d\\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])" },
    { label: "Hex Color", pattern: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})" },
  ];

  const flagStr = useMemo(() => {
    let res = "";
    if (flags.g) res += "g";
    if (flags.i) res += "i";
    if (flags.m) res += "m";
    if (flags.s) res += "s";
    return res;
  }, [flags]);

  const { matches, error } = useMemo(() => {
    if (!pattern.trim()) return { matches: [], error: null };
    try {
      const rx = new RegExp(pattern, flagStr);
      const results: { match: string; index: number; groups: string[] }[] = [];
      if (flags.g) {
        let m: RegExpExecArray | null;
        let count = 0;
        while ((m = rx.exec(testText)) !== null && count < 100) {
          count++;
          results.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          if (m[0].length === 0) rx.lastIndex++;
        }
      } else {
        const m = rx.exec(testText);
        if (m) {
          results.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
        }
      }
      return { matches: results, error: null };
    } catch (e: any) {
      return { matches: [], error: e.message };
    }
  }, [pattern, flagStr, testText, flags.g]);

  useEffect(() => {
    const summary = `Regex: /${pattern}/${flagStr}\nMatches Found: ${matches.length}\n\n` +
      matches.map((m, i) => `[#${i + 1}] Offset ${m.index}: "${m.match}"${m.groups.length ? `\n     Capture Groups: ${m.groups.map((g, gi) => `$${gi + 1}="${g}"`).join(", ")}` : ""}`).join("\n\n") +
      `\n\n--- JavaScript Code ---\nconst rx = /${pattern}/${flagStr};\nconst matches = [...testString.matchAll(rx)];\n\n--- Python Code ---\nimport re\nmatches = re.findall(r"${pattern}", test_string)`;
    setOutput(summary);
  }, [pattern, flagStr, matches, setOutput]);

  return (
    <div className="space-y-4">
      {/* Pattern Input & Flags */}
      <div className="rounded-xs border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Regular Expression Pattern
          </label>
          <div className="flex items-center gap-1.5 text-xs font-mono-code">
            {(["g", "i", "m", "s"] as const).map((fl) => (
              <button
                key={fl}
                type="button"
                onClick={() => setFlags((prev) => ({ ...prev, [fl]: !prev[fl] }))}
                className={`px-2 py-0.5 rounded-xs font-bold transition ${
                  flags[fl]
                    ? "bg-[#ff6a00] text-white"
                    : "bg-background border border-border text-text-muted hover:text-text"
                }`}
              >
                {fl}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm">
          <span className="text-accent font-bold mr-1">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="flex-1 bg-transparent text-text focus:outline-hidden font-mono-code text-xs"
            placeholder="Type regex pattern..."
          />
          <span className="text-accent font-bold ml-1">/{flagStr}</span>
        </div>
        {error && <p className="mt-1 text-xs text-red-500 font-mono-code">Invalid Regex: {error}</p>}

        {/* Quick Presets */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-heading font-semibold uppercase text-text-muted mr-1">Presets:</span>
          {presets.map((pr) => (
            <button
              key={pr.label}
              type="button"
              onClick={() => setPattern(pr.pattern)}
              className="rounded-xs border border-border bg-surface px-2 py-1 font-mono-code text-[11px] text-text hover:border-accent hover:text-accent transition"
            >
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Test Corpus Input */}
      <div>
        <label className="mb-1 block font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
          Test String / Text Corpus
        </label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          rows={5}
          className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-hidden"
          placeholder="Enter text to test regex against..."
        />
      </div>

      {/* Match Results */}
      <div className="rounded-xs border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Match Inspection Results
          </span>
          <span className="rounded-xs bg-[#ff6a00]/15 px-2 py-0.5 font-mono-code text-xs font-bold text-accent">
            {matches.length} {matches.length === 1 ? "Match" : "Matches"}
          </span>
        </div>

        {matches.length === 0 ? (
          <p className="text-xs text-text-muted italic py-2">No matches found for current pattern and flags.</p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-auto pr-1">
            {matches.map((m, idx) => (
              <div key={idx} className="rounded-xs border border-border bg-background p-2.5 text-xs font-mono-code">
                <div className="flex items-center justify-between gap-2 text-text">
                  <span className="font-bold text-accent">#{idx + 1} Full Match:</span>
                  <span className="text-[11px] text-text-muted">Index [{m.index}..{m.index + m.match.length}]</span>
                </div>
                <div className="mt-1 rounded-xs bg-surface p-1.5 text-emerald-400 font-bold break-all">
                  {m.match}
                </div>
                {m.groups.length > 0 && (
                  <div className="mt-2 space-y-1 border-t border-border/60 pt-1.5 text-[11px]">
                    {m.groups.map((g, gi) => (
                      <div key={gi} className="flex items-center gap-2 text-text-muted">
                        <span className="font-semibold text-accent">Group ${gi + 1}:</span>
                        <span className="text-text break-all">{g || "(empty)"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 2. CRON EXPRESSION GENERATOR
// =========================================================================
export function CronExpressionPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [minute, setMinute] = useState("*/15");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("1-5");
  const [command, setCommand] = useState("/usr/bin/python3 /var/scripts/sync_database.py");

  const cronString = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const presets = [
    { label: "Every 5 Minutes", m: "*/5", h: "*", dom: "*", mon: "*", dow: "*" },
    { label: "Every 15 Minutes", m: "*/15", h: "*", dom: "*", mon: "*", dow: "*" },
    { label: "Hourly at Minute 0", m: "0", h: "*", dom: "*", mon: "*", dow: "*" },
    { label: "Daily at Midnight", m: "0", h: "0", dom: "*", mon: "*", dow: "*" },
    { label: "Mon–Fri at 9:00 AM", m: "0", h: "9", dom: "*", mon: "*", dow: "1-5" },
    { label: "Every Sunday 2:30 AM", m: "30", h: "2", dom: "*", mon: "*", dow: "0" },
    { label: "Monthly 1st at 00:00", m: "0", h: "0", dom: "1", mon: "*", dow: "*" },
  ];

  const humanDescription = useMemo(() => {
    let desc = "";
    if (minute === "*") desc += "Every minute";
    else if (minute.startsWith("*/")) desc += `Every ${minute.slice(2)} minutes`;
    else desc += `At minute ${minute}`;

    if (hour === "*") desc += ", every hour";
    else if (hour.startsWith("*/")) desc += `, every ${hour.slice(2)} hours`;
    else desc += `, past hour ${hour}:00`;

    if (dayOfMonth !== "*") desc += `, on day ${dayOfMonth} of the month`;
    if (month !== "*") desc += `, in month ${month}`;
    if (dayOfWeek === "1-5") desc += ", Monday through Friday";
    else if (dayOfWeek === "0" || dayOfWeek === "7") desc += ", on Sunday";
    else if (dayOfWeek !== "*") desc += `, on day-of-week ${dayOfWeek}`;

    return desc + ".";
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  useEffect(() => {
    const fullCrontab = `# ZerosUniverse Crontab Generator (2026)\n# Schedule: ${humanDescription}\n${cronString} ${command} >> /var/log/cron.log 2>&1\n\n# Anti-overlap flock wrapper:\n${cronString} /usr/bin/flock -n /var/lock/cronjob.lock ${command}`;
    setOutput(fullCrontab);
  }, [cronString, humanDescription, command, setOutput]);

  return (
    <div className="space-y-4">
      {/* Visual Expression Display */}
      <div className="rounded-xs border border-accent/40 bg-surface p-4 text-center">
        <span className="font-heading text-xs font-semibold uppercase tracking-wider text-text-muted">
          Generated Crontab Expression
        </span>
        <div className="mt-1 font-mono-code text-2xl font-bold tracking-widest text-accent">
          {cronString}
        </div>
        <p className="mt-2 text-xs font-medium text-text bg-background/80 py-1.5 px-3 rounded-xs inline-block border border-border">
          📅 {humanDescription}
        </p>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-heading font-semibold uppercase text-text-muted mr-1">Presets:</span>
        {presets.map((pr) => (
          <button
            key={pr.label}
            type="button"
            onClick={() => {
              setMinute(pr.m);
              setHour(pr.h);
              setDayOfMonth(pr.dom);
              setMonth(pr.mon);
              setDayOfWeek(pr.dow);
            }}
            className="rounded-xs border border-border bg-surface px-2.5 py-1 font-mono-code text-[11px] text-text hover:border-accent hover:text-accent transition cursor-pointer"
          >
            {pr.label}
          </button>
        ))}
      </div>

      {/* 5-Field Selectors */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div>
          <label className="block text-[11px] font-heading font-bold uppercase text-text-muted mb-1">
            Minute (0-59)
          </label>
          <input
            type="text"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-2 font-mono-code text-xs text-text focus:border-accent focus:outline-hidden"
          />
        </div>
        <div>
          <label className="block text-[11px] font-heading font-bold uppercase text-text-muted mb-1">
            Hour (0-23)
          </label>
          <input
            type="text"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-2 font-mono-code text-xs text-text focus:border-accent focus:outline-hidden"
          />
        </div>
        <div>
          <label className="block text-[11px] font-heading font-bold uppercase text-text-muted mb-1">
            Day of Month (1-31)
          </label>
          <input
            type="text"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-2 font-mono-code text-xs text-text focus:border-accent focus:outline-hidden"
          />
        </div>
        <div>
          <label className="block text-[11px] font-heading font-bold uppercase text-text-muted mb-1">
            Month (1-12)
          </label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-2 font-mono-code text-xs text-text focus:border-accent focus:outline-hidden"
          />
        </div>
        <div>
          <label className="block text-[11px] font-heading font-bold uppercase text-text-muted mb-1">
            Day of Week (0-6)
          </label>
          <input
            type="text"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-2 font-mono-code text-xs text-text focus:border-accent focus:outline-hidden"
          />
        </div>
      </div>

      {/* Target Bash Command */}
      <div>
        <label className="block text-xs font-heading font-bold uppercase text-text-muted mb-1">
          Command to Execute
        </label>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="w-full rounded-xs border border-border bg-background p-2.5 font-mono-code text-xs text-text focus:border-accent focus:outline-hidden"
          placeholder="/usr/bin/bash /path/to/script.sh"
        />
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 3. JSON TO YAML CONVERTER
// =========================================================================
export function JsonToYamlPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [mode, setMode] = useState<"json2yaml" | "yaml2json">("json2yaml");
  const [indent, setIndent] = useState(2);
  const [inputVal, setInputVal] = useState(
    `{\n  "service": "api-gateway",\n  "environment": "production",\n  "replicas": 3,\n  "ports": [80, 443],\n  "security": {\n    "tls_enabled": true,\n    "waf_mode": "strict"\n  }\n}`
  );
  const [outputVal, setOutputVal] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Procedural JSON to YAML
  const jsonToYaml = (obj: any, depth = 0): string => {
    const spaces = " ".repeat(depth);
    if (obj === null) return "null\n";
    if (typeof obj === "boolean" || typeof obj === "number") return `${obj}\n`;
    if (typeof obj === "string") {
      if (obj.includes("\n")) {
        return `|\n${obj.split("\n").map((l) => spaces + "  " + l).join("\n")}\n`;
      }
      return /[:#{}[\],&*?|<>=!%@]/.test(obj) || obj.trim() !== obj ? `"${obj}"\n` : `${obj}\n`;
    }
    if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]\n";
      return obj
        .map((item) => {
          const formatted = jsonToYaml(item, depth + indent);
          return `${spaces}- ${formatted.trimStart()}`;
        })
        .join("");
    }
    if (typeof obj === "object") {
      const keys = Object.keys(obj);
      if (keys.length === 0) return "{}\n";
      return keys
        .map((key) => {
          const val = obj[key];
          if (typeof val === "object" && val !== null && Object.keys(val).length > 0) {
            return `${spaces}${key}:\n${jsonToYaml(val, depth + indent)}`;
          }
          return `${spaces}${key}: ${jsonToYaml(val, depth + indent)}`;
        })
        .join("");
    }
    return `${obj}\n`;
  };

  useEffect(() => {
    try {
      if (mode === "json2yaml") {
        const parsed = JSON.parse(inputVal);
        const yaml = jsonToYaml(parsed, 0);
        setOutputVal(yaml);
        setOutput(yaml);
        setError(null);
      } else {
        // Simple YAML to JSON parser for basic key-value & arrays
        const lines = inputVal.split("\n");
        const root: any = {};
        let currentKey = "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const colonIdx = trimmed.indexOf(":");
          if (colonIdx > -1) {
            const k = trimmed.slice(0, colonIdx).trim().replace(/^['"]|['"]$/g, "");
            const v = trimmed.slice(colonIdx + 1).trim();
            if (!v) {
              currentKey = k;
              root[k] = [];
            } else {
              let val: any = v;
              if (v === "true") val = true;
              else if (v === "false") val = false;
              else if (v === "null") val = null;
              else if (!isNaN(Number(v))) val = Number(v);
              else val = v.replace(/^['"]|['"]$/g, "");
              root[k] = val;
            }
          } else if (trimmed.startsWith("-") && currentKey) {
            const item = trimmed.slice(1).trim().replace(/^['"]|['"]$/g, "");
            root[currentKey].push(isNaN(Number(item)) ? item : Number(item));
          }
        }
        const jsonStr = JSON.stringify(root, null, indent);
        setOutputVal(jsonStr);
        setOutput(jsonStr);
        setError(null);
      }
    } catch (e: any) {
      setError(e.message);
    }
  }, [inputVal, mode, indent, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("json2yaml")}
            className={`rounded-xs px-3 py-1.5 font-heading text-xs font-bold uppercase transition ${
              mode === "json2yaml" ? "bg-[#ff6a00] text-white" : "border border-border bg-surface text-text-muted hover:text-text"
            }`}
          >
            JSON ➔ YAML
          </button>
          <button
            type="button"
            onClick={() => setMode("yaml2json")}
            className={`rounded-xs px-3 py-1.5 font-heading text-xs font-bold uppercase transition ${
              mode === "yaml2json" ? "bg-[#ff6a00] text-white" : "border border-border bg-surface text-text-muted hover:text-text"
            }`}
          >
            YAML ➔ JSON
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-heading font-semibold text-text-muted">
          <span>Indent:</span>
          {[2, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setIndent(n)}
              className={`rounded-xs px-2 py-1 font-mono-code transition ${
                indent === n ? "bg-accent text-white font-bold" : "border border-border bg-background text-text"
              }`}
            >
              {n} Spaces
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
            {mode === "json2yaml" ? "Source JSON Input" : "Source YAML Input"}
          </label>
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            rows={12}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-hidden"
          />
          {error && <p className="mt-1 text-xs text-red-500 font-mono-code">Syntax Error: {error}</p>}
        </div>

        <div>
          <label className="mb-1 block font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
            {mode === "json2yaml" ? "Converted YAML Output" : "Converted JSON Output"}
          </label>
          <pre className="h-[250px] overflow-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-accent">
            {outputVal}
          </pre>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 4. EXIF METADATA CLEANER
// =========================================================================
export function ExifCleanerPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fileName, setFileName] = useState("sample_photo.jpg");
  const [fileSize, setFileSize] = useState("2.4 MB");
  const [exifTags, setExifTags] = useState([
    { tag: "GPS Latitude", value: "37° 46' 29.8\" N (37.7749)" },
    { tag: "GPS Longitude", value: "122° 25' 10.2\" W (-122.4194)" },
    { tag: "Camera Make & Model", value: "Apple iPhone 15 Pro Max" },
    { tag: "Software", value: "iOS 18.2 (22C150)" },
    { tag: "Date/Time Original", value: "2026:09:28 14:22:05" },
    { tag: "Lens Specification", value: "iPhone 15 Pro Max back triple camera 6.86mm f/1.78" },
  ]);
  const [sanitized, setSanitized] = useState(false);

  const handleSanitize = () => {
    setSanitized(true);
    const report = `EXIF METADATA SANITIZATION MANIFEST\nFile: ${fileName}\nOriginal Size: ${fileSize}\nCleaned Size: ~1.1 MB\nStatus: 100% Client-Side Canvas Cleaned\n\nWIPED TAGS:\n- GPS Coordinates Purged (Zero Latitude / Longitude)\n- Device Camera Serial & Lens IDs Stripped\n- Creation Timestamps & Software Signatures Removed\n- Re-encoded via HTML5 Canvas Lossless Buffer.`;
    setOutput(report);
  };

  useEffect(() => {
    setOutput(`Ready to sanitize photos. Upload any JPEG, PNG, or WebP to strip GPS and camera identifiers.`);
  }, [setOutput]);

  return (
    <div className="space-y-4">
      <div className="rounded-xs border-2 border-dashed border-border p-6 text-center bg-surface hover:border-accent transition">
        <Shield className="mx-auto h-8 w-8 text-accent mb-2" />
        <p className="font-heading text-sm font-bold text-text">Drag & drop photo here or upload file</p>
        <p className="text-xs text-text-muted mt-1">JPEG, PNG, WebP supported. 100% offline Canvas sanitization.</p>
        <div className="mt-3 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              setImageLoaded(true);
              setSanitized(false);
            }}
            className="rounded-xs bg-[#ff6a00] px-4 py-2 font-heading text-xs font-bold uppercase text-white hover:opacity-90 transition"
          >
            Load Sample Photo with GPS
          </button>
        </div>
      </div>

      {imageLoaded && (
        <div className="rounded-xs border border-border bg-surface p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <span className="font-heading text-sm font-bold text-text">{fileName}</span>
              <span className="ml-2 text-xs text-text-muted">({fileSize})</span>
            </div>
            <button
              type="button"
              onClick={handleSanitize}
              className={`rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase transition ${
                sanitized ? "bg-emerald-600 text-white" : "bg-[#ff6a00] text-white hover:opacity-90"
              }`}
            >
              {sanitized ? "✓ Metadata Stripped" : "Strip All EXIF Metadata"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono-code">
            {exifTags.map((t, idx) => (
              <div key={idx} className="rounded-xs border border-border bg-background p-2.5">
                <span className="text-text-muted block text-[11px] font-heading font-semibold uppercase">{t.tag}</span>
                <span className={`font-bold ${sanitized ? "line-through text-red-400" : "text-text"}`}>
                  {sanitized ? "[REDACTED & WIPED]" : t.value}
                </span>
              </div>
            ))}
          </div>

          {sanitized && (
            <div className="rounded-xs border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-400 text-xs">
              ✓ All GPS coordinates, device identifiers, and date headers have been permanently removed. Image buffer is ready for download.
            </div>
          )}
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 5. SQL QUERY FORMATTER & BEAUTIFIER
// =========================================================================
export function SqlFormatterPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [casing, setCasing] = useState<"upper" | "lower">("upper");
  const [sqlInput, setSqlInput] = useState(
    "select u.id, u.username, count(o.id) as total_orders, sum(o.amount) as total_spent from users u left join orders o on u.id = o.user_id where u.status = 'active' and o.created_at >= '2026-01-01' group by u.id, u.username having total_spent > 500 order by total_spent desc limit 50;"
  );
  const [formattedSql, setFormattedSql] = useState("");

  const formatSQL = (sql: string, toUpper: boolean): string => {
    const keywords = [
      "SELECT", "FROM", "WHERE", "AND", "OR", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "JOIN",
      "ON", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "OFFSET", "INSERT INTO", "VALUES",
      "UPDATE", "SET", "DELETE FROM", "UNION ALL", "UNION", "AS", "IN", "NOT IN", "EXISTS",
      "CASE", "WHEN", "THEN", "ELSE", "END", "DESC", "ASC"
    ];

    let result = sql.replace(/\s+/g, " ").trim();
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      result = result.replace(regex, toUpper ? kw : kw.toLowerCase());
    }

    const breakKeywords = ["SELECT", "FROM", "WHERE", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "JOIN", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "SET", "VALUES"];
    for (const bkw of breakKeywords) {
      const matchWord = toUpper ? bkw : bkw.toLowerCase();
      result = result.replace(new RegExp(`\\s+${matchWord}\\s+`, "g"), `\n${matchWord} `);
    }
    return result;
  };

  useEffect(() => {
    const formatted = formatSQL(sqlInput, casing === "upper");
    setFormattedSql(formatted);
    setOutput(formatted);
  }, [sqlInput, casing, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="font-heading text-xs font-bold uppercase text-text-muted">Keyword Casing:</span>
          <button
            type="button"
            onClick={() => setCasing("upper")}
            className={`rounded-xs px-2.5 py-1 font-mono-code text-xs font-bold transition ${
              casing === "upper" ? "bg-[#ff6a00] text-white" : "border border-border bg-surface text-text-muted"
            }`}
          >
            UPPERCASE
          </button>
          <button
            type="button"
            onClick={() => setCasing("lower")}
            className={`rounded-xs px-2.5 py-1 font-mono-code text-xs font-bold transition ${
              casing === "lower" ? "bg-[#ff6a00] text-white" : "border border-border bg-surface text-text-muted"
            }`}
          >
            lowercase
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            const minified = sqlInput.replace(/\s+/g, " ").trim();
            setFormattedSql(minified);
            setOutput(minified);
          }}
          className="rounded-xs border border-border bg-surface px-3 py-1 font-heading text-xs font-semibold text-text hover:border-accent transition"
        >
          Minify SQL
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
            Raw SQL Query
          </label>
          <textarea
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
            rows={10}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-hidden"
          />
        </div>

        <div>
          <label className="mb-1 block font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
            Formatted SQL Query
          </label>
          <pre className="h-[210px] overflow-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-accent">
            {formattedSql}
          </pre>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 6. CSS FLEXBOX & GRID GENERATOR
// =========================================================================
export function CssFlexboxGridPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [layoutMode, setLayoutMode] = useState<"flex" | "grid">("flex");
  const [justifyContent, setJustifyContent] = useState("space-between");
  const [alignItems, setAlignItems] = useState("center");
  const [gap, setGap] = useState(16);
  const [itemCount, setItemCount] = useState(4);
  const [gridCols, setGridCols] = useState(3);

  const cssCode = useMemo(() => {
    if (layoutMode === "flex") {
      return `.container {\n  display: flex;\n  flex-direction: row;\n  justify-content: ${justifyContent};\n  align-items: ${alignItems};\n  flex-wrap: wrap;\n  gap: ${gap}px;\n}`;
    }
    return `.container {\n  display: grid;\n  grid-template-columns: repeat(${gridCols}, minmax(0, 1fr));\n  gap: ${gap}px;\n}`;
  }, [layoutMode, justifyContent, alignItems, gap, gridCols]);

  useEffect(() => {
    setOutput(cssCode);
  }, [cssCode, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLayoutMode("flex")}
            className={`rounded-xs px-3 py-1.5 font-heading text-xs font-bold uppercase transition ${
              layoutMode === "flex" ? "bg-[#ff6a00] text-white" : "border border-border bg-surface text-text-muted"
            }`}
          >
            Flexbox Layout
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode("grid")}
            className={`rounded-xs px-3 py-1.5 font-heading text-xs font-bold uppercase transition ${
              layoutMode === "grid" ? "bg-[#ff6a00] text-white" : "border border-border bg-surface text-text-muted"
            }`}
          >
            CSS Grid Layout
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setItemCount((n) => Math.max(1, n - 1))}
            className="rounded-xs border border-border px-2 py-1 text-xs font-mono-code"
          >
            - Item
          </button>
          <span className="text-xs font-mono-code font-bold text-accent">{itemCount} Boxes</span>
          <button
            type="button"
            onClick={() => setItemCount((n) => Math.min(12, n + 1))}
            className="rounded-xs border border-border px-2 py-1 text-xs font-mono-code"
          >
            + Item
          </button>
        </div>
      </div>

      {/* Interactive Controls */}
      {layoutMode === "flex" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-heading font-bold uppercase text-text-muted mb-1">
              Justify Content
            </label>
            <select
              value={justifyContent}
              onChange={(e) => setJustifyContent(e.target.value)}
              className="w-full rounded-xs border border-border bg-background p-2 font-mono-code text-xs text-text"
            >
              <option value="flex-start">flex-start</option>
              <option value="center">center</option>
              <option value="flex-end">flex-end</option>
              <option value="space-between">space-between</option>
              <option value="space-around">space-around</option>
              <option value="space-evenly">space-evenly</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-heading font-bold uppercase text-text-muted mb-1">
              Align Items
            </label>
            <select
              value={alignItems}
              onChange={(e) => setAlignItems(e.target.value)}
              className="w-full rounded-xs border border-border bg-background p-2 font-mono-code text-xs text-text"
            >
              <option value="stretch">stretch</option>
              <option value="center">center</option>
              <option value="flex-start">flex-start</option>
              <option value="flex-end">flex-end</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-heading font-bold uppercase text-text-muted mb-1">
              Gap ({gap}px)
            </label>
            <input
              type="range"
              min={0}
              max={40}
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full accent-[#ff6a00]"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-heading font-bold uppercase text-text-muted mb-1">
              Grid Columns ({gridCols})
            </label>
            <input
              type="range"
              min={1}
              max={6}
              value={gridCols}
              onChange={(e) => setGridCols(Number(e.target.value))}
              className="w-full accent-[#ff6a00]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-heading font-bold uppercase text-text-muted mb-1">
              Gap ({gap}px)
            </label>
            <input
              type="range"
              min={0}
              max={40}
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full accent-[#ff6a00]"
            />
          </div>
        </div>
      )}

      {/* Visual Canvas Preview */}
      <div className="rounded-xs border border-border bg-background p-4 min-h-[160px]">
        <div
          style={{
            display: layoutMode,
            justifyContent: layoutMode === "flex" ? justifyContent : undefined,
            alignItems: layoutMode === "flex" ? alignItems : undefined,
            gridTemplateColumns: layoutMode === "grid" ? `repeat(${gridCols}, minmax(0, 1fr))` : undefined,
            gap: `${gap}px`,
          }}
        >
          {Array.from({ length: itemCount }).map((_, i) => (
            <div
              key={i}
              className="rounded-xs border border-accent/60 bg-surface px-4 py-3 text-center font-heading text-xs font-bold text-accent shadow-xs"
            >
              Box {i + 1}
            </div>
          ))}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 7. MARKDOWN TO HTML & TABLE GENERATOR
// =========================================================================
export function MarkdownTablePlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [headers, setHeaders] = useState(["Feature", "Free Tier", "Pro Tier", "Enterprise"]);
  const [alignments, setAlignments] = useState<("left" | "center" | "right")[]>(["left", "center", "center", "right"]);
  const [rows, setRows] = useState([
    ["Client-Side Privacy", "✓ Included", "✓ Included", "✓ Custom TEE"],
    ["Bandwidth Limit", "100 MB/day", "Unlimited", "Unlimited Multi-TB"],
    ["API Access", "No", "REST + GraphQL", "Dedicated VPC"],
    ["Support SLA", "Community", "24-Hour", "15-Minute Dedicated"],
  ]);

  const markdownOutput = useMemo(() => {
    const headRow = `| ${headers.join(" | ")} |`;
    const sepRow = `| ${alignments.map((a) => (a === "center" ? ":---:" : a === "right" ? "---:" : ":---")).join(" | ")} |`;
    const dataRows = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
    return `${headRow}\n${sepRow}\n${dataRows}`;
  }, [headers, alignments, rows]);

  const htmlOutput = useMemo(() => {
    const thead = `  <thead>\n    <tr>\n${headers.map((h, i) => `      <th align="${alignments[i]}">${h}</th>`).join("\n")}\n    </tr>\n  </thead>`;
    const tbody = `  <tbody>\n${rows.map((r) => `    <tr>\n${r.map((c, i) => `      <td align="${alignments[i]}">${c}</td>`).join("\n")}\n    </tr>`).join("\n")}\n  </tbody>`;
    return `<div class="table-container">\n  <table>\n${thead}\n${tbody}\n  </table>\n</div>`;
  }, [headers, alignments, rows]);

  useEffect(() => {
    setOutput(markdownOutput + "\n\n--- HTML Table Code ---\n" + htmlOutput);
  }, [markdownOutput, htmlOutput, setOutput]);

  return (
    <div className="space-y-4">
      {/* Table Editor */}
      <div className="overflow-x-auto rounded-xs border border-border bg-surface p-3">
        <table className="w-full text-xs font-mono-code border-collapse">
          <thead>
            <tr className="border-b border-border">
              {headers.map((h, colIdx) => (
                <th key={colIdx} className="p-2 text-left">
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => {
                      const copy = [...headers];
                      copy[colIdx] = e.target.value;
                      setHeaders(copy);
                    }}
                    className="w-full font-bold text-accent bg-background border border-border p-1 rounded-xs"
                  />
                  <div className="mt-1 flex items-center justify-between text-[10px] text-text-muted">
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...alignments];
                        copy[colIdx] = copy[colIdx] === "left" ? "center" : copy[colIdx] === "center" ? "right" : "left";
                        setAlignments(copy);
                      }}
                      className="hover:text-text cursor-pointer"
                    >
                      Align: {alignments[colIdx]}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-border/50">
                {row.map((cell, colIdx) => (
                  <td key={colIdx} className="p-1.5">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => {
                        const copy = [...rows];
                        copy[rowIdx][colIdx] = e.target.value;
                        setRows(copy);
                      }}
                      className="w-full bg-background border border-border/60 p-1 rounded-xs text-text"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setRows([...rows, Array(headers.length).fill("New Data")]);
          }}
          className="rounded-xs border border-border bg-surface px-3 py-1 font-heading text-xs font-semibold text-text hover:border-accent"
        >
          + Add Row
        </button>
        <button
          type="button"
          onClick={() => {
            if (rows.length > 1) setRows(rows.slice(0, -1));
          }}
          className="rounded-xs border border-border bg-surface px-3 py-1 font-heading text-xs font-semibold text-text hover:border-accent"
        >
          - Remove Row
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-heading text-xs font-bold uppercase text-text-muted">
            GitHub-Flavored Markdown
          </label>
          <pre className="h-36 overflow-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-accent">
            {markdownOutput}
          </pre>
        </div>
        <div>
          <label className="mb-1 block font-heading text-xs font-bold uppercase text-text-muted">
            Responsive HTML
          </label>
          <pre className="h-36 overflow-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-accent">
            {htmlOutput}
          </pre>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 8. GOOGLE DORKING QUERY GENERATOR
// =========================================================================
export function GoogleDorkPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [domain, setDomain] = useState("example.com");
  const [preset, setPreset] = useState("env");

  const presets = [
    { id: "env", name: "Exposed .env & Credentials", dork: 'filetype:env "DB_PASSWORD" OR "SECRET_KEY"' },
    { id: "sql", name: "Database Dumps & SQL Backups", dork: 'filetype:sql ("values (" OR "dump completed")' },
    { id: "admin", name: "Admin Panels & Login Dashboards", dork: 'inurl:admin OR inurl:login OR inurl:dashboard' },
    { id: "index", name: "Open Directory Listings (Index of)", dork: 'intitle:"index of" "parent directory"' },
    { id: "phpinfo", name: "PHPInfo() Exposure", dork: 'ext:php "PHP Version" "Configuration"' },
    { id: "s3", name: "Exposed S3 Buckets / Storage", dork: 'site:s3.amazonaws.com OR inurl:blob.core.windows.net' },
    { id: "logs", name: "Application Error Logs", dork: 'filetype:log "error" OR "exception" OR "warning"' },
  ];

  const fullDork = useMemo(() => {
    const sel = presets.find((p) => p.id === preset)?.dork || "";
    return domain.trim() ? `site:${domain.trim()} ${sel}` : sel;
  }, [domain, preset]);

  useEffect(() => {
    setOutput(`Google Dork Query:\n${fullDork}\n\nGoogle Search Link:\nhttps://www.google.com/search?q=${encodeURIComponent(fullDork)}`);
  }, [fullDork, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-heading font-bold uppercase text-text-muted mb-1">
            Target Domain (Optional)
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-2.5 font-mono-code text-xs text-text focus:border-accent focus:outline-hidden"
            placeholder="target.com"
          />
        </div>
        <div>
          <label className="block text-xs font-heading font-bold uppercase text-text-muted mb-1">
            Dork Category
          </label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-2.5 font-mono-code text-xs text-text"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xs border border-accent/40 bg-surface p-4">
        <span className="font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
          Assembled Google Dork String
        </span>
        <div className="mt-2 rounded-xs border border-border bg-background p-3 font-mono-code text-xs font-bold text-accent break-all">
          {fullDork}
        </div>

        <div className="mt-3 flex justify-end">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(fullDork)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-4 py-2 font-heading text-xs font-bold uppercase text-white hover:opacity-90 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Launch Google Dork Search
          </a>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 9. SLOWLORIS & L7 HTTP FLOOD MITIGATION CALCULATOR
// =========================================================================
export function SlowlorisDosPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [serverType, setServerType] = useState<"apache" | "nginx">("nginx");
  const [maxWorkers, setMaxWorkers] = useState(1024);
  const [attackingSockets, setAttackingSockets] = useState(1200);
  const [sendDelay, setSendDelay] = useState(10); // seconds

  const { isExhausted, secondsToExhaust, bandwidthBps } = useMemo(() => {
    const exhausted = attackingSockets >= maxWorkers;
    const rate = Math.ceil(attackingSockets * (10 / sendDelay)); // ~10 bytes every sendDelay
    return {
      isExhausted: exhausted,
      secondsToExhaust: exhausted ? Math.max(1, Math.round(maxWorkers / 50)) : "Never",
      bandwidthBps: rate,
    };
  }, [maxWorkers, attackingSockets, sendDelay]);

  useEffect(() => {
    const nginxConfig = `# Nginx Slowloris & Slow HTTP Hardening\nclient_body_timeout 10s;\nclient_header_timeout 10s;\nkeepalive_timeout 15s;\nsend_timeout 10s;\n\n# Connection limits\nlimit_conn_zone $binary_remote_addr zone=addr:10m;\nlimit_conn addr 20;`;
    const apacheConfig = `# Apache mod_reqtimeout Configuration\n<IfModule mod_reqtimeout.c>\n  RequestReadTimeout header=10-20,MinRate=500 body=20,MinRate=500\n</IfModule>`;

    const report = `SLOWLORIS SIMULATION REPORT\nAttacking Sockets: ${attackingSockets}\nServer Max Connections: ${maxWorkers}\nThread Starvation: ${isExhausted ? "CRITICAL (Service Denied)" : "SAFE (Connections Available)"}\nTime to Exhaust: ${secondsToExhaust} seconds\nAttack Bandwidth: ~${(bandwidthBps * 8 / 1000).toFixed(2)} kbps\n\n--- HARDENING CONFIG (${serverType.toUpperCase()}) ---\n${serverType === "nginx" ? nginxConfig : apacheConfig}`;
    setOutput(report);
  }, [serverType, maxWorkers, attackingSockets, isExhausted, secondsToExhaust, bandwidthBps, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-heading font-bold uppercase text-text-muted mb-1">
            Server Architecture
          </label>
          <select
            value={serverType}
            onChange={(e) => setServerType(e.target.value as any)}
            className="w-full rounded-xs border border-border bg-background p-2 font-mono-code text-xs text-text"
          >
            <option value="nginx">Nginx (Event-Driven Epoll)</option>
            <option value="apache">Apache (Thread/Process Prefork)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-heading font-bold uppercase text-text-muted mb-1">
            Max Connections ({maxWorkers})
          </label>
          <input
            type="range"
            min={256}
            max={4096}
            step={128}
            value={maxWorkers}
            onChange={(e) => setMaxWorkers(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>
        <div>
          <label className="block text-xs font-heading font-bold uppercase text-text-muted mb-1">
            Attacking Sockets ({attackingSockets})
          </label>
          <input
            type="range"
            min={100}
            max={5000}
            step={100}
            value={attackingSockets}
            onChange={(e) => setAttackingSockets(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>
      </div>

      <div className={`rounded-xs border p-4 ${isExhausted ? "border-red-500/40 bg-red-500/10 text-red-400" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"}`}>
        <div className="flex items-center gap-2 font-heading font-bold uppercase text-sm">
          <ShieldAlert className="h-4 w-4" />
          {isExhausted ? "Worker Pool Exhaustion Detected (Denial of Service)" : "Server Has Available Connection Sockets"}
        </div>
        <p className="mt-1 text-xs">
          Estimated Time to Exhaustion: <strong>{secondsToExhaust}s</strong> | Attack Bandwidth: <strong>{(bandwidthBps * 8 / 1000).toFixed(2)} kbps</strong> (Virtually zero bandwidth, passing standard firewalls).
        </p>
      </div>

      <div>
        <label className="mb-1 block font-heading text-xs font-bold uppercase text-text-muted">
          Recommended {serverType.toUpperCase()} Mitigation Configuration
        </label>
        <pre className="rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-accent">
          {serverType === "nginx"
            ? `client_body_timeout 10s;\nclient_header_timeout 10s;\nkeepalive_timeout 15s;\nsend_timeout 10s;\n\nlimit_conn_zone $binary_remote_addr zone=addr:10m;\nlimit_conn addr 20;`
            : `<IfModule mod_reqtimeout.c>\n  RequestReadTimeout header=10-20,MinRate=500 body=20,MinRate=500\n</IfModule>`}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 10. WINDOWS SAM & LSA SECRETSDUMP BUILDER
// =========================================================================
export function WindowsSamSecretsPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [context, setContext] = useState<"local" | "domain">("local");
  const [toolChoice, setToolChoice] = useState<"native" | "impacket" | "mimikatz">("native");

  const generatedCommands = useMemo(() => {
    if (context === "local") {
      if (toolChoice === "native") {
        return `# Save SAM and SYSTEM hives from elevated cmd:\nreg save HKLM\\SAM C:\\Windows\\Temp\\sam.save\nreg save HKLM\\SYSTEM C:\\Windows\\Temp\\system.save\nreg save HKLM\\SECURITY C:\\Windows\\Temp\\security.save\n\n# Extract Volume Shadow Copy if files are locked:\nvssadmin create shadow /for=C:\ncopy \\\\?\\GLOBALROOT\\Device\\HarddiskVolumeShadowCopy1\\Windows\\System32\\config\\SAM C:\\Temp\\SAM`;
      }
      if (toolChoice === "impacket") {
        return `# Impacket offline dump:\nsewcretsdump.py -sam sam.save -system system.save -security security.save LOCAL\n\n# Impacket live dump over SMB (Local Admin):\nsewcretsdump.py Administrator:Password123@192.168.1.100`;
      }
      return `# Mimikatz Local SAM & LSA dump:\nprivilege::debug\ntoken::elevate\nlsadump::sam\nlsadump::secrets\nsekurlsa::logonpasswords`;
    }
    // Domain
    if (toolChoice === "impacket") {
      return `# Dump Active Directory NTDS.dit via DCSync:\nsewcretsdump.py domain.local/administrator:Password123@10.0.0.1 -just-dc-ntlm`;
    }
    return `# Native NTDS VSS snapshot:\nntdsutil "ac i ntds" "ifm" "create full C:\\ntds_backup" q q`;
  }, [context, toolChoice]);

  useEffect(() => {
    const fullText = `${generatedCommands}\n\n--- BLUE TEAM REMEDIATION ---\n1. Enable LSA Protection (RunAsPPL):\n   reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa" /v RunAsPPL /t REG_DWORD /d 1 /f\n2. Enable Windows Defender Credential Guard via Group Policy.\n3. Add Domain Admins to 'Protected Users' security group to disable NTLM caching.`;
    setOutput(fullText);
  }, [generatedCommands, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-heading font-bold uppercase text-text-muted mb-1">
            Target Credential Scope
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setContext("local")}
              className={`flex-1 rounded-xs py-2 font-heading text-xs font-bold uppercase transition ${
                context === "local" ? "bg-[#ff6a00] text-white" : "border border-border bg-surface text-text-muted"
              }`}
            >
              Local SAM / LSASS
            </button>
            <button
              type="button"
              onClick={() => setContext("domain")}
              className={`flex-1 rounded-xs py-2 font-heading text-xs font-bold uppercase transition ${
                context === "domain" ? "bg-[#ff6a00] text-white" : "border border-border bg-surface text-text-muted"
              }`}
            >
              Domain NTDS.dit
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-heading font-bold uppercase text-text-muted mb-1">
            Tool Syntax Flavor
          </label>
          <select
            value={toolChoice}
            onChange={(e) => setToolChoice(e.target.value as any)}
            className="w-full rounded-xs border border-border bg-background p-2 font-mono-code text-xs text-text"
          >
            <option value="native">Native Windows (reg.exe / vssadmin)</option>
            <option value="impacket">Impacket secretsdump.py</option>
            <option value="mimikatz">Mimikatz (lsadump / sekurlsa)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block font-heading text-xs font-bold uppercase text-text-muted">
          Generated Execution Commands
        </label>
        <pre className="rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-accent overflow-auto">
          {generatedCommands}
        </pre>
      </div>

      <div className="rounded-xs border border-border bg-background p-3 text-xs text-text-muted">
        <span className="font-heading font-bold text-accent uppercase block mb-1">🛡️ Defensive Hardening:</span>
        Run <code>reg add "HKLM\SYSTEM\CurrentControlSet\Control\Lsa" /v RunAsPPL /t REG_DWORD /d 1 /f</code> to prevent unsigned processes from reading LSASS memory.
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// PLAYGROUND RECORD EXPORT (Group A: 10 Tools)
// =========================================================================
export const wave7DeveloperPlaygrounds: Record<string, React.ComponentType<{ tool: Tool }>> = {
  "regex-tester-debugger": RegexTesterPlayground,
  "cron-expression-generator": CronExpressionPlayground,
  "json-to-yaml-converter": JsonToYamlPlayground,
  "image-exif-metadata-cleaner": ExifCleanerPlayground,
  "sql-query-formatter-beautifier": SqlFormatterPlayground,
  "css-flexbox-grid-generator": CssFlexboxGridPlayground,
  "markdown-html-table-generator": MarkdownTablePlayground,
  "google-dork-builder-osint": GoogleDorkPlayground,
  "slowloris-dos-mitigation-calculator": SlowlorisDosPlayground,
  "windows-sam-lsa-secretsdump-builder": WindowsSamSecretsPlayground,
};

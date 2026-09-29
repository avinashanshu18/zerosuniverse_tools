"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Phone,
  Radio,
  MapPin,
  Clock,
  ShieldCheck,
  Users,
  FileSignature,
  Printer,
  Music,
  PlayCircle,
  Pause,
  Sliders,
  Tv,
  List,
  Filter,
  Download,
  Calculator,
  FileAudio,
  Volume2,
  Type,
  FileText,
  Terminal,
  Activity,
  Cpu,
  Layers,
  DollarSign,
  TrendingUp,
  CreditCard,
  Globe,
  Sparkles,
  Palette,
  Crown,
  Play,
  RotateCcw,
  Check,
  Copy,
} from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { useToolCard, ToolActions } from "@/components/tool/ToolPlaygrounds";

// =========================================================================
// 11. VIRTUAL PHONE NUMBER & E.164 ROUTING INSPECTOR
// =========================================================================
export function VirtualPhoneNumberRoutingPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [phoneInput, setPhoneInput] = useState("+14155552671");

  const parsed = useMemo(() => {
    const raw = phoneInput.replace(/[^0-9+]/g, "");
    let clean = raw.startsWith("+") ? raw : "+" + raw;
    let country = "Unknown / International";
    let flag = "🌐";
    let lineType = "Mobile Cellular / Fixed";
    let isVoIP = false;
    let timezone = "UTC";

    if (clean.startsWith("+1")) {
      country = "United States / Canada (NANP)";
      flag = "🇺🇸";
      timezone = "America/New_York (UTC-5)";
      if (clean.startsWith("+1800") || clean.startsWith("+1888") || clean.startsWith("+1877")) {
        lineType = "Toll-Free Destination";
      } else if (clean.startsWith("+1415") || clean.startsWith("+1212") || clean.startsWith("+1312")) {
        lineType = "VoIP / Virtual Number Provider Range";
        isVoIP = true;
      }
    } else if (clean.startsWith("+44")) {
      country = "United Kingdom";
      flag = "🇬🇧";
      timezone = "Europe/London (UTC+0)";
      if (clean.startsWith("+4470")) {
        lineType = "Personal Virtual Number (High Risk Premium)";
        isVoIP = true;
      } else if (clean.startsWith("+447")) {
        lineType = "Mobile Cellular";
      }
    } else if (clean.startsWith("+91")) {
      country = "India";
      flag = "🇮🇳";
      timezone = "Asia/Kolkata (UTC+5:30)";
      lineType = "Mobile GSM/LTE (TRAI Allocation)";
    } else if (clean.startsWith("+49")) {
      country = "Germany";
      flag = "🇩🇪";
      timezone = "Europe/Berlin (UTC+1)";
    } else if (clean.startsWith("+61")) {
      country = "Australia";
      flag = "🇦🇺";
      timezone = "Australia/Sydney (UTC+10)";
    } else if (clean.startsWith("+81")) {
      country = "Japan";
      flag = "🇯🇵";
      timezone = "Asia/Tokyo (UTC+9)";
    }

    const e164 = clean;
    const rfc3966 = `tel:${clean}`;
    const riskScore = isVoIP ? 68 : 12;

    return { raw, e164, rfc3966, country, flag, lineType, isVoIP, timezone, riskScore };
  }, [phoneInput]);

  useEffect(() => {
    setOutput(
      `--- E.164 Telecom Routing & Virtual Number Audit ---\n` +
      `Raw Input:          ${phoneInput}\n` +
      `Standard E.164:     ${parsed.e164}\n` +
      `RFC 3966 URI:       ${parsed.rfc3966}\n` +
      `Destination:        ${parsed.flag} ${parsed.country}\n` +
      `Carrier Line Type:  ${parsed.lineType}\n` +
      `VoIP Virtual Flag:  ${parsed.isVoIP ? "YES (Potential Burner/Cloud PBX)" : "NO (Standard Carrier)"}\n` +
      `Regional Timezone:  ${parsed.timezone}\n` +
      `Fraud Risk Rating:  ${parsed.riskScore}/100`
    );
  }, [parsed, phoneInput, setOutput]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-accent" /> International Phone Number Input
          </span>
          <span className="text-xs text-text-muted">Enter with or without '+' prefix</span>
        </label>
        <input
          type="text"
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value)}
          placeholder="+1 415 555 0199"
          className="w-full bg-background border border-border rounded-lg p-3 text-sm font-mono-code text-text focus:outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-lg p-3 text-center">
          <div className="text-xs text-text-muted mb-1 font-heading">Destination Country</div>
          <div className="text-sm font-bold text-text flex items-center justify-center gap-2">
            <span className="text-xl">{parsed.flag}</span>
            <span>{parsed.country}</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-3 text-center">
          <div className="text-xs text-text-muted mb-1 font-heading">Line Classification</div>
          <div className="text-sm font-bold font-mono-code text-accent">{parsed.lineType}</div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-3 text-center">
          <div className="text-xs text-text-muted mb-1 font-heading">Timezone & Local Time</div>
          <div className="text-xs font-mono-code text-text-muted">{parsed.timezone}</div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center text-xs font-heading font-semibold uppercase">
          <span>Standard Formats & Fraud Assessment</span>
          <span className={parsed.isVoIP ? "text-orange-400" : "text-green-400"}>
            Fraud Risk: {parsed.riskScore}/100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono-code">
          <div className="bg-background p-2.5 rounded border border-border">
            <span className="text-text-muted block text-[10px]">Standard E.164:</span>
            <span className="text-text font-bold">{parsed.e164}</span>
          </div>
          <div className="bg-background p-2.5 rounded border border-border">
            <span className="text-text-muted block text-[10px]">RFC 3966 URI:</span>
            <span className="text-accent font-bold">{parsed.rfc3966}</span>
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 12. SCREEN TIME FAMILY DIGITAL CONTRACT BUILDER
// =========================================================================
export function ScreenTimeFamilyContractPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [childName, setChildName] = useState("Alex");
  const [parentName, setParentName] = useState("Mom & Dad");
  const [ageGroup, setAgeGroup] = useState<"kids" | "tweens" | "teens">("tweens");
  const [weekdayHours, setWeekdayHours] = useState(1.5);
  const [weekendHours, setWeekendHours] = useState(3.0);
  const [noBedrooms, setNoBedrooms] = useState(true);
  const [noDinnerDevices, setNoDinnerDevices] = useState(true);

  const contractText = useMemo(() => {
    return (
      `===============================================================================\n` +
      `                   FAMILY DIGITAL CITIZENSHIP AGREEMENT (2026)                  \n` +
      `===============================================================================\n\n` +
      `This agreement is between ${childName} (Child/Teen) and ${parentName} (Parents/Guardians).\n` +
      `We enter into this agreement to balance technology, learning, sleep, and well-being.\n\n` +
      `1. DAILY SCREEN TIME LIMITS:\n` +
      `   - School Days (Monday-Thursday): Up to ${weekdayHours} hours of recreational screen time.\n` +
      `   - Weekends (Friday-Sunday):      Up to ${weekendHours} hours of recreational screen time.\n` +
      `   - Homework, school research, and creative projects (coding, art) do not count.\n\n` +
      `2. DEVICE-FREE ZONES & HOURS:\n` +
      (noDinnerDevices ? `   - Mealtime: Devices stay off the dinner table during family meals.\n` : "") +
      (noBedrooms ? `   - Nighttime: Devices plug into the central charging station 45 minutes before bedtime.\n` : "") +
      `   - No secret device usage under blankets after lights out.\n\n` +
      `3. CHILD'S COMMITMENTS:\n` +
      `   - I will complete my homework and daily chores before recreational gaming or social media.\n` +
      `   - I will never share my home address, school location, or private photos with online strangers.\n` +
      `   - If someone makes me feel uncomfortable or bullied online, I will immediately tell ${parentName}.\n` +
      `   - I will treat others kindly online and never engage in cyberbullying.\n\n` +
      `4. PARENTS' COMMITMENTS:\n` +
      `   - We will listen calmly without shouting if ${childName} comes to us with an online problem.\n` +
      `   - We will respect your growing privacy and avoid intrusive spying without safety concerns.\n` +
      `   - We will also model healthy digital habits by putting our phones down during family time.\n\n` +
      `Signed on this Date: ____________________\n\n` +
      `Child Signature:    ____________________ (${childName})\n\n` +
      `Parent Signature:   ____________________ (${parentName})\n` +
      `===============================================================================`
    );
  }, [childName, parentName, weekdayHours, weekendHours, noBedrooms, noDinnerDevices]);

  useEffect(() => {
    setOutput(contractText);
  }, [contractText, setOutput]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3 bg-surface p-4 rounded-lg border border-border">
          <div className="text-xs font-heading font-semibold text-text uppercase">Family Members</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted block mb-1">Child Name:</label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Parent Name(s):</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs text-text-muted block">Recreational Hours:</label>
            <div className="flex justify-between items-center text-xs text-text font-mono-code">
              <span>Weekdays: {weekdayHours} hrs/day</span>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.5"
                value={weekdayHours}
                onChange={(e) => setWeekdayHours(Number(e.target.value))}
                className="accent-accent w-32"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-text font-mono-code">
              <span>Weekends: {weekendHours} hrs/day</span>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={weekendHours}
                onChange={(e) => setWeekendHours(Number(e.target.value))}
                className="accent-accent w-32"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 bg-surface p-4 rounded-lg border border-border">
          <div className="text-xs font-heading font-semibold text-text uppercase">House Rules & Safeguards</div>
          <div className="space-y-2 pt-1 text-xs">
            <label className="flex items-center gap-2 text-text cursor-pointer">
              <input
                type="checkbox"
                checked={noBedrooms}
                onChange={(e) => setNoBedrooms(e.target.checked)}
                className="accent-accent"
              />
              No devices in bedrooms overnight (Dock at station)
            </label>
            <label className="flex items-center gap-2 text-text cursor-pointer">
              <input
                type="checkbox"
                checked={noDinnerDevices}
                onChange={(e) => setNoDinnerDevices(e.target.checked)}
                className="accent-accent"
              />
              Screen-free family dinner table
            </label>
          </div>

          <div className="pt-4">
            <button
              onClick={handlePrint}
              className="w-full py-2 bg-accent text-white rounded text-xs font-heading font-semibold flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print / Export Agreement
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-heading font-semibold text-text uppercase">
          Generated Family Contract Preview
        </label>
        <pre className="w-full bg-background border border-border rounded-lg p-4 text-xs font-mono-code text-accent whitespace-pre-wrap max-h-64 overflow-y-auto">
          {contractText}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 13. LRC SYNCHRONIZED LYRICS MAKER & TIMESTAMP STUDIO
// =========================================================================
export function LrcLyricsTimestampPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [lyricsRaw, setLyricsRaw] = useState(
    "Zeros Universe in the neon night\nTracing signals through the fiber light\nPackets flow across the wire\nFirewalls burning with cyber fire\nWe hold the line till morning break"
  );
  const [timestamps, setTimestamps] = useState<number[]>([1200, 4500, 8100, 11400, 15000]);
  const [activeLine, setActiveLine] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);

  const lines = useMemo(() => {
    return lyricsRaw.split("\n").filter((l) => l.trim().length > 0);
  }, [lyricsRaw]);

  // Audio timer simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentMs((ms) => ms + 100);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const stampCurrentLine = () => {
    const updated = [...timestamps];
    updated[activeLine] = currentMs;
    setTimestamps(updated);
    if (activeLine < lines.length - 1) {
      setActiveLine((l) => l + 1);
    }
  };

  const adjustTimestamp = (idx: number, delta: number) => {
    const updated = [...timestamps];
    updated[idx] = Math.max(0, (updated[idx] || 0) + delta);
    setTimestamps(updated);
  };

  const formatLrcTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `[${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}]`;
  };

  const generatedLrc = useMemo(() => {
    let out = `[ti:Zeros Universe Track]\n[ar:Cyber Pulse]\n[al:Neon Horizons]\n\n`;
    lines.forEach((l, idx) => {
      const stamp = timestamps[idx] !== undefined ? formatLrcTime(timestamps[idx]) : "[00:00.00]";
      out += `${stamp}${l}\n`;
    });
    return out;
  }, [lines, timestamps]);

  useEffect(() => {
    setOutput(generatedLrc);
  }, [generatedLrc, setOutput]);

  const handleDownload = () => {
    const blob = new Blob([generatedLrc], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lyrics.lrc";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 bg-accent text-white rounded text-xs font-heading font-semibold flex items-center gap-1.5"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? "Pause Timer" : "Start Playback"}
            </button>
            <span className="text-xs font-mono-code text-accent font-bold">
              ⏱ {formatLrcTime(currentMs)}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={stampCurrentLine}
              className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-heading font-semibold"
            >
              Stamp Line #{activeLine + 1}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-surface border border-border text-text rounded text-xs hover:border-accent"
            >
              Download .LRC
            </button>
          </div>
        </div>

        {/* Karaoke Preview */}
        <div className="bg-background border border-border rounded-lg p-4 space-y-2">
          {lines.map((l, idx) => (
            <div
              key={idx}
              onClick={() => setActiveLine(idx)}
              className={`p-2 rounded cursor-pointer transition-colors flex justify-between items-center text-xs ${
                activeLine === idx
                  ? "bg-accent/20 border border-accent text-accent font-bold"
                  : "hover:bg-surface text-text"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted font-mono-code">
                  {timestamps[idx] !== undefined ? formatLrcTime(timestamps[idx]) : "[--:--.--]"}
                </span>
                <span>{l}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); adjustTimestamp(idx, -100); }}
                  className="px-1.5 py-0.5 bg-surface rounded text-[10px] text-text-muted hover:text-text"
                >
                  -0.1s
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); adjustTimestamp(idx, 100); }}
                  className="px-1.5 py-0.5 bg-surface rounded text-[10px] text-text-muted hover:text-text"
                >
                  +0.1s
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-heading font-semibold text-text uppercase">
          Generated Standard .LRC File Content
        </label>
        <pre className="w-full bg-background border border-border rounded-lg p-3 text-xs font-mono-code text-accent max-h-48 overflow-y-auto">
          {generatedLrc}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 14. M3U8 IPTV PLAYLIST & STREAM URL VALIDATOR
// =========================================================================
export function M3u8PlaylistStreamPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [playlistText, setPlaylistText] = useState(
    `#EXTM3U\n#EXTINF:-1 tvg-id="CNN.us" tvg-name="CNN HD" tvg-logo="https://example.com/cnn.png" group-title="News",CNN International\nhttps://live.example.com/hls/cnn/index.m3u8\n#EXTINF:-1 tvg-id="ESPN.us" tvg-name="ESPN HD" tvg-logo="https://example.com/espn.png" group-title="Sports",ESPN 1 HD\nhttps://live.example.com/hls/espn/stream.m3u8\n#EXTINF:-1 tvg-id="BBC.uk" tvg-name="BBC News" tvg-logo="https://example.com/bbc.png" group-title="News",BBC News Global\nhttps://live.example.com/hls/bbc/index.m3u8\n#EXTINF:-1 tvg-id="HBO.us" tvg-name="HBO East" group-title="Movies",HBO East HD\nhttps://live.example.com/hls/hbo/index.m3u8`
  );
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const parsed = useMemo(() => {
    const lines = playlistText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const channels: any[] = [];
    const groupsSet = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXTINF:")) {
        const inf = lines[i];
        const streamUrl = i + 1 < lines.length && !lines[i + 1].startsWith("#") ? lines[i + 1] : "";

        const nameMatch = inf.match(/,(.+)$/);
        const name = nameMatch ? nameMatch[1].trim() : "Unknown Channel";

        const groupMatch = inf.match(/group-title="([^"]+)"/);
        const group = groupMatch ? groupMatch[1] : "Uncategorized";
        groupsSet.add(group);

        const logoMatch = inf.match(/tvg-logo="([^"]+)"/);
        const logo = logoMatch ? logoMatch[1] : "";

        channels.push({ name, group, logo, streamUrl });
      }
    }

    return {
      channels,
      groups: Array.from(groupsSet),
    };
  }, [playlistText]);

  const filteredChannels = useMemo(() => {
    return parsed.channels.filter((c) => {
      const matchGroup = selectedGroup === "all" || c.group === selectedGroup;
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [parsed, selectedGroup, searchTerm]);

  useEffect(() => {
    setOutput(
      `--- M3U8 Playlist Audit & Channel Index ---\n` +
      `Total Parsed Channels: ${parsed.channels.length}\n` +
      `Categories Found:      ${parsed.groups.join(", ")}\n\n` +
      filteredChannels.map((c) => `[${c.group}] ${c.name} -> ${c.streamUrl}`).join("\n")
    );
  }, [parsed, filteredChannels, setOutput]);

  const downloadFiltered = () => {
    let out = `#EXTM3U\n`;
    filteredChannels.forEach((c) => {
      out += `#EXTINF:-1 group-title="${c.group}" tvg-name="${c.name}",${c.name}\n${c.streamUrl}\n`;
    });
    const blob = new Blob([out], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `playlist_${selectedGroup}.m3u`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-accent" /> Paste Raw M3U / M3U8 Playlist Content
          </span>
          <span className="text-xs text-text-muted">{parsed.channels.length} channels loaded</span>
        </label>
        <textarea
          value={playlistText}
          onChange={(e) => setPlaylistText(e.target.value)}
          rows={5}
          className="w-full bg-background border border-border rounded-lg p-3 text-xs font-mono-code text-text focus:outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-text-muted font-heading">Filter Group:</span>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-surface border border-border rounded px-2.5 py-1 text-xs text-text"
          >
            <option value="all">All Groups ({parsed.channels.length})</option>
            {parsed.groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search channels..."
            className="bg-background border border-border rounded px-2.5 py-1 text-xs text-text font-mono-code"
          />
          <button
            onClick={downloadFiltered}
            className="px-3 py-1 bg-accent text-white rounded text-xs font-heading font-semibold"
          >
            Download Filtered .m3u
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-3 space-y-2">
        <div className="text-xs font-heading font-semibold text-text uppercase">
          Filtered Channels ({filteredChannels.length})
        </div>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pt-1">
          {filteredChannels.map((c, idx) => (
            <div key={idx} className="bg-background p-2.5 rounded border border-border flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-text">{c.name}</span>
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                  {c.group}
                </span>
              </div>
              <span className="text-accent font-mono-code text-[11px] truncate max-w-xs">{c.streamUrl}</span>
            </div>
          ))}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 15. AUDIO FILE SIZE & BITRATE CALCULATOR
// =========================================================================
export function AudioFilesizeBitratePlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [durationMin, setDurationMin] = useState(4);
  const [durationSec, setDurationSec] = useState(30);
  const [sampleRate, setSampleRate] = useState(48000);
  const [bitDepth, setBitDepth] = useState(24);
  const [channels, setChannels] = useState(2); // Stereo

  const calculations = useMemo(() => {
    const totalSec = durationMin * 60 + durationSec;

    // Uncompressed PCM WAV: SampleRate * (BitDepth/8) * Channels * Sec
    const wavBytes = sampleRate * (bitDepth / 8) * channels * totalSec;
    const wavMB = wavBytes / (1024 * 1024);

    // FLAC lossless (~55% ratio)
    const flacMB = wavMB * 0.55;

    // MP3 320 kbps: (320,000 / 8) * Sec
    const mp3_320_MB = (320000 / 8 * totalSec) / (1024 * 1024);

    // MP3 128 kbps
    const mp3_128_MB = (128000 / 8 * totalSec) / (1024 * 1024);

    // AAC 256 kbps
    const aac_256_MB = (256000 / 8 * totalSec) / (1024 * 1024);

    // Opus 96 kbps
    const opus_96_MB = (96000 / 8 * totalSec) / (1024 * 1024);

    return { totalSec, wavMB, flacMB, mp3_320_MB, mp3_128_MB, aac_256_MB, opus_96_MB };
  }, [durationMin, durationSec, sampleRate, bitDepth, channels]);

  useEffect(() => {
    setOutput(
      `--- Audio Format & Storage File Size Estimates ---\n` +
      `Duration:               ${durationMin}m ${durationSec}s (${calculations.totalSec} seconds)\n` +
      `Sample Rate:            ${sampleRate} Hz (${sampleRate / 1000} kHz)\n` +
      `Bit Depth & Channels:   ${bitDepth}-bit, ${channels === 1 ? "Mono" : channels === 2 ? "Stereo" : `${channels} Channels`}\n\n` +
      `Uncompressed WAV/AIFF:  ${calculations.wavMB.toFixed(2)} MB\n` +
      `Lossless FLAC (≈55%):   ${calculations.flacMB.toFixed(2)} MB\n` +
      `MP3 High (320 kbps):    ${calculations.mp3_320_MB.toFixed(2)} MB\n` +
      `AAC Standard (256 kbps): ${calculations.aac_256_MB.toFixed(2)} MB\n` +
      `MP3 Web (128 kbps):     ${calculations.mp3_128_MB.toFixed(2)} MB\n` +
      `Opus Voice (96 kbps):   ${calculations.opus_96_MB.toFixed(2)} MB`
    );
  }, [calculations, durationMin, durationSec, sampleRate, bitDepth, channels, setOutput]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-text-muted block mb-1">Duration (Min):</label>
          <input
            type="number"
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Duration (Sec):</label>
          <input
            type="number"
            value={durationSec}
            onChange={(e) => setDurationSec(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Sample Rate:</label>
          <select
            value={sampleRate}
            onChange={(e) => setSampleRate(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          >
            <option value={44100}>44.1 kHz (CD Audio)</option>
            <option value={48000}>48.0 kHz (Video/Film)</option>
            <option value={96000}>96.0 kHz (Hi-Res Studio)</option>
            <option value={192000}>192.0 kHz (Mastering)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Bit Depth:</label>
          <select
            value={bitDepth}
            onChange={(e) => setBitDepth(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          >
            <option value={16}>16-bit (Standard CD)</option>
            <option value={24}>24-bit (Studio Standard)</option>
            <option value={32}>32-bit Float</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-lg p-3 text-center">
          <div className="text-[11px] text-text-muted font-heading uppercase">Uncompressed WAV</div>
          <div className="text-xl font-bold font-mono-code text-red-400 mt-1">{calculations.wavMB.toFixed(1)} MB</div>
          <div className="text-[10px] text-text-muted mt-0.5">Bit-for-bit lossless</div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-3 text-center">
          <div className="text-[11px] text-text-muted font-heading uppercase">Lossless FLAC</div>
          <div className="text-xl font-bold font-mono-code text-blue-400 mt-1">{calculations.flacMB.toFixed(1)} MB</div>
          <div className="text-[10px] text-text-muted mt-0.5">~45% smaller than WAV</div>
        </div>

        <div className="bg-surface border border-accent rounded-lg p-3 text-center">
          <div className="text-[11px] text-text-muted font-heading uppercase">MP3 (320 kbps)</div>
          <div className="text-xl font-bold font-mono-code text-green-400 mt-1">{calculations.mp3_320_MB.toFixed(1)} MB</div>
          <div className="text-[10px] text-text-muted mt-0.5">High consumer quality</div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 16. FFMPEG HARDCODE SUBTITLE FILTER BUILDER
// =========================================================================
export function FfmpegHardcodeSubtitlePlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [videoFile, setVideoFile] = useState("input.mp4");
  const [subFile, setSubFile] = useState("subtitles.srt");
  const [fontName, setFontName] = useState("Arial");
  const [fontSize, setFontSize] = useState(22);
  const [fontColor, setFontColor] = useState("&H00FFFFFF"); // White in ASS hex
  const [outlineColor, setOutlineColor] = useState("&H00000000"); // Black outline
  const [hardwareAcc, setHardwareAcc] = useState<"none" | "nvenc" | "videotoolbox">("none");

  const command = useMemo(() => {
    let codec = "-c:v libx264 -crf 20";
    if (hardwareAcc === "nvenc") codec = "-c:v h264_nvenc -preset p5";
    else if (hardwareAcc === "videotoolbox") codec = "-c:v h264_videotoolbox -q:v 60";

    const style = `FontName=${fontName},FontSize=${fontSize},PrimaryColour=${fontColor},OutlineColour=${outlineColor},Outline=2,Shadow=1,MarginV=25`;
    const filter = `subtitles='${subFile}':force_style='${style}'`;

    return `ffmpeg -i "${videoFile}" -vf "${filter}" ${codec} -c:a copy "output_burned.mp4"`;
  }, [videoFile, subFile, fontName, fontSize, fontColor, outlineColor, hardwareAcc]);

  useEffect(() => {
    setOutput(command);
  }, [command, setOutput]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-muted block mb-1">Input Video Filename:</label>
          <input
            type="text"
            value={videoFile}
            onChange={(e) => setVideoFile(e.target.value)}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Subtitle Filename (.srt / .ass):</label>
          <input
            type="text"
            value={subFile}
            onChange={(e) => setSubFile(e.target.value)}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-text-muted block mb-1">Font Family:</label>
          <select
            value={fontName}
            onChange={(e) => setFontName(e.target.value)}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          >
            <option value="Arial">Arial</option>
            <option value="Roboto">Roboto</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Montserrat">Montserrat</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Font Size: {fontSize}px</label>
          <input
            type="range"
            min="16"
            max="40"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Text Color:</label>
          <select
            value={fontColor}
            onChange={(e) => setFontColor(e.target.value)}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          >
            <option value="&H00FFFFFF">White</option>
            <option value="&H0000FFFF">Yellow (&H0000FFFF)</option>
            <option value="&H00FFFF00">Cyan</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Hardware Acceleration:</label>
          <select
            value={hardwareAcc}
            onChange={(e: any) => setHardwareAcc(e.target.value)}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          >
            <option value="none">CPU (libx264)</option>
            <option value="nvenc">NVIDIA NVENC</option>
            <option value="videotoolbox">Apple Silicon</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-heading font-semibold text-text uppercase">
          Production FFmpeg Subtitle Burn-In CLI
        </label>
        <pre className="w-full bg-background border border-border rounded-lg p-4 text-xs font-mono-code text-accent whitespace-pre-wrap break-all">
          {command}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 17. AI LLM TIME-TO-FIRST-TOKEN (TTFT) CALCULATOR
// =========================================================================
export function LlmTtftThroughputPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [modelParams, setModelParams] = useState(8); // 8 Billion
  const [gpuBandwidth, setGpuBandwidth] = useState(1008); // RTX 4090 (1008 GB/s)
  const [quantBits, setQuantBits] = useState(4); // 4-bit Q4
  const [promptTokens, setPromptTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(300);

  const metrics = useMemo(() => {
    // Model weight size in GB = Params * (quantBits / 8)
    const weightGB = modelParams * (quantBits / 8);

    // Autoregressive decode phase: Every generated token transfers full weights across memory bus once
    // Tokens per second = GPU Memory Bandwidth (GB/s) / Weight Size (GB)
    const rawTokensPerSec = gpuBandwidth / (weightGB || 1);
    const tokensPerSec = Math.min(250, Math.max(1, rawTokensPerSec * 0.75)); // 75% practical bus utilization

    // Time to First Token (TTFT) prefill latency (approximate based on prompt tokens and compute)
    const ttftMs = Math.max(25, (promptTokens / 1000) * (modelParams / 8) * 45);

    // Inter-Token Latency (ITL)
    const itlMs = 1000 / tokensPerSec;

    // Total Generation Time
    const totalSec = (ttftMs / 1000) + (outputTokens / tokensPerSec);

    return { weightGB, tokensPerSec, ttftMs, itlMs, totalSec };
  }, [modelParams, gpuBandwidth, quantBits, promptTokens, outputTokens]);

  useEffect(() => {
    setOutput(
      `--- LLM Inference Latency & Throughput Estimate ---\n` +
      `Model Architecture:    ${modelParams}B Parameters (${quantBits}-bit Quantization)\n` +
      `Model Weights in VRAM: ${metrics.weightGB.toFixed(1)} GB\n` +
      `GPU Memory Bandwidth:  ${gpuBandwidth} GB/s\n\n` +
      `Estimated TTFT:        ${metrics.ttftMs.toFixed(0)} ms (Prefill Latency)\n` +
      `Decoding Throughput:   ${metrics.tokensPerSec.toFixed(1)} tokens/sec\n` +
      `Inter-Token Latency:   ${metrics.itlMs.toFixed(1)} ms/token\n` +
      `Total Response Time:   ${metrics.totalSec.toFixed(2)} seconds (${promptTokens} in, ${outputTokens} out)`
    );
  }, [metrics, modelParams, gpuBandwidth, quantBits, promptTokens, outputTokens, setOutput]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-text-muted block mb-1">Model Size:</label>
          <select
            value={modelParams}
            onChange={(e) => setModelParams(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          >
            <option value={8}>8B (Llama 3.1 / Mistral)</option>
            <option value={14}>14B (Qwen 2.5)</option>
            <option value={32}>32B (Qwen 2.5 32B)</option>
            <option value={70}>70B (Llama 3.3)</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-text-muted block mb-1">GPU Accelerator:</label>
          <select
            value={gpuBandwidth}
            onChange={(e) => setGpuBandwidth(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          >
            <option value={1008}>RTX 4090 (1,008 GB/s)</option>
            <option value={1792}>RTX 5090 (1,792 GB/s)</option>
            <option value={2039}>NVIDIA A100 (2,039 GB/s)</option>
            <option value={3350}>NVIDIA H100 (3,350 GB/s)</option>
            <option value={546}>Apple M4 Max (546 GB/s)</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-text-muted block mb-1">Quantization:</label>
          <select
            value={quantBits}
            onChange={(e) => setQuantBits(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          >
            <option value={4}>4-bit (Q4_K_M)</option>
            <option value={8}>8-bit (Q8_0)</option>
            <option value={16}>16-bit (FP16 Unquantized)</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-text-muted block mb-1">Output Tokens: {outputTokens}</label>
          <input
            type="range"
            min="50"
            max="2000"
            step="50"
            value={outputTokens}
            onChange={(e) => setOutputTokens(Number(e.target.value))}
            className="w-full accent-accent mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="text-[10px] text-text-muted uppercase">Time-To-First-Token (TTFT)</div>
          <div className="text-xl font-bold font-mono-code text-accent mt-1">{metrics.ttftMs.toFixed(0)} ms</div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="text-[10px] text-text-muted uppercase">Decoding Speed</div>
          <div className="text-xl font-bold font-mono-code text-green-400 mt-1">{metrics.tokensPerSec.toFixed(1)} t/s</div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="text-[10px] text-text-muted uppercase">Inter-Token Latency</div>
          <div className="text-xl font-bold font-mono-code text-text mt-1">{metrics.itlMs.toFixed(1)} ms</div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="text-[10px] text-text-muted uppercase">Total Turn Time</div>
          <div className="text-xl font-bold font-mono-code text-text mt-1">{metrics.totalSec.toFixed(2)}s</div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 18. BUSINESS AUTOMATION HOURS SAVED & ROI CALCULATOR
// =========================================================================
export function BusinessAutomationRoiPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [teamSize, setTeamSize] = useState(5);
  const [hourlyWage, setHourlyWage] = useState(45);
  const [manualHoursPerWeek, setManualHoursPerWeek] = useState(8);
  const [monthlyToolCost, setMonthlyToolCost] = useState(250);
  const [oneTimeSetupCost, setOneTimeSetupCost] = useState(1500);

  const roi = useMemo(() => {
    const annualManualHours = teamSize * manualHoursPerWeek * 52;
    const annualLaborSavings = annualManualHours * hourlyWage;
    const annualToolCosts = monthlyToolCost * 12 + oneTimeSetupCost;
    const netAnnualSavings = Math.max(0, annualLaborSavings - annualToolCosts);
    const roiPercentage = ((netAnnualSavings / (annualToolCosts || 1)) * 100);
    const paybackMonths = (oneTimeSetupCost / ((annualLaborSavings / 12) - monthlyToolCost || 1));

    return {
      annualManualHours,
      annualLaborSavings,
      annualToolCosts,
      netAnnualSavings,
      roiPercentage,
      paybackMonths: Math.max(0.1, paybackMonths),
    };
  }, [teamSize, hourlyWage, manualHoursPerWeek, monthlyToolCost, oneTimeSetupCost]);

  useEffect(() => {
    setOutput(
      `--- Business Automation ROI & Savings Report ---\n` +
      `Impacted Team Size:     ${teamSize} employees\n` +
      `Recovered Labor Hours:  ${roi.annualManualHours.toLocaleString()} hours/year\n` +
      `Gross Labor Savings:    $${roi.annualLaborSavings.toLocaleString()}/year\n` +
      `Tool & Setup Costs:     $${roi.annualToolCosts.toLocaleString()}/year\n\n` +
      `Net Annual Savings:     $${roi.netAnnualSavings.toLocaleString()}/year\n` +
      `Net Automation ROI:     +${roi.roiPercentage.toFixed(0)}%\n` +
      `Estimated Payback Time: ${roi.paybackMonths.toFixed(1)} months`
    );
  }, [roi, teamSize, setOutput]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-text-muted block mb-1">Team Size (People):</label>
          <input
            type="number"
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Hourly Wage ($/hr):</label>
          <input
            type="number"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Manual Hours/Wk per Person:</label>
          <input
            type="number"
            value={manualHoursPerWeek}
            onChange={(e) => setManualHoursPerWeek(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-muted block mb-1">Monthly Tool/API Cost ($):</label>
          <input
            type="number"
            value={monthlyToolCost}
            onChange={(e) => setMonthlyToolCost(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">One-Time Setup Cost ($):</label>
          <input
            type="number"
            value={oneTimeSetupCost}
            onChange={(e) => setOneTimeSetupCost(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="text-[10px] text-text-muted uppercase">Recovered Time</div>
          <div className="text-xl font-bold font-mono-code text-accent mt-1">
            {roi.annualManualHours.toLocaleString()} hrs
          </div>
        </div>

        <div className="bg-surface border-2 border-accent rounded-lg p-3">
          <div className="text-[10px] text-text-muted uppercase">Net Annual Savings</div>
          <div className="text-2xl font-bold font-mono-code text-green-400 mt-1">
            ${roi.netAnnualSavings.toLocaleString()}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="text-[10px] text-text-muted uppercase">ROI & Payback</div>
          <div className="text-xl font-bold font-mono-code text-accent mt-1">
            +{roi.roiPercentage.toFixed(0)}% ({roi.paybackMonths.toFixed(1)} mo)
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 19. DIGITAL PAYMENT GATEWAY FEE COMPARATOR
// =========================================================================
export function PaymentGatewayFeePlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [aov, setAov] = useState(50); // Average Order Value
  const [ordersPerMonth, setOrdersPerMonth] = useState(1000);
  const [isInternational, setIsInternational] = useState(false);

  const comparison = useMemo(() => {
    const grossVolume = aov * ordersPerMonth;

    // Stripe: 2.9% + $0.30 (Domestic) / +1.5% Int
    const stripeRate = isInternational ? 0.044 : 0.029;
    const stripeFee = ordersPerMonth * (aov * stripeRate + 0.30);

    // PayPal: 3.49% + $0.49 (Domestic) / +1.5% Int
    const paypalRate = isInternational ? 0.0499 : 0.0349;
    const paypalFee = ordersPerMonth * (aov * paypalRate + 0.49);

    // Razorpay: 2.0% (Domestic) / 3.0% Int
    const razorpayRate = isInternational ? 0.03 : 0.02;
    const razorpayFee = ordersPerMonth * (aov * razorpayRate);

    // Crypto Stablecoin Rails: 0.1% + $0.005 network fee
    const cryptoFee = ordersPerMonth * (aov * 0.001 + 0.005);

    return {
      grossVolume,
      stripe: { fee: stripeFee, net: grossVolume - stripeFee, effective: (stripeFee / grossVolume) * 100 },
      paypal: { fee: paypalFee, net: grossVolume - paypalFee, effective: (paypalFee / grossVolume) * 100 },
      razorpay: { fee: razorpayFee, net: grossVolume - razorpayFee, effective: (razorpayFee / grossVolume) * 100 },
      crypto: { fee: cryptoFee, net: grossVolume - cryptoFee, effective: (cryptoFee / grossVolume) * 100 },
    };
  }, [aov, ordersPerMonth, isInternational]);

  useEffect(() => {
    setOutput(
      `--- Payment Gateway Fee Comparison (${isInternational ? "International Cards" : "Domestic Cards"}) ---\n` +
      `Gross Sales Volume:    $${comparison.grossVolume.toLocaleString()} (${ordersPerMonth} orders @ $${aov})\n\n` +
      `Stripe Total Fees:     $${comparison.stripe.fee.toFixed(2)} (${comparison.stripe.effective.toFixed(2)}% effective) -> Net: $${comparison.stripe.net.toFixed(2)}\n` +
      `PayPal Total Fees:     $${comparison.paypal.fee.toFixed(2)} (${comparison.paypal.effective.toFixed(2)}% effective) -> Net: $${comparison.paypal.net.toFixed(2)}\n` +
      `Razorpay Total Fees:   $${comparison.razorpay.fee.toFixed(2)} (${comparison.razorpay.effective.toFixed(2)}% effective) -> Net: $${comparison.razorpay.net.toFixed(2)}\n` +
      `Crypto Rails (USDC):   $${comparison.crypto.fee.toFixed(2)} (${comparison.crypto.effective.toFixed(2)}% effective) -> Net: $${comparison.crypto.net.toFixed(2)}`
    );
  }, [comparison, aov, ordersPerMonth, isInternational, setOutput]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-text-muted block mb-1">Average Order Value ($):</label>
          <input
            type="number"
            value={aov}
            onChange={(e) => setAov(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Monthly Order Count:</label>
          <input
            type="number"
            value={ordersPerMonth}
            onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          />
        </div>
        <div className="flex items-center pt-5">
          <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
            <input
              type="checkbox"
              checked={isInternational}
              onChange={(e) => setIsInternational(e.target.checked)}
              className="accent-accent"
            />
            International Cross-Border Cards (+1.5%)
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="text-xs font-heading font-semibold text-text">Stripe</div>
          <div className="text-lg font-bold font-mono-code text-accent mt-1">
            ${comparison.stripe.fee.toFixed(0)}
          </div>
          <div className="text-[10px] text-text-muted">{comparison.stripe.effective.toFixed(2)}% effective</div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="text-xs font-heading font-semibold text-text">PayPal</div>
          <div className="text-lg font-bold font-mono-code text-red-400 mt-1">
            ${comparison.paypal.fee.toFixed(0)}
          </div>
          <div className="text-[10px] text-text-muted">{comparison.paypal.effective.toFixed(2)}% effective</div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="text-xs font-heading font-semibold text-text">Razorpay</div>
          <div className="text-lg font-bold font-mono-code text-blue-400 mt-1">
            ${comparison.razorpay.fee.toFixed(0)}
          </div>
          <div className="text-[10px] text-text-muted">{comparison.razorpay.effective.toFixed(2)}% effective</div>
        </div>

        <div className="bg-surface border border-green-500 rounded-lg p-3">
          <div className="text-xs font-heading font-semibold text-text">Crypto Rails</div>
          <div className="text-lg font-bold font-mono-code text-green-400 mt-1">
            ${comparison.crypto.fee.toFixed(0)}
          </div>
          <div className="text-[10px] text-green-400 font-semibold">{comparison.crypto.effective.toFixed(2)}% effective</div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 20. FESTIVE & MYTHOLOGICAL AI ART PROMPT ARCHITECT
// =========================================================================
export function FestiveAiArtPromptPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [festivalTheme, setFestivalTheme] = useState("dussehra");
  const [artStyle, setArtStyle] = useState("cinematic");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [lighting, setLighting] = useState("golden_hour");

  const promptResult = useMemo(() => {
    let subject = "Lord Rama drawing a celestial glowing bow of golden energy, piercing through the dark stormy skies to defeat Ravana's darkness";
    if (festivalTheme === "diwali") {
      subject = "Ethereal traditional celebration of Diwali, intricate terracotta Diya lamps glowing on ornate temple steps, floating marigold blossoms";
    } else if (festivalTheme === "warrior") {
      subject = "Majestic ancient warrior avatar in golden armor, radiant third eye glow, standing atop a sacred Himalayan mountain peak";
    } else if (festivalTheme === "temple") {
      subject = "Ancient Dravidian stone temple carved into a sacred mountain cliff, surrounded by glowing bonfires, sacred incense smoke";
    }

    let styleDesc = "8K hyperrealistic Unreal Engine 5 render, cinematic volumetric lighting, ray tracing, sharp focus, 85mm portrait lens";
    if (artStyle === "clay") {
      styleDesc = "3D cute Pixar claymation style, tactile stop-motion clay texture, soft studio lighting, charming aesthetic miniature";
    } else if (artStyle === "oil") {
      styleDesc = "Classical Indian miniature oil painting, gold leaf accents, rich crimson and saffron pigments, brush stroke texture";
    } else if (artStyle === "cyber") {
      styleDesc = "Cyberpunk mythological neon aesthetic, holographic sacred geometry, glowing cyan and magenta runes";
    }

    let lightDesc = "golden hour warm sunlight piercing through soft morning mist";
    if (lighting === "fireworks") lightDesc = "illuminated by dazzling festival fireworks in the night sky, vibrant amber and ruby flares";
    else if (lighting === "spiritual") lightDesc = "sacred ethereal divine aura radiating celestial white and amber light";

    const prompt = `${subject}, ${styleDesc}, ${lightDesc}, masterpiece, ultra-detailed --ar ${aspectRatio} --v 7 --stylize 250`;
    const negative = "blurry, low quality, distorted anatomy, extra limbs, ugly, oversaturated, deformed hands";

    return { prompt, negative };
  }, [festivalTheme, artStyle, aspectRatio, lighting]);

  useEffect(() => {
    setOutput(
      `--- Festive AI Image Prompt (Midjourney / Flux) ---\n` +
      `Prompt:\n${promptResult.prompt}\n\n` +
      `Negative Prompt:\n${promptResult.negative}`
    );
  }, [promptResult, setOutput]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-text-muted block mb-1">Theme / Event:</label>
          <select
            value={festivalTheme}
            onChange={(e) => setFestivalTheme(e.target.value)}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          >
            <option value="dussehra">Dussehra / Vijayadashami</option>
            <option value="diwali">Diwali Festival of Lights</option>
            <option value="warrior">Celestial Mythic Warrior</option>
            <option value="temple">Ancient Sacred Temple</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-text-muted block mb-1">Visual Art Style:</label>
          <select
            value={artStyle}
            onChange={(e) => setArtStyle(e.target.value)}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          >
            <option value="cinematic">8K Cinematic UE5</option>
            <option value="clay">3D Cute Claymation</option>
            <option value="oil">Classical Oil Painting</option>
            <option value="cyber">Cyberpunk Mythic</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-text-muted block mb-1">Lighting Atmosphere:</label>
          <select
            value={lighting}
            onChange={(e) => setLighting(e.target.value)}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          >
            <option value="golden_hour">Golden Hour Warm Glow</option>
            <option value="fireworks">Night Fireworks & Flares</option>
            <option value="spiritual">Divine Sacred Aura</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-text-muted block mb-1">Aspect Ratio:</label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="w-full bg-background border border-border rounded p-2 text-xs font-mono-code text-text"
          >
            <option value="16:9">16:9 (Landscape Banner)</option>
            <option value="9:16">9:16 (Story / Reel)</option>
            <option value="1:1">1:1 (Square Feed)</option>
            <option value="4:5">4:5 (Portrait Post)</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-heading font-semibold text-text uppercase">
            Optimized Positive Prompt (Midjourney v7 / Flux.1)
          </label>
          <pre className="w-full bg-background border border-border rounded-lg p-3 text-xs font-mono-code text-accent whitespace-pre-wrap">
            {promptResult.prompt}
          </pre>
        </div>

        <div>
          <label className="text-xs font-heading font-semibold text-text-muted uppercase">
            Negative Prompt
          </label>
          <pre className="w-full bg-background border border-border rounded-lg p-3 text-xs font-mono-code text-text-muted whitespace-pre-wrap">
            {promptResult.negative}
          </pre>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// Export Map for Wave 8 Media, AI & Apps
export const wave8MediaAiAppsPlaygrounds: Record<string, React.ComponentType<{ tool: Tool }>> = {
  "virtual-phone-number-routing-inspector": VirtualPhoneNumberRoutingPlayground,
  "screen-time-family-contract-builder": ScreenTimeFamilyContractPlayground,
  "lrc-lyrics-timestamp-studio": LrcLyricsTimestampPlayground,
  "m3u8-playlist-stream-parser": M3u8PlaylistStreamPlayground,
  "audio-filesize-bitrate-calculator": AudioFilesizeBitratePlayground,
  "ffmpeg-hardcode-subtitle-builder": FfmpegHardcodeSubtitlePlayground,
  "llm-ttft-throughput-calculator": LlmTtftThroughputPlayground,
  "business-automation-roi-calculator": BusinessAutomationRoiPlayground,
  "payment-gateway-fee-comparator": PaymentGatewayFeePlayground,
  "festive-ai-art-prompt-generator": FestiveAiArtPromptPlayground,
};

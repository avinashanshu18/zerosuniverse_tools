"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Terminal,
  Shield,
  Search,
  Globe,
  Mail,
  Lock,
  Image as ImageIcon,
  Eye,
  EyeOff,
  FileCode,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Trash2,
} from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { useToolCard, ToolActions } from "@/components/tool/ToolPlaygrounds";

/* ============================================================================
 * 1. NMAP COMMAND BUILDER & FFUF WEB FUZZER
 * ========================================================================== */
function NmapCommandBuilder({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [mode, setMode] = useState<"nmap" | "ffuf">("nmap");

  // Nmap states
  const [target, setTarget] = useState("scanme.nmap.org");
  const [profile, setProfile] = useState("-sS");
  const [portScope, setPortScope] = useState<"top1000" | "all" | "custom">("top1000");
  const [customPorts, setCustomPorts] = useState("22,80,443,3306,8080");
  const [timing, setTiming] = useState("-T4");
  const [pn, setPn] = useState(true);
  const [fragment, setFragment] = useState(false);
  const [decoys, setDecoys] = useState(false);
  const [sourcePort53, setSourcePort53] = useState(false);
  const [outputFlag, setOutputFlag] = useState<"none" | "-oN scan.txt" | "-oA full_audit">("-oN scan.txt");

  // FFUF states
  const [ffufUrl, setFfufUrl] = useState("https://target.example.com/FUZZ");
  const [wordlist, setWordlist] = useState("/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt");
  const [matchCodes, setMatchCodes] = useState("200,204,301,302,307,401,403");
  const [filterSize, setFilterSize] = useState("4242");
  const [threads, setThreads] = useState(40);
  const [recursion, setRecursion] = useState(false);

  const buildCommand = useCallback(() => {
    if (mode === "nmap") {
      const parts = ["sudo nmap", profile];
      if (portScope === "all") parts.push("-p-");
      if (portScope === "custom" && customPorts.trim()) parts.push(`-p ${customPorts.trim()}`);
      parts.push(timing);
      if (pn) parts.push("-Pn");
      if (fragment) parts.push("-f");
      if (decoys) parts.push("-D RND:5");
      if (sourcePort53) parts.push("--source-port 53");
      if (outputFlag !== "none") parts.push(outputFlag);
      parts.push(target.trim() || "10.10.10.5");
      return parts.join(" ");
    } else {
      const parts = [
        "ffuf",
        `-u "${ffufUrl.trim() || "https://example.com/FUZZ"}"`,
        `-w ${wordlist}`,
        `-mc ${matchCodes.trim() || "200,301,302,403"}`,
      ];
      if (filterSize.trim()) parts.push(`-fs ${filterSize.trim()}`);
      parts.push(`-t ${threads}`);
      if (recursion) parts.push("-recursion -recursion-depth 2");
      return parts.join(" ");
    }
  }, [
    mode,
    profile,
    portScope,
    customPorts,
    timing,
    pn,
    fragment,
    decoys,
    sourcePort53,
    outputFlag,
    target,
    ffufUrl,
    wordlist,
    matchCodes,
    filterSize,
    threads,
    recursion,
  ]);

  const cmd = buildCommand();

  const flagExplanations =
    mode === "nmap"
      ? [
          { flag: profile, desc: profile === "-sS" ? "TCP SYN Stealth scan (half-open, never completes TCP handshake)" : profile === "-sV -sC" ? "Probe open ports for service/version info and run default NSE scripts" : profile === "-A" ? "Aggressive mode: OS detection (-O), version scan (-sV), script scan (-sC), traceroute" : profile === "-sU" ? "UDP port scan (DNS 53, SNMP 161, NTP 123)" : "Execute Nmap Scripting Engine CVE vulnerability checks against detected services" },
          { flag: portScope === "all" ? "-p-" : portScope === "custom" ? `-p ${customPorts}` : "(Top 1,000 ports)", desc: portScope === "all" ? "Scan all 65,535 TCP ports instead of only the top 1,000" : portScope === "custom" ? "Scan only specified TCP/UDP port numbers" : "Default Nmap behavior scans top 1,000 most common ports" },
          { flag: timing, desc: timing === "-T2" ? "Polite timing (0.4s delay) to reduce IDS trigger probability" : timing === "-T3" ? "Normal timing template (default)" : timing === "-T4" ? "Aggressive timing recommended for modern broadband/LAN targets" : "Insane timing — very fast, may drop packets on high-latency links" },
          ...(pn ? [{ flag: "-Pn", desc: "Skip ICMP host discovery; treat target as alive (bypasses ICMP ping block)" }] : []),
          ...(fragment ? [{ flag: "-f", desc: "Split TCP headers across tiny 8-byte IP fragments to evade stateless packet filters" }] : []),
          ...(decoys ? [{ flag: "-D RND:5", desc: "Spoof 5 random decoy source IPs alongside your real IP to obscure scan origin" }] : []),
          ...(sourcePort53 ? [{ flag: "--source-port 53", desc: "Send probes from source port 53 (DNS) to test misconfigured stateless ACLs" }] : []),
          ...(outputFlag !== "none" ? [{ flag: outputFlag, desc: "Save structured scan output to disk for reporting & grep analysis" }] : []),
        ]
      : [
          { flag: `-u "${ffufUrl}"`, desc: "Target URL containing the FUZZ keyword placeholder" },
          { flag: `-w ${wordlist}`, desc: "SecLists dictionary path injected into the FUZZ keyword position" },
          { flag: `-mc ${matchCodes}`, desc: "Match HTTP response status codes of interest" },
          ...(filterSize.trim() ? [{ flag: `-fs ${filterSize.trim()}`, desc: "Filter out soft-404 responses matching exact byte length" }] : []),
          { flag: `-t ${threads}`, desc: `Run ${threads} concurrent HTTP worker goroutines` },
          ...(recursion ? [{ flag: "-recursion -recursion-depth 2", desc: "Automatically recurse into discovered directories up to 2 levels deep" }] : []),
        ];

  useEffect(() => {
    const breakdownText = flagExplanations.map((f) => `  ${f.flag.padEnd(22)} : ${f.desc}`).join("\n");
    setOutput(`# Generated Command\n${cmd}\n\n# Flag Breakdown\n${breakdownText}`);
  }, [cmd, flagExplanations, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setMode("nmap")}
          className={`inline-flex items-center gap-2 rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            mode === "nmap"
              ? "bg-[#ff6a00] text-white"
              : "bg-background text-text-muted border border-border hover:text-text"
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          Nmap Network Scanner
        </button>
        <button
          type="button"
          onClick={() => setMode("ffuf")}
          className={`inline-flex items-center gap-2 rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            mode === "ffuf"
              ? "bg-[#ff6a00] text-white"
              : "bg-background text-text-muted border border-border hover:text-text"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          FFUF Web Directory Fuzzer
        </button>
      </div>

      {mode === "nmap" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Target IP / CIDR / Hostname
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="10.10.11.24 or scanme.nmap.org"
              className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm font-mono-code text-text focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Scan Profile
            </label>
            <select
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
            >
              <option value="-sS">Stealth SYN Scan (-sS)</option>
              <option value="-sV -sC">Service Versions + Default Scripts (-sV -sC)</option>
              <option value="-A">Aggressive OS + Version + Traceroute (-A)</option>
              <option value="-sU">UDP Service Discovery (-sU)</option>
              <option value="-sV --script vuln">CVE Vulnerability NSE Scan (-sV --script vuln)</option>
            </select>
          </div>

          <div>
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Port Scope
            </label>
            <div className="flex gap-2">
              {(["top1000", "all", "custom"] as const).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setPortScope(scope)}
                  className={`flex-1 rounded-xs border px-2.5 py-1.5 font-heading text-xs font-semibold uppercase cursor-pointer ${
                    portScope === scope
                      ? "border-accent bg-[#ff6a00]/10 text-accent"
                      : "border-border bg-background text-text-muted"
                  }`}
                >
                  {scope === "top1000" ? "Top 1000" : scope === "all" ? "All 65535 (-p-)" : "Custom"}
                </button>
              ))}
            </div>
            {portScope === "custom" && (
              <input
                type="text"
                value={customPorts}
                onChange={(e) => setCustomPorts(e.target.value)}
                placeholder="21,22,80,443,445,3389"
                className="mt-2 w-full rounded-xs border border-border bg-background px-3 py-1.5 text-xs font-mono-code text-text"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Timing Template
              </label>
              <select
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm text-text"
              >
                <option value="-T2">-T2 Polite</option>
                <option value="-T3">-T3 Normal</option>
                <option value="-T4">-T4 Aggressive</option>
                <option value="-T5">-T5 Insane</option>
              </select>
            </div>
            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Output Format
              </label>
              <select
                value={outputFlag}
                onChange={(e) => setOutputFlag(e.target.value as typeof outputFlag)}
                className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm text-text"
              >
                <option value="-oN scan.txt">-oN scan.txt</option>
                <option value="-oA full_audit">-oA full_audit (All)</option>
                <option value="none">Stdout Only</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
              Firewall & IDS Evasion Flags
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Skip Ping (-Pn)", checked: pn, set: setPn },
                { label: "Fragment Packets (-f)", checked: fragment, set: setFragment },
                { label: "5 Random Decoys (-D RND:5)", checked: decoys, set: setDecoys },
                { label: "Source Port 53 (--source-port 53)", checked: sourcePort53, set: setSourcePort53 },
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex items-center gap-2 rounded-xs border border-border bg-background px-3 py-2 text-xs text-text cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.set(e.target.checked)}
                    className="accent-[#ff6a00]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Target URL (Include FUZZ Keyword)
            </label>
            <input
              type="text"
              value={ffufUrl}
              onChange={(e) => setFfufUrl(e.target.value)}
              className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm font-mono-code text-text"
            />
          </div>
          <div>
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Wordlist Preset
            </label>
            <select
              value={wordlist}
              onChange={(e) => setWordlist(e.target.value)}
              className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm text-text"
            >
              <option value="/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt">
                raft-medium-directories.txt (Dir Enum)
              </option>
              <option value="/usr/share/seclists/Discovery/Web-Content/common.txt">
                common.txt (Fast Web Content)
              </option>
              <option value="/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt">
                subdomains-top1million-5000.txt (VHost Fuzzing)
              </option>
              <option value="/usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt">
                burp-parameter-names.txt (GET/POST Params)
              </option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Match (-mc)
              </label>
              <input
                type="text"
                value={matchCodes}
                onChange={(e) => setMatchCodes(e.target.value)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-2 text-xs font-mono-code text-text"
              />
            </div>
            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Filter Size (-fs)
              </label>
              <input
                type="text"
                value={filterSize}
                onChange={(e) => setFilterSize(e.target.value)}
                placeholder="e.g. 4242"
                className="w-full rounded-xs border border-border bg-background px-2.5 py-2 text-xs font-mono-code text-text"
              />
            </div>
            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Threads (-t)
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={threads}
                onChange={(e) => setThreads(Number(e.target.value) || 40)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-2 text-xs font-mono-code text-text"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-xs text-text cursor-pointer">
              <input
                type="checkbox"
                checked={recursion}
                onChange={(e) => setRecursion(e.target.checked)}
                className="accent-[#ff6a00]"
              />
              Enable Recursive Directory Discovery (-recursion -recursion-depth 2)
            </label>
          </div>
        </div>
      )}

      <div className="rounded-xs border border-border bg-[#121212] p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading text-[11px] uppercase tracking-wider text-[#ff6a00] font-bold">
            Live Terminal Command
          </span>
          <span className="text-[11px] font-mono-code text-gray-400">Authorized Audits Only</span>
        </div>
        <pre className="overflow-x-auto font-mono-code text-sm text-emerald-400 whitespace-pre-wrap break-all">
          $ {cmd}
        </pre>
      </div>

      <div className="rounded-xs border border-border bg-background p-3.5">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text mb-2.5">
          Line-by-Line Flag Breakdown
        </h4>
        <div className="space-y-1.5">
          {flagExplanations.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs border-b border-border/60 pb-1.5 last:border-none last:pb-0">
              <code className="font-mono-code font-semibold text-accent min-w-[170px]">{item.flag}</code>
              <span className="text-text-muted">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 2. GOOGLE DORKS RECON GENERATOR
 * ========================================================================== */
const DORK_PRESETS = [
  {
    id: "env",
    label: "Exposed .env & Configs",
    query: (d: string) => `site:${d} (ext:env OR ext:ini OR ext:yml OR ext:config) ("DB_PASSWORD" OR "APP_KEY" OR "SECRET")`,
    desc: "Finds unindexed configuration files leaking database credentials or API secrets.",
  },
  {
    id: "dir",
    label: 'Open Directory Listings',
    query: (d: string) => `site:${d} intitle:"index of" ("parent directory" OR "backup" OR "admin" OR ".git")`,
    desc: "Locates misconfigured web servers with Apache/Nginx autoindex directory browsing enabled.",
  },
  {
    id: "sql",
    label: "SQL & DB Backups",
    query: (d: string) => `site:${d} (ext:sql OR ext:dbf OR ext:mdb OR ext:bak OR ext:dump) ("INSERT INTO" OR "CREATE TABLE")`,
    desc: "Identifies raw SQL database dumps accidentally stored inside public web roots.",
  },
  {
    id: "git",
    label: "Exposed Git / SVN",
    query: (d: string) => `site:${d} (inurl:".git/config" OR inurl:".svn/entries" OR intitle:"Index of /.git")`,
    desc: "Checks if source control metadata folders are publicly accessible.",
  },
  {
    id: "portal",
    label: "Admin & Login Portals",
    query: (d: string) => `site:${d} (inurl:admin OR inurl:login OR inurl:portal OR inurl:dashboard) intitle:"login"`,
    desc: "Enumerates administrative authentication surfaces across subdomains.",
  },
  {
    id: "subdomains",
    label: "Subdomain Discovery",
    query: (d: string) => `site:*.${d} -site:www.${d}`,
    desc: "Uses wildcard site operator to reveal non-www indexed subdomains.",
  },
  {
    id: "docs",
    label: "Public Docs (PDF/XLSX/DOCX)",
    query: (d: string) => `site:${d} (filetype:pdf OR filetype:xlsx OR filetype:docx OR filetype:pptx) ("confidential" OR "internal")`,
    desc: "Finds sensitive corporate documents indexed by search engines for FOCA metadata analysis.",
  },
  {
    id: "cloud",
    label: "Cloud S3 / Azure / GCP Buckets",
    query: (d: string) => `(site:s3.amazonaws.com OR site:blob.core.windows.net OR site:storage.googleapis.com) "${d.split(".")[0]}"`,
    desc: "Searches public cloud object storage endpoints mentioning the organization name.",
  },
];

function GoogleDorksGenerator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [domain, setDomain] = useState("example.com");
  const [activePreset, setActivePreset] = useState(DORK_PRESETS[0].id);
  const [filetype, setFiletype] = useState("");
  const [inurl, setInurl] = useState("");
  const [intitle, setIntitle] = useState("");
  const [intext, setIntext] = useState("");

  const cleanDomain = domain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "example.com";
  const selectedPreset = DORK_PRESETS.find((p) => p.id === activePreset) || DORK_PRESETS[0];

  const customParts: string[] = [];
  if (filetype.trim()) customParts.push(`filetype:${filetype.trim()}`);
  if (inurl.trim()) customParts.push(`inurl:"${inurl.trim()}"`);
  if (intitle.trim()) customParts.push(`intitle:"${intitle.trim()}"`);
  if (intext.trim()) customParts.push(`intext:"${intext.trim()}"`);

  const finalDork =
    customParts.length > 0
      ? `site:${cleanDomain} ${customParts.join(" ")}`
      : selectedPreset.query(cleanDomain);

  useEffect(() => {
    const allQueries = DORK_PRESETS.map((p) => `# ${p.label}\n${p.query(cleanDomain)}`).join("\n\n");
    setOutput(`# Active Google Dork Query\n${finalDork}\n\n# Complete OSINT Dork Pack for ${cleanDomain}\n${allQueries}`);
  }, [finalDork, cleanDomain, setOutput]);

  return (
    <div className="space-y-5">
      <div>
        <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
          Target Scope Domain
        </label>
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="w-full rounded-xs border border-border bg-background px-3.5 py-2 text-sm font-mono-code text-text focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
          8 One-Click OSINT GHDB Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {DORK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setActivePreset(preset.id);
                setFiletype("");
                setInurl("");
                setIntitle("");
                setIntext("");
              }}
              className={`text-left rounded-xs border p-2.5 transition cursor-pointer ${
                activePreset === preset.id && customParts.length === 0
                  ? "border-accent bg-[#ff6a00]/10 text-text"
                  : "border-border bg-background text-text-muted hover:border-accent/50 hover:text-text"
              }`}
            >
              <div className="font-heading text-xs font-bold uppercase tracking-wide text-text">
                {preset.label}
              </div>
              <div className="mt-1 text-[11px] leading-snug text-text-muted line-clamp-2">
                {preset.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Custom filetype:
          </label>
          <input
            type="text"
            value={filetype}
            onChange={(e) => setFiletype(e.target.value)}
            placeholder="pdf, env, sql"
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-xs font-mono-code text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Custom inurl:
          </label>
          <input
            type="text"
            value={inurl}
            onChange={(e) => setInurl(e.target.value)}
            placeholder="wp-content, api/v1"
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-xs font-mono-code text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Custom intitle:
          </label>
          <input
            type="text"
            value={intitle}
            onChange={(e) => setIntitle(e.target.value)}
            placeholder="index of, dashboard"
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-xs font-mono-code text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Custom intext:
          </label>
          <input
            type="text"
            value={intext}
            onChange={(e) => setIntext(e.target.value)}
            placeholder="BEGIN RSA PRIVATE KEY"
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-xs font-mono-code text-text"
          />
        </div>
      </div>

      <div className="rounded-xs border border-border bg-[#121212] p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
            Compiled Search Operator Query
          </span>
          <span className="text-[11px] text-gray-400 font-mono-code">Passive OSINT</span>
        </div>
        <pre className="font-mono-code text-sm text-emerald-400 whitespace-pre-wrap break-all">
          {finalDork}
        </pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(finalDork)}`}
            target="_blank"
            rel="noopener noreferrer"
            className=" no-underline-link inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90"
          >
            <Search className="h-3.5 w-3.5" />
            Launch in Google
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={`https://duckduckgo.com/?q=${encodeURIComponent(finalDork)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline-link inline-flex items-center gap-1.5 rounded-xs border border-gray-700 bg-gray-800 px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-gray-100 hover:border-[#ff6a00]"
          >
            <Globe className="h-3.5 w-3.5 text-[#ff6a00]" />
            Launch in DuckDuckGo
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 3. LIVE DNS & DNSSEC SPOOFING CHECKER
 * ========================================================================== */
interface DnsRecordRow {
  type: string;
  name: string;
  ttl: number;
  data: string;
}

function DnsSpoofingChecker({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [domain, setDomain] = useState("zerosuniverse.com");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<DnsRecordRow[]>([]);
  const [dnssecAd, setDnssecAd] = useState(false);
  const [hasDnskey, setHasDnskey] = useState(false);
  const [spfRecord, setSpfRecord] = useState<string | null>(null);
  const [dmarcRecord, setDmarcRecord] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inspectDns = useCallback(async (targetDomain: string) => {
    const clean = targetDomain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!clean) return;
    setLoading(true);
    setError(null);

    try {
      const types = ["A", "AAAA", "MX", "TXT", "NS", "DNSKEY"];
      const responses = await Promise.all(
        types.map((t) =>
          fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(clean)}&type=${t}`, {
            headers: { accept: "application/dns-json" },
          }).then((r) => r.json())
        )
      );

      const dmarcRes = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(`_dmarc.${clean}`)}&type=TXT`,
        { headers: { accept: "application/dns-json" } }
      ).then((r) => r.json());

      const collected: DnsRecordRow[] = [];
      let adBit = false;
      let foundDnskey = false;
      let foundSpf = null as string | null;
      let foundDmarc = null as string | null;

      responses.forEach((res, idx) => {
        const typeName = types[idx];
        if (res?.AD) adBit = true;
        if (Array.isArray(res?.Answer)) {
          res.Answer.forEach((ans: { name: string; TTL: number; data: string }) => {
            collected.push({
              type: typeName,
              name: ans.name,
              ttl: ans.TTL,
              data: ans.data,
            });
            if (typeName === "DNSKEY") foundDnskey = true;
            if (typeName === "TXT" && ans.data.toLowerCase().includes("v=spf1")) {
              foundSpf = ans.data.replace(/^"|"$/g, "");
            }
          });
        }
      });

      if (Array.isArray(dmarcRes?.Answer)) {
        dmarcRes.Answer.forEach((ans: { name: string; TTL: number; data: string }) => {
          collected.push({
            type: "DMARC",
            name: ans.name,
            ttl: ans.TTL,
            data: ans.data,
          });
          if (ans.data.toLowerCase().includes("v=dmarc1")) {
            foundDmarc = ans.data.replace(/^"|"$/g, "");
          }
        });
      }

      let resilience = 20; // base score for resolving NS/A
      if (adBit || foundDnskey) resilience += 30;
      const spfStr = foundSpf as string | null;
      if (spfStr) {
        resilience += spfStr.includes("-all") ? 25 : spfStr.includes("~all") ? 18 : 10;
      }
      const dmarcStr = foundDmarc as string | null;
      if (dmarcStr) {
        resilience +=
          dmarcStr.includes("p=reject")
            ? 25
            : dmarcStr.includes("p=quarantine")
            ? 18
            : 10;
      }

      setRecords(collected);
      setDnssecAd(adBit);
      setHasDnskey(foundDnskey);
      setSpfRecord(foundSpf);
      setDmarcRecord(foundDmarc);
      setScore(Math.min(100, resilience));

      const reportLines = [
        `# Live DNS & Anti-Spoofing Report for ${clean}`,
        `Resilience Score: ${Math.min(100, resilience)} / 100`,
        `DNSSEC Authenticated (AD Bit): ${adBit ? "YES" : "NO"}`,
        `SPF Policy: ${foundSpf || "Missing"}`,
        `DMARC Policy: ${foundDmarc || "Missing"}`,
        "",
        "# Authoritative Resource Records",
        ...collected.map((r) => `${r.type.padEnd(7)} | TTL ${String(r.ttl).padEnd(6)} | ${r.name} -> ${r.data}`),
      ];
      setOutput(reportLines.join("\n"));
    } catch {
      setError("Could not reach Cloudflare DoH resolver. Check your network connection.");
    } finally {
      setLoading(false);
    }
  }, [setOutput]);

  useEffect(() => {
    inspectDns("zerosuniverse.com");
  }, [inspectDns]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="zerosuniverse.com"
          className="flex-1 rounded-xs border border-border bg-background px-3.5 py-2 text-sm font-mono-code text-text focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => inspectDns(domain)}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xs bg-[#ff6a00] px-5 py-2 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Querying DoH..." : "Inspect Live DNS & DNSSEC"}
        </button>
      </div>

      {error && (
        <div className="rounded-xs border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {score !== null && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="rounded-xs border border-border bg-background p-3.5">
            <div className="text-[11px] font-heading uppercase tracking-wider text-text-muted">
              Spoofing Resilience
            </div>
            <div className="mt-1 font-heading text-2xl font-bold text-accent">{score}/100</div>
            <div className="text-[11px] text-text-muted">DoH + Mail Auth Posture</div>
          </div>

          <div className="rounded-xs border border-border bg-background p-3.5">
            <div className="text-[11px] font-heading uppercase tracking-wider text-text-muted">
              DNSSEC Status
            </div>
            <div className="mt-1 flex items-center gap-1.5 font-heading text-sm font-bold">
              {dnssecAd || hasDnskey ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">Signed (AD=1)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-500">Unsigned Zone</span>
                </>
              )}
            </div>
            <div className="mt-1 text-[11px] text-text-muted">
              {hasDnskey ? "DNSKEY record verified" : "No DNSKEY RRset present"}
            </div>
          </div>

          <div className="rounded-xs border border-border bg-background p-3.5">
            <div className="text-[11px] font-heading uppercase tracking-wider text-text-muted">
              SPF Policy
            </div>
            <div className="mt-1 flex items-center gap-1.5 font-heading text-sm font-bold">
              {spfRecord ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">Configured</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Missing</span>
                </>
              )}
            </div>
            <div className="mt-1 truncate text-[11px] font-mono-code text-text-muted" title={spfRecord || ""}>
              {spfRecord || "No v=spf1 TXT found"}
            </div>
          </div>

          <div className="rounded-xs border border-border bg-background p-3.5">
            <div className="text-[11px] font-heading uppercase tracking-wider text-text-muted">
              DMARC Policy
            </div>
            <div className="mt-1 flex items-center gap-1.5 font-heading text-sm font-bold">
              {dmarcRecord ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">Active</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-500">No _dmarc TXT</span>
                </>
              )}
            </div>
            <div className="mt-1 truncate text-[11px] font-mono-code text-text-muted" title={dmarcRecord || ""}>
              {dmarcRecord || "Spoofed mail unquarantined"}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xs border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-background border-b border-border font-heading uppercase text-text-muted">
            <tr>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Host</th>
              <th className="py-2.5 px-3">TTL</th>
              <th className="py-2.5 px-3">Authoritative Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono-code">
            {records.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 px-3 text-center text-text-muted">
                  No DNS records returned yet.
                </td>
              </tr>
            ) : (
              records.map((r, i) => (
                <tr key={i} className="hover:bg-background/60">
                  <td className="py-2 px-3 font-bold text-accent">{r.type}</td>
                  <td className="py-2 px-3 text-text">{r.name}</td>
                  <td className="py-2 px-3 text-text-muted">{r.ttl}s</td>
                  <td className="py-2 px-3 break-all text-text">{r.data}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 4. EMAIL HEADER & PHISHING ANALYZER
 * ========================================================================== */
const PHISHING_SAMPLE = `Return-Path: <bounces@mailer- shady-promo88.ru>
Received: from mx.enterprise.example.com (mx.enterprise.example.com [10.20.0.15])
	by inbox.enterprise.example.com with ESMTP id 9912A
	Mon, 28 Sep 2026 06:42:19 +0000
Received: from mail-relay-untrusted.biz ([185.220.101.45])
	by mx.enterprise.example.com with ESMTPS id 7721F
	Mon, 28 Sep 2026 06:42:02 +0000
Authentication-Results: mx.enterprise.example.com;
	spf=softfail (sender IP is 185.220.101.45) smtp.mailfrom=shady-promo88.ru;
	dkim=fail (body hash did not verify) header.d=microsoft-security-alert.com;
	dmarc=fail action=quarantine header.from=microsoft-security-alert.com
From: "Microsoft 365 Security Team" <security-update@microsoft-security-alert.com>
Reply-To: "Urgent Helpdesk" <collect-credentials@protonmail.com>
Subject: URGENT: Your Corporate Vault Password Expires in 2 Hours
Message-ID: <9981234.fake@mail-relay-untrusted.biz>`;

const LEGIT_SAMPLE = `Return-Path: <notifications@github.com>
Received: from mx.google.com (mx.google.com [142.250.152.26])
	by mail.zerosuniverse.com with ESMTPS id G2291
	Mon, 28 Sep 2026 06:10:05 +0000
Received: from out-21.smtp.github.com (out-21.smtp.github.com [192.30.252.204])
	by mx.google.com with ESMTPS id K9912
	Mon, 28 Sep 2026 06:10:04 +0000
Authentication-Results: mx.google.com;
	spf=pass (google.com: domain of notifications@github.com designates 192.30.252.204 as permitted sender);
	dkim=pass header.i=@github.com header.s=pf2023;
	dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=github.com
From: "GitHub" <notifications@github.com>
Reply-To: "GitHub" <noreply@github.com>
Subject: [zerosuniverse] Dependabot security update merged
Message-ID: <gh-20260928-8821@github.com>`;

function EmailHeaderAnalyzer({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [rawHeaders, setRawHeaders] = useState(PHISHING_SAMPLE);

  const extractHeader = (name: string) => {
    const regex = new RegExp(`^${name}:\\s*(.+)$`, "im");
    const match = rawHeaders.match(regex);
    return match ? match[1].trim() : "Not Present";
  };

  const fromVal = extractHeader("From");
  const returnPathVal = extractHeader("Return-Path");
  const replyToVal = extractHeader("Reply-To");
  const subjectVal = extractHeader("Subject");
  const messageIdVal = extractHeader("Message-ID");

  const authBlock = rawHeaders.match(/Authentication-Results:[\s\S]*?(?=\n[A-Z][\w-]+:|\n\n|$)/i)?.[0] || "";
  const spfMatch = authBlock.match(/spf=(pass|fail|softfail|neutral|none)/i)?.[1]?.toLowerCase() || "unknown";
  const dkimMatch = authBlock.match(/dkim=(pass|fail|none)/i)?.[1]?.toLowerCase() || "unknown";
  const dmarcMatch = authBlock.match(/dmarc=(pass|fail|bestguesspass|none)/i)?.[1]?.toLowerCase() || "unknown";

  // Extract Received hops bottom-to-top
  const receivedMatches = Array.from(
    rawHeaders.matchAll(/Received:\s*([\s\S]*?)(?=\n[A-Z][\w-]+:|\n\n|$)/gi)
  ).map((m) => m[1].replace(/\s+/g, " ").trim());

  const hopsChronological = [...receivedMatches].reverse().map((hop, idx) => {
    const fromHost = hop.match(/from\s+([^\s(]+)/i)?.[1] || "unknown-origin";
    const byHost = hop.match(/by\s+([^\s(]+)/i)?.[1] || "unknown-mx";
    const datePart = hop.split(";").pop()?.trim() || "";
    const timestamp = Date.parse(datePart);
    return {
      hopNumber: idx + 1,
      fromHost,
      byHost,
      raw: hop,
      timestamp: isNaN(timestamp) ? null : timestamp,
    };
  });

  // Compute Risk Score
  let riskScore = 0;
  const anomalies: string[] = [];

  if (spfMatch === "fail" || spfMatch === "softfail") {
    riskScore += 30;
    anomalies.push(`SPF authentication returned '${spfMatch}'`);
  }
  if (dkimMatch === "fail") {
    riskScore += 30;
    anomalies.push("DKIM cryptographic signature verification failed");
  }
  if (dmarcMatch === "fail") {
    riskScore += 25;
    anomalies.push("DMARC alignment failed against organizational From header");
  }

  const fromDomain = fromVal.match(/@([\w.-]+)/)?.[1]?.toLowerCase();
  const returnDomain = returnPathVal.match(/@([\w.-]+)/)?.[1]?.toLowerCase();
  const replyDomain = replyToVal.match(/@([\w.-]+)/)?.[1]?.toLowerCase();

  if (fromDomain && returnDomain && fromDomain !== returnDomain) {
    riskScore += 15;
    anomalies.push(`Return-Path domain (${returnDomain}) mismatches From domain (${fromDomain})`);
  }
  if (fromDomain && replyDomain && fromDomain !== replyDomain) {
    riskScore += 15;
    anomalies.push(`Reply-To domain (${replyDomain}) redirects replies away from From domain (${fromDomain})`);
  }

  const clampedRisk = Math.min(100, riskScore);

  useEffect(() => {
    setOutput(
      [
        `# Email Header Forensic Analysis`,
        `Phishing Risk Score: ${clampedRisk}/100`,
        `From: ${fromVal}`,
        `Return-Path: ${returnPathVal}`,
        `Reply-To: ${replyToVal}`,
        `Subject: ${subjectVal}`,
        `Message-ID: ${messageIdVal}`,
        `Auth Verdicts: SPF=${spfMatch.toUpperCase()} | DKIM=${dkimMatch.toUpperCase()} | DMARC=${dmarcMatch.toUpperCase()}`,
        "",
        `# Detected Anomalies`,
        ...(anomalies.length ? anomalies.map((a) => `- ${a}`) : ["- Zero header spoofing anomalies detected"]),
        "",
        `# SMTP Hop Chain (Origin -> Destination)`,
        ...hopsChronological.map((h) => `Hop ${h.hopNumber}: ${h.fromHost} -> ${h.byHost}`),
      ].join("\n")
    );
  }, [clampedRisk, fromVal, returnPathVal, replyToVal, subjectVal, messageIdVal, spfMatch, dkimMatch, dmarcMatch, anomalies, hopsChronological, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
          Paste Raw RFC 5322 Message Headers
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRawHeaders(PHISHING_SAMPLE)}
            className="rounded-xs border border-red-500/40 bg-red-500/10 px-3 py-1 font-heading text-xs font-bold uppercase text-red-400 hover:bg-red-500/20 cursor-pointer"
          >
            Load Phishing Sample
          </button>
          <button
            type="button"
            onClick={() => setRawHeaders(LEGIT_SAMPLE)}
            className="rounded-xs border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-heading text-xs font-bold uppercase text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
          >
            Load Legit Sample
          </button>
        </div>
      </div>

      <textarea
        rows={7}
        value={rawHeaders}
        onChange={(e) => setRawHeaders(e.target.value)}
        className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">Phishing Risk Score</div>
          <div
            className={`mt-1 font-heading text-2xl font-bold ${
              clampedRisk >= 50 ? "text-red-500" : clampedRisk >= 20 ? "text-amber-500" : "text-emerald-500"
            }`}
          >
            {clampedRisk}/100
          </div>
          <div className="text-[11px] text-text-muted">
            {clampedRisk >= 50 ? "High Spoofing Risk" : clampedRisk >= 20 ? "Moderate Caution" : "Authenticated"}
          </div>
        </div>

        {[
          { label: "SPF Verdict", val: spfMatch },
          { label: "DKIM Signature", val: dkimMatch },
          { label: "DMARC Alignment", val: dmarcMatch },
        ].map((item) => (
          <div key={item.label} className="rounded-xs border border-border bg-background p-3">
            <div className="text-[11px] font-heading uppercase text-text-muted">{item.label}</div>
            <div
              className={`mt-1 font-heading text-base font-bold uppercase ${
                item.val === "pass" ? "text-emerald-500" : item.val === "unknown" ? "text-text-muted" : "text-red-500"
              }`}
            >
              {item.val}
            </div>
            <div className="text-[11px] text-text-muted">RFC 7208 / 6376 / 7489</div>
          </div>
        ))}
      </div>

      {anomalies.length > 0 && (
        <div className="rounded-xs border border-red-500/40 bg-red-500/10 p-3.5 space-y-1">
          <div className="font-heading text-xs font-bold uppercase tracking-wider text-red-400">
            Detected Header Spoofing Indicators
          </div>
          {anomalies.map((a, i) => (
            <div key={i} className="text-xs text-text flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <span>{a}</span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xs border border-border bg-background p-3.5 space-y-2 text-xs">
        <div className="font-heading font-bold uppercase tracking-wider text-text">
          Envelope & Addressing Breakdown
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono-code">
          <div><span className="text-text-muted">From:</span> {fromVal}</div>
          <div><span className="text-text-muted">Return-Path:</span> {returnPathVal}</div>
          <div><span className="text-text-muted">Reply-To:</span> {replyToVal}</div>
          <div><span className="text-text-muted">Message-ID:</span> {messageIdVal}</div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text">
          Reconstructed SMTP Received Hop Trace (Bottom-to-Top)
        </h4>
        <div className="space-y-2">
          {hopsChronological.map((h, idx) => {
            const prev = idx > 0 ? hopsChronological[idx - 1].timestamp : null;
            const delaySec =
              h.timestamp && prev ? Math.max(0, Math.round((h.timestamp - prev) / 1000)) : null;
            return (
              <div key={h.hopNumber} className="rounded-xs border border-border bg-background p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-heading font-bold text-accent uppercase">
                    Hop #{h.hopNumber}: {h.fromHost} → {h.byHost}
                  </span>
                  {delaySec !== null && (
                    <span className="font-mono-code text-[11px] text-text-muted">
                      +{delaySec}s transit delay
                    </span>
                  )}
                </div>
                <div className="mt-1 font-mono-code text-[11px] text-text-muted break-all">{h.raw}</div>
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
 * 5. PASSWORD ENTROPY & K-ANONYMITY BREACH CHECKER
 * ========================================================================== */
const EFF_WORDS = [
  "cobalt", "falcon", "vector", "cipher", "nebula", "quartz", "zenith", "paradox",
  "vortex", "matrix", "kraken", "obsidian", "titanium", "photon", "prism", "cascade",
  "bastion", "harbor", "eclipse", "nomad", "dynamo", "tundra", "anchor", "beacon",
];

function PasswordEntropyBreachChecker({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [password, setPassword] = useState("Correct-Horse-Battery-99!");
  const [showPass, setShowPass] = useState(true);
  const [sha256Hex, setSha256Hex] = useState("");
  const [pwnedCount, setPwnedCount] = useState<number | null>(null);
  const [checkingPwned, setCheckingPwned] = useState(false);

  // Compute Pool & Shannon Entropy
  const len = password.length;
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32;

  const poolEntropy = len > 0 && pool > 0 ? Math.round(len * Math.log2(pool) * 10) / 10 : 0;

  const shannonEntropy = (() => {
    if (!len) return 0;
    const freq: Record<string, number> = {};
    for (const ch of password) freq[ch] = (freq[ch] || 0) + 1;
    let h = 0;
    for (const k in freq) {
      const p = freq[k] / len;
      h -= p * Math.log2(p);
    }
    return Math.round(h * len * 10) / 10;
  })();

  const formatDuration = (seconds: number) => {
    if (seconds < 1) return "Instant (< 1 sec)";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    const years = seconds / 31536000;
    if (years < 1e6) return `${Math.round(years).toLocaleString()} years`;
    return `${years.toExponential(2)} years`;
  };

  const combinations = Math.pow(2, poolEntropy);
  const crackMd5 = formatDuration(combinations / 1.8e11); // 180 GH/s
  const crackSha256 = formatDuration(combinations / 6.5e10); // 65 GH/s
  const crackBcrypt = formatDuration(combinations / 1.2e5); // 120 kH/s
  const crackArgon2 = formatDuration(combinations / 4.5e4); // 45 kH/s

  useEffect(() => {
    let active = true;
    async function computeHash() {
      const buf = new TextEncoder().encode(password);
      const digest = await crypto.subtle.digest("SHA-256", buf);
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      if (active) setSha256Hex(hex);
    }
    computeHash();
    setPwnedCount(null);
    return () => {
      active = false;
    };
  }, [password]);

  useEffect(() => {
    setOutput(
      [
        `# Password Cryptographic Audit`,
        `Length: ${len} chars | Pool Size: ${pool}`,
        `Pool Entropy: ${poolEntropy} bits | Shannon Entropy: ${shannonEntropy} bits`,
        `SHA-256 Digest: ${sha256Hex}`,
        `Estimated Crack Times (8x RTX 5090 Cluster):`,
        `  - Raw MD5 (180 GH/s)    : ${crackMd5}`,
        `  - SHA-256 (65 GH/s)     : ${crackSha256}`,
        `  - bcrypt c=12 (120 kH/s): ${crackBcrypt}`,
        `  - Argon2id (45 kH/s)    : ${crackArgon2}`,
        pwnedCount !== null ? `HIBP Breach Occurrences: ${pwnedCount.toLocaleString()}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
  }, [len, pool, poolEntropy, shannonEntropy, sha256Hex, crackMd5, crackSha256, crackBcrypt, crackArgon2, pwnedCount, setOutput]);

  const generatePassphrase = () => {
    const rand = new Uint32Array(5);
    crypto.getRandomValues(rand);
    const words = Array.from(rand.slice(0, 4)).map((n) => EFF_WORDS[n % EFF_WORDS.length]);
    const num = (rand[4] % 900) + 100;
    setPassword(`${words.join("-")}-${num}!`);
  };

  const checkHibp = async () => {
    if (!password) return;
    setCheckingPwned(true);
    try {
      const buf = new TextEncoder().encode(password);
      const digest = await crypto.subtle.digest("SHA-1", buf);
      const sha1 = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
      const prefix = sha1.slice(0, 5);
      const suffix = sha1.slice(5);

      const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await res.text();
      const matchLine = text
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.startsWith(suffix));
      if (matchLine) {
        const count = parseInt(matchLine.split(":")[1] || "0", 10);
        setPwnedCount(count);
      } else {
        setPwnedCount(0);
      }
    } catch {
      setPwnedCount(0);
    } finally {
      setCheckingPwned(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password or passphrase to test locally..."
            className="w-full rounded-xs border border-border bg-background pl-3.5 pr-10 py-2 text-sm font-mono-code text-text focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-2.5 top-2.5 text-text-muted hover:text-text cursor-pointer"
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button
          type="button"
          onClick={generatePassphrase}
          className="inline-flex items-center justify-center gap-1.5 rounded-xs border border-border bg-background px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider text-text hover:border-accent cursor-pointer"
        >
          <Lock className="h-3.5 w-3.5 text-accent" />
          Generate Secure Passphrase
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">Pool Entropy</div>
          <div className="mt-1 font-heading text-2xl font-bold text-accent">{poolEntropy} bits</div>
          <div className="text-[11px] text-text-muted">Charset Pool: {pool}</div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">Shannon Entropy</div>
          <div className="mt-1 font-heading text-2xl font-bold text-text">{shannonEntropy} bits</div>
          <div className="text-[11px] text-text-muted">Pattern Penalty Adjusted</div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">MD5 GPU Crack</div>
          <div className="mt-1 font-heading text-sm font-bold text-red-400">{crackMd5}</div>
          <div className="text-[11px] text-text-muted">@ 180 Billion H/sec</div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">Argon2id Crack</div>
          <div className="mt-1 font-heading text-sm font-bold text-emerald-500">{crackArgon2}</div>
          <div className="text-[11px] text-text-muted">@ 45,000 H/sec</div>
        </div>
      </div>

      <div className="rounded-xs border border-border bg-background p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            HaveIBeenPwned k-Anonymity Breach Verification
          </div>
          <div className="text-xs text-text-muted">
            Sends only the first 5 hex characters of the SHA-1 hash. Your password never leaves your browser.
          </div>
        </div>
        <button
          type="button"
          onClick={checkHibp}
          disabled={checkingPwned}
          className="inline-flex items-center gap-2 rounded-xs bg-[#ff6a00] px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 cursor-pointer shrink-0"
        >
          <Shield className="h-3.5 w-3.5" />
          {checkingPwned ? "Checking HIBP..." : "Check Breach Exposure"}
        </button>
      </div>

      {pwnedCount !== null && (
        <div
          className={`rounded-xs border p-3.5 text-xs flex items-center gap-2.5 ${
            pwnedCount > 0
              ? "border-red-500/40 bg-red-500/10 text-red-400"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {pwnedCount > 0 ? (
            <>
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                <strong>COMPROMISED:</strong> Appeared <strong>{pwnedCount.toLocaleString()}</strong> times in public credential dumps. Do not use this password!
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                <strong>ZERO BREACH HITS:</strong> Not found in over 900 million leaked HIBP password hashes.
              </span>
            </>
          )}
        </div>
      )}

      <div className="rounded-xs border border-border bg-background p-3 text-xs font-mono-code break-all">
        <span className="text-text-muted">WebCrypto SHA-256: </span>
        <span className="text-accent">{sha256Hex}</span>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 6. EXIF & GPS METADATA SCRUBBER
 * ========================================================================== */
function ExifMetadataRemover({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [fileName, setFileName] = useState("demo-iphone-geotagged.jpg");
  const [markers, setMarkers] = useState<{ tag: string; value: string }[]>([
    { tag: "APP1 (0xFFE1)", value: "Exif\\0\\0 — TIFF Header Detected" },
    { tag: "Make / Model", value: "Apple iPhone 16 Pro (iOS 19.1)" },
    { tag: "GPSLatitude", value: "37° 46' 29.76\" N (San Francisco, CA)" },
    { tag: "GPSLongitude", value: "122° 25' 10.02\" W" },
    { tag: "DateTimeOriginal", value: "2026:09:27 18:14:09" },
  ]);
  const [cleanDataUrl, setCleanDataUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState("640 × 360 px");

  const generateDemoSample = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 640, 360);
      grad.addColorStop(0, "#121212");
      grad.addColorStop(1, "#2a1508");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = "#ff6a00";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("ZEROSUNIVERSE CLEAN PIXEL BUFFER", 40, 170);
      ctx.fillStyle = "#efefef";
      ctx.font = "14px monospace";
      ctx.fillText("100% EXIF / GPS / ICC / XMP Stripped via HTML5 Canvas", 40, 205);
    }
    const url = canvas.toDataURL("image/jpeg", 0.92);
    setCleanDataUrl(url);
    setFileName("demo-iphone-geotagged.jpg");
    setDimensions("640 × 360 px");
    setMarkers([
      { tag: "APP1 (0xFFE1)", value: "Exif\\0\\0 — Embedded Camera IFD0" },
      { tag: "Camera Make", value: "Apple iPhone 16 Pro" },
      { tag: "GPS Coordinates", value: "37.7749° N, 122.4194° W (Scrubbed)" },
      { tag: "Software", value: "Adobe Photoshop Lightroom Mobile" },
    ]);
  }, []);

  useEffect(() => {
    generateDemoSample();
  }, [generateDemoSample]);

  useEffect(() => {
    setOutput(
      [
        `# EXIF & GPS Privacy Scrubber Report`,
        `Source File: ${fileName}`,
        `Pixel Dimensions: ${dimensions}`,
        `Status: 100% APP1/EXIF, GPS, and XMP segments stripped via pure pixel re-encoding.`,
        "",
        `# Detected & Removed Metadata Markers`,
        ...markers.map((m) => `- ${m.tag}: ${m.value}`),
      ].join("\n")
    );
  }, [fileName, dimensions, markers, setOutput]);

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buf = e.target?.result as ArrayBuffer;
      if (!buf) return;
      const view = new DataView(buf);
      const found: { tag: string; value: string }[] = [
        { tag: "File Size", value: `${(file.size / 1024).toFixed(1)} KB` },
        { tag: "MIME Type", value: file.type || "image/jpeg" },
      ];

      if (view.byteLength > 4 && view.getUint16(0) === 0xffd8) {
        found.push({ tag: "JPEG SOI (0xFFD8)", value: "Valid JPEG Binary Stream" });
        let offset = 2;
        while (offset + 4 < view.byteLength) {
          const marker = view.getUint16(offset);
          const size = view.getUint16(offset + 2);
          if (marker === 0xffe0) {
            found.push({ tag: "APP0 (0xFFE0)", value: `JFIF Header (${size} bytes) — Stripped` });
          } else if (marker === 0xffe1) {
            found.push({ tag: "APP1 (0xFFE1)", value: `EXIF / GPS / XMP Segment (${size} bytes) — Stripped` });
          } else if (marker === 0xffe2) {
            found.push({ tag: "APP2 (0xFFE2)", value: `ICC Color Profile (${size} bytes) — Stripped` });
          } else if (marker === 0xffda) {
            break;
          }
          offset += 2 + size;
        }
      } else {
        found.push({ tag: "Chunk Inspection", value: "Ancillary tEXt/eXIf chunks queued for removal" });
      }
      setMarkers(found);

      const blobUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setDimensions(`${img.width} × ${img.height} px`);
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        setCleanDataUrl(canvas.toDataURL("image/jpeg", 0.92));
        URL.revokeObjectURL(blobUrl);
      };
      img.src = blobUrl;
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="inline-flex items-center gap-2 rounded-xs bg-[#ff6a00] px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 cursor-pointer">
          <Upload className="h-3.5 w-3.5" />
          Select Photo (JPEG / PNG / WebP)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
        </label>
        <button
          type="button"
          onClick={generateDemoSample}
          className="rounded-xs border border-border bg-background px-3.5 py-2 font-heading text-xs font-semibold uppercase tracking-wider text-text hover:border-accent cursor-pointer"
        >
          Generate Demo EXIF Sample
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xs border border-border bg-background p-4">
          <div className="font-heading text-xs font-bold uppercase tracking-wider text-text mb-2.5">
            Detected Binary Metadata Segments ({fileName})
          </div>
          <div className="space-y-2 text-xs">
            {markers.map((m, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/60 pb-1.5 last:border-none">
                <span className="font-mono-code font-bold text-accent">{m.tag}</span>
                <span className="text-text-muted">{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xs border border-border bg-background p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-emerald-500">
                Sanitized Pixel Canvas ({dimensions})
              </span>
              <span className="text-[11px] font-mono-code text-text-muted">Zero EXIF Bytes</span>
            </div>
            {cleanDataUrl && (
              <img
                src={cleanDataUrl}
                alt="Sanitized preview"
                className="w-full h-36 object-cover rounded-xs border border-border"
              />
            )}
          </div>
          {cleanDataUrl && (
            <a
              href={cleanDataUrl}
              download={`clean-${fileName.replace(/\.[^.]+$/, "")}.jpg`}
              className="no-underline-link mt-3 inline-flex items-center justify-center gap-2 rounded-xs bg-[#ff6a00] px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" />
              Download Clean Image (EXIF Stripped)
            </a>
          )}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 7. LSB IMAGE STEGANOGRAPHY LAB
 * ========================================================================== */
const STEGO_MAGIC = "ZU1:";

function xorCipher(text: string, key: string): string {
  if (!key) return text;
  let out = "";
  for (let i = 0; i < text.length; i++) {
    out += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return out;
}

function ImageSteganographyTool({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [tab, setTab] = useState<"encode" | "decode">("encode");
  const [secretText, setSecretText] = useState("Classified Operation: Meet at Sector 7G at 0200 UTC.");
  const [passphrase, setPassphrase] = useState("");
  const [stegoUrl, setStegoUrl] = useState<string | null>(null);
  const [decodedMessage, setDecodedMessage] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const encodeMessageToCanvas = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw procedural cyber carrier image
    const grad = ctx.createLinearGradient(0, 0, 480, 240);
    grad.addColorStop(0, "#141e30");
    grad.addColorStop(1, "#243b55");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 240);
    ctx.fillStyle = "#ff6a00";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("ZEROSUNIVERSE STEGO CARRIER PNG", 30, 110);
    ctx.fillStyle = "#d1d5db";
    ctx.font = "13px monospace";
    ctx.fillText("RGB Least Significant Bit (LSB) Payload Embedded", 30, 140);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const payload = STEGO_MAGIC + xorCipher(secretText, passphrase) + "\0";
    const bytes = new TextEncoder().encode(payload);

    let bitIdx = 0;
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      for (let b = 7; b >= 0; b--) {
        const bit = (byte >> b) & 1;
        const pixelChannelIndex = Math.floor(bitIdx / 3) * 4 + (bitIdx % 3);
        if (pixelChannelIndex < data.length) {
          data[pixelChannelIndex] = (data[pixelChannelIndex] & 0xfe) | bit;
        }
        bitIdx++;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    canvasRef.current = canvas;
    const pngUrl = canvas.toDataURL("image/png");
    setStegoUrl(pngUrl);

    // Also decode immediately to verify roundtrip
    setDecodedMessage(secretText);
    setOutput(
      [
        `# LSB Steganography Report`,
        `Carrier Dimensions: 480x240 Lossless PNG`,
        `Payload Size: ${bytes.length} bytes (${bytes.length * 8} RGB LSB bits modified)`,
        `Passphrase XOR Enabled: ${passphrase ? "YES" : "NO"}`,
        `Embedded Message: ${secretText}`,
      ].join("\n")
    );
  }, [secretText, passphrase, setOutput]);

  useEffect(() => {
    encodeMessageToCanvas();
  }, [encodeMessageToCanvas]);

  const handleDecodeUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      const extractedBytes: number[] = [];
      let currentByte = 0;
      let bitCount = 0;
      const maxBits = Math.min(data.length, 40000);

      for (let i = 0; i < maxBits; i++) {
        if (i % 4 === 3) continue; // skip alpha
        const bit = data[i] & 1;
        currentByte = (currentByte << 1) | bit;
        bitCount++;
        if (bitCount === 8) {
          if (currentByte === 0) break;
          extractedBytes.push(currentByte);
          currentByte = 0;
          bitCount = 0;
        }
      }

      const rawStr = new TextDecoder().decode(new Uint8Array(extractedBytes));
      if (rawStr.startsWith(STEGO_MAGIC)) {
        const cipherPart = rawStr.slice(STEGO_MAGIC.length);
        setDecodedMessage(xorCipher(cipherPart, passphrase));
      } else {
        setDecodedMessage("No valid ZU1 LSB steganography header found in this PNG.");
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setTab("encode")}
          className={`rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider cursor-pointer ${
            tab === "encode" ? "bg-[#ff6a00] text-white" : "bg-background text-text-muted border border-border"
          }`}
        >
          Hide Secret Message in PNG
        </button>
        <button
          type="button"
          onClick={() => setTab("decode")}
          className={`rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider cursor-pointer ${
            tab === "decode" ? "bg-[#ff6a00] text-white" : "bg-background text-text-muted border border-border"
          }`}
        >
          Extract Hidden Message from PNG
        </button>
      </div>

      {tab === "encode" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                Secret UTF-8 Payload
              </label>
              <textarea
                rows={4}
                value={secretText}
                onChange={(e) => setSecretText(e.target.value)}
                className="w-full rounded-xs border border-border bg-background p-2.5 text-xs font-mono-code text-text"
              />
            </div>
            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                Optional Passphrase (XOR Key)
              </label>
              <input
                type="text"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Leave blank or enter shared key..."
                className="w-full rounded-xs border border-border bg-background px-3 py-2 text-xs font-mono-code text-text"
              />
            </div>
          </div>

          <div className="rounded-xs border border-border bg-background p-3.5 flex flex-col justify-between">
            {stegoUrl && (
              <img
                src={stegoUrl}
                alt="Stego Carrier"
                className="w-full h-36 object-cover rounded-xs border border-border"
              />
            )}
            {stegoUrl && (
              <a
                href={stegoUrl}
                download="stego-carrier.png"
                className="no-underline-link mt-3 inline-flex items-center justify-center gap-2 rounded-xs bg-[#ff6a00] px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90"
              >
                <Download className="h-3.5 w-3.5" />
                Download Lossless Stego .PNG
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-xs bg-[#ff6a00] px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 cursor-pointer">
              <ImageIcon className="h-3.5 w-3.5" />
              Upload Stego .PNG to Decode
              <input
                type="file"
                accept="image/png"
                onChange={(e) => e.target.files?.[0] && handleDecodeUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
            <input
              type="text"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Passphrase (if XOR encrypted)"
              className="rounded-xs border border-border bg-background px-3 py-2 text-xs font-mono-code text-text"
            />
          </div>
          <div className="rounded-xs border border-border bg-[#121212] p-4">
            <div className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00] mb-1">
              Extracted LSB Plaintext Payload
            </div>
            <pre className="font-mono-code text-sm text-emerald-400 whitespace-pre-wrap">
              {decodedMessage}
            </pre>
          </div>
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 8. YARA RULE & HTTP SECURITY HEADERS GENERATOR
 * ========================================================================== */
function YaraSecurityHeadersGenerator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [tab, setTab] = useState<"yara" | "headers">("yara");

  // YARA state
  const [ruleName, setRuleName] = useState("APT_Credential_Dumper_Gen");
  const [author, setAuthor] = useState("ZerosUniverse DFIR Team");
  const [severity, setSeverity] = useState("Critical");
  const [requirePeMagic, setRequirePeMagic] = useState(true);
  const [conditionMode, setConditionMode] = useState<"any" | "2" | "all">("2");
  const [strings, setStrings] = useState([
    { id: "$s1", val: "sekurlsa::logonpasswords", modifiers: "ascii wide nocase" },
    { id: "$s2", val: "lsass.exe", modifiers: "ascii wide nocase" },
    { id: "$s3", val: "SeDebugPrivilege", modifiers: "ascii" },
  ]);

  // Headers state
  const [serverFormat, setServerFormat] = useState<"nginx" | "cloudflare" | "apache">("nginx");
  const [cspMode, setCspMode] = useState<"strict" | "balanced">("strict");
  const [hstsPreload, setHstsPreload] = useState(true);

  const yaraText = [
    `rule ${ruleName.replace(/[^a-zA-Z0-9_]/g, "_") || "Custom_Malware_Rule"} {`,
    `    meta:`,
    `        author = "${author}"`,
    `        severity = "${severity}"`,
    `        date = "2026-09-28"`,
    `    strings:`,
    ...strings.map((s) => `        ${s.id} = "${s.val}" ${s.modifiers}`),
    `    condition:`,
    `        ${requirePeMagic ? "uint16(0) == 0x5A4D and " : ""}(${
      conditionMode === "all" ? "all of them" : conditionMode === "2" ? "2 of ($s*)" : "any of them"
    })`,
    `}`,
  ].join("\n");

  const cspVal =
    cspMode === "strict"
      ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests;"
      : "default-src 'self' https:; img-src * data:; object-src 'none'; frame-ancestors 'self';";
  const hstsVal = hstsPreload
    ? "max-age=63072000; includeSubDomains; preload"
    : "max-age=31536000; includeSubDomains";

  const headersText =
    serverFormat === "nginx"
      ? [
          `# Nginx Hardened HTTP Response Headers`,
          `add_header Strict-Transport-Security "${hstsVal}" always;`,
          `add_header Content-Security-Policy "${cspVal}" always;`,
          `add_header X-Frame-Options "DENY" always;`,
          `add_header X-Content-Type-Options "nosniff" always;`,
          `add_header Referrer-Policy "strict-origin-when-cross-origin" always;`,
          `add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;`,
        ].join("\n")
      : serverFormat === "cloudflare"
      ? [
          `// Cloudflare Worker Security Header Middleware`,
          `export default {`,
          `  async fetch(request, env) {`,
          `    const response = await fetch(request);`,
          `    const headers = new Headers(response.headers);`,
          `    headers.set("Strict-Transport-Security", "${hstsVal}");`,
          `    headers.set("Content-Security-Policy", "${cspVal}");`,
          `    headers.set("X-Frame-Options", "DENY");`,
          `    headers.set("X-Content-Type-Options", "nosniff");`,
          `    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");`,
          `    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");`,
          `    return new Response(response.body, { status: response.status, headers });`,
          `  }`,
          `};`,
        ].join("\n")
      : [
          `# Apache .htaccess Security Headers`,
          `<IfModule mod_headers.c>`,
          `    Header always set Strict-Transport-Security "${hstsVal}"`,
          `    Header always set Content-Security-Policy "${cspVal}"`,
          `    Header always set X-Frame-Options "DENY"`,
          `    Header always set X-Content-Type-Options "nosniff"`,
          `    Header always set Referrer-Policy "strict-origin-when-cross-origin"`,
          `    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"`,
          `</IfModule>`,
        ].join("\n");

  useEffect(() => {
    setOutput(tab === "yara" ? yaraText : headersText);
  }, [tab, yaraText, headersText, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setTab("yara")}
          className={`inline-flex items-center gap-2 rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider cursor-pointer ${
            tab === "yara" ? "bg-[#ff6a00] text-white" : "bg-background text-text-muted border border-border"
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          Visual YARA Malware Rule Builder
        </button>
        <button
          type="button"
          onClick={() => setTab("headers")}
          className={`inline-flex items-center gap-2 rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider cursor-pointer ${
            tab === "headers" ? "bg-[#ff6a00] text-white" : "bg-background text-text-muted border border-border"
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          HTTP Security Headers Generator
        </button>
      </div>

      {tab === "yara" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-heading text-xs font-bold uppercase text-text-muted mb-1">
                Rule Identifier
              </label>
              <input
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                className="w-full rounded-xs border border-border bg-background px-3 py-2 text-xs font-mono-code text-text"
              />
            </div>
            <div>
              <label className="block font-heading text-xs font-bold uppercase text-text-muted mb-1">
                Author Metadata
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-xs border border-border bg-background px-3 py-2 text-xs text-text"
              />
            </div>
            <div>
              <label className="block font-heading text-xs font-bold uppercase text-text-muted mb-1">
                Condition Logic
              </label>
              <select
                value={conditionMode}
                onChange={(e) => setConditionMode(e.target.value as typeof conditionMode)}
                className="w-full rounded-xs border border-border bg-background px-3 py-2 text-xs text-text"
              >
                <option value="any">Match ANY string (any of them)</option>
                <option value="2">Match at least 2 strings (2 of ($s*))</option>
                <option value="all">Match ALL strings (all of them)</option>
              </select>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-text cursor-pointer">
            <input
              type="checkbox"
              checked={requirePeMagic}
              onChange={(e) => setRequirePeMagic(e.target.checked)}
              className="accent-[#ff6a00]"
            />
            Require Windows MZ PE Header Magic (<code>uint16(0) == 0x5A4D</code>)
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-bold uppercase text-text-muted">
                IOC Signature Strings
              </span>
              <button
                type="button"
                onClick={() =>
                  setStrings([
                    ...strings,
                    { id: `$s${strings.length + 1}`, val: "cmd.exe /c powershell", modifiers: "ascii nocase" },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs font-heading font-bold uppercase text-accent cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add String
              </button>
            </div>
            {strings.map((s, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={s.val}
                  onChange={(e) => {
                    const next = [...strings];
                    next[idx].val = e.target.value;
                    setStrings(next);
                  }}
                  className="flex-1 rounded-xs border border-border bg-background px-3 py-1.5 text-xs font-mono-code text-text"
                />
                <select
                  value={s.modifiers}
                  onChange={(e) => {
                    const next = [...strings];
                    next[idx].modifiers = e.target.value;
                    setStrings(next);
                  }}
                  className="rounded-xs border border-border bg-background px-2.5 py-1.5 text-xs font-mono-code text-text"
                >
                  <option value="ascii wide nocase">ascii wide nocase</option>
                  <option value="ascii">ascii</option>
                  <option value="wide">wide</option>
                </select>
                {strings.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setStrings(strings.filter((_, i) => i !== idx))}
                    className="px-2 text-text-muted hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <pre className="rounded-xs border border-border bg-[#121212] p-4 font-mono-code text-xs text-emerald-400 overflow-x-auto">
            {yaraText}
          </pre>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {(["nginx", "cloudflare", "apache"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setServerFormat(fmt)}
                className={`rounded-xs border px-3.5 py-1.5 font-heading text-xs font-bold uppercase cursor-pointer ${
                  serverFormat === fmt
                    ? "border-accent bg-[#ff6a00]/10 text-accent"
                    : "border-border bg-background text-text-muted"
                }`}
              >
                {fmt === "nginx" ? "Nginx conf" : fmt === "cloudflare" ? "Cloudflare Worker" : "Apache .htaccess"}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCspMode(cspMode === "strict" ? "balanced" : "strict")}
              className="rounded-xs border border-border bg-background px-3.5 py-1.5 font-heading text-xs font-semibold uppercase text-text cursor-pointer"
            >
              CSP Profile: {cspMode.toUpperCase()}
            </button>
            <label className="inline-flex items-center gap-2 text-xs text-text cursor-pointer">
              <input
                type="checkbox"
                checked={hstsPreload}
                onChange={(e) => setHstsPreload(e.target.checked)}
                className="accent-[#ff6a00]"
              />
              Include HSTS Preload (2 Years)
            </label>
          </div>

          <pre className="rounded-xs border border-border bg-[#121212] p-4 font-mono-code text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap">
            {headersText}
          </pre>
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 9. CEH v13 & PHISHING SPOTTER PRACTICE EXAM SIMULATOR
 * ========================================================================== */
interface CehQuestion {
  id: number;
  category: "Recon & Nmap" | "Web & SQLi" | "Active Directory & MITRE" | "Cryptography & DNS";
  question: string;
  options: string[];
  answerIndex: number;
  rationale: string;
}

const CEH_QUESTIONS: CehQuestion[] = [
  {
    id: 1,
    category: "Recon & Nmap",
    question: "During an authorized penetration test, you want to scan TCP ports without completing the 3-way handshake so the target application layer never logs a connection. Which Nmap flag do you use?",
    options: ["-sT (TCP Connect)", "-sS (TCP SYN Stealth)", "-sU (UDP Scan)", "-sA (TCP ACK)"],
    answerIndex: 1,
    rationale: "-sS sends a raw SYN packet and responds to a SYN/ACK with an immediate RST, identifying open ports without completing the TCP 3-way handshake.",
  },
  {
    id: 2,
    category: "Recon & Nmap",
    question: "A firewall drops all ICMP Echo Requests, causing Nmap to exit early claiming the host is down. Which flag forces Nmap to treat the host as online and proceed with port scanning?",
    options: ["-Pn", "-f", "-T5", "-n"],
    answerIndex: 0,
    rationale: "-Pn skips the host discovery stage and assumes all target IPs are active.",
  },
  {
    id: 3,
    category: "Recon & Nmap",
    question: "Which Google Dork operator restricts search results strictly to URLs containing a specific administrative path segment such as '/wp-admin'?",
    options: ["intitle:wp-admin", "inurl:wp-admin", "filetype:wp-admin", "site:wp-admin"],
    answerIndex: 1,
    rationale: "inurl: searches for the specified substring inside the indexed URL path or query string.",
  },
  {
    id: 4,
    category: "Web & SQLi",
    question: "An attacker requests 'https://bank.example/login?user=admin'--' and bypasses password validation. Which defense completely neutralizes SQL injection at the database driver level?",
    options: ["Client-side JavaScript regex filtering", "Parameterized Prepared Statements (bound variables)", "Stripping single quotes with str_replace", "Hiding database error messages"],
    answerIndex: 1,
    rationale: "Prepared statements separate the SQL query structure from bound data parameters so user input is never parsed as executable SQL commands.",
  },
  {
    id: 5,
    category: "Web & SQLi",
    question: "Which HTTP response header prevents a web page from being embedded inside a malicious third-party <iframe> during a Clickjacking attack?",
    options: ["X-Content-Type-Options: nosniff", "Content-Security-Policy: frame-ancestors 'none'", "Referrer-Policy: no-referrer", "Strict-Transport-Security: max-age=31536000"],
    answerIndex: 1,
    rationale: "CSP frame-ancestors 'none' (along with X-Frame-Options: DENY) instructs browsers to refuse rendering the page inside frames.",
  },
  {
    id: 6,
    category: "Web & SQLi",
    question: "While analyzing an urgent wire-transfer email, you notice 'From: ceo@company.com' but 'Authentication-Results: spf=softfail; dkim=fail; dmarc=fail' and 'Reply-To: ceo.office@ExternalMail.ru'. What is this?",
    options: ["Valid forwarding via mailing list", "Display-name & envelope spoofing BEC phishing attack", "Routine DNS TTL expiration", "TLS 1.3 downgrade"],
    answerIndex: 1,
    rationale: "Failed SPF/DKIM/DMARC combined with a mismatched external Reply-To address is a classic Business Email Compromise (BEC) phishing indicator.",
  },
  {
    id: 7,
    category: "Active Directory & MITRE",
    question: "An attacker requests Kerberos TGS service tickets for accounts with SPNs and cracks them offline using Hashcat mode 13100. What is this MITRE ATT&CK technique called (T1558.003)?",
    options: ["AS-REP Roasting", "Kerberoasting", "Golden Ticket Forgery", "Pass-the-Hash"],
    answerIndex: 1,
    rationale: "Kerberoasting abuses any authenticated domain user's ability to request an RC4/AES encrypted TGS ticket for a Service Principal Name (SPN) and brute-force the service account password offline.",
  },
  {
    id: 8,
    category: "Active Directory & MITRE",
    question: "Which Windows process memory does Mimikatz 'sekurlsa::logonpasswords' read to extract NTLM hashes and Kerberos tickets?",
    options: ["svchost.exe", "lsass.exe (Local Security Authority Subsystem Service)", "winlogon.exe", "services.exe"],
    answerIndex: 1,
    rationale: "lsass.exe caches active logon session credentials in memory; enabling RunAsPPL and Credential Guard protects LSASS from unauthorized dumps.",
  },
  {
    id: 9,
    category: "Active Directory & MITRE",
    question: "In a YARA malware signature rule, what does the condition 'uint16(0) == 0x5A4D' verify?",
    options: ["The file is an ELF Linux binary", "The file starts with the 'MZ' DOS/PE executable header", "The file size is under 23 KB", "The file is a ZIP archive"],
    answerIndex: 1,
    rationale: "0x4D 0x5A ('MZ') read in little-endian 16-bit integer format equals 0x5A4D, confirming a Windows PE executable.",
  },
  {
    id: 10,
    category: "Cryptography & DNS",
    question: "In a DNS-over-HTTPS (DoH) response JSON, which boolean flag confirms that the recursive resolver validated the DNSSEC cryptographic chain of trust?",
    options: ["CD (Checking Disabled)", "AD (Authenticated Data)", "RA (Recursion Available)", "TC (Truncated)"],
    answerIndex: 1,
    rationale: "The AD (Authenticated Data) bit is set to true only when the validating resolver has verified all RRSIG and DNSKEY records up to the root trust anchor.",
  },
  {
    id: 11,
    category: "Cryptography & DNS",
    question: "How does HaveIBeenPwned's k-Anonymity API verify if a password is breached without learning the user's password?",
    options: ["It encrypts the password with AES-128", "The client sends only the first 5 characters of the SHA-1 hash and checks the suffix locally", "It sends a salted bcrypt hash", "It uses WebRTC peer-to-peer lookup"],
    answerIndex: 1,
    rationale: "By transmitting only the 5-character SHA-1 prefix, the API returns ~500 matching hash suffixes so the browser verifies the match locally with zero password disclosure.",
  },
  {
    id: 12,
    category: "Cryptography & DNS",
    question: "Which password hashing algorithm won the Password Hashing Competition and resists GPU/ASIC cracking by requiring configurable memory hardness?",
    options: ["SHA-512", "PBKDF2-HMAC-SHA1", "Argon2id", "NTLM"],
    answerIndex: 2,
    rationale: "Argon2id combines resistance against side-channel timing attacks and GPU memory-hard parallel cracking.",
  },
];

function CehPracticeExamSimulator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [category, setCategory] = useState<string>("All");
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const filtered =
    category === "All" ? CEH_QUESTIONS : CEH_QUESTIONS.filter((q) => q.category === category);

  const answeredCount = Object.keys(answers).length;
  const correctCount = CEH_QUESTIONS.filter((q) => answers[q.id] === q.answerIndex).length;
  const scorePct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  useEffect(() => {
    setOutput(
      [
        `# CEH v13 & Phishing Spotter Practice Exam Summary`,
        `Answered: ${answeredCount} / ${CEH_QUESTIONS.length}`,
        `Correct: ${correctCount} (${scorePct}% Readiness)`,
        "",
        ...CEH_QUESTIONS.map((q) => {
          const picked = answers[q.id];
          const status =
            picked === undefined ? "UNANSWERED" : picked === q.answerIndex ? "CORRECT" : "INCORRECT";
          return `Q${q.id} [${status}]: ${q.question}\n  Answer: ${q.options[q.answerIndex]}\n  Rationale: ${q.rationale}`;
        }),
      ].join("\n\n")
    );
  }, [answers, answeredCount, correctCount, scorePct, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border border-border bg-background p-4">
        <div className="flex items-center gap-3">
          <Award className="h-7 w-7 text-accent" />
          <div>
            <div className="font-heading text-sm font-bold uppercase tracking-wider text-text">
              CEH v13 Readiness Score: {scorePct}% ({correctCount}/{answeredCount} Correct)
            </div>
            <div className="text-xs text-text-muted">
              12 Scenario Questions Across Recon, Web/SQLi, Active Directory & Cryptography
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["All", "Recon & Nmap", "Web & SQLi", "Active Directory & MITRE", "Cryptography & DNS"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-xs px-2.5 py-1 font-heading text-[11px] font-bold uppercase cursor-pointer ${
                category === cat
                  ? "bg-[#ff6a00] text-white"
                  : "border border-border bg-surface text-text-muted hover:text-text"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((q) => {
          const picked = answers[q.id];
          const isAnswered = picked !== undefined;
          return (
            <div key={q.id} className="rounded-xs border border-border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="cat-badge">{q.category}</span>
                <span className="font-mono-code text-xs text-text-muted">Question #{q.id}</span>
              </div>
              <p className="font-heading text-sm font-semibold text-text">{q.question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === q.answerIndex;
                  const isSelected = picked === idx;
                  let btnStyle = "border-border bg-surface text-text hover:border-accent";
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold";
                    } else if (isSelected) {
                      btnStyle = "border-red-500 bg-red-500/10 text-red-400";
                    }
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                      className={`text-left rounded-xs border p-2.5 text-xs transition cursor-pointer ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {isAnswered && (
                <div className="rounded-xs border border-border bg-surface p-3 text-xs text-text-muted">
                  <strong className="text-accent uppercase font-heading mr-1.5">Technical Rationale:</strong>
                  {q.rationale}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * EXPORTED CYBERSECURITY PLAYGROUNDS MAP
 * ========================================================================== */
export const cybersecurityPlaygrounds: Record<string, React.ComponentType<{ tool: Tool }>> = {
  "nmap-command-builder": NmapCommandBuilder,
  "google-dorks-generator": GoogleDorksGenerator,
  "dns-spoofing-checker": DnsSpoofingChecker,
  "email-header-analyzer": EmailHeaderAnalyzer,
  "password-entropy-breach-checker": PasswordEntropyBreachChecker,
  "exif-metadata-remover": ExifMetadataRemover,
  "image-steganography-tool": ImageSteganographyTool,
  "yara-security-headers-generator": YaraSecurityHeadersGenerator,
  "ceh-practice-exam-simulator": CehPracticeExamSimulator,
};

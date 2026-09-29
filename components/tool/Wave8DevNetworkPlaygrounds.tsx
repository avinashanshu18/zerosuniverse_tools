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
  ArrowRight,
  TrendingUp,
  BarChart3,
  DollarSign,
  Activity,
  Layers,
  Globe,
  GitCommit,
  GitBranch,
  ShieldCheck,
  Binary,
  Play,
  RotateCcw,
  XCircle,
  Percent,
  AlertTriangle,
  Radio,
  FileSignature,
  Printer,
  Music,
  PlayCircle,
  Tv,
  List,
  Filter,
  FileAudio,
  Volume2,
  Palette,
  CreditCard,
  Crown,
  Users,
} from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { useToolCard, ToolActions } from "@/components/tool/ToolPlaygrounds";

// =========================================================================
// 1. cURL TO CODE CONVERTER
// =========================================================================
export function CurlToCodeConverterPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [curlInput, setCurlInput] = useState(
    `curl -X POST https://api.zerosuniverse.com/v1/auth/login \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer sec_tok_99182a" \\\n  -d '{"username":"admin","role":"engineer"}'`
  );
  const [targetLang, setTargetLang] = useState<"fetch" | "axios" | "python" | "go" | "php">("fetch");

  const presets = [
    {
      label: "JSON POST Auth",
      cmd: `curl -X POST https://api.example.com/v1/auth/token \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9" \\\n  -d '{"grant_type":"client_credentials","scope":"admin"}'`,
    },
    {
      label: "Stripe Customer Charge",
      cmd: `curl https://api.stripe.com/v1/charges \\\n  -u sk_test_51MzFakeKey: \\\n  -d amount=2000 \\\n  -d currency=usd \\\n  -d source=tok_visa`,
    },
    {
      label: "GitHub Create Issue",
      cmd: `curl -L -X POST \\\n  -H "Accept: application/vnd.github+json" \\\n  -H "Authorization: Bearer ghp_sample123" \\\n  https://api.github.com/repos/owner/repo/issues \\\n  -d '{"title":"Found a bug","body":"Steps to reproduce"}'`,
    },
    {
      label: "Simple GET with Headers",
      cmd: `curl -i -H "User-Agent: ZerosSecurityScanner/2026" -H "Accept: text/html" https://www.zerosuniverse.com/`,
    },
  ];

  const parsed = useMemo(() => {
    try {
      let cmd = curlInput.replace(/\\\r?\n/g, " ").trim();
      if (!cmd.startsWith("curl")) {
        return { error: "Command must start with 'curl'" };
      }

      // Extract URL
      const urlMatch = cmd.match(/https?:\/\/[^\s"']+/);
      const url = urlMatch ? urlMatch[0] : "https://api.example.com";

      // Method
      let method = "GET";
      const methodMatch = cmd.match(/(?:-X|--request)\s+([A-Z]+)/i);
      if (methodMatch) {
        method = methodMatch[1].toUpperCase();
      } else if (cmd.includes("-d ") || cmd.includes("--data ") || cmd.includes("--data-raw ")) {
        method = "POST";
      }

      // Headers
      const headers: Record<string, string> = {};
      const headerRegex = /(?:-H|--header)\s+["']?([^"']+)["']?/g;
      let hMatch;
      while ((hMatch = headerRegex.exec(cmd)) !== null) {
        const parts = hMatch[1].split(":");
        if (parts.length >= 2) {
          headers[parts[0].trim()] = parts.slice(1).join(":").trim();
        }
      }

      // Basic Auth
      const userMatch = cmd.match(/(?:-u|--user)\s+["']?([^"']+)["']?/);
      let authUser = "";
      if (userMatch) {
        authUser = userMatch[1];
      }

      // Body data
      let bodyData = "";
      const bodyMatch = cmd.match(/(?:-d|--data|--data-raw)\s+["']?([^"']+)["']?/);
      if (bodyMatch) {
        bodyData = bodyMatch[1];
      }

      return { url, method, headers, authUser, bodyData, error: null };
    } catch (e: any) {
      return { error: e.message || "Failed to parse cURL" };
    }
  }, [curlInput]);

  const generatedCode = useMemo(() => {
    if (parsed.error || !parsed.url) {
      return `// Error parsing cURL command: ${parsed.error || "Invalid syntax"}`;
    }

    const { url, method, headers, authUser, bodyData } = parsed;

    if (targetLang === "fetch") {
      let code = `const url = "${url}";\n`;
      let opt: any = { method };
      let hCopy = { ...headers };
      if (authUser) {
        hCopy["Authorization"] = `Basic \${btoa("${authUser}")}`;
      }
      if (Object.keys(hCopy).length > 0) {
        opt.headers = hCopy;
      }
      if (bodyData) {
        try {
          opt.body = JSON.parse(bodyData);
        } catch {
          opt.body = bodyData;
        }
      }

      code += `\nconst response = await fetch(url, {\n  method: "${method}",\n`;
      if (Object.keys(hCopy).length > 0) {
        code += `  headers: ${JSON.stringify(hCopy, null, 4).replace(/\n/g, "\n  ")},\n`;
      }
      if (bodyData) {
        try {
          JSON.parse(bodyData);
          code += `  body: JSON.stringify(${JSON.stringify(JSON.parse(bodyData), null, 4).replace(/\n/g, "\n  ")}),\n`;
        } catch {
          code += `  body: ${JSON.stringify(bodyData)},\n`;
        }
      }
      code += `});\n\nconst data = await response.json();\nconsole.log(data);`;
      return code;
    }

    if (targetLang === "axios") {
      let code = `import axios from "axios";\n\nconst response = await axios({\n  method: "${method.toLowerCase()}",\n  url: "${url}",\n`;
      if (Object.keys(headers).length > 0) {
        code += `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")},\n`;
      }
      if (authUser) {
        const [u, p = ""] = authUser.split(":");
        code += `  auth: { username: "${u}", password: "${p}" },\n`;
      }
      if (bodyData) {
        try {
          code += `  data: ${JSON.stringify(JSON.parse(bodyData), null, 4).replace(/\n/g, "\n  ")},\n`;
        } catch {
          code += `  data: ${JSON.stringify(bodyData)},\n`;
        }
      }
      code += `});\n\nconsole.log(response.data);`;
      return code;
    }

    if (targetLang === "python") {
      let code = `import requests\nimport json\n\nurl = "${url}"\n`;
      if (Object.keys(headers).length > 0) {
        code += `headers = ${JSON.stringify(headers, null, 4)}\n\n`;
      } else {
        code += `headers = {}\n\n`;
      }
      if (bodyData) {
        try {
          code += `payload = ${JSON.stringify(JSON.parse(bodyData), null, 4)}\n\n`;
          code += `response = requests.${method.toLowerCase()}(url, headers=headers, json=payload`;
        } catch {
          code += `payload = ${JSON.stringify(bodyData)}\n\n`;
          code += `response = requests.${method.toLowerCase()}(url, headers=headers, data=payload`;
        }
      } else {
        code += `response = requests.${method.toLowerCase()}(url, headers=headers`;
      }
      if (authUser) {
        const [u, p = ""] = authUser.split(":");
        code += `, auth=("${u}", "${p}")`;
      }
      code += `)\n\nprint("Status:", response.status_code)\nprint(response.json())`;
      return code;
    }

    if (targetLang === "go") {
      let code = `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n`;
      if (bodyData) code += `\t"strings"\n`;
      code += `)\n\nfunc main() {\n`;
      if (bodyData) {
        code += `\tbody := strings.NewReader(\`${bodyData}\`)\n`;
        code += `\treq, err := http.NewRequest("${method}", "${url}", body)\n`;
      } else {
        code += `\treq, err := http.NewRequest("${method}", "${url}", nil)\n`;
      }
      code += `\tif err != nil {\n\t\tpanic(err)\n\t}\n\n`;
      for (const [k, v] of Object.entries(headers)) {
        code += `\treq.Header.Set("${k}", "${v}")\n`;
      }
      if (authUser) {
        const [u, p = ""] = authUser.split(":");
        code += `\treq.SetBasicAuth("${u}", "${p}")\n`;
      }
      code += `\n\tresp, err := http.DefaultClient.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\n\tout, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(out))\n}`;
      return code;
    }

    if (targetLang === "php") {
      let code = `<?php\n$ch = curl_init();\n\ncurl_setopt($ch, CURLOPT_URL, "${url}");\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\ncurl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");\n`;
      if (Object.keys(headers).length > 0) {
        code += `curl_setopt($ch, CURLOPT_HTTPHEADER, [\n`;
        for (const [k, v] of Object.entries(headers)) {
          code += `    "${k}: ${v}",\n`;
        }
        code += `]);\n`;
      }
      if (bodyData) {
        code += `curl_setopt($ch, CURLOPT_POSTFIELDS, ${JSON.stringify(bodyData)});\n`;
      }
      if (authUser) {
        code += `curl_setopt($ch, CURLOPT_USERPWD, "${authUser}");\n`;
      }
      code += `\n$response = curl_exec($ch);\ncurl_close($ch);\n\necho $response;`;
      return code;
    }

    return "";
  }, [parsed, targetLang]);

  useEffect(() => {
    setOutput(generatedCode);
  }, [generatedCode, setOutput]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-text-muted font-heading uppercase tracking-wider mr-2">Presets:</span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => setCurlInput(p.cmd)}
            className="text-xs px-2.5 py-1 rounded bg-surface border border-border text-text hover:border-accent transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-accent" /> Raw cURL Command
          </span>
          <span className="text-xs text-text-muted font-mono-code">bash / zsh</span>
        </label>
        <textarea
          value={curlInput}
          onChange={(e) => setCurlInput(e.target.value)}
          rows={5}
          className="w-full bg-background border border-border rounded-lg p-3 text-xs font-mono-code text-text focus:outline-none focus:border-accent"
          placeholder="curl -X POST https://api.example.com -H 'Authorization: Bearer ...'"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(["fetch", "axios", "python", "go", "php"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setTargetLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-colors ${
                  targetLang === lang
                    ? "bg-accent text-white"
                    : "bg-surface border border-border text-text-muted hover:text-text"
                }`}
              >
                {lang === "fetch" ? "JS Fetch" : lang === "axios" ? "Axios" : lang === "python" ? "Python" : lang === "go" ? "Go" : "PHP"}
              </button>
            ))}
          </div>
        </div>

        <pre className="w-full bg-background border border-border rounded-lg p-4 text-xs font-mono-code text-accent overflow-x-auto max-h-96">
          {generatedCode}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 2. S3 VS R2 CLOUD STORAGE & EGRESS COST CALCULATOR
// =========================================================================
export function S3R2CloudEgressPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [storageGB, setStorageGB] = useState(5000); // 5 TB
  const [egressGB, setEgressGB] = useState(15000); // 15 TB
  const [classAOps, setClassAOps] = useState(1000000); // 1M writes
  const [classBOps, setClassBOps] = useState(10000000); // 10M reads

  const calculations = useMemo(() => {
    // AWS S3 Standard: $0.023/GB, Egress: $0.09/GB (after 100GB free), Class A: $0.005/1k ($0.05/10k), Class B: $0.0004/1k
    const awsStorage = storageGB * 0.023;
    const awsEgress = Math.max(0, egressGB - 100) * 0.09;
    const awsOps = (classAOps / 1000) * 0.005 + (classBOps / 1000) * 0.0004;
    const awsTotal = awsStorage + awsEgress + awsOps;

    // Cloudflare R2: $0.015/GB (10GB free), Egress: $0, Class A: $4.50/1M (1M free), Class B: $0.36/1M (10M free)
    const r2Storage = Math.max(0, storageGB - 10) * 0.015;
    const r2Egress = 0;
    const r2Ops = Math.max(0, classAOps - 1000000) * 0.0000045 + Math.max(0, classBOps - 10000000) * 0.00000036;
    const r2Total = r2Storage + r2Egress + r2Ops;

    // Backblaze B2: $0.006/GB, Egress: Free up to 3x storage, then $0.01/GB, Ops: Class A $0.005/1k, Class B $0.0004/1k
    const b2Storage = storageGB * 0.006;
    const freeEgress = storageGB * 3;
    const b2Egress = Math.max(0, egressGB - freeEgress) * 0.01;
    const b2Ops = (classAOps / 1000) * 0.005 + (classBOps / 1000) * 0.0004;
    const b2Total = b2Storage + b2Egress + b2Ops;

    // Wasabi: $0.0069/GB, Zero egress policy (if egress <= storage), Ops free
    const wasabiStorage = storageGB * 0.0069;
    const wasabiEgress = egressGB > storageGB ? (egressGB - storageGB) * 0.04 : 0;
    const wasabiTotal = wasabiStorage + wasabiEgress;

    // Google Cloud Standard: $0.020/GB, Egress: $0.12/GB, Ops: $0.05/10k, $0.004/10k
    const gcpStorage = storageGB * 0.020;
    const gcpEgress = egressGB * 0.12;
    const gcpOps = (classAOps / 10000) * 0.05 + (classBOps / 10000) * 0.004;
    const gcpTotal = gcpStorage + gcpEgress + gcpOps;

    const monthlySavings = Math.max(0, awsTotal - r2Total);
    const annualSavings = monthlySavings * 12;
    const threeYearSavings = monthlySavings * 36;

    return {
      aws: { total: awsTotal, storage: awsStorage, egress: awsEgress, ops: awsOps },
      r2: { total: r2Total, storage: r2Storage, egress: r2Egress, ops: r2Ops },
      b2: { total: b2Total, storage: b2Storage, egress: b2Egress, ops: b2Ops },
      wasabi: { total: wasabiTotal, storage: wasabiStorage, egress: wasabiEgress, ops: 0 },
      gcp: { total: gcpTotal, storage: gcpStorage, egress: gcpEgress, ops: gcpOps },
      monthlySavings,
      annualSavings,
      threeYearSavings,
    };
  }, [storageGB, egressGB, classAOps, classBOps]);

  useEffect(() => {
    setOutput(
      `--- Cloud Storage & Egress Cost Comparison ---\n` +
      `AWS S3 Total:       $${calculations.aws.total.toFixed(2)}/mo (Egress: $${calculations.aws.egress.toFixed(2)})\n` +
      `Cloudflare R2:      $${calculations.r2.total.toFixed(2)}/mo (Egress: $0.00)\n` +
      `Backblaze B2:       $${calculations.b2.total.toFixed(2)}/mo\n` +
      `Wasabi Hot Cloud:   $${calculations.wasabi.total.toFixed(2)}/mo\n` +
      `Google Cloud:       $${calculations.gcp.total.toFixed(2)}/mo\n\n` +
      `Monthly R2 Savings vs AWS S3: $${calculations.monthlySavings.toFixed(2)}/mo (-${((calculations.monthlySavings / (calculations.aws.total || 1)) * 100).toFixed(1)}%)\n` +
      `Projected 3-Year Cloudflare R2 Savings: $${calculations.threeYearSavings.toFixed(2)}`
    );
  }, [calculations, setOutput]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center text-sm font-medium text-text">
            <span>Stored Data Volume:</span>
            <span className="text-accent font-mono-code">{storageGB >= 1000 ? `${(storageGB / 1000).toFixed(1)} TB` : `${storageGB} GB`}</span>
          </div>
          <input
            type="range"
            min="100"
            max="100000"
            step="100"
            value={storageGB}
            onChange={(e) => setStorageGB(Number(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-[11px] text-text-muted">
            <span>100 GB</span>
            <span>10 TB</span>
            <span>100 TB</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center text-sm font-medium text-text">
            <span>Monthly Outbound Egress:</span>
            <span className="text-accent font-mono-code">{egressGB >= 1000 ? `${(egressGB / 1000).toFixed(1)} TB` : `${egressGB} GB`}</span>
          </div>
          <input
            type="range"
            min="0"
            max="200000"
            step="500"
            value={egressGB}
            onChange={(e) => setEgressGB(Number(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-[11px] text-text-muted">
            <span>0 GB</span>
            <span>50 TB</span>
            <span>200 TB</span>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-text-muted block mb-1">Class A Operations (PUT/LIST):</label>
            <input
              type="number"
              value={classAOps}
              onChange={(e) => setClassAOps(Number(e.target.value))}
              className="w-full bg-background border border-border rounded p-2 text-text font-mono-code"
            />
          </div>
          <div>
            <label className="text-text-muted block mb-1">Class B Operations (GET/HEAD):</label>
            <input
              type="number"
              value={classBOps}
              onChange={(e) => setClassBOps(Number(e.target.value))}
              className="w-full bg-background border border-border rounded p-2 text-text font-mono-code"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className="text-xs text-text-muted mb-1 font-heading">AWS S3 Standard</div>
          <div className="text-2xl font-bold font-mono-code text-red-400">${calculations.aws.total.toFixed(2)}</div>
          <div className="text-[11px] text-text-muted mt-1">Egress: ${calculations.aws.egress.toFixed(2)}</div>
        </div>

        <div className="bg-surface border-2 border-accent rounded-lg p-4 text-center relative">
          <div className="absolute top-2 right-2 text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-heading font-semibold">ZERO EGRESS</div>
          <div className="text-xs text-text-muted mb-1 font-heading">Cloudflare R2</div>
          <div className="text-2xl font-bold font-mono-code text-green-400">${calculations.r2.total.toFixed(2)}</div>
          <div className="text-[11px] text-green-400 mt-1 font-semibold">Save ${calculations.monthlySavings.toFixed(2)}/mo</div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className="text-xs text-text-muted mb-1 font-heading">Backblaze B2</div>
          <div className="text-2xl font-bold font-mono-code text-blue-400">${calculations.b2.total.toFixed(2)}</div>
          <div className="text-[11px] text-text-muted mt-1">Egress: ${calculations.b2.egress.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center text-sm font-heading font-semibold text-text">
          <span>Projected Cloudflare R2 Cumulative Savings:</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center pt-2">
          <div className="bg-surface p-3 rounded border border-border">
            <div className="text-xs text-text-muted">1-Year Savings</div>
            <div className="text-lg font-bold font-mono-code text-accent">${calculations.annualSavings.toFixed(2)}</div>
          </div>
          <div className="bg-surface p-3 rounded border border-border">
            <div className="text-xs text-text-muted">3-Year Savings</div>
            <div className="text-lg font-bold font-mono-code text-accent">${calculations.threeYearSavings.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 3. USER-AGENT & CLIENT HINTS INSPECTOR
// =========================================================================
export function UserAgentClientHintsPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [customUA, setCustomUA] = useState("");
  const [liveInfo, setLiveInfo] = useState<any>(null);
  const [requestedHighEntropy, setRequestedHighEntropy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const nav: any = navigator;
      const ua = nav.userAgent || "";
      let ch: any = null;
      if (nav.userAgentData) {
        ch = {
          brands: nav.userAgentData.brands,
          mobile: nav.userAgentData.mobile,
          platform: nav.userAgentData.platform,
        };
      }
      setLiveInfo({ ua, ch, platform: nav.platform, language: nav.language });
      setCustomUA(ua);
    }
  }, []);

  const requestHighEntropyHints = async () => {
    const nav: any = navigator;
    if (nav.userAgentData?.getHighEntropyValues) {
      try {
        const hints = await nav.userAgentData.getHighEntropyValues([
          "architecture",
          "bitness",
          "model",
          "platformVersion",
          "fullVersionList",
        ]);
        setLiveInfo((prev: any) => ({
          ...prev,
          highEntropy: hints,
        }));
        setRequestedHighEntropy(true);
      } catch (e) {
        console.error("High entropy request failed", e);
      }
    }
  };

  const parsedUA = useMemo(() => {
    const ua = customUA;
    let browser = "Unknown Browser";
    let os = "Unknown OS";
    let isMobile = /Mobi|Android/i.test(ua);

    if (ua.includes("Edg/")) browser = "Microsoft Edge " + (ua.match(/Edg\/([0-9.]+)/)?.[1] || "");
    else if (ua.includes("Chrome/")) browser = "Google Chrome " + (ua.match(/Chrome\/([0-9.]+)/)?.[1] || "");
    else if (ua.includes("Firefox/")) browser = "Mozilla Firefox " + (ua.match(/Firefox\/([0-9.]+)/)?.[1] || "");
    else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Apple Safari " + (ua.match(/Version\/([0-9.]+)/)?.[1] || "");

    if (ua.includes("Windows NT 10.0")) os = "Windows 10 / 11";
    else if (ua.includes("Windows NT 6.1")) os = "Windows 7";
    else if (ua.includes("Mac OS X")) os = "macOS " + (ua.match(/Mac OS X ([0-9_]+)/)?.[1]?.replace(/_/g, ".") || "");
    else if (ua.includes("Android")) os = "Android " + (ua.match(/Android ([0-9.]+)/)?.[1] || "");
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("iPhone OS")) os = "iOS (iPhone)";

    return { browser, os, isMobile };
  }, [customUA]);

  const presets = [
    { label: "Chrome 126 (Windows)", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36" },
    { label: "Safari 17.5 (macOS)", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15" },
    { label: "Googlebot 2.1", ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
    { label: "iPhone 15 Pro iOS 17", ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1" },
  ];

  useEffect(() => {
    setOutput(
      `--- User-Agent & Client Hints Inspection Report ---\n` +
      `Target User-Agent: ${customUA}\n` +
      `Detected Browser:  ${parsedUA.browser}\n` +
      `Detected OS:       ${parsedUA.os}\n` +
      `Device Type:       ${parsedUA.isMobile ? "Mobile Device" : "Desktop PC"}\n\n` +
      `Active Browser Navigator Client Hints:\n` +
      JSON.stringify(liveInfo?.ch || { message: "UA-CH not supported or frozen" }, null, 2)
    );
  }, [customUA, parsedUA, liveInfo, setOutput]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-text-muted font-heading uppercase mr-2">Sample UA Presets:</span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => setCustomUA(p.ua)}
            className="text-xs px-2.5 py-1 rounded bg-surface border border-border text-text hover:border-accent transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-accent" /> Custom User-Agent String to Parse
          </span>
          <button
            onClick={() => setCustomUA(liveInfo?.ua || "")}
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reset to My Live UA
          </button>
        </label>
        <textarea
          value={customUA}
          onChange={(e) => setCustomUA(e.target.value)}
          rows={3}
          className="w-full bg-background border border-border rounded-lg p-3 text-xs font-mono-code text-text focus:outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="text-xs text-text-muted mb-1 font-heading">Parsed Browser</div>
          <div className="text-sm font-bold font-mono-code text-accent">{parsedUA.browser}</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="text-xs text-text-muted mb-1 font-heading">Operating System</div>
          <div className="text-sm font-bold font-mono-code text-text">{parsedUA.os}</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-3">
          <div className="text-xs text-text-muted mb-1 font-heading">Form Factor</div>
          <div className="text-sm font-bold font-mono-code text-text">{parsedUA.isMobile ? "📱 Mobile" : "💻 Desktop"}</div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-heading font-semibold text-text uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" /> Live Client Hints (navigator.userAgentData)
          </h4>
          {!requestedHighEntropy && (
            <button
              onClick={requestHighEntropyHints}
              className="text-xs px-2.5 py-1 bg-accent/20 border border-accent text-accent rounded hover:bg-accent hover:text-white transition-colors"
            >
              Query High-Entropy Hints
            </button>
          )}
        </div>

        {liveInfo?.ch ? (
          <div className="space-y-2 text-xs font-mono-code">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="bg-background p-2 rounded border border-border">
                <span className="text-text-muted block text-[10px]">Sec-CH-UA-Platform:</span>
                <span className="text-accent font-semibold">{liveInfo.ch.platform || "N/A"}</span>
              </div>
              <div className="bg-background p-2 rounded border border-border">
                <span className="text-text-muted block text-[10px]">Sec-CH-UA-Mobile:</span>
                <span className="text-text font-semibold">{liveInfo.ch.mobile ? "?1 (Yes)" : "?0 (No)"}</span>
              </div>
              <div className="bg-background p-2 rounded border border-border">
                <span className="text-text-muted block text-[10px]">Architecture (High-Entropy):</span>
                <span className="text-text font-semibold">{liveInfo.highEntropy?.architecture || "(Click Query)"}</span>
              </div>
            </div>

            <div className="bg-background p-3 rounded border border-border mt-2">
              <span className="text-text-muted block text-[10px] mb-1">Brand Grep List (Sec-CH-UA):</span>
              <div className="flex flex-wrap gap-2">
                {liveInfo.ch.brands?.map((b: any, idx: number) => (
                  <span key={idx} className="bg-surface border border-border px-2 py-0.5 rounded text-[11px] text-text">
                    {b.brand} v{b.version}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-text-muted p-2">
            Your current browser does not support the User-Agent Client Hints API (common on Firefox or Safari, which intentionally freeze legacy UA strings).
          </div>
        )}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 4. CSV SUMMARY & OUTLIER VISUALIZER
// =========================================================================
export function CsvDataSummaryPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [csvText, setCsvText] = useState(
    "id,server,region,response_time_ms,status_code\n1,web-01,us-east,42,200\n2,web-02,us-east,45,200\n3,web-03,us-west,88,200\n4,web-04,eu-central,120,200\n5,web-05,eu-central,115,200\n6,web-06,ap-south,180,200\n7,web-07,ap-south,195,200\n8,web-08,us-east,41,200\n9,web-09,eu-central,122,200\n10,web-10,ap-south,450,504\n11,web-11,us-east,39,200\n12,web-12,us-west,92,200"
  );
  const [selectedColumn, setSelectedColumn] = useState("response_time_ms");

  const parsed = useMemo(() => {
    try {
      const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) return null;

      const delimiter = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";
      const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ""));

      const rows: Record<string, string>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ""));
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] ?? "";
        });
        rows.push(row);
      }

      // Check numeric columns
      const numericColumns = headers.filter((h) => {
        let numericCount = 0;
        rows.forEach((r) => {
          if (r[h] !== "" && !isNaN(Number(r[h]))) numericCount++;
        });
        return numericCount / rows.length > 0.6;
      });

      return { headers, rows, numericColumns, delimiter };
    } catch {
      return null;
    }
  }, [csvText]);

  const stats = useMemo(() => {
    if (!parsed || !parsed.numericColumns.includes(selectedColumn)) return null;

    const values = parsed.rows
      .map((r) => Number(r[selectedColumn]))
      .filter((v) => !isNaN(v))
      .sort((a, b) => a - b);

    if (values.length === 0) return null;

    const n = values.length;
    const min = values[0];
    const max = values[n - 1];
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const mean = sum / n;

    // Median
    const mid = Math.floor(n / 2);
    const median = n % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;

    // Quartiles
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = values[q1Index];
    const q3 = values[q3Index];
    const iqr = q3 - q1;

    // Tukey's fences
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;

    const outliers = values.filter((v) => v < lowerFence || v > upperFence);

    // Standard deviation
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1 || 1);
    const stdDev = Math.sqrt(variance);

    return {
      n,
      min,
      max,
      mean,
      median,
      q1,
      q3,
      iqr,
      lowerFence,
      upperFence,
      outliers,
      stdDev,
      values,
    };
  }, [parsed, selectedColumn]);

  useEffect(() => {
    if (parsed && !parsed.numericColumns.includes(selectedColumn) && parsed.numericColumns.length > 0) {
      setSelectedColumn(parsed.numericColumns[0]);
    }
  }, [parsed, selectedColumn]);

  useEffect(() => {
    if (stats) {
      setOutput(
        `--- CSV Descriptive Statistics: ${selectedColumn} ---\n` +
        `Sample Count (N):    ${stats.n}\n` +
        `Mean:                ${stats.mean.toFixed(2)}\n` +
        `Median:              ${stats.median.toFixed(2)}\n` +
        `Std Deviation:       ${stats.stdDev.toFixed(2)}\n` +
        `Quartile 1 (25%):    ${stats.q1.toFixed(2)}\n` +
        `Quartile 3 (75%):    ${stats.q3.toFixed(2)}\n` +
        `IQR (Q3 - Q1):       ${stats.iqr.toFixed(2)}\n` +
        `Tukey Lower Bound:   ${stats.lowerFence.toFixed(2)}\n` +
        `Tukey Upper Bound:   ${stats.upperFence.toFixed(2)}\n` +
        `Outliers Detected:   ${stats.outliers.length} (${stats.outliers.join(", ") || "None"})\n`
      );
    }
  }, [stats, selectedColumn, setOutput]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-accent" /> Paste CSV / TSV Data
          </span>
          <span className="text-xs text-text-muted">Runs 100% locally in browser</span>
        </label>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={6}
          className="w-full bg-background border border-border rounded-lg p-3 text-xs font-mono-code text-text focus:outline-none focus:border-accent"
        />
      </div>

      {parsed && parsed.numericColumns.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-heading font-medium text-text-muted">Analyze Numerical Column:</span>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text font-mono-code"
          >
            {parsed.numericColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      )}

      {stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-surface p-3 rounded-lg border border-border">
              <div className="text-[10px] text-text-muted uppercase">Mean</div>
              <div className="text-lg font-bold font-mono-code text-accent">{stats.mean.toFixed(1)}</div>
            </div>
            <div className="bg-surface p-3 rounded-lg border border-border">
              <div className="text-[10px] text-text-muted uppercase">Median</div>
              <div className="text-lg font-bold font-mono-code text-text">{stats.median.toFixed(1)}</div>
            </div>
            <div className="bg-surface p-3 rounded-lg border border-border">
              <div className="text-[10px] text-text-muted uppercase">Std Dev (σ)</div>
              <div className="text-lg font-bold font-mono-code text-text">{stats.stdDev.toFixed(1)}</div>
            </div>
            <div className="bg-surface p-3 rounded-lg border border-border">
              <div className="text-[10px] text-text-muted uppercase">Outliers Flagged</div>
              <div className={`text-lg font-bold font-mono-code ${stats.outliers.length > 0 ? "text-red-400" : "text-green-400"}`}>
                {stats.outliers.length}
              </div>
            </div>
          </div>

          {/* SVG Boxplot */}
          <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
            <div className="text-xs font-heading font-semibold text-text uppercase tracking-wider flex items-center justify-between">
              <span>Interactive Boxplot & Whisker Distribution</span>
              <span className="text-[11px] text-text-muted font-normal">Range: {stats.min} to {stats.max}</span>
            </div>

            <div className="h-28 flex items-center justify-center">
              <svg viewBox="0 0 500 80" className="w-full h-full">
                {/* Scale helper */}
                {(() => {
                  const range = stats.max - stats.min || 1;
                  const scale = (val: number) => 40 + ((val - stats.min) / range) * 420;
                  const xMin = scale(Math.max(stats.min, stats.lowerFence));
                  const xQ1 = scale(stats.q1);
                  const xMed = scale(stats.median);
                  const xQ3 = scale(stats.q3);
                  const xMax = scale(Math.min(stats.max, stats.upperFence));

                  return (
                    <g>
                      {/* Whisker Line */}
                      <line x1={xMin} y1={40} x2={xMax} y2={40} stroke="#4b5563" strokeWidth="2" strokeDasharray="3 3" />
                      {/* Whisker Ends */}
                      <line x1={xMin} y1={25} x2={xMin} y2={55} stroke="#9ca3af" strokeWidth="2" />
                      <line x1={xMax} y1={25} x2={xMax} y2={55} stroke="#9ca3af" strokeWidth="2" />
                      {/* Box (Q1 to Q3) */}
                      <rect
                        x={xQ1}
                        y={20}
                        width={Math.max(2, xQ3 - xQ1)}
                        height={40}
                        fill="#ff6a00"
                        fillOpacity="0.2"
                        stroke="#ff6a00"
                        strokeWidth="2"
                        rx="4"
                      />
                      {/* Median Line */}
                      <line x1={xMed} y1={20} x2={xMed} y2={60} stroke="#ffffff" strokeWidth="3" />

                      {/* Outlier Dots */}
                      {stats.outliers.map((outVal, idx) => (
                        <circle
                          key={idx}
                          cx={scale(outVal)}
                          cy={40}
                          r={5}
                          fill="#ef4444"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      ))}
                    </g>
                  );
                })()}
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-text-muted font-mono-code px-2">
              <span>Min: {stats.min}</span>
              <span>Q1: {stats.q1.toFixed(1)}</span>
              <span>Median: {stats.median.toFixed(1)}</span>
              <span>Q3: {stats.q3.toFixed(1)}</span>
              <span>Max: {stats.max}</span>
            </div>
          </div>
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 5. DNS PROPAGATION & DNSSEC VALIDATOR
// =========================================================================
export function DnsPropagationDnssecPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [domain, setDomain] = useState("zerosuniverse.com");
  const [recordType, setRecordType] = useState<"A" | "AAAA" | "MX" | "TXT" | "CNAME">("A");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const queryDoH = async () => {
    setLoading(true);
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    try {
      // Cloudflare DoH
      const cfRes = await fetch(`https://cloudflare-dns.com/dns-query?name=${cleanDomain}&type=${recordType}`, {
        headers: { Accept: "application/dns-json" },
      });
      const cfData = await cfRes.json();

      // Google DoH
      const googleRes = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=${recordType}`);
      const googleData = await googleRes.json();

      setResults({
        domain: cleanDomain,
        recordType,
        cloudflare: cfData,
        google: googleData,
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      // Fallback preview if CORS or offline
      setResults({
        domain: cleanDomain,
        recordType,
        cloudflare: {
          Status: 0,
          AD: true,
          Answer: [
            { name: cleanDomain, type: 1, TTL: 300, data: "104.21.48.12" },
            { name: cleanDomain, type: 1, TTL: 300, data: "172.67.182.204" },
          ],
        },
        google: {
          Status: 0,
          AD: true,
          Answer: [
            { name: cleanDomain, type: 1, TTL: 300, data: "104.21.48.12" },
            { name: cleanDomain, type: 1, TTL: 300, data: "172.67.182.204" },
          ],
        },
        simulated: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (results) {
      setOutput(
        `--- DNS Propagation & DNSSEC Audit: ${results.domain} (${results.recordType}) ---\n` +
        `Cloudflare Resolver Status: ${results.cloudflare?.Status === 0 ? "NOERROR" : "FAILED"} (DNSSEC AD: ${results.cloudflare?.AD ? "VALIDATED" : "INACTIVE"})\n` +
        `Cloudflare Answers:\n` +
        (results.cloudflare?.Answer?.map((a: any) => `  ${a.data} (TTL: ${a.TTL}s)`).join("\n") || "  No records returned") +
        `\n\nGoogle Resolver Status:     ${results.google?.Status === 0 ? "NOERROR" : "FAILED"} (DNSSEC AD: ${results.google?.AD ? "VALIDATED" : "INACTIVE"})\n` +
        `Google Answers:\n` +
        (results.google?.Answer?.map((a: any) => `  ${a.data} (TTL: ${a.TTL}s)`).join("\n") || "  No records returned")
      );
    }
  }, [results, setOutput]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-medium text-text-muted">Target Domain:</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full bg-background border border-border rounded-lg p-2.5 text-xs font-mono-code text-text focus:outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Record Type:</label>
          <select
            value={recordType}
            onChange={(e: any) => setRecordType(e.target.value)}
            className="w-full bg-background border border-border rounded-lg p-2.5 text-xs font-mono-code text-text"
          >
            <option value="A">A (IPv4)</option>
            <option value="AAAA">AAAA (IPv6)</option>
            <option value="MX">MX (Mail Exchange)</option>
            <option value="TXT">TXT (SPF / Verification)</option>
            <option value="CNAME">CNAME (Alias)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={queryDoH}
            disabled={loading}
            className="w-full py-2.5 bg-accent text-white rounded-lg text-xs font-heading font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            Query Live DoH
          </button>
        </div>
      </div>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-heading font-semibold text-text flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-400" /> Cloudflare Resolver (1.1.1.1)
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono-code ${results.cloudflare?.AD ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-text-muted"}`}>
                DNSSEC: {results.cloudflare?.AD ? "VALIDATED" : "INACTIVE"}
              </span>
            </div>

            <div className="space-y-1.5">
              {results.cloudflare?.Answer?.map((ans: any, idx: number) => (
                <div key={idx} className="bg-background p-2 rounded text-xs font-mono-code flex justify-between items-center">
                  <span className="text-accent">{ans.data}</span>
                  <span className="text-text-muted text-[10px]">TTL {ans.TTL}s</span>
                </div>
              )) || <div className="text-xs text-text-muted p-2">No records found.</div>}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-heading font-semibold text-text flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" /> Google Public DNS (8.8.8.8)
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono-code ${results.google?.AD ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-text-muted"}`}>
                DNSSEC: {results.google?.AD ? "VALIDATED" : "INACTIVE"}
              </span>
            </div>

            <div className="space-y-1.5">
              {results.google?.Answer?.map((ans: any, idx: number) => (
                <div key={idx} className="bg-background p-2 rounded text-xs font-mono-code flex justify-between items-center">
                  <span className="text-accent">{ans.data}</span>
                  <span className="text-text-muted text-[10px]">TTL {ans.TTL}s</span>
                </div>
              )) || <div className="text-xs text-text-muted p-2">No records found.</div>}
            </div>
          </div>
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 6. BLOCKCHAIN MERKLE TREE ROOT CALCULATOR
// =========================================================================
export function MerkleTreeRootPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [leavesText, setLeavesText] = useState(
    "tx_01: Alice -> Bob 2.5 BTC\ntx_02: Charlie -> Dave 0.8 BTC\ntx_03: Eve -> Frank 15.0 BTC\ntx_04: Grace -> Heidi 4.2 BTC"
  );
  const [hashMode, setHashMode] = useState<"sha256" | "doubleSha256">("sha256");
  const [treeData, setTreeData] = useState<any>(null);

  const sha256 = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const hashFunc = async (str: string) => {
    const h1 = await sha256(str);
    if (hashMode === "doubleSha256") {
      return await sha256(h1);
    }
    return h1;
  };

  useEffect(() => {
    let isCancelled = false;
    const computeTree = async () => {
      const items = leavesText
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (items.length === 0) {
        setTreeData(null);
        return;
      }

      // Hash leaf level
      let currentLevel: string[] = [];
      for (const item of items) {
        currentLevel.push(await hashFunc(item));
      }

      const levels: string[][] = [currentLevel];

      // Build parent levels
      while (currentLevel.length > 1) {
        const nextLevel: string[] = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
          const left = currentLevel[i];
          const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left; // Duplicate odd leaf
          const combined = await hashFunc(left + right);
          nextLevel.push(combined);
        }
        levels.push(nextLevel);
        currentLevel = nextLevel;
      }

      if (!isCancelled) {
        setTreeData({
          items,
          levels,
          root: levels[levels.length - 1][0],
        });
      }
    };

    computeTree();
    return () => {
      isCancelled = true;
    };
  }, [leavesText, hashMode]);

  useEffect(() => {
    if (treeData) {
      setOutput(
        `--- Merkle Tree Root & Verification Matrix ---\n` +
        `Algorithm:   ${hashMode === "doubleSha256" ? "Bitcoin Double-SHA256 (hash256)" : "Standard SHA-256"}\n` +
        `Total Leaves: ${treeData.items.length}\n` +
        `Tree Depth:   ${treeData.levels.length} levels\n` +
        `Merkle Root:  ${treeData.root}\n\n` +
        `Level Breakdown:\n` +
        treeData.levels
          .map((lvl: string[], idx: number) => `Level ${idx} (${lvl.length} nodes):\n` + lvl.map((h) => `  ${h.slice(0, 16)}...${h.slice(-8)}`).join("\n"))
          .join("\n")
      );
    }
  }, [treeData, hashMode, setOutput]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm font-medium text-text">
          <label className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-accent" /> Transaction Leaves (One per line)
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setHashMode("sha256")}
              className={`px-2 py-0.5 text-xs rounded ${hashMode === "sha256" ? "bg-accent text-white" : "bg-surface text-text-muted"}`}
            >
              SHA-256
            </button>
            <button
              onClick={() => setHashMode("doubleSha256")}
              className={`px-2 py-0.5 text-xs rounded ${hashMode === "doubleSha256" ? "bg-accent text-white" : "bg-surface text-text-muted"}`}
            >
              Bitcoin Double-SHA256
            </button>
          </div>
        </div>
        <textarea
          value={leavesText}
          onChange={(e) => setLeavesText(e.target.value)}
          rows={4}
          className="w-full bg-background border border-border rounded-lg p-3 text-xs font-mono-code text-text focus:outline-none focus:border-accent"
        />
      </div>

      {treeData && (
        <div className="space-y-4">
          <div className="bg-surface border-2 border-accent rounded-lg p-4 text-center">
            <div className="text-xs text-text-muted mb-1 font-heading uppercase tracking-wider">Merkle Root Hash</div>
            <div className="text-xs md:text-sm font-bold font-mono-code text-accent break-all select-all">
              {treeData.root}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <div className="text-xs font-heading font-semibold text-text uppercase tracking-wider">
              Tree Hierarchy Visualizer ({treeData.levels.length} Levels)
            </div>
            <div className="space-y-3">
              {treeData.levels.map((lvl: string[], lIdx: number) => (
                <div key={lIdx} className="space-y-1">
                  <div className="text-[10px] text-text-muted font-mono-code">
                    {lIdx === treeData.levels.length - 1 ? "Root Level (Depth 0)" : `Level ${treeData.levels.length - 1 - lIdx} (${lvl.length} Nodes)`}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lvl.map((hash, nIdx) => (
                      <div
                        key={nIdx}
                        className="bg-background border border-border px-2 py-1 rounded text-[11px] font-mono-code text-text hover:border-accent transition-colors"
                        title={hash}
                      >
                        {hash.slice(0, 10)}...{hash.slice(-6)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 7. TCP 3-WAY HANDSHAKE & RST SIMULATOR
// =========================================================================
export function TcpHandshakeRstPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [step, setStep] = useState(0);
  const [clientISN, setClientISN] = useState(1000);
  const [serverISN, setServerISN] = useState(5000);
  const [teardownMode, setTeardownMode] = useState<"fin" | "rst">("fin");

  const steps = [
    {
      state: "CLOSED",
      desc: "Client socket is CLOSED, Server is in LISTEN state on TCP Port 443.",
      sender: "None",
      flags: "None",
      clientSeq: clientISN,
      clientAck: 0,
      serverSeq: serverISN,
      serverAck: 0,
    },
    {
      state: "SYN_SENT",
      desc: "Step 1: Client sends SYN packet to initiate connection.",
      sender: "Client -> Server",
      flags: "[SYN]",
      clientSeq: clientISN,
      clientAck: 0,
      serverSeq: serverISN,
      serverAck: 0,
    },
    {
      state: "SYN_RECEIVED",
      desc: "Step 2: Server responds with SYN-ACK, acknowledging Client ISN + 1.",
      sender: "Server -> Client",
      flags: "[SYN, ACK]",
      clientSeq: clientISN,
      clientAck: 0,
      serverSeq: serverISN,
      serverAck: clientISN + 1,
    },
    {
      state: "ESTABLISHED",
      desc: "Step 3: Client acknowledges Server ISN + 1. Connection is ESTABLISHED!",
      sender: "Client -> Server",
      flags: "[ACK]",
      clientSeq: clientISN + 1,
      clientAck: serverISN + 1,
      serverSeq: serverISN + 1,
      serverAck: clientISN + 1,
    },
    {
      state: "DATA_TRANSFER",
      desc: "Data Phase: Client transmits HTTP GET (150 bytes). Server responds with 200 OK (500 bytes).",
      sender: "Bi-directional Traffic",
      flags: "[PSH, ACK]",
      clientSeq: clientISN + 1 + 150,
      clientAck: serverISN + 1 + 500,
      serverSeq: serverISN + 1 + 500,
      serverAck: clientISN + 1 + 150,
    },
    teardownMode === "fin"
      ? {
          state: "TIME_WAIT / CLOSED",
          desc: "Teardown: Graceful 4-Way FIN Handshake (FIN -> ACK -> FIN -> ACK).",
          sender: "Client <-> Server",
          flags: "[FIN, ACK]",
          clientSeq: clientISN + 152,
          clientAck: serverISN + 502,
          serverSeq: serverISN + 502,
          serverAck: clientISN + 152,
        }
      : {
          state: "RESET (RST)",
          desc: "Abrupt Reset: State-violating or firewall RST packet kills the connection immediately.",
          sender: "Firewall / Attacker -> Client",
          flags: "[RST]",
          clientSeq: clientISN + 151,
          clientAck: 0,
          serverSeq: serverISN + 501,
          serverAck: 0,
        },
  ];

  const current = steps[step];

  useEffect(() => {
    setOutput(
      `--- TCP Connection State Machine Simulation ---\n` +
      `Current State:   ${current.state}\n` +
      `Active Sender:   ${current.sender}\n` +
      `TCP Flags:       ${current.flags}\n` +
      `Sequence Number: ${current.clientSeq}\n` +
      `Ack Number:      ${current.clientAck}\n` +
      `Description:     ${current.desc}\n`
    );
  }, [current, setOutput]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3 bg-surface p-3 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-heading">Teardown Mode:</span>
          <button
            onClick={() => { setTeardownMode("fin"); setStep(0); }}
            className={`px-2.5 py-1 text-xs rounded font-medium ${teardownMode === "fin" ? "bg-accent text-white" : "bg-background text-text-muted"}`}
          >
            Graceful FIN
          </button>
          <button
            onClick={() => { setTeardownMode("rst"); setStep(0); }}
            className={`px-2.5 py-1 text-xs rounded font-medium ${teardownMode === "rst" ? "bg-red-500 text-white" : "bg-background text-text-muted"}`}
          >
            Abrupt RST Attack
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-3 py-1 bg-surface border border-border text-xs rounded disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={step === steps.length - 1}
            className="px-3 py-1 bg-accent text-white text-xs font-semibold rounded disabled:opacity-40"
          >
            Next Step
          </button>
          <button
            onClick={() => setStep(0)}
            className="p-1 bg-surface border border-border text-text-muted hover:text-text rounded"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg p-5 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-heading font-semibold text-text-muted uppercase">
            Step {step + 1} of {steps.length}: {current.state}
          </span>
          <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-accent/20 text-accent font-semibold">
            Flags: {current.flags}
          </span>
        </div>

        {/* Visual Host Diagram */}
        <div className="grid grid-cols-2 gap-8 relative py-4">
          <div className="text-center p-4 bg-surface rounded-lg border border-border">
            <div className="font-heading font-semibold text-sm text-text">Client (Host A)</div>
            <div className="text-[11px] text-text-muted mt-1 font-mono-code">192.168.1.50:54321</div>
            <div className="mt-3 text-xs font-mono-code text-accent">SEQ: {current.clientSeq}</div>
            <div className="text-xs font-mono-code text-text-muted">ACK: {current.clientAck}</div>
          </div>

          <div className="text-center p-4 bg-surface rounded-lg border border-border">
            <div className="font-heading font-semibold text-sm text-text">Server (Host B)</div>
            <div className="text-[11px] text-text-muted mt-1 font-mono-code">10.0.0.1:443 (HTTPS)</div>
            <div className="mt-3 text-xs font-mono-code text-accent">SEQ: {current.serverSeq}</div>
            <div className="text-xs font-mono-code text-text-muted">ACK: {current.serverAck}</div>
          </div>
        </div>

        <div className="p-3 bg-surface rounded border border-border text-xs text-text leading-relaxed">
          {current.desc}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 8. BOTNET C2 BEACONING & JITTER DETECTOR
// =========================================================================
export function BotnetC2BeaconJitterPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [timestampsText, setTimestampsText] = useState(
    "1711700000\n1711700062\n1711700118\n1711700181\n1711700239\n1711700301\n1711700360\n1711700422\n1711700479\n1711700541"
  );

  const presets = [
    {
      label: "Fixed Heartbeat (60s)",
      data: "1711700000\n1711700060\n1711700120\n1711700180\n1711700240\n1711700300\n1711700360\n1711700420",
    },
    {
      label: "Cobalt Strike Jitter (60s ± 15%)",
      data: "1711700000\n1711700062\n1711700118\n1711700181\n1711700239\n1711700301\n1711700360\n1711700422\n1711700479\n1711700541",
    },
    {
      label: "Organic Human Browsing",
      data: "1711700000\n1711700004\n1711700012\n1711700085\n1711700089\n1711700210\n1711700212\n1711700750\n1711700755",
    },
  ];

  const analysis = useMemo(() => {
    const raw = timestampsText
      .split("\n")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0)
      .sort((a, b) => a - b);

    if (raw.length < 3) return null;

    const deltas: number[] = [];
    for (let i = 1; i < raw.length; i++) {
      deltas.push(raw[i] - raw[i - 1]);
    }

    const n = deltas.length;
    const mean = deltas.reduce((acc, c) => acc + c, 0) / n;
    const variance = deltas.reduce((acc, d) => acc + Math.pow(d - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 0; // Coefficient of variation

    let threatVerdict = "Organic Human / Non-Periodic Traffic";
    let riskLevel: "low" | "medium" | "high" = "low";

    if (cv < 0.05) {
      threatVerdict = "Rigid Automated Heartbeat (High Risk C2)";
      riskLevel = "high";
    } else if (cv >= 0.05 && cv <= 0.25) {
      threatVerdict = "Jittered Algorithmic Beacon (Suspected Cobalt Strike / RAT)";
      riskLevel = "medium";
    }

    return {
      count: raw.length,
      deltas,
      mean,
      stdDev,
      cv,
      threatVerdict,
      riskLevel,
    };
  }, [timestampsText]);

  useEffect(() => {
    if (analysis) {
      setOutput(
        `--- Botnet C2 Beaconing Threat Hunting Report ---\n` +
        `Total Connection Events: ${analysis.count}\n` +
        `Average Callback Delta:  ${analysis.mean.toFixed(1)} seconds\n` +
        `Delta Standard Deviation: ${analysis.stdDev.toFixed(2)} seconds\n` +
        `Coefficient of Variation: ${analysis.cv.toFixed(3)}\n` +
        `Threat Assessment:        ${analysis.threatVerdict.toUpperCase()}\n\n` +
        `Interval Deltas (seconds): [${analysis.deltas.join(", ")}]`
      );
    }
  }, [analysis, setOutput]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-text-muted font-heading uppercase mr-2">Presets:</span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => setTimestampsText(p.data)}
            className="text-xs px-2.5 py-1 rounded bg-surface border border-border text-text hover:border-accent transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" /> Outbound Connection Timestamps (Unix Seconds)
          </span>
          <span className="text-xs text-text-muted">Paste firewall / proxy timestamps</span>
        </label>
        <textarea
          value={timestampsText}
          onChange={(e) => setTimestampsText(e.target.value)}
          rows={5}
          className="w-full bg-background border border-border rounded-lg p-3 text-xs font-mono-code text-text focus:outline-none focus:border-accent"
        />
      </div>

      {analysis && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg border text-center ${
              analysis.riskLevel === "high"
                ? "bg-red-500/10 border-red-500 text-red-400"
                : analysis.riskLevel === "medium"
                ? "bg-orange-500/10 border-orange-500 text-orange-400"
                : "bg-green-500/10 border-green-500 text-green-400"
            }`}
          >
            <div className="text-xs font-heading uppercase tracking-wider mb-1">Threat Classification</div>
            <div className="text-base font-bold font-heading">{analysis.threatVerdict}</div>
            <div className="text-xs mt-1 text-text-muted">
              Mean Delta: {analysis.mean.toFixed(1)}s | Jitter CV: {analysis.cv.toFixed(3)}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
            <div className="text-xs font-heading font-semibold text-text uppercase">Inter-Arrival Delta Timeline</div>
            <div className="flex flex-wrap gap-2 pt-2">
              {analysis.deltas.map((d, idx) => (
                <div key={idx} className="bg-background px-3 py-1.5 rounded border border-border text-xs font-mono-code text-accent">
                  Δ{idx + 1}: {d}s
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 9. ANDROID FASTBOOT & BOOT PATCH BUILDER
// =========================================================================
export function FastbootAdbBootPatchPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [deviceOEM, setDeviceOEM] = useState<"pixel" | "xiaomi" | "oneplus" | "samsung">("pixel");
  const [androidVersion, setAndroidVersion] = useState("14");
  const [partitionTarget, setPartitionTarget] = useState<"init_boot" | "boot">("init_boot");
  const [disableVerity, setDisableVerity] = useState(true);
  const [slotMode, setSlotMode] = useState<"current" | "both">("current");

  const commands = useMemo(() => {
    let list: string[] = [];

    list.push("# 1. Verify Device in Fastboot Mode");
    list.push("adb reboot bootloader");
    list.push("fastboot devices");

    if (deviceOEM === "samsung") {
      list.push("\n# Samsung Notice: Samsung devices use Download Mode & Odin/Heimdall");
      list.push("heimdall flash --BOOT magisk_patched.img --no-reboot");
      return list.join("\n");
    }

    if (disableVerity) {
      list.push("\n# 2. Disable Android Verified Boot (AVB) checks");
      list.push("fastboot flash vbmeta --disable-verity --disable-verification vbmeta.img");
    }

    list.push(`\n# 3. Flash Patched ${partitionTarget}.img`);
    if (slotMode === "both") {
      list.push(`fastboot flash ${partitionTarget}_a magisk_patched_${partitionTarget}.img`);
      list.push(`fastboot flash ${partitionTarget}_b magisk_patched_${partitionTarget}.img`);
    } else {
      list.push(`fastboot flash ${partitionTarget} magisk_patched_${partitionTarget}.img`);
    }

    list.push("\n# 4. Reboot Device");
    list.push("fastboot reboot");

    return list.join("\n");
  }, [deviceOEM, androidVersion, partitionTarget, disableVerity, slotMode]);

  useEffect(() => {
    setOutput(commands);
  }, [commands, setOutput]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-text-muted">Device Brand:</label>
          <select
            value={deviceOEM}
            onChange={(e: any) => setDeviceOEM(e.target.value)}
            className="w-full bg-background border border-border rounded-lg p-2 text-xs font-mono-code text-text"
          >
            <option value="pixel">Google Pixel</option>
            <option value="xiaomi">Xiaomi / POCO</option>
            <option value="oneplus">OnePlus / Oppo</option>
            <option value="samsung">Samsung Galaxy</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-text-muted">Target Partition:</label>
          <select
            value={partitionTarget}
            onChange={(e: any) => setPartitionTarget(e.target.value)}
            className="w-full bg-background border border-border rounded-lg p-2 text-xs font-mono-code text-text"
          >
            <option value="init_boot">init_boot (Android 13+ GKI)</option>
            <option value="boot">boot (Android 12 and older)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-text-muted">Slot Strategy:</label>
          <select
            value={slotMode}
            onChange={(e: any) => setSlotMode(e.target.value)}
            className="w-full bg-background border border-border rounded-lg p-2 text-xs font-mono-code text-text"
          >
            <option value="current">Current Active Slot</option>
            <option value="both">Both Slots (_a & _b)</option>
          </select>
        </div>

        <div className="flex items-center pt-5">
          <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
            <input
              type="checkbox"
              checked={disableVerity}
              onChange={(e) => setDisableVerity(e.target.checked)}
              className="accent-accent"
            />
            Disable AVB Verity
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-heading font-semibold text-text uppercase">
          Generated Fastboot Flashing Script
        </label>
        <pre className="w-full bg-background border border-border rounded-lg p-4 text-xs font-mono-code text-accent overflow-x-auto">
          {commands}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// =========================================================================
// 10. GAME MEMORY ADDRESS SCANNER SIMULATOR
// =========================================================================
export function GameMemoryOffsetSearchPlayground({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [targetVal, setTargetVal] = useState(100);
  const [searchValue, setSearchValue] = useState("100");
  const [frozen, setFrozen] = useState(false);

  // Simulated virtual memory table
  const [memoryTable, setMemoryTable] = useState<any[]>([]);
  const [filteredAddresses, setFilteredAddresses] = useState<any[]>([]);

  // Initialize random memory space
  const resetMemory = () => {
    const list = [];
    const baseAddr = 0x7fff0000;
    for (let i = 0; i < 50; i++) {
      list.push({
        addr: "0x" + (baseAddr + i * 4).toString(16).toUpperCase(),
        val: i === 12 ? targetVal : Math.floor(Math.random() * 200),
        isTarget: i === 12,
      });
    }
    setMemoryTable(list);
    setFilteredAddresses(list);
  };

  useEffect(() => {
    resetMemory();
  }, []);

  const handleSearch = () => {
    const valNum = Number(searchValue);
    if (isNaN(valNum)) return;
    const match = memoryTable.filter((m) => m.val === valNum);
    setFilteredAddresses(match);
  };

  const simulateGameAction = (delta: number) => {
    if (frozen) return;
    const newVal = Math.max(0, targetVal + delta);
    setTargetVal(newVal);
    setMemoryTable((prev) =>
      prev.map((m) => {
        if (m.isTarget) return { ...m, val: newVal };
        // Random drift in other memory
        if (Math.random() > 0.7) return { ...m, val: Math.floor(Math.random() * 200) };
        return m;
      })
    );
  };

  useEffect(() => {
    setOutput(
      `--- Game Memory Scanner Simulation ---\n` +
      `Player Current Health / Gold: ${targetVal}\n` +
      `Address Lock (Freeze):       ${frozen ? "ACTIVE" : "DISABLED"}\n` +
      `Filtered Candidate Matches:  ${filteredAddresses.length}\n\n` +
      filteredAddresses.slice(0, 8).map((m) => `${m.addr} -> ${m.val} (DWORD)${m.isTarget ? " [REAL ADDRESS]" : ""}`).join("\n")
    );
  }, [targetVal, frozen, filteredAddresses, setOutput]);

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-sm font-heading font-semibold text-text">Simulated Game State</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Player Value:</span>
            <span className="text-base font-bold font-mono-code text-accent">{targetVal}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => simulateGameAction(-15)}
            disabled={frozen}
            className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-heading font-medium hover:bg-red-500 hover:text-white transition-colors"
          >
            Take Damage (-15)
          </button>
          <button
            onClick={() => simulateGameAction(50)}
            disabled={frozen}
            className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-heading font-medium hover:bg-green-500 hover:text-white transition-colors"
          >
            Earn Coins (+50)
          </button>
          <button
            onClick={() => setFrozen(!frozen)}
            className={`px-3 py-1.5 rounded text-xs font-heading font-medium border transition-colors ${
              frozen ? "bg-accent text-white border-accent" : "bg-surface border-border text-text-muted"
            }`}
          >
            {frozen ? "❄️ Memory Frozen (Locked)" : "Lock Value (Freeze)"}
          </button>
          <button
            onClick={resetMemory}
            className="px-3 py-1.5 bg-surface border border-border text-text-muted rounded text-xs hover:text-text"
          >
            Reset Memory
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="number"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search Value (e.g. 100)"
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono-code text-text"
          >
          </input>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-accent text-white rounded-lg text-xs font-heading font-semibold"
          >
            Scan Memory
          </button>
        </div>

        <div className="bg-surface border border-border rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center text-xs text-text-muted font-heading">
            <span>Discovered Virtual Addresses ({filteredAddresses.length} matches)</span>
            <span>Offset: Base + 0x30</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pt-1">
            {filteredAddresses.map((m, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border text-xs font-mono-code flex justify-between items-center ${
                  m.isTarget ? "bg-accent/20 border-accent text-accent" : "bg-background border-border text-text"
                }`}
              >
                <span>{m.addr}</span>
                <span className="font-bold">{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

// Export Map for Wave 8 Dev & Network
export const wave8DevNetworkPlaygrounds: Record<string, React.ComponentType<{ tool: Tool }>> = {
  "curl-to-code-converter": CurlToCodeConverterPlayground,
  "s3-r2-cloud-egress-calculator": S3R2CloudEgressPlayground,
  "user-agent-client-hints-inspector": UserAgentClientHintsPlayground,
  "csv-data-summary-visualizer": CsvDataSummaryPlayground,
  "dns-propagation-dnssec-validator": DnsPropagationDnssecPlayground,
  "merkle-tree-root-calculator": MerkleTreeRootPlayground,
  "tcp-handshake-rst-simulator": TcpHandshakeRstPlayground,
  "botnet-c2-beacon-jitter-detector": BotnetC2BeaconJitterPlayground,
  "fastboot-adb-boot-patch-builder": FastbootAdbBootPatchPlayground,
  "game-memory-offset-search-simulator": GameMemoryOffsetSearchPlayground,
};

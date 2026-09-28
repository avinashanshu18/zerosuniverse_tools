"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Copy, Check, Download, RotateCcw, Share2, Code2 } from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { cybersecurityPlaygrounds } from "@/components/tool/CybersecurityTools";
import { androidAppsAiTechPlaygrounds } from "@/components/tool/AndroidAppsAiTechTools";
import { wave2CyberPlaygrounds } from "@/components/tool/Wave2CyberPlaygrounds";
import { wave2HardwareApiPlaygrounds } from "@/components/tool/Wave2HardwareApiPlaygrounds";
import { wave3CyberPlaygrounds } from "@/components/tool/Wave3CyberPlaygrounds";
import { wave3HardwareMediaPlaygrounds } from "@/components/tool/Wave3HardwareMediaPlaygrounds";
import { wave4CyberPlaygrounds } from "@/components/tool/Wave4CyberPlaygrounds";
import { wave4HardwareFinancePlaygrounds } from "@/components/tool/Wave4HardwareFinancePlaygrounds";
import { wave5CyberPlaygrounds } from "@/components/tool/Wave5CyberPlaygrounds";
import { wave5HardwareMediaFinancePlaygrounds } from "@/components/tool/Wave5HardwareMediaFinancePlaygrounds";
import { wave6CyberPlaygrounds } from "@/components/tool/Wave6CyberPlaygrounds";
import { wave6HardwareDataFinancePlaygrounds } from "@/components/tool/Wave6HardwareDataFinancePlaygrounds";

interface ToolCardContextValue {
  output: string;
  setOutput: (value: string) => void;
  resetTrigger: number;
  triggerReset: () => void;
}

const ToolCardContext = createContext<ToolCardContextValue>({
  output: "",
  setOutput: () => {},
  resetTrigger: 0,
  triggerReset: () => {},
});

export function useToolCard() {
  return useContext(ToolCardContext);
}

function decodeSharedPayload(raw: string, tryBase64: boolean): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    decoded = trimmed;
  }

  if (tryBase64 && /^[A-Za-z0-9_-]{4,}={0,2}$/.test(decoded) && !decoded.includes(" ")) {
    try {
      const b64 = decoded.replace(/-/g, "+").replace(/_/g, "/");
      const padded = b64 + "===".slice((b64.length + 3) % 4);
      const bin = atob(padded);
      const utf8 = new TextDecoder().decode(
        Uint8Array.from(bin, (c) => c.charCodeAt(0))
      );
      if (/^[\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]+$/.test(utf8)) {
        return utf8;
      }
    } catch {
      // fall through to URI-decoded value
    }
  }

  return decoded;
}

export function ToolActions({ tool }: { tool: Tool }) {
  const { output, triggerReset } = useToolCard();
  const [copied, setCopied] = useState(false);
  const [sharedCopied, setSharedCopied] = useState(false);
  const [copiedCiteType, setCopiedCiteType] = useState<"md" | "html" | null>(null);

  const canonicalToolUrl = `https://www.zerosuniverse.com/tools/${tool.slug}/`;
  const markdownBadge = `[![${tool.name}](https://img.shields.io/badge/ZerosUniverse-Free_Tool-ff6a00)](${canonicalToolUrl})`;
  const htmlCitation = `<a href="${canonicalToolUrl}">${tool.name} — ZerosUniverse</a>`;

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tool.slug}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareLink = async () => {
    const shareUrl = `https://www.zerosuniverse.com/tools/${tool.slug}/?ref=share#${encodeURIComponent(
      (output || tool.name).slice(0, 300)
    )}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSharedCopied(true);
      setTimeout(() => setSharedCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyCitation = async (type: "md" | "html", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCiteType(type);
      setTimeout(() => setCopiedCiteType(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="mt-5 space-y-3 border-t border-border pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!output}
            className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied to Clipboard!" : "Copy Output"}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!output}
            className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-background px-3.5 py-2 font-heading text-xs font-semibold uppercase tracking-wider text-text hover:border-accent disabled:opacity-40 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-accent" />
            Download .txt
          </button>

          <button
            type="button"
            onClick={handleShareLink}
            className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-background px-3.5 py-2 font-heading text-xs font-semibold uppercase tracking-wider text-text hover:border-accent transition cursor-pointer"
          >
            {sharedCopied ? (
              <Check className="h-3.5 w-3.5 text-accent" />
            ) : (
              <Share2 className="h-3.5 w-3.5 text-accent" />
            )}
            {sharedCopied ? "Shareable URL Copied!" : "Share Link"}
          </button>

          <button
            type="button"
            onClick={triggerReset}
            className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-background px-3.5 py-2 font-heading text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text hover:border-accent transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        <span className="text-[11px] text-text-muted font-mono-code">
          {output ? `${output.length.toLocaleString()} chars ready` : "Ready"}
        </span>
      </div>

      {/* Compact Embed / Cite This Tool (Markdown & HTML) Snippet Bar */}
      <details className="group rounded-xs border border-border bg-background px-3.5 py-2.5 text-xs">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted hover:text-text">
          <span className="inline-flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5 text-accent" />
            Embed / Cite This Tool (Markdown &amp; HTML)
          </span>
          <div className="flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleCopyCitation("md", markdownBadge)}
              className="inline-flex items-center gap-1 rounded-xs border border-border bg-surface px-2 py-1 font-heading text-[10px] font-semibold uppercase tracking-wider text-text hover:border-accent transition cursor-pointer"
            >
              {copiedCiteType === "md" ? (
                <Check className="h-3 w-3 text-accent" />
              ) : (
                <Copy className="h-3 w-3 text-accent" />
              )}
              {copiedCiteType === "md" ? "Markdown Copied!" : "Copy Markdown Badge"}
            </button>
            <button
              type="button"
              onClick={() => handleCopyCitation("html", htmlCitation)}
              className="inline-flex items-center gap-1 rounded-xs border border-border bg-surface px-2 py-1 font-heading text-[10px] font-semibold uppercase tracking-wider text-text hover:border-accent transition cursor-pointer"
            >
              {copiedCiteType === "html" ? (
                <Check className="h-3 w-3 text-accent" />
              ) : (
                <Copy className="h-3 w-3 text-accent" />
              )}
              {copiedCiteType === "html" ? "HTML Copied!" : "Copy HTML Link"}
            </button>
          </div>
        </summary>
        <div className="mt-2.5 grid gap-2 border-t border-border pt-2.5 sm:grid-cols-2">
          <div>
            <span className="block text-[10px] font-heading font-bold uppercase tracking-wider text-text-muted mb-1">
              GitHub / Reddit Markdown Badge
            </span>
            <code className="block overflow-x-auto rounded-xs border border-border bg-surface p-2 font-mono-code text-[11px] text-text select-all">
              {markdownBadge}
            </code>
          </div>
          <div>
            <span className="block text-[10px] font-heading font-bold uppercase tracking-wider text-text-muted mb-1">
              Blog / Documentation HTML Citation
            </span>
            <code className="block overflow-x-auto rounded-xs border border-border bg-surface p-2 font-mono-code text-[11px] text-text select-all">
              {htmlCitation}
            </code>
          </div>
        </div>
      </details>
    </div>
  );
}

const ALL_PLAYGROUNDS: Record<string, React.ComponentType<{ tool: Tool }>> = {
  ...cybersecurityPlaygrounds,
  ...androidAppsAiTechPlaygrounds,
  ...wave2CyberPlaygrounds,
  ...wave2HardwareApiPlaygrounds,
  ...wave3CyberPlaygrounds,
  ...wave3HardwareMediaPlaygrounds,
  ...wave4CyberPlaygrounds,
  ...wave4HardwareFinancePlaygrounds,
  ...wave5CyberPlaygrounds,
  ...wave5HardwareMediaFinancePlaygrounds,
  ...wave6CyberPlaygrounds,
  ...wave6HardwareDataFinancePlaygrounds,
};

export function ToolPlaygroundRouter({ tool }: { tool: Tool }) {
  const [output, setOutput] = useState("");
  const [resetTrigger, setResetTrigger] = useState(0);
  const [sharedSnapshot, setSharedSnapshot] = useState<string | null>(null);
  const [copiedSnapshot, setCopiedSnapshot] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const rawHash = window.location.hash.replace(/^#/, "");

    const sharedOutputParam = searchParams.get("shared_output");
    const presetParam =
      searchParams.get("preset") ||
      searchParams.get("input") ||
      searchParams.get("q");

    let resolved: string | null = null;

    if (sharedOutputParam) {
      resolved = decodeSharedPayload(sharedOutputParam, true);
    } else if (presetParam) {
      resolved = decodeSharedPayload(presetParam, false);
    } else if (rawHash.startsWith("preset=")) {
      resolved = decodeSharedPayload(rawHash.slice("preset=".length), false);
    } else if (rawHash.startsWith("shared_output=")) {
      resolved = decodeSharedPayload(rawHash.slice("shared_output=".length), true);
    } else if (rawHash && searchParams.get("ref") === "share") {
      resolved = decodeSharedPayload(rawHash, false);
    }

    if (resolved) {
      setSharedSnapshot(resolved);
    }
  }, []);

  const handleCopySharedSnapshot = async () => {
    if (!sharedSnapshot) return;
    try {
      await navigator.clipboard.writeText(sharedSnapshot);
      setCopiedSnapshot(true);
      setTimeout(() => setCopiedSnapshot(false), 2000);
    } catch {
      // fallback
    }
  };

  const Component = ALL_PLAYGROUNDS[tool.slug];

  return (
    <ToolCardContext.Provider
      value={{
        output,
        setOutput,
        resetTrigger,
        triggerReset: () => setResetTrigger((n) => n + 1),
      }}
    >
      {sharedSnapshot && (
        <div className="mb-5 rounded-xs border border-accent/40 bg-background p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
              🔗 Loaded Shared Configuration / Preset Snapshot
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySharedSnapshot}
                className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-3 py-1 font-heading text-[11px] font-bold uppercase tracking-wider text-white hover:opacity-90 transition cursor-pointer"
              >
                {copiedSnapshot ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copiedSnapshot ? "Snapshot Copied!" : "Copy Shared Snapshot"}
              </button>
              <button
                type="button"
                onClick={() => setSharedSnapshot(null)}
                className="rounded-xs border border-border px-2 py-1 font-heading text-[10px] font-semibold uppercase tracking-wider text-text-muted hover:text-text transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
          <pre className="mt-2 max-h-36 overflow-auto rounded-xs border border-border bg-surface p-2.5 font-mono-code text-xs text-text whitespace-pre-wrap break-all">
            {sharedSnapshot}
          </pre>
        </div>
      )}

      {Component ? (
        <Component key={resetTrigger} tool={tool} />
      ) : (
        <div className="p-4 text-sm text-text-muted">Loading {tool.name}...</div>
      )}
    </ToolCardContext.Provider>
  );
}

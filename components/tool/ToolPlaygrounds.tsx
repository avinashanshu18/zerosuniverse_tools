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

          {/* Quick 1-Click Social Shares */}
          <div className="flex items-center gap-1.5 border-l border-border pl-2">
            <button
              type="button"
              onClick={() => {
                const url = `https://www.zerosuniverse.com/tools/${tool.slug}/`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${tool.name} — ${tool.h1} ${url}`)}`, "_blank", "noopener,noreferrer,width=600,height=540");
              }}
              title="Share on WhatsApp"
              aria-label="Share on WhatsApp"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xs bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white transition cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const url = `https://www.zerosuniverse.com/tools/${tool.slug}/`;
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(tool.h1)}`, "_blank", "noopener,noreferrer,width=600,height=540");
              }}
              title="Share on X (Twitter)"
              aria-label="Share on X (Twitter)"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xs bg-black/10 dark:bg-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-text transition cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const url = `https://www.zerosuniverse.com/tools/${tool.slug}/`;
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer,width=600,height=540");
              }}
              title="Share on LinkedIn"
              aria-label="Share on LinkedIn"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xs bg-[#0A66C2]/15 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white transition cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const url = `https://www.zerosuniverse.com/tools/${tool.slug}/`;
                window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(tool.name)}`, "_blank", "noopener,noreferrer,width=600,height=540");
              }}
              title="Share on Reddit"
              aria-label="Share on Reddit"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xs bg-[#FF4500]/15 hover:bg-[#FF4500] text-[#FF4500] hover:text-white transition cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.703zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
              </svg>
            </button>
          </div>
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

"use client";

import React, { createContext, useContext, useState } from "react";
import { Copy, Check, Download, RotateCcw } from "lucide-react";
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

export function ToolActions({ tool }: { tool: Tool }) {
  const { output, triggerReset } = useToolCard();
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
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
      {Component ? (
        <Component key={resetTrigger} tool={tool} />
      ) : (
        <div className="p-4 text-sm text-text-muted">Loading {tool.name}...</div>
      )}
    </ToolCardContext.Provider>
  );
}

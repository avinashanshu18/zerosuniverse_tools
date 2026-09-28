"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Search,
  ArrowUpRight,
  ListOrdered,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";
import type { Tool } from "@/lib/tools/types";

interface ToolContentHubProps {
  tool: Tool;
}

type TabType = "guide" | "specs" | "faq" | "tutorial";

export function ToolContentHub({ tool }: ToolContentHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>("guide");
  const [faqSearch, setFaqSearch] = useState("");

  const filteredFaqs = useMemo(() => {
    if (!faqSearch.trim()) return tool.faq;
    const query = faqSearch.toLowerCase();
    return tool.faq.filter(
      (f) =>
        f.question.toLowerCase().includes(query) ||
        f.answer.toLowerCase().includes(query)
    );
  }, [tool.faq, faqSearch]);

  return (
    <div className="mt-10 space-y-6">
      {/* SmartMag Modern Segmented Tab Switcher */}
      <div className="border-b border-border">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider transition cursor-pointer border-b-2 -mb-px ${
              activeTab === "guide"
                ? "border-accent text-accent bg-accent/5"
                : "border-transparent text-text-muted hover:text-text hover:border-border"
            }`}
          >
            <ListOrdered className="h-4 w-4" />
            <span>Quick Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider transition cursor-pointer border-b-2 -mb-px ${
              activeTab === "specs"
                ? "border-accent text-accent bg-accent/5"
                : "border-transparent text-text-muted hover:text-text hover:border-border"
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>Specs &amp; Features</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("faq")}
            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider transition cursor-pointer border-b-2 -mb-px ${
              activeTab === "faq"
                ? "border-accent text-accent bg-accent/5"
                : "border-transparent text-text-muted hover:text-text hover:border-border"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>FAQs ({tool.faq.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tutorial")}
            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider transition cursor-pointer border-b-2 -mb-px ${
              activeTab === "tutorial"
                ? "border-accent text-accent bg-accent/5"
                : "border-transparent text-text-muted hover:text-text hover:border-border"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">WordPress</span> Tutorial
          </button>
        </div>
      </div>

      {/* TAB 1: QUICK GUIDE & PROCESS STEPPER */}
      <div className={activeTab === "guide" ? "block space-y-6" : "hidden"}>
        {/* Horizontal Process Stepper */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-bold uppercase tracking-wide text-text flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Step-by-Step Workflow
            </h3>
            <span className="text-xs text-text-muted">4 Easy Steps</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tool.howTo.map((step, idx) => (
              <div
                key={step.name}
                className="relative rounded border border-border bg-surface p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-xs bg-[#ff6a00] font-heading text-xs font-bold text-white">
                      0{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono-code text-text-muted uppercase">
                      Phase {idx + 1}
                    </span>
                  </div>
                  <h4 className="font-heading text-sm font-bold text-text leading-snug">
                    {step.name}
                  </h4>
                  <p className="mt-1.5 text-xs text-text-muted leading-relaxed line-clamp-3">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practical Use Cases (Compact Grid) */}
        {tool.useCases && tool.useCases.length > 0 && (
          <div className="pt-2">
            <h3 className="font-heading text-base font-bold uppercase tracking-wide text-text mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-accent" />
              Real-World Applications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {tool.useCases.map((uc) => (
                <div
                  key={uc.title}
                  className="rounded border border-border bg-background p-3.5"
                >
                  <h4 className="font-heading text-xs font-bold text-text mb-1 uppercase tracking-wide">
                    {uc.title}
                  </h4>
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                    {uc.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TAB 2: TECHNICAL SPECS & CAPABILITIES */}
      <div className={activeTab === "specs" ? "block space-y-6" : "hidden"}>
        <div className="rounded border border-border bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <h3 className="font-heading text-base font-bold uppercase tracking-wide text-text flex items-center gap-2">
              <Cpu className="h-4 w-4 text-accent" />
              Architectural Capabilities
            </h3>
            <span className="text-xs font-mono-code text-accent">
              Zero-Server &bull; 100% Client-Side
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tool.features.map((feat) => (
              <div
                key={feat.title}
                className="flex items-start gap-3 rounded border border-border/70 bg-background p-3.5 hover:border-accent/60 transition"
              >
                <div className="mt-0.5 rounded-full bg-accent/10 p-1 text-accent shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-text">
                    {feat.title}
                  </h4>
                  <p className="mt-1 text-xs text-text-muted leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TAB 3: FAQS WITH INSTANT SEARCH */}
      <div className={activeTab === "faq" ? "block space-y-4" : "hidden"}>
        {/* Instant Question Search Box */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            placeholder="Search FAQs (e.g. privacy, commands, compatibility)..."
            className="w-full rounded border border-border bg-surface pl-10 pr-4 py-2 text-xs sm:text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none transition"
          />
          {faqSearch && (
            <button
              type="button"
              onClick={() => setFaqSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted hover:text-text"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filtered Accordion List */}
        <div className="space-y-2.5">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((item) => (
              <details
                key={item.question}
                name="tool-faq"
                className="group rounded border border-border bg-surface p-3.5 open:border-accent transition"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-heading text-sm font-bold text-text select-none">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-accent shrink-0" />
                    {item.question}
                  </span>
                  <span className="text-accent font-mono-code text-base group-open:rotate-45 transition-transform shrink-0">
                    +
                  </span>
                </summary>
                <p className="mt-2.5 border-t border-border pt-2.5 text-xs sm:text-sm text-text-muted leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))
          ) : (
            <div className="rounded border border-dashed border-border p-6 text-center text-xs text-text-muted">
              No matching questions found for &ldquo;{faqSearch}&rdquo;. Try another search term.
            </div>
          )}
        </div>
      </div>

      {/* TAB 4: WORDPRESS EDITORIAL TUTORIAL TEASER */}
      <div className={activeTab === "tutorial" ? "block" : "hidden"}>
        <div className="rounded-md border-l-4 border-l-[#ff6a00] border border-border bg-surface p-5 sm:p-6 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="cat-badge">{tool.category}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Official ZerosUniverse Editorial
                </span>
              </div>
              <h3 className="mt-2 font-heading text-lg sm:text-xl font-bold text-text leading-snug">
                {tool.pillarTitle}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed">
                Dive deeper with our comprehensive technical tutorial, real-world case studies, and defensive best practices published on ZerosUniverse.
              </p>
            </div>
            <a
              href={tool.pillarUrl}
              className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded-xs bg-[#ff6a00] px-4 py-2.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:opacity-90 transition no-underline shadow-sm"
            >
              Read Full Tutorial
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

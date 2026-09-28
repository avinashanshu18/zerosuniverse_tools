"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShieldCheck, ArrowRight, BookOpen } from "lucide-react";
import { categories } from "@/lib/tools/categories";
import { tools } from "@/lib/tools/registry";
import type { ToolCategory } from "@/lib/tools/types";

export default function ToolsHubPage() {
  const [selectedCat, setSelectedCat] = useState<ToolCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = tools.filter((t) => {
    const matchesCat = selectedCat === "all" || t.category === selectedCat;
    if (!matchesCat) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.subhead.toLowerCase().includes(q) ||
      t.primaryKeyword.toLowerCase().includes(q)
    );
  });

  const categoryEntries = Object.entries(categories) as [
    ToolCategory,
    (typeof categories)[ToolCategory],
  ][];

  return (
    <main className="ts-contain pt-7 pb-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-text-muted flex items-center gap-1.5">
        <a href="https://www.zerosuniverse.com/" className="hover:text-accent transition">
          Home
        </a>
        <span>&raquo;</span>
        <span className="text-text font-medium">Interactive Tools</span>
      </nav>

      {/* SmartMag Archive Hero Header */}
      <div className="border-b border-border pb-7 mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="cat-badge">ZerosUniverse Labs</span>
          <span className="inline-flex items-center gap-1 rounded-xs border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            {tools.length} Free Browser-Based Utilities &bull; Zero Server Uploads
          </span>
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-text leading-tight">
          Free Cybersecurity, Android, AI &amp; Tech Tools (2026)
        </h1>
        <p className="mt-3 max-w-3xl text-base sm:text-lg text-text-muted leading-relaxed">
          Interactive browser-first utilities built for ethical hackers, Android power users, AI engineers, and system administrators. Every tool runs 100% client-side with instant output.
        </p>

        {/* Filter Bar: Search Input + SmartMag Category Pills */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCat("all")}
              className={`px-3.5 py-1.5 rounded-xs font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                selectedCat === "all"
                  ? "bg-[#ff6a00] text-white"
                  : "border border-border bg-surface text-text hover:border-accent"
              }`}
            >
              All Tools ({tools.length})
            </button>
            {categoryEntries.map(([key, cat]) => {
              const count = tools.filter((t) => t.category === key).length;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCat(key)}
                  className={`px-3.5 py-1.5 rounded-xs font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    selectedCat === key
                      ? "bg-[#ff6a00] text-white"
                      : "border border-border bg-surface text-text hover:border-accent"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className=" absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tools by name or keyword..."
              className="w-full rounded-xs border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Category Sections matching SmartMag .block-head-b */}
      <div className="space-y-12">
        {categoryEntries
          .filter(([key]) => selectedCat === "all" || selectedCat === key)
          .map(([key, cat]) => {
            const catTools = filtered.filter((t) => t.category === key);
            if (catTools.length === 0) return null;

            return (
              <section key={key} id={key}>
                <div className="block-head-b justify-between">
                  <h2 className="heading">{cat.label} Tools</h2>
                  <a
                    href={cat.wpUrl}
                    className="font-heading text-xs font-semibold uppercase tracking-wider text-accent hover:underline"
                  >
                    Browse {cat.label} Guides &rarr;
                  </a>
                </div>
                <p className="mb-5 text-sm text-text-muted max-w-3xl">
                  {cat.description}
                </p>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {catTools.map((tool) => (
                    <div
                      key={tool.slug}
                      className="flex flex-col justify-between rounded border border-border bg-surface p-5 shadow-soft hover:border-accent transition group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="cat-badge text-[10px]! px-2! py-0.5!">
                            {cat.label}
                          </span>
                          <Link
                            href={`/tools/${tool.slug}/`}
                            className="text-xs font-heading font-semibold uppercase tracking-wider text-accent flex items-center gap-1 group-hover:translate-x-0.5 transition"
                          >
                            Launch Tool <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>

                        <Link href={`/tools/${tool.slug}/`} className="block mt-3">
                          <h3 className="font-heading text-xl font-bold text-text group-hover:text-accent transition leading-snug">
                            {tool.name}
                          </h3>
                        </Link>

                        <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-3">
                          {tool.subhead}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                        <a
                          href={tool.pillarUrl}
                          className="inline-flex items-center gap-1 hover:text-accent transition truncate max-w-[85%]"
                          title={tool.pillarTitle}
                        >
                          <BookOpen className="h-3.5 w-3.5 text-accent shrink-0" />
                          <span className="truncate">Guide: {tool.pillarTitle}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

        {filtered.length === 0 && (
          <div className="rounded border border-border bg-surface p-10 text-center">
            <p className="font-heading text-lg font-bold text-text">
              No tools matched &ldquo;{search}&rdquo;
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Try clearing your search filter or switching to &ldquo;All Tools&rdquo;.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

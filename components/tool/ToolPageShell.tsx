import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { categories } from "@/lib/tools/categories";
import { SocialShareBar } from "@/components/tool/SocialShareBar";
import { ToolContentHub } from "@/components/tool/ToolContentHub";

interface ToolPageShellProps {
  tool: Tool;
  relatedTools: Tool[];
  children: React.ReactNode;
}

export function ToolPageShell({
  tool,
  relatedTools,
  children,
}: ToolPageShellProps) {
  const catInfo = categories[tool.category];
  const canonicalUrl = `https://www.zerosuniverse.com/tools/${tool.slug}/`;

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    url: canonicalUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser (100% Client-Side)",
    description: tool.metaDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "ZerosUniverse",
      url: "https://www.zerosuniverse.com/",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Use ${tool.name}`,
    description: tool.subhead,
    step: tool.howTo.map((s, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: s.name,
      text: s.text,
    })),
  };

  return (
    <main className="ts-contain pt-7 pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* SmartMag Modern Post Header (.the-post-header.s-head-modern-a) */}
      <div className="border-b border-border pb-5 mb-7">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <a href={catInfo.wpUrl} className="cat-badge">
            {catInfo.label}
          </a>
          <span className="inline-flex items-center gap-1.5 rounded-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% Client-Side Local Execution
          </span>
          <span className="text-xs text-text-muted hidden sm:inline">&bull;</span>
          <span className="text-xs text-text-muted hidden sm:inline font-mono-code">Updated 2026</span>
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl lg:text-[36px] font-bold tracking-tight text-text leading-[1.2]">
          {tool.h1}
        </h1>

        <p className="mt-2.5 max-w-3xl text-sm sm:text-base text-text-muted leading-relaxed">
          {tool.subhead}
          <a href="#tool-docs" className="text-accent hover:underline font-semibold ml-2 inline-flex items-center gap-0.5">
            Documentation &amp; FAQs &darr;
          </a>
        </p>

        {/* Share Buttons */}
        <SocialShareBar
          url={canonicalUrl}
          title={tool.h1}
          summary={tool.subhead}
          variant="top-header"
        />
      </div>

      {/* SmartMag 2-Column Layout: 8/12 Main Content + 4/12 Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Interactive Tool Card */}
          <section
            aria-label={`${tool.name} Interactive Workspace`}
            className="rounded-md border-2 border-border bg-surface p-5 sm:p-6 shadow-elevated"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff6a00]" />
                <span className="font-heading text-base font-bold uppercase tracking-wide text-text">
                  {tool.name} &mdash; Interactive Console
                </span>
              </div>
              <span className="text-xs text-text-muted">
                Runs locally in your browser &bull; Instant output
              </span>
            </div>

            {children}
          </section>

          {/* SmartMag Progressive Disclosure Content Hub (Guide, Specs, FAQs, Tutorial) */}
          <div id="tool-docs">
            <ToolContentHub tool={tool} />
          </div>

          {/* Slim Editorial Teaser Banner */}
          <div className="rounded border border-border bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs">
              <span className="font-heading font-bold uppercase text-accent tracking-wider block mb-0.5">
                Related Editorial Guide
              </span>
              <span className="font-heading font-semibold text-text text-sm">
                {tool.pillarTitle}
              </span>
            </div>
            <a
              href={tool.pillarUrl}
              className="inline-flex items-center justify-center shrink-0 rounded-xs bg-[#ff6a00] px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 transition no-underline"
            >
              Read Tutorial &rarr;
            </a>
          </div>

          {/* Social Share Callout at Bottom of Content */}
          <SocialShareBar
            url={canonicalUrl}
            title={tool.h1}
            summary={tool.subhead}
            variant="bottom-cta"
          />
        </div>

        {/* Right Sidebar (4/12) matching SmartMag .main-sidebar */}
        <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
          {/* Widget 1: Related Tools in Category */}
          <div className="rounded border border-border bg-surface p-5 shadow-soft">
            <div className="block-head-b mb-4">
              <h3 className="heading text-lg!">Related {catInfo.label} Tools</h3>
            </div>
            <div className="divide-y divide-border">
              {relatedTools.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/tools/${rel.slug}/`}
                  className="block py-3 first:pt-0 last:pb-0 group"
                >
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-accent">
                    {categories[rel.category]?.label || rel.category}
                  </span>
                  <h4 className="font-heading text-base font-semibold text-text group-hover:text-accent transition leading-snug">
                    {rel.name}
                  </h4>
                  <p className="mt-1 text-xs text-text-muted line-clamp-2">
                    {rel.subhead}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Widget 2: ZerosUniverse Categories Directory */}
          <div className="rounded border border-border bg-surface p-5 shadow-soft">
            <div className="block-head-b mb-4">
              <h3 className="heading text-lg!">Explore ZerosUniverse</h3>
            </div>
            <ul className="space-y-2.5 list-none m-0 p-0">
              {Object.entries(categories).map(([key, cat]) => (
                <li
                  key={key}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-b-0 last:pb-0"
                >
                  <a
                    href={cat.wpUrl}
                    className="font-heading text-sm font-semibold uppercase tracking-wide text-text hover:text-accent transition"
                  >
                    {cat.label} Articles
                  </a>
                  <Link
                    href={`/tools/#${key}`}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    View Tools &rarr;
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Widget 3: Privacy & Zero-Server Guarantee */}
          <div className="rounded border border-border bg-background p-5">
            <div className="flex items-center gap-2 text-accent font-heading font-bold uppercase text-sm">
              <ShieldCheck className="h-4 w-4" />
              100% Client-Side Privacy
            </div>
            <p className="mt-2 text-xs text-text-muted leading-relaxed m-0">
              All calculations, file inspections, and cryptographic hashes on{" "}
              <strong>ZerosUniverse Tools</strong> execute strictly inside your browser&rsquo;s local memory via WebCrypto and HTML5 Canvas. No sensitive payloads are ever logged or stored on our servers.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

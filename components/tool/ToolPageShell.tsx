import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  BookOpen,
  ArrowUpRight,
  CheckCircle2,
  HelpCircle,
  Layers,
  Sparkles,
  Share2,
} from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { categories } from "@/lib/tools/categories";

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
  const formattedDate = new Date(tool.lastUpdated).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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

      {/* Breadcrumbs matching SmartMag */}
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-text-muted flex flex-wrap items-center gap-1.5">
        <a href="https://www.zerosuniverse.com/" className="hover:text-accent transition">
          Home
        </a>
        <span>&raquo;</span>
        <Link href="/tools/" className="hover:text-accent transition">
          Tools
        </Link>
        <span>&raquo;</span>
        <a href={catInfo.wpUrl} className="hover:text-accent transition">
          {catInfo.label}
        </a>
        <span>&raquo;</span>
        <span className="text-text font-medium">{tool.name}</span>
      </nav>

      {/* SmartMag Modern Post Header (.the-post-header.s-head-modern-a) */}
      <div className="border-b border-border pb-6 mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <a href={catInfo.wpUrl} className="cat-badge">
            {catInfo.label}
          </a>
          <span className="inline-flex items-center gap-1 rounded-xs border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            100% Client-Side Browser Tool (Zero Server Upload)
          </span>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-text leading-[1.18]">
          {tool.h1}
        </h1>

        <p className="mt-3 max-w-3xl text-base sm:text-lg text-text-muted leading-relaxed">
          {tool.subhead}
        </p>

        {/* SmartMag Author Meta Bar + Share Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-text-muted">
            <img
              src="https://cdn.zerosuniverse.com/wp-content/uploads/2022/06/Zerosuniverse.jpg"
              alt="zerosuniverse Team"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover border border-border"
            />
            <span>
              By{" "}
              <a
                href="https://www.zerosuniverse.com/author/zerosuniverse/"
                className="font-semibold text-text hover:text-accent transition"
              >
                zerosuniverse Team
              </a>
            </span>
            <span>&ndash;</span>
            <time dateTime={tool.lastUpdated}>{formattedDate}</time>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(canonicalUrl)}`}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xs bg-[#1877f2] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition"
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(tool.h1)}`}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xs bg-[#161616] border border-[#333] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition"
            >
              X (Twitter)
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(tool.h1 + " " + canonicalUrl)}`}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xs bg-[#25d366] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* SmartMag 2-Column Layout: 8/12 Main Content + 4/12 Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column (8/12) */}
        <div className="lg:col-span-8 space-y-10">
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

          {/* Companion WordPress Pillar Guide Banner */}
          <div className="rounded-md border-l-4 border-l-[#ff6a00] border border-border bg-background p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  In-Depth ZerosUniverse Tutorial
                </span>
                <h2 className="mt-1 font-heading text-xl font-bold text-text">
                  {tool.pillarTitle}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-text-muted">
                  Read our complete step-by-step editorial guide, architecture breakdown, and defensive best practices on ZerosUniverse.
                </p>
              </div>
              <a
                href={tool.pillarUrl}
                className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded-xs bg-[#ff6a00] px-4 py-2.5 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:opacity-90 transition no-underline"
              >
                Read Full Guide
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Step-by-Step How To Use Section (.block-head-b) */}
          <section className="entry-content">
            <div className="block-head-b">
              <h2 className="heading">How to Use {tool.name}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {tool.howTo.map((step, index) => (
                <div
                  key={step.name}
                  className="rounded border border-border bg-surface p-4 shadow-soft"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xs bg-[#ff6a00] font-heading text-xs font-bold text-white">
                      0{index + 1}
                    </span>
                    <h3 className="font-heading text-base font-bold text-text m-0">
                      {step.name}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed m-0">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Key Technical Features Section */}
          <section className="entry-content">
            <div className="block-head-b">
              <h2 className="heading">Key Capabilities &amp; Technical Architecture</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {tool.features.map((feat) => (
                <div
                  key={feat.title}
                  className="rounded border border-border bg-surface p-4"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    <h3 className="font-heading text-base font-bold text-text m-0">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed m-0">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Real-World Use Cases Section */}
          <section className="entry-content">
            <div className="block-head-b">
              <h2 className="heading">Practical Use Cases</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {tool.useCases.map((uc) => (
                <div
                  key={uc.title}
                  className="rounded border border-border bg-background p-4"
                >
                  <h3 className="font-heading text-base font-bold text-text m-0">
                    {uc.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-text-muted leading-relaxed m-0">
                    {uc.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Frequently Asked Questions (FAQPage) */}
          <section>
            <div className="block-head-b">
              <h2 className="heading">Frequently Asked Questions (FAQs)</h2>
            </div>
            <div className="space-y-3">
              {tool.faq.map((item) => (
                <details
                  key={item.question}
                  className="group rounded border border-border bg-surface p-4 open:border-accent transition"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-heading text-base font-bold text-text">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-accent shrink-0" />
                      {item.question}
                    </span>
                    <span className="text-accent font-mono-code text-lg group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 border-t border-border pt-3 text-sm text-text-muted leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
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

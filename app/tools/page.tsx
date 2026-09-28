import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Flame,
  Sparkles,
  Zap,
} from "lucide-react";
import { categories } from "@/lib/tools/categories";
import { tools } from "@/lib/tools/registry";
import type { ToolCategory } from "@/lib/tools/types";

export const metadata: Metadata = {
  title: "Free Cybersecurity, Android, AI & Tech Tools (2026) | ZerosUniverse",
  description:
    "Explore 150+ free 100% browser-based interactive tools for Cybersecurity, Penetration Testing, Android diagnostics, Local LLM VRAM sizing, and Tech benchmarks by ZerosUniverse.",
  alternates: {
    canonical: "https://www.zerosuniverse.com/tools/",
  },
  openGraph: {
    title: "Free Cybersecurity, Android, AI & Tech Tools (2026) | ZerosUniverse",
    description:
      "150+ interactive browser-first utilities built for ethical hackers, Android power users, AI engineers, and system administrators. Zero server uploads.",
    url: "https://www.zerosuniverse.com/tools/",
    siteName: "ZerosUniverse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Cybersecurity, Android, AI & Tech Tools (2026) | ZerosUniverse",
    description:
      "150+ interactive browser-first utilities for Cybersecurity, Android, AI & Tech. Instant client-side execution.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
};

interface SpotlightTool {
  slug: string;
  name: string;
  intentBadge: string;
  category: ToolCategory;
  description: string;
}

const SPOTLIGHT_TOOLS: SpotlightTool[] = [
  {
    slug: "nmap-command-builder",
    name: "Nmap & FFUF Builder",
    intentBadge: "Recon & Fuzzing",
    category: "cybersecurity",
    description:
      "Generate stealth SYN, service detection (-A), NSE vuln scripts, and FFUF directory fuzzing CLI syntax.",
  },
  {
    slug: "game-server-ping-ff-sensitivity",
    name: "Free Fire Ping & Sensitivity",
    intentBadge: "Headshot & Ping",
    category: "android",
    description:
      "OB46+ 0–200 sensitivity scaling, 1-tap drag DPI sweet spots, and regional ping latency diagnostic.",
  },
  {
    slug: "termux-nethunter-android-pentest-builder",
    name: "Termux & NetHunter CLI",
    intentBadge: "Rootless CLI",
    category: "android",
    description:
      "Android 14–16 packages, Phantom Process Killer bypass, and Kali NetHunter rootless audit setup.",
  },
  {
    slug: "yt-dlp-aria2c-media-stream-command-builder",
    name: "yt-dlp & aria2c Studio",
    intentBadge: "16-Thread Downloader",
    category: "apps",
    description:
      "Construct 16-connection multi-threaded downloads, 4K AV1/VP9 muxing, and SponsorBlock auto-cutting.",
  },
  {
    slug: "hashcat-john-hash-type-identifier",
    name: "Hashcat Mode Identifier",
    intentBadge: "Hash Mode ID",
    category: "cybersecurity",
    description:
      "Instant regex hash prefix and length detection mapping directly to Hashcat (-m) and John (--format) flags.",
  },
  {
    slug: "android-ussd-spyware-scanner",
    name: "Android USSD Spyware Check",
    intentBadge: "Forwarding & Spyware",
    category: "android",
    description:
      "Query GSM/MMI diverts (*#21#, *#62#), master erasure (##002#), and stalkerware permission triaging.",
  },
  {
    slug: "local-llm-vram-calculator",
    name: "Local LLM VRAM Calculator",
    intentBadge: "GPU VRAM Sizing",
    category: "ai",
    description:
      "Calculate VRAM requirements for 7B–671B models across FP16, Q8_0, and Q4_K_M GGUF with KV context buffers.",
  },
  {
    slug: "wireguard-vpn-config-split-tunnel-builder",
    name: "WireGuard Config Builder",
    intentBadge: "Split-Tunnel AllowedIPs",
    category: "cybersecurity",
    description:
      "Generate client/server wg0.conf profiles with split-tunnel AllowedIPs, MTU 1420 tuning, and PostUp NAT.",
  },
  {
    slug: "india-salary-epfo-tds-calculator",
    name: "India 2026 In-Hand Salary",
    intentBadge: "FY 2026–27 Tax",
    category: "apps",
    description:
      "FY 2026–27 New vs Old Tax Regime comparison, monthly take-home salary, EPFO contribution, and Section 87A.",
  },
  {
    slug: "display-refresh-rate-hz-tester",
    name: "120Hz/240Hz Display Tester",
    intentBadge: "Display Hz & Motion",
    category: "tech",
    description:
      "Real-time DOMHighRes requestAnimationFrame loop measuring genuine 60Hz, 120Hz, 144Hz, and 240Hz refresh rates.",
  },
  {
    slug: "webrtc-vpn-leak-tester",
    name: "WebRTC VPN Leak Tester",
    intentBadge: "IP Leak Diagnostic",
    category: "android",
    description:
      "Discover real public IPv4/IPv6 addresses bypassing active VPN tunnels via RTCPeerConnection candidate inspection.",
  },
  {
    slug: "webauthn-fido2-passkey-attestation-lab",
    name: "WebAuthn Passkey Lab",
    intentBadge: "FIDO2 & Passkeys",
    category: "cybersecurity",
    description:
      "Interactive WebAuthn PublicKeyCredential ceremony generator with CBOR attestation and authenticator audits.",
  },
];

export default function ToolsHubPage() {
  const categoryEntries = Object.entries(categories) as [
    ToolCategory,
    (typeof categories)[ToolCategory],
  ][];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.zerosuniverse.com/tools/#webpage",
        url: "https://www.zerosuniverse.com/tools/",
        name: "Free Cybersecurity, Android, AI & Tech Tools (2026) | ZerosUniverse",
        description:
          "150+ interactive browser-first utilities built for ethical hackers, Android power users, AI engineers, and system administrators. Zero server uploads.",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "ZerosUniverse",
              item: "https://www.zerosuniverse.com/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Interactive Tools Hub",
              item: "https://www.zerosuniverse.com/tools/",
            },
          ],
        },
      },
      {
        "@type": "ItemList",
        "@id": "https://www.zerosuniverse.com/tools/#tools-list",
        name: "ZerosUniverse Free Online Interactive Tools Directory (2026)",
        description:
          "Comprehensive index of free 100% client-side developer, cybersecurity, Android, and AI utilities.",
        numberOfItems: tools.length,
        itemListElement: tools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.name,
          description: tool.subhead,
          url: `https://www.zerosuniverse.com/tools/${tool.slug}/`,
        })),
      },
    ],
  };

  return (
    <main className="ts-contain pt-7 pb-12">
      {/* Schema.org ItemList & WebPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-4 text-xs text-text-muted flex items-center gap-1.5"
      >
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
          <div className="flex flex-wrap items-center gap-2" id="category-filter-buttons">
            <button
              type="button"
              data-cat-btn="all"
              className="cat-pill-btn px-3.5 py-1.5 rounded-xs font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer bg-[#ff6a00] text-white"
            >
              All Tools ({tools.length})
            </button>
            {categoryEntries.map(([key, cat]) => {
              const count = tools.filter((t) => t.category === key).length;
              return (
                <button
                  key={key}
                  type="button"
                  data-cat-btn={key}
                  className="cat-pill-btn px-3.5 py-1.5 rounded-xs font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-border bg-surface text-text hover:border-accent"
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              id="tool-search-input"
              type="text"
              placeholder="Filter tools by name or keyword..."
              className="w-full rounded-xs border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* 🔥 Most Popular & Fast-Launch Utilities (2026) Spotlight Section */}
      <section
        id="spotlight-tools"
        aria-label="Most Popular & Fast-Launch Utilities (2026)"
        className="mb-12 rounded-lg border-2 border-border bg-background p-5 sm:p-6 shadow-soft"
      >
        <div className="block-head-b justify-between flex-wrap gap-2 mb-6">
          <h2 className="heading flex items-center gap-2 text-xl! sm:text-2xl!">
            <Flame className="h-5 w-5 text-accent shrink-0 fill-accent" />
            <span>🔥 Most Popular &amp; Fast-Launch Utilities (2026)</span>
          </h2>
          <span className="cat-badge text-[10px]! px-2.5! py-0.5!">
            Top Search Volume &bull; Fast Launch
          </span>
        </div>

        <p className="mb-6 text-xs sm:text-sm text-text-muted max-w-3xl">
          Direct 1-click access to our highest-traffic penetration testing, gaming sensitivity, media streaming, and AI calculation engines calibrated for 2026 standards.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SPOTLIGHT_TOOLS.map((item) => (
            <Link
              key={item.slug}
              href={`/tools/${item.slug}/`}
              className="group flex flex-col justify-between rounded border border-border bg-surface p-4 shadow-soft hover:border-accent hover:shadow-elevated transition"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-accent truncate">
                    {categories[item.category]?.label || item.category}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-xs bg-[#ff6a00]/10 border border-[#ff6a00]/30 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-accent shrink-0">
                    <Sparkles className="h-2.5 w-2.5" />
                    {item.intentBadge}
                  </span>
                </div>

                <h3 className="font-heading text-base font-bold text-text group-hover:text-accent transition leading-snug">
                  {item.name}
                </h3>

                <p className="mt-1.5 text-xs text-text-muted leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs font-heading font-semibold uppercase tracking-wider text-accent">
                <span className="group-hover:translate-x-0.5 transition flex items-center gap-1">
                  Launch Console <ArrowRight className="h-3.5 w-3.5" />
                </span>
                <Zap className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Category Tool Grid */}
      <div className="space-y-12" id="tools-catalog">
        {categoryEntries.map(([key, cat]) => {
          const catTools = tools.filter((t) => t.category === key);
          if (catTools.length === 0) return null;

          return (
            <section key={key} id={key} data-cat-section={key}>
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
                    data-tool-card=""
                    data-tool-cat={tool.category}
                    data-tool-search={`${tool.name} ${tool.subhead} ${tool.primaryKeyword} ${tool.secondaryKeywords.join(" ")}`.toLowerCase()}
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

        {/* Empty Search State */}
        <div
          id="no-tools-match"
          style={{ display: "none" }}
          className="rounded border border-border bg-surface p-10 text-center"
        >
          <p className="font-heading text-lg font-bold text-text">
            No tools matched your filter
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Try clearing your search query or switching back to &ldquo;All Tools&rdquo;.
          </p>
        </div>
      </div>

      {/* Lightweight Instant Client-Side Filter Script (Preserves 100% SSR HTML for Googlebot) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var searchInput = document.getElementById('tool-search-input');
              var catButtons = document.querySelectorAll('.cat-pill-btn');
              var sections = document.querySelectorAll('[data-cat-section]');
              var emptyState = document.getElementById('no-tools-match');
              var currentCat = 'all';
              var currentQuery = '';

              function applyFilters() {
                var visibleCount = 0;
                var q = currentQuery.toLowerCase().trim();

                sections.forEach(function(sec) {
                  var secCat = sec.getAttribute('data-cat-section');
                  var catMatch = (currentCat === 'all' || currentCat === secCat);
                  var cards = sec.querySelectorAll('[data-tool-card]');
                  var secVisibleCards = 0;

                  cards.forEach(function(card) {
                    var searchText = card.getAttribute('data-tool-search') || '';
                    var matchesSearch = (!q || searchText.indexOf(q) !== -1);
                    if (catMatch && matchesSearch) {
                      card.style.display = '';
                      secVisibleCards++;
                      visibleCount++;
                    } else {
                      card.style.display = 'none';
                    }
                  });

                  if (secVisibleCards > 0 && catMatch) {
                    sec.style.display = '';
                  } else {
                    sec.style.display = 'none';
                  }
                });

                if (emptyState) {
                  emptyState.style.display = visibleCount === 0 ? '' : 'none';
                }
              }

              catButtons.forEach(function(btn) {
                btn.addEventListener('click', function() {
                  currentCat = btn.getAttribute('data-cat-btn') || 'all';
                  catButtons.forEach(function(b) {
                    var isActive = (b === btn);
                    if (isActive) {
                      b.className = 'cat-pill-btn px-3.5 py-1.5 rounded-xs font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer bg-[#ff6a00] text-white';
                    } else {
                      b.className = 'cat-pill-btn px-3.5 py-1.5 rounded-xs font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-border bg-surface text-text hover:border-accent';
                    }
                  });
                  applyFilters();
                });
              });

              if (searchInput) {
                searchInput.addEventListener('input', function(e) {
                  currentQuery = e.target.value || '';
                  applyFilters();
                });
              }
            })();
          `,
        }}
      />
    </main>
  );
}

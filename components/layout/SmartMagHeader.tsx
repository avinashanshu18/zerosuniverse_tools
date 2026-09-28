"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun, Search, Menu, X, Wrench, ArrowRight } from "lucide-react";
import { tools } from "@/lib/tools/registry";
import { categories } from "@/lib/tools/categories";

const NAV_LINKS = [
  { label: "CYBERSECURITY", href: "https://www.zerosuniverse.com/cyber-security/", external: true },
  { label: "ANDROID", href: "https://www.zerosuniverse.com/android/", external: true },
  { label: "APPS", href: "https://www.zerosuniverse.com/apps/", external: true },
  { label: "AI", href: "https://www.zerosuniverse.com/artificial-intelligence/", external: true },
  { label: "Tech", href: "https://www.zerosuniverse.com/tech/", external: true },
  { label: "TOOLS", href: "/tools/", external: false, active: true },
];

export function SmartMagHeader() {
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("bunyad-scheme");
    const prefersDark =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("s-dark", prefersDark);
    document.documentElement.classList.toggle("s-light", !prefersDark);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleScheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem("bunyad-scheme", nextDark ? "dark" : "light");
    document.documentElement.classList.toggle("s-dark", nextDark);
    document.documentElement.classList.toggle("s-light", !nextDark);
  };

  const filteredTools = tools.filter((t) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.subhead.toLowerCase().includes(q) ||
      t.primaryKeyword.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <header className="smart-head-main" id="smart-head">
        <div className="ts-contain smart-head-mid justify-between">
          {/* Left: Logo + Main Navigation */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open Menu"
              className="inline-flex items-center justify-center p-2 lg:hidden text-text hover:text-accent transition"
            >
              <Menu className="h-6 w-6" />
            </button>

            <a
              href="https://www.zerosuniverse.com/"
              title="Zerosuniverse"
              rel="home"
              className="flex items-center shrink-0 pr-1"
            >
              <img
                src="https://cdn.zerosuniverse.com/wp-content/uploads/2022/06/Zerosuniverse.jpg"
                alt="Zerosuniverse"
                width={52}
                height={52}
                className="h-[52px] w-auto object-contain rounded-sm"
              />
            </a>

            <nav className="hidden lg:flex items-center" aria-label="Primary Navigation">
              <ul className="flex items-center list-none m-0 p-0">
                {NAV_LINKS.map((item) => (
                  <li key={item.label} className="m-0 p-0">
                    {item.external ? (
                      <a href={item.href} className="nav-item-link">
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className={`nav-item-link ${item.active ? "is-active" : ""}`}
                      >
                        <Wrench className="w-3.5 h-3.5 mr-1.5 text-accent" />
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right: Social + Dark Mode Toggle + Search */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-2 rounded border border-border bg-background px-3 py-1.5 text-xs font-medium text-text-muted hover:border-accent hover:text-text transition cursor-pointer"
              title="Search 25 Interactive Tools (⌘K)"
            >
              <Search className="h-3.5 w-3.5 text-accent" />
              <span className="hidden sm:inline">Search Tools...</span>
              <kbd className="hidden md:inline-block rounded bg-surface px-1.5 py-0.5 text-[10px] border border-border">
                ⌘K
              </kbd>
            </button>

            {/* Facebook & X Social Icons matching SmartMag header */}
            <div className="hidden sm:flex items-center gap-1">
              <a
                href="https://www.facebook.com/sharer.php?u=https%3A%2F%2Fwww.zerosuniverse.com%2Ftools%2F"
                target="_blank"
                rel="nofollow noopener noreferrer"
                aria-label="Facebook"
                className="p-2 text-text hover:text-accent transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fwww.zerosuniverse.com%2Ftools%2F"
                target="_blank"
                rel="nofollow noopener noreferrer"
                aria-label="X (Twitter)"
                className="p-2 text-text hover:text-accent transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

            {/* SmartMag Scheme Switcher */}
            <button
              type="button"
              onClick={toggleScheme}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded text-text hover:text-accent transition cursor-pointer"
            >
              {isDark ? <Sun className="h-4 w-4 text-accent" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Off-Canvas Drawer matching SmartMag .off-canvas */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-[#121212] text-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2b2b2b] pb-4">
              <a href="https://www.zerosuniverse.com/" className="flex items-center gap-2">
                <img
                  src="https://cdn.zerosuniverse.com/wp-content/uploads/2022/06/Zerosuniverse.jpg"
                  alt="Zerosuniverse"
                  className="h-10 w-auto rounded-sm"
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white"
                aria-label="Close Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-6 flex-1">
              <ul className="space-y-3 list-none p-0 m-0">
                {NAV_LINKS.map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        className="block py-2 font-heading text-lg font-semibold uppercase tracking-wide text-gray-100 hover:text-[#ff6a00]"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 font-heading text-lg font-semibold uppercase tracking-wide text-[#ff6a00]"
                      >
                        {item.label} (25 Free Tools)
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Instant Tool Search Modal (⌘K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-md border border-border bg-surface p-5 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Search className="h-5 w-5 text-accent shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 25 Cybersecurity, Android, AI & Tech tools..."
                className="w-full bg-transparent text-base text-text outline-none placeholder:text-text-muted"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded p-1 text-text-muted hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto divide-y divide-border">
              {filteredTools.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}/`}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between py-3 px-2 hover:bg-background rounded transition group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="cat-badge text-[10px] py-0.5 px-2">
                        {categories[t.category]?.label || t.category}
                      </span>
                      <span className="font-heading text-base font-semibold text-text group-hover:text-accent">
                        {t.name}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-muted line-clamp-1">{t.subhead}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent shrink-0 ml-3" />
                </Link>
              ))}
              {filteredTools.length === 0 && (
                <p className="py-8 text-center text-sm text-text-muted">
                  No tools found matching &ldquo;{query}&rdquo;.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

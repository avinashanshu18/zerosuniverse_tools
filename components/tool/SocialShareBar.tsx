"use client";

import React, { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";

export interface SocialShareBarProps {
  url: string;
  title: string;
  summary?: string;
  variant?: "top-header" | "bottom-cta" | "inline";
  className?: string;
}

export function SocialShareBar({
  url,
  title,
  summary,
  variant = "top-header",
  className = "",
}: SocialShareBarProps) {
  const [copied, setCopied] = useState(false);

  const shareText = title ? `${title} — 100% Free Client-Side Tool` : "ZerosUniverse Tools";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback prompt if clipboard API is restricted
      window.prompt("Copy URL:", url);
    }
  };

  const openShare = (platform: "whatsapp" | "twitter" | "linkedin") => {
    let targetUrl = "";
    switch (platform) {
      case "whatsapp":
        targetUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${url}`)}`;
        break;
      case "twitter":
        targetUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }

    if (targetUrl) {
      // Open popup with clean dimensions
      window.open(targetUrl, "_blank", "noopener,noreferrer,width=600,height=560");
    }
  };

  if (variant === "bottom-cta") {
    return (
      <div className={`rounded-md border border-border bg-surface p-5 sm:p-6 shadow-soft ${className}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5" />
              Help Your Network
            </span>
            <h3 className="font-heading text-lg font-bold text-text mt-1">
              Found this tool helpful? Share it with colleagues:
            </h3>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              100% free, private browser utility with zero server uploads. Spread the word!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => openShare("whatsapp")}
              title="Share on WhatsApp"
              aria-label="Share on WhatsApp"
              className="inline-flex items-center gap-1.5 rounded-xs bg-[#25D366] hover:bg-[#20bd5a] px-3.5 py-2 font-heading text-xs font-bold text-white transition shadow-sm cursor-pointer"
            >
              <WhatsAppIcon />
              <span>WhatsApp</span>
            </button>

            {/* X / Twitter */}
            <button
              type="button"
              onClick={() => openShare("twitter")}
              title="Share on X (Twitter)"
              aria-label="Share on X (Twitter)"
              className="inline-flex items-center gap-1.5 rounded-xs bg-[#0f1419] hover:bg-[#000000] border border-[#333] px-3.5 py-2 font-heading text-xs font-bold text-white transition shadow-sm cursor-pointer"
            >
              <XIcon />
              <span>X (Twitter)</span>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => openShare("linkedin")}
              title="Share on LinkedIn"
              aria-label="Share on LinkedIn"
              className="inline-flex items-center gap-1.5 rounded-xs bg-[#0A66C2] hover:bg-[#08549e] px-3.5 py-2 font-heading text-xs font-bold text-white transition shadow-sm cursor-pointer"
            >
              <LinkedInIcon />
              <span>LinkedIn</span>
            </button>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy shareable link"
              aria-label="Copy shareable link"
              className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-background hover:border-accent px-3.5 py-2 font-heading text-xs font-semibold text-text transition cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Link2 className="h-3.5 w-3.5 text-accent" />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: Top Header Bar
  return (
    <div className={`mt-5 flex flex-wrap items-center gap-2 ${className}`}>
      <span className="font-heading text-xs font-bold uppercase tracking-wider text-text-muted mr-1 hidden sm:inline-flex items-center gap-1">
        <Share2 className="h-3 w-3 text-accent" />
        Share:
      </span>

      {/* WhatsApp */}
      <button
        type="button"
        onClick={() => openShare("whatsapp")}
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
        className="inline-flex items-center gap-1.5 rounded-xs bg-[#25D366] hover:bg-[#20bd5a] px-3 py-1.5 text-xs font-semibold text-white transition shadow-xs cursor-pointer active:scale-95"
      >
        <WhatsAppIcon />
        <span>WhatsApp</span>
      </button>

      {/* X (Twitter) */}
      <button
        type="button"
        onClick={() => openShare("twitter")}
        title="Share on X (Twitter)"
        aria-label="Share on X (Twitter)"
        className="inline-flex items-center gap-1.5 rounded-xs bg-[#0f1419] hover:bg-[#000000] border border-[#333] px-3 py-1.5 text-xs font-semibold text-white transition shadow-xs cursor-pointer active:scale-95"
      >
        <XIcon />
        <span>X (Twitter)</span>
      </button>

      {/* LinkedIn */}
      <button
        type="button"
        onClick={() => openShare("linkedin")}
        title="Share on LinkedIn"
        aria-label="Share on LinkedIn"
        className="inline-flex items-center gap-1.5 rounded-xs bg-[#0A66C2] hover:bg-[#08549e] px-3 py-1.5 text-xs font-semibold text-white transition shadow-xs cursor-pointer active:scale-95"
      >
        <LinkedInIcon />
        <span>LinkedIn</span>
      </button>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopyLink}
        title="Copy direct share link"
        aria-label="Copy direct share link"
        className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-background hover:border-accent px-3 py-1.5 text-xs font-semibold text-text transition cursor-pointer active:scale-95"
      >
        {copied ? <Check className="h-3 w-3 text-accent" /> : <Link2 className="h-3 w-3 text-accent" />}
        <span>{copied ? "Link Copied!" : "Copy Link"}</span>
      </button>
    </div>
  );
}

// Brand SVG Icons
function WhatsAppIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

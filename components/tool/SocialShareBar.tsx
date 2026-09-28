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

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary || shareText,
          url,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  const openShare = (platform: "whatsapp" | "twitter" | "linkedin" | "reddit" | "facebook" | "telegram") => {
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
      case "reddit":
        targetUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        break;
      case "facebook":
        targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "telegram":
        targetUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
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

            {/* Reddit */}
            <button
              type="button"
              onClick={() => openShare("reddit")}
              title="Share on Reddit"
              aria-label="Share on Reddit"
              className="inline-flex items-center gap-1.5 rounded-xs bg-[#FF4500] hover:bg-[#e03d00] px-3.5 py-2 font-heading text-xs font-bold text-white transition shadow-sm cursor-pointer"
            >
              <RedditIcon />
              <span>Reddit</span>
            </button>

            {/* Telegram */}
            <button
              type="button"
              onClick={() => openShare("telegram")}
              title="Share on Telegram"
              aria-label="Share on Telegram"
              className="inline-flex items-center gap-1.5 rounded-xs bg-[#229ED9] hover:bg-[#1e8ec3] px-3.5 py-2 font-heading text-xs font-bold text-white transition shadow-sm cursor-pointer"
            >
              <TelegramIcon />
              <span>Telegram</span>
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

      {/* Reddit */}
      <button
        type="button"
        onClick={() => openShare("reddit")}
        title="Share on Reddit"
        aria-label="Share on Reddit"
        className="inline-flex items-center gap-1.5 rounded-xs bg-[#FF4500] hover:bg-[#e03d00] px-3 py-1.5 text-xs font-semibold text-white transition shadow-xs cursor-pointer active:scale-95"
      >
        <RedditIcon />
        <span>Reddit</span>
      </button>

      {/* Telegram */}
      <button
        type="button"
        onClick={() => openShare("telegram")}
        title="Share on Telegram"
        aria-label="Share on Telegram"
        className="inline-flex items-center gap-1.5 rounded-xs bg-[#229ED9] hover:bg-[#1e8ec3] px-3 py-1.5 text-xs font-semibold text-white transition shadow-xs cursor-pointer active:scale-95"
      >
        <TelegramIcon />
        <span>Telegram</span>
      </button>

      {/* Facebook */}
      <button
        type="button"
        onClick={() => openShare("facebook")}
        title="Share on Facebook"
        aria-label="Share on Facebook"
        className="inline-flex items-center gap-1.5 rounded-xs bg-[#1877F2] hover:bg-[#1565cc] px-3 py-1.5 text-xs font-semibold text-white transition shadow-xs cursor-pointer active:scale-95"
      >
        <FacebookIcon />
        <span>Facebook</span>
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

function RedditIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.703zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

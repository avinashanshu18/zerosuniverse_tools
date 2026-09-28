import React from "react";

const FOOTER_LINKS = [
  { label: "About", href: "https://www.zerosuniverse.com/about-us/" },
  { label: "Contact", href: "https://www.zerosuniverse.com/contact-us/" },
  { label: "Disclaimer", href: "https://www.zerosuniverse.com/disclaimer/" },
  { label: "Privacy", href: "https://www.zerosuniverse.com/privacy-policy/" },
  { label: "Guest Post", href: "https://www.zerosuniverse.com/guest-post/" },
];

export function SmartMagFooter() {
  return (
    <footer className="main-footer-dark">
      <div className="ts-contain flex flex-col items-center text-center space-y-6">
        {/* Social Icons Row (.spc-social-block.spc-social-b) */}
        <div className="flex items-center justify-center gap-3">
          <a
            href="#"
            aria-label="Facebook"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e1e] text-gray-300 hover:bg-[#ff6a00] hover:text-white transition"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a
            href="#"
            aria-label="X (Twitter)"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e1e] text-gray-300 hover:bg-[#ff6a00] hover:text-white transition"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="#"
            aria-label="Pinterest"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e1e] text-gray-300 hover:bg-[#ff6a00] hover:text-white transition"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.176-4.068-2.845 0-4.516 2.135-4.516 4.34 0 .859.331 1.781.745 2.281a.3.3 0 0 1 .069.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.525-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
          </a>
          <a
            href="#"
            aria-label="LinkedIn"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e1e] text-gray-300 hover:bg-[#ff6a00] hover:text-white transition"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>

        {/* Footer Menu Links (#menu-footer) */}
        <ul className="flex flex-wrap items-center justify-center gap-6 list-none m-0 p-0">
          {FOOTER_LINKS.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-200 hover:text-[#ff6a00] transition no-underline"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Copyright Line */}
        <div className="text-sm text-gray-400">
          © 2022{" "}
          <a
            href="https://www.zerosuniverse.com/"
            className="text-gray-200 hover:text-[#ff6a00] transition no-underline"
          >
            Zerosuniverse.com
          </a>{" "}
          | All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

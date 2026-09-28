import type { ToolCategory } from "@/lib/tools/types";

export const categories: Record<
  ToolCategory,
  {
    label: string;
    wpUrl: string;
    description: string;
    termColorClass: string;
  }
> = {
  cybersecurity: {
    label: "Cybersecurity",
    wpUrl: "https://www.zerosuniverse.com/cyber-security/",
    description:
      "Browser-first ethical hacking command builders, live DNSSEC & spoofing diagnostics, phishing email header analyzers, EXIF metadata strippers, LSB steganography, YARA rule builders, and CEH v13 simulators.",
    termColorClass: "term-color-7",
  },
  android: {
    label: "Android",
    wpUrl: "https://www.zerosuniverse.com/android/",
    description:
      "Android secret USSD & spyware permission scanners, universal ADB debloater script generators, live WebRTC/VPN leak testers, and regional game server ping + Free Fire sensitivity calculators.",
    termColorClass: "term-color-3239",
  },
  apps: {
    label: "Apps",
    wpUrl: "https://www.zerosuniverse.com/apps/",
    description:
      "Real-time Web Audio voice changer & pitch shifter studio, India FY 2026–27 in-hand salary & EPFO/TDS calculator, statistical standard deviation & SVG bell curve engine, and fullscreen OS update/terminal simulator.",
    termColorClass: "term-color-4757",
  },
  ai: {
    label: "AI",
    wpUrl: "https://www.zerosuniverse.com/artificial-intelligence/",
    description:
      "Local LLM VRAM & quantization hardware calculators, 2026 AI API token cost estimators, AI writing burstiness & cliché analyzers, and LLM prompt token & context window visualizers.",
    termColorClass: "term-color-17",
  },
  tech: {
    label: "Tech",
    wpUrl: "https://www.zerosuniverse.com/tech/",
    description:
      "Live 60Hz/120Hz/144Hz/240Hz display refresh rate & motion testers, home theater & gaming PC UPS VA sizing calculators, laptop SSD/RAM bottleneck analyzers, and binary hex/opcode inspectors.",
    termColorClass: "term-color-4",
  },
};

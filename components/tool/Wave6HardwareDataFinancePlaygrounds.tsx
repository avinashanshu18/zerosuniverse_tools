"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Mic,
  Volume2,
  Bluetooth,
  BatteryCharging,
  Image as ImageIcon,
  ScanLine,
  Table2,
  TrendingUp,
  Printer,
  Bookmark,
  Hexagon,
  Globe,
  PiggyBank,
  PhoneCall,
  Play,
  Square,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Layers,
  RefreshCw,
} from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { useToolCard, ToolActions } from "@/components/tool/ToolPlaygrounds";

/* ============================================================================
 * 14. VOICEPRINT FORMANT, MFCC & SPECTROGRAM ANALYZER
 * ========================================================================== */
interface VowelPreset {
  id: string;
  label: string;
  ipa: string;
  f0: number;
  f1: number;
  f2: number;
  f3: number;
  jitter: number;
  shimmer: number;
  syntheticFlag: boolean;
  note: string;
}

const VOWEL_PRESETS: VowelPreset[] = [
  {
    id: "beet",
    label: '/i/ "beet" (High Front)',
    ipa: "/i/",
    f0: 135,
    f1: 270,
    f2: 2290,
    f3: 3010,
    jitter: 0.42,
    shimmer: 2.1,
    syntheticFlag: false,
    note: "Tongue arched high and forward; maximum F2-F1 dispersion (~2020 Hz).",
  },
  {
    id: "father",
    label: '/ɑ/ "father" (Low Back)',
    ipa: "/ɑ/",
    f0: 120,
    f1: 730,
    f2: 1090,
    f3: 2440,
    jitter: 0.48,
    shimmer: 2.4,
    syntheticFlag: false,
    note: "Jaw open, pharyngeal constriction narrows F2-F1 spacing (~360 Hz).",
  },
  {
    id: "boot",
    label: '/u/ "boot" (High Back Rounded)',
    ipa: "/u/",
    f0: 130,
    f1: 300,
    f2: 870,
    f3: 2240,
    jitter: 0.39,
    shimmer: 1.9,
    syntheticFlag: false,
    note: "Lip rounding lengthens vocal tract tube, lowering both F1 and F2.",
  },
  {
    id: "cat",
    label: '/æ/ "cat" (Low Front)',
    ipa: "/æ/",
    f0: 140,
    f1: 660,
    f2: 1720,
    f3: 2410,
    jitter: 0.45,
    shimmer: 2.2,
    syntheticFlag: false,
    note: "Open front vowel with balanced F1 (660 Hz) and mid-high F2 (1720 Hz).",
  },
  {
    id: "baritone",
    label: "Deep Baritone Speaker (/ə/ Schwa)",
    ipa: "/ə/",
    f0: 92,
    f1: 490,
    f2: 1480,
    f3: 2450,
    jitter: 0.55,
    shimmer: 2.7,
    syntheticFlag: false,
    note: "Longer vocal tract (~17.8 cm) shifts neutral tube resonances downward.",
  },
  {
    id: "tts-clone",
    label: "Synthetic AI TTS Voice Clone",
    ipa: "/i-synth/",
    f0: 145,
    f1: 310,
    f2: 2150,
    f3: 2950,
    jitter: 0.04,
    shimmer: 0.18,
    syntheticFlag: true,
    note: "Over-smoothed neural vocoder pitch period (unnaturally low jitter/shimmer + phase lock).",
  },
];

function VoiceprintFormantMfccSpectrogramAnalyzer({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [presetId, setPresetId] = useState<string>("beet");
  const [f0, setF0] = useState<number>(135);
  const [f1, setF1] = useState<number>(270);
  const [f2, setF2] = useState<number>(2290);
  const [f3, setF3] = useState<number>(3010);
  const [jitter, setJitter] = useState<number>(0.42);
  const [shimmer, setShimmer] = useState<number>(2.1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micStatus, setMicStatus] = useState<string>("");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);

  const applyPreset = (id: string) => {
    const found = VOWEL_PRESETS.find((p) => p.id === id) || VOWEL_PRESETS[0];
    setPresetId(found.id);
    setF0(found.f0);
    setF1(found.f1);
    setF2(found.f2);
    setF3(found.f3);
    setJitter(found.jitter);
    setShimmer(found.shimmer);
  };

  useEffect(() => {
    if (resetTrigger > 0) {
      stopAudio();
      stopMic();
      applyPreset("beet");
    }
  }, [resetTrigger]);

  useEffect(() => {
    return () => {
      stopAudio();
      stopMic();
    };
  }, []);

  const stopAudio = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const stopMic = () => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    setMicActive(false);
  };

  const synthesizeVowel = () => {
    if (isPlaying) {
      stopAudio();
      return;
    }
    stopMic();
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f0, ctx.currentTime);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const formants = [
        { freq: f1, q: 6.5, gain: 1.0 },
        { freq: f2, q: 9.0, gain: 0.75 },
        { freq: f3, q: 11.0, gain: 0.45 },
      ];

      formants.forEach((fm) => {
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(fm.freq, ctx.currentTime);
        bp.Q.setValueAtTime(fm.q, ctx.currentTime);

        const g = ctx.createGain();
        g.gain.setValueAtTime(fm.gain, ctx.currentTime);

        osc.connect(bp);
        bp.connect(g);
        g.connect(masterGain);
      });

      osc.start();
      setIsPlaying(true);

      setTimeout(() => {
        stopAudio();
      }, 2200);
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleLiveMic = async () => {
    if (micActive) {
      stopMic();
      setMicStatus("Microphone stopped.");
      return;
    }
    stopAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const buf = new Uint8Array(analyser.frequencyBinCount);
      setMicActive(true);
      setMicStatus("Sampling live microphone FFT peaks...");

      const sampleFrame = () => {
        analyser.getByteFrequencyData(buf);
        const binHz = ctx.sampleRate / analyser.fftSize;

        let peakF1Bin = Math.round(300 / binHz);
        let peakF1Val = 0;
        for (let b = Math.round(220 / binHz); b <= Math.round(880 / binHz); b++) {
          if (buf[b] > peakF1Val) {
            peakF1Val = buf[b];
            peakF1Bin = b;
          }
        }

        let peakF2Bin = Math.round(1500 / binHz);
        let peakF2Val = 0;
        for (let b = Math.round(900 / binHz); b <= Math.round(2700 / binHz); b++) {
          if (buf[b] > peakF2Val) {
            peakF2Val = buf[b];
            peakF2Bin = b;
          }
        }

        if (peakF1Val > 45 && peakF2Val > 35) {
          setF1(Math.round(peakF1Bin * binHz));
          setF2(Math.round(peakF2Bin * binHz));
        }
        animRef.current = requestAnimationFrame(sampleFrame);
      };
      animRef.current = requestAnimationFrame(sampleFrame);
    } catch {
      setMicStatus("Microphone permission denied or unavailable; using preset synthesis.");
      setMicActive(false);
    }
  };

  const metrics = useMemo(() => {
    const dispersion = f2 - f1;
    // Estimate vocal tract length L (cm) using quarter-wave resonator approximation from F3: L ≈ (5 * c) / (4 * F3)
    const c = 35000; // speed of sound in warm vocal tract cm/s
    const tractLengthCm = Number(((5 * c) / (4 * Math.max(1800, f3))).toFixed(1));

    // Biometric anti-spoofing heuristics
    const tooSmooth = jitter < 0.15 || shimmer < 0.6;
    const tooErratic = jitter > 2.2 || shimmer > 6.5;
    const livenessScore = tooSmooth
      ? 24
      : tooErratic
      ? 58
      : Math.min(98, Math.round(88 + (jitter - 0.3) * 10));

    const verdict = tooSmooth
      ? "SUSPICIOUS: Neural Vocoder / TTS Artifact (Over-smoothed pitch & amplitude)"
      : tooErratic
      ? "WARNING: High Dysphonia / Channel Distortion"
      : "AUTHENTIC: Natural Biological Glottal Micro-Perturbation";

    // Generate 13 MFCC coefficients deterministically from F0..F3
    const mfccs = Array.from({ length: 13 }, (_, idx) => {
      const k = idx + 1;
      const val =
        Math.cos((k * f1) / 900) * 14 +
        Math.sin((k * f2) / 2400) * 9 +
        Math.cos((k * f3) / 3200) * 5 -
        k * 0.8;
      return Number(val.toFixed(2));
    });

    // Spectral envelope points (0 to 4000 Hz, step 50 Hz)
    const envelopePoints: { freq: number; db: number }[] = [];
    for (let freq = 50; freq <= 4000; freq += 50) {
      const p0 = 28 * Math.exp(-Math.pow((freq - f0) / 85, 2));
      const p1 = 46 * Math.exp(-Math.pow((freq - f1) / 140, 2));
      const p2 = 38 * Math.exp(-Math.pow((freq - f2) / 210, 2));
      const p3 = 30 * Math.exp(-Math.pow((freq - f3) / 260, 2));
      const rolloff = -0.0045 * freq;
      const db = Math.max(5, Math.min(95, 22 + p0 + p1 + p2 + p3 + rolloff));
      envelopePoints.push({ freq, db });
    }

    return {
      dispersion,
      tractLengthCm,
      livenessScore,
      verdict,
      mfccs,
      envelopePoints,
    };
  }, [f0, f1, f2, f3, jitter, shimmer]);

  useEffect(() => {
    const report = [
      `=== VOCAL TRACT FORMANT & BIOMETRIC VOICEPRINT REPORT ===`,
      `Fundamental Pitch (F0): ${f0} Hz`,
      `Formant Peaks         : F1 = ${f1} Hz | F2 = ${f2} Hz | F3 = ${f3} Hz`,
      `Vowel Dispersion      : F2 - F1 = ${metrics.dispersion} Hz`,
      `Est. Vocal Tract Tube : ${metrics.tractLengthCm} cm`,
      `Glottal Micro-Metrics : Jitter = ${jitter.toFixed(2)}% | Shimmer = ${shimmer.toFixed(2)}%`,
      `ASVspoof Liveness     : ${metrics.livenessScore}/100 (${metrics.verdict})`,
      `MFCC (c1..c13)        : [${metrics.mfccs.join(", ")}]`,
    ].join("\n");
    setOutput(report);
  }, [f0, f1, f2, f3, jitter, shimmer, metrics, setOutput]);

  const activePreset =
    VOWEL_PRESETS.find((p) => p.id === presetId) || VOWEL_PRESETS[0];

  return (
    <div className="space-y-5">
      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {VOWEL_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={`rounded-xs border px-2.5 py-1.5 font-heading text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                presetId === p.id
                  ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                  : "border-border bg-background text-text-muted hover:text-text hover:border-accent"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={synthesizeVowel}
            className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 transition cursor-pointer"
          >
            {isPlaying ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {isPlaying ? "Stop Synth" : "Synthesize Vowel Formants"}
          </button>
          <button
            type="button"
            onClick={toggleLiveMic}
            className={`inline-flex items-center gap-1.5 rounded-xs border px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              micActive
                ? "border-red-500 bg-red-500/10 text-red-500"
                : "border-border bg-background text-text hover:border-accent"
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            {micActive ? "Stop Mic FFT" : "Live Mic FFT"}
          </button>
        </div>
      </div>

      {micStatus && (
        <p className="text-xs font-mono-code text-accent">{micStatus}</p>
      )}

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold text-text">
            <span>Fundamental Pitch (F0)</span>
            <span className="font-mono-code text-accent">{f0} Hz</span>
          </div>
          <input
            type="range"
            min={75}
            max={300}
            value={f0}
            onChange={(e) => setF0(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
          <p className="mt-1 text-[11px] text-text-muted">
            Glottal fold vibration rate (85–180 Hz adult male, 165–255 Hz female)
          </p>
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold text-text">
            <span>Formant 1 (F1 — Jaw Height)</span>
            <span className="font-mono-code text-accent">{f1} Hz</span>
          </div>
          <input
            type="range"
            min={220}
            max={900}
            value={f1}
            onChange={(e) => setF1(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
          <p className="mt-1 text-[11px] text-text-muted">
            Inversely proportional to tongue height (low F1 = close vowel)
          </p>
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold text-text">
            <span>Formant 2 (F2 — Frontness)</span>
            <span className="font-mono-code text-accent">{f2} Hz</span>
          </div>
          <input
            type="range"
            min={750}
            max={2800}
            value={f2}
            onChange={(e) => setF2(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
          <p className="mt-1 text-[11px] text-text-muted">
            Proportional to anterior tongue advancement (F2 − F1 = {metrics.dispersion} Hz)
          </p>
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold text-text">
            <span>Formant 3 (F3 — Lip Rounding)</span>
            <span className="font-mono-code text-accent">{f3} Hz</span>
          </div>
          <input
            type="range"
            min={1900}
            max={3600}
            value={f3}
            onChange={(e) => setF3(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
          <p className="mt-1 text-[11px] text-text-muted">
            Speaker-specific pharyngeal cavity & lip rounding resonance
          </p>
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold text-text">
            <span>Local Jitter (Pitch Perturbation)</span>
            <span className="font-mono-code text-accent">{jitter.toFixed(2)}%</span>
          </div>
          <input
            type="range"
            min={0.02}
            max={2.5}
            step={0.02}
            value={jitter}
            onChange={(e) => setJitter(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
          <p className="mt-1 text-[11px] text-text-muted">
            Cycle-to-cycle F0 variation (&lt;0.15% flags synthetic vocoder)
          </p>
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold text-text">
            <span>Local Shimmer (Amplitude Perturbation)</span>
            <span className="font-mono-code text-accent">{shimmer.toFixed(2)}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={7.0}
            step={0.1}
            value={shimmer}
            onChange={(e) => setShimmer(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
          <p className="mt-1 text-[11px] text-text-muted">
            Natural human vocal fold closure shimmer: 1.5% – 3.8%
          </p>
        </div>
      </div>

      {/* Spectral Envelope SVG */}
      <div className="rounded-xs border border-border bg-background p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            LPC Spectral Envelope & Resonant Formant Peaks (0 – 4,000 Hz)
          </span>
          <span className="text-xs font-mono-code text-text-muted">
            {activePreset.note}
          </span>
        </div>
        <svg viewBox="0 0 640 190" className="w-full h-44 overflow-visible">
          {/* Grid lines */}
          {[20, 45, 70, 95].map((val, i) => {
            const y = 160 - (val / 100) * 140;
            return (
              <line
                key={i}
                x1={35}
                y1={y}
                x2={620}
                y2={y}
                stroke="currentColor"
                className="text-border"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            );
          })}
          {/* Envelope polyline */}
          <polyline
            fill="none"
            stroke="#ff6a00"
            strokeWidth="2.5"
            points={metrics.envelopePoints
              .map((pt) => {
                const x = 35 + (pt.freq / 4000) * 585;
                const y = 160 - (pt.db / 100) * 140;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              })
              .join(" ")}
          />
          {/* Formant vertical markers */}
          {[
            { label: `F0 (${f0}Hz)`, freq: f0, color: "#38bdf8" },
            { label: `F1 (${f1}Hz)`, freq: f1, color: "#ff6a00" },
            { label: `F2 (${f2}Hz)`, freq: f2, color: "#22c55e" },
            { label: `F3 (${f3}Hz)`, freq: f3, color: "#a855f7" },
          ].map((m, idx) => {
            const x = 35 + (m.freq / 4000) * 585;
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={18}
                  x2={x}
                  y2={160}
                  stroke={m.color}
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <text
                  x={x}
                  y={14}
                  textAnchor="middle"
                  fill={m.color}
                  className="text-[10px] font-mono-code font-bold"
                >
                  {m.label}
                </text>
              </g>
            );
          })}
          {/* X-axis frequency labels */}
          {[0, 1000, 2000, 3000, 4000].map((hz) => {
            const x = 35 + (hz / 4000) * 585;
            return (
              <text
                key={hz}
                x={x}
                y={178}
                textAnchor="middle"
                fill="currentColor"
                className="text-[10px] text-text-muted font-mono-code"
              >
                {hz} Hz
              </text>
            );
          })}
        </svg>
      </div>

      {/* Biometric & MFCC Summary */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xs border border-border bg-surface p-3.5">
          <div className="text-[11px] font-heading uppercase tracking-wider text-text-muted">
            Vowel Space Dispersion (F2 − F1)
          </div>
          <div className="mt-1 font-mono-code text-xl font-bold text-text">
            {metrics.dispersion} Hz
          </div>
          <div className="mt-1 text-xs text-text-muted">
            Est. Vocal Tract Length: <strong className="text-text">{metrics.tractLengthCm} cm</strong>
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3.5 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-heading uppercase tracking-wider text-text-muted">
              Biometric Anti-Spoofing (ASVspoof Liveness Score)
            </span>
            <span
              className={`rounded-xs px-2 py-0.5 font-mono-code text-xs font-bold ${
                metrics.livenessScore >= 75
                  ? "bg-emerald-500/15 text-emerald-500"
                  : "bg-amber-500/15 text-amber-500"
              }`}
            >
              {metrics.livenessScore} / 100
            </span>
          </div>
          <div className="mt-1.5 font-heading text-sm font-bold text-text">
            {metrics.verdict}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {metrics.mfccs.map((val, idx) => (
              <span
                key={idx}
                className="rounded-xs border border-border bg-background px-1.5 py-0.5 font-mono-code text-[10px] text-text-muted"
              >
                c{idx + 1}: {val}
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
 * 15. BLUETOOTH AUDIO CODEC, BATTERY & LATENCY CALCULATOR
 * ========================================================================== */
interface BtCodecSpec {
  id: string;
  name: string;
  bitrateKbps: number;
  sampleRateDesc: string;
  baseLatencyMs: number;
   gamingLatencyMs: number;
  dspMilliwatts: number;
  losslessClass: string;
  rfNotes: string;
}

const BT_CODECS: BtCodecSpec[] = [
  {
    id: "sbc",
    name: "SBC (Mandatory A2DP Baseline)",
    bitrateKbps: 328,
    sampleRateDesc: "16-bit / 44.1 kHz",
    baseLatencyMs: 195,
    gamingLatencyMs: 130,
    dspMilliwatts: 6.5,
    losslessClass: "Lossy Subband Coding",
    rfNotes: "Universal compatibility; audible treble artifacts on dense cymbal transients.",
  },
  {
    id: "aac",
    name: "AAC (Apple iOS / Android Standard)",
    bitrateKbps: 256,
    sampleRateDesc: "16-bit / 44.1 kHz",
    baseLatencyMs: 165,
    gamingLatencyMs: 115,
    dspMilliwatts: 7.2,
    losslessClass: "Psychoacoustic Lossy",
    rfNotes: "Hardware-accelerated on Apple Silicon/iPhone; variable encoder quality on some Android OEMs.",
  },
  {
    id: "aptx",
    name: "Qualcomm aptX Classic",
    bitrateKbps: 352,
    sampleRateDesc: "16-bit / 48 kHz",
    baseLatencyMs: 140,
    gamingLatencyMs: 95,
    dspMilliwatts: 7.8,
    losslessClass: "ADPCM Lossy (4:1)",
    rfNotes: "Fixed 352 kbps bitrate; solid RF link stability.",
  },
  {
    id: "aptx-adaptive",
    name: "Qualcomm aptX Adaptive",
    bitrateKbps: 420,
    sampleRateDesc: "24-bit / 96 kHz",
    baseLatencyMs: 85,
    gamingLatencyMs: 55,
    dspMilliwatts: 8.6,
    losslessClass: "Dynamic 279–420 kbps",
    rfNotes: "Scales bitrate dynamically in congested 2.4 GHz Wi-Fi environments.",
  },
  {
    id: "aptx-lossless",
    name: "Qualcomm aptX Lossless (Snapdragon Sound)",
    bitrateKbps: 1150,
    sampleRateDesc: "16-bit / 44.1 kHz CD Lossless",
    baseLatencyMs: 95,
    gamingLatencyMs: 65,
    dspMilliwatts: 12.4,
    losslessClass: "Bit-Exact CD Lossless",
    rfNotes: "Requires Snapdragon Sound Dual-Antenna RF link; falls back to aptX Adaptive if RSSI drops.",
  },
  {
    id: "ldac-990",
    name: "Sony LDAC (990 kbps Connection Quality)",
    bitrateKbps: 990,
    sampleRateDesc: "24-bit / 96 kHz Hi-Res",
    baseLatencyMs: 210,
    gamingLatencyMs: 155,
    dspMilliwatts: 13.8,
    losslessClass: "Hi-Res Quasi-Lossless",
    rfNotes: "Highest throughput on standard Android; prone to packet stutters in crowded subways/airports at 990 kbps.",
  },
  {
    id: "ssc-hifi",
    name: "Samsung Seamless Codec (SSC Hi-Fi 24-bit)",
    bitrateKbps: 512,
    sampleRateDesc: "24-bit / 48 kHz",
    baseLatencyMs: 120,
    gamingLatencyMs: 75,
    dspMilliwatts: 9.2,
    losslessClass: "Proprietary Galaxy Hi-Fi",
    rfNotes: "Exclusive to Samsung Galaxy OneUI devices paired with Galaxy Buds Pro series.",
  },
  {
    id: "lc3-le",
    name: "LC3 (Bluetooth LE Audio / Auracast)",
    bitrateKbps: 192,
    sampleRateDesc: "24-bit / 48 kHz Isochronous",
    baseLatencyMs: 45,
    gamingLatencyMs: 24,
    dspMilliwatts: 4.8,
    losslessClass: "Next-Gen Ultra-Efficient",
    rfNotes: "Bluetooth 5.3+ Isochronous Channels; delivers SBC-beating clarity at half the bitrate and ~25ms gaming latency.",
  },
];

function BluetoothAudioCodecBatteryLatencyCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [codecId, setCodecId] = useState<string>("ldac-990");
  const [ancMode, setAncMode] = useState<"anc-on" | "transparency" | "anc-off">("anc-on");
  const [batteryMah, setBatteryMah] = useState<number>(58);
  const [caseMah, setCaseMah] = useState<number>(500);
  const [gamingMode, setGamingMode] = useState<boolean>(false);
  const [troubleSymptom, setTroubleSymptom] = useState<
    "oxidized-pins" | "one-earbud-dead" | "desync-split" | "stutter-ldac"
  >("oxidized-pins");

  useEffect(() => {
    if (resetTrigger > 0) {
      setCodecId("ldac-990");
      setAncMode("anc-on");
      setBatteryMah(58);
      setCaseMah(500);
      setGamingMode(false);
      setTroubleSymptom("oxidized-pins");
    }
  }, [resetTrigger]);

  const calc = useMemo(() => {
    const codec = BT_CODECS.find((c) => c.id === codecId) || BT_CODECS[0];
    const ancMw = ancMode === "anc-on" ? 8.5 : ancMode === "transparency" ? 7.2 : 0;
    const gamingMw = gamingMode ? 2.4 : 0;
    const driverBaseMw = 11.0; // acoustic transducer + Bluetooth radio baseline
    const totalMw = driverBaseMw + codec.dspMilliwatts + ancMw + gamingMw;

    // Nominal Li-Ion coin cell voltage = 3.7V => mWh = batteryMah * 3.7
    const earbudMwh = batteryMah * 3.7;
    const singleChargeHours = Number((earbudMwh / totalMw).toFixed(1));

    // Charging case provides ~82% DC-DC boost transfer efficiency to 2 earbuds
    const caseUsableMah = caseMah * 0.82;
    const extraRecharges = Number((caseUsableMah / (batteryMah * 2)).toFixed(1));
    const totalSystemHours = Number(
      (singleChargeHours * (1 + extraRecharges)).toFixed(1)
    );

    const effectiveLatencyMs = gamingMode
      ? codec.gamingLatencyMs
      : codec.baseLatencyMs;

    const lipSyncNotice =
      effectiveLatencyMs <= 60
        ? "Imperceptible Delay (Competitive FPS & Rhythm Game Ready)"
        : effectiveLatencyMs <= 125
        ? "Acceptable Video Sync (OS AV-Sync Compensated)"
        : "Audible Lip-Sync Lag in Live Games (Enable Gaming Mode or LC3/aptX Adaptive)";

    return {
      codec,
      totalMw: Number(totalMw.toFixed(1)),
      singleChargeHours,
      extraRecharges,
      totalSystemHours,
      effectiveLatencyMs,
      lipSyncNotice,
    };
  }, [codecId, ancMode, batteryMah, caseMah, gamingMode]);

  const recoveryGuide = useMemo(() => {
    const guides = {
      "oxidized-pins": {
        title: "Charging Case Pogo-Pin Oxidation / Skin-Oil Insulator Fix",
        steps: [
          "Dip a cotton swab in 90%+ Isopropyl Alcohol (IPA) and gently scrub both spring-loaded gold pogo pins inside the case well.",
          "Clean the flat metallic charging pads on the earbud stem/body to strip sweat salt and sebum film.",
          "Press each pogo pin down 5 times with a wooden toothpick to verify spring rebound isn't stuck.",
        ],
      },
      "one-earbud-dead": {
        title: "Deep-Discharge Protection BMS Wakeup (0% Dead Single Bud)",
        steps: [
          "Leave the unresponsive earbud inside the plugged-in charging case with the lid OPEN for 25 minutes (trickle pre-charge).",
          "Perform a Magnet/Hall-Sensor Re-seat: lift the working earbud out slightly so all charging current routes to the dead cell.",
          "Hold both touch sensors for 12 seconds while seated inside the case to force a PMIC hardware reboot.",
        ],
      },
      "desync-split": {
        title: "TWS Left/Right Split Pairing Desync Reset",
        steps: [
          "Forget/Unpair the earbuds from all phones and laptops within 10 meters.",
          "Place both buds in the charging case, wait 5 seconds, then triple-tap and hold both touch panels for 10 seconds until LEDs flash amber/white.",
          "Take both buds out simultaneously so they negotiate their primary/secondary TWS peer link before pairing to the phone.",
        ],
      },
      "stutter-ldac": {
        title: "High-Bitrate LDAC 990kbps / aptX Lossless RF Dropouts",
        steps: [
          "Open Android Developer Options -> Bluetooth Audio LDAC Codec: Playback Quality -> Switch from '990 kbps' to 'Adaptive Bit Rate'.",
          "Disable 2.4 GHz Wi-Fi hotspot tethering on the handset (shares the same 2400–2483.5 MHz ISM band as Bluetooth).",
          "Keep phone on the same side of your body as the primary master earbud to prevent human-body RF shadowing.",
        ],
      },
    };
    return guides[troubleSymptom];
  }, [troubleSymptom]);

  useEffect(() => {
    setOutput(
      [
        `=== BLUETOOTH AUDIO CODEC, BATTERY & LATENCY REPORT ===`,
        `Selected Codec      : ${calc.codec.name}`,
        `Bitrate & Resolution: ${calc.codec.bitrateKbps} kbps (${calc.codec.sampleRateDesc})`,
        `End-to-End Latency  : ${calc.effectiveLatencyMs} ms (${calc.lipSyncNotice})`,
        `Power Draw per Bud  : ${calc.totalMw} mW (ANC Mode: ${ancMode.toUpperCase()})`,
        `Single-Charge Life  : ${calc.singleChargeHours} hrs (${batteryMah} mAh cell)`,
        `Total w/ Case (${caseMah}mAh): ${calc.totalSystemHours} hrs (${calc.extraRecharges}x full case recharges)`,
        `RF Link Profile     : ${calc.codec.rfNotes}`,
      ].join("\n")
    );
  }, [calc, ancMode, batteryMah, caseMah, setOutput]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xs border border-border bg-background p-3.5">
          <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text">
            Bluetooth Audio Codec
          </label>
          <select
            value={codecId}
            onChange={(e) => setCodecId(e.target.value)}
            className="mt-2 w-full rounded-xs border border-border bg-surface px-3 py-2 text-xs font-semibold text-text"
          >
            {BT_CODECS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.bitrateKbps} kbps
              </option>
            ))}
          </select>
          <p className="mt-2 text-[11px] text-text-muted">{calc.codec.rfNotes}</p>
        </div>

        <div className="rounded-xs border border-border bg-background p-3.5 space-y-3">
          <div>
            <label className="block font-heading text-xs font-bold uppercase tracking-wider text-text">
              Active Noise Cancellation (ANC) & Gaming Mode
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(
                [
                  { id: "anc-on", label: "ANC On (-42dB)" },
                  { id: "transparency", label: "Transparency" },
                  { id: "anc-off", label: "ANC Off (Passive)" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setAncMode(m.id)}
                  className={`rounded-xs border px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    ancMode === m.id
                      ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                      : "border-border bg-surface text-text-muted hover:text-text"
                  }`}
                >
                  {m.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setGamingMode(!gamingMode)}
                className={`rounded-xs border px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  gamingMode
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-500"
                    : "border-border bg-surface text-text-muted"
                }`}
              >
                Low-Latency Gaming: {gamingMode ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Battery Sliders */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold text-text">
            <span>Single Earbud Cell Capacity</span>
            <span className="font-mono-code text-accent">{batteryMah} mAh (3.7V)</span>
          </div>
          <input
            type="range"
            min={30}
            max={95}
            value={batteryMah}
            onChange={(e) => setBatteryMah(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold text-text">
            <span>Charging Case Battery Capacity</span>
            <span className="font-mono-code text-accent">{caseMah} mAh</span>
          </div>
          <input
            type="range"
            min={250}
            max={900}
            step={10}
            value={caseMah}
            onChange={(e) => setCaseMah(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">
            Effective Bitrate
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            {calc.codec.bitrateKbps} kbps
          </div>
          <div className="text-[11px] text-text-muted">{calc.codec.sampleRateDesc}</div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">
            Audio Latency
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-accent">
            {calc.effectiveLatencyMs} ms
          </div>
          <div className="text-[11px] text-text-muted">{calc.codec.losslessClass}</div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">
            Single-Charge Playtime
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-emerald-500">
            {calc.singleChargeHours} hrs
          </div>
          <div className="text-[11px] text-text-muted">{calc.totalMw} mW DSP+Driver load</div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">
            Total w/ Charging Case
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            {calc.totalSystemHours} hrs
          </div>
          <div className="text-[11px] text-text-muted">+{calc.extraRecharges}x case recharges</div>
        </div>
      </div>

      {/* Hardware Recovery Troubleshooter */}
      <div className="rounded-xs border border-border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Dead Charging Case & Desynced Earbud Hardware Troubleshooter
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "oxidized-pins", label: "Not Charging in Case" },
                { id: "one-earbud-dead", label: "One Bud 0% Dead" },
                { id: "desync-split", label: "L/R Split Desync" },
                { id: "stutter-ldac", label: "LDAC Audio Cutouts" },
              ] as const
            ).map((sym) => (
              <button
                key={sym.id}
                type="button"
                onClick={() => setTroubleSymptom(sym.id)}
                className={`rounded-xs border px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                  troubleSymptom === sym.id
                    ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                    : "border-border bg-surface text-text-muted hover:text-text"
                }`}
              >
                {sym.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-xs border border-border bg-surface p-3">
          <div className="font-heading text-xs font-bold text-accent">
            {recoveryGuide.title}
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-text-muted">
            {recoveryGuide.steps.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ol>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 16. DUPLICATE PHOTO PERCEPTUAL HASH (dHash) & STORAGE BLOAT CLEANER
 * ========================================================================== */
interface HashedPhotoItem {
  id: string;
  name: string;
  width: number;
  height: number;
  hashHex: string;
  bits: number[];
  dataUrl: string;
}

function computeDHashFromCanvas(
  source: CanvasImageSource,
  srcW: number,
  srcH: number
): { hashHex: string; bits: number[]; thumbUrl: string } {
  // 9x8 offscreen canvas for horizontal gradient comparison
  const canvas = document.createElement("canvas");
  canvas.width = 9;
  canvas.height = 8;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { hashHex: "0000000000000000", bits: new Array(64).fill(0), thumbUrl: "" };
  }
  ctx.drawImage(source, 0, 0, 9, 8);
  const imgData = ctx.getImageData(0, 0, 9, 8).data;

  const gray: number[] = [];
  for (let i = 0; i < imgData.length; i += 4) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    gray.push(0.299 * r + 0.587 * g + 0.114 * b);
  }

  const bits: number[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = gray[row * 9 + col];
      const right = gray[row * 9 + col + 1];
      bits.push(left < right ? 1 : 0);
    }
  }

  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    const nibble =
      (bits[i] << 3) | (bits[i + 1] << 2) | (bits[i + 2] << 1) | bits[i + 3];
    hex += nibble.toString(16);
  }

  // Generate a crisp 96x72 thumbnail
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = 96;
  thumbCanvas.height = 72;
  const tCtx = thumbCanvas.getContext("2d");
  if (tCtx) {
    tCtx.drawImage(source, 0, 0, srcW || 96, srcH || 72, 0, 0, 96, 72);
  }
  return { hashHex: hex, bits, thumbUrl: thumbCanvas.toDataURL("image/png") };
}

function DuplicatePhotoPerceptualHashCleaner({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [photos, setPhotos] = useState<HashedPhotoItem[]>([]);
  const [hammingThreshold, setHammingThreshold] = useState<number>(8);
  const [totalPhotosCount, setTotalPhotosCount] = useState<number>(14500);
  const [burstRatioPct, setBurstRatioPct] = useState<number>(22);
  const [livePhotosPct, setLivePhotosPct] = useState<number>(35);

  const generateDemoBurstSet = () => {
    const specs = [
      {
        id: "img-1",
        name: "IMG_4821_Original_4K.jpg",
        w: 4032,
        h: 3024,
        variant: "sunset-orig",
      },
      {
        id: "img-2",
        name: "IMG_4822_Burst_Shot.jpg",
        w: 4032,
        h: 3024,
        variant: "sunset-burst",
      },
      {
        id: "img-3",
        name: "WhatsApp_Resized_Copy.jpg",
        w: 1600,
        h: 1200,
        variant: "sunset-whatsapp",
      },
      {
        id: "img-4",
        name: "IMG_4899_Mountain_Peak.jpg",
        w: 4032,
        h: 3024,
        variant: "mountain-distinct",
      },
    ];

    const built: HashedPhotoItem[] = specs.map((sp) => {
      const c = document.createElement("canvas");
      c.width = 160;
      c.height = 120;
      const ctx = c.getContext("2d")!;

      if (sp.variant.startsWith("sunset")) {
        const grad = ctx.createLinearGradient(0, 0, 160, 120);
        grad.addColorStop(0, "#1e1b4b");
        grad.addColorStop(0.55, "#ea580c");
        grad.addColorStop(1, "#fde047");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 160, 120);

        // Sun circle
        ctx.fillStyle = "#fffbeb";
        const offsetX = sp.variant === "sunset-burst" ? 2 : 0;
        ctx.beginPath();
        ctx.arc(95 + offsetX, 54, 24, 0, Math.PI * 2);
        ctx.fill();

        // Horizon silhouette
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 86, 160, 34);
      } else {
        // Distinct scene
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(0, 0, 160, 120);
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.moveTo(15, 110);
        ctx.lineTo(65, 22);
        ctx.lineTo(120, 110);
        ctx.closePath();
        ctx.fill();
      }

      const { hashHex, bits, thumbUrl } = computeDHashFromCanvas(c, 160, 120);
      return {
        id: sp.id,
        name: sp.name,
        width: sp.w,
        height: sp.h,
        hashHex,
        bits,
        dataUrl: thumbUrl,
      };
    });

    setPhotos(built);
  };

  useEffect(() => {
    generateDemoBurstSet();
  }, []);

  useEffect(() => {
    if (resetTrigger > 0) {
      setHammingThreshold(8);
      setTotalPhotosCount(14500);
      setBurstRatioPct(22);
      setLivePhotosPct(35);
      generateDemoBurstSet();
    }
  }, [resetTrigger]);

  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const { hashHex, bits, thumbUrl } = computeDHashFromCanvas(
            img,
            img.width,
            img.height
          );
          setPhotos((prev) => [
            ...prev,
            {
              id: `${file.name}-${Date.now()}-${Math.random()}`,
              name: file.name,
              width: img.width,
              height: img.height,
              hashHex,
              bits,
              dataUrl: thumbUrl,
            },
          ]);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const pairsAnalysis = useMemo(() => {
    const pairs: {
      a: string;
      b: string;
      distance: number;
      status: "EXACT DUPLICATE" | "NEAR DUPLICATE" | "DISTINCT IMAGE";
    }[] = [];

    for (let i = 0; i < photos.length; i++) {
      for (let j = i + 1; j < photos.length; j++) {
        let dist = 0;
        for (let k = 0; k < 64; k++) {
          if (photos[i].bits[k] !== photos[j].bits[k]) dist++;
        }
        const status =
          dist === 0
            ? "EXACT DUPLICATE"
            : dist <= hammingThreshold
            ? "NEAR DUPLICATE"
            : "DISTINCT IMAGE";
        pairs.push({
          a: photos[i].name,
          b: photos[j].name,
          distance: dist,
          status,
        });
      }
    }

    // Storage bloat calculation
    const avgPhotoMb = 3.4;
    const reclaimableDupPhotos = Math.round(totalPhotosCount * (burstRatioPct / 100));
    const dupGbSaved = (reclaimableDupPhotos * avgPhotoMb) / 1024;
    const livePhotoVideoGbSaved =
      (totalPhotosCount * (livePhotosPct / 100) * 2.8) / 1024;
    const totalReclaimableGb = Number((dupGbSaved + livePhotoVideoGbSaved).toFixed(1));

    return { pairs, reclaimableDupPhotos, totalReclaimableGb };
  }, [photos, hammingThreshold, totalPhotosCount, burstRatioPct, livePhotosPct]);

  useEffect(() => {
    const lines = [
      `=== 64-BIT PERCEPTUAL dHASH DUPLICATE DETECTOR ===`,
      `Hamming Distance Cutoff: <= ${hammingThreshold} bits (out of 64 bits)`,
      ...photos.map(
        (p) => `- ${p.name} (${p.width}x${p.height}) -> dHash: 0x${p.hashHex}`
      ),
      ``,
      `--- PAIRWISE HAMMING COMPARISONS ---`,
      ...pairsAnalysis.pairs.map(
        (pr) =>
          `${pr.a} <-> ${pr.b}: ${pr.distance} bits [${pr.status}]`
      ),
      ``,
      `Est. Reclaimable Phone Storage: ${pairsAnalysis.totalReclaimableGb} GB (${pairsAnalysis.reclaimableDupPhotos.toLocaleString()} burst/duplicate frames)`,
    ];
    setOutput(lines.join("\n"));
  }, [photos, hammingThreshold, pairsAnalysis, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 transition cursor-pointer">
            <ImageIcon className="h-3.5 w-3.5" />
            Drop / Select Local Photos (Zero-Upload)
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesUpload}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={generateDemoBurstSet}
            className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-background px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-text hover:border-accent transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-accent" />
            Generate Demo Burst Photo Set
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Max Hamming Threshold:</span>
          <input
            type="range"
            min={0}
            max={16}
            value={hammingThreshold}
            onChange={(e) => setHammingThreshold(Number(e.target.value))}
            className="w-28 accent-[#ff6a00]"
          />
          <span className="font-mono-code text-xs font-bold text-accent">
            {hammingThreshold} bits
          </span>
        </div>
      </div>

      {/* Hashed Photo Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {photos.map((p) => (
          <div
            key={p.id}
            className="rounded-xs border border-border bg-background p-3 space-y-2"
          >
            <div className="flex items-center gap-2.5">
              {p.dataUrl && (
                <img
                  src={p.dataUrl}
                  alt={p.name}
                  className="h-12 w-16 rounded-xs object-cover border border-border"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-heading text-xs font-bold text-text">
                  {p.name}
                </div>
                <div className="text-[11px] text-text-muted">
                  {p.width}×{p.height} px
                </div>
                <div className="font-mono-code text-[11px] font-bold text-accent">
                  0x{p.hashHex}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pairwise Hamming Distance Matrix */}
      <div className="rounded-xs border border-border bg-background p-3.5">
        <div className="mb-2 font-heading text-xs font-bold uppercase tracking-wider text-text">
          Pairwise 64-Bit dHash Hamming Distance Audit
        </div>
        <div className="space-y-1.5">
          {pairsAnalysis.pairs.map((pr, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xs border border-border bg-surface px-3 py-2 text-xs"
            >
              <span className="font-mono-code text-text">
                {pr.a} <span className="text-text-muted">↔</span> {pr.b}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono-code text-text-muted">
                  Distance: <strong className="text-text">{pr.distance}/64 bits</strong>
                </span>
                <span
                  className={`rounded-xs px-2 py-0.5 font-heading text-[10px] font-bold uppercase ${
                    pr.status === "EXACT DUPLICATE"
                      ? "bg-red-500/15 text-red-500"
                      : pr.status === "NEAR DUPLICATE"
                      ? "bg-amber-500/15 text-amber-500"
                      : "bg-emerald-500/15 text-emerald-500"
                  }`}
                >
                  {pr.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* iOS / Android Storage Bloat Estimator */}
      <div className="rounded-xs border border-border bg-surface p-4">
        <div className="font-heading text-xs font-bold uppercase tracking-wider text-text">
          iOS / Android Camera Roll Storage Bloat Estimator
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Total Library Photos</span>
              <span className="font-mono-code font-bold text-text">
                {totalPhotosCount.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={80000}
              step={500}
              value={totalPhotosCount}
              onChange={(e) => setTotalPhotosCount(Number(e.target.value))}
              className="mt-1.5 w-full accent-[#ff6a00]"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Burst / Near-Duplicate %</span>
              <span className="font-mono-code font-bold text-accent">
                {burstRatioPct}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              value={burstRatioPct}
              onChange={(e) => setBurstRatioPct(Number(e.target.value))}
              className="mt-1.5 w-full accent-[#ff6a00]"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Live Photos (MOV Wrapper) %</span>
              <span className="font-mono-code font-bold text-text">
                {livePhotosPct}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              value={livePhotosPct}
              onChange={(e) => setLivePhotosPct(Number(e.target.value))}
              className="mt-1.5 w-full accent-[#ff6a00]"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between border-t border-border pt-3 text-xs">
          <span className="text-text-muted">
            Reclaimable Duplicate Frames:{" "}
            <strong className="text-text">
              {pairsAnalysis.reclaimableDupPhotos.toLocaleString()} photos
            </strong>
          </span>
          <span className="font-mono-code text-sm font-bold text-emerald-500">
            Est. Space Reclaimed: {pairsAnalysis.totalReclaimableGb} GB
          </span>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 17. ZERO-UPLOAD DOCUMENT SCANNER & ADAPTIVE CONTRAST STUDIO
 * ========================================================================== */
function ZeroUploadDocumentScannerContrastStudio({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [mode, setMode] = useState<
    "adaptive-bw" | "high-contrast-gray" | "magic-color" | "original"
  >("adaptive-bw");
  const [contrast, setContrast] = useState<number>(48);
  const [brightness, setBrightness] = useState<number>(18);
  const [threshold, setThreshold] = useState<number>(142);
  const [rotation, setRotation] = useState<number>(0);
  const [ocrScore, setOcrScore] = useState<number>(96);

  const srcCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateDemoReceipt = () => {
    const c = document.createElement("canvas");
    c.width = 520;
    c.height = 340;
    const ctx = c.getContext("2d")!;

    // Simulate uneven warm desk shadow across paper receipt
    const shadowGrad = ctx.createLinearGradient(0, 0, 520, 340);
    shadowGrad.addColorStop(0, "#e5e0d5");
    shadowGrad.addColorStop(0.55, "#cfc8b8");
    shadowGrad.addColorStop(1, "#9ca3af");
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(0, 0, 520, 340);

    // Draw receipt header & line items
    ctx.fillStyle = "#27272a";
    ctx.font = "bold 18px monospace";
    ctx.fillText("ZEROSUNIVERSE HARDWARE LABS", 95, 42);
    ctx.font = "13px monospace";
    ctx.fillText("INVOICE #INV-2026-8841   DATE: 2026-09-28", 85, 68);
    ctx.fillText("------------------------------------------", 75, 90);
    ctx.fillText("1x NVMe PCIe 5.0 Heatsink         $34.00", 75, 118);
    ctx.fillText("2x YubiKey 5C NFC Security Key   $110.00", 75, 144);
    ctx.fillText("1x Thermal Label Roll (4x6 500p)  $19.50", 75, 170);
    ctx.fillText("------------------------------------------", 75, 196);
    ctx.font = "bold 15px monospace";
    ctx.fillText("TOTAL PAID (VISA ****4912)       $163.50", 75, 224);

    // Colored stamp
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(330, 248, 135, 44);
    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("PAID / VERIFIED", 340, 276);

    srcCanvasRef.current = c;
    renderProcessedScan();
  };

  const renderProcessedScan = () => {
    const src = srcCanvasRef.current;
    const dst = outCanvasRef.current;
    if (!src || !dst) return;

    const swapped = rotation % 180 !== 0;
    dst.width = swapped ? src.height : src.width;
    dst.height = swapped ? src.width : src.height;

    const ctx = dst.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(dst.width / 2, dst.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(src, -src.width / 2, -src.height / 2);
    ctx.restore();

    if (mode === "original") {
      setOcrScore(68);
      return;
    }

    const imgData = ctx.getImageData(0, 0, dst.width, dst.height);
    const d = imgData.data;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    let highContrastPixels = 0;
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i] + brightness;
      let g = d[i + 1] + brightness;
      let b = d[i + 2] + brightness;

      r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
      g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
      b = Math.max(0, Math.min(255, factor * (b - 128) + 128));

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (mode === "adaptive-bw") {
        const bw = lum >= threshold ? 255 : 12;
        d[i] = bw;
        d[i + 1] = bw;
        d[i + 2] = bw;
        if (bw === 255 || bw === 12) highContrastPixels++;
      } else if (mode === "high-contrast-gray") {
        const pushed = lum > threshold + 18 ? 255 : lum;
        d[i] = pushed;
        d[i + 1] = pushed;
        d[i + 2] = pushed;
        if (pushed > 235 || pushed < 55) highContrastPixels++;
      } else if (mode === "magic-color") {
        // Whiten background paper while boosting ink saturation
        if (lum > threshold + 10) {
          d[i] = 255;
          d[i + 1] = 255;
          d[i + 2] = 255;
        } else {
          d[i] = r;
          d[i + 1] = g;
          d[i + 2] = b;
        }
        highContrastPixels++;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const totalPx = d.length / 4;
    const score = Math.min(
      99,
      Math.max(72, Math.round((highContrastPixels / totalPx) * 98))
    );
    setOcrScore(score);
  };

  useEffect(() => {
    generateDemoReceipt();
  }, []);

  useEffect(() => {
    renderProcessedScan();
  }, [mode, contrast, brightness, threshold, rotation]);

  useEffect(() => {
    if (resetTrigger > 0) {
      setMode("adaptive-bw");
      setContrast(48);
      setBrightness(18);
      setThreshold(142);
      setRotation(0);
      generateDemoReceipt();
    }
  }, [resetTrigger]);

  const handleUploadDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        const scale = Math.min(1, 700 / Math.max(img.width, img.height));
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0, c.width, c.height);
        srcCanvasRef.current = c;
        renderProcessedScan();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const downloadPng = () => {
    if (!outCanvasRef.current) return;
    const url = outCanvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `clean-document-scan-${mode}.png`;
    a.click();
  };

  useEffect(() => {
    setOutput(
      [
        `=== ZERO-UPLOAD DOCUMENT SCANNER & CONTRAST STUDIO ===`,
        `Enhancement Mode    : ${mode.toUpperCase()}`,
        `Contrast Boost      : +${contrast}%`,
        `Shadow Brightness   : +${brightness}`,
        `Binarization Cutoff : ${threshold} / 255`,
        `Rotation Angle      : ${rotation}°`,
        `OCR Readiness Score : ${ocrScore}/100 (100% Client-Side Canvas Pipeline)`,
      ].join("\n")
    );
  }, [mode, contrast, brightness, threshold, rotation, ocrScore, setOutput]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 transition cursor-pointer">
            <ScanLine className="h-3.5 w-3.5" />
            Upload Receipt / Document Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadDoc}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={generateDemoReceipt}
            className="rounded-xs border border-border bg-background px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-text hover:border-accent transition cursor-pointer"
          >
            Load Demo Receipt Scan
          </button>
          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="rounded-xs border border-border bg-background px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-text hover:border-accent transition cursor-pointer"
          >
            Rotate 90° ({rotation}°)
          </button>
        </div>

        <button
          type="button"
          onClick={downloadPng}
          className="inline-flex items-center gap-1.5 rounded-xs border border-emerald-500 bg-emerald-500/15 px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-emerald-500 hover:bg-emerald-500/25 transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          Download Clean Document PNG
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            { id: "adaptive-bw", label: "Adaptive B&W Document Threshold" },
            { id: "high-contrast-gray", label: "High-Contrast Grayscale" },
            { id: "magic-color", label: "Magic Color Stamp Boost" },
            { id: "original", label: "Original Shadowed Photo" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-xs border px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              mode === m.id
                ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                : "border-border bg-background text-text-muted hover:text-text"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Contrast Boost</span>
            <span className="font-mono-code text-accent">+{contrast}</span>
          </div>
          <input
            type="range"
            min={0}
            max={120}
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Shadow Lift (Brightness)</span>
            <span className="font-mono-code text-accent">+{brightness}</span>
          </div>
          <input
            type="range"
            min={-40}
            max={80}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Paper Binarization Threshold</span>
            <span className="font-mono-code text-accent">{threshold}/255</span>
          </div>
          <input
            type="range"
            min={80}
            max={220}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>
      </div>

      {/* Live Canvas Preview */}
      <div className="rounded-xs border border-border bg-surface p-4 text-center">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-heading font-bold uppercase tracking-wider text-text">
            Live OCR-Ready Document Canvas Preview
          </span>
          <span className="font-mono-code text-emerald-500 font-bold">
            OCR Contrast Readiness: {ocrScore}%
          </span>
        </div>
        <div className="flex justify-center overflow-auto rounded-xs border border-border bg-background p-3">
          <canvas
            ref={outCanvasRef}
            className="max-w-full h-auto rounded-xs shadow-sm"
          />
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 18. CSV / JSON PIVOT TABLE, CORRELATION MATRIX & OUTLIER EXPLORER
 * ========================================================================== */
const DATA_SAMPLES: Record<string, { label: string; csv: string }> = {
  saas: {
    label: "SaaS Monthly Revenue & Churn",
    csv: `Region,Plan,MRR,ChurnPct,ActiveSeats
NorthAmerica,Enterprise,18500,1.4,140
NorthAmerica,Pro,6400,3.2,55
Europe,Enterprise,15200,1.6,115
Europe,Pro,5100,3.8,44
APAC,Enterprise,12900,1.9,95
APAC,Starter,1900,6.4,18
NorthAmerica,Enterprise,49800,0.8,390
Europe,Starter,1650,7.1,15
APAC,Pro,5800,3.5,49`,
  },
  server: {
    label: "Server Latency & CPU Load",
    csv: `Cluster,Runtime,CpuPct,MemoryGb,LatencyMs
us-east-1,Node22,42,6.2,38
us-east-1,Go123,28,2.4,14
eu-central-1,Node22,51,7.1,49
eu-central-1,Go123,31,2.8,17
ap-south-1,Node22,96,15.4,340
ap-south-1,Go123,35,3.1,21
us-east-1,Rust,19,1.5,8
eu-central-1,Rust,22,1.7,10`,
  },
  ecommerce: {
    label: "E-Commerce Ad Spend vs ROAS",
    csv: `Channel,Tier,AdSpend,Conversions,Revenue
GoogleSearch,Brand,4200,195,29400
GoogleSearch,Generic,6800,142,21300
MetaReels,Retargeting,3100,128,17900
MetaReels,Prospecting,5400,74,9800
TikTokVideo,Prospecting,4900,62,7900
GoogleSearch,Brand,14500,610,92500
YouTubeShorts,Retargeting,2700,88,12600`,
  },
};

function CsvJsonPivotCorrelationOutlierExplorer({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [rawText, setRawText] = useState<string>(DATA_SAMPLES.saas.csv);
  const [groupCol, setGroupCol] = useState<string>("Region");
  const [valCol, setValCol] = useState<string>("MRR");
  const [aggFunc, setAggFunc] = useState<"SUM" | "MEAN" | "MEDIAN" | "MAX" | "COUNT">("SUM");

  useEffect(() => {
    if (resetTrigger > 0) {
      setRawText(DATA_SAMPLES.saas.csv);
      setGroupCol("Region");
      setValCol("MRR");
      setAggFunc("SUM");
    }
  }, [resetTrigger]);

  const parsed = useMemo(() => {
    const trimmed = rawText.trim();
    if (!trimmed) {
      return { headers: [], rows: [] as Record<string, string | number>[], numCols: [], catCols: [] };
    }

    let rows: Record<string, string | number>[] = [];
    if (trimmed.startsWith("[")) {
      try {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr)) rows = arr;
      } catch {
        rows = [];
      }
    } else {
      const lines = trimmed.split(/\r?\n/).filter(Boolean);
      if (lines.length >= 2) {
        const headers = lines[0].split(",").map((h) => h.trim());
        rows = lines.slice(1).map((line) => {
          const cells = line.split(",").map((c) => c.trim());
          const obj: Record<string, string | number> = {};
          headers.forEach((h, idx) => {
            const num = Number(cells[idx]);
            obj[h] = cells[idx] !== "" && !Number.isNaN(num) ? num : cells[idx] || "";
          });
          return obj;
        });
      }
    }

    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    const numCols = headers.filter((h) =>
      rows.every((r) => typeof r[h] === "number" && !Number.isNaN(r[h]))
    );
    const catCols = headers.filter((h) => !numCols.includes(h));

    return { headers, rows, numCols, catCols };
  }, [rawText]);

  const activeGroup = parsed.headers.includes(groupCol)
    ? groupCol
    : parsed.catCols[0] || parsed.headers[0] || "";
  const activeVal = parsed.numCols.includes(valCol)
    ? valCol
    : parsed.numCols[0] || "";

  const stats = useMemo(() => {
    if (!activeGroup || !activeVal || parsed.rows.length === 0) {
      return { pivot: [], correlations: [], outliers: [] };
    }

    // Group-By Pivot
    const buckets: Record<string, number[]> = {};
    parsed.rows.forEach((r) => {
      const key = String(r[activeGroup] ?? "Unknown");
      const val = Number(r[activeVal] ?? 0);
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(val);
    });

    const pivot = Object.entries(buckets).map(([group, vals]) => {
      const sorted = [...vals].sort((a, b) => a - b);
      const sum = vals.reduce((a, b) => a + b, 0);
      const mean = sum / vals.length;
      const median = sorted[Math.floor(sorted.length / 2)];
      const max = sorted[sorted.length - 1];
      const result =
        aggFunc === "SUM"
          ? sum
          : aggFunc === "MEAN"
          ? mean
          : aggFunc === "MEDIAN"
          ? median
          : aggFunc === "MAX"
          ? max
          : vals.length;
      return { group, count: vals.length, value: Number(result.toFixed(2)) };
    });

    // Pearson Correlation Matrix between numeric columns
    const correlations: { colA: string; colB: string; r: number }[] = [];
    for (let i = 0; i < parsed.numCols.length; i++) {
      for (let j = i + 1; j < parsed.numCols.length; j++) {
        const cA = parsed.numCols[i];
        const cB = parsed.numCols[j];
        const xs = parsed.rows.map((r) => Number(r[cA]));
        const ys = parsed.rows.map((r) => Number(r[cB]));
        const n = xs.length;
        const meanX = xs.reduce((a, b) => a + b, 0) / n;
        const meanY = ys.reduce((a, b) => a + b, 0) / n;
        let num = 0;
        let denX = 0;
        let denY = 0;
        for (let k = 0; k < n; k++) {
          const dx = xs[k] - meanX;
          const dy = ys[k] - meanY;
          num += dx * dy;
          denX += dx * dx;
          denY += dy * dy;
        }
        const r = denX * denY === 0 ? 0 : num / Math.sqrt(denX * denY);
        correlations.push({ colA: cA, colB: cB, r: Number(r.toFixed(3)) });
      }
    }

    // Z-score & IQR Outlier detection on activeVal
    const allVals = parsed.rows.map((r) => Number(r[activeVal]));
    const mean = allVals.reduce((a, b) => a + b, 0) / allVals.length;
    const std =
      Math.sqrt(
        allVals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / allVals.length
      ) || 1;

    const outliers = parsed.rows
      .map((r, idx) => {
        const v = Number(r[activeVal]);
        const z = (v - mean) / std;
        return {
          rowIdx: idx + 1,
          label: String(r[activeGroup]),
          value: v,
          zScore: Number(z.toFixed(2)),
        };
      })
      .filter((o) => Math.abs(o.zScore) >= 1.8);

    return { pivot, correlations, outliers };
  }, [parsed, activeGroup, activeVal, aggFunc]);

  useEffect(() => {
    setOutput(
      [
        `=== CSV/JSON PIVOT, CORRELATION & OUTLIER REPORT ===`,
        `Rows Parsed: ${parsed.rows.length} | Numeric Columns: ${parsed.numCols.join(", ")}`,
        `Pivot (${aggFunc} of ${activeVal} by ${activeGroup}):`,
        ...stats.pivot.map((p) => `  - ${p.group}: ${p.value} (n=${p.count})`),
        `Pearson Correlations (r):`,
        ...stats.correlations.map((c) => `  - ${c.colA} vs ${c.colB}: r = ${c.r}`),
        `Anomalous Outliers (|z| >= 1.8 on ${activeVal}): ${
          stats.outliers.length === 0
            ? "None detected"
            : stats.outliers
                .map((o) => `Row #${o.rowIdx} (${o.label}: ${o.value}, z=${o.zScore})`)
                .join("; ")
        }`,
      ].join("\n")
    );
  }, [parsed, activeGroup, activeVal, aggFunc, stats, setOutput]);

  const maxPivotVal = Math.max(1, ...stats.pivot.map((p) => Math.abs(p.value)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(DATA_SAMPLES).map(([key, sample]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setRawText(sample.csv);
                const firstLine = sample.csv.split("\n")[0].split(",");
                setGroupCol(firstLine[0]);
                setValCol(firstLine[2]);
              }}
              className="rounded-xs border border-border bg-background px-2.5 py-1 text-xs font-semibold text-text hover:border-accent transition cursor-pointer"
            >
              Load: {sample.label}
            </button>
          ))}
        </div>
      </div>

      <textarea
        rows={5}
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder="Paste CSV or JSON array here..."
        className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text"
      />

      {/* Pivot Controls */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xs border border-border bg-background p-2.5">
          <label className="block text-[11px] font-heading uppercase text-text-muted">
            Group-By Dimension
          </label>
          <select
            value={activeGroup}
            onChange={(e) => setGroupCol(e.target.value)}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text"
          >
            {parsed.headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xs border border-border bg-background p-2.5">
          <label className="block text-[11px] font-heading uppercase text-text-muted">
            Numeric Value Metric
          </label>
          <select
            value={activeVal}
            onChange={(e) => setValCol(e.target.value)}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text"
          >
            {parsed.numCols.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xs border border-border bg-background p-2.5">
          <label className="block text-[11px] font-heading uppercase text-text-muted">
            Aggregation Function
          </label>
          <select
            value={aggFunc}
            onChange={(e) =>
              setAggFunc(e.target.value as "SUM" | "MEAN" | "MEDIAN" | "MAX" | "COUNT")
            }
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text"
          >
            {(["SUM", "MEAN", "MEDIAN", "MAX", "COUNT"] as const).map((fn) => (
              <option key={fn} value={fn}>
                {fn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pivot Table + Bar Chart & Correlation Matrix */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xs border border-border bg-background p-3.5">
          <div className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Pivot Table: {aggFunc}({activeVal}) by {activeGroup}
          </div>
          <div className="mt-3 space-y-2">
            {stats.pivot.map((row) => {
              const pct = Math.round((Math.abs(row.value) / maxPivotVal) * 100);
              return (
                <div key={row.group} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">
                      {row.group}{" "}
                      <span className="text-text-muted font-mono-code">(n={row.count})</span>
                    </span>
                    <span className="font-mono-code font-bold text-accent">
                      {row.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-xs bg-surface overflow-hidden">
                    <div
                      className="h-full bg-[#ff6a00]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xs border border-border bg-background p-3.5">
            <div className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Pearson Correlation Matrix (r)
            </div>
            <div className="mt-2 space-y-1.5">
              {stats.correlations.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xs border border-border bg-surface px-2.5 py-1.5 text-xs"
                >
                  <span className="font-mono-code text-text">
                    {c.colA} ↔ {c.colB}
                  </span>
                  <span
                    className={`font-mono-code font-bold ${
                      Math.abs(c.r) > 0.7 ? "text-accent" : "text-text-muted"
                    }`}
                  >
                    r = {c.r > 0 ? `+${c.r}` : c.r}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xs border border-border bg-background p-3.5">
            <div className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Z-Score Anomaly & Outlier Detector ({activeVal})
            </div>
            {stats.outliers.length === 0 ? (
              <p className="mt-1.5 text-xs text-emerald-500">
                No extreme Z-score outliers (|z| ≥ 1.8) detected in {activeVal}.
              </p>
            ) : (
              <div className="mt-2 space-y-1">
                {stats.outliers.map((o) => (
                  <div
                    key={o.rowIdx}
                    className="flex items-center justify-between rounded-xs border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs"
                  >
                    <span className="font-mono-code text-text">
                      Row #{o.rowIdx} ({o.label}): <strong>{o.value.toLocaleString()}</strong>
                    </span>
                    <span className="font-mono-code font-bold text-amber-500">
                      z = {o.zScore}σ
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 19. TIME-SERIES REGRESSION, MOVING AVERAGE & FORECASTING STUDIO
 * ========================================================================== */
const TS_PRESETS: Record<string, { label: string; values: string }> = {
  traffic: {
    label: "12-Month Organic Traffic Growth",
    values: "14200, 15800, 15100, 17400, 18900, 21200, 20500, 23400, 25800, 27100, 29900, 32400",
  },
  cloud: {
    label: "Seasonal Cloud Compute Spend ($)",
    values: "4100, 4350, 4200, 4800, 5100, 5600, 5300, 5900, 6200, 6800, 7900, 7400",
  },
  mrr: {
    label: "SaaS MRR Expansion ($)",
    values: "8500, 9200, 10100, 11400, 12800, 14500, 16100, 18200, 20400, 22900, 25500, 28800",
  },
};

function TimeSeriesRegressionForecastingStudio({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [seriesInput, setSeriesInput] = useState<string>(TS_PRESETS.traffic.values);
  const [horizon, setHorizon] = useState<number>(6);
  const [alpha, setAlpha] = useState<number>(0.45);

  useEffect(() => {
    if (resetTrigger > 0) {
      setSeriesInput(TS_PRESETS.traffic.values);
      setHorizon(6);
      setAlpha(0.45);
    }
  }, [resetTrigger]);

  const model = useMemo(() => {
    const y = seriesInput
      .split(/[\s,]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));

    const n = y.length;
    if (n < 3) {
      return null;
    }

    // OLS Linear Regression: y = m*x + b (for x = 1..n)
    const xs = y.map((_, i) => i + 1);
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - meanX) * (y[i] - meanY);
      den += Math.pow(xs[i] - meanX, 2);
    }
    const slope = den === 0 ? 0 : num / den;
    const intercept = meanY - slope * meanX;

    // R^2, RMSE, MAPE
    let ssRes = 0;
    let ssTot = 0;
    let apeSum = 0;
    for (let i = 0; i < n; i++) {
      const pred = slope * xs[i] + intercept;
      ssRes += Math.pow(y[i] - pred, 2);
      ssTot += Math.pow(y[i] - meanY, 2);
      if (y[i] !== 0) {
        apeSum += Math.abs((y[i] - pred) / y[i]);
      }
    }
    const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);
    const rmse = Math.sqrt(ssRes / n);
    const mape = (apeSum / n) * 100;

    // Exponential Smoothing (Holt linear trend)
    const beta = 0.25;
    let level = y[0];
    let trend = y[1] - y[0];
    const smoothed: number[] = [y[0]];
    for (let i = 1; i < n; i++) {
      const prevLevel = level;
      level = alpha * y[i] + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
      smoothed.push(Number((level + trend).toFixed(1)));
    }

    // Forecast next `horizon` periods
    const forecasts: {
      period: number;
      ols: number;
      holt: number;
      lower95: number;
      upper95: number;
    }[] = [];

    for (let h = 1; h <= horizon; h++) {
      const t = n + h;
      const olsPred = slope * t + intercept;
      const holtPred = level + h * trend;
      const blend = (olsPred + holtPred) / 2;
      const band = 1.96 * rmse * Math.sqrt(1 + h * 0.18);
      forecasts.push({
        period: t,
        ols: Math.round(olsPred),
        holt: Math.round(holtPred),
        lower95: Math.round(blend - band),
        upper95: Math.round(blend + band),
      });
    }

    return {
      y,
      n,
      slope: Number(slope.toFixed(2)),
      intercept: Number(intercept.toFixed(2)),
      rSquared: Number(rSquared.toFixed(4)),
      rmse: Number(rmse.toFixed(1)),
      mape: Number(mape.toFixed(2)),
      smoothed,
      forecasts,
    };
  }, [seriesInput, horizon, alpha]);

  useEffect(() => {
    if (!model) return;
    setOutput(
      [
        `=== TIME-SERIES OLS REGRESSION & HOLT FORECAST REPORT ===`,
        `Observations (n)   : ${model.n} periods`,
        `OLS Equation       : y = ${model.slope}x + ${model.intercept}`,
        `Goodness of Fit R² : ${model.rSquared} | RMSE: ${model.rmse} | MAPE: ${model.mape}%`,
        `--- ${horizon}-PERIOD FORECAST SCHEDULE ---`,
        ...model.forecasts.map(
          (f) =>
            `t+${f.period - model.n} (Period ${f.period}): OLS=${f.ols.toLocaleString()} | Holt=${f.holt.toLocaleString()} | 95% CI [${f.lower95.toLocaleString()} .. ${f.upper95.toLocaleString()}]`
        ),
      ].join("\n")
    );
  }, [model, horizon, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(TS_PRESETS).map(([k, p]) => (
          <button
            key={k}
            type="button"
            onClick={() => setSeriesInput(p.values)}
            className="rounded-xs border border-border bg-background px-2.5 py-1 text-xs font-semibold text-text hover:border-accent transition cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={seriesInput}
        onChange={(e) => setSeriesInput(e.target.value)}
        className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Forecast Horizon (Future Periods)</span>
            <span className="font-mono-code text-accent">+{horizon} periods</span>
          </div>
          <input
            type="range"
            min={3}
            max={12}
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Exponential Smoothing Alpha (α)</span>
            <span className="font-mono-code text-accent">{alpha.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.05}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>
      </div>

      {model && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xs border border-border bg-surface p-3">
              <div className="text-[11px] font-heading uppercase text-text-muted">
                OLS Linear Trend
              </div>
              <div className="mt-1 font-mono-code text-sm font-bold text-text">
                y = {model.slope}t + {model.intercept}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-surface p-3">
              <div className="text-[11px] font-heading uppercase text-text-muted">
                R² Goodness of Fit
              </div>
              <div className="mt-1 font-mono-code text-sm font-bold text-emerald-500">
                {model.rSquared}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-surface p-3">
              <div className="text-[11px] font-heading uppercase text-text-muted">
                RMSE Error
              </div>
              <div className="mt-1 font-mono-code text-sm font-bold text-text">
                ±{model.rmse.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-surface p-3">
              <div className="text-[11px] font-heading uppercase text-text-muted">
                MAPE Accuracy
              </div>
              <div className="mt-1 font-mono-code text-sm font-bold text-accent">
                {model.mape}% error
              </div>
            </div>
          </div>

          {/* Forecast SVG Chart */}
          <div className="rounded-xs border border-border bg-background p-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-heading font-bold uppercase tracking-wider text-text">
                Historical Trajectory + {horizon}-Period Holt/OLS Forecast & 95% CI
              </span>
              <span className="font-mono-code text-text-muted">
                Solid = Historical | Dashed = Forecast
              </span>
            </div>
            {(() => {
              const allValues = [
                ...model.y,
                ...model.forecasts.map((f) => f.upper95),
                ...model.forecasts.map((f) => f.lower95),
              ];
              const minV = Math.min(...allValues) * 0.92;
              const maxV = Math.max(...allValues) * 1.05 || 1;
              const totalT = model.n + horizon;
              const xFor = (t: number) => 30 + ((t - 1) / (totalT - 1)) * 580;
              const yFor = (v: number) =>
                155 - ((v - minV) / (maxV - minV || 1)) * 130;

              const histPoints = model.y
                .map((v, idx) => `${xFor(idx + 1).toFixed(1)},${yFor(v).toFixed(1)}`)
                .join(" ");

              const lastHistX = xFor(model.n);
              const lastHistY = yFor(model.y[model.n - 1]);
              const fcPoints = [
                `${lastHistX.toFixed(1)},${lastHistY.toFixed(1)}`,
                ...model.forecasts.map(
                  (f) => `${xFor(f.period).toFixed(1)},${yFor(f.holt).toFixed(1)}`
                ),
              ].join(" ");

              return (
                <svg viewBox="0 0 630 175" className="w-full h-40">
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    points={histPoints}
                  />
                  <polyline
                    fill="none"
                    stroke="#ff6a00"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                    points={fcPoints}
                  />
                  {model.forecasts.map((f) => (
                    <g key={f.period}>
                      <line
                        x1={xFor(f.period)}
                        y1={yFor(f.upper95)}
                        x2={xFor(f.period)}
                        y2={yFor(f.lower95)}
                        stroke="#ff6a00"
                        strokeOpacity="0.45"
                        strokeWidth="6"
                      />
                      <circle
                        cx={xFor(f.period)}
                        cy={yFor(f.holt)}
                        r={3.5}
                        fill="#ff6a00"
                      />
                    </g>
                  ))}
                </svg>
              );
            })()}
          </div>
        </>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 20. PRINT DPI, BLEED, SAFE ZONE & THERMAL LABEL PIXEL CALCULATOR
 * ========================================================================== */
const PRINT_PRESETS = [
  { id: "4x6-thermal", label: '4×6" Thermal Shipping Label', wIn: 4, hIn: 6, dpi: 203 },
  { id: "barcode", label: '2.25×1.25" FNSKU Barcode Sticker', wIn: 2.25, hIn: 1.25, dpi: 203 },
  { id: "bcard", label: '3.5×2" Standard Business Card', wIn: 3.5, hIn: 2.0, dpi: 300 },
  { id: "us-letter", label: '8.5×11" US Letter Flyer', wIn: 8.5, hIn: 11.0, dpi: 300 },
  { id: "a4", label: 'A4 Document (210×297 mm)', wIn: 8.27, hIn: 11.69, dpi: 300 },
];

function PrintDpiBleedThermalLabelCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [widthIn, setWidthIn] = useState<number>(4);
  const [heightIn, setHeightIn] = useState<number>(6);
  const [dpi, setDpi] = useState<number>(203);
  const [bleedIn, setBleedIn] = useState<number>(0.125);
  const [hexColor, setHexColor] = useState<string>("#1e293b");

  useEffect(() => {
    if (resetTrigger > 0) {
      setWidthIn(4);
      setHeightIn(6);
      setDpi(203);
      setBleedIn(0.125);
      setHexColor("#1e293b");
    }
  }, [resetTrigger]);

  const calc = useMemo(() => {
    const trimW = Math.round(widthIn * dpi);
    const trimH = Math.round(heightIn * dpi);
    const bleedW = Math.round((widthIn + bleedIn * 2) * dpi);
    const bleedH = Math.round((heightIn + bleedIn * 2) * dpi);
    const safeW = Math.round(Math.max(0.2, widthIn - bleedIn * 2) * dpi);
    const safeH = Math.round(Math.max(0.2, heightIn - bleedIn * 2) * dpi);

    const totalBleedPixels = bleedW * bleedH;
    const cmykRamMb = Number(((totalBleedPixels * 4) / (1024 * 1024)).toFixed(2));
    const thermal1BitKb = Number(((trimW * trimH) / 8 / 1024).toFixed(1));

    // RGB Hex -> CMYK conversion + TAC
    const cleanHex = hexColor.replace("#", "").padEnd(6, "0");
    const r = parseInt(cleanHex.slice(0, 2), 16) || 0;
    const g = parseInt(cleanHex.slice(2, 4), 16) || 0;
    const b = parseInt(cleanHex.slice(4, 6), 16) || 0;

    const r1 = r / 255;
    const g1 = g / 255;
    const b1 = b / 255;
    const k = 1 - Math.max(r1, g1, b1);
    const c = k === 1 ? 0 : (1 - r1 - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g1 - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b1 - k) / (1 - k);

    const C = Math.round(c * 100);
    const M = Math.round(m * 100);
    const Y = Math.round(y * 100);
    const K = Math.round(k * 100);
    const tac = C + M + Y + K;

    return {
      trimW,
      trimH,
      bleedW,
      bleedH,
      safeW,
      safeH,
      cmykRamMb,
      thermal1BitKb,
      C,
      M,
      Y,
      K,
      tac,
    };
  }, [widthIn, heightIn, dpi, bleedIn, hexColor]);

  useEffect(() => {
    setOutput(
      [
        `=== PRINT DPI, BLEED & THERMAL LABEL SPECIFICATION ===`,
        `Physical Trim Size : ${widthIn}" × ${heightIn}" (${(widthIn * 25.4).toFixed(1)} × ${(heightIn * 25.4).toFixed(1)} mm) @ ${dpi} DPI`,
        `Full Bleed Canvas  : ${calc.bleedW} × ${calc.bleedH} px (+${bleedIn}" bleed per side)`,
        `Exact Trim Box     : ${calc.trimW} × ${calc.trimH} px`,
        `Safe Margin Zone   : ${calc.safeW} × ${calc.safeH} px`,
        `Uncompressed Size  : ${calc.cmykRamMb} MB (32-bit CMYK TIFF) | ${calc.thermal1BitKb} KB (1-bit ZPL Thermal)`,
        `RGB (${hexColor}) -> CMYK : C=${calc.C}% M=${calc.M}% Y=${calc.Y}% K=${calc.K}% (Total Area Coverage: ${calc.tac}%)`,
      ].join("\n")
    );
  }, [widthIn, heightIn, dpi, bleedIn, hexColor, calc, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {PRINT_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setWidthIn(p.wIn);
              setHeightIn(p.hIn);
              setDpi(p.dpi);
            }}
            className="rounded-xs border border-border bg-background px-2.5 py-1 text-xs font-semibold text-text hover:border-accent transition cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xs border border-border bg-background p-2.5">
          <label className="block text-[11px] font-heading uppercase text-text-muted">
            Trim Width (Inches)
          </label>
          <input
            type="number"
            step="0.25"
            value={widthIn}
            onChange={(e) => setWidthIn(Math.max(0.5, Number(e.target.value)))}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div className="rounded-xs border border-border bg-background p-2.5">
          <label className="block text-[11px] font-heading uppercase text-text-muted">
            Trim Height (Inches)
          </label>
          <input
            type="number"
            step="0.25"
            value={heightIn}
            onChange={(e) => setHeightIn(Math.max(0.5, Number(e.target.value)))}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div className="rounded-xs border border-border bg-background p-2.5">
          <label className="block text-[11px] font-heading uppercase text-text-muted">
            Target Printer DPI
          </label>
          <select
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value))}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          >
            <option value={203}>203 DPI (Zebra/Rollo Thermal)</option>
            <option value={300}>300 DPI (Offset Print / Zebra GX)</option>
            <option value={600}>600 DPI (Fine Vector / Micro-Text)</option>
            <option value={150}>150 DPI (Large Format Banner)</option>
          </select>
        </div>
        <div className="rounded-xs border border-border bg-background p-2.5">
          <label className="block text-[11px] font-heading uppercase text-text-muted">
            Bleed Margin (Inches)
          </label>
          <select
            value={bleedIn}
            onChange={(e) => setBleedIn(Number(e.target.value))}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          >
            <option value={0}>0&quot; (Thermal Direct — No Bleed)</option>
            <option value={0.125}>0.125&quot; (Standard 3mm US Bleed)</option>
            <option value={0.25}>0.250&quot; (Wide Die-Cut Bleed)</option>
          </select>
        </div>
      </div>

      {/* Pixel Output Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xs border border-red-500/40 bg-red-500/5 p-3">
          <div className="text-[11px] font-heading uppercase text-red-400">
            Full Bleed Canvas Size
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            {calc.bleedW} × {calc.bleedH} px
          </div>
          <div className="text-[11px] text-text-muted">
            Extend background artwork to this edge
          </div>
        </div>

        <div className="rounded-xs border border-accent/50 bg-surface p-3">
          <div className="text-[11px] font-heading uppercase text-accent">
            Exact Trim Line Size
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            {calc.trimW} × {calc.trimH} px
          </div>
          <div className="text-[11px] text-text-muted">
            Guillotine blade / thermal label boundary
          </div>
        </div>

        <div className="rounded-xs border border-emerald-500/40 bg-emerald-500/5 p-3">
          <div className="text-[11px] font-heading uppercase text-emerald-500">
            Safe Live Area (Text & Barcodes)
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            {calc.safeW} × {calc.safeH} px
          </div>
          <div className="text-[11px] text-text-muted">
            Keep quiet zones & QR codes inside this box
          </div>
        </div>
      </div>

      {/* RGB to CMYK Total Area Coverage (TAC) Checker */}
      <div className="rounded-xs border border-border bg-background p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <input
              type="color"
              value={hexColor}
              onChange={(e) => setHexColor(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded-xs border border-border"
            />
            <div>
              <div className="font-heading text-xs font-bold uppercase text-text">
                RGB Hex → CMYK Separation & Ink TAC Auditor
              </div>
              <div className="font-mono-code text-xs text-text-muted">
                {hexColor} → C:{calc.C}% M:{calc.M}% Y:{calc.Y}% K:{calc.K}%
              </div>
            </div>
          </div>
          <div
            className={`rounded-xs px-2.5 py-1 font-mono-code text-xs font-bold ${
              calc.tac > 300
                ? "bg-red-500/15 text-red-500"
                : "bg-emerald-500/15 text-emerald-500"
            }`}
          >
            Total Ink Coverage (TAC): {calc.tac}%{" "}
            {calc.tac > 300 ? "(WARN: >300% Smudge Risk!)" : "(Press Safe <=300%)"}
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 21. BOOKMARK HTML MERGER, DEDUPLICATOR & MARKDOWN/JSON CONVERTER
 * ========================================================================== */
const SAMPLE_MESSY_BOOKMARKS = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
  <DT><H3>Cloud & DevOps</H3>
  <DL><p>
    <DT><A HREF="https://developers.cloudflare.com/workers/?utm_source=twitter&utm_medium=social">Cloudflare Workers Docs</A>
    <DT><A HREF="https://developers.cloudflare.com/workers/">Cloudflare Workers Duplicate</A>
    <DT><A HREF="https://github.com/oven-sh/bun?fbclid=IwAR298471298">Bun Fast JS Runtime</A>
  </DL><p>
  <DT><H3>Security & Cryptography</H3>
  <DL><p>
    <DT><A HREF="https://cheatsheetseries.owasp.org/?gclid=Cj0KCQiA">OWASP Cheat Sheet Series</A>
    <DT><A HREF="https://cyberchef.org/">GCHQ CyberChef</A>
    <DT><A HREF="https://cyberchef.org/?utm_campaign=weekly">CyberChef Duplicate Link</A>
  </DL><p>
</DL><p>`;

function BookmarkHtmlMergerDeduplicatorConverter({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [rawHtml, setRawHtml] = useState<string>(SAMPLE_MESSY_BOOKMARKS);
  const [stripTrackers, setStripTrackers] = useState<boolean>(true);
  const [exportFormat, setExportFormat] = useState<"markdown" | "json" | "netscape">(
    "markdown"
  );

  useEffect(() => {
    if (resetTrigger > 0) {
      setRawHtml(SAMPLE_MESSY_BOOKMARKS);
      setStripTrackers(true);
      setExportFormat("markdown");
    }
  }, [resetTrigger]);

  const processed = useMemo(() => {
    const regex = /<A\s+[^>]*HREF=["']([^"']+)["'][^>]*>([^<]*)<\/A>/gi;
    const rawItems: { url: string; title: string }[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(rawHtml)) !== null) {
      rawItems.push({ url: match[1].trim(), title: match[2].trim() || match[1].trim() });
    }

    // Fallback if plain URLs were pasted
    if (rawItems.length === 0) {
      const urlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
      let m2: RegExpExecArray | null;
      while ((m2 = urlRegex.exec(rawHtml)) !== null) {
        rawItems.push({ url: m2[1], title: m2[1] });
      }
    }

    let trackersStrippedCount = 0;
    let duplicatesRemovedCount = 0;
    const seen = new Set<string>();
    const cleanList: { url: string; title: string; domain: string }[] = [];

    rawItems.forEach((item) => {
      let cleanUrl = item.url;
      let domain = "unknown";
      try {
        const u = new URL(item.url);
        domain = u.hostname.replace(/^www\./, "");
        if (stripTrackers) {
          const trackerKeys = [
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "utm_term",
            "utm_content",
            "fbclid",
            "gclid",
            "mc_cid",
            "ref",
          ];
          let hadTracker = false;
          trackerKeys.forEach((k) => {
            if (u.searchParams.has(k)) {
              u.searchParams.delete(k);
              hadTracker = true;
            }
          });
          if (hadTracker) trackersStrippedCount++;
        }
        cleanUrl = u.toString().replace(/\/$/, "");
      } catch {
        // leave as is
      }

      const normKey = cleanUrl.toLowerCase();
      if (seen.has(normKey)) {
        duplicatesRemovedCount++;
      } else {
        seen.add(normKey);
        cleanList.push({ url: cleanUrl, title: item.title, domain });
      }
    });

    let formatted = "";
    if (exportFormat === "markdown") {
      formatted = [
        `# Clean Deduplicated Bookmarks (${cleanList.length} links)`,
        ``,
        ...cleanList.map((b) => `- [${b.title}](${b.url}) — \`${b.domain}\``),
      ].join("\n");
    } else if (exportFormat === "json") {
      formatted = JSON.stringify(cleanList, null, 2);
    } else {
      formatted = [
        `<!DOCTYPE NETSCAPE-Bookmark-file-1>`,
        `<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">`,
        `<TITLE>Bookmarks</TITLE>`,
        `<H1>Bookmarks</H1>`,
        `<DL><p>`,
        ...cleanList.map((b) => `  <DT><A HREF="${b.url}">${b.title}</A>`),
        `</DL><p>`,
      ].join("\n");
    }

    return {
      totalInput: rawItems.length,
      cleanCount: cleanList.length,
      duplicatesRemovedCount,
      trackersStrippedCount,
      formatted,
    };
  }, [rawHtml, stripTrackers, exportFormat]);

  useEffect(() => {
    setOutput(processed.formatted);
  }, [processed, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setRawHtml(SAMPLE_MESSY_BOOKMARKS)}
          className="rounded-xs border border-border bg-background px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-text hover:border-accent transition cursor-pointer"
        >
          Load Sample Messy Bookmarks HTML
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-text cursor-pointer">
            <input
              type="checkbox"
              checked={stripTrackers}
              onChange={(e) => setStripTrackers(e.target.checked)}
              className="accent-[#ff6a00]"
            />
            Strip utm_*, fbclid & gclid Trackers
          </label>
          {(["markdown", "json", "netscape"] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setExportFormat(fmt)}
              className={`rounded-xs border px-2.5 py-1 font-heading text-xs font-bold uppercase transition cursor-pointer ${
                exportFormat === fmt
                  ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                  : "border-border bg-background text-text-muted"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      <textarea
        rows={6}
        value={rawHtml}
        onChange={(e) => setRawHtml(e.target.value)}
        className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text"
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">
            Raw Links Parsed
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            {processed.totalInput}
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">
            Duplicates & Trackers Purged
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-amber-500">
            {processed.duplicatesRemovedCount} dupes / {processed.trackersStrippedCount} UTM
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">
            Unique Clean Bookmarks
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-emerald-500">
            {processed.cleanCount}
          </div>
        </div>
      </div>

      <pre className="max-h-56 overflow-auto rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text">
        {processed.formatted}
      </pre>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 22. NFT METADATA, IPFS CID INSPECTOR & DUTCH AUCTION SIMULATOR
 * ========================================================================== */
const SAMPLE_NFT_JSON = `{
  "name": "ZeroGenesis #042",
  "description": "On-chain generative art artifact stored on IPFS.",
  "image": "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/42.png",
  "attributes": [
    { "trait_type": "Palette", "value": "Solar Flare" },
    { "trait_type": "Generation", "value": 1, "display_type": "number" }
  ]
}`;

function NftMetadataIpfsCidDutchAuctionLab({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [tab, setTab] = useState<"metadata" | "cid" | "dutch">("metadata");
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_NFT_JSON);
  const [cidInput, setCidInput] = useState<string>(
    "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
  );
  const [startEth, setStartEth] = useState<number>(2.5);
  const [reserveEth, setReserveEth] = useState<number>(0.25);
  const [durationMins, setDurationMins] = useState<number>(120);
  const [stepMins, setStepMins] = useState<number>(10);

  useEffect(() => {
    if (resetTrigger > 0) {
      setTab("metadata");
      setJsonInput(SAMPLE_NFT_JSON);
      setCidInput("bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi");
      setStartEth(2.5);
      setReserveEth(0.25);
      setDurationMins(120);
      setStepMins(10);
    }
  }, [resetTrigger]);

  const audit = useMemo(() => {
    // Metadata validation
    const checks: { label: string; pass: boolean; detail: string }[] = [];
    try {
      const obj = JSON.parse(jsonInput);
      checks.push({
        label: "Valid JSON Syntax",
        pass: true,
        detail: "Parses cleanly as ERC-721 / ERC-1155 object",
      });
      checks.push({
        label: "Top-Level name & description",
        pass: Boolean(obj.name && obj.description),
        detail: obj.name ? `Name: "${obj.name}"` : "Missing name or description",
      });
      const img = String(obj.image || "");
      const decentralized = img.startsWith("ipfs://") || img.startsWith("ar://") || img.startsWith("data:");
      checks.push({
        label: "Decentralized Image URI (ipfs:// or ar://)",
        pass: decentralized,
        detail: decentralized
          ? `Immutable URI scheme detected (${img.slice(0, 28)}...)`
          : "WARN: Uses centralized https:// server or missing image field!",
      });
      checks.push({
        label: "OpenSea attributes[] Trait Array",
        pass: Array.isArray(obj.attributes) && obj.attributes.length > 0,
        detail: Array.isArray(obj.attributes)
          ? `${obj.attributes.length} traits verified`
          : "Missing attributes[] array",
      });
    } catch (err) {
      checks.push({
        label: "Valid JSON Syntax",
        pass: false,
        detail: (err as Error).message,
      });
    }

    // CID inspection
    const cleanCid = cidInput.replace(/^ipfs:\/\//, "").trim();
    const isV0 = cleanCid.startsWith("Qm") && cleanCid.length === 46;
    const isV1 = cleanCid.startsWith("bafy") || cleanCid.startsWith("bafk");
    const cidVersion = isV0
      ? "CIDv0 (Base58btc, implicit dag-pb, sha2-256)"
      : isV1
      ? "CIDv1 (Base32 multibase, subdomain gateway compatible)"
      : "Unrecognized / Custom CID Path";

    // Dutch auction schedule
    const stepsCount = Math.max(1, Math.floor(durationMins / Math.max(1, stepMins)));
    const dropPerStep = (startEth - reserveEth) / stepsCount;
    const schedule = Array.from({ length: stepsCount + 1 }, (_, i) => ({
      minute: i * stepMins,
      priceEth: Number(Math.max(reserveEth, startEth - i * dropPerStep).toFixed(4)),
    }));

    return { checks, cleanCid, cidVersion, schedule, dropPerStep };
  }, [jsonInput, cidInput, startEth, reserveEth, durationMins, stepMins]);

  useEffect(() => {
    setOutput(
      [
        `=== NFT METADATA, IPFS CID & DUTCH AUCTION REPORT ===`,
        `CID Inspected   : ${audit.cleanCid} (${audit.cidVersion})`,
        `IPFS Gateway URL: https://ipfs.io/ipfs/${audit.cleanCid}`,
        `Dutch Auction   : ${startEth} ETH -> ${reserveEth} ETH over ${durationMins}m (-${audit.dropPerStep.toFixed(4)} ETH every ${stepMins}m)`,
        `Metadata Checks : ${audit.checks.map((c) => `${c.pass ? "PASS" : "WARN"} ${c.label}`).join(" | ")}`,
      ].join("\n")
    );
  }, [audit, startEth, reserveEth, durationMins, stepMins, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            { id: "metadata", label: "ERC-721 / 1155 Metadata Validator" },
            { id: "cid", label: "IPFS CIDv0 / CIDv1 Gateway Inspector" },
            { id: "dutch", label: "Dutch Auction Price Decay Simulator" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xs border px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              tab === t.id
                ? "border-[#ff6a00] bg-[#ff6a00] text-white"
                : "border-border bg-background text-text-muted hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "metadata" && (
        <div className="space-y-3">
          <textarea
            rows={7}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text"
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {audit.checks.map((c, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded-xs border border-border bg-surface p-2.5 text-xs"
              >
                {c.pass ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                )}
                <div>
                  <div className="font-bold text-text">{c.label}</div>
                  <div className="text-[11px] text-text-muted">{c.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "cid" && (
        <div className="space-y-3">
          <input
            type="text"
            value={cidInput}
            onChange={(e) => setCidInput(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text"
          />
          <div className="rounded-xs border border-border bg-surface p-3.5 space-y-2 text-xs">
            <div>
              <span className="text-text-muted">Detected Encoding: </span>
              <strong className="font-mono-code text-accent">{audit.cidVersion}</strong>
            </div>
            <div className="space-y-1 font-mono-code text-[11px]">
              <div>Canonical URI : ipfs://{audit.cleanCid}</div>
              <div>ipfs.io       : https://ipfs.io/ipfs/{audit.cleanCid}</div>
              <div>dweb.link     : https://dweb.link/ipfs/{audit.cleanCid}</div>
              <div>w3s.link      : https://{audit.cleanCid.split("/")[0]}.ipfs.w3s.link</div>
            </div>
          </div>
        </div>
      )}

      {tab === "dutch" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xs border border-border bg-background p-2.5">
              <label className="block text-[11px] font-heading uppercase text-text-muted">
                Start Price (ETH)
              </label>
              <input
                type="number"
                step="0.1"
                value={startEth}
                onChange={(e) => setStartEth(Number(e.target.value))}
                className="mt-1 w-full rounded-xs border border-border bg-surface px-2 py-1 font-mono-code text-xs text-text"
              />
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <label className="block text-[11px] font-heading uppercase text-text-muted">
                Reserve Floor (ETH)
              </label>
              <input
                type="number"
                step="0.05"
                value={reserveEth}
                onChange={(e) => setReserveEth(Number(e.target.value))}
                className="mt-1 w-full rounded-xs border border-border bg-surface px-2 py-1 font-mono-code text-xs text-text"
              />
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <label className="block text-[11px] font-heading uppercase text-text-muted">
                Total Duration (Mins)
              </label>
              <input
                type="number"
                value={durationMins}
                onChange={(e) => setDurationMins(Math.max(10, Number(e.target.value)))}
                className="mt-1 w-full rounded-xs border border-border bg-surface px-2 py-1 font-mono-code text-xs text-text"
              />
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <label className="block text-[11px] font-heading uppercase text-text-muted">
                Step Interval (Mins)
              </label>
              <input
                type="number"
                value={stepMins}
                onChange={(e) => setStepMins(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-full rounded-xs border border-border bg-surface px-2 py-1 font-mono-code text-xs text-text"
              />
            </div>
          </div>

          <div className="rounded-xs border border-border bg-background p-3.5">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-heading font-bold uppercase tracking-wider text-text">
                Dutch Auction Step-Down Curve ({startEth} ETH → {reserveEth} ETH)
              </span>
              <span className="font-mono-code text-accent">
                −{audit.dropPerStep.toFixed(4)} ETH / {stepMins}m step
              </span>
            </div>
            <svg viewBox="0 0 600 120" className="w-full h-28">
              <polyline
                fill="none"
                stroke="#ff6a00"
                strokeWidth="2.5"
                points={audit.schedule
                  .map((pt, i) => {
                    const x =
                      25 +
                      (i / Math.max(1, audit.schedule.length - 1)) * 550;
                    const y =
                      105 -
                      ((pt.priceEth - reserveEth) /
                        Math.max(0.01, startEth - reserveEth)) *
                        85;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(" ")}
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {audit.schedule.slice(0, 12).map((s) => (
              <div
                key={s.minute}
                className="rounded-xs border border-border bg-surface p-2 text-center"
              >
                <div className="text-[10px] font-mono-code text-text-muted">
                  t = +{s.minute}m
                </div>
                <div className="font-mono-code text-xs font-bold text-accent">
                  {s.priceEth} ETH
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 23. GLOBAL CRYPTO TAX & RESIDENCY JURISDICTION CALCULATOR (12 COUNTRIES)
 * ========================================================================== */
function GlobalCryptoTaxResidencyCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [shortTermGains, setShortTermGains] = useState<number>(35000);
  const [longTermGains, setLongTermGains] = useState<number>(85000);
  const [stakingIncome, setStakingIncome] = useState<number>(12000);

  useEffect(() => {
    if (resetTrigger > 0) {
      setShortTermGains(35000);
      setLongTermGains(85000);
      setStakingIncome(12000);
    }
  }, [resetTrigger]);

  const rows = useMemo(() => {
    const totalCryptoProfit = shortTermGains + longTermGains + stakingIncome;
    const jurisdictions = [
      {
        country: "UAE (Dubai / Abu Dhabi)",
        rule: "0% Personal Income & Capital Gains Tax",
        tax: 0,
        lossOffset: "N/A (0% Tax)",
      },
      {
        country: "Singapore",
        rule: "0% Capital Gains Tax (Staking taxed only if commercial)",
        tax: Math.round(stakingIncome * 0.15),
        lossOffset: "No CGT",
      },
      {
        country: "Switzerland (Zug / Zurich)",
        rule: "0% Private Wealth Capital Gains; Ordinary Income on Staking",
        tax: Math.round(stakingIncome * 0.22),
        lossOffset: "Private CGT Exempt",
      },
      {
        country: "El Salvador",
        rule: "0% Tax on Bitcoin & Foreign-Sourced Crypto Capital Gains",
        tax: 0,
        lossOffset: "Exempt",
      },
      {
        country: "Germany (>1 Year Holding)",
        rule: "0% Long-Term (>365d) Private Sale; Short-Term up to 42%",
        tax: Math.round(shortTermGains * 0.38 + stakingIncome * 0.38),
        lossOffset: "Yes (within 1yr window)",
      },
      {
        country: "Portugal (>365d Holding)",
        rule: "0% on tokens held >365 days; 28% flat on <365d short-term",
        tax: Math.round(shortTermGains * 0.28 + stakingIncome * 0.28),
        lossOffset: "Yes (5yr carryforward)",
      },
      {
        country: "USA (Federal Single Filer)",
        rule: "Short-Term & Staking at Ordinary Brackets (~28%); Long-Term 15–20%",
        tax: Math.round(
          shortTermGains * 0.28 + longTermGains * 0.15 + stakingIncome * 0.28
        ),
        lossOffset: "Yes ($3k/yr + unlimited CGT offset)",
      },
      {
        country: "United Kingdom (HMRC CGT)",
        rule: "£3,000 CGT Allowance; 18%–24% Capital Gains + Income on Staking",
        tax: Math.round(
          Math.max(0, shortTermGains + longTermGains - 3800) * 0.24 +
            stakingIncome * 0.32
        ),
        lossOffset: "Yes (Reportable capital losses)",
      },
      {
        country: "Australia (ATO 50% Discount)",
        rule: "50% CGT Discount on assets held >12 mos; ~37% marginal rate",
        tax: Math.round(
          (shortTermGains + longTermGains * 0.5 + stakingIncome) * 0.37
        ),
        lossOffset: "Yes (Capital loss carryforward)",
      },
      {
        country: "Canada (CRA Inclusion Rate)",
        rule: "50%–66.7% of Capital Gains included in taxable income",
        tax: Math.round(
          ((shortTermGains + longTermGains) * 0.55 + stakingIncome) * 0.38
        ),
        lossOffset: "Yes (Net capital losses)",
      },
      {
        country: "India (Section 115BBH VDA)",
        rule: "Flat 30% VDA Tax + 4% Cess (31.2%) + 1% TDS on every transfer",
        tax: Math.round(totalCryptoProfit * 0.312),
        lossOffset: "NO Loss Offset Allowed!",
      },
      {
        country: "Japan (NTA Miscellaneous Income)",
        rule: "Progressive Miscellaneous Income up to 55% (National + Resident)",
        tax: Math.round(totalCryptoProfit * 0.45),
        lossOffset: "Limited to same year misc",
      },
    ];

    return jurisdictions.map((j) => {
      const effRate =
        totalCryptoProfit > 0
          ? Number(((j.tax / totalCryptoProfit) * 100).toFixed(1))
          : 0;
      return {
        ...j,
        netTakeHome: totalCryptoProfit - j.tax,
        effRate,
      };
    });
  }, [shortTermGains, longTermGains, stakingIncome]);

  useEffect(() => {
    setOutput(
      [
        `=== 2026 GLOBAL CRYPTO TAX & RESIDENCY COMPARISON ===`,
        `Short-Term (<12m): $${shortTermGains.toLocaleString()} | Long-Term (>12m): $${longTermGains.toLocaleString()} | Staking: $${stakingIncome.toLocaleString()}`,
        ...rows.map(
          (r) =>
            `- ${r.country.padEnd(28)}: Tax = $${r.tax.toLocaleString()} (${r.effRate}% eff.) | Net = $${r.netTakeHome.toLocaleString()} | Loss Offset: ${r.lossOffset}`
        ),
      ].join("\n")
    );
  }, [rows, shortTermGains, longTermGains, stakingIncome, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Short-Term Gains (&lt;12 mos)</span>
            <span className="font-mono-code text-accent">
              ${shortTermGains.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={250000}
            step={5000}
            value={shortTermGains}
            onChange={(e) => setShortTermGains(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Long-Term Gains (&gt;12 mos)</span>
            <span className="font-mono-code text-emerald-500">
              ${longTermGains.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={500000}
            step={5000}
            value={longTermGains}
            onChange={(e) => setLongTermGains(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Staking / Airdrop Yield</span>
            <span className="font-mono-code text-text">
              ${stakingIncome.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100000}
            step={2000}
            value={stakingIncome}
            onChange={(e) => setStakingIncome(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xs border border-border bg-background">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-surface font-heading text-[11px] uppercase text-text-muted">
            <tr>
              <th className="px-3 py-2">Jurisdiction</th>
              <th className="px-3 py-2">2026 Tax Regime</th>
              <th className="px-3 py-2">Est. Tax</th>
              <th className="px-3 py-2">Effective %</th>
              <th className="px-3 py-2">Net Retained</th>
              <th className="px-3 py-2">Loss Offset</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.country} className="hover:bg-surface/60">
                <td className="px-3 py-2 font-bold text-text">{r.country}</td>
                <td className="px-3 py-2 text-text-muted">{r.rule}</td>
                <td className="px-3 py-2 font-mono-code font-bold text-amber-500">
                  ${r.tax.toLocaleString()}
                </td>
                <td className="px-3 py-2 font-mono-code text-text">{r.effRate}%</td>
                <td className="px-3 py-2 font-mono-code font-bold text-emerald-500">
                  ${r.netTakeHome.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-[11px] text-text-muted">{r.lossOffset}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 24. COMPOUND INTEREST, STEP-UP SIP & FIRE RETIREMENT CALCULATOR
 * ========================================================================== */
function CompoundInterestSipFireRetirementCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [initialCorpus, setInitialCorpus] = useState<number>(25000);
  const [monthlySip, setMonthlySip] = useState<number>(1500);
  const [stepUpPct, setStepUpPct] = useState<number>(10);
  const [returnPct, setReturnPct] = useState<number>(12);
  const [inflationPct, setInflationPct] = useState<number>(4);
  const [years, setYears] = useState<number>(20);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(4000);

  useEffect(() => {
    if (resetTrigger > 0) {
      setInitialCorpus(25000);
      setMonthlySip(1500);
      setStepUpPct(10);
      setReturnPct(12);
      setInflationPct(4);
      setYears(20);
      setMonthlyExpenses(4000);
    }
  }, [resetTrigger]);

  const projection = useMemo(() => {
    const rMonthly = returnPct / 100 / 12;
    let nominalBalance = initialCorpus;
    let totalInvested = initialCorpus;
    let currentSip = monthlySip;

    const yearlySnapshots: {
      year: number;
      invested: number;
      nominal: number;
      realPurchasingPower: number;
    }[] = [];

    for (let y = 1; y <= years; y++) {
      for (let m = 1; m <= 12; m++) {
        nominalBalance = (nominalBalance + currentSip) * (1 + rMonthly);
        totalInvested += currentSip;
      }
      const realVal = nominalBalance / Math.pow(1 + inflationPct / 100, y);
      yearlySnapshots.push({
        year: y,
        invested: Math.round(totalInvested),
        nominal: Math.round(nominalBalance),
        realPurchasingPower: Math.round(realVal),
      });
      currentSip = currentSip * (1 + stepUpPct / 100);
    }

    const finalSnap = yearlySnapshots[yearlySnapshots.length - 1];
    const annualExpensesToday = monthlyExpenses * 12;
    const leanFire = Math.round(annualExpensesToday * 20);
    const standardFire = Math.round(annualExpensesToday * 25); // 4% Rule
    const fatFire = Math.round(annualExpensesToday * 33.33); // 3% SWR

    const fireYearHit =
      yearlySnapshots.find((s) => s.realPurchasingPower >= standardFire)?.year ?? null;

    return {
      yearlySnapshots,
      finalInvested: finalSnap.invested,
      finalNominal: finalSnap.nominal,
      finalReal: finalSnap.realPurchasingPower,
      wealthGained: finalSnap.nominal - finalSnap.invested,
      leanFire,
      standardFire,
      fatFire,
      fireYearHit,
    };
  }, [
    initialCorpus,
    monthlySip,
    stepUpPct,
    returnPct,
    inflationPct,
    years,
    monthlyExpenses,
  ]);

  useEffect(() => {
    setOutput(
      [
        `=== STEP-UP SIP & FIRE RETIREMENT PROJECTION (${years} YEARS) ===`,
        `Initial Principal  : $${initialCorpus.toLocaleString()} | Starting SIP: $${monthlySip.toLocaleString()}/mo (+${stepUpPct}%/yr step-up)`,
        `Total Invested     : $${projection.finalInvested.toLocaleString()}`,
        `Nominal Final Value: $${projection.finalNominal.toLocaleString()} (Gain: +$${projection.wealthGained.toLocaleString()})`,
        `Inflation-Adj Real : $${projection.finalReal.toLocaleString()} (in today's purchasing power @ ${inflationPct}% CPI)`,
        `FIRE Targets (Today's $): Lean-FIRE (20x) = $${projection.leanFire.toLocaleString()} | Standard 4% FIRE (25x) = $${projection.standardFire.toLocaleString()} | Fat-FIRE (33x) = $${projection.fatFire.toLocaleString()}`,
      ].join("\n")
    );
  }, [projection, initialCorpus, monthlySip, stepUpPct, inflationPct, years, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Initial Lump-Sum Corpus</span>
            <span className="font-mono-code text-accent">
              ${initialCorpus.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={200000}
            step={5000}
            value={initialCorpus}
            onChange={(e) => setInitialCorpus(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Starting Monthly SIP</span>
            <span className="font-mono-code text-accent">
              ${monthlySip.toLocaleString()}/mo
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={10000}
            step={100}
            value={monthlySip}
            onChange={(e) => setMonthlySip(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Annual SIP Step-Up %</span>
            <span className="font-mono-code text-emerald-500">+{stepUpPct}%/yr</span>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            value={stepUpPct}
            onChange={(e) => setStepUpPct(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Expected Annual Return (CAGR)</span>
            <span className="font-mono-code text-accent">{returnPct}%</span>
          </div>
          <input
            type="range"
            min={4}
            max={20}
            step={0.5}
            value={returnPct}
            onChange={(e) => setReturnPct(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Inflation Rate (CPI) & Horizon</span>
            <span className="font-mono-code text-text">
              {inflationPct}% CPI | {years} yrs
            </span>
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="range"
              min={2}
              max={8}
              step={0.5}
              value={inflationPct}
              onChange={(e) => setInflationPct(Number(e.target.value))}
              className="w-1/2 accent-[#ff6a00]"
            />
            <input
              type="range"
              min={5}
              max={35}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-1/2 accent-[#ff6a00]"
            />
          </div>
        </div>

        <div className="rounded-xs border border-border bg-background p-3">
          <div className="flex justify-between text-xs font-semibold">
            <span>Target Monthly Retirement Spend</span>
            <span className="font-mono-code text-accent">
              ${monthlyExpenses.toLocaleString()}/mo
            </span>
          </div>
          <input
            type="range"
            min={1500}
            max={15000}
            step={250}
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">
            Total Principal Invested
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            ${projection.finalInvested.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">
            Nominal Final Corpus
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-accent">
            ${projection.finalNominal.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">
            Real Corpus (Today&apos;s $)
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-emerald-500">
            ${projection.finalReal.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-heading uppercase text-text-muted">
            25x Standard FIRE Target
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            ${projection.standardFire.toLocaleString()}
          </div>
          <div className="text-[11px] text-text-muted">
            {projection.fireYearHit
              ? `Reached in Year ${projection.fireYearHit} (Real $)`
              : "Increase SIP or horizon to hit 25x"}
          </div>
        </div>
      </div>

      {/* Stacked SVG Wealth Growth Chart */}
      <div className="rounded-xs border border-border bg-background p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-heading font-bold uppercase tracking-wider text-text">
            Stacked Principal vs Compound Wealth Growth ({years} Years)
          </span>
          <span className="font-mono-code text-[11px] text-text-muted">
            Lean-FIRE: ${projection.leanFire.toLocaleString()} | 4% FIRE: $
            {projection.standardFire.toLocaleString()} | Fat-FIRE: $
            {projection.fatFire.toLocaleString()}
          </span>
        </div>
        {(() => {
          const maxNominal = Math.max(1, projection.finalNominal);
          const barCount = projection.yearlySnapshots.length;
          const barWidth = Math.max(8, Math.floor(560 / barCount) - 4);
          return (
            <svg viewBox="0 0 620 155" className="w-full h-36">
              {projection.yearlySnapshots.map((snap, idx) => {
                const x = 30 + (idx / Math.max(1, barCount)) * 570;
                const totalH = (snap.nominal / maxNominal) * 125;
                const invH = (snap.invested / maxNominal) * 125;
                const gainH = Math.max(0, totalH - invH);
                return (
                  <g key={snap.year}>
                    {/* Principal Invested (bottom bar) */}
                    <rect
                      x={x}
                      y={140 - invH}
                      width={barWidth}
                      height={invH}
                      fill="#38bdf8"
                      rx={1.5}
                    />
                    {/* Compound Gain (stacked top bar) */}
                    <rect
                      x={x}
                      y={140 - totalH}
                      width={barWidth}
                      height={gainH}
                      fill="#ff6a00"
                      rx={1.5}
                    />
                  </g>
                );
              })}
            </svg>
          );
        })()}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 25. E.164 PHONE FORMATTER, WHATSAPP/SIP URI & VOIP COST CALCULATOR
 * ========================================================================== */
const SAMPLE_PHONES = `(415) 555-2671
98765-43210
0044 7911 123456
1-800-555-0199`;

const COUNTRY_DIALS: Record<string, { name: string; code: string }> = {
  US: { name: "United States / Canada (+1)", code: "1" },
  IN: { name: "India (+91)", code: "91" },
  GB: { name: "United Kingdom (+44)", code: "44" },
  AE: { name: "UAE (+971)", code: "971" },
  AU: { name: "Australia (+61)", code: "61" },
  DE: { name: "Germany (+49)", code: "49" },
  SG: { name: "Singapore (+65)", code: "65" },
};

function E164PhoneFormatterVirtualNumberCostCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [rawInput, setRawInput] = useState<string>(SAMPLE_PHONES);
  const [defaultCountry, setDefaultCountry] = useState<string>("US");
  const [teamSeats, setTeamSeats] = useState<number>(5);
  const [monthlyMinutes, setMonthlyMinutes] = useState<number>(3500);

  useEffect(() => {
    if (resetTrigger > 0) {
      setRawInput(SAMPLE_PHONES);
      setDefaultCountry("US");
      setTeamSeats(5);
      setMonthlyMinutes(3500);
    }
  }, [resetTrigger]);

  const parsed = useMemo(() => {
    const dialCode = COUNTRY_DIALS[defaultCountry]?.code || "1";
    const lines = rawInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const normalized = lines.map((raw) => {
      const hasPlus = raw.startsWith("+") || raw.startsWith("00");
      let digits = raw.replace(/\D/g, "");
      if (raw.startsWith("00")) {
        digits = digits.slice(2);
      } else if (!hasPlus && digits.length === 10) {
        digits = `${dialCode}${digits}`;
      }
      const e164 = `+${digits}`;
      const rfc3966 = `tel:${e164}`;
      const whatsapp = `https://wa.me/${digits}`;
      const sip = `sip:${e164}@sip.trunk.example.com`;
      const valid = digits.length >= 8 && digits.length <= 15;
      return { raw, e164, rfc3966, whatsapp, sip, valid };
    });

    // VoIP provider cost comparison
    const providers = [
      {
        name: "Twilio Elastic SIP Trunking (Pay-as-you-go)",
        monthlyUsd: Math.round(teamSeats * 1.15 + monthlyMinutes * 0.011),
        notes: "$1.15/DID + ~$0.011/min blended; best for custom PBX / AI voice agents",
      },
      {
        name: "Google Voice Starter (Workspace Add-on)",
        monthlyUsd: teamSeats * 10,
        notes: "$10/user/mo; unlimited US domestic calling",
      },
      {
        name: "Quo (formerly OpenPhone) Starter",
        monthlyUsd: teamSeats * 15,
        notes: "$15/user/mo; shared team inbox, CRM webhooks & SMS",
      },
      {
        name: "Nextiva Core / RingCentral Core",
        monthlyUsd: teamSeats * 25,
        notes: "$25/user/mo; enterprise IVR trees, call queues & HIPAA BAA options",
      },
    ];

    return { normalized, providers };
  }, [rawInput, defaultCountry, teamSeats, monthlyMinutes]);

  useEffect(() => {
    setOutput(
      [
        `=== ITU-T E.164 PHONE NORMALIZER & VOIP PRICING REPORT ===`,
        ...parsed.normalized.map(
          (n) =>
            `${n.raw.padEnd(18)} -> E.164: ${n.e164} | WhatsApp: ${n.whatsapp} | SIP: ${n.sip}`
        ),
        ``,
        `--- VOIP TEAM COST (${teamSeats} Seats, ${monthlyMinutes.toLocaleString()} mins/mo) ---`,
        ...parsed.providers.map((p) => `- ${p.name}: $${p.monthlyUsd}/mo (${p.notes})`),
      ].join("\n")
    );
  }, [parsed, teamSeats, monthlyMinutes, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xs border border-border bg-background p-2.5">
          <label className="block text-[11px] font-heading uppercase text-text-muted">
            Default Fallback Country Code
          </label>
          <select
            value={defaultCountry}
            onChange={(e) => setDefaultCountry(e.target.value)}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text"
          >
            {Object.entries(COUNTRY_DIALS).map(([iso, c]) => (
              <option key={iso} value={iso}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xs border border-border bg-background p-2.5">
          <div className="flex justify-between text-xs font-semibold">
            <span>VoIP Team Seats</span>
            <span className="font-mono-code text-accent">{teamSeats} users</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={teamSeats}
            onChange={(e) => setTeamSeats(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>

        <div className="rounded-xs border border-border bg-background p-2.5">
          <div className="flex justify-between text-xs font-semibold">
            <span>Monthly Call Minutes</span>
            <span className="font-mono-code text-accent">
              {monthlyMinutes.toLocaleString()} mins
            </span>
          </div>
          <input
            type="range"
            min={500}
            max={25000}
            step={500}
            value={monthlyMinutes}
            onChange={(e) => setMonthlyMinutes(Number(e.target.value))}
            className="mt-2 w-full accent-[#ff6a00]"
          />
        </div>
      </div>

      <textarea
        rows={4}
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text"
      />

      <div className="overflow-x-auto rounded-xs border border-border bg-background">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-surface font-heading text-[11px] uppercase text-text-muted">
            <tr>
              <th className="px-3 py-2">Raw Input</th>
              <th className="px-3 py-2">ITU-T E.164</th>
              <th className="px-3 py-2">RFC 3966 tel:</th>
              <th className="px-3 py-2">WhatsApp Direct</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono-code">
            {parsed.normalized.map((n, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 text-text-muted">{n.raw}</td>
                <td className="px-3 py-2 font-bold text-accent">{n.e164}</td>
                <td className="px-3 py-2 text-text">{n.rfc3966}</td>
                <td className="px-3 py-2 text-emerald-500">{n.whatsapp}</td>
                <td className="px-3 py-2">
                  {n.valid ? (
                    <span className="text-emerald-500 font-bold">VALID (≤15d)</span>
                  ) : (
                    <span className="text-red-500 font-bold">INVALID LENGTH</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VoIP Provider Cost Comparison */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {parsed.providers.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between rounded-xs border border-border bg-surface p-3"
          >
            <div>
              <div className="font-heading text-xs font-bold text-text">{p.name}</div>
              <div className="text-[11px] text-text-muted">{p.notes}</div>
            </div>
            <div className="font-mono-code text-base font-bold text-accent">
              ${p.monthlyUsd}/mo
            </div>
          </div>
        ))}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * EXPORT REGISTRY FOR WAVE 6 GROUP B: 12 HARDWARE, AUDIO, DATA & FINTECH TOOLS
 * ========================================================================== */
export const wave6HardwareDataFinancePlaygrounds: Record<
  string,
  React.ComponentType<{ tool: Tool }>
> = {
  "voiceprint-formant-mfcc-spectrogram-analyzer":
    VoiceprintFormantMfccSpectrogramAnalyzer,
  "bluetooth-audio-codec-battery-latency-calculator":
    BluetoothAudioCodecBatteryLatencyCalculator,
  "duplicate-photo-perceptual-hash-cleaner":
    DuplicatePhotoPerceptualHashCleaner,
  "zero-upload-document-scanner-contrast-studio":
    ZeroUploadDocumentScannerContrastStudio,
  "csv-json-pivot-correlation-outlier-explorer":
    CsvJsonPivotCorrelationOutlierExplorer,
  "time-series-regression-forecasting-studio":
    TimeSeriesRegressionForecastingStudio,
  "print-dpi-bleed-thermal-label-calculator":
    PrintDpiBleedThermalLabelCalculator,
  "bookmark-html-merger-deduplicator-converter":
    BookmarkHtmlMergerDeduplicatorConverter,
  "nft-metadata-ipfs-cid-dutch-auction-lab":
    NftMetadataIpfsCidDutchAuctionLab,
  "global-crypto-tax-residency-calculator":
    GlobalCryptoTaxResidencyCalculator,
  "compound-interest-sip-fire-retirement-calculator":
    CompoundInterestSipFireRetirementCalculator,
  "e164-phone-formatter-virtual-number-cost-calculator":
    E164PhoneFormatterVirtualNumberCostCalculator,
};

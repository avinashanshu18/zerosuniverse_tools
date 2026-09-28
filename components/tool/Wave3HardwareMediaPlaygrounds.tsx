"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Volume2,
  Bluetooth,
  Droplets,
  Keyboard,
  Activity,
  Subtitles,
  Download,
  Image as ImageIcon,
  Film,
  Rss,
  Radio,
  BatteryCharging,
  Plane,
  BarChart3,
  Network,
  HeartPulse,
  ShieldAlert,
  Play,
  Square,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Upload,
  Terminal,
  Copy,
  Check,
} from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { useToolCard, ToolActions } from "@/components/tool/ToolPlaygrounds";

/* ============================================================================
 * 14. BLUETOOTH AUDIO LATENCY, STEREO PANNING & SPEAKER WATER-EJECT TESTER
 * ========================================================================== */
type StereoChannelMode = "left" | "center" | "right" | "out-of-phase";

function BluetoothAudioLatencyStereoTester({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [activeChannel, setActiveChannel] = useState<StereoChannelMode | null>(null);
  const [stereoFreq, setStereoFreq] = useState<number>(440);
  const [metronomeRunning, setMetronomeRunning] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [latencyOffsetMs, setLatencyOffsetMs] = useState(160);
  const [flashActive, setFlashActive] = useState(false);
  const [waterEjectRunning, setWaterEjectRunning] = useState(false);
  const [waterEjectFreq, setWaterEjectFreq] = useState(165);
  const [waterTimer, setWaterTimer] = useState(15);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const oscRightRef = useRef<OscillatorNode | null>(null);
  const metronomeTimerRef = useRef<number | null>(null);
  const waterTimerRef = useRef<number | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const stopAllAudio = useCallback(() => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch {
        // ignore
      }
      oscRef.current = null;
    }
    if (oscRightRef.current) {
      try {
        oscRightRef.current.stop();
        oscRightRef.current.disconnect();
      } catch {
        // ignore
      }
      oscRightRef.current = null;
    }
    if (metronomeTimerRef.current) {
      window.clearInterval(metronomeTimerRef.current);
      metronomeTimerRef.current = null;
    }
    if (waterTimerRef.current) {
      window.clearInterval(waterTimerRef.current);
      waterTimerRef.current = null;
    }
    setActiveChannel(null);
    setMetronomeRunning(false);
    setWaterEjectRunning(false);
    setFlashActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAllAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopAllAudio]);

  const startStereoChannel = (mode: StereoChannelMode) => {
    if (activeChannel === mode) {
      stopAllAudio();
      return;
    }
    stopAllAudio();
    const ctx = getAudioCtx();

    if (mode === "out-of-phase") {
      // Create dual oscillators merged into Left (+1) and Right (-1 inverted phase)
      const merger = ctx.createChannelMerger(2);
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const gainL = ctx.createGain();
      const gainR = ctx.createGain();

      oscL.type = "sine";
      oscR.type = "sine";
      oscL.frequency.value = stereoFreq;
      oscR.frequency.value = stereoFreq;

      gainL.gain.value = 0.35;
      gainR.gain.value = -0.35; // 180-degree phase inversion

      oscL.connect(gainL);
      oscR.connect(gainR);
      gainL.connect(merger, 0, 0);
      gainR.connect(merger, 0, 1);
      merger.connect(ctx.destination);

      oscL.start();
      oscR.start();
      oscRef.current = oscL;
      oscRightRef.current = oscR;
    } else {
      const osc = ctx.createOscillator();
      const panner = ctx.createStereoPanner();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = stereoFreq;
      gain.gain.value = 0.35;
      panner.pan.value = mode === "left" ? -1 : mode === "right" ? 1 : 0;

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
    }
    setActiveChannel(mode);
  };

  const playClickTone = useCallback(() => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.045);

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }, [getAudioCtx]);

  const toggleMetronome = () => {
    if (metronomeRunning) {
      stopAllAudio();
      return;
    }
    stopAllAudio();
    getAudioCtx();
    setMetronomeRunning(true);
  };

  useEffect(() => {
    if (!metronomeRunning) return;
    const intervalMs = Math.round(60000 / bpm);

    const tick = () => {
      if (latencyOffsetMs >= 0) {
        // Audio plays first, visual flashes after latencyOffsetMs to match delayed Bluetooth audio arrival
        playClickTone();
        window.setTimeout(() => {
          setFlashActive(true);
          window.setTimeout(() => setFlashActive(false), 90);
        }, latencyOffsetMs);
      } else {
        // Negative offset: visual flashes first, audio plays after |latencyOffsetMs|
        setFlashActive(true);
        window.setTimeout(() => setFlashActive(false), 90);
        window.setTimeout(() => {
          playClickTone();
        }, Math.abs(latencyOffsetMs));
      }
    };

    tick();
    const id = window.setInterval(tick, intervalMs);
    metronomeTimerRef.current = id;
    return () => window.clearInterval(id);
  }, [metronomeRunning, bpm, latencyOffsetMs, playClickTone]);

  const toggleWaterEject = () => {
    if (waterEjectRunning) {
      stopAllAudio();
      return;
    }
    stopAllAudio();
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(waterEjectFreq, ctx.currentTime);
    gain.gain.setValueAtTime(0.65, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    oscRef.current = osc;
    setWaterEjectRunning(true);
    setWaterTimer(15);

    waterTimerRef.current = window.setInterval(() => {
      setWaterTimer((prev) => {
        if (prev <= 1) {
          stopAllAudio();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const codecProfile = useMemo(() => {
    if (latencyOffsetMs <= 40) return "Wired / 2.4GHz Dongle / LC3plus Ultra-Low Latency (<40ms)";
    if (latencyOffsetMs <= 90) return "aptX Low Latency / aptX Adaptive Gaming Mode (50–90ms)";
    if (latencyOffsetMs <= 170) return "Apple AirPods Pro (AAC Bluetooth 5.3) (~120–170ms)";
    if (latencyOffsetMs <= 250) return "Standard Bluetooth SBC / AAC / LDAC Audio (~180–250ms)";
    return "High-Buffer Bluetooth / TWS Stereo Relay (>250ms — lip-sync delay noticeable)";
  }, [latencyOffsetMs]);

  useEffect(() => {
    const report = [
      `=== BLUETOOTH AUDIO LATENCY, STEREO & WATER-EJECT DIAGNOSTIC ===`,
      `Active Stereo Channel Mode : ${activeChannel ? activeChannel.toUpperCase() : "IDLE"} (${stereoFreq} Hz)`,
      `Lip-Sync Metronome Status  : ${metronomeRunning ? `RUNNING @ ${bpm} BPM` : "STOPPED"}`,
      `Measured Bluetooth Offset  : ${latencyOffsetMs >= 0 ? `+${latencyOffsetMs}` : latencyOffsetMs} ms`,
      `Estimated Codec Profile    : ${codecProfile}`,
      `Speaker Water-Eject Mode   : ${waterEjectRunning ? `ACTIVE (${waterEjectFreq} Hz — ${waterTimer}s left)` : `STANDBY (${waterEjectFreq} Hz)`}`,
      `Audio Driver Context       : Web Audio API (StereoPannerNode + Phase-Inversion ChannelMerger)`,
    ].join("\n");
    setOutput(report);
  }, [
    activeChannel,
    stereoFreq,
    metronomeRunning,
    bpm,
    latencyOffsetMs,
    codecProfile,
    waterEjectRunning,
    waterEjectFreq,
    waterTimer,
    setOutput,
  ]);

  return (
    <div className="space-y-5">
      {/* Section A: Left / Right / Center / Out-of-Phase Stereo Test */}
      <div className="rounded-xs border border-border bg-surface p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-accent" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              A. Left / Right / Center &amp; Out-of-Phase Stereo Panner Test
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono-code text-text-muted">Tone:</label>
            {[220, 440, 1000].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStereoFreq(f)}
                className={`rounded-xs px-2 py-0.5 font-mono-code text-xs border cursor-pointer ${
                  stereoFreq === f
                    ? "border-accent bg-accent/15 text-accent font-bold"
                    : "border-border bg-background text-text-muted hover:text-text"
                }`}
              >
                {f}Hz
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(
            [
              { id: "left", label: "Left Only (L -1.0)", sub: "Verify Left Earbud" },
              { id: "center", label: "Center Mono (0.0)", sub: "Phantom Center" },
              { id: "right", label: "Right Only (R +1.0)", sub: "Verify Right Earbud" },
              { id: "out-of-phase", label: "Out-of-Phase (180°)", sub: "Polarity Inversion" },
            ] as const
          ).map((btn) => {
            const isRunning = activeChannel === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => startStereoChannel(btn.id)}
                className={`flex flex-col items-start justify-between rounded-xs border p-3 text-left transition cursor-pointer ${
                  isRunning
                    ? "border-[#ff6a00] bg-[#ff6a00]/15 text-text"
                    : "border-border bg-background hover:border-accent text-text"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-heading text-xs font-bold uppercase">{btn.label}</span>
                  {isRunning ? (
                    <Square className="h-3.5 w-3.5 text-[#ff6a00] fill-[#ff6a00]" />
                  ) : (
                    <Play className="h-3.5 w-3.5 text-accent" />
                  )}
                </div>
                <span className="font-mono-code text-[11px] text-text-muted">{btn.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section B: Visual Metronome Lip-Sync Flasher */}
      <div className="rounded-xs border border-border bg-surface p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bluetooth className="h-4 w-4 text-accent" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              B. Visual Metronome Lip-Sync Flasher (-300ms to +500ms Offset)
            </span>
          </div>
          <button
            type="button"
            onClick={toggleMetronome}
            className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-3.5 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 cursor-pointer"
          >
            {metronomeRunning ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {metronomeRunning ? "Stop Metronome" : "Start Lip-Sync Test"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono-code mb-1">
                <span className="text-text-muted">Bluetooth Delay Offset Calibration:</span>
                <span className="font-bold text-accent">
                  {latencyOffsetMs >= 0 ? `+${latencyOffsetMs} ms` : `${latencyOffsetMs} ms`}
                </span>
              </div>
              <input
                type="range"
                min={-300}
                max={500}
                step={5}
                value={latencyOffsetMs}
                onChange={(e) => setLatencyOffsetMs(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
              <div className="flex justify-between text-[10px] font-mono-code text-text-muted mt-0.5">
                <span>-300ms (Early Flash)</span>
                <span>0ms (Wired Sync)</span>
                <span>+160ms (AirPods)</span>
                <span>+500ms</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono-code text-text-muted">Presets:</span>
              {[
                { label: "Wired (0ms)", val: 0 },
                { label: "aptX-LL (+55ms)", val: 55 },
                { label: "AirPods Pro (+145ms)", val: 145 },
                { label: "Standard SBC (+220ms)", val: 220 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setLatencyOffsetMs(p.val)}
                  className="rounded-xs border border-border bg-background px-2.5 py-1 font-mono-code text-[11px] text-text hover:border-accent cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
              <select
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="ml-auto rounded-xs border border-border bg-background px-2 py-1 font-mono-code text-xs text-text"
              >
                <option value={80}>80 BPM</option>
                <option value={100}>100 BPM</option>
                <option value={120}>120 BPM</option>
              </select>
            </div>

            <div className="rounded-xs border border-border bg-background p-2.5 font-mono-code text-xs">
              <span className="text-text-muted">Codec Classification: </span>
              <span className="text-emerald-400 font-bold">{codecProfile}</span>
            </div>
          </div>

          {/* Visual Flasher Box */}
          <div
            className={`flex flex-col items-center justify-center rounded-xs border-2 h-32 transition-all duration-75 ${
              flashActive
                ? "border-[#ff6a00] bg-[#ff6a00] text-white scale-[1.03] shadow-lg"
                : "border-border bg-background text-text-muted"
            }`}
          >
            <span className="font-heading text-sm font-bold uppercase tracking-widest">
              {flashActive ? "⚡ CLICK SYNC ⚡" : "VISUAL TARGET"}
            </span>
            <span className="font-mono-code text-[11px] mt-1 opacity-80">
              Slide until flash = heard click
            </span>
          </div>
        </div>
      </div>

      {/* Section C: 165Hz Speaker Water-Eject & Dust Clearing Generator */}
      <div className="rounded-xs border border-border bg-surface p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-accent" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              C. 165Hz High-Amplitude Speaker Water-Eject &amp; Dust Clearing Tone
            </span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { f: 140, label: "140Hz Deep Bass Pulse" },
              { f: 165, label: "165Hz Apple Watch Water-Eject" },
              { f: 240, label: "240Hz Micro-Dust Sweep" },
            ].map((item) => (
              <button
                key={item.f}
                type="button"
                onClick={() => {
                  setWaterEjectFreq(item.f);
                  if (waterEjectRunning && oscRef.current && audioCtxRef.current) {
                    oscRef.current.frequency.setValueAtTime(item.f, audioCtxRef.current.currentTime);
                  }
                }}
                className={`rounded-xs border px-2.5 py-1 font-mono-code text-[11px] cursor-pointer ${
                  waterEjectFreq === item.f
                    ? "border-accent bg-accent/15 text-accent font-bold"
                    : "border-border bg-background text-text-muted hover:text-text"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xs border border-border bg-background p-3">
          <div className="space-y-1">
            <div className="font-heading text-xs font-bold uppercase text-text">
              Acoustic Membrane Displacement Mode ({waterEjectFreq} Hz Sawtooth Wave)
            </div>
            <p className="text-xs text-text-muted">
              Turn device volume to 85–100% and face speaker grille downward to shake trapped water droplets free.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleWaterEject}
            className={`inline-flex items-center gap-2 rounded-xs px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer ${
              waterEjectRunning ? "bg-red-600 animate-pulse" : "bg-[#ff6a00] hover:opacity-90"
            }`}
          >
            <Droplets className="h-4 w-4" />
            {waterEjectRunning
              ? `Ejecting Water (${waterTimer}s)... Stop`
              : `Run ${waterEjectFreq}Hz Water Eject (15s)`}
          </button>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 15. TYPING SPEED (WPM) & KEYSTROKE DYNAMICS BIOMETRIC LAB
 * ========================================================================== */
const TYPING_PROMPTS = [
  "Zero-trust network architecture requires continuous verification of cryptographic identity and behavioral keystroke telemetry before granting privileged shell access.",
  "Modern hardware security modules isolate elliptic curve private keys inside tamper-resistant silicon enclaves to prevent side-channel power analysis attacks.",
  "Packet fragmentation occurs when an encapsulated WireGuard datagram exceeds the physical Ethernet maximum transmission unit along an intermediate router hop.",
];

interface KeystrokeMetric {
  char: string;
  dwellMs: number;
  flightMs: number;
}

const SAMPLE_KEYSTROKES: KeystrokeMetric[] = [
  { char: "Z", dwellMs: 92, flightMs: 110 },
  { char: "e", dwellMs: 78, flightMs: 64 },
  { char: "r", dwellMs: 81, flightMs: 58 },
  { char: "o", dwellMs: 85, flightMs: 95 },
  { char: "-", dwellMs: 104, flightMs: 132 },
  { char: "t", dwellMs: 74, flightMs: 61 },
  { char: "r", dwellMs: 79, flightMs: 54 },
  { char: "u", dwellMs: 88, flightMs: 72 },
  { char: "s", dwellMs: 83, flightMs: 68 },
  { char: "t", dwellMs: 76, flightMs: 89 },
  { char: " ", dwellMs: 65, flightMs: 115 },
  { char: "n", dwellMs: 84, flightMs: 77 },
  { char: "e", dwellMs: 79, flightMs: 63 },
  { char: "t", dwellMs: 82, flightMs: 71 },
  { char: "w", dwellMs: 91, flightMs: 84 },
  { char: "o", dwellMs: 86, flightMs: 69 },
  { char: "r", dwellMs: 77, flightMs: 62 },
  { char: "k", dwellMs: 94, flightMs: 105 },
];

function TypingWpmKeystrokeDynamicsLab({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [promptIdx, setPromptIdx] = useState(0);
  const targetText = TYPING_PROMPTS[promptIdx];

  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [keystrokes, setKeystrokes] = useState<KeystrokeMetric[]>(SAMPLE_KEYSTROKES);
  const [usingSampleData, setUsingSampleData] = useState(true);

  const keyDownTimesRef = useRef<Record<string, number>>({});
  const lastKeyUpTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startTime || typedText.length >= targetText.length) return;
    const id = window.setInterval(() => {
      setElapsedSec((performance.now() - startTime) / 1000);
    }, 100);
    return () => window.clearInterval(id);
  }, [startTime, typedText.length, targetText.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key.length !== 1 && e.key !== "Backspace") return;
    const now = performance.now();
    if (!startTime) {
      setStartTime(now);
    }
    if (usingSampleData) {
      setUsingSampleData(false);
      setKeystrokes([]);
    }
    if (!keyDownTimesRef.current[e.key]) {
      keyDownTimesRef.current[e.key] = now;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key.length !== 1) return;
    const now = performance.now();
    const downTime = keyDownTimesRef.current[e.key] || now - 80;
    delete keyDownTimesRef.current[e.key];

    const dwellMs = Math.max(15, Math.min(400, Math.round(now - downTime)));
    const flightMs =
      lastKeyUpTimeRef.current !== null
        ? Math.max(10, Math.min(600, Math.round(downTime - lastKeyUpTimeRef.current)))
        : 95;
    lastKeyUpTimeRef.current = now;

    setKeystrokes((prev) => [...prev.slice(-29), { char: e.key, dwellMs, flightMs }]);
  };

  const handleResetSession = (nextPromptIdx = promptIdx) => {
    setPromptIdx(nextPromptIdx);
    setTypedText("");
    setStartTime(null);
    setElapsedSec(0);
    setKeystrokes(SAMPLE_KEYSTROKES);
    setUsingSampleData(true);
    keyDownTimesRef.current = {};
    lastKeyUpTimeRef.current = null;
  };

  const stats = useMemo(() => {
    const activeChars = typedText.length;
    let correctChars = 0;
    for (let i = 0; i < activeChars; i++) {
      if (typedText[i] === targetText[i]) correctChars++;
    }
    const accuracy = activeChars > 0 ? (correctChars / activeChars) * 100 : 98.4;
    const minutes = elapsedSec > 0.5 ? elapsedSec / 60 : 18 / 60;
    const grossWpm = activeChars > 0 ? activeChars / 5 / minutes : 76.5;
    const netWpm = Math.max(0, grossWpm * (accuracy / 100));

    const avgDwell =
      keystrokes.length > 0
        ? keystrokes.reduce((acc, k) => acc + k.dwellMs, 0) / keystrokes.length
        : 82;
    const avgFlight =
      keystrokes.length > 0
        ? keystrokes.reduce((acc, k) => acc + k.flightMs, 0) / keystrokes.length
        : 78;

    // Standard deviation of flight time (rhythm consistency)
    const variance =
      keystrokes.length > 1
        ? keystrokes.reduce((acc, k) => acc + Math.pow(k.flightMs - avgFlight, 2), 0) /
          keystrokes.length
        : 320;
    const rhythmJitterMs = Math.sqrt(variance);

    const cadenceClass =
      rhythmJitterMs < 25
        ? "High Consistency (Algorithmic / Touch-Typist Cadence)"
        : rhythmJitterMs < 55
        ? "Natural Human Biometric Signature (Moderate Digraph Variance)"
        : "Irregular / Hunt-and-Peck Flight Variance";

    return {
      netWpm: Math.round(netWpm),
      grossWpm: Math.round(grossWpm),
      accuracy: accuracy.toFixed(1),
      avgDwell: Math.round(avgDwell),
      avgFlight: Math.round(avgFlight),
      rhythmJitterMs: Math.round(rhythmJitterMs),
      cadenceClass,
    };
  }, [typedText, targetText, elapsedSec, keystrokes]);

  useEffect(() => {
    setOutput(
      [
        `=== KEYSTROKE DYNAMICS BIOMETRIC TELEMETRY REPORT ===`,
        `Dataset Source         : ${usingSampleData ? "Baseline Sample Profile (Start typing to capture live)" : "Live User Keystroke Capture"}`,
        `Net Typing Speed (WPM) : ${stats.netWpm} WPM (Gross: ${stats.grossWpm} WPM)`,
        `Typing Accuracy        : ${stats.accuracy}%`,
        `Average Dwell Time     : ${stats.avgDwell} ms (Key Hold Duration)`,
        `Average Flight Time    : ${stats.avgFlight} ms (Inter-Key Latency)`,
        `Flight Jitter (StdDev) : ±${stats.rhythmJitterMs} ms`,
        `Biometric Verdict      : ${stats.cadenceClass}`,
        `Recent Digraph Timings : ${keystrokes
          .slice(-8)
          .map((k) => `'${k.char}'[D:${k.dwellMs}ms/F:${k.flightMs}ms]`)
          .join(" -> ")}`,
      ].join("\n")
    );
  }, [stats, keystrokes, usingSampleData, setOutput]);

  return (
    <div className="space-y-4">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">Net Speed</div>
          <div className="font-heading text-2xl font-bold text-accent mt-0.5">
            {stats.netWpm} <span className="text-xs font-normal text-text-muted">WPM</span>
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">Accuracy</div>
          <div className="font-heading text-2xl font-bold text-emerald-400 mt-0.5">
            {stats.accuracy}%
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            Avg Dwell Time
          </div>
          <div className="font-heading text-2xl font-bold text-text mt-0.5">
            {stats.avgDwell} <span className="text-xs font-normal text-text-muted">ms hold</span>
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            Avg Flight Time
          </div>
          <div className="font-heading text-2xl font-bold text-sky-400 mt-0.5">
            {stats.avgFlight} <span className="text-xs font-normal text-text-muted">ms gap</span>
          </div>
        </div>
      </div>

      {/* Prompt Display & Input */}
      <div className="rounded-xs border border-border bg-surface p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-accent" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Cybersecurity Typing Prompt (Type below to record live millisecond dynamics)
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleResetSession((promptIdx + 1) % TYPING_PROMPTS.length)}
            className="inline-flex items-center gap-1 rounded-xs border border-border bg-background px-2.5 py-1 font-mono-code text-xs text-text hover:border-accent cursor-pointer"
          >
            <RefreshCw className="h-3 w-3 text-accent" />
            Switch Prompt
          </button>
        </div>

        <div className="rounded-xs border border-border bg-background p-3.5 font-mono-code text-sm leading-relaxed select-none">
          {targetText.split("").map((char, idx) => {
            let colorClass = "text-text-muted";
            if (idx < typedText.length) {
              colorClass =
                typedText[idx] === char
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-red-400 bg-red-500/20 underline";
            } else if (idx === typedText.length) {
              colorClass = "bg-[#ff6a00]/30 text-text underline";
            }
            return (
              <span key={idx} className={colorClass}>
                {char}
              </span>
            );
          })}
        </div>

        <textarea
          rows={2}
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          placeholder="Click here and begin typing the prompt above to measure your Dwell & Flight keystroke biometrics..."
          className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-sm text-text focus:border-accent focus:outline-none"
        />
      </div>

      {/* Per-Keystroke Millisecond Timing Bar Chart */}
      <div className="rounded-xs border border-border bg-surface p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Biometric Keystroke Rhythm Graph (Dwell Time vs Flight Time in ms)
            </span>
          </div>
          <span className="font-mono-code text-[11px] text-text-muted">
            Jitter: ±{stats.rhythmJitterMs}ms • {stats.cadenceClass}
          </span>
        </div>

        <div className="flex items-end gap-1.5 h-36 pt-4 px-2 rounded-xs border border-border bg-background overflow-x-auto">
          {keystrokes.map((k, idx) => {
            const dwellHeight = Math.min(100, Math.round((k.dwellMs / 220) * 100));
            const flightHeight = Math.min(100, Math.round((k.flightMs / 220) * 100));
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-end h-full min-w-[26px] group"
                title={`Key '${k.char}': Dwell ${k.dwellMs}ms | Flight ${k.flightMs}ms`}
              >
                <div className="flex items-end gap-0.5 h-24 w-full justify-center">
                  <div
                    style={{ height: `${dwellHeight}%` }}
                    className="w-2.5 rounded-t-xs bg-[#ff6a00] transition-all"
                  />
                  <div
                    style={{ height: `${flightHeight}%` }}
                    className="w-2.5 rounded-t-xs bg-sky-400 transition-all"
                  />
                </div>
                <span className="mt-1 font-mono-code text-[11px] font-bold text-text">
                  {k.char === " " ? "␣" : k.char}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-code text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#ff6a00]" />
            Dwell Time (Key Hold ms)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-sky-400" />
            Flight Time (Key-to-Key Latency ms)
          </span>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 16. SRT / VTT SUBTITLE TIME-SHIFTER & CONVERTER
 * ========================================================================== */
const SAMPLE_SRT = `1
00:01:12,400 --> 00:01:15,150
[ominous synth music playing]
<i>We intercepted the telemetry beacon from Sector 7.</i>

2
00:01:15,600 --> 00:01:18,900
The encryption handshake is drifting by 2.5 seconds!

3
00:01:19,250 --> 00:01:22,800
(alarm blares)
Re-synchronize the subtitle timestamps before broadcast.`;

function parseSubtitleTimestampMs(raw: string): number {
  const cleaned = raw.trim().replace(",", ".");
  const parts = cleaned.split(":");
  if (parts.length === 3) {
    const h = Number(parts[0]) || 0;
    const m = Number(parts[1]) || 0;
    const s = parseFloat(parts[2]) || 0;
    return Math.round((h * 3600 + m * 60 + s) * 1000);
  }
  if (parts.length === 2) {
    const m = Number(parts[0]) || 0;
    const s = parseFloat(parts[1]) || 0;
    return Math.round((m * 60 + s) * 1000);
  }
  return 0;
}

function formatSubtitleTimestampMs(ms: number, format: "srt" | "vtt"): string {
  const clamped = Math.max(0, Math.round(ms));
  const hours = Math.floor(clamped / 3600000);
  const rem1 = clamped % 3600000;
  const minutes = Math.floor(rem1 / 60000);
  const rem2 = rem1 % 60000;
  const seconds = Math.floor(rem2 / 1000);
  const millis = rem2 % 1000;
  const sep = format === "srt" ? "," : ".";
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}${sep}${String(millis).padStart(3, "0")}`;
}

function SrtVttSubtitleTimeShifterConverter({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [rawInput, setRawInput] = useState(SAMPLE_SRT);
  const [shiftMs, setShiftMs] = useState(2500);
  const [fpsScaleMode, setFpsScaleMode] = useState<string>("1");
  const [stripTags, setStripTags] = useState(false);
  const [stripSdh, setStripSdh] = useState(false);
  const [targetFormat, setTargetFormat] = useState<"srt" | "vtt">("vtt");

  const processed = useMemo(() => {
    const fpsRatio = Number(fpsScaleMode) || 1;
    const normalized = rawInput.replace(/\r\n/g, "\n").replace(/^WEBVTT[^\n]*\n+/i, "").trim();
    const blocks = normalized.split(/\n\s*\n/);

    const cues: {
      index: number;
      oldStart: string;
      newStart: string;
      newEnd: string;
      text: string;
    }[] = [];

    blocks.forEach((block) => {
      const lines = block.split("\n").map((l) => l.trim());
      const timeLineIdx = lines.findIndex((l) => l.includes("-->"));
      if (timeLineIdx === -1) return;

      const timeLine = lines[timeLineIdx];
      const [startRaw, endRawWithSettings] = timeLine.split("-->");
      const endRaw = (endRawWithSettings || "").trim().split(/\s+/)[0];

      const startMs = parseSubtitleTimestampMs(startRaw);
      const endMs = parseSubtitleTimestampMs(endRaw);

      const shiftedStart = startMs * fpsRatio + shiftMs;
      const shiftedEnd = endMs * fpsRatio + shiftMs;

      let textLines = lines.slice(timeLineIdx + 1).join("\n");
      if (stripTags) {
        textLines = textLines.replace(/<\/?[^>]+(>|$)/g, "");
      }
      if (stripSdh) {
        textLines = textLines
          .replace(/\[[^\]]*\]/g, "")
          .replace(/\([^)]*\)/g, "")
          .replace(/^\s*\n/gm, "")
          .trim();
      }

      if (!textLines.trim()) return;

      cues.push({
        index: cues.length + 1,
        oldStart: formatSubtitleTimestampMs(startMs, "srt"),
        newStart: formatSubtitleTimestampMs(shiftedStart, targetFormat),
        newEnd: formatSubtitleTimestampMs(shiftedEnd, targetFormat),
        text: textLines.trim(),
      });
    });

    const formattedFile =
      targetFormat === "vtt"
        ? `WEBVTT\n\n` +
          cues
            .map((c) => `${c.index}\n${c.newStart} --> ${c.newEnd}\n${c.text}`)
            .join("\n\n")
        : cues
            .map((c) => `${c.index}\n${c.newStart} --> ${c.newEnd}\n${c.text}`)
            .join("\n\n");

    return { cues, formattedFile };
  }, [rawInput, shiftMs, fpsScaleMode, stripTags, stripSdh, targetFormat]);

  useEffect(() => {
    setOutput(processed.formattedFile);
  }, [processed.formattedFile, setOutput]);

  const handleDownloadFile = () => {
    const ext = targetFormat === "vtt" ? "vtt" : "srt";
    const mime = targetFormat === "vtt" ? "text/vtt;charset=utf-8" : "text/plain;charset=utf-8";
    const blob = new Blob([processed.formattedFile], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shifted-subtitles.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-surface p-3 space-y-2">
          <label className="block text-xs font-mono-code uppercase text-text-muted">
            Time Shift Offset (ms):{" "}
            <strong className="text-accent">
              {shiftMs >= 0 ? `+${shiftMs}ms` : `${shiftMs}ms`}
            </strong>
          </label>
          <input
            type="number"
            min={-60000}
            max={60000}
            step={50}
            value={shiftMs}
            onChange={(e) => setShiftMs(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-3 py-1.5 font-mono-code text-sm text-text"
          />
          <div className="flex flex-wrap gap-1.5">
            {[-2500, -1000, -250, 0, 250, 1000, 2500].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setShiftMs(val)}
                className="rounded-xs border border-border bg-background px-2 py-0.5 font-mono-code text-[11px] text-text hover:border-accent cursor-pointer"
              >
                {val >= 0 ? `+${val}` : val}ms
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3 space-y-2">
          <label className="block text-xs font-mono-code uppercase text-text-muted">
            Framerate Drift Scaling (FPS Ratio)
          </label>
          <select
            value={fpsScaleMode}
            onChange={(e) => setFpsScaleMode(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          >
            <option value="1">No FPS Scaling (1.00000×)</option>
            <option value="0.999">23.976 fps → 24.000 fps (×0.999)</option>
            <option value="0.95904">23.976 fps → 25.000 PAL (×0.95904)</option>
            <option value="1.042709">25.000 PAL → 23.976 fps (×1.04271)</option>
            <option value="0.96">24.000 fps → 25.000 PAL (×0.96000)</option>
          </select>
          <div className="flex items-center gap-3 pt-1">
            <label className="inline-flex items-center gap-1.5 text-xs font-mono-code text-text cursor-pointer">
              <input
                type="checkbox"
                checked={stripTags}
                onChange={(e) => setStripTags(e.target.checked)}
                className="accent-[#ff6a00]"
              />
              Strip &lt;i&gt; HTML
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs font-mono-code text-text cursor-pointer">
              <input
                type="checkbox"
                checked={stripSdh}
                onChange={(e) => setStripSdh(e.target.checked)}
                className="accent-[#ff6a00]"
              />
              Strip [SDH] cues
            </label>
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3 flex flex-col justify-between">
          <div>
            <label className="block text-xs font-mono-code uppercase text-text-muted mb-1.5">
              Output Subtitle Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["srt", "vtt"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setTargetFormat(fmt)}
                  className={`rounded-xs border py-1.5 font-heading text-xs font-bold uppercase cursor-pointer ${
                    targetFormat === fmt
                      ? "border-[#ff6a00] bg-[#ff6a00]/15 text-accent"
                      : "border-border bg-background text-text-muted"
                  }`}
                >
                  .{fmt.toUpperCase()} {fmt === "vtt" ? "(WEBVTT)" : "(SubRip)"}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadFile}
            className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-xs bg-[#ff6a00] px-3 py-2 font-heading text-xs font-bold uppercase text-white hover:opacity-90 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Download .{targetFormat.toUpperCase()} File ({processed.cues.length} cues)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase text-text">
              Input .SRT / .VTT Subtitles
            </span>
            <button
              type="button"
              onClick={() => setRawInput(SAMPLE_SRT)}
              className="text-xs font-mono-code text-accent hover:underline cursor-pointer"
            >
              Load Sample Movie Subtitle
            </button>
          </div>
          <textarea
            rows={9}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase text-text">
              Converted &amp; Time-Shifted Output (.{targetFormat.toUpperCase()})
            </span>
            <span className="font-mono-code text-[11px] text-emerald-400">
              {processed.cues.length} Valid Cues Parsed
            </span>
          </div>
          <textarea
            rows={9}
            readOnly
            value={processed.formattedFile}
            className="w-full rounded-xs border border-border bg-surface p-3 font-mono-code text-xs text-accent"
          />
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 17. PHOTO RGB HISTOGRAM ANALYZER & WEBP / JPEG COMPRESSOR
 * ========================================================================== */
interface HistogramStats {
  r: number[];
  g: number[];
  b: number[];
  luma: number[];
  avgBrightness: number;
  rmsContrast: number;
  dynamicRangeStops: number;
  width: number;
  height: number;
  originalBytes: number;
  compressedBytes: number;
  compressedUrl: string;
}

function PhotoRgbHistogramWebpCompressor({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [format, setFormat] = useState<"image/webp" | "image/jpeg">("image/webp");
  const [quality, setQuality] = useState<number>(80);
  const [presetScene, setPresetScene] = useState<"sunset" | "cyberpunk" | "highkey">("sunset");
  const [stats, setStats] = useState<HistogramStats | null>(null);

  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const analyzeAndCompressCanvas = useCallback(
    (canvas: HTMLCanvasElement, origSizeEstimate: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { width, height } = canvas;
      const imgData = ctx.getImageData(0, 0, width, height).data;

      const r = new Array(256).fill(0);
      const g = new Array(256).fill(0);
      const b = new Array(256).fill(0);
      const luma = new Array(256).fill(0);

      let sumLuma = 0;
      let minLuma = 255;
      let maxLuma = 0;
      const pixelCount = width * height;

      for (let i = 0; i < imgData.length; i += 4) {
        const rv = imgData[i];
        const gv = imgData[i + 1];
        const bv = imgData[i + 2];
        const y = Math.min(255, Math.max(0, Math.round(0.2126 * rv + 0.7152 * gv + 0.0722 * bv)));

        r[rv]++;
        g[gv]++;
        b[bv]++;
        luma[y]++;

        sumLuma += y;
        if (y < minLuma) minLuma = y;
        if (y > maxLuma) maxLuma = y;
      }

      const avgBrightness = sumLuma / pixelCount;
      let sumSqDiff = 0;
      for (let yVal = 0; yVal < 256; yVal++) {
        if (luma[yVal] > 0) {
          sumSqDiff += luma[yVal] * Math.pow(yVal - avgBrightness, 2);
        }
      }
      const rmsContrast = Math.sqrt(sumSqDiff / pixelCount);
      const dynamicRangeStops = Math.log2((maxLuma + 1) / Math.max(1, minLuma + 1));

      const dataUrl = canvas.toDataURL(format, quality / 100);
      const base64Length = dataUrl.split(",")[1]?.length || 0;
      const compressedBytes = Math.round((base64Length * 3) / 4);

      setStats({
        r,
        g,
        b,
        luma,
        avgBrightness,
        rmsContrast,
        dynamicRangeStops,
        width,
        height,
        originalBytes: origSizeEstimate,
        compressedBytes,
        compressedUrl: dataUrl,
      });
    },
    [format, quality]
  );

  const renderSampleScene = useCallback(
    (scene: "sunset" | "cyberpunk" | "highkey") => {
      setPresetScene(scene);
      const canvas = sourceCanvasRef.current;
      if (!canvas) return;
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const grad = ctx.createLinearGradient(0, 0, 640, 360);
      if (scene === "sunset") {
        grad.addColorStop(0, "#1a0b2e");
        grad.addColorStop(0.45, "#b52b65");
        grad.addColorStop(0.75, "#ff6a00");
        grad.addColorStop(1, "#ffd166");
      } else if (scene === "cyberpunk") {
        grad.addColorStop(0, "#050816");
        grad.addColorStop(0.5, "#0f3460");
        grad.addColorStop(0.8, "#e94560");
        grad.addColorStop(1, "#00f5d4");
      } else {
        grad.addColorStop(0, "#dbeafe");
        grad.addColorStop(0.5, "#f8fafc");
        grad.addColorStop(1, "#fde68a");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 360);

      // Sun / geometric spheres for tonal richness
      ctx.fillStyle = scene === "cyberpunk" ? "#00f5d4" : "#ffffff";
      ctx.beginPath();
      ctx.arc(320, 150, 58, 0, Math.PI * 2);
      ctx.fill();

      // Mountain silhouette
      ctx.fillStyle = scene === "highkey" ? "#64748b" : "#0b0914";
      ctx.beginPath();
      ctx.moveTo(0, 360);
      ctx.lineTo(140, 210);
      ctx.lineTo(290, 290);
      ctx.lineTo(460, 185);
      ctx.lineTo(640, 310);
      ctx.lineTo(640, 360);
      ctx.closePath();
      ctx.fill();

      // Uncompressed 24-bit RGB baseline estimate
      analyzeAndCompressCanvas(canvas, 640 * 360 * 3);
    },
    [analyzeAndCompressCanvas]
  );

  useEffect(() => {
    renderSampleScene(presetScene);
  }, [renderSampleScene, presetScene]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = sourceCanvasRef.current;
        if (!canvas) return;
        const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        analyzeAndCompressCanvas(canvas, file.size);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!stats) return;
    const savingsPct = (
      (1 - stats.compressedBytes / Math.max(1, stats.originalBytes)) *
      100
    ).toFixed(1);
    setOutput(
      [
        `=== PHOTO RGB HISTOGRAM & WEBP/JPEG COMPRESSION REPORT ===`,
        `Dimensions             : ${stats.width} × ${stats.height} px`,
        `Average Luminance (Y)  : ${stats.avgBrightness.toFixed(1)} / 255 (${((stats.avgBrightness / 255) * 100).toFixed(1)}%)`,
        `RMS Tonal Contrast     : ${stats.rmsContrast.toFixed(1)}`,
        `Dynamic Range Estimate : ${stats.dynamicRangeStops.toFixed(2)} EV Stops`,
        `Target Encoder Format  : ${format} @ ${quality}% Quality`,
        `Baseline Size          : ${(stats.originalBytes / 1024).toFixed(1)} KB`,
        `Compressed Output Size : ${(stats.compressedBytes / 1024).toFixed(1)} KB (${savingsPct}% reduction)`,
      ].join("\n")
    );
  }, [stats, format, quality, setOutput]);

  const svgPaths = useMemo(() => {
    if (!stats) return null;
    const maxBin = Math.max(...stats.r, ...stats.g, ...stats.b, ...stats.luma, 1);
    const buildPath = (bins: number[]) =>
      `M 0 100 ` +
      bins
        .map((val, idx) => {
          const x = (idx / 255) * 256;
          const y = 100 - Math.min(100, Math.pow(val / maxBin, 0.45) * 96);
          return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ") +
      ` L 256 100 Z`;

    return {
      r: buildPath(stats.r),
      g: buildPath(stats.g),
      b: buildPath(stats.b),
      luma: buildPath(stats.luma),
    };
  }, [stats]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xs border border-border bg-surface p-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-3 py-1.5 font-heading text-xs font-bold uppercase text-white hover:opacity-90 cursor-pointer">
            <Upload className="h-3.5 w-3.5" />
            Upload Photo
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
          {(
            [
              { id: "sunset", label: "Sample Sunset" },
              { id: "cyberpunk", label: "Cyberpunk Neon" },
              { id: "highkey", label: "High-Key Studio" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => renderSampleScene(s.id)}
              className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs cursor-pointer ${
                presetScene === s.id
                  ? "border-accent bg-accent/15 text-accent font-bold"
                  : "border-border bg-background text-text-muted hover:text-text"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as "image/webp" | "image/jpeg")}
            className="rounded-xs border border-border bg-background px-2.5 py-1 font-mono-code text-xs text-text"
          >
            <option value="image/webp">WebP Encoder</option>
            <option value="image/jpeg">JPEG Encoder</option>
          </select>
          <div className="flex items-center gap-1.5 font-mono-code text-xs text-text">
            <span>Q:{quality}%</span>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-24 accent-[#ff6a00]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Canvas Preview */}
        <div className="rounded-xs border border-border bg-surface p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-code">
            <span className="font-bold text-text uppercase">Source &amp; Compressed Preview</span>
            {stats && (
              <span className="text-emerald-400 font-bold">
                {(stats.compressedBytes / 1024).toFixed(1)} KB (saved{" "}
                {((1 - stats.compressedBytes / Math.max(1, stats.originalBytes)) * 100).toFixed(0)}
                %)
              </span>
            )}
          </div>
          <canvas
            ref={sourceCanvasRef}
            className="w-full h-48 object-cover rounded-xs border border-border bg-background"
          />
          {stats && (
            <a
              href={stats.compressedUrl}
              download={`compressed-photo.${format === "image/webp" ? "webp" : "jpg"}`}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xs bg-[#ff6a00] px-3 py-2 font-heading text-xs font-bold uppercase text-white hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" />
              Download Compressed {format === "image/webp" ? ".WebP" : ".JPG"} (
              {(stats.compressedBytes / 1024).toFixed(1)} KB)
            </a>
          )}
        </div>

        {/* 256-Bin SVG RGB + Luminance Histogram */}
        <div className="rounded-xs border border-border bg-surface p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-code">
            <span className="font-bold text-text uppercase">256-Bin RGB &amp; Luma Histogram</span>
            <span className="text-text-muted">0 (Shadows) → 255 (Highlights)</span>
          </div>
          <div className="rounded-xs border border-border bg-background p-2">
            {svgPaths && (
              <svg viewBox="0 0 256 100" className="w-full h-40 overflow-visible">
                <path d={svgPaths.r} fill="rgba(239, 68, 68, 0.45)" stroke="#ef4444" strokeWidth="1" />
                <path d={svgPaths.g} fill="rgba(34, 197, 94, 0.45)" stroke="#22c55e" strokeWidth="1" />
                <path d={svgPaths.b} fill="rgba(59, 130, 246, 0.45)" stroke="#3b82f6" strokeWidth="1" />
                <path d={svgPaths.luma} fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="2 2" />
              </svg>
            )}
          </div>
          {stats && (
            <div className="grid grid-cols-3 gap-2 text-center font-mono-code text-xs pt-1">
              <div className="rounded-xs border border-border bg-background p-1.5">
                <div className="text-[10px] text-text-muted">Brightness</div>
                <div className="font-bold text-text">{stats.avgBrightness.toFixed(0)} / 255</div>
              </div>
              <div className="rounded-xs border border-border bg-background p-1.5">
                <div className="text-[10px] text-text-muted">RMS Contrast</div>
                <div className="font-bold text-accent">{stats.rmsContrast.toFixed(1)}</div>
              </div>
              <div className="rounded-xs border border-border bg-background p-1.5">
                <div className="text-[10px] text-text-muted">Dynamic Range</div>
                <div className="font-bold text-emerald-400">
                  {stats.dynamicRangeStops.toFixed(1)} EV
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 18. VIDEO BITRATE, 4K FILE SIZE & FFMPEG COMMAND BUILDER
 * ========================================================================== */
const RESOLUTIONS: Record<string, { label: string; w: number; h: number }> = {
  "720p": { label: "720p HD (1280×720)", w: 1280, h: 720 },
  "1080p": { label: "1080p FHD (1920×1080)", w: 1920, h: 1080 },
  "1440p": { label: "1440p QHD (2560×1440)", w: 2560, h: 1440 },
  "4k": { label: "4K UHD (3840×2160)", w: 3840, h: 2160 },
  "8k": { label: "8K UHD (7680×4320)", w: 7680, h: 4320 },
};

const CODECS: Record<
  string,
  { label: string; efficiency: number; ffCodec: string; hwCodec: string; defaultCrf: number }
> = {
  h264: {
    label: "H.264 / AVC (x264)",
    efficiency: 1.0,
    ffCodec: "libx264",
    hwCodec: "h264_nvenc",
    defaultCrf: 20,
  },
  h265: {
    label: "H.265 / HEVC (x265)",
    efficiency: 0.62,
    ffCodec: "libx265",
    hwCodec: "hevc_nvenc",
    defaultCrf: 24,
  },
  av1: {
    label: "AV1 (SVT-AV1)",
    efficiency: 0.48,
    ffCodec: "libsvtav1",
    hwCodec: "av1_nvenc",
    defaultCrf: 28,
  },
  prores: {
    label: "Apple ProRes 422 HQ",
    efficiency: 4.8,
    ffCodec: "prores_ks -profile:v 3",
    hwCodec: "prores_videotoolbox",
    defaultCrf: 10,
  },
};

function VideoBitrate4kFfmpegCommandBuilder({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [resKey, setResKey] = useState("4k");
  const [fps, setFps] = useState(60);
  const [codecKey, setCodecKey] = useState("h265");
  const [durationMin, setDurationMin] = useState(15);
  const [crf, setCrf] = useState(22);

  const calc = useMemo(() => {
    const res = RESOLUTIONS[resKey];
    const codec = CODECS[codecKey];
    // Bits per pixel per frame baseline ~0.075 for high quality H.264
    const crfFactor = Math.pow(2, (20 - crf) / 6);
    const rawMbps =
      ((res.w * res.h * fps * 0.065) / 1_000_000) * codec.efficiency * crfFactor;
    const videoMbps = Math.max(1.2, Math.min(800, rawMbps));
    const audioMbps = 0.32; // 320 kbps AAC/Opus
    const totalMbps = videoMbps + audioMbps;
    const durationSec = durationMin * 60;
    const totalMegabytes = (totalMbps * durationSec) / 8;
    const totalGigabytes = totalMegabytes / 1024;

    const commands = [
      {
        title: "1. Constant Rate Factor (CRF) High-Efficiency Encode",
        cmd: `ffmpeg -i input.mp4 -vf "scale=${res.w}:${res.h}" -r ${fps} -c:v ${codec.ffCodec} -crf ${crf} -preset slow -c:a aac -b:a 320k output_${resKey}.mp4`,
      },
      {
        title: "2. Hardware-Accelerated GPU Encode (NVIDIA NVENC / Apple Silicon)",
        cmd: `ffmpeg -hwaccel auto -i input.mp4 -c:v ${codec.hwCodec} -b:v ${videoMbps.toFixed(1)}M -maxrate ${(videoMbps * 1.25).toFixed(1)}M -bufsize ${(videoMbps * 2).toFixed(1)}M -c:a copy output_hw.mp4`,
      },
      {
        title: "3. Instant Lossless Keyframe Cut / Trim (Zero Re-encoding)",
        cmd: `ffmpeg -ss 00:01:30 -to 00:04:45 -i input.mp4 -c copy -avoid_negative_ts make_zero trimmed_lossless.mp4`,
      },
      {
        title: "4. 4K Lanczos Upscale + Unsharp Mask + Audio Strip",
        cmd: `ffmpeg -i input.mp4 -vf "scale=3840:2160:flags=lanczos,unsharp=5:5:0.8:3:3:0.4" -c:v ${codec.ffCodec} -crf ${crf} -an output_upscaled_muted.mp4`,
      },
    ];

    return {
      res,
      codec,
      videoMbps,
      totalMbps,
      totalMegabytes,
      totalGigabytes,
      commands,
    };
  }, [resKey, fps, codecKey, durationMin, crf]);

  useEffect(() => {
    setOutput(
      [
        `=== VIDEO BITRATE, 4K STORAGE & FFMPEG PIPELINE ===`,
        `Resolution / Frame Rate : ${calc.res.label} @ ${fps} fps`,
        `Video Codec             : ${calc.codec.label} (CRF ${crf})`,
        `Recommended Bitrate     : ${calc.videoMbps.toFixed(2)} Mbps Video + 320 kbps Audio`,
        `Estimated File Size     : ${calc.totalGigabytes.toFixed(2)} GB (${calc.totalMegabytes.toFixed(0)} MB) for ${durationMin} mins`,
        ``,
        ...calc.commands.map((c) => `# ${c.title}\n${c.cmd}\n`),
      ].join("\n")
    );
  }, [calc, fps, crf, durationMin, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            Resolution
          </label>
          <select
            value={resKey}
            onChange={(e) => setResKey(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          >
            {Object.entries(RESOLUTIONS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            Frame Rate (FPS)
          </label>
          <select
            value={fps}
            onChange={(e) => setFps(Number(e.target.value))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          >
            {[24, 30, 60, 120].map((f) => (
              <option key={f} value={f}>
                {f} FPS
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            Codec
          </label>
          <select
            value={codecKey}
            onChange={(e) => setCodecKey(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          >
            {Object.entries(CODECS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            Duration (Mins)
          </label>
          <input
            type="number"
            min={1}
            max={600}
            value={durationMin}
            onChange={(e) => setDurationMin(Math.max(1, Number(e.target.value) || 1))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            Quality (CRF {crf})
          </label>
          <input
            type="range"
            min={14}
            max={32}
            value={crf}
            onChange={(e) => setCrf(Number(e.target.value))}
            className="w-full accent-[#ff6a00] mt-2"
          />
        </div>
      </div>

      {/* Bitrate & File Size KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            Recommended Video Bitrate
          </div>
          <div className="font-heading text-2xl font-bold text-accent mt-0.5">
            {calc.videoMbps.toFixed(1)} <span className="text-xs font-normal">Mbps</span>
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            Total File Size ({durationMin} min)
          </div>
          <div className="font-heading text-2xl font-bold text-emerald-400 mt-0.5">
            {calc.totalGigabytes.toFixed(2)} <span className="text-xs font-normal">GB</span>{" "}
            <span className="text-xs font-mono-code text-text-muted">
              ({calc.totalMegabytes.toFixed(0)} MB)
            </span>
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            Data Rate per Minute
          </div>
          <div className="font-heading text-2xl font-bold text-text mt-0.5">
            {(calc.totalMegabytes / durationMin).toFixed(1)}{" "}
            <span className="text-xs font-normal text-text-muted">MB/min</span>
          </div>
        </div>
      </div>

      {/* Generated FFmpeg Commands */}
      <div className="rounded-xs border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-accent" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Copy-Ready FFmpeg Production CLI Commands
          </span>
        </div>
        <div className="space-y-2.5">
          {calc.commands.map((c) => (
            <div
              key={c.title}
              className="rounded-xs border border-border bg-background p-2.5 space-y-1"
            >
              <div className="text-[11px] font-heading font-bold uppercase text-text-muted">
                {c.title}
              </div>
              <pre className="font-mono-code text-xs text-accent overflow-x-auto whitespace-pre-wrap">
                {c.cmd}
              </pre>
            </div>
          ))}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 19. RSS / ATOM / JSON FEED PARSER & EMBED WIDGET PREVIEWER
 * ========================================================================== */
const SAMPLE_ZEROS_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ZerosUniverse Engineering &amp; Security Lab</title>
    <link>https://zerosuniverse.com</link>
    <description>Deep-dive tutorials on Post-Quantum Cryptography, WebAssembly, and Linux Kernel Tuning.</description>
    <item>
      <title>Auditing Post-Quantum ML-KEM-768 Handshakes in Cloudflare Workers</title>
      <link>https://zerosuniverse.com/post-quantum-ml-kem-768/</link>
      <pubDate>Mon, 28 Sep 2026 06:30:00 GMT</pubDate>
      <description>How hybrid X25519Kyber768 protects TLS 1.3 session keys against harvest-now-decrypt-later quantum adversaries.</description>
    </item>
    <item>
      <title>Zero-Cost Bot Blocking &amp; FastCGI Microcaching on 1GB ARM64 Instances</title>
      <link>https://zerosuniverse.com/nginx-fastcgi-microcaching/</link>
      <pubDate>Fri, 25 Sep 2026 14:15:00 GMT</pubDate>
      <description>Eliminating PHP-FPM worker exhaustion under 10,000 req/sec DDoS spikes with RAM-buffered Nginx microcaches.</description>
    </item>
    <item>
      <title>Decoding NEC Infrared Pulses &amp; Flipper Zero Sub-GHz Captures</title>
      <link>https://zerosuniverse.com/nec-infrared-pronto-hex/</link>
      <pubDate>Tue, 22 Sep 2026 09:00:00 GMT</pubDate>
      <description>A complete hardware logic analyzer guide to 38kHz carrier modulation and pulse-distance encoding.</description>
    </item>
  </channel>
</rss>`;

const SAMPLE_JSON_FEED = JSON.stringify(
  {
    version: "https://jsonfeed.org/version/1.1",
    title: "ZerosUniverse JSON Feed 1.1",
    home_page_url: "https://zerosuniverse.com",
    description: "Syndicated JSON Feed 1.1 specification stream.",
    items: [
      {
        id: "101",
        title: "Browser WebGPU Compute Shaders vs Native Vulkan Benchmarks",
        url: "https://zerosuniverse.com/webgpu-benchmarks/",
        date_published: "2026-09-27T11:20:00Z",
        summary: "Running 4-bit quantized LLMs directly inside Chrome WebGPU pipelines.",
      },
      {
        id: "102",
        title: "Understanding TCP Bandwidth-Delay Product on High-Latency Links",
        url: "https://zerosuniverse.com/tcp-bdp-tuning/",
        date_published: "2026-09-24T16:45:00Z",
        summary: "Why default 64KB TCP receive windows throttle gigabit fiber transoceanic transfers.",
      },
    ],
  },
  null,
  2
);

function RssAtomJsonFeedWidgetPreviewer({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [rawFeed, setRawFeed] = useState(SAMPLE_ZEROS_RSS);
  const [widgetTheme, setWidgetTheme] = useState<"dark" | "light">("dark");

  const parsed = useMemo(() => {
    const trimmed = rawFeed.trim();
    if (trimmed.startsWith("{")) {
      try {
        const jf = JSON.parse(trimmed);
        const items: { title: string; link: string; date: string; summary: string }[] =
          Array.isArray(jf.items)
            ? jf.items.map((it: Record<string, string>) => ({
                title: it.title || "Untitled Entry",
                link: it.url || it.external_url || "#",
                date: it.date_published || "Recent",
                summary: it.summary || it.content_text || "",
              }))
            : [];
        return {
          valid: true,
          format: "JSON Feed 1.1",
          channelTitle: jf.title || "Untitled JSON Feed",
          channelLink: jf.home_page_url || "https://zerosuniverse.com",
          channelDesc: jf.description || "",
          items,
        };
      } catch {
        // fallback to XML regex
      }
    }

    const isAtom = /<feed[\s>]/i.test(trimmed);
    const extractTag = (src: string, tag: string) => {
      const m = src.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").trim() : "";
    };

    const channelTitle = extractTag(trimmed, "title") || "Syndicated Feed";
    const channelDesc = extractTag(trimmed, "description") || extractTag(trimmed, "subtitle");
    const channelLink = extractTag(trimmed, "link") || "https://zerosuniverse.com";

    const itemRegex = isAtom ? /<entry[\s\S]*?<\/entry>/gi : /<item[\s\S]*?<\/item>/gi;
    const matches = trimmed.match(itemRegex) || [];
    const items = matches.map((block) => ({
      title: extractTag(block, "title") || "Untitled Item",
      link: extractTag(block, "link") || "https://zerosuniverse.com",
      date: extractTag(block, "pubDate") || extractTag(block, "updated") || "Published",
      summary: extractTag(block, "description") || extractTag(block, "summary"),
    }));

    return {
      valid: items.length > 0,
      format: isAtom ? "Atom 1.0 XML" : "RSS 2.0 XML",
      channelTitle,
      channelLink,
      channelDesc,
      items,
    };
  }, [rawFeed]);

  const embedSnippet = useMemo(() => {
    return `<!-- ZerosUniverse Vanilla JS RSS Card Widget -->
<div id="zu-rss-widget" data-theme="${widgetTheme}" style="font-family:system-ui,sans-serif;max-width:540px;border:1px solid #2a2a2a;padding:16px;background:${widgetTheme === "dark" ? "#111318" : "#ffffff"};color:${widgetTheme === "dark" ? "#f8fafc" : "#0f172a"}">
  <h3 style="margin:0 0 8px;color:#ff6a00">${parsed.channelTitle}</h3>
  ${parsed.items
    .slice(0, 3)
    .map(
      (it) =>
        `<div style="padding:8px 0;border-top:1px solid #2a2a2a"><a href="${it.link}" target="_blank" rel="noopener" style="font-weight:700;color:inherit;text-decoration:none">${it.title}</a><div style="font-size:12px;opacity:0.75;margin-top:2px">${it.date}</div></div>`
    )
    .join("\n  ")}
</div>`;
  }, [parsed, widgetTheme]);

  useEffect(() => {
    setOutput(
      [
        `=== RSS / ATOM / JSON FEED VALIDATION & EMBED CODE ===`,
        `Detected Specification : ${parsed.format} (${parsed.valid ? "VALID" : "NO ITEMS FOUND"})`,
        `Channel Title          : ${parsed.channelTitle}`,
        `Parsed Entries         : ${parsed.items.length}`,
        ``,
        `--- COPY-READY HTML WIDGET EMBED ---`,
        embedSnippet,
      ].join("\n")
    );
  }, [parsed, embedSnippet, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRawFeed(SAMPLE_ZEROS_RSS)}
            className="rounded-xs bg-[#ff6a00] px-3 py-1.5 font-heading text-xs font-bold uppercase text-white hover:opacity-90 cursor-pointer"
          >
            Load ZerosUniverse Sample RSS Feed
          </button>
          <button
            type="button"
            onClick={() => setRawFeed(SAMPLE_JSON_FEED)}
            className="rounded-xs border border-border bg-background px-3 py-1.5 font-mono-code text-xs text-text hover:border-accent cursor-pointer"
          >
            Load JSON Feed 1.1 Sample
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-code text-text-muted">Widget Theme:</span>
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setWidgetTheme(t)}
              className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs uppercase cursor-pointer ${
                widgetTheme === t
                  ? "border-accent bg-accent/15 text-accent font-bold"
                  : "border-border bg-background text-text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono-code">
            <span className="font-bold uppercase text-text">Raw XML / JSON Feed Payload</span>
            <span className="text-emerald-400 font-bold">
              {parsed.format} • {parsed.items.length} items
            </span>
          </div>
          <textarea
            rows={11}
            value={rawFeed}
            onChange={(e) => setRawFeed(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text"
          />
        </div>

        {/* Live Embeddable Card Widget Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono-code">
            <span className="font-bold uppercase text-text">Live Embeddable Widget Preview</span>
            <span className="text-text-muted">Zero-Dependency Card</span>
          </div>
          <div
            className={`rounded-xs border p-4 space-y-3 ${
              widgetTheme === "dark"
                ? "border-border bg-[#0f131a] text-white"
                : "border-slate-300 bg-white text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between border-b border-current/15 pb-2">
              <div>
                <div className="font-heading text-sm font-bold text-[#ff6a00]">
                  {parsed.channelTitle}
                </div>
                <div className="text-[11px] opacity-75">{parsed.channelDesc}</div>
              </div>
              <Rss className="h-4 w-4 text-[#ff6a00] shrink-0" />
            </div>

            <div className="divide-y divide-current/10 space-y-2.5">
              {parsed.items.slice(0, 3).map((item, i) => (
                <div key={i} className="pt-2 first:pt-0">
                  <div className="font-heading text-xs font-bold hover:text-[#ff6a00] transition">
                    {item.title}
                  </div>
                  <p className="text-[11px] opacity-80 line-clamp-2 mt-0.5">{item.summary}</p>
                  <span className="block font-mono-code text-[10px] opacity-60 mt-1">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 20. IR BLASTER NEC & PRONTO HEX REMOTE SIGNAL DECODER
 * ========================================================================== */
const IR_PRESETS = [
  { label: "LG Smart TV Power (0x04 / 0x08)", addr: "04", cmd: "08", freqHex: "006D" },
  { label: "Samsung TV Power (0x07 / 0x02)", addr: "07", cmd: "02", freqHex: "006D" },
  { label: "Xiaomi Mi Box Home (0x01 / 0x1A)", addr: "01", cmd: "1A", freqHex: "006D" },
  { label: "Sony Bravia Mute (0x10 / 0x14)", addr: "10", cmd: "14", freqHex: "0067" },
];

function byteToLsbBits(byteVal: number): number[] {
  const bits: number[] = [];
  for (let i = 0; i < 8; i++) {
    bits.push((byteVal >> i) & 1);
  }
  return bits;
}

function IrBlasterNecProntoHexDecoder({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [addrHex, setAddrHex] = useState("04");
  const [cmdHex, setCmdHex] = useState("08");
  const [prontoFreqWord, setProntoFreqWord] = useState("006D");

  const decoded = useMemo(() => {
    const addr = parseInt(addrHex, 16) & 0xff || 0;
    const addrInv = ~addr & 0xff;
    const cmd = parseInt(cmdHex, 16) & 0xff || 0;
    const cmdInv = ~cmd & 0xff;

    const freqCode = parseInt(prontoFreqWord, 16) || 0x006d;
    const carrierKhz = 1000000 / (freqCode * 0.241246) / 1000;

    const bits = [
      ...byteToLsbBits(addr),
      ...byteToLsbBits(addrInv),
      ...byteToLsbBits(cmd),
      ...byteToLsbBits(cmdInv),
    ];

    // Build Pronto Hex string (0000 = raw learned, freqWord, 0022 = 34 burst pairs)
    const pairs: string[] = ["0157 00AC"]; // 9ms leading burst + 4.5ms space
    bits.forEach((b) => {
      pairs.push(b === 1 ? "0015 0041" : "0015 0015");
    });
    pairs.push("0015 0689"); // Stop bit + trailing gap
    const prontoHex = `0000 ${prontoFreqWord.toUpperCase().padStart(4, "0")} 0022 0000 ${pairs.join(" ")}`;

    // Build SVG Logic Analyzer Waveform Path
    let x = 0;
    let path = `M 0 45 `;
    // 9ms AGC Mark + 4.5ms Space
    path += `L ${x} 10 L ${x + 28} 10 L ${x + 28} 45 L ${x + 42} 45 `;
    x += 42;
    bits.forEach((b) => {
      const spaceW = b === 1 ? 8 : 3.5;
      path += `L ${x} 10 L ${x + 3} 10 L ${x + 3} 45 L ${x + 3 + spaceW} 45 `;
      x += 3 + spaceW;
    });
    path += `L ${x} 10 L ${x + 3} 10 L ${x + 3} 45 L ${x + 15} 45`;

    const flipperIr = [
      `Filetype: IR signals file`,
      `Version: 1`,
      `# Generated by ZerosUniverse NEC IR Analyzer`,
      `name: Power_Toggle`,
      `type: parsed`,
      `protocol: NEC`,
      `address: ${addr.toString(16).toUpperCase().padStart(2, "0")} 00 00 00`,
      `command: ${cmd.toString(16).toUpperCase().padStart(2, "0")} 00 00 00`,
    ].join("\n");

    const arduinoCode = `IrSender.sendNEC(0x${addr.toString(16).toUpperCase().padStart(2, "0")}, 0x${cmd.toString(16).toUpperCase().padStart(2, "0")}, 0); // 38kHz NEC Frame`;

    return {
      addr,
      addrInv,
      cmd,
      cmdInv,
      carrierKhz,
      bits,
      prontoHex,
      svgPath: path,
      totalWidth: Math.ceil(x + 16),
      flipperIr,
      arduinoCode,
    };
  }, [addrHex, cmdHex, prontoFreqWord]);

  useEffect(() => {
    setOutput(
      [
        `=== NEC INFRARED & PRONTO HEX SIGNAL DECODER ===`,
        `Carrier Frequency   : ${decoded.carrierKhz.toFixed(2)} kHz (Pronto Divider: 0x${prontoFreqWord})`,
        `NEC Address Byte    : 0x${decoded.addr.toString(16).toUpperCase().padStart(2, "0")} (Inverse: 0x${decoded.addrInv.toString(16).toUpperCase().padStart(2, "0")})`,
        `NEC Command Byte    : 0x${decoded.cmd.toString(16).toUpperCase().padStart(2, "0")} (Inverse: 0x${decoded.cmdInv.toString(16).toUpperCase().padStart(2, "0")})`,
        `32-Bit LSB Bitstream: ${decoded.bits.join("")}`,
        ``,
        `--- PRONTO HEX CCF STRING ---`,
        decoded.prontoHex,
        ``,
        `--- FLIPPER ZERO (.ir) EXPORT ---`,
        decoded.flipperIr,
        ``,
        `--- ARDUINO IRREMOTE SNIPPET ---`,
        decoded.arduinoCode,
      ].join("\n")
    );
  }, [decoded, prontoFreqWord, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono-code uppercase text-text-muted">Remote Presets:</span>
        {IR_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setAddrHex(p.addr);
              setCmdHex(p.cmd);
              setProntoFreqWord(p.freqHex);
            }}
            className="rounded-xs border border-border bg-background px-2.5 py-1 font-mono-code text-xs text-text hover:border-accent cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-mono-code uppercase text-text-muted mb-1">
            NEC Address Byte (Hex)
          </label>
          <input
            type="text"
            maxLength={2}
            value={addrHex}
            onChange={(e) => setAddrHex(e.target.value.replace(/[^0-9a-fA-F]/g, ""))}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text uppercase"
          />
        </div>
        <div>
          <label className="block text-xs font-mono-code uppercase text-text-muted mb-1">
            NEC Command Byte (Hex)
          </label>
          <input
            type="text"
            maxLength={2}
            value={cmdHex}
            onChange={(e) => setCmdHex(e.target.value.replace(/[^0-9a-fA-F]/g, ""))}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text uppercase"
          />
        </div>
        <div>
          <label className="block text-xs font-mono-code uppercase text-text-muted mb-1">
            Pronto Frequency Word:{" "}
            <strong className="text-accent">{decoded.carrierKhz.toFixed(1)} kHz</strong>
          </label>
          <select
            value={prontoFreqWord}
            onChange={(e) => setProntoFreqWord(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text"
          >
            <option value="006D">006D (38.0 kHz Standard NEC)</option>
            <option value="0073">0073 (36.0 kHz Philips RC5)</option>
            <option value="0067">0067 (40.2 kHz Sony SIRC)</option>
            <option value="0048">0048 (57.6 kHz High-Speed IR)</option>
          </select>
        </div>
      </div>

      {/* SVG Logic Analyzer Waveform */}
      <div className="rounded-xs border border-border bg-surface p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-code">
          <span className="font-bold uppercase text-text">
            Infrared Pulse-Distance Logic Analyzer Waveform (9ms AGC + 4.5ms Space + 32-Bit Frame)
          </span>
          <span className="text-accent">
            0x{decoded.addr.toString(16).toUpperCase().padStart(2, "0")} • ~0x
            {decoded.addrInv.toString(16).toUpperCase().padStart(2, "0")} • 0x
            {decoded.cmd.toString(16).toUpperCase().padStart(2, "0")} • ~0x
            {decoded.cmdInv.toString(16).toUpperCase().padStart(2, "0")}
          </span>
        </div>
        <div className="rounded-xs border border-border bg-background p-3 overflow-x-auto">
          <svg
            viewBox={`0 0 ${decoded.totalWidth} 55`}
            className="w-full h-20 min-w-[520px]"
            preserveAspectRatio="none"
          >
            <path
              d={decoded.svgPath}
              fill="none"
              stroke="#ff6a00"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xs border border-border bg-surface p-3 space-y-1">
          <div className="text-xs font-heading font-bold uppercase text-text">
            Flipper Zero (.ir) &amp; Arduino Output
          </div>
          <pre className="font-mono-code text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">
            {decoded.flipperIr}
          </pre>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3 space-y-1">
          <div className="text-xs font-heading font-bold uppercase text-text">
            Pronto Hex Raw CCF String
          </div>
          <textarea
            rows={5}
            readOnly
            value={decoded.prontoHex}
            className="w-full rounded-xs border border-border bg-background p-2 font-mono-code text-[11px] text-accent"
          />
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 21. POWER BANK (MAH TO WH) REAL CAPACITY & AIRLINE FLIGHT LIMIT CALCULATOR
 * ========================================================================== */
function PowerBankMahWhFlightLimitCalculator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [ratedMah, setRatedMah] = useState(20000);
  const [cellVoltage, setCellVoltage] = useState(3.7);
  const [pdVoltage, setPdVoltage] = useState(5);
  const [efficiencyPct, setEfficiencyPct] = useState(85);
  const [deviceWh, setDeviceWh] = useState(19.25); // ~5000mAh @ 3.85V smartphone

  const result = useMemo(() => {
    const nominalWh = (ratedMah * cellVoltage) / 1000;
    const usableWh = nominalWh * (efficiencyPct / 100);
    const realOutputMah = (usableWh * 1000) / pdVoltage;
    const fullCharges = usableWh / Math.max(1, deviceWh);

    let flightVerdict = {
      status: "APPROVED FOR CABIN CARRY-ON (≤ 100 Wh)",
      color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
      detail:
        "Cleared by FAA, TSA, EASA, and DGCA without airline notification (up to 20 spare units in carry-on baggage; strictly forbidden in checked luggage).",
    };
    if (nominalWh > 160) {
      flightVerdict = {
        status: "PROHIBITED ON PASSENGER AIRCRAFT (> 160 Wh)",
        color: "text-red-400 border-red-500/40 bg-red-500/10",
        detail:
          "Exceeds the 160 Wh international aviation ceiling. Banned from both carry-on and checked passenger baggage (must ship as Class 9 Dangerous Goods cargo).",
      };
    } else if (nominalWh > 100) {
      flightVerdict = {
        status: "AIRLINE APPROVAL REQUIRED (100.1 – 160 Wh)",
        color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
        detail:
          "Permitted in carry-on baggage ONLY with explicit check-in desk approval (maximum 2 spare batteries per passenger).",
      };
    }

    return {
      nominalWh,
      usableWh,
      realOutputMah,
      fullCharges,
      flightVerdict,
    };
  }, [ratedMah, cellVoltage, pdVoltage, efficiencyPct, deviceWh]);

  useEffect(() => {
    setOutput(
      [
        `=== POWER BANK (mAh ↔ Wh) & FAA/TSA FLIGHT LIMIT REPORT ===`,
        `Rated Marketing Capacity : ${ratedMah.toLocaleString()} mAh @ ${cellVoltage}V Internal Cell`,
        `Nominal Energy Rating    : ${result.nominalWh.toFixed(2)} Wh`,
        `Usable Delivered Energy  : ${result.usableWh.toFixed(2)} Wh (${efficiencyPct}% DC-DC Boost Efficiency)`,
        `Real Output Capacity     : ${Math.round(result.realOutputMah).toLocaleString()} mAh @ ${pdVoltage}V USB-PD`,
        `Estimated Device Charges : ${result.fullCharges.toFixed(2)}× Full Charges (${deviceWh} Wh target battery)`,
        `Aviation Safety Verdict  : ${result.flightVerdict.status}`,
        `Regulation Guidance      : ${result.flightVerdict.detail}`,
      ].join("\n")
    );
  }, [ratedMah, cellVoltage, pdVoltage, efficiencyPct, deviceWh, result, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono-code uppercase text-text-muted">Quick Capacities:</span>
        {[
          { label: "10,000 mAh Slim", mah: 10000 },
          { label: "20,000 mAh Travel", mah: 20000 },
          { label: "27,000 mAh (99.9Wh Max Legal)", mah: 27000 },
          { label: "30,000 mAh (111Wh Airline Permit)", mah: 30000 },
          { label: "50,000 mAh Station (185Wh Banned)", mah: 50000 },
        ].map((p) => (
          <button
            key={p.mah}
            type="button"
            onClick={() => setRatedMah(p.mah)}
            className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs cursor-pointer ${
              ratedMah === p.mah
                ? "border-accent bg-accent/15 text-accent font-bold"
                : "border-border bg-background text-text-muted hover:text-text"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            Rated Capacity (mAh)
          </label>
          <input
            type="number"
            min={1000}
            max={200000}
            step={500}
            value={ratedMah}
            onChange={(e) => setRatedMah(Math.max(500, Number(e.target.value) || 0))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            Cell Chemistry (V)
          </label>
          <select
            value={cellVoltage}
            onChange={(e) => setCellVoltage(Number(e.target.value))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          >
            <option value={3.7}>3.7V (Standard Li-Po)</option>
            <option value={3.6}>3.6V (18650/21700 Li-Ion)</option>
            <option value={3.85}>3.85V (High-Voltage LiHV)</option>
            <option value={3.2}>3.2V (LiFePO4 Station)</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            USB-PD Output (V)
          </label>
          <select
            value={pdVoltage}
            onChange={(e) => setPdVoltage(Number(e.target.value))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          >
            <option value={5}>5V USB Standard</option>
            <option value={9}>9V Fast Charge PD</option>
            <option value={15}>15V Tablet/Switch PD</option>
            <option value={20}>20V Laptop USB-PD</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            Efficiency ({efficiencyPct}%)
          </label>
          <input
            type="number"
            min={65}
            max={98}
            value={efficiencyPct}
            onChange={(e) => setEfficiencyPct(Math.min(98, Math.max(60, Number(e.target.value) || 85)))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            Target Device
          </label>
          <select
            value={deviceWh}
            onChange={(e) => setDeviceWh(Number(e.target.value))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          >
            <option value={19.25}>5000mAh Android (19.3Wh)</option>
            <option value={13.0}>iPhone 16 Pro (13.0Wh)</option>
            <option value={52.6}>MacBook Air M3 (52.6Wh)</option>
            <option value={40.0}>Steam Deck OLED (50Wh)</option>
          </select>
        </div>
      </div>

      {/* Aviation Compliance Badge */}
      <div className={`rounded-xs border p-4 ${result.flightVerdict.color}`}>
        <div className="flex items-center gap-2 font-heading text-sm font-bold uppercase">
          <Plane className="h-4 w-4 shrink-0" />
          <span>{result.flightVerdict.status}</span>
        </div>
        <p className="font-mono-code text-xs mt-1 opacity-90">{result.flightVerdict.detail}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            TSA / FAA Energy Rating
          </div>
          <div className="font-heading text-2xl font-bold text-accent mt-0.5">
            {result.nominalWh.toFixed(1)} <span className="text-xs font-normal">Wh</span>
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            Real Output @ {pdVoltage}V
          </div>
          <div className="font-heading text-2xl font-bold text-text mt-0.5">
            {Math.round(result.realOutputMah).toLocaleString()}{" "}
            <span className="text-xs font-normal text-text-muted">mAh</span>
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            Net Usable Energy
          </div>
          <div className="font-heading text-2xl font-bold text-emerald-400 mt-0.5">
            {result.usableWh.toFixed(1)} <span className="text-xs font-normal">Wh</span>
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            Full Device Charges
          </div>
          <div className="font-heading text-2xl font-bold text-sky-400 mt-0.5">
            {result.fullCharges.toFixed(2)}×
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 22. A/B TESTING STATISTICAL SIGNIFICANCE & SAMPLE SIZE CALCULATOR
 * ========================================================================== */
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const prob =
    d *
    t *
    (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - prob : prob;
}

function AbTestingSignificanceSampleCalculator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [visitorsA, setVisitorsA] = useState(12500);
  const [convA, setConvA] = useState(425);
  const [visitorsB, setVisitorsB] = useState(12500);
  const [convB, setConvB] = useState(512);
  const [confidence, setConfidence] = useState<90 | 95 | 99>(95);
  const [mdePct, setMdePct] = useState(10);

  const stats = useMemo(() => {
    const nA = Math.max(1, visitorsA);
    const nB = Math.max(1, visitorsB);
    const cA = Math.min(nA, Math.max(0, convA));
    const cB = Math.min(nB, Math.max(0, convB));

    const crA = cA / nA;
    const crB = cB / nB;
    const absLift = crB - crA;
    const relLift = crA > 0 ? ((crB - crA) / crA) * 100 : 0;

    const pooledP = (cA + cB) / (nA + nB);
    const sePooled = Math.sqrt(pooledP * (1 - pooledP) * (1 / nA + 1 / nB));
    const zScore = sePooled > 0 ? (crB - crA) / sePooled : 0;
    const pValue = Math.max(0.00001, 2 * (1 - normalCdf(Math.abs(zScore))));

    const zCrit = confidence === 99 ? 2.576 : confidence === 95 ? 1.96 : 1.645;
    const alpha = 1 - confidence / 100;
    const isSignificant = pValue < alpha;

    const seUnpooled = Math.sqrt((crA * (1 - crA)) / nA + (crB * (1 - crB)) / nB);
    const ciLow = (absLift - zCrit * seUnpooled) * 100;
    const ciHigh = (absLift + zCrit * seUnpooled) * 100;

    // Required sample size per variation for 80% statistical power (Z_beta = 0.84)
    const mdeAbs = Math.max(0.0005, crA * (mdePct / 100));
    const zPower = 0.8416;
    const samplePerVariant = Math.ceil(
      (2 * Math.pow(zCrit + zPower, 2) * crA * (1 - crA)) / Math.pow(mdeAbs, 2)
    );

    return {
      crA: crA * 100,
      crB: crB * 100,
      absLift: absLift * 100,
      relLift,
      zScore,
      pValue,
      isSignificant,
      ciLow,
      ciHigh,
      samplePerVariant,
    };
  }, [visitorsA, convA, visitorsB, convB, confidence, mdePct]);

  useEffect(() => {
    setOutput(
      [
        `=== A/B TEST STATISTICAL SIGNIFICANCE & MDE REPORT ===`,
        `Control (Variant A)      : ${convA.toLocaleString()} / ${visitorsA.toLocaleString()} (${stats.crA.toFixed(2)}% CR)`,
        `Challenger (Variant B)   : ${convB.toLocaleString()} / ${visitorsB.toLocaleString()} (${stats.crB.toFixed(2)}% CR)`,
        `Relative Conversion Lift : ${stats.relLift >= 0 ? `+${stats.relLift.toFixed(2)}%` : `${stats.relLift.toFixed(2)}%`} (${stats.absLift >= 0 ? `+${stats.absLift.toFixed(2)}` : stats.absLift.toFixed(2)} pts)`,
        `Two-Tailed Z-Score       : ${stats.zScore.toFixed(3)}`,
        `Two-Tailed p-value       : ${stats.pValue.toFixed(5)}`,
        `${confidence}% Confidence Interval : [${stats.ciLow.toFixed(2)}%, ${stats.ciHigh.toFixed(2)}%]`,
        `Statistical Verdict      : ${stats.isSignificant ? `SIGNIFICANT WINNER AT ${confidence}% CONFIDENCE` : `INCONCLUSIVE / NOISE (p ≥ ${(1 - confidence / 100).toFixed(2)})`}`,
        `Required Sample Size     : ${stats.samplePerVariant.toLocaleString()} visitors/variant for ${mdePct}% MDE @ 80% Power`,
      ].join("\n")
    );
  }, [visitorsA, convA, visitorsB, convB, confidence, mdePct, stats, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xs border border-border bg-surface p-3 space-y-2">
          <div className="font-heading text-xs font-bold uppercase text-text">
            Variant A (Control Baseline)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono-code uppercase text-text-muted">
                Visitors A
              </label>
              <input
                type="number"
                value={visitorsA}
                onChange={(e) => setVisitorsA(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono-code uppercase text-text-muted">
                Conversions A
              </label>
              <input
                type="number"
                value={convA}
                onChange={(e) => setConvA(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
          </div>
          <div className="font-mono-code text-xs text-text-muted">
            Conversion Rate A: <strong className="text-text">{stats.crA.toFixed(2)}%</strong>
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3 space-y-2">
          <div className="font-heading text-xs font-bold uppercase text-accent">
            Variant B (Challenger)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono-code uppercase text-text-muted">
                Visitors B
              </label>
              <input
                type="number"
                value={visitorsB}
                onChange={(e) => setVisitorsB(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono-code uppercase text-text-muted">
                Conversions B
              </label>
              <input
                type="number"
                value={convB}
                onChange={(e) => setConvB(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
          </div>
          <div className="font-mono-code text-xs text-text-muted">
            Conversion Rate B: <strong className="text-accent">{stats.crB.toFixed(2)}%</strong>
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3 space-y-2">
          <div className="font-heading text-xs font-bold uppercase text-text">
            Hypothesis Parameters
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono-code uppercase text-text-muted">
                Confidence
              </label>
              <select
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value) as 90 | 95 | 99)}
                className="w-full rounded-xs border border-border bg-background px-2 py-1.5 font-mono-code text-xs text-text"
              >
                <option value={90}>90% (α=0.10)</option>
                <option value={95}>95% (α=0.05)</option>
                <option value={99}>99% (α=0.01)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono-code uppercase text-text-muted">
                Target MDE %
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={mdePct}
                onChange={(e) => setMdePct(Math.max(1, Number(e.target.value) || 5))}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
          </div>
          <div className="font-mono-code text-[11px] text-text-muted">
            Req. Sample/Var:{" "}
            <strong className="text-sky-400">{stats.samplePerVariant.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Statistical Verdict Banner */}
      <div
        className={`rounded-xs border p-4 flex flex-wrap items-center justify-between gap-3 ${
          stats.isSignificant
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            : "border-amber-500/40 bg-amber-500/10 text-amber-400"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {stats.isSignificant ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          )}
          <div>
            <div className="font-heading text-sm font-bold uppercase">
              {stats.isSignificant
                ? `Statistically Significant Result at ${confidence}% Confidence!`
                : `Not Yet Statistically Significant at ${confidence}% Confidence`}
            </div>
            <div className="font-mono-code text-xs opacity-90">
              Relative Lift: {stats.relLift >= 0 ? `+${stats.relLift.toFixed(2)}%` : `${stats.relLift.toFixed(2)}%`} • Z ={" "}
              {stats.zScore.toFixed(3)} • Two-Tailed p-value = {stats.pValue.toFixed(4)}
            </div>
          </div>
        </div>
        <div className="font-mono-code text-xs">
          {confidence}% CI: [{stats.ciLow.toFixed(2)}%, {stats.ciHigh.toFixed(2)}%]
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 23. NETWORK FILE DOWNLOAD TIME, TCP BDP & VPN MTU/MSS CALCULATOR
 * ========================================================================== */
const MTU_PROFILES = [
  { name: "Standard Ethernet (IEEE 802.3)", mtu: 1500, overhead: 40, notes: "Default LAN / Fiber ONT" },
  { name: "PPPoE DSL / Fiber (8-byte PPP)", mtu: 1492, overhead: 40, notes: "Avoids PPPoE packet drops" },
  { name: "WireGuard VPN (IPv4 UDP)", mtu: 1420, overhead: 40, notes: "60B WireGuard + UDP header" },
  { name: "OpenVPN (UDP Tun Mode)", mtu: 1400, overhead: 40, notes: "Safe tunnel encapsulation" },
  { name: "IPsec IKEv2 ESP Tunnel", mtu: 1360, overhead: 40, notes: "AES-GCM ESP + NAT-T" },
];

function NetworkDownloadMtuBdpCalculator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [fileSizeGb, setFileSizeGb] = useState(85);
  const [ispSpeedMbps, setIspSpeedMbps] = useState(500);
  const [rttMs, setRttMs] = useState(45);
  const [customMtu, setCustomMtu] = useState(1420);

  const calc = useMemo(() => {
    // TCP/IP + Ethernet framing efficiency (~94.9%)
    const goodputMbps = ispSpeedMbps * 0.949;
    const goodputMBps = goodputMbps / 8;
    const totalMB = fileSizeGb * 1024;
    const totalSeconds = totalMB / Math.max(0.01, goodputMBps);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60);

    // Bandwidth-Delay Product (BDP) = (bps * RTT_sec) / 8 bytes
    const bdpBytes = (ispSpeedMbps * 1_000_000 * (rttMs / 1000)) / 8;
    const bdpKilobytes = bdpBytes / 1024;
    const bdpMegabytes = bdpKilobytes / 1024;

    // Max throughput with legacy unscaled 64KB TCP window
    const unscaled64kMaxMbps = ((65535 * 8) / (Math.max(1, rttMs) / 1000)) / 1_000_000;
    const optimalRmemMax = Math.max(4194304, Math.pow(2, Math.ceil(Math.log2(bdpBytes * 2))));

    const ipv4Mss = customMtu - 40;
    const ipv6Mss = customMtu - 60;
    const pingPayload = customMtu - 28; // 20B IPv4 + 8B ICMP

    return {
      goodputMbps,
      goodputMBps,
      hours,
      minutes,
      seconds,
      bdpKilobytes,
      bdpMegabytes,
      unscaled64kMaxMbps,
      optimalRmemMax,
      ipv4Mss,
      ipv6Mss,
      pingPayload,
    };
  }, [fileSizeGb, ispSpeedMbps, rttMs, customMtu]);

  useEffect(() => {
    setOutput(
      [
        `=== NETWORK DOWNLOAD TIME, TCP BDP & VPN MTU/MSS REPORT ===`,
        `File Transfer Size      : ${fileSizeGb} GB over ${ispSpeedMbps} Mbps Link`,
        `Real TCP/IP Goodput     : ${calc.goodputMBps.toFixed(2)} MB/s (${calc.goodputMbps.toFixed(1)} Mbps after ~5.1% framing overhead)`,
        `Estimated Download Time : ${calc.hours}h ${calc.minutes}m ${calc.seconds}s`,
        ``,
        `--- TCP BANDWIDTH-DELAY PRODUCT (BDP @ ${rttMs}ms RTT) ---`,
        `Exact Link BDP          : ${calc.bdpMegabytes.toFixed(2)} MB (${Math.round(calc.bdpKilobytes).toLocaleString()} KB in-flight data)`,
        `Unscaled 64KB TCP Cap   : ${calc.unscaled64kMaxMbps.toFixed(1)} Mbps max without RFC 1323 Window Scaling`,
        `Recommended Linux Sysctl: sysctl -w net.ipv4.tcp_rmem="4096 131072 ${calc.optimalRmemMax}"`,
        ``,
        `--- MTU / MSS & PMTUD DIAGNOSTIC (${customMtu} MTU) ---`,
        `IPv4 TCP MSS            : ${calc.ipv4Mss} bytes | IPv6 TCP MSS: ${calc.ipv6Mss} bytes`,
        `PMTUD Test Command      : ping -D -s ${calc.pingPayload} 1.1.1.1  (Windows: ping -f -l ${calc.pingPayload} 1.1.1.1)`,
      ].join("\n")
    );
  }, [fileSizeGb, ispSpeedMbps, rttMs, customMtu, calc, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            File Size (GB)
          </label>
          <input
            type="number"
            min={0.1}
            max={10000}
            step={5}
            value={fileSizeGb}
            onChange={(e) => setFileSizeGb(Math.max(0.1, Number(e.target.value) || 1))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            Link Bandwidth (Mbps)
          </label>
          <input
            type="number"
            min={1}
            max={100000}
            value={ispSpeedMbps}
            onChange={(e) => setIspSpeedMbps(Math.max(1, Number(e.target.value) || 100))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            Latency RTT (ms)
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={rttMs}
            onChange={(e) => setRttMs(Math.max(1, Number(e.target.value) || 20))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
            Interface MTU (Bytes)
          </label>
          <input
            type="number"
            min={576}
            max={9000}
            value={customMtu}
            onChange={(e) => setCustomMtu(Math.max(576, Number(e.target.value) || 1500))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">Download ETA</div>
          <div className="font-heading text-xl font-bold text-accent mt-0.5">
            {calc.hours}h {calc.minutes}m {calc.seconds}s
          </div>
          <div className="font-mono-code text-[11px] text-text-muted">
            @ {calc.goodputMBps.toFixed(1)} MB/s Goodput
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            Bandwidth-Delay (BDP)
          </div>
          <div className="font-heading text-xl font-bold text-emerald-400 mt-0.5">
            {calc.bdpMegabytes.toFixed(2)} MB
          </div>
          <div className="font-mono-code text-[11px] text-text-muted">
            {Math.round(calc.bdpKilobytes).toLocaleString()} KB RWIN needed
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            IPv4 / IPv6 TCP MSS
          </div>
          <div className="font-heading text-xl font-bold text-text mt-0.5">
            {calc.ipv4Mss} / {calc.ipv6Mss} B
          </div>
          <div className="font-mono-code text-[11px] text-text-muted">For {customMtu} MTU</div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            Max ICMP Payload
          </div>
          <div className="font-heading text-xl font-bold text-sky-400 mt-0.5">
            {calc.pingPayload} B
          </div>
          <div className="font-mono-code text-[11px] text-text-muted">ping -D -s {calc.pingPayload}</div>
        </div>
      </div>

      {/* VPN & Tunnel MTU Reference Table */}
      <div className="rounded-xs border border-border bg-surface p-4 overflow-x-auto">
        <div className="font-heading text-xs font-bold uppercase text-text mb-2">
          Protocol MTU / TCP MSS Encapsulation Reference (Click row to load MTU)
        </div>
        <table className="w-full text-left font-mono-code text-xs">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th className="py-1.5">Interface / VPN Tunnel</th>
              <th className="py-1.5">Optimal MTU</th>
              <th className="py-1.5">IPv4 MSS</th>
              <th className="py-1.5">Max Unfragmented Ping</th>
              <th className="py-1.5">Engineering Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MTU_PROFILES.map((row) => (
              <tr
                key={row.name}
                onClick={() => setCustomMtu(row.mtu)}
                className="hover:bg-background/60 cursor-pointer"
              >
                <td className="py-2 font-bold text-text">{row.name}</td>
                <td className="py-2 text-accent font-bold">{row.mtu} B</td>
                <td className="py-2 text-emerald-400">{row.mtu - 40} B</td>
                <td className="py-2 text-sky-400">{row.mtu - 28} B</td>
                <td className="py-2 text-text-muted">{row.notes}</td>
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
 * 24. VO2 MAX, KARVONEN HEART RATE ZONES & TDEE MACRO CALCULATOR
 * ========================================================================== */
function FitnessVo2maxHrZoneTdeeCalculator({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [age, setAge] = useState(29);
  const [restingHr, setRestingHr] = useState(56);
  const [weightKg, setWeightKg] = useState(74);
  const [heightCm, setHeightCm] = useState(178);
  const [activityMult, setActivityMult] = useState(1.55);
  const [cooperMeters, setCooperMeters] = useState(2650);

  const metrics = useMemo(() => {
    const tanakaMaxHr = Math.round(208 - 0.7 * age);
    const foxMaxHr = 220 - age;
    const hrr = Math.max(40, tanakaMaxHr - restingHr);

    const zones = [
      { zone: "Zone 1 • Active Recovery", minPct: 0.5, maxPct: 0.6, color: "bg-sky-400" },
      { zone: "Zone 2 • Aerobic Base / Fat Oxidation", minPct: 0.6, maxPct: 0.7, color: "bg-emerald-400" },
      { zone: "Zone 3 • Tempo / Aerobic Endurance", minPct: 0.7, maxPct: 0.8, color: "bg-amber-400" },
      { zone: "Zone 4 • Lactate Threshold", minPct: 0.8, maxPct: 0.9, color: "bg-[#ff6a00]" },
      { zone: "Zone 5 • VO2 Max Anaerobic Peak", minPct: 0.9, maxPct: 1.0, color: "bg-red-500" },
    ].map((z) => ({
      ...z,
      minBpm: Math.round(hrr * z.minPct + restingHr),
      maxBpm: Math.round(hrr * z.maxPct + restingHr),
    }));

    // Cooper 12-min run VO2 max formula: (d_meters - 504.9) / 44.73
    const vo2Cooper = Math.max(20, (cooperMeters - 504.9) / 44.73);
    // Uth-Sørensen HR ratio VO2 max: 15.3 * (MHR / RHR)
    const vo2HrRatio = 15.3 * (tanakaMaxHr / Math.max(35, restingHr));
    const vo2Avg = (vo2Cooper + vo2HrRatio) / 2;

    // Mifflin-St Jeor BMR
    const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
    const tdee = Math.round(bmr * activityMult);

    const proteinG = Math.round(weightKg * 2.0);
    const fatG = Math.round((tdee * 0.27) / 9);
    const carbsG = Math.max(50, Math.round((tdee - proteinG * 4 - fatG * 9) / 4));

    return {
      tanakaMaxHr,
      foxMaxHr,
      hrr,
      zones,
      vo2Cooper,
      vo2HrRatio,
      vo2Avg,
      bmr,
      tdee,
      proteinG,
      fatG,
      carbsG,
    };
  }, [age, restingHr, weightKg, heightCm, activityMult, cooperMeters]);

  useEffect(() => {
    setOutput(
      [
        `=== VO2 MAX, KARVONEN HR ZONES & TDEE BIOMETRIC REPORT ===`,
        `Max Heart Rate (Tanaka) : ${metrics.tanakaMaxHr} bpm (Fox 220-Age: ${metrics.foxMaxHr} bpm)`,
        `Heart Rate Reserve (HRR): ${metrics.hrr} bpm (Resting HR: ${restingHr} bpm)`,
        `Estimated VO2 Max       : ${metrics.vo2Avg.toFixed(1)} mL/kg/min (Cooper 12-min: ${metrics.vo2Cooper.toFixed(1)} | HR Ratio: ${metrics.vo2HrRatio.toFixed(1)})`,
        `Mifflin-St Jeor BMR     : ${metrics.bmr.toLocaleString()} kcal/day`,
        `Total Daily Energy TDEE : ${metrics.tdee.toLocaleString()} kcal/day`,
        `Daily Macro Split       : ${metrics.proteinG}g Protein • ${metrics.carbsG}g Carbs • ${metrics.fatG}g Fat`,
        ``,
        `--- 5 KARVONEN HEART RATE TRAINING ZONES ---`,
        ...metrics.zones.map((z) => `${z.zone}: ${z.minBpm} – ${z.maxBpm} bpm`),
      ].join("\n")
    );
  }, [metrics, restingHr, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
        <div>
          <label className="block text-[10px] font-mono-code uppercase text-text-muted mb-1">
            Age (Years)
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Math.max(12, Number(e.target.value) || 25))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono-code uppercase text-text-muted mb-1">
            Resting HR (bpm)
          </label>
          <input
            type="number"
            value={restingHr}
            onChange={(e) => setRestingHr(Math.max(35, Number(e.target.value) || 60))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono-code uppercase text-text-muted mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(Math.max(35, Number(e.target.value) || 70))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono-code uppercase text-text-muted mb-1">
            Height (cm)
          </label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Math.max(120, Number(e.target.value) || 175))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono-code uppercase text-text-muted mb-1">
            12-Min Run (m)
          </label>
          <input
            type="number"
            step={50}
            value={cooperMeters}
            onChange={(e) => setCooperMeters(Math.max(1000, Number(e.target.value) || 2400))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono-code uppercase text-text-muted mb-1">
            Activity
          </label>
          <select
            value={activityMult}
            onChange={(e) => setActivityMult(Number(e.target.value))}
            className="w-full rounded-xs border border-border bg-background px-2 py-1.5 font-mono-code text-xs text-text"
          >
            <option value={1.2}>Sedentary (1.2×)</option>
            <option value={1.375}>Light 1-3d (1.38×)</option>
            <option value={1.55}>Moderate 3-5d (1.55×)</option>
            <option value={1.725}>Hard 6-7d (1.73×)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">VO2 Max Score</div>
          <div className="font-heading text-2xl font-bold text-accent mt-0.5">
            {metrics.vo2Avg.toFixed(1)}{" "}
            <span className="text-xs font-normal text-text-muted">mL/kg/min</span>
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            Tanaka Max HR
          </div>
          <div className="font-heading text-2xl font-bold text-text mt-0.5">
            {metrics.tanakaMaxHr} <span className="text-xs font-normal text-text-muted">bpm</span>
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            Daily TDEE / BMR
          </div>
          <div className="font-heading text-2xl font-bold text-emerald-400 mt-0.5">
            {metrics.tdee.toLocaleString()}{" "}
            <span className="text-xs font-normal text-text-muted">kcal</span>
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[11px] font-mono-code uppercase text-text-muted">
            Daily Macros (P/C/F)
          </div>
          <div className="font-mono-code text-sm font-bold text-sky-400 mt-1.5">
            {metrics.proteinG}g / {metrics.carbsG}g / {metrics.fatG}g
          </div>
        </div>
      </div>

      {/* Karvonen Zones Table */}
      <div className="rounded-xs border border-border bg-surface p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-accent" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Karvonen Heart Rate Reserve (HRR) Training Zones
          </span>
        </div>
        <div className="space-y-2">
          {metrics.zones.map((z) => (
            <div
              key={z.zone}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-xs ${z.color}`} />
                <span className="font-bold text-text">{z.zone}</span>
              </div>
              <span className="font-bold text-accent">
                {z.minBpm} – {z.maxBpm} BPM
              </span>
            </div>
          ))}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 25. GITHUB SECURITY ADVISORY (GHSA) NPM & PIP DEPENDENCY AUDITOR
 * ========================================================================== */
const VULNERABLE_SAMPLE_PACKAGE_JSON = JSON.stringify(
  {
    name: "legacy-enterprise-api",
    version: "1.0.0",
    dependencies: {
      lodash: "^4.17.19",
      axios: "0.21.1",
      express: "4.17.1",
      next: "14.1.0",
      jsonwebtoken: "8.5.1",
    },
  },
  null,
  2
);

const VULNERABLE_SAMPLE_REQUIREMENTS_TXT = `django==3.2.4
requests==2.25.1
urllib3==1.26.4
pyyaml==5.3.1
cryptography==3.3.2`;

interface OfflineAdvisoryInfo {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE";
  summary: string;
  fixedIn: string;
}

const OFFLINE_ADVISORY_FALLBACK: Record<string, OfflineAdvisoryInfo> = {
  lodash: {
    id: "GHSA-35jh-r3h4-6jhm / CVE-2021-23337",
    severity: "HIGH",
    summary: "Command Injection via template function & Prototype Pollution in zipObjectDeep.",
    fixedIn: "4.17.21",
  },
  axios: {
    id: "GHSA-cph5-m8f7-6c5x / CVE-2021-3749",
    severity: "HIGH",
    summary: "Server-Side Request Forgery (SSRF) & Regular Expression Denial of Service (ReDoS).",
    fixedIn: "1.7.4",
  },
  express: {
    id: "GHSA-rv95-896h-c2vc / CVE-2024-29041",
    severity: "MODERATE",
    summary: "Open Redirect vulnerability in malformed URL location handling.",
    fixedIn: "4.19.2",
  },
  next: {
    id: "GHSA-fr5h-rqp8-mj6g / CVE-2024-34351",
    severity: "HIGH",
    summary: "Server-Side Request Forgery (SSRF) in Server Actions Host header redirect.",
    fixedIn: "14.2.10",
  },
  jsonwebtoken: {
    id: "GHSA-27h2-hvpr-p74q / CVE-2022-23529",
    severity: "CRITICAL",
    summary: "Improper verification of secretOrPublicKey enables arbitrary code execution.",
    fixedIn: "9.0.0",
  },
  django: {
    id: "GHSA-v6rh-hp5x-86rv / CVE-2021-35042",
    severity: "CRITICAL",
    summary: "SQL Injection via unsanitized QuerySet.order_by() input parameters.",
    fixedIn: "3.2.13",
  },
  pyyaml: {
    id: "GHSA-8q59-q68h-6hv4 / CVE-2020-14343",
    severity: "CRITICAL",
    summary: "Arbitrary code execution in full_load / FullLoader deserialization.",
    fixedIn: "5.4.0",
  },
  urllib3: {
    id: "GHSA-q2q7-5pp4-w6pg / CVE-2021-33503",
    severity: "HIGH",
    summary: "Catastrophic backtracking ReDoS in URL authority parser.",
    fixedIn: "1.26.5",
  },
};

interface AuditedDependency {
  name: string;
  version: string;
  ecosystem: "npm" | "PyPI";
  vulnId: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "CLEAN";
  summary: string;
  fixedIn: string;
}

function GithubSecurityAdvisoryNpmPipAuditor({ tool }: { tool: Tool }) {
  const { setOutput } = useToolCard();
  const [manifestText, setManifestText] = useState(VULNERABLE_SAMPLE_PACKAGE_JSON);
  const [loadingOsv, setLoadingOsv] = useState(false);
  const [liveOsvIds, setLiveOsvIds] = useState<Record<string, string[]>>({});
  const [sourceLabel, setSourceLabel] = useState(
    "Verified GHSA / CVE Database (Click 'Query Live OSV.dev Batch API' for real-time check)"
  );

  const parsedDeps = useMemo((): AuditedDependency[] => {
    const trimmed = manifestText.trim();
    const list: { name: string; version: string; ecosystem: "npm" | "PyPI" }[] = [];

    if (trimmed.startsWith("{")) {
      try {
        const pkg = JSON.parse(trimmed);
        const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        Object.entries(allDeps).forEach(([name, ver]) => {
          const cleanVer = String(ver).replace(/^[\^~>=<\s]+/, "");
          list.push({ name, version: cleanVer, ecosystem: "npm" });
        });
      } catch {
        // ignore invalid json
      }
    } else {
      trimmed.split("\n").forEach((line) => {
        const clean = line.split("#")[0].trim();
        if (!clean) return;
        const m = clean.match(/^([a-zA-Z0-9_.-]+)\s*(?:==|>=|~=|<=)?\s*([0-9a-zA-Z.-]+)?/);
        if (m) {
          list.push({ name: m[1].toLowerCase(), version: m[2] || "latest", ecosystem: "PyPI" });
        }
      });
    }

    return list.map((d) => {
      const fallback = OFFLINE_ADVISORY_FALLBACK[d.name.toLowerCase()];
      const liveIds = liveOsvIds[`${d.name}@${d.version}`];
      if (liveIds && liveIds.length > 0) {
        return {
          ...d,
          vulnId: liveIds.slice(0, 3).join(", "),
          severity: fallback?.severity || "HIGH",
          summary:
            fallback?.summary ||
            `Confirmed vulnerable by live OSV.dev querybatch (${liveIds.length} advisories).`,
          fixedIn: fallback?.fixedIn || "latest",
        };
      }
      if (fallback) {
        return {
          ...d,
          vulnId: fallback.id,
          severity: fallback.severity,
          summary: fallback.summary,
          fixedIn: fallback.fixedIn,
        };
      }
      return {
        ...d,
        vulnId: "No Known CVEs",
        severity: "CLEAN",
        summary: "No matching security advisories detected for this version.",
        fixedIn: d.version,
      };
    });
  }, [manifestText, liveOsvIds]);

  const queryLiveOsvBatch = async () => {
    if (parsedDeps.length === 0) return;
    setLoadingOsv(true);
    try {
      const queries = parsedDeps.map((d) => ({
        package: { name: d.name, ecosystem: d.ecosystem },
        version: d.version,
      }));
      const res = await fetch("https://api.osv.dev/v1/querybatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const map: Record<string, string[]> = {};
      (data.results || []).forEach((r: { vulns?: { id: string }[] }, idx: number) => {
        const dep = parsedDeps[idx];
        if (dep && r.vulns && r.vulns.length > 0) {
          map[`${dep.name}@${dep.version}`] = r.vulns.map((v) => v.id);
        }
      });
      setLiveOsvIds(map);
      setSourceLabel("Live https://api.osv.dev/v1/querybatch Response + GHSA Enrichment");
    } catch {
      setSourceLabel("Offline Fallback GHSA Database (OSV API unreachable)");
    } finally {
      setLoadingOsv(false);
    }
  };

  const remediationCmd = useMemo(() => {
    const vulnList = parsedDeps.filter((d) => d.severity !== "CLEAN");
    if (vulnList.length === 0) return "# All dependencies clean!";
    const isPip = vulnList[0].ecosystem === "PyPI";
    if (isPip) {
      return `pip install --upgrade ${vulnList.map((d) => `${d.name}>=${d.fixedIn}`).join(" ")}`;
    }
    return `npm install ${vulnList.map((d) => `${d.name}@^${d.fixedIn}`).join(" ")} && npm audit fix`;
  }, [parsedDeps]);

  useEffect(() => {
    setOutput(
      [
        `=== GITHUB SECURITY ADVISORY (GHSA) & OSV DEPENDENCY AUDIT ===`,
        `Data Source : ${sourceLabel}`,
        `Scanned     : ${parsedDeps.length} packages (${parsedDeps.filter((d) => d.severity !== "CLEAN").length} vulnerable)`,
        ``,
        ...parsedDeps.map(
          (d) =>
            `[${d.severity}] ${d.name}@${d.version} (${d.ecosystem}) -> ${d.vulnId} | Fix: ${d.fixedIn}\n  └─ ${d.summary}`
        ),
        ``,
        `--- REMEDIATION CLI COMMAND ---`,
        remediationCmd,
      ].join("\n")
    );
  }, [parsedDeps, sourceLabel, remediationCmd, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setManifestText(VULNERABLE_SAMPLE_PACKAGE_JSON)}
            className="rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text hover:border-accent cursor-pointer"
          >
            Load Vulnerable Sample package.json
          </button>
          <button
            type="button"
            onClick={() => setManifestText(VULNERABLE_SAMPLE_REQUIREMENTS_TXT)}
            className="rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text hover:border-accent cursor-pointer"
          >
            Load Sample requirements.txt
          </button>
        </div>

        <button
          type="button"
          onClick={queryLiveOsvBatch}
          disabled={loadingOsv}
          className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-3.5 py-1.5 font-heading text-xs font-bold uppercase text-white hover:opacity-90 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingOsv ? "animate-spin" : ""}`} />
          Query Live OSV.dev Batch API
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono-code uppercase text-text-muted mb-1">
            Paste package.json or requirements.txt
          </label>
          <textarea
            rows={10}
            value={manifestText}
            onChange={(e) => setManifestText(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text"
          />
        </div>

        <div className="md:col-span-2 rounded-xs border border-border bg-surface p-3 overflow-x-auto space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-code">
            <span className="font-bold uppercase text-text">Dependency CVE Audit Table</span>
            <span className="text-[11px] text-text-muted">{sourceLabel}</span>
          </div>
          <table className="w-full text-left font-mono-code text-xs">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="py-1.5">Package</th>
                <th className="py-1.5">Severity</th>
                <th className="py-1.5">Advisory / CVE ID</th>
                <th className="py-1.5">Patched</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {parsedDeps.map((d) => (
                <tr key={`${d.name}-${d.version}`}>
                  <td className="py-2 font-bold text-text">
                    {d.name}@{d.version}
                  </td>
                  <td className="py-2">
                    <span
                      className={`rounded-xs px-1.5 py-0.5 text-[10px] font-bold ${
                        d.severity === "CRITICAL"
                          ? "bg-red-500/20 text-red-400"
                          : d.severity === "HIGH"
                          ? "bg-amber-500/20 text-amber-400"
                          : d.severity === "MODERATE"
                          ? "bg-sky-500/20 text-sky-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {d.severity}
                    </span>
                  </td>
                  <td className="py-2 text-text-muted">
                    <div className="text-text font-semibold">{d.vulnId}</div>
                    <div className="text-[11px] opacity-80">{d.summary}</div>
                  </td>
                  <td className="py-2 font-bold text-emerald-400">&gt;={d.fixedIn}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="rounded-xs border border-border bg-background p-2.5">
            <div className="text-[10px] font-mono-code uppercase text-text-muted mb-1">
              One-Line Upgrade &amp; Remediation Command
            </div>
            <pre className="font-mono-code text-xs text-accent overflow-x-auto">
              {remediationCmd}
            </pre>
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * EXPORT REGISTRY FOR WAVE 3 GROUP B: 12 HARDWARE, MEDIA & VERIFICATION TOOLS
 * ========================================================================== */
export const wave3HardwareMediaPlaygrounds: Record<
  string,
  React.ComponentType<{ tool: Tool }>
> = {
  "bluetooth-audio-latency-stereo-tester": BluetoothAudioLatencyStereoTester,
  "typing-wpm-keystroke-dynamics-lab": TypingWpmKeystrokeDynamicsLab,
  "srt-vtt-subtitle-time-shifter-converter": SrtVttSubtitleTimeShifterConverter,
  "photo-rgb-histogram-webp-compressor": PhotoRgbHistogramWebpCompressor,
  "video-bitrate-4k-ffmpeg-command-builder": VideoBitrate4kFfmpegCommandBuilder,
  "rss-atom-json-feed-widget-previewer": RssAtomJsonFeedWidgetPreviewer,
  "ir-blaster-nec-pronto-hex-decoder": IrBlasterNecProntoHexDecoder,
  "power-bank-mah-wh-flight-limit-calculator": PowerBankMahWhFlightLimitCalculator,
  "ab-testing-significance-sample-calculator": AbTestingSignificanceSampleCalculator,
  "network-download-mtu-bdp-calculator": NetworkDownloadMtuBdpCalculator,
  "fitness-vo2max-hr-zone-tdee-calculator": FitnessVo2maxHrZoneTdeeCalculator,
  "github-security-advisory-npm-pip-auditor": GithubSecurityAdvisoryNpmPipAuditor,
};

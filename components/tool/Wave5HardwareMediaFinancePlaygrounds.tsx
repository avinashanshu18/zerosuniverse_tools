"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Cpu,
  HardDrive,
  Smartphone,
  Terminal,
  Sliders,
  Music,
  Wind,
  CloudSnow,
  Thermometer,
  GraduationCap,
  Clock,
  Tv,
  MessageSquareWarning,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Coins,
  Database,
  Play,
  Square,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { useToolCard, ToolActions } from "@/components/tool/ToolPlaygrounds";

/* ============================================================================
 * 14. PC MOTHERBOARD PCIe LANE, NVMe & RAM BANDWIDTH PLANNER
 * ========================================================================== */
function PcMotherboardPcieLaneNvmeBandwidthPlanner({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();

  const [platform, setPlatform] = useState<
    "amd-am5-x870e" | "amd-am5-b650" | "intel-lga1851-z890"
  >("amd-am5-x870e");
  const [pcieGen, setPcieGen] = useState<"5.0" | "4.0" | "3.0">("5.0");
  const [gpuMode, setGpuMode] = useState<"x16" | "x8x8" | "x4">("x16");
  const [nvmeCount, setNvmeCount] = useState<number>(3);
  const [ddr5Speed, setDdr5Speed] = useState<number>(6000);
  const [casLatency, setCasLatency] = useState<number>(30);

  useEffect(() => {
    if (resetTrigger > 0) {
      setPlatform("amd-am5-x870e");
      setPcieGen("5.0");
      setGpuMode("x16");
      setNvmeCount(3);
      setDdr5Speed(6000);
      setCasLatency(30);
    }
  }, [resetTrigger]);

  const analysis = useMemo(() => {
    const perLaneUniGBs =
      pcieGen === "5.0" ? 3.938 : pcieGen === "4.0" ? 1.969 : 0.985;

    const platformMeta = {
      "amd-am5-x870e": {
        name: "AMD AM5 X870E (Dual Promontory21)",
        totalCpuLanes: 24,
        usableCpuLanes: 24,
        chipsetLink: "PCIe 4.0 x4 (~7.88 GB/s Upstream)",
        chipsetUpstreamGBs: 7.88,
        m2SharingRule:
          "Populating M.2_2 & M.2_3 with Gen5 x4 shares lanes with USB4 or bifurcates primary PCIEX16_1 to x8 mode on many X870E boards.",
        dropsGpuAtNvme: 3,
      },
      "amd-am5-b650": {
        name: "AMD AM5 B650 (Single Promontory21)",
        totalCpuLanes: 24,
        usableCpuLanes: 20,
        chipsetLink: "PCIe 4.0 x4 (~7.88 GB/s Upstream)",
        chipsetUpstreamGBs: 7.88,
        m2SharingRule:
          "1x CPU M.2_1 (x4) dedicated. Additional M.2_2 / M.2_3 route through Promontory21 PCIe 4.0 x4 chipset link.",
        dropsGpuAtNvme: 4,
      },
      "intel-lga1851-z890": {
        name: "Intel LGA1851 Z890 (Arrow Lake)",
        totalCpuLanes: 24,
        usableCpuLanes: 20,
        chipsetLink: "DMI 4.0 x8 (~15.75 GB/s Upstream)",
        chipsetUpstreamGBs: 15.75,
        m2SharingRule:
          "CPU provides 1x Gen5 x4 + 1x Gen4 x4 M.2. If a second Gen5 M.2_2 slot is populated on CPU lanes, GPU PCIEX16 drops from x16 to x8.",
        dropsGpuAtNvme: 2,
      },
    }[platform];

    const gpuLaneSharedDrop =
      gpuMode === "x16" && nvmeCount >= platformMeta.dropsGpuAtNvme;
    const effectiveGpuLanes =
      gpuMode === "x4" ? 4 : gpuMode === "x8x8" || gpuLaneSharedDrop ? 8 : 16;

    const gpuUniGBs = effectiveGpuLanes * perLaneUniGBs;
    const gpuBiGBs = gpuUniGBs * 2;

    const cpuNvmeDrives = Math.min(nvmeCount, platform === "intel-lga1851-z890" ? 2 : 2);
    const chipsetNvmeDrives = Math.max(0, nvmeCount - cpuNvmeDrives);
    const singleNvmeUniGBs = 4 * perLaneUniGBs;
    const chipsetNvmeDemandGBs = chipsetNvmeDrives * (4 * 1.969); // Chipset M.2 typically PCIe 4.0 x4
    const chipsetBottleneckPct =
      chipsetNvmeDemandGBs > platformMeta.chipsetUpstreamGBs
        ? Math.round(
            ((chipsetNvmeDemandGBs - platformMeta.chipsetUpstreamGBs) /
              chipsetNvmeDemandGBs) *
              100
          )
        : 0;

    // Dual-Channel DDR5 Throughput (2x 64-bit / 4x 32-bit subchannels = 16 bytes per transfer cycle across dual channel)
    const singleChannelGBs = (ddr5Speed * 8) / 1000;
    const dualChannelGBs = singleChannelGBs * 2;
    const firstWordLatencyNs = (casLatency * 2000) / ddr5Speed;

    return {
      platformMeta,
      perLaneUniGBs,
      gpuLaneSharedDrop,
      effectiveGpuLanes,
      gpuUniGBs,
      gpuBiGBs,
      cpuNvmeDrives,
      chipsetNvmeDrives,
      singleNvmeUniGBs,
      chipsetNvmeDemandGBs,
      chipsetBottleneckPct,
      singleChannelGBs,
      dualChannelGBs,
      firstWordLatencyNs,
    };
  }, [platform, pcieGen, gpuMode, nvmeCount, ddr5Speed, casLatency]);

  useEffect(() => {
    const report = [
      `=== PC MOTHERBOARD PCIe LANE & NVMe BANDWIDTH REPORT ===`,
      `Platform: ${analysis.platformMeta.name}`,
      `PCIe Generation: PCIe ${pcieGen} (${analysis.perLaneUniGBs.toFixed(3)} GB/s per lane unidirectional)`,
      `GPU Slot Mode: Requested ${gpuMode.toUpperCase()} -> Effective x${analysis.effectiveGpuLanes}`,
      `GPU Bandwidth: ${analysis.gpuUniGBs.toFixed(2)} GB/s Unidirectional | ${analysis.gpuBiGBs.toFixed(2)} GB/s Bidirectional`,
      `M.2 NVMe Drives: ${nvmeCount} total (${analysis.cpuNvmeDrives} CPU-direct, ${analysis.chipsetNvmeDrives} via Chipset)`,
      `Per-NVMe (x4) Peak: ${analysis.singleNvmeUniGBs.toFixed(2)} GB/s`,
      `Chipset Upstream Link: ${analysis.platformMeta.chipsetLink}`,
      `Chipset Saturation Warning: ${
        analysis.chipsetBottleneckPct > 0
          ? `BOTTLENECK DETECTED (${analysis.chipsetBottleneckPct}% RAID/concurrent throttle across ${analysis.chipsetNvmeDrives} chipset drives)`
          : "No concurrent upstream saturation"
      }`,
      `GPU Bifurcation Alert: ${
        analysis.gpuLaneSharedDrop
          ? "WARNING — Primary GPU dropped from x16 to x8 due to CPU M.2 lane sharing!"
          : "Optimal — Primary GPU operating without lane steal."
      }`,
      `DDR5 RAM Config: Dual-Channel DDR5-${ddr5Speed} CL${casLatency}`,
      `RAM Throughput: ${analysis.dualChannelGBs.toFixed(1)} GB/s Dual-Channel (${analysis.singleChannelGBs.toFixed(1)} GB/s Single-Channel) | First-Word Latency: ${analysis.firstWordLatencyNs.toFixed(2)} ns`,
    ].join("\n");
    setOutput(report);
  }, [analysis, pcieGen, gpuMode, nvmeCount, ddr5Speed, casLatency, setOutput]);

  return (
    <div className="space-y-5 text-xs">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Motherboard Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as typeof platform)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-medium"
          >
            <option value="amd-am5-x870e">AMD AM5 X870E (Promontory21 x2)</option>
            <option value="amd-am5-b650">AMD AM5 B650 / B650E</option>
            <option value="intel-lga1851-z890">Intel LGA1851 Z890 (DMI 4.0 x8)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            PCIe Generation Standard
          </label>
          <select
            value={pcieGen}
            onChange={(e) => setPcieGen(e.target.value as typeof pcieGen)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-medium"
          >
            <option value="5.0">PCIe 5.0 (32 GT/s — 3.94 GB/s/lane)</option>
            <option value="4.0">PCIe 4.0 (16 GT/s — 1.97 GB/s/lane)</option>
            <option value="3.0">PCIe 3.0 (8 GT/s — 0.985 GB/s/lane)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            GPU Primary Slot Mode
          </label>
          <select
            value={gpuMode}
            onChange={(e) => setGpuMode(e.target.value as typeof gpuMode)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-medium"
          >
            <option value="x16">PCIEX16 Full x16 Mode</option>
            <option value="x8x8">x8 / x8 Bifurcated (Dual GPU / AIC)</option>
            <option value="x4">x4 Chipset Secondary Slot</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Installed M.2 NVMe Drives: <span className="text-accent">{nvmeCount} Drives</span>
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={nvmeCount}
            onChange={(e) => setNvmeCount(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
          <div className="flex justify-between text-[10px] text-text-muted font-mono-code">
            <span>1 NVMe</span>
            <span>3 NVMe</span>
            <span>5 NVMe</span>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            DDR5 RAM Speed (MT/s)
          </label>
          <select
            value={ddr5Speed}
            onChange={(e) => setDdr5Speed(Number(e.target.value))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          >
            <option value={6000}>DDR5-6000 (AM5 Sweet Spot)</option>
            <option value={6400}>DDR5-6400 (1:1 UCLK Peak)</option>
            <option value={7200}>DDR5-7200 (High Bandwidth)</option>
            <option value={8000}>DDR5-8000 (CUDIMM / Z890 Extreme)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            CAS Latency (CL)
          </label>
          <input
            type="number"
            min={24}
            max={46}
            value={casLatency}
            onChange={(e) => setCasLatency(Math.max(20, Number(e.target.value) || 30))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>
      </div>

      {/* Bottleneck Alert Banner */}
      {(analysis.gpuLaneSharedDrop || analysis.chipsetBottleneckPct > 0) ? (
        <div className="rounded-xs border border-amber-500/40 bg-amber-500/10 p-3 space-y-1">
          <div className="flex items-center gap-2 font-heading font-bold uppercase text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>PCIe Lane Sharing / Chipset Bottleneck Detected</span>
          </div>
          {analysis.gpuLaneSharedDrop && (
            <p className="text-text-muted">
              • <strong>GPU x16 → x8 Bifurcation:</strong> Populating {nvmeCount} M.2 drives on{" "}
              {analysis.platformMeta.name} steals CPU lanes from PCIEX16_1, halving GPU bandwidth to{" "}
              <span className="font-mono-code text-text">{analysis.gpuUniGBs.toFixed(2)} GB/s</span>.
            </p>
          )}
          {analysis.chipsetBottleneckPct > 0 && (
            <p className="text-text-muted">
              • <strong>Chipset DMI/Promontory21 Saturation:</strong> {analysis.chipsetNvmeDrives} chipset M.2 drives demand{" "}
              <span className="font-mono-code text-text">{analysis.chipsetNvmeDemandGBs.toFixed(2)} GB/s</span>, exceeding the{" "}
              <span className="font-mono-code text-text">{analysis.platformMeta.chipsetUpstreamGBs} GB/s</span> upstream link by{" "}
              <span className="font-bold text-amber-400">{analysis.chipsetBottleneckPct}%</span> during concurrent transfers.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xs border border-emerald-500/40 bg-emerald-500/10 p-3 flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-medium">
            Zero PCIe lane-stealing or chipset upstream bottlenecks detected for this topology.
          </span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">GPU Unidirectional</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-accent">
            {analysis.gpuUniGBs.toFixed(2)} GB/s
          </div>
          <div className="text-[11px] text-text-muted">
            PCIe {pcieGen} x{analysis.effectiveGpuLanes} ({analysis.gpuBiGBs.toFixed(1)} GB/s Bi-Dir)
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">M.2 NVMe Peak (x4)</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            {analysis.singleNvmeUniGBs.toFixed(2)} GB/s
          </div>
          <div className="text-[11px] text-text-muted">
            {analysis.cpuNvmeDrives} CPU Direct / {analysis.chipsetNvmeDrives} PCH
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Dual-Channel DDR5</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-emerald-400">
            {analysis.dualChannelGBs.toFixed(1)} GB/s
          </div>
          <div className="text-[11px] text-text-muted">
            Single: {analysis.singleChannelGBs.toFixed(1)} GB/s
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">RAM First-Word Latency</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            {analysis.firstWordLatencyNs.toFixed(2)} ns
          </div>
          <div className="text-[11px] text-text-muted">
            DDR5-{ddr5Speed} CL{casLatency}
          </div>
        </div>
      </div>

      {/* Topology Breakdown */}
      <div className="rounded-xs border border-border bg-background p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-accent" />
            Motherboard Lane Routing Architecture
          </span>
          <span className="font-mono-code text-[11px] text-text-muted">
            {analysis.platformMeta.chipsetLink}
          </span>
        </div>
        <p className="text-text-muted text-[11px] leading-relaxed">
          {analysis.platformMeta.m2SharingRule}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
          {Array.from({ length: nvmeCount }).map((_, idx) => {
            const isCpu = idx < analysis.cpuNvmeDrives;
            return (
              <div
                key={idx}
                className={`rounded-xs border p-2 font-mono-code text-[11px] ${
                  isCpu
                    ? "border-accent/50 bg-surface text-text"
                    : "border-border bg-surface/50 text-text-muted"
                }`}
              >
                <div className="font-bold text-text flex items-center justify-between">
                  <span>M.2_{idx + 1}</span>
                  <HardDrive className="h-3 w-3 text-accent" />
                </div>
                <div>{isCpu ? `CPU Direct Gen${pcieGen[0]} x4` : "Chipset PCIe 4.0 x4"}</div>
                <div className="text-[10px] text-accent">
                  {isCpu ? `${analysis.singleNvmeUniGBs.toFixed(1)} GB/s` : "7.88 GB/s shared"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 15. ANDROID EMULATOR VT-x, RAM & 120FPS ENGINE OPTIMIZER
 * ========================================================================== */
function AndroidEmulatorVtxRamFpsOptimizer({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();

  const [hostCores, setHostCores] = useState<number>(8);
  const [hostRamGB, setHostRamGB] = useState<number>(16);
  const [gpuType, setGpuType] = useState<
    "nvidia-discrete" | "amd-discrete" | "intel-igpu" | "apple-silicon"
  >("nvidia-discrete");
  const [emulator, setEmulator] = useState<
    "bluestacks-5" | "ldplayer-9" | "mumu-12" | "android-studio-avd"
  >("bluestacks-5");
  const [workload, setWorkload] = useState<
    "120fps-competitive" | "multi-instance-4x" | "app-debugging"
  >("120fps-competitive");

  useEffect(() => {
    if (resetTrigger > 0) {
      setHostCores(8);
      setHostRamGB(16);
      setGpuType("nvidia-discrete");
      setEmulator("bluestacks-5");
      setWorkload("120fps-competitive");
    }
  }, [resetTrigger]);

  const recommendation = useMemo(() => {
    let vCpu = 4;
    if (workload === "120fps-competitive") {
      vCpu = hostCores >= 12 ? 6 : hostCores >= 6 ? 4 : Math.max(2, Math.floor(hostCores / 2));
    } else if (workload === "multi-instance-4x") {
      vCpu = Math.max(2, Math.min(4, Math.floor(hostCores / 4)));
    } else {
      vCpu = Math.min(4, Math.max(2, Math.floor(hostCores / 2)));
    }

    let ramMB = 4096;
    if (workload === "120fps-competitive") {
      ramMB = hostRamGB >= 32 ? 8192 : hostRamGB >= 16 ? 6144 : 3072;
    } else if (workload === "multi-instance-4x") {
      ramMB = hostRamGB >= 32 ? 4096 : hostRamGB >= 16 ? 2048 : 1536;
    } else {
      ramMB = hostRamGB >= 16 ? 4096 : 2048;
    }

    const renderer =
      emulator === "android-studio-avd"
        ? gpuType === "apple-silicon"
          ? "Metal Hardware GLES 3.1"
          : "Vulkan / SwiftShader HW"
        : gpuType === "nvidia-discrete"
        ? workload === "120fps-competitive"
          ? "Vulkan (or OpenGL + Dedicated GPU Prefer Max Perf)"
          : "OpenGL"
        : gpuType === "amd-discrete"
        ? "Vulkan (Bypasses AMD OpenGL driver overhead)"
        : "DirectX 11 (Stable for Integrated iGPU)";

    const astcSetting =
      workload === "multi-instance-4x"
        ? "Disabled (Conserves VRAM across 4 instances)"
        : gpuType === "intel-igpu"
        ? "Software Decoding (RAM cached)"
        : "Hardware Decoding (GPU Accelerated)";

    const resolutionDpi =
      workload === "120fps-competitive"
        ? "1920x1080 (16:9) @ 240 DPI (or 320 DPI for crisp crosshair)"
        : workload === "multi-instance-4x"
        ? "960x540 (qHD) @ 160 DPI — Caps FPS at 30 FPS per clone"
        : "1080x2400 (Pixel 7 Pro skin) @ 420 DPI";

    const targetFps =
      workload === "120fps-competitive"
        ? "120 FPS (Enable High Frame Rate + ASUS ROG 2 / Samsung S22 Ultra Device Profile)"
        : workload === "multi-instance-4x"
        ? "30 FPS Eco Mode (Disable Sound in Multi-Instance Sync)"
        : "60 FPS VSync Locked";

    const fixCommands = [
      `# Run in Elevated Administrator Command Prompt / PowerShell:`,
      `bcdedit /set hypervisorlaunchtype off`,
      `DISM /Online /Disable-Feature:Microsoft-Hyper-V-All /NoRestart`,
      `DISM /Online /Disable-Feature:VirtualMachinePlatform /NoRestart`,
      `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity" /v "Enabled" /t REG_DWORD /d 0 /f`,
      `# Reboot PC afterwards to unlock raw Ring-0 VT-x / SVM hardware virtualization.`,
    ].join("\n");

    return {
      vCpu,
      ramMB,
      renderer,
      astcSetting,
      resolutionDpi,
      targetFps,
      fixCommands,
    };
  }, [hostCores, hostRamGB, gpuType, emulator, workload]);

  useEffect(() => {
    setOutput(
      [
        `=== ANDROID EMULATOR VT-x & 120FPS TUNING PROFILE ===`,
        `Host Spec: ${hostCores} CPU Cores | ${hostRamGB} GB RAM | GPU: ${gpuType}`,
        `Emulator Engine: ${emulator} | Workload: ${workload}`,
        `-----------------------------------------------------`,
        `Recommended vCPU Allocation: ${recommendation.vCpu} Cores (per instance)`,
        `Recommended RAM Allocation: ${recommendation.ramMB} MB (${(recommendation.ramMB / 1024).toFixed(1)} GB)`,
        `Graphics Renderer: ${recommendation.renderer}`,
        `ASTC Texture Compression: ${recommendation.astcSetting}`,
        `Display Resolution & DPI: ${recommendation.resolutionDpi}`,
        `Frame Rate Target: ${recommendation.targetFps}`,
        ``,
        `=== WINDOWS 11 HYPER-V / VBS / CORE ISOLATION FIX ===`,
        recommendation.fixCommands,
      ].join("\n")
    );
  }, [hostCores, hostRamGB, gpuType, emulator, workload, recommendation, setOutput]);

  return (
    <div className="space-y-5 text-xs">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Host CPU Physical Cores: <span className="text-accent">{hostCores} Cores</span>
          </label>
          <input
            type="range"
            min={4}
            max={24}
            step={2}
            value={hostCores}
            onChange={(e) => setHostCores(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
          <div className="flex justify-between text-[10px] text-text-muted font-mono-code">
            <span>4C</span>
            <span>12C</span>
            <span>24C</span>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Host System RAM
          </label>
          <select
            value={hostRamGB}
            onChange={(e) => setHostRamGB(Number(e.target.value))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          >
            <option value={8}>8 GB RAM</option>
            <option value={16}>16 GB RAM</option>
            <option value={32}>32 GB RAM</option>
            <option value={64}>64 GB RAM</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Host GPU Architecture
          </label>
          <select
            value={gpuType}
            onChange={(e) => setGpuType(e.target.value as typeof gpuType)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          >
            <option value="nvidia-discrete">NVIDIA GeForce RTX / GTX Discrete</option>
            <option value="amd-discrete">AMD Radeon RX Discrete</option>
            <option value="intel-igpu">Intel Iris Xe / UHD Integrated</option>
            <option value="apple-silicon">Apple M1/M2/M3/M4 Unified GPU</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Target Android Emulator
          </label>
          <select
            value={emulator}
            onChange={(e) => setEmulator(e.target.value as typeof emulator)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          >
            <option value="bluestacks-5">BlueStacks 5 (Pie 64-bit / Android 11)</option>
            <option value="ldplayer-9">LDPlayer 9 (Android 9 Kernel)</option>
            <option value="mumu-12">MuMu Player 12 (Android 12 Vulkan)</option>
            <option value="android-studio-avd">Android Studio Koala/Ladybug AVD</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Target Workload Profile
          </label>
          <select
            value={workload}
            onChange={(e) => setWorkload(e.target.value as typeof workload)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          >
            <option value="120fps-competitive">
              120FPS Competitive Gaming (BGMI / Free Fire / COD Mobile)
            </option>
            <option value="multi-instance-4x">
              Multi-Instance 4x Simultaneous Gacha / Reroll Farming
            </option>
            <option value="app-debugging">
              APK / React Native / Flutter App Debugging
            </option>
          </select>
        </div>
      </div>

      {/* Output Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Optimal vCPU Cores</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-accent">
            {recommendation.vCpu} vCPUs
          </div>
          <div className="text-[11px] text-text-muted">
            Leaves {hostCores - recommendation.vCpu} cores for OS scheduling
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Allocated Memory</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-emerald-400">
            {recommendation.ramMB} MB
          </div>
          <div className="text-[11px] text-text-muted">
            {(recommendation.ramMB / 1024).toFixed(1)} GB dedicated heap
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Graphics API</div>
          <div className="mt-1 font-heading text-xs font-bold text-text">
            {recommendation.renderer}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            ASTC: {recommendation.astcSetting}
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Resolution & DPI</div>
          <div className="mt-1 font-mono-code text-xs font-bold text-text">
            {recommendation.resolutionDpi}
          </div>
          <div className="text-[11px] text-accent mt-0.5">{recommendation.targetFps}</div>
        </div>
      </div>

      {/* Hyper-V Fix Terminal */}
      <div className="rounded-xs border border-border bg-background p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-accent" />
            Windows Hyper-V / VBS / Memory Integrity Conflict Fix
          </span>
          <span className="text-[10px] font-mono-code text-text-muted">Admin PowerShell</span>
        </div>
        <pre className="overflow-x-auto rounded-xs border border-border bg-surface p-2.5 font-mono-code text-[11px] text-emerald-400 leading-relaxed">
          {recommendation.fixCommands}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 16. YT-DLP, FFMPEG & ARIA2C 16-THREAD COMMAND BUILDER
 * ========================================================================== */
function YtDlpAria2cMediaStreamCommandBuilder({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();

  const [targetUrl, setTargetUrl] = useState<string>(
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  );
  const [qualityPreset, setQualityPreset] = useState<
    "4k-av1" | "1080p-mp4" | "audio-flac" | "audio-mp3"
  >("4k-av1");
  const [useAria2c, setUseAria2c] = useState<boolean>(true);
  const [sponsorBlock, setSponsorBlock] = useState<boolean>(true);
  const [embedSubs, setEmbedSubs] = useState<boolean>(true);
  const [browserCookies, setBrowserCookies] = useState<
    "none" | "chrome" | "firefox" | "brave" | "edge"
  >("chrome");
  const [useClipRange, setUseClipRange] = useState<boolean>(false);
  const [clipRange, setClipRange] = useState<string>("01:15-03:45");

  useEffect(() => {
    if (resetTrigger > 0) {
      setTargetUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      setQualityPreset("4k-av1");
      setUseAria2c(true);
      setSponsorBlock(true);
      setEmbedSubs(true);
      setBrowserCookies("chrome");
      setUseClipRange(false);
      setClipRange("01:15-03:45");
    }
  }, [resetTrigger]);

  const commands = useMemo(() => {
    const cleanUrl = targetUrl.trim() || "https://example.com/video";
    const parts: string[] = ["yt-dlp"];

    if (qualityPreset === "4k-av1") {
      parts.push(
        `-f "bestvideo[height<=2160][fps<=60]+bestaudio/best"`,
        `--merge-output-format mkv`
      );
    } else if (qualityPreset === "1080p-mp4") {
      parts.push(
        `-f "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"`,
        `--merge-output-format mp4`
      );
    } else if (qualityPreset === "audio-flac") {
      parts.push(`-x --audio-format flac --audio-quality 0 --embed-thumbnail`);
    } else {
      parts.push(`-x --audio-format mp3 --audio-quality 320K --embed-thumbnail`);
    }

    if (useAria2c) {
      parts.push(
        `--downloader aria2c`,
        `--downloader-args "aria2c:-x 16 -s 16 -k 1M --file-allocation=none"`
      );
    }

    if (sponsorBlock) {
      parts.push(`--sponsorblock-remove "sponsor,intro,outro,selfpromo,interaction"`);
    }

    if (embedSubs && !qualityPreset.startsWith("audio")) {
      parts.push(`--write-subs --write-auto-subs --sub-langs "en.*" --embed-subs`);
    }

    if (browserCookies !== "none") {
      parts.push(`--cookies-from-browser ${browserCookies}`);
    }

    if (useClipRange && clipRange.trim()) {
      parts.push(
        `--download-sections "*${clipRange.trim()}"`,
        `--force-keyframes-at-cuts`
      );
    }

    parts.push(`--embed-metadata`, `-o "%(title)s [%(id)s].%(ext)s"`, `"${cleanUrl}"`);

    const ytDlpCmd = parts.join(" \\\n  ");
    const standaloneAria2c = `aria2c -x 16 -s 16 -k 1M --continue=true --max-connection-per-server=16 --min-split-size=1M "${cleanUrl}"`;

    return { ytDlpCmd, standaloneAria2c };
  }, [
    targetUrl,
    qualityPreset,
    useAria2c,
    sponsorBlock,
    embedSubs,
    browserCookies,
    useClipRange,
    clipRange,
  ]);

  useEffect(() => {
    setOutput(
      [
        `# 1. YT-DLP + FFMPEG + ARIA2C PIPELINE COMMAND`,
        commands.ytDlpCmd,
        ``,
        `# 2. STANDALONE 16-CONNECTION ARIA2C DIRECT STREAM COMMAND`,
        commands.standaloneAria2c,
      ].join("\n")
    );
  }, [commands, setOutput]);

  return (
    <div className="space-y-5 text-xs">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Target Video / Playlist / M3U8 Stream URL
          </label>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Stream Quality & Container Preset
          </label>
          <select
            value={qualityPreset}
            onChange={(e) => setQualityPreset(e.target.value as typeof qualityPreset)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          >
            <option value="4k-av1">4K 2160p60 AV1/VP9 Master (.MKV)</option>
            <option value="1080p-mp4">1080p60 Universal H.264/AAC (.MP4)</option>
            <option value="audio-flac">Best Audio Only Lossless (.FLAC + Cover Art)</option>
            <option value="audio-mp3">Best Audio Only 320kbps (.MP3 + ID3 Tags)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Browser Session Cookies (Bypass Age/Premium Gate)
          </label>
          <select
            value={browserCookies}
            onChange={(e) => setBrowserCookies(e.target.value as typeof browserCookies)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          >
            <option value="none">No Browser Cookies (Public Anonymous)</option>
            <option value="chrome">Google Chrome (--cookies-from-browser chrome)</option>
            <option value="firefox">Mozilla Firefox (--cookies-from-browser firefox)</option>
            <option value="brave">Brave Browser (--cookies-from-browser brave)</option>
            <option value="edge">Microsoft Edge (--cookies-from-browser edge)</option>
          </select>
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex items-center gap-2 rounded-xs border border-border bg-surface p-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={useAria2c}
            onChange={(e) => setUseAria2c(e.target.checked)}
            className="accent-[#ff6a00]"
          />
          <div>
            <div className="font-bold text-text">aria2c 16x Turbo</div>
            <div className="text-[10px] text-text-muted font-mono-code">-x 16 -s 16 -k 1M</div>
          </div>
        </label>

        <label className="flex items-center gap-2 rounded-xs border border-border bg-surface p-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={sponsorBlock}
            onChange={(e) => setSponsorBlock(e.target.checked)}
            className="accent-[#ff6a00]"
          />
          <div>
            <div className="font-bold text-text">SponsorBlock Cut</div>
            <div className="text-[10px] text-text-muted font-mono-code">--sponsorblock-remove</div>
          </div>
        </label>

        <label className="flex items-center gap-2 rounded-xs border border-border bg-surface p-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={embedSubs}
            onChange={(e) => setEmbedSubs(e.target.checked)}
            className="accent-[#ff6a00]"
          />
          <div>
            <div className="font-bold text-text">Embed English Subs</div>
            <div className="text-[10px] text-text-muted font-mono-code">--embed-subs en.*</div>
          </div>
        </label>

        <div className="rounded-xs border border-border bg-surface p-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useClipRange}
              onChange={(e) => setUseClipRange(e.target.checked)}
              className="accent-[#ff6a00]"
            />
            <span className="font-bold text-text">Timestamp Clip</span>
          </label>
          {useClipRange && (
            <input
              type="text"
              value={clipRange}
              onChange={(e) => setClipRange(e.target.value)}
              placeholder="01:15-03:45"
              className="mt-1.5 w-full rounded-xs border border-border bg-background px-2 py-1 font-mono-code text-[11px] text-accent"
            />
          )}
        </div>
      </div>

      {/* Generated Command Preview */}
      <div className="rounded-xs border border-border bg-background p-3 space-y-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1">
            Generated yt-dlp + FFmpeg + aria2c Command
          </div>
          <pre className="overflow-x-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-[11px] text-emerald-400 leading-relaxed">
            {commands.ytDlpCmd}
          </pre>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Standalone 16-Connection aria2c Command (Direct ISO / Archive Links)
          </div>
          <pre className="overflow-x-auto rounded-xs border border-border bg-surface p-2.5 font-mono-code text-[11px] text-text leading-relaxed">
            {commands.standaloneAria2c}
          </pre>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 17. 5-BAND PARAMETRIC EQ & .LRC LYRICS TIMESTAMP AUDIO STUDIO
 * ========================================================================== */
interface LrcLine {
  id: string;
  timeSec: number;
  text: string;
}

const EQ_PRESETS: Record<string, { gains: number[]; q: number; label: string }> = {
  harman: {
    label: "Harman Target Curve (Audiophile)",
    gains: [4.5, 1.0, -0.5, 3.0, 2.5],
    q: 1.1,
  },
  vshape: {
    label: "V-Shape Bass & Treble Punch",
    gains: [6.5, 2.0, -2.5, 4.0, 5.5],
    q: 1.0,
  },
  podcast: {
    label: "Podcast Vocal Clarity (High-Pass + Presence)",
    gains: [-6.0, -1.5, 4.0, 4.5, 1.5],
    q: 1.4,
  },
  flat: {
    label: "Late-Night Studio Reference Flat",
    gains: [0, 0, 0, 0, 0],
    q: 1.0,
  },
};

const BAND_META = [
  { freq: 60, name: "60Hz Sub-Bass", type: "lowshelf" as BiquadFilterType },
  { freq: 250, name: "250Hz Warmth", type: "peaking" as BiquadFilterType },
  { freq: 1000, name: "1kHz Presence", type: "peaking" as BiquadFilterType },
  { freq: 4000, name: "4kHz Clarity", type: "peaking" as BiquadFilterType },
  { freq: 12000, name: "12kHz Air", type: "highshelf" as BiquadFilterType },
];

function ParametricEqBinauralBeatsAudioStudio({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();

  const [gains, setGains] = useState<number[]>([4.5, 1.0, -0.5, 3.0, 2.5]);
  const [qFactor, setQFactor] = useState<number>(1.1);
  const [isPlayingEq, setIsPlayingEq] = useState<boolean>(false);

  // LRC Synchronized Lyrics state
  const [lrcLines, setLrcLines] = useState<LrcLine[]>([
    { id: "1", timeSec: 4.2, text: "Initializing parametric frequency synthesis..." },
    { id: "2", timeSec: 9.85, text: "Sub-bass 60Hz locked to Harman target curve" },
    { id: "3", timeSec: 15.4, text: "Synchronized LRC timestamps ready for export" },
  ]);
  const [newLyricText, setNewLyricText] = useState<string>("");
  const [stopwatchSec, setStopwatchSec] = useState<number>(18.5);
  const [stopwatchRunning, setStopwatchRunning] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);

  const stopAudioPreview = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
      filtersRef.current = [];
    }
    setIsPlayingEq(false);
  };

  useEffect(() => {
    if (resetTrigger > 0) {
      stopAudioPreview();
      setGains([4.5, 1.0, -0.5, 3.0, 2.5]);
      setQFactor(1.1);
      setStopwatchRunning(false);
      setStopwatchSec(18.5);
    }
  }, [resetTrigger]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Update live filter nodes when sliders move
  useEffect(() => {
    if (filtersRef.current.length === 5 && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      filtersRef.current.forEach((f, idx) => {
        f.gain.setTargetAtTime(gains[idx] ?? 0, now, 0.03);
        f.Q.setTargetAtTime(qFactor, now, 0.03);
      });
    }
  }, [gains, qFactor]);

  // Stopwatch ticker for LRC editor
  useEffect(() => {
    if (!stopwatchRunning) return;
    const id = setInterval(() => {
      setStopwatchSec((prev) => Number((prev + 0.1).toFixed(2)));
    }, 100);
    return () => clearInterval(id);
  }, [stopwatchRunning]);

  const toggleAudioPreview = () => {
    if (isPlayingEq) {
      stopAudioPreview();
      return;
    }
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;

    // Create rich harmonic drone chord (65Hz, 130Hz, 261.6Hz, 1046Hz, 4186Hz) so all 5 EQ bands are audible
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.12;

    const filterChain: BiquadFilterNode[] = BAND_META.map((band, i) => {
      const filter = ctx.createBiquadFilter();
      filter.type = band.type;
      filter.frequency.value = band.freq;
      filter.Q.value = qFactor;
      filter.gain.value = gains[i] ?? 0;
      return filter;
    });

    filtersRef.current = filterChain;

    // Connect chain
    for (let i = 0; i < filterChain.length - 1; i++) {
      filterChain[i].connect(filterChain[i + 1]);
    }
    filterChain[filterChain.length - 1].connect(masterGain);
    masterGain.connect(ctx.destination);

    const chordFreqs = [60, 250, 523.25, 1046.5, 4000, 10000];
    chordFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = idx < 2 ? "sawtooth" : "triangle";
      osc.frequency.value = freq;
      oscGain.gain.value = idx >= 4 ? 0.08 : 0.2;
      osc.connect(oscGain);
      oscGain.connect(filterChain[0]);
      osc.start();
    });

    setIsPlayingEq(true);
  };

  const formatLrcTimestamp = (sec: number) => {
    const safe = Math.max(0, sec);
    const mins = Math.floor(safe / 60);
    const remSec = (safe % 60).toFixed(2);
    return `[${String(mins).padStart(2, "0")}:${remSec.padStart(5, "0")}]`;
  };

  const lrcFormatted = useMemo(() => {
    return [...lrcLines]
      .sort((a, b) => a.timeSec - b.timeSec)
      .map((line) => `${formatLrcTimestamp(line.timeSec)} ${line.text}`)
      .join("\n");
  }, [lrcLines]);

  const eqApoConfig = useMemo(() => {
    const preamp = Math.min(0, -Math.max(...gains));
    const lines = [
      `Preamp: ${preamp.toFixed(1)} dB`,
      ...BAND_META.map((b, i) => {
        const typeCode = b.type === "lowshelf" ? "LSC" : b.type === "highshelf" ? "HSC" : "PK";
        return `Filter ${i + 1}: ON ${typeCode} Fc ${b.freq} Hz Gain ${(gains[i] ?? 0).toFixed(1)} dB Q ${qFactor.toFixed(2)}`;
      }),
    ];
    return lines.join("\n");
  }, [gains, qFactor]);

  useEffect(() => {
    setOutput(
      [
        `=== EQUALIZER APO / PEACE 5-BAND CONFIG ===`,
        eqApoConfig,
        ``,
        `=== SYNCHRONIZED .LRC LYRICS FILE ===`,
        lrcFormatted,
      ].join("\n")
    );
  }, [eqApoConfig, lrcFormatted, setOutput]);

  const handleStampLyric = () => {
    if (!newLyricText.trim()) return;
    setLrcLines((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        timeSec: stopwatchSec,
        text: newLyricText.trim(),
      },
    ]);
    setNewLyricText("");
  };

  const shiftTimestamps = (deltaSec: number) => {
    setLrcLines((prev) =>
      prev.map((item) => ({
        ...item,
        timeSec: Number(Math.max(0, item.timeSec + deltaSec).toFixed(2)),
      }))
    );
  };

  // SVG path points for 5 bands
  const svgPoints = gains
    .map((g, idx) => {
      const x = 40 + idx * 80;
      const y = 70 - g * 4.5;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-5 text-xs">
      {/* Studio Section A: 5-Band Parametric EQ */}
      <div className="rounded-xs border border-border bg-surface p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-accent" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              (A) 5-Band Parametric Equalizer & WebAudio Synth Preview
            </span>
          </div>

          <button
            type="button"
            onClick={toggleAudioPreview}
            className={`inline-flex items-center gap-1.5 rounded-xs px-3 py-1.5 font-heading text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
              isPlayingEq
                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                : "bg-[#ff6a00] text-white"
            }`}
          >
            {isPlayingEq ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {isPlayingEq ? "Stop WebAudio Synth" : "Preview Live EQ Synth"}
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(EQ_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setGains([...preset.gains]);
                setQFactor(preset.q);
              }}
              className="rounded-xs border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-text hover:border-accent transition cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* SVG Frequency Response Curve */}
        <div className="rounded-xs border border-border bg-background p-2">
          <svg viewBox="0 0 400 140" className="w-full h-28">
            <line x1="20" y1="70" x2="380" y2="70" stroke="#3f3f46" strokeDasharray="4 4" />
            <polyline
              fill="none"
              stroke="#ff6a00"
              strokeWidth="2.5"
              points={svgPoints}
            />
            {gains.map((g, idx) => {
              const x = 40 + idx * 80;
              const y = 70 - g * 4.5;
              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r="4.5" fill="#ff6a00" />
                  <text
                    x={x}
                    y={130}
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize="9"
                  >
                    {BAND_META[idx].name.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 5 Band Sliders */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {BAND_META.map((band, idx) => (
            <div
              key={band.freq}
              className="rounded-xs border border-border bg-background p-2.5 text-center"
            >
              <div className="font-bold text-text text-[11px]">{band.name}</div>
              <div className="font-mono-code text-accent font-bold my-1">
                {(gains[idx] ?? 0) > 0 ? `+${gains[idx]}` : gains[idx]} dB
              </div>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={gains[idx] ?? 0}
                onChange={(e) => {
                  const next = [...gains];
                  next[idx] = Number(e.target.value);
                  setGains(next);
                }}
                className="w-full accent-[#ff6a00]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Studio Section B: .LRC Timestamp Editor */}
      <div className="rounded-xs border border-border bg-surface p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-accent" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              (B) .LRC Synchronized Lyrics Timestamp Editor
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono-code text-sm font-bold text-accent">
              {formatLrcTimestamp(stopwatchSec)}
            </span>
            <button
              type="button"
              onClick={() => setStopwatchRunning((r) => !r)}
              className="rounded-xs border border-border bg-background px-2.5 py-1 font-heading text-[10px] font-bold uppercase text-text hover:border-accent cursor-pointer"
            >
              {stopwatchRunning ? "Pause Clock" : "Run Clock"}
            </button>
            <button
              type="button"
              onClick={() => shiftTimestamps(-0.5)}
              className="rounded-xs border border-border bg-background px-2 py-1 font-mono-code text-[10px] text-text-muted hover:text-text cursor-pointer"
            >
              -500ms All
            </button>
            <button
              type="button"
              onClick={() => shiftTimestamps(0.5)}
              className="rounded-xs border border-border bg-background px-2 py-1 font-mono-code text-[10px] text-text-muted hover:text-text cursor-pointer"
            >
              +500ms All
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newLyricText}
            onChange={(e) => setNewLyricText(e.target.value)}
            placeholder="Type lyric line and click Stamp at Current Time..."
            className="flex-1 rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
          <button
            type="button"
            onClick={handleStampLyric}
            className="inline-flex items-center gap-1 rounded-xs bg-[#ff6a00] px-3 py-1.5 font-heading text-[11px] font-bold uppercase text-white cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Stamp {formatLrcTimestamp(stopwatchSec)}
          </button>
        </div>

        <pre className="rounded-xs border border-border bg-background p-2.5 font-mono-code text-[11px] text-emerald-400">
          {lrcFormatted}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 18. BOX BREATHING PACER & BINAURAL THETA THERAPY STUDIO
 * ========================================================================== */
const BREATH_MODES = {
  "box-4444": {
    name: "4-4-4-4 Navy SEAL Box Breathing",
    phases: [
      { label: "Inhale Slowly", sec: 4, scale: 1.35 },
      { label: "Hold Full Lungs", sec: 4, scale: 1.35 },
      { label: "Exhale Steadily", sec: 4, scale: 0.75 },
      { label: "Hold Empty Lungs", sec: 4, scale: 0.75 },
    ],
  },
  "sleep-478": {
    name: "4-7-8 Parasympathetic Sleep Induction",
    phases: [
      { label: "Quiet Nasal Inhale", sec: 4, scale: 1.35 },
      { label: "Deep Diaphragm Hold", sec: 7, scale: 1.35 },
      { label: "Whoosh Mouth Exhale", sec: 8, scale: 0.75 },
    ],
  },
  "coherent-55": {
    name: "5.5s Coherent Heart Rate Variability (HRV)",
    phases: [
      { label: "Coherent Inhale", sec: 5.5, scale: 1.35 },
      { label: "Coherent Exhale", sec: 5.5, scale: 0.75 },
    ],
  },
};

const BINAURAL_BANDS = {
  delta: { label: "Delta 2Hz — Deep Restorative Sleep", deltaHz: 2 },
  theta: { label: "Theta 6Hz — Deep Meditation & REM", deltaHz: 6 },
  alpha: { label: "Alpha 10Hz — Calm Flow State Focus", deltaHz: 10 },
  gamma: { label: "Gamma 40Hz — Peak Synaptic Cognition", deltaHz: 40 },
};

function BoxBreathingBinauralThetaTherapyStudio({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();

  const [breathKey, setBreathKey] = useState<keyof typeof BREATH_MODES>("box-4444");
  const [binauralKey, setBinauralKey] = useState<keyof typeof BINAURAL_BANDS>("theta");
  const [baseCarrierHz, setBaseCarrierHz] = useState<number>(200);
  const [phaseIdx, setPhaseIdx] = useState<number>(0);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [binauralPlaying, setBinauralPlaying] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);

  const stopBinaural = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
      leftOscRef.current = null;
      rightOscRef.current = null;
    }
    setBinauralPlaying(false);
  };

  useEffect(() => {
    if (resetTrigger > 0) {
      stopBinaural();
      setBreathKey("box-4444");
      setBinauralKey("theta");
      setBaseCarrierHz(200);
      setPhaseIdx(0);
      setCyclesCompleted(0);
    }
  }, [resetTrigger]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const currentBreath = BREATH_MODES[breathKey];
  const activePhase = currentBreath.phases[phaseIdx % currentBreath.phases.length];
  const currentBinaural = BINAURAL_BANDS[binauralKey];

  // Advance breathing phases automatically
  useEffect(() => {
    const durationMs = activePhase.sec * 1000;
    const timer = setTimeout(() => {
      setPhaseIdx((prev) => {
        const next = (prev + 1) % currentBreath.phases.length;
        if (next === 0) {
          setCyclesCompleted((c) => c + 1);
        }
        return next;
      });
    }, durationMs);
    return () => clearTimeout(timer);
  }, [phaseIdx, breathKey, activePhase.sec, currentBreath.phases.length]);

  // Update live oscillator frequencies when carrier or beat changes
  useEffect(() => {
    if (audioCtxRef.current && leftOscRef.current && rightOscRef.current) {
      const now = audioCtxRef.current.currentTime;
      leftOscRef.current.frequency.setTargetAtTime(baseCarrierHz, now, 0.05);
      rightOscRef.current.frequency.setTargetAtTime(
        baseCarrierHz + currentBinaural.deltaHz,
        now,
        0.05
      );
    }
  }, [baseCarrierHz, currentBinaural.deltaHz]);

  const toggleBinauralAudio = () => {
    if (binauralPlaying) {
      stopBinaural();
      return;
    }
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.15;
    masterGain.connect(ctx.destination);

    const leftPan = ctx.createStereoPanner();
    leftPan.pan.value = -1;
    leftPan.connect(masterGain);

    const rightPan = ctx.createStereoPanner();
    rightPan.pan.value = 1;
    rightPan.connect(masterGain);

    const leftOsc = ctx.createOscillator();
    leftOsc.type = "sine";
    leftOsc.frequency.value = baseCarrierHz;
    leftOsc.connect(leftPan);
    leftOsc.start();

    const rightOsc = ctx.createOscillator();
    rightOsc.type = "sine";
    rightOsc.frequency.value = baseCarrierHz + currentBinaural.deltaHz;
    rightOsc.connect(rightPan);
    rightOsc.start();

    leftOscRef.current = leftOsc;
    rightOscRef.current = rightOsc;
    setBinauralPlaying(true);
  };

  useEffect(() => {
    const totalCycleSec = currentBreath.phases.reduce((a, b) => a + b.sec, 0);
    const breathsPerMin = (60 / totalCycleSec).toFixed(2);
    setOutput(
      [
        `=== AUTONOMIC BREATHWORK & BINAURAL NEURO-ACOUSTIC SESSION ===`,
        `Breathing Cadence: ${currentBreath.name}`,
        `Total Cycle Duration: ${totalCycleSec}s (${breathsPerMin} breaths/minute)`,
        `Completed Breath Cycles: ${cyclesCompleted}`,
        `Binaural Entrainment Band: ${currentBinaural.label}`,
        `Left Ear Carrier Frequency: ${baseCarrierHz} Hz (Hard Pan -1.0)`,
        `Right Ear Offset Frequency: ${baseCarrierHz + currentBinaural.deltaHz} Hz (Hard Pan +1.0)`,
        `Perceived Superior Olivary Beat: ${currentBinaural.deltaHz} Hz`,
      ].join("\n")
    );
  }, [currentBreath, cyclesCompleted, currentBinaural, baseCarrierHz, setOutput]);

  return (
    <div className="space-y-5 text-xs">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Guided Breathing Protocol
          </label>
          <select
            value={breathKey}
            onChange={(e) => {
              setBreathKey(e.target.value as keyof typeof BREATH_MODES);
              setPhaseIdx(0);
            }}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          >
            {Object.entries(BREATH_MODES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Binaural Brainwave Entrainment Band
          </label>
          <select
            value={binauralKey}
            onChange={(e) => setBinauralKey(e.target.value as keyof typeof BINAURAL_BANDS)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          >
            {Object.entries(BINAURAL_BANDS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Left Ear Carrier: <span className="text-accent">{baseCarrierHz} Hz</span> | Right:{" "}
            <span className="text-emerald-400">{baseCarrierHz + currentBinaural.deltaHz} Hz</span>
          </label>
          <input
            type="range"
            min={140}
            max={320}
            step={10}
            value={baseCarrierHz}
            onChange={(e) => setBaseCarrierHz(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>
      </div>

      {/* Animated SVG Pacer + Stereo Binaural Controller */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center rounded-xs border border-border bg-surface p-4">
        <div className="flex flex-col items-center justify-center py-2">
          <svg viewBox="0 0 200 200" className="h-44 w-44">
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="#27272a"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <circle
              cx="100"
              cy="100"
              r={48 * activePhase.scale}
              fill="rgba(255, 106, 0, 0.14)"
              stroke="#ff6a00"
              strokeWidth="3"
              style={{
                transition: `r ${activePhase.sec}s ease-in-out`,
              }}
            />
            <text
              x="100"
              y="96"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="bold"
            >
              {activePhase.label}
            </text>
            <text
              x="100"
              y="115"
              textAnchor="middle"
              fill="#ff6a00"
              fontSize="13"
              fontFamily="monospace"
            >
              {activePhase.sec}s Phase
            </text>
          </svg>
          <div className="text-[11px] text-text-muted font-mono-code mt-1">
            Completed Cycles: <span className="text-text font-bold">{cyclesCompleted}</span>
          </div>
        </div>

        <div className="space-y-3 rounded-xs border border-border bg-background p-3.5">
          <div className="flex items-center gap-2 font-heading text-xs font-bold uppercase text-text">
            <Wind className="h-4 w-4 text-accent" />
            Stereo WebAudio Binaural Beat Synthesizer
          </div>
          <p className="text-text-muted text-[11px] leading-relaxed">
            Plays a pure phase-locked <span className="font-mono-code text-text">{baseCarrierHz}Hz</span>{" "}
            sine wave in the Left channel and{" "}
            <span className="font-mono-code text-text">
              {baseCarrierHz + currentBinaural.deltaHz}Hz
            </span>{" "}
            in the Right channel, producing a{" "}
            <span className="font-mono-code text-accent font-bold">
              {currentBinaural.deltaHz}Hz
            </span>{" "}
            binaural wave.
          </p>

          <button
            type="button"
            onClick={toggleBinauralAudio}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xs px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              binauralPlaying
                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                : "bg-[#ff6a00] text-white"
            }`}
          >
            {binauralPlaying ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {binauralPlaying
              ? "Stop Stereo Binaural Generator"
              : `Start ${currentBinaural.deltaHz}Hz Stereo Binaural Tone`}
          </button>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 19. WET-BULB TEMPERATURE, SNOW PROBABILITY & SEVERE WEATHER LAB
 * ========================================================================== */
function WetBulbSnowProbabilityWeatherAlertLab({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();

  const [tempC, setTempC] = useState<number>(34.0);
  const [rhPct, setRhPct] = useState<number>(68);
  const [pressureHpa, setPressureHpa] = useState<number>(1013.25);
  const [elevationM, setElevationM] = useState<number>(250);

  useEffect(() => {
    if (resetTrigger > 0) {
      setTempC(34.0);
      setRhPct(68);
      setPressureHpa(1013.25);
      setElevationM(250);
    }
  }, [resetTrigger]);

  const weather = useMemo(() => {
    const T = tempC;
    const RH = Math.min(100, Math.max(1, rhPct));

    // Stull (2011) Empirical Wet-Bulb Formula (valid for -20°C to 50°C)
    const wetBulbC =
      T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
      Math.atan(T + RH) -
      Math.atan(RH - 1.676331) +
      0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
      4.686035;

    // Magnus-Tetens Dew Point
    const a = 17.625;
    const b = 243.04;
    const alpha = Math.log(RH / 100) + (a * T) / (b + T);
    const dewPointC = (b * alpha) / (a - alpha);

    // Heat Stress Danger Tier based on Wet-Bulb Temperature
    let heatDanger = "Safe / Normal Thermoregulation";
    let iosAlertTier = "Normal Conditions";
    if (wetBulbC >= 35.0) {
      heatDanger = "LETHAL THRESHOLD (>= 35°C Tw — Human Evaporative Cooling Fails)";
      iosAlertTier = "EXTREME HEAT EMERGENCY (iOS Critical Government Alert)";
    } else if (wetBulbC >= 31.0) {
      heatDanger = "Extreme Danger (Heatstroke Imminent on Exertion)";
      iosAlertTier = "Excessive Heat Warning (iOS Severe Weather Push)";
    } else if (wetBulbC >= 28.0) {
      heatDanger = "High Risk (Mandatory Hydration & Shade Rest Cycles)";
      iosAlertTier = "Heat Advisory Notification";
    } else if (wetBulbC <= 0.5) {
      heatDanger = "Sub-Freezing / Winter Precipitation Regime";
      iosAlertTier = "Winter Weather / Snowfall Advisory";
    }

    // Rain-vs-Snow Probability based on Wet-Bulb (Snow highly probable when Tw < 0.5°C)
    const snowProbPct =
      wetBulbC <= -2.0
        ? 99
        : wetBulbC >= 3.5
        ? 0
        : Math.round(100 / (1 + Math.exp(1.85 * (wetBulbC - 0.5))));

    // Freezing level altitude (0°C isotherm using standard lapse rate 6.5°C / 1000m)
    const freezingAltitudeM =
      T <= 0 ? elevationM : Math.round(elevationM + (T / 6.5) * 1000);

    const toF = (c: number) => (c * 9) / 5 + 32;

    return {
      wetBulbC,
      wetBulbF: toF(wetBulbC),
      dewPointC,
      dewPointF: toF(dewPointC),
      tempF: toF(T),
      heatDanger,
      iosAlertTier,
      snowProbPct,
      freezingAltitudeM,
    };
  }, [tempC, rhPct, elevationM]);

  useEffect(() => {
    setOutput(
      [
        `=== PSYCHROMETRIC WET-BULB & SEVERE WEATHER TELEMETRY ===`,
        `Ambient Dry-Bulb Temp: ${tempC.toFixed(1)} °C (${weather.tempF.toFixed(1)} °F)`,
        `Relative Humidity: ${rhPct}% | Barometric Pressure: ${pressureHpa} hPa | Elevation: ${elevationM} m`,
        `---------------------------------------------------------`,
        `Wet-Bulb Temperature (Stull Formula): ${weather.wetBulbC.toFixed(2)} °C (${weather.wetBulbF.toFixed(2)} °F)`,
        `Dew Point Temperature: ${weather.dewPointC.toFixed(2)} °C (${weather.dewPointF.toFixed(2)} °F)`,
        `Thermoregulation Heat Stress Status: ${weather.heatDanger}`,
        `Rain-vs-Snow Probability: ${weather.snowProbPct}% Snow / ${100 - weather.snowProbPct}% Rain`,
        `Estimated Freezing Level (0°C Isotherm): ${weather.freezingAltitudeM.toLocaleString()} m ASL`,
        `iOS Severe Weather Alert Classification: ${weather.iosAlertTier}`,
      ].join("\n")
    );
  }, [tempC, rhPct, pressureHpa, elevationM, weather, setOutput]);

  return (
    <div className="space-y-5 text-xs">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setTempC(38);
            setRhPct(72);
            setPressureHpa(1006);
          }}
          className="rounded-xs border border-border bg-surface px-2.5 py-1 text-[11px] hover:border-accent cursor-pointer"
        >
          Persian Gulf Heat Dome (38°C / 72% RH)
        </button>
        <button
          type="button"
          onClick={() => {
            setTempC(2.2);
            setRhPct(42);
            setPressureHpa(1018);
          }}
          className="rounded-xs border border-border bg-surface px-2.5 py-1 text-[11px] hover:border-accent cursor-pointer"
        >
          Evaporative Snow Cooling (2.2°C Dry-Bulb / 42% RH → Sub-0.5°C Tw)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Ambient Temperature (°C)
          </label>
          <input
            type="number"
            step="0.5"
            value={tempC}
            onChange={(e) => setTempC(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Relative Humidity: <span className="text-accent">{rhPct}%</span>
          </label>
          <input
            type="range"
            min={5}
            max={100}
            value={rhPct}
            onChange={(e) => setRhPct(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Barometric Pressure (hPa)
          </label>
          <input
            type="number"
            step="1"
            value={pressureHpa}
            onChange={(e) => setPressureHpa(Number(e.target.value) || 1013)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Station Elevation (m ASL)
          </label>
          <input
            type="number"
            step="50"
            value={elevationM}
            onChange={(e) => setElevationM(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>
      </div>

      {/* Output Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted flex items-center gap-1">
            <Thermometer className="h-3 w-3 text-accent" />
            Wet-Bulb Temp (Tw)
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-accent">
            {weather.wetBulbC.toFixed(2)} °C
          </div>
          <div className="text-[11px] text-text-muted">
            {weather.wetBulbF.toFixed(1)} °F (Stull Formula)
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Dew Point</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            {weather.dewPointC.toFixed(2)} °C
          </div>
          <div className="text-[11px] text-text-muted">
            {weather.dewPointF.toFixed(1)} °F Saturation
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted flex items-center gap-1">
            <CloudSnow className="h-3 w-3 text-sky-400" />
            Snow Probability
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-sky-400">
            {weather.snowProbPct}%
          </div>
          <div className="text-[11px] text-text-muted">
            {weather.wetBulbC < 0.5 ? "Tw < 0.5°C Snow Regime" : "Rain Dominant"}
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Freezing Level (0°C)</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-emerald-400">
            {weather.freezingAltitudeM.toLocaleString()} m
          </div>
          <div className="text-[11px] text-text-muted">ISA 6.5°C/km Lapse</div>
        </div>
      </div>

      <div className="rounded-xs border border-border bg-background p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase font-bold text-text-muted">
            Heat Stress & iOS Severe Weather Trigger
          </div>
          <div className="font-heading font-bold text-text mt-0.5">{weather.heatDanger}</div>
        </div>
        <span className="rounded-xs border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono-code text-[11px] text-accent">
          {weather.iosAlertTier}
        </span>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 20. POMODORO TIMER, ANKI SPACED REPETITION & GPA STUDIO
 * ========================================================================== */
interface CourseRow {
  name: string;
  credits: number;
  gradePoints: number;
  weightBonus: number;
}

function PomodoroSpacedRepetitionAnkiGpaStudio({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();

  // (A) SuperMemo SM-2 / Anki state
  const [ef, setEf] = useState<number>(2.5);
  const [qualityGrade, setQualityGrade] = useState<number>(4);

  // (B) GPA courses
  const [courses, setCourses] = useState<CourseRow[]>([
    { name: "AP Calculus BC", credits: 4, gradePoints: 4.0, weightBonus: 1.0 },
    { name: "Honors Data Structures", credits: 4, gradePoints: 3.7, weightBonus: 0.5 },
    { name: "Discrete Mathematics", credits: 3, gradePoints: 4.0, weightBonus: 0.0 },
    { name: "Systems Architecture", credits: 3, gradePoints: 3.3, weightBonus: 0.0 },
  ]);

  // (C) Pomodoro Focus Timer
  const [pomoMode, setPomoMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [pomoRunning, setPomoRunning] = useState<boolean>(false);

  useEffect(() => {
    if (resetTrigger > 0) {
      setEf(2.5);
      setQualityGrade(4);
      setPomoRunning(false);
      setPomoMode("focus");
      setSecondsLeft(25 * 60);
    }
  }, [resetTrigger]);

  useEffect(() => {
    if (!pomoRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [pomoRunning]);

  // SM-2 Schedule Calculation across 6 repetitions
  const sm2Schedule = useMemo(() => {
    const q = qualityGrade;
    const updatedEf = Math.max(
      1.3,
      ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    );

    const intervals: { rep: number; intervalDays: number; cumulativeDay: number }[] = [];
    let prevInterval = 1;
    let cumDay = 0;

    for (let rep = 1; rep <= 6; rep++) {
      let interval = 1;
      if (q < 3) {
        interval = 1; // Lapse reset
      } else if (rep === 1) {
        interval = 1;
      } else if (rep === 2) {
        interval = 6;
      } else {
        interval = Math.min(180, Math.round(prevInterval * updatedEf));
      }
      prevInterval = interval;
      cumDay += interval;
      intervals.push({ rep, intervalDays: interval, cumulativeDay: cumDay });
    }

    return { updatedEf, intervals };
  }, [ef, qualityGrade]);

  // GPA Calculation
  const gpaStats = useMemo(() => {
    const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0) || 1;
    const unweightedPts = courses.reduce((acc, c) => acc + c.credits * c.gradePoints, 0);
    const weightedPts = courses.reduce(
      (acc, c) => acc + c.credits * (c.gradePoints + c.weightBonus),
      0
    );
    return {
      totalCredits,
      unweightedGpa: unweightedPts / totalCredits,
      weightedGpa: weightedPts / totalCredits,
    };
  }, [courses]);

  useEffect(() => {
    setOutput(
      [
        `=== STUDENT PRODUCTIVITY ENGINE: SM-2 ANKI + GPA + POMODORO ===`,
        `[A] SuperMemo SM-2 Spaced Repetition (Initial EF=${ef.toFixed(2)}, Recall Quality q=${qualityGrade}/5):`,
        `Updated Easiness Factor (EF'): ${sm2Schedule.updatedEf.toFixed(2)}`,
        ...sm2Schedule.intervals.map(
          (item) =>
            `  Review #${item.rep}: +${item.intervalDays}d interval (Day ${item.cumulativeDay})`
        ),
        ``,
        `[B] Cumulative GPA Summary (${gpaStats.totalCredits} Total Credits):`,
        `  Unweighted GPA (4.0 Scale): ${gpaStats.unweightedGpa.toFixed(2)}`,
        `  Weighted GPA (5.0 AP/Honors Scale): ${gpaStats.weightedGpa.toFixed(2)}`,
      ].join("\n")
    );
  }, [ef, qualityGrade, sm2Schedule, gpaStats, setOutput]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="space-y-5 text-xs">
      {/* (A) SuperMemo SM-2 Calculator */}
      <div className="rounded-xs border border-border bg-surface p-3.5 space-y-3">
        <div className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-text">
          <GraduationCap className="h-4 w-4 text-accent" />
          (A) SuperMemo SM-2 / Anki Spaced Repetition Interval Plotter
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">
              Card Easiness Factor (EF): <span className="text-accent">{ef.toFixed(2)}</span>{" "}
              → New EF&apos;:{" "}
              <span className="text-emerald-400">{sm2Schedule.updatedEf.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={1.3}
              max={3.0}
              step={0.05}
              value={ef}
              onChange={(e) => setEf(Number(e.target.value))}
              className="w-full accent-[#ff6a00]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">
              Recall Quality Grade (q = 0–5)
            </label>
            <select
              value={qualityGrade}
              onChange={(e) => setQualityGrade(Number(e.target.value))}
              className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
            >
              <option value={5}>5 — Perfect Instant Recall (Easy)</option>
              <option value={4}>4 — Correct after Brief Hesitation (Good)</option>
              <option value={3}>3 — Correct with Serious Difficulty (Hard)</option>
              <option value={2}>2 — Incorrect, but Remembered Answer Easily (Lapse)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          {sm2Schedule.intervals.map((item) => (
            <div
              key={item.rep}
              className="rounded-xs border border-border bg-background p-2 text-center font-mono-code"
            >
              <div className="text-[10px] text-text-muted">Review #{item.rep}</div>
              <div className="text-sm font-bold text-accent">+{item.intervalDays}d</div>
              <div className="text-[10px] text-text-muted">Day {item.cumulativeDay}</div>
            </div>
          ))}
        </div>
      </div>

      {/* (B) GPA + (C) Pomodoro side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xs border border-border bg-surface p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              (B) Weighted & Unweighted Cumulative GPA
            </span>
            <div className="flex gap-3 font-mono-code text-xs">
              <span>
                Unweighted:{" "}
                <strong className="text-text">{gpaStats.unweightedGpa.toFixed(2)}</strong>
              </span>
              <span>
                Weighted:{" "}
                <strong className="text-accent">{gpaStats.weightedGpa.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {courses.map((course, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={course.name}
                  onChange={(e) => {
                    const next = [...courses];
                    next[idx] = { ...course, name: e.target.value };
                    setCourses(next);
                  }}
                  className="col-span-5 rounded-xs border border-border bg-background px-2 py-1 text-text"
                />
                <select
                  value={course.gradePoints}
                  onChange={(e) => {
                    const next = [...courses];
                    next[idx] = { ...course, gradePoints: Number(e.target.value) };
                    setCourses(next);
                  }}
                  className="col-span-3 rounded-xs border border-border bg-background px-2 py-1 text-text font-mono-code"
                >
                  <option value={4.0}>A (4.0)</option>
                  <option value={3.7}>A- (3.7)</option>
                  <option value={3.3}>B+ (3.3)</option>
                  <option value={3.0}>B (3.0)</option>
                  <option value={2.7}>B- (2.7)</option>
                </select>
                <select
                  value={course.weightBonus}
                  onChange={(e) => {
                    const next = [...courses];
                    next[idx] = { ...course, weightBonus: Number(e.target.value) };
                    setCourses(next);
                  }}
                  className="col-span-4 rounded-xs border border-border bg-background px-2 py-1 text-text"
                >
                  <option value={0}>Regular (+0.0)</option>
                  <option value={0.5}>Honors (+0.5)</option>
                  <option value={1.0}>AP / IB (+1.0)</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* (C) Pomodoro Timer */}
        <div className="rounded-xs border border-border bg-surface p-3.5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-accent" />
              (C) 25/5 Pomodoro
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => {
                  setPomoRunning(false);
                  setPomoMode("focus");
                  setSecondsLeft(25 * 60);
                }}
                className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase cursor-pointer ${
                  pomoMode === "focus" ? "bg-[#ff6a00] text-white" : "bg-background text-text-muted"
                }`}
              >
                25m Focus
              </button>
              <button
                type="button"
                onClick={() => {
                  setPomoRunning(false);
                  setPomoMode("break");
                  setSecondsLeft(5 * 60);
                }}
                className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase cursor-pointer ${
                  pomoMode === "break" ? "bg-emerald-600 text-white" : "bg-background text-text-muted"
                }`}
              >
                5m Break
              </button>
            </div>
          </div>

          <div className="text-center py-2 font-mono-code text-3xl font-bold text-accent">
            {mins}:{secs}
          </div>

          <button
            type="button"
            onClick={() => setPomoRunning((r) => !r)}
            className="w-full rounded-xs bg-[#ff6a00] py-2 font-heading text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
          >
            {pomoRunning ? "Pause Focus Clock" : "Start Pomodoro Timer"}
          </button>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 21. ANIME, K-DRAMA & SERIES BINGE FILLER WATCH-TIME CALCULATOR
 * ========================================================================== */
function AnimeKdramaBingeFillerWatchTimeCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();

  const [seriesName, setSeriesName] = useState<string>("One Piece (1120+ eps)");
  const [totalEpisodes, setTotalEpisodes] = useState<number>(1120);
  const [epDurationMin, setEpDurationMin] = useState<number>(24);
  const [skipIntroOutroMin, setSkipIntroOutroMin] = useState<number>(3.5);
  const [fillerPct, setFillerPct] = useState<number>(10);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.25);
  const [dailyHours, setDailyHours] = useState<number>(3);

  useEffect(() => {
    if (resetTrigger > 0) {
      setSeriesName("One Piece (1120+ eps)");
      setTotalEpisodes(1120);
      setEpDurationMin(24);
      setSkipIntroOutroMin(3.5);
      setFillerPct(10);
      setPlaybackSpeed(1.25);
      setDailyHours(3);
    }
  }, [resetTrigger]);

  const applyPreset = (
    name: string,
    eps: number,
    dur: number,
    skip: number,
    filler: number
  ) => {
    setSeriesName(name);
    setTotalEpisodes(eps);
    setEpDurationMin(dur);
    setSkipIntroOutroMin(skip);
    setFillerPct(filler);
  };

  const stats = useMemo(() => {
    const rawTotalHours = (totalEpisodes * epDurationMin) / 60;
    const fillerEpisodes = Math.round(totalEpisodes * (fillerPct / 100));
    const canonEpisodes = Math.max(1, totalEpisodes - fillerEpisodes);

    const netEpDurationMin = Math.max(1, epDurationMin - skipIntroOutroMin);
    const canonHoursAt1x = (canonEpisodes * netEpDurationMin) / 60;
    const netWatchHours = canonHoursAt1x / playbackSpeed;

    const hoursSavedByFiller = (fillerEpisodes * epDurationMin) / 60;
    const hoursSavedByIntroSkip = (canonEpisodes * skipIntroOutroMin) / 60;
    const hoursSavedBySpeed = canonHoursAt1x - netWatchHours;
    const totalHoursSaved = rawTotalHours - netWatchHours;

    const daysToFinish = Math.ceil(netWatchHours / Math.max(0.5, dailyHours));

    return {
      rawTotalHours,
      fillerEpisodes,
      canonEpisodes,
      netWatchHours,
      hoursSavedByFiller,
      hoursSavedByIntroSkip,
      hoursSavedBySpeed,
      totalHoursSaved,
      daysToFinish,
    };
  }, [totalEpisodes, epDurationMin, skipIntroOutroMin, fillerPct, playbackSpeed, dailyHours]);

  useEffect(() => {
    setOutput(
      [
        `=== ANIME & K-DRAMA BINGE WATCH-TIME BREAKDOWN ===`,
        `Series Preset: ${seriesName}`,
        `Total Episodes: ${totalEpisodes} (${stats.canonEpisodes} Canon / ${stats.fillerEpisodes} Filler @ ${fillerPct}%)`,
        `Episode Runtime: ${epDurationMin}m (Skipping ${skipIntroOutroMin}m OP/ED Recap per episode)`,
        `Playback Speed: ${playbackSpeed}x | Daily Commitment: ${dailyHours} hrs/day`,
        `--------------------------------------------------`,
        `Raw Unedited Watch Time: ${stats.rawTotalHours.toFixed(1)} Hours`,
        `Optimized Net Watch Time: ${stats.netWatchHours.toFixed(1)} Hours`,
        `Total Time Saved: ${stats.totalHoursSaved.toFixed(1)} Hours (Filler: -${stats.hoursSavedByFiller.toFixed(1)}h, Intros: -${stats.hoursSavedByIntroSkip.toFixed(1)}h, Speed: -${stats.hoursSavedBySpeed.toFixed(1)}h)`,
        `Estimated Days to Finish: ${stats.daysToFinish} Days`,
      ].join("\n")
    );
  }, [
    seriesName,
    totalEpisodes,
    epDurationMin,
    skipIntroOutroMin,
    fillerPct,
    playbackSpeed,
    dailyHours,
    stats,
    setOutput,
  ]);

  return (
    <div className="space-y-5 text-xs">
      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => applyPreset("One Piece (1120+ eps)", 1120, 24, 4.0, 10)}
          className="rounded-xs border border-border bg-surface px-2.5 py-1 text-[11px] hover:border-accent cursor-pointer"
        >
          One Piece (1120 eps / 10% Filler)
        </button>
        <button
          type="button"
          onClick={() => applyPreset("Naruto Shippuden (500 eps)", 500, 24, 3.5, 41)}
          className="rounded-xs border border-border bg-surface px-2.5 py-1 text-[11px] hover:border-accent cursor-pointer"
        >
          Naruto Shippuden (500 eps / 41% Filler)
        </button>
        <button
          type="button"
          onClick={() => applyPreset("Bleach (366 eps)", 366, 24, 3.5, 45)}
          className="rounded-xs border border-border bg-surface px-2.5 py-1 text-[11px] hover:border-accent cursor-pointer"
        >
          Bleach (366 eps / 45% Filler)
        </button>
        <button
          type="button"
          onClick={() => applyPreset("16-Episode K-Drama", 16, 70, 2.0, 0)}
          className="rounded-xs border border-border bg-surface px-2.5 py-1 text-[11px] hover:border-accent cursor-pointer"
        >
          16-Episode K-Drama (70m / 0% Filler)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Total Episodes
          </label>
          <input
            type="number"
            min={1}
            max={3000}
            value={totalEpisodes}
            onChange={(e) => setTotalEpisodes(Math.max(1, Number(e.target.value) || 1))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Episode Duration (Minutes)
          </label>
          <select
            value={epDurationMin}
            onChange={(e) => setEpDurationMin(Number(e.target.value))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          >
            <option value={24}>24 min (Standard TV Anime)</option>
            <option value={45}>45 min (Western / Donghua Special)</option>
            <option value={70}>70 min (tvN / Netflix K-Drama)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Skip Intro / Outro / Recap (Min)
          </label>
          <input
            type="number"
            step="0.5"
            min={0}
            max={10}
            value={skipIntroOutroMin}
            onChange={(e) => setSkipIntroOutroMin(Math.max(0, Number(e.target.value) || 0))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Filler Episode Percentage: <span className="text-accent">{fillerPct}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={45}
            value={fillerPct}
            onChange={(e) => setFillerPct(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Playback Speed Multiplier
          </label>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          >
            <option value={1}>1.0x Normal Speed</option>
            <option value={1.25}>1.25x Crisp Binge Speed</option>
            <option value={1.5}>1.5x Fast Marathon</option>
            <option value={2}>2.0x Speedrun</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Daily Watch Budget (Hours/Day)
          </label>
          <input
            type="number"
            step="0.5"
            min={0.5}
            max={16}
            value={dailyHours}
            onChange={(e) => setDailyHours(Math.max(0.5, Number(e.target.value) || 1))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted flex items-center gap-1">
            <Tv className="h-3 w-3 text-accent" />
            Net Watch Hours
          </div>
          <div className="mt-1 font-mono-code text-lg font-bold text-accent">
            {stats.netWatchHours.toFixed(1)} hrs
          </div>
          <div className="text-[11px] text-text-muted">
            Down from {stats.rawTotalHours.toFixed(1)} raw hrs
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Total Hours Saved</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-emerald-400">
            {stats.totalHoursSaved.toFixed(1)} hrs
          </div>
          <div className="text-[11px] text-text-muted">
            Filler -{stats.hoursSavedByFiller.toFixed(0)}h / OP -{stats.hoursSavedByIntroSkip.toFixed(0)}h
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Canon Episodes</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            {stats.canonEpisodes} eps
          </div>
          <div className="text-[11px] text-text-muted">
            Skipped {stats.fillerEpisodes} filler eps
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Days to Finish</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-accent">
            {stats.daysToFinish} Days
          </div>
          <div className="text-[11px] text-text-muted">@ {dailyHours} hrs/day</div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 22. A2P SMS GSM-7 vs UCS-2 UNICODE SEGMENT & COST CALCULATOR
 * ========================================================================== */
const GSM7_BASIC = new Set(
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà".split(
    ""
  )
);
const GSM7_EXTENDED = new Set("|^€{}[]~\\".split(""));

function A2pSmsGsm7Ucs2SegmentCostCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();

  const [smsText, setSmsText] = useState<string>(
    "Hi Alex! Your Zero’s Universe Flash Sale code “ZERO50” is live — save 50% before midnight 🚀 https://zerosuniverse.com"
  );
  const [monthlyVolume, setMonthlyVolume] = useState<number>(100000);
  const [costPerSegmentUsd, setCostPerSegmentUsd] = useState<number>(0.0079);

  useEffect(() => {
    if (resetTrigger > 0) {
      setSmsText(
        "Hi Alex! Your Zero’s Universe Flash Sale code “ZERO50” is live — save 50% before midnight 🚀 https://zerosuniverse.com"
      );
      setMonthlyVolume(100000);
      setCostPerSegmentUsd(0.0079);
    }
  }, [resetTrigger]);

  const inspectResult = useMemo(() => {
    const chars = Array.from(smsText);
    const nonGsmChars: string[] = [];
    let septetCount = 0;

    chars.forEach((ch) => {
      if (GSM7_BASIC.has(ch)) {
        septetCount += 1;
      } else if (GSM7_EXTENDED.has(ch)) {
        septetCount += 2; // Escape 0x1B + extended char
      } else {
        nonGsmChars.push(ch);
        septetCount += 1;
      }
    });

    const isUcs2 = nonGsmChars.length > 0;
    const encoding = isUcs2 ? "UCS-2 (16-bit UTF-16)" : "GSM-7 (7-bit Default Alphabet)";

    const payloadLength = isUcs2 ? chars.length : septetCount;
    const singleLimit = isUcs2 ? 70 : 160;
    const multiLimit = isUcs2 ? 67 : 153;

    const segments =
      payloadLength === 0
        ? 0
        : payloadLength <= singleLimit
        ? 1
        : Math.ceil(payloadLength / multiLimit);

    // Calculate what it would cost if sanitized to GSM-7
    const sanitizedPreview = smsText
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[—–]/g, "-")
      .replace(/…/g, "...")
      .replace(/\u00A0/g, " ")
      .split("")
      .filter((c) => GSM7_BASIC.has(c) || GSM7_EXTENDED.has(c))
      .join("");

    const gsmSegmentsIfSanitized =
      sanitizedPreview.length <= 160 ? 1 : Math.ceil(sanitizedPreview.length / 153);

    const monthlyCostUsd = segments * monthlyVolume * costPerSegmentUsd;
    const sanitizedMonthlyCostUsd =
      gsmSegmentsIfSanitized * monthlyVolume * costPerSegmentUsd;
    const monthlySavingsUsd = Math.max(0, monthlyCostUsd - sanitizedMonthlyCostUsd);

    return {
      encoding,
      isUcs2,
      nonGsmChars: Array.from(new Set(nonGsmChars)),
      payloadLength,
      singleLimit,
      multiLimit,
      segments,
      sanitizedPreview,
      gsmSegmentsIfSanitized,
      monthlyCostUsd,
      sanitizedMonthlyCostUsd,
      monthlySavingsUsd,
    };
  }, [smsText, monthlyVolume, costPerSegmentUsd]);

  useEffect(() => {
    setOutput(
      [
        `=== A2P SMS GSM-7 vs UCS-2 CARRIER SEGMENT AUDIT ===`,
        `Detected Encoding: ${inspectResult.encoding}`,
        `Character / Septet Length: ${inspectResult.payloadLength} (Limit: ${inspectResult.singleLimit} single / ${inspectResult.multiLimit} multipart)`,
        `Billable Carrier Segments per SMS: ${inspectResult.segments} Segment(s)`,
        `Non-GSM Culprit Characters: ${
          inspectResult.nonGsmChars.length > 0
            ? inspectResult.nonGsmChars.join(" ")
            : "None (100% GSM-7 Compliant)"
        }`,
        `Monthly Campaign Volume: ${monthlyVolume.toLocaleString()} recipients @ $${costPerSegmentUsd}/segment`,
        `Current Monthly Carrier Bill: $${inspectResult.monthlyCostUsd.toFixed(2)}/mo`,
        `Sanitized GSM-7 Carrier Bill: $${inspectResult.sanitizedMonthlyCostUsd.toFixed(2)}/mo (Saves $${inspectResult.monthlySavingsUsd.toFixed(2)}/mo)`,
        ``,
        `Sanitized GSM-7 Template:`,
        inspectResult.sanitizedPreview,
      ].join("\n")
    );
  }, [inspectResult, monthlyVolume, costPerSegmentUsd, setOutput]);

  return (
    <div className="space-y-5 text-xs">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Marketing / Transactional OTP SMS Template
          </label>
          <button
            type="button"
            onClick={() => setSmsText(inspectResult.sanitizedPreview)}
            disabled={!inspectResult.isUcs2}
            className="inline-flex items-center gap-1 rounded-xs bg-[#ff6a00] px-3 py-1 font-heading text-[10px] font-bold uppercase text-white disabled:opacity-40 cursor-pointer"
          >
            <Sparkles className="h-3 w-3" />
            Sanitize to GSM-7 (Strip Smart Quotes & Emojis)
          </button>
        </div>
        <textarea
          rows={3}
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          className="w-full rounded-xs border border-border bg-background p-2.5 text-text font-mono-code"
        />
      </div>

      {inspectResult.isUcs2 && (
        <div className="rounded-xs border border-amber-500/40 bg-amber-500/10 p-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <MessageSquareWarning className="h-4 w-4 shrink-0" />
            <span>
              UCS-2 UTF-16 Penalty Active! Non-GSM characters forced 70/67 char segment limits:
            </span>
          </div>
          <div className="flex gap-1.5 font-mono-code">
            {inspectResult.nonGsmChars.map((ch, idx) => (
              <span
                key={idx}
                className="rounded-xs border border-amber-400/50 bg-background px-2 py-0.5 text-amber-300 font-bold"
              >
                {ch} (U+{ch.codePointAt(0)?.toString(16).toUpperCase()})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Monthly SMS Campaign Volume
          </label>
          <input
            type="number"
            step="10000"
            value={monthlyVolume}
            onChange={(e) => setMonthlyVolume(Math.max(1, Number(e.target.value) || 1))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Twilio / Sinch / DLT Segment Rate ($ USD)
          </label>
          <input
            type="number"
            step="0.0005"
            value={costPerSegmentUsd}
            onChange={(e) => setCostPerSegmentUsd(Math.max(0.0001, Number(e.target.value) || 0.0079))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Detected Encoding</div>
          <div
            className={`mt-1 font-mono-code text-sm font-bold ${
              inspectResult.isUcs2 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {inspectResult.isUcs2 ? "UCS-2 (70/67)" : "GSM-7 (160/153)"}
          </div>
          <div className="text-[11px] text-text-muted">
            {inspectResult.payloadLength} units used
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Billable Segments</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-accent">
            {inspectResult.segments} Segs
          </div>
          <div className="text-[11px] text-text-muted">
            {inspectResult.gsmSegmentsIfSanitized} seg if GSM-7
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Monthly Carrier Cost</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            ${inspectResult.monthlyCostUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-text-muted">
            {(monthlyVolume * inspectResult.segments).toLocaleString()} total segs
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">GSM-7 Sanitize Savings</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-emerald-400">
            ${inspectResult.monthlySavingsUsd.toFixed(2)}/mo
          </div>
          <div className="text-[11px] text-text-muted">Instant PDU reduction</div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 23. CRYPTO PERPETUAL FUTURES LIQUIDATION, LEVERAGE & R:R CALCULATOR
 * ========================================================================== */
function CryptoPerpLiquidationPositionSizeCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();

  const [direction, setDirection] = useState<"long" | "short">("long");
  const [entryPrice, setEntryPrice] = useState<number>(65000);
  const [stopLossPrice, setStopLossPrice] = useState<number>(63500);
  const [takeProfitPrice, setTakeProfitPrice] = useState<number>(69500);
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPct, setRiskPct] = useState<number>(2.0);
  const [leverage, setLeverage] = useState<number>(20);
  const [maintMarginPct, setMaintMarginPct] = useState<number>(0.5);

  useEffect(() => {
    if (resetTrigger > 0) {
      setDirection("long");
      setEntryPrice(65000);
      setStopLossPrice(63500);
      setTakeProfitPrice(69500);
      setAccountBalance(10000);
      setRiskPct(2.0);
      setLeverage(20);
      setMaintMarginPct(0.5);
    }
  }, [resetTrigger]);

  const calc = useMemo(() => {
    const riskUsd = accountBalance * (riskPct / 100);
    const stopDistancePerUnit = Math.max(0.0001, Math.abs(entryPrice - stopLossPrice));
    const rewardDistancePerUnit = Math.max(0, Math.abs(takeProfitPrice - entryPrice));

    const positionUnits = riskUsd / stopDistancePerUnit;
    const notionalUsd = positionUnits * entryPrice;
    const requiredMarginUsd = notionalUsd / leverage;

    const mmr = maintMarginPct / 100;
    const invLev = 1 / leverage;
    const liqPrice =
      direction === "long"
        ? entryPrice * (1 - invLev + mmr)
        : entryPrice * (1 + invLev - mmr);

    const isLiqBeforeStop =
      direction === "long" ? liqPrice >= stopLossPrice : liqPrice <= stopLossPrice;

    const rrRatio = rewardDistancePerUnit / stopDistancePerUnit;
    const requiredWinRatePct = (1 / (1 + rrRatio)) * 100;

    // Exchange Taker Fee (0.055% entry + 0.055% exit) + 8h 0.01% funding
    const roundTripTakerFeeUsd = notionalUsd * 0.0011;
    const grossProfitUsd = positionUnits * rewardDistancePerUnit;
    const netProfitAfterFeesUsd = grossProfitUsd - roundTripTakerFeeUsd;

    return {
      riskUsd,
      positionUnits,
      notionalUsd,
      requiredMarginUsd,
      liqPrice,
      isLiqBeforeStop,
      rrRatio,
      requiredWinRatePct,
      roundTripTakerFeeUsd,
      netProfitAfterFeesUsd,
    };
  }, [
    direction,
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
    accountBalance,
    riskPct,
    leverage,
    maintMarginPct,
  ]);

  useEffect(() => {
    setOutput(
      [
        `=== CRYPTO PERPETUAL FUTURES RISK & LIQUIDATION REPORT ===`,
        `Direction: ${direction.toUpperCase()} | Leverage: ${leverage}x Isolated | Maint. Margin: ${maintMarginPct}%`,
        `Account Equity: $${accountBalance.toLocaleString()} | Risk per Trade: ${riskPct}% ($${calc.riskUsd.toFixed(2)})`,
        `Entry: $${entryPrice.toLocaleString()} | Stop-Loss: $${stopLossPrice.toLocaleString()} | Take-Profit: $${takeProfitPrice.toLocaleString()}`,
        `----------------------------------------------------------`,
        `Optimal Position Size: ${calc.positionUnits.toFixed(4)} Units ($${calc.notionalUsd.toFixed(2)} USD Notional)`,
        `Required Initial Margin: $${calc.requiredMarginUsd.toFixed(2)}`,
        `Isolated Liquidation Price: $${calc.liqPrice.toFixed(2)}`,
        `Liquidation Safety Check: ${
          calc.isLiqBeforeStop
            ? "DANGER — Position liquidates BEFORE reaching Stop-Loss! Lower leverage immediately."
            : "SAFE — Stop-Loss triggers cleanly before Isolated Liquidation price."
        }`,
        `Risk-to-Reward (R:R) Ratio: 1 : ${calc.rrRatio.toFixed(2)} (Breakeven Win-Rate: ${calc.requiredWinRatePct.toFixed(1)}%)`,
        `Est. Round-Trip Taker Fees (0.11%): $${calc.roundTripTakerFeeUsd.toFixed(2)} | Net TP Profit: $${calc.netProfitAfterFeesUsd.toFixed(2)}`,
      ].join("\n")
    );
  }, [
    direction,
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
    accountBalance,
    riskPct,
    leverage,
    maintMarginPct,
    calc,
    setOutput,
  ]);

  return (
    <div className="space-y-5 text-xs">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Perpetual Position Direction
          </label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "long" | "short")}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-bold"
          >
            <option value="long">LONG (Bullish)</option>
            <option value="short">SHORT (Bearish)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Entry Price ($ USD)
          </label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(Math.max(0.01, Number(e.target.value) || 1))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Stop-Loss Price ($ USD)
          </label>
          <input
            type="number"
            value={stopLossPrice}
            onChange={(e) => setStopLossPrice(Math.max(0.01, Number(e.target.value) || 1))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Take-Profit Price ($ USD)
          </label>
          <input
            type="number"
            value={takeProfitPrice}
            onChange={(e) => setTakeProfitPrice(Math.max(0.01, Number(e.target.value) || 1))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Account Balance ($ USD)
          </label>
          <input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(Math.max(10, Number(e.target.value) || 100))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Account Risk per Trade: <span className="text-accent">{riskPct}%</span>
          </label>
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={riskPct}
            onChange={(e) => setRiskPct(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Isolated Leverage: <span className="text-accent">{leverage}x</span>
          </label>
          <input
            type="range"
            min={1}
            max={100}
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full accent-[#ff6a00]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Maintenance Margin (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={maintMarginPct}
            onChange={(e) => setMaintMarginPct(Math.max(0.1, Number(e.target.value) || 0.5))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>
      </div>

      {calc.isLiqBeforeStop && (
        <div className="rounded-xs border border-red-500/40 bg-red-500/10 p-3 flex items-center gap-2 text-red-400 font-bold">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            LIQUIDATION HAZARD: Your Isolated Liquidation price (${calc.liqPrice.toFixed(2)}) will trigger BEFORE your Stop-Loss (${stopLossPrice.toFixed(2)}) at {leverage}x leverage!
          </span>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Position Size</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-accent">
            {calc.positionUnits.toFixed(4)} Units
          </div>
          <div className="text-[11px] text-text-muted">
            ${calc.notionalUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} Notional
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Isolated Liquidation</div>
          <div
            className={`mt-1 font-mono-code text-lg font-bold ${
              calc.isLiqBeforeStop ? "text-red-400" : "text-text"
            }`}
          >
            ${calc.liqPrice.toFixed(2)}
          </div>
          <div className="text-[11px] text-text-muted">
            Initial Margin: ${calc.requiredMarginUsd.toFixed(0)}
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Risk-to-Reward (R:R)</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-emerald-400">
            1 : {calc.rrRatio.toFixed(2)}
          </div>
          <div className="text-[11px] text-text-muted">
            Req. Win-Rate: {calc.requiredWinRatePct.toFixed(1)}%
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Net TP Profit (After Fees)</div>
          <div className="mt-1 font-mono-code text-lg font-bold text-text">
            +${calc.netProfitAfterFeesUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-text-muted">
            Fees: -${calc.roundTripTakerFeeUsd.toFixed(2)}
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 24. DEFI AMM IMPERMANENT LOSS & CHAINLINK ORACLE SIMULATOR
 * ========================================================================== */
function DefiOracleDeviationImpermanentLossCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();

  // (A) AMM Impermanent Loss state
  const [initialDepositUsd, setInitialDepositUsd] = useState<number>(10000);
  const [tokenAChangePct, setTokenAChangePct] = useState<number>(80);
  const [tokenBChangePct, setTokenBChangePct] = useState<number>(0);
  const [lpFeeAprPct, setLpFeeAprPct] = useState<number>(24);
  const [farmingDays, setFarmingDays] = useState<number>(90);

  // (B) Chainlink / Pyth Oracle Heartbeat & Deviation state
  const [lastOnChainPrice, setLastOnChainPrice] = useState<number>(3200);
  const [offChainSpotPrice, setOffChainSpotPrice] = useState<number>(3224);
  const [deviationThresholdPct, setDeviationThresholdPct] = useState<number>(0.5);
  const [heartbeatSec, setHeartbeatSec] = useState<number>(3600);
  const [elapsedSec, setElapsedSec] = useState<number>(1420);

  useEffect(() => {
    if (resetTrigger > 0) {
      setInitialDepositUsd(10000);
      setTokenAChangePct(80);
      setTokenBChangePct(0);
      setLpFeeAprPct(24);
      setFarmingDays(90);
      setLastOnChainPrice(3200);
      setOffChainSpotPrice(3224);
      setDeviationThresholdPct(0.5);
      setHeartbeatSec(3600);
      setElapsedSec(1420);
    }
  }, [resetTrigger]);

  const defi = useMemo(() => {
    const multA = Math.max(0.05, 1 + tokenAChangePct / 100);
    const multB = Math.max(0.05, 1 + tokenBChangePct / 100);
    const priceRatioR = multA / multB;

    // Constant Product x * y = k Impermanent Loss Formula
    const ilFraction = (2 * Math.sqrt(priceRatioR)) / (1 + priceRatioR) - 1;
    const ilPct = ilFraction * 100;

    const hodlValueUsd = initialDepositUsd * 0.5 * multA + initialDepositUsd * 0.5 * multB;
    const lpBaseValueUsd = hodlValueUsd * (1 + ilFraction);
    const earnedFeesUsd = initialDepositUsd * (lpFeeAprPct / 100) * (farmingDays / 365);
    const totalLpValueUsd = lpBaseValueUsd + earnedFeesUsd;
    const netVsHodlUsd = totalLpValueUsd - hodlValueUsd;

    // Oracle Deviation
    const absDeviationPct =
      (Math.abs(offChainSpotPrice - lastOnChainPrice) / Math.max(0.01, lastOnChainPrice)) *
      100;
    const deviationTriggered = absDeviationPct >= deviationThresholdPct;
    const heartbeatTriggered = elapsedSec >= heartbeatSec;
    const oracleState = deviationTriggered
      ? "DEVIATION_THRESHOLD_BREACHED (Push On-Chain Round)"
      : heartbeatTriggered
      ? "HEARTBEAT_EXPIRED (Push Forced Refresh)"
      : "IDLE_WITHIN_TOLERANCE (No Gas Spent)";

    return {
      priceRatioR,
      ilPct,
      hodlValueUsd,
      lpBaseValueUsd,
      earnedFeesUsd,
      totalLpValueUsd,
      netVsHodlUsd,
      absDeviationPct,
      deviationTriggered,
      heartbeatTriggered,
      oracleState,
    };
  }, [
    initialDepositUsd,
    tokenAChangePct,
    tokenBChangePct,
    lpFeeAprPct,
    farmingDays,
    lastOnChainPrice,
    offChainSpotPrice,
    deviationThresholdPct,
    heartbeatSec,
    elapsedSec,
  ]);

  useEffect(() => {
    setOutput(
      [
        `=== DEFI AMM IMPERMANENT LOSS (x * y = k) & ORACLE REPORT ===`,
        `[A] Constant Product 50/50 Liquidity Pool ($${initialDepositUsd.toLocaleString()} Initial):`,
        `  Token A Change: ${tokenAChangePct >= 0 ? "+" : ""}${tokenAChangePct}% | Token B Change: ${tokenBChangePct >= 0 ? "+" : ""}${tokenBChangePct}% (Ratio r = ${defi.priceRatioR.toFixed(3)})`,
        `  Impermanent Loss (IL): ${defi.ilPct.toFixed(2)}%`,
        `  50/50 HODL Portfolio Value: $${defi.hodlValueUsd.toFixed(2)}`,
        `  AMM LP Pool Value (Before Fees): $${defi.lpBaseValueUsd.toFixed(2)}`,
        `  Earned LP Fees (${lpFeeAprPct}% APR over ${farmingDays}d): +$${defi.earnedFeesUsd.toFixed(2)}`,
        `  Net LP Value vs HODL: ${defi.netVsHodlUsd >= 0 ? "+" : ""}$${defi.netVsHodlUsd.toFixed(2)}`,
        ``,
        `[B] Chainlink / Pyth Decentralized Oracle Trigger Simulator:`,
        `  Last On-Chain Answer: $${lastOnChainPrice} | Off-Chain Spot: $${offChainSpotPrice}`,
        `  Current Price Deviation: ${defi.absDeviationPct.toFixed(3)}% (Threshold: ${deviationThresholdPct}%)`,
        `  Elapsed Time Since Update: ${elapsedSec}s (Heartbeat: ${heartbeatSec}s)`,
        `  Aggregator Node Status: ${defi.oracleState}`,
      ].join("\n")
    );
  }, [
    initialDepositUsd,
    tokenAChangePct,
    tokenBChangePct,
    lpFeeAprPct,
    farmingDays,
    lastOnChainPrice,
    offChainSpotPrice,
    deviationThresholdPct,
    heartbeatSec,
    elapsedSec,
    defi,
    setOutput,
  ]);

  return (
    <div className="space-y-5 text-xs">
      {/* Section A: Impermanent Loss */}
      <div className="rounded-xs border border-border bg-surface p-3.5 space-y-3">
        <div className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-text">
          <Coins className="h-4 w-4 text-accent" />
          (A) Constant Product AMM (x * y = k) Impermanent Loss Calculator
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <label className="block text-[10px] uppercase text-text-muted mb-1">
              Initial LP Deposit ($)
            </label>
            <input
              type="number"
              value={initialDepositUsd}
              onChange={(e) => setInitialDepositUsd(Math.max(10, Number(e.target.value) || 100))}
              className="w-full rounded-xs border border-border bg-background px-2 py-1.5 text-text font-mono-code"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-text-muted mb-1">
              Token A Change: <span className="text-accent">{tokenAChangePct}%</span>
            </label>
            <input
              type="range"
              min={-80}
              max={300}
              step={5}
              value={tokenAChangePct}
              onChange={(e) => setTokenAChangePct(Number(e.target.value))}
              className="w-full accent-[#ff6a00]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-text-muted mb-1">
              Token B Change: <span className="text-accent">{tokenBChangePct}%</span>
            </label>
            <input
              type="range"
              min={-80}
              max={300}
              step={5}
              value={tokenBChangePct}
              onChange={(e) => setTokenBChangePct(Number(e.target.value))}
              className="w-full accent-[#ff6a00]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-text-muted mb-1">
              LP Fee APR (%)
            </label>
            <input
              type="number"
              value={lpFeeAprPct}
              onChange={(e) => setLpFeeAprPct(Math.max(0, Number(e.target.value) || 0))}
              className="w-full rounded-xs border border-border bg-background px-2 py-1.5 text-text font-mono-code"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-text-muted mb-1">
              Staking Days
            </label>
            <input
              type="number"
              value={farmingDays}
              onChange={(e) => setFarmingDays(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-xs border border-border bg-background px-2 py-1.5 text-text font-mono-code"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xs border border-border bg-background p-2.5">
            <div className="text-[10px] uppercase text-text-muted">Impermanent Loss</div>
            <div className="font-mono-code text-base font-bold text-amber-400">
              {defi.ilPct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-xs border border-border bg-background p-2.5">
            <div className="text-[10px] uppercase text-text-muted">50/50 HODL Value</div>
            <div className="font-mono-code text-base font-bold text-text">
              ${defi.hodlValueUsd.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xs border border-border bg-background p-2.5">
            <div className="text-[10px] uppercase text-text-muted">LP + Earned Fees</div>
            <div className="font-mono-code text-base font-bold text-accent">
              ${defi.totalLpValueUsd.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xs border border-border bg-background p-2.5">
            <div className="text-[10px] uppercase text-text-muted">Net vs HODL</div>
            <div
              className={`font-mono-code text-base font-bold ${
                defi.netVsHodlUsd >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {defi.netVsHodlUsd >= 0 ? "+" : ""}${defi.netVsHodlUsd.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Section B: Decentralized Oracle Simulator */}
      <div className="rounded-xs border border-border bg-surface p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-accent" />
            (B) Chainlink / Pyth Oracle Deviation & Heartbeat Simulator
          </span>
          <span
            className={`rounded-xs px-2 py-0.5 font-mono-code text-[10px] font-bold ${
              defi.deviationTriggered || defi.heartbeatTriggered
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            }`}
          >
            {defi.oracleState}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-[10px] uppercase text-text-muted mb-1">
              Last On-Chain Price ($)
            </label>
            <input
              type="number"
              value={lastOnChainPrice}
              onChange={(e) => setLastOnChainPrice(Number(e.target.value) || 1)}
              className="w-full rounded-xs border border-border bg-background px-2 py-1 text-text font-mono-code"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-text-muted mb-1">
              Off-Chain Spot Price ($)
            </label>
            <input
              type="number"
              value={offChainSpotPrice}
              onChange={(e) => setOffChainSpotPrice(Number(e.target.value) || 1)}
              className="w-full rounded-xs border border-border bg-background px-2 py-1 text-text font-mono-code"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-text-muted mb-1">
              Deviation Threshold (%)
            </label>
            <select
              value={deviationThresholdPct}
              onChange={(e) => setDeviationThresholdPct(Number(e.target.value))}
              className="w-full rounded-xs border border-border bg-background px-2 py-1 text-text font-mono-code"
            >
              <option value={0.1}>0.1% (L2 High-Freq Feed)</option>
              <option value={0.5}>0.5% (ETH/USD Mainnet)</option>
              <option value={1.0}>1.0% (Mid-Cap Altcoin)</option>
              <option value={2.0}>2.0% (Volatile Pair)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase text-text-muted mb-1">
              Elapsed Secs (of {heartbeatSec}s)
            </label>
            <input
              type="number"
              value={elapsedSec}
              onChange={(e) => setElapsedSec(Number(e.target.value) || 0)}
              className="w-full rounded-xs border border-border bg-background px-2 py-1 text-text font-mono-code"
            />
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 25. BI COHORT RETENTION, RFM SEGMENTATION & WINDOW SQL BUILDER
 * ========================================================================== */
const SAMPLE_COHORT_MATRIX = [
  { cohort: "2026-04", size: 1420, m0: 100, m1: 64, m2: 51, m3: 44, m4: 41 },
  { cohort: "2026-05", size: 1680, m0: 100, m1: 68, m2: 55, m3: 48, m4: null },
  { cohort: "2026-06", size: 1950, m0: 100, m1: 71, m2: 59, m3: null, m4: null },
  { cohort: "2026-07", size: 2210, m0: 100, m1: 74, m2: null, m3: null, m4: null },
];

function BiCohortRetentionRfmSqlQueryBuilder({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();

  const [dialect, setDialect] = useState<
    "postgresql" | "bigquery" | "snowflake" | "mysql8"
  >("postgresql");
  const [analysisType, setAnalysisType] = useState<
    "cohort-retention" | "rfm-segmentation" | "mrr-waterfall" | "dau-mau-stickiness"
  >("cohort-retention");
  const [tableName, setTableName] = useState<string>("analytics.user_events");
  const [userCol, setUserCol] = useState<string>("user_id");
  const [dateCol, setDateCol] = useState<string>("occurred_at");
  const [revenueCol, setRevenueCol] = useState<string>("net_revenue_usd");

  useEffect(() => {
    if (resetTrigger > 0) {
      setDialect("postgresql");
      setAnalysisType("cohort-retention");
      setTableName("analytics.user_events");
      setUserCol("user_id");
      setDateCol("occurred_at");
      setRevenueCol("net_revenue_usd");
    }
  }, [resetTrigger]);

  const sqlQuery = useMemo(() => {
    const truncMonth =
      dialect === "bigquery"
        ? `DATE_TRUNC(DATE(${dateCol}), MONTH)`
        : dialect === "mysql8"
        ? `DATE_FORMAT(${dateCol}, '%Y-%m-01')`
        : `DATE_TRUNC('month', ${dateCol})`;

    const monthDiff =
      dialect === "bigquery"
        ? `DATE_DIFF(a.activity_month, c.cohort_month, MONTH)`
        : dialect === "snowflake"
        ? `DATEDIFF('month', c.cohort_month, a.activity_month)`
        : dialect === "mysql8"
        ? `TIMESTAMPDIFF(MONTH, c.cohort_month, a.activity_month)`
        : `(EXTRACT(YEAR FROM AGE(a.activity_month, c.cohort_month)) * 12 + EXTRACT(MONTH FROM AGE(a.activity_month, c.cohort_month)))`;

    if (analysisType === "cohort-retention") {
      return [
        `-- ${dialect.toUpperCase()}: Monthly Cohort Retention Matrix with CTEs & Window Functions`,
        `WITH user_cohorts AS (`,
        `  SELECT`,
        `    ${userCol},`,
        `    MIN(${truncMonth}) AS cohort_month`,
        `  FROM ${tableName}`,
        `  GROUP BY 1`,
        `),`,
        `monthly_activity AS (`,
        `  SELECT DISTINCT`,
        `    ${userCol},`,
        `    ${truncMonth} AS activity_month`,
        `  FROM ${tableName}`,
        `),`,
        `cohort_sizes AS (`,
        `  SELECT cohort_month, COUNT(*) AS cohort_users`,
        `  FROM user_cohorts`,
        `  GROUP BY 1`,
        `)`,
        `SELECT`,
        `  c.cohort_month,`,
        `  s.cohort_users,`,
        `  ${monthDiff} AS month_number,`,
        `  COUNT(DISTINCT a.${userCol}) AS retained_users,`,
        `  ROUND(100.0 * COUNT(DISTINCT a.${userCol}) / NULLIF(s.cohort_users, 0), 2) AS retention_pct`,
        `FROM user_cohorts c`,
        `JOIN monthly_activity a ON c.${userCol} = a.${userCol}`,
        `JOIN cohort_sizes s ON c.cohort_month = s.cohort_month`,
        `GROUP BY 1, 2, 3`,
        `ORDER BY 1, 3;`,
      ].join("\n");
    }

    if (analysisType === "rfm-segmentation") {
      return [
        `-- ${dialect.toUpperCase()}: RFM (Recency, Frequency, Monetary) NTILE(5) Customer Segmentation`,
        `WITH rfm_raw AS (`,
        `  SELECT`,
        `    ${userCol},`,
        `    MAX(${dateCol}) AS last_order_at,`,
        `    COUNT(*) AS frequency_orders,`,
        `    SUM(${revenueCol}) AS monetary_ltv`,
        `  FROM ${tableName}`,
        `  GROUP BY 1`,
        `),`,
        `rfm_scores AS (`,
        `  SELECT`,
        `    ${userCol},`,
        `    frequency_orders,`,
        `    monetary_ltv,`,
        `    NTILE(5) OVER (ORDER BY last_order_at ASC) AS r_score,`,
        `    NTILE(5) OVER (ORDER BY frequency_orders ASC) AS f_score,`,
        `    NTILE(5) OVER (ORDER BY monetary_ltv ASC) AS m_score`,
        `  FROM rfm_raw`,
        `)`,
        `SELECT`,
        `  ${userCol},`,
        `  r_score, f_score, m_score,`,
        `  (r_score * 100 + f_score * 10 + m_score) AS rfm_cell,`,
        `  CASE`,
        `    WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions'`,
        `    WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal Customers'`,
        `    WHEN r_score <= 2 AND m_score >= 4 THEN 'Can''t Lose High-LTV'`,
        `    ELSE 'At-Risk / Hibernating'`,
        `  END AS customer_segment`,
        `FROM rfm_scores`,
        `ORDER BY monetary_ltv DESC;`,
      ].join("\n");
    }

    if (analysisType === "mrr-waterfall") {
      return [
        `-- ${dialect.toUpperCase()}: SaaS Net Dollar Retention (NDR) & MRR Churn/Expansion Waterfall`,
        `WITH monthly_user_mrr AS (`,
        `  SELECT`,
        `    ${userCol},`,
        `    ${truncMonth} AS billing_month,`,
        `    SUM(${revenueCol}) AS mrr`,
        `  FROM ${tableName}`,
        `  GROUP BY 1, 2`,
        `),`,
        `mrr_lagged AS (`,
        `  SELECT`,
        `    ${userCol},`,
        `    billing_month,`,
        `    mrr AS current_mrr,`,
        `    LAG(mrr, 1, 0) OVER (PARTITION BY ${userCol} ORDER BY billing_month) AS prev_mrr`,
        `  FROM monthly_user_mrr`,
        `)`,
        `SELECT`,
        `  billing_month,`,
        `  SUM(CASE WHEN prev_mrr = 0 AND current_mrr > 0 THEN current_mrr ELSE 0 END) AS new_mrr,`,
        `  SUM(CASE WHEN current_mrr > prev_mrr AND prev_mrr > 0 THEN current_mrr - prev_mrr ELSE 0 END) AS expansion_mrr,`,
        `  SUM(CASE WHEN current_mrr < prev_mrr THEN prev_mrr - current_mrr ELSE 0 END) AS contraction_mrr,`,
        `  SUM(current_mrr) AS ending_net_mrr`,
        `FROM mrr_lagged`,
        `GROUP BY 1`,
        `ORDER BY 1;`,
      ].join("\n");
    }

    return [
      `-- ${dialect.toUpperCase()}: Rolling DAU / WAU / 30-Day MAU Stickiness Ratio`,
      `WITH daily_users AS (`,
      `  SELECT`,
      `    CAST(${dateCol} AS DATE) AS activity_date,`,
      `    COUNT(DISTINCT ${userCol}) AS dau`,
      `  FROM ${tableName}`,
      `  GROUP BY 1`,
      `)`,
      `SELECT`,
      `  activity_date,`,
      `  dau,`,
      `  ROUND(AVG(dau) OVER (ORDER BY activity_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 1) AS rolling_7d_dau,`,
      `  SUM(dau) OVER (ORDER BY activity_date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) AS approx_30d_engagement`,
      `FROM daily_users`,
      `ORDER BY activity_date DESC;`,
    ].join("\n");
  }, [dialect, analysisType, tableName, userCol, dateCol, revenueCol]);

  useEffect(() => {
    setOutput(sqlQuery);
  }, [sqlQuery, setOutput]);

  return (
    <div className="space-y-5 text-xs">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            SQL Warehouse Dialect
          </label>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as typeof dialect)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          >
            <option value="postgresql">PostgreSQL 15+ / Supabase</option>
            <option value="bigquery">Google BigQuery Standard SQL</option>
            <option value="snowflake">Snowflake Data Cloud</option>
            <option value="mysql8">MySQL 8.0+ (Window CTEs)</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            BI Analytical Model
          </label>
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value as typeof analysisType)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          >
            <option value="cohort-retention">
              Monthly Cohort Retention Matrix (M0–M12 Triangle)
            </option>
            <option value="rfm-segmentation">
              RFM Recency-Frequency-Monetary Customer Segmentation (NTILE 5)
            </option>
            <option value="mrr-waterfall">
              SaaS MRR Churn, Contraction & Expansion Waterfall (LAG Window)
            </option>
            <option value="dau-mau-stickiness">
              7-Day Rolling DAU / MAU Product Stickiness Window
            </option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Events Table Name
          </label>
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            User ID / Timestamp Columns
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="text"
              value={userCol}
              onChange={(e) => setUserCol(e.target.value)}
              className="rounded-xs border border-border bg-background px-2 py-1.5 text-text font-mono-code"
            />
            <input
              type="text"
              value={dateCol}
              onChange={(e) => setDateCol(e.target.value)}
              className="rounded-xs border border-border bg-background px-2 py-1.5 text-text font-mono-code"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Revenue / Monetary Column
          </label>
          <input
            type="text"
            value={revenueCol}
            onChange={(e) => setRevenueCol(e.target.value)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text font-mono-code"
          />
        </div>
      </div>

      {/* SQL Output Preview */}
      <div className="rounded-xs border border-border bg-background p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-accent" />
            Production CTE Window SQL Query
          </span>
          <span className="font-mono-code text-[10px] text-accent uppercase">
            {dialect}
          </span>
        </div>
        <pre className="overflow-x-auto rounded-xs border border-border bg-surface p-3 font-mono-code text-[11px] text-emerald-400 leading-relaxed">
          {sqlQuery}
        </pre>
      </div>

      {/* Cohort Retention Heatmap Preview */}
      <div className="rounded-xs border border-border bg-surface p-3 space-y-2">
        <div className="font-heading text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Interactive Cohort Retention Heatmap Preview (%)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-code text-[11px]">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="py-1.5 pr-3">Cohort</th>
                <th className="py-1.5 pr-3">Users</th>
                <th className="py-1.5 px-2">Month 0</th>
                <th className="py-1.5 px-2">Month 1</th>
                <th className="py-1.5 px-2">Month 2</th>
                <th className="py-1.5 px-2">Month 3</th>
                <th className="py-1.5 px-2">Month 4</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_COHORT_MATRIX.map((row) => (
                <tr key={row.cohort} className="border-b border-border/50">
                  <td className="py-1.5 pr-3 font-bold text-text">{row.cohort}</td>
                  <td className="py-1.5 pr-3 text-text-muted">{row.size.toLocaleString()}</td>
                  {[row.m0, row.m1, row.m2, row.m3, row.m4].map((val, idx) => (
                    <td key={idx} className="py-1 px-1">
                      {val !== null ? (
                        <div
                          className="rounded-xs px-2 py-1 text-center font-bold text-white"
                          style={{
                            backgroundColor: `rgba(255, 106, 0, ${Math.max(0.18, val / 115)})`,
                          }}
                        >
                          {val}%
                        </div>
                      ) : (
                        <div className="text-center text-text-muted">—</div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * EXPORT REGISTRY FOR WAVE 5 GROUP B: 12 HARDWARE, WEBAUDIO & FINTECH TOOLS
 * ========================================================================== */
export const wave5HardwareMediaFinancePlaygrounds: Record<
  string,
  React.ComponentType<{ tool: Tool }>
> = {
  "pc-motherboard-pcie-lane-nvme-bandwidth-planner":
    PcMotherboardPcieLaneNvmeBandwidthPlanner,
  "android-emulator-vtx-ram-fps-optimizer": AndroidEmulatorVtxRamFpsOptimizer,
  "yt-dlp-aria2c-media-stream-command-builder":
    YtDlpAria2cMediaStreamCommandBuilder,
  "parametric-eq-binaural-beats-audio-studio":
    ParametricEqBinauralBeatsAudioStudio,
  "box-breathing-binaural-theta-therapy-studio":
    BoxBreathingBinauralThetaTherapyStudio,
  "wet-bulb-snow-probability-weather-alert-lab":
    WetBulbSnowProbabilityWeatherAlertLab,
  "pomodoro-spaced-repetition-anki-gpa-studio":
    PomodoroSpacedRepetitionAnkiGpaStudio,
  "anime-kdrama-binge-filler-watch-time-calculator":
    AnimeKdramaBingeFillerWatchTimeCalculator,
  "a2p-sms-gsm7-ucs2-segment-cost-calculator":
    A2pSmsGsm7Ucs2SegmentCostCalculator,
  "crypto-perp-liquidation-position-size-calculator":
    CryptoPerpLiquidationPositionSizeCalculator,
  "defi-oracle-deviation-impermanent-loss-calculator":
    DefiOracleDeviationImpermanentLossCalculator,
  "bi-cohort-retention-rfm-sql-query-builder":
    BiCohortRetentionRfmSqlQueryBuilder,
};

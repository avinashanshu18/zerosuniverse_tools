"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Compass,
  Scale,
  MapPin,
  Navigation,
  ScanFace,
  Sparkles,
  Box,
  Volume2,
  Telescope,
  TrendingUp,
  Cpu,
  Filter,
  Building2,
  Gem,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Layers,
  Sliders,
} from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { useToolCard, ToolActions } from "@/components/tool/ToolPlaygrounds";

/* ============================================================================
 * 14. SMARTPHONE SENSOR GYRO, ACCELEROMETER & DIGITAL POCKET SCALE LAB
 * ========================================================================== */
function SmartphoneSensorGyroAccelerometerLab({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [liveMode, setLiveMode] = useState(false);
  const [sensorStatus, setSensorStatus] = useState<string>("Desktop Simulator Active");

  // Orientation (degrees)
  const [alpha, setAlpha] = useState<number>(42.5); // Compass Yaw (0-360)
  const [beta, setBeta] = useState<number>(3.2); // Front-Back Pitch (-180 to 180)
  const [gamma, setGamma] = useState<number>(-1.8); // Left-Right Roll (-90 to 90)

  // Accelerometer (m/s^2)
  const [accX, setAccX] = useState<number>(-0.31);
  const [accY, setAccY] = useState<number>(0.55);
  const [accZ, setAccZ] = useState<number>(9.79);

  // Digital Pocket Scale & Tare Calibration Converter
  const [rawGrams, setRawGrams] = useState<number>(18.45);
  const [tareOffsetGrams, setTareOffsetGrams] = useState<number>(0);

  useEffect(() => {
    if (resetTrigger > 0) {
      setLiveMode(false);
      setSensorStatus("Desktop Simulator Active");
      setAlpha(42.5);
      setBeta(3.2);
      setGamma(-1.8);
      setAccX(-0.31);
      setAccY(0.55);
      setAccZ(9.79);
      setRawGrams(18.45);
      setTareOffsetGrams(0);
    }
  }, [resetTrigger]);

  // Update simulated accelerometer when pitch/roll sliders move in simulator mode
  const handleSimPitchChange = (newBeta: number) => {
    setBeta(newBeta);
    if (!liveMode) {
      const radB = (newBeta * Math.PI) / 180;
      const radG = (gamma * Math.PI) / 180;
      setAccX(Number((9.80665 * Math.sin(radG)).toFixed(2)));
      setAccY(Number((9.80665 * Math.sin(radB) * Math.cos(radG)).toFixed(2)));
      setAccZ(Number((9.80665 * Math.cos(radB) * Math.cos(radG)).toFixed(2)));
    }
  };

  const handleSimRollChange = (newGamma: number) => {
    setGamma(newGamma);
    if (!liveMode) {
      const radB = (beta * Math.PI) / 180;
      const radG = (newGamma * Math.PI) / 180;
      setAccX(Number((9.80665 * Math.sin(radG)).toFixed(2)));
      setAccY(Number((9.80665 * Math.sin(radB) * Math.cos(radG)).toFixed(2)));
      setAccZ(Number((9.80665 * Math.cos(radB) * Math.cos(radG)).toFixed(2)));
    }
  };

  const startLiveSensors = async () => {
    if (typeof window === "undefined") return;
    try {
      const dm = DeviceMotionEvent as unknown as {
        requestPermission?: () => Promise<"granted" | "denied">;
      };
      if (typeof dm?.requestPermission === "function") {
        const res = await dm.requestPermission();
        if (res !== "granted") {
          setSensorStatus("Permission Denied by OS — Using Simulator");
          return;
        }
      }
      setLiveMode(true);
      setSensorStatus("Listening to Hardware IMU Events...");
    } catch {
      setLiveMode(true);
      setSensorStatus("Listening to Browser Sensor Events...");
    }
  };

  useEffect(() => {
    if (!liveMode || typeof window === "undefined") return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null || e.beta !== null || e.gamma !== null) {
        setAlpha(Number((e.alpha ?? 0).toFixed(1)));
        setBeta(Number((e.beta ?? 0).toFixed(1)));
        setGamma(Number((e.gamma ?? 0).toFixed(1)));
        setSensorStatus("Live Hardware Gyroscope Connected");
      }
    };

    const handleMotion = (e: DeviceMotionEvent) => {
      const ag = e.accelerationIncludingGravity;
      if (ag && (ag.x !== null || ag.y !== null || ag.z !== null)) {
        setAccX(Number((ag.x ?? 0).toFixed(2)));
        setAccY(Number((ag.y ?? 0).toFixed(2)));
        setAccZ(Number((ag.z ?? 9.81).toFixed(2)));
        setSensorStatus("Live Hardware IMU Stream Active");
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("devicemotion", handleMotion);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [liveMode]);

  const totalG = useMemo(() => {
    const mag = Math.sqrt(accX * accX + accY * accY + accZ * accZ);
    return mag / 9.80665;
  }, [accX, accY, accZ]);

  const tiltDeviation = useMemo(() => {
    return Math.sqrt(beta * beta + gamma * gamma);
  }, [beta, gamma]);

  const isLevel = tiltDeviation < 1.5;

  // Bubble spirit coordinates (-45 to +45 deg mapped into 65px circle radius)
  const bubbleX = Math.max(-55, Math.min(55, (gamma / 45) * 55));
  const bubbleY = Math.max(-55, Math.min(55, (beta / 45) * 55));

  // Scale calculations
  const netGrams = rawGrams - tareOffsetGrams;
  const scaleUnits = useMemo(() => {
    return {
      grams: netGrams,
      ounces: netGrams / 28.349523125,
      troyOunces: netGrams / 31.1034768,
      carats: netGrams * 5.0,
      grains: netGrams * 15.43235835,
      milligrams: netGrams * 1000,
    };
  }, [netGrams]);

  useEffect(() => {
    setOutput(
      [
        `=== SMARTPHONE IMU SENSOR & SPIRIT LEVEL TELEMETRY ===`,
        `Sensor Source      : ${sensorStatus}`,
        `Compass Yaw (α)    : ${alpha.toFixed(1)}°`,
        `Pitch Front/Back(β): ${beta.toFixed(1)}°`,
        `Roll Left/Right (γ): ${gamma.toFixed(1)}°`,
        `Spirit Level State : ${isLevel ? "LEVEL (< 1.5° error)" : `TILTED (${tiltDeviation.toFixed(2)}° off-axis)`}`,
        ``,
        `--- ACCELEROMETER & G-FORCE ---`,
        `Accel X / Y / Z    : ${accX.toFixed(2)} / ${accY.toFixed(2)} / ${accZ.toFixed(2)} m/s²`,
        `Total G-Force Load : ${totalG.toFixed(3)} G`,
        ``,
        `--- DIGITAL POCKET SCALE & TARE CONVERTER ---`,
        `Gross Load         : ${rawGrams.toFixed(2)} g`,
        `Tare Offset        : ${tareOffsetGrams.toFixed(2)} g`,
        `Net Weight (Grams) : ${scaleUnits.grams.toFixed(2)} g (${scaleUnits.milligrams.toFixed(0)} mg)`,
        `Avoirdupois Ounces : ${scaleUnits.ounces.toFixed(4)} oz`,
        `Troy Ounces (Gold) : ${scaleUnits.troyOunces.toFixed(4)} ozt`,
        `Gemstone Carats    : ${scaleUnits.carats.toFixed(2)} ct`,
        `Grains (Reloading) : ${scaleUnits.grains.toFixed(2)} gr`,
      ].join("\n")
    );
  }, [
    sensorStatus,
    alpha,
    beta,
    gamma,
    isLevel,
    tiltDeviation,
    accX,
    accY,
    accZ,
    totalG,
    rawGrams,
    tareOffsetGrams,
    scaleUnits,
    setOutput,
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xs border border-border bg-surface p-3">
        <div className="flex items-center gap-2 text-xs font-mono-code">
          <Compass className="h-4 w-4 text-accent" />
          <span className="font-bold text-text">{sensorStatus}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={startLiveSensors}
            className="rounded-xs bg-[#ff6a00] px-3 py-1.5 font-heading text-xs font-bold uppercase text-white hover:opacity-90 cursor-pointer"
          >
            Poll Live Hardware Sensors
          </button>
          <button
            type="button"
            onClick={() => {
              setLiveMode(false);
              setSensorStatus("Desktop Simulator Active");
              handleSimPitchChange(0);
              handleSimRollChange(0);
            }}
            className="rounded-xs border border-border bg-background px-3 py-1.5 font-mono-code text-xs text-text hover:border-accent cursor-pointer"
          >
            Zero Spirit Level (0°)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: 2D Bubble Spirit Level SVG */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-xs border border-border bg-surface p-4">
          <div className="mb-2 flex w-full items-center justify-between text-xs font-mono-code">
            <span className="uppercase text-text-muted">2D Bullseye Spirit Level</span>
            <span
              className={`rounded-xs px-2 py-0.5 text-[10px] font-bold ${
                isLevel
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {isLevel ? "PERFECTLY LEVEL" : `${tiltDeviation.toFixed(1)}° TILT`}
            </span>
          </div>

          <svg viewBox="-80 -80 160 160" className="h-52 w-52">
            <defs>
              <radialGradient id="vialGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.04" />
              </radialGradient>
            </defs>
            <circle
              cx="0"
              cy="0"
              r="68"
              fill="url(#vialGrad)"
              stroke="currentColor"
              className="text-border"
              strokeWidth="2"
            />
            <circle
              cx="0"
              cy="0"
              r="42"
              fill="none"
              stroke="currentColor"
              className="text-border"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <circle
              cx="0"
              cy="0"
              r="16"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
            />
            <line x1="-68" y1="0" x2="68" y2="0" stroke="#10b981" strokeOpacity="0.3" />
            <line x1="0" y1="-68" x2="0" y2="68" stroke="#10b981" strokeOpacity="0.3" />
            {/* Bubble */}
            <circle
              cx={bubbleX}
              cy={bubbleY}
              r="13"
              fill={isLevel ? "#10b981" : "#ff6a00"}
              fillOpacity="0.85"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <circle
              cx={bubbleX - 4}
              cy={bubbleY - 4}
              r="3.5"
              fill="#ffffff"
              fillOpacity="0.6"
            />
          </svg>

          <div className="mt-2 grid w-full grid-cols-3 gap-2 text-center font-mono-code text-xs">
            <div className="rounded-xs border border-border bg-background p-2">
              <div className="text-[10px] text-text-muted">YAW (α)</div>
              <div className="font-bold text-text">{alpha.toFixed(1)}°</div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2">
              <div className="text-[10px] text-text-muted">PITCH (β)</div>
              <div className="font-bold text-accent">{beta.toFixed(1)}°</div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2">
              <div className="text-[10px] text-text-muted">ROLL (γ)</div>
              <div className="font-bold text-emerald-400">{gamma.toFixed(1)}°</div>
            </div>
          </div>
        </div>

        {/* Right: Tilt Sliders & G-Force Meter */}
        <div className="lg:col-span-7 space-y-4 rounded-xs border border-border bg-surface p-4">
          <div className="text-xs font-mono-code uppercase text-text-muted">
            Desktop Tilt &amp; G-Force Vector Simulator
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono-code mb-1">
                <span className="text-text-muted">Pitch β (Front-to-Back Tilt)</span>
                <span className="text-text font-bold">{beta.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min={-45}
                max={45}
                step={0.5}
                value={beta}
                onChange={(e) => handleSimPitchChange(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono-code mb-1">
                <span className="text-text-muted">Roll γ (Left-to-Right Tilt)</span>
                <span className="text-text font-bold">{gamma.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min={-45}
                max={45}
                step={0.5}
                value={gamma}
                onChange={(e) => handleSimRollChange(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono-code mb-1">
                <span className="text-text-muted">Compass Heading α (Yaw)</span>
                <span className="text-text font-bold">{alpha.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono-code mb-1">
                <span className="text-text-muted">Vertical Acceleration Z (m/s²)</span>
                <span className="text-text font-bold">
                  {accZ.toFixed(2)} m/s² ({totalG.toFixed(2)} G)
                </span>
              </div>
              <input
                type="range"
                min={-20}
                max={30}
                step={0.1}
                value={accZ}
                onChange={(e) => setAccZ(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1 font-mono-code text-xs">
            <div className="rounded-xs border border-border bg-background p-2">
              <div className="text-[10px] text-text-muted">ACCEL X</div>
              <div className="font-bold text-text">{accX.toFixed(2)} m/s²</div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2">
              <div className="text-[10px] text-text-muted">ACCEL Y</div>
              <div className="font-bold text-text">{accY.toFixed(2)} m/s²</div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2">
              <div className="text-[10px] text-text-muted">ACCEL Z</div>
              <div className="font-bold text-text">{accZ.toFixed(2)} m/s²</div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2">
              <div className="text-[10px] text-text-muted">NET G-LOAD</div>
              <div className="font-bold text-accent">{totalG.toFixed(3)} G</div>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Pocket Scale & Tare Calibration Converter */}
      <div className="rounded-xs border border-border bg-surface p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-accent" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Digital Pocket Scale Tare &amp; Precision Unit Converter
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setRawGrams(5.0)}
              className="rounded-xs border border-border bg-background px-2 py-1 font-mono-code text-[11px] text-text hover:border-accent cursor-pointer"
            >
              US Nickel (5.00g)
            </button>
            <button
              type="button"
              onClick={() => setRawGrams(2.5)}
              className="rounded-xs border border-border bg-background px-2 py-1 font-mono-code text-[11px] text-text hover:border-accent cursor-pointer"
            >
              US Penny (2.50g)
            </button>
            <button
              type="button"
              onClick={() => setTareOffsetGrams(rawGrams)}
              className="rounded-xs bg-[#ff6a00] px-2.5 py-1 font-heading text-[11px] font-bold uppercase text-white hover:opacity-90 cursor-pointer"
            >
              TARE (Zero Scale)
            </button>
            {tareOffsetGrams !== 0 && (
              <button
                type="button"
                onClick={() => setTareOffsetGrams(0)}
                className="rounded-xs border border-border bg-background px-2 py-1 font-mono-code text-[11px] text-text-muted hover:text-text cursor-pointer"
              >
                Clear Tare ({tareOffsetGrams.toFixed(2)}g)
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div>
            <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
              Gross Scale Reading (Grams)
            </label>
            <input
              type="number"
              step="0.01"
              value={rawGrams}
              onChange={(e) => setRawGrams(Number(e.target.value) || 0)}
              className="w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-sm text-text"
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono-code text-xs">
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">NET GRAMS</div>
              <div className="text-sm font-bold text-accent">
                {scaleUnits.grams.toFixed(2)} g
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">OUNCES (OZ)</div>
              <div className="text-sm font-bold text-text">
                {scaleUnits.ounces.toFixed(3)} oz
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">TROY OZ (OZT)</div>
              <div className="text-sm font-bold text-text">
                {scaleUnits.troyOunces.toFixed(3)}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">CARATS (CT)</div>
              <div className="text-sm font-bold text-text">
                {scaleUnits.carats.toFixed(2)} ct
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">GRAINS (GR)</div>
              <div className="text-sm font-bold text-text">
                {scaleUnits.grains.toFixed(1)} gr
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 15. GPS COORDINATE (DD/DMS/PLUS CODE), NMEA-0183 & GEOFENCE CALCULATOR
 * ========================================================================== */
const OLC_ALPHABET = "23456789CFGHJMPQRVWX";

function encodePlusCode(lat: number, lon: number): string {
  const clampedLat = Math.max(-90, Math.min(89.999999, lat)) + 90;
  const normalizedLon = ((((lon + 180) % 360) + 360) % 360);
  let latVal = Math.floor(clampedLat * 8000);
  let lonVal = Math.floor(normalizedLon * 8000);
  const digits: string[] = [];

  for (let i = 0; i < 5; i++) {
    const lonDigit = lonVal % 20;
    const latDigit = latVal % 20;
    digits.unshift(OLC_ALPHABET[lonDigit]);
    digits.unshift(OLC_ALPHABET[latDigit]);
    latVal = Math.floor(latVal / 20);
    lonVal = Math.floor(lonVal / 20);
  }
  return `${digits.slice(0, 8).join("")}+${digits.slice(8, 10).join("")}`;
}

function toDMS(deg: number, isLat: boolean): string {
  const dir = isLat ? (deg >= 0 ? "N" : "S") : deg >= 0 ? "E" : "W";
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const mFloat = (abs - d) * 60;
  const m = Math.floor(mFloat);
  const s = ((mFloat - m) * 60).toFixed(2);
  return `${d}° ${m}' ${s}" ${dir}`;
}

function formatNmeaCoord(deg: number, isLat: boolean): { val: string; hemi: string } {
  const hemi = isLat ? (deg >= 0 ? "N" : "S") : deg >= 0 ? "E" : "W";
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = (abs - d) * 60;
  const degPad = isLat ? String(d).padStart(2, "0") : String(d).padStart(3, "0");
  const minStr = m.toFixed(4).padStart(7, "0");
  return { val: `${degPad}${minStr}`, hemi };
}

function computeNmeaChecksum(body: string): string {
  let xor = 0;
  for (let i = 0; i < body.length; i++) {
    xor ^= body.charCodeAt(i);
  }
  return xor.toString(16).toUpperCase().padStart(2, "0");
}

function GpsNmeaGeofenceDistanceCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [latA, setLatA] = useState<number>(37.774929);
  const [lonA, setLonA] = useState<number>(-122.419416);
  const [latB, setLatB] = useState<number>(37.819929);
  const [lonB, setLonB] = useState<number>(-122.478255);
  const [geofenceMeters, setGeofenceMeters] = useState<number>(10000);
  const [geoStatus, setGeoStatus] = useState<string>("");

  useEffect(() => {
    if (resetTrigger > 0) {
      setLatA(37.774929);
      setLonA(-122.419416);
      setLatB(37.819929);
      setLonB(-122.478255);
      setGeofenceMeters(10000);
      setGeoStatus("");
    }
  }, [resetTrigger]);

  const useLiveBrowserGeolocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("Geolocation API unavailable");
      return;
    }
    setGeoStatus("Acquiring GPS fix...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatA(Number(pos.coords.latitude.toFixed(6)));
        setLonA(Number(pos.coords.longitude.toFixed(6)));
        setGeoStatus(`GPS Fix Acquired (±${Math.round(pos.coords.accuracy)}m)`);
      },
      () => {
        setGeoStatus("Browser geolocation permission denied");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const metrics = useMemo(() => {
    const R = 6371008.8; // Earth mean radius in meters
    const toRad = (x: number) => (x * Math.PI) / 180;
    const toDeg = (x: number) => (x * 180) / Math.PI;

    const phi1 = toRad(latA);
    const phi2 = toRad(latB);
    const dPhi = toRad(latB - latA);
    const dLambda = toRad(lonB - lonA);

    const a =
      Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceMeters = R * c;
    const distanceKm = distanceMeters / 1000;
    const distanceMiles = distanceKm * 0.62137119;
    const distanceNautical = distanceKm * 0.5399568;

    const y = Math.sin(dLambda) * Math.cos(phi2);
    const x =
      Math.cos(phi1) * Math.sin(phi2) -
      Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
    const initialBearing = (toDeg(Math.atan2(y, x)) + 360) % 360;

    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const cardinal = dirs[Math.round(initialBearing / 45) % 8];

    const insideFence = distanceMeters <= geofenceMeters;

    const dmsA = `${toDMS(latA, true)}, ${toDMS(lonA, false)}`;
    const dmsB = `${toDMS(latB, true)}, ${toDMS(lonB, false)}`;
    const plusA = encodePlusCode(latA, lonA);
    const plusB = encodePlusCode(latB, lonB);

    // Build NMEA-0183 $GPGGA and $GPRMC for Point A
    const nLat = formatNmeaCoord(latA, true);
    const nLon = formatNmeaCoord(lonA, false);
    const utcTime = "123519.00";
    const gpggaBody = `GPGGA,${utcTime},${nLat.val},${nLat.hemi},${nLon.val},${nLon.hemi},1,09,0.9,54.2,M,46.9,M,,`;
    const gpgga = `$${gpggaBody}*${computeNmeaChecksum(gpggaBody)}`;

    const gprmcBody = `GPRMC,${utcTime},A,${nLat.val},${nLat.hemi},${nLon.val},${nLon.hemi},0.0,0.0,280926,0.0,E,A`;
    const gprmc = `$${gprmcBody}*${computeNmeaChecksum(gprmcBody)}`;

    return {
      distanceMeters,
      distanceKm,
      distanceMiles,
      distanceNautical,
      initialBearing,
      cardinal,
      insideFence,
      dmsA,
      dmsB,
      plusA,
      plusB,
      gpgga,
      gprmc,
    };
  }, [latA, lonA, latB, lonB, geofenceMeters]);

  useEffect(() => {
    setOutput(
      [
        `=== GPS HAVERSINE DISTANCE, GEOFENCE & NMEA-0183 REPORT ===`,
        `Point A (Origin)      : ${latA.toFixed(6)}, ${lonA.toFixed(6)}`,
        `  ├─ DMS Format       : ${metrics.dmsA}`,
        `  └─ Open Location Code: ${metrics.plusA}`,
        `Point B (Target)      : ${latB.toFixed(6)}, ${lonB.toFixed(6)}`,
        `  ├─ DMS Format       : ${metrics.dmsB}`,
        `  └─ Open Location Code: ${metrics.plusB}`,
        ``,
        `--- GREAT-CIRCLE HAVERSINE NAVIGATION ---`,
        `Distance (Kilometers) : ${metrics.distanceKm.toFixed(4)} km (${metrics.distanceMeters.toFixed(1)} m)`,
        `Distance (Statute Mi) : ${metrics.distanceMiles.toFixed(4)} miles`,
        `Distance (Nautical Mi): ${metrics.distanceNautical.toFixed(4)} NM`,
        `Initial Forward Azimuth: ${metrics.initialBearing.toFixed(2)}° (${metrics.cardinal})`,
        `Geofence (${geofenceMeters}m)     : ${
          metrics.insideFence ? "INSIDE GEOFENCE PERIMETER" : "OUTSIDE GEOFENCE PERIMETER"
        }`,
        ``,
        `--- NMEA-0183 SENTENCES (POINT A WITH XOR CHECKSUM) ---`,
        metrics.gpgga,
        metrics.gprmc,
      ].join("\n")
    );
  }, [latA, lonA, latB, lonB, geofenceMeters, metrics, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLatA(37.774929);
              setLonA(-122.419416);
              setLatB(37.819929);
              setLonB(-122.478255);
              setGeofenceMeters(10000);
            }}
            className="rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text hover:border-accent cursor-pointer"
          >
            SF Downtown → Golden Gate
          </button>
          <button
            type="button"
            onClick={() => {
              setLatA(35.658581);
              setLonA(139.745433);
              setLatB(35.360626);
              setLonB(138.727363);
              setGeofenceMeters(50000);
            }}
            className="rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text hover:border-accent cursor-pointer"
          >
            Tokyo Tower → Mt. Fuji
          </button>
        </div>

        <button
          type="button"
          onClick={useLiveBrowserGeolocation}
          className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-3 py-1.5 font-heading text-xs font-bold uppercase text-white hover:opacity-90 cursor-pointer"
        >
          <MapPin className="h-3.5 w-3.5" />
          Use My Live Browser Geolocation
        </button>
      </div>

      {geoStatus && (
        <div className="text-xs font-mono-code text-accent">{geoStatus}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Point A */}
        <div className="rounded-xs border border-border bg-surface p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase text-text">
              Point A (Origin / Geofence Center)
            </span>
            <span className="rounded-xs bg-accent/15 px-1.5 py-0.5 font-mono-code text-[11px] text-accent">
              {metrics.plusA}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono-code uppercase text-text-muted">
                Latitude (DD)
              </label>
              <input
                type="number"
                step="0.0001"
                value={latA}
                onChange={(e) => setLatA(Number(e.target.value) || 0)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono-code uppercase text-text-muted">
                Longitude (DD)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lonA}
                onChange={(e) => setLonA(Number(e.target.value) || 0)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
          </div>
          <div className="text-[11px] font-mono-code text-text-muted">
            DMS: <span className="text-text">{metrics.dmsA}</span>
          </div>
        </div>

        {/* Point B */}
        <div className="rounded-xs border border-border bg-surface p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase text-text">
              Point B (Target Coordinate)
            </span>
            <span className="rounded-xs bg-emerald-500/15 px-1.5 py-0.5 font-mono-code text-[11px] text-emerald-400">
              {metrics.plusB}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono-code uppercase text-text-muted">
                Latitude (DD)
              </label>
              <input
                type="number"
                step="0.0001"
                value={latB}
                onChange={(e) => setLatB(Number(e.target.value) || 0)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono-code uppercase text-text-muted">
                Longitude (DD)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lonB}
                onChange={(e) => setLonB(Number(e.target.value) || 0)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
          </div>
          <div className="text-[11px] font-mono-code text-text-muted">
            DMS: <span className="text-text">{metrics.dmsB}</span>
          </div>
        </div>

        {/* Geofence & Bearing Summary */}
        <div className="rounded-xs border border-border bg-surface p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase text-text">
              Geofence Radius Check
            </span>
            <span
              className={`rounded-xs px-2 py-0.5 font-mono-code text-[10px] font-bold ${
                metrics.insideFence
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {metrics.insideFence ? "INSIDE GEOFENCE" : "OUTSIDE GEOFENCE"}
            </span>
          </div>
          <div>
            <label className="block text-[10px] font-mono-code uppercase text-text-muted">
              Geofence Radius Threshold (Meters)
            </label>
            <input
              type="number"
              step="100"
              min="10"
              value={geofenceMeters}
              onChange={(e) => setGeofenceMeters(Math.max(1, Number(e.target.value) || 0))}
              className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
            />
          </div>
          <div className="flex items-center justify-between text-xs font-mono-code pt-1">
            <span className="text-text-muted">Initial Bearing:</span>
            <span className="font-bold text-accent">
              <Navigation
                className="inline h-3.5 w-3.5 mr-1"
                style={{ transform: `rotate(${metrics.initialBearing}deg)` }}
              />
              {metrics.initialBearing.toFixed(2)}° ({metrics.cardinal})
            </span>
          </div>
        </div>
      </div>

      {/* Distance Cards + NMEA Sentences */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-code">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Kilometers</div>
          <div className="text-lg font-bold text-accent">
            {metrics.distanceKm.toFixed(3)} km
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Statute Miles</div>
          <div className="text-lg font-bold text-text">
            {metrics.distanceMiles.toFixed(3)} mi
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Meters</div>
          <div className="text-lg font-bold text-text">
            {Math.round(metrics.distanceMeters).toLocaleString()} m
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] uppercase text-text-muted">Nautical Miles</div>
          <div className="text-lg font-bold text-text">
            {metrics.distanceNautical.toFixed(3)} NM
          </div>
        </div>
      </div>

      <div className="rounded-xs border border-border bg-surface p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono-code">
          <span className="uppercase font-bold text-text">
            Synthesized NMEA-0183 UART Sentences (Point A with XOR *CS Checksum)
          </span>
          <span className="text-[11px] text-emerald-400">Valid 0183 v4.10</span>
        </div>
        <div className="rounded-xs border border-border bg-background p-2.5 font-mono-code text-xs space-y-1 overflow-x-auto">
          <div className="text-accent">{metrics.gpgga}</div>
          <div className="text-emerald-400">{metrics.gprmc}</div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 16. FACE GOLDEN RATIO (1.618), FACIAL LANDMARK & FACE SHAPE CANVAS LAB
 * ========================================================================== */
function FaceGoldenRatioLandmarkCanvasLab({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [uploadedImg, setUploadedImg] = useState<HTMLImageElement | null>(null);

  // Normalized caliper coordinates (0-100 scale on portrait canvas)
  const [hairlineY, setHairlineY] = useState<number>(14);
  const [glabellaY, setGlabellaY] = useState<number>(38);
  const [subnasaleY, setSubnasaleY] = useState<number>(63);
  const [mentonY, setMentonY] = useState<number>(88);

  const [foreheadW, setForeheadW] = useState<number>(44);
  const [cheekboneW, setCheekboneW] = useState<number>(46);
  const [jawlineW, setJawlineW] = useState<number>(38);
  const [ipdW, setIpdW] = useState<number>(20);
  const [noseW, setNoseW] = useState<number>(12.5);
  const [lipW, setLipW] = useState<number>(20.2);

  useEffect(() => {
    if (resetTrigger > 0) {
      setUploadedImg(null);
      setHairlineY(14);
      setGlabellaY(38);
      setSubnasaleY(63);
      setMentonY(88);
      setForeheadW(44);
      setCheekboneW(46);
      setJawlineW(38);
      setIpdW(20);
      setNoseW(12.5);
      setLipW(20.2);
    }
  }, [resetTrigger]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setUploadedImg(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const analysis = useMemo(() => {
    const PHI = 1.6180339887;
    const faceHeight = Math.max(10, mentonY - hairlineY);
    const upperThird = Math.max(1, glabellaY - hairlineY);
    const middleThird = Math.max(1, subnasaleY - glabellaY);
    const lowerThird = Math.max(1, mentonY - subnasaleY);

    const upperPct = (upperThird / faceHeight) * 100;
    const middlePct = (middleThird / faceHeight) * 100;
    const lowerPct = (lowerThird / faceHeight) * 100;

    const thirdsDeviation =
      (Math.abs(upperPct - 33.33) +
        Math.abs(middlePct - 33.33) +
        Math.abs(lowerPct - 33.33)) /
      3;
    const thirdsBalanceScore = Math.max(0, Math.min(100, 100 - thirdsDeviation * 3.2));

    // Ratios vs Golden Ratio (1.618)
    const lengthToWidthRatio = faceHeight / Math.max(1, cheekboneW);
    const lipToNoseRatio = lipW / Math.max(1, noseW);
    const cheekboneToJawRatio = cheekboneW / Math.max(1, jawlineW);

    // fWHR (Bizygomatic Width to Upper Face Height: Glabella to Subnasale/Upper Lip)
    const fwhr = cheekboneW / Math.max(1, middleThird);

    const err1 = Math.abs(lengthToWidthRatio - PHI) / PHI;
    const err2 = Math.abs(lipToNoseRatio - PHI) / PHI;
    const err3 = Math.abs(cheekboneToJawRatio - 1.25) / 1.25;
    const phiHarmony = Math.max(
      0,
      Math.min(100, 100 - ((err1 * 0.45 + err2 * 0.35 + err3 * 0.2) * 100))
    );

    const overallScore = phiHarmony * 0.65 + thirdsBalanceScore * 0.35;

    // Face Shape Classification
    let faceShape = "Oval";
    let recommendation =
      "Balanced proportions; suits aviator, wayfarer, or geometric frames and versatile hairstyles.";
    if (lengthToWidthRatio > 1.72 && Math.abs(foreheadW - jawlineW) < 4) {
      faceShape = "Oblong";
      recommendation =
        "Longer vertical axis; opt for oversized or tall-lens frames and side-swept volume or bangs.";
    } else if (lengthToWidthRatio < 1.38 && jawlineW / cheekboneW > 0.88) {
      faceShape = "Square";
      recommendation =
        "Strong angular jawline; round or oval frames soften angles; textured tops add height.";
    } else if (lengthToWidthRatio < 1.38) {
      faceShape = "Round";
      recommendation =
        "Soft curved contours; rectangular or angular browline frames add structure and definition.";
    } else if (foreheadW > jawlineW * 1.18) {
      faceShape = "Heart";
      recommendation =
        "Broad forehead tapering to chin; bottom-heavy or rimless frames balance upper width.";
    } else if (cheekboneW > foreheadW * 1.1 && cheekboneW > jawlineW * 1.15) {
      faceShape = "Diamond";
      recommendation =
        "Prominent cheekbones; cat-eye or oval browline frames highlight eyes and soften cheekbones.";
    }

    return {
      faceHeight,
      upperPct,
      middlePct,
      lowerPct,
      thirdsBalanceScore,
      lengthToWidthRatio,
      lipToNoseRatio,
      fwhr,
      overallScore,
      faceShape,
      recommendation,
    };
  }, [
    hairlineY,
    glabellaY,
    subnasaleY,
    mentonY,
    foreheadW,
    cheekboneW,
    jawlineW,
    noseW,
    lipW,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#0f131a";
    ctx.fillRect(0, 0, W, H);

    if (uploadedImg) {
      const scale = Math.min(W / uploadedImg.width, H / uploadedImg.height);
      const dw = uploadedImg.width * scale;
      const dh = uploadedImg.height * scale;
      ctx.drawImage(uploadedImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
      ctx.fillStyle = "rgba(10, 14, 20, 0.35)";
      ctx.fillRect(0, 0, W, H);
    } else {
      // Draw parametric geometric face mesh
      const cx = W / 2;
      const yHair = (hairlineY / 100) * H;
      const yGlab = (glabellaY / 100) * H;
      const ySub = (subnasaleY / 100) * H;
      const yChin = (mentonY / 100) * H;

      const wFore = (foreheadW / 100) * W * 0.5;
      const wCheek = (cheekboneW / 100) * W * 0.5;
      const wJaw = (jawlineW / 100) * W * 0.5;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
      ctx.fillStyle = "rgba(255, 106, 0, 0.07)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, yHair - 10);
      ctx.bezierCurveTo(cx + wFore, yHair - 8, cx + wFore, yGlab, cx + wCheek, (yGlab + ySub) / 2);
      ctx.bezierCurveTo(cx + wCheek * 0.95, ySub, cx + wJaw, (ySub + yChin) / 2, cx, yChin);
      ctx.bezierCurveTo(cx - wJaw, (ySub + yChin) / 2, cx - wCheek * 0.95, ySub, cx - wCheek, (yGlab + ySub) / 2);
      ctx.bezierCurveTo(cx - wFore, yGlab, cx - wFore, yHair - 8, cx, yHair - 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Draw Horizontal Facial Thirds Lines
    const thirds = [
      { y: hairlineY, label: "1. Trichion (Hairline)" },
      { y: glabellaY, label: "2. Glabella (Brow)" },
      { y: subnasaleY, label: "3. Subnasale (Nose Base)" },
      { y: mentonY, label: "4. Menton (Chin)" },
    ];

    thirds.forEach((t) => {
      const py = (t.y / 100) * H;
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(24, py);
      ctx.lineTo(W - 24, py);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#10b981";
      ctx.font = "10px monospace";
      ctx.fillText(t.label, 28, py - 4);
    });

    // Draw Width Calipers (Cheekbone, IPD, Nose, Lip)
    const cx = W / 2;
    const drawCaliper = (yPct: number, wPct: number, color: string, tag: string) => {
      const py = (yPct / 100) * H;
      const half = ((wPct / 100) * W) / 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - half, py);
      ctx.lineTo(cx + half, py);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx - half, py, 3.5, 0, Math.PI * 2);
      ctx.arc(cx + half, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "10px monospace";
      ctx.fillText(tag, cx + half + 6, py + 3);
    };

    drawCaliper((glabellaY + subnasaleY) / 2, cheekboneW, "#ff6a00", "Bizygomatic");
    drawCaliper(glabellaY + 5, ipdW, "#38bdf8", "IPD");
    drawCaliper(subnasaleY - 2, noseW, "#eab308", "Nose");
    drawCaliper(subnasaleY + (mentonY - subnasaleY) * 0.38, lipW, "#f43f5e", "Lips");
  }, [
    uploadedImg,
    hairlineY,
    glabellaY,
    subnasaleY,
    mentonY,
    foreheadW,
    cheekboneW,
    jawlineW,
    ipdW,
    noseW,
    lipW,
  ]);

  useEffect(() => {
    setOutput(
      [
        `=== FACIAL GOLDEN RATIO (PHI = 1.618) & BIOMETRIC LANDMARK REPORT ===`,
        `Phi Harmony Score       : ${analysis.overallScore.toFixed(1)} / 100`,
        `Classified Face Shape   : ${analysis.faceShape}`,
        `Style Recommendation    : ${analysis.recommendation}`,
        ``,
        `--- NEOCLASSICAL FACIAL THIRDS (IDEAL 33.3% EACH) ---`,
        `Upper Third (Forehead)  : ${analysis.upperPct.toFixed(1)}%`,
        `Middle Third (Midface)  : ${analysis.middlePct.toFixed(1)}%`,
        `Lower Third (Jaw/Chin)  : ${analysis.lowerPct.toFixed(1)}%`,
        `Thirds Symmetry Balance : ${analysis.thirdsBalanceScore.toFixed(1)}%`,
        ``,
        `--- KEY ANTHROPOMETRIC RATIOS ---`,
        `Face Height / Width     : ${analysis.lengthToWidthRatio.toFixed(3)} (Target Φ = 1.618)`,
        `Mouth Width / Nose Width: ${analysis.lipToNoseRatio.toFixed(3)} (Target Φ = 1.618)`,
        `Facial Width-to-Height  : ${analysis.fwhr.toFixed(2)} fWHR`,
      ].join("\n")
    );
  }, [analysis, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-3 py-1.5 font-heading text-xs font-bold uppercase text-white hover:opacity-90 cursor-pointer">
            <Upload className="h-3.5 w-3.5" />
            Upload Portrait Photo (Local Canvas)
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setHairlineY(14);
              setGlabellaY(38.6);
              setSubnasaleY(63.3);
              setMentonY(88);
              setForeheadW(43);
              setCheekboneW(45.7);
              setJawlineW(36.5);
              setNoseW(12.5);
              setLipW(20.2);
            }}
            className="rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text hover:border-accent cursor-pointer"
          >
            Load Ideal Phi (1.618) Preset
          </button>
        </div>
        <span className="font-mono-code text-xs text-text-muted">
          100% Client-Side Biometric Mesh (Zero Server Upload)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 flex flex-col items-center rounded-xs border border-border bg-surface p-3">
          <canvas
            ref={canvasRef}
            width={320}
            height={360}
            className="w-full max-w-[320px] rounded-xs border border-border"
          />
        </div>

        <div className="lg:col-span-7 space-y-3 rounded-xs border border-border bg-surface p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono-code">
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">PHI HARMONY SCORE</div>
              <div className="text-lg font-bold text-accent">
                {analysis.overallScore.toFixed(1)} / 100
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">FACE SHAPE</div>
              <div className="text-lg font-bold text-emerald-400">
                {analysis.faceShape}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">fWHR RATIO</div>
              <div className="text-lg font-bold text-text">
                {analysis.fwhr.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-code">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Hairline (Trichion Y)</span>
                <span>{hairlineY}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={hairlineY}
                onChange={(e) => setHairlineY(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Brow (Glabella Y)</span>
                <span>{glabellaY}%</span>
              </div>
              <input
                type="range"
                min={28}
                max={52}
                value={glabellaY}
                onChange={(e) => setGlabellaY(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Nose Base (Subnasale Y)</span>
                <span>{subnasaleY}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={75}
                value={subnasaleY}
                onChange={(e) => setSubnasaleY(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Chin (Menton Y)</span>
                <span>{mentonY}%</span>
              </div>
              <input
                type="range"
                min={76}
                max={96}
                value={mentonY}
                onChange={(e) => setMentonY(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Bizygomatic Cheekbone Width</span>
                <span>{cheekboneW}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={68}
                step={0.5}
                value={cheekboneW}
                onChange={(e) => setCheekboneW(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Jawline Width (Gonion)</span>
                <span>{jawlineW}%</span>
              </div>
              <input
                type="range"
                min={24}
                max={62}
                step={0.5}
                value={jawlineW}
                onChange={(e) => setJawlineW(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Nose Alar Width</span>
                <span>{noseW}%</span>
              </div>
              <input
                type="range"
                min={8}
                max={24}
                step={0.2}
                value={noseW}
                onChange={(e) => setNoseW(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Lip Commissure Width</span>
                <span>{lipW}%</span>
              </div>
              <input
                type="range"
                min={12}
                max={34}
                step={0.2}
                value={lipW}
                onChange={(e) => setLipW(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
          </div>

          <div className="rounded-xs border border-border bg-background p-2.5 font-mono-code text-xs space-y-1">
            <div className="flex justify-between text-text-muted">
              <span>
                Facial Thirds: {analysis.upperPct.toFixed(1)}% /{" "}
                {analysis.middlePct.toFixed(1)}% / {analysis.lowerPct.toFixed(1)}%
              </span>
              <span className="text-emerald-400">
                Length/Width: {analysis.lengthToWidthRatio.toFixed(3)} | Lip/Nose:{" "}
                {analysis.lipToNoseRatio.toFixed(3)}
              </span>
            </div>
            <div className="text-text">{analysis.recommendation}</div>
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 17. AI IMAGE PROMPT ARCHITECT & LATENT ASPECT-RATIO RESOLUTION STUDIO
 * ========================================================================== */
const ASPECT_PRESETS: Record<string, { wRatio: number; hRatio: number; label: string }> = {
  "1:1": { wRatio: 1, hRatio: 1, label: "1:1 Square Avatar / Product" },
  "16:9": { wRatio: 16, hRatio: 9, label: "16:9 Widescreen Cinema / YouTube" },
  "9:16": { wRatio: 9, hRatio: 16, label: "9:16 Vertical Reels / Shorts" },
  "4:5": { wRatio: 4, hRatio: 5, label: "4:5 Editorial Portrait" },
  "21:9": { wRatio: 21, hRatio: 9, label: "21:9 Anamorphic Ultrawide" },
  "3:2": { wRatio: 3, hRatio: 2, label: "3:2 Full-Frame 35mm Photo" },
};

function AiImagePromptAspectRatioStudio({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [engine, setEngine] = useState<"midjourney" | "flux" | "sdxl">("midjourney");
  const [subject, setSubject] = useState(
    "A lone cybernetic watchmaker repairing a floating bioluminescent astrolabe inside a rain-streaked Neo-Tokyo atelier"
  );
  const [medium, setMedium] = useState("Editorial cinematic photography, Kodak Vision3 500T");
  const [cameraLens, setCameraLens] = useState("85mm f/1.4 prime lens, shallow depth of field");
  const [lighting, setLighting] = useState("Volumetric tungsten rim lighting, cyan neon reflections");
  const [colorGrade, setColorGrade] = useState("Teal and amber grading, rich shadow contrast");
  const [negativePrompt, setNegativePrompt] = useState("blurry, deformed hands, watermark, text, oversaturated");

  const [aspectKey, setAspectKey] = useState<string>("16:9");
  const [targetMegapixels, setTargetMegapixels] = useState<number>(1.0);
  const [mjStylize, setMjStylize] = useState<number>(250);
  const [mjWeird, setMjWeird] = useState<number>(0);

  useEffect(() => {
    if (resetTrigger > 0) {
      setEngine("midjourney");
      setAspectKey("16:9");
      setTargetMegapixels(1.0);
      setMjStylize(250);
      setMjWeird(0);
    }
  }, [resetTrigger]);

  const resolutionCalc = useMemo(() => {
    const preset = ASPECT_PRESETS[aspectKey] || ASPECT_PRESETS["1:1"];
    const totalPixels = targetMegapixels * 1_048_576;
    const rawH = Math.sqrt(totalPixels * (preset.hRatio / preset.wRatio));
    const rawW = rawH * (preset.wRatio / preset.hRatio);

    // Snap to exact multiple of 64 for SDXL / Flux VAE & DiT patch alignment
    const width64 = Math.max(512, Math.round(rawW / 64) * 64);
    const height64 = Math.max(512, Math.round(rawH / 64) * 64);
    const actualMp = (width64 * height64) / 1_000_000;
    const latentW = width64 / 8;
    const latentH = height64 / 8;

    return { width64, height64, actualMp, latentW, latentH };
  }, [aspectKey, targetMegapixels]);

  const compiledPrompt = useMemo(() => {
    const core = `${subject}. ${medium}, shot on ${cameraLens}, ${lighting}, ${colorGrade}, ultra-detailed 8k textures.`;
    if (engine === "midjourney") {
      const noFlag = negativePrompt.trim()
        ? ` --no ${negativePrompt.replace(/,/g, " ")}`
        : "";
      const weirdFlag = mjWeird > 0 ? ` --weird ${mjWeird}` : "";
      return `/imagine prompt: ${core} --ar ${aspectKey} --v 7 --stylize ${mjStylize}${weirdFlag} --style raw${noFlag}`;
    }
    if (engine === "flux") {
      return `${core}\n[Flux.1 Guidance: 3.5 | Steps: 28 | Resolution: ${resolutionCalc.width64}x${resolutionCalc.height64}]`;
    }
    return `Positive Prompt:\n${core}\n\nNegative Prompt:\n${negativePrompt}\n[SDXL KSampler: DPM++ 2M SDE Karras | CFG: 6.5 | Size: ${resolutionCalc.width64}x${resolutionCalc.height64}]`;
  }, [
    engine,
    subject,
    medium,
    cameraLens,
    lighting,
    colorGrade,
    negativePrompt,
    aspectKey,
    mjStylize,
    mjWeird,
    resolutionCalc,
  ]);

  useEffect(() => {
    setOutput(
      [
        `=== AI IMAGE PROMPT & LATENT RESOLUTION ARCHITECT ===`,
        `Target Model Engine   : ${engine.toUpperCase()}`,
        `Aspect Ratio          : ${aspectKey} (${ASPECT_PRESETS[aspectKey]?.label})`,
        `Divisible-by-64 Size  : ${resolutionCalc.width64} × ${resolutionCalc.height64} px (${resolutionCalc.actualMp.toFixed(2)} MP)`,
        `VAE Latent Tensor     : [1, 16, ${resolutionCalc.latentH}, ${resolutionCalc.latentW}]`,
        ``,
        `--- COMPILED PRODUCTION PROMPT ---`,
        compiledPrompt,
      ].join("\n")
    );
  }, [engine, aspectKey, resolutionCalc, compiledPrompt, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "midjourney", label: "Midjourney v7" },
              { id: "flux", label: "Flux.1 Dev / Pro" },
              { id: "sdxl", label: "Stable Diffusion XL" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setEngine(m.id)}
              className={`rounded-xs px-3 py-1.5 font-heading text-xs font-bold uppercase cursor-pointer ${
                engine === m.id
                  ? "bg-[#ff6a00] text-white"
                  : "border border-border bg-background text-text hover:border-accent"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {Object.keys(ASPECT_PRESETS).map((ar) => (
            <button
              key={ar}
              type="button"
              onClick={() => setAspectKey(ar)}
              className={`rounded-xs px-2.5 py-1 font-mono-code text-xs cursor-pointer ${
                aspectKey === ar
                  ? "border border-accent bg-accent/20 text-accent font-bold"
                  : "border border-border bg-background text-text-muted hover:text-text"
              }`}
            >
              {ar}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 space-y-3 rounded-xs border border-border bg-surface p-4">
          <div>
            <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
              Primary Subject &amp; Scene Narrative
            </label>
            <textarea
              rows={2}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xs border border-border bg-background p-2.5 font-mono-code text-xs text-text"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
                Art Medium / Film Stock
              </label>
              <input
                type="text"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
                Camera &amp; Lens Optics
              </label>
              <input
                type="text"
                value={cameraLens}
                onChange={(e) => setCameraLens(e.target.value)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
                Lighting Architecture
              </label>
              <input
                type="text"
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
                Color Grading &amp; Mood
              </label>
              <input
                type="text"
                value={colorGrade}
                onChange={(e) => setColorGrade(e.target.value)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono-code uppercase text-text-muted mb-1">
              Negative Exclusions (--no / Negative Prompt)
            </label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text"
            />
          </div>
        </div>

        {/* Latent Megapixel & Divisible-by-64 Calculator */}
        <div className="lg:col-span-5 space-y-3 rounded-xs border border-border bg-surface p-4">
          <div className="font-heading text-xs font-bold uppercase text-text">
            Latent Megapixel &amp; Divisible-by-64 Calculator
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono-code">
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">EXACT 64-ALIGNED</div>
              <div className="text-base font-bold text-accent">
                {resolutionCalc.width64} × {resolutionCalc.height64}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">LATENT TENSOR (÷8)</div>
              <div className="text-base font-bold text-emerald-400">
                {resolutionCalc.latentW} × {resolutionCalc.latentH}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono-code mb-1">
              <span className="text-text-muted">Target Megapixel Budget</span>
              <span className="font-bold text-text">{targetMegapixels.toFixed(1)} MP</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.25}
              value={targetMegapixels}
              onChange={(e) => setTargetMegapixels(Number(e.target.value))}
              className="w-full accent-[#ff6a00]"
            />
          </div>

          {engine === "midjourney" && (
            <div className="grid grid-cols-2 gap-3 text-xs font-mono-code">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-text-muted">--stylize</span>
                  <span>{mjStylize}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={50}
                  value={mjStylize}
                  onChange={(e) => setMjStylize(Number(e.target.value))}
                  className="w-full accent-[#ff6a00]"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-text-muted">--weird</span>
                  <span>{mjWeird}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3000}
                  step={100}
                  value={mjWeird}
                  onChange={(e) => setMjWeird(Number(e.target.value))}
                  className="w-full accent-[#ff6a00]"
                />
              </div>
            </div>
          )}

          <div className="rounded-xs border border-border bg-background p-2.5">
            <div className="text-[10px] font-mono-code uppercase text-text-muted mb-1">
              Compiled Prompt Output
            </div>
            <pre className="whitespace-pre-wrap font-mono-code text-xs text-accent">
              {compiledPrompt}
            </pre>
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 18. 3D MESH (.OBJ/.STL) POLYGON WIREFRAME & 3D PRINT FILAMENT COST CALCULATOR
 * ========================================================================== */
const PRESET_OBJ_MESHES: Record<string, string> = {
  octahedron: `# Octahedron Crystal (6 vertices, 8 triangular faces)
v 0.0 0.0 45.0
v 35.0 0.0 0.0
v 0.0 35.0 0.0
v -35.0 0.0 0.0
v 0.0 -35.0 0.0
v 0.0 0.0 -45.0
f 1 2 3
f 1 3 4
f 1 4 5
f 1 5 2
f 6 3 2
f 6 4 3
f 6 5 4
f 6 2 5`,
  icosahedron: (() => {
    const t = (1 + Math.sqrt(5)) / 2;
    const s = 22;
    const verts = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ].map(([x, y, z]) => `v ${(x * s).toFixed(2)} ${(y * s).toFixed(2)} ${(z * s).toFixed(2)}`);
    const faces = [
      [1, 12, 6], [1, 6, 2], [1, 2, 8], [1, 8, 11], [1, 11, 12],
      [2, 6, 10], [6, 12, 5], [12, 11, 3], [11, 8, 7], [8, 2, 9],
      [4, 10, 5], [4, 5, 3], [4, 3, 7], [4, 7, 9], [4, 9, 10],
      [5, 10, 6], [3, 5, 12], [7, 3, 11], [9, 7, 8], [10, 9, 2],
    ].map(([a, b, c]) => `f ${a} ${b} ${c}`);
    return [`# Cyber Icosahedron (12 vertices, 20 faces)`, ...verts, ...faces].join("\n");
  })(),
  torus: (() => {
    const R = 30;
    const r = 12;
    const segU = 12;
    const segV = 8;
    const lines: string[] = [`# Low-Poly Torus Ring`];
    for (let i = 0; i < segU; i++) {
      const u = (i / segU) * Math.PI * 2;
      for (let j = 0; j < segV; j++) {
        const v = (j / segV) * Math.PI * 2;
        const x = (R + r * Math.cos(v)) * Math.cos(u);
        const y = (R + r * Math.cos(v)) * Math.sin(u);
        const z = r * Math.sin(v);
        lines.push(`v ${x.toFixed(2)} ${y.toFixed(2)} ${z.toFixed(2)}`);
      }
    }
    for (let i = 0; i < segU; i++) {
      const ni = (i + 1) % segU;
      for (let j = 0; j < segV; j++) {
        const nj = (j + 1) % segV;
        const a = i * segV + j + 1;
        const b = ni * segV + j + 1;
        const c = ni * segV + nj + 1;
        const d = i * segV + nj + 1;
        lines.push(`f ${a} ${b} ${c}`);
        lines.push(`f ${a} ${c} ${d}`);
      }
    }
    return lines.join("\n");
  })(),
};

const FILAMENT_DENSITY: Record<string, { density: number; nozzleTemp: string }> = {
  PLA: { density: 1.24, nozzleTemp: "205°C / Bed 60°C" },
  PETG: { density: 1.27, nozzleTemp: "240°C / Bed 75°C" },
  ABS: { density: 1.04, nozzleTemp: "250°C / Bed 100°C" },
  TPU: { density: 1.21, nozzleTemp: "225°C / Bed 50°C" },
};

function MeshObjStlPolygonPrintCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [objText, setObjText] = useState<string>(PRESET_OBJ_MESHES.icosahedron);
  const [pitch, setPitch] = useState<number>(28);
  const [yaw, setYaw] = useState<number>(36);
  const [material, setMaterial] = useState<string>("PLA");
  const [infillPct, setInfillPct] = useState<number>(20);
  const [spoolPricePerKg, setSpoolPricePerKg] = useState<number>(22);

  useEffect(() => {
    if (resetTrigger > 0) {
      setObjText(PRESET_OBJ_MESHES.icosahedron);
      setPitch(28);
      setYaw(36);
      setMaterial("PLA");
      setInfillPct(20);
      setSpoolPricePerKg(22);
    }
  }, [resetTrigger]);

  const parsedMesh = useMemo(() => {
    const vertices: [number, number, number][] = [];
    const faces: number[][] = [];
    const lines = objText.split(/\r?\n/);

    for (const raw of lines) {
      const line = raw.trim();
      if (line.startsWith("v ")) {
        const parts = line.split(/\s+/);
        if (parts.length >= 4) {
          vertices.push([
            Number(parts[1]) || 0,
            Number(parts[2]) || 0,
            Number(parts[3]) || 0,
          ]);
        }
      } else if (line.startsWith("f ")) {
        const parts = line.slice(2).trim().split(/\s+/);
        const idx = parts
          .map((p) => parseInt(p.split("/")[0], 10) - 1)
          .filter((n) => !Number.isNaN(n) && n >= 0);
        if (idx.length >= 3) faces.push(idx);
      }
    }

    if (vertices.length === 0) {
      return {
        vertices,
        faces,
        sizeX: 0,
        sizeY: 0,
        sizeZ: 0,
        volumeCm3: 0,
        filamentGrams: 0,
        filamentMeters: 0,
        spoolCost: 0,
        printMinutes: 0,
      };
    }

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const [x, y, z] of vertices) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }

    const sizeX = Math.max(1, maxX - minX);
    const sizeY = Math.max(1, maxY - minY);
    const sizeZ = Math.max(1, maxZ - minZ);

    // Estimate mesh volume in cm^3 (bounding box * shape packing factor 0.52)
    const bboxCm3 = (sizeX * sizeY * sizeZ) / 1000;
    const volumeCm3 = bboxCm3 * 0.52;

    // Shell volume (25%) + infill volume (75% * infill%)
    const effectiveVolumeCm3 = volumeCm3 * (0.25 + 0.75 * (infillPct / 100));
    const matInfo = FILAMENT_DENSITY[material] || FILAMENT_DENSITY.PLA;
    const filamentGrams = effectiveVolumeCm3 * matInfo.density;
    // 1.75mm filament cross-sectional area = 0.02405 cm^2
    const filamentMeters = effectiveVolumeCm3 / 2.405;
    const spoolCost = (filamentGrams / 1000) * spoolPricePerKg;
    // Flow rate ~8 mm^3/s => ~0.48 cm^3/min
    const printMinutes = Math.max(5, Math.round(effectiveVolumeCm3 / 0.35));

    return {
      vertices,
      faces,
      sizeX,
      sizeY,
      sizeZ,
      volumeCm3,
      filamentGrams,
      filamentMeters,
      spoolCost,
      printMinutes,
    };
  }, [objText, material, infillPct, spoolPricePerKg]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(0, 0, W, H);

    const { vertices, faces, sizeX, sizeY, sizeZ } = parsedMesh;
    if (vertices.length === 0) return;

    const maxSpan = Math.max(sizeX, sizeY, sizeZ, 1);
    const scale = (Math.min(W, H) * 0.68) / maxSpan;
    const radP = (pitch * Math.PI) / 180;
    const radY = (yaw * Math.PI) / 180;

    const projected = vertices.map(([x, y, z]) => {
      // Yaw around Y
      const x1 = x * Math.cos(radY) - z * Math.sin(radY);
      const z1 = x * Math.sin(radY) + z * Math.cos(radY);
      // Pitch around X
      const y2 = y * Math.cos(radP) - z1 * Math.sin(radP);
      return [W / 2 + x1 * scale, H / 2 - y2 * scale] as const;
    });

    ctx.strokeStyle = "#ff6a00";
    ctx.lineWidth = 1.25;
    for (const face of faces) {
      ctx.beginPath();
      for (let i = 0; i < face.length; i++) {
        const pt = projected[face[i]];
        if (!pt) continue;
        if (i === 0) ctx.moveTo(pt[0], pt[1]);
        else ctx.lineTo(pt[0], pt[1]);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }, [parsedMesh, pitch, yaw]);

  useEffect(() => {
    setOutput(
      [
        `=== 3D MESH (.OBJ) WIREFRAME & FDM PRINT SLICER ESTIMATE ===`,
        `Polygon Topology   : ${parsedMesh.vertices.length} Vertices | ${parsedMesh.faces.length} Faces`,
        `Bounding Box (mm)  : ${parsedMesh.sizeX.toFixed(1)} × ${parsedMesh.sizeY.toFixed(1)} × ${parsedMesh.sizeZ.toFixed(1)} mm`,
        `Solid Mesh Volume  : ${parsedMesh.volumeCm3.toFixed(2)} cm³`,
        `Filament Material  : ${material} (${FILAMENT_DENSITY[material]?.nozzleTemp}) @ ${infillPct}% Infill`,
        `Filament Weight    : ${parsedMesh.filamentGrams.toFixed(1)} g (${parsedMesh.filamentMeters.toFixed(2)} m of 1.75mm)`,
        `Estimated Cost     : $${parsedMesh.spoolCost.toFixed(2)} (@ $${spoolPricePerKg}/kg)`,
        `Estimated Print Time: ${Math.floor(parsedMesh.printMinutes / 60)}h ${parsedMesh.printMinutes % 60}m`,
      ].join("\n")
    );
  }, [parsedMesh, material, infillPct, spoolPricePerKg, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setObjText(PRESET_OBJ_MESHES.icosahedron)}
            className="rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text hover:border-accent cursor-pointer"
          >
            Cyber Icosahedron
          </button>
          <button
            type="button"
            onClick={() => setObjText(PRESET_OBJ_MESHES.torus)}
            className="rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text hover:border-accent cursor-pointer"
          >
            Low-Poly Torus
          </button>
          <button
            type="button"
            onClick={() => setObjText(PRESET_OBJ_MESHES.octahedron)}
            className="rounded-xs border border-border bg-background px-2.5 py-1.5 font-mono-code text-xs text-text hover:border-accent cursor-pointer"
          >
            Octahedron Crystal
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {Object.keys(FILAMENT_DENSITY).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMaterial(m)}
              className={`rounded-xs px-2.5 py-1 font-mono-code text-xs cursor-pointer ${
                material === m
                  ? "bg-[#ff6a00] text-white font-bold"
                  : "border border-border bg-background text-text"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 flex flex-col items-center rounded-xs border border-border bg-surface p-3 space-y-2">
          <canvas
            ref={canvasRef}
            width={300}
            height={260}
            className="w-full max-w-[300px] rounded-xs border border-border"
          />
          <div className="grid w-full grid-cols-2 gap-2 text-xs font-mono-code">
            <div>
              <span className="text-text-muted">Pitch: {pitch}°</span>
              <input
                type="range"
                min={-90}
                max={90}
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
            <div>
              <span className="text-text-muted">Yaw: {yaw}°</span>
              <input
                type="range"
                min={0}
                max={360}
                value={yaw}
                onChange={(e) => setYaw(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3 rounded-xs border border-border bg-surface p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-code">
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">VERTICES / FACES</div>
              <div className="text-sm font-bold text-text">
                {parsedMesh.vertices.length}v / {parsedMesh.faces.length}f
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">FILAMENT WEIGHT</div>
              <div className="text-sm font-bold text-accent">
                {parsedMesh.filamentGrams.toFixed(1)} g
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">MATERIAL COST</div>
              <div className="text-sm font-bold text-emerald-400">
                ${parsedMesh.spoolCost.toFixed(2)}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">PRINT TIME</div>
              <div className="text-sm font-bold text-text">
                {Math.floor(parsedMesh.printMinutes / 60)}h {parsedMesh.printMinutes % 60}m
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono-code">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Grid Infill Density</span>
                <span className="font-bold">{infillPct}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={infillPct}
                onChange={(e) => setInfillPct(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-muted mb-1">
                Spool Price ($ / 1kg)
              </label>
              <input
                type="number"
                value={spoolPricePerKg}
                onChange={(e) => setSpoolPricePerKg(Number(e.target.value) || 0)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1 font-mono-code text-xs text-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono-code uppercase text-text-muted mb-1">
              Wavefront .OBJ Vertex (`v`) &amp; Face (`f`) Source
            </label>
            <textarea
              rows={5}
              value={objText}
              onChange={(e) => setObjText(e.target.value)}
              className="w-full rounded-xs border border-border bg-background p-2.5 font-mono-code text-xs text-text"
            />
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 19. OUTDOOR SPEAKER SPL DECIBEL, AMPLIFIER WATTAGE & DISTANCE CALCULATOR
 * ========================================================================== */
function OutdoorSpeakerSplDecibelCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [sensitivityDb, setSensitivityDb] = useState<number>(92);
  const [ampWatts, setAmpWatts] = useState<number>(150);
  const [speakerCount, setSpeakerCount] = useState<number>(2);
  const [distanceMeters, setDistanceMeters] = useState<number>(6);
  const [envGainDb, setEnvGainDb] = useState<number>(0); // 0 = Outdoor Free-Field, 3 = Indoor Room, 6 = Corner

  useEffect(() => {
    if (resetTrigger > 0) {
      setSensitivityDb(92);
      setAmpWatts(150);
      setSpeakerCount(2);
      setDistanceMeters(6);
      setEnvGainDb(0);
    }
  }, [resetTrigger]);

  const calc = useMemo(() => {
    const safeWatts = Math.max(0.1, ampWatts);
    const safeDist = Math.max(0.5, distanceMeters);
    const powerGainDb = 10 * Math.log10(safeWatts);
    const speakerArrayGainDb = 10 * Math.log10(Math.max(1, speakerCount));
    const distanceLossDb = 20 * Math.log10(safeDist);

    const splAt1m = sensitivityDb + powerGainDb + speakerArrayGainDb + envGainDb;
    const peakSplAtListener = splAt1m - distanceLossDb;
    const continuousSpl = peakSplAtListener - 3; // -3dB thermal/crest margin

    // Required watts per speaker to hit 85dB (Cinema Ref) & 100dB (Outdoor Party) at listener
    const wattsForTarget = (targetDb: number) => {
      const neededPowerDb =
        targetDb + distanceLossDb - sensitivityDb - speakerArrayGainDb - envGainDb;
      return Math.pow(10, neededPowerDb / 10);
    };

    return {
      powerGainDb,
      speakerArrayGainDb,
      distanceLossDb,
      splAt1m,
      peakSplAtListener,
      continuousSpl,
      watts85: wattsForTarget(85),
      watts95: wattsForTarget(95),
      watts105: wattsForTarget(105),
    };
  }, [sensitivityDb, ampWatts, speakerCount, distanceMeters, envGainDb]);

  useEffect(() => {
    setOutput(
      [
        `=== ACOUSTIC SPL DECIBEL & AMPLIFIER WATTAGE REPORT ===`,
        `Speaker Sensitivity : ${sensitivityDb} dB (1W @ 1m)`,
        `Amplifier Power     : ${ampWatts} W × ${speakerCount} speakers (+${calc.powerGainDb.toFixed(1)} dBW)`,
        `Listener Distance   : ${distanceMeters} m (${(distanceMeters * 3.28084).toFixed(1)} ft) -> -${calc.distanceLossDb.toFixed(1)} dB attenuation`,
        `Peak SPL @ Listener : ${calc.peakSplAtListener.toFixed(1)} dB SPL`,
        `Continuous Avg SPL  : ${calc.continuousSpl.toFixed(1)} dB SPL`,
        `Watts Needed for 85dB / 95dB / 105dB: ${calc.watts85.toFixed(1)}W / ${calc.watts95.toFixed(1)}W / ${calc.watts105.toFixed(0)}W`,
      ].join("\n")
    );
  }, [sensitivityDb, ampWatts, speakerCount, distanceMeters, calc, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-xs border border-border bg-surface p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-code">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Speaker Sensitivity (1W/1m)</span>
                <span className="font-bold text-text">{sensitivityDb} dB</span>
              </div>
              <input
                type="range"
                min={82}
                max={104}
                value={sensitivityDb}
                onChange={(e) => setSensitivityDb(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Amplifier Power (Watts/ch)</span>
                <span className="font-bold text-text">{ampWatts} W</span>
              </div>
              <input
                type="range"
                min={5}
                max={2000}
                step={5}
                value={ampWatts}
                onChange={(e) => setAmpWatts(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Listener Distance (Meters)</span>
                <span className="font-bold text-text">
                  {distanceMeters} m ({(distanceMeters * 3.28084).toFixed(0)} ft)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={distanceMeters}
                onChange={(e) => setDistanceMeters(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Number of Speakers</span>
                <span className="font-bold text-text">{speakerCount}</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={speakerCount}
                onChange={(e) => setSpeakerCount(Number(e.target.value))}
                className="w-full accent-[#ff6a00]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { gain: 0, label: "Outdoor Free-Field (-6dB/doubling)" },
              { gain: 3, label: "Indoor Room Half-Space (+3dB)" },
              { gain: 6, label: "Boundary Corner Load (+6dB)" },
            ].map((env) => (
              <button
                key={env.gain}
                type="button"
                onClick={() => setEnvGainDb(env.gain)}
                className={`rounded-xs px-2.5 py-1.5 font-mono-code text-xs cursor-pointer ${
                  envGainDb === env.gain
                    ? "bg-[#ff6a00] text-white font-bold"
                    : "border border-border bg-background text-text"
                }`}
              >
                {env.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-4 space-y-2.5 font-mono-code">
          <div className="text-[11px] uppercase text-text-muted">
            Peak SPL @ Listener ({distanceMeters}m)
          </div>
          <div className="text-3xl font-bold text-accent">
            {calc.peakSplAtListener.toFixed(1)} dB
          </div>
          <div className="text-xs text-text-muted">
            Continuous RMS: <span className="text-text">{calc.continuousSpl.toFixed(1)} dB</span>
          </div>
          <div className="border-t border-border pt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Watts for 85 dB (Cinema):</span>
              <span className="text-emerald-400 font-bold">{calc.watts85.toFixed(1)} W</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Watts for 95 dB (Party):</span>
              <span className="text-amber-400 font-bold">{calc.watts95.toFixed(1)} W</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Watts for 105 dB (Club):</span>
              <span className="text-red-400 font-bold">{calc.watts105.toFixed(0)} W</span>
            </div>
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 20. TELESCOPE MAGNIFICATION, EXIT PUPIL, FOV & STAR LIMITING MAGNITUDE
 * ========================================================================== */
function TelescopeMagnificationFovStarCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [apertureMm, setApertureMm] = useState<number>(203); // 8-inch SCT/Dobsonian
  const [scopeFocalMm, setScopeFocalMm] = useState<number>(1200);
  const [eyepieceFocalMm, setEyepieceFocalMm] = useState<number>(14);
  const [apparentFovDeg, setApparentFovDeg] = useState<number>(82);
  const [barlow, setBarlow] = useState<number>(1);
  const [bortleClass, setBortleClass] = useState<number>(4);

  useEffect(() => {
    if (resetTrigger > 0) {
      setApertureMm(203);
      setScopeFocalMm(1200);
      setEyepieceFocalMm(14);
      setApparentFovDeg(82);
      setBarlow(1);
      setBortleClass(4);
    }
  }, [resetTrigger]);

  const optics = useMemo(() => {
    const effectiveFocalMm = scopeFocalMm * barlow;
    const magnification = effectiveFocalMm / Math.max(1, eyepieceFocalMm);
    const focalRatio = effectiveFocalMm / Math.max(1, apertureMm);
    const exitPupilMm = apertureMm / magnification;
    const trueFovDeg = apparentFovDeg / magnification;
    const dawesLimitArcsec = 116 / Math.max(1, apertureMm);
    const rayleighLimitArcsec = 138 / Math.max(1, apertureMm);
    const maxUsefulMag = apertureMm * 2;
    // Limiting stellar magnitude adjusted for Bortle dark-sky class
    const bortlePenalty = (bortleClass - 1) * 0.28;
    const limitingMag = 2.7 + 5 * Math.log10(Math.max(1, apertureMm)) - bortlePenalty;

    return {
      effectiveFocalMm,
      magnification,
      focalRatio,
      exitPupilMm,
      trueFovDeg,
      dawesLimitArcsec,
      rayleighLimitArcsec,
      maxUsefulMag,
      limitingMag,
    };
  }, [apertureMm, scopeFocalMm, eyepieceFocalMm, apparentFovDeg, barlow, bortleClass]);

  useEffect(() => {
    setOutput(
      [
        `=== TELESCOPE OPTICS, FOV & ASTROPHOTOGRAPHY REPORT ===`,
        `Optical Tube         : ${apertureMm}mm Aperture | ${scopeFocalMm}mm Focal Length (${barlow}x Barlow)`,
        `Magnification        : ${optics.magnification.toFixed(1)}x (Max Useful: ${optics.maxUsefulMag.toFixed(0)}x)`,
        `Focal Ratio          : f/${optics.focalRatio.toFixed(1)}`,
        `Exit Pupil           : ${optics.exitPupilMm.toFixed(2)} mm`,
        `True Field of View   : ${optics.trueFovDeg.toFixed(2)}° (${(optics.trueFovDeg * 60).toFixed(1)} arcmin)`,
        `Dawes' Resolution    : ${optics.dawesLimitArcsec.toFixed(2)} arcsec`,
        `Limiting Magnitude   : +${optics.limitingMag.toFixed(1)} mag (Bortle Class ${bortleClass})`,
      ].join("\n")
    );
  }, [apertureMm, scopeFocalMm, barlow, bortleClass, optics, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-xs border border-border bg-surface p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono-code text-xs">
            <div>
              <label className="block text-[10px] uppercase text-text-muted mb-1">
                Aperture (mm)
              </label>
              <input
                type="number"
                value={apertureMm}
                onChange={(e) => setApertureMm(Math.max(20, Number(e.target.value) || 0))}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-muted mb-1">
                Scope Focal (mm)
              </label>
              <input
                type="number"
                value={scopeFocalMm}
                onChange={(e) => setScopeFocalMm(Math.max(100, Number(e.target.value) || 0))}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-muted mb-1">
                Eyepiece Focal (mm)
              </label>
              <input
                type="number"
                value={eyepieceFocalMm}
                onChange={(e) => setEyepieceFocalMm(Math.max(2, Number(e.target.value) || 0))}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-muted mb-1">
                Apparent FOV (°)
              </label>
              <input
                type="number"
                value={apparentFovDeg}
                onChange={(e) => setApparentFovDeg(Math.max(30, Number(e.target.value) || 0))}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-muted mb-1">
                Barlow Lens
              </label>
              <select
                value={barlow}
                onChange={(e) => setBarlow(Number(e.target.value))}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              >
                <option value={1}>1x (None)</option>
                <option value={1.5}>1.5x Barlow</option>
                <option value={2}>2x Barlow</option>
                <option value={3}>3x TeleXtender</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-muted mb-1">
                Bortle Dark Sky (1-9)
              </label>
              <input
                type="number"
                min={1}
                max={9}
                value={bortleClass}
                onChange={(e) =>
                  setBortleClass(Math.min(9, Math.max(1, Number(e.target.value) || 1)))
                }
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono-code text-xs">
          <div className="rounded-xs border border-border bg-surface p-3">
            <div className="text-[10px] text-text-muted">MAGNIFICATION</div>
            <div className="text-lg font-bold text-accent">
              {optics.magnification.toFixed(0)}x
            </div>
          </div>
          <div className="rounded-xs border border-border bg-surface p-3">
            <div className="text-[10px] text-text-muted">FOCAL RATIO</div>
            <div className="text-lg font-bold text-text">
              f/{optics.focalRatio.toFixed(1)}
            </div>
          </div>
          <div className="rounded-xs border border-border bg-surface p-3">
            <div className="text-[10px] text-text-muted">EXIT PUPIL</div>
            <div className="text-lg font-bold text-emerald-400">
              {optics.exitPupilMm.toFixed(2)} mm
            </div>
          </div>
          <div className="rounded-xs border border-border bg-surface p-3">
            <div className="text-[10px] text-text-muted">TRUE FOV</div>
            <div className="text-lg font-bold text-text">
              {optics.trueFovDeg.toFixed(2)}°
            </div>
          </div>
          <div className="rounded-xs border border-border bg-surface p-3">
            <div className="text-[10px] text-text-muted">DAWES LIMIT</div>
            <div className="text-sm font-bold text-text">
              {optics.dawesLimitArcsec.toFixed(2)}&quot;
            </div>
          </div>
          <div className="rounded-xs border border-border bg-surface p-3">
            <div className="text-[10px] text-text-muted">LIMITING MAG</div>
            <div className="text-sm font-bold text-accent">
              +{optics.limitingMag.toFixed(1)} mag
            </div>
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 21. KELLY CRITERION, EXPECTED VALUE (EV) & MONTE CARLO BANKROLL SIMULATOR
 * ========================================================================== */
function KellyCriterionEvMonteCarloSimulator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [winProbPct, setWinProbPct] = useState<number>(56);
  const [decimalOdds, setDecimalOdds] = useState<number>(2.0);
  const [startBankroll, setStartBankroll] = useState<number>(10000);
  const [kellyFraction, setKellyFraction] = useState<number>(0.5); // Half Kelly default
  const [numBets, setNumBets] = useState<number>(80);
  const [simSeed, setSimSeed] = useState<number>(1);

  useEffect(() => {
    if (resetTrigger > 0) {
      setWinProbPct(56);
      setDecimalOdds(2.0);
      setStartBankroll(10000);
      setKellyFraction(0.5);
      setNumBets(80);
      setSimSeed(1);
    }
  }, [resetTrigger]);

  const sim = useMemo(() => {
    const p = Math.min(0.99, Math.max(0.01, winProbPct / 100));
    const q = 1 - p;
    const b = Math.max(0.05, decimalOdds - 1);

    const evPct = (p * b - q) * 100;
    const fullKellyPct = Math.max(0, ((b * p - q) / b) * 100);
    const activeStakePct = fullKellyPct * kellyFraction;
    const f = activeStakePct / 100;

    // Expected geometric log growth rate per bet
    const logGrowth =
      f > 0 && f < 1
        ? p * Math.log(1 + b * f) + q * Math.log(1 - f)
        : 0;

    // Deterministic PRNG seeded by simSeed for reproducible Monte Carlo trajectories
    let seed = simSeed * 987654321;
    const nextRand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const trajectories: number[][] = [];
    let ruinCount = 0;
    for (let t = 0; t < 12; t++) {
      const path = [startBankroll];
      let eq = startBankroll;
      for (let i = 0; i < numBets; i++) {
        const win = nextRand() < p;
        eq = win ? eq * (1 + b * f) : eq * (1 - f);
        path.push(eq);
      }
      if (eq < startBankroll * 0.5) ruinCount++;
      trajectories.push(path);
    }

    const finals = trajectories.map((tr) => tr[tr.length - 1]).sort((a, b) => a - b);
    const medianFinal = finals[Math.floor(finals.length / 2)] ?? startBankroll;

    return {
      evPct,
      fullKellyPct,
      activeStakePct,
      stakeDollar: (startBankroll * activeStakePct) / 100,
      logGrowth,
      trajectories,
      medianFinal,
      drawdown50RiskPct: (ruinCount / trajectories.length) * 100,
    };
  }, [winProbPct, decimalOdds, startBankroll, kellyFraction, numBets, simSeed]);

  useEffect(() => {
    setOutput(
      [
        `=== KELLY CRITERION & MONTE CARLO QUANT RISK REPORT ===`,
        `Win Probability (p) : ${winProbPct}% | Decimal Odds: ${decimalOdds.toFixed(2)}`,
        `Expected Value (EV) : ${sim.evPct >= 0 ? "+" : ""}${sim.evPct.toFixed(2)}% per trade/bet`,
        `Full Kelly Stake    : ${sim.fullKellyPct.toFixed(2)}%`,
        `Selected Kelly (${kellyFraction}x): ${sim.activeStakePct.toFixed(2)}% ($${sim.stakeDollar.toFixed(2)} initial stake)`,
        `Median Final Equity : $${sim.medianFinal.toFixed(2)} after ${numBets} bets`,
      ].join("\n")
    );
  }, [winProbPct, decimalOdds, kellyFraction, numBets, sim, setOutput]);

  // SVG scaling
  const maxEq = Math.max(
    startBankroll * 1.5,
    ...sim.trajectories.flatMap((t) => t)
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 rounded-xs border border-border bg-surface p-4 space-y-3 font-mono-code text-xs">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] uppercase text-text-muted mb-1">
                Win Probability (%)
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={winProbPct}
                onChange={(e) => setWinProbPct(Number(e.target.value) || 0)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-muted mb-1">
                Decimal Odds (e.g. 2.0)
              </label>
              <input
                type="number"
                step="0.05"
                min={1.05}
                value={decimalOdds}
                onChange={(e) => setDecimalOdds(Number(e.target.value) || 1.05)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-muted mb-1">
                Starting Bankroll ($)
              </label>
              <input
                type="number"
                value={startBankroll}
                onChange={(e) => setStartBankroll(Math.max(100, Number(e.target.value) || 0))}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-text-muted mb-1">
                Number of Bets
              </label>
              <input
                type="number"
                min={10}
                max={200}
                value={numBets}
                onChange={(e) =>
                  setNumBets(Math.min(200, Math.max(10, Number(e.target.value) || 10)))
                }
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { mult: 1.0, label: "Full Kelly (1.0x)" },
              { mult: 0.5, label: "Half Kelly (0.5x)" },
              { mult: 0.25, label: "Quarter Kelly (0.25x)" },
            ].map((k) => (
              <button
                key={k.mult}
                type="button"
                onClick={() => setKellyFraction(k.mult)}
                className={`rounded-xs px-2.5 py-1 text-xs cursor-pointer ${
                  kellyFraction === k.mult
                    ? "bg-[#ff6a00] text-white font-bold"
                    : "border border-border bg-background text-text"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">EXPECTED VALUE</div>
              <div
                className={`text-base font-bold ${
                  sim.evPct >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {sim.evPct >= 0 ? "+" : ""}
                {sim.evPct.toFixed(2)}%
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">OPTIMAL STAKE</div>
              <div className="text-base font-bold text-accent">
                {sim.activeStakePct.toFixed(2)}% (${sim.stakeDollar.toFixed(0)})
              </div>
            </div>
          </div>
        </div>

        {/* SVG Monte Carlo Chart */}
        <div className="lg:col-span-7 rounded-xs border border-border bg-surface p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-code">
            <span className="font-bold uppercase text-text">
              12-Path Monte Carlo Bankroll Simulation (Median: $
              {Math.round(sim.medianFinal).toLocaleString()})
            </span>
            <button
              type="button"
              onClick={() => setSimSeed((s) => s + 1)}
              className="inline-flex items-center gap-1 rounded-xs border border-border bg-background px-2 py-1 text-[11px] text-accent hover:border-accent cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Reseed Paths
            </button>
          </div>

          <svg viewBox="0 0 500 200" className="w-full h-48 rounded-xs bg-background border border-border">
            {sim.trajectories.map((path, idx) => {
              const pts = path
                .map((val, step) => {
                  const x = (step / Math.max(1, numBets)) * 480 + 10;
                  const y = 190 - Math.min(180, (val / maxEq) * 175);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" ");
              return (
                <polyline
                  key={idx}
                  fill="none"
                  stroke={idx === 0 ? "#ff6a00" : "#10b981"}
                  strokeOpacity={idx === 0 ? 0.95 : 0.35}
                  strokeWidth={idx === 0 ? 2 : 1.2}
                  points={pts}
                />
              );
            })}
          </svg>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 22. AI SAAS STARTUP UNIT ECONOMICS, LTV:CAC & TOKEN GROSS MARGIN CALCULATOR
 * ========================================================================== */
function AiStartupUnitEconomicsLtvCacCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [arpu, setArpu] = useState<number>(49);
  const [activeUsers, setActiveUsers] = useState<number>(2500);
  const [monthlyChurnPct, setMonthlyChurnPct] = useState<number>(4.2);
  const [cac, setCac] = useState<number>(180);
  const [llmCostPerUser, setLlmCostPerUser] = useState<number>(8.5);
  const [cloudInfraMonthly, setCloudInfraMonthly] = useState<number>(4200);
  const [fixedPayrollMonthly, setFixedPayrollMonthly] = useState<number>(65000);
  const [cashBalance, setCashBalance] = useState<number>(1200000);

  useEffect(() => {
    if (resetTrigger > 0) {
      setArpu(49);
      setActiveUsers(2500);
      setMonthlyChurnPct(4.2);
      setCac(180);
      setLlmCostPerUser(8.5);
      setCloudInfraMonthly(4200);
      setFixedPayrollMonthly(65000);
      setCashBalance(1200000);
    }
  }, [resetTrigger]);

  const econ = useMemo(() => {
    const mrr = arpu * activeUsers;
    const arr = mrr * 12;
    const stripeFeePerUser = arpu * 0.029 + 0.3;
    const infraPerUser = cloudInfraMonthly / Math.max(1, activeUsers);
    const totalCogsPerUser = llmCostPerUser + infraPerUser + stripeFeePerUser;
    const grossProfitPerUser = arpu - totalCogsPerUser;
    const grossMarginPct = (grossProfitPerUser / Math.max(1, arpu)) * 100;

    const churnRate = Math.max(0.005, monthlyChurnPct / 100);
    const ltv = Math.max(0, grossProfitPerUser / churnRate);
    const ltvCacRatio = ltv / Math.max(1, cac);
    const paybackMonths = grossProfitPerUser > 0 ? cac / grossProfitPerUser : 999;

    const totalGrossProfit = grossProfitPerUser * activeUsers;
    const netMonthlyBurn = Math.max(0, fixedPayrollMonthly - totalGrossProfit);
    const runwayMonths = netMonthlyBurn > 0 ? cashBalance / netMonthlyBurn : 999;

    return {
      mrr,
      arr,
      totalCogsPerUser,
      grossProfitPerUser,
      grossMarginPct,
      ltv,
      ltvCacRatio,
      paybackMonths,
      netMonthlyBurn,
      runwayMonths,
    };
  }, [
    arpu,
    activeUsers,
    monthlyChurnPct,
    cac,
    llmCostPerUser,
    cloudInfraMonthly,
    fixedPayrollMonthly,
    cashBalance,
  ]);

  useEffect(() => {
    setOutput(
      [
        `=== AI SAAS STARTUP UNIT ECONOMICS & LTV:CAC AUDIT ===`,
        `MRR / ARR           : $${econ.mrr.toLocaleString()} / $${econ.arr.toLocaleString()}`,
        `AI Gross Margin     : ${econ.grossMarginPct.toFixed(1)}% (COGS: $${econ.totalCogsPerUser.toFixed(2)}/user/mo)`,
        `Customer LTV        : $${econ.ltv.toFixed(0)}`,
        `LTV : CAC Ratio     : ${econ.ltvCacRatio.toFixed(2)}x (Benchmark >= 3.0x)`,
        `CAC Payback Period  : ${econ.paybackMonths.toFixed(1)} months`,
        `Net Monthly Burn    : $${econ.netMonthlyBurn.toLocaleString()}/mo`,
        `Cash Runway         : ${econ.runwayMonths >= 900 ? "Profitable (Infinite)" : `${econ.runwayMonths.toFixed(1)} months`}`,
      ].join("\n")
    );
  }, [econ, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-code">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">AI GROSS MARGIN</div>
          <div
            className={`text-lg font-bold ${
              econ.grossMarginPct >= 70 ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {econ.grossMarginPct.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">LTV : CAC RATIO</div>
          <div
            className={`text-lg font-bold ${
              econ.ltvCacRatio >= 3 ? "text-emerald-400" : "text-accent"
            }`}
          >
            {econ.ltvCacRatio.toFixed(2)}x (${econ.ltv.toFixed(0)})
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">CAC PAYBACK</div>
          <div className="text-lg font-bold text-text">
            {econ.paybackMonths.toFixed(1)} mos
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">CASH RUNWAY</div>
          <div className="text-lg font-bold text-accent">
            {econ.runwayMonths >= 900 ? "DEFAULT ALIVE" : `${econ.runwayMonths.toFixed(1)} mos`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xs border border-border bg-surface p-4 font-mono-code text-xs">
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Subscription ARPU ($/mo)
          </label>
          <input
            type="number"
            value={arpu}
            onChange={(e) => setArpu(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Active Paying Users
          </label>
          <input
            type="number"
            value={activeUsers}
            onChange={(e) => setActiveUsers(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Monthly Churn (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={monthlyChurnPct}
            onChange={(e) => setMonthlyChurnPct(Number(e.target.value) || 0.5)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Blended CAC ($)
          </label>
          <input
            type="number"
            value={cac}
            onChange={(e) => setCac(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            LLM Token Cost ($/user)
          </label>
          <input
            type="number"
            step="0.5"
            value={llmCostPerUser}
            onChange={(e) => setLlmCostPerUser(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Cloud / GPU Infra ($/mo)
          </label>
          <input
            type="number"
            value={cloudInfraMonthly}
            onChange={(e) => setCloudInfraMonthly(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Payroll &amp; OpEx ($/mo)
          </label>
          <input
            type="number"
            value={fixedPayrollMonthly}
            onChange={(e) => setFixedPayrollMonthly(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Bank Cash Balance ($)
          </label>
          <input
            type="number"
            value={cashBalance}
            onChange={(e) => setCashBalance(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 23. AFFILIATE MARKETING ROAS, EPC & CONVERSION FUNNEL PROFITABILITY CALCULATOR
 * ========================================================================== */
function AffiliateRoasEpcFunnelCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [adSpend, setAdSpend] = useState<number>(2500);
  const [cpc, setCpc] = useState<number>(1.25);
  const [optInRatePct, setOptInRatePct] = useState<number>(38);
  const [salesConvPct, setSalesConvPct] = useState<number>(4.5);
  const [commissionPayout, setCommissionPayout] = useState<number>(110);
  const [refundRatePct, setRefundRatePct] = useState<number>(6);

  useEffect(() => {
    if (resetTrigger > 0) {
      setAdSpend(2500);
      setCpc(1.25);
      setOptInRatePct(38);
      setSalesConvPct(4.5);
      setCommissionPayout(110);
      setRefundRatePct(6);
    }
  }, [resetTrigger]);

  const funnel = useMemo(() => {
    const clicks = adSpend / Math.max(0.01, cpc);
    const leads = clicks * (optInRatePct / 100);
    const grossSales = leads * (salesConvPct / 100);
    const netSales = grossSales * (1 - refundRatePct / 100);
    const netRevenue = netSales * commissionPayout;
    const netProfit = netRevenue - adSpend;
    const roasX = netRevenue / Math.max(1, adSpend);
    const epc = netRevenue / Math.max(1, clicks);
    const maxAffordableCpc = epc;

    return {
      clicks,
      leads,
      grossSales,
      netSales,
      netRevenue,
      netProfit,
      roasX,
      epc,
      maxAffordableCpc,
    };
  }, [adSpend, cpc, optInRatePct, salesConvPct, commissionPayout, refundRatePct]);

  useEffect(() => {
    setOutput(
      [
        `=== AFFILIATE FUNNEL ROAS & EPC PROFITABILITY REPORT ===`,
        `Ad Spend / CPC      : $${adSpend.toFixed(2)} @ $${cpc.toFixed(2)} CPC -> ${Math.round(funnel.clicks)} Clicks`,
        `Opt-In Leads        : ${Math.round(funnel.leads)} (${optInRatePct}% Bridge/Opt-in)`,
        `Net Conversions     : ${funnel.netSales.toFixed(1)} sales (after ${refundRatePct}% refunds)`,
        `Net Revenue         : $${funnel.netRevenue.toFixed(2)}`,
        `Net Profit          : $${funnel.netProfit.toFixed(2)}`,
        `ROAS                : ${funnel.roasX.toFixed(2)}x (${(funnel.roasX * 100).toFixed(0)}%)`,
        `EPC vs Break-Even   : $${funnel.epc.toFixed(2)} EPC (Max Affordable CPC: $${funnel.maxAffordableCpc.toFixed(2)})`,
      ].join("\n")
    );
  }, [adSpend, cpc, optInRatePct, refundRatePct, funnel, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-code">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">NET PROFIT</div>
          <div
            className={`text-lg font-bold ${
              funnel.netProfit >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            ${funnel.netProfit.toFixed(0)}
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">ROAS MULTIPLIER</div>
          <div className="text-lg font-bold text-accent">
            {funnel.roasX.toFixed(2)}x ({(funnel.roasX * 100).toFixed(0)}%)
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">EARNINGS / CLICK (EPC)</div>
          <div className="text-lg font-bold text-text">${funnel.epc.toFixed(2)}</div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">BREAK-EVEN MAX CPC</div>
          <div className="text-lg font-bold text-emerald-400">
            ${funnel.maxAffordableCpc.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xs border border-border bg-surface p-4 font-mono-code text-xs">
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Total Ad Spend ($)
          </label>
          <input
            type="number"
            value={adSpend}
            onChange={(e) => setAdSpend(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Cost Per Click (CPC $)
          </label>
          <input
            type="number"
            step="0.05"
            value={cpc}
            onChange={(e) => setCpc(Number(e.target.value) || 0.05)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Landing Page Opt-In (%)
          </label>
          <input
            type="number"
            value={optInRatePct}
            onChange={(e) => setOptInRatePct(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Offer Sales Conversion (%)
          </label>
          <input
            type="number"
            step="0.5"
            value={salesConvPct}
            onChange={(e) => setSalesConvPct(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Commission Payout ($)
          </label>
          <input
            type="number"
            value={commissionPayout}
            onChange={(e) => setCommissionPayout(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Refund / Chargeback (%)
          </label>
          <input
            type="number"
            value={refundRatePct}
            onChange={(e) => setRefundRatePct(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 24. REAL ESTATE RENTAL YIELD, CAP RATE & EMI VS STEP-UP SIP CALCULATOR
 * ========================================================================== */
function RealEstateRentalYieldEmiSipCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [propertyPrice, setPropertyPrice] = useState<number>(400000);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [loanRatePct, setLoanRatePct] = useState<number>(6.8);
  const [tenureYears, setTenureYears] = useState<number>(15);
  const [monthlyRent, setMonthlyRent] = useState<number>(2400);
  const [annualMaintTax, setAnnualMaintTax] = useState<number>(4800);
  const [propAppreciationPct, setPropAppreciationPct] = useState<number>(5.5);

  // Step-Up SIP parameters
  const [monthlySip, setMonthlySip] = useState<number>(1500);
  const [annualStepUpPct, setAnnualStepUpPct] = useState<number>(10);
  const [equityCagrPct, setEquityCagrPct] = useState<number>(12.5);

  useEffect(() => {
    if (resetTrigger > 0) {
      setPropertyPrice(400000);
      setDownPaymentPct(20);
      setLoanRatePct(6.8);
      setTenureYears(15);
      setMonthlyRent(2400);
      setAnnualMaintTax(4800);
      setPropAppreciationPct(5.5);
      setMonthlySip(1500);
      setAnnualStepUpPct(10);
      setEquityCagrPct(12.5);
    }
  }, [resetTrigger]);

  const comp = useMemo(() => {
    const downPayment = propertyPrice * (downPaymentPct / 100);
    const loanPrincipal = Math.max(0, propertyPrice - downPayment);
    const rMonthly = loanRatePct / 100 / 12;
    const nMonths = tenureYears * 12;

    const emi =
      loanPrincipal > 0 && rMonthly > 0
        ? (loanPrincipal * rMonthly * Math.pow(1 + rMonthly, nMonths)) /
          (Math.pow(1 + rMonthly, nMonths) - 1)
        : loanPrincipal / Math.max(1, nMonths);

    const annualGrossRent = monthlyRent * 12;
    const annualNetOperatingIncome = annualGrossRent - annualMaintTax;
    const grossYieldPct = (annualGrossRent / Math.max(1, propertyPrice)) * 100;
    const netCapRatePct = (annualNetOperatingIncome / Math.max(1, propertyPrice)) * 100;
    const monthlyCashFlow = monthlyRent - annualMaintTax / 12 - emi;

    const futurePropertyVal =
      propertyPrice * Math.pow(1 + propAppreciationPct / 100, tenureYears);

    // Step-up SIP simulation over tenureYears (including initial downPayment lump sum)
    let sipCorpus = downPayment;
    let currentMonthlySip = monthlySip;
    const eqMonthlyRate = equityCagrPct / 100 / 12;
    for (let yr = 0; yr < tenureYears; yr++) {
      for (let m = 0; m < 12; m++) {
        sipCorpus = (sipCorpus + currentMonthlySip) * (1 + eqMonthlyRate);
      }
      currentMonthlySip *= 1 + annualStepUpPct / 100;
    }

    return {
      downPayment,
      loanPrincipal,
      emi,
      grossYieldPct,
      netCapRatePct,
      monthlyCashFlow,
      futurePropertyVal,
      sipCorpus,
    };
  }, [
    propertyPrice,
    downPaymentPct,
    loanRatePct,
    tenureYears,
    monthlyRent,
    annualMaintTax,
    propAppreciationPct,
    monthlySip,
    annualStepUpPct,
    equityCagrPct,
  ]);

  useEffect(() => {
    setOutput(
      [
        `=== REAL ESTATE RENTAL YIELD vs STEP-UP EQUITY SIP (${tenureYears} YRS) ===`,
        `Property Price       : $${propertyPrice.toLocaleString()} (Down Payment: $${comp.downPayment.toLocaleString()})`,
        `Gross Rental Yield   : ${comp.grossYieldPct.toFixed(2)}% | Net Cap Rate: ${comp.netCapRatePct.toFixed(2)}%`,
        `Monthly Mortgage EMI : $${comp.emi.toFixed(0)}/mo | Net Cash Flow: $${comp.monthlyCashFlow.toFixed(0)}/mo`,
        `${tenureYears}-Yr Property Value: $${Math.round(comp.futurePropertyVal).toLocaleString()}`,
        `${tenureYears}-Yr Step-Up SIP   : $${Math.round(comp.sipCorpus).toLocaleString()}`,
      ].join("\n")
    );
  }, [propertyPrice, tenureYears, comp, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-code">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">GROSS / NET YIELD</div>
          <div className="text-base font-bold text-accent">
            {comp.grossYieldPct.toFixed(2)}% / {comp.netCapRatePct.toFixed(2)}%
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">MONTHLY EMI</div>
          <div className="text-base font-bold text-text">${comp.emi.toFixed(0)}/mo</div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">{tenureYears}-YR PROPERTY VALUE</div>
          <div className="text-base font-bold text-text">
            ${Math.round(comp.futurePropertyVal).toLocaleString()}
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">{tenureYears}-YR STEP-UP SIP</div>
          <div className="text-base font-bold text-emerald-400">
            ${Math.round(comp.sipCorpus).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono-code text-xs">
        <div className="rounded-xs border border-border bg-surface p-4 space-y-2.5">
          <div className="font-heading text-xs font-bold uppercase text-text">
            Real Estate Property &amp; Mortgage Inputs
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] text-text-muted">Property Price ($)</label>
              <input
                type="number"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value) || 0)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-text-muted">Monthly Rent ($)</label>
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value) || 0)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-text-muted">Loan Interest (%)</label>
              <input
                type="number"
                step="0.1"
                value={loanRatePct}
                onChange={(e) => setLoanRatePct(Number(e.target.value) || 0)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-text-muted">Horizon (Years)</label>
              <input
                type="number"
                min={5}
                max={30}
                value={tenureYears}
                onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value) || 15))}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xs border border-border bg-surface p-4 space-y-2.5">
          <div className="font-heading text-xs font-bold uppercase text-text">
            Step-Up Equity SIP Inputs (Includes Down Payment Lump Sum)
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] text-text-muted">Monthly SIP ($)</label>
              <input
                type="number"
                value={monthlySip}
                onChange={(e) => setMonthlySip(Number(e.target.value) || 0)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-text-muted">Annual Step-Up (%)</label>
              <input
                type="number"
                value={annualStepUpPct}
                onChange={(e) => setAnnualStepUpPct(Number(e.target.value) || 0)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-text-muted">Equity CAGR (%)</label>
              <input
                type="number"
                step="0.5"
                value={equityCagrPct}
                onChange={(e) => setEquityCagrPct(Number(e.target.value) || 0)}
                className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
              />
            </div>
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 25. NFT RARITY SCORE, CREATOR ROYALTY & ETHEREUM GAS FEE CALCULATOR
 * ========================================================================== */
function NftRarityScoreRoyaltyGasCalculator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [supply, setSupply] = useState<number>(10000);
  const [traitCounts, setTraitCounts] = useState<number[]>([45, 180, 620, 1400]);
  const [salePriceEth, setSalePriceEth] = useState<number>(1.25);
  const [royaltyPct, setRoyaltyPct] = useState<number>(5.0);
  const [marketFeePct, setMarketFeePct] = useState<number>(2.5);
  const [gasLimit, setGasLimit] = useState<number>(145000);
  const [gasGwei, setGasGwei] = useState<number>(18);
  const [ethUsd, setEthUsd] = useState<number>(3100);

  useEffect(() => {
    if (resetTrigger > 0) {
      setSupply(10000);
      setTraitCounts([45, 180, 620, 1400]);
      setSalePriceEth(1.25);
      setRoyaltyPct(5.0);
      setMarketFeePct(2.5);
      setGasLimit(145000);
      setGasGwei(18);
      setEthUsd(3100);
    }
  }, [resetTrigger]);

  const nftCalc = useMemo(() => {
    const safeSupply = Math.max(1, supply);
    let infoBits = 0;
    let inverseFreqSum = 0;

    for (const c of traitCounts) {
      const p = Math.min(1, Math.max(1, c) / safeSupply);
      infoBits += -Math.log2(p);
      inverseFreqSum += 1 / p;
    }

    const tier =
      infoBits >= 24
        ? "MYTHIC / LEGENDARY (Top 0.5%)"
        : infoBits >= 18
        ? "EPIC TIER (Top 5%)"
        : infoBits >= 12
        ? "RARE TIER"
        : "COMMON TIER";

    const gasFeeEth = (gasLimit * gasGwei) / 1e9;
    const gasFeeUsd = gasFeeEth * ethUsd;
    const royaltyEth = salePriceEth * (royaltyPct / 100);
    const marketFeeEth = salePriceEth * (marketFeePct / 100);
    const netSellerEth = Math.max(0, salePriceEth - royaltyEth - marketFeeEth - gasFeeEth);
    const netSellerUsd = netSellerEth * ethUsd;

    return {
      infoBits,
      inverseFreqSum,
      tier,
      gasFeeEth,
      gasFeeUsd,
      netSellerEth,
      netSellerUsd,
    };
  }, [
    supply,
    traitCounts,
    salePriceEth,
    royaltyPct,
    marketFeePct,
    gasLimit,
    gasGwei,
    ethUsd,
  ]);

  useEffect(() => {
    setOutput(
      [
        `=== NFT SHANNON INFORMATION RARITY & ETH GAS AUDIT ===`,
        `Collection Supply     : ${supply.toLocaleString()} items`,
        `Information Rarity    : ${nftCalc.infoBits.toFixed(2)} bits (${nftCalc.tier})`,
        `Inverse Rarity Score  : ${nftCalc.inverseFreqSum.toFixed(1)} pts`,
        `EVM Gas Fee           : ${nftCalc.gasFeeEth.toFixed(5)} ETH ($${nftCalc.gasFeeUsd.toFixed(2)})`,
        `Net Seller Proceeds   : ${nftCalc.netSellerEth.toFixed(4)} ETH ($${nftCalc.netSellerUsd.toFixed(2)})`,
      ].join("\n")
    );
  }, [supply, nftCalc, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-code">
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">SHANNON RARITY SCORE</div>
          <div className="text-lg font-bold text-accent">
            {nftCalc.infoBits.toFixed(2)} bits
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">RARITY TIER</div>
          <div className="text-xs font-bold text-emerald-400">{nftCalc.tier}</div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">EVM GAS COST</div>
          <div className="text-base font-bold text-text">
            {nftCalc.gasFeeEth.toFixed(4)} ETH (${nftCalc.gasFeeUsd.toFixed(2)})
          </div>
        </div>
        <div className="rounded-xs border border-border bg-surface p-3">
          <div className="text-[10px] text-text-muted">NET SELLER PROCEEDS</div>
          <div className="text-base font-bold text-emerald-400">
            {nftCalc.netSellerEth.toFixed(4)} ETH
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xs border border-border bg-surface p-4 font-mono-code text-xs">
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Total Collection Supply
          </label>
          <input
            type="number"
            value={supply}
            onChange={(e) => setSupply(Math.max(10, Number(e.target.value) || 10000))}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Sale Price (ETH)
          </label>
          <input
            type="number"
            step="0.05"
            value={salePriceEth}
            onChange={(e) => setSalePriceEth(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Creator Royalty (%)
          </label>
          <input
            type="number"
            step="0.5"
            value={royaltyPct}
            onChange={(e) => setRoyaltyPct(Number(e.target.value) || 0)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase text-text-muted mb-1">
            Gas Price (Gwei)
          </label>
          <input
            type="number"
            value={gasGwei}
            onChange={(e) => setGasGwei(Number(e.target.value) || 1)}
            className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
          />
        </div>

        {traitCounts.map((count, i) => (
          <div key={i}>
            <label className="block text-[10px] uppercase text-text-muted mb-1">
              Trait #{i + 1} Count (of {supply})
            </label>
            <input
              type="number"
              min={1}
              max={supply}
              value={count}
              onChange={(e) => {
                const next = [...traitCounts];
                next[i] = Math.max(1, Number(e.target.value) || 1);
                setTraitCounts(next);
              }}
              className="w-full rounded-xs border border-border bg-background px-2.5 py-1.5 text-text"
            />
          </div>
        ))}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * EXPORT REGISTRY FOR WAVE 4 GROUP B: 12 HARDWARE, 3D/CANVAS & FINANCE TOOLS
 * ========================================================================== */
export const wave4HardwareFinancePlaygrounds: Record<
  string,
  React.ComponentType<{ tool: Tool }>
> = {
  "smartphone-sensor-gyro-accelerometer-lab": SmartphoneSensorGyroAccelerometerLab,
  "gps-nmea-geofence-distance-calculator": GpsNmeaGeofenceDistanceCalculator,
  "face-golden-ratio-landmark-canvas-lab": FaceGoldenRatioLandmarkCanvasLab,
  "ai-image-prompt-aspect-ratio-studio": AiImagePromptAspectRatioStudio,
  "3d-mesh-obj-stl-polygon-print-calculator": MeshObjStlPolygonPrintCalculator,
  "outdoor-speaker-spl-decibel-calculator": OutdoorSpeakerSplDecibelCalculator,
  "telescope-magnification-fov-star-calculator": TelescopeMagnificationFovStarCalculator,
  "kelly-criterion-ev-monte-carlo-simulator": KellyCriterionEvMonteCarloSimulator,
  "ai-startup-unit-economics-ltv-cac-calculator": AiStartupUnitEconomicsLtvCacCalculator,
  "affiliate-roas-epc-funnel-calculator": AffiliateRoasEpcFunnelCalculator,
  "real-estate-rental-yield-emi-sip-calculator": RealEstateRentalYieldEmiSipCalculator,
  "nft-rarity-score-royalty-gas-calculator": NftRarityScoreRoyaltyGasCalculator,
};

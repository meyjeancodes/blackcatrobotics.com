"use client";

import { useState } from "react";
import {
  AlertTriangle, Droplets, Wind, Radio, HelpCircle,
  ArrowRight, ArrowLeft, Upload, CheckCircle, Clock
} from "lucide-react";
import type { DamageType, DjiDrone, DroneFlightLog } from "../../types/dji-drone";
import { checkCoverage } from "../../lib/dji-care-coverage";

interface ClaimWizardProps {
  drone: DjiDrone;
  flightLogs: DroneFlightLog[];
  onClose?: () => void;
  onClaimCreated?: (claimId: string) => void;
}

const DAMAGE_TYPES: { value: DamageType; label: string; icon: React.ElementType; description: string }[] = [
  { value: "COLLISION", label: "Collision",      icon: AlertTriangle, description: "Crash, impact with obstacle, hard landing" },
  { value: "WATER",     label: "Water Damage",   icon: Droplets,      description: "Submersion, rain, water contact" },
  { value: "FLYAWAY",   label: "Flyaway",        icon: Wind,          description: "Lost connection, aircraft not recovered" },
  { value: "SIGNAL_LOSS", label: "Signal Loss",  icon: Radio,         description: "Remote control signal lost, aircraft drifted" },
  { value: "OTHER",     label: "Other",          icon: HelpCircle,    description: "Other accidental damage not listed above" },
];

const STEPS = ["Type", "Details", "Photos", "Review", "Done"] as const;

export function ClaimWizard({ drone, flightLogs, onClose, onClaimCreated }: ClaimWizardProps) {
  const [step, setStep] = useState(0);
  const [damageType, setDamageType] = useState<DamageType | null>(null);
  const [description, setDescription] = useState("");
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split("T")[0]);
  const [incidentLocation, setIncidentLocation] = useState("");
  const [selectedLogId, setSelectedLogId] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]); // base64 or filenames
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimId, setClaimId] = useState<string | null>(null);

  const coverage = damageType ? checkCoverage(drone.care_refresh_plan, damageType, drone.model) : null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (photos.length + files.length > 8) {
      setError("Maximum 8 photos allowed");
      return;
    }
    setPhotoNames((prev) => [...prev, ...files.map((f) => f.name)]);
    setPhotos((prev) => [...prev, ...files.map((f) => f.name)]);
    setError(null);
  };

  const canProceed = () => {
    if (step === 0) return damageType !== null && coverage?.covered;
    if (step === 1) {
      if (description.length < 20) return false;
      if ((damageType === "FLYAWAY" || damageType === "SIGNAL_LOSS") && !selectedLogId) return false;
      return true;
    }
    if (step === 2) return photos.length >= 2;
    return true;
  };

  const handleSubmit = async () => {
    if (!damageType) return;

    setSubmitting(true);
    setError(null);

    try {
      // Create claim
      const createRes = await fetch(`/api/drones/${drone.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          damage_type: damageType,
          description: `${description}\n\nDate: ${incidentDate}\nLocation: ${incidentLocation || "Not specified"}`,
          flight_log_id: selectedLogId || undefined,
          care_refresh_plan_check: true,
        }),
      });

      const createJson = await createRes.json();
      if (!createRes.ok) throw new Error(createJson.error ?? "Failed to create claim");

      const newClaimId = createJson.claim.id;

      // Attach photos and submit
      const patchRes = await fetch(`/api/drones/${drone.id}/claim/${newClaimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos_uploaded: photos,
          claim_status: "SUBMITTED",
        }),
      });

      if (!patchRes.ok) {
        const patchJson = await patchRes.json();
        throw new Error(patchJson.error ?? "Failed to submit claim");
      }

      setClaimId(newClaimId);
      setStep(4); // Done
      onClaimCreated?.(newClaimId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const stepContent: Record<number, React.ReactNode> = {
    0: (
      <div className="space-y-3">
        <p className="text-sm text-theme-55 leading-relaxed mb-4">
          Select the type of damage. Coverage is determined by your current plan.
        </p>
        {DAMAGE_TYPES.map(({ value, label, icon: Icon, description: desc }) => {
          const cov = checkCoverage(drone.care_refresh_plan, value, drone.model);
          const selected = damageType === value;
          return (
            <button
              key={value}
              onClick={() => setDamageType(value)}
              className={`w-full text-left rounded-[18px] border p-4 transition-all duration-150 ${
                selected
                  ? "border-[#e8601e]/40 bg-[#e8601e]/[0.06]"
                  : "border-theme-6 bg-theme-2 hover:border-theme-10 hover:bg-theme-4"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-[#e8601e]/15" : "bg-theme-5"}`}>
                  <Icon size={15} className={selected ? "text-[#e8601e]" : "text-theme-40"} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-theme-80">{label}</p>
                  <p className="text-xs text-theme-40 mt-0.5 leading-relaxed">{desc}</p>
                </div>
                <span className={`font-ui text-[0.58rem] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border shrink-0 ${
                  cov.covered
                    ? "bg-[#1db87a]/10 text-[#1db87a] border-[#1db87a]/20"
                    : "bg-theme-4 text-theme-30 border-theme-6"
                }`}>
                  {cov.covered ? "Covered" : "Not Covered"}
                </span>
              </div>
              {selected && !cov.covered && (
                <p className="mt-2.5 text-xs text-[#e8601e]/80 leading-relaxed pl-11">
                  {cov.reason}
                </p>
              )}
              {selected && cov.covered && cov.replacement_fee_usd && (
                <p className="mt-2.5 text-xs text-theme-40 pl-11">
                  Replacement fee: <strong className="text-theme-60">${cov.replacement_fee_usd} USD</strong> per incident
                </p>
              )}
            </button>
          );
        })}
      </div>
    ),

    1: (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-40">
            Incident Description <span className="text-[#e8601e]">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe what happened. Be specific about conditions, actions taken, and the resulting damage."
            className="w-full rounded-[16px] border border-theme-10 bg-white/70 px-4 py-3 text-sm text-theme-80 placeholder:text-theme-30 focus:outline-none focus:border-[#e8601e]/40 focus:ring-2 focus:ring-[#e8601e]/10 resize-none"
          />
          <p className="text-[0.60rem] text-theme-30 text-right">{description.length} / 20 min chars</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-40">Date of Incident</label>
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="w-full rounded-[16px] border border-theme-10 bg-white/70 px-4 py-2.5 text-sm text-theme-80 focus:outline-none focus:border-[#e8601e]/40"
            />
          </div>
          <div className="space-y-2">
            <label className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-40">Location (optional)</label>
            <input
              type="text"
              value={incidentLocation}
              onChange={(e) => setIncidentLocation(e.target.value)}
              placeholder="City, state or coordinates"
              className="w-full rounded-[16px] border border-theme-10 bg-white/70 px-4 py-2.5 text-sm text-theme-80 placeholder:text-theme-30 focus:outline-none focus:border-[#e8601e]/40"
            />
          </div>
        </div>

        {(damageType === "FLYAWAY" || damageType === "SIGNAL_LOSS") && (
          <div className="space-y-2">
            <label className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-40">
              Flight Log <span className="text-[#e8601e]">* Required for flyaway claims</span>
            </label>
            <select
              value={selectedLogId}
              onChange={(e) => setSelectedLogId(e.target.value)}
              className="w-full rounded-[16px] border border-theme-10 bg-white/70 px-4 py-2.5 text-sm text-theme-80 focus:outline-none focus:border-[#e8601e]/40"
            >
              <option value="">Select flight log from incident date</option>
              {flightLogs.map((log) => (
                <option key={log.id} value={log.id}>
                  {new Date(log.flight_date).toLocaleDateString()} — {log.duration_minutes} min, {log.distance_km.toFixed(1)} km
                </option>
              ))}
            </select>
            {flightLogs.length === 0 && (
              <p className="text-xs text-[#e8601e]/80">
                No flight logs found. Upload the flight log from the incident on the Flight Logs tab first.
              </p>
            )}
          </div>
        )}
      </div>
    ),

    2: (
      <div className="space-y-4">
        <p className="text-sm text-theme-55 leading-relaxed">
          Upload at least 2 photos showing the damage. Include a photo of the serial number. Max 8 photos.
        </p>

        <label className="block cursor-pointer">
          <div className={`rounded-[20px] border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-colors ${
            photos.length >= 8 ? "border-theme-5 opacity-50 cursor-not-allowed" : "border-theme-10 hover:border-[#e8601e]/30 hover:bg-[#e8601e]/[0.02]"
          }`}>
            <Upload size={20} className="text-theme-30" />
            <p className="text-sm text-theme-50">Click to add photos ({photos.length}/8)</p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleFileUpload}
            disabled={photos.length >= 8}
          />
        </label>

        {photoNames.length > 0 && (
          <div className="space-y-1.5">
            {photoNames.map((name, i) => (
              <div key={i} className="flex items-center gap-2 rounded-[14px] bg-[#1db87a]/[0.06] border border-[#1db87a]/15 px-3.5 py-2.5">
                <CheckCircle size={13} className="text-[#1db87a] shrink-0" />
                <span className="text-xs text-theme-65 truncate">{name}</span>
              </div>
            ))}
          </div>
        )}

        {photos.length < 2 && (
          <p className="text-xs text-amber-600">
            {2 - photos.length} more photo{2 - photos.length !== 1 ? "s" : ""} required before submitting.
          </p>
        )}
      </div>
    ),

    3: (
      <div className="space-y-4">
        <p className="text-sm text-theme-55 mb-4">Review your claim before submitting.</p>
        <div className="rounded-[20px] border border-theme-7 bg-theme-2 p-5 space-y-3">
          <Row label="Drone" value={`${drone.model} ···${drone.serial_number.slice(-6)}`} />
          <Row label="Plan" value={drone.care_refresh_plan === "COMBO" ? "Care Refresh+" : drone.care_refresh_plan === "TWO_YEAR" ? "2-Year" : "1-Year"} />
          <Row label="Damage Type" value={DAMAGE_TYPES.find((d) => d.value === damageType)?.label ?? damageType ?? ""} />
          <Row label="Incident Date" value={incidentDate} />
          {incidentLocation && <Row label="Location" value={incidentLocation} />}
          <Row label="Photos" value={`${photos.length} uploaded`} />
          {selectedLogId && <Row label="Flight Log" value="Attached" />}
          {coverage?.replacement_fee_usd && (
            <Row label="Replacement Fee" value={`$${coverage.replacement_fee_usd} USD (due upon approval)`} highlight />
          )}
        </div>
        <div className="rounded-[16px] bg-[#e8601e]/[0.05] border border-[#e8601e]/15 px-4 py-3 text-xs text-[#e8601e]/80 leading-relaxed">
          By submitting, you confirm this is an honest claim. Fraudulent claims void all Care Refresh coverage. DJI will review and respond within 5–10 business days.
        </div>
      </div>
    ),

    4: (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1db87a]/10">
          <CheckCircle size={32} className="text-[#1db87a]" />
        </div>
        <div className="text-center">
          <h3 className="font-header text-xl text-theme-primary">Claim Submitted</h3>
          <p className="mt-1.5 text-sm text-theme-55 leading-relaxed max-w-sm">
            Your claim has been submitted. DJI will review and respond within 5–10 business days.
          </p>
          {claimId && (
            <p className="mt-2 font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-30">
              Claim ID: {claimId.slice(0, 8).toUpperCase()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-[16px] bg-theme-3 border border-theme-5 px-4 py-3 text-xs text-theme-50">
          <Clock size={13} />
          5–10 business days for DJI review. Watch your email for updates.
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full border border-theme-10 px-6 py-2.5 text-sm text-theme-60 hover:border-theme-10 hover:text-theme-primary/80 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    ),
  };

  return (
    <div className="panel p-6">
      {/* Step indicator */}
      {step < 4 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="kicker">File DJI Care Refresh Claim</p>
            <span className="font-ui text-[0.60rem] text-theme-35">Step {step + 1} of 4</span>
          </div>
          <div className="flex gap-1">
            {STEPS.slice(0, 4).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? "bg-[#e8601e]" : "bg-theme-8"
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {STEPS.slice(0, 4).map((s, i) => (
              <span
                key={s}
                className={`flex-1 text-center font-ui text-[0.55rem] uppercase tracking-[0.12em] ${
                  i === step ? "text-[#e8601e]" : i < step ? "text-[#1db87a]" : "text-theme-25"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="min-h-[200px]">{stepContent[step]}</div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-[14px] bg-[#e8601e]/[0.07] border border-[#e8601e]/15 px-4 py-2.5 text-xs text-[#e8601e]">
          <AlertTriangle size={13} />
          {error}
        </div>
      )}

      {/* Navigation */}
      {step < 4 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 rounded-full border border-theme-10 px-4 py-2 text-sm text-theme-55 hover:border-theme-10 hover:text-theme-primary/75 transition-colors"
          >
            <ArrowLeft size={13} />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 rounded-full bg-[#e8601e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d4521a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !canProceed()}
              className="flex items-center gap-1.5 rounded-full bg-[#e8601e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d4521a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Claim"}
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-theme-4 last:border-0">
      <span className="text-xs text-theme-40">{label}</span>
      <span className={`text-xs font-medium ${highlight ? "text-[#e8601e]" : "text-theme-65"}`}>{value}</span>
    </div>
  );
}

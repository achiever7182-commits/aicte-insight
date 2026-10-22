import { useState } from "react";
import { PlusCircle, Building2, MapPin, BookOpen, Users, CheckCircle2, X } from "lucide-react";
import { useAppState } from "@/lib/store";
import type { AppCategory } from "@/data/types";
import { toast } from "sonner";

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (appId: string) => void;
}

const INDIAN_STATES = [
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Delhi",
  "Gujarat",
  "Telangana",
  "Madhya Pradesh",
  "Rajasthan",
  "West Bengal",
  "Kerala",
  "Punjab",
  "Haryana",
  "Andhra Pradesh",
  "Bihar",
  "Odisha",
];

const PROGRAMS_LIST = [
  "B.Tech Computer Science & Engineering",
  "B.Tech Artificial Intelligence & Data Science",
  "B.Tech Electronics & Communication",
  "B.Tech Mechanical Engineering",
  "B.Tech Civil Engineering",
  "MBA in Technology Management",
  "Master of Computer Applications (MCA)",
  "B.Pharm",
  "Diploma in Mechanical Engineering",
];

export function AddCollegeModal({ isOpen, onClose, onSuccess }: AddCollegeModalProps) {
  const { addCollegeApplication, logDecision } = useAppState();

  const [collegeName, setCollegeName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [category, setCategory] = useState<AppCategory>("New EoA");
  const [program, setProgram] = useState(PROGRAMS_LIST[0]);
  const [intake, setIntake] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeName.trim() || !city.trim()) {
      toast.error("Please fill in the college name and city.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = addCollegeApplication({
        collegeName: collegeName.trim(),
        city: city.trim(),
        state,
        category,
        program,
        intake: Number(intake) || 120,
      });

      // Also record an audit entry for this action
      await logDecision({
        applicationId: created.id,
        applicationLabel: `${created.collegeName} (${created.collegeCode})`,
        action: "note",
        detail: {
          note: `Institutional application registered for ${created.program} with intake of ${created.intake} seats.`,
        },
      });

      toast.success(`Application ${created.id} added for ${created.collegeName}!`);
      onClose();
      if (onSuccess) onSuccess(created.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to add college application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 md:p-8 text-card-foreground shadow-2xl z-10">
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
              <PlusCircle className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">Register College Application</h2>
              <p className="text-xs text-muted-foreground">
                Intake new institution dossier for automated AICTE verification & scrutiny.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <Building2 className="size-3.5 text-primary" /> Institution / College Name *
            </label>
            <input
              type="text"
              required
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g. Sardar Patel Institute of Technology & Research"
              className="w-full rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" /> City / District *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune, Lucknow, Bengaluru"
                className="w-full rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">State / UT</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s} className="bg-popover text-foreground">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Application Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AppCategory)}
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="New EoA">New EoA</option>
                <option value="Extension of EoA">Extension of EoA</option>
                <option value="Renewal">Renewal</option>
                <option value="Additional Intake">Additional Intake</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                <Users className="size-3.5 text-primary" /> Approved Intake (Seats)
              </label>
              <input
                type="number"
                min={30}
                max={1200}
                step={30}
                required
                value={intake}
                onChange={(e) => setIntake(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-primary" /> Primary Degree Program
            </label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {PROGRAMS_LIST.map((p) => (
                <option key={p} value={p} className="bg-popover text-foreground">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-primary" />
            <span>
              Creating this institution automatically compiles an initial compliance affidavit, state NOC checklist, and sets up automated OCR verification.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-muted/40 px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition disabled:opacity-50"
            >
              <PlusCircle className="size-3.5" />
              {isSubmitting ? "Registering..." : "Add College Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

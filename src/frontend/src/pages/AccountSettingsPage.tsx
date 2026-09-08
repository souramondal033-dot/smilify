import {
  AlertTriangle,
  Camera,
  Check,
  ChevronLeft,
  Globe,
  Loader2,
  Lock,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { UpdateProfileInput } from "../backend";
import { useAccount } from "../hooks/useAccount";
import type { UserProfile, View } from "../lib/types";
import { getInitial } from "../lib/utils";

interface AccountSettingsPageProps {
  profile: UserProfile | null;
  onProfileUpdate: (p: UserProfile) => void;
  onLogout: () => void;
  onNavigate: (v: View) => void;
}

// ── Avatar ──────────────────────────────────────────────────────────────────
function ProfileAvatar({
  url,
  name,
  size = "lg",
}: {
  url?: string | null;
  name: string;
  size?: "lg" | "sm";
}) {
  const dim = size === "lg" ? "w-24 h-24 text-3xl" : "w-12 h-12 text-lg";
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${dim} rounded-full object-cover border-4 border-background shadow-pookie`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-pookie`}
    >
      {getInitial(name)}
    </div>
  );
}

// ── Deactivate Modal ────────────────────────────────────────────────────────
function DeactivateModal({
  onClose,
  onConfirm,
  loading,
}: {
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
      data-ocid="account.deactivate_dialog"
    >
      <div className="bg-card rounded-[2rem] border border-border shadow-pookie-lg w-full max-w-md p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">😴</span>
          </div>
          <div>
            <h3 className="font-black text-foreground text-lg leading-tight">
              Take a little nap?
            </h3>
            <p className="text-muted-foreground text-[12px] font-bold mt-1 leading-relaxed">
              Your account will go to sleep for{" "}
              <span className="text-amber-600 font-black">7 days</span>. During
              this time, your smiles and profile will be hidden from everyone.
            </p>
          </div>
        </div>
        <ul className="space-y-2">
          {[
            ["😌", "Come back anytime within 7 days to reactivate"],
            ["📦", "All your smiles, tokens, and badges are safely kept"],
            ["⏰", "After 7 days, your account will be permanently deleted"],
          ].map(([icon, text]) => (
            <li
              key={text}
              className="flex items-center gap-2.5 text-[11px] font-bold text-muted-foreground"
            >
              <span className="text-base flex-shrink-0">{icon}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-border font-bold text-[11px] uppercase tracking-widest text-muted-foreground hover:bg-muted/60 transition-smooth"
            data-ocid="account.deactivate.cancel_button"
          >
            Stay Pookie ✨
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-amber-500 text-white font-black text-[11px] uppercase tracking-widest hover:bg-amber-600 transition-smooth disabled:opacity-60 flex items-center justify-center gap-2"
            data-ocid="account.deactivate.confirm_button"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Take a nap 😴"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({
  onClose,
  onConfirm,
  loading,
}: {
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
      data-ocid="account.delete_dialog"
    >
      <div className="bg-card rounded-[2rem] border border-rose-200 shadow-pookie-lg w-full max-w-md p-6 space-y-5">
        {step === 1 ? (
          <>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-rose-500" />
              </div>
              <div>
                <h3 className="font-black text-foreground text-lg leading-tight">
                  This is forever, pookie 💔
                </h3>
                <p className="text-muted-foreground text-[12px] font-bold mt-1 leading-relaxed">
                  Deleting your account can{" "}
                  <span className="text-rose-500 font-black">never</span> be
                  undone. Everything disappears — no recovery possible.
                </p>
              </div>
            </div>
            <ul className="space-y-2">
              {[
                ["💔", "All your smiles will be deleted forever"],
                ["🪙", "Your Smile Tokens vanish into the void"],
                ["🏅", "All badges and achievements are gone"],
                ["🔒", "Your account cannot be recovered"],
              ].map(([icon, text]) => (
                <li
                  key={text}
                  className="flex items-center gap-2.5 text-[11px] font-bold text-muted-foreground"
                >
                  <span className="text-base flex-shrink-0">{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-border font-bold text-[11px] uppercase tracking-widest text-muted-foreground hover:bg-muted/60 transition-smooth"
                data-ocid="account.delete.cancel_button"
              >
                Keep my smiles 💖
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-2xl bg-rose-500 text-white font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 transition-smooth"
                data-ocid="account.delete.next_button"
              >
                Continue 😢
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center pb-1">
              <span className="text-4xl">💀</span>
              <h3 className="font-black text-foreground text-lg mt-2">
                Last chance, pookie
              </h3>
              <p className="text-muted-foreground text-[12px] font-bold mt-1">
                Type <span className="font-black text-rose-500">DELETE</span> to
                confirm you're really sure
              </p>
            </div>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE here..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-input bg-background font-bold text-foreground text-sm text-center placeholder:text-muted-foreground/60 focus:outline-none focus:border-rose-400 transition-smooth"
              data-ocid="account.delete.confirm_input"
              aria-label="Type DELETE to confirm account deletion"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-border font-bold text-[11px] uppercase tracking-widest text-muted-foreground hover:bg-muted/60 transition-smooth"
                data-ocid="account.delete.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading || confirmText !== "DELETE"}
                className="flex-1 py-3 rounded-2xl bg-rose-500 text-white font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 transition-smooth disabled:opacity-40 flex items-center justify-center gap-2"
                data-ocid="account.delete.confirm_button"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Delete forever 💔"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function AccountSettingsPage({
  profile,
  onProfileUpdate,
  onLogout,
  onNavigate,
}: AccountSettingsPageProps) {
  const {
    isLoading,
    updateProfile,
    updateProfilePicture,
    deactivateAccount,
    deleteAccount,
  } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [isPublic, setIsPublic] = useState(profile?.isPublic ?? true);
  const [uploadProgress, setUploadProgress] = useState<
    "idle" | "uploading" | "done"
  >("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile?.profilePicUrl ?? null,
  );

  // Lifecycle modals
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const isDirty =
    name !== (profile?.name ?? "") ||
    email !== (profile?.email ?? "") ||
    bio !== (profile?.bio ?? "") ||
    phone !== (profile?.phone ?? "") ||
    location !== (profile?.location ?? "") ||
    isPublic !== (profile?.isPublic ?? true);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploadProgress("uploading");
    const updated = await updateProfilePicture(file);
    if (updated) {
      onProfileUpdate(updated);
      setUploadProgress("done");
      toast.success("Profile picture updated! 🐼");
      setTimeout(() => setUploadProgress("idle"), 2000);
    } else {
      setPreviewUrl(profile?.profilePicUrl ?? null);
      setUploadProgress("idle");
      toast.error("Upload failed pookie 😢");
    }
  };

  const handleSave = async () => {
    const fields: UpdateProfileInput = {
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      bio: bio.trim() || undefined,
      phone: phone.trim() || undefined,
      location: location.trim() || undefined,
      isPublic,
    };
    const updated = await updateProfile(fields);
    if (updated) {
      onProfileUpdate(updated);
      toast.success("Profile saved! ✨");
    } else {
      toast.error("Save failed pookie 😢");
    }
  };

  const handleDeactivate = async () => {
    const result = await deactivateAccount();
    if (result) {
      setShowDeactivate(false);
      toast.success("Account deactivated. See you soon pookie! 😴");
      onLogout();
    } else {
      toast.error("Deactivation failed 😢");
    }
  };

  const handleDelete = async () => {
    const result = await deleteAccount();
    if (result) {
      setShowDelete(false);
      toast.success("Account deleted 💔 Goodbye pookie!");
      onLogout();
    } else {
      toast.error("Deletion failed 😢");
    }
  };

  if (!profile) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 text-center"
        data-ocid="account-settings.empty_state"
      >
        <span className="text-5xl mb-4">🐼</span>
        <p className="font-bold text-foreground">Not signed in pookie!</p>
      </div>
    );
  }

  return (
    <div
      className="p-5 space-y-6 fade-in pb-12"
      data-ocid="account-settings.page"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => onNavigate("me")}
          className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-smooth"
          data-ocid="account-settings.back_button"
          aria-label="Go back to profile"
        >
          <ChevronLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Account Settings
          </h2>
          <p className="text-[11px] font-bold text-muted-foreground">
            Manage your pookie profile ✨
          </p>
        </div>
      </div>

      {/* Profile Picture */}
      <section
        className="bg-card rounded-[2rem] border border-border p-6 flex flex-col items-center gap-4 shadow-xs"
        data-ocid="account-settings.photo.section"
      >
        <div className="relative">
          <ProfileAvatar url={previewUrl} name={profile.name} size="lg" />
          {uploadProgress === "uploading" && (
            <div className="absolute inset-0 rounded-full bg-foreground/30 flex items-center justify-center">
              <Loader2 size={24} className="text-white animate-spin" />
            </div>
          )}
          {uploadProgress === "done" && (
            <div className="absolute inset-0 rounded-full bg-primary/80 flex items-center justify-center">
              <Check size={24} className="text-white" />
            </div>
          )}
        </div>
        <div className="text-center">
          <p className="font-black text-foreground text-base">{profile.name}</p>
          <p className="text-[11px] font-bold text-muted-foreground">
            {profile.email}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload profile picture"
          data-ocid="account-settings.photo.input"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadProgress === "uploading"}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-[11px] uppercase tracking-widest shadow-pookie hover:opacity-90 transition-smooth disabled:opacity-50"
          data-ocid="account-settings.photo.upload_button"
          aria-label="Change profile photo"
        >
          <Camera size={14} />
          Change Photo
        </button>
        <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest">
          JPG · PNG · WebP
        </p>
      </section>

      {/* Edit Profile Form */}
      <section
        className="bg-card rounded-[2rem] border border-border p-6 space-y-4 shadow-xs"
        data-ocid="account-settings.profile.section"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">✏️</span>
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Edit Profile
          </h3>
        </div>

        <div className="space-y-3">
          <Field label="Name" htmlFor="acc-name">
            <input
              id="acc-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your pookie name"
              maxLength={50}
              className="w-full px-4 py-3 rounded-2xl border border-input bg-background font-bold text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              data-ocid="account-settings.name.input"
            />
          </Field>

          <Field label="Email" htmlFor="acc-email">
            <input
              id="acc-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-2xl border border-input bg-background font-bold text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              data-ocid="account-settings.email.input"
            />
          </Field>

          <Field label="Bio" htmlFor="acc-bio">
            <textarea
              id="acc-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the pookie world about yourself ✨"
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 rounded-2xl border border-input bg-background font-bold text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-smooth resize-none"
              data-ocid="account-settings.bio.textarea"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" htmlFor="acc-phone">
              <input
                id="acc-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9999..."
                className="w-full px-4 py-3 rounded-2xl border border-input bg-background font-bold text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                data-ocid="account-settings.phone.input"
              />
            </Field>

            <Field label="Location" htmlFor="acc-location">
              <input
                id="acc-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                maxLength={80}
                className="w-full px-4 py-3 rounded-2xl border border-input bg-background font-bold text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                data-ocid="account-settings.location.input"
              />
            </Field>
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl border border-input bg-background">
            <div className="flex items-center gap-2.5">
              {isPublic ? (
                <Globe size={15} className="text-primary" />
              ) : (
                <Lock size={15} className="text-muted-foreground" />
              )}
              <div>
                <p className="text-[11px] font-black text-foreground">
                  Profile Visibility
                </p>
                <p className="text-[9px] font-bold text-muted-foreground">
                  {isPublic
                    ? "Public — everyone can see you 🌍"
                    : "Private — only you can see 🔒"}
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-11 h-6 rounded-full transition-smooth focus:outline-none focus:ring-2 focus:ring-ring ${
                isPublic ? "bg-primary" : "bg-muted"
              }`}
              data-ocid="account-settings.visibility.switch"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow-xs transition-transform duration-200 ${
                  isPublic ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save / Cancel */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setName(profile.name);
              setEmail(profile.email);
              setBio(profile.bio ?? "");
              setPhone(profile.phone ?? "");
              setLocation(profile.location ?? "");
              setIsPublic(profile.isPublic ?? true);
            }}
            disabled={!isDirty || isLoading}
            className="flex-1 py-3.5 rounded-2xl border border-border font-bold text-[11px] uppercase tracking-widest text-muted-foreground hover:bg-muted/60 transition-smooth disabled:opacity-40 flex items-center justify-center gap-2"
            data-ocid="account-settings.profile.cancel_button"
          >
            <X size={13} /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isLoading}
            className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-widest shadow-pookie hover:opacity-90 transition-smooth disabled:opacity-40 flex items-center justify-center gap-2"
            data-ocid="account-settings.profile.save_button"
          >
            {isLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            Save Changes
          </button>
        </div>
      </section>

      {/* Account Lifecycle */}
      <section
        className="bg-card rounded-[2rem] border border-border p-6 space-y-3 shadow-xs"
        data-ocid="account-settings.lifecycle.section"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">⚙️</span>
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Account Lifecycle
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setShowDeactivate(true)}
          className="w-full py-4 rounded-2xl border-2 border-amber-200 bg-amber-50 text-amber-700 font-black text-[11px] uppercase tracking-widest hover:bg-amber-100 transition-smooth flex items-center justify-center gap-2.5"
          data-ocid="account-settings.deactivate_button"
        >
          <span className="text-base">😴</span>
          Deactivate Account
        </button>
        <p className="text-[9px] font-bold text-muted-foreground/70 text-center leading-relaxed px-4">
          Takes a 7-day nap — reactivate anytime during this period
        </p>

        <div className="h-px bg-border my-1" />

        <button
          type="button"
          onClick={() => setShowDelete(true)}
          className="w-full py-4 rounded-2xl border-2 border-rose-200 bg-rose-50 text-rose-600 font-black text-[11px] uppercase tracking-widest hover:bg-rose-100 transition-smooth flex items-center justify-center gap-2.5"
          data-ocid="account-settings.delete_button"
        >
          <AlertTriangle size={14} />
          Delete Account Permanently
        </button>
        <p className="text-[9px] font-bold text-muted-foreground/70 text-center leading-relaxed px-4">
          This cannot be undone pookie 💔 — all your smiles, tokens, and badges
          will vanish forever
        </p>
      </section>

      {/* Modals */}
      {showDeactivate && (
        <DeactivateModal
          onClose={() => setShowDeactivate(false)}
          onConfirm={handleDeactivate}
          loading={isLoading}
        />
      )}
      {showDelete && (
        <DeleteModal
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          loading={isLoading}
        />
      )}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

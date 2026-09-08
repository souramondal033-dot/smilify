import { Check, RefreshCw } from "lucide-react";
import { useState } from "react";
import { ASSETS, COUNTRIES } from "../lib/constants";

interface RegistrationForm {
  name: string;
  email: string;
  country: string;
  isHuman: boolean;
}

interface RegistrationOverlayProps {
  onRegister: (form: RegistrationForm) => Promise<void>;
  onToast: (msg: string) => void;
}

export function RegistrationOverlay({
  onRegister,
  onToast,
}: RegistrationOverlayProps) {
  const [form, setForm] = useState<RegistrationForm>({
    name: "",
    email: "",
    country: COUNTRIES[0],
    isHuman: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return onToast("Enter your pookie name! 🎀");
    if (!form.email.includes("@"))
      return onToast("Enter a valid email pookie!");
    if (!form.isHuman) return onToast("Check the human box pookie! 🐼");

    setIsSubmitting(true);
    try {
      await onRegister(form);
    } catch {
      onToast("Oops! Try again pookie 💖");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1500] bg-[#FFF8FA] flex flex-col items-center justify-center p-8 fade-in"
      data-ocid="registration.dialog"
    >
      <span className="absolute top-16 left-6 text-4xl animate-float-slow opacity-30 pointer-events-none">
        ☁️
      </span>
      <span className="absolute bottom-40 right-6 text-5xl animate-float opacity-20 pointer-events-none">
        ☁️
      </span>

      <img
        src={ASSETS.LOGO}
        alt="Smilify"
        className="w-20 h-20 mb-6 animate-bounce-gentle"
      />
      <h2 className="text-4xl font-bold text-foreground tracking-tight text-center mb-1">
        Hello Pookie! 🎀
      </h2>
      <p className="text-sm text-muted-foreground font-bold text-center mb-10">
        Join the worldwide smile movement ✨
      </p>

      <div className="w-full max-w-xs space-y-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Pookie Name ✨"
          className="w-full p-5 bg-muted/50 rounded-3xl font-bold border border-border outline-none text-sm placeholder:text-muted-foreground focus:border-primary transition-smooth"
          data-ocid="registration.name.input"
        />
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email (cute only!) 💌"
          type="email"
          className="w-full p-5 bg-muted/50 rounded-3xl font-bold border border-border outline-none text-sm placeholder:text-muted-foreground focus:border-primary transition-smooth"
          data-ocid="registration.email.input"
        />
        <select
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          className="w-full p-5 bg-muted/50 rounded-3xl font-bold border border-border outline-none text-sm text-foreground focus:border-primary transition-smooth appearance-none"
          data-ocid="registration.country.select"
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label
          className="flex items-center gap-4 p-5 bg-muted/50 rounded-3xl cursor-pointer active:bg-muted/70 border border-border transition-smooth"
          data-ocid="registration.human.checkbox"
        >
          <input
            type="checkbox"
            checked={form.isHuman}
            onChange={(e) => setForm({ ...form, isHuman: e.target.checked })}
            className="sr-only"
          />
          <div
            className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-smooth pointer-events-none ${
              form.isHuman
                ? "bg-primary border-primary"
                : "bg-card border-border"
            }`}
          >
            {form.isHuman && (
              <Check
                size={14}
                className="text-primary-foreground"
                strokeWidth={3}
              />
            )}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            I'm a human pookie 🐼
          </span>
        </label>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-5 bg-primary text-primary-foreground rounded-[2rem] font-bold text-xs uppercase tracking-widest shadow-pookie-lg active:scale-95 transition-smooth disabled:opacity-60 flex items-center justify-center gap-2"
          data-ocid="registration.submit_button"
        >
          {isSubmitting ? (
            <RefreshCw className="animate-spin" size={20} />
          ) : (
            "Enter Wonderland 🌈"
          )}
        </button>
      </div>
    </div>
  );
}

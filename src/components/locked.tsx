import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { PLANS, couponValid } from "@/lib/unlock";

export function Paywall({ onUnlock, compact = false }: { onUnlock: () => void; compact?: boolean }) {
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (couponValid(coupon)) {
      setCouponMsg(null);
      onUnlock();
    } else {
      setCouponMsg("That coupon code isn't valid. Check it and try again.");
    }
  }

  return (
    <div className={`rounded-2xl border border-primary/30 bg-card/95 p-5 text-left shadow-glow backdrop-blur ${compact ? "" : "md:p-6"}`}>
      <p className="flex items-center gap-2 font-display text-lg font-bold">🔒 Locked — pick a plan to unlock</p>
      <p className="mt-1 text-sm text-muted-foreground">One unlock opens the Apollo filter and the Google Doc report.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {PLANS.map((p) => (
          <button key={p.id} onClick={() => setNote("Card payments switch on at launch — until then, use your coupon code below for free unlimited access.")}
            className={`rounded-2xl border bg-background p-4 text-center transition hover:border-primary ${p.popular ? "border-primary" : "border-border"}`}>
            <p className="font-display text-2xl font-bold text-primary">${p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            <p className="mt-1 text-sm text-muted-foreground">{p.credits} credits</p>
          </button>
        ))}
      </div>
      {note && <p className="mt-3 text-sm text-muted-foreground">{note}</p>}
      <form onSubmit={applyCoupon} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Have a coupon code?"
          className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary" />
        <button className="rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-bold text-primary-foreground transition hover:opacity-90">Apply coupon</button>
      </form>
      {couponMsg && <p className="mt-2 text-sm text-destructive">{couponMsg}</p>}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Compare plans on the <Link to="/pricing" className="font-semibold text-primary underline underline-offset-2">pricing page</Link>.
      </p>
    </div>
  );
}

export function BlurLock({ locked, onUnlock, children, minHeight = 220 }: {
  locked: boolean;
  onUnlock: () => void;
  children: ReactNode;
  minHeight?: number;
}) {
  if (!locked) return <div className="animate-fade-in-up">{children}</div>;
  return (
    <div className="relative mt-5 overflow-hidden rounded-2xl" style={{ minHeight }}>
      <div aria-hidden className="pointer-events-none select-none blur-md saturate-50" style={{ maxHeight: 420, overflow: "hidden" }}>
        {children}
      </div>
      <div className="absolute inset-0 bg-background/40" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Paywall onUnlock={onUnlock} compact />
        </div>
      </div>
    </div>
  );
}

export function UnlockOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        <span className="absolute h-24 w-24 rounded-full border-4 border-primary animate-unlock-ring" />
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-5xl text-primary-foreground shadow-glow animate-unlock-pop">🔓</span>
        <p className="mt-6 rounded-full bg-card px-6 py-2 font-display text-lg font-bold text-primary shadow-glow animate-fade-in-up">Unlocked — full access is yours</p>
      </div>
    </div>
  );
}

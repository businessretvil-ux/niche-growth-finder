import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PLANS, couponValid, persistUnlock, readUnlocked } from "@/lib/unlock";
import { SiteHeader, SiteFooter } from "@/components/chrome";
import { UnlockOverlay } from "@/components/locked";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Niche Finder" },
      { name: "description", content: "Simple monthly plans for niche analysis: Apollo lead filters, Google Doc reports and AI offer fit. Coupon codes accepted." },
      { property: "og:title", content: "Pricing — Niche Finder" },
      { property: "og:description", content: "Simple monthly plans for niche analysis: Apollo lead filters, Google Doc reports and AI offer fit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

const FAQ = [
  { q: "What is a credit?", a: "One credit = one full niche analysis, including the Apollo lead filter and the Google Doc report." },
  { q: "Do credits roll over?", a: "Credits reset each month on your billing date, so use them while they're fresh." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel whenever you like and you keep access until the end of the month you paid for." },
  { q: "Have a coupon code?", a: "Enter it below — a valid code unlocks free unlimited access instantly on this browser." },
];

function Pricing() {
  const [unlocked, setUnlocked] = useState(readUnlocked);
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [showUnlockAnim, setShowUnlockAnim] = useState(false);

  function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (couponValid(coupon)) {
      persistUnlock();
      setUnlocked(true);
      setCouponMsg(null);
      setShowUnlockAnim(true);
      setTimeout(() => setShowUnlockAnim(false), 1800);
    } else {
      setCouponMsg("That coupon code isn't valid. Check it and try again.");
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <UnlockOverlay show={showUnlockAnim} />
      <main className="mx-auto max-w-6xl px-5 py-12 md:py-20">
        <header className="mb-12 text-center">
          <p className="mb-3 inline-block rounded-full border border-primary/30 bg-accent px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">Pricing</p>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">One tool. <span className="text-primary">Every niche.</span></h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Pick a monthly plan and start analyzing niches in under a minute. One unlock covers the Apollo filter and the Google Doc report.</p>
          {unlocked && <p className="mx-auto mt-4 inline-block rounded-full bg-success/10 px-5 py-2 font-semibold text-success">🔓 You have unlimited access on this browser</p>}
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.id} className={`relative flex flex-col rounded-3xl border bg-card p-7 ${p.popular ? "border-primary shadow-glow" : "border-border"}`}>
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">Most popular</span>}
              <h2 className="font-display text-xl font-bold">{p.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
              <p className="mt-4 font-display text-5xl font-bold text-primary">${p.price}<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <p className="mt-1 text-sm font-semibold">{p.credits} credits included</p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-xs font-bold text-primary-foreground">✓</span><span>{f}</span></li>
                ))}
              </ul>
              <button onClick={() => setNote("Card payments switch on at launch — until then, use your coupon code below for free unlimited access.")}
                className={`mt-6 rounded-2xl px-6 py-3 font-display font-bold transition hover:scale-[1.02] ${p.popular ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"}`}>
                {unlocked ? "Unlocked ✓" : `Choose ${p.name}`}
              </button>
            </div>
          ))}
        </section>
        {note && <p className="mx-auto mt-6 max-w-xl rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">{note}</p>}

        <section className="mx-auto mt-12 max-w-xl rounded-3xl border border-primary/40 bg-card p-6 text-center md:p-8">
          <h2 className="text-2xl font-bold">🎟️ Have a coupon code?</h2>
          <p className="mt-2 text-muted-foreground">A valid code unlocks free unlimited access — and stays unlocked when you come back on this browser.</p>
          <form onSubmit={applyCoupon} className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter coupon code"
              className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary" />
            <button className="rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground transition hover:opacity-90">Apply coupon</button>
          </form>
          {couponMsg && <p className="mt-2 text-sm text-destructive">{couponMsg}</p>}
        </section>

        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="text-center text-3xl font-bold">Questions, answered</h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-border bg-card p-5">
                <summary className="cursor-pointer list-none font-display font-bold">{f.q}<span className="float-right text-primary transition group-open:rotate-45">＋</span></summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-primary/40 bg-accent p-8 text-center">
          <h2 className="text-3xl font-bold">Ready to test a niche?</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">Head back to the analyzer and get a verdict in under a minute.</p>
          <Link to="/" className="mt-5 inline-block rounded-2xl bg-primary px-8 py-3 font-display font-bold text-primary-foreground transition hover:scale-[1.02]">Open the analyzer</Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

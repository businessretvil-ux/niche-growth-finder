import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type ReactNode } from "react";
import { analyzeNiche, createNicheDoc } from "@/lib/niche.functions";
import { judgeNiche, MIN_TICKET_USD } from "@/lib/niche-rules";
import { buildApolloUrl, isApolloUrl, parseApolloKeywords } from "@/lib/apollo";
import type { NicheReport } from "@/lib/niche-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Niche Finder — Is this niche worth it?" },
      { name: "description", content: "Type a niche and see leads, average ticket, growth, data availability and AI offer fit — then export a full Google Doc." },
      { property: "og:title", content: "Niche Finder — Is this niche worth it?" },
      { property: "og:description", content: "Leads, ticket size, growth and AI offer fit for any niche, plus a full Google Doc report." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const UNLOCK_KEY = "niche-finder-unlocked";
const COUPON = "appointfunnels#58";
const PLANS = [
  { credits: 100, price: 20 },
  { credits: 250, price: 40 },
  { credits: 500, price: 75 },
];

function readUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(UNLOCK_KEY) === "1" || document.cookie.includes("nf_unlocked=1");
}

function Index() {
  const analyze = useServerFn(analyzeNiche);
  const makeDoc = useServerFn(createNicheDoc);
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<NicheReport | null>(null);
  const [doc, setDoc] = useState<{ url: string; documentId: string } | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(readUnlocked);
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [apolloPaste, setApolloPaste] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading) return;
    setProgress(0);
    const t = setInterval(() => setProgress((p) => Math.min(95, p + 1)), 300);
    return () => clearInterval(t);
  }, [loading]);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setReport(null); setDoc(null); setApolloPaste("");
    try { setReport(await analyze({ data: { niche } })); }
    catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); setProgress(100); }
  }

  const verdict = report ? judgeNiche(report.avgTicketUsd, report.growth.isGrowing) : null;
  const apolloKeywords = report ? [report.niche, ...report.subNiches] : [];
  const apolloUrl = report ? buildApolloUrl(apolloKeywords) : "";
  const pastedKeywords = parseApolloKeywords(apolloPaste);

  function unlock() {
    window.localStorage.setItem(UNLOCK_KEY, "1");
    document.cookie = "nf_unlocked=1; max-age=31536000; path=/; SameSite=Lax";
    setUnlocked(true);
  }

  function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (coupon.trim().toLowerCase() === COUPON) {
      unlock();
      setCouponMsg(null);
    } else {
      setCouponMsg("That coupon code isn't valid. Check it and try again.");
    }
  }

  async function exportDoc() {
    if (!report || !verdict) return;
    setDocLoading(true); setError(null);
    try { setDoc(await makeDoc({ data: { report, good: verdict.good, reasons: verdict.reasons } })); }
    catch (err) { setError(err instanceof Error ? err.message : "Couldn't create the doc"); }
    finally { setDocLoading(false); }
  }

  async function copyApollo() {
    try { await navigator.clipboard.writeText(apolloUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setCopied(false); }
  }

  const paywall = (
    <Paywall coupon={coupon} setCoupon={setCoupon} couponMsg={couponMsg} onCoupon={applyCoupon} />
  );

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 md:py-20">
      <header className="mb-10 text-center">
        <p className="mb-3 inline-block rounded-full border border-border px-4 py-1 text-xs uppercase tracking-widest text-primary">Niche Finder</p>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">Is this niche <span className="text-primary">worth it?</span></h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Type any niche. Get leads, ticket size, growth and which AI offers you can sell them.</p>
      </header>

      <form onSubmit={run} className="mx-auto flex max-w-2xl flex-col gap-3 rounded-3xl border border-border bg-card p-3 shadow-glow sm:flex-row">
        <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. Cybersecurity MSPs, Roofing, Dental clinics…"
          className="flex-1 rounded-2xl bg-transparent px-4 py-3 text-lg outline-none placeholder:text-muted-foreground" />
        <button disabled={loading || niche.trim().length < 2}
          className="rounded-2xl bg-primary px-7 py-3 font-display font-bold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-50">
          {loading ? "Analyzing…" : "Analyze niche"}
        </button>
      </form>

      {loading && (
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-center text-sm text-muted-foreground">Digging through the niche — the line fills in about 30 seconds, never more than a minute.</p>
        </div>
      )}
      {error && <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">{error}</p>}

      {report && verdict && (
        <div className="mt-12 space-y-10">
          <div className={`rounded-3xl border p-6 md:p-8 ${verdict.good ? "border-success/50 bg-success/10" : "border-destructive/50 bg-destructive/10"}`}>
            <p className={`font-display text-sm uppercase tracking-widest ${verdict.good ? "text-success" : "text-destructive"}`}>Verdict</p>
            <h2 className="mt-1 text-3xl font-bold md:text-4xl">{verdict.good ? `✅ ${report.niche} is a good niche` : `❌ Skip ${report.niche}`}</h2>
            {!verdict.good && <ul className="mt-2 text-destructive">{verdict.reasons.map((r) => <li key={r}>• {r}</li>)}</ul>}
            <p className="mt-3 text-muted-foreground">{report.summary}</p>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Leads available" value={`~${report.leadCount.toLocaleString()}`} note={report.leadCountNote} tone="info" />
            <Stat label="Avg ticket size" value={`$${report.avgTicketUsd.toLocaleString()}`} note={report.avgTicketUsd >= MIN_TICKET_USD ? `Above $${MIN_TICKET_USD.toLocaleString()} ✓` : `Below $${MIN_TICKET_USD.toLocaleString()} ✗`} tone={report.avgTicketUsd >= MIN_TICKET_USD ? "success" : "destructive"} />
            <Stat label="Availability" value={`${report.availability.filter((a) => a.available).length}/${report.availability.length} sources`} note={report.availability.filter((a) => a.available).map((a) => a.source).join(", ") || "No data sources"} tone="warning" />
            <Stat label="Lead assets / pains" value={`${report.pains.length} pains`} note={report.pains[0]?.title ?? "No pains found"} tone="destructive" />
            <Stat label="Growth" value={report.growth.isGrowing ? "Growing 📈" : "Declining 📉"} note={report.growth.label} tone={report.growth.isGrowing ? "success" : "destructive"} />
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <Panel title="🗄️ Where to find them">
              {report.availability.map((a) => <Check key={a.source} ok={a.available} title={a.source} text={a.note} />)}
            </Panel>
            <Panel title="🤖 What you can sell them">
              {report.products.map((p) => <Check key={p.name} ok={p.fit} title={p.name} text={p.reason} />)}
            </Panel>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-bold">🔎 Apollo lead filter <span className="text-primary">(United States)</span></h2>
            <p className="mt-2 text-muted-foreground">A ready-made Apollo search for {report.niche} decision-makers in the United States — or paste your own Apollo link to pull its keywords out.</p>
            {!unlocked ? paywall : (
              <div className="mt-5 space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a href={apolloUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3 font-display font-bold text-primary-foreground transition hover:scale-[1.02]">
                    Open Apollo search ↗
                  </a>
                  <button onClick={copyApollo} className="rounded-2xl border border-border px-7 py-3 font-display font-bold transition hover:bg-secondary">
                    {copied ? "Copied ✓" : "Copy link"}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">Keywords used: {apolloKeywords.join(", ")}</p>
                <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                  <p className="mb-2 font-semibold">Have your own Apollo link? Paste it to read its keywords:</p>
                  <input value={apolloPaste} onChange={(e) => setApolloPaste(e.target.value)} placeholder="https://app.apollo.io/#/people?…"
                    className="w-full rounded-xl bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground" />
                  {apolloPaste && !isApolloUrl(apolloPaste) && <p className="mt-2 text-sm text-destructive">That doesn't look like an Apollo link.</p>}
                  {pastedKeywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pastedKeywords.map((k) => <span key={k} className="rounded-full bg-primary/15 px-4 py-1.5 text-sm text-primary">{k}</span>)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-primary/40 bg-card p-6 text-center md:p-8">
            <h2 className="text-2xl font-bold">📄 Get the full report in Google Docs</h2>
            <p className="mt-2 text-muted-foreground">A colourful, step-by-step breakdown you can share and edit.</p>
            {!unlocked ? paywall : !doc ? (
              <button onClick={exportDoc} disabled={docLoading} className="mt-5 rounded-2xl bg-primary px-7 py-3 font-display font-bold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-50">
                {docLoading ? "Creating doc…" : "Create Google Doc"}
              </button>
            ) : (
              <div className="mt-5 space-y-5">
                <a href={doc.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-accent px-7 py-3 font-display font-bold text-accent-foreground transition hover:scale-[1.02]">
                  Open in Google Drive ↗
                </a>
                <iframe title="Google Doc preview" src={`https://docs.google.com/document/d/${doc.documentId}/preview`} className="h-[600px] w-full rounded-2xl border border-border bg-foreground" />
              </div>
            )}
          </section>

          <Report r={report} />
        </div>
      )}
    </main>
  );
}

function Paywall({ coupon, setCoupon, couponMsg, onCoupon }: {
  coupon: string;
  setCoupon: (v: string) => void;
  couponMsg: string | null;
  onCoupon: (e: React.FormEvent) => void;
}) {
  const [note, setNote] = useState<string | null>(null);
  return (
    <div className="mt-5 rounded-2xl border border-warning/40 bg-warning/5 p-5 text-left">
      <p className="flex items-center gap-2 font-display text-lg font-bold text-warning">🔒 Locked — pick a plan to unlock</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {PLANS.map((p) => (
          <button key={p.credits} onClick={() => setNote("Card payments switch on at launch — until then, use your coupon code below for free unlimited access.")}
            className="rounded-2xl border border-border bg-card p-4 text-center transition hover:border-primary">
            <p className="font-display text-2xl font-bold text-primary">${p.price}<span className="text-sm text-muted-foreground">/mo</span></p>
            <p className="mt-1 text-sm text-muted-foreground">{p.credits} credits</p>
          </button>
        ))}
      </div>
      {note && <p className="mt-3 text-sm text-warning">{note}</p>}
      <form onSubmit={onCoupon} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Have a coupon code?"
          className="flex-1 rounded-xl bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground" />
        <button className="rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-bold text-primary-foreground">Apply coupon</button>
      </form>
      {couponMsg && <p className="mt-2 text-sm text-destructive">{couponMsg}</p>}
    </div>
  );
}

const toneText = { info: "text-info", success: "text-success", destructive: "text-destructive", warning: "text-warning" } as const;

function Stat({ label, value, note, tone }: { label: string; value: string; note: string; tone: keyof typeof toneText }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold ${toneText[tone]}`}>{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <h3 className="mb-4 text-xl font-bold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Check({ ok, title, text }: { ok: boolean; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${ok ? "bg-success text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>{ok ? "✓" : "✕"}</span>
      <div><p className="font-semibold">{title}</p><p className="text-sm text-muted-foreground">{text}</p></div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return <ul className="space-y-1.5">{items.map((i) => <li key={i} className="flex gap-2"><span className="text-primary">▸</span><span>{i}</span></li>)}</ul>;
}

function Sec({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-3xl border border-border bg-card p-6 md:p-8"><h3 className="mb-4 text-2xl font-bold">{title}</h3><div className="space-y-4 text-card-foreground/90">{children}</div></section>;
}

function Report({ r }: { r: NicheReport }) {
  const n = r.niche;
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold md:text-4xl">Full breakdown: <span className="text-primary">{n}</span></h2>
      <Sec title={`📂 What do ${n} companies do?`}><List items={r.whatTheyDo} /><p className="text-muted-foreground">They protect / manage / build:</p><List items={r.theyManage} /></Sec>
      <Sec title="📦 What do they sell?">
        <div className="grid gap-4 md:grid-cols-2">{r.sells.map((o, i) => (
          <div key={o.title} className="rounded-2xl bg-secondary p-5"><p className="font-display font-bold text-accent">{i + 1}. {o.title}</p><div className="mt-2"><List items={o.items} /></div><p className="mt-2 text-sm italic text-muted-foreground">👉 {o.note}</p></div>
        ))}</div>
      </Sec>
      <Sec title="🎯 Who do they sell to?"><List items={r.sellTo} /><p className="font-semibold">Basically: “{r.idealCustomer}”</p></Sec>
      <Sec title="💰 Ticket size">
        <div className="grid gap-3 sm:grid-cols-3">
          {[["Small", r.tickets.small], ["Mid", r.tickets.mid], ["Enterprise", r.tickets.enterprise]].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-secondary p-4"><p className="text-xs uppercase text-muted-foreground">{k}</p><p className="font-display text-lg font-bold text-success">{v}</p></div>
          ))}
        </div>
        <p>This is a <b>{r.tickets.tier}</b> ticket niche.</p>
      </Sec>
      <Sec title="📊 How big is the market?">
        <p className="font-display text-3xl font-bold text-success">~${r.marketSizeBillions}B <span className="text-base font-normal text-muted-foreground">billion USD market</span></p>
        <p>{r.market.summary}</p>
        <List items={r.market.drivers} />
      </Sec>
      <Sec title="😡 Pain level">{r.pains.map((p) => <div key={p.title} className="border-l-4 border-destructive pl-4"><p className="font-bold">{p.title}</p><p className="text-muted-foreground">{p.detail}</p></div>)}</Sec>
      <Sec title="⚙️ Core sales systems they need">
        <div className="grid gap-4 md:grid-cols-3">
          {[["AI SDR Systems", r.salesSystems.aiSdr], ["Cold Email Infrastructure", r.salesSystems.coldEmail], ["AI Lead Tracking", r.salesSystems.leadTracking]].map(([t, items]) => (
            <div key={t as string} className="rounded-2xl bg-secondary p-5"><p className="mb-2 font-display font-bold text-info">{t as string}</p><List items={items as string[]} /></div>
          ))}
        </div>
      </Sec>
      <Sec title="📞 Do they have leads?"><List items={[`Cold email: ${r.leadGaps.coldEmail}`, `Quote dropouts: ${r.leadGaps.quoteDropouts}`, `Dead proposals: ${r.leadGaps.deadProposals}`]} /></Sec>
      <Sec title="🚨 Do they miss calls / inbound leads?"><List items={[`Bottleneck: ${r.missedCalls.bottleneck}`, `Slow response: ${r.missedCalls.slowResponse}`, `After hours: ${r.missedCalls.afterHours}`]} /></Sec>
      <Sec title={`🦄 Sub-niches inside ${n}`}><div className="flex flex-wrap gap-2">{r.subNiches.map((s) => <span key={s} className="rounded-full bg-primary/15 px-4 py-1.5 text-primary">{s}</span>)}</div></Sec>
      <Sec title="🤼 Pros & cons">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-success/10 p-5"><p className="mb-2 font-bold text-success">🟩 Pros</p><List items={r.pros} /></div>
          <div className="rounded-2xl bg-destructive/10 p-5"><p className="mb-2 font-bold text-destructive">🟥 Cons</p><List items={r.cons} /></div>
        </div>
        <p>Difficulty: <b>{r.difficulty}</b></p>
      </Sec>
      <Sec title="🛞 Is it good for AI automation?"><p className="rounded-2xl bg-primary/15 p-4 font-display text-xl font-bold text-primary">“{r.positioning}”</p><List items={r.helpThem} /></Sec>
    </div>
  );
}

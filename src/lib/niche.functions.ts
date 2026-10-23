import { createServerFn } from "@tanstack/react-start";
import type { NicheReport } from "./niche-types";

const str = { type: "string" } as const;
const num = { type: "number" } as const;
const bool = { type: "boolean" } as const;
const arr = (items: object) => ({ type: "array", items });
const obj = (properties: Record<string, object>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

const schema = obj({
  niche: str,
  summary: str,
  leadCount: num,
  leadCountNote: str,
  avgTicketUsd: num,
  ticketNote: str,
  businessModel: { type: "string", enum: ["B2B", "B2C", "Both"] },
  growth: obj({ isGrowing: bool, label: str, reason: str }),
  availability: arr(obj({ source: str, available: bool, note: str })),
  products: arr(obj({ name: str, fit: bool, reason: str })),
  whatTheyDo: arr(str),
  theyManage: arr(str),
  sells: arr(obj({ title: str, items: arr(str), note: str })),
  sellTo: arr(str),
  idealCustomer: str,
  tickets: obj({ small: str, mid: str, enterprise: str, tier: str }),
  market: obj({ summary: str, drivers: arr(str) }),
  pains: arr(obj({ title: str, detail: str })),
  salesSystems: obj({ aiSdr: arr(str), coldEmail: arr(str), leadTracking: arr(str) }),
  leadGaps: obj({ coldEmail: str, quoteDropouts: str, deadProposals: str }),
  missedCalls: obj({ bottleneck: str, slowResponse: str, afterHours: str }),
  subNiches: arr(str),
  pros: arr(str),
  cons: arr(str),
  difficulty: str,
  positioning: str,
  helpThem: arr(str),
});

const SYSTEM = `You are an elite B2B Offer Architect and AI Automation Agency consultant.
Perform an exhaustive, honest breakdown of the niche for an agency selling AI Receptionists, AI Sales Systems, AI SDRs, Cold Email Infrastructure and Full Business Operating Systems.
Rules:
- leadCount: realistic estimate of reachable businesses worldwide (mainly US/UK/CA/AU) as a number.
- avgTicketUsd: the average deal/contract value these businesses charge THEIR clients, in USD (number). Be realistic; do not inflate.
- growth: be honest. Dying niches (e.g. generic graphic designers replaced by AI) must be isGrowing=false.
- availability: exactly these sources in order: "Apollo", "Google Maps", "LinkedIn Sales Navigator", "Industry directories".
- products: exactly these 5 in order: "AI Receptionist", "AI Sales Systems", "AI SDR", "Cold Email Infrastructure", "Full Operating System". fit=true only if it genuinely makes sense.
- whatTheyDo, theyManage: 5 items each. sells: 4 offers (recurring retainer, high-ticket project, specialized/compliance, consulting). pains: 3. subNiches: 3-5. pros/cons: 3 each. salesSystems lists: 2-3 items each. helpThem: 4 items.
- positioning: one punchy offer line like "AI Sales Systems & High-Velocity Lead Generation for X".
Be specific to the niche, not generic.`;

export const analyzeNiche = createServerFn({ method: "POST" })
  .inputValidator((input: { niche: string }) => {
    const niche = String(input?.niche ?? "").trim();
    if (niche.length < 2 || niche.length > 120) throw new Error("Enter a niche name (2-120 characters).");
    return { niche };
  })
  .handler(async ({ data }): Promise<NicheReport> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured.");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions: SYSTEM,
        input: `INPUT NICHE TO ANALYZE: ${data.niche}`,
        text: { format: { type: "json_schema", name: "niche_report", strict: true, schema } },
      }),
    });
    if (!res.ok || !res.body) {
      const body = await res.text();
      console.error(`AI request failed [${res.status}]: ${body}`);
      if (res.status === 402) throw new Error("AI credits ran out. Add credits to keep analyzing.");
      if (res.status === 429) throw new Error("Too many requests right now. Try again in a minute.");
      throw new Error(`AI request failed (${res.status}).`);
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let out = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") out += ev.delta;
          if (ev.type === "response.failed" || ev.type === "error")
            throw new Error(ev.response?.error?.message ?? ev.message ?? "AI failed");
        } catch (e) {
          if (e instanceof Error && !(e instanceof SyntaxError)) throw e;
        }
      }
    }
    if (!out) throw new Error("The AI returned no analysis. Try again.");
    return JSON.parse(out) as NicheReport;
  });

/* ---------------- Google Docs ---------------- */

type Seg = { text: string; kind: "title" | "h1" | "h2" | "h3" | "p" | "bullet" | "callout"; color?: [number, number, number] };

const C = {
  ink: [0.1, 0.12, 0.2] as [number, number, number],
  blue: [0.15, 0.35, 0.85] as [number, number, number],
  green: [0.1, 0.6, 0.35] as [number, number, number],
  red: [0.85, 0.2, 0.2] as [number, number, number],
  orange: [0.9, 0.45, 0.1] as [number, number, number],
  purple: [0.45, 0.25, 0.75] as [number, number, number],
};

function buildSegments(r: NicheReport, good: boolean, reasons: string[]): Seg[] {
  const s: Seg[] = [];
  const h = (text: string, color = C.blue) => s.push({ text, kind: "h2", color });
  const h3 = (text: string, color = C.purple) => s.push({ text, kind: "h3", color });
  const p = (text: string) => s.push({ text, kind: "p" });
  const b = (items: string[]) => items.forEach((t) => s.push({ text: t, kind: "bullet" }));
  const n = r.niche;

  s.push({ text: `${n} — Niche Analysis`, kind: "title", color: C.ink });
  s.push({
    text: good ? `✅ VERDICT: GOOD NICHE — go ahead` : `❌ VERDICT: NOT A GOOD NICHE — ${reasons.join("; ")}`,
    kind: "callout",
    color: good ? C.green : C.red,
  });
  p(r.summary);

  h("📋 Core Filters", C.orange);
  b([
    `Leads available: ~${r.leadCount.toLocaleString()} (${r.leadCountNote})`,
    `Average ticket size: $${r.avgTicketUsd.toLocaleString()} (${r.ticketNote})`,
    `Business model: ${r.businessModel}`,
    `Growth: ${r.growth.label} — ${r.growth.reason}`,
    ...r.availability.map((a) => `${a.available ? "✅" : "❌"} ${a.source}: ${a.note}`),
  ]);
  h3("Products you can sell them");
  b(r.products.map((x) => `${x.fit ? "✅" : "❌"} ${x.name}: ${x.reason}`));

  s.push({ text: n, kind: "h1", color: C.ink });
  p(`Alright — let's break down ${n} as a niche in a way that helps you decide if it's good for your AI automation model.`);
  h(`📂 What Do ${n} Companies Do?`);
  b(r.whatTheyDo);
  p("They protect / manage / build:");
  b(r.theyManage);
  h("📦 What Do They Sell?");
  r.sells.forEach((o, i) => {
    h3(`${i + 1}. ${o.title}`);
    b(o.items);
    p(`👉 ${o.note}`);
  });
  h("🎯 Who Do They Sell To?");
  b(r.sellTo);
  p(`Basically: "${r.idealCustomer}"`);
  h("💰 Ticket Size", C.green);
  b([`Small contract: ${r.tickets.small}`, `Mid contract: ${r.tickets.mid}`, `Enterprise: ${r.tickets.enterprise}`]);
  p(`This is a ${r.tickets.tier} ticket niche.`);
  h("📊 How Big Is The Market?");
  p(r.market.summary);
  p("Demand is driven by:");
  b(r.market.drivers);
  h("😡 Pain Level", C.red);
  b(r.pains.map((x) => `${x.title}: ${x.detail}`));
  p('They don\'t buy for "growth" — they buy for "survival / efficiency". This makes selling easier.');
  h("⚙️ The Core Sales Systems They Desperately Need");
  h3("1. AI SDR Systems (The Autonomous Prospecting Engine)");
  b(r.salesSystems.aiSdr);
  h3("2. Cold Email Infrastructure (The High-Velocity Inbox Network)");
  b(r.salesSystems.coldEmail);
  h3("3. AI Lead Gen Tracking (The Pipeline Intelligence Hub)");
  b(r.salesSystems.leadTracking);
  h("📞 Do They Have Leads?");
  b([
    `Cold Email Infrastructure: ${r.leadGaps.coldEmail}`,
    `Inbound Quote Dropouts: ${r.leadGaps.quoteDropouts}`,
    `Dead Proposals: ${r.leadGaps.deadProposals}`,
  ]);
  h("🚨 Do They Miss Calls / Inbound Leads?", C.red);
  b([
    `Core bottleneck: ${r.missedCalls.bottleneck}`,
    `Slow response times: ${r.missedCalls.slowResponse}`,
    `After-hours leakage: ${r.missedCalls.afterHours}`,
  ]);
  h(`🦄 Sub-Niches Inside ${n}`);
  b(r.subNiches);
  h("🤼 Pros & Cons For You");
  h3("🟩 Pros", C.green);
  b(r.pros);
  h3("🟥 Cons", C.red);
  b(r.cons);
  p(`This is a ${r.difficulty} difficulty niche.`);
  h("🛞 Is It Good for AI Automation?", C.green);
  s.push({ text: r.positioning, kind: "callout", color: C.purple });
  p("You help them:");
  b(r.helpThem);
  return s;
}

export const createNicheDoc = createServerFn({ method: "POST" })
  .inputValidator((input: { report: NicheReport; good: boolean; reasons: string[] }) => {
    if (!input?.report?.niche) throw new Error("Missing report.");
    return input;
  })
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const GD = process.env.GOOGLE_DOCS_API_KEY;
    if (!LOVABLE_API_KEY || !GD) throw new Error("Google Docs is not connected.");
    const GATEWAY = "https://connector-gateway.lovable.dev/google_docs/v1";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GD,
    };
    const created = await fetch(`${GATEWAY}/documents`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title: `${data.report.niche} — Niche Analysis` }),
    });
    if (!created.ok) {
      const t = await created.text();
      console.error(`Docs create failed [${created.status}]: ${t}`);
      throw new Error(`Couldn't create the Google Doc (${created.status}).`);
    }
    const { documentId } = (await created.json()) as { documentId: string };

    const segs = buildSegments(data.report, data.good, data.reasons);
    let idx = 1;
    let full = "";
    const styles: object[] = [];
    const bulletRanges: { start: number; end: number }[] = [];
    const named: Record<Seg["kind"], string> = {
      title: "TITLE", h1: "HEADING_1", h2: "HEADING_2", h3: "HEADING_3", p: "NORMAL_TEXT", bullet: "NORMAL_TEXT", callout: "NORMAL_TEXT",
    };
    for (const seg of segs) {
      const text = seg.text.replace(/\n/g, " ") + "\n";
      const start = idx;
      const end = idx + text.length;
      full += text;
      styles.push({
        updateParagraphStyle: {
          range: { startIndex: start, endIndex: end },
          paragraphStyle: { namedStyleType: named[seg.kind], spaceBelow: { magnitude: 6, unit: "PT" } },
          fields: "namedStyleType,spaceBelow",
        },
      });
      if (seg.color) {
        const [red, green, blue] = seg.color;
        const ts: Record<string, unknown> = { foregroundColor: { color: { rgbColor: { red, green, blue } } }, bold: true };
        let fields = "foregroundColor,bold";
        if (seg.kind === "callout") {
          ts.backgroundColor = { color: { rgbColor: { red: 0.96, green: 0.95, blue: 0.88 } } };
          ts.fontSize = { magnitude: 14, unit: "PT" };
          fields += ",backgroundColor,fontSize";
        }
        styles.push({ updateTextStyle: { range: { startIndex: start, endIndex: end - 1 }, textStyle: ts, fields } });
      }
      if (seg.kind === "bullet") {
        const last = bulletRanges[bulletRanges.length - 1];
        if (last && last.end === start) last.end = end;
        else bulletRanges.push({ start, end });
      }
      idx = end;
    }
    const requests = [
      { insertText: { location: { index: 1 }, text: full } },
      ...styles,
      ...bulletRanges.map((r) => ({
        createParagraphBullets: { range: { startIndex: r.start, endIndex: r.end }, bulletPreset: "BULLET_DISC_CIRCLE_SQUARE" },
      })),
    ];
    const upd = await fetch(`${GATEWAY}/documents/${documentId}:batchUpdate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ requests }),
    });
    if (!upd.ok) {
      const t = await upd.text();
      console.error(`Docs update failed [${upd.status}]: ${t}`);
      throw new Error(`Couldn't write the Google Doc (${upd.status}).`);
    }
    return { documentId, url: `https://docs.google.com/document/d/${documentId}/edit` };
  });

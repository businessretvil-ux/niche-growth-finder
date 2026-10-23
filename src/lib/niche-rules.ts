export const MIN_TICKET_USD = 2500;

export type Verdict = { good: boolean; reasons: string[] };

/** Core go / no-go rule: ticket must be at least $2,500 and the niche must be growing. */
export function judgeNiche(avgTicketUsd: number, isGrowing: boolean): Verdict {
  const reasons: string[] = [];
  if (avgTicketUsd < MIN_TICKET_USD)
    reasons.push(`Average ticket is under $${MIN_TICKET_USD.toLocaleString()}`);
  if (!isGrowing) reasons.push("The niche is not growing");
  return { good: reasons.length === 0, reasons };
}

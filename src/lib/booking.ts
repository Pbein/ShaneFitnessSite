/**
 * True only for a *real* Calendly scheduling link (calendly.com/<something>),
 * not the bare "https://calendly.com/" placeholder. Used to gate the inline
 * embed so the live site never shows a broken/empty Calendly before Shane sets
 * his real link in the CMS.
 */
export function isEmbeddableCalendly(url?: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (
      (u.hostname === "calendly.com" || u.hostname.endsWith(".calendly.com")) &&
      u.pathname.replace(/\/+$/, "").length > 0
    );
  } catch {
    return false;
  }
}

/**
 * Recognise Calendly's "booking completed" message from its inline embed.
 *
 * Calendly posts `{ event: "calendly.event_scheduled", payload: { event: { uri },
 * invitee: { uri } } }` to the parent window (help.calendly.com, "Advanced
 * Calendly embed for developers"). Any page can postMessage to this window, so
 * the origin check is what stops a stray frame from faking a Lead.
 *
 * Returns null when the message is not a booking; otherwise the invitee URI
 * (unique per booking), or "" if Calendly ever omits it.
 */
export function calendlyScheduledId(origin: string, data: unknown): string | null {
  if (origin !== "https://calendly.com") return null;
  if (typeof data !== "object" || data === null) return null;
  const d = data as { event?: unknown; payload?: { invitee?: { uri?: unknown } } };
  if (d.event !== "calendly.event_scheduled") return null;
  const uri = d.payload?.invitee?.uri;
  return typeof uri === "string" ? uri : "";
}

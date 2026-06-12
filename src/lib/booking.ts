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

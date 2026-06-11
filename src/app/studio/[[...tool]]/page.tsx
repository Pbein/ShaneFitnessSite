/**
 * Embedded Sanity Studio at /studio.
 * Renders full-screen via NextStudio; lives outside the (site) layout so it
 * gets a clean page with no site header/footer or Tailwind preflight.
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}

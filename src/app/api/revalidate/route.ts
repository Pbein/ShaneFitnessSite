import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Sanity → Next on-demand revalidation.
 *
 * A Sanity webhook POSTs here whenever content is published. All CMS reads are
 * tagged "sanity" (see src/lib/sanity/fetch.ts), so revalidateTag("sanity")
 * refreshes every CMS-backed page immediately instead of waiting for the 60s ISR
 * fallback — i.e. Shane publishes and the live site updates right away.
 *
 * Guarded by a shared secret the webhook sends as the `x-revalidate-secret`
 * header (set SANITY_REVALIDATE_SECRET in Vercel + the Sanity webhook config).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  const provided = req.headers.get("x-revalidate-secret");

  // A missing server-side secret and a wrong header are very different problems,
  // and returning one 401 for both hid the worse of the two: unconfigured, every
  // webhook silently 401s and revalidation quietly degrades to the 60s ISR
  // fallback — which reads as "it works, just slowly" rather than as a failure.
  // Fail loudly and distinguishably instead.
  if (!secret) {
    return NextResponse.json(
      {
        revalidated: false,
        message:
          "SANITY_REVALIDATE_SECRET is not set on the server — on-demand revalidation is disabled.",
      },
      { status: 500 },
    );
  }

  if (provided !== secret) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid secret" },
      { status: 401 },
    );
  }

  // Body is optional — a bare ping still refreshes everything. When Sanity sends
  // the document, we surface its _type in the response for easier debugging.
  let type: string | null = null;
  try {
    const body = await req.json();
    type = typeof body?._type === "string" ? body._type : null;
  } catch {
    /* no/invalid body — fine, we still revalidate */
  }

  revalidateTag("sanity");
  return NextResponse.json({ revalidated: true, type });
}

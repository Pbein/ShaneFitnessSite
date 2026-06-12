"use client";

import { createContext, useContext } from "react";
import type { CtaSettings } from "@/lib/cta";

/**
 * Makes the booking/payment URLs (from CMS siteSettings, fetched once in the
 * server layout) available to client-rendered CtaButtons without prop-drilling.
 */
const CtaSettingsContext = createContext<CtaSettings>({
  bookingUrl: "#",
  paymentLinks: [],
});

export function CtaSettingsProvider({
  value,
  children,
}: {
  value: CtaSettings;
  children: React.ReactNode;
}) {
  return <CtaSettingsContext.Provider value={value}>{children}</CtaSettingsContext.Provider>;
}

export function useCtaSettings() {
  return useContext(CtaSettingsContext);
}

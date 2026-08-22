import { type SchemaTypeDefinition } from "sanity";

// Objects
import { plainText } from "./objects/plainText";
import { cta } from "./objects/cta";
import { socialLink } from "./objects/socialLink";
import { paymentLink } from "./objects/paymentLink";
import { credential } from "./objects/credential";
import { interest } from "./objects/interest";

// Documents
import { siteSettings } from "./documents/siteSettings";
import { homepage } from "./documents/homepage";
import { aboutPage } from "./documents/aboutPage";
import { service } from "./documents/service";
import { testimonial } from "./documents/testimonial";
import { resource } from "./documents/resource";
import { ownerTask } from "./documents/ownerTask";

export const schemaTypes: SchemaTypeDefinition[] = [
  // objects
  plainText,
  cta,
  socialLink,
  paymentLink,
  credential,
  interest,
  // documents
  siteSettings,
  homepage,
  aboutPage,
  service,
  testimonial,
  resource,
  ownerTask,
];

/** Document types that should exist exactly once (enforced in structure + config). */
export const singletonTypes = new Set<string>(["siteSettings", "homepage", "aboutPage"]);

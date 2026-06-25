import type { StructureResolver } from "sanity/structure";

/**
 * Desk structure. Singletons (Site Settings, Homepage, About Page) open their
 * single document directly; everything else is a normal document list.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.listItem()
        .title("Homepage")
        .id("homepage")
        .child(S.document().schemaType("homepage").documentId("homepage")),
      S.listItem()
        .title("About Page")
        .id("aboutPage")
        .child(S.document().schemaType("aboutPage").documentId("aboutPage")),
      S.divider(),
      // Services split into Active / Retired. Retired ones keep all their copy in
      // the CMS but don't render on the site — flip status back to Active to restore.
      S.listItem()
        .title("Services")
        .child(
          S.list()
            .title("Services")
            .items([
              S.listItem()
                .title("Active")
                .child(
                  S.documentList()
                    .title("Active Services")
                    .filter('_type == "service" && status != "retired"'),
                ),
              S.listItem()
                .title("Retired")
                .child(
                  S.documentList()
                    .title("Retired Services")
                    .filter('_type == "service" && status == "retired"'),
                ),
            ]),
        ),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.documentTypeListItem("resource").title("Resources"),
    ]);

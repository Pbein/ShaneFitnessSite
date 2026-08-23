import type { StructureResolver } from "sanity/structure";

/**
 * Desk structure. Singletons (Site Settings, Homepage, About Page) open their
 * single document directly; everything else is a normal document list.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      // Shane's private to-do list, first because it is the thing he is most
      // likely to be opening the Studio for. Split by state rather than shown
      // as one list: a finished task scrolling past every visit makes the list
      // feel longer the more work you do, which is the wrong incentive.
      S.listItem()
        .title("📋 To-Do List")
        .child(
          S.list()
            .title("To-Do List")
            .items([
              S.listItem()
                .title("🔥 Do first")
                .child(
                  S.documentList()
                    .title("Do first")
                    .filter('_type == "ownerTask" && done != true && priority == "1"')
                    .defaultOrdering([{ field: "category", direction: "asc" }]),
                ),
              S.listItem()
                .title("⬜ Everything still to do")
                .child(
                  S.documentList()
                    .title("Still to do")
                    .filter('_type == "ownerTask" && done != true')
                    .defaultOrdering([
                      { field: "priority", direction: "asc" },
                      { field: "category", direction: "asc" },
                    ]),
                ),
              S.listItem()
                .title("✅ Done")
                .child(
                  S.documentList()
                    .title("Done")
                    .filter('_type == "ownerTask" && done == true')
                    .defaultOrdering([{ field: "category", direction: "asc" }]),
                ),
              S.divider(),
              S.listItem()
                .title("By category")
                .child(
                  S.list()
                    .title("By category")
                    .items(
                      (
                        [
                          ["gbp", "Google Business Profile"],
                          ["ads", "Google Ads"],
                          ["reviews", "Reviews"],
                          ["social", "Instagram & Social"],
                          ["website", "Website"],
                          ["admin", "Business admin"],
                        ] as const
                      ).map(([value, title]) =>
                        S.listItem()
                          .id(value)
                          .title(title)
                          .child(
                            S.documentList()
                              .title(title)
                              .filter('_type == "ownerTask" && category == $category')
                              .params({ category: value })
                              .defaultOrdering([{ field: "priority", direction: "asc" }]),
                          ),
                      ),
                    ),
                ),
            ]),
        ),
      // Answers rather than tasks. Kept separate from the to-do list on purpose:
      // Shane said he felt overwhelmed, and the worst way to answer "do I need
      // an LLC?" is to add six more checkboxes. Most of these end in "so you can
      // ignore this for now", which a checklist cannot say.
      S.listItem()
        .title("📖 Guides & Answers")
        .child(
          S.list()
            .title("Guides & Answers")
            .items([
              S.listItem()
                .title("⭐ Read in order")
                .child(
                  S.documentList()
                    .title("Read in order")
                    .filter('_type == "ownerGuide"')
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),
              S.divider(),
              ...(
                [
                  ["start-here", "⭐ Start here"],
                  ["business-setup", "Business setup (LLC)"],
                  ["insurance", "Insurance & safety"],
                  ["getting-clients", "Getting your first clients"],
                  ["money", "Money, pricing & tax"],
                ] as const
              ).map(([value, title]) =>
                S.listItem()
                  .id(`guide-${value}`)
                  .title(title)
                  .child(
                    S.documentList()
                      .title(title)
                      .filter('_type == "ownerGuide" && category == $category')
                      .params({ category: value })
                      .defaultOrdering([{ field: "order", direction: "asc" }]),
                  ),
              ),
            ]),
        ),
      S.divider(),
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

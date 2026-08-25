/**
 * Seeds the "Getting found online (SEO)" guides (`ownerGuide`, category `seo`).
 *
 *   node scripts/seed-seo-guides.mjs
 *
 * Same contract as seed-owner-guides.mjs: `createIfNotExists` with stable dotted
 * ids, so re-running adds what is missing and never overwrites Shane's notes.
 * The dot is deliberate — see the header of seed-posts.mjs. These are private
 * owner documents and the dotted id is what keeps them out of anonymous reach on
 * a public dataset.
 *
 * Why this section exists: Shane now has somewhere to publish articles, and the
 * reason he wanted one is traffic. Writing is the easy half. Knowing what to
 * write about, how often, and what actually moves rankings is the half that
 * usually goes wrong, and none of it is obvious if you have never done it.
 *
 * Two things shape every answer here:
 *
 *   1. He coaches REMOTELY. Most SEO advice for personal trainers is local
 *      advice ("rank for gyms in Arlington"), and local intent is far easier to
 *      win than national. He is competing with every online coach in the country
 *      on the general terms, so the strategy has to be specific-and-narrow, not
 *      broad-and-generic.
 *   2. He has no clients yet and limited time. Advice he cannot sustain is worse
 *      than no advice, because abandoning a blog after four posts is a worse
 *      outcome than never starting one.
 *
 * Nothing here promises rankings. SEO takes months, and saying so plainly is
 * more useful than the confidence most guides are written with.
 */
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^"|"$/g, "") : null;
};

const projectId = get("NEXT_PUBLIC_SANITY_PROJECT_ID");
const dataset = get("NEXT_PUBLIC_SANITY_DATASET");
const apiVersion = get("NEXT_PUBLIC_SANITY_API_VERSION") ?? "2025-01-01";
const token = get("SANITY_API_WRITE_TOKEN");

if (!projectId || !dataset || !token) {
  console.error("Missing Sanity config in .env.local.");
  process.exit(1);
}

const G = (id, doc) => ({ _id: `ownerGuide.${id}`, _type: "ownerGuide", ...doc });
const links = (...pairs) =>
  pairs.map(([label, url], i) => ({ _type: "guideLink", _key: `l${i}`, label, url }));

const guides = [
  /* ================================================================ */
  G("seo-how-it-works", {
    title: "How do people actually find my articles on Google?",
    category: "seo",
    order: 60,
    shortAnswer:
      "Someone types a question, Google shows the pages it thinks answer it best, and you are one of the options. Your job is to be the best answer to a question specific enough that you can realistically win it. Nobody finds article number one. The traffic comes from having fifteen of them, and it arrives months after you write them, not days.",
    theDetail: `Here is the part that surprises everyone the first time.

You will publish an article, check Google the next day, find nothing, and conclude it does not work. That is the normal experience. A new page typically takes weeks to be indexed at all and months to settle into a position. The site is eight weeks old, which in search terms is brand new — Google has very little history to judge it by yet, and that improves on its own with time and pages.

**Why your situation is different from most trainer advice.**

Almost everything written about SEO for personal trainers assumes you train people in a specific town. That advice is genuinely easy to follow, because "personal trainer in Silver Spring" has maybe a dozen serious competitors and Google heavily favours businesses near the searcher. You do get that advantage for the in-person side of what you do, and the Google Business Profile is what wins it — not articles.

Your online coaching is the hard direction. "Online personal trainer" is competed for by national companies with hundreds of pages and years of history. You will not win that phrase, and trying is how people waste a year.

**What you can win: specific questions.**

The phrases worth having are the long, unglamorous ones — what the industry calls long-tail. "How many days a week should I lift to build muscle", "can you build muscle training twice a week", "compound vs isolation exercises for beginners". Each of these gets a fraction of the traffic of the big terms. That is exactly why you can rank for them.

They are also better traffic. Somebody typing a question that specific has a problem, and you are about to answer it well. Somebody typing "workout" is not close to hiring anyone.

**The compounding part.**

Fifteen articles that each bring five visitors a month is seventy-five visitors a month, arriving forever, without paying per click. That is the whole argument for doing this. It is slow and then it is free, which is the opposite shape from Google Ads — fast, and expensive every single day you want it.

Neither one replaces the other. Ads answer "do I get clients this month". Articles answer "do I still get clients in a year without paying for every one".`,
    doNow: [
      "Accept up front that nothing measurable happens for about three months. Decide now that you will keep going anyway, because the decision gets harder once you have written four articles and seen nothing.",
      "Do the Search Console task first (it is in the to-do list) — without it you are guessing about everything else.",
      "Stop checking Google for your own article. Searching for it yourself tells you nothing useful and is demoralising.",
    ],
    ignoreForNow:
      "Keyword research tools (Ahrefs, Semrush and the like) cost more per month than this website. You do not need one until you have ten articles up and real Search Console data telling you what people already find you for. Ignore anyone selling you 'SEO packages' or guaranteed rankings — nobody can guarantee a ranking, and the ones who promise it are usually buying links, which is against Google's guidelines and can get a site penalised.",
    revisitWhen: "You have published five articles and Search Console has three months of data.",
    links: links(
      ["Google Search Console (free, this is the one that matters)", "https://search.google.com/search-console"],
      ["Google's own SEO starter guide", "https://developers.google.com/search/docs/fundamentals/seo-starter-guide"],
    ),
  }),

  /* ================================================================ */
  G("seo-what-to-write", {
    title: "What should I actually write about? (article ideas)",
    category: "seo",
    order: 61,
    shortAnswer:
      "Write the answers you already give clients out loud. Every question you have answered twice is an article. Below are four different jobs an article can do and around thirty specific titles — pick from the job you need right now rather than working down the list in order.",
    theDetail: `Not every article is trying to do the same thing, and this is the distinction most people miss. Pick the job first, then the title.

=========================================================
JOB 1 — GET FOUND BY STRANGERS
=========================================================
These target a real question people type into Google. They bring people who have never heard of you. This is the SEO job, and it is slow.

Choose these when: you want traffic in six months.

  - How many days a week should I lift to build muscle?
  - Can you build muscle training only twice a week?
  - Compound vs isolation exercises: which should beginners focus on?
  - How long does it actually take to see results from lifting?
  - What is progressive overload, and how do I know I'm doing it?
  - Do I need to train to failure to build muscle?
  - How much protein do I actually need per day?
  - Do I have to count calories to lose fat?
  - How do I keep training while travelling for work?
  - Is it too late to start lifting in your 30s / 40s?
  - How do I get back into the gym after months off?
  - Why am I not losing weight even though I'm in a deficit?
  - How many sets per muscle group per week?
  - Cardio and lifting on the same day: does it kill your gains?
  - What should I eat before and after a workout?

=========================================================
JOB 2 — CONVINCE SOMEONE WHO IS ALREADY CONSIDERING COACHING
=========================================================
These get almost no search traffic and that is fine. They exist so that someone comparing you against another coach — or against doing nothing — finds the answer instead of hesitating. Send them by text to people who go quiet after a consultation.

Choose these when: you have consultations that aren't closing.

  - What does online coaching actually look like week to week?
  - Online coaching vs a gym membership vs a local trainer: honest comparison
  - Do I need a gym to work with an online coach?
  - What happens in your first month with me
  - How much equipment do I actually need at home?
  - Why I don't put clients on 6-day training splits
  - What I do when a client stops making progress
  - Who online coaching is NOT for

=========================================================
JOB 3 — SAVE YOU FROM REPEATING YOURSELF
=========================================================
Things you will otherwise explain by text, one client at a time, forever. Write once, link it whenever it comes up. This is the job with the fastest payback — you will use these in week one.

Choose these when: you notice you've typed the same explanation twice.

  - How to warm up properly in five minutes
  - How to know if a weight is too heavy or too light (RPE, in plain English)
  - What to do when you miss a week of training
  - How to eat out without wrecking your progress
  - Soreness is not the goal: what it does and doesn't mean
  - Sleep, stress and why your progress stalled
  - How to track your workouts so the numbers actually mean something

=========================================================
JOB 4 — SHOW YOU KNOW WHAT YOU'RE TALKING ABOUT
=========================================================
Opinion and philosophy. These build trust and they are the ones people share. Your first article — "The Reason Most Workout Programs Fail" — is one of these, and it is the right thing to lead with.

Choose these when: you want the site to sound like a person rather than a brochure.

  - The reason most workout programs fail (published)
  - Why "sustainable" is not a soft option
  - The fitness advice I've changed my mind about
  - What I actually think about the supplements you're being sold
  - Why I don't sell 30-day transformations

=========================================================
A NOTE ON THE REMOTE ANGLE
=========================================================
You coach people anywhere, so "in Maryland" is not your angle for online clients — but "for people like this" is. The narrower the person you are writing for, the easier it is to be found and the more the reader feels you mean them.

Think about who you actually want: busy professionals, people restarting after a long break, people who hated the gym the first time. Writing "strength training for people who work 50-hour weeks" is a smaller audience than "strength training", which is precisely why you can win it.

=========================================================
HOW TO PICK THE NEXT ONE
=========================================================
Simplest rule that works: the next article is the last question a real person asked you. Not the best question — the last one. If nobody has asked you anything yet, take the one from Job 3 you would most hate to type out twice.

One topic per article. If a title has an "and" in it, it is two articles.`,
    doNow: [
      "Write your second article now, while the first is fresh: progressive overload. Your first article already promises it, and finishing that promise turns two articles into a set that links to each other.",
      "Start a note on your phone. Every time a client, a friend or someone at the gym asks you a training question, add it to the note verbatim, in their words. That note is your article list for the next year and it is better than anything you could brainstorm.",
      "Pick one article from Job 3 and write it before you need it. You will use it within a month.",
    ],
    ignoreForNow:
      "Do not try to cover a whole topic in one enormous article — 'The complete guide to nutrition' is a book, and it will sit half-finished. Six hundred honest words on one question beats three thousand on twelve. Also ignore the urge to write about whatever is trending on Instagram this week; that traffic disappears as fast as it arrives.",
    revisitWhen: "You've published three articles and want to plan the next three.",
  }),

  /* ================================================================ */
  G("seo-how-often", {
    title: "How often do I need to post?",
    category: "seo",
    order: 62,
    shortAnswer:
      "Twice a month, forever, beats eight in January and nothing after. Pick a rate you can hold on your worst week, not your best one. Two a month is twenty-four articles in a year, which is a genuinely substantial site.",
    theDetail: `Frequency matters less than most advice implies, and consistency matters more.

Google does not reward you for posting on a schedule. What actually happens is simpler: more good articles means more questions you can be the answer to, and a site that keeps getting new pages looks alive rather than abandoned. Both of those come from sustained output, not from bursts.

The failure mode is completely predictable. Enthusiasm produces four articles in two weeks, then a busy month, then the guilt of being behind, then never again. You now have a blog with four posts and a most-recent date of eight months ago, which reads worse to a visitor than having no blog at all.

**The rate to pick.**

Two a month. If that feels easy after three months, go to weekly. If two is a struggle, one a month is still fine — twelve articles a year is twelve more than you have now.

**Batching is what makes it survivable.**

Do not sit down to write an article. Sit down to write three. The hard part is switching into writing mode, and once you are in it a second and third article costs much less than the first did. Write three in one sitting, publish them a fortnight apart, and you have covered six weeks in one afternoon.

You do not have to publish on the day you write. The date field on the article is yours to set.

**Length.**

Roughly 600 to 1,200 words. Below about 300 there is not enough on the page for Google to understand what it is about. Above 1,500 you are usually padding, and padding is obvious to a reader. Your first article is about 250 words — genuinely good, but it is at the short end, and adding a couple of hundred words of "here is what that looks like in practice" would help it.

**Old articles are not finished.**

Updating an article is often worth more than writing a new one, because it already has whatever standing it has earned. When your thinking changes, or a client asks something the article half-answers, go back and improve it. Editing the article in the CMS updates the date Google sees automatically.`,
    doNow: [
      "Put a recurring 90-minute block in your calendar, twice a month, called 'write'. Treat it like a client session — the reason blogs die is that writing time is the first thing to get moved.",
      "Next time you write, write two articles and publish the second one two weeks later.",
    ],
    ignoreForNow:
      "Ignore anyone telling you that you need to publish weekly or daily to compete. That advice is written for content agencies with staff writers. It is also worth ignoring AI-generated bulk posting — Google's guidance is explicitly about whether content is helpful and written for people, and a site of thirty generic AI articles is a worse asset than five articles that sound like you. Your voice is the one thing a competitor cannot copy.",
    revisitWhen: "You've held a rate for three months and it feels easy.",
    links: links([
      "Google on 'helpful content' — what they say they reward",
      "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    ]),
  }),

  /* ================================================================ */
  G("seo-write-to-rank", {
    title: "How do I write an article that actually gets found?",
    category: "seo",
    order: 63,
    shortAnswer:
      "Decide the one question the article answers, put that question in the title in the words a normal person would use, answer it properly in the first paragraph, and break the rest up with headings. That is most of it. There is no trick underneath.",
    theDetail: `The checklist, in the order it matters.

**1. One question per article.**
Before writing, finish this sentence: "This article is for someone who just typed ___ into Google." If you cannot finish it, the article does not have a target and will not rank for anything. If you can finish it two different ways, it is two articles.

**2. Put it in the title, in their words.**
People search in plain language. "How many days a week should I lift?" is a better title than "Optimising training frequency". Write for the person, not for the profession. There is a "What are you trying to be found for?" box on every article in the CMS — fill it in, then check the phrase honestly appears in the title, the first paragraph and at least one heading.

**3. Answer it in the first paragraph.**
Do not build up to the answer. Give it immediately, then spend the article explaining and qualifying it. Readers leave when they have to dig, and a reader who leaves in four seconds is a signal you do not want to send. Your first article does this well — the answer is in the first sentence.

**4. Use section headings every few paragraphs.**
In the editor, highlight a line and choose "Section heading (H2)". Headings do three jobs at once: they let people scan, they tell Google what the page covers, and they make the article far less intimidating to start reading. This is the single biggest formatting lever you have.

**5. Link to your own pages.**
When you mention coaching, link to /services. When you mention something you have written before, link to that article. Internal links help Google understand which of your pages matter and keep readers on the site. Highlight text in the editor and use the link button; a link starting with "/" stays on your site.

**6. Write like you talk.**
Read it out loud before publishing. If you would not say it to a client's face, cut it. This matters more than usual in fitness: health topics are held to a higher standard by Google precisely because bad advice does damage, and demonstrable first-hand experience is exactly what you have. Say "I've seen this with clients" where it is true — that is not filler, it is the thing that distinguishes you from a content farm.

**7. Fill in the summary.**
It becomes the grey text under your link in Google. It does not affect ranking, but it decides whether anyone clicks — which is the entire point of ranking.

**What does NOT work**
- Repeating the keyword over and over. Google has been able to detect this for twenty years, and it reads badly to humans.
- Writing for Google rather than for the reader. It produces stilted articles that rank badly anyway.
- Long preambles. "In today's fast-paced world..." — cut it, always.`,
    doNow: [
      "Go back to 'The Reason Most Workout Programs Fail' and add two or three section headings. It is a strong article with no signposts, and this is a five-minute edit that makes it easier to read and easier to find.",
      "Add a link from that article to /services where it talks about building a plan around your life.",
      "Fill in the 'What are you trying to be found for?' box on it, then check that phrase actually appears in the title and first paragraph.",
    ],
    ignoreForNow:
      "Ignore keyword density targets, LSI keywords, meta keywords tags, and anything else that sounds like a formula — meta keywords have been ignored by Google since 2009. Also ignore the technical side entirely: page speed, sitemaps, structured data and mobile layout are already handled for you by the site itself.",
    revisitWhen: "Before you publish each of your next three articles — use this as a checklist.",
  }),

  /* ================================================================ */
  G("seo-backlinks", {
    title: "What are backlinks, and do I need them?",
    category: "seo",
    order: 64,
    shortAnswer:
      "A backlink is another website linking to yours. Google treats them roughly as votes, which is why they matter. You need some, you cannot buy them safely, and for a coach they come from being genuinely useful to other people — podcasts, gyms, local press, and the people you already know.",
    theDetail: `The honest version: backlinks are the hardest part of SEO and the part you have least control over. They are also the reason a national brand outranks you on a general term no matter how good your article is.

The good news is that you do not need many. A handful of real links from real sites will do more for a site this size than obsessing over the writing will.

**Where yours will realistically come from.**

*Things you can do this month:*
- Your Instagram bio, and every other profile you own. These do not count as votes in Google's eyes, but they bring actual humans, which is the point of the whole exercise.
- Your Google Business Profile — link it to the site. (Already on your to-do list.)
- Any gym you have worked at or currently use. Trainer bio pages usually link out, and asking is free.
- Any certification body with a "find a trainer" directory. If you hold the credential, you are entitled to the listing.
- Friends and family who run any kind of business with a website. A genuine "coached by" mention is legitimate.

*Things worth doing over the next year:*
- Local podcasts. Small health, business and community podcasts are always short of guests, and every one links to their guest. This is the highest return per hour available to you.
- Writing something for someone else's site — a gym's blog, a local business newsletter, a nutritionist you know.
- Being a source. Journalists and bloggers look for qualified people to quote on fitness stories, and a quote comes with a link.
- Local press or community newsletters if you do anything they would cover — a free community session, a charity event.

**What to avoid, and this matters.**

Do not buy links. Not from an agency, not from a "guest post service", not from anyone in your DMs offering to boost your DA. Paid link schemes violate Google's spam policies and the downside is a penalty on a site you depend on. The people selling them do not carry that risk. You do.

The same goes for link-exchange groups, private blog networks, and mass directory submissions. Anything with the shape "pay a fee, get fifty links" is the thing Google's spam systems exist to catch.

**The reframe that makes this easier.**

Stop thinking about links and think about being mentioned. Every genuine link you will ever get comes from someone deciding you were worth pointing at. Being interviewed, being quoted, having written the clearest article on a question — those produce links as a side effect. Chasing links directly produces the kind you do not want.`,
    doNow: [
      "List every website you already have a legitimate claim to be on: gyms you've worked at or train in, your certifying body's directory, any club or team. Ask each one this month. Most will say yes and it costs nothing.",
      "Make sure your Instagram bio links to trainshane.com, not to a Linktree that links to it. Send people straight there.",
      "Email two local podcasts offering yourself as a guest on 'why most people quit training'. You now have an article that proves you can hold that conversation — link it in the email.",
    ],
    ignoreForNow:
      "Ignore domain authority scores, competitor backlink audits, and any tool that charges monthly to track links you don't have yet. Also ignore every DM and email offering SEO services or guaranteed first-page rankings — with no exceptions. Those are the single most common way small business sites get damaged.",
    revisitWhen: "You have ten articles published and want to push the ones that are close to ranking.",
    links: links([
      "Google's spam policies — what actually gets a site penalised",
      "https://developers.google.com/search/docs/essentials/spam-policies",
    ]),
  }),

  /* ================================================================ */
  G("seo-measure", {
    title: "How do I know if any of this is working?",
    category: "seo",
    order: 65,
    shortAnswer:
      "Google Search Console, checked once a month, not once a day. The number that matters is not visitors — it is whether the questions people find you for are getting more specific and more relevant over time. Enquiries are the real scoreboard, and they lag everything else by months.",
    theDetail: `**The one tool: Google Search Console.**

It is free, it is Google's own, and it tells you the only thing worth knowing — the actual searches that showed your site, how often people clicked, and where you sit. Setting it up is already on your to-do list. Nothing else on this page works without it.

**What to look at, in order.**

1. *Queries.* The searches that showed your site. This is the gold. Real phrases from real people, which beats guessing at what to write. Anything showing up in positions 5-20 is an article that is close — improving it is usually easier than writing a new one.
2. *Pages.* Which articles do anything at all. Expect this to be uneven: one article usually does more than the other five combined, and that tells you what to write more of.
3. *Impressions vs clicks.* Lots of impressions and no clicks usually means your title and summary are not compelling, not that your ranking is bad. That is a ten-minute fix.

**A realistic timeline, so you can tell "slow" from "broken".**

- *Month 1:* Google finds and indexes the pages. Essentially no traffic. This is normal, not failure.
- *Months 2-3:* A handful of impressions on very specific phrases. Still almost no clicks.
- *Months 4-6:* The first steady trickle. A few visitors a week, on long specific questions.
- *Months 6-12:* If you have kept publishing, this compounds. Articles you wrote in month two start bringing people in month eight.

The single most common reason people conclude SEO does not work is quitting in month three, which is before the part where it starts.

**The number that actually matters.**

Not visitors. Enquiries. Ten visitors a month who searched "online coach for busy professionals" are worth more than five hundred who searched "chest workout". When someone books a consultation, ask how they found you and write the answer down. That one habit tells you more than any dashboard.

**What not to do.**

Do not check daily. The data lags by two to three days, it moves around at random at low volumes, and watching it is a good way to talk yourself out of continuing. Once a month, fifteen minutes.`,
    doNow: [
      "Set up Google Search Console (it's in the to-do list) and submit trainshane.com/sitemap.xml. The sitemap already includes every article automatically.",
      "Put a 15-minute 'check Search Console' block in your calendar for the first Monday of each month, and nowhere else.",
      "Start asking every enquiry how they found you, and keep the answers in one note.",
    ],
    ignoreForNow:
      "Ignore the traffic numbers for the first three months entirely — there will not be enough data for them to mean anything, and reading noise as signal will just make you anxious. Ignore bounce rate and 'time on page' too; for a site this size they are statistically meaningless.",
    revisitWhen: "One month after Search Console is verified, and monthly after that.",
    links: links(
      ["Google Search Console", "https://search.google.com/search-console"],
      ["Your sitemap (every article is added automatically)", "https://trainshane.com/sitemap.xml"],
    ),
  }),
];

const mutations = guides.map((doc) => ({ createIfNotExists: doc }));

const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}?returnIds=true`;

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ mutations }),
});

const json = await res.json();

if (!res.ok) {
  console.error("Seed failed:", JSON.stringify(json, null, 2));
  process.exit(1);
}

console.log(`Seeded ${guides.length} SEO guide(s).`);
for (const r of json.results ?? []) console.log(`  ${r.operation.padEnd(8)} ${r.id}`);

/**
 * Seeds Shane's private to-do list (the `ownerTask` type) into Sanity.
 *
 *   node scripts/seed-owner-tasks.mjs
 *
 * Uses `createIfNotExists` with stable ids, so re-running is safe: it adds any
 * task that is missing and never overwrites one that exists. That matters
 * because Shane owns the `done` tick and the notes field on every document —
 * `createOrReplace` would quietly wipe both every time this ran.
 *
 * To deliberately update a task's wording later, edit it in the Studio, or
 * delete that one document and re-run.
 *
 * Reads credentials from .env.local. Never commit the token.
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
  console.error("Missing Sanity config in .env.local (project id, dataset, or write token).");
  process.exit(1);
}

const T = (id, doc) => ({ _id: `ownerTask.${id}`, _type: "ownerTask", done: false, ...doc });

const tasks = [
  /* ---------------------------------------------------------------- */
  /* Google Business Profile                                           */
  /* ---------------------------------------------------------------- */
  T("gbp-create", {
    title: "Create your Google Business Profile",
    category: "gbp",
    priority: "1",
    timeNeeded: "30 minutes, plus a wait for the postcard",
    link: "https://business.google.com/create",
    whatItIs:
      "A free listing that Google runs. It is what makes you appear on Google Maps, and in that box of three local businesses that shows up above the normal search results when someone searches for a service near them. It is a completely separate thing from your website and from Google Ads — having a website does not give you one.",
    whyItMatters:
      "When someone searches \"personal trainer near me\" or \"personal trainer Arlington\", the local results box is the first thing on the screen, above every paid ad and every website. It costs nothing and it is the single highest-value free listing a local service business can have. Right now you are paying for Google Ads clicks while leaving the free spot empty.",
    steps: [
      "Go to business.google.com/create and sign in with the Google account you want to own this forever (use your main one, not a throwaway).",
      "Business name: enter it exactly as you want it shown — \"Train Shane\". Do not add keywords like \"Personal Trainer DC\" to the name; Google penalises that and can suspend the listing.",
      "Category: choose \"Personal Trainer\" as the primary category. You can add \"Physical Fitness Program\" as a secondary one.",
      "When it asks \"Do you want to add a location customers can visit?\" — answer NO if you train at clients' homes, gyms, or online. Answer yes only if you have premises people come to.",
      "Then set your SERVICE AREA instead: add the specific towns/cities you will travel to across DC, Maryland and Virginia. Be realistic — only list places you would actually drive to.",
      "Add your phone number and your website: https://trainshane.com",
      "Google will verify you own the business — usually a postcard with a code to your address, sometimes a video call. Do this promptly; the listing is not live until it is verified.",
      "When the code arrives, enter it to finish verification.",
    ],
    watchOutFor:
      "Two things get profiles suspended. First, stuffing keywords into the business name — \"Train Shane\" is correct, \"Train Shane Personal Trainer DC MD VA\" is not. Second, listing a home address publicly when you are actually a service-area business: choose the service-area option and Google will hide the address while still showing you in local results.",
  }),

  T("gbp-photos", {
    title: "Add at least 10 photos to your Google Business Profile",
    category: "gbp",
    priority: "2",
    timeNeeded: "20 minutes",
    whatItIs:
      "Photos attached to your Google listing — they appear in Maps and in the local results panel.",
    whyItMatters:
      "A listing with photos gets meaningfully more clicks and direction requests than one without, and for a personal trainer the photos are doing the same job as a portfolio: they show you are a real person who really does this. A profile with no photos reads as abandoned.",
    steps: [
      "Open your profile at business.google.com and find the Photos section.",
      "Add a logo (the Train Shane badge) and a cover photo.",
      "Add photos of you actually coaching — spotting someone, demonstrating a lift, a session in progress. Real ones beat stock every time.",
      "Add a clear headshot of yourself. People are hiring a person, not a company.",
      "Add photos of the spaces you train in.",
      "Aim for 10 or more to start, then add one whenever you take a decent photo.",
    ],
    watchOutFor:
      "Do not post photos of clients without asking them first, and be careful with anything showing someone's face mid-workout — ask, and get a yes, every time.",
  }),

  T("gbp-services", {
    title: "List your services and prices on your Google profile",
    category: "gbp",
    priority: "2",
    timeNeeded: "20 minutes",
    whatItIs:
      "A section of your Google Business Profile where you list what you offer, with descriptions and prices.",
    whyItMatters:
      "It answers \"what does he do and what does it cost\" before someone has to click anything, which filters out people who were never going to book and warms up the ones who were. It also gives Google more text to match against searches.",
    steps: [
      "In your profile, find the Services section.",
      "Add each one, matching what is on the website so nothing contradicts: Free Consultation, In-Person Session ($100), Essential Coaching ($199/mo), Premium Coaching ($349/mo).",
      "Write a sentence or two for each — you can copy the descriptions straight off trainshane.com/services.",
      "Add the price where there is one. Being upfront about price is a feature, not a risk.",
    ],
    watchOutFor:
      "If you change a price on the website, change it here too. Two different prices in two places is the kind of thing people notice and it costs you trust at exactly the wrong moment.",
  }),

  T("gbp-posts", {
    title: "Post to your Google profile every week or two",
    category: "gbp",
    priority: "3",
    timeNeeded: "5 minutes each time",
    whatItIs:
      "Google Business Profile has a Posts feature — short updates, like social media posts, that show on your listing.",
    whyItMatters:
      "An active profile signals to Google that the business is real and running, and posts give people something current to look at. It is low effort and most competitors do not bother.",
    steps: [
      "In your profile, go to Posts and click Add update.",
      "Post anything genuine: a training tip, a client win (with permission), an opening in your schedule, a note about a service.",
      "Add a photo and a button linking to https://trainshane.com",
      "Repeat every week or two. Consistency matters more than length.",
    ],
    watchOutFor: "Posts expire after about a week, so an old one stops showing. That is normal.",
  }),

  /* ---------------------------------------------------------------- */
  /* Google Ads — you are spending money right now                     */
  /* ---------------------------------------------------------------- */
  T("ads-conversion-tracking", {
    title: "Set up conversion tracking before spending any more on ads",
    category: "ads",
    priority: "1",
    timeNeeded: "20 minutes, and Philip does the website half",
    link: "https://ads.google.com",
    whatItIs:
      "A conversion is the thing you actually want — someone submitting the contact form or booking a consultation. Conversion tracking is a small piece of code on the website that tells Google Ads when that happened, and which ad click it came from.",
    whyItMatters:
      "Without it you are paying for clicks and have no idea which ones turned into anything. You cannot tell a keyword that brings clients from one that brings nobody, so you cannot cut the bad one. Just as importantly, Google's automatic bidding needs conversion data to work — with none, it optimises for cheap clicks rather than actual inquiries, which is not what you are paying for. At $3/day this is roughly $90 a month spent blind.",
    steps: [
      "In Google Ads, go to Goals → Conversions → New conversion action → Website.",
      "Enter trainshane.com and follow the prompts to create a conversion action. Name it \"Contact form submitted\".",
      "Google will give you a Conversion ID (looks like AW-123456789) and a Conversion Label.",
      "Send both of those to Philip. He adds the tag to the website and wires it to fire when the contact form actually sends — not merely when someone lands on the page.",
      "Do the same for a second conversion action named \"Consultation booked\" if you want to track Calendly bookings too.",
      "After a few days, check Goals → Conversions and confirm numbers are appearing.",
    ],
    watchOutFor:
      "Do not let Google's setup assistant talk you into counting page views as conversions. A page view is not a lead. Only count a real form submission or a real booking, or the data will look great and mean nothing.",
  }),

  T("ads-location-targeting", {
    title: "Check your Google Ads location targeting",
    category: "ads",
    priority: "1",
    timeNeeded: "10 minutes",
    link: "https://ads.google.com",
    whatItIs:
      "The setting that decides which parts of the world your ads are allowed to show in.",
    whyItMatters:
      "Google's default is broader than most people expect — it can include people who are merely \"interested in\" your area rather than actually in it, which means someone in another state searching about DC can trigger and click your ad. On a $3/day budget, one wasted click can be a third of the day gone.",
    steps: [
      "In Google Ads open your campaign → Settings → Locations.",
      "Set the specific areas you actually serve — DC, and the parts of Maryland and Virginia you will travel to.",
      "Then click Location options (it is collapsed by default, which is why almost nobody finds it).",
      "Choose \"Presence: People in or regularly in your included locations\".",
      "Do NOT leave it on \"Presence or interest\", which is the default and is what spends your money on people nowhere near you.",
    ],
    watchOutFor:
      "This setting is hidden behind a collapsed \"Location options\" link. If you did not explicitly change it, it is still on the default and is costing you money right now.",
  }),

  T("ads-negative-keywords", {
    title: "Check your search terms every week and block the junk",
    category: "ads",
    priority: "1",
    timeNeeded: "15 minutes a week",
    link: "https://ads.google.com",
    whatItIs:
      "The Search Terms report shows the exact phrases people typed before your ad appeared — which is not the same as the keywords you chose. A negative keyword is a word you tell Google to never show your ads for.",
    whyItMatters:
      "Google matches your keywords loosely, so \"personal trainer\" can show your ad to someone searching \"personal trainer courses\", \"personal trainer salary\", or \"free personal trainer app\". Those people will never hire you, and each click still costs you. On $3/day you may only get one or two clicks a day, so a single junk click can waste half a day's budget.",
    steps: [
      "In Google Ads go to Campaigns → Insights and reports → Search terms.",
      "Set the date range to the last 7 days.",
      "Read down the list of actual phrases people searched.",
      "Anything clearly not a potential client — \"jobs\", \"salary\", \"certification\", \"course\", \"free\", \"near me app\", another city — tick it and click \"Add as negative keyword\".",
      "Do this once a week. It takes fifteen minutes and it compounds.",
    ],
    watchOutFor:
      "Do not block terms just because they did not convert yet — with this budget you will not have enough data for weeks. Only block ones that are obviously the wrong intent.",
  }),

  T("ads-expectations", {
    title: "Know what $3 a day actually buys",
    category: "ads",
    priority: "2",
    timeNeeded: "Read once",
    whatItIs:
      "A reality check on the budget, so you can judge whether the ads are working rather than guessing.",
    whyItMatters:
      "Clicks for personal training keywords typically cost somewhere between a few dollars and ten-plus dollars each, depending on the exact search and how many competitors are bidding. At $3/day that is roughly one click a day, sometimes fewer, and about $90 a month. If perhaps one in twenty people who click get in touch, one inquiry every two to three weeks is a normal, non-alarming result at this spend. Expecting more will make you switch things off before they have had a chance to show anything.",
    steps: [
      "Give it at least a month before judging it.",
      "Judge it on inquiries and consultations booked, not on clicks or \"impressions\".",
      "Once conversion tracking is on, the honest question is: what did one inquiry cost? If a client is worth $199 or $349 a month, an inquiry costing $30 is good business.",
      "If you want it to move faster, raising the budget will do more than fiddling with settings — but only after conversion tracking is running, so you can see what you are buying.",
    ],
    watchOutFor:
      "Do not keep switching the campaign on and off or rewriting the ads every few days. Google's system needs a stable run to learn anything, and constant changes reset that.",
  }),

  /* ---------------------------------------------------------------- */
  /* Reviews                                                           */
  /* ---------------------------------------------------------------- */
  T("reviews-first-five", {
    title: "Get your first 5 Google reviews — from people you have actually trained",
    category: "reviews",
    priority: "1",
    timeNeeded: "20 minutes to ask, then it is up to them",
    whatItIs:
      "Star ratings and written reviews on your Google Business Profile. They appear right next to your name in local search results.",
    whyItMatters:
      "Reviews are the single biggest factor in whether someone picks you over the trainer listed above or below you, and Google uses them in deciding who to show at all. A profile with zero reviews looks brand new and untested — which, fairly or not, is what people assume. Five genuine reviews clears that bar.",
    steps: [
      "Make a list of everyone you have genuinely trained — friends and family absolutely count, as long as you really did train them.",
      "Get your review link: in your Google Business Profile, click \"Ask for reviews\" and copy the short link it gives you.",
      "Message them individually, not as a group text. Something like: \"Hey — I've just launched Train Shane properly and I'm trying to get the Google page off the ground. If you found our sessions useful, would you mind leaving a quick review? Takes two minutes: [link]. No worries at all if not.\"",
      "Ask them to mention something specific — what they were working toward, what changed. \"Great trainer!\" helps far less than two real sentences.",
      "Follow up once, a week later, if they forget. Once. Not twice.",
      "Space the asks out over a couple of weeks rather than all landing the same day.",
    ],
    watchOutFor:
      "This is the important bit: the reviews must come from people who have genuinely trained with you. Reviews from people who have not is against Google's policies — the reviews get removed, and the profile itself can be suspended, which would cost you the listing entirely. Do not offer discounts or free sessions in exchange for a review either; that is also against the rules. Friends and family are completely fine as long as they were really clients. If you have not trained anyone yet, do a few free or discounted sessions first and then ask — that is the legitimate version of the same shortcut.",
  }),

  T("reviews-habit", {
    title: "Build the habit: ask every client at week 4",
    category: "reviews",
    priority: "2",
    timeNeeded: "2 minutes per client",
    whatItIs:
      "A standing routine: around the fourth week with a new client, you ask for a Google review and a couple of sentences you can use on the website.",
    whyItMatters:
      "Week four is when someone has started to notice real change but has not yet got used to it — the most enthusiastic they will be. Ask at week one and there is nothing to say; ask at month six and it feels like a chore. Set as a habit, this fills your review count and your website's Success Stories page steadily instead of never.",
    steps: [
      "Put a recurring reminder in your phone for the fourth session with any new client.",
      "Ask for two things at once: a Google review, and permission to use two or three sentences plus their first name on the website.",
      "Ask for the written version in writing (text or email) so you have a record of them agreeing.",
      "Send anything you collect to Philip, or add it yourself in this Studio under Testimonials.",
      "Note: the Success Stories page on the website is hidden right now and turns itself back on automatically the moment the first testimonial is published. You do not need to ask anyone to switch it on.",
    ],
    watchOutFor:
      "Always get explicit permission before putting someone's words or name on the website, even if they already left a public review. A public review is not the same as agreeing to be marketing.",
  }),

  T("reviews-reply", {
    title: "Reply to every review, good or bad",
    category: "reviews",
    priority: "3",
    timeNeeded: "5 minutes each",
    whatItIs: "Google lets the business owner respond publicly under each review.",
    whyItMatters:
      "Replying shows you are paying attention, and Google treats an actively managed profile favourably. More to the point: the reply to a bad review is not for the person who wrote it, it is for the next twenty people who read it. A calm, non-defensive response to a complaint often does more good than the complaint did harm.",
    steps: [
      "Check for new reviews when you post your weekly update.",
      "For a good review: thank them, and mention something specific to show it is not a template.",
      "For a bad one: do not argue and do not get defensive. Acknowledge it, say what you would do differently, offer to talk it through offline.",
      "Never mention a client's health details, injuries, or anything personal in a public reply.",
    ],
    watchOutFor:
      "Wait a day before replying to anything that made you angry. A defensive public reply does far more damage than the original review.",
  }),

  /* ---------------------------------------------------------------- */
  /* Instagram                                                         */
  /* ---------------------------------------------------------------- */
  T("social-instagram", {
    title: "Finish the Instagram profile, then tell Philip to switch the link back on",
    category: "social",
    priority: "2",
    timeNeeded: "An hour to set up, then ongoing",
    whatItIs:
      "The Instagram link has been hidden from the website's footer and contact page for now. The address is still saved in Site Settings — nothing was deleted, it is just switched off.",
    whyItMatters:
      "An empty or half-finished profile is worse than no link at all: someone interested enough to click through lands on three posts and no bio, and that is the last impression they take away. Better to show nothing until there is something worth showing.",
    steps: [
      "Set up the profile properly: profile photo, a bio saying what you do and where, and a link to https://trainshane.com",
      "Switch it to a Professional / Business account (free, in Instagram settings) so you get audience stats.",
      "Post at least 9 things, so the grid does not look empty when someone lands on it.",
      "When you are happy with it, you can switch the link back on yourself: in this Studio go to Site Settings → Social links → Instagram, and tick \"Show on the website\". It appears on the live site within about a minute.",
      "If the Instagram handle changed, update the URL there at the same time.",
      "Then update the link in your Instagram bio to https://trainshane.com — that is your main traffic source, so it matters that it points at the new address rather than the old one.",
    ],
    watchOutFor:
      "The website reads the address from Site Settings, so if you make a new account under a different handle, change the URL there or the button will point at the old profile.",
  }),

  /* ---------------------------------------------------------------- */
  /* Website                                                           */
  /* ---------------------------------------------------------------- */
  T("website-search-console", {
    title: "Add the site to Google Search Console",
    category: "website",
    priority: "2",
    timeNeeded: "15 minutes, with Philip",
    link: "https://search.google.com/search-console",
    whatItIs:
      "A free Google tool that shows which searches are bringing people to your website, and tells you if Google is having trouble reading any of it. Completely separate from Google Ads — this is about the free, unpaid results.",
    whyItMatters:
      "It is the only way to see what people actually search before landing on your site, which tells you what to write about and which words to use on your pages. It also warns you if something breaks and Google stops being able to index the site.",
    steps: [
      "Go to search.google.com/search-console and sign in with the same Google account as your Business Profile.",
      "Add https://trainshane.com as a property.",
      "Verify ownership — Philip can do this quickly via a DNS record or an HTML tag.",
      "Once verified, submit the sitemap: https://trainshane.com/sitemap.xml",
      "Check back in a few weeks. There will be very little data at first; that is normal for a brand new site.",
    ],
    watchOutFor:
      "A new site takes weeks to months to appear meaningfully in unpaid search results. Nothing is broken if it looks empty at first.",
  }),

  /* ---------------------------------------------------------------- */
  /* Business admin                                                    */
  /* ---------------------------------------------------------------- */
  T("admin-terms-specifics", {
    title: "Confirm the six specifics in your Terms page",
    category: "admin",
    priority: "1",
    timeNeeded: "20 minutes",
    link: "https://trainshane.com/terms",
    whatItIs:
      "The Terms page on the website states six policies. They were written as sensible defaults so the page could go live — they are not yet your actual stated policy, because nobody asked you.",
    whyItMatters:
      "Clients are now agreeing to these at checkout: Stripe shows a tick box linking to that page on every payment. So whatever it says is what you are committing to. If a policy on there is not what you actually intend to do, it needs changing before someone holds you to it.",
    steps: [
      "Read https://trainshane.com/terms.",
      "Decide each of these and send them to Philip: (1) how much notice you need to cancel or reschedule — currently 24 hours; (2) whether a late cancellation is charged; (3) whether you refund part of a month if someone quits mid-cycle — currently no; (4) how much notice you give before changing prices — currently 30 days; (5) what happens if a client turns up late — currently the session ends at the scheduled time rather than running over; (6) whether you are trading as yourself or as a registered LLC.",
      "There is also a deliberate gap: the page does not say which state's law governs it, because that depends on where you are actually based. Tell Philip whether it is DC, Maryland or Virginia.",
    ],
    watchOutFor:
      "The terms page is not legal advice and it is not a liability waiver — those are different documents doing different jobs. See the waiver task.",
  }),

  T("admin-waiver-parq", {
    title: "Get a signed waiver and health questionnaire before anyone trains with you",
    category: "admin",
    priority: "1",
    timeNeeded: "An hour to set up once",
    whatItIs:
      "Two documents each client signs before the first session. A liability waiver, where they acknowledge that exercise carries risk. And a PAR-Q (Physical Activity Readiness Questionnaire) — a short standard health screening that flags heart conditions, injuries, medications, pregnancy and so on.",
    whyItMatters:
      "This is the real protection for in-person training, and the website does not provide it. A terms page someone tick-boxes at checkout is not a waiver. The PAR-Q is not just paperwork either — it is how you find out about the heart condition or the old back injury before you load someone up, and it changes how you program for them.",
    steps: [
      "Get a waiver template appropriate to your state. NASM provides templates to certified trainers, and it is worth having a lawyer read it once given you train people in person.",
      "Use a standard PAR-Q+ form — the official version is free online and widely used.",
      "Decide how clients sign: a signing service, a PDF they return, or paper at the first session. Whichever it is, keep the signed copies somewhere safe and backed up.",
      "Make it a hard rule: no first session, in person or online, before both are signed and read.",
      "If a PAR-Q flags something medical, get their doctor's clearance before training them.",
    ],
    watchOutFor:
      "It is tempting to skip this for friends and family. Those are exactly the sessions where it matters most — because if something does go wrong, having trained someone with no screening and no waiver is the worst position to be in, and it will not be a friendly conversation any more.",
  }),

  T("admin-insurance", {
    title: "Check you have personal trainer liability insurance",
    category: "admin",
    priority: "1",
    timeNeeded: "30 minutes",
    whatItIs:
      "Professional liability insurance for fitness trainers, covering injury claims arising from your training.",
    whyItMatters:
      "You are now publicly advertising in-person training and taking payment for it, which raises your exposure considerably compared to training a few friends. Many gyms and apartment-building fitness rooms will also refuse to let you train clients on their premises without proof of cover.",
    steps: [
      "If you already have a policy, check it covers in-person training, online coaching, and the states you work in — DC, Maryland and Virginia may need to be listed separately.",
      "If you do not, get quotes. NASM certification usually comes with discounted options through partner insurers.",
      "Keep the certificate of insurance somewhere you can send it quickly — you will be asked for it.",
    ],
    watchOutFor:
      "Check whether the policy covers online coaching as well as in-person. Some cover only one, and you are selling both.",
  }),
];

const mutations = tasks.map((doc) => ({ createIfNotExists: doc }));

const res = await fetch(
  `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  },
);

const body = await res.json();
if (!res.ok) {
  console.error("Seed failed:", JSON.stringify(body, null, 2));
  process.exit(1);
}
console.log(`Seeded ${tasks.length} tasks. Transaction ${body.transactionId}.`);
console.log("createIfNotExists — existing tasks were left untouched.");

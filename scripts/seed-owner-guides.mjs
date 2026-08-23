/**
 * Seeds the "Guides & Answers" section (`ownerGuide`) — plain-English answers to
 * the questions Shane is actually asking.
 *
 *   node scripts/seed-owner-guides.mjs
 *
 * Same contract as seed-owner-tasks.mjs: `createIfNotExists` with stable ids, so
 * re-running adds what is missing and never overwrites the notes field Shane owns.
 *
 * A note on tone, because it is the point of the whole section: he said he felt
 * overwhelmed and has no clients yet. So these lead with the short answer, name
 * what he can safely ignore, and give a trigger for when to revisit — rather than
 * listing everything a business could theoretically do.
 *
 * Nothing here is legal, tax or insurance advice, and every guide that touches
 * those says so in its own text rather than relying on a banner somewhere else.
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
const link = (label, url) => ({ _type: "guideLink", _key: url.slice(-12), label, url });

const guides = [
  /* ================================================================ */
  G("start-here", {
    title: "I have no clients and no idea what to do first. Where do I start?",
    category: "start-here",
    order: 1,
    shortAnswer:
      "Get one person training with you. That is the whole job right now. Almost everything else you are worrying about — the LLC, the perfect Instagram, the pricing tiers — is work that only starts to matter once people are actually paying you, and doing it first is a very comfortable way to avoid the uncomfortable part.",
    theDetail: `The feeling of being overwhelmed usually is not caused by having too much to do. It is caused by having a long list where nothing is obviously first, so everything feels equally urgent and none of it feels safe to skip.

So here is the order, and it is shorter than you think.

**Right now:** get 3 to 5 people training with you, even free. Not because free is a business model, but because everything downstream is blocked without it. No clients means no testimonials, which means an empty Success Stories page. No reviews, so the Google profile looks brand new. No idea whether your onboarding works, whether your check-ins land, or how long writing a program actually takes you. Those first few people unblock all of it at once.

**Once people are paying you:** insurance, and a signed waiver plus health questionnaire before anyone trains. This one is not optional and it is genuinely important — see the insurance guide.

**Once you are making money consistently:** the LLC, an accountant, a separate bank account.

Notice that the two things you asked about — LLC and insurance — sit at steps two and three. Insurance matters sooner than you would think. The LLC matters later than you would think.

One reframe that helps: you are not starting a business, you are trying to get one person a result. Everything else is bookkeeping around that.`,
    doNow: [
      "Write down every person you know who has ever mentioned wanting to get fitter, lose weight, get stronger, or 'get back into it'. Aim for 20 names. Do not filter — just write the list.",
      "Pick the 5 most likely and message them individually this week. See the guide on asking your network without feeling salesy.",
      "Offer the first few a free or heavily discounted month in exchange for honest feedback and, if they are happy at the end, a testimonial and a Google review.",
      "Set a target: 3 people training by the end of the month.",
    ],
    ignoreForNow:
      "The LLC. A business bank account. A logo refresh. Perfecting your Instagram grid. Sorting out your pricing tiers. Reading about tax deductions. Any course on 'scaling your coaching business'. Every one of these will still be there in two months, and every one is more comfortable than sending the first message — which is exactly why they are so tempting right now.",
    revisitWhen: "You have 3 people training with you.",
  }),

  /* ================================================================ */
  G("llc", {
    title: "Do I need an LLC?",
    category: "business-setup",
    order: 10,
    shortAnswer:
      "Not yet, and probably not before you have paying clients. You are already legally in business — a sole proprietorship is the automatic default the moment someone pays you, with no paperwork. The important thing is that an LLC is not what protects you if a client gets injured. Insurance is. Getting that backwards is the single most common and most expensive mistake here.",
    theDetail: `**You do not need to do anything to be a business.** Take money for training and you are a sole proprietor by default. You can invoice, be paid, and pay tax on it with no registration at all.

**What an LLC actually does.** It separates your business's debts and liabilities from your personal assets — your savings, your car, your house. If the business is sued or owes money, the claim is generally against the business rather than you personally.

**What an LLC does not do, and this is the part people get wrong.** It does not protect you from claims about your own professional conduct. If a client is injured because of how you programmed or supervised their training, that is a claim about something *you personally did*, and courts routinely allow those to reach the individual regardless of the LLC. The thing that actually responds to that claim is **liability insurance**.

So the common belief — "I will set up an LLC so I am protected" — gets it backwards. An LLC with no insurance is worse than insurance with no LLC, because the first one feels like protection while covering the risk you are most likely to face.

**Roughly what it costs**, and these change, so check current figures: Virginia around $100 to file; Maryland around $100 plus an annual report with a fee; DC around $99 plus a biennial report. Then there is the ongoing part people forget — annual filings, possibly a registered agent, and a more complicated tax return. Call it a few hundred dollars a year in money and a weekend in attention.

**When it does start making sense:** consistent income you would be upset to lose, in-person clients (higher injury risk), employing anyone, signing a lease or a gym contract, or an accountant telling you the tax treatment now favours it.

**Not legal or tax advice.** I am not a lawyer or an accountant, and the right answer genuinely depends on your state, your income and your situation. When you are ready, one paid hour with an accountant who works with self-employed people will answer this properly and will likely pay for itself in tax advice alone.`,
    doNow: [
      "Nothing, for now. Being a sole proprietor is fine and is what you already are.",
      "Instead, put the money and attention into insurance — see the insurance guide.",
      "Keep every business receipt from today onward: equipment, certifications, mileage to sessions, software, this website. That matters for tax whether or not you have an LLC.",
      "Open a separate free checking account and run all business money through it. Not legally required as a sole proprietor, but it makes tax time enormously easier and costs nothing.",
    ],
    ignoreForNow:
      "LLC formation services advertising at you. Anything about S-corp elections — that is a genuine tax strategy but it only starts to pay off at a level of profit you are not at yet, and it adds payroll filings. Also ignore anyone insisting you need an LLC 'before you take a single dollar'; that is usually someone selling LLC formation.",
    revisitWhen:
      "You are earning consistently enough that losing it would hurt, or you start training people in person regularly — whichever comes first.",
    links: [
      link("Virginia — register a business", "https://www.scc.virginia.gov/clk/"),
      link("Maryland — Business Express", "https://businessexpress.maryland.gov/"),
      link("DC — business licensing", "https://dlcp.dc.gov/"),
    ],
  }),

  /* ================================================================ */
  G("insurance", {
    title: "Do I need personal trainer insurance? (Even for online coaching?)",
    category: "insurance",
    order: 20,
    shortAnswer:
      "Yes — and yes, online coaching too. This is the one thing on your list I would not put off. It is roughly $150–$400 a year, it covers the risk that could actually end you financially, and it does the job people wrongly expect an LLC to do. Get it before your first paying client, in person or online.",
    theDetail: `**Why online coaching does not get you out of this.** People assume the risk is only in the room — you spot badly, someone drops a bar. But if you write a program and someone injures themselves following it, that is a claim about your professional advice. It has a name: professional liability, sometimes called errors and omissions. It applies to remote coaching just as much as in-person, and plenty of trainers do not realise their policy needs to cover both.

**The two kinds you want**, usually sold together:
- **General liability** — someone trips over your kit, you damage a gym's property.
- **Professional liability** — someone claims your programming or advice caused them harm. This is the important one for you, and the one online coaching still needs.

**What it costs.** Typically $150–$400 a year for an independent trainer. Compare that with the cost of defending a single claim, and note that you pay legal costs even when the claim is nonsense and you win.

**Where to get it.** NASM certification usually comes with discounted options through partner insurers, so start there since you have already paid for the certification. Get two or three quotes rather than taking the first.

**Check these specifically when you buy:**
- Does it cover **online / remote coaching**, not only in-person?
- Does it cover every state you work in — DC, Maryland and Virginia may need listing separately?
- Is it **occurrence** or **claims-made**? Occurrence covers anything that happened while the policy was live, even if the claim arrives years later. Claims-made only covers claims made while the policy is active, which becomes a problem if you ever stop paying. Occurrence is generally the safer shape.

**Insurance is not the whole job.** It works alongside a signed waiver and a health questionnaire (PAR-Q) before anyone's first session — there is a task for that in your To-Do list. The waiver sets expectations and evidences that the client understood the risk; the PAR-Q tells you about the heart condition or old back injury *before* you load someone up. Insurance is what responds when something goes wrong anyway.

**Not insurance advice** — read what you are buying, and ask the insurer directly whether online coaching is covered rather than assuming.`,
    doNow: [
      "Check whether your NASM membership includes discounted insurance, and get that quote first.",
      "Get two other quotes so you can compare. Insure4Sport, NEXT, Hiscox and Beazley all write this kind of cover.",
      "When quoting, say explicitly that you do both in-person and online coaching, across DC, Maryland and Virginia.",
      "Ask directly: does this cover professional liability for remote programming? Get the answer in writing.",
      "Buy it before your first paying client.",
      "Save the certificate of insurance somewhere you can send it in a minute — gyms and buildings will ask.",
    ],
    ignoreForNow:
      "Nothing here, honestly — this is the one item I would not defer. If money is genuinely tight this month, get the cheapest compliant policy now and shop properly at renewal. Being uninsured for a few months while you 'research options' is the version of this that goes badly.",
    revisitWhen: "Every year at renewal, and immediately if you start training in a new state.",
  }),

  /* ================================================================ */
  G("first-clients", {
    title: "How do I actually get my first online coaching clients?",
    category: "getting-clients",
    order: 30,
    shortAnswer:
      "Your first clients will come from people who already know you, not from ads or Instagram. That is not a consolation prize — it is how almost every coaching business actually starts. Ads and content work later, once you have proof; right now they are strangers being asked to trust someone with no reviews and no testimonials.",
    theDetail: `Think about what a stranger sees today: a good-looking website, real credentials, and zero social proof. Nobody has said you helped them. That is a hard sell at $199 a month no matter how good the site is — and it is why the Google Ads budget will feel slow at first. It is not that the ads are broken. There is just nothing yet to reassure the person who clicks.

Your network does not need that reassurance. They already know whether you are serious, reliable and good at this. That is why they convert at a rate strangers never will.

**The realistic order:**

1. **People who already know you** — friends, family, gym acquaintances, old teammates, coworkers. This is where your first 3 to 5 come from.
2. **Their referrals** — once those people get results, they tell people. This is the single biggest source for most trainers, and it costs nothing.
3. **Instagram and content** — builds over months, not weeks. Worth starting now precisely because it is slow.
4. **Google Ads and search** — works best once you have reviews and testimonials to convert the traffic you are paying for.

Most people try that list backwards, get discouraged by silence from strangers, and quit before reaching the part that actually works.

**Online coaching has one specific advantage: geography does not matter.** Your in-person work is limited to people who can meet you in the DMV. Online is anyone, anywhere. So your network is not just local — it is everyone you have ever known who now lives somewhere else. That old teammate who moved to Denver is a perfectly good online client.

**One thing worth being honest with yourself about:** the reason this feels hard is not that you do not know what to do. It is that messaging people you know feels like asking for a favour. It is not. You are offering to help someone with something they have already told you they want to fix.`,
    doNow: [
      "Write the list of 20 people. Anyone who has ever mentioned wanting to get fitter, stronger, or back into training.",
      "Include people who moved away — online coaching does not care where they live.",
      "Message 5 individually this week. Not a group post, not a story — individually, mentioning the specific thing they said they wanted.",
      "Offer the founding-client deal (see that guide) rather than your full price.",
      "Ask every person who says no whether they know someone who might be interested. A no is still worth a referral.",
      "Track it somewhere simple — a note with who you messaged and when. Following up once, a week later, is where most of the yeses actually come from.",
    ],
    ignoreForNow:
      "Raising the ad budget. Buying a course on getting clients. Redesigning anything on the website. Waiting until your Instagram looks professional before telling anyone what you do — the people on your list do not care what your grid looks like.",
    revisitWhen: "You have messaged all 20 and want the next set of tactics.",
  }),

  /* ================================================================ */
  G("founding-clients", {
    title: "The founding-client offer — how to fill your roster fast",
    category: "getting-clients",
    order: 31,
    shortAnswer:
      "Offer your first 3 to 5 people a free or heavily discounted month in exchange for honest feedback and — if they are happy — a testimonial and a Google review. Frame it as founding clients, with an end date. It is the fastest way to unblock everything else, and both sides genuinely get something.",
    theDetail: `Discounting feels like admitting you are not worth full price. Framed as a *founding client* offer, it is not a discount at all — it is a trade. You get the thing you cannot buy at any price right now: real clients, real results, real testimonials, and honest feedback about your process before you charge strangers for it.

**Why it works better than free.** "Free" attracts people who will not turn up, because nothing is at stake. Even $25 a month changes that — it filters for people who actually intend to do the work, and those are the ones who produce a result worth putting on the website.

**The frame, and it matters:**

> "I'm taking on 5 founding clients at a reduced rate while I build the business. In exchange I'd want honest feedback as we go, and — only if you're genuinely happy at the end — a testimonial and a Google review. After these 5 spots the rate goes to normal."

Three things that does: it gives a reason for the low price that is not "I am desperate", it makes it finite so there is a reason to answer now, and it states the exchange plainly so asking for the testimonial later is not awkward.

**Be specific about what they get.** Not "coaching" — the actual thing: a programme built for them, adjusted every week, check-ins, and you on the other end of a message when something is not working.

**Set an end date up front**, e.g. 8 weeks. It gives a natural moment to ask for the testimonial and a natural moment to convert them to full price, instead of a cheap rate that quietly becomes permanent.

**One caution on reviews.** Only ask for a Google review from people you genuinely trained. Reviews from people who were never clients breach Google's policies, get removed, and can take the whole Business Profile down. Founding clients are real clients, so they are completely fine.`,
    doNow: [
      "Decide the number — 5 is a good target — and the price. Free to $50/month both work; something small beats nothing.",
      "Decide the length. 8 weeks gives a real result and a natural point to ask for the testimonial.",
      "Write your version of the message above in your own words. It should sound like you, not like marketing.",
      "Send it to the 5 most likely people on your list.",
      "At week 4, ask for the Google review. At the end, ask for the testimonial. Both are in your To-Do list already.",
      "When the spots are gone, say so publicly — 'founding spots filled' is itself a signal to everyone watching.",
    ],
    ignoreForNow:
      "Worrying that a low rate now means you can never charge full price. Founding rates ending is expected and normal, and your full price is already published on the website.",
    revisitWhen: "Your founding spots are full, or the 8 weeks are up.",
  }),

  /* ================================================================ */
  G("asking-network", {
    title: "How do I ask people I know without feeling like a salesman?",
    category: "getting-clients",
    order: 32,
    shortAnswer:
      "Do not pitch. Ask a question about them. The message that works is short, specific to that person, and easy to say no to — and 'easy to say no to' is exactly what stops it feeling like selling.",
    theDetail: `What makes this feel gross is broadcasting — the group text, the story asking "who wants to get in shape?!". Everyone can tell it went to fifty people, so nobody feels addressed and nobody replies.

An individual message about something that person actually said is a completely different thing. It is not a pitch; it is remembering.

**The shape that works:**

> "Hey — random one. You mentioned a while back you wanted to get back into lifting. I've just started taking on online coaching clients and I'm doing 5 founding spots at a reduced rate while I get going. Thought of you. Want me to send the details? Totally fine if it's not the right time."

Why each part is there:
- **"You mentioned…"** — proves it is not a mass message.
- **"I've just started"** — honest, and being new is not something to hide.
- **"5 founding spots"** — finite, so there is a reason to reply now.
- **"Want me to send the details?"** — asks for permission, not for money. A much smaller ask to say yes to.
- **"Totally fine if it's not the right time"** — the escape hatch. Counterintuitively this raises replies, because it removes the pressure that makes people ignore a message rather than decline it.

**Do not send a price first.** Get a yes to "send me details", then talk about what they want, then price. A number with no context is easy to reject.

**Follow up once.** A week later: "No worries if you've decided against — just didn't want it to get buried." One follow-up is where a surprising share of yeses come from. Two is where you become annoying.

**And ask everyone who says no for a referral:** "No worries at all — anyone come to mind who might be after this?" A no that produces a name is not a no.`,
    doNow: [
      "Write your own version. It must sound like you texting a friend, because that is what it is.",
      "Send 5 this week. Individually. Never as a group.",
      "Note who you sent to and when, so the follow-up actually happens.",
      "Follow up once after a week. Once.",
      "Ask every no for a referral.",
    ],
    ignoreForNow:
      "Perfecting the wording. A message that is 80% right and sent beats a perfect one still in drafts. Also ignore the urge to explain your whole methodology up front — they are deciding whether they trust you, not evaluating your programming.",
    revisitWhen: "You have sent all 20 and want to talk about what to try next.",
  }),

  /* ================================================================ */
  G("instagram-no-clients", {
    title: "What do I post on Instagram when I have no clients or transformations yet?",
    category: "getting-clients",
    order: 33,
    shortAnswer:
      "Post the thinking, not the results. You have graduate-level education in this and most trainers do not — that is your differentiator right now, and it needs no client photos at all. Explaining things clearly is proof of competence.",
    theDetail: `Everyone assumes a fitness account needs before-and-afters. Those help, but they are not the only proof, and waiting for them means posting nothing for months.

You have an M.S. in Health Promotion Management. Most trainers in your feed do not. Content that shows you actually understand the evidence, rather than repeating gym folklore, is credible on its own.

**Things you can post today, with no clients:**

- **Myth corrections.** "You don't need to do fasted cardio to burn fat — here's what actually happens." Useful, shareable, and shows you know the literature.
- **Your own training.** You train. Film sets, talk through why you programme it that way.
- **Answers to questions you have actually been asked.** "How much protein do I actually need?" Real questions beat invented ones.
- **The reasoning behind a choice.** Why you would give a beginner a full-body split rather than a bro split. This is exactly the thinking a prospective client is trying to assess.
- **Your own story.** Why you got into this. People hire a person.
- **Realistic expectations.** "What 12 weeks of consistent training actually looks like" — honest, and quietly sets up your coaching.

**Consistency beats production.** Three posts a week from a phone beats one heavily edited post a month. The algorithm rewards regularity, and so do people.

**Put the website link in your bio** — trainshane.com. That is the point of all of it.

**A note on timing.** The Instagram link is currently hidden on the website, because a half-built profile is worse than no link. Once the profile has a proper bio and around 9 posts so the grid is not empty, you can switch it back on yourself: Site Settings → Social links → Instagram → tick "Show on the website".`,
    doNow: [
      "Set the profile up properly: photo, a bio saying what you do and where, and trainshane.com as the link.",
      "Switch it to a Professional account — free, in settings, and gives you audience stats.",
      "Write down 9 post ideas from the list above. Nine, so the grid looks intentional rather than empty.",
      "Post three times a week. Set a recurring reminder if that helps.",
      "Once the profile is presentable, switch the website link back on in Site Settings.",
    ],
    ignoreForNow:
      "Follower count. Buying anything to boost reach. Waiting for good enough gym lighting. Comparing your account to trainers who have been posting for five years.",
    revisitWhen: "You have posted consistently for a month and want to look at what worked.",
  }),

  /* ================================================================ */
  G("pricing-start", {
    title: "Is my pricing right for someone just starting out?",
    category: "money",
    order: 40,
    shortAnswer:
      "Your published prices are reasonable and I would not lower them. Discount privately for founding clients instead — dropping your public price is very hard to undo, and it signals something about you that a temporary founding rate does not.",
    theDetail: `Published: In-Person $100 per session, Essential $199/month, Premium $349/month. For a NASM-certified trainer with a master's degree in the DC area, those are defensible. DC is an expensive market and undercharging there reads as inexperience rather than value.

**Why not lower the public price.** It is the number strangers use to judge quality when they have nothing else to go on. A cheap trainer is assumed to be a new or bad one — fair or not. And raising a public price later means every existing client sees the increase, which is an awkward conversation you can simply avoid.

**Discount privately instead.** The founding-client offer does exactly this: the public price stays, and the reduced rate is explicitly temporary, with a reason attached and an end date. Nothing to undo later.

**The real question is not price, it is proof.** Nobody is deciding not to hire you because $199 is too much. They are deciding because they do not yet know whether it works. Testimonials and reviews move that; a lower price does not.

**Worth knowing about the two subscription tiers.** Right now the difference between Essential and Premium may not be obvious to someone reading the page cold. Once you have coached a few people you will know what genuinely justifies the higher tier — more contact, more frequent programme changes, faster replies. Tell me then and we will sharpen the wording on the services page.

**Not financial advice**, and pricing is genuinely a judgement call. But the common failure for new trainers is charging too little and resenting the work, not charging too much.`,
    doNow: [
      "Leave the published prices alone.",
      "Use the founding-client offer for anyone you want to bring in cheaply.",
      "Once you have coached 3 people, revisit whether the Essential/Premium difference is clear enough on the website.",
    ],
    ignoreForNow:
      "Adding more tiers or packages. Comparing yourself with the cheapest trainer in the area — you are not competing with them and their clients are not yours.",
    revisitWhen: "You have 5 paying clients, or you are consistently full.",
  }),

  /* ================================================================ */
  G("tax-basics", {
    title: "Do I need to worry about taxes yet?",
    category: "money",
    order: 41,
    shortAnswer:
      "Not urgently, but start keeping records today — that costs you nothing now and saves real money and stress later. As a sole proprietor you report business income on your personal return, and once you are making a meaningful profit you may need to pay estimated tax quarterly rather than once a year.",
    theDetail: `**What changes when someone pays you.** That money is business income. You report it on your personal tax return (Schedule C, in US terms), and you can deduct legitimate business expenses against it — which is exactly why the record-keeping matters from day one rather than from whenever you get organised.

**Things that are typically deductible** for a trainer: equipment, your certification and continuing education, this website and its hosting, software, professional insurance, mileage driving to sessions, and a portion of your phone. Keep receipts. A photo in a dedicated album is a perfectly good system when you are starting.

**Estimated quarterly tax.** Employees have tax withheld from every paycheque; self-employed people do not, so once you are profitable enough the IRS expects payments through the year instead of one bill in April. Miss it and there can be penalties. Your accountant will tell you when you cross that line — and Stripe's dashboard makes the income side easy to see.

**Self-employment tax catches people out.** On top of income tax, you pay both halves of Social Security and Medicare, roughly 15.3% of net earnings. Plan for it rather than discovering it in April.

**Stripe is doing some of this for you.** Every payment through your links is recorded, so your income side is already reliable. It is the expense side that depends on you keeping receipts.

**Not tax advice**, and I am not an accountant. One paid hour with one who works with self-employed people is genuinely worth it once money is coming in consistently — they will usually find more than they cost.`,
    doNow: [
      "Start a photo album on your phone called 'Receipts' and put every business receipt in it, from today.",
      "Open a separate free checking account and run all business money through it. Not required, but it makes everything downstream far easier.",
      "Note your mileage to in-person sessions — it adds up more than people expect.",
      "Do nothing else until money is actually coming in.",
    ],
    ignoreForNow:
      "Accounting software. S-corp elections. Reading about deductions in detail. All of it is premature until there is income to account for.",
    revisitWhen: "You have been paid by 3 clients, or you have earned around $5,000 — whichever comes first.",
  }),

  /* ================================================================ */
  G("online-vs-inperson", {
    title: "What's different about coaching online versus in person?",
    category: "getting-clients",
    order: 34,
    shortAnswer:
      "Online removes the geography limit and scales far better, but you lose the ability to see and correct movement in real time. That changes what you screen for, how you onboard, and what you need in writing — and it does not remove the need for insurance or a waiver.",
    theDetail: `**What gets better.** Anyone, anywhere, is a potential client — including everyone you know who moved away. No travel time, so more clients per week. Programming can be written when it suits you rather than at the client's session time. Lower overheads, and the margins are considerably better.

**What gets harder, and it is mostly about safety.** You cannot see the bar path. You cannot stop a rep going wrong. You are relying on what the client tells you and, at best, video they send. That has real implications:

- **Screen harder up front.** The PAR-Q matters more online, not less, precisely because you will not spot the problem in the room.
- **Ask for form video** on the main lifts early, and again whenever load goes up meaningfully. Make it a normal part of the process rather than an accusation.
- **Be conservative with exercise selection** for beginners you have never seen move. A movement that is fine with a coach standing there is a different proposition alone in a commercial gym.
- **Write more.** Anything you would say in the room has to exist in writing — cues, tempo, what to do when something hurts, when to stop.

**Adherence is the real problem.** In person, the appointment is what makes people turn up. Online, nothing stops them quietly skipping. The coaches who succeed online are relentless about check-ins — a scheduled weekly one, at the same time, that the client knows is coming.

**Insurance and waivers still apply.** This is worth repeating because it is a common assumption: professional liability covers advice, and advice is exactly what online coaching is. If someone injures themselves following your programme, the fact that you were not in the room is not a defence — see the insurance guide.`,
    doNow: [
      "Decide your check-in rhythm before your first online client — day, time, and format. Weekly, same day, is the standard for a reason.",
      "Have the PAR-Q and waiver ready to send before session one, exactly as you would in person.",
      "Ask for a form video of the main lifts in week one, and set the expectation that it is routine.",
      "Confirm with your insurer, in writing, that online coaching is covered.",
    ],
    ignoreForNow:
      "Coaching apps and platforms. A shared doc or spreadsheet and a phone works perfectly for your first few clients, and you will make far better software decisions once you know what you actually need.",
    revisitWhen: "You have 5 online clients and the admin is starting to feel heavy.",
  }),
];

const mutations = guides.map((doc) => ({ createIfNotExists: doc }));

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
console.log(`Seeded ${guides.length} guides. Transaction ${body.transactionId}.`);
console.log("createIfNotExists — existing guides were left untouched.");

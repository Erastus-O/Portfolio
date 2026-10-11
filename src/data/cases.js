/* Case-study content, one object per project, keyed by slug.
   Schema and conventions: see CLAUDE.md -> "Case-study data".
   Text wrapped in {curly braces} is a DRAFT / gap marker: it renders highlighted in audit mode. */
var CS_IMG={
  aptapResults: "img/aptap/deal-results-redesign.webp"
};

var CASES = {
  "firstchekout": {
    "product": "Firstchekout is FirstBank Nigeria's payment infrastructure. It holds the payment gateway and other payment services for online merchants across West Africa, who make up over 15% of FirstBank's customer base.",
    "constraints": "FirstBank is highly regulated, so every merchant has to be validated against its compliance standards before taking real payments.",
    "stats": [
      [
        "20",
        "Merchants onboarded"
      ],
      [
        "760+",
        "Transactions processed"
      ],
      [
        "₦85M+",
        "Transaction value (about £45k)"
      ]
    ],
    "statsNote": "First month after release",
    "business": [
      "During the 2020 pandemic, transaction activity on business accounts rose sharply, but the bank treated those transactions as routine rather than as a source of insight.",
      "Merchants used their FirstBank accounts for basic transactions and relied on other platforms to track how their business was doing. That put the bank at risk of losing account holders, and their transaction value, to competitors with better tools.",
      "FirstBank needed an integrated payment solution that would help merchants track performance, take payments in more ways and set up online storefronts, so they had a reason to grow with the bank."
    ],
    "user": [
      "Merchants had no single place to run the money side of their business. To get paid, sell online and see how they were performing, they stitched together their bank account and outside tools.",
      "Getting started was also hard. As a regulated bank, FirstBank needed documents to validate every business, and asking for all of them up front meant merchants faced paperwork before they had seen anything worth signing up for."
    ],
    "evidence": [
      [
        "3-day discovery session",
        "Held in Lagos to identify and analyse problems and gather requirements, with people from marketing, project management, product, sponsors and business analysis."
      ],
      [
        "Business team sessions",
        "Covered merchants' problems, the opportunities they created, competitors and the overall goal, measured against a target delivery date."
      ],
      [
        "Transaction activity",
        "Business-account transactions rose sharply during the 2020 pandemic, while merchants tracked performance on other platforms."
      ],
      [
        "Behaviour research",
        "Users kept returning to a small set of core actions."
      ],
      [
        "Market research",
        "{Add the competitors or market findings you looked at.}"
      ]
    ],
    "known": [
      "Business-account transactions rose sharply during 2020.",
      "Merchants used other platforms to track business performance.",
      "Online merchants make up over 15% of FirstBank's customer base.",
      "Every merchant must be validated against FirstBank's compliance standards."
    ],
    "assumed": [
      "Asking for all documents up front would lose merchants before they experienced the product.",
      "{Merchants would move their payments and performance tracking to FirstBank if the tools were built into their account.}"
    ],
    "unknown": [
      "{Which payment methods merchants' customers would use most.}",
      "What value can we give to merchants that helps them do more than just transactions?"
    ],
    "hyp": [
      [
        "Letting merchants explore in a restricted Test mode, and validating them later, will keep more of them through onboarding.",
        "Collecting documents up front risked losing merchants before they saw the product."
      ],
      [
        "Shortcuts to the most-used actions will make the product faster to work with day to day.",
        "Research showed users returned to a small set of core actions again and again."
      ],
      [
        "{Giving merchants payments, a store and performance tracking in one place will keep them, and their transaction value, with FirstBank.}",
        "Merchants were relying on outside platforms to track performance."
      ]
    ],
    "explore": [
      [
        "Collect every document at sign-up",
        "The straightforward route to compliance, but it risked losing merchants before they had seen any value.",
        "Rejected"
      ],
      [
        "Validate inside the product: Test mode, then Go-Live",
        "Merchants sign up into a restricted Test mode, explore the platform, then move to Go-Live once they provide the required documents.",
        "Chosen"
      ],
      [
        "Online store, plus APIs and webhooks",
        "A store for merchants without a website, and APIs and webhooks for those who want to keep their existing site.",
        "Chosen"
      ],
      [
        "Rapid prototyping and information architecture",
        "Directions were worked through as quick prototypes and an information architecture before committing.",
        "Method"
      ]
    ],
    "why": {
      "user": "Merchants see what the product can do before the paperwork, and the actions they use most are one click away.",
      "business": "Merchants and their transaction value stay inside FirstBank, and nobody takes live payments until they meet compliance.",
      "technical": "APIs and webhooks connect Firstchekout's payment channels to a merchant's existing website, so they don't have to rebuild it."
    },
    "design": [
      [
        "Onboarding",
        "Onboarding in Test mode, then a three-step compliance flow to Go-Live: account validation, merchant information and document upload.",
        {
          "src": "img/firstchekout/02-compliance.webp",
          "w": 1728,
          "h": 1117,
          "cap": "Compliance, step 1 of 3: account validation before going live.",
          "alt": "Firstchekout Compliance page showing Account Validation, step 1 of 3, with a progress bar. The form asks which bank the merchant uses for transactions, the bank, the account number and the account name, with Go back and Proceed buttons."
        }
      ],
      [
        "Get started",
        "A Get Started section with shortcuts to the product catalogue, developer tools, API keys, payment links, payment settings and virtual accounts.",
        {
          "src": "img/firstchekout/01-get-started.webp",
          "w": 1728,
          "h": 1117,
          "cap": "Get Started: shortcuts to the most-used actions, with a prompt to go live.",
          "alt": "Firstchekout Get Started page. A banner says You are not Live, activate your account, with a progress bar and a Go Live button. Cards give shortcuts to Product Catalogue, Developers Tool, USSD Code, API Keys, Payment Link, Generate Virtual Account, Payment Settings and Revpay Transactions, each with a short description and a link."
        }
      ],
      [
        "Dashboard",
        "A dashboard with a real-time view of the business: processed transactions by value and volume, payment method use, transaction status and settlements.",
        {
          "src": "img/firstchekout/dashboard.webp",
          "w": 1728,
          "h": 1448,
          "alt": "Firstchekout merchant dashboard. A sidebar lists Get Started, Dashboard, Compliance, Transactions, Payments (payment links, invoicing, virtual accounts), E-Commerce (products), Settings, Audit Logs and Complaints, with a Test mode switch at the top. The dashboard shows total sales and settlement balances, a processed transaction overview with a value and volume chart, payment methods by USSD, QR, card, transfer and Pay Attitude in a bar chart and table, a list of successful and failed transactions, and unsettled transactions with success, pending and failed labels.",
          "cap": "The dashboard: sales and settlements, transaction value and volume, payment method use, and transaction status."
        }
      ],
      [
        "Payment gateway",
        "Merchants can offer cards, BNPL, USSD, QR, Pay Attitude, the Firstmonie wallet and a one-time virtual account generator tied to a FirstBank account.",
        {
          "src": "img/firstchekout/05-payment-options.webp",
          "w": 1728,
          "h": 1117,
          "cap": "Checkout: customers choose from seven ways to pay.",
          "alt": "Firstchekout checkout showing an amount of 15,000 naira and a Select Payment method screen with options for Cards, Buy Now Pay Later, USSD, QR, Pay Attitude, First Bank Account and First Monie Wallet."
        }
      ],
      [
        "Online store",
        "An online store lets merchants sell and manage products, and doubles as a way to reach more customers.",
        {
          "src": "img/firstchekout/04-online-store.webp",
          "w": 1728,
          "h": 1117,
          "cap": "Online store: merchants sell and manage products, and reach more customers.",
          "alt": "A Firstchekout online store for a merchant called Seun Logistics. Products appear in a grid with price, items left, Add to Cart and View more. Sort controls filter by category, currency and price range, and a banner invites other merchants to set up a store with Firstchekout."
        }
      ],
      [
        "Configuration",
        "Merchants set their currency, the payment channels they collect through, how settlements are made and how they receive transaction details.",
        {
          "src": "img/firstchekout/03-configuration.webp",
          "w": 1728,
          "h": 1117,
          "cap": "Merchant configuration: currency, payment channels, receipts, fees and payouts.",
          "alt": "Firstchekout Settings on the Configuration tab. Payments lets the merchant set a default currency and choose payment channels such as card, QR, USSD, bank transfer, virtual accounts and Buy Now Pay Later. Transactions sets who receives receipts and who pays the transaction fee. Payouts and balances sets the payout schedule and how earnings are received."
        }
      ],
      [
        "Developers",
        "APIs and webhooks for merchants who would rather use their own website than the Firstchekout store.",
        {
          "src": "img/firstchekout/06-api-keys-webhooks.webp",
          "w": 1728,
          "h": 1117,
          "cap": "API keys and webhooks: connect Firstchekout's payment channels to an existing website.",
          "alt": "Firstchekout Settings on the API Keys and Webhook tab. API keys shows a public key, an encryption key and a secret key, each with a Copy link button, with the secret values masked. Webhooks has a URL field, a masked secret hash, a Learn about webhooks button and options for JSON responses, retries, failed transaction webhooks and V3 webhooks."
        }
      ]
    ],
    "sim": "Built a prototype of the dashboard to test how merchants would interact with it. {Add the prototype video or link.}",
    "valid": {
      "tested": "Rapid prototypes and A/B testing, including the dashboard prototype. {Add who took part and what the A/B test compared.}",
      "happened": "{Add what you saw.}",
      "changed": "{Add what changed because of it.}"
    },
    "build": [
      "Agreed key requirements and implementation criteria with product owners.",
      "Worked alongside developers throughout development.",
      "Presented ideas and prototypes to project stakeholders.",
      "The project team produced the output, and the business team turned it into outcomes and benefits."
    ],
    "outcome": {
      "measured": "In the first month after release: 20 merchants onboarded, over 760 transactions processed and over ₦85M (about £45k) in transaction value.",
      "intended": "Over time: merchant retention, the number of successful transactions, the number of unsuccessful transactions, transaction value and customer lifetime value."
    },
    "learn": {
      "next": "{Track how many merchants move from Test mode to Go-Live, and test the compliance flow with merchants to find where they still drop off. Then answer the open question of what value goes beyond transactions, for example sales insights from the dashboard, and measure it through merchant retention and customer lifetime value.}",
      "taught": "Studying user behaviour matters, but turning those opportunities into value matters more, and that takes ongoing observation. As a first-year designer, I also learned to communicate with stakeholders using RACI and stakeholder mapping."
    },
    "heroImg": {
      "src": "img/firstchekout/dashboard.webp",
      "w": 1728,
      "h": 1448,
      "alt": "Firstchekout merchant dashboard. A sidebar lists Get Started, Dashboard, Compliance, Transactions, Payments (payment links, invoicing, virtual accounts), E-Commerce (products), Settings, Audit Logs and Complaints, with a Test mode switch at the top. The dashboard shows total sales and settlement balances, a processed transaction overview with a value and volume chart, payment methods by USSD, QR, card, transfer and Pay Attitude in a bar chart and table, a list of successful and failed transactions, and unsettled transactions with success, pending and failed labels.",
      "cap": "The Firstchekout merchant dashboard: sales and settlements, transaction value and volume, payment method use, and transaction status at a glance."
    },
    "shotImgs": [
      {
        "src": "img/firstchekout/01-get-started.webp",
        "w": 1728,
        "h": 1117,
        "cap": "Get Started: shortcuts to the most-used actions, with a prompt to go live.",
        "alt": "Firstchekout Get Started page. A banner says You are not Live, activate your account, with a progress bar and a Go Live button. Cards give shortcuts to Product Catalogue, Developers Tool, USSD Code, API Keys, Payment Link, Generate Virtual Account, Payment Settings and Revpay Transactions, each with a short description and a link."
      },
      {
        "src": "img/firstchekout/02-compliance.webp",
        "w": 1728,
        "h": 1117,
        "cap": "Compliance, step 1 of 3: account validation before going live.",
        "alt": "Firstchekout Compliance page showing Account Validation, step 1 of 3, with a progress bar. The form asks which bank the merchant uses for transactions, the bank, the account number and the account name, with Go back and Proceed buttons."
      },
      {
        "src": "img/firstchekout/03-configuration.webp",
        "w": 1728,
        "h": 1117,
        "cap": "Merchant configuration: currency, payment channels, receipts, fees and payouts.",
        "alt": "Firstchekout Settings on the Configuration tab. Payments lets the merchant set a default currency and choose payment channels such as card, QR, USSD, bank transfer, virtual accounts and Buy Now Pay Later. Transactions sets who receives receipts and who pays the transaction fee. Payouts and balances sets the payout schedule and how earnings are received."
      },
      {
        "src": "img/firstchekout/06-api-keys-webhooks.webp",
        "w": 1728,
        "h": 1117,
        "cap": "API keys and webhooks: connect Firstchekout's payment channels to an existing website.",
        "alt": "Firstchekout Settings on the API Keys and Webhook tab. API keys shows a public key, an encryption key and a secret key, each with a Copy link button, with the secret values masked. Webhooks has a URL field, a masked secret hash, a Learn about webhooks button and options for JSON responses, retries, failed transaction webhooks and V3 webhooks."
      },
      {
        "src": "img/firstchekout/04-online-store.webp",
        "w": 1728,
        "h": 1117,
        "cap": "Online store: merchants sell and manage products, and reach more customers.",
        "alt": "A Firstchekout online store for a merchant called Seun Logistics. Products appear in a grid with price, items left, Add to Cart and View more. Sort controls filter by category, currency and price range, and a banner invites other merchants to set up a store with Firstchekout."
      },
      {
        "src": "img/firstchekout/05-payment-options.webp",
        "w": 1728,
        "h": 1117,
        "cap": "Checkout: customers choose from seven ways to pay.",
        "alt": "Firstchekout checkout showing an amount of 15,000 naira and a Select Payment method screen with options for Cards, Buy Now Pay Later, USSD, QR, Pay Attitude, First Bank Account and First Monie Wallet."
      }
    ],
    "hideDesign": [
      "Flows",
      "IA",
      "UI",
      "Interactions",
      "States",
      "Accessibility",
      "Responsive"
    ],
    "shotsInline": true
  },
  "fundall": {
    "product": "Fundall is a fintech super app built for the unbanked, offering \"all things money\" across four areas: Spend, Borrow, Grow and Manage. It became part of Emerging Africa Group after an acquisition.",
    "constraints": "Regulation meant Fundall had to verify every user through their Bank Verification Number (BVN), even though users were wary of sharing it. After the acquisition, the product also had to match the group's brand.",
    "stats": [
      [
        "1 min",
        "Onboarding time, down from 5 min"
      ],
      [
        "10%",
        "Rise in active users by Q4"
      ],
      [
        "₦200M+",
        "Transacting value"
      ]
    ],
    "statsNote": "By the end of 2023",
    "business": [
      "In early 2022, active users were falling even as downloads went up. Conversion was low, about 30% of users dropped off, and user lifetime value sat at 5%.",
      "After the acquisition, the product needed to match Emerging Africa Group's brand, but the bigger priority was improving the experience, because that was what drove the numbers that mattered. The goal was to grow active users by at least 10% month on month."
    ],
    "user": [
      "Onboarding took about 5 minutes, and most people who gave up did so at one field: their Bank Verification Number (BVN). People were cautious about sharing it, so they left before they ever had an account.",
      "Those who got in found the home screen in their way. Search was rarely used, an Edit Action button hid essential features, and the buttons to switch between Chest (the wallet) and Cards were too small. Transfers, used by over 85% of active users, confused people from the very first step."
    ],
    "evidence": [
      [
        "Surveys and focus groups",
        "Over 200 people from the Fundall Trybe community took part. More than 70% could not complete onboarding, and most named the BVN as the sticking point."
      ],
      [
        "Funnel data",
        "Low conversion, about 30% drop-off and 5% user lifetime value in early 2022, with active users falling while downloads rose."
      ],
      [
        "Journey and empathy maps",
        "Mapped the onboarding journey to find exactly where people dropped off, and what they were thinking and feeling at that point."
      ],
      [
        "Home screen usability findings",
        "Search was rarely used, the Edit Action button limited access to key features and wasted space, the community button wasn't needed, and switching between Chest and Cards needed bigger, clearer buttons."
      ],
      [
        "Transfer test",
        "Watched five users send money, timing them and tracking success. Three finished in 2 minutes 15 seconds and two couldn't finish. The main pain point was knowing how to start."
      ],
      [
        "Card requests",
        "About 5 card requests a week, including users such as parents who wanted a separate funded card for each child."
      ]
    ],
    "known": [
      "Onboarding took about 5 minutes.",
      "More than 70% of research participants couldn't complete onboarding, and most named the BVN.",
      "Over 85% of active users used transfers."
    ],
    "assumed": [
      "{Users would share their BVN if the step felt quick and safe and gave them something in return.}",
      "{Removing rarely used elements from the home screen would make room for what people use most.}"
    ],
    "unknown": [
      "{How many of the people who dropped off would come back once the BVN step was fixed.}"
    ],
    "hyp": [
      [
        "{If providing a BVN feels like a quick step that gives people their account number, rather than an invasive check, more of them will finish onboarding.}",
        "More than 70% of research participants couldn't complete onboarding, and most cited the BVN."
      ],
      [
        "{A clearer home screen, with bigger buttons for Chest and Cards, will lift the number of active users.}",
        "Usability findings showed unused elements crowding out the features people needed."
      ],
      [
        "{Making the first step of a transfer obvious will raise the success rate.}",
        "Two of five users in testing couldn't complete a transfer, mostly because they didn't know how to start."
      ]
    ],
    "explore": [
      [
        "Brainstorms with the team and stakeholders",
        "Facilitated sessions to generate ideas, framed as How Might We questions.",
        "Method"
      ],
      [
        "Benchmark against industry standards",
        "Measured the ideas against industry standards, then picked a feasible option to test.",
        "Method"
      ],
      [
        "Keep the original onboarding flow",
        "Five minutes long, with the BVN as a hard stop that people abandoned.",
        "Rejected"
      ],
      [
        "{Limited access first, then a BVN step that generates an account number}",
        "{Users sign up and get into the app without a BVN, with limited access and a few key tasks on the home screen. Providing the BVN then activates the account and generates their account number, in a step designed not to feel invasive or stressful.}",
        "Chosen"
      ]
    ],
    "why": {
      "user": "People get something they want, an account number, in return for their BVN, and the whole process takes under a minute.",
      "business": "Fundall still verifies every user as regulation requires, while far fewer people drop off before they become active.",
      "technical": "{Add engineering constraints, for example how BVN verification works behind the scenes.}"
    },
    "design": [
      [
        "Activating account",
        "New users land on the home screen with a prompt to activate their account before they can use Fundall's services. They choose how to verify: with their BVN, their NIN or facial recognition. On the BVN route, the screen explains why it's needed (to confirm their name, phone number and date of birth) and how to find it by dialling *565*0#. One Verify step then generates their account number, so activation takes under a minute instead of about five.",
        {
          "src": "img/fundall/onboarding.webp",
          "w": 885,
          "h": 776,
          "cap": "Activating an account: the prompt on the home screen, a choice of BVN, NIN or facial recognition, then entering the BVN.",
          "alt": "Three Fundall screens. The home screen shows an Activate your account prompt. The Activate account screen offers activation with BVN, with NIN or with facial recognition. The final screen, Confirm your identity, asks for the Bank Verification Number, explains why it is needed and how to find it, and has a Verify button."
        }
      ],
      [
        "Wealth creation",
        "{The Wealth section was restructured from a single fixed-savings view into three tabs: Regular Savings, Target Goals and Group Savings. Each has naira and USD options, and a new Islamic zero-interest savings product sits alongside regular naira and USD savings. Time-consuming, but necessary.}",
        {
          "src": "img/fundall/wealth.webp",
          "w": 885,
          "h": 776,
          "cap": "Wealth before and after: from fixed savings only to regular savings, target goals and group savings.",
          "alt": "Before and after of the Fundall Wealth section. The earlier design, outlined in red, focused on fixed savings. The redesign shows tabs for Regular Savings, Target Goals and Group Savings, naira and USD savings, a total balance with Create Goal, a list of savings, and a screen to choose Regular Naira Savings, Regular USD Savings or Islamic zero-interest savings."
        }
      ],
      [
        "Home screen",
        "A revamped home screen: search, the Edit Action button and the community button removed, with bigger, clearer buttons to switch between Chest (the wallet) and Cards.",
        {
          "src": "img/fundall/home.webp",
          "w": 885,
          "h": 688,
          "cap": "Home screen before and after: search, Edit Actions and Community removed, with clearer Chest and Cards tabs.",
          "alt": "Before and after of the Fundall home screen. The earlier design highlights the Community tab, the search field and the Edit Actions button in red. The redesign has larger Chest and Cards tabs, wallets in naira, pounds and dollars, a Quick Access grid and recent transactions."
        }
      ],
      [
        "Cards",
        "Cards redesigned so users can request a card, add a physical card, switch categories and see every card in a category at a glance. Before, they could hold only one physical Lifestyle Naira card and one virtual USD card.",
        {
          "src": "img/fundall/cards.webp",
          "w": 885,
          "h": 776,
          "cap": "Cards before and after: from one physical card to several physical and virtual cards in one place.",
          "alt": "Before and after of Fundall Cards. The earlier design, outlined in red, shows a single physical card with Fund Card and Card Details. The redesign shows Your cards with a Request Card button, tabs for physical and virtual cards, and several virtual cards listed, alongside the Lifestyle Naira Card."
        }
      ],
      [
        "Transfers",
        "Transferring funds was a common action for 85%+ of active users. To improve this flow, I ran a usability test observing how users completed a transfer task, measuring time-to-completion and task success rate. 3 of 5 users completed the transfer in 2:15 minutes; the other two were unable to complete it. Their key pain point: confusion about how to initiate the transfer in the first place.",
        {
          "src": "img/fundall/transfers.webp",
          "w": 885,
          "h": 688,
          "cap": "Transfers before and after: from a crowded list to four clear ways to start a transfer.",
          "alt": "Before and after of the Fundall Transfer money screen. The earlier design highlights in red a social payment link button, a select multiple beneficiaries option and a long list of saved banks and Fundallers, with account numbers blurred. The redesign offers four clear choices: transfer to a Fundaller, to a bank account, to multiple accounts, or via a social payment link, plus View transaction history."
        }
      ]
    ],
    "sim": "Explored simpler flows with low-fidelity wireframes, prototypes and micro-interactions. {Add the prototype video or link.}",
    "valid": {
      "tested": "{The new BVN onboarding flow, picked from the brainstorms as the most feasible option after benchmarking against industry standards. It was tested as a prototype, then in internal sessions where the team used the app before public release, with QA checking it was functional, bug-free and usable.}",
      "happened": "Before the redesign, more than 70% of the 200+ Trybe members in research couldn't complete onboarding, and most stopped at the BVN. After the new flow shipped, onboarding dropped from about 5 minutes to under 1 minute.",
      "changed": "{The BVN stopped being a hard stop and became the step that generates the user's account number, so sharing it felt like progress rather than an invasive check.}"
    },
    "build": [
      "Worked with the QA team to make sure the app was functional, bug-free and usable.",
      "Ran internal sessions where the team used the app before public releases.",
      "{Add how you handed designs over to engineering.}"
    ],
    "outcome": {
      "measured": "By the end of 2023, users grew from 77,679 to over 85,817, active users rose 10% by Q4 and transaction value grew 10% within 3 months. Transacting value passed ₦200M, there were 4,900 card requests, and onboarding dropped from about 5 minutes to under 1 minute.",
      "intended": "{Over time: onboarding completion rate and time to onboard, the share of new sign-ups who become active, monthly active users, transfer success rate and time to complete a transfer, card requests, and transacting value.}",
      "hide": [
        "measured"
      ]
    },
    "learn": {
      "next": "{Re-test the transfer flow to confirm that a clearer starting point removes the confusion that stopped two of the five users, aiming for every participant to complete it. Then study what keeps people active after onboarding, starting with transfers and cards, the features they use most, so growth in sign-ups turns into growth in active users.}",
      "taught": "The hardest part was regulatory compliance: balancing what the business has to verify against what users are willing to share, without either side winning by default. A single form field can be the thing standing between someone and an active account."
    },
    "heroImg": {
      "src": "img/fundall/hero.webp",
      "w": 1006,
      "h": 515,
      "cap": "The revamped Fundall app: a clearer home screen with Chest and Cards, card selection, and payments.",
      "alt": "Three Fundall app screens on phones. In the centre, the home screen greets the user, with Chest and Cards tabs, wallet balances in naira, pounds and dollars, Quick Access shortcuts such as Add Money, Send Money, Buy Airtime, Pay Bills, Borrow Money and Budget Money, and recent transactions. On the left, a Choose your preferred card screen shows the Lifestyle Naira Card. On the right, a Payments and Cards menu lists options such as transfer money, buy airtime and pay bills."
    },
    "hideDesign": [
      "Flows",
      "IA",
      "UI",
      "Interactions",
      "States",
      "Accessibility",
      "Responsive"
    ],
    "shotsInline": true,
    "secImgs": {
      "2": [
        {
          "src": "img/fundall/persona.webp",
          "w": 994,
          "h": 837,
          "cap": "Persona: Funke, a 27-year-old student who wants Fundall for daily spending but steps back when asked for her BVN.",
          "alt": "Persona card for Funke, a second-year student aged 27 who recently downloaded Fundall. Her quote says her everyday spending is mostly on feeding, education and other important things and she'd love to use the Fundall card for it. Goals: save while she spends and use her card for specific payments. Frustration: she has to provide her BVN without knowing if she can trust the app. Expectation: she wants to experience the app and build trust before giving any information."
        }
      ],
      "3": [
        {
          "src": "img/fundall/empathy-map.webp",
          "w": 805,
          "h": 675,
          "cap": "Empathy map: what users said, thought, did and felt at the BVN step.",
          "alt": "Empathy map in four quadrants. Says: wants to engage in everyday spending, a card for specific items, to save while spending, and to create a Fundall account. Thinks: the BVN is critical information they can't give out, they'd like to experience the exciting features, and other platforms don't ask for a BVN at onboarding. Does: checks the website, downloads the app, provides the requested information, then pauses when asked for the BVN. Feels: unsure whether to continue, cautious that it might be a scam, and disappointed that they can't continue."
        }
      ],
      "6": [
        {
          "src": "img/fundall/hmw-brainstorm.webp",
          "w": 1231,
          "h": 1063,
          "cap": "How Might We questions and what came out of the brainstorming sessions.",
          "alt": "Table of How Might We questions and brainstorming ideas. How might we let users onboard without their BVN: remove the BVN from onboarding and give limited access until it's provided. How might we get users to provide their BVN: build enough trust and let them try the features they expect, with limits. How might we keep their data safe: align with data protection guidelines and show users their data is safe. How might we keep users engaged without a BVN: give them tasks so they feel they've completed something before full access."
        },
        {
          "src": "img/fundall/flow-original.webp",
          "w": 1999,
          "h": 787,
          "cap": "The original onboarding flow: the BVN was required at sign-up, before users could see anything.",
          "alt": "Original onboarding flow chart: download the app, sign in with email, verify with a 6-digit OTP, add a picture, select preferences, then account number generated and onboarding completed. At sign-in, a red box shows the required details: email, phone number, Bank Verification Number, password, confirm password and referral code."
        },
        {
          "src": "img/fundall/flow-updated.webp",
          "w": 2000,
          "h": 575,
          "cap": "The updated onboarding flow: users access the app first with limited features, then enter their BVN to activate their account.",
          "alt": "Updated onboarding flow chart: download the app, sign in with email, OTP verification, add a picture and select preferences without a BVN, then access the app on a home page with limited financial activity and key tasks. Account activation asks for the 11-digit BVN, marked as a critical point for building trust. Once entered, the account number is generated and the user gets full access to financial activity."
        }
      ]
    },
    "hideSections": [
      9,
      11
    ]
  },
  "keys-community": {
    "product": "Keys Community is a residential-industry startup building self-developing communities. Residents post news, run polls, share updates and events, join clubs and fund communal projects, while vendors deliver and track their services in the same neighbourhoods.",
    "constraints": "A complex, two-sided concept that a small team had to break into a phased first version they could ship to the app store.",
    "hero": "{Add image: Keys Community app screens}",
    "business": [
      "I joined Keys in 2025, after several rounds of early development. The concept was ambitious and multi-sided: residents, vendors, community funding and communal activity, all in one product.",
      "Two risks compounded. Unbounded scope across news, polls, events, clubs, funding and vendor services could stall the build before anything shipped. And designing residents and vendors in isolation could leave one side of the two-sided loop unworkable."
    ],
    "user": [
      "{Residents needed to understand how communal projects were funded and to find services close to them, and new members needed a reason to get involved early. Vendors needed a reason to stay active, and a way to run a job without distraction.}"
    ],
    "evidence": [
      [
        "Structured working sessions",
        "Sessions with the Keys team and engineering to map requirements, define user journeys and agree what \"done\" meant for a first release."
      ],
      [
        "User research",
        "{Add any interviews, surveys or feedback from residents and vendors.}"
      ]
    ],
    "known": [
      "The concept spanned news, polls, events, clubs, community funding and vendor services.",
      "A small team had to ship a first version to the app store.",
      "The product only works if both residents and vendors stay active."
    ],
    "assumed": [
      "{A phased V1 would let the team ship without losing the heart of the concept.}",
      "{Vendors would stay active if they could see how their business performs in the community.}"
    ],
    "unknown": [
      "{Which features residents would use most once V1 launched.}"
    ],
    "hyp": [
      [
        "{If the sources of community funding are easy to see, residents will trust and contribute to communal projects.}",
        ""
      ],
      [
        "{If vendors can see which services earn them the most, they will stay active on the platform.}",
        ""
      ],
      [
        "{If new members are prompted to get involved, and neighbours are told they've joined, more of them will become active.}",
        ""
      ],
      [
        "{If the service screen shows only a timer and an end button, vendors can focus on the job in front of them.}",
        ""
      ]
    ],
    "explore": [
      [
        "Build the full concept at once",
        "News, polls, events, clubs, funding and vendor services together, with no agreed scope.",
        "Rejected"
      ],
      [
        "A phased, sequenced V1",
        "Scope agreed in structured sessions before detailed design, so a small team could ship.",
        "Chosen"
      ],
      [
        "Design residents and vendors separately",
        "Quicker in the short term, but it risked leaving one side of the loop unworkable.",
        "Rejected"
      ],
      [
        "Design both sides together",
        "Resident and vendor journeys designed side by side.",
        "Chosen"
      ]
    ],
    "why": {
      "user": "Each side gets what keeps it engaged: residents see where community money goes and find services nearby, and vendors see their performance and get a distraction-free job screen.",
      "business": "A phased V1 that a small team could actually ship to the app store, with both sides of the marketplace working from day one.",
      "technical": "Scope was agreed with engineering in the working sessions before detailed design, so the build was planned around what the team could deliver."
    },
    "design": [
      [
        "Flows",
        "The vendor service flow: an alert to start a job, at the resident's or the vendor's location. During the job, the screen shows only a running timer and one control to end it, with everything else removed."
      ],
      [
        "IA",
        "Communal project funding that makes the mix of sources clear: service charges, donations and returns from previously funded projects, plus how projects pay back over time."
      ],
      [
        "UI",
        "Vendor analytics showing how a vendor's business is performing in the community and which service brings in the most revenue."
      ],
      [
        "Interactions",
        "A welcome prompt that invites new members to post, join and connect, and lets existing neighbours know someone new has arrived."
      ],
      [
        "Services",
        "Local service delivery that shows residents the services closest to them in their community, rather than one long list."
      ],
      [
        "States",
        "{Add states: no services nearby, a job in progress, an empty community feed.}"
      ],
      [
        "Accessibility",
        "{Add accessibility decisions.}"
      ],
      [
        "Responsive",
        "{Add how screens adapt across phone sizes.}"
      ]
    ],
    "shots": "{Add images: funding, vendor analytics, welcome prompt, local services and vendor service screens}",
    "sim": "{Add a prototype video or link.}",
    "valid": {
      "tested": "{Add what you tested and with whom.}",
      "happened": "{Add what you saw.}",
      "changed": "{Add what changed because of it.}"
    },
    "build": [
      "Joined structured working sessions with the Keys team and engineering to map requirements, define user journeys and agree what \"done\" meant for V1.",
      "Crafted the journeys and micro-interactions for both the resident and vendor sides.",
      "Used Claude to move quickly from concept to material the team could review."
    ],
    "outcome": {
      "measured": "{Add outcomes: launch, sign-ups or vendor activity.}",
      "intended": "A V1 ready for the app store. {Add how you'll measure success after launch.}"
    },
    "learn": {
      "next": "{What would you change or test next?}",
      "taught": "Clarity in an early-stage, multi-sided product has to be created deliberately: agreeing scope in structured sessions mattered more than any single screen. Both user types need deliberate design, because a good resident experience doesn't guarantee vendors stay engaged. And sometimes the most valuable decision is what to remove from a screen, especially when the user's attention is elsewhere."
    }
  },
  "aptap": {
    "product": "Aptap is a broadband and utilities switching marketplace that sits inside UK banking apps such as Barclays, Lloyds, TSB and Halifax.",
    "constraints": "FCA and Consumer Duty requirements, accessibility standards and the partner banks' design systems. More deal clicks only count if completed switches don't fall.",
    "stats": [
      [
        "76%",
        "Of visitors start a quote"
      ],
      [
        "18%",
        "Of quote completers click a deal"
      ],
      [
        "15%",
        "Of deal clickers complete a switch"
      ]
    ],
    "statsNote": "Indicative funnel rates before the redesign",
    "business": [
      "The broadband funnel drops sharply between completing a quote and choosing a deal. About 76% of visitors start a quote, but only about 18% of people who complete one go on to click a deal, and about 15% of those complete a switch.",
      "The deal results page sits right at that drop, and it's a screen the business fully controls, which makes it a high-value place to improve. But more deal clicks only matter if they turn into completed switches."
    ],
    "user": [
      "Customers who complete a quote aren't confidently moving on to choose a deal. The results page may not be doing enough to help them understand their options, judge value, resolve their doubts and feel confident about switching.",
      "It's a big psychological shift: the customer stops giving information and starts making a financial and contractual decision. The page has to support that confidence, not just display products.",
      "How might we help customers quickly understand and confidently choose the broadband deal that is right for them?"
    ],
    "evidence": [
      [
        "Funnel data",
        "Quote start 76%, quote complete to deal click 18%, deal click to switch complete 15%. The data shows where the funnel is weak, not why."
      ],
      [
        "Behavioural analytics (planned)",
        "Abandonment at each step, time on page, scroll depth, deal views, expansions, CTA interactions and back navigation, segmented by device, customer type and speed need. The sequence tracked: quote completed, results viewed, deal viewed, deal selected, switch started, switch completed."
      ],
      [
        "Usability testing (planned)",
        "People who have recently considered switching broadband pick the deal they would most likely buy, while I watch comprehension, comparison, hesitation, trust and confidence, and ask what they expected but couldn't find."
      ],
      [
        "Heuristic review (planned)",
        "Clarity, hierarchy, cognitive load, transparency, feedback, accessibility and CTA visibility, and whether the page supports a decision rather than just listing products."
      ],
      [
        "Competitive review (planned)",
        "Broadband and other subscription journeys, looking for patterns in recommendation, comparison, pricing transparency and reassurance. Patterns to learn from, not visual designs to copy."
      ]
    ],
    "known": [
      "Customers are willing to start: about 76% begin a quote.",
      "Only about 18% of quote completers click a deal.",
      "Only about 15% of deal clickers complete a switch.",
      "The deal results page is a screen the business fully controls.",
      "The real goal is completed switches, not clicks alone."
    ],
    "assumed": [
      "The reasons for the drop-off. The data shows where the funnel is weak, not why, so every cause in Hypotheses stays an assumption until research validates it."
    ],
    "unknown": [
      "Are customers overwhelmed by the number of deals?",
      "Do they understand the practical differences between packages?",
      "Is pricing, promotional pricing or contract information creating uncertainty?",
      "Do they know which deal suits their household and usage?",
      "Is important information missing or hard to find?",
      "Do they trust the recommendation and understand what happens after choosing a deal?",
      "Are there usability or accessibility issues, particularly on mobile?"
    ],
    "hyp": [
      [
        "Choice overload: too many similar deals may make the decision feel difficult.",
        ""
      ],
      [
        "Poor differentiation: customers may not understand the practical difference between packages.",
        ""
      ],
      [
        "Weak value communication: features may be visible without explaining which option is the best fit.",
        ""
      ],
      [
        "Price uncertainty: the promotional price, the price after the promotion or the contract terms may be unclear.",
        ""
      ],
      [
        "Lack of reassurance: customers may worry about installation, cancellation, timing or hidden costs.",
        ""
      ],
      [
        "Weak next action: the main button may not make the next step clear enough.",
        ""
      ]
    ],
    "explore": [
      [
        "A list of packages to work through",
        "The current approach: show every package and leave customers to work out the differences themselves. {It stays live as the control in the test.}",
        "Rejected"
      ],
      [
        "{Variant A: Best Match}",
        "{Tests the choice-overload theory. A small set of best-fit deals leads the page, with every other deal behind a \"compare all\" expand, so the decision starts from a shortlist rather than the full catalogue.}",
        "Chosen"
      ],
      [
        "{Variant B: Confidence & Clarity}",
        "{Tests the anxiety theory. Keeps every option visible, but adds transparent pricing, an exit-fee check, FAQs and reassurance about switching, so customers can resolve their doubts on the page.}",
        "Chosen"
      ],
      [
        "{A three-way test rather than one redesign}",
        "{The data shows where customers drop off, not why, so both variants run against the current page (control) instead of committing to a single guided design.}",
        "Method"
      ],
      [
        "Design principles",
        "Make the decision easy, make differences obvious, show value, be transparent, build confidence, preserve control and make the next step obvious.",
        "Method"
      ]
    ],
    "why": {
      "user": "Customers get clear guidance on which deal fits them and why, but keep control: they can still compare every option before choosing. {Variant A leads with that guidance; Variant B leads with the reassurance around it.}",
      "business": "Success is measured on deal selection with completed switches as the guardrail, so the redesign can't win by pushing people into deals they later abandon. {Testing two variants against the control shows which theory explains the drop-off, not just whether a new page performs better.}",
      "technical": "The experience has to work within each partner bank's design system, accessibility standards and FCA and Consumer Duty requirements."
    },
    "design": [
      [
        "Deal marketplace",
        "{The entry point inside the banking app: a postcode check for availability, and the top providers (BT, EE, Sky, Virgin Media and Plusnet) to browse. It starts the journey that runs from quote to deal results, comparison and switch.}",
        {
          "src": "img/aptap/01-marketplace.webp",
          "w": 1702,
          "h": 1419,
          "cap": "Marketplace home: enter a postcode or browse top providers.",
          "alt": "Aptap broadband marketplace in partnership with Barclays. A banner reads Get affordable broadband deals around you, with a postcode field and a Check for availability button. Below, Top dealers shows BT Broadband, EE, Sky, Virgin Media and Plusnet, each with a View deals button."
        }
      ],
      [
        "Deal page",
        "{The redesigned results page, organised around the decision rather than the catalogue. Three best-fit deals come first, each with a plain-language line on who it suits, monthly price, speed, contract length, incentives and when the price rises. Other deals follow, with Cheapest, Fastest and Best for Streaming filters, a provider filter and a compare tray.}",
        {
          "src": "img/aptap/02-deal-results.webp",
          "w": 1702,
          "h": 1419,
          "cap": "Deal results: three best-fit deals first, then other deals to explore.",
          "alt": "Deal results page. Recommended for you shows three Best fit for you cards with monthly price, speed, contract length, a £50 bill credit badge, a note that the price rises from month 19, Choose the deal and View full details buttons, and a Compare deals checkbox. A provider filter is on the left, filter chips for All, Cheapest, Fastest and Best for Streaming sit above other deals, and a bar at the bottom shows 2 of 3 deals selected with a Compare button."
        }
      ],
      [
        "Deal details",
        "{Everything needed to commit, in one place: pricing transparency (the promotional price, the price after it and an estimated first-year cost), an exit-fee check against the customer's current provider, and why this provider, with ratings and reassurance such as the 14-day cooling-off period. A summary card keeps the Continue to switch button in view.}",
        {
          "src": "img/aptap/03-deal-details.webp",
          "w": 1702,
          "h": 1419,
          "cap": "Deal details: transparent pricing, an exit fee check and why this provider.",
          "alt": "Deal details for Virgin Media VoltFibre 150. Sections for Pricing transparency, showing £28.99 a month until month 18, a price rise after that and an estimated first-year cost of £348; Exit fee check, noting the customer is with Sky and their contract end date will be confirmed next; and Why this provider, with a 4.2 rating from 12,840 reviews and tags for hassle-free switch, 14-day cooling off and FCA regulated broker. A summary card on the right has a Continue to switch button."
        }
      ],
      [
        "Deal comparison",
        "{For customers who want more control, a side-by-side table compares the deals they pick on monthly price, price after the promotion, first-year cost, speed, contract, fees, incentives and rating. The best value in each row is highlighted, and the first-year cost counts the post-promotion price rather than the headline one.}",
        {
          "src": "img/aptap/04-compare.webp",
          "w": 1702,
          "h": 1419,
          "cap": "Compare: two deals side by side, with the best value in each row highlighted.",
          "alt": "Compare deals table showing Volt Fibre 150 and Volt Fibre 350 side by side. Rows cover monthly price, price after promotion, estimated first-year cost, download speed, contract length, setup fee, connection, incentive and customer rating. Green cells mark the best value in each row, and the note explains that the post-promotion price is counted, not just the headline price."
        }
      ],
      [
        "Switch deal",
        "{The first of three switch steps. The chosen deal stays summarised at the top with a Change deal option, and the form asks for the customer's name, current provider and contract end date, both skippable, so exit fees can be checked before they commit.}",
        {
          "src": "img/aptap/05-switch-step-1.webp",
          "w": 1702,
          "h": 1419,
          "cap": "Switch, step 1 of 3: confirm your name, current provider and contract end date.",
          "alt": "Switch step 1 of 3. The selected broadband deal is summarised at the top with a Change deal button. The form asks the customer to confirm their full name, choose their current provider and select the month and year their contract ends, explains that exit fees will be checked before they commit, and ends with a Proceed to switch deal button."
        }
      ]
    ],
    "sim": "A working prototype of the broadband marketplace. Enter a postcode to reach the redesigned deal results, then filter providers, compare deals and choose one.",
    "valid": {
      "tested": "A three-way experiment plan: the current page (control) against Variant A, Best Match, and Variant B, Confidence & Clarity. Visitors are assigned server-side at their first view of the results page and stay in the same group for the session. The primary metric, quote complete to deal click, is tested at 95% confidence over at least one full weekly cycle, with click to switch complete as the guardrail.",
      "happened": "The test hasn't run yet, so the PRD sets out how to read it. A lift with a high \"compare all\" expand rate confirms the overload theory. A lift with high FAQ and exit-fee engagement confirms the anxiety theory. A flat result suggests the drop-off sits before or after this page, so it's worth re-instrumenting before trying a third theory.",
      "changed": "Variant B's exit-fee promise forced one change downstream: Switch Step 1 now asks for the current provider and contract end date, both skippable, and shows a non-blocking notice if the user may still be in contract, without adding a screen."
    },
    "build": [
      "Wrote a 10-page <a class=\"inline-link\" href=\"https://docs.google.com/document/d/1kLDZbqbKPLduGfOQwnmsKCnNpV_Gsu7BfX5dYVSddfw/edit?tab=t.0\" target=\"_blank\" rel=\"noopener noreferrer\">PRD<span class=\"sr-only\"> (opens in a new tab)</span><svg viewBox=\"0 0 12 12\" aria-hidden=\"true\"><path d=\"M4 2.5h5.5V8M9.5 2.5 3 9\"/></svg></a> with three personas, four epics with acceptance-criteria-level user stories, constraints and an assumptions section.",
      "Wrote an implementation <a class=\"inline-link\" href=\"https://docs.google.com/document/d/154VyJfwbmEC0J5yV8Pz_cFm9PxbfAGh_0ZLX3rHgygs/edit?tab=t.0#heading=h.lpdipm8rka3b\" target=\"_blank\" rel=\"noopener noreferrer\">prompt<span class=\"sr-only\"> (opens in a new tab)</span><svg viewBox=\"0 0 12 12\" aria-hidden=\"true\"><path d=\"M4 2.5h5.5V8M9.5 2.5 3 9\"/></svg></a> for build.",
      "Figma work ran through an AI-supported MCP workflow.",
      "Built the working prototype, with the code kept in a <a class=\"inline-link\" href=\"https://github.com/Erastus-O/Aptap-Redesign\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub<span class=\"sr-only\"> (opens in a new tab)</span><svg viewBox=\"0 0 12 12\" aria-hidden=\"true\"><path d=\"M4 2.5h5.5V8M9.5 2.5 3 9\"/></svg></a> repository."
    ],
    "outcome": {
      "measured": "{Add results once the test has run.}",
      "intended": "Primary: the rate from quote completed to deal selected, currently about 18%, with the target set through the business and the experiment plan rather than invented. Secondary: deal selected to switch started, switch started to switch completed, overall quote to completed switch, results-page abandonment, time to choose a deal, deals viewed, back navigation and quote edits, support contact rate, and cancellations. Guardrail: more deal clicks aren't enough if switch completion falls.",
      "hide": [
        "measured"
      ]
    },
    "learn": {
      "next": "Ship Variant B, Confidence & Clarity, first: it adds information without removing anyone's options, so the downside if the theory is wrong is small. Then carry the \"why this fits you\" reasoning onto the Deal Detail page, put a real exit-fee data source behind the new Switch Step 1 fields, and get Legal and Compliance sign-off on any recommendation or savings claim before it leaves test.",
      "taught": "The data tells you where the problem is, not why. The opportunity is to turn the deal results page from a product catalogue into a decision-support experience: not pushing customers into a deal, but helping them understand their options and confidently choose the right one."
    },
    "heroImg": {
      "src": "aptapResults",
      "w": 1702,
      "h": 1419,
      "alt": "Redesigned Aptap broadband deal results page in partnership with Barclays. A Recommended for you section shows three best-fit deal cards with monthly price, speed, contract length, a bill credit badge, a note on when the price rises, a Choose the deal button and a Compare deals checkbox. Below, Other deals you could explore can be filtered by All, Cheapest, Fastest and Best for Streaming, a provider filter sits on the left, and a compare bar at the bottom shows two of three deals selected.",
      "cap": "The redesigned deal results page: recommended deals first, with transparent pricing, a compare option and other deals to explore."
    },
    "simUrl": "https://erastus-o.github.io/Aptap-Redesign/#/",
    "simTitle": "Aptap deal results redesign, interactive prototype",
    "simEmbed": "proto/aptap/index.html#/",
    "shotImgs": [
      {
        "src": "img/aptap/01-marketplace.webp",
        "w": 1702,
        "h": 1419,
        "cap": "Marketplace home: enter a postcode or browse top providers.",
        "alt": "Aptap broadband marketplace in partnership with Barclays. A banner reads Get affordable broadband deals around you, with a postcode field and a Check for availability button. Below, Top dealers shows BT Broadband, EE, Sky, Virgin Media and Plusnet, each with a View deals button."
      },
      {
        "src": "img/aptap/02-deal-results.webp",
        "w": 1702,
        "h": 1419,
        "cap": "Deal results: three best-fit deals first, then other deals to explore.",
        "alt": "Deal results page. Recommended for you shows three Best fit for you cards with monthly price, speed, contract length, a £50 bill credit badge, a note that the price rises from month 19, Choose the deal and View full details buttons, and a Compare deals checkbox. A provider filter is on the left, filter chips for All, Cheapest, Fastest and Best for Streaming sit above other deals, and a bar at the bottom shows 2 of 3 deals selected with a Compare button."
      },
      {
        "src": "img/aptap/03-deal-details.webp",
        "w": 1702,
        "h": 1419,
        "cap": "Deal details: transparent pricing, an exit fee check and why this provider.",
        "alt": "Deal details for Virgin Media VoltFibre 150. Sections for Pricing transparency, showing £28.99 a month until month 18, a price rise after that and an estimated first-year cost of £348; Exit fee check, noting the customer is with Sky and their contract end date will be confirmed next; and Why this provider, with a 4.2 rating from 12,840 reviews and tags for hassle-free switch, 14-day cooling off and FCA regulated broker. A summary card on the right has a Continue to switch button."
      },
      {
        "src": "img/aptap/04-compare.webp",
        "w": 1702,
        "h": 1419,
        "cap": "Compare: two deals side by side, with the best value in each row highlighted.",
        "alt": "Compare deals table showing Volt Fibre 150 and Volt Fibre 350 side by side. Rows cover monthly price, price after promotion, estimated first-year cost, download speed, contract length, setup fee, connection, incentive and customer rating. Green cells mark the best value in each row, and the note explains that the post-promotion price is counted, not just the headline price."
      },
      {
        "src": "img/aptap/05-switch-step-1.webp",
        "w": 1702,
        "h": 1419,
        "cap": "Switch, step 1 of 3: confirm your name, current provider and contract end date.",
        "alt": "Switch step 1 of 3. The selected broadband deal is summarised at the top with a Change deal button. The form asks the customer to confirm their full name, choose their current provider and select the month and year their contract ends, explains that exit fees will be checked before they commit, and ends with a Proceed to switch deal button."
      }
    ],
    "hideDesign": [
      "Flows",
      "IA",
      "UI",
      "Interactions",
      "Reassurance",
      "States",
      "Accessibility",
      "Responsive"
    ],
    "shotsInline": true
  },
  "baci": {
    "product": "BACI is an AI-powered personal finance product for UK consumers whose money is spread across several institutions: a salary account, a spending account, savings, credit cards, loans, an ISA and perhaps a pension. It brings them into one financial picture and puts a Finance Intelligence Agent on top that can explain, forecast and model decisions in plain language.",
    "constraints": "Partial data presented as a complete picture is worse than no answer. The interface has to show coverage, freshness and assumptions without turning into a technical banking console.",
    "hero": "{Add image: BACI app screens}",
    "business": [
      "A single current-account balance can't reliably answer an everyday question like \"Can I afford a £1,500 laptop?\", because the bills, card balances and goals that matter sit in other apps.",
      "The brief started as \"design a finance dashboard\". I reframed it: treat the user's finances as one connected system, with an agent that reasons across all of it. I deliberately avoided a consolidated-balance dashboard, because the value lies in understanding the numbers well enough to decide."
    ],
    "user": [
      "People reconcile their finances across apps in their heads. A balance in one app and a card bill in another never add up to a clear answer about what they can actually spend.",
      "How might we turn fragmented banking data into explainable, conversational decision support that users can actually trust?"
    ],
    "evidence": [
      [
        "Jobs-to-be-done mapping (planned)",
        "Mapping the questions behind the numbers, such as \"How much do I really have?\" and \"Why does my balance feel lower than expected?\""
      ],
      [
        "Consent and connection testing (planned)",
        "Usability testing of consent and account connection with people who hold accounts at two or more institutions."
      ],
      [
        "Trust testing (planned)",
        "Testing affordability answers with and without source, freshness and assumption disclosures."
      ],
      [
        "Competitive review (planned)",
        "Bank apps, aggregators and AI assistants, focused on interaction patterns rather than visuals."
      ]
    ],
    "known": [
      "Many people spread their money across several institutions.",
      "A single account balance can't answer an affordability question on its own.",
      "Partial data presented as complete is worse than no answer."
    ],
    "assumed": [
      "The six hypotheses below. None has been tested with users yet."
    ],
    "unknown": [
      "Whether showing coverage, freshness and assumptions builds trust or adds friction."
    ],
    "hyp": [
      [
        "Coverage drives accuracy: answers grounded in all of a user's accounts will be more useful.",
        ""
      ],
      [
        "Granular consent builds trust and increases connection rates.",
        ""
      ],
      [
        "Immediate value earns the next account connection.",
        ""
      ],
      [
        "Explainability beats confidence: people will trust hedged, explained answers over confident ones.",
        ""
      ],
      [
        "Conversation lowers the barrier compared with navigating a dashboard's categories.",
        ""
      ],
      [
        "Scenarios beat verdicts: showing a big purchase's impact on the cash buffer and goals beats a simple yes or no.",
        ""
      ]
    ],
    "explore": [
      [
        "A consolidated-balance dashboard",
        "The original brief. A total balance doesn't help someone decide, so I set it aside.",
        "Rejected"
      ],
      [
        "An agent on a consolidated data model",
        "The agent is the primary interface, reasoning across every connected account.",
        "Chosen"
      ],
      [
        "Connection as a one-time onboarding step",
        "Set aside for a persistent loop, so people can add accounts whenever they're ready.",
        "Rejected"
      ],
      [
        "Uncertainty as a feature",
        "Coverage, freshness and assumptions shown in every answer, in reassuring rather than technical language.",
        "Chosen"
      ]
    ],
    "why": {
      "user": "People ask questions in their own words and get answers that show their working, so they can check them and trust them for the right reasons.",
      "business": "Immediate value, like spotting duplicate subscriptions, gives people a reason to connect their next account, which makes every answer more accurate.",
      "technical": "Everything sits on one financial data model, so the agent can't use a disconnected account or count credit-card debt as cash."
    },
    "design": [
      [
        "Flows",
        "Onboarding that earns permission: the Finance Intelligence Agent explains where data is kept (Secure Vault), what happens to it (Smart Alerts) and who controls it, with a five-stage progress indicator keeping it short."
      ],
      [
        "Consent",
        "Nine data categories, each explained in plain language and revocable later: transaction history, spending categories, bills and direct debits, savings and ISAs, credit cards, loans and mortgages, overdraft usage, investments and pensions, and income signals."
      ],
      [
        "IA",
        "User, Profile, Consent, Accounts, Financial data model, Intelligence, Agent."
      ],
      [
        "UI",
        "A profile that captures take-home income, current status, primary goal, risk approach and how often to get insights. Declared and account-derived income sit side by side, labelled by source, so live data never silently overwrites what the person entered."
      ],
      [
        "Interactions",
        "\"Can I afford this?\": the agent parses the price, separates one-off from recurring costs, checks every connected account and how fresh its data is, then weighs income, essential spending, debt repayments, upcoming bills and savings goals. It projects the cash position and the impact on goals, and offers alternatives where useful."
      ],
      [
        "Insights",
        "A first insight straight after connection: duplicate streaming subscriptions across accounts, with the estimated annual saving. Each insight shows what was detected, the source accounts and transactions, the period analysed, the estimated impact, and options to act or dismiss."
      ],
      [
        "Trust",
        "Every answer shows which accounts were analysed, when they last synced, whether coverage is complete, what was assumed, how the figure was calculated, and how to change accounts or permissions. With partial coverage, the agent says so, for example \"your analysis is based on 3 of your accounts\", and offers to connect another."
      ],
      [
        "States",
        "Ten connection states, from Connecting, Awaiting authorisation and Healthy through Stale, Re-authentication required and Disconnected. Each account shows its institution, a masked identifier, its status and its last successful sync."
      ],
      [
        "Accessibility",
        "{Add accessibility decisions.}"
      ],
      [
        "Responsive",
        "Designed for mobile. {Add how screens adapt.}"
      ]
    ],
    "shots": "{Add images: onboarding, consent, profile, accounts, first insight and Can I afford this?}",
    "simUrl": "https://erastus-o.github.io/BACI/welcome",
    "simMode": "link",
    "simTitle": "BACI working prototype",
    "sim": "A working prototype of BACI, including the Finance Intelligence Agent. It opens in a new tab.",
    "valid": {
      "tested": "A validation plan of nine QA acceptance scenarios, including connecting one bank, aggregating three institutions, never treating credit-card debt as cash, blocking the agent from disconnected accounts, and detecting duplicate subscriptions without double-counting.",
      "happened": "{Add results once tested.}",
      "changed": "{Add what changed because of it.}"
    },
    "build": [
      "Defined the product strategy and the experience end to end, from onboarding and consent through the insight engine and the AI agent.",
      "Wrote a PRD, a functional requirements document and a flow specification, and produced a high-fidelity Figma file.",
      "Built a working prototype, with the code on <a class=\"inline-link\" href=\"https://github.com/Erastus-O/BACI\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub<span class=\"sr-only\"> (opens in a new tab)</span><svg viewBox=\"0 0 12 12\" aria-hidden=\"true\"><path d=\"M4 2.5h5.5V8M9.5 2.5 3 9\"/></svg></a>. {Add how you used the Claude and ElevenLabs prompts.}"
    ],
    "outcome": {
      "measured": "{Add results once tested.}",
      "intended": "Success is measured through four lenses: activation (including connecting two or more accounts), engagement, trust (treated as guardrails) and financial utility."
    },
    "learn": {
      "next": "Run moderated testing of the \"Can I afford this?\" flow, to confirm that transparency builds trust rather than adding friction.",
      "taught": "The hardest problem wasn't the AI, it was honesty about data. A confident agent working from partial data would lose people's trust after its first mistake. Coverage, freshness and assumptions need to be shown in a reassuring way, not a technical one."
    }
  }
};

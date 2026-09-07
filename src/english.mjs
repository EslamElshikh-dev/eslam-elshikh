const service = (entry) => ({
  ...entry,
  keywords: entry.keywords || [],
  faq: entry.faq || []
});

export const englishServices = [
  service({
    slug: "cybersecurity",
    number: "01",
    icon: "shield",
    group: "Security & Digital Infrastructure",
    title: "Cybersecurity & Systems Protection",
    seoTitle: "Cybersecurity Services in Riyadh, Saudi Arabia",
    h1: "Cybersecurity reviews that turn risk into an actionable plan",
    short: "Authorized security assessments for websites, accounts, cloud environments, and critical workflows, followed by prioritized remediation and evidence-based retesting.",
    meta: "Cybersecurity services in Riyadh for websites, cloud systems, identities, and business accounts, with authorized testing, prioritized remediation, and verification.",
    intro: [
      "Security becomes useful when it helps a business decide what to protect first. I begin by mapping the assets, identities, data flows, third-party dependencies, and failure scenarios that could interrupt operations or expose sensitive information. The result is a risk picture tied to business impact, not a generic scan exported from a tool.",
      "Any active testing is performed only within an agreed written scope. Findings are explained in plain language, supported by appropriate evidence, and converted into fixes that an internal or external technical team can implement. Critical items can then be retested so the engagement ends with verified progress rather than an unresolved report."
    ],
    value: "A clearer security posture, fewer avoidable attack paths, and remediation work that can be owned, tracked, and verified.",
    scope: [
      "Authorized reviews of websites, web applications, and APIs",
      "Cloud, hosting, identity, and privileged-access configuration",
      "Authentication, session handling, uploads, inputs, and integrations",
      "Domains, HTTPS, security headers, backups, and recovery controls",
      "Secrets, API keys, deployment pipelines, and third-party exposure",
      "Practical incident-readiness, escalation, and evidence handling"
    ],
    deliverables: [
      "Executive risk summary written for business and technical owners",
      "Prioritized technical findings with proportionate supporting evidence",
      "Remediation plan with ownership, severity, and acceptance criteria",
      "Review session to align the team on risk and implementation choices",
      "Retesting of agreed critical findings after remediation"
    ],
    forWho: [
      "Companies preparing to launch a new website or application",
      "Teams relying on cloud accounts, integrations, and shared access",
      "Businesses that have noticed suspicious activity or repeated attacks",
      "Organizations preparing for growth, due diligence, or a major integration"
    ],
    steps: [
      { title: "Authorize the scope", text: "Define assets, exclusions, testing windows, contacts, and stop conditions in writing." },
      { title: "Assess with context", text: "Review architecture, configuration, workflows, and evidence while protecting service stability." },
      { title: "Prioritize the risk", text: "Connect each finding to likelihood, operational impact, and a realistic remediation order." },
      { title: "Remediate and retest", text: "Support the fix, verify agreed items, and document what remains accepted or deferred." }
    ],
    faq: [
      ["Does the service include penetration testing?", "It can include active testing when it is appropriate, but no intrusive test begins without explicit written authorization, a defined technical scope, and agreed rules of engagement."],
      ["What will I receive after the assessment?", "You receive an executive summary, prioritized technical findings, suitable evidence, a remediation plan, and clear checks for confirming that agreed issues were actually resolved."],
      ["Is this suitable for a small business website?", "Yes. The depth is adjusted to the data, integrations, exposure, and budget. A focused review is often more useful than applying an oversized checklist to a simple environment."],
      ["Can you assess a live system without disrupting it?", "The work is planned to reduce operational impact. We can begin with passive and configuration reviews, then schedule sensitive checks during an agreed window with stop and escalation procedures."]
    ],
    keywords: ["cybersecurity services Riyadh", "website security assessment Saudi Arabia", "cloud security review"]
  }),
  service({
    slug: "cloud-solutions",
    number: "02",
    icon: "cloud",
    group: "Security & Digital Infrastructure",
    title: "Secure Cloud Solutions",
    seoTitle: "Secure Cloud Architecture & Migration in Saudi Arabia",
    h1: "Cloud architecture designed for safe growth and dependable recovery",
    short: "Right-sized cloud environments with clear boundaries, least-privilege access, protected secrets, tested backups, practical monitoring, and controlled costs.",
    meta: "Secure cloud architecture, migration, monitoring, access control, backups, recovery, and cost optimization for companies in Riyadh and across Saudi Arabia.",
    intro: [
      "Moving to the cloud is not the same as moving an existing server to a different provider. A resilient design starts with workload patterns, data sensitivity, team capability, recovery expectations, and the real cost of downtime. Those constraints guide the architecture before individual services are selected.",
      "I design environments that separate development from production, reduce broad permissions, protect secrets, and make logs, alerts, backups, and costs visible. The goal is an operating model your team can understand and recover—not an impressive diagram that becomes fragile after launch."
    ],
    value: "A cloud foundation that is easier to operate, safer to change, and ready to scale without losing cost or recovery visibility.",
    scope: [
      "Architecture for websites, applications, APIs, and data services",
      "Development, staging, and production environment separation",
      "Identity design and least-privilege access controls",
      "Secrets, certificates, domains, and deployment configuration",
      "Monitoring, logs, alerts, backups, and recovery testing",
      "Migration sequencing, rollback planning, performance, and cost review"
    ],
    deliverables: [
      "Architecture map covering components and data movement",
      "Access and responsibility model for owners and operators",
      "Backup and recovery plan with agreed recovery objectives",
      "Operational dashboard and alerts for meaningful failure signals",
      "Cost and performance recommendations based on actual usage"
    ],
    forWho: [
      "New products that need a foundation able to grow",
      "Applications affected by slow performance or repeated outages",
      "Teams planning a migration with limited downtime",
      "Businesses that need clearer environments, permissions, and costs"
    ],
    steps: [
      { title: "Model the workload", text: "Document usage, data, integrations, budget, compliance needs, and acceptable downtime." },
      { title: "Design the architecture", text: "Choose services, boundaries, access paths, recovery controls, and observability." },
      { title: "Build or migrate safely", text: "Implement in stages, test critical flows, and preserve a practical rollback path." },
      { title: "Operate and improve", text: "Measure reliability, performance, security signals, and cost before changing capacity." }
    ],
    faq: [
      ["Can you recommend the right cloud platform?", "Yes. The recommendation is based on workload, data location, reliability, cost, integrations, and the team's ability to operate it—not provider popularity alone."],
      ["Can an existing application be migrated?", "Yes, after its databases, files, domains, email, dependencies, and integrations are mapped. The migration plan includes testing, cutover, and rollback steps."],
      ["Do you provide support after launch?", "Ongoing reviews can cover alerts, logs, backups, access, updates, performance, and cost at a frequency that matches the system's criticality."],
      ["How do you prevent unexpected cloud bills?", "Budgets and alerts are set early, unused resources are reviewed, storage and retention are controlled, and scaling decisions are tied to measured demand."]
    ],
    keywords: ["secure cloud solutions Saudi Arabia", "cloud migration Riyadh", "cloud architecture consulting"]
  }),
  service({
    slug: "ai-agents",
    number: "03",
    icon: "spark",
    group: "Software & Artificial Intelligence",
    title: "AI Agents & Business Automation",
    seoTitle: "AI Agents & Automation in Saudi Arabia",
    h1: "AI agents built around real work, trusted knowledge, and human control",
    short: "Purpose-built assistants connected to approved knowledge and tools, with measurable quality, limited permissions, human approval, and safe escalation paths.",
    meta: "Design and development of AI agents and business automation in Saudi Arabia, with governed knowledge, evaluations, limited permissions, and human oversight.",
    intro: [
      "A useful AI agent is not judged by how naturally it chats. It is judged by whether it completes a defined task accurately, consistently, and within acceptable risk. I start with the workflow: where time is lost, which sources are authoritative, what tools are required, and which decisions must remain with a person.",
      "The first release is deliberately narrow. Knowledge is prepared, permissions are constrained, and an evaluation set is built from realistic requests—including ambiguous inputs, refusals, and failure cases. This creates an automation system that can earn trust through evidence instead of receiving broad access on day one."
    ],
    value: "Less time spent on repeatable work without giving up source quality, operational visibility, or human accountability.",
    scope: [
      "Internal knowledge assistants and customer-support copilots",
      "Multi-step task agents and approval-based workflows",
      "Retrieval-augmented generation and semantic search",
      "Connections to approved APIs, forms, and business tools",
      "Permission boundaries, human approval, logging, and safe shutdown",
      "Quality, latency, cost, and behavioral evaluations"
    ],
    deliverables: [
      "A precise use-case definition with exclusions and success metrics",
      "A testable prototype connected to named knowledge sources",
      "An evaluation suite covering success, failure, and refusal cases",
      "Permission, logging, and human-review rules for sensitive actions",
      "A staged rollout and monitoring plan"
    ],
    forWho: [
      "Teams repeatedly searching policies, documents, or procedures",
      "Support teams that need faster drafts grounded in approved sources",
      "Operations that include repeatable steps and explicit approvals",
      "Companies that want to test AI value before a larger investment"
    ],
    steps: [
      { title: "Choose one valuable task", text: "Define inputs, outputs, risk, edge cases, and a result that can be reviewed." },
      { title: "Prepare knowledge and tools", text: "Clean sources, permissions, integrations, retention rules, and audit requirements." },
      { title: "Build a constrained prototype", text: "Implement the workflow with guardrails, citations, refusals, and safe failure paths." },
      { title: "Evaluate before scaling", text: "Measure accuracy, intervention, latency, and cost, then expand only where evidence supports it." }
    ],
    faq: [
      ["Is every business process suitable for an AI agent?", "No. Some tasks are safer, cheaper, and more predictable with traditional software or a structured search experience. The first step is deciding whether AI is genuinely appropriate."],
      ["Can the agent use private company data?", "Yes, after approved sources, access boundaries, retention, logging, and user roles are defined. Convenience is not a reason to grant unrestricted access."],
      ["How is answer quality measured?", "A realistic evaluation set tests source accuracy, retrieval, instruction following, refusal behavior, critical errors, human intervention, latency, and cost."],
      ["Will an AI agent replace employees?", "The practical goal is usually to reduce repetitive search and coordination. Sensitive judgments, accountability, and relationship work still require clearly identified people."]
    ],
    keywords: ["AI agents Saudi Arabia", "business automation Riyadh", "enterprise AI assistant"]
  }),
  service({
    slug: "web-development",
    number: "04",
    icon: "code",
    group: "Software & Artificial Intelligence",
    title: "Website & Application Development",
    seoTitle: "Professional Web Development in Riyadh | Eslam Elshikh",
    h1: "Websites and applications engineered to explain, persuade, and perform",
    short: "Fast, secure, search-ready digital experiences designed mobile-first for iPhone, Android, Huawei, tablets, laptops, and modern desktop browsers.",
    meta: "Professional website and application development in Riyadh with mobile-first UX, performance, technical SEO, accessibility, security, and clear conversion paths.",
    intro: [
      "A professional website is a decision journey, not a stack of attractive sections. I begin with the audience, search intent, service structure, objections, and desired action. Content architecture comes before visual polish so the finished interface can guide a visitor from a question to a confident next step.",
      "Pages are engineered mobile-first with stable layouts, accessible controls, efficient assets, and only the JavaScript the experience needs. Search metadata, structured data, measurement, and security controls are built into delivery rather than bolted on after launch."
    ],
    value: "A clear, fast, maintainable experience that customers, search engines, and the operating team can all understand.",
    scope: [
      "Corporate websites, service pages, landing pages, and campaigns",
      "Web applications, dashboards, forms, and integrations",
      "Ecommerce and order flows where they fit the business model",
      "Progressive web app capabilities when they create real value",
      "Responsive UX, accessibility, Arabic RTL, and English LTR",
      "Performance, technical SEO, analytics, and conversion tracking"
    ],
    deliverables: [
      "Sitemap, content hierarchy, user journeys, and calls to action",
      "Responsive design system for typography, spacing, and components",
      "Structured code with build, link, metadata, and schema checks",
      "Domain, deployment, monitoring, and backup configuration",
      "Handover documentation and a post-launch improvement plan"
    ],
    forWho: [
      "Companies that need a credible site generating qualified enquiries",
      "Local businesses building service pages for the Riyadh market",
      "Teams dealing with slow mobile UX or disorganized content",
      "Organizations that need a tailored web application or dashboard"
    ],
    steps: [
      { title: "Frame the decision", text: "Define users, intent, content, functionality, constraints, and acceptance criteria." },
      { title: "Design the system", text: "Create the information architecture, journeys, visual language, and responsive behavior." },
      { title: "Build and verify", text: "Implement, test devices and flows, validate accessibility, performance, security, and SEO." },
      { title: "Launch and learn", text: "Deploy with measurement and monitoring, then improve from observed user behavior." }
    ],
    faq: [
      ["Which technology will you use?", "The choice follows the content, integrations, editing needs, security, scale, budget, and maintenance model. The stack should serve the project rather than become the project."],
      ["Will I own the website and accounts?", "Ownership and access are defined before delivery. Wherever practical, the domain, hosting, analytics, and business accounts should remain under the client's control."],
      ["Is SEO included from the start?", "Technical foundations such as crawlability, metadata, canonical URLs, structured data, performance, and internal linking are part of the build. Ongoing content growth is scoped separately."],
      ["Can you redesign an existing website?", "Yes. I first identify what should be preserved, consolidated, migrated, or removed so a redesign does not discard useful equity or repeat the original problems."]
    ],
    keywords: ["web development Riyadh", "website design Saudi Arabia", "responsive application development"]
  }),
  service({
    slug: "google-support",
    number: "05",
    icon: "google",
    group: "Google & Local Visibility",
    title: "Google Product Support & Consulting",
    seoTitle: "Google Product Support & Consulting",
    h1: "Structured help for complex Google product and account issues",
    short: "Clear diagnosis of Google product issues, official support routes, evidence preparation, and realistic next steps without unsafe credential sharing or false guarantees.",
    meta: "Independent Google product support and consulting for account, ownership, verification, policy, and workflow issues using documented evidence and official support paths.",
    intro: [
      "Google cases often become harder when several accounts, permissions, policies, and support channels overlap. Repeating the same request or changing data without a diagnosis can make the history less clear. I reconstruct the timeline, separate technical faults from eligibility or ownership issues, and identify the decision that must be resolved.",
      "The engagement produces a concise case file: the affected product, non-sensitive identifiers, evidence, actions already taken, and the next official route. I never ask for passwords or verification codes, and I do not claim to control a decision made by Google."
    ],
    value: "A case that is easier to understand, safer to handle, and ready for the appropriate official support or recovery path.",
    scope: [
      "Account, permission, ownership, and access-path diagnosis",
      "Policy notices, rejection messages, and product-specific workflows",
      "Evidence and timeline organization for support requests",
      "Separation of technical errors from eligibility or policy decisions",
      "Safe account handoff and permission-cleanup recommendations",
      "Follow-up tracking without duplicating or fragmenting the case"
    ],
    deliverables: [
      "Plain-language diagnosis of the likely issue and dependencies",
      "Chronological case summary with relevant public or safe identifiers",
      "Evidence checklist tailored to the product and request type",
      "Recommended official support, recovery, or appeal route",
      "Follow-up notes and safeguards for future account ownership"
    ],
    forWho: [
      "Businesses receiving repeated rejection or verification messages",
      "Teams unsure which account owns a Google asset",
      "Organizations with fragmented permissions after staff changes",
      "Owners who need a clear case before contacting official support"
    ],
    steps: [
      { title: "Rebuild the timeline", text: "Collect messages, dates, safe identifiers, prior changes, and attempted support routes." },
      { title: "Classify the problem", text: "Distinguish access, technical, eligibility, ownership, and policy issues." },
      { title: "Prepare one clear case", text: "Match the evidence and explanation to the appropriate official channel." },
      { title: "Track and stabilize", text: "Record responses, avoid conflicting changes, and improve long-term ownership controls." }
    ],
    faq: [
      ["Are you employed by or officially representing Google?", "No. I provide independent consulting based on practical product experience and official support routes. Google retains control of product, policy, and account decisions."],
      ["Do you need my password or verification code?", "No. Never send passwords, one-time codes, recovery codes, or private API keys. Access, when genuinely required, should use the platform's proper user and permission controls."],
      ["Can you guarantee that Google will approve my request?", "No independent consultant can guarantee a platform decision. The value is in correcting avoidable issues, preparing relevant evidence, and using the right official path."],
      ["What should I send for an initial review?", "Share the product name, exact message, dates, public links, non-sensitive case IDs, and a brief list of changes or support attempts. Remove confidential data first."]
    ],
    keywords: ["Google product support consultant", "Google account issue help", "independent Google consultant Saudi Arabia"]
  }),
  service({
    slug: "google-business-profile",
    number: "06",
    icon: "pin",
    group: "Google & Local Visibility",
    title: "Google Business Profile Solutions",
    seoTitle: "Google Business Profile Help in Riyadh",
    h1: "Google Business Profile support grounded in eligibility and evidence",
    short: "Eligibility, ownership, verification, suspension, category, service-area, and consistency reviews aligned with Google guidance and the business's real operating model.",
    meta: "Independent Google Business Profile support in Riyadh for verification, suspension, ownership, categories, service areas, data consistency, and local visibility.",
    intro: [
      "A Business Profile works best when it accurately represents how a company operates in the real world. Before changing a name, address, service area, or category, I review eligibility, ownership, customer-facing evidence, the linked website, and the history of edits or notices. That diagnosis helps avoid changes that solve one symptom while creating another risk.",
      "For verification or suspension cases, the focus is on correcting the underlying issue once, preparing relevant evidence, and using the official route that matches the case. After the profile is stable, the work can move to services, content, consistency, reputation, and measurable local actions."
    ],
    value: "A more accurate and stable business profile, supported by organized evidence and a realistic local visibility plan.",
    scope: [
      "Eligibility review for storefront and service-area businesses",
      "Ownership, user access, duplicate, and recovery diagnosis",
      "Video verification preparation and evidence review",
      "Suspension, restriction, and reinstatement case preparation",
      "Name, category, services, hours, location, and service-area consistency",
      "Connection between the profile, website, content, and local measurement"
    ],
    deliverables: [
      "Profile health review with conflicts and risks clearly identified",
      "Evidence checklist matched to the business model and issue",
      "Correction and official review sequence with unnecessary changes removed",
      "Local completeness and website-alignment recommendations",
      "Post-resolution monitoring and ownership safeguards"
    ],
    forWho: [
      "Eligible businesses creating or verifying a new profile",
      "Owners dealing with a suspension, restriction, or rejected verification",
      "Teams that lost access or inherited unclear ownership",
      "Businesses with duplicate profiles or inconsistent local information"
    ],
    steps: [
      { title: "Confirm eligibility", text: "Understand the real business model, customer contact, location, and service area." },
      { title: "Audit data and history", text: "Review ownership, categories, website alignment, edits, notices, and previous attempts." },
      { title: "Correct and document", text: "Resolve the material issue and organize the evidence without repeated random changes." },
      { title: "Use the official route", text: "Submit or follow up through the matching verification, recovery, or appeal process." }
    ],
    faq: [
      ["Can you guarantee verification or reinstatement?", "No. Google makes the final decision. I can improve the quality of the diagnosis, correct avoidable inconsistencies, prepare relevant evidence, and guide the case through the appropriate official path."],
      ["Should I add keywords to the business name?", "The profile name should reflect the real name used by the business. Services, categories, the website, reputation, and useful content are safer ways to improve relevance."],
      ["What evidence may be useful?", "It depends on the business model and request. Common examples include registration documents, branded signage, access to the premises or equipment, domain email, and consistent customer-facing information."],
      ["Should I keep editing the profile while an appeal is pending?", "Usually it is safer to avoid unrelated changes that make the case harder to interpret. Correct the material issue, preserve the timeline, and follow the official instructions for that case."]
    ],
    keywords: ["Google Business Profile help Riyadh", "Google profile suspension Saudi Arabia", "business verification support"]
  }),
  service({
    slug: "knowledge-bases",
    number: "07",
    icon: "nodes",
    group: "Knowledge & Automation",
    title: "Knowledge Bases & Enterprise Search",
    seoTitle: "Knowledge Base & Enterprise Search Solutions",
    h1: "Knowledge systems that make trusted answers easier to find and maintain",
    short: "Organized, permission-aware knowledge bases that help teams find, maintain, cite, and reuse approved company information across search and AI experiences.",
    meta: "Knowledge base, enterprise search, and RAG solutions for companies, covering content structure, permissions, source quality, retrieval evaluation, and AI integration.",
    intro: [
      "When company knowledge is scattered across chats, folders, inboxes, and undocumented experience, people spend time searching and still act on outdated information. I begin with the questions employees or customers actually ask, then map the authoritative sources, owners, permissions, formats, and update cycles behind each answer.",
      "The solution may combine a structured knowledge base, search, semantic retrieval, or an AI assistant, but the foundation remains the same: clear ownership, traceable sources, controlled access, and measurable retrieval quality. Technology cannot compensate for conflicting documents with no accountable owner."
    ],
    value: "Faster access to approved knowledge, more consistent answers, and a foundation that can support safe AI automation.",
    scope: [
      "Knowledge inventories, content ownership, and source authority",
      "Taxonomy, metadata, lifecycle, and update workflows",
      "Keyword, filtered, semantic, and hybrid search experiences",
      "Document ingestion, chunking, retrieval, and citation design",
      "Role-based access and protection of sensitive material",
      "RAG and assistant integrations with repeatable evaluations"
    ],
    deliverables: [
      "Knowledge map showing sources, owners, audiences, and gaps",
      "Content structure, metadata model, and governance rules",
      "Search or retrieval prototype using approved information",
      "Evaluation set for findability, answer quality, and permissions",
      "Operating guide for updates, feedback, and quality monitoring"
    ],
    forWho: [
      "Teams losing time across fragmented documents and conversations",
      "Support organizations producing inconsistent answers",
      "Companies preparing trusted sources for an AI assistant",
      "Organizations that need different knowledge access by role"
    ],
    steps: [
      { title: "Map questions and sources", text: "Identify high-value questions, authoritative content, owners, users, and access constraints." },
      { title: "Design the knowledge model", text: "Define structure, metadata, lifecycle, permissions, and conflict resolution." },
      { title: "Build retrieval", text: "Implement the appropriate search and citation experience before adding unnecessary complexity." },
      { title: "Evaluate and govern", text: "Test real queries, monitor gaps, assign ownership, and improve from feedback." }
    ],
    faq: [
      ["Do we need AI to build a useful knowledge base?", "No. Good structure, search, ownership, and maintenance often create substantial value on their own. AI should be added only where it improves a defined user task."],
      ["Can the system search private documents?", "Yes, provided identity and permissions are enforced before retrieval and generation. A model should never become a shortcut around the source system's access controls."],
      ["How do you keep answers current?", "Each important source needs an owner, review trigger, status, and update workflow. Feedback and unanswered queries also reveal what requires revision."],
      ["How is retrieval quality tested?", "We use representative questions with expected sources, measure whether the right evidence is retrieved, and test ambiguous, missing, outdated, and unauthorized cases."]
    ],
    keywords: ["enterprise knowledge base", "semantic search business", "RAG solutions Saudi Arabia"]
  }),
  service({
    slug: "seo",
    number: "08",
    icon: "chart",
    group: "Visibility & Growth",
    title: "Technical, Content & Local SEO",
    seoTitle: "SEO Consultant in Riyadh | Technical & Local",
    h1: "SEO built around discoverability, useful pages, and qualified demand",
    short: "A measurable search strategy covering crawlability, indexing, information architecture, useful content, internal linking, local intent, and qualified conversions.",
    meta: "Technical, content, and local SEO services in Riyadh covering indexing, site architecture, performance, service content, Google Business Profile, and conversions.",
    intro: [
      "Search visibility rarely improves because one keyword was added to a page. It improves when a search engine can crawl, understand, trust, and select a useful answer—and when that answer helps the visitor complete a meaningful action. I review the technical foundation and the content decision journey together.",
      "The work begins with a baseline: indexed pages, search queries, rankings, traffic quality, local actions, and conversions. Issues are then prioritized by impact and dependency, separating foundational fixes from longer-term growth opportunities. No fixed ranking can be guaranteed, but the work and its evidence can be measured."
    ],
    value: "A search program with clearer priorities, stronger pages, and measurement tied to qualified enquiries rather than vanity traffic.",
    scope: [
      "Crawl, indexing, canonical, sitemap, schema, and redirect reviews",
      "Information architecture, internal links, and keyword intent mapping",
      "Service, location, guide, and comparison content strategy",
      "Mobile experience, performance, accessibility, and rendering",
      "Google Business Profile, consistency, reputation, and local relevance",
      "Search Console, analytics, lead actions, and query-level measurement"
    ],
    deliverables: [
      "Prioritized audit with evidence, impact, dependency, and owner",
      "Search-intent and page map that reduces duplication and cannibalization",
      "Technical, metadata, content, internal-link, and schema improvements",
      "Local visibility plan connecting the website and business profile",
      "Measurement framework for visibility, actions, and enquiry quality"
    ],
    forWho: [
      "Websites that are not being indexed or understood consistently",
      "Businesses attracting traffic that does not become qualified demand",
      "Local companies competing for service searches in Riyadh",
      "Teams preparing a migration, redesign, or content expansion"
    ],
    steps: [
      { title: "Establish the baseline", text: "Collect crawl, index, query, performance, local, and conversion evidence." },
      { title: "Map intent to pages", text: "Decide what each page should answer and where topics need consolidation or expansion." },
      { title: "Fix in dependency order", text: "Resolve access and architecture problems before scaling content production." },
      { title: "Measure qualified outcomes", text: "Track visibility and actions, then improve pages from evidence rather than assumptions." }
    ],
    faq: [
      ["How long does SEO take?", "Timing depends on the site's condition, competition, implementation speed, content quality, and search-engine processing. Early technical changes may be visible quickly, while competitive growth usually requires sustained work."],
      ["Can you guarantee first position?", "No. Rankings are controlled by search systems and change by query, location, device, competition, and context. A responsible engagement guarantees scope and evidence—not a fixed position."],
      ["Do you write content as part of SEO?", "Content strategy, briefs, editing, and page copy can be included. The priority is useful, differentiated content supported by expertise and a clear role in the site architecture."],
      ["Can you work with an existing developer?", "Yes. I can provide implementation-ready priorities, review completed changes, and work with the team on releases, migrations, structured data, and measurement."]
    ],
    keywords: ["SEO consultant Riyadh", "technical SEO Saudi Arabia", "local SEO Riyadh"]
  }),
  service({
    slug: "digital-advertising",
    number: "09",
    icon: "megaphone",
    group: "Visibility & Growth",
    title: "Digital Advertising & Landing Pages",
    seoTitle: "Google Ads & Landing Page Services in Saudi Arabia",
    h1: "Search campaigns and landing pages designed as one conversion system",
    short: "Intent-led campaigns and conversion-focused landing pages aligned around message, mobile speed, trust, analytics, and the quality of each enquiry.",
    meta: "Google Ads campaign management and conversion landing pages in Saudi Arabia, with search intent, negative keywords, tracking, mobile UX, and lead-quality review.",
    intro: [
      "Advertising cannot repair an unclear offer or a weak page. A strong campaign starts by deciding which search intent deserves budget, what promise can be supported, and what action the visitor should take. The ad, keyword, landing page, and follow-up process must tell one consistent story.",
      "I structure campaigns around tightly related intent, deliberate negatives, measurable actions, and pages designed for fast mobile decisions. Optimization is based on search terms, conversion evidence, and lead quality—not clicks alone. Platform results remain variable, so the process is transparent and test-driven."
    ],
    value: "Better alignment between paid demand and the customer journey, with clearer evidence about which enquiries deserve more budget.",
    scope: [
      "Offer, audience, intent, competitor, and account review",
      "Search campaign, ad group, keyword, and negative-keyword structure",
      "Original ad copy and useful extensions aligned with policy",
      "Dedicated landing pages with fast, focused mobile UX",
      "Call, WhatsApp, form, and qualified-lead measurement",
      "Search-term, budget, message, and landing-page optimization"
    ],
    deliverables: [
      "Campaign architecture and documented targeting assumptions",
      "Keyword and negative-keyword plan grounded in search intent",
      "Ad variants and a conversion-focused landing page",
      "Analytics and conversion checks with clear event definitions",
      "Reporting on spend, terms, actions, and lead quality"
    ],
    forWho: [
      "Service businesses that need qualified enquiries from search",
      "Teams sending paid traffic to a generic or slow homepage",
      "Accounts spending budget on irrelevant search terms",
      "Companies that need dependable conversion measurement"
    ],
    steps: [
      { title: "Define the commercial intent", text: "Clarify the offer, audience, service area, exclusions, economics, and conversion action." },
      { title: "Align campaign and page", text: "Build keyword groups, messages, proof, mobile UX, and measurement around the same promise." },
      { title: "Launch with controls", text: "Set budgets, locations, schedules, negatives, tracking checks, and review thresholds." },
      { title: "Optimize for quality", text: "Use search terms and enquiry outcomes to improve targeting, message, page, and spend." }
    ],
    faq: [
      ["What budget should I start with?", "The budget should reflect search demand, click costs, conversion economics, service capacity, and the amount of data needed to learn. It should not be chosen as an arbitrary platform minimum."],
      ["Do I need a separate landing page?", "Often yes. A focused page can match the search intent, remove distractions, strengthen proof, and make the conversion action easier to measure."],
      ["Can you guarantee leads or sales?", "No. Results depend on demand, competition, offer, pricing, response quality, and many factors outside the platform. I provide controlled tests, transparent measurement, and evidence-based optimization."],
      ["How do you judge campaign success?", "We examine relevant search terms, conversion rate, cost per meaningful action, qualified-lead rate, and downstream business feedback—not click-through rate in isolation."]
    ],
    keywords: ["Google Ads Saudi Arabia", "landing page design Riyadh", "paid search campaign management"]
  })
];

export const englishServiceBySlug = (slug) => englishServices.find((item) => item.slug === slug);

export const englishTopics = {
  "google-business-profile": {
    title: "Google Business Profile",
    description: "Practical guidance on eligibility, verification, suspension, ownership, business data, evidence, and the connection between a profile, its website, and local discovery.",
    icon: "pin",
    services: ["google-business-profile", "google-support", "seo"]
  },
  "local-seo-saudi": {
    title: "Local SEO in Saudi Arabia",
    description: "Strategies that connect technical foundations, service pages, business information, reputation, local relevance, and measurable enquiries across Saudi markets.",
    icon: "search",
    services: ["seo", "google-business-profile", "web-development"]
  },
  cybersecurity: {
    title: "Cybersecurity",
    description: "Decision-focused guidance for assessing risk, protecting websites and cloud systems, managing identity, testing recovery, and conducting authorized reviews.",
    icon: "shield",
    services: ["cybersecurity", "cloud-solutions", "web-development"]
  },
  "ai-agents": {
    title: "AI Agents & Automation",
    description: "Practical frameworks for building assistants around trusted knowledge, constrained tools, evaluation, human review, permissions, and measurable operational value.",
    icon: "spark",
    services: ["ai-agents", "knowledge-bases", "cloud-solutions"]
  },
  "web-development": {
    title: "Web & Application Development",
    description: "Guidance on responsive product design, content architecture, performance, accessibility, security, technical SEO, conversion measurement, and maintainable delivery.",
    icon: "code",
    services: ["web-development", "cybersecurity", "seo"]
  }
};

const article = (entry) => ({
  modified: "2026-08-30",
  readTime: "8 min read",
  ...entry
});

export const englishArticles = [
  article({
    slug: "google-business-profile-suspension",
    title: "Google Business Profile Suspended? Diagnose Before You Appeal",
    seoTitle: "Google Business Profile Suspension: A Practical Recovery Guide",
    description: "Diagnose a suspended Google Business Profile, correct the underlying issue, organize relevant evidence, and submit a focused reinstatement request.",
    excerpt: "A suspension is a signal to stop changing the profile, reconstruct what happened, and match the business model and evidence to Google's official review process.",
    category: "Google Business Profile",
    topic: "google-business-profile",
    relatedService: "google-business-profile",
    date: "2026-07-20",
    keywords: ["Google Business Profile suspension", "profile reinstatement", "Google Maps verification", "business evidence"],
    sections: [
      ["Treat the suspension as a diagnosis problem", "A suspended profile is not repaired by making many changes quickly. First preserve the notification, current profile data, ownership structure, recent edits, linked website, and any previous support conversations. Then identify whether the likely issue concerns eligibility, representation, address, service area, name, category, ownership, or evidence. This sequence protects the history and makes the eventual request easier to understand."],
      ["Confirm the business is eligible to be represented", "The business must interact with customers in a way that fits the profile model. A storefront needs a genuine customer-facing location during stated hours; a service-area business should represent where it actually travels and normally hide an address that is not staffed for customers. Virtual offices, borrowed addresses, and locations created mainly for ranking create material risk that better photos cannot solve."],
      ["Audit identity and website consistency", "Review the real-world business name, primary category, services, phone, domain, address or service area, and visible brand evidence. The linked website should reinforce the same entity and operating model. Avoid keyword additions that are not part of the established name, and avoid creating duplicate profiles for the same business. The objective is not perfect textual uniformity; it is a coherent and truthful representation."],
      ["Prepare evidence that answers the specific doubt", "Useful evidence depends on the case. Registration records may support the legal entity, while signage, workspace, tools, branded vehicles, access to the premises, domain email, and customer-facing materials can demonstrate operation and management. Select evidence that directly addresses the issue instead of uploading a large unrelated collection. Remove sensitive information that the process does not require."],
      ["Submit once, then keep the case stable", "Correct the underlying issue before submitting through the official reinstatement or verification route. Write a short factual explanation, connect each document to the point it proves, and record the case identifier. While the review is open, avoid unrelated profile changes or repeated submissions that fragment the history. If more information is requested, answer that request directly and keep a clean timeline."],
      ["Build a healthier profile after reinstatement", "Once the profile is stable, review users, recovery access, categories, services, hours, photos, website alignment, and local measurement. Monitor calls, directions, website clicks, and enquiry quality without treating any fixed ranking as guaranteed. Good local visibility comes from an eligible profile, a useful website, consistent business information, and a reputation built through genuine customer experiences."]
    ],
    faq: [
      ["Should I create a new profile after a suspension?", "Usually not. A duplicate can add ownership and policy complications. Diagnose the existing profile and use the official process unless Google specifically instructs otherwise."],
      ["How long does reinstatement take?", "There is no dependable fixed timeline. It varies with the case, evidence, workload, and whether additional review is required. Track the official case rather than opening repeated requests."],
      ["Can an agency guarantee reinstatement?", "No. Google makes the final decision. A consultant can improve diagnosis, corrections, evidence quality, and case organization, but cannot guarantee approval."],
      ["What should I avoid sending?", "Do not share passwords, one-time codes, recovery codes, or documents unrelated to the request. Redact unnecessary personal or financial details where the process permits."]
    ]
  }),
  article({
    slug: "secure-website-development",
    title: "Building a Fast, Secure, Search-Ready Website as One System",
    seoTitle: "Secure Website Development: Performance, UX & Technical SEO",
    description: "A complete website delivery framework that connects content architecture, responsive UX, performance, security, technical SEO, analytics, and maintainable operations.",
    excerpt: "The strongest websites do not treat design, speed, security, and search visibility as separate finishing tasks. They are designed together from the first decision.",
    category: "Web Engineering",
    topic: "web-development",
    relatedService: "web-development",
    date: "2026-07-19",
    keywords: ["secure website development", "mobile-first web design", "technical SEO", "website performance"],
    sections: [
      ["Start with the decision the visitor must make", "Before selecting a framework or drawing a homepage, define the audience, their questions, the evidence they need, and the action the business can support. This produces a sitemap and page hierarchy based on intent rather than internal departments. Each page should have one primary job, a clear next step, and enough context to help a visitor decide without hunting through decorative sections."],
      ["Design responsive behavior, not a desktop screenshot", "Mobile-first work considers narrow screens, touch targets, safe areas, keyboard behavior, content order, and variable text length from the beginning. The layout must also remain composed on tablets and wide desktops. Images receive stable dimensions, headings scale predictably, forms remain usable, and the interface is tested with real content rather than ideal placeholder copy."],
      ["Make performance an architectural constraint", "Speed is shaped by hosting, rendering, JavaScript, fonts, images, third-party scripts, caching, and content weight. Optimizing at the end is expensive because performance problems may be built into the architecture. Set a budget early, ship only necessary code, use efficient assets, preserve layout stability, and measure representative pages on realistic mobile conditions before launch."],
      ["Build security into identities and data flows", "Security begins with ownership, access, deployment, forms, integrations, and failure modes. Use least privilege, protected secrets, secure transport, appropriate headers, safe input handling, dependency review, backups, and a recovery plan. A public website may be simple, but the domain, analytics, hosting, repository, and business accounts still form an operational system that needs clear owners."],
      ["Give search engines the same clarity as users", "Descriptive titles, one clear heading, crawlable navigation, canonical URLs, redirects, sitemaps, structured data, internal links, and useful copy help search systems understand the site. They do not replace genuine relevance, but they prevent technical ambiguity. During a redesign, map old URLs carefully so valuable pages are consolidated or redirected instead of silently disappearing."],
      ["Launch with observability and ownership", "A launch checklist should cover devices, browsers, forms, calls, WhatsApp links, metadata, indexing controls, accessibility, analytics consent, backups, and monitoring. Assign ownership for content, dependencies, domains, and incident response. After launch, review real queries, user paths, errors, performance, and enquiry quality, then make small measured improvements instead of waiting for another complete redesign."]
    ],
    faq: [
      ["Which framework is best for a business website?", "There is no universal answer. The right choice depends on content, editing, integrations, security, scale, budget, and who will maintain the site."],
      ["Can a fast website still use animation?", "Yes, when motion supports comprehension and uses efficient properties. It should respect reduced-motion preferences and never delay or obscure the primary content."],
      ["Is technical SEO enough to rank?", "No. It removes access and interpretation problems, but useful differentiated content, reputation, relevance, and competition also shape visibility."],
      ["What should happen after launch?", "Monitor errors, performance, indexing, conversions, dependencies, backups, and content accuracy. The site should have an operating routine, not just a launch date."]
    ]
  }),
  article({
    slug: "professional-website-design-riyadh",
    title: "Professional Website Design in Riyadh: From Attention to Enquiry",
    seoTitle: "Professional Website Design in Riyadh | Conversion Guide",
    description: "How Riyadh businesses can turn service positioning, local context, evidence, mobile UX, and clear calls to action into a website that supports qualified enquiries.",
    excerpt: "A credible Riyadh website should help the right customer understand the offer, trust the business, and take the next step without adding friction or empty claims.",
    category: "Website Strategy",
    topic: "web-development",
    relatedService: "web-development",
    date: "2026-07-30",
    keywords: ["website design Riyadh", "business website Saudi Arabia", "conversion UX", "service page design"],
    sections: [
      ["Position the business before designing the page", "A website cannot communicate a value proposition the business has not clarified. Define the priority customer, the problem they are trying to solve, the service area, the proof available, and what makes the delivery approach credible. This gives the copy a point of view and prevents the homepage from becoming a long list of generic claims that could belong to any competitor."],
      ["Build pages around search and buying questions", "Customers may arrive through a branded search, a service query, a location query, a recommendation, or an advertisement. Give important services their own useful pages, then connect related questions, case studies, and contact paths. Local references should reflect the actual market and operating area rather than repeating Riyadh neighborhood names simply to manufacture pages."],
      ["Use proof with an honest boundary", "Live projects, process details, real photos, qualifications, public profiles, and clear contact information can reduce uncertainty. Explain what a case study demonstrates and what it does not. If verified conversion or revenue data is unavailable, do not invent it. Credibility grows when evidence is reviewable and claims remain proportionate to what the evidence proves."],
      ["Design for the phone in the customer's hand", "Many service enquiries begin on a mobile device, often while the customer is comparing several providers. Keep the opening message focused, use readable type, make call and WhatsApp actions accessible, avoid layout shifts, and ensure forms work with mobile keyboards. A polished desktop composition is not a substitute for a fast and understandable small-screen journey."],
      ["Connect content, technical SEO, and measurement", "The site needs crawlable links, clear titles, canonical URLs, structured data, strong performance, and pages that answer real questions. Measurement should distinguish a call click, a WhatsApp click, a prepared project message, and a qualified enquiry. Without definitions, the team may optimize for traffic or clicks that do not represent commercial progress."],
      ["Plan the handover before the build begins", "Decide who owns the domain, hosting, analytics, business profile, source code, and content updates. Record access and recovery methods, define the maintenance routine, and agree how new pages will be reviewed. A professional website remains useful because it can be operated safely after launch—not because its original designer is the only person who understands it."]
    ],
    faq: [
      ["How many pages does a professional company website need?", "Enough to explain the main decision journeys without creating thin repetition. The right number follows services, audiences, locations, evidence, and content capacity."],
      ["Should the website be Arabic, English, or both?", "Use the languages your customers genuinely need. Each version should be written for its audience, with equivalent navigation and correct language alternates—not produced as an unmanaged machine translation."],
      ["Is WhatsApp enough as a conversion path?", "It can be important, but calls, email, or a structured brief may suit different customers. Track each action and make the next step clear."],
      ["How should I evaluate a design proposal?", "Review information architecture, original content, responsive behavior, performance, accessibility, SEO foundations, ownership, testing, and maintenance—not screenshots alone."]
    ]
  }),
  article({
    slug: "technical-seo-saudi-businesses",
    title: "Technical SEO for Saudi Businesses: An Implementation Roadmap",
    seoTitle: "Technical SEO for Saudi Businesses | Practical Roadmap",
    description: "A technical SEO roadmap for Saudi companies covering crawlability, indexing, rendering, architecture, performance, structured data, and migrations.",
    excerpt: "Technical SEO is the discipline of removing ambiguity and access problems so valuable pages can be discovered, understood, consolidated, and measured correctly.",
    category: "Technical SEO",
    topic: "local-seo-saudi",
    relatedService: "seo",
    date: "2026-07-30",
    keywords: ["technical SEO Saudi Arabia", "SEO audit", "indexing issues", "site architecture"],
    sections: [
      ["Define the indexable inventory", "List every route the site intends to expose, then separate canonical pages from redirects, parameters, search results, drafts, and duplicates. A sitemap should reflect this deliberate inventory rather than every URL the platform can generate. Compare the list with actual search-engine indexing and server responses to identify valuable pages that are missing and low-value variations that are competing for attention."],
      ["Make crawling and rendering dependable", "Navigation and internal links should be present in the delivered HTML or rendered reliably without requiring fragile interactions. Check robots directives, response codes, canonical tags, language alternates, JavaScript rendering, and blocked resources. A page that looks correct to a logged-in editor may still be inaccessible, duplicated, or ambiguous to a crawler using a different path."],
      ["Build an architecture that reflects intent", "Group services and guidance into a hierarchy that both visitors and search systems can follow. Each important query family needs a clearly responsible page. Consolidate near-duplicates, link related pages with meaningful anchor text, and prevent service, location, and article pages from competing for the same purpose. The architecture should make expansion safer rather than multiplying thin pages."],
      ["Improve performance where it affects experience", "Measure representative pages on mobile and review server response, images, fonts, scripts, layout stability, and interaction delay. Core Web Vitals are useful signals, but the real objective is a page that becomes readable and usable quickly. Optimize the largest bottlenecks first and confirm that performance work does not break analytics, accessibility, or important content."],
      ["Use metadata and structured data precisely", "Titles and descriptions should distinguish the page and communicate its actual value. Structured data must describe visible, truthful content and use stable identifiers for the website, person, organization, service, article, and breadcrumb entities. Schema does not manufacture authority, but consistent entity relationships can remove confusion and support eligible search features."],
      ["Measure releases and protect migrations", "Connect technical changes to Search Console, analytics, conversions, and crawl evidence. During a redesign or domain change, map old URLs, preserve valuable content, implement direct permanent redirects, update canonicals and internal links, and monitor coverage after launch. Record the release date so changes in crawling, visibility, and enquiries can be interpreted rather than guessed."]
    ],
    faq: [
      ["What is the first technical SEO check?", "Confirm that the important pages return the right status, allow indexing, declare the intended canonical URL, and are linked from crawlable navigation or internal pages."],
      ["Should every page appear in the sitemap?", "No. Include canonical, indexable pages you want search engines to discover. Redirects, duplicates, internal search pages, and noindex content should normally be excluded."],
      ["Does structured data improve ranking?", "It helps search systems interpret eligible content but does not guarantee ranking. It must match visible content and comply with the relevant feature guidelines."],
      ["How often should a technical audit be repeated?", "Review continuously for critical signals and conduct deeper audits before and after major releases, migrations, platform changes, or unexplained visibility losses."]
    ]
  }),
  article({
    slug: "google-business-profile-riyadh-guide",
    title: "Google Business Profile in Riyadh: Build the Right Local Foundation",
    seoTitle: "Google Business Profile Riyadh | Practical Guide",
    description: "A Riyadh-focused guide to Google Business Profile eligibility, service areas, categories, website alignment, verification, reviews, and performance.",
    excerpt: "A strong profile begins with an eligible real-world business and accurate data, then earns visibility through relevance, consistency, reputation, and a useful website.",
    category: "Local Presence",
    topic: "google-business-profile",
    relatedService: "google-business-profile",
    date: "2026-07-30",
    keywords: ["Google Business Profile Riyadh", "Google Maps business", "service-area business", "local visibility"],
    sections: [
      ["Choose the profile model that matches the operation", "A Riyadh business may serve customers at a staffed location, travel to customers, or operate as a genuine hybrid. That distinction affects whether an address is displayed, which areas are selected, and what evidence may support verification. Do not create a storefront representation for an office that customers cannot visit, and do not use a service area as a substitute for a real operating footprint."],
      ["Use the business's real identity", "The name should reflect the name used in the market, not a string of services and neighborhoods. Select the most accurate primary category, then add relevant secondary categories and services without stretching beyond what the company provides. Keep phone, website, hours, and location information current. Accuracy may feel less aggressive than keyword stuffing, but it creates a safer and more understandable entity."],
      ["Prepare verification as a proof sequence", "Verification methods vary, and no specific method can be promised. If video is offered, plan a continuous sequence that can demonstrate the location or service model, branding, equipment, and authority to manage the business. Check that the profile and supporting materials tell the same story before recording. A second attempt should correct a known weakness rather than simply repeat the first."],
      ["Connect the profile to useful service pages", "The website should explain the same services, city coverage, contact details, and operating model shown on the profile. Link to the most useful canonical page, make calls and enquiries easy on mobile, and publish content that answers customer questions. Creating dozens of interchangeable neighborhood pages is not a durable local strategy; pages need distinct purpose and useful evidence."],
      ["Build a review process around real customers", "Ask customers after a completed, genuine interaction and make the request easy without prescribing sentiment. Do not buy reviews, use employees as customers, offer prohibited incentives, or organize bursts from the same device or network. Respond professionally, learn from recurring themes, and keep internal records so legitimate feedback can be explained if moderation systems remove it."],
      ["Measure actions, not a single map position", "Local results vary by search wording, distance, context, device, and competition. Review profile views, calls, directions, website clicks, search queries, landing-page conversions, and the quality of enquiries over time. Segment by service and area where possible. The goal is a stable source of qualified local demand, not a screenshot of one favorable ranking from one location."]
    ],
    faq: [
      ["Can a home-based service business use a profile?", "It may be eligible when it genuinely serves customers in person and follows the service-area rules. The address should normally be hidden if customers are not received there."],
      ["How many service areas should I add?", "Use a realistic area the business can actually serve. Adding distant cities does not create genuine relevance and may confuse customers."],
      ["Do more categories always improve visibility?", "No. Categories should accurately represent the business. Irrelevant categories can dilute clarity and create policy or conversion problems."],
      ["Should I create a profile for every Riyadh district?", "Only create separate profiles for genuine eligible locations or operations. Virtual or duplicate locations created for ranking are risky and do not replace useful local pages."]
    ]
  }),
  article({
    slug: "ai-agents-for-business-saudi",
    title: "AI Agents for Saudi Businesses: Build Value Before Autonomy",
    seoTitle: "AI Agents for Saudi Businesses | Safe, Measurable Delivery",
    description: "A practical framework for Saudi businesses adopting AI agents, covering use cases, trusted knowledge, permissions, evaluation, human approval, and rollout.",
    excerpt: "The safest path to useful AI is a narrow business task, trusted sources, constrained tools, measurable evaluations, and explicit human accountability.",
    category: "AI Agents",
    topic: "ai-agents",
    relatedService: "ai-agents",
    date: "2026-07-21",
    modified: "2026-09-07",
    keywords: ["AI agents Saudi Arabia", "business automation", "enterprise AI", "AI evaluation"],
    sections: [
      ["Choose a task with a reviewable outcome", "Begin with a workflow that consumes meaningful time and produces an output a person can judge. Good candidates have repeatable inputs, identifiable sources, known exceptions, and a clear escalation route. Avoid starting with a vague instruction to automate the whole department. A narrow first task creates reliable evidence about value, risk, data readiness, and the effort required to operate the system."],
      ["Prepare knowledge before connecting a model", "List the documents, systems, and people that currently answer the task. Decide which source is authoritative when content conflicts, who owns updates, and which users may see which information. Clean obvious duplication and define retention requirements. Retrieval quality depends more on the source system and evaluation questions than on uploading every available file to a vector database."],
      ["Constrain tools and permissions", "An agent that drafts an answer has a different risk profile from one that changes records, sends messages, or triggers payments. Use least privilege, separate read and write capabilities, require approval for consequential actions, and record tool calls. Define prohibited actions and a reliable stop mechanism. The system should fail safely when identity, context, or confidence is insufficient."],
      ["Evaluate behavior with realistic cases", "Build a fixed test set from actual tasks, including normal requests, ambiguous wording, missing data, conflicting sources, unauthorized requests, and adversarial instructions. Measure source correctness, task success, critical errors, refusal quality, human intervention, latency, and cost. Re-run the suite whenever the model, prompt, retrieval logic, tools, or knowledge sources change."],
      ["Launch to a small group with visible ownership", "Start with informed users who can report mistakes and understand when to escalate. Provide a feedback path, observe logs, and distinguish system failure from missing or poor source content. Assign a business owner for the workflow, a content owner for the knowledge, and a technical owner for reliability and access. Without ownership, pilots quietly become unsupported production systems."],
      ["Scale only where the evidence supports it", "Compare time saved, quality, adoption, escalation, risk, and total operating cost against the previous process. Expansion may mean more users, additional knowledge, or a new tool—but change one dimension at a time. Some tasks will remain unsuitable for autonomy, and a copilot or better search interface may be the stronger long-term design. Restraint is part of successful AI engineering."]
    ],
    faq: [
      ["What is the best first AI-agent use case?", "Choose a frequent task with trusted inputs, a reviewable output, limited consequence, and enough examples to evaluate. Internal knowledge support is often safer than autonomous external action."],
      ["Can an agent work in Arabic and English?", "Yes, but both languages need representative content and evaluation cases. Quality should be measured separately because retrieval, terminology, and user expectations differ."],
      ["How much autonomy should the first version have?", "Usually very little. Begin with read-only access or draft generation, add explicit approval for actions, and expand only after behavior is measured."],
      ["Which AI model should we choose?", "Choose after defining quality, latency, privacy, context, tool use, and cost requirements. A repeatable evaluation is more valuable than selecting by benchmark reputation alone."]
    ]
  }),
  article({
    slug: "cybersecurity-assessment-small-business",
    title: "Cybersecurity Assessment for Small Businesses: A Risk-First Plan",
    seoTitle: "Small Business Cybersecurity Assessment | Practical Guide",
    description: "A practical small-business cybersecurity assessment covering critical assets, identity, websites, cloud services, backups, vendors, and incident readiness.",
    excerpt: "Small businesses do not need a smaller copy of an enterprise program. They need a focused view of the systems that could interrupt revenue, expose data, or lock out the team.",
    category: "Cybersecurity",
    topic: "cybersecurity",
    relatedService: "cybersecurity",
    date: "2026-07-30",
    keywords: ["small business cybersecurity", "security assessment", "website security", "risk remediation"],
    sections: [
      ["Inventory what keeps the business operating", "List domains, websites, email, cloud platforms, payment or customer systems, business profiles, repositories, devices, and third-party services. Record the owner, administrator, recovery contact, data sensitivity, and operational impact of loss. This inventory does not need to be a perfect enterprise database; it needs to reveal the accounts and dependencies whose failure would stop work or damage trust."],
      ["Secure identity before adding more tools", "Most small teams depend heavily on a few administrator accounts. Enable strong multi-factor authentication, remove former users, avoid shared credentials, review recovery methods, and keep emergency access controlled. Use separate accounts for administration and daily work where practical. A security product cannot compensate for an attacker who can reset the domain, email, cloud, and business accounts through one poorly protected identity."],
      ["Review public systems and common failure paths", "Check updates, dependencies, exposed services, TLS, headers, authentication, forms, uploads, APIs, secrets, and deployment configuration within an authorized scope. Examine how customer data enters, where it travels, and who can access it. Active testing needs permission and boundaries. The objective is to find meaningful risk without destabilizing a live system or collecting unnecessary sensitive data."],
      ["Test backups as a recovery process", "A backup is useful only when it is recent enough, isolated from the incident, and restorable within the time the business can tolerate. Identify systems that require backup, retention, encryption, and recovery owners. Perform a controlled restore test and document the sequence. Include domain, configuration, and credential recovery—not only application files—because those dependencies often determine actual downtime."],
      ["Account for vendors and integrations", "Website plugins, marketing tools, payment services, contractors, cloud providers, and shared drives extend the attack surface. Record what each provider can access, how permissions are granted, how incidents are communicated, and how access is removed. Reduce dormant integrations and broad API keys. Vendor reputation matters, but configuration and lifecycle ownership remain the customer's responsibility."],
      ["Prioritize remediation and rehearse response", "Rank findings by likely business impact, exploitability, exposure, and fix dependency. Assign an owner and acceptance check to every priority item. Create a short incident plan covering who can disable access, preserve evidence, contact providers, communicate internally, and restore service. A concise plan rehearsed once is more useful than a long policy nobody can locate during an incident."]
    ],
    faq: [
      ["How often should a small business assess security?", "Review core controls continuously and conduct a structured assessment at least after major platform, staff, or integration changes, and whenever suspicious activity appears."],
      ["Is antivirus enough for a small company?", "No. Endpoint protection helps, but identity, updates, backups, access, websites, cloud configuration, vendors, and incident response also matter."],
      ["Do we need penetration testing?", "It depends on exposure, data, risk, and maturity. A configuration and architecture review may identify higher-priority issues first. Any active test requires authorization."],
      ["What should be fixed first?", "Prioritize exposed administrator access, weak recovery, known critical vulnerabilities, unprotected secrets, and backups that cannot be restored—then work through dependencies."]
    ]
  }),
  article({
    slug: "secure-cloud-solutions-guide",
    title: "Secure Cloud Solutions: Design for Operations, Not Just Deployment",
    seoTitle: "Secure Cloud Solutions | Architecture & Operations Guide",
    description: "A secure cloud design guide covering workload requirements, environments, identity, networks, secrets, observability, backups, migration, recovery, and cost governance.",
    excerpt: "Cloud reliability comes from explicit boundaries, ownership, monitoring, and tested recovery—not from selecting the largest set of managed services.",
    category: "Cloud Architecture",
    topic: "cybersecurity",
    relatedService: "cloud-solutions",
    date: "2026-07-30",
    keywords: ["secure cloud architecture", "cloud migration", "cloud monitoring", "backup and recovery"],
    sections: [
      ["Translate business expectations into technical requirements", "Document usage patterns, critical journeys, data sensitivity, geographic needs, dependencies, budget, acceptable downtime, and recovery objectives. A marketing site, transactional application, internal dashboard, and AI workload need different tradeoffs. The architecture should be able to explain why each service exists and what failure it contains. Complexity without a requirement becomes operating cost and a larger attack surface."],
      ["Separate environments and ownership boundaries", "Development, testing, and production should not share broad credentials, data, or deployment paths by default. Define accounts or projects, network boundaries, service ownership, and promotion between environments. Use infrastructure definitions and documented changes where they reduce drift. Separation is valuable only if the team understands which environment is authoritative and how a release can be reversed."],
      ["Design identity, secrets, and network access together", "Grant users and workloads only the permissions required for their role, protect high-impact administration with stronger authentication, and avoid long-lived keys where managed identities are available. Store secrets outside source code and rotate them deliberately. Restrict network exposure to required paths, but remember that private networking does not replace identity, application validation, or observability."],
      ["Make failure visible before customers report it", "Collect logs, metrics, traces, health checks, and audit events that answer operational questions. Alert on symptoms that require action, not every noisy signal. Dashboards should show availability, latency, error rate, capacity, security events, and meaningful business flows. Test who receives an alert, what context they see, and which runbook or escalation action follows."],
      ["Treat backups as one layer of continuity", "Define what is backed up, frequency, retention, encryption, isolation, and recovery responsibility. Restore data in a test environment and verify application consistency. Also document domain, certificate, configuration, secret, and provider-account recovery. High availability may reduce some outages, but it does not protect against accidental deletion, compromise, or a bad deployment in the same way a tested backup does."],
      ["Migrate in stages and govern cost", "Map dependencies, establish observability, test representative load, and move low-risk components before critical traffic. Set rollback conditions and keep the old path available until acceptance criteria are met. After cutover, review reserved capacity, autoscaling, storage lifecycle, logs, data transfer, and idle resources. Cost optimization should preserve reliability and security rather than simply shrinking everything."]
    ],
    faq: [
      ["Is one cloud provider more secure than another?", "Major providers offer strong capabilities, but security depends heavily on architecture, identity, configuration, operations, and team skill. Provider choice alone does not create a secure system."],
      ["Should every workload use containers or Kubernetes?", "No. Choose the simplest operating model that meets deployment, scale, isolation, and reliability needs. Additional orchestration creates its own cost and failure modes."],
      ["How do we set recovery objectives?", "Tie recovery time and acceptable data loss to business impact, then test whether architecture, backups, people, and dependencies can actually meet them."],
      ["When is a migration complete?", "After production flows are verified, monitoring and recovery work, ownership is documented, rollback is closed deliberately, and cost and performance are reviewed."]
    ]
  }),
  article({
    slug: "knowledge-base-search-business",
    title: "Build a Business Knowledge Base People Can Actually Search",
    seoTitle: "Business Knowledge Base & Search Guide",
    description: "Build a governed business knowledge base with clear ownership, useful structure, permissions, hybrid search, retrieval evaluation, and AI readiness.",
    excerpt: "Knowledge becomes operational when people can find the right answer, understand its source and freshness, and know who owns the next update.",
    category: "Knowledge Systems",
    topic: "ai-agents",
    relatedService: "knowledge-bases",
    date: "2026-07-30",
    keywords: ["business knowledge base", "enterprise search", "semantic retrieval", "RAG knowledge system"],
    sections: [
      ["Begin with questions, not folders", "Interview users and collect the questions that slow work, create inconsistent answers, or require escalation. Group them by audience, decision, frequency, and consequence. Then trace each question to the source currently used. This reveals whether the real problem is discoverability, conflicting policies, missing ownership, poor access, or knowledge that exists only in an experienced employee's memory."],
      ["Establish source authority and ownership", "For each policy, procedure, product fact, or customer answer, identify the authoritative source, content owner, approval status, review date, and superseded versions. Decide how conflicts are resolved. A search system can retrieve several documents perfectly and still produce a wrong answer if the organization has never decided which document governs the case."],
      ["Design structure and metadata for real filtering", "Use a taxonomy people understand, supported by metadata such as product, region, audience, status, language, owner, and effective date. Avoid creating an elaborate classification system no one will maintain. Combine navigation for predictable browsing with search for direct questions. Good structure also makes access rules, lifecycle automation, and content analytics more precise."],
      ["Choose keyword, semantic, or hybrid retrieval deliberately", "Keyword search remains strong for exact codes, names, and terminology; semantic search can help with natural-language variation; filters narrow the context; and reranking can improve relevance. Hybrid approaches often work best, but only evaluation can confirm that. Retrieval should preserve source links, permissions, and enough surrounding context for the user to judge the result."],
      ["Evaluate missing, ambiguous, and unauthorized cases", "Create a question set with expected documents and acceptable answers. Include outdated content, similar terms, no-answer cases, permission boundaries, and different languages. Measure whether the right source appears, whether the answer is supported, and whether sensitive content remains hidden. A helpful system must be able to say that information is unavailable or requires an authorized person."],
      ["Operate the knowledge lifecycle", "Give users a way to flag incorrect or missing content, then route feedback to an accountable owner. Monitor unsuccessful searches, stale pages, repeated escalations, and content that is retrieved but not useful. Review changes before publication, archive obsolete versions, and rerun evaluations after major updates. AI readiness is an outcome of this governance, not a replacement for it."]
    ],
    faq: [
      ["Which documents should we add first?", "Start with high-demand, high-consequence sources that have an identified owner. Do not ingest everything before deciding what is authoritative."],
      ["Can one search system cover several repositories?", "Yes, but identity, permissions, metadata, freshness, and source links must remain reliable across connectors."],
      ["Is vector search required?", "No. Exact search and filters may be better for codes and names. Use semantic retrieval where it improves tested user questions, often within a hybrid design."],
      ["How do we know the knowledge base is working?", "Measure time to answer, successful retrieval, unanswered queries, source accuracy, content freshness, feedback resolution, and reduction in avoidable escalations."]
    ]
  }),
  article({
    slug: "landing-pages-google-ads",
    title: "Google Ads Landing Pages: Match the Search, Message, and Next Step",
    seoTitle: "Google Ads Landing Pages | Conversion-Focused Design Guide",
    description: "A practical guide to Google Ads landing pages covering search intent, message match, mobile UX, proof, forms, tracking, experimentation, and qualified-lead feedback.",
    excerpt: "Paid traffic becomes useful when the keyword, ad, page, offer, and follow-up process all serve the same customer decision and measurable action.",
    category: "Advertising & Conversion",
    topic: "web-development",
    relatedService: "digital-advertising",
    date: "2026-07-30",
    keywords: ["Google Ads landing page", "conversion-focused design", "paid search", "lead quality"],
    sections: [
      ["Choose one intent for each page", "A person searching for emergency repair, a price estimate, a specialist consultation, or general information is making a different decision. Group campaigns around closely related intent and give each important group a page that answers that situation. Sending every click to a broad homepage forces the visitor to rediscover the message they already responded to and makes performance harder to interpret."],
      ["Continue the promise made in the ad", "The opening heading should confirm the service, context, and next step without copying the advertisement mechanically. Explain who the offer is for, what the process involves, and what can genuinely be promised. Keep location and availability claims accurate. Strong message match reduces confusion; exaggerated claims may create clicks but damage trust, policy compliance, and lead quality."],
      ["Design a decisive mobile experience", "Show the primary value and action early, use readable type, stable media, and tap-friendly controls, and remove navigation that distracts from the campaign goal. Calls, WhatsApp, and forms should be easy to use without obscuring essential content. Test slow networks and common screen sizes because campaign traffic often arrives on mobile under impatient, comparison-heavy conditions."],
      ["Use proof that helps this decision", "Select case studies, photos, process details, credentials, reviews, and answers that reduce the specific risk behind the search. A visitor looking for a security review needs different proof from one looking for a contractor website. Avoid generic counters that cannot be verified. State boundaries clearly when outcomes depend on the customer's situation or a third-party platform."],
      ["Measure meaningful actions correctly", "Define each conversion before launch and test it from ad click to confirmation. Distinguish call clicks, connected calls where available, WhatsApp opens, completed forms, and qualified opportunities. Preserve campaign parameters without sending sensitive form content to analytics. A tracking event proves an interface action, not necessarily a sale, so reporting needs downstream business feedback."],
      ["Optimize from search terms and lead quality", "Review the actual queries that triggered ads, add negatives, refine match types, and compare message and page performance. Feed back which enquiries were relevant, contactable, and commercially viable. Run tests with a clear hypothesis and sufficient volume; avoid changing targeting, ad copy, page layout, and conversion definitions simultaneously because the result will be impossible to diagnose."]
    ],
    faq: [
      ["Should every ad group have a separate landing page?", "Not automatically. Create a separate page when intent, offer, proof, location, or action is meaningfully different. Avoid thin pages that only swap keywords."],
      ["How long should a landing page be?", "Long enough to answer the decision and address risk. A simple urgent service may need less explanation than a high-value technical engagement."],
      ["Which conversion should be primary?", "Choose the action closest to a qualified business outcome that can be measured reliably, then track supporting actions separately."],
      ["When should we redesign the page?", "First diagnose search intent, traffic quality, device behavior, speed, and tracking. A low conversion rate does not always mean the visual design is the cause."]
    ]
  }),
  article({
    slug: "website-maintenance-security-seo",
    title: "Website Maintenance After Launch: Security, Speed, SEO, and Recovery",
    seoTitle: "Website Maintenance Guide | Security, Performance & SEO",
    description: "An operating guide to website ownership, updates, backups, monitoring, security, performance, content, indexing, analytics, and recovery testing.",
    excerpt: "A website is not finished at launch. It becomes a small operational system with accounts, dependencies, content, measurement, and recovery responsibilities.",
    category: "Website Operations",
    topic: "web-development",
    relatedService: "web-development",
    date: "2026-07-30",
    keywords: ["website maintenance", "website security updates", "SEO monitoring", "backup recovery"],
    sections: [
      ["Assign ownership for every critical dependency", "Record who controls the domain, DNS, hosting, repository, deployment, content system, analytics, business profile, email, and third-party integrations. Use named accounts rather than shared credentials where possible, protect administrators with multi-factor authentication, and keep recovery methods current. Maintenance fails when everyone assumes someone else owns the account that expires or becomes inaccessible."],
      ["Update with a release process", "Dependencies, plugins, frameworks, server images, and integrations need security and compatibility updates. Review the change, test it in a safe environment, verify critical journeys, and preserve a rollback path. Automatic updates may suit low-risk components, while high-impact changes need deliberate scheduling. Record what changed so a later performance, security, or indexing problem can be traced to a release."],
      ["Monitor availability, errors, and user journeys", "Use uptime checks, error reporting, logs, security signals, and analytics that respect user consent. Alerts should reach an owner with enough context to act. Test calls, WhatsApp, forms, payments, authentication, and other core journeys regularly. A homepage returning a successful response does not prove that the customer can complete the action that matters."],
      ["Protect speed as content and features grow", "New images, fonts, scripts, widgets, campaigns, and tracking tags gradually erode performance. Review representative pages on mobile, measure server response, layout stability, interaction delay, and asset weight, then fix the largest regression. Add performance checks to publishing and release workflows so speed remains a design constraint instead of an occasional cleanup project."],
      ["Maintain search integrity and content accuracy", "Monitor indexing, crawl errors, canonical URLs, redirects, sitemaps, structured data, titles, internal links, and pages losing useful traffic. Update services, hours, contact details, team information, and legal text when the business changes. Consolidate obsolete pages intentionally and redirect old URLs. Freshness means accuracy and usefulness, not changing a date without substantive review."],
      ["Test backup and incident recovery", "Back up the data and configuration needed to restore service, isolate copies appropriately, and test recovery on a schedule. Document who can change DNS, revoke access, restore the application, contact providers, and communicate with customers. Run a short recovery exercise after major architecture changes. The value of a backup is proven by a successful restore within the business's tolerated time."]
    ],
    faq: [
      ["How often should a website be maintained?", "Monitoring is continuous; updates and content reviews follow risk and change frequency. Critical security issues should not wait for a monthly calendar."],
      ["Can maintenance be fully automated?", "Routine checks can be automated, but someone must review alerts, test business flows, approve risky changes, and make content and risk decisions."],
      ["What belongs in a website backup?", "Application data, uploads, configuration, and any other state required for recovery. Domain, credentials, secrets, and provider access need separate recovery documentation."],
      ["How can we tell maintenance is effective?", "Track availability, unresolved errors, update lag, successful restores, performance regressions, security findings, indexing health, and conversion-path failures."]
    ]
  }),
  article({
    slug: "local-seo-riyadh-service-business",
    title: "Local SEO in Riyadh for Service Businesses: A Connected Strategy",
    seoTitle: "Local SEO in Riyadh for Service Businesses | Practical Guide",
    description: "A local SEO strategy for Riyadh service businesses connecting website structure, Business Profile, real coverage, reputation, content, and lead quality.",
    excerpt: "Local visibility improves when the website, business profile, real service model, reputation, and customer journey reinforce the same trustworthy entity.",
    category: "Local SEO",
    topic: "local-seo-saudi",
    relatedService: "seo",
    date: "2026-07-30",
    keywords: ["local SEO Riyadh", "service business SEO", "Google Maps visibility", "Riyadh search marketing"],
    sections: [
      ["Map the real service model and coverage", "Define which services are commercially important, where the team can actually deliver them, whether customers visit a location, and how enquiries are handled. Riyadh is broad and competitive, but listing every district does not create relevance. The website and Business Profile should describe genuine coverage in a way customers can understand and operations can fulfill."],
      ["Give each important service a useful destination", "Build a clear page for each distinct service or decision journey, supported by evidence, process, frequently asked questions, and an appropriate call to action. Use one Riyadh page when the local context is meaningfully different, then discuss districts where they add operational or customer value. Avoid manufacturing near-identical pages that compete with one another and offer no unique answer."],
      ["Align the website and Business Profile", "Keep the real business name, phone, website, hours, category, services, address or service area, and operating model coherent. The linked site should make the same entity easy to verify and contact. Profile posts or photos cannot compensate for an ineligible location or a website that describes a different business. Fix foundational conflicts before chasing optimization tactics."],
      ["Earn reputation through real customer experience", "Request reviews after genuine completed work, without dictating wording or manufacturing sentiment. Make the process accessible, respond professionally, and use recurring customer questions to improve service pages. Beyond reviews, relevant local relationships, directories, associations, suppliers, and editorial mentions can strengthen discovery when they reflect real participation rather than paid bulk listings."],
      ["Build technical clarity for local pages", "Ensure important pages are crawlable, indexable, fast, mobile-friendly, canonically consistent, and linked from navigation or relevant content. Use structured data that matches visible facts, descriptive titles, and accurate breadcrumbs. Remove redirect chains and duplicate variants. Technical SEO does not create local demand, but it prevents strong pages from becoming invisible or ambiguous."],
      ["Measure visibility through qualified enquiries", "Track Search Console queries, landing pages, Business Profile actions, call and WhatsApp clicks, completed forms, direction requests, and downstream lead quality. Compare by service and period, and annotate major site or profile changes. Map rankings are location-dependent, so combine directional visibility checks with business outcomes. The objective is profitable local demand, not a fixed position everywhere in Riyadh."]
    ],
    faq: [
      ["Do I need a page for every Riyadh neighborhood?", "No. Create a location page only when it offers distinct, useful information. Thin neighborhood pages can dilute quality and compete with stronger service pages."],
      ["Can a service-area business rank without showing an address?", "Eligible service-area businesses can hide the address and use realistic service areas. Visibility still depends on relevance, distance, prominence, competition, and other signals."],
      ["Are reviews the most important local factor?", "Reviews matter, but they work alongside eligibility, relevance, proximity, website quality, business information, reputation, and competition. No single tactic controls the results."],
      ["How should local SEO success be reported?", "Combine visibility and query data with profile actions, page engagement, calls, messages, forms, booked work, and lead quality by service where possible."]
    ]
  }),
  article({
    slug: "ecommerce-development-saudi",
    title: "Ecommerce Development in Saudi Arabia: Design the Whole Buying Journey",
    seoTitle: "Ecommerce Development in Saudi Arabia | UX, Security & SEO",
    description: "A Saudi ecommerce guide covering product discovery, mobile UX, checkout, payments, shipping, bilingual content, security, SEO, analytics, and operations.",
    excerpt: "A successful store is more than a catalog and payment button. Discovery, trust, checkout, fulfillment, support, measurement, and ownership must work as one system.",
    category: "Ecommerce Development",
    topic: "web-development",
    relatedService: "web-development",
    date: "2026-08-12",
    keywords: ["ecommerce development Saudi Arabia", "online store UX", "ecommerce SEO", "secure checkout"],
    sections: [
      ["Model the commercial and operational journey", "Define products, variants, inventory, pricing, tax, promotions, payment methods, delivery areas, returns, support, and fulfillment ownership before choosing the platform. The interface can only promise what operations can deliver. Map normal orders and exceptions such as failed payments, unavailable stock, changed addresses, partial fulfillment, refunds, and customer disputes."],
      ["Design product discovery for mobile customers", "Use categories, filters, search, recommendations, and navigation that reflect how customers compare products. Product pages need clear imagery, dimensions, options, price, availability, delivery expectations, returns, and trustworthy calls to action. On mobile, preserve readable content and accessible controls without covering important details with persistent promotional or chat elements."],
      ["Reduce checkout uncertainty", "Ask only for information required to fulfill and support the order, explain costs before the final step, preserve entered data after recoverable errors, and make validation specific. Offer appropriate payment choices through reputable providers and communicate the order state clearly. Guest checkout can reduce friction, while accounts should create visible customer value rather than becoming a compulsory barrier."],
      ["Protect identity, payments, and administration", "Keep card handling within suitable payment-provider flows, protect administrator accounts with strong authentication, use least privilege, secure secrets, validate inputs, review extensions and dependencies, and monitor suspicious behavior. Define who can change prices, refunds, users, and payment settings. Back up state that is not recoverable from providers and test incident and recovery procedures."],
      ["Build SEO into the catalog architecture", "Give products and categories stable canonical URLs, useful titles, descriptive copy, structured data, internal links, and index controls for filters and parameters. Handle unavailable products intentionally instead of deleting every URL. Use Arabic and English content written for each audience, with correct language alternates. Avoid mass-generated descriptions that add no decision value."],
      ["Measure beyond the purchase event", "Track product views, search use, cart actions, checkout steps, payment outcomes, completed orders, returns, support contacts, and acquisition source while respecting consent and privacy. Validate analytics against backend order data. Review conversion by device, category, traffic intent, and new versus returning customers, but pair the numbers with margin, fulfillment cost, cancellation, and customer satisfaction."]
    ],
    faq: [
      ["Which ecommerce platform should a Saudi business use?", "Choose based on catalog, operations, integrations, languages, payments, shipping, ownership, customization, scale, and the team's ability to maintain it."],
      ["Should an online store support Arabic and English?", "Use both when the customer base requires them. Each language needs accurate product content, navigation, transactional messages, and correct direction and language metadata."],
      ["How can checkout abandonment be reduced?", "Clarify total cost and delivery, simplify required fields, support appropriate payments, improve mobile usability and speed, and diagnose errors with funnel data."],
      ["What should happen to discontinued product pages?", "Assess demand, links, substitutes, and whether the product may return. Keep a useful page, redirect to a close replacement, or retire it with the appropriate status deliberately."]
    ]
  })
];

export const englishArticleBySlug = (slug) => englishArticles.find((item) => item.slug === slug);

export const englishProjectStudies = {
  "tawod-contracting": {
    title: "Tawod General Contracting",
    category: "Contracting company website",
    description: "A structured digital presence for a Riyadh contracting company, combining service architecture, project storytelling, technical SEO, and direct conversion paths across mobile and desktop.",
    objective: "Turn a broad contracting offer into a credible, navigable website where prospective clients can understand the relevant service, review the company's capabilities, and reach a clear contact action without navigating a generic corporate brochure.",
    scope: [
      "Information architecture for contracting services and supporting content",
      "Responsive Arabic-first interface across phones, tablets, and desktops",
      "Service pages, project presentation, and conversion-oriented contact paths",
      "Technical SEO foundations, metadata, structured data, and crawl controls",
      "Performance, accessibility, deployment, and operational handover"
    ],
    decisions: [
      "Organize the site around customer service intent rather than internal departments.",
      "Use a confident visual system that supports construction imagery without reducing readability.",
      "Keep call and WhatsApp paths visible while preserving enough context for an informed enquiry.",
      "Build reusable page patterns so the company can expand services and articles consistently."
    ],
    delivered: [
      "A live multi-page company website with responsive navigation",
      "Dedicated service and editorial page structures",
      "Search metadata, canonical routes, sitemap, and structured information",
      "Direct call and WhatsApp journeys across representative devices",
      "A maintainable foundation for future portfolio and content growth"
    ]
  },
  "bowdy-labs": {
    title: "BOWDY LABS",
    category: "AI and technology company website",
    description: "A future-facing corporate experience that turns an advanced portfolio spanning AI, cloud, cybersecurity, and automation into a focused, responsive, and extensible website.",
    objective: "Present a technically ambitious company without burying decision-makers in jargon, while giving each capability enough structure to support credibility, discovery, and future product or service expansion.",
    scope: [
      "Brand-led interface system for a multidisciplinary technology company",
      "Capability architecture across AI, cloud, security, and automation",
      "Responsive interaction design and content hierarchy",
      "Reusable sections for services, proof, insight, and contact",
      "Performance-conscious implementation and deployment"
    ],
    decisions: [
      "Use a strong technology aesthetic while keeping copy and navigation commercially legible.",
      "Separate capabilities into clear decision paths rather than one dense innovation narrative.",
      "Balance motion and atmosphere with responsive performance and content access.",
      "Create modular components that can accommodate new services and evidence later."
    ],
    delivered: [
      "A live corporate website with a distinctive technology identity",
      "Responsive pages and reusable presentation components",
      "Structured capability messaging for several technical disciplines",
      "Clear routes from exploration to business contact",
      "An extensible code and content foundation"
    ]
  },
  "sama-scan": {
    title: "Sama Scan Center",
    category: "Multi-page healthcare website",
    description: "A clear medical imaging website for a Riyadh center, designed to explain sensitive services responsibly, support local discovery, and keep booking and contact paths easy on every device.",
    objective: "Help patients and referrers understand available imaging services, practical visit information, and the next contact step in a calm experience that avoids unnecessary friction or unsupported medical claims.",
    scope: [
      "Healthcare-oriented information architecture and service pages",
      "Mobile-first Arabic interface with accessible content hierarchy",
      "Local contact, location, and booking-oriented journeys",
      "Technical SEO and structured page metadata",
      "Responsive media, performance, and deployment"
    ],
    decisions: [
      "Use clear, reassuring language suitable for health-related decisions.",
      "Prioritize service understanding and visit logistics above decorative complexity.",
      "Make mobile contact paths prominent without obscuring essential information.",
      "Structure pages so individual services can be discovered and maintained independently."
    ],
    delivered: [
      "A live multi-page medical imaging website",
      "Responsive service and information page templates",
      "Local contact and location journeys",
      "Search-ready metadata and crawlable navigation",
      "A consistent visual system across devices"
    ]
  },
  "alargan-crm-concept": {
    title: "Alargan CRM Platform Concept",
    category: "Interactive executive proposal",
    description: "An interactive product concept that turns a complex CRM vision into a navigable executive story covering users, workflows, modules, governance, and a phased delivery direction.",
    objective: "Make a proposed CRM platform understandable to business and technical stakeholders before implementation by showing the operating model, experience direction, major modules, and decisions that require validation.",
    scope: [
      "Product narrative and executive information architecture",
      "Representative CRM modules, roles, and workflow concepts",
      "Interactive responsive presentation rather than a static document",
      "Visual system for data, states, navigation, and decision points",
      "Public concept deployment for review and discussion"
    ],
    decisions: [
      "Present the proposal as a product experience so stakeholders can navigate the idea.",
      "Separate confirmed needs from conceptual modules that still require discovery.",
      "Use representative interfaces to make workflow implications concrete.",
      "Keep the concept modular so feedback can change scope without rebuilding the entire narrative."
    ],
    delivered: [
      "A live interactive CRM proposal",
      "Executive overview and representative product modules",
      "Responsive navigation for presentation and independent review",
      "A visual language for workflows, roles, and system states",
      "A structured starting point for discovery and scope validation"
    ]
  }
};

export const englishSectorNames = {
  "المقاولات والتشطيبات": "Contracting & Finishing",
  "المنصات والحلول الرقمية": "Digital Platforms & Solutions",
  "الصحة والخدمات المهنية": "Healthcare & Professional Services",
  "النجارة والديكور": "Carpentry & Interior Fit-out",
  "السباكة والكهرباء": "Plumbing & Electrical Services",
  "التبريد والتكييف": "Cooling & Air Conditioning",
  "الحدائق والمناسبات": "Landscaping & Events"
};

export const englishMapCategoryNames = {
  "مقاولات وتشطيبات": "Contracting & Finishing",
  "خدمات منزلية": "Home Services",
  "صحة": "Healthcare",
  "مطاعم": "Restaurants",
  "متاجر": "Retail",
  "أنظمة أمنية": "Security Systems"
};

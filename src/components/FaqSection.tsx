import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "How does the audit engine calculate my savings?",
    answer:
      "SpendScope runs static, updated rules against official pricing for Cursor, Claude, Copilot, ChatGPT, Gemini, and Windsurf. It flags seat-minimum overpayments (e.g. Claude Team's 5-seat minimum with fewer users), cross-tool redundancies (Cursor plus Copilot), and API optimizations like prompt caching.",
  },
  {
    question: "What is Credex, and how do you offer discounted credits?",
    answer:
      "Credex is a marketplace for discounted AI infrastructure credits. We source pre-paid API credits and software licenses from teams that pivoted or downsized, verify them, and pass savings of roughly 20–40% off retail to growing startups.",
  },
  {
    question: "Is my company's software stack data secure?",
    answer:
      "Yes. The calculator runs anonymously—no AWS, GCP, or SaaS billing connections required. The audit is free with no login. We only ask for email if you want to export your report or explore discounted credits through Credex.",
  },
  {
    question: "We only have one developer. Can we still save money?",
    answer:
      "Yes. Solo builders often land on Business or Team tiers by default. We surface single-user downgrades to Pro or Individual plans—often around $20/month per tool without losing the features you actually use.",
  },
  {
    question: "How often is the pricing data updated?",
    answer:
      "Our pricing database is updated weekly. Every plan and rule links to the vendor's official pricing page so the math stays aligned with retail rates.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      className="mt-20 pt-16 border-t border-[#1A1A1D] scroll-mt-24"
      aria-labelledby="faq-heading"
    >
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <span className="text-xs font-semibold font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-metallic-green-badge">
          FAQ
        </span>
        <h2
          id="faq-heading"
          className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight"
        >
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          How the audit works, what Credex does, and how we handle your data.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {FAQ_ITEMS.map((item, index) => (
          <details
            key={item.question}
            className="group glass-panel rounded-xl border border-[#1F1F22] overflow-hidden transition-colors open:border-emerald-500/25 open:shadow-[0_0_40px_-20px_rgba(45,212,191,0.2)]"
            {...(index === 0 ? { open: true } : {})}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left font-medium text-white hover:bg-white/[0.02] transition-colors [&::-webkit-details-marker]:hidden">
              <span className="text-sm sm:text-base pr-2">{item.question}</span>
              <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-180 group-open:text-emerald-400/90" />
            </summary>
            <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-[#1F1F22]/80">
              <p className="text-sm text-gray-400 leading-relaxed font-light">
                {item.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

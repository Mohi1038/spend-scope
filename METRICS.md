# Metrics and Analytics Framework

This document defines the telemetry and performance indicators used to measure the efficacy of SpendScope as a lead-generation platform.

## Key Performance Indicators

| Category | Metric | Definition | Intent |
| :--- | :--- | :--- | :--- |
| **North Star** | Qualified Leads | Verified business emails with >$300 addressable savings | Drive Credex revenue pipeline |
| **Acquisition** | Conversion Rate | Audit Completions / Total Unique Visitors | Measure landing page relevance |
| **Efficiency** | Capture Rate | Leads Submitted / Audits Completed | Validate audit value perception |
| **Retention** | Re-audit Rate | Return users over a 90-day period | Track long-term SaaS drift management |

## Funnel Instrumentation

Analytics are managed via PostHog to track the user journey through the audit lifecycle.

### Primary Event Tracking
*   `audit_started`: Triggered on initial tool selection (Acquisition).
*   `audit_engine_executed`: Triggered upon server-side calculation completion (Activation).
*   `recommendation_interaction`: Tracks which specific logic-flags (e.g., Redundancy, Downgrade) are most viewed.
*   `lead_conversion`: Final form submission for PDF report and credit access (Conversion).

## Instrumentation Strategy

```mermaid
graph LR
    A[Visitor] -->|Track: pageview| B[Landing]
    B -->|Track: audit_init| C[Calculator]
    C -->|Track: audit_run| D[Results]
    D -->|Track: lead_conv| E[Lead Database]
    
    style B fill:#1e1b4b,stroke:#312e81,color:#818cf8
    style D fill:#064e3b,stroke:#065f46,color:#34d399
    style E fill:#451a03,stroke:#78350f,color:#fbbf24
```

## Pivot Thresholds and Decision Matrix

Strategic adjustments will be made based on the following performance triggers:

1.  **Low Conversion (CR < 15%)**: If users exit before running the audit, we will simplify the tool selection grid and pre-populate "Common Stack" defaults.
2.  **Low Lead Capture (Capture < 10%)**: If audits are run but emails aren't submitted, we will pivot to an "Instant PDF" incentive or move the CFO summary behind a lightweight sign-up.
3.  **Low Qualified Spend**: If audits reflect low total spend ($<100/mo), the marketing focus will shift from "Startups" to "Early-Stage Agencies."


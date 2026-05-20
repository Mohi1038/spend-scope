# Metrics & Analytics Framework

This document outlines the telemetry, analytics tracking, and instrumentation plan for **SpendScope**.

---

## 🌟 North Star Metric

Our North Star metric is **Captured Qualified Leads per Month**.

### Why this metric?
SpendScope is a lead-generation asset for **Credex**. Our goal is not daily active usage (DAU), as audit tools are typically used once a quarter. Success is determined by our ability to capture verified business emails from teams with significant, addressable AI overhead.

---

## 📈 Input Metrics

The North Star metric is driven by three primary inputs:

1. **Unique Landing Page Visitors:** 
   - *Definition:* The total volume of traffic arriving from Hacker News, X, Reddit, and cold outreach.
   - *Impact:* Expands the top of the funnel.
2. **Audit Calculation Rate:**
   - *Definition:* The percentage of landing page visitors who select at least one tool and click "Run Spend Audit".
   - *Impact:* Measures the interactive appeal of our calculator and gauges friction levels on the form inputs.
3. **Lead Opt-in Rate:**
   - *Definition:* The percentage of audited users who submit the lead form to unlock their report or book a consultation.
   - *Impact:* Measures the perceived value of the audit results.

---

## 🛠️ Analytics Instrumentation Plan

We will use **PostHog** for product analytics due to its quick setup and event-autocapture.

### Key Events to Instrument:
- `tool_card_clicked`: Tracks which AI tools (Cursor, Copilot, ChatGPT) are most common.
- `audit_calculated`: Triggered when the user runs the spend engine, logging the calculated monthly spend and potential savings.
- `lead_form_submitted`: Logged when the email gate is completed, passing anonymous metadata (company scale, use case, savings tier).
- `consultation_booking_clicked`: Logs clicks on the calendar widget, measuring purchase intent.

---

## 🛑 Pivot Indicator Threshold

If after launching on Hacker News and Reddit we accumulate **500 completed audits** and our **Consultation Booking Rate is < 2%**, we will trigger a pivot.

### Potential Pivot Directions:
1. **Convert to Self-Serve Bundle Purchase:** If founders are hesitant to book a 15-minute consultation but have high savings, we will pivot the CTA from "Book a Call" to **"Buy a $500 Credit Bundle Instantly"** using a Stripe checkout integration.
2. **Self-Auditor Integration:** Shift focus from a manual calculator to a read-only integration (e.g. read-only AWS/GCP API billing connections) that runs in the background.

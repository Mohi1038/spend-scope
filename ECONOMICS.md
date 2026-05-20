# Unit Economics & Revenue Strategy

This document details the financial model, conversion funnel metrics, and scalability parameters for **SpendScope** as a lead-generation asset for **Credex**.

---

## 💎 Lead Value to Credex

Credex sells pre-negotiated, bulk AI credits (e.g., Claude, OpenAI, Cursor) at a **20-30% discount** to startups. 

### Financial Assumptions:
- **Average Startup AI Spend:** $2,000/mo ($24,000/yr).
- **Average Credex Contract Size:** $10,000 in credits (representing 6 months of usage).
- **Credex Net Profit Margin:** 15% (the markup margin between our bulk procurement cost and discounted sale price).
- **Initial Transaction Profit:** $1,500 gross profit per converted lead.
- **Customer Lifetime Value (LTV):** Startups buy credits repeatedly as they consume their API quotas. Assuming an average retention of 24 months, the LTV is **$6,000** in gross margin.

---

## 📊 Conversion Funnel Math

Based on organic distribution channels, the traffic-to-revenue funnel is modeled as follows:

```
[1,000 Website Visitors]
       │
       ▼ (40% Completion Rate)
  [400 Audits Completed]
       │
       ▼ (30% Lead Capture Rate)
  [120 Leads Captured (Emails)]
       │
       ▼ (25% High-Savings Threshold >$500/mo)
  [30 Qualified High-Spend Leads]
       │
       ▼ (40% Consultation Booking Rate)
  [12 Consultations Booked]
       │
       ▼ (20% Credit Deal Close Rate)
  [2.4 Converted Customers]
```

### Funnel Unit Values:
- **1,000 Visitors** yields **2.4 Customers**.
- **Customer Acquisition Cost (CAC) - Organic:** $0 (excluding hosting overhead of $0.05 per audit).
- **Traffic Requirement per Customer:** 416 visitors are required to close 1 customer.
- **Customer Acquisition Cost (CAC) Limit (Paid):** If we transition to paid acquisition (LinkedIn ads targeting CTOs at $4 per click), acquiring 416 visitors costs **$1,664**. Because the initial margin is $1,500 and LTV is $6,000, this paid model remains highly profitable (LTV:CAC ratio of 3.6:1).

---

## 📈 The Path to $1M ARR in 18 Months

To drive **$1,000,000 in Annual Recurring Revenue (ARR)** via bulk credit transactions within 18 months, we must establish the following pipeline:

### 1. ARR Metric Translation:
- $1M ARR translates to **$83,333 in monthly gross margin**.
- At a $1,500 margin per transaction, we need to close **56 credit deals per month**.
- Assuming an average contract duration of 6 months, we need to maintain a cohort of **336 active startups** purchasing credits through Credex.

### 2. Required Audits Pipeline:
To close 56 deals/month, the required monthly pipeline is:
- **Consultations Booked:** 280 meetings/mo.
- **Leads Captured:** 2,800 emails/mo.
- **Audits Completed:** 9,333 audits/mo.
- **Monthly Traffic:** 23,333 unique visitors/mo (~777 visitors/day).

### 3. Execution Plan to Hit Traffic Milestones:
1. **VC Portfolio Partnerships:** Partner with 10 seed stage VC firms to distribute SpendScope to their portfolio founders as a standard runway-extension tool. This creates a high-trust, zero-CAC channel.
2. **Viral Share Loops:** Enhance the dynamic OG image sharing options to encourage founders to share their savings cards on social media, lowering our dependency on cold traffic.
3. **Automated Auditing APIs:** Build a Slack integration that allows engineering managers to check their subscriptions from their workspace, driving user engagement.

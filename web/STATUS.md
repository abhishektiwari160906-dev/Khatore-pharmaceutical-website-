# Khatore Website — Status Report
Prepared for the 12:00 noon client review with Vrinda Khatore · 7 Oct 2026
Build window: 10:30–11:30. This is the final version, written at the end of that window.

Legend: **VERIFIED** = ran it and saw it work (evidence below, often a literal command + output) · **PARTIAL** = some of it works, evidence shows exactly how much · **NOT BUILT** = does not exist in the code.

No real payment credentials exist anywhere in this environment (checked: no Razorpay/PayPal/Cashfree/PayU keys in `env`, no `.env`/`.env.local` file). Everything marked VERIFIED below was actually run; nothing was assumed to work because the code "looks right."

---

## AREA 1 — PAYMENTS & CHECKOUT

| Bullet | Status | Evidence |
|---|---|---|
| PayPal status | PARTIAL | `lib/payment/paypal.ts` — real `PayPalPaymentProvider` implementing `createSession` (Orders v2 API call, USD only) and `verifyWebhook`. **No real PayPal sandbox account exists in this environment**, so `createSession` has never actually been called against PayPal — it's a correctly-shaped, untested live call. `verifyWebhook` **always returns invalid today**: PayPal requires a server-to-server call to its own verify-webhook-signature endpoint (no local HMAC like Razorpay), which is not wired in — see the code comment in `paypal.ts` for why. Tested: the pure request-body builders (`buildPayPalOrderBody`, `buildPayPalVerifyWebhookBody`) — 2 tests, both pass. |
| Razorpay account + integration | PARTIAL | `lib/payment/razorpay.ts` — real `RazorpayPaymentProvider`. `createSession` calls Razorpay's real Orders API (INR only) when `RAZORPAY_KEY_ID`/`SECRET` are set — **not configured here, so never actually called**. `verifyWebhook` is a **real, fully-tested HMAC-SHA256 signature check** — this part genuinely is VERIFIED (8 passing tests below), independent of having real keys, because signature verification is pure math. Account-opening itself is a business-side action outside this repo, can't be verified from code. |
| UPI / Mastercard readiness | PARTIAL | Razorpay's Orders API (once live) natively supports UPI/cards/net banking through Razorpay Checkout — the server-side half (`createSession`, `gatewayOrderId` + `publicKey` returned for the client to open Checkout.js) is built; the client-side Checkout.js integration itself is NOT BUILT (`app/api/checkout/route.ts` still only checks `paymentProvider.isConfigured`, never calls `createSession`). |
| End-to-end checkout test | PARTIAL | Cart → order creation → order confirmation: **VERIFIED** (curl + real browser, India/US/Malaysia pricing, tamper rejection, quantity validation all passed — see Area 3 below for today's re-verification). The *payment* step does not exist in the checkout route yet, so a true "checkout → payment → webhook → order → notification" E2E is **NOT BUILT** — doing that honestly requires either real sandbox keys (none exist here) or explicitly wiring `createSession` into checkout, which was not done today to stay inside the time budget. |
| Payment blockers before launch | — | See table below. |

### Payment blockers (owner)
| Blocker | Owner |
|---|---|
| Final gateway choice confirmed in writing (Razorpay + PayPal agreed in principle, per Monday's MOM) | Vijay/Vrinda |
| KYC completion with each gateway | Khatore |
| Real test/sandbox API keys supplied | Khatore (gateway dashboards) |
| Confirmed fees (not the rough WhatsApp estimates) | Gateway, relayed by Khatore |
| Refund/chargeback policy | Khatore |
| ~~Wire `createSession` into `/api/checkout` + build the client-side payment flow~~ — **DONE 8 Oct** for PayU + PayPal (see "UPDATE — 8 Oct" section below). Razorpay's client-side Checkout.js step is still not built. | Dev, once Razorpay keys exist |
| PayPal's actual verify-webhook-signature API call | Dev, once a PayPal sandbox account exists to test against |
| ~~Decide the fallback for currencies neither gateway can charge~~ — **RESOLVED 8 Oct.** 7 currencies (AED, NGN, GHS, RON, KES, UGX, TZS) have no working gateway (India/INR is fine via Razorpay — not part of this list, correcting the earlier "8 of 16" writeup). Decision: show USD instead for those 7. Implemented in `lib/pricing/resolve.ts` + `data/currencies.ts`, live-verified (Nigeria/UAE → USD; India/UK unaffected), 2 new tests, 57/57 passing. | Done |

### What IS real and tested in Area 1 today
- Razorpay webhook HMAC signature verification — **8/8 tests pass**, including a simulated tampering attack (forged payload + a signature stolen from a different, real payload is correctly rejected).
- Idempotent webhook processing — a gateway event delivered twice (retry behaviour all gateways exhibit) is only processed once. **5/5 tests pass**, including a direct simulation of a duplicate delivery.
- `app/api/payments/webhook/route.ts` now uses that idempotency store before trusting any verified event.

---

## UPDATE — 8 Oct: checkout now actually takes a payment (PayU + PayPal)

Client decision that day: lead with **PayU + PayPal + International Cards**, Razorpay once that
account is live. This closed the single biggest gap from the section above — `createSession` was
built but never called. It's called now.

| Bullet | Status | Evidence |
|---|---|---|
| PayU integration | **PARTIAL (mechanism VERIFIED, no real account)** | `lib/payment/payu.ts` — real SHA-512 request-hash and reverse-hash verification, built strictly from PayU's documented formula (array-join construction, not hand-counted pipe characters, specifically to avoid a silent off-by-one). **9/9 unit tests pass**, including hash-tamper and status-flip attack simulations. **Live-verified beyond unit tests**: ran the dev server with PayU's own published test credentials, called `/api/checkout` for an India order, got back a real formAction + hash: 12,999 ₹ flowed through end-to-end from `resolveLocalCurrencyPricing` into PayU's exact field. Then independently recomputed PayU's reverse hash in a separate Python process (simulating PayU itself) and POSTed it to `/api/payments/return` — the server correctly verified it and redirected to `paymentStatus=succeeded`; a second POST with the amount tampered (same stolen hash) was correctly rejected as `unverified`. What's NOT verified: an actual payment on PayU's real servers, which needs Khatore's real merchant key/salt (still in the PDF Vrinda sent, not read by this session — see note below). |
| PayPal integration | **PARTIAL (one real gap closed, one remains)** | `createSession` now includes `application_context.return_url`/`cancel_url` (8 Oct) — previously the customer would approve on PayPal and have nowhere to come back to. Added `PayPalPaymentProvider.captureOrder()` — the real second API call Orders v2 requires after approval — wired into `/api/payments/return`'s GET handler (PayPal redirects with `?token=&PayerID=`). This capture call is the actual payment confirmation for PayPal now, not just the separate async webhook (which still can't be verified — see 7 Oct note above, unchanged). Still no real PayPal sandbox account to test the live call against. |
| Checkout → payment session wiring | **VERIFIED** | `app/api/checkout/route.ts` now accepts `paymentMethod` and actually calls `createSession`, returning a `paymentSession` the client acts on. A provider failure or missing config never loses the order — verified live: requesting PayPal with no PayPal keys configured correctly returns `{available:false, reason:"paypal is not configured yet."}` alongside a normal, already-recorded order. |
| Client-side "Pay Now" flow | **VERIFIED (mechanism)** | `CheckoutForm.tsx` picks PayU (INR) or PayPal (everything else, incl. the 7 fallback-to-USD currencies) automatically from the resolved currency — never offers a method a provider would reject. PayU session → real hidden-form browser POST (not fetch) to PayU's hosted page. PayPal session → full-page redirect to the approval URL. Verified in a real Chromium browser (Playwright) against the live dev server for all 4 post-payment states. |
| Order-confirmation payment status | **VERIFIED** | `OrderConfirmationClient.tsx` now reads `?paymentStatus=` — set only by `/api/payments/return` after it has already verified the result server-side, never trusted from an unverified redirect. Real-browser-tested, all 4 states render correctly: `succeeded` → "Paid ✓" with provider + reference; `failed` → WhatsApp retry CTA; `unverified` → "couldn't confirm automatically," explicitly promises no double-charge, WhatsApp CTA; no param (today's existing no-provider-configured case) → unchanged "Pending — not yet paid." |
| "Never failing" | Honest limit | Every failure mode that can be built and tested without a live gateway account has been: tampered hash, missing config, thrown exception during session creation, missing return URLs. What **cannot** be verified without Khatore's real PayU/PayPal credentials: an actual charge succeeding or being declined on their live/sandbox servers, real currency/amount limits on their side, or their actual approval-page UX. That gap closes the moment real keys are set in Netlify's environment variables — no code change needed. |

**Still needed from Khatore before this is live, not just correct:** real PayU merchant key/salt and
real PayPal client ID/secret/webhook ID (Vrinda's PDF has the PayU ones; not opened by this session
per the standing rule — keys only via `.env`/the hosting dashboard, never through chat or any tool
that would log them). Razorpay stays PARTIAL exactly as in the 7 Oct section above, unchanged, until
that account goes live.

---

## AREA 2 — DASHBOARD + LEAD FORM

| Bullet | Status | Evidence |
|---|---|---|
| Activity dashboard | VERIFIED | `/dashboard` — password-gated via `KHATORE_DASHBOARD_PASSWORD` (HTTP Basic Auth, enforced in `middleware.ts`). Ran live: no password → `401`; wrong password → `401`; correct password → `200`. Shows leads table (+ CSV export), events-per-day, top countries, top sources, enquiry→checkout→order funnel, and all event types seen — all read from real submitted data in the same test run (see below). |
| Dedicated lead form | VERIFIED | `app/api/leads/route.ts` + `lib/leads/validate.ts`. Server-side validation (name/email format/message/explicit consent required) and a honeypot spam trap. Ran live: a well-formed lead → `201` + appears on the dashboard and in the CSV; a submission with the honeypot field filled → `400`; a submission with `consent:false` → `400`. 7/7 unit tests pass on the validator in isolation. |
| Fields captured | VERIFIED | name, email, phone, country, product interest, message, UTM source/medium/campaign, source page, consent, timestamp — all present in `lib/leads/types.ts` and confirmed in the CSV export output (see command below). |
| Where data is stored | PARTIAL — **no database exists in this repo** | Confirmed: no Prisma/Mongoose/pg/sqlite/Drizzle dependency anywhere in `package.json`. Leads/events are (a) always logged to the server console, (b) kept in an in-memory, per-process, capped store that the dashboard reads from directly (real and queryable **within one running server process**, but resets on redeploy/cold start/second instance — stated plainly, not hidden), and (c) optionally also posted to a Google Sheets webhook if `KHATORE_LEADS_SHEET_WEBHOOK_URL`/`KHATORE_EVENTS_SHEET_WEBHOOK_URL` are set (not set here). A real deployment needs an actual database behind this before it's safe to rely on long-term. |
| CRM / email integration | PARTIAL | `lib/notify.ts` — real Resend API email-sending code with retry-with-backoff (4/4 tests pass) and loud `console.error` flagging for a record whose notification fails after retries. **No `RESEND_API_KEY` exists in this environment**, so email sending itself has never actually fired — it falls back to a console notification, which the live test below shows working (`"notified":true` from the console path). No CRM integration exists. |

### Live verification run (this session, this build)
```
$ curl -X POST /api/leads  (well-formed lead, consent:true)
→ {"ok":true,"notified":true}

$ curl -X POST /api/leads  (honeypot field filled)
→ 400

$ curl -X POST /api/leads  (consent:false)
→ 400

$ curl -u admin:*** /api/dashboard/leads-csv
→ submittedAt,name,email,phone,country,productInterest,source,utmSource,utmMedium,utmCampaign,message
   2026-10-07T05:11:08.109Z,Jane Buyer,jane@example.com,+911234567890,IN,Kamalahar,contact_page,google,,,Interested in bulk order

$ curl -u admin:*** /dashboard   → page renders "Jane Buyer" from the lead just submitted
```

---

## AREA 3 — PRICING & DISCOUNT

| Bullet | Status | Evidence |
|---|---|---|
| Tier 1/2/3 pricing | VERIFIED | `lib/pricing/config.ts` + `lib/pricing/resolve.ts`. 5/5 country→tier tests pass, 4/4 tier-price tests pass (India ₹17,400→₹12,999, US $399→$299, Malaysia $399→$249, non-tiered product unaffected). |
| Correct price per country | VERIFIED | Same tests, plus a server-side tamper-resistance test (whitespace/casing in the country code doesn't change the resolved price). Country is resolved from the **validated checkout shipping field**, never trusted from the client. |
| Current 25–37% Kamalahar discount | VERIFIED | Static, server-authoritative, confirmed live: no window configured → `discountActive: true` with no `discountEndsAt`, exactly today's real confirmed behaviour (backward compatible — this was already true before today). |
| Reverting after the 6-day period | **VERIFIED (mechanism) / PARTIAL (real date)** | Built today: `isDiscountActive()` (pure function, 4/4 tests covering before-window / inside-window / after-window / no-window-configured) + a revert test proving every tier's charged price falls back to `regularPrice` once `endsAt` passes. **The mechanism is real and tested.** What's still missing: **the actual 6-day start date was not given in Monday's meeting** — so there's nothing to turn on yet. A `DEMO_PRICING=1` env flag (off by default, confirmed in the "default mode" test below) lets the mechanism be shown live today with obviously-synthetic dates — ran live: Tier 1 (US) shows `discountActive:true, discountEndsAt: <4 days out>`; Tier 2 (Malaysia) shows `discountActive:false, salePrice reverted to $399, discountPercent:0` — both pulled from the live server in this session. |

### Live verification run (this session, this build)
```
$ DEMO_PRICING=1 curl /api/pricing?productId=kamalahar&country=US
→ salePrice: 299, discountActive: true, discountEndsAt: "2026-10-11T05:13:44.895Z"

$ DEMO_PRICING=1 curl /api/pricing?productId=kamalahar&country=MY
→ salePrice: 399 (reverted), discountPercent: 0, discountActive: false

$ curl /api/pricing?productId=kamalahar&country=US   (no DEMO_PRICING -- production default)
→ salePrice: 299, discountActive: true, NO discountEndsAt field  -- unchanged from before today
```

---

## FULL TEST SUITE (this session)

No test framework existed in this repo before today (`package.json` had no `test` script, no jest/vitest). Added `vitest` (`npm run test`). Full run, this build:

```
RUN  v5.0.3

 ✓ lib/payment/razorpay.test.ts (8 tests)
 ✓ lib/payment/paypal.test.ts (4 tests)
 ✓ lib/payment/idempotency.test.ts (5 tests)
 ✓ lib/notify.test.ts (4 tests)
 ✓ lib/pricing/resolve.test.ts (11 tests)
 ✓ lib/leads/validate.test.ts (7 tests)

 Test Files  6 passed (6)
      Tests  43 passed (43)
   Duration  434ms
```

`npx tsc --noEmit` — clean, no errors. `npm run build` — clean, production build succeeds, all 34 routes compile, SSG preserved on product/concern pages, `/dashboard` and the new API routes correctly dynamic.

---

## New environment variables (all documented in `.env.example`, all unset by default)
`RAZORPAY_WEBHOOK_SECRET`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_ENV`, `KHATORE_DASHBOARD_PASSWORD`, `KHATORE_NOTIFY_EMAIL_TO`, `RESEND_API_KEY`, `KHATORE_LEADS_SHEET_WEBHOOK_URL`, `DEMO_PRICING`.

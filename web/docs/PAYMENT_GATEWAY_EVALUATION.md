# Payment Gateway Evaluation — Khatore Pharmaceuticals

Status: **advisory only — no gateway is activated in this codebase.** See
`lib/payment/providers.ts`: every provider is inactive until real
merchant credentials are set, and none exist in this environment today.

## Candidates evaluated

| | Cashfree | Razorpay | PayU |
|---|---|---|---|
| Domestic (India) | UPI, Visa, Mastercard, RuPay, net banking | UPI, Visa, Mastercard, RuPay | UPI, Visa, Mastercard |
| International cards | Visa, Mastercard, Amex, Maestro | Visa, Mastercard, Amex | Visa, Mastercard, Amex |
| Currencies | 140+ | Not specified in the sources reviewed | 130+ |
| Markets | 170+ | Not specified in the sources reviewed | Not specified in the sources reviewed |
| Published international-card rate | 2.99% | Up to 3% | 3% + GST |

These figures are the providers' own **current public pricing pages**
(reviewed 2026-09-29), not merchant-specific quotes. Actual rates,
eligible payment methods, and settlement terms depend on Khatore's
approved merchant category, transaction volume, and the specific plan
negotiated at onboarding — none of which are known yet.

## Recommendation

**Evaluate Cashfree first.** Its published domestic + international
method coverage (UPI, Visa/Mastercard/RuPay domestically; Visa/
Mastercard/Amex/Maestro internationally) and currency/market breadth
line up closely with the stated requirement (India + international
cards + multi-currency), and its published international-card rate is
the lowest of the three reviewed. Razorpay and PayU are credible
fallbacks with materially similar coverage.

This is a starting point for merchant onboarding, not a decision. Do
not treat any of the three as approved, and do not build anything that
assumes one specific provider's API shape beyond the generic
`PaymentProvider` interface in `lib/payment/types.ts`.

## What must be confirmed with each candidate before activation

- **Merchant category / product eligibility** — Khatore sells Ayurvedic
  pharmaceutical products. Payment gateways commonly apply extra
  scrutiny or category restrictions to health/pharma merchants; this
  must be confirmed directly with each provider's onboarding team, not
  assumed from their general marketing pages.
- **KYC / business documentation requirements** (business registration,
  GST, bank account, director KYC — specifics vary by provider).
- **International-payment eligibility** — some India-based gateways
  require a separate approval step (e.g. an Export/Import Code,
  RBI-related cross-border compliance) before international cards can
  be accepted, on top of the base merchant account.
- **Settlement rules** — settlement currency, settlement cycle (T+1/T+2
  etc.), and whether international-currency settlement is offered or
  everything settles in INR.
- **Refund and chargeback handling** — process, timelines, and fees.
- **Confirmed fees** — the published rates above, PLUS any GST on fees,
  any additional FX conversion markup on international transactions,
  and any fixed per-transaction fee.
- **Webhook signature scheme** — each provider's own HMAC/signature
  verification method (see the doc comments in
  `lib/payment/providers.ts` for where this plugs in).

## When ready to activate

1. Complete the merchant application with the chosen provider and get
   it approved.
2. Set that provider's environment variables (see `.env.example`) on
   the real deployment — never commit them.
3. Implement that provider's `PaymentProvider` (createSession +
   verifyWebhook) in `lib/payment/providers.ts`, replacing the
   `throw new Error(...)` placeholder for that provider.
4. Run a real test transaction in the provider's sandbox/test mode and
   confirm the webhook round-trip before enabling it in production.
5. Only after a verified test transaction should `payment_initiated` /
   `payment_completed` / `payment_failed` move from
   `FutureEventName` to `Phase1EventName` in `lib/events/types.ts`.

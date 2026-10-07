# Pricing Decisions Pending Client Confirmation

Status: **documentation only — not yet committed.** Nothing in the shipped
code has changed as a result of this file. It exists to separate what the
pricing workbook actually confirmed from what was inferred while building
`lib/pricing/config.ts`, so those inferences can be reviewed and corrected
before they harden into "the way it works."

## A. What the workbook explicitly confirms

Transcribed directly from `Kamalahar_Website_Pricing_Final.xlsx`, one
sheet ("Kamalahar Pricing"), three rows:

| Tier | Regular | Final | Discount | Countries named |
|---|---|---|---|---|
| Tier 1 | 399 | 299 | 25.06% | USA, UK, Canada, Australia, Germany, Singapore, UAE, Nigeria, Ghana, Romania |
| Tier 2 | 399 | 249 | 37.59% | Malaysia, Philippines, Kenya, Uganda, Tanzania |
| Tier 3 (India) | 17,400 | 12,999 | 25.29% | India |

The workbook has **no currency column**. It also has no local-currency
amounts for any Tier 1/2 country, no historical price data, and no
discount start/end dates.

## B. What was inferred (not confirmed)

1. **Tier 1 / Tier 2 currency = USD.** Reasoned from: the existing,
   pre-pricing-pass codebase already had Kamalahar priced at `399 USD`;
   Tier 1/2 are described as international markets where USD is a common
   default; the numbers are far too small to plausibly be each listed
   country's own local currency at a uniform face value (399 is not a
   sensible price in GBP, AUD, SGD, AED, NGN, etc. at parity). This is a
   reasonable placeholder, not a confirmed fact.
2. **Unlisted-country fallback = Tier 1.** Every country not named in the
   workbook (including real markets like Japan or Brazil, and any
   detection failure) currently resolves to Tier 1's price. This was my
   own default choice for "a defined fallback, not a guess" — it was not
   specified by the client for this purpose. An equally defensible
   fallback would be to block checkout for unlisted countries and route
   to a manual/WhatsApp quote instead.

## C. What still requires client confirmation

1. **Tier 1 currency** — Is $299/$399 actually USD, or should some/all
   Tier 1 countries (UK, Australia, Germany, Singapore, UAE) be billed in
   their own local currency (GBP/AUD/EUR/SGD/AED) at a client-supplied
   amount, with USD only as a fallback for the rest?
2. **Tier 2 currency** — Same question for Malaysia, Philippines, Kenya,
   Uganda, Tanzania — USD, or local currency (MYR/PHP/KES/UGX/TZS)?
3. **Unlisted-country fallback** — Should an unlisted country default to
   Tier 1 pricing (current behavior), be blocked from self-checkout
   entirely, or route to a manual quote/WhatsApp flow instead?
4. **Local-currency support** — Should the architecture's next step be
   real per-country local-currency pricing (not just a currency label
   swap on the same USD number), and if so, on what timeline?
5. **30-day high/low pricing** — Should it stay disabled/unimplemented
   until real historical price data exists for a country, or is there
   already a verified pricing history the client can supply?
6. **5–7 day discount expiry** — Should any "offer ends" messaging stay
   disabled until a real, client-specified campaign start/end timestamp
   is supplied, or is there a specific expiry date to configure now?

## What has NOT changed

No code, pricing value, currency label, or fallback behavior has been
modified as a result of this document. The implementation committed in
`323192e` continues to run exactly as before: Tier 1/2 display as USD,
unlisted countries resolve to Tier 1, no historical pricing or discount
countdowns render anywhere (both are architecturally disabled by design,
independent of the open questions above).

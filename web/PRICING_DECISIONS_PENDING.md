# Pricing Decisions — Status as of 7 Oct

Superseded version of the file created before the client's 7 Oct decisions.
Kept for the record of what was asked and answered; see the bottom for what's
still genuinely open.

## Resolved on 7 Oct (client-confirmed, now implemented and tested)

1. **Currency display = live exchange-rate conversion.** Every visitor sees
   the price in their own local currency (`data/currencies.ts`'s explicit
   per-country map — the same 16 countries already named in the workbook,
   nothing inferred for an unlisted country). The real tier price (USD/INR)
   is converted using a live, public exchange rate
   (`lib/pricing/fx.ts`, open.er-api.com, no invented numbers), cached 12h,
   with a hard fallback to the tier's own base currency if the rate source
   is ever unreachable — never a guessed rate. Live-verified for GB (£225),
   NG (₦397,108), IN (unchanged, already INR).
2. **Rounding = nearest whole number.** 199.88 → 200, in every currency
   (`lib/pricing/fx.ts`'s `roundToWhole`), confirmed by the client's own
   example.
3. **Discount window / revert mechanism** — built and tested (see
   `STATUS.md`'s Area 3). The client's instruction was to demo it today with
   `DEMO_PRICING=1` and fix the exact real start/end date at a later date —
   so production still runs with no window configured (today's existing
   always-on discount, unchanged) until that real date is given.
4. **"Lowest price in 30 days" badge** — **reversed 8 Oct.** Shown on 7 Oct
   per that day's instruction, then pulled back the next day once the client
   reviewed the "what changed" writeup and judged it still too close to an
   unsubstantiated claim for a client-facing document. Now off by default
   (`NEXT_PUBLIC_SHOW_LOWEST_PRICE_BADGE`, unset in `.env.example`) —
   confirmed not rendering in a production build with curl + a live
   screenshot. Code stays in place so it can be switched on later once real
   history exists; nothing currently shows it.
5. **Refund policy** — "refund only before dispatch" now shown as a
   footnote at checkout (`CheckoutForm.tsx`).
6. **Lead-form privacy wording** — added to the consent checkbox
   (`ContactForm.tsx`): data stays with Khatore, never sold or shared with
   a third party or agency.
7. **Old-URL redirects** — closed the gap flagged in the original launch
   checklist; `/about-us`, `/wellness/*`, `/testimonials/*`, `/faq`,
   `/customer-service`, and the Magento boilerplate pages now all redirect
   to a real live page (`next.config.mjs`) — "not a single old page," per
   the explicit instruction.
8. **Unlisted-country fallback** — still Tier 1 (unchanged). Not explicitly
   re-addressed in the 7 Oct call; see "Still open" below.

## Still open — needs real data, not a guess

1. **GST / tax breakdown at checkout.** The client asked for a numeric
   tax breakdown at billing. Today's tier prices already say "includes
   taxes and shipping, no hidden charges" (one all-in figure) — showing a
   genuine itemized GST line requires knowing Khatore's actual applicable
   GST rate/HSN classification for this product category, which hasn't
   been given. Not implemented, to avoid stating a specific tax rate/amount
   that isn't confirmed. Checkout still shows Subtotal/Shipping/Tax/Total
   rows ("Included in price") as it already did.
2. **Cuttack Hospital clinical-trial entry.** The client confirmed the
   affiliation is real ("Cuttack hospital clinic approved"), but the 4
   trials in `data/science.ts` are each backed by a specific location,
   date range, patient count, and published-journal reference — none of
   which were given for Cuttack. Adding a 5th trial entry without those
   specifics would mean inventing clinical-trial data, which the existing
   code explicitly guards against (`CUTTACK_HOSPITAL_PENDING_CONFIRMATION`).
   **Needed to proceed:** date range, patient count, and
   publication/reference for the Cuttack trial.
3. **Unlisted-country fallback (Tier 1)** — still just my own reasoned
   default from the original build, never explicitly reconfirmed. Low
   urgency, but worth a yes/no at the next review.
4. **Not every local display currency is actually payable through the
   gateways we're building.** Checked against the two gateways' own
   official currency lists (PayPal's published currency-code table;
   Razorpay's international-payments documentation), 8 July 2026, 7-8 Oct
   build:

   | Currency | Country (ours) | PayPal | Razorpay (as implemented here) |
   |---|---|---|---|
   | USD | US | ✅ | ❌ (this build's Razorpay is INR-only) |
   | GBP | UK | ✅ | ❌ |
   | CAD | Canada | ✅ | ❌ |
   | AUD | Australia | ✅ | ❌ |
   | EUR | Germany | ✅ | ❌ |
   | SGD | Singapore | ✅ | ❌ |
   | MYR | Malaysia | ✅ | ❌ |
   | PHP | Philippines | ✅ | ❌ |
   | AED | UAE | ❌ | ❌ |
   | NGN | Nigeria | ❌ | ❌ |
   | GHS | Ghana | ❌ | ❌ |
   | RON | Romania | ❌ | ❌ |
   | KES | Kenya | ❌ | ❌ |
   | UGX | Uganda | ❌ | ❌ |
   | TZS | Tanzania | ❌ | ❌ |
   | INR | India | ❌ | ✅ |

   **Vrinda's instinct on 8 Oct was correct, and the gap is wider than just
   the Naira:** 8 of our 16 configured currencies (AED, NGN, GHS, RON, KES,
   UGX, TZS, plus INR itself) aren't in PayPal's supported-currency list at
   all. The code already protects against this correctly today —
   `lib/payment/paypal.ts`'s `createSession` only accepts USD and reports
   `available: false` for anything else; `lib/payment/razorpay.ts` only
   accepts INR the same way — so nothing in this codebase can ever attempt
   to charge a customer in a currency the gateway doesn't support. But this
   means, as built, a visitor from one of those 8 countries who sees their
   price in NGN/AED/GHS/RON/KES/UGX/TZS would currently see **both
   gateways report unavailable** — there's no automatic "charge in USD
   instead" fallback wired in yet.
   **Needs a decision, not a guess:** for those 8 countries, should
   checkout (a) fall back to charging in the tier's base currency (USD)
   even though the displayed price was local-currency, with that clearly
   shown before payment, or (b) only ever offer a different gateway/manual
   WhatsApp order flow for those countries? Razorpay does offer a broader
   ~100+ currency "International Payments" product, but it requires a
   specific account-level enablement and is only available for merchants
   registered in India/Malaysia/Singapore/US — not assumed available here
   without Khatore confirming that add-on is active.

## Already correct, no action needed (checked 7 Oct)

GMP-certified claim, "100+ countries," and "3M+ estimated patients" are
already live across the site exactly as confirmed — the client's
instruction matched the current code, not a change request.

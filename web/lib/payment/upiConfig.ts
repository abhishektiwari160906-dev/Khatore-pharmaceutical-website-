/**
 * Single swap point for the manual UPI QR checkout option
 * (components/Checkout/CheckoutForm.tsx).
 *
 * DECISION POINT -- not code's call (Vrinda, 9 Oct): the QR screenshot
 * supplied shows "Vijay Khatore"'s personal name/photo and personal
 * UPI ID. Showing that name publicly vs. a generic business label is
 * a one-way public exposure decision, so PAYEE_LABEL defaults to the
 * generic label below until Vrinda/Abhishek explicitly confirms
 * otherwise. To flip it live: change PAYEE_LABEL. Nothing else in the
 * checkout flow needs to change.
 */
export const UPI_PAYEE_LABEL = 'Khatore Pharmaceuticals';

/** The real UPI ID from the QR Vrinda supplied -- this part was never in question, only the public-facing name next to it. */
export const UPI_ID = 'vijaykhatore2008@oksbi';

// ─────────────────────────────────────────────────────────────
//  CONSULTANT CONTACT DETAILS
//  Edit the email below (or simply ask your assistant to change
//  it for you — no coding needed).
// ─────────────────────────────────────────────────────────────
export const CONSULTANT_EMAIL = "lnrstrokes@gmail.com";

export const CONSULTANT_WHATSAPP_DISPLAY = "+234 708 971 1946";
export const CONSULTANT_WHATSAPP_LINK = "https://wa.me/2347089711946";

// Done-for-you report pricing (NGN, per case)
export const REPORT_FEE_NGN = 150000;
export const REPORT_FEE_DISPLAY = `\u20A6${REPORT_FEE_NGN.toLocaleString("en-NG")}`;

/**
 * Build a mailto: link with prefilled subject and body.
 * Works on desktop and mobile (opens the user's email app).
 */
export function mailtoLink(opts: { to?: string; subject: string; body: string }): string {
  const to = opts.to ?? CONSULTANT_EMAIL;
  const query = `subject=${encodeURIComponent(opts.subject)}&body=${encodeURIComponent(opts.body)}`;
  return `mailto:${to}?${query}`;
}

/**
 * Build a wa.me link with prefilled text.
 * Previously "Submit a case on WhatsApp" opened an empty chat with no
 * context at all — this gives the consultant a structured starting
 * message instead of a blank conversation.
 */
export function whatsappLink(opts: { phone?: string; text: string }): string {
  const phone = (opts.phone ?? CONSULTANT_WHATSAPP_DISPLAY).replace(/[^\d]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(opts.text)}`;
}
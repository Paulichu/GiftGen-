/**
 * Seller identity shown on offers and used as the default buyer contact, so the
 * profile lives in one place instead of being retyped per listing.
 */
export const SELLER = {
  name: "Paulina Jakubowska",
  company: "INCANTO / OJJJA.XYZ",
  city: "Monheim am Rhein",
  region: "Nordrhein-Westfalen",
  country: "Germany",
  location: "Monheim am Rhein, NRW, Germany",
  email: "ip@ojjja.site",
  complianceEmail: "compliance@ojjja.site",
  adminEmail: "admin@ojjja.site",
  paypalEmail: "admin@ojjja.site",
  linkedin: "https://www.linkedin.com/in/paulina-jakubowska-65712b163",
  whatsapp: "+49 152 10200523",
  whatsappUrl: "https://wa.me/4915210200523",
  youtube: "https://www.youtube.com/@paulajak8276",
} as const;

/** Mailboxes the studio is allowed to send offers from. */
export const SELLER_SENDERS = [SELLER.email, SELLER.complianceEmail] as const;

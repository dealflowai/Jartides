export const SHIPPO_FROM_ADDRESS = {
  name: process.env.SHIPPO_FROM_NAME || "Jartides",
  street1: process.env.SHIPPO_FROM_STREET1 || "565 S Mason Rd",
  street2: process.env.SHIPPO_FROM_STREET2 || "Unit 172",
  city: process.env.SHIPPO_FROM_CITY || "Katy",
  state: process.env.SHIPPO_FROM_STATE || "TX",
  zip: process.env.SHIPPO_FROM_ZIP || "77450",
  country: process.env.SHIPPO_FROM_COUNTRY || "US",
  phone: process.env.SHIPPO_FROM_PHONE || "",
  email: process.env.SHIPPO_FROM_EMAIL || "",
};

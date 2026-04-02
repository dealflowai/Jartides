export const SHIPPO_FROM_ADDRESS = {
  name: process.env.SHIPPO_FROM_NAME || "J'Artides",
  street1: process.env.SHIPPO_FROM_STREET1 || "4511 Walker Rd",
  street2: process.env.SHIPPO_FROM_STREET2 || "Suite 1012",
  city: process.env.SHIPPO_FROM_CITY || "Windsor",
  state: process.env.SHIPPO_FROM_STATE || "ON",
  zip: process.env.SHIPPO_FROM_ZIP || "N8W 3T6",
  country: process.env.SHIPPO_FROM_COUNTRY || "CA",
};

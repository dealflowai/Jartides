export interface CountryConfig {
  code: string;
  name: string;
  /** Label for province/state/region field */
  regionLabel: string;
  /** Placeholder for province/state field */
  regionPlaceholder: string;
  /** Label for postal/zip code field */
  postalLabel: string;
  /** Placeholder for postal/zip code */
  postalPlaceholder: string;
  /** Predefined regions (provinces/states) — null means free-text input */
  regions: { code: string; name: string }[] | null;
}

const CA_PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }, { code: "DC", name: "District of Columbia" },
];

const AU_STATES = [
  { code: "NSW", name: "New South Wales" }, { code: "VIC", name: "Victoria" },
  { code: "QLD", name: "Queensland" }, { code: "WA", name: "Western Australia" },
  { code: "SA", name: "South Australia" }, { code: "TAS", name: "Tasmania" },
  { code: "ACT", name: "Australian Capital Territory" }, { code: "NT", name: "Northern Territory" },
];

function c(code: string, name: string, overrides?: Partial<CountryConfig>): CountryConfig {
  return {
    code,
    name,
    regionLabel: "Province / State",
    regionPlaceholder: "Province or state",
    postalLabel: "Postal / ZIP Code",
    postalPlaceholder: "Postal code",
    regions: null,
    ...overrides,
  };
}

export const COUNTRIES: CountryConfig[] = [
  // === Priority: US, Canada, Middle East ===
  c("CA", "Canada", { regionLabel: "Province", regionPlaceholder: "Ontario", postalLabel: "Postal Code", postalPlaceholder: "A1A 1A1", regions: CA_PROVINCES }),
  c("US", "United States", { regionLabel: "State", regionPlaceholder: "California", postalLabel: "ZIP Code", postalPlaceholder: "90210", regions: US_STATES }),
  c("AE", "United Arab Emirates", { regionLabel: "Emirate", regionPlaceholder: "Dubai", postalLabel: "Postal Code", postalPlaceholder: "" }),
  c("SA", "Saudi Arabia", { regionLabel: "Province", regionPlaceholder: "Riyadh", postalLabel: "Postal Code", postalPlaceholder: "11564" }),
  c("QA", "Qatar", { regionLabel: "Municipality", regionPlaceholder: "Doha", postalLabel: "Postal Code", postalPlaceholder: "" }),
  c("KW", "Kuwait", { regionLabel: "Governorate", regionPlaceholder: "Kuwait City", postalLabel: "Postal Code", postalPlaceholder: "13001" }),
  c("BH", "Bahrain", { regionLabel: "Governorate", regionPlaceholder: "Capital", postalLabel: "Postal Code", postalPlaceholder: "317" }),
  c("OM", "Oman", { regionLabel: "Governorate", regionPlaceholder: "Muscat", postalLabel: "Postal Code", postalPlaceholder: "100" }),
  c("JO", "Jordan", { regionLabel: "Governorate", regionPlaceholder: "Amman", postalLabel: "Postal Code", postalPlaceholder: "11937" }),
  c("LB", "Lebanon", { regionLabel: "Governorate", regionPlaceholder: "Beirut", postalLabel: "Postal Code", postalPlaceholder: "1100" }),
  c("IQ", "Iraq", { regionLabel: "Governorate", regionPlaceholder: "Baghdad", postalLabel: "Postal Code", postalPlaceholder: "10001" }),
  c("EG", "Egypt", { regionLabel: "Governorate", regionPlaceholder: "Cairo", postalLabel: "Postal Code", postalPlaceholder: "11511" }),
  c("IL", "Israel", { regionLabel: "District", regionPlaceholder: "Tel Aviv", postalLabel: "Postal Code", postalPlaceholder: "6100000" }),
  // === Other popular destinations ===
  c("GB", "United Kingdom", { regionLabel: "County", regionPlaceholder: "London", postalLabel: "Postcode", postalPlaceholder: "SW1A 1AA" }),
  c("AU", "Australia", { regionLabel: "State / Territory", regionPlaceholder: "New South Wales", postalLabel: "Postcode", postalPlaceholder: "2000", regions: AU_STATES }),
  c("DE", "Germany", { regionLabel: "State", regionPlaceholder: "Bavaria", postalLabel: "PLZ", postalPlaceholder: "10115" }),
  c("FR", "France", { regionLabel: "Region", regionPlaceholder: "Île-de-France", postalLabel: "Code Postal", postalPlaceholder: "75001" }),
  c("NL", "Netherlands", { regionLabel: "Province", regionPlaceholder: "North Holland", postalLabel: "Postcode", postalPlaceholder: "1012 AB" }),
  c("JP", "Japan", { regionLabel: "Prefecture", regionPlaceholder: "Tokyo", postalLabel: "Postal Code", postalPlaceholder: "100-0001" }),
  c("KR", "South Korea", { regionLabel: "Province", regionPlaceholder: "Seoul", postalLabel: "Postal Code", postalPlaceholder: "04524" }),
  c("SE", "Sweden", { regionLabel: "County", regionPlaceholder: "Stockholm", postalLabel: "Postnummer", postalPlaceholder: "111 22" }),
  c("NO", "Norway", { regionLabel: "County", regionPlaceholder: "Oslo", postalLabel: "Postnummer", postalPlaceholder: "0150" }),
  c("DK", "Denmark", { regionLabel: "Region", regionPlaceholder: "Capital Region", postalLabel: "Postnummer", postalPlaceholder: "1050" }),
  c("IE", "Ireland", { regionLabel: "County", regionPlaceholder: "Dublin", postalLabel: "Eircode", postalPlaceholder: "D02 AF30" }),
  c("NZ", "New Zealand", { regionLabel: "Region", regionPlaceholder: "Auckland", postalLabel: "Postcode", postalPlaceholder: "1010" }),
  c("CH", "Switzerland", { regionLabel: "Canton", regionPlaceholder: "Zurich", postalLabel: "PLZ", postalPlaceholder: "8001" }),
  c("IT", "Italy", { regionLabel: "Province", regionPlaceholder: "Rome", postalLabel: "CAP", postalPlaceholder: "00100" }),
  c("ES", "Spain", { regionLabel: "Province", regionPlaceholder: "Madrid", postalLabel: "Código Postal", postalPlaceholder: "28001" }),
  c("TR", "Turkey", { regionLabel: "Province", regionPlaceholder: "Istanbul", postalLabel: "Postal Code", postalPlaceholder: "34000" }),
  c("BR", "Brazil", { regionLabel: "State", regionPlaceholder: "São Paulo", postalLabel: "CEP", postalPlaceholder: "01310-100" }),
  c("MX", "Mexico", { regionLabel: "State", regionPlaceholder: "Mexico City", postalLabel: "Código Postal", postalPlaceholder: "06600" }),
  c("IN", "India", { regionLabel: "State", regionPlaceholder: "Maharashtra", postalLabel: "PIN Code", postalPlaceholder: "400001" }),
  // Rest of the world — alphabetical (excludes countries already listed above)
  c("AF", "Afghanistan"), c("AL", "Albania"), c("DZ", "Algeria"), c("AD", "Andorra"),
  c("AO", "Angola"), c("AG", "Antigua and Barbuda"), c("AR", "Argentina"), c("AM", "Armenia"),
  c("AT", "Austria"), c("AZ", "Azerbaijan"), c("BS", "Bahamas"),
  c("BD", "Bangladesh"), c("BB", "Barbados"), c("BY", "Belarus"), c("BE", "Belgium"),
  c("BZ", "Belize"), c("BJ", "Benin"), c("BT", "Bhutan"), c("BO", "Bolivia"),
  c("BA", "Bosnia and Herzegovina"), c("BW", "Botswana"), c("BN", "Brunei"), c("BG", "Bulgaria"),
  c("BF", "Burkina Faso"), c("BI", "Burundi"), c("KH", "Cambodia"), c("CM", "Cameroon"),
  c("CV", "Cape Verde"), c("CF", "Central African Republic"), c("TD", "Chad"), c("CL", "Chile"),
  c("CN", "China"), c("CO", "Colombia"), c("KM", "Comoros"), c("CG", "Congo"),
  c("CD", "Congo (DRC)"), c("CR", "Costa Rica"), c("CI", "Ivory Coast"), c("HR", "Croatia"),
  c("CY", "Cyprus"), c("CZ", "Czech Republic"), c("DJ", "Djibouti"), c("DM", "Dominica"),
  c("DO", "Dominican Republic"), c("EC", "Ecuador"), c("SV", "El Salvador"),
  c("GQ", "Equatorial Guinea"), c("ER", "Eritrea"), c("EE", "Estonia"), c("SZ", "Eswatini"),
  c("ET", "Ethiopia"), c("FJ", "Fiji"), c("FI", "Finland"), c("GA", "Gabon"),
  c("GM", "Gambia"), c("GE", "Georgia"), c("GH", "Ghana"), c("GR", "Greece"),
  c("GD", "Grenada"), c("GT", "Guatemala"), c("GN", "Guinea"), c("GW", "Guinea-Bissau"),
  c("GY", "Guyana"), c("HT", "Haiti"), c("HN", "Honduras"), c("HK", "Hong Kong"),
  c("HU", "Hungary"), c("IS", "Iceland"), c("ID", "Indonesia"),
  c("JM", "Jamaica"), c("KZ", "Kazakhstan"),
  c("KE", "Kenya"), c("KI", "Kiribati"), c("KG", "Kyrgyzstan"),
  c("LA", "Laos"), c("LV", "Latvia"), c("LS", "Lesotho"),
  c("LR", "Liberia"), c("LY", "Libya"), c("LI", "Liechtenstein"), c("LT", "Lithuania"),
  c("LU", "Luxembourg"), c("MO", "Macau"), c("MG", "Madagascar"), c("MW", "Malawi"),
  c("MY", "Malaysia"), c("MV", "Maldives"), c("ML", "Mali"), c("MT", "Malta"),
  c("MH", "Marshall Islands"), c("MR", "Mauritania"), c("MU", "Mauritius"), c("FM", "Micronesia"),
  c("MD", "Moldova"), c("MC", "Monaco"), c("MN", "Mongolia"), c("ME", "Montenegro"),
  c("MA", "Morocco"), c("MZ", "Mozambique"), c("MM", "Myanmar"), c("NA", "Namibia"),
  c("NR", "Nauru"), c("NP", "Nepal"), c("NC", "New Caledonia"), c("NI", "Nicaragua"),
  c("NE", "Niger"), c("NG", "Nigeria"), c("MK", "North Macedonia"),
  c("PK", "Pakistan"), c("PW", "Palau"), c("PS", "Palestine"), c("PA", "Panama"),
  c("PG", "Papua New Guinea"), c("PY", "Paraguay"), c("PE", "Peru"), c("PH", "Philippines"),
  c("PL", "Poland"), c("PT", "Portugal"), c("RO", "Romania"),
  c("RU", "Russia"), c("RW", "Rwanda"), c("KN", "Saint Kitts and Nevis"), c("LC", "Saint Lucia"),
  c("VC", "Saint Vincent and the Grenadines"), c("WS", "Samoa"), c("SM", "San Marino"),
  c("ST", "Sao Tome and Principe"), c("SN", "Senegal"),
  c("RS", "Serbia"), c("SC", "Seychelles"), c("SL", "Sierra Leone"), c("SG", "Singapore"),
  c("SK", "Slovakia"), c("SI", "Slovenia"), c("SB", "Solomon Islands"), c("SO", "Somalia"),
  c("ZA", "South Africa"), c("SS", "South Sudan"), c("LK", "Sri Lanka"), c("SR", "Suriname"),
  c("TW", "Taiwan"), c("TJ", "Tajikistan"), c("TZ", "Tanzania"), c("TH", "Thailand"),
  c("TL", "Timor-Leste"), c("TG", "Togo"), c("TO", "Tonga"), c("TT", "Trinidad and Tobago"),
  c("TN", "Tunisia"), c("TM", "Turkmenistan"), c("TV", "Tuvalu"),
  c("UG", "Uganda"), c("UA", "Ukraine"), c("UY", "Uruguay"),
  c("UZ", "Uzbekistan"), c("VU", "Vanuatu"), c("VE", "Venezuela"), c("VN", "Vietnam"),
  c("YE", "Yemen"), c("ZM", "Zambia"), c("ZW", "Zimbabwe"),
];

/** Priority countries shown first in the dropdown (before the divider) */
export const PRIORITY_COUNTRIES = [
  "CA", "US",
  // Middle East
  "AE", "SA", "QA", "KW", "BH", "OM", "JO", "LB", "IQ", "EG", "IL",
  // Other popular
  "GB", "AU", "DE", "FR", "NL", "JP", "KR", "TR", "IN",
];

/** Helper to get country config by code */
export function getCountryConfig(code: string): CountryConfig {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}

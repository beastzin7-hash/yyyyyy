import { Language } from "./i18n";

export type Currency = "MXN" | "USD" | "EUR" | "BRL" | "COP" | "ARS";

export const CURRENCIES: { code: Currency; label: string }[] = [
  { code: "MXN", label: "Peso mexicano (MXN)" },
  { code: "USD", label: "Dólar estadounidense (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "BRL", label: "Real brasileño (BRL)" },
  { code: "COP", label: "Peso colombiano (COP)" },
  { code: "ARS", label: "Peso argentino (ARS)" },
];

// Package prices in the app are based on MXN.
const MXN_RATES: Record<Currency, number> = {
  MXN: 1,
  USD: 0.058,
  EUR: 0.053,
  BRL: 0.32,
  COP: 230,
  ARS: 70,
};

// Exact store prices supplied by the user. Packages not listed here keep the
// existing MXN-based conversion so the rest of the catalog remains available.
const STORE_PRICES: Partial<Record<Currency, Record<number, number>>> = {
  USD: {
    22500: 199.99,
    10000: 99.99,
    4500: 49.99,
    1700: 19.99,
    800: 9.99,
    400: 4.99,
    80: 0.99,
  },
  EUR: {
    10000: 105.99,
    4500: 52.99,
    1700: 21.19,
    800: 10.59,
    400: 5.29,
    80: 1.09,
    40: 0.55,
  },
};

export function hasExactStorePrice(currency: Currency, robuxAmount: number) {
  return STORE_PRICES[currency]?.[robuxAmount] !== undefined;
}

export function convertFromMxn(amount: number, currency: Currency) {
  return amount * MXN_RATES[currency];
}

export function formatCurrency(
  amountInMxn: number,
  currency: Currency,
  language: Language = "es",
  robuxAmount?: number,
) {
  const exactPrice = robuxAmount === undefined
    ? undefined
    : STORE_PRICES[currency]?.[robuxAmount];
  const amount = exactPrice ?? convertFromMxn(amountInMxn, currency);
  const locale = currency === "USD"
    ? "en-US"
    : currency === "EUR"
      ? language === "de" ? "de-DE" : language === "fr" ? "fr-FR" : language === "it" ? "it-IT" : "es-ES"
      : currency === "BRL"
        ? "pt-BR"
        : language === "en" ? "en-US" : "es-MX";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "COP" ? 0 : 2,
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(amount);
}
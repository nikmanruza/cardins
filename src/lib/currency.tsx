import * as React from "react";

export type CurrencyCode = "USD" | "KSH" | "UGX" | "EUR" | "TZS";

const STORAGE_KEY = "cardinspro-selected-currency";
const DEFAULT_CURRENCY: CurrencyCode = "USD";

export const CURRENCY_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  KSH: 150,
  UGX: 3900,
  EUR: 0.92,
  TZS: 2500,
};

const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_RATES) as CurrencyCode[];

export function normalizeCurrency(currency: string | null | undefined): CurrencyCode {
  if (!currency) return DEFAULT_CURRENCY;
  return SUPPORTED_CURRENCIES.includes(currency as CurrencyCode)
    ? (currency as CurrencyCode)
    : DEFAULT_CURRENCY;
}

export function convertPrice(value: number, fromCurrency: string, toCurrency: string) {
  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);

  if (from === to) return value;

  return value * (CURRENCY_RATES[to] / CURRENCY_RATES[from]);
}

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  convertPrice: (value: number, fromCurrency: string, toCurrency?: string) => number;
};

const CurrencyContext = React.createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = React.useState<CurrencyCode>(() => {
    if (typeof window === "undefined") return DEFAULT_CURRENCY;

    const stored = window.localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    return normalizeCurrency(stored);
  });

  const updateCurrency = React.useCallback((next: CurrencyCode) => {
    setCurrency(normalizeCurrency(next));
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const convert = React.useCallback(
    (value: number, fromCurrency: string, toCurrency = currency) =>
      convertPrice(value, fromCurrency, normalizeCurrency(toCurrency)),
    [currency],
  );

  const value = React.useMemo<CurrencyContextValue>(
    () => ({ currency, setCurrency: updateCurrency, convertPrice: convert }),
    [convert, currency, updateCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = React.useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used inside CurrencyProvider");
  }
  return context;
}

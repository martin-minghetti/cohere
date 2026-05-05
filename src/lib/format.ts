export function formatPriceARS(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

const DISCIPLINE_LABEL: Record<string, string> = {
  yoga: "Yoga",
  pilates: "Pilates",
  coaching: "Coaching",
};

export function formatDiscipline(d: string): string {
  return DISCIPLINE_LABEL[d] ?? d;
}

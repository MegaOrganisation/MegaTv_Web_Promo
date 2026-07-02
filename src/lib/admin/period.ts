export type AdminPeriodDays = 7 | 30 | 90;

export function parseAdminPeriod(value?: string | null): AdminPeriodDays {
  const n = Number(value);
  if (n === 7 || n === 30 || n === 90) return n;
  return 30;
}

export function periodRange(days: AdminPeriodDays) {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, to, days };
}

export type DateFormat = Date | string | number;

export const dateToStringMonthYear = (date: DateFormat): string | null => {
    if (date) {
      const _date = new Date(date)
      return _date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
          .replace(/\./g, "");
    }
    return null
  }
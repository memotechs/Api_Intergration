function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

function createRelativeDate(days: number): string {
  const date = new Date();

  date.setDate(date.getDate() + days);

  return formatDate(date);
}

export const stopTestData = {
  /*
   * Valid date can be configured from .env.
   * If it is not configured, tomorrow's date is used.
   */
  validDate:
    process.env.STOP_VALID_DATE ??
    createRelativeDate(1),

  pastDate:
    process.env.STOP_PAST_DATE ??
    '01-01-2020',

  nearFutureDate:
    process.env.STOP_NEAR_FUTURE_DATE ??
    createRelativeDate(7),

  farFutureDate:
    process.env.STOP_FAR_FUTURE_DATE ??
    '01-01-2035',

  invalidDates: {
    empty: '',
    text: 'invalid-date',

    // Wrong format: expected DD-MM-YYYY
    isoFormat: '2026-09-25',
    slashFormat: '25/09/2026',

    // Invalid calendar dates
    impossibleDate: '31-02-2026',
    invalidDay: '32-01-2026',
    invalidMonth: '01-13-2026',
  },

  pagination: {
    defaultPage: 1,
    secondPage: 2,
    smallPageSize: 2,
    customPageSize: 5,
    largePage: 999999,
  },

  sorting: {
    field: 'id',
    ascending: 'ASC',
    descending: 'DESC',
    invalidField: 'unknownField',
    invalidOrder: 'INVALID',
  },

  /*
   * Date.now() makes the search value unique.
   * It should not match a real stop.
   */
  nonexistentSearch:
    `AUTOMATION_STOP_NOT_FOUND_${Date.now()}`,

  /*
   * Use only for a negative test.
   * Valid stop IDs will be retrieved dynamically.
   */
  nonexistentStopId: 999999999,
};
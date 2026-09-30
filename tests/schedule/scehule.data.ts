// tests/schedule/schedule-data.ts

export const scheduleTestData = {
  /**
   * Schedule search date
   * Format: DD-MM-YYYY
   */
  date: process.env.SCHEDULE_TEST_DATE ?? '',

  /**
   * Required by Schedule API
   * Need valid IDs from Location API
   */
  fromLocation: Number(
    process.env.SCHEDULE_FROM_LOCATION,
  ),

  toLocation: Number(
    process.env.SCHEDULE_TO_LOCATION,
  ),

  page: 1,

  pageSize: 10,
};
import { test, expect } from '../../fixtures/api.fixure';
import { scheduleTestData } from './scehule.data';

type Schedule = {
  id: number;
  departureAt: string;
  arrivalAt: string;
  fromLocation: {
    id: number;
    name: string;
  };
  toLocation: {
    id: number;
    name: string;
  };
  merchant: {
    id: number;
  };
  availableSeats: number;
  totalSeats: number;
};


test.describe(
  'Schedule List API - GET /api/schedule/v1/list',
  () => {


    test(
      'SCHEDULE-LIST-001: get schedules with valid parameters',
      async ({ apiClient }) => {


        const response =
          await apiClient.get(
            '/api/schedule/v1/list',
            {
              params: {
                date: scheduleTestData.date,

                fromLocation:
                  scheduleTestData.fromLocation,

                toLocation:
                  scheduleTestData.toLocation,

                page:
                  scheduleTestData.page,

                pageSize:
                  scheduleTestData.pageSize,
              },
            },
          );


        expect(
          response.status(),
          await response.text(),
        ).toBe(200);


        const body =
          await response.json();


        expect(
          Array.isArray(body.data),
        ).toBe(true);


        expect(body.page)
          .toEqual(expect.any(Number));


        expect(body.pageSize)
          .toEqual(expect.any(Number));


        expect(body.count)
          .toEqual(expect.any(Number));


        expect(body.hasNext)
          .toEqual(expect.any(Boolean));

      },
    );



    test(
      'SCHEDULE-LIST-002: validate schedule response fields',
      async ({ apiClient }) => {


        const response =
          await apiClient.get(
            '/api/schedule/v1/list',
            {
              params: {
                date:
                  scheduleTestData.date,

                fromLocation:
                  scheduleTestData.fromLocation,

                toLocation:
                  scheduleTestData.toLocation,
              },
            },
          );


        expect(response.status())
          .toBe(200);


        const body =
          await response.json();


        const schedules =
          body.data as Schedule[];



        for (const schedule of schedules) {


          expect(schedule.id)
            .toEqual(expect.any(Number));


          expect(schedule.departureAt)
            .toEqual(expect.any(String));


          expect(schedule.arrivalAt)
            .toEqual(expect.any(String));


          expect(schedule.fromLocation.id)
            .toEqual(expect.any(Number));


          expect(schedule.toLocation.id)
            .toEqual(expect.any(Number));


          expect(schedule.merchant.id)
            .toEqual(expect.any(Number));


          expect(schedule.availableSeats)
            .toEqual(expect.any(Number));


          expect(schedule.totalSeats)
            .toEqual(expect.any(Number));


          expect(
            schedule.availableSeats,
          )
            .toBeLessThanOrEqual(
              schedule.totalSeats,
            );

        }

      },
    );



    test(
      'SCHEDULE-LIST-003: validate pagination pageSize',
      async ({ apiClient }) => {


        const response =
          await apiClient.get(
            '/api/schedule/v1/list',
            {
              params: {
                date:
                  scheduleTestData.date,

                fromLocation:
                  scheduleTestData.fromLocation,

                toLocation:
                  scheduleTestData.toLocation,
                  page: 1,  

                pageSize: 5,
              },
            },
          );


        const body =
          await response.json();


        expect(body.data.length)
          .toBeLessThanOrEqual(5);

      },
    );



    test(
      'SCHEDULE-LIST-004: filter schedule by location',
      async ({ apiClient }) => {


        const response =
          await apiClient.get(
            '/api/schedule/v1/list',
            {
              params: {
                date:
                  scheduleTestData.date,

                fromLocation:
                  scheduleTestData.fromLocation,

                toLocation:
                  scheduleTestData.toLocation,
              },
            },
          );


        const body =
          await response.json();



        for (const item of body.data) {


          expect(
            item.fromLocation.id,
          )
            .toBe(
              scheduleTestData.fromLocation,
            );


          expect(
            item.toLocation.id,
          )
            .toBe(
              scheduleTestData.toLocation,
            );

        }

      },
    );



    test(
      'SCHEDULE-LIST-005: invalid date format rejected',
      async ({ apiClient }) => {


        const response =
          await apiClient.get(
            '/api/schedule/v1/list',
            {
              params: {

                date: '2026-10-30',

                fromLocation:
                  scheduleTestData.fromLocation,

                toLocation:
                  scheduleTestData.toLocation,

              },
            },
          );


        expect(
          [400, 422],
        )
          .toContain(
            response.status(),
          );

      },
    );



    test(
      'SCHEDULE-LIST-006: missing date rejected',
      async ({ apiClient }) => {


        const response =
          await apiClient.get(
            '/api/schedule/v1/list',
            {
              params: {

                fromLocation:
                  scheduleTestData.fromLocation,

                toLocation:
                  scheduleTestData.toLocation,

              },
            },
          );


        expect(
          [400, 422],
        )
          .toContain(
            response.status(),
          );

      },
    );



  },
);
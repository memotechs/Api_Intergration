import { test, expect } from '../../fixtures/api.fixure';
import { scheduleTestData } from './scehule.data';



test.describe(
  'Schedule Detail API - GET /api/schedule/v1/{id}',
  () => {



    test(
      'SCHEDULE-DETAIL-001: get schedule detail by id',
      async ({ apiClient }) => {


        // First get schedule ID from list API

        const listResponse =
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

                pageSize: 1,

              },
            },
          );



        expect(listResponse.status())
          .toBe(200);



        const list =
          await listResponse.json();



        test.skip(
          list.data.length === 0,
          'No schedule available',
        );



        const schedule =
          list.data[0];



        const response =
          await apiClient.get(
            `/api/schedule/v1/${schedule.id}`,
            {
              params: {

                date:
                  scheduleTestData.date,

                merchantId:
                  schedule.merchant.id,

              },
            },
          );



        expect(
          response.status(),
          await response.text(),
        )
          .toBe(200);



        const detail =
          await response.json();



        expect(detail.id)
          .toBe(schedule.id);



        expect(
          detail.fromLocation.id,
        )
          .toBe(
            schedule.fromLocation.id,
          );



        expect(
          detail.toLocation.id,
        )
          .toBe(
            schedule.toLocation.id,
          );



      },
    );




    test(
      'SCHEDULE-DETAIL-002: missing merchantId rejected',
      async ({ apiClient }) => {


        const response =
          await apiClient.get(
            '/api/schedule/v1/1',
            {
              params: {

                date:
                  scheduleTestData.date,

              },
            },
          );


        expect(
          [400,401,403,422],
        )
          .toContain(
            response.status(),
          );

      },
    );



  },
);
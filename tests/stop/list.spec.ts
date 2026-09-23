import { test, expect } from '../../fixtures/api.fixure';
import type { ApiClient } from '../../src/api-client';
import { stopTestData } from '../../test-data/stop';

import {
  expectAscending,
  expectAuthenticationRejected,
  expectControlledResponse,
  expectDescending,
  expectJsonResponse,
  expectNoDuplicateIds,
  expectNoSensitiveData,
  expectValidStop,
  extractStops,
  readBody,
} from './stop-helpers';


const endpoint = '/api/stop/v1/list';


async function discoverStops(
  apiClient: ApiClient,
) {
  const response = await apiClient.get(endpoint, {
    params: {
      page: 1,
      pageSize: 20,
    },
  });


  expect(response.status()).toBe(200);


  const body = await readBody(response);

  return extractStops(body);
}



test.describe(
  'Stops API — Stop List',
  {
    tag: [
      '@stop',
      '@regression',
    ],
  },
  () => {


    test(
      'STOP-LIST-001: get default stop list',
      {
        tag: '@smoke',
      },
      async ({ apiClient }) => {


        const response =
          await apiClient.get(endpoint);


        expect(response.status()).toBe(200);

        expectJsonResponse(response);


        const body =
          await readBody(response);


        expectNoSensitiveData(body);

      },
    );



    test(
      'STOP-LIST-002: validate stop response schema',
      async ({ apiClient }) => {


        const response =
          await apiClient.get(endpoint,{
            params:{
              page:1,
              pageSize:20,
            },
          });


        expect(response.status()).toBe(200);


        const body =
          await readBody(response);


        const stops =
          extractStops(body);



        for(const stop of stops){

          expectValidStop(stop);

        }


        expectNoDuplicateIds(stops);

      },
    );



    test(
      'STOP-LIST-003: search stop by full name',
      async ({ apiClient }) => {


        const stops =
          await discoverStops(apiClient);



        test.skip(
          stops.length === 0,
          'No stop data available',
        );



        const searchValue =
          stops[0].name;



        const response =
          await apiClient.get(endpoint,{
            params:{
              query:searchValue,
            },
          });



        expect(response.status()).toBe(200);



        const body =
          await readBody(response);



        const results =
          extractStops(body);



        expect(results.length)
          .toBeGreaterThan(0);



        expect(
          results.some(
            stop =>
              stop.name
              .toLowerCase()
              .includes(
                searchValue.toLowerCase(),
              ),
          ),
        )
        .toBe(true);


      },
    );



    test(
      'STOP-LIST-004: search stop by partial name',
      async ({ apiClient }) => {



        const stops =
          await discoverStops(apiClient);



        test.skip(
          stops.length === 0,
          'No stop data available',
        );



        const searchValue =
          stops[0]
          .name
          .substring(0,3);



        const response =
          await apiClient.get(endpoint,{
            params:{
              query:searchValue,
            },
          });



        expect(response.status())
          .toBe(200);



        const results =
          extractStops(
            await readBody(response),
          );


        expect(results.length)
          .toBeGreaterThan(0);


      },
    );



    test(
      'STOP-LIST-005: nonexistent search returns empty result',
      async ({ apiClient }) => {



        const response =
          await apiClient.get(endpoint,{
            params:{
              query:
              stopTestData.nonexistentSearch,
            },
          });



        expect(response.status())
          .toBe(200);



        const results =
          extractStops(
            await readBody(response),
          );



        expect(results)
          .toHaveLength(0);


      },
    );



    test(
      'STOP-LIST-006: validate pagination metadata',
      async ({ apiClient }) => {



        const response =
          await apiClient.get(endpoint,{
            params:{
              page:1,
              pageSize:10,
            },
          });



        expect(response.status())
          .toBe(200);



        const body =
          await readBody(response);



        expect(body)
          .toHaveProperty('page');

        expect(body)
          .toHaveProperty('pageSize');

        expect(body)
          .toHaveProperty('hasNext');


      },
    );



    test(
      'STOP-LIST-007: pagination should not duplicate records',
      async ({ apiClient }) => {



        const first =
          await apiClient.get(endpoint,{
            params:{
              page:1,
              pageSize:5,
              sortBy:'id',
              orderBy:'ASC',
            },
          });



        const second =
          await apiClient.get(endpoint,{
            params:{
              page:2,
              pageSize:5,
              sortBy:'id',
              orderBy:'ASC',
            },
          });



        const firstIds =
          extractStops(
            await readBody(first),
          )
          .map(
            stop=>stop.id,
          );



        const secondIds =
          extractStops(
            await readBody(second),
          )
          .map(
            stop=>stop.id,
          );



        for(const id of secondIds){

          expect(firstIds)
          .not
          .toContain(id);

        }


      },
    );



    test(
      'STOP-LIST-008: ASC sorting',
      async ({ apiClient }) => {



        const response =
          await apiClient.get(endpoint,{
            params:{
              sortBy:'id',
              orderBy:'ASC',
            },
          });



        const ids =
          extractStops(
            await readBody(response),
          )
          .map(
            stop=>stop.id,
          );



        expectAscending(ids);


      },
    );



    test(
      'STOP-LIST-009: DESC sorting',
      async ({ apiClient }) => {



        const response =
          await apiClient.get(endpoint,{
            params:{
              sortBy:'id',
              orderBy:'DESC',
            },
          });



        const ids =
          extractStops(
            await readBody(response),
          )
          .map(
            stop=>stop.id,
          );



        expectDescending(ids);


      },
    );



    test(
      'STOP-LIST-010: include one stop ID',
      async ({ apiClient }) => {



        const stops =
          await discoverStops(apiClient);



        test.skip(
          stops.length===0,
          'No stop available',
        );



        const includedId =
          stops[0].id;



        const response =
          await apiClient.get(endpoint,{
            params:{
              includeIds:[
                includedId,
              ],
            },
          });



        const results =
          extractStops(
            await readBody(response),
          );



        expect(
          results.some(
            stop =>
            stop.id===includedId,
          ),
        )
        .toBe(true);


      },
    );



    test(
      'STOP-LIST-011: include multiple stop IDs',
      async ({ apiClient }) => {



        const stops =
          await discoverStops(apiClient);



        test.skip(
          stops.length < 2,
          'Need two stops',
        );



        const ids =
          stops
          .slice(0,2)
          .map(
            stop=>stop.id,
          );



        const response =
          await apiClient.get(endpoint,{
            params:{
              includeIds:ids,
            },
          });



        const results =
          extractStops(
            await readBody(response),
          );



        for(const id of ids){

          expect(
            results.some(
              stop=>stop.id===id,
            ),
          )
          .toBe(true);

        }


      },
    );



    test(
      'STOP-LIST-012: exclude stop ID',
      async ({ apiClient }) => {



        const stops =
          await discoverStops(apiClient);



        const excludedId =
          stops[0].id;



        const response =
          await apiClient.get(endpoint,{
            params:{
              excludeIds:[
                excludedId,
              ],
            },
          });



        const results =
          extractStops(
            await readBody(response),
          );



        expect(
          results.some(
            stop =>
            stop.id===excludedId,
          ),
        )
        .toBe(false);


      },
    );



    test(
      'STOP-LIST-013: combined query filters',
      async ({ apiClient }) => {



        const response =
          await apiClient.get(endpoint,{
            params:{
              page:1,
              pageSize:10,
              sortBy:'id',
              orderBy:'ASC',
              query:'Phnom',
            },
          });



        expect(response.status())
        .toBe(200);


      },
    );



    test.describe(
      'Authentication',
      () => {



        const cases = [
          {
            name:'missing auth',
            mode:'missing' as const,
          },
          {
            name:'invalid username',
            mode:'invalid-username' as const,
          },
          {
            name:'invalid password',
            mode:'invalid-password' as const,
          },
          {
            name:'malformed auth',
            mode:'malformed' as const,
          },
        ];



        for(const item of cases){


          test(
            `STOP-LIST-AUTH: ${item.name}`,
            async ({ apiClient }) => {


              const response =
                await apiClient.get(endpoint,{
                  authMode:item.mode,
                });



              expectAuthenticationRejected(
                response,
              );


              expectControlledResponse(
                response,
              );


            },
          );


        }


      },
    );



  },
);
/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { StatusCode } from 'grpc-web';
import { cold } from 'jasmine-marbles';
import { merge, Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import * as fromDispatcher from 'src/app/core/selectors/dispatcher.selectors';
import PreSolveShipmentSelectors from 'src/app/core/selectors/pre-solve-shipment.selectors';
import PreSolveVehicleSelectors from 'src/app/core/selectors/pre-solve-vehicle.selectors';
import * as fromShipment from 'src/app/core/selectors/shipment.selectors';
import * as fromVehicle from 'src/app/core/selectors/vehicle.selectors';
import { DispatcherApiActions } from '../actions';
import { optimizeTours } from '../actions/dispatcher-api.actions';
import { loadSolution } from '../actions/dispatcher.actions';
import { ElapsedSolution, Scenario, Solution } from '../models';
import RequestSettingsSelectors from '../selectors/request-settings.selectors';
import { DispatcherClient, NormalizationService, OptimizeToursMessageService } from '../services';
import { DispatcherApiEffects } from './dispatcher-api.effects';

/** @remarks based on {@link https://stackoverflow.com/questions/57406445/rxjs-marble-testing-retrywhen} */
const createRetryableStream = (...resp$: any[]): any => {
  const send = jasmine.createSpy('send');
  send.and.returnValues(...resp$);

  return of(null).pipe(switchMap(() => send()));
};

const createTestScheduler = (): TestScheduler =>
  new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

describe('DispatcherApiEffects', () => {
  let actions$: Observable<any>;
  let effects: DispatcherApiEffects;
  let store: MockStore<any>;
  let dispatcherClient: jasmine.SpyObj<DispatcherClient>;
  let _normalizationService: jasmine.SpyObj<NormalizationService>;
  let optimizeToursMessageService: jasmine.SpyObj<OptimizeToursMessageService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: DispatcherClient,
          useValue: jasmine.createSpyObj('dispatcherClient', ['optimizeTours']),
        },
        {
          provide: NormalizationService,
          useValue: jasmine.createSpyObj('normalizationService', ['normalizeSolution']),
        },
        {
          provide: OptimizeToursMessageService,
          useValue: jasmine.createSpyObj('optimizeToursMessageService', [
            'error',
            'generateMessagesForSolution',
          ]),
        },
        DispatcherApiEffects,
        provideMockStore({
          selectors: [
            { selector: fromDispatcher.selectSolution, value: null },
            {
              selector: fromShipment.selectShipmentState,
              value: { shipments: { entities: {}, ids: [] } },
            },
            {
              selector: fromVehicle.selectVehicleState,
              value: { vehicles: { entities: {}, ids: [] } },
            },
            { selector: RequestSettingsSelectors.selectTimeout, value: 0 },
            { selector: PreSolveShipmentSelectors.selectSelected, value: [] },
            { selector: PreSolveVehicleSelectors.selectSelected, value: [] },
          ],
        }),
        provideMockActions(() => actions$),
      ],
    });

    store = TestBed.inject(Store) as MockStore<any>;

    actions$ = TestBed.inject(Actions);
    effects = TestBed.inject(DispatcherApiEffects);
    dispatcherClient = TestBed.inject(DispatcherClient) as jasmine.SpyObj<DispatcherClient>;
    _normalizationService = TestBed.inject(
      NormalizationService
    ) as jasmine.SpyObj<NormalizationService>;
    optimizeToursMessageService = TestBed.inject(
      OptimizeToursMessageService
    ) as jasmine.SpyObj<OptimizeToursMessageService>;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('optimizeTours$', () => {
    it('should dispatch optimize tours success', () => {
      const elapsedSolution: ElapsedSolution = {
        scenario: {},
        solution: { totalCost: 42 },
        elapsedTime: Date.now(),
        requestTime: Date.now(),
        batchTime: Date.now(),
      };
      dispatcherClient.optimizeTours.and.callFake(() => of(elapsedSolution));
      actions$ = merge(
        cold('-a----', { a: optimizeTours({ scenario: {} }) }),
        store.scannedActions$
      );
      expect(effects.optimizeTours$).toBeObservable(
        cold('-a----', {
          a: DispatcherApiActions.optimizeToursSuccess({
            elapsedSolution,
            requestedShipmentIds: [],
            requestedVehicleIds: [],
          }),
        })
      );
      expect(dispatcherClient.optimizeTours).toHaveBeenCalledTimes(1);
    });

    it('should dispatch optimize tours failure', () => {
      const error = { message: 'foo', requestTime: Date.now() };
      dispatcherClient.optimizeTours.and.callFake(() => throwError(error));
      createTestScheduler().run(({ expectObservable }) => {
        actions$ = merge(
          cold('-a----', { a: optimizeTours({ scenario: {} }) }),
          store.scannedActions$
        );
        expectObservable(effects.optimizeTours$).toBe('- a', {
          a: DispatcherApiActions.optimizeToursFailure({
            error,
          }),
        });
      });
    });

    it('should retry', () => {
      const error = { message: 'foo', code: StatusCode.UNAVAILABLE, requestTime: Date.now() };
      const elapsedSolution: ElapsedSolution = {
        scenario: {},
        solution: { totalCost: 42 },
        elapsedTime: Date.now(),
        requestTime: Date.now(),
        batchTime: Date.now(),
      };
      const source = createRetryableStream(throwError(error), of(elapsedSolution));
      dispatcherClient.optimizeTours.and.callFake(() => source);
      createTestScheduler().run(({ expectObservable }) => {
        actions$ = merge(
          cold('-a----', { a: optimizeTours({ scenario: {} }) }),
          store.scannedActions$
        );
        expectObservable(effects.optimizeTours$).toBe('- 1s a', {
          a: DispatcherApiActions.optimizeToursSuccess({
            elapsedSolution,
            requestedShipmentIds: [],
            requestedVehicleIds: [],
          }),
        });
      });
    });
  });

  describe('generateMessagesForSolution$', () => {
    it('should check solution for messages', () => {
      const scenario: Scenario = {};
      const solution: Solution = { totalCost: 0 };
      const elapsedSolution = {
        scenario,
        solution,
        elapsedTime: Date.now(),
        requestTime: Date.now(),
      };
      actions$ = cold('-a----', {
        a: loadSolution({
          elapsedSolution,
          requestedShipmentIds: [],
          requestedVehicleIds: [],
          shipmentRoutes: [],
          visits: [],
          skippedShipments: [],
          skippedShipmentReasons: {},
        }),
      });
      effects.generateMessagesForSolution$.subscribe(() => {
        expect(optimizeToursMessageService.generateMessagesForSolution).toHaveBeenCalledWith(
          solution,
          scenario
        );
        expect(optimizeToursMessageService.generateMessagesForSolution).toHaveBeenCalledTimes(1);
      });
    });
  });
});

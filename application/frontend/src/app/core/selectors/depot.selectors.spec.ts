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

import { Vehicle } from '../models';
import * as fromDepot from './depot.selectors';

describe('Depot Selectors', () => {
  it('should create depot from provided depot', () => {
    const scenarioDepot = {
      latitude: 40.5,
      longitude: -104.5,
    };
    const depot = fromDepot.selectDepot.projector(scenarioDepot, []);
    expect(depot).toBeTruthy();
    expect(depot.latitude).toEqual(scenarioDepot.latitude);
    expect(depot.longitude).toEqual(scenarioDepot.longitude);
  });

  it('should create depot from coincident vehicles', () => {
    const vehicles = [
      {
        startWaypoint: {
          location: {
            latLng: {
              latitude: 40.0,
              longitude: -104.0,
            },
          },
        },
        endWaypoint: {
          location: {
            latLng: {
              latitude: 40.0,
              longitude: -104.0,
            },
          },
        },
      },
      {
        startWaypoint: {
          location: {
            latLng: {
              latitude: 40.0,
              longitude: -104.0,
            },
          },
        },
        endWaypoint: {
          location: {
            latLng: {
              latitude: 40.0,
              longitude: -104.0,
            },
          },
        },
      },
    ] as Vehicle[];

    const depot = fromDepot.selectDepot.projector(null, vehicles);
    expect(depot).toBeTruthy();
    expect(depot.latitude).toEqual(vehicles[0].startWaypoint.location.latLng.latitude);
    expect(depot.longitude).toEqual(vehicles[0].startWaypoint.location.latLng.longitude);
  });

  it('should NOT create depot for NON-coincident vehicles', () => {
    const vehicles = [
      {
        startWaypoint: {
          location: {
            latLng: {
              latitude: 40.0,
              longitude: -104.0,
            },
          },
        },
        endWaypoint: {
          location: {
            latLng: {
              latitude: 40.0,
              longitude: -104.0,
            },
          },
        },
      },
      {
        startWaypoint: {
          location: {
            latLng: {
              latitude: 41.0,
              longitude: -104.0,
            },
          },
        },
        endWaypoint: {
          location: {
            latLng: {
              latitude: 41.0,
              longitude: -104.0,
            },
          },
        },
      },
    ] as Vehicle[];

    const depot = fromDepot.selectDepot.projector(null, vehicles);
    expect(depot).toBeNull();
  });
});

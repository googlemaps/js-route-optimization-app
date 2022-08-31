/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Vehicle } from '../models';
import * as fromDepot from './depot.selectors';

describe('Depot Selectors', () => {
  it('should create depot from provided depot', () => {
    const scenarioDepot = {
      latitude: 40.5,
      longitude: -104.5,
    };
    const depot = fromDepot.selectDepot.projector(scenarioDepot);
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

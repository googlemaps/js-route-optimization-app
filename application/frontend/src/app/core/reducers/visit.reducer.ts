/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { DispatcherActions, EditVisitActions, PoiActions, VisitActions } from '../actions';
import { Visit } from '../models/visit.model';

export const visitsFeatureKey = 'visits';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface State extends EntityState<Visit> {
  // additional entities state properties
}

export const adapter: EntityAdapter<Visit> = createEntityAdapter<Visit>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export const reducer = createReducer(
  initialState,
  on(VisitActions.addVisit, (state, action) => adapter.addOne(action.visit, state)),
  on(VisitActions.upsertVisit, (state, action) => adapter.upsertOne(action.visit, state)),
  on(VisitActions.addVisits, (state, action) => adapter.addMany(action.visits, state)),
  on(
    VisitActions.upsertVisits,
    EditVisitActions.commitChanges,
    PoiActions.saveSuccess,
    (state, action) => adapter.upsertMany(action.visits, state)
  ),
  on(VisitActions.updateVisit, (state, action) => adapter.updateOne(action.visit, state)),
  on(VisitActions.updateVisits, (state, action) => adapter.updateMany(action.visits, state)),
  on(VisitActions.deleteVisit, (state, action) => adapter.removeOne(action.id, state)),
  on(VisitActions.deleteVisits, (state, action) => adapter.removeMany(action.ids, state)),
  on(VisitActions.loadVisits, DispatcherActions.loadSolution, (state, action) =>
    adapter.setAll(action.visits, state)
  ),
  on(
    VisitActions.clearVisits,
    DispatcherActions.uploadScenarioSuccess,
    DispatcherActions.clearSolution,
    (state) => adapter.removeAll(state)
  )
);

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();

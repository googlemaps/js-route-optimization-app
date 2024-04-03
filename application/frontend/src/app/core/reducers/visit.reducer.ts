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

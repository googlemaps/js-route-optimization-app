/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import RoutesChartSelectors from 'src/app/core/selectors/routes-chart.selectors';
import * as fromUI from 'src/app/core/selectors/ui.selectors';
import * as fromRoot from 'src/app/reducers';
import { Range } from 'src/app/shared/models';
import { PostSolveControlBarActions, UndoRedoActions } from '../../actions';
import { toggleMap } from '../../actions/map.actions';
import { Page } from '../../models';
import * as fromConfig from '../../selectors/config.selectors';
import * as fromScenario from '../../selectors/scenario.selectors';
import * as fromUndoRedo from '../../selectors/undo-redo.selectors';

@Component({
  selector: 'app-post-solve-control-bar',
  templateUrl: './post-solve-control-bar.component.html',
  styleUrls: ['./post-solve-control-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostSolveControlBarComponent implements OnInit {
  disabled$: Observable<boolean>;
  page$: Observable<Page>;
  range$: Observable<Range>;
  rangeOffset$: Observable<number>;
  nowRangeOffset$: Observable<number>;
  previousRangeOffset$: Observable<number>;
  nextRangeOffset$: Observable<number>;
  timezoneOffset$: Observable<number>;
  canUndo$: Observable<boolean>;
  canRedo$: Observable<boolean>;

  get Page(): typeof Page {
    return Page;
  }

  constructor(private router: Router, private store: Store<fromRoot.State>) {}

  ngOnInit(): void {
    this.disabled$ = this.store.pipe(select(fromScenario.selectChangeDisabled));
    this.page$ = this.store.pipe(
      select(fromUI.selectPage),
      map((page) => (page === Page.ShipmentsMetadata ? Page.RoutesMetadata : page))
    );
    this.range$ = this.store.pipe(select(RoutesChartSelectors.selectSelectedRange));
    this.rangeOffset$ = this.store.pipe(select(RoutesChartSelectors.selectRangeOffset));
    this.nowRangeOffset$ = this.store.pipe(select(RoutesChartSelectors.selectNowRangeOffset));
    this.previousRangeOffset$ = this.store.pipe(
      select(RoutesChartSelectors.selectPreviousRangeOffset)
    );
    this.nextRangeOffset$ = this.store.pipe(select(RoutesChartSelectors.selectNextRangeOffset));
    this.timezoneOffset$ = this.store.pipe(select(fromConfig.selectTimezoneOffset));
    this.canUndo$ = this.store.pipe(select(fromUndoRedo.selectCanUndo));
    this.canRedo$ = this.store.pipe(select(fromUndoRedo.selectCanRedo));
  }

  onRangeOffsetChange(rangeOffset: number): void {
    this.store.dispatch(PostSolveControlBarActions.changeRangeOffset({ rangeOffset }));
  }

  onToggleMap(): void {
    this.store.dispatch(toggleMap());
  }

  onToggleChange(selection: Page): void {
    this.router.navigateByUrl('/' + selection, { skipLocationChange: true });
  }

  onUndo(): void {
    this.store.dispatch(UndoRedoActions.undo());
  }

  onRedo(): void {
    this.store.dispatch(UndoRedoActions.redo());
  }
}

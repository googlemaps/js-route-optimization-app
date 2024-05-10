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

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { select, Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import * as fromRoot from 'src/app/reducers';
import { UIActions } from '../../actions';
import { Page } from '../../models';
import DispatcherApiSelectors from '../../selectors/dispatcher-api.selectors';
import * as fromUI from '../../selectors/ui.selectors';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly hasMap$: Observable<boolean>;
  readonly loading$: Observable<boolean>;
  readonly started$: Observable<boolean>;
  readonly splitSizes$: Observable<number[]>;
  readonly page$: Observable<Page>;

  constructor(
    domSanitizer: DomSanitizer,
    matIconRegistry: MatIconRegistry,
    private store: Store<fromRoot.State>
  ) {
    const icons = [
      'access_time',
      'add',
      'add_color',
      'add_vehicle',
      'arrow_back',
      'arrow_downward',
      'arrow_drop_down',
      'arrow_upward',
      'bookmark',
      'calendar',
      'check',
      'clear',
      'clock',
      'cloud_download',
      'cloud_upload',
      'cloud_upload_filled',
      'csv',
      'csv2',
      'dataset',
      'delete',
      'depot_outline',
      'dropdown',
      'dropoff',
      'edit',
      'help',
      'help-filled',
      'input',
      'json',
      'map',
      'maps',
      'more_vert',
      'navigate_before',
      'navigate_next',
      'open_in_new',
      'pdf',
      'pickup',
      'route',
      'satellite',
      'save_alt',
      'settings',
      'toc_rtl',
      'trending_up',
      'update',
      'upload',
      'upload_alt',
      'visibility',
      'visibility_off',
      'visit',
      'vehicles_nav',
      'shipments_nav',
      'select_bbox',
      'select_bbox_active',
      'select_polygon',
      'select_polygon_active',
      'zip',
    ];
    icons.forEach((icon) =>
      matIconRegistry.addSvgIcon(
        icon,
        domSanitizer.bypassSecurityTrustResourceUrl(`./assets/images/${icon}.svg`)
      )
    );
    this.started$ = store.pipe(select(fromUI.selectStarted));
    this.hasMap$ = combineLatest([
      store.select(fromUI.selectHasMap),
      store.select(fromUI.selectStarted),
    ]).pipe(
      map(([hasMap, hasStarted]) => {
        return hasMap && hasStarted;
      })
    );
    this.loading$ = store.pipe(select(DispatcherApiSelectors.selectOptimizeToursLoading));
    this.splitSizes$ = store.pipe(select(fromUI.selectSplitSizes));
    this.page$ = store.pipe(select(fromUI.selectPage));
  }

  onSplitSizesChange(splitSizes: number[]): void {
    this.store.dispatch(UIActions.changeSplitSizes({ splitSizes }));
  }
}

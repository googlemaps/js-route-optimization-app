/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { SearchResult, StorageFile, StoredSolution } from '../models/storage-api';
import { selectStorageApi } from '../selectors/config.selectors';

@Injectable({
  providedIn: 'root',
})
export class StorageApiService {
  apiRoot: string;

  constructor(private http: HttpClient, private store: Store) {
    this.store
      .pipe(select(selectStorageApi), take(1))
      .subscribe((api) => (this.apiRoot = api.apiRoot));
  }

  search(
    searchScenarios = true,
    startsWith?: string,
    pageToken?: string,
    maxResults = 100
  ): Observable<SearchResult[]> {
    let params = new HttpParams().set('limit', maxResults.toString());
    if (startsWith) {
      params = params.set('startsWith', startsWith);
    }
    if (pageToken) {
      params = params.set('pageToken', pageToken);
    }
    const path = searchScenarios ? 'scenarios' : 'solutions';
    return this.http.get<SearchResult[]>(`${this.apiRoot}/${path}`, { params });
  }

  loadFile(filename: string, isScenario = true): Observable<StorageFile | StoredSolution> {
    const path = isScenario ? 'scenarios' : 'solutions';
    return this.http.get<StorageFile>(`${this.apiRoot}/${path}/${filename}`);
  }

  saveFile(data: any, filename: string, isScenario = true): Observable<any> {
    const path = isScenario ? 'scenarios' : 'solutions';
    return this.http.put(`${this.apiRoot}/${path}/${filename}`, data);
  }

  exists(filename: string, isScenario = true): Observable<{ status: boolean; name: string }> {
    const params = new HttpParams().set('prefix', isScenario ? 'scenarios' : 'solutions');
    return this.http.get<{ status: boolean; name: string }>(`${this.apiRoot}/status/${filename}`, {
      params,
    });
  }

  deleteFile(filename: string, isScenario = true): Observable<any> {
    const path = isScenario ? 'scenarios' : 'solutions';
    return this.http.delete(`${this.apiRoot}/${path}/${filename}`, { responseType: 'text' });
  }
}

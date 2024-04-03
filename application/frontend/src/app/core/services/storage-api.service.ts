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

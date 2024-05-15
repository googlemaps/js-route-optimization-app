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

import { HttpClient } from '@angular/common/http';
import { marked } from 'marked';
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';

@Component({
  selector: 'app-base-documentation-dialog',
  templateUrl: './base-documentation-dialog.component.html',
  styleUrls: ['./base-documentation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseDocumentationDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dialogContent') dialogContent: ElementRef;

  listeners: any[] = [];

  constructor(
    private changeRef: ChangeDetectorRef,
    private http: HttpClient,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    this.http.get('assets/docs/documentation.md', { responseType: 'text' }).subscribe((data) => {
      marked.use({
        baseUrl: 'assets/docs/',
        renderer: this.buildRenderer(),
      });
      this.dialogContent.nativeElement.innerHTML = marked(data);
      this.addListeners();
      this.changeRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.listeners.forEach((l) => l());
  }

  navigateTo(fragment: string): void {
    const target =
      document.querySelector(`#${fragment}`) || document.querySelector(`[name='${fragment}']`);
    target?.scrollIntoView();
  }

  addListeners(): void {
    this.dialogContent.nativeElement.querySelectorAll('a').forEach((link) => {
      if (link.getAttribute('fragment')) {
        this.listeners.push(
          this.renderer.listen(link, 'click', () => this.navigateTo(link.getAttribute('fragment')))
        );
      }
    });
  }

  buildRenderer(): { link(href: any, title: any, text: any): string } {
    return {
      link(href, title, text) {
        const titleAttribute = title ? `title=${title}` : '';
        if (href[0] === '#') {
          const fragment = href.replace('#', '');
          return `<a href="javascript:void(0)" fragment=${fragment} ${titleAttribute}>${text}</a>`;
        } else {
          return `<a href=${href} target="_blank" ${titleAttribute}>${text}</a>`;
        }
      },
    };
  }
}

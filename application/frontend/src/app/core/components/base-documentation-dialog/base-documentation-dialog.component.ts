/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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

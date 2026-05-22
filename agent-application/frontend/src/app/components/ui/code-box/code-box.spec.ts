/*
Copyright 2026 Google LLC

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

import { NgOptimizedImage } from '@angular/common';
import { Directive, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Highlight } from 'ngx-highlightjs';
import { vi } from 'vitest';
import { CodeBoxComponent } from './code-box';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[highlight]',
  standalone: true,
})
class MockHighlight {
  // mock the input so Angular doesn't throw an error when it sees [highlight]="code"
  @Input() highlight!: string;
}

describe('CodeBoxComponent', () => {
  let fixture: ComponentFixture<CodeBoxComponent>;
  let component: CodeBoxComponent;

  // --- Test Data ---
  const longCode = Array(15).fill('console.log("line");').join('\n'); // 15 lines
  const shortCode = 'line 1\nline 2'; // A simple default
  const truncatedCode =
    Array.from({ length: 10 }, (_, _i) => 'console.log("line");').join('\n') + '\n...';
  const mockMessageId = 'messageId';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeBoxComponent, MatIconModule, MatTooltipModule, NgOptimizedImage],
      providers: [],
    })
      .overrideComponent(CodeBoxComponent, {
        // This stops the test from asking for global configuration.
        remove: { imports: [Highlight] },
        // This ensures that when the template renders <code [highlight]="...">,
        // it uses the simple MockHighlight class instead of crashing.
        add: { imports: [MockHighlight] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CodeBoxComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('code', shortCode);
    fixture.componentRef.setInput('messageId', mockMessageId);

    // Run initial change detection
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle collapse state using public method', () => {
    // Arrange
    expect(component.isCollapsed()).toBe(true);

    // Act
    component.toggleCollapse();
    fixture.detectChanges();

    // Assert
    expect(component.isCollapsed()).toBe(false);
  });

  it('should toggle fullscreen and emit event', () => {
    // Arrange
    const spy = vi.fn();
    component.fullScreenToggled.subscribe(spy);
    expect(component.isFullscreen()).toBe(false);

    // Act
    component.toggleFullscreen();
    fixture.detectChanges();

    // Assert
    expect(component.isFullscreen()).toBe(true);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should manage the "copied" state signal with a timer', fakeAsync(() => {
    component.copyCode(mockMessageId);
    fixture.detectChanges();

    // Assert
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((component as any).copiedMessageId()).toBe(mockMessageId);

    // Act + Assert
    tick(1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((component as any).copiedMessageId()).toBe(mockMessageId);

    // Act
    // simulate past 2s
    tick(1001);
    fixture.detectChanges();

    // Assert
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((component as any).copiedMessageId()).toBeNull();
  }));

  it('should truncate code when collapsed and not fullscreen', () => {
    // Arrange
    fixture.componentRef.setInput('code', longCode);
    fixture.detectChanges();

    // Act
    const visible = component.visibleCode();

    // Assert
    expect(visible).toBe(truncatedCode);
    expect(visible.split('\n').length).toBe(11); // 10 lines + "..."
  });

  it('should show full code when expanded', () => {
    // Arrange
    fixture.componentRef.setInput('code', longCode);
    component.toggleCollapse();
    fixture.detectChanges();

    // Act
    const visible = component.visibleCode();

    // Assert
    expect(visible).toBe(longCode);
  });

  it('should show full code when fullscreen (even if collapsed)', () => {
    // Arrange
    fixture.componentRef.setInput('code', longCode);
    component.toggleFullscreen();
    fixture.detectChanges();

    // Act
    const visible = component.visibleCode();

    // Assert
    expect(visible).toBe(longCode);
  });
});

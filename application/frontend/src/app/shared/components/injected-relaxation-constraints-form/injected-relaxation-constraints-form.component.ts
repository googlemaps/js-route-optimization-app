/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ControlContainer, UntypedFormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RelaxationLevel } from 'src/app/core/models';
import { RelaxationLevelNames } from 'src/app/util';

@Component({
  selector: 'app-injected-relaxation-constraints-form',
  templateUrl: './injected-relaxation-constraints-form.component.html',
  styleUrls: ['./injected-relaxation-constraints-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InjectedRelaxationConstraintsFormComponent implements OnDestroy, OnInit {
  @Input() appearance = 'standard';
  @Input() maxToShow: number;
  @Output() inputChange = new EventEmitter();
  @Output() removeThreshold = new EventEmitter<number>();

  RelaxationLevel = RelaxationLevel;
  RelaxationLevelNames = RelaxationLevelNames;
  relaxationLevelKeys = Object.keys(this.RelaxationLevelNames).slice(1);

  control: UntypedFormArray;
  changeSub: Subscription;

  constructor(
    public controlContainer: ControlContainer,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.control = this.controlContainer?.control as UntypedFormArray;
    this.changeSub = this.control?.valueChanges.subscribe(() => {
      this.changeDetector.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.changeSub?.unsubscribe();
  }
}

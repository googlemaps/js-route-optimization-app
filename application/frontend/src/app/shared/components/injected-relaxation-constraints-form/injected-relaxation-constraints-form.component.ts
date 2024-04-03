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

/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appGanttColumnHeader]',
})
export class GanttColumnHeaderDirective {
  constructor(public template: TemplateRef<any>) {}
}

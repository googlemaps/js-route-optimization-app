/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export interface RangeSliderTooltipFormatter {
  to: (value: number) => string;
  from: (value: string) => number;
}

export type RangeSliderTooltip = boolean | RangeSliderTooltipFormatter;

/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const timeRegex = /^\s*([0-9]?[0-9]):([0-9]{2})\s*(am|pm)?\s*$/i;

export const isValidTimeString = (text: string): boolean => {
  if (typeof text !== 'string') {
    return false;
  }
  const matchedText = text.match(timeRegex);
  if (!matchedText) {
    return false;
  }
  const minutes = +matchedText[2];
  if (minutes < 0 || minutes > 59) {
    return false;
  }
  const meridiem = matchedText[3];
  const hours = +matchedText[1];
  const minHour = meridiem ? 1 : 0;
  const maxHour = meridiem ? 12 : 23;
  if (hours < minHour || hours > maxHour) {
    return false;
  }
  return true;
};

export const getNormalTimeString = (text: string): string => {
  if (!isValidTimeString(text)) {
    return '';
  }
  const matchedText = text.match(timeRegex);
  const hours = +matchedText[1];
  const minutes = +matchedText[2];
  const meridiem = matchedText[3];
  const formattedHours = (meridiem?.toLowerCase() === 'pm' ? 12 + hours : hours)
    .toString()
    .padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return formattedHours + ':' + formattedMinutes;
};

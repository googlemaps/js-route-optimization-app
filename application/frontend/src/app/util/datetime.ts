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

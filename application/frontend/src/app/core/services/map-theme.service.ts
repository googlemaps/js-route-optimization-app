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

export enum ZIndex {
  Depot = 100,
  PostSolveVehicles = 80,
  PostSolveVisitRequests = 60,
  PreSolveVehicles = 40,
  PreSolveVisitsRequests = 20,
  Routes = 10,
}

// Material Theme 700
export const MATERIAL_COLORS = {
  Red: {
    name: 'red',
    hex: '#D32F2F',
    rgb: [211, 47, 47],
    strokeHex: '#B71C1C',
    strokeRgb: [183, 28, 28],
  },
  Pink: {
    name: 'pink',
    hex: '#C2185B',
    rgb: [194, 24, 91],
    strokeHex: '#880E4F',
    strokeRgb: [194, 24, 91],
  },
  Purple: {
    name: 'purple',
    hex: '#7B1FA2',
    rgb: [123, 31, 162],
    strokeHex: '#4A148C',
    strokeRgb: [74, 20, 140],
  },
  DeepPurple: {
    name: 'deep-purple',
    hex: '#512DA8',
    rgb: [81, 45, 168],
    strokeHex: '#311B92',
    strokeRgb: [49, 27, 146],
  },
  Indigo: {
    name: 'indigo',
    hex: '#303F9F',
    rgb: [48, 63, 159],
    strokeHex: '#1A237E',
    strokeRgb: [26, 35, 126],
  },
  Blue: {
    name: 'blue',
    hex: '#1976D2',
    rgb: [25, 118, 210],
    strokeHex: '#0D47A1',
    strokeRgb: [13, 71, 161],
  },
  LightBlue: {
    name: 'light-blue',
    hex: '#0288D1',
    rgb: [2, 136, 209],
    strokeHex: '#01579B',
    strokeRgb: [1, 87, 155],
  },
  Cyan: {
    name: 'cyan',
    hex: '#0097A7',
    rgb: [0, 151, 167],
    strokeHex: '#006064',
    strokeRgb: [0, 96, 100],
  },
  Teal: {
    name: 'teal',
    hex: '#00796B',
    rgb: [0, 121, 107],
    strokeHex: '#004D40',
    strokeRgb: [0, 77, 64],
  },
  Green: {
    name: 'green',
    hex: '#388E3C',
    rgb: [56, 142, 60],
    strokeHex: '#1B5E20',
    strokeRgb: [27, 94, 32],
  },
  LightGreen: {
    name: 'light-green',
    hex: '#689F38',
    rgb: [104, 159, 56],
    strokeHex: '#33691E',
    strokeRgb: [51, 105, 30],
  },
  Lime: {
    name: 'lime',
    hex: '#AFB42B',
    rgb: [175, 180, 43],
    strokeHex: '#827717',
    strokeRgb: [130, 119, 23],
  },
  Yellow: {
    name: 'yellow',
    hex: '#FBC02D',
    rgb: [251, 192, 45],
    strokeHex: '#F57F17',
    strokeRgb: [245, 127, 23],
  },
  Amber: {
    name: 'amber',
    hex: '#FFA000',
    rgb: [255, 160, 0],
    strokeHex: '#FF6F00',
    strokeRgb: [255, 111, 0],
  },
  Orange: {
    name: 'orange',
    hex: '#F57C00',
    rgb: [245, 124, 0],
    strokeHex: '#E65100',
    strokeRgb: [230, 81, 0],
  },
  DeepOrange: {
    name: 'deep-orange',
    hex: '#E64A19',
    rgb: [230, 74, 25],
    strokeHex: '#BF360C',
    strokeRgb: [191, 54, 12],
  },
  Brown: {
    name: 'brown',
    hex: '#5D4037',
    rgb: [93, 64, 55],
    strokeHex: '#3E2723',
    strokeRgb: [62, 39, 35],
  },
  Grey: {
    name: 'grey',
    hex: '#616161',
    rgb: [97, 97, 97],
    strokeHex: '#212121',
    strokeRgb: [33, 33, 33],
  },
  BlueGrey: {
    name: 'blue-grey',
    hex: '#455A64',
    rgb: [69, 90, 100],
    strokeHex: '#263238',
    strokeRgb: [38, 50, 56],
  },
  Black: {
    name: 'black',
    hex: '#000000',
    rgb: [0, 0, 0],
    strokeHex: '#000000',
    strokeRgb: [0, 0, 0],
  },
  White: {
    name: 'white',
    hex: '#ffffff',
    rgb: [255, 255, 255],
    strokeHex: '#ffffff',
    strokeRgb: [255, 255, 255],
  },
};

export const MATERIAL_COLORS_SELECTED = [
  MATERIAL_COLORS.Red,
  MATERIAL_COLORS.Blue,
  MATERIAL_COLORS.Green,
  MATERIAL_COLORS.Yellow,
  MATERIAL_COLORS.Brown,
  MATERIAL_COLORS.Grey,
  MATERIAL_COLORS.Pink,
  MATERIAL_COLORS.LightBlue,
  MATERIAL_COLORS.LightGreen,
  MATERIAL_COLORS.Amber,
  MATERIAL_COLORS.Purple,
  MATERIAL_COLORS.Cyan,
  MATERIAL_COLORS.Lime,
  MATERIAL_COLORS.DeepPurple,
  MATERIAL_COLORS.Teal,
  MATERIAL_COLORS.Orange,
  MATERIAL_COLORS.Indigo,
  MATERIAL_COLORS.DeepOrange,
];

export const getSelectedColors = (
  selected,
  selectedColors: [id: number, colorIdx: number][]
): [id: number, colorIdx: number][] => {
  const selectedColorMap = new Map<number, number>(selectedColors);
  if (!selected.length) {
    selectedColorMap.clear();
  }
  selected.forEach((id) => {
    if (!selectedColorMap.has(id)) {
      const nextColorIdx = getNextColorInSequence(selectedColorMap);
      selectedColorMap.set(id, nextColorIdx);
    }
  });
  return Array.from(selectedColorMap.entries());
};

const getNextColorInSequence = (selectedColorMap: Map<number, number>): number => {
  let nextColorIdx = 0;
  if (selectedColorMap.size) {
    const nextColor = Array.from(selectedColorMap)[selectedColorMap.size - 1][1] + 1;
    nextColorIdx =
      nextColor < MATERIAL_COLORS_SELECTED.length
        ? nextColor
        : nextColor % MATERIAL_COLORS_SELECTED.length;
  }
  return nextColorIdx;
};

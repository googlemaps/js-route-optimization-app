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

export interface MaterialColor {
  name: string;
  hex: string;
  rgb: [number, number, number];
  strokeHex: string;
  strokeRgb: [number, number, number];
}

// Material Theme 700
export const MATERIAL_COLORS: Record<string, MaterialColor> = {
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
  MATERIAL_COLORS['Red'],
  MATERIAL_COLORS['Blue'],
  MATERIAL_COLORS['Green'],
  MATERIAL_COLORS['Yellow'],
  MATERIAL_COLORS['Brown'],
  MATERIAL_COLORS['Grey'],
  MATERIAL_COLORS['Pink'],
  MATERIAL_COLORS['LightBlue'],
  MATERIAL_COLORS['LightGreen'],
  MATERIAL_COLORS['Amber'],
  MATERIAL_COLORS['Purple'],
  MATERIAL_COLORS['Cyan'],
  MATERIAL_COLORS['Lime'],
  MATERIAL_COLORS['DeepPurple'],
  MATERIAL_COLORS['Teal'],
  MATERIAL_COLORS['Orange'],
  MATERIAL_COLORS['Indigo'],
  MATERIAL_COLORS['DeepOrange'],
];

export const PICKUP_MARKER = `
        <svg width="100%" height="100%" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1,0,0,-1,-75,43)">
        <g transform="matrix(0.973684,0,0,0.973684,3.5,-12.0789)">
            <circle cx="95" cy="35" r="19" style="fill:white;stroke-width:4.11px;"/>
        </g>
        <g transform="matrix(0.431818,0,0,-0.330214,53.25,39.9873)">
            <path d="M77,66L99,42.943L121,66" style="fill:white;stroke-width:15.61px;"/>
        </g>
    </g>
</svg>
`;

export const VISIT_MARKER = `
<svg width="100%" height="100%" viewBox="0 0 300 94" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
    <g transform="matrix(1,0,0,1,-1,-192.5)">
        <path d="M300.999,239.5C300.999,265.444 280.09,286.5 254.335,286.5L47.664,286.5C21.909,286.5 1,265.444 1,239.5C1,213.556 21.909,192.5 47.664,192.5L254.335,192.5C280.09,192.5 300.999,213.556 300.999,239.5Z"/>
    </g>
    <g transform="matrix(1,0,0,1,-1,-192.5)">
        <ellipse cx="47.667" cy="239.587" rx="36.667" ry="36.929" style="fill:white;"/>
    </g>
    <g transform="matrix(1,0,0,1,-1,-192.5)">
        <path d="M26.167,230.91L47.667,248.264L69.167,230.91" style="fill:none;stroke-width:13.62px;"/>
    </g>
</svg>
`;

export const DEPOT_MARKER = `
<svg xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 33 26">
  <style type="text/css">
	.st0{fill:#2D5EAB;}
	.st1{fill:#FFFFFF;}
  </style>
  <path class="st0" d="M13.72,24.97v-8.33h5.55v8.33h6.94v-11.1h4.16L16.5,1.38L2.62,13.87h4.16v11.1H13.72z"/>
  <path class="st1" d="M16.5,1.38l13.88,12.49h-4.16v11.1h-6.94v-8.33h-5.55v8.33H6.78v-11.1H2.62L16.5,1.38 M16.5,0.02l-0.67,0.61  L1.95,13.12L0,14.87h2.62h3.16v10.1v1.01h1.01h6.94h1.01v-1.01v-7.32h3.54v7.32v1.01h1.01h6.94h1.01v-1.01v-10.1h3.16H33l-1.95-1.75  L17.17,0.63L16.5,0.02L16.5,0.02z"/>
</svg>
`;

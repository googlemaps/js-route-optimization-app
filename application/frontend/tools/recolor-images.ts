#!/usr/bin/env ts-node-script
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

// Creates one icon for each map theme color by applying color to stroke or fill.

// compile: npx tsc tools/recolor-images.ts
// run: node tools/recolor-images.js

import * as xml2js from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';
import * as mapTheme from '../src/app/core/services/map-theme.service';

const srcImages = {
  'pickup': { 'targetEl': 'path', 'targetAttr': 'stroke' },
  'dropoff': { 'targetEl': 'path', 'targetAttr': 'stroke' },
  'vehicle': { 'targetEl': 'polygon', 'targetAttr': 'fill' }
};

const writeXML = (data, dir, file) => {
  const builder = new xml2js.Builder();
  const xml = builder.buildObject(data);
  fs.writeFile(path.join(dir, file + '.svg'), xml, () => {
    console.log('Successfully wrote', file + '.svg');
  });
}

const outDir = 'src/assets/images/recolor';
const parser = new xml2js.Parser();

for (let prefix in srcImages) {
  const target = srcImages[prefix];
  const inFile = 'src/assets/images/' + prefix + '.svg';
  const xml = fs.readFileSync(inFile, 'utf8');

  parser.parseString(xml, function (err, result) {
    if (err === null) {
      Object.values(mapTheme.MATERIAL_COLORS).forEach(color => {
        result.svg[target.targetEl][0].$[target.targetAttr] = color.hex;
        writeXML(result, outDir, `${prefix}-${color.name}`);
      });
    } else {
      console.log(err);
    }
  });
}

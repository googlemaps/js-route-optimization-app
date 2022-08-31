#!/usr/bin/env ts-node-script
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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

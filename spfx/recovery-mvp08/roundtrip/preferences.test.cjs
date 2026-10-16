// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const {test}=require('node:test'),{roundtrip}=require('./fixture.cjs');
test('actual 08 to recovery07 to 08 retains valid V5 preferences and its own Format8 cache',t=>roundtrip('preferences',t));

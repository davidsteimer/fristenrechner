// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const {test}=require('node:test'),{roundtrip}=require('./fixture.cjs');
test('actual 08 to recovery07 to 08 restores the V5 TI administrative selection without inventing case qualification',t=>roundtrip('administrative',t));

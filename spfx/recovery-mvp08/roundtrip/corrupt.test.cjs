// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const {test}=require('node:test'),{roundtrip}=require('./fixture.cjs');
test('actual 08 to recovery07 to 08 protects corrupt V5 bytes and does not import legacy values',t=>roundtrip('corrupt',t));

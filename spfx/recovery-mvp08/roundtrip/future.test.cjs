// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const {test}=require('node:test'),{roundtrip}=require('./fixture.cjs');
test('actual 08 to recovery07 to 08 protects future V5-slot bytes without downgrade migration',t=>roundtrip('future',t));

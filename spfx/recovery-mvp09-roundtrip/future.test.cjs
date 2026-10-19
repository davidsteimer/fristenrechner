// SPDX-License-Identifier: AGPL-3.0-only
const {test}=require('node:test'),{roundtrip}=require('./fixture.cjs');
test('MVP09 to actual recovery to MVP09 protects future V5-slot raw bytes',t=>roundtrip('future',t));

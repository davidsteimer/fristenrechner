// SPDX-License-Identifier: AGPL-3.0-only
const {test}=require('node:test'),{roundtrip}=require('./fixture.cjs');
test('MVP09 to actual recovery to MVP09 protects corrupt V5 raw bytes',t=>roundtrip('corrupt',t));

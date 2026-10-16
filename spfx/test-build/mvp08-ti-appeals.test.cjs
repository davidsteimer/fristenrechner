// SPDX-License-Identifier: AGPL-3.0-only
const tests = require('./mvp08-harness.cjs');
tests.registerPathTests(['ti-80-30', 'ti-84-30', 'ti-provisional-15']);
tests.registerBlockingTest();

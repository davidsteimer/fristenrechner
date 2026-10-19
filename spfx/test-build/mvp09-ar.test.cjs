// SPDX-License-Identifier: AGPL-3.0-only
const tests = require('./mvp09-harness.cjs');
tests.registerPathTests(['ar-admin-20', 'ar-execution-5', 'ar-admin-ordered', 'ar-court-30', 'ar-court-ordered']);
tests.registerQualificationTests('ar-');
tests.registerArBoundaryTest();

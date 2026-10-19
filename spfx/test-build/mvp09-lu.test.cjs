// SPDX-License-Identifier: AGPL-3.0-only
const tests = require('./mvp09-harness.cjs');
tests.registerPathTests(['lu-admin-30', 'lu-court-30', 'lu-admin-ordered', 'lu-court-ordered']);
tests.registerQualificationTests('lu-');

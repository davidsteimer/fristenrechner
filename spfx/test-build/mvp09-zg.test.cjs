// SPDX-License-Identifier: AGPL-3.0-only
const tests = require('./mvp09-harness.cjs');
tests.registerPathTests(['zg-admin-20', 'zg-court-30', 'zg-admin-ordered', 'zg-court-ordered']);
tests.registerQualificationTests('zg-');

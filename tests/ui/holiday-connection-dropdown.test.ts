// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { holidayConnectionDropdownStyles as styles } from '../../src/ui/holidayConnectionDropdown';
import { calculatorDropdownStyles } from '../../src/ui/dropdownStyles';

test('holiday connection option text wraps in the Fluent UI layer without ellipsis', () => {
  assert.equal(styles, calculatorDropdownStyles);
  assert.deepEqual(styles.dropdownOptionText, {
    whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip', overflowWrap: 'anywhere', minWidth: 0
  });
  for (const slot of ['dropdownItem', 'dropdownItemSelected', 'dropdownItemDisabled', 'dropdownItemSelectedAndDisabled'] as const) {
    assert.deepEqual(styles[slot], { height: 'auto', minHeight: 36, paddingTop: 7, paddingBottom: 7 });
  }
});

test('holiday connection fields retain wrapping on both social and legacy render paths', () => {
  const app = readFileSync('src/ui/FristenrechnerApp.tsx', 'utf8');
  const legacy = app.slice(app.indexOf('const renderContextChoice ='), app.indexOf('const renderSpecialAnchor ='));
  const social = app.slice(app.indexOf("<Dropdown required label={translate(locale, 'vrpg.context.holidayConnections')}"), app.indexOf('{avigCourt && socialSelection && <Dropdown required'));
  assert.match(legacy, /className=\{field === 'holidayConnections' \? 'fr-procedure-choice fr-holiday-connections' : 'fr-procedure-choice'\}/);
  assert.match(legacy, /styles=\{calculatorDropdownStyles\}/);
  assert.match(social, /className="fr-holiday-connections"/);
  assert.match(social, /styles=\{calculatorDropdownStyles\}/);
  assert.match(social, /options=\{vrpgHolidayOptions\(\)\.map/);
  assert.match(social, /holidayConnections: option\.key as string/);
});

test('selected holiday connection title overrides nowrap without changing the two-column breakpoint', () => {
  const css = readFileSync('src/ui/styles.css', 'utf8');
  assert.deepEqual(styles.title, {
    height: 'auto', minHeight: 32, paddingTop: 5, paddingBottom: 5, lineHeight: 20,
    whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip', overflowWrap: 'anywhere'
  });
  assert.doesNotMatch(css, /\.fr-form__grid \.ms-Dropdown-title\s*\{[^}]*white-space: nowrap/);
  assert.match(css, /\.fr-form__grid\s*\{\s*display: grid;\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(css, /@media \(max-width: 640px\)/);
});

// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { holidayConnectionDropdownStyles as styles } from '../../src/ui/holidayConnectionDropdown';

test('holiday connection option text wraps in the Fluent UI layer without ellipsis', () => {
  assert.deepEqual(styles.dropdownOptionText, {
    whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip', overflowWrap: 'anywhere', minWidth: 0
  });
  for (const slot of ['dropdownItem', 'dropdownItemSelected', 'dropdownItemDisabled', 'dropdownItemSelectedAndDisabled'] as const) {
    assert.deepEqual(styles[slot], { height: 'auto', minHeight: 36, paddingTop: 7, paddingBottom: 7 });
  }
});

test('only the holiday connection field opts in on both social and legacy render paths', () => {
  const app = readFileSync('src/ui/FristenrechnerApp.tsx', 'utf8');
  const legacy = app.slice(app.indexOf('const renderContextChoice ='), app.indexOf('const renderSpecialAnchor ='));
  const social = app.slice(app.indexOf("<Dropdown required label={translate(locale, 'vrpg.context.holidayConnections')}"), app.indexOf('{avigCourt && socialSelection && <Dropdown required'));
  assert.match(legacy, /className=\{field === 'holidayConnections' \? 'fr-procedure-choice fr-holiday-connections' : 'fr-procedure-choice'\}/);
  assert.match(legacy, /styles=\{field === 'holidayConnections' \? holidayConnectionDropdownStyles : \{\}\}/);
  assert.match(social, /className="fr-holiday-connections"/);
  assert.match(social, /styles=\{holidayConnectionDropdownStyles\}/);
  assert.match(social, /options=\{vrpgHolidayOptions\(\)\.map/);
  assert.match(social, /holidayConnections: option\.key as string/);
  assert.equal((app.match(/styles=\{(?:field === 'holidayConnections' \? )?holidayConnectionDropdownStyles/g) ?? []).length, 2);
});

test('selected holiday connection title overrides nowrap without changing the two-column breakpoint', () => {
  const css = readFileSync('src/ui/styles.css', 'utf8');
  const rule = css.match(/\.fr-form__grid \.fr-holiday-connections \.ms-Dropdown-title\s*\{([^}]+)\}/)?.[1];
  assert.ok(rule);
  for (const declaration of ['height: auto', 'min-height: 32px', 'white-space: normal', 'overflow: visible', 'text-overflow: clip', 'overflow-wrap: anywhere']) {
    assert.ok(rule.includes(declaration), declaration);
  }
  assert.match(css, /\.fr-form__grid\s*\{\s*display: grid;\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(css, /@media \(max-width: 640px\)/);
});

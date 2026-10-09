// SPDX-License-Identifier: AGPL-3.0-only
import type { IDropdownStyles } from '@fluentui/react/lib/Dropdown';

// Options render in a Fluent UI layer outside the form. Style these slots
// directly so selected, unselected and mobile-panel entries wrap alike.
const optionHeight = { height: 'auto', minHeight: 36, paddingTop: 7, paddingBottom: 7 };

export const holidayConnectionDropdownStyles: Partial<IDropdownStyles> = {
  dropdownOptionText: {
    whiteSpace: 'normal',
    overflow: 'visible',
    textOverflow: 'clip',
    overflowWrap: 'anywhere',
    minWidth: 0
  },
  dropdownItem: optionHeight,
  dropdownItemSelected: optionHeight,
  dropdownItemDisabled: optionHeight,
  dropdownItemSelectedAndDisabled: optionHeight
};

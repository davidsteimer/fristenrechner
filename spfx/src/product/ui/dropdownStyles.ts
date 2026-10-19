// SPDX-License-Identifier: AGPL-3.0-only
import type { IDropdownStyles } from '@fluentui/react/lib/Dropdown';

// Options render in a Fluent UI layer outside the form. Style these slots
// directly so selected, unselected, disabled and mobile-panel entries wrap alike.
// Keep Fluent UI's colours, focus states, selection and keyboard behaviour.
const optionHeight = { height: 'auto', minHeight: 36, paddingTop: 7, paddingBottom: 7 };

export const calculatorDropdownStyles: Partial<IDropdownStyles> = {
  title: {
    height: 'auto',
    minHeight: 32,
    paddingTop: 5,
    paddingBottom: 5,
    lineHeight: 20,
    whiteSpace: 'normal',
    overflow: 'visible',
    textOverflow: 'clip',
    overflowWrap: 'anywhere'
  },
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

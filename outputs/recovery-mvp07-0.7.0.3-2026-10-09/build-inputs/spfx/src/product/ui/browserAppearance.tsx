// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import { loadTheme, registerIcons, unregisterIcons } from '@fluentui/react/lib/Styling';

const LOCAL_FONT_FAMILY = 'Aptos, Arial, Helvetica, sans-serif';
let initialized = false;

function icon(children: React.ReactNode): React.ReactElement {
  return (
    <svg
      viewBox="0 0 20 20"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'inline-block', verticalAlign: '-0.125em' }}
    >
      {children}
    </svg>
  );
}

/**
 * Standalone browser entry points only. Never call this from the shared app or
 * SPFx host: tenant-wide theme and icon registration belong to SharePoint there.
 * Locally drawn SVGs replace only icons used by this UI, including Fluent's
 * dropdown, checkbox and MessageBar internals. No icon font or CDN is needed.
 */
export function initializeBrowserAppearance(): void {
  if (initialized) return;
  initialized = true;

  loadTheme({ defaultFontStyle: { fontFamily: LOCAL_FONT_FAMILY } });
  document.documentElement.style.fontFamily = LOCAL_FONT_FAMILY;

  const close = icon(<path d="m5 5 10 10M15 5 5 15" />);
  const info = icon(<><circle cx="10" cy="10" r="7.5" /><path d="M10 9v5" /><circle cx="10" cy="6.2" r="0.65" fill="currentColor" stroke="none" /></>);
  const error = icon(<><circle cx="10" cy="10" r="7.5" /><path d="M10 5.5v5.8" /><circle cx="10" cy="14.2" r="0.65" fill="currentColor" stroke="none" /></>);
  const blocked = icon(<><circle cx="10" cy="10" r="7.5" /><path d="m4.8 15.2 10.4-10.4" /></>);
  const icons: Record<string, React.ReactElement> = {
    ChevronDown: icon(<path d="m4 7 6 6 6-6" />),
    DoubleChevronDown: icon(<path d="m4 4 6 5 6-5M4 11l6 5 6-5" />),
    DoubleChevronUp: icon(<path d="m4 9 6-5 6 5M4 16l6-5 6 5" />),
    CheckMark: icon(<path d="m3.5 10 4.3 4.5 8.7-9" />),
    Info: info,
    ErrorBadge: error,
    Completed: icon(<><circle cx="10" cy="10" r="7.5" /><path d="m5.8 10 2.8 3 5.8-6" /></>),
    Warning: icon(<><path d="M10 2.3 18 17H2Z" /><path d="M10 7v4.5" /><circle cx="10" cy="14.2" r="0.65" fill="currentColor" stroke="none" /></>),
    Blocked: blocked,
    Blocked2: blocked,
    Clear: close,
    Cancel: close,
    Calendar: icon(<><rect x="2.5" y="4" width="15" height="13.5" rx="1.5" /><path d="M6 2v4M14 2v4M2.5 8.5h15M6 12h2M12 12h2M6 15h2" /></>)
  };

  // The standalone Fluent bundle pre-registers Office icon-font definitions.
  // registerIcons does not overwrite an existing name, so replace this bounded
  // set explicitly before any controls render. SPFx never imports this module.
  unregisterIcons(Object.keys(icons));
  registerIcons({ icons });
}

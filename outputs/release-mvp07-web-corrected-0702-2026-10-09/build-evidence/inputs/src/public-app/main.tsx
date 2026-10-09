// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { mvp07Runtime } from '../release/mvp07ReleaseData';
import { FristenrechnerApp } from '../ui';
import { initializeBrowserAppearance } from '../ui/browserAppearance';
import '../ui/styles.css';
import { PublicShell } from './PublicShell';
import './public.css';

initializeBrowserAppearance();

const root = document.getElementById('root');
if (!root) {
  throw new Error('Öffentlicher App-Container #root fehlt.');
}

ReactDOM.render(
  <React.StrictMode>
    <PublicShell>
      <FristenrechnerApp data={mvp07Runtime.data} calendarRuntime={mvp07Runtime.calendarRuntime} />
    </PublicShell>
  </React.StrictMode>,
  root
);

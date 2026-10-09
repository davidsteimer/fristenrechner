// SPDX-License-Identifier: AGPL-3.0-only
// Explicit local build entry. No browser query enables this reference policy.
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ap22c3CandidateRuntime } from '../release/ap22c3CandidateData';
import { FristenrechnerApp } from '../ui';
import { initializeBrowserAppearance } from '../ui/browserAppearance';
import '../ui/styles.css';
import { PublicShell } from './PublicShell';
import './public.css';

initializeBrowserAppearance();
const root = document.getElementById('root');
if (!root) throw new Error('Lokaler AP22C3-Container #root fehlt.');
ReactDOM.render(
  <React.StrictMode>
    <PublicShell><FristenrechnerApp
      data={ap22c3CandidateRuntime.data}
      calendarRuntime={ap22c3CandidateRuntime.calendarRuntime}
      referenceOnlyAllCalculations
    /></PublicShell>
  </React.StrictMode>, root
);

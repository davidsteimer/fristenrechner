// SPDX-License-Identifier: AGPL-3.0-only
// Explicit local build only. No production URL flag can activate these data.
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ap23e3CandidateRuntime } from '../release/ap23e3CandidateData';
import { FristenrechnerApp } from '../ui';
import { initializeBrowserAppearance } from '../ui/browserAppearance';
import '../ui/styles.css';
import { PublicShell } from './PublicShell';
import './public.css';

initializeBrowserAppearance();
const root = document.getElementById('root');
if (!root) throw new Error('Lokaler AP23E3-Container #root fehlt.');
ReactDOM.render(
  <React.StrictMode>
    <PublicShell><FristenrechnerApp {...ap23e3CandidateRuntime}
      referenceOnlyAllCalculations localReviewLabel="AP23E3 · Format 9 · DE / FR" />
    </PublicShell>
  </React.StrictMode>, root
);

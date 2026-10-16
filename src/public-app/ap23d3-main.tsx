// SPDX-License-Identifier: AGPL-3.0-only
// Separate, explicit local build. No URL or host setting activates reference data.
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ap23d3CandidateRuntime } from '../release/ap23d3CandidateData';
import { FristenrechnerApp } from '../ui';
import { initializeBrowserAppearance } from '../ui/browserAppearance';
import '../ui/styles.css';
import { PublicShell } from './PublicShell';
import './public.css';

initializeBrowserAppearance();
const root = document.getElementById('root');
if (!root) throw new Error('Lokaler AP23D3-Container #root fehlt.');
ReactDOM.render(
  <React.StrictMode>
    <PublicShell><FristenrechnerApp
      {...ap23d3CandidateRuntime}
      referenceOnlyAllCalculations
      localReviewLabel="AP23D3 · Format 8 · DE / FR"
    /></PublicShell>
  </React.StrictMode>, root
);

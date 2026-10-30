// SPDX-License-Identifier: AGPL-3.0-only
// Explicit local integration entry, never selected by a production URL flag.
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ap23j3CandidateRuntime } from '../release/ap23j3CandidateData';
import { FristenrechnerApp } from '../ui';
import { initializeBrowserAppearance } from '../ui/browserAppearance';
import '../ui/styles.css';
import { PublicShell } from './PublicShell';
import './public.css';

initializeBrowserAppearance();
const root = document.getElementById('root');
if (!root) throw new Error('Lokaler AP23J3-Container #root fehlt.');
ReactDOM.render(<React.StrictMode><PublicShell>
  <FristenrechnerApp {...ap23j3CandidateRuntime} referenceOnlyAllCalculations
    localReviewLabel="AP23J3 · Format 14 · DE / FR" />
</PublicShell></React.StrictMode>, root);


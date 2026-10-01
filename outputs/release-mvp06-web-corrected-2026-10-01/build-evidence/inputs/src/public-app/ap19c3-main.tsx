// SPDX-License-Identifier: AGPL-3.0-only
// Local candidate only. No deployment or approved data source is changed.
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ap19c3CandidateCalculationData } from '../release/ap19c3CandidateData';
import { FristenrechnerApp } from '../ui';
import { initializeBrowserAppearance } from '../ui/browserAppearance';
import '../ui/styles.css';
import { PublicShell } from './PublicShell';
import './public.css';

initializeBrowserAppearance();
const root = document.getElementById('root');
if (!root) throw new Error('Lokaler AP19C3-Container #root fehlt.');
ReactDOM.render(
  <React.StrictMode>
    <PublicShell><FristenrechnerApp data={ap19c3CandidateCalculationData} /></PublicShell>
  </React.StrictMode>, root
);

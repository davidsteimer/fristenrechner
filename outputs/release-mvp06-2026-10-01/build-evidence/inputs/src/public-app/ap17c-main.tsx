// SPDX-License-Identifier: AGPL-3.0-only
// Explicit local candidate entry. The regular public entry remains pinned to MVP 0.3.

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ap17cCandidateCalculationData } from '../release/ap17cCandidateData';
import { FristenrechnerApp } from '../ui';
import { initializeBrowserAppearance } from '../ui/browserAppearance';
import '../ui/styles.css';
import { PublicShell } from './PublicShell';
import './public.css';

initializeBrowserAppearance();
const root = document.getElementById('root');
if (!root) throw new Error('Lokaler AP17C-Container #root fehlt.');
ReactDOM.render(
  <React.StrictMode>
    <PublicShell><FristenrechnerApp data={ap17cCandidateCalculationData} /></PublicShell>
  </React.StrictMode>, root
);

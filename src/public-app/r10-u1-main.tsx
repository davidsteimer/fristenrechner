// SPDX-License-Identifier: AGPL-3.0-only
// Local U1 proof only. The accepted M3 data and all release permissions stay unchanged.
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {ap23m3CandidateRuntime} from '../release/ap23m3CandidateData';
import {FristenrechnerApp} from '../ui';
import {initializeBrowserAppearance} from '../ui/browserAppearance';
import '../ui/styles.css';
import {PublicShell} from './PublicShell';
import './public.css';
initializeBrowserAppearance();
const root=document.getElementById('root');
if(!root)throw new Error('Lokaler R10-U1-Prüfcontainer fehlt.');
ReactDOM.render(<React.StrictMode><PublicShell>
  <FristenrechnerApp {...ap23m3CandidateRuntime} referenceOnlyAllCalculations
    localReviewLabel="R10-U1 · Format 17 · DE / FR" />
</PublicShell></React.StrictMode>,root);

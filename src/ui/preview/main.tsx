// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { FristenrechnerApp } from '../FristenrechnerApp';
import { initializeBrowserAppearance } from '../browserAppearance';
import './preview.css';
import '../styles.css';
import { mvp05CalculationData } from '../../release/mvp05ReleaseData';
import { ap17cCandidateCalculationData } from '../../release/ap17cCandidateData';
import { ap18cCandidateCalculationData } from '../../release/ap18cCandidateData';
import { ap19cCandidateCalculationData } from '../../release/ap19cCandidateData';
import { ap19c2CandidateCalculationData } from '../../release/ap19c2CandidateData';
import { ap19c3CandidateCalculationData } from '../../release/ap19c3CandidateData';
import { qaPreset } from './qaPresets';

initializeBrowserAppearance();

const root = document.getElementById('root');
if (!root) {
  throw new Error('Preview-Container #root fehlt.');
}

const initialState = qaPreset(window.location.search);
const candidate = new URLSearchParams(window.location.search).get('candidate');
const previewData = candidate === 'ap19c3' ? ap19c3CandidateCalculationData
  : candidate === 'ap19c2' ? ap19c2CandidateCalculationData
  : candidate === 'ap19c1' ? ap19cCandidateCalculationData
  : candidate === 'ap18c' ? ap18cCandidateCalculationData
  : candidate === 'ap17c' ? ap17cCandidateCalculationData : mvp05CalculationData;

ReactDOM.render(
  <React.StrictMode>
    <FristenrechnerApp data={previewData} {...(initialState ? { initialState } : {})} />
  </React.StrictMode>,
  root
);

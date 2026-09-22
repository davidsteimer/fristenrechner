// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { FristenrechnerApp } from '../FristenrechnerApp';
import { initializeBrowserAppearance } from '../browserAppearance';
import './preview.css';
import '../styles.css';
import { mvp04CalculationData } from '../../release/mvp04ReleaseData';
import { ap17cCandidateCalculationData } from '../../release/ap17cCandidateData';
import { ap18cCandidateCalculationData } from '../../release/ap18cCandidateData';
import { qaPreset } from './qaPresets';

initializeBrowserAppearance();

const root = document.getElementById('root');
if (!root) {
  throw new Error('Preview-Container #root fehlt.');
}

const initialState = qaPreset(window.location.search);
const candidate = new URLSearchParams(window.location.search).get('candidate');
const previewData = candidate === 'ap18c' ? ap18cCandidateCalculationData
  : candidate === 'ap17c' ? ap17cCandidateCalculationData : mvp04CalculationData;

ReactDOM.render(
  <React.StrictMode>
    <FristenrechnerApp data={previewData} {...(initialState ? { initialState } : {})} />
  </React.StrictMode>,
  root
);

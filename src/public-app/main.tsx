// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { approvedMvp03CalculationData } from '../release/approvedMvp03Data';
import { FristenrechnerApp } from '../ui';
import '../ui/styles.css';
import { PublicShell } from './PublicShell';
import './public.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Öffentlicher App-Container #root fehlt.');
}

ReactDOM.render(
  <React.StrictMode>
    <PublicShell>
      <FristenrechnerApp data={approvedMvp03CalculationData} />
    </PublicShell>
  </React.StrictMode>,
  root
);

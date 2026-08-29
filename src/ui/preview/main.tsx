// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { initializeIcons } from '@fluentui/react';

import { FristenrechnerApp } from '../FristenrechnerApp';
import '../styles.css';
import { calculationData } from './data';
import { qaPreset } from './qaPresets';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Preview-Container #root fehlt.');
}

// SharePoint initialisiert die Fluent-UI-Icons bereits. Die hostneutrale
// Vorschau tut dies selbst, damit ihr Verhalten dem späteren Host entspricht.
initializeIcons();
const initialState = qaPreset(window.location.search);

ReactDOM.render(
  <React.StrictMode>
    <FristenrechnerApp data={calculationData} {...(initialState ? { initialState } : {})} />
  </React.StrictMode>,
  root
);

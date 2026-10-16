// SPDX-License-Identifier: AGPL-3.0-only
// The accepted D2 reference bytes are reused, not promoted to an approved release.
import { ap23d2ManifestText, ap23d2Files } from './ap23d2CandidateData';
import { createFormat8CalculationData } from '../core/calculatorRuntime';

export const ap23d3CandidateRuntime = createFormat8CalculationData(ap23d2ManifestText, ap23d2Files, { mode: 'localReference' });

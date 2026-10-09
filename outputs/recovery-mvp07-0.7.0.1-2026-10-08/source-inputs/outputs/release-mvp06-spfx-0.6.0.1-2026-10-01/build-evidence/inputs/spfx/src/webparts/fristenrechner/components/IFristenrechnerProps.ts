// SPDX-License-Identifier: AGPL-3.0-only

import type { IReleaseProvider, IValidatedReleaseStore } from '../../../core/types';

export interface IFristenrechnerProps {
  readonly componentId: string;
  readonly configurationError?: string;
  readonly hostLabel: string;
  readonly provider?: IReleaseProvider;
  readonly providerLabel: string;
  readonly store: IValidatedReleaseStore;
}

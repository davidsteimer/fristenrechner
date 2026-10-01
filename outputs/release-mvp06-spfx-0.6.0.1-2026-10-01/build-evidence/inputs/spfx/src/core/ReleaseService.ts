// SPDX-License-Identifier: AGPL-3.0-only

import { ReleaseValidator } from './ReleaseValidator';
import type {
  IReleaseActivationResult,
  IReleaseProvider,
  IValidatedRelease,
  IValidatedReleaseStore
} from './types';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class ReleaseService {
  public constructor(
    private readonly store: IValidatedReleaseStore,
    private readonly validator = new ReleaseValidator()
  ) {}

  public async refresh(provider: IReleaseProvider): Promise<IReleaseActivationResult> {
    try {
      const validated = await this.validator.validateProvider(provider);
      await this.store.activate(validated);
      return {
        mode: 'network',
        providerId: provider.id,
        release: validated
      };
    } catch (error) {
      const active = await this.store.getActive();
      if (!active) {
        throw error;
      }

      return {
        mode: 'fallback',
        providerId: provider.id,
        release: active,
        warning: errorMessage(error)
      };
    }
  }

  public getActive(): Promise<IValidatedRelease | undefined> {
    return this.store.getActive();
  }
}

import type {
  IProviderOption,
  IValidatedReleaseStore,
  ProviderKind
} from '../../../core/types';

export interface IFristenrechnerSpikeProps {
  readonly componentId: string;
  readonly defaultProvider: ProviderKind;
  readonly hostLabel: string;
  readonly isDarkTheme: boolean;
  readonly providers: readonly IProviderOption[];
  readonly store: IValidatedReleaseStore;
}

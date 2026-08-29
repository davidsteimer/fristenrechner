// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import {
  Dropdown,
  type IDropdownOption,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Spinner,
  TextField
} from '@fluentui/react';

import { ReleaseService } from '../../../core/ReleaseService';
import type { IValidatedRelease, ProviderKind } from '../../../core/types';
import styles from './FristenrechnerSpike.module.scss';
import type { IFristenrechnerSpikeProps } from './IFristenrechnerSpikeProps';
import { translations, type Language } from './translations';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'fallback' | 'local' | 'error';

interface IFristenrechnerSpikeState {
  readonly language: Language;
  readonly deliveryDate: string;
  readonly deadlineDays: string;
  readonly profileId: string;
  readonly communityId: string;
  readonly providerKind: ProviderKind;
  readonly status: LoadStatus;
  readonly release?: IValidatedRelease;
  readonly message?: string;
}

function formatDateTime(value: string, language: Language): string {
  return new Intl.DateTimeFormat(language === 'de' ? 'de-CH' : 'fr-CH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(value));
}

export default class FristenrechnerSpike extends React.Component<
  IFristenrechnerSpikeProps,
  IFristenrechnerSpikeState
> {
  private readonly releaseService: ReleaseService;

  public constructor(props: IFristenrechnerSpikeProps) {
    super(props);
    this.releaseService = new ReleaseService(props.store);
    this.state = {
      language: 'de',
      deliveryDate: '',
      deadlineDays: '30',
      profileId: 'stpo',
      communityId: 'be',
      providerKind: props.defaultProvider,
      status: 'idle'
    };
  }

  public componentDidMount(): void {
    this.restoreActiveRelease().catch(error => {
      this.setState({
        status: 'error',
        message: error instanceof Error ? error.message : String(error)
      });
    });
  }

  public render(): React.ReactElement<IFristenrechnerSpikeProps> {
    const text = translations[this.state.language];
    const providerOptions: IDropdownOption[] = this.props.providers.map(option => ({
      key: option.key,
      text: option.provider ? option.text : `${option.text} — ${option.unavailableReason ?? text.idle}`,
      disabled: !option.provider
    }));
    const profileOptions = Object.keys(text.profileOptions).map(key => ({
      key,
      text: text.profileOptions[key]
    }));
    const communityOptions = Object.keys(text.communityOptions).map(key => ({
      key,
      text: text.communityOptions[key]
    }));
    const selectedProvider = this.props.providers.find(
      provider => provider.key === this.state.providerKind
    );

    return (
      <section className={`${styles.fristenrechnerSpike} ${this.props.isDarkTheme ? styles.dark : ''}`}>
        <header className={styles.header}>
          <div>
            <div className={styles.badge}>{text.badge}</div>
            <h2>{text.appTitle}</h2>
            <p>{text.intro}</p>
          </div>
          <Dropdown
            ariaLabel={text.language}
            className={styles.language}
            label={text.language}
            options={[
              { key: 'de', text: 'Deutsch' },
              { key: 'fr', text: 'Français' }
            ]}
            selectedKey={this.state.language}
            onChange={this.onLanguageChange}
          />
        </header>

        <form className={styles.form} onSubmit={this.onSubmit}>
          <div className={styles.formGrid}>
            <TextField
              label={text.deliveryDate}
              type="date"
              value={this.state.deliveryDate}
              onChange={this.onDeliveryDateChange}
            />
            <TextField
              label={text.deadlineDays}
              min={1}
              step={1}
              type="number"
              value={this.state.deadlineDays}
              onChange={this.onDeadlineDaysChange}
            />
            <Dropdown
              label={text.legalProfile}
              options={profileOptions}
              selectedKey={this.state.profileId}
              onChange={this.onProfileChange}
            />
            <Dropdown
              label={text.community}
              options={communityOptions}
              selectedKey={this.state.communityId}
              onChange={this.onCommunityChange}
            />
            <Dropdown
              label={text.provider}
              options={providerOptions}
              selectedKey={this.state.providerKind}
              onChange={this.onProviderChange}
            />
          </div>

          <MessageBar className={styles.scopeNote} messageBarType={MessageBarType.info}>
            {text.noCalculation}
          </MessageBar>

          <PrimaryButton
            disabled={!selectedProvider?.provider || this.state.status === 'loading'}
            type="submit"
          >
            {text.load}
          </PrimaryButton>
        </form>

        <section className={styles.statusPanel} aria-live="polite" aria-busy={this.state.status === 'loading'}>
          <h3>{text.technicalStatus}</h3>
          {this.state.status === 'loading' && <Spinner label={text.loading} />}
          {this.renderMessageBar()}
          <dl className={styles.statusGrid}>
            <div>
              <dt>{text.host}</dt>
              <dd>{this.props.hostLabel}</dd>
            </div>
            <div>
              <dt>{text.componentId}</dt>
              <dd className={styles.monospace}>{this.props.componentId}</dd>
            </div>
            <div>
              <dt>{text.providerLabel}</dt>
              <dd>{selectedProvider?.text ?? '–'}</dd>
            </div>
            <div>
              <dt>{text.releaseId}</dt>
              <dd className={styles.monospace}>{this.state.release?.releaseId ?? '–'}</dd>
            </div>
            <div>
              <dt>{text.dataStatus}</dt>
              <dd>{this.statusText()}</dd>
            </div>
            <div>
              <dt>{text.validatedAt}</dt>
              <dd>{this.state.release ? formatDateTime(this.state.release.validatedAt, this.state.language) : '–'}</dd>
            </div>
            <div>
              <dt>{text.coverage}</dt>
              <dd>{this.state.release ? `${this.state.release.coverageFrom} – ${this.state.release.coverageTo}` : '–'}</dd>
            </div>
          </dl>
        </section>
      </section>
    );
  }

  private async restoreActiveRelease(): Promise<void> {
    try {
      const active = await this.releaseService.getActive();
      if (active) {
        this.setState({
          status: 'local',
          release: active,
          message: translations[this.state.language].localRestored
        });
      }
    } catch (error) {
      this.setState({
        status: 'error',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private readonly onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    this.loadRelease().catch(error => {
      this.setState({
        status: 'error',
        message: error instanceof Error ? error.message : String(error)
      });
    });
  };

  private async loadRelease(): Promise<void> {
    const providerOption = this.props.providers.find(
      provider => provider.key === this.state.providerKind
    );

    if (!providerOption?.provider) {
      this.setState({
        status: 'error',
        message: providerOption?.unavailableReason ?? 'Provider nicht verfügbar'
      });
      return;
    }

    this.setState({ status: 'loading', message: undefined });

    try {
      const result = await this.releaseService.refresh(providerOption.provider);
      this.setState({
        status: result.mode === 'network' ? 'ready' : 'fallback',
        release: result.release,
        message: result.warning
      });
    } catch (error) {
      this.setState({
        status: 'error',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private renderMessageBar(): React.ReactNode {
    const text = translations[this.state.language];

    if (this.state.status === 'ready') {
      return <MessageBar messageBarType={MessageBarType.success}>{text.ready}</MessageBar>;
    }
    if (this.state.status === 'fallback') {
      return <MessageBar messageBarType={MessageBarType.warning}>{text.fallback} {this.state.message}</MessageBar>;
    }
    if (this.state.status === 'local') {
      return <MessageBar messageBarType={MessageBarType.info}>{text.local}</MessageBar>;
    }
    if (this.state.status === 'error') {
      return <MessageBar messageBarType={MessageBarType.error}>{text.failure}: {this.state.message}</MessageBar>;
    }
    return undefined;
  }

  private statusText(): string {
    const text = translations[this.state.language];
    const labels: Record<LoadStatus, string> = {
      idle: text.idle,
      loading: text.loading,
      ready: text.ready,
      fallback: text.fallback,
      local: text.local,
      error: text.failure
    };
    return labels[this.state.status];
  }

  private readonly onLanguageChange = (_event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    if (option?.key === 'de' || option?.key === 'fr') {
      this.setState({ language: option.key });
    }
  };

  private readonly onDeliveryDateChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
    this.setState({ deliveryDate: value ?? '' });
  };

  private readonly onDeadlineDaysChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
    this.setState({ deadlineDays: value ?? '' });
  };

  private readonly onProfileChange = (_event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    if (typeof option?.key === 'string') {
      this.setState({ profileId: option.key });
    }
  };

  private readonly onCommunityChange = (_event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    if (typeof option?.key === 'string') {
      this.setState({ communityId: option.key });
    }
  };

  private readonly onProviderChange = (_event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    if (option?.key === 'github' || option?.key === 'sharepointMirror') {
      this.setState({ providerKind: option.key });
    }
  };
}

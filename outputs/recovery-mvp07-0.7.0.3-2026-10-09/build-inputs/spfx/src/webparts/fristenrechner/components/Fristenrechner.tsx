// SPDX-License-Identifier: AGPL-3.0-only
// Recovery-only host. The calculator and validator are archived MVP 0.6 sources.
import * as React from 'react';
import { MessageBar, MessageBarType, Spinner } from '@fluentui/react';
import { ReleaseService } from '../../../core/ReleaseService';
import { getProviderCacheIdentity } from '../../../core/cacheIdentity';
import { createBrowserRecoveryStorage } from '../../../core/RecoveryStorage';
import type { IReleaseActivationResult, IValidatedRelease } from '../../../core/types';
import { createCalculationData, type CalculationData } from '../../../product/core';
import { FristenrechnerApp } from '../../../product/ui';
import '../../../product/ui/styles.module.scss';
import styles from './Fristenrechner.module.scss';
import type { IFristenrechnerProps } from './IFristenrechnerProps';

type RuntimeStatus = 'loading' | 'local' | 'ready' | 'fallback' | 'error';
interface IFristenrechnerState {
  readonly calculationData?: CalculationData;
  readonly loadedConfigurationKey?: string;
  readonly manifestSha256?: string;
  readonly message?: string;
  readonly status: RuntimeStatus;
}
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default class Fristenrechner extends React.Component<IFristenrechnerProps, IFristenrechnerState> {
  private loadSequence = 0;
  // Always pass an object. Undefined would let the old UI use raw localStorage.
  private readonly recoveryStorage = createBrowserRecoveryStorage();

  public constructor(props: IFristenrechnerProps) {
    super(props);
    this.state = { status: 'loading' };
  }
  public componentDidMount(): void { void this.restoreAndRefresh(); }
  public componentDidUpdate(previousProps: IFristenrechnerProps): void {
    if (previousProps.configurationKey !== this.props.configurationKey
      || previousProps.configurationError !== this.props.configurationError
      || previousProps.store !== this.props.store) void this.restoreAndRefresh();
  }
  public componentWillUnmount(): void { this.loadSequence += 1; }

  public render(): React.ReactElement<IFristenrechnerProps> {
    const current = this.isCurrentConfiguration();
    const data = current && this.state.loadedConfigurationKey === this.props.configurationKey
      ? this.state.calculationData : undefined;
    return (
      <section className={styles.host} data-component-id={this.props.componentId}
        data-host={this.props.hostLabel} data-provider={this.props.provider?.kind ?? 'unavailable'}
        data-recovery-version="0.7.0.3">
        {data ? this.renderCalculator(data) : this.renderStartup(current)}
      </section>
    );
  }

  private renderCalculator(data: CalculationData): React.ReactNode {
    return (
      <>
        <MessageBar className={styles.runtimeMessage} messageBarType={MessageBarType.info}>
          Wiederherstellungsmodus · Funktionsstand MVP 0.6. Standards dieses Modus werden separat gespeichert. Bestehende Standards von MVP 0.7 bleiben erhalten.
          {' '}Mode de restauration · Fonctionnalités MVP 0.6. Les préférences de ce mode sont enregistrées séparément. Les préférences existantes de MVP 0.7 sont conservées.
        </MessageBar>
        {this.state.status === 'fallback' && (
          <MessageBar className={styles.runtimeMessage} messageBarType={MessageBarType.warning}>
            Der letzte vollständig validierte Datenstand wird verwendet. La dernière version des données entièrement validée est utilisée.
            {this.state.message ? ` ${this.state.message}` : ''}
          </MessageBar>
        )}
        {this.state.status === 'local' && (
          <MessageBar className={styles.runtimeMessage} messageBarType={MessageBarType.info}>
            Der lokale Aktivstand wird geprüft. Validation de la version locale active.
          </MessageBar>
        )}
        <FristenrechnerApp key={`${this.props.configurationKey}:${this.state.manifestSha256 ?? ''}`}
          data={data} storage={this.recoveryStorage} />
        <div className={styles.runtimeStatus}>
          <span>Datenquelle / Source des données:</span><code>{this.props.providerLabel}</code>
        </div>
      </>
    );
  }

  private renderStartup(currentConfiguration: boolean): React.ReactNode {
    const stateIsCurrent = this.state.loadedConfigurationKey === this.props.configurationKey;
    const isError = !currentConfiguration || (stateIsCurrent && this.state.status === 'error');
    const message = this.props.configurationError
      ?? (!currentConfiguration ? 'Ungültige Datenquellenbindung / Liaison de la source de données non valide.'
        : stateIsCurrent ? this.state.message : undefined);
    return (
      <div className={styles.startup} aria-live="polite" aria-busy={!isError}>
        <div className={styles.badge}>STEIMER · Wiederherstellung / Restauration</div>
        <h2>Fristenrechner Schweiz</h2><p>Calculateur de délais suisse</p>
        {isError ? (
          <MessageBar messageBarType={MessageBarType.error}>
            Der Datenstand konnte nicht sicher geladen werden. La version des données n’a pas pu être chargée de manière sûre.
            {message ? ` ${message}` : ''}
          </MessageBar>
        ) : <Spinner label="Datenstand wird geprüft / Validation de la version des données" />}
      </div>
    );
  }

  private async restoreAndRefresh(): Promise<void> {
    const sequence = ++this.loadSequence;
    const provider = this.props.provider;
    const configurationKey = this.props.configurationKey;
    const releaseService = new ReleaseService(this.props.store);
    this.setState({ status: 'loading', calculationData: undefined,
      loadedConfigurationKey: configurationKey, manifestSha256: undefined, message: undefined });
    if (!provider || !this.isCurrentConfiguration()) {
      this.setState({ status: 'error', message: this.props.configurationError ?? 'Keine gültige Datenquelle konfiguriert.' });
      return;
    }
    try {
      const active = await releaseService.getActive(provider);
      if (active && this.isCurrentLoad(sequence, configurationKey)) {
        this.setState({ status: 'local', ...this.runtimeState(active), loadedConfigurationKey: configurationKey });
      }
    } catch {
      // Never show an invalid or differently configured cache. Try the source.
    }
    try {
      const result = await releaseService.refresh(provider, () => this.isCurrentLoad(sequence, configurationKey));
      if (this.isCurrentLoad(sequence, configurationKey)) this.applyActivationResult(result, configurationKey);
    } catch (error) {
      if (this.isCurrentLoad(sequence, configurationKey)) {
        this.setState({ status: 'error', calculationData: undefined, manifestSha256: undefined, message: errorMessage(error) });
      }
    }
  }
  private applyActivationResult(result: IReleaseActivationResult, configurationKey: string): void {
    this.setState({ status: result.mode === 'network' ? 'ready' : 'fallback',
      ...this.runtimeState(result.release), loadedConfigurationKey: configurationKey, message: result.warning });
  }
  private runtimeState(release: IValidatedRelease): Pick<IFristenrechnerState, 'calculationData' | 'manifestSha256'> {
    return { calculationData: createCalculationData(release), manifestSha256: release.manifestSha256 };
  }
  private isCurrentConfiguration(): boolean {
    if (this.props.configurationError || !this.props.provider) return false;
    try { return getProviderCacheIdentity(this.props.provider) === this.props.configurationKey; }
    catch { return false; }
  }
  private isCurrentLoad(sequence: number, configurationKey: string): boolean {
    return sequence === this.loadSequence && configurationKey === this.props.configurationKey && this.isCurrentConfiguration();
  }
}

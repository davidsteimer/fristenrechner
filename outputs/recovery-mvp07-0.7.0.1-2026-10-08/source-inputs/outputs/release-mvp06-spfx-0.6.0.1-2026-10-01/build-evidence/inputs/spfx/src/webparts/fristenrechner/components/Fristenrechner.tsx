// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import { MessageBar, MessageBarType, Spinner } from '@fluentui/react';

import { ReleaseService } from '../../../core/ReleaseService';
import type { IReleaseActivationResult, IValidatedRelease } from '../../../core/types';
import { createCalculationData, type CalculationData } from '../../../product/core';
import { FristenrechnerApp } from '../../../product/ui';
import '../../../product/ui/styles.module.scss';
import styles from './Fristenrechner.module.scss';
import type { IFristenrechnerProps } from './IFristenrechnerProps';

type RuntimeStatus = 'loading' | 'local' | 'ready' | 'fallback' | 'error';

interface IFristenrechnerState {
  readonly calculationData?: CalculationData;
  readonly message?: string;
  readonly status: RuntimeStatus;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function calculationDataFromRelease(release: IValidatedRelease): CalculationData {
  return createCalculationData(release);
}

export default class Fristenrechner extends React.Component<
  IFristenrechnerProps,
  IFristenrechnerState
> {
  private readonly releaseService: ReleaseService;
  private loadSequence = 0;

  public constructor(props: IFristenrechnerProps) {
    super(props);
    this.releaseService = new ReleaseService(props.store);
    this.state = { status: 'loading' };
  }

  public componentDidMount(): void {
    this.restoreAndRefresh().catch(error => this.showError(error));
  }

  public componentDidUpdate(previousProps: IFristenrechnerProps): void {
    if (
      previousProps.provider?.id !== this.props.provider?.id
      || previousProps.configurationError !== this.props.configurationError
    ) {
      this.restoreAndRefresh().catch(error => this.showError(error));
    }
  }

  public componentWillUnmount(): void {
    this.loadSequence += 1;
  }

  public render(): React.ReactElement<IFristenrechnerProps> {
    const data = this.state.calculationData;
    return (
      <section
        className={styles.host}
        data-component-id={this.props.componentId}
        data-host={this.props.hostLabel}
        data-provider={this.props.provider?.kind ?? 'unavailable'}
      >
        {data ? this.renderCalculator(data) : this.renderStartup()}
      </section>
    );
  }

  private renderCalculator(data: CalculationData): React.ReactNode {
    return (
      <>
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
        <FristenrechnerApp data={data} />
        <div className={styles.runtimeStatus}>
          <span>Datenquelle / Source des données:</span>
          <code>{this.props.providerLabel}</code>
        </div>
      </>
    );
  }

  private renderStartup(): React.ReactNode {
    const isError = this.state.status === 'error';
    return (
      <div className={styles.startup} aria-live="polite" aria-busy={!isError}>
        <div className={styles.badge}>STEIMER · MVP</div>
        <h2>Fristenrechner Schweiz</h2>
        <p>Calculateur de délais suisse</p>
        {isError ? (
          <MessageBar messageBarType={MessageBarType.error}>
            Der Datenstand konnte nicht sicher geladen werden. La version des données n’a pas pu être chargée de manière sûre.
            {this.state.message ? ` ${this.state.message}` : ''}
          </MessageBar>
        ) : (
          <Spinner label="Datenstand wird geprüft / Validation de la version des données" />
        )}
      </div>
    );
  }

  private async restoreAndRefresh(): Promise<void> {
    const sequence = ++this.loadSequence;
    const provider = this.props.provider;
    this.setState({ status: 'loading', calculationData: undefined, message: undefined });

    if (!provider) {
      this.setState({
        status: 'error',
        message: this.props.configurationError ?? 'Keine gültige Datenquelle konfiguriert.'
      });
      return;
    }

    try {
      const active = await this.releaseService.getActive();
      if (active && sequence === this.loadSequence) {
        this.setState({
          status: 'local',
          calculationData: calculationDataFromRelease(active)
        });
      }
    } catch {
      // Ein unlesbarer lokaler Stand wird nicht angezeigt. Der Netzabruf läuft weiter.
    }

    try {
      const result = await this.releaseService.refresh(provider);
      if (sequence !== this.loadSequence) {
        return;
      }
      this.applyActivationResult(result);
    } catch (error) {
      if (sequence === this.loadSequence) {
        this.showError(error);
      }
    }
  }

  private applyActivationResult(result: IReleaseActivationResult): void {
    this.setState({
      status: result.mode === 'network' ? 'ready' : 'fallback',
      calculationData: calculationDataFromRelease(result.release),
      message: result.warning
    });
  }

  private showError(error: unknown): void {
    this.setState({
      status: 'error',
      calculationData: undefined,
      message: errorMessage(error)
    });
  }
}

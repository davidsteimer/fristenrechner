// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';

export interface PublicShellProps {
  readonly children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps): React.ReactElement {
  return (
    <div className="public-shell">
      <a className="public-skip-link" href="#fristenrechner-app">
        Zum Fristenrechner · Accéder au calculateur
      </a>
      <header className="public-header" aria-label="STEIMER Kopfbereich">
        <a className="public-brand" href="https://www.steimer.ch/" aria-label="STEIMER Startseite">
          <span className="public-brand__mark" aria-hidden="true">
            <i />
            <i />
          </span>
          <span>STEIMER</span>
        </a>
        <p>
          Fristenrechner Schweiz
          <span>Calculateur de délais suisse</span>
        </p>
      </header>

      <div id="fristenrechner-app" tabIndex={-1}>
        {children}
      </div>

      <footer className="public-footer">
        <div className="public-footer__identity">
          <strong>STEIMER</strong>
          <span>Strategie Governance Technologie</span>
        </div>
        <div className="public-footer__links">
          <a href="https://www.steimer.ch/#impressum">Impressum</a>
          <a href="https://github.com/davidsteimer/fristenrechner">Quellcode · Code source</a>
          <a href="https://github.com/davidsteimer/fristenrechner/blob/main/LICENSE">AGPL-3.0</a>
        </div>
        <p>
          Privates Open-Source-Angebot ohne Verbindung zu einer Behörde. Offre open source privée
          sans lien avec une autorité.
        </p>
      </footer>
    </div>
  );
}

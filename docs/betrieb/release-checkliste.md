# Release-Checkliste

Diese Checkliste gilt für neue produktive Datenreleases und, soweit betroffen, für neue SPFx-Pakete. Release-spezifische Testnachweise ergänzen sie.

## 1. Fachliche Freigabereife

- [ ] Auslöser, Umfang und Zielrelease sind dokumentiert.
- [ ] Die letzte vollständige Quellenprüfung erfolgte im laufenden Jahr spätestens am 15. November oder wird mit diesem Release durchgeführt.
- [ ] Alle vom Release betroffenen amtlichen Quellen wurden zusätzlich unmittelbar vor der Freigabe geprüft.
- [ ] Das Prüfereignis nennt Vergleichsbasis, Ergebnis, Begründung, Fundstellen, Prüfdatum und verantwortliche Person.
- [ ] Ergebnisse `changed`, `unclear` und `unavailable` haben eine dokumentierte Folgemassnahme.
- [ ] Bei `unchanged` wurde kein inhaltsgleicher Datenrelease allein zur Aktualisierung eines Prüfdatums erzeugt.
- [ ] Offene Fachfragen und Sperrfälle sind aktualisiert.
- [ ] Fachliche Golden Cases und erwartete Warnungen oder Sperren sind abgenommen.

## 2. Datenrelease

- [ ] Release-ID, Formatversion, Status und Gültigkeit sind korrekt.
- [ ] Quellen-IDs und Komponentenreferenzen sind vollständig aufgelöst.
- [ ] Manifest, Artefaktgrössen und SHA-256-Prüfsummen stimmen.
- [ ] Das Release ist zunächst als Kandidat validiert und erst nach Abnahme auf `approved` gesetzt.
- [ ] Der freigegebene Releaseordner wird nach Veröffentlichung nicht verändert.
- [ ] Der frühere freigegebene Release bleibt für einen kontrollierten Rückfall verfügbar.

## 3. Automatisierte Qualitätssicherung

- [ ] `npm run build:source-reviews` erzeugt keinen unerwarteten Unterschied.
- [ ] `npm run test:source-reviews` besteht einschliesslich Negativtests.
- [ ] release-spezifische Datenvalidatoren bestehen.
- [ ] `npm run check` besteht.
- [ ] SPFx-Tests und Paketbuild bestehen, falls App-Code, Schema-Synchronisation oder eingebetteter Fallback betroffen sind.

## 4. Veröffentlichung und Mirror

- [ ] Commits, Release-ID und Prüfsummen sind protokolliert.
- [ ] Öffentlicher Datenfeed zeigt auf einen unveränderlichen Commit.
- [ ] Tenantinterner SharePoint-Mirror enthält einen neuen versionsbezogenen Releaseordner.
- [ ] `source-reviews/source-register.json`, `source-reviews/index.json` und neue Ereignisse sind bei tenantinterner Governance-Spiegelung übernommen.
- [ ] Mirrorberechtigungen erlauben vorgesehenen Nutzerinnen und Nutzern das Lesen aller Releaseartefakte.
- [ ] Der Laufzeitpfad zeigt exakt auf den freigegebenen Releaseordner, nicht auf den Governance-Ordner.

## 5. SharePoint und Teams

- [ ] Paketversion und SHA-256 stimmen, falls ein neues `.sppkg` ausgeliefert wird.
- [ ] Die App verlangt weiterhin keine unerwarteten API-Berechtigungen.
- [ ] SharePoint-Testmatrix ist bestanden.
- [ ] Teams-Testmatrix ist bestanden.
- [ ] Deutsch und Französisch sind geprüft.
- [ ] Referenzberechnung und fachlicher Sperrfall funktionieren.
- [ ] GitHub-Provider und SharePoint-Mirror sind geprüft, soweit beide freigegeben werden.

## 6. Entscheid und Abschluss

- [ ] David Steimer hat die fachliche Freigabe dokumentiert.
- [ ] Technische Prüfergebnisse und verbleibende Restrisiken sind dokumentiert.
- [ ] Produktiver Datenstand, Paketstand und Mirrorstand sind eindeutig benannt.
- [ ] GitHub-Issue und Projektstatus sind aktualisiert.
- [ ] Der nächste ordentliche Quellenprüftermin ist im Index ausgewiesen.

Ein Häkchen ersetzt keine Begründung bei Abweichungen. Nicht anwendbare Punkte werden mit kurzer Begründung als solche markiert. Das ist schlanker als Scheingenauigkeit und deutlich nützlicher als ein Formularfriedhof.

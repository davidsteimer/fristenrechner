# AP11C: MVP-0.2-Oberfläche und SPFx-Integration

| Merkmal | Stand |
| --- | --- |
| Arbeitspaket | AP11C, GitHub-Issue [#30](https://github.com/davidsteimer/fristenrechner/issues/30) |
| integrierter UX-Punkt | GitHub-Issue [#25](https://github.com/davidsteimer/fristenrechner/issues/25) |
| Status | am 31. August 2026 durch David Steimer abgenommen, Tenantprüfung ausstehend |
| Fachbasis | `2026-08-30-ap11b-approved.1` |
| freigegebener Datenrelease | `2026-08-31-mvp-02-approved.1` |
| Codeversion | `0.2.0` |
| SPFx-Paketversion | `0.2.0.0` |
| Paket SHA-256 | `49d4fe8995e4e982e8e5e9cb8666425d68689f0e882c34b39995f54694ff142e` |
| Prüfdatum | 31. August 2026 |

## 1. Ergebnis

AP11C integriert die in AP11A fachlich beschriebenen und mit AP11B freigegebenen VRPG-BE-Spezialregime in dieselbe hostneutrale Rechneroberfläche, die bereits für allgemeine Tagesfristen verwendet wird. Es entsteht keine zweite Fachlogik und kein besonderer Microsoft-365-Codepfad. Die Oberfläche ruft für allgemeine Fristen `calculateDeadline` und für Spezialregime `calculateSpecialDeadline` aus demselben Rechenkern auf.

Der häufige Kanzleifall bleibt kurz. Nach Auswahl von `VRPG Kanton Bern` verlangt der Rechner zuerst eine ausdrückliche Wahl des Fristtyps. `Bitte wählen` kann als persönlicher Standard gespeichert werden. Die allgemeine VRPG-Frist zeigt Empfangsdatum und Tagesdauer. Ein Spezialregime ersetzt diese durch die fachlich erforderlichen Ankerdaten und Fristkomponenten.

## 2. Bedienvertrag

### 2.1 Fristtyp und Sichtbarkeit

Die Fristtypen werden aus dem freigegebenen Spezialregimekatalog abgeleitet. Die Oberfläche unterscheidet vier Zustände:

- unterstützte Einträge sind ohne zusätzliche Statusetikette auswählbar und führen zu einer Rechnung
- `Folgerelease` bleibt zur Einordnung sichtbar, ist aber deaktiviert
- `Offen` bleibt sichtbar, ist aber deaktiviert
- `Gesperrt` bleibt sichtbar, ist aber deaktiviert

Die Auswahl beginnt mit `Bitte wählen`. Bei nicht verfügbaren Einträgen steht der Status am Zeilenende. Die bewusste Auswahl der allgemeinen VRPG-Frist gilt zugleich als Erklärung, dass keine bekannte Spezialregel zur Anwendung kommt. Eine zusätzliche Checkbox ist dafür nicht erforderlich. Bestätigungen zu anderen Risiken, namentlich zur Zustellfiktion oder zur Feiertagsanknüpfung, bleiben bestehen.

Behördlich angeordnete Termine mit `uiExposure: hidden` und reine Dokumentationseinträge werden nicht als Fristtyp angeboten. Ein behördlich gesetztes Datum wird deshalb nicht als scheinbare Berechnung an die Benutzerin oder den Benutzer zurückgegeben.

Bei Regimen mit mehreren Fristkomponenten erscheint eine zweite Auswahl. Dies betrifft insbesondere die gesetzlichen Verweise nach Art. 117 und Art. 121 PRG-BE. Die Komponentenbezeichnung ist auf Deutsch und Französisch daten- oder UI-getrieben eindeutig.

### 2.2 Bedingte Eingaben

Die Eingaben werden aus der gewählten Fristdefinition erzeugt. Unterstützt sind:

- ein oder mehrere ISO-Kalenderdaten
- eine lokale Uhrzeit, soweit die Definition sie verlangt
- eine variable Fristdauer zwischen 1 und 365 Tagen
- ausdrücklich erforderliche Bestätigungen für rechtliche Übersteuerungen

Die Oberfläche berechnet selbst keine Datumswerte. Sie validiert nur das Eingabeformat und übergibt die Werte an den Rechenkern.

### 2.3 Resultat und Fristwahrung

Das Resultat trennt konsequent zwischen Datum und Handlung:

- Fristablauf
- rechnerisches Fristende vor einer allfälligen Endverschiebung
- Art der Fristwahrung wie Aufgabe, Eingang, Originaleingang oder elektronische Empfangsbestätigung
- Annahmeschluss und Zeitzone
- Erfordernis eines Originals
- zulässige Einreichungskanäle
- geeignete Nachweise
- Rechtsgrundlage, Warnungen, Sperrgründe und Rechenspur

Ein Resultat mit `manualReview` zeigt das berechnete Datum, kennzeichnet aber den nötigen Abgleich mit der aktuellen amtlichen Wahl- oder Abstimmungsanordnung. Ein blockiertes Resultat enthält kein scheinbar sicheres Fristende.

### 2.4 Automatisch bestimmte Parameter

Unterhalb des Resultats bleiben die vom Datenrelease gewählten Parameter sichtbar:

- Spezialregime
- Rechenregel
- Feiertags- oder Terminprofil
- Fristenstillstand
- Fristwahrungsprofil
- rechtliche Übersteuerungen

Damit kann eine Benutzerin oder ein Benutzer vor einer fristgebundenen Handlung erkennen, welche fachlichen Komponenten tatsächlich verwendet wurden.

## 3. Umsetzung von Issue #25

Der MVP-0.2-Datenrelease ist aus dem freigegebenen AP11B-Release und dem abgenommenen AP11C-Kandidaten abgeleitet. Er enthält ausschliesslich die ausdrücklich beauftragten Änderungen an den UI-Optionen und den zugehörigen Prüfmetadaten:

- `unknown` ist aus dem ZPO-Selektor `procedureVariant` entfernt
- `unknown` ist aus dem VRPG-BE-Selektor `specialLawStatus` entfernt
- der leere Platzhalter `Bitte wählen` bleibt erhalten
- `knownOverride` bleibt erhalten und blockiert weiterhin eine unzutreffende allgemeine Berechnung
- manipulierte oder alte `unknown`-Werte werden vom Rechenkern weiterhin defensiv abgewiesen

Der freigegebene Release verändert keine AP11B-Spezialregel und keine Golden-Case-Erwartung. Der unveränderte Kandidat bleibt mit dem Status `candidate` dokumentiert und kann vom SPFx-Release-Service weiterhin nicht aktiviert werden. Der neue Release trägt den Status `approved` und weist die menschliche Freigabe von David Steimer maschinenlesbar aus.

## 4. Lokale Defaults

Der gespeicherte Datenvertrag hat intern Version 2. Der bestehende Browser-Schlüssel bleibt für eine kontrollierte Migration erhalten. Neu können Fristtyp und Fristkomponente als Default gespeichert werden. Nicht gespeichert werden:

- Empfangs- oder Ereignisdaten
- lokale Uhrzeiten
- fachliche Bestätigungen
- Kalenderübersteuerungsgründe

Defaults der Version 1 werden gelesen und migriert. Nicht mehr zulässige `unknown`-Werte sowie unvereinbare oder nicht mehr sichtbare Spezialauswahlen werden verworfen. Dadurch führt ein alter Browserzustand nicht zu einer verdeckten Berechnung.

## 5. SPFx-Integration

Der SPFx-Consumer unterstützt nun die Datenformat-Hauptversionen 1 und 2. Für Format 2 werden zusätzlich synchronisiert und streng mit AJV geprüft:

- `filing-profile.schema.json`
- `deadline-definition.schema.json`
- `special-regime-catalog-v2.schema.json`

Das Manifest muss die Spezialkatalog-IDs vollständig nennen. Content-ID, Katalog-ID, Rechtsprofil- und Kalenderreferenzen werden zusätzlich semantisch abgeglichen. Unbekannte Hauptversionen, Kandidatenreleases, falsche Dateigrössen und falsche Prüfsummen bleiben gesperrt.

Das Paket `0.2.0.0` unterstützt weiterhin `SharePointWebPart` und `TeamsTab`, enthält seine Client-Assets und beantragt keine zusätzlichen Graph- oder Entra-Berechtigungen. Der führende Rechenkern und die führende UI werden vor dem Build mechanisch in SPFx synchronisiert.

## 6. Datenaktivierung und Sicherheitsgrenze

Der öffentliche Standardpfad des WebParts wird für das definitive Paket auf einen vollständigen Git-Commit gepinnt, der den freigegebenen Release `2026-08-31-mvp-02-approved.1` enthält. Der SharePoint-Mirror muss dieselben Manifest- und Artefaktbytes liefern.

Für die Tenantprüfung von MVP 0.2 gilt folgende kontrollierte Reihenfolge:

1. AP11C fachlich und technisch abnehmen, abgeschlossen am 31. August 2026
2. den Datenkandidaten mit neuer unveränderlicher Release-ID auf `approved` promovieren, abgeschlossen mit `2026-08-31-mvp-02-approved.1`
3. den freigegebenen Datenrelease publizieren oder byteidentisch in einen SharePoint-Mirror übernehmen
4. das WebPart auf den gepinnten GitHub-Pfad oder den Mirrorpfad konfigurieren
5. die SharePoint- und Teams-Prüfmatrix aus der [Deploymentanleitung](../betrieb/deployment-mvp-02-ap11c.md) ausführen

## 7. Lokaler Prüfnachweis

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript-Typprüfung | bestanden |
| allgemeine und Spezialregime-Tests | 103 von 103 bestanden |
| acht AP11B-Golden-Cases über das UI-Modell | 8 von 8 bestanden |
| AP11C-Datenvertrag ohne die beiden `unknown`-Optionen | bestanden |
| releaseweite Schema-, Hash- und Negativprüfung | bestanden |
| unabhängige Python-Gegenrechnung | 8 von 8 bestanden |
| SPFx-Provider- und Integrationsprüfungen | 14 von 14 bestanden |
| SPFx-TypeScript- und Produktionsbuild | bestanden |
| Bundle-CSS-Audit | bestanden |
| SPFx-Paketierung `0.2.0.0` | bestanden |
| Paketintegrität mit `unzip -t` | bestanden |
| Desktopansicht Deutsch | bestanden |
| Spezialresultat und Fristwahrung | bestanden |
| französische Produkttexte | bestanden |
| Vorbereitungshandlung mit Sofortanfechtungshinweis | bestanden |
| responsive Ansicht mit 390 Pixeln | bestanden |
| zusätzliche Anwendungsfehler in der Browserkonsole | keine festgestellt |

Die Browserprüfung erfolgte mit der lokalen hostneutralen Vorschau. Meldungen einer installierten Browsererweiterung waren nicht Teil der Anwendung und wurden nicht als Produktfehler gewertet.

## 8. Betriebsfreigabe

AP11C und der Datenrelease sind abgenommen. Vor der Betriebsfreigabe noch auszuführen und nachzuweisen sind:

- Veröffentlichung des Datenrelease und Aktualisierung des gepinnten GitHub-Pfads sowie des SharePoint-Mirrors
- Upload des Pakets `0.2.0.0` in den Tenant-App-Katalog
- Aktualisierung der SharePoint-Testsite
- SharePoint- und direkte Teams-Tenantprüfung
- Produktiv- oder Gastfreigabe

Diese Trennung ist beabsichtigt. Die fachliche Abnahme ersetzt weder die kontrollierte Installation noch die Laufzeitprüfung in den beiden Microsoft-365-Hosts.

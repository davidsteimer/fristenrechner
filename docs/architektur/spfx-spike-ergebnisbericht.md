# Zwischenbericht SPK-SPFX-01: SPFx-Machbarkeitsspike

| Merkmal | Stand |
| --- | --- |
| Dokumentstatus | in Durchführung |
| Start | 29. August 2026 |
| Verantwortlich | David Steimer |
| Technische Ausarbeitung | David Steimer mit Codex |
| Arbeitspaket | `SPK-SPFX-01`, GitHub-Issue #16 |
| Zeitbox | höchstens 4,5 Nettoarbeitstage |
| Entscheidung | offen, DEC-2026-013 ist vorgeschlagen |

## 1. Antwortstand zur Entscheidungsfrage

Der lokale Zwischenstand bestätigt, dass das geplante SPFx-WebPart mit SPFx 1.23.2, Node.js 22, React 17.0.1, Fluent UI React v8 und Heft reproduzierbar gebaut und als `.sppkg` paketiert werden kann. Die Provider-, Validierungs-, Persistenz- und Fallbackschichten bleiben von SharePoint- und Teams-spezifischer Darstellung getrennt.

Noch nicht belegt sind die Ausführung desselben Pakets in einer realen SharePoint-Site und in Microsoft Teams, der GitHub-Abruf unter der dort wirksamen Browser- und Tenantkonfiguration sowie der Abruf eines byteidentischen SharePoint-Mirrors mit normalen Benutzerleserechten. Deshalb ist ein Architekturentscheid noch nicht zulässig.

## 2. Umgesetzter Minimalprototyp

Der Prototyp unter [`spike/spfx/`](../../spike/spfx/README.md) enthält:

- ein WebPart mit der stabilen Component-ID `69cfde67-2e4a-4fed-83ea-5d7ceb8df239`
- die Hosts `SharePointWebPart` und `TeamsTab` im selben Komponentenmanifest
- eine reduzierte Fluent-UI-Oberfläche im Steimer-Design
- technische Texte und Bedienung auf Deutsch und Französisch
- Eingabefelder für Empfangsdatum, Fristdauer, Verfahrensrecht und Gemeinwesen, ausdrücklich noch ohne Fristberechnung
- einen auf einen unveränderlichen Git-Commit gepinnten GitHub-Provider
- einen konfigurierbaren SharePoint-Mirrorprovider auf Basis von `SPHttpClient`
- vollständige JSON-Schema-, Prüfsummen-, Referenz- und Abdeckungsvalidierung
- atomare Aktivierung eines vollständig validierten Release in IndexedDB
- Wiederherstellung des letzten gültigen Aktivstands nach einem Neuladen
- kontrollierten Fallback bei fehlerhaftem oder unvollständigem Netzabruf
- sechs automatisierte positive und negative Tests
- ein gebautes `.sppkg` mit eingebetteten Client-Assets

Der deterministische Rechenkern ist absichtlich nicht Bestandteil des Spikes.

## 3. Lokale Prüfergebnisse

| Bereich | Ergebnis | Nachweis |
| --- | --- | --- |
| frische Lockfile-Installation | bestanden | `npm ci --ignore-scripts` |
| automatisierte Spike-Tests | 6 von 6 bestanden | [`local-build.md`](../../spike/spfx/evidence/local-build.md) |
| TypeScript, Sass und ESLint | bestanden, keine Warnung | [`local-build.md`](../../spike/spfx/evidence/local-build.md) |
| Produktionsbundle | bestanden | [`local-build.md`](../../spike/spfx/evidence/local-build.md) |
| SPFx-Paketierung | bestanden | [`package-inventory.md`](../../spike/spfx/evidence/package-inventory.md) |
| Paketstruktur | 21 von 21 Einträgen intakt | `unzip -t` im Paketinventar |
| GitHub-Provider | freigegebenes Release mit sieben Artefakten vollständig geladen und validiert | [`github-provider.json`](../../spike/spfx/evidence/github-provider.json) |
| Providerparität | byteidentische Resultate zweier lokaler Provider | automatisierter Test |
| atomare Aktivierung | bestanden | automatisierter IndexedDB-Test |
| Fehler und Fallback | bestanden | Manipulations- und Fehlartifakttests |
| produktive npm-Abhängigkeiten | null bekannte Schwachstellen | `npm audit --omit=dev` |

Das gebaute Paket hat die SHA-256-Prüfsumme `05c8b66be32736e95f91c4423ee46583fde8fbe10f5ad5db765161cc8067a72a`.

## 4. Sicherheits- und Berechtigungsbefund

Das Paket enthält keine `webApiPermissionRequests`, keine Microsoft-Graph-Adresse, keine Entra-App-Registrierung und kein Geheimnis. React und React DOM werden als von SPFx bereitgestellte Komponenten in Version 17.0.1 referenziert. Es wird keine zweite React-Laufzeit gebündelt. Die reproduzierbar erzeugten Teams-Symbole enthalten nur die drei PNG-Pflichtblöcke und keine EXIF-, XMP-, Pfad- oder Herkunftsmetadaten.

Der SharePoint-Mirrorprovider bildet einen konfigurierten Bibliotheksordner auf `GetFileByServerRelativePath(...)/$value` ab und verwendet den `SPHttpClient` des angemeldeten Benutzers. Ob normales Lesen im Zieltenant tatsächlich genügt, muss im Tenant nachgewiesen werden.

Der vollständige npm-Audit nennt neun moderate Befunde in transitiven Entwicklungsabhängigkeiten der Microsoft-SPFx-Buildtoolchain. Die produktiven Abhängigkeiten sind davon nicht betroffen. Der vorgeschlagene Zwangsfix würde die SPFx-Heft-Plugins auf Version 1.12.0 zurückstufen und widerspricht der festgelegten Toolchain. Dieser Zwangsfix wird deshalb nicht angewandt.

## 5. Offene Tenantprüfungen

Für den Abschluss werden folgende Angaben und Zugriffe benötigt:

1. Freigabe einer nicht produktiven SharePoint-Testsite
2. Bezeichnung eines bestehenden oder die administrative Aktivierung eines Tenant- oder Websitesammlungs-App-Katalogs für das `.sppkg`
3. Dokumentbibliothek für den byteidentischen Mirror
4. Testkonto mit normalem Leserecht auf Site und Mirror
5. Team und Kanal für die Teams-Registerkarte
6. zulassende Teams-App-Richtlinie oder berechtigte Person für den Testupload

Danach sind T03 bis T08 sowie T13 und T14 in beiden Hosts durchzuführen und mit Screenshots sowie Konsolen- und Providerprotokollen zu belegen.

## 6. Vorläufige Bewertung

Kein lokaler Befund löst ein Stop-Kriterium aus. Insbesondere mussten weder ein zweites Datenformat noch providerspezifische Rechenkernlogik oder zusätzliche API-Berechtigungen eingeführt werden.

Der Stand reicht noch nicht für ein `Go`. Die offenen Prüfungen betreffen genau die risikoreichen M365-Eigenschaften, für die der Spike angelegt wurde. Ein vorschnelles `Go` wäre daher keine Beschleunigung, sondern bloss optimistische Buchhaltung.

## 7. Nächster Schritt

David Steimer bezeichnet die nicht produktive Testsite, den App-Katalogpfad sowie Team und Kanal. Anschliessend wird das veröffentlichte `.sppkg` installiert, der AP5-Release byteidentisch in den Mirror kopiert und der Prüfkatalog T03 bis T08 sowie T13 und T14 abgearbeitet.

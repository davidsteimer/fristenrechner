# Fristenrechner Schweiz Technische Kurzdokumentation

| Merkmal | Stand |
| --- | --- |
| Dokumentzweck | Technische Beurteilung und Übergabe an eine Microsoft-365-IT |
| Interner Produktstand | MVP 0.9, Anwendung `0.9.0`, SPFx-Paket `0.9.0.0`, vier bestehende E-/Q-Instanzen. Q, Geräteprüfung, Gastzugriff und begrenzte Outlook-Wiederverwendung am 19. Oktober 2026 bestätigt |
| Letzter dokumentierter öffentlicher Betriebsstand | MVP 0.8 gemäss Produktionsnachweis vom 16. Oktober 2026, keine neue Liveinventur |
| Publikationsstatus MVP 0.9 | Lokale Vorbereitung. GitHub-Veröffentlichung und P-Bereitstellung bleiben gesondert freizugeben |
| Stand | 19. Oktober 2026 |
| Lizenz | Programmcode AGPL-3.0-only, Dokumentation und kuratierte Daten grundsätzlich CC BY-SA 4.0 |

MVP 0.9 umfasst 25 kantonale Verwaltungswege: TI fünf, GR sieben, LU vier, ZG vier und AR fünf. LU ist ab 27.09.2026, ZG und AR ab 29.08.2026 gedeckt, jeweils einschliesslich aller benötigten Berechnungstage bis 31.12.2027. Die bisherigen TI-/GR-Fenster und TI-O2 bleiben erhalten. AR-O1 sperrt die vorbehaltene Konstellation. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben ausschliesslich für Bern und 2026–2027 freigegeben. Die landesweite Kalenderabdeckung der unterstützten Bundesverfahren, Berner Spezialverfahren und Datumseingabe bleiben enthalten. [E-/Q-Vollzug](../betrieb/eq-vollzugsnachweis-mvp09.md), [Q-Abnahme](../betrieb/abnahme-q-mvp09.md) und [Releasehinweise](../betrieb/release-notes-mvp09.md) trennen technischen Nachweis, menschliche Abnahme und Veröffentlichung.

## 1 Tenantportabilität

Die clientseitige SharePoint-Framework-Lösung, kurz SPFx, ist für andere Microsoft-365-Tenants ausgelegt. Sie benötigt keinen eigenen Anwendungsserver, keine Datenbank und keine tenantfremde Entra-ID-App. Ein abgenommener Dritt-Tenant-Betrieb ist noch nicht nachgewiesen und muss dort separat geprüft werden.

Das `.sppkg` enthält seine Client-Assets, keine Zieladresse des steimer.ch-SharePoint-Tenants und keine Anforderung zusätzlicher Graph- oder Web-API-Berechtigungen. Die Website wird aus dem angemeldeten M365-Kontext bestimmt. `https://steimer.ch` dient als Herstellerinformation, nicht als Laufzeitendpunkt. Die Lösung ist nicht domainisoliert und läuft im Kontext der angemeldeten Person.

Die Erstinstallation braucht Zugriff auf einen App-Katalog. Für eine direkte Teams-Registerkarte ist zusätzlich die organisationsinterne Teams-App zuzulassen. Die Nutzung benötigt keine Admin-Rolle. Die Lösung ist adminarm, nicht adminfrei.

## 2 Lösungsarchitektur

| Baustein | Aufgabe |
| --- | --- |
| SPFx-Hostadapter | Erkennt SharePoint oder Teams, stellt den Websitekontext bereit und wählt die Datenquelle |
| React-Oberfläche | Erfasst erforderliche Fallangaben, zeigt Automatismen, Resultat und verständliche Rechenspur auf DE/FR |
| TypeScript-Rechenkern | Berechnet reine Kalenderdaten ohne Uhrzeiten oder Zeitzonenabhängigkeit |
| Release-Service | Validiert den vollständigen Datenrelease vor atomarer Aktivierung |
| GitHub-Provider | Liest einen auf einen unveränderlichen Commit gepinnten Datenrelease |
| SharePoint-Provider | Liest einen byteidentischen Mirror auf derselben SharePoint-Website |
| Browser-Store | Hält validierte Daten in IndexedDB, getrennt nach tatsächlicher Provider-/Datenkonfiguration |

Der Rechenkern kennt weder SharePoint noch Teams. Der Hostadapter enthält keine Fristenlogik. Nur ein bereits validierter Stand derselben konkreten Datenkonfiguration kann bei einem späteren Abruffehler helfen. Ein anderer Mirror, AP5 oder ein alter originweiter Aktivzeiger ersetzt keinen fehlgeschlagenen Erstabruf einer neuen Quelle.

Die statische Webausprägung verwendet denselben Kern und dieselbe Oberfläche mit eingebettetem Datenrelease, ohne Laufzeitabruf von GitHub oder SharePoint. Sie gehört nicht zur Dritt-Tenant-SPFx-Installation. Das lokale [MVP09-Webpaket](../../outputs/release-mvp09-2026-10-18/fristenrechner-mvp09-steimer-web.zip) umfasst 658’325 Bytes, SHA-256 `f7d112b015833251d3d41a5fe418e9f8063fe85aa46e48c1dafbf053031516d3`. Der [Artefaktnachweis](../betrieb/releaseartefakte-mvp-09.md) ist keine öffentliche Hostingabnahme.

## 3 Toolchain

| Komponente | Gebundener Stand |
| --- | --- |
| Node.js / npm | `22.23.2` / `10.9.8` |
| SharePoint Framework | `1.23.2` |
| Buildsystem | Rush Stack Heft `1.2.17` |
| TypeScript | `5.8.3` |
| React und React DOM | `17.0.1` |
| Fluent UI React | `8.106.4` |
| Tests | Node Test Runner, TypeScript über `tsx`, ES5- und tatsächliche Paketbundle-Prüfungen |
| Daten | JSON, JSON Schema Draft 2020-12, ISO-Kalenderdaten, SHA-256 |
| Daten-/Governanceprüfungen | Python 3.12 in `.venv`, Abhängigkeiten gemäss `requirements-data.txt` |

Dies sind die nachgewiesenen Buildversionen, keine Empfehlung zum neuesten Werkzeugstand. Vor Upgrades ist die offizielle SPFx-Kompatibilitätsmatrix gesondert zu prüfen. Endpersonen benötigen weder Node.js noch npm.

## 4 Quellcode und Prüfungen

Die führenden Produktquellen liegen unter `src/`, die M365-Integration unter `spfx/`. Vor SPFx-Test und -Build werden Quellen und Schemata mechanisch synchronisiert. Diese Kopien sind keine zweite fachliche Quelle.

Nach `npm ci` mit der gebundenen Node-Version und Einrichtung der Python-Umgebung sind aus dem Repositoryhauptordner folgende bestehende Prüfungen verfügbar:

```bash
npm run typecheck
node scripts/verify-mvp09-public-integrity.mjs
npm test
npm run test:source-reviews
```

Typ- und Integritätsprüfung erzeugen keinen Produktbuild. Der öffentliche Standardumfang umfasst Produkt/UI und Governance. Einzelne Tests erzeugen Test- und Vorschauausgaben. `npm run check` baut zusätzlich Vorschau und öffentliche Webausprägung. Solche Sammelläufe gehören in eine Arbeitskopie, nicht in einen versiegelten Artefaktbestand.

`node scripts/verify-mvp09-public-integrity.mjs` prüft 42 Laufzeitdateien und sieben Schemata anhand ihrer gebundenen Bytes. Dies ist kein erneuter juristischer Quellenabgleich. `node scripts/run-standard-tests.mjs private-mvp09` benötigt private Nachweise. Vollständige Recovery-/Quellenaudits sind nicht als öffentliche Standardprüfungen ausgewiesen.

Die [Publikationsvorprüfung](../betrieb/publikationsvorpruefung-mvp09.md) dokumentiert die Portabilität. Die [Publikationsvorlage](../betrieb/publikationspaket-mvp09.md) bindet die öffentliche Dateiauswahl. Nach deren Erstellung prüft `node scripts/verify-mvp09-publication.mjs` die Positivliste lesend. Ein technischer Exporttest erteilt keine Veröffentlichungsfreigabe.

Der [gebundene SPFx-Bau](../betrieb/releaseartefakte-mvp-09.md) bestand die im [öffentlichen Buildnachweis](../../outputs/publication-mvp09-2026-10-19/evidence/summaries/product-build.json) gebundenen Quell-/Provider- und tatsächlichen Paketprüfungen. Pakettests ersetzen keine Hostprüfung. Überlappende Gruppen werden nicht addiert. Ein Heft/Jest-Schritt ohne eigene Suiten ist kein zusätzlicher Testbestand. Ein unabhängiger byteidentischer SPFx-Zweitbau wird nicht behauptet.

## 5 Paket und Datenvertrag

| Merkmal | Gebundener E-/Q-Stand |
| --- | --- |
| Paket | [`fristenrechner-schweiz-0.9.0.0.sppkg`](../../outputs/release-mvp09-2026-10-18/fristenrechner-schweiz-0.9.0.0.sppkg) |
| Anwendung / Paketversion | `0.9.0` / `0.9.0.0` |
| Grösse | 327’130 Bytes |
| SHA-256 | `7a88f0f8f579c050e8354f8e741921251135bff804318f86dc1b34c1a12cc331` |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Component-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Hosts | `SharePointWebPart`, `TeamsTab` |
| Automatische tenantweite Installation | Nein, Installation pro freigegebener Zielwebsite |

Ein Neubau mit abweichender Prüfsumme benötigt einen eigenen Nachweis. Der generische Buildpfad `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` bezeichnet nicht automatisch das aktuelle Auslieferungs- oder Recoverypaket.

Der Datenrelease heisst `2026-10-18-mvp-09-approved.1`. Manifest SHA-256: `3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265`. Der lokale Datencommit `0ccc4b9178503ede051964149a4b17efab8d0cf9` ist noch nicht veröffentlicht oder öffentlich als abrufbar bestätigt. Der GitHub-Modus setzt Veröffentlichung und vollständigen Rohbytevergleich voraus. `main` ist kein produktiver Datenpin.

| Komponentenvertrag | MVP 0.9 |
| --- | --- |
| Manifest / Mindestconsumer | `9.0.0` |
| Verwaltungsverfahrenskatalog | `2.0.0` |
| Sämtliche 32 Regelkalender | `3.0.0` |
| Schweizer Feiertagskatalog | `2.0.0` |
| Rechtsprofile | `1.0.0` |
| Spezialregimekatalog | `3.0.0` |
| Sozialverfahrenskatalog | `2.0.0` |

Der Consumer unterstützt historische Formate 1 bis 8. Ein MVP08-Consumer kann Format 9 nicht lesen. Der neue Mirror umfasst **42 Dateien**: Manifest, 32 Kalender, fünf Profile und vier Kataloge. Die [Mirroranleitung](../betrieb/installation-und-betrieb-dritttenants.md#62-variante-b-tenantinterner-sharepoint-mirror) enthält sämtliche Pfade.

Vor Aktivierung werden Schema, Format, Freigabestatus, sichere relative Pfade, Bytes, SHA-256, Content-IDs, Referenzen und Abdeckung geprüft. 198 Herkunftsentscheide und 104 Bundesverfahrensbindungen bleiben getrennt. Rollen und regionale Fakten werden qualifiziert. Kein erster Kalendertreffer, keine freie Vereinigung und kein stiller BE-/CH-Ersatzkalender.

## 6 Speicherung und Betrieb

Berechnung und ICS-Export erfolgen lokal. Fristdaten und optionale Referenz werden nicht an GitHub oder einen Fachdienst übertragen. Das Paket enthält keine `webApiPermissionRequests`, kein Geheimnis und keine Entra-ID-App-Registrierung.

Bei Format 9 verwenden Standards Version 5. Die Migration kann beim ersten Laden erfolgen und bewahrt den alten Schlüssel. Gespeichert werden stabile Auswahlen, nicht Datum, Referenz, Resultat, konkrete Fallqualifikation, Dringlichkeit oder fallbezogene Regionalantworten. Ein Resetmarker verhindert den Wiederimport alter Standards. Alte Formate verwenden den bisherigen Speicherpfad. Gemeinsame Browserkontexte und fremde Standards sind bei Tests zu schützen.

| Datenquelle | Laufzeitverbindung und Voraussetzung |
| --- | --- |
| GitHub | HTTPS zu `raw.githubusercontent.com`, vollständig veröffentlichter und geprüfter Pin |
| SharePoint-Mirror | REST auf derselben Website, Leserecht auf allen 42 Dateien und erforderlichen Ordnern |

Neue Mirrors werden kontrolliert manuell übernommen. Es gibt keine automatische Replikation. Die fachliche Quellenprüfung erfolgt jährlich spätestens am 15. November und anlassbezogen. Ohne regelrelevante Änderung ist kein neuer Datenrelease nötig. Quellenregister und Prüfereignisse können getrennt vom Laufzeitmirror gespiegelt werden.

Ein Katalogwechsel kann allen bereits verbundenen Instanzen neuen Code liefern. Der [gebilligte Rückfallweg](../betrieb/freigabe-r09-c.md) verwendet [Recovery `0.9.0.1`](../betrieb/rueckfall-mvp09.md) mit MVP08-Funktionalität. Zuerst werden aktuelle Ansichten auf ihre gesicherten Format-8-Mirrors zurückgeführt, danach wird das höhere Paket eingesetzt. AP5 und Standards bleiben geschützt. Kein Browserdatenreset. Recovery wurde nicht eingesetzt. Eine reguläre MVP09-Wiederaufnahme benötigt danach einen erneut höheren geprüften Paketstand.

## 7 Abdeckung und Nachweisgrenzen

Die [Q-Abnahme](../betrieb/abnahme-q-mvp09.md) schliesst R09-C. Der [Vollzugsnachweis](../betrieb/eq-vollzugsnachweis-mvp09.md) dokumentiert vier Hosts, alte Q-Format-8-Kontexte, historische AP5-Ansichten, Referenz- und Sperrfälle, DE/FR, Datumseingabe, Standards und acht tatsächlich gespeicherte Kalenderdateien. Menschliche Geräte-/Gastbestätigung bleibt von automatisierten Einzelprüfungen getrennt. VoiceOver ist nicht separat nachgewiesen.

Die begrenzte Outlook-Wiederverwendung ist bestätigt. Sie betrifft den unveränderten Terminvertrag, nicht die neue administrative Herkunfts-/Exportlogik oder deren aktuelle Darstellung in Outlook. Ein neuer Outlook-Import fand nicht statt. Erinnerungszustellung, aktuelle Outlookversionen und dunkelgrüne Kategorienfarbe werden dadurch nicht frisch nachgewiesen.

- MVP 0.9 umfasst 25 kantonale Verwaltungswege: TI fünf, GR sieben, LU vier, ZG vier und AR fünf. LU ist ab 27.09.2026, ZG und AR ab 29.08.2026 gedeckt, jeweils einschliesslich aller benötigten Berechnungstage bis 31.12.2027. Die bisherigen TI-/GR-Fenster und TI-O2 bleiben erhalten. AR-O1 sperrt die vorbehaltene Konstellation. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben ausschliesslich für Bern und 2026–2027 freigegeben. TI-O2 bleibt beim betroffenen Übergang durch Endverschiebung in einen neuen Fristenstillstand gesperrt. Gesetzliche und angeordnete Fristen sowie GR-Verwaltung und Gericht werden unterschieden.
- Die 44 Sozialregeln und 50 BE-Anbindungen bleiben ausschliesslich für Bern und 2026–2027 freigegeben.
- Die nationale Kalenderabdeckung betrifft die unterstützten Bundesverfahren. Januargrenzen, AI-Behandlung, GR-/NE-Vorbehalte und der begrenzte Freiburger Praxisbeleg bleiben erhalten. Der GR-Vorbehalt der Bundesverfahren ist nicht mit dem eigenen kantonalen Verwaltungspfad gleichzusetzen.
- Weitere kantonale Verwaltungsverfahren, nicht modellierte Spezialfälle und eigenständiges kommunales Recht sind ausgeschlossen. Oberflächensprachen bleiben DE/FR.
- Die Feldhöhe #50 ist im abgenommenen Paket korrigiert. T06-H01 und B11-H01 bleiben akzeptierte Darstellungsbefunde für den Folgerelease.
- Dritt-Tenant-Betrieb, SharePoint Server vor Ort, neue Gastrechte und eine formelle WCAG-Konformitätsbewertung sind nicht durch diese Unterlage nachgewiesen.

Der [Produktionsnachweis MVP 0.8](../betrieb/produktionsbereitstellung-mvp08-2026-10-16.md) enthält die akzeptierten, nicht behobenen Header-/Cacheabweichungen. Für MVP 0.9 bleiben P-Freigabe, frische Sicherung, erneuter Vergleich und Risikoentscheid gesonderte Schritte.

## 8 Referenzen

- [Microsoft SPFx-Kompatibilitätsmatrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)
- [Microsoft SPFx-Lösungen für Teams](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/deployment-spfx-teams-solutions)
- [Microsoft SharePoint-App-Katalog](https://learn.microsoft.com/en-us/sharepoint/use-app-catalog)
- [Microsoft benutzerdefinierte Teams-Apps](https://learn.microsoft.com/en-us/microsoftteams/teams-custom-app-policies-and-settings)
- [MVP09-Deploymentplan](../betrieb/deployment-mvp-09.md)
- [Installation und Betrieb in Dritt-Tenants](../betrieb/installation-und-betrieb-dritttenants.md)
- [Q-Betriebsanweisung](../betrieb/q-demobetrieb-ap15-betriebsanweisung.md)
- [Sicherheitsrichtlinie](../../SECURITY.md)
- [Lizenz](../../LICENSE) und [Lizenzabgrenzung](../../LICENSES/README.md)

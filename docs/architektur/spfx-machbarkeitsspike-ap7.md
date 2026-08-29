# AP7: Ausführungsplan für den SPFx-Machbarkeitsspike

| Merkmal | Festlegung |
| --- | --- |
| Dokumentstatus | ausführungsbereit |
| Planungsstand | 29. August 2026 |
| Verantwortlich | David Steimer |
| Ausarbeitung | David Steimer mit Codex |
| Folgepaket | `SPK-SPFX-01` |
| Maximale Dauer | 4,5 Nettoarbeitstage |
| Entscheidungsbezug | DEC-2026-003, DEC-2026-008 und DEC-2026-012 |

## 1. Zweck und Entscheidungsfrage

Der Spike weist nach, ob der Fristenrechner mit einem einzigen SharePoint-Framework-WebPart in SharePoint Online und Microsoft Teams betrieben werden kann. Gleichzeitig prüft er, ob derselbe providerneutrale AP5-Datenrelease aus einem öffentlichen GitHub-Release und aus einem tenantinternen SharePoint-Mirror geladen, vollständig validiert und atomar aktiviert werden kann.

Der Spike beantwortet am Ende genau diese Entscheidungsfrage:

> Ist SPFx als adminarme, vollständig webbasierte M365-Zielarchitektur für den Fristenrechner tragfähig, ohne den Rechenkern oder das Fachdatenformat an SharePoint oder Teams zu koppeln?

Das Ergebnis ist ein technischer Machbarkeitsentscheid. Es ist weder ein produktiver Release noch eine juristische oder gestalterische Abnahme des späteren Rechners.

## 2. Verbindliche Ausgangslage

### 2.1 Technischer Referenzstand

Für den Spike wird der am Planungsdatum aktuelle, von Microsoft dokumentierte Referenzstand verwendet:

| Baustein | Referenz | Festlegung für den Spike |
| --- | --- | --- |
| Zielplattform | SharePoint Online | kein SharePoint Server und keine klassische Seite |
| SharePoint Framework | SPFx 1.23.2 | exakt pinnen |
| Build-Toolchain | Heft und Webpack | keine neue Gulp-Konfiguration |
| Node.js | Version 22 LTS | in `.nvmrc` und Buildnachweis festhalten |
| React | 17.0.1 | exakt pinnen, keine automatische Patchanhebung |
| TypeScript | von SPFx 1.23.2 erzeugte und unterstützte Version | Generatorstand unverändert übernehmen und exakt sperren |
| UI-Bibliothek | vom Generator mitgeliefertes `@fluentui/react` v8 | keine parallele Einführung von Fluent UI v9 |
| Styling | CSS Modules und Fluent-Styling-APIs | keine globalen CSS-Klassen und keine externen Skripte |
| Paketierung | `.sppkg` mit eingebetteten Client-Assets | `includeClientSideAssets` aktiv |

SPFx 1.23.2 wurde am 30. Juni 2026 veröffentlicht. Microsoft nennt dafür Node.js 22 und React 17.0.1. Ab SPFx 1.22 ist Heft die aktuelle Toolchain. Für SPFx ab 1.18 empfiehlt Microsoft die vom Generator mitgelieferte Fluent-UI-React-v8-Version.

### 2.2 Bestehende Projektentscheide

Der Spike verändert die folgenden beschlossenen Leitplanken nicht:

- Der Pilot darf den freigegebenen Datenrelease öffentlich aus GitHub beziehen.
- Der Zielbetrieb muss denselben Release byteidentisch über einen SharePoint-Mirror beziehen können.
- Der Rechenkern kennt den gewählten Provider nicht.
- Ein Release wird erst nach vollständiger Schema-, Referenz-, Abdeckungs- und Prüfsummenprüfung aktiviert.
- Ein teilweise geladenes oder ungültiges Release wird nie aktiviert.
- Der letzte vollständig validierte Datenstand darf bei einem Netzwerkausfall weiterverwendet werden.
- Es gilt ein WIP-Limit von einem wesentlichen Arbeitspaket.

## 3. Hypothesen

| ID | Hypothese | Nachweis |
| --- | --- | --- |
| H1 | Ein einzelnes SPFx-WebPart läuft auf einer modernen SharePoint-Seite und als Teams-Kanalregisterkarte. | Dasselbe gebaute Paket und dieselbe Component-ID werden in beiden Hosts ausgeführt. |
| H2 | Die UI kann ausschliesslich mit der vom SPFx-Generator unterstützten React- und Fluent-UI-Version umgesetzt werden. | Keine zweite React-Laufzeit, kein Fluent UI v9 und keine globale CSS-Abhängigkeit im Paket. |
| H3 | Der öffentliche GitHub-Provider kann Manifest und Artefakte im M365-Browserkontext abrufen. | Erfolgreicher Abruf unter realer SharePoint-CSP sowie erfolgreicher CORS- und Netzwerktest. |
| H4 | Ein SharePoint-Provider kann denselben Release ohne Graph-Zusatzberechtigung aus einer Dokumentbibliothek lesen. | Abruf mit `SPHttpClient` im Kontext des angemeldeten Benutzers. |
| H5 | Beide Provider liefern nach Validierung fachlich und bytebezogen denselben Release. | Identische Release-ID und SHA-256-Werte für sämtliche Manifestartefakte. |
| H6 | Ein fehlerhafter oder unvollständiger Abruf ersetzt den letzten gültigen Datenstand nicht. | Manipulations- und Abbruchtest mit nachgewiesenem unverändertem Aktivstand. |
| H7 | Der Pilot kann mit wenigen, klar benannten administrativen Vorbereitungsschritten installiert werden. | Vollständige Rollen- und Berechtigungsliste sowie erfolgreiche Installation im Testtenant. |

## 4. Minimalprototyp

### 4.1 Enthaltene Funktionen

Das Folgepaket erstellt genau ein WebPart mit dem Arbeitsnamen `FristenrechnerSpike`. Es enthält:

- die Hosts `SharePointWebPart` und `TeamsTab`
- eine kleine Fluent-UI-Oberfläche mit Datenquellenwahl
- Anzeige von Host, Provider, Release-ID, Datenstatus und letztem erfolgreichen Ladezeitpunkt
- eine gemeinsame `ReleaseProvider`-Schnittstelle
- einen Provider für den öffentlichen GitHub-Release
- einen Provider für einen byteidentischen SharePoint-Mirror
- eine auf einen unveränderlichen Commit oder Release-Pfad gepinnte GitHub-Basisadresse
- vollständiges Laden aller im Manifest bezeichneten Artefakte
- Validierung der Release-ID, Format-Hauptversion, Dateigrössen und SHA-256-Prüfsummen
- atomare Aktivierung erst nach erfolgreicher Gesamtprüfung
- einen browserlokalen, persistenten `ValidatedReleaseStore`, bevorzugt auf Basis einer IndexedDB-Transaktion
- einen absichtlich beschädigten Release als Negativtest
- einen nachgewiesenen Fallback auf den letzten vollständig validierten Datenstand, auch nach einem Neuladen ohne Netz
- einen technischen Sprachumschalter Deutsch und Französisch für die wenigen Spike-Texte

Die Providerwahl wird über eine klar abgegrenzte Konfiguration vorgenommen. Ein Providerwechsel darf keine Änderung am Rechenkern, an den Schemata oder an den Fachdaten verlangen.

### 4.2 Vorgesehene technische Schichten

```text
SPFx-WebPart
  ├─ Hostadapter für SharePoint und Teams
  ├─ kleine Fluent-UI-Spike-Oberfläche
  ├─ ReleaseLoader
  │   ├─ GitHubReleaseProvider
  │   └─ SharePointReleaseProvider
  ├─ ReleaseValidator
  └─ ValidatedReleaseStore
```

Der `ValidatedReleaseStore` übernimmt nur einen vollständig validierten Release. Providerobjekte, HTTP-Antworten und SharePoint-Metadaten werden nicht an den späteren Rechenkern weitergereicht. Der Spike prüft, ob alle Dateien und der Zeiger auf den Aktivstand in einer einzigen browserlokalen Transaktion geschrieben werden können.

### 4.3 Nichtziele

Nicht Bestandteil des Spikes sind:

- der produktive Fristenrechner und sein vollständiges GUI
- die Implementierung des deterministischen Rechenkerns
- eine erneute fachliche Prüfung von AP4 bis AP6
- die jährliche Aktualisierungsautomatisierung für Feiertage und Gerichtsferien
- persönliche Defaults und deren Synchronisation
- eine produktive Datenrelease-Signatur oder Vertrauenskette
- ein produktiver SharePoint-Mirror-Prozess
- Microsoft Graph, Bots, Messaging Extensions oder Entra-App-Registrierungen
- eine tenantweite Rolloutautomatisierung
- vollständige Accessibility-, Last-, Penetrations- oder Browserkompatibilitätstests
- eine Ablösung der Steimer-Gestaltungsrichtlinien durch das Microsoft-Standardtheme

## 5. Testdaten und Testumgebung

### 5.1 Daten

Als positiver Testbestand dient ausschliesslich der freigegebene Release `2026-08-29-ap5-approved.1`. Der GitHub-Provider und der SharePoint-Mirror müssen die exakt gleichen Dateien und Bytes liefern.

Für Negativtests werden temporäre Kopien verwendet:

- Manifest mit unbekannter Hauptversion
- Artefakt mit falscher SHA-256-Prüfsumme
- fehlendes Artefakt
- vorzeitig abgebrochener Abruf
- Mirror mit abweichender Release-ID

Kein Test verändert den freigegebenen AP5-Release.

### 5.2 M365-Testumgebung

Der Spike benötigt:

- einen Microsoft-365-Testtenant mit SharePoint Online und Microsoft Teams
- eine moderne SharePoint-Testsite
- ein Team mit einem Kanal, das auf eine SharePoint-Site desselben Tenants verweist
- einen App-Katalog auf Tenant- oder Websitesammlungsstufe
- eine Dokumentbibliothek für den Mirror
- ein Testkonto mit Leseberechtigung auf Site und Mirror
- ein Installationskonto mit den für den gewählten App-Katalog nötigen Rechten
- eine Teams-Richtlinie, welche die Installation der Test-App zulässt
- ausgehenden HTTPS-Zugriff auf die festgelegte öffentliche GitHub-Adresse

Der steimer.ch-Tenant ist die bevorzugte Testumgebung. Produktive Sites und echte Verfahrensdaten werden nicht verwendet.

## 6. Tenantvoraussetzungen und Berechtigungen

### 6.1 Ehrliche Einordnung

Eine vollständig adminfreie SPFx-Installation ist nicht realistisch. Die Lösung kann im Betrieb ohne privilegierte Benutzerrechte funktionieren. Die erstmalige Bereitstellung eines App-Katalogs, die Paketfreigabe und gegebenenfalls die Teams-App-Richtlinie bleiben administrative Aufgaben.

### 6.2 Minimaler Berechtigungsbedarf

| Tätigkeit | Minimale Rolle oder Berechtigung | Häufigkeit |
| --- | --- | --- |
| Tenant-App-Katalog erstmals einrichten | SharePoint-Administrator | einmal je Tenant |
| Websitesammlungs-App-Katalog aktivieren | SharePoint-Administrator sowie Websitesammlungsadministrator auf Katalog- und Zielsite | einmal je Zielsite |
| `.sppkg` in bestehenden Websitesammlungs-App-Katalog laden | berechtigte Verwaltung des lokalen App-Katalogs | je Release |
| Paket auf Testsite installieren | Websitebesitzer oder gleichwertige App-Verwaltung | je Installation |
| App in den Teams-App-Katalog übernehmen | App-Katalog-Verwaltung und zulassende Teams-App-Richtlinie | je Release |
| GitHub-Release lesen | keine M365-API-Berechtigung | laufend |
| SharePoint-Mirror lesen | normale Leseberechtigung des angemeldeten Benutzers | laufend |

Für den Minimalprototyp werden keine `webApiPermissionRequests`, keine Microsoft-Graph-Berechtigungen und keine Entra-App-Registrierung vorgesehen. Der SharePoint-Abruf erfolgt mit `SPHttpClient` im bereits authentifizierten Benutzerkontext.

### 6.3 Zwei zu prüfende Deploymentpfade

**Pfad A: Tenant-App-Katalog**

- ein zentral verwaltetes `.sppkg`
- von SharePoint erzeugtes einfaches Teams-App-Paket über «Add to Teams»
- gute Wiederverwendbarkeit in mehreren Sites
- höherer zentraler Administrationsbedarf

**Pfad B: Websitesammlungs-App-Katalog**

- auf die Testsite begrenztes `.sppkg`
- geringere Sichtbarkeit im Tenant
- weiterhin einmalige Freischaltung durch einen SharePoint-Administrator
- Teams-Bereitstellung separat zu prüfen, weil die automatische tenantweite Teams-Synchronisation an den Tenant-App-Katalog anknüpft

Der Spike bevorzugt Pfad B für die SharePoint-Prüfung und verwendet Pfad A nur, wenn er für einen belastbaren Teams-Nachweis zwingend ist. Diese Abweichung wird im Ergebnisprotokoll ausgewiesen.

## 7. Prüfkatalog

| ID | Prüfung | Erfolgskriterium | Nachweis |
| --- | --- | --- | --- |
| T01 | reproduzierbarer Build | frische Installation, Produktionsbuild und Paketierung laufen mit den gepinnten Versionen fehlerfrei | Versionsliste, Buildlog und Paket-Hash |
| T02 | Paketinhalt | `.sppkg` enthält Client-Assets und keine unerwarteten externen Skriptquellen | Paketinventar |
| T03 | SharePoint-Host | WebPart lässt sich auf einer modernen Seite hinzufügen, laden und neu laden | URL, Screenshot und Konsolenprotokoll |
| T04 | Teams-Host | dieselbe Component-ID läuft als Kanalregisterkarte im Teams-Webclient und Desktopclient | Screenshot, Hostanzeige und Paket-ID |
| T05 | Fluent-UI-Kompatibilität | Oberfläche funktioniert in beiden Hosts ohne React-Duplikat, globale CSS-Kollision oder Laufzeitfehler | Abhängigkeitsbaum und Konsolenprotokoll |
| T06 | GitHub-Provider | freigegebenes Manifest und sämtliche Artefakte werden im SharePoint- und Teams-Kontext geladen | Providerprotokoll mit Release-ID und Hashes |
| T07 | SharePoint-Provider | byteidentischer Mirror wird mit normalen Benutzerleserechten geladen | Providerprotokoll und Berechtigungsnachweis |
| T08 | Providerparität | beide Provider erzeugen denselben validierten Aktivstand | Vergleich aller Release- und Artefakt-Hashes |
| T09 | atomare Aktivierung | erst nach vollständiger Prüfung wechselt der persistent gespeicherte Aktivstand | Zustandsprotokoll vor und nach Validierung |
| T10 | Fehler und Fallback | fehlendes oder manipuliertes Artefakt wird abgewiesen und der letzte gültige Stand bleibt nach Neuladen ohne Netz aktiv | Negativtestprotokoll |
| T11 | minimale Berechtigungen | keine Graph- oder zusätzliche API-Freigabe erforderlich | Paketmanifest und API-Freigabeseite |
| T12 | Tenantübertragbarkeit | URLs, Tenantname und Sitepfad sind konfigurierbar und nicht im Rechenkern fest kodiert | Konfigurationsprüfung |
| T13 | Grundzugänglichkeit | Kernbedienung funktioniert mit Tastatur, sichtbarem Fokus und verständlichen Statusmeldungen | kurzer manueller Prüfvermerk |
| T14 | Sprachfähigkeit | technische Spike-Texte wechseln zwischen Deutsch und Französisch | Screenshot beider Sprachen |

Ein Test gilt nur mit abgelegtem Nachweis als bestanden. Ein blosses «hat bei mir funktioniert» ist kein Nachweis, sondern Folklore.

## 8. Ablauf und Zeitbox

| Schritt | Ergebnis | Nettoaufwand |
| --- | --- | ---: |
| 1. Toolchain pinnen und SPFx-Projekt erzeugen | reproduzierbares Gerüst und Build | 0,50 AT |
| 2. Providervertrag und GitHub-Provider implementieren | vollständiger öffentlicher Releaseabruf | 0,75 AT |
| 3. SharePoint-Mirror und Provider implementieren | byteidentischer interner Abruf | 0,75 AT |
| 4. Validierung, atomare Aktivierung und Fallback | positiver und negativer Datenpfad | 0,50 AT |
| 5. SharePoint-Paketierung und Test | SharePoint-Nachweis | 0,75 AT |
| 6. Teams-Exposition und Test | Teams-Nachweis | 0,75 AT |
| 7. Paket-, Berechtigungs- und CSP-Prüfung | Sicherheits- und Deploymentnachweis | 0,25 AT |
| 8. Ergebnisbericht und Entscheidvorlage | Go, bedingtes Go oder Stop | 0,25 AT |
| **Total** |  | **4,50 AT** |

Der Spike wird nach 4,5 Nettoarbeitstagen beendet. Offene Punkte werden im Ergebnisbericht ausgewiesen und nicht durch stillschweigende Verlängerung kaschiert.

## 9. Stop-, Alternativ- und Eskalationskriterien

### 9.1 Go

Die SPFx-Zielarchitektur erhält ein Go, wenn alle Muss-Prüfungen T01 bis T12 bestanden sind und kein Befund einen zweiten Rechenkern, ein zweites Fachdatenformat oder zusätzliche laufende Administratorrechte verlangt.

### 9.2 Bedingtes Go

Ein bedingtes Go ist zulässig, wenn höchstens ein klar begrenzter Tenant- oder Deploymentvorbehalt verbleibt und dieser ohne Architekturbruch in maximal einem weiteren halben Arbeitstag geklärt werden kann. Der Vorbehalt erhält ein eigenes Arbeitspaket und einen benannten Entscheidtermin.

### 9.3 Stop

Der Spike wird mit Stop beendet, wenn mindestens eines dieser Kriterien eintritt:

- dasselbe WebPart kann nicht stabil in SharePoint und Teams betrieben werden
- GitHub- und SharePoint-Provider benötigen unterschiedliche Fachdaten oder unterschiedliche Rechenkernlogik
- ein teilweise geladenes oder manipuliertes Release kann aktiv werden
- der SharePoint-Mirror verlangt im Normalbetrieb weitergehende Rechte als normales Lesen
- die Teams-Integration benötigt eine zusätzliche Serverkomponente oder laufende Administrationshandlungen
- eine tragfähige Lösung überschreitet die Zeitbox von fünf Nettoarbeitstagen

### 9.4 Vorbereitete Alternativen

| Befund | Alternative |
| --- | --- |
| GitHub wird durch CORS, CSP oder Tenantnetzwerk blockiert | SharePoint-Mirror wird bereits im Pilot primärer Provider, GitHub bleibt Pflegequelle ausserhalb des Zieltenants |
| Teams-App kann im Testtenant nicht zentral freigegeben werden | SharePoint-Prototyp abschliessen und Teams-Nachweis in einem administrativ vorbereiteten Tenant als separates Paket durchführen |
| Websitesammlungs-App-Katalog genügt für Teams nicht | Tenant-App-Katalog als dokumentierte einmalige Voraussetzung akzeptieren |
| Ein WebPart benötigt hostspezifische Darstellung | zwei dünne Hostadapter verwenden, aber UI-Komponenten, Provider und spätere Rechenkernlogik gemeinsam halten |
| SPFx scheitert grundsätzlich an Zieltenantvorgaben | statische SharePoint-hosted Web-App oder Teams-Web-App als Alternative bewerten, ohne zwei Produktcodebasen zu eröffnen |

## 10. Lieferobjekte des Folgepakets

Das Folgepaket `SPK-SPFX-01` liefert:

- den Minimalprototyp unter `spike/spfx/`
- eine reproduzierbare Versions- und Buildkonfiguration
- das gebaute `.sppkg`
- eine Inventarliste des Paketinhalts
- den positiven und negativen Providernachweis
- die ausgefüllte Testmatrix T01 bis T14
- Screenshots aus SharePoint und Teams
- eine Rollen- und Berechtigungsmatrix für die Testinstallation
- einen kurzen Ergebnisbericht mit Go, bedingtem Go oder Stop
- einen Entwurf für DEC-2026-013 zur technischen Zielarchitektur

Der Architekturentscheid wird erst nach dem Spike durch David Steimer beschlossen. Codex dokumentiert die Evidenz, trägt aber keine formelle Freigabe- oder Haftungsverantwortung.

## 11. Nachweise und Quellen

- [SPFx-Kompatibilitätsmatrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)
- [SPFx 1.23.2 Release Notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.23.2)
- [Heft-basierte SPFx-Toolchain](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft)
- [Fluent UI in SPFx](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/fluent-ui-integration)
- [SPFx-WebParts in Microsoft Teams](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-expose-webparts-teams)
- [Deploymentoptionen für SPFx in Teams](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/deployment-spfx-teams-solutions)
- [Websitesammlungs-App-Katalog](https://learn.microsoft.com/en-us/sharepoint/dev/general-development/site-collection-app-catalog)
- [Verbindung zu SharePoint mit SPHttpClient](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/connect-to-sharepoint)
- [Governance für SPFx-Lösungen](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/governance-considerations)
- [Content Security Policy in SharePoint Online](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/content-securty-policy-trusted-script-sources)
- [DEC-2026-003](../entscheidungen/DEC-2026-003-github-feed-und-sharepoint-mirror.md)
- [DEC-2026-008](../entscheidungen/DEC-2026-008-wip-limit-und-paketgroesse.md)
- [DEC-2026-012](../entscheidungen/DEC-2026-012-providerneutrales-datenrelease-format.md)

## 12. eCH-Einordnung

Für SPFx-Versionen, M365-App-Kataloge und Teams-Paketierung besteht kein einschlägiger eCH-Technologiestandard. Deshalb werden hierfür die offiziellen Microsoft-Verträge verwendet. Der spätere Produktcode bleibt an offenen Webstandards ausgerichtet. Die kurze Grundprüfung T13 bereitet eCH-0059 Version 3.0 vor, ersetzt aber ausdrücklich keine vollständige Accessibility-Konformitätsprüfung.

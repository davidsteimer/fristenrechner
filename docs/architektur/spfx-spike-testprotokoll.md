# Testprotokoll SPK-SPFX-01

Dieses Protokoll wird während des SPFx-Machbarkeitsspikes ausgefüllt. Prüfkriterien und Nummern stammen aus dem [AP7-Ausführungsplan](spfx-machbarkeitsspike-ap7.md). Ein Test darf nur mit verlinktem oder benanntem Nachweis als bestanden markiert werden.

## 1. Durchführung

| Merkmal | Eintrag |
| --- | --- |
| Startdatum | 29. August 2026 |
| Abschlussdatum | offen |
| Durchgeführt durch | David Steimer mit Codex |
| Ergebnis | offen: Go, bedingtes Go oder Stop |
| Verwendeter Tenant | M365-Testtenant noch nicht verbindlich festgelegt |
| SharePoint-Testsite | nicht produktive Testsite noch nicht festgelegt |
| Team und Kanal | noch nicht festgelegt |
| App-Katalogtyp | vorhandener Tenant- oder Websitesammlungs-App-Katalog noch zu bezeichnen oder einzurichten |
| Git-Commit | wird mit dem veröffentlichten Spike-Stand im Issue #16 nachgeführt |
| `.sppkg` SHA-256 | `05c8b66be32736e95f91c4423ee46583fde8fbe10f5ad5db765161cc8067a72a` |

## 2. Versionsinventar

| Baustein | Soll | Ist | Abweichung begründet |
| --- | --- | --- | --- |
| SPFx | 1.23.2 | 1.23.2 | keine |
| Node.js | 22 LTS | 22.23.2 | keine |
| React | 17.0.1 exakt | 17.0.1 | keine |
| TypeScript | Generatorstand | 5.8.3 | keine |
| Fluent UI React | Generatorstand v8 | 8.106.4 exakt gepinnt | keine |
| Build-Toolchain | Heft | 1.2.17 | keine |
| Teams-Manifest | automatisch oder begründetes eigenes Paket | automatische SPFx-Teams-Exposition mit `TeamsTab` | realer Teams-Nachweis ausstehend |

## 3. Prüfergebnisse

Zulässige Statuswerte sind `bestanden`, `nicht bestanden`, `blockiert` und `nicht durchgeführt`.

| ID | Kurzbezeichnung | Status | Nachweis | Befund oder Abweichung |
| --- | --- | --- | --- | --- |
| T01 | reproduzierbarer Build | bestanden | `spike/spfx/evidence/local-build.md` | frisches `npm ci`, sechs Tests und Produktionsbuild erfolgreich |
| T02 | Paketinhalt | bestanden | `spike/spfx/evidence/package-inventory.md` | 21 intakte Einträge, Client-Assets eingebettet, keine externe Skriptquelle |
| T03 | SharePoint-Host | blockiert | Tenantnachweis ausstehend | Testsite und App-Katalog sind noch nicht verbindlich festgelegt |
| T04 | Teams-Host | blockiert | Tenantnachweis ausstehend | Team, Kanal und App-Freigabe noch nicht festgelegt |
| T05 | Fluent-UI-Kompatibilität | blockiert | Build und `npm ls` lokal bestanden | Laufzeitprotokoll aus beiden Hosts fehlt |
| T06 | GitHub-Provider | blockiert | `spike/spfx/evidence/github-provider.json` | echter Provider lokal vollständig bestanden, Browsernachweis in SharePoint und Teams fehlt |
| T07 | SharePoint-Provider | blockiert | Implementierung mit `SPHttpClient` gebaut | Mirror und Benutzerleserecht im Tenant fehlen |
| T08 | Providerparität | blockiert | automatisierter byteidentischer Zwei-Provider-Test bestanden | realer SharePoint-Mirror fehlt |
| T09 | atomare Aktivierung | bestanden | automatisierter IndexedDB-Test in `test/release-spike.test.ts` | Release und Aktivzeiger werden in derselben Transaktion geschrieben |
| T10 | Fehler und Fallback | bestanden | Manipulations- und Fehlartifakttests in `test/release-spike.test.ts` | ungültige Daten ersetzen den Aktivstand nicht |
| T11 | minimale Berechtigungen | bestanden | Paketmanifest und `spike/spfx/evidence/package-inventory.md` | keine API-Freigabe und keine Entra-App-Registrierung |
| T12 | Tenantübertragbarkeit | bestanden | WebPart-Eigenschaften und Providerkonstruktoren | GitHub- und Mirrorbasis konfigurierbar, Rechenkern nicht vorhanden und daher nicht gekoppelt |
| T13 | Grundzugänglichkeit | blockiert | Fluent-UI-Komponenten und Live-Region implementiert | manueller Tastatur- und Fokusnachweis im Host fehlt |
| T14 | Sprachfähigkeit | blockiert | deutsche und französische UI-Texte gebaut | Screenshots beider Sprachen im Host fehlen |

## 4. Providervergleich

| Merkmal | GitHub | SharePoint-Mirror | identisch |
| --- | --- | --- | --- |
| Release-ID | `2026-08-29-ap5-approved.1` | lokal identisch, Tenant offen | lokal ja |
| Manifest SHA-256 | `c84840ad56833cab6fca254b96dd8002dbb20f94f189a948587accd69aed3de6` | lokal identisch, Tenant offen | lokal ja |
| Anzahl Artefakte | 7 | lokal 7, Tenant offen | lokal ja |
| alle Artefakt-Hashes | vollständig geprüft | lokal vollständig geprüft, Tenant offen | lokal ja |
| Aktivstand nach Validierung | `2026-08-29-ap5-approved.1` | lokal identisch, Tenant offen | lokal ja |

## 5. Berechtigungsnachweis

| Prüfung | Ergebnis | Nachweis |
| --- | --- | --- |
| keine Graph-Berechtigung beantragt | bestanden | `package-solution.json` und gebautes Appmanifest |
| keine Entra-App-Registrierung verwendet | bestanden | Quell- und Paketprüfung |
| Mirror mit normalem Benutzerleserecht abrufbar | blockiert | Tenanttest ausstehend |
| benötigte Katalogrolle dokumentiert | bestanden | AP7-Ausführungsplan, Abschnitt 6 |
| benötigte Teams-Richtlinie dokumentiert | bestanden | AP7-Ausführungsplan, Abschnitte 5 und 6 |

## 6. Zeitnachweis

| Schritt | Plan | Ist | Restprognose |
| --- | ---: | ---: | ---: |
| Toolchain und Gerüst | 0,50 AT | offen | offen |
| Providervertrag und GitHub | 0,75 AT | offen | offen |
| SharePoint-Mirror | 0,75 AT | offen | offen |
| Validierung und Fallback | 0,50 AT | offen | offen |
| SharePoint-Test | 0,75 AT | offen | offen |
| Teams-Test | 0,75 AT | offen | offen |
| Sicherheit und Paket | 0,25 AT | offen | offen |
| Bericht und Entscheidvorlage | 0,25 AT | offen | offen |
| **Total** | **4,50 AT** | **offen** | **offen** |

## 7. Befunde und offene Punkte

| ID | Befund | Auswirkung | Empfehlung | Folgepaket nötig |
| --- | --- | --- | --- | --- |
| F-01 | M365-Testtenant, nicht produktive Testsite, Team und Kanal sind noch nicht verbindlich als Testziele festgelegt | T03 bis T08 sowie T13 und T14 können nicht abschliessend bewertet werden | Nicht produktive Testziele verbindlich bezeichnen | nein, Bestandteil dieses Spikes |
| F-02 | Neun moderate npm-Audit-Befunde liegen ausschliesslich in transitiven Entwicklungsabhängigkeiten der SPFx-Buildtoolchain | kein Befund in produktiven Abhängigkeiten, erzwungener Fix würde SPFx 1.23.2 brechen | Microsoft-Toolchain beobachten und keinen inkompatiblen Zwangsfix anwenden | nein |
| F-03 | Ein für den Test verwendbarer App-Katalogpfad ist noch nicht bestätigt | Das `.sppkg` kann ohne vorhandenen oder neu aktivierten App-Katalog nicht installiert werden | Bestehenden App-Katalogpfad bezeichnen oder einen Websitesammlungs-App-Katalog administrativ aktivieren | nein, Voraussetzung dieses Spikes |

## 8. Entscheidungsempfehlung

### Empfohlenes Ergebnis

Offen. Der lokale Zwischenstand löst kein Stop-Kriterium aus. Eine Empfehlung `Go`, `bedingtes Go` oder `Stop` folgt erst nach den Tenanttests.

### Begründung

Build, Paketierung, Providervertrag, Schema- und Prüfsummenvalidierung, atomare IndexedDB-Aktivierung, Fallback, konfigurierbare Provider sowie Deutsch und Französisch sind lokal nachgewiesen. Die entscheidenden Host-, Berechtigungs-, CORS- und Mirrorprüfungen benötigen eine konkrete M365-Testumgebung.

### Vorbehalte bei bedingtem Go

Offen bis zu den Tenanttests.

### Ausgelöste Alternative bei Stop

Keine oder offen.

## 9. Freigabe

| Rolle | Person | Entscheid | Datum |
| --- | --- | --- | --- |
| Technische Durchführung | David Steimer mit Codex | offen | offen |
| Architekturentscheid | David Steimer | offen | offen |

# Testprotokoll SPK-SPFX-01

Dieses Protokoll dokumentiert den abgeschlossenen SPFx-Machbarkeitsspike. Prüfkriterien und Nummern stammen aus dem [AP7-Ausführungsplan](spfx-machbarkeitsspike-ap7.md). Tenantinterne URLs, IDs, Screenshots und Kontoinformationen werden im öffentlichen Repository bewusst nicht offengelegt.

## 1. Durchführung

| Merkmal | Eintrag |
| --- | --- |
| Startdatum | 29. August 2026 |
| Abschlussdatum | 29. August 2026 |
| Durchgeführt durch | David Steimer mit Codex |
| Ergebnis | **Go-Empfehlung** für DEC-2026-013 |
| Verwendeter Tenant | nicht produktiver M365-Testtenant von steimer.ch |
| SharePoint-Testsite | dedizierte, gruppenfreie Kommunikationswebsite |
| Team und Kanal | bestehendes nicht produktives Testteam, Standardkanal für den Fristenrechner |
| App-Katalogtyp | Tenant-App-Katalog |
| Git-Commit | wird mit dem Abschlusskommentar im GitHub-Issue #16 nachgeführt |
| `.sppkg` SHA-256 | `558dd7c5c227650b251046e467e38a5c5ed2f59ad2b5147e09aebbf012d763f1` |

## 2. Versionsinventar

| Baustein | Soll | Ist | Abweichung begründet |
| --- | --- | --- | --- |
| SPFx | 1.23.2 | 1.23.2 | keine |
| Node.js | 22 LTS | 22.23.2 | keine |
| React | 17.0.1 exakt | 17.0.1 | keine |
| TypeScript | Generatorstand | 5.8.3 | keine |
| Fluent UI React | Generatorstand v8 | 8.106.4 exakt gepinnt | keine |
| Build-Toolchain | Heft | 1.2.17 | keine |
| Teams-Manifest | automatisch oder begründetes eigenes Paket | automatische SPFx-Teams-Exposition mit `TeamsTab` | keine |

## 3. Prüfergebnisse

Alle 14 Prüfungen sind bestanden.

| ID | Kurzbezeichnung | Status | Nachweis | Befund oder Abweichung |
| --- | --- | --- | --- | --- |
| T01 | reproduzierbarer Build | bestanden | [`local-build.md`](../../spike/spfx/evidence/local-build.md) | frisches `npm ci`, sechs Tests und Produktionsbuild erfolgreich |
| T02 | Paketinhalt | bestanden | [`package-inventory.md`](../../spike/spfx/evidence/package-inventory.md) | 21 intakte Einträge, Client-Assets eingebettet, keine externe Skriptquelle |
| T03 | SharePoint-Host | bestanden | [`tenant-run.md`](../../spike/spfx/evidence/tenant-run.md) | WebPart auf moderner SharePoint-Seite ausgeführt, Host korrekt als SharePoint Online erkannt |
| T04 | Teams-Host | bestanden | [`tenant-run.md`](../../spike/spfx/evidence/tenant-run.md) | dasselbe Paket als Registerkarte ausgeführt, Host korrekt als Microsoft Teams erkannt |
| T05 | Fluent-UI-Kompatibilität | bestanden | manueller Laufzeit- und Interaktionsnachweis in beiden Hosts | Fluent-UI-Komponenten ohne zweite React-Laufzeit gerendert und bedient |
| T06 | GitHub-Provider | bestanden | [`github-provider.json`](../../spike/spfx/evidence/github-provider.json) und [`tenant-run.md`](../../spike/spfx/evidence/tenant-run.md) | gepinnter AP5-Release in SharePoint und Teams vollständig validiert und atomar aktiviert |
| T07 | SharePoint-Provider | bestanden | [`tenant-run.md`](../../spike/spfx/evidence/tenant-run.md) | realer Mirror mit `SPHttpClient` und Benutzerleserecht vollständig validiert |
| T08 | Providerparität | bestanden | automatisierter Test und realer Providervergleich | GitHub und SharePoint-Mirror lieferten dieselbe Release-ID sowie dieselben manifestgeprüften Bytes |
| T09 | atomare Aktivierung | bestanden | automatisierter IndexedDB-Test in `test/release-spike.test.ts` | Release und Aktivzeiger werden in derselben Transaktion geschrieben |
| T10 | Fehler und Fallback | bestanden | Manipulations- und Fehlartifakttests sowie Wiederherstellung im Teams-Host | ungültige Daten ersetzen den Aktivstand nicht, letzter gültiger Stand wird wiederhergestellt |
| T11 | minimale Berechtigungen | bestanden | Paketmanifest, App-Katalog- und Laufzeitnachweis | keine API-Freigabe und keine Entra-App-Registrierung erforderlich |
| T12 | Tenantübertragbarkeit | bestanden | WebPart-Eigenschaften, Providerkonstruktoren und getrennte Site-Installationen | GitHub- und Mirrorbasis konfigurierbar, Rechenkern nicht vorhanden und daher nicht gekoppelt |
| T13 | Grundzugänglichkeit | bestanden | manueller Tastatur- und Fokusnachweis in SharePoint | Dropdown mit Tastatur bedient, Fokus mit Tabulator nachvollziehbar zum Datumsfeld verschoben |
| T14 | Sprachfähigkeit | bestanden | deutscher und französischer Laufzeitnachweis in SharePoint und Teams | Produkttexte, Statusbezeichnungen und Auswahlwerte wechseln vollständig zwischen Deutsch und Französisch |

## 4. Providervergleich

| Merkmal | GitHub | SharePoint-Mirror | identisch |
| --- | --- | --- | --- |
| Release-ID | `2026-08-29-ap5-approved.1` | `2026-08-29-ap5-approved.1` | ja |
| Manifest SHA-256 | `c84840ad56833cab6fca254b96dd8002dbb20f94f189a948587accd69aed3de6` | `c84840ad56833cab6fca254b96dd8002dbb20f94f189a948587accd69aed3de6` | ja |
| Anzahl Artefakte | 7 | 7 | ja |
| alle Artefakt-Hashes | vollständig geprüft | vollständig geprüft | ja |
| Aktivstand nach Validierung | `2026-08-29-ap5-approved.1` | `2026-08-29-ap5-approved.1` | ja |
| Abdeckung | 29.08.2026 bis 31.12.2028 | 29.08.2026 bis 31.12.2028 | ja |

## 5. Berechtigungs- und Bereitstellungsnachweis

| Prüfung | Ergebnis | Nachweis |
| --- | --- | --- |
| keine Graph-Berechtigung beantragt | bestanden | `package-solution.json` und gebautes Appmanifest |
| keine Entra-App-Registrierung verwendet | bestanden | Quell-, Paket- und Laufzeitprüfung |
| Mirror mit normalem Benutzerleserecht abrufbar | bestanden | vollständige Validierung im SharePoint-Host |
| Tenant-App-Katalog funktionsfähig | bestanden | Paketversion 1.0.0.0 als gültig und aktiviert ausgewiesen |
| Testsite-Installation funktionsfähig | bestanden | App auf der dedizierten Kommunikationswebsite hinzugefügt |
| Teams-Site-Installation funktionsfähig | bestanden | App zusätzlich auf der zum Team gehörenden SharePoint-Website hinzugefügt |
| Teams-App-Richtlinie ausreichend | bestanden | benutzerdefinierte App im Kanaldialog auffindbar und als Registerkarte speicherbar |

Die Erstbereitstellung ist damit adminarm, aber nicht adminfrei. Neben dem Tenant-App-Katalog braucht jede verwendete SharePoint-Website eine lokale App-Installation. Das gilt auch für die SharePoint-Website des Teams.

## 6. Zeitnachweis

| Merkmal | Wert |
| --- | --- |
| Plan | höchstens 4,5 Nettoarbeitstage |
| Ist | weniger als ein Nettoarbeitstag |
| Zeitbox eingehalten | ja |
| Stop-Kriterium ausgelöst | nein |

Die Arbeitsschritte wurden nicht minutenweise verrechnet. Issue-, Build- und Laufzeitnachweise liegen alle am 29. August 2026. Damit ist die Einhaltung der Obergrenze eindeutig.

## 7. Befunde

| ID | Befund | Auswirkung | Empfehlung | Folgepaket nötig |
| --- | --- | --- | --- | --- |
| F-01 | Die fehlenden Testziele wurden durch eine dedizierte Kommunikationswebsite und ein bestehendes Testteam geschlossen | alle Host- und Laufzeitprüfungen konnten abgeschlossen werden | Testziele für weitere M365-Prüfungen weiterhin explizit benennen | nein |
| F-02 | Neun moderate npm-Audit-Befunde liegen ausschliesslich in transitiven Entwicklungsabhängigkeiten der SPFx-Buildtoolchain | kein Befund in produktiven Abhängigkeiten, erzwungener Fix würde SPFx 1.23.2 brechen | Microsoft-Toolchain beobachten und keinen inkompatiblen Zwangsfix anwenden | nein |
| F-03 | Der Tenant hatte zu Beginn keinen App-Katalog | einmalige administrative Aktivierung war nötig | Tenant-App-Katalog als Bereitstellungsvoraussetzung dokumentieren | nein |
| F-04 | Der technische Paketname mit Gedankenstrich verletzte die SharePoint-`NameDefinition` | erste Paketvalidierung schlug fehl | technischer Paketname wurde auf `Fristenrechner Schweiz SPFx Machbarkeitsspike` bereinigt, der sichtbare Produkttitel bleibt unverändert | nein |
| F-05 | Tenantweite Aktivierung allein lud die Teams-Konfiguration auf der Teamwebsite noch nicht | erster Konfigurationsversuch endete mit einer generischen SharePoint-Ladefehlermeldung | App auf der zum Team gehörenden SharePoint-Website zusätzlich installieren | nein |
| F-06 | Der SharePoint-Mirrorpfad ist in der konkreten Teams-Registerkarte absichtlich leer | der Spike weist den Teams-Host und den GitHub-Provider nach, nicht einen zweiten Mirrorstandort auf der Teamwebsite | Mirror für Teams erst nach Festlegung des tenantinternen Standorts konfigurieren und separat prüfen | ja, im produktiven Deploymentpaket |
| F-07 | Externe und Gastzugriffe wurden absichtlich nicht freigegeben oder geprüft | aus dem internen Tenanttest darf keine Freigabe für Gastkonten abgeleitet werden | allfälligen Gastbetrieb in einem eigenen Sicherheits- und Berechtigungstest behandeln | ja, nur falls Gastbetrieb benötigt wird |

## 8. Entscheidungsempfehlung

### Empfohlenes Ergebnis

**Go.** DEC-2026-013 soll beschlossen werden.

### Begründung

Dasselbe `.sppkg` und dieselbe Component-ID laufen in SharePoint Online und Microsoft Teams. Beide Hosts verwenden dieselbe Fluent-UI-Komponente und denselben providerneutralen Kern. Der gepinnte GitHub-Provider und der byteidentische SharePoint-Mirror aktivieren denselben freigegebenen AP5-Datenrelease erst nach vollständiger Validierung. Der letzte gültige Stand bleibt als lokaler Fallback verfügbar. Zusätzliche Graph- oder Entra-API-Berechtigungen waren nicht nötig.

Die betrieblichen Voraussetzungen App-Katalog und lokale Site-Installation sind reale Aufwände. Sie widersprechen dem Ziel «adminarm» nicht, zeigen aber klar, dass «adminfrei» keine ehrliche Beschreibung wäre.

### Vorbehalte

- Die produktive Fachlogik und die vollständige Benutzeroberfläche waren ausdrücklich nicht Teil des Spikes.
- Der SharePoint-Mirror muss später tenantintern gepflegt und mit normalen Leserechten für die Zielgruppen bereitgestellt werden.
- Die transitiven Auditbefunde der Microsoft-Buildtoolchain bleiben zu beobachten.

### Ausgelöste Alternative bei Stop

Keine.

## 9. Freigabe

| Rolle | Person | Entscheid | Datum |
| --- | --- | --- | --- |
| Technische Durchführung | David Steimer mit Codex | durchgeführt, Go empfohlen | 29. August 2026 |
| Architekturentscheid | David Steimer | DEC-2026-013 beschlossen | 29. August 2026 |

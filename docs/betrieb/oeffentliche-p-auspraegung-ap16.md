# AP16: Statischer P-Releasekandidat für steimer.ch

| Merkmal | Festlegung |
| --- | --- |
| Arbeitspaket | AP16 |
| Dokumentstatus | fachlich-technisch abgenommen, technisch bereitgestellt |
| Startdatum | 1. September 2026 |
| Verantwortlich und entscheidbefugt | David Steimer |
| Ausarbeitung und technische Unterstützung | David Steimer mit Codex |
| Methodik | HERMES 2022 agil, schlank in Personalunion |
| WIP | ein wesentliches Arbeitspaket |
| Aufwandobergrenze | fünf Nettoarbeitstage |
| Vorgänger | AP15 und DEC-2026-016 |
| Referenzrelease | `v0.3.0` |
| Fachdatenstand | `2026-08-31-mvp-03-approved.1` |
| Veröffentlichungsstatus | öffentlich bereitgestellt und mit DEC-2026-018 für den P-Betrieb freigegeben |

## 1. Ziel

AP16 erstellt einen reproduzierbaren, rein statischen P-Releasekandidaten des Berner Fristenrechners für die bestehende steimer.ch-Hosting-Infrastruktur. Der Kandidat verwendet denselben hostneutralen Rechenkern, dieselbe Produktoberfläche und denselben freigegebenen Datenstand wie Release `v0.3.0`.

Das Arbeitspaket beantwortet folgende Frage:

> Kann der vollständig freigegebene Fristenrechner als eigenständiges statisches Paket unter `/fristenrechner/` auf dem bestehenden steimer.ch-Webhosting betrieben werden, ohne M365-Laufzeitabhängigkeit, externe Datenabrufe, zusätzliche Infrastruktur oder eine zweite Produktcodebasis?

## 2. Verbindliche Leitplanken

1. Die bestehende steimer.ch-Hosting-Infrastruktur ist zwingend. AP16 evaluiert und beschafft keine Hostingalternative.
2. Der öffentliche Kandidat wird aus dem Fristenrechner-Repository gebaut. Das Steimer.ch-Projekt liefert Gestaltungs- und Hostingreferenzen, aber keinen zweiten Rechenkern.
3. Der Kandidat ist vollständig statisch. Er benötigt keine Datenbank, keine serverseitige Laufzeit, kein Microsoft 365, kein Microsoft Graph und keine App-Registrierung.
4. Der freigegebene Fachdatenstand wird beim Build eingebettet. Der Browser lädt weder GitHub-Daten noch einen SharePoint-Mirror.
5. Es werden keine Falldaten, Referenzen oder Berechnungen an einen Server übertragen.
6. Persönliche Standards bleiben ausschliesslich im lokalen Browserspeicher. Empfangsdaten und Kalenderreferenzen werden weiterhin nicht gespeichert.
7. Es gibt keine Analysebibliothek, keine Werbung, kein Tracking und keine extern eingebundenen Schrift- oder Iconressourcen.
8. Deutsch und Französisch bleiben gleichwertige Produktsprachen.
9. Der sichtbare Auftritt übernimmt die STEIMER-Grundgestaltung und grenzt das private Open-Source-Angebot klar von Behörden ab.
10. Eine erfolgreiche Kandidatenprüfung erteilt noch keine öffentliche P-Freigabe. Upload, Umschaltung, DNS-Änderung und öffentliche Bekanntgabe benötigen einen späteren ausdrücklichen Entscheid.

## 3. Zielarchitektur

Der P-Kandidat besteht aus:

- einer kleinen statischen STEIMER-Webhülle
- der bestehenden React-17- und Fluent-UI-Produktoberfläche
- dem bestehenden TypeScript-Rechenkern
- dem beim Build eingebetteten Datenrelease `2026-08-31-mvp-03-approved.1`
- inhaltsadressierten JavaScript- und CSS-Dateien
- einer Apache-Konfiguration für Sicherheits- und Cache-Header
- einem lokalen Buildmanifest mit Code-, Daten- und Pfadidentität

Die P-Webhülle ist vom bestehenden React-19-Webauftritt technisch entkoppelt. Gemeinsame Gestaltungselemente werden bewusst klein und statisch übernommen. Dadurch bleiben beide Toolchains unabhängig aktualisierbar.

## 4. Vorgesehener Hostingpfad

Der Kandidat wird für die kanonische Adresse `https://www.steimer.ch/fristenrechner/` gebaut. Sämtliche paketinternen Verweise sind relativ. Das Paket kann deshalb lokal, in einem nicht öffentlichen Stagingordner und später unter dem bezeichneten Unterpfad geprüft werden.

Bei der erstmaligen Veröffentlichung wurden am Root-Webauftritt separat ergänzt:

- Verweis auf den Fristenrechner
- Eintrag in `sitemap.xml`
- Prüfung, dass keine Anpassung von `robots.txt` erforderlich ist
- Prüfung der effektiven Header am öffentlichen Endpunkt

Diese Root-Änderungen waren nicht Bestandteil des AP16-Starts. Sie wurden nach bestandener öffentlicher Prüfung gesondert freigegeben, veröffentlicht und als D12 geprüft.

## 5. Prüfmatrix

| ID | Prüfung | Abnahmekriterium |
| --- | --- | --- |
| P01 | Referenzidentität | Codeversion, Datenrelease und Buildmanifest entsprechen dem bezeichneten Stand |
| P02 | reproduzierbarer Build | ein dokumentierter Befehl erzeugt HTML, inhaltsadressiertes JavaScript und CSS |
| P03 | Unterpfadfähigkeit | alle internen Assets funktionieren relativ unter `/fristenrechner/` |
| P04 | statischer Betrieb | keine Datenbank, Serverfunktion oder Laufzeit-API ist erforderlich |
| P05 | externe Abhängigkeiten | kein GitHub-, SharePoint-, Graph-, CDN-, Schrift- oder Iconabruf im Browser |
| P06 | QA-Abgrenzung | keine QA-Presets, Quellkarten oder Entwicklungsparameter im Paket |
| P07 | STEIMER-Webhülle | Gestaltung, Impressum und Behördenabgrenzung entsprechen der festgelegten Baseline |
| P08 | Deutsch und Französisch | Hauptablauf, Hinweise, Sperren und Resultate funktionieren in beiden Sprachen |
| P09 | fachliche Regression | bezeichnete allgemeine und besondere Referenzfälle stimmen mit Release `v0.3.0` überein |
| P10 | Kalenderexport | `.ics` wird vollständig clientseitig und mit dem freigegebenen Vertrag erzeugt |
| P11 | lokaler Speicher | nur zulässige Standards werden lokal gespeichert und zurückgesetzt |
| P12 | Barrierearmut | Tastaturablauf, Fokus, Kontrast, Statusmeldungen und mobile Breite bestehen die Projektprüfung |
| P13 | Sicherheitsheader | CSP, Inhaltstyp-, Referrer-, Einbettungs- und Berechtigungsheader sind vorbereitet |
| P14 | Cache und Rückfall | HTML bleibt revalidierbar, gehashte Assets sind lang cachebar und ein Rückfallpaket ist vorgesehen |
| P15 | Freigabegrenze | kein öffentliches Ziel wird ohne separaten Entscheid beschrieben oder aktiviert |

## 6. Umsetzungsschritte

| Schritt | Inhalt | Aufwandobergrenze |
| --- | --- | ---: |
| 1 | AP16-Plan, Quellen- und Hostinggrenzen dokumentieren | 0,50 AT |
| 2 | gemeinsame freigegebene Datenbindung und statische Webhülle implementieren | 1,25 AT |
| 3 | reproduzierbaren Build, Pfadmodell und Sicherheitsheader erstellen | 1,00 AT |
| 4 | automatisierte und visuelle Kandidatenprüfung durchführen | 1,25 AT |
| 5 | Deployment-, Rückfall- und Entscheidnachweis vorbereiten | 1,00 AT |
| **Gesamt** |  | **5,00 AT** |

## 7. Entscheidregeln

### Kandidat bestanden

Der P-Kandidat kann zur Abnahme vorgelegt werden, wenn P01 bis P15 bestanden sind und das Paket ohne externe Laufzeitabhängigkeit lokal unter einem Unterpfad funktioniert.

### Stop

AP16 endet ohne Bereitstellung, wenn insbesondere:

- das bestehende Hosting den sicheren Unterpfadbetrieb nicht unterstützt
- der Browser externe Laufzeitressourcen benötigt
- Fachdaten oder Kernlogik zwischen SPFx und P auseinanderlaufen
- die Content Security Policy nur mit externen Skripten oder unsicheren Skriptfreigaben funktioniert
- der öffentliche Kandidat QA- oder Entwicklungsartefakte enthält
- die Rückfallfähigkeit des bestehenden Webauftritts nicht gewahrt bleibt

### Öffentliche Freigabe und Vollzug

Die bestandene Kandidatenprüfung allein erteilte keine öffentliche Freigabe. David Steimer hat den konkreten Erstupload, die Vorprüfung, die öffentliche Umschaltung und anschliessend die beiden Root-Änderungen jeweils ausdrücklich freigegeben. Der bezeichnete Kandidat wurde daraufhin veröffentlicht und hat D01 bis D12 vollständig bestanden. Mit [DEC-2026-018](../entscheidungen/DEC-2026-018-freigabe-oeffentlicher-p-betrieb.md) hat David Steimer den öffentlichen P-Betrieb anschliessend formell freigegeben.

## 8. Rollen und Standards

David Steimer nimmt Projektleitung, fachliche Verantwortung, technische Abnahme, Informationssicherheitsbeurteilung und Freigabe derzeit in Personalunion wahr. Codex unterstützt als dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

Für die öffentliche Oberfläche gelten eCH-0059 und WCAG 2.1 AA als Qualitätsrahmen. Für die konkrete statische Apache-Bereitstellung besteht kein unmittelbar anwendbarer eCH-Implementierungsstandard. Die technische Ausgestaltung folgt deshalb den bestehenden Hostingmöglichkeiten und den dokumentierten Sicherheitsanforderungen.

## 9. Aktueller Stand

| Schritt | Status | Befund |
| --- | --- | --- |
| AP15-Abschluss und WIP-Freigabe | abgeschlossen | DEC-2026-016 beschlossen, Issue #32 geschlossen |
| AP16-Plan und Prüfmatrix | abgeschlossen | statischer Kandidat, Unterpfad, Freigabegrenze und Aufwandobergrenze festgelegt |
| technische Implementierung | abgeschlossen | gemeinsame Datenbindung, statische STEIMER-Webhülle, Unterpfad-Build und lokale Anbieterdateien umgesetzt |
| Kandidatenprüfung | abgeschlossen | P01 bis P15 auf Projektebene bestanden, Nachweis und Deploymentverfahren dokumentiert |
| AP16-Abnahme | abgeschlossen | am 1. September 2026 durch David Steimer fachlich-technisch abgenommen |
| DEC-2026-017 | beschlossen | statische P-Zielarchitektur auf der bestehenden steimer.ch-Hosting-Infrastruktur bestätigt |
| Erstupload und Vorprüfung | abgeschlossen | freigegebener Kandidat zunächst in nicht öffentlichen Hostingordner geladen und geprüft |
| öffentliche Umschaltung | abgeschlossen | `/fristenrechner/` öffentlich geschaltet, D01 bis D11 bestanden |
| Root-Integration | abgeschlossen | Startseitenverweis und `sitemap.xml` veröffentlicht, D12 bestanden |
| formeller P-Betriebsentscheid | abgeschlossen | mit DEC-2026-018 durch David Steimer freigegeben |

Der Kandidatenbefund steht im [AP16-Prüfnachweis](oeffentliche-p-auspraegung-ap16-nachweis.md). Der technische Vollzug und die vollständig bestandene öffentliche Matrix D01 bis D12 stehen im [Produktionsnachweis](produktionsbereitstellung-2026-09-01.md). Die [Deployment- und Rückfallanleitung](deployment-oeffentliche-p-auspraegung-ap16.md) bleibt für spätere Releases verbindlich. DEC-2026-017 bestätigt die statische Zielarchitektur. DEC-2026-018 gibt den öffentlichen P-Betrieb des bezeichneten Stands formell frei.

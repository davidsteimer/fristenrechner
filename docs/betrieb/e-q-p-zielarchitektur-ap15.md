# AP15: E/Q/P-Zielarchitektur und gruppenbasierter Q-Demobetrieb

| Merkmal | Festlegung |
| --- | --- |
| Arbeitspaket | AP15 |
| Dokumentstatus | abgeschlossen |
| Startdatum | 1. September 2026 |
| Abschlussdatum | 1. September 2026 |
| Verantwortlich und entscheidbefugt | David Steimer |
| Ausarbeitung und technische Unterstützung | David Steimer mit Codex |
| Methodik | HERMES 2022 agil, schlank in Personalunion |
| WIP | ein wesentliches Arbeitspaket |
| Aufwandobergrenze | vier Nettoarbeitstage |
| Vorgänger | AP14, technischer Gastnachweis ohne Betriebsfreigabe |
| Referenzrelease | `v0.3.0`, SPFx-Paket `0.3.0.0` |
| Fachdatenstand | `2026-08-31-mvp-03-approved.1` |

## 1. Ausgangslage und Ziel

AP14 hat belegt, dass der unveränderte Fristenrechner für einen authentifizierten B2B-Gast in SharePoint und Teams technisch funktioniert. Fachlogik, Deutsch und Französisch, lokaler Standardwertespeicher, Outlook-kompatibler Kalenderexport und read-only SharePoint-Mirror haben die Prüfungen bestanden. Für die clientseitigen Paketdateien war ein auf den konkreten `ClientSideAssets`-Paketordner beschränktes Leserecht erforderlich. Dieses Recht und sämtliche weiteren AP14-spezifischen Zugriffe konnten vollständig entzogen werden.

Die ursprüngliche AP14-Matrix verlangte zusätzlich, dass die verwendete Gastidentität keine anderen Teams im Tenant sieht. Dieses Kriterium passt nicht zum künftigen Demobetrieb. Eingeladene Fachpersonen können unabhängig vom Fristenrechner bereits berechtigte Gäste im steimer.ch-Tenant sein. Die Q-Architektur muss deshalb nicht einen global berechtigungsfreien Gast, sondern das durch die Q-Aufnahme erzeugte Berechtigungsdelta kontrollieren.

AP15 legt die E/Q/P-Landschaft verbindlich fest und entwickelt für Q einen möglichst einfachen M365-Einladungs- und Widerrufsablauf. Der Start von AP15 erteilt noch keine Gast-, Q- oder Produktionsfreigabe. Ein Go setzt die separate Abnahme der ausgeführten AP15-Matrix voraus.

## 2. Verbindliche Leitentscheide

1. E und Q verwenden weiterhin das gemeinsame SPFx-Paket in SharePoint und Teams.
2. P soll eine anonyme, statische Webausprägung desselben hostneutralen Rechenkerns verwenden.
3. Für P kommt ausschliesslich die bestehende steimer.ch-Hosting-Infrastruktur infrage.
4. AP15 baut keine Azure-, GitHub-Pages-, Power-Pages- oder andere zusätzliche Hosting-Infrastruktur auf.
5. Ist das bestehende Hosting für den öffentlichen Rechner nicht geeignet, wird P zurückgestellt. Hostingalternativen benötigen einen späteren neuen Entscheid.
6. Dritt-Tenants erhalten weiterhin das veröffentlichte SPFx-Paket und wahlweise den öffentlichen gepinnten Datenrelease oder einen byteidentischen SharePoint-Mirror.
7. Der fachlich freigegebene Umfang bleibt Bund und Kanton Bern. Weitere Kantone sind nicht Gegenstand von AP15.
8. Eine Release- oder Betriebsfreigabe ist nicht Bestandteil des Starts von AP15. Sie wird nach dokumentierter Abnahme separat entschieden.

## 3. Zielsysteme

| Umgebung | Zweck | Host | Zugriff | Zulässiger Stand |
| --- | --- | --- | --- | --- |
| E – Entwicklung | Entwicklung, Integration und technische Vorprüfung | bestehende SharePoint-Testsite und Team `Entwicklungsumgebung` | nur ausdrücklich berechtigte Projektpersonen | Kandidaten und noch nicht freigegebene Stände |
| Q – Qualitätssicherung und Demo | Abnahme und Demonstration für Justiz und Justizinformatik | dedizierte SharePoint-Site und bei Bedarf dediziertes privates Team | eingeladene authentifizierte B2B-Gäste | unveränderlicher Releasekandidat oder freigegebener Demonstrationsstand |
| P – öffentliche Produktion | frei zugänglicher Berner Fristenrechner | bestehende steimer.ch-Hosting-Infrastruktur | anonym ohne M365-Einladung | ausschliesslich vollständig freigegebener Release |
| Dritt-Tenant | produktive Installation bei einer anderen Organisation | SharePoint Online und Teams des Zieltenants | Berechtigungsmodell des Zieltenants | veröffentlichtes SPFx- und Datenrelease |

Dritt-Tenants sind keine vierte steimer.ch-Umgebung. Sie betreiben ein freigegebenes Paket eigenverantwortlich in ihrer eigenen M365-Landschaft.

## 4. Bereits nachgewiesene Hosting-Baseline

Das Projekt Steimer.ch hat die wesentlichen Hostingfragen bereits beantwortet. Der aktuelle Webauftritt wird aus einer React-basierten Quelle als statisches Paket erzeugt und auf dem bestehenden Green-Webhosting betrieben. Der öffentlich erreichbare Stand liefert statisches HTML und CSS über HTTPS aus. Er verwendet keine Datenbank, kein Formular und keine Analysebibliothek. Sicherheitsheader für Inhaltstyp, Referrer, Einbettung und Browserberechtigungen werden ausgeliefert.

Der bestehende Produktionsablauf ist dokumentiert und reversibel:

1. statisches Paket lokal bauen und prüfen
2. Paket in einen separaten Stagingordner hochladen
3. bisherige Produktionsfassung durch Umbenennen erhalten
4. Stagingordner als aktive Fassung übernehmen
5. öffentliche Endpunkte kontrollieren
6. bei Bedarf durch Rückbenennen auf die Vorversion zurückfallen

Damit ist die grundsätzliche Eignung des vorhandenen Hostings für eine rein statische Fristenrechner-Ausprägung plausibel belegt. AP15 bewertet keine alternative Infrastruktur. Es klärt nur noch die produktspezifischen Punkte:

- Betrieb unter einem Unterpfad wie `/fristenrechner/` oder einer vom bestehenden Vertrag unterstützten Subdomain
- korrekte Basis- und Assetpfade des statischen Builds
- gestalterische Einbettung in den bestehenden STEIMER-Webauftritt ohne zweite Produktcodebasis
- HTTPS und Canonical URL für die gewählte Adresse
- Content Security Policy und weitere benötigte Sicherheitsheader
- atomare Bereitstellung und Rückfall ohne Beeinträchtigung des übrigen Webauftritts
- Ausschluss von QA-Parametern und Entwicklungsartefakten im öffentlichen Build

Die projektbezogene `chatgpt.site`-Fassung ist eine zugriffsgeschützte Vorschau. Sie dient nicht als öffentliche Produktionsinfrastruktur. Massgebend für P ist ausschliesslich das bestehende steimer.ch-Webhosting.

### 4.1 Gestaltungs- und Integrationsbaseline

Der veröffentlichte Steimer.ch-Auftritt legt auch die öffentliche Gestaltungslinie fest. Eine spätere P-Ausprägung des Fristenrechners soll als Bestandteil dieses Auftritts erkennbar sein und nicht als unabhängige Zweitmarke erscheinen. Zu übernehmen sind insbesondere:

- STEIMER-Kopf- und Fussbereich in einer für die Anwendung geeigneten kompakten Form
- Aptos beziehungsweise die bestehende serifenlose Ersatzkette
- Fjord Navy, Lake Teal, Glacier, Granite und Snow als gemeinsame Grundpalette
- reduzierte Flächen, klare Typografie und zurückhaltende geometrische Gestaltung
- einheitliches Impressum, Canonical URL, Open-Graph-Metadaten, `robots.txt` und `sitemap.xml`
- die sichtbare Abgrenzung des privaten STEIMER-Auftritts von kantonalen Behörden

Der Fristenrechner verwendet diese Grundpalette bereits. Sein dunkleres Kupfer `#a6532d` bleibt für funktionale Texte und Bedienelemente bestehen, soweit die hellere Webauftrittsvariante den geforderten Kontrast nicht erreicht. Diese kleine Abweichung ist eine bewusste barrierefreiheitsbedingte Produktvariante und kein zweites Designsystem.

Technisch wird zunächst ein eigenständiger statischer Fristenrechner-Build unter einem abgegrenzten Pfad bevorzugt. Dadurch bleiben die React- und Toolchainstände des bestehenden Webauftritts und des SPFx-kompatiblen Rechners entkoppelt. Die sichtbare Webhülle darf gemeinsam gestaltet sein, Rechenkern und Produktoberfläche bleiben jedoch weiterhin aus dem Fristenrechner-Repository abgeleitet. Eine Migration des SPFx-Produkts auf den Toolchainstand des Webauftritts ist kein Bestandteil von AP15.

## 5. Q-Berechtigungsmodell

### 5.1 Ziel

Eine Person soll über den üblichen M365-Einladungsmechanismus in Q aufgenommen und mit einem einzigen nachvollziehbaren Widerruf wieder entfernt werden können. Einzelrechte pro Person werden vermieden.

### 5.2 Bevorzugter Zugriffsprinzipal

AP15 prüft bevorzugt einen zentralen M365-Zugriffsprinzipal mit dem Arbeitsnamen `Fristenrechner-Q-Zugriff`. Soweit technisch zuverlässig, wird dafür die Microsoft-365-Gruppe des privaten Q-Teams verwendet. Sie soll folgende Rechte bündeln:

- Lesen auf der Q-SharePoint-Site
- Lesen auf dem Q-SharePoint-Mirror
- Lesen ausschliesslich auf dem Paketordner unter `ClientSideAssets`
- Zugriff auf das Q-Team und dessen Standardkanal
- keine Rolle auf E-Sites, E-Teams oder übrigen App-Katalog-Inhalten

Auf der mit dem Q-Team verbundenen SharePoint-Site erhalten Teammitglieder systembedingt weitergehende Rechte. Der Laufzeitmirror muss dort deshalb weiterhin eine eigene Berechtigungsgrenze besitzen und für Mitglieder nur lesbar sein.

### 5.3 Technischer Prüfpunkt

Der entscheidende Spike prüft, ob die Mitgliedschaft eines B2B-Gasts im gewählten zentralen Prinzipal auch beim Zugriff auf den paketbezogenen `ClientSideAssets`-Ordner zuverlässig ausgewertet wird. Ist dies der Fall, genügen Gruppenaufnahme und Gruppenentzug. Ist dies nicht der Fall, endet dieser Teil mit Stop. Eine per Gast einzeln erteilte oder automatisierte Paketordnerberechtigung wird nicht ohne neuen Entscheid zum Betriebsstandard erklärt.

## 6. Berechtigungsbaseline und Delta

Vor der Q-Aufnahme wird für die bezeichnete Testidentität eine bereinigte Baseline erstellt. Sie enthält nur die zur Beurteilung nötigen Mitgliedschaften und Zugriffswege. Personenbezogene, Tenant- und Ressourcen-IDs bleiben in lokaler oder tenantinterner Evidenz.

Nach der Aufnahme werden Baseline und Ist-Stand verglichen. AP15 ist bestanden, wenn:

- sämtliche für Q nötigen Rechte neu vorhanden sind
- der Q-Zugriffsprinzipal keine Berechtigung auf E oder andere nicht bezeichnete Ressourcen vermittelt
- allfällige vorbestehende Rechte der Person einem von Q unabhängigen Zugriffsweg zugeordnet sind
- keine direkte Einzelberechtigung der Person ausserhalb des freigegebenen Modells nötig ist
- der Entzug der Gruppenmitgliedschaft sämtliche Q-Rechte entfernt
- vorbestehende, nicht durch Q vermittelte Rechte unverändert bleiben

Das blosse Sichtbarbleiben eines bereits vorher berechtigten Teams ist kein Fehler von AP15. Ein Fehler liegt vor, wenn die Q-Aufnahme diesen Zugriff neu erzeugt oder erweitert.

## 7. Prüfmatrix

| ID | Prüfung | Abnahmekriterium |
| --- | --- | --- |
| Q01 | Referenzidentität | Paket, Datenrelease, Manifest und Prüfsummen entsprechen dem bezeichneten Stand |
| Q02 | Berechtigungsbaseline | vorbestehende relevante Mitgliedschaften und ihre Zugriffswege sind bereinigt dokumentiert |
| Q03 | zentrale Q-Aufnahme | der bestehende oder neu eingeladene B2B-Gast wird über einen zentralen Prinzipal aufgenommen |
| Q04 | SharePoint-Q | Q-Seite und WebPart laden wiederholt im Gastprofil |
| Q05 | Paket-Assets | das SPFx-Bundle lädt allein über das Gruppenrecht auf dem konkreten Paketordner |
| Q06 | read-only Mirror | Manifest und Artefakte sind lesbar, aber nicht veränderbar |
| Q07 | Teams-Q | Registerkarte, Hostmeldung, Provider und Referenzresultat stimmen mit SharePoint überein |
| Q08 | Berechtigungsdelta | die Q-Aufnahme vermittelt ausschliesslich die bezeichneten Q-Rechte |
| Q09 | E-Trennung | der Q-Prinzipal besitzt keinen Zugriffsweg auf E, unabhängig von allfälligen persönlichen Vorrechten |
| Q10 | Widerruf | Entfernen aus dem Q-Prinzipal entzieht Site-, Team-, Mirror- und Paketordnerzugriff |
| Q11 | Bestandsschutz | vorbestehende, nicht durch Q vermittelte Berechtigungen und interne Referenzumgebungen bleiben unverändert |
| Q12 | Betrieb und Nachvollziehbarkeit | Einladungs-, Aufnahme-, Update- und Widerrufsablauf sind kurz dokumentiert und reproduzierbar |

Die in AP14 bereits bestandenen Fach-, Sprach-, Kalenderexport- und Sperrfallprüfungen werden nur stichprobenweise wiederholt, sofern Paket und Datenstand unverändert bleiben. Bei einem anderen Release ist die vollständige produktbezogene Matrix erforderlich.

Die Hosting- und Gestaltungsbaseline für eine spätere P-Ausprägung wird ausserhalb der Q01-bis-Q12-Freigabematrix dokumentiert. Sie löst in AP15 keinen öffentlichen Build und keine P-Freigabe aus.

## 8. Vorgehen und Aufwandobergrenze

| Schritt | Inhalt | Aufwandobergrenze |
| --- | --- | ---: |
| 1 | AP14-Nachtrag, E/Q/P-Baseline und Hostingbefund dokumentieren | 0,75 AT |
| 2 | zentralen Zugriffsprinzipal und Berechtigungsdelta read-only erheben und konfigurieren | 1,00 AT |
| 3 | Q03 bis Q09 mit dem bezeichneten B2B-Gast durchführen | 1,00 AT |
| 4 | Widerruf, Regression, bereinigte Evidenz und Betriebsanweisung erstellen | 0,75 AT |
| 5 | Ergebnis, Restpunkte und allfälligen Entscheid DEC-2026-016 vorbereiten | 0,50 AT |
| **Gesamt** |  | **4,00 AT** |

Es gilt ein WIP-Limit von einem wesentlichen Arbeitspaket. Externe Wartezeiten für Einladungsannahme, Rechtepropagation oder Hostingfreigaben zählen nicht als Nettoarbeitszeit.

Das Vorgehen folgt HERMES 2022 agil mit Auftrag, Zeitbox, schrittweiser Umsetzung, dokumentierten Prüfergebnissen und einem ausdrücklichen Entscheid am Ende. Projektleitung, Informationssicherheit, technischer Test und Freigabe bleiben in der aktuellen Einpersonenphase bei David Steimer. Die Rollen werden trotzdem getrennt ausgewiesen, damit ein späteres Vieraugenprinzip ohne Umbau der Nachweisstruktur möglich ist.

Für das konkrete M365-Gruppen- und SPFx-Berechtigungsmodell besteht kein unmittelbar anwendbarer eCH-Implementierungsstandard. Die Abweichung ist damit sachlich bedingt. Für die spätere öffentliche Oberfläche bleiben eCH-0059 und WCAG 2.1 AA als Qualitätsrahmen bestehen.

## 9. Entscheidregeln

### Go für einen begrenzten Q-Demobetrieb

Ein Go kann vorbereitet werden, wenn Q01 bis Q12 bestanden sind, der Mirror read-only bleibt, der Paketordner gruppenbasiert erreichbar ist und der vollständige Widerruf nachgewiesen wurde. Die Freigabe gilt nur für die bezeichnete Q-Konfiguration und den geprüften Release.

### Stop

AP15 endet ohne Q-Freigabe, wenn insbesondere:

- der zentrale Prinzipal unerwartete Rechte ausserhalb von Q vermittelt
- der Paketordner weiterhin direkte Einzelrechte pro Gast verlangt und kein neuer Betriebsentscheid vorliegt
- der Mirror für Gäste oder Teammitglieder veränderbar ist
- der Widerruf nicht sämtliche Q-Rechte entfernt
- E durch Q neu erreichbar wird
- für die App zusätzliche Graph-, API- oder tenantweite Rechte nötig werden

### Öffentliche Produktion

AP15 erteilt keine P-Freigabe. Er dokumentiert lediglich, ob eine spätere statische Veröffentlichung auf dem bestehenden steimer.ch-Hosting technisch tragfähig erscheint. Ist ein sicherer Betrieb unter Pfad oder unterstützter Subdomain nicht möglich, wird P ohne Bewertung anderer Hostingangebote zurückgestellt.

## 10. Lieferobjekte

- abgeschlossener AP14-Nachtrag ohne rückwirkende Ergebnisänderung
- dokumentiertes E/Q/P-Zielbild
- bereinigte Hosting-Baseline aus dem Steimer.ch-Projekt
- Gestaltungs- und Integrationsbaseline aus dem bestehenden STEIMER-Webauftritt
- Q-Berechtigungs- und Delta-Matrix
- ausgefülltes Prüfprotokoll Q01 bis Q12
- kurze Betriebsanweisung für Einladung, Aufnahme und Widerruf
- aktualisierte Dritt-Tenant-Abgrenzung
- bei vollständiger Abnahme Entscheidvorlage DEC-2026-016

## 11. Nichtziele

- öffentlicher Produktionsrelease
- Aufbau oder Beschaffung zusätzlicher Hosting-Infrastruktur
- Alternativevaluation bei ungeeignetem steimer.ch-Hosting
- neue Fachlogik oder neue Kantone
- Änderung des Datenmodells
- tenantweite Verschärfung von Entra-, SharePoint- oder Teams-Richtlinien
- automatische Mirrorreplikation in Dritt-Tenants

## 12. Aktueller Ausführungsstand

| Schritt | Status | Befund |
| --- | --- | --- |
| Steimer.ch-Projekt auswerten | abgeschlossen | statischer Green-Produktionspfad, HTTPS, Sicherheitsheader und reversibler Ordnerwechsel sind belegt |
| AP14 mit Nachtrag abschliessen | abgeschlossen | technischer Nachweis bleibt bestehen, keine Betriebsfreigabe, keine rückwirkende Umwertung von G13 und G17 |
| AP15-Plan und Matrix erstellen | abgeschlossen | gruppenbasiertes Q-Modell, Hostinggrenze und Entscheidregeln sind festgelegt |
| aktuelle Tenant- und Gruppenbaseline erheben | abgeschlossen | E- und Q-Ressourcen, Kanäle sowie Mitglieder- und Rechtebaseline wurden unmittelbar vor Q03 rückgelesen |
| Q-Zugriffsprinzipal konfigurieren | abgeschlossen | Q-Microsoft-365-Gruppe vermittelt Site-, Team-, Mirror- und paketbezogene Leserechte ohne direkte Einzelrechte des Gasts |
| Q03 bis Q08 durchführen | abgeschlossen | SharePoint, Paket-Assets, read-only Mirror, Teams-VDI und Berechtigungsdelta sind bestanden |
| Q09 bis Q12 durchführen | abgeschlossen | E-Trennung, vollständiger Gruppenwiderruf, Bestandsschutz, Wiederaufnahme und Betriebsanweisung sind bestanden |
| AP15 abschliessen und DEC-2026-016 entscheiden | abgeschlossen | 12 von 12 Prüfungen bestanden, begrenzter Q-Demobetrieb freigegeben, P nicht freigegeben |

## 13. AP15-Ergebnis

Q01 bis Q12 sind bestanden. Der zentrale Q-Prinzipal vermittelte ausschliesslich die bezeichneten Q-Rechte. Das Entfernen der Gastperson aus dem privaten Q-Team entzog Q-Site, Q-Teamsite, Mirror und Paketdatei gemeinsam. Die erneute Aufnahme stellte den Gastbetrieb ohne direkte Einzelrechte wieder her.

Das bereinigte Ergebnis steht im [AP15-Testprotokoll](e-q-p-testprotokoll-ap15.md). Aufnahme, Update, Widerruf und Wiederaufnahme sind in der [Betriebsanweisung](q-demobetrieb-ap15-betriebsanweisung.md) beschrieben. David Steimer hat [DEC-2026-016](../entscheidungen/DEC-2026-016-gruppenbasierter-q-demobetrieb.md) am 1. September 2026 beschlossen und den begrenzten Q-Demobetrieb für vollständig freigegebene Releases freigegeben.

Zum Abschluss von AP15 blieb die öffentliche P-Ausprägung ausdrücklich nicht freigegeben. Die spätere öffentliche Produktion war auf die bestehende steimer.ch-Hosting-Infrastruktur beschränkt und benötigte einen eigenen Entscheid. Diese Folgearbeit wurde mit AP16, DEC-2026-017 und der P-Betriebsfreigabe [DEC-2026-018](../entscheidungen/DEC-2026-018-freigabe-oeffentlicher-p-betrieb.md) abgeschlossen.

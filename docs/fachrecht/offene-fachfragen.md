# Offene Fachfragen und Sicherheitsgrenzen

| Merkmal | Wert |
| --- | --- |
| Stand | 22. September 2026, vier AP18-Kalenderfälle bereinigt und NE-Vorbehalt präzisiert |
| Zweck | Unsicherheit sichtbar halten und stille Fehlannahmen verhindern |
| Verantwortlich | David Steimer |

Nicht jede offene Frage blockiert AP5. Sie blockiert aber jede Automatik, die ohne geklärte Voraussetzung ein scheinbar sicheres Resultat ausgeben würde.

## 1. Fachfragen

| ID | Frage oder Risiko | Betroffene Profile | Vorläufige Behandlung im MVP | Auslöser für Klärung | Priorität |
| --- | --- | --- | --- | --- | --- |
| `OF-001` | Wann tritt das Bundesgesetz über die Zustellung von Sendungen an Wochenenden und Feiertagen gemäss BBl 2025 2891 in Kraft? | BGG, VwVG | neue Zustellungsfiktion nicht anwenden. Aktuell geltenden Erlasstext verwenden | amtliche Publikation des Inkrafttretens oder neue konsolidierte Fassung | hoch |
| `OF-002` | Gibt der Nutzer das physische Empfangsdatum oder das rechtlich massgebende Zustellungsdatum ein? | alle | Feld klar als rechtlich massgebendes Zustellungsdatum beschriften. Bei Unsicherheit Warnung und keine Aussage zur Rechtzeitigkeit der Zustellung | UI- und Datenmodellentscheid in AP5 | hoch |
| `OF-003` | Welcher Kanton ist bei Partei und Vertretung mit unterschiedlichen Wohn- oder Sitzkantonen massgebend? | StPO, BGG, VwVG | automatisch vorgeschlagenen Kanton sichtbar zeigen und bestätigbar machen. Bei widersprüchlichen Anknüpfungen keine stille Prioritätsregel | Erweiterung über den reinen Bern-Pilot oder erster Konfliktfall | mittel |
| `OF-004` | Welche Spezialgesetze enthalten zusätzliche Stillstands- oder Fristregeln? | besonders VwVG und VRPG Bern | AP11A inventarisiert die bekannten und praktisch relevanten VRPG-BE-Regime. Nicht inventarisierte Sachmaterien bleiben gesperrt oder benötigen eine ausdrückliche Bestätigung | Aufnahme einer neuen Sachmaterie oder eines neuen Rechtswegs | hoch |
| `OF-005` | Sollen Stunden-, Wochen-, Monats- und Jahresfristen unterstützt werden? | alle | ausserhalb des MVP. Eingabe akzeptiert nur eine positive ganze Zahl von Tagen | Produktentscheid für einen späteren Release | niedrig |
| `OF-006` | Wie wird die Verfahrensart für die Stillstandsausnahmen zuverlässig bestimmt? | ZPO, BGG, VwVG | explizite Auswahl mit sichtbarer Herleitung und Übersteuerung. Keine Ableitung allein aus einem freien Text | UI- und Datenmodellentscheid in AP5 | hoch |
| `OF-007` | Soll der Rechner Fristwiederherstellung oder bewilligte Erstreckungen berechnen? | alle | nicht berechnen. Nur auf die Möglichkeit und die notwendige Einzelfallprüfung hinweisen | separate fachliche und produktbezogene Erweiterung | niedrig |
| `OF-008` | Wie werden weitere Kantone und bundes- oder kantonalrechtlich begründete örtliche Unterschiede fachlich freigegeben? | künftige Profile | nicht aus allgemeinen Ferienkalendern ableiten. Pro Kanton amtliche Rechtsgrundlage, Rechtsprechungsprüfung und Golden Cases verlangen. Eigenständige kommunale Feiertagsregelungen bleiben gemäss bestätigter Umfangsabgrenzung ausgeschlossen | Beginn eines weiteren Kantons | mittel |
| `OF-009` | Wie wird eine fallbezogene Wahl- oder Abstimmungsanordnung technisch erfasst und als autoritativ bestätigt? | PRG, BPR, VPR | AP11B hat `R5_FIXED` entfernt und berechnete von behördlich gesetzten Komponenten getrennt. Das Hintergrundregime bleibt `open`. Datum, Uhrzeit und Quellenbeleg dürfen nicht automatisch geschätzt werden. Rein autoritative Termine sind vertraglich im Rechen-GUI verborgen | spätere Erfassungs- und Bestätigungsfunktion mit Quellenbeleg fachlich festlegen | hoch |
| `OF-010` | Wird der leere Verweis auf Art. 69 PRG in Art. 66 PRV amtlich bereinigt? | PRG und PRV Bern | Referenz dokumentieren, Berechnung sperren und Rechtsänderung überwachen | Änderung der konsolidierten PRV- oder PRG-Fassung | mittel |
| `OF-011` | Sollen Stundenfristen unterstützt werden? | insbesondere Art. 8d VPR | ausserhalb des MVP. Betroffenes Regime bleibt `blocked` | separater Produkt- und Datenmodellentscheid | niedrig |
| `OF-012` | Welche zusätzlichen Fachrechtsangaben sind für ATSG und VwVG nötig, bevor das passende Bundesverfahren sicher gewählt werden kann? | ATSG und VwVG | [AP17B](vrpg-anwendbarkeit-ap17b.md) konkretisiert zwölf begrenzte IVG-/AHVG-/UVG-Zuordnungen, fachlich abgenommen am 12. September 2026. Im lokalen [AP17C-Kandidaten](../architektur/vrpg-integration-ap17c.md) integriert und technisch geprüft. David Steimer hat AP17C am 12. September 2026 fachlich abgenommen. Keine Produktivaktivierung und keine generische Freigabe aller Rechtswege oder gerichtlichen Fristen. Die übergeordnete Fachfrage und übrige Kandidaten bleiben `open` | Kontrollierte Releasefreigabe des fachlich abgenommenen AP17C-Kandidaten vorbereiten, weitere Sachbereiche und Rechtswege separat klären | mittel |

### Konkretisierung OF-008 für AP18B-02 vom 13. September 2026

David Steimer bestätigt die [begrenzte GR-Modellannahme](quellenpaket-ap18b-02-ti-gr-abgrenzung.md#2-bestätigte-modellgrenze-für-graubünden): Im bezeichneten VRG-Kontext vor kantonalen Behörden werden lokale Ruhetage nicht berücksichtigt. Die eingereichte Rechtsabklärung belegt jedoch keinen allgemeinen Ausschluss lokaler Ruhetage allein aufgrund der kantonalen Behördenzuständigkeit. Die örtliche Anknüpfung und eine mögliche Bedeutung rechtsgültig bezeichneter lokaler Tage bleiben für die spätere automatische Fristfreigabe offen. Der Beschluss ermöglicht die begrenzte Erhebung, schliesst `OF-008` aber nicht und wird nicht auf andere Prozessordnungen übertragen.

### Konkretisierung OF-008 für AP18B-03 vom 13. September 2026

Der [Modellcheck VS/FR/SO/GE](../architektur/modellcheck-ap18b-03.md) trennt normativen Tagesumfang und prozessuale Wirkung. Die damals offene SO-Halbtagsfrage ist mit der [Fachabnahme vom 13. September 2026](abnahme-ap18b-03.md) durch David Steimer entschieden: Der Solothurner 1. Mai ab 12.00 Uhr hat keinen Einfluss auf den Fristenlauf. Die Darstellung als Halbtag bleibt erhalten. Daraus wird weder eine Fristverschiebung noch ein Fristenstillstand erzeugt. Zusätzliche prozessuale Gleichstellungen aus dem alten BJ-Verzeichnis benötigen weiterhin aktuelle, kontextbezogene Bestätigung.

Für VS und FR bleibt die konkrete Zuordnung der jeweils eigenen Prozesslisten zu den unterstützten Rechtsprofilen zu prüfen. Die Genfer Sonntagsfolgetagsregel wird nicht pauschal aktiviert. Der dokumentierte BGer-Entscheid 7B_32/2023 bestätigt im beurteilten StPO-Fall den Fristablauf am 02.01.2023. Der Modellcheck schliesst `OF-008` nicht und erweitert den Produktumfang nicht um Stundenfristen oder Personalkalender.

**Abnahme:** Die gesamte [V0.9](../architektur/erfassung-ap18b-03.md) ist in der vorliegenden Form fachlich abgenommen. Genau zwei Solothurner Profilzeilen kennzeichnen den 1. Mai ausdrücklich als Halbtag. Die Datei und ihre damaligen `open`-/`blockedEffect`-Werte bleiben unverändert als Prüfgegenstand erhalten. Die separate Abnahmenotiz dokumentiert den aktuellen Fachstatus. Die übrigen Anwendungsfragen und `OF-008` insgesamt bleiben offen. Eigenständige kommunale Normen werden nicht erhoben, kantonal bestimmte Gebietsabgrenzungen hingegen konkret dokumentiert.

### Konkretisierung OF-008 für AP18B-04 vom 13. September 2026

Die [Erfassung der restlichen 18 Kantone](../architektur/erfassung-ap18b-04.md) ergänzt fünf klar abgegrenzte offene Fälle. AR/AI-Stephanstag, Glarner Fahrtsfest und bedingte Neuenburger Sonntagsfolgetage passen nicht als unbedingte Regeln in Vertrag 0.5.0. Bei AI ist zusätzlich der Widerspruch zwischen bedingter Norm und amtlicher Liste für den 26.12.2026 offen. Zusätzliche Neuenburger Ausgleichsschliessungen benötigen die konkreten Jahresbeschlüsse. Die IDs, Quellen und Nichtgenerierung sind in den neuen Verfahrens- und Prüfnotizen sichtbar.

Die neue LPA-NE Art. 33 Abs. 3 gilt seit 01.01.2026 und knüpft ausdrücklich an mindestens halbtägige Verwaltungsschliessung an. Der Solothurner Halbtagentscheid wird nicht auf diese andere Norm übertragen. Eigenständige kommunale Festlegungen bleiben ausserhalb der Erhebung. Kantonal unmittelbar festgelegte Regionen wie innerer Landesteil AI und Le Landeron werden konkret erfasst. Die Erhebung aller Kantone schliesst weder diese Fragen noch die bisherigen Verfahrenszuordnungen oder `OF-008` insgesamt.

### Nachtrag OF-008 vom 22. September 2026

[AP18B-05](../architektur/erfassung-ap18b-05.md) setzt die ausdrücklichen Fachvorgaben um. AR/AI-Stephanstag, GL-Fahrtsfest und bedingte allgemeine NE-Ersatzfeiertage sind als Regeln modelliert. Der AI-Quellenkonflikt ist für das Projekt zugunsten des Gesetzes entschieden, nicht amtlich berichtigt.

Der bisherige NE-Ausgleichsfall bleibt als Erfassungs- und Anwendungsvorbehalt erhalten. Er umfasst zusätzlich angeordnete regionale Tage nach LDJF Art. 3 Abs. 2 und zusätzliche Verwaltungsschliesstage nach RDF Art. 11 Abs. 2 / LPA Art. 33 Abs. 3. Letztere sind nicht bloss örtlich. Acht feste NE-LPA-Ergänzungen und Le Landeron bleiben erfasst. Vier Datumsfragen sind somit bereinigt, ohne `OF-008` insgesamt oder die übrigen Verfahrenszuordnungen zu schliessen.

## 2. Verbindliche Sicherheitsgrenzen für AP5

AP5 darf folgende Annahmen nicht als versteckte Standards implementieren:

- physischer Empfang entspricht immer der rechtlichen Zustellung
- Feiertage richten sich immer nach dem Gerichtsort
- Feiertage richten sich immer nach dem Wohnsitz der Partei
- alle Verfahren kennen Gerichtsferien
- alle Verfahren kennen dieselben Gerichtsferien
- jedes Verfahren unter ZPO, BGG oder VwVG unterliegt dem Fristenstillstand
- ein unbekannter Spezialfall kann mit dem allgemeinen Profil berechnet werden
- ein politisch beschlossener Erlass ist bereits geltendes Recht

Wenn eine für die Berechnung nötige Angabe fehlt, muss die App entweder nachfragen oder das Ergebnis deutlich als nicht abschliessend kennzeichnen. Ein «best guess» ist bei Fristen hübsch anzusehen und fachlich wertlos.

## 3. Entscheidbedarf

AP4 erzeugt keinen neuen Grundsatzentscheid. Die Rechtsmatrix kodiert keine ungelöste Auslegungsfrage als sichere Regel. Ein neuer DEC ist erforderlich, sobald AP5 eine der folgenden Varianten festlegen soll:

- automatische Ermittlung des rechtlich massgebenden Zustellungsdatums
- feste Priorität zwischen unterschiedlichen kantonalen Anknüpfungen
- automatische Klassifikation einer Verfahrens- oder Sachart
- umfassende statt ausdrücklich begrenzte Spezialgesetzinventur

Bis dahin bleiben diese Punkte als sichtbare Voraussetzungen oder Warnungen im Produktmodell.

## 4. Prüfzyklus

Die offenen Punkte werden geprüft:

1. vor jedem Datenrelease
2. jährlich spätestens am 15. November
3. bei einer amtlich angekündigten Gesetzesänderung
4. bei einem neuen Rechtsprofil oder Gemeinwesen
5. nach einem fachlich relevanten Fehlerbericht oder Gerichtsentscheid

Die Prüfung wird mit Datum, Quelle, Ergebnis und verantwortlicher Person dokumentiert. Eine blosse Änderung des Abrufdatums ohne inhaltliche Kontrolle genügt nicht.

AP13 setzt diesen Zyklus mit dem [periodischen Quellenprüfprozess](../betrieb/periodische-quellenpruefung-ap13.md), einem [append-only-Prüfprotokoll](../../data/source-reviews/README.md) und einer [generischen Release-Checkliste](../betrieb/release-checkliste.md) um. Der nächste ordentliche Jahrestermin ist spätestens der 15. November 2027. `OF-001` wird unabhängig davon bei jedem früheren Release oder amtlichen Änderungshinweis erneut geprüft.

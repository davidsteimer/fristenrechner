# Offene Fachfragen und Sicherheitsgrenzen

| Merkmal | Wert |
| --- | --- |
| Stand | 30. August 2026 |
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
| `OF-008` | Wie werden weitere Kantone und kommunale Besonderheiten fachlich freigegeben? | künftige Profile | nicht aus allgemeinen Ferienkalendern ableiten. Pro Kanton amtliche Rechtsgrundlage, Rechtsprechungsprüfung und Golden Cases verlangen | Beginn eines weiteren Kantons | mittel |
| `OF-009` | Wie wird eine fallbezogene Wahl- oder Abstimmungsanordnung technisch erfasst und als autoritativ bestätigt? | PRG, BPR, VPR | AP11B hat `R5_FIXED` entfernt und berechnete von behördlich gesetzten Komponenten getrennt. Das Hintergrundregime bleibt `open`. Datum, Uhrzeit und Quellenbeleg dürfen nicht automatisch geschätzt werden. Rein autoritative Termine sind vertraglich im Rechen-GUI verborgen | spätere Erfassungs- und Bestätigungsfunktion mit Quellenbeleg fachlich festlegen | hoch |
| `OF-010` | Wird der leere Verweis auf Art. 69 PRG in Art. 66 PRV amtlich bereinigt? | PRG und PRV Bern | Referenz dokumentieren, Berechnung sperren und Rechtsänderung überwachen | Änderung der konsolidierten PRV- oder PRG-Fassung | mittel |
| `OF-011` | Sollen Stundenfristen unterstützt werden? | insbesondere Art. 8d VPR | ausserhalb des MVP. Betroffenes Regime bleibt `blocked` | separater Produkt- und Datenmodellentscheid | niedrig |
| `OF-012` | Welche zusätzlichen Fachrechtsangaben sind für ATSG und VwVG nötig, bevor das passende Bundesverfahren sicher gewählt werden kann? | ATSG und VwVG | Kandidatenregime bleiben `open`. Kein automatischer Wechsel allein aufgrund des VRPG-Profils | Aufnahme dieser Weiterzüge in den produktiven Umfang | mittel |

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

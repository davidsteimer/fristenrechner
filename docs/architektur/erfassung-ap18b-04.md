# AP18B-04: Erfassung der verbleibenden 18 Kantone

**Nachtrag vom 22. September 2026:** [AP18B-05](erfassung-ap18b-05.md) setzt vier der nachfolgend historisch offenen Datumsfälle gemäss Fachvorgabe um. Der fünfte Fall bleibt als präzisierter NE-Vorbehalt erhalten. Aktuelle Arbeitsmappe ist V0.12, Vertrag 0.6.0 als technischer Kandidat. Die nachfolgende Beschreibung hält den damaligen Stand V0.10/V0.11 fest.

Stand: 13. September 2026. David Steimer hat das Vorgehen für die verbleibenden Kantone bestätigt und die Erfassung ausdrücklich beauftragt. Fachverantwortung und spätere Abnahme liegen bei ihm. Codex ist Recherche-, Erfassungs- und Prüfinstrument ohne Freigabekompetenz.

**Ergebnis:** Die erste Erfassung aller verbleibenden Kantone ist als Gesamtmappe V0.10 technisch geprüft. David Steimer hat sie anschliessend fachlich ohne Beanstandung durchgesehen und die [Ergänzung der fehlenden Sprachbezeichnungen](../fachrecht/sprachergänzung-ap18b-04.md) beauftragt. V0.11 vervollständigt ausschliesslich die Sprache. Fünf klar bezeichnete Kalenderfragen bleiben offen. Es liegt keine Produktfreigabe vor.

## Auftrag und feste Grenzen

Die am selben Tag abgenommene V0.9 bleibt als unveränderliche Referenz erhalten. Die Gesamtdatei ist durch SHA-256 `a245080126586f1104b459ff5e225808e2d78578d24a2ce619d7d31d2d27ed12` gebunden. Die [Abnahmenotiz](../fachrecht/abnahme-ap18b-03.md) gilt auch für die fachliche Festlegung, dass der Solothurner Halbtag am 1. Mai keinen Einfluss auf den Fristenlauf hat.

Arbeitsmappenvertrag 0.5.0 bleibt unverändert. Erfasst werden Bundes- und kantonales Recht sowie örtliche Differenzierungen, soweit sie aus diesen Grundlagen folgen. Eigenständige kommunale Feiertagsnormen bleiben ausgeschlossen. Die bestätigte GR-Abgrenzung bleibt bestehen. Weder die Kalender-App noch eine Karte oder weitere VRPG-Verbindungen werden hier umgesetzt.

## Arbeitsfolge

Ein wesentlicher Arbeitsgegenstand ist die Restkantonserfassung. Die folgenden Gruppen sind interne Rechercheabschnitte desselben Pakets, keine zusätzlichen parallelen Realisierungsaufträge.

| Gruppe | Kantone | Nachweis |
| --- | --- | --- |
| Zürich und Ostschweiz | ZH, SH, TG, SG, AR, AI | [Quellenpaket Ost](../fachrecht/quellenpaket-ap18b-04-ost.md) |
| Zentralschweiz und Glarus | LU, UR, SZ, OW, NW, ZG, GL | [Quellenpaket Zentral](../fachrecht/quellenpaket-ap18b-04-zentral.md) |
| Nordwestschweiz und Romandie | BS, BL, VD, NE, JU | [Quellenpaket West](../fachrecht/quellenpaket-ap18b-04-west.md) |

1. Amtliche Normtexte aktuell prüfen und normative Feiertagslisten erfassen. Allgemeines Ruhetagsrecht, Arbeitsrecht und prozessuale Gleichstellungen bleiben erkennbar getrennt.
2. Räumliche Geltungsbereiche und gegebenenfalls ausdrücklich benannte Mitglieder belegen. Keine amtlichen Kennungen erfinden.
3. Bezeichnungen DE/FR/IT/RG in den bestehenden Sprachspalten führen. Produktübersetzungen sind als solche und bei fehlender Sprachprüfung als provisorisch gekennzeichnet.
4. Die drei Erfassungsabschnitte in einer neuen Gesamtmappe V0.10 zusammenführen. Bestehende Zeilen, Herkunft und historische Statuswerte bleiben erhalten.
5. Neue Normlisten und Daten für 2026–2028 separat testen. Gespeicherte Gesamtdatei erneut einlesen, Formeln und native Excel-Funktionen prüfen und die neuen Ansichten visuell kontrollieren.

## Neue Modellgrenzen

Unbedingte feste Feiertage, Osterabstände und die beiden vorhandenen Wochentagsregeln werden mit Vertrag 0.5.0 erfasst. Bedingte Ausnahmen, Ersatzdaten und nicht belegte zusätzliche Schliesstage werden nicht durch Jahres-Einmalregeln oder scheinbar unbefristete Fixdaten ersetzt.

Solche Fälle bleiben als identifizierte Prüffragen in den Blättern «Verfahrensbezug» beziehungsweise «Quellenprüfung» sichtbar. Die betroffenen Gemeinwesen erhalten einen Teilerfassungshinweis. Ihr Fehlen in der Datumsansicht darf nicht als Nachweis gelesen werden, dass an diesem Tag kein Feiertag besteht.

Eine neue Vertragsfunktion benötigt einen gesonderten Vorschlag und Entscheid. Die übrigen belegt darstellbaren Regeln werden dadurch nicht blockiert. Die erste Erhebung aller Kantone ist nicht gleichbedeutend mit einem für alle Verfahren vollständigen oder freigegebenen Kalender.

## Liefer- und Freigabegrenze

Die Ausgabedatei ist eine lokale Erfassungs- und Prüfgrundlage. Neue Regeln stehen auf `open` und `blockedEffect`. Die V0.9-Abnahme wird nicht als Freigabe neuer Regeln ausgegeben. Auch die neue Gesamtmappe bleibt bis zur ausdrücklichen Abnahme ein Kandidat.

AP18C, XLSX-Import, produktiver Export, Consumeranpassungen, Releasepromotion und Bereitstellung bleiben gesonderte Schritte. Dieser Auftrag umfasst keine GitHub-Veröffentlichung und keine Änderung von E-, Q- oder P-Umgebungen.

## Technischer Aufbau

Der bestehende Builder `scripts/build-ap18a-workbook.mjs` erhält den Modus `--batch-04`. Er verwendet dasselbe Arbeitsmappenmodul und startet aus der gespeicherten V0.9. Die native Excel-Struktur wird mit dem bestehenden, eng begrenzten Adapter erhalten. Der unabhängige Prüfer erhält ebenfalls den Modus `--batch-04` und prüft die gespeicherte Datei gegen die konkrete V0.9, nicht nur gegen einen Erzeugungsnachweis.

Die neun Blätter, acht nativen Tabellen, vier Sprachspalten, Eingabevalidierungen und Schutzfunktionen bleiben erhalten. Es entstehen weder Makros noch externe Datenverbindungen. Die Neuberechnung und Paketprüfung ersetzen keine behauptete Bedienprüfung in der nativen Excel-App.

## Konsolidierter Erfassungsumfang

| Gegenstand | Neue Erfassung | Gesamtstand |
| --- | ---: | ---: |
| Regelzeilen | 282 | 474 |
| Kalenderzeilen | 282 | 483 |
| Geltungsprofile | 28 | 49 |
| Quellen | 47 | 84 |
| Verfahrensbezüge | 55 | 92 |
| Quellenprüfeinträge | 47 | 85 |
| Gebietszuordnungen | 31 | 95 |
| Beziehungen zwischen abweichenden Norm- und Gebietsquellen | 4 | 29 |

Ost ergänzt 83 Regeln, Zentral 126 und West 73. Gezählt werden profilbezogene Regelanwendungen, nicht 474 verschiedene Feiertage. Zusätzliche Prozessprofile können den gleichen Tag nochmals aus einer anderen Rechtsgrundlage nennen. Der Kalender ist kein ungefilterter einzelner Fristenkalender.

Die 192 bisherigen Regeln und sämtliche bisherigen Metadatenlisten bleiben als Präfix unverändert. Die Fachabnahme der V0.9 sowie die SO-Festlegung werden als Herkunftsnachweis und im Überblick der neuen Datei dokumentiert. Alte `open`-Status und Hinweise sind der erhaltene damalige Kandidatenstand. Sie stellen die bereits erteilte Abnahme nicht wieder zur Diskussion.

### Fünf abgegrenzte Prüffragen

| ID | Gegenstand | Behandlung in V0.10 |
| --- | --- | --- |
| `AP18B04-AR-STEPHAN-CONDITION` | AR, zweiter Weihnachtstag entfällt bei Weihnachten Montag oder Freitag | Keine unbedingte Stephanstagsregel. Bedingung benötigt eine künftige Vertragsfunktion |
| `AP18B04-AI-STEPHAN-CONDITION` | AI, Dreierfolge von Ruhetagen und widersprüchlicher Eintrag 26.12.2026 in amtlicher Liste | Keine Stephanstagsregel. Norm und amtlicher Jahresbeleg bleiben getrennt sichtbar, Klärung vor Freigabe |
| `GAP-GL-FAHRT-APRIL` | GL, Näfelser Fahrt mit Karwochenverschiebung | Feiertag rechtlich erfasst, aber nicht in der Datumsansicht erzeugt. Amtlich 09.04.2026, keine Einmalregel als ewiger Ersatz |
| `NE-PENDING-SUNDAY-SUBSTITUTION` | NE, 2. Januar und 26. Dezember nur bei Sonntagslage des Vortags | Keine unbedingten allgemeinen Regeln. Die eigenständigen festen LPA-Verwaltungsergänzungen bleiben davon getrennt |
| `NE-PENDING-COMPENSATION` | NE, weitere Ausgleichstage nach RDF Art. 11 Abs. 2 | Jahresbeschlüsse nicht vollständig erhoben. Quellenlücke, kein behaupteter Quellenwiderspruch |

Die ersten, dritten und vierten Fragen betreffen Grenzen des unveränderten Datumsvertrags. Bei AI kommt eine fachliche Quellenklärung hinzu. Die fünfte Frage benötigt konkrete zusätzliche Quellen und ist nicht durch einen beliebig weit vorausberechnenden Algorithmus lösbar. Daneben bleiben die bereits bestätigten örtlichen und verfahrensbezogenen Umfangsgrenzen bestehen.

### Weitere fachliche Ergebnisse

- Thurgau wird nach dem neuen, seit 1. Januar 2026 geltenden RTG erfasst.
- Neuenburg wird im Verfahrensbezug nach der seit 1. Januar 2026 geltenden LPA geführt, nicht nach der aufgehobenen LPJA. Acht feste Verwaltungstage sind aufgrund des ausdrücklichen LPA-Verweises gesondert erfasst. Ein halber Schliesstag kann dort nach Art. 33 Abs. 3 rechtlich genügen. Der SO-Projektentscheid darf nicht auf diese Norm übertragen werden.
- Uri führt den Sankt-Stefans-Tag im aktuellen LSG unbeschränkt. Eine anderslautende pauschale Kalenderübersicht wurde nicht anstelle der Norm übernommen. Die ArG-Untergruppe bleibt getrennt.
- Innerrhoden nennt für St. Mauritius den inneren Landesteil. Appenzell, Schwende-Rüte, Schlatt-Haslen und Gonten werden konkret aufgeführt, Oberegg nicht einbezogen.
- Le Landeron wird für Fronleichnam unmittelbar durch einen kantonalen Neuenburger Erlass bezeichnet. Es wird eine örtliche Ergänzung erfasst, kein zweiter vollständiger Kantonskalender.
- Neue prozessuale Listen beziehungsweise Ergänzungen sind für ZH, SH, SG, LU, ZG und NE sichtbar. Ihre Erfassung ist noch keine automatische Rechtsprofilzuordnung im Produkt.

Die vollständigen amtlichen Fundstellen, Zugriffslücken und Sprachvorbehalte stehen in den drei Quellenpaketen. Amtliche Jahreskalender dienen dem Abgleich, nicht als Ersatz für die gesetzlichen Kategorien.

## Auslieferung und Prüfergebnis

- [Gesamtmappe V0.10](../../outputs/ap18b-04-restkantone-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.10.xlsx)
- [Technischer und visueller Prüfbericht](../../outputs/ap18b-04-restkantone-2026-09-13/QA-AP18B-04-V0.10.md)

347 Modelltests, darunter 77 neue Tests, sind bestanden. Die unabhängig ausgewerteten gespeicherten Datumsformeln stimmen in 2844 Vergleichen mit dem getrennten Referenzrechner überein. Alle 5811 Formelzellen besitzen gespeicherte Ergebnisse. Die Zielkopie wurde erneut eingelesen und für 2026–2028 neu berechnet. 138 tatsächlich geöffnete Ansichten wurden ohne korrekturbedürftigen Layoutbefund geprüft. Eine neue Bedienprüfung in der nativen Excel-App wird nicht behauptet.

Die finale V0.10 trägt SHA-256 `bba15a8f6e7b6956662d00bb1b7efb51903ad19aa2b2d1dc29c42a7fd9361e4e`. Die V0.9-Referenz ist unverändert. Modellcode, native Dateistruktur und gespeicherte Zielkopie wurden abschliessend abgeglichen.

Die fachliche Durchsicht der neuen Kantonsgruppen ist anschliessend ohne Beanstandung erfolgt. Die auf Nutzerauftrag erstellte [V0.11 mit vollständigen Sprachbezeichnungen](../fachrecht/sprachergänzung-ap18b-04.md) ändert weder die Regeln noch den Vertrag. Als nächster fachlicher Schritt sind die fünf Prüffragen kontrolliert zu bearbeiten. Ein begrenzter Vertragsnachtrag für bedingte Datumsregeln wird separat vorgeschlagen, nicht aus dieser Lieferung als beschlossen abgeleitet. Die Quellenklärung in AI und zusätzliche Jahresquellen für NE sind davon getrennte fachliche Aufgaben. Erst danach kann die jeweils freizugebende Abdeckung für AP18C festgelegt werden.

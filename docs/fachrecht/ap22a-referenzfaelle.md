# AP22A Referenzfälle und technische Nachweise

Entscheidstand: 8. Oktober 2026. Quellen- und Teststand: 2. Oktober 2026, unverändert wiederverwendet. Dieser Index verbindet die fachlichen Sollfälle der drei AP22A-Abklärungen mit den tatsächlich ausgeführten technischen Prüfungen. Er dient der nachvollziehbaren Übernahme in die nächste Implementierungs- und Teststufe. Die operative Fachfreigabe nach [DEC-2026-028](../entscheidungen/DEC-2026-028-operative-freigabe-kalenderzuordnungen.md) ist erteilt. Die begrenzte Produktbehandlung des 2. Januar wurde am 8. Oktober 2026 mit [DEC-2026-029](../entscheidungen/DEC-2026-029-begrenzte-behandlung-zweiter-januar.md) beschlossen. Beide Entscheide ersetzen weder einen noch fehlenden Testlauf noch die ausstehende Implementierung.

**Nachgewiesen bestanden sind 14 Modellproben und 220 bestehende Regressionstests.** Die nachstehenden 25 fachlichen Referenzgruppen sind dagegen Sollvorgaben. Sie sind nicht als 25 neu bestandene Produkttests zu zählen. Der neue Ortsresolver, die erweiterten Prozesslistenbindungen und ihre Darstellung im GUI sind durch diese technischen Bestandsprüfungen noch nicht implementiert oder abgenommen.

## Aussagekraft der Nachweise

| Ebene | Inhalt | Status und Grenze |
| --- | --- | --- |
| Fachliche Referenzgruppen BUND01 bis BUND06 | Sechs historische, quellengebundene Fälle mit Fristbeginn, Dauer und Rollenanknüpfung | Rechtliche Sollwerte. Die technische Datumsarithmetik wurde bei Erstellung der Bundesgrundlage separat gegengeprüft. Keine neuen Produktprüfungen und keine Freigabe historischer Zeiträume im heutigen Rechner. |
| Fachliche Referenzgruppen REG-01 bis REG-10 | Zehn positive und negative Regionalvergleiche | Prüfen die Feiertagswirkung auf einen bereits ermittelten nominellen Endtag. Fristbeginn, Fristdauer und Stillstand sind vorgelagert. |
| Fachliche Referenzgruppen PROC | Neun Gruppen zu weiteren Prozesslisten | Ebenfalls Endtagskomponente. Mehrere Gruppen enthalten mehrere Sollwerte oder die beschlossene begrenzte Produktbehandlung des 2. Januar. |
| Modellproben M01 bis M14 | Bestehender Katalog, Datierung, geografische Mitgliedschaft und Zurückweisung unzulässiger alter Vertragsnutzung | 14 von 14 bestanden am 02.10.2026. Kein Test des noch nicht gebauten neuen Produktresolvers. |
| Bestehende Regressionen | Drei bestehende Testdateien zum Feiertagskatalog, zu Kalenderregeln und zur AP18C-Integration | 220 bestanden, 0 fehlgeschlagen. Die Gesamtheit sämtlicher Repositoriumstests ist damit nicht behauptet. |

Die massgebenden technischen Nachweise sind [model-check.json](../../outputs/ap22a-abschluss-2026-10-02/model-check.json) und [existing-regression.txt](../../outputs/ap22a-abschluss-2026-10-02/existing-regression.txt). Der geprüfte Eingangsbestand ist der unveränderte [MVP-0.6-Feiertagskatalog](../../data/releases/2026-10-01-mvp-06-approved.1/holiday-catalogs/ch-holiday-catalog.json) mit SHA-256 `b53f9ed3dec29c8bb479b3840a801f3056531374cbb84611b377d7a01e93d1b7`. Der Prüfbericht weist `productActivation: false` aus.

## Bundesrechtliche Referenzfälle

Führend für die vollständigen Eingaben, Rollen, historischen Fassungen und Quellen ist [Bundesrechtliche Feiertagsanknüpfungen](ap22a-bundesanknuepfungen.md#datierte-fachliche-referenzfälle). Die Kurzfassung dient als Index und erweitert deren Aussage nicht.

| Referenz | Prüfgegenstand | Fachlicher Sollwert |
| --- | --- | --- |
| BUND01 | BGG, Zustellvertretung GE statt Partei SH, Eröffnung 07.07.2023 und 30 Tage mit Sommerstillstand | Nomineller Endtag 07.09.2023, Genfer Bettag. Ende 08.09.2023. |
| BUND02 | BGG, Vertretung VD, Fronleichnam nur am Parteiort, Eröffnung 20.05.2025 und 30 Tage | Ende 19.06.2025. Keine zusätzliche Verschiebung auf 20.06.2025 aufgrund des Parteiorts. |
| BUND03 | StPO, Advokaturbüro SG, Eröffnung 20.05.2020 und 10 Tage | Nomineller Endtag 30.05.2020. Nach Wochenende und Pfingstmontag Ende 02.06.2020. Kein Behördenortkalender als Ersatz. |
| BUND04 | StPO, unvertretene Gesellschaft GE, Eröffnung 23.12.2022 und 10 Tage | Ende 02.01.2023. Kein Weihnachtsstillstand und keine automatische Verschiebung aufgrund von Personalersatzurlaub. |
| BUND05 | VwVG, historische nichtprofessionelle Vertretung BE und Partei im damaligen katholischen FR-Gebiet, Eröffnung 29.10.2010 und 3 Tage | Historischer Sollwert 02.11.2010. Zugleich Gegenprobe gegen eine heutige universelle Einortregel. Ohne gesondert modellierte Mehrortbehandlung kein sicherer Standardfall. |
| BUND06 | BGG, Lenzburg AG, Eröffnung 02.10.2023 und 30 Tage | Ende 02.11.2023 aufgrund der Prozessliste. Der frühere Sollwert 01.11.2023 ist durch 2E_8/2024 materiell widerlegt. |

## Regionale Referenzfälle

Führend sind [Regionale und prozessuale Feiertagslisten](ap22a-regionale-zuordnungen.md#datierte-positive-und-negative-referenzen). Die Ortsangabe bezeichnet jeweils den nach dem Bundesprofil rechtlich massgebenden Ort, nicht automatisch den Behördenort.

| Referenz | Profil und Ort | Nomineller Endtag | Sollwirkung der Feiertagskomponente |
| --- | --- | --- | --- |
| REG-01 | BGG, Lenzburg AG | 01.11.2027 | Allerheiligen gilt kantonsweit. Verschiebung auf 02.11.2027. |
| REG-02 | StPO, Bergdietikon AG | 04.06.2026 | Fronleichnam aus eigener EG-StPO-Norm. Verschiebung auf 05.06.2026. |
| REG-03 | VwVG, Aarau AG | 02.01.2026 | Berchtoldstag aus normativ zugeordneter Prozessliste. Verschiebung auf 05.01.2026. |
| REG-04 | BGG und VwVG, Murten FR | 08.12.2026 | Mariä Empfängnis aus JG, keine Beschränkung auf katholische Arbeitsrechtsgebiete. Verschiebung auf 09.12.2026. |
| REG-05 | StPO und ZPO, Solothurn SO | 01.05.2026 | Ganztägige Prozessregel, nicht RTG-Halbtag. Verschiebung auf 04.05.2026. |
| REG-06 | BGG und VwVG, Bucheggberg SO | 04.06.2026 | Kantonsweite Prozessliste ohne RTG-Ausnahme. Verschiebung auf 05.06.2026. |
| REG-07 | StPO und ZPO, Neuchâtel NE | 15.05.2026 | Freitag nach Auffahrt mit eigener LI-CPP-/LI-CPC-Gleichstellung. Verschiebung auf 18.05.2026. |
| REG-08 | VwVG, La Chaux-de-Fonds NE | 21.09.2026 | Wiederkehrender Bettagsmontag. Verschiebung auf 22.09.2026. |
| REG-09 | BGG, Neuchâtel NE | 08.12.2026 | Keine Verschiebung aus den bekannten Listen. Nicht als Beweis gegen vorbehaltene besondere Jahresregelungen ausgeben. |
| REG-10 | Vier Bundesprofile, Le Landeron gegenüber Stadt Neuchâtel NE | 04.06.2026 | Le Landeron bis 05.06.2026. Stadt Neuchâtel keine Verschiebung aus dieser örtlichen Regel. |

## Weitere Prozesslisten

Führend sind [Weitere kantonale Prozessfeiertagslisten](ap22a-weitere-prozesslisten.md#datierte-referenzen-für-die-nächste-teststufe). Jahreszahlen ausserhalb der derzeitigen Produktabdeckung dienen ausschliesslich der Regelprüfung. Sie erweitern keine zeitliche Freigabe.

| Referenz | Prüfgegenstand | Sollwirkung und Grenze |
| --- | --- | --- |
| PROC-SH-2026 | SH, 02.01.2026 | BGG/VwVG bis 05.01.2026 gemäss dokumentierter Ableitung. Unter StPO Einzelfallklärung und kein definitives automatisches Fristresultat gemäss DEC-2026-029. |
| PROC-SG-2023 | Historisch unterschiedliche Verfahren | ZPO: 02.01.2012 bis 03.01.2012. VRP/DBG: 02.01.2023 blieb Endtag. Das negative Verwaltungsurteil ist kein unmittelbarer negativer BGG-, VwVG- oder StPO-Test. |
| PROC-SG-2026 | SG, 02.01.2026, StPO/BGG/VwVG | Einzelfallklärung und kein definitives automatisches Fristresultat gemäss DEC-2026-029. Weder 02.01.2026 noch 05.01.2026 wird als sicherer Endtag festgelegt. |
| PROC-AR-2028/29 | Bedingter Stephanstag AR | 26.12.2029 bis 27.12.2029. Am 26.12.2028 keine Verschiebung aus der bedingten Feiertagsregel. |
| PROC-VD-2026 | VD-Bettagsmontag und fehlender unbedingter Stephanstag | 21.09.2026 bis 22.09.2026. 26.12.2028 unverändert in dieser Komponente. |
| PROC-ZH-2026 | GOG-Liste statt arbeitsrechtlicher Teilmenge | 01.05.2026 bis 04.05.2026. Fronleichnam 04.06.2026 unverändert. |
| PROC-LU-2026 | Gewählter Prozessbestand, nicht zusätzliche Listenvereinigung | 08.12.2026 bis 09.12.2026 und 02.01.2026 bis 05.01.2026. Josefstag 19.03.2026 unverändert. |
| PROC-ZG-2026 | Übereinstimmende GOG-/VRG-Liste | Fronleichnam 04.06.2026 bis 05.06.2026. Josefstag 19.03.2026 unverändert. |
| PROC-VS-2026 | Grundliste mit gesetzlicher Ergänzung | Pfingstmontag 25.05.2026 bis 26.05.2026. 01.05.2026 unverändert. |

## Vier beschlossene Produktgrenzen am 2. Januar

Die pauschale operative Fachfreigabe bleibt bestehen. **David Steimer hat am 8. Oktober 2026 die begrenzte Produktbehandlung der nachträglich konkretisierten Unsicherheit beschlossen**. Für diese vier Verbindungen gilt Option B nach DEC-2026-029:

| Verbindung | Konkrete Gegenprobe | Beschlossener Sollwert und rechtliche Grenze |
| --- | --- | --- |
| SH und StPO | Der 2. Januar würde die Endtagsverschiebung verändern, etwa am 02.01.2026. | Einzelfallklärung und kein definitives automatisches Fristresultat. Weder eine sichere Verlängerung noch ein sicherer Ausschluss wird behauptet. |
| SG und StPO | Derselbe Kalenderfall, aber keine unmittelbare StPO-Anerkennung aus dem positiven ZPO-Entscheid. | Einzelfallklärung und kein definitives automatisches Fristresultat. Keine pauschale Übertragung des EuFrÜb auf Strafverfahren. |
| SG und BGG | Positive ZPO- und negative VRP-/DBG-Praxis stehen nebeneinander. | Einzelfallklärung und kein definitives automatisches Fristresultat. Keinen der beiden Entscheide als unmittelbar abschliessenden BGG-Entscheid ausgeben. |
| SG und VwVG | Dieselbe widersprüchliche kantonale Anerkennungsbasis. | Einzelfallklärung und kein definitives automatisches Fristresultat. Keine stille Vereinigung oder vorsorgliche Festlegung auf den kürzeren Endtag. |

Beschlossen ist eine **gezielte Sperre des definitiven automatischen Fristresultats nur dann, wenn die unterschiedliche Behandlung des 2. Januar das Ergebnis tatsächlich verändert**. Die rechtliche Unsicherheit wird damit nicht aufgelöst. Die Entscheidung ist ein Produkt-Sollwert, kein bereits implementierter Produkttest. Zu erfassen ist auch der Fall, dass der 2. Januar erst als Folgetag einer bereits laufenden Endtagsverschiebung erreicht wird. Gewöhnliche Berechnungen, deren Ergebnis hiervon nicht abhängt, bleiben verwendbar. Auch wenn beide Bewertungen zum gleichen Enddatum führen, greift diese Begrenzung nicht. Die Begründung und die nicht gewählte Alternative stehen im [fachlichen Grenznachweis](ap22a-weitere-prozesslisten.md#vier-eng-begrenzte-grenzfälle).

## Zentrale Gegenproben für die Implementierung

Diese Gegenproben ergänzen die fachlichen Referenzgruppen. Sie sind **vorgesehene Abnahmekriterien**, keine neu ausgeführten Testfälle.

| Kennung | Ausgangslage | Erwartetes Verhalten | Vorhandener Nachweis und verbleibende Prüfung |
| --- | --- | --- | --- |
| ZENT01 | StPO, BGG oder VwVG, Behördenebene Bund gewählt, erforderlicher Partei-/Vertretungsort fehlt. Bei ZPO fehlt der Gerichtsort. | Kein definitives Ergebnis mit reinem CH- oder still gewähltem BE-Kalender. Fehlenden Ort gezielt verlangen. | Bundesgrundlage. M10 prüft unbekannte Gebiete im alten Modell, aber noch nicht diese neue UI-/Resolverfunktion. |
| ZENT02 | Professionelle Vertretung eindeutig bekannt gegenüber unklarer nichtprofessioneller Vertretung, Mandatswechsel oder mehreren nicht aufgelösten Orten. | Normalfall nach dokumentierter Rollenregel. Im ungeklärten Fall keine freie Kalendervereinigung und kein stiller Rollenwechsel. | BUND01–03 und BUND05 sowie Bundesgrundlage. Neuer Resolver noch zu testen. |
| ZENT03 | Tatsächlich massgebender Feiertagskalender GR, unabhängig vom Behördenkanton. Gegenfall: Behörde GR, aber massgebender Kalender eines anderen Kantons. | GR-Grundkatalog plus Bundesfeier mit sichtbarem Hinweis auf die bewusste örtliche Begrenzung. Hinweis nicht allein aufgrund des Behördenkantons auslösen. Kommunale Ruhetage nicht als generell rechtlich irrelevant bezeichnen. | DEC-2026-028. Konkrete Hinweis- und Rechenspurdarstellung noch zu implementieren und zu prüfen. |
| ZENT04 | Ein zusätzlicher Kantonskalender ist verfügbar, das Sozialverfahren beziehungsweise die ausserbernische Anbindung aus #35 aber nicht gesondert freigegeben. | Kalenderverfügbarkeit darf weder neue Sozialanbindungen noch Rechtswege oder Zuständigkeiten freischalten. Keine automatische ATSG-Erweiterung aus den vier Bundesprofilen. | [Releaseumfang MVP 0.7](../planung/release-mvp07.md), [Issue #35](https://github.com/davidsteimer/fristenrechner/issues/35), DEC-2026-028. Neue Anbindung bleibt gesondert zu qualifizieren. |
| ZENT05 | Gleicher Feiertagskalender, unterschiedliche Bundesprofile beziehungsweise Stillstandsausnahmen. | Feiertagsverschiebung und Friststillstand getrennt anwenden. StPO erhält keine Gerichtsferien. Die Kalenderaktivierung ändert keine bestehenden Stillstandsausnahmen. | Bundesgrundlage und bestehende Regressionen. Neue kombinierte Profile-/Kalenderfälle noch zu testen. |
| ZENT06 | Fehlender Quellennachweis, ungeprüfte Jahresanordnung oder nicht auflösbare Listenbindung. Gegenfall: konkret belegt nicht anwendbare Feiertagsregel. | «Unbekannt» nicht in «kein Feiertag» umwandeln. Umfang und Ergebnisrelevanz der Lücke ausweisen. Einen belegten negativen Auswahlentscheid dagegen als solchen erhalten. | REG-09, NE-Jahresvorbehalt und unveränderte 20 negative Matrixbindungen. Die neue Laufzeitbehandlung fehlt noch. |
| ZENT07 | Gleicher Tag in mehreren zulässig kombinierten Quellen, etwa Bundesfeier oder ein NE-Ersatz- und Gleichstellungstag. Daneben alternative statt ergänzende Listen. | Datumswirkung nicht doppelt anwenden. Rechtsgrundlagen nachvollziehbar erhalten. `replace` darf nicht wie `supplement` alle Ausgangslisten vereinigen. | Regionale und weitere Listenabklärung. Neue operative Auswahl und Rechenspur noch zu testen. |
| ZENT08 | Regel kann für ein Jahr datiert werden, aber Gültigkeit, Consumervertrag oder konkrete Freigabe deckt den Fall nicht. | Keine Freigabe allein aus erfolgreicher Datierung. Historische Sollfälle und Beispiele 2028/2029 bleiben von der Produktabdeckung getrennt. | M11–M14 und bestehende Regressionen prüfen Teile des alten Vertrags. Neuer Vertrag und seine Migration sind noch umzusetzen. |

Ein fehlender Quellennachweis und ein bewusster dokumentierter Produktvorbehalt sind nicht dasselbe. Der freigegebene GR-Grundkatalog und der NE-Vorbehalt bleiben in ihrer beschlossenen Reichweite verwendbar. Die Nachweisführung darf daraus aber keine Vollständigkeit sämtlicher örtlicher oder jährlicher Feiertage ableiten.

## Tatsächlich bestandene Modellproben

Die folgende Tabelle übernimmt die Ergebnisse des gespeicherten [Modellprüfberichts](../../outputs/ap22a-abschluss-2026-10-02/model-check.json). Sie erweitert dessen Prüfgegenstand nicht.

| Modellprobe | Geprüfter Gegenstand | Ergebnis |
| --- | --- | --- |
| M01 | Unveränderter Katalog mit 479 Regeln erfüllt seinen bisherigen Vertrag. | Bestanden |
| M02 | Alte Projektion liefert genau zwölf operative CH-/BE-Feiertagsregeln. | Bestanden |
| M03 | Genfer Bettag ist mit Wochentag und Offset darstellbar. | Bestanden |
| M04 | Bettagsmontag VD und NE ist datierbar, ohne neue Verfahrensfreigabe einzuschleusen. | Bestanden |
| M05 | AR- und AI-Bedingungen für 2026, 2027 und 2028. | Bestanden |
| M06 | GL verschiebt den ersten April-Donnerstag aus der Karwoche. | Bestanden |
| M07 | NE-Ersatzfeiertage bleiben bedingte Regeln. | Bestanden |
| M08 | Rheinfelder Teilgebiete bleiben getrennt. | Bestanden |
| M09 | Le Landeron ist örtliche Ergänzung und nicht das ganze Kantonsgebiet. | Bestanden |
| M10 | Unbekanntes Gebiet erzeugt keinen stillen Standardwert. | Bestanden |
| M11 | Eine operative Freigabe lässt sich nicht durch blosses Umetikettieren in den alten Katalog einschleusen. | Bestanden |
| M12 | Der alte Kern weist das vorgeschlagene Manifest-Hauptformat 7 zurück. | Bestanden |
| M13 | Erfolgreiche Jahresdatierung erweitert keine Regelgültigkeit. | Bestanden |
| M14 | Alle bestehenden Katalogregeln sind für 2026 bis 2028 datierbar. | Bestanden |

Die 220 zusätzlich bestandenen Regressionstests stammen aus `tests/core/holiday-catalog.test.ts`, `tests/core/calendar-rules.test.ts` und `tests/core/ap18c-integration.test.ts`. Sie sichern die bestehende Kalenderarithmetik, Katalogprüfung und frühere Integration ab. Insbesondere beweisen M02 und M11 gerade **nicht**, dass die neuen kantonalen Kalender bereits operativ aktiv wären.

## Übergabe an die nächste Teststufe

Bei der technischen Umsetzung erhält jeder neue Test die passende Referenzkennung und die konkret verwendete Norm- beziehungsweise Datenfassung. Historische Vollfälle, synthetische Endtagsvergleiche und Produktgrenzen bleiben getrennte Testarten. Ein neuer Erfolgseintrag setzt einen ausgeführten Testlauf mit gebundenem Eingangsstand voraus. Die vier Januargrenzen haben mit DEC-2026-029 einen beschlossenen Produkt-Sollwert. Dessen Umsetzung muss sowohl ergebnisrelevante Unterschiede als auch nicht betroffene Fälle prüfen.

Die Originalmatrix, die kommentierte Reviewkopie und ihre bereits erteilte Freigabe werden durch diesen Index nicht überschrieben. Der Index veröffentlicht nichts und ändert keine Kalender, Sites, Berechtigungen oder Produktfreigaben.

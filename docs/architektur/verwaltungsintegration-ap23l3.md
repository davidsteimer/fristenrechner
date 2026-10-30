# AP23L3 Native Integration Appenzell Innerrhoden und Schwyz

Stand: 27. Oktober 2026. Lokale Umsetzung des [ausdrücklich gestarteten L3-Auftrags](start-ap23l3.md) nach [technischer L2-Abnahme](../fachrecht/abnahme-ap23l2.md) und [beschlossenem DEC-2026-041](../entscheidungen/DEC-2026-041-beschluss.md). Menschliche fachlich-technische L3-Abnahme und operative Freigaben bleiben getrennt.

## Umfang und tatsächlicher Kandidat

Der native Vertrag umfasst **Kantonalverfahrenskatalog 9.0.0 sowie Manifest und Mindestconsumer 16.0.0**. Der neue lokale Kandidat `2026-10-27-ap23l3-candidate.1` verbindet 165 bisherige mit 31 neuen Pfaden, insgesamt **196**. AI ergänzt 18, SZ 13 fachlich qualifizierte Wege. Die frühere Fachvorlage und die isolierte Vertragsprobe bleiben unverändert erhalten.

Der Kandidat unter [data/candidates/2026-10-27-ap23l3](../../data/candidates/2026-10-27-ap23l3/) ist kein freigegebener Datenrelease. Seine 44 Artefakte und das Manifest werden deterministisch erzeugt. **42 Artefakte bleiben gegenüber L2 rohbytegleich.** Administrativ- und Sozialkatalog erhalten die vorgesehenen Vertrags- beziehungsweise tatsächlichen Zielreleasebindungen. Die 44 Sozialregeln und 50 BE-Anbindungen ändern sich fachlich nicht. Es bleiben 35 Kalender und 499 Katalogregeln, ohne zusätzlichen physischen Martinstagskalender.

## Reader und Rechenkern

Der Format-16-Byteparser prüft geschlossenes Manifest und Katalog, exakte Dateiliste, Rohprüfsummen und Byteumfang, Quellen-/Pfad-/Policybindungen sowie die getrennten lokalen und freigegebenen Lesemodi. Ein serialisiertes Objekt, kopierter Kontext oder gefälschter Freigabekopf wird nicht zur Laufzeitberechtigung. Die bestehenden Reader und nativen Schemaäste bleiben unverändert.

Ein eigener V9-Kern wertet die neuen AI-/SZ-Pfade aus. Die bisherigen V6-/V7-/V8-Zweige werden im neuen echten Format-16-Kontext mit ihrer bisherigen Bedeutung verarbeitet. Es wird kein künstlicher alter Trustkontext erzeugt. Ältere Pfade bleiben ebenfalls eigenständig geprüft. Die Dispatcher und Runtime-Identitätsprüfungen führen Bundes-, BE-, Sozial- und Verwaltungswege nur durch dieselbe tatsächlich geprüfte Releasekombination.

Die neuen Kalenderregeln werden nach ihrer einzelnen Tagesgültigkeit erzeugt. Nicht jede Regelgültigkeit wird pauschal als Gültigkeitsgrenze des ganzen Kalenders behandelt. Auslöser, normalisierte Eröffnung, Zählung und vollständige Endverschiebung müssen trotzdem durch alle tatsächlich einschlägigen Pfad-, Norm-, Kalender- und Releasegrenzen gedeckt sein.

## Aktuelle Fallqualifikation und Oberfläche

Zwei Spalten, frühe Datumseingabe, statisch **Sitz der zuständigen Stelle** und feste Einzelausprägungen bleiben erhalten. Verfahrensstadium und Handlung ordnen die qualifizierten Wege. Nur echte Alternativen erhalten eine Auswahl. Bei den beiden SZ-Einzelkategorien zeigt die Oberfläche den konkreten modellierten Gegenstand fest an und verlangt keinen zusätzlichen Dropdown-Klick.

AI unterscheidet den bereits rechtlich qualifizierten Tag vom physischen Eingang einer qualifizierten Trackingsendung. Die drei Trackingvoraussetzungen gehören zur ausdrücklich aktuellen Fallqualifikation. Bei einem Bedeutungswechsel wird das bisherige Datum verworfen, auch über «Bitte wählen», einen anderen Pfad, Erlass oder Kanton. Ein separater Reset der Datumseingabe verwirft dabei auch einen noch nicht bestätigten Textentwurf. Die frühe Eingabe vor der ersten Pfad- und Moduswahl bleibt möglich.

Die längere AI-Belehrung übernimmt genau die aktuell eingegebene wirksame Dauer und die aktuell bestimmte ordentliche Basis. Das Überschreiten beider Schwellen wird geprüft. AI-O3 wird nicht durch einen Maximalwert aufgelöst. Bei der angeordneten SZ-Einsprache ist die tatsächlich angesetzte Dauer von einem bis zehn Tagen erforderlich. Gesetzliche Fristen sind nicht frei übersteuerbar.

Persönliche Vorgaben bleiben **Version 5**. Alle nichtgesetzlichen neuen V9-Dauern werden bei Wiederherstellung und relevantem Pfadwechsel leer angezeigt. Der neutrale numerische V5-Speicherplatz ist keine bestätigte aktuelle Dauer. Datum, Referenz, Tracking-, Orts- und Belehrungsfakten werden nicht gespeichert. Ein unbekannter neuer Pfad bleibt im älteren Consumer geschützt, ohne Löschung, Bern-Ersatz oder Rückfall auf den ersten verfügbaren Weg.

## Rechenspur und Kalenderexport

Die lesbare Spur trennt physischen Eingang, rechtliche Eröffnung, ordentlichen Fristbeginn, ersten gezählten Tag und Endverschiebung. Die Kurzbeschriftung beim AI-Tracking verweist auf den Tag nach der **rechtlichen Eröffnung**, nicht unpräzise auf den physischen Eingang. Rechtsnormlinks werden aus den tatsächlich gebundenen Quellen mit geprüften fallbezogenen Artikelangaben angezeigt. Forschungsannotation, technische Kennungen und nicht einschlägige Fassungs- beziehungsweise Begleitquellen bleiben in den aufklappbaren technischen Nachweisen.

Der Schwyzer Martinstag hat eine eigene quellen- und ortsgebundene Herkunft. Er verschiebt ausschliesslich ein darauf fallendes Ende. Im Fristinnern wird weitergezählt. Es werden keine erfundenen physischen Feiertagskennungen erzeugt. Die AI-Wintergrenze am 2. Januar, die SZ-Grenze am 7. Januar und die tatsächlich berührten SZ-Normphasen vor und ab 1. Juli 2027 bleiben getrennt sichtbar.

Die lokale Prüfansicht sperrt **sämtliche Kalenderexporte**. Die Exportfunktion wird zusätzlich mit ausdrücklich synthetisch freigegebenen Testkontexten ausschliesslich im Arbeitsspeicher geprüft: 54 positive Originalfälle in DE und FR, 108 Kalenderstrings, 29 Sperrfälle sowie veränderte Fakten, Dauer, Datum, Ergebnis und Kontext. Dieser Test erteilt keine Freigabe der echten Daten. Keine ICS-Dateien gespeichert und keine Outlook-Importe ausgeführt. Der [Exportnachweis](../../outputs/ap23l3-2026-10-27/calendar-export-verification.json) bindet die tatsächlichen Eingänge und Ergebnisse.

## Referenzen und Nachweise

Die 83 unveränderten L1-Erwartungen bleiben die fachliche Referenz: 54 Datumsfälle und 29 begrenzte Qualifikations-, Zeitfenster- oder Kollisionsgrenzen. Sie werden im tatsächlichen nativen Format-16-Kern und mit einer unabhängigen Python-Implementierung aus den neuen Kandidatenbytes berechnet. Die 20 zusätzlichen L2-Technikproben bleiben gesondert. Die 165 früheren nativen Ergebnisse und 673 geerbten Fälle werden zusätzlich gegen ihren abgenommenen Bestand verglichen.

Die vollständigen Produkt-, UI-, Host-, Schema-, Byte-, Mutations-, Defaults- und Paketprüfungen sind im [QA-Bericht](../../outputs/ap23l3-2026-10-27/QA-AP23L3.json) mit den tatsächlichen TAP-Zahlen dokumentiert. Die [unabhängige Nachrechnung](../../outputs/ap23l3-2026-10-27/independent-verification.json) importiert weder Produktarithmetik noch den früheren L2-Prüfer. Zusätzliche synthetische Proben sind keine weiteren menschlich abgenommenen Rechtsfälle.

Web und SPFx werden aus demselben lokalen Produktstand getrennt gebaut und an den tatsächlichen Artefakten geprüft. Der [Browsernachweis](../../outputs/ap23l3-2026-10-27/browser-verification.json) beschreibt die Bedienung der gebauten lokalen Webansicht. Er ist kein realer Geräte-, M365- oder Gasttest. Der [Paketnachweis](../../outputs/ap23l3-2026-10-27/actual-package.json) gehört zum isolierten lokalen SPPKG und nicht zum Betriebspaket im Tenant.

## Prüfseitige Korrekturen und Grenzen

Im neuen GUI wurden vor dem endgültigen Artefaktnachweis zwei Punkte bereinigt. Erstens war die Kurzbeschreibung des Fristbeginns beim Trackingempfang unpräzise, obwohl Rechnung und eigener Eröffnungsabschnitt korrekt waren. Zweitens musste der Bedeutungswechsel des Datums auch über einen leeren Zwischenzustand und bei unbestätigtem Eingabeentwurf sicher zurücksetzen. Beide Punkte betreffen Bedienung und Darstellung, nicht Fachregeln oder Rechtsdaten.

Ein zusätzlicher API-Zweitblick zeigte bei bereits qualifizierter AI-Eröffnung eine strukturelle Lücke: Drei dann nicht benötigte optionale Trackingangaben wurden nur auf skalare Werte, nicht vollständig auf das abgenommene Vokabular geprüft. Die neue V9-Validierung gleicht diese Angaben auch in diesem Modus mit den exakten Typen und Werten des unveränderten Input-9-Vertrags ab. Zulässige irrelevante Werte begründen keine Trackingqualifikation. Im tatsächlichen Trackingmodus bleiben dessen positive aktuelle Voraussetzungen erforderlich. Die Gegenproben lesen das abgenommene Eingabeschema und prüfen sämtliche betroffenen AI-Pfade. Fachregeln und Rechtsdaten bleiben unverändert.

Die betroffenen Gesamt-, Oberflächen-, Browser- und Paketprüfungen werden am korrigierten Stand geführt. Frühere Teilprüfungen und abgebrochene Bauten bleiben als solche gekennzeichnet und werden nicht als abschliessend bestanden verwendet.

Der Produktionsbau ist **nicht warnungsfrei**. Der endgültige SPFx-Lintlauf meldet 112 Warnungen. 13 davon betreffen neue V9-/Format-16-Dateien: sechs unbenutzte Bezeichner, drei fehlende explizite Rückgabetypen und vier explizite `any`-Typen. Die übrigen 99 betreffen ältere oder gemeinsam weitergeführte Module. Compiler- und Testfehler wurden nicht gemeldet. Die Warnungen bleiben als technische Restpflege offen. Ein erfolgreicher Bau ist kein Nullwarnungsnachweis. Der [gebundene Originallog](../../.work/ap23l3-spfx-build-mFjf00/step-4.log) weist die einzelnen Fundstellen aus.

Das vollständige Fenster bleibt **29.08.2026–31.12.2027**. AI-O1 bis AI-O3, SZ-O1, Endverschiebung in neu beginnenden Stillstand sowie die Grenzen elektronischer und ausserordentlicher Einreichung bleiben erhalten. Eine offene Rechtsauslegung wird nicht durch zwei übereinstimmende Rechenprogramme entschieden. Keine zusätzlichen ausserbernischen Sozialfreigaben, eigenständigen kommunalen Verfahren oder automatischen Rechtsmittelketten.

Die [L3-Schutzbindung](../../outputs/ap23l3-2026-10-27/protected-inputs.json) und [Erhaltungsprüfung](../../outputs/ap23l3-2026-10-27/preservation-verification.json) sichern die 9’130 unveränderlichen Bestandsdateien. 147 vorhandene Dispatcher-, UI-, Host- und generierte Dateien sind genau bezeichnet. Alte Fachpfade, Reader, Schemata, Tests und Nachweise bleiben geschützt. Die Stylesheets ändern sich nicht. Der [gebundene Abschluss](../../outputs/ap23l3-2026-10-27/local-completion.json) dokumentiert den tatsächlichen abschliessenden Prüfstand.

## Nächster Haltepunkt

Die gebaute lokale Prüfansicht ist unter [127.0.0.1:8810/fristenrechner/](http://127.0.0.1:8810/fristenrechner/) erreichbar, solange der lokale Vorschauprozess läuft. Sie enthält den ausdrücklich gekennzeichneten L3-Kandidaten und keine freigegebene Produktdatenquelle. Für einen späteren erneuten Start ist im Projekt `npm run preview:ap23l3` vorgesehen. Der Browsernachweis bindet dagegen die tatsächlich geprüften gebauten Bytes.

Die lokale fachlich-technische AP23L3-Abnahme liegt bei David Steimer. Bis dahin bleiben 21 Kantone vollständig abgenommen, sechs operativ und 15 nur lokal. Nach erfolgreicher L3-Abnahme wären AI und SZ die Kantone 22 und 23. NE, VD und VS bleiben gesondert auszuarbeiten.

Keine Quellenpromotion, Commits, GitHub-Änderungen, Uploads, Installation oder Betriebsänderungen an E/Q/P, Mirrors, AP5, AP21, Hosting oder Berechtigungen. MVP 0.9 bleibt operativ. Der nächste reguläre Release wird weiterhin gemäss DEC-2026-034 gebündelt. David nimmt die menschlichen Rollen in Personalunion wahr. KI-Arbeitsteilung ersetzt seine Abnahme nicht.

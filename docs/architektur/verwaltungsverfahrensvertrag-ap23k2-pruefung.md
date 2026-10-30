# AP23K2 Technische Prüfung der isolierten BS und BL Vertragsprobe

Stand: 27. Oktober 2026. Technischer Abnahmevorschlag. Die [K1-Fachabnahme](../fachrecht/abnahme-ap23k1.md) liegt vor. K2-Abnahme, [DEC-2026-040](../entscheidungen/DEC-2026-040-dynamische-feiertagsbindung-und-bueroschliesstage-v8.md) und K3-Start sind getrennte nächste Schritte.

## Prüfergebnis und Aussagekraft

Die [Vertragsvorlage](verwaltungsverfahrensvertrag-ap23k2.md) wird an den tatsächlich geschriebenen isolierten Dateien geprüft. Dazu gehören die vier Schemaentwürfe, das Manifest, alle 44 Nutzartefakte und die Herkunftsabbildung. Keine Produktquelle und kein natives Schema wird dafür verändert. Ein lokal erfolgreich geprüfter Vertrag ist noch kein freigegebener Gesamtquellenrelease oder produktiver Consumer.

Der [gebundene lokale Abschluss](../../outputs/ap23k2-2026-10-27/local-completion.json) hält die tatsächlichen Befehle, Logdateien, Prüfsummen, Zählwerte und Freigabegrenzen fest. Sein erneuter Check verlangt die vollständige erwartete Datei- und Berichtsliste, nicht nur die darin zufällig verbliebenen Einträge.

## Tatsächlicher Kandidat

| Bestand | Isolierte Probe |
| --- | ---: |
| Erhaltene Pfade und zugehörige alte Fachobjekte | 149 |
| Neue BS-/BL-Pfade | 16 |
| Pfade und Qualifikationspolicies insgesamt | 165 |
| Erlassfamilien | 20 |
| Stillstandsprofile | 37 |
| Rechtliche Feiertagsbindungen | 30 |
| Neue projizierte Norm-, Praxis- und Vollzugsbelege | 27 |
| Nichtadministrative Artefakte rohbytegleich | 43 |
| Physische Kalender unverändert | 35 |
| Feiertagskatalogregeln unverändert | 499 |
| Regelprojektionen in Kalenderdateien unverändert | 431 |
| Neue physische Kalenderregeln | 0 |
| Getrennte jährliche BL-Ganzschliesstage | 13 |
| Ungeklärter zusätzlicher BL-Endtag | 1 |

Die 499 Katalogregeln bestehen weiterhin aus 479 Grundregeln und 20 Prozessergänzungen. Die 431 Kalenderregeln sind eine andere Projektionsstufe. Die 13 Schliessungsdaten gehören nicht zu einer dieser beiden Feiertagszählungen. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben unverändert. Eine zusätzliche normative Verwendung oder ein neuer Quellenbeleg ist keine zusätzliche Feiertagsregel.

Die [Integritätsliste](../../outputs/ap23k2-candidate-2026-10-27/candidate-integrity.json) bindet die tatsächlichen Kandidatenbytes. Die [Quellenabbildung](../../outputs/ap23k2-candidate-2026-10-27/source-crosswalk.json) enthält Herkunft, Rolle, URL, Fassung, Lesebereich und Rohbytenachweis der 27 verwendeten Belege. Die 69 K1-Evidenzbindungen werden nicht als 69 selbstständige geltende Normen ausgegeben. Metadaten, Zitationsversuche und abgeleitete Textdateien sind keine weiteren produktiven Rechtsquellen.

## Geschlossene Schemata und semantische Identität

Die vier Entwürfe liegen ausschliesslich unter [schemas/candidates/ap23k2](../../schemas/candidates/ap23k2/). Katalog 8 und lokale Manifestvariante 15 akzeptieren den tatsächlichen isolierten Kandidaten. Der freigegebene Manifestzweig akzeptiert ihn nicht als bereits genehmigten Quellenrelease. Die bisherigen Katalog-7- und Manifest-14-Schemata weisen den neuen Stand zurück.

Schemaformen und tatsächliche Kandidaten werden zusätzlich mit dem vorhandenen unveränderten Produkt-SchemaContract geprüft. Eine zunächst verwendete positionale Arraydarstellung wurde im neuen Entwurf durch bereits unterstützte geschlossene Objektvarianten und genaue Jahresvorkommen ersetzt. Dafür wurde kein neues Schlüsselwort im Produktvalidator freigeschaltet. Genau 2026 und 2027 mit den gebundenen Tagesdaten sind erforderlich. Die kanonische Reihenfolge bleibt Teil des semantischen Kandidatenvergleichs.

Die beiden Jahresobjekte, die 26 terminalen Ankerbindungen, die tatsächlichen Kalenderprojektionen, Quellenrollen und Normabschnitte werden nicht nur auf interne Hashkonsistenz geprüft. Der Validator vergleicht sie mit dem aus der eingefrorenen K1-/J3-Grundlage erneut ermittelten exakten Sollbestand. Auch vollständig neu berechnete Pfad-, Eligibility- und Manifestprüfsummen dürfen eine sachlich geänderte Regel nicht legalisieren.

## Referenzen und getrennte Gegenrechnungen

Alle **67 ursprünglichen K1-Fälle** bleiben mit ihren Tatsachen, Auslösern, Dauern und vorgegebenen Erwartungen zugeordnet. Die [Forschungsabbildung](../../outputs/ap23k2-candidate-2026-10-27/research-map.json) und der Node-Nachweis unterscheiden aktuelle Eingabefakten von exakt benannten Forschungsannotationen.

| Prüflane | Umfang und Zweck |
| --- | --- |
| K1-Fälle am neuen Eingabevertrag | 65 Fälle mit 40 Datumserwartungen, 18 Qualifikationsgrenzen, zwei Fasnachts-Ungewissheiten und fünf vollständigen Fenstergrenzen |
| K1-Forschungswelten | Zwei diagnostische Einzelwelten für BL-R17 und BL-R18. Kein operativer regionaler Benutzerentscheid |
| Zusätzliche Node-Synthetik | 46 gezielt benannte technische Proben. Keine weiteren händisch recherchierten Fachfälle |
| Alte native Rechenlane | 149 getrennte synthetische Positivproben mit tatsächlichem Format-14-Reader und bestehendem Produktkern |
| Alte Reader gegen neue Daten | Zwei Zurückweisungen des Format-15-Kandidaten durch die vorhandenen Format-14-Reader |

Die neue Node-Arithmetik ist eine isolierte UTC-Tagesrechnung und importiert keinen Produktrechner. Ein getrennt ausgestellter und tief eingefrorener Probekontext ist erforderlich. Ein JSON-Klon oder frei nachgebautes Metadatenobjekt erhält keine Rechenberechtigung. Export bleibt bei jedem Ergebnis ausgeschaltet. Der bestehende Produktkern dient ausschliesslich der getrennt gezählten alten Rechenlane und den Reader-Gegenproben.

Der [unabhängige Python-Nachweis](../../outputs/ap23k2-2026-10-27/independent-verification.json) verwendet eigene Kalenderprojektion und vollständige Tagesenumeration. Zuerst werden die vorgegebenen statischen Erwartungen ausgewertet. Erst anschliessend werden die neuen Node-Ergebnisse verglichen. Node-Resultate sind nicht der Python-Sollwertgenerator. Der Gegenlauf bestätigt alle 65 Vertragsfälle und zwei diagnostischen Originalwelten ohne Differenz. Hinzu kommen 44 eigene synthetische Fälle, der Vergleich der 46 Node-Synthetikeingaben sowie vier reine SG-Januar- und sieben Kalender-/Formeldiagnosen. Diese teilweise überlappenden Prüflanes werden nicht zu einer Zahl unabhängiger Rechtsfälle addiert.

## Gezielte fachliche Vertragsgegenproben

- BS-Gericht mit BL-Parteianker: Bei einem rechnerischen Ende am 24.12.2026 bleibt dieser Tag zulässig. Die BL-GOG-Büroschliessung wird nicht importiert. Derselbe Auslöser im eigenen BL-Verfahren kann dagegen bis 04.01.2027 verschieben.
- BS-Gericht mit nationalem Anker: Genau eine der 26 terminalen Kantonsbindungen. AI-/NE-Gebietsmerkmale werden aktuell qualifiziert. Fehlende Merkmale, mehrere Kantone, blosser Behördensitz und fremde Schlüssel führen nicht zu einem Ersatzkalender.
- SG: Nur die tatsächlich zugeordnete Berchtoldtagsregel wird variiert. Der reale 02.01.2027 ist Samstag und kann deshalb zu gleichen Enddaten führen. Die Vergleichsprovenienz bleibt erhalten. Reine zusätzliche Kalenderalgorithmus-Diagnostik in anderen Jahren erweitert weder Fallfenster noch Rechtsfreigabe.
- BL: Ein ganzer Schliesstag im Fristinnern unterbricht die Zählung nicht. Bei Ergebnisrelevanz des 09.02.2027 sperrt die ungeklärte Wirkung. Ein eingeschleustes `regionalOfficeMode` wird nicht als regionale Rechtsfreigabe angenommen.
- BS und BL: Anmeldung erzeugt keinen neuen Begründungslauf. Unbewilligte Verlängerung, fehlende aktuelle Fallqualifikation, unklare Eröffnung und ein unvollständig gedeckter Jahreswechsel erhalten kein definitives Ergebnis.

Die physische Datumsprojektion prüft auch die bereits vorhandenen bedingten AR-/AI-Regeln und die Glarner Verschiebung der Näfelser Fahrt. Die beiden Glarner Aprilproben 2026 liegen vor der Kalenderaktivierung am 29.08.2026 und sind ausdrücklich nur Formelinspektionen. Die aktivierungsgebundene Kalenderauflösung gibt diese Tage weiterhin nicht als gedeckte Kalenderdaten aus. Solche Datengegenproben werden nicht als zusätzliche Verwaltungsfallfreigaben ausserhalb des K1-Fensters gezählt.

## Negativprüfungen und Erhaltung

Die Node-Vertragsprobe weist **19 semantische Katalogmutationen nach vollständiger Neuversiegelung** und **109 Eingabe- beziehungsweise Kontextgrenzen** zurück. Dazu gehören entfernte Schliessungstage, ein zum ganzen Tag hochgestufter Halbtag, fremde Januarregeln, gelöschte Gebietserfordernisse, Normlücken und -überlappungen, eine erfundene Ferienperiode, geänderte Quellenrollen sowie vorgetäuschte Vertrags- oder Releasefreigaben. Schema-, Python-, Erhaltungs- und Abschlussprüfungen sind zusätzlich getrennte Tests.

Die zusammengeführte TAP-Datei enthält keine fehlgeschlagenen, abgebrochenen oder übersprungenen Prüfungen. Ihre genaue Zahl steht im lokalen Abschluss. TypeScript wird ausschliesslich mit `--noEmit` geprüft. Das ist kein Produkt- oder Paketbau.

Die [Bestandserhaltung](../../outputs/ap23k2-2026-10-27/preservation-verification.json) bestätigt die **6’612 vor technischen Schreibaktionen eingefrorenen Dateien** sowie die 125 Nutzdateien des autonomen K1-Abnahmearchivs. Der ursprüngliche K1-Finalizer wird nicht gegen später ergänzte Tests und Einstiegstexte ausgeführt. Die gesonderte Abnahmekopie bewahrt genau den tatsächlich abgenommenen damaligen Stand.

## Offene Übergänge

Offen sind Davids technische AP23K2-Abnahme und der ausdrückliche Beschluss von DEC-2026-040. Erst danach kann K3 gesondert beauftragt werden. Die lokale Probe verändert weder die bereits abgenommenen 19 Kantone noch den freigegebenen MVP-0.9-Betrieb. Kein Commit, GitHub-Push, Upload, Installation, Mirrorwechsel oder Eingriff in E/Q/P, AP5, AP21, Hosting oder Berechtigungen.

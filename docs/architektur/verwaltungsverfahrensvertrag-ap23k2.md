# AP23K2 Vertragsprobe und Migration für Basel-Stadt und Basel-Landschaft

Stand: 27. Oktober 2026. Isolierter technischer Vorschlag zur Abnahme. [AP23K1 mit K1-A bis K1-G ist fachlich abgenommen](../fachrecht/abnahme-ap23k1.md). Formatentscheid und native Produktintegration stehen aus. Der [Startauftrag](start-ap23k2.md) begrenzt K2 auf lokale technische Ausarbeitung.

## Ergebnis und erforderlicher Entscheid

Vorgeschlagen sind **Kantonalverfahrenskatalog 8.0.0 sowie Manifest und Mindestconsumer 15.0.0** gemäss [DEC-2026-040](../entscheidungen/DEC-2026-040-dynamische-feiertagsbindung-und-bueroschliesstage-v8.md). Katalog 7 bindet einen festen Feiertagskalender und besitzt keinen Vertrag für jährlich angeordnete ganze Büroschliesstage. Beide Lücken benötigen eine explizite neue Semantik.

Die 16 fachlich abgenommenen Gruppen werden nicht zu 16 zusätzlichen GUI-Feldern. Die beiden zusammengesetzten Erlassfamilien BS mit OG/VRPG und BL mit VwVG/VPO ordnen ihre Pfade nach Verfahren und Handlung. Zwei Spalten, frühe Datumseingabe, statisch «Sitz der zuständigen Stelle» und feste Einzelwerte bleiben erhalten. Die konkrete Oberflächenintegration gehört erst zu K3.

## Vertragslücken und begrenzte Erweiterung

| Gegenstand | Vorhandener Vertrag 7 | Vorschlag 8 |
| --- | --- | --- |
| BS-Gerichtsanker | Fester rechtlicher Kalender mit einer physischen Basis | Eigene ausdrücklich geprüfte Partei-/Vertretungsbindung mit genau einem qualifizierten Kanton und eindeutiger terminaler Variante |
| BL-Ganzschliesstage | Keine eigenständige jährliche Endverschiebungsdatenquelle | Geschlossene quellen- und jahresgebundene Endverschiebungspolicy im Verwaltungskatalog |
| BL-Fasnachtsunsicherheit | Keine konkret variierte zusätzliche Endtagsregel | Automatischer vollständiger Zweiweltenvergleich nur der unsicheren Tageswirkung. Kein Benutzer-Override |
| Aktueller Auslöser | V7-Eröffnungspolicies für die damals freigegebenen Ereignisse | Unverändert datierter, bereits rechtlich qualifizierter aktueller Eröffnungstag. Keine automatische Zustell- oder Folgeereigniskette |
| Nachweis der Auswahl | Hash eines festen Kalenders und bisheriger Policies | Zusätzliche Hashbindung der Kalenderauswahl und jährlichen Endverschiebungspolicy samt tatsächlicher Auflösungsprovenienz |

Dauerarten, gesetzliche Unabänderlichkeit, aktuell angeordnete Tagesdauer, feste Stillstandsprofile, Normabschnitte und vollständige Fensterdeckung werden wiederverwendet. Die Obergrenze von 365 Tagen bei einer angeordneten Tagesdauer ist ein technisches Sicherheitslimit der isolierten Probe und keine Aussage über eine gesetzliche Höchstdauer. Es entsteht kein allgemeiner Regelinterpreter und kein frei konfigurierbarer Feiertagsbaukasten. Historische V1–V7-Definitionen werden nicht gelockert.

## Drei rechtliche Kalenderbindungen

### BS Verwaltung mit festem Sitzanker

Erstverfahren und verwaltungsinterner Rekurs binden den bestehenden BS-Kalender. Die Herleitung bleibt die fachlich abgenommene Sitzbindung nach DEC-2026-031 mangels festgestellter ausdrücklicher Abweichung. Die analoge Endverschiebungspraxis wird nicht zu einer ausdrücklichen OG-Ortskollisionsnorm umetikettiert.

### BS Gericht mit Partei oder Vertretung

Der VwVG-Verweis begründet eine eigene administrative Rechtsbindung. Eingang sind die bereits fachlich verwendeten Tatsachen `legalAnchorQualification: establishedPartyOrRepresentative` und genau ein `legalAnchorCanton`. Daraus wird keine tatsächlich nicht bekannte Vertretungskonstellation erfunden. Eine feinere Rolle ist nicht Voraussetzung, wenn der rechtlich massgebende Anker bereits eindeutig festgestellt ist.

Für die Datumsprojektion werden die 26 vorhandenen kantonalen VwVG-Terminalbindungen mit 28 Varianten und 29 referenzierten Projektionen exakt gebunden. AI und NE benötigen ihre tatsächlichen Gebietsfakten. Die beiden bestehenden zulässigen VwVG-Rollen müssen zum gleichen entsprechenden terminalen Datenzweig führen. Ein erster Treffer oder eine Vereinigung mehrerer Kantone ist unzulässig. Fehlende, mehrdeutige oder falsche Ankerqualifikation sperrt.

**Verwendet werden Feiertagsdaten, nicht das bundesrechtliche VwVG-Rechenprofil.** Die BS-Wege haben keine allgemeinen Gerichtsferien. Ein BL-Parteianker beim BS-Gericht übernimmt deshalb auch keine BL-GOG-Büroschliessungen. Solche Schliessungen beruhen auf dem BL-Verfahrensrecht und gelten nur in dessen neuer rechtlicher Bindung.

Die tatsächlich gebundene Januaralternative wird übernommen. Bei VwVG betrifft dies die SG-Alternative zum 2. Januar. Nicht alle profilübergreifend vorhandenen Januargrenzen werden pauschal auf jedes BS-Verfahren übertragen. GR-/NE-Vorbehalte bleiben von einer ergebnisabhängigen Unsicherheit getrennt. Der 02.01.2027 fällt auf einen Samstag. Ein in diesem Fenster ergebnisgleicher Variantenvergleich beseitigt deshalb weder die Bindung noch ihre Provenienz.

### BL mit jährlicher Endverschiebung

Die dritte Bindung verwendet den bestehenden BL-Rechtsfeiertagskalender und eine getrennte jährliche Policy. Sie enthält die 13 in K1 abgenommenen ganzen Schliessungstage mit Quellen und Jahresdeckung. Die Daten bleiben im Verwaltungskatalog. Manifest und Feiertagskalender erhalten keine zusätzlichen Dateien oder Regeln.

Die Wirkung lautet ausschliesslich **Endverschiebung**. Die Tageszählung im Fristinnern läuft weiter. Ein Halbtag wird nicht zu einem ganzen Schliesstag. Das gesetzliche Kriterium ist die ganze Schliessung der kantonalen Verwaltungsbüros, nicht die persönliche Arbeitsleistung oder tatsächliche Öffnung des Gerichts.

## Ungewisse Endtage ohne neue Benutzerauswahl

Die allgemeine BL-Policy enthält den 09.02.2027 als ungeklärte zusätzliche Endtagswirkung. Zwei vollständige Rechnungen verwenden dieselben Daten, Quellen, Fenster, Dauer und Fallqualifikationen. Nur dieser konkrete Tag wird variiert. Bei unterschiedlichem rechtlichem Resultat gibt es kein definitives Ende und keinen Kalenderexport. Ein Tag im Fristinnern bewirkt keine pauschale Sperre.

`regionalOfficeMode` aus der Forschung ist kein neues operatives Eingabefeld. Weder eine gespeicherte Präferenz noch eine frei behauptete Bestätigung darf die abgenommene ungeklärte Rechtslage positiv auflösen. Die beiden K1-Gegenproben R17 und R18 beschreiben die einzelnen Forschungswelten, keine bereits freigegebenen regionalen Produktwege.

Die Übernahme hält deshalb alle 67 ursprünglichen K1-Erwartungen unverändert fest und trennt **65 Fälle am Eingabevertrag** von **zwei diagnostischen Welt-Gegenproben**. Neue gezielte synthetische Anker- und Mutationsproben werden gesondert gezählt. Sie werden nicht als weitere recherchierte oder menschlich abgenommene Rechtsfälle ausgewiesen.

## Reihenfolge der Prüfung und Provenienz

1. Exakte Katalogidentität, geschlossenen Pfad, Revision, Erlassfamilie, Stadium und aktuelle positive Qualifikation prüfen. Gesetzliche Dauer ist nicht übersteuerbar, angeordnete Dauer wird nicht aus einem Standard erfunden.
2. Eigene V8-Kalenderbindung bestimmen. Fester Stellenanker oder exakt qualifizierter Partei-/Vertretungsanker, keine implizite Ausweichregel. Regionale Variante und tatsächlich gebundene Alternative eindeutig auflösen.
3. Kalender-, Quellen-, Policy- und Eligibilityhashes abgleichen. Gleich aussehende Datumslisten vererben keine Verfahrensberechtigung. Ein neu berechneter Hash macht eine sachlich manipulierte Policy nicht korrekt.
4. Den eingegebenen bereits rechtlich qualifizierten Auslöser unverändert übernehmen. Jeden Normtag, Zähltag und Endverschiebungstag gegen alle anwendbaren Deckungsgrenzen prüfen.
5. Ohne allgemeinen Stillstand zählen. Endverschiebung durch Wochenende, Rechtsfeiertage und nur im BL-Zweig die gebundene jährliche Schliessung vornehmen. Die konkret unsicheren Endtagsvarianten vollständig vergleichen.
6. Tatsächliche Auswahl, Projektion, Varianten, Policyhashes, relevante Quellen und ausgewertete Normabschnitte als erklärende Provenienz führen. Ein Diagnoseobjekt oder eine serialisierte Provenienz ist keine Exportberechtigung.

Anmeldung und Begründung in BS behalten denselben ursprünglichen Eröffnungstag. Eine frühere Berechnung erzeugt keine neue tatsächliche Eröffnung. Beantragte Verlängerung, tatsächlich gewährte neue Tagesfrist und fixer Termin bleiben getrennt. Die BL-Fünftageseinsprache behält ihre aktuellen Zuständigkeits- und Gegenstandsvoraussetzungen.

## Zeit und Quellenbindung

Das vollständige Fenster bleibt **29.08.2026–31.12.2027**. Es umfasst den aktuellen Eröffnungstag, sämtliche Zähltage und jede Endverschiebung. Eine Kette wird am Jahresende weder abgeschnitten noch mit angenommenen 2028-Schliessungen fortgesetzt.

Der BS-Gerichtszweig bindet getrennte VwVG-Normabschnitte bis 31.12.2026 und ab 01.01.2027. Die verwendeten Berechnungsbestimmungen bleiben unverändert, die Fassungsgrenze wird trotzdem als solche nachgewiesen. Der BS-Verwaltungszweig erhält keinen pauschalen VwVG-Import. BL trennt die Jahresvollzugsquellen 2026 und 2027 von den konstanten allgemeinen gesetzlichen Grundlagen.

Ein expliziter Crosswalk projiziert die tatsächlich verwendeten K1-Norm-, Praxis- und Jahresbelege in technische Quellenkennungen. RRB-Auszüge bleiben Auszüge. Metadaten, MCP-Zitationsversuche und abgeleitete Extrakte werden nicht als zusätzliche Normen ausgegeben. Historische Praxis, Analogie und der begrenzte TI-Ankergegenbeleg behalten ihre jeweiligen Verwendungsgrenzen. Es gibt keine neue allgemeine Quellenreleasefreigabe.

## Komponenten und spätere Produktmigration

| Komponente | K2-Vorschlag |
| --- | --- |
| Kantonalverfahrenskatalog | 8.0.0 mit eigenem geschlossenem V8-Zweig |
| Manifest und Mindestconsumer | 15.0.0 |
| Rechtsprofile, Feiertagskatalog, Regelkalender | Formate 1.0.0, 2.0.0, 3.0.0 unverändert |
| Spezialregime- und Sozialverfahrenskatalog | Formate 3.0.0 und 2.0.0 unverändert |
| Persönliche Vorgaben | Version 5 unverändert. Stabile Auswahl getrennt von aktuellen Fallfakten |
| Sozialfreigabe | 44 Regeln und 50 BE-Anbindungen unverändert |
| Historische Formate und AP5 | Unverändert und eigenständig prüfbar |

Die isolierte Probe liegt unter [outputs/ap23k2-candidate-2026-10-27](../../outputs/ap23k2-candidate-2026-10-27/). Ihre Grundlage ist der abgenommene lokale J3-Stand mit 149 Wegen. Die 16 neuen Wege ergeben 165. Alle 43 nichtadministrativen Manifestartefakte bleiben rohbytegleich. Alte Fachobjekte und historische Releasebindungen werden nicht auf einen neuen freigegebenen Quellenstand umetikettiert.

Nach technischer K2-Abnahme und ausdrücklichem Beschluss von DEC-2026-040 kann K3 gesondert starten. Dort folgen nativer Reader und Aktivierungsvalidator, tatsächliche Zielrelease-Neubindung, Kern-/UI-/Hostintegration, geschützte Ergebnisprovenienz und Tests an den tatsächlich gebauten Artefakten. Der gegenwärtige Consumer erhält keine neue Rechenberechtigung aus dieser Strukturprobe.

Ein unbekannter neuer Standardweg muss im Altconsumer als nicht unterstützt erhalten bleiben. Er darf weder gelöscht noch mit BE oder dem ersten verfügbaren Weg ersetzt werden. Aktuelle Eröffnung, Vertretungs-/Gebietsqualifikation, Tagesdatum und Referenz werden nicht zu persönlichen Standards. Keine allgemeine Cache- oder Browserdatenlöschung.

## Schutz und offene Freigaben

Die [K2-Ausgangsbindung](../../outputs/ap23k2-2026-10-27/protected-inputs.json) schützt **6’612 Bestandsdateien**. Die [autonome K1-Abnahmekopie](../../outputs/ap23k1-abnahme-2026-10-27/receipt.json) sichert 125 Nutzdateien einschliesslich des ursprünglichen Abschlussnachweises und der drei expliziten Kalenderbaselines. Die ursprünglichen Vorabnahmeflags bleiben historische Prüfbytes.

Nur neue isolierte Schemata unter `schemas/candidates/ap23k2/`, neue K2-Governance-Tests und sieben lebende Statustexte werden ergänzt. Keine nativen Schemaänderungen, keine Produktquelle oder alte Datenbytes ändern. Die [technische Prüfung](verwaltungsverfahrensvertrag-ap23k2-pruefung.md) bindet die tatsächlichen Ergebnisse gesondert.

Offen bleiben technische K2-Abnahme und DEC-2026-040. K3 ist nicht gestartet. Keine Produktbauten, Commits, GitHub-Änderungen, Quellenpromotion, Uploads, Installation oder Änderungen an E/Q/P, Mirrors, AP5, AP21, Hosting oder Berechtigungen. Der nächste reguläre Release bleibt gebündelt. David nimmt die menschlichen Abnahmerollen in Personalunion wahr. KI-Arbeitsteilung ersetzt diese Freigabe nicht.

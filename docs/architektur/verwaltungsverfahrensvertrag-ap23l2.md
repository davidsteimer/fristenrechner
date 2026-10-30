# AP23L2 Vertragsprobe und Migration für Appenzell Innerrhoden und Schwyz

Stand: 27. Oktober 2026. **Isolierter technischer Vorschlag zur Abnahme.** [AP23L1 ist einschliesslich L1 A bis L1 G fachlich abgenommen](../fachrecht/abnahme-ap23l1.md). Der [Startauftrag](start-ap23l2.md) umfasst Vertragsprüfung und lokalen Referenzkandidaten, keine Produktintegration.

## Ergebnis und erforderlicher Entscheid

Vorgeschlagen sind **Kantonalverfahrenskatalog 9.0.0 sowie Manifest und Mindestconsumer 16.0.0** gemäss [DEC-2026-041](../entscheidungen/DEC-2026-041-qualifizierte-eroeffnung-und-fristdauer-v9.md). Der bestehende Vertrag 8/15 kann die qualifizierte AI-Trackingöffnung und die an eine wirksame aktuelle Belehrung gebundene längere Tagesdauer nicht unverfälscht darstellen. Ihn nur mit neuen Kennungen zu befüllen, würde neue Bedeutung unter einem alten Vertrag verstecken.

Der isolierte Kandidat ergänzt **31 Pfade, 18 für AI und 13 für SZ**, zu den 165 unveränderten Bestandswegen. Die 31 Gruppen sind keine Vorgabe für 31 GUI-Felder. Die tatsächliche Oberfläche gehört erst zu L3. Zwei Spalten, frühe Datumseingabe, statisch «Sitz der zuständigen Stelle», feste Einzelwerte und zurückhaltende DE-/FR-Texte bleiben verbindlich.

## Geschlossene Erweiterungen

| Gegenstand | Bestehender Vertrag 8 | Vorschlag 9 |
| --- | --- | --- |
| AI-Eröffnung | Bereits rechtlich qualifizierter Tag ohne Transformation | Geschlossene Alternative zwischen unveränderter rechtlicher Eröffnung und bedingt normalisiertem physischem Trackingempfang |
| AI-Belehrungsdauer | Gesetzliche oder konkret angeordnete Tagesdauer | Eigene Dauerart mit aktueller wirksamer Belehrungsdauer, aktueller ordentlicher Basis und striktem Überschreiten beider Schwellen |
| SZ-Einsprache | Allgemeine aktuell angeordnete Tagesdauer | Eigene begrenzte Policy mit tatsächlicher Ansetzung von einem bis zehn Tagen, kein automatischer Zehntageswert |
| SZ-Martinstag | Fester kantonaler Kalender oder separate jährliche Büroschliessung | Eigene quellen-, orts- und fenstergebundene Verfahrens-Ergänzung mit ausschliesslicher Endverschiebung |
| Eligibility | Bindung der bisherigen Pfad-, Qualifikations- und Kalenderauswahl | Zusätzlich ausdrückliche Bindung von Dauerpolicy und Verfahrens-Kalenderergänzung |

Es entsteht weder eine allgemeine Ausdruckssprache noch ein frei konfigurierbarer Kalenderbaukasten. Die historischen Definitionen V1–V8 werden nicht gelockert. Die Winterstillstandsprofile verwenden den vorhandenen Periodentyp, AI bis 2. Januar und SZ bis 7. Januar. Dafür ist kein neuer Regelkalendertyp nötig.

## AI: physischer Eingang, rechtliche Eröffnung und Fristbeginn

Eine bereits rechtlich qualifizierte Eröffnung wird unverändert übernommen. Ein Samstag löst dabei **keine zweite Zustellverschiebung** aus. Nur die ausdrücklich qualifizierte Trackingsendung nach der abgenommenen L1-Bindung erhält die Transformation auf den nächsten Werktag bei Eingang am Samstag, Sonntag oder gebundenen Feiertag.

Diese Transformation verlangt drei aktuelle zusätzliche Tatsachen: erwartbare Zustellung, verifizierter Eingang in der Machtsphäre und dasselbe bestätigte Empfangsfeiertagsregime wie beim gebundenen Stellensitz. Andere oder ungeklärte Empfangsorte werden nicht durch einen frei gewählten Parteienkalender ersetzt. Für mündliche Eröffnung und den qualifizierten Kenntnistag der Rechtsverweigerung ist Tracking ausdrücklich ausgeschlossen.

Normalisierung der Eröffnung und Stillstand der Tageszählung sind getrennt. Eine am 28. Dezember rechtlich eröffnete gerichtliche Frist beginnt nicht erst durch eine erfundene Eröffnung im Januar. Die Eröffnung bleibt am 28. Dezember, die Zählung setzt die anwendbaren Ferientage aus. Herkunftsnachweise führen physischen Eingabetag, rechtliche Eröffnung, ordentlichen Folgetag und ersten tatsächlich gezählten Tag getrennt.

## AI: qualifizierte Belehrungsfolgen

Die positiven längeren Belehrungswege verlangen eine aktuelle wirksame Tagesangabe **oberhalb der ordentlichen Frist und oberhalb von 30 Tagen**. Die eingegebene Dauer muss mit der aktuell qualifizierten Belehrungsdauer übereinstimmen. Die ordentliche Basis wird aktuell bestimmt und nicht aus einer früheren Rechnung geraten. Bei Rekursen sind die vorgesehenen Basen zehn oder 30 Tage, bei den gerichtlichen Belehrungswegen sieben oder 30 Tage.

Eine Angabe von 15 statt zehn Tagen bleibt wegen AI-O3 ausserhalb dieser positiven längeren Wege. Es wird weder stillschweigend 15 noch 30 noch das Maximum gewählt. Die getrennten Dreissigtages-Mangelwege behalten ihre eigene Qualifikation. Die technische Obergrenze von 365 Tagen ist ein Sicherheitslimit der Probe und **keine gesetzliche Höchstdauer**. Bei der SZ-Einsprache ist zehn dagegen die fachlich bestätigte gesetzliche Grenze der konkreten Ansetzung.

## Kalender und Schwyzer Ortsbindung

AI bindet den vorhandenen inneren Kalender `ap22-ai-f507435d8aa8` mit St. Mauritius am 22. September. SZ bindet den vorhandenen Kalender `ap22-sz-ec9f2c557fe4` und eine separate administrative Ergänzung für aktuell als **Gemeinde Schwyz** qualifizierte Stellensitze.

Die Ergänzung enthält genau **11.11.2026 und 11.11.2027**, jeweils Martinstag, mit Quellenbindung und vollständigem Anwendungsfenster. Sie wirkt ausschliesslich auf das Ende. Ein Martinstag im Fristinnern unterbricht die Zählung nicht. Es werden weder zusätzliche Kalenderdateien noch neue Regeln im Feiertagskatalog erzeugt. Die 35 physischen Kalender und 499 Katalogregeln bleiben unverändert, einschliesslich ihrer bundesrechtlichen Verfahrensbindungen.

Der Gemeindesitz ist eine aktuelle rechtliche Qualifikation der zuständigen Stelle. Er wird nicht aus dem Kantonskürzel, einer Postadresse oder einem gespeicherten Standard erfunden. Andere oder ungeklärte SZ-Sitze bleiben SZ-O1. Der Einbezug örtlicher Tage beruht auf der kantonalen Rechtsbindung, nicht auf einer neu aufgenommenen eigenständigen kommunalen Verfahrensordnung.

Normale physische Einreichung und die aktuell bestätigte gewöhnliche Postbenutzung bleiben Fallvoraussetzungen. Die Probe beantwortet weder eine ausserordentliche Poststörung noch die Zulässigkeit eines elektronischen Kanals oder dessen Plattformausfall. Eine berechnete Endverschiebung ist kein Nachweis der tatsächlich rechtzeitigen Einreichung.

## Zeit, Kollisionen und Quellen

Das vollständige Fenster bleibt **29.08.2026–31.12.2027**. Physischer Auslöser, normalisierte Eröffnung, jeder Zähltag und sämtliche Endverschiebungstage müssen von Pfad, Quellen-, Kalender- und Freigabefenstern gedeckt sein. Ein nach 2027 reichendes Ergebnis wird nicht abgeschnitten oder durch angenommenes Folgerecht fortgesetzt.

Die Schwyzer Normzeitachse trennt die Phase bis 30.06.2027 von jener ab 01.07.2027. Die ReVVGer-Fassungsänderung verändert die verwendete Tageszählung nicht, bleibt aber als tatsächlich ausgewerteter Normabschnitt sichtbar. Die gesetzliche Inkraftsetzung am 01.07.2026 wird nicht mit dem Editionsvermerk Februar 2027 verwechselt.

Führt erst die reguläre Endverschiebung in einen neu beginnenden anwendbaren Stillstand, bleibt die abgenommene Kollisionsgrenze erhalten: **kein definitives Ende und kein Kalenderexport**. Es gibt kein pauschales Sperren aller Ferienfälle und kein ungeprüftes Weiterzählen bis Ferienende. AI-O1, AI-O3 und SZ-O1 bleiben ebenfalls begrenzt. Technische Übereinstimmung entscheidet keine offene Rechtsauslegung.

Ein [Quellen-Crosswalk](../../outputs/ap23l2-candidate-2026-10-27/source-crosswalk.json) erhält alle **31 L1-Belegdateien** mit ihren Rollen. Daraus entstehen **17 technische Quellenzeilen, acht AI und neun SZ**, insgesamt 129. Register, API-Volltext, abgeleiteter Extrakt, Normkopie, Änderungserlass und Praxisbeleg werden nicht gleichgesetzt oder als zusätzliche positive Rechtsfreigaben ausgegeben. L1-Abnahme und technische Quellenprojektion ersetzen keine spätere Quellenreleaseprüfung.

## Tatsächlicher Kandidat und Bestandsschutz

| Bestand | Ergebnis der isolierten Probe |
| --- | --- |
| Administrative Pfade | 165 unverändert erhalten und 31 neu, insgesamt 196 |
| Erlassfamilien / Stillstandsprofile / Feiertagsbindungen | 22 / 41 / 32 |
| Manifestartefakte | 44, davon 43 nichtadministrative Dateien rohbytegleich |
| Kalender / Katalogregeln | 35 / 499 unverändert, keine zusätzlichen physischen Regeln |
| SZ-Verfahrens-Ergänzung | Zwei getrennte Endverschiebungsdaten, nicht Teil der 499 Regeln |
| Sozialbestand | 44 Regeln und 50 BE-Anbindungen unverändert |
| Schemata | Vier neue isolierte Schemata, keine Änderung nativer Schemata |

Der Kandidat liegt unter [outputs/ap23l2-candidate-2026-10-27](../../outputs/ap23l2-candidate-2026-10-27/). Alle bisherigen Pfade, Qualifikationspolicies und Eligibilityobjekte sowie die früheren Erlass-, Quellen-, Profil- und Kalenderbindungsobjekte bleiben erhalten. Der neue Referenzrelease ist kein freigegebener Datenrelease. Alte Quellenbindungen werden nicht auf eine angeblich neue Freigabe umetikettiert.

Der lokale Node-Consumer interpretiert die tatsächlichen neuen Pfade und Kalenderbytes. Eine unabhängige Python-Implementierung berechnet dieselben Fälle ohne Import des Produktrechners, des Node-Consumers oder der L1-Rechenimplementierung. Der unveränderte native Produktrechner wird gesondert für die 165 bisherigen Fälle geprüft. Diese drei Spuren sind getrennt und ersetzen einander nicht.

Die Prüfbytes sind an die interne, aus den gesicherten L1-/K3-Grundlagen neu erzeugte Sollprojektion gebunden. Selbst neu berechnete Inhalts- und Eligibilityhashes dürfen eine sachlich veränderte Tracking-, Dauer-, Orts- oder Ferienpolicy nicht legitimieren. Ein serialisiertes Diagnoseobjekt erhält keine Rechen- oder Exportberechtigung.

## Migration und L3-Auftrag

Rechtsprofile 1, Feiertagskatalog 2, Regelkalender 3, Spezialregimekatalog 3 und Sozialverfahrenskatalog 2 bleiben als Formate unverändert. Persönliche Standards bleiben **Version 5**. Stabile Kantons-, Erlass- und Verfahrensauswahl kann künftig übernommen werden. Aktuelle Eröffnung, Referenz, Trackingvoraussetzungen, Ortsqualifikation, Belehrungswirksamkeit und tatsächlich angeordnete oder länger belehrte Dauer dürfen nicht als bestätigte Fallfakten gespeichert oder wiederhergestellt werden.

Ein alter Consumer muss einen unbekannten neuen Standardpfad als nicht unterstützt erhalten. Er darf ihn weder löschen noch durch Bern oder den ersten verfügbaren Pfad ersetzen. Cache und Provider bleiben an die tatsächlich konfigurierte Datenquelle gebunden. Es ist kein Browserdatenreset vorgesehen.

Erst nach technischer L2-Abnahme und ausdrücklichem Formatentscheid kann L3 gesondert beauftragt werden. Dort folgen nativer Reader und Aktivierungsvalidator für Format 16, tatsächliche Zielrelease-Neubindung, native Rechen- und UI-Integration, aktuelle Tatsachenführung, geschützte Exportprovenienz, Standardsprüfung sowie reale Web-/SPFx-Artefakte und Hosttests. Die isolierte Referenzimplementierung ist kein ungeprüft übernehmbarer allgemeiner Produktreader. Insbesondere ist die spätere Behandlung zeitlich wechselnder einzelner Kalenderregeln taggenau zu implementieren, nicht als pauschale Schnittmenge sämtlicher Regelgültigkeiten.

## Sicherung und Freigabegrenze

Die [separate L1-Abnahme](../fachrecht/abnahme-ap23l1.md) sichert 66 Nutzdateien mit 11’332’014 Bytes. Originale Vorabnahmeflags bleiben historische Bytes. Die [L2-Ausgangsbindung](../../outputs/ap23l2-2026-10-27/protected-inputs.json) schützt **9’048 Bestandsdateien**. Die [technische Prüfung](verwaltungsverfahrensvertrag-ap23l2-pruefung.md) und der [gebundene Abschlussnachweis](../../outputs/ap23l2-2026-10-27/local-completion.json) dokumentieren den tatsächlichen Stand.

Offen sind menschliche technische L2-Abnahme und DEC-2026-041. L3 ist nicht gestartet. Keine Produktbauten, Commits, GitHub-Änderungen, Quellenpromotion, Uploads, Installation oder Änderungen an E/Q/P, Mirrors, AP5, AP21, Hosting oder Berechtigungen. Der gebündelte Releaseentscheid bleibt bestehen. David nimmt die menschlichen Abnahmerollen in Personalunion wahr. KI-Arbeitsteilung ersetzt diese Freigabe nicht.

# AP23B Fachmodell für Tessin und Graubünden

V0.1 vom 12. Oktober 2026. **Fachvorlage zur Prüfung, noch nicht abgenommen.** Auftrag: [#48](https://github.com/davidsteimer/fristenrechner/issues/48), nach der [AP23A-Abnahme](abnahme-ap23a.md) ausdrücklich gestartet. Ein wesentliches Arbeitspaket mit höchstens fünf Nettoarbeitstagen. David Steimer entscheidet und nimmt ab, Codex bereitet als KI-Arbeitsinstrument vor.

## Ergebnis und Abnahmegegenstand

Die erste Tranche lässt sich mit **fünf Tessiner und sieben Bündner Pfadgruppen** fachlich beschreiben. Nidwalden liefert fünf zusätzliche Modellgruppen ausschliesslich als Kontrastprobe. Die gemeinsame Tageszählung bleibt nutzbar. Verfahrensstufe, konkrete Handlung und Ausnahme müssen jedoch ausdrücklich an Stillstand und Kalender gebunden werden. Ein globales «Gerichtsferien ja/nein» genügt nicht.

Zur Prüfung liegen vor:

- die nachstehenden Pfadgruppen, Anwendungsgrenzen und Vorschläge zur Behandlung der offenen Punkte
- der [Quellen- und Fassungsnachweis](quellenpruefung-ap23b.md), einschliesslich einer Korrektur zum Tessiner AP23A-PDF
- [33 nachvollziehbare Referenzfälle](referenzfaelle-ap23b.md), davon 32 mit Datumssollwert und einer bewusst ohne definitives Enddatum
- ein unabhängiger [Referenzchecker](../../scripts/check-ap23b-references.mjs) mit 14 zusätzlichen negativen Eingabeproben und [Prüfbericht](../../outputs/ap23b-2026-10-12/QA-AP23B.json)

**Keine operative Freigabe:** Die Vorlage aktiviert keine neuen Kantone oder Sozialanbindungen und ändert weder Produktcode noch freigegebene Rechtsdaten. Die Pfad-IDs sind Forschungsidentitäten, noch kein beschlossener Produktvertrag. Formatversionen und Migration gehören erst in AP23C.

## Gemeinsamer Fallrahmen

Positive Referenzen setzen einen qualifizierten allgemeinen Verwaltungsrechtsweg vor einer **kantonalen Stelle** voraus. Die zuständige Zielinstanz ist bekannt. Die rechtlich massgebende tatsächliche Zustellung ist geklärt, die Frist ist in Tagen bestimmt. Abweichendes Bundes- oder kantonales Spezialrecht, Erstreckung und Wiederherstellung sind ausgeschlossen. Bei einer behördlichen Frist ist weder ein abweichender Beginn noch ein fester Endtermin angeordnet.

Die Zulässigkeit eines Rechtsmittels wird nicht aus einer Fristzahl abgeleitet. Der Rechner soll insbesondere nicht selbst entscheiden, ob ein Zwischenentscheid anfechtbar ist. Für die Referenzfälle ist diese Qualifikation ausdrücklich vorausgesetzt. Fehlende Falltatsachen dürfen weder durch Standards noch durch einen ersten passenden Pfad ersetzt werden.

Monats- und Jahresfristen, Fixtermine, Publikations- und Kenntnisauslöser, Zustellfiktionen, unklare Rechtsmittelbelehrungen, materielle Verwirkungsfristen sowie elektronische Zustell- und Übermittlungsprobleme sind nicht positiv modelliert. Eigenständiges kommunales Recht bleibt ausgeschlossen. Regionale und kommunale Verfahren werden durch diesen Pilot ebenfalls nicht freigegeben. Sozial-, Steuer-, Beschaffungs- und politische Spezialverfahren erhalten keine Freigabe über das allgemeine Profil.

Die Tageszählung beginnt grundsätzlich am Folgetag. Samstage, Sonntage und Feiertage innerhalb der laufenden Frist zählen mit, soweit kein Stillstand greift. Erst der letzte Tag wird nach der einschlägigen Endtagsregel verschoben. Bei Eröffnung während eines Stillstands zählt der erste Tag nach dessen Ende bereits mit, auch wenn es ein Sonntag ist. Die Belege und der noch ungeklärte Sonderfall der Endverschiebung **in** einen Stillstand sind unten getrennt ausgewiesen.

## Tessin

Grundlage ist die [LPAmm, RL 165.100, aktuelle PDF-Fassung vom 1. Juni 2025](https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/pdfatto/atto/11221). Art. 1 enthält den allgemeinen Geltungsbereich und seine Vorbehalte. Art. 13–16 regeln Zählung, Endverschiebung, Fristarten und Stillstand. Die drei Stillstandsperioden sind Ostern minus sieben bis plus sieben Tage, 15. Juli bis 15. August und 18. Dezember bis 2. Januar, jeweils einschliesslich.

| Forschungs-ID | Konkreter Weg | Dauer | Stillstand und Grundlage |
| --- | --- | --- | --- |
| TI-80-30 | Ordentlicher Ricorso an den Consiglio di Stato, Zuständigkeit nach Art. 80 qualifiziert | 30 Tage | Drei Perioden, Art. 16 und 68 Abs. 1 |
| TI-84-30 | Ordentlicher Ricorso an das Tribunale cantonale amministrativo, Zuständigkeit nach Art. 84 qualifiziert | 30 Tage | Drei Perioden, Art. 16 und 68 Abs. 1 |
| TI-REPLY | Konkret angeordnete Antwort, Replik oder Duplik im gewöhnlichen Rechtsmittelverfahren, insbesondere Art. 73/75 | Angeordnete Tage | Drei Perioden, Art. 16 Abs. 1 |
| TI-PROVISIONAL-15 | Rechtsmittel gegen eine rechtlich als solche bestimmte vorsorgliche Massnahme | 15 Tage | Kein Stillstand, Art. 16 Abs. 3 und 68 Abs. 2 |
| TI-ADVANCE | Zahlung eines Prozesskostenvorschusses nach Art. 47 Abs. 3 oder vor Verwaltungsgericht nach Abs. 4 | Angeordnete Tage | Kein Stillstand, Art. 47 Abs. 3/4 |

Beweiskostenvorschüsse nach Art. 47 Abs. 5 werden **nicht** mit TI-ADVANCE gleichgesetzt. Beliebige erstinstanzliche Anordnungen sind ebenfalls nicht automatisch TI-REPLY. Für eine spätere Erweiterung sind unter anderem die Ausnahme in Art. 1 Abs. 3 und die konkrete Verfahrenshandlung zu qualifizieren. Ein Weiterzug nach einer neuen Entscheidung erzeugt eine neue Frist, nicht einen zusätzlichen Abschnitt derselben Frist.

Der Ausschluss des Ferienunterbruchs für Vorschüsse vor Verwaltungsgericht ist durch [BGer 2C_422/2019 vom 28. Mai 2019, E. 2.3–2.5](https://entscheidsuche.ch/docs/CH_BGer/CH_BGer_002_2C-422-2019_2019-05-28.html) bestätigt. Die Kombination «15 Tage und kein Stillstand» bei vorsorglichen Massnahmen wird im [Entscheid 52.2025.281 vom 13. August 2025](https://entscheidsuche.ch/docs/TI_Gerichte/TI_TCA_001_52-2025-281_2025-08-13.html) angewendet. Die dort betroffenen Sachgebiete werden damit nicht pauschal in das Produkt aufgenommen.

### Feiertagsbindung und zwei offene Grenzen

Art. 13 Abs. 3 knüpft an offiziell anerkannte Feiertage an. Die [Tessiner Feiertagsnorm, RL 843.200, Art. 1](https://www3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/568) nennt 15 Tage. Sie ist nicht auf die engere arbeitsrechtliche Liste sonntagsgleicher Tage zu reduzieren. Karfreitag gehört nicht zu dieser offiziellen Liste. Die vorhandenen 15 Kalenderregeln können technisch wiederverwendet werden, ihre neue Verfahrensbindung muss gesondert erfolgen.

**TI-O1, ausserkantonale Orte:** Die geprüften Normen und Materialien bestimmen die Wahl zwischen Behörde, Partei und Vertretung nicht ausdrücklich. Die 12 Referenzfälle setzen deshalb übereinstimmende relevante Orte im Tessin voraus. Vorschlag zur Fachabnahme: zunächst nur diese eindeutige Konstellation als positiven Kandidaten behandeln. Gemischte oder unklare Orte bleiben gesperrt, bis die Rollenfrage geklärt ist. Das ist eine vorgeschlagene Produktgrenze, keine Behauptung einer gesetzlichen Wohnsitzvoraussetzung. Sie ist noch nicht beschlossen oder als GUI-Feld umgesetzt.

**TI-O2, Endverschiebung in neu beginnenden Stillstand:** Zustellung am 17. Februar 2027 und 30 Tage ergeben als letzten gezählten Tag den 19. März. Dieser ist Josefstag. Nach dem Wochenende läge der nächste gewöhnliche Werktag am 22. März bereits im Osterstillstand vom 21. März bis 4. April. Die gesichteten Quellen klären die Reihenfolge dieser beiden Effekte nicht hinreichend. Vorschlag: betroffene neue Kandidatenfälle ohne definitives Enddatum und ohne Export sperren. Weder 22. März noch ein späterer Termin wird als ungeprüfter Sollwert festgelegt. TI12 prüft genau diese Sperre. Bei einem vorsorglichen Verfahren ohne Stillstand ist der 22. März dagegen ein belegbarer Sollwert, siehe TI06.

### Fristwahrung

Art. 10 Abs. 1 und 13 Abs. 4 unterscheiden die unterschriebene Eingabe an Behörde, schweizerische Post oder schweizerische diplomatische beziehungsweise konsularische Vertretung. Postaufgabe muss vor Mitternacht des letzten Tages erfolgen. Art. 6 schützt die rechtzeitige Einreichung bei unzuständiger Behörde. Für Zahlungen gilt Art. 13 Abs. 5, namentlich rechtzeitige Einzahlung bei der Schweizerischen Post oder Kontobelastung zugunsten der Behörde. Das blosse Erteilen eines Zahlungsauftrags ist kein gleichwertiger Nachweis.

Elektronische Kommunikation ist gesetzlich vorgesehen. Die automatische Prüfung ihrer Voraussetzungen ist nicht Teil dieses Pilots. Eine gewöhnliche E-Mail darf nicht allein aufgrund des errechneten Tages als fristwahrend bezeichnet werden.

## Graubünden

Grundlage ist das [VRG, BR 370.100, Fassung vom 1. Januar 2025](https://www.gr-lex.gr.ch/api/de/versions/3521/pdf_file). Die in AP23A geklärte Trennung bleibt bestehen: Art. 39 betrifft das gerichtliche Verfahren, einschliesslich der gesetzlichen Frist für den Weiterzug an das Obergericht. Die Herkunft des Ausgangsentscheids aus der Verwaltung bestimmt den Stillstand nicht allein.

| Forschungs-ID | Konkreter Weg | Dauer | Stillstand |
| --- | --- | --- | --- |
| GR-32-30 | Verwaltungsbeschwerde nach Art. 28 und 32 Abs. 1, zulässiger verwaltungsinterner Weg qualifiziert | 30 Tage | Kein allgemeiner Stillstand nach VRG |
| GR-32-10 | Verwaltungsinterne Anfechtung einer verfahrensleitenden Anordnung oder vorsorglichen Massnahme, Art. 29 und 32 Abs. 2 | 10 Tage | Kein allgemeiner Stillstand nach VRG |
| GR-ADMIN-ORDERED | Konkrete behördliche Tagesfrist im erstinstanzlichen kantonalen oder verwaltungsinternen Beschwerdeverfahren | Angeordnete Tage | Kein allgemeiner Stillstand nach VRG |
| GR-52-30 | Beschwerde an das Obergericht, Art. 49 und 52 Abs. 1 | 30 Tage | Drei Perioden gemäss Art. 39 |
| GR-52-10 | Anfechtung einer verfahrensleitenden Anordnung oder vorsorglichen Massnahme an das Obergericht, Art. 49 Abs. 4 und 52 Abs. 2 | 10 Tage | Grundsätzlich drei Perioden |
| GR-42-10 | Prozessbeschwerde innerhalb des gerichtlichen Verfahrens gegen vorsorgliche oder prozessleitende Verfügung, Art. 42 | 10 Tage | Grundsätzlich drei Perioden |
| GR-COURT-ORDERED | Konkret gerichtlich angesetzte Tagesfrist, etwa Stellungnahme | Angeordnete Tage | Grundsätzlich drei Perioden |

Der verwaltungsinterne Weg ist nach Art. 28 Abs. 2 ausgeschlossen, wenn Einsprache oder direkte Gerichtsbeschwerde vorgesehen ist. Eine Zehntagesfrist oder das Wort «vorsorglich» beseitigt den gerichtlichen Stillstand **nicht automatisch**. Art. 39 Abs. 2 verlangt eine besondere Dringlichkeitsverfügung der Instruktionsperson oder eine abweichende gesetzliche Regelung. Die Dringlichkeitsverfügung ist in GR12 eine ausdrücklich feststehende Tatsache. Spezialrechtliche Ausnahmen bleiben ausserhalb dieser allgemeinen Kandidatenpfade.

Der [Entscheid U 16 15 vom 18. Februar 2016, E. 3a](https://entscheidsuche.ch/docs/GR_Gerichte/GR_VG_001_U-2016-15_2016-02-18.pdf) bestätigt den ersten zählenden Tag unmittelbar nach dem Weihnachtsstillstand, dort einen Sonntag. Der [Entscheid SK2 10 7 vom 3. März 2010, E. 2c/bb](https://entscheidsuche.ch/docs/GR_Gerichte/GR_KG_005_SK2-2010-7_2010-03-03.pdf) belegt die systematische Trennung der Verfahrensstufen. Sein historischer strafprozessualer Kontext wird nicht als heutiger Sachgebietsweg übernommen.

### Neue tragende Klärung der Feiertagsbindung

Zu Art. 7 erläutert die [amtliche Botschaft vom 30. Mai 2006, gedruckte S. 540, PDF-Seite 92](https://www.gr.ch/Botschaften/2006/6-2006.pdf#page=92), dass kommunale Feiertage nur vor den entsprechenden Gemeindebehörden gelten. Art. 7 Abs. 2 ist gegenüber dem dortigen Entwurf unverändert. Die aktuelle Änderungstabelle weist bei Art. 7 lediglich die spätere Ergänzung von Abs. 1bis aus.

Daraus wird für die **neuen allgemeinen VRG-Wege vor kantonalen Verwaltungsbehörden und Obergericht** die Bindung an den kantonalen Katalog abgeleitet. Eine zusätzliche Wohnsitz- oder Vertreteranknüpfung aus Bundesprozessrecht wird nicht übernommen. Dies ist eine norm- und materialiengestützte fachliche Ableitung zur Abnahme, keine universelle Aussage zu sämtlichen Bündner Verfahren.

Der Katalog folgt [Art. 2 Ruhetagsgesetz](https://www.gr-lex.gr.ch/api/de/versions/2604/pdf_file) und dem Bundesfeiertag. Der 2. Januar und Fronleichnam sind keine zusätzlichen kantonsweiten Feiertage dieser Liste. Örtliche Feiertage nach Art. 3 werden nicht aus dem Rechtsbestand gelöscht. Sie bleiben für andere Wege relevant. Die früheren begrenzten GR-Bundesprofilfreigaben und ihre Hinweise werden durch diese neue VRG-Prüfung nicht rückwirkend geändert.

### Fristwahrung

Art. 8 Abs. 1 unterscheidet Übergabe an schweizerische Post, diplomatische oder konsularische Vertretung und Übergabe an die zuständige Behörde **innerhalb deren Bürozeit**. Abs. 2 schützt die rechtzeitige Einreichung bei unzuständiger Behörde. Zahlungen nach Abs. 3 und elektronischer Verkehr nach Art. 8a haben eigene Voraussetzungen. Der Rechner bestätigt keinen individuellen Übermittlungs- oder Zahlungsnachweis. Erstreckung nach Art. 9 wird nicht automatisch hinzugerechnet.

## Nidwalden als Kontrastprobe

Die [aktuelle VRG-Fassung, NG 265.1, vom 1. August 2026](https://gesetze.nw.ch/api/de/versions/1519/pdf_file) belegt in Art. 33a drei unterschiedliche Modelle:

| Forschungsgruppe | Stillstand | Abgrenzung |
| --- | --- | --- |
| NW-ADMIN | Keiner | Allgemeines Verfahren ausserhalb der bezeichneten besonderen Verfahrensarten |
| NW-EINWENDUNG-REPLY | Nur 18. Dezember bis 2. Januar | Stellungnahmefrist im Einwendungsverfahren. Keine gesetzliche Einwendungsfrist von 20 Tagen erfunden |
| NW-EINSPRACHE-20 | Drei Perioden | Einsprache, 20 Tage aus Art. 64 Abs. 1 in Verbindung mit Art. 71 Abs. 1, sofern kein abweichendes Spezialrecht |
| NW-APPEAL-20 | Drei Perioden | Ordentliche Verwaltungs- beziehungsweise Verwaltungsgerichtsbeschwerde, Art. 71/81/89 |
| NW-SCHOOL-REPLY | Keiner | Ausdrücklich qualifizierte Ausnahme Schulaufnahme im Rechtsmittelverfahren, behördliche Stellungnahmefrist |

Art. 33a Abs. 3 enthält weitere Ausnahmen, darunter vorsorgliche Massnahmen, bezeichnete Sachgebiete und einvernehmliche Fristansetzungen. Diese werden nicht durch ein unbestimmtes «dringlich» ersetzt. Einwendung gegen ein noch zu behandelndes Vorhaben und Einsprache gegen einen bereits erlassenen Entscheid sind nicht dasselbe.

Art. 34 Abs. 2 ergänzt öffentliche Ruhetage um prozessuale arbeitsfreie Tage, insbesondere den 2. Januar, Ostermontag, Pfingstmontag und Stefanstag. Diese Ergänzungen fehlen im vorhandenen allgemeinen NW-Ruhetagskalender der Bundesprofile. Sie benötigen bei einer späteren NW-Aufnahme eine **eigene Verfahrensbindung**, keine globale Erweiterung des alten Kalenders.

NW01 wird auf die gesondert gelesene [Fassung vom 1. Januar 2026](https://gesetze.nw.ch/api/de/versions/1438/pdf_file) gestützt. Alle NW-Proben setzen voraus, dass kein zusätzlicher örtlich massgeblicher Ruhetag am ermittelten Ende liegt. Die örtliche Bindung nach dem Ruhetagsgesetz bleibt ungeklärt. NW ist daher weder dritte Umsetzungstranche noch operativ freigabereif.

## Anforderungen an AP23C und die spätere Oberfläche

1. Kanton, anwendbares Verfahren, Zielinstanz, Handlung, Fristart und Ausnahme getrennt identifizieren. Ausgangsbehörde und zuständige Rechtsmittelinstanz nicht verwechseln.
2. Keine automatische Standardfrist für eine unqualifizierte Handlung. Die Referenzen kennen feste 30/15/10/20 Tage oder eine tatsächlich angeordnete Tageszahl. Ob das GUI eine Zahl vorfüllt, ist ein späterer Bedienentscheid.
3. Stillstandsmenge explizit binden. Der bestehende Kern unterstützt bedingte Stillstandsregeln und mehrere Sets grundsätzlich bereits. Die neuen konkreten Profile und ihre eindeutige Auswahl sind jedoch nicht implementiert oder integrationsgeprüft.
4. Kalenderbindung und verfahrensbezogene Ergänzungen von der unveränderten Feiertagsgrundlage trennen. GR braucht keine erfundene Bundes-Wohnsitzrolle. TI erhält keine stillschweigende Rollenentscheidung. NW darf nicht global zusätzliche Feiertage in Bundesprofile einführen.
5. Normfassung, Kalendertag, Gebietsstand und Releasefreigabe getrennt zeitlich begrenzen. Historische Fälle und zukünftige Normfortgeltung sind keine unbegrenzte Produktfreigabe.
6. Den Sonderfall einer Endverschiebung in neu beginnenden Stillstand erkennen und nach dem noch zu treffenden Fachentscheid behandeln. Der aktuelle Kern verschiebt nach der Zählung nur Wochenende und Feiertage. Für TI12 ist das keine hinreichend belegte Automatik. Der Befund betrifft die neue Bindung, keine abgeschlossene Fehlerdiagnose sämtlicher Bestandsprofile.
7. Manifest 7 mit fünf Profilen, bestehende 104 Bundesbindungen und bernbezogene Profilparameter nicht still erweitern. Neue Verträge, Consumergrenzen, Cachebindung, Standardmigration, Rechenspur und Export erst in AP23C konkret festlegen. AP5 und historische Releases bleiben erhalten.

Für das GUI bleiben zweispaltiger Aufbau, frühe Datumseingabe und ruhige Fallauswahl verbindliche Leitplanken. Nur tatsächlich unterscheidende Merkmale werden abgefragt. Ein einziger zulässiger Wert wird fest angezeigt. Redundante Dokument- und Zuständigkeitsfelder entfallen. Forschungsfelder wie `calendarQualification` sind **keine** bereits vorgeschlagenen zusätzlichen Checkboxen. Rechtsgrundlagen, Quellenstand und Detailannahmen gehören vorwiegend in die Rechenspur. DE/FR bleiben Produktsprachen, IT/RG ist #49.

## Zeitbindung und verbleibender Entscheid

Die Referenzen reichen vom 1. Januar 2026 bis 31. Dezember 2027. Die frühe NW-Probe hat ihre eigene historische Normfassung. Die aktuellen Kalenderreleases beginnen dagegen erst am 29. August 2026. Diese beiden Ebenen werden nicht gleichgesetzt. Für 2027 wird in den Fachreferenzen die Fortgeltung der heute gelesenen Regeln unterstellt. Die operative Untergrenze, der Quellenrelease und allfällige obere Fachgrenzen werden später ausdrücklich gebunden.

Zur Abnahme stehen das begrenzte Fachmodell und insbesondere folgende Behandlung:

- **GR:** kantonale VRG-Feiertagsbindung gestützt auf Norm und Botschaft, getrennt von den bisherigen Bundesprofilen
- **TI-O1:** positive Pilotkonstellation mit übereinstimmenden relevanten Orten im Tessin, andere Ortskonstellationen vorerst ohne positives automatisches Resultat
- **TI-O2:** Endverschiebung in Stillstand vorerst als eng definierter Sperrfall
- **TI Art. 47 Abs. 5 und elektronische Vollzugspfade:** weiterhin nicht positiv modelliert
- **NW:** nur fachliche Kontrastprobe mit offener örtlicher Bindung

Diese begrenzte Behandlung erlaubt die Vorbereitung des Datenvertrags, ohne offene Fragen als gelöst auszugeben. AP23B ist noch nicht durch David Steimer abgenommen. AP23C und die Produktintegration sind nicht gestartet.

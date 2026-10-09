# AP22B Datenvertrag und Migration der schweizweiten Kalender

Stand: 8. Oktober 2026. **Vorlage zur fachlich-technischen Abnahme und zu DEC-2026-030.** AP22B ist mit dem Auftrag «Beginne mit AP22B» gestartet. AP22A und die Entscheide DEC-2026-028/029 bleiben abgenommen. Neue Formate und die nachstehende zeitliche Produktabdeckung sind vorgeschlagen, noch nicht beschlossen. Der laufende MVP-0.6-Stand bleibt unverändert.

## Ergebnis und vorgeschlagener Entscheid

Die bestehende Kalenderarithmetik wird erweitert, nicht durch einen zweiten Rechner ersetzt. Der neue Feiertagskatalog trennt unveränderte Erhebungsdaten von ausführbaren Verfahrensbindungen. Aus diesen Bindungen werden operative Regelkalender deterministisch abgeleitet. Eine erfolgreiche Datumserzeugung allein erlaubt noch keine Berechnung.

| Bestandteil | Bisher | Vorschlag |
| --- | --- | --- |
| Feiertagskatalog | 1.0.0 | **2.0.0**, mit getrennten Auswahlentscheidungen, terminalen Listen, Freigaben und Herkunft |
| Regelkalender | 2.0.0 | **3.0.0**, geschlossene Bedingungen, Wochentag mit Offset und prozessuale Gleichstellung |
| Manifest und Mindestconsumer | 6.0.0 | **7.0.0**, dynamisches, vollständig hashgebundenes Kalenderinventar |
| Rechtsprofile | 1.0.0 | unverändert, genau StPO, ZPO, BGG, VwVG und VRPG-BE |
| Spezialregimekatalog | 3.0.0 | Format und fachlicher Inhalt unverändert |
| Sozialverfahrenskatalog | 2.0.0 | Format und fachliche Regeln unverändert, Releasebindungen müssen neu gesetzt werden |

Alle Kalender innerhalb eines neuen Format-7-Releases verwenden Format 3. Alte Releaseverzeichnisse und Readerzweige bleiben unverändert. Ein v2/v3-Mischbestand würde die notwendige Neuanbindung des Sozialkatalogs nicht vermeiden und die Prüfregeln verkomplizieren.

Vorgeschlagene neue Kalenderabdeckung: **29. August 2026 bis offen**, entsprechend dem bestehenden Beginn der fünf Grundprofile. Das ist ein Produktfenster, kein erstmaliges Inkrafttreten sämtlicher Normen und keine Zusage unveränderlichen künftigen Rechts. Jeder tatsächlich verwendete Kalendertag muss zusätzlich von Regelgeltung und Gebietsstand gedeckt sein. Die bestehenden Sozialfreigaben bleiben ausdrücklich auf **2026–2027** beschränkt. Die periodische Quellenprüfung bleibt erforderlich. Historische Referenzen und die reine Datierbarkeit von 2028/2029 erweitern keine Produktfreigabe.

## Gebundene Eingänge und isolierte Vorlage

Die [Strukturprobe](../../tests/golden/candidates/ap22b-holiday-contract.json) bindet zwei unveränderte Eingänge:

| Eingang | SHA-256 |
| --- | --- |
| MVP-0.6-Feiertagskatalog | `b53f9ed3dec29c8bb479b3840a801f3056531374cbb84611b377d7a01e93d1b7` |
| AP22A-Abschlussmatrix V1.0 als JSON | `7c0512b66fcd7206c47f2d36b4774824325fe779b7045cb12925bf2fb0146f89` |

Die vollständigen Schemavorlagen liegen ausschliesslich unter [schemas/candidates/ap22b](../../schemas/candidates/ap22b/). Kein produktiver Schema-Pfad wurde ersetzt. Die kanonischen Schema-IDs bezeichnen die vorgeschlagenen späteren Adressen, nicht bereits veröffentlichte Dateien.

Die Strukturprobe erhält alle **479 bisherigen Regeln**, alle Erhebungsdaten, Quellen, Gebietszuordnungen, Übersetzungen, ursprünglichen Statuswerte und historischen Freigaben unverändert. Die bisher zwölf `calendarProjections` bleiben als historischer CH-/BE-Projektionsnachweis bestehen. Ein Format-7-Consumer darf daraus keine neue Aktivierung ableiten. Dafür ist ausschliesslich `activation` massgebend.

## Katalog 2 und konkrete Felder

Der neue erforderliche Bereich `activation` enthält:

| Feld | Exakter Zweck |
| --- | --- |
| `contractDecision` | DEC-2026-030 mit Status `proposed` oder `approved` und Entscheidtag. Der Entwurf enthält `proposed` und `on: null`. |
| `base` | Pfad und vollständiger SHA-256 der beiden Eingänge. |
| `sourceEvidence`, `sourceIdMap` | 157 unveränderte AP22A-Quellenmetadaten und eindeutige Zuordnung zu den späteren SRC-/JUD-IDs. Alte leere Fundstellen oder Statusangaben werden nicht rückwirkend verbessert. |
| `supplementalScopes`, `supplementalRules` | Gesonderte neue SO-Prozessliste mit eigenem Normbezug, ohne erfundene Excel-Zeilenherkunft. |
| `matrixDecisions` | Genau 198 nachvollziehbare Auswahlentscheide. ID, Profil, Kanton, Ausgangsliste, Modus, gewählte Listen und Hash der ursprünglichen JSON-Zeile bleiben gebunden. |
| `anchorPolicies` | Vier profilgebundene Rollenregeln. Bekannte Standardrollen und nicht automatisch aufgelöste Sonderfälle sind geschlossene Werte. |
| `procedureBindings` | 104 Bindungen, eine je Kanton und Bundesprofil. Stabile ID, Zweck, Rollenregel, Produktfenster, erforderliche Gebietsfakten, Varianten, Quellen, Matrixbezüge und Grenzen. |
| `projections` | 32 deduplizierte Kalenderdefinitionen mit ID, Kalender-ID, genau einer Grundliste, ausdrücklichen Ergänzungen und vollständig bestimmter Regelmenge. |
| `releaseEligibility` | Kandidat oder konkrete Releasefreigabe. Die Vorlage enthält `status: candidate`, `releaseId: null`, `approval: null`. |

Ein beschlossener Fachentscheid ist keine Quellenprüfung und keine technische Releasefreigabe. Die archivierten `open`-/`blocked`-Kennzeichnungen bleiben Herkunftsnachweise. Umgekehrt darf eine neue operative Freigabe nicht nur durch Umbenennen eines solchen Wertes entstehen. Der spätere Consumer verlangt den beschlossenen Vertrag, gültige Bindungen und eine konkrete Releasefreigabe gemeinsam.

### Terminale Listen statt rekursiver Ersatzregeln

`matrixDecisions` erklärt, warum eine Ausgangsliste verwendet, ersetzt oder ausgeschlossen wurde. `projections` enthält dagegen das fertige Ergebnis dieser Auswahl. Ein Selbstbezug wie «ZH-GOG-ALL ersetzt durch ZH-GOG-ALL» erzeugt deshalb weder eine Rekursion noch einen Konflikt. `rules` der Arbeitsmatrix darf bei Ersatzbindungen nicht als effektive Regelmenge übernommen werden.

Jede Projektion enthält `baseScopeId`, `supplementScopeIds`, die vollständige `scopeIds`-Menge und die daraus bestimmten `ruleIds`. `CH-ALL` wird als Bundesbeitrag ergänzt. Mehrfache Quellen desselben Datums erzeugen nur einen arbeitsfreien Tag, bleiben aber in der Rechenspur nachvollziehbar. Ein negativer Listenentscheid sperrt den Beitrag dieser Liste, nicht dasselbe Datum aus einer anderen zulässigen Norm.

Kalenderdefinitionen mit gleichem Kanton und gleicher Listen-/Regel-ID-Menge werden von mehreren Profilen gemeinsam verwendet. Die Vorlagenidentität wird aus diesen fest sortierten Identitäten erzeugt. Eine geänderte ID-Menge ergibt eine neue Projektions-ID. Änderungen des Inhalts bei stabilen Regel-IDs werden dagegen durch den vollständigen Kataloghash, Kalenderartefakthash und Releasebezug gebunden. Eine Kalender-ID allein ist deshalb kein Cache- oder Integritätsnachweis. `ch-federal-calendar` und `be-public-holidays` bleiben als historische Anschluss-IDs erhalten. Der Bundeskalender enthält weiterhin auch die drei unveränderten Stillstandsregeln. `ch-court-holidays` ist deren Stillstandssatz, kein zusätzliches Kalenderartefakt. Die projektierten Feiertagslisten verändern weder Stillstand noch dessen Profilausnahmen.

### Solothurn und räumliche Varianten

`SO-PROCEDURAL-DRAFT` wird nur in der neuen operativen Schicht auf **`SO-PROCEDURAL-ALL`** abgebildet. Der historische Matrixbezug bleibt erhalten. Hinzu kommen zwölf eigenständige ganztägige Regeln: Neujahr, 2. Januar, Karfreitag, Ostermontag, Auffahrt, Pfingstmontag, 1. Mai, Fronleichnam, Mariä Himmelfahrt, Allerheiligen, Weihnachten und Stephanstag. Der Bundesfeiertag kommt aus `CH-ALL`. Normgeltung gemäss AP22A ab 1. März 2015, neue Produktverwendung erst im vorgeschlagenen Produktfenster. Die RTG-Halbtagsregel und die bisherigen SO-Gebiete werden weder verändert noch als Prozessnorm ausgegeben.

Bei AG, FR und SO wirken die gewählten Prozesslisten kantonsweit. Hier entsteht keine zusätzliche Gemeindeauswahl. Die ausgewählten AI-/NE-Listen benötigen dagegen je ein regionales Faktum: Zugehörigkeit zu `AI-RTG-INNER-ADDITIONAL` beziehungsweise `NE-LANDERON-ADDITIONAL`. Diese insgesamt acht Profilbindungen enthalten je eine Ja-/Nein-Variante. Fehlend oder unbestimmt passt zu keiner Variante. Ein blosser Kantonsknoten beweist ausdrücklich **nicht**, dass eine regionale Ergänzung nicht gilt.

Die internen Gebietskennungen sind kein vollständiges amtliches BFS-Gemeindeverzeichnis. Amtliche Identifikatoren werden nicht erfunden. Für die vorhandenen namentlichen Teilräume ist eine zusätzliche schweizweite Geodatenintegration nicht nötig. Das ist eine bewusste begrenzte Verwendung interner IDs anstelle einer vorgetäuschten vollständigen eCH-konformen Gemeindereferenz.

## Kalender 3 und Quellenbindung

Feiertagsregeln erhalten zwingend `condition`. Zulässig sind ausschliesslich `always`, `unlessTuesdayOrSaturday`, `onlyMonday` und `shiftHolyThursdayBy7Days`, jeweils mit den bereits beschlossenen Parametergrenzen. Hinzu kommt `nthWeekdayOffsetDays`. Der zulässige ganzzahlige Offset liegt zwischen −366 und 366 Tagen. Keine freie Ausdrucks- oder Scriptsprache.

`effect.kind` unterscheidet zusätzlich `proceduralEquivalentDay`. Die Fristwirkung bleibt `nonWorkingDayEquivalentToSunday`. Ein Halbtag darf nicht allein durch diese Umbenennung als ganztägiger Prozessfeiertag wirken. Stillstands- und Override-Regeln erhalten keine Feiertagsbedingung.

Ein projizierter Kalender trägt `projection: {catalogId, catalogFormatVersion, projectionId, sourceHash}`. `sourceHash` ist der SHA-256 der **vollständigen Katalogdatei**, nicht der Arbeitsmappe oder eines Teilobjekts. Das Schema erlaubt `null` für einen nicht projizierten Regelkalender. Der neue konkrete AP22-Release verlangt jedoch für alle 32 Kalender eine gültige Projektion. Die unveränderten Bundes-Stillstandsregeln werden zusätzlich gegen den gebundenen Bestand geprüft.

Die Regelmenge einer Projektion beschreibt den wirksamen Feiertagsbestand **einschliesslich Vererbung**. `ch-federal-calendar` erbt nichts. Die 31 kantonalen Kalender erben genau diesen Bundeskalender. Dessen `CH-ALL`-Regel wird nicht nochmals als eigene Kindregel emittiert. Die zusätzlichen kantonalen Rechtsgrundlagen desselben Datums bleiben dagegen als Herkunft erhalten. Der Projektionsabgleich prüft die vollständige aufgelöste Regelmenge, nicht nur die eigenen Regeln einer Datei. Ein Vererbungszyklus oder ein weiterer nicht gebundener Elternkalender wird zurückgewiesen.

Jede operative Feiertagsregel muss auf genau die in ihrer Projektion aufgeführte Katalogregel oder SO-Ergänzung zurückführbar sein. Der Consumer prüft Datumsausdruck, Bedingung, Normgeltung, Feiertagswirkung und vollständige Quellenbindung, nicht nur einen passenden ID-String. Die Verfahrensbindung wird zusätzlich in der Rechenspur geführt. Kalenderzugehörigkeit allein ist keine Berechnungsfreigabe.

Die neuen operativen Normquellen müssen in den Quellenprüfprozess aufgenommen werden. `sourceIdMap` behält bestehende SRC-/JUD-IDs und ergänzt sonst das Präfix `SRC-` vor die bisherige AP22-ID. Das ist eine technische Identität, kein neuer Nachweis. Der spätere Quellenabgleich bindet Original, relevante Fundstelle, Prüftiefe und Wiederverwendung. Weder alle 157 Nachweise noch sämtliche 479 archivierten Regeln werden pauschal als laufzeitrelevant erklärt.

## Auflösungsvertrag und Begrenzungen

Die gemeinsame Eingabe ergänzt die bisherigen Datums-/Fristangaben um einen ausdrücklich qualifizierten Kalenderkontext. Der Vertrag unterscheidet den Sitz der zuständigen Stelle von dem tatsächlich massgebenden Feiertagsort:

1. `profileId` und Rollenmodus bestimmen die Anknüpfung. ZPO verwendet `court`. StPO/BGG/VwVG verwenden im bestätigten Standardfall `partyWithoutRepresentative` oder `qualifiedServiceRepresentative`. Letzterer setzt eine eindeutige qualifizierte Zustellvertretung voraus, nicht bloss einen beliebigen Kanzleiort.
2. Der massgebende Ort enthält Kanton und nur die erforderlichen regionalen Fakten. Der Behördenwert «Bund» liefert keinen CH-Ersatzkalender. Unklare Mehrortfälle, nicht qualifizierte Vertretung, persönliche Handlung oder Mandatswechsel werden nicht automatisch aufgelöst.
3. Die passende Bindung muss den Fall und den gesamten relevanten Rechenweg abdecken. Für jeden geprüften Tag gelten die zu diesem Zeitpunkt gültigen Norm- und Gebietsintervalle. Eine später endende Regel wird nicht nur wegen eines gültigen Zustelltags weiterverwendet.
4. Die Variante liefert die konkrete Projektion. Ergebnis, Rechenspur und Grenzen bleiben zusammen gebunden. Nicht aufgelöste oder abgelaufene Angaben führen zu keiner stillen BE-/CH-Auswahl.

Das gemeinsame Ergebnis unterscheidet `resolved`, `resolvedWithBoundary` und `clarificationRequired`. Im letzten Zustand gibt es kein definitives Fristdatum und keinen Kalenderexport. Fehlende Freigabe oder fehlende Abdeckung bleibt eine eigenständige Sperre. Ein bestehendes Resultat darf nicht aus dem Cache weiter sichtbar bleiben, wenn der aktuelle Fall diese Voraussetzungen nicht mehr erfüllt.

### Vier Januargrenzen

Für SH/StPO und SG/StPO, BGG und VwVG enthält jede Variante eine zweite Projektion. Sie unterscheidet sich von der ersten **nur um die konkret gebundene Berchtoldstagsregel**. Der vorhandene Rechenkern führt beide vollständigen Berechnungen mit ansonsten identischen Eingaben aus. Nicht einfach alle Ereignisse am 2. Januar löschen. Andere Regeln, Wochenenden und Stillstand bleiben identisch.

Verglichen wird das rechtliche Ergebnis, insbesondere Fristbeginn, nominelles Fristende und endgültiger Fristablauf, nicht die unterschiedliche Anzahl von Quellen oder Rechenschritten. Bei unterschiedlichem rechtlichem Ergebnis gilt DEC-2026-029: Einzelfallklärung, kein definitives Resultat, kein Export. Bei gleichem Ergebnis bleibt die Berechnung möglich. Scheitert einer der beiden Pfade an einer anderen Abdeckungssperre, darf nicht der verbleibende Pfad als definitive Lösung ausgegeben werden. Der Vergleich umfasst auch die laufende Endtagsverschiebung, die den 2. Januar erst erreicht.

Diese Vergleichsbehandlung ist nicht auf ZPO zu übertragen. Die bisher bestätigten ZPO-Zuordnungen bleiben bestimmt. Bei der bereits unterstützten gewöhnlichen Post nach ZPO Art. 142 Abs. 1bis ist hingegen derselbe korrekt aufgelöste Kalender für die vorhandene Zustellwirkung zu verwenden. `purpose: deadlineCalendar` umfasst deshalb die bestehenden kalendersensitiven Rechenschritte, nicht nur die letzte Endtagsprüfung. Es entsteht keine zusätzliche Zustellart.

### Berechenbare Vorbehalte

GR verwendet den bestätigten Grundkatalog plus Bundesfeier mit `GR-BASE-ONLY`. NE verwendet die bekannten wiederkehrenden Regeln mit `NE-YEAR-LOCAL-RESERVE`. Beide sind berechenbare Abdeckungsgrenzen, keine generellen Quellensperren. Ein wesentlicher Hinweis erscheint knapp bei der Auswahl, die Begründung in der Rechenspur. Der Hinweis hängt am tatsächlich verwendeten Kalender. Er darf weder allein wegen des Behördenkantons ausgelöst werden noch örtliche Ruhetage allgemein als rechtlich irrelevant bezeichnen.

## Manifest 7 und Migration

Der konkrete Entwurf ergibt **32 Kalender + fünf Rechtsprofile + drei Kataloge = 40 manifestgebundene Datendateien**, dazu das Manifest. Das Format selbst erlaubt eine andere explizite Anzahl. Die Identitätsmengen müssen exakt mit dem Artefaktinventar übereinstimmen. Pfade, Rollen, Inhalts-IDs und SHA-256 müssen eindeutig sein. Fehlende, zusätzliche, duplizierte oder fremd formatierte Dateien werden verworfen. Kalenderprovenienz und Kataloghash müssen zusammenpassen. Es gibt kein zusätzliches Aktivierungsartefakt und keine zusätzliche Infrastruktur.

| Migrationsschritt | Erhaltungsregel und Prüfung |
| --- | --- |
| Historische Releases | AP5 sowie Formate 1–6 bleiben auf eigenen Readerzweigen und bisherigen Pins lesbar. Alte Consumer weisen Format 7 zurück. Keine Änderung alter Dateien oder Mirrors. |
| Kalender und Projektionen | Neue Kandidaten aus gebundenem Katalog ableiten. Feiertage, Bedingungen und Zeitbezüge exakt nachprüfen. CH-/BE-Regelidentitäten, Bundesstillstand und bisherige Ergebnisse erhalten. |
| Sozialkatalog | 44 nationale Regeln und 50 BE-Anbindungen samt Revisionen, fachlichen Hashes, Grenzen und Fenstern erhalten. Alle 50 `releaseEligibility` auf neue Release-ID und neue Komponentenhashes binden. Ein Kandidat bleibt Kandidat. Kein Mitschleppen alter Freigaben als neue Freigabe. |
| Spezialregimekatalog | ID-Bezüge auf `be-public-holidays` und den Stillstandssatz erhalten. Keine neue kantonale Verwaltungs- oder Sozialfreigabe. |
| Quellenprüfung | Neue operative Quellen und vorhandene Wiederverwendung nachvollziehbar an das neue Release binden. Der heutige Vertrag ersetzt den späteren Quellenabgleich nicht. |
| Consumer | TypeScript, Python, JSON-Schemata, SPFx-Validierung, Vorschau und öffentlicher Webbuild gemeinsam fortschreiben. Der begrenzte alte Schema-Interpreter darf den neuen Vertrag nicht versehentlich nur teilweise prüfen. |
| Provider und Cache | Manifestrelative Pfade und Byteidentität bleiben. Fallback nur auf einen vollständig verifizierten Stand derselben Provider-/Datenpin-Konfiguration. AP5, E und Q dürfen bei Netzfehlern nicht gegenseitig den originweiten `active`-Stand übernehmen. Alte nicht zuordenbare Cacheeinträge sind für den neuen Kontext nicht verwendbar. |

Die Cacheabgrenzung ist ein konkret festgestellter Integrationsprüfpunkt: Der bisherige SPFx-Store verwendet einen originweiten `active`-Eintrag. AP22C3 muss dessen Konfigurationsbindung sicherstellen und Negativfälle nachweisen. AP22B verändert diesen Store nicht.

Persönliche Defaults werden auf eine explizite neue Version 4 migriert. Sprache, Fristdauer, Profil, Zustellart und eindeutig gleichbedeutender Behördenkanton können erhalten bleiben. Die alte einzelne `calendarId` bestätigt weder eine Vertretungsrolle noch ein regionales Faktum. Fallbezogene Fakten werden nicht aus einem alten Default erfunden. Ein neues bewusst gespeichertes Rollen-/Ortsdefault ist weiterhin sichtbar prüfbar und keine rechtliche Zuständigkeitsbestätigung. Profil-, Rollen-, Gebiets- oder Overridewechsel invalidiert Resultat und Kalenderexport sofort. Kalenderübersteuerung darf keine fehlende Anwendbarkeit, Januargrenze oder nicht freigegebene Anbindung umgehen.

## Nachweis und nächste Umsetzung

Der [Referenzindex](../../tests/golden/candidates/ap22b-calendar-references.json) übernimmt alle 25 AP22A-Referenzgruppen, acht zentrale Gegenproben und vier zusätzliche Januarvergleichsproben. Historische Vollfälle, isolierte Endtagstests und Produktgrenzen bleiben verschiedene Nachweisarten. Die zusätzlichen Januarproben gelten für alle vier begrenzten Bindungen. Eine vorhandene Sollprobe ist noch kein bestandener Produkttest.

Die isolierten Schemata, Strukturprobe und Manipulationstests werden im [AP22B-Prüfnachweis](kalendervertrag-ap22b-pruefung.md) gebunden. Sie prüfen die Vorlage und den unveränderten alten Vertrag. Die tatsächliche Datumserzeugung aller neuen Kalender, die vollständigen Referenzberechnungen, Defaultmigration, Cachebindung, Browserdarstellung und Hostintegration werden erst in AP22C geprüft.

Nach Abnahme von AP22B und Beschluss von [DEC-2026-030](../entscheidungen/DEC-2026-030-kalenderaktivierung-formatvertrag.md) sind getrennt vorgesehen:

1. **AP22C1:** Datenmodelle, Parser, Projektion, Generator, SO-Ergänzung und unabhängige TypeScript-/Python-Prüfung. Historische Reader erhalten.
2. **AP22C2:** Rollen-/Gebietsauflösung, Januarvergleich, gemeinsame zweispaltige DE-/FR-Oberfläche, Rechenspur und Defaultmigration. Frühe Datumseingabe bleibt möglich.
3. **AP22C3:** Provider-/Cacheabgrenzung, historische AP5-Ansicht, Hosts, Gesamtregression und gebauter Kandidat. Reale fachliche Prüfung und Releasevorbereitung bleiben nachgelagert.

Ein wesentliches Paket gleichzeitig, höchstens fünf Nettoarbeitstage je Teilpaket. Bei absehbarer Überschreitung vor Beginn weiter aufteilen. AP21, weitere Sozialanbindungen und kantonale Verwaltungsverfahren werden nicht parallel oder stillschweigend mitgestartet. David Steimer entscheidet in Personalunion. Codex erstellt Vorlagen und Nachweise ohne formelle Freigabe- oder Haftungsverantwortung. GitHub, E/Q/P, Hosting, Mirrors und Berechtigungen bleiben unverändert.

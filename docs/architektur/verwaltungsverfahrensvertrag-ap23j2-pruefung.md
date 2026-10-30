# AP23J2 Technischer Prüfbericht

Stand: 27. Oktober 2026. Isolierte Vertrags- und Migrationsprobe nach [Fachabnahme J1-A bis J1-G](../fachrecht/abnahme-ap23j1.md). Der [gebundene Abschlussnachweis](../../outputs/ap23j2-2026-10-27/local-completion.json) dokumentiert den tatsächlichen lokalen Abschluss. Technische J2-Abnahme und [DEC-2026-039](../entscheidungen/DEC-2026-039-qualifizierte-ausloeser-und-genfer-eroeffnung-v7.md) bleiben offen.

## Prüfumfang und Status

**Die lokale Vertrags- und Migrationsprobe ist bestanden.** Alle neun Abschlussprüfschritte sind grün. Geprüft wird Katalog 7.0.0 mit Manifest/Mindestconsumer 14.0.0, **kein neuer nativer Produktreader**. Die [Vertragsvorlage](verwaltungsverfahrensvertrag-ap23j2.md) trennt den vorgeschlagenen Vertrag von der späteren J3-Integration.

| Prüfung | Bestanden |
| --- | ---: |
| Vollständige J1-Referenzvergleiche in Node und separat in Python | je 673 |
| Zusätzliche Eröffnungs- und Provenienzproben in beiden Implementierungen | je elf |
| Neu versiegelte semantische Katalogmutationen | 38 |
| Negative aktuelle Eingaben | 542 |
| Bisherige native Berechnungen / abgewiesene künstliche Kontexte | 113 / 339 |
| Altreader- und Umetikettierungsversuche gesperrt | fünf |
| Quellenbytebindungen in der unabhängigen Prüfung | 19 |
| Neue Archiv-, Erhaltungs-, Schema-, Kandidaten-, Vertrags- und Abschlussmetadatatests | 416 |
| Unabhängige Abweichungen | null |

Die Zählarten werden nicht zu einer künstlichen Gesamttestzahl addiert. Die 416 einzeln gezählten Tests haben keine Fehler, abgebrochenen oder übersprungenen Fälle und keine offenen Todos. Die Typprüfung und die Prüfung auf Whitespacefehler sind ebenfalls bestanden.

| Strukturgegenstand | Tatsächlicher isolierter Kandidat |
| --- | ---: |
| Pfade und Policies | 149, davon 113 exakt erhalten und 36 neu |
| Neue Gruppen | FR elf, GE sieben, JU 18 |
| Erlasse / Stillstandsprofile | 18 / 35 |
| Rechtliche Feiertagsverwendungen | 27, davon sechs neu |
| Physische Kalender | 35, unverändert |
| Katalogregeln einschliesslich Prozessergänzungen | 499 = 479 Grundregeln + 20 bestehende Ergänzungen, unverändert |
| Ausgegebene Projektionsregeln in den 35 Kalenderdateien | 431, unverändert. Andere Zählstufe, nicht zu den 499 addieren |
| Manifestartefakte | 44, davon 43 nichtadministrative Dateien rohbytegleich |
| Dateien im Bundle einschliesslich Manifest | 45 |
| Quellen | 85, davon 19 mit explizitem J1-Crosswalk neu projiziert |
| Sozialverfahren | 44 Regeln und 50 BE-Anbindungen, unverändert |
| Geschützte Bestandsdateien | 4’413 |

Die alten Pfad-, Policy-, Eligibility-, Quellen-, Erlass-, Profil-, Verwendungs- und Ausschlussobjekte werden exakt erhalten. Insbesondere werden alte `physicalBaseline.releaseId`-Werte nicht beiläufig umetikettiert. Die 43 kopierten Fachkomponenten behalten bewusst ihre historischen Bindungen. Deshalb ist die Probe kein neuer konsistent freigegebener Gesamtquellenrelease.

## Neue Eröffnungssemantik und begrenzte Auslöser

Die neue Policy wird aus den tatsächlichen Kandidatenbytes gelesen. Für GE werden physischer gewöhnlicher Postempfang und bereits qualifizierte rechtliche Eröffnung ausdrücklich unterschieden. Der erste Modus verschiebt Samstag, Sonntag oder gesetzlichen Feiertag vorgelagert auf den nächsten Werktag. Der zweite Modus verschiebt nicht nochmals. Erst danach wird die Tagesfrist einmal ab dem Folgetag gezählt.

Die Auswertung prüft auch den eingegebenen physischen Tag und jeden vorgelagerten Zwischentag gegen Manifest-, Pfad-, Eligibility-, Quellen-, Norm- und Kalenderdeckung. Gerichtsferien verschieben die rechtliche Postmitteilung nicht. Ein Quellenloch nur am Sonntag innerhalb der vorgeschalteten Kette muss genauso sperren wie ein Loch am eigentlichen Eröffnungstag.

Die Provenienz zeigt eingegebenen und rechtlich aufgelösten Tag, aktuellen Modus, Policyhash, vorgeschaltete Verschiebungstage und tatsächlich ausgewertete Normsegmente. Alle Ergebnisse dieser isolierten Probe haben `exportAllowed: false`. Die Ergebnisstruktur ist keine selbstständige serialisierbare Rechen- oder Exportberechtigung.

FR-Erstreckungsablehnung, FR-TC-Dispositiv, JU-mündliche Eröffnung und JU-verkürzter vollständig gutheissender Entscheid sind typisierte aktuelle Auslöser ohne automatische Folgeeröffnung. Die FR-Nachfristkonkurrenz und die aktuellen JU-Kettenvoraussetzungen bleiben Pflichtqualifikationen. Ein errechnetes Verlangensende erzeugt keinen späteren Rechtsmittelbeginn.

## Quellen- und Kalenderbindung

Der [Crosswalk](../../outputs/ap23j2-candidate-2026-10-27/source-crosswalk.json) unterscheidet geltende Konsolidierungen, amtliche Sprachgegenkontrolle, historische Änderungskontexte, Materialien und begrenzte Praxis. Originalforschungskennungen, Quellbytes und Evidenzgrenzen bleiben erhalten. Keine zusätzliche selbstständige Norm aus API-Metadaten, Texthilfen oder Suchtreffern.

Für den einzigen bereits abgenommenen historischen JU-Beleg mit ursprünglicher HTTP-Verweisadresse gilt eine exakte neue Schemaausnahme nach Quellenkennung, Art und URL. Das alte HTTPS-Quellenschema bleibt erhalten. Fremde Kennung, falsche Art, Host-, Pfad- oder Queryänderung und versteckte Weiterleitungsparameter werden nicht allgemein zugelassen. Keine URL-Umschreibung und kein aktueller Abruf dieses historischen Verweises durch die Rechenprobe.

Die sechs neuen Verwendungen binden FR Nicht-TC/TC, GE Erstverfahren/Rechtsmittel und JU Erstverfahren/Rechtsmittel am qualifizierten Zielstellensitz. GE und JU werden nicht pauschal auf organisatorische Gerichte reduziert. Keine freien Listenvereinigungen, Parteienkantone, Genfer Ersatzmontage oder Personalurlaubstage. FR-CPJA-Fassungen 7947 und 8637 sind in disjunkten Abschnitten gebunden.

## Referenzen, Manipulationen und Gegenrechnung

Der [Node-Nachweis](../../outputs/ap23j2-candidate-2026-10-27/QA-AP23J2.json) umfasst 673 vollständige J1-Fälle: 93 datierte Werte, 573 Qualifikationsgrenzen, drei Endverschiebungskollisionen und vier Zeitfenstergrenzen. Die 78 händischen Fachreferenzen bleiben von 595 ergänzenden synthetischen Proben getrennt. Die Auswertung vergleicht nicht nur das Enddatum, sondern auch rechtlichen Auslöser, ordentlichen Beginn, ersten gezählten Tag, nominales Ende, Stillstand, Endverschiebung, Normabschnitt und konkrete Sperrklasse mit der unveränderten J1-Basis.

Die Forschungsfixtures dürfen nicht mit echten Eingaben verwechselt werden. Ihr Adapter projiziert ausschliesslich die ausdrücklich formalen Requirements aus den synthetischen Basisfakten. Weggelassene reine Basis-Metadaten werden protokolliert. Bei genau fünf unverändert gebundenen JU-Fällen liegen zusätzlich erläuternde Annotationen im ursprünglichen `facts`-Objekt. Eine geschlossene Zuordnung aus Fallkennung, Pfad, Schlüssel und exaktem Wert verschiebt ausschliesslich diese Annotationen in die Prüfprovenienz. Die Originalwerte bleiben nachvollziehbar. Die Projektion hängt nicht vom erwarteten Resultat ab.

Dies betrifft R11 mit dem qualifizierten Gouvernement-Ziel, R13–R15 mit dem erläuterten tatsächlichen mündlichen Ereignis sowie R22 mit der unqualifizierten Sonderkommission. Bei R22 bleibt insbesondere `reviewTargetQualified: false` im echten Prüfeingang erhalten und sperrt weiterhin. Alle eigentlichen Requirements, widersprüchlichen Fallwerte und nicht genau so gebundenen Fremdfakten bleiben ungefiltert. Reale Eingaben erhalten keine Metadaten-Ausnahme. Das fügt weder eine neue Rechtsfreigabe noch einen zusätzlichen UI-Fakt hinzu.

Die Node-Probe verwendet eine eigene UTC-Tagesfortschaltung und liest die echten erzeugten Kalender- und Profilregeln. Die [Python-Gegenprüfung](../../scripts/check_ap23j2_independent.py) liest dieselben tatsächlich erzeugten Daten, arbeitet aber mit eigener Datumsarithmetik und ruft weder Node noch den Produktrechenkern für ihre Sollberechnung auf. Dies ist eine technische Gegenrechnung, keine menschliche Zweitfreigabe.

Ihr [separater Bericht](../../outputs/ap23j2-candidate-2026-10-27/independent-verification.json) bestätigt alle 673 Resultate, die elf zusätzlichen Eröffnungsproben und die 19 tatsächlichen Quellenbytebindungen ohne Abweichung. Er bindet den exakten Node-Bericht und die ursprüngliche J1-Referenzdatei zusätzlich über deren Prüfsummen.

Die gezielten Negativproben ändern Inhalt und rechnen Pfad-, Policy-, Eligibility- und Manifestprüfsummen neu. Die Ablehnung muss trotz korrekter neuer Rohhashes aus der fachlichen Bindung folgen. Geprüft werden insbesondere falsche GE-Modi, freie Eröffnungstransformation, fremde Kalenderrolle, falsche Dauer, FR-Fassungslücken, Quellenverlust oder -umwertung, JU-Folgeketten, fehlende aktuelle Voraussetzungen und vorzeitige Aktivierungs- oder Exportflags.

Altreader müssen Format 14 und Katalog 7 direkt sowie bei Umetikettierung und neu gehashten Deskriptoren geschlossen ablehnen. Die bisherigen 113 Wege werden mit dem unveränderten nativen Format-13-Kontext gerechnet. Künstlich geklonte oder erfundene Kontexte dürfen nicht als authentischer Rechenkontext funktionieren.

## Abschluss und nächster Haltepunkt

Der [Abschlussprüfer](../../scripts/finalize-ap23j2.mjs) führt Schemarundlauf, Kandidatenrundlauf, Vertragsprobe, unabhängige Gegenrechnung, autonome J1-Archivprüfung, neue Tests, Erhaltung, TypeScript-Prüfung und Whitespaceprüfung zusammen. Er bindet die wirklichen Ausführungslogs und endgültigen Datei-Hashes. Eine anschliessende lesende Rückprüfung kontrolliert Inventare, Zähler, Statusgrenzen, Archiv und Schutzbindung nochmals.

Die Dokumentationspflege führt nur die sieben lebenden Einstiege nach und erhält die ursprünglichen J1-Vorlagen mit damaligen Vorabnahmestatus. Ein [lokaler Statusentwurf für #48](../../outputs/ap23j2-2026-10-27/issue48-status-draft.md) ist vorbereitet, nicht veröffentlicht. Das Board wurde nicht verändert.

**Zur Entscheidung stehen technische J2-Abnahme und DEC-2026-039.** J3 ist nicht gestartet. Weiterhin 16 lokal integrierte und abgenommene Kantone, sechs operativ. Kein Commit, Push, Quellenrelease, Produktbau, Upload oder Deployment. MVP 0.9, E/Q/P, Mirrors, AP5, AP21, Hosting und Berechtigungen bleiben unverändert. Der nächste reguläre Release bleibt gemäss DEC-2026-034 gebündelt.

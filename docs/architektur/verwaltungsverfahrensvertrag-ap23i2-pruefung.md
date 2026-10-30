# AP23I2 Technischer Prüfbericht

Stand: 22. Oktober 2026. Isolierte Vertrags- und Datenprobe nach [Fachabnahme I1-A bis I1-G](../fachrecht/abnahme-ap23i1.md). Der [gebundene lokale Abschlussnachweis](../../outputs/ap23i2-2026-10-22/local-completion.json) dokumentiert den tatsächlichen Abschluss. Menschliche technische I2-Abnahme und [DEC-2026-038](../entscheidungen/DEC-2026-038-konkretisierte-gesetzliche-fristen-und-hinweiszweige-v6.md) bleiben offen.

## Gesamturteil

**Die lokale technische Vertragsprobe ist bestanden.** Alle neun Abschlussprüfschritte sind grün. Die anschliessende Rückleseprüfung prüft exakte Dateien, Inventare, Zähler, Statusgrenzen, aktuelle Schutzbindung und Abnahmearchiv erneut. Das Ergebnis ist kein Beschluss und keine Produktintegration.

| Prüfung | Bestanden |
| --- | ---: |
| Vollständige I1-Referenzvergleiche in Node und separat in Python | je 249 |
| Neu versiegelte semantische Katalogmutationen in Node | 61 |
| Negative aktuelle Eingaben in Node | 732 |
| Positive skalare Alternativqualifikationen | 20 |
| Bisherige native Berechnungen / gesperrte künstliche Kontexte | 79 / 237 |
| Altreader- und Umetikettierungsversuche gesperrt | fünf |
| Unabhängige Python-Tagesvergleiche / Kalenderproben | 1’460 / 15 |
| Eigene Python-Strukturnegative / Eingabenegative | 14 / 691 |
| Neue Governance-, Schema-, Vertrags- und Abschlussmetadatatests | 281 |
| Unveränderte geschützte Bestandsdateien | 2’759 |

Die Zahlen bezeichnen verschiedene Prüfmengen und werden nicht zu einer künstlichen Gesamttestzahl addiert. Die 281 einzeln gezählten Testfälle haben weder Fehler noch übersprungene Fälle oder offene Todos.

## Prüfumfang und Ergebnisgrenze

Geprüft wird der Vorschlag Katalog 6.0.0 sowie Manifest/Mindestconsumer 13.0.0, nicht ein nativer neuer Produktreader. [Vertragsvorlage](verwaltungsverfahrensvertrag-ap23i2.md), [Schemaquelle](../../scripts/build-ap23i2-schemas.mjs), [Strukturkandidat](../../outputs/ap23i2-candidate-2026-10-22/candidate-integrity.json) und tatsächliche Kandidatenbytes sind getrennt nachvollziehbar.

Der unveränderte gemeinsame Arithmetikkern und Kalendergenerator werden nur im isolierten Prüfadapter verwendet. Dieser Adapter ist weder aus dem Produkt exportiert noch im Reader, GUI oder einem Host registriert. Er liest die konkret erzeugten Pfade, Qualifikationsregeln, Dauerbereiche, Kalender und Stillstandsprofile. Er übernimmt nicht das erwartete Fristresultat aus der Forschungsdatei. Alle Ergebnisse dieser Probe haben `exportAllowed: false`, auch die rechnerisch datierten Werte.

Die neue Bedeutung ist mit dem bisherigen Katalog 5 nicht vertragsneutral. Sie benötigt den eigenen Dauerzweig, aktuelle skalare Alternativqualifikationen und die transitiv gebundene Profilauswahl. Die genaue Lösung und spätere Migration sind im Vertragsvorschlag beschrieben.

## Struktur und unveränderter Bestand

| Gegenstand | Isolierte Probe |
| --- | --- |
| Pfade und Qualifikationsregeln | 113, davon 79 exakt erhalten und 34 neu |
| Katalogerlasse / Stillstandsprofile | 15 / 29 |
| Rechtliche Feiertagsverwendungen | 21, davon vier neue GL-/TG-Verwendungen |
| Physische Kalender | 35, sämtliche Rohdateien unverändert |
| Manifestartefakte | 44, davon 43 byteidentisch zur H3-Basis und nur der Verwaltungskatalog geändert |
| Dateien im Bundle einschliesslich Manifest | 45 |
| Feiertagsregeln | 499, unverändert, keine zusätzliche Regel |
| Sozialverfahren | 44 Regeln / 50 BE-Anbindungen, unverändert |
| Neue Quellenprojektionen | Elf, mit 1:1-Crosswalk aus I1 statt Archivumbenennung |

Die Quelleinträge unterscheiden sieben geltende Normquellen von drei ergänzenden historischen TG-Entscheiden und einer amtlichen Botschaft. Die Rolle ergänzender historischer Belege wird nicht in aktuelle selbstständige Gesetzesgeltung umetikettiert. Pfadfundstellen und Stufencrosswalk werden ausdrücklich aus der abgenommenen I1-Basis abgeleitet. Die drei technischen Stufen bleiben Verwaltung, Verwaltungsrechtsmittel und Gericht. Die feinere Zuständigkeit bleibt aktuelle Fallqualifikation.

Alle alten Pfad-, Policy-, Rechtsquellen-, Erlass-, Profil-, Verwendungs- und Ausschlussobjekte sowie die alten Pfad-Eligibilitys werden exakt verglichen. Eine alte Objektfreigabe gilt nicht automatisch für einen neuen Zielrelease. Die kopierten nichtadministrativen Fachkomponenten behalten bewusst ihre bisherigen historischen Releasebindungen. Der Kandidat bleibt gesperrt und ist kein konsistent neu freigegebener Gesamtquellenrelease.

## Referenzvergleich und unabhängige Gegenrechnung

Der [Node-Nachweis](../../outputs/ap23i2-candidate-2026-10-22/QA-AP23I2.json) vergleicht alle **249 vollständigen I1-Erwartungen**, nicht nur das Enddatum:

- 110 datierte Forschungswerte
- 16 genau begrenzte Endverschiebungskollisionen
- 117 konkrete Qualifikationsgrenzen
- sechs Grenzen des vollständig gedeckten Berechnungsfensters

Verglichen werden unter anderem ordentlicher Beginn, erster gezählter Tag, nominaler und endgültiger Ablauf, Stillstandstage, Verschiebung und Normabschnitt. Zusätzlich werden 15 Kalenderproben und positive alternative `oneOf`-Werte geprüft. Beide Hinweiszustände in allen fünf betroffenen TG-Gruppen benötigen die richtige Auflösung. Die Auswahlprovenienz wird getrennt vom unveränderten I1-Vergleichsresultat nachgewiesen.

Die [unabhängige Python-Prüfung](../../scripts/check_ap23i2_independent.py) liest die tatsächlichen Kandidatenbytes, die akzeptierten I1-Sollfälle und den Node-Nachweis. Sie prüft Struktur, Kalender und alle 249 Ergebnisse mit eigener Datumsarithmetik. Sie ruft weder den neuen Node-Prüfadapter noch die Produktarithmetik für ihre Sollberechnung auf. Ihr [Ergebnisbericht](../../outputs/ap23i2-candidate-2026-10-22/QA-AP23I2-INDEPENDENT.json) wird separat gebunden.

Dies ist eine unabhängige technische Gegenrechnung, keine menschliche Zweitfreigabe und keine eigenständige Erweiterung der I1-Fachabnahme.

## Geschlossene Ablehnung und Negativproben

Der alte native Format-12-Reader lädt die unveränderte H3-Basis weiter. Alle 79 bisherigen nativen Verfahrenspfade werden tatsächlich gerechnet. 237 künstlich erzeugte, geklonte oder nicht authentische Kontexte werden gesperrt.

Fünf Altreader-Negativprüfungen bestätigen, dass Katalog 6 beziehungsweise Format 13 weder direkt noch durch blosses Umetikettieren oder neu gehashte Format-12-Deskriptoren aktiviert werden können. Der bestehende Schemaausführer bleibt unverändert. Alle vier neuen Schemaentwürfe verwenden nur seinen bisherigen Keywordumfang und erhalten sämtliche alten Schemaverzweigungen exakt.

Die semantischen Katalognegativproben verändern insbesondere Dauerart, konkrete Wertebereiche, Verkürzungsnachweis, feste TG-Fünftagesdauer, Hinweiszuordnung, Profilmenge, Stillstandsperioden, Übergangsfakten, Zuständigkeit, Normfenster, konkrete Fundstellen, Kalenderrolle und Freigabestatus. Pfad-, Policy-, Profil- und Artefakthashes werden dafür gezielt neu versiegelt. Die Ablehnung darf nicht lediglich von einem veralteten Artefakthash oder einem vorgeschalteten exakten Manifestvergleich stammen. Korrekte Hashes allein legitimieren keine geänderte Bedeutung.

Eingabenegative prüfen fehlende aktuelle Tatsachen, falsche Dauer, widersprüchliche oder unbestimmte Hinweise, fremde Pfadkontexte, Objekt-/Arraywerte, Getter und geerbte Fallfakten. Fehlende positive Qualifikation wird nicht durch Vorauswahl, Coercion, erstes Profil oder Default ergänzt.

Die Abschlusszählung, konkreten Mutationskennungen, Testfälle und Logbytes sind in den maschinenlesbaren Nachweisen gebunden. Es gibt keine künstliche Addition der 249 Referenzfälle, einzelnen Mutationsschleifen und der separat gezählten Testläufe.

## Erhaltung, Dokumentation und nächster Haltepunkt

Vor Nachführung der sieben lebenden Einstiegstexte wurden 2’759 eindeutige Bestandsdateien gebunden. Die [Erhaltungskontrolle](../../outputs/ap23i2-2026-10-22/preservation-verification.json) verifiziert unveränderte Produktdateien, native Schemata, akzeptierte Daten, Forschungsoriginale, historische Nachweise, beide Abnahmearchive und den fremd geänderten Projektplan-DOCX. Die I1-Abnahme ist separat dokumentiert. Historische Vorabnahmeflags werden nicht nachträglich umgeschrieben.

Die neun lokalen Abschlussprüfschritte umfassen Schemarundlauf, Kandidatenrundlauf, Vertragsprüfung, unabhängige Gegenrechnung, autonome I1-Archivprüfung, neue Governance-/Schema-/Vertragstests, Erhaltung, TypeScript-Prüfung und Whitespaceprüfung. Lokale Dokumentverweise und finale Bytes werden zusätzlich zurückgelesen.

Die Dokumentationspflege führt die Fachabnahme und den vorgeschlagenen Vertrag in den lebenden Einstiegen nach. Sie verändert keine Rechenregel. Ein [lokaler Statusentwurf für #48](../../outputs/ap23i2-2026-10-22/issue48-status-draft.md) ist vorbereitet, aber nicht veröffentlicht. Es wurde weder die aktuelle GitHub-Karte inventarisiert noch das Board verändert.

**Zur Entscheidung stehen technische I2-Abnahme und DEC-2026-038.** AP23I3, native Format-13-Integration, echte Zielrelease-Neubindung, UI-/Host-/Exporttests und spätere Produktartefakte sind nicht erfolgt. Weiterhin 14 lokal integrierte und abgenommene Kantone, sechs operativ. MVP 0.9, E/Q/P, Mirrors, AP5, AP21, Hosting und Berechtigungen bleiben unverändert. Kein Commit, Quellpush, Quellenpromotion, Releasebau, Upload oder Deployment. Der nächste reguläre Release bleibt gemäss DEC-2026-034 gebündelt.

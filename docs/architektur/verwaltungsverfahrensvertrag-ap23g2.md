# AP23G2 Technischer Vertrag für Uri Solothurn und Schaffhausen

Stand: 22. Oktober 2026. **Technischer Entwurf zur Entscheidung durch David Steimer.** [AP23G1 ist fachlich abgenommen](../fachrecht/abnahme-ap23g1.md). Vorgeschlagen werden **Kantonalverfahrenskatalog 4.0.0 sowie Manifest und Mindestconsumer 11.0.0** gemäss [DEC-2026-036](../entscheidungen/DEC-2026-036-eroeffnungsketten-und-begruendungsverlangen-v4.md). Die isolierte Strukturprobe aktiviert keine neuen Produktpfade. MVP 0.9 bleibt unverändert.

## Vertragslücke und begrenzte Formatevolution

Die Tageszählung, die vorhandenen Regelkalender und die Sicherung bei Endverschiebung in neu beginnende Ferien genügen für die abgenommenen Recheneffekte. Der bisherige Katalog-3-Vertrag kann jedoch die neuen Handlungen, Eröffnungsketten und Hinweisbedeutungen nicht vollständig und geschlossen beschreiben.

| Nachgewiesene Grenze | Begrenzter V4-Vorschlag |
| --- | --- |
| Begründungsverlangen ist bisher kein positiver qualifizierter Handlungsweg | Eigene Verwaltungs- und Gerichtsbegründungsanforderung, nicht als Beschwerde oder gewöhnliche Eingabe umetikettiert |
| Vollständig begründeter Entscheid unterscheidet ursprüngliche Eröffnung und nachträgliche Begründung nicht | Eröffnungsherkunft und erwiesen rechtzeitige Voranforderung für den neuen vollständigen Rechtsmittellauf |
| Eine unbestrittene Belehrung beweist kein ausdrücklich vorhandenes Begründungsangebot | Eigener qualifizierter Eröffnungstyp für das Angebot nach SO § 21bis Abs. 1 Bst. c beziehungsweise SH Art. 8 Abs. 3 Bst. b |
| Allgemeine Gerichtsorganart bindet nicht das konkrete Gericht und dessen Identität als Empfänger | Zielgericht je neuem Gerichtspfad und beim SH-Dreissigtageweg zusätzlich dasselbe eröffnende Obergericht |
| Stillstand oder Sperre kann den abgenommenen UR-Art.-22-Hinweis nicht ausdrücken | Eigenes Hinweisprofil mit `noticeOnlyNoDateChange`, getrennt von Gerichtsferien und Datumsänderungen |
| Ein allgemeiner Feiertagsvorbehalt beschreibt weder UR-Lokalgrenze noch Koordination oder besondere Eröffnungsfolge | Pfadbezogene aktuelle Fallqualifikation mit ausdrücklich darstellbaren negativen und ungeklärten Zuständen |
| Feiertagsrolle ist bisher durchgehend als Behördenort beschrieben | Neue explizite SH-Gerichtsortrolle sowie eigenständige administrative Praxisbindung trotz gleicher physischer Datumsmenge |

Katalog 3 und Format 10 prüfen den bisherigen Bestand gegen exakte Identitäten und binden das Katalog-3-Schema. Eine Lockerung dieser alten Prüfungen oder eine blosse Ergänzung frei benannter Pfade würde unbekannte Bedeutungen verbergen. Der Vorschlag führt deshalb einen neuen geschlossenen Vertragszweig ein. Die produktiven alten Schemata und Leser bleiben unverändert.

## Bestand und isolierter Strukturkandidat

Ausgangspunkt ist der unverändert abgenommene lokale [AP23F3-Stand](../fachrecht/abnahme-ap23f3.md), nicht eine neue operative Freigabe dieses Kandidaten.

| Bestandteil | Abgenommener F3-Ausgangspunkt | AP23G2-Strukturprobe |
| --- | ---: | ---: |
| Katalogerlasse ohne separates BE-Profil | 8 | 11 |
| Pfade und Qualifikationsregeln | je 42 | je 58 |
| Stillstandsprofile | 14 | 20 |
| Rechtliche Feiertagsverwendungen | 9 | 13 |
| Physische Kalender | 33 | 33 |
| Manifestartefakte ohne Manifest | 42 | 42 |
| Dateien einschliesslich Manifest | 43 | 43 |
| Basisregeln und gesonderte SO-Regeln | 479 und 12 | unverändert |
| Nationale Sozialregeln und BE-Anbindungen | 44 und 50 | unverändert |

Die bisherigen 42 Pfadobjekte, Revisionen und Qualifikationsregeln bleiben exakt erhalten. Ebenso bleiben ihre bisherigen Erlasse, Quellen, Ferienprofile, Kalenderverwendungen und Ausschlüsse erhalten. Die 16 neuen UR-/SO-/SH-Wege verwenden ausschliesslich den neuen Zweig `qualifiedDayProcedureV4` mit eigenen fachlich gebundenen Anforderungen.

Die [Strukturprobe](../../outputs/ap23g2-candidate-2026-10-22/bundle/manifest.json) enthält 41 bytegleiche F3-Rohartefakte. Nur der Kantonalverfahrenskatalog ist strukturell verändert. Das [Kandidateninventar](../../outputs/ap23g2-candidate-2026-10-22/candidate-integrity.json) bindet die tatsächlichen Bytes. Die kopierten Komponenten behalten ihre damaligen F3-Referenzbindungen. Das Gesamtpaket ist ausdrücklich noch kein produktlesbarer, installierbarer oder vollständig auf einen neuen Zielrelease gebundener Datenrelease.

Die vier [Kandidatenschemata](../../schemas/candidates/ap23g2/) umfassen Katalog 4, Manifest 11, den lokalen Strukturmanifest und den aktuellen Forschungsinput. Sie liegen getrennt von nativen und historisch abgenommenen Schemata.

## Handlungen und Eröffnungsketten

Die zwölf allgemeinen Rechtsmittel-/Eingabegruppen werden um vier eigenständige Begründungsverlangen ergänzt. Die administrative Anforderung dauert in UR, SO und SH je zehn Tage. Die gerichtliche SH-Anforderung dauert 30 Tage und richtet sich an dasselbe Obergericht. Gesetzliche Dauern bleiben fest. Bei angeordneten Eingabetagesfristen stammt die Dauer aus der konkreten Anordnung. Die technische Eingabegrenze von 1–365 Tagen ist kein gesetzliches Maximum.

| Vertragsangabe | Positive Bedeutung und Grenze |
| --- | --- |
| `opening` | Ursprünglich vollständig begründeter Entscheid, konkrete Tagesanordnung oder der genau bezeichnete unbegründete Eröffnungstyp. SO/SH benötigen das ausdrückliche Anforderungsangebot |
| `openingChainPolicy` | Bei einem Beschwerdepfad ursprüngliche begründete Eröffnung oder nachträgliche Begründung unterscheiden. Im zweiten Fall muss `priorReasonsRequest` den Wert `timelyEstablished` haben |
| `requiredTargetCourt` | Bindung an UR-Obergericht, SO-Verwaltungsgericht oder SH-Obergericht. Keine Übertragung auf ein ähnlich bezeichnetes Spezialverwaltungsgericht |
| `requiredSameIssuingCourt` | Beim SH-Begründungsverlangen ist das entscheidende Obergericht zugleich Empfänger. Kein Bundesgerichtsweiterzug |
| `coordinationPolicy` | Die längste koordinierte UR-Beschwerdefrist wird nicht durch einen gewöhnlichen Zwanzigtagewert ersetzt. Die Grenze gilt nur bei den zwei Beschwerdepfaden, nicht pauschal bei einer konkret bestimmten Eingabetagesfrist |
| `localHolidayPolicy` | Konkret mögliche ungeklärte zusätzliche UR-Lokal-Endtagswirkung bleibt ohne definitives Ergebnis. Keine freie Vereinigung mit einer nicht erhobenen Gemeindeliste |
| `specialOpeningPolicy` | Wirksame UR-Eröffnung im normalen abgenommenen Sinn. Behauptete besondere Eröffnungsfolge oder zusätzliche Eröffnungsmängel nicht automatisch entscheiden |

Ein Begründungsgesuch und das spätere Rechtsmittel sind getrennte Handlungen. Das spätere Eröffnungsdatum wird nicht aus dem ersten Dispositiv oder einem Gesuchsdatum errechnet. Unbekannte oder verspätete Voranforderung schafft keinen automatisch neuen vollständigen Rechtsmittellauf. Nach dem SH-Obergerichtsbegründungsverlangen folgt insbesondere nicht nochmals eine gewöhnliche zwanzigtägige Beschwerde an dasselbe Gericht.

## UR Hinweis und eng begrenzte Sicherungen

`openingWarnings` ist für die neuen Pfade ausdrücklich vorhanden, nötigenfalls als leere Liste. Nur die beiden UR-Zwanzigtage-Rechtsmittelwege tragen `ur-art22-opening-restriction`. Das Profil prüft das qualifizierte Eröffnungsdatum gegen acht Tage vor bis acht Tage nach Ostern sowie 18. Dezember bis 6. Januar. Seine Wirkung lautet ausschliesslich `noticeOnlyNoDateChange`. Weder Empfang, Zählung noch Enddatum werden verändert. Die spätere blosse Durchquerung der Soll-Zeit löst keinen Eröffnungshinweis aus.

Die sieben neuen gerichtlichen Gruppen tragen die vorhandene Sicherung `blockWhenEnteringApplicableSuspension`. Sie betrifft nur die abgenommene reine Endverschiebung in neu beginnende anwendbare Ferien. Gewöhnliche Resttagezählung bleibt berechenbar. Verwaltungswege ohne Ferien erhalten diese Sicherung nicht. Die Behandlung ist eine begrenzte Produktabdeckung, keine behauptete gesetzliche Unberechenbarkeit.

SH-Verkürzungen, insbesondere 48 Stunden, werden nicht in zwei Tage umgerechnet. Fixtermine, Zahlungen, materielle Erfüllung, andere Zeiteinheiten, rückwärts laufende Fristen und besondere Eröffnungs-/Wiederherstellungsfälle bleiben ausserhalb der normalen Tagesqualifikation. Unbekannte und negative Eingaben sind im isolierten Inputschema darstellbar, aber nicht in positive Tatsachen umzudeuten.

## Physische Kalender und eigenständige Rechtsverwendung

Vier neue Verwendungen binden UR, SO, SH-Verwaltung und SH-Gericht. Die vorhandenen 33 Kalenderdateien bleiben unverändert. `physicalReuse.kind: sameDatesIndependentLegalBasis` hält dabei ausdrücklich fest, dass gleiche Daten weder eine Verfahrensberechtigung noch eine rechtliche Quellenrolle vererben. Konkreter Kalender, Kataloghash und genau ausgewählte Regel-IDs sind gebunden.

| Neue Verwendung | Eigenständige rechtliche Grundlage |
| --- | --- |
| UR | VRPV Art. 29 mit LSG Art. 9, Vierzehn-Tage-Kern und abgenommene lokale Grenze. Keine ArG-Teilmenge und keine freie kommunale Ergänzung |
| SO | VRG § 9 und GS 2014, 63, zwölf kantonale volle Prozesstage plus Bundesfeiertag. Keine regionale Ruhetagsvereinigung |
| SH Verwaltung | VRG/RTG und BGer 2C_483/2025 E. 3.1. Der 2. Januar ist ein eigenständiger Praxiszusatz mit `nonDispositiveCantonalLawDescription` und Reichweite nur für die neuen allgemeinen SH-Verwaltungswege |
| SH Gericht | VRG Art. 50 mit ZPO und JG, Gerichtsort nach ZPO Art. 142 Abs. 3 und gerichtlicher Berchtoldstagsbeleg OGE 40/2018/1/K |

Die SH-Verwaltungsbindung verwendet damit zwar dieselben physischen Datumsbytes wie die vorhandene SH-Gerichtsprojektion, leitet ihre Berechtigung aber ausdrücklich **nicht** aus `SH-ZPO-ADDITIONAL` ab. Die positiven eigenen VRG-/RTG-/BGer-Belege, der getrennte Praxiszusatz und die erwartete vollständige Datumsmenge sind zu prüfen. Die blosse Angabe `notDerivedFrom` oder ein neu berechneter Hash reicht dafür nicht.

Die spätere Rechenspur muss die neue rechtliche VRG-Praxisquelle von der historischen physischen Generatorherkunft unterscheiden. Sie darf den OGE-2018-Beleg nicht wieder als vermeintliche administrative Rechtsgrundlage ausgeben. Bestehende StPO-/ZPO-Januarbindungen bleiben unverändert. Die Fachabnahme von G1 ersetzt keine gemeinsame Releasequellenfreigabe.

## Zeitbindung Standards und spätere Integration

Für alle neuen Pfade gilt **29.08.2026–31.12.2027** als vollständiges Fallfenster. Eröffnung, sämtliche Zähl- und Stillstandstage sowie Endverschiebungen müssen in der anwendbaren Pfad-, Norm-, Quellen-, Kalender- und späteren Releasebindung liegen. Eine passende Norm am Empfangstag allein genügt nicht. Das Fenster ist kein gesetzliches Ablaufdatum und kein unbegrenzter Rechtsbeständigkeitsnachweis.

Persönliche Vorgaben bleiben **Format 5**. Gewöhnliche Auswahlen wie Kanton, Erlass, Pfad, Revision und Stufe dürfen erhalten bleiben. Eröffnungsherkunft, rechtzeitige Voranforderung, lokaler Einzelfall, Koordination, besonderer Eröffnungseinwand und andere aktuelle Fallqualifikationen werden nicht gespeichert oder aus Standards ergänzt. Ein älterer Reader darf einen unbekannten neuen Pfad weder in einen ähnlich benannten Altpfad umdeuten noch Browserdaten löschen.

Die neuen Vertragsangaben bedeuten keine gleich grosse Anzahl zusätzlicher GUI-Felder. Zweispaltiger Aufbau, frühe Datumseingabe, feste Einzelwerte und verständliche Rechenspur bleiben die Leitplanken. Was aus dem gewählten Weg folgt, wird abgeleitet oder statisch gezeigt. Aktuelle echte Falltatsachen bleiben davon getrennt. Die konkrete DE-/FR-Umsetzung gehört zu G3.

## Technische Vorlage und nächster Haltepunkt

Die tatsächlichen Kandidatenbytes, die semantischen Bindungen und die abgenommenen 115 Referenzen sind Gegenstand der isolierten Vertragsprüfung. Sie muss auch neu gehashte Fehlzuordnungen, fehlende Eröffnungs-/Praxisqualifikationen, falsche Gerichtszielbindung, Warn-/Ferienverwechslung, zeitliche Lücken und Aktivierungsversuche durch alte Leser erkennen. Der [getrennte Python-Nachweis](../../outputs/ap23g2-2026-10-22/QA-AP23G2-INDEPENDENT.json) prüft Schemata, Definitionen, Quellenrollen und Datumserwartungen am tatsächlichen Kandidaten. Er ist keine Produktcapability- oder Exportsperrprüfung.

Nach Vorlage des vollständigen technischen Ergebnisses sind **AP23G2 und DEC-2026-036 gesondert zu bestätigen**. Erst danach kann G3 beauftragt werden. Dort sind neuer nativer Reader, aktuelle Fallqualifikation, Hinweis-/Sperrweitergabe, konsistente Zielreleasebindungen und konkrete UI-/Export-/Hostintegration umzusetzen und zu prüfen. Die Kopien historischer Komponenten werden nicht durch ihre Aufnahme in diese Strukturprobe neu freigegeben.

Keine nativen Schema-, Runtime- oder Paketänderungen, keine Datenpromotion, gemeinsame Releasequellenfreigabe, Auslieferungsbauten, Commits, Quellpushs, Uploads, Installationen oder E/Q/P-Änderungen sind Teil von G2. Der nächste reguläre Release bleibt gemäss DEC-2026-034 bis zur vereinbarten Kantonsabdeckung gebündelt.

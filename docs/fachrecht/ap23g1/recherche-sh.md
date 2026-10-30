# AP23G1 Fachrecherche Schaffhausen

V0.1 vom 22. Oktober 2026. Fachlicher Vorschlag für [#48](https://github.com/davidsteimer/fristenrechner/issues/48), noch keine Fachabnahme und keine operative Freigabe. Untersucht sind allgemeine Verfahren vor kantonalen Verwaltungsbehörden und dem Obergericht. Produktcode, freigegebene Daten, historische Kalenderbindungen und Betrieb bleiben unverändert.

## Ergebnis und vorgeschlagener Umfang

Schaffhausen benötigt zwei getrennte Fristenregime. Vor Verwaltungsbehörden gelten grundsätzlich 20 Tage für den Rekurs und kein Fristenstillstand. Vor dem Obergericht gelten grundsätzlich 20 Tage für die Verwaltungsgerichtsbeschwerde und die drei Stillstandsperioden der ZPO. Tatsächlich in Tagen angeordnete Verfahrenseingaben sind je Stufe gesondert abzubilden.

Zwei zusätzliche Tagesfristen sind bereits gesetzlich bestimmt und sollten nicht untergehen. Die Begründung einer nach Art. 8 Abs. 3 Bst. b VRG unbegründet eröffneten Verwaltungsverfügung kann innert zehn Tagen verlangt werden. Für das Begründungsverlangen nach unbegründeter Eröffnung eines Obergerichtsentscheids gelten nach Art. 47 Abs. 2 VRG 30 Tage. Diese Handlung richtet sich an das entscheidende Obergericht, nicht an das Bundesgericht. Sie ist weder die ordentliche Verwaltungsgerichtsbeschwerde noch das zehntägige Begründungsverlangen nach Art. 239 ZPO.

**Die Feiertagsrolle ist für die Gerichtspfade geklärt.** Art. 50 Abs. 1 VRG verweist auf die ZPO. Deren aktueller Art. 142 Abs. 3 nennt den Gerichtsort, nicht den Wohnsitz einer Partei oder den Sitz ihrer Vertretung. Für das hier positiv qualifizierte Schaffhauser Obergericht gilt deshalb Schaffhausen. Die allgemeine Behördenortregel bleibt für die Verwaltung massgebend. Es gibt keine freie Vereinigung mit einem ausserkantonalen persönlichen Feiertagskalender.

**Der 2. Januar verlangt einen eigenen fachlichen Entscheid für die neue VRG-Bindung.** Das Ruhetagsgesetz nennt ihn nicht. Für Art. 142 Abs. 3 ZPO ist er in der Schaffhauser Praxis ausdrücklich anerkannt. Zusätzlich beschreibt das Bundesgericht am 12. März 2026 den Berchtoldstag unmittelbar bei der Darstellung des verwaltungsinternen Rekursfristenrechts als Feiertag. Ich schlage deshalb seine Aufnahme auch in den neuen administrativen VRG-Kalender vor. Dabei ist offenzulegen, dass dieser Satz für das konkrete bundesgerichtliche Ergebnis nicht tragend war. Die bestehende SH-/StPO-Januarfrage wird dadurch weder übertragen noch aufgehoben.

## Quellen und Fassungen

Abruf- und Prüfdatum ist der **22. Oktober 2026**. Die amtlichen Gesetzes-PDF und Registermetadaten sind lokal unter `outputs/ap23g1-2026-10-22/sources/sh/` gesichert. Entscheidsuche und Swiss Caselaw wurden beide berücksichtigt. Urteil und Publikationsdatum wurden anhand des Entscheidtexts getrennt.

| Kennung | Quelle und Fassung | Geprüfter Gehalt und Grenze |
| --- | --- | --- |
| SH-G1-VRG | [VRG, SHR 172.200, Version 2030](https://rechtsbuch.sh.ch/api/de/versions/2030/pdf_file), Stand 1. November 2025. [Amtliches Register](https://rechtsbuch.sh.ch/api/de/texts_of_law/172.200) | Art. 1, 7–11, 16, 18–24a, 26, 35–42, 47, 50, 57 und 59 samt Änderungstabellen. API bezeichnet 2030 als aktuelle Fassung, `future_versions` und `change_documents` leer, keine vorgemerkte Aufhebung. |
| SH-G1-JG | [JG, SHR 173.200, Version 2100](https://rechtsbuch.sh.ch/api/de/versions/2100/pdf_file), Stand 1. Mai 2026. [Amtliches Register](https://rechtsbuch.sh.ch/api/de/texts_of_law/173.200) | Gerichtsorganisation und Art. 44, 48 sowie Kapitel 7 Verfahrensbestimmungen abgeglichen. Keine eigene Feiertagsliste oder allgemeine Feriennorm in dieser Fassung. API bezeichnet 2100 als aktuell, ohne künftige Fassung oder vorgemerkte Aufhebung. Ein älterer JG-Stand 2024 ist nicht der aktuelle Primärbeleg. |
| SH-G1-RTG | [Ruhetagsgesetz, SHR 900.200, Version 1886](https://rechtsbuch.sh.ch/api/de/versions/1886/pdf_file), Stand 1. Januar 2007. [Amtliches Register](https://rechtsbuch.sh.ch/api/de/texts_of_law/900.200) | Art. 1–2 und Änderungstabelle. API bezeichnet 1886 als aktuelle Fassung, ohne künftige Fassung oder vorgemerkte Aufhebung. Feiertage sind nicht mit Personal-, Ladenöffnungs- oder ArG-Teillisten gleichzusetzen. |
| SH-G1-ZPO | [Amtliches Fedlex-XML der ZPO](https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2010/262/20260701/de/xml/fedlex-data-admin-ch-eli-cc-2010-262-20260701-de-xml.xml), Stand 1. Juli 2026 | Frisch heruntergeladen, Wortlaut Art. 142–146 gelesen. Gerichtsort in Art. 142 Abs. 3, Stillstand für gesetzliche und gerichtliche Fristen in Art. 145 Abs. 1, Wirkungen in Art. 146. |
| SH-G1-J1 | [OGE 60/2012/56, Entscheidkopie](https://entscheidsuche.ch/docs/SH_OG/SH_OG_001_60-2012-56_2021-02-03.pdf), **Entscheid vom 30. August 2013**, insbesondere E. 1d und Fussnoten 17–19 | Volltext gelesen. Gerichtliche ZPO-Ferien über Art. 50 VRG, nicht verwaltungsintern. Ausgangsfall betrifft politische Rechte und das damalige Wahlrecht. Kein positiver heutiger Wahlrechtspfad. Der in der Indexadresse enthaltene 3. Februar 2021 ist nicht das Entscheiddatum. |
| SH-G1-J2 | [OGE 40/2018/1/K vom 24. August 2018, amtlicher Amtsbericht 2018](https://sh.ch/CMS/get/file/771a1a2e-4ef2-47bb-9b04-f4afc5aed3ea), S. 84–87, E. 2.1.1–2.1.4. [Gelesene Einzelentscheidkopie](https://entscheidsuche.ch/docs/SH_OG/SH_OG_001_40-2018-1-K_2018-08-24.pdf) | Berchtoldstag als anerkannter Feiertag nach Art. 142 Abs. 3 ZPO. Bezug auf die Personalverordnung, das Europäische Fristenübereinkommen und das damalige BJ-Verzeichnis. Kein allgemeiner Beweis, dass jeder Personalfreitag ein Verfahrensfeiertag ist. |
| SH-G1-J3 | [BGer 2C_483/2025 vom 12. März 2026, amtlicher Volltext](https://search.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F12-03-2026-2C_483-2025&lang=de&type=show_document), E. 2.1–2.3 und 3.1–3.5 | E. 3.1 stellt Art. 9 und 20 VRG samt Ruhetagen dar und ergänzt den 2. Januar unter Verweis auf OGE 60/2025/8 E. 4.1. Ergebnisentscheidend war der 30. Dezember, nicht der 2. Januar. Prüfung kantonalen Rechts auf Willkür, keine neue gesetzliche Feiertagsnorm. Volltext amtlich und über beide Rechtsprechungsconnectoren gegengeprüft. |
| SH-G1-M1 | [Bericht und Antrag 25-01 des Regierungsrates vom 14. Januar 2025](https://sh.ch/CMS/get/file/45555770-f4c4-4ad8-985c-c8d89e3b84a6), S. 30–31 | Erläutert die dreissigtägige Obergerichtsfrist aus Art. 112 Abs. 2 BGG und die Abgrenzung zu erstinstanzlichen Spezialverwaltungsgerichten. Es handelt sich um Materialien zu einer Vorlage. Deren vorgeschlagene Art.-47- und Art.-50-Änderungen sind im aktuell ausgelesenen VRG 2030 nicht als geltender Text enthalten und werden nicht vorweggenommen. |

Der Regierungsratsbericht bestätigt auch das Datum 30. August 2013 des OGE 60/2012/56. Dass die damalige Wahlrechtskonstellation Ferien kannte, erlaubt keine heutige Wahlrechtsfreigabe. Spezialrecht und dessen spätere Änderungen sind gesondert zu prüfen.

## Verwaltung und Gericht im Normvergleich

| Gegenstand | Kantonale Verwaltung | Obergericht im allgemeinen Verwaltungsverfahren |
| --- | --- | --- |
| Allgemeine Grundlage | Art. 1 und 9 VRG | Art. 35 und 50 Abs. 1 VRG mit Art. 142–146 ZPO |
| Ordentliches Rechtsmittel | Rekurs innert 20 Tagen, Art. 20 Abs. 1 VRG. Typische kantonale Zielinstanz Regierungsrat nach Art. 16 | Verwaltungsgerichtsbeschwerde innert 20 Tagen, Art. 39 Abs. 1 VRG, soweit keine Spezialfrist |
| Beginn | Auslösetag wird nicht mitgezählt, Art. 9 Abs. 1 | Folgetag nach Art. 142 Abs. 1 ZPO, Beginn während anwendbarem Stillstand nach Art. 146 Abs. 1 gehemmt |
| Wochenende und Feiertage | Ende am Samstag oder öffentlichen Ruhetag verschiebt sich auf den nächsten Werktag | Ende am Samstag, Sonntag oder anerkannten Feiertag am Gerichtsort verschiebt sich auf den nächsten Werktag |
| Stillstand | Kein allgemeiner Stillstand. E. 1d OGE 60/2012/56 grenzt dies ausdrücklich ab | Grundsätzlich Ostern minus sieben bis plus sieben Tage, 15. Juli bis 15. August, 18. Dezember bis 2. Januar, jeweils einschliesslich. Gesetzliche und gerichtliche Tagesfristen |
| Erstreckung | Gesetzliche Fristen nicht erstreckbar, behördliche Fristen nur aufgrund konkreten bewilligten Gesuchs, Art. 10 | Art. 144 ZPO über Art. 50 VRG. Keine automatisch angenommene Erstreckung und kein neuer gesetzlicher Endtermin allein aus einem Gesuch |
| Fristwahrung | Art. 9 Abs. 2–3. Rechtzeitige Abgabe an die Behörde oder schweizerische Post, Schutz bei rechtzeitigem Eingang an unzuständige Behörde | Art. 143 ZPO sinngemäss. Tatsächliche Form und zugelassener Übermittlungsweg bleiben von der Datumsrechnung getrennt |
| Sonderrecht | Bundes- oder kantonalrechtliche Spezialnormen gehen vor | Art. 35 Abs. 2 und Art. 39 Abs. 1–2 VRG. Kantonales Steuerrecht ausdrücklich ohne Gerichtsferien, andere Spezialgebiete gesondert |

Art. 50 Abs. 2 VRG übernimmt ausdrücklich **nur Art. 4a, 4b, 6, 7 und 18 Abs. 2 VRG**. Art. 9, Art. 10 und Art. 8 werden dort nicht pauschal mitübernommen. Für Gerichtspfade ist deshalb weder die administrative Feiertagsregel an die Stelle von Art. 142 ZPO zu setzen noch die administrative Begründungsfrist von zehn Tagen an die Stelle von Art. 47 Abs. 2 VRG.

## Feiertagskalender und räumliche Anknüpfung

Art. 1 Abs. 1 Ruhetagsgesetz nennt sämtliche Sonntage und neun weitere Feiertage: Neujahr, Karfreitag, Ostermontag, 1. Mai, Auffahrt, Pfingstmontag, 1. August, Weihnachtstag und Stephanstag. Art. 2 qualifiziert hohe Feiertage, ergänzt aber keine weitere Nichtsonntagsliste. Ostersonntag, Pfingstsonntag und eidgenössischer Bettag sind als Sonntage bereits erfasst. Silvester, Reformationstag und ein anderer rein personalrechtlicher Schliessungstag werden nicht hinzuerfunden. Kein kommunales Sonderrecht und keine freie Vereinigung von Teilkalendern.

Für die Verwaltung gilt die allgemeine Behördenortregel gemäss DEC-2026-031. Art. 9 VRG enthält keine explizite alternative Wohnsitzanknüpfung. Für das Obergericht folgt die übereinstimmende Schaffhauser Ortsbindung ausdrücklich aus Art. 142 Abs. 3 ZPO. Eine Vertretung in Zürich oder eine Partei im Tessin verändert diese Bindung nicht.

### Der 2. Januar als eigener Praxisbefund

OGE 40/2018/1/K erkennt den 2. Januar in E. 2.1.4 ausdrücklich als Feiertag nach Art. 142 Abs. 3 ZPO an, obwohl er nicht in der allgemeinen gesetzlichen Ruhetagsliste steht. Tragende Gründe sind die besondere Behandlung dieses Tages und das Europäische Fristenübereinkommen. Das rechtfertigt den einzelnen Praxiszusatz, nicht die Übernahme des gesamten Verwaltungspersonalkalenders.

Für das verwaltungsinterne Verfahren kommt der aktuelle BGer 2C_483/2025 hinzu. E. 3.1 behandelt gerade den Rekurs an den Regierungsrat nach Art. 9 und 20 VRG und bezeichnet auch den 2. Januar als Feiertag. Dies ist mehr als ein blosser Transfer des ZPO-Falls von 2018. Das Gegenargument bleibt, dass der 2. Januar beim konkreten Fristablauf am 30. Dezember nicht entscheidend war und das Bundesgericht nur die Willkürkontrolle vornahm. Der dort genannte OGE 60/2025/8 wurde nicht als eigenständiger verfügbarer Volltext gefunden.

**Vorschlag zur Abnahme:** Für die neuen kantonalen SH-VRG-Verwaltungspfade die neun gesetzlichen Nichtsonntagstage um den 2. Januar ergänzen und diesen Zusatz ausdrücklich mit SH-G1-J3 begründen. Für Gerichtspfade denselben Feiertagsbestand verwenden, dort zusätzlich mit dem tragenden SH-G1-J2. Eine allfällige Nichtbestätigung des administrativen Zusatzes betrifft gezielt diese Regel. Sie führt nicht zu einer pauschalen StPO-Regelübernahme und nicht zum Verwerfen des ganzen SH-Kalenders. Vor Fachentscheid sind konkurrierende Ergebnisse nicht als definitives Fristresultat auszugeben.

## Die sechs vorgeschlagenen Forschungsgruppen

Die Kennungen sind fachliche Arbeitskennungen, keine bestätigten Produktidentitäten. Für sämtliche Gruppen gilt das vorgeschlagene Produktfenster **29. August 2026 bis 31. Dezember 2027** und die jeweils anwendbare Normfassung.

| Forschungs-ID | Handlung und Zielstelle | Dauer | Rechnung und positive Qualifikation |
| --- | --- | --- | --- |
| SH-ADMIN-20 | Ordentlicher Rekurs an den Regierungsrat gegen eine kantonale Verwaltungsanordnung | 20 Tage | Art. 20 Abs. 1 mit Art. 9 VRG, kein Stillstand. Vollständig begründete und ordnungsgemäss eröffnete Anordnung, keine Kürzung nach Art. 20 Abs. 2 und kein Spezialrecht |
| SH-COURT-20 | Ordentliche Verwaltungsgerichtsbeschwerde an das Obergericht gegen einen anfechtbaren kantonalen Endentscheid | 20 Tage | Art. 39 Abs. 1 und 50 VRG, ZPO Art. 142–146. Drei Stillstände im gewöhnlichen Verfahren. Keine Steuer-, Sozial-, Beschaffungs-, Wahl- oder andere Spezialregel |
| SH-ADMIN-ORDERED | Konkret angeordnete Verfahrenseingabe an eine feststehende kantonale Verwaltungsbehörde, etwa Vernehmlassung nach Art. 24 Abs. 2 oder Verbesserung nach Art. 21 Abs. 2 | Tatsächlich angeordnete Tageszahl | Art. 9–10 VRG, kein Stillstand. Keine erfundene gesetzliche Dauer, kein Fixtermin, keine Stundenfrist, keine materielle Leistungs- oder Zahlungsfrist |
| SH-COURT-ORDERED | Konkret angeordnete Verfahrenseingabe an das Obergericht im gewöhnlichen allgemeinen Verwaltungsverfahren, etwa Stellungnahme nach Art. 42 oder Verbesserung nach Art. 40 | Tatsächlich angeordnete Tageszahl | Art. 50 VRG mit ZPO Art. 142–146. Drei Stillstände, sofern der konkrete Verfahrensweg keinen Ausschluss vorsieht. Keine fixe Datums- oder Stundenfrist |
| SH-ADMIN-REASONS-10 | Schriftlich Begründung mit Rechtsmittelbelehrung bei der verfügenden kantonalen Verwaltungsbehörde verlangen | 10 Tage | Art. 8 Abs. 3 Bst. b mit Art. 9 VRG, kein Stillstand. Mitteilung ohne Begründung und ausdrücklicher Hinweis auf diese zehntägige Anforderung. Kein aus Vollgutheissung nach Bst. a erfundener Zehntagespfad |
| SH-COURT-REASONS-30 | Schriftliche Begründung des unbegründet eröffneten Obergerichtsentscheids beim selben Obergericht verlangen | 30 Tage | Art. 47 Abs. 2 und 50 VRG, ZPO Art. 142–146. Gesetzliche Tagesfrist im gewöhnlichen gerichtlichen VRG-Verfahren. Rechtlich massgebende Eröffnung des Dispositivs oder mündlichen Entscheids muss bereits feststehen. Keine ungeprüfte Gleichsetzung mit einem erstinstanzlichen Spezialverwaltungsgericht |

### Begründungsverlangen und spätere Rechtsmittelfrist

Art. 8 Abs. 3 Bst. b VRG ist ein eigenständiger Rechenschritt. Die folgende eigentliche Rechtsmittelfrist beginnt nach dem Gesetz mit Zustellung des begründeten Entscheids. Die App darf nicht beide Fristen ab der ersten unbegründeten Mitteilung parallel berechnen. Ohne Begründungsverlangen wird die Verfügung nach Ablauf der bezeichneten Frist rechtskräftig. Art. 8 Abs. 3 Bst. a betrifft eine andere Lage und begründet nicht automatisch denselben Anforderungspfad.

Art. 47 Abs. 2 VRG bestimmt selbst 30 Tage. Der subsidiäre ZPO-Verweis füllt Beginn, Berechnung und Stillstand aus, ersetzt aber nicht die speziell geregelte Dauer. Die Ferienanwendung folgt aus der gesetzlichen Tagesfrist im gerichtlichen VRG-Verfahren, Art. 50 Abs. 1 VRG und der allgemeinen Regel in Art. 145 Abs. 1 ZPO. Art. 47 enthält für diese Handlung keinen eigenständigen Ferienausschluss. Die Herkunft der Dauer aus Art. 112 Abs. 2 BGG macht die kantonale Anforderung noch nicht zum Bundesgerichtsverfahren. Bei Steuer- oder anderen spezialrechtlich ausgeschlossenen Verfahren ist dieser positive Normalpfad gerade nicht gewählt.

Art. 47 Abs. 1 ermöglicht eine vorgängige mündliche Eröffnung oder Zustellung des Dispositivs. Welche davon im konkreten Fall die rechtlich wirksame Eröffnung ist, wird nicht aus einem beliebigen Dokumentdatum erraten. Ein schon früher mündlich eröffneter Entscheid und ein späteres Papier können zwei verschiedene Daten aufweisen. Der positive Pfad setzt die rechtliche Klärung des Auslösers voraus. Fehlende oder widersprüchliche Belehrung bleibt ein Klärungsfall.

## Grenzen und offene Fachentscheide

| Kennung | Status und Gegenstand | Vorgeschlagene begrenzte Behandlung |
| --- | --- | --- |
| SH-O1 | Neuer fachlicher Kalenderentscheid zum 2. Januar im administrativen VRG-Verfahren. Gesetzestext und Praxisbefund sind verschieden | Positive Aufnahme gestützt SH-G1-J3 ausdrücklich bestätigen lassen. Den StPO-Vorbehalt unangetastet lassen. Ohne Bestätigung keine unkenntliche Vorentscheidung bei entscheidungserheblicher Abweichung |
| F1-O1-SH | Reine Wochenend-/Feiertagsendverschiebung führt erstmals in einen neu beginnenden gerichtlichen Stillstand | Art. 142 Abs. 3 und Art. 145 ZPO sind für SH-Gerichtspfade einschlägig. Der gelesene SH-Entscheid E. 1d entscheidet diese Kollision nicht. Keine eigenständig einschlägige SH-Primärentscheidung ermittelt. Eng begrenzte bestehende F1-O1-Behandlung für die betroffenen gerichtlichen Pfade vorschlagen, bis der gemeinsame Fachentscheid vorliegt. Kein zusätzlicher Ferienaufschlag und kein definitives Ersatzdatum. Verwaltung ohne Ferien ist nicht betroffen |
| SH-G1 | Dringlichkeitskürzung bis auf 48 Stunden nach Art. 20 Abs. 2 VRG | Kein Zwei-Tage-Ersatz. Standardrekurs nur bei ausgeschlossener konkreter Kürzung. Uhrzeit- und Stundenrechnung ausserhalb des Tagesrechners |
| SH-G2 | Vorrangiges Fachrecht, Spezialverwaltungsgerichte, Sozial- und Steuerrecht, politische Rechte, Beschaffung, Aufsicht, Revision und Normenkontrolle | Keine positive Freigabe aus den sechs Normalgruppen ableiten. Art. 35 und 36a VRG verlangen eine gesonderte Zuordnung. Eine bewusste Produktausgrenzung ist kein Befund, dass das Gesetz unklar sei |
| SH-G3 | Unbegründete Mitteilung, mündliche Eröffnung, Kenntnisnahme ohne Mitteilung, Zustellfiktion oder widersprüchliche Belehrung | Richtigen Handlungs- und Auslösetyp positiv qualifizieren. Keine gemeinsame Zwanzigtagesrechnung unabhängig vom Dokument. Keine automatische Heilung oder Wiederherstellung |
| SH-G4 | BGG-, ZPO- und andere eigene Verfahrensschritte | Die Obergerichtsbegründung ist kein Bundesgerichtsweiterzug. Keine generische gerichtliche Zehntagesfrist aus ZPO Art. 239 auf das Obergericht übertragen |
| SH-G5 | Behördliche Fixtermine, Zahlungen, materielle Leistungsfristen und rückwärts laufende Fristen | Nicht als angeordnete Verfahrenseingabe in Tagen behandeln. Keine neue GUI-Gruppe allein zur Bestätigung eines ohnehin festgelegten Datums |

## Zeitgeltung und Übernahmebedingungen

Für das vorgeschlagene Fenster 29. August 2026 bis 31. Dezember 2027 liegt die aktuelle VRG-Fassung seit 1. November 2025 und die aktuelle JG-Fassung seit 1. Mai 2026 vor. Im am 22. Oktober 2026 gelesenen Register ist keine künftige Fassung dieser beiden Erlasse und des Ruhetagsgesetzes publiziert. Das ist eine aktuelle Registerfeststellung, keine Garantie gegen spätere Änderungen. Die Vorlage 25-01 ist weder eine künftige konsolidierte Fassung noch ein Ersatz für die Registerprüfung vor Release.

Art. 59 VRG enthält eine Übergangsregel für die revidierten Art. 24 und 24a nach dem Zeitpunkt der Rekurserhebung. Daraus folgt keine Änderung der hier modellierten Zwanzig-, Zehn- oder Dreissigtagesdauer. Für vor dem Produktfenster eröffnete oder unter älterem Recht begonnene Verfahren wird keine pauschale Rückwirkung freigegeben.

Vor technischer Übernahme sind die sechs Handlungen, die positive Behandlung des administrativen Berchtoldstags, die eng begrenzte F1-O1-Sicherung und das Zeitfenster fachlich zu bestätigen. Danach folgen konkrete Kalender- und Quellenbindungen, Referenzfälle und technische Abnahme. Der Feiertagskatalog wird nicht aus dieser Forschungsnotiz operativ geändert. Historische AP5-Pins, bestehende StPO-Januarentscheidungen und die bisherigen Freigaben bleiben erhalten.

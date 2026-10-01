# AP20B Bundesquellen und zeitliche Bindung

Prüfdatum: 30. September 2026. **Fachlicher Quellenentwurf für AP20B, keine Abnahme, Datenpromotion oder Betriebsfreigabe.** Dieser Nachweis konkretisiert die abgenommene [AP20A-Fachmatrix](quellenpaket-ap20a.md) und ihre [Abnahme](abnahme-ap20a.md) für die vier eng abgegrenzten Verfahrenshandlungen nach EOG, FamZG, FLG, MVG und ÜLG.

## Ergebnis und vorgeschlagenes Quellenfenster

Für die 20 nationalen Handlungspfade kann nach dem heute publizierten und gelesenen Recht ein gemeinsames **Quellenfenster vom 1. Januar 2026 bis 31. Dezember 2027** vorgeschlagen werden. Die verwendeten ATSG-Berechnungsregeln, gewöhnlichen Rechtsmittelfristen und besonderen bundesrechtlichen Gerichtszuständigkeiten ändern innerhalb dieses Fensters nicht. Das bedeutet ausdrücklich nicht, dass die Erlasse materiell unverändert bleiben.

Der direkte amtliche Fassungsindex lieferte 15 einschlägige deutsche XML-Konsolidierungen für zehn Bundeserlasse. Alle 15 Originaldateien wurden erfolgreich abgerufen und geparst. Der Änderungsindex enthält 96 Änderungsauswirkungen mit Wirksamkeit zwischen 1. Januar 2026 und 31. Dezember 2027. Davon liegen 90 nach dem Prüfdatum, sämtlich am 1. Juli 2027 für EOG, EOV und FLG. Die bereits publizierten Folgefassungen wurden direkt mit den Vorgängern verglichen. Es besteht hier keine fehlende Zukunftskonsolidierung, die wie bei der früheren AVIV-Prüfung rekonstruiert werden müsste.

Zusätzlich wurden zwei ELG-Originalfassungen ausschliesslich für die Querverweisung von ÜLG Art. 19 auf ELG Art. 21 Abs. 2 frisch gelesen. Diese zusätzliche Querverweisquelle zählt nicht stillschweigend zu den zehn Hauptwerken beziehungsweise 15 Hauptoriginalen. Ihr eigener Index- und Textnachweis ist unten getrennt dokumentiert.

Das vorgeschlagene Fenster ist kenntnisstandsabhängig. Es bindet Auslöser, sämtliche durchlaufenen Zähltage, ermitteltes Ende und ein separat erforderliches Zuständigkeitsbezugsdatum. Eine spätere Publikation kann einen erneuten Abgleich oder eine Teilung verlangen. Vor AP20C-Integration und vor einem Release ist der Stand zu erneuern. Die bereits bestehende Begrenzung auf konkret geprüfte Berner Anbindungen und Feiertagsräume bleibt davon unberührt.

## Quellen und tatsächlich ausgeführte Prüfung

Die Quellenerschliessung begann beim Fedlex-Spiegel von Swiss Caselaw. Tragender Nachweis sind anschliessend die unmittelbar abgerufenen amtlichen XML-Originale und der amtliche Fedlex-SPARQL-Index. Ein zuerst nach bekanntem Dateinamensmuster versuchter Export lieferte nur die HTML-Oberfläche. Er wurde verworfen. Die erfolgreichen Exportadressen wurden danach ausschliesslich aus `jolux:isExemplifiedBy` im amtlichen Register aufgelöst.

Die eigentlichen Originalabrufe erfolgten am 30. September 2026 nach 20:24 UTC. Die Metadaten enthalten für jede Antwort den genauen Abrufzeitpunkt, die tatsächlich aufgelöste Adresse, Inhaltstyp, Bytezahl und SHA-256. Die Dateien wurden als Akoma-Ntoso-XML geprüft. Das Vergleichsskript trennt den Normtext von den Änderungsfussnoten, erhält aber den auf eine Fussnote folgenden Satzteil vollständig.

Maschinenlesbare Arbeitsnachweise:

- [Amtliche Fassungs- und Änderungsmetadaten](../../outputs/ap20b-2026-09-30/federal-source-indexes.json)
- [Originalprüfsummen und gelesene tragende Artikel](../../outputs/ap20b-2026-09-30/federal-source-originals.json)
- [Artikelgenauer Vergleich der aufeinanderfolgenden Fassungen](../../outputs/ap20b-2026-09-30/federal-source-comparisons.json)
- [Zusätzliche Querverweisung auf ELG Art. 21 Abs. 2](../../outputs/ap20b-2026-09-30/federal-source-elg-cross-reference.json)
- [Reproduzierbarer lesender Abruf](../../outputs/ap20b-2026-09-30/federal-source-fetch.py)

Die JSON-Dateien dokumentieren diesen Quellenabgleich. Sie sind weder ein Produktkatalog noch ein freigegebenes Quellenprüfereignis. Eine Byteidentität der neu abgerufenen XML-Exporte mit früheren AP19-Exportdateien wird nicht behauptet.

## Bundesrechtliche Bindungen

| Quelle und Originalfassungen | Für AP20B tragende beziehungsweise abgrenzende Normen | Bindung und Ergebnis |
| --- | --- | --- |
| [ATSG 01.01.2024][ATSG] | Art. 2, 38–41, 49, 51, 52, 55, 56, 58, 60, 61 | Einzelgesetzlicher Eintritt, Fristbeginn am Folgetag, Stillstand, Partei-/Vertretungsfeiertagsanker, 30 Tage Einsprache und 30 Tage ordentliche Beschwerde. Art. 39/40/41 begründen keine neue Produktfunktion für Eingabewahrung, Erstreckung oder Wiederherstellung. Im Index kein Änderungsereignis 2026–2027 |
| [EOG 28.01.2025][EOG25], [01.06.2026][EOG26], [01.07.2027][EOG27] | Art. 1, 17, 18, 24. Art. 20 zur Abgrenzung materieller Ansprüche | Die vier tragenden Artikel sind im normativen Text unverändert. Art. 18 Abs. 2 verlangt die Trennung formloser Festsetzung von formeller Verfügung. Art. 24 Abs. 1 gilt nur für kantonale Ausgleichskassen. Nichtkantonale Kassen sind nicht über ihren Sitz an Bern gebunden |
| [EOV 01.01.2025][EOV25], [01.06.2026][EOV26], [01.07.2027][EOV27] | Art. 19, 34, 35i, 35q. Art. 20 ergänzend aus dem Fassungsvergleich | Die vier Zuständigkeitsartikel bleiben unverändert. Art. 35q weist Adoptionsentschädigungen der EAK zu. Delegierte Berechnung durch einen Arbeitgeber ersetzt die qualifizierte Kasse und eine formelle Verfügung nicht |
| [FamZG 01.01.2026][FAMZG] | Art. 1, 3, 22 | Gerichtskanton folgt der tatsächlich anwendbaren Familienzulagenordnung. Art. 3 Abs. 2 umfasst gesetzlich eingeordnete höhere Ansätze sowie Geburts- und Adoptionszulagen. Finanzhilfen an Familienorganisationen sind kein positiver ATSG-Pfad. Im Index keine Änderung nach dem Prüfdatum bis Ende 2027 |
| [FLG 01.01.2024][FLG24], [01.07.2027][FLG27] | Art. 1, 13, 22, 25. Art. 10 aus dem Fassungsvergleich | Tragende Eintritts- und Rechtspflegenormen unverändert. Gericht am Ort der zuständigen kantonalen Ausgleichskasse. Der geänderte Art. 10 Abs. 4 betrifft die Leistungsfortdauer, nicht die Rechtsmittelfrist |
| [FLV 23.04.2014][FLV] | Art. 10 | Landwirtschaftliche Arbeitnehmende: kantonale Kasse des Arbeitgebers. Selbstständigerwerbende Landwirte: Kasse des Wohnsitzkantons. Keine pauschale Wohnsitzroute für beide Gruppen. Im Index kein Änderungsereignis 2026–2027 |
| [MVG 01.01.2024][MVG] | Art. 1, 22, 27, 104, 105 | Individuelle Leistungswege unterstehen ATSG. Medizinalrecht und Tarifwesen nach Art. 22–27 bleiben ausgeschlossen. Art. 104 seit 2007 und Art. 105 seit 2021 aufgehoben. Keine Wiederbelebung früherer Sonderfristen |
| [MVV 01.01.2026][MVV] | Art. 32a | Ein Vorbescheid ist optional und enthält keine gesetzliche feste 30-Tage-Einwandfrist. Eine konkret angesetzte positive Tagesfrist kann nur als ausdrücklich qualifizierte ADM-Anordnung behandelt werden. Die Änderungen am 01.01.2026 betreffen Art. 28a/28b, nicht Art. 32a |
| [ÜLG 01.01.2025][UELG] | Art. 1, 18, 19, 23 | Verwaltung über die EL-Organe des Wohnsitzkantons. Gerichtszuständigkeit separat nach Art. 58 ATSG. 15 Monate nach Art. 18 und die aufschiebende Wirkung nach Art. 23 sind keine zusätzlichen Tagesrechtsmittelpfade |
| [ÜLV 01.01.2025][UELV] | Art. 38 | Die grundsätzlich 90 Tage für den Erlass einer Verfügung betreffen das Durchführungsorgan. Kein neuer Fristauslöser und keine 90-Tage-Rechtsmittelfrist für die Partei. Im Index kein Änderungsereignis 2026–2027 |

Der allgemeine Gerichtsstand nach Art. 58 Abs. 1 ATSG knüpft an den Wohnsitz **zur Zeit der Beschwerdeerhebung** an. Für den engen Inlandspfad der versicherten Person darf der Verwaltungswohnsitz diesen Zeitpunkt nicht ersetzen. EOG Art. 24 Abs. 1, FamZG Art. 22 und FLG Art. 22 Abs. 1 gehen jeweils als besondere Gerichtsnorm vor. Ausland, Drittbeschwerden und Bundesgerichte bleiben ausserhalb des AP20-Erstumfangs.

Die gerichtliche Beschwerdeverbesserung bleibt eng auf Art. 61 Bst. b ATSG und den in AP19 sowie AP20A gelesenen [BGer 8C_767/2008 E. 4.3.2][BGER] begrenzt. Dieser Rechtsprechungsnachweis wird hier als dokumentierter Vorbefund wiederverwendet. Eine neue umfassende Rechtsprechungsrecherche oder eine erneute Lektüre der gesamten Entscheidung wird nicht behauptet. Kein allgemeiner ATSG-Stillstand für beliebige richterliche Fristen wird daraus abgeleitet.

## Zusätzliche Querverweisung auf ELG

ÜLG Art. 19 Abs. 1 bezeichnet die Organe nach **ELG Art. 21 Abs. 2**. Der [AP19B-Quellenabgleich](quellenabgleich-ap19b.md) und der [AP19C1-Refresh vom 25. September 2026](quellenabgleich-ap19c1.md) enthalten bereits einen Originalvergleich von ELG Art. 21 für die Fassungen 01.01.2026 und 01.01.2027. Dieser Vorbefund trägt die frühere Zuordnung, wurde für AP20B aber nicht nur stillschweigend übernommen.

Am 30. September 2026 um 20:31 UTC wurden der amtliche ELG-Fassungsindex, beide daraus aufgelösten XML-Originale und der zukünftige ELG-Änderungsindex nochmals direkt abgerufen. **Art. 21 Abs. 2 ist in beiden Fassungen wortgleich:** Die Kantone bezeichnen die für Entgegennahme, Festsetzung und Auszahlung zuständigen Organe. Sie dürfen die kantonalen Ausgleichskassen, nicht aber die Sozialhilfebehörden beauftragen. Die konkrete Zuweisung an die AK Bern benötigt zusätzlich EG ELG Art. 8 und wird im kantonalen AP20B-Nachweis gebunden. Die Wohnsitzanknüpfung des ÜLG folgt weiterhin dessen Art. 19 und wird nicht aus ELG Art. 21 Abs. 1 ersetzt.

| Zusätzliche Quelle | Frischer begrenzter Prüfumfang | SHA-256 des Originalexports |
| --- | --- | --- |
| [ELG 01.01.2026](https://www.fedlex.admin.ch/eli/cc/2007/804/20260101/de#art_21) | Art. 21 Abs. 2 | `e39f79e9aca4d307abb28f01adfd2a6cff1f37f902fd7e8ad18533c2980604f0` |
| [ELG 01.01.2027](https://www.fedlex.admin.ch/eli/cc/2007/804/20270101/de#art_21) | Art. 21 Abs. 2 | `943fe55f27d874f0977171ddebf8873847c76dcdb8fd19ca17a2b7dffea4d101` |

Der gesonderte ELG-Zukunftsindex lieferte zwei Auswirkungen per 01.01.2027, ausschliesslich Art. 10 und 11 aus AS 2026 434. Der heutige Befund stimmt damit für die benötigte Organbestimmung mit AP19 überein. Die genaue methodische Grenze bleibt: **neuer Originalabgleich der Querverweisung, keine erneute vollständige Fachprüfung des ELG.** Insbesondere werden die früheren Aussagen zur gesamten EL-Leistungsberechnung dadurch nicht neu abgenommen. Der eigene JSON-Nachweis enthält Abfragen, Zeitstempel, Antworten und Prüfwerte. Diese zwei zusätzlichen Auswirkungen sind nicht in den 96 Auswirkungen der zehn Hauptwerke enthalten.

## Änderungen 2027 und ihre Grenzen

[AS 2026 433][AS433] setzt die Änderung des EOG vom 19. Dezember 2025 auf den **1. Juli 2027** in Kraft. [AS 2026 457][AS457] setzt die zugehörige Verordnungsänderung vom 26. August 2026 auf denselben Tag in Kraft. Die beiden Änderungsakte wurden zusätzlich direkt als amtliches XML abgerufen. Übergangsbestimmungen und Inkraftsetzungsabschnitte wurden gelesen.

| Änderung | Bedeutung für AP20B |
| --- | --- |
| Neuordnung der Dienstentschädigung, Kinderzulagen und Mindest-/Höchstbeträge | Materielle Leistungsberechnung, nicht prozessuale Fristberechnung. Keine neue AP20-Rechenart |
| Erweiterte Betreuungskosten- und Betriebszulagen, Hospitalisierung und Adoptionsleistungen | Erweiterungen bundesrechtlicher EO-Leistungen bleiben von der Qualifikation eines individuellen formellen Leistungsfalls zu unterscheiden. Der Rechner entscheidet weder Anspruch noch Leistungsdauer |
| Übergangsbestimmungen zu bestehenden Diensten, Urlauben und Spitalaufenthalten | Regeln die zeitliche materielle Leistungsberechtigung. Keine Verschiebung der ATSG-Einsprache- oder Beschwerdefrist |
| Zusätzliche kantonale Ergänzungsmöglichkeiten, namentlich EOG Art. 16mbis, 16sbis und 16x | **Keine automatische Übernahme rein kantonaler Zusatzleistungen.** Positiver AP20-Gegenstand bleibt der qualifizierte bundesrechtliche EO-Leistungsstreit |
| FLG Art. 10 Abs. 4 und FamZV Art. 10 Abs. 2 | Fortdauer von Familienzulagen während bezeichneten Urlauben. Kein Wechsel des FamZG-/FLG-Gerichtsstands oder der gewöhnlichen Rechtsmittelfristen |
| EOV Art. 19b, 20 und Bescheinigungsnormen | Informations-/Durchführungsanpassungen. Kassenqualifikation und formelle Dokumentprüfung bleiben erforderlich |

Der Index nennt auch EOG Art. 1. Der direkte Normtextvergleich zeigt dort keine Änderung der ATSG-Verweisung. Der Änderungsakt bezeichnet im Eingang den Gliederungstitel vor Art. 1a, nicht eine neue ATSG-Eintrittsklausel. Die Indexzuordnung wird daher nicht als Änderung des Wortlauts von Art. 1 übernommen. Ein Indextreffer ist ein Prüfanlass, nicht automatisch eine neue materielle ATSG-Ausnahme.

FamZV gehört nicht zu den zehn vollständig abgefragten Erlasswerken dieses Nachweises. Die bezeichnete Änderung ihres Art. 10 Abs. 2 wurde als Anhang der amtlichen AS 2026 457 gelesen. Es wird kein vollständiger eigenständiger FamZV-Fassungsabgleich behauptet.

## Normgeltung und Quellenabdeckung getrennt halten

Ein Konsolidierungsdatum bezeichnet den Stand des Gesamterlasses und nicht das Inkrafttreten jedes darin enthaltenen Artikels. Ebenso ist der Beginn des beantragten Quellenfensters 01.01.2026 **kein gesetzliches Inkrafttreten**.

| Ebene | Fachliche Bindung |
| --- | --- |
| Gemeinsamer ATSG-Rechenvertrag | ATSG insgesamt seit 01.01.2003. Die hier verwendete aktuelle Fassung von Art. 38 Abs. 3 und Teilen der Stillstandsregel gilt gemäss amtlichen Änderungsfussnoten seit 01.01.2007 |
| EOG/FLG besondere Rechtspflege | Artikel seit ATSG-Einführung 01.01.2003. Auslandabsätze seit 01.01.2007 geändert, hier ausgeschlossen. Keine Rückdatierung des gesamten heutigen EO-Leistungsumfangs auf 2003 |
| FamZG | Ordentlicher Gesetzesbeginn 01.01.2009. Spätere Erweiterungen und Bereichsausnahmen haben eigene Zeitpunkte, beispielsweise Art. 1 Abs. 2 und Art. 3 Abs. 1 seit 01.08.2020. Nicht die ganze heutige Fassung als seit 2009 unverändert ausgeben |
| MVG | Für die gewöhnliche Beschwerde ist die Aufhebung der alten Art.-104-Sonderfrist auf 01.01.2007 relevant. Der eng modellierte heutige Pfad wird nicht rückwirkend auf die historische Sonderfrist erstreckt |
| ÜLG | Gesetz seit 01.07.2021. Keine Gleichsetzung mit dem Konsolidierungsstand 01.01.2025 |
| EOV-Zuständigkeitsnormen | Art. 19 in der gelesenen Fassung seit 01.01.2025, Art. 34 seit 01.01.2024. Die übrigen Teilnormen haben eigene Ursprünge. Nicht pauschal aus dem Erlassstand 01.06.2026 datieren |
| Dokumentiertes Anwendungsintervall AP20B | Vorschlag 01.01.2026–31.12.2027 nach Primärtexten und Änderungsindex. Das ist das geprüfte Quellenintervall, nicht eine Behauptung über den historischen Beginn sämtlicher Regeln |
| Produktaktivierung | Gesonderte Fach-, Vertrags-, Integrations- und Releaseabnahme. Dieser Bericht aktiviert keinen Pfad |

Wenn ein technisches Pflichtfeld einen Beginn verlangt, dessen exakter historischer Ursprung für die gesamte zusammengesetzte Regel nicht erhoben wurde, darf das Modell kein künstliches Datum als gesetzliches Inkrafttreten ausgeben. Es kann entweder den ursprünglichen Zeitpunkt offenlassen oder eine ausdrücklich benannte **nachgewiesene Anwendungsuntergrenze** verwenden. Für AP20B ist der vollständige historische Rückbau vor 2026 nicht notwendig.

## Konkrete zeitliche Fallmerkmale

- **EOG- und MVG-Verwaltung:** Vorschlag zum bestätigten Produktfilter: Wohnsitz BE am Datum der rechtlich massgebenden Eröffnung der formellen Verfügung beziehungsweise der konkreten Tagesanordnung. Das ist eine stabile, für den Eingabefall dokumentierbare Produktgrenze und keine gesetzliche Zuständigkeitsregel. Die zuständige Versicherung beziehungsweise Kasse muss daneben eigenständig qualifiziert sein.
- **EOG gesetzliche Kassenqualifikation:** Je nach Leistung gelten andere Zeitpunkte, etwa vor dem Einrücken nach EOV Art. 19, Geburt beziehungsweise letzter Urlaubstag nach Art. 34 oder Beginn des Entschädigungsanspruchs nach Art. 35i. Die EAK-Zuweisung nach Art. 35q ist nicht durch Wohnsitz BE oder einen Berner Kassensitz ersetzbar. AP20 berechnet diese Anspruchszuständigkeit nicht aus den Rohdaten neu.
- **Gericht nach Art. 58 ATSG:** Dokumentierter Wohnsitz der versicherten Person im rechtlich massgebenden Zeitpunkt der Beschwerdeerhebung. Bei Verbesserung bezieht sich dieser Befund auf die zugrunde liegende Beschwerde, nicht auf das spätere Zustelldatum der Verbesserungsanordnung.
- **Gericht nach EOG/FamZG/FLG-Sondernorm:** Qualifikation der erlassenden Kasse beziehungsweise der anwendbaren Zulagenordnung für den angefochtenen Entscheid. Kein erfundener allgemeiner Stichtag des aktuellen Wohnsitzes.
- **ÜLG-Verwaltung und FLG-Verwaltung:** Laufende gesetzliche Durchführung qualifizieren. Eine frühere Leistungsauszahlung oder ein veralteter Wohnsitz allein beweist nicht die Zuständigkeit für die konkrete Anordnung.
- **Feiertagsraum:** Separate Qualifikation nach Art. 38 Abs. 3 ATSG. Kein Versicherer-, Verwaltungs- oder Gerichtskanton als stillschweigender Ersatz.

Die produktseitige Stichtagsfestlegung und ihre konkreten technischen Felder sind Vorschläge zur AP20B-Abnahme, nicht rückwirkend in AP20A beschlossene Einzelheiten.

## Prüfbelege und Freigabegrenze

SHA-256 des amtlichen Fassungsindex: `3fcc60bf59ec2db31f18dcaf6eaa701749082e936fa1ebc1d4dc15edb5bf4876`.

SHA-256 des amtlichen Änderungsindex: `7ec6b22a63666064f8713e3bcef8c5fbff8cb0d7e4d10f587940aafa8b95f717`.

Zusätzliche Originalakte:

| Original | SHA-256 |
| --- | --- |
| AS 2026 433, amtliches XML | `426dce179ed527340aca94fabd06586f4c079a44ff104a6541e930ea5a4a1f06` |
| AS 2026 457, amtliches XML | `c4bed2a81372a2bca91c1f75f5f21b647a1fa8915f3fc5ff5e6b172ac05134f6` |

Die 15 Konsolidierungsprüfsummen stehen vollständig im Originalnachweis. Fremde Quelldateien wurden nicht in den Produktdatenbestand übernommen. Die beantragte Zeitabdeckung und die Sperrreferenzen bedürfen der AP20B-Fachabnahme. Kantonale Anschlussnormen, freiwillige FamZG-Kassenleistungen, technische Consumerkompatibilität und ausführbare Sollfälle werden in den übrigen AP20B-Nachweisen behandelt. Sie werden durch diesen Bundesbericht nicht als erledigt ausgewiesen.

[ATSG]: https://www.fedlex.admin.ch/eli/cc/2002/510/20240101/de
[EOG25]: https://www.fedlex.admin.ch/eli/cc/1952/1021_1046_1050/20250128/de
[EOG26]: https://www.fedlex.admin.ch/eli/cc/1952/1021_1046_1050/20260601/de
[EOG27]: https://www.fedlex.admin.ch/eli/cc/1952/1021_1046_1050/20270701/de
[EOV25]: https://www.fedlex.admin.ch/eli/cc/2005/187/20250101/de
[EOV26]: https://www.fedlex.admin.ch/eli/cc/2005/187/20260601/de
[EOV27]: https://www.fedlex.admin.ch/eli/cc/2005/187/20270701/de
[FAMZG]: https://www.fedlex.admin.ch/eli/cc/2008/51/20260101/de
[FLG24]: https://www.fedlex.admin.ch/eli/cc/1952/823_843_839/20240101/de
[FLG27]: https://www.fedlex.admin.ch/eli/cc/1952/823_843_839/20270701/de
[FLV]: https://www.fedlex.admin.ch/eli/cc/1952/896_916_912/20140423/de
[MVG]: https://www.fedlex.admin.ch/eli/cc/1993/3043_3043_3043/20240101/de
[MVV]: https://www.fedlex.admin.ch/eli/cc/1993/3080_3080_3080/20260101/de
[UELG]: https://www.fedlex.admin.ch/eli/cc/2021/373/20250101/de
[UELV]: https://www.fedlex.admin.ch/eli/cc/2021/376/20250101/de
[AS433]: https://www.fedlex.admin.ch/eli/oc/2026/433/de
[AS457]: https://www.fedlex.admin.ch/eli/oc/2026/457/de
[BGER]: https://entscheidsuche.ch/docs/CH_BGer/CH_BGer_008_8C-767-2008_2009-01-12.html

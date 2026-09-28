# AP19A · Quellen- und Abgrenzungspaket KVG

| Merkmal | Stand |
| --- | --- |
| Fassung | 0.1, Fachentwurf vom 25. September 2026 |
| Auftrag | Weitere bundesrechtliche Sozialversicherungsmodelle, national modelliert, zunächst nur Freigabekontext Bern |
| Ergebnis | Vier vorgeschlagene Pfade für individuelle Leistungen der obligatorischen Krankenpflegeversicherung, keine pauschale KVG-Abdeckung |
| Status | Recherche- und Modellgrundlage, keine Fachabnahme, Vertragsbestätigung, Datenpromotion oder Produktfreigabe |
| Bezug | [AP17B-Fachmatrix](vrpg-anwendbarkeit-ap17b.md), [AP17C-Integration](../architektur/vrpg-integration-ap17c.md) |

## 1. Ergebnis und Eintrittsbedingung

Art. 1 Abs. 1 KVG verweist auf das ATSG unter Vorbehalt ausdrücklicher Abweichungen im KVG und im KVAG. Dieser Eintritt ist zusammen mit Art. 2 ATSG zu modellieren. Das Wort «Krankenversicherung» oder die Zugehörigkeit eines Verfahrens zu einer Sozialversicherungsabteilung reicht nicht. [KVG][KVG], [ATSG][ATSG].

Die erste Tranche betrifft ausschliesslich individuelle Leistungsansprüche einer versicherten Person gegenüber ihrem Krankenversicherer aus der obligatorischen Krankenpflegeversicherung, beispielsweise die Übernahme von Behandlungskosten. Nicht geprüft wird dabei, ob die konkrete Behandlung materiell versichert ist. Einheitliche Bundesregeln erhalten keine fest eingebauten Bern-Bedingungen. Die territoriale Freigabe folgt getrennt in Abschnitt 4.

Besonders wichtig ist die Dokumentqualifikation: Nach Art. 80 Abs. 1 KVG werden Versicherungsleistungen im formlosen Verfahren nach Art. 51 ATSG gewährt, auch bei erheblichen Leistungen. Eine Leistungsabrechnung oder ein gewöhnliches Ablehnungsschreiben wird deshalb nicht allein wegen seines Inhalts als anfechtbare Verfügung eingeordnet. Die Verfügung muss fachlich identifiziert sein. Ihr Erlass beziehungsweise der Erlass eines Einspracheentscheids darf nicht von einem internen Instanzenzug abhängig gemacht werden. [Art. 80 und 85 KVG][KVG], [Art. 49 und 51 ATSG][ATSG].

## 2. Vier vorgeschlagene Bundespfade

Die IDs sind Arbeitskennungen, keine aktivierten Katalogeinträge. `SOC-30` und `SOC-DAYS` bezeichnen die bisherigen Rechenverträge, keine neue produktive Profilfreigabe.

| Arbeitskennung | Handlung und zulässiger Auslöser | Dauer und Rechnung | Normspur und Abgrenzung |
| --- | --- | --- | --- |
| `SOC-KVG-OKP-OBJ` | Einsprache gegen erstinstanzliche Leistungsverfügung des Krankenversicherers | 30 Tage, `SOC-30` | Art. 1 Abs. 1 KVG, Art. 52 Abs. 1 und 38–40 ATSG. Keine prozess- oder verfahrensleitende Verfügung |
| `SOC-KVG-OKP-APP` | Ordentliche Beschwerde gegen Einspracheentscheid über individuelle OKP-Leistungen | 30 Tage, `SOC-30` | Art. 1 Abs. 1 KVG, Art. 56 Abs. 1 und 60 ATSG. Keine direkte Beschwerde gegen gewöhnliche Erstverfügung |
| `SOC-KVG-OKP-ADM` | Ausdrücklich nach Tagen angeordnete Frist im laufenden individuellen OKP-Leistungsverfahren beim Krankenversicherer | Angeordnetes `N`, `SOC-DAYS` | Art. 1 Abs. 1 KVG, Art. 38–40 ATSG. Keine erfundene Standarddauer, keine Zahlungsfrist oder Frist zur materiellen Anspruchsanmeldung |
| `SOC-KVG-OKP-CORRECTION` | Gerichtliche Tagesnachfrist zur Verbesserung der Beschwerde gegen den bezeichneten Einspracheentscheid | Angeordnetes `N`, `SOC-DAYS` | Art. 60 Abs. 2 und Art. 61 Bst. b ATSG. Nur formelle Beschwerdeverbesserung, nicht jede gerichtliche Anordnung |

Die Gesetzesverweise sind im [ATSG][ATSG] und [KVG][KVG] nachgewiesen. Den üblichen Weg Verfügung → Einsprache → Einspracheentscheid → kantonale Beschwerde bestätigt ergänzend der [BAG-Ratgeber, S. 18–19][BAG]. Die vereinfachte Darstellung im Ratgeber ersetzt nicht die gesetzlichen Ausnahmen.

Für die enge Gerichtsnachfrist ist der bereits in AP17B verwendete Nachweis erneut geprüft: [BGer 8C_767/2008 vom 12. Januar 2009, E. 4.3.2][BGER] unterstellt die Nachfrist zur Nachreichung der Vollmacht als Beschwerdeverbesserung gemäss Art. 61 Bst. b ATSG dem Verweis von Art. 60 Abs. 2 ATSG. Die generelle Geltung der Fristbestimmungen für sämtliche richterlich angeordneten Fristen im kantonalen Rechtsmittelverfahren lässt das Gericht ausdrücklich offen. Der Entscheid betrifft nicht KVG-Leistungen. Seine Verwendung hier ist die begründete Übertragung der allgemeinen ATSG-Verfahrensaussage auf den geprüften KVG-Eintritt, keine Behauptung eines KVG-spezifischen Entscheids.

### Gemeinsamer Zählvertrag

- Der geklärte rechtliche Eröffnungstag ist Eingabe, der Folgetag ist kalendarischer Fristbeginn. Ungeklärte Zustellungsfiktionen oder konkurrierende Eröffnungen werden nicht automatisch entschieden.
- Es gelten die drei Stillstandsperioden nach Art. 38 Abs. 4 ATSG, soweit der jeweilige Pfad oben erfasst ist. Wochenenden innerhalb einer laufenden Frist zählen mit.
- Endet die Frist an einem Samstag, Sonntag oder massgebenden anerkannten Feiertag, erfolgt die Verschiebung nach Art. 38 Abs. 3 ATSG. Partei und Vertretung sind die gesetzliche Anknüpfung, nicht automatisch der Sitz des Versicherers oder Gerichts.
- Gesetzliche 30 Tage sind nicht frei änderbar. Die angeordnete Anzahl Tage muss ausdrücklich vorliegen. Erstreckung, Wiederherstellung und Eingabewahrung werden nicht durch das berechnete Datum bestätigt.
- Bestimmte Enddaten, Stunden- und Monatsfristen sowie materielle Leistungs- und Verwirkungsfristen bleiben ausserhalb dieser Tagespfade.

## 3. Ausschlüsse, bewusst getrennt nach Grund

| Konstellation | Warum kein Ergebnis aus den vier Pfaden? |
| --- | --- |
| Zulassung oder Ausschluss von Leistungserbringern | Gesetzlicher ATSG-Ausschluss nach Art. 1 Abs. 2 Bst. a KVG |
| Tarife, Preise oder Globalbudget als Streitgegenstand | Gesetzlicher ATSG-Ausschluss nach Art. 1 Abs. 2 Bst. b KVG. Die blosse Berührung einer Tariffrage in einem individuellen Leistungsstreit entscheidet die Zuordnung noch nicht |
| Prämienverbilligung und bezeichnete Bundesbeiträge | Gesetzlicher ATSG-Ausschluss nach Art. 1 Abs. 2 Bst. c KVG. Nicht als gewöhnliche OKP-Leistung behandeln |
| Streit zwischen Versicherern | Gesetzlicher ATSG-Ausschluss nach Art. 1 Abs. 2 Bst. d KVG |
| Kantonales Schiedsgericht, insbesondere Versicherer gegen Leistungserbringer | Gesetzlicher ATSG-Ausschluss nach Art. 1 Abs. 2 Bst. e KVG. Art. 89 KVG enthält eigene Zuständigkeits- und Verfahrensvorgaben, auch für die dort erfasste Vertretung der versicherten Person im Tiers-garant-System |
| Freiwillige Taggeldversicherung nach KVG | In Art. 1a Abs. 1 und Art. 67 KVG enthalten, kein pauschaler ATSG-Ausschluss. Bewusste Produktgrenze dieser ersten OKP-Tranche |
| Zusatzversicherung oder Taggeld nach VVG | Privatrechtlicher Versicherungsweg, nicht aus der KVG-Auswahl in ATSG umdeuten. Der Anbieter kann identisch sein, das Vertragsregime nicht |
| Prämienforderungen, Betreibung, Kostenbeteiligungsinkasso und Versicherungspflicht | Nicht automatisch gesetzlich ausserhalb des ATSG, aber ausserhalb des vorgeschlagenen individuellen Leistungsscope. Eigene Qualifikation und Referenzfälle erforderlich |
| Pflege-Restfinanzierung durch Kanton oder Gemeinde | Nicht gleich dem individuellen Leistungsanspruch gegen den Krankenversicherer. Kantonal geprägte Anspruchs- und Verfahrenswege gesondert prüfen |
| Blosse Abrechnung, formlose Mitteilung, E-Mail oder interne Reklamation | Ohne qualifizierte Verfügung beziehungsweise Einspracheentscheid kein Auslöser der vorgeschlagenen gesetzlichen 30-Tage-Pfade |
| Zwischenverfügung, Rechtsverweigerung oder Rechtsverzögerung | Andere Rechtsmittelkonstellationen. Art. 56 Abs. 2 ATSG erzeugt keine pauschale 30-Tage-Frist aus einem fehlenden Entscheid |
| Replik, Duplik, Kostenvorschuss oder sonstige gerichtliche Eingabe | Keine pauschale Übernahme der Nachfrist zur Beschwerdeverbesserung |
| Bundesverwaltungsgericht oder Bundesgericht | Anderes Verfahrensstadium und eigener Rechtsmittelvertrag, kein kantonaler KVG-Pfad |

Gesetzliche Ausnahme und noch nicht modellierter Fall müssen technisch unterschiedliche Sperrgründe bleiben. Ein gesperrter Produktpfad ist keine Aussage, dass das ATSG rechtlich unanwendbar wäre.

## 4. Nationales Modell und zunächst bernische Produktanbindung

| Element | National zu modellieren | Erste Berner Anbindung |
| --- | --- | --- |
| Eintritt und Handlung | KVG/OKP-Gegenstand, ATSG-Verweisung, gesetzlicher oder angeordneter Trigger | Nur die vier konkret geprüften Pfade, keine gesamte KVG-Auswahl freischalten |
| Verwaltungsstadium | Zuständiger Krankenversicherer als funktionale Stelle, nicht als kantonale Behörde | Berner Freigabekontext separat beschreiben. Ein Versicherer mit ausserkantonalem Sitz ist nicht allein deshalb ausgeschlossen oder einem anderen Feiertagskalender unterstellt |
| Gerichtszuständigkeit | Art. 57 und 58 ATSG, mit gesonderten Merkmalen für örtliche Zuständigkeit und Auslandsfälle | Zuständiges Verwaltungsgericht Bern muss feststehen. Deutschsprachige Sozialversicherungsabteilung oder Abteilung für französischsprachige Geschäfte gemäss Art. 54 Abs. 1 Bst. a und c GSOG |
| Gerichtliches Verfahrensrecht | Begrenzte ATSG-Bundesvorgaben neben dem kantonalen Verfahrensrecht nach Art. 61 ATSG | Nur die bezeichnete Beschwerde und formelle Verbesserung, keine allgemeine bernische Gerichtsfrist |
| Feiertagsanknüpfung | Partei und Vertretung mit eigenen räumlichen Ankern nach Art. 38 Abs. 3 ATSG | Anfangs die bereits geprüften Berner Anknüpfungen. Andere Kantone bleiben bis zu eigener Anbindungsprüfung gesperrt, obwohl der Bundespfad national verwendbar ist |
| Produktstatus | Freigabe nach Pfad, territorialer Anbindung und Zeitfassung als eigene Ebene | AP19A selbst aktiviert keinen Kanton und keine Berechnung |

Grundlagen: [ATSG][ATSG], [Art. 54 GSOG, Stand 1. Mai 2026][GSOG], [amtliche Gerichtsorganisation][VGB]. Die nationale Wiederverwendung bedeutet ausdrücklich nicht, dass ein gewöhnlicher Leistungsentscheid kantonales materielles Krankenversicherungsrecht hätte.

## 5. Geforderte Referenz- und Sperrproben

1. Jede der vier Arbeitskennungen erhält einen positiven Fall mit eindeutigem Gegenstand, Trigger und Berner Anbindung. Die beiden 30-Tage-Pfade müssen auch einen Stillstandswechsel und eine Endverschiebung abdecken.
2. Dieselbe Bundespfaddefinition muss mit einer ausserkantonalen Modellanbindung verwendbar sein, ohne Bern-Konstanten oder kopierte Bundesregeln. Diese Modellprobe bleibt produktiv gesperrt.
3. Ein ausserkantonaler Versicherersitz bei Berner Partei darf keine Änderung des ATSG-Feiertagsankers auslösen. Das Modell muss Sitz der Stelle, örtliche Gerichtszuständigkeit und Kalenderanknüpfung unterscheiden.
4. Für jede gesetzliche Ausnahme und jede Produktgrenze aus Abschnitt 3 mindestens eine negative Qualifikationsprobe. Insbesondere freiwilliges KVG-Taggeld nicht als gesetzlicher ATSG-Ausschluss beschriften.
5. Eine formlose Leistungsabrechnung darf weder zum Einspracheentscheid noch automatisch zur Verfügung werden. Eine gewöhnliche Erstverfügung darf den Beschwerdepfad nicht öffnen.
6. Fehlendes `N`, fester Endtermin und eine als Beschwerdeverbesserung bezeichnete Replik müssen sperren. Die gleiche Dauer von 30 Tagen darf einen falschen Rechtsmittelpfad nicht heilen.

Diese Proben sind Anforderungen an das folgende Referenzpaket. Dieses Quellenpaket behauptet weder ausgeführte Rechentests noch fachlich abgenommene Ergebnisse.

## 6. Quellenstand und offene Freigabefragen

| Quelle | Geprüfte Fassung / Abruf | Verwendung und Nachweisgrenze |
| --- | --- | --- |
| [KVG, SR 832.10][KVG] | Konsolidierung 01.07.2026 laut Fedlex-Spiegel, Abruf 25.09.2026 | Art. 1, 1a, 25, 64, 67, 80, 85, 87 und 89 über Swiss Caselaw `get_law`. Art. 1 zusätzlich über Omnilex im Wortlaut gegengeprüft |
| [KVG, frühere Fassung][KVG-ALT] | 01.01.2026, Abruf 25.09.2026 | Art. 1 aus historischem Fedlex-XML über `get_law` mit aktuellem Eintritt verglichen, unverändert. Kein vollständiger historischer Fassungsabgleich |
| [ATSG, SR 830.1][ATSG] | Konsolidierung 01.01.2024 laut Fedlex-Spiegel, Abruf 25.09.2026 | Art. 2, 38–40, 49, 51, 52, 56–58, 60 und 61 artikelbezogen über `get_law` gelesen |
| [GSOG, BSG 161.1][GSOG] | 01.05.2026, Abruf 25.09.2026 | Art. 54 über LexFind-Spiegel und amtliche BELEX-Websuche abgeglichen, Gerichtswebseite ergänzt Sprachzuordnung |
| [BAG-Ratgeber][BAG] | Angaben im Dokument: 01.01.2026, Abruf 25.09.2026 | Amtliche Erläuterung S. 18–19 zum üblichen Rechtsweg, keine selbständige Rechtsnorm |
| [BGer 8C_767/2008 vom 12. Januar 2009, E. 4.3.2][BGER] | Abruf 25.09.2026 | Entscheidsuche-Treffer und Swiss-Caselaw-Zitatprüfung, tragende Aussage über `check_claim_support` bestätigt. Nur begrenzte Beschwerdeverbesserung |

Die Fedlex-Weboberfläche lieferte beim direkten Textabruf lediglich den JavaScript-Hinweis. Die bundesrechtlichen Texte wurden deshalb über die bezeichneten artikelgenauen Zugänge gelesen. Ein direkter Volltext- oder Binärdownload sämtlicher amtlicher Fassungen wird hier nicht behauptet. Der Spiegel meldet beim KVG spätere Konsolidierungen ab 2028. Das ist ein Prüfanlass vor einer späteren Integration, kein Nachweis unveränderten künftigen Rechts.

**Ergänzender Originalabgleich am selben Tag:** Anschliessend waren die amtlichen XML-Fassungen direkt abrufbar. KVG Artikel 1, 67, 80, 85 und 89 sowie die im [Bundesrechtsinventar, Abschnitt 5](sozialversicherungsinventar-ap19a.md#5-quellenprüfung-und-zeitgrenzen) bezeichneten ATSG-Artikel wurden damit zusätzlich im Original gegengeprüft. Die Inhaltsbindungen stehen im Inventar. Das ergänzt den ursprünglichen Rechercheweg, ist aber weiterhin kein vollständiger historischer oder zukünftiger Fassungsabgleich.

Vor einer Produktfreigabe verbleiben: ausdrückliche Fachabnahme der Pfade und Produktgrenzen, Festlegung des Berner Freigabekontexts im Verwaltungsstadium ohne falschen Versicherersitzfilter, genaue Zeitabdeckung mit vollständigem betroffenen Fassungsabgleich sowie Ausführung der Referenz- und Sperrfälle. Die nationalen Definitionen und die kantonale Freigabe dürfen nicht zu einem einzigen Bern-Prädikat verschmelzen.

[KVG]: https://www.fedlex.admin.ch/eli/cc/1995/1328_1328_1328/20260701/de
[KVG-ALT]: https://www.fedlex.admin.ch/eli/cc/1995/1328_1328_1328/20260101/de
[ATSG]: https://www.fedlex.admin.ch/eli/cc/2002/510/20240101/de
[GSOG]: https://www.belex.sites.be.ch/data/161.1/de
[VGB]: https://www.vgb.justice.be.ch/de/start/ueber-uns/verwaltungsgericht.html
[BAG]: https://www.bag.admin.ch/dam/de/sd-web/eW3bxVwcU0qg/BAG_Ratgeber_Obligatorische_KV_d.pdf
[BGER]: https://mcp.opencaselaw.ch/entscheid/bger_8C_767_2008#e-4-3-2

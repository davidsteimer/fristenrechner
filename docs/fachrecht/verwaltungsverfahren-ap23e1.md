# AP23E1 Fachmodell für Luzern Zug und Appenzell Ausserrhoden

V0.1 vom 18. Oktober 2026. **Zur Fachabnahme vorgelegt, noch nicht abgenommen.** Auftrag: [#48](https://github.com/davidsteimer/fristenrechner/issues/48), ausdrücklich gestartet nach der [lokalen UX-Abnahme](../ux/abnahme-datumseingabe-issue50-lokal.md). David Steimer entscheidet und nimmt ab. Codex bereitet als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung vor.

## Ergebnis und Abnahmegegenstand

Die zweite Tranche umfasst **13 begrenzte Verfahrenspfade**. Luzern und Zug kennen für diese allgemeinen Verfahren keinen Fristenstillstand. In Appenzell Ausserrhoden gilt er auf der Obergerichtsstufe, nicht im verwaltungsinternen Verfahren. Die bestehenden Feiertagsdaten reichen inhaltlich aus, benötigen aber neue, eigenständig belegte Verwaltungs-Verwendungsbindungen.

| Kanton | Gesetzliche Rechtsmittel im vorgeschlagenen Umfang | Angeordnete Verfahrenseingaben | Stillstand |
| --- | --- | --- | --- |
| Luzern | Verwaltungsbeschwerde und Verwaltungsgerichtsbeschwerde je 30 Tage | Vor Verwaltung und Kantonsgericht, konkret angeordnete Tageszahl | Keiner |
| Zug | Verwaltungsbeschwerde 20 Tage, Verwaltungsgerichtsbeschwerde 30 Tage | Vor Verwaltung und Verwaltungsgericht, konkret angeordnete Tageszahl | Keiner |
| Appenzell Ausserrhoden | Rekurs 20 Tage, besonderer Vollstreckungsrekurs 5 Tage, Obergerichtsbeschwerde 30 Tage | Vor Verwaltung oder Obergericht, konkret angeordnete Tageszahl | Drei Perioden ausschliesslich bei den gerichtlichen Tagesfristen |

Die konkrete Pfadliste steht unten. Die Vorlage umfasst einen [Quellen- und Fassungsnachweis](quellenpruefung-ap23e1.md), [51 Referenzfälle](referenzfaelle-ap23e1.md) und vertiefte Fachnachweise für [LU](ap23e1/recherche-lu.md), [ZG](ap23e1/recherche-zg.md) und [AR](ap23e1/recherche-ar.md). 34 Fälle haben einen Datumssollwert. 17 Fälle bleiben bewusst ohne definitives Ergebnis. Die Referenzrechner sind vom Produktkern unabhängig.

**Ein enger Fachentscheid bleibt offen:** AR-O1, die Endverschiebung in einen neu beginnenden Stillstand. Vorgeschlagen ist eine sichtbare Sperre dieses Falltyps. Die Vorlage legt weder eine neue Formatversion fest noch aktiviert sie Kantone im Produkt. AP23E2 und AP23E3 sind noch nicht gestartet.

## Gemeinsamer positiver Fallrahmen

Die zuständige **kantonale Zielstelle**, der zulässige allgemeine Rechtsweg und die konkrete Handlung stehen fest. Massgebend ist die Stelle, an welche die fristgebundene Handlung gerichtet wird, nicht automatisch die eröffnende Ausgangsbehörde. Ein kommunaler Ausgangsentscheid ist deshalb nicht schon als solcher ausgeschlossen. Fristen vor kommunalen Zielinstanzen und eigenständiges kommunales Verfahrensrecht bleiben ausserhalb der Tranche.

Ordentliche Rechtsmittelfälle betreffen zunächst vollständig begründete, ordnungsgemäss eröffnete **Endentscheide beziehungsweise Endverfügungen**. Die Spezialgruppe AR-EXECUTION-5 setzt eine qualifizierte Vollstreckungsverfügung nach Art. 63 VRPG voraus. Tatsächliche rechtlich massgebende Zustellung, Tagesfrist und Vorwärtsrichtung sind geklärt. Keine abweichende Spezialnorm, Verkürzung, Verlängerung, Wiederherstellung oder sonstige Änderung der Frist wird unterstellt.

Angeordnete Fristen betreffen **Verfahrenseingaben**, beispielsweise Antwort, Stellungnahme oder Verbesserung, mit tatsächlich angeordneter Tageszahl. Kein fester Endtermin, kein abweichender Beginn, keine materielle Erfüllungsfrist und keine Zahlung. Die Forschungsgrenze 1–365 Tage ist eine technische Schutzgrenze, kein gesetzliches Maximum. Die präzise Produktbindung gehört in AP23E2.

Die Tageszählung beginnt am Folgetag. Wochenende und Feiertage zählen innerhalb der laufenden Frist mit. Nur anwendbare Stillstandstage werden übersprungen. Nach der Zählung wird ein unzulässiger Endtag verschoben. Der erste gezählte Tag nach einem Stillstand kann ein Sonntag sein. Das berechnete Datum bescheinigt nicht, dass eine konkrete Postaufgabe, Zahlung oder elektronische Übermittlung die Frist tatsächlich gewahrt hat.

## Dreizehn konkrete Pfade

| Forschungs-ID | Handlung und Ziel | Dauer | Stillstand | Hauptgrundlage |
| --- | --- | ---: | --- | --- |
| LU-ADMIN-30 | Ordentliche Verwaltungsbeschwerde an zuständiges Departement oder Regierungsrat | 30 Tage | Keiner | VRG §§ 130, 142–143 |
| LU-COURT-30 | Ordentliche Verwaltungsgerichtsbeschwerde an das Kantonsgericht | 30 Tage | Keiner | VRG §§ 130, 148–150 |
| LU-ADMIN-ORDERED | Angeordnete Verfahrenseingabe an kantonale Verwaltung oder Verwaltungsbeschwerdeinstanz | Angeordnete Tage | Keiner | VRG §§ 31–35, je nach Handlung §§ 135–136 |
| LU-COURT-ORDERED | Angeordnete Verfahrenseingabe im allgemeinen Beschwerdeverfahren vor Kantonsgericht | Angeordnete Tage | Keiner | VRG §§ 31–35, 135–136 |
| ZG-ADMIN-20 | Ordentliche Verwaltungsbeschwerde an die zuständige kantonale Verwaltungsinstanz | 20 Tage | Keiner | VRG §§ 39–43 |
| ZG-COURT-30 | Ordentliche Verwaltungsgerichtsbeschwerde | 30 Tage | Keiner | VRG §§ 61 und 64 |
| ZG-ADMIN-ORDERED | Angeordnete Verfahrenseingabe an kantonale Verwaltung oder Verwaltungsbeschwerdeinstanz | Angeordnete Tage | Keiner | VRG §§ 10–11, 15, 32, 44, 46 |
| ZG-COURT-ORDERED | Angeordnete Verfahrenseingabe im allgemeinen Beschwerdeverfahren vor Verwaltungsgericht | Angeordnete Tage | Keiner | VRG §§ 10–11, 65, 67–68 |
| AR-ADMIN-20 | Ordentlicher Rekurs an die zuständige übergeordnete kantonale Verwaltungsbehörde | 20 Tage | Keiner | VRPG Art. 30–31a |
| AR-EXECUTION-5 | Rekurs gegen eine qualifizierte Vollstreckungsverfügung an die kantonale Rekursbehörde | 5 Tage | Keiner | VRPG Art. 33 Abs. 1 und 63 Abs. 4 |
| AR-ADMIN-ORDERED | Angeordnete Verfahrenseingabe an kantonale Verwaltung oder Rekursinstanz | Angeordnete Tage | Keiner | VRPG Art. 4–6, 13, 35 Abs. 3 und 39 |
| AR-COURT-30 | Ordentliche Beschwerde an das Obergericht | 30 Tage | Drei Perioden | VRPG Art. 7, 54–55, 59 |
| AR-COURT-ORDERED | Angeordnete Verfahrenseingabe im allgemeinen verwaltungsgerichtlichen Verfahren vor Obergericht | Angeordnete Tage | Drei Perioden | VRPG Art. 4–7, 59 und konkrete Verfahrenshandlung |

Normtexte: [LU VRG](https://srl.lu.ch/api/de/versions/3793/pdf_file), [ZG VRG](https://bgs.zg.ch/api/de/versions/2740/pdf_file), [AR VRPG](https://ar.clex.ch/api/de/versions/1285/pdf_file). Die Forschungsnamen sind noch keine beschlossenen Produktidentitäten. Die ZG-Teilrecherche nennt die ersten zwei Wege auch ZG-43-20 und ZG-64-30. Für die gemeinsame Falltabelle gelten ZG-ADMIN-20 und ZG-COURT-30.

AR-EXECUTION-5 ist insbesondere **kein** SchKG-Rechtsmittel gegen Geldvollstreckung, keine blosse Mahnung, keine erneute Anfechtung der Hauptsache und keine automatische Fünftagesfrist für den anschliessenden gerichtlichen Weiterzug. Diese Abgrenzungen erhalten eigene Negativproben.

Der AR-Stillstand umfasst Ostern minus sieben bis plus sieben Tage, 15. Juli bis 15. August und 18. Dezember bis **2. Januar**, jeweils einschliesslich. Die frühere Grenze 1. Januar aus historischen Entscheiden wird nicht übernommen. Das Wort «dringlich» ist keine freie Abschaltoption für die Ferien. Richterlich bestimmte Fixtermine fallen nicht unter diese Tagesfristenregel und bleiben ausserhalb des Rechners.

## Feiertagsbindung ohne zusätzliche Ortsfelder

Nach [DEC-2026-031](../entscheidungen/DEC-2026-031-behoerdensitz-kantonale-verwaltungsverfahren.md) gilt der Sitz der zuständigen Zielstelle. In den geprüften allgemeinen Normen wurde keine ausdrücklich abweichende Partei- oder Vertreterortanknüpfung festgestellt. Bundesrechtliches Spezialrecht bleibt davon getrennt. Keine freie Feiertagskanton-Auswahl, kein erster Kalendertreffer und keine Vereinigung konkurrierender Listen.

| Kanton | Eigenständige rechtliche Bindung | Physische Vergleichsgrundlage aus MVP 0.8 |
| --- | --- | --- |
| LU | § 34 VRG und § 1a SRL 855. 13 Feiertagsregeln mit möglicher zusätzlicher Wirkung neben Wochenenden, ohne Josefstag und Patrozinium. 2. Januar, Oster- und Pfingstmontag ausdrücklich erfasst | `ap22-lu-b879eb8eb04f`, Herkunft RLG/VRG. Nicht die datumsähnliche JusG-Projektion als ungeprüfte Rechtsgrundlage verwenden |
| ZG | § 10 Abs. 3–4 VRG mit 16 benannten Tagen, davon drei stets sonntäglich | `ap22-zg-860e0f8e0e1a` |
| AR | Art. 5 VRPG, Art. 7 Arbeitsgesetz-Verordnung und Bundesfeiergrundlage. Stephanstag entfällt, wenn Weihnachten Montag oder Freitag ist. 2. Januar ist kein Feiertag dieser Liste | `ap22-ar-88bb22c08a22` |

Die bestehenden Projektionen wurden mit den neu hergeleiteten Listen für jeden Kalendertag 2026/2027 verglichen: **2’190 Übereinstimmungen der Endtagswirkung**. Dies ist ein Kalendervergleich, keine rückwirkende oder neue Fallfreigabe. Neun gesonderte Regelproben unterscheiden insbesondere den AR-Stephanstag und den 2. Januar. Die Proben 2028/2029 prüfen ausschliesslich die Kalenderkonstruktion.

Für LU ist die aktuelle Fassung von SRL 855 seit 27. September 2026 frisch bestätigt. § 1a ist gegenüber der bisherigen Quellenbindung inhaltlich unverändert. Titel- und Fassungsnachweise müssen im späteren Datenkandidaten trotzdem korrekt ergänzt werden. Bestehende Quellen-IDs, Kalender und Abnahmen werden nicht rückwirkend umgeschrieben.

## Bewusste Nichtaufnahme

| Konstellation | Warum kein automatisches Resultat aus den neuen Pfaden entsteht |
| --- | --- |
| Einsprache in LU oder ZG | Nicht mit Beschwerde verwechseln. LU § 119 kennt 20 beziehungsweise 10 Tage. ZG §§ 35–36 setzen einen besonderen Zulässigkeitsgrund voraus. Eigene Pfadqualifikation noch nicht aufgenommen |
| Begründungsverlangen, bloss dispositiver oder mündlicher Entscheid | LU § 111 und ZG § 20 Abs. 3 kennen eigene Begründungsschritte. ZG § 21 Abs. 3 knüpft bei mündlicher Eröffnung an die schriftliche Bestätigung an. Keine automatische Datumsrekonstruktion |
| Fehlende oder fehlerhafte Rechtsmittelbelehrung | Vertrauensschutz braucht Einzelfallprüfung. AR Art. 34 Abs. 2 kennt ausdrücklich zwei Monate, nicht 60 Tage |
| Selbständig anfechtbarer Zwischenentscheid | Zulässigkeit und konkrete Fristwirkung werden in dieser Tranche nicht pauschal qualifiziert. Der Rechner kann den erforderlichen Nachteil nicht beurteilen |
| Verkürzte ZG-Beschwerdefrist | § 43 Abs. 2 erlaubt bei Dringlichkeit Verkürzung bis auf 48 Stunden. Auch eine verkürzte Tageszahl ist kein ordentlicher 20-Tage-Pfad |
| Kostenvorschuss, andere Zahlung oder materielle Erfüllung | Kein Verfahrenseingabe-Pfad. ZG-Praxis zeigt zudem Auswirkungen eines nachträglichen Gesuchs um unentgeltliche Rechtspflege. Die Abgrenzung behauptet keinen allgemeinen Ferienausschluss für Vorschüsse |
| Sozial-, Bau-, Steuer-, Beschaffungs-, Kindes-/Erwachsenenschutz-, politische und weitere Spezialverfahren | Keine neue Freigabe über die allgemeinen Profile. AR-Bau- und Steuerrecht enthalten konkrete Stillstandsausnahmen. Die Feiertagsquelle AR-ArG-Verordnung selbst enthält einen besonderen 30-Tage-Rekurs. Die Ausschlussliste ersetzt keine rechtliche Fallqualifikation |
| Monats-/Jahresfrist, Fixtermin, Rückwärtsfrist, Zustellfiktion, Publikation, unklarer Auslöser, Erstreckung oder Wiederherstellung | Ausserhalb der qualifizierten vorwärts laufenden Tagesfrist. Keine erfundenen Fallfakten oder Ersatzfristen |

Die Nichtaufnahme ist eine begrenzte Produktentscheidung. Sie besagt nicht, dass alle ausgeschlossenen Fälle rechtlich unberechenbar wären oder zwingend einen anderen Algorithmus hätten. Bestehende freigegebene Spezialwege bleiben unverändert verfügbar.

## AR O1 zur ausdrücklichen Fachentscheidung

Empfang **18. Februar 2027**, ordentliche Obergerichtsbeschwerde, **30 Tage**:

1. Erster gezählter Tag ist der 19. Februar. Der 30. Tag ist **Samstag, 20. März**.
2. Nach Art. 5 wäre der nächste gewöhnliche Werktag **Montag, 22. März**.
3. Der Osterstillstand beginnt bereits am **Sonntag, 21. März** und dauert bis 4. April.

Norm, Materialien und die abgefragte Rechtsprechung klären die Reihenfolge der reinen Endverschiebung und des neu beginnenden Stillstands in diesem AR-Fall nicht hinreichend. Der steuerrechtliche BGer-Entscheid 2C_509/2010 hilft nicht weiter, weil dort gerade kein Stillstand anwendbar ist. TI-O2 ist kein AR-Präjudiz.

**Vorschlag:** Nur bei einer Endverschiebung in einen anwendbaren Stillstand kein definitives Enddatum und kein Export. Verständliche Diagnose mit letztem gezählten Tag, ausgelöstem Stillstand und Hinweis auf fachliche Prüfung. Das ist Fall AR09. Empfang am 17. Februar mit Ende 19. März bleibt als positiver Kontrast AR08 berechenbar. Die übrigen AR-Wege werden dadurch nicht pauschal gesperrt.

## Zeitfenster und Bedienfolgen

Vorgeschlagene erste Fachfenster:

- **LU: 27.09.2026–31.12.2027**, gestützt auf die konkret gelesene aktuelle Feiertagsfassung. Kein behaupteter Beginn der materiellen Feiertagsregel an diesem Tag.
- **ZG und AR: 29.08.2026–31.12.2027**, mit aktueller Normfassung und innerhalb der vorhandenen Kalenderuntergrenze.

Alle bewerteten Tage einschliesslich Zustellung, Stillstand und Endverschiebung müssen gedeckt sein. Zukunftsfälle stehen unter der Annahme unveränderter anwendbarer Normen. Kein unbefristeter Rechtsbeständigkeitsnachweis, keine neue Sozialfreigabe und keine Fallfreigabe 2028.

Für die spätere Oberfläche bleiben zweispaltiger Aufbau, frühe Datumseingabe und ruhige progressive Auswahl verbindlich. Gemeinwesen filtert Erlass, Stufe und Handlung bestimmen die Datenbindung. Gesetzliche Fristen sind nicht frei zwischen 20, 30 und 5 Tagen austauschbar. Angeordnete Eingaben verlangen nur ihre tatsächlich angeordnete Tageszahl. Einziger echter Auswahlwert wird fest angezeigt. Die Forschungsqualifikationen sind **kein Auftrag für neue Checkboxen oder redundante Dokumentfelder**. Grenzen und verständliche Rechtsgrundlagen gehören in Fallauswahl, Fehlermeldung und Rechenspur. DE/FR bleiben Produktsprachen.

## Abnahme und anschliessender Schritt

Zur Abnahme stehen die 13 Pfade, die begrenzten Verfahrenseingaben, die eigenständigen Kalenderbindungen, die vorgeschlagenen Zeitfenster und die Referenzfälle. Besonders zu bestätigen sind die Aufnahme des AR-Fünftagesrekurses und die enge Sperrbehandlung AR-O1. Die bewusst nicht aufgenommenen Konstellationen bleiben sichtbar abgegrenzt.

Nach der Fachabnahme folgt **AP23E2** mit konkreter Vertragsprobe, zeitlichen Bindungen und nicht freigegebenem Datenkandidaten. Ein Formatwechsel wird erst bei einer nachgewiesenen Vertragslücke vorgeschlagen. Die Prüfung muss insbesondere Endentscheid-/Vollstreckungsqualifikation, Zahlungsabgrenzung und Verkürzungsschutz ausdrücken können.

Produktcode einschliesslich der lokal abgenommenen CSS-Korrektur und der freigegebene MVP-0.8-Datenbaum sind durch den AP23E1-Checker bytegebunden als unverändert bestätigt. Keine Quellcommits, kein Push, kein Upload und keine Änderung von E/Q/P, AP5, Berechtigungen oder Betriebsfreigaben.

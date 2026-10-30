# AP23F1 Fachvorlage für Zürich, Aargau und St. Gallen

V0.1 vom 22. Oktober 2026. **Fachentwurf zur Abnahme, noch nicht abgenommen.** 17 Forschungsgruppen für allgemeine kantonale Verwaltungsverfahren. Die Kennungen sind Arbeitsidentitäten, noch kein technischer Produktvertrag. AP23F1 verändert weder Produktdaten noch Rechenregeln oder Betriebsfreigaben.

Der [nächste reguläre Release wird gebündelt](../planung/schweizausbau-nach-mvp09.md), bis die vereinbarte Kantonsabdeckung erreicht ist. Die heutige Vorlage ist eine kleine Fachtranche und kein Zwischenrelease. [DEC-2026-034](../entscheidungen/DEC-2026-034-gebuendelter-schweizausbau.md) hält diesen Planungsentscheid fest. MVP 0.9 bleibt der Betriebsstand.

## 1. Kurzbefund

| Kanton | Aufnahmekandidaten | Für die Rechnung entscheidend |
| --- | ---: | --- |
| Zürich | 4 | Rekurs und Verwaltung ohne Stillstand, ordentliche Beschwerde vor Verwaltungsgericht mit drei Perioden. Unterschiedliche Feiertagsgrundlagen für Verwaltung und Gericht. Verfahrensrevision ab 01.01.2027 beachten |
| Aargau | 5 | Verwaltungsinterne Beschwerde ohne Stillstand, Verwaltungsgericht grundsätzlich mit drei Perioden. Qualifizierter Vollstreckungsweg zehn Tage und grundsätzlich mit Stillstand. Neue VRPG-Verwendungsbindung an die vorhandene kantonsweite 14er-Prozessliste ausdrücklich bestätigen |
| St. Gallen | 8 | Ordentlicher Rekurs und Beschwerde grundsätzlich 14 Tage. Verwaltungsrekurskommission ist ein Gericht. Qualifizierte Fünftageswege nicht mit jedem Zwischenentscheid gleichsetzen. Keine allgemeine zweite gesetzliche Begründungsfrist |

Eine kurze Frist ist nicht automatisch ferienfrei. Ein «Rekurs» ist nicht automatisch ein Verwaltungsbehördenverfahren. Ein arbeitsfreier Tag ist nicht automatisch ein prozessual anerkannter Feiertag. Diese drei Unterschiede werden nicht durch Benutzer-Checkboxen ersetzt, sondern je Verfahrensweg rechtlich gebunden.

Tragend sind die aktuellen amtlichen Normtexte und die ausdrücklich bezeichneten Verweisungsketten. Die [Quellen- und Fassungsprüfung](quellenpruefung-ap23f1.md) dokumentiert die Nachweise, die ergänzenden Entscheidspiegel und die angekündigten Änderungen. Ausführliche Herleitung und Gegenargumente stehen in [Zürich](ap23f1/recherche-zh.md), [Aargau](ap23f1/recherche-ag.md) und [St. Gallen](ap23f1/recherche-sg.md). Der historische AP23A-Erhebungsstand bleibt unverändert.

## 2. Gemeinsamer positiver Fallrahmen

Die erste Aufnahme wird auf folgende Fälle begrenzt:

- Allgemeines kantonales Verfahren vor einer feststehenden **kantonalen Zielstelle**. Ein kommunaler Ausgangsentscheid schliesst einen belegten kantonalen Rechtsmittelweg nicht aus. Kommunale Zielverfahren und eigenständige kommunale Erlasse bleiben ausgeschlossen.
- Gesetzliche vorwärts laufende Tagesfrist oder tatsächlich angeordnete Tagesfrist für eine **Verfahrenseingabe**. Keine Zahlung, materielle Erfüllungsfrist, Rückwärtsfrist, Monatsfrist oder fester Endtermin.
- Zuständigkeit, Zulässigkeit, konkrete Handlung und rechtlich massgebende Eröffnung stehen fest. Vollständig begründeter Endentscheid für die ordentlichen Rechtsmittel. Keine offene Begründungsanforderung, Publikations-/Kenntnisnahmefrage, Zustellfiktion oder unrichtige Rechtsmittelbelehrung.
- Keine einschlägige abweichende Spezialnorm, bereits verlängerte oder wiederhergestellte Frist. Die angeordneten Eingabepfade sind kein Ersatz für unbekannte gesetzliche Rechtsmittelfristen.
- Bei gewöhnlichen gerichtlichen Ferienpfaden keine einschlägige Dringlichkeits-, Massnahmen- oder andere Ferienausnahme. Ausnahmen werden nicht allein anhand einer kurzen Tageszahl erkannt.

Der erste Zähltag ist grundsätzlich der auf die rechtlich massgebende Eröffnung folgende Tag. Anwendbare Stillstandsperioden werden nicht mitgezählt. Bei Eröffnung während eines Stillstands wird ab dem ersten Tag danach gezählt. Samstag, Sonntag und Feiertag innerhalb einer laufenden Frist werden ansonsten mitgezählt. Erst das Ende wird nötigenfalls auf den nächsten Werktag verschoben. F1-O1 unten grenzt eine besondere, noch nicht abschliessend belegte Endverschiebungskollision ab.

Die vorgeschlagene Fachfreigabe umfasst **keinen neuen Zustellungsassistenten**. Insbesondere wird die Wochenendregel für gewöhnliche Post nach Art. 142 Abs. 1bis ZPO nicht stillschweigend aus einem physischen Zugangstag rekonstruiert. Der vom Benutzer eingegebene rechtlich massgebende Eröffnungstag muss bereits geklärt sein. Das errechnete Datum bescheinigt keine tatsächliche fristwahrende Einreichung oder Zulässigkeit eines Übermittlungskanals.

## 3. Zürich: vier vorgeschlagene Pfade

Grundlagen: VRG §§ 11–12, 19–22, 41, 53 und 70–71. Die ergänzende gerichtliche Bindung führt über § 71 zum GOG und zur ZPO, insbesondere zu Art. 145–146. Die drei Ferienperioden reichen jeweils einschliesslich von Ostern minus sieben bis plus sieben Tage, vom 15. Juli bis 15. August und vom 18. Dezember bis 2. Januar.

| Forschungs-ID | Handlung und Ziel | Dauer | Stillstand | Feiertagsbindung |
| --- | --- | --- | --- | --- |
| ZH-REKURS-30 | Ordentlicher allgemeiner Rekurs an eine feststehende kantonale Rekursinstanz | Gesetzlich 30 Tage | Keiner | Verwaltungs-/Rekursbindung nach RLG, ZH-O2 beachten |
| ZH-ADMIN-ORDERED | Tatsächlich angeordnete Verfahrenseingabe an kantonale Verwaltung oder im Rekursverfahren | Angeordnete Tageszahl | Keiner | Wie vorstehend |
| ZH-COURT-30 | Ordentliche allgemeine Beschwerde an das Verwaltungsgericht | Gesetzlich 30 Tage | Drei Perioden | Gerichtliche GOG-Liste einschliesslich 2. Januar |
| ZH-COURT-ORDERED | Tatsächlich angeordnete Eingabe im qualifizierten ordentlichen Verwaltungsgerichtsverfahren | Angeordnete Tageszahl | Drei Perioden | Wie vorstehend |

§ 22 Abs. 3 erlaubt verkürzte Rechtsmittelfristen. Eine tatsächlich verkürzte Frist darf nicht als gewöhnlicher 30-Tage-Fall berechnet werden. Ein Rekurs wird auch dann nicht allein wegen des Namens der Zielinstanz zum Beschwerdeverfahren mit Gerichtsferien. Besondere Rechtsmittelzuständigkeiten und Sachgebiete sind nicht pauschal mitfreigegeben.

### Zürcher Revision ab 2027

Der Änderungsbeschluss vom 30.10.2023 wird nach **RRB 715/2025 zum 01.01.2027** wirksam. Der frühere Inkraftsetzungstermin 01.01.2026 darf nicht aus älteren Metadaten übernommen werden. Die gewöhnliche Tageszählung in § 11 Abs. 1 bleibt erhalten. Neu sind namentlich elektronische Eröffnung/Abruffiktion nach § 10a, Regeln zur fristwahrenden Übermittlung in § 11 Abs. 2–4 und die Kanalstörungsfolge in § 12 Abs. 3. Die Übergangsregel erfasst auch bereits hängige Verfahren.

Vorschlag für das erste Modell: 2026 und 2027 zeitlich getrennt belegen, aber die gewöhnliche Rechnung auch 2027 anbieten, **nur wenn Eröffnung und gewöhnlicher Fristlauf feststehen**. Keine Berechnung einer streitigen Abruffiktion oder störungsbedingten Verlängerung. Keine Zusicherung, dass Papierpost für jede Person oder jeder elektronische Kanal tatsächlich verfügbar beziehungsweise zulässig sei. ZH-O3 ist eine ausdrückliche Modellgrenze, keine Behauptung unveränderter Gesamtverfahrensregeln.

## 4. Aargau: fünf vorgeschlagene Pfade

Grundlagen: VRPG § 28 verweist für die Fristen auf die ZPO, beschränkt den Stillstand aber auf Verwaltungsjustizbehörden. Regierungsrat und ein zuständiges Departement als verwaltungsinterne Beschwerdeinstanz bleiben Verwaltungsbehörden. Die ordentliche Frist folgt §§ 44 und 54, der besondere Vollstreckungsweg § 83 Abs. 1.

| Forschungs-ID | Handlung und Ziel | Dauer | Stillstand |
| --- | --- | --- | --- |
| AG-ADMIN-30 | Ordentliche Beschwerde an Regierungsrat oder zuständige delegierte kantonale Verwaltungsinstanz | Gesetzlich 30 Tage | Keiner |
| AG-COURT-30 | Ordentliche allgemeine Beschwerde an das Verwaltungsgericht | Gesetzlich 30 Tage | Drei ZPO-Perioden |
| AG-ADMIN-ORDERED | Tatsächlich angeordnete Verfahrenseingabe an kantonale Verwaltung oder verwaltungsinterne Beschwerdeinstanz | Angeordnete Tageszahl | Keiner |
| AG-COURT-ORDERED | Tatsächlich angeordnete Eingabe im qualifizierten ordentlichen Verwaltungsgerichtsverfahren | Angeordnete Tageszahl | Drei ZPO-Perioden |
| AG-EXECUTION-10 | Beschwerde gegen qualifizierten Vollstreckungsentscheid nach § 83 Abs. 1 an das Verwaltungsgericht | Gesetzlich 10 Tage | Grundsätzlich drei ZPO-Perioden, sofern kein eigenständiger Ausnahmefall |

Für alle fünf Pfade wird die unten erläuterte kantonsweite 14er-Prozessliste vorgeschlagen. Ein Aargauer Gemeinde- oder Bezirksfeld ist dafür nicht nötig. Spezialverwaltungsgericht und Versicherungsgericht sind durch diese fünf allgemeinen Pfade nicht neu aktiviert.

Der Vollstreckungsweg ist direkt kantonal belegt, insbesondere durch **WBE.2024.299 vom 31.03.2025** zum Zehntagesweg und Sommerstillstand. Er umfasst nicht Geld-/Sicherheitsleistungen nach SchKG, die Vollstreckung verwaltungsgerichtlicher Urteile nach § 79, blosse Mahnungen oder materielle Erfüllungsfristen. Der selbständige Kostenentscheid folgt nach § 83 Abs. 2 dem ordentlichen Instanzenzug. Bei einem kombinierten Sach-/Vollstreckungsentscheid muss die angefochtene Anordnung feststehen. Die längere Sachfrist verlängert den Vollstreckungsteil nicht.

Der Ferienausschluss für qualifizierte vorsorgliche Massnahmen bleibt getrennt. Der historische BGer-Entscheid 1C_439/2015 nennt Art. 248 **lit. c** ZPO. Seit 01.07.2026 stehen vorsorgliche Massnahmen wegen der eingefügten Besitzesschutzregel in **lit. d**. Dieser Buchstabenwechsel ist kein Wegfall der Ausnahme. Solche Massnahmen sind keine positiven AG-COURT-30- oder AG-COURT-ORDERED-Standardfälle.

## 5. St. Gallen: acht vorgeschlagene Pfade

Grundlagen: VRP Art. 30, 44, 47–48, 59–60 und 64. Die ordentliche Frist beträgt **14**, nicht 30 Tage. Art. 30 Abs. 2 lit. a schliesst den Stillstand vor Verwaltungsbehörden aus. Vor der Verwaltungsrekurskommission und dem Verwaltungsgericht gelten grundsätzlich die drei ZPO-Perioden, soweit keine Ausnahme nach Art. 30 Abs. 2 lit. b–f greift.

| Forschungs-ID | Handlung und kantonales Ziel | Dauer | Stillstand |
| --- | --- | --- | --- |
| SG-ADMIN-14 | Ordentlicher allgemeiner Rekurs an eine zuständige kantonale Verwaltungsbehörde | Gesetzlich 14 Tage | Keiner |
| SG-VRK-14 | Ordentlicher Rekurs an die Verwaltungsrekurskommission in feststehender allgemeiner VRP-Zuständigkeit | Gesetzlich 14 Tage | Drei Perioden, keine Abgabensache oder andere Ferienausnahme |
| SG-COURT-14 | Ordentliche allgemeine Beschwerde an das Verwaltungsgericht | Gesetzlich 14 Tage | Drei Perioden, keine Ferienausnahme |
| SG-ADMIN-MEASURES-5 | Erstrekurs gegen qualifizierte vorsorgliche oder Vollstreckungsmassnahme an eine feststehende kantonale **Verwaltungsinstanz** | Gesetzlich 5 Tage | Keiner |
| SG-COURT-INTERIM-5 | Zulässige Beschwerde gegen eine qualifizierte vorsorgliche Massnahme nach Art. 60 lit. a an das Verwaltungsgericht | Gesetzlich 5 Tage | Keiner, Art. 30 Abs. 2 lit. f, richtige Ausnahmebelehrung steht fest |
| SG-ADMIN-ORDERED | Tatsächlich angeordnete Eingabe an Verwaltung oder verwaltungsinterne Rekursinstanz, auch eine konkret angesetzte Ergänzung nach Art. 48 | Angeordnete Tageszahl | Keiner |
| SG-VRK-ORDERED | Tatsächlich angeordnete Eingabe im qualifizierten allgemeinen Verfahren vor Verwaltungsrekurskommission | Angeordnete Tageszahl | Drei Perioden, keine Ferienausnahme |
| SG-COURT-ORDERED | Tatsächlich angeordnete Eingabe im qualifizierten ordentlichen Verfahren vor Verwaltungsgericht | Angeordnete Tageszahl | Drei Perioden, keine Ferienausnahme |

Alle Pfade verwenden die St. Galler VRP-Feiertage am Zielort, **ohne zusätzlichen 2. Januar als Feiertag**. Davon unabhängig reicht der gerichtliche Winterstillstand bis einschliesslich 2. Januar.

Art. 48 begründet eine tatsächlich angesetzte Ergänzungsfrist, keine automatische zweite gesetzliche Begründungsfrist. Art. 44 Abs. 3 erklärt den Rekursentscheid über Vollstreckungsmassnahmen für endgültig. Deshalb kein automatischer weiterer Fünftagesweg an das Verwaltungsgericht. Nicht jeder Zwischenentscheid oder jede Beweisanordnung ist eine vorsorgliche Massnahme.

Ein erster Massnahmenrekurs an die **Verwaltungsrekurskommission** ist noch kein positiv freigeprüfter Fünftagespfad. Das ist die bewusst enge Forschungsgrenze SG-G1, nicht die Behauptung einer unklaren allgemeinen Fünftagesnorm. Steuer-/Abgabenrecht, KESR, Beschaffung, Sozialversicherung, politische Rechte und weitere besondere Wege bleiben gesondert. Bei gerichtlicher Ausnahme ist die Belehrungsfrage SG-O1 zu beachten. Für gewöhnliche Verwaltungsfälle ohne Stillstand wird keine unnötige Ausnahmebestätigung verlangt.

**Konkreter positiver VRK-Anwendungsfall:** Formelle Verfügung eines kantonalen Departements über den Zugang zu amtlichen Dokumenten nach Art. 17 Öffentlichkeitsgesetz, sGS 140.2. VRP Art. 41quater Abs. 1 lit. abis weist diesen Rekurs der VRK zu. Art. 18 Abs. 1 OeffG verweist den Rechtsschutz auf das VRP. Der gelesene geltende OeffG-Text enthält keine eigene Rechtsmittel- oder Ferienabweichung. Dies unterlegt SG-VRK-14 sowie tatsächliche Verfahrenseingaben nach SG-VRK-ORDERED. Die vorgelagerte 14-Tage-Frist zum **Verlangen einer Verfügung** nach einer blossen Stellungnahme ist eine andere Handlung und nicht mitfreigegeben. Der konkrete Beispielfall ist keine pauschale Freigabe aller OeffG-Fristen oder aller VRK-Sachgebiete.

## 6. Feiertagsbindungen und bestehender Kalenderbestand

Die Bindung folgt [DEC-2026-031](../entscheidungen/DEC-2026-031-behoerdensitz-kantonale-verwaltungsverfahren.md). Ziel ist der Sitz der für die Handlung zuständigen Stelle, nicht automatisch der Ausgangsbehörde. Die ZPO-Verweisung ist **keine** Verweisung auf den Partei- oder Vertreterort. Die frühere vorläufige Zuordnung in AP23A wird für diese neue Verwendung ausdrücklich berichtigt, ohne das historische Dokument oder bestehende Bundesbindungen umzuschreiben.

| Neue Verwendung | Vorgeschlagene Menge | Verhältnis zu MVP 0.9 |
| --- | --- | --- |
| ZH Verwaltung/Rekurs | RLG-Liste mit neun Feiertagsregeln ohne eigenständigen 2. Januar. ZH-O2 bleibt begrenzt vorbehalten | Aus vorhandenem Katalogbereich `ZH-RLG-ALL` neu zu projizieren. Keine Änderung der bisherigen gerichtlichen Zehnerliste |
| ZH Gericht | Zehn GOG-Feiertage einschliesslich 2. Januar | Vorhandene Projektion `ap22-zh-5aa2974cffee` wiederverwendbar, neue Verwendungsbindung nötig |
| AG, alle vorgeschlagenen VRPG-Stufen | Kantonsweite 14er-Prozessliste nach § 21 EG ZPO | Vorhandene Projektion `ap22-ag-21d6f2634ce0`, Bereich `AG-ZPO-ALL`. Kein neuer Kalenderfehler in MVP 0.9, sondern neue VRPG-Verwendungsentscheidung |
| SG, alle vorgeschlagenen VRP-Stufen | RLG-Liste ohne zusätzlichen 2. Januar, neun werktagsrelevante Feiertage und die ohnehin erfassten Sonntage | Vorhandene Basisprojektion `ap22-sg-79009d6d6021` mit zwölf Regeln. Nicht die abweichende ZPO-Projektion `ap22-sg-f95068e3b162` mit zusätzlichem Januarvorbehalt verwenden |

Die 14 Aargauer Tage sind Neujahr, Berchtoldstag, 1. Mai, 1. August, Mariä Himmelfahrt, Allerheiligen, Mariä Empfängnis, Weihnachten und Stephanstag sowie Karfreitag, Ostermontag, Auffahrt, Pfingstmontag und Fronleichnam. Die regionale arbeitsrechtliche Liste ist kein Ersatz. **Die Übernahme für VRPG bleibt eine ausdrücklich zu bestätigende systematische Auslegung:** § 28 VRPG übernimmt die ZPO-Fristberechnung, § 21 EG ZPO konkretisiert dafür die kantonsweit anerkannten Tage. Das Gegenargument des zivilprozessualen Geltungsbereichs des EG ZPO wird nicht verschwiegen. BGer 2E_8/2024 bestätigt die Bedeutung der Liste ausserhalb eines unmittelbaren ZPO-Prozesses, ist aber kein direktes VRPG-Präjudiz zu allen 14 Tagen.

Die Quellenprüfung bindet die heutigen Kalenderbytes. Sie erzeugt keine neuen Kalenderdateien, hebt keine Januarvorbehalte anderer Bundesprofile auf und ändert keine bestehende Rolle, Region oder Freigabe. Neue Verwendungen sind erst nach Fach- und Vertragsentscheid zu integrieren.

## 7. Vorgeschlagenes Zeitfenster

Für alle 17 Forschungsgruppen wird zunächst **29.08.2026 bis 31.12.2027** vorgeschlagen. Eröffnung, alle gezählten Tage, Stillstand und tatsächliche Endverschiebung müssen im gedeckten Fenster liegen. Ein Empfang im Dezember 2027 mit Ende 2028 ist damit nicht freigegeben. Die Grenze ist eine Produktfreigabegrenze, kein gesetzliches Ablaufdatum oder unbegrenzter Beständigkeitsnachweis.

Zürich braucht die getrennte Bindung vor und ab 01.01.2027. Das St. Galler Gerichtsgesetz liegt bereits in einer publizierten Nachfolgefassung ab **01.06.2027** vor. Die geprüften Änderungen betreffen Organisationsfragen, nicht die verwendeten Rechenregeln. Trotzdem sind beide Fassungen zeitlich korrekt zu belegen. Das Fehlen weiterer publizierter Zukunftsfassungen ist keine Zusicherung dauerhafter Rechtsbeständigkeit. Vor dem gemeinsamen Release folgt ein erneuter Gesamtquellenabgleich.

Bestehende Sozialfreigaben werden dadurch weder zeitlich noch ausserkantonal erweitert. Nachgelagerte Bundesrechtsmittel und ausserkantonale oder kommunale Zielverfahren sind keine Fortsetzung dieser Pfade durch blossen Kalenderwechsel.

## 8. Offene Punkte und konkrete Vorschläge zur Fachentscheidung

| Kennung | Status und genaue Grenze | Vorschlag, noch nicht beschlossen |
| --- | --- | --- |
| F1-O1, entspricht ZH-O1 und AG-O1 und betrifft auch SG-Gerichtsferienpfade | Der letzte gezählte Tag liegt vor einer Ferienperiode auf Wochenende/Feiertag. Erst die reine Endverschiebung führt in die neu beginnende Ferienperiode. Die gezielt gelesenen Primärentscheide belegen diese konkrete Kollision nicht abschliessend | Nur diese Kollision vorerst ohne definitives Resultat und ohne Export lassen. Gewöhnliche Resttagefälle und Fälle ohne Kollision bleiben berechenbar. Dies ist eine Produktsicherung bei verbleibender Auslegungsfrage, keine behauptete gesetzliche Sperrnorm |
| ZH-O2 | Zusätzlich anerkannter 2. Januar im verwaltungsinternen Verfahren nicht abschliessend durch Direktpraxis geklärt. Normnahe RLG- und GOG-Listen sind verschieden | Verwaltung/Rekurs an RLG, Gericht an GOG binden. Im vorgeschlagenen Fenster ändert der 2. Januar 2027 wegen Samstag das Ergebnis nicht. Keine pauschale Festlegung für spätere Jahre |
| ZH-O3 | Revision 2027 ändert Eröffnung und Fristwahrung, nicht die gewöhnliche Tageszählung | 2026/2027 getrennt nachweisen. Gewöhnliche Fälle 2027 nur mit unabhängig geklärter Eröffnung und ohne behauptete Kanalstörungsverlängerung berechnen. Keine Fiktions- oder Ausfallautomatik |
| AG-F1-KAL | Neue VRPG-Bindung an die vorhandene 14er-Prozessliste ist gut begründet, aber nicht durch einen unmittelbaren Direktentscheid zu allen Tagen abschliessend belegt | Auslegung und Gegenargument ausdrücklich fachlich bestätigen. Keine freie Vereinigung regionaler Listen und kein Gemeinde-Default |
| SG-O1 | Fehlende oder widersprüchliche gerichtliche Ferienausnahmebelehrung kann Vertrauensschutzfolgen auslösen. Art. 30 Abs. 3 allein liefert kein eindeutiges Ersatzdatum | Betroffenen gerichtlichen Ausnahmefall ohne definitive Rechnung lassen, solange Belehrung/Rechtsfolge ungeklärt ist. Keine zusätzliche Belehrungsfrage für allgemeine Verwaltungsverfahren |
| SG-G1/G2 | Erster Massnahmenrekurs an VRK und weitere Art.-60-Konstellationen sind nicht als vollständige positive Wege recherchiert | Im Erstmodell auf die acht bezeichneten Gruppen begrenzen. Keine automatische Fünftageswahl für jeden Zwischenentscheid oder Vollstreckungsweiterzug |

Beispiel F1-O1: ZH-/AG-Gerichtsbeschwerde, Eröffnung 18.02.2027, 30 Tage. Letzter gezählter Tag ist Samstag 20.03.2027. Eine einfache Wochenendverschiebung führt auf 22.03.2027, während der Osterstillstand am 21.03.2027 beginnt. Der Kontrollfall mit Eröffnung 17.02.2027 endet am 19.03.2027. Dasselbe Grundproblem kann SG bei angeordneten Gerichtseingaben treffen. Für die Kollision wird hier **kein abschliessendes Rechtsdatum** behauptet.

Die vorgeschlagenen Grenzen sind Teil der vorzulegenden Fachentscheidung. Sie gelten nicht bereits aufgrund der Startfreigabe. Auch nach späterer Abnahme einer begrenzten Tranche zählt eine offene allgemeine Hauptfrage nicht stillschweigend als vollständige Schweizabdeckung. Der Gesamtumfang bleibt an DEC-2026-034 gebunden.

## 9. Minimale Bedien- und Modellfolgen

Der zweispaltige Aufbau, frühe Datumseingabe und statische Beschriftung «Sitz der zuständigen Stelle» bleiben Leitplanken. Ein separates abstraktes Feld «Massgeblicher Feiertagskanton» ist für diese kantonalen Wege nicht erforderlich. Die App leitet die Bindung aus Recht, Zielstufe und Handlung ab.

Nur rechnerisch oder rechtlich unterscheidende Angaben werden verlangt. Stufen wie Verwaltung, VRK und Verwaltungsgericht müssen in SG unterscheidbar sein. Ein einziges tatsächlich modelliertes Dokument oder eine alleinige Zielinstanz wird fest angezeigt. Quellenkennungen, interne Kalender-IDs und ausführliche Zuständigkeitsherleitungen gehören nicht als Eingabehürden in das Formular. Verständliche Rechtsgrundlage und Zusatzinformationen stehen in der Rechenspur.

Eine erforderliche positive Fallqualifikation wird passend zum gewählten Weg gebündelt, nicht in eine allgemeine Sammlung von Bestätigungen zerlegt. Bestehen echte Alternativen oder ungeklärte Angaben, darf die App keine positive Tatsache erfinden. «Angeordnete Tageszahl» ersetzt keine materiell unbekannte Rechtsmittelfrist. Gesetzliche 30-, 14-, 10- und 5-Tage-Wege werden nicht zu frei editierbaren Defaults ohne Gegenprüfung.

Ob Katalog 2 und Manifest 9 die neuen Bindungen ohne Nachtrag tragen, ist **AP23F2** vorbehalten. AP23F1 beschliesst keine neue Schemahauptversion, keinen Migrationsplan und keine Laufzeitidentitäten. Bestandsprofile, historische Pins und AP5 bleiben unangetastet.

## 10. Referenzen und Abnahmegegenstand

Die [Referenzbeilage](referenzfaelle-ap23f1.md) und ihre [maschinell lesbaren Forschungsfälle](ap23f1/referenzfaelle.json) prüfen Datumserwartungen unabhängig vom Produktkern. Jeder der 17 Pfade benötigt mindestens einen positiven Fall. Sommer-, Winter- und Ostergrenzen, Feiertage und die vorgeschlagenen engen Sperrkonstellationen werden getrennt geprüft. Eine negative Forschungsqualifikation ist kein bereits ausgeführter Produkt-Sperrtest. Kalenderproben ausserhalb des Fallfensters sind keine Fallfreigabe.

Zur Fachabnahme vorgelegt werden die 17 abgegrenzten Forschungsgruppen, ihre Stufen-/Stillstands- und Feiertagsbindungen, das vollständige Fallfenster, die Zürcher 2027-Abgrenzung und die ausdrücklich bezeichneten offenen Punkte mit den vorgeschlagenen Produktsicherungen. David kann diese bestätigen, ändern oder zur gezielten weiteren Klärung zurückweisen.

Nach der Fachabnahme folgt nur auf gesonderten Startauftrag AP23F2 mit Vertragsprobe und gegebenenfalls konkretem Entscheidvorschlag. AP23F3 und eine gemeinsame spätere Releasevorbereitung sind nicht vorweggenommen. Codex bereitet vor und prüft als dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

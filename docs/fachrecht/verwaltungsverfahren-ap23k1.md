# AP23K1 Fachvorlage Basel-Stadt und Basel-Landschaft

Stand: 27. Oktober 2026. **Fachlicher Abnahmevorschlag, noch nicht abgenommen und nicht operativ.** Grundlage ist der [bestätigte Startauftrag](start-ap23k1.md). Die damalige [Vorbereitung](../planung/ap23k1-vorbereitung-bs-bl.md) bleibt als historische Umfangsvorlage unverändert.

## Ergebnis und Übergabepunkt

Die Tranche verlangt zwei unterschiedliche Modelle für die Trennung von Rechtsmitteleinreichung und Begründung. Bei Basel-Stadt beginnen die gesetzlichen Anmelde- und Begründungsfristen grundsätzlich mit derselben Eröffnung. Bei Basel-Landschaft ist eine zusätzlich gewährte oder gerichtlich festgesetzte Begründungsfrist dagegen eine eigenständig qualifizierte Anordnung. Aus einer erfolgten Anmeldung wird in keinem der beiden Kantone ohne Rechtsgrundlage ein neuer Fristbeginn erfunden.

| Kanton | Leitunterschied | Vertiefter Befund |
| --- | --- | --- |
| Basel-Stadt | Zehn Tage Anmeldung und 30 Tage Begründung ab demselben Auslöser. Feiertagsanknüpfung des Verwaltungsrekurses und des Gerichtsrekurses getrennt prüfen | [Strukturierter BS-Befund](ap23k1/befund-bs.json) |
| Basel-Landschaft | Allgemeine Zehntagesbeschwerde, ausdrücklich gewährte oder festgesetzte Begründungsfrist und qualifizierte Fünftageseinsprache. Ganztägige kantonale Büroschliessungen können das Ende verschieben | [Strukturierter BL-Befund](ap23k1/befund-bl.json) |

Die [Quellen- und Fassungsprüfung](quellenpruefung-ap23k1.md) trennt Normtext, Verweisung, Analogie, Gerichtspraxis und Jahresvollzug. Die [Forschungsreferenzen](referenzfaelle-ap23k1.md) sind keine Produktprüfung. Ihre Ergebnisse und der Schutz des abgenommenen Bestands werden im [lokalen Abschlussnachweis](../../outputs/ap23k1-2026-10-27/local-completion.json) gebunden.

Vorgeschlagen sind **16 Gruppen, je acht für BS und BL**. 67 händisch festgelegte Referenzen enthalten 42 Datumssollwerte, 18 Qualifikationsgrenzen, zwei ergebnisrelevante Fasnachts-Ungewissheiten und fünf vollständige Fenstergrenzen. Node und Python bestätigen die Vorgaben ohne Abweichung. 2’190 Kalendertage und elf gezielte Kalenderproben sind geprüft. 107 Forschungs- und Erhaltungsprüfungen sind bestanden. Diese technischen Ergebnisse ersetzen die juristische Beurteilung und menschliche Abnahme nicht.

## K1-A Vollständiges Fallfenster und Fassungen

Vorgeschlagen wird **29.08.2026–31.12.2027 als vollständiges Fallfenster**. Der aktuelle Auslöser, eine gegebenenfalls davon getrennte rechtliche Eröffnung, alle Zähltage und die gesamte Endverschiebung müssen gedeckt sein. Eine Ende Dezember noch nicht vollständig abgewickelte Kette wird nicht auf den Jahresletzten gekürzt. Sie erhält ohne vollständige Deckung kein definitives Fristresultat und keinen Kalenderexport.

Die am Recherchestichtag ausgewiesenen amtlichen Gesamtfassungen und ihre Chronologie werden einzeln erfasst. Fehlende angekündigte Fassungen beweisen keine unveränderte Rechtslage bis Ende 2027. Jahresgebundene BL-Schliessungsanordnungen werden nicht in unbefristete Kalenderregeln umgedeutet. Vor einem künftigen Quellenrelease ist die Aktualität erneut zu prüfen.

## K1-B Basler Anmeldung, Begründung und Erstreckung

OG § 46 und VRPG § 16 verlangen grundsätzlich eine Anmeldung binnen zehn Tagen und eine Begründung binnen 30 Tagen ab derselben Eröffnung. Die beiden Handlungen bleiben getrennte Auswahlfälle. Eine Anmeldung am siebten oder zehnten Tag startet die Begründungsfrist nicht neu. Es gibt keine automatische Zehn-plus-dreissig-Kette.

Die Ausnahme einer längeren Begründungsfrist setzt eine tatsächlich bewilligte Verlängerung voraus. Ein blosses Gesuch ist keine Bewilligung. Berechenbar sind nur ausdrücklich in Tagen bestimmte Anordnungen mit geklärtem Bezugspunkt. Ein fixer behördlicher Termin wird nicht zum künstlichen Rechenfall und ein Zusatz von Tagen nicht ohne Prüfung auf das bereits verschobene ursprüngliche Ende aufgeschlagen.

Eine Überweisung an das Gericht, die interne Weiterleitung oder eine bereits erfolgte Anmeldung ist für sich allein keine neue Eröffnung. Bei Publikationen ist das rechtliche Ereignis von der Zählung zu unterscheiden. Die verkürzte Wendung «vom Tage der Bekanntmachung an» führt nicht dazu, den Publikationstag mitzuzählen. Eine unklare Zustellfiktion wird nicht aus dem eingegebenen Datum erraten.

Die acht konkret vorgeschlagenen BS-Gruppen sind:

| Kennung | Handlung | Dauer |
| --- | --- | --- |
| BS-ADMIN-ORDERED | Angeordnete Eingabe im Erstverfahren | Aktuell angeordnete Tagesdauer |
| BS-INTERNAL-REGISTER-10 | Verwaltungsinternen Rekurs anmelden | Zehn Tage |
| BS-INTERNAL-REASONS-30 | Verwaltungsinternen Rekurs begründen | 30 Tage ab derselben Eröffnung |
| BS-INTERNAL-ORDERED | Angeordnete Eingabe im Verwaltungsrekurs | Aktuell angeordnete Tagesdauer |
| BS-COURT-REGISTER-10 | Gerichtsrekurs anmelden | Zehn Tage |
| BS-COURT-REASONS-30 | Gerichtsrekurs begründen | 30 Tage ab derselben Eröffnung |
| BS-COURT-ORDERED | Gerichtlich angeordnete Eingabe | Aktuell angeordnete Tagesdauer |
| BS-COURT-JOINDER-10 | Qualifizierte Abweisung eines Beiladungsantrags anfechten | Zehn Tage nach VRPG § 23 Abs. 1 |

Tatsächlich bewilligte, aktuell in Tagen angeordnete Begründungsverlängerungen werden im passenden Anordnungsweg geführt. Ein fixer Endtermin bleibt im Hintergrund. Das ist kein zusätzlicher freier Rechenweg für beliebige verspätete Begründungen.

## K1-C Basler Feiertagsanknüpfung und fehlender Stillstand

Das Organisationsgesetz enthält keine allgemeine vollständige Fristenordnung. Die Herleitung für Verwaltungsverfahren ist deshalb von der ausdrücklichen gerichtlichen Verweisung zu unterscheiden. Eine ergänzende Berechnungsregel wird nicht als wörtlich im OG vorhandene Bestimmung ausgegeben. Für gültig angeordnete vorwärts laufende Tagesfristen wird insbesondere Art. 1 Abs. 1 Bst. a in Verbindung mit Art. 3 und 5 des Europäischen Fristenübereinkommens herangezogen. Der BS-Befund weist die ergänzende Gerichtspraxis und die Reichweite der Analogie gesondert aus.

Für Erstverfahren und verwaltungsinternen Rekurs wird der **Sitz der zuständigen Stelle in BS nach DEC-2026-031** vorgeschlagen, weil keine ausdrücklich abweichende Anknüpfung festgestellt wurde. Die Praxis zur analogen Anwendung von StG § 147 Abs. 3 belegt die Endverschiebung, aber keine ausdrückliche Kollisionsnorm zum Feiertagskanton. Der Sitzvorschlag bleibt als solcher zur Fachabnahme sichtbar. Es wird kein diesen Ortskonflikt abschliessend entscheidendes Gerichtsurteil behauptet.

Für den Gerichtsrekurs verweist VRPG § 21 Abs. 1 ergänzend auf GOG und VwVG, soweit kein abweichendes Recht gilt. Der in diesem Weg anwendbare Art. 20 Abs. 3 VwVG knüpft Feiertage an den rechtlich massgebenden Wohnsitz oder Sitz der Partei beziehungsweise ihrer Vertretung. Der Sitz des Basler Gerichts ersetzt diese ausdrückliche Verweisung nicht. Auch eine freie Vereinigung von Partei-, Vertretungs- und Gerichtskalender ist nicht vorgesehen. Eine fehlende oder mehrdeutige Ortsqualifikation wird nicht mit BS aufgefüllt.

VRPG § 21 Abs. 2 schliesst Gerichtsferien ausdrücklich aus. Auch für den verwaltungsinternen Rekurs wird kein allgemeiner Ferien- oder Feiertagsstillstand vorgeschlagen. Der durch Verweisung verwendete VwVG-Feiertagsmechanismus zieht nicht automatisch dessen Ferienkalender nach sich. Feiertage im Innern der Frist werden mitgezählt. Gesetzliche Feiertage sind von Personalurlaub und bloss geschlossenen Schaltern zu unterscheiden.

## K1-D Baselbieter Rechtsmittel und aktuelle Anordnungen

Die allgemeine Verwaltungsbeschwerde nach VwVG BL § 33 Abs. 1 und die allgemeine Verwaltungsgerichtsbeschwerde nach VPO § 48 laufen grundsätzlich zehn Tage. Steuer-, Sozial-, Volksrechts- und andere besondere Dauern werden dadurch nicht zu allgemeinen Zehntagesfällen.

Eine nachträgliche Begründung nach VwVG BL § 33 Abs. 3 setzt Gesuch und tatsächliche Gewährung voraus. Die gerichtliche Festsetzung nach VPO § 5 Abs. 2 ist ebenfalls keine gesetzlich immer hinzutretende zweite Frist. Dauer und aktueller Auslöser müssen aus der konkreten Anordnung stammen.

Die Fünftageseinsprache nach VPO § 7 Abs. 2 setzt sowohl die Zuständigkeit der Kammer zum Endentscheid als auch einen der abschliessend aufgezählten Gegenstände voraus. Sie ist keine allgemeine Fünftagesanfechtung jeder verfahrensleitenden Verfügung. Anfechtbarkeit eines Zwischenentscheids und Berechnung seiner Frist bleiben getrennte Qualifikationen.

Die Drittkenntnis nach VwVG BL § 33 Abs. 2 mit zusätzlicher Sechsmonatsgrenze wird nicht auf eine einfache Zehntagesrechnung reduziert. Elektronische Eröffnung, mündliche Mitteilung und schriftliche Eröffnung sind nicht beliebig austauschbar. VPO § 19 über die schriftliche Urteilseröffnung ist insbesondere keine pauschale Eröffnungsnorm für jedes Verwaltungsrechtsmittel oder jede Präsidialverfügung. Wiederherstellung und abweichendes Spezialrecht bleiben gesondert.

Die acht konkret vorgeschlagenen BL-Gruppen sind:

| Kennung | Handlung | Dauer |
| --- | --- | --- |
| BL-ADMIN-ORDERED | Angeordnete Eingabe im Erstverfahren | Aktuell angeordnete Tagesdauer |
| BL-ADMIN-APPEAL-10 | Allgemeine Verwaltungsbeschwerde | Zehn Tage |
| BL-ADMIN-REASONS-GRANTED | Tatsächlich gewährte nachträgliche Beschwerdebegründung | Aktuell gewährte Tagesdauer |
| BL-ADMIN-APPEAL-ORDERED | Angeordnete Eingabe im Verwaltungsbeschwerdeverfahren | Aktuell angeordnete Tagesdauer |
| BL-COURT-APPEAL-10 | Allgemeine Verwaltungsgerichtsbeschwerde | Zehn Tage |
| BL-COURT-REASONS-SET | Gerichtlich festgesetzte Begründung | Aktuell festgesetzte Tagesdauer |
| BL-COURT-ORDERED | Angeordnete Eingabe im Gerichtsverfahren | Aktuell angeordnete Tagesdauer |
| BL-COURT-OBJECTION-5 | Qualifizierte Einsprache nach VPO § 7 Abs. 2 | Fünf Tage |

Selbstständig anfechtbare Zwischenentscheide werden nur innerhalb des jeweils positiv qualifizierten allgemeinen Rechtsmittelwegs erfasst. Ihre Anfechtbarkeit wird weder aus dem Datum noch aus der Bezeichnung «Zwischenentscheid» automatisch hergeleitet.

## K1-E Baselbieter Feiertage und ganztägige Büroschliessung

GOG § 46 gilt für den gerichtlichen Zweig unmittelbar und über VwVG BL § 5 Abs. 1 auch für die Verwaltung. Der Ereignistag wird nicht mitgezählt. Fällt das Ende auf ein Wochenende, einen staatlich anerkannten Feiertag oder einen gesetzlich gleichgestellten ganzen kantonalen Büroschliesstag, verschiebt es sich auf den nächsten zulässigen Werktag. Ein allgemeiner Gerichtsferien-Stillstand entsteht daraus nicht.

Die Gleichstellung betrifft **Büros der kantonalen Verwaltung**. Für das gerichtliche Verfahren hängt sie nicht davon ab, ob das Gericht selbst seinen Schalter geöffnet hält. Umgekehrt wird nicht jeder persönliche freie Tag einer Mitarbeiterin oder eines Mitarbeiters zum prozessualen Feiertag.

Die amtlichen Jahresübersichten werden gemeinsam mit den Regierungsratsauszügen ausgewertet. Am **24. und 31.12.2026** ergeben ein angeordneter Kompensationsvormittag und ein bezahlter freier Nachmittag zusammen jeweils einen ganzen Schliesstag. Freiwillige interne Arbeit trotz Schliessung des Publikumsverkehrs hebt die angeordnete Schliessung nicht auf. Halbtage allein bleiben ohne automatische Ganztagswirkung.

| Jahr | Zusätzliche nachgewiesene ganze Schliesstage innerhalb des Fensters |
| --- | --- |
| 2026 | 24., 28., 29., 30. und 31. Dezember |
| 2027 | 25. März, 7. Mai, 24., 27., 28., 29., 30. und 31. Dezember |

Diese **13 Jahresdaten** ergänzen die gesetzlichen Feiertage ausschliesslich in der hier begründeten BL-Verfahrensbindung. Sie werden nicht zu neuen schweizweiten Feiertagen. Führt ihre Endverschiebung bis 2028, greift die vollständige Fenstergrenze.

Die örtliche Fasnachtsoption für Birseck und Bezirk Laufen beweist keine allgemeine, tatsächlich ausgeübte ganztägige Schliessung aller kantonalen Büros. Die regionale und institutionelle Reichweite bleibt als besondere Auslegungsfrage sichtbar. Vorgeschlagen wird eine **ausschliesslich ergebnisrelevante Grenze**: vollständige Rechnung ohne und mit dem konkret unsicheren Schliesstag. Bei unterschiedlichen rechtlichen Enddaten gibt es kein definitives Resultat und keinen Kalenderexport. Bei gleichem Ergebnis wird nicht der ganze Verfahrensweg gesperrt. Ein solcher Schliesstag im Fristinnern unterbricht die Tageszählung nicht.

## K1-F Positive Qualifikation und bewusste Grenzen

Jeder positive Weg setzt die konkrete kantonale Zielstelle, den allgemeinen Erlass, das Stadium, die Handlung, eine aktuelle rechtlich qualifizierte Eröffnung und die zutreffende Fristart voraus. Anordnungsdauer, bewilligte Verlängerung und Eröffnungstatsachen werden nicht aus Standards ergänzt. Die Feiertagsbindung folgt DEC-2026-031, soweit die konkret anwendbare Norm oder Verweisung keine abweichende Anknüpfung enthält.

Eigenständiges kommunales Recht, neue ausserbernische Sozialfreigaben und eine pauschale Aufnahme kantonaler Spezialverfahren bleiben ausgeschlossen. Dass ein Gerichtsvolltext eine Steuer-, Sozial- oder Gemeindesache betrifft, erweitert nicht den positiven Produktumfang auf dieses Sachgebiet. Ein für allgemeine Berechnungsfragen einschlägiger Rechtssatz wird mit dieser Verwendungsgrenze ausgewiesen.

Stundenfristen, Rückwärtsfristen, fixe Termine, Zahlungsabwicklung, materielle Verjährung, behördliche Erledigungsfristen und unqualifizierte Zustellfiktionen bleiben ausserhalb dieser Fachvorlage. Die Berechnung eines letzten Kalendertags entscheidet nicht abschliessend über die tatsächliche Rechtzeitigkeit einer Einreichung.

## K1-G Unverändertes Bedienmodell und nächste Freigabe

Zwei Spalten, frühe Datumseingabe, die statische Beschriftung «Sitz der zuständigen Stelle», feste Einzelwerte und ruhige DE-/FR-Texte bleiben verbindlich. Zusätzliche Eingaben benötigen einen unmittelbaren Einfluss auf die Berechnung. Erläuterungen zu Zuständigkeit, Rechtsmethodik und Quellen gehören grundsätzlich in die Rechenspur. Ein Grenzfall rechtfertigt keine neue Frage für sämtliche Normalfälle.

Die Vorschläge **K1-A bis K1-G** sind Gegenstand der noch ausstehenden menschlichen Fachabnahme. Erst danach vergleicht AP23K2 den bestätigten Umfang mit Katalog **7.0.0** und Manifest/Mindestconsumer **14.0.0**. Neue Formatnummern oder eine konkrete technische Feldlösung werden hier nicht beschlossen. AP23K3 ist nicht gestartet.

Rechenlogik, Schemata, vorhandene Rechtsdaten, Kandidaten, Quellenflags und der abgenommene J3-Stand bleiben unverändert. Kein Produktbuild, Commit, GitHub-Push oder öffentlicher #48-Statuswechsel. Kein Upload, Mirrorwechsel, Installation oder Betriebswechsel. E/Q/P, AP5, AP21, Hosting und Berechtigungen bleiben unverändert. Die 19 abgenommenen Kantone werden durch den K1-Vorschlag noch nicht zu 21. [DEC-2026-034](../entscheidungen/DEC-2026-034-gebuendelter-schweizausbau.md) gilt unverändert weiter.

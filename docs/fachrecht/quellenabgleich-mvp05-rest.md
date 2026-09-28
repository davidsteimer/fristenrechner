# MVP 0.5 · Quellenabgleich des verbleibenden Manifestbestands

Prüfdatum: 28. September 2026. **Technischer Prüfentwurf, keine fachliche Quellen- oder Datenfreigabe.** Durchführung durch Codex als dokumentiertes KI-Arbeitsinstrument.

## Ergebnis und Umfang

Die 26 verbleibenden Quellen-IDs des [MVP-0.5-Inventars](../../outputs/release-mvp05-2026-09-28/source-inventory.json) sind vollständig zugeordnet und begrenzt erneut geprüft. Die 27 AP19-Quellen sind Gegenstand des gesonderten Abgleichs. Die 82 ausschliesslich im Feiertagskatalog verwendeten Quellen wurden in diesem Arbeitsschritt nicht erneut abgerufen.

- **17 Quellen-IDs zu 16 amtlichen Originaldateien:** alle am 28. September erfolgreich abgerufen und vollständig SHA-256-identisch zum fachlich abgenommenen MVP-0.4-Quellenstand vom 22. September. Die doppelte VRPG-Referenz erklärt die unterschiedliche Zahl von IDs und Dateien.
- **Neun bereits verwendete Rechtsprechungsbelege:** die vollständigen Gerichtstexte sind in den bekannten Spiegeln erreichbar. Die relevanten Erwägungen wurden gezielt erneut gelesen und tragen weiterhin ihre bisher begrenzte Verwendung. Ein Bytevergleich mit damaligen Urteilsdateien wird nicht behauptet.
- **Neun zukünftige Änderungseinträge bei zwei Bundeserlassen:** gesondert geprüft. Sie ändern die hier modellierte Tagesberechnung nicht. Sie sind deshalb nicht als «keine Gesetzesänderung» zusammengefasst.
- **OF-001 bleibt offen:** keine neue Wochenend-Zustellungsfiktion vorweggenommen.

Es ergibt sich aus diesem abgegrenzten Prüflauf **kein zusätzlicher Änderungsbedarf an den bestehenden Rechenregeln**. Die menschliche Abnahme des zusammengehörigen Quellenstands bleibt erforderlich. Dieser Nachweis allein setzt keinen Datenstatus auf `approved`.

## Amtliche Originale und Vergleich

Vergleichsbasis ist die [MVP-0.4-Quellenabnahme](abnahme-quellenpruefung-mvp04.md) mit dem damals dokumentierten [Gesamtabgleich](quellenabgleich-mvp04.md). Die heute abgerufenen Dateien und die bisherigen Vergleichsdateien wurden jeweils gegen die protokollierten Prüfsummen geprüft. Der Bytevergleich ersetzt hier keine erstmalige Fachanalyse, sondern belegt, dass die bereits inhaltlich geprüften Originale unverändert vorliegen. Zusätzlich wurden aktuelle und bekannte zukünftige Fassungen abgefragt.

| Gruppe | Frisch abgerufene Dateien und relevante Abgrenzung |
| --- | --- |
| Bundesprofile | StPO 01.04.2025, ZPO 01.07.2026, BGG 01.04.2026, VwVG 01.07.2022. Bestehender Fristbeginn, Zustellungsfiktion, Endverschiebung und Stillstand unverändert |
| Politische Rechte Bund | BPR 23.10.2022 und VPR 01.07.2022. Keine Vermischung von Tagesfristen, festen Terminen und Eingangsvorschriften |
| Bundesfeiertag | Amtlicher Text vom 01.07.1994 unverändert. Keine zusätzliche Kalenderaktivierung |
| Bern | VRPG Version 3424 seit 01.09.2026, IVöB Version 3138, IVöBG Version 2466, IVöBV Version 3059, PRG Version 3172 und PRV Version 3148. BELEX führt für diese sechs Texte keine zukünftige Version auf |
| Historische Ergänzungen | Amtliche alte IVöB-Fassung 2010, PRG-Vortrag vom 04.04.2018 und RRB 498/2024 vollständig byteidentisch. Weiterhin historische Abgrenzungs- beziehungsweise Anwendungsbelege, keine neuen allgemeinen Regeln |

Die historische Quellen-ID `SRC-VRPG-BE-20230801` wird nicht rückwirkend umbenannt. Ihr aktueller Vorfreigabeabgleich benutzt ausdrücklich die heute geltende Fassung 3424. Die eigenständige Quelle `SRC-AP17C-VRPG-BE-20260901` bleibt gesondert aufgelöst.

## Zukunftsindex und Folgekonsolidierungen

Der amtliche Fedlex-Index wurde für StPO, ZPO, BGG, VwVG, BPR, VPR und Bundesfeiertagsgesetz zwischen 22.09.2026 und 31.12.2027 abgefragt. Es wurde weder auf einzelne Artikel noch auf das Publikationsjahr der Änderung eingeschränkt. Die Abfrage liefert neun Einträge. Beide betroffenen Folgekonsolidierungen und beide Änderungserlasse waren vollständig als amtliche XML-Dateien verfügbar.

| Erlass | Befund | Auswirkung auf den bestehenden Rechner |
| --- | --- | --- |
| [VwVG ab 01.01.2027](https://www.fedlex.admin.ch/eli/cc/1969/737_757_755/20270101/de), [AS 2026 232](https://www.fedlex.admin.ch/eli/oc/2026/232/de) | Acht geänderte Artikel. Art. 1, 2 und 47 ergänzen den Patentgerichtskontext. Art. 21 und 24 passen die IGE-Bezeichnung an. Art. 63–65 betreffen Kosten, Entschädigung und unter anderem die Verjährung eines Rückerstattungsanspruchs | Art. 20 und 22a bleiben im Normtext unverändert. Keine Änderung an modelliertem Beginn, Zustellungsfiktion, Tageszählung, Endverschiebung oder Stillstand. Keine Freischaltung von Patentverfahren, Kostenrückerstattung oder materiellen Verjährungsfristen |
| [VPR ab 01.07.2027](https://www.fedlex.admin.ch/eli/cc/1978/712_712_712/20270701/de), [AS 2025 314](https://www.fedlex.admin.ch/eli/oc/2025/314/de) | Änderung von Art. 2a über reservierte eidgenössische Abstimmungstermine | Die verwendeten Art. 8a, 8d und 8e bleiben im Normtext unverändert. Der Rechner erzeugt keine eidgenössischen Abstimmungstermine. Keine neue Kalenderfunktion |

Der maschinelle Normtextvergleich entfernt nur Fussnotenelemente, Leerraum und weiche Trennzeichen. Die vollständigen Texte einschliesslich Fussnoten bleiben mitgespeichert. Die inhaltliche Einstufung der geänderten Artikel ist davon getrennt im [maschinenlesbaren Prüfbericht](../../outputs/release-mvp05-2026-09-28/sources/remainder/source-review.json) begründet. Der amtliche Änderungsindex ist ein abgefragter Nachweisstand, keine Garantie gegen spätere Publikationen oder fehlende Metadaten.

## Bestehende Rechtsprechungsbelege

Diese Kontrolle ist **keine umfassende Recherche nach neuer Rechtsprechung**. Sie prüft die bekannten Belege an den verwendeten Fundstellen. Swiss Caselaw und Entscheidsuche wurden als getrennt erkennbare Recherche- und Volltextzugänge verwendet. Die Spiegel werden nicht als amtliche Veröffentlichungsstellen ausgegeben.

| Bisheriger Beleg | Am 28. September gelesene Fundstelle | Bestätigte Verwendungsgrenze |
| --- | --- | --- |
| VGer BE 100.2024.8 vom 04.04.2024 | E. 1.1 und 2 | IVöB-Frist und bernischer zweistufiger Instanzenzug, Übergangsanknüpfung an Verfahrenseinleitung |
| VGer BE 200.2017.814 vom 17.01.2018 | E. 1.2 | Konkret datierte Replikfrist nicht als nach Tagen bestimmte ATSG-Frist behandeln |
| VGer BE 100.2016.347 vom 29.06.2017 | E. 3.4, 3.4.1, 3.4.2 und 4.5 | Vorbereitungshandlungen anhand des Fristablaufs gegenüber dem Abstimmungstermin abgrenzen, einschliesslich Art. 81 Abs. 2 VRPG |
| VGer BE 100.2017.270 vom 12.12.2017 | E. 4.1, 4.3 und 5.2 | Zehn Tage und Folgetagbeginn, massgebend bleibt der Abstimmungstermin und nicht der Beginn brieflicher Stimmabgabe |
| VGer BE 100.2021.189 vom 22.10.2021 | E. 4.1 und 4.2 | Offizielle Eröffnung beziehungsweise Publikation, subsidiär fallbezogen mögliche und zumutbare Kenntnisnahme |
| VGer BE 200.2026.421 vom 26.06.2026 | Ziff. 4 und 6 im vollständig abgerufenen Text | Unter dem dortigen bernischen Verfahrensrecht keine Fristverlängerung wegen eines Feiertags am Freiburger Wohnort der Partei. Keine Übertragung auf abweichende Bundesregeln |
| BGer 1C_275/2009 vom 01.10.2009 | E. 3.3.2 | Verschiebungsgrundsatz bestätigt. Konkreter Fall betrifft eine behördliche Entscheidfrist, nicht die heutige Länge einer Parteirechtsmittelfrist |
| BGer 8C_620/2007 vom 09.06.2008 | E. 3.3 | Unechter Bundesrechtsvorbehalt. Historische Nichtanwendung des ATSG-Stillstands im Übergangsrecht nicht auf heutige Fälle übertragen |
| BGer 9C_757/2007 vom 03.01.2008 | E. 3 | Deklaratorischer Vorbehalt, keine heutige generelle Verneinung des gesetzlich anwendbaren ATSG-Stillstands |

Die konkreten Abrufadressen, Prüfsummen und vorbestehenden Reichweitenbegründungen sind pro Quellen-ID im maschinenlesbaren Prüfbericht gebunden. Ergänzende historische Erwägungen, die heute nicht erneut gelesen wurden, werden nicht als neue Lektüre ausgegeben.

## OF-001 und Freigabegrenze

Das [amtliche BJ-Dossier](https://www.bj.admin.ch/de/zustellung-an-wochenenden-und-feiertagen-mit-a-post-plus) wurde im Web und als Rohantwort neu abgerufen. Es verweist weiterhin auf die Referendumsvorlage [BBl 2025 2891](https://www.fedlex.admin.ch/eli/fga/2025/2891/de). Deren Ziffer III überlässt das Inkrafttreten dem Bundesrat. Die tatsächlich gelesenen aktuellen BGG-/VwVG-Texte, die VwVG-Folgekonsolidierung 2027 und der genannte Änderungsindex geben keinen Anlass, die neue Wochenend-Zustellungsfiktion im Rechner zu aktivieren. Ein definitiver künftiger Inkraftsetzungstermin wird nicht behauptet. `OF-001` bleibt offen und ist beim nächsten einschlägigen amtlichen Hinweis oder Release erneut zu prüfen.

Der Bericht verändert weder Produktdaten noch Quellenregister, freigegebene Ereignisse, Release-Pins, Mirrors oder Umgebungen. Die zusammengeführte menschliche Quellenabnahme und die spätere konkrete Datenpromotion bleiben getrennte Haltepunkte.

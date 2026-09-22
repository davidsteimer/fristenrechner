# AP17B · Anwendbarkeit von Sozialversicherungs- und Beschaffungsrecht

| Merkmal | Stand |
| --- | --- |
| Fassung | 1.0, fachlicher Abschluss vom 12. September 2026 auf Grundlage des Fachentwurfs und Quellenstands vom 11. September 2026 |
| Auftrag | AP17B gemäss [AP17-Plan](../ux/vrpg-bedienkonzept-ap17.md), durch David Steimer am 11. September 2026 gestartet |
| Ergebnis | 16 Kandidatenzuordnungen, vier ausdrücklich gesperrte Sammelpfade, vier Rechenprofile |
| Referenzvertrag | [60 synthetische Fälle](../../tests/golden/candidates/ap17b-anwendbarkeit.json), davon 28 positive und 32 Sperrfälle |
| Fachabnahme | durch David Steimer am 12. September 2026, siehe [Abnahmenotiz](#7-abnahme-vom-12-september-2026-und-verbleibende-grenze) |
| Laufzeit und Release | keine Aktivierung, keine Änderung freigegebener Daten, kein Deployment |

## 1. Ergebnis und Umfang

Die gestufte Bedienung nach DEC-2026-019 ist tragfähig. Die Auswahl des Spezialerlasses allein genügt allerdings nicht. Erst Sachbereich, konkrete Verfahrenshandlung, gegebenenfalls Stadium und rechtlich massgebende Eröffnung bestimmen den passenden Fristenlauf.

Für das erste Integrationspaket sind zwölf Zuordnungen für individuelle Versicherungsleistungen nach IVG, AHVG und UVG sowie vier Zuordnungen im neuen bernischen Beschaffungsrecht fachlich abgenommen. Das ist eine begrenzte, überprüfbare Erweiterung. Eine Abdeckung von 95 Prozent der tatsächlichen Fälle ist damit nicht nachgewiesen. Dafür fehlen Nutzungsdaten.

Allgemeines VRPG und die bereits freigegebenen politischen Regime bleiben unverändert. Andere Sozialversicherungsgesetze, weitere Beschaffungsobjekte und nicht qualifizierte gerichtliche Eingaben werden nicht stillschweigend zugeordnet. Die abgenommene AP11A-Fachanalyse bleibt historische Referenz. Die präzisierende Quellenprüfung steht im [AP17B-Quellennachweis](quellenpruefung-ap17b.md).

## 2. Gemeinsamer Rechenvertrag

Die folgenden Profile sind fachlich abgenommene Integrationsgrundlagen, keine neuen produktiven Profil-IDs. Der zugehörige maschinenlesbare Kandidat bleibt als unveränderte Prüfgrundlage archiviert.

| Profil-ID | Dauer | Stillstand | Feiertagsanknüpfung | Normspur |
| --- | --- | --- | --- | --- |
| `SOC-30` | gesetzliche 30 Tage, nicht frei veränderbar | ATSG | Partei oder Vertretung, nicht automatisch Behördensitz | jeweiliges Einzelgesetz und Dauerbestimmung, ATSG Art. 38 bis 41 |
| `SOC-DAYS` | ausdrücklich angeordnete Anzahl Tage | ATSG | wie `SOC-30` | Einzelgesetz, ATSG Art. 38 bis 40, bei Beschwerdeverbesserung zusätzlich Art. 60 Abs. 2 und 61 Bst. b |
| `PROC-20` | gesetzliche 20 Tage, nicht frei veränderbar | keiner | bernischer Kalender einschliesslich Bundesfeiertag | IVöB Art. 55 und 56, IVöBG Art. 5 und 6, VRPG Art. 41 |
| `PROC-DAYS` | ausdrücklich angeordnete Anzahl Tage | keiner | wie `PROC-20` | IVöB Art. 55 und 56 Abs. 2, IVöBG Art. 5 Abs. 2, VRPG Art. 41 und 43 |

Für alle vier Profile gilt:

- Ausgangspunkt ist der Tag nach der rechtlich massgebenden Eröffnung. Wochenenden und Feiertage innerhalb einer laufenden Frist zählen mit. Eine Verschiebung auf einen Werktag betrifft das Fristende, nicht automatisch den ersten gezählten Tag.
- Beim ATSG werden die inklusiven Stillstandsperioden vom siebten Tag vor bis zum siebten Tag nach Ostern, vom 15. Juli bis 15. August und vom 18. Dezember bis 2. Januar übersprungen. Kalendarischer Ausgangspunkt und erster gezählter Tag sind deshalb getrennte Werte.
- Fällt das rechnerische Ende auf Samstag, Sonntag oder einen massgebenden anerkannten Feiertag, wird bis zum nächsten Werktag weitergeschoben. «Keine Gerichtsferien» hebt diese Endverschiebung nicht auf.
- `N` bedeutet die angeordnete Tagesdauer. Der Testvertrag begrenzt die Eingabe technisch auf ganze Zahlen von 1 bis 365. Das ist keine gesetzliche Höchstdauer. Weder 20 noch 30 Tage werden als Ersatz für eine fehlende Anordnung eingesetzt.
- Ein amtlich bestimmtes Enddatum, eine Uhrzeit, eine Stunden- oder Monatsfrist ist kein Auftrag zur Tageszählung. Fixtermine bleiben gemäss bisherigem Produktentscheid im Hintergrund dokumentiert und ausserhalb des Rechen-GUI.
- Fristwahrung, Form der Eingabe, Zuständigkeit, Beschwerdelegitimation, Erstreckung und Wiederherstellung werden nicht durch ein rechnerisches Enddatum bestätigt.

Massgebliche Grundlagen: [ATSG Art. 38 bis 41][ATSG], [IVöB Art. 55 und 56][IVOEB], [IVöBG Art. 5 und 6][IVOEBG], [VRPG Art. 41 bis 43][VRPG].

### Feiertage und Eröffnung als echte Voraussetzungen

Bei den Sozialversicherungspfaden muss die Anknüpfung nach Art. 38 Abs. 3 ATSG geklärt sein. Der begrenzte Kandidat setzt voraus, dass die relevanten Anknüpfungen der Partei und einer vorhandenen Vertretung durch den Berner Kalender abgedeckt sind. Bei fehlender Vertretung betrifft dies die Partei. Andere oder ungeklärte Kantone bleiben gesperrt. Das ist eine konservative Produktgrenze, keine abweichende gesetzliche Prioritätsregel zwischen Partei und Vertretung.

Die Eingabe bezeichnet die fachlich geklärte rechtliche Eröffnung, nicht das spätere Lesen eines Schreibens. Zustellungsfiktionen und konkurrierende Eröffnungen sind kein Gegenstand dieser neuen Referenzrechnung. Sie benötigen einen separat geprüften Zustellpfad oder führen zur Sperre. Die booleschen Werte `notificationConfirmed` und `holidayAnchorConfirmed` im Referenzvertrag beschreiben fachliche Voraussetzungen. Sie sind weder ein Auftrag für neue Bestätigungscheckboxen noch dürfen sie bei der Integration pauschal auf `true` gesetzt werden.

## 3. Sozialversicherungsrecht

ATSG Art. 2 verlangt eine Verweisung des jeweiligen Einzelgesetzes. Art. 1 IVG, AHVG beziehungsweise UVG bildet das Eintrittstor. Der Kandidat beschränkt sich auf individuelle Versicherungsleistungen im jeweiligen ATSG-Geltungsbereich. Eine Berner Behörde oder die Zuständigkeit einer Sozialversicherungsabteilung genügt für diese Qualifikation nicht. ATSG Art. 55 macht das VwVG nicht zum allgemeinen Ersatz für vorhandene ATSG-Regeln. [ATSG][ATSG], [IVG][IVG], [AHVG][AHVG], [UVG][UVG].

| Fach-ID | Konkrete Handlung | Fristauslöser | Profil | Zusätzliche Norm und Grenze |
| --- | --- | --- | --- | --- |
| `SOC-IV-PRE` | Einwand gegen IV-Vorbescheid | Vorbescheid über individuelle Versicherungsleistungen | `SOC-30` | IVG Art. 57a Abs. 3. Einwand, keine Einsprache |
| `SOC-IV-APP` | Ordentliche IV-Beschwerde | Verfügung der IV-Stelle Bern | `SOC-30` | IVG Art. 69 Abs. 1 Bst. a, ATSG Art. 56 und 60. Direkter Weg ans zuständige Versicherungsgericht |
| `SOC-AHV-OBJ` | AHV-Einsprache | erstinstanzliche Leistungsverfügung | `SOC-30` | ATSG Art. 52 Abs. 1. Keine prozess- oder verfahrensleitende Verfügung |
| `SOC-AHV-APP` | Ordentliche AHV-Beschwerde | Einspracheentscheid | `SOC-30` | ATSG Art. 56, 58 und 60, AHVG Art. 84 soweit einschlägig. Zuständigkeit Bern muss feststehen |
| `SOC-UV-OBJ` | UVG-Einsprache | erstinstanzliche Leistungsverfügung | `SOC-30` | ATSG Art. 52 Abs. 1. Obligatorische Unfallversicherung, keine private VVG-Zusatzversicherung |
| `SOC-UV-APP` | Ordentliche UVG-Beschwerde | Einspracheentscheid | `SOC-30` | ATSG Art. 56, 58 und 60. Zwischenverfügungen nicht eingeschlossen |
| `SOC-IV-ADM` | Angeordnete Tagesfrist im laufenden IV-Leistungsverfahren | Anordnung der IV-Stelle | `SOC-DAYS` | ATSG Art. 38 bis 40. Keine pauschale Dauer, kein Fixtermin |
| `SOC-AHV-ADM` | Angeordnete Tagesfrist im laufenden AHV-Leistungsverfahren | Anordnung der Ausgleichskasse | `SOC-DAYS` | gleiche Abgrenzung |
| `SOC-UV-ADM` | Angeordnete Tagesfrist im laufenden UVG-Leistungsverfahren | Anordnung des Unfallversicherers | `SOC-DAYS` | gleiche Abgrenzung und keine Ausnahme nach UVG Art. 1 Abs. 2 |
| `SOC-IV-CORRECTION` | Gerichtliche Tagesnachfrist zur Verbesserung einer IV-Beschwerde | entsprechende gerichtliche Anordnung | `SOC-DAYS` | ATSG Art. 60 Abs. 2 und 61 Bst. b, BGer 8C_767/2008 E. 4.3.2 |
| `SOC-AHV-CORRECTION` | Gerichtliche Tagesnachfrist zur Verbesserung einer AHV-Beschwerde | entsprechende gerichtliche Anordnung | `SOC-DAYS` | gleiche enge Handlung, nicht jede gerichtliche Parteieingabe |
| `SOC-UV-CORRECTION` | Gerichtliche Tagesnachfrist zur Verbesserung einer UVG-Beschwerde | entsprechende gerichtliche Anordnung | `SOC-DAYS` | gleiche enge Handlung |

Zwei Präzisierungen sind besonders wichtig:

1. Die IV-Einwandfrist von 30 Tagen steht heute in **Art. 57a Abs. 3 IVG**. Der frühere Art. 73ter Abs. 1 IVV ist aufgehoben. Die verbleibenden Absätze 2 und 3 betreffen die Form. Die Dauer darf nicht aus dem aufgehobenen Verordnungsabsatz hergeleitet werden. [IVG][IVG], [IVV][IVV].
2. **Nicht alle Fristen im laufenden Gerichtsverfahren werden freigeschaltet.** BGer 8C_767/2008 E. 4.3.2 trägt die Nachfrist zur Beschwerdeverbesserung, konkret das Nachreichen einer Vollmacht. Die allgemeine Anwendung auf sämtliche gerichtlichen Prozessfristen wird dort offengelassen. Die drei bisherigen Sammelpfade `ongoing / court` bleiben deshalb gesperrt. Der Berner Entscheid 200 2017 814 E. 1.2 unterstreicht zudem die Abgrenzung einer bis zu einem festen Datum erstreckten Replikfrist. [BGer 8C_767/2008][BGER], [VGer BE 200 2017 814][BE-2017].

Nicht eingeschlossen sind insbesondere BVG-Klagen, weitere noch nicht modellierte Sozialversicherungsgesetze, Sozialhilfe, Invalidenhilfe- und Altershilfebeiträge ausserhalb der Verweisung, Tarif- und Schiedsgerichtsverfahren, privatrechtliche Zusatzversicherungen, materielle Leistungs- oder Verwirkungsfristen, Revision, Wiederherstellung sowie Verfahren vor Bundesverwaltungsgericht oder Bundesgericht. Rechtsverweigerungs- und Rechtsverzögerungsbeschwerden erhalten keine erfundene 30-Tage-Frist.

## 4. Beschaffungsrecht Bern

Der Kandidat betrifft neues bernisches Beschaffungsrecht. Nach Art. 64 Abs. 1 IVöB und Art. 22a IVöBV bleiben vor dem **1. Februar 2022** eingeleitete Vergabeverfahren dem bisherigen Recht unterstellt. Ein Eröffnungsdatum im Jahr 2026 genügt nicht als Beleg für neues Recht. Die rechtlich massgebende Verfahrenseinleitung muss geklärt sein. Alte oder ungeklärte Fälle bleiben gesperrt. [IVöB][IVOEB], [IVöBV][IVOEBV].

| Fach-ID | Konkrete Handlung | Fristauslöser | Profil | Zusätzliche Norm und Grenze |
| --- | --- | --- | --- | --- |
| `PROC-APPEAL` | Beschwerde gegen Zuschlagsverfügung an die zuständige kantonale Instanz | rechtlich massgebende Eröffnung der Zuschlagsverfügung | `PROC-20` | IVöB Art. 51, 53 Abs. 1 Bst. e und 56, IVöBG Art. 3, 5 und 6. Andere Beschwerdeobjekte noch nicht eingeschlossen |
| `PROC-APPEAL-SECOND` | Weiterzug des kantonalen Beschwerdeentscheids über den Zuschlag ans Verwaltungsgericht Bern | Eröffnung dieses Beschwerdeentscheids | `PROC-20` | VGer BE 100.2024.8 E. 1.1. Ebenfalls 20 Tage, nicht VRPG-Standard von 30 Tagen |
| `PROC-INTERNAL-DAYS` | Angeordnete Tagesfrist im laufenden verwaltungsinternen Beschwerdeverfahren | Anordnung der Verwaltungsjustizbehörde | `PROC-DAYS` | eigener Stadiumseintrag vorgeschlagen, nicht unter «Vergabeverfahren» einordnen |
| `PROC-COURT-DAYS` | Angeordnete Tagesfrist im laufenden kantonalen gerichtlichen Beschwerdeverfahren | gerichtliche Anordnung | `PROC-DAYS` | ausdrücklich angeordnete Dauer, keine automatische 20-Tage-Frist |

Bern kennt aufgrund von Art. 3 Abs. 2 und Art. 6 IVöBG einen eigenen Instanzenzug. Verfügungen kommunaler Auftraggeber führen grundsätzlich zur Regierungsstatthalterin oder zum Regierungsstatthalter, diejenigen kantonaler Auftraggeber zur zuständigen Direktion oder Staatskanzlei. Die in Art. 6 Abs. 3 bezeichneten Verfügungen und Beschwerdeentscheide führen ans Verwaltungsgericht. «Beschaffung = direkt Verwaltungsgericht» wäre daher falsch. Die Anwendung der 20-Tage-Frist auch auf den Weiterzug wird in VGer BE 100.2024.8 E. 1.1 ausdrücklich bestätigt. [IVöBG][IVOEBG], [Entscheid 100.2024.8][BE-2024].

Die Eröffnung kann durch amtliche Veröffentlichung oder individuelle Zustellung erfolgen. Der spätere zusätzliche Brief oder ein Debriefing eröffnet nicht automatisch eine neue Frist. Bei ungeklärter Konkurrenz wird weder das frühere noch das spätere Datum ohne Prüfung bevorzugt. Für Publikationsfälle muss die UI das Datum als **Publikationsdatum** bezeichnen. [IVöB Art. 51][IVOEB], [IVöBV Art. 15][IVOEBV].

Die Sammlung «Vergabeverfahren» bleibt gesperrt. Angebots- und Teilnahmefristen, Fragen, Dialog und andere Verfahrensschritte sind keine einheitliche Beschwerdefrist. Auch die Anfechtung einer Ausschreibung wird nicht über den späteren Zuschlag neu eröffnet. Bundesbeschaffungen nach BöB, Gemeinschaftsbeschaffungen mit abweichendem Recht sowie Rechtsmittel ans Bundesgericht benötigen andere Zuordnungen. Die vier Kandidaten entscheiden nicht über Auftragswerte, Legitimation oder Zulässigkeit eines konkreten Rechtsmittels.

## 5. Übergabe an AP17C

Der zweispaltige Aufbau und die Trennung zwischen Eingaben, Ergebnis und automatischen Parametern bleiben bestehen. Die Fachmatrix verlangt folgende gezielte Präzisierungen, keine neue Bildschirmarchitektur:

| Stelle | Vorgabe für die spätere Integration |
| --- | --- |
| Sozialversicherung, Handlung | «Nachfrist zur Verbesserung der Beschwerde» als eigene präzise Handlung. Stadium Versicherungsgericht daraus ableiten, nicht erneut abfragen |
| Sozialversicherung, Sammelpfad | «Eingabe im laufenden Verfahren / Versicherungsgericht» nicht pauschal aktivieren. Für andere gerichtliche Handlungen konkrete Sperrmeldung |
| Beschaffung, Beschwerde | «Beschwerde gegen Zuschlag» und «Weiterzug des Beschwerdeentscheids» unterscheiden. Zuständige Instanz anzeigen, nicht bloss «Gericht» behaupten |
| Beschaffung, laufendes Verfahren | «Verwaltungsinternes Beschwerdeverfahren» zusätzlich zum gerichtlichen Stadium. Das eigentliche Vergabeverfahren bleibt ein anderer, noch gesperrter Pfad |
| Zeitrecht | Neues bernisches Vergaberecht anhand einer geklärten Verfahrenseinleitung bestimmen. Im Testvertrag eigenes Datum, in der UI ist auch eine gleich präzise Stichtagsauswahl möglich. Kein stiller Neurechtsstandard |
| Eröffnung | Individuelle Zustellung und massgebende Publikation fachlich unterscheiden. Offene Zustellungsfragen blockieren |
| Feiertage | ATSG-Anknüpfung nicht vom Behördensitz ableiten. Noch nicht unterstützte oder unklare Anknüpfung bleibt gesperrt |
| Dauer und Übersteuerung | Gesetzliche 20/30 Tage sichtbar automatisch setzen und im qualifizierten Pfad nicht frei ändern. Angeordnete N-Tage-Frist benötigt N. Übersteuerung darf keine Anwendbarkeitssperre umgehen |
| Standards | Stabile Auswahlwerte dürfen gemäss AP17A gespeichert werden. Fallbezogene Daten, die Eröffnung, Verfahrenseinleitung und fachliche Bestätigungen werden nicht als Fallwahrheit persistiert |
| Normspur | Erlass, Dauerbestimmung, Zählung, Stillstand und Feiertagsanknüpfung getrennt hinterlegen. Die spätere Normenanzeige kann darauf aufbauen |

Die technischen Kandidatenwerte `complaint-correction`, `appeal-second-instance` und `administrative-appeal` sind noch nicht implementierte Selektoren. Bestehende allgemeine Auswahlwerte dürfen nicht allein wegen einer ähnlichen Bezeichnung auf diese engeren Pfade migriert werden. Fehlende Voraussetzungen müssen durch eine fachlich eindeutige Auswahl ermittelt werden oder gesperrt bleiben. Ein allgemeines Bestätigungshäkchen ersetzt keine Qualifikation.

## 6. Referenzfälle und Prüfnachweis

Der [maschinenlesbare Referenzvertrag](../../tests/golden/candidates/ap17b-anwendbarkeit.json) ist bewusst von freigegebenen Golden Cases und Rechtsdaten getrennt. Jede der 16 Kandidatenzuordnungen hat mindestens einen positiven Fall. Alle vier gesperrten Sammelpfade und 16 verschiedene Sperrgründe sind abgedeckt.

| Fall | Annahme und Eingabe | Fachlich abgenommene Erwartung für die spätere Integration |
| --- | --- | --- |
| P01 | IV-Einwand, Eröffnung 16.09.2026, gesetzliche 30 Tage | 16.10.2026 |
| P02 / P03 | Eröffnung 10.03.2026, 30 Tage, IV-Beschwerde gegenüber gerichtlicher Beschaffungsfrist | 24.04.2026 mit ATSG-Stillstand gegenüber 09.04.2026 ohne Stillstand |
| P07 | UVG-Einsprache, Eröffnung 14.07.2026 | erster Zähltag Sonntag 16.08., Ende 14.09.2026 |
| P15 | Verwaltungsinterne Beschaffungsbeschwerde, Anordnung 30 Tage, Eröffnung 04.03.2026 | Rohende Karfreitag 03.04., Ende Dienstag 07.04.2026 |
| P18 bis P20 | Gerichtliche Tagesnachfrist zur Beschwerdeverbesserung | ATSG-Stillstand, keine Freigabe beliebiger Replikfristen |
| P21 | Weiterzug des Beschwerdeentscheids, Eröffnung 16.09.2026 | 06.10.2026, ebenfalls 20 Tage |
| P22 | Zuschlagsbeschwerde, Eröffnung 06.09.2026 | Rohende Samstag 26.09., Ende Montag 28.09.2026 |
| P23 | Zuschlagsbeschwerde, Eröffnung 05.05.2026 | Rohende Pfingstmontag 25.05., Ende 26.05.2026 |
| N08 / N23 | AHV-/UVG-Beschwerde erhält eine gewöhnliche Erstverfügung statt Einspracheentscheid | Sperre wegen falscher Verfahrenshandlung, trotz zufällig ebenfalls 30 Tagen |
| N13 bis N16 | Einleitung des Vergabeverfahrens fehlt, ist ungültig, liegt im Altrecht oder nach der Eröffnung | Sperre, keine vermutete 20-Tage-Frist |
| N28 | Replik als angebliche Beschwerdeverbesserung | Sperre |

Die vollständigen IDs tragen das Präfix `AP17B-`. Die Erwartungen sind synthetisch, keine Berechnungen realer Dossiers. Das Fenster 2026–2027 ist ein **arithmetisches Testprojektionsfenster**, keine pauschale zeitliche Rechtsfreigabe. Vor einer Aufnahme in neue Rechtsdaten sind Geltungsbeginn und gegebenenfalls Geltungsende jeder Normenkette festzulegen. Angekündigte spätere Konsolidierungen sind erneut zu prüfen.

Der unabhängige [AP17B-Validator](../../tests/golden/validate_ap17b_candidates.py) verwendet Python-Standardbibliothek und den vorhandenen freigegebenen expandierten CH-/BE-Feiertagsbestand. Er importiert weder Produktionscode noch das bisherige Rechenorakel. Tagweise Zählung wird durch eine zweite Rechnung mit Intervallschnitten gegengeprüft. Zusätzlich werden Vertragsinvarianten und absichtlich verfälschte Kandidaten geprüft. Der technische Nachweis steht im [Golden-Case-Index](../../tests/golden/README.md#ap17b-anwendbarkeitskandidat).

Ein erfolgreicher Kandidatentest ersetzt weder die juristische Abnahme noch eine funktionierende UI-, Daten- oder SPFx-Integration. Die Fachabnahme ist nachfolgend separat dokumentiert. Die Integration und ihre Nachweise gehören erst zu AP17C.

Zusätzlich am 11. September 2026 ausgeführt: TypeScript-Typprüfung erfolgreich, 301 bestehende Kern-/UI-Tests und vier Tests der statischen Webausprägung bestanden. Die separate SPFx-Testsuite wurde für dieses reine Fach- und Referenzpaket nicht erneut ausgeführt. Der bereits im AP17A-Nachweis dokumentierte offene SPFx-Testpunkt wird dadurch nicht geschlossen. Freigegebene Daten und Rechenkern weisen keine Änderungen auf. Die beiden privaten Excel-Vorarbeiten sind anhand ihrer SHA-256-Prüfsummen unverändert.

## 7. Abnahme vom 12. September 2026 und verbleibende Grenze

David Steimer hat im Projektgespräch vom 12. September 2026 nach der Vorlage des Fachpakets und der anschliessenden Umfangsdiskussion erklärt:

> AP17B kann so fertiggestellt werden.

Damit ist AP17B fachlich abgenommen und abgeschlossen. Die Abnahme umfasst:

1. die 16 begrenzten Zuordnungen samt vier Rechenprofilen und dokumentierter Feiertagsanknüpfung
2. die vier ausdrücklich gesperrten Sammelpfade, insbesondere allgemeine gerichtliche Sozialversicherungseingaben und das eigentliche Vergabeverfahren
3. die 60 synthetischen Referenzfälle mit 28 positiven und 32 Sperrfällen sowie die daraus folgenden gezielten Auswahlpräzisierungen für AP17C

Die Abnahme bindet den unveränderten [Referenzkorpus](../../tests/golden/candidates/ap17b-anwendbarkeit.json) mit SHA-256:

```text
d180d6c7dd67f30bf8abe9b101878b22b1e455ad42bbd2ca633b1ee4487b5f47
```

Der Korpus bleibt als archivische Kandidatenfassung mit `status: draft`, `approvedBy: null` und `runtimeActivation: false` erhalten. Diese technischen Merkmale bezeichnen den unveränderten Prüfgegenstand, nicht eine weiterhin ausstehende Fachabnahme. Der separate Validator bleibt unverändert. Die Fachabnahme wird ausschliesslich mit dieser Notiz dokumentiert, ohne einen freigegebenen Datenrelease oder produktive Golden Cases vorwegzunehmen.

Die Quellenprüfung und die ursprünglichen technischen Prüfungen datieren weiterhin vom 11. September 2026. Das Testprojektionsfenster 2026–2027 ist unverändert **keine pauschale zeitliche Rechtsfreigabe**. Zeitliche Geltung und zwischenzeitliche Rechtsänderungen sind vor Integration erneut abzugleichen.

Mit der Abnahme ist die fachliche Grundlage für die spätere Integration beschlossen. Sie ist **keine Datenpromotion, Veröffentlichung oder Betriebsfreigabe** und startet AP17C nicht. Die Aktivierung benötigt die getestete Umsetzung und den nachfolgenden Releaseentscheid. `OF-012` bleibt für nicht abgedeckte Rechtswege und Sachbereiche offen.

Codex hat Recherche, Matrix und technische Prüfung vorbereitet. David Steimer nimmt Fachprüfung, Umfangsentscheid und Abnahme in Personalunion wahr. Eine unabhängige zweite menschliche Prüfung wird nicht behauptet.

[ATSG]: https://www.fedlex.admin.ch/eli/cc/2002/510/20240101/de
[IVG]: https://www.fedlex.admin.ch/eli/cc/1959/827_857_845/20260101/de
[AHVG]: https://www.fedlex.admin.ch/eli/cc/63/837_843_843/20260101/de
[UVG]: https://www.fedlex.admin.ch/eli/cc/1982/1676_1676_1676/20260101/de
[IVV]: https://www.fedlex.admin.ch/eli/cc/1961/29_29_29/20250601/de
[VRPG]: https://www.belex.sites.be.ch/api/de/versions/3424/pdf_file
[IVOEB]: https://www.belex.sites.be.ch/api/de/versions/3138/pdf_file
[IVOEBG]: https://www.belex.sites.be.ch/api/de/versions/2466/pdf_file
[IVOEBV]: https://www.belex.sites.be.ch/api/de/versions/3059/pdf_file
[BGER]: https://mcp.opencaselaw.ch/entscheid/bger_8C_767_2008#e-4-3-2
[BE-2017]: https://mcp.opencaselaw.ch/entscheid/be_verwaltungsgericht_200_2017_814#e-1-2
[BE-2024]: https://entscheidsuche.ch/docs/BE_Verwaltungsgericht/BE_VG_001_100-2024-8_2024-04-04.pdf

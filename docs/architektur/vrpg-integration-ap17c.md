# AP17C · Qualifizierte VRPG-Integration und lokaler Releasekandidat

| Merkmal | Stand |
| --- | --- |
| Datum | 12. September 2026 |
| Auftrag | David Steimer: «OK, dann starte bitte.» nach der bestätigten AP17C-Umfangsabgrenzung |
| Grundlage | [AP17-Plan](../ux/vrpg-bedienkonzept-ap17.md), abgenommene AP17A-Oberfläche und [AP17B-Fachmatrix](../fachrecht/vrpg-anwendbarkeit-ap17b.md) |
| Ergebnis | Lokal umgesetzt und technisch geprüft. Durch David Steimer am 12. September 2026 fachlich abgenommen, siehe Abschnitt 7 |
| Technischer Produktvertrag | Spezialregimekatalog 3.0.0 am 12. September 2026 ausdrücklich bestätigt, [DEC-2026-020](../entscheidungen/DEC-2026-020-qualifizierter-spezialregimekatalog-v3.md) |
| Datenkandidat | [`2026-09-12-ap17c-candidate.1`](../../data/releases/2026-09-12-ap17c-candidate.1/README.md) |
| Produktionsgrenze | MVP 0.3, freigegebener Datenstand, bestehendes SPPKG, Datenpins, Mirror und Installationen bleiben unverändert |

## 1. Umgesetzter Umfang

Zwölf begrenzte Zuordnungen für individuelle Versicherungsleistungen nach IVG, AHVG und UVG sowie vier Zuordnungen im neuen bernischen Beschaffungsrecht verbinden nun die gestufte Auswahl mit dem vorhandenen Rechenkern. Allgemeines VRPG und bisher berechenbare politische Regime bleiben erreichbar. Die drei allgemeinen gerichtlichen Sozialversicherungspfade und der Sammelpfad «Vergabeverfahren» bleiben gesperrt.

Es gibt kein zweites Rechenorakel in der Oberfläche. Die Tageszählung verwendet die bestehende Rechenart `R1_RELATIVE`. Fristenstillstand und Endverschiebung werden weiterhin aus den versionierten Kalenderregeln ermittelt.

Die bestätigte Rechtsgrundlagenabgrenzung gilt unverändert: ausschliesslich Bundesrecht und kantonales Recht. Eigenständige kommunale Feiertagsregelungen sind ausgeschlossen. Örtliche Unterschiede werden berücksichtigt, soweit sie sich aus diesen Grundlagen ergeben und im betreffenden Verfahren relevant sind. AP17C erstellt weder eine gesamtschweizerische Feiertagsinventur noch eine eigenständige Kalenderapp.

## 2. Bedienung und Datenminimierung

- Die zusätzlichen Handlungen «Nachfrist zur Verbesserung der Beschwerde» und «Weiterzug des Beschwerdeentscheids» sind explizite Auswahlwerte. Beschaffungsverfahren unterscheiden neu auch das verwaltungsinterne Beschwerdeverfahren.
- Ein aus der Handlung bestimmbares Stadium erscheint in den automatischen Parametern und wird nicht nochmals abgefragt.
- Verfahrensgegenstand und fristauslösendes Dokument werden als feste, gut lesbare Modellvoraussetzungen angezeigt. Bei nur einer unterstützten Eröffnungsart gilt dasselbe für die Eröffnung. Es gibt dort weder Dropdown-Pfeil noch Pflichtauswahl. Die Werte werden aus dem ausgewählten Fachpfad abgeleitet, nicht als bestätigte Falltatsachen gespeichert.
- Tatsächliche Fallentscheidungen bleiben Eingaben: im Beschaffungsrecht individuelle Zustellung oder amtliche Publikation, beim ATSG die Anknüpfungen von Partei und Vertretung sowie bei Beschaffungen die Verfahrenseinleitung. Diese Angaben beginnen leer. Ein allgemeines Bestätigungshäkchen wird nicht eingeführt.
- Die ATSG-Auswahl unterscheidet Partei im Kanton Bern ohne Vertretung, Partei und Vertretung im Kanton Bern sowie andere oder ungeklärte Anknüpfungen. Der letzte Pfad bleibt gesperrt. Der Behördensitz ersetzt diese Prüfung nicht.
- Die Gemeinwesenauswahl heisst in allen Rechtsbereichen statisch «Sitz der zuständigen Stelle». Die Auswahlwerte bleiben unverändert. Diese sprachliche Vereinfachung erweitert weder den unterstützten bernischen Verfahrenskontext noch die ATSG-Anknüpfung. Gerichtliche Dokumentauswahlen bezeichnen ausdrücklich das zuständige bernische Versicherungsgericht.
- Bei Beschaffungen ist das tatsächliche Datum der rechtlich massgebenden Verfahrenseinleitung erforderlich. Es wird nicht aus dem Eröffnungsdatum abgeleitet. Vor dem 1. Februar 2022 eingeleitete oder ungeklärte Verfahren bleiben gesperrt.
- Individuelle Zustellung und amtliche Publikation werden unterschieden. Bei Publikation heisst das Datumsfeld «Datum der massgebenden Publikation», sonst im qualifizierten Pfad «Datum der rechtlich massgebenden Zustellung». Der Rechner ermittelt in diesem Pfad keine Zustellfiktion. Ein Wechsel zwischen diesen Datumsbedeutungen entfernt den alten Datumswert.
- Gesetzliche 20 beziehungsweise 30 Tage sind automatisch gesetzt und nicht frei änderbar. Angeordnete Tagesfristen benötigen eine explizite ganze Zahl von 1 bis 365. Das ist eine technische Eingabegrenze, keine gesetzliche Höchstdauer.
- Bereich, Erlass, Handlung und Stadium bleiben als Standards speicherbar, auch «Bitte wählen». `vrpgContext`, Datumswerte, fachliche Bestätigungen und Kalenderreferenzen werden nicht gespeichert. Eine bestehende allgemeine gerichtliche Auswahl wird nicht still zur engeren Beschwerdeverbesserung migriert.
- Jede fachliche Änderung entwertet Ergebnis und Kalenderexport. Fehlende oder widersprüchliche Voraussetzungen liefern kein Datum. Die bisherige Kalenderdatei entsteht nur aus einem erfolgreichen Ergebnis.

Alle Felder, Aktionen, Resultate und Parameter halten das zweispaltige Raster ein. Auf schmalen Geräten bleibt die bestehende einspaltige Anpassung erhalten. Der qualifizierte Ergebnisblock zeigt den Tag nach der Eröffnung getrennt vom ersten tatsächlich gezählten Tag, dazu Stillstandstage und Endverschiebung. Die Kalenderaktion bleibt rechts unten.

### Beschlossene Bedienkorrektur vom 12. September 2026

David Steimer hat die Korrektur mit «Sehr gut. Ich bin mit dieser Korrektur einverstanden. Bitte setze sie so um.» beauftragt. Ein Dropdown mit genau einem unterstützten Wert und «anders oder unbekannt» wird nicht als echte fachliche Auswahl behandelt. Der unterstützte Wert erscheint stattdessen als feste Anzeige an derselben Rasterposition. Die Anzeige ist nicht ausgegraut, lange Texte umbrechen auch auf Französisch. Feste Anzeigen erzeugen keine zusätzlichen Tabulatorschritte. Native HTML-`output`-Elemente mit zugänglicher Beschriftung und natürlichem Zeilenumbruch vermeiden das im Browsercheck festgestellte Höhenproblem mehrzeiliger Fluent-Textfelder beim Verkleinern der Ansicht.

Diese Änderung ersetzt die anfänglichen drei zusätzlichen Pflichtauswahlen im Sozialversicherungsrecht beziehungsweise zwei im Beschaffungsrecht. Sie verändert den Bedien- und Eingabenachweis, nicht die abgegrenzten Fachregeln oder die Referenzergebnisse. Ein angezeigter Modellumfang ist keine vom Rechner geprüfte Zuordnung des tatsächlichen Falls. Die damalige Zustimmung betraf diese Korrektur, nicht bereits eine abschliessende AP17C-Abnahme oder Betriebsfreigabe. Die nachfolgende ausdrückliche Fachabnahme ist in Abschnitt 7 dokumentiert.

David Steimer hat anschliessend dieselbe Darstellung für die einzige unterstützte Handlung unter «Politische Rechte → Eidgenössische Angelegenheit» verlangt. «Weiterzug gegen Regierungsentscheid zu eidgenössischer Abstimmung» wird deshalb mit der Ebenenwahl automatisch eingesetzt und fest angezeigt. Die bestehende französische Fachbeschriftung bleibt unverändert. Leere oder fehlende gespeicherte Handlungswerte werden bei dieser eindeutigen Ebene ergänzt. Falsche nichtleere Werte werden nicht in diese Handlung umgedeutet. Auf kantonaler und kommunaler Ebene bleibt die echte Auswahl bestehen. Ebenenwechsel entfernen weiterhin Ergebnis, Datumsanker und Kalenderexport. Ein fehlender, gesperrter, verborgener oder mehrdeutiger Katalogeintrag wird durch die feste Anzeige nicht freigeschaltet. Die Rückmeldung «Sonst ist alles OK» wird als positives GUI-Feedback festgehalten, nicht als Datenpromotion oder Betriebsfreigabe.

David Steimer hat anschliessend eine einheitliche Beschriftung der Gemeinwesenauswahl beschlossen: «Sitz der zuständigen Stelle», französisch «Siège de l’organisme compétent». Die Bezeichnung «Unterstützter Verfahrenskontext» und der besondere Berner Optiontext entfallen im Sozialversicherungspfad. Die Beschriftung bleibt beim ersten Laden, nach dem Wiederherstellen gespeicherter Standards und bei Erlass- oder Bereichswechseln gleich. Die bisherigen Auswahlwerte mit dem Begriff «Behörde» bleiben als bewusst akzeptierte sprachliche Vereinfachung erhalten. Ziel ist eine ruhigere Bedienung ohne fachlich unnötige Beschriftungswechsel. Filterung, Anwendbarkeitsprüfung, notwendige dynamische Fallfelder und zweispaltiges Layout bleiben unverändert.

## 3. Zentraler Anwendbarkeitsvertrag

Die neue Fachdefinition enthält `applicability` mit Mapping-ID, exakter Auswahl, Sachbereich, Trigger, bernischem Verfahrenskontext, Kalenderanknüpfung, zulässigen Eröffnungsarten, gegebenenfalls Neurechtsstichtag sowie technischer Fallabdeckung und Normspur.

Die öffentlichen Kernfunktionen `resolveQualifiedSpecialDeadline` und `calculateQualifiedSpecialDeadline` verwenden denselben Vertrag. Auch `calculateSpecialDeadline` prüft ihn zwingend erneut. Das Weglassen des Kontextes, veränderte Datum-/Dauerwerte, Komponentenwechsel oder alte Bestätigungswerte umgehen ihn nicht. AP17C-IDs benötigen den Vertrag unabhängig davon, welches Katalogformat ein Aufrufer behauptet. Ungültige Vertragsdatumsfelder ergeben eine kontrollierte Sperre statt einer unbehandelten Ausnahme.

Der archivische AP17B-Testvertrag bleibt unverändert. Sein optional fehlender Eröffnungskanal ist nur bei bereits ausdrücklich vorgegebenem `notificationConfirmed: true` kompatibel. Fehlt das neue optionale Eingabenmerkmal `qualificationBasis`, gilt weiterhin dieser bisherige Vertrag.

Die korrigierte UI verwendet ausdrücklich `qualificationBasis: displayed-model-scope`. `matter` und `triggerKind` bezeichnen dabei den sichtbaren Modellumfang. Bei einer fest angezeigten Eröffnungsart bleibt `notificationConfirmed: false`. Der Kern akzeptiert dies nur, wenn der aktive Vertrag genau einen unterstützten Kanal enthält und der übergebene Kanal exakt übereinstimmt. Bei mehreren Kanälen ist weiterhin eine echte Auswahl erforderlich. Eine unbekannte Basis, fehlende oder widersprüchliche Kanäle sowie die bisherigen Sperrgründe bleiben Fehler. Die Basis wird im weitergereichten Anwendbarkeitskontext erhalten und nicht nachträglich zu einer Bestätigung umgedeutet.

`VrpgContextState` enthält nur noch die tatsächlichen Fallangaben zu Eröffnung, Feiertagsanknüpfung und Verfahrenseinleitung. Gegenstand und Dokument werden nicht darin gespeichert. Feste Anzeigen entstehen nach einem Neuladen aus der gespeicherten Verfahrensauswahl neu, während Fallangaben und Datum leer bleiben. Der v3-Datenkatalog, dessen Schema und sämtliche Kandidatenartefakte bleiben durch diese UI-Korrektur bytegleich. Es ändert sich nur der Laufzeit-Eingabevertrag.

### Bestätigter technischer Produktvertrag

| Komponente | Bestätigte Formatversion | Veränderung |
| --- | --- | --- |
| Release-Manifest | 3.0.0 | Hauptformat unverändert, v3-Spezialkatalog als explizite Schema-ID ergänzt |
| Rechtsprofile | 1.0.0 | Alle fünf bisherigen Artefakte bytegleich |
| Regelkalender | 2.0.0 | Beide bisherigen Artefakte bytegleich |
| Spezialregimekatalog | 3.0.0 | Pflichtfeld `applicability` bei berechneten Definitionen, bei unverändertem Altbestand explizit `null`, dazu ausdrücklich gesperrte Mapping-IDs |

Der v3-Vertrag folgt dem Prinzip von [DEC-2026-014](../entscheidungen/DEC-2026-014-komponentenweise-fachdatenformatevolution.md). David Steimer hat ihn am 12. September 2026 ausdrücklich als technischen Produktvertrag bestätigt. [DEC-2026-020](../entscheidungen/DEC-2026-020-qualifizierter-spezialregimekatalog-v3.md) hält diesen Architekturentscheid fest. Die bestehende v2-Komponente bleibt lesbar. Der normale SPFx-Provider verlangt weiterhin `releaseStatus: approved` und lehnt den tatsächlichen AP17C-Kandidaten bereits nach dem Manifestabruf ab. Es gibt keinen Kandidatenmodus im normalen Provider.

Die fachliche Abnahme von AP17C ist in Abschnitt 7 dokumentiert. Die anschliessende ausdrückliche Bestätigung des technischen Produktvertrags ist davon getrennt nachgewiesen und nicht mehr ausstehend. Datenpromotion und Betriebsfreigabe bleiben separate Schritte.

## 4. Zeitrecht und Quellen

Der [Quellenabgleich](../fachrecht/quellenabgleich-ap17c.md) dokumentiert aktuelle Originalquellen und artikelbezogen geprüfte angekündigte Fassungen für 2027. Neue qualifizierte Fristen sind technisch auf Eröffnungen und Ergebnisse vom **1. Januar 2026 bis 31. Dezember 2027** begrenzt. Das Ende bezeichnet kein gesetzliches Ausserkrafttreten. Es ersetzt auch nicht die periodische Quellenprüfung. Bisherige offene Kalender- und Rechtsprofilabdeckungen bleiben unverändert.

Ein Vergabeverfahren darf vor 2026 eingeleitet worden sein, sofern die Einleitung ab 1. Februar 2022 liegt. Dieser Übergangsrechtsanker ist kein gezählter Fristentag. Die angekündigten Vergleichsfassungen werden getrennt im Quellenregister und Vergleichsnachweis geführt, nicht als bereits angewendete Normen einer Berechnung für 2026 ausgegeben.

## 5. Lokale Vorschau und Wiederholbarkeit

Mit der vorhandenen Node-22-Toolchain im Repository:

```sh
npm run build:data:ap17c:candidate
npm run typecheck
npm run test:ap17c
npm run preview:ui
```

Anschliessend `http://127.0.0.1:4173/?candidate=ap17c` öffnen. Ohne den Kandidatenparameter verwendet die Vorschau weiterhin den freigegebenen MVP-0.3-Datenstand. Eine sichtbare gelbe Kandidatenzeile verhindert die Verwechslung mit einem freigegebenen Release. Die aktuell zur Prüfung gestartete Vorschau verwendet Port 8793.

Der separate lokale statische Kandidat wird mit `FRISTENRECHNER_DATA_CANDIDATE=ap17c npm run preview:public` gebaut und unter `/fristenrechner/` bereitgestellt. Sein Ausgabeordner `.work/public-ap17c` ist vom normalen `.work/public-app` getrennt. Die normale öffentliche Einstiegdatei und ihr MVP-0.3-Datenpin bleiben unverändert. Der Kandidaten-Buildnachweis enthält `deployable: false`.

`scripts/check-ap17c-ui.mjs` prüft ausschliesslich Loopback-Adressen, verwendet einen vorhandenen Browser im isolierten Testprofil und blockiert externe Seitenanfragen. Private Browserprotokolle und Screenshots liegen unter `.work/qa/ap17c-*` und gehören nicht zum öffentlichen Nachweisbestand.

## 6. Technischer Nachweis

Die nachstehende Schlussprüfung bezieht sich auf den endgültigen lokalen Implementierungsstand vom 12. September 2026. Die AP17A- und AP17B-Nachweise bleiben historische Referenzen und werden nicht rückwirkend überschrieben. Technisch bestandene Prüfungen ersetzen weder Davids Abnahme noch eine Betriebsfreigabe.

| Prüfung | Stand |
| --- | --- |
| AP17B-Korpus | Unverändert, 60 Referenzfälle werden im tatsächlichen Rechenkern reproduziert |
| Zusätzliche Kernprüfung | 26 Altfall-Paritätsprüfungen im neuen Katalog, 29 Schutz-, Quellen-, Abdeckungs- und Identitätsprüfungen sowie 23 neue Prüfungen zur Trennung von Modellumfang und Fallbestätigung. Mit den 60 Referenzfällen zusammen 138 AP17C-Kerntests bestanden |
| UI-Adapter | 28 positive Referenzfälle über die tatsächliche UI-Abbildung und zehn weitere Modellumfang-/Auswahl-/Sperr-/Default-/Sprachtests bestanden |
| Gesamte Kern-/UI-Suite | TypeScript-Prüfung und alle 487 Tests nach der ergänzten Bedienkorrektur bestanden, keine übersprungenen Tests. Sieben neue Tests betreffen die feste eidgenössische Handlung, drei weitere die statische DE-/FR-Stellenbeschriftung |
| Statischer Build | Vier Buildtests bestanden, Kandidaten- und Normalausgabe getrennt |
| AP17B-Referenzvalidator | Alle 60 Fälle sowie 17 negative Selbsttests bestanden, Korpus und Validator unverändert |
| Generischer Releasevalidator | Vollständiger Kandidat gültig, alle 19 negativen Selbsttests bestanden. Rückwärtsprüfung aller acht bisherigen historischen Releases bestanden |
| Browser, Kandidat | Je 21 Szenarien nach der ergänzten Bedienkorrektur einschliesslich statischer Stellenbeschriftung in UI-Vorschau und statischer Ausprägung bestanden. DE/FR, Desktop, Tablet, Mobilgerät, Tastatur, Standards, Sperren und Kalenderexport geprüft. Feste Modellanzeigen, eidgenössische Handlung, Ebenen- und Eröffnungswechsel einschliesslich Datums-/Ergebnis-/ICS-Rücksetzung abgesichert |
| Browser, bisheriger Datenstand | Alle neun AP17A-Regressionsszenarien bestanden. In sämtlichen drei Browserläufen keine Seitenfehler, keine externen Seitenanfragen, kein horizontaler Überlauf und keine abgeschnittenen Auswahltexte |
| Visuelle Prüfung | Nach der Bedienkorrektur insbesondere IV-Einwand auf Deutsch sowie lange französische Sozialversicherungsanzeigen in Tablet- und Mobilansicht anhand der erzeugten Screenshots geprüft |
| SPFx | Abschliessende Quellensynchronisation, alle 25 Tests, Heft-Produktionsbuild und CSS-Audit bestanden. Zwei unveränderte `no-new-null`-Lintwarnungen. Kein neues SPPKG erzeugt. [Detailnachweis](ap17c-spfx-pruefung.md) |
| Dokumentation und Whitespace | Erstprüfung: 52 lokale Dokumentlinks aufgelöst und alle 78 Dateien des eingegrenzten AP17-Arbeitsumfangs ohne Whitespace-Befund, mit der nachstehend beschriebenen Git-Einschränkung. Die 13 Dateien der Bedienkorrektur zusätzlich vollständig geprüft |

Die 138 Kern- und 38 UI-Tests für AP17C sowie die sieben zusätzlichen Tests der eidgenössischen Handlung und drei Tests zur statischen Stellenbeschriftung sind Teil der 487 Tests und werden nicht zusätzlich gezählt. Die 21 + 21 + 9 Browserszenarien wurden nach der Vereinheitlichung der Stellenbeschriftung nochmals wiederholt. Die Kandidatenprüfung vergleicht das sichtbare DE-/FR-Feldlabel und den bisherigen Berner Auswahltext exakt, auch nach Wiederherstellung gespeicherter Standards und dem Wechsel StPO → VRPG → Sozialversicherungsrecht. Das Testskript wartet ereignisbasiert auf geschlossene Auswahlfenster und die tatsächlich gerenderte Auswahl, damit Sprachwechsel nicht vor Abschluss der Darstellung geprüft werden. DE und FR wurden zusätzlich anhand der Screenshots visuell kontrolliert. 19 lokale Verweise in den drei aktualisierten UI-/Architekturnachweisen wurden aufgelöst, die betroffenen Textdateien ohne Whitespace-Befund geprüft.

Die Browserläufe ersetzen keine tatsächlichen SharePoint- oder Teams-Hosttests. Die privaten aktuellen Wiederholungsnachweise liegen unter `.work/qa/ap17c-stable-authority-*`, der SPFx-Lauf unter `.work/qa/ap17c-authority-label-spfx.log`. Frühere Nachweise unter `.work/qa/ap17c-fixed-*` bleiben erhalten. Datenkandidat und AP17B-Korpus bleiben unverändert.

| Kandidatenartefakt | SHA-256 |
| --- | --- |
| `manifest.json` | `e13a5cc8887bb6f16572d87729728511d71b8048690e2ef514c0194f21c61b90` |
| `special-regimes/vrpg-be.json` | `e71dc58239f720f4dbfc5be47b862e05852acd5431f6dda36b5bfe7e733aded4` |

Der anfängliche SPFx-Testhänger war ein lokales OneDrive-Dateiverfügbarkeitsproblem. Die unveränderten Abhängigkeiten wurden aus dem vorhandenen npm-Cache wiederhergestellt. Der ausgelagerte Ausgangsbaum bleibt lokal erhalten. Weder Abhängigkeitsversionen noch Berechtigungen wurden geändert.

Beim abschliessenden Git-Inhaltsvergleich war der historische Basisblob von `data/README.md` durch OneDrive ausgelagert und nicht lesbar. Der vollständige reguläre Gesamtdiff konnte deshalb nicht abgeschlossen werden. Stattdessen wurden 38 andere geänderte versionierte Dateien einzeln mit `git diff --check` und die vollständig lesbare aktuelle `data/README.md` sowie 39 neue Dateien mit `git diff --no-index --check` gegen `/dev/null` geprüft. Keine Whitespace-Befunde. Die fremde Word-Änderung und `Userinput` blieben unberührt und ausserhalb dieser Prüfung. Vor einem späteren Commit beziehungsweise Push ist die Lesbarkeit des Git-Basisobjekts wieder zu prüfen.

## 7. Fachabnahme vom 12. September 2026, Freigabe und Rückfall

David Steimer hat im Projektgespräch ausdrücklich erklärt:

> AP17C ist fachlich abgenommen.

Damit ist die fachliche Abnahme des lokalen AP17C-Integrationsstands einschliesslich der anschliessend geprüften Bedienkorrekturen dokumentiert. Sie betrifft die 16 begrenzten Fachpfade, die Auswahlführung und festen Modellanzeigen, die statische Stellenbeschriftung, Sperren und Standardwerte sowie die ausgewiesene technische Fallabdeckung 2026–2027. Die Kandidatenidentität und Prüfsummen sind in Abschnitt 6 festgehalten. Die vier gesperrten Sammelpfade, weitere Fachzuordnungen und der schweizweite Feiertagsausbau werden dadurch nicht freigegeben.

Die erfolgreichen technischen Prüfungen sind ein eigener Nachweis. Die Erklärung zur Fachabnahme allein war keine Bestätigung des technischen Produktvertrags. David Steimer hat diesen anschliessend gesondert bestätigt:

> Der vorgeschlagene Spezialregimekatalog `3.0.0` ist ausdrücklich als technischer Produktvertrag bestätigt.

Damit sind die fachliche AP17C-Abnahme und die Bestätigung des v3-Produktvertrags erfolgt. Letztere ist in [DEC-2026-020](../entscheidungen/DEC-2026-020-qualifizierter-spezialregimekatalog-v3.md) dokumentiert. Keine der beiden Erklärungen ist eine Datenpromotion oder Betriebsfreigabe. Der Datenstand `2026-09-12-ap17c-candidate.1` bleibt unverändert mit `releaseStatus: candidate` erhalten. Die Vermerke ändern keine Datenartefakte, Prüfsummen oder Providerfreigaben.

David Steimer entscheidet in Personalunion. Codex dokumentiert die Erklärung und liefert Umsetzung und Prüfnachweise, ohne formelle Freigabe- oder Haftungsverantwortung. Eine unabhängige zweite menschliche Prüfung wird nicht behauptet.

Noch nicht erfolgt und weder durch den Startauftrag, die fachliche Abnahme noch die Bestätigung des technischen Produktvertrags freigegeben sind GitHub-Push, Datenpromotion, neues definitives SPPKG, Aktualisierung des SharePoint-Mirrors sowie E-/Q-/P-Deployment oder Betriebsfreigabe. Es wurden keine bestehenden Installationen verändert. Ein betrieblicher Rollback ist daher derzeit nicht erforderlich. Für die lokale Rückkehr zur bisherigen Datenbasis genügt die Vorschau ohne Kandidatenparameter beziehungsweise der normale öffentliche Build.

Vor einer späteren Veröffentlichung sind Code- und Datenstand zu fixieren, der Quellenstand samt neuem AP13-Prüfereignis abzugleichen, die Promotion gesondert freizugeben und die tatsächliche SharePoint-/Teams-/P-Matrix auf den freigegebenen Artefakten auszuführen. Der schweizweite Kalenderausbau und weitere Fachzuordnungen bleiben eigene Arbeitspakete.

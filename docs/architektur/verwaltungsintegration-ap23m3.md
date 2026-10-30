# AP23M3 Native Integration Neuenburg, Waadt und Wallis

Stand: 28. Oktober 2026. Lokale Umsetzung des [M3-Auftrags](start-ap23m3.md) nach [technischer M2-Abnahme](../fachrecht/abnahme-ap23m2.md) und [beschlossenem DEC-2026-042](../entscheidungen/DEC-2026-042-beschluss.md). Die menschliche fachlich-technische M3-Abnahme und alle Release- und Betriebsfreigaben bleiben getrennt.

## Umfang und tatsächlicher Kandidat

Der native Vertrag umfasst **Kantonalverfahrenskatalog 10.0.0 sowie Manifest und Mindestconsumer 17.0.0**. Der neue lokale Kandidat `2026-10-28-ap23m3-candidate.1` verbindet die 196 bisherigen mit 49 neuen NE-/VD-/VS-Pfaden, insgesamt **245**. Die abgenommenen 49 Gruppen sind keine 49 Eingabefelder. Die Oberfläche führt über Verfahrensstadium und Handlung zu den wenigen tatsächlich erforderlichen aktuellen Alternativen.

Der [Kandidat](../../data/candidates/2026-10-28-ap23m3/) ist **kein freigegebener Datenrelease**. Die 44 Artefakte und das Manifest werden deterministisch erzeugt. Gegenüber M2 bleiben 42 Artefakte rohbytegleich. Verwaltungs- und Sozialkatalog erhalten die tatsächlichen Zielreleasebindungen. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben fachlich unverändert. Es bleiben 35 Kalender und 499 Katalogregeln. Die zwei prozessualen Ergänzungsdaten sind unveränderter SZ-Bestand, keine neue M3-Feiertagsregel.

## Reader, Identität und Rechenkern

Der eigene Format-17-Byteparser prüft geschlossenes Manifest und Katalog, exakte Dateiliste, Byteumfang und SHA-256, Quellen-, Kalender-, Pfad- und Policybindungen. Lokale Referenzdaten und tatsächlich freigegebene Daten haben getrennte Lesemodi. Eine kopierte Kontextstruktur, ein serialisiertes Objekt oder ein umbeschrifteter Freigabekopf schafft keine Laufzeitberechtigung. Versteckte Eigenschaften, Getter, Symbolschlüssel und lückenhafte Arrays sind keine zulässige Umgehung des Eingabevertrags.

Der neue V10-Kern verarbeitet die M3-Wege im echten Format-17-Kontext. Eine neue, getrennte Bestandsimplementierung führt die alte V9-Semantik im geprüften neuen Kontext fort. Es wird kein künstlicher alter Vertrauenskontext erzeugt. Alte V9-/Format-16-Dateien und frühere Reader bleiben unverändert. Die gemeinsamen Dispatcher führen Bundes-, BE-, Sozial- und Verwaltungswege nur durch ihre tatsächlich zusammengehörige Releasekombination.

Kalenderregeln werden nach ihrer einzelnen Tagesgültigkeit erzeugt. Nicht jede Regelgültigkeit wird pauschal zur Grenze des ganzen Kalenders. Auslöser, normalisierte Eröffnung, Zählung und sämtliche Endverschiebungstage müssen dennoch durch die jeweils einschlägigen Norm-, Pfad-, Kalender- und Releasegrenzen gedeckt sein. Für die neuen allgemeinen Verwaltungswege gilt vollständig **29.08.2026–31.12.2027**.

## Aktuelle Fallqualifikation und Bedienung

Der zweispaltige Aufbau, die frühe Datumseingabe und die statische übergeordnete Beschriftung **Sitz der zuständigen Stelle** bleiben erhalten. Einzelausprägungen werden fest angezeigt. Es gibt kein zusätzliches Dokumentfeld und keine neue Bestätigungscheckbox. Die aktuelle Fallkonstellation bleibt eine echte Qualifikation des vorliegenden Falls, nicht eine gespeicherte allgemeine Behauptung.

| Bereich | Tatsächlich erforderliche aktuelle Angabe | Begrenzung |
| --- | --- | --- |
| NE-Verwaltung | Sitzregion ausserhalb Le Landeron oder Le Landeron | Kein stiller erster Treffer und keine Wahl eines beliebigen Feiertagskantons |
| NE-Gericht | Der qualifizierte gerichtliche Weg bindet Neuchâtel fest | Keine unnötige Regionsauswahl und keine automatische Zuständigkeitsprüfung |
| VD | Bereits rechtlich bestimmter Tag oder physischer Eingang einer einfachen Postzustellung ohne Unterschrift | Im Rohmodus müssen die beiden abgenommenen aktuellen Voraussetzungen mitqualifiziert sein. Die AI-Trackingregeln werden nicht übernommen |
| VS, längere Belehrung | Aktuell wirksame längere Tagesbelehrung und ordentliche Basis von 10 oder 30 Tagen | Nur eine Dauer oberhalb der gewählten Basis. 15 über 10 ist zulässig, es gibt keine zusätzliche AI-31-Schwelle |
| Angeordnete Tagesfristen | Aktuelle gültige Dauer ab der rechtlich bestimmten Eröffnung | Eine Verlängerung ab einem alten Fristende wird nicht als neue Frist ab Empfang umgedeutet |

Beim Wechsel der VD-Datumsbedeutung werden Datum, aktuelle Qualifikation und altes Resultat verworfen. Die frühe Eingabe vor der ersten Auswahl bleibt möglich. Bei einem relevanten Pfad- oder Regionswechsel ist die aktuelle Fallqualifikation erneut erforderlich. Art. 81 VD bleibt eine ausdrücklich aktuelle rechtliche Qualifikation. Die technische Obergrenze des allgemeinen Tagesfelds ist kein Nachweis einer gesetzlich zulässigen Erstanordnung.

Persönliche Vorgaben bleiben **Version 5**. Sie speichern weder Empfang noch Referenz, aktuellen Ort, Eröffnungsmodus, aktuelle Fallqualifikation oder tatsächliche Anordnungs- und Belehrungsdauer. Gesetzliche Dauer und bestätigte aktuelle Dauer werden nicht verwechselt. Ein fremder neuer Pfad im älteren Consumer erzeugt keinen erfundenen Ersatzpfad und keine automatische Löschung geschützter Standards.

## Rechenspur und fachliche Grenzen

Die DE-/FR-Spur trennt physischen Eingang, rechtlich massgebende Eröffnung, kalendermässigen Beginn, ersten gezählten Tag, Stillstand und Endverschiebung. Die normalen Rechtsgrundlagen erscheinen lesbar mit Links auf die tatsächlich gebundenen amtlichen Quellen. Rohe Quellenkennungen und Forschungsannotation gehören nicht in den gewöhnlichen Erklärungstext. Technische Nachweise bleiben separat aufklappbar.

NE verwendet die beiden abgenommenen Kalenderregionen und im qualifizierten Gerichtsweg Neuchâtel. Der Vorbehalt zusätzlicher jährlicher oder örtlicher Schliessanordnungen bleibt als berechenbare Grenze sichtbar. VD trennt Erstverfahren, Verwaltungsbeschwerde und Gericht sowie die drei Tage bei verweigerter rechtzeitig verlangter Verlängerung nach bestätigtem Ablauf der Ursprungsfrist und die zwei Eröffnungsmodi. Die neun Feiertage des gebundenen LEMP-Kalenders werden nicht um den 26. Dezember ergänzt. VS trennt unter anderem mündliche und vollständige schriftliche Eröffnung, ordentliche und wirksam längere Belehrung, Verwaltung ohne allgemeinen Stillstand und gerichtliche Wintergrenze bis 5. Januar. Karfreitag wird nicht zum Walliser Feiertag gemacht.

Die drei abgenommenen Fälle einer Endverschiebung in neu beginnenden Stillstand bleiben gesperrt. Es gibt dann kein definitives Ende und keinen Kalenderexport. Andere offene Fragen werden nicht durch zwei übereinstimmende Programme rechtlich entschieden. Keine weiteren ausserbernischen Sozialfreigaben, keine eigenständigen kommunalen Verfahren und keine automatische Rechtsmittelkette.

## Nachweise am tatsächlichen Produkt und Artefakt

Die 109 unveränderten M1-Referenzen ergeben 73 Datumsfälle, 27 Qualifikationsgrenzen, sechs Zeitfenstergrenzen und drei Kollisionsgrenzen. Sie werden im nativen Format-17-Kern und mit unabhängiger Python-Arithmetik aus den neuen Kandidatenbytes geprüft. Die 33 technischen M2-Proben bleiben davon getrennt. Der [native Bericht](../../outputs/ap23m3-2026-10-28/native-reference-verification.json) umfasst zusätzlich 196 mathematisch unveränderte frühere Positivfälle. Der [geerbte Vergleich](../../outputs/ap23m3-2026-10-28/inherited-reference-verification.json) erhält 776 weitere Alt- und Grenzfälle mit genauer Herkunft pro Zeile.

Die [unabhängige Prüfung](../../outputs/ap23m3-2026-10-28/independent-verification.json) importiert weder Produktarithmetik noch den früheren M2-Prüfer. Sie enthält 1’239 eigene Proben, 22 physische Kalenderanker, 70 Kalenderjahresinventare und drei gezielte Mutationsempfindlichkeiten. Der ergänzende statische Vergleich der 196 und 776 geerbten Fälle ist ausdrücklich **keine neu implementierte unabhängige Altarithmetik**.

Sechs technische Diagnosen unterscheiden sich zwischen M2-Prüfer und nativem Produkt, ohne ein abgenommenes Datumsresultat zu ändern. Der Bericht benennt die einzelnen Fälle zu fremder Pfadrevision, unpassender Behörde und ungültigen Datums- beziehungsweise Dauereingaben ausdrücklich. Eine pauschale Umbenennung verdeckt keine Abweichung. Alle betroffenen ursprünglichen Erwartungen verlangen eine Sperre.

Die vollständigen Produkt-, UI-, Host-, Schema-, Mutations-, Defaults- und Governanceprüfungen sind im [QA-Bericht](../../outputs/ap23m3-2026-10-28/QA-AP23M3.json) mit tatsächlichen TAP-Zahlen gebunden. Web und SPFx werden getrennt aus demselben lokalen Produktstand gebaut. Der [Paketnachweis](../../outputs/ap23m3-2026-10-28/actual-package.json) prüft das tatsächlich gebaute isolierte SPPKG. Er belegt keine Installation im Tenant. Der [Browsernachweis](../../outputs/ap23m3-2026-10-28/browser-verification.json) gehört zur tatsächlichen gebauten lokalen Webansicht und ist kein realer Geräte-, Gast- oder M365-Test.

Die lokale Ansicht sperrt **sämtliche Kalenderexporte**. Die Exportbindung wird zusätzlich mit ausschliesslich synthetisch freigegebenen Kontexten im Arbeitsspeicher geprüft: 73 positive Originalfälle über 49 Pfade, 146 DE-/FR-Kalenderstrings, 36 Sperrfälle und veränderte Fakten, Dauern, Daten, Ergebnisse und Kontexte. Keine echten ICS-Dateien gespeichert, kein Outlook-Import. Der [Exportnachweis](../../outputs/ap23m3-2026-10-28/calendar-export-verification.json) erteilt keine Datenfreigabe.

## Nach der menschlichen M3-Abnahme entdeckter Releaseblocker R10-H01

Während der anschliessend beauftragten Releaseinventur wurde ein bislang nicht abgedeckter Bestandsübergang tatsächlich reproduziert. `hasSocialUi` in `src/ui/socialUi.ts` berücksichtigt Format 5 bis 16, noch nicht Format 17. Der echte M3-Kontext enthält unverändert 44 Sozialregeln und 50 BE-Anbindungen, die UI-Hilfe bietet aber keinen Sozialpfad an. Mit dem echten freigegebenen MVP09-/Format-9-Kontext sind dieselben exemplarischen IVG-, AHVG- und MVG-Pfade vorhanden. Der [gebundene Befund](../../outputs/ap23m3-2026-10-28/post-acceptance-social-ui-finding.json) und [reproduzierbare Diagnose](../../scripts/check-ap23m3-social-ui-regression.ts) trennen diese Prüfung von einer Produktkorrektur.

Die bisherigen grünen Tests der 245 administrativen Pfade und der mathematisch unveränderten Sozialdaten sind daher **kein vollständiger Bestands-UI-Nachweis für Format 17**. Die 49 neuen Kantonswege bleiben geprüft. Die fachlich-technische Abnahme ihrer Integration durch David ist erklärt. Eine Akzeptanz des erst danach gefundenen Fehlers als Releaseausnahme wird daraus ausdrücklich nicht abgeleitet.

Der technische Abschluss verwendet deshalb den eingeschränkten Status `local-scoped-verification-passed-with-release-blocker` mit `releaseReadiness.ready=false`. Es gibt keine stille Korrektur am gerade abgenommenen Stand. Vor einer Promotion oder Auslieferung ist ein eng begrenzter Korrekturauftrag mit tatsächlichen Format-17-Sozial-UI-Regressionsfällen und anschliessend neuen Buildnachweisen erforderlich.

## Erhaltung und technische Restpflege

Die [M3-Schutzbindung](../../outputs/ap23m3-2026-10-28/protected-inputs.json) und [Erhaltungsprüfung](../../outputs/ap23m3-2026-10-28/preservation-verification.json) schützen 11’540 unveränderliche Bestandsdateien. 157 vorhandene Dispatcher-, UI-, Host- und generierte Dateien sind genau bezeichnet. Alte Fachvorlagen, Schemata, Reader, Tests, Nachweise, AP5-Pins, Betriebspaket und die benutzerbearbeitete Projektplankopie bleiben erhalten. Stylesheets werden nicht geändert. Die zusätzliche kopierte V10-Eingabeschemadatei ist nur über ihre exakte Quelle und Bytegleichheit zugelassen.

Ein eingefrorener M2-Archivtest enthält einen Fehler in der Bereinigung seines temporären leeren Testordners. Die Archivlogik und das angenommene Archiv sind davon nicht betroffen. Die neue M3-Suite prüft denselben Archivvertrag ohne Änderung des alten Belegs. Ein misslungener Fixture-Aufräumversuch wird nicht als bestandener Gesamtlauf ausgegeben.

Der SPFx-Produktionsbau ist **nicht warnungsfrei**. Der [gebundene Originallog](../../.work/ap23m3-spfx-build-9L4Y0s/step-4.log) meldet 136 Lintwarnungen, keine Compilerfehler. 24 Warnungen betreffen neue V10-/Format-17-Dateien: 17 unbenutzte Bezeichner, drei fehlende explizite Rückgabetypen und vier explizite `any`-Typen. 112 betreffen ältere oder gemeinsam weitergeführte Module. Dazu gehört die nun über der konfigurierten Längengrenze liegende gemeinsame Appkomponente. Das bleibt technische Restpflege, kein Nullwarnungsnachweis. Der [gebundene Abschluss](../../outputs/ap23m3-2026-10-28/local-completion.json) verlangt erfolgreiche tatsächliche Tests, identische finale Quellen im isolierten Paketbau und unveränderte geschützte Eingänge. Teilprüfungen und abgebrochene Versuche ersetzen ihn nicht.

## Abnahme und nächster Haltepunkt

Die lokale Prüfansicht wird unter [127.0.0.1:8811/fristenrechner/](http://127.0.0.1:8811/fristenrechner/) angeboten, solange der Vorschauprozess läuft. Für einen späteren Neustart ist im Projekt `npm run preview:ap23m3` vorgesehen. Der Browsernachweis bindet dagegen die tatsächlich geprüften gebauten Bytes.

David hat AP23M3 am 28. Oktober 2026 ausdrücklich fachlich-technisch abgenommen und die Vorbereitung des gebündelten Releases beauftragt. Damit sind **26 Kantone im vereinbarten allgemeinen Umfang lokal integriert und abgenommen**, sechs operativ und 20 weitere nur lokal. Das ist weder eine umfassende Spezialrechtsabdeckung noch ein freigegebener Schweiz-Betrieb. Der nach dieser Erklärung entdeckte Sozial-UI-Befund bleibt ein nicht akzeptierter Releaseblocker. Die menschliche Abnahme wird in einem separaten Beleg dokumentiert, nicht durch Umschreiben technischer Freigabeflags erteilt.

Keine Quellenpromotion, Commits, GitHub-Änderungen, Uploads, Installation oder Betriebsänderungen an E/Q/P, Mirrors, AP5, AP21, Hosting oder Berechtigungen. MVP 0.9 bleibt operativ. Die nächste reguläre Auslieferung bleibt gemäss DEC-2026-034 gebündelt. David nimmt die menschlichen Rollen in Personalunion wahr. KI-Arbeitsteilung ersetzt seine Abnahme nicht.

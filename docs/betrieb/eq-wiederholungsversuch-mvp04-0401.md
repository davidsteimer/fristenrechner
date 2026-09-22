# MVP 0.4: Begrenzter E-/Q-Wiederholungsversuch mit 0.4.0.1

Stand: 22. September 2026, lokaler Abschluss des Publikationspakets nach fachlicher Q-Abnahme. **G01, F01–F09, N01–N04 und U01–U03 sind auf allen vier E-/Q-Instanzen bestanden, AP5 separat bestanden. Q-T-U04 ist im stabilen DE-/FR-Gegenlauf bestanden. SharePoint wurde anschliessend durch David Steimer positiv gegengeprüft. Daraus folgt keine neue automatische 768-Pixel-Messung, der historische Hostbefund wird aber nicht als aktueller Produktblocker geführt. Der tatsächliche Gasttest, die Q-Demofreigabe und Outlook T15/T16 bleiben gesondert offen. Der lokale Paketabschluss ist keine GitHub-, P- oder Betriebsfreigabe.**

## Fachliche Q-Abnahme vom 22. September 2026

David Steimer hat erklärt:

> Ich kann Q aus fachlicher Sicht abnehmen.

Die Erklärung wird als **fachliche Abnahme des konkret geprüften Q-Stands** dokumentiert: Anwendung `0.4.0`, SPFx-Paket `0.4.0.1` mit SHA-256 `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346` und Datenrelease `2026-09-22-mvp-04-approved.1`. Die vollständige technische Bindung steht unten. Damit ist der fachliche manuelle Abnahmeteil von R04-12 erfüllt.

Die fachliche Abnahme ist keine pauschale Freigabe ungeprüfter technischer Restpunkte. Die Outlook-Importtests T15/T16 sind weiterhin nicht ausgeführt und nicht ausdrücklich erlassen. Sie benötigen eine konkrete Freigabe zur Durchführung oder einen ausdrücklichen begründeten Verzicht. Der bedingt ausführbare Live-Negativtest und die optionale Governance-Nachprüfung bleiben als nicht ausgeführt ausgewiesen. Der tatsächliche Gastnachweis betrifft den Q-Gast-/Demobetrieb und ist kein M365-Zugriffstest für die statische öffentliche P-Ausprägung.

GitHub-Veröffentlichung, ein allfälliger neuer temporärer Schreibzugriff, P-Bereitstellung und betriebliche Freigaben bedürfen weiterhin ihrer gesonderten konkreten Autorisierung. Historische Zwischenstände und Prüfgrenzen im folgenden Ausführungsnachweis bleiben erhalten.

## Lokaler Abschluss des Publikationspakets

David Steimer hat anschliessend erklärt: «Sharepoint ist OK. Gastzugriff scheitert eher an KTBE-Problemen bei der Anmeldung. Schliesse das Publikationspaket ab.» Der positive SharePoint-Gegencheck wird als Benutzerbefund dokumentiert. Er ist keine neue instrumentierte 768-Pixel-Prüfung und verändert die alten Messwerte nicht. Aus dem historischen SharePoint-Hostbefund wird nach diesem Gegencheck kein aktueller Produktblocker oder notwendiger Produktfix abgeleitet.

Die vermutete KTBE-Anmeldeursache ist nicht nachgewiesen. Ebenso ist damit kein Appfehler nachgewiesen. Der reale Gasttest ist nicht bestanden und die externe Q-Demofreigabe bleibt offen. Diese Grenze und die offenen Outlook-Importtests verhindern den ausdrücklich beauftragten lokalen Paketabschluss nicht. Das Publikationspaket ist lokal mit diesen deklarierten Grenzen abgeschlossen, ohne Remote-Veröffentlichung, neue Rechte oder P-Bereitstellung.

## Erneute Autorisierung

Nach Abschluss der lokalen Korrektur und Vorlage des [Korrekturkandidaten `0.4.0.1`](spfx-korrekturkandidat-mvp04-0401.md) hat David Steimer erklärt:

> Bitte wiederhole den begrenzten E-/Q-Installationsversuch.

Diese neue Autorisierung gilt für genau den nachfolgend identifizierten Kandidaten. Sie ist keine rückwirkende Erweiterung der [ursprünglichen Freigabe für `0.4.0.0`](eq-installationsfreigabe-mvp04.md) und keine allgemeine Erlaubnis für weitere Builds oder veränderte Fachregeln.

Die Reihenfolge bleibt **E → Q → manuelle Abnahme durch David Steimer → GitHub → P**. Q dient während dieser Phase ausschliesslich der internen Releaseprüfung. Die begrenzte Ausnahme von der Aktivierungsvoraussetzung in [DEC-2026-016](../entscheidungen/DEC-2026-016-gruppenbasierter-q-demobetrieb.md) gilt für diesen konkreten Wiederholungsversuch mit unverändertem gruppenbasiertem Berechtigungsmodell. Ein externer Q-Demobetrieb mit diesem Kandidaten wird dadurch nicht freigegeben.

## Exakte Paket- und Datenbindung

| Bestandteil | Bindung |
| --- | --- |
| Anwendung / WebPart | Unverändert `0.4.0` |
| Solution- und Featureversion | `0.4.0.1` |
| Paketdatei | `fristenrechner-schweiz-0.4.0.1.sppkg` |
| Paketgrösse | 202'616 Bytes |
| Paket SHA-256 | `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346` |
| Hauptbundle | `fristenrechner-web-part_24d3a4dd2033d83cc8d9.js` |
| Datenrelease | Unverändert `2026-09-22-mvp-04-approved.1` |
| Datencommit | Unverändert `739876a0d11b550ea8cc702622ab22af321994a5` |
| Manifest SHA-256 | Unverändert `a240b01feb671dbe4374c1e097bc9143d66fd4878cd235b3b490a9c08afec72e` |
| Mirrorarchiv SHA-256 | Unverändert `3a194a29e25eb08a1c503306372671f7d9747951cdb5f31937556c3d41da0536` |
| Datenumfang | Manifest und neun Nutzartefakte, insgesamt zehn Dateien je Mirror. Vollständiger Katalog mit 479 Regeln, weiterhin nur zwölf operative CH-/BE-Feiertagsregeln |

Der [separate Artefaktnachweis](../../outputs/release-mvp04-spfx-0.4.0.1-2026-09-22/artifact-verification.json) und der [lokale Prüfnachweis](../../outputs/release-mvp04-spfx-0.4.0.1-2026-09-22/QA-MVP04-SPFX-0401.md) bleiben technische Referenzen ihres jeweiligen Erstellungsstands. Die dort dokumentierte lokale Vorbereitung wird nicht rückwirkend als erfolgte Tenantinstallation umgedeutet. Eine andere Paketprüfsumme erfordert eine neue konkrete Freigabe.

Die einzige Produktkorrektur betrifft die ES5-Prototypidentität von `HolidayCatalogError`. Schema, Fachregeln, Releasebytes, Solution-/Feature-/Component-Identitäten, Hostumfang und API-Berechtigungen bleiben unverändert. Die neue Regression führt sowohl emittierten ES5-Code als auch das tatsächliche Paketbundle aus. Bestandene lokale Tests ersetzen keine Zielumgebungsprüfung.

## Zielressourcen und begrenzte Eingriffe

Es gelten dieselben bereits eingegrenzten Ressourcen wie beim ersten Versuch:

- Die bestehende dedizierte E-Testsite und die direkte Rechnerregisterkarte der Entwicklungsumgebung.
- Die bestehende Q-Kommunikationssite und die direkte Rechnerregisterkarte des privaten Q-Teams mit zugehöriger Teamsite.
- Derselbe gemeinsame Tenant-App-Katalog und dieselbe Paketidentität. Der Katalogaustausch kann alle diese Consumer betreffen und stellt keine Versionsisolation zwischen E und Q her.
- Die vier bestehenden same-site Mirrors. Die vorbereiteten neuen Releaseordner werden vor Verwendung erneut vollständig byteweise und hinsichtlich unveränderter wirksamer Leserechte geprüft. Vorgängerordner bleiben erhalten.
- Aktualisierung der bestehenden MVP-Appinstanzen und ausdrückliche Umstellung jeder zugehörigen WebPart-/Registerkartenkonfiguration auf ihren neuen SharePoint-Mirror. Der noch unveröffentlichte neue GitHub-Datenpin ist kein Ersatz für einen fehlenden Mirror.

Die historische E-Registerkarte `V0.1 - Fristenrechner Schweiz` behält Namen, AP5-GitHub-Pin und leeren Mirrorpfad. Der gemeinsame Consumer darf mit dem Paketwechsel aktualisiert werden. Eine gesonderte AP5-Kompatibilitätsprüfung ist erforderlich, ihre Datenquelle wird nicht auf MVP 0.4 umgestellt.

Konkrete Ressourcenzuordnung, Konten, interne URLs, Berechtigungsdetails und Screenshots bleiben in privater Evidenz. Vor Mutation werden Ziele und tatsächlicher Ausgangsstand frisch aufgelöst, nicht aus historischen Namen oder alten Sicherungen abgeleitet.

## Vorprüfung, Prüfpflichten und Haltepunkte

1. Exakte Paketbytes, aktuelle Paket-/Appstände, alle betroffenen Instanzen, Provider-/Mirrorpfade, Konfigurationen und wirksamen Q-Zugriffe erneut aufnehmen. Den tatsächlichen Ausgangsstand und seine Rückfallfähigkeit sichern. Die nach dem ersten Versuch offen gebliebene E-Appinstanz-Versionsmetadatenlage bleibt bis zu einem eigenen Nachweis offen.
2. Bei unerwarteten weiteren Instanzen, ungeklärten externen Zugriffen, fehlender Wiederherstellbarkeit oder zusätzlichen Berechtigungsanforderungen anhalten. Insbesondere keine neue Assetordnerfreigabe, Mitgliedschaft oder Tenantberechtigung aus dieser Autorisierung ableiten.
3. Die vier vollständigen neuen Mirrors und ihre unveränderten Berechtigungen vor dem Katalogaustausch prüfen. Danach das exakt gebundene Paket aktivieren, E-Instanzen aktualisieren und E technisch prüfen. Fehler führen zum Haltepunkt und gegebenenfalls zum begrenzten Rückfall auf die unmittelbar vorher gesicherte Baseline, nicht zu einem Weiterrollen nach Q.
4. Nach bestandener E-Prüfung die Q-Instanzen auf denselben unveränderten Kandidaten und Datenrelease umstellen. Die [Zielumgebungsfälle T01–T19 und R04-01–R04-12](deployment-mvp-04.md#zielumgebungsprüfung) mit ihren tatsächlichen Freigabegrenzen dokumentieren. Ein Paketupdate allein belegt keine Datenumstellung.
5. Jede der vier SharePoint-/Teams-Instanzen muss einen eigenen vollständigen Erstabruf ohne vorhandenen validierten Aktivstand bestehen. Der browserseitige Aktivcache ist nicht pro Site oder Provider getrennt. Sichtbare neue Release-ID, konkreter Mirrorabruf, Bundle und fehlende Fallbackwarnung gemeinsam nachweisen. Vorhandener Cache oder MVP-0.3-Fallback zählt nicht als MVP-0.4-Erstabruf.
6. Die historische E-Ansicht separat mit unveränderter AP5-Konfiguration prüfen. Bestehende persönliche Defaults und Login bleiben bei gezielter Aktivcacheprüfung unangetastet.
7. Reale Gastprüfung nur mit einem bereits berechtigten Konto im zulässigen Zugriffsweg. Nicht verfügbare Gastprüfungen ausdrücklich offen ausweisen. Eigentümerprüfungen und historische Resultate ersetzen diesen Nachweis nicht.
8. Nach technischer Q-Prüfung auf Davids manuelle Prüfung und ausdrückliche Abnahme des konkreten App-/Datenstands warten. GitHub-Veröffentlichung und P-Bereitstellung benötigen danach weiterhin eigene konkrete Freigaben.

Die Freigabe umfasst keine echten Outlook-Kalenderimporte. Kalenderdateien können als technisches Produktresultat geprüft werden. Import, Prüfung und anschliessendes Löschen neuer Testtermine benötigen gesonderte Autorisierung.

## Unveränderte Ausschlüsse

Nicht freigegeben sind GitHub-Schreibzugriffe, Deploy-Keys, öffentliche Release-Anhänge, P-Uploads oder -Umschaltungen, neue externe Tester oder Gäste, Rechte-/Mitgliedschaftsänderungen, Änderungen an Conditional Access oder API-Berechtigungen, neue Sites/Teams/App-Identitäten, tenantweite Bereitstellung sowie das Löschen bisheriger Mirror- oder Releaseordner. Fachliche Freigaben und historische Nachweise werden nicht verändert.

## Historie und Ausführungsstatus

Der [erste E-Versuch mit `0.4.0.0`](eq-vorpruefung-mvp04.md) scheiterte an der Behandlung des gültigen Werts `parentId: null` im ES5-Bundle. Der Katalog- und Laufzeitrückfall auf MVP 0.3 wurde bestätigt. Die damaligen Eigentümer-Kurzprüfungen mit bestehendem Cache bleiben Rückfallnachweise, nicht bestandene MVP-0.4-Tests. Die dort dokumentierten Grenzen bei Appinstanz- und Seitenmetadaten bleiben erhalten.

### Nachgewiesener Zwischenstand des Wiederholungsversuchs

| Bereich | Beobachteter Stand | Abgrenzung |
| --- | --- | --- |
| Katalogpaket | `0.4.0.1` aktiviert. Frischer Download mit 202'616 Bytes stimmt mit der oben freigegebenen SHA-256 überein | Katalog-/Paketnachweis, getrennt von Funktions- und Erstabrufnachweisen |
| Berechtigungen und Daten | Assetberechtigungen stimmen mit der frischen Vorprüfung überein. Vier neue und vier Vorgänger-Mirrors mit insgesamt 76 Dateien erneut byteweise geprüft | Kein Ersatz für den unabhängigen Browser-Erstabruf jeder Instanz |
| E-SharePoint | Neues Hauptbundle, persistierter neuer Mirror, MVP-0.4-Release ohne Warnung, veröffentlichte Seite. Nachweislich leerer Aktivstore, danach alle zehn eigenen Mirrordateien HTTP 200 und Referenzrechnung erfolgreich. G01, F01–F09/N01–N04 und U01–U03 bestanden | U02-Wiederherstellung durch App-Erfolgsmeldung und Reload funktional belegt, kein erneuter Rohdatenreadback. Kein byteweiser Seiten-/Canvasnachweis und keine vollständige E-/Q-Freigabe |
| E-Teams | App aktualisiert, neuer Mirror persistiert sichtbar. F01–F09/N01–N04 und U01–U03 bestanden. Nach unabhängig leerem Aktivstore alle zehn eigenen Mirrordateien HTTP 200, 1'075'675 Ressourcenbytes, richtiger Release und Bundle, SharePoint-Mirrorquelle ohne Warnung. StPO-Referenzrechnung anschliessend neu bestanden | G01 vollständig bestanden. Transportnachweis und vorgängige Mirrorbyteprüfung, keine separate HAR-/Response-Rohinhaltsprüfung. U02-Wiederherstellung funktional und durch direkt erneut abwesenden Standardschlüssel belegt |
| Historische E-Ansicht | AP5-Erstabruf bestanden. Nach angeleiteter, benutzerbestätigter Nullstartfolge acht exakte historische Dateien HTTP 200 mit tatsächlichem Netzwerktransport, 58'945 Ressourcenbytes und 14'847 übertragene Bytes. AP5/GitHub, neues Bundle, keine Warnung und neue StPO-Referenzrechnung auf 28.09.2026. Danach Datum leer, kein Resultat oder Export | Letzter Nullstand nicht nochmals technisch direkt beobachtet, zwei vorangegangene Nullstände separat belegt. Kein HAR-/Response-Rohhashnachweis. Historische Quellenkonfiguration und Entwurf unverändert |
| Q-SharePoint | Appupdate und alleinige Mirrorumstellung samt Publikation bestätigt. Eigener Erstabruf aller zehn Dateien HTTP 200, 1'075'675 Ressourcenbytes und 1'106'830 übertragene Bytes. G01/F01–F09/N01–N04/U01–U03 bestanden. Neue 664-Byte-Kalenderdatei geprüft, Teststandards funktional entfernt und neutraler Reload bestätigt | Nullstart und ursprüngliche Defaults-Schlüsselabwesenheit benutzerbestätigt. U02 funktional, keine abschliessende direkte Rohzustandsprüfung. Kein neuer HAR-/Response-Rohhash- oder Canvasvergleich. Fachliche Q-Abnahme separat erteilt, keine Betriebs-/Publikationsfreigabe |
| Q-Teams | Appupdate und alleinige Mirrorumstellung bestätigt. Eigene zwei vollständige Zehn-Dateien-Abrufserien mit HTTP 200, richtiges Bundle/Release/Mirror und neue Referenzrechnung. G01/F01–F09/N01–N04/U01–U03 bestanden, neue 664-Byte-Kalenderdatei geprüft und neutral hinterlassen | Nullstart ausdrücklich benutzerbestätigt, kein eigener Null-Readback oder genaue zeitliche Serienzuordnung. U02-Baseline direkt, Wiederherstellung funktional. **U04 im stabilen Gegenlauf bestanden**, frühere Überlagerung nach stabilem Layout nicht reproduzierbar. Q-T-Darstellungsblocker aufgehoben. Fachliche Q-Abnahme separat erteilt, keine Betriebs-/Publikationsfreigabe |

### Bestandene Rechen- und Sperrfälle auf beiden E-Ansichten

Die folgenden Ergebnisse wurden sowohl auf E-SharePoint als auch in der direkten E-Teams-Registerkarte tatsächlich geprüft. Ein Ergebnis des einen Hosts wurde nicht als Nachweis des anderen übernommen.

| Fall | Eingabe | Beobachtetes Ergebnis |
| --- | --- | --- |
| StPO, Wochenende | Zustellung 16.09.2026, zehn Tage | 28.09.2026, Beginn 17.09., rechnerisches Ende 26.09., Endverschiebung |
| StPO, Bundesfeiertag | Zustellung 22.07.2027, zehn Tage | 02.08.2027, rechnerisches Ende 01.08. |
| ZPO ordentlich | Zustellung 19.03.2027, zehn Tage | 13.04.2027, 15 Stillstandstage, keine zusätzliche Endverschiebung |
| IV-Einwand | Zustellung 16.09.2026, gesetzliche 30 Tage | 16.10.2026, null übersprungene Stillstandstage im konkreten Zeitraum |
| IVöB-Zuschlagsbeschwerde | Publikation 06.09.2026, Neurecht, gesetzliche 20 Tage | 28.09.2026, rechnerisches Ende 26.09. |
| UVG-Nachfrist zur Beschwerdeverbesserung | Zustellung 18.12.2026, zehn Tage | 12.01.2027, erster gezählter Tag 03.01.2027, 15 übersprungene Stillstandstage |
| Ersatzkandidatur | Erster Wahlgang 29.03.2026 | 02.04.2026, Originaleingang bis 12.00 Uhr. Prüfstatus mit beiden Hinweisen zur Wahlanordnung und zum Querverweis, kein Kalenderexport |
| Kommunale Vorbereitungshandlung | Eröffnung 10.03.2026, Urnengang 29.03.2026 | 20.03.2026 mit Hinweis zur sofortigen Anfechtung |
| Drei Anknüpfungs-/Einleitungsfehler | Ungeklärte Feiertagsanknüpfung, Einleitung vor Neurecht beziehungsweise fehlendes Einleitungsdatum | Jeweils gesperrt, kein gültiges Fristresultat |
| Vier nicht freigegebene Sammelpfade | Laufendes Gerichtsverfahren bei IVG/AHVG/UVG sowie laufendes Vergabeverfahren | Jeweils ausdrückliche Sperre, Datumsfeld deaktiviert und kein Kalenderexport |

Auf beiden E-Ansichten sind zusätzlich die französische IVG-Berechnung mit 16.10.2026, statischer Stellenbeschriftung und festen Modellfeldern geprüft. Die Erlasswechsel behalten die statische Beschriftung. Die einzige unterstützte eidgenössische politische Verfahrenshandlung wird als Festwert angezeigt. Damit ist U01 auf beiden Ansichten bestanden. Das erwartete neue Hauptbundle ist zusätzlich direkt im DOM des tatsächlichen Teams-Frames nachgewiesen.

Am Ende dieses früheren Rechenprüfblocks wurden die synthetischen Eingaben entfernt und die Resultate zurückgesetzt. Beide E-Ansichten und die historische AP5-Ansicht standen damals auf StPO mit leerem Datum. Bis dahin waren persönliche Standards weder gespeichert noch zurückgesetzt worden. Die nachfolgenden Defaultsprüfungen und deren Bereinigung sind unten separat dokumentiert. Der historische Datenstand bleibt erhalten.

Beim vorherigen Unterbruch liess sich die native Bedienung nicht verlässlich ausführen. Der Bestätigungsdialog zum Leeren des Aktivstores erschien verzögert und blieb trotz Bestätigungsversuchen offen. Ein leerer Aktivstand war nicht nachgewiesen. Die versuchten Datumseingaben blieben leer. Deshalb wurden weder der StPO-Referenzfall noch weitere positive Berechnungen in dieser technischen Sitzung als bestanden gewertet. Die genaue Ursache des Bedienungsblockers ist nicht geklärt und wird nicht als Rechenfehler ausgewiesen.

Die anfängliche Eingabehürde wurde mit einem unterstützten UI-Eingabeweg überwunden. Die oben ausgewiesenen Berechnungen sind danach tatsächlich erfolgt. Die private Testanweisung wurde sprachlich präzisiert: Beim IV-Einwand-Referenzfall im September/Oktober werden null Stillstandstage übersprungen, obwohl das ATSG-Stillstandsprofil anwendbar ist. Es wurden keine Fachregeln geändert.

### Benutzerbefund bei Wiederaufnahme

David Steimer hat anschliessend gemeldet:

> Bereit. Manuelle Tests auf E zeigen keine Fehler.

Dieser positive Benutzerbefund wird zusätzlich zu den technischen Einzelbeobachtungen festgehalten. Die Mitteilung nennt weder einzelne Testfälle und Eingaben noch die Zuordnung zu beiden E-Ansichten oder deren Cachezustand. Deshalb werden dadurch keine offenen Matrixfälle pauschal auf «bestanden» gesetzt. Die Mitteilung ist insbesondere kein Nachweis eines cachefreien Erstabrufs und keine formelle Q-Abnahme.

### Neue technische Befunde nach bestätigtem Browserneustart

Nach dem vollständigen Edge-Neustart war eine neue Browserverbindung möglich. Die freigegebene E-SharePoint-Seite zeigt weiterhin MVP 0.4 aus ihrem SharePoint-Mirror ohne Warnung. Die DOM-basierte Browserbedienung funktioniert. Native DevTools-Menüs und Tastatureingaben bleiben jedoch inkonsistent beziehungsweise teilweise wirkungslos. In dieser Wiederaufnahme wurden weder Aktivcache noch persönliche Defaults gelöscht. Erstabruf- und Defaultsprüfung bleiben offen.

Die responsive Prüfung auf E-SharePoint wurde nun am IVG-Einwandpfad in Deutsch und Französisch bei **tatsächlichen 390, 768 und 1440 Pixeln** ausgeführt und visuell kontrolliert. Bei 390 Pixeln steht das Formular einspaltig, bei 768 und 1440 Pixeln zweispaltig. Eingabefelder, feste Modellanzeigen und die vier Schaltflächen passen in die Appbreite. Französische Schaltflächentexte brechen lesbar um. Das Formular selbst hat bei keiner Prüfbreite horizontalen Überlauf. Bei 390 und 1440 Pixeln entsprechen auch Dokument- und Scrollbreite jeweils der Prüfbreite. **Der Appteil ist bestanden.** Bei 768 Pixeln reicht jedoch ein Element der SharePoint-Hostkopfzeile über die Ansichtsbreite hinaus. Dieser Hostbefund bleibt offen, das vollständige No-overflow-Soll wird nicht als bestanden ausgewiesen. Die vorübergehende Viewport-Einstellung wurde zurückgesetzt.

Für den Kalenderdownload wurde der StPO-Fall mit Zustellung 16.09.2026 und zehn Tagen erneut auf 28.09.2026 berechnet. Die synthetische Referenz wurde im Eingabefeld bestätigt und der Download ausgelöst. Zunächst fehlte die Datei im Downloads-Bestand. Der Benutzer identifizierte den Hinweis anschliessend als normale Speicherentscheidung. Nach erneutem Export und bestätigtem Speichern wurden beide tatsächlich vorhandenen Kalenderdateien gelesen und gegen die Sollwerte geprüft. Beide sind 664 Bytes gross und enthalten den ganztägigen Termin am 28.09.2026 mit exklusivem Ende am 29.09.2026, Betreff `Fristablauf (QA-MVP04-EQ)`, Verfügbarkeit frei, Kategorie `Fristablauf` und Erinnerung `-PT112H`. Struktur, UTF-8, CRLF und Zeilenfaltung wurden geprüft. Die Exporte unterscheiden sich ausschliesslich in UID und Erstellungszeitstempel. Keine Sicherheitswarnung wurde umgangen und kein Outlook-Kalender verändert.

Die gesonderte Änderung des Datums auf 17.09.2026 entfernte sowohl die Berechnungsregion als auch die Kalenderexport-Schaltfläche aus dem DOM. Die Unterdrückung veralteter Ergebnisse ist damit für E-SharePoint bestanden. Zusammen mit der tatsächlichen Dateiprüfung ist **U03 auf E-SharePoint bestanden**. Nach Abschluss wurden Datum und Resultat erneut geleert. E-SharePoint wurde mit deutscher StPO-Auswahl, Bern, zehn Tagen und direkter Zustellung neutral hinterlassen. Persönliche Standards wurden weder gespeichert noch zurückgesetzt. Die beiden Downloads bleiben unverändert erhalten. E-Teams, Q und die historische AP5-Ansicht wurden in dieser Wiederaufnahme nicht geändert. Frühere Testresultate werden nicht als erneut ausgeführte Prüfungen ausgegeben.

### Nachfolgende Kalenderexportprüfung in der direkten E-Teams-Registerkarte

Anschliessend wurden derselbe StPO-Referenzfall und die Entfernung von Ergebnis und Exportoption nach Datumsänderung in der tatsächlichen E-Teams-Registerkarte geprüft. Diese zeigt weiterhin MVP 0.4 aus ihrem SharePoint-Mirror. Nach erneuter Berechnung und bestätigter Eingabe der synthetischen Referenz wurde dort ein neuer Kalenderexport ausgelöst. Die zunächst noch ausstehende Datei wurde danach tatsächlich im Downloads-Bestand festgestellt, gelesen und unabhängig gegengeprüft. Eine zusätzliche verbale Speicherbestätigung des Benutzers wird nicht vorausgesetzt oder behauptet.

Die neue Teams-Datei hat 664 Bytes und erfüllt sämtliche U03-Sollwerte. Ihr Inhalt ist mit dem E-SharePoint-Export identisch bis auf die erwarteten unterschiedlichen UID- und Erstellungszeitstempel. Zusammen mit dem bereits bestandenen Test gegen den Export eines veralteten Ergebnisses ist damit **U03 auch auf E-Teams bestanden**. Die Datei wurde nicht in Outlook importiert.

Danach wurden Datum und Resultat auch auf E-Teams wieder geleert. Leeres Datum sowie null Berechnungsregionen und Exportbuttons sind bestätigt. Beide E-Ansichten bleiben mit neutraler deutscher StPO-Auswahl für die Fortsetzung geöffnet. Persönliche Standards wurden nicht gespeichert oder zurückgesetzt, Konfigurationen nicht verändert. Der Dateinachweis ändert weder den offenen Erstabruf- und Defaultsstatus noch einen Q- oder Outlook-Prüfstatus.

### Technischer E-Abschluss und verbleibende Restpunkte vor Q

- **G01 ist auf E-SharePoint und E-Teams separat bestanden.** Auf beiden Ansichten folgte auf den jeweils nachweislich leeren Aktivstore der vollständige Abruf aller zehn Dateien aus dem eigenen Mirror. Jeweils 1'075'675 Ressourcenbytes einschliesslich Katalog, freigegebener Release, richtiges Bundle, SharePoint-Mirrorquelle und keine Warnung. Auf E-Teams wurden 1'090'591 übertragene Bytes beobachtet. Unmittelbar anschliessend ergab die neu ausgeführte StPO-Rechnung 16.09.2026 plus zehn Tage den 28.09.2026, mit Beginn 17.09., Rohende 26.09., null Stillstandstagen und Endverschiebung. Der separate historische AP5-Erstabruf ist inzwischen ebenfalls bestanden, mit der unten genannten Nachweisgrenze beim letzten Nullstand.
- **U02 ist auf beiden E-Ansichten bestanden.** Auf E-SharePoint wurden zum bereits bestandenen IVG-Teil IVöB und ausdrücklich leeres «Bitte wählen» gespeichert und nach Reload geprüft. Auf E-Teams wurden IVG, IVöB und leeres «Bitte wählen» eigenständig gespeichert und über echte Registerkarten-Neuladungen geprüft. Stabile Auswahl und gesetzliche Dauer bleiben erhalten, konkrete Falldaten, Referenz und altes Resultat nicht. Auf beiden Ansichten wurden die Teststandards mit App-Erfolgsmeldung und anschliessendem leeren StPO-Grundzustand funktional entfernt. Auf E-SharePoint wurde die exakte Schlüsselabwesenheit in diesem Prüfblock nicht erneut roh ausgelesen. Auf E-Teams ist sie nach Abschluss zusätzlich direkt bestätigt.
- Die kontrollierte Live-Negativprüfung bleibt wegen der unzuverlässigen nativen Netzwerkbedienung offen. Es wurde keine Request-Blocking-Regel gesetzt und keine Mirrordatei verändert. Der Prüfplan verlangt diesen Livefall nur bei verfügbarem autorisiertem UI-Weg. Lokale Paketregressionen sind kein Live-Nachweis, der bedingt ausführbare Fall wird nicht nachträglich zu einem absoluten Erstabruf-Gate erklärt.
- U03 ist auf beiden E-Ansichten mit tatsächlich gespeicherten Dateien, Inhaltsprüfung und Unterdrückung veralteter Ergebnisse bestanden. Es bleibt kein offener E-Kalenderexportnachweis. Die frühere Werkzeugbeschränkung für die Downloadoberfläche wurde nicht umgangen. Dies ersetzt weder den späteren Q-Exportnachweis noch einen gesondert freizugebenden Outlook-Importtest.
- U04 ist auf E-SharePoint am geprüften IVG-Pfad bei allen drei tatsächlichen Prüfbreiten in DE/FR im Appteil bestanden. Der Überlauf der SharePoint-Hostkopfzeile bei 768 Pixeln bleibt als Restpunkt offen. Eine Beeinträchtigung der geprüften Appbedienung wurde nicht festgestellt. Nach Abschluss der zwingenden übrigen E-Gates wurde dieser E-Befund für die interne Q-Prüfung als nicht blockierend bewertet. Das ist kein vollständiger No-overflow-Pass und keine neue Produkt- oder Betriebsfreigabe. Die gesamte Hostnavigation wurde nicht abschliessend geprüft. Der Q-Teams-Gegenlauf ist nachfolgend separat dokumentiert und ändert diesen E-SP-Restpunkt nicht.
- Nach gesonderter ausdrücklicher Zustimmung zu den technisch originweiten SharePoint- und Teams-Zugriffsmöglichkeiten funktionieren die DOM-Zugriffe auf beide bezeichneten E-Ansichten. Der sachliche E-Auftrag und M365-Berechtigungen bleiben unverändert. Ein vollständiger Teams-Reload führte zunächst in eine allgemeine Chatansicht. Diese wurde nicht fachlich untersucht oder verändert, sondern unmittelbar zur bezeichneten E-Registerkarte verlassen. Keine Zugriffssperren wurden umgangen.
- Die native E-Teams-Cachebedienung erforderte manuelle Unterstützung. David Steimer entfernte gezielt den Aktivzeiger, die frische technische Kontrolle bestätigte «Total entries: 0». Danach konnten die Netzwerkaufzeichnung und der oben ausgewiesene eigene Erstabruf abgeschlossen werden. Zwischen Leerung und E-Teams-Abruf wurde keine andere Rechneransicht geladen. Die HTTP-Cache- und Logoptionen blieben unverändert. Es wurde keine allgemeine Browserdatenlöschung vorgenommen. Der Nachweis kombiniert tatsächlichen Netzwerktransport mit der vorgängigen Mirrorbyteprüfung und behauptet keine neue HAR- oder Response-Rohinhaltsprüfung.
- Die E-Teams-Standardsprüfung begann mit direkt bestätigter Schlüsselabwesenheit. IVG-Einwand mit 30 Tagen und Zustellung 16.09.2026 ergab 16.10.2026. IVöB-Zuschlagsbeschwerde mit 20 Tagen, Einleitung 01.02.2026 und amtlicher Publikation 06.09.2026 ergab 28.09.2026. Nach Speicherung und jeweils **«Registerkarte neu laden»** blieben die stabilen Auswahlen erhalten, Datumsfelder, Feiertagsanknüpfung beziehungsweise Eröffnungskanal und Resultate nicht. Auch ausdrücklich gespeichertes leeres «Bitte wählen» blieb erhalten. Nach **«Standards zurücksetzen»** und der Meldung **«Lokale Standards wurden entfernt.»** zeigte die erneut geladene Registerkarte Deutsch, Bern, StPO, zehn Tage, direkte Zustellung, leeres Datum und kein Resultat oder Referenzfeld. Die abschliessende native Storage-Kontrolle mit exaktem Filter und Refresh bestätigte erneut keinen gespeicherten Standardschlüssel. Der Ausgangszustand ist damit vollständig wiederhergestellt.
- **AP5-FRESH-FINAL ist bestanden.** Die beiden vorangegangenen technisch bestätigten Nullstände hatten noch keine vollständige Netzwerkbeweiskette ergeben. Auf die erneute genaue Anleitung zur Aktivstoreleerung, Netzwerkansicht und zum nativen Reload bestätigte David Steimer «AP5 geladen». Dieser letzte Nullstand wurde nicht erneut direkt technisch abgelesen. Die anschliessend frisch gelesene Netzwerkansicht zeigte 8 von 456 Requests, alle acht exakten AP5-Dateien am unveränderten Pin `33b4c2891acf5966974cc94b616aa3972c067767` als Fetch mit HTTP 200 und tatsächlichem Netzwerktransport. Ressourcen total 58'945 Bytes, übertragen 14'847 Bytes. Der sichtbare Filter `026-08-29-ap5-approved.1` war ein passender Teilstring, die vollständigen URLs waren korrekt. Das neue Hauptbundle war im DOM und als Initiator aller acht Requests nachgewiesen. AP5-Release, GitHub-Quelle und keine Warnung waren frisch bestätigt. Die neue StPO-Rechnung 16.09.2026 plus zehn Tage ergab 28.09.2026, Beginn 17.09., Rohende 26.09., null Stillstandstage und Endverschiebung. Danach wurden Datum und Resultat entfernt, leeres Datum sowie null Resultate und Exportoptionen frisch bestätigt. Historischer Entwurf und Quellenkonfiguration blieben unverändert. Kein neuer HAR-/Response-Rohhashnachweis. HTTP-Cache- und Logoptionen sind auf ihrem Ausgangswert, kein Request Blocking gesetzt.

### Q-SharePoint: technische Pflichtfälle bestanden

Die ausdrückliche Benutzerbestätigung für die bezeichneten Q-Ressourcen hat den früheren E-begrenzten Zugriffs-Haltepunkt abgelöst. Vor dem Eingriff wurden Paketbytes frisch bestätigt sowie Q-Dateimetadaten und dargestellte Berechtigungen mit der gesicherten Basis abgeglichen. Danach wurden Q-SP-Appupdate, ausschliessliche Mirrorpfadänderung und Seitenpublikation bestätigt. Der bestehende Entwurf wurde nicht verworfen. Die vorgängige Versionsverlaufsanzeige «Keine Änderungen gefunden» ist kein Canvas-/Bytevergleich.

Der zunächst fehlende Erstabrufnachweis ist nun abgeschlossen. Auf die konkrete Nullstand-/Netzwerk-/Reload-Anleitung bestätigte der Benutzer «Q-SP geladen». Dieser Nullstand wurde nicht nochmals direkt technisch abgelesen. Die frische Q-SP-Netzwerkansicht zeigte alle zehn eigenen Mirrordateien als Fetch mit HTTP 200 und tatsächlichem Transport, insgesamt 1'075'675 Ressourcenbytes und 1'106'830 übertragene Bytes. Richtiges Bundle, neuer Release, Mirrorquelle ohne Fallbackwarnung und neu ausgeführte StPO-Referenzrechnung sind bestätigt. **G01, sämtliche Rechen-/Sperrfälle F01–F09/N01–N04 sowie U01 wurden eigenständig auf Q-SP bestanden**, nicht aus E übernommen. Der französische IVG-Fall ergibt 16.10.2026. Feste Modellfelder und die statische Stellenbeschriftung beim Erlasswechsel sind geprüft.

**U03 ist ebenfalls bestanden.** Nach konkreter Speicherbestätigung lag eine neue Kalenderdatei mit 664 Bytes vor. Vollständiger Inhalt, elf erforderliche Vertragsmarker und CRLF-Zeilenenden wurden geprüft. Ganztägiger Termin 28.09.2026 bis exklusiv 29.09.2026, synthetischer QA-Betreff, Verfügbarkeit frei, Kategorie Fristablauf und Erinnerung -PT112H stimmen. Nach Datumsänderung auf 17.09.2026 verschwanden Resultat und Exportoption. Nach erneuter Berechnung und Reset ist Q-SP frisch neutral bestätigt: Deutsch, Bern, StPO, zehn Tage, direkte Zustellung, leeres Datum, null Resultate und Exportbuttons. Kein Outlook-Import.

**U02 ist inzwischen funktional bestanden.** Der Benutzer bestätigte auf die exakte Schlüsselfrage den Ausgangszustand mit null Einträgen. IVG-Einwand und IVöB-Zuschlag wurden mit synthetischen Falldaten und QA-Referenz als Standard gespeichert und jeweils durch echtes Neuladen geprüft. Stabile Auswahl und gesetzliche Dauer blieben erhalten, konkrete Daten, Anknüpfung beziehungsweise Eröffnungskanal, Resultat und Referenz nicht. Auch ausdrücklich gespeichertes «Bitte wählen» blieb erhalten. Nach «Standards zurücksetzen» und «Lokale Standards wurden entfernt.» bestätigte der Reload wieder Deutsch, Bern, StPO, zehn Tage, direkte Zustellung, leeres Datum und kein Resultat oder Referenzfeld. Der letzte native Storage-Zugriff belegte nicht erneut den exakten Schlüssel. Deshalb wird die Wiederherstellung funktional, nicht als abschliessend roh verifiziert ausgewiesen.

Damit sind die vorgesehenen Q-SP-Pflichtfälle mit den genannten Nachweisgrenzen bestanden. **Q-Teams wurde anschliessend aktualisiert und auf seinen eigenen neuen Mirror umgestellt.** Dabei blieb es bei der bestehenden direkten Registerkarte. Ausschliesslich der Mirrorpfad wurde geändert, Quelle, nicht aktive GitHub-Adresse und mobile Einstellung blieben erhalten. Nach gezieltem Registerkarten-Reload sind der neue Release, SharePoint-Mirror, richtiges Bundle und Warnungsfreiheit frisch bestätigt.

### Q-Teams: Funktionstests und aktueller Darstellungsgegenlauf bestanden

**G01 ist inzwischen bestanden.** Nach zunächst unklarer Fensterzuordnung bestätigte der Benutzer ausdrücklich die Entfernung des Aktivstands im Teams-Tab und das anschliessende Neuladen derselben Registerkarte. Die anfänglich sichtbaren Q-SP-Requests wurden nicht Q-T zugerechnet. Im tatsächlichen Teams-Kontext waren zwei vollständige eigene Abrufserien mit je zehn Dateien, jeweils Fetch/HTTP 200 und tatsächlichem Transport sichtbar. Zusammen 2'151'350 Ressourcenbytes und 2'174'713 übertragene Bytes. Richtiges Bundle, Release und Mirrorquelle ohne Warnung sowie neuer F01 sind bestätigt. Kein eigener Null-Readback, keine genaue zeitliche Zuordnung beider Serien zu einzelnen Nullstarts und keine neuen Response-Rohhashes werden behauptet.

**F01–F09, N01–N04 und U01–U03 sind eigenständig auf Q-T bestanden.** Die Rechen- und Sperrfälle wurden nicht aus anderen Ansichten übernommen. U01 umfasst die französische IVG-Rechnung auf 16.10.2026, feste Modellfelder und statische Stellenbeschriftung beim Erlasswechsel. U02 begann mit direkt belegter Schlüsselabwesenheit. Nach IVG-/IVöB- und ausdrücklich leerer Standardspeicherung blieben über echte Registerkarten-Reloads nur stabile Auswahlen erhalten, keine Falldaten, Referenz oder alten Resultate. Rücksetzung und neutraler Reload sind funktional bestätigt, ohne abschliessenden direkten Schlüsselreadback.

**U03 ist mit einer neuen tatsächlichen Q-T-Kalenderdatei bestanden.** Nach Speicherbestätigung 664 Bytes, vollständiger Inhalt, elf erforderliche Marker, CRLF und maximal 75 Bytes je physischer Zeile geprüft. Ganztägig 28.09.2026 bis exklusiv 29.09.2026, synthetischer QA-Betreff, Verfügbarkeit frei, Kategorie Fristablauf und Erinnerung -PT112H stimmen. Datumsänderung auf 17.09.2026 und Reset entfernen Ergebnis und Exportoption. Danach Datum leer, StPO mit zehn Tagen, null Resultate und Exportbuttons. Kein Outlook-Import.

**U04-Erstlauf, historisch negativ:** Die ersten DE-/FR-Prüfungen bei 390/768/1440 Pixeln zeigten keinen eigenen Formularüberlauf, bei 390 aber verdeckte die Teams-Navigation Rechnertext, auch nach einem Erweiterungsversuch. Dieser konkrete damalige Negativbefund bleibt erhalten. Seine Ursache ist nicht abschliessend bewiesen und wird nicht rückwirkend als gesichertes Werkzeugartefakt bezeichnet.

**Aktueller U04-Q-T-Gegenlauf bestanden:** Nach Viewport-Reset und erneuter ausdrücklicher Auswahl der Rechnerregisterkarte waren bei 390 Pixeln Host und Frame korrekt ausgerichtet, die Teams-Navigation automatisch verborgen und DE-StPO sowie DE-/FR-IVG mit drei festen Feldern und allen vier Schaltflächen vollständig sichtbar. Der wiederholte Wechsel 768→390 zeigte zunächst einen tatsächlichen Übergangszustand mit Navigation und noch nicht sichtbarem Frame. Nach Warten auf den sichtbaren Frame war die 390-Pixel-Ansicht erneut vollständig korrekt. Dieser Übergang ist belegt, aber keine bewiesene Erklärung des ersten Negativlaufs. Nach stabilem Layout ist die frühere Überlagerung nicht reproduzierbar. Der Q-T-Darstellungsblocker ist aufgehoben, aus diesem Befund ist keine weitere Fehlerbehebung erforderlich. Keine Code-/Konfigurationsänderung oder Einschränkung des mobilen Prüfumfangs. Abschliessend Deutsch, Bern, StPO, zehn Tage, direkte Zustellung, leeres Datum und null Resultate wiederhergestellt, Viewport zurückgesetzt. Im Gegenlauf keine Defaults gespeichert oder gelöscht.

Der abschliessende rein lesende Rechteabgleich vom 22.09.2026, 20:06:20 UTC, zeigt die vier Q-Releaseordner-ACLs und die Assetordner-ACL semantisch unverändert, jeweils vier Einträge und keine Folgelinks. Die zwei direkten Q-Kanalmitglieder haben unveränderte Identitäten und Rollen. Der Vergleich zur frischen Q-Vorprüfung wurde unabhängig lokal nachgerechnet. **Der Rechte-Teil von R04-10 ist erfüllt, der tatsächliche Gasttest bleibt offen.** Direkte Mitgliedschaft ersetzt weder eine vollständige Verzeichnisgruppeninventur noch eine Gast-Anmelde-/Bedienungsprüfung. T19 wurde nicht erneut ausgeführt. Dieser laut Testplan bei Bedarf vorgesehene Governance-Nachweis liegt ausserhalb Runtime und bleibt als Nachweisgrenze offen, nicht als zusätzlicher Runtime-Blocker.

Die Q-T-Funktionstests und der aktuelle Q-T-U04-Gegenlauf sind bestanden. **Der frühere Q-T-Darstellungsblocker besteht nicht mehr. Die fachliche Q-Abnahme und der anschliessende positive SharePoint-Benutzergegencheck sind oben dokumentiert.** Der alte E-SP-768-Messbefund bleibt historisch erhalten, ohne neue Messung oder pauschalen technischen Gesamt-U04-Pass. Er wird nicht als aktueller Produktblocker geführt. Tatsächlicher Gasttest und Q-Demofreigabe, Outlook T15/T16 sowie bedingte Prüfungen bleiben mit den oben genannten Grenzen offen. Der lokale Paketabschluss ist keine GitHub-, P- oder Betriebsfreigabe. Keine Rechte- oder Mitgliedschaftsänderung.

David Steimer trägt die fachliche und betriebliche Freigabeverantwortung. Codex unterstützt Durchführung und Dokumentation als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

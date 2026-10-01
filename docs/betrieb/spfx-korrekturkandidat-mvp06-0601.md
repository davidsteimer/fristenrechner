# MVP 0.6 SPFx Korrekturkandidat 0.6.0.1

Stand: 1. Oktober 2026. David Steimer hat nach der lokalen Korrekturprüfung auch den konkreten Paketwechsel, die vier bestehenden E-/Q-Appupdates und die begrenzten Nachtests ausdrücklich freigegeben. **0.6.0.1 ist im gemeinsamen Katalog bereitgestellt und auf allen vier bestehenden E-/Q-Sites aktualisiert. Die begrenzten Nachtests auf E-/Q-SharePoint, beiden tatsächlichen Teamsregisterkarten und der historischen AP5-Ansicht sind bestanden. MVP06-UI-01 ist damit behoben. Manuelle Q-Abnahme und Gastanmeldung sind inzwischen durch David bestätigt, R06-12 ist durch begründete Outlook-Wiederverwendung abgeschlossen. Keine GitHub-Publikation und keine P-Bereitstellung.** Die unveränderten lokalen Bau- und Prüfnachweise folgen unten, der Live-Vollzug ist am Dokumentende gesondert ausgewiesen.

## Anlass und begrenzte Korrektur

Der [E-/Q-Prüfbericht](eq-installation-mvp06.md) dokumentiert MVP06-UI-01. Bei schmalen französischen SharePoint-Ansichten wird im Feld «Domicile / siège de la partie et de sa représentation» sowohl der gewählte Text als auch der Text der geöffneten Auswahl mit «…» verkürzt. Dieser Befund ist auf E-SharePoint und Q-SharePoint vorhanden. Ein Rechenfehler wurde dabei nicht festgestellt.

Die Ursache liegt in zwei Darstellungsebenen: Die Anwendung erzwingt grundsätzlich einzeilige Dropdown-Titel. Zusätzlich begrenzt Fluent UI die Optionstexte und die Höhe der Listeneinträge. Die offene Liste liegt ausserhalb des Formularcontainers. Eine Änderung nur am Feldtitel würde deshalb nicht genügen.

Die Korrektur betrifft ausschliesslich die Feiertagsanknüpfung von Partei und Vertretung. Das Feld erhält einen mehrzeiligen Titel mit bedarfsgerechter Höhe. Instanzbezogene Fluent-UI-Styles ermöglichen denselben Umbruch in ausgewählten, nicht ausgewählten und deaktivierten Listeneinträgen, auch im mobilen Auswahlpanel. Das logisch gleiche Feld wird in beiden vorhandenen Renderpfaden gleich behandelt.

Unverändert bleiben Auswahltexte und Werte, Ereignisbehandlung, Pflichtfeld- und Fehlerzuordnung, Berechnung, Speicherung, Rechenspur und Kalenderexport. Es gibt keine neuen Renderer, Bibliotheken oder Berechtigungen. Der zweispaltige Aufbau und der bestehende Wechsel auf eine Spalte unter 640 Pixeln bleiben erhalten. Die Korrektur ändert nicht pauschal sämtliche Dropdowns.

## Versionen und unveränderte Daten

| Bestandteil | Kandidatenstand |
| --- | --- |
| Anwendungs- und WebPart-Version | Unverändert `0.6.0` |
| Solution- und Featureversion | `0.6.0.1` |
| Solution-, Feature- und Component-ID | Unverändert |
| Datenrelease | Unverändert `2026-10-01-mvp-06-approved.1` |
| Unveränderlicher lokaler Datencommit | `19b37336974f3ba7c72333763e1272425239b8cd` |
| Manifest SHA-256 | `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |
| Datenformate und fachlicher Umfang | Unverändert, Manifest / Mindestconsumer 6.0.0, Sozialverfahrenskatalog 2.0.0, 44 nationale Regeln und 50 Berner Anbindungen |
| E-/Q-Mirrors | Keine Änderungen und kein erneuter Upload nötig |

Der Datencommit ist weiterhin nur lokal nachgewiesen. Ein öffentlich erreichbarer GitHub-Datenpin wird damit nicht behauptet. Die bestehenden E-/Q-Instanzen bleiben auf ihren SharePoint-Mirrors.

## Lokaler Prüfnachweis

Die unabhängige Gegenprüfung gegen die eingefrorenen MVP-0.6-Buildinputs ergibt keinen blockierenden Befund. Typecheck und 2049 Kern-/UI-Tests sind bestanden, einschliesslich drei neuer gezielter Struktur-/Styletests. Die Eingänge des protokollierten Prüflaufs sind vor und nach der Ausführung bytegleich.

Die lokale Browserprüfung verwendet die tatsächlich gebaute gemeinsame Oberfläche mit dem unveränderten freigegebenen Datenrelease. Sie ist kein SharePoint- oder Teams-Nachtest des neuen Pakets.

| Prüfung | Beobachtung |
| --- | --- |
| Ausgangsfehler vor dem UI-Neubau | Bei 770 Pixeln Vorschau-Breite: tatsächlicher Textüberlauf und sichtbare Verkürzung reproduziert |
| Gleiche enge Feldbreite | Bei 296 Pixeln Feldbreite sind beide langen französischen Optionen vollständig lesbar. Textbreite und Scrollbreite stimmen überein, ausgewählte und nicht ausgewählte Einträge wachsen auf zwei Zeilen |
| 848 Pixel Vorschau-Breite | Gewählter Wert und offene Liste vollständig lesbar, zwei Spalten erhalten |
| Mobile Ansicht bei 390 Pixeln | Deutsches und französisches Fluent-Auswahlpanel vollständig lesbar, einschliesslich des Eintrags für andere oder ungeklärte Konstellationen |
| Desktop bei 1280 Pixeln | Deutsche und französische Ansicht mit geschlossenem Feld und offener Liste unauffällig |
| Tastatur | Öffnen mit Enter, Wechsel mit Pfeiltaste sowie Bestätigen und Schliessen mit Enter geprüft |
| Berechnungsstichprobe | ÜLG-Einsprache, Zustellung 16.09.2026, 30 Tage, Kanton Bern: 16.10.2026 in Deutsch und Französisch. Beide zulässigen Partei-/Vertretungsoptionen verwendet |
| Weiterer aktueller und historischer Feldpfad | Aktueller IVG-Verwaltungspfad sowie historischer AP17C-Prüfkandidat visuell geprüft. Beim historischen Pfad ersetzten tatsächliche AX-Auswahl und Screenshots zwei fehlgeschlagene DOM-Messversuche. Keine exakten historischen DOM-Masse behauptet |

Die historischen AP17C-Daten werden durch diese reine Darstellungsprobe weder verändert noch neu freigegeben. Die lokale Vorschau wurde nach der Prüfung auf Deutsch und ohne eingegebenes Datum oder Ergebnis neu geladen. Temporäre Grössenüberschreibungen wurden zurückgenommen. Es wurden keine Standards gespeichert und keine Kalenderdateien exportiert oder importiert.

Private Belege sind getrennt gehalten. Der unabhängige Prüfbericht hat SHA-256 `622f332a660459cad563b9999f3880c68867502cca5a48fe8b36f65ab7318477`, die Reviewnotiz `55c7f14d1135f8203ad7616ab6e770c1a1f43fad47041cc17713d466c3dae72e`, der protokollierte lokale Browsernachweis `8b08da7f9580ede5293344766260337d7581b928067abe4281113ed1418496c0`.

## Paketbau und Artefaktbindung

Der separate Builder `scripts/build-mvp06-spfx-0601.mjs` verwendet die bestehende gepinnte Node-/SPFx-Toolchain und eine isolierte Arbeitskopie. Er bindet die elf unveränderten Laufzeitdateien an Manifest und Datencommit. Bisheriges Paket, Mirror- und Webarchiv sowie ursprüngliche Releasebelege werden vor und nach dem Bau geprüft und nicht überschrieben. Ein bereits vorhandener Kandidatenordner ist kein Überschreibziel.

Der erste isolierte Lauf wurde wegen eines Dateisuite-Zeitlimits bei einer bestehenden Kalendertestsuite angehalten. Die Suite bestand danach separat mit demselben 30-Sekunden-Limit alle 23 Tests. Für den vollständig bestandenen Wiederholungsbau wurde ausschliesslich die Parallelität des Node-Testrunners auf zwei Dateien begrenzt. Kein Test wurde entfernt und kein Zeitlimit erhöht. Der erste Abbruch bleibt mit seinem Rohlog dokumentiert.

| Gebundener Kandidat | Wert |
| --- | --- |
| Datei | [fristenrechner-schweiz-0.6.0.1.sppkg](../../outputs/release-mvp06-spfx-0.6.0.1-2026-10-01/artifacts/fristenrechner-schweiz-0.6.0.1.sppkg) |
| Grösse | 228’122 Bytes |
| Paket SHA-256 | `60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587` |
| Hauptbundle | `fristenrechner-web-part_3e2badf5b19c911b0ff4.js`, 861’186 Bytes |
| Bundle SHA-256 | `d9411005c17188d344a0f5028bea0bb503d8944ae8070b13747ceef67459ffdc` |
| [Artefakt- und Baunachweis](../../outputs/release-mvp06-spfx-0.6.0.1-2026-10-01/artifact-verification.json) SHA-256 | `66f590d1b8942b9bddb76646f0ed0f74c5bad395b58b6ac28fbf006d19a20143` |
| Rückfallpaket | Unverändertes `0.6.0.0`, SHA-256 `85dd933ba08c9810e9f0cf4954b9cbc0d12ef4b8ad972f525d9a929023bbc681` |

Alle 145 SPFx-Quell-/Providertests und 68 Prüfungen des emittierten ES5-Codes sowie des tatsächlichen Paketinhalts sind bestanden. Produktionskompilierung, CSS-Audit und Paketierung sind erfolgreich. Die neue Feldbindung, Titelregel und sämtliche vier Optionshöhenregeln sind im fertigen Paket nachgewiesen. Das unveränderte alte Paket wird vom spezifischen neuen UI-Audit erwartungsgemäss zurückgewiesen. Zwei bereits bekannte `no-new-null`-Lintwarnungen bleiben bestehen. Der Heft-/Jest-Schritt selbst enthält keine zusätzlichen Jest-Suiten und wird nicht als weitere Testsuite gezählt.

Die abgelegte Paketkopie ist frisch rückgelesen und gehasht. Alle 263 Dateien des ursprünglichen MVP-0.6-Releaseordners sind unverändert. Die elf Laufzeitdateien stimmen weiterhin byteweise mit dem freigegebenen Manifest und Datencommit überein. Ein späterer SPFx-Neubau kann andere Bytes erzeugen und ist nicht von einer Freigabe dieser konkreten Datei erfasst.

Der Korrekturbuilder bindet für diesen lokalen Lauf auch den privaten Erstversuch. Öffentliche Reproduzierbarkeit ist damit noch nicht abschliessend nachgewiesen. Diese Nachweisgrenze ist in der ohnehin erforderlichen Publikationsvorprüfung P06-01 gesondert zu behandeln, ohne private Rohbelege pauschal zu veröffentlichen.

Es entsteht in diesem Auftrag nur der neue SPFx-Kandidat. Das ursprüngliche Webarchiv bleibt historisch erhalten und enthält diese gemeinsame UI-Korrektur noch nicht. Vor einer späteren P-Bereitstellung muss ein passendes neues Webartefakt gebaut und geprüft werden. Die Mirrors müssen wegen dieser reinen UI-Korrektur nicht neu gepackt werden.

## Freigegebener Vollzug und bestandene Nachtests

Genau die oben gebundene Datei, Paketversion und SHA-256 sind inzwischen ausdrücklich für den Austausch im bestehenden gemeinsamen Tenant-App-Katalog, die vier bestehenden Site-Appupdates und die begrenzten Nachtests freigegeben. Live-Ausgangsstand 0.6.0.0 und Rückfallpaket wurden vor dem Austausch frisch geprüft. Es gibt keine automatische Installation auf zusätzlichen Sites und keine Änderung von Mirrorpfaden, Daten, Gästen oder Berechtigungen.

Die bestehende Katalogdatei ist als neue Version ersetzt und bereitgestellt. Der frische Rohdownload stimmt mit der oben gebundenen Paketprüfsumme überein. Katalogversion 0.6.0.1, aktiviert, gültig und bereitgestellt jeweils Ja, zu allen Sites hinzugefügt Nein. Auch das frisch heruntergeladene Hauptbundle ist bytegleich zum tatsächlichen Paketinhalt. Die effektiven Sharingberechtigungen der Paketdatei und ihres Assetordners sind gegenüber den gebundenen Vorbelegen unverändert.

Die automatische Zugriffsprüfung blockierte zwischenzeitlich den App-Verwaltungsweg auf den übrigen Sites. Die betroffenen Schritte wurden gestoppt. David präzisierte den Umfang ausdrücklich auf Websiteinhalte und Appdetails der bestehenden Rechner-App auf den vier benannten Sites. Nach dieser Präzisierung und unter den bereits bestehenden technischen Domainfreigaben konnten die restlichen Updates ausgeführt werden. Die früheren Blockbelege bleiben als Verlauf erhalten. Es erfolgte keine Erweiterung von M365-Berechtigungen.

Alle vier bestehenden Site-Apps wurden über ihr vorhandenes Updateangebot aktualisiert. Die anschliessend frisch geöffneten Appdetails zeigen Version 0.6.0.1, die bereits vorhandene App und kein weiteres Updateangebot. Dies ist ein UI-Vollzugsnachweis, keine Behauptung eines ausgelesenen internen AppInstance-API-Versionswerts.

| Ziel / Nachtest | Live-Ergebnis |
| --- | --- |
| E-SharePoint | Neues Hauptbundle im geladenen Dokument, unveränderter MVP-0.6-Mirror. Deutsche und französische Auswahltexte bei 848 und 1280 Pixeln geschlossen und geöffnet vollständig lesbar. Tastaturwechsel und Berechnung bestanden |
| Q-SharePoint | Gleiche Prüfarten bestanden. Bei schmaler französischer Liste Textbreite und Scrollbreite jeweils 276 Pixel, lange Texte zweizeilig ohne Abschneiden. Tastaturwechsel zwischen beiden zulässigen Optionen und Bestätigung mit Enter bestanden |
| E-Teams | Bestehende tatsächliche Registerkarte gezielt neu geladen. Neues Hauptbundle und unveränderter Mirrorstand nachgewiesen. Deutsch und Französisch, Berechnung sowie schmales Auswahlpanel und breite französische Liste bestanden |
| Q-Teams | Bestehende tatsächliche Registerkarte gezielt neu geladen. Neues Hauptbundle und unveränderter Mirrorstand nachgewiesen. Deutsch und Französisch, Berechnung sowie schmales Auswahlpanel und breite französische Liste bestanden |
| Historische AP5-Registerkarte | Neues gemeinsames Hauptbundle, weiterhin `2026-08-29-ap5-approved.1` aus öffentlichem GitHub-Release. StPO, Zustellung 16.09.2026, zehn Tage: Fristbeginn 17.09., rechnerisches Ende 26.09., Fristablauf 28.09.2026 |

Die Berechnungsstichprobe auf allen vier aktuellen Hosts verwendet die ÜLG-Einsprache gegen eine Leistungsverfügung, Kanton Bern, Zustellung 16.09.2026 und 30 Tage. Deutsch und Französisch ergeben jeweils **16.10.2026**. Die Teams-Sichtprüfung umfasst bei 848 Pixeln das deutsche und französische Auswahlpanel sowie den geschlossenen französischen Feldwert und bei 1280 Pixeln die französische Liste samt gewähltem Wert. Wegen der verbleibenden Teams-Navigation ist die Rechnerfläche bei gleicher Fensterbreite enger als auf SharePoint. Die vorhandene responsive Umschaltung bleibt unverändert.

Screenshots wurden in der Toolkonversation visuell geprüft, nicht als separate Bilddateien archiviert. Die SharePoint-Tastaturprüfung belegt den Wechsel in einer per Klick geöffneten Liste, Bestätigung mit Enter und Schliessen mit Escape. Sie wird nicht als erneuter Nachweis einer reinen Tastaturöffnung ausgegeben. Ein anfänglicher Eingabeabbruch im historischen Teams-Datumsfeld wurde über die reguläre native Tastaturbedienung aufgelöst. Das vorhandene Entwurfsbanner der historischen Seite wurde weder bearbeitet noch veröffentlicht.

Temporäre Grössenüberschreibungen sind zurückgenommen, die Rechner stehen wieder auf Deutsch und E-Teams wieder auf der aktuellen Registerkarte. Keine persönlichen Teststandards gespeichert, keine Kalenderdateien erzeugt und keine Outlookimporte. Daten, Mirrors und Quellenkonfigurationen blieben unverändert.

Die zwei bisherigen fehlgeschlagenen Hostprüfungen bleiben im historischen Register erhalten. Die neuen paketgebundenen E-SP- und Q-SP-Nachtests bestätigen die Behebung beider Zuordnungen zu MVP06-UI-01. Das historische Register bleibt bei 284 PASSED / 2 FAILED / 3 NOT RUN. Es wurden nicht alle 289 Zuordnungen erneut durchlaufen. Die bestandenen begrenzten Nachtests ergänzen den ursprünglichen Eigentümer-Prüfumfang.

Die privaten Vollzugsbelege liegen getrennt unter `.work/deployments/2026-10-01-eq-mvp06-0601/`. Der Bericht `readback/activated-package-bundle-verification.json` bindet Paket, tatsächlichen Bundleinhalt und Berechtigungsvergleich. `e-sharepoint-retest.json`, `q-site-updates-authorized-completion.json` und `remaining-host-retests.json` trennen Appupdates und Rechnerbeobachtungen. Diese Rohbelege sind nicht pauschal zur Veröffentlichung freigegeben.

**Nachfolgende Abnahme:** David hat die manuelle Prüfung und Gastanmeldung als bestanden bestätigt und die begründete Wiederverwendung der bisherigen Outlook-Importnachweise beschlossen. Die [gesonderte Abnahmenotiz](abnahme-q-mvp06.md) bindet den aktuellen Paket-/Datenstand und schliesst R06-12 mit technischer Begründung ab. Dies sind eine Benutzerbestätigung und ein Wiederverwendungsentscheid, keine neuen Codex-Gast- oder Outlooktests. P06-01, der passende Webartefakt-Neubau und die getrennten GitHub-/P-Freigaben bleiben nachgelagert.

GitHub und P benötigen weiterhin eigene Freigaben. Codex bleibt ausführendes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

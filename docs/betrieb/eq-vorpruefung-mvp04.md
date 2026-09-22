# MVP 0.4: E-/Q-Vorprüfung und Ausführungsstand

Stand: 22. September 2026. **Paket `0.4.0.0` scheiterte im E-Test an der Validierung des korrekten Feiertagskatalogs. Der Rückfall im App-Katalog auf die exakt gesicherten Bytes von `0.3.0.0` ist bestätigt. Alle vier E-/Q-Ansichten und die historische E-Seite haben die Rückfall-Kurzprüfung bestanden. Die E-Appinstanz-Metadaten sind nicht abschliessend verifiziert. Die vier neuen Mirrors bleiben vollständig und byteweise geprüft erhalten. Keine Q-Abnahme oder Freigabe dieses Installationskandidaten.**

## Lokaler Stand

Der zusammengehörige Implementierungs- und Dokumentationsstand ist lokal in Commit `c3eaa629d13198d49013a66e8ef2029883139939` eingefroren. Der eigene Datencommit bleibt `739876a0d11b550ea8cc702622ab22af321994a5`. Es erfolgte kein Push.

Die explizite Freeze-Liste umfasst 335 neue beziehungsweise geänderte Dateien. Alle Arbeitsdateien und danach sämtliche vorgemerkten Git-Inhalte wurden vor dem Commit byteweise gegen die Liste geprüft. Gegenüber dem bereits geprüften Publikationsexport änderten sich ausschliesslich die beiden Einstiegstexte und der Deploymentplan. Hinzu kam die [begrenzte E-/Q-Installationsfreigabe](eq-installationsfreigabe-mvp04.md). Die historischen Benutzer-Wordänderungen, privaten Arbeitsmappenoriginale, Arbeitskopien, `Userinput/` und `.work/` wurden nicht aufgenommen.

Die drei vorhandenen Markdown-Zeilenumbrüche mit zwei Schlussleerzeichen in der historischen Westschweizer Quellenpaketnotiz blieben unverändert. Die Git-Prüfung ohne Beanstandung dieser beabsichtigten Zeilenumbrüche bestand. Die früheren Publikations- und Fachnachweise wurden nicht rückwirkend geändert.

## Tatsächlich geprüfte Ausgangslage

| Prüfung | Beobachtung | Grenze |
| --- | --- | --- |
| Zielressourcen | Beide bestehenden E-Sites und beide bestehenden Q-Sites über SharePoint aufgelöst, E-/Q-Teams und Fristenrechnerkanäle gefunden. Provider, GitHub-Pins und Mirrorpfade der direkten E-/Q-Teams-Registerkarten, der E-Testseite, der Q-Kommunikationsseite und der historischen E-Seite aufgenommen | Die historische E-Registerkarte ist ein Verweis auf die bestehende E-Seite, keine zusätzliche unabhängige direkte Teams-WebPart-Instanz |
| Tenant-App-Katalog | Paket `0.4.0.0` wurde unter der bestehenden Identität aktiviert und per SHA-256 bestätigt. Nach dem E-Fehler wurde das Vorgängerpaket `0.3.0.0` wieder aktiviert. Die Katalogoberfläche zeigt es als aktiviert und gültig | Katalogrückfall bestätigt. Daraus wird keine Rücksetzung sämtlicher Appinstanz-Metadaten abgeleitet |
| Rückfallpaket | Nach dem Rückfall erneut heruntergeladene Paketdatei mit 176'665 Bytes stimmt byteidentisch mit der vor dem Eingriff gesicherten Baseline überein. SHA-256 `a4cbaa646a9338419de51f7629652ecc2f9ada0ac15aeccdcf2211f72bc964e1` | Die separate Laufzeitprüfung ist unten je Ansicht abgegrenzt |
| E-Testseite | App aktualisiert. Neuer Mirror ausschliesslich im unveröffentlichten Seitenbearbeitungsmodus getestet. Der neue Datenstand wurde verworfen, die App fiel korrekt auf MVP 0.3 zurück | Keine MVP-0.4-Berechnung. Eigener Bearbeitungsentwurf verworfen, keine Veröffentlichung ausgeführt. Der Verwerfen-Bestätigungsdialog nannte den 31. August 2026 um 21.28.45 Uhr als Ausgangsstand. Kein byteweiser Seitenvergleich |
| Q-App und Q-Konfigurationen | Q-Appinstanzen nicht aktualisiert, Q-WebParts und Registerkarten nicht auf den neuen Mirror umgestellt | Kein Q-Test des neuen Releases. Der gemeinsame App-Katalog ist trotzdem E-/Q-weit relevant und kein Nachweis einer vollständigen Versionsisolation |
| Q-Seitenhistorie | Veröffentlichter Q-Kommunikationsseitenstand V3 vom 1. September 2026 sichtbar. Aktuelle Providereigenschaften separat aufgenommen | Historie und Konfigurationsaufnahme sind keine Prüfung des neuen Releases |
| Mirrorsicherung | Alle vier bestehenden MVP-0.3-Mirrors als Rohdateien gesichert. Je neun Dateien, insgesamt 36 Dateien, wurden per SHA-256 und byteweisem Vergleich gegen den lokalen Vorgängerrelease bestätigt | Die Sicherung betrifft `2026-08-31-mvp-03-approved.1`. Die Vorgängerordner bleiben erhalten |
| Neue MVP-0.4-Mirrors | In allen vier vorhandenen Mirrors liegt der vollständige neue Release mit je zehn JSON-Dateien. Alle 40 zurückgelesenen Rohdateien, zusammen 4'302'700 Bytes, sind byteidentisch zu den freigegebenen lokalen Artefakten | Die Dateien bleiben als geprüfte Vorbereitung erhalten. Der neue Datenstand wurde beim E-Versuch nicht aktiviert und keine veröffentlichte Datenquellenkonfiguration auf ihn umgestellt |
| Mirrorberechtigungen | Die abgefragten Berechtigungen aller neuen Releaseordner stimmen mit denen des jeweiligen Elternordners und Vorgängerrelease überein. Die Elternberechtigungen stimmen weiterhin mit der Baseline überein | Keine Berechtigung verändert. Dieser Vergleich ersetzt keinen realen Gast- oder App-Laufzeittest |
| Historische E-Registerkarte | Der vorhandene AP5-Datenpin, der leere Mirrorpfad und der Name bleiben gemäss ergänzendem Nutzerentscheid erhalten | Der gemeinsame Paketwechsel betrifft auch den Consumer dieser historischen Seite. Die lokale AP5-Kompatibilitätsprüfung ersetzt ihre ausstehende Live-Prüfung nicht |
| Zugriffsmodell | Abgefragte E-/Q-Kanalmitgliedschaften entsprechen der bekannten internen Prüferkonstellation. Q-Teamsite-Mirror weist Lesen für die Mitgliedergruppe auf. Nach dem Rückfall sind alle vier abgefragten Berechtigungseinträge des produktbezogenen Assetordners identisch zur Baseline | Keine abschliessende Vollprüfung aller Sitegruppen oder eines realen Gastzugriffs |
| Consumerkompatibilität | Direkter SPFx-Release-Service-Testlauf 11/11 bestanden, einschliesslich Laden und Berechnen mit dem bisherigen MVP-0.3-Release. Zusätzlich lokale AP5-Prüfung bestanden | Source-Tests sind kein Nachweis für das emittierte ES5-Bundle. Die neue E-Prüfung hat diese Testlücke konkret offengelegt |

Tenantadressen, interne Identitäten, Mitgliedschaftsdetails und die heruntergeladene Baseline verbleiben in der ignorierten lokalen Ausführungsevidenz unter `.work/deployments/2026-09-22-eq/`. Die Konfigurationsaufnahme liegt in `baseline/site-configurations.json` und `baseline/teams-configurations.json`, die Mirrorsicherung mit Einzelprüfsummen in `baseline/mirrors/backup-verification.json`. Der neue Rücklese- und Berechtigungsnachweis liegt in `mvp04-mirror-readback-summary.json`, SHA-256 `1a62b0a96d43bb7cc8ff06bb611e1c0aaa16697c9c77e215ca4e08d77d314311`. Diese privaten Nachweise werden nicht mitveröffentlicht.

## Ablauf und überwundene Haltepunkte

Der bisherige Teams-Navigationshaltepunkt ist behoben. Die tatsächlichen direkten E-/Q-Registerkarten und ihre Providereigenschaften konnten vor dem Installationsversuch aufgenommen werden. Der ergänzende Nutzerentscheid zur historischen E-Registerkarte ist in der [begrenzten Installationsfreigabe](eq-installationsfreigabe-mvp04.md#historische-e-registerkarte) abgegrenzt.

Am 22. September 2026 um 15.21 Uhr Schweizer Zeit wurde der erste Versuch, den neuen Releaseordner `2026-09-22-mvp-04-approved.1` im bestehenden Mirror der E-Testsite anzulegen, mit einem tatsächlichen Graph-Fehler `HTTP 403`, `accessDenied`, Connectorcode `FORBIDDEN`, abgewiesen. Die anschliessende lesende Kontrolle bestätigte, dass der neue Ordner zu diesem Zeitpunkt nicht vorhanden war. Bei diesem Versuch wurden **null Ordner erstellt und null Dateien hochgeladen**. Der lokale Manifesthash stimmte vor dem Versuch mit dem freigegebenen Artefakt überein.

Der Befund belegt die Zurückweisung dieses Connector-Schreibzugriffs, aber nicht, welche konkrete Berechtigung oder Richtlinie dafür ursächlich ist. Der vollständige damalige Befund samt lesender Nachkontrolle bleibt unverändert privat in `.work/deployments/2026-09-22-eq/mirror-upload-blocker.json` erhalten. Der abgewiesene Connector-Schreibzugriff wurde nicht wiederholt.

David Steimer legte den neuen E-Test-Releaseordner anschliessend manuell an. Die lesende Nachkontrolle bestätigte den Ordner und die vorhandene Eigentümerberechtigung. Danach wurden die neuen Datenordner und die vollständigen zehn JSON-Dateien je Mirror über den regulären Browserzugriff des bestehenden Eigentümers bereitgestellt. Die anschliessende unabhängige Rohdatei- und Berechtigungsprüfung bestätigte alle vier Mirrors wie oben ausgewiesen. Keine Zugriffsrechte wurden dafür erweitert. Der erfolgreiche Browserupload erklärt oder widerlegt den ursprünglichen Connectorfehler nicht.

Die zwischenzeitliche Sperre der lokalen macOS-Sitzung wurde vor dem Paketaustausch aufgehoben. Dieser frühere Haltepunkt ist nicht mehr die Ursache der Unterbrechung.

## E-Installationsversuch und technischer Befund

Nach Aktivierung und Prüfsummenbestätigung von `0.4.0.0` im gemeinsamen App-Katalog wurde die E-Test-App aktualisiert. Der neue E-Mirror wurde ausschliesslich in einem unveröffentlichten Seitenentwurf ausgewählt. Die App meldete `Ungültiger Text: holidayCatalog/data/jurisdictions/0/parentId` und verwendete ausdrücklich den letzten vollständig validierten MVP-0.3-Datenstand. Es erfolgte keine Berechnung mit dem neuen Kandidaten. Der alte Mirrorpfad wurde wieder eingestellt und der eigene Entwurf anschliessend ausdrücklich verworfen. Der Verwerfen-Bestätigungsdialog nannte den Ausgangsstand vom 31. August 2026 um 21.28.45 Uhr. Dies ist ein Dialogbeleg, keine unabhängige Bestätigung des aktuellen Veröffentlichungsmetadatenwerts. Es wurde kein Publikationsbefehl verwendet. Q-Appinstanzen und Q-Konfigurationen wurden nicht weiter aktualisiert.

Die unabhängige lokale Diagnose reproduziert denselben Fehler mit den unveränderten freigegebenen Daten und der vorhandenen kompilierten ES5-Ausgabe. Der korrekte Wert `parentId: null` für den Bund ist vom Schema ausdrücklich erlaubt. Die eigene Fehlerklasse `HolidayCatalogError` verliert beim ES5-Build ihre erwartete Instanz-Prototypkette. Deshalb ist `error instanceof HolidayCatalogError` falsch. Der Strukturvalidator wirft beim Prüfen der ersten String-Alternative den erwarteten Zweigfehler weiter, statt danach die zulässige Null-Alternative zu prüfen. Der gleiche Konstruktor und die gleiche Fehlerbehandlung sind im tatsächlich paketierten Bundle nachgewiesen.

Die Ursache liegt damit im technischen SPFx-Consumer, nicht in geänderten Mirrorbytes oder einem unzulässigen Datenwert. Die bisherigen SPFx-Tests führen TypeScript-Quellen über `tsx` aus. Webbuild und Vorschau verwenden `es2020`, der SPFx-Build dagegen `es5`. Die Quelltests und die Webvorschau erfassten diese Abweichung der emittierten Fehlerklasse nicht. Der private Einzelbericht liegt unter `.work/deployments/2026-09-22-eq/mvp04-es5-catalog-error-diagnosis.md`.

## Rückfall und aktueller Haltepunkt

Der begrenzt freigegebene Rückfall auf das vor dem Eingriff aus dem Tenant gesicherte Paket `0.3.0.0` ist im App-Katalog bestätigt. Die Oberfläche zeigt Version `0.3.0.0`, aktiviert und gültig. Die erneut heruntergeladenen 176'665 Paketbytes stimmen exakt mit der gesicherten Baseline und ihrer SHA-256-Prüfsumme überein. Auch die vier abgefragten Berechtigungseinträge des produktbezogenen Assetordners sind unverändert.

| Rückfall-Kurzprüfung | Nachweis | Ergebnis |
| --- | --- | --- |
| E-Testseite | Alte Bundledatei `fristenrechner-web-part_39c29a6f8ef9fd887dc8.js` im DOM nachgewiesen, MVP-0.3-Stand ohne Fallbackwarnung, StPO 16.09.2026 plus zehn Tage | 28.09.2026 |
| Historische E-Seite | Dieselbe alte Bundledatei im DOM nachgewiesen, AP5-GitHub-Stand ohne Fallbackwarnung, gleicher StPO-Fall | 28.09.2026 |
| Q-Kommunikationsseite | Dieselbe alte Bundledatei im DOM nachgewiesen, MVP-0.3-Stand ohne Fallbackwarnung, gleicher StPO-Fall | 28.09.2026 |
| Direkte E-Teams-Registerkarte | MVP-0.3-Stand ohne Fallbackwarnung, gleicher StPO-Fall | 28.09.2026 |
| Direkte Q-Teams-Registerkarte | Alte Bundledatei im gerenderten WebPart-Frame nachgewiesen, MVP-0.3-Mirrorstand ohne Fallbackwarnung, gleicher StPO-Fall | 28.09.2026 |

Diese fünf Prüfungen erfolgten im bestehenden Eigentümer-Browser mit vorhandenem Cache. Sie sind Laufzeit-Kurzprüfungen nach dem Rückfall, **keine cachefreien Mirror-Erstabrufe**, keine neue Gastprüfung und keine vollständige oder bestandene MVP-0.4-Matrix. Die tatsächliche Versionsmetadatenangabe der zuvor aktualisierten E-Appinstanz konnte mit dem verfügbaren Connector nicht gelesen werden. Es wird deshalb nicht behauptet, dass auch diese Metadaten auf `0.3.0.0` zurückgesetzt seien.

Ein byteweiser Vergleich der Seitenmetadaten und des Seiteninhalts war über den verfügbaren Standardzugriff nicht möglich. Die Abfrage der Seitenbibliothek wurde mit Graph-Fehler 400 zurückgewiesen. Die Befehlsleiste zeigte anschliessend «Entwurf, veröffentlicht am 22.9.2026» auch bei nicht bearbeiteten historischen und Q-Seiten. Daraus wird weder eine neue Veröffentlichung noch die vollständige Bereinigung aller vorbestehenden Entwürfe abgeleitet. Nachgewiesen sind das Verwerfen des eigenen E-Testentwurfs und das Ausbleiben eines Publikationsbefehls. Der aktuelle Seiten-/Canvas-Metadatenstand ist damit nicht vollständig verifiziert.

Private Nachweise: `.work/deployments/2026-09-22-eq/rollback-package-verification.json`, SHA-256 `400c4f1c5d928ff4b49c3c8d1c1cba37931f34c3432f81ee4c13c33b6725570f`, und `rollback-clientsideassets-permissions.json`, SHA-256 `2b1cdfa0aed321fb7cfeef365b04d0d452a3c8c847e0ba78ab8df961d7f88feb`. Der Ablauf einschliesslich aller fünf Browser-Kurzprüfungen und ihrer Grenzen ist privat in `rollback-browser-smoke.md` zusammengefasst.

Die neuen vier Mirrorordner mit 40 geprüften Dateien bleiben erhalten. Es wurden keine Mitgliedschaften oder Rechte verändert, GitHub und P bleiben unverändert. Die technische E-Prüfung des neuen Releases ist nicht bestanden, die weitere MVP-0.4-Q-Prüfung und die manuelle Q-Abnahme sind nicht erfolgt. Das Paket `0.4.0.0` erhält aus diesem Versuch keine technische Abnahme oder betriebliche Freigabe.

Vor einem erneuten Installationsversuch sind eine begrenzte technische Korrektur, eine neue eindeutig identifizierte Paketversion und Regressionstests auf den tatsächlich emittierten ES5-Code sowie das paketierte Produkt erforderlich. Die Katalogdaten und das Schema sind nicht als Ausweichlösung zu verändern. Die neue Paketprüfsumme und die erneute Installationsfreigabe werden separat festgehalten. Es wurde in diesem Diagnoseschritt weder eine Korrektur implementiert noch ein Paket neu gebaut.

## Nachfolgende lokale Korrektur

Der anschliessend beauftragte [Korrekturkandidat `0.4.0.1`](spfx-korrekturkandidat-mvp04-0401.md) behebt den ES5-Prototypfehler und ist lokal gegen den emittierten Code sowie das tatsächliche Paket geprüft. Dieser separate Vorbereitungsschritt enthält keine erneute Installation und ändert den oben dokumentierten Tenant-Prüfstand nicht.

## Ergänzende Prüfbedingung

Der Consumer kann den bisherigen Format-3-Release weiterhin lesen. Sein IndexedDB-Aktivstand ist jedoch browserweit pro Origin und nicht pro Site oder Datenquelle getrennt. Eine erfolgreiche E-Sitzung darf daher keine fehlerhafte Q-Quelle verdecken. Für jede Instanz bleiben eine Prüfung ohne vorhandenen Aktivcache, die konkrete Release-ID, vollständige Manifest-/Dateiverifikation und die Kontrolle auf Fallbackwarnungen erforderlich. Ein alter oder aus einer anderen Instanz stammender Cache zählt nicht als erfolgreicher Mirror-Erstabruf.

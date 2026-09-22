# AP17C: Lokale SPFx-Prüfumgebung

| Merkmal | Stand |
| --- | --- |
| Datum | 12. September 2026 |
| Anlass | In AP17A ohne Ergebnis abgebrochene lokale SPFx-Testsuite |
| Toolchain | Vorhandene projektspezifische Node.js-Version 22.23.2 |
| Umfang | Lokale Abhängigkeiten, Tests und Buildprüfung, kein Deployment |
| Produktionsstand | Paketversion und angehefteter Datenrelease unverändert |

## 1. Nachgewiesene Ursache

Der lokale SPFx-Abhängigkeitsbaum lag weitgehend nur noch als OneDrive-Platzhalter vor. Bei der Bestandsprüfung trugen 158 654 von 173 863 regulären Dateien unter `spfx/node_modules` das macOS-Dateiflag `dataless`.

Die Ursache wurde unabhängig vom Rechenkern und von den fachlichen Tests eingegrenzt:

1. Node.js ohne TypeScript-Loader startete sofort.
2. Der TypeScript-Loader aus dem Root-Projekt startete ebenfalls sofort.
3. Bereits der lokale SPFx-Aufruf `node --import tsx -e 'console.log("tsx-started")'` blieb vor der Ausgabe stehen.
4. Die unmittelbar importierte Datei `spfx/node_modules/esbuild/lib/main.js` war als `compressed,dataless` markiert. Ein isoliertes `readFileSync` dieser Datei wurde nach drei Sekunden mit `ETIMEDOUT` abgebrochen. Eine Vergleichsdatei aus AJV war sofort lesbar.
5. Der SPFx-Testlauf mit explizitem Zeitlimit endete nach 20 Sekunden mit einem abgebrochenen Testdatei-Lauf, ohne ausgeführte Fachtests.

Damit ist eine blockierende lokale Dateibereitstellung nachgewiesen. Der Ablauf erreicht die eigentlichen Tests nicht zuverlässig. Ein Fehler der Fristenberechnung, eine Endlosschleife in einem Test oder ein erfolgreicher SPFx-Nachweis darf daraus nicht abgeleitet werden. Warum OneDrive die Dateien ausgelagert hat oder nicht zeitgerecht bereitstellt, wurde nicht untersucht.

## 2. Massnahmen

Die SPFx-Tests erhalten ein explizites Zeitlimit von 30 Sekunden je Testlauf beziehungsweise Untertest. Ein blockierender Testdatei-Lauf wird damit als Fehler sichtbar und nicht unbegrenzt abgewartet. Es werden keine Tests übersprungen, deaktiviert oder durch einen Erfolgswert ersetzt.

Für die lokale Wiederherstellung wurden ausschliesslich die vorhandenen Versionen aus `spfx/package-lock.json` verwendet. Die gesonderte Arbeitskopie unter `.work/ap17c-spfx-dependencies` wurde mit `npm ci --offline --ignore-scripts --audit=false --fund=false` aus dem vorhandenen npm-Cache aufgebaut. Die Installation stellte 1329 Pakete in 42 Sekunden wieder her. Sie ist kein neues Projektartefakt und wird nicht veröffentlicht. Das unveränderte Lockfile bleibt führend. Die Wiederherstellung rechtfertigt keine Versionsanhebung oder fachliche Datenfreigabe.

Der bisherige Abhängigkeitsbaum wurde ohne Löschung nach `.work/ap17c-spfx-node_modules-offloaded` verschoben. `spfx/node_modules` verweist lokal auf `../.work/ap17c-spfx-dependencies/node_modules`. Beide Ablagen bleiben ignorierte Arbeitsverzeichnisse. Für eine Rückkehr zum Ausgangsstand lässt sich dieser Link entfernen und der gesicherte Verzeichnisbaum zurückverschieben. Die ausgelagerten Dateien des Ausgangsstands sind dadurch nicht automatisch wieder lesbar.

Der ursprüngliche TypeScript-Loader startete nach dieser Umschaltung sofort. Derselbe direkte Testaufruf führte anschliessend alle 17 bisherigen Tests in 2,34 Sekunden aus. 16 bestanden. Ausschliesslich der Test auf byteidentische Quellensynchronisation schlug nachvollziehbar fehl, weil die parallel neu erstellten AP17C-Quelldateien noch nicht in die generierte SPFx-Kopie übernommen worden waren. Das belegt die Behebung der ursprünglichen Startblockade, noch nicht die abgeschlossene AP17C-Integration.

## 3. Spezialkatalog-3-Ladevertrag

Der SPFx-Releasevalidator ist um das neue Spezialkatalog-Schema ergänzt. Die Auswahl erfolgt ausdrücklich anhand der Schema-ID des Artefaktdeskriptors. Der bestehende v2-Vertrag bleibt erhalten. Die Schemasynchronisation übernimmt beide Versionen. Unbekannte Formate, eine widersprüchliche Kombination aus Deskriptor und Inhalt sowie unbekannte fachliche Felder bleiben Fehler. Die AJV-Prüfung bleibt im strikten Modus.

Die zusätzlichen Vertragstests verwenden einen ausschliesslich im Arbeitsspeicher konstruierten synthetischen v3-Release auf Basis des bisherigen freigegebenen Testbestands. Diese technische Fixture ist weder der AP17C-Kandidat noch ein publizierbarer Datenrelease. Der tatsächliche AP17C-Kandidat wird gesondert unverändert als Kandidat geladen und muss weiterhin vor dem ersten Artefaktabruf am produktiven Freigabegate scheitern. Eine weitere Prüfung validiert seinen tatsächlichen Katalog gegen das v3-Schema, ohne ihn als Datenrelease zu aktivieren.

## 4. Prüfstand

| Prüfung | Ergebnis |
| --- | --- |
| Identität des wiederhergestellten Lockfiles | SHA-256 unverändert `a9ab3348a6c6cbb2e262f6d55200733977bc232375c689dd0d021154e739fc7e` |
| Ausgelagerte Dateien im wiederhergestellten Abhängigkeitsbaum | 0 |
| Bestehende Release-Service-Tests einschliesslich Format 2 und Format 3 | 11 bestanden |
| Neue Spezialkatalog-v3-Vertragstests | 8 bestanden |
| Gemeinsamer Lauf dieser beiden Testsuiten | 19 bestanden in 1,60 Sekunden, keine Fehler oder ausgelassenen Tests |
| Tatsächlicher AP17C-Kandidatenkatalog | AJV-strikt gültig, 45 Definitionen, davon 16 mit qualifizierter Anwendbarkeit, 4 gesperrte Zuordnungen |
| Normales Providerladen des tatsächlichen AP17C-Kandidaten | abgewiesen, ausschliesslich `manifest.json` abgerufen |
| Reguläre Schemas- und Quellensynchronisation | 9 Schemas und vollständige Kern-/UI-Quellen übernommen, Byteidentitätstest bestanden |
| Vollständige SPFx-Node-Testsuite nach abschliessender Synchronisation | erneut 25 bestanden in 2,19 Sekunden, keine Fehler oder ausgelassenen Tests |
| Produktionsbuild mit `heft test --clean --production` | erneut erfolgreich in 13,85 Sekunden, TypeScript 5.8.3 und Webpack 5.105.4 |
| CSS-Audit des tatsächlich gebauten WebPart-Bundles | bestanden |
| Bestehendes SPPKG vor und nach der Prüfung | byteidentisch, SHA-256 `a4cbaa646a9338419de51f7629652ecc2f9ada0ac15aeccdcf2211f72bc964e1` |
| Produktive Paketversion und angeheftete Datenquelle | unverändert |

Die Heft-Jest-Phase findet in diesem Projekt keine Jest-Suiten. Sie meldet deshalb null Tests und wird nicht als zusätzliche Testabdeckung gezählt. Die 25 tatsächlich ausgeführten Tests stammen aus dem separaten, regulären `npm test` mit Node.js.

ESLint meldete zwei bereits vorhandene Warnungen zu den expliziten `null`-Werten in `spfx/src/core/types.ts`, Zeilen 29 und 48. Diese Stellen beschreiben den bestehenden JSON-Datenvertrag für die offene zeitliche Abdeckung. Sie wurden im Rahmen dieses Pakets nicht geändert. Neue Buildfehler oder Warnungen durch die qualifizierten Typen und die gemeinsame Oberfläche traten nicht auf.

Bei weiteren Änderungen an den führenden Kern-/UI-Quellen sind die mechanische Synchronisation und die betroffenen Prüfungen erneut auszuführen. Der dokumentierte Lauf ist ein lokaler Integrationsnachweis, keine unveränderliche Releasefreigabe.

Die technische Gültigkeit des Katalogs ist keine neue juristische Abnahme. Ein erfolgreicher lokaler Build ersetzt weder die SharePoint-/Teams-Hostprüfung noch eine Freigabe zur Paketinstallation.

## 5. Ergänzende vollständige Datenreleaseprüfung

Der generische Offline-Prüfer `tests/data/validate_release.py` kennt zusätzlich den Spezialkatalog-v3-Vertrag. Er prüft weiterhin sämtliche Artefakte, Bytegrössen, SHA-256-Werte, Schema- und Quellenreferenzen sowie releaseübergreifende Beziehungen. Neue Anwendbarkeitszuordnungen müssen eindeutige IDs besitzen und dürfen nicht gleichzeitig als gesperrt ausgewiesen sein. Die 26 bisherigen berechneten Definitionen und drei behördlich vorgegebenen Termine bleiben als Basisbestand erhalten, die qualifizierten Definitionen kommen hinzu.

Dabei wurde ein bestehender Einrückungsfehler behoben. Die zeitliche Prüfung der Quellenmetadaten war versehentlich von einem Fehler bei Kalender-Overridezielen abhängig. Sie wird jetzt immer ausgeführt. Ein Quellenprüfdatum nach dem Erstellungsdatum des Releases ist stets unzulässig.

Die drei angekündigten künftigen Erlassfassungen sind im tatsächlichen Kandidaten unter `extensions.steimer.candidate.futureSourceComparison` als Vergleichsbelege verzeichnet. Nur ausdrücklich dort benannte, lokal aufgelöste Quellen mit einem dokumentierten, nicht zukünftigen Prüfdatum dürfen einen Dokumentstand nach dem Quellenprüfdatum besitzen. Solche Vergleichsbelege dürfen in keinem `sourceRefs`-Verweis der Artefakte als angewendete Normquelle auftreten. Diese Ausnahme aktiviert keine künftige Fachregel.

| Prüfung | Ergebnis |
| --- | --- |
| Vollständiger AP17C-Kandidat | gültig, 8 Artefakte, 5 Rechtsprofile, 47 Profilregeln, 2 Kalender mit 15 Kalenderregeln, 38 Quellen, 45 Fristdefinitionen, 52 Regime |
| Negative Selbsttests des Kandidaten | alle 19 Manipulationen abgewiesen |
| Insbesondere Zukunftsquelle in der angewendeten Normspur | abgewiesen |
| Zukunftsfassung ohne ausdrücklichen Vergleichsnachweis oder Vergleichsprüfung nach dem Releasedatum | abgewiesen |
| Rückwärtsprüfung aller 8 bestehenden historischen Kandidaten und freigegebenen Releases | bestanden |
| MVP-0.2 und MVP-0.3 | zusätzlich jeweils 11 negative Selbsttests bestanden |
| Python-Syntaxprüfung | bestanden |

Diese Offline-Prüfung hat den Kandidatenstatus nicht geändert. Der produktive SPFx-Provider verlangt unverändert einen freigegebenen Datenrelease.

## 6. Wiederholungsprüfung nach der Korrektur der Modellanzeigen

Nach der Umstellung der festen AP17C-Modellangaben von Auswahllisten auf native HTML-`output`-Anzeigen und der Ergänzung des optionalen Kerninputs `qualificationBasis` wurde die SPFx-Prüfung erneut vollständig ausgeführt. Die nativen Anzeigen verwenden natürlichen Textumbruch, nachdem die dynamische Höhenanpassung von Fluent-Textfeldern beim Verkleinern der Ansicht zu abgeschnittenem Text geführt hatte. Die reguläre Synchronisation übernahm neun Schemas sowie die abschliessenden Kern-/UI-Quellen. Alle 25 Node-Tests bestanden ohne Auslassung in 1,62 Sekunden. Der Produktionsbuild mit TypeScript 5.8.3 und Webpack 5.105.4 bestand in 16,78 Sekunden. Der anschliessende CSS-Audit des Bundles `fristenrechner-web-part_50eb518ef776c5c633ab.js` war erfolgreich.

Es blieben ausschliesslich die beiden oben dokumentierten bestehenden ESLint-Warnungen. Die Heft-Jest-Phase mit null Suiten wird weiterhin nicht als Testabdeckung gezählt. Der lokale Gesamtnachweis liegt unter `.work/qa/ap17c-fixed-spfx.log`. Das vorhandene SPPKG hatte vor und nach der Prüfung unverändert SHA-256 `a4cbaa646a9338419de51f7629652ecc2f9ada0ac15aeccdcf2211f72bc964e1`. Es wurde kein neues SPPKG erzeugt, keine Version oder Datenquelle geändert und nichts installiert oder veröffentlicht.

## 7. Wiederholungsprüfung für die einzige eidgenössische Handlung

Die anschliessende UX-Korrektur übernimmt im politischen Bereich bei eidgenössischen Angelegenheiten die einzige unterstützte Handlung automatisch und zeigt sie als festen Wert an. Nach erneuter Synchronisation der neun Schemas und aktuellen Kern-/UI-Quellen bestanden alle 25 SPFx-Node-Tests ohne Auslassung in 1,94 Sekunden. Der Produktionsbuild bestand in 15,09 Sekunden. Der CSS-Audit des Bundles `fristenrechner-web-part_133160f14790e958913a.js` war erfolgreich. Es blieben ausschliesslich die beiden bestehenden ESLint-Warnungen, die Heft-Jest-Phase mit null Suiten zählt nicht als zusätzliche Testabdeckung.

Der lokale Gesamtnachweis liegt unter `.work/qa/ap17c-fixed-federal-spfx.log`. Das bestehende SPPKG blieb vor und nach der Prüfung byteidentisch mit SHA-256 `a4cbaa646a9338419de51f7629652ecc2f9ada0ac15aeccdcf2211f72bc964e1`. Es erfolgten weder Paketierung noch Versions- oder Datenquellenänderung, Commit, Veröffentlichung oder Deployment.

## 8. Wiederholungsprüfung der einheitlichen Feldbeschriftung

Nach der Vereinheitlichung auf «Sitz der zuständigen Stelle» beziehungsweise «Siège de l’organisme compétent» und der Entfernung der bereichsspezifischen Beschriftungsvarianten wurden die neun Schemas und aktuellen Kern-/UI-Quellen erneut synchronisiert. Alle 25 SPFx-Node-Tests bestanden ohne Auslassung in 2,09 Sekunden. Der Produktionsbuild mit TypeScript 5.8.3 und Webpack 5.105.4 bestand in 16,64 Sekunden. Der CSS-Audit des Bundles `fristenrechner-web-part_e1c6f89ad8ac55a50c31.js` war erfolgreich.

Es blieben ausschliesslich die zwei bestehenden `no-new-null`-Warnungen in `spfx/src/core/types.ts`, Zeilen 29 und 48. Die Heft-Jest-Phase mit null Suiten zählt nicht als zusätzliche Testabdeckung. Der vollständige lokale Nachweis liegt unter `.work/qa/ap17c-authority-label-spfx.log`. Das vorhandene SPPKG blieb vor und nach der Prüfung byteidentisch mit SHA-256 `a4cbaa646a9338419de51f7629652ecc2f9ada0ac15aeccdcf2211f72bc964e1`. Kein neues SPPKG wurde erzeugt, weder Version noch Datenquelle geändert und nichts committed, veröffentlicht oder installiert.

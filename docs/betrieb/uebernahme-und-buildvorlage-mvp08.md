# R08-B – Vorlage für lokale Datenübernahme und Releasebau

Stand: 15. Oktober 2026. **Zur gesonderten Freigabe vorgelegt, noch nicht ausgeführt.** David Steimer hat R08-A2 einschliesslich Wiederverwendung, neuen Fassungsbefunden und fortbestehenden Vorbehalten [abgenommen](../fachrecht/abnahme-quellen-mvp08.md). Diese Abnahme erlaubt die Vorbereitung dieser Vorlage, nicht bereits ihren Vollzug. Produktiv bleibt MVP 0.7.

## 1. Auftrag und gebundene Eingänge

R08-B überführt den abgenommenen AP23-Stand in einen lokal geprüften MVP-0.8-Release. Er umfasst die kontrollierte Quellen- und Datenübernahme, einen eng begrenzten lokalen Datencommit, definitive SPFx-/Mirror-/Webartefakte und einen gesonderten Wiederherstellungskandidaten für MVP 0.7. Installation und Publikation folgen später gemäss [Deploymentplan](deployment-mvp-08.md).

| Eingang | SHA-256 |
| --- | --- |
| [Separater Quellenentscheid](../../outputs/release-mvp08-2026-10-15/source-approval.json) | `53a7f9e8b304c2552e89dc6fa4787b178170bde31aaf55100f5aed55cd995026` |
| [Zusammengeführte Quellenprüfung](../../outputs/release-mvp08-2026-10-15/source-review-completeness.json) | `e0c1012036fe1ddda95ab660d1153b203de19e8a75d9d6245da78d60e4796c66` |
| [Technische Quellenprüfung](../../outputs/release-mvp08-2026-10-15/source-review-verification.json) | `487744ce4462f247efbb53079b1a605c02628daebae768123bcb16860ccd768f` |
| [AP23D2-Kandidatenmanifest, auch Grundlage von D3](../../outputs/ap23d2-candidate-2026-10-15/bundle/manifest.json) | `ccb67c22e55737af064f8c9ef7b122db8c5dfe1f4a1f142eb77cd05fd5ac646d` |
| [AP23D3-Abnahmearchiv](../../outputs/ap23d3-abnahme-2026-10-15/receipt.json) | `e3641a460497a0047d7968de106575887757f4d8c619d396359ebd62bfb12966` |
| [MVP07-Baunachweis für die Rückfallbasis](../../outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifact-verification.json) | `c42c0c75d2352004e640dd0de3d18a37e4147290d4cd2c12f1e9a705d0376702` |

Der Quellenentscheid bindet 559 Belegdateien. 18 direkte Eingänge sind zusätzlich bytegleich archiviert. Historische Abnahmeberichte und deren damalige Freigabefelder werden nicht geändert. Die [maschinenlesbare Vorlagenbindung](../../outputs/release-mvp08-2026-10-15/r08b-proposal.json) ergänzt aktuelle Ausgangshashes, Zielnamen und die ausdrückliche Grenze zur noch ausstehenden Vollzugsfreigabe.

## 2. Vorgesehene Versionen und Ergebnisse

| Gegenstand | Vorgesehener Wert |
| --- | --- |
| Datenrelease und Verzeichnis | `2026-10-15-mvp-08-approved.1` unter `data/releases/` |
| Anwendung, Root-/SPFx-Projekt und Komponentenmanifest | `0.8.0` |
| Reguläres SPFx-Paket und Feature | `0.8.0.0` |
| Wiederherstellungspaket und Feature | `0.8.0.1`, Funktionsumfang MVP 0.7 |
| Manifest und Mindestconsumer | `8.0.0` gemäss DEC-2026-032 |
| Kantonalverfahrenskatalog | `1.0.0`, übrige Datenformate unverändert |

Die Versionsfelder in den beiden Lockdateien werden konsistent nachgeführt. Es gibt keine Abhängigkeits- oder Toolchainaktualisierung. Gebaut wird mit der vorhandenen Node-22.23.2-Toolchain und den gebundenen Abhängigkeiten. Die bestehenden Solution-, Feature- und Webpart-Identitäten bleiben gleich, ebenso Hosts und API-Berechtigungen.

Lokale Zielablage ist `outputs/release-mvp08-2026-10-15/`. Vorgesehen sind:

- `fristenrechner-schweiz-0.8.0.0.sppkg`
- `fristenrechner-mvp08-sharepoint-mirror.zip`
- `fristenrechner-mvp08-steimer-web.zip`
- `fristenrechner-schweiz-recovery-0.8.0.1.sppkg`

Prüfsummen, Grössen, Dateiinventare, Bauprotokolle und Testresultate werden erst aus den tatsächlichen Dateien ermittelt und in einem Abschlussnachweis gebunden. Die Namen oder geplanten Versionsnummern ersetzen keine spätere Paketfreigabe.

## 3. Genau begrenzte Datenübernahme

Zunächst werden alle gebundenen Eingänge erneut geprüft und die aktuelle Vollzugsfreigabe separat dokumentiert. Neue MVP08-Werkzeuge übernehmen und prüfen die Daten. Alte Promotionsskripte, historische Releases und Abnahmebelege bleiben unverändert. Die bestätigten Implementierungsschemas für Manifest 8 und Kantonalverfahrenskatalog werden bytegleich in die kanonische Schemaablage kopiert.

| Bereich | Erlaubte Übernahme nach Freigabe | Unverändert zu erhalten |
| --- | --- | --- |
| Quellenregister | Elf neue AP23-Quellen ergänzen, damit 247 Einträge. Neues sechstes Prüfereignis mit genau 243 geprüften Quellen und begründeten Befunden. Index neu aus vollständigen, expliziten Referenzkanten erzeugen | Fünf historische Ereignisse, historische IDs und vier nur historisch im Register vorhandene Quellen. Unsicherheit wird nicht zu einem uneingeschränkt positiven Befund |
| Fassungsbefunde | Fünf AS-Änderungsakte und acht Erlassfamilien in einem separaten, hashgebundenen `source-version-bridges.json` dokumentieren. Neue fünf Fassungsintervalle mit vorhandenen Quellen und Prüfbefunden verknüpfen | Keine zusätzlichen Laufzeitquellen oder Rechenregeln. Bestehende StPO-/LU-Fassungsbrücken und tatsächliche Wiederverwendungsgrenzen |
| Feiertagskatalog und Kalender | Releasefreigabe neu binden. Alle 32 Kalender mit dem tatsächlichen neuen Kataloghash deterministisch projizieren | 479 bisherige Katalogregeln plus zwölf SO-Prozessregeln, 198 Herkunftsentscheide, 104 terminale Bindungen und semantisch identische Kalenderregeln |
| Sozialkatalog | 50 Freigaben an den neuen Release, Quellenentscheid und tatsächliche CH-/BE-/Kataloghashes binden | 44 Fachregeln, 50 BE-Anbindungen, Referenzsuite und Freigabezeitraum 2026–2027 |
| Kantonalverfahrenskatalog | Neue Quellenprüfungs-, Referenzsuite- und Releasebindungen. Vollständige Zielbindungen für fünf TI- und sieben GR-Pfade | Pfad-, Feiertagsbindungs- und Stillstandsprofilhashes, Revisionen, Zeitraum 29.08.2026–31.12.2027 und historischer `physicalBaseline` |
| Manifest | Alle 41 Artefaktdeskriptoren zuletzt aus den fertigen Bytes erzeugen und zusammen mit dem Manifest versiegeln | 42 Laufzeitdateien insgesamt, 120 Manifest-Quellen-IDs, fünf bytegleiche Rechtsprofile und bytegleicher Spezialregimekatalog |

Die fünf AS-Akte sind ergänzende Fassungsbelege, keine fünf neuen fachlichen Quellen-IDs. Ihre Referenz wird über die bestehende, namensraumqualifizierte Manifest-Erweiterungsmöglichkeit und den Prüfbeleg gebunden. Das benötigt keinen neuen Laufzeitvertrag. `source-version-bridges.json` liegt im Prüfdossier ausserhalb der 42 Laufzeitdateien.

Der explizite Quellenindex muss alle 2078 Referenzkanten einschliesslich der 58 neuen Verwaltungskanten auflösen. Der bisherige allgemeine Indexdurchlauf erkennt die neuen Pfad- und Komponentenbezüge nicht vollständig und darf nicht unverändert als Vollständigkeitsbeweis dienen. Nach der Ergänzung werden 149 produktive, 85 unterstützende und 13 Monitoring-Registereinträge erwartet.

Die gemeinsamen Verwaltungsziele umfassen CH, TI, GR und Feiertagskatalog. Ein TI-Pfad bindet CH, TI und Katalog, ein GR-Pfad CH, GR und Katalog. `runtimeActive: false` bleibt vertragsgemäss bestehen. TI-O2 bleibt als `endShiftGuard` in den drei betroffenen TI-Pfaden erhalten, ohne zusätzliche Fallfreigabe. AI, Januargrenzen, GR-/NE-Vorbehalte, Freiburger Spiegelrolle und die begrenzten Bundes-/VD-/GL-Nachweise bleiben gemäss Quellenentscheid bestehen.

## 4. Lokaler Datencommit und reguläre Builds

Nach bestandener unabhängiger Datenprüfung darf **genau ein lokaler Datencommit mit ausschliesslich den 42 neuen Laufzeitdateien** unter dem oben bezeichneten Releaseverzeichnis erstellt werden. Die konkrete Dateipositivliste wird davor aus dem validierten Manifest abgeleitet. Voraussetzungen sind ein leerer Git-Index und der unveränderte Ausgangs-HEAD `a1aca59aa7cb333cac085278db93b18ce3038eec`. Vorhandene andere Änderungen werden weder aufgenommen noch zurückgesetzt.

Jeder Git-Blob wird gegen die geprüften Releasebytes verglichen. Der resultierende volle Commit-SHA wird anschliessend in beide regulären SPFx-Datenpins übernommen, in `spfx/src/core/config.ts` und im Webpartmanifest. Der Datencommit bleibt lokal. Ein Quellcode-/Publikationscommit und jeder Push sind nicht Teil von R08-B. Vor dem späteren GitHub-Push ist der neue öffentliche Pin noch nicht abrufbar. E/Q werden deshalb nur mit den gesondert freigegebenen, bytegeprüften Mirrors vorbereitet.

Die regulären Web- und SPFx-Einstiege verwenden das zusammengehörige geprüfte Format-8-Laufzeitobjekt mit `data`, `calendarRuntime` und `administrativeContext`. Der exportgesperrte D3-Referenzeinstieg wird nicht bloss umbenannt. Die definitive Anwendung muss den normalen Kalenderexport tatsächlich ausführen können. Freigegebene Fachlogik und zweispaltiges UI bleiben unverändert.

## 5. Lokaler Rückfallkandidat auf MVP 0.7

Die Basis sind die tatsächlich archivierten MVP07-Baueingänge unter `outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/build-evidence/inputs/`, ergänzt durch den nachvollziehbaren Quellstand `37e263156658498df350dd12989cd246f99cc219`. Die 230 archivierten Dateien wurden für diese Vorlage bytegeprüft. Darin sind 181 gebundene Produkteingänge enthalten. Nicht jeder archivierte Eingang ist mit diesem Git-Stand identisch, insbesondere enthält das archivierte Root-`package.json` abweichende Testskripte. Massgeblich sind die gebundenen tatsächlichen Baueingänge, nicht ein behaupteter vollständiger Git-Gleichstand.

Der neue Bau erfolgt in einer isolierten Arbeitskopie. Er behält MVP07-Funktionalität, Datenpin `331ef3e19d43a6b51d91a502acd6b5443071599f` und Format-7-Release `2026-10-08-mvp-07-approved.1`. Nur Paket- und Featureversion werden auf `0.8.0.1` erhöht. Eigene Wiederherstellungstests kommen hinzu. Historische Archive und aktueller Arbeitsbaum werden dafür nicht zurückgesetzt.

Die älteren Recovery-Pakete `0.7.0.1` und `0.7.0.3` stellen MVP 0.6 wieder her und werden nicht verwendet. Vor R08-C muss der tatsächliche Katalogbestand frisch geprüft werden. Falls dann ein gleich hoher oder höherer Paketstand besteht, sind neue konkrete Kandidaten und eine neue Paketbindung vorzulegen. **Der lokale Recovery-Bau ist noch keine Erlaubnis, den Rückfall im Tenant auszuführen.**

## 6. Nachweise vor Abschluss

1. Der echte Approved-Reader und ein unabhängiger Prüfer validieren alle 42 Dateien. Negativtests decken fehlende Abnahme, falsche Belege, unvollständige Quellenkanten, alte Komponentenhashes, fehlende Pfade, falsche Kalenderprojektionen und manipulierte Regeln ab. Ein enger Vorher-/Nachhervergleich erlaubt ausschliesslich die oben genannten Metadatenänderungen.
2. Frische Fachregression prüft zwölf TI-/GR-Pfade einschliesslich TI-O2 und Zeitgrenzen sowie fünf Bestandsprofile, 104 Bundesbindungen, 44 Sozialregeln und 50 BE-Anbindungen. Fachregeln und Ausschlüsse werden nicht erweitert.
3. Provider-, Cache-, Konfigurations- und verspätete-Antwort-Tests sowie historische Formate 1–7 und AP5 bleiben Teil der Prüfung. Defaults 1–4 werden nach 5 geprüft, einschliesslich echter Speicherzugriffe und Resetmarker.
4. Der Wechsel MVP08 → Recovery/MVP07 → MVP08 wird lokal mit den tatsächlichen Paketen und Format-7-/Format-8-Daten geprüft. V5-Rohbytes, beschädigte oder künftige Werte bleiben erhalten. Kein Browserdatenreset und keine automatische Vermischung alter und neuer Standards.
5. Die tatsächlich gebauten Web-/SPFx-Artefakte werden in DE/FR, schmaler Darstellung und mit gespeicherten Kalenderdateien getestet. Gesperrte oder veraltete Ergebnisse dürfen keinen Export erlauben. Outlook-Importe sind ausgeschlossen. Eine allfällige Wiederverwendung früherer Outlook-Nachweise wird neu begründet und separat vorgelegt.
6. Paketinhalt, ES2015-Kompatibilität, Identitäten und unveränderte Berechtigungen werden am fertigen SPPKG geprüft. Der grosse Pakettest läuft ohne gleichzeitige grosse Regression. Bestehende 24 Lintwarnungen bleiben ausgewiesen, keine Testentfernung oder Zeitlimitverlängerung als Ersatz für eine bestandene Prüfung.
7. Die Standardtests müssen ohne private Quellenrohbelege ausführbar bleiben. Ein Abschlussbericht bindet Soll-/Ist-Dateien, Prüfsummen, den lokalen Datencommit, Testprotokolle und verbleibende Grenzen. Lokale Hostsimulationen werden nicht als reale M365-, Geräte- oder Gastprüfung bezeichnet.

Die früheren D3-Testzahlen sind Vergleichsbasis, kein bereits bestandener MVP08-Build. Noch fehlende definitive Paketprüfsummen und künftige Hosttests werden ausdrücklich offen ausgewiesen.

## 7. Halt und anschliessende Schritte

Anhalten bei abweichenden Eingängen, einem nicht leeren Index oder abweichendem HEAD, einer bereits anders belegten Ziel-Release-ID, einem fachlichen Datenunterschied ausserhalb der Positivliste, nötiger Schema-/API-/Berechtigungserweiterung oder einem ungeklärten Testfehler. Vorhandene Zielartefakte werden nicht still überschrieben. Solche Abweichungen werden dokumentiert und vor einer Erweiterung des Auftrags vorgelegt.

Nach erfolgreichem R08-B wird die konkrete R08-C-Installationsvorlage mit Paketprüfsummen, vier bestehenden E-/Q-Zielen, Mirrorprüfung und frisch zu bestätigendem Rückfallweg erstellt. Sie erteilt selbst noch keine Installationsfreigabe. Reale Geräte-/Gastprüfung, manuelle Q-Abnahme, GitHub-Publikation und P-Bereitstellung bleiben gesondert. Root-Webauftritt, Sitemap, Hostingkonfiguration, AP21-Testapps, E05 und M365-Berechtigungen bleiben unverändert.

## 8. Vorgeschlagener Freigabetext

> Ich gebe R08-B gemäss dieser Vorlage vom 15. Oktober 2026 und ihrer separat gebundenen Vorlagenprüfsumme frei. Dies umfasst die kontrollierte lokale Quellen- und Datenübernahme in `2026-10-15-mvp-08-approved.1`, die ausdrücklich begrenzten Metadaten-, Versions-, Pin- und Einstiegspunktanpassungen, die erforderlichen lokalen Übernahme-/Prüfwerkzeuge sowie genau einen lokalen Datencommit mit ausschliesslich den 42 neuen Laufzeitdateien. Ich gebe den definitiven lokalen Bau der Anwendung `0.8.0`, des SPFx-Pakets `0.8.0.0`, des zugehörigen Mirrors und Webpakets sowie des Recovery-Pakets `0.8.0.1` mit MVP07-Funktionsumfang und die beschriebenen lokalen Tests frei. Die abgenommenen Rechenregeln, Fallgrenzen und historischen Nachweise bleiben unverändert. Bei den bezeichneten Abweichungen ist anzuhalten. Installation, Uploads, zusätzliche Commits, GitHub-Push, M365-/Hostingänderungen, Outlook-Importe und Betriebsfreigaben sind nicht umfasst.

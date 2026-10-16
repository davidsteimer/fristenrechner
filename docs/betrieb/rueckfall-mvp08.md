# R08-C gebundener Rückfall auf MVP 0.7

Stand: 15. Oktober 2026. **Lokal nachgewiesen, betriebliche Ausführung noch nicht freigegeben. R08C-H01 ist offen.** Dieser Rückfall gehört ausschliesslich zur [konkreten MVP08-E-/Q-Vorlage](eq-installationsvorlage-mvp08.md). Installation und Uploads bleiben ausgeschlossen.

## 1 Paket und Datenbindung

Recovery `fristenrechner-schweiz-recovery-0.8.0.1.sppkg`, 291’892 Bytes, SHA-256 **`8e387297d43df28e2fe4d3c7c9ae239bb2cdc6a9e3216e4c59c928c50d950e7b`**. Solution, Feature und Webpart-ID bleiben dieselben wie im regulären Paket. Das tatsächliche Hauptbundle ist `fristenrechner-web-part_718adb6034de97f22e08.js`, SHA-256 `920e7215704142b7d0822c91b1f0ddc6b2a0b2c7a114f3804fea4d79044b0f16`.

Das Paket stellt MVP07-Funktionalität mit Komponentenversion `0.7.0` wieder her. Nur Paket- und Featureversion sind erhöht. Der vorhandene Datenpin bleibt `331ef3e19d43a6b51d91a502acd6b5443071599f`. E/Q verwenden dennoch ausschliesslich ihre jeweils eigenen gesicherten Mirrors:

- Release `2026-10-08-mvp-07-approved.1`, Format 7, 40 Artefakte plus Manifest.
- Manifest SHA-256 `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597`.
- Vier eigene Pfade aus der privaten R08-C-Zielbindung, zusammen 164 frisch zu prüfende Remote-Dateien. Nicht einen gemeinsamen Ersatzmirror verwenden.

Die [lokalen Dateiinventare](../../outputs/release-mvp08-2026-10-15/r08c/mirror-inventories.json) und 164 nachgeprüften historischen Rohkopien sind die Vergleichsbasis. Fehlende oder abweichende Remote-Rückfalldateien stoppen den Vollzug. Sie erlauben weder stilles Überschreiben noch einen neuen Upload.

## 2 Reichweite und Nachweise

Beim Rückfall entfallen die neuen TI-/GR-Verwaltungswege und zugehörigen MVP08-Erweiterungen. Die landesweite Kalenderabdeckung, AP21-Datumseingabe und bisherigen Berner Spezialverfahren bleiben im MVP07-Funktionsumfang enthalten. Die früheren Recovery-Pakete `0.7.0.1` und `0.7.0.3` stellen MVP 0.6 wieder her und sind ausdrücklich nicht dieser Rückfallweg.

Recovery `0.8.0.1` besitzt **keinen besonderen Recovery-Banner und keinen eigenen Recovery-Standardschlüssel**. Die Identität wird durch Katalog-/Site-App-Version, tatsächlich geladenen Bundlehash, Komponentenfassung und Format-7-Quelle nachgewiesen. Ein vermeintlich fehlender Banner ist kein Fehler.

Der [Recovery-Bau](../../outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/artifact-verification.json) bestand 186 Quell-, 83 historische Paket- und neun ergänzende Prüfungen. Der [separate Hin-/Rückwechsel](../../outputs/release-mvp08-2026-10-15/recovery-roundtrip/verification.json) bestand sechs Prüfungen mit tatsächlichem AMD-Paketcode und simulierten Hooks, Speicher und Transport. Beide sind lokale Nachweise, keine M365-Rückfallprobe.

## 3 Begrenzter Datenrückfall

Bei einem eindeutig auf Daten oder Konfiguration begrenzten Problem kann unter nachweislich funktionsfähigem regulärem Code `0.8.0.0` die betroffene, bereits umgestellte Instanz auf **ihren eigenen** gesicherten Format-7-Mirror zurückgestellt werden. Nur den Mirrorpfad ändern und die nötige aktuelle Seite publizieren beziehungsweise Registerkarte speichern. Anschliessend tatsächliche Quelle, Manifest, Resultat, Export und Standardschutz prüfen. Dieser Schritt benötigt die ausdrückliche Billigung unter R08C-H01.

Das ist kein vollständiger Code-Rückfall. Falls die Ursache ungeklärt ist oder eine sichere Konfigurationsänderung nicht möglich ist, anhalten. Kein Umgehen durch frei gewählte Ersatzquellen, versteckte Propertyänderungen oder pauschale Datenbereinigung.

## 4 Vollständiger Code-Rückfall

1. Weitere Umstellungen stoppen. Befund, bereits geänderte Instanzen und zuletzt bestätigte Versionen dokumentieren. Frische Sicherung und Rückfallfreigabe kontrollieren.
2. **Zuerst alle in R08-C bereits auf MVP08 umgestellten aktuellen Ansichten auf ihre jeweils eigenen Format-7-Pfade zurückführen, solange `0.8.0.0` aktiv ist.** Noch nicht umgestellte Q-Ansichten behalten Format 7. Nur die dazu erforderlichen aktuellen Seiten publizieren und Registerkarten speichern. AP5 bleibt unangetastet.
3. Für alle vier aktuellen Ansichten bestätigen, dass keine mehr auf Format 8 zeigt und die 41 jeweiligen Rückfalldateien exakt vorliegen. Recovery erkennt Format 8 nicht. Eine solche Quelle führt zu einem gesperrten Rechner, nicht zu einem zulässigen Ersatz aus fremdem Cache.
4. Den tatsächlich bestehenden Katalogstand `0.8.0.0` und die eindeutigen Ziele erneut bestätigen. Erst dann dieselbe Katalogdatei durch das gebundene `0.8.0.1` ersetzen, bereitstellen und die vier vorhandenen Apps kontrolliert aktualisieren. Keine Deinstallation, Neuanlage oder automatische Tenantverteilung.
5. Paket- und Bundlebytes, Appzustände und Format-7-Quellen auf allen vier aktuellen Hosts prüfen. BE/StPO `16.09.2026` plus zehn Tage muss `28.09.2026` ergeben. Kalenderabdeckung TI mit StPO, Partei ohne Vertretung in TI, `07.12.2026` plus ein Tag muss `09.12.2026` ergeben. Eigene DE-/FR-Kalenderdateien tatsächlich speichern und prüfen, kein Outlook-Import. Neue TI-/GR-Verwaltungspfade dürfen nicht weiter als freigegebene MVP08-Funktion angeboten werden.
6. Historische SharePoint-AP5-Seite und Teams-Alias gesondert mit unverändertem Pin/Manifest und neuem Recovery-Bundle prüfen. Derselbe BE/StPO-Ausgangsfall ergibt `28.09.2026`. Historischen Entwurf weder publizieren noch verändern.
7. Nur eigene Testzustände gezielt zurücknehmen. Ergebnis und allfällige verbleibende Einschränkung protokollieren. Kein daraus abgeleiteter P-Rückfall und keine neue Betriebsfreigabe.

Die gemeinsame Codewirkung gilt auch beim Recovery. Bei ungeklärten zusätzlichen Verbrauchern, einem anderen Katalogstand oder nicht sicher umstellbaren Format-8-Ansichten anhalten. Dieser Ablauf ermächtigt nicht zur Untersuchung oder Änderung weiterer Sites.

## 5 Standards und Cache erhalten

Vor der ersten Format-8-Ansicht und vor eigenen Tests im tatsächlichen Speicherkontext Existenzmarker und exakte Rohbytes beider Schlüssel sichern:

| Schlüssel | Bedeutung |
| --- | --- |
| `fristenrechner.defaults.v1` | Ältere Standards, bei MVP07 mit Datenversion 4. Auch regulärer MVP08-Code mit Format-7-Daten verwendet diesen Pfad |
| `fristenrechner.defaults.v5` | MVP08-Standards bei Format 8. Gültige Werte, Resetmarker, beschädigte und künftige Werte bleiben beim Rückfall unangetastet |

Vier Ansichten sind nicht zwingend vier getrennte Speicherpartitionen. Gemeinsam genutzte Kontexte seriell prüfen. Fehlender Schlüssel und leerer Text sind verschieden. Migration darf bereits beim ersten Format-8-Laden stattfinden. Fremde oder zwischenzeitlich geänderte Werte nicht mit einer alten Sicherung überschreiben.

Recovery verwendet den älteren Schlüssel, verändert aber den v5-Schlüssel nicht. Bei späterer Wiederaufnahme werden zwischenzeitliche Änderungen alter Standards bei vorhandenem v5-Wert nicht automatisch zusammengeführt. Nur eigene synthetische Testwerte kontrolliert wiederherstellen, Resetmarker nicht als Löschanweisung interpretieren.

IndexedDB `fristenrechner-spfx`, Version 2, bleibt erhalten. Der Cache ist an Provider und tatsächlichen Site-/Mirrorpfad beziehungsweise festen GitHub-Pin gebunden. Format 7, Format 8 und AP5 sind keine austauschbaren Rettungsquellen. Blockierende eigene Testsitzungen dürfen regulär geschlossen werden. Kein Datenbankreset, kein globaler Cacheclear und keine Löschung von Cookies oder Browserdaten.

## 6 Spätere reguläre Wiederaufnahme

Nach einem tatsächlichen Recoveryeinsatz `0.8.0.1` benötigt die reguläre MVP08-Wiederaufnahme einen **neu gebauten, geprüften und freigegebenen höheren Paketstand**, mindestens `0.8.0.2`. Dafür liegt noch kein Kandidat und keine Bau- oder Installationsfreigabe vor. Der lokale Roundtrip mit erneut geladenem `0.8.0.0` beweist nur Code-/Datenkompatibilität, keine zulässige Downgradeinstallation.

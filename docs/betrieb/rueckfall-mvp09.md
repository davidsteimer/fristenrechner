# R09-C gebundener Rückfall auf MVP 0.8

Stand: 18. Oktober 2026. **Lokal nachgewiesen, betriebliche Ausführung noch nicht freigegeben. R09C-H01 ist offen.** Dieser Rückfall gehört ausschliesslich zur [konkreten MVP09-E-/Q-Vorlage](eq-installationsvorlage-mvp09.md) und ihrer [Prüfmatrix](pruefmatrix-mvp09.md). Diese Dokumentation erteilt keine Upload-, Installations-, Rückfall- oder Betriebsfreigabe. Es wurde keine frische Onlinebestandsprüfung durchgeführt.

## 1. Tatsächliches Paket und Rückfalldaten

Gebunden ist [fristenrechner-schweiz-recovery-0.9.0.1.sppkg](../../outputs/release-mvp09-2026-10-18/fristenrechner-schweiz-recovery-0.9.0.1.sppkg), **311’609 Bytes**, SHA-256 **`08c5e67e535cd3e04d962698e7dcb6bbe989f098d75f2b21aebe3226d95db94d`**.

| Merkmal | Tatsächlich geprüfter Wert |
| --- | --- |
| Paket- und Featureversion | `0.9.0.1` |
| Anwendung und Komponente | `0.8.0`, Funktionsumfang MVP 0.8 |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Feature-ID | `3edf1509-41e9-4a2f-8005-df510eec43b6` |
| Webpart-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Unterstützte Hosts | `SharePointWebPart`, `TeamsTab` |
| Zusätzliche API-Berechtigungsanforderungen | Keine |
| Hauptbundle | `ClientSideAssets/fristenrechner-web-part_70a48eb4a7448386daf2.js` |
| Hauptbundle SHA-256 | `e6dd12bd3882e2e9c3c7c59be626df2ad37fa0bcd978170de8f1eca06f5c9ad2` |
| Historischer GitHub-Datenpin | `10a99419eaabb3e96d2acccf0c7a93e2fe6472cb` |

Die Identitäten entsprechen dem regulären Produkt. Der Kandidat wurde isoliert aus den tatsächlich archivierten MVP08-Baueingängen erstellt, nicht aus dem heutigen Arbeitsbaum. Die normalisierte Bundlevergleichsprüfung erlaubt ausschliesslich die dokumentierten technisch erzeugten Namen und Kennungen. Sie behauptet keine unnormalisierte Bytegleichheit der unterschiedlich gebauten Bundles.

E/Q verwenden auch im Rückfall ausschliesslich **ihren jeweiligen eigenen gesicherten SharePoint-Mirror**:

- Datenrelease `2026-10-15-mvp-08-approved.1`, Manifestformat `8.0.0`.
- 41 Artefakte plus Manifest, somit 42 Dateien je Site und 168 getrennte Rohbytevergleiche für die vier Sites.
- Manifest SHA-256 `2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4`.
- Vier konkrete Rückfallpfade gemäss privater R09-C-Zielbindung. Kein gemeinsam gewählter Ersatzmirror und kein Wechsel auf den eingebetteten GitHub-Pin.

Die [lokalen Sollinventare](../../outputs/release-mvp09-2026-10-18/r09c/mirror-inventories.json) binden neue Format-9- und alte Format-8-Bytes getrennt. Ein lokales Inventar ist noch kein Nachweis vorhandener Remote-Dateien. Alle 168 Rückfalldateien sind vor dem gemeinsamen Codewechsel und vor einem tatsächlichen Rückfall frisch vollständig zu prüfen. Fehlende oder abweichende Dateien stoppen den Vollzug. Sie erlauben weder stilles Überschreiben noch einen nicht gesondert freigegebenen Upload.

## 2. Funktionsumfang und Grenzen des Nachweises

Ein vollständiger Rückfall nimmt die neuen LU-/ZG-/AR-Verwaltungswege **und die Feldhöhen-/Schriftkorrektur #50** zurück. Bundesverfahren, Berner Verfahren und Spezialregime, TI-/GR-Verwaltungswege, Kalenderabdeckung und AP21-Datumseingabe bleiben im bisherigen MVP08-Funktionsumfang mit dessen Freigabegrenzen enthalten. Eine selektive Übernahme neuer Funktionen in den alten Code ist nicht vorgesehen.

Das ältere Recoverypaket `0.8.0.1` stellt MVP 0.7 wieder her und ist ausdrücklich nicht dieser Rückfallweg. Auch eine beliebige Arbeitsdatei unter `spfx/sharepoint/solution/` ist kein Ersatz für die oben gebundene Paketdatei.

Recovery `0.9.0.1` besitzt **keinen besonderen Recovery-Banner und keinen eigenen Standardschlüssel**. Die Identifikation erfolgt über Katalog-/Site-App-Version, tatsächlich geladenes Bundle, Komponentenfassung und verifizierte Format-8-Datenquelle. Ein fehlender Recovery-Banner ist kein Fehler.

Der [Recovery-Baunachweis](../../outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/artifact-verification.json), SHA-256 `3d16f6e36e7e9fd1b8035cecbd634dd7636f956b963a0b8c45d38ca3d754376c`, bindet sechs Werkzeugtests, 204 historische Quelltests, 107 Pakettests und zehn ergänzende Recoverytests. Der [separate Paket-Rundlauf](../../outputs/release-mvp09-2026-10-18/recovery-roundtrip/verification.json), SHA-256 `f109e22af10660e964d9e0f8d7e1dd0e0923e732e0aad643908a2f23c21b3d0c`, besteht in allen sieben Fällen. Er ergänzt den damals noch ausstehenden Rundlauf, ohne den ursprünglichen Baubericht umzuschreiben.

Diese Prüfungen verwenden tatsächlichen AMD-Paketcode mit simulierten Hooks, Speicher- und Transportgrenzen. Sie sind keine reale M365-Rückfallprobe. Die 24 historischen Lintmeldungen des Recoverybaus bleiben dokumentiert.

## 3. Begrenzter Datenrückfall

Bei einem eindeutig auf Daten oder Konfiguration begrenzten Fehler kann unter nachweislich funktionsfähigem regulärem Code `0.9.0.0` eine betroffene, bereits umgestellte Instanz auf **ihren eigenen** gesicherten Format-8-Mirror zurückgestellt werden. Ausschliesslich den Mirrorpfad ändern und die dazu erforderliche aktuelle SharePoint-Seite publizieren beziehungsweise bestehende Teamsregisterkarte speichern. Danach Quelle, Manifest, Resultat-/Exportbindung und Standardschutz prüfen.

Dieser Schritt bedarf der ausdrücklichen Billigung unter R09C-H01. Er ist kein vollständiger Code-Rückfall. Bei ungeklärter Ursache oder nicht sicher möglicher Konfigurationsänderung anhalten. Keine frei gewählten Ersatzquellen, versteckten Propertyänderungen oder pauschalen Datenbereinigungen.

## 4. Vollständiger Rückfall nach gesonderter Freigabe

1. Weitere Umstellungen stoppen. Befund, betroffene Instanzen und zuletzt bestätigte Versionen dokumentieren. R09C-H01, frische Ausgangssicherung, vollständige Rückfalldateien und den Schutz gemeinsamer Standards kontrollieren.
2. **Alle vier aktuellen Ansichten müssen vor dem Codewechsel auf ihren jeweils eigenen Format-8-Mirror zeigen.** Bereits auf MVP09 umgestellte Ansichten unter dem noch aktiven regulären Code `0.9.0.0` zurückführen. Noch nicht umgestellte Ansichten behalten ihren bestätigten MVP08-Pfad. Nur die erforderlichen aktuellen Seiten publizieren und Registerkarten speichern. Historische AP5-Ansichten bleiben unverändert.
3. Für «Fristenrechner Test», «Entwicklungsumgebung», «Fristenrechner Gastdemo» und «Fristenrechner Gastdemo Teams» den tatsächlich gespeicherten jeweiligen Pfad und die 42 Sollbytes bestätigen. Keine aktuelle Ansicht darf noch Format 9 verlangen. Der alte Verbraucher kann Format 9 nicht verwenden. Ein fremder Format-8-Cache ist kein zulässiger Ersatz.
4. Den tatsächlichen Katalogstand `0.9.0.0` und die vier eindeutigen Zielinstanzen erneut bestätigen. Erst dann dieselbe Katalogdatei `fristenrechner-schweiz.sppkg` durch das gebundene Recovery `0.9.0.1` ersetzen und bereitstellen. Die vier bestehenden Apps kontrolliert aktualisieren. Keine Deinstallation, Neuanlage, zusätzliche Site-Installation oder automatische Tenantverteilung.
5. Auf allen vier aktuellen Hosts die Paket-/Appzustände, das tatsächlich geladene Recovery-Bundle und die verifizierte Format-8-Quelle prüfen. BE/StPO, `16.09.2026` plus zehn Tage, muss `28.09.2026` ergeben. Zusätzlich je einen freigegebenen TI- und GR-Verwaltungsweg gemäss Prüfmatrix prüfen. LU-/ZG-/AR-Verwaltungswege dürfen unter dem alten Daten-/Funktionsstand nicht als freigegebene MVP09-Funktion berechenbar bleiben. Eigene DE-/FR-Kalenderdateien tatsächlich speichern und prüfen, kein Outlook-Import.
6. Die historische SharePoint-AP5-Seite und deren Teams-Alias gesondert mit unverändertem Pin, Manifest und Datenstand sowie tatsächlich geladenem Recovery-Bundle prüfen. Der BE/StPO-Ausgangsfall muss ebenfalls `28.09.2026` ergeben. Historische Konfiguration und Entwürfe weder verändern noch publizieren.
7. Gemeinsam genutzte Speicherkontexte und ausschliesslich eigene synthetische Testzustände kontrollieren. Ergebnis, Restbefunde und tatsächlich erreichten Stand protokollieren. Keine daraus abgeleitete P-Änderung oder neue Betriebsfreigabe.

Die gemeinsame Codewirkung gilt auch beim Recovery für sämtliche bereits verbundenen Verbraucher. Bei einem anderen Katalogstand, ungeklärten zusätzlichen Verbrauchern oder nicht sicher zurückstellbaren Format-9-Ansichten anhalten. Dieser Ablauf ermächtigt nicht zur Untersuchung oder Änderung weiterer Sites. Ist die reguläre Konfigurationsoberfläche nicht sicher nutzbar, darf die Reihenfolge nicht durch einen vorgezogenen Codewechsel umgangen werden.

## 5. Gemeinsam genutzte Standards und quellengebundenen Cache schützen

MVP08 und MVP09 verwenden bei ihren Format-8-/Format-9-Ansichten **denselben** Schlüssel `fristenrechner.defaults.v5`. Anders als beim früheren Rückfall auf MVP07 wechselt dieses Recovery nicht auf einen getrennten alten Standardspeicher.

Vor dem ersten Laden in der Prüfsitzung und vor eigenen Präferenztests Existenzmarker und exakte Rohbytes beider Schlüssel im tatsächlichen Speicherkontext sichern:

| Schlüssel | Behandlung |
| --- | --- |
| `fristenrechner.defaults.v5` | Gemeinsame Standards der aktuellen MVP08-/MVP09-Ansichten. Gültige Inhalte, Resetmarker, beschädigte und künftig unbekannte Inhalte getrennt erkennen |
| `fristenrechner.defaults.v1` | Ältere Standards einschliesslich historischer Ansichten. Nicht löschen oder überschreiben. Bei fehlendem V5-Eintrag kann bereits das erste aktuelle Laden eine einmalige Migration mit neuem V5-Eintrag auslösen |

Vier Ansichten sind nicht zwingend vier getrennte Speicherpartitionen. Gemeinsam genutzte Kontexte seriell prüfen. Fehlender Schlüssel, leerer Text und vorhandener Resetmarker sind verschieden. Keine fremden oder zwischenzeitlich geänderten Werte mit einer älteren Sicherung überschreiben. Ist eine präzise Sicherung oder Zuordnung nicht möglich, eigene Schreibtests anhalten.

| Vorhandener V5-Inhalt | Tatsächliches Recoveryverhalten und Prüfgrenze |
| --- | --- |
| Neue LU-/ZG-/AR-Verwaltungsauswahl | Als nicht unterstützte Auswahl geschützt. Kein erfundener Ersatz. Laden sowie versuchtes Speichern und Zurücksetzen erhalten die Rohbytes. Die allgemeine Meldung zu nicht verwendbaren Standards ist kein Recovery-Banner |
| Beschädigter oder künftig unbekannter Inhalt | Geschützt. Laden, Speichern und Zurücksetzen verändern den vorhandenen Wert nicht |
| Resetmarker | Beim Laden erhalten. Frühere Standards erscheinen nicht durch Löschen des Markers erneut |
| Kompatible Standards, im Rundlauf BE/StPO | Beim Laden erhalten und verwendbar. Bewusstes Speichern oder Zurücksetzen kann denselben V5-Schlüssel ändern. Dies ist kein genereller Schreibschutz für alle gültigen Standards |

Der siebenfache Rundlauf verwendet denselben synthetischen Speicher und dieselbe IndexedDB über MVP09 → Recovery/MVP08 → MVP09. Er bestätigt die Rohbyterhaltung, die erneute sichtbare LU-/ZG-/AR-Auswahl unter MVP09 und die Rückkehr über dessen eigenen Format-9-Cache. Datum, rechtliche Fallqualifikation und Resultat werden nicht aus Standards erfunden. Änderungen kompatibler Standards während eines realen Recoverybetriebs wirken wegen des gemeinsamen Schlüssels auch auf eine spätere Wiederaufnahme. Dafür gibt es keine automatische Rücksetzung auf frühere Präferenzen.

IndexedDB `fristenrechner-spfx`, Version 2, bleibt erhalten. Der aktive Cache ist an Provider und normalisierte tatsächliche Site-/Mirrorkonfiguration beziehungsweise festen GitHub-Pin gebunden. Format 8, Format 9, AP5 und andere Mirrorpfade sind keine austauschbaren Rettungsquellen. Vorhandene `active`-Legacyeinträge begründen keinen konfigurationsfremden Fallback. Ein nicht vorhandener eigener Rückfallcache verlangt einen erfolgreichen Abruf des richtigen Mirrors.

Nur ausdrücklich erlaubte eigene Testwerte dürfen gezielt zurückgenommen werden. Kein allgemeiner Browserdatenreset, kein Datenbankreset, kein globales Cacheleeren und keine Löschung von Cookies. Ein blockierender eigener Testtab darf regulär geschlossen werden, ohne fremde Sitzungen zu beenden.

## 6. Offener Freigabepunkt und spätere Wiederaufnahme

**R09C-H01 bleibt offen.** Vor dem ersten gemeinsamen Katalogwechsel muss der Nutzer den oben gebundenen Wiederherstellungsweg einschliesslich gemeinsamer Codewirkung, Format-8-Rückfalldaten, Schutz der Standards, Rücknahme von UX #50 und erforderlichen Hostnachtests ausdrücklich billigen. Die R09-B-Freigabe deckt nur den lokalen Bau und dessen Prüfungen, nicht den Vollzug dieses Rückfalls.

Nach einem tatsächlichen Einsatz von `0.9.0.1` benötigt die reguläre MVP09-Wiederaufnahme einen **neu gebauten, geprüften und gesondert freigegebenen Paketstand höher als `0.9.0.1`**, somit frühestens `0.9.0.2`. Dafür liegt noch kein Kandidat vor. Bei einem bereits gleich hohen oder höheren tatsächlichen Katalogstand ist ebenfalls neu zu binden und vorher anzuhalten.

Der lokale Rundlauf lädt zuletzt nochmals Code aus `0.9.0.0`, um die Daten- und Standardskompatibilität zu prüfen. Er beweist weder die Zulässigkeit noch die technische Möglichkeit einer Downgradeinstallation im Tenant. E-/Q-Abnahme, Outlook-Wiederverwendungsentscheid, GitHub-Veröffentlichung und P-Bereitstellung bleiben gesonderte Schritte.

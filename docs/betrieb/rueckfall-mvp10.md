# R10-C: gebundener Rückfall auf MVP 0.9

Stand: 29. Oktober 2026. Fassung 1.0. **Lokal nachgewiesener Rückfallweg zur Freigabe. R10C-H01 ist offen.** Dieses Dokument gehört zur [konkreten E-/Q-Installationsvorlage](eq-installationsvorlage-mvp10.md) und ihrer [Prüfmatrix](pruefmatrix-mvp10.md). Es wurde keine Recoveryinstallation und keine frische Onlinebestandskontrolle ausgeführt. Die R10-B-Freigabe deckt den lokalen Bau und dessen Prüfung, nicht den hier beschriebenen betrieblichen Vollzug.

## 1. Gebundenes Paket und vier eigene Rückfallquellen

Gebunden ist [fristenrechner-schweiz-recovery-0.10.0.1.sppkg](../../outputs/release-mvp10-2026-10-28/fristenrechner-schweiz-recovery-0.10.0.1.sppkg), **327’129 Bytes**, SHA-256 **`0def9a2c4a126f6d7b30d22ebe600c1b471ccd10d6c81b7dfab9745a350d797b`**. Die konkrete Datei und ihre beiden nachstehenden Recoveryberichte wurden für diese Vorlage erneut lesend per SHA-256 geprüft.

| Merkmal | Gebundener Wert |
| --- | --- |
| Paket- und Featureversion | `0.10.0.1` |
| Anwendung und funktionaler Stand | `0.9.0`, MVP 0.9 |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Feature-ID | `3edf1509-41e9-4a2f-8005-df510eec43b6` |
| Webpart-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Hauptbundle | `ClientSideAssets/fristenrechner-web-part_164ec0c2d23f7bdaacfb.js` |
| Hauptbundle SHA-256 | `84632d513bb06af07065cb1e1f333dcf98a8f8a9f4b9dc7c97545c278dab29d1` |
| Eingebetteter historischer GitHub-Datenpin | `0ccc4b9178503ede051964149a4b17efab8d0cf9` |
| Zusätzliche API-Berechtigungsanforderungen | Keine |

Die Produktidentitäten bleiben erhalten. Das Paket wurde aus den tatsächlichen archivierten MVP09-Baueingängen erstellt. Der normalisierte Paketvergleich erlaubt nur die dokumentierten Versionsfelder und technisch erzeugten Dateinamen, fünf exakt gezählte CSS-Suffixe sowie drei erzeugte UUIDs. Er behauptet keine unnormalisierte Bytegleichheit verschieden gebauter Pakete. Das ältere Recovery `0.9.0.1` stellt MVP08 wieder her und gehört nicht zu diesem Rückfall. Eine Arbeitsdatei unter `spfx/sharepoint/solution/` ersetzt die oben gebundene Datei ebenfalls nicht.

Die vier aktuellen Instanzen verwenden auch beim Rückfall ausschliesslich **ihren jeweils eigenen gesicherten SharePoint-Mirror**:

- Datenrelease `2026-10-18-mvp-09-approved.1`, Manifestformat und Mindestconsumer `9.0.0`.
- 41 Artefakte plus Manifest, somit **42 Dateien je Site und 168 gesonderte Rohbytevergleiche** für die vier Sites.
- Manifest SHA-256 **`3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265`**.
- Die vier konkreten ursprünglichen Mirrorpfade und Instanzidentitäten stehen in der privaten R10-C-Zielbindung. Kein Ersatz durch eine andere Site, einen frei gewählten Format-9-Mirror oder den eingebetteten GitHub-Pin.

Die [lokalen Sollinventare](../../outputs/release-mvp10-2026-10-28/r10c/mirror-inventories.json) trennen die neuen 45 Format-17-Dateien und die alten 42 Format-9-Dateien. Sie belegen noch keine aktuelle Remoteverfügbarkeit. Vor dem gemeinsamen regulären Katalogwechsel und vor einem tatsächlichen Rückfall sind die vollständigen vier alten Bestände frisch gegen die Sollbytes zu prüfen. Fehlende oder abweichende Dateien stoppen den Vollzug. Ein Reparaturupload oder ein Überschreiben bestehender Rückfalldaten folgt daraus nicht automatisch.

## 2. Tatsächlicher Nachweis und zurückgenommener Funktionsumfang

Der [Recovery-Baunachweis](../../outputs/release-mvp10-2026-10-28/recovery-0.10.0.1/artifact-verification.json), **1’168’500 Bytes**, SHA-256 **`e2d793b4f10586fefa6ff491eb9f48394696aca57869906226e6b545d90d92f7`**, bindet 955 historische Baueingänge und fünf gesonderte Git-Hilfsdateien. 215 Quelltests, 170 Tests am tatsächlichen Paket, 15 Werkzeugtests und die 41 einzeln registrierten Recovery-Szenarien sind lokal bestanden.

Der spätere [gesonderte Vierphasen-Rundlauf](../../outputs/release-mvp10-2026-10-28/recovery-roundtrip/verification.json), **142’897 Bytes**, SHA-256 **`a7164af10e3b4df45363e98efb8f628629c7189fd97a45fda7a5cfa3b26d91f0`**, ist ebenfalls in allen **41 Szenarien** bestanden. Darunter sind **28 vollständige V5-Sequenzen** und 13 weitere Paket-, Migrations-, Reset-, Cache- und Äquivalenzfälle. Die 28 Sequenzen lauten:

`MVP09 / Format 9 → MVP10 / Format 17 → Recovery / eigener Format-9-Cache → MVP10 / eigener Format-17-Cache`

Sie verwenden denselben synthetischen Standardspeicher und dieselbe simulierte IndexedDB. Die 20 neuen Kantone, ein zusätzlicher Walliser Weg mit aktuell angeordneter Dauer, die kompatiblen LU-/ZG-/AR-Wege und vier weitere Speicherzustände sind enthalten. Die abschliessende erneute Verwendung des MVP10-Pakets dient der Funktionsprüfung, nicht dem Nachweis einer zulässigen SPFx-Downgradeinstallation. Insgesamt werden drei konkrete Paketdateien in vier Phasen verwendet.

Die ursprüngliche Kennzeichnung `roundTripMvp10Pending:true` im zuerst erstellten Recoverybericht bleibt unverändert. Der spätere getrennte Rundlauf und die [lokale Abschlussquittung](../../outputs/release-mvp10-2026-10-28/local-completion.json) schliessen diese damalige Pendenz. Die vollständigen Rohlogs und Archivdateien sind dort nachgeprüft. Der gesondert begründete längere Testprozessrahmen für 29 Rundlaufszenarien ist Testorchestrierung und keine Aussage zur Benutzerwartezeit.

Diese Prüfungen führen tatsächlichen AMD-Paketcode mit simuliertem Browser, React und IndexedDB sowie synthetischem Dateitransport aus. Sie sind **keine reale M365-Rückfallprobe**, keine Geräteprüfung und keine menschliche Freigabe. Lokale Prüfungen ersetzen die nach dem betrieblichen Vollzug erforderlichen Hosttests nicht.

Ein vollständiger Rückfall entfernt alle mit R10 hinzugekommenen Verwaltungswege der 20 weiteren Kantone sowie den U1-Nachtrag. Er stellt die vorherige MVP09-Funktion mit BE, TI, GR, LU, ZG und AR im dort freigegebenen Umfang her. Die ursprüngliche MVP09-Korrektur von Feldhöhe und Schrift der Datumseingabe bleibt erhalten. Bundesverfahren, Schweizer Kalender und Sozialregime bleiben im Umfang und mit den Grenzen von MVP09. Insbesondere entsteht keine ausserbernische Sozialfreigabe. Bereits bekannte MVP09-Darstellungsgrenzen können wieder auftreten.

Recovery `0.10.0.1` hat keinen besonderen Recovery-Banner und keinen eigenen Standardschlüssel. Der Nachweis erfolgt über Katalog- und Site-App-Version, tatsächlich geladenes Bundle, Komponentenfassung und verifizierte Format-9-Quelle. Die allgemeine Meldung zu nicht verwendbaren Standards ist kein Recovery-Banner.

## 3. Begrenzter Datenrückfall

Bei einem eindeutig auf Daten oder Konfiguration begrenzten Fehler darf nach geschlossener Freigabe **R10C-H01** eine betroffene, bereits umgestellte Instanz unter nachweislich funktionsfähigem regulärem Code `0.10.0.0` auf **ihren eigenen** gesicherten Format-9-Mirror zurückgestellt werden. Ausschliesslich den Mirrorpfad ändern und die dazu erforderliche aktuelle SharePoint-Seite publizieren beziehungsweise die bestehende Teamsregisterkarte speichern. Anschliessend Quelle, Manifest, verfügbaren Funktionsumfang, Resultat- und Exportbindung sowie Standardschutz prüfen.

Dieser Schritt lässt das neue Paket installiert. Er ist daher kein vollständiger Code-Rückfall. Bei ungeklärter Ursache oder nicht zuverlässig nutzbarer regulärer Konfigurationsoberfläche anhalten. Keine frei gewählten Ersatzquellen, versteckten zusätzlichen Propertyänderungen oder pauschalen Datenbereinigungen. Der bewusst reduzierte Datenumfang ist im Vollzugsnachweis festzuhalten.

## 4. Vollständiger Rückfall nach ausdrücklicher Billigung

1. Weitere Umstellungen stoppen. Befund, betroffene Instanzen und zuletzt bestätigte Versionen festhalten. Geschlossenes R10C-H01, aktuelle Ausgangssicherung, vollständige Format-9-Rückfallquellen und Schutz der gemeinsamen Standards kontrollieren.
2. **Alle vier aktuellen Ansichten müssen vor dem Codewechsel auf ihren jeweils eigenen Format-9-Mirror zeigen.** Bereits auf MVP10 umgestellte Ansichten unter noch funktionierendem neuem Code zurückführen. Noch nicht umgestellte Ansichten behalten ihren frisch bestätigten MVP09-Pfad. Nur die erforderlichen aktuellen Seiten publizieren und bestehenden Registerkarten speichern. Historische AP5-Ansichten bleiben unverändert.
3. Für «Fristenrechner Test», «Entwicklungsumgebung», «Fristenrechner Gastdemo» und «Fristenrechner Gastdemo Teams» die tatsächlich gespeicherten Pfade und sämtliche 42 Sollbytes je Quelle bestätigen. **Keine aktuelle Ansicht darf noch Format 17 verlangen.** Recovery kann Format 17 und dessen Cache nicht verwenden. Ein fremder Format-9-Cache ist kein Ersatz.
4. Den tatsächlichen Katalogstand `0.10.0.0` und die vier Zielinstanzen unmittelbar erneut bestätigen. Erst danach dieselbe bestehende Katalogdatei `fristenrechner-schweiz.sppkg` durch das gebundene Recovery `0.10.0.1` ersetzen und bereitstellen. Die vier bestehenden Apps kontrolliert aktualisieren. Keine Deinstallation, Neuanlage, zusätzliche Siteinstallation oder automatische Tenantverteilung.
5. Auf allen vier aktuellen Hosts Appzustand, tatsächlich geladenes Recovery-Bundle und eigene Format-9-Quelle prüfen. Der BE/StPO-Fall `16.09.2026` plus zehn Tage muss `28.09.2026` ergeben. Die freigegebenen LU-/ZG-/AR-Bestandsfälle aus der Prüfmatrix müssen weiter funktionieren. Empfang `02.10.2026` ergibt beim ordentlichen LU-Verwaltungsweg mit 30 Tagen `02.11.2026`, beim ordentlichen ZG-Verwaltungsweg mit 20 Tagen `22.10.2026` und beim qualifizierten AR-Nichtgeldvollstreckungsrekurs mit fünf Tagen `07.10.2026`. Die jeweils positive Fallqualifikation ist neu zu setzen. Je einen TI- und GR-Bestandsweg sowie eine neue, unter MVP09 nicht verfügbare Auswahl prüfen. Neue Kantonswege dürfen unter dem zurückgeführten Stand nicht als freigegebene MVP10-Funktion berechenbar bleiben. Eigene synthetische DE-/FR-Kalenderdateien tatsächlich speichern und prüfen, kein Outlook-Import.
6. Die historische SharePoint-AP5-Seite und ihren Teams-Alias mit unverändertem Pin, Manifest und Datenstand sowie tatsächlich geladenem Recovery-Bundle gesondert prüfen. Der BE/StPO-Ausgangsfall muss auch dort `28.09.2026` ergeben. Historische Konfiguration und Entwürfe weder verändern noch publizieren.
7. Gemeinsam genutzte Speicherkontexte und ausschliesslich eigene synthetische Testzustände kontrollieren. Tatsächlich erreichten Stand, Restbefunde und Prüfresultate dokumentieren. Reale Geräte- und Gastprüfung sowie eine erforderliche erneute manuelle Q-Abnahme verbleiben beim Nutzer. Daraus folgt keine P-Änderung oder automatische neue Betriebsfreigabe.

Die gemeinsame Codewirkung gilt auch beim Recovery für sämtliche bereits mit dem Paket verbundenen Verbraucher. Bei abweichendem Katalogstand, ungeklärten weiteren Verbrauchern oder nicht sicher zurückstellbaren Format-17-Ansichten anhalten. Die Freigabe gestattet keine Untersuchung oder Änderung zusätzlicher Sites. Ist die reguläre Konfigurationsoberfläche nicht sicher nutzbar, darf die Reihenfolge nicht durch einen vorgezogenen Codewechsel umgangen werden.

## 5. Gemeinsame Standards, Migrationsgrenzen und eigene Cachequellen

MVP09, MVP10 und Recovery verwenden bei ihren aktuellen Ansichten denselben Schlüssel **`fristenrechner.defaults.v5`**. Vier Ansichten sind nicht zwingend vier getrennte Speicherpartitionen. Gemeinsam genutzte Kontexte sind seriell zu prüfen.

Vor dem ersten Laden in der Prüfsitzung und vor eigenen Präferenztests sind Existenzmarker und exakte Rohbytes der folgenden beiden Schlüssel im tatsächlichen Speicherkontext zu sichern:

| Schlüssel | Behandlung |
| --- | --- |
| `fristenrechner.defaults.v5` | Gültige Inhalte, unbekannte Auswahl, Resetmarker, beschädigte und künftig unbekannte Inhalte unterscheiden. Der alte Verbraucher darf neue Auswahlwerte nicht still umdeuten |
| `fristenrechner.defaults.v1` | Historische Standards und ältere Datenformate V1 bis V4 erhalten. Nur bei wirklich fehlendem V5-Eintrag kann das Laden eine einmalige Migration in V5 auslösen. Bestehende V5-Inhalte oder ein Resetmarker dürfen dadurch nicht ersetzt werden |

Fehlender Schlüssel, leerer Text und Resetmarker sind verschieden. Keine fremden oder zwischenzeitlich veränderten Werte mit einer älteren Sicherung überschreiben. Wenn sich Herkunft, aktuelle Rohbytes oder Speicherkontext nicht eindeutig bestimmen lassen, eigene Schreibtests anhalten. Eine Sicherung ist kein pauschaler Auftrag, sämtliche gesicherten Präferenzen später zurückzuschreiben.

| Vorhandener V5-Inhalt | Nachgewiesenes Verhalten und Grenze |
| --- | --- |
| Auswahl eines der 20 neu integrierten Kantone oder neuer VS-Weg | Unter Recovery nicht unterstützt und als Rohwert geschützt. Kein stiller Ersatz. Laden sowie versuchtes Speichern und Zurücksetzen erhalten den Inhalt. Beim späteren passenden MVP10-Verbraucher wird die Auswahl wieder erkannt |
| Beschädigter oder künftig unbekannter Inhalt | Laden, Speichern und Zurücksetzen erhalten die vorhandenen Rohbytes |
| Resetmarker | Beim Laden erhalten. Alte Werte dürfen nicht durch Entfernen des Markers wieder erscheinen |
| Kompatible Standards, darunter LU, ZG, AR und BE/StPO | Beim Laden verwendbar und erhalten. Bewusstes Speichern oder Zurücksetzen kann denselben V5-Schlüssel ändern. Kein allgemeiner Schreibschutz aller gültigen Standards |

Datum, Referenz, aktuelle Fallqualifikation und Resultat werden nicht als alte Fallfakten wiederhergestellt. Die für einen konkreten Fall angeordnete Dauer des zusätzlich geprüften Walliser Wegs wird bei der erneuten MVP10-Verwendung ebenfalls nicht aus gespeicherten Standards erfunden. Änderungen kompatibler Präferenzen während des Recoverybetriebs wirken wegen des gemeinsamen Schlüssels auch bei einer späteren Wiederaufnahme. Eine automatische Rücksetzung auf frühere Präferenzen ist nicht vorgesehen.

IndexedDB `fristenrechner-spfx`, Version 2, bleibt erhalten. Der verwendbare Cache ist an Provider und normalisierte tatsächliche Site-/Mirrorkonfiguration beziehungsweise den festen GitHub-Pin gebunden. **Format 9, Format 17, AP5, andere Mirrors und andere Pins sind keine austauschbaren Ersatzquellen.** Legacy-`active`-Einträge begründen keinen konfigurationsfremden Fallback. Der eigene Cache wird vollständig aus seinen ursprünglichen Bytes erneut geprüft. Ein nicht vorhandener eigener Rückfallcache verlangt einen erfolgreichen Abruf des richtigen Mirrors.

Nur ausdrücklich erlaubte eigene Testwerte dürfen gezielt zurückgenommen werden. Kein allgemeiner Browserdatenreset, kein Datenbankreset, kein globales Cacheleeren und keine Löschung von Cookies. Fremde Sitzungen, Standards oder Cacheeinträge bleiben erhalten. Ein eigener blockierender Testtab darf regulär geschlossen werden.

## 6. Offene Freigabe und spätere Wiederaufnahme

**R10C-H01 bleibt bis zur ausdrücklichen Billigung offen.** Vor dem ersten gemeinsamen Katalogwechsel muss der Nutzer den gebundenen begrenzten Datenrückfall und den vollständigen Rückfall einschliesslich gemeinsamer Codewirkung, vier eigener Format-9-Rückfallquellen, Standardschutz, zurückgenommenem Funktionsumfang und Hostnachtests freigeben. R10C-U01 und R10C-I01 der Installationsvorlage bleiben davon getrennte Vollzugsfreigaben. «OK. Next Step.» beauftragt die konkrete Vorbereitung und schliesst diese Installations- und Rückfallfreigaben nicht.

Nach tatsächlicher Installation des Recovery `0.10.0.1` benötigt die reguläre MVP10-Wiederaufnahme einen neu gebauten, geprüften und separat freigegebenen Paketstand **höher als `0.10.0.1`, frühestens `0.10.0.2`**. Ein solcher Kandidat liegt in dieser Vorlage nicht vor. Der lokale Funktionsrundlauf mit `0.10.0.0` erlaubt keine erneute Installation der niedrigeren Paketversion. Bei einem bereits gleich hohen oder höheren tatsächlichen Katalogstand ist vor jedem Austausch neu zu binden.

R10B-CLI-H01 bleibt ein gesonderter technischer Nachtrag vor einer späteren Quellpublikation. Er betrifft den alten ungetrennten Testbefehl und verändert weder die hier gebundenen Paketbytes noch die tatsächlich bestandenen Recovery- und Rundlaufprüfungen. GitHub-Publikation, P-Bereitstellung, Outlook-Wiederverwendung und menschliche Betriebsabnahmen bleiben gesonderte Schritte. AP21-Testapps, E05, historische AP5-Daten, M365-Berechtigungen und Richtlinien bleiben ausserhalb des Rückfallumfangs.

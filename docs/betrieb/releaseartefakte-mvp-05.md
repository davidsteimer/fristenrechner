# MVP 0.5 · Definitive lokale Releaseartefakte

Stand: 28. September 2026. **Lokale Datenübernahme und definitive Builds abgeschlossen. Nicht installiert, nicht veröffentlicht, kein neuer P-Betrieb.**

Grundlage ist die ausdrückliche [Quellenabnahme und lokale Baufreigabe durch David Steimer](../fachrecht/abnahme-quellenpruefung-mvp05.md). Die Erklärung ersetzt weder die spätere Zielumgebungsprüfung noch die gesonderten Installations-, Publikations- oder Betriebsentscheide.

## 1. Gebundener Release

| Gegenstand | Tatsächlicher Stand |
| --- | --- |
| Anwendung | `0.5.0` |
| SPFx-Solution und Feature | `0.5.0.0`, bisherige IDs unverändert |
| Datenrelease | `2026-09-28-mvp-05-approved.1` |
| Manifest und Mindestconsumer | `5.0.0` |
| Sozialverfahrenskatalog | `1.0.0`, 24 Bundesregeln, 28 bernische Anbindungen |
| Neue Sozialpfade | ELG, AVIG-ALE und KVG-OKP im abgenommenen begrenzten Umfang. IVG-/AHVG-/UVG-Pfade überführt |
| Quellen- und Fallabdeckung der Sozialfreigaben | 2026–2027, unveränderte materielle Grenzen und Vorbehalte |
| Manifest-SHA-256 | `3aa09c80c93ef56d472748c4a5496d439537272d96491497b2c678e3c7e20715` |
| Quellenabnahme-SHA-256 | `2897874ed52c826bb43dc61270f8122cf996b4fa2070904eacc4d672f551f768` |
| Lokaler Datencommit | `3109c39730f10d31cb6c57200b36dd5091d7bcd1`, ausschliesslich neuer Datenordner, kein Push |
| Produktquellstand | Lokaler Arbeitsstand, noch kein vollständiger Produktcommit. Keine Behauptung eines bereits öffentlich reproduzierbaren Checkouts |

Der [Datenpromotionsnachweis](../../outputs/release-mvp05-2026-09-28/data-promotion.json) weist neun byteidentische Komponenten sowie ausschliessliche Freigabe-/Metadatenänderungen im Sozialkatalog aus. Regeln, Ausschlüsse, Zuständigkeitsfakten, rechtliche Zeitbindungen und historische Quellenprüfdaten bleiben unverändert. Die 28 Freigaben binden Regel, Anbindung, Kalender, Referenzsuite und tatsächliche menschliche Quellenabnahme mit ihren Prüfsummen.

Die Kandidaten C1/C2/C3 und die bisherigen Releases bleiben unverändert. Auch die zehn in der C3-Abnahme gebundenen Dateien einschliesslich der fünf lebenden UI-/Core-Dateien stimmen beim definitiven Build weiterhin mit der Abnahme überein.

## 2. Auslieferungsartefakte

Alle drei Dateien liegen im [lokalen Artefaktordner](../../outputs/release-mvp05-2026-09-28/artifacts/). Sie sind gemeinsam gegen denselben freigegebenen Datenstand geprüft.

| Datei | Grösse | SHA-256 |
| --- | --- | --- |
| [SPFx-Paket `0.5.0.0`](../../outputs/release-mvp05-2026-09-28/artifacts/fristenrechner-schweiz-0.5.0.0.sppkg) | 222’393 Bytes | `f46beaadbfd9e2a893b55853bb2d622cb6850e5d72b08b9443d367e0d6f6cf39` |
| [SharePoint-Mirror](../../outputs/release-mvp05-2026-09-28/artifacts/fristenrechner-mvp05-sharepoint-mirror.zip) | 105’987 Bytes | `17baf1b097335c318b366b75ca53d5b64ca1ad713805d7370116a1d6db4cf9fa` |
| [Statisches Webpaket für steimer.ch](../../outputs/release-mvp05-2026-09-28/artifacts/fristenrechner-mvp05-steimer-web.zip) | 484’549 Bytes | `be2d81b9a0730ebad9fb3b47a37923f2c0c0aaa2c58c57422dc6b0f53e5a1fa8` |

Der Mirror enthält genau elf Laufzeitdateien mit ursprünglichen relativen Pfaden. Das Webpaket enthält zwölf Dateien einschliesslich lokaler Laufzeitbibliotheken, Lizenzen und unveränderter Hostingkonfiguration. Das SPFx-Paket enthält seine Client-Assets, unterstützt SharePoint und Teams und beantragt keine zusätzlichen API-Berechtigungen.

**Wichtig zum Datenpin:** Beide SPFx-Standardpins zeigen auf den oben bezeichneten unveränderlichen lokalen Datencommit. Die elf Laufzeitdateien sind gegen dessen tatsächliche Git-Blobs geprüft. Der Commit ist aber noch nicht auf GitHub veröffentlicht. Deshalb müssen spätere E-/Q-Tests vor der Publikation ausdrücklich den neuen vollständigen same-site SharePoint-Mirror verwenden. Ein nicht erreichbarer GitHub-Pin oder ein alter Cache darf keinen bestandenen MVP-0.5-Test vortäuschen. Dritt-Tenant-Auslieferung mit Standardquelle erst nach öffentlich verifiziertem Pin.

Das bisherige lokale Paket `0.4.0.1` bleibt unverändert mit SHA-256 `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346`. Vor einer tatsächlichen Installation ist zusätzlich die aktuelle Tenant-Baseline samt Rückfallfähigkeit live zu prüfen.

## 3. Durchgeführte lokale Prüfungen

| Bereich | Ergebnis |
| --- | --- |
| TypeScript | Typecheck bestanden |
| Rechenkern und UI | 1’213 Tests bestanden |
| Statische Webausprägung | zwölf Tests und Build bestanden |
| Python-Datenprüfungen | 142 Tests bestanden, darin 19 Prüfungen der definitiven Artefakte |
| Governance | 24 Python- und 109 Node-Tests, zusätzlich acht Validator-Negativfälle bestanden |
| Datenpromotion | acht Manipulations-/Idempotenztests bestanden |
| SPFx-Quellen und Datenanbieter | 84 Tests bestanden, darunter sämtliche 28 freigegebenen Anbindungen mit beiden modellierten Feiertagsanknüpfungen |
| Tatsächlich kompilierter SPFx-Code und Paket | 42 Tests, Produktionsbuild und CSS-Audit bestanden |
| Historische Nachweise | 68 ursprüngliche Prüfungen plus eine ausdrücklich dokumentierte lebende Testfortschreibung bestanden |
| Lokale Browserstichprobe | Chrome: StPO 28.09.2026, ELG 16.10.2026, DE/FR, Datumserhalt, ausserkantonale Sperre und leeres Datum nach Neuladen geprüft |

Die Prüfzahlen beschreiben unterschiedliche Suiten und werden nicht als Anzahl unabhängiger juristischer Fallabnahmen addiert. Die tatsächlichen freigegebenen Daten laufen gegen alle 77 unveränderten AP19B-Referenzen, einschliesslich beider AVIG-Anbindungen. Die ursprünglichen Falltabellen wurden nicht nachträglich angepasst.

Der SPFx-Build enthält zwei bekannte ESLint-Hinweise zu ausdrücklich mit `null` beschriebenen JSON-Vertragsfeldern. Kein Buildfehler. Der separate Heft/Jest-Schritt findet keine eigenen Jest-Suiten, deshalb stammen die 84 und 42 bestandenen Tests aus den ausdrücklich ausgeführten Quell- und Pakettestbefehlen, nicht aus diesem leeren Jest-Lauf.

Bei der lokalen Datumseingabe trat ein Absturz des eingebetteten Browsers auf. Der unveränderte Build wurde anschliessend in Chrome mit normaler Tastatureingabe erfolgreich geprüft. Ursache nicht abschliessend diagnostiziert. Die [Browsernotiz](../../outputs/release-mvp05-2026-09-28/browser-verification.md) trennt Beobachtung, Erweiterungsfehlermeldung und noch nicht ausgeführte Prüfungen. Dies ersetzt weder die native Datumseingabe noch Kalenderdatei-/Outlooktests in der Zielumgebung.

## 4. Nachweise und Reproduktion

- [Maschineller Artefaktnachweis](../../outputs/release-mvp05-2026-09-28/artifact-verification.json), SHA-256 `877dcf0b225e2cfe84ed386ba95f8b3584ba66fdfe4b6c9b5911c82ad5f7b393`
- [Zusammengeführter lokaler Prüfnachweis](../../outputs/release-mvp05-2026-09-28/local-verification.json), SHA-256 `6b2d23a2c55e42b929d1751b5abab8b10edd6149e8926fa735ac9e750e2dea3d`
- [Dauerhafte SPFx-Baubelege](../../outputs/release-mvp05-2026-09-28/build-evidence/spfx-verification.json) samt Eingabesnapshots und um lokale Benutzerpfade bereinigten Logs
- [Governanceübernahme](../../outputs/release-mvp05-2026-09-28/source-governance-adoption.json), neues Prüfereignis, Register und Index. 57 Registerquellen, 53 Quellen im neuen Ereignis, 82 zusätzliche Katalogquellen separat weiterverwendet
- [Begrenzte Fortschreibung des AP19B-Referenztests](../architektur/mvp05-testvertrag-fortschreibung.md) mit byteidentisch archiviertem Original. Zusätzlich prüfen die MVP-0.4-Korrekturtests jetzt ihre tatsächlichen historischen Metadaten und Paketbytes, nicht die mutable Versionskonfiguration des aktuellen Builds

Die portablen Artefakttests prüfen aus den archivierten Auslieferungsdateien und Belegen. Ein Test führt dies in einem Minimalordner ohne `.work`, Git-Verzeichnis oder aktuelle Produktquellen aus. Original- und Archivhashes redigierter Logs bleiben unterscheidbar. Ein erster neuer SPPKG-Bau ist wegen Buildmetadaten nicht pauschal als bytegleich behauptet. Massgebend ist das konkret gebundene Paket.

```sh
npm run check:source-approval:mvp05
npm run test:data:mvp05
npm run test:artifacts:mvp05
npm run test:source-reviews
npm run check
```

`npm run build:data:mvp05` reproduziert den freigegebenen Datenrelease überschreibungsfrei. `npm run build:spfx:mvp05` baut in einem neuen isolierten Ordner, ohne das frühere Paket zu ersetzen. `npm run build:artifacts:mvp05 -- --spfx-build <relativer-verification.json-Pfad>` inventarisiert die tatsächlichen Dateien und verweigert das Überschreiben bereits bestehender abweichender Ausgaben. Änderungen benötigen einen neuen ausdrücklich bezeichneten Artefaktstand.

## 5. Nächste Haltepunkte

1. Konkrete Installation des oben gebundenen Pakets und Mirrors für E/Q gesondert autorisieren. Aktuelle Instanzen, Konfiguration und Rückfallstand unmittelbar davor prüfen.
2. E-, anschliessend Q-Prüfmatrix aus dem [Deploymentplan](deployment-mvp-05.md) durchführen. Historische AP5-Registerkarte mit altem Datenstand erhalten. Manuelle Q-Abnahme durch David separat festhalten.
3. Publikationsvorprüfung des zusammengehörigen Produkt- und Datenstands, vollständiger Produktcommit, ausdrückliche Push-Freigabe und öffentliche Verifikation des Datenpins. Keine privaten Ausgangsdateien, Backups oder versehentlichen Word-Änderungen veröffentlichen.
4. Green-Befund zur effektiven GET-Auslieferung klären. Erst danach neue konkrete P-Bereitstellungsfreigabe, aktuelles Backup, Vorprüfung, öffentliche Matrix und Betriebsentscheid. Es wurde heute keine neue Supportauskunft eingeholt.

Bestehende Gast- und Outlook-Restpunkte werden nicht stillschweigend geschlossen. Weitere Kantone, übrige Sozialerlasse und eine Kalender-App bleiben ausserhalb dieses Releases. Neue Infrastruktur oder geänderte M365-Berechtigungen sind nicht erforderlich und nicht autorisiert.

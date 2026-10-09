# MVP 0.7 · Definitive lokale Releaseartefakte

Stand: 8. Oktober 2026. R07-B führt die [ausdrückliche lokale Freigabe](freigabe-r07-b.md) aus. Die nachstehenden Artefakte sind gebaut und geprüft. **Keine Installation auf E/Q, kein GitHub-Push, keine P-Bereitstellung und keine Betriebsfreigabe.** Der dokumentierte Betriebsstand bleibt MVP 0.6. Eine neue Livebestandsaufnahme gehört nicht zu diesem lokalen Schritt.

## 1. Zusammengehöriger Release

| Gegenstand | Definitiver lokaler Stand |
| --- | --- |
| Anwendung | `0.7.0` |
| SPFx-Solution und Feature | `0.7.0.0`, unveränderte Produktidentitäten |
| Datenrelease | `2026-10-08-mvp-07-approved.1` |
| Manifest und Mindestconsumer | `7.0.0` |
| Manifest SHA-256 | `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597` |
| Feiertagskatalog | Format `2.0.0`, 479 erhaltene Regeln und zwölf zusätzliche SO-Prozessregeln |
| Regelkalender | Format `3.0.0`, 32 Kalender aus 104 terminalen Verfahrensbindungen, getrennt von 198 Herkunftsentscheiden |
| Übrige Komponenten | Fünf Rechtsprofile `1.0.0`, Spezialregimekatalog `3.0.0`, Sozialverfahrenskatalog `2.0.0` |
| Vollständiger Mirror | 40 Datenartefakte plus Manifest, insgesamt 41 Dateien |
| Lokaler Datencommit | `331ef3e19d43a6b51d91a502acd6b5443071599f`, ausschliesslich die 41 neuen Laufzeitdateien |

Der Datencommit ist lokal erzeugt und bytegeprüft. Er wurde in R07-B nicht veröffentlicht. Der vollständige Produktstand ist noch kein abschliessender Publikationscommit. **Vor einem gesonderten GitHub-Push müssen E/Q die ausdrücklich konfigurierten, bytegeprüften SharePoint-Mirrors verwenden.** Ein im Paket hinterlegter lokaler GitHub-Pin ist noch keine erreichbare Datenquelle.

Die [Releasehinweise](release-notes-mvp07.md) beschreiben die nationale Kalendernutzung für die konkret unterstützten Bundesverfahren und die Datumseingabe aus AP21. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben unverändert auf Bern und 2026–2027 begrenzt. Kein zusätzliches kantonales Verwaltungsverfahren und keine ausserbernische Sozialfreigabe. Die vier Januargrenzen, GR-/NE-Vorbehalte, AI-Behandlung und begrenzte Rolle des historischen Freiburger Praxisbelegs bleiben erhalten.

## 2. Installations- und Bereitstellungsdateien

Alle drei Dateien liegen im [versionierten Artefaktordner](../../outputs/release-mvp07-2026-10-08/artifacts/).

| Datei | Grösse | SHA-256 |
| --- | ---: | --- |
| [SPFx-Paket `fristenrechner-schweiz-0.7.0.0.sppkg`](../../outputs/release-mvp07-2026-10-08/artifacts/fristenrechner-schweiz-0.7.0.0.sppkg) | 291'920 Bytes | `bc8abe70c791f58d2cea9fb66ea568f604bcacae35fec9ae29aadeca5e0c6e09` |
| [SharePoint-Mirror](../../outputs/release-mvp07-2026-10-08/artifacts/fristenrechner-mvp07-sharepoint-mirror.zip) | 218'372 Bytes | `ed603938f86849aec55dd5cdc83c300a8ae6437e4bb8eb62f3d7b5fa7e6753ca` |
| [Statisches Webpaket](../../outputs/release-mvp07-2026-10-08/artifacts/fristenrechner-mvp07-steimer-web.zip) | 606'797 Bytes | `c7c20676154506694267e517791fe2fca73b7e403523e4968eea5ddb3fa0afcf` |

Der historische Paketpfad `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` wurde bewusst nicht überschrieben. Für R07-C ist ausschliesslich das oben bezeichnete neue Paket vorgesehen. Der gesicherte Rückfallkandidat `0.6.0.1` bleibt unter `outputs/release-mvp06-spfx-0.6.0.1-2026-10-01/artifacts/` mit SHA-256 `60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587` erhalten. Seine tatsächliche Eignung zum Hostrückfall ist vor der Installation anhand des dann aktuellen Bestands zu bestätigen.

## 3. Kontrollierte Übernahme

Die Quellenabnahme wurde nicht nachträglich in einen Bauauftrag umgedeutet. [Quellenabnahme](../fachrecht/abnahme-quellen-mvp07.md), [R07-B-Freigabe](freigabe-r07-b.md) und ihre maschinenlesbaren Belege sind getrennt gebunden.

- Die ursprünglichen 81 Registereinträge bleiben erhalten. 155 erforderliche Einträge kommen hinzu. Das neue Prüfereignis erfasst die 232 abgenommenen Referenzen, vier historische zusätzliche Registereinträge bleiben getrennt bestehen.
- Die StPO-/LU-Fassungsnachweise sind als gesonderte Zuordnungen der historischen Belege zur aktuellen Fassung dokumentiert. Historische IDs, Abrufdaten und Prüfereignisse wurden nicht umgeschrieben.
- Der Feiertagskatalog erhielt die freigegebene Releasebindung. Alle 32 Kalender wurden mit dem tatsächlichen neuen Kataloghash deterministisch neu projiziert. Die bestehenden fachlichen Kalenderregeln wurden nicht verändert.
- Alle 50 Sozialfreigabebindungen verweisen auf den neuen Release und dessen tatsächliche Komponentenhashes. Keine Erweiterung von Fachregeln oder Freigabegrenzen.
- Die fünf Rechtsprofile und der Spezialregimekatalog sind byteidentisch übernommen. Die drei neuen kanonischen Schemas entsprechen bytegenau den bestätigten Implementationskopien.
- Der tatsächliche Format-7-Consumer verarbeitet die vollständigen freigegebenen Manifest- und Artefaktbytes, einschliesslich Kalenderlaufzeit und verbindlicher Auswahlregeln.

## 4. Prüfungen und Nachweise

Der [lokale Gesamtnachweis](../../outputs/release-mvp07-2026-10-08/local-verification.json) bindet die abgeschlossenen Läufe, ihre Originalprotokolle, Vorversuche und die tatsächlichen Artefakte. Die archivierten Protokolle sind lokale private Nachweise. Ihre öffentliche Eignung ist später gesondert zu prüfen.

| Prüfung | Nachweis |
| --- | --- |
| TypeScript-Gesamtprüfung | bestanden |
| Rechenkern und Oberfläche | 2'264 Tests bestanden, keine übersprungenen oder abgebrochenen Tests |
| Statischer Webbuild | 16 Tests, Preview-Build und normaler Produktionsbuild bestanden |
| SPFx-Quellen und Provider | 186 Tests bestanden |
| Tatsächlich erzeugtes SPFx-Paket | 83 Tests bestanden, zusätzlich Produktionskompilierung und CSS-Audit |
| Daten und Quellenverwaltung | 303 Python-Datentests, 30 Python-Governance-Tests und 262 Node-Governance-Tests bestanden. Zusätzlich generischer Quellenvalidator mit acht Negativtests, unabhängiger Validator der echten 41 Laufzeitdateien sowie vollständige Prüfung von Quellenabnahme und R07-B-Autorität |
| Artefaktarchive | 19 Prüfungen bestanden, darunter isolierte Prüfung ohne `.work`, Git-Historie oder aktuelle Produktdateien. Diese Tests sind im vollständigen Datenlauf enthalten und werden nicht zusätzlich gezählt |
| Hash-/Bestandsvergleich | 191 archivierte Buildbelege intakt, Mirror, lokaler Git-Pin und Diskrelease für alle 41 Laufzeitdateien byteidentisch |
| Lokaler Browser | [Sichtbare Stichproben und Grenzen](../../outputs/release-mvp07-2026-10-08/browser-verification.md), exakt dieselben JavaScript-, CSS- und Manifestbytes wie im Webarchiv |

Die lokalen Browserstichproben umfassen Bern und Tessin, den divergierenden SG-Januarfall mit Resultat-/Exportsperre, DE/FR, Datumskurzformen, sofortige Entwertung eines alten Resultats bei Bearbeitung sowie eine schmale Ansicht ohne horizontalen Überlauf. Das ist kein Nachweis für reale iOS-Geräte oder für die SharePoint-/Teams-Hosts.

### Nachgeführte Prüfhilfen, ohne Produktänderung

Ein erster Typecheck enthielt eine unvollständige Typabsicherung in einem neu ergänzten Test. Spätere Daten-/Governance-Läufe fanden veraltete Testannahmen zur Abwesenheit neuer kanonischer Schemas, zur alten Registergrösse und zur textuellen Erkennung eines historischen Modellimports. Die ursprünglichen Teststände bleiben archiviert. Aktuelle Erwartungen und historische Referenzen wurden getrennt, die korrigierten Läufe vollständig wiederholt. Diese Vorversuche werden nicht als bestanden ausgegeben.

Der erste abschliessende portable Artefaktcheck erwartete irrtümlich den Bezeichner `mvp07CalculationData`. Der normale Produkteinstieg verwendet korrekt `mvp07Runtime.data` **und** `mvp07Runtime.calendarRuntime`. Ausschliesslich diese Prüfassertion wurde präzisiert. **Produktcode, Daten und alle drei Artefakte blieben unverändert.** Der [ursprüngliche Artefaktnachweis](../../outputs/release-mvp07-2026-10-08/artifact-verification.json) ist deshalb immer zusammen mit dem [append-only Korrekturbeleg](../../outputs/release-mvp07-2026-10-08/artifact-verifier-correction.json) zu lesen. Original und korrigierte Prüfhilfe sind jeweils bytegebunden erhalten. Die erneute portable Prüfung ist bestanden.

## 5. Noch nicht nachgewiesen oder freigegeben

- R07-C: Konkrete Installation, frische Zielkonfigurationen und Rückfallstand, vollständige Mirrors, tatsächlicher Erstabruf, Storage-/Cachetrennung, historische AP5-Ansicht, reale Geräte- und Gastprüfung sowie manuelle Q-Abnahme.
- Gespeicherte Kalenderdownloads DE/FR auf den tatsächlichen Hosts. Der lokale Browser gab beim Export kein auswertbares Downloadereignis zurück. Eine gespeicherte lokale ICS-Datei ist nicht bestätigt. Automatisierte Inhaltsprüfungen sind davon getrennt bestanden. Kein Outlook-Import wurde vorgenommen.
- Noch fehlende reale iOS-Teams-, VoiceOver- und 200-Prozent-Zoom-Nachweise bleiben in der Hostmatrix sichtbar. Der akzeptierte Magic-Keyboard-Umgebungsbefund wird nicht in eine allgemeine Gerätefreigabe umgedeutet.
- R07-D: Publikationsvorprüfung einschliesslich ausdrücklicher Trennung privater Quellen-Vollaudits von öffentlichen Standardtests, GitHub-Freigabe und eigener P-Auftrag. Keine private Nachweisdatei oder fremde lokale Änderung wird pauschal mitveröffentlicht.
- Vor P: Frische Sicherung, HEAD-/GET-/Cacheprüfung und erneuter begrenzter Risikoentscheid. Die unveränderte `.htaccess` beweist keine Behebung des bekannten Hostingbefunds. Der frühere MVP-0.6-Entscheid gilt nicht automatisch für MVP 0.7.

Nächster Schritt ist R07-C gemäss [Deploymentplan](deployment-mvp-07.md), beginnend mit einer an dieses Paket und die konkreten bestehenden E-/Q-Ziele gebundenen Installationsvorlage. Berechtigungen, Richtlinien, AP21-Testapps und zusätzliche Installationsziele bleiben ausserhalb dieses Auftrags.

# MVP 0.7 · Lokale technische Vorbereitung

Stand: 8. Oktober 2026. **Die abgenommenen Eingänge und die frische lokale Produktregression sind geprüft. Der Quellen-Inhaltsabgleich ist noch nicht abgeschlossen. Kein definitiver MVP-0.7-Build und keine operative Aktivierung.** Auftrag und anschliessende Haltepunkte stehen im [Release- und Deploymentplan](deployment-mvp-07.md).

## Tatsächlich geprüfter Stand

| Kontrolle | Ergebnis |
| --- | --- |
| AP21-Abnahmekopie | 192/192 Dateien stimmen nach SHA-256 und Byteanzahl mit dem Abnahmeregister überein |
| AP22C3-Abnahmekopie | 204/204 Dateien stimmen nach SHA-256 und Byteanzahl überein |
| Format-7-Kandidatenbündel | Manifest und alle 40 Artefakte intakt, weiterhin Kandidat ohne Quellenreleasefreigabe |
| Aktueller Stand gegenüber AP21 | Keine abweichende gebundene technische Datei. Die sechs vor diesem Vorbereitungsschritt fortgeschriebenen lebenden Markdown-Dateien sind ausdrücklich von ihren archivierten Vorbildern getrennt |
| Aktueller Stand gegenüber AP22C3 | Technische Weiterentwicklung ist durch AP21 gedeckt. Ein später neu erzeugter Arbeitsbuild ersetzt den archivierten C3-Prüfbuild nicht |
| Typprüfung | Am 8. Oktober 2026 erneut bestanden, Exit 0 |
| Standardprodukttests | 2'248/2'248 bestanden, keine Fehler, Abbrüche, übersprungenen Tests oder TODOs |
| Schutzprüfung während des Testlaufs | 1'362 erfasste Dateien vor/nach dem Testlauf byteidentisch |
| Laufzeitdateien gegenüber Git | Alle 48 geänderten/neuen Dateien unter `src` und `spfx/src` durch AP21/C3, die AP22C2-Abnahme oder bytegleiche MVP-0.6-Kalenderkopien nachvollziehbar |

Die Typ- und Produkttests wurden mit der vorhandenen Node-22.23.2-Toolchain ausgeführt. Der Produktlauf dauerte 132,54 Sekunden und lief vom 8. Oktober 2026, 20.08.21 Uhr bis 20.10.33 Uhr MESZ. Der bestehende Previewtest hat nur den ungebundenen Arbeitsordner `.work/ui-preview` neu erzeugt. Auch dessen acht Dateien waren danach bytegleich. Diese Ergebnisse sind kein neuer SPFx-Pakettest und kein Nachweis eines bereits gebauten oder bereitgestellten MVP-0.7-Releases.

## Bindungen

| Beleg | SHA-256 |
| --- | --- |
| [AP21-Abnahmeregister](../../outputs/ap21-abnahme-2026-10-08/receipt.json) | `f5cfc02c2f7d9b8f4704619d8d8b1172fafd7ef428a2605fc2c35c2a01de090a` |
| [AP22C3-Abnahmeregister](../../outputs/ap22c3-abnahme-2026-10-08/receipt.json) | `399186439f8a44a4d604042fc48191dcc3646d5d856568ff6e9b565dfb25ca31` |
| [Kandidatenmanifest](../../outputs/ap22c3-2026-10-08/bundle/manifest.json) | `b290ece2d105c606b3de8154edade57fcbaf2ff978e42b05b08561fb1c40a0f6` |
| [MVP-0.6-Manifest](../../data/releases/2026-10-01-mvp-06-approved.1/manifest.json) | `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |
| Aktueller Preflight `summary.json` | `2efff98c989ffce7fa8c964cd2a3754fc169576631a0a4b4d8bebf398c1d1ad3` |
| Aktueller Produktlauf `product-tests.log` | `a85ecd29682f94c350e1912022e9ce3d47c9a779c3c2ebdb462dcb3ad2feff42` |
| Aktuelle Laufzeitzuordnung `runtime-coverage.json` | `66caeee670f3a63befcefe57d4f1db7447757a83935861eca8cec16b975bb6b2` |

Die neuen Rohprotokolle stehen unter `.work/mvp07-preflight-2026-10-08/`. Sie enthalten lokale technische Pfade und sind nicht pauschal für das öffentliche Repository freigegeben. Die vollständigen AP21-/AP22C3-Abnahmekopien bleiben am bestehenden Ort. Insbesondere private Quellstandsarchive und Betriebsbelege werden nicht blind in einen öffentlichen Releaseordner kopiert.

## Konkrete technische Anschlussarbeit

Der Consumer unterstützt den bestätigten Format-7-Vertrag bereits. Die noch erforderlichen Arbeiten betreffen den kontrollierten Übergang vom Referenzkandidaten zum freigegebenen Release:

- Neue MVP-0.7-Promotion mit Katalogfreigabe, erneuter Projektion aller 32 Kalender, Neubindung der 50 Sozialfreigaben und abschliessender Manifestversiegelung.
- Neues Format-7-Produktdatenmodul aus den tatsächlichen JSON-Bytes und Umstellung des normalen Web-/SPFx-Einstiegs erst nach Freigabe. Referenzbuilds bleiben Referenzbuilds.
- Kanonische Schemaablage, konsistente Versionen `0.7.0` / `0.7.0.0` und gemeinsame vollständige Datenpins. Alte Produktidentitäten erhalten.
- Neue unabhängige Release-, Paket-, Mirror- und Buildprüfer für 40 Artefakte plus Manifest. Die bisherigen MVP-0.6-Prüfer erwarten zehn Artefakte.
- Format-7-fähige Quelleninventarisierung. Das alte Indexwerkzeug deckt nicht sämtliche Aktivierungsreferenzen ab.
- Gezielte Fortschreibung der Tests des aktuellen Produkteinstiegs nach Sicherung ihrer Vorbilder. Historische Daten-/Consumerverträge bleiben unverändert prüfbar.

Die [Releaseprüfmatrix](deployment-mvp-07.md#5-releaseprüfmatrix) führt die verbleibenden direkten Teams-/iOS-Teams-Nachweise, VoiceOver/Zoom, weiteren Datumsrollen, tatsächliche Exportinvalidierung, Defaults-/Cachemigration, AP5 und späteren P-Headervergleich auf. Der bereits akzeptierte Magic-Keyboard-Befund wird nicht erneut zum offenen Produktfehler erklärt.

## Reproduzieren und Statusgrenze

Die frischen Basisprüfungen wurden mit den bestehenden Befehlen ausgeführt:

```sh
node node_modules/typescript/bin/tsc --noEmit
node scripts/run-standard-tests.mjs product
```

Das [Quelleninventar und der Prüfplan](../fachrecht/quellenpruefplan-mvp07.md) sind keine neue fachliche Quellenabnahme. Produktive Datenreleases, Pins, Versionen, das aktive Quellenregister und dessen Index bleiben unverändert. Kein GitHub-Push, Tenantzugriff, Paket-/Mirrorupload, Outlook-Eingriff, Hostingwechsel oder Entfernen von Testansichten/App-Paketen wurde in diesem Vorbereitungsschritt vorgenommen.

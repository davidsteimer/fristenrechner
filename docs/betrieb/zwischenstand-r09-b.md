# R09-B lokaler Zwischenstand

Stand: 18. Oktober 2026. **Umsetzung teilweise ausgeführt, am zusätzlichen Quellenvalidator-Prüfvertrag angehalten. R09-B ist nicht abgeschlossen.** Keine Installation, kein Upload, kein GitHub-Push und keine Änderung am laufenden E-/Q-/P-Betrieb.

## Bereits ausgeführt

- Die [R09-B-Ausführungsfreigabe](freigabe-r09-b.md) ist separat dokumentiert. 630 Ausgangsdateien sind bytegebunden gesichert.
- Das Quellenregister wurde ausschliesslich um die acht freigegebenen Quellen auf 255 Einträge ergänzt. Die 247 bisherigen Einträge und die sechs früheren Prüfereignisse bleiben unverändert. Das neue Prüfereignis bildet die 251 Kennungen des abgenommenen R09-A2-Umfangs ab.
- Der Format-9-Datenrelease `2026-10-18-mvp-09-approved.1` ist lokal übernommen. 24 Übernahmetests und 62 unabhängige Python-Prüfungen sind bestanden.
- Genau ein lokaler Datencommit wurde erstellt: `0ccc4b9178503ede051964149a4b17efab8d0cf9`, auf Ausgangs-HEAD `c37c11bc9fbf8241535d202d54c3499d2f4c3350`. Er enthält ausschliesslich die 42 freigegebenen Laufzeitdateien. Der Git-Index ist anschliessend leer.
- Normale Produktversionen, Einstieg und Datenpins wurden im erlaubten Umfang auf MVP09 eingestellt. Abhängigkeiten, Rechenkern, UI-Fachregeln, UX-#50-Korrektur und Paketidentitäten sind gegenüber dem freigegebenen Ausgangsstand unverändert.
- Die elf bezeichneten lebenden Testverträge sind angepasst. Der historische MVP08-Webnachweis prüft nun das tatsächlich archivierte MVP08-Webpaket, nicht einen Neubau aus dem aktuellen Einstieg.

## Bereits bestandene Teilprüfungen

| Prüfung | Tatsächliches Ergebnis |
| --- | --- |
| Datenübernahme und unabhängige Datenprüfung | 24 und 62 Prüfungen bestanden |
| Aktuelle TypeScript-Typprüfung | Bestanden |
| Standard-Governance (JavaScript) | 289 Prüfungen bestanden, zusätzlich in der isolierten Portabilitätskopie reproduziert |
| Zusätzliche Python-Governance-Diagnose | 34 Prüfungen in der isolierten Kopie bestanden, kein weiterer Änderungsbedarf festgestellt |
| Historische R09-Quellennachweise am archivierten Ausgangsstand | 81 Prüfungen bestanden |
| Neuer normaler MVP09-Webeinstieg | 12 Prüfungen bestanden |
| Tatsächlich archiviertes MVP08-Webpaket | 5 Prüfungen bestanden |
| Umfangsabgrenzung der Tests | 4 Prüfungen bestanden |
| Kontrolle der gebundenen Produktänderungen | 630 Dateien geprüft, 607 unverändert und 23 ausdrücklich erlaubte Änderungen |
| Öffentliche Datenintegrität | Tatsächlicher Release und seine Schemabindungen geprüft |
| Recovery-Bau mit MVP08-Funktionsumfang | Paket `0.9.0.1` erstellt, 6 Werkzeugtests, 204 historische Quelltests, 107 Prüfungen am tatsächlichen Paket und 10 Recoverytests bestanden |

Diese Ergebnisse sind Teilnachweise, kein vollständiger Produkt-, Paket-, Recovery- oder Betriebsnachweis. Insbesondere ist die JavaScript-Governance-Prüfung nicht mit der vollständigen Python-Quellenvalidierung gleichzusetzen.

## Halt und vorgeschlagene Bereinigung

Die vollständige Quellenvalidierung weist die bereits fachlich geprüfte Quelle `SRC-AP23E1-AR-MATERIAL-20180703` zurück, weil der exakte amtliche Hostname `ar.ch` in ihrer technischen Zulassungsliste fehlt. Der Fehler ist im normalen und im isolierten Prüfverzeichnis reproduziert. Kein Beleg für einen Fehler der Fristberechnung oder eine Änderung der Rechtsgrundlage. Der konkrete Prüflauf bleibt als fehlgeschlagen erhalten.

Der [enge Nachtrag zum Quellenvalidator](nachtrag-r09-b-quellenvalidator.md) liegt zur gesonderten Freigabe vor. Der Validator ist unverändert. Es wird weder eine Quelle umbenannt noch eine URL ersetzt, um die Prüfung zu umgehen.

Die normale SPFx-Paketierung, die Versiegelung der definitiven Mirror-/Webarchive, der vollständige Regressionsabschluss und der tatsächliche Rundlauf MVP09 → MVP08-Recovery → MVP09 bleiben offen. Der bereits gestartete isolierte Recovery-Bau ist abgeschlossen und separat protokolliert. Es läuft keine weitere Hintergrundprüfung. Auch dieses bestandene Recovery-Teilpaket schliesst R09-B nicht ab und erlaubt keinen Einsatz.

Der Wiederherstellungskandidat `0.9.0.1` hat SHA-256 `08c5e67e535cd3e04d962698e7dcb6bbe989f098d75f2b21aebe3226d95db94d`. Er verwendet den tatsächlichen MVP08-Funktionsumfang, einschliesslich des früheren Datumsfelds. Die geprüften neuen LU-/ZG-/AR-Standards bleiben beim Lesen, Speichern und Zurücksetzen geschützt. Der vollständige Wechsel zurück auf das noch nicht paketierte MVP09 ist davon getrennt und offen. 845 Nachweisdateien sind archiviert. Der erste Fehlversuch mit fünf Fehlern in neuen Prüfhilfen bleibt erhalten. Nur diese neuen Prüfhilfen wurden vor dem erfolgreichen Wiederholungslauf korrigiert, Produktcode und historische Eingänge blieben unverändert.

## Gebundene Nachweise

- [Ausführungsfreigabe und gesicherte Ausgangsdateien](../../outputs/release-mvp09-2026-10-18/r09b-execution-approval.json)
- [Unabhängige Datenprüfung](../../outputs/release-mvp09-2026-10-18/data-verification.json)
- [Tatsächlicher lokaler Datencommit](../../outputs/release-mvp09-2026-10-18/local-data-pin.json)
- [Fehlgeschlagener Gesamtprüflauf](../../outputs/release-mvp09-2026-10-18/local-checks/run-UmilLu/verification.json)
- [Konkrete Fehlermeldung](../../outputs/release-mvp09-2026-10-18/local-checks/run-UmilLu/sources.log)
- [Isolierter Gegenversuch und zusätzliche Python-Diagnose](../../outputs/release-mvp09-2026-10-18/portability-standard-no-private-20261018-01/blocked-status.json)
- [Historische Quellenprüfungen am gesicherten Ausgangsstand](../../outputs/release-mvp09-2026-10-18/historical-source-tests/r09b-historical-sources-XUmluH.json)
- [Abgeschlossener lokaler Recovery-Teilnachweis](../../outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/artifact-verification.json)

Die historischen R09-A2-/E3-Nachweise und die gebundene ursprüngliche R09-B-Vorlage bleiben unverändert. Die nächste zulässige Weiterarbeit ist die gesonderte Entscheidung über den Validatornachtrag, nicht R09-C oder eine Installation.

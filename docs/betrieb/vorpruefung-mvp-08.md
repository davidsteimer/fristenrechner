# MVP 0.8 Lokale technische Vorprüfung

Stand: 15. Oktober 2026. **R08-A1 ist abgeschlossen.** AP23D3 ist abgenommen und gesichert, die frische technische Regression ist bestanden und das vollständige Quelleninventar liegt vor. Der nächste Schritt ist der Inhalts-/Fassungsabgleich R08-A2. Noch keine neue Quellenfreigabe, Datenpromotion oder definitive Releaseartefakte.

## Abnahme und Eingangsschutz

Die [AP23D3-Abnahme](../fachrecht/abnahme-ap23d3.md) bindet ein separat geprüftes Archiv mit 488 Dateien. Darin enthalten sind die vollständigen 42 Kandidatendateien, 255 technische Eingaben, tatsächliche Web-/SPFx-Artefakte sowie die unveränderten ursprünglichen Test- und Browsernachweise. Der frühere D2-Abnahmebestand bleibt separat erhalten.

Der neue Vorprüfungslauf prüfte die 255 technischen Eingänge gegen die akzeptierten D3-Hashes und überwachte insgesamt 562 Dateien vor und nach den Tests. Alle 562 blieben während dieses Laufs byteidentisch. Dazu gehören freigegebene Daten, Quellenverwaltung, Schemata, Kandidat, ursprüngliche D2-/D3-Nachweise sowie die erfassten Produkt- und Konfigurationsdateien.

Erst nach erfolgreichem Lauf wurden die lebenden Einstiege nachgeführt. Unter den zwölf direkt gebundenen D3-Artefakten änderten sich ausschliesslich `README.md`, `docs/architektur/README.md` und `docs/fachrecht/README.md`. Zusätzlich erhielt der allgemeine Dokumentationsindex einen aktuellen Einstieg. Die gesicherten Vorbilder und der D3-Integrationsbericht bleiben unverändert. Die 562-Dateien-Prüfung ist eine Aussage über den Testlauf, nicht über unveränderte lebende Dokumentation nach dessen Abschluss.

## Frisch ausgeführte Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript-Gesamtprüfung | Bestanden |
| Reproduktion des unveränderten AP23D2-Kandidaten | Bestanden |
| Produktregression | 2529 von 2529 Tests bestanden, keine Fehler, Abbrüche, übersprungenen Tests oder TODOs |
| Host-Lifecycle | 20 von 20 Tests bestanden, keine Fehler oder Auslassungen |
| Historische AP5-Ergebnisse und Rechenspuren | 1584 von 1584 Vergleichen identisch |
| Schutz der erfassten Dateien während des Laufs | 562 von 562 byteidentisch |
| Abnahmearchiv und seine Sicherungslogik | 488 Archivdateien lesend nachgeprüft, zehn Positiv-/Negativtests bestanden |
| Quelleninventar und seine Prüfregeln | Zehn Positiv-/Negativtests bestanden, insbesondere fehlende/mehrdeutige Quellen, unvollständiger Referenzgraph und unerlaubte Statushochsetzung |

Der frische Produktlauf dauerte rund 156 Sekunden. Alle Schritte verwendeten die vorhandene Node-22.23.2-Toolchain. Der bestehende Previewtest erzeugte seinen ungebundenen Arbeitsbuild unter `.work/ui-preview`. Es wurde kein definitiver Releasebuild erzeugt. Die separat archivierten D3-SPFx-, Web- und Browsernachweise wurden in R08-A1 nicht nochmals als frische vollständige Build-/Browserprüfung ausgegeben. Reale SharePoint-/Teams-, Geräte- und Gastprüfungen gehören erst zum späteren Vollzug.

## Quelleninventar und Wiederverwendungsgrundlagen

Das neue Inventar enthält 243 Quellenreferenzen und 2078 konkrete Referenzstellen. Davon stammen 232 Quellen und 2020 Referenzstellen unverändert aus MVP 0.7. Elf AP23B-Quellen ergänzen 58 administrative Referenzstellen. Die Manifestliste umfasst lediglich 120 IDs und wäre als alleiniger Prüfbestand unvollständig.

149 Quellen haben positive oder gemeinsam verwendete Referenzstellen, vier sind ausschliessliche Ausschlussbelege und 90 bleiben ergänzend beziehungsweise dem Monitoring zugeordnet. Diese strukturelle Einordnung ist keine positive rechtliche Fallfreigabe. Das aktive Register enthält 236 Einträge. Elf neue Referenzen fehlen dort noch, vier historische zusätzliche Einträge bleiben getrennt erhalten. Die spätere Übernahme darf keine dieser vier Referenzen stillschweigend löschen.

266 im MVP07-Gesamtbericht gebundene historische Belegdateien wurden frisch auf Integrität geprüft. **Das ist keine neue inhaltliche Quellenprüfung und noch keine beschlossene Wiederverwendung für MVP 0.8.** Bei den neuen AP23B-Bezügen werden der abgenommene Fachbericht und seine Aussagegrenzen gebunden. Eine nicht vorhandene archivierte Originaldatei wird nicht rekonstruiert oder als früher bytegeprüft ausgegeben.

Der [Quellenprüfplan](../fachrecht/quellenpruefplan-mvp08.md) beschreibt den nächsten Inhalts-/Fassungsabgleich, die Wiederverwendungsbegründungen und den separaten Abnahmebericht. Es wurden in diesem Vorbereitungsschritt keine amtlichen Quellen neu abgerufen oder inhaltlich neu geprüft.

## Gebundene Nachweise

| Beleg | SHA-256 |
| --- | --- |
| [AP23D3-Abnahmeregister](../../outputs/ap23d3-abnahme-2026-10-15/receipt.json) | `e3641a460497a0047d7968de106575887757f4d8c619d396359ebd62bfb12966` |
| [Frischer technischer Vorprüfungslauf](../../outputs/release-mvp08-2026-10-15/preflight.json) | `1171bb6dfdbe97d5eeb655698a94f892d2af4719c0462b1a68ee7f12b06859c9` |
| [Vollständiges Quelleninventar](../../outputs/release-mvp08-2026-10-15/sources/source-inventory.json) | `6d40975ddf0fc334a43ae7444033037ab9809a90763be2461dc21b139d589526` |

Die Rohprotokolle des frischen Laufs liegen unter `.work/mvp08-preflight-2eHaZJ/`. Das Quelleninventar bindet auch private historische Rohbelege. Weder diese Ordner noch das Abnahmearchiv sind pauschal zur öffentlichen Publikation freigegeben. Eine spätere Positivliste trennt öffentliche Nachweise vom lokalen Vollaudit.

Lesende Nachprüfung und isolierte Tests:

```sh
node scripts/archive-ap23d3-acceptance.mjs --check
node scripts/inventory-mvp08-sources.mjs
node --test tests/governance/ap23d3-acceptance.test.mjs tests/governance/mvp08-source-inventory.test.mjs
```

Der frische Lauf wurde mit `node scripts/prepare-mvp08-local.mjs --run` ausgeführt. Seine Ausgabe wird nicht überschrieben. Ein erneuter Release-Regressionslauf erhält einen neuen Nachweisort. Die heutigen Produktzahlen werden nicht zu den historischen D3-Zahlen addiert.

## Technischer Anschluss nach der Quellenabnahme

Die bestehende Format-8-Laufzeit verarbeitet bereits vollständige gemeinsame Kontexte. Die noch nötigen Arbeiten sind Releasebindungen und Nachweise, keine erneute Fachmodellierung: neue Quellenereignisse, Neuprojektion der Kalender, 50 Sozial- und zwölf administrative Pfadbindungen, kanonische Schemas, normale Produkteinstiege und vollständige Versions-/Pinbindung. Neue Prüfer müssen 42 Laufzeitdateien berücksichtigen.

Vor E/Q braucht es einen tatsächlich geprüften Wiederherstellungskandidaten für MVP 0.7 mit höherer Paketversion, geschützten Defaults 5 und unverändertem AP5-Pin. Details und Freigabereihenfolge stehen im [Releaseplan](deployment-mvp-08.md).

Rechenlogik, Rechtsdaten, aktive Quellenverwaltung, Produktversionen, Pins, Betriebspaket und bestehende Mirrors bleiben unverändert. Keine Commitbildung, GitHub-Publikation, M365-Installation oder Hostingänderung in R08-A1.

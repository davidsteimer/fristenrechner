# Lokaler Buildnachweis SPK-SPFX-01

| Merkmal | Nachweis |
| --- | --- |
| Datum | 29. August 2026 |
| Plattform | macOS arm64 |
| Node.js | 22.23.2 |
| npm | 10.9.8 |
| SPFx | 1.23.2 |
| TypeScript | 5.8.3 |
| React und React DOM | 17.0.1 |
| Fluent UI React | 8.106.4 |
| Heft | 1.2.17 |
| Component-ID | `69cfde67-2e4a-4fed-83ea-5d7ceb8df239` |
| Paket | `sharepoint/solution/fristenrechner-spfx-spike.sppkg` |
| Paketgrösse | 135557 Bytes |
| Paket SHA-256 | `558dd7c5c227650b251046e467e38a5c5ed2f59ad2b5147e09aebbf012d763f1` |
| `package-lock.json` SHA-256 | `968d12626ab3db415a062d939cb90924e0819dffbf214a68d90c8a3204d4953b` |

## Ausgeführte Nachweise

1. `npm ci --ignore-scripts` installierte 1329 Pakete frisch aus dem Lockfile.
2. `npm test` führte sechs automatisierte Spike-Tests aus. Alle sechs bestanden.
3. `npm run build` führte die Tests erneut aus, kompilierte Sass und TypeScript, prüfte ESLint, erstellte den Produktionsbundle und paketierte das `.sppkg`. Der Abschluss enthielt keine Warnung und keinen Fehler.
4. `unzip -t` prüfte alle 21 Paketeinträge erfolgreich.
5. `npm audit --omit=dev` meldete null bekannte Schwachstellen in den produktiven Abhängigkeiten.
6. Der vollständige `npm audit` meldete neun moderate Befunde in transitiven Entwicklungsabhängigkeiten der SPFx-Buildtoolchain. `npm audit fix --force` würde `@microsoft/spfx-heft-plugins` auf 1.12.0 zurückstufen und die festgelegte SPFx-1.23.2-Toolchain brechen. Deshalb wurde kein erzwungener Fix ausgeführt.
7. Die Paket- und Quellkonfiguration enthält keine `webApiPermissionRequests`, keine Graph-Adresse, keine Entra-Client-ID und kein Geheimnis.
8. Beide Teams-Symbole wurden mit `scripts/generate-teams-icons.py` neu und reproduzierbar im Steimer-Design erzeugt. Die PNG-Dateien enthalten ausschliesslich die Pflichtblöcke `IHDR`, `IDAT` und `IEND` und sind im geprüften Paket eingebettet.
9. Der technische Paketname wurde nach der realen SharePoint-Validierung ohne typografischen Gedankenstrich neu gebaut. SharePoint akzeptierte das korrigierte Paket als gültig und aktivierte Version 1.0.0.0.

Die sechs automatisierten Tests belegen:

- vollständige Schema-, Prüfsummen-, Referenz- und Abdeckungsvalidierung des freigegebenen AP5-Release
- byteidentische Resultate zweier providerneutraler Testprovider
- Ablehnung eines manipulierten Artefakts
- unveränderten letzten Aktivstand nach einem fehlgeschlagenen Aktualisierungsversuch
- keine Erstaktivierung bei fehlendem Artefakt
- Ablehnung einer unbekannten Format-Hauptversion
- persistente und atomare Speicherung von Release und Aktivzeiger in einer IndexedDB-Transaktion

Die SPFx-Heft-Pipeline führt zusätzlich ihren Jest-Schritt aus. Die projektspezifischen Tests liegen bewusst in der separaten, vor dem Heft-Build ausgeführten Node-Testpipeline, weil sie echte Releasebytes und eine IndexedDB-Implementierung prüfen.

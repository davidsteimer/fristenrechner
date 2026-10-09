# Fristenrechner Schweiz für SharePoint und Teams

Dieser Ordner enthält die produktive SPFx-Lösung. Dasselbe WebPart und dasselbe `.sppkg` laufen auf modernen SharePoint-Seiten und als direkte Microsoft-Teams-Kanalregisterkarte.

**Stand 9. Oktober 2026:** Anwendung `0.7.0`, Paket `0.7.0.2` und Datenrelease `2026-10-08-mvp-07-approved.1` sind auf den vier bestehenden E-/Q-Instanzen installiert. Die [Q-Abnahme](../docs/betrieb/abnahme-q-mvp07.md) schliesst R07-C einschliesslich menschlicher Geräte-/Gastbestätigung. F08-Nachweisort und T09-Wiederverwendung bleiben qualifiziert. Der [Vollzugsnachweis](../docs/betrieb/eq-vollzugsnachweis-mvp07-0702.md) trennt tatsächliche Hostprüfungen und frühere Belege. GitHub-Publikation und P-Bereitstellung von MVP 0.7 benötigen weiterhin eigene ausdrückliche Freigaben. Öffentlich dokumentiert ist [MVP 0.6](../docs/betrieb/produktionsbereitstellung-mvp06-2026-10-01.md).

## Toolchain

| Baustein | Gebundener Stand |
| --- | --- |
| Node.js / npm | `22.23.2` / `10.9.8` |
| SharePoint Framework | `1.23.2` |
| React und React DOM | `17.0.1` |
| Fluent UI React | `8.106.4` |
| TypeScript | `5.8.3` |
| Heft | `1.2.17` |

Lockdateien binden die konkret installierten Versionen. Dies ist der nachgewiesene Bau, keine Empfehlung zum jeweils neuesten Toolstand. Vor einem Upgrade ist die offizielle SPFx-Kompatibilitätsmatrix separat zu prüfen.

## Quellstruktur

- `../src/core/` und `../src/ui/` sind die führenden Quellen des Rechenkerns und der hostneutralen Oberfläche.
- `src/core/` enthält Provider, Release-Service, Format-1-bis-7-Validierung und konfigurationsgebundenen Browsercache.
- `src/webparts/fristenrechner/` enthält den dünnen SPFx-Hostadapter, keine eigene Fristenlogik.
- `src/product/` und `src/core/schemas/` werden vor Test und Build mechanisch synchronisiert, nicht separat gepflegt. MVP07 verwendet Manifest/Mindestconsumer `7.0.0`, Regelkalender `3.0.0`, Feiertagskatalog `2.0.0`, Rechtsprofile `1.0.0`, Spezialregimekatalog `3.0.0` und Sozialverfahrenskatalog `2.0.0`.

Damit gibt es keine zweite fachliche Quelle für Microsoft 365. Die Darstellungskorrektur `0.7.0.2` lässt lange Dropdowntexte mehrzeilig erscheinen. Die [begrenzte Delta-Prüfung](../docs/betrieb/darstellungskorrektur-mvp07-0702.md) weist unveränderte Auswahlhandler, Rechenlogik, Rechtsdaten, Pins und Produktidentitäten nach.

## Datenquellen und Cache

Die WebPart-Konfiguration bietet zwei Provider:

- `GitHub`, gepinnt auf Datencommit `331ef3e19d43a6b51d91a502acd6b5443071599f` und `data/releases/2026-10-08-mvp-07-approved.1`. Dieser neue MVP07-Pin ist noch nicht veröffentlicht. Der Modus setzt dessen gesondert freigegebene Veröffentlichung und öffentlichen Rohbytevergleich voraus.
- `SharePoint-Mirror`, als serverrelativer Releaseordner auf derselben SharePoint-Website. E/Q verwenden ihre vollständigen eigenen Mirrors.

Der Mirrorpfad ist standardmässig leer. Für Teams ist der Mirror auf der zugehörigen Teamsite bereitzustellen und in der jeweiligen Registerkarte zu konfigurieren. Cross-Site-Pfade werden abgewiesen. Der vollständige MVP07-Mirror umfasst **41 Dateien**: Manifest, 32 Kalender, fünf Profile sowie Feiertags-, Spezialregime- und Sozialverfahrenskatalog. Die [Dritt-Tenant-Anleitung](../docs/betrieb/installation-und-betrieb-dritttenants.md#62-variante-b-tenantinterner-sharepoint-mirror) enthält alle tatsächlichen Pfade und Archivprüfsumme. Manifest SHA-256: `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597`.

Ein Release wird nur als `approved` nach vollständiger Schema-, Grössen-, Hash-, Referenz- und Abdeckungsprüfung aktiviert. Alle Kalender eines Format-7-Releases verwenden Format 3. Der Consumer unterstützt historische Formate, der alte MVP06-Consumer jedoch kein Format 7. Ein Paketupdate ersetzt nicht automatisch die gespeicherte Datenkonfiguration.

Provider und Cacheidentität binden die tatsächliche Datenkonfiguration. Nur ein vollständig validierter Stand derselben Konfiguration kann bei einem späteren Fehler helfen. Der Erstabruf einer neuen Quelle kann nicht durch einen anderen Mirror, einen historischen AP5-Cache oder einen alten originweiten Aktivzeiger ersetzt werden. Ohne gültigen eigenen Aktivstand wird gesperrt. Kein Browserdatenreset ist erforderlich oder pauschal freigegeben.

104 terminale Verfahrensbindungen werden von 198 Herkunftsentscheiden getrennt. Keine freie Kalendervereinigung, kein erster Treffer und kein stiller BE-/CH-Ersatz. Rollen und regionale Fakten sind ausdrücklich zu qualifizieren. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben fachlich unverändert und auf Bern sowie 2026–2027 beschränkt. Nationale Kalenderabdeckung ist keine ausserbernische Sozialfreigabe und kein zusätzliches kantonales Verwaltungsverfahren.

Persönliche Standards verwenden Version 4. v3 wird ohne erfundene Rollen-/Ortsfakten gelesen und erst nach ausdrücklichem Speichern als v4 persistiert. Datum, Referenz, Resultat und fallbezogene Regionalantworten bleiben ausgeschlossen. Die lokale ICS-Erzeugung benötigt ebenso wie der Rechner keine Graph-Berechtigung oder Entra-App-Registrierung.

## Lokale Prüfung und Build

Im Ordner `spfx/`:

```bash
nvm use
npm ci
python3 scripts/generate-teams-icons.py
npm test
npm run build
```

Der reguläre Build synchronisiert die Quellen, prüft und kompiliert sie, auditiert die Produkt-CSS und paketiert anschliessend. `npm run test:built` prüft emittierten und tatsächlich paketierten Code. Lokalisiertes `fr-*`-CSS und wörtliche `:global`-Marker werden durch den CSS-Audit abgewiesen. Die SharePoint-Debugumgebung wird mit `npm start` auf Port 4321 gestartet.

Diese Befehle erzeugen einen **neuen lokalen Build**, nicht rückwirkend die freigegebenen Paketbytes. Der generische Ausgabepfad `sharepoint/solution/fristenrechner-schweiz.sppkg` darf weder als aktuelles Auslieferungsartefakt noch als Recovery angenommen werden.

Der isolierte Korrekturbau ist in `../scripts/build-mvp07-spfx-0702.mjs` gebunden. Sein unverändert aufzubewahrendes [Paket `0.7.0.2`](../outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg) umfasst **291’895 Bytes**, SHA-256 **`8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db`**. Im gebundenen Bau sind 186 Quell-/Provider- und 83 Tests des kompilierten beziehungsweise paketierten Codes bestanden. Sie ersetzen keine Hostprüfung und werden nicht mit überlappenden Gruppen summiert. Der [Korrekturbaunachweis](../docs/betrieb/darstellungskorrektur-mvp07-0702.md) und dessen [maschinenlesbarer Bericht](../outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifact-verification.json) sind massgebend. Ein unabhängiger byteidentischer SPFx-Zweitbau wird nicht behauptet.

Öffentliche Produkt-/Datenprüfungen aus dem Repositoryhauptordner umfassen `npm run check`, `npm run check:integrity:mvp07`, `npm run test:data:mvp07` und `npm run test:portability:mvp07`. Pythonprüfungen benötigen die eingerichtete `.venv`. Der separate strenge Befehl `npm run test:source-reviews:private:mvp07` benötigt private Originalbelege. Ein öffentlicher Integritätsnachweis macht daraus keinen erneuten Quellen-Vollaudit. Die tatsächlichen öffentlichen Integritäts- und bereinigten Exportprüfungen bleiben im [Publikationspaket](../docs/betrieb/publikationspaket-mvp07.md) getrennt dokumentiert.

## Bereitstellung und Rückfall

1. Zielumfang, aktuellen Katalogbestand, sämtliche verbundenen Instanzen, Sicherungen und konkreten Rückfallweg frisch prüfen und freigeben.
2. Nur das explizit hashgebundene Paket im bestehenden Katalog bereitstellen. Der gemeinsame Codewechsel kann alle verbundenen Instanzen erreichen. Keine automatische zusätzliche Siteinstallation.
3. Freigegebene Site-Apps aktualisieren und die vollständigen eigenen Mirrorbytes prüfen. Erst mit Format-7-fähigem Consumer den Format-7-Pfad setzen, je Instanz speichern beziehungsweise publizieren.
4. Tatsächliche SharePoint- und direkte Teams-Hosts anhand der [MVP07-Matrix](../docs/betrieb/pruefmatrix-mvp07.md) prüfen. Historische AP5-Pins und Daten bleiben erhalten.
5. Manuelle Geräte-/Gastprüfung und fachliche Abnahme getrennt dokumentieren. Für einen anderen Tenant sind eigene Ziele und Rechte zu binden.

Der gebilligte Rückfall für den bestehenden E-/Q-Stand verwendet [Recovery `0.7.0.3`](../docs/betrieb/wiederherstellungskandidat-mvp07-0703.md), SHA-256 `9490890245e8aad54a5ec5eae731a0ee895f9fc9439dec19b371315085794702`. Nach der [konkreten Vorlage](../docs/betrieb/eq-installationsvorlage-mvp07-0702.md) werden zuerst die gesicherten Format-6-Mirrorpfade wiederhergestellt, dann das höher versionierte Recoverypaket angewendet und anschliessend alle vier Hosts sowie AP5 geprüft. Standards bleiben geschützt, kein Browserdatenreset. Recovery wurde nicht eingesetzt. Eine spätere reguläre MVP07-Wiederaufnahme benötigt erneut eine höhere Paketversion. Ein alter Consumer darf nicht unkontrolliert an Format-7-Daten verbleiben.

Die acht E-/Q-ICS-Dateien sind tatsächlich gespeichert und geprüft. Ein neuer Outlook-Import fand nicht statt. Die [Wiederverwendungsbewertung](../docs/betrieb/outlook-wiederverwendung-mvp07.md) ist ein begründeter Vorschlag, noch keine Abnahme. E-/Q-Abnahme, ursprüngliche Quellenfreigabe und lokale Publikationsvorbereitung autorisieren weder GitHub-Push noch P-Bereitstellung oder neue M365-Rechte.

## Lizenz

Der Programmcode steht unter AGPL-3.0-only. Daten, Dokumente und weitere Inhalte behalten ihre jeweils ausgewiesene Lizenz.

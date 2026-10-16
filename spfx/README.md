# Fristenrechner Schweiz für SharePoint und Teams

Dieses Verzeichnis enthält die SPFx-Lösung. Dasselbe WebPart und dasselbe `.sppkg` laufen auf modernen SharePoint-Seiten und als direkte Teams-Kanalregisterkarte.

**Stand 16. Oktober 2026:** Anwendung `0.8.0`, Paket `0.8.0.0` und Daten `2026-10-15-mvp-08-approved.1` sind auf den vier bestehenden E-/Q-Instanzen installiert. [Technischer Vollzug](../docs/betrieb/eq-vollzugsnachweis-mvp08.md) und [Q-Abnahme](../docs/betrieb/abnahme-q-mvp08.md) sind abgeschlossen, einschliesslich menschlicher Geräte-/Gastbestätigung und begrenzter Outlook-Wiederverwendung. GitHub und P bleiben für MVP 0.8 gesondert freizugeben. Letzter dokumentierter öffentlicher Stand ist [MVP 0.7](../docs/betrieb/produktionsbereitstellung-mvp07-2026-10-09.md), ohne neue Liveinventur.

## Toolchain

| Baustein | Gebundener Stand |
| --- | --- |
| Node.js / npm | `22.23.2` / `10.9.8` |
| SharePoint Framework | `1.23.2` |
| React und React DOM | `17.0.1` |
| Fluent UI React | `8.106.4` |
| TypeScript | `5.8.3` |
| Heft | `1.2.17` |

Lockdateien binden den nachgewiesenen Bau, nicht die jeweils neuesten Werkzeuge. Vor Upgrades ist die offizielle SPFx-Kompatibilitätsmatrix separat zu prüfen.

## Quellstruktur und Datenvertrag

- `../src/core/` und `../src/ui/` sind führende Quellen für Rechenkern und Oberfläche.
- `src/core/` enthält Provider, Release-Service, Format-1-bis-8-Validierung und konfigurationsgebundenen Browsercache.
- `src/webparts/fristenrechner/` enthält den Hostadapter, keine eigene Fristenlogik.
- `src/product/` und `src/core/schemas/` werden vor Test und Build mechanisch synchronisiert, nicht separat gepflegt.

MVP08 verwendet Manifest/Mindestconsumer `8.0.0` und Verwaltungsverfahrenskatalog `1.0.0`. Regelkalender `3.0.0`, Feiertagskatalog `2.0.0`, Rechtsprofile `1.0.0`, Spezialregimekatalog `3.0.0` und Sozialverfahrenskatalog `2.0.0` behalten ihre Formate. Fünf TI- und sieben GR-Verfahrenspfade ergänzen den bisherigen Umfang, begrenzt auf 29. August 2026 bis Ende 2027. Die [Releasehinweise](../docs/betrieb/release-notes-mvp08.md) nennen die fachlichen Grenzen.

## Datenquellen und Cache

- `GitHub`: gebunden an Datencommit `10a99419eaabb3e96d2acccf0c7a93e2fe6472cb` und `data/releases/2026-10-15-mvp-08-approved.1`. Dieser Pin ist noch nicht veröffentlicht oder öffentlich als abrufbar bestätigt. Aktivierung setzt Veröffentlichung und vollständigen Rohbytevergleich voraus.
- `SharePoint-Mirror`: serverrelativer Releaseordner auf derselben Website. E/Q verwenden ihre eigenen vollständigen Mirrors.

Der Mirrorpfad ist standardmässig leer. In Teams liegt der Mirror auf der Teamsite und wird in der Registerkarte konfiguriert. Cross-Site-Pfade werden abgewiesen. Der MVP08-Mirror umfasst **42 Dateien**: Manifest, 32 Kalender, fünf Profile und vier Kataloge. Manifest SHA-256: `2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4`. Die [Dritt-Tenant-Anleitung](../docs/betrieb/installation-und-betrieb-dritttenants.md#62-variante-b-tenantinterner-sharepoint-mirror) enthält alle Pfade und die Archivprüfsumme.

Aktiviert wird nur ein `approved`-Release nach vollständiger Schema-, Grössen-, Hash-, Referenz- und Abdeckungsprüfung. Alle Kalender des Format-8-Releases verwenden Format 3. Historische Formate bleiben lesbar. Der alte MVP07-Consumer kann Format 8 nicht lesen. Ein Paketupdate ersetzt keine gespeicherte Datenkonfiguration.

Der Cache bindet die tatsächliche Provider-/Datenkonfiguration. Nur ein vollständig validierter Stand derselben Konfiguration kann bei späterem Fehler helfen. Andere Mirrors, AP5 oder alte originweite Aktivzeiger ersetzen keinen fehlgeschlagenen Erstabruf. Ohne gültigen eigenen Aktivstand wird gesperrt. Kein Browserdatenreset.

104 Bundesverfahrensbindungen bleiben von 198 Herkunftsentscheiden getrennt. Keine freie Kalendervereinigung und kein stiller BE-/CH-Ersatz. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben ausschliesslich für Bern und 2026–2027 freigegeben. Die neuen TI-/GR-Verwaltungswege sind keine ausserbernische Sozialfreigabe.

Bei Format 8 verwenden Standards Version 5. Die Migration alter v4-Auswahlen kann beim ersten Laden erfolgen und bewahrt den alten Schlüssel. Datum, Referenz, Ergebnis, Fallqualifikation, Dringlichkeit und fallbezogene Regionalantworten werden nicht gespeichert. Der Resetmarker verhindert das Wiederaufleben alter Standards. Alte Datenformate nutzen weiterhin ihren bisherigen Speicherpfad.

## Lokale Prüfung und Build

Im Ordner `spfx/`, in einer Arbeitskopie:

```bash
nvm use
npm ci
python3 scripts/generate-teams-icons.py
npm test
npm run build
```

Der Build synchronisiert Quellen, prüft und kompiliert sie, auditiert Produkt-CSS und paketiert. `npm run test:built` prüft emittierten und tatsächlich paketierten Code. Lokalisiertes `fr-*`-CSS und wörtliche `:global`-Marker werden abgewiesen. `npm start` startet die SharePoint-Debugumgebung auf Port 4321.

Diese Befehle erzeugen einen **neuen lokalen Bau**, nicht rückwirkend freigegebene Paketbytes. Der generische Pfad `sharepoint/solution/fristenrechner-schweiz.sppkg` ist kein Auslieferungs- oder Recoverynachweis.

Das [Paket `0.8.0.0`](../outputs/release-mvp08-2026-10-15/fristenrechner-schweiz-0.8.0.0.sppkg) umfasst **311’611 Bytes**, SHA-256 **`d3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a`**. Der [Baunachweis](../docs/betrieb/releaseartefakte-mvp-08.md) bindet 204 Quell-/Provider- und 107 tatsächliche Pakettests. Diese ersetzen keine Hostprüfung und werden nicht mit überlappenden Gruppen summiert. Ein unabhängiger byteidentischer Zweitbau wird nicht behauptet.

Aus dem Repositoryhauptordner sind `npm run typecheck`, `npm run check:integrity:mvp08`, `npm test` und `npm run test:source-reviews` verfügbar. Standardtests können Test-/Vorschauausgaben erzeugen. `npm run check` erzeugt zusätzlich Web- und Vorschaubuilds. Pythonprüfungen benötigen `.venv`. Private Vollaudits, etwa `npm run test:source-reviews:private:mvp08`, sind getrennt und brauchen private Nachweise. Die [Publikationsvorlage](../docs/betrieb/publikationspaket-mvp08.md) bindet die öffentliche Auswahl, danach lesend prüfbar mit `node scripts/verify-mvp08-publication.mjs`. Historische Recovery- oder Quellenaudits werden nicht pauschal als öffentlich reproduzierbar ausgegeben.

## Bereitstellung und Rückfall

1. Ziele, Katalogbestand, verbundene Verbraucher, Sicherungen und Rückfall frisch binden und freigeben.
2. Nur das konkrete Paket bereitstellen. Gemeinsame Codewirkung beachten, keine automatische zusätzliche Siteinstallation.
3. Freigegebene Site-Apps aktualisieren und Mirrorbytes prüfen. Erst mit Format-8-fähigem Consumer den neuen Datenpfad setzen und speichern beziehungsweise publizieren.
4. SharePoint und direkte Teams-Hosts nach der [MVP08-Matrix](../docs/betrieb/pruefmatrix-mvp08.md) prüfen. Historische AP5-Pins bleiben erhalten.
5. Menschliche Geräte-/Gastprüfung und Q-Abnahme separat dokumentieren. Andere Tenants benötigen eigene Ziele, Rechte und Nachweise.

Der [gebilligte Rückfall](../docs/betrieb/freigabe-r08-c.md) verwendet [Recovery `0.8.0.1`](../docs/betrieb/rueckfall-mvp08.md), SHA-256 `8e387297d43df28e2fe4d3c7c9ae239bb2cdc6a9e3216e4c59c928c50d950e7b`, mit MVP07-Funktionalität. Zuerst aktuelle Ansichten auf ihre gesicherten Format-7-Mirrors zurückstellen, danach das höhere Recoverypaket einsetzen und aktuelle Hosts sowie AP5 prüfen. Standards bleiben geschützt. Kein Browserdatenreset, keine Deinstallation. Recovery wurde nicht eingesetzt. Eine reguläre Wiederaufnahme benötigt danach einen erneut höheren Paketstand.

Acht E-/Q-ICS-Dateien wurden tatsächlich gespeichert und geprüft. Die [begrenzte Outlook-Wiederverwendung](../docs/betrieb/abnahme-q-mvp08.md) ist bestätigt, ohne neuen Outlook-Import. Sie betrifft nur den unveränderten Terminvertrag. E-/Q-Abnahme und lokale Publikationsvorbereitung autorisieren weder GitHub, P noch neue M365-Rechte.

## Lizenz

Programmcode: AGPL-3.0-only. Daten, Dokumente und weitere Inhalte behalten ihre ausgewiesenen Lizenzen.

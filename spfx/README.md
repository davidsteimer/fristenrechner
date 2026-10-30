# Fristenrechner Schweiz für SharePoint und Teams

Dieses Verzeichnis enthält die SPFx-Lösung. Dasselbe WebPart und dasselbe `.sppkg` laufen auf modernen SharePoint-Seiten und als direkte Teams-Kanalregisterkarte.

**Stand 30. Oktober 2026:** Anwendung `0.10.0`, Paket `0.10.0.0` und Daten `2026-10-28-mvp-010-approved.1` sind auf den vier bestehenden E-/Q-Instanzen installiert. [Technischer Vollzug](../docs/betrieb/eq-vollzugsnachweis-mvp10.md) und [Q-Abnahme](../docs/betrieb/abnahme-q-mvp10.md) sind abgeschlossen, einschliesslich menschlicher Geräte-/Gastbestätigung und begrenzter Outlook-Wiederverwendung. GitHub und P bleiben für MVP 0.10 gesondert freizugeben. Letzter dokumentierter öffentlicher Stand ist [MVP 0.9](../docs/betrieb/produktionsbereitstellung-mvp09-2026-10-19.md), ohne neue Liveinventur.

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
- `src/core/` enthält Provider, Release-Service, Format-1-bis-17-Validierung und konfigurationsgebundenen Browsercache.
- `src/webparts/fristenrechner/` enthält den Hostadapter, keine eigene Fristenlogik.
- `src/product/` und `src/core/schemas/` werden vor Test und Build mechanisch synchronisiert, nicht separat gepflegt.

MVP10 verwendet Manifest/Mindestconsumer `17.0.0` und Verwaltungskatalog `10.0.0`. Regelkalender 3, Feiertagskatalog 2, Rechtsprofile 1, Spezialregime 3 und Sozialkatalog 2 behalten ihre Formate. MVP 0.10 deckt das allgemeine Verwaltungsverfahren aller 26 Kantone im vereinbarten Umfang ab: 245 ausserbernische Pfade in 25 Kantonen und das getrennte BE-Profil. Fall-, Orts-, Stadien- und Zeitqualifikationen bleiben erforderlich. Keine pauschale Abdeckung aller Spezialgesetze. 44 Sozialregeln und 50 BE-Anbindungen bleiben ausschliesslich auf Bern und 2026–2027 beschränkt. Eigenständiges kommunales Recht bleibt ausgeschlossen, DE/FR bleiben Produktsprachen.

## Datenquellen und Cache

- `GitHub`: gebunden an Datencommit `01bbd96a296b0fc4d64cd554acc8cb122c3017a3` und `data/releases/2026-10-28-mvp-010-approved.1`. Dieser Pin ist noch nicht veröffentlicht oder öffentlich als abrufbar bestätigt. Aktivierung setzt Veröffentlichung und vollständigen Rohbytevergleich voraus.
- `SharePoint-Mirror`: serverrelativer Releaseordner auf derselben Website. E/Q verwenden ihre eigenen vollständigen Mirrors.

Der Mirrorpfad ist standardmässig leer. In Teams liegt der Mirror auf der Teamsite und wird in der Registerkarte konfiguriert. Cross-Site-Pfade werden abgewiesen. Der MVP10-Mirror umfasst **45 Dateien**: Manifest, 35 Kalender, fünf Profile und vier Kataloge. Manifest SHA-256: `7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016`. Die [Dritt-Tenant-Anleitung](../docs/betrieb/installation-und-betrieb-dritttenants.md#62-variante-b-tenantinterner-sharepoint-mirror) enthält alle Pfade und die Archivprüfsumme.

Aktiviert wird nur ein `approved`-Release nach vollständiger Schema-, Grössen-, Hash-, Referenz- und Abdeckungsprüfung. Alle Kalender des Format-17-Releases verwenden Format 3. Historische Formate bleiben lesbar. Der alte MVP09-Consumer kann Format 17 nicht lesen. Ein Paketupdate ersetzt keine gespeicherte Datenkonfiguration.

Der Cache bindet die tatsächliche Provider-/Datenkonfiguration. Nur ein vollständig validierter Stand derselben Konfiguration kann bei späterem Fehler helfen. Andere Mirrors, AP5 oder alte originweite Aktivzeiger ersetzen keinen fehlgeschlagenen Erstabruf. Ohne gültigen eigenen Aktivstand wird gesperrt. Kein Browserdatenreset.

104 Bundesverfahrensbindungen bleiben von 198 Herkunftsentscheiden getrennt. Keine freie Kalendervereinigung und kein stiller BE-/CH-Ersatz. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben ausschliesslich für Bern und 2026–2027 freigegeben. Die kantonale Verwaltungsintegration ist keine ausserbernische Sozialfreigabe.

Bei Format 17 verwenden Standards Version 5. Die Migration alter v4-Auswahlen kann beim ersten Laden erfolgen und bewahrt den alten Schlüssel. Datum, Referenz, Ergebnis, Fallqualifikation, Dringlichkeit und fallbezogene Regionalantworten werden nicht gespeichert. Der Resetmarker verhindert das Wiederaufleben alter Standards. Alte Datenformate nutzen weiterhin ihren bisherigen Speicherpfad.

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

Das [Paket `0.10.0.0`](../outputs/release-mvp10-2026-10-28/fristenrechner-schweiz-0.10.0.0.sppkg) umfasst **843’895 Bytes**, SHA-256 **`7b4af4f28426434a5c15c1055a6a5f029e34d6982d108a868fabf63a7e5278fd`**. Der [lokale Abschlussnachweis](../docs/betrieb/lokaler-releaseabschluss-mvp10.md) bindet die tatsächlich gebauten und geprüften Artefakte. Kein neuer Bau oder unabhängiger byteidentischer Zweitbau wird behauptet.

Aus dem Repositoryhauptordner sind `npm run typecheck`, `node scripts/verify-mvp10-public-integrity.mjs --runtime-only`, `npm test` und `npm run test:source-reviews` verfügbar. Standardtests können Test-/Vorschauausgaben erzeugen. `npm run check` erzeugt zusätzlich Web- und Vorschaubuilds. Pythonprüfungen benötigen `.venv`. Private Vollaudits, etwa `node scripts/run-standard-tests.mjs private-mvp10`, sind getrennt und brauchen private Nachweise. Die [Publikationsvorlage](../docs/betrieb/publikationspaket-mvp10.md) bindet die öffentliche Auswahl, danach lesend prüfbar mit `node scripts/verify-mvp10-publication.mjs`. Historische Recovery- oder Quellenaudits werden nicht pauschal als öffentlich reproduzierbar ausgegeben.

## Bereitstellung und Rückfall

1. Ziele, Katalogbestand, verbundene Verbraucher, Sicherungen und Rückfall frisch binden und freigeben.
2. Nur das konkrete Paket bereitstellen. Gemeinsame Codewirkung beachten, keine automatische zusätzliche Siteinstallation.
3. Freigegebene Site-Apps aktualisieren und Mirrorbytes prüfen. Erst mit Format-17-fähigem Consumer den neuen Datenpfad setzen und speichern beziehungsweise publizieren.
4. SharePoint und direkte Teams-Hosts nach der [MVP10-Matrix](../docs/betrieb/pruefmatrix-mvp10.md) prüfen. Historische AP5-Pins bleiben erhalten.
5. Menschliche Geräte-/Gastprüfung und Q-Abnahme separat dokumentieren. Andere Tenants benötigen eigene Ziele, Rechte und Nachweise.

Der [gebilligte Rückfall](../docs/betrieb/freigabe-r10-c.md) verwendet [Recovery `0.10.0.1`](../docs/betrieb/rueckfall-mvp10.md), SHA-256 `0def9a2c4a126f6d7b30d22ebe600c1b471ccd10d6c81b7dfab9745a350d797b`, mit MVP09-Funktionalität. Zuerst aktuelle Ansichten auf ihre gesicherten Format-9-Mirrors zurückstellen, danach das höhere Recoverypaket einsetzen und aktuelle Hosts sowie AP5 prüfen. Standards bleiben geschützt. Kein Browserdatenreset, keine Deinstallation. Recovery wurde nicht eingesetzt. Eine reguläre Wiederaufnahme benötigt danach einen erneut höheren Paketstand.

Acht E-/Q-ICS-Dateien wurden tatsächlich gespeichert und geprüft. Die [begrenzte Outlook-Wiederverwendung](../docs/betrieb/abnahme-q-mvp10.md) ist bestätigt, ohne neuen Outlook-Import. Sie betrifft nur den unveränderten Terminvertrag. E-/Q-Abnahme und lokale Publikationsvorbereitung autorisieren weder GitHub, P noch neue M365-Rechte.

## Lizenz

Programmcode: AGPL-3.0-only. Daten, Dokumente und weitere Inhalte behalten ihre ausgewiesenen Lizenzen.

# AP18C1: Importierte Feiertagsgrundlage

Stand: 22. September 2026. Lokaler technischer Kandidat aus der abgenommenen Arbeitsmappe V0.12, Arbeitsmappenvertrag `0.6.0`. **Kein Datenrelease und kein Runtime-Kalender.**

- `acceptance.json` bindet die dokumentierte Abnahme und ihre Grenzen an den SHA-256 der tatsächlichen XLSX-Datei.
- `holiday-candidate.json` enthält die normalisierten Fachdatensätze, die Ergebnisse für 2026–2028 und den vollständigen semantischen Tabellen-/Zellnachweis der Eingangsmappe. Gespeicherte historische Arbeitsstatus bleiben erhalten.
- `validation-report.json` enthält Bestandszahlen, Prüfsummen und den Abgleich mit den bestehenden CH-/BE-Feiertagsregeln.

Der Begriff «verlustfrei» bezieht sich auf Tabelleninhalte, Formeln, gespeicherte Werte, Quellenlinks und nichtleere Kontextzellen. Es handelt sich nicht um eine Rückkonvertierung sämtlicher Excel-Formatierungen, Schutz- oder Druckeinstellungen. Die unveränderte Originalmappe bleibt deren Nachweis.

Das Importformat `0.1.0` ist eine lokale Werkzeugstruktur. Es ist **keine neue Version** des produktiven Kalenderformats. Die Datei besitzt weder die Runtime-Rolle `calendar` noch einen Release-Manifest-Eintrag und wird von keiner App-Datenquelle verwendet.

## Wiederholen und prüfen

Im Projektverzeichnis, mit der bestehenden Node-22-Toolchain und Python 3:

```sh
npm run build:data:ap18c:candidate
npm run test:ap18c
```

`AP18_PYTHON` kann für den Builder und den JavaScript-Test einen abweichenden Python-Pfad festlegen. Der Python-Test kann direkt mit diesem Interpreter aufgerufen werden. Es sind keine zusätzlichen Python-Pakete erforderlich.

Der Builder liest die XLSX tatsächlich neu ein. Er verwendet keine Erfassungsmodelle als Datenersatz und schreibt weder die XLSX noch bestehende Releases. Bereits vorhandene identische Ausgaben werden geprüft. Abweichende Ausgaben werden nicht stillschweigend überschrieben. Eine geänderte Eingangsmappe verliert die hier gebundene Abnahme und benötigt einen eigenen geprüften Kandidatenstand.

Seit der [Archivbestätigung](../../../docs/fachrecht/archivbestaetigung-ap18.md) liest der Builder die byteidentische V0.12 aus `outputs/archiv/ap18/2026-09-22/referenzen/`. Die getrennte, veränderbare Arbeitskopie wird nie automatisch importiert. Der erneute Build ergibt dieselben Kandidatenbytes und dieselbe Prüfsumme. `npm run test:archive:ap18` prüft die Referenzablage gesondert und meldet die historischen V0.9-/V0.10-Abweichungen ausdrücklich.

Der weiterführende Produktvertrag [DEC-2026-023](../../../docs/entscheidungen/DEC-2026-023-schweizweiter-feiertagskatalog.md) ist beschlossen und als gesonderter [AP18C-Integrationskandidat](../../releases/2026-09-22-ap18c-candidate.1/README.md) lokal umgesetzt. Er verändert die Dateien dieses Importkandidaten nicht. Die menschliche Implementierungsabnahme und Releasepromotion stehen noch aus.

[Abnahme V0.12](../../../docs/fachrecht/abnahme-ap18b-05.md) · [Importvertrag und Prüfgrenzen](../../../docs/architektur/import-ap18c.md)

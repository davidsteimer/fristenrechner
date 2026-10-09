# MVP 0.7 · Lokales Publikationspaket

Stand: 9. Oktober 2026. **Zur Freigabe vorbereitet, nicht veröffentlicht.**

Die fachlich lesbare [Freigabevorlage](../../docs/betrieb/publikationspaket-mvp07.md) erklärt Umfang, Unverändertheit und die noch getrennt erforderlichen Entscheidungen zu Outlook, GitHub und P.

- [Positivliste](publication-package.json): genaue Dateiauswahl mit SHA-256 und Bytezahlen. Die Liste selbst wird über ihre separat vorgelegte Prüfsumme gebunden.
- [Prüfergebnisse](public-checks.json): sieben bestandene Läufe im bereinigten Export, die Original- und Veröffentlichungshashes der Protokolle und das Ergebnis des gesonderten privaten Vollaudits.
- [Unverändertheit](preservation-check.json): lokale Gegenprüfung zum Ausgangsinventar, zu den archivierten SPFx-Eingängen und den 41 Release-Dateien.
- [Datenschutzkontrolle](privacy-review.json): abgegrenzte Muster-, Archiv- und Arbeitsmappenprüfung mit ihren Grenzen.
- [Browsernachweis](browser/README.md): synthetische lokale DE-/FR-Prüfungen des tatsächlich neu erzeugten Webbaums.

Die Dateien unter `checks/` sind abgeleitete Protokollkopien. Persönliche absolute Projektpfade und systemgenerierte macOS-Temporärpfade sind durch Platzhalter ersetzt. Unveränderte Originalprotokolle bleiben privat und sind durch ihre Hashes nachgewiesen. Inhaltliche Fehlermeldungen, Prüfergebnisse und Testzahlen werden nicht bereinigt oder weggelassen.

Die früheren historischen Archive werden nicht rückwirkend umgeschrieben. Nicht veröffentlichte Originaldateien können weiterhin in deren Hashverzeichnissen referenziert sein. Die neue Positivliste ist die Publikationsauswahl, kein behaupteter vollständiger öffentlicher Nachbau sämtlicher privater Altprüfungen.

Nach Bereitstellung aller ausgewählten Dateien kann die Positivliste ohne Git-Verzeichnis geprüft werden:

```sh
node scripts/verify-mvp07-publication.mjs
```

Ein positives Resultat bestätigt Dateibytes und Releasebindungen, erteilt aber keine Publikations- oder Betriebsfreigabe.

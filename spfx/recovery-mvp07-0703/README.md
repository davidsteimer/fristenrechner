# Lokale Prüfung des Wiederherstellungspakets 0.7.0.3

Diese versionsgebundene Suite übernimmt die 32 Quelltests und 11 Tests am tatsächlichen Paket aus dem archivierten Wiederherstellungskandidaten `0.7.0.1`. Sie verändert die archivierten Tests nicht.

Die Quelltests verlangen `FRISTENRECHNER_RECOVERY_STAGE` als absoluten Pfad zum neu erzeugten Stageordner `.work/mvp07-recovery-0703-…`. Sie importieren die dort tatsächlich gebauten Recovery-, Cache- und Defaults-Quellen. Der gesamte Stage-Quellbestand wird vorher gegen das versiegelte Recovery-Archiv geprüft. Einzig das technische DOM-Versionsattribut darf `0.7.0.3` lauten. Es gibt keinen Ersatz durch aktuelle Rootquellen.

Die Pakettests verlangen `FRISTENRECHNER_RECOVERY_SPPKG` als absoluten Pfad zur neuen Paketdatei. Als unmittelbarer Vorläufer wird ausschliesslich der archivierte Korrekturkandidat `0.7.0.2` mit SHA-256 `8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db` verwendet. Die Lösung und das Feature müssen `0.7.0.3` ausweisen. Die bestehende Komponentenversion `0.7.1` bleibt erhalten.

Aufruf aus `spfx/` mit der projektspezifischen Node-Version und den genannten Umgebungsvariablen:

```sh
node --import tsx --test --test-timeout=60000 recovery-mvp07-0703/recovery-storage.test.ts recovery-mvp07-0703/recovery-lifecycle.test.ts
node --test --test-timeout=180000 recovery-mvp07-0703/recovery-package.test.cjs
```

Nachtrag vom 9. Oktober 2026 nach der Archivierung: Die Zeitgrenze gilt für die ganze Pakettestdatei. Der endgültige Builder verwendete bereits 180 Sekunden, sein bestandener Lauf dauerte rund 98 Sekunden. Der manuelle Aufruf in dieser lebenden Anleitung ist entsprechend berichtigt. Die im unveränderten Buildarchiv gesicherte frühere Anleitung und alle tatsächlichen Testprotokolle bleiben erhalten. Keine Änderung am Paket, Builder oder ausführbaren Testcode.

Die Pakettests führen die tatsächlichen AMD-Paketbytes über synthetische lokale Datenlieferung und simulierte Browser-/React-Speicher aus. Darin enthalten sind 100 Sozialverfahrensberechnungen. Ein Hostnachweis auf SharePoint oder Teams, reale IndexedDB- und React-Lebenszyklen, eine Installation oder ein Outlook-Import sind damit nicht belegt.

Die erneute Ausführung der Consumerbytes von `0.7.0.2` nach der Recovery prüft nur die Unversehrtheit und Lesbarkeit der gespeicherten Format-7-Daten und Standards. Sie behauptet und autorisiert keinen Paket-Downgrade. Nach einer tatsächlichen Installation von `0.7.0.3` benötigt die reguläre MVP-0.7-Wiederaufnahme einen erneut höheren Paketstand.

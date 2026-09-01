# Deployment und Rückfall der öffentlichen P-Ausprägung

Diese Anleitung beschreibt die spätere kontrollierte Bereitstellung des in AP16 vorbereiteten statischen Releasekandidaten auf der bestehenden steimer.ch-Hosting-Infrastruktur. Sie erteilt keine Freigabe zur Ausführung. Sämtliche Schritte gegen das öffentliche Hosting setzen einen ausdrücklichen Entscheid von David Steimer voraus.

## 1. Betriebsmodell

| Merkmal | Festlegung |
| --- | --- |
| öffentlicher Pfad | `https://www.steimer.ch/fristenrechner/` |
| Hosting | bestehendes statisches steimer.ch-Webhosting |
| Serverfunktion | keine |
| Datenbank | keine |
| Laufzeitprovider | keine |
| Fachdaten | beim Build eingebettet |
| Nutzerstandards | lokaler Browserspeicher |
| Logging und Analyse | keine anwendungsseitige Telemetrie |
| Rückfall | Wiederherstellung des vorherigen Verzeichnisstands |

## 2. Voraussetzungen

Vor dem Upload müssen erfüllt sein:

1. [x] AP16 ist fachlich-technisch abgenommen.
2. [x] DEC-2026-017 ist ausdrücklich beschlossen.
3. [ ] Die konkrete P-Bereitstellung ist ausdrücklich freigegeben.
4. Der bestehende Webroot und eine allfällige frühere Version von `/fristenrechner/` sind gesichert.
5. Apache wertet `.htaccess`, `mod_headers` und wenn vorhanden `mod_expires` im Zielordner aus.
6. HTTPS und die kanonische Weiterleitung auf `www.steimer.ch` funktionieren.
7. Der lokale Kandidat wurde unmittelbar vor dem Upload neu gebaut und geprüft.
8. Die Prüfsummen des hochzuladenden Kandidaten sind dokumentiert.

Falls das Hosting die `.htaccess`-Regeln ignoriert oder verwirft, wird nicht öffentlich umgeschaltet. Die benötigten Header müssen dann zuerst gleichwertig in der Hostingkonfiguration gesetzt werden. Zusätzliche Infrastruktur wird nicht aufgebaut.

## 3. Kandidat bauen und lokal prüfen

```bash
npm ci
npm run check
npm run preview:public
```

Der letzte Befehl stellt den Kandidaten lokal unter folgender Adresse bereit:

```text
http://127.0.0.1:4180/fristenrechner/
```

Der hochzuladende Inhalt liegt ausschliesslich unter:

```text
.work/public-app/
```

Entwicklungsdateien, Quellkarten, `node_modules`, Repositorymetadaten und `.work/ui-preview` gehören nicht auf das Hosting.

## 4. Vorbereiteter Uploadablauf

Der konkrete Ablauf ist erst nach der P-Freigabe auszuführen:

1. Bestehenden öffentlichen Webroot und vorhandenen Fristenrechnerordner vollständig sichern.
2. Kandidat in einen neuen, noch nicht öffentlich verlinkten temporären Ordner hochladen.
3. Dateianzahl, Grössen und SHA-256-Prüfsummen mit dem lokalen Nachweis vergleichen.
4. `.htaccess`, versteckte Dateien und Lizenzverzeichnis ausdrücklich mitübertragen.
5. Temporären Ordner über eine nicht publizierte Prüfadresse oder eine hostseitige Vorschau testen.
6. Den Ordner kontrolliert auf `/fristenrechner/` umschalten. Eine atomare Verzeichnisumbenennung ist zu bevorzugen, wenn das Hosting dies unterstützt.
7. Öffentliche Prüfmatrix gemäss Abschnitt 5 vollständig ausführen.
8. Erst nach bestandener Prüfung den Root-Webauftritt und `sitemap.xml` ergänzen.
9. P-Betriebsentscheid und effektive Prüfsummen dokumentieren.

Der Upload darf bestehende Dateien nicht einzeln und über längere Zeit überschreiben. Sonst könnten Browser während der Aktualisierung neues HTML mit alten Assets oder umgekehrt erhalten.

## 5. Prüfung nach der Umschaltung

| ID | Prüfung | Soll |
| --- | --- | --- |
| D01 | kanonische Adresse | `https://www.steimer.ch/fristenrechner/` liefert Status 200 |
| D02 | HTTPS und Weiterleitung | HTTP und nicht kanonische Hosts werden korrekt weitergeleitet |
| D03 | Paketidentität | sichtbarer Datenstand und Buildmanifest stimmen mit dem freigegebenen Kandidaten überein |
| D04 | Sicherheitsheader | CSP, `nosniff`, Referrer-, Einbettungs- und Berechtigungsheader sind effektiv vorhanden |
| D05 | Cache | HTML ist nicht speicherbar, gehashte CSS- und JavaScript-Dateien sind unveränderlich cachebar |
| D06 | externe Aufrufe | keine Laufzeitabfrage an GitHub, SharePoint, Graph, CDN oder andere Dritte |
| D07 | Deutsch | Hauptablauf, Validierung, Referenzfall und Kalenderexport funktionieren |
| D08 | Französisch | Hauptablauf, Validierung, Referenzfall und Kalenderexport funktionieren |
| D09 | Mobilansicht | 390 Pixel ohne horizontalen Überlauf |
| D10 | Datenschutz | Empfangsdatum und Kalenderreferenz erscheinen nicht im Browserstorage und nicht in Netzwerkanfragen |
| D11 | Fehlerfälle | ungültige oder unvollständige Eingaben erzeugen kein scheinbar plausibles Ergebnis |
| D12 | Root-Integration | Link, Impressum, Quellcode, Lizenz und `sitemap.xml` sind korrekt |

Mindestens der Referenzfall StPO mit Empfang am 16. September 2026 und zehn Tagen ist nach der Umschaltung zu prüfen. Erwartet werden Fristbeginn 17. September 2026, rechnerisches Ende 26. September 2026 und endgültiges Ende 28. September 2026.

## 6. Sicherheitsheader

Die mitgelieferte `.htaccess` setzt:

- Verzeichnislisting aus
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN`
- eine restriktive `Permissions-Policy`
- eine Content Security Policy ohne externe Skripte und ohne Laufzeitverbindungen

Die CSP erlaubt Inline-Styles, weil Fluent UI 8 Style-Elemente zur Laufzeit erzeugt. Inline-Skripte, `eval` und externe Verbindungen bleiben verboten. Diese dokumentierte Ausnahme ist vor einem Technologiewechsel erneut zu beurteilen.

## 7. Cachemodell

- `index.html` wird nicht gespeichert und bei jedem Aufruf neu validiert.
- inhaltsadressierte JavaScript- und CSS-Dateien werden ein Jahr als unveränderlich gespeichert.
- SVG-Dateien werden höchstens 30 Tage gespeichert.
- ein neuer Build erzeugt bei Inhaltsänderungen neue Assetnamen.

Dadurch kann neues HTML auf neue Dateien zeigen, ohne bestehende Browsercaches aktiv leeren zu müssen. Alte gehashte Assets dürfen erst entfernt werden, wenn die Rückfallfrist abgelaufen ist.

## 8. Rückfall

Ein Rückfall wird ausgelöst, wenn D01 bis D12 nicht vollständig bestehen oder nach der Umschaltung ein fachlicher, technischer oder datenschutzrechtlicher Fehler auftritt.

1. Verlinkung vom Root-Webauftritt sofort entfernen, falls sie bereits aktiviert wurde.
2. Gesicherten früheren Ordnerstand atomar wiederherstellen. Falls vorher keine P-Ausprägung bestand, den neuen Pfad deaktivieren oder auf eine neutrale Nichtverfügbarkeitsseite zurückstellen.
3. Browsercache nicht pauschal löschen. Das nicht cachebare HTML muss wieder auf die gültigen gehashten Assets zeigen.
4. Öffentliche Adresse, Header und Root-Webauftritt erneut prüfen.
5. Ursache und Rückfallzeitpunkt im Issue und im Betriebsnachweis dokumentieren.
6. Fehler lokal korrigieren und einen vollständig neuen Kandidaten bauen. Einzelne Produktionsdateien werden nicht direkt verändert.

## 9. Betrieb und Aktualisierung

Jeder spätere P-Release durchläuft mindestens:

1. vollständig freigegebener Code- und Datenstand
2. `npm run check`
3. neuer statischer Produktionsbuild
4. neue Prüfsummen
5. lokale AP16-Regressionsprüfung
6. Sicherung und temporärer Upload
7. D01 bis D12
8. dokumentierte P-Freigabe

Die periodische Quellenprüfung nach AP13 bleibt unabhängig vom Hostingmodell verbindlich. Ein unverändertes Prüfungsergebnis erfordert keinen neuen Datenrelease und keinen neuen P-Build.

## 10. Verantwortlichkeit

David Steimer entscheidet über Upload, Umschaltung, Rückfall und Betriebsfreigabe. Codex kann Build, Nachweise und Prüfungen vorbereiten, übernimmt aber keine formelle Freigabe- oder Haftungsverantwortung.

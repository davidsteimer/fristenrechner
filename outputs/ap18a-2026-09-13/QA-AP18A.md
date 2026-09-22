# AP18A: Liefer- und Prüfnachweis

Stand: 13. September 2026. Status: zur fachlich-technischen Abnahme vorgelegt, nicht freigegeben.

**Nachtrag nach Lieferung, 13. September 2026:** David Steimer bestätigt, dass die Tabelle wie erwartet funktioniert und die Interaktion in Excel problemlos ist. Damit ist der Nutzertest für die unten identifizierte V0.1 bestätigt. Die ursprünglichen Prüfgrenzen im folgenden Protokoll dokumentieren den Stand vor dieser Rückmeldung. V0.1 bleibt unverändert. Die anschliessend angeforderten Sprachfelder für Italienisch und Rumantsch Grischun werden als separate V0.2 mit [eigenem Prüfnachweis](QA-AP18A-V0.2.md) geliefert. Aus der Rückmeldung wird keine formelle Gesamt-Abnahme von AP18A oder sprachliche Freigabe abgeleitet.

## Dateiidentität und Umfang

- Datei: `2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.1.xlsx`
- SHA-256: `3af259515c502ef563cc3097bce0c7e15147d5158ac9590f95c014bbebd81aa4`
- Acht Arbeitsblätter, sieben native Excel-Tabellen, 178 Formelzellen, fünf native Quellenlinks
- 27 inventarisierte Gemeinwesen, zwölf unveränderte CH-/BE-Referenzregeln und drei offene AG-Strukturbeispiele
- 16 abgeleitete Kalenderzeilen für 2027. Die Jahre 2026–2028 sind geprüft
- 24 Kantone noch nicht erhoben. AG ebenfalls keine vollständige Kantonsliste

Grundlage und Abnahmegrenze stehen im [AP18-Arbeitsmappenvertrag](../../docs/architektur/feiertagsmatrix-ap18a.md). Die amtlichen Belege sind im [Quellennachweis](../../docs/fachrecht/quellenpruefung-ap18a.md) dokumentiert.

## Tatsächlich durchgeführte Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| Modell- und Referenztests | 48 von 48 bestanden, kein Test übersprungen |
| CH-/BE-Datumsparität | 2026–2028 gegen ausgeprägte MVP-0.2-Referenzlisten und tatsächlichen TypeScript-Generator bestätigt |
| Referenzidentität | Manifest und CH-/BE-Kalender des Approved-Releases `2026-08-31-mvp-03-approved.1` stimmen mit fest gebundenen SHA-256-Werten überein |
| Arbeitsmappenformeln | 45 Datumsvergleiche, 15 Regeln in drei Jahren, bestanden |
| Erneutes Öffnen der tatsächlich gespeicherten XLSX | Import in die gebündelte Tabellenlaufzeit erfolgreich. Dieselben 45 Datumsvergleiche nach Jahrwechsel erneut bestanden |
| Fehlerzellen | Keine Formel-Fehlertreffer beim Build und nach Wiederimport. Keine OOXML-Zellen vom Typ `e` |
| Paketintegrität | ZIP-Prüfung bestanden, XML-Teile parsebar, sieben Tabellen mit Filtern vorhanden |
| Native Einstellungen | Acht geschützte Blätter ohne Passwort. Jahreszelle B4 entsperrt, Ganzzahlvalidierung 2026–2028. In sieben Tabellenblättern erste Spalte und sechs Kopfzeilen fixiert |
| Quellenlinks | Fünf native HTTPS-Hyperlinks, Linkziele exakt gegen den Quellenbestand geprüft. Original-URL zusätzlich sichtbar |
| Makros und Datenverbindungen | Keine Makros, externen Arbeitsmappenverknüpfungen oder Excel-Datenverbindungen |
| Metadaten | Autoren- und Bearbeitermetadaten entfernt. Keine lokalen Benutzerpfade oder internen Test-E-Mail-Adressen in den XML-Inhalten gefunden |
| Visuelle QA | Alle acht Blätter sowie die Fortsetzungen breiter Tabellen in insgesamt 14 Ansichten geprüft, aus der gespeicherten Datei neu gerendert |
| Änderungen am Betrieb | Keine. App, freigegebene Releases, Mirror und Hosting unverändert |

Die Spreadsheet-Skill-Prüfung wurde angewendet. Die erste gespeicherte Zwischenfassung deckte einen fehlerhaften Export der Funktion `HYPERLINK` auf. Die Endfassung verwendet native Excel-Hyperlinks. Das Datumsformat verwendet explizit maskierte Punkte, damit auch der Renderer Datumswerte statt Seriennummern anzeigt. Diese Korrekturen sind in der oben identifizierten Zieldatei enthalten.

## Sichtprüfung

Die Ansichten enthalten den tatsächlichen Zellbestand der finalen XLSX nach erneutem Import. Sie sind keine Screenshots aus Excel Desktop oder Excel Web.

| Blatt oder Teilansicht | Gerenderter Nachweis |
| --- | --- |
| Übersicht | [Ansicht 01](qa/saved-01-Übersicht.png) |
| Gemeinwesen, alle 27 Einträge | [Ansicht 02](qa/saved-02-Gemeinwesen.png) |
| Feiertagsregeln, Identität und Rechenart | [Ansicht 03](qa/saved-03-Feiertagsregeln.png) |
| Geltungsbereiche | [Ansicht 04](qa/saved-04-Geltungsbereiche.png) |
| Rechtsquellen | [Ansicht 05](qa/saved-05-Rechtsquellen.png) |
| Verfahrensbezug | [Ansicht 06](qa/saved-06-Verfahrensbezug.png) |
| Quellenprüfung | [Ansicht 07](qa/saved-07-Quellenprüfung.png) |
| Feiertagskalender | [Ansicht 08](qa/saved-08-Feiertagskalender.png) |
| Regelparameter, Freigabebasis, Ergebnisse und Quellen | [Ansicht 09](qa/saved-09-Feiertagsregeln.png) |
| Transparente Osterrechnung | [Ansicht 10](qa/saved-10-Feiertagsregeln.png) |
| Quellenstatus, Freigabebasis und Original-URL | [Ansicht 11](qa/saved-11-Rechtsquellen.png) |
| Prüfverantwortung und Folgemassnahme | [Ansicht 12](qa/saved-12-Quellenprüfung.png) |
| Zeitliche Geltung der Gebiete | [Ansicht 13](qa/saved-13-Geltungsbereiche.png) |
| Kalender mit Regel- und Quellenbezug | [Ansicht 14](qa/saved-14-Feiertagskalender.png) |

## Grenzen und noch offene Abnahme

**Eine native Interaktionsprüfung in Excel Desktop oder Excel Web ist noch nicht erfolgt.** Insbesondere das Filter- und Sortierverhalten unter Blattschutz sowie die Neuberechnung in der konkret verwendeten M365-Version bleiben im Nutzertest zu prüfen. Falls die Version Sortieren unter Blattschutz verhindert, kann der Schutz ohne Passwort aufgehoben werden. Keine fachliche Freigabe wird durch diesen Schritt erteilt.

Für den kurzen Nutzertest:

1. Die Datei in Excel öffnen. Erwartet wird eine fehlerfreie Öffnung ohne Reparaturmeldung oder Datenverbindungsabfrage.
2. Auf «Übersicht» B4 auf 2026 und danach auf 2028 setzen. Im Kalender muss beispielsweise Ostern von 05.04.2026 auf 16.04.2028 wechseln.
3. Auf «Feiertagskalender» nach `CH-BE` filtern. Erwartet werden zwölf benannte Feiertage einschliesslich Bundesfeiertag.
4. Auf «Rechtsquellen» einen amtlichen Link öffnen und die nachvollziehbare Zuordnung zu Regel und Fundstelle prüfen.
5. Die Feldstruktur und die klare Kennzeichnung der offenen AG-Beispiele fachlich beurteilen.

AP18A enthält keinen XLSX-Importer und keinen Kandidatenexport. Änderungen am Zeilenbestand oder an Gebietszuordnungen verlangen eine Neugenerierung. Jede fachliche Änderung verliert die frühere Referenzfreigabe. Die fachliche und technische Abnahme durch David Steimer ist noch ausstehend.

Das öffentliche Issue #36 wurde am 13. September 2026 um den AP18-Start und die Teilpakete ergänzt und danach zurückgelesen. Die Arbeitsdateien wurden nicht in das öffentliche Repository gepusht. Keine Freigabe oder Erledigung des Gesamtitems wurde eingetragen.

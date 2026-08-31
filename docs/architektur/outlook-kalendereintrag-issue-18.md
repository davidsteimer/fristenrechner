# Issue #18: Outlook-kompatibler Kalendereintrag

| Merkmal | Stand |
| --- | --- |
| Backlog-Item | GitHub-Issue [#18](https://github.com/davidsteimer/fristenrechner/issues/18) |
| Umsetzungsstand | fachlich und funktional abgenommen, Tenantprüfung ausstehend |
| Datum | 31. August 2026 |
| Betroffene Schicht | hostneutrale Rechneroberfläche |
| Datenmodell | unverändert |
| M365-Berechtigungen | unverändert, kein Microsoft Graph |

## 1. Ergebnis

Nach einer vollständig berechneten Frist kann die Benutzerin oder der Benutzer eine Outlook-kompatible `.ics`-Datei erzeugen. Die Funktion ist rein clientseitig. Sie schreibt keinen Termin in ein Postfach und führt keinen Netzwerkzugriff aus.

Im häufigen allgemeinen Berechnungsfall belegt die Funktion die bisher leere sechste Kachel rechts unten im Resultatraster. Die Schaltfläche zur Dateierzeugung übernimmt zugleich die Rolle des sichtbaren Kachelkopfs. Darunter bleiben nur die optionale Referenz und der kurze Hinweis zur Nicht-Speicherung. Bei berechneten Spezialregimen erscheint dieselbe Funktion als breite Zusatzkachel unter den sechs fachlichen Resultatfeldern. Gesperrte Resultate und Spezialresultate mit dem Status `manualReview` bieten keinen Export an. Ein Datum mit ausdrücklich ausstehender Fachprüfung wird damit nicht als verlässlicher Kalendereintrag weitergereicht.

Die optionale Referenz ist ein reiner Freitext im aktuellen React-Zustand. Eine neue Berechnung, eine geänderte Facheingabe oder das Zurücksetzen des Resultats löscht sie. Sie ist kein Default und wird weder im Browser gespeichert noch in Datenrelease, SharePoint-Mirror oder Rechenspur übernommen.

## 2. iCalendar-Vertrag

Die Datei folgt dem für Outlook geeigneten iCalendar-Vertrag nach RFC 5545:

| Eigenschaft | Umsetzung |
| --- | --- |
| Dateiname | `fristablauf-YYYY-MM-DD.ics` |
| Terminart | ganztägig mit `DTSTART;VALUE=DATE` |
| Terminende | exklusiver Folgetag mit `DTEND;VALUE=DATE` |
| Betreff Deutsch | `Fristablauf` oder `Fristablauf (Referenz)` |
| Betreff Französisch | `Échéance du délai` oder `Échéance du délai (Référence)` |
| Verfügbarkeit | `TRANSP:TRANSPARENT` und Outlook-Zusatz `X-MICROSOFT-CDO-BUSYSTATUS:FREE` |
| Kategorie | sprachunabhängig `Fristablauf` |
| Erinnerung | `TRIGGER:-PT112H`, entsprechend 4 Tagen und 16 Stunden vor Terminbeginn |
| Zeichensatz | UTF-8, Textwerte RFC-konform maskiert |
| Zeilenformat | CRLF, Faltung auf höchstens 75 UTF-8-Oktette |

Der exklusive Folgetag wird mit derselben ISO-Kalenderdatumsarithmetik wie im Rechenkern bestimmt. Damit bleiben Monatsende, Jahreswechsel und Schaltjahr unabhängig von Uhrzeit und Zeitzone.

Die Kategorie bleibt auch in der französischen Oberfläche `Fristablauf`. So entsteht in Outlook nicht für jede Produktsprache eine eigene Kategorie. Eine `.ics`-Datei kann den Kategorienamen übertragen, Outlook jedoch nicht zuverlässig eine Postfachfarbe zuweisen. Die Benutzerin oder der Benutzer muss der Kategorie deshalb in Outlook einmalig Dunkelgrün zuordnen. Der technische Vorbehalt bleibt in diesem Vertrag dokumentiert. Der zunächst vorgesehene aufklappbare Outlook-Hinweis wurde zugunsten der kompakten Resultatkachel aus dem GUI entfernt.

## 3. Erinnerung und Sommerzeit

Die Erinnerung ist bewusst als relative Dauer `-PT112H` modelliert. Outlook interpretiert sie bezogen auf den Beginn des ganztägigen Termins. Fällt der Zeitraum über einen Wechsel zwischen Normal- und Sommerzeit, kann die angezeigte lokale Erinnerungsuhrzeit um eine Stunde abweichen. Release 2 akzeptiert und dokumentiert diese Outlook-Grenze. Er ersetzt sie nicht durch eine eigene, postfach- oder zeitzonenabhängige Uhrzeitberechnung.

## 4. Datenschutz und Berechtigungen

- Die Referenz wird auf 200 Zeichen begrenzt, Leerraum wird normalisiert und iCalendar-Steuerzeichen werden maskiert.
- Die Referenz erscheint nur im Betreff der lokal erzeugten Datei.
- Dateiname, technische UID und Erstellungszeitpunkt enthalten keine Referenz.
- Es gibt keine Speicherung in `localStorage`, `sessionStorage`, IndexedDB, SharePoint oder einem Datenrelease.
- Es gibt keinen `fetch`-Aufruf, keine Entra-App und keine Microsoft-Graph-Berechtigung.
- Die Datei wird als lokales Browser-Blob erzeugt. Nach dem Download liegt ihre weitere Behandlung bei der Benutzerin oder beim Benutzer.
- Die Beschreibung im Termin wiederholt den rechtlichen Hinweis, dass der Fristenrechner ein Hilfsmittel ohne Gewähr ist.

Eine spätere direkte Erstellung, Änderung oder Löschung von Outlook-Terminen wäre eine andere Architektur. Sie würde Microsoft-Graph-Berechtigungen, Einwilligungs- und Betriebskonzepte sowie einen eigenen Entscheid benötigen.

## 5. Prüfumfang

Automatisiert geprüft sind:

- leerer und ausgefüllter Referenzwert
- deutsche und französische Betreffe und Produkttexte
- Komma, Semikolon, Backslash, Zeilenumbruch und lange Unicode-Referenzen
- Monatsende, Jahreswechsel und Schalttag
- ganztägiger Termin, freier Status, Kategorie und Erinnerung von exakt 112 Stunden
- unveränderter Trigger über beide Schweizer Zeitumstellungen
- CRLF, UTF-8-Zeilenfaltung und externer Terminendtag
- Ablehnung eines ungültigen Fristdatums
- fehlende Netzwerk-, Graph- und Browser-Speicherzugriffe
- Platzierung in der sechsten Resultatkachel und responsive Ansicht ohne horizontales Überlaufen

Die lokale Browserprüfung bestätigt Deutsch, Französisch, Tastaturerreichbarkeit und eine Dokumentbreite von 375 Pixeln bei einer 390-Pixel-Ansicht. Die reine Dateierzeugung und der Downloadadapter sind automatisiert geprüft. Der Import in Outlook Web und Outlook Desktop bleibt Teil der Release-2-Testmatrix. Bis zu diesem Hosttest ist die Funktion fachlich abgenommen, aber noch nicht betrieblich freigegeben.

Der SPFx-Integrationscheck wurde mit der vorgesehenen Node-22-Toolchain, 17 Provider- und Hosttests, Produktionsbuild, CSS-Audit und fehlerfreier Paketprüfung abgeschlossen. Das definitive Release-2-Paket trägt die Version `0.3.0.0` und wird vor der Tenantmatrix neu auf den unveränderlichen MVP-0.3-Datencommit gebaut.

## 6. Entscheidungsnachweis

Issue #18 und dieser Vertrag konkretisieren eine bereits geplante Produktfunktion, ohne das Fach- oder Datenmodell und ohne die M365-Berechtigungsarchitektur zu ändern. Deshalb ist für den lokalen Kandidaten kein neuer Grundsatzentscheid erforderlich. Ein Wechsel zu direktem Microsoft-Graph-Zugriff wäre materiell und müsste vor der Umsetzung als neuer DEC dokumentiert werden.

David Steimer hat Issue #18 am 31. August 2026 nach funktionaler Prüfung abgenommen. Die Abnahme umfasst die Dateierzeugung, die Standardwerte, die reduzierte Resultatkachel und die dokumentierten Outlook-Grenzen. Die technische Tenant- und Outlook-Prüfung bleibt Bestandteil der Release-2-Matrix.

---
id: DEC-2026-034
titel: "Gebündelter nächster Release für die allgemeinen kantonalen Verwaltungsverfahren"
status: beschlossen
entscheidungsdatum: 2026-10-22
klasse: A
entschieden_durch: David Steimer
quelle:
  - "Auftrag vom 22.10.2026 zur Nachführung von #48 und zum Start von AP23F1 für ZH, AG und SG"
  - "Von David vorgeschlagener und im Projektgespräch bestätigter Verzicht auf weitere Zwischenreleases bis zur Kantonsabdeckung"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-034 Gebündelter schweizweiter Ausbau nach MVP 0.9

## Ausgangslage und Auftrag

[MVP 0.9 ist produktiv freigegeben](../betrieb/produktionsbereitstellung-mvp09-2026-10-19.md). Allgemeine kantonale Verwaltungsverfahren sind im modellierten Umfang für BE, TI, GR, LU, ZG und AR verfügbar. Die übrigen 20 Kantone sind strukturell erfasst, aber nicht operativ freigegeben.

David Steimer hat am 22. Oktober 2026 den Start von AP23F1 für Zürich, Aargau und St. Gallen sowie die Nachführung von Issue #48 und der lebenden Einstiegstexte beauftragt. Er schlägt vor, bis zur Abdeckung aller Kantone auf weitere Releases zu verzichten. Dieses Vorgehen ist im Projektgespräch bestätigt.

## Entscheid

- Die weiteren allgemeinen kantonalen Verwaltungsverfahren werden weiterhin in kleinen, einzeln prüfbaren Fach- und Umsetzungstranchen bearbeitet. WIP-Limit 1 und höchstens fünf Nettoarbeitstage pro ausführbarem Teilpaket bleiben unverändert.
- Die nächste reguläre Auslieferung wird bis zum Abschluss der Kantonsabdeckung gebündelt. Es gibt vorerst keinen weiteren Zwischenrelease einzelner Kantonsgruppen. Eine konkrete Produkt-, Paket- oder Formatversion wird damit nicht festgelegt.
- MVP 0.9 bleibt der freigegebene Betriebsstand. Lokale Fachvorlagen, Referenzfälle, technische Kandidaten und menschliche Teilabnahmen sind keine Betriebsreleases. Installation, Mirrorumstellung und Produktivbereitstellung benötigen weiterhin ihre späteren konkreten Freigaben.
- «Alle Kantone abgedeckt» bezeichnet die ausdrücklich abgegrenzten allgemeinen kantonalen Verfahrenswege vor kantonalen Zielstellen, nicht sämtliche denkbaren Fristen oder Spezialerlasse. Je Kanton müssen unterstützte Wege, Verfahrensstufen, Rechtsgrundlagen, Kalenderbindung, Zeitfenster, Referenzfälle und Ausschlüsse feststehen. Eine allgemeine Verwaltungs- und Gerichtsabdeckung darf nicht allein aus einer Feiertagsliste oder einem offenen Prüfauftrag abgeleitet werden.
- Offene Fragen mit Einfluss auf das Ergebnis werden nicht als gelöst oder vollständig abgedeckt gezählt. Ist eine Frage bis zum gemeinsamen Abschluss nicht lösbar, entscheidet David gesondert über die konkrete begrenzte Sperre oder eine Anpassung des Gesamtumfangs. Dieser Entscheid erteilt keine solche Ausnahme vorab.
- Eigenständige kommunale Erlasse, kantonale Spezialerlasse, zusätzliche Sozialanbindungen und IT-/RG-Oberflächensprachen bleiben gesonderte Umfänge. Der gemeinsame Release wird dadurch nicht automatisch um diese Vorhaben erweitert.

## Folgen und Abgrenzung

Die [neue Arbeitsplanung](../planung/schweizausbau-nach-mvp09.md) führt die noch offenen Kantone und startet AP23F1 als Fachvorlage ZH/AG/SG. Darauf folgen erst nach Fachabnahme Vertragsprobe und Integration. Neue Formatversionen benötigen weiterhin einen nachgewiesenen Bedarf und einen eigenen Entscheid.

Der Entscheid ändert für den weiteren Ausbau die bisherige Möglichkeit, einzelne Kantonsgruppen jeweils separat auszuliefern. Die ursprüngliche Priorisierung und die bereits abgeschlossenen Releases nach [DEC-2026-027](DEC-2026-027-schrittweiser-schweizausbau.md) bleiben historisch gültig. Auch AP23A und der frühere AP23E-Plan werden nicht rückwirkend umgeschrieben.

Eine dringende Fehler- oder Sicherheitskorrektur würde einen gesonderten Auftrag und einen neuen konkreten Betriebsentscheid erfordern. Sie ist kein vorab freigegebener Zwischenrelease. Die bestehenden MVP09-Vorbehalte, Datenbytes und Betriebsrechte bleiben unverändert. Der Verzicht auf Header-/Cache-Wiederholungsprüfungen wird nicht aufgehoben.

Die längere Bündelung verlangt vor dem gemeinsamen Release einen aktuellen Gesamtquellen- und Fassungsabgleich. Frühere Quellenprüfungen sind nur mit begründeter Wiederverwendung anzurechnen. Bereits abgenommene Zeitfenster werden nicht automatisch verlängert.

David Steimer trifft die menschlichen Fach-, Umfangs- und Betriebsentscheide in Personalunion. Codex bereitet vor und prüft als dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

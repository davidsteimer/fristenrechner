---
id: DEC-2026-019
titel: "Gestufte Bedienung für VRPG Bern und Spezialrecht"
status: beschlossen
entscheidungsdatum: 2026-09-11
klasse: A
entschieden_durch: "David Steimer"
quelle:
  - "Freigabe der klickbaren UI-Skizze und Auftrag zur Umsetzung vom 11. September 2026"
  - "Backlog-Item #35, VRPG und ATSG"
  - "UI-Skizze 01 vom 11. September 2026"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-019: Gestufte Bedienung für VRPG Bern und Spezialrecht

## Ausgangslage

Die bisherige Auswahl der VRPG-Spezialregime ist fachlich strukturiert, bildet den Arbeitsablauf aber zu wenig ab. Insbesondere im Sozialversicherungsrecht reicht die pauschale Auswahl des ATSG nicht, um das tatsächlich anwendbare Fristenregime sicher zu bestimmen. Der Spezialerlass, die konkrete Verfahrenshandlung und gegebenenfalls das Verfahrensstadium müssen unterscheidbar sein.

David Steimer hat Variante 2 der diskutierten Bedienkonzepte gewählt, um das Beschaffungsrecht ergänzt und den konsequent zweispaltigen Aufbau verlangt. Am 11. September 2026 hat er die daraus erstellte klickbare UI-Skizze als passend bestätigt und die Dokumentation als Beschluss sowie den Beginn der Umsetzung beauftragt.

## Geprüfte Optionen

1. **Aufteilung bereits in der Auswahl des Verfahrensrechts**
   - Vorteil: häufig verwendete Bereiche sind mit einer Auswahl erreichbar.
   - Nachteil: die Erlassauswahl vermischt Verfahrensrecht und Rechtsgebiet und wächst mit jedem weiteren Spezialbereich.
2. **Gemeinsamer Einstieg mit gestuften Folgeauswahlen auf derselben Oberfläche**
   - Vorteil: Rechtsgebiet, Spezialerlass, Handlung und Stadium bleiben verständlich getrennt. Nur relevante Folgefelder werden eingeblendet.
   - Nachteil: seltene Spezialfälle benötigen zusätzliche Eingaben und eine explizite Anwendbarkeitszuordnung.

## Entscheid

Variante 2 wird als Bedienkonzept für die Weiterentwicklung des Berner Fristenrechners beschlossen:

- Nach dem Sitz der zuständigen Behörde folgt die Auswahl des Verfahrensrechts. Der gemeinsame Einstieg lautet «VRPG Bern und Spezialrecht».
- Unter «Bereich» stehen allgemeines Verwaltungsrecht, Sozialversicherungsrecht, politische Rechte und Beschaffungsrecht zur Verfügung.
- Abhängig vom Bereich folgen Spezialerlass beziehungsweise konkrete Situation und Verfahrenshandlung. Das Verfahrensstadium wird nur abgefragt, wenn es relevant ist und nicht bereits eindeutig aus den übrigen Angaben hervorgeht.
- Die Auswahl erfolgt auf derselben Rechneroberfläche, nicht in einem mehrseitigen Assistenten.
- Eingaben, Aktionsschaltflächen, Ergebnis und automatische Parameter folgen auf ausreichender Bildschirmbreite konsequent demselben zweispaltigen Raster. Schmale Mobilansichten dürfen für lesbare Felder und Beschriftungen auf eine Spalte wechseln.
- Die vier Aktionsschaltflächen stehen als zwei Reihen unmittelbar nach den Eingaben. Das Ergebnis folgt vor den automatisch bestimmten Parametern.
- «Bitte wählen» ist ein zulässiger, speicherbarer Auswahlzustand. Solange erforderliche Angaben fehlen oder eine Zuordnung nicht freigegeben ist, entsteht kein Berechnungsergebnis.
- Persönliche Standards dürfen stabile fachliche Auswahlen enthalten. Datumsangaben und freie Referenzen werden nicht als Standards gespeichert.
- Änderungen einer übergeordneten Auswahl leeren unvereinbare Unterauswahlen und das bisherige Ergebnis. Der Wechsel darf kein altes oder fachlich unpassendes Ergebnis stehen lassen.
- Deutsch und Französisch bleiben gleichwertige Produktsprachen. Automatisch bestimmte Parameter und zulässige Übersteuerungen bleiben sichtbar und nachvollziehbar.

Beschlossen ist das Bedienkonzept. Die rechtlichen Beispiele und Platzhalter der Skizze sind weder eine Freigabe neuer Rechtsregeln noch ein Nachweis ihrer Vollständigkeit. Die bestehende Sperre ungeklärter ATSG-/VwVG-Anwendbarkeit bleibt bestehen. Insbesondere gibt es keinen stillen Rückfall auf die allgemeine VRPG-Regel.

## Begründung

Die gestufte Auswahl bildet den fachlichen Entscheidungsweg ab, ohne das normale Arbeiten mit gespeicherten Standards unnötig zu verlängern. Das Beschaffungsrecht wird als eigener Bereich erkennbar, ohne eine weitere Hauptkategorie in der Erlassauswahl zu schaffen. Das gemeinsame Raster hält die Oberfläche auch bei unterschiedlich vielen Folgefeldern ruhig.

Die Trennung von Bedienfreigabe und Fachfreigabe erlaubt eine schrittweise Umsetzung, ohne aus einem überzeugenden Entwurf eine nicht geprüfte Rechtsanwendung abzuleiten.

## Folgen

### Auswirkungen

- AP17 setzt das Konzept in drei aufeinanderfolgenden, einzeln prüfbaren Schritten um. Die Ausführung und Abnahmegrenzen stehen im [AP17-Bedien- und Realisierungsplan](../ux/vrpg-bedienkonzept-ap17.md).
- AP17A beginnt mit der kontrollierten Auswahl auf Basis bereits freigegebener Regime für das allgemeine VRPG und die politischen Rechte. Die Bereiche Sozialversicherungsrecht und Beschaffungsrecht sind als Auswahlgerüst erkundbar, bleiben mangels freigegebener konkreter Zuordnungen aber für die Berechnung gesperrt. Neue Anwendbarkeitszuordnungen werden nicht durch UI-Code oder Skizzenwerte freigeschaltet.
- AP17B klärt und dokumentiert die noch offenen fachlichen Zuordnungen mit amtlichen Quellen und Referenzfällen, bevor sie zur Aktivierung freigegeben werden können.
- AP17C integriert den freigegebenen Fachstand und bereitet einen gesondert abzunehmenden Releasekandidaten für die bestehenden Ausprägungen vor.

### Risiken und Grenzen

- Ein vierter sichtbarer Bereich bedeutet noch keine vollständige Abdeckung sämtlicher Beschaffungs- oder Sozialversicherungsverfahren.
- Nicht freigegebene Kombinationen bleiben mit verständlicher Erklärung gesperrt. Die Übersteuerung von Kalenderparametern darf diese Sperre nicht umgehen.
- Die bestehenden freigegebenen Datenreleases, die Produktivinstallation und die Betriebsfreigaben werden durch diesen Beschluss nicht verändert.
- Die Umsetzung ist beauftragt, aber weder AP17A noch AP17B oder AP17C sind mit diesem Beschluss abgenommen. Veröffentlichung, Datenpromotion und Deployment benötigen weiterhin die jeweils erforderliche ausdrückliche Freigabe.

### Folgearbeiten und Rückabwicklung

- Die im Projektgespräch abgenommene UI-Skizze 01 vom 11. September 2026 ist die visuelle Referenz. Ihr verbindlicher Auswahl-, Layout- und Zustandsvertrag ist im AP17-Bedienkonzept dokumentiert. Die interaktive Gesprächsskizze ist kein Repository- oder Produktionsartefakt und enthält keine ausführbare fachliche Fristberechnung.
- Historische abgenommene AP11-Unterlagen bleiben unverändert. Dieses Dokument beschreibt die neue Bedienrichtung, ohne DEC-2026-014 oder die geltenden Fachfreigaben abzulösen.
- Bis zu einer neuen Releasefreigabe bleibt der bisherige freigegebene Produktstand unverändert verfügbar. Eine spätere materielle Änderung dieses Bedienentscheids wird mit neuer DEC-ID dokumentiert.

## Nachweise

- [AP17-Bedienkonzept und schlanker Realisierungsplan](../ux/vrpg-bedienkonzept-ap17.md)
- UI-Skizze 01 und ausdrückliche Zustimmung von David Steimer im Projektgespräch vom 11. September 2026
- [GitHub-Issue #35](https://github.com/davidsteimer/fristenrechner/issues/35)
- [Offene Fachfrage OF-012](../fachrecht/offene-fachfragen.md)
- [DEC-2026-008: WIP-Limit und Paketgrösse](DEC-2026-008-wip-limit-und-paketgroesse.md)
- [DEC-2026-014: Komponentenweise Formatevolution](DEC-2026-014-komponentenweise-fachdatenformatevolution.md)

## Verantwortlichkeit

Entschieden durch David Steimer. Er nimmt weiterhin die menschlichen Projekt-, Fach- und Freigaberollen in Personalunion wahr. Codex dokumentiert den Beschluss und unterstützt Umsetzung und Prüfung, übernimmt aber keine formelle Freigabe- oder Haftungsverantwortung.

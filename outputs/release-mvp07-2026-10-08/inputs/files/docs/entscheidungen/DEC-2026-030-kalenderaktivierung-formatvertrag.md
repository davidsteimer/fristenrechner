---
id: DEC-2026-030
titel: "Datenvertrag für die schweizweite Kalenderaktivierung"
status: vorgeschlagen
entscheidungsdatum: null
klasse: B
entschieden_durch: null
quelle:
  - "Startauftrag AP22B vom 8. Oktober 2026"
  - "Abschluss AP22A und DEC-2026-028/029"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-030 Datenvertrag für die schweizweite Kalenderaktivierung

## Ausgangslage

AP22A ist abgeschlossen. Die fachlichen Listenentscheide und die vier ergebnisabhängigen Januargrenzen sind beschlossen. Die bestehenden geschlossenen Produktformate erlauben jedoch weder schweizweite operative Kalender noch deren neue Auswahl- und Bedingungsregeln. Der Auftrag zum Beginn von AP22B ist noch kein Beschluss der neuen Hauptversionen.

## Geprüfte Optionen

1. **Unveränderte Formate oder blosse Freischaltflags:** ungeeignet. Sie würden historische Verträge aufweichen und Erhebung mit operativer Verwendung vermischen.
2. **Zusätzliche jährliche Datumsdateien:** als späterer Export möglich, aber keine geeignete Grundlage für das vorhandene regelbasierte Kalendermodell.
3. **Versionierte Kalender und explizite Bindungen im Katalog:** empfohlen. Gemeinsamer Generator, nachvollziehbare Herkunft, getrennte Readerzweige und bestehende Infrastruktur bleiben nutzbar.

## Vorgeschlagener Entscheid

Der [AP22B-Daten- und Migrationsvertrag](../architektur/kalendervertrag-ap22b.md) wird mit folgenden Eckpunkten bestätigt:

- Feiertagskatalog **2.0.0**, Regelkalender **3.0.0**, Manifest und Mindestconsumer **7.0.0**.
- Rechtsprofile 1.0.0, Spezialregimekatalog 3.0.0 und Sozialverfahrenskatalog 2.0.0 bleiben als Formate unverändert. Sämtliche Kalender eines neuen Format-7-Releases verwenden Format 3.
- 198 Herkunftsentscheidungen werden von 104 terminalen Verfahrensbindungen getrennt. Der konkrete Vorlagenstand bildet daraus 32 Kalenderdefinitionen. Alle 479 bisherigen Katalogregeln bleiben erhalten. Zwölf gesonderte SO-Prozessregeln werden unter `SO-PROCEDURAL-ALL` ergänzt.
- Rollen und regionale Genauigkeit werden ausdrücklich qualifiziert. Kein erster Kalendertreffer, keine freie Vereinigung konkurrierender Listen und kein stiller BE-/CH-Ersatzwert.
- Die vier Januargrenzen werden durch zwei sonst identische vollständige Berechnungen geprüft. Nur die konkret gebundene unsichere Regel wird variiert. Bei unterschiedlichem rechtlichem Ergebnis gibt es weder definitives Fristresultat noch Kalenderexport. GR-/NE-Vorbehalte bleiben davon getrennte berechenbare Grenzen.
- Neue Kalenderabdeckung **29.08.2026 bis offen**, zusätzlich begrenzt durch die je Tag anwendbaren Normen, Gebietsstände, Profilgrenzen und Releasefreigaben. Kein unbegrenzter Rechtsbeständigkeitsnachweis. Die Sozialfreigaben bleiben auf 2026–2027 beschränkt.
- Neue Releasebindungen des Sozialkatalogs trotz unveränderter 44 Fachregeln und 50 BE-Anbindungen. Keine ausserbernische Sozialfreigabe, kein zusätzliches kantonales Verwaltungsverfahren.
- Historische Formate und AP5-Pins bleiben erhalten. Defaults werden auf Version 4 ohne erfundene Fallfakten migriert. Provider-/Cachefallback wird an die tatsächliche Datenkonfiguration gebunden.

## Begründung

Die Hauptversionsgrenzen machen das semantische Delta sichtbar. Eine Mischung alter und neuer Kalenderformate im neuen Release würde die ohnehin notwendige Neuanbindung des Sozialkatalogs nicht vermeiden. Die explizite Listenauswahl verhindert, dass eine archivierte regionale oder arbeitsrechtliche Liste als falscher Prozesskalender verwendet wird.

## Folgen

### Auswirkungen

TypeScript- und Python-Prüfung, Schemata, UI, Provider und SPFx müssen gemeinsam erweitert werden. Die konkrete Vorlage sieht 40 manifestgebundene Datendateien plus Manifest vor. Kein neues Hosting, keine neue API und keine zusätzlichen M365-Rechte.

### Risiken und Grenzen

Ein Schema- oder Strukturtest beweist noch keine neue Fristberechnung. Reale Kalenderauflösung, Januarvergleich und Datenübernahme bleiben Umsetzungsschritte. Periodische Quellenprüfung und bestehende fachliche Vorbehalte gelten weiter. Die heute vorgeschlagene technische Zeitabdeckung ist ausdrücklich Teil des noch zu beschliessenden Vertrags.

### Folgearbeiten und Rückabwicklung

Nach fachlich-technischer AP22B-Abnahme und ausdrücklichem Beschluss folgen getrennte AP22C-Teilpakete. Der neue Kandidat wird nicht in alte Releaseordner geschrieben. Rückfall ist die gebundene bisherige Release-/Providerkonfiguration, keine Rückkonvertierung neuer Daten in ein altes Format. Releasepromotion, Publikation und E/Q/P-Bereitstellung bleiben gesondert freizugeben.

## Nachweise

- [Vertrag](../architektur/kalendervertrag-ap22b.md) und [Prüfnachweis](../architektur/kalendervertrag-ap22b-pruefung.md)
- [Strukturprobe](../../tests/golden/candidates/ap22b-holiday-contract.json) und [Referenzindex](../../tests/golden/candidates/ap22b-calendar-references.json)
- [AP22A-Abschluss](../fachrecht/abschluss-ap22a.md), [DEC-2026-028](DEC-2026-028-operative-freigabe-kalenderzuordnungen.md) und [DEC-2026-029](DEC-2026-029-begrenzte-behandlung-zweiter-januar.md)

## Verantwortlichkeit

David Steimer entscheidet über diese Vorlage. Codex hat sie vorbereitet und technisch geprüft und übernimmt keine formelle Freigabe- oder Haftungsverantwortung. Der Status bleibt bis zum ausdrücklichen Beschluss **vorgeschlagen**.

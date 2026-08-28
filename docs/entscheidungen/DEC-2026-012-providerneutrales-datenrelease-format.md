---
id: DEC-2026-012
titel: "Providerneutrales und manifestbasiertes Datenrelease-Format"
status: vorgeschlagen
vorgeschlagen_am: 2026-08-29
entscheidungsdatum: null
klasse: B
entschieden_durch: null
quelle:
  - "Arbeitspaket AP5, GitHub-Issue #12"
  - "DEC-2026-003"
  - "Rechtsmatrix für den MVP"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-012: Providerneutrales und manifestbasiertes Datenrelease-Format

## Ausgangslage

Die Anwendung soll im Pilot Fachdaten aus GitHub und später aus einem SharePoint-Mirror beziehen. Der Rechenkern darf weder von einer konkreten Plattform noch von deren Metadatenmodell abhängen. Gleichzeitig müssen Herkunft, Gültigkeit, Prüfstatus, Vollständigkeit und Unverändertheit eines Datenstands vor jeder Aktivierung geprüft werden können.

AP4 hat 47 fachliche Regeln mit stabilen Arbeits-IDs sowie nationale und bernische Kalendergrundlagen geliefert. AP5 muss daraus ein maschinenlesbares Format machen, ohne offene Rechtsfragen als versteckte Standards zu kodieren.

## Geprüfte Optionen

1. **Strikte JSON-Schemata mit Manifest und einzelnen Artefakten**
   - Vorteil: Plattformneutral, menschenlesbar, offline prüfbar und für TypeScript wie für andere Werkzeuge gut nutzbar.
   - Vorteil: GitHub, SharePoint-Mirror und manueller Import können exakt dieselben Dateien liefern.
   - Nachteil: Änderungen an Schemata und Prüfsummen erfordern disziplinierte Releasepflege.
2. **Ein einziges grosses JSON-Dokument**
   - Vorteil: Einfacher Abruf mit nur einer Nutzdatei.
   - Nachteil: Schlechtere Änderbarkeit, unübersichtliche Diffs und unnötig grosse Austauschobjekte.
3. **SharePoint-Listen als führendes Datenmodell**
   - Vorteil: Bequeme Pflege direkt in Microsoft 365.
   - Nachteil: Plattformbindung, mögliche tenantabhängige Spaltenmodelle und kein byteidentisches GitHub-Artefakt.
4. **Kompaktes Binärformat**
   - Vorteil: Kleine Dateien und schnelle Verarbeitung.
   - Nachteil: Schlechte Prüfbarkeit, unnötige Werkzeuge und für den überschaubaren MVP kein angemessener Nutzen.

## Entscheidvorschlag

Der Fristenrechner verwendet ab Formatversion `1.0.0` folgende Regeln:

- Dateninstanzen und Schemata werden als UTF-8-kodiertes JSON geführt.
- Die Schemata verwenden JSON Schema Draft 2020-12.
- Kalenderdaten werden als ISO-Vollformat `JJJJ-MM-TT` ohne Uhrzeit und Zeitzone gespeichert.
- Ein unveränderliches Releaseverzeichnis enthält ein Manifest sowie einzelne Rechtsprofil- und Kalenderartefakte.
- Das Manifest nennt Release-ID, Status, zeitliche Abdeckung, Profil- und Kalender-IDs, Quellenstand, Formatkompatibilität, relative Dateipfade, Dateigrössen und SHA-256-Prüfsummen.
- GitHub, SharePoint-Mirror und manueller Import liefern dieselben Bytes. Plattformspezifische Metadaten gehören nicht zum Fachdatenformat.
- Unbekannte Hauptversionen, Kernfelder, Regelarten und Referenzen werden abgewiesen.
- Optionale Erweiterungen sind nur im ausdrücklich vorgesehenen, qualifizierten `extensions`-Namensraum zulässig.
- Ein einmal publiziertes Release wird nicht überschrieben. Jede Korrektur erhält eine neue Release-ID und neue Prüfsummen.
- Der letzte vollständig validierte Datenstand darf bei einem Netzwerkausfall als Fallback verwendet werden. Ein teilweise geladenes oder nicht validiertes Release wird nie aktiviert.

Dieser Entscheid ist bis zur Prüfung durch David Steimer als `vorgeschlagen` gekennzeichnet. Die AP5-Implementierung bildet den prüfbaren Referenzvorschlag.

## Begründung

Das Format hält Datenbeschaffung, Validierung und Berechnung getrennt. Die Anwendung kann ein Release vollständig prüfen, bevor sie den bisherigen Datenstand atomar ersetzt. Das verhindert Mischstände, stille Providerabweichungen und die Verwendung nur teilweise geladener Daten.

Strikte Kernschemata sind absichtlich konservativ. Fristenregeln sollen bei unbekannten Inhalten fehlschlagen und nicht kreativ weitergerechnet werden. Der reservierte Erweiterungsbereich ermöglicht trotzdem transportierbare Zusatzinformationen, ohne die Kernsemantik zu verändern.

JSON Schema Draft 2020-12 ist die aktuell veröffentlichte Fassung der offenen Spezifikation. SHA-256 dient der Erkennung veränderter Dateien. Die Prüfsumme beweist für sich allein nicht, wer ein Release publiziert hat. Eine zusätzliche Signatur oder Vertrauenskette bleibt daher eine spätere Sicherheitsentscheidung.

Für dieses spezialisierte Regel- und Kalenderpaket besteht kein unmittelbar passender eCH-Austauschstandard. Die Abweichung ist sachlich begrenzt: Es werden offene, international dokumentierte Standards verwendet. eCH-Vorgaben bleiben insbesondere für Barrierefreiheit, Betrieb und spätere Verwaltungsschnittstellen relevant.

## Folgen

### Auswirkungen

- Der Rechenkern erhält vollständig validierte Objekte und kennt den Provider nicht.
- Ein SharePoint-Mirror soll JSON-Dateien in einer Dokumentbibliothek byteidentisch spiegeln. Eine Umwandlung in SharePoint-Listen ist nicht Teil dieses Formats.
- Datenpflege und CI müssen Schema-, Referenz-, Konsistenz-, Abdeckungs- und Prüfsummenprüfungen ausführen.
- Produkttexte bleiben ausserhalb der Fachdaten. Die Datensätze verwenden sprachneutrale IDs und Lokalisierungsschlüssel.
- Die Eingabe bezeichnet das rechtlich massgebende Zustellungs- oder Ereignisdatum. Eine ungesicherte automatische Ableitung wird nicht eingeführt.
- Verfahrensvarianten und Sachgebiete, die Stillstandsausnahmen auslösen, werden über explizite strukturierte Selektoren abgebildet.

### Risiken und Grenzen

- SHA-256 schützt die Integrität, nicht die Authentizität der Veröffentlichungsstelle.
- Eine falsche, aber formal gültige Fachregel wird durch JSON Schema allein nicht erkannt. Quellenprüfung und Golden Cases bleiben zwingend.
- Byteidentität verlangt, dass ein Mirror Zeilenenden, Kodierung und Formatierung nicht verändert.
- Neue Regelarten oder geänderte Semantik können eine neue Hauptversion und eine Migration des Consumers erfordern.

### Folgearbeiten und Rückabwicklung

- AP6 verwendet die stabilen Regel-IDs und Kalenderartefakte für Golden Cases.
- AP7 prüft im Machbarkeitsspike, wie GitHub- und SharePoint-Provider Manifest und Dateien laden, zwischenspeichern und atomar aktivieren.
- Vor einem produktiven externen Datenfeed ist zu entscheiden, ob Prüfsummen durch signierte Releases oder eine tenantinterne Vertrauenskette ergänzt werden.
- Eine Ablösung erfolgt mit einer neuen DEC-ID und gegenseitigen Verweisen in `ersetzt` und `ersetzt_durch`.

## Nachweise

- [Arbeitspaket AP5](https://github.com/davidsteimer/fristenrechner/issues/12)
- [DEC-2026-003](DEC-2026-003-github-feed-und-sharepoint-mirror.md)
- [Rechtsmatrix für den MVP](../fachrecht/rechtsmatrix-mvp.md)
- [Datenrelease-Format](../architektur/datenrelease-format.md)
- [JSON Schema, Draft 2020-12](https://json-schema.org/draft/2020-12)
- [RFC 3339](https://www.rfc-editor.org/info/rfc3339)
- [NIST FIPS 180-4](https://csrc.nist.gov/pubs/fips/180-4/upd1/final)

## Verantwortlichkeit

Der Vorschlag wurde mit Codex ausgearbeitet. Der Architekturentscheid wird erst mit der dokumentierten Annahme durch David Steimer beschlossen. Codex übernimmt keine formelle Freigabe- oder Haftungsverantwortung.

---
id: DEC-2026-038
titel: "Kantonalverfahrenskatalog 6 mit konkretisierten gesetzlichen Tagesfristen und gebundenen Hinweiszweigen"
status: vorgeschlagen
entscheidungsdatum: null
klasse: B
entschieden_durch: null
quelle:
  - "Fachabnahme AP23I1 einschliesslich I1-A bis I1-G vom 22.10.2026"
  - "Isolierte Vertrags- und Datenprobe AP23I2 auf dem abgenommenen lokalen H3-Stand"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-038 Kantonalverfahrenskatalog 6 und Manifest 13

## Ausgangslage

[AP23I1 ist fachlich abgenommen](../fachrecht/abnahme-ap23i1.md). Seine 34 GL-/TG-Gruppen benötigen konkret verkürzte gesetzliche Tagesfristen, alternative positive aktuelle Qualifikationen und in fünf TG-Gruppen einen vom aktuellen massgebenden Hinweis abhängigen Friststillstand.

Der bisherige Katalog 5 kennt nur feste gesetzliche oder gewöhnliche angeordnete Dauern und ein einziges statisches Stillstandsprofil je Pfad. Seine Qualifikationsregeln kennen nur einen exakten skalaren Sollwert. Format 12 prüft den bisherigen Aktivierungsbestand geschlossen. Ein Schema unter unverändertem Etikett zu erweitern oder die neuen Fälle in alte Bedeutungen zu pressen wäre deshalb nicht vertragsneutral.

## Geprüfte Optionen

1. **Katalog 5 und Manifest 12 unter gleicher Version erweitern.** Weniger sichtbare Versionen, aber neue Semantik ausserhalb der alten geschlossenen Reader. Verworfen als technischer Vorschlag.
2. **Kurzfristen als gewöhnliche angeordnete Dauer behandeln und TG-Ferien manuell übersteuern.** Einfachere Struktur, aber falsche Rechtsnatur, mögliche falsche Stillstandsbehandlung und Verlust der abgenommenen Hinweiswirkung. Verworfen.
3. **Komponentenweise Formatevolution mit Katalog 6 und Manifest/Mindestconsumer 13.** Eigener geschlossener V6-Zweig, unveränderte Altdefinitionen und transitiv gebundene neue Auswahlbedeutung. Empfohlene Option.

## Vorgeschlagener Entscheid

- Kantonalverfahrenskatalog **6.0.0** sowie Manifest und Mindestconsumer **13.0.0**. Keine Produktrelease-, Paket-, Installations- oder Betriebsfreigabe.
- Alle 79 bisherigen Pfade, Revisionen, Qualifikationsregeln und Fachobjekte bleiben exakt erhalten. Die 34 neuen GL-/TG-Gruppen verwenden einen eigenen geschlossenen V6-Zweig. Keine neuen Pflichtfakten in historischen Pfaden.
- `concretisedStatutoryDays` wird als dritter Dauerzweig nur für neue V6-Pfade eingeführt. Er bindet die gesetzliche Natur, fehlende freie Überschreibbarkeit, aktuellen Verkürzungsnachweis und exakten Wertebereich. GL 2–29 beziehungsweise 2–9 Tage und TG 5–29 Tage bleiben von gewöhnlichen angeordneten Fristen und vom festen TG-Fünftagesweg getrennt.
- Neue Requirements verwenden entweder einen exakten `value` oder eine geschlossene `oneOf`-Wertemenge. Der aktuelle Eingabewert bleibt skalar und benötigt positive Qualifikation. Kein erster Wert als Standard und keine Ergänzung aktueller Tatsachen aus persönlichen Defaults.
- Neue Pfade binden eine `suspensionSelection`. Feste Wege wählen genau ein Profil. Ausschliesslich die fünf aufgenommenen TG-Hinweisgruppen dürfen anhand des aktuellen `exceptionNotice` zwischen `given` → keine Perioden und `absent` → drei Perioden wählen. Jeder andere Zustand blockiert. Keine Gleichsetzung von Kenntnis, Dringlichkeit oder unklarer Fortwirkung mit einem gültigen Hinweis.
- Pfad und Eligibility binden den Auswahlhash sowie sämtliche möglichen Profilobjekte und deren Hashes. Die tatsächliche Berechnung muss zusätzlich den aufgelösten Zweig und das ausgewählte Profil ausweisen. Keine unvollständige Profilmenge und keine frei ergänzten Profile.
- GL-Art.-140a-Instanzrecht, aktuelles TG-Verfahrensrecht, qualifizierte schriftliche Eröffnung, Zuständigkeit und konkrete widerspruchsfreie Anordnung sind aktuelle Falltatsachen. Es gibt keinen allgemeinen Altfallalgorithmus und keine Übertragung der OW-Begründungskette oder örtlicher OW-/NW-Feiertagsgrenzen.
- Vier neue rechtliche Kalenderverwendungen für GL-/TG-Verwaltung und Gericht binden jeweils bestehende Kantons-/Bundesdaten und Feiertagskatalog. Alle 35 Kalenderdateien und 499 Feiertagsregeln bleiben unverändert. Gleiche Datumsdaten vererben keine Verfahrensberechtigung. DEC-2026-031 gilt weiter.
- Vollständiges neues Fall- und Berechnungsfenster 29.08.2026–31.12.2027. Alle Zähl-, Stillstands- und Verschiebungstage werden gedeckt. Die genau begrenzte reine Endverschiebung in neue anwendbare Ferien bleibt ohne definitives Ergebnis und Export.
- Rechtsprofile 1.0.0, Feiertagskatalog 2.0.0, Regelkalender 3.0.0, Spezialregimekatalog 3.0.0, Sozialverfahrenskatalog 2.0.0 und persönliche Vorgaben 5 bleiben als Formate unverändert. Die 44 Sozialregeln und 50 BE-Anbindungen erhalten keine zusätzliche Freigabe oder verlängertes Zeitfenster.
- Alte Formate und Reader bleiben unverändert. Ein unbekannter neuer Vertrag wird geschlossen abgelehnt, nicht durch einen Altpfad ersetzt. Historische AP5-Pins und Daten bleiben erhalten.

## Begründung und Folgen

Die Erweiterung folgt der beschlossenen komponentenweisen Formatevolution. Neue Bedeutung erhält eine neue Katalog- und Mindestconsumergrenze, unveränderte Komponenten werden nicht ohne Grund hochversioniert. Strukturell umfasst die Probe 113 Pfade und Policies, weiterhin 35 Kalender und 44 Manifestartefakte.

Ein korrekter Datei-Hash beweist keine korrekte Zuordnung. Schema, genaue Inventare, aktuelle Qualifikation, Profilmenge, konkrete Dauer, Normfassung, Fundstelle und Kalenderrolle werden zusätzlich semantisch geprüft. Die isolierte Probe ist kein neuer konsistent freigegebener Gesamtquellenrelease und keine native Implementierung.

Nach technischer I2-Abnahme und ausdrücklichem Beschluss folgt AP23I3 nur auf gesonderten Auftrag. Erst dort werden Reader, geschlossener Aktivierungsvalidator, Kern, GUI, Hostadapter und tatsächliche Zielreleasebindungen integriert und an gebauten Artefakten geprüft. Die bisher 14 lokal abgenommenen Kantone bleiben bis dahin 14, nicht 16. Operativ bleibt der MVP-0.9-Stand unverändert.

Es gibt durch I2 keine Produktänderung und daher keinen betrieblichen Rückfall. Keine Quellenpromotion, Produktbauten, Commits, Quellpushs, Issueänderungen, Uploads, Installation oder Änderung an E/Q/P, Mirrors, AP5, AP21, Hosting, Rechten oder Richtlinien. DEC-2026-037 bleibt für den Altbestand gültig. Alte Belege werden nicht umgeschrieben. DEC-2026-034 bündelt weiterhin den nächsten regulären Release.

## Status und Nachweise

- [Vertragsvorlage AP23I2](../architektur/verwaltungsverfahrensvertrag-ap23i2.md)
- [Technischer Prüfbericht](../architektur/verwaltungsverfahrensvertrag-ap23i2-pruefung.md)
- [Fachabnahme I1](../fachrecht/abnahme-ap23i1.md)

**Vorgeschlagen, noch nicht beschlossen.** I1-Abnahme und I2-Start sind weder technische I2-Abnahme noch dieser Formatentscheid. David Steimer entscheidet in Personalunion. Codex bereitet vor und prüft ohne formelle Freigabe- oder Haftungsverantwortung.

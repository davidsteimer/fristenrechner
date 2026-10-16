---
id: DEC-2026-032
titel: "Datenvertrag für kantonale Verwaltungsverfahren"
status: vorgeschlagen
entscheidungsdatum: null
klasse: B
entschieden_durch: null
quelle:
  - "AP23B-Abnahme mit Ergänzung und ausdrücklicher AP23C-Start vom 14. Oktober 2026"
  - "DEC-2026-031 Feiertagsanknüpfung im kantonalen Verwaltungsrecht"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-032 Datenvertrag für kantonale Verwaltungsverfahren

## Ausgangslage

Die abgenommenen TI-/GR-Wege benötigen qualifizierte Handlungen, Stufen, Fristarten und eigene Bindungen. Manifest 7 und seine Laufzeit sind auf fünf Bestandsprofile begrenzt. Die neue Fachregel zum Behördensitz ist beschlossen, ihre technische Formatevolution noch nicht.

## Geprüfte Optionen

1. Bestehende Berner oder Bundesprofile umdeuten. Verworfen, weil fachliche und historische Vertragsgrenzen verloren gingen.
2. Rechtsprofil 2 mit vollständiger Pfadqualifikation einführen. Möglich, aber zusätzlicher Umbau der bisherigen Profilstruktur und parallele Freigabemechanismen.
3. Einen eigenen Kantonalverfahrenskatalog und einen neuen Manifest-/Consumerzweig ergänzen. Empfohlen, weil neue Fachpfade eigenständig qualifiziert werden und bestehende Komponenten erhalten bleiben.

## Vorgeschlagener Entscheid

Der [AP23C-Daten- und Migrationsvertrag](../architektur/verwaltungsverfahrensvertrag-ap23c.md) wird mit folgenden Eckpunkten bestätigt:

- Neuer Kantonalverfahrenskatalog **1.0.0**, Manifest und Mindestconsumer **8.0.0**. Bestehende fünf Rechtsprofile 1.0.0, Feiertagskatalog 2.0.0, Regelkalender 3.0.0, Spezialregimekatalog 3.0.0 und Sozialverfahrenskatalog 2.0.0 bleiben als Formate unverändert.
- Zwölf eigenständige TI-/GR-Pfadgruppen, getrennt von alten `profileId`-Werten. Nidwalden und weitere Kantone werden nicht aktiviert. Feste gesetzliche und tatsächlich angeordnete Tagesfristen bleiben getrennt.
- DEC-2026-031 wird mit ausdrücklichem Vorrang von Bundes-/Spezialrecht und abweichenden kantonalen Verfahrensnormen umgesetzt. Neue Feiertagsbindungen verwenden vorhandene Kalenderdaten, nicht deren bisherige Bundesprofil-Freigaben.
- Eigene normgebundene Stillstandsdefinitionen im neuen Katalog, ein qualifizierter interner Rechenplan und gemeinsame Tagesarithmetik. Keine erfundenen Bestandsprofile oder `applicableProfileIds`.
- TI-O2 bleibt ein eng gebundener Sperrfall ohne definitives Enddatum und Export. Keine Änderung der alten fünf Profile allein aufgrund dieser neuen Grenze.
- Vorgeschlagenes Fallfenster der neuen Wege **29.08.2026–31.12.2027**, zusätzlich beschränkt durch jeden anwendbaren Norm-, Gebiets-, Quellen- und Releasebezug. Keine Verkürzung alter allgemeiner Profilfenster und keine Erweiterung der Sozialfreigaben.
- Neue Release- und Hashbindungen trotz unveränderter Fachinhalte der Bestandskomponenten. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben erhalten. Keine ausserbernische Sozialfreigabe.
- Defaults **Version 5** unter eigenem Schlüssel, rein lesende Migration aus alten Vorgaben, Resetmarker und keine erfundenen Falltatsachen. Historische Formate, AP5, konfigurationsgebundener Cache und Rückfall bleiben geschützt.

## Begründung

Der neue Hauptvertrag verhindert, dass ein älterer Consumer eine unbekannte Pflichtkomponente ignoriert. Ein eigenständiger Katalog trennt Auswahl, Fachqualifikation und Freigabe. Die Wiederverwendung von Kalender und Tageszählung vermeidet doppelte fachliche Algorithmen, ohne verschiedene Rechtsgrundlagen gleichzusetzen.

## Folgen

### Auswirkungen

Neuer Katalog, Validator und Laufzeitzweig sowie Anpassungen von Auswahlmodell, Defaults, Rechenspur und Hosts. Das konkrete Inventar umfasst bei unverändertem Bestand 41 Datendateien plus Manifest. Keine zusätzliche Hostinginfrastruktur oder M365-Berechtigung.

### Risiken und Grenzen

Die isolierte Vertragsprobe ersetzt weder fachliche Releasequellenprüfung noch Produkt- und Hosttests. Die generelle Behördensitzregel ersetzt keine Prüfung ausdrücklicher Ausnahmen. Die konkrete operative Freigabe bleibt an den späteren Release gebunden. AP23B-Abnahme und DEC-2026-031 machen diesen technischen Vorschlag nicht automatisch verbindlich.

### Folgearbeiten und Rückabwicklung

Nach Bestätigung folgen AP23D1 bis D3 nacheinander gemäss Vertrag. Alte Dateien werden nicht umgeschrieben. Ein Installationsrückfall wird mit den später tatsächlich gebauten Paketen und Datenkonfigurationen konkret gebunden. GitHub-Push und E/Q/P-Bereitstellung bleiben gesonderte Freigaben.

## Nachweise

- [AP23B-Abnahme](../fachrecht/abnahme-ap23b.md)
- [Beschlossene Feiertagsregel DEC-2026-031](DEC-2026-031-behoerdensitz-kantonale-verwaltungsverfahren.md)
- [Datenvertrag AP23C](../architektur/verwaltungsverfahrensvertrag-ap23c.md)
- [Isolierte Vertragsprüfung](../architektur/verwaltungsverfahrensvertrag-ap23c-pruefung.md)
- [Ausbauauftrag #48](https://github.com/davidsteimer/fristenrechner/issues/48)

## Verantwortlichkeit

David Steimer entscheidet über diese Vorlage. Codex hat sie vorbereitet und geprüft, ohne formelle Freigabe- oder Haftungsverantwortung. Bis zur ausdrücklichen Bestätigung bleibt der Status **vorgeschlagen**.

---
id: DEC-2026-033
titel: "Explizite Fallqualifikation der kantonalen Verwaltungsverfahren"
status: vorgeschlagen
entscheidungsdatum: null
klasse: B
entschieden_durch: null
quelle:
  - "AP23E1-Fachabnahme und ausdrücklicher AP23E2-Start vom 18. Oktober 2026"
  - "DEC-2026-031 und DEC-2026-032"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-033 Explizite Fallqualifikation der kantonalen Verwaltungsverfahren

## Ausgangslage

Die zweite Tranche mit LU, ZG und AR ist fachlich abgenommen. Der bestehende Vertrag kann die Rechenparameter ausdrücken, aber nicht alle neuen Fallgrenzen eindeutig prüfen. Ein Endentscheid, eine qualifizierte AR-Vollstreckungsverfügung und eine Zahlungsaufforderung dürfen nicht allein aufgrund einer gleichen Tageszahl oder Pfadauswahl gleichbehandelt werden.

## Geprüfte Varianten

1. Nur neue Pfadnamen und Hinweise in Katalog 1. Verworfen, weil Freitext keine verbindliche Fallqualifikation ersetzt und ältere Verbraucher neue Grenzen nicht erkennen könnten.
2. Sämtliche alten Pfade mit neuen Fallvoraussetzungen überschreiben. Verworfen, weil dies TI-/GR-Verfahren ohne neue Fachgrundlage verändern und etwa den Tessiner Prozesskostenvorschuss unzulässig ausschliessen würde.
3. Katalog 2 mit vollständiger separater Qualifikationsbindung und gesichertem Altzweig. Empfohlen. Bestehende Pfaddefinitionen bleiben unverändert, neue Voraussetzungen werden ausdrücklich maschinenprüfbar.

## Vorgeschlagener Entscheid

Der [AP23E2-Vertrag](../architektur/verwaltungsverfahrensvertrag-ap23e2.md) wird mit folgenden Eckpunkten bestätigt:

- **Kantonalverfahrenskatalog 2.0.0, Manifest und Mindestconsumer 9.0.0.** Bestehende Rechtsprofile 1.0.0, Feiertagskatalog 2.0.0, Regelkalender 3.0.0, Spezialregime 3.0.0 und Sozialkatalog 2.0.0 bleiben als Formate unverändert.
- Genau eine Qualifikationsregel je Pfad und Revision. Pfaddefinitionshash und zusätzlicher Qualifikationshash werden in der Einzelpfadbindung geprüft. Keine fehlende oder unbekannte Voraussetzung wird automatisch positiv ergänzt.
- Die zwölf bisherigen MVP-0.8-Pfade erhalten ausschliesslich den eng gebundenen Altzweig mit unveränderter Semantik. Die dreizehn neuen Wege erhalten die ausdrückliche Qualifikation für Endentscheid, besondere AR-Vollstreckungsverfügung oder angeordnete Verfahrenseingabe. Keine globale neue Zahlungs- oder Zwischenentscheidsperre für TI/GR.
- Die abgenommenen LU-/ZG-/AR-Zeitfenster, der AR-Fünftagesrekurs und AR-O1 bleiben unverändert. Keine neue Beurteilung der offenen AR-Rechtsfrage, keine neue Sozialfreigabe und keine pauschale Aufnahme besonderer Verfahren.
- Fünf eigenständige rechtliche Kalenderverwendungen. Physische Herkunftsreferenzen werden im neuen Kandidaten konsistent auf MVP 0.8 bezogen. Quellenherkunft und tatsächliche Zielreleasebindung bleiben getrennt. Historische Daten werden nicht überschrieben.
- Defaults bleiben Version 5. Keine Speicherung aktueller Fallqualifikation. Die vorhandene Fallkonstellationsauswahl wird später pfadspezifisch präzisiert, ohne zusätzliche Checkboxen oder zwanzig neue GUI-Felder.
- Die E2-Vertragsprobe ist kein lauffähiger Datenrelease. Vor Produktintegration sind neue Zielbytebindungen erforderlich. Quellenfreigabe, Releaseübernahme und Bereitstellung bleiben gesondert.

## Folgen und Grenzen

Erforderlich sind ein neuer strenger Reader, vollständige semantische Validierung der Qualifikationsregeln und eine geschlossene UI-Anbindung. Die gemeinsame Tagesarithmetik wird weiterverwendet. Alte Formate, AP5, bestehende TI-/GR-Wege und Sozialfreigaben bleiben geschützt. Es braucht weder neue Infrastruktur noch zusätzliche M365-Berechtigungen.

Die [Prüfvorlage](../architektur/verwaltungsverfahrensvertrag-ap23e2-pruefung.md) belegt die strukturelle Darstellbarkeit und isolierte Fallprüfung. Sie ersetzt keine Produktintegration oder Hostprüfung. DEC-2026-032 bleibt für den bisherigen Format-8-Bestand gültig. Der neue Beschluss ergänzt dessen Architektur und hebt historische Freigaben nicht auf.

Die konkrete Produktversion und der Installationsrückfall werden später mit den tatsächlichen Artefakten gebunden. GitHub-Push und E/Q/P-Bereitstellung bleiben gesonderte Aufträge.

## Verantwortlichkeit

David Steimer entscheidet über diese technische Vorlage. Codex hat sie vorbereitet und geprüft, ohne formelle Freigabe- oder Haftungsverantwortung. Bis zur ausdrücklichen Bestätigung bleibt DEC-2026-033 **vorgeschlagen**.

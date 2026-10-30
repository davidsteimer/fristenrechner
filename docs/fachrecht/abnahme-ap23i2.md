# AP23I2 Technische Abnahme und Start von AP23I3

Datum: 22. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP23I2 ist technisch abgenommen. Ich bestätige DEC-2026-038 mit Katalog 6.0.0 sowie Manifest und Mindestconsumer 13.0.0. Bitte starte AP23I3.

**AP23I2 ist technisch abgenommen. DEC-2026-038 ist beschlossen. AP23I3 ist als lokale Produktintegration gestartet.** Die ursprüngliche I2-Vorlage, der vorgeschlagene DEC und die technischen Nachweise bleiben unverändert. Diese separate Notiz und der [Beschlussbeleg](../entscheidungen/DEC-2026-038-beschluss.md) dokumentieren den anschliessenden menschlichen Entscheid.

## Abgenommener Vertragsstand

Die [I2-Vertragsvorlage](../architektur/verwaltungsverfahrensvertrag-ap23i2.md) und der [Prüfbericht](../architektur/verwaltungsverfahrensvertrag-ap23i2-pruefung.md) bestätigen den geschlossenen Katalog-6-/Manifest-13-Vertrag für 34 neue GL-/TG-Gruppen bei 79 unveränderten Bestandspfaden.

Beschlossen sind die getrennte konkretisierte gesetzliche Tagesdauer, skalare aktuelle Alternativqualifikationen, der ausdrückliche TG-Hinweiszweig mit vollständig gebundenen Profilen, aktuelle Eröffnungs- und Übergangsrechtsqualifikation, vier eigenständige rechtliche Kalenderverwendungen sowie die begrenzte Endverschiebungsbehandlung. Alle 35 physischen Kalender und 499 Feiertagsregeln bleiben in der I2-Probe unverändert. Die übrigen Komponentenformate und persönliche Vorgaben 5 bleiben bestehen.

Die Fachabnahme I1-A bis I1-G bleibt eigenständig gültig. Es gibt durch diese technische Abnahme weder neue juristische Auslegung noch zusätzliche Sozial- oder Spezialverfahrensfreigabe.

## Exakte Abnahmekopie

Der ursprüngliche [I2-Abschlussnachweis](../../outputs/ap23i2-2026-10-22/local-completion.json) hat SHA-256 `3d21fdd48f697a2b7e0a501a77ab3834f790c1633dd0cb4d10af19420dc766dd`. Er bindet 91 Dateien, neun bestandene Prüfschritte, 281 neue Testfälle und 791 geprüfte lokale Verweise. Die damaligen negativen Abnahme- und Freigabeflags bleiben als damaliger Stand erhalten.

Die [separate Abnahmekopie](../../outputs/ap23i2-abnahme-2026-10-22/receipt.json) sichert diesen Stand einschliesslich des Abschlussnachweises autonom. Das [Archivskript](../../scripts/archive-ap23i2-acceptance.mjs) prüft ein vorhandenes Archiv ohne Überschreiben. Quellen und Schutzdateien werden nicht rekursiv nochmals kopiert. Die menschliche Abnahme und der I3-Start stehen im neuen Beleg, nicht in umgeschriebenen alten QA-Dateien.

## I3-Auftrag und Grenzen

AP23I3 umfasst einen eigenen nativen Format-13-Reader, geschlossene Aktivierungs- und Katalogvalidatoren, die Kern-/UI-/Hostintegration und einen neuen lokal gesperrten, kohärent gebundenen Kandidaten. Neue Zielhashes und Releasebindungen aller betroffenen Komponenten sind konsistent herzustellen. Die 79 alten Fachdefinitionen und die I1-/I2-Referenzerwartungen bleiben erhalten.

Die Oberfläche behält frühe Datumseingabe, zweispaltigen Aufbau, feste Einzelwerte und verständliche DE-/FR-Rechenspur. Aktuelle Tatsachen, konkrete Verkürzung, Hinweiswirkung und konkrete gesetzliche Kurzfristdauer werden nicht als positive persönliche Standards gespeichert.

Lokale tatsächliche Web- und isolierte SPFx-Bauten dienen dem Integrationsnachweis, nicht der Installation. Sämtliche Exporte der lokalen Prüfansicht bleiben gesperrt. Synthetische Freigaben sind ausschliesslich in automatisierten Speichertests zulässig. Keine Kalenderdownloads oder Outlook-Importe.

Quellenpromotion, gemeinsamer regulärer Release, Commits, GitHub-Änderungen oder Push, Upload, Installation und Betriebsfreigaben bleiben ausgeschlossen. MVP 0.9, E/Q/P, Mirrors, AP5, AP21, Hosting, Berechtigungen und Richtlinien bleiben unverändert. Der nächste reguläre Release bleibt gemäss DEC-2026-034 gebündelt.

David Steimer nimmt die menschlichen Rollen in Personalunion wahr. Codex ist dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung. Die nächste menschliche Abnahme betrifft den tatsächlichen I3-Integrationsstand.

# AP23J2 Technische Abnahme und Start von AP23J3

Datum: 27. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP23J2 ist technisch abgenommen. Ich bestätige DEC-2026-039 mit Katalog 7.0.0 sowie Manifest und Mindestconsumer 14.0.0. Bitte starte AP23J3.

**AP23J2 ist technisch abgenommen. DEC-2026-039 ist beschlossen. AP23J3 ist als lokale Produktintegration gestartet.** Die ursprüngliche Vertragsvorlage, der vorgeschlagene Entscheid und die Prüfberichte bleiben unverändert. Diese Notiz und der [Beschlussbeleg](../entscheidungen/DEC-2026-039-beschluss.md) dokumentieren den anschliessenden menschlichen Entscheid.

## Abgenommener Vertrag

Die [Vertragsvorlage](../architektur/verwaltungsverfahrensvertrag-ap23j2.md) und der [Prüfbericht](../architektur/verwaltungsverfahrensvertrag-ap23j2-pruefung.md) betreffen 36 neue FR-/GE-/JU-Gruppen bei 113 erhaltenen Bestandspfaden, insgesamt 149 Wege. Katalog 7 und Manifest/Mindestconsumer 14 erhalten einen eigenen geschlossenen nativen Vertragszweig.

Beschlossen sind die typisierten aktuellen Auslöser, die ausdrückliche Genfer Unterscheidung zwischen rechtlich qualifizierter Eröffnung und physischem Empfang gewöhnlicher Post sowie deren gebundene vorgelagerte Eröffnungsauflösung. Quellen-, Norm-, Kalender- und Zeitdeckung umfassen jeden vorgeschalteten Tag. Eine bereits qualifizierte Eröffnung wird nicht nochmals verschoben. Ein berechnetes Bestätigungs- oder Begründungsverlangen erzeugt keine spätere tatsächliche Eröffnung und keine neue Beschwerdefrist.

Die sechs neuen rechtlichen Kalenderverwendungen und die vollständigen Zeitfenster bleiben wie abgenommen gebunden. Die 35 physischen Kalender und 499 Katalogregeln einschliesslich bestehender Prozessergänzungen werden nicht erweitert. Die übrigen Komponentenformate und persönliche Vorgaben 5 bleiben bestehen. Die Fachabnahme J1-A bis J1-G ist weiterhin eigenständig gültig. Keine zusätzliche Sozial- oder Spezialverfahrensfreigabe.

## Exakt gesicherter Stand

Der ursprüngliche [J2-Abschlussnachweis](../../outputs/ap23j2-2026-10-27/local-completion.json) hat SHA-256 `7afd5e4b9411b3853c12690154756c2af74e050b58ae2d424b5852eb7af6eba3`. Er bindet 93 Dateien, neun bestandene Prüfschritte, 416 Tests und 833 lokale Verweise. Die 673 Referenzfälle stimmen in zwei getrennten Berechnungen vollständig überein. Die damaligen negativen Abnahme- und Freigabeflags bleiben als historische Status erhalten.

Die [Abnahmekopie](../../outputs/ap23j2-abnahme-2026-10-27/receipt.json) sichert 94 Nutzdateien mit 6’975’632 Bytes einschliesslich des Abschlussnachweises. Beleg-SHA-256: `d4a4bffea18680a56ae232cc212ea2b91c5c0644249f4acd670359d823b90fed`. Das [Archivskript](../../scripts/archive-ap23j2-acceptance.mjs) prüft die Kopie autonom und überschreibt sie nicht. Alte Quellen und Schutzdateien werden nicht rekursiv nochmals kopiert.

Die [J3-Ausgangsbindung](../../outputs/ap23j3-2026-10-27/protected-inputs.json) wurde vor Produkt- und Statusänderungen eingefroren. Sie schützt 4’466 eindeutige Bestandsdateien und trennt 127 ausdrücklich benannte Integrationsdateien sowie sieben lebende Einstiegstexte davon. Bereits geänderte Originaldokumente, ältere Kandidaten, Schemata, Reader, Tests und Nachweise bleiben erhalten.

## J3-Auftrag und Grenzen

J3 umfasst einen eigenen nativen Format-14-Reader, geschlossene Aktivierungs- und Katalogvalidatoren, Kern-/UI-/Hostintegration und einen neuen lokal gesperrten, konsistent gebundenen Kandidaten. Alle tatsächlich betroffenen Zielhashes und Releasebindungen sind neu herzustellen. Die 113 Bestandsdefinitionen und sämtliche abgenommenen J1-/J2-Erwartungen bleiben erhalten.

Zwei Spalten, frühe Datumseingabe, statisch «Sitz der zuständigen Stelle», feste Einzelwerte und lesbare DE-/FR-Rechenspur bleiben verbindlich. Nur fachlich entscheidende aktuelle Alternativen erhalten zusätzliche Eingaben. Genfer Eröffnungsmodus und andere aktuelle Falltatsachen werden nicht in persönliche Vorgaben gespeichert.

Lokale Web- und isolierte SPFx-Bauten dienen ausschliesslich dem Integrationsnachweis. Sämtliche Kalenderexporte der lokalen Prüfansicht bleiben gesperrt. Synthetische Freigaben sind nur für automatisierte Speichertests zulässig. Keine Kalenderdownloads und keine Outlook-Importe.

Keine Quellenpromotion, Commitbildung, GitHub-Änderung oder Push, Upload, Installation oder Betriebsfreigabe. MVP 0.9, E/Q/P, Mirrors, AP5, AP21, Hosting, Berechtigungen und Richtlinien bleiben unverändert. Der nächste reguläre Release bleibt gemäss DEC-2026-034 gebündelt. David Steimer nimmt alle menschlichen Rollen wahr. Codex bereitet vor und prüft ohne formelle Freigabe- oder Haftungsverantwortung. Die nächste menschliche Abnahme betrifft den tatsächlichen J3-Integrationsstand.

# AP23H2 Technische Abnahme und Start von AP23H3

Datum: 22. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP23H2 ist technisch abgenommen. Ich bestätige DEC-2026-037 mit Katalog 5.0.0 sowie Manifest und Mindestconsumer 12.0.0. Bitte starte AP23H3.

**AP23H2 ist technisch abgenommen. DEC-2026-037 ist beschlossen. AP23H3 ist ausdrücklich gestartet.** Die ursprünglichen H2-Berichte, Strukturkandidaten, Schemata und ihr damaliger Vorschlagsstatus bleiben unverändert. Diese Notiz und die exakte Abnahmekopie dokumentieren den anschliessenden menschlichen Entscheid.

## Bestätigter Vertrag

Die [H2-Vertragsvorlage](../architektur/verwaltungsverfahrensvertrag-ap23h2.md), ihr [Prüfnachweis](../architektur/verwaltungsverfahrensvertrag-ap23h2-pruefung.md) und der unveränderte [Entscheidvorschlag](../entscheidungen/DEC-2026-037-prozesskalender-und-qualifizierte-handlungen-v5.md) sind bestätigt. Beschlossen sind **Kantonalverfahrenskatalog 5.0.0 sowie Manifest und Mindestconsumer 12.0.0**. Der [gesonderte Beschluss](../entscheidungen/DEC-2026-037-beschluss.md) hält den Formatentscheid fest.

- 79 Pfade und Qualifikationsregeln, davon 58 unveränderte Bestandsdefinitionen und 21 neue H1-Gruppen für OW/NW.
- 13 Katalogerlasse, 25 Stillstandsprofile, 17 rechtliche Kalenderverwendungen und 35 physische Kalender. Bern bleibt das separate Bestandsprofil.
- Acht neue Prozessregeln ergänzen die 479 bisherigen Erhebungsregeln und zwölf SO-Regeln. Zwei eigene Prozessprojektionen verändern keine frühere Bundesprofilbindung.
- Vier aktive Ressourcen je neuer V5-Kalenderverwendung, darunter der tatsächliche geerbte Kantonskalender. Historische Projektionsherkunft bleibt davon getrennt.
- Gesetzliche Einsprache, besonderer Weiterzug, Vernehmlassung, Replik und Duplik als eigenständige Handlungen. Positive aktuelle Fallfakten werden nicht aus Standards fingiert.
- Vollständiges Fallfenster 29.08.2026–31.12.2027 mit getrennten OW-StVG-Fassungsabschnitten und den abgenommenen lokalen beziehungsweise Endverschiebungsgrenzen.

Feiertagskatalog 2.0.0, Regelkalender 3.0.0, Rechtsprofile 1.0.0, Spezialregimekatalog 3.0.0, Sozialverfahrenskatalog 2.0.0 und persönliche Vorgaben 5 bleiben als Formate unverändert. Die 44 nationalen Sozialregeln und 50 Berner Anbindungen bleiben fachlich unverändert, ohne neue ausserbernische Sozialfreigabe oder verlängertes Sozialzeitfenster.

## Abnahmesicherung

Die [exakte H2-Abnahmekopie](../../outputs/ap23h2-abnahme-2026-10-22/receipt.json) umfasst 85 Payloaddateien plus Beleg mit 3’980’702 Payloadbytes. Die 84 ursprünglichen Abschlussbindungen und der Abschlussbericht sind darin enthalten. Frühere Schutzinventare und Abnahmekopien bleiben eigenständig gebunden und werden nicht rekursiv vervielfältigt.

Archivbeleg SHA-256: `bb856623f83847202b2a7e387fbe3a974234abe250d0c2b4180f4fd52b303494`.

Ursprünglicher H2-Abschlussbericht SHA-256: `e2398539e3c1ba0c06948fa50dae62aa17c0dc39d011962ab5b2a43888072dd1`.

Das [Archivskript](../../scripts/archive-ap23h2-acceptance.mjs) prüft bestehende Kopien autonom, überschreibt sie nicht und hält bei Teilarchiven oder Abweichungen an. 29 Positiv-/Negativtests sind bestanden. Die ursprünglichen technischen Nachweise bleiben erhalten: 118 vollständige H1-Vergleiche, 78 neu gehashte Daten-/Katalogmutationen, 36 Inputproben, sechs Altreader-Negativproben sowie 58 native Bestandsberechnungen und 174 blockierte gefälschte Kontexte. Diese Mengen werden nicht als unabhängige Fachabnahmen addiert.

## H3-Auftrag und Grenzen

H3 integriert den bestätigten Vertrag lokal in Reader, Daten, Rechenkern, Oberfläche, Standards, Rechenspur und Hosts. Die historischen H2-Referenzkopien sind nicht bereits vollständig zielreleasekohärent. Neue Zielkopien müssen insbesondere die Kalenderprojektionshashes, aktive Elternreferenzen, administrative und soziale Zielreleasebindungen tatsächlich konsistent binden. Historische Herkunft darf dabei nicht als heutige Quelle umetikettiert werden.

Der neue Format-12-Consumer erhält eigene geschlossene Validierung und Laufzeitidentität. Alte Reader und Aktivierungsvalidatoren werden nicht gelockert. Sämtliche lokalen Kandidatenexporte bleiben gesperrt. Synthetische Freigaben dürfen ausschliesslich im Testspeicher die spätere Exportanbindung prüfen.

Zweispaltiger Aufbau, frühe Datumseingabe, feste Einzelwerte und verständliche Rechenspur bleiben verbindlich. Technische Fallfakten sind keine Anweisung für zusätzliche Einzel-Dropdowns. Datum, Referenz, Empfängeridentität, Rechtzeitigkeit, Einvernehmen, Ausnahmen und weitere aktuelle Falltatsachen werden nicht in persönlichen Standards gespeichert.

Die [H3-Ausgangsbindung](../../outputs/ap23h3-2026-10-22/protected-inputs.json) schützt den nicht zu verändernden Bestand. Das [getrennte Änderungsinventar](../../outputs/ap23h3-2026-10-22/mutable-inputs.json) erfasst die für die Integration vorgesehenen bestehenden Quelldateien und sieben lebende Einstiegstexte mit ihren Ausgangshashes. Ein [begrenzter Zusatz](../../outputs/ap23h3-2026-10-22/additional-mutable-inputs.json) erfasst zwei weitere reine Registry-Dispatchdateien vor ihrer Änderung. Die Ausgangsinventare werden nicht erneuert.

H3-Fach-/Technikabnahme, gemeinsamer Quellenrelease, reguläre Auslieferung und Betriebsfreigaben bleiben offen. Kein Commit, Quellpush, Upload, Installation, Mirrorwechsel oder Eingriff in E/Q/P, AP5, AP21, Hosting oder Berechtigungen. DEC-2026-034 bündelt weiter den nächsten regulären Release bis zur vereinbarten Kantonsabdeckung. David entscheidet in Personalunion, Codex bleibt Arbeits- und Prüfinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

# AP23G3 Fachlich technische Abnahme

Datum: 22. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> Danke für die Klärung. AP23G3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.

**AP23G3 ist fachlich-technisch abgenommen.** Die anschliessende Empfehlung und Vorbereitung der nächsten Tranche ist beauftragt. Deren konkreter Umfang und Start bleiben gesondert zu bestätigen. Die vorangehende Klärung bestätigt die kantonsweite eigene Prozessfeiertagsliste nach § 9 VRG für die modellierten Solothurner Wege, nicht eine allgemeine Irrelevanz regionaler Ruhetage.

## Abgenommener Umfang

- Native Integration von Katalog 4.0.0 sowie Manifest und Mindestconsumer 11.0.0 gemäss [DEC-2026-036](../entscheidungen/DEC-2026-036-beschluss.md).
- 16 neue qualifizierte Wege für Uri, Solothurn und Schaffhausen. 42 bisherige Pfaddefinitionen erhalten, insgesamt 58. Sämtliche 115 G1-Erwartungen im nativen Rechenkern bestätigt.
- Eigene Begründungsverlangen und ausdrückliche Eröffnungslagen, Urner Hinweiswirkung ohne Datumsänderung, Solothurner Prozesskalender und eigenständige Schaffhauser Verwaltungspraxis. Sämtliche abgenommenen zeitlichen, örtlichen und kollisionsbezogenen Grenzen bleiben erhalten.
- Zweispaltige DE-/FR-Oberfläche, frühe Datumseingabe, lesbare Rechenspur und Standards Version 5 ohne gespeicherte aktuelle Falltatsachen.
- Lokale Host-/Providerintegration, tatsächliche Web- und SPFx-Prüfungen. Gemeinsame Tagesarithmetik, Feiertagskatalog, sämtliche Kalenderbytes, 44 Sozialregeln und 50 Berner Anbindungen fachlich unverändert.

## Gesicherter Abnahmestand

Die [Abnahmekopie](../../outputs/ap23g3-abnahme-2026-10-22/receipt.json) enthält **218 exakt gebundene Payloaddateien und den Archivbeleg**. Dazu gehören alle 43 Kandidatdateien, gebundene Quellen und Prüfeingänge, Protokolle sowie der tatsächliche Webbuild und das isoliert geprüfte lokale SPFx-Testpaket. Die 719 historischen Schutzdateien wurden frisch geprüft, aber nicht rekursiv nochmals dupliziert.

Die Kopie ist autonom aus ihren eigenen Bytes rückgeprüft. 31 Positiv- und Negativtests des Archivverfahrens sind bestanden. Änderungen lebender Einstiegstexte verändern den gesicherten Abnahmestand nicht.

| Gegenstand | SHA-256 |
| --- | --- |
| Ursprünglicher lokaler G3-Abschluss | `4a394c06458724f6a1e955651efb5c98012ea1998607d7e31283c69d87a60278` |
| Archivbeleg | `8b1c51e00a7db862b38a58ead5a20c7e4fa1fdd48c196c07329390f9198dbf7b` |
| Kandidatenmanifest `2026-10-22-ap23g3-candidate.1` | `bf710be1a5e58b540d644e4dace885eed4dbe998a431badb9eec07032ea6bada` |
| Ursprünglicher Integrationsbericht | `24cd5b1f1882359ce20067fc60ec39795fda4e26a68f99030759efe7dddbfbe2` |
| Tatsächlich geprüftes lokales SPFx-Testpaket | `42469862fe8f5a810d5e788a7b95b8504d55b7e803cb89c2aeddbffa1ac59e67` |

Der ursprüngliche [Integrationsbericht](../architektur/verwaltungsintegration-ap23g3.md) und seine Prüfberichte behalten ihren damaligen Vorabnahmestatus. Der historische Wert `professionalTechnicalAcceptance: false` wird nicht rückwirkend umgeschrieben. Die heutige menschliche Abnahme steht in diesem Dokument und im separaten Archivbeleg.

Die Nachweise umfassen 3’008 bestandene Produkttests, vier ergänzende Runtimevergleiche, 30 Host-Lebenszyklustests, 13 tatsächliche Webbuildtests, sechs unabhängige Pythonprüfungen, 237 SPFx-Provider-/Integrationstests sowie 170 bestehende und sechs neue Prüfungen des tatsächlichen Pakets. Überlappende Mengen werden nicht addiert. Die 49 nicht blockierenden Lintmeldungen bleiben dokumentiert. Reale Geräte-, Gast- und M365-Hostprüfungen eines späteren gemeinsamen Auslieferungskandidaten werden dadurch nicht ersetzt.

## Nächster Fachschritt und Freigabegrenzen

Die [Vorbereitung AP23H1](../planung/ap23h1-vorbereitung-ow-nw.md) schlägt Obwalden und Nidwalden als nächste Zweiertranche vor. Sie enthält Auswahlbegründung, amtliche Vorprüfung, offenen Fachumfang und Abnahmekriterien. Die konkrete Tranche ist noch nicht bestätigt.

Damit sind zwölf Kantone im vereinbarten allgemeinen Umfang lokal modelliert und abgenommen. Sechs sind im bestehenden MVP09-Umfang operativ verfügbar, sechs zusätzliche Kantone nur lokal abgenommen. 14 Kantone bleiben auszuarbeiten. Das ist keine vollständige Freigabe sämtlicher kantonaler Spezialverfahren.

[DEC-2026-034](../entscheidungen/DEC-2026-034-gebuendelter-schweizausbau.md) bleibt verbindlich. Kein regulärer Zwischenrelease vor der vereinbarten Kantonsabdeckung. Der G3-Datenstand bleibt Kandidat und die lokale Vorschau ohne Kalenderexport. Keine Quellenpromotion, definitiven Auslieferungsartefakte, Commits, Quellpushs, Uploads, Installationen, Mirrorumstellungen oder Änderungen an E/Q/P, AP5, AP21, Hosting und Berechtigungen.

David Steimer nimmt die menschlichen Fach-, Abnahme- und Betriebsrollen in Personalunion wahr. Codex ist dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

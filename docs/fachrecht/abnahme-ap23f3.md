# AP23F3 Fachlich technische Abnahme

Datum: 22. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP23F3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.

**AP23F3 ist fachlich-technisch abgenommen.** Der Auftrag umfasst anschliessend die Empfehlung und Vorbereitung der nächsten Kantonstranche. Er ist keine Bestätigung eines noch nicht vorgelegten Kantonsumfangs und keine Releasefreigabe.

## Abgenommener Umfang

- Native Integration des Verwaltungsverfahrenskatalogs 3.0.0 und des Manifest-/Mindestconsumerformats 10.0.0 gemäss beschlossenem DEC-2026-035.
- 17 neue qualifizierte Wege für Zürich, Aargau und St. Gallen innerhalb der abgenommenen F1-Grenzen. 25 bisherige Pfaddefinitionen erhalten, insgesamt 42.
- Konsistente Bindung von 33 Kalendern und zusätzlicher Zürcher Verwaltungs-Neunerprojektion ohne Änderung der bestehenden 104 Bundesbindungen.
- Zeitlich passende Normabschnitte, vollständig gedeckte Fälle bis 31.12.2027 und begrenzte F1-O1-Behandlung. Keine neue Quellenrelease- oder Exportfreigabe.
- Gemeinsame DE-/FR-Oberfläche, zweispaltiger Aufbau, früh nutzbares Datum, gebündelte aktuelle Fallqualifikation, lesbare Rechenspur und Standards Version 5 ohne gespeicherte Falltatsachen.
- Lokale Provider-/Hostintegration und Nachweise des tatsächlichen Web- und SPFx-Codes. Die 44 Sozialregeln und 50 Berner Anbindungen bleiben unverändert.

## Gesicherter Abnahmestand

Die [Abnahmekopie](../../outputs/ap23f3-abnahme-2026-10-22/receipt.json) enthält **197 exakt gebundene Dateien und den Archivbeleg**. Sie bewahrt die 43 Kandidatdateien, 114 Quell-/Prüfeingänge, fünf Hauptnachweise, Protokolle sowie den tatsächlich geprüften Webbuild und das lokale SPFx-Testpaket. Die 445 historischen geschützten Eingänge wurden erneut auf ihre Prüfsummen geprüft, aber nicht nochmals dupliziert.

Die Kopie wurde unabhängig aus ihren eigenen Bytes nachgeprüft. 26 Positiv- und Negativtests des fokussierten Archivverfahrens sind bestanden. Eine spätere Änderung lebender Dateien verändert den bestätigten Archivstand nicht.

| Gegenstand | SHA-256 |
| --- | --- |
| Ursprünglicher lokaler Abschluss | `bbf8d3ac815b30224563f98c552e1ac9006e4c58e7b12e5370b0211b65a1541f` |
| Archivbeleg | `518a76b33fb0666a36ada847d58ba50b8495daf921a4b10a4cabbc7ba4b8ddd6` |
| Kandidatenmanifest `2026-10-22-ap23f3-candidate.1` | `89470d589615a447b146eb58028a7e2ac58fe7389b908196b3f82e02864b3311` |
| Ursprünglicher Integrationsbericht | `39bb482f6a0ae8c5e1955de8e1ebdf60f6a926f9361435d329884b1820b6a82c` |
| Tatsächlich geprüftes lokales SPFx-Testpaket | `d815868bc3ce5e3c75401132a14a762e1641144a085d454f178d656f62b7b9d9` |

Der ursprüngliche [Integrationsbericht](../architektur/verwaltungsintegration-ap23f3.md) und die maschinenlesbaren Prüfberichte behalten ihre damaligen Statusangaben. «Abnahme offen» ist dort historische Evidenz, nicht der aktuelle Projektstatus.

Die abgenommenen Nachweise umfassen 2’828 bestandene Produkttests, darin alle 80 F1-Erwartungen, 20 Host-Lebenszyklustests, zehn Webbuildtests, 226 lokale SPFx-Integrationstests, 170 bestehende und vier zusätzliche native Paketprüfungen. Überlappende Mengen werden nicht addiert. Die 42 nicht blockierenden Lintmeldungen bleiben dokumentiert. Diese Abnahme ersetzt keine späteren realen M365-, Geräte- oder Gastprüfungen eines gemeinsamen Auslieferungskandidaten.

## Nächster Fachschritt und getrennte Freigaben

Die [vorbereitete AP23G1-Tranche](../planung/ap23g1-vorbereitung-ur-so-sh.md) schlägt Uri, Solothurn und Schaffhausen vor. Auswahlbegründung, erste amtliche Quellen, Untersuchungsgruppen, offene Fachfragen und Abnahmekriterien sind vorbereitet. Die Bestätigung dieses konkreten Umfangs bleibt bei David.

DEC-2026-034 bleibt verbindlich. Kein regulärer Zwischenrelease vor der vereinbarten Kantonsabdeckung. Der F3-Datenstand bleibt Kandidat, die Vorschau ohne Kalenderdownload. MVP 0.9 bleibt operativ freigegeben. Keine Quellenpromotion, definitive Auslieferungsartefakte, Produktcommits, Quellpushs, Uploads, Installationen, Mirrorumstellungen oder Änderungen an E/Q/P, AP5, AP21 und Berechtigungen.

David nimmt die menschlichen Fach-, Abnahme- und Betriebsrollen in Personalunion wahr. Codex ist dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

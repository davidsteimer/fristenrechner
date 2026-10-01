# AP20C2 Abnahme der Integration von FamZG und FLG

Datum: 1. Oktober 2026. Entscheider: David Steimer.

David Steimer hat mit **«AP20C2 ist abgenommen.»** die vorgelegte lokale Integration von FamZG und FLG fachlich-technisch abgenommen. Damit ist AP20C2 als Integrationspaket abgeschlossen.

Diese Notiz ergänzt den unveränderten [Integrationsbericht](../architektur/implementierung-ap20c2.md) und [technischen Prüfnachweis](../../outputs/ap20c2-2026-10-01/pruefprotokoll.json). [Issue #42](https://github.com/davidsteimer/fristenrechner/issues/42) dokumentiert den Abschluss. Das übergeordnete [Issue #35](https://github.com/davidsteimer/fristenrechner/issues/35) bleibt für die Folgearbeiten offen.

## Abgenommener Gegenstand

- Je vier nationale FamZG- und FLG-Verfahrensmodelle mit insgesamt acht neuen Berner Anbindungen. Nationale Regel, konkrete Zuständigkeit und Feiertagsqualifikation bleiben getrennt. Kein pauschaler Berner Wohnsitzfilter.
- Erhaltung aller 28 Regeln und 34 Anbindungen aus AP20C1. Der neue Kandidat umfasst insgesamt 36 nationale Regeln und 42 Berner Anbindungen. Neun andere Datenartefakte bleiben byteidentisch.
- Reduzierte zweispaltige DE-/FR-Bedienung, frühe Datumseingabe und die tatsächlich erforderlichen Fallangaben zur Familienzulagenordnung beziehungsweise zuständigen Ausgleichskasse. Bei Gerichtswegen kommen Gerichtskanton und massgebendes Beschwerdedatum hinzu. Fallangaben werden nicht als persönliche Standards gespeichert.
- Unveränderte Formate gemäss [DEC-2026-026](../entscheidungen/DEC-2026-026-beschluss.md): Sozialverfahrenskatalog `2.0.0`, Manifest und Mindestconsumer `6.0.0`.
- Dokumentierte [begrenzte Quellenkontrolle](quellenkontrolle-ap20c2.md), automatisierte Berechnungs-, Sperr- und Regressionstests, isolierter SPFx-Build sowie die lokale Browserprüfung innerhalb ihrer ausdrücklich ausgewiesenen Grenzen. Das Quellen- und Anwendungsfenster bleibt 01.01.2026–31.12.2027.

Der vorgelegte Nachweis weist 1517 Kern-/UI-, 133 Governance-, 12 Web-, 123 SPFx-Quell-/Lader- und 56 Prüfungen am tatsächlich gebauten Produkt als bestanden aus. Die Zahlen sind nicht additiv. Diese Abnahmenachführung ist kein neuer fachlicher Quellenabgleich und kein erneuter vollständiger Testlauf.

## Unverändert gebundener Prüfstand

Abgenommen ist der lokale Kandidat `2026-10-01-ap20c2-candidate.1`. Die folgenden SHA-256-Prüfsummen binden den vorgelegten Stand:

| Nachweis | SHA-256 |
| --- | --- |
| Kandidatenmanifest | `e7d1921d7a67adc60e49142fe549f1f6113cf73084f94fd1f0f057d3360cc520` |
| AP20C2-Prüfprotokoll | `311cb80a027c0de883a7c07c46ba59e150065bdad3657a2c4947dec0bbacb2e9` |
| Integrationsbericht | `3877dca11c114d7cf679e3efae77187139f6a34ec5bbda0631305b7b7e07d978` |
| Quellenkontrolle AP20C2 | `ecd07f43bc15e16eb10ed58835d520629b0b645f92d8c985560279243576d363` |
| AP20C1-Abnahme als Grundlage | `f94289c3069128a26bb4a270d178982dac342d0f3267b2059dbe0d8c6e657f11` |

Bei der Abnahmenachführung wurde der bestehende technische Nachweis erneut auf Integrität geprüft. Die 57 gebundenen Nachweisdateien, sechs Prüflogs, zehn Kandidatenartefakte und historischen AP20C1-/AP20B-Bindungen stimmen weiterhin überein. Die acht vor AP20C2 gesicherten C1-Dateifassungen bleiben als historische Vorbilder erhalten.

Angaben wie «zur Abnahme», `ready-for-review` und `humanApproval: false` bleiben in den gebundenen Unterlagen als historischer Erstellungsstand unverändert. Für die am 1. Oktober 2026 erklärte menschliche Integrationsabnahme ist diese ergänzende Notiz massgebend.

## Weitergeltende Grenzen und nächster Schritt

Die Abnahme bestätigt das Arbeitsergebnis, nicht dessen operative Aktivierung. Alle 42 releasebezogenen Freigabeverknüpfungen bleiben `candidate` mit `approval: null`. Positive Berechnungsprüfungen verwenden nur synthetische Freigaben im Testspeicher. Die Vorschau bleibt bis zu einer gesonderten operativen Datenfreigabe und kontrollierten Übernahme ohne definitive Fristausgabe.

- Keine neue Quellenreleasefreigabe oder Datenpromotion. Der vorgesehene Quellenabgleich vor dem späteren Release bleibt erforderlich.
- Keine Änderung an Produktcode, Kandidatendaten, produktiven Datenpins, Paketen, Mirrors oder M365-Berechtigungen durch diese Statusnachführung.
- Kein Commit, Quellcode-Push oder E-/Q-/P-Deployment. MVP 0.5 bleibt unverändert in Betrieb. Die GitHub-Issue-Nachführung veröffentlicht keine lokalen Quell- oder Dokumentdateien.
- AP20C3 für MVG und ÜLG ist der nächste vorgesehene Umsetzungsschritt, durch diese Abnahme aber noch nicht gestartet.
- Nationale Modellierung ist keine schweizweite Betriebsfreigabe. Die bernische Produktgrenze und sämtliche dokumentierten fachlichen und zeitlichen Einschränkungen gelten fort.

David Steimer nimmt Fachprüfung und Abnahme in Personalunion wahr. Codex dokumentiert die Erklärung als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

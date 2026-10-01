# AP20C1 Abnahme der EOG Integration und des Consumers 6

Datum: 1. Oktober 2026. Entscheider: David Steimer.

David Steimer hat die fachlich-technische Abnahme erklärt und die zunächst abweichend genannte Paketbezeichnung auf Rückfrage mit **«Ja, AP20C1.»** ausdrücklich präzisiert. Damit ist die am 30. September 2026 vorgelegte lokale AP20C1-Integration fachlich-technisch abgenommen. Die Erklärung wird ausschliesslich AP20C1 zugeordnet.

Diese Notiz dokumentiert die menschliche Abnahme zusätzlich zum unveränderten [Integrationsbericht](../architektur/implementierung-ap20c1.md) und [technischen Prüfnachweis](../../outputs/ap20c1-2026-09-30/pruefprotokoll.json). [Issue #41](https://github.com/davidsteimer/fristenrechner/issues/41) führt den Abschluss dieses Arbeitspakets. Das übergeordnete [Issue #35](https://github.com/davidsteimer/fristenrechner/issues/35) bleibt für die Folgearbeiten offen.

## Abgenommener Gegenstand

- Umsetzung von [DEC-2026-026](../entscheidungen/DEC-2026-026-beschluss.md) mit Sozialverfahrenskatalog `2.0.0`, Manifest und Mindestconsumer `6.0.0`. Exakte Formatpaarung, Rückwärtskompatibilität und Kandidatensperre gehören zum abgenommenen Umfang.
- Vier nationale EOG-Verfahrensmodelle und sechs Berner Anbindungen. Nationale Regel, Berner Zuständigkeitsanbindung und eigenständige Feiertagsqualifikation bleiben getrennt. Das geprüfte Quellen- und Anwendungsfenster bleibt 01.01.2026–31.12.2027.
- Erhaltung der 24 bisherigen nationalen Regeln und 28 Anbindungen einschliesslich ihrer Berechnungsergebnisse und Rechenspuren. Neun weitere Datenartefakte sind byteidentisch zum freigegebenen MVP 0.5.
- Reduzierte zweispaltige DE-/FR-Bedienung, frühe Datumseingabe und getrennte Fallangaben für kantonale und nichtkantonale Kassenwege. Keine redundanten Dokumentfelder oder Bestätigungscheckboxen. Fallbezogene Zuständigkeitsmerkmale bleiben von gespeicherten Standards ausgeschlossen.
- Dokumentierte [begrenzte Quellenkontrolle](quellenkontrolle-ap20c1.md), automatisierte Berechnungs- und Sperrtests, Bestandsregression, isolierter SPFx-Build und lokale Browserkontrolle einschliesslich ihrer ausdrücklich beschriebenen Nachweisgrenzen.

Der vorgelegte Prüfnachweis weist 1354 Kern-/UI-, 133 Governance-, 12 Web-, 106 SPFx-Quell-/Lader- und 48 Prüfungen am tatsächlich gebauten Produkt als bestanden aus. Diese Zahlen sind nicht additiv. Die vorliegende Statusnachführung ist kein neuer Testlauf und keine neue Quellenprüfung.

## Unverändert gebundener Prüfstand

Abgenommen ist der lokale Kandidat `2026-09-30-ap20c1-candidate.1` mit insgesamt 28 nationalen Regeln und 34 Berner Anbindungen. Die folgenden SHA-256-Prüfsummen binden den vorgelegten Stand:

| Nachweis | SHA-256 |
| --- | --- |
| Kandidatenmanifest | `deb308e319a47eaf80f9056b88ee2bc9ff56c0500e70269fb0bc54e91a1900b5` |
| AP20C1-Prüfprotokoll | `691d831b5220676a89dd48acf9fcab199f52ba66edcfd90fdc2a86f0d3bd8918` |
| Integrationsbericht | `89c3e76dd049de50faab1981bcf747810365757edb24f6075eb49f5c6b4ab9ad` |
| AP20B-Prüfprotokoll als Grundlage | `8d67ad7b6e0541104cfa7e8f124cf1e206cdbe6c82111b287dcc4ae54cf9c25d` |

Bei der Abnahmenachführung wurden alle 34 AP20C1-Nachweisdateien, sechs gebundenen Prüfprotokolle, zehn Kandidatenartefakte einschliesslich ihrer Byteanzahl und 15 AP20B-Nachweisdateien erneut auf Übereinstimmung geprüft. Sämtliche Prüfsummen stimmen. Die Kandidatenfreigaben bleiben unverändert.

Die bisherigen Angaben «zur Abnahme», `ready-for-review`, `humanApproval: false` und `manualApproval: false` bleiben in den gebundenen Unterlagen unverändert als historischer Erstellungsstand erhalten. Für die am 1. Oktober 2026 erklärte menschliche Integrationsabnahme ist diese ergänzende Notiz massgebend.

## Weitergeltende Grenzen und nächster Schritt

Die Abnahme bestätigt das Arbeitsergebnis, nicht dessen operative Aktivierung. Alle 34 releasebezogenen Freigabeverknüpfungen bleiben `candidate` mit `approval: null`. Positive Rechenprüfungen erfolgten ausschliesslich mit synthetischen Freigaben im Testspeicher. Die Vorschau bleibt ohne definitive Fristausgabe, bis eine gesonderte operative Datenfreigabe und kontrollierte Übernahme erfolgen.

- Keine neue Quellenreleasefreigabe oder Datenpromotion. Vor dem späteren Release bleibt der vorgesehene Quellenabgleich erforderlich.
- Keine Änderung an Produktcode, Kandidatendaten, produktiven Datenpins, bestehenden Paketen, Mirrors oder M365-Berechtigungen durch diese Abnahmenachführung.
- Kein Commit, Quellpush und kein E-/Q-/P-Deployment. Der bestehende MVP-0.5-Betriebsstand bleibt unverändert. Die GitHub-Issue-Nachführung ist keine Veröffentlichung der lokalen Quell- und Dokumentdateien.
- AP20C2 für FamZG/FLG ist als nächster Umsetzungsschritt vorgesehen, aber durch diese Abnahme noch nicht gestartet. Anschliessend folgt AP20C3 für MVG/ÜLG nach gesondertem Auftrag.
- Die nationale Wiederverwendbarkeit des Modells erweitert die Produktgrenze nicht auf weitere Kantone. Alle dokumentierten fachlichen und zeitlichen Grenzen gelten fort.

David Steimer nimmt Fachprüfung und Abnahme in Personalunion wahr. Codex dokumentiert die Erklärung als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

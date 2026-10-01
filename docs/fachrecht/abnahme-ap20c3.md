# AP20C3 Abnahme von MVG/ÜLG und der AP20-Gesamtintegration

Datum: 1. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt: **«AP20C3 ist abgenommen. Bitte starte die Releasevorbereitung.»** Damit ist AP20C3 als lokales Integrationspaket abgeschlossen. Die gemeinsame Releasevorbereitung für AP20 beginnt unter der geplanten Bezeichnung MVP 0.6.

Diese Notiz ergänzt den unveränderten [Integrationsbericht](../architektur/implementierung-ap20c3.md), die [begrenzte Quellenkontrolle](quellenkontrolle-ap20c3.md) und den [technischen Prüfnachweis](../../outputs/ap20c3-2026-10-01/pruefprotokoll.json). [Issue #43](https://github.com/davidsteimer/fristenrechner/issues/43) führt das Integrationspaket. Das übergeordnete [Issue #35](https://github.com/davidsteimer/fristenrechner/issues/35) bleibt für weitere, nicht durch AP20 erledigte Konstellationen offen.

## Abgenommener Gegenstand

- Je vier nationale MVG- und ÜLG-Verfahrensmodelle und acht neue Berner Anbindungen. Die bisherigen 36 Regeln und 42 Anbindungen bleiben objektidentisch erhalten, neun weitere Datenartefakte byteidentisch.
- Die zusammengeführte AP20-Integration umfasst EOG, FamZG, FLG, MVG und ÜLG innerhalb des beschlossenen Umfangs. Insgesamt enthält der Kandidat 44 nationale Regeln und 50 Berner Anbindungen, gegenüber MVP 0.5 zusätzlich 20 Regeln und 22 Anbindungen.
- MVG-Verwaltung mit ausdrücklicher Berner Wohnsitz-Produktgrenze. ÜLG-Verwaltung mit eigenständig qualifiziertem zuständigem Durchführungskanton. Die ordentlichen Gerichtswege haben jeweils eine getrennte Zuständigkeitsprüfung nach ATSG Art. 58. Feiertagsanknüpfung und Verfahrenseröffnung bleiben eigenständige Voraussetzungen.
- Reduzierte zweispaltige DE-/FR-Oberfläche, frühe Datumseingabe und sichtbare erforderliche Fallangaben. Fallangaben werden nicht als persönliche Standards gespeichert.
- Sozialverfahrenskatalog `2.0.0`, Manifest und Mindestconsumer `6.0.0` gemäss [DEC-2026-026](../entscheidungen/DEC-2026-026-beschluss.md). Quellen- und Anwendungsfenster weiterhin 01.01.2026–31.12.2027.
- Begrenzte frische Quellenkontrolle, automatisierte Berechnungs-, Sperr- und Regressionstests, isolierter SPFx-Build und lokale Browserprüfung innerhalb der im Integrationsbericht ausdrücklich beschriebenen Grenzen.

Der vorgelegte Nachweis weist 1694 Kern-/UI-, 133 Governance-, zwölf Web-, 140 SPFx-Quell-/Laderprüfungen und 65 Prüfungen am tatsächlich gebauten Produkt als bestanden aus. Die Zahlen sind nicht additiv. Angeordnete Tagesfristen und Beschwerdeverbesserungen wurden automatisiert, nicht jeweils als vollständiger Browserablauf geprüft. Eine E-/Q-/Gastprüfung dieses Kandidaten wird nicht behauptet.

## Unverändert gebundener Stand

Abgenommen ist der Kandidat `2026-10-01-ap20c3-candidate.1`.

| Nachweis | SHA-256 |
| --- | --- |
| Kandidatenmanifest | `b4250a31d226b4f59e0857a857f49e1ea354722b9ff46b9324d70b330f135450` |
| AP20C3-Prüfprotokoll | `3dd855f4a023a2d5486a77753d6719bf5e494dda769521c9ce52042f62381866` |
| Integrationsbericht | `5032afd7cfea71276f273601780addcab2a797228e091544a4c0a3b5801dfd9d` |
| Quellenkontrolle, Bericht | `61a60339dfba7779dd41f13a6730eaf9187854d3ea993054685d1fc145688d09` |
| Quellenkontrolle, technischer Beleg | `b7cfc44bb809f66ff8bbb55e30580710e4716a63253d4125ed6874c55c2b518c` |
| AP20C2-Abnahme als Grundlage | `864543a15afb57b205d9a183134a6eeb91bc19aeefd92bbcd9bdefaa2a1bc7b1` |

Bei dieser Abnahmenachführung wurde der bestehende technische Nachweis erneut auf Integrität geprüft. Die 82 gebundenen Nachweisdateien, acht historischen C2-Dateifassungen, Prüflogs, zehn Kandidatenartefakte und historischen C2-/AP20B-Bindungen stimmen weiterhin überein. Das ist eine Integritätskontrolle des vorhandenen Nachweises, kein neuer vollständiger Testlauf und kein neuer Quellenabgleich.

Die Angaben «zur Abnahme», `ready-for-review` und `humanApproval: false` bleiben in den gebundenen Unterlagen als historischer Erstellungsstand erhalten. Für die menschliche Integrationsabnahme vom 1. Oktober 2026 ist diese ergänzende Notiz massgebend.

## Releaseauftrag und weitergeltende Grenzen

Der Auftrag startet die [lokale Releasevorbereitung für MVP 0.6](../betrieb/deployment-mvp-06.md): Eingänge sichern, Quellenabdeckung zusammenführen, Aktualität prüfen und die späteren Daten-, Build-, Installations- und Publikationsschritte vorbereiten.

- Alle 50 releasebezogenen Freigabeverknüpfungen bleiben vorerst `candidate` mit `approval: null`. Die Integrationsabnahme aktiviert keine produktive Fristberechnung im Kandidaten.
- Die zusammengeführte Quellenprüfung wird separat zur fachlichen Abnahme vorgelegt. Kontrollierte Datenübernahme und definitive Artefaktbauten folgen erst nach dem entsprechenden Auftrag.
- Keine Installation, Mirrorumstellung, Änderung von M365-Berechtigungen, Quellcodeveröffentlichung oder öffentliche P-Umschaltung allein durch diesen Auftrag. MVP 0.5 bleibt unverändert in Betrieb.
- Nationale Modellierung bedeutet weiterhin keine schweizweite Betriebsfreigabe. Bernische Produktgrenzen, Ausschlüsse und zeitliche Vorbehalte bleiben bestehen.
- Historische AP5-Daten und bestehende Release-, Quellen- und Abnahmenachweise bleiben erhalten.

David Steimer nimmt Fachprüfung und Abnahme in Personalunion wahr. Codex dokumentiert und unterstützt als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

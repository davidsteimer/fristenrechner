# AP19C3 · KVG-/OKP-Integration

Stand: 28. September 2026. **Technisch geprüfter lokaler Implementierungskandidat zur fachlich-technischen Abnahme, keine operative Freigabe.** Startauftrag von David Steimer: «Danke, dann starten wir mit AP19C3.» Prüfstatus und tatsächlich ausgeführte Nachweise stehen im [Prüfbericht](../fachrecht/pruefbericht-ap19c3.md).

## Umfang

AP19C3 ergänzt den fachlich-technisch abgenommenen C2-Stand um die vier in AP19B geprüften nationalen Pfade für individuelle Leistungen der obligatorischen Krankenpflegeversicherung. Das ist keine pauschale KVG-Abdeckung. Sozialverfahrenskatalog `1.0.0`, Manifest-/Consumerformat `5.0.0` und die bestehende Tagesarithmetik bleiben unverändert.

| Handlung | Auslöser | Dauer |
| --- | --- | --- |
| Einsprache | qualifizierte erstinstanzliche Leistungsverfügung des Krankenversicherers | 30 Tage |
| Ordentliche Beschwerde | Einspracheentscheid über individuelle OKP-Leistungen | 30 Tage |
| Eingabe im laufenden Verwaltungsverfahren | ausdrücklich angeordnete prozessuale Tagesfrist des zuständigen Krankenversicherers | eingegebene Anzahl Tage |
| Formelle Beschwerdeverbesserung | gerichtliche Anordnung einer Tagesnachfrist zur Behebung eines formellen Beschwerdemangels | eingegebene Anzahl Tage |

Vier neue Bundesregeln mit den Kennungen `CH-SOC-KVG-OKP-OBJ`, `CH-SOC-KVG-OKP-APP`, `CH-SOC-KVG-OKP-ADM` und `CH-SOC-KVG-OKP-CORRECTION` erhalten vier getrennte Berner Anbindungen. Der Gesamtstand enthält damit **24 Bundesregeln und 28 Anbindungen**. Die 20 Regeln und 24 Anbindungen des C2-Kandidaten werden nicht umgeschrieben. Der neue Kandidat ersetzt weder C2 noch einen operativ freigegebenen Release.

Die [erneute Quellenprüfung](../fachrecht/quellenabgleich-ap19c3.md) und die [zeitliche Bindung](../fachrecht/zeitliche-bindung-ap19c3.md) dokumentieren das geprüfte Fenster 2026–2027 und die unterschiedlichen Anknüpfungszeitpunkte. Die Frist und ihr verschobenes Ende müssen vollständig im belegten Rechenraum liegen.

## Berner Anbindung ohne Versicherersitzfilter

Im Verwaltungsverfahren ist `be-kvg-okp-product-scope` eine **Produktgrenze**, keine gesetzliche Zuständigkeitsregel. Der zuständige Krankenversicherer muss fachlich feststehen. Die versicherte Person muss bei der fristauslösenden Zustellung Wohnsitz im Kanton Bern haben. Dieser Zeitpunkt konkretisiert den im abgenommenen Vertrag verlangten dokumentierten Produktbezug. Er ersetzt keine gesetzliche Gerichtsstandsbestimmung.

Die Oberfläche fragt deshalb den tatsächlichen Wohnsitzkanton ab, nicht einen fiktiven Verwaltungskanton. Der Sitz des Krankenversicherers wird weder als Pflichtfeld eingeführt noch aus dem oben gewählten Verfahrenskontext abgeleitet. Ein ausserkantonaler Versicherersitz ist bei passender Berner Anbindung zulässig. Umgekehrt genügt ein Sitz in Bern nicht zur Qualifikation.

Im Gerichtsverfahren bleibt `be-atsg58-court` eine gesonderte Zuständigkeitsanbindung. Gerichtskanton, massgebender Wohnsitzkanton und Zeitpunkt der Beschwerdeerhebung sind eigenständige Angaben. Das zuletzt bestätigte zusätzliche Datumsfeld bleibt unverändert. Die Beschwerdeverbesserung setzt eine bereits erhobene Beschwerde voraus. Der Zuständigkeitszeitpunkt ist kein zweiter Fristauslöser und verändert nicht die Tageszählung.

Die Feiertagsanknüpfung von Partei und Vertretung wird in beiden Stadien separat erhoben. Die bisherigen geprüften Berner Kalenderkombinationen bleiben die Grenze. Die nationalen Regeln selbst enthalten weder Bern-Konstanten noch eine Kopie pro Kanton.

## Reduzierte Oberfläche

Der neue Erlasseintrag lautet «Krankenversicherung (KVG) · individuelle OKP-Leistungen», auf Französisch «Assurance-maladie (LAMal) · prestations individuelles AOS». Er erscheint nur bei tatsächlich vorhandenem C3-Datenpfad. Alte Kandidaten und freigegebene Datenstände erhalten keine neue Auswahl allein aufgrund des erweiterten Programmcodes.

Der bestehende zweispaltige Aufbau bleibt erhalten. Im Verwaltungsstadium steht im bereits vorhandenen festen Gegenstandsfeld die abgenommene kurze Voraussetzung «Individuelle OKP-Leistung · versicherte Person mit Wohnsitz im Kanton Bern». Darunter stehen Wohnsitz und Feiertagsanknüpfung nebeneinander. Es gibt keinen zusätzlichen Informationsblock, kein Versicherersitzfeld und kein Dropdown mit nur einer echten Auswahl.

Das fristauslösende Dokument bleibt aus der ausgewählten Handlung abgeleitet und in der zunächst geschlossenen Rechenspur nachvollziehbar. Dort stehen auch das Zuständigkeitsmodell, die Quellen und die zusätzlichen Sachbereichsgrenzen. Keine neue Bestätigungscheckbox. Das primäre Datum bleibt früh bedienbar und bei gleicher Bedeutung erhalten. Fallkantone, Zuständigkeitsdatum und übrige Falltatsachen werden nicht als persönliche Standards gespeichert.

Eine formlose Leistungsabrechnung oder Mitteilung wird nicht automatisch als Verfügung behandelt. Prämienverbilligung, Tarif- und Schiedsverfahren, freiwilliges KVG-Taggeld, VVG-Zusatzversicherung, materielle Anspruchsfristen und allgemeine gerichtliche Tagesfristen sind keine zusätzlichen Rechenpfade. Gesetzlicher ATSG-Ausschluss und blosse Produktgrenze bleiben im Katalog verschiedene Kategorien. Die Auswahloberfläche erkennt den Inhalt eines Dokuments nicht selbständig. Die fachlich richtige Auswahl bleibt Aufgabe der benutzenden Person.

## Implementierung und Bestandsschutz

- [Deterministischer Builder](../../scripts/build-ap19c3-candidate.mjs), [Manifest](../../data/candidates/2026-09-28-ap19c3/manifest.json), [Buildnachweis](../../outputs/ap19c3-2026-09-28/build-verification.json) und [lokaler Import](../../src/release/ap19c3CandidateData.ts).
- Gemeinsamer [Sozialresolver](../../src/core/socialDeadline.ts) ohne neue KVG-Sonderarithmetik, explizite [UI-Zuordnung](../../src/ui/socialUi.ts), deutsche und französische [Produkttexte](../../src/ui/socialMessages.ts).
- [Buildertests](../../tests/core/ap19c3-builder.test.ts), [Engineintegration](../../tests/core/ap19c3-integration.test.ts), [UI-Vertrag](../../tests/ui/ap19c3-social.test.ts), [Schema-/Datenprüfungen](../../tests/data/test_ap19c3_contract.py), [SPFx-Transport](../../spfx/test/kvg-release-contract.test.ts) und [kompilierter Consumer](../../spfx/test-build/kvg-consumer.test.cjs).
- [Schutzprüfung](../../scripts/check-ap19c3-preservation.mjs) für gebundene Vorlagen, C1-/C2-Kandidaten, MVP 0.4 und vorbestehende Benutzerdateien. Historische Codehashes bleiben historische Nachweise, der gemeinsame Code darf für C3 weiterentwickelt werden.

## Haltepunkt

Release-ID `2026-09-28-ap19c3-candidate.1`. Regeln, Anbindungen und Freigabeeinträge bleiben Kandidaten, `approval` bleibt `null`. Die echte lokale Vorschau gibt deshalb kein Sozialfrist-Enddatum aus. Positive Rechenprüfungen verwenden ausschliesslich synthetische Freigaben im Testspeicher.

Nächster Haltepunkt ist die fachlich-technische Abnahme durch David Steimer. Datenpromotion und zusammengehörige Releasevorbereitung benötigen einen anschliessenden gesonderten Auftrag. Kein Commit, Push, Deploy-Key, Mirrorwechsel, Hostingzugriff oder Eingriff in E/Q/P aus AP19C3. Codex dokumentiert und prüft als KI-Arbeitsinstrument, ohne eigene Freigabeverantwortung.

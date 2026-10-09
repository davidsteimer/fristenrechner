# AP22B Abnahme des Daten- und Migrationsplans

Datum: 8. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> Ich bestätige den AP22B-Daten- und Migrationsplan mit nachstehenden Eckpunkten:

Die anschliessend ausdrücklich bestätigten acht Eckpunkte entsprechen vollständig dem vorgelegten Entscheid. **AP22B ist damit fachlich-technisch abgenommen und DEC-2026-030 beschlossen.** Die Bestätigung umfasst insbesondere die konkreten Formatversionen, Zeitabdeckung und Migrationsregeln. Es ist keine zusätzliche Bestätigung derselben Eckpunkte erforderlich. Der [Beschlussnachweis](../entscheidungen/DEC-2026-030-beschluss.md) hält den verbindlichen Inhalt fest.

## Abgenommener Gegenstand

Abgenommen ist der [AP22B-Daten- und Migrationsvertrag](../architektur/kalendervertrag-ap22b.md) mit den drei isolierten Schemavorlagen, der gebundenen Strukturprobe und dem Referenzindex. Bestätigt sind Katalog 2.0.0, Regelkalender 3.0.0 sowie Manifest und Mindestconsumer 7.0.0. Die übrigen Komponentenformate und die abgegrenzte bernische Sozialabdeckung bleiben unverändert.

Die 198 Herkunftsentscheidungen, 104 Verfahrensbindungen und 32 Kalenderdefinitionen bleiben getrennte Ebenen. Sämtliche 479 vorhandenen Katalogregeln werden erhalten. Zwölf eigenständige SO-Prozessregeln ergänzen den Bestand. Die Regeln für Rollen, regionale Genauigkeit, Januarvergleich, GR-/NE-Vorbehalte, Defaultmigration und konfigurationsgebundenen Cachefallback sind mitbestätigt.

Die neue Kalenderabdeckung beginnt am 29. August 2026 und ist nach oben offen, zusätzlich begrenzt durch Normgeltung, Gebietsstand, Profilgrenzen und konkrete Releasefreigaben. Daraus folgt kein unbegrenzter Rechtsbeständigkeitsnachweis. Die 44 nationalen Sozialregeln und 50 BE-Anbindungen behalten ihre fachlichen Inhalte und ihr Freigabefenster 2026–2027. Ihre spätere technische Releasebindung muss neu erfolgen.

Die Abnahme akzeptiert den dokumentierten Nachweis von 44 bestandenen isolierten Schema-, Struktur- und Manipulationstests samt Aussagegrenzen. Sie nimmt weder einen noch nicht implementierten Produktresolver noch die spätere Hostintegration vorweg ab. Für diese Statusnachführung wurden die Tests nicht nochmals ausgeführt.

## Unveränderte Bindung der Vorlage

Alle 13 im [QA-Protokoll](../../outputs/ap22b-vertrag-2026-10-08/QA-AP22B.json) bezeichneten Dateien wurden bei dieser Nachführung erneut auf SHA-256 und Byteanzahl geprüft. Alle Bindungen stimmen. Auch die beiden Testprotokolle entsprechen ihren hinterlegten Prüfsummen.

| Nachweis | SHA-256 |
| --- | --- |
| QA-AP22B.json | `7ec00a65114a25b5fe074ffd991cf3b3e2807920411e029372d2a0ba1da00d4a` |
| Vertragsvorlage | `bf682c5dbdc57593b7355749405d9a6f9a4a08d6c12502d6f315df5c4e336b73` |
| DEC-2026-030-Vorlage | `519726f943f6ab60999c5da9a433c40d6dd2d7d4b3e4022e68d3a5dda4d21ad4` |
| Ergänzender lesbarer Prüfnachweis | `fe784bbdc11ecdcdbcf7aa7055e5f58b21e47fb549ee1fa86ac087dfe5c67cb1` |

Die AP22A-Abschlussdateien sind ebenfalls unverändert: Matrixdaten V1.0 `7c0512b66fcd7206c47f2d36b4774824325fe779b7045cb12925bf2fb0146f89`, Arbeitsmappe V1.0 `04017ac54da729e5a35ae8926076362027015b581744c87023d5696db61ccad0`.

Die früheren Angaben «Vorlage», «vorgeschlagen», `contractApproved: false` und Kandidatenstatus in den eingereichten Dateien bleiben als damaliger Prüfstand erhalten. Für die heutige Abnahme und den Architekturentscheid sind diese Notiz und der Beschlussnachweis massgebend. Die Strukturprobe wird nicht rückwirkend zu einem freigegebenen Datenrelease umgeschrieben.

## Nächster Schritt und Freigabegrenzen

**AP22C1 ist fachlich und architektonisch vorbereitet, aber noch nicht gestartet.** Vorgesehen sind Datenmodelle, Parser, Projektion, Generator, SO-Ergänzung sowie unabhängige TypeScript-/Python-Validierung unter Erhaltung der historischen Reader. Die weitere Aufteilung und das WIP-Limit bleiben gemäss Vertrag bestehen.

Die vorliegende Bestätigung ist keine Quellenreleasefreigabe, Datenpromotion, App-Bereitstellung oder Veröffentlichung. Produktcode, produktive Schemata, alte Releases, AP5-Pins, E/Q/P, Mirrors und Berechtigungen bleiben unverändert. GitHub und der entfernte Projektstatus wurden durch diese lokale Nachführung weder geprüft noch geändert. Eine bestätigte OneDrive-Synchronisation wird nicht behauptet.

David Steimer nimmt Fachverantwortung und Abnahme in Personalunion wahr. Codex dokumentiert die Bestätigung als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

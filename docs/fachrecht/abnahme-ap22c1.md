# AP22C1 Abnahme der Daten- und Generatorintegration

Datum: 8. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP22C1 ist abgenommen. Bitte starte mit AP22C2.

**AP22C1 ist damit abgenommen. AP22C2 ist zur lokalen Umsetzung freigegeben.** Gegenstand ist die [C1-Implementierung](../architektur/kalenderintegration-ap22c1.md) des beschlossenen Datenvertrags mit Parsern, Schemaprüfung, Projektion, Generator und unabhängigen TypeScript-/Python-Prüfungen.

Der eingereichte Nachweis umfasst 82 neue TypeScript-Tests, 35 unabhängige Python-Tests und 3'940 übereinstimmende Datumsproben. Die damalige Gesamtprüfung umfasst 2'121 Produkttests und 44 AP22B-Vertragstests. Diese Zahlen bezeichnen den abgenommenen C1-Prüflauf, nicht einen nachträglich neu erzeugten Nachweis.

## Bindung des abgenommenen Stands

Vor Beginn der C2-Codeänderungen wurden alle 22 im C1-QA-Protokoll gebundenen Quelldateien gegen SHA-256 und Byteanzahl geprüft und zusammen mit dem Protokoll in einer eigenen [Abnahmekopie](../../outputs/ap22c1-abnahme-2026-10-08/receipt.json) gesichert. Damit bleiben der abgenommene Code und die dazugehörigen Prüfnachweise trotz anschliessender Weiterentwicklung nachvollziehbar.

| Nachweis | SHA-256 |
| --- | --- |
| Ursprüngliches QA-AP22C1.json | `21381e84e85e42e2f43d01fd054efe161adf14fef91d4e419030e8dd0874167c` |
| Abnahmeregister receipt.json | `5b0e2e9da7ac5b5306361311927f6b90ada3d1b89ba3d7081d0ebe31fa9076aa` |
| Gebundener Feiertagskatalog | `e6ed02029f4fc6df1bee6648aeae9d6975ec2c7218458f257db50680b581db81` |

Die bisherigen Angaben «zur Abnahme» und «Kandidat» bleiben in den historischen Prüfdateien unverändert. Für die Abnahme ist diese Notiz massgebend. Das Datenbündel bleibt ein Kandidat ohne operativen Release.

## Nächster Schritt und Grenzen

C2 umfasst Rollen- und Gebietsauflösung, vollständigen Januarvergleich, gemeinsame DE-/FR-Oberfläche, Rechenspur und Defaults Version 4. C3 bleibt für Provider, konfigurationsgebundenen Cache und Hostintegration einschliesslich AP5 zuständig.

Die Abnahme ist keine Quellenreleasefreigabe, Datenpromotion, E-/Q-/P-Bereitstellung oder Veröffentlichung. Historische Releases und AP5-Pins bleiben unverändert. Der Start von C2 erweitert weder die bernische Sozialfreigabe noch die kantonalen Verwaltungsverfahren.

David Steimer nimmt Fachverantwortung und Abnahme in Personalunion wahr. Codex dokumentiert und implementiert als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

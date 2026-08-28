# Beiträge zum Fristenrechner Schweiz

Danke für das Interesse am Fristenrechner Schweiz. Das Projekt befindet sich in einer frühen Aufbauphase. Beiträge sollen die fachliche Nachvollziehbarkeit und die einfache Bereitstellung in Microsoft 365 stärken.

## Vor einer Änderung

Für Fehlerkorrekturen mit kleinem, eindeutigem Umfang genügt ein Pull Request. Für neue Funktionen, neue Rechtsprofile, Architekturänderungen oder materielle Änderungen an Fachregeln ist zuerst ein Issue erforderlich.

Ein Issue beschreibt mindestens:

- Problem und erwarteten Nutzen
- Umfang und bewussten Nichtumfang
- überprüfbare Akzeptanzkriterien
- betroffene Rechtsgebiete, Gemeinwesen und Sprachen
- amtliche Quellen oder ausdrücklich noch offene Quellenfragen
- allfälligen Entscheidungsbedarf

## Arbeitsweise

1. Einen kurzen, thematisch klaren Branch ab `main` erstellen.
2. Nur einen zusammenhängenden Zweck pro Pull Request bearbeiten.
3. Code, Daten, Tests und Dokumentation gemeinsam aktualisieren.
4. Lokale Prüfungen ausführen und die Ergebnisse im Pull Request festhalten.
5. Bekannte Einschränkungen offen benennen.

Das Projekt arbeitet mit einem WIP-Limit von einem wesentlichen Arbeitspaket. Unabhängige Kleinstkorrekturen dürfen parallel vorbereitet werden, solange sie die laufende Hauptarbeit nicht verdecken.

## Fachliche Anforderungen

Änderungen an Rechtsprofilen, Feiertagen oder Fristenstillständen benötigen:

- eine amtliche Primärquelle mit stabilem Link
- Rechtsgrundlage und relevante Bestimmung
- Gültigkeitsbeginn und bei Bedarf Gültigkeitsende
- Datum der Quellenprüfung
- mindestens einen positiven und einen geeigneten Grenzfall
- eine sichtbare Kennzeichnung von Unsicherheiten oder Ausnahmen

Sekundärquellen können die Auslegung unterstützen. Sie ersetzen die amtliche Rechtsgrundlage nicht. Unsichere Rechtsfragen werden nicht als scheinbar sichere Automatik implementiert.

## Sprache und Barrierefreiheit

Interne technische Dokumentation wird auf Deutsch geführt. Neue oder geänderte Produkttexte müssen gleichzeitig auf Deutsch und Französisch vorliegen. Es gilt schweizerische Rechtschreibung.

Oberflächenänderungen berücksichtigen Tastaturbedienung, verständliche Beschriftungen, Zoom, Kontrast und Screenreader. WCAG 2.1 AA nach eCH-0059 ist das Qualitätsziel.

## Datenschutz und Testdaten

Es dürfen keine echten Falldaten, Namen, Aktenzeichen, Zugangsdaten oder tenantinternen Geheimnisse eingecheckt werden. Testfälle sind synthetisch oder vollständig anonymisiert. Lokale Konfigurationen und Geheimnisse gehören in ignorierte Dateien und niemals ins Repository.

## Technische Qualität

Der Rechenkern bleibt von GUI und Datenprovider getrennt. Datumsberechnungen verwenden reine ISO-Kalenderdaten ohne Uhrzeit. Neue Abhängigkeiten sind zurückhaltend einzusetzen und im Pull Request zu begründen.

Sobald die technische Basis steht, muss ein Pull Request mindestens folgende Prüfungen bestehen:

- Formatierung und statische Analyse
- Unit Tests und betroffene Golden Cases
- Schema- und Datenvalidierung
- vollständige Sprachkataloge für Deutsch und Französisch
- Prüfung auf Geheimnisse und unnötige Personendaten

## Entscheide

Eine stabile DEC-Datei ist erforderlich, wenn vernünftige Alternativen bestehen und der Entscheid Fachlichkeit, Umfang, Architektur, Sicherheit, Datenschutz, Lizenz, Betrieb, Aufwandband oder spätere Änderbarkeit wesentlich beeinflusst. Der Ablageort ist `docs/entscheidungen/`.

## Commits und Pull Requests

Commit-Nachrichten sollen kurz und handlungsorientiert sein, zum Beispiel `docs: Repository-Basis dokumentieren`. Der Pull Request erklärt Ergebnis, Prüfungen, Rechtsquellen, Entscheide und Restpunkte. Ein Pull Request ist kein Ersatz für eine fachliche Freigabe.

Wenn KI-Werkzeuge einen materiellen Anteil an Analyse, Code oder Dokumentation hatten, wird dies im Pull Request transparent genannt. Verantwortung, Prüfung und Freigabe bleiben bei der einreichenden Person und den zuständigen menschlichen Rollen.

## Lizenzierung von Beiträgen

Mit einem Beitrag bestätigst du, dass du ihn einreichen darfst. Programmcode wird unter `AGPL-3.0-only` lizenziert. Eigene Dokumentation sowie kuratierte Regel- und Kalenderdaten werden unter `CC-BY-SA-4.0` lizenziert, soweit keine abweichenden Rechte an Primär- oder Drittquellen bestehen.

Es wird derzeit weder eine zusätzliche Contributor License Agreement noch eine Übertragung des Urheberrechts verlangt.

# Fachrechtliche Grundlagen

Dieser Bereich enthält die fachrechtliche Arbeitsgrundlage des Fristenrechners. Der abgenommene Stand von Arbeitspaket AP4 umfasst:

- die [Rechtsmatrix für den MVP](rechtsmatrix-mvp.md)
- das [Quellenregister](quellenregister.md)
- die [offenen Fachfragen und Sicherheitsgrenzen](offene-fachfragen.md)
- den [maschinenlesbaren AP6-Golden-Case-Korpus](../../tests/golden/README.md)

AP11A ergänzt als noch nicht abgenommener Kandidat:

- die [Fachanalyse der bekannten VRPG-Spezialregime](vrpg-be-spezialregime-ap11a.md)
- den [maschinenlesbaren AP11A-Kandidatenkatalog](../../data/candidates/2026-08-30-ap11a-vrpg-be/README.md)
- acht [synthetische Kandidatenfälle](../../tests/golden/candidates/ap11a-vrpg-be-special-cases.json)

## Verbindlichkeit im Projekt

Die Rechtsmatrix beschreibt den fachlich geprüften Sollzustand für AP5 und AP6. Sie ist keine Rechtsauskunft für einen konkreten Fall. Die maschinenlesbaren Regeln aus AP5 und die Golden Cases aus AP6 bilden gemeinsam den prüfbaren Testvertrag für den späteren Rechenkern.

Für jede spätere Regel gelten mindestens folgende Nachweise:

1. stabile Regel-ID
2. amtliche Primärquelle mit genauer Fundstelle
3. Gültigkeitsbeginn und bei Bedarf Gültigkeitsende
4. Datum der Quellenprüfung
5. Prüfstatus und verantwortliche Person
6. positiver Testfall und geeigneter Grenzfall

Amtliche Erlasse gehen Zusammenfassungen und technischen Ableitungen vor. Rechtsprechung erläutert die Anwendung, ersetzt aber die gesetzliche Grundlage nicht. Bei einer Abweichung zwischen Matrix und geltendem Recht ist die Automatik zu sperren, bis die Regel fachlich neu geprüft und versioniert ist.

## Pflege

David Steimer nimmt in der aktuellen Einpersonenphase Fachverantwortung, Prüfung und Freigabe wahr. Die Rollen bleiben im Nachweis getrennt ausgewiesen, damit das künftige Betriebskonzept ohne Strukturbruch erweitert werden kann.

Materielle Auslegungs- oder Umfangsentscheide werden im [Entscheidungsregister](../entscheidungen/README.md) dokumentiert. Offene Fragen werden nicht als scheinbar sichere Regeln in den Rechner übernommen.

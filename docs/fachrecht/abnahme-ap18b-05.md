# AP18B-05: Abnahme der Arbeitsmappe V0.12 und des Vertragsnachtrags 0.6.0

| Merkmal | Festlegung |
| --- | --- |
| Datum | 22. September 2026 |
| Fachverantwortung und Abnahme | David Steimer in Personalunion |
| Status | V0.12 und technischer Vertragsnachtrag abgenommen, AP18B-05 abgeschlossen |
| Gegenstand | Gesamte vorgelegte Arbeitsmappe V0.12 mit 479 Regeln, 488 Kalenderzeilen, 49 Geltungsprofilen, 84 Quellen und 90 Quellenprüfungen |
| Strukturvertrag | Arbeitsmappenvertrag `0.6.0` gemäss beschlossenem DEC-2026-022, ergänzend zu DEC-2026-021 |
| Folgeauftrag | Kontrollierte AP18C-Übernahme, beginnend mit AP18C1 |
| Freigabegrenze | Abgenommene Erfassungs- und Prüfgrundlage, keine produktive Daten- oder Betriebsfreigabe |

## 1. Erklärung und gebundene Fassung

David Steimer erklärt im Projektgespräch:

> V0.12 und der technische Vertragsnachtrag sind abgenommen und der Übernahme von AP18C sollte damit nichts mehr im Wege stehen.

Die Abnahme betrifft die tatsächlich vorgelegte [Arbeitsmappe V0.12](../../outputs/ap18b-05-bedingte-feiertage-2026-09-22/2026-09-22_Feiertagsmatrix_Schweiz_AP18B-05_V0.12.xlsx). Die Prüfsumme wurde bei der Dokumentation erneut gegen die gespeicherte Datei abgeglichen:

```text
d4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65
```

Die gesamte Datei ist als Facharbeitsgrundlage abgenommen, nicht nur die fünf neuen Regelzeilen. [DEC-2026-022](../entscheidungen/DEC-2026-022-bedingte-feiertagsregeln.md) ist damit als begrenzter technischer Vertragsnachtrag beschlossen. Er ergänzt den Arbeitsmappenvertrag aus [DEC-2026-021](../entscheidungen/DEC-2026-021-arbeitsmappenvertrag-050.md), ohne dessen übrigen Inhalt vollständig abzulösen. Eine Abnahme eines neuen Produktkalenderformats ist damit nicht verbunden.

## 2. Bestätigter Umfang und fortbestehende Grenzen

Die Bereinigung umfasst die bedingten Stephanstagsregeln in AR und AI, die Verschiebung der Näfelser Fahrt aus der Karwoche und die beiden allgemeinen Ersatzfeiertage in NE. Die vier Datumsfälle sind mit fünf zusätzlichen Regeln umgesetzt. Der [Umsetzungsnachweis](../architektur/erfassung-ap18b-05.md) hält Quellen, fachliche Vorgaben und technische Grenzen fest.

Folgende Abgrenzungen gelten unverändert:

- Der AI-Kalendereintrag vom 26.12.2026 ist für das Projekt zugunsten der gesetzlichen Regel fachlich entschieden. Eine amtliche Berichtigung wird nicht behauptet.
- Zusätzliche gesondert festgelegte regionale NE-Feiertage und Verwaltungsschliesstage werden nicht automatisch erzeugt. Ihre konkrete Fristenwirkung bleibt vorbehalten. Die bereits erfassten festen LPA-Ergänzungen und Fronleichnam in Le Landeron bleiben erhalten.
- Der Solothurner Halbtag am 1. Mai hat gemäss [Abnahme AP18B-03](abnahme-ap18b-03.md) in beiden erfassten SO-Geltungsprofilen keinen Einfluss auf den Fristenlauf. Seine Eigenschaft als Halbtag bleibt im Fachkalender erhalten. Die Festlegung wird nicht auf andere Halbtage verallgemeinert.
- Die GR-Modellannahme bleibt auf den bezeichneten VRG-Kontext vor kantonalen Behörden begrenzt. Daraus folgt keine allgemeine Freigabe zusätzlicher lokaler oder bundesrechtlicher Verfahrenskonstellationen.
- Eigenständige kommunale Feiertagsregelungen bleiben ausgeschlossen. Örtliche Unterschiede aus den erfassten bundesrechtlichen und kantonalen Grundlagen bleiben als solche erhalten.
- Die vollständigen Bezeichnungen DE/FR/IT/RG bleiben Produktbezeichnungen. Provisorische Übersetzungen werden durch die Abnahme nicht zu amtlichen Sprachfassungen und erweitern die Produktsprachen der App nicht.

Die Jahresauswahl der Mappe bleibt 2026–2028. Technische Jahrhunderttests sind keine historische Rechtsgeltungsfreigabe. Die Fachmatrix begründet keine pauschale Fristwirkung aller Feiertagskategorien und keine Freigabe sämtlicher kantonaler Verfahrensprofile.

## 3. Historische Arbeitsstatus und Prüfgegenstand

Die XLSX-Datei, ihre Erzeugungsmodelle und der ursprüngliche [QA-Nachweis](../../outputs/ap18b-05-bedingte-feiertage-2026-09-22/QA-AP18B-05-V0.12.md) bleiben unverändert. Insbesondere die gespeicherten Werte `open`, `blockedScope` und `blockedEffect` sowie frühere Formulierungen zu damals offenen Fachfragen werden nicht rückwirkend umgeschrieben. Sie dokumentieren den Auslieferungsstand, nicht das Ausbleiben der hier festgehaltenen menschlichen Abnahme.

Diese Abnahmenotiz ist zusammen mit der Mappe zu verwenden. Beim Import werden historische Arbeitsstatus, neue Abnahme und spätere Produktzulässigkeit getrennt geführt. Der bereits entschiedene SO-Halbtag darf durch einen älteren offenen Tabellenvermerk weder erneut als ungeklärte Fachfrage noch als ganztägig fristverlängernd behandelt werden.

Die Abnahme behauptet keine zusätzliche native Excel-Bedienprüfung, amtliche Übersetzungskontrolle oder unabhängige zweite menschliche Freigabe. Der technische Prüfumfang bleibt jener des verlinkten QA-Nachweises. Codex ist Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

Der separat dokumentierte Prüfsummenbefund zur historischen lokalen V0.9 wird durch diese Abnahme nicht rückwirkend bereinigt. Der kontrollierte neue Import bindet direkt an die oben bezeichnete V0.12. Historische Byte-Identitätsgates werden nicht abgeschwächt und ein vollständig grüner historischer Gesamtnachweis wird nicht behauptet.

## 4. Beginn von AP18C1 und nächste Abnahmegrenze

[AP18C1](../architektur/import-ap18c.md) beginnt mit dem anhand von Tabellenüberschriften gesteuerten Import der tatsächlichen XLSX-Datei, vollständiger Struktur- und Referenzvalidierung sowie einem eigenständigen, verlustfreien Fachkandidaten. Die Herkunft aus V0.12, die Abnahme und alle verbleibenden Grenzen müssen maschinenlesbar beziehungsweise eindeutig verknüpft erhalten bleiben. Ältere Erzeugungsmodelle ersetzen nicht die gespeicherte Arbeitsmappe als Importquelle.

Der Fachkandidat ist ausdrücklich keine Runtime-Kalenderkomponente, kein freigegebener Datenrelease und keine automatische Produktzuordnung. AP18C ist mit dieser Abnahme weder umgesetzt noch abgeschlossen. Nötige Produktformat- und Consumeränderungen, zusätzliche Verfahrenszuordnungen, Regression, Datenpromotion, Veröffentlichung und E-/Q-/P-Bereitstellung bleiben gesonderte Schritte. App, Produktdaten und Installationen werden durch die Abnahmedokumentation nicht geändert.

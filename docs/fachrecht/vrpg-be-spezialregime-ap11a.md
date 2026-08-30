# VRPG Bern: bekannte Spezialregime

| Merkmal | Wert |
| --- | --- |
| Arbeitspaket | AP11A, GitHub-Issue #28 |
| Eltern-Item | #24 |
| Prüfstand | 30. August 2026 |
| Status | Kandidat zur fachlichen Abnahme |
| Verantwortlich für die Abnahme | David Steimer |
| Maschinenlesbarer Bestand | [`data/candidates/2026-08-30-ap11a-vrpg-be`](../../data/candidates/2026-08-30-ap11a-vrpg-be/README.md) |

## 1. Ergebnis in Kürze

Art. 41 Abs. 3 VRPG ist keine pauschale Verweisung auf eine einzige andere Fristenordnung. Die Bestimmung hält den Vorrang von abweichendem Bundesrecht sowie der Abstimmungs- und Wahlgesetzgebung fest. Welche Frist gilt, wie sie berechnet wird und wodurch sie gewahrt wird, ergibt sich aus der jeweils einschlägigen Spezialnorm.

Das Kandidatenmodell deckt die bekannten, maschinenlesbar fassbaren Muster ab. Von 34 inventarisierten Regimen sind 24 technisch unterstützt, drei bewusst gesperrt und sieben als offen markiert. «Offen» bedeutet nicht «wahrscheinlich richtig». Es bedeutet, dass eine fallbezogene Behördenanordnung, eine zusätzliche Fachrechtsklassifikation oder eine noch nicht unterstützte Fristeinheit nötig ist.

Die beiden Bundesgerichtsurteile 9C_757/2007 E. 3 und 8C_620/2007 E. 3.3 bestätigen, dass Art. 41 Abs. 3 VRPG deklaratorisch ist und keinen eigenen Regelungsgehalt schafft. Die Spezialnorm muss deshalb direkt und nicht über eine schematische VRPG-Verweisung modelliert werden.

## 2. Modellierte Komponenten

### 2.1 Rechenarten

| ID | Rechenart | Beispiel | Technische Bedeutung |
| --- | --- | --- | --- |
| `R1_RELATIVE` | relative Frist | zehn Tage nach Eröffnung oder sieben Monate ab Hinterlegung | gesetzlich feste Tages- oder Monatsdauer oder dynamische Tagesdauer, Anknüpfungsgrenze, Stillstand und Endverschiebung getrennt anwenden |
| `R2_OFFSET` | fester Abstand | 76 Tage vor dem Wahltag | positiver oder negativer Kalendertagsabstand zu einem Ereignis |
| `R3_WEEKDAY` | bestimmter Wochentag | erster Dienstag nach dem ersten Wahlgang | Wochentag, Richtung, Ordinalzahl und strikte Nachfolge explizit festlegen |
| `R4_DUAL` | zwei konkurrierende Anknüpfungen | drei Tage seit Kenntnis, spätestens drei Tage nach Publikation | beide Äste berechnen und gemäss Spezialnorm den früheren oder späteren Termin wählen |
| `R5_FIXED` | behördlich festgelegter Termin | Einreichung gemäss Wahlanordnung | Datum und allenfalls Uhrzeit aus einer autoritativen fallbezogenen Quelle übernehmen |

### 2.2 Fristwahrung

| Profil | Massgebender Vorgang | Typischer Anwendungsfall |
| --- | --- | --- |
| `F0_NA` | keine Parteieingabe | interne Behördenfrist |
| `F1_DISPATCH` | Aufgabe oder Übergabe | allgemeines VRPG, Art. 42 Abs. 2 und 3 |
| `F2_RECEIPT` | Eingang bei der zuständigen Behörde | Wahl- und Abstimmungsrecht mit gesetzlichem Eingangserfordernis |
| `F3_ORIGINAL_1200` | Eingang des Originals bis 12.00 Uhr | die in Art. 66 PRV genannten Wahlfristen |
| `F4_REGISTERED` | eingeschriebene Postaufgabe | Beschwerde nach Art. 77 Abs. 2 BPR |
| `F5_E_RECEIPT` | elektronische Quittung | elektronische Eingabe nach Bundesrecht |

Datum, Uhrzeit und Art der Fristwahrung sind eigenständige Dimensionen. Die Eingabe am letzten Tag kann rechtzeitig sein, wenn die Postaufgabe genügt. Sie kann am selben Tag verspätet sein, wenn das Original um 12.00 Uhr bei der Behörde eingegangen sein muss.

### 2.3 Kalender und Stillstand

Die Kandidaten referenzieren Kalenderprofile über stabile IDs. Sie kopieren keine Feiertage in die Spezialregel. Damit bleibt das Spezialregime vom späteren ewigen Kalender getrennt. Gerichtsferien werden ebenfalls als eigenes Profil zugewiesen. Im Bereich der politischen Rechte ist insbesondere die BGG-Ausnahme vom Fristenstillstand ausdrücklich abgebildet.

## 3. Fachliche Gruppen

| Gruppe | Normen und Beispiele | Behandlung im Kandidaten |
| --- | --- | --- |
| allgemeines VRPG | Art. 41 und 42 VRPG | unterstützt als dynamische Tagesfrist |
| kantonale Wahlvorbereitung | Art. 68, 74, 75, 79, 98, 101, 110, 111 Abs. 1a, 117 und 121 PRG | unterstützt mit Abstand oder Wochentag, fester Termin wird zusätzlich als prüfpflichtig gekennzeichnet |
| Referendum und Initiative | Art. 130 und 147 PRG | unterstützt als relative Eingangsfrist |
| Beschwerden in politischen Rechten | Art. 165 PRG, Art. 67a und 81 VRPG, Art. 77 und 79 BPR | unterstützt, einschliesslich dualer Anknüpfung und Vorbereitungshandlung |
| Weiterzug ans Bundesgericht | Art. 100 Abs. 1, 3 Bst. b und 4 BGG | unterstützt, Stillstandsausnahmen separat modelliert |
| behördlich angeordnete Termine | Art. 16 PRG, Art. 21 BPR und Art. 8a VPR | offen, weil das konkrete Datum aus einer fallbezogenen Anordnung stammt |
| weitere Bundesverfahren | Art. 60 ATSG sowie VwVG | offen, weil zuerst das anwendbare Fach- und Verfahrensrecht feststehen muss |
| Stundenfristen | Art. 8d VPR | gesperrt, da der MVP bisher Tagesfristen unterstützt |

## 4. Querverweise und Sperren

### 4.1 Art. 69 PRG

Art. 66 PRV nennt weiterhin Art. 69 PRG. Art. 69 PRG ist aufgehoben und enthält keine ausführbare Frist. Das Modell führt diese Referenz sichtbar, sperrt aber jede Berechnung. Eine leere Norm wird nicht durch historische Vermutung aufgefüllt.

### 4.2 Art. 111 Abs. 1a PRG

Art. 66 PRV verweist auf Art. 111 Abs. 1 PRG. Die relevante Frist steht nach der Revision in Abs. 1a. Die Gesetzesmaterialien und RRB Nr. 498/2024, Ziffer 6.5.2, belegen die praktische Anwendung mit Donnerstag, 12.00 Uhr und Originaleingang. Das Kandidatenmodell unterstützt die Regel, zeigt den veralteten Querverweis aber zwingend als Warnung.

### 4.3 Dynamische Behördenanordnungen

Wo das Gesetz das konkrete Datum oder die Leerungszeit einer Wahl- oder Abstimmungsanordnung überlässt, darf die App den Termin nicht erfinden. Das Modell verlangt eine autoritative fallbezogene Quelle. Solange diese nicht erfasst und bestätigt ist, bleibt die Berechnung offen.

### 4.4 Vorbereitungshandlungen

Art. 67a Abs. 3 VRPG verlangt eine sofortige Anfechtung, wenn die ordentliche Beschwerdefrist nicht erst nach dem Wahl- oder Abstimmungstag endet. Das Modell bildet dies als Prüfschranke `G1_PREP_ACT` ab. Die Schranke ersetzt die Fristberechnung nicht. Sie bewertet deren Verhältnis zum Urnengang und erzeugt bei Bedarf einen zwingenden Warnhinweis.

## 5. Acht Kandidatenfälle

| Fall | Regelmuster | Erwartung |
| --- | --- | --- |
| T01 | allgemeine relative Frist | 4. September 2026 plus 10 Tage ergibt 14. September 2026 |
| T02 | relative Frist mit Sonntagsende | rechnerisch 6. September, verschoben auf 7. September 2026 |
| T03 | 76 Tage vor dem Wahltag | 12. Januar 2026, Originaleingang bis 12.00 Uhr, manuelle Kontrolle der Wahlanordnung |
| T04 | erster Dienstag nach dem ersten Wahlgang | 31. März 2026, Originaleingang bis 12.00 Uhr |
| T05 | erster Donnerstag nach dem ersten Wahlgang | 2. April 2026, mit Warnung zum veralteten Querverweis |
| T06 | drei Tage seit Kenntnis, spätestens drei Tage nach Publikation | früherer Ast endet am 2. April 2026 |
| T07 | Vorbereitungshandlung | Fristende 20. März liegt vor dem Urnengang am 29. März, daher sofortige Anfechtung |
| T08 | BGG-Stimmrechtssache | rechnerisch 27. Dezember, ohne Stillstand auf 28. Dezember 2026 verschoben |

Alle Fälle sind synthetisch. Sie verwenden keine Namen, Aktenzeichen oder Falldaten aus der privaten Arbeitsmappe oder aus den zitierten Entscheiden.

## 6. Sicherheitsgrenze und Restunsicherheit

Der Katalog ist eine gezielte Inventur der bekannten und für den Berner MVP praktisch relevanten Regeln. Er behauptet keine absolute Vollständigkeit sämtlicher kantonaler und bundesrechtlicher Spezialmaterien. Der angestrebte hohe Abdeckungsgrad wird durch klare Auswahl, sichtbare Parameter, Quellenprüfung und Sperren erreicht, nicht durch eine Scheingenauigkeit von «100 Prozent».

Vor der Umsetzung in AP11B sind insbesondere die sieben offenen Regime fachlich zu priorisieren. Neue oder geänderte Spezialnormen benötigen weiterhin eine amtliche Quelle, einen Prüfstatus und mindestens einen positiven sowie einen negativen oder grenzwertigen Testfall.

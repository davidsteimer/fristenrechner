# AP18B-03: Fachabnahme der Arbeitsmappe V0.9

| Merkmal | Festlegung |
| --- | --- |
| Datum | 13. September 2026 |
| Fachverantwortung und Abnahme | David Steimer |
| Status | Arbeitsmappe in der vorliegenden Form fachlich abgenommen, AP18B-03 abgeschlossen |
| Gegenstand | Gesamte Arbeitsmappe V0.9 mit 192 Regeln und 201 Kalenderzeilen, einschliesslich der Erfassung VS/FR/SO/GE |
| Strukturvertrag | 0.5.0 gemäss DEC-2026-021, unverändert |
| Freigabegrenze | Fachliche Arbeitsgrundlage, keine Datenpromotion oder Betriebsfreigabe |

## 1. Erklärung und gebundene Fassung

David Steimer erklärt im Projektgespräch:

> Ich halte fest, dass der Solothurner Halbtag keinen Einfluss auf den Fristenlauf hat.
> Die Tabelle ist in dieser Form abgenommen.

Die Abnahme betrifft die unveränderte [Arbeitsmappe V0.9](../../outputs/ap18b-03-vs-fr-so-ge-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-03_VS_FR_SO_GE_V0.9.xlsx). Ihre Prüfsumme wurde bei der Dokumentation erneut abgeglichen:

```text
a245080126586f1104b459ff5e225808e2d78578d24a2ce619d7d31d2d27ed12
```

Die gesamte vorgelegte Datei ist als Erfassungs- und Prüfgrundlage abgenommen, nicht nur ihre 76 neuen Regelzeilen. Daraus wird keine gesonderte rückwirkende Produktfreigabe früherer Kantonsprofile abgeleitet.

## 2. Fachliche Festlegung zum Solothurner Halbtag

Der am 1. Mai ab 12.00 Uhr erfasste Solothurner Halbtag hat für die Fristberechnung **keinen Einfluss auf den Fristenlauf**. Das gilt für beide erfassten SO-Geltungsprofile, mit und ohne Bezirk Bucheggberg.

- Die Feiertagsgrundlage führt die Eigenschaft «Ab 12.00 Uhr» weiterhin unverändert mit.
- Aus diesem Halbtag darf weder eine Verlängerung oder Verschiebung des Fristendes noch ein Fristenstillstand erzeugt werden.
- Eine unabhängig bestehende Wirkung von Samstag, Sonntag oder einem anderen anwendbaren Feiertag bleibt unberührt.
- Bei der späteren Integration ist die fehlende Fristwirkung ausdrücklich abzubilden und für Werktags- sowie Wochenendkonstellationen zu testen. Eine pauschale Umdeutung aller Halbtage aller Kantone wird nicht beschlossen.

Damit ist die SO-Halbtags-Teilfrage aus `OF-008` durch den Fachverantwortlichen entschieden. Dies ist eine dokumentierte fachliche Festlegung von David Steimer, keine nachträglich behauptete zusätzliche Quellen- oder Rechtsprechungsprüfung durch Codex. Nicht unterstützte Stundenfristen werden dadurch nicht eingeführt.

## 3. Erhalt des Prüfgegenstands und nächste Grenze

Die XLSX-Datei, die Erzeugungsmodelle und die bisherigen technischen Testergebnisse bleiben unverändert. Die darin gespeicherten Werte `open`, `blockedEffect` und die damals offene SO-Halbtagsfrage bezeichnen den eingefrorenen Auslieferungsstand. Sie bedeuten nicht, dass die hier dokumentierte menschliche Fachabnahme noch aussteht. Diese separate Abnahmenotiz ist zusammen mit der Mappe zu verwenden.

Die vorhandenen provisorischen Übersetzungen und sichtbaren Sprachlücken sind Bestandteil der abgenommenen Form. Sie werden durch die Abnahme nicht zu amtlichen Sprachfassungen. Der [QA-Nachweis](../../outputs/ap18b-03-vs-fr-so-ge-2026-09-13/QA-AP18B-03-V0.9.md) behält seinen ursprünglichen Prüfzeitpunkt und Prüfumfang. Eine neue native Excel-Bedienprüfung oder unabhängige zweite menschliche Prüfung wird nicht behauptet.

Die übrigen noch nicht freigegebenen Verfahrenszuordnungen bleiben gesondert zu klären. `OF-008` insgesamt bleibt offen. Die Erfassung der übrigen 18 Kantone, AP18C mit kontrolliertem Import und Export sowie die spätere Releasefreigabe sind nicht mit dieser Abnahme erledigt oder gestartet. App, Produktdaten, Mirror und E-/Q-/P-Umgebungen bleiben unverändert.

Nachweise: [Erfassungsbericht](../architektur/erfassung-ap18b-03.md), [Quellenpaket FR/SO](quellenpaket-ap18b-03-fr-so.md), [Quellenpaket VS/GE](quellenpaket-ap18b-03-vs-ge.md), [offene Fachfragen](offene-fachfragen.md).

## Nachtrag vom 22. September 2026: Archivbestätigung

Die oben dokumentierte Abnahme und ursprüngliche Prüfsumme bleiben als historischer Nachweis unverändert. Die heute vorhandene V0.9-Datei hat eine abweichende Byteprüfsumme. Ein byteidentisches Original wurde nicht wiedergefunden. David Steimer hat die dokumentierte Archivbestätigung, die Trennung künftiger Arbeitskopien und die Fortsetzung von AP18C ausdrücklich bestätigt. Der [Archivvermerk](archivbestaetigung-ap18.md) führt beide Hashwerte, die festgestellten Übereinstimmungen und die Grenzen des Nachweises auf. Er ersetzt keine ursprünglichen Originalbytes und datiert die heutige Archivkopie nicht auf den Abnahmetag zurück. Für AP18C ist allein die unverändert erhaltene und abgenommene V0.12 massgebend.

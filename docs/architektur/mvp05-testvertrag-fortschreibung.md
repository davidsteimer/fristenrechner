# MVP 0.5 · begrenzte Fortschreibung eines Referenztests

Stand: 28. September 2026. Technische Umsetzung innerhalb der freigegebenen lokalen Releasevorbereitung. Keine Änderung der fachlichen Referenzen, der AP19B-Abnahme oder der Rechenlogik.

## Anlass und enges Delta

Der letzte Test in `tests/governance/ap19b-references.test.mjs` verbot bislang jede Erwähnung des AP19B-Referenzkorpus in einem freigegebenen Manifest. Der neue, gemäss DEC-2026-025 gebundene MVP-0.5-Release muss die zu seinen Freigaben gehörenden Referenzstände aber nachvollziehbar nennen. Eine solche Nachweisreferenz ist kein Import des Referenzkorpus in die Laufzeit.

Der lebende Test erlaubt deshalb ausschliesslich den exakten Pfad und die bereits abgenommene SHA-256 der Suite unter `extensions.steimer.approval.referenceSuites.AP19B-SOCIAL-REFERENCES-1`. Der Import in Produktquellen, das Hauptpaket oder transportierte Laufzeitartefakte bleibt verboten. Alle anderen Vorkommen bleiben ebenfalls verboten. Die übrigen 18 Tests bleiben unverändert.

## Unveränderter historischer Nachweis

Die Datei war noch nicht im Git-HEAD vorhanden. Der ursprüngliche Stand wurde daher aus dem einzigen eben vorgenommenen Testdelta rekonstruiert und vor der Archivierung gegen die in der AP19B-Abnahme dokumentierte SHA-256 geprüft. Die Übereinstimmung ist exakt, nicht bloss semantisch.

| Stand | Datei | SHA-256 |
| --- | --- | --- |
| Abgenommener Originalstand | [Byteidentisches Archiv](../../tests/archive/ap19b-references.accepted-2026-09-25.mjs) | `ac9c85d9877f0e20b7ea95e71ac533b662a5d8d5e10a22382dd3ec753bbc329e` |
| Lebender Release-Grenztest | [Aktuelle Tests](../../tests/governance/ap19b-references.test.mjs) | `529541b7b123e2abd5779c3eb77d0507d4a69376da892d180f829ea8fc4be067` |

Die [historische AP19B-Abnahme](../fachrecht/abnahme-ap19b.md) bleibt unverändert und bezieht sich weiterhin auf den damaligen Originalstand. Maschinenlesbare Fachreferenzen, Referenzprüfer, Migrationsplan und Migrationsprüfer wurden nicht verändert.

## Bestandsschutz und Prüfung

Die alten AP19C-Bestandsschutzskripte werden nicht abgeschwächt. Sie prüfen weiterhin ihre damaligen Pfade und können deshalb die heutige Testfortschreibung am alten Dateipfad beanstanden. Das ist keine Datenabweichung und wird nicht stillschweigend übergangen.

Der [MVP-0.5-Bestandsschutz](../../scripts/check-mvp05-preservation.mjs) prüft ausdrücklich dieselben 68 historischen Nachweise. Nur für diesen einen Test prüft er die akzeptierten Originalbytes im Archiv. Zusätzlich prüft er den exakten aktuellen Testhash als 69. Nachweis. Kein anderer historischer Nachweis entfällt. Die seit AP19C separat historischen Hashes lebender UI-/Core-Dateien bleiben wie zuvor von den unveränderlichen Daten- und Vorlagendateien unterschieden.

Alle 19 AP19B-Referenztests bestehen mit diesem begrenzten Delta. Zusätzlich prüft MVP 0.5 die real freigegebenen Daten gegen alle 77 unveränderten AP19B-Fälle einschliesslich beider AVIG-Anbindungen und gegen die übernommenen AP17-Fälle. Es wird kein Referenzergebnis neu erzeugt oder nachträglich angepasst.

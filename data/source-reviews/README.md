# Quellenprüfungen

Dieser Ordner trennt die fachliche Quellenprüfung von den unveränderlichen Datenreleases. Eine Prüfung mit dem Ergebnis `unchanged` wird vollständig dokumentiert, erzeugt aber keinen künstlichen Datenrelease.

| Artefakt | Zweck |
| --- | --- |
| `source-register.json` | Vollständiges Register der produktiven, unterstützenden und überwachten amtlichen Quellen für CH und BE |
| `events/*.json` | Append-only-Protokoll der einzelnen Prüfereignisse |
| `index.json` | Reproduzierbarer Suchindex mit dem jüngsten Prüfstand und den betroffenen Datenkomponenten |

## Erweiterung für MVP 0.5

David Steimer hat am 28. September 2026 die [zusammengeführte Quellenprüfung und die kontrollierte lokale Übernahme](../../docs/fachrecht/abnahme-quellenpruefung-mvp05.md) ausdrücklich freigegeben. Das Register umfasst jetzt 57 Quellen, davon 41 produktiv verwendete, sieben unterstützende und neun Monitoringquellen. Die bisherigen 42 Registereinträge bleiben inhaltlich identisch. Neu sind die 15 AP19-Quellen.

Das dritte Prüfereignis `2026-09-28-mvp-05-prerelease.1` bindet die 53 Quellen des lokalen Datenreleases `2026-09-28-mvp-05-approved.1`. Es unterscheidet frisch abgerufene Nachweise und am selben Tag wiederverwendete, konkret abgegrenzte Prüfungen. `unchanged` bezieht sich auf den modellierten Fristenumfang, nicht auf das gesamte jeweilige Rechtsgebiet. Die separate Quellenabnahme umfasst zusätzlich die ausdrückliche Wiederverwendung von 82 Katalogquellen aus der abgenommenen Prüfung vom 22. September 2026. Diese werden weder zu frischen Prüfungen noch zu operativen Kantonsfreigaben umetikettiert.

Der [Übernahmenachweis](../../outputs/release-mvp05-2026-09-28/source-governance-adoption.json) bindet Quellenabnahme, Manifest, Register, Ereignis und Index. Die beiden bisherigen Ereignisse bleiben byteidentisch. Der Suchindex löst zusätzlich die Format-5-Verknüpfungen zu nationalen Sozialverfahrensregeln, Berner Anbindungen, Kontextwegen, Kalenderanbindungen und konkreten Datenfreigaben auf.

Die frühere MVP-0.4-Abnahme wird gegen den exakt damaligen, durch ihren ursprünglichen Hash gebundenen Registerstand geprüft. Dieser liegt unverändert unter `outputs/release-mvp05-2026-09-28/approval-inputs/data/source-reviews/`. Die historische Verifikation ist keine Prüfung des heutigen Registers. Dieses wird separat durch den aktuellen AP13-Validator samt Indexableitung geprüft. Auch die historische MVP-0.5-Vorbereitung bleibt mit ihren archivierten damaligen Eingängen reproduzierbar.

OF-001, der bekannte AI-Konflikt und die dokumentierte AVIV-Nachweismethode Option B bleiben bestehen. Der nächste ordentliche Jahrestermin ist unverändert der 15. November 2027. Die lokale Übernahme erlaubt keine Installation, Veröffentlichung oder öffentliche Betriebsaufnahme.

## Erweiterung für MVP 0.4

Am 22. September 2026 wurde das Register lokal auf 42 Quellen erweitert. David Steimer hat den gesamten neuen Quellenprüfstand mit 120 unterschiedlichen Quellen-IDs [ausdrücklich abgenommen](../../docs/fachrecht/abnahme-quellenpruefung-mvp04.md). Das neue Ereignis `2026-09-22-mvp-04-prerelease.1` prüft alle 38 im MVP-0.4-Manifest deklarierten Quellen erneut. Es enthält unverändert 38 Befunde `unchanged` und ist jetzt `approved`. Das Register ist ebenfalls freigegeben, der Index daraus neu erzeugt. Grundlage ist der dokumentierte menschliche Entscheid, keine automatische Fachfreigabe.

34 Quellen sind produktiv verwendet, drei unterstützend und fünf dem Monitoring zugeordnet. Die drei angekündigten Zukunftsfassungen von AHVG, IVG und IVV sind keine bereits angewendeten Normen. Die historische IVöB-Fassung begründet einen gesperrten Altrechtspfad und bleibt unterstützend. Die ursprüngliche AP13-Prüfung ist byteidentisch erhalten.

Der [neue Quellenabgleich](../../docs/fachrecht/quellenabgleich-mvp04.md) trennt diesen operativen Nachweis vom abgeschlossenen zusätzlichen Vollabgleich des Schweizer Feiertagskatalogs. Dessen 84 Quellen gehören zum eigenständigen Katalogvertrag. Zwei davon überschneiden sich mit dem Manifestbestand. Die weiteren 82 sind auf ausdrücklichen Auftrag vor Veröffentlichung ebenfalls erneut geprüft. 81 dieser zusätzlichen Befunde sind unverändert, die bekannte widersprüchliche AI-Jahresliste bleibt sichtbar und wird gemäss bestehendem Entscheid behandelt. Sie werden dadurch nicht zu operativ verwendeten Fristenquellen oder neu freigegebenen Kantonsprofilen.

Die zusätzlichen Evolutionstests prüfen insbesondere Registerwachstum ohne nachträgliche Änderung des Initialereignisses, vollständige neue Prüfereignisse und die Trennung angewendeter Quellen von Zukunftsmonitoring.

Der [gesonderte Abnahmenachweis](../../outputs/release-mvp04-2026-09-22/source-approval.json) bindet die gesamte Vorlage samt Katalogprüfung und AI-Folgemassnahme. Die vorgelegten Berichte und der ursprüngliche Vollständigkeitsnachweis bleiben byteidentisch, auch wenn sie den damaligen Kandidatenstatus ausweisen. Wiederholte Vorbereitung und Konsolidierung prüfen nach dieser Freigabe nur noch die gebundenen Nachweise und schreiben sie nicht zurück. Die Abnahme bewirkt keine Veröffentlichung oder Bereitstellung.

## Initialbestand AP13

| Merkmal | Wert |
| --- | --- |
| Stand | 31. August 2026 |
| Quellen | 25 |
| produktiv verwendet | 21 |
| unterstützende Rechtsprechung | 2 |
| Änderungsmonitoring | 2 |
| Ergebnis | 25-mal `unchanged` |
| offene Weiterverfolgung | `OF-001` zum Inkrafttreten der Wochenend-Zustellungsregel |
| nächster ordentlicher Jahrestermin | spätestens 15. November 2027 |
| Status | fachlich-technisch abgenommen durch David Steimer am 31. August 2026 |

Das initiale Ereignis konsolidiert die am 29. und 30. August 2026 fachlich abgenommenen Prüfungen. Die beiden amtlichen Monitoringquellen zu BBl 2025 2891 wurden am 31. August 2026 gezielt erneut kontrolliert. Das Bundesamt für Justiz führt das Vorhaben weiterhin als laufendes Rechtsetzungsprojekt. Ein Inkrafttretensdatum ist im geprüften amtlichen Dossier nicht ausgewiesen. `OF-001` bleibt deshalb offen und die neue Regel wird nicht vorweggenommen. David Steimer hat AP13 und den initialen Governance-Bestand am 31. August 2026 fachlich-technisch abgenommen.

Das Ereignis nennt den AP12C-Kandidaten als geprüfte Vergleichsbasis. Der daraus am gleichen Tag abgeleitete MVP-0.3-Datenrelease verändert die Fach- und Quellenbezüge nicht. Die Promotion führt deshalb nicht zu einem zweiten inhaltsgleichen Prüfereignis. Das Quellenregister weist MVP 0.2 als Rückfallstand und MVP 0.3 als freigegebenen Zielstand aus.

## Append-only-Regel

Ein publiziertes Ereignis unter `events/` wird nicht inhaltlich überschrieben. Korrekturen, neue Erkenntnisse und spätere Freigaben werden als neues Ereignis mit neuer `reviewEventId` erfasst. Der Index darf neu erzeugt werden, weil er ausschliesslich eine abgeleitete Sicht ist.

Vor der Publikation eines Kandidaten dürfen offensichtliche Dokumentationsfehler noch im Kandidaten korrigiert werden. Mit der Freigabe und Veröffentlichung beginnt die Append-only-Wirkung.

## Index neu erzeugen und prüfen

```bash
npm run build:source-reviews
npm run test:source-reviews
```

Der Validator prüft JSON Schema, vollständige produktive Quellenabdeckung, amtliche Domains, Ergebnis- und Folgemassnahmen, den Termin 15. November sowie die bytegenau reproduzierbare Indexableitung. Acht Negativtests müssen gezielte Manipulationen abweisen.

Der Fristenrechner lädt diesen Ordner nicht zur Laufzeit. Ein SharePoint-Mirror kann ihn als Governance-Nachweis spiegeln, ohne den konfigurierten Releasepfad der App zu verändern.

---
bezugsentscheid: DEC-2026-030
dokumenttyp: beschlussnachweis
titel: "Beschluss zum Datenvertrag der schweizweiten Kalenderaktivierung"
status: beschlossen
entscheidungsdatum: 2026-10-08
klasse: B
entschieden_durch: David Steimer
vorlage: DEC-2026-030-kalenderaktivierung-formatvertrag.md
vorlage_sha256: 519726f943f6ab60999c5da9a433c40d6dd2d7d4b3e4022e68d3a5dda4d21ad4
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-030 Beschlussnachweis

David Steimer hat am 8. Oktober 2026 den AP22B-Daten- und Migrationsplan ausdrücklich bestätigt und sämtliche acht Eckpunkte des vorgelegten Entscheids einzeln aufgeführt. **DEC-2026-030 ist damit beschlossen.** Die Bestätigung nimmt zugleich [AP22B fachlich-technisch ab](../fachrecht/abnahme-ap22b.md).

Der prüfsummengebundene [ursprüngliche Entscheidungsentwurf](DEC-2026-030-kalenderaktivierung-formatvertrag.md) bleibt unverändert. Dieser Nachtrag dokumentiert den aktuellen Status derselben DEC-ID. Er ist weder ein neuer Architekturentscheid noch eine Erweiterung des bestätigten Umfangs.

## Verbindlicher Entscheid

Der [AP22B-Daten- und Migrationsvertrag](../architektur/kalendervertrag-ap22b.md) gilt mit den von David Steimer bestätigten Eckpunkten:

- Feiertagskatalog **2.0.0**, Regelkalender **3.0.0**, Manifest und Mindestconsumer **7.0.0**.
- Rechtsprofile 1.0.0, Spezialregimekatalog 3.0.0 und Sozialverfahrenskatalog 2.0.0 bleiben als Formate unverändert. Sämtliche Kalender eines neuen Format-7-Releases verwenden Format 3.
- 198 Herkunftsentscheidungen werden von 104 terminalen Verfahrensbindungen getrennt. Der konkrete Vorlagenstand bildet daraus 32 Kalenderdefinitionen. Alle 479 bisherigen Katalogregeln bleiben erhalten. Zwölf gesonderte SO-Prozessregeln werden unter `SO-PROCEDURAL-ALL` ergänzt.
- Rollen und regionale Genauigkeit werden ausdrücklich qualifiziert. Kein erster Kalendertreffer, keine freie Vereinigung konkurrierender Listen und kein stiller BE-/CH-Ersatzwert.
- Die vier Januargrenzen werden durch zwei sonst identische vollständige Berechnungen geprüft. Nur die konkret gebundene unsichere Regel wird variiert. Bei unterschiedlichem rechtlichem Ergebnis gibt es weder definitives Fristresultat noch Kalenderexport. GR-/NE-Vorbehalte bleiben davon getrennte berechenbare Grenzen.
- Neue Kalenderabdeckung **29.08.2026 bis offen**, zusätzlich begrenzt durch die je Tag anwendbaren Normen, Gebietsstände, Profilgrenzen und Releasefreigaben. Kein unbegrenzter Rechtsbeständigkeitsnachweis. Die Sozialfreigaben bleiben auf 2026–2027 beschränkt.
- Neue Releasebindungen des Sozialkatalogs trotz unveränderter 44 Fachregeln und 50 BE-Anbindungen. Keine ausserbernische Sozialfreigabe, kein zusätzliches kantonales Verwaltungsverfahren.
- Historische Formate und AP5-Pins bleiben erhalten. Defaults werden auf Version 4 ohne erfundene Fallfakten migriert. Provider-/Cachefallback wird an die tatsächliche Datenkonfiguration gebunden.

Optionen, Begründung, Auswirkungen und Rückabwicklungsgrundsätze ergeben sich aus der unveränderten Vorlage. DEC-2026-028/029 bleiben als fachliche Grundlage bestehen. Die bisherigen Formatverträge gelten weiter für ihre historischen Ausprägungen. Es wird kein alter Entscheid rückwirkend umgeschrieben.

## Nachweis und Erhaltung

Die eingereichte DEC-Vorlage hat SHA-256 `519726f943f6ab60999c5da9a433c40d6dd2d7d4b3e4022e68d3a5dda4d21ad4`. Der Vertragsentwurf ist mit `bf682c5dbdc57593b7355749405d9a6f9a4a08d6c12502d6f315df5c4e336b73` gebunden. Das [QA-Protokoll](../../outputs/ap22b-vertrag-2026-10-08/QA-AP22B.json) hat SHA-256 `7ec00a65114a25b5fe074ffd991cf3b3e2807920411e029372d2a0ba1da00d4a` und bindet die 13 vorgelegten Dokument-, Schema-, Struktur- und Prüfdateien. Sämtliche Dateibindungen und beide Testlog-Prüfsummen wurden bei dieser Nachführung bestätigt.

Die historischen Statusangaben «vorgeschlagen» und `contractApproved: false` in diesen Dateien bleiben erhalten. Für den aktuellen Entscheidungsstatus sind dieser Beschlussnachweis, die Abnahmenotiz und das nachgeführte Entscheidungsregister massgebend. Die 44 damaligen Tests wurden nicht erneut ausgeführt. Der Beschluss behauptet keine bereits bestandene neue Produktintegration.

## Folgearbeiten und Freigabegrenzen

Die Grundlage für **AP22C1** ist bestätigt. Dieses Umsetzungspaket ist durch die reine Abnahme- und Beschlussnachführung noch nicht gestartet. Die anschliessenden Implementierungsnachweise und Teilpaketabnahmen bleiben erforderlich.

Keine Produktaktivierung, Datenpromotion, neue App-Version, Quellenreleasefreigabe, Veröffentlichung, E-/Q-/P-Bereitstellung, Mirror- oder Berechtigungsänderung. Die periodische Quellenprüfung und bestehenden fachlichen Vorbehalte bleiben verbindlich. GitHub-Nachführung und Publikation erfolgen nicht durch diesen lokalen Beschlussnachtrag.

## Verantwortlichkeit

David Steimer hat den Entscheid in Personalunion getroffen. Codex dokumentiert ihn als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

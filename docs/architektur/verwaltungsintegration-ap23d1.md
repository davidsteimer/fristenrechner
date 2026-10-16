# AP23D1 Reader und Rechenkern für kantonale Verwaltungsverfahren

Stand: 14. Oktober 2026. Lokale Umsetzung zur technischen Teilpaketabnahme. Grundlage sind die [AP23C-Abnahme](../fachrecht/abnahme-ap23c.md) und der [Beschluss DEC-2026-032](../entscheidungen/DEC-2026-032-beschluss.md).

## Ergebnis

Die neuen TI-/GR-Wege werden durch den tatsächlichen TypeScript-Rechenkern berechnet. Ein eigener Format-8-Reader prüft das vollständige Datenbündel, bevor er einen unveränderlichen qualifizierten Kontext ausstellt. Die neue Verfahrensqualifikation und die historischen Profile verwenden dieselbe Tageszählung. Die fünf Altprofile werden nicht als Hilfsprofile für kantonale Verfahren umgedeutet.

Die Umsetzung ist noch nicht an die Benutzeroberfläche oder Datenprovider angeschlossen. Die installierte App bleibt unverändert. Es gibt keinen neuen freigegebenen Rechtsdatenrelease und kein gebautes Auslieferungspaket.

## Technischer Umfang

| Baustein | Umgesetzt |
| --- | --- |
| Katalog 1 | Geschlossene Typen und Schema, eindeutige Quellen/Identitäten, zulässige Stufen und Fristarten, gültige Perioden, Zeitgrenzen und vollständige Einzelpfadbindungen |
| Manifest 8 | Genau 41 Datendateien, vollständiges Inventar, tatsächliche UTF-8-Länge und SHA-256 je Datei, Rollen-/Schema-/ID-Konsistenz und Quellenmenge |
| Freigabe | Getrennte freigegebene und lokale Referenzreader, Übereinstimmung von Vertrags-, Kalender-, Sozial- und Kantonalbindungen |
| Unveränderlichkeit | Private Identitätsprüfung statt serialisierbarem Freigabeflag, tief eingefrorene Objekte und gekapselte nur lesbare Artefaktansicht |
| Kantonalresolver | Erlass, Pfad, Revision, Stufe, zuständiger Behördensitz, aktuelle Fallqualifikation und Dauer werden bei jedem Aufruf neu geprüft |
| Kalender | Echte Calendar-3-Erzeugung der gebundenen TI-/GR-Projektionen und des vererbten Bundeskalenders, eigene rechtliche Verwendung statt übernommener Bundesprofilberechtigung |
| Stillstände | Eigene Katalogperioden mit inklusiven Grenzen und Jahreswechsel, ausdrückliche GR-Dringlichkeitsverfügung nur im qualifizierten Gerichtskontext |
| Gemeinsame Arithmetik | Folgetag, Stillstand, gezählte Tage und Endverschiebung in einer gemeinsamen Implementierung für neue und bisherige Verfahren |
| Sperren | Unbekannte Wege und Ausnahmen, fehlende Qualifikation, unzulässige Dauer, Zeitgrenzen und TI-O2 ohne definitives Enddatum |
| Herkunft | Erlass, Pfad, Revision, Stufe, Release, Kalenderbindung, Behördensitz und Quellen, ohne erfundene `profileId` |

Ein Kalenderoverride, eine gefälschte Objektkopie oder ein blosses `approved`-Flag kann keinen qualifizierten Kontext ersetzen. Anwendbares Bundes-/Sozialrecht wird nicht mit dem allgemeinen Kantonalweg berechnet. Es benötigt seinen eigenen freigegebenen Zweig.

Der D1-Eingabevertrag qualifiziert den Kanton, noch keine unterkantonalen Gebiete. Deshalb werden regionale Feiertagsvarianten bereits beim Einlesen zurückgewiesen, solange die erforderlichen Gebietsfakten nicht modelliert sind. Auch eine stillschweigende Wahl einer kantonalen Basisliste trotz regionaler Alternativen ist gesperrt. Die Geltung der tatsächlich gebundenen Gebiete muss das gesamte Berechnungsfenster abdecken. TI und GR bleiben innerhalb ihres bestätigten Modells berechenbar. Damit werden weitere Kantone nicht versehentlich allein durch eine neue Datenzeile freigeschaltet.

## Drei wichtige Wirkungen

**TI-O1:** Partei- oder Vertreterorte werden für den allgemeinen TI-Weg nicht benötigt. Massgebend ist der qualifizierte Sitz der zuständigen kantonalen Stelle. Die eigene Feiertagsbindung verwendet nicht die bisherige Freigabe eines Bundesprofils.

**TI-O2:** Führt die Endverschiebung in einen neu beginnenden anwendbaren Stillstand, enthält das gesperrte Ergebnis den letzten gezählten Tag, Verschiebungsgründe und die betroffene Periode. Ein definitives Fristdatum und eine Exportberechtigung fehlen. Ohne anwendbaren Stillstand wirkt diese Sperre nicht.

**Zeitfenster:** Zustellung, jeder gezählte und übersprungene Tag sowie jeder Endverschiebungstag werden gegen die anwendbaren Grenzen geprüft. Der erste Tag nach einem Stillstand zählt bereits, auch ein Sonntag. Historische Referenzfälle vor dem bestätigten Beginn 29.08.2026 werden nicht durch eine nachträgliche Erweiterung freigeschaltet.

## Prüfungen und Nachweise

Der [reproduzierbare Gesamtnachweis](../../outputs/ap23d1-2026-10-14/QA-AP23D1.json) bindet die tatsächlichen Artefakte und Testprotokolle. Die Tests laufen mit der Projekttoolchain **Node 22.23.2**.

- Neue Katalog-, Reader-, Resolver- und Arithmetiktests prüfen positive Fälle und gezielte Manipulationen. Darunter tatsächliche TI-/GR-Referenzrechnungen im freigegebenen Zeitfenster, alle zwölf Pfadgruppen mit ihren Stufen und zusätzliche GR-Kontraste für 2027.
- **1’584 Differenzvergleiche** prüfen vollständige historische Resultate und Rechenspuren gegen den bytegebundenen bisherigen Rechenquellstand. Dazu gehören Stillstandsgrenzen, Jahreswechsel, kurze und lange Fristen sowie gesperrte Fälle.
- Die vollständige bestehende Produktregression prüft die bisherigen Kern- und UI-Verträge einschliesslich historischer Releases. TypeScript-Prüfung und lokale Pfad-/Integritätskontrollen ergänzen die Tests.
- Alle elf Artefakte der AP23C-Vorlage und ihr QA-Bericht bleiben byteidentisch. Freigegebene Rechtsdaten, alte Schemas, Provider, UI und SPFx-Dateien werden nicht geändert.

Die Differenzprüfung hat vor Abschluss einen verlorenen Regelnachweis in einem gesperrten Altfallszenario entdeckt. Die Regelzuordnung ist korrigiert. Die endgültige Prüfung verlangt Gleichheit einschliesslich dieser Rechenspur, nicht bloss dass beide Ergebnisse gesperrt sind.

Die zusätzliche Gegenprüfung hat ausserdem eine fehlende Sperre für künftige regionale Bindungen aufgedeckt. Nach dem beschriebenen Schutz bestehen die positiven TI-/GR-Fälle weiter. Neu versiegelte AI-/NE-Gegenproben ohne Gebietsfakten und ein nicht gedeckter Gebietsstand werden abgewiesen.

Synthetische Freigabeformen werden ausschliesslich im Testspeicher verwendet. Sie prüfen das technische Zusammenspiel von Bytes und Bindungen, ersetzen aber keine menschliche Quellen- oder Releasefreigabe. Lokale Referenzkontexte erzeugen ausdrücklich keine Exportberechtigung. Die Herkunftsdaten für den späteren Export sind vorbereitet, ein neuer ICS-Export wird in AP23D1 nicht angebunden.

## Nachfolgende Teilpakete

| Abschnitt | Noch auszuführen |
| --- | --- |
| AP23D2 | Kontrollierte TI-/GR-Datenkandidaten, sichtbare DE-/FR-Auswahl, Defaults 5, Rechenspur und Anbindung der neuen Herkunft an den Kalenderexport |
| AP23D3 | Gemeinsame Format-8-Hostauswahl einschliesslich der fünf Altprofile, Provider-/Cacheintegration, Synchronisation der SPFx-Produktkopien, Web-/SPFx-Build und Gesamtprüfung |
| Releasevollzug | Quellenabnahme, gebundene definitive Daten und Pakete, Rückfallweg, freigegebene E/Q-Tests, reale Geräte-/Gastprüfung und manuelle Abnahme, danach separat GitHub/P |

Der historische `calculateDeadline`-Einstieg weist Format 8 ausdrücklich zurück. AP23D1 besitzt einen eigenen qualifizierten Kantonalaufruf, aber noch keinen allgemeinen Format-8-Hostadapter für die fünf Bestandsprofile. Dessen spätere Integration darf Format 8 nicht als Format 7 oder als Berner Profil ausgeben.

AP23D1 ist zur Abnahme vorgelegt. AP23D2 und AP23D3 sind nicht gestartet. Codex bereitet vor und prüft als Arbeitsinstrument. David Steimer entscheidet und nimmt ab.

## Reproduktion

```sh
node scripts/check-ap23d1.mjs --write
```

Voraussetzung ist die Projekttoolchain Node 22 samt vorhandenen Abhängigkeiten. Die historische Differenzprüfung verwendet den bereits vorhandenen Git-Commit `a1aca59aa7cb333cac085278db93b18ce3038eec` als unveränderliche Quellreferenz. Der Prüflauf verändert keine Releases und schreibt ausschliesslich seine lokalen Nachweise unter `outputs/ap23d1-2026-10-14`.

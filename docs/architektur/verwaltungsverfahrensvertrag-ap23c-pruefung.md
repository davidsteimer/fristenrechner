# AP23C Prüfbericht zur Vertrags- und Migrationsvorlage

Stand: 14. Oktober 2026. **Isolierte lokale Vertragsprüfung bestanden. Zur technischen Abnahme vorgelegt, nicht produktiv integriert.**

## Gegenstand und Grenzen

Geprüft wurden der [AP23C-Vertragsentwurf](verwaltungsverfahrensvertrag-ap23c.md), seine zwei Kandidatenschemas, die konkrete TI-/GR-Modellprobe und eine separate Defaults-Migrationsprobe. [AP23B ist mit Ergänzung abgenommen](../fachrecht/abnahme-ap23b.md). DEC-2026-031 ist beschlossen. [DEC-2026-032](../entscheidungen/DEC-2026-032-kantonale-verwaltungsverfahren-datenvertrag.md) bleibt vorgeschlagen.

Die Tests importieren keinen neuen produktiven Resolver und schalten keine Verfahren frei. Es gibt keinen Format-8-Release, keinen Paketbuild, keine Installation und keinen GitHub-Push. Der Prüfbericht ist weder eine neue vollständige Quellenprüfung noch ein Nachweis bereits bestandener Produkt-, Browser- oder Hosttests.

Die Vertragsprobe enthält zwei Erlasse, zwölf Pfadgruppen, vier Stillstandsprofile, zwei Feiertagsbindungen und elf Quellen. Nidwalden bleibt Kontrastprobe. Das Hauptschema ist für weitere Kantone mit gleicher modellierter Semantik offen. Die konkrete Probe und ihre Freigabemenge bleiben auf TI/GR begrenzt.

## Tatsächlich ausgeführte Prüfungen

| Prüfung | Umfang | Ergebnis |
| --- | ---: | --- |
| JSON-Schema-Proben | 20 | Erwartete gültige und ungültige Formen korrekt unterschieden, auch generische gesetzliche 20-Tage-Form ohne Pfadfreigabe |
| Negative Vertragsmutationen | 11 | Unter anderem doppelte Pfade, falsche Stufe, fremder Stillstand, unbekannte Quelle, fehlende TI-Sperre, veränderte gesetzliche Pilotdauer und erfundener NW-Weg zurückgewiesen |
| Negative Eingabeproben | 18 | Unqualifizierte Wege, Spezialrechtsfälle, unklare Ausnahmen, unzulässige Dauer und Eingriffe in die Kalenderwahl gesperrt |
| Negative Freigabebindungen | 6 | Fehlende Einzelpfadbindung, veraltete Definitions-/Komponentenhashes, falscher Prüfnachweis, zurückgezogener Pfad und konsistent manipulierte Komponentenrollen erkannt |
| Negative Manifestinventare | 5 | Fehlende oder doppelte Artefakte, nicht kanonischer Pfad und nicht gelisteter Kalender erkannt |
| Positive Qualifikationspläne | 4 | TI-Basis, identischer TI-Plan trotz ausserkantonaler Partei/Vertretung sowie qualifizierte GR-Anordnungen |
| Zusätzliche Dauergrenzen | 2 | Fehlende angeordnete Tageszahl und 366 Tage gesperrt |
| Tagesabdeckung und TI-O2-Sperre | 4 | Neuer TI-Stillstand und Zeitgrenzen gesperrt, TI-Weg ohne Stillstand davon nicht betroffen |
| Defaults-Migrationsgruppen | 15 | Getrennter v5-Schlüssel, rein lesende Altübernahme, keine erfundenen Falltatsachen, Reset- und Speicherschutz |
| Historische AP23B-Referenzen | 33 Fälle und 14 negative Mutationen | Unveränderter historischer Checker erneut bestanden |
| Erhaltene Bestandsdateien | 18 | SHA-256 unverändert, einschliesslich der sechs ausdrücklich gebundenen AP23B-Dateien |

Die positive TI-Ortsprobe liefert denselben **Qualifikationsplan**, kein bereits produktiv berechnetes Fristdatum. Die TI-O2-Probe prüft gezielt den Schutz des relevanten Tages. Die vollständige Fristzählung mit dieser neuen Bindung folgt erst in AP23D.

Eine separate lesende KI-Gegenkontrolle führte vor Abschluss zu zwei Vertragskorrekturen. Die gesetzliche Tageszahl ist im generischen Schema nicht mehr auf die drei Pilotwerte beschränkt. Die konkreten TI-/GR-Werte bleiben durch die semantische Herkunftsprüfung fest gebunden. Zudem wird die richtige Komponentenrolle nun unabhängig von der blossen Gleichheit zwischen Release- und Pfadreferenzen geprüft. Beide Korrekturen besitzen eigene neue Negativproben. Diese Gegenkontrolle ist keine formelle menschliche Zweitfreigabe.

Die Schema-Prüfung erzeugt vorübergehend synthetische bestätigte und zurückgezogene Formen im Arbeitsspeicher. Diese prüfen die Form des Freigabevertrags. Sie sind ausdrücklich keine tatsächlichen Entscheide, werden nicht als Release gespeichert und gelangen nicht in eine Runtime. Die gespeicherte Vertragsprobe bleibt `proposed` und `candidate`, mit leerer Zielreleasebindung und ohne Freigabenachweis.

Der alte AP23B-Checker enthält absichtlich noch die frühere TI-Ortsbeschränkung. Sein erneuter Erfolg ist ausschliesslich ein historischer Reproduktionsnachweis. Die neue Behördensitzregel wird getrennt durch DEC-2026-031 und die neue Vertragsprobe belegt. Keine rückwirkende Umschreibung des alten Orakels.

## Migrationsbefunde

Die Defaults-Probe verwendet ausschliesslich einen Speicher im Arbeitsspeicher und repräsentative Legacywerte. Sie belegt die vorgeschlagene Trennung der Schlüssel und das Verhalten der Modellmigration, nicht die vollständige Migration aller heutigen UI-Selektoren.

- Gültige alte Werte werden nur bei fehlendem v5-Schlüssel rein lesend übernommen. TI-/GR-Behördenkanton allein erzeugt keinen neuen Verwaltungsweg.
- Auswahl und gespeicherte Revision müssen bekannt sein. Kein erster Pfad wird als Ersatz ausgewählt.
- Datum, tatsächliche Gebietszugehörigkeit, Dringlichkeitsverfügung und Spezialrechts-/Fallbestätigungen werden nicht gespeichert oder erfunden.
- Ein erfolgreicher Reset schreibt einen Marker. Alte Vorgaben leben beim nächsten Start nicht wieder auf.
- Beschädigte und unbekannte künftige v5-Inhalte bleiben geschützt. Kein automatisches Überschreiben, kein Alt-Fallback und keine gewöhnliche Reset-Löschung.
- Ohne verfügbaren Speicher bleibt die Sitzung arbeitsfähig. Ein gescheiterter Schreibzugriff ist aber kein dauerhafter Migrations- oder Resetnachweis.
- Ein historischer Host kann den alten Schlüssel weiter verwenden, ohne den neuen v5-Zustand zu verändern.

## Noch auszuführende Produktprüfung

Diese Matrix gehört zu AP23D. Sie ist **nicht** durch die obigen Modellproben erledigt.

| Bereich | Erforderlicher Produktnachweis |
| --- | --- |
| Reader und Freigabe | Formate 1–7 und AP5 unverändert lesen, Format 8 streng validieren, unvollständige oder manipulierte Bytes und Freigaben zurückweisen |
| TI/GR-Rechnung | Sämtliche abgenommenen Fachreferenzen mit dem echten Rechenkern ausführen, TI-Ortsfälle ergänzen, TI-O2 ohne Enddatum/Export erhalten |
| Bestandsregression | Fünf Altprofile, 104 Bundesbindungen, regionale Grenzen, 44 Sozialregeln und 50 BE-Anbindungen erhalten, Sozialfälle ausserhalb 2026–2027 weiterhin sperren |
| Kalender und Stufen | Je Pfad korrekte eigene Bindung, kein Bundesprofil als verdeckter Ersatz, keine NW-Aktivierung, korrekte GR-Gerichts-/Verwaltungsunterscheidung |
| Defaults und UI | Tatsächliche Versionen 1–4 und sämtliche relevanten Selektoren migrieren, Speicherfehler sichtbar behandeln, keine Fallbestätigung wiederherstellen |
| Rechenspur und Export | Eindeutige Erlass-/Pfad-/Revisionsherkunft in Resultat und ICS, keine BE-Ersatzbezeichnung, sofortige Invalidierung nach relevanter Änderung |
| Provider und Cache | Vollständige Rohbytes an tatsächliche Konfiguration binden, falschen Mirror/Altcache ablehnen, verspätete Antworten nach Konfigurationswechsel verwerfen |
| Hosts und Build | Root-/SPFx-Kopien synchronisieren, unterstützte Produkttoolchain verwenden, Web/SPFx und DE/FR prüfen, historischen AP5-Pin erhalten |
| Releasevollzug | Quellenübernahme, gebundene Artefakte und Rückfall, technische E/Q-Matrix sowie gesonderte reale Geräte-, Gast- und manuelle Abnahme |

## Reproduzierbarkeit und Ablage

Der [Gesamtnachweis QA-AP23C.json](../../outputs/ap23c-vertrag-2026-10-14/QA-AP23C.json) enthält die tatsächlichen Laufumgebungen, Prüfzahlen, Bestandsprüfsummen und SHA-256-Werte der Vorlagendateien. Der Gesamtlauf prüft ausserdem lokale Dokumentlinks und den unveränderten getrackten Produktbestand. Die neuen ungetrackten Kandidatenschemas werden dabei ausdrücklich als Vorschlagsartefakte ausgewiesen.

Verwendet wurden der gebündelte Node 24.19.0 und das lokale Python mit `jsonschema`. Das ist kein Node-22-Produktbuild und kein Hostintegrationsnachweis.

```sh
node scripts/check-ap23c-readiness.mjs --write
```

Voraussetzungen sind ein verfügbares Node und das bestehende `.venv/bin/python` mit `jsonschema`. Die beiden Teilproben schreiben selbst keine Dateien. Der Gesamtlauf erzeugt ausschliesslich den bezeichneten lokalen QA-Bericht. Historische AP23A-/AP23B-Nachweise bleiben erhalten.

Prüfverantwortung und technische Vorbereitung: Codex als Arbeitsinstrument. Fachliche und technische Abnahme sowie allfällige Releasefreigabe: David Steimer. Keine formelle unabhängige Zweitfreigabe wird behauptet.

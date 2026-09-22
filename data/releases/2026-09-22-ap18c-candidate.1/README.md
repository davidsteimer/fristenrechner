# AP18C-Integrationskandidat

Stand: 22. September 2026. **Lokaler Datenkandidat, keine Release- oder Betriebsfreigabe.**

Dieser unveränderliche Kandidat setzt den beschlossenen Produktvertrag [DEC-2026-023](../../../docs/entscheidungen/DEC-2026-023-schweizweiter-feiertagskatalog.md) um. Er ergänzt den unveränderten AP17C-Datenbestand um den schweizweiten Feiertagskatalog und dessen ausdrücklich begrenzte operative CH-/BE-Projektion.

## Herkunft und Bestand

- Arbeitsmappe V0.12, SHA-256 `d4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65`
- Prüfgebundener [AP18C1-Import](../../candidates/2026-09-22-ap18c-workbook/README.md), SHA-256 `9553f483678bc5f209099703588402a7dd65cf4d9aac8a00aadb6f9dbe966099`
- Alle sieben normalisierten Bestände unverändert übernommen: 27 Gemeinwesen, 49 Geltungsbereiche, 84 Quellen, 479 Regeln, 95 Gebietszuordnungen, 92 nicht ausführbare Verfahrensbezüge und 90 Quellenprüfungen
- 29 ausdrückliche Verknüpfungen zwischen Normquelle und abweichendem Gebietsbeleg
- Vier Bezeichnungssprachen DE, FR, IT und Rumantsch Grischun, mit sämtlichen vorhandenen Hinweisen auf provisorische Übersetzungen
- Die Rohzellen, Formeln und Jahresvorschauen bleiben im Importnachweis. Sie werden nicht als Laufzeitballast mitgeliefert.

Der Feiertagskatalog ist 837 359 Bytes gross. Sein SHA-256 lautet `b53f9ed3dec29c8bb479b3840a801f3056531374cbb84611b377d7a01e93d1b7`.

## Vertrag und operative Grenze

Das Manifest und der Mindestconsumer verwenden Format `4.0.0`. Der neue Feiertagskatalog verwendet Format `1.0.0`, die operativen Kalender weiterhin `2.0.0`, die Rechtsprofile `1.0.0` und der AP17-Spezialregimekatalog `3.0.0`.

Die zwölf ausdrücklich genannten CH-/BE-Feiertagsregeln werden aus dem neuen Katalog abgeleitet. Der Build und der Consumer vergleichen diese vollständig mit den ausgelieferten operativen Kalendern. Erst nach nachgewiesener Feldidentität übernimmt der Build deren bisherige JSON-Serialisierung byteidentisch. Damit bleiben Kalender- und Regel-IDs, Labels, Quellen, Ergebnisse und Rechenspuren unverändert. Auch die drei Gerichtsferienregeln und `ch-court-holidays` bleiben unverändert.

Die übrigen Feiertagsregeln werden vollständig validiert, aber nicht als zusätzliche Fristenkalender aktiviert. Es gibt keine weiteren auswählbaren Kantone, keine neue Kalender-App und keine zusätzlichen VRPG-Verbindungen. Arbeitsrechtliche Feiertage, Halbtage und territoriale Zuordnungen erhalten keine pauschale Fristwirkung. Die dokumentierten Grenzen für SO, GR, NE und eigenständiges kommunales Recht bleiben bestehen.

`sourceSummary` im Manifest beschreibt weiterhin nur die operativen Quellen des AP17C-Ausgangsstands. Die einzelnen Prüfstatus, offenen historischen Hinweise und nachträglichen Festlegungen im Feiertagskatalog bleiben getrennt erhalten. Der Manifeststatus erklärt weder alle Katalogquellen pauschal für geprüft noch alle Übersetzungen für amtlich.

## Reproduzierbarkeit und Vorschau

```sh
npm run build:data:ap18c:release
npm run preview:ui
```

Im ausgegebenen lokalen Vorschau-Link ausdrücklich `?candidate=ap18c` ergänzen. Ohne Kandidatenparameter bleibt die Vorschau beim freigegebenen MVP-0.3-Datenstand.

```sh
npm run build:public:ap18c
```

Dieser gesonderte Webbuild schreibt ausschliesslich nach `.work/public-ap18c`. Das Buildmanifest weist ihn als `candidate` und `deployable: false` aus. Der normale öffentliche Einstieg, SPFx, angeheftete Datenquellen, SharePoint-Mirror und steimer.ch werden dadurch nicht verändert.

Der Builder prüft die ursprünglichen Manifest- und Artefakthashes, die aktuelle Referenzkopie V0.12, den Import und die Abnahme. Wiederholungen bestätigen identische Ausgaben. Bereits vorhandene, abweichende Kandidatendateien werden nicht überschrieben. Der maschinenlesbare [Buildnachweis](../../../outputs/ap18c-product-2026-09-22/build-verification.json) ausserhalb des distributierbaren Releases enthält Zählwerte, Prüfsummen und den vollständigen Vergleich der 1 437 Regeldatierungen für 2026–2028.

Eine Veröffentlichung, Releasepromotion oder Installation bedarf eines separaten kontrollierten Schritts. Eine erfolgreiche technische Prüfung ersetzt keine menschliche Abnahme.

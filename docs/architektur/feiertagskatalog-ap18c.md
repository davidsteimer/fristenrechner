# AP18C: Feiertagskatalog und Produktintegration

Stand: 22. September 2026. **AP18C ist durch David Steimer abgenommen.** Die [Abnahmenotiz](../fachrecht/abnahme-ap18c.md) dokumentiert den Nutzerentscheid und den Start der [MVP-0.4-Releasevorbereitung](../betrieb/deployment-mvp-04.md). Der nachstehend beschriebene Kandidat bleibt als unveränderlicher Implementierungsnachweis erhalten. Veröffentlichung und Bereitstellung sind noch nicht erfolgt.

## Auftrag und Ergebnis

David Steimer hat [DEC-2026-023](../entscheidungen/DEC-2026-023-schweizweiter-feiertagskatalog.md) beschlossen und die Umsetzung beauftragt. AP18C führt den unveränderten [AP17C-Bestand](vrpg-integration-ap17c.md) und die abgenommene schweizweite Feiertagsgrundlage in einem gemeinsamen Kandidaten zusammen.

Der neue [Datenkandidat `2026-09-22-ap18c-candidate.1`](../../data/releases/2026-09-22-ap18c-candidate.1/README.md) enthält neun manifestierte Artefakte. Die bisherigen acht AP17C-Dateien bleiben byteidentisch. Hinzu kommt der Feiertagskatalog mit allen 479 Regeln. Der Katalog ist keine pauschale Freischaltung neuer Fristenkalender.

| Bestandteil | Vertrag und Umfang |
| --- | --- |
| Manifest und Mindestconsumer | `4.0.0`, genau ein verpflichtender `holidayCatalog` |
| Feiertagskatalog | `1.0.0`, ID `ch-holiday-catalog`, 837 359 Bytes |
| Operative Kalender | Unverändert `2.0.0`, nur `ch-federal-calendar` und `be-public-holidays` |
| Rechtsprofile | Unverändert `1.0.0`, StPO, ZPO, BGG, VwVG und VRPG-BE |
| Spezialregime | Unverändert AP17C-Komponente `3.0.0` |
| Quellenzusammenfassung | Weiterhin die 38 operativen AP17-Quellen, keine pauschale Freigabe aller 84 Katalogquellen |
| Oberfläche | Weiterhin DE/FR, bestehende Felder und Berechnungspfade, zusätzlich klare Kandidatenkennzeichnung |

## Herkunft und Ableitung

Die Verarbeitung erfolgt in drei getrennten Stufen:

1. Die schreibgeschützte, hash-gebundene V0.12-Archivkopie wird durch den [AP18C1-Importer](import-ap18c.md) tatsächlich gelesen. Die bearbeitbare Arbeitskopie ist kein Importpfad.
2. Der neue Builder `scripts/build-ap18c-release.mjs` übernimmt sämtliche normalisierten Fachentitäten aus dem geprüften Import. Gemeinwesen, Geltungsbereiche, Quellen, Regeln, Gebietszuordnungen, Verfahrenshinweise, Quellenprüfungen und die 29 zusätzlichen Gebietsquellenverknüpfungen bleiben erhalten. Auch die vier Sprachen und die Hinweise auf provisorische Übersetzungen bleiben erhalten.
3. Aus den zwölf ausdrücklich zugelassenen CH-/BE-Katalogregeln werden die operativen Feiertagsregeln abgeleitet. Der vollständige Feldvergleich mit den bisherigen Kalendern muss gelingen. Erst danach übernimmt der Builder deren bestehende JSON-Serialisierung byteidentisch. Der Consumer wiederholt die Projektionsprüfung beim Laden.

Die Rohzellen, Formeln und Jahresvorschauen verbleiben im rund 7,9 MB grossen Importnachweis. Der Laufzeitkatalog ist rund 0,84 MB gross. Die Grössenreduktion entfernt keine normalisierte Fachentität oder fachliche Einschränkung. Quellenfundstellen, Herkunft, Gültigkeit, historische Arbeitsstatus und nachträgliche Festlegungen bleiben getrennt nachvollziehbar.

Der [Buildnachweis](../../outputs/ap18c-product-2026-09-22/build-verification.json) dokumentiert Eingangs- und Ausgangshashes, Bestandszahlen, die acht unveränderten Artefakte und 1 437 Datierungsvergleiche für 2026–2028. Bestehende abweichende Ausgaben werden nicht überschrieben. Ein erneuter Build bestätigt identische Bytes.

Die [Archivbestätigung](../fachrecht/archivbestaetigung-ap18.md) bleibt unverändert. Die ursprüngliche Byteidentität von V0.9 und V0.10 ist nicht nachgewiesen. Der grüne Import- und Integrationsnachweis bezieht sich auf die byteidentische, abgenommene V0.12.

## Gemeinsamer Rechenkern und Consumer

`src/core/holidayCatalog.ts` stellt Katalogprüfung, Datumsermittlung und operative Projektion bereit. Unterstützt werden ausschliesslich die vier beschlossenen Datumsarten und die vier geschlossenen Kalenderbedingungen. Ein Ergebnis ist ein Datum, ein regelkonformer Ausfall oder ein Datum ausserhalb der Gültigkeit. Ungültige Eingaben sind Fehler.

Die geografische Mitgliedschaftsabfrage berücksichtigt gültige Ein- und Ausschlüsse. Sie ist keine prozessuale Anwendungsfreigabe. Aus Gebietshierarchien, Kantonskürzeln oder den 92 lesbaren Verfahrenshinweisen werden keine zusätzlichen Fristenprofile abgeleitet.

Der Browser prüft das eingebundene Katalogschema mit einem ausdrücklich begrenzten Schema-Interpreter. Nicht unterstützte Schema-Schlüssel und Patterns werden beim Laden des Schemas abgewiesen. Die verwendeten Patterns sind statische Regex-Literale. SPFx prüft zusätzlich mit AJV. Das unabhängige Python-Prüfwerkzeug verwendet `jsonschema` und eigene semantische Gegenprüfungen.

Alle drei Pfade prüfen insbesondere:

- Unbekannte Felder, Rollen und Versionen sowie doppelte oder unaufgelöste IDs.
- Gültige Datumsparameter, Bedingungen, Kategorien und Tagesumfänge.
- Gebietsebenen, Elternbezüge, Zyklen, Kantonsgrenzen und zeitlich gedeckte Ein-/Ausschlüsse.
- Vollständige Gebietsquellenverknüpfungen und gegenstandsbezogene historische Freigaben.
- Genau die bisherigen fünf Rechtsprofile und den bestätigten AP17-Spezialkatalog.
- Die zwölf unveränderten Feiertagsregeln sowie die drei unveränderten Gerichtsferienregeln, Kalendervererbung und Kalendergültigkeit. Zusätzliche oder abweichende operative Regeln und Overrides sind unzulässig.

SPFx führt die vollständige Core-Vorprüfung vor Aktivierung und Speicherung aus. Fehler verwerfen den gesamten neuen Stand. Ein bereits vollständig verifizierter Stand bleibt als Rückfallstand erhalten. Einzelne Artefakte werden nicht aus verschiedenen Releases gemischt.

Öffentlicher Feed, SharePoint-Mirror und manueller Import verwenden weiterhin dieselben manifestrelativen Pfade und Bytes. Die zusätzliche Katalogdatei gehört zwingend zum vollständigen Release. Eine spätere Mirror-Aktualisierung darf deshalb nicht nur das Manifest oder einzelne Kalender austauschen. Ältere Consumer unterstützen Format 4 nicht. Vor dem Umschalten einer Datenquelle muss der neue Consumer bereitstehen.

## Fachliche Grenzen

Alle 479 Regeln sind im Fachkatalog integriert und technisch validiert. Nur die zwölf bestehenden CH-/BE-Feiertagsregeln beeinflussen den Rechner. Insbesondere bleiben bestehen:

- SO: Halbtag am 1. Mai ohne Fristwirkung.
- GR: Bestätigter Kontext kantonaler Behörden nach Art. 1 VRG, keine Freigabe kommunaler Verfahren.
- NE: Vorbehalt zusätzlicher regionaler Einzelfestlegungen und gesonderter Schliesstage.
- Bundes- und kantonales Recht als Grundlage, eigenständiges kommunales Feiertagsrecht ausgeschlossen.
- IT und Rumantsch Grischun im Fachbestand, noch keine zusätzlichen App-Sprachen.
- Keine neuen Kantone in der Fristenauswahl, keine weiteren AP17-Zuordnungen, keine Kalender-App oder Karte.

## Lokale Prüfung und Vorschau

Der [Prüfnachweis](../../outputs/ap18c-product-2026-09-22/QA-AP18C.md) enthält die konkreten Testzahlen, Hashes, Browserbefunde und Grenzen. Wiederholung aus dem Projektverzeichnis mit der vorhandenen Node-22-Toolchain und Python-Umgebung:

```sh
npm run build:data:ap18c:release
npm run typecheck
npm test
npm run test:public
npm run test:calendar-models
npm run test:archive:ap18
npm run test:ap18c
npm run test:data:ap18c
npm run test:data:ap18c:contracts
npm run build:public:ap18c
npm run preview:ui
```

Den vom Vorschau-Server ausgegebenen Link um `?candidate=ap18c` ergänzen, um diesen historischen Kandidaten zu öffnen. Mit Beginn der MVP-0.4-Releasevorbereitung verwendet der normale lokale Einstieg den neuen abgeleiteten Datenrelease. Der gesonderte AP18C-Kandidatenbuild bleibt unter `.work/public-ap18c` und trägt weiterhin `deployable: false`.

Die lokale SPFx-Implementierung ist gebaut und getestet, aber nicht neu paketiert. Das bestehende `.sppkg` bleibt unverändert. Produktive Datenpins, Mirror, Teams, SharePoint und steimer.ch wurden nicht aktualisiert.

## Nächster Freigabeschritt

David Steimer hat die lokale AP18C-Implementierung abgenommen und den Releaseschritt gestartet. Der aktuelle [MVP-0.4-Releaseplan](../betrieb/deployment-mvp-04.md) hält Datenpromotion, Paketbau, Quellenabgleich und die noch erforderlichen Veröffentlichungs- und Bereitstellungsschritte fest. Die Fachabnahmen und DEC-2026-023 ersetzen die Prüfung in den tatsächlichen Zielumgebungen nicht.

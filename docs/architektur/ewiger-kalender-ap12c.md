# AP12C: Format-3-Integration des ewigen Kalenders

Stand: 31. August 2026

Status: am 31. August 2026 durch David Steimer fachlich-technisch abgenommen
Grundlage: AP12A, AP12B, DEC-2026-015 und GitHub-Issue #26

## 1. Ergebnis

AP12C integriert die in AP12A abgenommenen Regelkalender und den in AP12B abgenommenen Generator in die vollständige Produktkette. Der neue Datenkandidat `2026-08-31-ap12c-candidate.1` verwendet das Manifestformat `3.0.0`, die Kalenderkomponente `2.0.0` und eine nach oben offene Releaseabdeckung.

Die Kalender werden nicht mehr als vorab erzeugte Listen einzelner Feiertage und Gerichtsferien geladen. Der Rechenkern erzeugt für jede konkrete Berechnung einen begrenzten Arbeitskalender aus versionierten Regeln. Preview, SharePoint und Teams verwenden denselben hostneutralen Generator.

AP12C verändert den produktiven Stand noch nicht. Insbesondere bleiben unverändert:

- der freigegebene Datenrelease `2026-08-31-mvp-02-approved.1`
- der öffentliche Datenfeed
- der SharePoint-Mirror
- das produktiv angeheftete Release
- das SPFx-Paket `0.2.0.0`
- die Installationen in SharePoint und Teams

Der Format-3-Bestand ist ein Kandidat. Der normale Release-Service weist seinen Status `candidate` weiterhin ab.

## 2. Datenfluss

```text
Format-3-Manifest
  -> Schema-, Pfad-, Grössen- und Prüfsummenprüfung
  -> Referenz- und Gültigkeitsprüfung aller Artefakte
  -> Kalenderregeln der Komponente 2.0.0
  -> hostneutraler AP12B-Generator
  -> begrenzter Arbeitskalender für die konkrete Berechnung
  -> allgemeiner oder spezieller Fristenrechner
  -> Resultat mit Regel- und Quellenbezug
```

Die Providergrenze bleibt unverändert. GitHub, SharePoint-Mirror und manueller Import liefern dieselben Bytes. Die Format-3-Logik beginnt erst nach dem Laden des Manifests und wird in allen Hosts gleich ausgeführt.

## 3. Manifestformat 3.0.0

Das Release-Schema unterstützt neu die Hauptversion `3.0.0`. Sie ist absichtlich nicht rückwärtskompatibel zu einem Consumer, der nur endliche Kalenderlisten kennt.

Für Format 3 gelten folgende verbindliche Eigenschaften:

- `minimumConsumerFormatVersion` ist `3.0.0`
- die Releaseabdeckung besitzt ein Anfangsdatum und `to: null`
- Kalenderartefakte verwenden `calendar-rules-v2.schema.json`
- die Kalenderkomponente trägt die Version `2.0.0`
- Spezialregimekataloge bleiben Bestandteil des Manifestvertrags
- die alte Kalenderkomponente `calendar.schema.json` ist für Format 3 unzulässig

Format 1 und Format 2 bleiben unverändert validierbar und berechenbar. Ihre endliche Abdeckung muss weiterhin ein konkretes Enddatum enthalten. Eine offene Abdeckung wird dort abgewiesen.

## 4. Datenmigration

Der Kandidat wird reproduzierbar aus dem freigegebenen MVP-0.2-Release gebaut. Dabei werden:

1. die zwei in AP12A abgenommenen Regelkalender byteidentisch übernommen
2. die fünf Rechtsprofile und der VRPG-BE-Spezialregimekatalog übernommen
3. alle neun Referenzen auf `ch-court-holidays-2026-2028` atomar auf `ch-court-holidays` migriert
4. Manifest, Dateigrössen und SHA-256-Prüfsummen neu erzeugt
5. der Status ausdrücklich auf `candidate` belassen

Der Migrationsvalidator bestätigt im Kandidaten null alte und neun neue Stillstandssatz-Referenzen. Er vergleicht beide Kalenderartefakte zusätzlich bytegenau mit dem abgenommenen AP12A-Ausgangsbestand.

Der Build ist mit folgendem Befehl reproduzierbar:

```bash
npm run build:data:ap12c:candidate
```

## 5. Dynamische Kalendererzeugung

Der Datenadapter erkennt die Manifest-Hauptversion. Bei Format 3 hält er die Regelkalender als typisierte Komponenten vor. Vor einer Berechnung bestimmt der Kern aus allen relevanten Eingabedaten einen endlichen Arbeitsbereich.

Dieser Bereich umfasst standardmässig:

- 370 Tage vor dem frühesten relevanten Eingabedatum
- 730 Tage nach dem spätesten relevanten Eingabedatum

Die Rückschau deckt namentlich jahresübergreifende Gerichtsferien und vorangehende Anker ab. Die Vorausschau deckt die im MVP unterstützten Tages-, Monats- und Spezialfristen samt Stillständen und Endverschiebungen ab. Der Generator klemmt den Bereich zusätzlich an die fachliche Gültigkeit des ausgewählten Regelkalenders.

Die offene Releaseabdeckung ist kein unbeschränkter Speicher- oder Rechenauftrag. Für jede Berechnung wird nur der benötigte Bereich erzeugt. Reicht er wegen einer später erweiterten Rechenart nicht aus, blockiert der Kern. Er fällt weder auf alte Jahreslisten zurück noch liefert er ein scheinbar plausibles Teilergebnis.

## 6. Rechenspur und Benutzeroberfläche

Ist eine Feiertags- oder Stillstandsregel für das Resultat relevant, enthält die Rechenspur neu:

- die Datenrelease-ID
- die Kalender-ID
- die Kalenderregel-ID
- allfällige Override-IDs
- die amtlichen Quellen-IDs und Fundstellen

Damit lässt sich nicht nur erkennen, dass ein Datum verschoben oder ein Fristenstillstand angewandt wurde. Es bleibt auch sichtbar, welche versionierte Kalenderregel dies ausgelöst hat.

Die zweisprachige Oberfläche kennt sämtliche stabilen Fehlerklassen des Generators auf Deutsch und Französisch. Die Datenstatuszeile kann eine nach oben offene Abdeckung verständlich darstellen. Die Preview verwendet den Format-3-Kandidaten, damit dieselbe Benutzeroberfläche vor einer Freigabe lokal geprüft werden kann.

## 7. SPFx-Consumer und Kandidatensperre

Der SPFx-Validator unterstützt die Manifestformate 1, 2 und 3. Für Format 3 prüft er zusätzlich:

- die Schemata der Regelkalender
- offene Release- und Kalendergültigkeiten
- Vererbung und Regelauflösung
- alle Stillstandssatz-Referenzen aus Rechtsprofilen und Spezialregimen
- die vollständige Abwesenheit der alten ID `ch-court-holidays-2026-2028`
- eine repräsentative Kalendererzeugung für 2026 bis 2028

Ein Test lädt den Kandidaten mit einer ausschliesslich im Test erzeugten Kopie des Manifests, deren Status auf `approved` gesetzt wird. Dies beweist die vollständige Consumerkette, ohne die produktive Kandidatensperre zu umgehen. Im Laufzeitcode bleibt `candidate` nicht aktivierbar.

Die SPFx-Synchronisation übernimmt das neue Schema und denselben Produktkern. Es wurde noch kein neues `.sppkg` gebaut, kein Release-Pin geändert und keine Tenantinstallation ausgeführt.

## 8. Testnachweis

Der lokale Gesamtlauf ist bestanden:

| Prüfung | Ergebnis |
| --- | --- |
| Root-TypeScript und UI | 153 von 153 Tests bestanden |
| SPFx-Consumer | 16 von 16 Tests bestanden |
| Format-3-Releasevalidator | Kandidat gültig, 9 gezielte Negativmutationen abgewiesen |
| AP12C-Migrationsvalidator | 2 Kalender, 15 Regeln, 0 alte und 9 neue Stillstandssatz-Referenzen |
| Format-2-Regression | MVP-0.2-Release samt Negativtests weiterhin gültig |
| Format-1-Regression | AP5-Referenzrelease samt 6 Negativtests weiterhin gültig |
| Unabhängiges AP12A-Orakel | 36 Referenzfälle, 7 Negativtests und Parität 2026 bis 2028 bestanden |
| UI-Build | Preview mit Format-3-Kandidat erfolgreich gebaut |

Die sechs neuen Kernfälle für AP12C prüfen insbesondere:

- einen eidgenössischen Feiertag im Jahr 2027 mit Endverschiebung und Quellenbezug
- den ZPO-Osterstillstand mit sichtbarer Kalenderregel
- eine Berechnung im Schaltjahr 2400 ohne künstliche Jahresobergrenze
- ein VRPG-BE-Spezialregime mit BGG-Stillstand und migrierter Satz-ID
- die offene Format-3-Abdeckung
- die vollständige Entfernung der alten Stillstandssatz-ID

Der Python-Validator bleibt ein vom TypeScript-Produktkern getrenntes Prüforakel. Die bestehende Format-2-Regression stellt sicher, dass AP12C ältere freigegebene Datenstände nicht semantisch umdeutet.

Ausführung:

```bash
npm run check
npm run test:data:ap12c
cd spfx
npm test
```

## 9. Abnahme und Aktivierungsgrenze

David Steimer hat AP12C am 31. August 2026 fachlich-technisch abgenommen. Die Abnahme umfasst:

- die Format-3-Sicherheitsgrenze
- die atomare Migration auf `ch-court-holidays`
- die dynamische Erzeugung statt jährlicher Datumstabellen
- die Rechenspur mit Release-, Regel- und Quellenbezug
- die unveränderte Berechenbarkeit der bisherigen MVP-Fälle

Die Abnahme des Arbeitspakets verändert den Status des Datenkandidaten nicht. Erst nach einer ausdrücklichen Aktivierungsfreigabe dürfen in einem eigenen Schritt:

1. der Kandidat kontrolliert zu einem freigegebenen Datenrelease hochgestuft werden
2. der öffentliche Feed und der SharePoint-Mirror aktualisiert werden
3. der Release-Pin und die Paketversion nachgeführt werden
4. ein definitives SPFx-Paket gebaut werden
5. die SharePoint- und Teams-Testmatrix ausgeführt werden

Diese Schritte sind nicht Teil des vorliegenden Kandidatenstands und wurden nicht vorweggenommen.

### 9.1 Nachgelagerte Releasefreigabe

David Steimer hat am 31. August 2026 die Finalisierung von Release 2 beauftragt und den vollständigen Funktionsumfang als abgedeckt bezeichnet. Der Kandidat wurde daraufhin reproduzierbar zum freigegebenen Datenrelease `2026-08-31-mvp-03-approved.1` hochgestuft. Dieser Schritt verändert den vorliegenden Kandidatenordner nicht. Er führt die Prüfmetadaten der fünf Rechtsprofile und des Spezialregimekatalogs auf `verified` nach und berechnet sämtliche Manifestprüfsummen neu.

Der öffentliche Feed, der SharePoint-Mirror und die Tenantinstallationen werden erst nach dem auf diesen Release gepinnten Paketbuild aktualisiert. Bis dahin bleibt MVP 0.2 der installierte Rückfallstand.

## 10. Standards und Verantwortlichkeit

Das Format verwendet JSON Schema Draft 2020-12 und ISO-Kalenderdaten. Ein spezifischer eCH-Standard für den fachlichen Austausch verfahrensrechtlicher Feiertags- und Gerichtsferienregeln ist im Projekt nicht festgelegt. Die Abweichung ist deshalb keine Abweichung von einem passenden eCH-Fachstandard, sondern eine bewusst providerneutrale projektspezifische Schnittstelle.

Codex hat AP12C implementiert und technisch geprüft. David Steimer hat das Arbeitspaket und den daraus abgeleiteten MVP-0.3-Datenrelease am 31. August 2026 fachlich-technisch abgenommen. Die betriebliche Freigabe des SPFx-Pakets bleibt von der Datenfreigabe getrennt. Codex übernimmt keine formelle Freigabe- oder Haftungsverantwortung.

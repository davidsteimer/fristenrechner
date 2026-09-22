# AP18B-04: Fachliche Durchsicht und vollständige Sprachbezeichnungen

Stand: 13. September 2026. Verantwortlich für die fachliche Beurteilung: David Steimer. Codex ist Arbeitsinstrument für Erfassung, Übersetzung und Prüfung.

## Rückmeldung und Auftrag

David Steimer hat die Gesamtmappe V0.10 fachlich durchgesehen und mitgeteilt, dass er keine Fehler finden kann. Er beauftragt anschliessend die Ergänzung der noch fehlenden Übersetzungen, ausdrücklich auch ohne amtliche Sprachquellen.

Die Rückmeldung wird als fachliche Durchsicht ohne Beanstandung dokumentiert. Daraus werden weder eine Klärung der fünf ausdrücklich offenen Kalenderfragen noch neue Rechtswirkungen, Datenpromotion oder Betriebsfreigaben abgeleitet. Bestehende technische Prüf- und Exportstatus bleiben unverändert. Eine zusätzliche Sprachabnahme durch eine unabhängige Übersetzungsperson wird nicht behauptet.

Gebundene Ausgangsfassung ist die unveränderte V0.10 mit SHA-256 `bba15a8f6e7b6956662d00bb1b7efb51903ad19aa2b2d1dc29c42a7fd9361e4e`. Die Ergänzung wird als neue V0.11 gespeichert. Die frühere V0.9 und die ursprüngliche V0.10 bleiben erhalten.

## Sprachumfang

| Bereich | Ergänzte leere Sprachfelder |
| --- | ---: |
| Gemeinwesen | 6 |
| Räumliche und sachliche Geltungsbereiche | 39 |
| Gebietszuordnungen | 84 |
| Feiertagsregeln | 186 |
| **Gesamt** | **315** |

Die Formeln des Feiertagskalenders übernehmen die ergänzten Namen in 204 bisher als «Noch zu erfassen» ausgewiesene Sprachfelder. Es werden keine Regelzeilen, Gebiete oder Feiertage hinzugefügt. Alle dafür vorgesehenen Sprachspalten sind anschliessend befüllt. Die deutsche Projektdokumentation, Rechtsquellentitel und Fachhinweise werden nicht insgesamt in vier Sprachen übersetzt.

## Übersetzungsregeln und Herkunft

1. Bereits vorhandene Bezeichnungen bleiben unverändert. Für denselben deutschen Feiertagsnamen wird zuerst die bereits in der Gesamtmappe verwendete Übersetzung übernommen.
2. «2. Januar» bleibt «2 gennaio» beziehungsweise «2 da schaner». Ein gemeinsamer technischer Datumsschlüssel führt nicht zur Umbenennung in Berchtoldstag.
3. Fehlt ein vorhandener Sprachwert, wird eine redaktionelle Produktübersetzung verwendet. Dafür wird keine amtliche Quelle erfunden. Die neuen Ergänzungen sind als provisorisch gekennzeichnet.
4. Ortsnamen bleiben erhalten. Übersetzt werden Bezeichnungen wie Gemeinde, Bezirk und die sachliche Gebietsbeschreibung. Französische Elision wird berücksichtigt.
5. Die Rheinfelder Gemeindegruppen bleiben in allen Sprachen vollständig aufgezählt. Historische Kurzbeschreibungen im älteren Erfassungsmodell ersetzen diese ausdrücklich gewünschte Darstellung nicht.
6. Die Kennzeichnung steht in der Übersicht der Mappe. Ein technischer Sprachbeleg ordnet jede Ergänzung über stabile Zeilen-ID, Sprachcode und konkrete Zelle zu. Amtliche Rechtsquellen und nichtamtliche Produkttexte bleiben unterscheidbar.

### Beispiele neu formulierter Bezeichnungen

| Deutsch | Italienisch | Rumantsch Grischun |
| --- | --- | --- |
| Genfer Bettag | Digiuno ginevrino | Di da la rogaziun da Genevra |
| Wiederherstellung der Republik | Restaurazione della Repubblica | Restauraziun da la Republica |
| Bund | Confederazione | Confederaziun |
| Bern | Berna | Berna |
| Aargau | Argovia | Argovia |

Es handelt sich bei diesen Ergänzungen um verwendbare Produktbezeichnungen, nicht um eine Festlegung amtlicher Gesetzesterminologie. Provisorisch bedeutet hier sprachlich noch nicht unabhängig abgenommen, nicht eine zusätzliche Unsicherheit der bereits erfassten Datumsregel.

## Unveränderte fachliche Grenze

Die fünf bekannten Fragen zum bedingten Stephanstag in AR und AI, zur Näfelser Fahrt in GL sowie zu Ersatz- und zusätzlichen Schliesstagen in NE bleiben im [Erfassungsbericht](../architektur/erfassung-ap18b-04.md#fünf-abgegrenzte-prüffragen) dokumentiert. Die Sprachergänzung verändert weder diese Fragen noch die SO-Festlegung oder die GR-Modellgrenze. Arbeitsmappenvertrag 0.5.0 und App-Sprachen bleiben unverändert.

Historische Sprachlücken in eingefrorenen Modellvorstufen werden nicht rückwirkend geändert. Massgeblich für diese Lieferung sind die sichtbaren Sprachfelder der gespeicherten Gesamtmappe. Ein späterer kontrollierter Import muss den freigegebenen sprachlichen Arbeitsstand berücksichtigen, nicht einen überholten Vorstufenbestand.

## Lieferung und Prüfung

- [Arbeitsmappe V0.11](../../outputs/ap18b-04-restkantone-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.11.xlsx)
- [Prüfbericht zur Sprachergänzung](../../outputs/ap18b-04-restkantone-2026-09-13/QA-AP18B-04-V0.11.md)

Die Prüfung der gespeicherten Zielkopie ist abgeschlossen. Keine leeren vorgesehenen Sprachfelder, unveränderte Formeln und Datumswerte, erhaltene native Excel-Funktionen und 52 visuell geprüfte Ansichten ohne Befund. 356 Modelltests und der unabhängige Dateivergleich sind bestanden. Der [Prüfbericht](../../outputs/ap18b-04-restkantone-2026-09-13/QA-AP18B-04-V0.11.md) enthält die Details und die finale Prüfsumme. Keine GitHub-Veröffentlichung, kein Produktdatenexport und keine Bereitstellung sind Teil dieses Auftrags.

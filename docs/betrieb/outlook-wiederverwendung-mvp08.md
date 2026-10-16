# MVP 0.8 · Vorschlag zur Wiederverwendung der Outlook-Nachweise

Stand: 15. Oktober 2026. **Begründeter Vorschlag, noch nicht abgenommen.** Die lokalen Nachweise sind nun an die definitiven Paketdateien gebunden. Zwei echte Browserdownloads und zwei Exporte aus dem tatsächlichen SPFx-Paket mit simulierter Downloadgrenze sind separat geprüft. Dieser Bericht ist weder ein neuer Outlook-Importnachweis noch eine E-/Q- oder Betriebsfreigabe.

## Vorbeleg und unveränderter Terminvertrag

Der [Outlook-Nachweis MVP 0.5](outlook-pruefung-mvp05.md) dokumentiert einen tatsächlichen Outlook-Webimport samt Kontrolle und anschliessender Löschung des Testtermins. Die damalige Desktop-Prüfung bleibt Davids manueller Nachweis mit dessen ursprünglicher Detailtiefe. Die [MVP-0.7-Bewertung](outlook-wiederverwendung-mvp07.md) und alle historischen Belege bleiben unverändert.

Zur Wiederverwendung vorgeschlagen wird ausschliesslich der bisherige Importvertrag: ganztägiger Termin, exklusiver Folgetag als Ende, freie Verfügbarkeit, Kategorie `Fristablauf`, relative Erinnerung `-PT112H`, lokaler ICS-Download ohne Teilnehmende oder Einladung.

## Was sich tatsächlich geändert hat

`calendarExport.ts` ist **nicht bytegleich** mit MVP 0.7. Der unabhängige Vergleich bestätigt genau die Ergänzung eines optionalen `descriptionAppendix` und dessen Aufnahme in die weiterhin maskierte und gefaltete `DESCRIPTION`. Nach Rücknahme allein dieser Ergänzung sind die alten Serializerbytes vollständig identisch. Die Datumshilfe, der extrahierte Download-Kachelblock und die 18 Kalendertextzeilen DE/FR stimmen unverändert überein.

Neu ist `administrativeExport.ts`. Dieser Adapter bindet Eingaben, Ergebnis und Datenkontext, berechnet vor dem Export nochmals und ergänzt die Herkunftsangaben zu Verfahren und Rechtsdaten. Alte Outlookimporte belegen diese neue Freigabe- und Berechnungslogik **nicht**. Dafür stehen aktuelle lokale Tests, später die separaten Hostnachweise.

## Lokaler Quellen- und Vorabnachweis

**21 von 21 Tests bestanden**, keine ausgelassenen Tests: acht Serializer-/Downloadtests und dreizehn Tests der administrativen Oberfläche und Exportfreigabe. Dazu gehören Maskierung, UTF-8-Zeilenfaltung sowie die Sperre kopierter, veralteter oder nicht passend gebundener Ergebnisse.

Drei aus tatsächlichem minifiziertem Code in JSDOM erzeugte und lokal gespeicherte ICS-Dateien wurden archiviert und geprüft: StPO DE für 28.09.2026 sowie TI DE/FR für 02.11.2026, jeweils mit exklusivem Folgetag. Die Downloadgrenze war simuliert, es handelt sich nicht um echte Browserdownloads.

Alle drei erfüllen den bezeichneten Terminvertrag, CRLF, UTF-8-Faltung, UID und Erstellungszeit. Sie enthalten keine unerwarteten Teilnehmenden, Anlagen oder Wiederholungen. Diese Dateien entstanden **vor der Bindung an das definitive Webartefakt**, nicht in einer realen Browsersitzung, nicht auf M365 und nicht durch einen Outlookimport.

Der [maschinenlesbare lokale Vergleich](../../outputs/release-mvp08-2026-10-15/outlook-reuse-assessment-v2.json) bindet Quellen, Testprotokoll und tatsächliche ICS-Dateien mit Bytezahlen und Prüfsummen. Er berichtigt ausdrücklich die zu weit gehende Downloadbezeichnung im ersten, unverändert erhaltenen Vergleich. Die folgenden definitiven Nachweise sind ein separater Zusatz und deuten diese JSDOM-Belege nicht nachträglich um.

## Ergänzung: definitive Artefakte und gespeicherte Exporte

Der [abschliessende lokale Zusatzbericht](../../outputs/release-mvp08-2026-10-15/outlook-final-artifact-supplement.json) bindet den Quellenvergleich an die archivierten tatsächlichen Baueingänge, das Paket `0.8.0.0` und das definitive Web-ZIP. Beide verwenden Datenrelease `2026-10-15-mvp-08-approved.1`.

| Artefakt | SHA-256 |
| --- | --- |
| SPFx `fristenrechner-schweiz-0.8.0.0.sppkg` | `d3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a` |
| Web `fristenrechner-mvp08-steimer-web.zip` | `0abbc23d691835e5b04b64975140afb36c4bfa89482ff872c0c76188673f4176` |

Der [Browsernachweis](../../outputs/release-mvp08-2026-10-15/browser-evidence/verification-1792091283775.json) bestätigt echte DE-/FR-Downloads aus dem lokal ausgelieferten definitiven Webbuild mit Chromium/Chrome `155.0.8059.79` im Headless-Betrieb. Alle zwölf ausgelieferten Dateien stimmen mit dem Web-ZIP überein. Es gab keine externen Requests oder Seitenfehler. Nach geänderter Eingabe wurde der veraltete Export entfernt, der TI-O2-Sperrfall bot keinen Export an.

Die zwei weiteren Dateien stammen aus den gebundenen `built-tests` des tatsächlichen minifizierten AMD-Bundles im SPFx-Paket. Paket- und Bundleprüfsummen, Testdiagnostik und gespeicherte Originalbytes stimmen überein. **DOM und Downloadgrenze dieser Pakettests sind simuliert**, es ist kein SharePoint- oder Teams-Hostnachweis.

| Nachweis | DE | FR | Grenze |
| --- | ---: | ---: | --- |
| Echter lokaler Chromium-Download | 2’164 Bytes | 2’208 Bytes | Kein öffentlicher P-Host, kein M365 |
| Tatsächliches SPFx-AMD-Bundle | 2’114 Bytes | 2’158 Bytes | Simulierter DOM und Download |

Alle vier Dateien enthalten den 02.11.2026 mit exklusivem Ende 03.11.2026, freie Verfügbarkeit, Kategorie `Fristablauf`, `-PT112H` und die erwarteten TI-Herkunftsangaben. Titel, UID, Erstellungszeit, UTF-8/CRLF und 75-Oktett-Faltung sind geprüft. Unerwartete Eigenschaften, etwa Teilnehmende, Anlagen oder Wiederholungen, fehlen. Der Zusatzbericht bindet jede Datei einzeln. Seine SHA-256 lautet `91c281872265198d322e84b57d3fc8efa22b6c42d0e46edacdf670b102d327bc`.

## Vorschlag und noch offene Grenzen

Gestützt auf den Quellenvergleich und die nun gebundenen lokalen Artefakt-/Exportnachweise ist die begrenzte Wiederverwendung der bisherigen Outlook-Importnachweise für die unveränderten Terminfelder technisch vertretbar. **Der entsprechende Entscheid für MVP 0.8 bleibt ausdrücklich bei David und ist noch offen.** Ein neuer Kompatibilitätsbefund verlangt eine erneute Bewertung.

Es gibt keinen neuen Nachweis zur tatsächlichen Erinnerungszustellung, zu Sommerzeitwechseln oder zu aktuellen Outlookversionen. Der Kategoriename erzwingt keine dunkelgrüne Farbe. Die französische Exportdatei ist kein Nachweis einer französischen Outlook-Oberfläche. Die Darstellung der erweiterten Beschreibung in Outlook ist nicht durch alte Importe belegt. Neue administrative Herkunftsangaben, fachliche Berechnung und Exportfreigaben bleiben gesonderte Prüfumfänge. E-/Q-Host-, Geräte- und Gastprüfungen werden nicht vorweggenommen. Keine Mailbox wurde verändert, kein Termin importiert und keine bestehende Abnahme erweitert.

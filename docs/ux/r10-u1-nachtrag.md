# R10-U1 – Bestandsschutz- und Darstellungsnachtrag

Fassung 1.0, 28. Oktober 2026.

**Status: lokal umgesetzt und zur menschlichen Abnahme vorgelegt. Keine Release-, Installations- oder Betriebsfreigabe.** David Steimer beauftragte den begrenzten Nachtrag mit «Bitte setze den Nachtrag als nächstes um.». Die [M3-Abnahme](../fachrecht/abnahme-ap23m3.md) und ihr damaliger Fehlerbeleg bleiben unverändert archiviert.

## 1. Drei eng begrenzte Korrekturen

| Befund | Korrektur | Bewusst unverändert |
| --- | --- | --- |
| **R10-H01: Sozialrechtsauswahl fehlt in Format 17** | Die vorhandene Sozialoberfläche erkennt nun zusätzlich Format `17.0.0`. Alle elf bisherigen Erlasse sind wieder auswählbar. Keine neue Soziallogik und keine zweite Kopie von Fachregeln | 44 Sozialregeln, 50 Berner Anbindungen, Beschränkung auf Bern und das bisherige Zeitfenster 2026–2027. Aktuelle Fallfakten bleiben erforderlich |
| **T06-H01: Datenquellenzeile im SPFx-Rahmen wird schmal abgeschnitten** | Eigene Rahmenzeile verwendet korrekte Boxberechnung, darf umbrechen und lässt lange Quellenbezeichnungen innerhalb der verfügbaren Breite umbrechen | Wrapper-TSX, eigentliche Rechnerfelder, gemeinsames Produkt-CSS und zweispaltiges Rechnerlayout. Der bisherige bilinguale Quellenhinweis bleibt erhalten |
| **B11-H01: Unzutreffender Diagnosetext bei frühem Abbruch** | Fehlt eine Ergebnisherkunft, wird der frühe Abbruch ausdrücklich erklärt. Keine leeren Herkunftslisten als angewendete Regeln und kein Versprechen vollständiger Nachweise. Besteht tatsächlich eine Herkunft, bleiben deren Angaben und echte Auflösungsdiagnosen erhalten | Sperrgründe, Empfangsgrenzen, Fristresultate, Herkunftsdaten, Fachqualifikationen und Exportbedingungen |

Der neue Hinweis lautet auf Deutsch: «Die Berechnung wurde frühzeitig angehalten. Eine Ergebnisherkunft wurde noch nicht aufgebaut. Beachten Sie den oben genannten Sperrgrund.» Die französische Darstellung hat denselben Aussagegehalt. Ein Empfang ausserhalb des gedeckten Zeitraums bleibt gesperrt, er wird nicht durch die Textkorrektur berechenbar.

## 2. Technischer Änderungsrahmen und Bestandsschutz

Die Produktänderung umfasst genau vier bestehende Quellen: drei UI-Dateien und das eigene SPFx-Rahmenstylesheet. Hinzu kommen die drei daraus bytegleich erzeugten SPFx-UI-Kopien. Zwei technische Build-Einstiege erlauben eine getrennte lokale Prüfkopie, ohne den Betriebseinstieg oder alte Kandidaten zu überschreiben. Neue Tests, Prüfhilfen und diese Dokumentation stehen getrennt neben den alten Nachweisen.

Der [enge Produktdiff gegen das autonome M3-Abnahmearchiv](../../outputs/r10-u1-2026-10-28/product-follow-up.patch) zeigt ausschliesslich diese vier Änderungen. Ein normaler Gitdiff gegen den letzten Betrieb würde auch die bereits zuvor entstandenen Kantonstranchen enthalten und ist deshalb für diesen Nachtrag nicht die geeignete Vergleichsbasis.

Vor der ersten Produktänderung wurde ein [neuer unveränderlicher Schutzstand](../../outputs/r10-u1-2026-10-28/protected-inputs.json) erfasst. Er bindet **13’743 unveränderliche Dateien**, neun eng erlaubte bestehende Änderungsdateien und acht lebende Einstiegstexte. Der lokale Abschluss prüft diesen Bestand sowie die bytegleichen SPFx-Kopien erneut.

Der [ursprüngliche M3-Abschlussbeleg](../../outputs/ap23m3-2026-10-28/local-completion.json), der [damalige Sozial-UI-Fehlerbeleg](../../outputs/ap23m3-2026-10-28/post-acceptance-social-ui-finding.json) und das [autonome M3-Abnahmearchiv](../../outputs/ap23m3-abnahme-2026-10-28/receipt.json) werden nicht umgeschrieben. «Damals nicht behoben» bleibt eine korrekte historische Aussage. Der neue Nachweis dokumentiert die spätere Korrektur.

Unverändert bleiben Rechenkern, native Reader, Schemas, Kandidaten- und Releasedaten, Vertragsversionen, Zeitfenster, Feiertagsbindungen, gemeinsame Stile, bestehende Tests, historische Artefakte und Git-HEAD. Es wird kein lokaler Kandidat in einen freigegebenen Datenrelease umgewandelt.

## 3. Lokale Verifikation an tatsächlichen Artefakten

| Prüfbereich | Nachweis |
| --- | --- |
| Sozialauswahl und Grenzen | Alle elf Erlasse, 44 Fachregeln und 50 Berner Bindungen. Alte Format-9-Kompatibilität, fehlende und fremde Kataloge, aktuelle Fallqualifikation, Defaults ohne erfundene Fallfakten und Invalidierung nach Änderungen |
| Tatsächliche React-Bedienung | Sozialfall berechnet, lokaler Referenzexport gesperrt. Speichern und Neuladen übernimmt keine Empfangsdaten, Referenzen oder aktuellen Fallfakten. Geänderte Fakten entfernen Ergebnis und Export |
| Abbruchspur DE/FR | Früher Abbruch ohne Herkunft, benachbarter berechenbarer Fall sowie später Abbruch mit tatsächlich vorhandener Herkunft. Prüfung an Quellkomponenten und dem minifizierten Webbuild |
| Tatsächliches SPFx-Paket | Isolierter Produktionsbau mit aktuellem Quellbestand, bisherigen Consumer- und Pakettests sowie neuen AMD-Handlerprüfungen. Keine Installation |
| Paketlayout | Tatsächliches Wrappermarkup mit echten gehashten Paketklassen und tatsächlich eingebettetem Paket-CSS. Acht lokale DE-/FR-Proben bei 1120, 400, 373 und 320 CSS-Pixeln, mit ausdrücklich synthetischen langen Quellenbezeichnungen |
| Gesamte Regression | Vollständige Produktregression, bisherige Host-Lebenszyklen, Typprüfung, Schutztests und genaue Bytebindungen an Prüfprotokolle, Build und Browserbelege |

Abschliessender gemeinsamer Lauf: **4’006 Produkt-, 90 Host-, elf Webartefakt- und 117 Governance-Tests bestanden**. Der isolierte SPFx-Bau besteht zusätzlich **293 Quell- und 170 bisherige Pakettests**. Am tatsächlich erzeugten neuen Paket bestehen **36 Nachtests**, darunter acht Verwaltungsregressionen, fünf Sozial-AMD-Tests und 23 Layout-/Messinstrumenttests. In diesen Läufen gibt es keine fehlgeschlagenen, abgebrochenen, übersprungenen oder als offen markierten Tests. Die gezielten Quell- und React-Tests sind bereits in den 4’006 Produkttests enthalten und werden nicht nochmals als unabhängige Gesamtsumme gezählt.

Der [Gesamtabschluss](../../outputs/r10-u1-2026-10-28/local-completion.json) bindet die tatsächlich geprüften Quellen, Logs, Paketbytes, Webdateien und Browseraufnahmen. Einzelbelege: [QA](../../outputs/r10-u1-2026-10-28/QA-R10-U1.json), [isolierter SPFx-Bau](../../outputs/r10-u1-2026-10-28/spfx-build.json), [tatsächliches Paket](../../outputs/r10-u1-2026-10-28/actual-package.json), [Webbuild](../../outputs/r10-u1-2026-10-28/web-build.json), [Browserprüfung](../../outputs/r10-u1-2026-10-28/browser-verification.json) und [Bestandsschutz](../../outputs/r10-u1-2026-10-28/preservation-verification.json).

## 4. Vorschau und verbleibende Nachweisgrenze

- [R10-U1-Rechnervorschau](http://127.0.0.1:8812/fristenrechner/): echte lokale Webartefakte mit unverändertem M3-Referenzdatenstand. Keine operative Verwendung und kein Kalenderexport.
- [Paketlayoutprobe](http://127.0.0.1:8812/layout/): tatsächliche SPFx-Quellenzeile in acht lokalen Prüfrahmen. Die zusätzliche sichtbare Messausgabe gehört nur zum Prüfwerkzeug, nicht zum Produkt.

Die Browserbreitenprobe ist **kein Nachweis von echtem 300-%-Browserzoom, realen Geräten oder SharePoint-/Teams-Hosts**. Der reale T06-Nachtest bei 100 % und 300 % bleibt Bestandteil der später konkret freizugebenden E-/Q-Prüfung. Es wird weder eine Hostinstallation noch eine dortige Behebung behauptet.

Die lokale SPPKG-Datei ist ein Prüfartefakt mit unveränderter bestehender Paketidentität, kein zur Installation freigegebener MVP-0.10-Release. Künftige definitive Paket- und Recoveryversionen werden erst in R10-B gebunden.

Der isolierte SPFx-Bau meldet weiterhin die bereits dokumentierten **136 Lintwarnungen**. Sie wurden in diesem engen Nachtrag nicht bereinigt. Ein bestandener Build ist hier kein Nullwarnungsnachweis.

## 5. Abnahme und nächster Schritt

David Steimer entscheidet über die menschliche Abnahme dieses lokalen Nachtrags. Codex ist das dokumentierte KI-Arbeitsinstrument und übernimmt keine formelle Freigabe- oder Haftungsverantwortung.

Nach der U1-Abnahme folgt gemäss [Bündelplan](../planung/gebuendelter-release-nach-ap23m3.md) **R10-A1** mit Bestands-/Abdeckungsschluss und gemeinsamem Quellenprüfplan, anschliessend R10-A2 mit dem inhaltlichen Quellen- und Fassungsabgleich. Frühere Fachabnahmen ersetzen die gemeinsame Quellenabnahme nicht.

Keine Datenpromotion, zusätzlichen Commits, GitHub-Änderungen, Uploads, Installation oder Änderung an E/Q/P, Mirrors, AP5, AP21, Hosting, Berechtigungen oder Richtlinien. Kein Outlook-Import und keine gespeicherten Kalenderdateien. Der Betrieb bleibt auf **MVP 0.9**. Der abgeschlossene Support-/Betreiberentscheid zum Header-/Cacherisiko wird nicht erneut getestet. #50 bleibt erledigt, IT/RM bleibt separat.


# AP19C1 · Frühe Datumseingabe und Erhalt bei Auswahlwechseln

Stand: 28. September 2026. Bedienentscheid von David Steimer beauftragt und lokal umgesetzt. Bestandteil von AP19C1, kein separates Arbeitspaket. Die abschliessende Kandidatenabnahme bleibt ausstehend.

## Beschlossener Umfang

David Steimer hat dem Vorschlag zugestimmt, Datumseingabe und Berechnungsfreigabe zu trennen, und am 28. September 2026 die Umsetzung innerhalb von AP19C1 beauftragt. Der Umfang bleibt auf die Eingabeführung beschränkt:

1. Das Empfangsdatum ist bereits vor vollständiger Verfahrensauswahl eingebbar.
2. Bei gleicher Bedeutung bleibt das Hauptdatum über Auswahlwechsel hinweg erhalten.
3. Bei geänderter Datumsart wird es gezielt geleert. Ein knapper Hinweis nennt das nun benötigte Datum.
4. Berechnung, Fachqualifikation und Freigabeprüfungen bleiben unverändert.
5. Die Übergänge werden einschliesslich allgemeiner Fristen, politischer Rechte, Beschaffungsrecht und gespeicherter Standards geprüft.

Keine neue Rechtsregel, kein neues Datenformat und kein neuer Architekturentscheid. Die ursprüngliche AP17A-Abnahmenotiz bleibt als historischer Nachweis unverändert. Die dort beschriebene Eingabesperre und das pauschale Leeren des Hauptdatums werden durch diesen Bedienentscheid ersetzt, nicht die fachlichen Berechnungssperren.

## Umsetzung und Abgrenzung

[`dateTransition.ts`](../../src/ui/dateTransition.ts) unterscheidet die fachliche Bedeutung des sichtbaren Hauptdatums von dessen technischem Speicherort. Die Auswahlhandler für Verfahrenskontext, Erlass, Bereich, Spezialerlass, Handlung, Stadium, Zustellart und Eröffnungsart verwenden diese gemeinsame Logik.

- Ein direktes Zustellungsdatum bleibt zwischen allgemeinem Verfahren, den Sozialpfaden und individueller Zustellung im Beschaffungsrecht erhalten. Das gilt auch beim Wechsel zwischen `inputDate` und `specialDateValues.legalTriggerDate`.
- Der ausdrücklich zugeordnete politische Entscheidseröffnungsanker `decisionNoticeDate` gehört zur selben Datumsart. Der Anker für Vorbereitungshandlungen wird nicht allein aufgrund einer ähnlichen Beschriftung gleichgesetzt.
- Publikation, Kenntnisnahme, Wahl-/Abstimmungstag, erster Wahlgang und weitere politische Anker bleiben getrennte Datumsarten. Bei gleicher politischer Ankerart bleibt der Wert erhalten.
- Erfolgloser Zustellversuch und beobachtete gewöhnliche Postzustellung werden nicht in ein rechtlich massgebendes Zustellungsdatum umgedeutet.
- Vor vollständiger oder bei nicht unterstützter Auswahl ist das Feld ausdrücklich als Empfangsdatum beschriftet. Das ermöglicht nur die Eingabe. Unvollständige oder nicht unterstützte Fälle bleiben für die Berechnung gesperrt.
- Eine ungeklärte Eröffnung wird nicht bestätigt. Insbesondere ersetzt ein erfasstes Datum weder die Eröffnungswahl im Beschaffungsrecht noch die tatsächlichen Zuständigkeits- und Feiertagsangaben.
- Übertragen wird ausschliesslich das bisher sichtbare Hauptdatum. Verborgene Altwerte oder zusätzliche Vergleichsdaten werden nicht wiederverwendet. Die bestehenden Rücksetzungen zusätzlicher Falldaten, Bestätigungen, Ergebnisse und Kalenderreferenzen bleiben erhalten.
- Standards enthalten weiterhin keine Falldaten. Neuladen, Standardrücksetzung und neue Rechensitzung übernehmen keine früheren Datumswerte. Es gibt keine neuen dauerhaften Eingaben oder Bestätigungsdialoge.

Hinweisbeispiel: «Die Datumsart hat sich geändert. Bitte neu eingeben: Datum der massgebenden Publikation.» Der Hinweis erscheint nur, wenn tatsächlich ein eingetragener Wert wegen eines Bedeutungswechsels entfernt wurde.

## Prüfnachweis

- Statische TypeScript-Prüfung bestanden.
- Vollständige Kern-/UI-Suite: **860 bestanden, 0 fehlgeschlagen**, darin **41 neue Übergangstests** in [`date-transition.test.ts`](../../tests/ui/date-transition.test.ts). Echte AP19C1- und MVP-0.4-Daten, alle 16 neuen Sozialpfade, zwölf bisherige qualifizierte Sozialpfade, politische Anker, Zustellarten, Eröffnungswechsel, unbekannte künftige Anker, Standards und unveränderte Fachangaben sind abgedeckt.
- Lokaler SPFx-Transport: **67 bestanden**. Kompilierter ES5-Code und tatsächliches Testpaket: **29 bestanden**. Produktionskompilierung, CSS-Audit und Paketierung bestanden. Die zwei bestehenden Lintwarnungen zu explizitem JSON-`null` sind unverändert.
- Alle **23 geschützten Ausgangsdateien** haben unveränderte Prüfsummen.

Tatsächlich im Browser geprüft:

1. Datum 28.09.2026 bereits bei «Bereich: Bitte wählen» eingegeben. Berechnungsversuch meldet weiterhin die fehlende Auswahl.
2. Anschliessende Wahl Sozialversicherungsrecht → UVG → Beschwerde behält das Datum. Fehlende Fallangaben werden weiterhin beanstandet. Nach vollständiger Fallangabe greift die Kandidatensperre ohne Enddatum.
3. Wechsel zum Beschaffungsrecht und zur Zuschlagsbeschwerde behält das Zustellungsdatum. Die Wahl amtlicher Publikation leert es mit deutschem Hinweis. Der Rückwechsel zur individuellen Zustellung wurde mit französischem Hinweis geprüft und visuell kontrolliert.
4. Politische Wahlhandlung übernimmt das vorherige Zustellungsdatum nicht als Abstimmungstag. Ein neu erfasster Abstimmungstag bleibt dagegen beim Wechsel zwischen zwei Wahlhandlungen mit gleicher Datumsart erhalten. Rückkehr zur allgemeinen Zustellungsfrist leert ihn mit Hinweis.
5. Allgemeines VRPG mit Zustellung 28.09.2026 und zehn Tagen ergibt weiterhin 08.10.2026. Wechsel zur StPO behält das Zustellungsdatum, entfernt aber das bisherige Ergebnis. Die Wahl einer unabgeholten eingeschriebenen Sendung verlangt neu das Datum des erfolglosen Zustellversuchs.
6. Neuladen stellt die unveränderten persönlichen Standards ohne Testdatum wieder her. Keine Standards gespeichert oder zurückgesetzt. Keine protokollierten Browserfehler im geprüften Tab.

Die Browserprüfung ist lokal und ersetzt keine vollständige spätere E-/Q-Prüfmatrix. Der isolierte Build liegt unter `.work/ap19c-spfx-build-G6o7JE`. Testpaket-SHA-256: `869ec6da1c699ae47e3eb243fdf6482d5ea0b45c836a2e2c276fed4c587a8b75`. Dieses Paket ist nicht zur Installation oder Publikation bestimmt.

Der Datenkandidat `2026-09-25-ap19c1-candidate.1` bleibt mit Manifest-SHA-256 `eae74fc823128e96a42980cd4eeac448e24dece60514b426d92eb698abb49524` unverändert. Das bestehende SPPKG bleibt unverändert mit SHA-256 `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346`. Die Nachweise vom 25. und 27. September wurden nicht überschrieben. Kein Commit, Push, Deployment, Mirrorwechsel oder Hostingzugriff.

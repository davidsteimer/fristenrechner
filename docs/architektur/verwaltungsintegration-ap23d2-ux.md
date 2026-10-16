# AP23D2 – UX-Nachtrag

Stand: 15. Oktober 2026. Lokal umgesetzt, UI-Abnahme offen.

## Auftrag und Grenze

David Steimer hat den vorgeschlagenen UX-Nachtrag zur Umsetzung freigegeben. Der zweispaltige Aufbau und die fachlichen Rechenregeln bleiben unverändert. AP23D3 folgt erst nach der UI-Abnahme. Seine Rückmeldung bestätigt die erwarteten Rechenergebnisse, ersetzt aber nicht die noch ausstehende Abnahme der überarbeiteten Oberfläche.

Die ursprüngliche [D2-Dokumentation](verwaltungsintegration-ap23d2.md), ihr Prüfnachweis und der Referenzkandidat bleiben als historischer Ausgangsstand erhalten. Dieser Nachtrag beschreibt ausschliesslich die ergänzte lokale Oberfläche. Kein neuer Rechtsdatenrelease, kein SPFx-Paket, kein Deployment und keine Veröffentlichung.

## Bedienung

Die App bestimmt die rechtliche Feiertagsanknüpfung. Benutzende geben nur die dafür erforderlichen Fallangaben ein.

| Konstellation | Verhalten der Oberfläche |
| --- | --- |
| ZPO mit ausgewähltem Gerichtskanton | Automatische Übernahme des bereits bestimmten Sitzkantons. Keine zusätzliche Auswahl «Massgebender Feiertagskanton» und kein redundantes Rollenfeld. |
| ZPO mit Auswahl «Bundesbehörde» | Zusätzliche Angabe «Sitz des Gerichts – Kanton». «Bundesbehörde» bezeichnet keinen geografischen Kanton. |
| Verfahren mit Partei- oder Vertretungsanknüpfung | «Zustellung an» sowie je nach Rolle «Wohnsitz / Sitz der Partei – Kanton» oder «Wohnsitz / Sitz der Vertretung – Kanton». Die bestehende rechtliche Qualifikation der Vertretung bleibt sichtbar. |
| TI-/GR-Verwaltungsverfahren | Weiterhin automatische Anknüpfung an den Behördensitz. |
| Erforderliche regionale Präzisierung oder ungeklärte Rolle | Die tatsächliche Zusatzangabe bleibt erforderlich. Kein stiller Ersatzwert und keine Freigabe ungeklärter Konstellationen. |

Die wirksame Auswahl wird einheitlich für Anzeige, Kalenderauflösung, Berechnung und gespeicherte Standards verwendet. Bei einem Wechsel von Erlass, Rolle oder Behördensitz werden unpassende Orts- und Gebietsangaben nicht übernommen. Insbesondere erfindet der Wechsel zu einer Bundesbehörde keinen Gerichtskanton. Bei alten widersprüchlichen ZPO-Standards ist der ausdrücklich gewählte Gerichtskanton massgebend. Die alten Speicherschlüssel werden dabei nicht umgeschrieben.

Das bestehende zweispaltige Feldraster und das bestehende einspaltige Verhalten bei schmaler Darstellung bleiben erhalten. Nicht benötigte Auswahlfelder entfallen, die verbleibenden Felder und Schaltflächen bleiben im vorhandenen Raster.

## Rechenspur

Die fachliche Ansicht zeigt verständliche Schritte, Datumsbereiche, Feiertags- und Stillstandsbezeichnungen sowie anklickbare Rechtsgrundlagen. «Fristbeginn bestimmen» ersetzt die zu enge Überschrift «Fristbeginn auf den Folgetag setzen», weil der ausgewiesene Beginn bereits einen Stillstand berücksichtigen kann.

Rechtsgrundlagen stammen aus der tatsächlich angewendeten Profil-, Spezialregime-, Sozial- oder Verwaltungsbindung. Die technische Herkunft eines gemeinsam verwendeten Kalendergenerators wird nicht als Rechtsgrundlage des konkreten Falls ausgegeben. Ein ATSG-Stillstand zeigt damit die gebundene ATSG-Norm und nicht zusätzlich die ZPO-, BGG- und VwVG-Quellen des gemeinsamen Kalenderbausteins.

Die Zuordnung erfolgt anhand exakter Identitäten. Zeiträume werden aus den gebundenen Kalendern erzeugt und mit den tatsächlich angewendeten Ereignissen abgeglichen. Fehlende oder mehrdeutige Zuordnungen werden nicht durch vermutete Normen oder aus Kennungen abgeleitete Daten ersetzt.

Pro Ergebnis gibt es einen zunächst geschlossenen Abschnitt «Technische Nachweise». Er bewahrt Rohresultat, Regel- und Quellenkennungen, Bindungen, Release- und Prüfsummenangaben sowie gegebenenfalls den Januarvergleich. Fachlich erhebliche Vorbehalte und Sperren bleiben ausserhalb dieses technischen Abschnitts sichtbar. Deutsch und Französisch sind berücksichtigt.

## Prüfung und Nachweis

Der neue Prüflauf wird getrennt vom ursprünglichen D2-Nachweis abgelegt:

- [QA-AP23D2-UX.json](../../outputs/ap23d2-ux-2026-10-15/QA-AP23D2-UX.json) bindet die aktuellen Artefakte, Testprotokolle und Browsernachweise.
- [Browserprüfung](../../outputs/ap23d2-ux-2026-10-15/browser-evidence.json) dokumentiert die lokale Sichtprüfung. Sie ist keine neue M365- oder reale Geräteprüfung.
- `npm run test:ap23d2:ux` führt Typprüfung, Kandidatenreproduktion, sämtliche D2-Tests, den Vergleich historischer Kernresultate und die Produktregression aus.
- Neue Tests prüfen Rollen-/Ortswechsel, ZPO-Ableitung einschliesslich Bundesbehörde und Gebietsfragen, alte Standards, DE-/FR-Normzuordnung, alle zwölf TI-/GR-Pfade und einen tatsächlichen AHVG-Eingabepfad.
- 301 geschützte Dateien in Rechenkern, Rechtsdaten, Schemas, D2-Kandidat und ursprünglichem D2-Nachweis werden vor und nach dem Lauf über vollständige Inventare und SHA-256 verglichen.

Die lokale Prüfansicht bleibt ohne Kalenderexport. Offen sind die UI-Abnahme durch David Steimer und anschliessend der gesonderte Start von AP23D3. Produktiv bleibt MVP 0.7.

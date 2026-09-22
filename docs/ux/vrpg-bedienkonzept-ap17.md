# AP17: Gestufte Bedienung für VRPG Bern und Spezialrecht

| Merkmal | Stand |
| --- | --- |
| Datum | 11. September 2026, Status und Umfang am 12. September 2026 ergänzt |
| Ausgangspunkt | [Issue #35](https://github.com/davidsteimer/fristenrechner/issues/35), VRPG und ATSG |
| Produktentscheid | [DEC-2026-019](../entscheidungen/DEC-2026-019-gestufte-vrpg-bedienung.md), beschlossen |
| Technischer Produktvertrag | Spezialregimekatalog `3.0.0` am 12. September 2026 durch David Steimer ausdrücklich bestätigt, [DEC-2026-020](../entscheidungen/DEC-2026-020-qualifizierter-spezialregimekatalog-v3.md) |
| Bedienreferenz | UI-Skizze 01 im Projektgespräch vom 11. September 2026, durch David Steimer abgenommen |
| Realisierung | AP17A am 11. September 2026 abgenommen. AP17B am selben Tag als Fachentwurf mit separat geprüften Kandidatenfällen vorgelegt und am 12. September 2026 fachlich abgenommen. AP17C am 12. September 2026 lokal umgesetzt, technisch geprüft und durch David Steimer fachlich abgenommen. Datenpromotion, Veröffentlichung und Deployment ausstehend |
| Projektführung | David Steimer und Codex, interne Dokumentation Deutsch |
| Produktsprachen | Deutsch und Französisch |

## 1. Ziel und Freigabegrenze

Die neue Bedienung führt vom anwendbaren Rechtsgebiet zur konkreten Verfahrenshandlung. Die Auswahl muss eine überprüfbare Zuordnung zu einem freigegebenen Regime ermöglichen. Sie darf keine allgemeine ATSG- oder VRPG-Berechnung suggerieren, wenn das anwendbare Fachrecht noch offen ist.

David Steimer hat den Bedienentwurf und den Beginn der Umsetzung freigegeben. Anschliessend hat er AP17A als UI-Arbeitspaket abgenommen. Die [Abnahmenotiz](../architektur/vrpg-bedienung-ap17a.md#5-abnahme-vom-11-september-2026) hält die überprüften Gründe für die Sperre der Datumseingabe fest. AP17B ist am 12. September 2026 als begrenzte fachliche Grundlage [abgenommen](../fachrecht/vrpg-anwendbarkeit-ap17b.md#7-abnahme-vom-12-september-2026-und-verbleibende-grenze). David Steimer hat AP17C anschliessend mit «OK, dann starte bitte.» beauftragt und nach Umsetzung und Bedienkorrekturen ausdrücklich erklärt: «AP17C ist fachlich abgenommen.» Am selben Tag hat er ergänzend bestätigt: «Der vorgeschlagene Spezialregimekatalog `3.0.0` ist ausdrücklich als technischer Produktvertrag bestätigt.» [DEC-2026-020](../entscheidungen/DEC-2026-020-qualifizierter-spezialregimekatalog-v3.md) hält diese Vertragsbestätigung fest. Die [AP17C-Abnahmenotiz](../architektur/vrpg-integration-ap17c.md#7-fachabnahme-vom-12-september-2026-freigabe-und-rückfall) unterscheidet die fachliche Abnahme, die Vertragsbestätigung, die technischen Prüfnachweise und die noch ausstehenden Releasefreigaben. Datenpromotion, Veröffentlichung und Deployment sind damit nicht freigegeben. Der Produktionsstand bleibt bis zu einer gesonderten Freigabe unverändert.

Die im Projektgespräch abgenommene HTML-Skizze dient als Interaktions- und Gestaltungsreferenz. Ihre Datumsplatzhalter, Auswahlbeispiele und angezeigten Parameter ersetzen keine Anwendbarkeitsmatrix. Die Skizze führt keine fachliche Fristberechnung aus, ist kein Repository-Artefakt und ist nicht auszuliefern. Der verbindliche Vertrag wird nachfolgend festgehalten.

## 2. Verbindlicher Bedienvertrag

Die Auswahl bleibt auf einer Seite. Die Felder erscheinen in dieser fachlichen Abhängigkeit:

`Sitz der zuständigen Stelle → Verfahrensrecht → Bereich → Spezialerlass / Situation → Verfahrenshandlung → Stadium, falls noch nötig`

| Bereich | Bedarfsabhängige Folgeauswahl | Sicherheitsgrenze |
| --- | --- | --- |
| Allgemeines Verwaltungsrecht | allgemeine VRPG-Tagesfrist, ohne unnötige Zusatzabfrage | kein Auffangregime für ungeklärtes Spezialrecht |
| Sozialversicherungsrecht | Spezialerlass, Handlung und nur bei Bedarf Stadium | nicht freigegebene Zuordnungen bleiben gesperrt, auch wenn in der Skizze eine Fristdauer illustriert wurde |
| Politische Rechte | betroffene Ebene und konkrete Situation beziehungsweise Handlung | nur tatsächlich freigegebene berechenbare Regime, erforderliche Ereignis- und Publikationsdaten bleiben explizit |
| Beschaffungsrecht | einschlägiger Erlass und Handlung, nötigenfalls Stadium | eigene sichtbare Kategorie. Im freigegebenen Katalog liegt noch kein passendes Beschaffungsregime vor, daher in AP17A für die Berechnung gesperrt |

Das Stadium wird nicht zweimal abgefragt. Ergibt beispielsweise die konkrete Handlung bereits das Stadium, zeigt die Parameteranzeige diese Ableitung, ohne eine redundante Pflichtauswahl zu erzeugen. «Eingabe im laufenden Verfahren» darf eine zusätzliche Stadiumsauswahl verlangen, sofern sie zur sicheren Zuordnung nötig ist.

### Raster und Reihenfolge

- Die bestehenden Kerneingaben bleiben in einem zweispaltigen Raster. Bedarfsabhängige Felder verwenden dieselben Spaltenbreiten.
- Ein einzelnes zusätzliches Feld bleibt eine halbe Zeile breit. Es wird weder über beide Spalten gestreckt noch durch eine fachlich unnötige Frage ergänzt.
- Die vier Schaltflächen «Frist berechnen», «Resultat zurücksetzen», «Als Standard speichern» und «Standards zurücksetzen» folgen unmittelbar auf die Eingaben, gleich breit wie die Felder und in zwei Zeilen.
- Danach folgen das Berechnungsergebnis und erst anschliessend die automatisch bestimmten Parameter. Die Kalenderaktion bleibt in der rechten unteren Ergebniskachel.
- Regel- und Kalenderstand bleiben in der kompakten Informationszeile am Seitenende.
- Auf schmalen Mobilansichten ist eine einspaltige Anordnung zulässig. Lange deutsche und französische Beschriftungen dürfen nicht unlesbar abgeschnitten werden.

### Auswahlzustände und Standards

- «Bitte wählen» ist bei den erforderlichen fachlichen Auswahlen zulässig und als persönlicher Standard speicherbar. Eine fehlende Auswahl führt zu einer konkreten Meldung, nicht zu einem angenommenen Fachregime.
- Bereich, Spezialerlass, Handlung und ein tatsächlich erforderliches Stadium dürfen als stabile persönliche Standards gespeichert werden. Datumsangaben und freie Referenzen werden nicht gespeichert.
- Der Wechsel einer übergeordneten Auswahl entfernt unvereinbare abhängige Werte. Ein zuvor berechnetes Ergebnis und ein daraus möglicher Kalendereintrag werden ungültig.
- Alte gespeicherte Standards werden nur bei eindeutiger, freigegebener Zuordnung übernommen. Andernfalls wird eine erneute Auswahl verlangt. Neue Felder erhalten keine still erfundenen Standardwerte.
- Eine offene oder gesperrte Anwendbarkeit kann nicht durch eine Parameterübersteuerung freigeschaltet werden.

## 3. Schlanker Realisierungsplan

Es gilt [DEC-2026-008](../entscheidungen/DEC-2026-008-wip-limit-und-paketgroesse.md): ein wesentliches Arbeitspaket gleichzeitig und höchstens fünf Nettoarbeitstage je Paket. Die Pakete werden nacheinander bearbeitet. Die Obergrenze ist kein Sollaufwand. Wird der Umfang eines Pakets grösser, wird es vor der weiteren Bearbeitung in eigenständig prüfbare Folgepakete zerlegt.

| Paket | Ergebnis und Umfang | Abschlusskriterium | Status |
| --- | --- | --- | --- |
| AP17A · Kontrollierte Auswahl und UI-Grundlage | gestufte Auswahl mit vier Bereichen, zweispaltiges Raster, DE/FR, Standards und Rücksetzlogik. Berechnungen für allgemeines VRPG und bereits freigegebene politische Regime. Sozialversicherungsrecht und Beschaffungsrecht zunächst als sicher gesperrtes Auswahlgerüst | automatisierte Auswahl-, Sperr- und Regressionstests sowie visuelle Prüfung. Anschliessend gesonderte fachlich-technische Abnahme durch David Steimer | abgenommen am 11. September 2026, [Nachweis und Abnahme](../architektur/vrpg-bedienung-ap17a.md), nicht veröffentlicht oder installiert |
| AP17B · Fachliche Anwendbarkeit | amtlich belegte Matrix für Sozialversicherungs- und Beschaffungsrecht von Spezialerlass, Handlung und gegebenenfalls Stadium zum Fristenregime, ausdrücklich dokumentierte Ausnahmen und offene Fälle, positive und negative Referenzfälle | fachliche Abnahme der konkreten Matrix und Referenzfälle durch David Steimer. Erst danach dürfen die betreffenden Kombinationen in AP17C integriert und nach den erforderlichen Tests freigegeben werden | am 12. September 2026 fachlich abgenommen und abgeschlossen, [Abnahmenotiz mit Korpusbindung](../fachrecht/vrpg-anwendbarkeit-ap17b.md#7-abnahme-vom-12-september-2026-und-verbleibende-grenze). 16 Zuordnungen, vier Rechenprofile, vier gesperrte Sammelpfade und 60 Referenzfälle. Keine Aktivierung |
| AP17C · Integration und Releasekandidat | Integration des freigegebenen Fachstands, vollständige Regressionen, DE/FR- und Standardmigration, Prüfung der gemeinsamen Oberfläche für SPFx und öffentliche statische Ausprägung, Freigabe- und Rückfallnachweis | gesonderte Abnahme des Releasekandidaten. Datenpromotion, Veröffentlichung sowie E-/Q-/P-Deployment nur im ausdrücklich freigegebenen Umfang und mit anschliessenden Hosttests | am 12. September 2026 durch David Steimer fachlich abgenommen. Lokale technische Prüfungen bestanden, [Abnahme- und Prüfnachweis](../architektur/vrpg-integration-ap17c.md). Spezialregimekatalog `3.0.0` am selben Tag ausdrücklich als technischer Produktvertrag bestätigt, [DEC-2026-020](../entscheidungen/DEC-2026-020-qualifizierter-spezialregimekatalog-v3.md). Keine Datenpromotion oder Aktivierung |

AP17B beginnt nicht mit einer beliebig breiten Vollinventur. Zuerst werden die für den Berner Einsatz priorisierten Kombinationen vollständig und überprüfbar abgegrenzt. Ein nicht geklärter Fall bleibt als solcher sichtbar. Er wird nicht aus Vollständigkeitsgründen einer ähnlichen Regel zugeordnet.

### Umfangspräzisierung vom 12. September 2026

David Steimer bestätigt für die weitere Planung: Wir berücksichtigen ausschliesslich Bundesrecht und kantonales Recht. Eigenständige kommunale Feiertagsregelungen bleiben ausgeschlossen. Örtliche Unterschiede werden nur berücksichtigt, soweit sie sich aus diesen Rechtsgrundlagen ergeben und für das betreffende Verfahren relevant sind. Die Abgrenzung richtet sich nach der Rechtsgrundlage, nicht nach der räumlichen Ausdehnung eines Feiertags.

Eine eigenständige Kalenderapp ist ein separates Vorhaben und gehört nicht zu AP17. Die diskutierte schweizweite Feiertagsgrundlage und weitere Fachzuordnungen sind noch kein Auftrag zu ihrer Umsetzung und werden durch die AP17B-Abnahme nicht freigegeben.

### AP17C-Bedienkorrektur vom 12. September 2026

Nach dem Kandidatentest hat David Steimer feste Anzeigen statt Dropdowns ohne echte Wahl beschlossen. Verfahrensgegenstand, fristauslösendes Dokument und eine einzige unterstützte Eröffnungsart erscheinen als gut lesbare Modellvoraussetzungen im unveränderten zweispaltigen Raster. Mehrere unterstützte Eröffnungsarten bleiben auswählbar. Tatsächliche Fallangaben zu Feiertagsanknüpfung und Verfahrenseinleitung bleiben erforderlich. Die Anzeigen dokumentieren den Modellumfang, nicht eine Nutzerbestätigung des konkreten Falls. Die einzige unterstützte eidgenössische politische Handlung wird ebenfalls fest angezeigt. «Sitz der zuständigen Stelle» ist bereichsunabhängig statisch beschriftet. Umsetzung, erneute Tests und die nachfolgende fachliche Abnahme werden im [AP17C-Nachweis](../architektur/vrpg-integration-ap17c.md) geführt. Die damaligen Korrekturaufträge waren für sich noch keine Paketabnahme. Die nun erklärte fachliche Abnahme ist keine Betriebsfreigabe.

## 4. Prüfkriterien für AP17A

1. Die vier Bereiche sind auf Deutsch und Französisch auswählbar. Nur passende Folgefelder erscheinen.
2. Bereits freigegebene, bisher erreichbare Regime bleiben über eine eindeutige neue Auswahl erreichbar oder werden als bewusste Abgrenzung einzeln dokumentiert. Bestehende Rechenergebnisse ändern sich nicht durch die neue Gruppierung.
3. Fehlende Angaben und nicht freigegebene Kombinationen erzeugen kein Datum, keinen alten Ergebnisrest und keinen exportierbaren Kalendereintrag.
4. Änderungen von Behördensitz, Verfahrensrecht, Bereich, Spezialerlass oder Handlung entfernen unpassende Unterauswahlen und entwerten das Ergebnis.
5. Standards speichern keine Datumsangaben oder freien Referenzen. «Bitte wählen», Rücksetzen und die sichere Migration bestehender Standards sind getestet.
6. Es gibt keine redundant erforderliche Stadiumsauswahl. Fachlich notwendige zusätzliche Datumseingaben bleiben erhalten.
7. Eingaben, Schaltflächen, Ergebnis und Parameter halten das Raster ein. Tastaturbedienung, verständliche Fehlerzuordnung und lange französische Texte werden geprüft. Eine schmale Ansicht erzeugt keinen horizontalen Überlauf.
8. Die freigegebenen Datenreleases und die produktive Bereitstellung bleiben unverändert. Die neue Oberfläche verwendet keine Skizzenwerte als Rechtsdaten.

## 5. Nachweisführung und Zuständigkeit

Für jedes Paket genügt ein kompakter Nachweis mit Umfang, betroffenen Dateien, ausgeführten Prüfungen, offenen Punkten und Abnahmevermerk. Materielle Entscheide erhalten weiterhin eine DEC-ID. Reversible technische Details werden im Umsetzungsnachweis oder Commit erläutert. Neue GitHub-Items oder öffentliche Kommentare werden nicht allein durch dieses lokale Planungsdokument erzeugt.

David Steimer entscheidet, prüft und nimmt ab, derzeit in Personalunion. Codex bereitet vor, setzt um und liefert technische Nachweise, ohne formelle Freigabe- oder Haftungsverantwortung. Es wird keine unabhängige zweite menschliche Prüfung behauptet.

Die historische [AP11A-Funktionsskizze](vrpg-spezialregime-ap11a.md) und die [abgenommene Fachanalyse](../fachrecht/vrpg-be-spezialregime-ap11a.md) bleiben unverändert. [OF-012](../fachrecht/offene-fachfragen.md) wird erst mit einem belegten fachlichen Abschluss geschlossen, nicht mit der Zustimmung zum neuen GUI.

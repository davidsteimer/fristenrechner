# AP23D2 Oberfläche und Datenkandidat für Tessin und Graubünden

Stand: 15. Oktober 2026. Lokale Umsetzung zur fachlich-technischen Teilpaketabnahme. Grundlage sind die [AP23D1-Abnahme und der ausdrückliche D2-Auftrag](../fachrecht/abnahme-ap23d1.md) sowie der bestätigte [DEC-2026-032](../entscheidungen/DEC-2026-032-beschluss.md).

## Ergebnis und Umfang

Die zwölf modellierten TI-/GR-Pfadgruppen sind in der lokalen Rechneroberfläche auf Deutsch und Französisch auswählbar. Sie verwenden den abgenommenen Rechenkern mit eigenem Erlass, Pfad, Revision und Stufe. Bestehende Verfahren bleiben getrennt verfügbar. Ein TI-/GR-Verfahren erhält keine erfundene Berner oder bundesrechtliche Profilidentität.

Die lokale Prüfansicht ist ausdrücklich ein Referenzbetrieb. Sie kann Fristen berechnen und die Rechenspur anzeigen, erzeugt aber keine Kalenderdateien. Die Exportanbindung für einen später vollständig freigegebenen Kontext ist implementiert und wird mit synthetischen Freigabeformen getestet. Daraus entsteht keine Quellen- oder Betriebsfreigabe.

## Datenkandidat und getrennte Rechenkontexte

Der Kandidat **`2026-10-15-ap23d2-reference.1`** enthält 41 Datendateien plus Format-8-Manifest. Der [Builder](../../scripts/build-ap23d2-candidate.ts) leitet ihn aus den vollständig bytegeprüften MVP-0.7-Daten und der gebundenen AP23C-Vertragsprobe ab. Das [Integritätsverzeichnis](../../outputs/ap23d2-candidate-2026-10-15/bundle-integrity.json) bezeichnet Quellen, tatsächliche Komponenten, Längen und Prüfsummen.

Der technische Vertrag ist bestätigt. Die Kalender-, Sozial- und Kantonalverfahrensdaten bleiben dagegen Kandidaten. Die administrative Releasebindung enthält weiterhin keine operative Freigabe. Die historische Quellenprüfung wird als solche erhalten, nicht zu einer neuen vollständigen Quellenprüfung umbenannt. Die fünf Rechtsprofile und der Spezialregimekatalog bleiben byteidentisch. Die 44 Sozialregeln und 50 Berner Anbindungen bleiben fachlich unverändert, ihre Kandidatenbindungen werden an die neuen Komponentenbytes angepasst.

| Zweig der lokalen Vorschau | Tatsächlicher Rechenkontext |
| --- | --- |
| LPAmm TI und VRG GR | Vollständig geprüfter Format-8-Referenzkontext des neuen Kandidaten |
| StPO, ZPO, BGG, VwVG und VRPG-BE samt vorhandenen Spezialwegen | Eigenständiger, unveränderter MVP-0.7-Kontext aus dem tatsächlichen Format-7-Release |
| Exportpolitik der gesamten D2-Prüfansicht | Referenzmodus für alle Berechnungen, auch bei einem Wechsel zurück zu einem Bestandsprofil |

Damit wird Format 8 weder als Format 7 ausgegeben noch zur vermeintlichen Freigabe alter Verfahren umgedeutet. Der gemeinsame Format-8-Hostadapter für die fünf Bestandsprofile bleibt Aufgabe von AP23D3. Die Statuszeile zeigt den tatsächlich verwendeten Kontext des jeweiligen Zweigs.

## Bedienung und aktuelle Fallangaben

Der zweispaltige Aufbau bleibt erhalten. Die Datumseingabe ist früh möglich. Der Sitzkanton filtert die angebotenen Erlasse. Danach werden nur die erforderlichen Angaben zu Verfahrensstadium und Verfahrenshandlung eingeblendet. Besteht nur eine echte Auswahl, wird sie fest angezeigt. Ein zusätzliches Dokumentfeld oder eine allgemeine Bestätigungscheckbox entsteht nicht.

Gesetzliche Tagesfristen sind fest gebunden. Behördlich angeordnete Fristen benötigen eine ganze Zahl von 1 bis 365 Tagen, wobei diese Grenze eine technische Eingabeschranke ist. Die aktuelle Fallkonstellation muss erkennen lassen, dass der allgemeine kantonale Weg und der tatsächliche rechtlich massgebende Empfang gemeint sind. Spezialrecht oder eine ungeklärte Abweichung führen nicht zur allgemeinen Berechnung. Bei den einschlägigen GR-Gerichtswegen wird die ausdrückliche Dringlichkeitsverfügung separat erfragt.

Feiertage und Stillstand bleiben als automatisch bestimmte Parameter sichtbar. Umfangserläuterungen, Rechtsquellen, Pfad- und Releaseidentitäten stehen überwiegend in der aufklappbaren Rechenspur. Ergebnis und Exportbindung werden bei relevanten Eingabeänderungen verworfen. Auch ein Wechsel des geprüften Datenkontexts startet eine neue Sitzung ohne Weiterverwendung alter Resultate oder Fallbestätigungen.

TI-O1 benötigt keine Partei- oder Vertreterorte mehr. Die Feiertagsbindung folgt dem qualifizierten Sitz der zuständigen kantonalen Stelle. TI-O2 bleibt ohne definitives Enddatum und Export gesperrt. Das bestätigte Fallfenster 29.08.2026–31.12.2027 gilt für alle berechnungsrelevanten Tage. Frühere Forschungsfälle werden ausserhalb dieses Fensters als gesperrte historische Referenzen geprüft, nicht nachträglich freigeschaltet.

## Persönliche Vorgaben Version 5

[Defaults 5](../../src/ui/administrativeDefaults.ts) verwendet den eigenen Schlüssel `fristenrechner.defaults.v5`. Nur wenn dieser fehlt, werden gültige Vorgaben der Versionen 1–4 aus dem bisherigen Schlüssel rein lesend übernommen. Alte Hosts und AP5 können ihren bisherigen Schlüssel weiterhin verwenden, ohne die neuen Vorgaben zu überschreiben.

Gespeichert werden ausschliesslich stabile, sichtbare Bedienvorgaben. Dazu gehören Sprache, Sitzkanton, Dauer, Zustellart, eine eindeutig bezeichnete Verfahrensauswahl und passende bisherige Auswahlwerte. Eine alte TI-ZPO-Vorgabe wird nicht zum Tessiner Verwaltungsverfahren. Neue Pfade werden gegen den tatsächlichen Reader-Kontext geprüft. Es gibt keinen Ersatz durch das erste verfügbare Profil.

Empfangsdatum, Referenztext, Dringlichkeit, Zuständigkeitsbestätigung, Gebietsbeweise, Spezialrechtsausschluss und andere Fallbestätigungen werden weder übernommen noch gespeichert. Das gilt auch für das bisher speicherbare `specialLawStatus`. Eine gespeicherte Berner Allgemein- oder Sozialauswahl ersetzt keine aktuelle Fallqualifikation.

Ein Resetmarker verhindert das Wiederaufleben alter Vorgaben. Beschädigte oder künftige v5-Inhalte sowie nicht mehr überprüfbare explizite Pfadauswahlen bleiben gegen gewöhnliches Speichern und Zurücksetzen geschützt. Vor jedem Schreibvorgang wird der aktuelle Inhalt erneut geprüft. Erst eine erfolgreiche Rücklesung bestätigt die dauerhafte Speicherung. Bei blockiertem oder nicht bestätigtem Speicher arbeitet die Sitzung ohne zugesicherte Persistenz und die Oberfläche meldet dies.

## Rechenspur und Kalenderexport

Die [Exportanbindung](../../src/ui/administrativeExport.ts) bindet das tatsächliche Resultat an die vollständige aktuelle Eingabe und denselben geprüften Datenkontext. Ein kopiertes Ergebnis, geänderte Fallangaben oder ein serialisiertes Freigabeflag genügen nicht. Vor der Dateierzeugung wird erneut gerechnet und das vollständige Ergebnis verglichen.

Bei einem später gültig freigegebenen Kontext übernimmt die ICS-Beschreibung Erlass, Pfad, Revision, Stufe, Release, Feiertagsbindung und Quellenlinks. Sie fällt nicht auf ein Berner oder bundesrechtliches Ersatzprofil zurück. Die bestehende gemeinsame ICS-Erzeugung liefert weiterhin den ganztägigen Fristtermin und die vereinbarten Erinnerungseinstellungen.

Referenzkandidaten, Sperrfälle und der globale Referenzmodus der D2-Vorschau erlauben keinen Download. Positive Exporttests verwenden ausschliesslich synthetische Freigabeformen im Testspeicher. Sie sind kein Outlook-Importnachweis und keine menschliche Releasefreigabe.

## Prüfungen und Nachweise

Der [AP23D2-Gesamtnachweis](../../outputs/ap23d2-2026-10-15/QA-AP23D2.json) bindet die endgültigen Dateien, Prüfläufe und tatsächlichen Testzahlen. Die neue Testsammlung deckt folgende Bereiche ab:

- Byteidentischer Neuaufbau des Kandidaten, vollständige Inventar- und Komponentenprüfung, Erhaltung der Bestandsregeln und Ablehnung durch den produktiven Reader.
- TI-/GR-Fachreferenzen im tatsächlichen Kandidaten, alle zwölf Pfadgruppen und zulässigen Stufen, ergänzte TI-Ortsfälle, Stillstände, GR-Dringlichkeit und zeitliche Grenzen.
- Defaults-Migration, Resetmarker, geschützte Inhalte, Speicherfehler und Ausschluss gespeicherter Fallfakten.
- Tatsächlich montierte DE-/FR-Oberfläche, eindeutige Auswahlen, Ergebnisinvalidierung, Kontextwechsel sowie getrennte Bestandspfade.
- Identitäts- und Eingabebindung des Exports, korrekte Herkunft und wirksame Exportsperre in Referenz- und Grenzfällen.

Die [D1-Abnahmekopie](../../outputs/ap23d1-abnahme-2026-10-15/outputs/ap23d1-2026-10-14/QA-AP23D1.json) bleibt unverändert. Der neue D2-Prüflauf ersetzt weder historische Sollwerte noch echte Geräte-, SharePoint-, Teams-, Gast- oder Outlook-Nachweise.

Der erste vollständige Regressionslauf umfasste 2’465 Tests, davon 2’460 bestanden und fünf fehlgeschlagen. Die fünf Fehler betrafen den alten AP22C3-Renderprüfaufbau: Er setzte vorberechnete Resultate pauschal in den fünften React-Zustandsaufruf ein. Zwei neue Verwaltungszustände verschoben diese Position. Die Resultatregion blieb im Test leer. Die begrenzte Korrektur bindet die Testinjektion nun ausdrücklich an die einmalige Resultatzustandsdeklaration im ausschliesslich für diesen Test erzeugten Bundle. Die fünf Prüfaussagen und der Produktcode werden dadurch nicht verändert. Das [ursprüngliche Fehlprotokoll](../../outputs/ap23d2-2026-10-15/product-regression-initial-harness-failure.txt) bleibt erhalten. Der abschliessende Gesamtnachweis unterscheidet diesen Zwischenlauf von der erneuten vollständigen Regression. Die neuen D2-Komponententests verwenden echte DOM-Interaktion, Reader und Rechenkern ohne diese Resultatinjektion.

## Abnahme und nächste Schritte

**AP23D2 liegt lokal zur fachlich-technischen Abnahme vor.** Die Vorschau ist über `npm run preview:ui` mit dem Parameter `?candidate=ap23d2` erreichbar. Sie ist keine Installation auf E oder Q.

AP23D3 ist noch nicht gestartet. Es umfasst den gemeinsamen Format-8-Host, die Provider-/Cacheprüfung, die Synchronisation der SPFx-Produktkopien und die gebauten lokalen Web-/SPFx-Kandidaten. Quellenreleasefreigabe, Datenpromotion, Paketfreigaben und tatsächlicher Deploymentvollzug bleiben getrennte Schritte.

Produktiv bleibt MVP 0.7. Bestehende Releases, AP5-Pins, E/Q/P, Mirrors, M365-Berechtigungen und Richtlinien bleiben unverändert. Italienisch und Rumantsch Grischun, zusätzliche Kantone sowie die separate Feldhöhenprüfung gehören nicht zu AP23D2. David Steimer entscheidet und nimmt ab. Codex bereitet vor und prüft ohne formelle Freigabe- oder Haftungsverantwortung.

# AP23I2 Vertragsprobe und Migration für Glarus und Thurgau

Stand: 22. Oktober 2026. Status: isolierter technischer Vorschlag zur Abnahme. [AP23I1 einschliesslich I1-A bis I1-G ist fachlich abgenommen](../fachrecht/abnahme-ap23i1.md). Der neue Vertrag ist noch nicht beschlossen. Produktintegration und Betrieb bleiben unverändert.

## Ergebnis und erforderlicher Entscheid

Der geschlossene Katalog-5-/Manifest-12-Vertrag kann die abgenommenen GL-/TG-Fälle nicht ohne Bedeutungsänderung ausdrücken. Vorgeschlagen sind **Kantonalverfahrenskatalog 6.0.0 sowie Manifest und Mindestconsumer 13.0.0** gemäss [DEC-2026-038](../entscheidungen/DEC-2026-038-konkretisierte-gesetzliche-fristen-und-hinweiszweige-v6.md). Diese Komponentenformate sind keine Produkt-, Paket- oder Betriebsfreigabe.

Der Vorschlag ergänzt ausschliesslich die 34 neuen Gruppen. Die 79 bisherigen Pfade samt Revisionen, Qualifikationsregeln und Fachobjekten bleiben exakt erhalten. Es gibt keine zusätzliche Kalenderregel und keinen neuen physischen Kalender. Die isolierte Probe umfasst weiterhin 35 Kalender und 44 Manifestartefakte. Die [technischen Ergebnisse](verwaltungsverfahrensvertrag-ap23i2-pruefung.md) werden von der noch offenen menschlichen Abnahme getrennt geführt.

## Warum das bestehende Format nicht genügt

| Vertragslücke | Bisheriger Vertrag | Begrenzte Erweiterung |
| --- | --- | --- |
| Konkret verkürzte gesetzliche Dauer | Nur fester gesetzlicher Wert oder gewöhnliche angeordnete Tagesfrist | Dritter geschlossener Dauerzweig mit gesetzlicher Natur, begrenztem Wertebereich und aktueller Bestätigung |
| Alternative positive Fallqualifikation | Genau ein skalarer Sollwert je Requirement | `value` oder `oneOf`, niemals beides. Der aktuelle Fallwert bleibt skalar und muss ausdrücklich passen |
| TG-Hinweisabhängigkeit | Genau ein statisches Stillstandsprofil pro Pfad | Explizite Auswahl aus genau zwei gebundenen Profilen anhand der aktuellen Hinweisqualifikation |
| Geschlossener Aktivierungsbestand | Exakte Inventare für 79 Pfade und Format 12 | Neue eindeutige V6-Zweige mit 113 Pfaden und Mindestconsumer 13, ohne Lockerung älterer Reader |

Die aktuelle Eröffnung und das Übergangsrecht werden über neue, geschlossene aktuelle Fallfakten qualifiziert. Dafür ist kein allgemeiner Algorithmus zur Ermittlung sämtlicher Altverfahren nötig. Ein Empfang im Jahr 2026 beweist weder neues GL-Instanzrecht noch die Anwendung des aktuellen TG-Verfahrensrechts.

## Neue V6-Datenverträge

### Drei rechtlich getrennte Dauerarten

Alte `statutoryDays`- und `authorityOrderedDays`-Objekte bleiben unverändert. Nur der neue V6-Pfad darf zusätzlich `concretisedStatutoryDays` enthalten.

| Art | Inhalt und Eingabe | Unzulässige Ersatzbehandlung |
| --- | --- | --- |
| Feste gesetzliche Tagesfrist | Fest gebundener Wert, nicht überschreibbar. TG-§-86-Abs.-3-Weiterzug bleibt fünf Tage | Keine freie fünf- oder dreissigtägige Auswahl und kein Übergehen einer widersprechenden aktuellen Belehrung |
| Konkret verkürzte gesetzliche Frist | GL Endentscheid 2–29, GL Zwischenentscheid 2–9, TG 5–29. Aktuelle positive Qualifikation der Verkürzung und konkret anwendbare Tagesdauer erforderlich | Keine gewöhnliche angeordnete Frist und keine pauschale Ferienfreiheit allein wegen kurzer Dauer oder Dringlichkeit |
| Gewöhnliche angeordnete Tagesfrist | Konkrete Tagesdauer, technische Sicherheitsgrenze 1–365 wie bisher | Keine Aussage, dass 365 Tage ein gesetzliches Maximum sind. Keine Umdeutung einer verkürzten gesetzlichen Frist |

Der neue gesetzliche Zweig bindet `overridable: false`, `legalNature: statutoryNotExtendable`, den exakten Wertebereich und das passende `confirmationFact`. Die konkrete Dauer ist eine aktuelle Fallangabe, kein persönlicher Standard. Diese Strukturprobe ersetzt keine juristische Einzelfallbeurteilung einer widersprüchlichen Anordnung.

### Aktuelle Fallfakten, nicht zusätzliche Formularpflichten

Der eigene Modus `qualifiedDayProcedureV6` trägt die aus I1 abgeleiteten Requirements. `value` verlangt exakte Gleichheit, `oneOf` erlaubt ausschliesslich einen der ausdrücklich genannten skalaren Werte. Es gibt keinen ersten Wert als Vorauswahl. Fehlende, unbekannte, widersprüchliche oder nicht abgenommene Angaben führen zur begrenzten Klärung statt zum Ersatzpfad.

Dies betrifft insbesondere den konkreten Verkürzungsgrund, die positiv bestimmte Regierungsratszuständigkeit nach TG § 55 Abs. 1 Ziff. 8 oder 9, die massgebende schriftliche Eröffnung und das jeweils aktuelle Instanzrecht. Die Forschungsmetadaten `dynamic: tgNotice` werden nicht als verdeckter Produktmechanismus kopiert. Ihre fachliche Bedeutung erhält die ausdrücklich typisierte Profilauswahl.

Neue GL-/TG-Policies verwenden `openingChainPolicy: notApplicable` und `localHolidayPolicy: notApplicable`. Damit wird weder die OW-Begründungskette noch die örtliche OW-/NW-Feiertagsgrenze auf GL/TG übertragen. Die aktuellen GL-/TG-Eröffnungsanforderungen bleiben trotzdem vollständig bestehen.

### TG-Hinweiszweig und transitive Profilbindung

Jeder neue Pfad enthält statt eines scheinbar festen Profils eine geschlossene `suspensionSelection`.

- `fixed` bindet genau ein anwendbares GL- oder TG-Profil.
- `currentFact` ist ausschliesslich für die fünf aufgenommenen TG-Hinweisgruppen zulässig. Eindeutig vorhandener massgebender Hinweis (`given`) wählt keine Perioden. Eindeutig vollständig fehlender Hinweis (`absent`) wählt die drei Perioden. Jeder andere Zustand blockiert.

Der aktuelle Hinweis muss zum konkret betroffenen Rechtsmittel oder zur aktuellen Eingabeanordnung gehören. Unvollständige, falsche, umstrittene oder hinsichtlich ihrer Fortwirkung ungeklärte Hinweise werden nicht automatisch als vorhanden oder fehlend behandelt. Kenntnis, Dringlichkeit und persönliche Defaults sind kein Ersatz.

Die Eligibility bindet den Hash der Auswahlstruktur und alle auswählbaren Profilobjekte samt Hashes. Bei zwei Zweigen dürfen weder ein Profil unterschlagen noch ein fremdes Profil ergänzt werden. Die konkrete Auswertung weist ausgewählten Zweig und tatsächlich verwendetes Profil in der isolierten Provenienz aus. Ein bloss korrekter Datei-Hash ersetzt diese semantische Bindungsprüfung nicht.

## Kalender, Quellen und vollständige Zeitabdeckung

Die vier neuen rechtlichen Verwendungen GL Verwaltung, GL Gericht, TG Verwaltung und TG Gericht binden jeweils den bestehenden Kantonskalender, dessen Bundeskalender und den Feiertagskatalog. Es gibt keine freie Vereinigung von Listen und keine Partei-/Vertretungsrolle. DEC-2026-031 und der qualifizierte Sitz der zuständigen Stelle bleiben massgebend.

Alle 35 Kalenderdateien und die 499 Regeln des Feiertagskatalogs bleiben byteidentisch. Identische Datumsdefinitionen verleihen keine automatisch geerbte Verfahrensberechtigung. Die neuen Verwendungen kennzeichnen `sameDatesIndependentLegalBasis` und `permissionInheritance: none`. Historische Herkunft und eine spätere aktive Zielreleasebindung bleiben getrennt.

Forschungsquellenkennungen werden über einen expliziten 1:1-Crosswalk in die bestehenden `SRC-`-/`JUD-`-Produktkennungen projiziert. Forschungsarchiv, URLs, Originalbytes und Evidenzgrenzen werden nicht umbenannt oder verbessert. Quellenrolle und konkrete Fundstelle werden zusätzlich zum Hash geprüft.

Das neue Fall- und vollständige Berechnungsfenster bleibt **29.08.2026–31.12.2027**. Es gilt für Eröffnung, sämtliche Zähl- und Stillstandstage sowie die Endverschiebung. GL Art. 140a und das aktuelle TG-Instanzrecht benötigen die eigene aktuelle Fallqualifikation. Quellenstand und Modellfenster sind keine Garantie unveränderten zukünftigen Rechts. Die abgegrenzte reine Endverschiebung in neu beginnende anwendbare Ferien bleibt ohne definitives Ergebnis und Export.

## Komponentengrenzen und spätere Migration

| Komponente | I2-Vorschlag |
| --- | --- |
| Kantonalverfahrenskatalog | 6.0.0, eigener geschlossener V6-Zweig |
| Manifest und Mindestconsumer | 13.0.0 |
| Rechtsprofile, Feiertagskatalog, Regelkalender | Formate 1.0.0, 2.0.0 und 3.0.0 unverändert |
| Spezialregime- und Sozialverfahrenskatalog | Formate 3.0.0 und 2.0.0 unverändert |
| Persönliche Vorgaben | Version 5 unverändert. Keine gespeicherten aktuellen Fallfakten |
| Sozialfreigabe | 44 Regeln und 50 BE-Anbindungen unverändert, keine ausserbernische Erweiterung |
| Alte Formate und AP5 | Weiterhin eigenständig prüfbar und unverändert |

Die Strukturprobe liegt ausschliesslich unter [outputs/ap23i2-candidate-2026-10-22](../../outputs/ap23i2-candidate-2026-10-22/). Sie ist absichtlich kein neuer freigegebener Gesamtquellenrelease. Die unveränderten kopierten Fachkomponenten behalten ihre historischen Herkunfts-/Releasebindungen. Der Katalog hat Vorschlagsstatus, keine Freigabe, leere aktive Zielreferenzen und keine Exportberechtigung. Das lokale Manifest mit gesperrter Probeextension darf nicht als operatives Manifest akzeptiert werden.

Erst nach technischer I2-Abnahme und ausdrücklichem Formatbeschluss kann AP23I3 gesondert starten. Dort folgen nativer Format-13-Reader, geschlossener Aktivierungsvalidator, tatsächliche Zielrelease-Neubindung sämtlicher Komponenten, Kern-/UI-/Hostintegration und reale Artefakttests. Der spätere Migrationsweg muss zwei auswählbare Profile geschlossen prüfen und den konkret verwendeten Zweig in lesbarer Rechenspur und technischer Provenienz erhalten.

Die frühe Datumseingabe, der zweispaltige Aufbau, feste Einzelwerte und zurückhaltende Zusatzinformationen bleiben verbindlich. Die Anzahl Forschungsgruppen ist kein Auftrag, zusätzliche Einzel-Dropdowns einzubauen.

## Schutz und Abnahme

2’759 eindeutige Bestandsdateien sind vor Änderungen der sieben lebenden Einstiegstexte gebunden. Dazu gehören I1-Originale, I1-Abnahmearchiv, H3-Abnahmearchiv, alter Produktstand und das bereits fremd geänderte Projektplan-DOCX. Die Probe fügt nur neue isolierte Dateien hinzu. Die [Prüfung](verwaltungsverfahrensvertrag-ap23i2-pruefung.md) verifiziert auch die Schutzbindung.

Offen sind die technische Abnahme von I2 und DEC-2026-038. Nicht umfasst sind I3, zusätzliche fachliche Freigaben, Runtime-Aktivierung, Quellreleasepromotion, Produktbauten, Commits, GitHub-Push oder Issueänderungen, Uploads, E/Q/P, Mirrors, AP5, AP21, Hosting und Berechtigungen. Der nächste reguläre Release bleibt nach DEC-2026-034 gebündelt. David Steimer entscheidet in Personalunion. Die unabhängigen technischen Gegenprüfungen durch KI und getrennte Berechnungsimplementierungen sind keine menschliche Zweitfreigabe.

# AP23M2 Vertragsprobe und Migration für Neuenburg, Waadt und Wallis

Stand: 28. Oktober 2026. **Isolierter technischer Vorschlag zur Abnahme.** [AP23M1 ist einschliesslich M1 A bis M1 G fachlich abgenommen](../fachrecht/abnahme-ap23m1.md). Der [M2-Startauftrag](start-ap23m2.md) umfasst Vertragsprüfung und lokalen Referenzkandidaten, keine Produktintegration.

## Ergebnis und erforderlicher Entscheid

Vorgeschlagen sind **Kantonalverfahrenskatalog 10.0.0 sowie Manifest und Mindestconsumer 17.0.0** gemäss [DEC-2026-042](../entscheidungen/DEC-2026-042-ne-vd-vs-verfahrensvertrag-v10.md). Der beschlossene Vertrag 9/16 bleibt bis zu einem ausdrücklichen Folgeentscheid unverändert. Neue Bedeutung nur unter neuen Kennungen in V9 zu verstecken, wäre kein sauberer Vertrag.

Der isolierte Kandidat ergänzt **49 Pfade, NE 16, VD 19 und VS 14**, zu den 196 unveränderten Bestandswegen. Damit enthält die Probe 245 administrative Pfade. Bern bleibt ein separates Bestandsprofil. Die Probe ist weder die native Integration der letzten drei Kantone noch eine gesamtschweizerische Betriebsfreigabe.

## Wiederverwendung und neue Bedeutung

| Gegenstand | Wiederverwendung | Geschlossene Ergänzung in V10 |
| --- | --- | --- |
| Aktuell qualifizierter Auslöser | Unveränderter rechtlicher Eröffnungstag, keine automatische Zustellfiktion | Neue handlungsbezogene Pfad- und Faktenbindungen, keine automatische Folgeeröffnung |
| Gesetzliche und angeordnete Tagesdauer | Bestehende primitive Dauerarten, auch drei und fünf Tage | Neue Anwendungsbindungen. Die Rechtmässigkeit angeordneter Dauer bleibt aktuelle Fachqualifikation |
| Waadtländer einfache Post | Keine Übernahme der Innerrhoder Erwartbarkeitsregel | Eigene Alternative zwischen qualifizierter Eröffnung und zulässigem physischem Empfang ohne Unterschrift, mit genau zwei aktuellen Zusatzvoraussetzungen |
| Walliser längere Belehrung | Aktuelle ordentliche Basis und wirksame tatsächliche Tagesangabe | Eigene Dauerpolicy oberhalb der ordentlichen Basis zehn oder 30 Tage, ohne zusätzliche AI-Schwelle von mehr als 30 Tagen |
| Neuenburger Stellensitz | Vorhandene physische Kalender | Eigene regionale Stellensitzwahl mit genau zwei terminalen Kalendern und ohne Ersatzwert. Das Gericht ist separat fest an Neuchâtel gebunden |
| Stillstand | Vorhandene Periodentypen | Neue Instanzen mit NE-/VD-Winterende 2. Januar und VS-Winterende 5. Januar |
| Eligibility | Vorhandene Bindung von Pfad, Faktenpolicy, Kalender und Profil | Neuer geschlossener V10-Zweig mit Dauer-, Öffnungs-, Auswahl- und Ergänzungshashes |

Es entsteht keine allgemeine Ausdruckssprache. Die historischen Definitionen V1–V9 und ihre Fachobjekte werden weder gelockert noch rückwirkend umgeschrieben. Vier neue Schemata liegen ausschliesslich unter `schemas/candidates/ap23m2/`.

## Waadt: Eröffnung und angeordnete Dauer

Eine bereits qualifizierte Eröffnung bleibt unverändert, auch wenn sie auf einen Samstag fällt. Nur die tatsächlich zulässige einfache Postzustellung ohne Unterschrift erhält bei Eingang am Samstag, Sonntag oder gebundenen Feiertag die Verschiebung auf den nächsten Werktag. Aktuell zu bestätigen sind die Zulässigkeit dieser Zustellform und der verifizierte Eingang in der Machtsphäre. **Keine zusätzliche AI-Erwartbarkeit, kein Trackingzwang und kein behauptetes identisches Empfangsregime werden importiert.**

Rechtliche Eröffnung und Tageszählung bleiben getrennt. Der Feiertagskalender ist VD-LEmp mit Bettagsmontag, aber ohne zusätzlichen 26. Dezember. Stillstand gilt in den qualifizierten ordentlichen gerichtlichen Gruppen, nicht allgemein bei Verwaltung, réclamation oder vorsorglichen gerichtlichen Handlungen. Der externe administrative Vorsorgeentscheid mit 30 Tagen ist nicht der besondere Zehntagesweiterzug gegen den instruierenden Magistraten desselben Gerichts.

**Art. 81 Abs. 5 wird nicht als automatische numerische Ansetzungskontrolle ausgegeben.** M1 verlangt aktuell die rechtliche Qualifikation «andere gültige Eingabe, anfängliche Ansetzung nach Art. 81 innerhalb von 30 Tagen oder tatsächlich bewilligte Verlängerung». Dieser zusammengesetzte Wert enthält keinen maschinenlesbaren Discriminator zwischen Erstansetzung und Verlängerung. Eine positiv qualifizierte Vierzig-Tages-Anordnung ist deshalb nicht global gesperrt. Die negative Vierzig-Tages-Probe mit ausdrücklich unzulässiger Erstansetzung beweist die Qualifikationssperre, nicht die numerische Ableitung ihrer Rechtswidrigkeit. Die spätere Oberfläche muss diese Bedingung verständlich zur aktuellen Auswahl stellen. Weder eine Falltatsache noch eine Verlängerung wird aus Standards erfunden.

Die positive Anordnungsqualifikation umfasst nur eine tatsächlich neu laufende Tagesdauer ab ihrer aktuell qualifizierten Eröffnung. Eine Verlängerung «um zehn Tage» ab dem ursprünglichen Fristende oder eine Anordnung mit fixem Endtermin wird nicht in zehn Tage ab Empfang umgedeutet. Das gilt auch bei einer tatsächlich bewilligten Verlängerung. Der aktuelle Auslöser muss zur konkret gewählten Tagesdauer passen.

365 Tage ist bei allgemeinen angeordneten und länger belehrten Dauern ein technisches Sicherheitslimit, kein gesetzliches Maximum. Diese Grenze ersetzt insbesondere keine Prüfung der Rechtmässigkeit einer Anordnung.

## Neuenburg: zwei tatsächliche Stellensitzkalender

Verwaltungswege verlangen die aktuelle räumliche Qualifikation der zuständigen Stelle: allgemeiner Kalender ohne Le Landeron oder Le Landeron mit seinem zusätzlichen Fronleichnam. Eine fehlende oder ungeklärte Zuordnung führt zur Qualifikationsgrenze. Kein erster Kalendertreffer, keine freie Vereinigung, keine Parteienanknüpfung und kein pauschaler Bern- oder Bundersatz.

Die gerichtlichen Wege sind separat an den aktuell qualifizierten Tribunal cantonal, Cour de droit public, Sitz Neuchâtel, und den allgemeinen Kalender gebunden. Die vorhandenen prozessualen RDF-Ergänzungen sind keine allgemeine Automatik für die rechtliche Öffnung physischer Zustellungen. **NE verwendet ausschliesslich eine bereits rechtlich qualifizierte Eröffnung.** Die abgenommene Grenze NE-O3 bleibt bestehen.

Die drei Stillstandsperioden gelten in den abgenommenen allgemeinen NE-Gruppen auch vor Verwaltungsbehörden. Zusätzliche Jahres- oder örtliche Anordnungen werden weiterhin als berechenbarer Vorbehalt NE-O1 offengehalten. Es wird nicht behauptet, alle möglichen Zusatzanordnungen für 2026/2027 seien abschliessend ausgeschlossen.

Das [frische Neuenburger Fassungsgate](../../outputs/ap23m2-2026-10-28/ne-fassungsgate.json) trennt die geltende LPA und OJN von der noch auf Promulgation wartenden LJu. Art. 218 des neuen Gesetzes nennt keinen Inkraftsetzungstermin. Der Justitia-Beitritt ist kein Nachweis einer allgemeinen Aktivierung elektronischer Eröffnungspflichten. Kein neuer relevanter geltender Normstand gegenüber M1 wurde festgestellt. Das ist keine Zukunftsgarantie bis Ende 2027.

## Wallis: tatsächlicher Auslöser, längere Belehrung und Stillstand

Die fünftägige Anforderung einer schriftlichen Bestätigung nach qualifizierter mündlicher Eröffnung ist vom dreissigtägigen Verlangen nach vollständiger Begründung eines schriftlich eröffneten Dispositivs getrennt. Eine spätere Beschwerdefrist beginnt erst mit ihrer eigenen tatsächlich qualifizierten schriftlichen Eröffnung. Der Rechner erfindet keine künftige Zustellung oder automatische Handlungskette.

Die längere wirksame Belehrung verlangt aktuelle tatsächliche Tagesdauer, aktuelle ordentliche Basis zehn oder 30 Tage, Übereinstimmung von Eingabe und Belehrung sowie ein striktes Überschreiten der Basis. **15 Tage bei ordentlicher Basis zehn sind hier möglich.** Die AI-Schwelle oberhalb von 30 Tagen wäre sachlich falsch. Kürzere Belehrungen ändern die gesetzlichen zehn oder 30 Tage nicht. Sonstige mangelhafte Belehrungen bleiben die abgenommene Einzelprüfungsgrenze.

Verwaltungswege haben keinen importierten gerichtlichen Stillstand. Die bezeichneten gerichtlichen Wege verwenden drei Perioden mit Winterende **5. Januar einschliesslich**. Der vorhandene VS-Prozesskalender bleibt ohne Karfreitag. Die Samstagverschiebung ist am abgenommenen kantonalen Praxisbeleg gebunden, nicht an einer falsch zugeordneten alten LOJ-Regel.

## Nachfristen, Zeitfenster und Kollisionen

Die NE-/VD-Dreitagesnachfristen setzen ein rechtzeitig gestelltes Gesuch betreffend eine tatsächlich erstreckbare Eingabefrist sowie die qualifizierte Ablehnung erst nach Ablauf der ursprünglichen Frist voraus. Frühe Ablehnung, Zahlung oder gesetzliche Rechtsmittelfrist werden nicht über diesen Weg berechnet. Keine pauschale Dreitageszugabe zum alten Fristende.

Das vollständige Fenster bleibt **29.08.2026–31.12.2027**. Physischer Auslöser, qualifizierte Eröffnung, alle Zähl- und Endverschiebungstage müssen gedeckt sein. Kalenderregeln werden an jedem tatsächlich betrachteten Tag nach ihrer eigenen Gültigkeit ausgewertet. Es wird keine pauschale Schnittmenge sämtlicher Einzelregelintervalle als Gesamtgeltung verwendet.

Führt erst die reguläre Endverschiebung in einen neu beginnenden anwendbaren Stillstand, bleibt die bestätigte Kollisionsgrenze erhalten: kein definitives Ende und kein Export. Die drei solchen Originalfälle sind keine pauschale Sperre aller Ferienfälle. Die übrigen begrenzten M1-Vorbehalte werden nicht technisch wegentschieden.

## Kandidatenbytes, Quellenrollen und Bestandsschutz

Der [tatsächliche Kandidat](../../outputs/ap23m2-candidate-2026-10-28/) enthält 44 Manifestartefakte und das Manifest. **43 nichtadministrative Artefakte sind rohbytegleich zum abgenommenen L3-Stand.** Die 196 alten Pfade, Qualifikations- und Eligibilityobjekte sowie frühere Erlasse, Quellen, Profile und Kalenderbindungen bleiben unverändert.

Es bleiben 35 physische Kalender und 499 Katalogregeln. Neu entstehen vier administrative Bindungsobjekte für vier bereits vorhandene Kalender und fünf Stillstandsprofile. Keine neue physische Feiertagsregel und kein neues prozessuales Zusatzdatum. Die bestehenden Schwyzer Ergänzungen bleiben unverändert. 44 Sozialregeln und 50 BE-Anbindungen bleiben unverändert und werden nicht ausserbernisch freigegeben.

Der [Quellen-Crosswalk](../../outputs/ap23m2-candidate-2026-10-28/source-crosswalk.json) erhält alle **64 M1-Belegdateien** mit ihren angenommenen Rollen. **19 technische Quellenzeilen** sind konkret in die neue Norm-, Kalender-, Inkraftsetzungs- oder Praxisbindung einbezogen. Historie, Parallelvolltext, Fassungsregister, Spiegelentscheid und technisches Portal-JavaScript werden nicht zu zusätzlichen positiven Rechtsnormen. Die technische Projektion ist keine gemeinsame Quellenreleasefreigabe. Das frische NE-Gate ist ein eigener Zusatznachweis, keine Änderung der M1-Rohdateien.

## Migration und M3-Auftrag

Rechtsprofile 1, Feiertagskatalog 2, Regelkalender 3, Spezialregimekatalog 3, Sozialverfahrenskatalog 2 und persönliche Standards **Version 5** bleiben als Formate unverändert. Alte Formate, AP5-Pins und AP21 bleiben geschützt. Ein alter Consumer muss unbekannte neue Pfade als nicht unterstützt erhalten. Er darf sie weder löschen noch auf Bern oder den ersten Eintrag abbilden.

Stabile Auswahlwerte dürfen später übernommen werden. Datum, Referenz, aktueller Stellensitz beziehungsweise regionale Zuordnung, qualifizierter Auslöser, aktuelle Zustellvoraussetzungen, Zulässigkeit der Handlung, Anordnungsrechtmässigkeit, tatsächliche Tagesdauer und Belehrungswirksamkeit sind keine aus Standards wiederherzustellenden Falltatsachen. Provider und Cache bleiben an die tatsächliche Datenkonfiguration gebunden. Kein Browserdatenreset.

Erst nach technischer M2-Abnahme und ausdrücklichem DEC-2026-042 kann AP23M3 gesondert starten. Dort folgen nativer Format-17-Reader und Aktivierungsvalidator, echte Daten-Neubindung, Rechen- und UI-Integration, verständliche aktuelle Tatsachenführung, ruhige DE-/FR-Rechenspur, Exportprovenienz, Standards- und Hosttests. Der zweispaltige Aufbau, frühe Datumseingabe, feste Einzelwerte und statisch «Sitz der zuständigen Stelle» bleiben erhalten. 49 Gruppen bedeuten nicht 49 zusätzliche Eingabefelder.

## Nachweise und Freigabegrenze

Die [separate M1-Abnahme](../fachrecht/abnahme-ap23m1.md) sichert 110 Nutzdateien. Der Originalabschluss behält seine damaligen Vorabnahmeflags. Die [M2-Ausgangsbindung](../../outputs/ap23m2-2026-10-28/protected-inputs.json) schützt 11’414 Bestandsdateien. Der [technische Prüfnachweis](verwaltungsverfahrensvertrag-ap23m2-pruefung.md) und der [gebundene Abschluss](../../outputs/ap23m2-2026-10-28/local-completion.json) dokumentieren die tatsächliche technische Probe.

M2 ist noch nicht menschlich technisch abgenommen. DEC-2026-042 ist nur vorgeschlagen. **M3 ist nicht gestartet.** Produktcode und native Schemata sind unverändert. Kein regulärer Produktbau, Commit, Push, Upload, Installation, Mirrorwechsel oder Betriebsentscheid. MVP 0.9, E/Q/P, Hosting und Berechtigungen bleiben unverändert. DEC-2026-034 bündelt weiterhin den nächsten regulären Release. David nimmt die menschlichen Rollen in Personalunion wahr. KI-Arbeitsteilung ersetzt keine formelle Freigabe.

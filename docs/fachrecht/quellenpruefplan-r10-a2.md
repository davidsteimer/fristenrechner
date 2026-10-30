# Gemeinsamer Quellenprüfplan R10-A2

28. Oktober 2026. Vorbereitung im Rahmen von R10-A1.

**Prüfziel sind alle 380 kanonischen Quellenkennungen und ihre tatsächlich verwendeten Aussagen im gemeinsamen Format-17-Bestand.** Die [Bestandsaufnahme](../betrieb/bestandsbericht-r10-a1.md) und das [maschinenlesbare Inventar](../../outputs/r10-a1-2026-10-28/sources/source-inventory.json) sind die Prüfbasis. Eine gemeinsame inhaltliche R10-A2-Prüfung oder deren menschliche Abnahme ist damit noch nicht erfolgt.

## Grundgesamtheit und Prüfeinheiten

380 Kennungen teilen sich in 251 bisher für MVP09 geprüfte und 129 neue Kennungen. 258 stehen im Kandidatenmanifest. 5’045 konkrete Referenzstellen umfassen die 2’136 vollständig erhaltenen alten und 2’909 neuen Verwendungen. Die 713 historischen Arbeitsmappenverweise bleiben getrennt und nicht aktivierend.

Der Prüfplan erfasst positive, gemeinsam verwendete, rein ausschliessende und derzeit nicht laufzeitreferenzierte Quellen. Die 110 Kennungen ohne aktuellen Graphverweis werden nicht stillschweigend ausgelassen. Ihre Quellenrolle und allfällige Vorbehalte werden ausdrücklich beurteilt, ohne daraus positive Fallfreigaben abzuleiten.

Eine kanonische Kennung ist weder ein physischer Erlass noch ein neuer Abruf. Jede Kennung hat genau ein `ownerLotId`. Ein physischer Rechtsakt darf einmal gemeinsam abgerufen werden, wenn Identität, Sprache, Fassung und Fundstellen eindeutig zugeordnet sind. Seine unterschiedlichen Kennungen und Verwendungen bleiben einzeln nachvollziehbar. Exakt gleiche URLs allein genügen dafür nicht.

## Zwölf nacheinander bearbeitete Lose

| Los | Inhalt | Kanonische Kennungen |
| --- | --- | ---: |
| R10-A2-BASELINE | Bisherige Bundes-/BE-Profile, Spezial- und Sozialverfahrensgrundlagen, bestehende Rechtsprechung | 77 |
| R10-A2-CALENDAR-ACTIVATION | Bisherige operative Kalender- und Aktivierungsgrundlagen | 73 |
| R10-A2-CALENDAR-CATALOG | Historischer gesamtschweizerischer Katalog- und ergänzender Quellenbestand | 82 |
| R10-A2-ADMIN-PRIOR | Bisherige allgemeine Verwaltungsgrundlagen TI, GR, LU, ZG und AR | 19 |
| R10-A2-AP23F1 | Neue Quellenzuordnungen ZH, AG, SG | 15 |
| R10-A2-AP23G1 | Neue Quellenzuordnungen UR, SO, SH | 11 |
| R10-A2-AP23H1 | Neue Quellenzuordnungen OW, NW | 10 |
| R10-A2-AP23I1 | Neue Quellenzuordnungen GL, TG | 11 |
| R10-A2-AP23J1 | Neue Quellenzuordnungen FR, GE, JU | 19 |
| R10-A2-AP23K1 | Neue Quellenzuordnungen BS, BL | 27 |
| R10-A2-AP23L1 | Neue Quellenzuordnungen AI, SZ | 17 |
| R10-A2-AP23M1 | Neue Quellenzuordnungen NE, VD, VS | 19 |
| **Vollständige disjunkte Zuteilung** | **Jede Kennung genau einmal, keine Auslassung oder Doppelverantwortung** | **380** |

Die 129 neuen Kennungen sind nicht die gesamte Quellenzahl der jeweiligen Tranche. Bereits vorhandene Quellen können zusätzlich verwendet sein. Die bestehende Bundesfeierkennung und die bisher historisch geführte Zürcher Ruhetagskennung erhalten neue Verwendungsstellen. Sie bleiben in ihrem ursprünglichen Los und tragen im Inventar einen verbindlichen zusätzlichen Verwendungsprüfauftrag. Sie bilden keine künstliche dreizehnte Eigentümergruppe.

WIP-Limit eins. Es arbeiten weiterhin nur David und Codex. Jedes ausführbare Teilpaket bleibt auf höchstens fünf Nettoarbeitstage begrenzt. Die Tabelle ist ein fachlicher Zuschnitt, keine Zusage, dass jedes Hauptlos in fünf Tagen fertig wird. Bei grösserem Aufwand wird ein Hauptlos in überprüfbare Teilmengen geteilt, bevor ein zweites wesentliches Paket eröffnet wird.

## Inhalt und Fassungen prüfen

Für jede Kennung beziehungsweise gemeinsam geprüfte physische Quelle werden folgende Punkte belegt:

1. **Identität und tatsächliche Verwendung.** Amtliche Quelle, Erlass-/Entscheididentität, Sprache, konkrete Bestimmungen und alle betroffenen Pfade, Kalender, Normphasen oder Ausschlüsse.
2. **Fassung und Zeitraum.** Aktuelle amtliche Fassung, bereits publizierte zukünftige Änderungen, Inkraftsetzung, Aufhebung und Übergangsrecht gegen die konkret gebundenen Fall- und Normfenster abgleichen.
3. **Inhalt oder begründete Wiederverwendung.** Tatsächlich gelesenen Volltext von wiederverwendeten, bytegebundenen Vorbefunden unterscheiden. Originalabruf, damalige Inhaltsprüfung, späteres Produktprüfdatum und heutiger Entscheid erhalten eigene Datumsfelder.
4. **Neue Verwendungsstellen.** Auch bei unveränderter Norm ausdrücklich prüfen, ob die neue verfahrensrechtliche Verwendung gedeckt ist. Keine neue Sozialanbindung oder kantonale Spezialfreigabe aus allgemeiner Normgleichheit ableiten.
5. **Ergebnis und Folgen.** Unverändert, Fassung geändert ohne Wirkung auf die verwendete Regel, materiell geändert, unklar oder nicht verlässlich verfügbar. Auswirkungen auf konkrete Pfade, Kalender und Referenzrechnungen nennen.
6. **Beleg und Entscheid.** Rohdatei, Fundstelle, Hash, Prüfumfang, Wiederverwendungsbegründung, fortbestehende Grenze und erforderliche menschliche Entscheidung zusammenhalten.

Ein aktueller Versionsindex kann einen gebundenen Inhaltsvorbefund stützen, ersetzt aber nicht den verwendeten Norminhalt. JavaScript-Portalcode, Suchtreffer, Linkerreichbarkeit oder HTTP 200 sind keine Volltextprüfung. Die inzwischen in M1 gesicherte amtliche Waadt-Volltextzugänglichkeit wird berücksichtigt. Eine ältere Zugangslücke wird nicht als heutiger Zustand fortgeschrieben.

Amtliche Primärquellen bestimmen die Normfassung. Bei Rechtsprechungsfragen werden die vorgesehenen Dienste Entscheidsuche und Swiss Caselaw berücksichtigt. Ein Spiegel bleibt als Spiegel bezeichnet. Ein gelesener historischer Entscheid bestätigt nicht automatisch einen aktuellen Datumswert oder die Abwesenheit neuerer Rechtsprechung.

## Vorhandene Nachweise gezielt wiederverwenden

Der A1-Belegpool bindet 1’223 vorhandene Dateipfade mit 431’105’954 Bytes. R09-A2 liefert 784, F1–K1-Indices 344 und L1-/M1-Quellenregister weitere 95 eindeutige Pfade. Der Pool enthält Rohquellen, Indices, Extrakte, technische Abrufhilfen und Mehrfachdarstellungen. Seine Vollständigkeit als Dateipool ist keine pauschale inhaltliche Wiederverwendungsfreigabe.

| Vorbefund | Voraussetzung einer späteren Wiederverwendung | Zusätzliche Prüfung |
| --- | --- | --- |
| Abgenommene MVP09-Einzelbewertung | Konkrete Aussage, Originalbeleg, damalige Fassung und Aussagegrenze sind gebunden und weiterhin einschlägig | Aktuelle und publizierte zukünftige Fassung, jede neue Verwendung und fortbestehende Vorbehalte |
| Fachlich abgenommene F1–M1-Abklärung | Zugehörige separate Abnahme und tatsächliche Belegdatei eindeutig zugeordnet | Datum des ursprünglichen Abrufs und Inhaltsumfang beibehalten. Späteres `reviewedOn` ist kein neuer Onlineabruf |
| Historischer Entscheid | Identität, massgebende Erwägung und begrenzte Aussage bleiben identisch | Keine Ausdehnung auf andere Fachfälle oder andere Normfassungen. Keine behauptete erschöpfende Rechtsprechungssuche |
| Feiertagsgrundregel | Normbasis, räumlicher Bereich, Bedingung und Fallrelevanz stimmen weiterhin | Prozessuale Feiertagsbindung getrennt von physischem Feiertagsbestand beurteilen |
| Ergänzender oder nicht operativer Katalogbeleg | Rolle, Herkunft und Aussagegrenze sind gekennzeichnet | Kein stiller Statuswechsel zur eigenständigen positiven Fallfreigabe |

Der R09-Bericht unterscheidet 192 Kennungen mit damals frischen Teil-/Vollnachweisen und 59 ausschliessliche Wiederverwendungen. Diese Angaben beschreiben die Prüfung vom Oktober, nicht heutige frische Prüfungen. Technische Vorabnahmeflags in alten Berichten bleiben unverändert. Die tatsächliche menschliche R09-Abnahme ist separat gebunden.

Für die Tranchen liegen Nachweise vom 22. Oktober für F1–I1 und vom 27. Oktober für J1–M1 vor. Sie können den Aufwand reduzieren, ersetzen aber keine begründete R10-Verwendungs- und Fassungsbewertung. Die schon im Produkt auf 28. Oktober gesetzten Prüfdaten dürfen nicht als zusätzlicher amtlicher Abruf ausgegeben werden.

## Besondere Prüfschwerpunkte

- **Normphasen 2027:** Unter anderem die gebundenen Übergänge ZH zum 01.01.2027, SG GerG zum 01.06.2027, OW StVG und VwVG zum 01.01.2027 sowie der SZ-Siegelteil zum 01.07.2027 ausdrücklich am tatsächlichen Anwendungsumfang prüfen. Diese Liste ist ein aus den abgenommenen Vorbefunden abgeleiteter Prüfauftrag, keine neue Bestätigung der künftigen Rechtslage.
- **NE LJu/Justitia:** Promulgation, amtliche Inkraftsetzung, tatsächliche Instanzen-/Sitznormen und digitale Anwendbarkeit vor Übernahme frisch bestätigen. Projektbeitritt oder Ankündigung allein schliesst NE-O4 nicht.
- **Regionale und verfahrensbezogene Feiertage:** Behörden- und Partei-/Vertretungsanknüpfung, NE/Le Landeron, örtliche kantonalrechtliche Bereiche und die eigenen SO-/OW-/NW-Prozessergänzungen nicht aus einer allgemeinen kantonalen Feiertagsliste ableiten.
- **Bereits beschlossene Grenzen:** AI-Quellenkonflikt unverändert behandeln. Der historische FR-Praxisbeleg bleibt ergänzender gekennzeichneter Spiegel, die aktuelle Normgrundlage ist getrennt zu bestätigen. GR-/NE-Vorbehalte und die vier Januargrenzen bleiben getrennt.
- **Konkrete Verfahrensgrenzen:** Qualifizierte Eröffnung, angeordnete statt feste Endtermine, aktuell längere Belehrung, Stufen, Stillstand und begrenzte Kollisionen aus den abgenommenen Pfaden erhalten. AVIV-Option B und OF-001 werden nicht automatisch erledigt.
- **Periodische Prüfung:** Der spätere abgenommene R09-Stand hält den 15.11.2026 fest. Die ältere allgemeine Fachfragenliste mit 15.11.2027 wird nicht als neuerer Termin übernommen. Ob die R10-Prüfung einen periodischen Prüfschritt erfüllt, ist ausdrücklich mit Datum und Umfang zu dokumentieren, nicht still vorauszusetzen.

## Gemeinsamer Abschluss und Freigaben

R10-A2 liefert einen zusammengeführten Bericht mit vollständiger Zuordnung aller 380 Kennungen, Bewertung aller 5’045 konkreten Verwendungen, begründeten Wiederverwendungen, Fassungsbefunden, Belegbindungen und offenen Entscheiden. Die Eigentümergruppen bilden eine vollständige disjunkte Partition. Gemeinsame physische Abrufe werden darunter referenziert, nicht als fehlende Kennungen verrechnet.

Ein maschineller Vollständigkeitsprüfer kontrolliert insbesondere fehlende oder doppelte IDs, unbewertete neue Verwendungen, Beleg- und Hashbrüche, nicht begründete Wiederverwendungen und unzulässige Statusanhebungen. Materielle Änderungen erfordern zuerst die betroffenen Fachfälle und Referenzrechnungen, keinen stillen Datenpatch in der Releasevorbereitung.

David nimmt den gemeinsamen Quellenbericht menschlich ab. Erst danach wird R10-B mit konkreter Datenübernahme, Versionsbindung, lokalem Datencommit, definitiven Artefakten und Recovery aus dem tatsächlichen MVP09-Stand zur gesonderten Freigabe vorgelegt. Der Quellenprüfplan selbst autorisiert weder A2-Ausführung noch eine dieser nachfolgenden Änderungen. Header-/Cachetests bleiben gemäss Betreiberentscheid ausgeschlossen.


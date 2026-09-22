---
id: DEC-2026-023
titel: "Schweizweiter Feiertagskatalog mit begrenzter operativer Kalenderprojektion"
status: beschlossen
vorgeschlagen_am: 2026-09-22
entscheidungsdatum: 2026-09-22
klasse: B
entschieden_durch: "David Steimer"
vorgesehener_entscheider: "David Steimer"
quelle:
  - "Abgenommene Arbeitsmappe V0.12 und Arbeitsmappenvertrag 0.6.0"
  - "AP18C1, tatsächlicher Arbeitsmappenimport vom 22. September 2026"
  - "DEC-2026-014, DEC-2026-015 und DEC-2026-022"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-023: Schweizweiter Feiertagskatalog mit begrenzter operativer Kalenderprojektion

Stand: 22. September 2026. **Durch David Steimer beschlossen.** Er hat dem vorgelegten Vorschlag ausdrücklich zugestimmt und die Umsetzung beauftragt. Dies bestätigt den technischen Produktvertrag, nicht bereits die Abnahme der folgenden Implementierung oder deren Veröffentlichung und Bereitstellung.

## Ausgangslage und Ziel

AP18C1 hat die tatsächlich gespeicherte, abgenommene V0.12 in einen verlustfreien Fachkandidaten übernommen. Dieser enthält 479 Regeln, 49 Geltungsbereiche, 95 Gebietszuordnungen, 84 Quellen, 92 Verfahrensbezüge und 90 Quellenprüfungen. Die Arbeitsmappe bleibt unverändert und über ihren SHA-256 an die Abnahme gebunden.

Die bestehende Kalenderkomponente `2.0.0` beschreibt bereits eine operative Wirkung. Eine Feiertagsregel erhält dort `nonWorkingDayEquivalentToSunday`. Der schweizweite Fachbestand unterscheidet dagegen öffentliche Feiertage, arbeitsrechtliche Feiertage und verfahrensrechtlich gleichgestellte Tage. Er enthält räumliche Ein- und Ausschlüsse, Halbtage und bedingte Daten. Diese Unterschiede dürfen nicht durch eine pauschale Übernahme als prozessuale Feiertage verloren gehen.

Ziel des nächsten Releases ist die vollständige, kontrollierte schweizweite Feiertagsgrundlage zusammen mit AP17. Neue kantonale Fristenprofile, weitere VRPG-Verbindungen, eine Kalender-App und eine Karte gehören nicht zu diesem Entscheid.

## Geprüfte Optionen

| Option | Nutzen | Grenze |
| --- | --- | --- |
| Eigenständiger Feiertagskatalog mit expliziter CH-/BE-Projektion | Trennt Erfassungsbestand und wirksame Fristenkalender, erhält alle Fachinformationen und verwendet den Katalog bereits für den bestehenden Rechner | Neue Manifestrolle und gemeinsame Consumeranpassung nötig |
| Kalenderkomponente `3.0.0` für den gesamten Bestand | Ein gemeinsames Kalenderartefakt | Muss innerhalb derselben Komponente wiederum Fachbestand, räumliche Anwendbarkeit und Verfahrensfreigabe trennen. Für den begrenzten Releaseumfang unnötig breiter Eingriff in den Rechenpfad |
| Nur Arbeitsmappe oder ungenutzte JSON-Datei beilegen | Kein Eingriff in den Consumer | Veröffentlicht eine Datenbasis, integriert sie aber nicht als Feiertagsquelle der Anwendung |

Empfohlen wird die erste Option. Eine ignorierte Erweiterung des bisherigen Formats ist wegen der neuen Kernsemantik ausgeschlossen.

## Beschlossener Entscheid

### 1. Komponenten und Kompatibilitätsgrenze

| Bestandteil | Zielvertrag |
| --- | --- |
| Feiertagskatalog | Neue Komponente `1.0.0`, `dataKind: holidayCatalog`, `catalogId: ch-holiday-catalog` |
| Katalogschema | Neues `holiday-catalog-v1.schema.json` |
| Release-Manifest | Hauptformat `4.0.0`, zusätzliche Pflichtrolle `holidayCatalog` und `holidayCatalogIds` |
| Erster Format-4-Release | Genau ein Feiertagskatalog, dessen Manifest-ID und Dokument-ID übereinstimmen |
| Consumer | `minimumConsumerFormatVersion: 4.0.0` |
| Operative Kalender | Komponentenformat `2.0.0`, bestehende IDs `ch-federal-calendar` und `be-public-holidays` |
| Rechtsprofile | Format `1.0.0`, bestehende IDs `stpo`, `zpo`, `bgg`, `vwvg` und `vrpg-be` |
| AP17-Spezialregime | Komponentenformat `3.0.0`, Katalog `vrpg-be-special-regimes-ap17c` |

Diese Versionsnummern bezeichnen Datenverträge, nicht die App- oder SPFx-Paketversion. Diese werden separat für den Release festgelegt.

Die historische Unterstützung der Manifestformate 1 bis 3 bleibt erhalten. Format 4 benötigt ausdrücklich den neuen Katalog und weiterhin offene Releaseabdeckung. Alte Consumer weisen das gesamte Format-4-Release vor Aktivierung ab. Der neue Consumer behandelt jede Artefaktrolle ausdrücklich. Unbekannte Rollen dürfen nicht als Kalender interpretiert werden.

### 2. Vollständiger Fachkatalog, begrenzte Datumssprache

Der Katalog übernimmt Gemeinwesen, Geltungsbereiche, Gebietszuordnungen, Regeln, Rechtsquellen, Verfahrenshinweise, Quellenprüfungen und die nachträglichen fachlichen Festlegungen. Stabile IDs, Gültigkeitsintervalle, Priorität, Quellenfundstellen, historische Statuswerte und dokumentierte Abnahmen bleiben getrennt erhalten. Die Herkunft verweist auf die konkrete Arbeitsmappe und den Importnachweis mit Prüfsummen. Ein alter Vermerk `open` wird weder gelöscht noch als aktuelle offene Frage ausgegeben, wenn eine nachgewiesene spätere Festlegung ihn ausdrücklich beantwortet.

Die Kategorien `publicHoliday`, `labourLawHoliday` und `proceduralEquivalentDay` bleiben verschieden. Keine Kategorie bewirkt allein eine Fristverschiebung. Ebenso bleiben `fullDay` und `afternoonFromNoon` getrennt. Ein Halbtag darf weder gerundet noch zu einem ganzen prozessualen Feiertag erhoben werden.

Die zulässigen Rechentypen des Fachkatalogs sind abschliessend `fixedMonthDay`, `easterOffsetDays`, `nthWeekdayOfMonth` und `nthWeekdayOffsetDays`. Freie Formeln und aus Bezeichnungen erratene Algorithmen sind unzulässig. Hinzu kommt genau eine Kalenderbedingung pro Regel:

| Bedingung | Zulässiger Anker und Wirkung |
| --- | --- |
| `always` | Jeder unterstützte Rechentyp, unverändertes Rohdatum |
| `unlessTuesdayOrSaturday` | Nur 26. Dezember, entfällt bei Dienstag oder Samstag. Dies entspricht den bestätigten AR-/AI-Regeln |
| `onlyMonday` | Nur 2. Januar oder 26. Dezember, wird nur bei Montag erzeugt. Dies entspricht den bestätigten NE-Ersatzfeiertagen |
| `shiftHolyThursdayBy7Days` | Nur erster Donnerstag im April. Fällt dieser auf Gründonnerstag, Verschiebung um sieben Tage gemäss bestätigter GL-Regel |

Die Datumsermittlung unterscheidet `occurs`, `notApplicable` und `outsideValidity`. Ungültige Eingaben sind Fehler, keine leeren Feiertagslisten. Die Gültigkeit wird auf das nach einer Verschiebung resultierende Datum angewendet. Technische Testjahre erweitern die rechtliche Gültigkeit nicht.

### 3. Sprachen, Räume und Prüfstatus

DE, FR, IT und Rumantsch Grischun werden mit den tatsächlich abgenommenen Bezeichnungen übernommen. Dokumentierte provisorische Übersetzungen und fehlende amtliche Sprachbelege bleiben sichtbar und werden nicht zu amtlichen Fassungen erklärt. Die App bleibt vorerst zweisprachig DE/FR.

Gemeinwesen und räumliche Geltungsbereiche bleiben getrennt. Gebietshierarchien erzeugen keine automatische Feiertagsvererbung. Räumliche Mitgliedschaft folgt den gültigen Einschlüssen abzüglich der gültigen Ausschlüsse. Interne Gebiets-IDs bleiben als solche gekennzeichnet und werden nicht als amtliche Gemeindekennungen ausgegeben. Normquelle und abweichender Gebietsbeleg werden über die 29 erhaltenen Quellenverknüpfungen explizit verbunden.

Die 92 Verfahrensbezüge bleiben nicht ausführbare Fachhinweise. Die Abnahme des Erfassungsbestands ist keine pauschale Aktivierung zusätzlicher Verfahren. Quellen- und Prüfstatus gelten jeweils für ihren dokumentierten Gegenstand und Zeitraum. Ein zusammenfassender Releaseprüfstatus darf weder sämtliche Übersetzungen als amtlich noch sämtliche Verfahrensanknüpfungen als freigegeben darstellen.

### 4. Explizite CH-/BE-Projektion statt automatischer Aktivierung

Der neue Katalog enthält einen strukturierten, abschliessenden Abschnitt `calendarProjections`. Dieser ordnet ausdrücklich freigegebene Katalogregel-IDs bestehenden Kalenderregel-IDs und Kalender-IDs zu. Er enthält die benötigten Wirkungs-, Label- und Ergebnis-ID-Angaben sowie den Freigabebeleg. Die Auswahl erfolgt nicht anhand von Kantonskürzeln, Namensmustern oder historischen Exportklassen.

Für den ersten Release sind genau diese zwölf Feiertagsregeln zulässig:

| Zielkalender | Regeln |
| --- | --- |
| `ch-federal-calendar` | `CH-CAL-HOL-NATIONAL-DAY` |
| `be-public-holidays` | `BE-CAL-HOL-NEW-YEAR`, `BE-CAL-HOL-BERCHTOLD-DAY`, `BE-CAL-HOL-GOOD-FRIDAY`, `BE-CAL-HOL-EASTER`, `BE-CAL-HOL-EASTER-MONDAY`, `BE-CAL-HOL-ASCENSION`, `BE-CAL-HOL-PENTECOST`, `BE-CAL-HOL-WHIT-MONDAY`, `BE-CAL-HOL-FEDERAL-FAST`, `BE-CAL-HOL-CHRISTMAS`, `BE-CAL-HOL-ST-STEPHEN` |

Diese Regeln sind ganztägig und verwenden `always`. Die Feiertagsanteile der operativen Kalender werden deterministisch daraus abgeleitet. Beim Releasebau und beim Laden wird geprüft, dass die ausgelieferten operativen Feiertagsregeln genau dieser Projektion entsprechen. Eine abweichende oder zusätzliche operative Regel blockiert die Aktivierung. Damit ist der neue Katalog die verwendete Feiertagsquelle des bisherigen Rechners und nicht nur ein ungenutzter Anhang.

Die Kalender-IDs, Regel-IDs, Ergebnis-IDs, DE-/FR-Labels, Quellenverweise und fachlichen Berechnungswerte bleiben gegenüber dem freigegebenen CH-/BE-Referenzstand unverändert. `be-public-holidays` erbt weiterhin `ch-federal-calendar`. Die drei bestehenden Stillstandsregeln `CH-CAL-SUSP-EASTER`, `CH-CAL-SUSP-SUMMER` und `CH-CAL-SUSP-YEAR-END` sowie `ch-court-holidays` bleiben unverändert aus dem freigegebenen Kalenderbestand erhalten. Sie stammen nicht aus der Feiertagsarbeitsmappe.

Alle übrigen Katalogregeln werden technisch validiert und können für Referenztests datiert werden, erhalten aber keine operative Fristwirkung. Es entstehen keine zusätzlichen Auswahlmöglichkeiten für Fristenberechnungen. Eine spätere Aktivierung erfordert einen konkreten, fachlich abgenommenen Verfahrens- und Ortsbezug sowie dessen unterstützten Consumervertrag. Sie ist nicht durch diesen Beschluss vorweggenommen.

### 5. Bestätigte Grenzen

- **SO:** Der Halbtag am 1. Mai bleibt Fachinformation ohne Einfluss auf den Fristenlauf.
- **GR:** Die erfasste Grundlage gilt für den bestätigten Kontext kantonaler Behörden nach Art. 1 VRG unter der Annahme, dass lokale Ruhetage dort irrelevant sind. Keine Freigabe kommunaler Verfahren oder allgemeine Aussage für alle Verfahrensordnungen.
- **NE:** Zusätzliche regionale Einzelfestlegungen und gesonderte Verwaltungsschliesstage werden nicht automatisch erzeugt. Ihre mögliche Fristwirkung bleibt vorbehalten. Die wiederkehrenden festen LPA-Ergänzungen und Le Landeron bleiben im Fachbestand erhalten.
- **Rechtsebenen:** Nur Bundesrecht und kantonales Recht. Örtliche Unterschiede aus diesen Grundlagen bleiben erfasst. Eigenständiges kommunales Feiertagsrecht bleibt ausgeschlossen.
- **Funktionsumfang:** Der Release enthält die schweizweite Feiertagsgrundlage, nicht bereits einen allgemein auswählbaren gesamtschweizerischen Fristenrechner.

### 6. Nachweis, Verteilung und Fehlerverhalten

Der rund 7,9 MB grosse AP18C1-Import enthält zusätzlich alle Tabellenzellen, gespeicherten Formeln und Kontextnachweise. Dieser vollständige Zellnachweis bleibt im prüfsummengebundenen Importarchiv. Er wird nicht vollständig in den Laufzeitkatalog kopiert. Der Laufzeitkatalog bewahrt sämtliche fachlichen Entitäten und Einschränkungen mit nachvollziehbarer Herkunft. Eine Präsentations-, Layout- oder byteidentische Excel-Rückkonvertierung ist nicht Teil des Produktvertrags.

Alle wesentlichen Fachfelder sind Schemafelder, keine ignorierbaren Erweiterungen. Unbekannte Kernelemente, nicht auflösbare Referenzen, ungültige Parameter, räumliche Widersprüche oder eine inkonsistente operative Projektion führen zur Ablehnung des gesamten Releases. Ein ausdrücklich nicht aktivierter, strukturell gültiger Fachbereich ist dagegen zulässig und wird nicht als berechenbares Verfahren ausgegeben.

Der bestehende Providervertrag bleibt erhalten. Manifestrelative Pfade, SHA-256 und Byteidentität zwischen öffentlichem Release, SharePoint-Mirror und manuellem Import gelten auch für den Katalog. Teilaktualisierungen bleiben unzulässig. Bei einem neuen ungültigen Release darf nur der bisherige vollständig verifizierte Stand weiterverwendet werden, niemals eine Mischung aus alten und neuen Komponenten.

## Abnahmekriterien für AP18C

1. Schema und semantischer Validator erhalten alle Bestände und fachlichen Einschränkungen aus V0.12. Ein unabhängiger Vollständigkeitsvergleich belegt insbesondere die vier Sprachen, Quellenverknüpfungen, Halbtage und Geltungsbereiche.
2. Alle 479 Regeln werden für 2026–2028 geprüft. Zusätzliche Langzeit- und Grenztests prüfen Bedingungen, Osterarithmetik, Monats- und Jahresgrenzen, Gültigkeit sowie das Nichterzeugen bedingt entfallender Tage.
3. Der Katalog und die daraus abgeleiteten CH-/BE-Feiertagsregeln sind deterministisch. Bestehende Ergebnisse, IDs, Gerichtsferien und Rechenspuren bleiben unverändert. Abweichende Projektionen und unzulässige Zusatzregeln werden in Negativtests abgewiesen.
4. Tests belegen, dass weder arbeitsrechtliche Feiertage noch Halbtage oder blosse räumliche Zugehörigkeit zusätzliche Fristwirkungen auslösen. Nicht freigegebene Profile werden nicht auswählbar oder stillschweigend verwendet.
5. Alte Consumer lehnen Manifest 4 sicher ab. Der neue Consumer validiert die zusätzliche Rolle, alle Inhalts-IDs und die vollständige Projektionskonsistenz vor der Aktivierung. Frühere Datenreleases bleiben reproduzierbar.
6. AP17-, Kern-, UI-, Provider- und Kalenderregression bestehen gemeinsam. Archivnachweise und ihre allfälligen bestätigten Ersatzfassungen bleiben getrennt und sichtbar dokumentiert.
7. Die Web- und SPFx-Pakete bestehen die vorgesehenen SharePoint-/Teams- und öffentlichen Prüfungen im gesondert autorisierten Bereitstellungsprozess. Die technische Prüfung ersetzt keine menschliche Release- oder Betriebsfreigabe.

## Folgen und Entscheidgrenze

Der Entscheid ergänzt die komponentenweise Formatevolution von DEC-2026-014 und entwickelt den Format-3-Vertrag aus DEC-2026-015 für neue Releases weiter. Die bisherigen Formatverträge und freigegebenen Releases werden nicht nachträglich geändert oder aufgehoben. Deshalb ist keine rückwirkende Ersetzung dieser Entscheide vorgesehen.

Mit der ausdrücklichen Bestätigung werden Schema, Validator, Projektionsbuilder und Consumer innerhalb AP18C umgesetzt. WIP-Limit 1 und die Begrenzung einzelner Arbeitsschritte auf höchstens fünf Nettoarbeitstage bleiben bestehen. Die Abnahme des neuen Produktvertrags ist eine Entscheidung der Klasse B. Kandidatenbau, technische AP18C-Abnahme, Releasepromotion, Veröffentlichung und Bereitstellung bleiben unterscheidbare Schritte. Dieser Entscheid erlaubt die lokale Implementierung und den Kandidatenbau, aber keine automatische Fachabnahme, Veröffentlichung oder Bereitstellung.

Vor einer Veröffentlichung kann die Implementierung ohne produktive Datenmigration zurückgestellt werden. Der bestehende Betrieb bleibt unverändert. Nach einer Veröffentlichung erfolgen Ablösungen nur über neue versionierte Releases und nachvollziehbar dokumentierte Entscheide.

## Nachweise und Verantwortlichkeit

- [AP18C-Importvertrag und Prüfgrenzen](../architektur/import-ap18c.md)
- [AP18C1-Fachkandidat](../../data/candidates/2026-09-22-ap18c-workbook/README.md)
- [Abnahme der Arbeitsmappe V0.12](../fachrecht/abnahme-ap18b-05.md)
- [DEC-2026-014: Komponentenweise Formatevolution](DEC-2026-014-komponentenweise-fachdatenformatevolution.md)
- [DEC-2026-015: Regelbasierte Kalenderkomponente](DEC-2026-015-regelbasierte-kalenderkomponente.md)
- [DEC-2026-022: Arbeitsmappenvertrag 0.6.0](DEC-2026-022-bedingte-feiertagsregeln.md)
- [Freigegebener MVP-0.3-Referenzstand](../../data/releases/2026-08-31-mvp-03-approved.1/manifest.json)
- [AP17C-Kandidatenstand](../../data/releases/2026-09-12-ap17c-candidate.1/manifest.json)

David Steimer entscheidet und verantwortet die menschliche Fach-, Architektur- und Releasefreigabe. Codex bereitet Vertrag, Implementierung und Prüfnachweise vor, übernimmt aber keine formelle Freigabe- oder Haftungsverantwortung.

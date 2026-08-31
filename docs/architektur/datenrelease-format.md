# Datenrelease-Format

| Merkmal | Wert |
| --- | --- |
| Arbeitspaket | AP5, AP11B und AP12C |
| Formatversion | 1.0.0, 2.0.0 und 3.0.0 |
| Schema-Dialekt | JSON Schema Draft 2020-12 |
| Zeichenkodierung | UTF-8 |
| Datumsmodell | ISO-Vollformat `JJJJ-MM-TT`, ohne Uhrzeit und Zeitzone |
| Integritätsprüfung | SHA-256 über die exakten Dateibytes |
| Format-1-Referenzrelease | `data/releases/2026-08-29-ap5-approved.1` |
| Format-2-Referenzrelease | `data/releases/2026-08-30-ap11b-approved.1` |
| Format-3-Kandidat | `data/releases/2026-08-31-ap12c-candidate.1` |
| Freigaben | David Steimer, 29. und 30. August 2026 |
| Architekturentscheide | [DEC-2026-012](../entscheidungen/DEC-2026-012-providerneutrales-datenrelease-format.md) und [DEC-2026-015](../entscheidungen/DEC-2026-015-regelbasierte-kalenderkomponente.md), beide beschlossen |

## 1. Ziel und Abgrenzung

Das Format transportiert versionierte Rechtsprofile, Feiertage, Stillstandsperioden, Quellenmetadaten und Prüfstatus. Es ist unabhängig davon, ob die Dateien aus GitHub, einem SharePoint-Mirror oder einem manuellen Import stammen.

Das Format berechnet keine Frist und klassifiziert keinen Sachverhalt. Es beschreibt deterministische Eingaben für den späteren Rechenkern. Unklare Zustellungen, unbekannte Spezialgesetze und nicht bestimmte Verfahrensvarianten bleiben sichtbare Voraussetzungen oder Sperrgründe.

## 2. Releaseaufbau

```text
<release-id>/
├── manifest.json
├── profiles/
│   ├── bgg.json
│   ├── stpo.json
│   ├── vrpg-be.json
│   ├── vwvg.json
│   └── zpo.json
└── calendars/
    ├── be-public-holidays.json
    └── ch-federal-calendar.json
```

Das Manifest ist der einzige Einstiegspunkt. Es listet jedes Nutzartefakt mit relativem Pfad, Rolle, Inhalts-ID, Schema-ID, Medientyp, Dateigrösse und SHA-256-Prüfsumme. Nicht gelistete JSON-Dateien und gelistete, aber fehlende Dateien machen das Release ungültig.

Format 2.0.0 ergänzt den Baum um genau eine neue Artefaktrolle:

```text
<release-id>/
└── special-regimes/
    └── vrpg-be.json
```

Das Manifest muss dazu `specialRegimeCatalogIds` und mindestens ein Artefakt der Rolle `specialRegimeCatalog` enthalten. Format 1.0.0 darf diese Felder nicht enthalten. Dadurch bleibt die Hauptversion eindeutig und ein Format-1-Consumer kann den neuen Bestand sicher ablehnen.

Ab Format 2 bezeichnet `coverage` den gesamten zeitlichen Horizont, in dem mindestens ein Releasebestandteil rechnen darf. Ein einzelnes allgemeines Rechtsprofil kann mit `validity.dataValidFrom` oder `dataValidTo` enger begrenzt sein. Der Consumer muss deshalb zuerst die Release- und Kalenderabdeckung und danach die Gültigkeit des konkret verwendeten Profils oder der Fristdefinition prüfen. Diese Präzisierung erlaubt die abgenommenen Spezialfälle aus dem Frühjahr 2026, ohne den allgemeinen AP5-Profilen rückwirkend eine frühere Datengültigkeit zuzuschreiben.

Format 3.0.0 ersetzt die endlichen Kalenderlisten durch die Kalenderkomponente 2.0.0. Die Verzeichnisstruktur und die Artefaktrolle `calendar` bleiben erhalten. Das Manifest verweist für diese Artefakte jedoch zwingend auf `calendar-rules-v2.schema.json`. Die Releaseabdeckung besitzt ein Anfangsdatum und `to: null`. Format 1 und Format 2 verlangen weiterhin ein konkretes Enddatum.

Die offene Format-3-Abdeckung hebt keine fachliche Gültigkeitsgrenze auf. Rechtsprofile, Fristdefinitionen, Kalenderregeln und Overrides behalten ihre eigenen Gültigkeitsangaben. Ein Consumer erzeugt den Kalender nur für einen endlichen, aus der konkreten Berechnung abgeleiteten Arbeitsbereich.

Das Manifest enthält keine Prüfsumme über sich selbst. Seine Vertrauenswürdigkeit muss durch den freigegebenen Abrufort und später allenfalls durch eine zusätzliche Signatur abgesichert werden. Die Artefaktprüfsummen verhindern, dass ein Manifest mit nur teilweise oder verändert geladenen Nutzdaten aktiviert wird.

Der Format-1-Referenzbestand wurde mit einer neuen Release-ID aus dem technisch validierten Candidate abgeleitet. Die fachlichen Regeln, Feiertage und Stillstandsperioden blieben unverändert. Der Prüfstatus der sieben Nutzartefakte wurde auf `verified` gesetzt und mit neuen Prüfsummen versehen.

Der Format-2-Referenzbestand wurde ebenfalls unter einer neuen Release-ID aus dem validierten AP11B-Kandidaten abgeleitet. Seine acht Nutzartefakte und ihre Prüfsummen sind byteidentisch mit dem Kandidaten. Das neue Manifest dokumentiert den Status `approved` und die menschliche Freigabe im qualifizierten Erweiterungsfeld `steimer.approval`. Beide Kandidaten bleiben unverändert erhalten.

## 3. Schemata

| Schema | Zweck |
| --- | --- |
| `common.schema.json` | Gemeinsame Typen für Gültigkeit, Abdeckung, Quellen, Prüfstatus, Bedingungen und Erweiterungen |
| `legal-profile.schema.json` | Rechtsprofil, Berechnungsvertrag, Feiertagsanknüpfung, explizite Selektoren und typisierte Regeleffekte |
| `calendar.schema.json` | Feiertage, Kalendervererbung und inklusive Stillstandsperioden |
| `calendar-rules-v2.schema.json` | versionierte Feiertags- und Stillstandsregeln, Vererbung und explizite Overrides |
| `deadline-definition.schema.json` | berechnete Fristdefinitionen R1 bis R4 oder behördlich gesetzte Termine ohne Rechenoperation |
| `filing-profile.schema.json` | Wahrungsmodus, Kanäle, Nachweise, Original, Annahmeschluss und Zeitzone |
| `special-regime-catalog-v2.schema.json` | Spezialregime, Komponentenprofile, Gates, Übersteuerungen und Sichtbarkeitsvertrag |
| `release-manifest.schema.json` | Releasekopf, Providervertrag, Kompatibilität und Artefaktprüfsummen |

Alle Kernobjekte weisen unbekannte Felder ab. Unbekannte Regeltypen sind nicht zulässig. Freie Erweiterungen dürfen nur unter `extensions` stehen und benötigen einen qualifizierten Schlüssel wie `steimer.example`.

## 4. Rechtsprofile

Ein Rechtsprofil enthält:

- stabile Profil- und Regel-IDs
- Gemeinwesen und Erlasskürzel
- Gültigkeit und fachlichen Prüfstatus
- ausschliesslich Tagesfristen im MVP
- die Bedeutung des Eingabedatums als rechtlich massgebendes Zustellungs- oder Ereignisdatum
- Feiertagsanknüpfung, Konfliktbehandlung und begründbare manuelle Übersteuerung
- explizite Selektoren für Verfahrensvarianten, Sachgebiete und Zustellungsarten
- typisierte Regeleffekte mit Quelle und genauer Fundstelle

Der Referenzbestand übernimmt alle 47 Arbeits-IDs aus AP4. Selektoren werden nicht aus Freitext erraten. Eine unbekannte oder nicht bestätigte Variante blockiert die betroffene Automatik.

## 5. Kalender

Ein Kalender der Formate 1 und 2 enthält:

- eine stabile Kalender-ID und ein Gemeinwesen
- einen lückenlosen Abdeckungszeitraum
- optional geerbte Kalender
- Feiertage als konkrete ISO-Daten
- Stillstandssätze mit inklusiven Anfangs- und Enddaten
- Quellen und Prüfstatus

Der bernische Kalender erbt den eidgenössischen Bundesfeiertag aus dem Bundeskalender. Dadurch wird der 1. August nicht doppelt gepflegt. Die Stillstandsperioden des Bundes werden separat über stabile Stillstandssatz-IDs referenziert und nicht automatisch auf jedes Rechtsprofil angewandt.

Ein Format-3-Kalender enthält statt konkreter Jahresdaten:

- versionierte Regeln für Fixdaten, Osterabstände, bestimmte Wochentage und relative Perioden
- eine nach oben offene fachliche Gültigkeit
- Vererbung auf Ebene der Regelkalender
- quellenbelegte Add-, Suppress- und Replace-Overrides
- stabile Stillstandssatz- und Rechtsprofilreferenzen

Der Consumer validiert zuerst den gesamten Bestand. Anschliessend erzeugt der hostneutrale Generator für jede Berechnung einen endlichen Arbeitskalender. Ein Fehler in Regelauflösung, Gültigkeit, Vererbung oder Overridebehandlung verwirft den Kandidaten oder blockiert die Berechnung. Es gibt keinen stillen Rückfall auf konkrete Vorjahreslisten.

## 6. Aktivierungsablauf

Ein Consumer aktiviert ein Release nur atomar:

1. Manifest vollständig laden.
2. Manifest gegen die unterstützte Schemaversion prüfen.
3. Hauptversion und Kompatibilitätsregeln prüfen.
4. Sämtliche gelisteten Artefakte über manifestrelative Pfade laden.
5. Dateigrösse und SHA-256 jedes Artefakts prüfen.
6. Jedes Artefakt gegen sein Schema prüfen.
7. Quellenverweise, Regel-IDs, Kalendervererbung, Gültigkeit, Abdeckung und profilübergreifende Referenzen prüfen.
8. Bei Format 3 alle Kalenderregeln, Overrides und Stillstandssatz-Referenzen auflösen und eine repräsentative Kalendererzeugung durchführen.
9. Erst nach vollständigem Erfolg den bisherigen Datenstand ersetzen.
10. Bei jedem Fehler den neuen Stand verwerfen und den letzten vollständig validierten Stand beibehalten.

Ein Teilrelease, ein Mischstand aus zwei Release-IDs oder ein ungeprüfter Netzwerkabruf darf nie an den Rechenkern gelangen.

## 7. Providervertrag

GitHub- und SharePoint-Provider unterscheiden sich nur in der Beschaffung:

```text
ReleaseProvider
  ├── loadManifest(releaseId)
  └── loadArtifact(manifestRelativePath)
```

Beide Provider liefern unveränderte Bytes. Validierung, Aktivierung, Fallback und Berechnung liegen ausserhalb des Providers. Für den SharePoint-Mirror sind Dateien in einer Dokumentbibliothek vorgesehen. Listenfelder, Versionsspalten und tenantinterne Metadaten dürfen das Releaseformat nicht verändern.

Der manuelle Import verwendet denselben Vertrag. Er ist kein schwächer geprüfter Sonderweg.

## 8. Versionierung und Rückwärtskompatibilität

Formatversion und Datenrelease sind getrennt:

- `formatVersion` bezeichnet Struktur und Semantik des Austauschformats.
- `releaseId` bezeichnet einen unveränderlichen konkreten Datenstand.
- Eine Datenkorrektur ohne Schemaänderung erhält nur eine neue Release-ID.
- Eine rückwärtskompatible Formatpräzisierung erhöht die Neben- oder Fehlerkorrekturversion.
- Neue Pflichtfelder, geänderte Kernsemantik oder neue, für alte Consumer unverständliche Regelarten erhöhen die Hauptversion.
- Consumer weisen unbekannte Hauptversionen und unbekannte Kernfelder ab.
- Transportierbare Zusatzinformationen ohne Einfluss auf die Kernberechnung gehören in `extensions`.

Ein altes Release wird nicht nachträglich geändert oder gelöscht. Ein fehlerhaftes Release kann im Folge-Manifest als zurückgezogen bezeichnet werden. Die konkrete Widerrufs- und Vertrauenskette wird vor dem produktiven Feed festgelegt.

## 9. Validierung und Fehlerklassen

Der AP5-Validator prüft:

- die Schemata gegen den Metaschema-Dialekt
- JSON-Syntax und Schemaeinhaltung
- sichere relative Pfade
- Vollständigkeit der Manifestliste
- Dateigrössen und SHA-256-Prüfsummen
- eindeutige Profil-, Regel-, Quellen-, Kalender-, Feiertags- und Perioden-IDs
- lokale Auflösung aller Quellenverweise
- Übereinstimmung von Zählmodus und Stillstandsregeln
- Übereinstimmung von Feiertagsanknüpfung und Profilkonfiguration
- Selektoren, Optionen und Bedingungen
- Kalenderabdeckung, Vererbung und Zyklen
- Stillstandsreferenzen und Profilbezüge
- Reihenfolge und Überlappung von Stillstandsperioden
- feste und bewegliche Feiertagsdaten für den Referenzbestand 2026 bis 2028

Beim Format-1-Referenzrelease beweisen sechs Negativtests, dass Prüfsummenfehler, doppelte Regeln, unaufgelöste Quellen, unbekannte Regelarten, verkehrte Periodengrenzen und fehlende Kalendervererbung abgewiesen werden.

Beim Format-2-Referenzrelease kommen drei Manipulationen hinzu. Die entfernte Rechenart `R5_FIXED`, ein sichtbar geschalteter Behörden-Termin und ein zwischen Regime und Definition widersprüchliches Einreichungsprofil müssen scheitern. Der Validator prüft zudem, dass der Katalog genau 26 berechnete und 3 behördlich gesetzte Definitionen enthält.

Beim Format-3-Kandidaten prüft der Validator zusätzlich offene Abdeckung, Kalenderkomponente 2.0.0, Kalenderregeltypen, Vererbung, Gültigkeit, Overrides, Quellenbezüge und sämtliche Stillstandssatz-Referenzen. Neun gezielte Negativmutationen müssen abgewiesen werden. Ein separater Migrationsvalidator bestätigt zwei byteidentische AP12A-Kalender, 15 Regeln, null alte und neun neue Stillstandssatz-Referenzen.

## 10. Qualitäts- und Sicherheitsgrenzen

Formale Validität ist keine juristische Richtigkeit. Ein gültiges Schema kann eine fachlich falsche Regel enthalten. Deshalb bleiben die quellenbasierte Prüfung aus AP4, die Golden Cases aus AP6 und die menschliche Freigabe zwingend.

SHA-256 erkennt veränderte Artefakte, authentifiziert aber den Herausgeber nicht. Für den öffentlichen Pilot wird der freigegebene GitHub-Abrufort verwendet. Vor dem produktiven tenantübergreifenden Betrieb ist eine zusätzliche Signatur, eine tenantinterne Vertrauenskette oder eine gleichwertige Absicherung zu prüfen.

## 11. Standards

JSON Schema Draft 2020-12 ist die aktuell veröffentlichte Fassung der offenen Schemaspezifikation. Das Datumsformat folgt dem Vollformat aus RFC 3339. SHA-256 ist im Secure Hash Standard dokumentiert.

Für dieses spezialisierte Regel- und Kalenderpaket besteht kein unmittelbar passender eCH-Austauschstandard. Die Lösung verwendet deshalb offene, plattformneutrale Standards. Diese begrenzte Abweichung berührt die übrigen eCH-Ziele des Projekts nicht.

- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12)
- [RFC 3339](https://www.rfc-editor.org/info/rfc3339)
- [NIST FIPS 180-4](https://csrc.nist.gov/pubs/fips/180-4/upd1/final)

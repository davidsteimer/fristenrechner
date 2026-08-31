# Komponentenmodell für VRPG-Spezialregime

| Merkmal | Wert |
| --- | --- |
| Arbeitspaket | AP11A und AP11B, GitHub-Issues #28 und #29 |
| Status | AP11A und AP11B abgenommen, Format-2-Referenzrelease freigegeben |
| Stand | 30. August 2026 |
| Basis | AP5-Format 1.0.0 und AP6-Testvertrag 1.0.0 |
| Architekturentscheid | [DEC-2026-014, beschlossen](../entscheidungen/DEC-2026-014-komponentenweise-fachdatenformatevolution.md) |

## 1. Ziel

Das Modell soll die bekannten Spezialregime zum bernischen VRPG abbilden, ohne den Rechenkern in eine Sammlung einzelner Gesetzesfälle zu verwandeln. Es trennt fachliche Auswahl, Berechnung, Kalender, Fristenstillstand, Fristwahrung, Warnungen und Sperren in eigenständig validierbare Komponenten.

## 2. Aufbau

```text
Spezialregime
  ├── Terminherkunft CALCULATED oder AUTHORITATIVE
  │     ├── CALCULATED: Rechenregel R1 bis R4
  │     │     └── ein oder mehrere typisierte Anker
  │     └── AUTHORITATIVE: Datum, Uhrzeit und amtliche Quelle
  ├── Kalenderprofil
  ├── Stillstandsprofil
  ├── Einreichungsprofil F0 bis F5
  ├── optionale Prüfschranke G1
  ├── optionale rechtliche Übersteuerung
  └── Quellen, Gültigkeit und Prüfstatus
```

Ein Regime ist eine Konfiguration dieser Bausteine. Die Rechenregel kennt nur die für die Berechnung erforderlichen Eingaben. Ein autoritativ festgelegter Termin ist keine Rechenregel. Er wird als Hintergrundwert mit Quelle und Gültigkeit geführt. Das Einreichungsprofil entscheidet getrennt, ob Aufgabe, Eingang, Originaleingang, eingeschriebene Aufgabe oder elektronische Quittung massgebend ist.

## 3. Schemata

| Schema | Vertrag |
| --- | --- |
| [`deadline-rule.schema.json`](../../schemas/deadline-rule.schema.json) | unveränderter AP11A-Ausgangsvertrag mit R1 bis R4 und dem provisorischen Übergangsabbild `R5_FIXED` |
| [`deadline-definition.schema.json`](../../schemas/deadline-definition.schema.json) | AP11B-Vertrag mit getrennter Terminherkunft, ausschliesslich R1 bis R4 für `CALCULATED` und einer quellenpflichtigen Definition ohne Rechenoperation für `AUTHORITATIVE` |
| [`filing-profile.schema.json`](../../schemas/filing-profile.schema.json) | Fristwahrungsmodus, Kanäle, Nachweise, Originalerfordernis, Uhrzeit und Zeitzone |
| [`special-regime-catalog.schema.json`](../../schemas/special-regime-catalog.schema.json) | unveränderter AP11A-Ausgangskatalog |
| [`special-regime-catalog-v2.schema.json`](../../schemas/special-regime-catalog-v2.schema.json) | AP11B-Katalog mit Fristdefinitionen, Sichtbarkeitsvertrag und allen lokalen Referenzen |
| [`special-golden-case-suite.schema.json`](../../schemas/special-golden-case-suite.schema.json) | Testvertrag 2.0 für mehrere Datumswerte, Uhrzeiten, Ganzzahlparameter, Gates und Fristwahrung |

Die Schemata verwenden JSON Schema Draft 2020-12 und weisen unbekannte Kernfelder sowie unbekannte Rechenarten ab.

`R5_FIXED` bleibt nur im AP11A-Ausgangsbestand erhalten, damit dessen fachliche Abnahme reproduzierbar bleibt. Im AP11B-Releaseformat 2.0.0 ist die Rechenart unzulässig. Die drei betroffenen Regeln wurden in eigenständige Definitionen der Herkunft `AUTHORITATIVE` überführt. Solche Definitionen besitzen keine Rechenoperation und ihre Regime müssen `uiExposure: hidden` tragen.

## 4. Verhältnis zum AP5-Release

Das freigegebene AP5-Release `2026-08-29-ap5-approved.1` bleibt unverändert. Der AP11A-Katalog liegt weiterhin unter `data/candidates/` und wird von keinem Release-Manifest referenziert.

AP11B erzeugt den Kandidaten `2026-08-30-ap11b-candidate.1` und den daraus byteidentisch abgeleiteten Referenzrelease `2026-08-30-ap11b-approved.1` mit der Hauptversion 2.0.0 und der zusätzlichen Manifestrolle `specialRegimeCatalog`. Alte Consumer müssen die unbekannte Hauptversion ablehnen. Der hostneutrale Loader akzeptiert die Versionen 1 und 2. GitHub, SharePoint-Mirror und manueller Import bleiben byteidentische Provider desselben Releases.

Der Referenzrelease ist fachlich und technisch abgenommen, aber weder produktiv aktiviert noch im SPFx-Paket ausgeliefert. Dadurch bleibt die technische Formatevolution von der späteren UI- und Tenantfreigabe getrennt.

## 5. Verhältnis zum ewigen Kalender

Die Spezialregeln referenzieren stabile Kalenderprofil-IDs. Sie speichern keine Feiertage und erzeugen keine konkreten Jahreskalender. Dadurch kann ein späterer ewiger Kalender die Implementierung hinter derselben Schnittstelle ersetzen, ohne die Spezialregime neu zu modellieren. AP11A nimmt den Entscheid zu Backlog-Item #26 nicht vorweg.

## 6. Testvertrag 2.0

Der AP6-Testvertrag 1.0 akzeptiert ein rechtlich massgebendes Datum und eine positive Frist in Tagen. Er kann folgende AP11A-Fälle nicht korrekt ausdrücken:

- Fristen vor einem Wahltag
- erster bestimmter Wochentag nach einem Ereignis
- zwei konkurrierende Anknüpfungen
- autoritativ festgelegte Hintergrunddaten mit Datum, Uhrzeit und Quelle
- Originaleingang bis zu einer bestimmten Uhrzeit
- eine materielle Prüfschranke nach dem berechneten Ergebnis

Das neue Schema 2.0 erweitert deshalb nur den Spezialfall-Testvertrag. Es enthält benannte Datums-, Uhrzeit- und Ganzzahleingaben sowie getrennte Erwartungen für provisorisches und endgültiges Fristende, Fristwahrung, Gates und Rechenspur. Die 15 abgenommenen AP6-Fälle bleiben unverändert unter Version 1.0.

## 7. Validierung

Die AP11A- und AP11B-Validatoren prüfen getrennt:

- alle Schemata gegen das Metaschema
- positive und negative Schema-Beispiele
- eindeutige IDs und auflösbare lokale Referenzen
- zulässige Kombinationen von Regimestatus und Rechenregel
- Anker, Kalender-, Stillstands-, Einreichungs-, Gate- und Übersteuerungsreferenzen
- die vier fachlichen Rechenarten und das provisorische `R5_FIXED`-Abbild gegen den unveränderten AP11A-Ausgangsvertrag
- im AP11B-Vertrag ausschliesslich R1 bis R4 sowie die strukturelle Trennung von `CALCULATED` und `AUTHORITATIVE`
- Wochenend- und Feiertagsverschiebungen gegen das abgenommene AP5-Kalenderrelease
- Fristwahrung mit Datum, Uhrzeit und Originalerfordernis
- genau acht fachlich abgenommene synthetische Fälle
- semantische Negativtests für unbekannte Regeln, doppelte IDs, unbekannte Anker und gesperrte Regime

Der AP11B-Releasevalidator prüft zusätzlich Manifestrolle, Prüfsummen, Komponentenreferenzen, die Herkunftsverteilung von 26 berechneten und 3 behördlich gesetzten Definitionen sowie den Sichtbarkeitsvertrag. Neun Manipulationen müssen scheitern. Eine unabhängige Python-Gegenrechnung bestätigt 8 von 8 Golden Cases. TypeScript-Vertragstests bestätigen, dass offene Behörden-Termine kein Fristresultat erzeugen.

## 8. Aktivierungs- und Fehlerverhalten

| Zustand | Verhalten |
| --- | --- |
| `supported` | Berechnung zulässig, solange alle verlangten Eingaben vorliegen |
| `open` | keine abschliessende Berechnung, fehlende Voraussetzung sichtbar ausweisen |
| `blocked` | Berechnung verweigern und Sperrgrund anzeigen |
| berechnete feste Frist mit `manualReview` | Termin aus einem Ereignis berechnen, aber nicht als abschliessend ausgeben, bis die Wahlanordnung geprüft ist |
| Terminherkunft `AUTHORITATIVE` | Termin mit amtlicher Quelle im Hintergrund führen, nicht berechnen und im MVP nicht als Fristtyp anzeigen |
| Übersteuerung mit Warnpflicht | gesetzliche Abweichung anwenden und ihre Herleitung sichtbar anzeigen |

Das Modell enthält keinen stillen Fallback vom Spezialregime auf die allgemeine VRPG-Frist.

## 9. Standards

Für diesen spezialisierten Regelkatalog besteht kein unmittelbar passender eCH-Austauschstandard. Die Lösung verwendet deshalb JSON, JSON Schema Draft 2020-12, ISO-Datumswerte, IANA-Zeitzonen und sprachneutrale Schlüssel. Die Abweichung ist auf das interne Fachdatenformat begrenzt. Für Barrierefreiheit, Betrieb und spätere Verwaltungsschnittstellen bleiben einschlägige eCH-Standards massgebend.

## 10. Technischer AP11B-Nachweis

| Bestandteil | Umsetzung |
| --- | --- |
| Releaseformat | 2.0.0, zusätzliche Rolle `specialRegimeCatalog`, Format 1 bleibt validierbar |
| Rechenkern | `calculateSpecialDeadline`, synchron, deterministisch und ohne Hostabhängigkeiten |
| Datumsmodell | reine gregorianische Arithmetik für Tage, Monate und Wochentage ohne JavaScript-`Date` |
| Einreichung | F0 bis F5 mit Wahrungsmodus, Kanälen, Nachweisen, Original, Annahmeschluss und Zeitzone |
| Schutzverhalten | blockiert offene, gesperrte, autoritative, unvollständige und widersprüchliche Konfigurationen |
| Nachvollziehbarkeit | Release, Katalog, Regime, Definition, Herkunft und Komponentenprofile im Resultat sowie lückenlose Rechenspur |
| Regression | bestehende AP5-, AP6-, AP8- und AP9-Tests unverändert grün |
| Unabhängige Kontrolle | Python-Gegenrechnung und Negativmutationen ohne Verwendung des TypeScript-Kerns |

Die Detailbefehle, der Abnahmestatus und die Abgrenzung zur noch offenen UI- und SPFx-Integration stehen im [README des freigegebenen AP11B-Releases](../../data/releases/2026-08-30-ap11b-approved.1/README.md).

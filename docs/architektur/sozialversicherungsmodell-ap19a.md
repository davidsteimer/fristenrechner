# AP19A: Nationales Sozialversicherungsmodell mit begrenzter Freigabe

Stand: 25. September 2026. **Fach- und Architekturentwurf, keine Produktintegration.** Die Leitplanke «nationale Modellierung, zunächst bernische Freigabe» ist beschlossen. Die nachfolgende konkrete Strukturprobe ist weder ein abgenommener Produktvertrag noch eine fachliche Freigabe der neuen Berechnungspfade.

## Ziel und verbindliche Trennung

Bundesrechtliche Regeln werden einmal kantonsunabhängig modelliert. Ein späterer Kanton ergänzt und prüft seine Anbindung, statt die Bundesregel zu kopieren oder Bern-Konstanten im Rechenkern umzuschreiben. Eine nationale Regel ist für sich allein noch kein schweizweit freigegebenes Verfahren.

| Schicht | Inhalt | Darf nicht bewirken |
| --- | --- | --- |
| `federalRules` | Spezialerlass und ATSG-Anwendung, abgegrenzeter Verfahrensgegenstand, Handlung, Stadium, Fristform, Auslöser, Eröffnung, bundesrechtliche Anknüpfungsart und Normspur | Keine Festlegung auf `BE`, `vrpg-be` oder `be-public-holidays`. Keine Freischaltung aufgrund des Gesetzesnamens allein |
| `cantonalBindings` | Konkreter Verfahrenskontext, ergänzendes kantonales Verfahrensrecht, zuständige Stelle und explizite Verbindung zum verfahrensbezogen geprüften Feiertagsraum | Keine automatische Vererbung von Behördensitz, kantonaler Feiertagsliste oder Mitgliedschaft in einer Gebietshierarchie |
| `releaseEligibility` | Abschliessende Freigabe je Regel, Anbindung, Gültigkeit und Kalenderprojektion mit menschlichen Abnahmebelegen | Weder nationale Erfassung noch eine strukturell vollständige Anbindung dürfen eine Freigabe ersetzen |

Diese Trennung ist fachlich. Ob die späteren Produktdaten in einer oder mehreren Dateien liegen, wird erst im technischen Vertragsentscheid festgelegt. AP19A beschliesst ausdrücklich keine neue Formatnummer.

## Ausgangspunkt im bestehenden Produkt

Die heutigen Einschränkungen sind absichtlich streng, nicht versehentlich zu eng:

- [Spezialregimekatalog v3](../../schemas/special-regime-catalog-v3.schema.json) erlaubt für qualifizierte Pfade die Erlasse `ivg`, `ahvg`, `uvg` und `ivob` sowie ausdrücklich `authorityCode: BE` und `holidayCanton: BE`.
- [QualifiedApplicability](../../src/core/qualifiedTypes.ts) und [gemeinsame Anwendbarkeitsprüfung](../../src/core/qualifiedApplicability.ts) übernehmen diese Grenzen. Oberfläche und direkte Kernaufrufe benutzen dieselbe Prüfung.
- Die [VRPG-Auswahl](../../src/ui/vrpgSelection.ts) aktiviert nur bekannte, geprüfte Zuordnungen. Eine ähnlich benannte Datenregel genügt nicht.
- Der schweizweite Feiertagskatalog ist bereits vorhanden. Seine operative Projektion ist nach [DEC-2026-023](../entscheidungen/DEC-2026-023-schweizweiter-feiertagskatalog.md) jedoch auf die ausdrücklich freigegebenen CH-/BE-Regeln beschränkt.

Eine produktive Erweiterung muss diese Verträge kontrolliert weiterentwickeln. Sie darf weder die heutigen Konstanten einfach durch beliebige Zeichenfolgen ersetzen noch die Grenzen über ignorierte Zusatzfelder umgehen. [DEC-2026-014](../entscheidungen/DEC-2026-014-komponentenweise-fachdatenformatevolution.md) und [DEC-2026-020](../entscheidungen/DEC-2026-020-qualifizierter-spezialregimekatalog-v3.md) bleiben massgeblich. Ein allfälliger neuer Produktvertrag, neue Formatversionen und die Migration benötigen einen gesonderten Entscheid.

## Nationaler Fachvertrag als Vorschlag

### Bundesregel

Die Identität einer Bundesregel beginnt mit `CH-SOC-…`, nicht mit einem Kantonskürzel. Der Spezialerlass und sein Anwendungsbereich stehen vor der ATSG-Anknüpfung. Ein einzelner Erlass kann mehrere rechtlich unterschiedliche Pfade und ausdrückliche Ausschlüsse haben.

Jede spätere ausführbare Regel benötigt mindestens:

1. Spezialerlass, Anwendungsbereich und Normspur einschliesslich der anwendbaren Verweisungsnormen.
2. Handlung und Stadium. Einsprache, Beschwerde, Beschwerdeverbesserung und laufendes Verfahren sind keine austauschbaren Begriffe.
3. Fristform, rechtlich qualifizierten Auslöser und unterstützte Eröffnungsart.
4. Verweise auf die bereits typisierten Rechen-, Stillstands- und Fristwahrungskomponenten. Keine freien Formeln und keine neue Rechenengine.
5. Rechtliche Gültigkeit und Übergangsrecht getrennt von technischer Fallabdeckung und Quellenprüfdatum.
6. Bundesrechtliche Anknüpfungsart für Feiertage, ohne daraus einen konkreten Kanton abzuleiten.

Die AP19A-Strukturprobe enthält absichtlich **keine Fristdauer und kein berechnetes Datum**. `calculationParameters: null` verhindert, dass die Strukturbeispiele als freigegebene Rechenregeln gelesen werden. Das Modelltestfenster 2026–2027 ist kein behauptetes Inkrafttreten oder Ausserkrafttreten eines Gesetzes.

### Kantonale Anbindung und Feiertage

Verfahrenskanton und Feiertagskanton sind unabhängige Angaben. Die Feiertagsauflösung benötigt einen für das Verfahren qualifizierten Anknüpfungspunkt, beispielsweise Partei oder Vertretung, sowie den passenden Geltungsbereich. Unklarheit oder Konflikt führt zur Sperre, nicht zum Rückfall auf den Behördensitz oder auf Bern.

Örtliche Angaben werden nur verlangt, soweit Bundesrecht oder kantonales Recht im konkreten Verfahren eine räumliche Differenzierung relevant machen. Ein Kantonskürzel allein genügt dann nicht. Eigenständiges kommunales Feiertagsrecht bleibt ausserhalb des beschlossenen Umfangs.

Im künftigen Produkt muss eine Kalenderverbindung auch Normbezug, räumliche Gültigkeit, operativen Projektionsstatus und Abdeckung des benötigten Zeitraums binden. Die Mini-Probe verwendet dafür nur deutlich benannte `MODEL-…`-Räume. Sie enthält keine echten Kalenderprofil-IDs und erzeugt keine operative Projektion.

### Freigabe

Die erste geplante Produktfreigabe bleibt auf Bern begrenzt. Auch Bern ist in AP19A erst Entwurf. Erforderlich sind getrennte Nachweise für Bundesrecht, kantonale Anbindung, Kalenderprojektion, technischen Produktvertrag, Referenzfälle und konkrete Releasefreigabe.

Eine vollständige Modellstruktur liefert in der Probe daher ausschliesslich:

- `candidate-not-approved` bei einer bernischen Entwurfsanbindung
- `outside-initial-release` bei einer ausserkantonalen Modellprobe
- `blocked-input` bei fehlenden, widersprüchlichen oder nicht modellierten Voraussetzungen

`runtimeActive` bleibt in sämtlichen Fällen `false`. Es gibt keinen Erfolgszustand «berechenbar» und keine automatische Aktivierung einer kantonalen Anbindung.

## Ausführbare, nicht produktive Strukturprobe

[Kandidatendatei](../../tests/golden/candidates/ap19a-national-model.json), [Prüfskript](../../scripts/check-ap19a-model.mjs) und [Governance-Tests](../../tests/governance/ap19a-model.test.mjs) stehen ausserhalb des produktiven Daten- und Quellpfads. Die Probe ist ohne zusätzliche Bibliotheken separat mit Node ausführbar:

```sh
node scripts/check-ap19a-model.mjs
node --test tests/governance/ap19a-model.test.mjs
```

Zwei nationale ELG-Strukturbeispiele verwenden die Verknüpfung ELG Art. 1 und ATSG Art. 2, 38, 52 beziehungsweise 56 und 60. Die Artikelverweise sind eine zu prüfende Normspur, kein vollständiger oder abgenommener Rechtsnachweis. Die Quellen bleiben `not-approved`.

| Nachweis | Bedeutung |
| --- | --- |
| Gleiche Einsprache-Bundesregel mit BE-, ZH- und AG-Anbindung | Kantonswechsel benötigt keine Kopie der Bundesregel |
| ZH und AG bei vollständiger Struktur weiterhin gesperrt | Nationale Modellierbarkeit ist keine schweizweite Freigabe |
| BE-Verfahren mit ZH-Feiertagsraum, nur in einem In-memory-Test ausdrücklich ergänzt | Verfahrens- und Feiertagskanton sind technisch nicht zwangsläufig gleich. Kein Nachweis der rechtlichen Anwendbarkeit |
| Synthetischer regionaler AG-Raum | Ein benötigter Ortsbezug muss vorhanden und eindeutig zugeordnet sein. Keine Behauptung einer konkreten AG-Verfahrensregel |
| Fehlende Normspur, Erlass, Datum, Eröffnung oder Feiertagsraum | Sperre statt Rückfall auf VRPG oder BE |
| Unbekannte Felder, ungültige Daten, doppelte IDs und gebrochene Verweise | Gesamte Probe wird abgewiesen |
| Mutierte Freigaben oder gesetzte Produktformatnummer | AP19A-Strukturprobe darf nicht durch Datenänderung zur Produktfreigabe werden |

**Prüfgrenze:** Der Inaktivitätsnachweis kontrolliert fehlende AP19A-Verweise im Laufzeitquellbestand, in den vorhandenen Release-Manifesten und in `package.json`. Zusammen mit ausschliesslich falschen Aktivierungsflags und dem separaten Ausführungspfad belegt dies die Isolation dieses Kandidaten. Es ist kein allgemeiner Sicherheitsbeweis und keine Prüfung sämtlicher denkbarer künftiger Buildwege.

### Ausgeführte Prüfung vom 25. September 2026

- 22 strukturelle Referenzfälle bestanden. Davon fünf vollständig verknüpfte, dennoch inaktive Strukturen und 17 gesperrte Eingaben. Keine Fristberechnung durchgeführt.
- 15 Governance- und Mutationstests bestanden. Die Gegenprüfung fand eine zunächst akzeptierte Abweichung zwischen Quellen-ID und angezeigtem Zitat. Die sechs Quellenkennungen der Mini-Probe sind jetzt an ihre Zitiertexte gebunden. Der zusätzliche Negativtest weist unter anderem `ELG-1` mit dem falschen Text «Art. 1 KVG» zurück.
- Ausführung mit dem bereitgestellten Node `24.19.0`, ohne Zusatzbibliotheken. Dies ist ein isolierter Modellnachweis, kein Nachweis eines Produktbuilds mit der unveränderten Node-22-Toolchain des Projekts.
- SHA-256 der geprüften Kandidatendatei: `88eddd275b9d50efc190f1e8035bd6aaaf4414fa2524bb9c95cc2031086cb8df`.
- 236 lokale Dateiverweise in den sechs AP19-Unterlagen und vier Einstiegstexten geprüft, kein fehlendes Linkziel. Keine Behauptung eines vollständigen externen Linkchecks.
- `git diff --check` ohne Befund. Keine Änderungen an `src`, `data`, Produktschemas, Paketdefinitionen, SPFx oder öffentlichem App-Bestand.
- MVP-0.4-Webarchiv, SPPKG und freigegebenes Datenmanifest sind vor und nach AP19A hashgleich. Die bereits vor Arbeitsbeginn abweichende Word-Projektplandatei und beide vorhandenen Website-Backups sind gegenüber dem Eingangszustand ebenfalls unverändert.

Die Prüfsummenbindungen der eingefrorenen Releaseartefakte sind: Webarchiv `e45c780ce9dfac1d71be865df59678273efd0fc6ca1122d145bc09f422b4db16`, SPPKG `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346`, Manifest `a240b01feb671dbe4374c1e097bc9143d66fd4878cd235b3b490a9c08afec72e`. Es gab keinen Build, Commit, Push, Mirrorwechsel oder Deployment.

## Übergabe an die spätere Implementierung

Vor einem Produktumbau sind diese Fragen verbindlich zu beantworten:

1. Welche konkreten ELG-, AVIG- und KVG-Konstellationen werden fachlich übernommen und welche ausgeschlossen?
2. Welche Eigenschaften gehören abschliessend in die Bundesregel und welche in die Anbindung, einschliesslich ergänzendem kantonalem Recht und Übergangsrecht?
3. Welche Verträge und Komponenten erhalten neue Versionen und wie bleiben bestehende Releases lesbar?
4. Wie bindet eine Freigabe den exakten Regel-, Anbindungs-, Kalender- und Referenzfallstand, ohne Selbstfreigabe durch neue Daten?
5. Wie wird ein Feiertagsraum ausserhalb des Verfahrenskantons fachlich qualifiziert und durch eine gesonderte operative Projektion unterstützt?
6. Welche UI-Angaben können als sichtbare Modellvoraussetzung fest stehen und wo ist eine echte Auswahl zwingend?

MVP 0.4, seine gebundenen Artefakte und das laufende Green-Verfahren bleiben unverändert. AP19A verändert weder `src`, Produktschemas, Releases, Datenpins, Mirrors noch `package.json`. David Steimer entscheidet und verantwortet die spätere Fach- und Produktfreigabe. Codex bereitet Modell und Nachweise ohne formelle Freigabeverantwortung vor.

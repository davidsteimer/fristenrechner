# AP19C3 · Zeitliche Bindung der KVG-/OKP-Anbindungen

Stand: 28. September 2026. Umsetzung des abgenommenen AP19B-Produktvertrags für vier individuelle OKP-Leistungspfade. **Keine Integrations-, Release- oder Betriebsfreigabe.**

## Unveränderte Vertragsgrenzen

Die vier nationalen Regeln `CH-SOC-KVG-OKP-OBJ`, `CH-SOC-KVG-OKP-APP`, `CH-SOC-KVG-OKP-ADM` und `CH-SOC-KVG-OKP-CORRECTION` werden mit je einer gesonderten Berner Anbindung verbunden. Die Bundesregeln bleiben national formuliert. Die Berner Produkt- und Gerichtsanbindungen sowie die Feiertagsauflösung sind eigene Vertragsbestandteile. Sozialverfahrenskatalog `1.0.0` und Manifest `5.0.0` bleiben unverändert.

Das geschlossene Intervall **01.01.2026–31.12.2027** bezeichnet das konservativ belegte Anwendungsfenster der konkreten Regelkombination. Es behauptet weder eine erstmalige Inkraftsetzung sämtlicher Normen am 01.01.2026 noch deren Ausserkrafttreten am 31.12.2027. `legalValidity`, `sourceCoverage`, `caseCoverage` und `calculationCoverage` bleiben getrennte Prüfgrenzen. Der gesamte benötigte Rechenzeitraum muss erfasst sein, nicht nur die Zustellung.

## Fassungs- und Quellenbindung

Der [frische Quellenabgleich](quellenabgleich-ap19c3.md) vergleicht die unmittelbar abgerufenen KVG-Konsolidierungen vom 01.01.2026 und 01.07.2026 artikelbezogen. Die für die vier Pfade verwendeten Normen sind einschliesslich ihrer Fussnoten unverändert. Die Konsolidierungsmetadaten ordnen der Januar-Fassung den Zeitraum bis 30.06.2026 und der Juli-Fassung den Zeitraum bis 31.12.2027 zu. Der vollständige amtliche artikelbezogene Zukunftsänderungsindex ergab für KVG und ATSG bis Ende 2027 keinen Treffer.

Die KVG-Normverweise verwenden im Katalog `SRC-AP19C3-KVG-20260101`. Der spätere Originaltext ist über `SRC-AP19C3-KVG-20260701`, der Index über `SRC-AP19C3-KVG-FUTURE-INDEX-20260928` zusätzlich gebunden. Daraus folgt **keine Behauptung, das gesamte KVG vom Januar 2026 gelte bis Ende 2027 unverändert**. Die Unterschiede etwa bei den Artikeln 53 und 54 liegen ausserhalb der vier individuellen OKP-Leistungspfade. Für ATSG, GSOG und FRG werden die bestehenden Quellenkennungen mit einem neuen technischen Prüfnachweis ergänzt, die früheren Abnahmen aber nicht umdatiert.

Der historische GSOG-Nachweis für 01.01.2026–30.04.2026 wird ausdrücklich aus dem abgenommenen AP19B-Vergleich übernommen. Die aktuelle Fassung und Versionsmetadaten wurden neu abgerufen. Künftige Rechtsänderungen können das heutige Quellenfenster überholen und sind vor einer späteren Releaseübernahme erneut zu prüfen.

## Drei voneinander unabhängige Bezüge

| Bezug | Konkretisierung in AP19C3 |
| --- | --- |
| Fristberechnung | `legalTriggerDate` ist der qualifizierte rechtlich massgebende Eröffnungstag. Der Folgetag ist der kalendarische Fristbeginn. Die Bestimmung ungeklärter Zustellungsfiktionen wird nicht automatisiert |
| KVG-Verwaltung, `be-kvg-okp-product-scope` | Der in AP19B verlangte dokumentierte Produkt-Bezugszeitpunkt wird auf `legalTriggerDate` festgelegt. Die versicherte Person muss zu diesem Zeitpunkt Wohnsitz im Kanton Bern haben. Dies konkretisiert ausschliesslich die erste Produktgrenze. Es ist **keine gesetzliche kantonale Verwaltungszuständigkeitsregel**. Der Krankenversicherer muss fachlich zuständig sein, sein Sitz darf ausserhalb Bern liegen. Es wird kein zusätzliches Pflichtdatum und kein Versicherersitzfeld eingeführt |
| Gericht, `be-atsg58-court` | `jurisdictionReferenceDate` bezeichnet den für Artikel 58 ATSG qualifizierten Zeitpunkt der Beschwerdeerhebung. Gerichtskanton und Wohnsitzkanton werden eigenständig erfasst. Der frühere Verwaltungswohnsitz wird nicht als Tatsachenbeweis übernommen. Bei der Beschwerdeverbesserung muss zusätzlich das bestehende Verfahren beim zuständigen Gericht feststehen |

Die KVG-Verwaltungsbindung benötigt daher kein `jurisdictionReferenceDate`. Ihre Normprüfung und der ausdrücklich bezeichnete Produktstichtag bleiben am `legalTriggerDate`. Die gerichtliche Zuständigkeitsnorm verwendet dagegen `jurisdictionReferenceDate`. Die anderen gerichtlichen Normbindungen bleiben an der qualifizierten fristauslösenden Eröffnung. Das Zuständigkeitsdatum wird nie als Ersatz des Rechenankers verwendet. Fehlende, ausserhalb der belegten Intervalle liegende oder widersprüchliche Angaben sperren die Berechnung.

Die Feiertagsanknüpfung nach Artikel 38 Absatz 3 ATSG wird **separat** für Partei und Vertretung geklärt. Die ersten Produktkombinationen verwenden die bestehenden CH-/BE-Kalender. Weder der Versicherersitz noch der Gerichtskanton noch die allgemeine Auswahl «Verfahrenskontext» ersetzt diesen Fallbefund.

## Keine Erweiterung oder Aktivierung

Die 20 vorherigen Bundesregeln und ihre 24 Anbindungen bleiben inhaltlich unverändert. Deren Quellenprüfungen werden nicht auf AP19C3 umdatiert. Nur die Gesamt-Release-ID ihrer weiterhin gesperrten Kandidaten-Freigabeeinträge wird auf den neuen Stand bezogen.

Alle vier neuen Regeln, Anbindungen und Freigabeeinträge bleiben `candidate`, `approval` bleibt `null`. Eine in isolierten Tests synthetisch erteilte Freigabe wird nicht in die Kandidatendaten geschrieben. Weder die AP19B-Abnahme noch dieser Zeitnachweis genehmigt den AP19C3-Produktkandidaten oder einen Betrieb auf E, Q oder P.

Die Produktgrenzen bleiben unverändert: keine freiwillige KVG-Taggeldversicherung, keine VVG-Zusatzversicherung, keine Prämien-/Inkassowege, keine Pflege-Restfinanzierung, keine gesetzlichen ATSG-Ausnahmeregime und keine pauschalen gerichtlichen Anordnungsfristen. Die beiden gesetzlichen Fristen betragen unveränderlich 30 Tage. Für die beiden angeordneten Tagespfade muss das konkrete N vorliegen.

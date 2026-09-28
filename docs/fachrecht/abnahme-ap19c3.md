# AP19C3 · Abnahme der KVG-/OKP-Integration

Datum: 28. September 2026. Entscheider: David Steimer.

David Steimer hat nach Vorlage des Implementierungs- und Prüfstands erklärt:

> AP19C3 ist abgenommen.

Damit ist **AP19C3 fachlich-technisch abgenommen**. Zusammen mit den bereits erteilten Abnahmen von [C1 einschliesslich beider Bediennachträge](abnahme-ap19c1.md) und [C2](abnahme-ap19c2.md) ist die erste AP19-Integrationstranche mit ELG, AVIG und KVG abgeschlossen. Die nationale Modellierung bleibt von der begrenzten Berner Produktanbindung und der noch ausstehenden operativen Freigabe getrennt.

## Abgenommener Gegenstand

- Vier nationale KVG-/OKP-Leistungspfade für Einsprache, ordentliche Beschwerde, ausdrücklich angeordnete Verwaltungstagesfrist und gerichtliche Nachfrist zur Behebung formeller Beschwerdemängel. Keine pauschale KVG-Abdeckung.
- Vier Berner Anbindungen bei unverändertem Sozialverfahrenskatalog `1.0.0` und Manifest-/Consumerformat `5.0.0`. Der Gesamtstand enthält 24 Bundesregeln und 28 Anbindungen, einschliesslich der unverändert übernommenen 20 C2-Regeln und 24 C2-Anbindungen.
- Im Verwaltungsstadium tatsächlicher Wohnsitz der versicherten Person am fristauslösenden Zustelltag als ausdrückliche erste Produktgrenze. Kein Versicherersitzfilter und keine Gleichsetzung mit einer gesetzlichen kantonalen Zuständigkeitsregel.
- Im Gerichtsverfahren eigenständige Gerichts-, Wohnsitz- und Zeitangaben. Die gesonderte Feiertagsanknüpfung und das belegte Anwendungsintervall 2026–2027 bleiben bestehen. Die zuletzt bestätigte Datumseingabe wird nicht verändert.
- Gemeinsame DE-/FR-Oberfläche mit zweispaltigem Raster, früher Datumseingabe und Zusatzinformationen in der Rechenspur. Keine zusätzliche Bestätigungscheckbox, redundante Dokumentauswahl oder Speicherung von Falltatsachen als Standards.
- Vorgelegte Prüfungen: 1’087 Kern-/UI-Tests, sieben Prüfungen der öffentlichen App, 116 Datenprüfungen, 79 SPFx-Quell-/Transporttests und 39 Prüfungen am tatsächlich kompilierten Code beziehungsweise Testpaket. Darin sind alle acht positiven und 24 negativen KVG-Referenzfälle enthalten. Browserstichprobe und Nachweisgrenzen stehen im gebundenen Prüfbericht. Diese Zahlen werden durch die heutige Abnahmenachführung nicht als erneut ausgeführter Gesamttest ausgewiesen.

## Gebundener Stand

Die folgenden Dateien bleiben bei dieser Statusnachführung unverändert. Ihre damaligen Hinweise auf eine noch ausstehende Abnahme dokumentieren den Vorlagestand. Der aktuelle menschliche Abnahmestatus ergibt sich aus dieser Notiz.

Auch der [ursprüngliche Buildnachweis](../../outputs/ap19c3-2026-09-28/build-verification.json) behält sein damaliges `integrationApproved: false`. Das ist eine historische Buildangabe, nicht der heutige Abnahmestatus. Sie wird nicht rückwirkend umgeschrieben. Gleiches gilt für die damaligen Grenzen des technischen Quellenprüfnachweises.

| Gegenstand | SHA-256 |
| --- | --- |
| [Kandidatenmanifest](../../data/candidates/2026-09-28-ap19c3/manifest.json) | `8e0f7aa1901b1e26878ddead049a35c81cbf540fd6d68002597830f5c7e6b0da` |
| [Implementierung und Bedienvertrag](../architektur/implementierung-ap19c3.md) | `75e77b3e31dfbcf067ee0d546f05ff7020e1530d833c681b5949ed85b68d11eb` |
| [Integrations- und Prüfnachweis](pruefbericht-ap19c3.md) | `f5fa0162f847318e94e61b046ef2fd4252f2c64c3fb08c86d9fcb98db7f32f2a` |
| [Quellenabgleich](quellenabgleich-ap19c3.md) | `f6a399d25aa025146eab2f39a8e6727281b7ee392ed0b9200b4b8b1c7f095a0f` |
| [Zeitliche Bindung](zeitliche-bindung-ap19c3.md) | `e0e59f77a63611bd7547cb1f3231cb95b52c429424462c7e528e926491f686fd` |
| [Gemeinsame Rechneroberfläche](../../src/ui/FristenrechnerApp.tsx) | `d35cabbb21e88be73b038c0231c5eb6a3258a3b9c53fbee2823dc57bbb951f3e` |
| [UI-Zuordnung](../../src/ui/socialUi.ts) | `a92bec5130f1094633884c1e412712bf881da2e8af79095e81e7acf94583aca3` |
| [Sozial-Produkttexte](../../src/ui/socialMessages.ts) | `96976881a112113e28164cf4e8fe2d78e3e3fff4e5c900c145bfdbb1eff1622a` |
| [Sozialresolver](../../src/core/socialDeadline.ts) | `7c48dd7ac49bbff1049f1e68479ca9942f961c9cb3025936123115989c357780` |
| [Datumsübergangslogik](../../src/ui/dateTransition.ts) | `0fc819ddb9921d53fe98f484835a05a6d19572d99f474908bb17b77ea9b5b4bc` |

Release-ID: `2026-09-28-ap19c3-candidate.1`. Der letzte isolierte SPFx-Testbuild liegt unter `.work/ap19c-spfx-build-73wTwN`, Testpaket-SHA-256 `665a9c90a175c37e13668bac055179f6593e217b5fd89e3c0401abcfcade6144`. Dies ist kein Installations- oder Publikationspaket. Künftige Quelländerungen erzeugen einen neuen Arbeitsstand, ohne diese historische Bindung rückwirkend zu ändern.

## Weitergeltende Grenzen und nächster Schritt

Die Kandidatenabnahme ist keine Datenpromotion, operative Aktivierung oder Betriebsfreigabe. Kandidatenflags und alle 28 Werte `approval: null` bleiben unverändert. Die echte Vorschau bleibt daher ohne Sozialfrist-Enddatum. Die spätere kontrollierte Übernahme in einen zusammengehörigen Release benötigt einen gesonderten Auftrag.

Der fachlich-technische Abschluss der ersten Tranche ist keine Vollabdeckung des Sozialversicherungsrechts. Die bestehenden Sachbereichs-, Zuständigkeits-, Zeit- und Feiertagsgrenzen bleiben verbindlich. Weitere Erlasse, Kantonsanbindungen und nicht modellierte Verfahrenswege bleiben Folgeumfang.

MVP 0.4, C1-/C2-Artefakte, bestehende Pakete, Release-Pins, Mirrors, E/Q/P und Zugriffsrechte bleiben unverändert. Der gesonderte MVP-0.4-Hostingbefund wird durch diese Abnahme weder behoben noch geschlossen. Aus dieser Statusnachführung folgen kein Build, Commit, Push, Deploy-Key, Deployment oder Hostingzugriff. Es wird keine neue DEC-Nummer vergeben.

Nächster geplanter Schritt ist die **zusammengehörige Releasevorbereitung für den abgenommenen AP19-Stand** mit Quellenaktualität, kontrollierter Datenübernahme, definitiven Artefakten und gesondertem E-/Q-/P-Prüf- und Freigabeplan. Dieser Schritt wird durch die Abnahme nicht automatisch gestartet.

David Steimer erteilt die Abnahme in Personalunion. Codex dokumentiert sie als KI-Arbeitsinstrument und erteilt keine eigene formelle Freigabe.

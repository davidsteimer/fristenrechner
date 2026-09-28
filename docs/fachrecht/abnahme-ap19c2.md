# AP19C2 · Abnahme der AVIG-ALE-Integration

Datum: 28. September 2026. Entscheider: David Steimer.

David Steimer hat nach Prüfung des vorgelegten Kandidaten und der anschliessenden Erörterung des zusätzlichen Zuständigkeitsdatums erklärt:

> Dann belassen wir das vorerst so und passen es nach allfälligem Benutzerfeedback an.
> Damit ist das AP19C2 abgenommen.

Damit ist **AP19C2 fachlich-technisch abgenommen**. Die Abnahme betrifft den vorgelegten lokalen Implementierungs- und Prüfstand. AP19C3 für KVG ist weder enthalten noch damit gestartet. Gesamt-AP19C wird nicht als vollständig umgesetzt ausgewiesen.

## Abgenommener Gegenstand

- Vier nationale AVIG-ALE-Regeln für Einsprache, ordentliche Beschwerde, angeordnete Verwaltungstagesfrist und Nachfrist zur Behebung formeller Beschwerdemängel.
- Acht getrennte Berner Kassen-/Amtsstellenanbindungen bei unverändertem Sozialverfahrenskatalog `1.0.0` und Manifest-/Consumerformat `5.0.0`. Nationale Wiederverwendbarkeit bleibt von der begrenzten Berner Erstfreigabe getrennt.
- Eigenständige Herkunfts-, Kontroll-/Amtsstellen-, Gerichts- und Feiertagsangaben sowie getrennte Zeitanker. Die bereits abgenommene AVIV-Nachweismethode Option B und das belegte Anwendungsintervall 2026–2027 bleiben bestehen.
- Gemeinsame DE-/FR-Oberfläche mit zweispaltigem Raster, früher Datumseingabe und Zusatzinformationen in der Rechenspur. Keine zusätzliche Bestätigungscheckbox oder redundante Dokumentauswahl.
- Vorgelegte lokale Prüfungen: 982 Kern-/UI-Tests, sieben Prüfungen der öffentlichen App, 103 Daten-/Schematests, 73 SPFx-Tests und 34 Prüfungen am tatsächlich kompilierten Code beziehungsweise Testpaket. Browserstichproben, Bestandsschutz und Nachweisgrenzen sind im gebundenen Prüfbericht dokumentiert. Diese Zahlen werden durch die heutige Statusnachführung nicht als erneut ausgeführter Gesamttest ausgewiesen.

## Bedienentscheid zum Zuständigkeitsdatum

Das Feld **«Massgebender Zeitpunkt der Beschwerdeerhebung für die Zuständigkeit»** bleibt in den bisherigen ELG-Gerichtspfaden vorerst unverändert sichtbar und erforderlich. Auch die bestehenden AVIG-Zeitanker und sämtliche Eingabe-, Normintervall- und Abdeckungsprüfungen bleiben unverändert.

Die diskutierte Vereinfachung für die vorausschauende ELG-Beschwerdefristberechnung wird **nicht umgesetzt und nicht als bereits beauftragter Nachtrag geführt**. Eine erneute Beurteilung erfolgt bei allfälligem Benutzerfeedback. Es gibt weder eine automatische Ausblendung noch eine terminierte Änderung für November 2027 oder den Jahreswechsel 2027/2028. Der bestehende Vertrag bleibt massgebend. Für diese Beibehaltung wird keine neue DEC-Nummer vergeben.

## Gebundener Stand

Die folgenden Dateien bleiben bei dieser Abnahmenachführung unverändert. Darin enthaltene damalige Hinweise auf eine noch ausstehende Abnahme dokumentieren den Vorlagestand. Der aktuelle menschliche Abnahmestatus ergibt sich aus dieser Notiz.

Auch der [ursprüngliche Buildnachweis](../../outputs/ap19c2-2026-09-28/build-verification.json) behält sein damaliges `integrationApproved: false`. Das ist eine historische Buildangabe, nicht der heutige Abnahmestatus. Sie wird nicht rückwirkend umgeschrieben.

| Gegenstand | SHA-256 |
| --- | --- |
| [Kandidatenmanifest](../../data/candidates/2026-09-28-ap19c2/manifest.json) | `00a45f3766b376bda21fe13966ff5aad3769cddb9fe315890bd272576520fded` |
| [Implementierung und Bedienvertrag](../architektur/implementierung-ap19c2.md) | `86fcc7b99d4883977b0ce4a83fa43d621a04f6f515175d9e125883661555a47b` |
| [Integrations- und Prüfnachweis](pruefbericht-ap19c2.md) | `5a8fb1d5f3ca0ecf9a522016373d0a9ff91fdba0890a6584ae6d2d02ae97d90f` |
| [Quellenabgleich](quellenabgleich-ap19c2.md) | `73883be1aaddea64a2c4f71f3a798db99c23ef544eb5550f5e5707ba11c7a0e0` |
| [Zeitliche Bindung](zeitliche-bindung-ap19c2.md) | `617b2a66fc4644ff0b30b8acfdb5f8e38497bc47b3ae3b230345e1e2c26a3ab5` |
| [Gemeinsame Rechneroberfläche](../../src/ui/FristenrechnerApp.tsx) | `d0f15030138b32df76270bfa544d068bb335323f4b7f6e5f7df368ac91a41806` |
| [UI-Zuordnung](../../src/ui/socialUi.ts) | `1904ebaa001846105b08bfc7d35c98cdfd8c29890dc10f5417cdd1f214fc279c` |
| [Sozialresolver](../../src/core/socialDeadline.ts) | `7c48dd7ac49bbff1049f1e68479ca9942f961c9cb3025936123115989c357780` |
| [Datumsübergangslogik](../../src/ui/dateTransition.ts) | `0fc819ddb9921d53fe98f484835a05a6d19572d99f474908bb17b77ea9b5b4bc` |

Release-ID: `2026-09-28-ap19c2-candidate.1`. Der vorgelegte Gesamtstand enthält 20 Bundesregeln und 24 Anbindungen. Der letzte isolierte SPFx-Testbuild liegt unter `.work/ap19c-spfx-build-xtGwK9`, Testpaket-SHA-256 `8133e3af14c4d6d8a83fdfe2228ba59a7d105f2355a64372560ba0e7b40c028d`. Dies ist kein Installations- oder Publikationspaket. Künftige Quelländerungen erzeugen einen neuen Arbeitsstand, ohne diese historische Bindung rückwirkend zu ändern.

## Weitergeltende Grenzen

Die Kandidatenabnahme ist keine Datenpromotion, operative Aktivierung oder Betriebsfreigabe. Kandidatenflags und `approval: null` bleiben unverändert. Die echte Vorschau bleibt daher ohne Sozialfrist-Enddatum. Die spätere kontrollierte Übernahme in einen zusammengehörigen Release ist gesondert zu beauftragen.

MVP 0.4, C1-Artefakte, bestehende Pakete, Release-Pins, Mirrors, E/Q/P und Zugriffsrechte bleiben unverändert. Aus dieser Statusnachführung folgen kein Build, Commit, Push, Deployment oder Hostingzugriff.

Nächstes geplantes Teilpaket ist **AP19C3: KVG-Integration**. Es benötigt einen eigenen Startauftrag, die erforderliche Quellenprüfung und eine gesonderte Kandidatenabnahme.

David Steimer erteilt die Abnahme in Personalunion. Codex dokumentiert sie als KI-Arbeitsinstrument und erteilt keine eigene formelle Freigabe.

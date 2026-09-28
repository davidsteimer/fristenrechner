# AP19B · Abnahme von Produktvertrag, Quellenabgleich und Referenzen

Datum: 25. September 2026. Entscheider: David Steimer.

David Steimer hat auf die vollständige AP19B-Vorlage einschliesslich des vorgeschlagenen Vertragsentscheids, der AVIV-Nachweismethode und der engen UI-Folge erklärt:

> OK. Inklusive Option B für AVIG abgenommen.

Damit ist AP19B im nachstehenden Umfang abgenommen. [DEC-2026-025](../entscheidungen/DEC-2026-025-sozialverfahrenskatalog-und-manifest-v5.md) ist beschlossen. Die Produktintegration AP19C ist der nächste geplante Schritt, wird durch diese Abnahmenotiz aber nicht als bereits begonnen ausgewiesen.

## Abgenommener Gegenstand

- Eigenständiger Sozialverfahrenskatalog `1.0.0`, Manifest-/Consumerformat `5.0.0` und verbleibender Spezialregimekatalog `3.0.0`. Dies sind Datenvertragsversionen, keine neue App-Version.
- Nationale Bundesregeln, kantonale Anbindungen und konkrete Releasefreigaben als getrennte Ebenen. Erste operative Kombinationen bleiben auf die ausdrücklich geprüften BE-Anbindungen und CH-/BE-Kalender begrenzt.
- Plan zur kontrollierten Überführung der zwölf bestehenden AP17-Sozialpfade. 33 übrige Definitionen, 40 Regime und vier Sperrkennungen bleiben nach dem festgelegten Vertrag erhalten. Die tatsächliche verlustfreie Migration ist noch technisch nachzuweisen.
- Zwölf neue, eng abgegrenzte ELG-, AVIG-ALE- und KVG-OKP-Pfade mit 25 positiven Datumsreferenzen und 52 Sperrerwartungen.
- Quellen- und Fassungsabgleich einschliesslich der konkretisierten Berner Anbindungen und des begrenzten Quellenfensters 01.01.2026–31.12.2027.
- Globale statische Feldbeschriftung **«Verfahrenskontext»** statt «Sitz der zuständigen Stelle» für die spätere Integration. Zweispaltiger Aufbau bleibt erhalten. Bei der KVG-Verwaltung wird die feste Voraussetzung «Individuelle OKP-Leistung · versicherte Person mit Wohnsitz im Kanton Bern» angezeigt. Kein neues Pflichtfeld für den Versicherersitz.

## Ausdrücklich bestätigte Option B für AVIG

Die Abnahme umfasst die in [Abschnitt 3.1 des Quellenabgleichs](quellenabgleich-ap19b.md#31-aviv-ab-februar-2027-technische-exportlücke-und-zwei-nachweisoptionen) dokumentierte Nachweismethode `official-amendment-reconstruction`: amtliche AVIV-Konsolidierung vom Januar 2027, Originaländerungsakte AS 2025 814 und AS 2026 258 sowie vollständiger amtlicher Zukunftsänderungsindex nach dem dokumentierten Abrufstand.

Diese Herleitung trägt das abgenommene Quellenfenster für die vier bezeichneten ALE-Pfade auch ab 01.02.2027 bis 31.12.2027. Die technische Nichtverfügbarkeit des konsolidierten Exports ab Februar 2027 bleibt dokumentiert. Es wird weder ein nicht gelesener Originalvolltext behauptet noch unverändertes zukünftiges Recht garantiert.

Vor der Übernahme in einen Produktkandidaten sind Quellen und Änderungsindex erneut zu prüfen. Neu publizierte relevante Änderungen sind fachlich auszuwerten und können eine Teilung oder Verkürzung der Abdeckung verlangen. Die Abnahme der Nachweismethode ist keine operative Zeitfreigabe im Produkt.

**Begriffe getrennt halten:** Option B bezeichnet hier die AVIV-Quellenmethode. Option 2 in DEC-2026-025 bezeichnet dagegen den eigenständigen Sozialverfahrenskatalog. Beide gehören zum abgenommenen Paket, haben aber unterschiedliche Gegenstände.

## Gebundene Vorlage

Die folgenden neun Vorlagendateien bleiben byteidentisch. Ihre damaligen Vorschlags-, Kandidaten- und Freigabeflags werden nicht rückwirkend geändert. Der aktuelle menschliche Abnahmestatus ergibt sich aus dieser Notiz. Insbesondere bleiben `runtimeActive: false`, `legalTimeApproval: false` und `actualMigrationPerformed: false` im historischen Prüfkandidaten erhalten.

| Gegenstand | SHA-256 |
| --- | --- |
| [Produktvertrag und Migrationsbeschreibung](../architektur/sozialversicherungsvertrag-ap19b.md) | `0a10fab77735e8da31769f954b9a80178b081adda5cdb5ef3ed7b765581b0493` |
| [Quellen- und Fassungsabgleich](quellenabgleich-ap19b.md) | `e234dfaf76ae38b1e02f5562e738d94ae33738f6429c8130e785f0adb3141141` |
| [Datums- und Sperrreferenzen](referenzfaelle-ap19b.md) | `4fec3b7e2a5e130365213be7bbd06442e74ce70fa3f043aa2eb33618517567eb` |
| [Maschinenlesbarer Migrationsplan](../../tests/golden/candidates/ap19b-migration-plan.json) | `105875c6ffa5b225c845f6da056568361aa610f8479d2256c2924f9ed7ad2087` |
| [Maschinenlesbare Fachreferenzen](../../tests/golden/candidates/ap19b-social-deadlines.json) | `da5895b8d09ce46f61830d08613f93ee0a673bd1cefbd7cbbadeb4c054940ae8` |
| [Migrationsplanprüfer](../../scripts/check-ap19b-migration.mjs) | `f507af37d9df014fd20ff963c588865f28a418aea3aa660b0c469e5e0664b3e2` |
| [Referenzprüfer](../../scripts/check-ap19b-references.mjs) | `d6ee52bc6f2eddd889acfd906ec322dfc45a3e460df359707e620e5432e09655` |
| [Migrationstests](../../tests/governance/ap19b-migration.test.mjs) | `1ceec4198586f0b322753c3afba7d04aad621099b4c3f4212f06518b774a1904` |
| [Referenztests](../../tests/governance/ap19b-references.test.mjs) | `ac9c85d9877f0e20b7ea95e71ac533b662a5d8d5e10a22382dd3ec753bbc329e` |

Der [Arbeitsplan](sozialversicherungsrecht-ap19.md), das Entscheidungsregister und DEC-2026-025 werden als lebende Steuerungsdokumente auf den beschlossenen Status nachgeführt. Die sieben gebundenen AP19A-Dateien und die AP19A-Abnahmenotiz bleiben unverändert.

## Weitergeltende Grenzen und nächster Schritt

- Keine Behauptung einer bereits ausgeführten Migration, eines implementierten Consumers 5 oder bestandener Integrationstests mit dem neuen Adapter.
- Keine Aktivierung neuer Fachpfade oder weiterer Kantone durch Änderung bestehender Kandidatenflags.
- Keine Produkt-, GUI- oder Schemaänderung, kein Build, Commit, Push, Mirrorwechsel, E-/Q-/P-Deployment und keine Hostingänderung aus dieser Abnahmenachführung.
- MVP 0.4, bestehende Datenreleases, Pakete und Benutzerdateien bleiben unverändert.
- Nächstes geplantes Paket ist AP19C1: technische Grundlage, kontrollierte Migration und ELG-Integration. Danach folgen AP19C2 für AVIG und AP19C3 für KVG. Die Kandidaten werden gesondert abgenommen.

David Steimer erteilt die fachliche und vertragliche Abnahme in Personalunion. Codex dokumentiert sie als KI-Arbeitsinstrument und erteilt keine eigene formelle Freigabe.

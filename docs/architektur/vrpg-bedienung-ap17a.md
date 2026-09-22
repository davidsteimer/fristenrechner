# AP17A: Kontrollierte VRPG-Auswahl und UI-Grundlage

| Merkmal | Stand |
| --- | --- |
| Datum | 11. September 2026 |
| Auftrag | [DEC-2026-019](../entscheidungen/DEC-2026-019-gestufte-vrpg-bedienung.md) |
| Paketplan | [AP17](../ux/vrpg-bedienkonzept-ap17.md) |
| Stand | AP17A durch David Steimer am 11. September 2026 abgenommen, lokal implementierter Entwicklungskandidat |
| Datenbasis | unverändert `2026-08-31-mvp-03-approved.1` |
| Veröffentlichung und Installation | nicht erfolgt |

## 1. Umgesetzt

Die gemeinsame React-Oberfläche führt bei «VRPG Bern und Spezialrecht» durch vier Bereiche. Spezialerlass beziehungsweise politische Ebene, Verfahrenshandlung und ein erforderliches Stadium erscheinen abhängig von der Auswahl. Ein einziges fest vorgesehenes Beschaffungsinstrument wird sichtbar als IVöB angezeigt, nicht als unnötige zweite Auswahl verlangt. Das bedeutet noch keine Freigabe seiner Fristenregeln.

Alle 19 bereits selektierbaren Regime des freigegebenen Katalogs bleiben erreichbar. Dies umfasst die allgemeine VRPG-Regel sowie 18 politische Regime mit insgesamt 21 exakten Regime-/Fristkomponenten-Paarungen. Die mehrfachen Komponenten von Art. 117 und 121 PRG sowie gemeinsam verwendete Komponenten sind ausdrücklich zugeordnet. Die politische Ebene ist von der Auswahl der zuständigen Behörde getrennt.

Sozialversicherungsrecht enthält zunächst die exemplarischen Spezialerlasse IVG, AHVG und UVG sowie passende Handlungsauswahlen. Das Beschaffungsrecht enthält Beschwerde und Eingabe im laufenden Verfahren. Beide Bereiche bleiben für die Berechnung gesperrt. Der Hinweis erscheint bereits bei der Bereichsauswahl. Weder Beispiele aus der Skizze noch ein später hinzugefügter Katalogeintrag können diese Sperre ohne ergänzte und geprüfte Zuordnung aufheben.

Bereich, Spezialerlass, Handlung und Stadium lassen sich lokal als Standards speichern. Die interne Version steigt auf 3, der bestehende Speicherschlüssel bleibt erhalten. Gültige Version-1-/Version-2-Auswahlen werden nur bei eindeutiger Regime-/Komponenten-Zuordnung übernommen. «Bitte wählen» bleibt ausdrücklich speicherbar. Daten, Zeiten, Referenzen und Bestätigungen sind nicht Bestandteil der Speicher-Whitelist.

## 2. Technische Abgrenzung

- `src/ui/vrpgSelection.ts` enthält die explizite Zuordnung und ihre erneute Prüfung gegen Status, Geltungsumfang, Sichtbarkeit und Komponentenzugehörigkeit des validierten Katalogs. Es interpretiert keine Freitexte oder Erlasspräfixe.
- `src/ui/model.ts` sichert beide Rechenadapter zusätzlich zur Formularvalidierung. Widersprüchliche, unvollständige oder nicht freigegebene Zuordnungen erzeugen keinen allgemeinen Auffangfall.
- Der Rechenkern, alle freigegebenen Rechts-/Kalenderdaten und deren Formate bleiben unverändert.
- Übergeordnete Auswahlwechsel leeren abhängige Falldaten, Bestätigungen, Resultat und Kalenderreferenz. Ein Wechsel der unveränderlichen Datenrelease-ID startet eine neue Rechnungssitzung und verhindert alte Resultate neben einem neuen Datenstand.
- Eingaben, Schaltflächen, Resultatkacheln und automatische Parameter verwenden zwei Spalten. Unter 641 CSS-Pixeln werden die Raster für lesbare Mobilansichten einspaltig. Die Kalenderaktion bleibt rechts unten, sofern ein exportierbares Ergebnis vorliegt.
- Nicht selektierbare offene, gesperrte oder für Folgeausbauten bestimmte Katalogeinträge bleiben im Datenbestand und in der Fachdokumentation erhalten. Sie erscheinen nicht länger als deaktivierte Einträge in der normalen Handlungsauswahl. Behördlich gesetzte Termine und automatische Overlays bleiben verborgen.

### Reversible technische Details, Klasse C

Im Browsernachweis wurde eine Wechselwirkung zwischen dem kontrollierten Fluent-UI-v8-Datumsfeld und Chrome 152 beobachtet. Nach dem Fokus liess sich ein gültiger ISO-Wert im betroffenen Feld nicht setzen. Ein nativer Klon und das nicht fokussierte Feld nahmen denselben Wert an. `DateInput.tsx` verwendet deshalb ein natives HTML-Datumsfeld mit sichtbarer Beschriftung, Fokusmarkierung und zugeordneten Fehlermeldungen. Es bleibt vollständig webbasiert und benötigt keine neue Bibliothek oder Tenantberechtigung.

Die bestehenden Sicherheitsbestätigungen für Zustellfiktion und Feiertagsanknüpfung bleiben bestehen. Die entfallene allgemeine «Ich bestätige»-Checkbox wird nicht wiedereingeführt. Die Auswahl des allgemeinen Bereichs ist weiterhin die bewusste fachliche Einordnung.

Die eigenständigen Browsereinstiege initialisieren zusätzlich lokal verfügbare Schriften und 13 eingebettete SVG-Symbole. Dadurch entfallen die sonst vom Fluent-Browserbundle ausgelösten Office-CDN-Schriftabrufe. `browserAppearance.tsx` wird ausschliesslich von Vorschau und statischem Browsereinstieg aufgerufen. Es verändert keine tenantweiten SPFx-/SharePoint-Themes oder Iconregistrierungen und führt keine neue Laufzeitabhängigkeit ein.

## 3. Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript mit Node 22.23.2 | bestanden |
| Kern- und UI-Tests einschliesslich Auswahl, Migration und Sperren | 301 bestanden |
| Statische Buildtests | 4 bestanden |
| Vorschau- und statischer Build | erfolgreich |
| Reale Browserinteraktionen in der Vorschau | bestanden |
| Derselbe Browserlauf im lokalen statischen Build | bestanden |
| Neun dokumentierte Ansichten je Browsereinstieg bei 1024, 736 und 360 CSS-Pixeln | alle Raster korrekt, kein horizontaler Überlauf und keine abgeschnittene neue Auswahl |
| JavaScript-Seitenfehler und externe Abrufe während beider Browserläufe | keine |
| Kalenderdatei aus echtem Rechenergebnis | Datum im ICS-Inhalt überprüft, kein Outlook-Import |
| Freigegebene Daten und Rechenkern gegenüber HEAD | unverändert |
| Mechanische Übernahme der Quellen in den SPFx-Arbeitsstand | erfolgreich |
| Zusätzliche lokale SPFx-Testsuite | ohne Testausgabe hängen geblieben und abgebrochen, nicht als bestanden gewertet |
| Echte SharePoint-/Teams-/P-Betriebsprüfung | nicht durchgeführt, Teil der späteren Releaseprüfung |

Der reproduzierbare Browserprüfer liegt unter `scripts/check-vrpg-ui.mjs`. Er akzeptiert ausschliesslich eine lokale Zieladresse und schreibt seinen Nachweis unter `.work/qa/ap17/`. Er prüft reale Formularinteraktionen, Ergebnisinvalidierung, Defaultmigration, leere Daten nach Neuladen, DE/FR, mobile Raster und den Inhalt einer lokal erzeugten Kalenderdatei. Es werden keine Outlook-Termine angelegt. Die JSON-Protokolle und Screenshots der lokalen Prüfung sind Arbeitsnachweise, kein Bestandteil eines veröffentlichten Releases.

Die neue Auswahl wird ausserdem durch acht unveränderte fachlich freigegebene Spezial-Golden-Cases über die vollständige Adapterkette und durch Mengengleichheit aller bisherigen Regime-/Komponenten-Paare abgesichert. Die erweiterten Version-1-/Version-2-Defaulttests prüfen jede bisher freigegebene Paarung.

Die zusätzliche SPFx-Testsuite wurde sowohl mit dem vorhandenen projektspezifischen Einstieg als auch mit dem funktionierenden Root-Testloader angestossen. Beide Einstiege lieferten lokal kein Testergebnis. Eine Ursache ist damit nicht belegt. Die Umgebung ist vor der späteren SPFx-Paketfreigabe gesondert zu klären. Aus der erfolgreichen Quellensynchronisierung oder dem statischen Browserlauf wird keine bestandene SPFx-Hostprüfung abgeleitet.

Reguläre Entwicklungskontrolle mit der projektspezifischen Node-22-Toolchain:

```bash
npm run check
```

Der Browserprüfer verwendet eine vorhandene Playwright-Installation und einen vorhandenen Browser, ohne sie automatisch herunterzuladen. Die optionalen Variablen `FRISTENRECHNER_PLAYWRIGHT_MODULE`, `FRISTENRECHNER_CHROME_PATH`, `FRISTENRECHNER_QA_URL` und `FRISTENRECHNER_QA_OUTPUT` bestimmen lokale Werkzeuge, Vorschauadresse und Ausgabeordner. Standardadresse ist `http://127.0.0.1:4173/`.

## 4. Weiter offen und nicht freigegeben

- Fachliche Anwendbarkeitsmatrix für Sozialversicherungs- und Beschaffungsrecht einschliesslich Quellen und positiver sowie negativer Golden Cases in AP17B. OF-012 bleibt offen.
- Aktivierung neuer Rechtsregeln und die damit verbundenen Datenformat-/Releaseentscheide erst nach Fachabnahme.
- Der allgemeine Ausbau der quellenverlinkten Normenanzeige aus Issue #34 ist mit AP17A nicht erledigt. Bestehende Rechtsgrundlagen und Rechenspuren bleiben erhalten.
- SPFx-Paketbau, echte SharePoint-/Teams-Tests, Releasepromotion, Publikation und Deployment im anschliessenden, ausdrücklich freigegebenen Umfang. Ein lokaler statischer Testbuild ist kein P-Release.

Die beschlossenen Konzept- und Planfassungen 1.0 sowie historische Fach- und Abnahmenachweise wurden nicht geändert. Die bereits vorhandene lokale Änderung der Word-Planfassung und das Verzeichnis `Userinput` gehören nicht zu AP17A.

## 5. Abnahme vom 11. September 2026

David Steimer hat AP17A unter der Voraussetzung abgenommen, dass das deaktivierte Datumseingabefeld auf die noch ausstehende Fachfreigabe zurückgeht und keinen Defekt der Datumseingabe darstellt. Die Quellcodeprüfung und eine erneute isolierte Browserprüfung bestätigen diese beabsichtigte Sperre für die neuen Fachbereiche.

Die genaue Abgrenzung lautet:

- Bei Sozialversicherungsrecht und Beschaffungsrecht bleibt das Feld auch bei vollständig gewähltem Spezialerlass, Handlung und erforderlichem Stadium deaktiviert. Die konkreten geprüften Fachzuordnungen sind noch nicht integriert und freigegeben.
- Zusätzlich bleibt das Feld gesperrt, solange eine erforderliche fachliche Auswahl fehlt. Die Vorschau `?qa=vrpg-progressive` startet beispielsweise ohne gewähltes Verfahrensstadium. Die Deaktivierung ist deshalb nicht ausschliesslich ein Freigabestatus.
- Bei allgemeinem VRPG und vollständig gewählten, bereits freigegebenen politischen Fällen sind die jeweiligen Datumsfelder aktiv. Dies wurde erneut im Browser geprüft, einschliesslich tatsächlicher Datumseingabe im allgemeinen VRPG-Fall.

AP17A ist damit als UI-Arbeitspaket abgenommen. Die erläuterte Schutzlogik wird beibehalten. Die Abnahme aktiviert keine neuen Rechtsregeln und ersetzt weder die AP17B-Fachprüfung noch die AP17C-Integration. Die ohne Ergebnis abgebrochene lokale SPFx-Testsuite bleibt offen und wird durch diese Abnahme nicht nachträglich als bestanden gewertet. Veröffentlichung, Installation und Betriebsfreigaben bleiben gesonderte Schritte.

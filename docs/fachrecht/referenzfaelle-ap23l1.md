# AP23L1 Forschungsreferenzen AI und SZ

Stand: 27. Oktober 2026. Unabhängige Rechenkontrolle zur [Fachvorlage](verwaltungsverfahren-ap23l1.md), keine Produktprüfung und keine juristische oder operative Freigabe.

## Bestand und Methode

Die [maschinenlesbare Fixture](ap23l1/referenzfaelle.json) übernimmt **83 vorab festgelegte Forschungsreferenzen** unverändert aus den beiden Kantonsbefunden. Der Zusammenbau erzeugt keine Sollresultate. Jede Referenz enthält ihre tatsächlich vorausgesetzten synthetischen Falltatsachen ausdrücklich. Fehlende Tatsachen werden weder aus Pfadstandards noch aus persönlichen Präferenzen ergänzt.

| Ergebnisart | AI | SZ | Zusammen |
| --- | --- | --- | --- |
| Datumssollwert | 34 | 20 | 54 |
| Qualifikationsgrenze ohne definitives Ende | 12 | 10 | 22 |
| Vollständige Fenstergrenze | 3 | 2 | 5 |
| Endverschiebung in neuen Stillstand | 1 | 1 | 2 |
| Gesamt | 50 | 33 | 83 |

Node zählt vorwärts mit einem eigenen Rechenkern. Python erzeugt unabhängig eine Folge zulässiger Zähltage und bestimmt darin den Endtag. Beide Programme berechnen Ostern unabhängig und importieren keine Produktmodule. Sie vergleichen die statischen Vorgaben und ihre vollständigen Resultate, nicht nur einen zufällig gleichen Endtag. Dass beide Rechner übereinstimmen, bestätigt die Umsetzung der zugrunde gelegten Forschungsannahmen, nicht deren juristische Richtigkeit.

Die neuen Schutz- und Referenztests prüfen zusätzlich ungültige Daten und Dauern, fehlende Tatsachen, unzulässige neue Tatsachenfelder, abweichende gesetzliche Dauer, widersprüchliche längere Belehrung, fehlende Kalenderbindung sowie den Erhalt der Ausgangsdateien. Die tatsächlichen Testzahlen stehen im gebundenen [Abschlussnachweis](../../outputs/ap23l1-2026-10-27/local-completion.json).

## Entscheidende Referenzpaare

Alle positiven Zeilen setzen die vollständige aktuelle Fallqualifikation des jeweiligen Forschungsfalls voraus.

| Referenz | Eingabe und Unterscheidung | Erwartung |
| --- | --- | --- |
| AI R21 | Bereits rechtlich qualifizierte Eröffnung Samstag, 19.09.2026, zehn Tage, Verwaltung | Eröffnung bleibt 19.09.2026, Ende **29.09.2026** |
| AI R22 | Physischer Eingang einer qualifizierten Trackingsendung am selben Samstag, Erwartbarkeit, Eingang und gleiches Feiertagsregime bestätigt | Rechtliche Eröffnung 21.09.2026, Ende **01.10.2026** |
| AI R19 und R20 | Ein Tag ab 21.09.2026 gegenüber zehn Tagen ab bereits qualifizierter Eröffnung am Mauritiustag | Ende **23.09.2026** beziehungsweise **02.10.2026**. Endverschiebung und Tageszählung werden nicht verwechselt |
| AI R24 und R25 | Gleiche qualifizierte Trackingsendung am 26.12.2026, zehn Tage, Verwaltung gegenüber Gericht | Rechtliche Eröffnung jeweils 28.12.2026. Ende Verwaltung **07.01.2027**, Gericht **12.01.2027** |
| AI R27 und R28 | Gerichtliche Eingabe und zulässige kurze Zwischenentscheidsbeschwerde ab 14.07.2027, je sieben Tage | Beide **23.08.2027**. Keine automatisch importierte Vorsorglichkeitsausnahme |
| AI R33 | Falsche Angabe von 15 statt gesetzlichen zehn Tagen | **AI-O3**, weder 15 noch 30 Tage still auswählen, kein definitives Ende |
| AI R49 und R50 | Trackingdatum als Ersatz für mündliche Eröffnung oder rechtlich bestimmten Kenntnistag | Qualifikationsgrenze, keine erfundene rechtliche Eröffnung |
| SZ R02 und R03 | Gerichtliche Zwanzigtagesbeschwerde ab 15.12.2026 ohne beziehungsweise mit bestätigter Ausnahme | **25.01.2027** beziehungsweise **04.01.2027** |
| SZ R13 und R14 | Gerichtliche Eintagesfrist ab 05.01.2027 ohne beziehungsweise mit bestätigter Ausnahme | **08.01.2027** beziehungsweise **07.01.2027**. Ohne Stillstand verschiebt nur Dreikönige den Endtag |
| SZ R09 | Qualifizierte Zehntagesbeschwerde ab 01.11.2026, Sitz Gemeinde Schwyz | Nominal 11.11.2026, Martinstag verschiebt auf **12.11.2026** |
| SZ R31 und R32 | Qualifizierte Vollstreckungsbeschwerde ab 15.12.2026, zehn Tage mit beziehungsweise ohne Ausnahme | **28.12.2026** beziehungsweise **15.01.2027**. «Vollstreckung» bestimmt die Ferienbehandlung nicht allein |
| SZ R20 und R21 | Elf Tage unter der Höchstens-zehn-Regel beziehungsweise nicht positiv gebundener anderer Stellensitz | Qualifikationsgrenze. Für den anderen Sitz **SZ-O1**, kein stiller SZ-Basiskalender |
| AI R48 und SZ R30 | Alle Tage sind gezählt, erst die Endverschiebung gerät in den neuen Osterstillstand | Sichtbare Kollisionsgrenze ohne definitives Ende |

Weitere Fälle decken die eigenständigen schriftlichen Eröffnungs-, Begründungs- und Erläuterungsverlangen, die gesetzlichen Kurzwege, fehlende oder widersprüchliche Belehrungen, ausserordentliche Postbenutzung und das vollständige Fenster ab. Jede der 31 vorgeschlagenen Gruppen besitzt mindestens eine positive Datumsreferenz.

## Kalendervergleich und Quellenbytes

**2’190 Tagesvergleiche** prüfen die drei gebundenen Kalender über sämtliche Tage 2026 und 2027: AI innerer Landesteil, AI äusserer Landesteil als Gegenprobe und SZ mit ausdrücklich separiertem Schwyzer Martinstag. **13 gezielte Kalenderproben** prüfen unter anderem Mauritius, Stephanstag, Dreikönige, Fronleichnam und Martinstag.

Beim SZ-Vergleich wird der unveränderte kantonsweite Rohkalender ausdrücklich nur um **11.11.2026 und 11.11.2027** ergänzt. Dieser Forschungszusatz wird nicht als bereits vorhandener Kalenderbestand ausgegeben. Der äussere AI-Kalender wird nicht als zusätzlicher positiver Verwaltungsweg freigegeben.

Der Node-Lauf kontrolliert alle **31 registrierten Belegdateien mit 9’196’390 Bytes** gegen ihre Register. Die fünf AI-Textauszüge sind Ableitungen der ebenfalls gesicherten API-Antworten, keine unabhängigen weiteren Rechtsquellen.

## Wiederholbarkeit und Grenzen

Im Projektordner sind die begrenzten lokalen Prüfungen ausführbar:

```sh
.work/toolchains/node-v22.23.2-darwin-arm64/bin/node scripts/check-ap23l1-references.mjs
.venv/bin/python scripts/check_ap23l1_independent.py --write
.work/toolchains/node-v22.23.2-darwin-arm64/bin/node --test tests/governance/ap23l1-research.test.mjs tests/governance/ap23l1-references.test.mjs
.work/toolchains/node-v22.23.2-darwin-arm64/bin/node scripts/check-ap23l1-completion.mjs --check
```

Die ersten drei Befehle schreiben ausschliesslich neue L1-Forschungsnachweise. Der letzte prüft den gebundenen Abschluss. Historische Schutzbindungen werden nicht erneuert. Der ursprüngliche K3-Abschluss behält seine damaligen Vorabnahmeflags, die gesonderte menschliche K3-Abnahme bleibt separat erhalten.

Kein Browser-, Geräte-, SharePoint-, Teams-, Export- oder Outlook-Test wurde in L1 durchgeführt. Es gibt keine ICS-Datei und keinen Produktbuild. Die Befunde und die vorgeschlagene begrenzte Behandlung der offenen Rechtsfragen benötigen Davids fachliche Abnahme.

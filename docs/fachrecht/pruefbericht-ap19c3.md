# AP19C3 · Integrations- und Prüfnachweis

Prüfstand: 28. September 2026. Durchführung durch Codex als KI-Arbeitsinstrument. **Technisch geprüfter lokaler Kandidat zur fachlich-technischen Abnahme durch David Steimer, keine selbst erteilte Fach- oder Betriebsfreigabe.**

## Gebundener Stand

Release-ID: `2026-09-28-ap19c3-candidate.1`. [Implementierung und Grenzen](../architektur/implementierung-ap19c3.md), [Buildnachweis](../../outputs/ap19c3-2026-09-28/build-verification.json), [Quellenrefresh](quellenabgleich-ap19c3.md) und [Zeitbindung](zeitliche-bindung-ap19c3.md).

| Gegenstand | SHA-256 |
| --- | --- |
| [C3-Manifest](../../data/candidates/2026-09-28-ap19c3/manifest.json) | `8e0f7aa1901b1e26878ddead049a35c81cbf540fd6d68002597830f5c7e6b0da` |
| [Quellenprüfnachweis](../../outputs/ap19c3-2026-09-28/sources/source-review.json) | `00f16cfb9653d32a73555c9ccd6c22a32af7810aae0068fe540d5497aac1b6e9` |
| [Zeitliche Bindung](zeitliche-bindung-ap19c3.md) | `e0e59f77a63611bd7547cb1f3231cb95b52c429424462c7e528e926491f686fd` |
| [Gemeinsame Oberfläche](../../src/ui/FristenrechnerApp.tsx) | `d35cabbb21e88be73b038c0231c5eb6a3258a3b9c53fbee2823dc57bbb951f3e` |
| [UI-Zuordnung](../../src/ui/socialUi.ts) | `a92bec5130f1094633884c1e412712bf881da2e8af79095e81e7acf94583aca3` |
| [Sozial-Produkttexte](../../src/ui/socialMessages.ts) | `96976881a112113e28164cf4e8fe2d78e3e3fff4e5c900c145bfdbb1eff1622a` |
| [Unveränderter Sozialresolver](../../src/core/socialDeadline.ts) | `7c48dd7ac49bbff1049f1e68479ca9942f961c9cb3025936123115989c357780` |
| [Unveränderter Datumsübergang](../../src/ui/dateTransition.ts) | `0fc819ddb9921d53fe98f484835a05a6d19572d99f474908bb17b77ea9b5b4bc` |

Der Kandidat enthält 24 nationale Bundesregeln und 28 Berner Anbindungen. Vier Regeln und vier Anbindungen betreffen neu KVG/OKP. Die vorherigen 20 Regeln und 24 Anbindungen sind objektidentisch. Neun andere Komponenten sind byteidentisch aus C2 übernommen. Bei den alten Kandidaten-Freigabenachweisen wird nur die zugehörige Gesamt-Release-ID angepasst, nicht deren ursprüngliche Quellenprovenienz oder Abnahme.

## Automatisierte Prüfung

Ausgeführt mit Node `22.23.2`, den vorhandenen Projektabhängigkeiten und der lokalen Python-Umgebung. Kein Abhängigkeits- oder Formatwechsel.

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript-Typecheck | bestanden |
| Gesamte Kern-/UI-Suite | **1’087 Tests bestanden**, 0 Fehler |
| Darin C3-Builder | 9 Tests bestanden |
| Darin C3-Kernintegration | 78 Tests bestanden |
| Darin C3-UI-Vertrag | 18 Tests bestanden |
| Öffentliche App-Regression | 7 Tests bestanden |
| Vollständige Python-Daten-Suite | **116 Tests bestanden**, darin 13 C3-Vertragsprüfungen |
| Lokaler Vorschau- und öffentlicher Entwicklungsbuild | bestanden, kein Publikationspaket |
| SPFx-Quelltransport und bestehende Hosttests im isolierten Build | **79 Tests bestanden**, darin 6 neue C3-Prüfungen |
| Produktionskompilierung, CSS-Audit und isoliertes SPFx-Testpaket | bestanden |
| Tatsächlich kompiliertes ES5-/Paketverhalten | **39 Tests bestanden**, darin 5 neue C3-Prüfungen |
| [Bestandsschutz](../../outputs/ap19c3-2026-09-28/preservation-verification.json) | **53 geschützte Dateien unverändert** |

Alle **8 positiven und 24 negativen KVG-Referenzen** aus AP19B sind in der Produktintegration berücksichtigt. Positive Proben verwenden die echte Tagesarithmetik und ausschliesslich synthetische Freigaben im Testspeicher. Negative Qualifikationsproben verwenden ebenfalls diese Kopie, damit nicht die fehlende Kandidatenfreigabe einen zu permissiven Fachresolver verdeckt. Die echten vier KVG-Kandidatenpfade bleiben ohne Enddatum gesperrt.

Stadium, Handlung und Dauerart sind im geschlossenen Eingabevertrag bereits durch die gewählte Regel festgelegt. Die entsprechenden Negativproben weisen unzulässige Übersteuerungsfelder zurück. Sie behaupten keine automatische Erkennung einer sachlich falsch ausgewählten Verfahrenshandlung oder eine Inhaltsprüfung des vorliegenden Dokuments. Gesetzlicher ATSG-Ausschluss und Produktgrenze werden zusätzlich anhand der Katalogklassifikation unterschieden.

Weitere Gegenproben betreffen Versicherersitzneutralität, fehlenden oder ausserbernischen Wohnsitz, ungeklärte Gerichtszuständigkeit, fehlendes Zuständigkeitsdatum, Kalenderkonflikte, nicht belegte Zeiträume, unerlaubte Tagesdauer, falsche Dokumenttypen, manipulierte Freigabehashes und atomaren Cache-Rückfall. Derselbe nationale Regelvertrag wird mit einer synthetischen ausserkantonalen Anbindung geprüft, ohne deren Produktfreigabe zu behaupten. Sämtliche 24 vorherigen C2-Anbindungen sind zusätzlich mit tatsächlichen Berechnungen und identischen Rechenspuren gegengeprüft.

Ein ergänzender unabhängiger KI-Teilreview ergab keine konkreten Befunde. Er prüfte insbesondere Reproduzierbarkeit, Kandidatenflags, Altobjekterhalt, die sieben gebundenen Originalantworten, 27 neue Normbindungen und die Trennung von Produktstichtag und gesetzlicher Gerichtszuständigkeit. Dies ist eine zusätzliche technische Kontrolle, keine zweite menschliche Freigabe oder Übernahme der fachlichen Verantwortung.

Der kompilierte Consumer weist das echte Kandidatenmanifest bereits vor dem Nachladen der Komponenten zurück. Nur eine synthetische Transportfreigabe erlaubt in der isolierten Hostprobe das Laden, lässt aber die vier echten KVG-Kandidaten weiterhin gesperrt. Erst ausdrücklich synthetisch freigegebene Regeln und Anbindungen rechnen im Testspeicher. Kein solcher Testzustand wird in Vorschau, Kandidatendaten, Mirror oder Host geschrieben.

Lokale Rohprotokolle: `.work/ap19c3-check.log`, `.work/ap19c3-all-data-tests.log`, `.work/ap19c3-spfx-check.log`. Isolierter Build: `.work/ap19c-spfx-build-73wTwN` mit fünf Schrittprotokollen und `verification.json`. **Nur Testpaket**, SHA-256 `665a9c90a175c37e13668bac055179f6593e217b5fd89e3c0401abcfcade6144`. Das bisherige SPPKG im Projekt wurde nicht ersetzt und bleibt bei SHA-256 `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346`.

## Browserstichprobe

Geprüft gegen den gebauten Endstand unter `http://127.0.0.1:8794/?candidate=ap19c3` im lokalen In-App-Browser. Keine SharePoint- oder Teams-Installation.

| Probe | Sichtbarer Befund |
| --- | --- |
| Neue Erlasswahl | eigener KVG-/OKP-Eintrag und die vier abgegrenzten Handlungen, keine pauschale Krankenversicherungsauswahl |
| Frühe Datumseingabe | `16.09.2026` vor KVG-Handlungswahl bedienbar und nach Erlass-, Handlungs- und Stadienwechsel erhalten |
| Einsprache im Verwaltungsstadium | fester knapper Gegenstand mit Berner Produktgrenze, tatsächlicher Wohnsitz und separate Feiertagsanknüpfung, kein Versicherersitz- oder Verwaltungskantonfeld |
| Vollständig ausgefüllte Einsprache | Kandidatensperre als einziger Sperrgrund, kein Enddatum oder Kalenderexport, Rechenspur zunächst geschlossen |
| Geöffnete Rechenspur | Produktstichtag, Versicherersitzneutralität, Sachbereichsgrenzen, Dokumenttyp und Rechtsquellen zugänglich |
| Wechsel zur Beschwerde | eigenständige Gerichtskantons-, Wohnsitz- und Datumsfelder, neue Fallangaben leer, primäres Zustelldatum erhalten und altes Resultat verworfen |
| Fehlender Beschwerdezeitpunkt | gezielte Feldmeldung «Geben Sie ein gültiges Datum ein.» statt angenommener Gleichsetzung mit dem Zustelltag |
| Vollständiger Beschwerdefall | eigenes Beschwerdedatum nach Zustellung zulässig, danach ausschliesslich erwartete Kandidatensperre |
| Angeordnete Verwaltungsfrist | explizites leeres N-Tage-Feld, kein Gerichtsdatum, nach Stadienwahl ausgerichtete Zweispaltenansicht |
| Französisch | übersetzte LAMal-/AOS-Auswahl, Produktgrenze, Wohnsitzstichtag und Kandidatenhinweis geprüft |
| Schmale französische Ansicht | bei gesetzten 390 Pixeln Einspaltenmodus und vollständige Gesamtansicht visuell geprüft. DOM-Inhaltsbreite und Scrollbreite beide 375 Pixel einschliesslich normalem Scrollbarabzug, kein horizontales Überlaufen |
| Abschlusszustand | normale Breite und Deutsch wiederhergestellt, neu geladen und KVG-Einsprache mit leerem Datum und leeren Fallangaben belassen. Keine persönlichen Standards gespeichert oder zurückgesetzt |

Die native Datumsbefüllung wurde mit einer Datumstaste als tatsächliches Eingabeereignis bestätigt. Ein zunächst zu enger Testselektor für das Erlassfeld wurde nach Sichtung der tatsächlichen ARIA-Beschriftung korrigiert. Dies war kein Anwendungsfehler und wird nicht als bestandener erster Interaktionsversuch ausgegeben.

Die Browserprüfung ist eine gezielte Entwicklungsstichprobe, keine vollständige Accessibility-Konformitätsbewertung und kein Ersatz der späteren E-/Q-Hostmatrix oder menschlichen Fachabnahme.

## Bestand und Freigabegrenze

Die 53 Schutzprüfungen umfassen die bisherigen 38 geschützten Dateien sowie fünf nicht ausführbare C2-Abnahmebestandteile und zehn C2-Datenartefakte. Die historischen C1-/C2-Hashes des gemeinsamen Quellcodes bleiben historische Referenzen, nicht ein Verbot seiner vorgesehenen Weiterentwicklung. Der Sozialresolver und der Datumsübergang mussten für C3 nicht geändert werden.

Alle 28 Freigabeverknüpfungen sind weiterhin `candidate`, `approval` bleibt `null`. Kein Commit, Push, Deploy-Key, Deployment, Mirrorwechsel, Hostingzugriff oder Rechtewechsel. Das eingefrorene MVP 0.4, seine Pins und die bestehenden E/Q/P-Umgebungen bleiben unverändert. **Nächster Haltepunkt ist die fachlich-technische Abnahme von AP19C3 durch David Steimer.**

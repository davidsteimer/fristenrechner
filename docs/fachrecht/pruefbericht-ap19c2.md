# AP19C2 · Integrations- und Prüfnachweis

Prüfstand: 28. September 2026. Durchführung durch Codex als KI-Arbeitsinstrument. **Technisch fertig geprüfter lokaler Kandidat zur Abnahme durch David Steimer, keine selbst erteilte Fach- oder Betriebsfreigabe.**

## Gebundener Kandidat

Release-ID: `2026-09-28-ap19c2-candidate.1`. [Implementierung und Umfang](../architektur/implementierung-ap19c2.md), [Buildernachweis](../../outputs/ap19c2-2026-09-28/build-verification.json), [Quellenrefresh](quellenabgleich-ap19c2.md) und [Zeitbindung](zeitliche-bindung-ap19c2.md).

| Gegenstand | SHA-256 |
| --- | --- |
| [C2-Manifest](../../data/candidates/2026-09-28-ap19c2/manifest.json) | `00a45f3766b376bda21fe13966ff5aad3769cddb9fe315890bd272576520fded` |
| [Quellenprüfnachweis](../../outputs/ap19c2-2026-09-28/sources/source-review.json) | `33d2fe1c6f6e1d54a97f8a9a54c97ce4a58aea56d0158a029ffa2a5d0f43abc3` |
| [Zeitliche Bindung](zeitliche-bindung-ap19c2.md) | `617b2a66fc4644ff0b30b8acfdb5f8e38497bc47b3ae3b230345e1e2c26a3ab5` |
| [Gemeinsame Oberfläche](../../src/ui/FristenrechnerApp.tsx) | `d0f15030138b32df76270bfa544d068bb335323f4b7f6e5f7df368ac91a41806` |
| [UI-Zuordnung](../../src/ui/socialUi.ts) | `1904ebaa001846105b08bfc7d35c98cdfd8c29890dc10f5417cdd1f214fc279c` |
| [Sozialresolver](../../src/core/socialDeadline.ts) | `7c48dd7ac49bbff1049f1e68479ca9942f961c9cb3025936123115989c357780` |
| [Datumsübergang](../../src/ui/dateTransition.ts) | `0fc819ddb9921d53fe98f484835a05a6d19572d99f474908bb17b77ea9b5b4bc` |

## Automatisierte Prüfung

Node `22.23.2`, vorhandene Projektabhängigkeiten und lokale Python-Umgebung. Kein Abhängigkeitswechsel.

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript-Typecheck | bestanden |
| Gesamte Kern-/UI-Suite | **982 Tests bestanden**, 0 Fehler |
| Darin neue C2-Buildertests | 8 bestanden |
| Darin neue C2-Engineintegration und UI-Vertrag | 85 + 29 bestanden |
| Öffentliche App-Regression | 7 bestanden |
| Vollständige Python-Daten-Suite | **103 bestanden**, darin 12 neue C2-Schema-/Bindungsprüfungen |
| Vorschau- und öffentlicher Entwicklungsbuild | bestanden, kein Publikationspaket |
| SPFx-Quelltransport und bestehende Hosttests im isolierten Build | **73 bestanden**, darin 6 neue C2-Tests |
| Produktionskompilierung, CSS-Audit und isoliertes SPFx-Testpaket | bestanden |
| Tatsächlich kompiliertes ES5-/Paketverhalten | **34 bestanden**, darin 5 neue C2-Tests |
| [Bestandsschutz](../../outputs/ap19c2-2026-09-28/preservation-verification.json) | **38 Dateien unverändert** |

Die neun positiven und 15 negativen abgenommenen AVIG-Referenzfälle werden jeweils über Kassen- und Amtsstellenbindung geprüft. Positive Tests verwenden die echte Engine und ausschliesslich synthetische Freigaben im Testspeicher. Die acht echten Kandidatenpfade ergeben ohne Freigabe kein Enddatum. Zusätzlich werden die 16 C1-Regeln mit tatsächlichen Berechnungen und identischen Rechenspuren gegengeprüft.

Die Negativfälle S10, S27, S29 und S50 betreffen Stadium, Handlung oder Dauerart. Diese Eigenschaften sind durch den gewählten Regelpfad im geschlossenen Eingabevertrag festgelegt. Die Tests belegen die Ablehnung unzulässiger Übersteuerungen. Sie behaupten keine zusätzliche automatische juristische Erkennung einer falsch qualifizierten Fallsituation.

Weitere Gegenproben betreffen fehlende und widersprüchliche Zuständigkeitsfakten, fremde Kantone, ursprüngliches Verfügungsdatum nach Zustellung, fehlende Zeit- oder Feiertagsabdeckung, Kandidatenflags, manipulierte Verknüpfungen und den Jahres-/Monatswechsel Januar–Februar 2027. Eine synthetische weitere Kantonsanbindung belegt die technische Wiederverwendbarkeit derselben Bundesregel, nicht deren Freigabe für diesen Kanton.

Beim ersten Gesamtlauf schlugen zwei Strukturassertions der C1-UI-Tests fehl. Sie erwarteten das alte `socialSelection`-Rendering, während die gemeinsame Regel jetzt vor Herkunftswahl als `socialPath` angezeigt wird. Die Assertions wurden präzis angepasst, ohne fachliche Prüfungen zu entfernen. Der vollständige Endlauf besteht.

Lokale Rohprotokolle: `.work/ap19c2-final-check.log`, `.work/ap19c2-all-data-tests.log`. Der endgültige isolierte Build liegt unter `.work/ap19c-spfx-build-xtGwK9`, mit den fünf Schrittprotokollen und `verification.json`. **Nur Testpaket**, SHA-256 `8133e3af14c4d6d8a83fdfe2228ba59a7d105f2355a64372560ba0e7b40c028d`. Das bisherige SPPKG im Projekt wurde nicht ersetzt.

## Browserstichprobe

Geprüft in der lokalen In-App-Browser-Vorschau unter `http://127.0.0.1:8794/?candidate=ap19c2`, gegen den gebauten Endstand. Keine SharePoint- oder Teams-Installation.

| Probe | Sichtbarer Befund |
| --- | --- |
| AVIG-Auswahl auf Deutsch | eigener ALE-Eintrag, vier Handlungen, keine KVG-Auswahl |
| Frühes Datum | native Eingabe vor Handlung/Stadium möglich, `16.09.2026` bleibt bei Auswahl des Verwaltungswegs erhalten |
| Gerichtlicher Kassenpfad | Herkunft, Gerichtskanton, Kontrollkanton, ursprüngliches Verfügungsdatum und Feiertagsanker getrennt |
| Vollständiger Kassen-Beschwerdefall | erwartete Kandidatensperre, kein Enddatum und kein Kalenderexport, Rechenspur zunächst geschlossen |
| Angeordnete Verwaltungsfrist | freie Tageszahl, ausdrücklich aktueller Zuständigkeitsbezug statt erfundenem Verfügungsdatum |
| Wechsel Kasse auf Amtsstelle | Kassen-Zeitanker verschwindet, abhängige Zuständigkeitsangaben werden geleert, Empfangsdatum bleibt erhalten |
| Französische Oberfläche | AVIG/LACI-Verwaltungsansicht mit übersetzten Feldern und Kandidatenhinweis geprüft |
| Zweispaltiger Endstand | feste Modellfelder und dynamische Herkunfts-/Datumsfelder ausgerichtet, vier Schaltflächen weiterhin in zwei Zeilen |
| Schmale französische Ansicht | bei gesetzten 390 Pixeln Breite Einspaltenmodus, DOM-Inhaltsbreite und Scrollbreite beide 375 Pixel einschliesslich normalem Scrollbarabzug, kein horizontales Überlaufen |
| Abschlusszustand | normale Fensterbreite und Deutsch wiederhergestellt, neue Vorschau mit leeren Fristdaten belassen, keine Standards gespeichert |

Die erste automatisierte Datumsbefüllung über `fill` war lediglich im nativen Editor sichtbar und nicht zuverlässig als React-Änderung übernommen. Die Wiederholung mit einer nativen Datumstaste bestätigte die tatsächliche Eingabe und deren Erhaltung über nachfolgende Auswahlwechsel. Daraus wird kein Produktfehler abgeleitet und der nicht übernommene erste Versuch nicht als bestandene Probe gezählt.

Die Browserprüfung ist eine gezielte Entwicklungsstichprobe. Sie ersetzt weder eine vollständige Accessibility-Konformitätsbewertung noch die spätere E-/Q-Hostmatrix oder die menschliche Fachabnahme.

## Bestand und Freigabegrenze

Die 38 Schutzprüfungen umfassen die 23 bereits in C1 geschützten AP19A-/AP19B-, Release- und Benutzerdateien sowie fünf nicht ausführbare C1-Abnahmebestandteile und sämtliche zehn C1-Datenartefakte. Die damaligen Hashes der C1-UI-Quelldateien bleiben historische Referenzen. Der gemeinsame Quellcode darf für C2 weiterentwickelt werden, ohne die C1-Abnahme rückwirkend umzuschreiben.

Alle 24 Freigabeeinträge im neuen Katalog sind weiterhin `candidate`, `approval` ist `null`. Kein Commit, Push, Deployment, Mirrorwechsel, Hostingzugriff oder Rechtewechsel. Das eingefrorene MVP 0.4, dessen Release-Pins und die bestehenden E/Q/P-Umgebungen bleiben unverändert. Nächster Haltepunkt ist die fachlich-technische Abnahme dieses C2-Kandidaten durch David Steimer.

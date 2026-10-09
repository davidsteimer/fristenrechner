# AP22C3 Abnahme von Datenanbindung und Hostintegration

Datum: 8. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP22C3 ist abgenommen.

**AP22C3 ist abgenommen. Damit sind AP22C1 bis AP22C3 und die lokale Kalenderintegration abgeschlossen.** Gegenstand ist die [C3-Implementierung](../architektur/kalenderintegration-ap22c3.md) mit vollständiger Format-7-Datenanbindung, konfigurationsgebundenem Provider-/Cachefallback, gemeinsamen Web-/SPFx-Hosts und historischer Regression einschliesslich AP5.

## Abgenommener Prüfstand

Der vorgelegte Nachweis enthält 2'198 bestandene Produkttests, 35 gezielte C3-Kern-/UI-/Hosttests, 186 SPFx-Quelltests, 72 Tests am gebauten SPFx-Paket und 14 unabhängige C3-Python-Prüfungen. Die Testgruppen überschneiden sich teilweise. Die lokale Browserprüfung umfasst unter anderem die Tessiner Berechnung, den sperrenden Januarvergleich sowie die französische Sozialrechnung in schmaler Darstellung. Diese Ergebnisse stammen aus dem vorgelegten Prüflauf. Sie wurden für die Abnahmedokumentation nicht neu erzeugt und sind keine realen E-/Q- oder iOS-Nachweise.

Vor der Nachführung der lebenden Einstiegstexte wurden 204 gebundene Dateien einschliesslich Quellstand, Kandidatendaten, Prüfnachweisen, Browserbildern, lokalem Webbuild und isoliertem SPFx-Testpaket anhand von SHA-256 und Byteanzahl geprüft und separat [archiviert](../../outputs/ap22c3-abnahme-2026-10-08/receipt.json).

| Nachweis | SHA-256 |
| --- | --- |
| Ursprüngliches Abschlussregister | `597594edbc022940f4ef26a20fdc0f0c31614dc58d87df604e7fdbc3efaba5d5` |
| Abnahmeregister receipt.json | `399186439f8a44a4d604042fc48191dcc3646d5d856568ff6e9b565dfb25ca31` |

Integrationsbericht und technische Prüfprotokolle behalten ihre damalige Kennzeichnung als Vorlage zur Abnahme. Der aktuelle menschliche Abnahmeentscheid steht in dieser Notiz. Die im Prüfprotokoll gebundenen damaligen README-/Planungsstände liegen in der Abnahmekopie. Die lebenden Dokumente führen den heutigen Status nach.

## Grenzen und nächster Schritt

Die Abnahme ist keine Quellenreleasefreigabe, Datenpromotion, Freigabe eines Installationsartefakts oder Erlaubnis zur Veröffentlichung beziehungsweise E-/Q-/P-Bereitstellung. Der lokale Kandidat bleibt im Referenzmodus mit gesperrtem Kalenderexport. Die produktive MVP-0.6-Version, ihre Pins, Mirrors und Installationen bleiben unverändert.

Die 44 Sozialregeln und 50 Berner Anbindungen bleiben fachlich unverändert und auf den bisherigen Kontext sowie 2026–2027 beschränkt. Es werden keine weiteren Sozialanbindungen, kantonalen Verwaltungsverfahren oder kommunalen Erlasse freigegeben. Die beschlossenen Januargrenzen und GR-/NE-Vorbehalte bleiben erhalten.

Gemäss [Releaseplanung MVP 0.7](../planung/release-mvp07.md) folgt AP21 mit der einheitlichen linksbündigen Datumseingabe, iOS-Korrektur, Eingabekürzeln und realer Geräteprüfung. AP21 ist noch nicht gestartet. Quellenprüfung und Releasebereitstellung folgen nach den erforderlichen Paketabnahmen und gesonderten Freigaben.

David Steimer nimmt Fachverantwortung und Abnahme in Personalunion wahr. Codex dokumentiert und implementiert als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

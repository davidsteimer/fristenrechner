# AP23D2 Abnahme einschliesslich UX-Nachtrag

Datum: 15. Oktober 2026. Entscheider: David Steimer.

**David Steimer hat AP23D2 einschliesslich des UX-Nachtrags abgenommen und den Beginn von AP23D3 beauftragt.** Abgenommen sind die lokale TI-/GR-Oberfläche, Defaults 5, die Herkunftsbindung des Exports sowie die überarbeitete Feiertagsanknüpfung und lesbare DE-/FR-Rechenspur. Der zweispaltige Aufbau und die fachlichen Rechenregeln bleiben erhalten.

## Gegenstand und gesicherter Nachweis

Die [D2-Umsetzung](../architektur/verwaltungsintegration-ap23d2.md) und der [UX-Nachtrag](../architektur/verwaltungsintegration-ap23d2-ux.md) beschreiben den abgenommenen Stand. Der abschliessende UX-Prüflauf weist 133 D2-Tests, 2507 Tests der Produktregression, 1584 historische Resultat-/Rechenspurvergleiche und acht lokale Browserprüfungen aus.

| Nachweis | SHA-256 |
| --- | --- |
| Ursprünglicher D2-Prüfbericht | `6e6a7650e0f24f0567cb3dd90d1e81c7958ebc15dbd7d01b582045bff60923f9` |
| Abschliessender UX-Prüfbericht | `1c4108a94300cd7289e180ebce2f12acbde641d5a488ca23dc6730a1296fa180` |
| [Abnahmekopie und Inventar](../../outputs/ap23d2-abnahme-2026-10-15/receipt.json) | `536e83bae2216ef17e3a13dbb3aa9e6349e84a1cfd5c3ae8cef66a6ee9240ff5` |

103 Artefakte wurden vor Beginn der D3-Änderungen erneut gegen ihre gebundenen Prüfsummen geprüft und unter ihren relativen Pfaden gesichert. Die Abnahmekopie setzt den ursprünglichen D2-Quellbestand mit den ausdrücklich hashgebundenen Änderungen des späteren UX-Nachtrags zusammen. Sie enthält beide unveränderten Berichte und kennzeichnet die durch den UX-Nachtrag abgelösten Dateistände. Es werden keine alten Quellstände rekonstruiert oder ursprüngliche Sollwerte umgeschrieben.

Die historischen Berichte behalten ihren damaligen Status «zur Abnahme» und `accepted: false`. Die heutige Abnahme steht ausschliesslich hier und im separaten Archivbeleg.

## Gestarteter Umfang und Grenzen

AP23D3 umfasst den gemeinsamen Format-8-Laufzeitpfad einschliesslich der fünf bisherigen Profile, Provider- und Cacheintegration, synchronisierte SPFx-Produkt- und Schemakopien, lokale Web-/SPFx-Kandidaten sowie Gesamtregression und AP5-Schutz. Neue kantonale Wege werden nicht als bestehende Profile oder Format 7 ausgegeben.

Die lokale Referenz bleibt von einer operativen Datenfreigabe getrennt. Quellenreleaseprüfung, Datenpromotion, definitive Produktversion, konkreter Rückfallweg, E-/Q-Installation, reale Geräte-/Gastprüfung sowie GitHub/P-Veröffentlichung sind spätere Schritte. Bestehende Releases und Pins, Mirrors, M365-Berechtigungen und Richtlinien bleiben unverändert. David Steimer entscheidet und nimmt ab. Codex bereitet als Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung vor.

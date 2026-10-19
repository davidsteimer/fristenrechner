# UX-Dokumentation

**Aktuell, 19. Oktober 2026:** Die Datumshöhenkorrektur #50 ist Bestandteil des abgenommenen MVP09-Pakets und der [Q-Abnahme einschliesslich Geräteprüfung](../betrieb/abnahme-q-mvp09.md). T06-H01 und B11-H01 bleiben begrenzt akzeptierte Nacharbeit für den Folgerelease. Die folgenden Einträge dokumentieren ihren jeweiligen damaligen Entscheidungsumfang und ersetzen nicht die anschliessende Q-Abnahme.

Dieser Bereich beschreibt Interaktionsmuster und zweisprachige Produkttexte, bevor sie in der Oberfläche implementiert werden.

- [AP11A-Skizze für VRPG-Spezialregime](vrpg-spezialregime-ap11a.md)
- [AP17-Bedienkonzept und schlanker Realisierungsplan](vrpg-bedienkonzept-ap17.md), Bedienkonzept mit [DEC-2026-019](../entscheidungen/DEC-2026-019-gestufte-vrpg-bedienung.md) beschlossen, AP17A am 11. September 2026 und AP17B am 12. September 2026 abgenommen, [AP17C lokal integriert](../architektur/vrpg-integration-ap17c.md) und am 12. September 2026 durch David Steimer fachlich abgenommen, Releasefreigabe ausstehend

Die Dokumente sind Funktions- und Textverträge. Die visuelle Umsetzung und Barrierefreiheitsprüfung erfolgen im jeweiligen Realisierungsarbeitspaket.

Die abgenommenen historischen Unterlagen bleiben unverändert. Die Freigabe einer Bedienreferenz gibt weder neue Rechtsregeln noch einen Datenrelease oder eine produktive Bereitstellung frei.

## Offene UX-Nacharbeit für den Folgerelease

### T06-H01 – Datenquellenzeile im SPFx-Wrapper

**Status vom 19. Oktober 2026:** Korrektur für den Folgerelease vorgemerkt, noch nicht umgesetzt. David Steimer hat den begrenzten Darstellungsbefund ausdrücklich für MVP 0.9 akzeptiert und die Fortsetzung der übrigen Prüfungen mit dem unveränderten Paket erlaubt. Die Entscheidung und der ursprüngliche Befund stehen im [R09-C-Vollzugsnachweis](../betrieb/eq-vollzugsnachweis-mvp09.md). Dies ist ein lokaler Nacharbeitseintrag, keine neue GitHub-Karte und keine Abnahme der restlichen technischen Matrix oder von Q.

| Punkt | Begrenzter Auftrag und Abnahmekriterium |
| --- | --- |
| Befund | Die eigene zweisprachige technische Datenquellenzeile des SPFx-Wrappers wird bei tatsächlichem 300-Prozent-Browserzoom in DE und FR rechts abgeschnitten. Bei breiter 100-Prozent-Ansicht ist sie vollständig lesbar. Derselbe begrenzt akzeptierte Beschnitt tritt auch in der schmalen französischen 400-CSS-Pixel-Ansicht bei 100 Prozent auf und ist auf den Q-Hosts bestätigt. Nicht mit einer fremden SharePoint-Navigation oder dem Datumsfeldbefund #50 gleichsetzen |
| Korrekturziel | Beschriftung und Providerwert vollständig zugänglich halten. Geeigneten Zeilenumbruch und eine korrekte Breitenberechnung einschliesslich Padding mit `border-box` vorsehen. Kein abgeschnittener Text und kein verdecktes Überlaufen |
| Regression | DE und FR auf den tatsächlichen SharePoint- und Teams-Hosts jeweils bei 100 und 300 Prozent sowie breiter und schmaler Ansicht prüfen. Formular, Pflichtfelder, Resultat, Datenquellenzeile, Tastaturfokus und Bedienbarkeit müssen erhalten bleiben. Zoom anschliessend auf den Ausgangswert zurückstellen |
| Abgrenzung | Rein visuelle Wrapper-Korrektur. Rechenlogik, Rechtsdaten, Datenbindung und Providerwahl bleiben unverändert. Aus dem Darstellungsbefund wird keine Rechen- oder Datenwirkung abgeleitet |
| Umsetzung und Freigabe | Separat umsetzen, prüfen und im Folgerelease freigeben. Die begrenzte Akzeptanz für MVP 0.9 ist weder Fehlerbehebung noch dauerhafte Ausnahme oder vorweggenommene Abnahme dieser Korrektur |

Die bestehenden MVP-0.9-Pakete und der historische Befund werden durch diesen Planungseintrag nicht verändert.

### B11-H01 – Diagnosetext bei früher Zeitgrenzsperre

**Status vom 19. Oktober 2026:** Textkorrektur für den Folgerelease vorgemerkt, noch nicht umgesetzt. David Steimer hat B11-H01 ausdrücklich begrenzt für MVP 0.9 akzeptiert und die weitere gebundene Hostprüfung mit dem unveränderten Paket genehmigt. Der [gesonderte Entscheidnachtrag im R09-C-Vollzugsnachweis](../betrieb/eq-vollzugsnachweis-mvp09.md) erhält den ursprünglichen offenen Befund. Dieser lokale Nacharbeitseintrag ist keine GitHub-Mutation und keine fachliche, technische Gesamt- oder Betriebsabnahme.

| Punkt | Begrenzter Auftrag und Abnahmekriterium |
| --- | --- |
| Befund | Zuerst beobachtet beim vollständig qualifizierten GR-Verwaltungsverfahren mit angeordneter Eintagesfrist und Empfang 28.08.2026 sperrt die Fallabdeckung korrekt vor dem Aufbau der Ergebnis-Provenienz. Der allgemeine Darstellungshinweis behauptet dennoch nicht sicher auflösbare Bezeichnungen und vollständige Angaben unter «Technische Nachweise». Dort sind in diesem frühen Abbruchfall nur leere Stillstands-/Feiertagslisten, nicht die versprochene vollständige Ergebnisherkunft sichtbar |
| Bestätigte allgemeine Ausprägung | Derselbe frühe Abbruch vor Ergebnis-Provenienz ist bei GR sowie LU mit Empfang 26.09.2026 und ZG/AR mit Empfang 28.08.2026 belegt. Die administrative Abdeckungsprüfung und der anschliessende generische Darstellungszweig sind kantonsunabhängig. Die ursprüngliche begrenzte Entscheidfrage war allgemein formuliert, der chronologische Journalnachtrag präzisiert die später engere GR-Beschreibung. Keine neue Akzeptanz anderer Ursachen oder Fehlfunktionen |
| Korrekturziel | Frühen Abbruch ohne Ergebnis-Provenienz sprachlich und in der Anzeige von tatsächlich nicht auflösbaren Bezeichnungen unterscheiden. Den vorhandenen konkreten Sperrgrund verständlich belassen. Weder eine fehlende Ergebnisherkunft als blosses Labelproblem darstellen noch vollständige technische Angaben versprechen, die nicht vorhanden sind. Keine Herkunft nachträglich erfinden |
| Betroffene Darstellung | `src/ui/administrativeUi.tsx` und die DE-/FR-Texte in `src/ui/administrativeMessages.ts`. Die frühe Kernprüfung und Exportsperre erklären den Befund, sind nicht als aufzuweichende Fehlfunktion zu behandeln |
| Regression | DE und FR für die allgemeine frühe Abdeckungssperre prüfen: GR 28.08.2026/ein Tag, LU/A13 26.09.2026/gesetzliche 30 Tage sowie ZG/A17 und AR/A21 28.08.2026/gesetzliche 20 Tage. Jeweils konkrete Zeitgrenzsperre, kein definitives Enddatum, kein Export und kein unzutreffendes Vollständigkeitsversprechen. GR-Nachbarkontrolle 29.08.2026/ein Tag: 31.08.2026 mit korrekter Herkunft und Export. Für LU/ZG/AR zusätzlich die unveränderten positiven A13-/A17-/A21-Kontrollen mit korrekter Herkunft und Export prüfen. Späteren Berechnungsabbruch 31.12.2027/einem Tag mit vorhandenem Herkunftskontext sowie tatsächlich nicht auflösbare Darstellungsdetails getrennt prüfen. Andere frühe Sperrgründe dürfen keine erfundene Herkunft erhalten |
| Abgrenzung | Nur begrenzte Diagnose-/Darstellungskorrektur. Rechenlogik, Abdeckungsfenster, Rechtsdaten, Kalenderbindung, Qualifikation und Exportbedingungen bleiben unverändert. Keine Gleichsetzung mit T06-H01 und keine pauschale Akzeptanz weiterer Befunde |
| Umsetzung und Freigabe | Separat im Folgerelease umsetzen, prüfen und freigeben. Die Akzeptanz für MVP 0.9 ist keine Behebung, keine dauerhafte Ausnahme und keine vorweggenommene Abnahme der Korrektur |

Das bestehende Paket, die gesperrten Rechenzustände und die historischen Nachweise bleiben durch diese Vormerkung unverändert.

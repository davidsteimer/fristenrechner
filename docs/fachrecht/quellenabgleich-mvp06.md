# MVP 0.6 · Zusammengeführte Quellenprüfung

Stand: 1. Oktober 2026. **Technisch abgeschlossen und zur menschlichen Gesamtquellenabnahme vorgelegt. Keine fachliche Gesamtquellenabnahme oder Datenfreigabe vorweggenommen.**

## 1. Umfang und Methode

Der Bericht führt die Quellenprüfung für die abgenommenen AP20C1-/C2-/C3-Integrationen und den unveränderten Bestand aus MVP 0.5 zusammen. Der Funktionsumfang bleibt bei 44 nationalen Regeln und 50 konkret qualifizierten Berner Anbindungen. Das Quellen- und Anwendungsfenster bleibt 2026–2027.

| Quellenmenge | Tatsächliche Behandlung |
| --- | --- |
| Sechs EOG-/EOV-Referenzen | Am 1. Oktober erneut aus amtlichen Originalen und Versions-/Änderungsindices geprüft. Sechs Originale bytegleich zu AP20B, tragende Artikel unverändert |
| 26 weitere Manifestreferenzen | Gleichtägige C2-/C3-Nachweise mit genauer Quellen-, Fassungs- und Artikelzuordnung übernommen. Technisch unterschiedliche ATSG-/ELG-Originalrepräsentationen werden gesondert abgeglichen, siehe Abschnitt 2 |
| 45 bisherige Manifestreferenzen | Frischer abgegrenzter Restabgleich. Originalidentität und ausdrücklich wiederverwendete frühere Artikelauswertung werden von erneuter inhaltlicher Lektüre unterschieden |
| 82 zusätzliche Katalogreferenzen | Vorgeschlagene Wiederverwendung der am 22. September abgenommenen Gesamtprüfung und der am 28. September für MVP 0.5 akzeptierten Übernahme. Kein neuer Vollabruf dieser 82 Quellen |
| **159 unterschiedliche Quellen-IDs** | 77 im Manifest plus 84 im Feiertagskatalog abzüglich zweier Überschneidungen |

Die 24 neuen Quellen-IDs sind nicht 24 neue Erlasse. Darunter sind Fassungen, Aliasbezüge, Zuständigkeits- und Ausschlussbelege. Der unveränderte Schweizer Feiertagskatalog bleibt eine Grundlage für den späteren Ausbau und aktiviert keine zusätzlichen kantonalen Fristenprofile.

## 2. Frische Kontrolle und bewusst wiederverwendete Auswertung

### EOG/EOV und AP20

Der neue [EOG-/EOV-Nachweis](../../outputs/release-mvp06-2026-10-01/sources/ap20c1-refresh.json) aktualisiert den C1-Stand vom 30. September. Sechs amtliche Originalfassungen, sechs Fassungszeilen und 91 Änderungszeilen wurden verglichen, davon 89 im Zukunftsfenster ab 1. Oktober. Relevante Artikel sind unverändert. EOG 2027 Art. 16mbis, 16sbis und 16x wurden zusätzlich zur Abgrenzung kantonaler Zusatzleistungen gelesen, nicht zur Freigabe neuer positiver Fallwege.

Die C2-/C3-Belege decken weitere 26 Quellen-IDs innerhalb ihrer jeweiligen Reichweite ab. Das [vorläufige Quelleninventar](../../outputs/release-mvp06-2026-10-01/source-inventory.json) enthält diese Zuordnung sowie die ursprünglich noch offenen 45 Restpositionen. Es wird als damaliger Arbeitsstand unverändert erhalten und allein nicht als vollständiger Releasebeleg verwendet.

Bei fünf Zuordnungen greift die verwendete Normenbasis weiter als die neue C3-Artikellektüre. Das betrifft ATSG Art. 57, die breiteren ELG-Artikel und zwei VRPG-Referenzen. Die Gegenprüfung hat bei ATSG 2024 und ELG 2026 zwei unterschiedliche XML-Repräsentationen zwischen MVP 0.5 und AP20B/C3 festgestellt. Die pauschale Originalidentitätsannahme des vorläufigen Inventars ist insoweit nicht tragfähig und wird ausdrücklich korrigiert.

Der [zusätzliche Normtextvergleich](../../outputs/release-mvp06-2026-10-01/sources/source-original-bridges.json) schliesst diese Beleglücke: Alle vier Originaldateien wurden frisch abgerufen und gegen ihre jeweils gebundenen Prüfsummen kontrolliert. Alle 21 verwendeten Artikeltexte einschliesslich ATSG Art. 57 und ELG Art. 21 sowie die Absatzinhalte und ihre Reihenfolge stimmen überein. ELG Art. 21 Abs. 2 ist zusätzlich separat bestätigt. Unterschiede in technischen XML-Absatzkennungen bei ATSG Art. 38 und 55 bleiben sichtbar. Redaktionelle Fussnoten wurden getrennt verglichen und sind im geprüften Umfang ebenfalls gleich. Es wird weder Identität der ganzen Dateien noch sämtlicher Artikel beider Erlasse behauptet.

Für ELG 2027 stimmt die Originalidentität. Beim VRPG trägt die frisch bestätigte vollständige API-Antwort die Wiederverwendung, nicht allein ein Vergleich ausgewählter historischer PDF-Dateien. Der Gesamtbefund unterscheidet diese drei verbleibenden breiteren Wiederverwendungen von den zwei nun frisch normtextlich verglichenen Quellenzuordnungen.

Auch die technische Änderungsabfrage wurde nachgeschärft. Die vorherige AP20-Abfrage belegte die Erfassung von Änderungen ganzer Erlasse nicht zuverlässig. Der [neue Indexnachtrag](../../outputs/release-mvp06-2026-10-01/sources/ap20-index-addendum.json) prüft zwölf Erlasse einschliesslich ATSG, ELG und der ergänzend herangezogenen FamZV mit ausdrücklich erfassten Gesamt- und Artikeländerungen. Er bestätigt 19 überlappende Fassungen und 100 Änderungszeilen, darunter keine Änderung eines ganzen Erlasses. Die zehn Vergleiche innerhalb der früheren jeweiligen Prüffenster sind identisch.

Eine zusätzliche ELG-Zeile wird nicht als Null-Differenz ausgegeben: Das erweiterte Jahresfenster erfasst nun auch Art. 11 ELG nach AS 2025 704, in Kraft seit 1. Januar 2026. Die [gesonderte Bewertung](../../outputs/release-mvp06-2026-10-01/sources/ap20-index-assessment.json) bestätigt anhand der frisch hashgebundenen 2026-Originalfassung die Nichtanrechnung der 13. Altersrente als materielle Leistungsregel. Sie liegt ausserhalb der verwendeten Frist- und Zuständigkeitsartikel und verlangt keine Änderung am Rechenmodell. Der rohe Indexbefund mit einer zusätzlichen Zeile bleibt unverändert erhalten. Dies ist weder ein neu entdecktes künftiges Inkrafttreten noch eine pauschale Prüfung materieller Leistungsansprüche.

### Bisheriger Rechenbestand, Zukunftsstände und bekannte Entscheide

Der [Restquellennachweis](../../outputs/release-mvp06-2026-10-01/sources/remainder/source-review.json) löst genau 45 weitere Manifestquellen auf. Seine 53 unterschiedlichen erfolgreichen HTTP-Abrufe umfassen:

- 32 amtliche Grundlagenoriginale und fünf ergänzende amtliche Zukunfts-/AS-/BBl-Texte, sämtlich bytegleich mit ihren gebundenen Vorfassungen.
- Zehn bekannte Entscheidkopien. Neun sind bytegleich, deren frühere punktuelle Auswertung wird ausdrücklich wiederverwendet. BGer 8C_767/2008 wurde zusätzlich über Entscheidsuche identifiziert und E. 4.3.1/4.3.2 erneut gelesen. Keine Erweiterung auf sämtliche späteren gerichtlichen Fristen, keine umfassende Suche nach neuer Rechtsprechung und keine Umdeutung von Spiegeln in amtliche Publikationsstellen. OpenCaseLaw war in dieser Sitzung nicht als aufrufbarer Connector verfügbar und wird nicht als verwendet ausgewiesen.
- Zwei amtliche Indices für 14 Erlasse. 91 Änderungen im Fenster 2026–2027, davon 70 bereits in den geprüften Fassungen erfasst und 21 künftige mit der abgenommenen MVP-0.5-Auswertung identisch. Ganze Erlasse und Unterteilungen sowie überlappende Fassungen sind einbezogen.
- Die BJ-Monitoringseite und die AVIV-Verfügbarkeitsprüfung. Der sichtbare BJ-Inhalt ist unverändert, obwohl sich technische HTML-Bytes unterscheiden. Die AVIV-Februarfassung liefert weiterhin eine HTML-Anwendungshülle statt eines XML-Gesetzestexts.
- Zwei ergänzende BGG-/ZPO-Originale vom 1. Januar 2025. Neun Paare relevanter Fristartikel sind mit den späteren 2026-Fassungen identisch. Keine Rückdatierung der späteren Fassungen.

Erfolgreicher HTTP-Abruf, Byteidentität, Normtextgleichheit und unveränderte fachliche Auslegung sind verschiedene Aussagen. Die Belege weisen diese Methoden getrennt aus. Technisch gescheiterte erste Abrufe und die Erweiterung der Indexabfrage bleiben als Abrufhistorie erhalten, sie gelten nicht als fachliche Unverfügbarkeit oder bestandene Prüfung.

## 3. Weitergeltende Vorbehalte und Grenzen

- **AI:** Widerspruch zwischen Feiertagsliste und gesetzlicher Regel weiterhin `unclear`. Die bereits beschlossene gesetzliche Behandlung bleibt unverändert. Keine amtliche Berichtigung behauptet.
- **AVIV ab Februar 2027:** Option B bleibt notwendig. Die amtlichen Änderungsgrundlagen sind erneut geprüft. Eine verfügbare konsolidierte Februar-Vollfassung wird nicht behauptet.
- **OF-001:** Weiterhin offen. BJ-Dossier, Referendumstext, verwendete BGG-/VwVG-Fassungen und amtlicher Änderungsindex ergeben keinen Beleg für die vorgezogene Aktivierung der neuen Zustellungsfiktion. Kein unbelegtes Inkraftsetzungsdatum wird eingetragen. Die neue Zuordnung verwendet die tatsächlichen BGG-/VwVG-IDs und keine unpassenden alten StPO-/ZPO-IDs.
- **NE und Feiertagskatalog:** Vorbehalt zusätzlicher örtlicher beziehungsweise jährlicher Einzelfestlegungen bleibt bestehen. Die 82 nicht operativen Katalogquellen behalten ihren tatsächlichen Prüfstand vom 22. September, nicht das Datum dieses Berichts.
- **Ausschlusspfade:** EOG 2027, EGKUMV-, ÜLV- und einzelne Entscheidbelege dürfen nicht allein wegen ihrer Registeraufnahme als positive neue Fallfreigabe ausgegeben werden.
- **Aktualität:** Keine neue Jahresvollprüfung. Bisheriger nächster ordentlicher Termin 15.11.2027 unverändert. Bei Verzögerung oder neuen Änderungshinweisen ist die Aktualität vor dem tatsächlichen Release nochmals zu beurteilen.

## 4. Technische Absicherung und Freigabegrenze

Die [Eingangssicherung](../betrieb/vorpruefung-mvp-06.md) bindet Kandidat, Abnahmen, Referenzen und bisherigen Produktionsstand. Der [abschliessende Quellen-Vollständigkeitsnachweis](../../outputs/release-mvp06-2026-10-01/source-review-completeness.json) löst alle 77 Manifestquellen eindeutig auf, weist die 82 wiederverwendeten Katalogquellen gesondert aus, prüft die beiden erforderlichen Normtextbrücken und erhält den AI-Konflikt. Seine SHA-256-Prüfsumme lautet `a389456a87f57e595818c76852360162daab58cc772fda82ae8de8100225c7bb`. Er umfasst 166 Nachweisdateien, darunter 164 eindeutige ausdrücklich gebundene Hashreferenzen. Historische menschliche Abnahmen bestätigen nur ihren damaligen Stand, nicht automatisch MVP 0.6.

Alle 42 Positiv- und Negativtests der Quellenkonsolidierung sind bestanden. Eine zweite KI-Prüfung hat die vereinbarten Prüfpunkte unabhängig nachvollzogen und dieselben 42 Tests erneut erfolgreich ausgeführt. Sie ersetzt keine menschliche Fachabnahme und kein personelles Vieraugenprinzip. Die wiederholte Konsolidierung reproduziert den gespeicherten Nachweis bytegenau.

Die vollständige Nachprüfung ist lokal reproduzierbar. Sie verwendet auch nicht publizierte amtliche Rohantworten und einen Connector-Rohbeleg. Die öffentliche Reproduzierbarkeit ist deshalb vor GitHub als gesonderter [Publikationspunkt P06-01](../betrieb/deployment-mvp-06.md) zu erledigen, nicht bereits als erfüllt ausgewiesen.

Das aktive Quellenregister, der Quellenindex, die freigegebenen Daten, produktive Datenpins, Paketversionen und E/Q/P bleiben unverändert. Der spätere Registerzuwachs von 24 Referenzen und die Freigabeverknüpfungen aller 50 Anbindungen gehören zur separat zu autorisierenden kontrollierten Übernahme.

Dieser Bericht wird David Steimer zur Gesamtquellenabnahme einschliesslich der ausdrücklich beschriebenen Wiederverwendung und fortbestehenden Vorbehalte vorgelegt. Kontrollierte lokale Datenübernahme und definitive Artefaktbauten können gleichzeitig beauftragt werden. Installation, GitHub-Push, Deploy-Key, Hosting- und Berechtigungsänderungen sind nicht umfasst.

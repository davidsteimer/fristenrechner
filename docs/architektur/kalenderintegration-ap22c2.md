# AP22C2 Rollen, Gebiete, Vergleichsrechnung und Oberfläche

Stand: 8. Oktober 2026. Grundlage: [DEC-2026-030](../entscheidungen/DEC-2026-030-beschluss.md) und [abgenommener AP22B-Vertrag](kalendervertrag-ap22b.md). AP22C1 ist [abgenommen](../fachrecht/abnahme-ap22c1.md). C2 ist lokal umgesetzt und wird David Steimer zur Teilpaketabnahme vorgelegt. Es liegt keine Betriebs- oder Releasefreigabe vor.

## Ergebnis und Umfang

Die gemeinsame DE-/FR-Oberfläche erhält im ausdrücklich aktivierten C2-Prüfmodus die schweizweite Feiertagszuordnung für StPO, ZPO, BGG und VwVG. Die Zustellkonstellation und der tatsächlich massgebende Feiertagskanton werden getrennt vom Sitz der zuständigen Stelle erfasst. Der Bund ist kein Ersatzfeiertagskanton. Aus der Kombination wird genau eine terminale Verfahrensbindung aufgelöst.

- ZPO verwendet den Gerichtssitz als fest angezeigte Rolle. Es gibt keine künstliche Einzelauswahl.
- StPO, BGG und VwVG verlangen die ausdrücklich gewählte Partei ohne Vertretung oder eine eindeutig bestimmte qualifizierte Zustellvertretung. Andere oder ungeklärte Konstellationen liefern kein definitives Resultat.
- Bei AI und NE wird die relevante regionale Zugehörigkeit ausdrücklich mit Ja oder Nein angegeben. Eine fehlende Antwort wird nicht als Nein behandelt.
- Für AG, FR und SO wird die gebundene verfahrensrechtliche Liste verwendet. Es wird keine frei kombinierbare Gemeindeliste ergänzt.
- Die berechenbaren GR- und NE-Vorbehalte richten sich nach dem tatsächlich verwendeten Feiertagskanton, nicht nach dem Sitz der zuständigen Stelle.

Behördenauswahl und Feiertagsanknüpfung bleiben unterscheidbar. Die bestehenden Berner VRPG- und Sozialfunktionen werden weder geografisch noch zeitlich erweitert. Es wird kein zusätzliches kantonales Verwaltungsverfahren freigegeben.

## Vollständiger Januarvergleich

Für SH/StPO sowie SG/StPO, SG/BGG und SG/VwVG werden zwei vollständige Berechnungen ausgeführt. Variiert wird ausschliesslich die konkret gebundene unsichere Regel für den 2. Januar. Zustellwirkung, Fristbeginn, rechnerisches Ende und definitives Ende werden verglichen. Unterschiedliche Protokolllängen allein begründen keine rechtliche Abweichung.

| Ergebnis des Vergleichs | Verhalten |
| --- | --- |
| Beide Pfade gedeckt und rechtlich identisch | Berechnung möglich, Vergleich in der Rechenspur |
| Rechtliches Ergebnis unterschiedlich | Einzelfallklärung, kein definitives Fristdatum, kein Export |
| Mindestens ein Pfad nicht gedeckt | Kein Rückgriff auf den anderen Pfad, kein definitives Fristdatum, kein Export |

Der Vergleich erfasst auch Fälle, in denen eine Endverschiebung erst zum 2. Januar führt. Die vorhandene ZPO-Berechnung der ordentlichen Postzustellung verwendet denselben qualifizierten Kalender. Ein alter `calendarId`, eine manuelle Kalenderauswahl oder weitere Anknüpfungskandidaten können die neue Auflösung nicht umgehen.

## Zeit- und Integrationsgrenzen

Die Kalenderbindungen beginnen am 29. August 2026. Der vollständige verwendete Rechenweg muss durch Bindungsfenster, Profil, angewandte Normen, Gebietsstand und Kalenderregeln gedeckt sein. «Offen» ist keine Zusicherung unverändert geltenden Rechts für beliebige künftige Jahre. Die bernischen Sozialfreigaben 2026–2027 bleiben unverändert.

C2 ist ein **lokaler Referenzadapter**, noch keine vollständige Format-7-Hostintegration. Er erhält den unveränderten MVP-0.6-Bestand als Basis und verwendet die 32 gebundenen C1-Kalender ausschliesslich für die vier qualifizierten Bundesprofile. Die beiden historischen CH-/BE-Kalender im Format 2 dienen der vollständigen Projektionsprüfung. Anschliessend wird eine vorübergehende Berechnungsansicht mit den neuen Kalendern erzeugt. Der bisherige allgemeine Datenreader wird nicht stillschweigend für Format 7 geöffnet.

Der konservative Intervallschnitt sperrt künstliche oder künftige disjunkte Norm- und Gebietsstände, statt sie ungeprüft zu verbinden. Auch ein relevanter Profilregelwechsel innerhalb des Falls wird gesperrt. Der abgenommene C1-Bestand benötigt keine solche automatische Versionsverkettung. Eine spätere Erweiterung muss mit eigenen Übergangsreferenzen geprüft werden.

Die neue Laufzeitkonfiguration ist eine Hostvorgabe, kein Benutzereingabefeld und kein gespeicherter Standard. Die lokale Vorschau setzt ausdrücklich `referenceOnly: true`. Diese Prüfrechnungen sind klar bezeichnet und exportieren keine Kalenderdatei. Der operative Pfad verlangt eine passende Releasefreigabe. Die echte Format-7-Datenfabrik sowie Provider, Cache und Hostkonfiguration bleiben C3 vorbehalten.

## Bedienung und Standards

Der zweispaltige Aufbau bleibt erhalten. Empfangsdatum und Frist können früh eingegeben werden. Fehlende Kalenderangaben verhindern die Berechnung, nicht die Datumseingabe. Die vier Aktionsschaltflächen bleiben direkt unter den Eingaben in zwei Zeilen. Quellen, Verfahrensbindung, Kalenderkennung, vollständiger Kataloghash und Vergleichshinweise stehen in der Rechenspur. Die Hauptoberfläche enthält keine zusätzlichen technischen Detailblöcke.

Jede relevante Eingabeänderung verwirft das alte Resultat und einen vorbereiteten Kalenderexport. Ein Wechsel der Rolle verwirft den bisherigen Feiertagsort und regionale Angaben. Ein Ortswechsel verwirft regionale Angaben.

Mit aktiviertem Kalenderkontext werden Defaults Version 1–3 zu Version 4 gelesen. Sprache, Fristdauer, Verfahrensrecht und weitere weiterhin gültige gemeinsame Einstellungen bleiben erhalten. Ein früherer Kalender oder Behördensitz begründet aber weder Rolle noch Feiertagskanton noch regionale Tatsachen. Neue bewusst gespeicherte Rolle und Kantonsort werden sichtbar wieder angeboten. Regionale Tatsachen, ungeklärte Mandatskonstellationen, Daten, Referenzen und Bestätigungen werden nicht persistiert. Laden allein schreibt den Speicher nicht um. Ohne aktivierten Kalenderkontext bleibt der bisherige Version-3-Pfad bestehen.

## Prüfung und Nachweise

Der [maschinelle C2-Nachweis](../../outputs/ap22c2-2026-10-08/QA-AP22C2.json) bindet Code, Tests und diese Dokumentation. Er enthält Typecheck, C2-Prüfungen, vollständige Produktregression, unabhängige C1-Python-Regression, AP22B-Vertragsprüfungen, Vorschau-Build und historische Unverändertheitsprüfungen. Die [Browserprüfung](../../outputs/ap22c2-2026-10-08/browser-qa.md) trennt tatsächlich geprüfte Interaktionen von automatischen Modelltests.

Die 25 vorbereiteten Referenzgruppen werden nicht pauschal zu erfolgreichen Produktfällen erklärt. Historische Fälle vor dem Produktfenster bleiben als Produktberechnung gesperrt. Isolierte Endverschiebungsproben und Sollklassifikationen behalten ihren begrenzten Aussageumfang. Alle vier Januarbindungen werden mit vollständigen Gegenrechnungen geprüft.

Ein zusätzlicher unabhängiger Codereview ergab innerhalb dieses begrenzten Referenzumfangs keinen korrektheitsrelevanten Befund. Eine unabhängige einfache Durchlaufprobe für sämtliche 112 Varianten der 104 Bindungen war erfolgreich. Diese Probe ist keine zusätzliche juristische Abnahme aller Enddaten und ersetzt das menschliche Abnahmerecht nicht.

Der erste Gesamtlauf fand einen überholten Quelltext-Matcher des AP17C-Beschriftungstests. Der Test wurde gezielt auf die ausdrücklich hostkonfigurierte C2-Beschriftung erweitert. Die alte Beschriftung bleibt ohne Kalenderlaufzeit erhalten, innerhalb beider Modi bleibt das Feld unabhängig vom VRPG-Bereich statisch. Die tatsächliche DE-/FR-Ausgabe beider Modi wird zusätzlich gerendert geprüft. Der Standard-Teststarter erfasst neu auch `.test.tsx`, damit die React-Oberflächenprüfung nicht aus dem Gesamtbestand herausfällt.

## Lokale Vorschau und nächster Schritt

Start mit der Projekt-Toolchain Node 22 über `npm run preview:ui`. Danach den Queryparameter `?candidate=ap22c2` verwenden. Ohne diesen Parameter bleibt die reguläre MVP-0.6-Vorschau aktiv. Der öffentliche und der SPFx-Einstieg importieren die C2-Kandidatendaten nicht.

Nach der C2-Abnahme folgt C3 mit tatsächlicher Datenkonfiguration, Provider-/Cachebindung, statischem Host und SPFx sowie Erhaltung der historischen AP5-Pins. AP21 ist nicht parallel gestartet. Datenreleases, Quellenfreigaben, E/Q/P, Mirrors, Paketversionen, GitHub und Berechtigungen wurden durch C2 nicht verändert. Eine bestätigte OneDrive-Synchronisation wird nicht behauptet.

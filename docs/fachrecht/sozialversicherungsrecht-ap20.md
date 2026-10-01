# AP20 Ausbau um EOG FamZG FLG MVG und ÜLG

Stand: 30. September 2026. David Steimer hat den gemeinsamen Ausbau der fünf im AP19-Inventar zurückgestellten Erlasse beauftragt. Die bestehenden ATSG-Zählregeln werden wiederverwendet. Neue Bundesregeln bleiben national, während die erste Produktfreigabe ausschliesslich konkret geprüfte Berner Anbindungen umfasst.

**Aktiv ist AP20A.** Die nachfolgende Fach- und Umsetzungsvorlage ist noch nicht abgenommen. Sie verändert weder Produktdaten noch freigegebene Releases. Operativ führend sind das nachgeführte [Sozialversicherungs-Backlog #35](https://github.com/davidsteimer/fristenrechner/issues/35) und das neue [Arbeitspaket #39](https://github.com/davidsteimer/fristenrechner/issues/39).

## Auftrag und Ausgangsstand

Der Startauftrag lautet: «Sehr gut, dann führen wir den Backlog in diesem Sinne nach und nehmen die fünf noch offenen Erlasse in Angriff.» Damit sind die Ausbaurichtung und der Start bestätigt, nicht die erst danach erstellten einzelnen Fachzuordnungen oder eine neue technische Formatversion.

MVP 0.5 umfasst 24 nationale Regeln und 28 Berner Anbindungen für begrenzte IVG-, AHVG-, UVG-, ELG-, AVIG- und KVG-Konstellationen. Die E-/Q-Abnahmen und die öffentliche Bereitstellung sind im [Produktionsnachweis](../betrieb/produktionsbereitstellung-mvp05-2026-09-28.md) dokumentiert. Die akzeptierten P-Abweichungen und die offene direkte Browserstorage-Wertkontrolle D10 bleiben bestehen. AP20 beseitigt oder erweitert diese Nachweise nicht.

Entwicklungsbasis ist Commit `defd21c51ca51eec9072d780efe0412f1658e9ab`. Die lokale Arbeit erfolgt auf `codex/ap20-sozialversicherungsrecht`. Vorhandene Benutzeränderungen an der Word-Projektplanung und private Sicherungsarchive bleiben unberührt.

Die Architekturentscheide [DEC-2026-024](../entscheidungen/DEC-2026-024-nationales-sozialversicherungsmodell.md) und [DEC-2026-025](../entscheidungen/DEC-2026-025-sozialverfahrenskatalog-und-manifest-v5.md) gelten weiter. Es braucht keine erneute Entscheidung zwischen einem nationalen und einem bernischen Bundesrechtsmodell.

## Fachumfang der Vorlage

Die [Fach- und Quellenmatrix AP20A](quellenpaket-ap20a.md) untersucht für jeden der fünf Erlasse dieselben vier vorhandenen Handlungstypen.

| Kürzel | Handlung | Geprüfter Ansatz für den Folgeumfang |
| --- | --- | --- |
| OBJ | Einsprache gegen formelle individuelle Leistungsverfügung | grundsätzlich 30 Tage nach Art. 52 ATSG, kein Beginn allein durch formlose Abrechnung |
| APP | Ordentliche Beschwerde gegen Einspracheentscheid | grundsätzlich 30 Tage nach Art. 60 ATSG |
| ADM | Konkret angeordnete Verwaltungstagesfrist | tatsächliche positive Tagesdauer, kein Fixtermin und keine Monatsfrist |
| CORRECTION | Gerichtliche Nachfrist zur formellen Beschwerdeverbesserung | tatsächliche Tagesdauer, keine pauschale Freigabe anderer richterlicher Fristen |

Das ergibt **20 zu qualifizierende nationale Pfade**. Es sind weder 20 implementierte noch 20 bereits fachlich freigegebene Regeln. Die Zahl der konkreten Berner Anbindungen bleibt bis zum Abschluss der Zuständigkeitsmatrix offen. Mehrere Zuständigkeitswege dürfen dieselbe nationale Regel referenzieren.

Als vorläufige Identitäten sind `CH-SOC-EOG-*`, `CH-SOC-FAMZG-*`, `CH-SOC-FLG-*`, `CH-SOC-MVG-*` und `CH-SOC-UELG-*` mit den obigen Handlungskürzeln vorgesehen. Die Identitäten werden erst im Folgepaket verbindlich gebunden. Die bestehenden 24 Regeln werden nicht umbenannt oder inhaltlich erweitert.

## Abgrenzung

- Keine pauschale Vollabdeckung der fünf Erlasse und keine automatische Rechtsberatung über die zuständige Versicherung oder Kasse.
- Keine materiellen Anspruchs- oder Verwirkungsfristen, generischen Gerichtsfristen, Rechtsverzögerungsfristen, Monatsfristen, behördlichen Fixtermine oder Wiederherstellung.
- Ausland, Drittbeschwerden, Bundesverwaltungs- und Bundesgerichtswege bleiben ausserhalb des Erstumfangs.
- BVG/FZG, VVG und weitere noch nicht modellierte AVIG-/KVG-Sachbereiche bleiben eigenständige Backlog-Punkte.
- Keine Erweiterung anderer Kantone oder ausserbernischer Feiertagsanknüpfungen. Auch bei einem Berner Gericht muss der konkrete Feiertagsraum gesondert verfügbar und freigegeben sein.
- Keine Änderungen an E/Q/P, Berechtigungen, Mirrors, Quellenregister, historischen Releases oder Releaseartefakten durch AP20A.

## Technischer Modellcheck

Die vorhandene Trennung von Bundesregel, Anbindung und Freigabe passt zum neuen Umfang. `src/core/socialDeadline.ts` kann weiterhin auf die gemeinsame Tagesarithmetik zurückgreifen. Es ist keine neue Rechenart erkennbar.

Die Erweiterung ist dennoch nicht ausschliesslich eine Ergänzung von Datenzeilen:

| Stelle | Bestehende Begrenzung | Folgearbeit |
| --- | --- | --- |
| `src/core/socialTypes.ts` | `SocialLaw` enthält sechs Erlasse, Fallfakten sind abschliessend typisiert | neue Erlasse und tatsächlich benötigte Fakten kontrolliert ergänzen |
| `src/core/socialCatalog.ts` und `schemas/social-procedure-catalog.schema.json` | geschlossene Gesetzes-, Herkunfts- und Faktenwerte | Parser und Schema gemeinsam fortschreiben |
| `src/ui/socialUi.ts` | genau eine BE-Anbindung je Erlass, nur AVIG erlaubt ausdrücklich zwei | mehrere fachlich qualifizierte EOG-Routen explizit unterstützen |
| `src/ui/vrpgSelection.ts` und `src/ui/socialMessages.ts` | explizite DE-/FR-Auswahl und Texte | fünf Erlasse und ihre fachlich notwendigen Grenzen ergänzen |

AP20B muss deshalb einen **begrenzten Vertragsnachtrag samt Consumerkompatibilität** vorlegen. Neue Werte dürfen nicht ungeprüft als mit allen bisherigen Consumern des Formats `1.0.0` kompatibel gelten. Eine neue Format- oder Releaseversion ist mit AP20A noch nicht beschlossen.

Das GUI bleibt zweispaltig. Die frühe Datumseingabe und die reduzierte Darstellung bleiben erhalten. Eine eindeutige Dokumentzuordnung wird nicht erneut abgefragt. Modellierte Zuständigkeit gehört grundsätzlich in die Rechenspur. Echte Alternativen oder fehlende Fallfakten dürfen dagegen nicht als technische Defaults erfunden werden.

## Sequenz und Haltepunkte

WIP-Limit 1 und höchstens fünf Nettoarbeitstage je Paket bleiben verbindlich. Die Obergrenze ist kein Sollaufwand. Das übergeordnete Issue #35 zählt nicht zusätzlich zum WIP.

| Paket | Ergebnis | Haltepunkt |
| --- | --- | --- |
| **AP20A aktiv** | gemeinsame Fachmatrix, Zuständigkeitsrouten, Quellenstand, Grenzen und technischer Änderungsbedarf | Fachumfang und vorgeschlagene Berner Produktgrenzen durch David prüfen lassen |
| AP20B nach AP20A | konkreter Vertragsnachtrag, vollständige zeitliche Quellenbindung, maschinenlesbare Datums- und Sperrreferenzen | Fachreferenzen und technischer Vertrag gesondert abnehmen |
| AP20C nach AP20B | Integration in Datenkandidat, gemeinsame UI und Consumer, DE/FR, Bestandsregression | bei mehr als fünf Nettoarbeitstagen vor Beginn in eigenständig prüfbare Teilpakete zerlegen |
| Gesonderter Releaseauftrag | erneuter Quellenabgleich, Datenübernahme, definitive Artefakte und E/Q/GitHub/P | konkrete Veröffentlichungs- und Betriebsfreigaben wie bisher getrennt |

## Referenz und Prüfplan

Vor Integration sind positive und negative Fachreferenzen nötig. Gemeinsame Arithmetik allein beweist weder die richtige Zuständigkeit noch den richtigen Auslöser.

1. Je Erlass und Handlung mindestens ein positiver qualifizierter Fall. Ergänzend gemeinsame Grenzfälle für Ostern, Sommerstillstand, Jahreswechsel, Wochenende und Feiertagsende.
2. EOG ohne formelle Verfügung, falsche Kassenart und Adoption mit fälschlich angenommener kantonaler Kasse müssen sicher abgegrenzt werden.
3. FamZG mit unbekannter Zulagenordnung, blossem Kassensitz oder Familienorganisations-Finanzhilfe darf keinen freigegebenen Standardpfad erhalten.
4. FLG darf weder FamZG-Zuordnung noch pauschalen Wohnsitzfilter für sämtliche Berechtigten übernehmen.
5. MVG-Tarifstreit und aufgehobene besondere Beschwerdefrist sowie ÜLG-15-Monatsfrist bleiben ausserhalb der neuen Tagesrechtsmittelpfade.
6. Unbekannte Zuständigkeit, ungeklärter Feiertagsraum, fehlende oder zeitlich unzureichende Quelle, fremder Rechtsweg und fehlende Freigabe sperren jeweils eigenständig. Ein allgemeines Kandidatengate darf schwache Fachprüfungen im Test nicht verdecken.
7. Bestehende 24 Regeln und 28 Anbindungen bleiben semantisch erhalten. Historische Releases bleiben byteidentisch. Frühere Datenstände dürfen die neuen Auswahlwerte nicht anbieten.
8. Nationale Wiederverwendbarkeit wird mit synthetischen ausserbernischen Anbindungen geprüft, ohne dadurch eine neue operative Freigabe zu erzeugen.
9. Defaults dürfen keine tatsächlichen Zuständigkeits- oder Feiertagsfakten speichern. Bestehende Datumseingabe, Layout, Kalenderexport und DE-/FR-Texte bleiben regressionsgeprüft.
10. Neue Consumer müssen den vollständigen neuen Vertrag prüfen. Alte Consumer müssen unverstandene neue Werte sicher ablehnen. Öffentliche App und SPFx bleiben auf demselben Fachkern.

Diese Liste ist ein Prüfplan, kein Bericht bereits bestandener Laufzeittests.

## Vorlagestand und nächste Festlegung

AP20A enthält eine erste zusammenhängende Fach- und Zuständigkeitsmatrix. Die Grundrichtung aus dem Startauftrag ist bestätigt. Noch zu prüfen sind die vorgeschlagenen konkreten Produktgrenzen, insbesondere die wohnsitzbezogene Verwaltungsanbindung für EOG und MVG. Sie sind keine gesetzlichen Zuständigkeitsregeln.

Die vollständige zeitliche Bindung, konkrete Formatversion und ausführbare Datumsreferenzen folgen in AP20B. Der heutige Quellenstand ist keine automatische Zeitfreigabe für 2027 oder spätere Jahre. Eine Fachabnahme dieser neuen Vorlage wird erst nach einer ausdrücklichen Erklärung Davids dokumentiert.

David Steimer übernimmt Fachverantwortung und Freigabe in Personalunion. Codex erstellt Grundlagen und technische Nachweise als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

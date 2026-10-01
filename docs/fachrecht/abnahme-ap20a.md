# AP20A Abnahme von Fachumfang und Zuständigkeitsmatrix

Datum: 30. September 2026. Entscheider: David Steimer.

David Steimer hat erklärt: **«Die AP20A-Vorlage ist abgenommen.»** Damit sind der vorgelegte Fachumfang und die Zuständigkeitsmatrix für EOG, FamZG, FLG, MVG und ÜLG im nachfolgend abgegrenzten Umfang abgenommen. AP20A ist abgeschlossen. [Issue #39](https://github.com/davidsteimer/fristenrechner/issues/39) dokumentiert das Arbeitspaket, [Issue #35](https://github.com/davidsteimer/fristenrechner/issues/35) bleibt als übergeordnetes Ausbau-Backlog offen.

## Abgenommener Gegenstand

- Gemeinsamer Ausbau der fünf Erlasse mit dem vorhandenen ATSG-Rechenkern. Keine neue Rechenart und keine pauschale Vollabdeckung der Erlasse.
- Fachlicher Folgeumfang von fünf Erlassen mit je vier Handlungstypen: Einsprache gegen formelle Leistungsverfügung, ordentliche Beschwerde gegen Einspracheentscheid, konkret angeordnete Verwaltungstagesfrist und eng begrenzte gerichtliche Beschwerdeverbesserung. Die 20 Pfade sind als Fachumfang bestätigt, nicht als implementierte oder operativ freigegebene Regeln.
- Nationale Bundesregel, kantonale Verwaltungs- beziehungsweise Gerichtsanbindung, Feiertagsauflösung und konkrete Freigabe bleiben getrennt. Die Erstfreigabe bleibt auf die ausdrücklich geprüften Berner Konstellationen beschränkt.
- **EOG- und MVG-Verwaltungsfälle:** Die vorgeschlagene anfängliche BE-Wohnsitz-Produktgrenze ist mit der Vorlage bestätigt. Sie ist keine neue gesetzliche Zuständigkeitsregel und kein Versicherersitzfilter. Der zuständige Träger muss qualifiziert sein. Die genauen zeitlichen Anknüpfungen werden in AP20B festgelegt.
- EOG: keine Einsprachefrist allein aus einer formlosen Abrechnung. Kantonale und nichtkantonale Kassen bleiben getrennt. Die Eidgenössische Ausgleichskasse bei Adoptionsentschädigungen wird nicht als kantonale Ausgleichskasse Bern behandelt.
- FamZG: Anknüpfung an die tatsächlich anwendbare Familienzulagenordnung. Gesetzlich erfasste höhere kantonale Ansätze sowie Geburts- und Adoptionszulagen werden nicht pauschal ausgeschlossen. Freiwillige Kassenleistungen bleiben bis zur Einzelqualifikation ausserhalb der operativen Übernahme.
- FLG: eigenständige Verwaltungs- und Gerichtsanbindung. MVG: Ausschluss des Medizinal- und Tarifbereichs. ÜLG: keine Gleichsetzung materieller Geltendmachungsfristen mit Rechtsmittelfristen.
- Festgestellter Bedarf eines begrenzten technischen Vertragsnachtrags, Referenz- und Sperrfallplan sowie Erhaltung der bestehenden 24 Bundesregeln und 28 Berner Anbindungen.
- Zweispaltige DE-/FR-Oberfläche, frühe Datumseingabe und reduzierte Eingaben bleiben Leitplanken. Keine redundante Dokumentauswahl und keine aus technischen Defaults erfundenen Fallfakten.

## Unverändert gebundene Vorlage

Die beiden vorgelegten Dateien bleiben byteidentisch erhalten. Ihre damaligen Formulierungen «Vorlage», «noch nicht abgenommen» und «AP20A aktiv» dokumentieren den Vorlagestand. Für den aktuellen Abnahmestatus ist diese Notiz massgebend. Die frühere Arbeitsplanung wird nicht rückwirkend umgeschrieben.

| Gegenstand | SHA-256 |
| --- | --- |
| [AP20 Arbeitsauftrag und Umsetzungsvorlage](sozialversicherungsrecht-ap20.md) | `79453bd891bb59029e4c509342034f7c1e94c7c6ba6238f562772a9b0345d70c` |
| [AP20A Fachmatrix und Quellenpaket](quellenpaket-ap20a.md) | `24c7ffcbf6bdd9226559a64135aa0500a1f6e3da4c850f5106ab4dd7e4e7b745` |

Die Prüfsummen binden die tatsächlich vorliegenden lokalen Dateien. Sie ersetzen weder eine digitale Signatur noch einen späteren Quellen- oder Releaseabgleich. Diese Abnahmenotiz und die gebundene Vorlage sind noch nicht durch einen Quellpush veröffentlicht.

## Weiterhin offene Folgearbeiten

AP20B ist der nächste vorgesehene Schritt, wird durch diese reine Abnahmenachführung aber noch nicht begonnen. Es konkretisiert insbesondere:

1. endgültige Regelidentitäten, Fallfakten, Herkunftswerte, Anbindungen sowie Komponenten- und Consumerkompatibilität
2. vollständige zeitliche Bindung der Normen und Zuständigkeitsmerkmale einschliesslich relevanter zukünftiger Fassungen
3. die noch bezeichneten Einzelqualifikationen, insbesondere freiwillige FamZG-Kassenleistungen
4. ausführbare positive Datumsreferenzen, Zuständigkeits- und Sperrfälle sowie Bestandsregression
5. den konkreten technischen Vertragsnachtrag zur gesonderten Entscheidung vor der Produktintegration

Die Abnahme akzeptiert den offengelegten Quellen- und Prüfstand der Vorlage. Sie behauptet keinen zusätzlich ausgeführten vollständigen Original-PDF-Abgleich der kantonalen Quellen und keine neue Releasequellenabnahme. Der Bedarf für Originalgegenprüfung und zeitlichen Folgeabgleich bleibt wie dokumentiert bestehen.

## Freigabegrenzen

- Keine Abnahme erst noch zu erstellender AP20B-Referenzen, konkreter Formatversionen oder endgültiger maschinenlesbarer Zuständigkeitsanbindungen.
- Keine automatische zeitliche Fachfreigabe für 2027 oder spätere Jahre.
- Keine Produktaktivierung, Datenpromotion, neuen Builds oder Änderungen an E/Q/P, Mirrors und Berechtigungen.
- Kein Quellcommit oder GitHub-Push durch diese Abnahmenachführung. Die zugehörigen GitHub-Issues werden nur im bestehenden Auftrag zur Backlog-Pflege nachgeführt.
- Keine zusätzlichen Kantone, ausserbernischen Feiertagsräume, beliebigen Gerichtsfristen, materiellen Anspruchsfristen, Monatsfristen oder Fixtermine.
- MVP 0.5, seine verbleibenden Nachweisgrenzen und sämtliche früheren Releases bleiben unverändert.

David Steimer nimmt Fachprüfung und Abnahme in Personalunion wahr. Codex dokumentiert die Erklärung als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

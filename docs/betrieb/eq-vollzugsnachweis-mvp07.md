# MVP 0.7 Zwischenstand des Vollzugs in E und Q

**Historischer Nachweis zu Paket `0.7.0.0`.** Der spätere Katalogwechsel, die E-Appupdates auf `0.7.0.2` und ihre noch unvollständigen Nachtests sind im [gesonderten Teilvollzugsnachweis](eq-vollzugsnachweis-mvp07-0702.md) dokumentiert. Die [nachfolgende H02-Freigabe](eq-freigabe-mvp07-0702.md) ist erteilt. Die damaligen Statusangaben, Freigaben und Testergebnisse bleiben nachstehend unverändert und werden nicht auf `0.7.0.2` übertragen.

Stand: 9. Oktober 2026, Zeitzone Europe/Zurich. **Der gemeinsame Katalogwechsel und die Umstellung beider E-Instanzen sind erfolgt. Das technische E-Gate bleibt wegen des Layoutbefunds R07C-B01 offen. Q wurde weder auf Site-App-Ebene aktualisiert noch auf den neuen Mirrorpfad umgestellt.** Der gemeinsame neue Paketcode kann Q dennoch bereits erreichen. Eine technische Gesamtfreigabe oder fachliche Abnahme wird aus diesem Zwischenstand nicht abgeleitet.

Grundlage bleiben die [begrenzte Installationsfreigabe](eq-freigabe-mvp07.md), der [geschlossene Rückfallpunkt H01](freigabe-r07c-h01.md), die [Installationsvorlage](eq-installationsvorlage-mvp07.md) und die [Prüfmatrix](pruefmatrix-mvp07.md). Die Hostprüfungen erfolgten mit synthetischen Fällen in Microsoft Edge unter macOS mit angemeldetem Eigentümerkonto. Sie ersetzen keine reale Gast-, Mobilgeräte- oder manuelle Q-Abnahme.

## Gebundener Stand

| Gegenstand | Nachgewiesene Identität |
| --- | --- |
| Katalogpaket | `0.7.0.0`, 291'920 Bytes, SHA-256 `bc8abe70c791f58d2cea9fb66ea568f604bcacae35fec9ae29aadeca5e0c6e09` |
| Ausgeliefertes Hauptbundle | `fristenrechner-web-part_f1f22b6187784c63f8ec.js`, SHA-256 `4c61cc5f9db88fda4c5b795f3b17b6b8fc214b328813f3035adc8e0d1a0d4df5` |
| Neuer Datenrelease | `2026-10-08-mvp-07-approved.1`, Manifest SHA-256 `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597` |
| Gesicherter bisheriger Datenrelease | `2026-10-01-mvp-06-approved.1`, Manifest SHA-256 `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |

## Ausgeführte Installationsschritte

| Schritt | Stand am 9. Oktober |
| --- | --- |
| C01 Ausgangssicherung | Bestanden. Katalogpaket und Bundle des Ausgangsstands roh gesichert. Vier konkrete Site-App-, Seiten-/Webpart- und Teamsregisterkartenkonfigurationen eindeutig gebunden. Vorhandener historischer Entwurf erhalten. Relevante Rechte im Vorprüfstand unverändert |
| C02 Manueller Mirrorupload | Bestanden. David hat die vier neuen Releaseordner hochgeladen. Bestehende Releases erhalten |
| C03 Mirrorprüfung | Bestanden. Viermal 41 neue Dateien, insgesamt 164, vollständig roh zurückgelesen und gegen Länge, SHA-256 und je 40 Manifestreferenzen geprüft. Zusätzlich viermal elf bisherige Dateien, insgesamt 44, als Rückfallgrundlage gesichert und geprüft. Keine zusätzlichen Remote-Dateien oder abweichenden Rechte im dokumentierten Vergleich |
| C04 Katalogwechsel | Bestanden. Bestehende Katalogdatei durch das gebundene Paket ersetzt. Version `0.7.0.0`, gültig, aktiviert und bereitgestellt. Keine Verteilung auf alle Sites. Frisch heruntergeladenes Paket und ausgeliefertes Bundle bytegleich zu den freigegebenen Artefakten. Keine zusätzliche API-Berechtigungsanforderung |
| C05 E-SP und E-T | Beide bestehenden Site-Apps zeigen `0.7.0.0`. Jeweils ausschliesslich der Mirrorpfad auf den neuen Release umgestellt. Aktuelle E-SP-Seite publiziert, bestehende E-T-Registerkarte gespeichert. Provider und inaktive GitHub-Pins erhalten. Technische E-Prüfung noch nicht vollständig abgeschlossen |
| C06 Q-SP und Q-T | Noch nicht ausgeführt. Neue Mirrors geprüft, bisherige App-/Datenkonfigurationen nicht umgestellt. Gemeinsame Codewirkung aus C04 ist davon getrennt |
| C07 Geräte, Gast und Abnahme | Noch nicht ausgeführt. Bleiben gesonderte Prüfungen und Entscheide |

Der Wiederherstellungsweg wurde nicht eingesetzt. Ein bestandener lokaler Wiederherstellungstest wird nicht als tatsächlich ausgeführter Rückfall auf den Hosts gezählt. Berechtigungen, Richtlinien, zusätzliche Gäste, AP21-Testbestand, GitHub und P wurden nicht geändert.

## Ergebnisse und noch offene E-Prüfungen

| Bereich | Nachgewiesen | Noch offen oder begrenzt |
| --- | --- | --- |
| F01 bis F09 | Beide aktuellen E-Hosts bestanden, einschliesslich aller festgelegten Varianten und französischen Wiederholungen. Januarabweichungen sperren Resultat und Export, wirkungslose Januarvarianten bleiben berechenbar. NE-/GR-Grenzen und BE-Sozialgrenzen bleiben wirksam | Kein daraus abgeleiteter Q-Pass |
| T01 Identitäten | Katalog und E-Instanzen am gebundenen Paket, neuen Bundle und Datenrelease geprüft | Q-Identitäten nach deren späterer Umstellung erneut prüfen |
| T02 Datenabruf | E-SP und E-T: je tatsächlicher Abruf aller 41 Dateien mit GET 200, positiven Übertragungsgrössen und vollständig byteidentischen Antworten. Jeweils erster erfolgreicher MVP07-Abruf im frisch isolierten T03-Testkontext belegt. Historische Netzabrufe siehe T09 | Kein rückwirkender Nachweis des ersten Abrufs unmittelbar nach dem Katalogwechsel. Kein daraus abgeleiteter Q-Pass |
| T03 Konfiguration und Cache | Beide E-Hosts bestanden. In ihren tatsächlichen isolierten Speicherkontexten vor dem MVP07-Aufruf ausschliesslich AP5 vorhanden. Wirksame Manifestblockierung führt jeweils zum geschlossenen Fehlerzustand ohne Rechnerformular, Ergebnis oder Export. AP5 wird nicht als Ersatz verwendet. Eigene Testregel jeweils entfernt und Blockiermodus ausgeschaltet. Recovery mit je 41 byteidentischen Antworten und angezeigtem MVP07-Mirror bestanden. Der frühere separate Versuch belegt den gewarnten Rückgriff auf passenden Cache | Kein Browserdatenreset und keine Manipulation freigegebener Dateien. Die nach der E-SP-Recovery uneindeutig dargestellten Cachezeilen werden nicht als zusätzlicher Schlüsselbeweis gezählt. Der E-T-Nachweis stammt aus der tatsächlichen Teams-Drittpartition, nicht aus der direkten SharePoint-Ansicht |
| T04 Datum und T05 Invalidierung | Auf beiden E-Hosts Vollformat, `h`, Tag mit Tab, Tag.Monat mit Blur, Kalenderwahl und ungültiges Datum geprüft. Tatsächlicher lokaler Testtag 09.10.2026. Zusätzliche EOG-/AVIG-Zuständigkeitsdaten und Beginn des Beschaffungsverfahrens geprüft. Bearbeiten des Datums entfernt Resultat und Export sofort | Kein realer iOS-, Magic-Keyboard- oder VoiceOver-Nachweis aus diesen Desktopprüfungen |
| T06 Standards | Beide E-Speicherkontexte bestanden. Synthetische v3-Präferenz geladen, Rolle und Feiertagskanton nicht erfunden, v4-Rohwert nach explizitem Speichern geprüft. Reload verwirft Datum, Referenz und NE-Regionalantwort. Eigene Teststandards entfernt und ursprüngliche Abwesenheit des einzelnen Schlüssels jeweils wieder bestätigt | Der unveränderte v3-Rohwert unmittelbar nach Reload wurde nicht separat als Hostbeleg gelesen. Kein stilles Zurückschreiben bleibt hierfür lokal belegt. Keine pauschale Aussage über andere Benutzerpräferenzen |
| T07 Sprache und Layout | Verlangte DE-/FR-Fälle sowie breite und schmale echte E-Ansichten geprüft. Datum linksbündig mit Formattext. Normaler Tastaturpfad bis zu allen vier Aktionsschaltflächen auf beiden E-Hosts geprüft. 200-Prozent-Zoom auf beiden tatsächlichen Hosts bestätigt. Teams blendet seine Seitennavigation automatisch aus | **Nicht bestanden, R07C-B01:** Lange Texte in der geöffneten Zustellartliste werden auf beiden Hosts bei 200 Prozent mit Ellipsen gekürzt. Auch geschlossene allgemeine Dropdowns können kürzen. Kein pauschaler Nachweis aller mobilen oder dynamischen Bedienpfade. Beide Zoomwerte auf 100 Prozent zurückgesetzt |
| T08 Kalenderdateien | Alle vier E-Host-/Sprachkombinationen tatsächlich gespeichert und inhaltlich geprüft, siehe unten. Der später gesicherte französische E-T-Download schliesst die frühere Dateilücke | Q-Downloads noch offen. Sichtbarer Exportbutton allein zählt nicht als gespeicherte Datei |
| T09 Historische AP5-Ansichten | Historischer Pin und Release erhalten. In SharePoint und Teams neues Bundle sichtbar, StPO `16.09.2026` plus zehn Tage ergibt `28.09.2026`. Zusätzlich auf beiden tatsächlichen Hosts je acht frische GET-200-Abrufe mit positivem Netzwerktransfer und byteidentischen Inhalten separat belegt. Historische Seite nicht publiziert, dort keine Standards gespeichert | Kein allgemeiner Pass sämtlicher historischen Funktionen und kein Q-Pass |

Beim französischen TI-Test in E-T blieb die automatisierte Auswahl zunächst sichtbar auf BE und lieferte entsprechend `08.12.2026`. Nach bestätigter Tastaturauswahl von TI ergab sich korrekt `09.12.2026`. Die fehlgeschlagenen Auswahlversuche sind protokolliert, aber kein nachgewiesener Kalenderrechenfehler.

Beim ersten isolierten Cacheversuch akzeptierte Edge die vollständige SharePoint-Abrufadresse wegen ihrer Klammern nicht als Sperrmuster. Das war eine ungültige Testeinrichtung, kein Fehler des Rechners. Der Datenstand wurde normal geladen. Ein anschliessend korrekt begrenztes Sperrmuster blockierte den Manifestabruf. Der Rechner verwendete daraufhin wie vorgesehen den bereits vorhandenen passenden Datenstand mit Warnhinweis. Der zweite, frisch isolierte E-SP-Durchlauf schliesst nun auch den Fremdcache-Negativtest. Die Entfernung der einzigen eigenen Testregel und der ausgeschaltete Blockiermodus sind tatsächlich beobachtet. Der erste erfolgreiche Abruf dieser Testsitzung ist belegt, nicht rückwirkend der erste Abruf unmittelbar nach dem Katalogwechsel.

Eine frühere isolierte Teams-Fortsetzung erreichte keine bedienbare Rechneransicht. Nach einem Neuladeversuch blieb die Oberfläche leer, ebenso bei der späteren Rückkehr zu E-SP. Ursache ungeklärt, daraus wurde weder ein Hostpass noch ein nachgewiesener Rechnerfehler abgeleitet. Nach Davids Bereitmeldung des E-Teams-Kanals gelang der begrenzte Wiederholungsdurchlauf. AP5 wurde zuerst in der tatsächlichen Teams-Drittpartition frisch geladen. Mit ausschliesslich diesem Fremdcache führte die wirksame Sperre des aktuellen Manifestabrufs zum vorgesehenen Fehlerzustand. Nach vollständiger Entfernung der Testsperre gelangen die 41 aktuellen Abrufe byteidentisch. Kein Cookie-, Browserdaten-, Berechtigungs- oder Richtlinienreset.

### Offener Layoutbefund R07C-B01

Die Auswahl «Art der Zustellung» zeigt bei 200 Prozent Browserzoom in der tatsächlichen SharePoint- und Teamsansicht auch geöffnet nur gekürzte Texte, beispielsweise «Unabgeholte eingeschrieben…» und «Direkte Zustellung oder ander…». Der volle Text ist im Accessibility-Baum vorhanden, das ersetzt jedoch nicht die verlangte visuelle Lesbarkeit. Die Teamsnavigation selbst verhält sich korrekt und wird automatisch ausgeblendet. Ein Rechen- oder Datenfehler wird aus dem Befund nicht abgeleitet.

Die lokale Ursachenprüfung des gebundenen MVP07-Baueingangs erklärt die Beobachtung: Allgemeine geschlossene Dropdowntitel erzwingen `nowrap` und `ellipsis`. Der allgemeine fachliche Selektor übergibt zudem keine Mehrzeilenstile für die geöffneten Optionen. Für die Feiertagsanknüpfung besteht bereits eine passende Lösung mit Textumbruch und automatischer Zeilenhöhe.

David hat die [begrenzte lokale Korrektur](freigabe-r07c-b01-lokal.md) anschliessend beauftragt. Das Umbruchmuster wurde ohne Änderung von Texten, Auswahlwerten, Fachregeln oder Datenvertrag übernommen. Der [Kandidat 0.7.0.2](darstellungskorrektur-mvp07-0702.md) ist lokal gebaut und geprüft, **noch nicht installiert**. Dies ist ein nachfolgender lokaler Nachweis, keine rückwirkende Schliessung des Hostbefunds. Ein neuer Katalogwechsel benötigt eine an das neue Artefakt gebundene Freigabe und einen erneut geeigneten geprüften und gebilligten Rückfallweg. Das bisherige Recovery `0.7.0.1` wäre nach diesem Kandidaten niedriger versioniert. T07 wird nicht stillschweigend abgeschwächt.

**Nachtrag zur lokalen Vorbereitung:** Der gesondert beauftragte [Recovery `0.7.0.3`](wiederherstellungskandidat-mvp07-0703.md) ist inzwischen am tatsächlichen Paket geprüft und archiviert. Die [gemeinsame Vorlage](eq-installationsvorlage-mvp07-0702.md) für Korrekturinstallation, E-Nachtest, bedingte Q-Fortsetzung und möglichen Rückfall ist entscheidungsreif. R07C-H02 bleibt offen. Dieser Nachtrag ändert keinen Hostteststatus und erlaubt noch keine Installation.

Eigene Teststandards und Request-Sperren sind entfernt. Beide Hostzooms stehen wieder auf 100 Prozent, Entwicklertools sind geschlossen und der ursprüngliche Vollbildmodus ist wiederhergestellt. Es wurde kein Rückfall ausgeführt. Q bleibt auf seiner bisherigen Site-App- und Mirrorkonfiguration, unter der bereits dokumentierten gemeinsamen Codewirkung.

### Tatsächlich gespeicherte Kalenderdateien

| Host und Sprache | Fristablauf | Nachweis |
| --- | --- | --- |
| E-SP Deutsch | 28.09.2026 | Gespeichert und geprüft, zusätzlicher Wiederholungsdownload separat dokumentiert |
| E-SP Französisch | 09.12.2026 | Gespeichert und geprüft, zusätzlicher Wiederholungsdownload separat dokumentiert |
| E-T Deutsch | 28.09.2026 | Gespeichert und geprüft |
| E-T Französisch | 09.12.2026 | Gespeichert und geprüft, eigener späterer Nachweis ergänzt die erhaltene frühere Feststellung einer noch fehlenden Datei |

Damit liegen sechs Dateien für vier unterschiedliche Host-/Sprachkombinationen vor. Zwei Wiederholungsdownloads werden nicht als zusätzliche Kombinationen gezählt. Geprüft sind insbesondere Anfang, exklusives Ende, lokalisierter Betreff, Ganztägigkeit, Freistatus, Kategorie, Erinnerung und Dateistruktur. Es erfolgte kein Outlook-Import. Dateiprüfsummen und genaue Herkunft bleiben in den privaten Einzelbelegen.

## Nächste Schritte

1. Die [gemeinsame Vorlage](eq-installationsvorlage-mvp07-0702.md) mit der lokal abgeschlossenen Korrektur `0.7.0.2` und dem geprüften Recovery `0.7.0.3` ausdrücklich bestätigen und H02 schliessen. Erst danach die relevanten offenen und geschlossenen Auswahllisten in DE/FR, schmal und bei 200 Prozent auf den tatsächlichen E-Hosts nachprüfen. Keine automatische Neuinstallation aus diesem Nachweis ableiten.
2. Erst nach bestandenem E-Gate die bereits freigegebenen bestehenden Q-Apps und Mirrorpfade umstellen und die technische Q-Matrix ausführen.
3. Reale Geräteprüfung, bestehende B2B-Gastanmeldung und manuelle fachliche Q-Abnahme getrennt durchführen. GitHub und P bleiben ausserhalb dieser Freigabe.

## Private Nachweise

Die folgenden relativen Pfade bezeichnen lokale Betriebsbelege unter `.work/deployments/2026-10-09-eq-mvp07/`, keine öffentlich publizierten Anhänge. Tenantbezogene Identitäten, Rohkonfigurationen und vollständige Netzwerkaufzeichnungen werden nicht in dieses Dokument übernommen.

| Beleg | Zweck |
| --- | --- |
| `preflight-gate.private.json` und `c01-instances.private.json` | Geschlossene Voraussetzungen vor C04 und gesicherte Instanzkonfigurationen |
| `c01-c04-independent-audit.private.json` | Unabhängige lokale Nachprüfung der gebundenen C01–C04-Dateien und Mirror-/Paketbytes |
| `catalog-readback/c04-raw-byte-verification.private.json` | Paket- und Bundleidentität, kein alleiniger Beweis einer Hostinstallation |
| `e-configuration-and-defaults.private.json` | E-Appzustände, Konfigurationsdelta, Standards und Layoutbeobachtungen |
| `e-host-cases.private.json` | Konkrete Eingaben, Ergebnisse, Varianten, Zeiten und begrenzte AP5-Beobachtungen |
| `network-e-sp.private.json` | Auf die 41 Releaseabrufe begrenzte Auswertung des tatsächlichen E-SP-Netzverkehrs |
| `network-ap5-isolated.private.json` | Acht tatsächliche AP5-Abrufe in der nativen isolierten SharePoint-Ansicht. SHA-256 `9d1fa1cc0127b562c0514765a7649f6a23000781d9566983497836eb93a75c63`. Nur die acht gebundenen Releaseantworten ausgewertet, kein Teams-Netznachweis |
| `t03-isolated-attempt-1.private.json` | Getrennte Beobachtungen zu leerem Ausgangsspeicher, AP5-Fremdcache, ungültiger erster Sperrregel und erwartetem Rückgriff auf den später vorhandenen passenden MVP07-Cache. Kein bestandener Fremdcache-Negativtest |
| `t03-isolated-attempt-2.private.json` und `e-sp-t03-cold-failure.png` | Bestandener E-SP-Fremdcache-Negativtest mit nativ beobachteter Isolation, ausschliesslichem AP5-Cache, geschlossenem Fehlerzustand und tatsächlich entfernter Testsperre. Screenshot SHA-256 `fa676016aee10c11274910c950aadc9925219313ed8907ad9685cc5e40c3885d` |
| `network-t03-esp-recovery.private.json` | Erster erfolgreicher Abruf der 41 MVP07-Dateien dieser frischen E-SP-Testsitzung. Sämtliche Antwortbytes geprüft. Report SHA-256 `634e898bc8e9e2fb177f7fbd89a85a0bef955a734b078bbbd29d9e4e46215fde`. Kein Teams-Nachweis |
| `network-ap5-teams.private.json` | Separater tatsächlicher Teams-Netzabruf der acht gebundenen AP5-Dateien. SHA-256 `8765de3d90232439fa7876209a6fca96b93726b2b84aa8f421c83de5ed45652d` |
| `t03-et-isolated.private.json` und `e-t-t03-cold-failure.png` | Bestandener E-T-Fremdcache-Negativtest in der tatsächlichen Drittpartition, mit entferntem eigenem Sperrmuster. Beobachtungsbericht SHA-256 `395f2fb674ff9bfcc875ca5b0c23b109841de3fda6958f76e41e18e54c82b370`. Darin separat offener Präferenzstatus wurde später durch T06 geschlossen |
| `network-t03-et-recovery.private.json` | 41 tatsächliche E-T-Recovery-Abrufe mit GET 200 und identischen Antwortbytes. SHA-256 `6d74c991624910ad966d80bc3d8a6012702f02fc943aff4b4a4acfed4876c406` |
| `t06-et-native.private.json` | Eigene v3-/v4-Rohwerte, beobachtete Migration ohne erfundene Anknüpfung, Ausschluss konkreter Falldaten und bestätigte Wiederherstellung der ursprünglichen Schlüsselabwesenheit |
| `t07-native-layout.private.json` und `e-t-t07-200-dropdown.png` | Tatsächliche Tastatur- und Zoomprüfungen, Befund R07C-B01, begrenzte Ursachenprüfung und Rückstellung der Prüfansicht. Screenshot SHA-256 `b02a1e576108e8311fee6682e2c5fc32b5d22d15517be1e0f95d81437cf6bc94` |
| `e-sp-desktop.png` | Tatsächlich gespeicherte E-SP-Ansicht mit publizierter Testseite und F01-Ergebnis. SHA-256 `3fc0df8c25632cc4288f6d7965ed43ec91e557eaa49ab2f8ae2faac4774a7626`. Begrenzter visueller Nachweis, kein Ersatz für den gesonderten T07-Nachweis und den offenen Layoutbefund |
| `e-calendar/e-sp-fr-actual-download-verification.private.json`, `e-calendar/additional-e-actual-download-verification.private.json` und `e-calendar/e-t-fr-actual-download-verification.private.json` | Tatsächlich gespeicherte Kalenderdateien mit Host-/Sprachzuordnung, SHA-256 und Inhaltsprüfung. Frühere Feststellung einer noch fehlenden Datei bleibt erhalten, späterer Beleg schliesst E-T Französisch |

David entscheidet in Personalunion. Codex dokumentiert und führt die begrenzt freigegebenen Arbeiten aus, ohne formelle Freigabe- oder Haftungsverantwortung.

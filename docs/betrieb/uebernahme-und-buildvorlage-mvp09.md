# R09-B Vorlage für lokale Datenübernahme und Releasebau

Stand: 18. Oktober 2026. **Zur gesonderten Freigabe vorgelegt, noch nicht ausgeführt.** Die [Quellenabnahme R09-A2](../fachrecht/abnahme-quellen-mvp09.md) ist dokumentiert. Diese Vorlage konkretisiert die anschliessende lokale Übernahme und den Bau, sie erteilt noch keine Ausführungsfreigabe. Der dokumentierte Betriebsstand bleibt MVP 0.8.

## 1. Auftrag und gebundene Eingänge

R09-B überführt den abgenommenen AP23E3-Stand einschliesslich UX #50 in einen lokal geprüften MVP-0.9-Release. Vorgesehen sind kontrollierte Quellen- und Datenübernahme, genau ein begrenzter lokaler Datencommit, definitive SPFx-/Mirror-/Webartefakte und ein neu gebauter Wiederherstellungskandidat mit MVP08-Funktionsumfang. Installation und Publikation bleiben getrennte Schritte gemäss [Releaseplan](deployment-mvp-09.md).

| Eingang | SHA-256 |
| --- | --- |
| [Separater Quellenentscheid](../../outputs/release-mvp09-2026-10-18/source-approval.json) | `4a05e80c0324573f83c88463ba78d20970d0d2152b76f15766bd848bc13a9c68` |
| [Zusammengeführte Quellenprüfung](../../outputs/release-mvp09-2026-10-18/source-review-completeness.json) | `9f7b578725b3c695e3938e18354de83f47e83556d05a4fbdc653d73043c7482c` |
| [Technische Quellenprüfung](../../outputs/release-mvp09-2026-10-18/source-review-verification.json) | `3120eced83895a732a41f7eec32bb4b2486873d108a5a0ab1ce3adee94b579c7` |
| [AP23E3-Kandidatenmanifest](../../outputs/ap23e3-candidate-2026-10-18/bundle/manifest.json) | `4c9f6025b7e29f577f760d2c9381066a176486983e0bae6997ac8738661ffa31` |
| [AP23E3-Abnahmearchiv](../../outputs/ap23e3-abnahme-2026-10-18/receipt.json) | `18de59434d8dcb8469d0ebad767e6fcea55be089948335930d496990730da3ea` |
| [Tatsächlicher MVP08-Baunachweis](../../outputs/release-mvp08-2026-10-15/product-build.json) | `1638becba091b1fccc3924ad477476d6bfb8fb0fd5245d115923c6e4ebe98bd6` |
| [Versiegelung der MVP08-Artefakte](../../outputs/release-mvp08-2026-10-15/artifact-verification.json) | `5307901a72a32537ffc8f05cefa250341c42a5d21fc387a64df04ea2c1e369c2` |

Der Quellenentscheid bindet 803 Belegdateien, davon 21 direkt und bytegleich separat gesicherte Eingänge. Ursprüngliche Berichte und ihre damaligen Statuswerte bleiben unverändert. Die [maschinenlesbare Vorlagenbindung](../../outputs/release-mvp09-2026-10-18/r09b-proposal.json) hält Zielnamen, Ausgangshashes, 42 Commitpfade und die fehlende Vollzugsfreigabe fest. Der [Vorlagenprüfnachweis](../../outputs/release-mvp09-2026-10-18/r09b-proposal-verification.json) dokumentiert die lokale Kontrolle dieser Vorlage, nicht bereits einen erfolgreichen Releasebau.

## 2. Vorgesehene Versionen und Dateien

| Gegenstand | Verbindlicher Sollwert nach Freigabe dieser Vorlage |
| --- | --- |
| Datenrelease | `2026-10-18-mvp-09-approved.1` unter `data/releases/` |
| Anwendung und Root-/SPFx-Projekt | `0.9.0` |
| Reguläres SPFx-Paket und Feature | `0.9.0.0` |
| Wiederherstellungspaket und Feature | `0.9.0.1`, Anwendung und Funktionsumfang MVP `0.8.0` |
| Manifest und Mindestconsumer | `9.0.0` gemäss DEC-2026-033 |
| Verwaltungsverfahrenskatalog | `2.0.0` |
| Übrige Komponenten und Standards | Feiertagskatalog 2, Regelkalender 3, Sozialkatalog 2, Spezialregimekatalog 3, Rechtsprofile 1 und Standards 5 unverändert |

Die Versionsfelder der beiden Lockdateien werden konsistent nachgeführt. Abhängigkeiten und Toolchain werden nicht aktualisiert. Verwendet werden die vorhandene Node-22.23.2-Toolchain und die gebundenen Abhängigkeiten. Solution `13090feb-a6bf-40fa-9d3c-ec8d90516a60`, Feature `3edf1509-41e9-4a2f-8005-df510eec43b6` und Webpart `596c7f1c-4d3e-4da8-a7be-27a96024f37c` bleiben identisch. Hosts und API-Berechtigungen ändern sich nicht.

Unter `outputs/release-mvp09-2026-10-18/` entstehen nach Freigabe:

- `fristenrechner-schweiz-0.9.0.0.sppkg`
- `fristenrechner-mvp09-sharepoint-mirror.zip`
- `fristenrechner-mvp09-steimer-web.zip`
- `fristenrechner-schweiz-recovery-0.9.0.1.sppkg`

Die Paketprüfsummen werden erst an den tatsächlichen fertigen Dateien ermittelt. Geplante Namen und Versionen sind noch keine Installationsfreigabe.

## 3. Genau begrenzte Quellen- und Datenübernahme

Vor dem Vollzug werden die gebundenen Eingänge und eine separate R09-B-Ausführungsfreigabe geprüft. Neue R09-Werkzeuge übernehmen und kontrollieren die Daten. Historische R08-Werkzeuge und Nachweise bleiben unverändert. Die kanonischen Format-9- und Admin-v2-Schemas sind bereits Bestandteil des abgenommenen E3-Stands und bleiben bytegleich. Das lokale Referenzschema wird nicht als freigegebenes öffentliches Schema umetikettiert.

| Bereich | Erlaubte Änderungen gegenüber dem abgenommenen E3-Kandidaten | Unverändert zu erhalten |
| --- | --- | --- |
| Quellenregister und Prüfereignis | Acht neue Kennungen ergänzen, insgesamt 255 Einträge. Siebtes Ereignis mit genau 251 beurteilten Quellen. Expliziten Quellenindex vollständig neu ableiten | Alle bisherigen 247 Registerzeilen, sechs historischen Ereignisse und vier historischen Registerextras |
| Fassungsnachweise | Neuer ergänzender `source-version-bridges.json` mit den R08-Nachweisen und den aktuellen IVV-Originalen und Vergleichen. Hashgebundene Manifest-Erweiterung | Alte Originale, IDs und Prüfdaten. Keine zusätzliche Laufzeitquelle oder Fachregel |
| Feiertagskatalog und 32 Kalender | `activation.releaseEligibility` neu binden. Kalender deterministisch mit neuem `projection.sourceHash` erzeugen | 479 Katalogregeln, zwölf SO-Prozessregeln, 198 Herkunftsentscheide, 104 terminale Bindungen und sämtliche Kalenderregeln |
| Sozialkatalog | `review` und 50 Releasefreigaben mit neuem Quellenentscheid, tatsächlichen CH-/BE-/Kataloghashes und Release-ID binden | 44 Fachregeln, 50 BE-Anbindungen, Referenzsuite und Freigabehorizont 2026–2027 |
| Verwaltungskatalog | `review`, globale und 25 Einzelpfadfreigaben, Referenzsuite und tatsächliche Zielkomponenten neu binden. Physische Herkunft gemäss nachstehender Festlegung aktualisieren | 25 Pfaddefinitionen und Qualifikationsregeln, Revisionen, fünf rechtliche Feiertagsbindungen, acht Stillstandsprofile, Ausschlüsse und Zeitfenster |
| Manifest | Öffentliches Format-9-Schema, neue Release-ID, Status, Datum, tatsächliche 41 Deskriptoren und geprüfte Governance-/Abnahmebindungen | 42 Laufzeitdateien insgesamt, 128 Manifest-Quellenkennungen, fünf bytegleiche Rechtsprofile und bytegleicher Spezialregimekatalog |

Die acht neuen Registereinträge werden quellenbezogen klassifiziert. Die laufende Zuger Gerichtserläuterung erhält **kein erfundenes Dokumentversionsdatum**, `documentVersionDate` bleibt `null`. Der Prüftag steht im Ereignis. Beim Luzerner BGer-Beleg werden amtlicher Fundort und bisheriger Spiegelabruf getrennt erhalten. AR-ARGV wird als Verordnung erfasst, ohne ältere Registerzeilen nachträglich umzuklassifizieren.

Der Index muss genau 2136 explizite Referenzstellen einschliesslich 58 neuer Stellen auflösen. Die acht neuen Verwendungen der bereits vorhandenen Bundesfeiertagskennung sind ausdrücklich enthalten. Erwartete Registerklassen sind 157 produktive, 85 unterstützende und 13 Monitoring-Einträge. Die 713 historischen Arbeitsmappenverweise bleiben separat und nicht aktivierend. Ein allgemeiner Scanner, der Verwaltungs- und Qualifikationsbezüge übersieht, genügt nicht.

### Administrative Herkunft und Freigabebindungen

Es gilt genau ein Übernahmeweg: Alle fünf `physicalBaseline.releaseId` und deren physische Referenzprüfsummen werden auf den tatsächlichen neuen Release gebunden. Daraus werden die 25 `holidayBindingSha256` neu abgeleitet. Rechtliche Bindungsdefinitionen, Kalender-/Projektionskennungen, Pfad-/Qualifikationsdefinitionen und Stillstandsprofile bleiben unverändert. Ein veränderter physischer Herkunftshash ist keine Änderung der rechtlichen Regel.

Global sind genau sieben Komponenten gebunden: CH-Kalender, Feiertagskatalog sowie TI-, GR-, LU-, ZG- und AR-Kalender. Jeder Pfad bindet genau CH, Katalog und seinen eigenen Kantonskalender. Für LU ist ausschliesslich `ap22-lu-b879eb8eb04f` vorgesehen, nicht der andere vorhandene Luzerner Kalender. Die 25 echten Pfadfreigaben stützen sich auf die tatsächlichen Fach-/Integrationsnachweise und die menschlichen Abnahmen, nicht auf synthetische Testfreigaben.

### Fassungsnachweise und Grenzen

Die fünf AS-Akte und acht Erlassfamilien aus R08 bleiben als historische Befunde erhalten. Der neue Beleg bindet zusätzlich die vollständigen IVV-Texte vom 01.01.2027 und 01.07.2027 und den Vergleich der unveränderten verwendeten Art. 73bis/73ter. Alte IVV-Originale und der frühere Nichtverfügbarkeitsbefund bleiben bestehen. Die heutige Verfügbarkeit wird je Erlass ausgewiesen, nicht pauschal aus R08 kopiert. Die Nachweise liegen ausserhalb der 42 Laufzeitdateien.

LU bleibt auf 27.09.2026–31.12.2027 beschränkt, TI/GR/ZG/AR auf 29.08.2026–31.12.2027. AI und der Freiburger Spiegel bleiben im Ereignis `unclear`. AR-O1, TI-O2, Januarvergleiche, GR-/NE-Vorbehalte, Waadt-/GL-Nachweisgrenzen, AVIV-Option B und OF-001 bleiben bestehen. Keine ausserbernische Sozialfreigabe oder neue kantonale Spezialfreigabe.

## 4. Lokaler Datencommit und reguläre Builds

Nach bestandener unabhängiger Datenprüfung darf **genau ein lokaler Datencommit mit ausschliesslich den 42 neuen Laufzeitdateien** unter `data/releases/2026-10-18-mvp-09-approved.1/` entstehen. Die genaue Positivliste ist an das Kandidatenmanifest gebunden. Voraussetzung sind der unveränderte Ausgangs-HEAD `c37c11bc9fbf8241535d202d54c3499d2f4c3350` und ein leerer Git-Index. Andere vorhandene Änderungen, einschliesslich Dokumentänderungen, werden weder aufgenommen noch zurückgesetzt.

Jeder neue Git-Blob wird gegen die geprüften Releasebytes verglichen. Der volle Commit-SHA wird in beide regulären SPFx-Datenpins übernommen. Ein Governance-/Quellcodecommit oder Push ist nicht umfasst. Vor der späteren GitHub-Veröffentlichung ist der neue öffentliche Pin noch nicht abrufbar. E/Q sind deshalb nur mit den später separat freizugebenden, bytegleichen Mirrors vorgesehen.

Die normalen Web- und SPFx-Einstiege müssen den echten Approved-Format-9-Vertrag verwenden. Der neue eingebettete Datenstand wird als `src/release/mvp09ReleaseData.ts` erzeugt und mit `data`, `calendarRuntime` und `administrativeContext` verbunden. Der exportgesperrte E3-Kandidat wird nicht bloss umbenannt oder seiner Warnung beraubt. Der definitive Kalenderexport muss mit den neuen Herkunftsbindungen funktionieren. Fachlogik, zweispaltiger Aufbau und abgenommene UX-Korrektur bleiben unverändert.

Lebende Produktverträge für den normalen Einstieg werden nachvollziehbar auf MVP09 fortgeschrieben. Namentlich baut `tests/public-app/mvp08-build.test.ts` heute den jeweils aktuellen Einstieg und erwartet dann MVP08. Dieser Vertrag wird in historische MVP08-Archivprüfungen und neue MVP09-Produktprüfungen getrennt, nicht entfernt. Weitere bereits erkannte Einstiegserwartungen betreffen `spfx/test/product-integration.test.ts`, die Public-App-Tests `build`, `ap23e3`, `ap23d3`, `ap22c3`, `ap21`, `ap19c3` sowie die UI-Tests `ap22c2-candidate`, `ap22c3-host-policy` und `mvp05-release`. Ihre tatsächlichen Ausgangsdateien sind in der Vorlagenbindung erfasst. Neue Übernahme-, Bau-, Paket- und Regressionstests sind erlaubt, keine fachliche Ausweitung oder Abschwächung von Prüfungen. Weitere notwendige Korrekturen an bestehenden Testverträgen werden vor einer Scopeerweiterung vorgelegt.

## 5. Lokaler Rückfallkandidat auf den tatsächlichen MVP08-Stand

Massgebend ist das tatsächlich gebaute Paket `fristenrechner-schweiz-0.8.0.0.sppkg`, SHA-256 `d3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a`, mit 210 archivierten Produkteingängen und 599 archivierten Testeingängen. Alle 809 Dateien sind für diese Vorlage erneut auf Bytes und Prüfsummen geprüft. Die 16 synchronisierten SPFx-Schemaeingänge sind im Archiv vorhanden, obwohl sie nicht in Git geführt werden. Fehlende reine Hilfseingänge dürfen nur nachvollziehbar aus Publikationscommit `a3b47ab3c9c6e36831ce60b4164b45ae4b01eb60` ergänzt werden. Das Bauarchiv hat Vorrang vor Git und dem heutigen Arbeitsbaum.

Der Recovery-Bau erfolgt isoliert. Paket- und Featureversion werden auf `0.9.0.1` erhöht. Anwendung und Komponentenfunktion bleiben MVP `0.8.0`, mit Datenpin `10a99419eaabb3e96d2acccf0c7a93e2fe6472cb` und Format-8-Release `2026-10-15-mvp-08-approved.1`. Nur erforderliche Paketversions-Erwartungen in der isolierten Prüfumgebung werden angepasst. Neue Rückfalltests werden separat ergänzt.

**Ein vollständiger Rückfall nimmt auch die Feldhöhenkorrektur #50 zurück.** LU-/ZG-/AR-Verwaltungswege stehen dann ebenfalls nicht zur Verfügung. Eine selektive Übernahme neuer Funktionen in den alten Code ist nicht vorgesehen. Bundes-, BE-, TI-/GR-Funktionen und historische AP5-Kompatibilität bleiben nachzuweisen.

MVP08 liest bereits Standards 5. Unbekannte neue LU-/ZG-/AR-Auswahlen müssen beim Rückfall als nicht unterstützte Auswahl erkannt und vor automatischem Speichern und Zurücksetzen geschützt werden. Der tatsächliche Rundlauf MVP09 → Recovery/MVP08 → MVP09 muss die Rohbytes dieser Standards erhalten, einschliesslich beschädigter oder künftig unbekannter Inhalte. **Kein Browserdatenreset.** Falls die vorhandene Schutzfunktion dafür nicht genügt, ist anzuhalten und eine begrenzte Ergänzung separat vorzulegen.

Das vorhandene alte Recovery `0.8.0.1` stellt MVP07 wieder her und ist nicht verwendbar. Auch die alte Arbeitsdatei unter `spfx/sharepoint/solution/` ist keine Rückfallbasis. Im späteren Rückfall müssen die gesicherten Format-8-Mirrors für den alten Verbraucher wiederhergestellt werden, kein stiller Ersatz von Format-9-Daten. Vor R09-C wird der Tenant-Katalogbestand frisch bestätigt. Ein gleich hoher oder höherer tatsächlich vorhandener Paketstand erfordert eine neue Versions-/Paketbindung. Nach Einsatz von `0.9.0.1` braucht eine reguläre Wiederaufnahme einen erneut höheren, separat gebundenen Paketstand. Der lokale Recovery-Bau erlaubt noch keinen Rückfall im Tenant.

## 6. Prüfungen vor lokalem Abschluss

1. Echter Approved-Reader und unabhängiger Prüfer validieren die 42 fertigen Dateien. Negative Prüfungen decken fehlende Freigaben, manipulierte Fachdefinitionen, falsche Quellenkanten, falsche LU-Kalenderwahl, unvollständige Zielkomponenten und alte Hashes ab. Vorher-/Nachhervergleich erlaubt nur die oben bezeichneten Änderungen.
2. Frische Fachregression umfasst alle 25 Verwaltungswege und Qualifikationsregeln, AR-O1/TI-O2, Zeitgrenzen, fünf Bestandsprofile, 104 Bundesbindungen sowie 44 Sozialregeln und 50 BE-Anbindungen. Die zwölf bisherigen TI-/GR-Definitionen bleiben identisch.
3. Historische Formate 1–8 und AP5, Provider-/Cachewechsel, Fehlabruf, verspätete Antworten, Konfigurationsgrenzen und Standards 1–5 werden geprüft. Rückfall und Wiederaufnahme werden mit tatsächlichen Paketen und alten/neuen Daten nachgewiesen.
4. Die tatsächlich gebauten Web-/SPFx-Artefakte werden in DE/FR, schmaler Darstellung und bei Zoom geprüft. Feldhöhe/-schrift und Eingabehilfen bleiben erhalten. Synthetische Kalenderdateien werden gespeichert und inhaltlich geprüft. Gesperrte oder veraltete Resultate dürfen keinen Export ermöglichen. Kein Outlook-Import.
5. Identitäten, Versionswerte, Hosts, enthaltene Client-Assets, ES2015-Kompatibilität und unveränderte API-Berechtigungen werden am fertigen SPPKG geprüft. Grosse Pakettests und grosse Regression laufen getrennt. Lintwarnungen werden ausgewiesen, nicht durch Testentfernung oder pauschale Zeitlimitverlängerung verdeckt.
6. Die Standardtests bleiben ohne private Quellenrohbelege ausführbar. Ein isolierter Testlauf weist dies nach. Neue lebende Testverträge und historische Regressionseingänge werden getrennt archiviert.
7. Der Abschlussnachweis bindet tatsächliche Artefakte, Dateiinventare, Prüfsummen, Bauprotokolle, Datencommit, Testergebnisse und verbleibende Grenzen. Lokale Simulationen sind keine realen M365-, Geräte- oder Gastprüfungen. Frühere Outlook-Importe bedürfen einer neuen begründeten Wiederverwendungsvorlage und gesonderten Bestätigung.

Die bisherigen E3-Testzahlen sind Vergleichsbasis, kein bereits bestandener MVP09-Releasebau. Reale Host-/Geräteprüfungen, neue Paketprüfsummen und die konkrete E-/Q-Installationsfreigabe bleiben offen.

## 7. Halt und anschliessende Schritte

Anhalten bei abweichenden gebundenen Eingängen, abweichendem HEAD oder nicht leerem Index, bereits belegter Ziel-Release-ID, einer fachlichen Änderung ausserhalb der Positivliste, einem nötigen neuen Schema-/API-/Berechtigungsumfang, ungenügendem Standardschutz im Recovery oder einem ungeklärten Testfehler. Vorhandene Zielartefakte werden nicht still überschrieben. Ein abweichender Befund wird dokumentiert und vor einer Erweiterung des Auftrags vorgelegt.

Nach erfolgreichem lokalem R09-B folgt die konkrete R09-C-Vorlage für die vier bestehenden E-/Q-Instanzen, vollständige Mirrors und den gebundenen Rückfallweg. Reale Geräte-/Gastprüfung, manuelle Q-Abnahme, GitHub und P bleiben gesonderte Freigaben. Root-Webauftritt, Sitemap, Hostingkonfiguration, AP21-Testapps, E05 und M365-Berechtigungen bleiben unverändert. Der Header-/Cache-Risikoentscheid für MVP08 wird nicht automatisch auf MVP09 übertragen.

## 8. Vorgeschlagener Freigabetext

> Ich gebe R09-B gemäss dieser Vorlage vom 18. Oktober 2026 und ihrer separat gebundenen Vorlagenprüfsumme frei. Dies umfasst die kontrollierte lokale Quellen- und Datenübernahme in `2026-10-18-mvp-09-approved.1`, die ausdrücklich begrenzten Metadaten-, Versions-, Pin-, Einstiegspunkt- und Testvertragsanpassungen, die erforderlichen lokalen Übernahme-/Prüfwerkzeuge sowie genau einen lokalen Datencommit mit ausschliesslich den 42 neuen Laufzeitdateien. Ich gebe den definitiven lokalen Bau der Anwendung `0.9.0`, des SPFx-Pakets `0.9.0.0`, des zugehörigen Mirrors und Webpakets sowie des Recovery-Pakets `0.9.0.1` mit unverändertem MVP08-Funktionsumfang und die beschriebenen lokalen Tests frei. Der Rückfall nimmt auch UX #50 zurück, gespeicherte neue Standards bleiben geschützt. Die abgenommenen Fachregeln, Fallgrenzen und historischen Nachweise bleiben unverändert. Bei den bezeichneten Abweichungen ist anzuhalten. Installation, Uploads, zusätzliche Commits, GitHub-Push, M365-/Hostingänderungen, Outlook-Importe und Betriebsfreigaben sind nicht umfasst.

# Übernahme und Buildvorlage R10 B

Fassung 1.1 vom 28. Oktober 2026, Vorlagenbindung R2. **Zur gesonderten Vollzugsfreigabe vorgelegt, noch nicht ausgeführt.**

Die [Quellenprüfung R10-A2 ist ausdrücklich abgenommen](../fachrecht/abnahme-r10-a2.md). R10-B soll den abgenommenen gemeinsamen Kantonsstand samt U1-Nachtrag kontrolliert in einen echten Approved-Format-17-Release überführen, definitive lokale Artefakte bauen und einen nachgewiesenen Rückfall auf den tatsächlichen MVP09-Stand vorbereiten. Beauftragt ist bisher ausschliesslich diese Vorlage.

## 1 Ausgangslage und gebundene Eingänge

Alle 26 Kantone sind im vereinbarten allgemeinen Umfang lokal integriert. Das sind 245 Pfade für die 25 Kantone ausser Bern und das getrennte Berner Profil mit neun Regeln. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben ausschliesslich bernisch und auf 2026–2027 begrenzt. DE/FR bleiben Produktsprachen. U1 ist abgenommen, reale T06-Host-/Zoomnachweise folgen erst in E/Q. #50 ist erledigt und wird als Regression mitgeprüft.

| Eingang | Tatsächliche Bindung |
| --- | --- |
| [A2-Abnahmequittung](../../outputs/r10-a2-abnahme-2026-10-28/receipt.json) | SHA-256 `6687d720296645439b66beb6c654e79b776df7d44252751d870838749e49db52`. Separate autonome Sicherung, Originalflags unverändert |
| [Gemeinsamer A2-Abschluss](../../outputs/r10-a2-2026-10-28/common-completion.json) | 1’793’597 Bytes, SHA-256 `7a5a93d7e8147d0de9013e645343ef9a346ba3c77ee98085fb1db92b376ebbb1`. 380 Kennungen und 5’045 Verwendungen |
| [M3-Kandidatenmanifest](../../data/candidates/2026-10-28-ap23m3/manifest.json) | 30’299 Bytes, SHA-256 `4519b40136fd533600b7cda85d941c87dfc14826325a5e542534e5257cedddad`. Manifest plus 44 Artefakte |
| [Tatsächlicher MVP09-Baunachweis](../../outputs/release-mvp09-2026-10-18/product-build.json) | 523’918 Bytes, SHA-256 `9b1d4312f9fbb0e8256f4208ded9c6dacd0c57705ebf018db53fdfbbd7786105` |
| [Reguläres MVP09-Paket](../../outputs/release-mvp09-2026-10-18/fristenrechner-schweiz-0.9.0.0.sppkg) | 327’130 Bytes, SHA-256 `7a88f0f8f579c050e8354f8e741921251135bff804318f86dc1b34c1a12cc331`. Funktionale Recoveryreferenz |
| [MVP09-Artefaktprüfung](../../outputs/release-mvp09-2026-10-18/artifact-verification.json) | SHA-256 `7e623a62275ab6faa3fdde6a9c49ab4360232b16228c877ddbade545f12d14f2` |
| [Vorbereitungsbaseline](../../outputs/r10-b-vorbereitung-2026-10-28/preparation-baseline.json) | SHA-256 `c9d2a5dd98f36f609540f30cf98e6c0b6bdc787c70063bad5098f0ce92cd812f`. 21’736 geschützte Dateibindungen, acht gesonderte lebende Texte |

Die [maschinenlesbare Vorlagenbindung R2](../../outputs/r10-b-vorbereitung-2026-10-28/r10b-proposal-r2.json) enthält zusätzlich die genaue 45-Dateien-Positivliste, ursprüngliche Dateihashes, vorgesehene Quellcode-/Testpfade, Recoveryeingänge und fehlende Ausführungsrechte. Der [Vorlagenprüfnachweis](../../outputs/r10-b-vorbereitung-2026-10-28/proposal-verification-r2.json) ist ein lokaler Vorbereitungsnachweis, kein bestandener R10-Releasebau.

Der [verworfene erste Vorlagenentwurf](../../outputs/r10-b-vorbereitung-2026-10-28/superseded-r1/archive.json) bleibt unverändert nachvollziehbar. R2 ergänzt die tatsächliche Rohbyteprüfung des MVP09-Pakets, die ausdrückliche Quellenabbildung und die benötigte TypeScript-Schnittstellendeklaration. Kein Datenstand und kein Produkt wurde hierfür verändert.

## 2 Vorgeschlagene Versionen und lokale Ergebnisse

Die folgenden Werte werden erst mit der ausdrücklich auf diese Vorlage gebundenen B-Vollzugsfreigabe verbindlich. Bisher sind weder die Versionen beschlossen noch die Zieldateien gebaut.

| Gegenstand | Vorgeschlagener Sollwert |
| --- | --- |
| Anwendung, Root- und SPFx-Projekt | `0.10.0` |
| Reguläres SPFx-Paket und Feature | `0.10.0.0` |
| Recovery-Paket und Feature | `0.10.0.1`, Funktion und Anwendung weiterhin MVP `0.9.0` |
| Datenrelease | `2026-10-28-mvp-010-approved.1` unter `data/releases/` |
| Manifest und Mindestconsumer | `17.0.0` gemäss DEC-2026-042, keine neue Formatevolution |
| Verwaltungsverfahrenskatalog | `10.0.0` |
| Übrige Formate | Feiertagskatalog 2, Kalender 3, Sozialkatalog 2, Spezialregime 3, Profile 1 und Standards 5 unverändert |

Unter `outputs/release-mvp10-2026-10-28/` entstehen erst nach Freigabe:

- `fristenrechner-schweiz-0.10.0.0.sppkg`
- `fristenrechner-mvp10-sharepoint-mirror.zip`
- `fristenrechner-mvp10-steimer-web.zip`
- `fristenrechner-schweiz-recovery-0.10.0.1.sppkg`

Prüfsummen werden an den tatsächlichen fertigen Dateien ermittelt. Die Datumskomponente der geplanten Releasekennung bezeichnet den vorbereiteten Abnahmestand. Tatsächliche Bau-, Freigabe- und Prüftage werden nicht auf den 28. Oktober zurückdatiert.

Solution `13090feb-a6bf-40fa-9d3c-ec8d90516a60`, Feature `3edf1509-41e9-4a2f-8005-df510eec43b6` und Webpart `596c7f1c-4d3e-4da8-a7be-27a96024f37c` bleiben identisch. Keine zusätzlichen Hosts, API-Rechte oder Appregistrierungen. Eine spätere Installation benötigt eine frische Tenantbestätigung in R10-C. Ein dort bereits gleich hoher oder höherer Paketstand führt zum Halt.

## 3 Kontrollierte Quellen und Datenübernahme

### Quellenregister und Prüfevent

Die bestehenden **255 Registerzeilen bleiben vollständig erhalten**, 129 neue Kennungen kommen hinzu. Das ergibt **384 Registerzeilen**, nicht 380. Die vier historischen Registerextras bleiben unverändert. Der neue achte Prüfevent `2026-10-28-mvp-010-prerelease.1` bewertet genau die **380 Kennungen** des gemeinsamen A2-Inventars. 258 Manifest-/Runtime-Definitionen sind eine andere Menge. Nicht jede neue Kennung erhält eine produktive Rolle.

Die [129-zeilige Übernahmezuordnung](../../outputs/r10-b-vorbereitung-2026-10-28/source-adoption-plan.json) ist Teil der Vorlagenbindung. Sie trennt 26 Urteile, 93 Erlasse und zehn amtliche Materialien. Die Inventarklasse `judgment` wird ausdrücklich zur Registerklasse `caseLaw`. Neun einzeln bezeichnete Verordnungen beziehungsweise Reglemente erhalten aufgrund ihrer belegten amtlichen Titel die Registerklasse `ordinance`, die übrigen 84 Normquellen bleiben `statute`. Zwei Identitäten kommen zusätzlich in Kalenderdateien vor. Die 131 physischen Source-Records führen deshalb weiterhin zu genau 129 kanonischen Ergänzungen, nicht zu 131 neuen Registerzeilen.

109 neue Kennungen haben positive oder geteilte Verwendungen, 20 keine Referenzkante. Diese 20 werden ausschliesslich `supporting`, nicht pauschal produktiv. Gericht beziehungsweise Erlass und belegte Identität bestimmen Jurisdiktion und Behörde, nicht ein Kantonsfragment in der Kennung. Insbesondere bleibt ein Bundesgerichtsentscheid CH, ein Schaffhauser Obergerichtsentscheid SH und die tessinische Basler Gegenprobe TI. Bei allgemeinen Normen bezeichnet `authority` das belegte Gemeinwesen beziehungsweise die amtliche Publikation, ohne eine unbelegte konkrete beschliessende Stelle zu erfinden. Die engen Spiegelausnahmen bleiben ausschliesslich ergänzend. Eine unklare oder widersprüchliche Identität führt zum Halt, nicht zu einem erfundenen Ersatzwert.

Alle sieben bisherigen Events, ihre Einträge, Originale, Abrufdaten und damaligen Statuswerte bleiben unverändert. Der neue Event trennt aktuelle Bewertung und ursprüngliche Prüfdaten. Der explizite Index wird aus allen 5’045 Stellen einschliesslich der 2’909 neuen Verwendungen neu aufgebaut und unabhängig gegen das akzeptierte Inventar geprüft. Die 713 historischen Arbeitsmappenverweise bleiben separat und nicht aktivierend.

Die A2-Befunde erhalten ergänzende, hashgebundene Nachweise in `source-approval.json`, `source-governance-adoption.json` und `source-version-bridges.json`. Bestehende Erweiterungsmechanismen werden weitergeführt, keine zusätzliche Laufzeitdatei und keine neue Schemahauptversion eingeführt. KVG-Edition und AS 2025 769 werden zusätzlich gebunden, ohne alte XML-Texte auszutauschen. Die heute korrigierte AI-Liste wird zutreffend beschrieben, der beschlossene historische Katalog-/Workflowstatus nicht still geändert. FR ROF 2026_043, NE-LJu-/Justitia-Gate, der ergänzende nicht positiv aktivierende FR-Praxisspiegel, Januargrenzen, GR-/NE-Vorbehalte, konkrete Stillstandskollisionen, AVIV-Option B und OF-001 bleiben ausdrücklich erhalten. Die periodische Prüfung per 15.11.2026 gilt dadurch nicht als erledigt.

### Genau begrenzter Validatornachtrag

Die folgenden bereits identifizierten Anpassungen sind Teil der vorgeschlagenen B-Positivliste, keine nachträglich offene Sammelermächtigung:

| Datei oder Bereich | Enger Sollumfang und Gegenprobe |
| --- | --- |
| `tests/governance/validate_source_reviews.py` | Exakt die neun unten genannten amtlichen Hosts ergänzen. Falsche Suffixe, Subdomains, HTTP-Abweichungen und ungeprüfte andere Hosts negativ prüfen. Keine Wildcards |
| Vier neue Nullkantenurteile | `JUD-AP23J1-JU-ADM121-2017`, `JUD-AP23J1-JU-ADM77-2021`, `JUD-K1-BL-KGE81024153-20240730`, `JUD-L1-SZ-VGE-III202118`. Nur die je ID in der Vorlagenbindung festgehaltene vollständige Spiegel-URL, Rolle `supporting`, `officialUrl:null` und null Referenzen. Fremde ID, andere URL oder produktive Aktivierung müssen scheitern. Entscheidsuche wird nicht generell als amtliche Domain zugelassen |
| Ein separat belegter HTTP-/HTTPS-Herkunftsübergang | Ausschliesslich `JUD-AP23J1-JU-BGER2D55-2010`, CH/Bundesgericht, 01.03.2011. Die native HTTP-Katalogadresse bleibt unverändert. Nur im Quellenregister wird die bereits A2-gebundene kanonische Volltextadresse `https://mcp.opencaselaw.ch/entscheid/bger_2D_55_2010` als `retrievalUrl` vorgeschlagen. `officialUrl:null`, `supporting` und null Referenzen bleiben zwingend. Die Bindung der historischen Kopie und ihres Feldes `/canonical_url` steht in R2. Keine neue Recherche und keine generelle amtliche MCP-Zulassung. Jede andere Kennung, Adresse oder Aktivierung muss scheitern |
| Validator und `scripts/build-source-review-index.mjs` | Administrative Kontexte `pathId`, `lawId`, `holidayBindingId`, `suspensionProfileId`, `qualificationPolicyId` ergänzen. Beide Indexwege müssen dieselben qualifizierten Auswirkungen abbilden. Keine Verbreiterung der Fachregeln |

Die neun exakten Hosts sind `rechtsprechung.tg.ch`, `relevancy.bger.ch`, `justice.ge.ch`, `bl.swisslex.ch`, `rechtsprechung.gerichte.bs.ch`, `www.ai.ch`, `api-justsearche.vs.ch`, `decwork.ag.ch` und `grgeko.tg.ch`. Ihre Zulassung folgt nur aus den konkreten A2-Fundstellen. Die vier Nullkanten-Spiegelausnahmen und der gesonderte fünfte Herkunftsübergang sind disjunkt und keine allgemeine Hostausnahme. Bereits bestehende eng gebundene Ausnahmen bleiben unverändert. Falls diese benannten Änderungen nicht genügen, ist vor einer Erweiterung anzuhalten. Die bestehenden Register-/Event-/Indexschemas bleiben als Format unverändert.

### Zulässiger Unterschied zum Kandidaten

| Bestandteil | Nach B-Freigabe zulässiger Delta | Zwingender Bestandsschutz |
| --- | --- | --- |
| Fünf Profile und BE-Spezialregimekatalog | Bytegleiche Übernahme von sechs Dateien | Sämtliche Regeln, Fristen und Quellenwerte unverändert |
| Feiertagskatalog | Nur `activation.releaseEligibility` mit tatsächlichem Quellenentscheid und neuer Releasebindung | 479 Grundregeln, 20 Prozessregeln, räumliche Bindungen und ursprüngliche Quellenmetadaten unverändert |
| 35 Kalender | Deterministische Projektion mit `projectActivatedCalendarsV17` und neuem tatsächlichem `projection.sourceHash` | Tagesregeln, Geltung, Identitäten und historische Metadaten unverändert. Kein erster Treffer, keine freie Vereinigung |
| Sozialkatalog | Aktuelle Review-/Quellenabnahme und genau 50 Freigabe-, Release- und Komponentenbindungen | 44 Regeln, 50 BE-Anbindungen, Referenzsuite und Fenster 2026–2027 unverändert |
| Verwaltungskatalog | Review, Releasebindung, 245 Einzelpfadfreigaben, aktuelle Referenzsuite und abgeleitete Hashketten. Physische Quellen-/Kalenderbezüge der 36 Bindungen neu auf die tatsächlichen Zielbytes beziehen | 245 Pfade und Policies, 46 Stillstandsprofile, rechtliche Feiertagsanker, Qualifikation, Dauern, Ausschlüsse, Revisionen und Fenster unverändert. Sowohl `physicalBaseline` als auch die neueren `physicalSource`-Strukturen berücksichtigen |
| Manifest | Kanonisches Approved-Format-17-Schema, neue Kennung, Status und tatsächliche 44 Deskriptoren. Konkrete A2- und spätere B-Genehmigung binden | Insgesamt 45 Laufzeitdateien und unveränderte Vertragsversionen. Keine Publikations-, Installations- oder Betriebserlaubnis daraus ableiten |

Bei genau sechs Dateien sind die Rohbytes unverändert. Bei den übrigen 39 Dateien einschliesslich Manifest sind ausschliesslich die bezeichneten Freigabe-/Review-/Herkunfts-/Hashänderungen zulässig. Die Verwaltungskomponenten werden als tatsächliche Abhängigkeitsvereinigung ermittelt, derzeit **34 Komponenten**. Weder die Zahl der 36 Bindungen noch die 35 Kalender ersetzt diese Prüfung. `runtimeActive` bleibt im V10-Katalog ausdrücklich **`false`**. Wirksame Produktfreigaben folgen aus dem bestehenden Releasevertrag, nicht aus einer erfundenen Aktivierungssemantik.

Die Hashreihenfolge ist ohne Zyklen aufzubauen. Zuerst konkrete Quellen- und Freigabenachweise, danach Katalog-/Projektionsbytes, Sozial-/Verwaltungsbindungen und abschliessend Manifestdeskriptoren. Kein Katalog darf den Hash des ihn selbst beschreibenden Manifests verlangen. Prüfungen des vorgelegten Kandidaten ersetzen nicht die Prüfung des fertigen Approved-Releases. Alte R09-Promotionswerkzeuge sind nur methodische Vorbilder und dürfen weder ausgeführt noch durch blossen Versionsstringtausch angepasst werden.

## 4 Datencommit und regulärer Bau

Nach bestandener unabhängiger Datenprüfung ist **genau ein lokaler Datencommit mit ausschliesslich den 45 neuen Laufzeitdateien** vorgesehen. Die genaue Positivliste wird aus dem gebundenen M3-Manifest abgeleitet. Voraussetzung sind der unveränderte Ausgangs-HEAD `70ce67425e046a7a38a4fbe66acbd93c75ca5983` und ein leerer Index. Vorhandene Änderungen gehören nicht in diesen Commit und werden nicht zurückgesetzt. Git-Blobs müssen mit den geprüften Releasebytes übereinstimmen. Kein Quellcode-/Dokumentcommit und kein Push.

Der tatsächliche volle Datencommit-SHA wird danach in **beide regulären SPFx-Pinfelder** übernommen. Vor GitHub-Publikation ist dieser neue öffentliche Pin noch nicht erreichbar. E/Q benötigen später die gesondert genehmigten bytegleichen Mirrors. Lokale Tests dürfen fehlende Publikation nicht als erfolgreichen Remoteabruf ausgeben.

Die geschlossene Quellcode-/Testpositivliste steht mit Ausgangshashes in der maschinenlesbaren Vorlagenbindung. Sie umfasst nur Versionen und Versionsfelder der beiden Lockdateien, den neuen eingebetteten `src/release/mvp10ReleaseData.ts`, den normalen Webeinstieg, die beiden SPFx-Pins, benannte Übernahme-/Bau-/Prüfwerkzeuge einschliesslich `scripts/prepare-mvp10-source-reviews.d.mts` und erforderliche lebende Einstiegstests. Der normale Einstieg verwendet derzeit noch `mvp09Runtime`. Er muss den echten Approved-Format-17-Reader und den bestehenden Kalender-/Verwaltungskontext erhalten, nicht den exportgesperrten M3-/U1-Kandidaten umbenennen.

Bestehende Tests, die den jeweils normalen Einstieg bauen und weiterhin MVP09 erwarten, werden in historische MVP09-Archivprüfungen und neue MVP10-Produktprüfungen getrennt. Keine Assertions entfernen oder fachlich abschwächen. Kandidatenprüfungen müssen Kandidaten weiterhin exportgesperrt behandeln. Eine notwendige Änderung ausserhalb der benannten bestehenden und neuen Pfade führt zum Halt.

Beide regulären Bauten und der Recovery-Bau erfolgen in getrennten neuen Arbeitsverzeichnissen aus gebundenen Eingängen. Synchronisationswerkzeuge dürfen in diesen Baukopien die vorgesehenen generierten Produkt-/Schemakopien erzeugen. Sie dürfen nicht durch ein rekursives Bereinigen des vorhandenen Arbeits-SPFx-Baums Benutzeränderungen entfernen. Die Rechen- und Qualifikationsmodule bleiben unverändert. Nur konkret bezeichnete Release-/Hostanbindung, generierte gleichwertige Kopien und Verpackung sind umfasst.

Die vorhandene Toolchain bleibt bei Node 22.23.2, npm 10.9.8, TypeScript 5.8.3 und SPFx 1.23.2. Keine Dependency-Installation oder Aktualisierung. Lockdateien dürfen nur die Projektversionsfelder ändern. Installierte Versionen und verwendete Abhängigkeiten sind vor und nach den isolierten Bauten zu binden. `es2015` mit `downlevelIteration` bleibt bestehen. Die U1-geprüfte Übersetzung privater Felder zu WeakMaps darf nicht durch eine neue Zielplattform ersetzt werden. Die dokumentierten 136 Lintwarnungen, davon 24 in M3-Dateien, sind Ausgangsbefund, kein versprochener neuer Nullwarnungsstand. Neue Warnungsdeltas werden ausgewiesen.

## 5 Isolierter Recoverybau auf MVP09

Die 241 archivierten MVP09-Produkteingänge und 714 archivierten Testeingänge sind für diese Vorlage vollständig erneut geprüft: **955 Dateien mit 49’871’382 Bytes**. Zusätzlich werden die tatsächlichen Bytes des regulären MVP09-SPPKG, der alten Artefaktprüfung und aller 42 Format-9-Laufzeitdateien gegen ihre festen Bindungen geprüft. Eine blosse Übernahme des Paketdeskriptors aus einem Bericht genügt nicht. Die Archiveingänge haben Vorrang vor dem heutigen weiterentwickelten Arbeitsbaum und vor Git. Der Pin `0ccc4b9178503ede051964149a4b17efab8d0cf9` bleibt die funktionale Basis.

Nur fünf reine Hilfseingänge dürfen nachvollziehbar aus dem MVP09-Publikationscommit `02209d0693479494ce5f57d12d3e4e2b4466eee3` ergänzt werden: `tsconfig.json`, `spfx/eslint.config.js`, `spfx/src/declarations.d.ts` und die beiden bestehenden Webparticons. Die exakten Git-Blobhashes und Bytezahlen stehen in der Vorlagenbindung. Keine Ergänzung aus dem älteren MVP08-Commit oder aus heutigen R10-Quellen.

Geändert werden im isolierten Recovery ausschliesslich Paket-/Featureversion auf `0.10.0.1` und die dazugehörigen isolierten Versionserwartungen. Anwendung, Komponente, Funktionsumfang, alter Schemasatz und Format-9-Datenpin bleiben MVP09. Die alte archivierte `sync-schemas.mjs` mit 16 normalen und acht Implementierungsschemas ist zu verwenden, nicht die heutige Format-17-/Admin-v10-Liste.

Die funktionale Paketequivalenz wird am tatsächlichen MVP09-SPPKG nachgewiesen. Zulässige Normalisierung ist eng begrenzt auf Paket-/Featureversion, eigene Bundle-/Lizenzdateinamen, die fünf bekannten Host-SCSS-Suffixe `host`, `startup`, `badge`, `runtimeMessage`, `runtimeStatus` mit gleicher Vorkommenszahl sowie zwei erzeugte AppPartConfig-UUIDs und eine ClientSideAssets-Feature-UUID. Sonstige Binär-/Bundle-/XML-Abweichungen führen zum Halt. Keine pauschale Minifier- oder CSS-Normalisierung.

**Nicht als Rückfallbasis verwendbar:** Das vorhandene Recovery `0.9.0.1` stellt MVP08/Format 8 wieder her. Die Arbeitsdatei `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` ist tatsächlich noch `0.4.0.1`. Das U1-Testpaket ist ausdrücklich nicht deploybar. Keiner dieser Namen ersetzt den verifizierten MVP09-Baunachweis.

Ein vollständiger Rückfall nimmt alle R10-Erweiterungen zurück, einschliesslich der Verwaltungswege der 20 neu hinzugekommenen Kantone und der U1-Nachträge. Die in MVP09 enthaltene Datumshöhenkorrektur #50 bleibt dabei erhalten. Keine selektive Übernahme neuer Funktionen in den alten Code. Der Recovery-Bau genehmigt noch keine Installation oder tatsächliche Rückfallausführung.

## 6 Prüfungen und lokaler Abschluss

Die Arbeit erfolgt sequenziell mit WIP eins. Ausführbare Teilpakete bleiben auf höchstens fünf Nettoarbeitstage begrenzt. Quellen-/Datenübernahme, regulärer Bau und Recovery/Rundlauf bilden aufeinanderfolgende prüfbare Abschnitte derselben engen Freigabe, keine zusätzliche formelle Vieraugenorganisation. David nimmt die menschlichen Rollen weiterhin in Personalunion wahr.

| Prüfgruppe | Erforderlicher Nachweis vor lokalem Abschluss |
| --- | --- |
| Daten und Quellen | Echter Approved-Format-17-Reader plus unabhängiger Prüfer an allen 45 Dateien. Exakter zulässiger Delta, 35 Kalenderprojektionen, 245 Pfad-/Policy-/Eligibilityketten, 34 Komponenten, 380 Kennungen/5’045 Stellen, append-only Register/Event, beide Indexwege und die benannten Host-/Spiegel-/Kontext-Negativtests |
| Fachregression | Alle bestehenden und neuen positiven Fälle sowie Qualifikations-/Zeit-/Kollisionssperren. Bundesprofile, BE-Profil, 44 Sozialregeln/50 BE-Anbindungen und sämtliche Tranchengrenzen erhalten. Vier Januarvergleiche, NE/Le Landeron, VD/Postregel, VS/Winterende und neue Normphasen gezielt enthalten |
| Historische Verträge | Bisherige Produktformate und AP5 sowie die angenommenen Zwischenformatadapter erhalten. Kein Kandidat wird durch die reguläre Version automatisch zur freigegebenen Datenquelle. AP5-Daten und Pin unverändert |
| Tatsächliche Artefakte | Fertiges Web-ZIP, Mirror und reguläres SPPKG entpackt/in-memory gegen Sollinventar und Rohbytes prüfen. IDs, Versionen, Hosts, Client-Assets, ES2015 und fehlende zusätzliche API-Anforderungen bestätigen. DE/FR, schmal, 100/300 Prozent und U1-Diagnosetexte lokal prüfen. Keine realen M365-/Geräteprüfungen daraus ableiten |
| Kalenderexport | Synthetische DE-/FR-Dateien aus tatsächlichem neuen Artefakt speichern und inhaltlich prüfen. Positive Herkunft und Invalidierung bei Fall-/Quellenwechsel. Gesperrte oder veraltete Ergebnisse bleiben ohne Export. Kein Outlook-Import |
| Wiederherstellung | Neues Recovery tatsächlich bauen und dessen Funktion mit dem wirklichen MVP09-Paket vergleichen. Danach Rundlauf gemäss nächstem Absatz mit tatsächlichem Paketcode und denselben synthetischen Speicherbeständen |
| Portabilität und Versiegelung | Standardtests ohne private Quellenrohbelege ausführbar. Bau-/Testeingänge, Logs, Archivkopien, Datencommit, Artefaktinventare, tatsächliche Prüfsummen und Grenzen getrennt binden. Grosse Paket- und Kernregression getrennt ausführen, keine pauschale Timeoutverlängerung oder entfernte Tests |

Der lokale Rundlauf lautet **MVP09/Format 9 → MVP10/Format 17 → Recovery/MVP09/Format 9 → MVP10/Format 17**. Beide Richtungen müssen denselben `fristenrechner.defaults.v5`-Speicher und die passende IndexedDB verwenden. Neue in MVP09 unbekannte Kantonspräferenzen, beschädigte oder zukünftige Inhalte und Resetmarker bleiben rohbytegeschützt. Kein Datum, Resultat, aktuelle angeordnete Dauer oder neue rechtliche Fallqualifikation aus Defaults erfinden. Absichtlich kompatible Speichervorgänge und gezielter Reset sind von geschützter unbekannter Rohwertbehandlung zu trennen.

V1–V4 und AP5 bleiben erhalten. V5 wird nur bei tatsächlich fehlendem V5 aus älteren Werten migriert. Kein Wiederaufleben alter Defaults nach Reset. Format-9-, Format-17- und AP5-Caches bleiben an ihre tatsächliche Site-/Mirror-/Provider-/Pin-Konfiguration gebunden. Kalter Fehlabruf sperrt ohne passenden Cache. Wiederaufnahme ohne Netz darf nur den eigenen zuvor validierten und vollständig nachvalidierten passenden Cache nutzen, kein Legacy-`active`, kein fremder Mirror und kein stiller BE-/CH-Ersatz. **Kein Browserdatenreset.** Reicht vorhandener Defaults-/Cacheschutz für diesen Rundlauf nicht aus, ist eine Produktkorrektur separat vorzulegen.

## 7 Halt und nachfolgende Freigaben

Anhalten bei abweichenden Eingangsbytes, verändertem HEAD oder belegtem Index, bereits vorhandenen Zielartefakten, neuem entscheidrelevantem Inkraftsetzungsbefund, verändertem Fachobjekt/Fenster, zusätzlichem Schema-/API-/Rechtebedarf, einem nicht benannten Validator-/Dateipfadbedarf, unzureichendem Recovery-Speicherschutz oder ungeklärtem Testfehler. Vorhandene Ziele und historische Originale werden nicht überschrieben. Eine neue materielle Korrektur oder erweiterte Normalisierung bedarf gesonderter Zustimmung.

Nach erfolgreichem lokalem Abschluss folgt erst die konkrete R10-C-Vorlage. Ein späterer vollständiger Betriebsrückfall muss die betroffenen aktuellen Instanzen unter noch funktionierendem neuen Code zuerst auf ihre eigenen gesicherten Format-9-Mirrors zurückstellen, erst danach folgt alter Code. AP5 bleibt unangetastet. Nach tatsächlichem Einsatz von `0.10.0.1` erfordert eine reguläre Wiederaufnahme einen erneut höheren, neu gebundenen Paketstand, frühestens `0.10.0.2`.

E/Q, manuelle Geräte-/Gastprüfung und Q-Abnahme, Outlook-Wiederverwendung oder -Import, GitHub und P bleiben gesondert freizugeben. Keine zusätzlichen Sites, Gäste, Berechtigungen, AP21-/E05-Änderungen, Hosting-, DNS-, Mail- oder Vertragsänderungen. Root-Webauftritt und Sitemap bleiben unverändert. **Keine erneute Header-/Cacheprüfung.** Das bekannte Hostingrisiko wird in einer späteren P-Vorlage konkret benannt, nicht erneut technisch geprüft oder still als neuer Releaseentscheid übernommen.

## 8 Vorgeschlagener Freigabetext

> Ich gebe R10-B gemäss dieser Vorlage, Fassung 1.1 vom 28. Oktober 2026, und der separat vorgelegten SHA-256-Prüfsumme ihrer maschinenlesbaren Positivliste R2 frei. Dies umfasst die kontrollierte lokale Quellen-/Datenübernahme in `2026-10-28-mvp-010-approved.1`, die ausdrücklich benannte Quellenzuordnung, Validator-/Indexkontextänderungen und Spiegelgrenzen, die begrenzten Review-/Hash-/Versions-/Pin-/Einstiegs- und Testvertragsanpassungen sowie die dafür benannten lokalen Werkzeuge. Die vorgeschlagenen Versionen `0.10.0`, `0.10.0.0` und Recovery `0.10.0.1` werden damit für diesen lokalen Bau bestätigt. Genau ein lokaler Datencommit darf ausschliesslich die 45 neuen Laufzeitdateien enthalten. Der definitive lokale reguläre Web-/SPFx-/Mirrorbau und der isolierte Recovery-Bau mit unverändertem MVP09-Funktionsumfang samt beschriebenem Rundlauf sind umfasst. Fachregeln, Zeitfenster, Qualifikations-/Exportsperren, historische Originale und fremde Präferenzen bleiben unverändert. Bei den bezeichneten Abweichungen ist anzuhalten. Installation, Uploads, weitere Commits, GitHub-Push, M365-/Hostingänderungen, Outlook-Importe und Betriebsfreigaben sind nicht umfasst.

Dieser Text ist ein Vorschlag. **Aktuell besteht keine R10-B-Vollzugsfreigabe.**

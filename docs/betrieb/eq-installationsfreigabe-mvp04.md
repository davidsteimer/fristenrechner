# MVP 0.4: Begrenzte Freigabe der E-/Q-Installation

Stand: 22. September 2026. **Die unten begrenzt freigegebene Installation wurde in E begonnen. Paket `0.4.0.0` scheitert an der Katalogvalidierung im emittierten SPFx-Code. Der Rückfall im App-Katalog auf die gesicherten Bytes von `0.3.0.0` ist bestätigt, Laufzeit-Kurzprüfungen in allen vier E-/Q-Ansichten und der historischen E-Seite sind bestanden. Die E-Appinstanz-Metadaten bleiben offen. Keine bestandene MVP-0.4-E-/Q-Prüfung oder betriebliche Freigabe dieses Kandidaten.**

Dieses Dokument bewahrt die ursprüngliche Paketbindung und deren Ausführung. Die anschliessend separat erteilte Freigabe für den korrigierten Kandidaten `0.4.0.1` ist im [E-/Q-Wiederholungsversuch](eq-wiederholungsversuch-mvp04-0401.md) dokumentiert. Dort sind Katalogaktivierung, E-Quellenumstellung und bestandene Rechen-/Sperrfälle auf beiden E-Ansichten sowie die AP5-Referenzrechnung festgehalten. Vollständige Erstabrufe und weitere technische E-Prüfungen bleiben offen. Der Weitergang zur Q-Umstellung bleibt bis zur Erfüllung der E-Gates gesperrt.

## Entscheid und Zweck

David Steimer hat nach dem Vorschlag, E und Q vor der öffentlichen Veröffentlichung zu aktualisieren, erklärt:

> OK, passe den bisherige Deploymentplan entsprechend an. Ich gebe die konkrete E-/Q-Installation begrenzt freiz.

Damit wird der [MVP-0.4-Deploymentplan](deployment-mvp-04.md) auf folgende Reihenfolge angepasst:

**E → Q → manuelle Abnahme durch David Steimer → GitHub → P.**

Q dient bis zu dieser Abnahme ausschliesslich der internen Releaseprüfung. Für den unten identifizierten Kandidaten wird die Aktivierung in Q vor der vollständigen öffentlichen Releasefreigabe zugelassen. Diese begrenzte Ausnahme betrifft ausschliesslich die entsprechende Aktivierungsvoraussetzung von [DEC-2026-016](../entscheidungen/DEC-2026-016-gruppenbasierter-q-demobetrieb.md). Der historische Entscheid und die [Q-Betriebsanweisung](q-demobetrieb-ap15-betriebsanweisung.md) werden nicht rückwirkend geändert. Der externe Demobetrieb bleibt auf vollständig freigegebene Releases beschränkt und das bestehende gruppenbasierte Berechtigungsmodell bleibt unverändert.

## Freigegebener technischer Stand

| Bestandteil | Bindung |
| --- | --- |
| Anwendung / SPFx-Paket | `0.4.0` / `0.4.0.0` |
| Paketdatei | `fristenrechner-schweiz-0.4.0.0.sppkg` |
| Paket SHA-256 | `eaf4c24ae53c8c3166e38025cbe2337029c2dd88930e354030c97e622ffb6a2a` |
| Mirrorarchiv | `fristenrechner-mvp04-sharepoint-mirror.zip` |
| Mirrorarchiv SHA-256 | `3a194a29e25eb08a1c503306372671f7d9747951cdb5f31937556c3d41da0536` |
| Datenrelease | `2026-09-22-mvp-04-approved.1` |
| Lokaler Datencommit | `739876a0d11b550ea8cc702622ab22af321994a5` |
| Manifest SHA-256 | `a240b01feb671dbe4374c1e097bc9143d66fd4878cd235b3b490a9c08afec72e` |
| Mirrorumfang | Zehn Dateien, das Manifest und sämtliche neun referenzierten Nutzartefakte einschliesslich des Feiertagskatalogs |

Der [Artefaktnachweis](../../outputs/release-mvp04-2026-09-22/artifact-verification.json) bleibt die technische Inhaltsreferenz. Die Freigabe umfasst keine davon abweichenden neuen Builds oder korrigierten Datenstände. Materielle Änderungen verlangen neue Nachweise und eine erneute begrenzte Freigabe.

Diese Bindung dokumentiert den ursprünglich freigegebenen Installationsversuch. Nach dem unten ausgewiesenen E-Fehler wird `0.4.0.0` nicht weiter auf Q ausgerollt. Eine korrigierte Paketversion mit neuer Prüfsumme ist von dieser Freigabe nicht automatisch erfasst.

## Zielressourcen und zulässige Eingriffe

- Bestehende E-Ressourcen: dedizierte SharePoint-Testsite und vorhandene SharePoint-/Teams-Instanzen der Entwicklungsumgebung.
- Bestehende Q-Ressourcen: dedizierte Q-Kommunikationssite sowie die vorhandene verbundene Teamsite und Rechnerregisterkarte des privaten Q-Teams.
- Bestehender Tenant-App-Katalog: Austausch und Aktivierung derselben Fristenrechner-Paketidentität gegen das oben gebundene Paket. Der gemeinsame Katalog wirkt auf E und Q. Die Reihenfolge der Tests garantiert keine Versionsisolation.
- Vorhandene same-site Mirrors: neuen vollständigen Releaseordner hinzufügen, alle hochgeladenen Dateien byteweise prüfen und bestehende Vorgängerordner für den Rückfall erhalten.
- Bestehende MVP-Appinstanzen aktualisieren und pro WebPart beziehungsweise Registerkarte den Provider ausdrücklich auf `SharePoint-Mirror` und den jeweiligen neuen same-site Manifestpfad setzen. Die unten beschriebene historische E-Registerkarte ist von dieser Datenumstellung ausgenommen. Der unveröffentlichte GitHub-Datenpin wird in dieser Phase nicht als Laufzeitquelle verwendet.
- Technische E-Prüfung, anschliessend technische Q-Prüfung und Vorbereitung der manuellen Q-Abnahme durch David Steimer. Nachgewiesene Fehler dürfen durch Rückkehr zum unmittelbar vorher gesicherten App-/Daten-/Konfigurationsstand begrenzt rückabgewickelt werden.

Die konkreten Tenant- und Ressourcenidentitäten werden vor dem Eingriff live aufgelöst und in nicht öffentlicher Evidenz festgehalten. Historische Namen, Versionen oder lokale Paketsicherungen allein genügen nicht als Zielbestätigung.

### Historische E-Registerkarte

David Steimer hat ergänzend festgelegt, dass die vorhandene Registerkarte `V0.1 - Fristenrechner Schweiz` ihren bisherigen Namen, den angehefteten AP5-GitHub-Datenstand und den leeren Mirrorpfad behält. Sie verweist auf die bestehende historische E-Seite und ist keine weitere unabhängige direkte Teams-WebPart-Instanz. Die Ausnahme betrifft ausschliesslich ihre Datenquelle und Benennung. Es erfolgt weder eine Umstellung auf den neuen MVP-0.4-Mirror noch eine pauschale Freigabe weiterer Altinstanzen.

Der gemeinsame Austausch derselben Paketidentität im Tenant-App-Katalog bleibt wie freigegeben vorgesehen und kann damit auch den Consumer dieser historischen E-Seite aktualisieren. Ihre unveränderte AP5-Konfiguration ist nach dem Paketwechsel mit einer eigenen Kompatibilitätsprüfung zu kontrollieren. Das wäre ein Nachweis der Altstandskompatibilität, keine MVP-0.4-Datenprüfung. Die genaue Ausgangskonfiguration und der ergänzende Nutzerentscheid sind in der privaten Baseline dokumentiert.

## Vorbedingungen und Haltepunkte

1. Den geprüften zusammengehörigen Implementierungsstand lokal festhalten. Keine Veröffentlichung und kein pauschales Staging privater oder sachfremder Dateien.
2. Vor jeder Mutation die betroffenen Instanzen, den aktuellen Katalog- und Appstand, Provider, Pfade, Seiten-/Registerkartenkonfigurationen und tatsächliche Q-Mitgliedschaften sowie wirksame Berechtigungen lesen. Paket, Konfigurationen und Daten so sichern, dass der aktuelle Ausgangsstand wiederhergestellt werden kann.
3. Prüfen, dass Q tatsächlich nur der internen Abnahme dient. Vorhandene Gastrechte werden nicht durch die Aussage «keine externen Tester» gegenstandslos. Bei ungeklärten externen Zugriffen vor dem Eingriff anhalten und David Steimer den konkreten Befund vorlegen. Keine Gäste eigenmächtig entfernen oder zusätzliche Rechte vergeben.
4. Bei einer unerwarteten weiteren Nutzung derselben Paketidentität, nicht gesicherter Rückfallfähigkeit oder zusätzlich erforderlichen Berechtigungen vor dem Eingriff anhalten. Insbesondere ist eine neu erforderliche Freigabe eines `ClientSideAssets`-Ordners nicht durch diese Installation pauschal autorisiert.
5. E und Q nur mit vollständig geprüften Mirrors umstellen. Bestehende Q-Lesebeschränkungen müssen ohne Rechteausweitung auch für die neuen Releaseordner gelten. Quelle, Release-ID, Format-4-Validierung und Referenzfälle in jeder Instanz prüfen. Ein alter Cache oder MVP-0.3-Fallback zählt nicht als erfolgreicher MVP-0.4-Test.
6. Nach technischer Q-Prüfung auf die manuelle Prüfung und ausdrückliche Abnahme durch David Steimer warten. Fehlende reale Gastprüfungen bleiben als solche sichtbar. Sie werden weder aus historischen Resultaten noch aus einer Eigentümersitzung abgeleitet.

## Nicht freigegeben

- Veröffentlichung, Push, Release-Anhänge, neue Deploy-Keys oder andere GitHub-Schreibzugriffe
- Upload, Umschaltung, Verlinkung oder Betriebsfreigabe auf der öffentlichen P-Umgebung beziehungsweise steimer.ch
- Aufnahme externer Tester, neuer B2B-Gäste oder Aufnahme des externen Q-Demobetriebs mit diesem Kandidaten
- Änderungen an Mitgliedschaften, gruppenbasiertem Zugriffsmodell, Tenantfreigaben, Conditional Access oder zusätzlichen API-/Graph-Berechtigungen
- Neue Sites, Teams, App-Identitäten, tenantweite Appbereitstellung oder Änderungen an anderen Paketinstanzen
- Löschen bisheriger Mirror- und Releaseordner oder Änderungen an freigegebenen Quellen- und Fachnachweisen

Die heutige Freigabe ist keine vorweggenommene Q-Abnahme. Nach deren Erteilung benötigen GitHub-Veröffentlichung und P-Bereitstellung weiterhin ihre eigenen konkreten Freigaben.

## Ausführungsstand des ersten Versuchs

Die [Vorprüfung](eq-vorpruefung-mvp04.md) dokumentiert die erfolgte Konfigurationsaufnahme, die Sicherung aller vier bestehenden MVP-0.3-Mirrors und die inzwischen abgeschlossene Bereitstellung der vier neuen MVP-0.4-Mirrors. Alle 40 zurückgelesenen JSON-Dateien, zusammen 4'302'700 Bytes, sind byteidentisch zu den freigegebenen lokalen Artefakten. Die Berechtigungen der neuen Releaseordner stimmen mit Elternordner und Vorgängerrelease überein, die Elternberechtigungen mit der aufgenommenen Baseline. Keine Zugriffsrechte wurden verändert.

Der erste Connector-Schreibversuch war mit `HTTP 403` / `accessDenied` abgewiesen worden und bleibt als historischer Befund dokumentiert. David Steimer legte den E-Test-Releaseordner anschliessend manuell an, die lesende Kontrolle bestätigte dessen Existenz und die vorhandene Eigentümerberechtigung. Die vollständige Bereitstellung erfolgte danach über den regulären Browserzugriff des bestehenden Eigentümers. Der Connector-Schreibzugriff wurde nicht wiederholt. Der erfolgreiche Browserzugriff belegt keine konkrete Ursache des ursprünglichen Fehlers.

Nach Aufhebung der lokalen Computersperre wurde `0.4.0.0` im gemeinsamen App-Katalog aktiviert und dessen SHA-256 gegen das oben gebundene Paket bestätigt. Die E-Test-App wurde aktualisiert. Der neue Mirror wurde ausschliesslich im unveröffentlichten E-Seitenentwurf getestet. Die Validierung scheiterte mit `Ungültiger Text: holidayCatalog/data/jurisdictions/0/parentId`. Der letzte vollständig validierte MVP-0.3-Datenstand wurde korrekt als Fallback beibehalten. Es erfolgte keine Berechnung mit dem neuen Kandidaten. Nach Wiederherstellung des alten Mirrorpfads wurde der eigene Entwurf verworfen, ohne einen Publikationsbefehl auszuführen. Der Bestätigungsdialog nannte den Ausgangsstand vom 31. August 2026 um 21.28.45 Uhr. Daraus wird kein aktueller Veröffentlichungsmetadatenwert abgeleitet. Q-Appinstanzen und Q-Konfigurationen wurden nicht aktualisiert. Der gemeinsame App-Katalog bleibt gleichwohl E-/Q-weit relevant.

Die in der [Vorprüfung](eq-vorpruefung-mvp04.md#e-installationsversuch-und-technischer-befund) erläuterte Ursache ist lokal mit der kompilierten ES5-Ausgabe reproduziert und im tatsächlichen Paketbundle nachgewiesen: Die eigene Fehlerklasse verliert ihre erwartete Instanz-Prototypkette. Dadurch wird ein beabsichtigter Fehler des ersten `oneOf`-Zweigs weitergeworfen, bevor der zulässige Null-Zweig geprüft wird. Die Daten sind korrekt. Reine TypeScript-Quelltests und die mit `es2020` gebaute Webvorschau hatten diese Abweichung des SPFx-ES5-Builds nicht abgedeckt.

Der freigegebene Rückfall im App-Katalog ist bestätigt: Paket `0.3.0.0` wird als aktiviert und gültig angezeigt, die erneut heruntergeladenen 176'665 Bytes sind identisch zur gesicherten Baseline mit SHA-256 `a4cbaa646a9338419de51f7629652ecc2f9ada0ac15aeccdcf2211f72bc964e1`. Die vier Berechtigungseinträge des produktbezogenen Assetordners sind ebenfalls baselineidentisch. E-Testseite, historische E-Seite, Q-Kommunikationsseite und direkte Q-Teams-Registerkarte laden nachweislich die alte Bundledatei. Alle vier E-/Q-Ansichten einschliesslich beider direkten Teams-Registerkarten und zusätzlich die historische E-Seite bestanden den StPO-Referenzfall ohne Fallbackwarnung.

Die [Einzelnachweise und Grenzen](eq-vorpruefung-mvp04.md#rückfall-und-aktueller-haltepunkt) trennen den bestätigten Katalog- und Laufzeitstand von nicht nachgewiesenen Appinstanz-Metadaten: Eine Rücksetzung der E-Appinstanz-Versionsangabe auf `0.3.0.0` ist nicht belegt. Auch ein byteweiser Seiten-/Canvasvergleich war mit dem verfügbaren Standardzugriff nicht möglich. Die Laufzeitprüfungen erfolgten im Eigentümer-Browser mit bestehendem Cache und sind keine Mirror-Erstabrufprüfung, neue Gastprüfung oder vollständige Testmatrix. Die neuen vier Mirrorordner bleiben als korrekt vorbereitete Datenbestände erhalten. GitHub und P sowie Mitgliedschaften und Zugriffsrechte bleiben unverändert.

Die technische E-Prüfung des neuen Releases ist nicht bestanden. Weitere MVP-0.4-Q-Prüfungen und Davids manuelle Q-Abnahme sind nicht erfolgt. Es gibt keine abschliessende Installationsabnahme oder Betriebsfreigabe dieses Kandidaten. Vor einem erneuten Versuch sind eine begrenzte technische Korrektur, eine neue identifizierte Paketversion und Regressionstests gegen den emittierten ES5-Code und das paketierte Produkt erforderlich. Neue Paketprüfsumme und erneute begrenzte Installation sind separat freizugeben. Eine solche Korrektur oder ein Neubau ist in diesem Diagnoseschritt nicht erfolgt.

## Nachfolgende lokale Korrektur

Nach diesem Installations- und Diagnoseschritt hat David Steimer die lokale Korrektur und Vorbereitung eines neuen Pakets beauftragt. Der [Korrekturkandidat `0.4.0.1`](spfx-korrekturkandidat-mvp04-0401.md) wurde mit bestandenen lokalen Tests und eigener SHA-256 vorbereitet, zu diesem Zeitpunkt ohne erneute Installation. Die oben dokumentierte Freigabe für `0.4.0.0` wird dadurch nicht auf die neuen Paketbytes erweitert.

Am 22. September 2026 hat David Steimer anschliessend den [erneuten begrenzten E-/Q-Versuch mit `0.4.0.1`](eq-wiederholungsversuch-mvp04-0401.md) separat autorisiert. Dieser Nachtrag bindet die neue Freigabe an die genaue Paketprüfsumme und dieselben Ressourcengrenzen. Er dokumentiert den neuen Versuch und seinen aktuellen Zwischenhalt gesondert und lässt die vorstehenden historischen Fehler-, Rückfall- und Metadatennachweise unverändert bestehen.

## Nachweis und Verantwortlichkeit

Der Ausführungsnachweis hält mindestens Zeitpunkt, tatsächliche Zielressourcen, Ausgangsversion, Sicherungsreferenz, installierte Paketprüfsumme, Provider und Datenpfad jeder Instanz, zurückgelesene Mirrorprüfsummen, tatsächliche Prüfergebnisse, verbleibende Grenzen und gegebenenfalls Rückfall fest. Interne Identifikatoren, Mitgliedschaften, Konten und Screenshots mit solchen Angaben werden nicht öffentlich übernommen.

David Steimer nimmt Projektleitung, Betrieb, fachliche Prüfung und Freigabe derzeit in Personalunion wahr. Codex unterstützt Durchführung und Dokumentation ohne formelle Freigabe- oder Haftungsverantwortung.

# MVP 0.4: Begrenzte Freigabe der E-/Q-Installation

Stand: 22. September 2026. **Freigegeben ist die unten begrenzte interne Installation und Prüfung. Eine erfolgte Installation oder bestandene Zielumgebungsprüfung wird mit diesem Dokument nicht behauptet.**

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

## Zielressourcen und zulässige Eingriffe

- Bestehende E-Ressourcen: dedizierte SharePoint-Testsite und vorhandene SharePoint-/Teams-Instanzen der Entwicklungsumgebung.
- Bestehende Q-Ressourcen: dedizierte Q-Kommunikationssite sowie die vorhandene verbundene Teamsite und Rechnerregisterkarte des privaten Q-Teams.
- Bestehender Tenant-App-Katalog: Austausch und Aktivierung derselben Fristenrechner-Paketidentität gegen das oben gebundene Paket. Der gemeinsame Katalog wirkt auf E und Q. Die Reihenfolge der Tests garantiert keine Versionsisolation.
- Vorhandene same-site Mirrors: neuen vollständigen Releaseordner hinzufügen, alle hochgeladenen Dateien byteweise prüfen und bestehende Vorgängerordner für den Rückfall erhalten.
- Bestehende Appinstanzen aktualisieren und pro WebPart beziehungsweise Registerkarte den Provider ausdrücklich auf `SharePoint-Mirror` und den jeweiligen neuen same-site Manifestpfad setzen. Der unveröffentlichte GitHub-Datenpin wird in dieser Phase nicht als Laufzeitquelle verwendet.
- Technische E-Prüfung, anschliessend technische Q-Prüfung und Vorbereitung der manuellen Q-Abnahme durch David Steimer. Nachgewiesene Fehler dürfen durch Rückkehr zum unmittelbar vorher gesicherten App-/Daten-/Konfigurationsstand begrenzt rückabgewickelt werden.

Die konkreten Tenant- und Ressourcenidentitäten werden vor dem Eingriff live aufgelöst und in nicht öffentlicher Evidenz festgehalten. Historische Namen, Versionen oder lokale Paketsicherungen allein genügen nicht als Zielbestätigung.

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

## Nachweis und Verantwortlichkeit

Der Ausführungsnachweis hält mindestens Zeitpunkt, tatsächliche Zielressourcen, Ausgangsversion, Sicherungsreferenz, installierte Paketprüfsumme, Provider und Datenpfad jeder Instanz, zurückgelesene Mirrorprüfsummen, tatsächliche Prüfergebnisse, verbleibende Grenzen und gegebenenfalls Rückfall fest. Interne Identifikatoren, Mitgliedschaften, Konten und Screenshots mit solchen Angaben werden nicht öffentlich übernommen.

David Steimer nimmt Projektleitung, Betrieb, fachliche Prüfung und Freigabe derzeit in Personalunion wahr. Codex unterstützt Durchführung und Dokumentation ohne formelle Freigabe- oder Haftungsverantwortung.

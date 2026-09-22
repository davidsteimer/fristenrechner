# MVP 0.4: E-/Q-Vorprüfung und Ausführungsstand

Stand: 22. September 2026. **Deploymentplan angepasst und Installation begrenzt freigegeben. Noch keine Tenantinstallation, Mirroränderung oder Q-Abnahme erfolgt.**

## Lokaler Stand

Der zusammengehörige Implementierungs- und Dokumentationsstand ist lokal in Commit `c3eaa629d13198d49013a66e8ef2029883139939` eingefroren. Der eigene Datencommit bleibt `739876a0d11b550ea8cc702622ab22af321994a5`. Es erfolgte kein Push.

Die explizite Freeze-Liste umfasst 335 neue beziehungsweise geänderte Dateien. Alle Arbeitsdateien und danach sämtliche vorgemerkten Git-Inhalte wurden vor dem Commit byteweise gegen die Liste geprüft. Gegenüber dem bereits geprüften Publikationsexport änderten sich ausschliesslich die beiden Einstiegstexte und der Deploymentplan. Hinzu kam die [begrenzte E-/Q-Installationsfreigabe](eq-installationsfreigabe-mvp04.md). Die historischen Benutzer-Wordänderungen, privaten Arbeitsmappenoriginale, Arbeitskopien, `Userinput/` und `.work/` wurden nicht aufgenommen.

Die drei vorhandenen Markdown-Zeilenumbrüche mit zwei Schlussleerzeichen in der historischen Westschweizer Quellenpaketnotiz blieben unverändert. Die Git-Prüfung ohne Beanstandung dieser beabsichtigten Zeilenumbrüche bestand. Die früheren Publikations- und Fachnachweise wurden nicht rückwirkend geändert.

## Tatsächlich geprüfte Ausgangslage

| Prüfung | Beobachtung | Grenze |
| --- | --- | --- |
| Zielressourcen | Beide bestehenden E-Sites und beide bestehenden Q-Sites über SharePoint aufgelöst, E-/Q-Teams und Fristenrechnerkanäle gefunden | Noch keine vollständige Aufnahme sämtlicher WebPart- und Registerkarteneigenschaften |
| Tenant-App-Katalog | Bestehende Produktidentität mit Paket `0.3.0.0`, aktiviert, gültig und bereitgestellt, nicht tenantweit hinzugefügt | Noch kein Austausch gegen `0.4.0.0` |
| Rückfallpaket | Aktuelle Paketdatei unmittelbar aus dem Katalog heruntergeladen und lokal gesichert. SHA-256 `a4cbaa646a9338419de51f7629652ecc2f9ada0ac15aeccdcf2211f72bc964e1` stimmt mit der bekannten Rückfallkopie überein | Noch keine vollständige Sicherung sämtlicher Seiten-, Registerkarten- und Datenkonfigurationen |
| Rechnerseiten | E-Testseite und Q-Kommunikationsseite zeigen `2026-08-31-mvp-03-approved.1` und Quelle `SharePoint-Mirror` | Sichtbare Baseline, keine Prüfung des neuen Releases |
| Q-Seitenhistorie | Veröffentlichter Q-Kommunikationsseitenstand V3 vom 1. September 2026 sichtbar | Kein Ersatz für die noch ausstehende vollständige Konfigurationsaufnahme |
| Mirrorbestand | Vorhandene Mirrorordner und Vorgängerrelease in allen vier Sites gefunden | Keine neuen Ordner oder Dateien angelegt |
| Zugriffsmodell | Abgefragte E-/Q-Kanalmitgliedschaften entsprechen der bekannten internen Prüferkonstellation. Q-Teamsite-Mirror weist Lesen für die Mitgliedergruppe auf. Bestehender produktbezogener Assetordner weist Lesen für den Q-Gruppenprinzipal auf | Keine abschliessende Vollprüfung aller Sitegruppen oder eines realen Gastzugriffs |
| Consumerkompatibilität | Direkter SPFx-Release-Service-Testlauf 11/11 bestanden, einschliesslich Laden und Berechnen mit dem bisherigen MVP-0.3-Release | Lokaler Code-/Testbefund, keine SharePoint-Installationsprüfung |

Tenantadressen, interne Identitäten, Mitgliedschaftsdetails und die heruntergeladene Baseline verbleiben in der ignorierten lokalen Ausführungsevidenz unter `.work/deployments/2026-09-22-eq/`.

## Offener Ausführungshaltepunkt

Teams Web ist mit dem vorhandenen Eigentümerkonto angemeldet. Der Kanal-Startdialog sowie anschliessend die Teams-Navigation reagierten jedoch nicht auf die versuchten Browser- und Tastaturaktionen. Eine technische Ursache ist damit nicht abschliessend festgestellt. Die tatsächliche Q-Registerkarte samt aktueller Konfiguration konnte noch nicht geöffnet und aufgenommen werden.

Vor dem gemeinsamen Paketeingriff ist diese Lücke zu schliessen. David Steimer wird gebeten, im bestehenden Browser die Q-Rechnerregisterkarte manuell zu öffnen. Es werden dafür keine neuen Berechtigungen verlangt. Anschliessend werden die ausstehenden Konfigurationen und Rückfallgrundlagen erfasst und die [freigegebenen Installationsschritte](deployment-mvp-04.md#freigegebene-reihenfolge-und-haltepunkte) fortgesetzt.

**Bis dahin bleiben App-Katalog, Appinstanzen, Mirrorbestand, Mitgliedschaften, Rechte, GitHub und P unverändert.** Es wurden weder die technische E-/Q-Matrix noch die manuelle Q-Abnahme als bestanden eingetragen.

## Ergänzende Prüfbedingung

Der Consumer kann den bisherigen Format-3-Release weiterhin lesen. Sein IndexedDB-Aktivstand ist jedoch browserweit pro Origin und nicht pro Site oder Datenquelle getrennt. Eine erfolgreiche E-Sitzung darf daher keine fehlerhafte Q-Quelle verdecken. Für jede Instanz bleiben eine Prüfung ohne vorhandenen Aktivcache, die konkrete Release-ID, vollständige Manifest-/Dateiverifikation und die Kontrolle auf Fallbackwarnungen erforderlich. Ein alter oder aus einer anderen Instanz stammender Cache zählt nicht als erfolgreicher Mirror-Erstabruf.

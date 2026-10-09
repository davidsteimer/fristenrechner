# AP21 E04 – Installationsversuch und Katalogbefund

Stand: 8. Oktober 2026. **E04 wurde begonnen, aber bei der Manifestprüfung im App-Katalog angehalten. Keine Site-App installiert, keine Prüfseite erstellt, keine Geräteprüfung freigegeben.**

## Auftrag und Ergebnis

David bestätigte «Ja, E04 ausführen.» Damit war die [gebundene Installationsvorlage](ap21-e-installationsvorlage.md) für das zusätzliche Paket `fristenrechner-ap21-e-0.0.21.1.sppkg` freigegeben. Der Umfang bleibt auf die beiden E-Sites «Fristenrechner Test» und «Entwicklungsumgebung» begrenzt. E05 für die direkte Teams-Integration bleibt separat und ist nicht freigegeben.

Die exakt freigegebene Datei wurde als zusätzliches Katalogobjekt hochgeladen, nicht als Ersatz des Betriebspakets. SharePoint weist das Paket wegen eines ungültigen technischen App-Namens zurück. Die Anzeige lautet **«Gültiges App-Paket: Nein» und «Bereitgestellt: Nein»**. Eine blosse Uploadmeldung ist kein Installationsnachweis.

| Prüfung oder Schritt | Tatsächlicher Befund |
| --- | --- |
| E01 Kandidatenbindung | Alle 24 gebundenen Vorbereitungsartefakte stimmen. SPPKG, Version und Identitäten entsprechen der Freigabe. Die früheren 153 AP21- und 204 archivierten AP22C3-Artefakte sind unverändert |
| E02 Live-Ausgangsstand | Beide E-Sites, bestehende Apps, Katalogpakete und die Seitenliste der Testsite gezielt gelesen. Kein AP21-Paket, keine AP21-Site-App und keine gleichnamige Prüfseite vor dem Upload festgestellt. Kein vollständiger neuer Berechtigungs- und Teams-Registerkartenvergleich durchgeführt, deshalb E02 nicht pauschal als bestanden gewertet |
| E03 Mirrors | Je elf Dateien aus beiden bestehenden MVP-0.6-Mirrors frisch zurückgelesen. Alle 22 Dateien stimmen in Länge und SHA-256 mit dem freigegebenen Bündel überein. Keine Mirroränderung |
| E04 Upload und Paketreadback | Zusätzliches Paket hochgeladen und frisch zurückgelesen. 289’704 Bytes, exakt freigegebene SHA-256 |
| Katalogvalidierung | Fehlgeschlagen bei `AppManifest.xml`, Attribut `Name`, Typ `NameDefinition` |
| Site-Installation und neue Prüfseite | Nicht ausgeführt |
| E05 und Geräteprüfung | Nicht begonnen |
| Betriebspaket nach Versuch | Frisch zurückgelesen und byteidentisch zum zuvor gesicherten Paket `0.6.0.1`. Im Katalog weiterhin gültig und bereitgestellt |

Die lokalen Build- und Testresultate der Vorbereitung wurden als vorhandene Belege geprüft. Sie wurden in diesem Vollzug nicht als neue Testläufe ausgegeben und ersetzen die gescheiterte SharePoint-Manifestvalidierung nicht.

## Ursache und konkrete Testlücke

Der Paketbau schreibt den Wert `Fristenrechner AP21 E-Gerätetest` aus `solution.name` in das technische Attribut `App/@Name`. Die Katalogfehlermeldung nennt genau diesen Wert und eine verletzte Musterbedingung. Das `ä` ist dort nicht zulässig. Microsoft beschreibt `NameDefinition` als beschränkten internen Namen mit einer ASCII-basierten Zeichenmenge und maximal 64 Zeichen. Der technische Name ist vom sichtbaren Titel zu trennen. [Microsoft: NameDefinition](https://learn.microsoft.com/en-us/sharepoint/dev/schema/namedefinition-simpletype-sharepoint-add-in-manifest).

Das lokale SPFx-Konfigurationsschema prüft an dieser Stelle lediglich einen Zeichenkettenwert. Die bisherigen Isolationstests prüfen nicht das Zeichenmuster des tatsächlich verpackten `App/@Name`. Das ist eine Lücke unserer Paketvorprüfung. Der beobachtete Abbruch betrifft die Paketmetadaten, nicht die Datumseingabe und nicht fehlende Tenantrechte. Über die Funktionsfähigkeit einer installierten AP21-App ist damit noch nichts nachgewiesen.

Die Katalogzeile zeigt infolge der zurückgewiesenen Manifestmetadaten eine leere Produkt-ID und `1.0.0.0`. Diese Anzeige wird nicht als tatsächliche Paketversion übernommen. Massgebend sind der identische Paketreadback und das enthaltene Manifest mit Version `0.0.21.1`. Auch das Listenfeld «Aktiviert: Ja» hebt «Gültiges App-Paket: Nein» und «Bereitgestellt: Nein» nicht auf.

## Unveränderte Grenzen und Belege

| Artefakt | SHA-256 |
| --- | --- |
| AP21-Kandidat, lokal und Katalogreadback | `a83a47fc930970f5086f37d2ccf3ad5ed91718fa30288077419853edcf7d56cf` |
| Bestehendes Betriebspaket, vor und nach Upload | `60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587` |
| MVP-0.6-Manifest, beide Mirrors | `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |

Keine bestehenden Site-Apps, Seiten, Registerkarten, Datenquellen, Berechtigungen oder Richtlinien wurden verändert. Q, historische AP5-Ansicht, P und GitHub wurden nicht bearbeitet. Dies ist eine Aussage über die ausgeführten Aktionen, kein vollständiger erneuter Liveaudit dieser Umgebungen.

Der ungültige zusätzliche Katalogeintrag bleibt nicht bereitgestellt erhalten. Seine Entfernung ist von E04 ausdrücklich nicht umfasst. Es wurde keine neue Testansicht erzeugt, die im begrenzten Rückfall entfernt werden müsste. Ein Downgrade des Betriebspakets ist nicht erforderlich.

Die [maschinenlesbare Ergebnisbindung](../../outputs/ap21-e04-2026-10-08/execution-proof.json) ergänzt die unveränderten Vorbereitungsbelege. Interne Zieladressen, Objektkennung und Rohdateien liegen im privaten Vollzugsordner. Der lokale Katalog-Screenshot ist ein interner Prüfbeleg und erhält durch diese Dokumentation keine Publikationsfreigabe.

## Vorgeschlagene Fortsetzung – noch nicht umgesetzt

1. Technischen ASCII-Namen und sichtbaren deutschen Titel trennen, beispielsweise `FristenrechnerAP21EDeviceTest` und «Fristenrechner AP21 E-Gerätetest». Bestehende Kandidatenidentitäten, Isolationsgrenzen, Datenbindungen und Datumseingabe unverändert lassen.
2. Regressionstest am tatsächlich verpackten XML für technischen Namen und sichtbaren Titel ergänzen. Eine konservative ASCII-Prüfung ist dabei keine vollständige SharePoint-XSD-Validierung.
3. Neuen Kandidaten mit eigener Versions- und Prüfsummenbindung bauen. Alte Paketdatei und Nachweise nicht überschreiben.
4. Für den korrigierten Kandidaten eine konkrete Installationsfreigabe einholen. Vor Fortsetzung den Live-Ausgangsstand und die noch offenen Teile von E02 vervollständigen. Den Umgang mit dem ungültigen Katalogeintrag gesondert binden.

Der bestehende E04-Auftrag erlaubt keine stille Ersetzung seiner ausdrücklich gebundenen Paketbytes. AP21 und die Geräteabnahme bleiben offen.

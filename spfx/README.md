# Fristenrechner Schweiz für SharePoint und Teams

Dieser Ordner enthält die produktive SPFx-Lösung des Fristenrechners Schweiz. Dasselbe WebPart und dasselbe `.sppkg` laufen auf modernen SharePoint-Seiten und als Microsoft-Teams-Kanalregisterkarte.

**Stand 28. September 2026:** MVP 0.5 ergänzt AP17/AP18 um die erste abgenommene AP19-Tranche mit Manifest-/Consumerformat `5.0.0` und Sozialverfahrenskatalog `1.0.0`. 24 nationale Regeln sind mit 28 ausschliesslich bernischen Anbindungen freigegeben. Die zusammengeführte Quellenprüfung und der Datenrelease sind abgenommen. Paket `0.5.0.0` ist auf vier bestehenden E-/Q-Instanzen mit ihren vollständigen SharePoint-Mirrors installiert. Der [E-/Q-Nachweis](../docs/betrieb/eq-installation-mvp05.md) umfasst 123 bestandene technische Punkte einschliesslich AP5-Kompatibilität. David hat Q fachlich abgenommen und die reale Anmeldung mit dem bestehenden B2B-Gast bestätigt. Die [Abnahmenotiz](../docs/betrieb/abnahme-q-mvp05.md) trennt diese Benutzernachweise von den technischen Tests. Noch keine MVP-0.5-Veröffentlichung auf GitHub oder P. GitHub bleibt nach dokumentiertem Stand auf MVP 0.4, P wegen des Hostingbefunds auf MVP 0.3. Historische [Korrektur- und Paketnachweise](../docs/betrieb/spfx-korrekturkandidat-mvp04-0401.md) sowie der abgeschlossene Machbarkeitsspike unter [`../spike/spfx/`](../spike/spfx/README.md) bleiben unverändert.

## Toolchain

| Baustein | Version |
| --- | --- |
| Node.js | 22.23.2 |
| SharePoint Framework | 1.23.2 |
| React und React DOM | 17.0.1 |
| Fluent UI React | 8.106.4 |
| TypeScript | 5.8.x |
| Heft | 1.2.17 |

Dies ist die unveränderte, im definitiven MVP-0.5-Build verwendete Toolchain. Lockdateien binden die konkret installierten Versionen. Die Microsoft-Kompatibilitätsmatrix bleibt vor künftigen Toolchainänderungen gesondert zu prüfen.

## Quellstruktur

- `../src/core/` ist die führende Quelle des deterministischen Rechenkerns.
- `../src/ui/` ist die führende Quelle der hostneutralen Rechneroberfläche.
- `src/core/` enthält den providerneutralen Release-Service, die Releasevalidierung für Formate 1 bis 5 sowie den lokalen Aktivstand.
- `src/webparts/fristenrechner/` enthält ausschliesslich den dünnen SPFx-Hostadapter.
- `src/product/` und `src/core/schemas/` werden vor Test, Build und lokalem Start mechanisch aus den führenden Repository-Quellen erzeugt und nicht separat gepflegt. Zu den synchronisierten Schemata gehören Fristdefinition, Fristwahrung, Spezialregimekatalog `3.0.0`, Kalenderkomponente `2.0.0`, Feiertagskatalog `1.0.0` und Sozialverfahrenskatalog `1.0.0`.

Damit existieren weder ein zweiter Rechenkern noch eine zweite Oberfläche für Microsoft 365.

## Datenquellen

Die WebPart-Konfiguration bietet zwei Provider:

- `GitHub`, im Paket auf den vollständigen Datencommit `3109c39730f10d31cb6c57200b36dd5091d7bcd1` des unveränderlichen Datenrelease `2026-09-28-mvp-05-approved.1` gepinnt. Dieser Commit ist noch nicht veröffentlicht, der Standardpfad deshalb noch nicht öffentlich abrufbar
- `SharePoint-Mirror`, konfigurierbar als serverrelativer Ordner auf derselben SharePoint-Website

Ein Release wird nur nach vollständiger Schema-, Grössen-, Prüfsummen-, Referenz- und Abdeckungsprüfung aktiviert. Format 2 verlangt zusätzlich mindestens einen vollständig validierten Spezialregimekatalog. Format 3 verlangt die Kalenderkomponente 2.0.0, offene Abdeckung sowie vollständig auflösbare Regeln, Overrides und Stillstandssatz-Referenzen. Format 4 ergänzt den vollständigen Feiertagskatalog und die Prüfung seiner begrenzten operativen Projektion. Format 5 ergänzt den Sozialverfahrenskatalog mit getrennten Bundesregeln und kantonalen Anbindungen, rechtlichen Zeitbindungen und hashgebundenen Freigaben. Eine nationale Modellierung gibt keine zusätzliche kantonale Anwendung frei. Nur `approved` wird aktiviert. Ein Datenstand mit `candidate` wird auch bei korrekten Prüfsummen abgewiesen. Bei einem Netzfehler bleibt der letzte vollständig validierte Aktivstand in IndexedDB mit sichtbarem Hinweis verfügbar. Das Paket beantragt keine Microsoft-Graph- oder sonstigen API-Berechtigungen und benötigt keine Entra-App-Registrierung.

Der Mirrorpfad ist standardmässig leer. Für Teams muss der Mirror deshalb auf der zum Team gehörenden SharePoint-Website bereitgestellt und in der betreffenden Registerkarteninstanz konfiguriert werden. E und Q verwenden vor der Veröffentlichung ausdrücklich diesen Modus, nicht den unveröffentlichten GitHub-Pin. Der vollständige MVP-0.5-Mirror enthält elf Laufzeitdateien: Manifest, fünf Profile, zwei Regelkalender, `special-regimes/vrpg-be.json`, `holiday-catalogs/ch-holiday-catalog.json` und `social-procedures/ch-social-procedures.json`. Ein Katalogauszug oder das Weglassen nicht operativ verwendeter Regeln ist unzulässig. Cross-Site-Pfade werden durch den SharePoint-Provider abgewiesen.

Der führende UI-Quellstand enthält zudem die abgenommene Funktion aus Issue #18. Sie erzeugt eine Outlook-kompatible Kalenderdatei vollständig im Browser und benötigt deshalb weiterhin keine Microsoft-Graph-Berechtigung.

## Lokaler Build

```bash
nvm use
npm ci
python3 scripts/generate-teams-icons.py
npm test
npm run build
```

Die Befehle werden im Ordner `spfx/` ausgeführt. Der definitive MVP-0.5-Bau bestand 84 Provider-/Quellintegrationstests. Der Build erzeugt `sharepoint/solution/fristenrechner-schweiz.sppkg` mit eingebetteten Client-Assets. Anschliessend führt `npm run test:built` die [Prüfungen des emittierten und tatsächlich paketierten Codes](test-build/README.md) aus, im gebundenen MVP-0.5-Bau 42 bestandene Tests. Vor der Paketierung prüft `npm run audit:bundle` das finale Bundle auf eine direkt anwendbare globale Produkt-CSS. Lokalisierte `fr-*`-Klassennamen und wörtlich ausgelieferte `:global`-Marker führen zum Abbruch. Die lokale SharePoint-Debugumgebung wird mit `npm start` auf Port 4321 gestartet.

Für einen isolierten Neubau ist im Repositoryhauptordner `npm run build:spfx:mvp05` vorgesehen. Das tatsächlich auf E und Q installierte, unverändert aufzubewahrende [Auslieferungsartefakt](../outputs/release-mvp05-2026-09-28/artifacts/fristenrechner-schweiz-0.5.0.0.sppkg) liegt unter `outputs/release-mvp05-2026-09-28/artifacts/fristenrechner-schweiz-0.5.0.0.sppkg`, trägt Version `0.5.0.0`, umfasst 222’393 Bytes und hat SHA-256 `f46beaadbfd9e2a893b55853bb2d622cb6850e5d72b08b9443d367e0d6f6cf39`. Der erhaltene lokale Standardpfad `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` enthält weiterhin das historische Paket `0.4.0.1`. Das ist kein Versionsfehler im getrennt gebauten MVP-0.5-Artefakt.

Beim ursprünglichen Kandidaten `0.4.0.0` wurde ein unabhängiger Neubau funktional geprüft, der wegen dokumentierter Buildvarianz nicht bitidentisch war. Dies ist kein Nachweis eines unabhängigen byteidentischen Zweitbaus von `0.5.0.0`. Die obige Prüfsumme bezeichnet ausschliesslich das konkret auf E und Q geprüfte Paket, nicht jeden späteren Neubau. Der [definitive MVP-0.5-Nachweis](../docs/betrieb/releaseartefakte-mvp-05.md) bindet tatsächliche Artefakte und archivierte Baubelege. Historische Buildvarianz bleibt in der [MVP-0.4-Vorprüfung](../docs/betrieb/publikationsvorpruefung-mvp04.md#p03-erklärte-buildvarianz-des-spfx-neubaus) dokumentiert.

## Bereitstellung

1. Erst nach konkreter Freigabe das oben hashgebundene `.sppkg` in den Tenant-App-Katalog hochladen und aktivieren. Den Codeeinfluss auf alle bereits verbundenen Instanzen berücksichtigen.
2. App auf der SharePoint-Zielsite installieren.
3. WebPart auf einer modernen Seite hinzufügen.
4. Für Teams die App zusätzlich auf der zum Team gehörenden SharePoint-Website installieren.
5. WebPart als Kanalregisterkarte hinzufügen.
6. Falls verwendet, den Mirrorpfad für jede WebPart-Instanz separat konfigurieren.

Die Bereitstellung ist adminarm, aber nicht adminfrei. Diese Anleitung autorisiert weder einen Upload noch eine zusätzliche Installation. Vor dem GitHub-Betrieb und einer neuen Dritt-Tenant-Auslieferung müssen der Datenpin veröffentlicht und die elf Laufzeitdateien öffentlich byteweise verifiziert sein. Bei einem Update von MVP 0.4 sind Consumer und Datenpfad gemeinsam umzustellen, weil der alte Consumer Format 5 nicht lesen kann. Bestehende Instanzkonfigurationen werden nicht zwingend durch ein Paketupdate ersetzt. Der Mirrorpfad bleibt pro Instanz ausdrücklich zu konfigurieren.

Die [MVP-0.5-Deploymentanleitung](../docs/betrieb/deployment-mvp-05.md) enthält Zielumfang, Prüfmatrix und Rückfall auf die unmittelbar zuvor verifizierte Baseline. Die [Dritt-Tenant-Anleitung](../docs/betrieb/installation-und-betrieb-dritttenants.md) enthält die vollständige elfteilige Mirrorstruktur. Der aktuelle E-/Q-Nachweis belegt Installation, cachefreie Mirrorabrufe, kontrollierte Komponentenladefehler und tatsächliche Kalenderdateiexporte auf allen vier Instanzen. Q-Abnahme und reale Anmeldung des bestehenden B2B-Gasts sind separat durch David bestätigt. Outlook Desktop hat er als manuell geprüft gemeldet. Outlook Web wurde mit einem tatsächlichen Import geprüft und der Testtermin anschliessend entfernt. Der [Outlook-Nachweis](../docs/betrieb/outlook-pruefung-mvp05.md) hält das Ergebnis separat fest, nicht aus dem ICS-Export abgeleitet. Diese Nachweise sind keine Dritt-Tenant-, GitHub- oder P-Freigabe. Der [Q-Betrieb](../docs/betrieb/q-demobetrieb-ap15-betriebsanweisung.md) bleibt auf das beschlossene Gruppenprinzip begrenzt, ohne neue Berechtigungen durch dieses Paket.

## Lizenz

Der Programmcode steht unter AGPL-3.0-only. Daten, Dokumente und weitere Inhalte behalten ihre jeweils ausgewiesene Lizenz.

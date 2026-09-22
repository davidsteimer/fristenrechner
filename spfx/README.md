# Fristenrechner Schweiz für SharePoint und Teams

Dieser Ordner enthält die produktive SPFx-Lösung des Fristenrechners Schweiz. Dasselbe WebPart und dasselbe `.sppkg` laufen auf modernen SharePoint-Seiten und als Microsoft-Teams-Kanalregisterkarte.

**Stand 22. September 2026:** MVP 0.4 verbindet die gestufte AP17-Bedienung mit dem AP18-Feiertagskatalog und Manifest-/Consumerformat `4.0.0`. Datenrelease und Quellenprüfung sind abgenommen. Das korrigierte Paket `0.4.0.1` ist auf allen vier E-/Q-Instanzen mit ihren vollständigen SharePoint-Mirrors installiert und geprüft. G01, F01–F09, N01–N04 und U01–U03 sowie die separate AP5-Kompatibilitätsprüfung sind bestanden, die fachliche Q-Abnahme ist erteilt. GitHub-Veröffentlichung und P-Bereitstellung stehen aus, P bleibt auf MVP 0.3. Der [E-/Q-Nachweis](../docs/betrieb/eq-wiederholungsversuch-mvp04-0401.md) und das [lokale Publikationspaket](../docs/betrieb/publikationspaket-mvp04.md) dokumentieren offene Restpunkte. Der lokale [Korrektur- und Paketnachweis](../docs/betrieb/spfx-korrekturkandidat-mvp04-0401.md), die Fehlerhistorie von `0.4.0.0` und der abgeschlossene Machbarkeitsspike unter [`../spike/spfx/`](../spike/spfx/README.md) bleiben unverändert erhalten.

## Toolchain

| Baustein | Version |
| --- | --- |
| Node.js | 22.23.2 |
| SharePoint Framework | 1.23.2 |
| React und React DOM | 17.0.1 |
| Fluent UI React | 8.106.4 |
| TypeScript | 5.8.x |
| Heft | 1.2.17 |

Diese Kombination entspricht der Microsoft-Kompatibilitätsmatrix für SPFx 1.23.2. Die Versionen sind absichtlich exakt gepinnt.

## Quellstruktur

- `../src/core/` ist die führende Quelle des deterministischen Rechenkerns.
- `../src/ui/` ist die führende Quelle der hostneutralen Rechneroberfläche.
- `src/core/` enthält den providerneutralen Release-Service, die Releasevalidierung für Format 1, 2, 3 und 4 sowie den lokalen Aktivstand.
- `src/webparts/fristenrechner/` enthält ausschliesslich den dünnen SPFx-Hostadapter.
- `src/product/` und `src/core/schemas/` werden vor Test, Build und lokalem Start mechanisch aus den führenden Repository-Quellen erzeugt und nicht separat gepflegt. Zu den synchronisierten Schemata gehören Fristdefinition, Fristwahrung, Spezialregimekatalog `3.0.0`, Kalenderkomponente `2.0.0` und Feiertagskatalog `1.0.0`.

Damit existieren weder ein zweiter Rechenkern noch eine zweite Oberfläche für Microsoft 365.

## Datenquellen

Die WebPart-Konfiguration bietet zwei Provider:

- `GitHub`, im Paket auf den vollständigen Datencommit `739876a0d11b550ea8cc702622ab22af321994a5` des unveränderlichen MVP-0.4-Releases gepinnt. Dieser Commit ist noch nicht veröffentlicht, der Standardpfad deshalb noch nicht öffentlich abrufbar
- `SharePoint-Mirror`, konfigurierbar als serverrelativer Ordner auf derselben SharePoint-Website

Ein Release wird nur nach vollständiger Schema-, Grössen-, Prüfsummen-, Referenz- und Abdeckungsprüfung aktiviert. Format 2 verlangt zusätzlich mindestens einen vollständig validierten Spezialregimekatalog. Format 3 verlangt die Kalenderkomponente 2.0.0, offene Abdeckung sowie vollständig auflösbare Regeln, Overrides und Stillstandssatz-Referenzen. Format 4 ergänzt den vollständigen Feiertagskatalog und die Prüfung seiner begrenzten operativen Projektion. Nur `approved` wird aktiviert. Ein Datenstand mit `candidate` wird auch bei korrekten Prüfsummen abgewiesen. Bei einem Netzfehler bleibt der letzte vollständig validierte Aktivstand in IndexedDB verfügbar. Das Paket beantragt keine Microsoft-Graph- oder sonstigen API-Berechtigungen und benötigt keine Entra-App-Registrierung.

Der Mirrorpfad ist standardmässig leer. Für Teams muss der Mirror deshalb auf der zum Team gehörenden SharePoint-Website bereitgestellt und in der betreffenden Registerkarteninstanz konfiguriert werden. Der vollständige MVP-0.4-Mirror enthält zehn Dateien: Manifest, fünf Profile, zwei Regelkalender, `special-regimes/vrpg-be.json` und `holiday-catalogs/ch-holiday-catalog.json`. Ein Katalogauszug oder das Weglassen nicht operativ verwendeter Regeln ist unzulässig. Tenantinterne Cross-Site-Abrufe sind ohne eigenen Test nicht freigegeben.

Der führende UI-Quellstand enthält zudem die abgenommene Funktion aus Issue #18. Sie erzeugt eine Outlook-kompatible Kalenderdatei vollständig im Browser und benötigt deshalb weiterhin keine Microsoft-Graph-Berechtigung.

## Lokaler Build

```bash
nvm use
npm ci
python3 scripts/generate-teams-icons.py
npm test
npm run build
```

Die Befehle werden im Ordner `spfx/` ausgeführt. Der Build führt 48 Provider- und Integrationstests aus und erzeugt `sharepoint/solution/fristenrechner-schweiz.sppkg` mit eingebetteten Client-Assets. Anschliessend führt `npm run test:built` zwingend 25 zusätzliche [Prüfungen des emittierten und tatsächlich paketierten Codes](test-build/README.md) aus. Das auf E und Q installierte Paket trägt die Version `0.4.0.1`, umfasst 202'616 Bytes und hat SHA-256 `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346`. Vor der Paketierung prüft `npm run audit:bundle` das finale Bundle auf eine direkt anwendbare globale Produkt-CSS. Lokalisierte `fr-*`-Klassennamen und wörtlich ausgelieferte `:global`-Marker führen zum Abbruch. Die lokale SharePoint-Debugumgebung wird mit `npm start` auf Port 4321 gestartet.

Beim ursprünglichen Kandidaten `0.4.0.0` wurde ein unabhängiger Neubau funktional geprüft, der wegen dokumentierter Buildvarianz nicht bitidentisch war. Dies ist kein Nachweis eines unabhängigen Zweitbaus von `0.4.0.1`. Die obige Prüfsumme bezeichnet ausschliesslich das auf E und Q geprüfte Korrekturpaket, nicht jeden späteren Neubau. Einzelheiten zur damaligen Buildvarianz stehen in der [Publikationsvorprüfung](../docs/betrieb/publikationsvorpruefung-mvp04.md#p03-erklärte-buildvarianz-des-spfx-neubaus).

## Bereitstellung

1. `.sppkg` in den Tenant-App-Katalog hochladen und aktivieren.
2. App auf der SharePoint-Zielsite installieren.
3. WebPart auf einer modernen Seite hinzufügen.
4. Für Teams die App zusätzlich auf der zum Team gehörenden SharePoint-Website installieren.
5. WebPart als Kanalregisterkarte hinzufügen.
6. Falls verwendet, den Mirrorpfad für jede WebPart-Instanz separat konfigurieren.

Die Bereitstellung ist adminarm, aber nicht adminfrei. Diese Anleitung autorisiert weder einen Upload noch eine Installation. Vor dem GitHub-Betrieb müssen der Datenpin veröffentlicht und die Dateien öffentlich byteweise verifiziert sein. Bei einem Update von MVP 0.3 sind Consumer und Datenpfad gemeinsam umzustellen, weil der alte Consumer Format 4 nicht lesen kann. Bestehende Instanzkonfigurationen werden nicht zwingend durch ein Paketupdate ersetzt.

Die [MVP-0.4-Deploymentanleitung](../docs/betrieb/deployment-mvp-04.md) enthält Paketprüfsumme, vollständige Mirrorstruktur, Zielumgebungsprüfungen und Rollback auf MVP 0.3. Der aktuelle E-/Q-Nachweis belegt Installation, eigene cachefreie Mirrorabrufe, Funktionsprüfungen und tatsächliche Kalenderdateiexporte auf allen vier Instanzen. Die erneuten Outlook-Importtests T15/T16 benötigen gesonderte Autorisierung und sind weiterhin offen, ein Verzicht ist nicht beschlossen. Auch der tatsächliche Gasttest bleibt offen. Die fachliche Q-Abnahme erteilt keine externe Q-Demofreigabe, GitHub-Veröffentlichung oder P-Bereitstellung. Der [Q-Betrieb](../docs/betrieb/q-demobetrieb-ap15-betriebsanweisung.md) bleibt auf das beschlossene Gruppenprinzip begrenzt, ohne neue Berechtigungen durch dieses Paket.

## Lizenz

Der Programmcode steht unter AGPL-3.0-only. Daten, Dokumente und weitere Inhalte behalten ihre jeweils ausgewiesene Lizenz.

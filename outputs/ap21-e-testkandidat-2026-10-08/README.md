# AP21 Getrennter E-Gerätetestkandidat

Stand: 8. Oktober 2026. **Lokal gebaut und technisch geprüft. Noch nicht installiert oder veröffentlicht.** Die lokale Bedienprüfung wurde von David bestätigt. Die Prüfung auf realen Geräten und die abschliessende AP21-Abnahme bleiben offen.

## Gebundenes Paket

| Merkmal | Wert |
| --- | --- |
| Datei | [fristenrechner-ap21-e-0.0.21.1.sppkg](fristenrechner-ap21-e-0.0.21.1.sppkg) |
| Anzeigename | Fristenrechner AP21 E-Gerätetest |
| Separate Testversion | `0.0.21.1`, kein Update des Betriebspakets `0.6.0.1` |
| Grösse | 289704 Bytes |
| SHA-256 | `a83a47fc930970f5086f37d2ccf3ad5ed91718fa30288077419853edcf7d56cf` |
| Datenrelease | `2026-10-01-mvp-06-approved.1`, Format `6.0.0` |
| Manifest SHA-256 | `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |

Massgebend sind ausschliesslich diese Paketbytes. Die Datei im isolierten internen Buildordner behält aus technischen Gründen den bisherigen generischen Dateinamen. **Für eine spätere Installation ist nur die oben verlinkte, separat benannte Datei vorgesehen.** Die Paket-ID ist in beiden bytegleichen Kopien eigenständig. Vorläufer aus anderen Buildordnern sind nicht freigegeben.

Die [begrenzte Installationsvorlage](../../docs/betrieb/ap21-e-installationsvorlage.md) enthält die neuen technischen Kennungen, die zwei E-Ziele, die Live-Vorprüfung, die Installationsfreigabe, den Geräteumfang und den Rückfall. Der [Kandidatenvertrag](candidate-contract.json) und der [Baunachweis](build-verification.json) sind maschinenlesbar.

## Trennung vom Betrieb

- Eigenständige Solution-, Feature- und Webpart-ID sowie eigene Bundle- und CSS-/DOM-Kennungen.
- Eigene Datenbank `fristenrechner-ap21e` und eigene Standards unter `fristenrechner.ap21e.defaults.v1`. Keine Migration oder Löschung produktiver Standards und kein Zugriff auf den produktiven Cache.
- Feste Bindung an die zwei dokumentierten E-Sites und deren bestehende MVP-0.6-Mirrors. Keine frei konfigurierbare Datenquelle. Eine andere Site wird vor Datenabruf und Cacheverwendung zurückgewiesen.
- Exakte Prüfung des Manifesthashs und der vollständig validierten Releasebytes. Ein freigegebener Cache darf nur für genau denselben Mirror als sichtbar gekennzeichneter Fallback dienen. Fremde Releases, AP22-Kandidatendaten und andere Mirror-Caches sind ausgeschlossen.
- Sichtbare Kennzeichnung als Gerätetest. Nur synthetische Fälle und kein Kalenderexport. Dies ist keine operative Freigabe des neuen Codes.

Diese technischen Schranken vermeiden eine versehentliche Verwendung. Sie sind keine neue M365-Berechtigungsgrenze. Berechtigungen und Richtlinien werden nicht verändert.

## Tatsächlich durchgeführte Prüfungen

| Prüfung | Ergebnis und Beleg |
| --- | --- |
| Unveränderter SPFx-Ausgangsstand vor den E-Anpassungen | 186 Tests bestanden, [Protokoll](baseline-source-tests.log) |
| Isolierter Produktionsbuild und Paketbau | Bestanden, [Build](production-build.log) und [Paketbau](package-solution.log) |
| Ausgelieferte CSS-Kennungen | Bestanden, [Audit](namespaced-css-audit.log) |
| Datumseingabe am tatsächlichen ES5-/AMD-Paket | 8 Tests bestanden |
| E-Isolation, Paketmetadaten, Datenbindung, Cachegrenzen und Französisch | 15 Tests bestanden |
| Gemeinsamer abschliessender Pakettest | 23 von 23 bestanden, [Protokoll](packaged-ap21-and-isolation-tests.log) |
| Vorleistungsnachweis AP21 | Alle 153 gebundenen Artefakte vor und nach dem Bau byteidentisch |

Der Build meldet dieselben 15 bereits bekannten Lintwarnungen. Kein Buildfehler und keine neue Warnung durch die E-Isolation. Der Rechenkern bleibt unverändert. Die gemeinsame UI wird nur bei ihren CSS-/DOM-Kennungen und vier klar begrenzten Testhinweisen transformiert. Insbesondere bleiben Datumsparser, Entwurfslogik, Tastaturereignisse und Berechnung unverändert.

Ein Vorlauf hatte einen Fehler in einem Testvergleich von URL-kodierter mit normalisierter Mirroradresse. Der Test wurde auf die vorhandene Normalisierungsfunktion umgestellt. Der endgültige Kandidat wurde danach frisch und mit vorab gebundenen Builder-/Testdateien erzeugt. Die Vorlaufprotokolle bleiben im privaten Arbeitsordner erhalten.

## Reproduzierbarkeit und Grenzen

Der Bau erfolgt mit dem lokalen Node.js 22.23.2 und der vorhandenen SPFx-Toolchain. Es wurden keine Abhängigkeiten nachinstalliert. [Builder und Testvorlagen](build-inputs/) sind mit Prüfsummen im Baunachweis gebunden. Die exakten transformierten Quellen, Konfigurationen und Testadapter liegen zusätzlich im dort referenzierten privaten Quellarchiv. Es enthält interne Zieladressen und ist nicht zur Veröffentlichung freigegeben.

Die vorhandenen Zielbelege vom 1. Oktober dienen nur der Vorbereitung. **Kein aktueller Tenant-, Rechte- oder Mirror-Livecheck wurde behauptet oder durchgeführt.** Vor einer Installation müssen die Ziele und alle elf Dateien je Mirror frisch bestätigt werden. Der direkte Teams-Host benötigt zusätzlich eine eigene organisationsinterne Appregistrierung. Die SPFx-Paketvorbereitung allein erledigt diesen administrativen Schritt nicht.

Reale iOS-Geräte, Teams-App, macOS-Browser, VoiceOver und Zoom wurden mit diesem Kandidaten noch nicht geprüft. Die schmale lokale Vorschau ersetzt diese Nachweise nicht. Q, AP5, P, GitHub, bestehende Rechner und Mirrors bleiben unverändert. Auch dieser fertig gebaute Kandidat verlangt vor dem Upload die konkrete Installationsfreigabe.

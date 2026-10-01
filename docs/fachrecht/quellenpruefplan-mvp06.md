# MVP 0.6 · Quelleninventar und Prüfplan

Stand: 1. Oktober 2026. **Lokale Vorbereitung, keine fachliche Quellenreleasefreigabe.** Grundlage sind die Abnahmen von AP20C1/C2/C3 und der [Releaseplan MVP 0.6](../betrieb/deployment-mvp-06.md).

## 1. Abgegrenzte Menge

| Menge | Anzahl | Behandlung |
| --- | --- | --- |
| Manifestquellen aus MVP 0.5 | 53 | Frische begrenzte Wiederprüfung oder konkret zugeordneter Nachweis aus der gleichtägigen AP20-Prüfung |
| Neue AP20-Manifestquellen | 24 | Sechs EOG-/EOV-Referenzen aktualisieren, übrige 18 aus gleichtägigen C2-/C3-Belegen innerhalb ihrer tatsächlichen Reichweite zuordnen |
| Gesamtes neues Manifest | **77** | Vollständige, eindeutige Quellenzuordnung, einschliesslich Ausschluss- und Zeitbelegen |
| Feiertagskatalog | 84 | Katalogbytes unverändert. Zwei Referenzen auch im Manifest, 82 nur im Katalog |
| Nur im Katalog enthaltene Quellen | **82** | Wiederverwendung der am 22.09.2026 abgenommenen Prüfung, über den MVP-0.5-Abnahmebeleg nachvollziehbar. Kein erneuter Abruf aller 82 Quellen behauptet |
| Unterschiedliche Quellen-IDs insgesamt | **159** | 77 + 84 − 2, keine Doppelzählung |

Quellen-IDs sind keine Anzahl physischer Abrufe. Eine Originalfassung kann mehrere IDs belegen. Umgekehrt kann eine ID mehrere Fassungen, Originaldateien oder Änderungsakte erfordern. Die 24 neuen Registereinträge würden das bestehende Register später von 57 auf 81 Einträge erweitern. Darin enthalten bleiben vier zusätzliche Monitoring-/Rechtsprechungsreferenzen ausserhalb des Manifestumfangs.

## 2. Methode und tatsächliche Aktualität

1. **C1 nachprüfen:** Der EOG-/EOV-Nachweis stammt vom 30. September, nicht vom 1. Oktober. Amtliche Originale, die tragenden Artikel und der Fassungs-/Änderungsindex für 2026–2027 werden erneut geprüft. Die C1-Abnahme und ihr damaliger Nachweis bleiben unverändert.
2. **C2/C3 gezielt übernehmen:** Gleicher Tag allein genügt nicht. Die Nachweise werden gehasht und nur den tatsächlich geprüften Fassungen, Artikeln und Berner Quellen zugeordnet. Eine auf ELG Art. 21 Abs. 2 begrenzte C3-Prüfung ersetzt keine neue vollständige ELG-Prüfung. Vollständige Byteidentität kann zusammen mit dem gebundenen bisherigen Artikelbefund eine bewusst ausgewiesene Übernahme tragen.
3. **Restbestand aktualisieren:** Übrige frühere Manifestquellen werden amtlich erneut abgerufen und mit den gebundenen bisherigen Originalen beziehungsweise relevanten Textstellen verglichen. Dazu gehören die verwendeten Zukunftsfassungen, AVIV-Option B und der Monitoringpunkt OF-001. Bekannte Rechtsprechungsfundstellen werden begrenzt geprüft, keine umfassende Suche nach allen neuen Entscheiden behauptet.
4. **Katalogwiederverwendung offenlegen:** Die 82 nicht operativen Feiertagsreferenzen behalten den tatsächlichen Prüfstand vom 22. September. Das ist ein ausdrücklich vorzulegender Wiederverwendungsvorschlag, keine bereits durch die Integrationsabnahme erklärte neue Quellenabnahme.

Die maschinellen Nachweise müssen Quelle, Abruf-/Vergleichsdatum, Ausgangsbeleg, Hash, Methode, Ergebnis und begrenzte Aussagekraft benennen. Ein erfolgreicher HTTP-Abruf allein bestätigt keine fachliche Normauslegung. Ein unveränderter relevanter Artikel bedeutet nicht, dass der ganze Erlass unverändert ist. Fehler, Nichtverfügbarkeit und neue Änderungen werden nicht als `unchanged` versteckt.

## 3. Bestehende Vorbehalte

- **AI:** Der dokumentierte Widerspruch zwischen amtlicher Feiertagsliste und gesetzlicher Regel bleibt als `unclear` erhalten. Die beschlossene Behandlung nach Ruhetagsgesetz wird nicht neu entschieden und keine amtliche Berichtigung behauptet.
- **NE:** Zusätzliche jährlich oder örtlich angeordnete Festlegungen bleiben ausserhalb der modellierten ewigen Regeln vorbehalten.
- **AVIV:** Die ausdrücklich akzeptierte Option B bleibt bis zu einem tragfähigen neuen Fassungsnachweis sichtbar. Die tatsächliche Verfügbarkeit einer konsolidierten Februarfassung 2027 wird erneut geprüft, nicht unterstellt.
- **OF-001:** Die angekündigte Zustellungsfiktion bleibt ein gesonderter Monitoringpunkt. Der neue Nachweis ordnet ihn den tatsächlich verwendeten BGG-/VwVG-Quellen und den Monitoringbelegen zu. Kein unbelegtes Inkrafttreten wird aktiviert. Alte Ereignisse werden nicht rückwirkend korrigiert.
- **Nutzung und Ausschluss:** Ein Quellenverweis in `excludedPaths` dient dem Nachweis einer Grenze, nicht der positiven operativen Freigabe dieses Fallwegs. Insbesondere künftige Fassungen oder EGKUMV-Belege dürfen keine nicht beschlossene neue Anbindung auslösen.
- **Modellfenster:** Nationale Regeln und konkret geprüfte Berner Anbindungen bleiben getrennt. Das Zeitfenster 2026–2027 sowie die bisherige Feiertagsqualifikation werden nicht erweitert.

## 4. Ablage und Übernahme

Neue Belege entstehen getrennt unter `outputs/release-mvp06-2026-10-01/`. Der zusammengeführte Vollständigkeitsnachweis bindet Kandidat, Teilevidenz, verwendete frühere menschliche Quellenabnahmen und den unveränderten Katalog. Rohabrufe und technische Transportinformationen werden vor einer möglichen öffentlichen Publikation gesondert gesichtet.

Bis zur menschlichen Quellenabnahme bleiben das aktive Quellenregister, der Index, die bisherigen Ereignisse und sämtliche Produktdaten unverändert. Die spätere Übernahme erhält einen eigenen Abnahmebeleg und ein neues AP13-Ereignis. Die neue Prüfung wird nicht als erneute Jahresvollprüfung ausgegeben. Der bestehende nächste ordentliche Prüftermin bleibt unverändert, bei Verzögerung oder Änderungshinweisen ist die Aktualität vor Freigabe erneut zu beurteilen.

## 5. Vorlage an David Steimer

Nach Abschluss werden ein kurzer Gesamtbefund, die vollständige Quellenzuordnung, offen gebliebene Punkte und technische Negativtests vorgelegt. Erst dann folgt die gesonderte Abnahme der Quellenprüfung einschliesslich der ausdrücklich beschriebenen Wiederverwendung. Kontrollierte lokale Datenübernahme und definitive Builds können im selben Entscheid freigegeben werden. E/Q, GitHub, P und Berechtigungen sind davon nicht umfasst.

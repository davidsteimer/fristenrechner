# MVP 0.5 · Zusammengeführte Quellenprüfung zur Abnahme

Stand: 28. September 2026. **Technisch vorbereitet, fachliche Gesamtquellenabnahme ausstehend.** Dieser Bericht erteilt keine eigene Freigabe.

## Ergebnis

Für die abgenommene erste AP19-Tranche ist der releasebezogene Quellenabgleich abgeschlossen. Aus dem abgegrenzten Lauf ergibt sich kein zusätzlicher Änderungsbedarf an den modellierten Fristberechnungsregeln. Neue und migrierte Sozialpfade bleiben auf die konkret geprüften Berner Anbindungen und den belegten Zeitraum 2026–2027 beschränkt. Die abgenommenen fachlichen Grenzen werden nicht erweitert.

| Quellenmenge | Behandlung und tatsächlicher Prüfstand |
| --- | --- |
| 27 AP19-bezogene Manifest-IDs | Zehn C1-Originalquellen am 28.09.2026 neu abgerufen und artikelbezogen verglichen. 17 IDs ausdrücklich aus den gleichtägigen C2-/C3-Nachweisen übernommen. Neuer vollständiger Zukunftsindex für neun Bundeserlasse |
| 26 weitere Manifest-IDs | 16 amtliche Originale für 17 IDs erneut abgerufen und vollständig byteidentisch zum MVP-0.4-Prüfstand. Neun bekannte Rechtsprechungsbelege frisch abgerufen und an den relevanten Erwägungen gelesen. Gesonderter Zukunftsindex für sieben weitere Bundeserlasse |
| 82 zusätzliche, nicht operative Katalog-IDs | Bewusste Wiederverwendung der am 22.09.2026 ausdrücklich abgenommenen Prüfung. Keine erneute Vollprüfung und keine Datumsaktualisierung. Der vollständige Feiertagskatalog bleibt byteidentisch |
| **135 unterschiedliche Quellen-IDs** | 53 Manifestquellen plus 84 Katalogquellen abzüglich zweier Überschneidungen. Keine doppelt gezählten Prüfungen |

Die inhaltliche Einstufung bleibt eng auf die verwendeten Normen und Fallwege bezogen. «Unverändert» bedeutet nicht, dass die ganzen Erlasse keine Änderungen enthalten. Bei den angekündigten VwVG-Änderungen ab Januar 2027 und VPR-Änderungen ab Juli 2027 sind die Änderungen und ihre fehlende Auswirkung auf die hier verwendete Tagesberechnung gesondert begründet.

## Weitergeltende Vorbehalte

- **AI:** Der bekannte Widerspruch zwischen Feiertagsliste und gesetzlicher Regel bleibt als `unclear` dokumentiert. Die bereits beschlossene Behandlung nach Ruhetagsgesetz bleibt bestehen. Eine amtliche Berichtigung wird nicht behauptet.
- **AVIV ab Februar 2027:** Die fachlich bestätigte Option B bleibt erkennbar. Belegbasis sind amtliche Konsolidierung, Änderungsakte und Änderungsindex. Eine erneut abgerufene, inzwischen verfügbare Februar-Vollfassung wird nicht behauptet.
- **OF-001, Wochenendzustellung:** Weiterhin offen. Die heutige Prüfung liefert keinen Grund, die angekündigte neue Zustellungsfiktion vorwegzunehmen. Kein nicht belegtes Inkraftsetzungsdatum wird eingetragen.
- **Rechtsprechung:** Bekannte Fundstellen wurden gezielt geprüft. Keine umfassende Suche nach sämtlicher neuer Rechtsprechung. Gerichtstexte aus Spiegeln werden nicht als neu verifizierte amtliche Publikationsadressen ausgegeben.
- **Aktualität:** Bei längerem Aufschub oder einem neuen Änderungshinweis ist die Aktualität vor der tatsächlichen Freigabe nochmals zu beurteilen. Der nächste ordentliche Quellenprüftermin bleibt 15.11.2027. Dies ist keine neue Jahresvollprüfung.

## Nachweise und Vollständigkeit

- [Inventar, Prüfplan und AP19-Teilbefund](quellenpruefplan-mvp05.md)
- [Restquellen, Zukunftsfassungen und OF-001](quellenabgleich-mvp05-rest.md)
- [Maschinenlesbarer AP19-Teilnachweis](../../outputs/release-mvp05-2026-09-28/sources/ap19-source-review.json)
- [Maschinenlesbarer Restquellennachweis](../../outputs/release-mvp05-2026-09-28/sources/remainder/source-review.json)
- [Zusammengeführte Quellenzuordnung mit Hashbindungen](../../outputs/release-mvp05-2026-09-28/source-review-completeness.json)

`npm run check:sources:mvp05` prüft die vollständige und überschneidungsfreie Auflösung aller 53 Manifest-IDs, die 82 zusätzlichen Katalog-IDs, die unveränderten Katalogbytes, die bestehende menschliche MVP-0.4-Quellenabnahme und die gebundenen Teilnachweise. Negative Tests decken fehlende Quellen, doppelte Zuordnung, unerwartete Änderungsbefunde, erfundene neue Freigaben und den Verlust des AI-Konflikts ab. Das Ergebnis bleibt `candidate` und `humanApproval: false`.

## Nächster menschlicher Entscheid

David Steimer wird um Abnahme dieses zusammengeführten Quellenbefunds einschliesslich der ausdrücklich bezeichneten Wiederverwendung vom 22.09.2026 und der unveränderten Vorbehalte gebeten. Die bisherigen Integrationsabnahmen werden nicht erneut eingeholt oder rückdatiert.

Nach dieser Abnahme kann die kontrollierte Datenübernahme vorbereitet und ausgeführt werden, sofern der konkrete Auftrag dazu vorliegt. Dazu gehören insbesondere die 15 zusätzlichen AP13-Registereinträge, ein neues nachvollziehbares Prüfereignis und der neue Index, die Freigabebindungen aller 28 Sozialanbindungen sowie neue kanonische Regel-/Anbindungshashes. Anschliessend folgen der neue vollständige Datenrelease, die definitiven lokalen App-/Paket-/Mirrorartefakte und deren erneute Tests.

Diese Vorlage allein ändert weder Kandidaten noch aktive Governance, Datenpins, E/Q/P oder Berechtigungen. Installation, GitHub-Publikation und öffentliche Bereitstellung benötigen die separaten Freigaben gemäss [Releaseplan](../betrieb/deployment-mvp-05.md). Die Green-Abklärung bleibt davon unabhängig offen.

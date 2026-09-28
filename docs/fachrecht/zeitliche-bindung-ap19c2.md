# AP19C2 · Zeitliche Bindung der AVIG-ALE-Anbindungen

Stand: 28. September 2026. Umsetzung des abgenommenen AP19B-Produktvertrags mit der ausdrücklich bestätigten AVIV-Nachweismethode Option B. Keine Integrations-, Release- oder Betriebsfreigabe.

## Unveränderte Vertragsgrenzen

Die vier AVIG-ALE-Bundesregeln werden je mit einer Kassen- und einer Amtsstellenanbindung für Bern verbunden. Acht Anbindungen sind keine acht Kopien der Bundesregeln. Die Trennung ist im bestehenden Sozialverfahrenskatalog `1.0.0` möglich und hält die unterschiedlichen Tatsachen- und Zeitanker auseinander. Das Manifest bleibt `5.0.0`.

Das geschlossene Intervall **01.01.2026–31.12.2027** in `legalValidity` bezeichnet das konservativ belegte Anwendungsintervall dieser engen Kombination. Es behauptet weder eine erstmalige Inkraftsetzung sämtlicher Normen am 01.01.2026 noch ein Ausserkrafttreten am 31.12.2027. `sourceCoverage`, `caseCoverage` und `calculationCoverage` bleiben getrennte Prüfgrenzen.

## Quellenfenster und Option B

Die [AP19B-Abnahme](abnahme-ap19b.md) bestätigt die Nachweismethode `official-amendment-reconstruction`. Der [erneute AP19C2-Quellenabgleich](quellenabgleich-ap19c2.md) bindet die Konsolidierungen und das amtliche Änderungsrecht mit dem erneuerten Zukunftsindex. Die fehlende Volltextkonsolidierung der AVIV ab Februar 2027 wird nicht als gelesen ausgegeben.

AVIV Artikel 119 und 128 werden im Katalog über die Konsolidierung vom 01.01.2026 referenziert. Das gesamte belegte Intervall ergibt sich aus dem separat gebundenen artikelbezogenen Fassungsvergleich, nicht aus einer Behauptung, die gesamte Januar-2026-Fassung gelte unverändert bis Ende 2027. Die weiteren AVIV-Konsolidierungen und Originaländerungsakte sind zusätzlich als Quellen erfasst. Für AMG Artikel 35 wird der im Quellenbericht bezeichnete historische und aktuelle Fassungsvergleich verwendet.

Die zwölf migrierten und vier ELG-Regeln sowie deren 16 Anbindungen bleiben inhaltlich unverändert. Ihre bisherige Quellenprüfbindung wird nicht auf AP19C2 umdatiert. Nur die enthaltene Release-ID ihrer weiterhin gesperrten Kandidaten-Freigabeeinträge wird auf den neuen Gesamtstand bezogen.

## Unterschiedliche Zuständigkeitszeitpunkte

| Anbindung | Bedeutung des getrennten Zeitankers |
| --- | --- |
| Kasse, Einsprache | `jurisdictionReferenceDate` ist das Datum der ursprünglichen Verfügung nach AVIV Artikel 119 Absatz 2. `avigControlCanton` ist der dafür rechtlich massgebende Kontrollkanton. Nicht Datum der Zustellung, nicht heutiger Kontrollort |
| Kasse, Beschwerde | Derselbe Verfügungszeitpunkt für die besondere Zuständigkeitskette nach AVIV Artikel 128 Absatz 1 und Artikel 119. Nicht Datum des Einspracheentscheids und nicht pauschal Beschwerdeerhebung oder Wohnsitz |
| Kasse, Beschwerdeverbesserung | Derselbe ursprüngliche Verfügungszeitpunkt und eigenständig geklärtes, bestehendes Verfahren beim zuständigen Berner Gericht. Die gerichtliche Verbesserungsanordnung bleibt das fristauslösende Dokument |
| Kasse, angeordnete Verwaltungstagesfrist vor einer Verfügung | `jurisdictionReferenceDate` bezeichnet den ausdrücklich qualifizierten Bezug der laufenden Zuständigkeit. Die Route heisst gesondert `be-avig-ale-current-control-canton`. Ein nicht vorhandenes Verfügungsdatum wird weder verlangt noch erfunden |
| Kantonale Amtsstelle | Zuständige Amtsstelle beziehungsweise rechtmässige Delegation und Einspracheinstanz sind eigenständig geklärt. Die Anbindung verwendet `avigOfficeCanton` und bei Gericht zusätzlich `courtCanton`, nicht die Kassenanknüpfung nach Artikel 119 Absatz 2 |

Für die Kassenanbindungen bindet die AVIV-Zuständigkeitsnorm den getrennten Zeitanker. Die übrigen zeitlichen Normprüfungen bleiben am qualifizierten fristauslösenden Eröffnungsdatum. Ein nach diesem Datum liegender Kassen-Zuständigkeitsbezug ist für die konkret modellierten Fälle nicht zulässig. Widersprüchliche oder fehlende Befunde sperren die Berechnung.

Bei gerichtlicher Beschwerdeverbesserung bezeichnet `decisionOrigin` innerhalb dieser Anbindung die Herkunft des zugrunde liegenden Verwaltungsentscheids. Das Feld beschreibt nicht den Absender der Verbesserungsanordnung. Deren gerichtliche Herkunft ist durch Handlung, Stadium und `triggerKind: court-correction-day-order` eindeutig qualifiziert.

## Keine Aktivierung

Alle Regeln, Anbindungen und Freigabeeinträge bleiben Kandidaten. `approval` ist `null`. Die menschliche AP19B-Abnahme oder ein erfolgreich berechneter isolierter Referenztest ersetzt keine Freigabe des AP19C2-Produktkandidaten. Die neuen Regeln sind national modelliert, der erste Anbindungs- und Kalenderumfang bleibt auf Bern beschränkt.

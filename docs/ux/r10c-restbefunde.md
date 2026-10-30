# R10-C · Begrenzte Textnacharbeit nach MVP 0.10

Stand: 30. Oktober 2026. Lokaler Backlognachtrag aus der tatsächlichen E-/Q-Prüfung. David hat die beiden nachfolgenden Befunde jeweils begrenzt akzeptiert und die Fortsetzung mit dem unveränderten Paket erlaubt. **Keine Korrektur am abgenommenen Paket, keine neue GitHub-Karte und keine menschliche Q-Abnahme durch diesen Eintrag.**

## R10C-E-SP-B09-H01 · BL-Büroschliessungen

In der aufgeklappten Rechenspur erscheint in DE und FR der technische Wert `administrativeOfficeClosure`. Die gesonderte Erklärung der Büroschliessungen ist verständlich. Im geprüften Fall sind Fristablauf 04.01.2027 und Behandlung als Endverschiebung statt Friststillstand korrekt. Derselbe Befund wurde im weiteren Hostlauf bestätigt.

Nacharbeit: Eine verständliche deutsche und französische Bezeichnung verwenden. Keine Änderung der Fristlogik, der gesetzlichen Anknüpfung oder der Schliessdaten. Regression mit Matrixfall B09 auf tatsächlichen Hosts in DE/FR, unverändertem Enddatum, korrekter Endverschiebung und verständlicher Rechenspur. Rein textliche Korrektur separat umsetzen, prüfen und abnehmen.

## R10C-E-SP-B22-H01 · VD-Abbruch an der Abdeckungsgrenze

Pfad `vd-court-final-30`, qualifizierte Eröffnung 01.12.2027 und 30 Tage: Die Rechnung erreicht erforderliche Tage ausserhalb der Abdeckung. Resultat und Export sind korrekt gesperrt. Die Rechenspur behauptet dennoch «Kein Friststillstand im berechneten Zeitraum» beziehungsweise «Aucune suspension pendant la période calculée».

Nacharbeit: Einen noch nicht abschliessend ermittelten Stillstandsverlauf von tatsächlich keinem Stillstand unterscheiden. Keinen definitiven Lauf oder vollständige Herkunft erfinden. Regression mit Matrixfall B22 in DE/FR, weiterhin gesperrtem Resultat und Export sowie unverändertem positiven VD-Nachbarfall. Den GR-Spätabbruch mit bereits vorhandener Herkunft und frühe Abbrüche ohne Ergebnisherkunft getrennt erhalten. Kein Aufweichen von Abdeckungs- oder Exportgrenzen.

## Abgrenzung

Die damalige MVP09-Nacharbeit T06-H01/B11-H01 und ihre R10-U1-Korrekturen sind andere Befunde. Die beiden neuen Akzeptanzen sind keine generelle Freigabe unpräziser Texte und keine dauerhafte Ausnahme. Der [aktuelle Vollzugsnachweis](../betrieb/eq-vollzugsnachweis-mvp10.md) bindet den technischen Abschluss und die weiterhin offene menschliche Q-Abnahme.

# MVP 0.4 · Berner Fristenrechner

Vorbereiteter Releasehinweis vom 22. September 2026. **Noch nicht veröffentlicht oder produktiv bereitgestellt.** Der verbindliche Fortschritt steht im [Release- und Deploymentplan](deployment-mvp-04.md).

## Was sich für die Benutzenden ändert

Die VRPG-Auswahl wird schrittweise präzisiert. Nach der Auswahl des Verfahrensrechts folgen der Bereich und nur die dafür nötigen weiteren Angaben. Zur Verfügung stehen allgemeines VRPG, Sozialversicherungsrecht, politische Rechte und Beschaffungsrecht.

16 fachlich abgenommene Zuordnungen verbinden IVG, AHVG, UVG und das bernische Beschaffungsrecht mit den jeweils einschlägigen Fristenregeln. Das Verfahrensstadium und die fristauslösende Handlung werden dort berücksichtigt, wo sie rechtlich entscheidend sind. Die App wendet nicht pauschal auf jedes sozialversicherungsrechtliche Verfahren das gleiche Schema an.

Felder mit nur einem modellierten Wert werden fest angezeigt. Dropdowns bleiben echten Auswahlmöglichkeiten vorbehalten. Die Beschriftung «Sitz der zuständigen Stelle» bleibt über die Verfahrensbereiche hinweg konstant. Das zweispaltige Raster bleibt auf Desktop und Tablet erhalten und bricht auf schmalen Bildschirmen um. Die Oberfläche bleibt deutsch und französisch.

Der bekannte Kalenderexport, die lokalen Standardwerte und die bestehenden Profile StPO, ZPO, BGG, VwVG und VRPG-BE bleiben erhalten.

## Neue Schweizer Feiertagsgrundlage

Der Release enthält den abgenommenen Schweizer Feiertagskatalog mit 479 Regeln und Bezeichnungsfeldern in Deutsch, Französisch, Italienisch und Rumantsch Grischun. Damit ist die technische Grundlage für weitere Kantone vorbereitet.

**Der Rechner bleibt operativ auf die bisher unterstützten Bundes- und Berner Konstellationen begrenzt.** Die Aufnahme einer kantonalen Feiertagsregel ist keine Freigabe des entsprechenden kantonalen Verfahrensrechts. Italienische und rätoromanische Datenfelder sind keine zusätzliche Oberflächensprache. Provisorische Übersetzungen behalten ihren dokumentierten Status.

## Bewusst erhaltene Grenzen

- Vier noch nicht modellierte Sammelpfade bleiben für Berechnungen gesperrt.
- Die qualifizierten AP17-Fälle sind für 2026–2027 geprüft. Eine offene Kalenderlaufzeit erweitert diese Fachabdeckung nicht.
- Unterstützte ATSG-Konstellationen verlangen weiterhin eine geklärte Berner Feiertagsanknüpfung.
- Eigenständige kommunale Feiertagsregelungen bleiben ausgeschlossen. Örtliche Unterschiede werden nur aus Bundes- oder kantonalem Recht hergeleitet.
- Die abgenommenen Sonderabgrenzungen für Graubünden, Solothurn und Neuenburg bleiben erhalten.
- Keine eigene Kalender-App, keine Kartendarstellung und keine neuen automatischen Fachzuordnungen.

## Hinweise für Installation und Betrieb

Die Produktversion ist `0.4.0`, das SPFx-Paket `0.4.0.0`. Der Datenrelease verwendet Manifest-/Consumerformat `4.0.0`, Spezialregimekatalog `3.0.0`, Feiertagskatalog `1.0.0` und die unveränderte Kalenderkomponente `2.0.0`.

Der bisherige MVP-0.3-Consumer kann das neue Datenformat nicht laden. Anwendung und Datenpfad müssen deshalb koordiniert aktualisiert werden. Der vollständige SharePoint-Mirror enthält das Manifest und alle neun Nutzartefakte. Die bisherigen Mirrorordner bleiben für den Rückfall erhalten. Bereits konfigurierte Instanzen müssen ausdrücklich auf den neuen Datenpfad umgestellt und danach geprüft werden.

Es werden keine zusätzlichen Microsoft-Graph- oder sonstigen API-Berechtigungen angefordert. Die öffentliche Webausprägung bleibt statisch auf der bestehenden steimer.ch-Infrastruktur. Sie bettet den geprüften Datenstand ein und benötigt keinen Laufzeitabruf von GitHub oder SharePoint.

Lokale technische Prüfung, neue Quellenprüfung, öffentliche Veröffentlichung und Freigabe der Zielumgebungen werden getrennt dokumentiert. Historisch bestandene Abnahmetests ersetzen keine erneute Prüfung von MVP 0.4.

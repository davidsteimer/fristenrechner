# Hosting: Header-/Cachebefund und Ende der Wiederholungsprüfung

Stand: 19. Oktober 2026. **Dokumentierter Betreiberentscheid, keine P-Bereitstellungsfreigabe.**

## Befund und Herkunft

David Steimer hat am 19. Oktober 2026 eine schriftliche Antwort des Green-Supports im Projektchat übermittelt. Das Versanddatum der E-Mail und eine Ticketnummer liegen in diesem Nachweis nicht vor. Die nachstehenden Ursachenangaben geben die Supportantwort wieder, sie sind keine unabhängige Prüfung der Hostingkonfiguration durch das Projekt.

Nach Rücksprache mit seinem Hostingpartner teilt der Support mit:

- Die zuverlässige Auslieferung der konfigurierten Response-Header wird im bestehenden Shared Hosting nicht unterstützt, auch nicht bei entsprechenden Anweisungen in `.htaccess`.
- Eine vollständige Umsetzung würde nach Auskunft des Supports eine Anpassung des PHP-Handlers erfordern. Diese wird wegen ihrer Auswirkungen auf weitere Hostingumgebungen nicht vorgenommen. Daraus folgt keine Verwendung von PHP durch den statischen Fristenrechner.
- Eine andere `.htaccess`-Konfiguration behebt diese Einschränkung nach Auskunft des Supports nicht. Auch eine Korrektur mehrfacher `Cache-Control`-Header kann er nicht zusichern.
- Der Support hat keine Änderungen an der Hostingumgebung vorgenommen.

Der historische Projektbefund bleibt der Unterschied zwischen HEAD- und GET-Antworten bei Sicherheitsheadern sowie die mehrfach ausgegebenen Cachevorgaben. Der [Produktionsnachweis MVP 0.8](produktionsbereitstellung-mvp08-2026-10-16.md) bleibt unverändert. Seine damaligen negativen Prüfresultate und begrenzten Risikoakzeptanzen werden weder gelöscht noch nachträglich als bestanden bezeichnet.

## Entscheid vom 19. Oktober 2026

David Steimer hält die Einschränkung in der bestehenden Umgebung für nicht behebbar und ordnet an, diesen Befund nicht mehr zu prüfen. Für die weitere Bereitstellung auf dieser unveränderten Infrastruktur gilt deshalb:

1. Keine wiederkehrenden HEAD-/GET-Vergleichsläufe zur Auslieferung der Sicherheitsheader und keine erneuten Prüfungen der bekannten mehrfachen Cachevorgaben. Dies gilt vor Upload, auf Stage, auf P und bei einem Rückfall.
2. Die bisherigen Prüfnummern **D04** und **D05** bleiben zur Nachvollziehbarkeit erhalten. Ihr neuer Status lautet **«Nicht erneut ausgeführt gemäss Betreiberentscheid vom 19.10.2026 – bekannte Plattformgrenze»**. Das ist weder ein neuer Pass noch ein neuer Fehlernachweis.
3. Der Betrieb bleibt auf der bestehenden steimer.ch-Infrastruktur. Kein Hostingwechsel, Proxy, PHP-Workaround, neuer Supportauftrag oder Eingriff in Handler-, Server- oder `.htaccess`-Konfiguration ist beauftragt.
4. Unverändert erforderlich bleiben funktionierende HTTPS-Verbindungen, richtige Weiterleitungen, die Prüfung der tatsächlich ausgelieferten Releasebytes, Dateibestände und Datenidentität sowie Funktions-, Datenschutz- und Rückfallprüfungen. Normale GET-Abrufe für diese Zwecke sind keine Wiederholung des ausgeschlossenen Header-/Cachetests.

Es gibt damit **keinen aktuellen Nachweis, dass der Header-/Cachebefund unverändert oder behoben ist**. Auf diesen erneuten Nachweis wird bewusst verzichtet. Die bislang dokumentierten Schutzlücken bleiben als Betriebsgrenze behandelt. Fehlende browserseitige Schutzheader und unzuverlässig durchgesetzte Cachevorgaben werden nicht durch korrekte Rechenergebnisse ausgeglichen.

Eine spätere wesentliche Änderung der Infrastruktur, der Sicherheitsanforderungen oder ein neuer konkreter Vorfall kann einen gesonderten Prüfauftrag erfordern. Dies begründet keine automatische Wiederholungsprüfung und keine Überwachung.

## Abgrenzung zur nächsten Freigabe

Der Wegfall der Wiederholungsprüfung ist bereits entschieden. Die konkrete Bereitstellung und Risikoübernahme für MVP 0.9 sind separat in der [P-Freigabevorlage](p-bereitstellungsvorlage-mvp09.md) zur Entscheidung gestellt. Andere Fehler werden durch den vorliegenden Entscheid nicht pauschal akzeptiert.

Dieses Dokument ersetzt die noch auf wiederholte Header-/Cachevergleiche gerichtete P-Planung in [deployment-mvp-09.md](deployment-mvp-09.md) für den kommenden Vollzug. Bereits veröffentlichte Pläne, Freigaben und Produktionsnachweise bleiben als datierte historische Stände erhalten. Der neue Nachtrag wurde lokal erstellt, noch nicht auf GitHub veröffentlicht.

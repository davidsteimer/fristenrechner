# Freigabe des Wiederherstellungswegs R07C-H01

Am 8. Oktober 2026 hat David Steimer R07C-H01 ausdrücklich geschlossen und den bedingten betrieblichen Wiederherstellungsvollzug gebilligt:

> Ich schliesse R07C-H01 und billige den dokumentierten Wiederherstellungsweg mit Paket `0.7.0.1`, SHA-256 `9e028245f3df72a6c13056e45624971389c573fc89da0e9d76cf9f2188fcc7d9`. Falls ein vollständiger Rückfall erforderlich wird, darf dieser nach dem beschriebenen Ablauf mit den gesicherten Format-6-Mirrors, unverändertem AP5-Pin und anschliessender Hostprüfung ausgeführt werden. Ein Browserdatenreset ist nicht umfasst. Die gemeinsame Codewirkung und die Notwendigkeit eines erneut höheren Paketstands für eine spätere reguläre MVP07-Wiederaufnahme sind mir bekannt.

Damit sind der [lokale Paketnachweis](wiederherstellungskandidat-mvp07.md) und der begrenzte bedingte Vollzug zusammengeführt. Die [E-/Q-Installationsfreigabe](eq-freigabe-mvp07.md) gilt weiterhin ausschliesslich für das konkret gebundene reguläre Paket `0.7.0.0`, die vier bezeichneten bestehenden Instanzen und die beschriebenen Prüfungen. Das Recovery-Paket ist nur für einen erforderlichen vollständigen Rückfall freigegeben, nicht für eine vorsorgliche Bereitstellung.

Der frühere Prüfbericht behält seinen damaligen Status. Diese anschliessende Entscheidung ergänzt ihn, ohne seine technischen Nachweise umzuschreiben. Ein tatsächlicher Hosttest des Wiederherstellungspakets wird aus dieser Freigabe nicht abgeleitet.

Vor dem regulären Katalogwechsel bleiben die technische Ausgangssicherung, eindeutige aktuelle Instanzbindung, der manuelle Mirrorupload und der vollständige Rohbytevergleich erforderlich. Bei einem abweichenden Bestand oder ungeklärten Fehler wird angehalten. Browserdatenreset, zusätzliche Sites, Berechtigungsänderungen, GitHub und P bleiben ausgeschlossen. David entscheidet in Personalunion. Codex übernimmt keine formelle Freigabe- oder Haftungsverantwortung.

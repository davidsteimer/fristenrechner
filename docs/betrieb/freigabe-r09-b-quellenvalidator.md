# R09-B Freigabe des begrenzten Validatornachtrags

Stand: 18. Oktober 2026. David Steimer hat den [Nachtrag zur amtlichen AR-Domain](nachtrag-r09-b-quellenvalidator.md), SHA-256 `1c60d628d7ab3ce1340bbd7d633f23c3baae7d04e616a7ae53a699094b0703d0`, ausdrücklich freigegeben.

Die gestellte Frage lautete:

> Darf ich den bestehenden Quellenvalidator ausschliesslich um die exakte amtliche Domain «ar.ch» ergänzen, dazu gezielte Positiv-/Negativtests und einen separaten Änderungsnachweis erstellen und anschliessend R09-B fortsetzen? Die AR-Quelle ist bereits fachlich abgenommen. Rechtsdaten, Datencommit und historische Nachweise bleiben unverändert. Zusätzliche Commits, Installation, Uploads und GitHub-Push bleiben ausgeschlossen.

David Steimer antwortete:

> Ja, diesen begrenzten Nachtrag freigeben

Die Freigabe betrifft ausschliesslich die Ergänzung von `ar.ch` samt Herkunftskommentar in `OFFICIAL_HOSTS` der bestehenden Datei `tests/governance/validate_source_reviews.py`. Deren Ausgangs-SHA-256 ist `9bab48baa0c91cf0d6732775dec1f2a49ce4a3ee992d565b12977e43a93b729c`. Neue gezielte Positiv-/Negativtests und ein separater Vorher-/Nachhernachweis sind eingeschlossen. Keine Wildcards, keine zusätzlichen Subdomains und keine Änderung der URL-Auswertung.

Anschliessend darf der bereits [freigegebene lokale R09-B-Ablauf](freigabe-r09-b.md) fortgesetzt werden. Der vorhandene Datencommit `0ccc4b9178503ede051964149a4b17efab8d0cf9`, die Rechtsdaten, die Quellenabnahme und die historischen Nachweise bleiben unverändert. Die bisherige Fehlprüfung bleibt dokumentiert. Diese Freigabe ersetzt keine spätere Installations-, Publikations-, Rückfall- oder Betriebsfreigabe.

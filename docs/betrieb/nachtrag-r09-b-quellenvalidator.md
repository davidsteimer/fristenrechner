# R09-B Nachtrag: amtliche AR-Domain im Quellenvalidator

Stand: 18. Oktober 2026. **Zur gesonderten Freigabe vorgelegt, noch nicht umgesetzt.** Die [ursprüngliche R09-B-Vorlage](uebernahme-und-buildvorlage-mvp09.md) und ihre [Ausführungsfreigabe](freigabe-r09-b.md) bleiben unverändert. Dieser Nachtrag erweitert ausschliesslich den technischen Prüfvertrag, nicht die Quellenabnahme oder den fachlichen Releaseumfang.

## 1. Befund

Die vollständige Quellenvalidierung hält bei `SRC-AP23E1-AR-MATERIAL-20180703` an. Dessen bereits geprüfter amtlicher Erläuterungsbericht vom 3. Juli 2018 liegt auf `https://ar.ch/fileadmin/user_upload/Kantonskanzlei/Rechtsdienst/Volksrechte/Vernehmlassungen/2018_VRPG/Erlaeuternder_Bericht.pdf`. Diese Adresse ist in der [AP23E1-Quellenprüfung](../fachrecht/quellenpruefung-ap23e1.md) ausgewiesen und gehört zur abgenommenen R09-A2-Quellenbasis.

Der vorhandene Validator `tests/governance/validate_source_reviews.py` prüft amtliche Quellen gegen eine exakte Liste zulässiger Hostnamen. Diese enthält `ar.clex.ch`, aber weder `ar.ch` noch `www.ar.ch`. Die neue Quelle wird deshalb zurückgewiesen. Die Fehlermeldung lautet:

> SRC-AP23E1-AR-MATERIAL-20180703: officialUrl verweist nicht auf eine zugelassene amtliche Domain

Der Befund ist in zwei getrennten Prüfumgebungen reproduziert. Die operative Quellenprüfung wurde nicht umgangen. Die ursprüngliche R09-B-Vorlage verlangt, weitere Änderungen an bestehenden Prüfverträgen vor einer Scopeerweiterung vorzulegen.

## 2. Exakt begrenzte Änderung

| Gegenstand | Vorgeschlagene Änderung und Grenze |
| --- | --- |
| Bestehende Datei | `tests/governance/validate_source_reviews.py`, Ausgangs-SHA-256 `9bab48baa0c91cf0d6732775dec1f2a49ce4a3ee992d565b12977e43a93b729c` |
| Erlaubte Anpassung | Ausschliesslich den exakten Hostnamen `ar.ch` in `OFFICIAL_HOSTS` ergänzen, mit kurzem Herkunftskommentar zu R09-A2 |
| Nicht umfasst | Keine Wildcards, keine Freigabe beliebiger Subdomains, keine automatische Zulassung von `www.ar.ch`, keine Änderung der URL-Auswertung oder anderer Prüfregeln |
| Neue Prüfungen | Den aktuellen AR-Quelleneintrag positiv prüfen. Ähnlich aussehende Fremddomains, nicht freigegebene Subdomains und private Spiegel weiterhin negativ prüfen. Die bestehenden Negativtests bleiben erhalten |
| Bindungsnachweis | Die tatsächlichen Vorher-/Nachherbytes und die gesonderte Freigabe in einem neuen R09-Nachweis sichern. Die neuen R09-Prüfwerkzeuge dürfen genau dieses zusätzliche Delta prüfen, historische Freigabe- und Prüfnachweise bleiben bytegleich |
| Erneuter Lauf | Quellenvalidierung, Python-Quellentests und isolierte Standardprüfungen erneut ausführen. Danach den bereits freigegebenen R09-B-Ablauf fortsetzen |

Quellenregister, Quellen-URLs, Prüfereignisse, Freigabestatus, Fachregeln, Schemas und der bereits erstellte Datencommit werden durch diesen Nachtrag nicht geändert. Es entsteht kein zusätzlicher Commit. Der bisherige Fehlversuch bleibt als solcher dokumentiert.

## 3. Auswirkungen auf den Stand

Der lokale Datencommit `0ccc4b9178503ede051964149a4b17efab8d0cf9` enthält ausschliesslich die 42 freigegebenen Laufzeitdateien. Die unabhängige Datenprüfung ist bestanden. Die reguläre SPFx-Paketierung wurde noch nicht gestartet. Die Web-Teiltests haben eigene isolierte Testbuilds verwendet. R09-B ist insgesamt nicht abgeschlossen, siehe [lokaler Zwischenstand](zwischenstand-r09-b.md).

Dieser Nachtrag erteilt keine Installations-, Upload-, Publikations-, Rückfall- oder Betriebsfreigabe. Die übrigen Grenzen aus R09-B gelten unverändert.

## 4. Freigabevorschlag

> Ich gebe den begrenzten R09-B-Nachtrag zum Quellenvalidator frei. In `tests/governance/validate_source_reviews.py` darf ausschliesslich die exakte amtliche Domain `ar.ch` samt Herkunftskommentar ergänzt werden. Die beschriebenen Positiv- und Negativtests sowie der separate Vorher-/Nachhernachweis sind umfasst. Anschliessend darf R09-B gemäss der ursprünglichen Freigabe fortgesetzt werden. Rechtsdaten, Quellenabnahme, bestehender Datencommit und historische Nachweise bleiben unverändert. Zusätzliche Commits, Installation, Uploads und GitHub-Push bleiben ausgeschlossen.

# Lokaler Auftrag für den Wiederherstellungskandidaten 0.7.0.3

Am 9. Oktober 2026 hat David Steimer auf folgenden Vorschlag geantwortet:

> Soll ich als nächsten Schritt das Wiederherstellungspaket `0.7.0.3` lokal vorbereiten, prüfen und die gemeinsame Installationsfreigabe formulieren?

Sein Auftrag lautet:

> Ja, bitte tue das.

## Freigegebene lokale Arbeit

Der bestehende [Darstellungskandidat 0.7.0.2](darstellungskorrektur-mvp07-0702.md) benötigt einen höheren geprüften Wiederherstellungsstand. Dafür wird die bereits geprüfte Recovery-Lösung `0.7.0.1` aus ihrem versiegelten Baueingang als eigenständiger Kandidat `0.7.0.3` neu gebaut. Solution und Feature erhalten die höhere Version. Die technische Versionskennzeichnung des Wiederherstellungsmodus wird entsprechend nachgeführt. Fachlogik, Oberfläche, Cachebehandlung, Schutz der gemeinsamen Standards und Format-6-Datenbindung bleiben unverändert.

Umfasst sind der isolierte lokale Bau, die Prüfung der tatsächlichen Paketdatei gegen den konkreten regulären Vorläufer `0.7.0.2`, die unveränderliche Archivierung und eine gemeinsame Freigabevorlage für Korrekturinstallation, begrenzten Nachtest und bedingten Rückfall. Die vorhandenen Produktquellen, Release-, Daten- und Recovery-Archive bleiben erhalten. Der Quellcode des regulären Darstellungskandidaten wird nicht in den Wiederherstellungsconsumer übernommen.

## Nicht freigegeben

Dieser Auftrag erlaubt noch keinen Austausch im Tenant-App-Katalog, keine App-Aktualisierung, keinen tatsächlichen Rückfall und keine Änderung von E-/Q-Instanzen, realen Browserdaten, Mirrors, Seiten oder Registerkarten. GitHub, steimer.ch-P, AP21-Testapps, E05, Berechtigungen, Richtlinien und zusätzliche Gäste bleiben unverändert.

Der neue betriebliche Rückfallentscheid wird als **R07C-H02 offen** geführt, bis David die konkrete gemeinsame Vorlage mit beiden Paketprüfsummen bestätigt. Der frühere H01-Entscheid und sein Paket `0.7.0.1` werden nicht umgeschrieben. Eine später nötige Rückkehr vom Recovery `0.7.0.3` zur regulären MVP07-Funktionalität benötigt wiederum einen höheren, separat gebauten und geprüften Paketstand. Ein lokaler Kompatibilitätstest mit vorhandenen `0.7.0.2`-Bytes erteilt keine betriebliche Downgradefreigabe.

David trifft die Entscheide in Personalunion. Codex ist dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

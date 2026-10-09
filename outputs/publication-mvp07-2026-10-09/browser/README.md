# Lokale Sichtprüfung des korrigierten MVP07-Webarchivs

9. Oktober 2026. Geprüft wurde ausschliesslich der unveränderte `web/`-Baum aus `outputs/release-mvp07-web-corrected-0702-2026-10-09`, ausgeliefert durch einen einfachen lokalen HTTP-Server. Kein erneuter Build, kein Zugriff auf E/Q oder das Livehosting. Das ZIP mit SHA-256 `9f986c7d8f8d6366914f9605f46b2fd87987fcbdaf17875ce9d2c4d044b07228` enthält denselben Baum.

| Prüfung | Beobachtung |
| --- | --- |
| Deutsch und Französisch, 720 × 980 | Geöffnete Dropdownlisten und geschlossene Auswahltitel zeigen die langen Zustellungsbezeichnungen mit lesbaren Zeilenumbrüchen. Keine abgeschnittenen Optionszeilen |
| Deutsch und Französisch, 390 × 844 | Die schmale Auswahl öffnet als Seitenpanel. Lange Optionen sind mehrzeilig lesbar |
| Französisch, 1280 × 1100 | Zweispaltiges Eingaberaster, linksbündiges Datum, Aktionen und Ergebnis sichtbar |
| BE/StPO, Partei ohne Vertretung, Feiertagskanton BE, Empfang 18.09.2026, zehn Tage | Fristbeginn 19.09.2026, Fristablauf 28.09.2026, Kalenderaktion angeboten |
| Änderung der Datumseingabe | Altes Resultat und Kalenderaktion verschwinden vor einer neuen Berechnung |
| BE/StPO, Partei ohne Vertretung, Feiertagskanton TI, Empfang 06.12.2026, zwei Tage | Rechnerisches Ende 08.12.2026, Fristablauf 09.12.2026, Kalenderaktion angeboten |
| Datenstand | `2026-10-08-mvp-07-approved.1` sichtbar |

Die fünf JPEG-Dateien zeigen nur synthetische lokale Rechnersichten, keine Tenantinhalte oder Personenreferenzen. Die Dateiendungen wurden an den tatsächlichen JPEG/JFIF-Inhalt der Browseraufnahmen angepasst, ohne die Bildbytes zu ändern. EXIF-, XMP-, IPTC- oder Kommentarmetadaten sind nicht enthalten. `fr-result-ax.txt` hält den sichtbaren französischen Ergebnisbaum fest. Die vorübergehende Ansichtsgrössen-Vorgabe wurde zurückgesetzt.

Dies ist eine begrenzte Sicht- und Interaktionsprüfung im Desktop-In-App-Browser. Sie ersetzt weder die bereits abgegebene reale Geräte-/Gastbestätigung noch die spätere öffentliche Prüfmatrix. Kein neuer iPad-, VoiceOver- oder Outlook-Importnachweis. Der einfache HTTP-Server wertet `.htaccess` nicht aus und belegt deshalb keine wirksamen produktiven Sicherheitsheader.

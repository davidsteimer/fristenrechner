# MVP 0.4: Abnahme der vollständigen Quellenprüfung

Datum: 22. September 2026. Fachverantwortung und Abnahme: David Steimer in Personalunion.

## Entscheid

David Steimer hat nach Vorlage des vollständigen Quellenabgleichs erklärt:

> Ich nehme die Quellenprüfung für MVP 0.4 ab. Die bereits beschlossene Behandlung des dokumentierten AI-Quellenkonflikts bleibt unverändert.

Damit ist die [Quellenprüfung für MVP 0.4](quellenabgleich-mvp04.md) fachlich abgenommen. Die Abnahme umfasst **120 unterschiedliche Quellen-IDs**: 38 Manifestquellen und 84 Katalogquellen mit zwei Überschneidungen. Sie beschränkt sich nicht auf die 38 Quellen des operativen Prüfereignisses.

119 Befunde sind im abgegrenzten Modellumfang unverändert. Die widersprüchliche AI-Jahresliste bleibt als ein Befund `unclear` sichtbar. Die gesetzliche Drei-Ruhetage-Bedingung und die dokumentierte weitere Beobachtung gelten unverändert. Die Abnahme behauptet weder eine amtliche Berichtigung noch eine widerspruchsfreie Quellenlage. Neue Regeländerungen ergeben sich nicht.

## Gebundene Nachweise und Statuswechsel

Der [maschinenlesbare Abnahmenachweis](../../outputs/release-mvp04-2026-09-22/source-approval.json) enthält den genauen Entscheidtext, den gesamten Prüfumfang und die SHA-256-Bindung an die vorgelegten Einzelberichte, den Vollständigkeitsnachweis, die AI-Folgemassnahme sowie den unveränderten Datenrelease und Feiertagskatalog. Er bindet zusätzlich die Vorher- und Nachherstände des Registers und des operativen Ereignisses.

- Das noch unveröffentlichte Ereignis `2026-09-22-mvp-04-prerelease.1` erhält `recordStatus: approved` und David Steimer als fachlich verantwortliche Person. Seine 38 Einzelbefunde bleiben unverändert.
- Das Register erhält `registerStatus: approved`. Seine 42 Quellen mit 34 produktiven, drei unterstützenden und fünf überwachten Einträgen behalten ihre Rollen und Bezüge.
- Der Governance-Index wird aus diesen freigegebenen Ständen neu erzeugt.
- Das ursprüngliche AP13-Ereignis bleibt byteidentisch.
- Die vorgelegten Berichte einschliesslich ihrer damaligen Angaben `candidate`, `formalApproval: false` oder «Abnahme ausstehend» bleiben als historische Entscheidungsgrundlage unverändert. Der aktuelle Freigabestatus ergibt sich aus dieser Abnahmenotiz und dem gesonderten Abnahmenachweis.

Die Prüfung und deren Abnahme sind unterschiedliche Ereignisse. Prüfdaten und Fachbefunde werden durch den heutigen Statuswechsel nicht neu geschrieben. Es ist kein neuer Datenrelease und kein neuer Paketbuild erforderlich.

`npm run check:source-approval:mvp04` prüft die dokumentierte Abnahme rein lesend. Die beiden bisherigen Vorbereitungsbefehle prüfen nach der Freigabe ebenfalls nur noch die gebundenen Nachweise. 20 neue Abnahmetests, 17 bestehende Abdeckungstests, 17 Registerevolutionstests und die acht Negativprüfungen des Governance-Validators sind bestanden. Der tatsächliche Vorher-/Nachhervergleich der Wiederholungsläufe bestätigt, dass kein freigegebener Nachweis und kein Produktartefakt verändert wird.

## Grenzen und nächster Schritt

Das fachliche Quellenfreigabekriterium im [Releaseplan](../betrieb/deployment-mvp-04.md) ist erfüllt. Als Nächstes folgt die abgegrenzte Veröffentlichungsvorbereitung für Code, Daten und Nachweise. Vor dem öffentlichen Push sind der konkrete Dateiumfang und die dafür nötigen Schreibrechte gesondert freizugeben.

Nicht umfasst sind neue Deploy-Keys, GitHub-Push oder Releaseveröffentlichung, SharePoint-/Teams-Installationen, Mirroraktualisierung, Hostingänderungen und betriebliche E-/Q-/P-Freigaben. Zusätzliche Kantonsprofile oder andere fachliche Zuordnungen werden nicht aktiviert.

David Steimer nimmt die Projektrollen in Personalunion wahr. Codex dokumentiert den Entscheid und führt die technischen Schritte aus, ohne eigene formelle Freigabe- oder Haftungsverantwortung. Ein menschliches Vieraugenprinzip wird nicht behauptet.

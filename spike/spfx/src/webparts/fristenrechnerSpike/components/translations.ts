// SPDX-License-Identifier: AGPL-3.0-only

export type Language = 'de' | 'fr';

export interface ITranslations {
  readonly appTitle: string;
  readonly badge: string;
  readonly intro: string;
  readonly language: string;
  readonly deliveryDate: string;
  readonly deadlineDays: string;
  readonly legalProfile: string;
  readonly community: string;
  readonly provider: string;
  readonly load: string;
  readonly loading: string;
  readonly noCalculation: string;
  readonly technicalStatus: string;
  readonly host: string;
  readonly componentId: string;
  readonly releaseId: string;
  readonly dataStatus: string;
  readonly providerLabel: string;
  readonly validatedAt: string;
  readonly coverage: string;
  readonly idle: string;
  readonly ready: string;
  readonly fallback: string;
  readonly local: string;
  readonly failure: string;
  readonly localRestored: string;
  readonly profileOptions: Readonly<Record<string, string>>;
  readonly communityOptions: Readonly<Record<string, string>>;
}

export const translations: Readonly<Record<Language, ITranslations>> = {
  de: {
    appTitle: 'Fristenrechner Schweiz',
    badge: 'TECHNISCHER SPIKE',
    intro: 'Prüft Host, Datenprovider, Validierung und lokalen Fallback.',
    language: 'Sprache',
    deliveryDate: 'Empfangsdatum',
    deadlineDays: 'Frist in Tagen',
    legalProfile: 'Verfahrensrecht',
    community: 'Gemeinwesen',
    provider: 'Datenquelle',
    load: 'Datenrelease prüfen',
    loading: 'Datenrelease wird vollständig geprüft',
    noCalculation: 'Dieser Spike berechnet noch keine Frist. Die Eingaben prüfen ausschliesslich die spätere Host- und UI-Struktur.',
    technicalStatus: 'Technischer Status',
    host: 'Host',
    componentId: 'Component-ID',
    releaseId: 'Release-ID',
    dataStatus: 'Datenstatus',
    providerLabel: 'Provider',
    validatedAt: 'Validiert am',
    coverage: 'Abdeckung',
    idle: 'Noch nicht geladen',
    ready: 'Vollständig validiert und atomar aktiviert',
    fallback: 'Netzabruf abgewiesen. Letzter gültiger Stand bleibt aktiv.',
    local: 'Letzter gültiger Stand aus IndexedDB wiederhergestellt',
    failure: 'Datenrelease konnte nicht aktiviert werden',
    localRestored: 'Gespeicherter Aktivstand wurde beim Laden des WebParts wiederhergestellt.',
    profileOptions: {
      stpo: 'StPO',
      zpo: 'ZPO',
      bgg: 'BGG',
      vwvg: 'VwVG',
      'vrpg-be': 'VRPG Bern'
    },
    communityOptions: {
      ch: 'Bund',
      be: 'Kanton Bern'
    }
  },
  fr: {
    appTitle: 'Calculateur de délais Suisse',
    badge: 'SPIKE TECHNIQUE',
    intro: 'Vérifie l’hôte, les fournisseurs de données, la validation et le repli local.',
    language: 'Langue',
    deliveryDate: 'Date de réception',
    deadlineDays: 'Délai en jours',
    legalProfile: 'Droit de procédure',
    community: 'Collectivité',
    provider: 'Source de données',
    load: 'Vérifier la version des données',
    loading: 'La version des données est entièrement vérifiée',
    noCalculation: 'Ce spike ne calcule pas encore de délai. Les saisies vérifient uniquement la future structure de l’hôte et de l’interface.',
    technicalStatus: 'État technique',
    host: 'Hôte',
    componentId: 'ID du composant',
    releaseId: 'ID de la version',
    dataStatus: 'État des données',
    providerLabel: 'Fournisseur',
    validatedAt: 'Validé le',
    coverage: 'Couverture',
    idle: 'Pas encore chargé',
    ready: 'Entièrement validé et activé de manière atomique',
    fallback: 'Chargement réseau refusé. La dernière version valable reste active.',
    local: 'Dernière version valable restaurée depuis IndexedDB',
    failure: 'La version des données n’a pas pu être activée',
    localRestored: 'La version active enregistrée a été restaurée au chargement du composant.',
    profileOptions: {
      stpo: 'CPP',
      zpo: 'CPC',
      bgg: 'LTF',
      vwvg: 'PA',
      'vrpg-be': 'LPJA Berne'
    },
    communityOptions: {
      ch: 'Confédération',
      be: 'Canton de Berne'
    }
  }
};

declare interface IFristenrechnerWebPartStrings {
  PropertyPaneDescription: string;
  DataSourcesGroupName: string;
  ProviderKindLabel: string;
  ProviderGitHub: string;
  ProviderSharePointMirror: string;
  GitHubBaseUrlLabel: string;
  GitHubBaseUrlDescription: string;
  SharePointMirrorPathLabel: string;
  SharePointMirrorPathDescription: string;
}

declare module 'FristenrechnerWebPartStrings' {
  const strings: IFristenrechnerWebPartStrings;
  export = strings;
}

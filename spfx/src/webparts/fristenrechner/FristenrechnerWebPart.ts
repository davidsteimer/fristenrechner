// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import { GitHubReleaseProvider } from '../../core/providers/GitHubReleaseProvider';
import { SharePointReleaseProvider } from '../../core/providers/SharePointReleaseProvider';
import { PINNED_GITHUB_RELEASE_URL } from '../../core/config';
import { IndexedDbValidatedReleaseStore } from '../../core/ValidatedReleaseStore';
import type { IReleaseProvider, ProviderKind } from '../../core/types';
import * as strings from 'FristenrechnerWebPartStrings';
import Fristenrechner from './components/Fristenrechner';
import type { IFristenrechnerProps } from './components/IFristenrechnerProps';

export interface IFristenrechnerWebPartProps {
  providerKind: ProviderKind;
  githubBaseUrl: string;
  sharePointMirrorPath: string;
}

interface IProviderConfiguration {
  readonly label: string;
  readonly provider?: IReleaseProvider;
  readonly error?: string;
}

export default class FristenrechnerWebPart extends BaseClientSideWebPart<IFristenrechnerWebPartProps> {
  private readonly releaseStore = new IndexedDbValidatedReleaseStore();

  public render(): void {
    const providerConfiguration = this.buildProvider();
    const props: IFristenrechnerProps = {
      componentId: this.manifest.id,
      hostLabel: this.context.sdks.microsoftTeams ? 'Microsoft Teams' : 'SharePoint Online',
      providerLabel: providerConfiguration.label,
      store: this.releaseStore,
      ...(providerConfiguration.provider ? { provider: providerConfiguration.provider } : {}),
      ...(providerConfiguration.error ? { configurationError: providerConfiguration.error } : {})
    };

    ReactDom.render(React.createElement(Fristenrechner, props), this.domElement);
  }

  protected onInit(): Promise<void> {
    if (this.properties.providerKind !== 'github' && this.properties.providerKind !== 'sharepointMirror') {
      this.properties.providerKind = 'github';
    }
    this.properties.githubBaseUrl ||= PINNED_GITHUB_RELEASE_URL;
    this.properties.sharePointMirrorPath ||= '';
    return Promise.resolve();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.DataSourcesGroupName,
              groupFields: [
                PropertyPaneDropdown('providerKind', {
                  label: strings.ProviderKindLabel,
                  options: [
                    { key: 'github', text: strings.ProviderGitHub },
                    { key: 'sharepointMirror', text: strings.ProviderSharePointMirror }
                  ]
                }),
                PropertyPaneTextField('githubBaseUrl', {
                  label: strings.GitHubBaseUrlLabel,
                  description: strings.GitHubBaseUrlDescription
                }),
                PropertyPaneTextField('sharePointMirrorPath', {
                  label: strings.SharePointMirrorPathLabel,
                  description: strings.SharePointMirrorPathDescription
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private buildProvider(): IProviderConfiguration {
    try {
      if (this.properties.providerKind === 'sharepointMirror') {
        return {
          label: strings.ProviderSharePointMirror,
          provider: new SharePointReleaseProvider(
            this.context.spHttpClient,
            this.context.pageContext.web.absoluteUrl,
            this.properties.sharePointMirrorPath
          )
        };
      }

      return {
        label: strings.ProviderGitHub,
        provider: new GitHubReleaseProvider(this.properties.githubBaseUrl)
      };
    } catch (error) {
      return {
        label: this.properties.providerKind === 'sharepointMirror'
          ? strings.ProviderSharePointMirror
          : strings.ProviderGitHub,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

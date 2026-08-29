// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { type IReadonlyTheme } from '@microsoft/sp-component-base';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import { GitHubReleaseProvider } from '../../core/providers/GitHubReleaseProvider';
import { SharePointReleaseProvider } from '../../core/providers/SharePointReleaseProvider';
import { PINNED_GITHUB_RELEASE_URL } from '../../core/config';
import { IndexedDbValidatedReleaseStore } from '../../core/ValidatedReleaseStore';
import type { IProviderOption } from '../../core/types';
import * as strings from 'FristenrechnerSpikeWebPartStrings';
import FristenrechnerSpike from './components/FristenrechnerSpike';
import type { IFristenrechnerSpikeProps } from './components/IFristenrechnerSpikeProps';

export interface IFristenrechnerSpikeWebPartProps {
  githubBaseUrl: string;
  sharePointMirrorPath: string;
}

export default class FristenrechnerSpikeWebPart extends BaseClientSideWebPart<IFristenrechnerSpikeWebPartProps> {
  private isDarkTheme = false;
  private readonly releaseStore = new IndexedDbValidatedReleaseStore();

  public render(): void {
    const element: React.ReactElement<IFristenrechnerSpikeProps> = React.createElement(
      FristenrechnerSpike,
      {
        componentId: this.manifest.id,
        defaultProvider: 'github',
        hostLabel: this.context.sdks.microsoftTeams ? 'Microsoft Teams' : 'SharePoint Online',
        isDarkTheme: this.isDarkTheme,
        providers: this.buildProviders(),
        store: this.releaseStore
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    this.properties.githubBaseUrl ||= PINNED_GITHUB_RELEASE_URL;
    this.properties.sharePointMirrorPath ||= '';
    return Promise.resolve();
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    this.isDarkTheme = Boolean(currentTheme?.isInverted);
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

  private buildProviders(): readonly IProviderOption[] {
    const providers: IProviderOption[] = [
      {
        key: 'github',
        text: 'GitHub',
        provider: new GitHubReleaseProvider(this.properties.githubBaseUrl)
      }
    ];

    if (!this.properties.sharePointMirrorPath.trim()) {
      providers.push({
        key: 'sharepointMirror',
        text: 'SharePoint-Mirror',
        unavailableReason: strings.MirrorNotConfigured
      });
      return providers;
    }

    try {
      providers.push({
        key: 'sharepointMirror',
        text: 'SharePoint-Mirror',
        provider: new SharePointReleaseProvider(
          this.context.spHttpClient,
          this.context.pageContext.web.absoluteUrl,
          this.properties.sharePointMirrorPath
        )
      });
    } catch (error) {
      providers.push({
        key: 'sharepointMirror',
        text: 'SharePoint-Mirror',
        unavailableReason: error instanceof Error ? error.message : String(error)
      });
    }

    return providers;
  }
}

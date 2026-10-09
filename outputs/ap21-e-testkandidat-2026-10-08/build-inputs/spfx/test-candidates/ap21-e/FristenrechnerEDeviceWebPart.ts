// SPDX-License-Identifier: AGPL-3.0-only
// Separate E-only entry. No editable provider or implicit production fallback.
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SharePointReleaseProvider } from '../../core/providers/SharePointReleaseProvider';
import { normalizeSharePointSiteUrl } from '../../core/providers/sharePointPath';
import { getProviderCacheIdentity } from '../../core/cacheIdentity';
import { ETestStore, bindETestProvider } from '../../core/ap21ETestPolicy';
import { E_TEST_TARGETS } from '../../core/ap21ETestConfig';
import Fristenrechner from './components/Fristenrechner';
import type { IFristenrechnerProps } from './components/IFristenrechnerProps';

export default class AP21EFristenrechnerWebPart extends BaseClientSideWebPart<Record<string, never>> {
  private readonly releaseStore = new ETestStore();

  public render(): void {
    const configuration = this.buildProvider();
    const props: IFristenrechnerProps = {
      componentId: this.manifest.id,
      configurationKey: configuration.key,
      hostLabel: this.context.sdks.microsoftTeams ? 'Microsoft Teams' : 'SharePoint Online',
      providerLabel: 'AP21 E · MVP 0.6 · SharePoint-Mirror',
      store: this.releaseStore,
      ...(configuration.provider ? { provider: configuration.provider } : {}),
      ...(configuration.error ? { configurationError: configuration.error } : {})
    };
    ReactDom.render(React.createElement(Fristenrechner, { ...props, key: props.configurationKey }), this.domElement);
  }

  protected onInit(): Promise<void> { return Promise.resolve(); }
  protected onDispose(): void { ReactDom.unmountComponentAtNode(this.domElement); }
  protected get dataVersion(): Version { return Version.parse('1.0'); }
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ header: { description: 'AP21 E-Gerätetest. Site und MVP-0.6-Mirror sind fest gebunden. Keine operative Freigabe.' }, groups: [] }] };
  }

  private buildProvider(): { key: string; provider?: ReturnType<typeof bindETestProvider>; error?: string } {
    try {
      const web = normalizeSharePointSiteUrl(this.context.pageContext.web.absoluteUrl);
      const target = E_TEST_TARGETS.filter(item => normalizeSharePointSiteUrl(item.siteAbsoluteUrl) === web);
      if (target.length !== 1) throw new Error('AP21 E-Gerätetest: Diese Site gehört nicht zu den zwei zugelassenen E-Zielen.');
      const provider = bindETestProvider(new SharePointReleaseProvider(this.context.spHttpClient, web, target[0].mirrorPath));
      return { key: getProviderCacheIdentity(provider), provider };
    } catch (error) {
      return { key: 'invalid-e-test-configuration', error: error instanceof Error ? error.message : String(error) };
    }
  }
}

// SPDX-License-Identifier: AGPL-3.0-only

export const browserGlobalsPlugin = {
  name: 'browser-globals',
  setup(buildApi) {
    buildApi.onResolve({ filter: /^react$/ }, () => ({
      path: 'react',
      namespace: 'browser-global'
    }));
    buildApi.onResolve({ filter: /^react-dom$/ }, () => ({
      path: 'react-dom',
      namespace: 'browser-global'
    }));
    buildApi.onResolve({ filter: /^@fluentui\/react(?:\/.*)?$/ }, () => ({
      path: 'fluent-ui-react',
      namespace: 'browser-global'
    }));

    buildApi.onLoad({ filter: /.*/, namespace: 'browser-global' }, args => {
      if (args.path === 'react') {
        return {
          loader: 'js',
          contents: `
            const runtime = globalThis.React;
            export const createElement = runtime.createElement;
            export const Fragment = runtime.Fragment;
            export const StrictMode = runtime.StrictMode;
            export const useMemo = runtime.useMemo;
            export const useState = runtime.useState;
            export default runtime;
          `
        };
      }
      if (args.path === 'react-dom') {
        return {
          loader: 'js',
          contents: `
            const runtime = globalThis.ReactDOM;
            export const render = runtime.render;
            export default runtime;
          `
        };
      }
      return {
        loader: 'js',
        contents: `
          const runtime = globalThis.FluentUIReact;
          export const Checkbox = runtime.Checkbox;
          export const DefaultButton = runtime.DefaultButton;
          export const Dropdown = runtime.Dropdown;
          export const MessageBar = runtime.MessageBar;
          export const MessageBarType = runtime.MessageBarType;
          export const PrimaryButton = runtime.PrimaryButton;
          export const TextField = runtime.TextField;
        `
      };
    });
  }
};

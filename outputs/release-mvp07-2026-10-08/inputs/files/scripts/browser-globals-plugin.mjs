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
            export const useRef = runtime.useRef;
            export const useContext = runtime.useContext;
            export const useEffect = runtime.useEffect;
            export const useLayoutEffect = runtime.useLayoutEffect;
            export const useCallback = runtime.useCallback;
            export const createContext = runtime.createContext;
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
          export const Calendar = runtime.Calendar;
          export const DayOfWeek = runtime.DayOfWeek;
          export const Dialog = runtime.Dialog;
          export const DialogType = runtime.DialogType;
          export const DialogFooter = runtime.DialogFooter;
          export const loadTheme = runtime.loadTheme;
          export const registerIcons = runtime.registerIcons;
          export const unregisterIcons = runtime.unregisterIcons;
        `
      };
    });
  }
};

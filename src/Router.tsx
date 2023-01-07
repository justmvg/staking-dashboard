// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NETWORKS } from 'config/networks';
import { PAGES_CONFIG } from 'config/pages';
import { TitleDefault } from 'consts';
import { useApi } from 'contexts/Api';
import { useUi } from 'contexts/UI';
import { AnimatePresence } from 'framer-motion';
import { ErrorFallbackApp, ErrorFallbackRoutes } from 'library/ErrorBoundary';
import { Headers } from 'library/Headers';
import { Help } from 'library/Help';
import { Menu } from 'library/Menu';
import { NetworkBar } from 'library/NetworkBar';
import Notifications from 'library/Notifications';
import { Overlay } from 'library/Overlay';
import SideMenu from 'library/SideMenu';
import { Tooltip } from 'library/Tooltip';
import { availableLanguages } from 'locale';
import { changeLanguage } from 'locale/utils';
import { Modal } from 'modals';
import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { NetworkName } from 'types';
import { extractUrlValue } from 'Utils';
import {
  BodyInterfaceWrapper,
  MainInterfaceWrapper,
  PageWrapper,
  SideInterfaceWrapper,
} from 'Wrappers';

export const RouterInner = () => {
  const { t, i18n } = useTranslation('base');
  const { pathname } = useLocation();
  const { network, switchNetwork, updateNetworkMetaTags } = useApi();
  const { sideMenuOpen, sideMenuMinimised, setContainerRefs } = useUi();

  const [urlVarsInitiated, setUrlVarsInitiated] = useState<boolean>(false);

  useEffect(() => {
    if (!urlVarsInitiated) {
      // TODO: move all this to a hook useUrlVars: initialise()

      // get url variables
      const networkFromUrl = extractUrlValue('n');
      const lngFromUrl = extractUrlValue('l');

      // is the url-provided network valid or not.
      const urlNetworkValid = !!Object.values(NETWORKS).find(
        (n: any) => n.name.toLowerCase() === networkFromUrl
      );

      const urlIsDifferentNetwork =
        urlNetworkValid && networkFromUrl !== network.name;

      // if valid network differs from currently active network, switch to network.
      if (urlNetworkValid && urlIsDifferentNetwork) {
        switchNetwork(networkFromUrl as NetworkName, true);
      }

      // check if favicons are up to date.
      const icons = document.querySelectorAll("link[rel*='icon']");
      const isValid =
        icons[0]
          ?.getAttribute('href')
          ?.toLowerCase()
          .includes(network.name.toLowerCase()) ?? false;

      // this only needs to happen when `n` is in URL and a change needs to take place.
      if (!isValid || urlIsDifferentNetwork) {
        updateNetworkMetaTags(network.name as NetworkName);
      }

      if (availableLanguages.find((n: any) => n[0] === lngFromUrl)) {
        changeLanguage(lngFromUrl as string, i18n);
      }
      // -- end of initialise()

      setUrlVarsInitiated(true);
    }
  });

  // scroll to top of the window on every page change or network change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, network]);

  // set references to UI context and make available throughout app
  useEffect(() => {
    setContainerRefs({
      mainInterface: mainInterfaceRef,
    });
  }, []);

  // references to outer containers
  const mainInterfaceRef = useRef<HTMLDivElement>(null);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallbackApp}>
      <BodyInterfaceWrapper>
        {/* Modal: closed by default */}
        <Modal />
        {/* Help: closed by default */}
        <Help />

        {/* Menu: closed by default */}
        <Menu />

        {/* Tooltip: invisible by default */}
        <Tooltip />

        {/* Overlay: closed by default */}
        <Overlay />

        {/* Left side menu */}
        <SideInterfaceWrapper open={sideMenuOpen} minimised={sideMenuMinimised}>
          <SideMenu />
        </SideInterfaceWrapper>

        {/* Main content window */}
        <MainInterfaceWrapper ref={mainInterfaceRef}>
          {/* Fixed headers */}
          <Headers />

          <ErrorBoundary FallbackComponent={ErrorFallbackRoutes}>
            <AnimatePresence>
              <Routes>
                {PAGES_CONFIG.map((page, i) => {
                  const { Entry, hash, key } = page;

                  return (
                    <Route
                      key={`main_interface_page_${i}`}
                      path={hash}
                      element={
                        <PageWrapper
                          key={`main_interface_key__${i}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Helmet>
                            <title>{`${t(key)} : ${TitleDefault}`}</title>
                          </Helmet>
                          <Entry page={page} />
                        </PageWrapper>
                      }
                    />
                  );
                })}
                <Route
                  key="main_interface_navigate"
                  path="*"
                  element={<Navigate to="/overview" />}
                />
              </Routes>
            </AnimatePresence>
          </ErrorBoundary>
        </MainInterfaceWrapper>
      </BodyInterfaceWrapper>

      {/* Network status and network details */}
      <NetworkBar />

      {/* Notification popups */}
      <Notifications />
    </ErrorBoundary>
  );
};

export const Router = () => {
  return (
    <HashRouter basename="/">
      <RouterInner />
    </HashRouter>
  );
};
export default Router;

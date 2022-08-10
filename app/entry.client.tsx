import { RemixBrowser } from '@remix-run/react';
import { hydrate } from 'react-dom';
import { ClientProvider } from '@mantine/remix';

hydrate(
  <ClientProvider>
    <RemixBrowser />
  </ClientProvider>,
  document
);

// import React, {startTransition} from "react";
// import {RemixBrowser} from '@remix-run/react';
// import {ClientProvider} from '@mantine/remix';
// import {hydrateRoot} from "react-dom/client";
//
//
// function hydrate() {
//   startTransition(() => {
//     hydrateRoot(
//       document,
//       <React.StrictMode>
//         <ClientProvider>
//           <RemixBrowser />
//         </ClientProvider>
//       </React.StrictMode>
//     );
//   });
// }
//
// if (window.requestIdleCallback) {
//   window.requestIdleCallback(hydrate)
// } else {
//   window.setTimeout(hydrate, 1)
// }

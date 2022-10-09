import { RemixBrowser } from "@remix-run/react";
import { ClientProvider } from "@mantine/remix";

import { hydrateRoot } from "react-dom/client";

hydrateRoot(
  document,
  <ClientProvider>
    <RemixBrowser />
  </ClientProvider>
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

import {RemixBrowser} from "@remix-run/react";
import {startTransition} from "react";
import {hydrateRoot} from "react-dom/client";
import createEmotionCache from "@emotion/cache";
import {CacheProvider} from "@emotion/react";

function hydrate() {
  const emotionCache = createEmotionCache({ key: "mantine" });

  startTransition(() => {
    hydrateRoot(
      document,
      <CacheProvider value={emotionCache}>
        <RemixBrowser />
      </CacheProvider>
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}

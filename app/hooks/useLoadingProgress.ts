import {completeNavigationProgress, startNavigationProgress} from "@mantine/nprogress";
import {useEffect} from "react";
import {useFetchers, useTransition} from "@remix-run/react";


export const useLoadingProgress = () => {
  const transition = useTransition()
  const fetchers = useFetchers()
  const state = fetchers.map(f => f.state)?.[0] ?? transition.state

  useEffect(() => {
    if (state === "idle") completeNavigationProgress()
    else startNavigationProgress()
  }, [state]);

  return null
}

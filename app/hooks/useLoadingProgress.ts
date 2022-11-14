import {completeNavigationProgress, startNavigationProgress} from "@mantine/nprogress";
import {useEffect} from "react";
import {useGlobalPendingState} from "remix-utils";


export const useLoadingProgress = () => {
  let state = useGlobalPendingState();

  useEffect(() => {
    if (state === "idle") completeNavigationProgress()
    else startNavigationProgress()
  }, [state]);

  return null
}

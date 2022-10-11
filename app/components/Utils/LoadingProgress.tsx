import {completeNavigationProgress, startNavigationProgress} from "@mantine/nprogress";
import {useEffect} from "react";

interface Props {
  state: "idle" | "submitting" | "loading"
}

export const LoadingProgress = ({state}: Props) => {
  useEffect(() => {
    if (state === "idle") completeNavigationProgress()
    else startNavigationProgress()
  }, [state]);

  return null
}

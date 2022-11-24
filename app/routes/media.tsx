import {Outlet} from "@remix-run/react";
import { GenericErrorBoundary } from "~/components/Errors/GenericErrorBoundary";
import { GenericCatchBoundary } from "~/components/Errors/GenericCatchBoundary";

export default function Media() {
  return (
    <Outlet/>
  )
}
export {
  GenericCatchBoundary as CatchBoundary,
  GenericErrorBoundary as ErrorBoundary,
};

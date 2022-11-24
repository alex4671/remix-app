import { useCatch } from "@remix-run/react";
import {ErrorPage} from "~/components/Errors/ErrorPage";

export function GenericCatchBoundary() {
  let caught = useCatch();

  return (
    <ErrorPage status={caught.status}/>
  );
}

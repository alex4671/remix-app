import {ErrorPage} from "~/components/Errors/ErrorPage";

export function GenericErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <ErrorPage />
  );
}

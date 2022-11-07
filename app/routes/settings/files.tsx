import type {MetaFunction} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return {
    title: "Settings | Files"
  };
};

export default function Files() {
  return (
    <div>TODO Usage, statistics, and files table by recent</div>
  )
}

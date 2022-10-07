import {MediaQuery} from "@mantine/core";

export const MobileOnly = ({children}: {children: JSX.Element}) => {
  return (
    <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
      {children}
    </MediaQuery>
  )
}

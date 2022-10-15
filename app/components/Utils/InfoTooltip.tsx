import {ThemeIcon, Tooltip} from "@mantine/core";
import {IconInfoCircle} from "@tabler/icons";

interface Props {
  label: string
}

export const InfoTooltip = ({label}: Props) => {
  return (
    <Tooltip label={label} withArrow arrowSize={6} events={{ hover: true, focus: true, touch: false }}>
      <ThemeIcon variant="light" radius="xl" size="xs" color="sky" sx={{cursor: "pointer"}}>
        <IconInfoCircle size={14}/>
      </ThemeIcon>
    </Tooltip>
  )
}

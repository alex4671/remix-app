import {useEffect, useState} from "react";
import {useInputState} from "@mantine/hooks";
import {Box, Button, Checkbox, Drawer, Group, Popover, ScrollArea, TextInput} from "@mantine/core";
import {IconChevronDown, IconChevronUp, IconSearch} from "@tabler/icons";
import {SecondaryButton} from "~/components/Buttons/SecondaryButton";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {DesktopOnly} from "~/components/Utils/DesktopOnly";
import {MobileOnly} from "~/components/Utils/MobileOnly";

interface Props {
  fileTypes: string[];
  filterTypeValue: string[];
  setFilterTypeValue: (id: string[]) => void;
}

export const Filter = ({fileTypes, filterTypeValue, setFilterTypeValue}: Props) => {
  const [opened, setOpened] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [searchValue, setSearchValue] = useInputState("");
  const [checked, setChecked] = useState<string[]>(() => filterTypeValue)

  // todo try remove effect
  useEffect(() => {
    setChecked(filterTypeValue)
  }, [filterTypeValue])

  const isAtLeastOneChecked = checked.length;

  const handleApply = () => {
    setFilterTypeValue(checked)
    setOpened(false)
    setDrawerOpened(false)
    setSearchValue("")
  }

  const handleClear = () => {
    setChecked([])
    setSearchValue("")
  }

  const handleSelectAll = () => {
    setChecked(fileTypes)
  }

  const types = fileTypes
    .filter(type => type.includes(searchValue))
    .map((type) => (
      <Group key={type} mt={8}>
        <Checkbox
          ml={4}
          onChange={() => setChecked(prevState => prevState.includes(type) ? prevState.filter(el => el !== type) : [...prevState, type])}
          checked={checked.includes(type)}
          label={type}
        />
      </Group>
    ));


  // todo extract logic to separate components
  return (
    <>
      <DesktopOnly>
        <Popover
          opened={opened}
          onClose={() => setOpened(false)}
          trapFocus
          width={"target"}
          position="bottom"
          withinPortal={false}
        >
          <Popover.Target>
            <Button
              variant={"outline"}
              color={"gray"}
              onClick={() => setOpened((o) => !o)}
              rightIcon={opened ? <IconChevronUp size={16}/> : <IconChevronDown size={16}/>}
            >
              File type
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <div style={{minHeight: "200px", maxHeight: "460px"}}>
              <TextInput
                icon={<IconSearch size={16}/>}
                placeholder={"Filter"}
                color={"zinc"}
                value={searchValue}
                onChange={setSearchValue}
              />
              <ScrollArea type="auto" style={{height: 250}} my={8}>
                {types.length > 0 ? types : "No file type found"}
              </ScrollArea>
              <Group grow my={12}>
                <SecondaryButton
                  compact
                  onClick={handleSelectAll}
                  disabled={checked.length === fileTypes.length || searchValue !== ""}
                >
                  Select All
                </SecondaryButton>
                <SecondaryButton
                  compact
                  disabled={!isAtLeastOneChecked}
                  onClick={handleClear}
                >
                  Clear
                </SecondaryButton>
              </Group>
              <Group grow>
                <PrimaryButton fullWidth onClick={handleApply}>Apply</PrimaryButton>
              </Group>
            </div>
          </Popover.Dropdown>
        </Popover>
      </DesktopOnly>
      <MobileOnly>
        <Box>
          <Button
            variant={"outline"}
            color={"gray"}
            onClick={() => setDrawerOpened((o) => !o)}
            rightIcon={drawerOpened ? <IconChevronUp size={16}/> : <IconChevronDown size={16}/>}
            fullWidth
          >
            File type
          </Button>
          <Drawer
            opened={drawerOpened}
            onClose={() => setDrawerOpened(false)}
            title="File type"
            padding="xl"
            size="xl"
            position="bottom"
          >
            <div style={{minHeight: "200px", maxHeight: "460px"}}>
              <TextInput
                icon={<IconSearch size={16}/>}
                placeholder={"Filter"}
                color={"zinc"}
                value={searchValue}
                onChange={setSearchValue}
              />
              <ScrollArea type="auto" style={{height: 250}} my={8}>
                {types.length > 0 ? types : "No file type found"}
              </ScrollArea>
              <Group grow my={12}>
                <SecondaryButton
                  compact
                  onClick={handleSelectAll}
                  disabled={checked.length === fileTypes.length || searchValue !== ""}
                >
                  Select All
                </SecondaryButton>
                <SecondaryButton
                  compact
                  disabled={!isAtLeastOneChecked}
                  onClick={handleClear}
                >
                  Clear
                </SecondaryButton>
              </Group>
              <Group grow>
                <PrimaryButton fullWidth onClick={handleApply}>Apply</PrimaryButton>
              </Group>
            </div>
          </Drawer>
        </Box>
      </MobileOnly>
    </>
  );
};

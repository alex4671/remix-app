import {ActionIcon, Badge, Grid, Group, TextInput} from "@mantine/core";
import {IconCircleX, IconX} from "@tabler/icons";
import {Filter} from "~/components/MediaManager/Filter";
import type {Dispatch, SetStateAction} from "react";

interface Props {
  fileTypes: string[];
  searchValue: string;
  setSearchValue: (value: any) => void;
  filterTypeValue: string[];
  setFilterTypeValue: Dispatch<SetStateAction<string[]>>;
}

export const FilesFilters = ({fileTypes, searchValue, setSearchValue, filterTypeValue, setFilterTypeValue}: Props) => {
  const handleRemoveSelectedType = (type: string) => {
    setFilterTypeValue(prevState => prevState.filter(t => t !== type))
  }

  return (
    <Grid my={24}>
      <Grid.Col xs={12} sm={4}>
        <TextInput
          placeholder={"File name"}
          value={searchValue}
          onChange={setSearchValue}
          width={400}
          rightSection={
            searchValue !== ""
              ? (
                <IconCircleX
                  color={"gray"}
                  size={14}
                  style={{cursor: "pointer"}}
                  onClick={() => setSearchValue("")}
                />
              )
              : null}
        />
      </Grid.Col>
      <Grid.Col xs={12} sm={"auto"}>
        <Filter
          fileTypes={fileTypes}
          filterTypeValue={filterTypeValue}
          setFilterTypeValue={setFilterTypeValue}
        />

      </Grid.Col>
      <Grid.Col span={12}>
        <Group spacing={"xs"}>
          {filterTypeValue?.map(type => (
            <Badge
              key={type}
              color={"emerald"}
              size={"lg"}
              sx={{paddingRight: 3}}
              rightSection={
                <ActionIcon
                  color={"emerald"}
                  variant="transparent"
                  onClick={() => handleRemoveSelectedType(type)}
                >
                  <IconX size={10}/>
                </ActionIcon>
              }
            >
              {type}
            </Badge>
          ))}

        </Group>
      </Grid.Col>
    </Grid>
  )
}

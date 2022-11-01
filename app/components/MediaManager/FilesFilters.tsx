import {ActionIcon, Badge, Grid, Group, TextInput} from "@mantine/core";
import {IconCircleX, IconX} from "@tabler/icons";
import {Filter} from "~/components/MediaManager/Filter";
import type {Dispatch, SetStateAction} from "react";
import {useState} from "react";
import {useLoaderData, useSearchParams} from "@remix-run/react";
import type {loader} from "~/routes/media";
import type {DateRangePickerValue} from "@mantine/dates";
import {DateRangePicker} from "@mantine/dates";
import dayjs from "dayjs";

interface Props {
  searchValue: string;
  setSearchValue: (value: any) => void;
  filterTypeValue: string[];
  setFilterTypeValue: Dispatch<SetStateAction<string[]>>;
}

export const FilesFilters = ({searchValue, setSearchValue, filterTypeValue, setFilterTypeValue}: Props) => {
  const {userFiles} = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultFrom = searchParams.get("from")
  const defaultTo = searchParams.get("to")

  const fileTypes = Array.from(new Set(userFiles?.map(file => file.type.split('/')[1])))
  const handleRemoveSelectedType = (type: string) => {
    setFilterTypeValue(prevState => prevState.filter(t => t !== type))
  }

  const [timeRange, setTimeRange] = useState<DateRangePickerValue>([
    defaultFrom ? dayjs(defaultFrom, "DD-MM-YYYY").toDate() : null,
    defaultTo ? dayjs(defaultTo, "DD-MM-YYYY").toDate() : null,
  ]);

  // todo From - to
  const handleRangeChange = (date: DateRangePickerValue) => {
    const [from, to] = date
    console.log("date", date)
    if (from && to) {
      setSearchParams({
        from: dayjs(from).format('DD-MM-YYYY'),
        to: dayjs(to).format('DD-MM-YYYY')
      });
    } else if (!from && !to) {
      setSearchParams({});
    }
    setTimeRange(date)
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
      <Grid.Col xs={12} sm={"content"}>
        <Filter
          fileTypes={fileTypes}
          filterTypeValue={filterTypeValue}
          setFilterTypeValue={setFilterTypeValue}
        />
      </Grid.Col>
      <Grid.Col xs={12} sm={3}>
        <DateRangePicker
          placeholder="Pick dates range"
          value={timeRange}
          onChange={handleRangeChange}
          inputFormat="DD/MM/YYYY"
          allowSingleDateInRange={false}
          clearable
          openDropdownOnClear={false}
          // renderDay={(date) => {
          //   const day = date.getDay();
          //   console.log("day", day)
          //   return (
          //     <Indicator size={6} color="red" offset={8} disabled={day === new Date().getDay()}>
          //       <div>{day}</div>
          //     </Indicator>
          //   );
          // }}
          maxDate={dayjs(new Date()).endOf('day').add(1, "day").toDate()}
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

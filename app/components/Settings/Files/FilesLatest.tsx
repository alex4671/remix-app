import {Box, Paper, ScrollArea, Table, Title, Text, createStyles, UnstyledButton, Group, Center, Badge, Anchor} from "@mantine/core";
import {useState} from "react";
import {IconChevronDown, IconChevronUp, IconSelector} from "@tabler/icons";
import {Link, useLoaderData} from "@remix-run/react";
import {loader} from "~/routes/settings/files";
import {formatBytes} from "~/utils/utils";
import dayjs from "dayjs";


interface RowData {
  name: string;
  fileUrl: string;
  public: boolean;
  size: number;
  type: string;
  createdAt: string;

}


interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort(): void;
}

const useStyles = createStyles((theme) => ({
  th: {
    padding: '0 !important',
  },

  control: {
    width: '100%',
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },

  icon: {
    width: 21,
    height: 21,
    borderRadius: 21,
  },
}));


function Th({ children, reversed, sorted, onSort }: ThProps) {
  const {classes} = useStyles();
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group position="apart">
          <Text weight={500} size="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={14} stroke={1.5}/>
          </Center>
        </Group>
      </UnstyledButton>
    </th>
  );
}


function sortData(
  data: RowData[],
  payload: { sortBy: keyof RowData | null; reversed: boolean }
) {
  const { sortBy } = payload;

  if (!sortBy) {
    return data;
  }

  return [...data].sort((a, b) => {
    if (payload.reversed) {
      return b[sortBy].toString().localeCompare(a[sortBy]);
    }

    return a[sortBy].localeCompare(b[sortBy]);
  });
}

export const FilesLatest = () => {
  const {userFiles} = useLoaderData<typeof loader>()

  console.log("userFiels", userFiles)

  const [sortedData, setSortedData] = useState(userFiles);
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: keyof RowData) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(userFiles, { sortBy: field, reversed }));
  };


  const rows = sortedData.map((row) => (
    <tr key={row.id}>
      <td><Anchor href={row.fileUrl} target={"_blank"}>File</Anchor></td>
      <td>
        <Badge color={row.public ? "emerald" : "red"}>{row.public ? "Public" : "Private"}</Badge>
      </td>
      <td>{formatBytes(row.size)}</td>
      <td><Badge color="gray" variant="outline">{row.type.split('/')[1]}</Badge></td>
      <td>{dayjs(row.createdAt).format("MMMM D, YYYY")}</td>
    </tr>
  ));

  return (
    <Paper shadow="0" p="md" withBorder mb={24}>
      <Title order={2}>Latest</Title>
      <Text mt={6} mb={12}>View latest files</Text>
      <Box>
        <ScrollArea>
          <Table
            horizontalSpacing="md"
            verticalSpacing="xs"
            sx={{ tableLayout: 'fixed', minWidth: 700 }}
          >
            <thead>
            <tr>
              <th>Url</th>
              <th>Public</th>
              <th>Size</th>
              <th>Type</th>
              <Th
                sorted={sortBy === 'createdAt'}
                reversed={reverseSortDirection}
                onSort={() => setSorting('createdAt')}
              >
                CreatedAt
              </Th>
            </tr>
            </thead>
            <tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <tr>
                <td colSpan={Object.keys(userFiles).length}>
                  <Text weight={500} align="center">
                    Nothing found
                  </Text>
                </td>
              </tr>
            )}
            </tbody>
          </Table>
        </ScrollArea>
      </Box>
    </Paper>
  )
}

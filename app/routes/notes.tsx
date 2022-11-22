import {Link, useFetcher, useLoaderData} from "@remix-run/react";
import {ActionIcon, AspectRatio, Card, Group, Image, SimpleGrid} from "@mantine/core";
import type {ActionArgs, LoaderArgs, MetaFunction} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {createNote, deleteNote, getAllUserNotes, updateNote} from "~/models/notes.server";
import {IconTrash} from "@tabler/icons";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";


export const meta: MetaFunction = () => {
  return {
    title: "Notes"
  };
};

export const loader = async ({request}: LoaderArgs) => {
  const user = await requireUser(request)
  const notes = await getAllUserNotes(user.id)


  return json({
    notes
  });
};
export const action = async ({request}: ActionArgs) => {
  const user = await requireUser(request)
  const formData = await request.formData();

  const intent = formData.get("intent")?.toString() ?? "";

  if (intent === "createNote") {

    const note = formData.get("note")?.toString() ?? "";
    const image = formData.get("image")?.toString() ?? "";

    try {
      await createNote(user.id, note, image)
      return redirect("/notes")
    } catch (e) {
      return json({success: false, intent, message: "Error creating note"})
    }
  }
  if (intent === "updateNote") {

    const noteId = formData.get("noteId")?.toString() ?? "";
    const note = formData.get("note")?.toString() ?? "";

    try {
      await updateNote(noteId, note)
      return json({success: true, intent, message: "Note updated"})
    } catch (e) {
      return json({success: false, intent, message: "Error updating note"})
    }
  }

  if (intent === "deleteNote") {

    const noteId = formData.get("noteId")?.toString() ?? "";

    try {
      await deleteNote(noteId)
      return redirect("/notes")
    } catch (e) {
      return json({success: false, intent, message: "Error deleting note"})
    }
  }


  return json({success: false, intent: null, message: "Some error"})
};

export default function Notes() {
  const {notes} = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  return (
    <>
      <Group position={"right"} my={24}>
        <PrimaryButton component={Link} to={"/notes/new"}>New note</PrimaryButton>
      </Group>
      <SimpleGrid
        cols={4}
        breakpoints={[
          {maxWidth: 'md', cols: 3},
          {maxWidth: 'sm', cols: 2},
          {maxWidth: 'xs', cols: 1},
        ]}
      >
        {notes?.map(note => {
          return (
            <Card
              p="lg"
              withBorder
              key={note.id}
            >
              <Card.Section>
                <AspectRatio ratio={16 / 9}>
                  <Image src={note.preview}/>
                </AspectRatio>
              </Card.Section>
              <Link to={`./${note.id}`} key={note.id}>Note</Link>
              <fetcher.Form method={"post"}>
                <input type="hidden" name={"noteId"} value={note.id}/>
                <ActionIcon type={"submit"} name={"intent"} value={"deleteNote"}>
                  <IconTrash size={18}/>
                </ActionIcon>
              </fetcher.Form>
            </Card>
          )
        })}
      </SimpleGrid>
    </>
  )
}

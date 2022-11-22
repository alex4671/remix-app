import {Link as RemixLink, useFetcher, useLoaderData} from "@remix-run/react";
import {Group, Paper, TypographyStylesProvider} from "@mantine/core";
import type {LoaderArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {getNoteById} from "~/models/notes.server";
import invariant from "tiny-invariant";
import {DangerButton} from "~/components/Buttons/DangerButtom";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {useEffect, useState} from "react";
import {RichTextEditor} from "@mantine/tiptap";
import {IconColorPicker} from "@tabler/icons";
import {useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import {TextStyle} from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import {Link} from "@tiptap/extension-link";

export const meta: MetaFunction = () => {
  return {
    title: "Notes"
  };
};

export const loader = async ({request, params}: LoaderArgs) => {
  await requireUser(request)
  const noteId = params.noteId
  invariant(typeof noteId === "string", "Note Id must be provided")

  const note = await getNoteById(noteId)

  return json({
    note
  });
};


export default function Note() {
  const {note} = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  const [isEdit, setIsEdit] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: note?.note,
  });

  const handleToggleEdit = () => {
    setIsEdit(o => !o)
  }

  useEffect(() => {
    if (fetcher?.data?.intent === "updateNote") {
      setIsEdit(false)
    }
  }, [fetcher.data])

  return (
    <>
      <Group position={"right"} my={24}>
        <PrimaryButton component={RemixLink} to={"/notes/new"}>New note</PrimaryButton>
      </Group>
      {isEdit ? (
        <>
          <RichTextEditor editor={editor}>
            <RichTextEditor.Toolbar sticky stickyOffset={60}>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.Highlight />
                <RichTextEditor.Code />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.H4 />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Blockquote />
                <RichTextEditor.Hr />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
                <RichTextEditor.Subscript />
                <RichTextEditor.Superscript />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.AlignLeft />
                <RichTextEditor.AlignCenter />
                <RichTextEditor.AlignJustify />
                <RichTextEditor.AlignRight />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.ColorPicker
                  colors={[
                    '#25262b',
                    '#868e96',
                    '#fa5252',
                    '#e64980',
                    '#be4bdb',
                    '#7950f2',
                    '#4c6ef5',
                    '#228be6',
                    '#15aabf',
                    '#12b886',
                    '#40c057',
                    '#82c91e',
                    '#fab005',
                    '#fd7e14',
                  ]}
                />

                <RichTextEditor.Control interactive={false}>
                  <IconColorPicker size={16} stroke={1.5} />
                </RichTextEditor.Control>
                <RichTextEditor.Color color="#F03E3E" />
                <RichTextEditor.Color color="#7048E8" />
                <RichTextEditor.Color color="#1098AD" />
                <RichTextEditor.Color color="#37B24D" />
                <RichTextEditor.Color color="#F59F00" />
                <RichTextEditor.UnsetColor />
              </RichTextEditor.ControlsGroup>

            </RichTextEditor.Toolbar>

            <RichTextEditor.Content />
          </RichTextEditor>

        </>
      ) : (
        <TypographyStylesProvider>
          <Paper withBorder p={"sm"}>
            <div dangerouslySetInnerHTML={{ __html: note?.note ?? "" }} />
          </Paper>
        </TypographyStylesProvider>
      )}
      <Group mt={24} position={"right"}>
        {isEdit ? (
          <fetcher.Form method={"post"} action={"/notes"}>
            <input type="hidden" name={"noteId"} value={note?.id}/>
            <input type="hidden" name={"note"} value={editor?.getHTML()}/>
            <PrimaryButton type={"submit"} name={"intent"} value={"updateNote"}>Update</PrimaryButton>
          </fetcher.Form>
        ) : null}
        <PrimaryButton onClick={handleToggleEdit}>{isEdit ? "Cancel" : "Edit"}</PrimaryButton>
        <fetcher.Form method={"post"} action={"/notes"}>
          <input type="hidden" name={"noteId"} value={note?.id}/>
          <DangerButton type={"submit"} name={"intent"} value={"deleteNote"}>Delete</DangerButton>
        </fetcher.Form>
      </Group>
    </>
  )
}

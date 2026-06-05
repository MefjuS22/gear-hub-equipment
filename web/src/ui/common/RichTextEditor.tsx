import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  Bold,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Strikethrough,
  Underline as UnderlineIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  onUploadImage?: (file: File) => Promise<string>;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write the article body…",
  disabled = false,
  error = false,
  onUploadImage,
}: RichTextEditorProps) {
  const { enqueueSnackbar } = useSnackbar();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef(onUploadImage);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [hasExistingLink, setHasExistingLink] = useState(false);

  useEffect(() => {
    uploadRef.current = onUploadImage;
  }, [onUploadImage]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "cms-inline-image" },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next === current) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [value, editor]);

  useEffect(() => {
    if (!linkDialogOpen) return;
    const id = window.setTimeout(() => linkInputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [linkDialogOpen]);

  if (!editor) {
    return null;
  }

  const openLinkDialog = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    setLinkUrl(prev ?? "");
    setHasExistingLink(Boolean(prev) || editor.isActive("link"));
    setLinkDialogOpen(true);
  };

  const closeLinkDialog = () => {
    setLinkDialogOpen(false);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
    closeLinkDialog();
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    closeLinkDialog();
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: error ? "error.main" : "divider",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.25,
          px: 0.5,
          py: 0.5,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "action.hover",
        }}
      >
        <Tooltip title="Bold">
          <IconButton
            size="small"
            disabled={disabled}
            color={editor.isActive("bold") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            <Bold size={18} aria-hidden />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton
            size="small"
            disabled={disabled}
            color={editor.isActive("italic") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            <Italic size={18} aria-hidden />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline">
          <IconButton
            size="small"
            disabled={disabled}
            color={editor.isActive("underline") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Underline"
          >
            <UnderlineIcon size={18} aria-hidden />
          </IconButton>
        </Tooltip>
        <Tooltip title="Strikethrough">
          <IconButton
            size="small"
            disabled={disabled}
            color={editor.isActive("strike") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Strikethrough"
          >
            <Strikethrough size={18} aria-hidden />
          </IconButton>
        </Tooltip>
        <Tooltip title="Heading 2">
          <IconButton
            size="small"
            disabled={disabled}
            color={
              editor.isActive("heading", { level: 2 }) ? "primary" : "default"
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            aria-label="Heading 2"
          >
            <Heading2 size={18} aria-hidden />
          </IconButton>
        </Tooltip>
        <Tooltip title="Bullet list">
          <IconButton
            size="small"
            disabled={disabled}
            color={editor.isActive("bulletList") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Bullet list"
          >
            <List size={18} aria-hidden />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered list">
          <IconButton
            size="small"
            disabled={disabled}
            color={editor.isActive("orderedList") ? "primary" : "default"}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Numbered list"
          >
            <ListOrdered size={18} aria-hidden />
          </IconButton>
        </Tooltip>
        <Tooltip title="Link">
          <IconButton
            size="small"
            disabled={disabled}
            color={editor.isActive("link") ? "primary" : "default"}
            onClick={openLinkDialog}
            aria-label="Link"
          >
            <LinkIcon size={18} aria-hidden />
          </IconButton>
        </Tooltip>
        {onUploadImage ? (
          <>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                const fn = uploadRef.current;
                if (!file || !fn || !editor) return;
                try {
                  const src = await fn(file);
                  editor.chain().focus().setImage({ src }).run();
                } catch {
                  enqueueSnackbar("Image upload failed.", { variant: "error" });
                }
              }}
            />
            <Tooltip title="Insert image">
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => imageInputRef.current?.click()}
                aria-label="Insert image"
              >
                <ImageIcon size={18} aria-hidden />
              </IconButton>
            </Tooltip>
          </>
        ) : null}
      </Box>
      <Box
        sx={{
          "& .ProseMirror": {
            minHeight: 220,
            outline: "none",
            px: 2,
            py: 1.5,
            "& p.is-editor-empty:first-of-type::before": {
              color: "text.disabled",
              content: "attr(data-placeholder)",
              float: "left",
              height: 0,
              pointerEvents: "none",
            },
            "& img": { maxWidth: "100%", height: "auto", borderRadius: 4 },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      <Dialog
        open={linkDialogOpen}
        onClose={closeLinkDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {hasExistingLink ? "Edit link" : "Insert link"}
        </DialogTitle>
        <DialogContent>
          <TextField
            inputRef={linkInputRef}
            label="URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            fullWidth
            margin="dense"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {hasExistingLink ? (
            <Button color="error" onClick={removeLink} sx={{ mr: "auto" }}>
              Remove link
            </Button>
          ) : null}
          <Button onClick={closeLinkDialog}>Cancel</Button>
          <Button variant="contained" onClick={applyLink}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

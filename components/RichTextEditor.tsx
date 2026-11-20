import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useEffect, useCallback } from "react";
import { sanitizeInstagramPasteHtml } from "@/lib/instagramEmbed";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
};

const ToolbarButton = ({ onClick, active, title, children }: ToolbarButtonProps) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`p-1.5 rounded text-sm font-medium transition-colors ${
      active
        ? "bg-red-600 text-white"
        : "text-gray-700 hover:bg-gray-200"
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder || "Write your article content here..." }),
      Link.configure({
        openOnClick: false,
        // Keep Instagram reel/post URLs as real links (CMS used to drop embed markup).
        validate: (href) => /^https?:\/\//i.test(href) || href.startsWith("mailto:"),
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[400px] p-4 focus:outline-none text-gray-900",
      },
      // TipTap's schema strips Instagram blockquote data-* attrs and embed.js.
      // Collapse those pastes to a paragraph with the canonical permalink so
      // the article renderer can show the click-to-load facade.
      transformPastedHTML(html) {
        return sanitizeInstagramPasteHtml(html);
      },
    },
  });

  // Sync external value changes (e.g. editing an existing article)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const headingOptions = [
    { label: "Normal", level: 0 },
    { label: "H1", level: 1 },
    { label: "H2", level: 2 },
    { label: "H3", level: 3 },
    { label: "H4", level: 4 },
  ] as const;

  const colors = [
    { label: "Black", value: "#111827" },
    { label: "Red", value: "#dc2626" },
    { label: "Blue", value: "#2563eb" },
    { label: "Green", value: "#16a34a" },
    { label: "Orange", value: "#ea580c" },
    { label: "Purple", value: "#9333ea" },
  ];

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">

        {/* Heading Selector */}
        <select
          value={
            editor.isActive("heading", { level: 1 }) ? "1" :
            editor.isActive("heading", { level: 2 }) ? "2" :
            editor.isActive("heading", { level: 3 }) ? "3" :
            editor.isActive("heading", { level: 4 }) ? "4" : "0"
          }
          onChange={(e) => {
            const level = Number(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: level as 1|2|3|4 }).run();
            }
          }}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-800 focus:outline-none"
        >
          <option value="0">Normal</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>

        <Divider />

        {/* Text Formatting */}
        <ToolbarButton title="Bold (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton title="Italic (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton title="Underline (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
          <span className="line-through">S</span>
        </ToolbarButton>

        <Divider />

        {/* Text Color */}
        <div className="flex items-center gap-1">
          {colors.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => editor.chain().focus().setColor(c.value).run()}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c.value,
                borderColor: editor.isActive("textStyle", { color: c.value }) ? "#000" : "transparent",
              }}
            />
          ))}
          <button
            type="button"
            title="Reset color"
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="text-xs text-gray-500 hover:text-gray-800 ml-1"
          >
            ✕
          </button>
        </div>

        <Divider />

        {/* Alignment */}
        <ToolbarButton title="Align Left" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
          ☰
        </ToolbarButton>
        <ToolbarButton title="Align Center" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
          ≡
        </ToolbarButton>
        <ToolbarButton title="Align Right" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
          ☷
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          • ≡
        </ToolbarButton>
        <ToolbarButton title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          1. ≡
        </ToolbarButton>

        <Divider />

        {/* Blockquote & Code */}
        <ToolbarButton title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          ❝
        </ToolbarButton>
        <ToolbarButton title="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>
          {"</>"}
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton title="Insert Link" onClick={setLink} active={editor.isActive("link")}>
          🔗
        </ToolbarButton>

        <Divider />

        {/* Undo / Redo */}
        <ToolbarButton title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()}>
          ↩
        </ToolbarButton>
        <ToolbarButton title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()}>
          ↪
        </ToolbarButton>

        <Divider />

        {/* Clear formatting */}
        <ToolbarButton title="Clear Formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          Tx
        </ToolbarButton>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} className="min-h-[400px]" />

      {/* Style overrides for editor content */}
      <style jsx global>{`
        .tiptap h1 { font-size: 2em; font-weight: 800; margin: 0.5em 0; color: #111827; }
        .tiptap h2 { font-size: 1.6em; font-weight: 700; margin: 0.5em 0; color: #1f2937; }
        .tiptap h3 { font-size: 1.3em; font-weight: 600; margin: 0.5em 0; color: #1f2937; }
        .tiptap h4 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0; color: #374151; }
        .tiptap p { margin: 0.5em 0; line-height: 1.7; }
        .tiptap ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap blockquote { border-left: 4px solid #dc2626; padding-left: 1em; color: #6b7280; font-style: italic; margin: 1em 0; }
        .tiptap code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
        .tiptap pre { background: #1f2937; color: #f9fafb; padding: 1em; border-radius: 8px; overflow-x: auto; margin: 1em 0; }
        .tiptap pre code { background: none; color: inherit; padding: 0; }
        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #9ca3af; float: left; height: 0; pointer-events: none; }
        .tiptap strong { font-weight: 700; }
        .tiptap em { font-style: italic; }
        .tiptap s { text-decoration: line-through; }
        .tiptap a { color: #2563eb; text-decoration: underline; }
      `}</style>
    </div>
  );
}

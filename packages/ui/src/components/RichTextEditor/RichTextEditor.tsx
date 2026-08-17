import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ChangeEvent, KeyboardEvent, ReactNode } from "react";
import type { JSONContent } from "@tiptap/core";
import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  BlockOutlined,
  CheckSquareOutlined,
  ClearOutlined,
  CodeOutlined,
  ColumnWidthOutlined,
  DeleteOutlined,
  DisconnectOutlined,
  FontColorsOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  HighlightOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  PictureOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  TableOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { Button } from "../Button";
import { Input } from "../Input";

export type RichTextJSON = JSONContent;

export interface RichTextChangeDetail {
  json: RichTextJSON;
  text: string;
  isEmpty: boolean;
  characters: number;
  words: number;
}

export interface RichTextEditorHandle {
  focus: (position?: "start" | "end" | "all" | number) => void;
  blur: () => void;
  clear: () => void;
  getHTML: () => string;
  getJSON: () => RichTextJSON;
  getText: () => string;
  setContent: (content: string | RichTextJSON, emitUpdate?: boolean) => void;
}

export interface RichTextEditorProps {
  /** 受控 HTML 内容 */
  value?: string;
  /** 非受控初始 HTML 内容 */
  defaultValue?: string;
  /** 内容更新；HTML 在前，结构化详情在后 */
  onChange?: (html: string, detail: RichTextChangeDetail) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  /** 完整工具栏、基础工具栏或隐藏工具栏 */
  toolbar?: "full" | "basic" | false;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean | "start" | "end" | "all";
  minHeight?: number | string;
  maxHeight?: number | string;
  maxCharacters?: number;
  showCharacterCount?: boolean;
  /** 图片上传实现；缺省转为 data URL 内嵌 */
  onImageUpload?: (file: File) => Promise<string> | string;
  onImageUploadError?: (error: Error) => void;
  allowBase64Images?: boolean;
  maxImageSize?: number;
  imageAccept?: string;
  className?: string;
  editorClassName?: string;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
  "aria-label"?: string;
}

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  children,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={cx("rideos-richtext-tool", active && "is-active")}
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ToolbarGroup({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="rideos-richtext-tool-group" role="group" aria-label={label}>
      {children}
    </div>
  );
}

function normalizeCssSize(value: number | string | undefined) {
  return typeof value === "number" ? `${value}px` : value;
}

function normalizeLink(value: string) {
  const candidate = value.trim();
  if (!candidate) return null;
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(candidate)) return candidate;
  if (/^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(candidate)) return `https://${candidate}`;
  return null;
}

function normalizeImageSource(value: string) {
  const candidate = value.trim();
  if (!candidate) return null;
  if (/^(https?:\/\/|blob:|\/)/i.test(candidate)) return candidate;
  if (/^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,/i.test(candidate)) return candidate;
  if (/^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(candidate)) return `https://${candidate}`;
  return null;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

function colorInputValue(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

const EMPTY_HTML = "<p></p>";
const STRUCTURAL_CONTENT_TYPES = new Set(["horizontalRule", "image", "table"]);

function isRichTextEmpty(json: RichTextJSON, editorIsEmpty: boolean) {
  if (!editorIsEmpty) return false;
  const visit = (node: RichTextJSON): boolean => {
    if (node.type && STRUCTURAL_CONTENT_TYPES.has(node.type)) return true;
    return node.content?.some(visit) ?? false;
  };
  return !visit(json);
}

/**
 * 富文本编辑器：HTML 受控/非受控输入，覆盖常用排版、媒体、表格与文档编辑能力。
 */
export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor(
    {
      value,
      defaultValue = EMPTY_HTML,
      onChange,
      onFocus,
      onBlur,
      placeholder = "请输入内容…",
      toolbar = "full",
      disabled = false,
      readOnly = false,
      autoFocus = false,
      minHeight = 240,
      maxHeight,
      maxCharacters,
      showCharacterCount = true,
      onImageUpload,
      onImageUploadError,
      allowBase64Images = true,
      maxImageSize = 5 * 1024 * 1024,
      imageAccept = "image/png,image/jpeg,image/gif,image/webp,image/svg+xml",
      className,
      editorClassName,
      style,
      contentStyle,
      "aria-label": ariaLabel = "富文本编辑器",
    },
    ref,
  ) {
    const callbackRef = useRef({ onChange, onFocus, onBlur, onImageUpload, onImageUploadError });
    const [activePanel, setActivePanel] = useState<"link" | "image" | null>(null);
    const [linkHref, setLinkHref] = useState("");
    const [linkText, setLinkText] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageAlt, setImageAlt] = useState("");
    const [panelError, setPanelError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      callbackRef.current = { onChange, onFocus, onBlur, onImageUpload, onImageUploadError };
    }, [onBlur, onChange, onFocus, onImageUpload, onImageUploadError]);

    const editor = useEditor(
      {
        extensions: [
          StarterKit.configure({
            link: {
              openOnClick: false,
              autolink: true,
              linkOnPaste: true,
              defaultProtocol: "https",
              HTMLAttributes: {
                rel: "noopener noreferrer nofollow",
                target: "_blank",
              },
            },
          }),
          TextStyle,
          Color,
          Highlight.configure({ multicolor: true }),
          TextAlign.configure({ types: ["heading", "paragraph"] }),
          Image.configure({
            allowBase64: allowBase64Images,
            HTMLAttributes: { loading: "lazy" },
          }),
          TableKit.configure({
            table: {
              resizable: true,
              allowTableNodeSelection: true,
              HTMLAttributes: { class: "rideos-richtext-table" },
            },
          }),
          TaskList,
          TaskItem.configure({ nested: true }),
          Placeholder.configure({ placeholder }),
          CharacterCount.configure({ limit: maxCharacters }),
        ],
        content: value ?? defaultValue,
        editable: !disabled && !readOnly,
        autofocus: autoFocus,
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
        editorProps: {
          attributes: {
            class: cx("rideos-richtext-prosemirror", editorClassName),
            role: "textbox",
            "aria-label": ariaLabel,
            "aria-multiline": "true",
          },
        },
        onUpdate: ({ editor: currentEditor }) => {
          const json = currentEditor.getJSON();
          const characters = currentEditor.storage.characterCount.characters();
          const words = currentEditor.storage.characterCount.words();
          callbackRef.current.onChange?.(currentEditor.getHTML(), {
            json,
            text: currentEditor.getText(),
            isEmpty: isRichTextEmpty(json, currentEditor.isEmpty),
            characters,
            words,
          });
        },
        onFocus: () => callbackRef.current.onFocus?.(),
        onBlur: () => callbackRef.current.onBlur?.(),
      },
      [allowBase64Images, ariaLabel, autoFocus, defaultValue, editorClassName, maxCharacters, placeholder],
    );

    useEditorState({
      editor,
      selector: ({ transactionNumber }) => transactionNumber,
    });

    useEffect(() => {
      if (!editor) return;
      editor.setEditable(!disabled && !readOnly);
    }, [disabled, editor, readOnly]);

    useEffect(() => {
      if (!editor || value === undefined || editor.getHTML() === value) return;
      editor.commands.setContent(value || EMPTY_HTML, { emitUpdate: false });
    }, [editor, value]);

    useEffect(() => {
      if (!fullscreen) return;
      const onKeyDown = (event: globalThis.KeyboardEvent) => {
        if (event.key === "Escape") setFullscreen(false);
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [fullscreen]);

    useImperativeHandle(
      ref,
      () => ({
        focus: (position = "end") => editor?.commands.focus(position),
        blur: () => editor?.commands.blur(),
        clear: () => editor?.commands.clearContent(),
        getHTML: () => editor?.getHTML() ?? EMPTY_HTML,
        getJSON: () => editor?.getJSON() ?? { type: "doc", content: [] },
        getText: () => editor?.getText() ?? "",
        setContent: (content, emitUpdate = true) =>
          editor?.commands.setContent(content, { emitUpdate }),
      }),
      [editor],
    );

    function closePanel() {
      setActivePanel(null);
      setPanelError("");
    }

    function openLinkPanel() {
      if (!editor) return;
      const href = String(editor.getAttributes("link").href ?? "");
      const { from, to } = editor.state.selection;
      setLinkHref(href);
      setLinkText(editor.state.doc.textBetween(from, to, " "));
      setPanelError("");
      setActivePanel(activePanel === "link" ? null : "link");
    }

    function applyLink() {
      if (!editor) return;
      const href = normalizeLink(linkHref);
      if (!href) {
        setPanelError("请输入 http(s)、邮箱、电话或站内相对地址");
        return;
      }
      const chain = editor.chain().focus();
      if (editor.state.selection.empty) {
        chain
          .insertContent({
            type: "text",
            text: linkText.trim() || href,
            marks: [{ type: "link", attrs: { href } }],
          })
          .run();
      } else {
        chain.extendMarkRange("link").setLink({ href }).run();
      }
      closePanel();
    }

    function insertImage(source: string, alt = "") {
      if (!editor) return;
      const src = normalizeImageSource(source);
      if (!src) {
        setPanelError("请输入安全的图片 URL 或选择本地图片");
        return;
      }
      editor.chain().focus().setImage({ src, alt: alt.trim() || undefined }).run();
      setImageUrl("");
      setImageAlt("");
      closePanel();
    }

    async function uploadImage(file: File) {
      setPanelError("");
      if (!file.type.startsWith("image/")) {
        setPanelError("仅支持图片文件");
        return;
      }
      if (file.size > maxImageSize) {
        setPanelError(`图片不能超过 ${(maxImageSize / 1024 / 1024).toFixed(1)} MB`);
        return;
      }
      if (!callbackRef.current.onImageUpload && !allowBase64Images) {
        setPanelError("请提供 onImageUpload 后再上传本地图片");
        return;
      }
      setUploading(true);
      try {
        const src = callbackRef.current.onImageUpload
          ? await callbackRef.current.onImageUpload(file)
          : await fileToDataUrl(file);
        insertImage(src, imageAlt || file.name);
      } catch (reason) {
        const error = reason instanceof Error ? reason : new Error("图片上传失败");
        setPanelError(error.message);
        callbackRef.current.onImageUploadError?.(error);
      } finally {
        setUploading(false);
      }
    }

    function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>, action: () => void) {
      if (event.key !== "Enter") return;
      const target = event.target as HTMLElement;
      if (target.tagName === "TEXTAREA") return;
      event.preventDefault();
      action();
    }

    const canEdit = Boolean(editor) && !disabled && !readOnly;
    const isFullToolbar = toolbar === "full";
    const characters = editor?.storage.characterCount.characters() ?? 0;
    const words = editor?.storage.characterCount.words() ?? 0;
    const currentTextColor = colorInputValue(editor?.getAttributes("textStyle").color, "#1f2329");
    const currentHighlight = colorInputValue(editor?.getAttributes("highlight").color, "#fff3a3");
    const contentAreaStyle: CSSProperties = {
      minHeight: normalizeCssSize(minHeight),
      maxHeight: normalizeCssSize(maxHeight),
      ...contentStyle,
    };

    return (
      <div
        className={cx(
          "rideos-richtext-editor",
          disabled && "is-disabled",
          readOnly && "is-readonly",
          fullscreen && "is-fullscreen",
          className,
        )}
        style={style}
      >
        {toolbar !== false && !readOnly && editor ? (
          <div className="rideos-richtext-toolbar" role="toolbar" aria-label="富文本工具栏">
            <ToolbarGroup label="历史记录">
              <ToolbarButton
                label="撤销"
                disabled={!canEdit || !editor.can().chain().focus().undo().run()}
                onClick={() => editor.chain().focus().undo().run()}
              >
                <UndoOutlined />
              </ToolbarButton>
              <ToolbarButton
                label="重做"
                disabled={!canEdit || !editor.can().chain().focus().redo().run()}
                onClick={() => editor.chain().focus().redo().run()}
              >
                <RedoOutlined />
              </ToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup label="段落样式">
              <select
                className="rideos-richtext-select"
                aria-label="段落样式"
                disabled={!canEdit}
                value={
                  editor.isActive("heading", { level: 1 })
                    ? "1"
                    : editor.isActive("heading", { level: 2 })
                      ? "2"
                      : editor.isActive("heading", { level: 3 })
                        ? "3"
                        : "paragraph"
                }
                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                  if (event.target.value === "paragraph") editor.chain().focus().setParagraph().run();
                  else
                    editor
                      .chain()
                      .focus()
                      .setHeading({ level: Number(event.target.value) as 1 | 2 | 3 })
                      .run();
                }}
              >
                <option value="paragraph">正文</option>
                <option value="1">标题 1</option>
                <option value="2">标题 2</option>
                <option value="3">标题 3</option>
              </select>
            </ToolbarGroup>

            <ToolbarGroup label="文字格式">
              <ToolbarButton
                label="加粗"
                active={editor.isActive("bold")}
                disabled={!canEdit}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <BoldOutlined />
              </ToolbarButton>
              <ToolbarButton
                label="斜体"
                active={editor.isActive("italic")}
                disabled={!canEdit}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <ItalicOutlined />
              </ToolbarButton>
              <ToolbarButton
                label="下划线"
                active={editor.isActive("underline")}
                disabled={!canEdit}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <UnderlineOutlined />
              </ToolbarButton>
              <ToolbarButton
                label="删除线"
                active={editor.isActive("strike")}
                disabled={!canEdit}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <StrikethroughOutlined />
              </ToolbarButton>
              <ToolbarButton
                label="行内代码"
                active={editor.isActive("code")}
                disabled={!canEdit}
                onClick={() => editor.chain().focus().toggleCode().run()}
              >
                <CodeOutlined />
              </ToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup label="列表与引用">
              <ToolbarButton
                label="无序列表"
                active={editor.isActive("bulletList")}
                disabled={!canEdit}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <UnorderedListOutlined />
              </ToolbarButton>
              <ToolbarButton
                label="有序列表"
                active={editor.isActive("orderedList")}
                disabled={!canEdit}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <OrderedListOutlined />
              </ToolbarButton>
              {isFullToolbar ? (
                <>
                  <ToolbarButton
                    label="任务列表"
                    active={editor.isActive("taskList")}
                    disabled={!canEdit}
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                  >
                    <CheckSquareOutlined />
                  </ToolbarButton>
                  <ToolbarButton
                    label="引用"
                    active={editor.isActive("blockquote")}
                    disabled={!canEdit}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  >
                    <BlockOutlined />
                  </ToolbarButton>
                </>
              ) : null}
            </ToolbarGroup>

            {isFullToolbar ? (
              <ToolbarGroup label="对齐方式">
                <ToolbarButton
                  label="左对齐"
                  active={editor.isActive({ textAlign: "left" })}
                  disabled={!canEdit}
                  onClick={() => editor.chain().focus().setTextAlign("left").run()}
                >
                  <AlignLeftOutlined />
                </ToolbarButton>
                <ToolbarButton
                  label="居中"
                  active={editor.isActive({ textAlign: "center" })}
                  disabled={!canEdit}
                  onClick={() => editor.chain().focus().setTextAlign("center").run()}
                >
                  <AlignCenterOutlined />
                </ToolbarButton>
                <ToolbarButton
                  label="右对齐"
                  active={editor.isActive({ textAlign: "right" })}
                  disabled={!canEdit}
                  onClick={() => editor.chain().focus().setTextAlign("right").run()}
                >
                  <AlignRightOutlined />
                </ToolbarButton>
                <ToolbarButton
                  label="两端对齐"
                  active={editor.isActive({ textAlign: "justify" })}
                  disabled={!canEdit}
                  onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                >
                  <ColumnWidthOutlined />
                </ToolbarButton>
              </ToolbarGroup>
            ) : null}

            <ToolbarGroup label="链接和媒体">
              <ToolbarButton
                label="添加或编辑链接"
                active={activePanel === "link" || editor.isActive("link")}
                disabled={!canEdit}
                onClick={openLinkPanel}
              >
                <LinkOutlined />
              </ToolbarButton>
              <ToolbarButton
                label="移除链接"
                disabled={!canEdit || !editor.isActive("link")}
                onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
              >
                <DisconnectOutlined />
              </ToolbarButton>
              {isFullToolbar ? (
                <ToolbarButton
                  label="插入图片"
                  active={activePanel === "image"}
                  disabled={!canEdit}
                  onClick={() => {
                    setPanelError("");
                    setActivePanel(activePanel === "image" ? null : "image");
                  }}
                >
                  <PictureOutlined />
                </ToolbarButton>
              ) : null}
            </ToolbarGroup>

            {isFullToolbar ? (
              <>
                <ToolbarGroup label="颜色">
                  <label className="rideos-richtext-color-tool" title="文字颜色">
                    <FontColorsOutlined aria-hidden="true" />
                    <input
                      type="color"
                      aria-label="文字颜色"
                      value={currentTextColor}
                      disabled={!canEdit}
                      onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
                    />
                  </label>
                  <label className="rideos-richtext-color-tool" title="高亮颜色">
                    <HighlightOutlined aria-hidden="true" />
                    <input
                      type="color"
                      aria-label="高亮颜色"
                      value={currentHighlight}
                      disabled={!canEdit}
                      onChange={(event) =>
                        editor.chain().focus().setHighlight({ color: event.target.value }).run()
                      }
                    />
                  </label>
                </ToolbarGroup>
                <ToolbarGroup label="插入与清理">
                  <ToolbarButton
                    label="代码块"
                    active={editor.isActive("codeBlock")}
                    disabled={!canEdit}
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  >
                    <span className="rideos-richtext-tool-text">{"{}"}</span>
                  </ToolbarButton>
                  <ToolbarButton
                    label="分隔线"
                    disabled={!canEdit}
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  >
                    <span className="rideos-richtext-tool-text">—</span>
                  </ToolbarButton>
                  <ToolbarButton
                    label="插入 3×3 表格"
                    active={editor.isActive("table")}
                    disabled={!canEdit}
                    onClick={() =>
                      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                    }
                  >
                    <TableOutlined />
                  </ToolbarButton>
                  <ToolbarButton
                    label="清除格式"
                    disabled={!canEdit}
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                  >
                    <ClearOutlined />
                  </ToolbarButton>
                </ToolbarGroup>
                <ToolbarGroup label="视图">
                  <ToolbarButton
                    label={fullscreen ? "退出全屏" : "全屏编辑"}
                    active={fullscreen}
                    onClick={() => setFullscreen((current) => !current)}
                  >
                    {fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  </ToolbarButton>
                </ToolbarGroup>
              </>
            ) : null}
          </div>
        ) : null}

        {activePanel === "link" && editor ? (
          <div
            className="rideos-richtext-panel"
            role="group"
            aria-label="链接设置"
            onKeyDown={(event) => onPanelKeyDown(event, applyLink)}
          >
            <Input
              aria-label="链接地址"
              placeholder="https://example.com 或 /docs"
              value={linkHref}
              onChange={setLinkHref}
            />
            {editor.state.selection.empty ? (
              <Input
                aria-label="链接文字"
                placeholder="显示文字（可选）"
                value={linkText}
                onChange={setLinkText}
              />
            ) : null}
            <Button variant="primary" onClick={applyLink}>应用链接</Button>
            <Button onClick={closePanel}>取消</Button>
            {panelError ? <span className="rideos-richtext-panel-error">{panelError}</span> : null}
          </div>
        ) : null}

        {activePanel === "image" ? (
          <div
            className="rideos-richtext-panel"
            role="group"
            aria-label="图片设置"
            onKeyDown={(event) => onPanelKeyDown(event, () => insertImage(imageUrl, imageAlt))}
          >
            <Input
              aria-label="图片地址"
              placeholder="https://example.com/image.png"
              value={imageUrl}
              onChange={setImageUrl}
            />
            <Input aria-label="图片说明" placeholder="图片说明（可选）" value={imageAlt} onChange={setImageAlt} />
            <Button variant="primary" onClick={() => insertImage(imageUrl, imageAlt)}>插入 URL</Button>
            <Button disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              {uploading ? "上传中…" : "选择本地图片"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept={imageAccept}
              aria-label="上传本地图片"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadImage(file);
                event.target.value = "";
              }}
            />
            <Button onClick={closePanel}>取消</Button>
            {panelError ? <span className="rideos-richtext-panel-error">{panelError}</span> : null}
          </div>
        ) : null}

        {isFullToolbar && canEdit && editor?.isActive("table") ? (
          <div className="rideos-richtext-table-tools" role="toolbar" aria-label="表格工具栏">
            <span>表格</span>
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>+ 行</button>
            <button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>− 行</button>
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>+ 列</button>
            <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()}>− 列</button>
            <button type="button" onClick={() => editor.chain().focus().mergeOrSplit().run()}>合并 / 拆分</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>切换表头</button>
            <button type="button" className="is-danger" onClick={() => editor.chain().focus().deleteTable().run()}>
              <DeleteOutlined /> 删除表格
            </button>
          </div>
        ) : null}

        <div className="rideos-richtext-content" style={contentAreaStyle}>
          <EditorContent editor={editor} />
        </div>

        {showCharacterCount && editor ? (
          <div className="rideos-richtext-footer" aria-live="polite">
            <span>{words} 个词</span>
            <span className={cx(maxCharacters != null && characters >= maxCharacters && "is-limit")}>
              {characters}{maxCharacters != null ? ` / ${maxCharacters}` : ""} 个字符
            </span>
          </div>
        ) : null}
      </div>
    );
  },
);

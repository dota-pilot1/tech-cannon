import { TextFormatButtons } from "./TextFormatButtons";
import { BlockTypeButtons } from "./BlockTypeButtons";
import { CodeBlockButton } from "./CodeBlockButton";
import { UndoRedoButtons } from "./UndoRedoButtons";
import { ImageButton } from "./ImageButton";

interface ToolbarPluginProps {
  onImageUpload?: (file: File) => Promise<string>;
}

export function ToolbarPlugin({ onImageUpload }: ToolbarPluginProps) {
  return (
    <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-border bg-muted/30 flex-wrap">
      <UndoRedoButtons />
      <span className="w-px h-4 bg-gray-300 mx-1" />
      <TextFormatButtons />
      <span className="w-px h-4 bg-gray-300 mx-1" />
      <BlockTypeButtons />
      <span className="w-px h-4 bg-gray-300 mx-1" />
      <CodeBlockButton />
      {onImageUpload && (
        <>
          <span className="w-px h-4 bg-gray-300 mx-1" />
          <ImageButton onUpload={onImageUpload} />
        </>
      )}
    </div>
  );
}

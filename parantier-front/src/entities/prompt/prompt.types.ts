export interface PromptFolder {
  id: number;
  parentId: number | null;
  name: string;
  sortOrder: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Prompt {
  id: number;
  folderId: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  isPinned: boolean;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptDto {
  id?: number;
  folderId: number;
  title: string;
  content: string;
  isPinned?: boolean;
  tags?: string[];
}

export interface PromptFolderDto {
  parentId: number | null;
  name: string;
}

export const buildPromptTree = (folders: PromptFolder[]) => {
  const children: Record<number, PromptFolder[]> = {};
  const roots: PromptFolder[] = [];
  folders.forEach((f) => {
    if (f.parentId === null) roots.push(f);
    else {
      if (!children[f.parentId]) children[f.parentId] = [];
      children[f.parentId].push(f);
    }
  });
  return { roots, children };
};

export const parseTags = (tags: string | null | undefined): string[] => {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

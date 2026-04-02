export type DbBlockType = "NOTE" | "DBTABLE" | "SQL" | "ERD" | "LINK";

export interface DbFolder {
  id: number;
  parentId: number | null;
  name: string;
  sortOrder: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbBlock {
  id?: number;
  postId?: number;
  blockType: DbBlockType;
  content: string;
  sortOrder?: number;
}

export interface DbPost {
  id: number;
  folderId: number;
  title: string;
  authorId: number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  blocks?: DbBlock[];
}

// DTOs
export interface DbFolderDto {
  id?: number;
  parentId: number | null;
  name: string;
  sortOrder?: number;
}

export interface DbBlockDto {
  blockType: DbBlockType;
  content: string;
}

export interface DbPostDto {
  id?: number;
  folderId: number;
  title: string;
  blocks: DbBlockDto[];
}

// 블록 타입 메타데이터
export const DB_TYPE_META: Record<
  DbBlockType,
  { icon: string; label: string; color: string }
> = {
  NOTE: { icon: "📝", label: "노트", color: "bg-blue-100 text-blue-700" },
  DBTABLE: {
    icon: "🗄️",
    label: "테이블 정의",
    color: "bg-amber-100 text-amber-700",
  },
  SQL: { icon: "💾", label: "SQL", color: "bg-green-100 text-green-700" },
  ERD: {
    icon: "📊",
    label: "ERD 다이어그램",
    color: "bg-purple-100 text-purple-700",
  },
  LINK: { icon: "🔗", label: "링크", color: "bg-gray-100 text-gray-700" },
};

// 폴더 트리 빌더
export const buildDbTree = (folders: DbFolder[]) => {
  const children: Record<number, DbFolder[]> = {};
  const roots: DbFolder[] = [];

  folders.forEach((folder) => {
    if (folder.parentId === null) {
      roots.push(folder);
    } else {
      if (!children[folder.parentId]) children[folder.parentId] = [];
      children[folder.parentId].push(folder);
    }
  });

  return { roots, children };
};

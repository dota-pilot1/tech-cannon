export type BlockType =
  | "NOTE"
  | "MMD"
  | "FIGMA"
  | "FILE"
  | "DBTABLE"
  | "GITHUB";

export interface TaskFolder {
  id: number;
  parentId: number | null;
  name: string;
  sortOrder: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskBlock {
  id?: number;
  postId?: number;
  blockType: BlockType;
  content: string;
  sortOrder?: number;
}

export interface TaskPost {
  id: number;
  folderId: number;
  title: string;
  authorId: number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  blocks?: TaskBlock[];
}

export interface TaskComment {
  id: number;
  postId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

// DTO types
export interface TaskFolderDto {
  id?: number;
  parentId: number | null;
  name: string;
  sortOrder?: number;
}

export interface TaskBlockDto {
  blockType: BlockType;
  content: string;
}

export interface TaskPostDto {
  id?: number;
  folderId: number;
  title: string;
  blocks: TaskBlockDto[];
}

export interface TaskCommentDto {
  postId: number;
  content: string;
}

// JSON content types
export interface FileContent {
  url: string;
  filename: string;
  description: string;
}

export interface DbColumn {
  no: number;
  name: string;
  comment: string;
  type: string;
  size: string;
  pk: boolean;
  notNull: boolean;
  note: string;
}

export interface DbTableContent {
  tableName: string;
  schema: string;
  category: string;
  description: string;
  headers?: string[];
  columns: DbColumn[];
}

export interface GithubContent {
  url: string;
  title: string;
  description: string;
  type: "repo" | "pr" | "issue" | "gist" | "other";
}

// Block metadata
export const TYPE_META: Record<
  BlockType,
  { icon: string; label: string; color: string }
> = {
  NOTE: { icon: "📝", label: "노트", color: "bg-blue-100 text-blue-700" },
  MMD: {
    icon: "📊",
    label: "다이어그램",
    color: "bg-purple-100 text-purple-700",
  },
  FIGMA: { icon: "🎨", label: "Figma", color: "bg-pink-100 text-pink-700" },
  FILE: { icon: "📎", label: "첨부파일", color: "bg-green-100 text-green-700" },
  DBTABLE: {
    icon: "🗄️",
    label: "DB테이블",
    color: "bg-amber-100 text-amber-700",
  },
  GITHUB: { icon: "🐙", label: "GitHub", color: "bg-gray-100 text-gray-700" },
};

// Helper functions
export const parseFileContent = (content: string): FileContent => {
  try {
    return JSON.parse(content);
  } catch {
    return { url: "", filename: "", description: "" };
  }
};

export const parseGithubContent = (content: string): GithubContent => {
  try {
    return JSON.parse(content);
  } catch {
    return { url: "", title: "", description: "", type: "repo" };
  }
};

export const parseDbTableContent = (content: string): DbTableContent => {
  try {
    return JSON.parse(content);
  } catch {
    return {
      tableName: "",
      schema: "",
      category: "",
      description: "",
      headers: [],
      columns: [],
    };
  }
};

// TSV 파싱 유틸리티 - DBeaver 출력 그대로 저장
export const parseTsvToColumns = (tsv: string): DbColumn[] => {
  const lines = tsv.trim().split("\n");
  if (lines.length === 0) return [];

  const rows = lines.map((line) => line.split("\t"));
  const parsedColumns: DbColumn[] = [];

  for (const row of rows) {
    if (row.length < 2) continue;

    // DBeaver 형식: column_name | data_type | size | is_nullable
    // 예: id | bigint | [NULL] | NO
    // 예: email | character varying | 255 | NO
    const name = row[0]?.trim() || "";
    const typeRaw = row[1]?.trim() || "";
    const sizeRaw = row[2]?.trim() || "";
    const isNullable = row[3]?.trim().toUpperCase() || "";

    if (!name) continue;

    // data_type 변환 (가독성 향상)
    let type = typeRaw;
    if (typeRaw.toLowerCase().includes("character varying")) type = "VARCHAR";
    else if (typeRaw.toLowerCase().includes("timestamp without"))
      type = "TIMESTAMP";
    else if (typeRaw.toLowerCase().includes("timestamp with"))
      type = "TIMESTAMPTZ";
    else type = typeRaw.toUpperCase();

    // size 정리 ([NULL] 제거)
    const size = sizeRaw === "[NULL]" || !sizeRaw ? "" : sizeRaw;

    parsedColumns.push({
      no: parsedColumns.length + 1,
      name,
      comment: "",
      type,
      size,
      pk: false, // DBeaver는 PK 정보를 제공하지 않으므로 수동 설정
      notNull: isNullable === "NO",
      note: "",
    });
  }

  return parsedColumns;
};

// Tree builder
export const buildTree = (folders: TaskFolder[]) => {
  const children: Record<number, TaskFolder[]> = {};
  const roots: TaskFolder[] = [];

  folders.forEach((folder) => {
    if (folder.parentId === null) {
      roots.push(folder);
    } else {
      if (!children[folder.parentId]) {
        children[folder.parentId] = [];
      }
      children[folder.parentId].push(folder);
    }
  });

  return { roots, children };
};

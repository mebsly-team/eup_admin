// ----------------------------------------------------------------------

export type IKanbanComment = {
  id: string;
  name: string;
  message: string;
  avatarUrl: string;
  messageType: 'image' | 'text';
  createdAt: Date;
};

export type IKanbanAssignee = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type IKanbanTask = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee: string | null;
  reporter: string;
  due_date: string;
  labels: string[];
  attachments: string[];
  comments: IKanbanComment[];
};

export type IKanbanColumn = {
  id: string;
  name: string;
};

export type IKanban = {
  length: any;
  filter(arg0: (items: any) => boolean): Record<string, IKanbanTask>;
  tasks: Record<string, IKanbanTask>;
  columns: Record<string, IKanbanColumn>;
  ordered: string[];
};

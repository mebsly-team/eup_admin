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
  role: string;
  email: string;
  status: string;
  address: string;
  avatarUrl: string;
  phoneNumber: string;
  lastActivity: Date;
};

export type IKanbanTask = {
  due_date: any;
  id: string;
  title: string;
  name?: string;
  status: string;
  priority: string;
  labels: string[];
  description?: string;
  attachments: string[];
  comments: IKanbanComment[];
  assignee: IKanbanAssignee[];
  due: [Date | null, Date | null];
  reporter: {
    id: string;
    name: string;
    avatarUrl: string;
  };
};

export type IKanbanColumn = {
  id: string | number;
  name: string;
  taskIds?: string[];
};

export type IKanban = {
  length: any;
  filter(arg0: (items: any) => boolean): Record<string, IKanbanTask>;
  tasks: Record<string, IKanbanTask>;
  columns: Record<string, IKanbanColumn>;
  ordered: string[];
};

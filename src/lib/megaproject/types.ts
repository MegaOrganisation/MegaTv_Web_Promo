export type MegaProjectTaskRow = {
  id: string;
  title: string;
  status: string | null;
  priority: string | null;
  project_id: string | null;
  updated_at: string | null;
};

export type MegaProjectTasksPayload = {
  configured: boolean;
  embedUrl: string | null;
  tasks: MegaProjectTaskRow[];
  openCount: number;
  error?: string;
};

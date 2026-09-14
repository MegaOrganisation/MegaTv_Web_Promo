export type AdminAccountProfile = {
  profile_id: string;
  name: string | null;
  is_kids: boolean;
  friend_code: string | null;
  avatar_id?: number | null;
  avatar_image_version?: number | null;
  avatar_url?: string | null;
};

export type AdminAccount = {
  user_id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  plan_tier: string;
  is_pro: boolean;
  source: string | null;
  product_id: string | null;
  expires_at: string | null;
  profile_count: number;
  profiles: AdminAccountProfile[];
};

type RpcProfile = AdminAccountProfile & { avatar_image_storage_path?: string | null };

export function parseAdminAccounts(data: unknown): AdminAccount[] {
  if (Array.isArray(data)) return data as AdminAccount[];
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data) as unknown;
      return Array.isArray(parsed) ? (parsed as AdminAccount[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function stripStoragePaths(accounts: AdminAccount[]): AdminAccount[] {
  return accounts.map((account) => ({
    ...account,
    profiles: (account.profiles || []).map((profile) => {
      const row = profile as RpcProfile;
      const { avatar_image_storage_path: _path, ...rest } = row;
      return rest;
    })
  }));
}

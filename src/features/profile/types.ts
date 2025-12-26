export type Profile = {
  id: number | null;
  username: string | null;
  nickname: string | null;
  gender: number | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  status: number | null;
  createTime: string | null;
  updateTime: string | null;
  role: string | null;
};

export type UpdateProfilePayload = Pick<
  Profile,
  "nickname" | "phone" | "email" | "avatar"
>;
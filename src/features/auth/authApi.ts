export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};
export type RegisterRequest = {
  username: string;
  password: string;
  email: string;
  phone: string;
  gender: number;
};

export type RegisterResponse = {
  token: string;
};
export type { ApiResult } from "../../services/apiResult";
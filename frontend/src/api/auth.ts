import { apiClient } from "./client";
import { User } from "../types";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export async function registerRequest(email: string, password: string, name: string): Promise<AuthResponse> {
  const { data } = await apiClient.post("/auth/register", { email, password, name });
  return data;
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
}

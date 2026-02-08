import type { Role, User } from "./auth-context";

export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
}

export function canVerifyPayments(role: Role | null | undefined): boolean {
  return role === "admin";
}

export function canDeleteAppointments(role: Role | null | undefined): boolean {
  return role === "admin";
}

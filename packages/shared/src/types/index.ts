import { Tenant, Ticket, Property, User } from "../db/schema";

export type TenantResponse = Tenant & {
  user?: Pick<User, "name" | "email"> | null;
  property?: Pick<Property, "address"> | null;
};

export type TicketResponse = Ticket & {
  property?: Pick<Property, "address"> | null;
  creator?: Pick<User, "name" | "email"> | null;
};

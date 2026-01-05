export type TicketStatus = "open" | "closed";

export type Ticket = {
  id: string;
  customerId: string;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  readByAdmin?: boolean;
  resolvedAt?: string;
};

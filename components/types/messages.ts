export type PortalMessage = {
  id: string;
  createdAt: string;
  customerId: string;
  from: "customer" | "admin" | "system";
  text: string;
  month?: string;
  readByAdmin?: boolean;
  readByCustomer?: boolean;
};

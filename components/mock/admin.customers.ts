import type { AdminCustomer } from "../types/admin";

export const adminCustomersMock: AdminCustomer[] = [
  { id: "origin", name: "Origin.se", domain: "origin.se", contactEmail: "report@origin.se", active: true },
  { id: "trad", name: "Tandläkare.se", domain: "tandläkare.se", contactEmail: "info@tandläkare.se", active: true },
  { id: "hedekontor", name: "Kontor.se", domain: "kontorshotell.se", contactEmail: "info@kontorshotell.se", active: true },
];

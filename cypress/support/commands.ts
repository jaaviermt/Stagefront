/// <reference types="cypress" />

/** Demo admin credentials (hardcoded in AdminAuthContext — see SECURITY_REPORT A07). */
export const ADMIN_CREDENTIALS = {
  email: "admin@stagefront.mx",
  password: "admin123",
} as const;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Logs into the admin panel through the UI. */
      adminLogin(email?: string, password?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add(
  "adminLogin",
  (email = ADMIN_CREDENTIALS.email, password = ADMIN_CREDENTIALS.password) => {
    cy.visit("/admin/login");
    cy.get('input[type="email"]').clear().type(email);
    cy.get('input[type="password"]').clear().type(password, { log: false });
    cy.contains("button", /autenticar|verificando/i).click();
  }
);

export {};

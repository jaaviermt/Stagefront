/// <reference types="cypress" />

/**
 * Page Object for the admin login screen (/admin/login).
 * Selectors prefer stable attributes; once `data-testid` is added to the form
 * (see E2E_REPORT.md) swap them in here only.
 */
export class AdminLoginPage {
  visit(): void {
    cy.visit("/admin/login");
  }

  fillEmail(email: string): void {
    cy.get('input[type="email"]').clear().type(email);
  }

  fillPassword(password: string): void {
    cy.get('input[type="password"]').clear().type(password, { log: false });
  }

  submit(): void {
    cy.contains("button", /autenticar|verificando/i).click();
  }

  login(email: string, password: string): void {
    this.fillEmail(email);
    this.fillPassword(password);
    this.submit();
  }

  errorMessage(): Cypress.Chainable {
    return cy.contains(/credenciales inválidas/i);
  }
}

/// <reference types="cypress" />
import { AdminLoginPage } from "../support/pages/AdminLoginPage";
import { ADMIN_CREDENTIALS } from "../support/commands";

/**
 * Authentication & authorization flows.
 * StageFront has no public buyer registration; the only credentialed flow is
 * the admin panel, so "Registro" is covered as a documented gap and the
 * role-guard behaviour is asserted instead.
 */
describe("Admin authentication", () => {
  const login = new AdminLoginPage();

  it("rejects invalid credentials with an error message", () => {
    login.visit();
    login.login("wrong@stagefront.mx", "badpass");
    login.errorMessage().should("be.visible");
  });

  it("logs in with valid credentials and reaches the dashboard", () => {
    login.visit();
    login.login(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    cy.location("pathname").should("eq", "/admin");
  });

  it("role guard: unauthenticated visit to /admin redirects to login", () => {
    cy.visit("/admin");
    cy.location("pathname").should("eq", "/admin/login");
  });

  it("logout returns the user to the login screen", () => {
    cy.adminLogin();
    cy.location("pathname").should("eq", "/admin");
    cy.contains("button", /salir|logout|cerrar/i).click();
    cy.location("pathname").should("eq", "/admin/login");
  });
});

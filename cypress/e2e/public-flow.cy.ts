/// <reference types="cypress" />
import { HomePage, EventsPage } from "../support/pages/PublicPages";

/**
 * Main business flow: discover an event -> open detail -> reach checkout.
 * Requires backend + seeded databases to be running.
 */
describe("Public purchase journey", () => {
  const home = new HomePage();
  const events = new EventsPage();

  it("home loads and exposes navigation to events", () => {
    home.visit();
    home.goToEvents();
    cy.location("pathname").should("include", "/events");
  });

  it("events page lists events and supports search", () => {
    events.visit();
    events.searchInput().should("be.visible");
    events.search("Rosalía");
    cy.location("pathname").should("include", "/events");
  });

  it("opening an event detail shows a buy action", () => {
    cy.visit("/events");
    cy.get('a[href*="/events/"]').first().click();
    cy.location("pathname").should("match", /\/events\/.+/);
    cy.contains("button, a", /comprar|checkout|pagar/i).should("exist");
  });

  it("resales page renders", () => {
    cy.visit("/resales");
    cy.location("pathname").should("include", "/resales");
  });
});

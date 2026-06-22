/// <reference types="cypress" />

/** Home (/) page object. */
export class HomePage {
  visit(): void {
    cy.visit("/");
  }
  goToEvents(): void {
    cy.contains("a", /eventos/i).first().click();
  }
}

/** Events listing (/events) page object. */
export class EventsPage {
  visit(): void {
    cy.visit("/events");
  }
  search(term: string): void {
    cy.get('input[placeholder*="uscar"]').clear().type(term);
  }
  searchInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('input[placeholder*="uscar"]');
  }
}

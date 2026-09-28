import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LIBRARY_KEY, loadLibrary } from "../../library";
import { E1 } from "./E1";

function csvFile(name: string, content: string) {
  return new File([content], name, { type: "text/csv" });
}

function getFileInput(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]');
  if (!input) throw new Error("file input not found");
  return input as HTMLInputElement;
}

describe("E1", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the default library (12 groups) with no import", () => {
    render(<E1 onNavigate={vi.fn()} />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText(/groupes · \d+ catégories/)).toBeInTheDocument();
    expect(screen.getByText("Bibliothèque d’exemple intégrée")).toBeInTheDocument();
  });

  it("navigates to E2 via 'Nouvelle partie' and to regles via 'Règles'", async () => {
    const onNavigate = vi.fn();
    render(<E1 onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Nouvelle partie" }));
    expect(onNavigate).toHaveBeenCalledWith("E2");
    await userEvent.click(screen.getByRole("button", { name: "Règles" }));
    expect(onNavigate).toHaveBeenCalledWith("regles");
  });

  it("imports a valid CSV, reports the ignored row by its file line number, and persists the new library", async () => {
    const { container } = render(<E1 onNavigate={vi.fn()} />);
    const csv = [
      "categorie;mot1;mot2;mot3;mot4;mot5;mot6",
      "Boissons;Coca;Fanta;Orangina;Iced Tea;RedBull;",
      "Fruits;Pomme;Poire;Coing;;;",
      "Sports;Tennis;Badminton;Squash;Ping-pong;Padel;",
    ].join("\n");

    await userEvent.upload(getFileInput(container), csvFile("mots.csv", csv));

    expect(await screen.findByText("2 groupes importés, 1 ligne ignorée")).toBeInTheDocument();
    expect(screen.getByText("Moins de 4 mots : ligne 3")).toBeInTheDocument();
    expect(screen.getByText("Importée depuis mots.csv")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(loadLibrary()).toEqual({
      source: "mots.csv",
      groups: [
        { cat: "Boissons", words: ["Coca", "Fanta", "Orangina", "Iced Tea", "RedBull"] },
        { cat: "Sports", words: ["Tennis", "Badminton", "Squash", "Ping-pong", "Padel"] },
      ],
    });
  });

  it("keeps the previous library and shows the empty-import message when zero groups are valid", async () => {
    const { container } = render(<E1 onNavigate={vi.fn()} />);
    const csv = ["categorie;mot1;mot2;mot3;mot4", "Fruits;Pomme;Poire;;"].join("\n");

    await userEvent.upload(getFileInput(container), csvFile("vide.csv", csv));

    expect(
      await screen.findByText("Aucun groupe valide : la bibliothèque actuelle est conservée."),
    ).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Bibliothèque d’exemple intégrée")).toBeInTheDocument();
    expect(window.localStorage.getItem(LIBRARY_KEY)).toBeNull();
  });

  it("auto-detects a comma-separated CSV", async () => {
    const { container } = render(<E1 onNavigate={vi.fn()} />);
    const csv = ["categorie,mot1,mot2,mot3,mot4", "Fruits,Pomme,Poire,Coing,Pêche"].join("\n");

    await userEvent.upload(getFileInput(container), csvFile("mots.csv", csv));

    expect(await screen.findByText("1 groupes importés, 0 ligne ignorée")).toBeInTheDocument();
  });
});

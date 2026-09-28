import { describe, expect, it } from "vitest";
import { parseCSV } from "./parseCsv";

describe("parseCSV", () => {
  it("parses a valid semicolon-separated CSV", () => {
    const csv = ["categorie;mot1;mot2;mot3;mot4;mot5;mot6", "Boissons;Coca;Fanta;Orangina;Iced Tea;RedBull;"].join(
      "\n",
    );
    const { groups, errors } = parseCSV(csv);
    expect(errors).toEqual([]);
    expect(groups).toEqual([{ cat: "Boissons", words: ["Coca", "Fanta", "Orangina", "Iced Tea", "RedBull"] }]);
  });

  it("auto-detects the comma separator", () => {
    const csv = ["categorie,mot1,mot2,mot3,mot4", "Fruits,Pomme,Poire,Coing,Pêche"].join("\n");
    const { groups, errors } = parseCSV(csv);
    expect(errors).toEqual([]);
    expect(groups).toEqual([{ cat: "Fruits", words: ["Pomme", "Poire", "Coing", "Pêche"] }]);
  });

  it("ignores a row with fewer than 4 words and reports its file line number, header = line 1", () => {
    const csv = [
      "categorie;mot1;mot2;mot3;mot4;mot5;mot6",
      "Boissons;Coca;Fanta;Orangina;Iced Tea;RedBull;",
      "Fruits;Pomme;Poire;Coing;;;",
      "Sports;Tennis;Badminton;Squash;Ping-pong;Padel;",
    ].join("\n");
    const { groups, errors } = parseCSV(csv);
    expect(errors).toEqual([3]);
    expect(groups.map((g) => g.cat)).toEqual(["Boissons", "Sports"]);
  });

  it("ignores a row with no category", () => {
    const csv = ["categorie;mot1;mot2;mot3;mot4", ";Coca;Fanta;Orangina;Iced Tea"].join("\n");
    const { groups, errors } = parseCSV(csv);
    expect(groups).toEqual([]);
    expect(errors).toEqual([2]);
  });

  it("strips a leading BOM before parsing", () => {
    const csv = "﻿" + ["categorie;mot1;mot2;mot3;mot4", "Fruits;Pomme;Poire;Coing;Pêche"].join("\n");
    const { groups, errors } = parseCSV(csv);
    expect(errors).toEqual([]);
    expect(groups).toEqual([{ cat: "Fruits", words: ["Pomme", "Poire", "Coing", "Pêche"] }]);
  });

  it("trims whitespace and surrounding quotes from cells", () => {
    const csv = ["categorie;mot1;mot2;mot3;mot4", '  Fruits ; " Pomme " ;Poire; Coing ;Pêche'].join("\n");
    const { groups, errors } = parseCSV(csv);
    expect(errors).toEqual([]);
    expect(groups).toEqual([{ cat: "Fruits", words: ["Pomme", "Poire", "Coing", "Pêche"] }]);
  });

  it("merges duplicate words within a group after RG04 normalization", () => {
    const csv = ["categorie;mot1;mot2;mot3;mot4;mot5;mot6", "Boissons;Coca;coca;COCA;Fanta;Orangina;Iced Tea"].join(
      "\n",
    );
    const { groups, errors } = parseCSV(csv);
    expect(errors).toEqual([]);
    expect(groups).toEqual([{ cat: "Boissons", words: ["Coca", "Fanta", "Orangina", "Iced Tea"] }]);
  });

  it("ignores a row whose word count drops below 4 after duplicate merging", () => {
    const csv = ["categorie;mot1;mot2;mot3;mot4", "Boissons;Coca;coca;Fanta;Orangina"].join("\n");
    const { groups, errors } = parseCSV(csv);
    expect(groups).toEqual([]);
    expect(errors).toEqual([2]);
  });

  it("only reads up to 6 word columns", () => {
    const csv = ["categorie;mot1;mot2;mot3;mot4;mot5;mot6;mot7", "Boissons;A;B;C;D;E;F;G"].join("\n");
    const { groups } = parseCSV(csv);
    expect(groups).toEqual([{ cat: "Boissons", words: ["A", "B", "C", "D", "E", "F"] }]);
  });

  it("skips blank lines", () => {
    const csv = ["categorie;mot1;mot2;mot3;mot4", "", "Fruits;Pomme;Poire;Coing;Pêche", ""].join("\n");
    const { groups, errors } = parseCSV(csv);
    expect(errors).toEqual([]);
    expect(groups).toEqual([{ cat: "Fruits", words: ["Pomme", "Poire", "Coing", "Pêche"] }]);
  });

  it("handles Windows line endings", () => {
    const csv = ["categorie;mot1;mot2;mot3;mot4", "Fruits;Pomme;Poire;Coing;Pêche"].join("\r\n");
    const { groups, errors } = parseCSV(csv);
    expect(errors).toEqual([]);
    expect(groups).toEqual([{ cat: "Fruits", words: ["Pomme", "Poire", "Coing", "Pêche"] }]);
  });

  it("parses 1000 valid groups in under a second", () => {
    const header = "categorie;mot1;mot2;mot3;mot4";
    const rows = Array.from({ length: 1000 }, (_, i) => `Cat${i};Mot${i}a;Mot${i}b;Mot${i}c;Mot${i}d`);
    const csv = [header, ...rows].join("\n");

    const start = performance.now();
    const { groups, errors } = parseCSV(csv);
    const elapsed = performance.now() - start;

    expect(groups).toHaveLength(1000);
    expect(errors).toEqual([]);
    expect(elapsed).toBeLessThan(1000);
  });
});

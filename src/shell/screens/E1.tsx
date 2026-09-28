import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "../../design-system";
import { loadLibrary, parseCSV, saveLibrary } from "../../library";
import type { Library } from "../../library";
import type { ScreenProps } from "../ScreenSwitcher";
import "./E1.css";

interface ImportReport {
  count: number;
  errors: number[];
}

const MAX_VISIBLE_ERROR_LINES = 12;

function pluralize(count: number, suffix = "s"): string {
  return count > 1 ? suffix : "";
}

/** E1 (Accueil): default/imported word library status and entry points into the app. */
export function E1({ onNavigate }: ScreenProps) {
  const [library, setLibrary] = useState<Library>(() => loadLibrary());
  const [report, setReport] = useState<ImportReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryCount = new Set(library.groups.map((group) => group.cat)).size;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    file.text().then((text) => {
      const { groups, errors } = parseCSV(text);
      setReport({ count: groups.length, errors });
      if (groups.length > 0) {
        const imported: Library = { groups, source: file.name };
        saveLibrary(imported);
        setLibrary(imported);
      }
    });
  }

  const reportLine = report
    ? report.count > 0
      ? `${report.count} groupes importés, ${report.errors.length} ligne${pluralize(report.errors.length)} ignorée${pluralize(report.errors.length)}`
      : "Aucun groupe valide : la bibliothèque actuelle est conservée."
    : null;

  const reportErrorsLine =
    report && report.errors.length > 0
      ? `Moins de 4 mots : ligne${pluralize(report.errors.length)} ${report.errors
          .slice(0, MAX_VISIBLE_ERROR_LINES)
          .join(", ")}${report.errors.length > MAX_VISIBLE_ERROR_LINES ? "…" : ""}`
      : null;

  return (
    <section className="e1">
      <div className="e1__intro">
        <span className="e1__pill">Jeu d'ambiance · 3 à 20 joueurs</span>
        <h1 className="e1__title">Imposteur</h1>
        <p className="body e1__tagline">
          Un seul appareil, passé de main en main. Chacun reçoit un mot secret. Certains n'ont pas tout à fait le
          même. Démasquez-les.
        </p>
      </div>
      <div className="e1__panel-col">
        <div className="e1__library">
          <span className="caption e1__library-label">Bibliothèque de mots</span>
          <div className="e1__library-count">
            <span className="e1__library-count-num">{library.groups.length}</span>
            <span className="label">groupes · {categoryCount} catégories</span>
          </div>
          <span className="caption e1__library-source">
            {library.source ? `Importée depuis ${library.source}` : "Bibliothèque d’exemple intégrée"}
          </span>
          {report && (
            <div className="e1__report">
              <span className="label">{reportLine}</span>
              {reportErrorsLine && <span className="caption e1__report-errors">{reportErrorsLine}</span>}
            </div>
          )}
        </div>
        <Button variant="primary" onClick={() => onNavigate("E2")}>
          Nouvelle partie
        </Button>
        <div className="e1__actions-row">
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Importer des mots
          </Button>
          <Button variant="secondary" onClick={() => onNavigate("regles")}>
            Règles
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="e1__file-input"
          aria-label="Importer des mots"
        />
        <span className="caption e1__hint">
          CSV UTF-8 · séparateur « ; » ou « , » · colonnes categorie ; mot1 … mot6
        </span>
      </div>
    </section>
  );
}

import "./Regles.css";

interface RoleCard {
  role: "civil" | "imposteur" | "mr-white";
  label: string;
  text: string;
}

const ROLE_CARDS: RoleCard[] = [
  {
    role: "civil",
    label: "Civil",
    text: "Voit le mot commun à tous les civils. Ne connaît pas son rôle. Doit éliminer tous les infiltrés.",
  },
  {
    role: "imposteur",
    label: "Imposteur",
    text: "Voit un mot proche, partagé avec les autres imposteurs. Il se croit civil. Doit survivre.",
  },
  {
    role: "mr-white",
    label: "Mr. White",
    text: "Ne voit aucun mot et le sait. S'il est éliminé, il peut gagner en devinant le mot des civils.",
  },
];

/** Règles (F20): static rules screen reachable from E1, explaining roles, turn flow and victory conditions. "Retour" is the shell TopBar's back slot (wired in App.tsx), like "Abandonner" on E6. */
export function Regles() {
  return (
    <section className="regles">
      <h1 className="title regles__title">Règles du jeu</h1>
      <div className="regles__roles">
        {ROLE_CARDS.map(({ role, label, text }) => (
          <div key={role} className="regles__role-card">
            <span className={`regles__role-pill regles__role-pill--${role}`}>{label}</span>
            <p className="body regles__role-text">{text}</p>
          </div>
        ))}
      </div>
      <div className="regles__columns">
        <div className="regles__column">
          <h2 className="heading regles__heading">Déroulement</h2>
          <ol className="body regles__list">
            <li>Chacun touche son prénom, découvre son mot en privé, le cache, puis passe l'appareil.</li>
            <li>L'application désigne qui commence. Chacun dit à voix haute un mot qui évoque le sien.</li>
            <li>La table débat et vote à l'oral. On peut aussi n'éliminer personne.</li>
            <li>Le joueur éliminé révèle son rôle. Une élimination est définitive.</li>
          </ol>
        </div>
        <div className="regles__column">
          <h2 className="heading regles__heading">Victoire</h2>
          <ul className="body regles__list">
            <li>
              <b>Civils</b> : tous les imposteurs et Mr. White sont éliminés.
            </li>
            <li>
              <b>Infiltrés</b> : autant de civils que d'infiltrés encore en vie (parité).
            </li>
            <li>
              <b>Mode Nombre de tours</b> : les infiltrés gagnent aussi si l'un d'eux survit jusqu'à la fin du tour N.
            </li>
            <li>
              <b>Chance finale</b> : quand les infiltrés gagnent, chaque Mr. White encore en vie tente de deviner le
              mot des civils, pour l'honneur.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

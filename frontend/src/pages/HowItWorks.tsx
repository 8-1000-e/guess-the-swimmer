import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "@/components/AppShell";
import Surface from "@/components/ui/Surface";
import { api } from "@/api/client";
import { ROUTES } from "@/api/routes";
import type { Round } from "@/types/game";

const DEMO = [
  { letter: "v", state: "correct" },
  { letter: "d", state: "absent" },
  { letter: "u", state: "present" },
  { letter: "r", state: "absent" },
  { letter: "y", state: "correct" },
];

const STEPS = [
  {
    title: "Une cible par jour",
    text: "Chaque matin, le login d’un autre piscineux est tiré au hasard. Personne d’autre n’a la même.",
  },
  {
    title: "Devine son login",
    text: "Autant d’essais que tu veux, mais chacun compte. Une proposition doit être un login existant, de la même longueur.",
  },
  {
    title: "Va le voir en vrai",
    text: "Trouvé, tu obtiens un QR code. C’est la personne elle-même qui le scanne, depuis son compte 42.",
  },
];

const RULES = [
  "À minuit, heure de Paris, la manche du jour se termine, trouvée ou non.",
  "Une cible signée ne retombe jamais. Une cible non signée, si.",
  "Le staff joue aussi, et peuvent te tomber comme cible.",
  "Une capture d’écran du QR ne sert à rien : le code change toutes les 30 secondes et c’est le compte du scanneur qui compte.",
];

export default function HowItWorks() {
  const [bonus, setBonus] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<Round>(ROUTES.game.round)
      .then((r) => setBonus(r.signBonus))
      .catch(() => setBonus(null));
  }, []);

  return (
    <AppShell>
      <main className="page">
        <header className="page-head">
          <h1 className="page-title">Comment ça marche</h1>
          <p className="page-sub">
            Vous êtes une quarantaine et vous ne vous connaissez pas encore. Ce
            jeu sert à changer ça.
          </p>
        </header>

        <ol className="how-steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Surface className="how-step">
                <span className="how-num mono">{i + 1}</span>
                <div>
                  <h2 className="how-title">{s.title}</h2>
                  <p className="how-text">{s.text}</p>
                </div>
              </Surface>
            </li>
          ))}
        </ol>

        <h2 className="section-title">Les couleurs</h2>
        <Surface className="how-colors">
          <div className="how-tiles" aria-hidden="true">
            {DEMO.map((c, i) => (
              <span key={i} className={`tile ${c.state}`}>
                {c.letter}
              </span>
            ))}
          </div>
          <ul className="how-legend">
            <li>
              <i className="chip correct" /> la lettre est à la bonne place
            </li>
            <li>
              <i className="chip present" /> elle est dans le login, ailleurs
            </li>
            <li>
              <i className="chip absent" /> elle n’y est pas
            </li>
          </ul>
        </Surface>

        <h2 className="section-title">Le classement</h2>
        <Surface className="how-score">
          <p className="how-text">
            On compte d’abord les cibles <strong>signées</strong>, puis les
            cibles <strong>trouvées</strong>, et le nombre d’essais départage.
            Le plus bas gagne.
          </p>
          <p className="how-text">
            Chaque signature efface {bonus ?? "un"} essai
            {bonus && bonus > 1 ? "s" : ""} de ton total. C’est ce qui
            récompense d’aller parler aux gens plutôt que de deviner vite.
          </p>
        </Surface>

        <h2 className="section-title">À savoir</h2>
        <Surface as="ul" className="how-rules">
          {RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </Surface>

        <p className="how-cta">
          <Link to="/" className="btn-glass">
            Voir ma cible du jour
          </Link>
        </p>
      </main>
    </AppShell>
  );
}

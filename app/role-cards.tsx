// The four roles the game deals out each round. A quiet, non-looping
// entrance animation — the randomness of who gets which role is the whole
// game; we don't need to re-simulate it with a gimmicky flip loop here.

const ROLES = [
  {
    id: "raja",
    label: "राजा",
    en: "King",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18h18" />
        <path d="M4 18l-1-9 4.5 3.5L12 5l4.5 7.5L21 9l-1 9" />
      </svg>
    )
  },
  {
    id: "mantri",
    label: "मंत्री",
    en: "Minister",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4h11a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z" />
        <path d="M9 9h4" />
        <path d="M9 13h4" />
      </svg>
    )
  },
  {
    id: "chor",
    label: "चोर",
    en: "Thief",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 13c0-4.5 3.5-8 8-8s8 3.5 8 8" />
        <path d="M3 13h18" />
        <path d="M9 13v2" />
        <path d="M15 13v2" />
        <path d="M7 13a5 5 0 0 1 10 0" />
      </svg>
    )
  },
  {
    id: "sipahi",
    label: "सिपाही",
    en: "Soldier",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
        <path d="M9.5 12l1.75 1.75L14.5 10" />
      </svg>
    )
  }
] as const;

export default function RoleCards() {
  return (
    <div className="role-cards" aria-hidden="true">
      {ROLES.map((role) => (
        <div className="role-card" data-role={role.id} key={role.id}>
          <div className="role-card-icon">{role.icon}</div>
          <span className="role-card-label">{role.label}</span>
          <span className="role-card-en">{role.en}</span>
        </div>
      ))}
    </div>
  );
}

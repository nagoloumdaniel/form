import type { ReactNode } from "react";

/** Champ avec un bouton logé à droite, sans décaler la hauteur du champ. */
export function InputWithAction({ children, action }: { children: ReactNode; action: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-y-0 right-1 flex items-center">{action}</div>
    </div>
  );
}

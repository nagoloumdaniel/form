"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

import { postJson } from "@/lib/api/client";

import { Button } from "../ui/button";

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="quiet"
      pending={pending}
      onClick={() => {
        setPending(true);
        void Promise.all([
          postJson("/api/auth/logout", {}),
          new Promise((resolve) => window.setTimeout(resolve, 2000)),
        ]).then(() => window.location.replace("/login"));
      }}
    >
      {!pending ? <LogOut aria-hidden className="size-4" /> : null}
      {pending ? "Déconnexion" : "Se déconnecter"}
    </Button>
  );
}

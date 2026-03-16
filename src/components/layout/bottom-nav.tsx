"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, User } from "lucide-react";

const links = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/matches", icon: Calendar, label: "Jogos" },
  { href: "/narrators", icon: Users, label: "Narradores" },
  { href: "/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 text-[10px] transition-colors ${
                active ? "text-green-500" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

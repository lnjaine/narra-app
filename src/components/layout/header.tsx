"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Mic, Radio, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Radio className="w-6 h-6 text-green-500" />
          <span className="text-lg font-bold tracking-tight">narra</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/matches"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Jogos
          </Link>
          <Link
            href="/narrators"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Narradores
          </Link>
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  {(profile?.role === "narrator" || profile?.role === "both") && (
                    <Link href="/studio">
                      <Button variant="secondary" size="sm">
                        <Mic className="w-4 h-4" />
                        Estudio
                      </Button>
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="w-7 h-7 rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Button onClick={signInWithGoogle} size="sm">
                  Entrar com Google
                </Button>
              )}
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-zinc-400"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-3">
          <Link
            href="/matches"
            onClick={() => setMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-white"
          >
            Jogos
          </Link>
          <Link
            href="/narrators"
            onClick={() => setMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-white"
          >
            Narradores
          </Link>
          {user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="block text-sm text-zinc-300 hover:text-white"
              >
                Meu Perfil
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="block text-sm text-red-400"
              >
                Sair
              </button>
            </>
          ) : (
            <Button onClick={signInWithGoogle} size="sm" className="w-full">
              Entrar com Google
            </Button>
          )}
        </div>
      )}
    </header>
  );
}

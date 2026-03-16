import Link from "next/link";
import { Radio, Mic, Headphones, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center relative">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">Ao vivo agora</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            Muta a TV.
            <br />
            <span className="text-green-500">Escolha a narração favorita.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Troque a narração chata da TV por comentaristas que você ama.
            Ao vivo, sincronizado, no seu celular.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/matches"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-green-600 transition-colors text-lg"
            >
              <Headphones className="w-5 h-5" />
              Ver jogos ao vivo
            </Link>
            <Link
              href="/narrators"
              className="inline-flex items-center justify-center gap-2 bg-zinc-800 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700 text-lg"
            >
              <Mic className="w-5 h-5" />
              Quero narrar
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">
          Como funciona
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Radio,
              title: "1. Escolha o jogo",
              description:
                "Veja os jogos ao vivo e os que estão por vir. Brasileirão, Copa do Brasil, e mais.",
            },
            {
              icon: Mic,
              title: "2. Escolha o narrador",
              description:
                "Influenciadores, técnicos, humoristas — cada um com seu estilo. Você decide quem narra.",
            },
            {
              icon: Zap,
              title: "3. Sincronize e ouça",
              description:
                "Mute a TV, toque 'Sync' no início do jogo e pronto. A voz do narrador acompanha o jogo.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-zinc-400 text-sm">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            A revolução da narração começa aqui
          </h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Assim como o streaming libertou o video da grade da TV, o Narra
            liberta a narração do monopólio dos narradores de TV.
          </p>
          <Link
            href="/matches"
            className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-medium px-8 py-3 rounded-xl hover:bg-green-600 transition-colors"
          >
            Começar a ouvir
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Radio className="w-4 h-4" />
            <span className="text-sm">Narra &copy; 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/matches" className="hover:text-zinc-300">
              Jogos
            </Link>
            <Link href="/narrators" className="hover:text-zinc-300">
              Narradores
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

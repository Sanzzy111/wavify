"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/search", label: "Search", icon: "🔍" },
  { href: "/playlist", label: "Playlists", icon: "🎼" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-black/40 border-r border-white/5 flex flex-col py-6 px-3">
      {/* Logo */}
      <div className="px-3 mb-8">
        <h1 className="text-xl font-black text-white tracking-tight">
          Wave<span className="text-emerald-400">fy</span>
        </h1>
        <p className="text-white/20 text-xs mt-0.5">Music for everyone</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {nav.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
              ${pathname === href
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto px-3">
        <p className="text-white/10 text-xs">Powered by Last.fm & Deezer</p>
      </div>
    </aside>
  );
}

"use client";

export function Footer() {
  return (
    <footer id="visiter" className="relative bg-blueboy-mid border-t border-cream/5 py-16 px-6 md:px-12 lg:px-20 overflow-hidden">
      {/* Background text */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(6rem,18vw,16rem)] font-black leading-none tracking-tighter select-none pointer-events-none"
        style={{
          fontFamily: "Playfair Display, serif",
          WebkitTextStroke: "1px rgba(255,248,240,0.03)",
          color: "transparent",
        }}
      >
        Blueboy
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div>
            <h3
              className="text-2xl font-bold text-cream mb-3"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <span className="gradient-text-pink italic">Le</span> Blueboy
            </h3>
            <p className="text-cream/40 text-sm leading-relaxed max-w-xs">
              Artisan glacier à Montréal. Une expérience glacée comme jamais vue.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-cream/30 text-xs uppercase tracking-[0.25em] mb-5">Menu</h4>
            <ul className="space-y-3">
              {["Sundaes", "Soft Serve", "Glaces Dures", "Boissons", "Churros", "Spéciaux"].map((item) => (
                <li key={item}>
                  <a
                    href="https://le-blueboy-artisan-glacier.wheree.com/menu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cream/50 hover:text-cream text-sm transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-cream/30 text-xs uppercase tracking-[0.25em] mb-5">Visiter</h4>

            {/* Address */}
            <a
              href="https://maps.google.com/?q=Le+Blueboy+Artisan+Glacier+Montreal"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-cream/50 hover:text-cream text-sm leading-relaxed transition-colors mb-5"
            >
              4567 Rue Saint-Denis<br />
              Montréal, QC H2J 2L4
            </a>

            {/* Hours */}
            <div className="mb-5">
              <p className="text-cream/30 text-[10px] uppercase tracking-[0.2em] mb-2">Horaires</p>
              <p className="text-cream/50 text-sm leading-relaxed">
                Lun – Jeu · 12h – 22h<br />
                Ven – Sam · 12h – 23h<br />
                Dim · 12h – 21h
              </p>
            </div>

            {/* Phone */}
            <a
              href="tel:+15145550101"
              className="block text-cream/50 hover:text-cream text-sm transition-colors mb-6"
            >
              (514) 555-0101
            </a>

            <a
              href="https://le-blueboy-artisan-glacier.wheree.com/menu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-cream/60 hover:text-cream text-sm transition-all duration-200 hover:border-cream/20"
            >
              Commander en ligne →
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-cream/5 gap-4">
          <p className="text-cream/20 text-xs">
            © 2025 Le Blueboy Artisan Glacier. Tous droits réservés.
          </p>
          <div className="flex items-center gap-1">
            {["#FF6B9D", "#9B59B6", "#00C9B1", "#F4C430", "#FF8C42"].map((color) => (
              <div
                key={color}
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
              />
            ))}
          </div>
          <p className="text-cream/20 text-xs">
            Fait avec ❤️ à Montréal
          </p>
        </div>
      </div>
    </footer>
  );
}

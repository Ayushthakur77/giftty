const fs = require('fs');

let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// Replace Hero section
const heroMatch = /<section className="relative w-full h-\[600px\].*?<\/section>/s;
const newHero = `
      {/* Dynamic Sections */}
      {sectionsOrder.map((section: string) => {
        if (section === 'Hero') {
          const heroBanners = banners.filter((b: any) => b.type === 'HERO' || b.type === 'HOMEPAGE');
          const heroBanner = heroBanners.length > 0 ? heroBanners[0] : { 
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHtzcJU-iqHsTmj3cnQl8Mt0qypZAx1xTKKgTVPaRI4as9SvOC-i3OGnfk8RFjMO-Ru21eNwWGWk6KeyWZR6zM66P29YD01KoX9AIgD0YwiyjrXOuj9YBg8UHOTJb2L3GErBAd2mskCsH2q-d0J67x_p4BDl7annG_aChlpljBkE4muf5ElR6nhEGkzHQZ2---YPq39Wo7zts4LtrW40UnCZxShpcqr4n7YIUZGaPHGW9TQvg94HTRTw",
            title: "Thoughtful Gifts for Every Occasion",
            subtitle: "Discover curated gift boxes designed to bring joy and create lasting memories."
          };
          
          return (
            <section key="hero" className="relative w-full h-[600px] md:h-[800px] overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div 
                  className="w-full h-full bg-cover bg-center" 
                  style={{ backgroundImage: \`url('\${heroBanner.image}')\` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent md:from-background/60"></div>
              </div>
              
              <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
                <div className="max-w-xl">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 tracking-wide backdrop-blur-sm border border-primary/20">
                    <Sparkles className="inline-block w-4 h-4 mr-2" />
                    Premium Gifting Experience
                  </span>
                  
                  <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                    {heroBanner.title || "Thoughtful Gifts for Every Occasion"}
                  </h1>
                  
                  <p className="text-lg md:text-xl text-foreground/80 mb-10 leading-relaxed max-w-lg">
                    {heroBanner.subtitle || "Discover curated gift boxes designed to bring joy and create lasting memories."}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link 
                      to={heroBanner.link || "/shop"}
                      className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-lg text-center hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-1"
                    >
                      Shop Now
                    </Link>
                    <Link 
                      to="/builder"
                      className="px-8 py-4 bg-surface text-foreground border border-outline rounded-full font-medium text-lg text-center hover:bg-surface-dim transition-all hover:-translate-y-1"
                    >
                      Build Your Own Box
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        }
        return null;
      })}
`;

// But wait, the original Home has other sections static. I'll just rewrite the render method body for simplicity, or inject standard dynamic rendering.
// Since it's complex to regex it perfectly, I'll replace the entire return statement.

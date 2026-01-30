'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, notFound } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Menu as MenuIcon, X, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils'; 
import { Database } from '@/types/supabase'; 

gsap.registerPlugin(ScrollTrigger);

// --- TYPE DEFINITIONS ---
interface Tag { id: string; name: string; color: string; }
interface Theme { preset: 'light' | 'dark' | 'brand'; brandColor: string; }
interface MenuItem {
  id: string; name: string; description: string | null; price: number;
  image_url: string | null; is_featured: boolean | null; tags: Tag[];
}
interface MenuSection { id: string; name: string; items: MenuItem[]; }
interface Restaurant {
  id: string; name: string; description: string | null; logo_url: string | null;
  theme: Theme; menu_sections: MenuSection[];
}
// --- CONSTANTS ---
const DEFAULT_THEME: Theme = { preset: 'dark', brandColor: '#FBBF24' };

// --- UTILITY FUNCTIONS ---
function parseTheme(dbTheme: unknown): Theme {
  if (dbTheme && typeof dbTheme === 'object' && !Array.isArray(dbTheme)) {
    const themeObj = dbTheme as Record<string, unknown>;
    const theme: Theme = { ...DEFAULT_THEME };
    
    if (themeObj.preset && ['light', 'dark', 'brand'].includes(themeObj.preset as string)) {
      theme.preset = themeObj.preset as 'light' | 'dark' | 'brand';
    }
    if (themeObj.brandColor && typeof themeObj.brandColor === 'string') {
      theme.brandColor = themeObj.brandColor;
    }
    return theme;
  }
  return DEFAULT_THEME;
}

const formatCurrency = (price: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR'
}).format(price);

// --- REFACTORED SUB-COMPONENTS ---

const HeroSection = ({ name, description, accentColor, logo_url }: { name: string, description: string | null, accentColor: string, logo_url: string | null }) => (
  <header className="relative h-[90vh] overflow-hidden text-white">
    <div className="absolute inset-0 bg-black/40 z-10" />
    <Image
      src="/universal2.png" // Make sure this path is correct
      alt={`${name} interior`}
      fill
      className="object-cover opacity-30"
      priority
      unoptimized
    />
    <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-6">
      {logo_url && (
        <div className="mb-6">
          <Image src={logo_url} alt={`${name} Logo`} width={100} height={100} className="rounded-full border-4 border-white/50 shadow-lg" />
        </div>
      )}
      <h1
        className="text-5xl md:text-7xl font-bold mb-4 tracking-tight"
        style={{ color: accentColor }}
      >
        {name}
      </h1>
      <p className="text-xl md:text-2xl max-w-3xl opacity-95">
        {description}
      </p>
    </div>

    {/* ===== NEW: Scroll Down Animation ===== */}
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <span className="text-sm font-medium text-white/80 tracking-wider">MENU</span>
        <div className="arrow-bounce mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
        </div>
    </div>
    {/* ===== END: Scroll Down Animation ===== */}

  </header>
);

const StickyNavigation = ({ name, logo_url, onMenuOpen, themePreset }: { name: string, logo_url: string | null, onMenuOpen: () => void, themePreset: Theme['preset'] }) => (
  <nav className={cn(
    "sticky top-0 z-40 py-3 backdrop-blur-lg border-b",
    themePreset === 'light' ? 'bg-white/80 border-gray-200 text-gray-900' : 'bg-gray-950/70 border-gray-800 text-white'
  )}>
    <div className="container mx-auto px-4 flex justify-between items-center">
      <button
        onClick={onMenuOpen}
        className="p-2 rounded-full hover:bg-gray-500/10 transition-colors"
        aria-label="Open menu"
      >
        <MenuIcon className="w-6 h-6" />
      </button>
      <span className="font-semibold text-lg">{name}</span>
      {logo_url ? (
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
          <Image src={logo_url} alt="Logo" width={40} height={40} className="object-cover" unoptimized/>
        </div>
      ) : <div className="w-10 h-10" /> /* Placeholder for alignment */}
    </div>
  </nav>
);

const MobileNavDrawer = ({ isOpen, onClose, sections, activeSection, brandColor, themePreset }: { isOpen: boolean, onClose: () => void, sections: MenuSection[], activeSection: string | null, brandColor: string, themePreset: Theme['preset'] }) => (
  <div className={cn(
    "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity",
    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
  )} onClick={onClose}>
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "absolute top-0 left-0 h-full w-80 shadow-2xl transition-transform duration-300 ease-in-out",
        themePreset === 'light' ? 'bg-white text-gray-800' : 'bg-gray-900 text-white',
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-8 px-2">
          <h3 className="text-xl font-bold">Menu Categories</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10" aria-label="Close menu">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => {
                document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                onClose();
              }}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex justify-between items-center font-medium",
                activeSection !== section.id && (themePreset === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800')
              )}
              style={activeSection === section.id ? {
                backgroundColor: brandColor,
                color: '#fff'
              } : {}}
            >
              <span>{section.name}</span>
              <span className="text-sm opacity-70">{section.items.length}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Menu Item Card Component
 * DESIGN UPDATE: Redesigned for a more modern and presentable look.
 */
const MenuItemCard = ({ item, theme, accentColor }: { item: MenuItem; theme: Theme; accentColor: string; }) => {
  const { preset } = theme;

  return (
    <div
      className={cn(
        "menu-item flex flex-col rounded-xl overflow-hidden transition-all duration-300 ease-in-out group",
        "hover:shadow-lg hover:-translate-y-1",
        {
          "bg-white shadow-md text-gray-800": preset === "light",
          "bg-gray-800/50 border border-gray-700/50 shadow-lg text-white": preset === "dark",
          "bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white": preset === "brand"
        }
      )}
    >
      {item.image_url && (
        <div className="relative h-80 w-full">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
          {item.is_featured && (
            <div
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-sm"
              style={{
                backgroundColor: `${accentColor}20`, // Semi-transparent accent
                color: accentColor
              }}
            >
              <Star size={14} fill={accentColor} />
              <span>Chef&#39;s Special</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col flex-grow p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold pr-4 transition-colors group-hover:text-amber-400">
            {item.name}
          </h3>
          <p
            className="text-md font-semibold transition-colors whitespace-nowrap"
            // style={{ color: accentColor }}
          >
            {formatCurrency(item.price)}
          </p>
        </div>

        {item.description && (
          <p className="text-sm opacity-70 mb-4 flex-grow">
            {item.description}
          </p>
        )}

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-white/10">
            {item.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---
export default function RestaurantMenu() {
  const params = useParams();
  const slug = params.slug as string;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch restaurant data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select(`id, name, description, logo_url, theme,
            menu_sections(id, name,
              items:menu_items(id, name, description, price, image_url, is_featured,
                tags:menu_item_tags(tags(id, name, color))
              )
            )`)
          .eq('subdomain', slug)
          .single();

        if (error || !data) {
          return notFound();
        }

        const parsedTheme = parseTheme(data.theme);
        const parsedSections = data.menu_sections?.map(section => ({
          ...section,
          items: section.items?.map(item => ({
            ...item,
            tags: item.tags?.map(tagJoin => tagJoin.tags).filter(Boolean) as Tag[],
            image_url: item.image_url || `https://placehold.co/600x400/333/white?text=${encodeURIComponent(item.name)}`
          })) ?? []
        })) ?? [];
        
        if (parsedSections.length > 0) {
            setActiveSection(parsedSections[0].id);
        }

        setRestaurant({
          ...data,
          theme: parsedTheme,
          menu_sections: parsedSections
        });
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, supabase]);

  // GSAP Animations
  useGSAP(() => {
    if (!restaurant || loading) return;

    restaurant.menu_sections.forEach(section => {
      ScrollTrigger.create({
        trigger: `#section-${section.id}`,
        start: "top 25%",
        end: "bottom 25%",
        onToggle: self => self.isActive && setActiveSection(section.id),
      });
    });

  }, { dependencies: [restaurant, loading], scope: containerRef });

  if (loading) return <div className="fixed inset-0 bg-gray-950 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400"></div></div>;
  if (!restaurant) return notFound();

  const { theme, menu_sections } = restaurant;
  const { preset, brandColor } = theme;
  const isBrandTheme = preset === 'brand';
  const accentColor = isBrandTheme ? 'white' : brandColor;

  return (
    <div
      ref={containerRef}
      className={cn("min-h-screen font-sans antialiased", {
        'bg-gray-100 text-gray-900': preset === 'light',
        'bg-gray-950 text-white': preset === 'dark',
        'text-white': preset === 'brand'
      })}
      style={isBrandTheme ? { backgroundColor: brandColor } : {}}
    >
      <HeroSection name={restaurant.name} description={restaurant.description} accentColor={accentColor} logo_url={restaurant.logo_url} />

      <StickyNavigation name={restaurant.name} logo_url={restaurant.logo_url} onMenuOpen={() => setIsNavOpen(true)} themePreset={preset} />

      <MobileNavDrawer isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} sections={menu_sections} activeSection={activeSection} brandColor={brandColor} themePreset={preset} />

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="space-y-16">
          {menu_sections.map(section => (
            <section key={section.id} id={`section-${section.id}`} className="menu-item-section">
              <h2 className="text-3xl md:text-4xl transition-colors font-bold mb-8" >
                {section.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {section.items.map(item => (
                  <MenuItemCard key={item.id} item={item} theme={theme} accentColor={brandColor} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={cn(
          "fixed bottom-6 right-6 p-3 rounded-full shadow-lg transition-all hover:scale-110 z-30",
          {
              'bg-gray-900 text-white': preset === 'light',
              'bg-amber-400 text-gray-900': preset === 'dark',
              'bg-white/20 backdrop-blur-sm border border-white/20 text-white': preset === 'brand'
          }
        )}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}


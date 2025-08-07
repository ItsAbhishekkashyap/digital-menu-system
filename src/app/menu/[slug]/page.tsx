'use client'; // GSAP requires this to be a client component

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Define the shape of our data
interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  menu_sections: MenuSection[];
}

// Helper function to format currency
const formatCurrency = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Change this to your desired currency
  }).format(price);
};

export default function PublicMenuPage({ params }: { params: { slug: string } }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const container = useRef(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          id, name, description,
          menu_sections (
            id, name,
            items:menu_items (id, name, description, price, image_url)
          )
        `)
        .eq('subdomain', params.slug)
        .order('sort_order', { foreignTable: 'menu_sections', ascending: true })
        .order('sort_order', { foreignTable: 'menu_sections.menu_items', ascending: true })
        .single();

      if (error || !data) {
        console.error('Error fetching restaurant:', error);
        notFound();
      } else {
        setRestaurant(data as Restaurant);
      }
      setLoading(false);
    };

    fetchRestaurant();
  }, [params.slug, supabase]);

  // GSAP Animations Hook
  useGSAP(() => {
    if (!loading && restaurant) {
      gsap.from('.header-title', { duration: 1, y: -50, opacity: 0, ease: 'power3.out' });
      gsap.from('.header-desc', { duration: 1, y: -30, opacity: 0, ease: 'power3.out', delay: 0.3 });
      gsap.from('.menu-section', {
        duration: 0.8,
        y: 100,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.6
      });
      // FIX: Added a type guard to safely handle the 'unknown' type from GSAP's toArray
      gsap.utils.toArray('.menu-section').forEach((section: unknown) => {
        if (section instanceof Element) {
          gsap.from(section.querySelectorAll('.menu-item'), {
            duration: 0.6,
            y: 50,
            opacity: 0,
            stagger: 0.1,
            ease: 'power2.out',
            delay: 1
          });
        }
      });
    }
  }, { scope: container, dependencies: [loading, restaurant] });

  if (loading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <p className="text-3xl">Loading Menu...</p>
      </div>
    );
  }

  if (!restaurant) {
    return notFound();
  }

  return (
    // RESPONSIVE FIX: Adjusted padding for different screen sizes
    <div ref={container} className="bg-gray-900 text-white min-h-screen font-sans p-4 sm:p-6 md:p-8 overflow-hidden">
      <header className="text-center mb-12">
        {/* RESPONSIVE FIX: Adjusted font sizes */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2 header-title">{restaurant.name}</h1>
        {restaurant.description && (
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto header-desc">{restaurant.description}</p>
        )}
      </header>

      {/* RESPONSIVE FIX: Updated grid columns for tablets (md), laptops (lg), and TVs */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {restaurant.menu_sections.map((section) => (
          <div key={section.id} className="bg-gray-800 p-6 rounded-lg shadow-lg menu-section">
            {/* RESPONSIVE FIX: Adjusted font sizes */}
            <h2 className="text-3xl lg:text-4xl font-bold border-b-4 border-yellow-400 pb-4 mb-6">
              {section.name}
            </h2>
            <div className="space-y-6">
              {section.items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 menu-item">
                  {item.image_url && (
                    // RESPONSIVE FIX: Adjusted image size for smaller screens
                    <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill={true}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex justify-between items-baseline">
                      {/* RESPONSIVE FIX: Adjusted font sizes */}
                      <h3 className="text-2xl lg:text-3xl font-semibold">{item.name}</h3>
                      <p className="text-2xl lg:text-3xl font-bold text-yellow-400">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    {item.description && (
                      <p className="text-base lg:text-lg text-gray-400 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

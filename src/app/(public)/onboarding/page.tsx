'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Session } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';



// --- NEW AUTHENTICATION COMPONENT ---
const AuthButtons = () => {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Redirect to home after sign out
  };

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition px-4 py-2 rounded-full hover:bg-white/10">
          Dashboard
        </Link>
        <button
          onClick={handleSignOut}
          className="text-sm font-medium cta-button text-white px-2 py-2 rounded-full transition"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition hidden sm:block px-4 py-2 rounded-full hover:bg-white/10">
        Sign In
      </Link>
      <Link href="/signup" className="text-sm font-medium cta-button text-white px-5 py-2 rounded-full transition">
        Get Started
      </Link>
    </div>
  );
};


// --- SVG ICONS ---
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11.08V8l-6-6H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6" /><path d="M14 3v5h5" /><path d="M18 21v-6" /><path d="M15 18h6" /></svg>
);
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" /></svg>
);
const TwitterIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.223.085a4.93 4.93 0 004.6 3.42 9.86 9.86 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
);
const InstagramIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.44c-3.117 0-3.483.01-4.71.068-2.825.13-4.004 1.31-4.138 4.138-.058 1.226-.069 1.582-.069 4.695 0 3.112.01 3.468.068 4.694.134 2.826 1.312 4.004 4.138 4.138 1.226.058 1.592.068 4.71.068 3.117 0 3.483-.01 4.71-.068 2.826-.134 4.004-1.312 4.138-4.138.058-1.226.068-1.582.068-4.694 0-3.113-.01-3.469-.068-4.695-.134-2.826-1.312-4.004-4.138-4.138C15.483 3.613 15.117 3.603 12 3.603zm0 4.885a3.512 3.512 0 100 7.024 3.512 3.512 0 000-7.024zM12 14a2 2 0 110-4 2 2 0 010 4zm6.406-7.87a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" /></svg>
);
const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);


const SmartphoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
const TvIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>;
const QrCodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><line x1="14" y1="14" x2="14.01" y2="14"></line><line x1="17.5" y1="14" x2="17.51" y2="14"></line><line x1="14" y1="17.5" x2="14.01" y2="17.5"></line><line x1="17.5" y1="17.5" x2="17.51" y2="17.5"></line><line x1="21" y1="17.5" x2="21.01" y2="17.5"></line><line x1="17.5" y1="21" x2="17.51" y2="21"></line><line x1="21" y1="21" x2="21.01" y2="21"></line></svg>;
const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const PaletteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.477-1.125-.297-.29-.702-.465-1.17-.465-1.072 0-1.946-.874-1.946-1.947s.874-1.947 1.946-1.947c.47 0 .875.176 1.17.465.297.29.477.688.477 1.125C13.648 16.254 12.926 17 12 17c-2.757 0-5-2.243-5-5s2.243-5 5-5c4.237 0 6.81 2.182 7.86 5.083"></path></svg>;

const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;




// --- PAGE STYLES & ANIMATIONS ---
const PageStyles = () => (
  <style jsx global>{`
        .gradient-text {
            background: linear-gradient(90deg, #F59E0B, #EF4444);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .cta-button {
            background: linear-gradient(90deg, #EF4444, #F59E0B);
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);
        }
        .feature-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            transition: all 0.3s ease;
        }
        .feature-card:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-5px);
        }
        .glass-effect {
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .hero-gradient {
            background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(239, 68, 68, 0.3), transparent);
        }
        @media (min-width: 1024px) {
            .hero-gradient {
                background: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(239, 68, 68, 0.3), transparent);
            }
        }
        /* Animation Classes */
        .fade-in-section {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in-section.is-visible {
            opacity: 1;
            transform: translateY(0);
        }
    `}</style>
);

export default function OnboardingPage() {
  const features = [
    { icon: <SmartphoneIcon />, title: 'Mobile First Design', desc: 'Perfectly optimized for smartphone users' },
    { icon: <TvIcon />, title: 'TV Screen Mode', desc: 'Auto-adjusts for large display viewing' },
    { icon: <ImageIcon />, title: 'High-Res Images', desc: 'Showcase your dishes beautifully' },
    { icon: <LinkIcon />, title: 'Unique Shareable Link', desc: 'Easy to share with customers' },
    { icon: <QrCodeIcon />, title: 'QR Code', desc: 'Printable for tabletop access' },
    { icon: <ZapIcon />, title: 'Live Updates', desc: 'Change your menu in real-time' },
    { icon: <PaletteIcon />, title: 'Custom Themes', desc: 'Match your restaurant branding' },
   
    { icon: <GlobeIcon />, title: 'No App Required', desc: 'Works directly in any browser' },
  ];

  // --- ANIMATION HOOK ---
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach(section => observer.observe(section));

    return () => sections.forEach(section => observer.unobserve(section));
  }, []);


  const footerRef = useRef<HTMLElement>(null);
  const footerContentRef = useRef<HTMLDivElement>(null); // Ref for the content

  useEffect(() => {
    const footer = footerRef.current;
    const footerContent = footerContentRef.current;
    if (!footer || !footerContent) return;

    const pos = { x: 0, y: 0 };

    const xContentTo = gsap.quickTo(footerContent, "x", { duration: 1.2, ease: "power3.out" });
    const yContentTo = gsap.quickTo(footerContent, "y", { duration: 1.2, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const rect = footer.getBoundingClientRect();

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      gsap.to(pos, {
        x: x,
        y: y,
        duration: 0.7,
        ease: "power3.out",
        onUpdate: () => {
          footer.style.setProperty('--x', `${pos.x}px`);
          footer.style.setProperty('--y', `${pos.y}px`);
        }
      });

      const parallaxX = (clientX / window.innerWidth - 0.5) * -40;
      const parallaxY = (clientY / window.innerHeight - 0.5) * -40;
      xContentTo(parallaxX);
      yContentTo(parallaxY);
    };

    const handleMouseEnter = () => {
      // FIX: Smaller circle size for a more subtle effect
      gsap.to(footer, { '--size': '150px', duration: 0.7, ease: 'power3.out' });
    }

    const handleMouseLeave = () => {
      gsap.to(footer, { '--size': '0px', duration: 0.7, ease: 'power3.out' });
      xContentTo(0);
      yContentTo(0);
    }

    footer.addEventListener('mousemove', handleMouseMove);
    footer.addEventListener('mouseenter', handleMouseEnter);
    footer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      footer.removeEventListener('mousemove', handleMouseMove);
      footer.removeEventListener('mouseenter', handleMouseEnter);
      footer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);



  return (
    <>
      <PageStyles />
      <div className="bg-gray-950 text-gray-200 antialiased min-h-screen">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
           <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-white flex items-center">
              <span className="text-orange-500 mr-1">✦</span>Menu<span className="gradient-text">Luxe</span>
            </Link>
            
            {/* ===== UPDATED: DYNAMIC AUTH BUTTONS ===== */}
            <AuthButtons />

          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-40 pb-28 lg:pt-52 lg:pb-36 text-center overflow-hidden">
          <div className="absolute inset-0 hero-gradient"></div>
          <div className="absolute inset-0 opacity-10">
            <Image
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
              alt="Restaurant background"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="container mx-auto px-4 relative">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 max-w-4xl mx-auto">
              Elevate Your <span className="gradient-text">Dining Experience</span> with Digital Menus
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-10">
              Transform your restaurant service with stunning, interactive menus that work perfectly on any device.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link href="/signup" className="cta-button inline-flex items-center justify-center text-white font-bold px-8 py-4 rounded-full text-lg">
                Create My Menu <ArrowRight />
              </Link>
              <Link href="menu/thecornercourtyard" className="inline-flex items-center justify-center text-white border border-gray-600 hover:border-gray-500 font-medium px-8 py-4 rounded-full text-lg hover:bg-gray-900/50 transition">
                View Demo
              </Link>
            </div>
            <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
              <div className="aspect-video w-full relative">
                <Image
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop"
                  alt="Digital Menu Preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-gray-950/20"></div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-900/50 relative fade-in-section">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5"></div>
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple Setup, Stunning Results</h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">Get your digital menu live in minutes, not hours.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="feature-card p-8 rounded-xl text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 mx-auto mb-6">
                  <UserIcon />
                </div>
                <h3 className="font-semibold text-xl text-white mb-3">1. Create Account</h3>
                <p className="text-gray-400">Register your restaurant in just a few clicks with our simple onboarding.</p>
              </div>
              <div className="feature-card p-8 rounded-xl text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 mx-auto mb-6">
                  <MenuIcon />
                </div>
                <h3 className="font-semibold text-xl text-white mb-3">2. Build Your Menu</h3>
                <p className="text-gray-400">Add categories, items, prices, and mouth-watering images with our intuitive editor.</p>
              </div>
              <div className="feature-card p-8 rounded-xl text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 mx-auto mb-6">
                  <ShareIcon />
                </div>
                <h3 className="font-semibold text-xl text-white mb-3">3. Share & Enjoy</h3>
                <p className="text-gray-400">Get your unique QR code and link to share with customers instantly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-950 fade-in-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Premium Features</h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">Everything you need to create an exceptional digital menu experience.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, i) => (
                <div key={i} className="feature-card p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 flex items-start space-x-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Restaurant Showcase */}
        <section className="py-20 bg-gray-900/50 relative overflow-hidden fade-in-section">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
          <div className="container mx-auto px-4 relative">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Beautiful on Any Device</h2>
                <p className="text-lg text-gray-300 mb-8">
                  Your menu automatically adapts to look perfect whether viewed on a smartphone, tablet, or large TV screen in your restaurant.
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold text-white mb-2">For Customers</h3>
                    <p className="text-gray-400 text-sm">Easy browsing with intuitive navigation and quick access to menu sections.</p>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold text-white mb-2">For Restaurants</h3>
                    <p className="text-gray-400 text-sm">Real-time updates and changes without reprinting menus.</p>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="relative w-full max-w-md mx-auto">
                  <div className="aspect-[9/16] w-full relative rounded-3xl overflow-hidden shadow-2xl border-8 border-gray-900">
                    <Image
                      src="https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=987&auto=format&fit=crop"
                      alt="Mobile menu preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800 hidden lg:block">
                    <Image
                      src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2070&auto=format&fit=crop"
                      alt="TV menu preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* --- NEW: Testimonials Section --- */}
        <section className="py-20 bg-gray-900/50 relative fade-in-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Loved by Restaurants Everywhere</h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">See what restaurant owners are saying about MenuLuxe.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Testimonial Card 1 */}
              <div className="feature-card p-8 rounded-xl flex flex-col h-full">
                <div className="flex text-yellow-400 mb-4">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-gray-300 mb-6 flex-grow">&quot;Switching to MenuLuxe was a game-changer. Our customers love the modern feel, and updating the menu is now a breeze instead of a headache.&quot;</p>
                <div>
                  <p className="font-semibold text-white">Sarah L., Owner</p>
                  <p className="text-sm text-gray-500">The Gourmet Kitchen</p>
                </div>
              </div>
              {/* Testimonial Card 2 */}
              <div className="feature-card p-8 rounded-xl flex flex-col h-full">
                <div className="flex text-yellow-400 mb-4">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-gray-300 mb-6 flex-grow">&quot;The QR code system is incredibly fast and reliable. We&#39;ve seen a noticeable improvement in our service speed during peak hours. Highly recommended!&quot;</p>
                <div>
                  <p className="font-semibold text-white">David Chen</p>
                  <p className="text-sm text-gray-500">Spice Route Bistro</p>
                </div>
              </div>
              {/* Testimonial Card 3 */}
              <div className="feature-card p-8 rounded-xl flex flex-col h-full">
                <div className="flex text-yellow-400 mb-4">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-gray-300 mb-6 flex-grow">&quot;The theme customization is fantastic. We were able to match our menu perfectly to our restaurant&#39;s branding. It looks so professional.&quot;</p>
                <div>
                  <p className="font-semibold text-white">Maria Garcia</p>
                  <p className="text-sm text-gray-500">La Cantina</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        {/* --- UPDATED FOOTER WITH REFINED LAYOUT --- */}
        {/* --- FINAL, RESPONSIVE FOOTER --- */}
        {/* --- FINAL, CORRECTED RESPONSIVE FOOTER --- */}
        <footer ref={footerRef} className="relative bg-gray-950 min-h-screen flex flex-col p-6 sm:p-8 md:p-12 fade-in-section overflow-hidden">
          {/* Background layers remain the same */}
          <div className="absolute inset-0 opacity-20 transform scale-110 filter blur-md saturate-125">
            <Image
              src="/footer2.png"
              alt="Food background"
              fill
              className="object-cover"
            />
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: 'circle(var(--size, 0px) at var(--x, 0px) var(--y, 0px))',
            }}
          >
            <Image
              src="/footer2.png"
              alt="Food background spotlight"
              fill
              className="object-cover"
            />
          </div>
          <div className="spotlight-glow" style={{ '--x': 'var(--x, 0px)', '--y': 'var(--y, 0px)' } as React.CSSProperties}></div>

          {/* Content Layer */}
          <div ref={footerContentRef} className="relative z-10 flex-grow flex flex-col">

            {/* FIX: This div now uses my-auto to perfectly center itself vertically */}
            <div className="my-auto text-center">
              <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-extrabold text-white leading-tight">
                Let&#39;s Get <br /> <span className="gradient-text">Cooking.</span>
              </h2>
              <Link href="/signup" className="cta-button inline-flex items-center justify-center text-white font-bold px-8 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg mx-auto mt-10">
                Start Your Free Menu <ArrowRight />
              </Link>
            </div>

            {/* This div is pushed to the bottom by the `my-auto` above */}
            <div className="flex flex-col items-center text-center space-y-6 pt-10">
              <div>
                <Link href="/" className="text-2xl font-bold text-white flex items-center justify-center">
                  <span className="text-orange-500 mr-1">✦</span>Menu<span className="gradient-text">Luxe</span>
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-4">
                  <Link href="#" className="text-gray-400 hover:text-white transition"><TwitterIcon /></Link>
                  <Link href="#" className="text-gray-400 hover:text-white transition"><InstagramIcon /></Link>
                </div>
                <p className="text-gray-500 text-sm">
                  &copy; {new Date().getFullYear()} MenuLuxe. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
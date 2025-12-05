'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/Input'
import { Json, Database } from '@/types/supabase'
import { QRCodeCanvas } from 'qrcode.react'
import { QrCode, Link as LinkIcon, Download, Check, Image as ImageIcon, Settings, Plus, LogOut, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// --- ClientOnly Wrapper ---
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);
  if (!hasMounted) return null;
  return <>{children}</>;
};

// --- TYPE DEFINITION ---
interface Restaurant {
  id: string
  name: string
  owner_id: string | null;
  created_at: string | null;
  theme: Json | null;
  logo_url: string | null;
  subdomain?: string | null;
}


const ShareModal = ({ restaurant }: { restaurant: Restaurant }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const publicUrl = `${origin}/menu/${restaurant.subdomain}`;

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  }, [publicUrl]);

  const downloadQRCode = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${restaurant.subdomain}-qr-code.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <DialogContent className="bg-gray-800 border-gray-700 text-white w-[90%] rounded-xl sm:max-w-md mx-auto">
      <DialogHeader>
        <DialogTitle className="text-white">Share Your Menu</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center space-y-4 p-2 sm:p-4">
        <div ref={qrCodeRef} className="p-4 bg-white rounded-lg shadow-lg">
          <QRCodeCanvas value={publicUrl} size={200} includeMargin={true} />
        </div>
        <p className="text-sm text-center text-gray-400">Scan to view menu</p>
        <div className="flex w-full items-center space-x-2">
          <Input value={publicUrl} readOnly className="bg-gray-700 border-gray-600 text-gray-300 text-sm h-10" />
          <Button type="button" size="icon" variant="outline" className="h-10 w-10 shrink-0 bg-gray-700 hover:bg-gray-600 border-gray-600" onClick={copyToClipboard}>
            {hasCopied ? <Check className="h-4 w-4 text-green-400" /> : <LinkIcon className="h-4 w-4" />}
          </Button>
        </div>
        <Button onClick={downloadQRCode} className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 sm:h-10">
          <Download className="mr-2 h-4 w-4" /> Download QR
        </Button>
      </div>
    </DialogContent>
  );
};

// --- NEW: Header Component ---
const DashboardHeader = ({ user, onCreate }: { user: User | null; onCreate: () => void; }) => {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    }

    const getInitials = (email: string) => {
        return email ? email.substring(0, 2).toUpperCase() : '??';
    }

    return (
        <header className="sticky top-0 z-40 w-full bg-gray-950/80 backdrop-blur-md border-b border-gray-800 mb-6 sm:mb-8 transition-all">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-xl sm:text-2xl font-bold text-white flex items-center group">
                    <span className="text-orange-500 mr-1 group-hover:rotate-12 transition-transform">✦</span>
                    Menu<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">Luxe</span>
                </Link>
                
                <div className="flex items-center gap-3">
                    {/* Responsive Create Button: Icon only on mobile, Full text on Tablet+ */}
                    <Button onClick={onCreate} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-10 w-10 sm:w-auto px-0 sm:px-4 rounded-full sm:rounded-md">
                        <Plus className="h-5 w-5 sm:mr-2" /> 
                        <span className="hidden sm:inline">Create New</span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-800 p-0 overflow-hidden ring-2 ring-transparent focus:ring-orange-500/50">
                               <div className="h-full w-full bg-gray-700 flex items-center justify-center text-xs sm:text-sm font-bold text-orange-400">
                                   {user?.email ? getInitials(user.email) : ''}
                               </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white w-56 mt-2">
                            <DropdownMenuLabel className="text-gray-400 truncate">{user?.email}</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700"/>
                            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer hover:bg-gray-700 py-3 sm:py-2">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Account Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700"/>
                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 hover:bg-red-900/20 hover:text-red-300 py-3 sm:py-2">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}


const RestaurantCardSkeleton = () => (
    <div className="feature-card rounded-xl p-4 sm:p-6 flex flex-col animate-pulse h-full">
        <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-gray-700/50 flex-shrink-0"></div>
            <div className="flex-grow space-y-2 min-w-0">
                <div className="h-6 w-3/4 bg-gray-700/50 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-700/50 rounded"></div>
            </div>
        </div>
        <div className="flex-grow my-6 border-t border-gray-700/50"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
            <div className="h-10 bg-gray-700/50 rounded-md"></div>
            <div className="h-10 bg-gray-700/50 rounded-md"></div>
        </div>
    </div>
)

// --- MAIN DASHBOARD PAGE ---
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchUserAndRestaurants = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      
      const { data, error } = await supabase.from('restaurants').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching restaurants:', error);
      } else if (data) {
        setRestaurants(data as Restaurant[]);
      }
      setLoading(false);
    };
    fetchUserAndRestaurants();
  }, [router, supabase]);

  const handleCreate = () => router.push(`/dashboard/restaurant/new`);

  return (
    <>
    <style jsx global>{`
        .feature-card {
            background: rgba(30, 41, 59, 0.5); /* slate-800/50 */
            backdrop-filter: blur(10px);
            border: 1px solid rgba(51, 65, 85, 0.5); /* slate-700/50 */
            transition: all 0.3s ease;
        }
        @media (hover: hover) {
            .feature-card:hover {
                background: rgba(51, 65, 85, 0.5);
                border-color: rgba(249, 115, 22, 0.3);
                transform: translateY(-5px);
            }
        }
    `}</style>
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col">
        <DashboardHeader user={user} onCreate={handleCreate} />

        <main className="container mx-auto px-4 pb-12 sm:px-6 lg:px-8 flex-grow">
            
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white">Your Restaurants</h2>
                <p className="text-gray-400 text-sm mt-1">Manage and share your digital menus</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <RestaurantCardSkeleton />
                    <RestaurantCardSkeleton />
                    <RestaurantCardSkeleton />
                </div>
            ) : restaurants.length === 0 ? (
                <div className="text-center py-16 sm:py-24 border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center bg-gray-900/20 hover:border-gray-700 transition px-4">
                    <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                        <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">No Restaurants Yet</h3>
                    <p className="text-gray-400 mt-2 mb-8 max-w-sm">Get started by creating your first restaurant menu. It only takes a minute.</p>
                    <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Create First Restaurant
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {restaurants.map((restaurant) => (
                        <div key={restaurant.id} className="feature-card rounded-xl p-5 flex flex-col h-full group">
                            
                          
                            <div className="flex items-start gap-4 relative">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 border border-gray-700 overflow-hidden">
                                    {restaurant.logo_url ? (
                                        <Image src={restaurant.logo_url} alt={`${restaurant.name} logo`} width={80} height={80} className="object-cover w-full h-full" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-gray-600" />
                                    )}
                                </div>
                                
                                <div className="flex-grow min-w-0 pr-8">
                                    <h3 className="font-bold text-lg text-white truncate leading-tight mb-1">{restaurant.name}</h3>
                                    <a 
                                        href={`/menu/${restaurant.subdomain}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-sm text-orange-400 hover:text-orange-300 truncate block hover:underline"
                                    >
                                        /{restaurant.subdomain}
                                    </a>
                                </div>


                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute -top-1 -right-1 text-gray-500 hover:text-white hover:bg-gray-700/50"
                                    onClick={() => router.push(`/dashboard/${restaurant.id}/settings`)}
                                >
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </div>

                        
                            <div className="my-5 border-t border-gray-700/50 w-full"></div>

                  
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                                <Button 
                                    variant="outline"
                                    className="w-full bg-transparent border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-800"
                                    onClick={() => router.push(`/dashboard/${restaurant.id}/menu-builder`)}
                                >
                                    Manage Menu
                                </Button>
                                <ClientOnly>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/20">
                                                <QrCode className="mr-2 h-4 w-4" /> Share
                                            </Button>
                                        </DialogTrigger>
                                        <ShareModal restaurant={restaurant} />
                                    </Dialog>
                                </ClientOnly>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    </div>
    </>
  );
}



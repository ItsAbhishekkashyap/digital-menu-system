'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/Input'
import { Json, Database } from '@/types/supabase'
import { QRCodeCanvas } from 'qrcode.react'
import { QrCode, Link as LinkIcon, Download, Check, Image as ImageIcon, Settings, Plus, LogOut, ChevronDown, Trash2, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// --- ClientOnly Wrapper (for preventing hydration errors) ---
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

// --- REDESIGNED ShareModal SUB-COMPONENT ---
const ShareModal = ({ restaurant }: { restaurant: Restaurant }) => {
    const [hasCopied, setHasCopied] = useState(false);
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const publicUrl = `${window.location.origin}/menu/${restaurant.subdomain}`;

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
        <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="text-white">Share Your Menu</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center space-y-4 p-4">
                <div ref={qrCodeRef} className="p-4 bg-white rounded-lg shadow-lg">
                    <QRCodeCanvas value={publicUrl} size={256} includeMargin={true} />
                </div>
                <p className="text-sm text-gray-400">Your customers can scan this code to view the menu.</p>
                <div className="flex w-full items-center space-x-2">
                    <Input value={publicUrl} readOnly className="bg-gray-700 border-gray-600 text-gray-300" />
                    <Button type="button" size="sm" variant="outline" className="bg-gray-700 hover:bg-gray-600 border-gray-600" onClick={copyToClipboard}>
                        {hasCopied ? <Check className="h-4 w-4 text-green-400" /> : <LinkIcon className="h-4 w-4" />}
                    </Button>
                </div>
                <Button onClick={downloadQRCode} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    <Download className="mr-2 h-4 w-4" /> Download QR Code
                </Button>
            </div>
        </DialogContent>
    );
};



// --- *** NEW: Delete Restaurant Modal *** ---
const DeleteRestaurantModal = ({ restaurant, onDeleted }: { restaurant: Restaurant; onDeleted: (id: string) => void; }) => {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const supabase = createClientComponentClient<Database>();

    const handleDelete = async () => {
        setLoading(true);
        // Assuming you have RLS policies and ON DELETE CASCADE set up in your database
        const { error } = await supabase.from('restaurants').delete().eq('id', restaurant.id);

        setLoading(false);
        if (error) {
            console.error('Error deleting restaurant:', error);
            alert('Could not delete the restaurant. Please try again.');
        } else {
            alert('Restaurant deleted successfully.');
            onDeleted(restaurant.id); // Update the UI
            setIsOpen(false); // Close the modal
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="cursor-pointer text-red-500 focus:bg-red-500/20 focus:text-red-400"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Restaurant</span>
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-red-500">
                        <AlertTriangle className="mr-2" /> Are you sure?
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 pt-2">
                        This action cannot be undone. This will permanently delete the
                        <strong className="text-red-400 font-bold"> {restaurant.name} </strong>
                        restaurant and all of its associated data, including menus, sections, and items.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} className="hover:bg-gray-700">Cancel</Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {loading ? 'Deleting...' : 'Yes, delete it'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
        <header className="flex justify-between items-center mb-8">
            <div>
                <Link href="/" className="text-2xl font-bold text-white flex items-center">
                    <span className="text-orange-500 mr-1">✦</span>Menu<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">Luxe</span>
                </Link>
            </div>
            <div className="flex items-center space-x-4">
                <Button onClick={onCreate} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                    <Plus className="mr-2 h-4 w-4" /> Create New
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-800/50 p-2 rounded-full">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-orange-400">
                                {user?.email ? getInitials(user.email) : ''}
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white w-56">
                        <DropdownMenuLabel className="text-gray-400">{user?.email}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer  focus:bg-gray-700">
                            <Settings className="mr-2 h-4 w-4" />
                            <span className='hover:text-background'>Account Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer focus:bg-red-500/20 focus:text-red-400">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

// --- NEW: Skeleton Loader Component ---
const RestaurantCardSkeleton = () => (
    <div className="feature-card rounded-xl p-6 flex flex-col animate-pulse">
        <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-gray-700/50 flex-shrink-0"></div>
            <div className="flex-grow space-y-2">
                <div className="h-6 w-3/4 bg-gray-700/50 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-700/50 rounded"></div>
            </div>
        </div>
        <div className="flex-grow my-6 border-t border-gray-700/50"></div>
        <div className="flex justify-between mt-auto">
            <div className="h-10 w-32 bg-gray-700/50 rounded-md"></div>
            <div className="h-10 w-24 bg-gray-700/50 rounded-md"></div>
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

    // --- NEW: Callback function to update UI after deletion ---
    const handleRestaurantDeleted = (deletedId: string) => {
        setRestaurants(currentRestaurants => currentRestaurants.filter(r => r.id !== deletedId));
    };

    return (
        <>
            <style jsx global>{`
        .feature-card {
            background: rgba(30, 41, 59, 0.5); /* slate-800/50 */
            backdrop-filter: blur(10px);
            border: 1px solid rgba(51, 65, 85, 0.5); /* slate-700/50 */
            transition: all 0.3s ease;
        }
        .feature-card:hover {
            background: rgba(51, 65, 85, 0.5); /* slate-700/50 */
            border-color: rgba(249, 115, 22, 0.3); /* orange-500/30 */
            transform: translateY(-5px);
        }
    `}</style>
            <div className="min-h-screen bg-gray-950 text-gray-200">
                <main className="container mx-auto p-6 md:p-8 lg:p-10">
                    <DashboardHeader user={user} onCreate={handleCreate} />

                    <div className="border-t border-gray-800 pt-8">
                        <h2 className="text-2xl font-semibold text-white mb-6">Your Restaurants</h2>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <RestaurantCardSkeleton />
                                <RestaurantCardSkeleton />
                                <RestaurantCardSkeleton />
                            </div>
                        ) : restaurants.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center hover:border-orange-500/50 transition">
                                <ImageIcon className="w-16 h-16 text-gray-600 mb-4" />
                                <h3 className="text-xl font-semibold text-white">No Restaurants Yet</h3>
                                <p className="text-gray-400 mt-2 mb-6">Get started by creating your first restaurant menu.</p>
                                <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                                    Create Your First Restaurant
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {restaurants.map((restaurant) => (
                                    <div key={restaurant.id} className="feature-card rounded-xl p-6 flex flex-col">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-lg bg-gray-700/50 flex items-center justify-center flex-shrink-0">
                                                {restaurant.logo_url ? (
                                                    <Image src={restaurant.logo_url} alt={`${restaurant.name} logo`} width={64} height={64} className="object-cover rounded-lg" />
                                                ) : (
                                                    <ImageIcon className="w-8 h-8 text-gray-500" />
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="font-bold text-lg text-white">{restaurant.name}</h3>
                                                <a href={`/menu/${restaurant.subdomain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-400 hover:underline break-all">{restaurant.subdomain || 'No subdomain'}</a>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700/50 -mt-2 -mr-2">
                                                        <Settings className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white w-56">
                                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/${restaurant.id}/settings`)} className="cursor-pointer focus:bg-gray-700">
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        <span>Restaurant Settings</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-gray-700" />

                                                    {/* --- NEW: Delete Option --- */}
                                                    <ClientOnly>
                                                        <DeleteRestaurantModal restaurant={restaurant} onDeleted={handleRestaurantDeleted} />
                                                    </ClientOnly>

                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex-grow my-6 border-t border-gray-700/50"></div>
                                        <div className="flex justify-between items-center mt-auto">
                                            <Button
                                                variant="outline"
                                                className="bg-gray-700/50 border-gray-600 hover:text-white hover:bg-gray-700"
                                                onClick={() => router.push(`/dashboard/${restaurant.id}/menu-builder`)}
                                            >
                                                Manage Menu
                                            </Button>
                                            <ClientOnly>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
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
                    </div>
                </main>
            </div>
        </>
    );
}



'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Database, Json } from '@/types/supabase'
import Image from 'next/image'
import { UploadCloud, Loader2, X, Trash2, Sun, Moon, Palette, ArrowLeft, Building, Monitor, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- TYPE DEFINITIONS ---
type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type ThemePreset = 'dark' | 'light' | 'brand';
interface Theme {
  preset: ThemePreset;
  brandColor: string;
}
const DEFAULT_THEME: Theme = { preset: 'dark', brandColor: '#FBBF24' };

function isValidTheme(theme: unknown): theme is Theme {
  return Boolean(
    theme && typeof theme === 'object' && !Array.isArray(theme) &&
    'preset' in theme && 'brandColor' in theme &&
    typeof (theme as Theme).preset === 'string' &&
    ['dark', 'light', 'brand'].includes((theme as Theme).preset)
  );
}

// --- REDESIGNED SUB-COMPONENTS ---

const LogoUploader = ({ onFileSelect, disabled, initialPreview }: { onFileSelect: (file: File | null) => void; disabled: boolean; initialPreview: string | null }) => {
  const [preview, setPreview] = useState<string | null>(initialPreview);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setPreview(initialPreview); }, [initialPreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
    onFileSelect(file);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <Label className="text-gray-300">Restaurant Logo</Label>
      <div className="mt-2 relative w-36 h-36">
        <div className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-800/50 hover:border-orange-500/50 transition-colors" onClick={() => !disabled && fileInputRef.current?.click()}>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" disabled={disabled} />
          {preview ? <Image src={preview} alt="Logo preview" width={144} height={144} className="object-cover rounded-lg" /> : <div className="text-center"><UploadCloud className="mx-auto h-8 w-8 text-gray-500" /><span className="text-xs mt-1">Upload Logo</span></div>}
        </div>
        {preview && !disabled && <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-transform duration-200 ease-in-out hover:scale-110 shadow-lg" aria-label="Remove logo"><X size={16} /></button>}
      </div>
    </div>
  );
};

const ThemeSelector = ({ theme, setTheme, disabled }: { theme: Theme; setTheme: (theme: Theme) => void; disabled: boolean }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Light Theme Card */}
                <div onClick={() => !disabled && setTheme({...theme, preset: 'light'})} className={cn("cursor-pointer rounded-lg border-2 p-4 transition-all", theme.preset === 'light' ? 'border-orange-500 ring-2 ring-orange-500/50' : 'border-gray-700 hover:border-gray-600')}>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">Light</h4>
                        <Sun className="h-5 w-5 text-gray-400"/>
                    </div>
                    <div className="h-20 w-full rounded bg-gray-200 flex items-center justify-center">
                        <div className="w-3/4 h-12 bg-white rounded-md shadow-inner flex items-center p-2 space-x-1">
                           <div className="w-5 h-5 rounded-full bg-gray-300"></div>
                           <div className="flex-grow h-2 rounded-full bg-gray-300"></div>
                        </div>
                    </div>
                </div>
                {/* Dark Theme Card */}
                <div onClick={() => !disabled && setTheme({...theme, preset: 'dark'})} className={cn("cursor-pointer rounded-lg border-2 p-4 transition-all", theme.preset === 'dark' ? 'border-orange-500 ring-2 ring-orange-500/50' : 'border-gray-700 hover:border-gray-600')}>
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">Dark</h4>
                        <Moon className="h-5 w-5 text-gray-400"/>
                    </div>
                    <div className="h-20 w-full rounded bg-gray-900 flex items-center justify-center">
                        <div className="w-3/4 h-12 bg-gray-800 rounded-md shadow-inner flex items-center p-2 space-x-1">
                           <div className="w-5 h-5 rounded-full bg-gray-700"></div>
                           <div className="flex-grow h-2 rounded-full bg-gray-700"></div>
                        </div>
                    </div>
                </div>
                {/* Brand Theme Card */}
                <div onClick={() => !disabled && setTheme({...theme, preset: 'brand'})} className={cn("cursor-pointer rounded-lg border-2 p-4 transition-all", theme.preset === 'brand' ? 'border-orange-500 ring-2 ring-orange-500/50' : 'border-gray-700 hover:border-gray-600')}>
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">Brand</h4>
                        <Palette className="h-5 w-5 text-gray-400"/>
                    </div>
                    <div style={{backgroundColor: theme.brandColor}} className="h-20 w-full rounded flex items-center justify-center transition-colors">
                        <div className="w-3/4 h-12 bg-white/20 backdrop-blur-sm rounded-md shadow-inner flex items-center p-2 space-x-1">
                           <div className="w-5 h-5 rounded-full bg-white/30"></div>
                           <div className="flex-grow h-2 rounded-full bg-white/30"></div>
                        </div>
                    </div>
                </div>
            </div>
            {theme.preset === 'brand' && (
                <div className="flex items-center space-x-4 pl-2">
                    <Label htmlFor="brandColor" className="text-gray-300">Brand Color</Label>
                    <Input id="brandColor" type="color" value={theme.brandColor} onChange={(e) => setTheme({...theme, brandColor: e.target.value})} disabled={disabled} className="w-16 h-10 p-1 rounded-md bg-gray-800 border-gray-700" />
                </div>
            )}
        </div>
    );
};

// --- NEW: Skeleton Loader ---
const SettingsSkeleton = () => (
    <div className="max-w-4xl mx-auto animate-pulse">
        <div className="text-center mb-10">
            <div className="h-10 w-3/4 bg-gray-700 rounded-md mx-auto"></div>
            <div className="h-4 w-1/2 bg-gray-700 rounded-md mx-auto mt-4"></div>
        </div>
        <div className="form-card rounded-2xl p-8 space-y-8">
            <div className="h-24 w-full bg-gray-800/50 rounded-md"></div>
            <div className="h-32 w-full bg-gray-800/50 rounded-md"></div>
            <div className="h-48 w-full bg-gray-800/50 rounded-md"></div>
        </div>
    </div>
);


// --- MAIN SETTINGS PAGE ---
export default function RestaurantSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const supabase = createClientComponentClient<Database>();

  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurant = useCallback(async (currentUser: User) => {
    if (!currentUser || !restaurantId) return;
    const { data, error } = await supabase.from('restaurants').select('*').eq('id', restaurantId).eq('owner_id', currentUser.id).single();
    if (error || !data) {
      setError('Failed to load restaurant data or you do not have permission.');
      setLoading(false);
      return;
    }
    setRestaurant(data);
    setName(data.name);
    setDescription(data.description || '');
    if (isValidTheme(data.theme)) {
        setTheme(data.theme);
    } else {
        setTheme(DEFAULT_THEME);
    }
    setLoading(false);
  }, [restaurantId, supabase]);

  useEffect(() => {
    const getUserAndData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) {
            router.push('/login');
            return;
        }
        setUser(user);
        await fetchRestaurant(user);
    }
    getUserAndData();
  }, [router, supabase, fetchRestaurant]);

  const handleUpdate = async () => {
    if (!restaurant) return;
    setSaving(true);
    setError(null);
    let newLogoUrl = restaurant.logo_url;

    if (logoFile === null && restaurant.logo_url) {
        newLogoUrl = null;
    } else if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const filePath = `${restaurant.id}/logo.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('restaurant-logos').upload(filePath, logoFile, { upsert: true });

      if (uploadError) {
        setError('Failed to upload new logo: ' + uploadError.message); setSaving(false); return;
      }
      const { data: { publicUrl } } = supabase.storage.from('restaurant-logos').getPublicUrl(filePath);
      newLogoUrl = `${publicUrl}?t=${new Date().getTime()}`;
    }

    const { error: updateError } = await supabase
      .from('restaurants')
      .update({ name, description, logo_url: newLogoUrl, theme: theme as unknown as Json })
      .eq('id', restaurant.id);

    if (updateError) {
      setError('Failed to update restaurant: ' + updateError.message);
    } else {
      alert('Restaurant updated successfully!');
      router.refresh();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!restaurant) return;
    setSaving(true);
    const { error: deleteError } = await supabase.from('restaurants').delete().eq('id', restaurant.id);
    if (deleteError) {
      setError('Failed to delete restaurant: ' + deleteError.message);
      setSaving(false);
    } else {
      alert('Restaurant deleted successfully.');
      router.push('/dashboard');
      router.refresh();
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
        <main className="container mx-auto p-6 md:p-8 lg:p-10">
            <div className="mb-8">
                <Button variant="outline" className="bg-transparent border-gray-700 hover:bg-gray-800/50" disabled><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button>
            </div>
            <SettingsSkeleton />
        </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 relative">
        <div className="absolute inset-0 opacity-80">
            <Image 
                src="/settings.png"
                alt="Restaurant background"
                fill
                className="object-cover"
                priority
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950 to-gray-950"></div>
        
        <style jsx global>{`
            .form-card { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(51, 65, 85, 0.5); }
            .gradient-text { background: linear-gradient(90deg, #F59E0B, #EF4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        `}</style>
        <main className="container mx-auto p-6 md:p-8 lg:p-10 relative z-10">
            <div className="mb-8">
                <Button variant="outline" onClick={() => router.push('/dashboard')} className="bg-transparent hover:text-white border-gray-700 hover:bg-gray-800/50"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button>
            </div>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white">Restaurant Settings</h1>
                    <p className="text-gray-400 mt-2">Manage and customize your restaurant&#39;s appearance and details.</p>
                </div>

                <div className="space-y-10">
                    {/* General Settings */}
                    <div className="form-card rounded-2xl p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-semibold text-white">General</h3>
                                <p className="text-sm text-gray-400 mt-1">Update your restaurant&#39;s name, logo, and description.</p>
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 gap-6">
                                <div>
                                    <Label htmlFor="name" className="text-gray-300">Restaurant Name</Label>
                                    <div className="relative mt-2">
                                        <Building className="pointer-events-none w-5 h-5 absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-500" />
                                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={saving} className="pl-10 bg-gray-800 border-gray-700 text-white focus:ring-orange-500 focus:border-orange-500" />
                                    </div>
                                </div>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} className="bg-gray-800 border-gray-700 text-white focus:ring-orange-500 focus:border-orange-500 min-h-[100px]" placeholder="A short description..."/>
                                <LogoUploader onFileSelect={setLogoFile} disabled={saving} initialPreview={restaurant?.logo_url || null} />
                            </div>
                        </div>
                    </div>

                    {/* Theme Settings */}
                     <div className="form-card rounded-2xl p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-semibold text-white">Appearance</h3>
                                <p className="text-sm text-gray-400 mt-1">Customize the look and feel of your public menu page.</p>
                            </div>
                            <div className="md:col-span-2">
                                <ThemeSelector theme={theme} setTheme={setTheme} disabled={saving} />
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             <div className="md:col-span-1">
                                <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
                                <p className="text-sm text-red-400/70 mt-1">These actions are permanent and cannot be undone.</p>
                            </div>
                            <div className="md:col-span-2 flex items-center justify-between">
                               <div>
                                    <p className="font-medium text-white">Delete this restaurant</p>
                                    <p className="text-sm text-gray-400">All associated menus and data will be lost.</p>
                               </div>
                               <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={saving}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-gray-400">
                                                This action cannot be undone. This will permanently delete the restaurant and all of its data. To confirm, please type the restaurant name: <span className="font-bold text-red-400">{name}</span>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-gray-700 border-none hover:bg-gray-600">Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Confirm Deletion</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleUpdate} disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 text-base">
                            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</> : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    </div>
  )
}
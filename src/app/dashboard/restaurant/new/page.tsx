'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/textarea'
import { Database } from '@/types/supabase'
import Image from 'next/image'
import { UploadCloud, Loader2, X, ArrowLeft, Building, Link2 } from 'lucide-react'

// --- REDESIGNED LogoUploader ---
const LogoUploader = ({ onFileSelect, disabled }: { onFileSelect: (file: File | null) => void; disabled: boolean }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect(file);
    } else {
      handleRemoveImage();
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <Label className="text-gray-300">Restaurant Logo</Label>
      <div className="mt-2 relative w-36 h-36">
        <div
          className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-800/50 hover:border-orange-500/50 transition-colors"
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            disabled={disabled}
          />
          {preview ? (
            <Image src={preview} alt="Logo preview" width={144} height={144} className="object-cover rounded-lg" />
          ) : (
            <div className="text-center">
              <UploadCloud className="mx-auto h-8 w-8 text-gray-500" />
              <span className="text-xs mt-1">Upload Logo</span>
            </div>
          )}
        </div>
        {preview && !disabled && (
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-transform duration-200 ease-in-out hover:scale-110 shadow-lg"
            aria-label="Remove logo"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};


// --- MAIN CREATE RESTAURANT PAGE ---
export default function CreateRestaurantPage() {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
        } else {
            setUser(user);
        }
    }
    fetchUser();
  }, [router, supabase]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true)
    setError(null)

    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const { data: existingRestaurant, error: checkError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      setError('Error checking subdomain: ' + checkError.message);
      setLoading(false);
      return;
    }

    if (existingRestaurant) {
      setError('This subdomain is already taken. Please choose another one.');
      setLoading(false);
      return;
    }

    const { data: newRestaurant, error: insertError } = await supabase
      .from('restaurants')
      .insert({ owner_id: user.id, name, description, subdomain })
      .select()
      .single();

    if (insertError) {
      setError('Failed to create restaurant: ' + insertError.message);
      setLoading(false);
      return;
    }

    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const filePath = `${newRestaurant.id}/logo.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('restaurant-logos')
        .upload(filePath, logoFile, { upsert: true });

      if (uploadError) {
        console.error('Logo upload failed:', uploadError.message);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('restaurant-logos')
          .getPublicUrl(filePath);
        
        const finalUrl = `${publicUrl}?t=${new Date().getTime()}`;
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({ logo_url: finalUrl })
          .eq('id', newRestaurant.id);

        if (updateError) {
            console.error('Failed to save logo URL:', updateError.message);
        }
      }
    }
    
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 relative">
        <div className="absolute inset-0 opacity-100">
            <Image 
                src="/restnew.png"
                alt="Restaurant background"
                fill
                className="object-cover"
                priority
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950 to-gray-950"></div>

        <style jsx global>{`
            .form-card {
                background: rgba(15, 23, 42, 0.7);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(51, 65, 85, 0.5);
            }
            .gradient-text {
                background: linear-gradient(90deg, #F59E0B, #EF4444);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        `}</style>
        <main className="container mx-auto p-6 md:p-8 lg:p-10 relative z-10">
            <div className="mb-8">
                <Button variant="outline" onClick={() => router.push('/dashboard')} className="bg-transparent border-gray-700 hover:bg-gray-800/50 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>

            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white">
                        Let&#39;s Create Your <span className="gradient-text">Digital Home</span>
                    </h1>
                    <p className="text-gray-400 mt-2">This is the first step to building your beautiful digital menu.</p>
                </div>

                <form onSubmit={handleCreate} className="form-card rounded-2xl p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="name" className="text-gray-300">Restaurant Name</Label>
                            <div className="relative mt-2">
                                <Building className="pointer-events-none w-5 h-5 absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-500" />
                                <Input 
                                    id="name" 
                                    value={name} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                                    required 
                                    disabled={loading} 
                                    className="pl-10 bg-gray-800 border-gray-700 text-white focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="e.g., The Golden Spoon"
                                />
                            </div>
                        </div>
                         <div>
                            <Label htmlFor="subdomain" className="text-gray-300">Subdomain</Label>
                            <div className="relative mt-2 flex items-center">
                                <Input
                                    id="subdomain"
                                    value={subdomain}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    placeholder="your-restaurant"
                                    required
                                    disabled={loading}
                                    className="pl-4 pr-32 bg-gray-800 border-gray-700 text-white focus:ring-orange-500 focus:border-orange-500"
                                />
                                <span className="absolute right-3 text-gray-400 text-sm pointer-events-none">
                                    .menuluxe.com
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
                        <Textarea 
                            id="description" 
                            value={description} 
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} 
                            disabled={loading} 
                            className="mt-2 bg-gray-800 border-gray-700 text-white focus:ring-orange-500 focus:border-orange-500 min-h-[100px]"
                            placeholder="A short, catchy description of your restaurant."
                        />
                    </div>

                    <LogoUploader onFileSelect={setLogoFile} disabled={loading} />
                    
                    {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-md">{error}</p>}

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading || !name || !subdomain} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 text-base">
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Restaurant'}
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    </div>
  )
}

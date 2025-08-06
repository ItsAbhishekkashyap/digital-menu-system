// app/dashboard/restaurant/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/loading-spinner';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];

export default function RestaurantPage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id);

      if (error) {
        console.error('Error fetching restaurants:', error);
        setRestaurants([]);
      } else {
        setRestaurants(data);

        if (data.length === 1) {
          router.push(`/dashboard/${data[0].id}/menu-builder`);
        }
      }

      setLoading(false);
    };

    fetchRestaurants();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Restaurants</h1>
        <Link href="/dashboard/restaurant/new">
          <Button>Create Restaurant</Button>
        </Link>
      </div>

      {restaurants && restaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/dashboard/${restaurant.id}/menu-builder`}
              className="border rounded-lg p-4 shadow hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold">{restaurant.name}</h2>
              <p className="text-gray-500">{restaurant.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">
          No restaurants found. Please create one to continue.
        </div>
      )}
    </div>
  );
}

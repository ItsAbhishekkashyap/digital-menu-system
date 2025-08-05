'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // ✅ your actual supabase client

interface AddSectionFormProps {
  restaurantId: string;
}

export default function AddSectionForm({ restaurantId }: AddSectionFormProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddSection = async (e: FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);

    const { error } = await supabase.from('menu_sections').insert([
      {
        title,
        restaurant_id: restaurantId,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert('Error adding section');
    } else {
      setTitle('');
      router.refresh(); // refresh the data
    }
  };

  return (
    <form onSubmit={handleAddSection} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Section Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:text-white"
          placeholder="e.g. Starters"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Adding...' : 'Add Section'}
      </button>
    </form>
  );
}

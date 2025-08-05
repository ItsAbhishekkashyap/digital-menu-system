// components/LivePreview.tsx
"use client";

import { useEffect, useState } from "react";
import { SectionWithItems } from "@/types/supabase";
import axios from "axios";

export default function LivePreview({ restaurantId }: { restaurantId: string }) {
  const [data, setData] = useState<SectionWithItems[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await axios.get(`/api/${restaurantId}/sections`);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching preview data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [restaurantId]);

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading preview...</div>;

  if (!data || data.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">Nothing to show yet...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {data.map((section) => (
        <div key={section.id}>
          <h2 className="text-xl font-bold mb-2">{section.title}</h2>
          {section.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items in this section.</p>
          ) : (
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.id} className="border p-3 rounded shadow-sm">
                  <div className="font-semibold">{item.name}</div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  <div className="text-sm font-medium text-green-600">₹{item.price}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

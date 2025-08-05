import ClientLayout from '@/components/ClientLayout';
import React from 'react';
import { getSectionsWithItems } from "@/lib/supabase/queries/get-sections-with-items";
import { MenuSection } from "@/types/supabase";
import AddSectionForm from '@/components/forms/AddSectionForm';


export default async function Dashboard() {
  const sections: MenuSection[] = await getSectionsWithItems();

  return (
    <ClientLayout>
      <div className="min-h-screen flex flex-row bg-gray-100 dark:bg-gray-900">
        {/* Left Panel: Editor */}
        <div className="w-2/5 p-6 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            🍽️ Menu Editor
          </h1>

          {/* Sections List */}
          <div className="mb-6 space-y-4">
            {sections.map((section) => (
              
              <div key={section.id}>
                
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">
                  {section.title}
                </h3>
                <ul className="pl-4 list-disc text-sm text-gray-600 dark:text-gray-400">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      {item.name} - ₹{item.price}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Add Section Button */}
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Add Section
          </button>
        </div>

        {/* Right Panel: Preview */}
        <div className="w-3/5 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            🔍 Live Preview
          </h1>
          <div className="bg-white dark:bg-gray-800 shadow rounded p-4">
            <p className="text-gray-500 dark:text-gray-400">Nothing to show yet...</p>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}



// import ClientLayout from '@/components/ClientLayout';
// import React from 'react';
// import { getSectionsWithItems } from '@/lib/supabase/queries/get-sections-with-items';
// import { MenuSection } from '@/types/supabase';




// export default async function Dashboard() {
//   const sections: MenuSection[] = await getSectionsWithItems();

//   return (
//     <ClientLayout>
//       <div className="min-h-screen flex flex-row bg-gray-100 dark:bg-gray-900">
//         {/* Left Panel: Editor */}
//         <div className="w-2/5 p-6 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
//           <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
//             🍽️ Menu Editor
//           </h1>

//           {/* Sections List with Items */}
//           <div className="mb-6 space-y-4">
//             {sections.map((section) => (
//               <div key={section.id}>
//                 <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">
//                   {section.title}
//                 </h3>
//                 <ul className="pl-4 list-disc text-sm text-gray-600 dark:text-gray-400">
//                   {section.items.map((item) => (
//                     <li key={item.id}>
//                       {item.name} - ₹{item.price}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>

//           {/* Section List (Titles only) */}
//           <div className="mb-6">
//             <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">📋 Section List</h2>
//             <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm space-y-1">
//               {sections.map((section) => (
//                 <li key={`section-title-${section.id}`}>{section.title}</li>
//               ))}
//             </ul>
//           </div>

//           {/* Add Section Button */}
//           <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//             + Add Section
//           </button>
//         </div>

//         {/* Right Panel: Preview */}
//         <div className="w-3/5 p-6 overflow-y-auto">
//           <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
//             🔍 Live Preview
//           </h1>

//           <div className="bg-white dark:bg-gray-800 shadow rounded p-6 space-y-6">
//             {sections.length === 0 ? (
//               <p className="text-gray-500 dark:text-gray-400">Nothing to show yet...</p>
//             ) : (
//               sections.map((section) => (
//                 <div key={section.id}>
//                   <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
//                     {section.title}
//                   </h2>
//                   <ul className="space-y-2">
//                     {section.items.map((item) => (
//                       <li key={item.id} className="flex justify-between text-sm border-b pb-1 text-gray-700 dark:text-gray-300">
//                         <span>{item.name}</span>
//                         <span className="font-medium">₹{item.price}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </ClientLayout>
//   );
// }


import ClientLayout from '@/components/ClientLayout';
import DashboardClient from '@/components/DashboardClient';
import { getSectionsWithItems } from '@/lib/supabase/queries/get-sections-with-items';
import { getRestaurantId } from '@/lib/supabase/queries/get-restaurant-id'; // Your own code
import { MenuSection } from '@/types/supabase'; // Make sure this import exists

export default async function DashboardPage() {
  const restaurantId = await getRestaurantId();
  if (!restaurantId) {
    return (
      <ClientLayout>
        <p>No restaurant found. Please create one first.</p>
      </ClientLayout>
    );
  }

  const sections = await getSectionsWithItems(restaurantId);

  // Map the fetched sections to the expected MenuSection type shape
  const formattedSections: MenuSection[] = sections.map((section) => ({
    id: section.id,
    title: section.name, // 'name' from DB maps to 'title' expected in MenuSection
    order: section.order,
    created_at: section.created_at,
    restaurant_id: section.restaurant_id,
    items: section.menu_items, // ensure this matches your MenuSection items type
  }));

  return (
    <ClientLayout>
      <DashboardClient initialSections={formattedSections} restaurantId={restaurantId} />
    </ClientLayout>
  );
}

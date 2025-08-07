// app/menu/demo-restaurant/page.tsx

export default function DemoRestaurantPage() {
  const sampleItems = [
    {
      name: "Margherita Pizza",
      description: "Classic delight with 100% real mozzarella cheese.",
      price: "₹249",
      image: "https://source.unsplash.com/400x300/?pizza"
    },
    {
      name: "Pasta Alfredo",
      description: "Creamy white sauce pasta with herbs and mushrooms.",
      price: "₹199",
      image: "https://source.unsplash.com/400x300/?pasta"
    },
    {
      name: "Paneer Tikka",
      description: "Char-grilled paneer cubes marinated in spicy yogurt.",
      price: "₹179",
      image: "https://source.unsplash.com/400x300/?paneer"
    },
    {
      name: "Cold Coffee",
      description: "Chilled, rich, and smooth coffee to refresh you.",
      price: "₹99",
      image: "https://source.unsplash.com/400x300/?coffee"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Restaurant Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">🍽️ Demo Restaurant</h1>
          <p className="text-gray-600 mt-2">123, Food Street, Delhi | Open Now</p>
        </div>

        {/* Menu Items */}
        <div className="grid md:grid-cols-2 gap-8">
          {sampleItems.map((item, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-lg shadow hover:shadow-md transition p-4 flex"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-32 h-24 object-cover rounded mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                <p className="text-gray-800 font-bold mt-1">{item.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-16 text-sm text-gray-500">
          This is a demo menu built using our digital menu builder.
        </div>
      </div>
    </div>
  );
}

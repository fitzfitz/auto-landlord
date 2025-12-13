export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      features: [
        "Up to 2 properties",
        "Basic tenant screening",
        "Manual payments",
      ],
    },
    {
      name: "Pro",
      price: "$29",
      period: "/mo",
      features: [
        "Unlimited properties",
        "Automated background checks",
        "Online rent collection",
        "Expense tracking",
        "Priority support",
      ],
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: ["API Access", "Custom branding", "Dedicated account manager"],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-5xl font-bold mb-6">Simple Pricing</h1>
      <p className="text-xl text-gray-500 mb-16">
        Start for free, upgrade as you grow.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative p-8 rounded-2xl border ${
              plan.highlight
                ? "border-blue-500 bg-blue-50/10"
                : "border-gray-200 dark:border-neutral-800"
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-bold rounded-full">
                Most Popular
              </span>
            )}
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              {plan.period && (
                <span className="text-gray-500">{plan.period}</span>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-sm">
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 rounded-lg font-bold transition-colors ${
                plan.highlight
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }`}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

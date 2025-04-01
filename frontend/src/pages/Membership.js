// src/pages/Membership.js
import React from 'react';

const Membership = () => {
  const membershipPlans = [
    {
      id: 1,
      name: 'Individual',
      price: 79.99,
      features: [
        'Unlimited admission for 1 person for a full year',
        '10% discount at zoo shops and cafes',
        'Free parking on every visit',
        'Member-only events and previews',
        'Monthly e-newsletter'
      ]
    },
    {
      id: 2,
      name: 'Family',
      price: 149.99,
      popular: true,
      features: [
        'Unlimited admission for 2 adults and up to 3 children',
        '15% discount at zoo shops and cafes',
        'Free parking on every visit',
        'Member-only events and previews',
        'Discounted guest passes',
        'Early access to special exhibitions',
        'Free access to seasonal attractions'
      ]
    },
    {
      id: 3,
      name: 'Conservation Club',
      price: 249.99,
      features: [
        'All Family membership benefits',
        'Behind-the-scenes animal experiences',
        '25% discount at zoo shops and cafes',
        'VIP seating at animal shows',
        'Invitation to annual donor reception',
        'Name recognition on donor wall',
        'Exclusive conservation updates and reports'
      ]
    }
  ];

  const benefits = [
    {
      title: 'Unlimited Visits',
      icon: '🎟️',
      description: 'Visit as often as you want throughout the year, including special seasonal events.'
    },
    {
      title: 'Save Money',
      icon: '💰',
      description: 'Membership pays for itself in just a few visits, plus enjoy discounts throughout the zoo.'
    },
    {
      title: 'Support Conservation',
      icon: '🌍',
      description: 'Your membership directly funds our global wildlife conservation initiatives.'
    },
    {
      title: 'Exclusive Access',
      icon: '🔑',
      description: 'Enjoy members-only events, early access to new exhibits, and special behind-the-scenes opportunities.'
    }
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src="/background/tree_bg.webp" 
          alt="Membership Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-5xl text-white font-bold font-['Roboto_Flex']">Become a Member</h1>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 font-['Roboto_Flex']">Membership Benefits</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto font-['Lora']">
            Join our community of wildlife enthusiasts and enjoy these exclusive benefits while supporting our conservation mission.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">{benefit.title}</h3>
              <p className="text-gray-600 font-['Lora']">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Membership Plans */}
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center font-['Roboto_Flex']">Choose Your Membership</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {membershipPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`bg-white rounded-lg overflow-hidden shadow-md ${plan.popular ? 'ring-2 ring-green-600 transform scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="bg-green-600 text-white py-1 px-4 text-center font-['Mukta_Mahee']">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2 text-gray-800 font-['Roboto_Flex']">{plan.name}</h3>
                <div className="text-3xl font-bold text-green-700 mb-4 font-['Roboto_Flex']">
                  ${plan.price}
                  <span className="text-base font-normal text-gray-600">/year</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-600 font-['Lora']">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full transition duration-300 font-['Mukta_Mahee']">
                  Join Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 font-['Roboto_Flex']">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">How soon can I use my membership?</h3>
              <p className="text-gray-600 font-['Lora']">Your membership benefits begin immediately upon purchase. You'll receive a temporary digital membership card by email that you can use right away.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">Can I upgrade my membership?</h3>
              <p className="text-gray-600 font-['Lora']">Yes, you can upgrade your membership at any time. You'll only pay the difference between your current membership level and the new one.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">Is my membership tax-deductible?</h3>
              <p className="text-gray-600 font-['Lora']">A portion of your membership is tax-deductible as a charitable contribution. The exact amount will be specified in your membership confirmation.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">Can I add people to my membership?</h3>
              <p className="text-gray-600 font-['Lora']">Family memberships can add one additional guest for an extra fee. Please contact our membership office for details and pricing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
'use client';

import React from 'react';
import { ArrowLeft, Phone, Shield } from 'lucide-react';

const schemes = [
  {
    id: "1",
    name: "Rashtriya Gokul Mission",
    description: "National mission for development and conservation of indigenous breeds through selective breeding",
    benefits: [
      "Financial assistance for breed improvement",
      "Artificial insemination services",
      "Training programs",
      "Equipment subsidies"
    ],
    applicationProcess: "Apply through Animal Husbandry Department",
    contactInfo: "Contact District Animal Husbandry Officer",
    category: "Breeding"
  },
  {
    id: "2", 
    name: "National Livestock Insurance Scheme",
    description: "Insurance coverage for cattle and buffalo against death due to disease, accident, etc.",
    benefits: [
      "Insurance coverage up to market value",
      "Premium subsidy of 50% for general farmers",
      "Premium subsidy of 75% for SC/ST farmers",
      "Quick claim settlement"
    ],
    applicationProcess: "Apply through nearest bank or insurance company",
    contactInfo: "Contact local bank branch or insurance agent",
    category: "Insurance"
  },
  {
    id: "3",
    name: "Dairy Entrepreneurship Development Scheme",
    description: "Financial assistance for setting up dairy farms and milk processing units",
    benefits: [
      "Bank loan with 25% subsidy",
      "Training and technical support",
      "Marketing assistance",
      "Quality certification support"
    ],
    applicationProcess: "Apply through NABARD or designated banks",
    contactInfo: "Contact NABARD District Development Manager",
    category: "Subsidy"
  }
];

export default function GovernmentSchemesPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-foreground">
              Government Schemes
            </h1>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            {schemes.length} Schemes
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <div className="space-y-4">
          {schemes.map((scheme) => (
            <div key={scheme.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      {scheme.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {scheme.description}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    scheme.category === 'Breeding' ? 'bg-blue-100 text-blue-800' :
                    scheme.category === 'Insurance' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {scheme.category}
                  </span>
                </div>
                
                {/* Benefits */}
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2 text-gray-900">Key Benefits:</h4>
                  <ul className="space-y-1">
                    {scheme.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Application Process */}
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2 text-gray-900">Application Process:</h4>
                  <p className="text-sm text-gray-600">{scheme.applicationProcess}</p>
                </div>
                
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg mb-4">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Contact:</p>
                    <p className="text-sm text-gray-600">{scheme.contactInfo}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Learn More
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

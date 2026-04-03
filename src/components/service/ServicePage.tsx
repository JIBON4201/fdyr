// =====================================================
// SERVICE PAGE COMPONENT
// Customer service center (DB/API independent)
// =====================================================

'use client';

import { Card } from '@/components/ui/card';
import { Headphones, HelpCircle, ChevronRight } from 'lucide-react';

export function ServicePage() {
  // Fixed default settings (no DB/API required)
  const customerServiceLink = 'https://t.me/Customerservice1541';
  const serviceHours = '07:00-23:00 (UK)';
  const customerServiceMessage = 'Online customer service';
  const helpMessage = 'Help';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-xl font-bold text-center">Customer Service Center</h1>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Service Hours */}
        <p className="text-center text-gray-500 text-sm mb-8">
          Online customer service time {serviceHours}
        </p>

        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <div className="w-40 h-40 bg-pink-100 rounded-full flex items-center justify-center">
            <Headphones className="w-20 h-20 text-blue-500" />
          </div>
        </div>

        {/* Service Options */}
        <div className="space-y-4">
          {/* Online Customer Service */}
          <Card
            className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => window.open(customerServiceLink, '_blank')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Headphones className="w-6 h-6 text-blue-500" />
              </div>
              <span className="font-medium">{customerServiceMessage}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Card>

          {/* Help */}
          <Card className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-green-500" />
              </div>
              <span className="font-medium">{helpMessage}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Headphones, HelpCircle, ChevronRight } from 'lucide-react';

interface CustomerServiceSettings {
  customer_service_hours?: string;
  customer_service_link?: string;
  customer_service_message?: string;
  help_message?: string;
}

export function ServicePage() {
  // ✅ Fallback values added
  const fallbackSettings: CustomerServiceSettings = {
    customer_service_link: 'https://t.me/Customerservice1541',
    customer_service_hours: '07:00-23:00 (UK)',
    customer_service_message: 'Online customer service',
    help_message: 'Help',
  };

  const [settings, setSettings] = useState<CustomerServiceSettings>(fallbackSettings);

  useEffect(() => {
    fetch('/api/settings/customer-service')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // ✅ Merge API data with fallback
          setSettings({ ...fallbackSettings, ...data.data });
        }
      })
      .catch(() => {
        // API fail হলে fallback ব্যবহার হবে
        setSettings(fallbackSettings);
      });
  }, []);

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
          Online customer service time {settings.customer_service_hours}
        </p>

        {/* Service Options */}
        <div className="space-y-4">
          <Card
            className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              const link = settings.customer_service_link || fallbackSettings.customer_service_link;
              window.open(link, '_blank');
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Headphones className="w-6 h-6 text-blue-500" />
              </div>
              <span className="font-medium">{settings.customer_service_message}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Card>
        </div>
      </div>
    </div>
  );
}

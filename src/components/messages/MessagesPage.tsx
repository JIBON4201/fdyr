// =====================================================
// MESSAGES PAGE COMPONENT
// Message center for announcements and notifications
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, Bell, PartyPopper } from 'lucide-react';
import type { Message } from '@/types';

export function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('announcement');

  useEffect(() => {
    fetchMessages();
  }, [activeType]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/list?type=${activeType}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-yellow-500" />;
      case 'notification':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'activity':
        return <PartyPopper className="w-5 h-5 text-pink-500" />;
      default:
        return <Megaphone className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-xl font-bold text-center">Message Center</h1>
      </div>

      {/* Type Tabs */}
      <div className="bg-white px-4 py-3 border-b sticky top-0 z-10">
        <Tabs value={activeType} onValueChange={setActiveType}>
          <TabsList className="w-full grid grid-cols-3 bg-transparent">
            <TabsTrigger 
              value="announcement" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent"
            >
              Announcement
            </TabsTrigger>
            <TabsTrigger 
              value="notification" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent"
            >
              Notification
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent"
            >
              Activity
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Messages List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B0000]"></div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No more</p>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(message.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm line-clamp-1">{message.title}</h3>
                    <span className="text-gray-400 text-xs ml-2 whitespace-nowrap">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{message.content}</p>
                </div>
              </div>
            </Card>
          ))
        )}

        {messages.length > 0 && (
          <p className="text-center text-gray-400 text-sm py-4">No more</p>
        )}
      </div>
    </div>
  );
}

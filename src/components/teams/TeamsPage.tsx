// =====================================================
// TEAMS PAGE COMPONENT
// User team/referral information with invite code sharing
// 3-Level Commission System: Level 1 = 10%, Level 2 = 5%, Level 3 = 2%
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Share2, Users, Gift, DollarSign, TrendingUp, Clock, Crown } from 'lucide-react';

interface Commission {
  id: string;
  depositAmount: number;
  commissionRate: number;
  commissionAmount: number;
  level: number;
  createdAt: string;
  referral: {
    id: string;
    username: string;
    vipLevel: number;
    createdAt: string;
  };
}

interface LevelStats {
  total: number;
  count: number;
  rate: number;
}

interface TeamStats {
  1: number;
  2: number;
  3: number;
}

interface CommissionData {
  commissions: Commission[];
  levelStats: {
    1: LevelStats;
    2: LevelStats;
    3: LevelStats;
  };
  teamStats: TeamStats;
  totalCommission: number;
}

// Commission rates
const COMMISSION_RATES = {
  1: { rate: 10, label: '10%', color: 'text-green-600' },
  2: { rate: 5, label: '5%', color: 'text-blue-600' },
  3: { rate: 2, label: '2%', color: 'text-purple-600' },
};

export function TeamsPage() {
  const { user } = useUserStore();
  const [data, setData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState('1');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/commissions');
      const responseData = await res.json();
      if (responseData.success) {
        setData(responseData.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async () => {
    if (user?.inviteCode) {
      await navigator.clipboard.writeText(user.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareInviteCode = async () => {
    if (navigator.share && user?.inviteCode) {
      try {
        await navigator.share({
          title: 'Join MALL Platform',
          text: `Join MALL and start earning! Use my invite code: ${user.inviteCode}. Earn up to 10% commission on referrals!`,
          url: window.location.origin,
        });
      } catch {
        // User cancelled share
      }
    } else {
      copyInviteCode();
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
    });
  };

  const filteredCommissions = data?.commissions.filter(
    (c) => c.level === parseInt(activeLevel)
  ) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B0000]"></div>
      </div>
    );
  }

  const totalTeam = (data?.teamStats[1] || 0) + (data?.teamStats[2] || 0) + (data?.teamStats[3] || 0);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Invite Code Section - PROMINENT */}
      <div className="bg-gradient-to-r from-[#6B0000] to-[#8B0000] text-white p-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Gift className="w-6 h-6 text-yellow-400" />
          <h2 className="text-lg font-bold">Invite Friends & Earn</h2>
        </div>

        <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
          <p className="text-sm text-white/80 text-center mb-2">Your Invite Code</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold tracking-wider">{user?.inviteCode}</span>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={copyInviteCode}
              className="flex-1 bg-white text-[#6B0000] hover:bg-gray-100"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
            <Button
              onClick={shareInviteCode}
              className="flex-1 bg-yellow-500 text-black hover:bg-yellow-400"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </Card>

        <p className="text-xs text-white/60 text-center mt-3">
          Earn commission when your referrals make their first deposit!
        </p>
      </div>

      {/* Commission Rates Info */}
      <div className="bg-yellow-50 border-b border-yellow-200 p-4">
        <h3 className="font-bold text-center mb-3 text-yellow-800">
          💰 3-Level Referral Commission
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white p-2 rounded-lg border">
            <p className="font-bold text-green-600">Level 1</p>
            <p className="text-lg font-bold text-green-600">10%</p>
            <p className="text-gray-500">Direct Referral</p>
          </div>
          <div className="bg-white p-2 rounded-lg border">
            <p className="font-bold text-blue-600">Level 2</p>
            <p className="text-lg font-bold text-blue-600">5%</p>
            <p className="text-gray-500">Referral's Referral</p>
          </div>
          <div className="bg-white p-2 rounded-lg border">
            <p className="font-bold text-purple-600">Level 3</p>
            <p className="text-lg font-bold text-purple-600">2%</p>
            <p className="text-gray-500">3rd Level</p>
          </div>
        </div>
        <p className="text-xs text-center text-yellow-700 mt-2">
          Commission is earned on referral's FIRST deposit only
        </p>
      </div>

      {/* Total Earnings Card */}
      <div className="p-4">
        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Commission Earned</p>
              <p className="text-3xl font-bold text-green-600">
                ${(data?.totalCommission || 0).toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Team Stats */}
      <div className="bg-white mx-4 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#6B0000]" />
          <h3 className="font-bold">Team Statistics</h3>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{data?.teamStats[1] || 0}</p>
            <p className="text-xs text-gray-500">Level 1</p>
            <p className="text-xs text-green-600">${(data?.levelStats[1]?.total || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{data?.teamStats[2] || 0}</p>
            <p className="text-xs text-gray-500">Level 2</p>
            <p className="text-xs text-blue-600">${(data?.levelStats[2]?.total || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{data?.teamStats[3] || 0}</p>
            <p className="text-xs text-gray-500">Level 3</p>
            <p className="text-xs text-purple-600">${(data?.levelStats[3]?.total || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-sm text-gray-600">
            Total Team Members: <span className="font-bold text-[#6B0000]">{totalTeam}</span>
          </p>
        </div>
      </div>

      {/* Level Tabs for Commission Details */}
      <div className="bg-white px-4 py-3 border-b mt-4 sticky top-0 z-10">
        <Tabs value={activeLevel} onValueChange={setActiveLevel}>
          <TabsList className="w-full grid grid-cols-3 bg-transparent">
            <TabsTrigger
              value="1"
              className="data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none bg-transparent"
            >
              Level 1 (10%)
            </TabsTrigger>
            <TabsTrigger
              value="2"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none bg-transparent"
            >
              Level 2 (5%)
            </TabsTrigger>
            <TabsTrigger
              value="3"
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-600 rounded-none bg-transparent"
            >
              Level 3 (2%)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Commission List */}
      <div className="p-4 space-y-3">
        {filteredCommissions.length > 0 ? (
          filteredCommissions.map((commission) => (
            <Card key={commission.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-gray-600">
                    {commission.referral.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{commission.referral.username}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>VIP {commission.referral.vipLevel}</span>
                    <span>•</span>
                    <span>{formatDate(commission.createdAt)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    +${commission.commissionAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {commission.commissionRate}% of ${commission.depositAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No commissions at Level {activeLevel}</p>
            <p className="text-sm text-gray-400 mt-1">
              Invite friends to start earning!
            </p>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="p-4 mt-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-bold text-blue-800 mb-2">How Referral Commission Works</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Share your invite code with friends</li>
            <li>• When they register and make their FIRST deposit...</li>
            <li>• You earn <strong>10%</strong> commission (Level 1)</li>
            <li>• Your referrer earns <strong>5%</strong> (Level 2)</li>
            <li>• Their referrer earns <strong>2%</strong> (Level 3)</li>
          </ul>
          <p className="text-xs text-blue-600 mt-2">
            Commission is automatically credited to your balance!
          </p>
        </Card>
      </div>
    </div>
  );
}

import { FC } from 'react';
import { X, MessageSquare, Sparkles } from 'lucide-react';
import { Campaign } from '../types';
import { AllCampaignUpdatesFeed } from './AllCampaignUpdatesFeed';

interface CommunityUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onDonateToCampaign: (campaign: Campaign) => void;
  onPostUpdate?: (
    campaignId: string,
    title: string,
    content: string,
    author?: string,
    imageUrl?: string,
    category?: 'update' | 'milestone' | 'receipt' | 'story' | 'gratitude'
  ) => Promise<void>;
}

export const CommunityUpdatesModal: FC<CommunityUpdatesModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  onSelectCampaign,
  onDonateToCampaign,
  onPostUpdate,
}) => {
  if (!isOpen) return null;

  // Calculate total posts count
  const totalPosts = campaigns.reduce((acc, c) => acc + (c.updates?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-200 w-full max-w-5xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-white px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Uganda Fundraiser Updates & Transparency Feed
                </h3>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {totalPosts} Posts
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                All real-time progress updates, hospital receipts, and community notes across Uganda
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <AllCampaignUpdatesFeed
            campaigns={campaigns}
            onSelectCampaign={(c) => {
              onClose();
              onSelectCampaign(c);
            }}
            onDonateToCampaign={(c) => {
              onClose();
              onDonateToCampaign(c);
            }}
            onPostUpdate={onPostUpdate}
          />
        </div>
      </div>
    </div>
  );
};

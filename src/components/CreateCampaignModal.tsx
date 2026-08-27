import React, { useState, useRef } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Church,
  Coins,
  FileText,
  GraduationCap, 
  HeartHandshake, 
  Image as ImageIcon, 
  Info,
  Landmark,
  Mail,
  MapPin, 
  Phone,
  Plus,
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  Stethoscope, 
  Trash2,
  UploadCloud,
  X 
} from 'lucide-react';
import { Campaign } from '../types';
import { api } from '../services/api';
import { formatUGX } from '../utils/formatters';

interface CreateCampaignModalProps {
  onClose: () => void;
  onCampaignCreated: (newCampaign: Campaign) => void;
}

const DISTRICTS = [
  'Kampala', 'Wakiso', 'Gulu', 'Jinja', 'Mbarara', 'Mbale', 
  'Fort Portal', 'Arua', 'Lira', 'Masaka', 'Soroti', 'Mukono', 
  'Kasese', 'Kabale', 'Tororo', 'Entebbe', 'Masindi', 'Iganga'
];

const PRESET_CAUSE_PHOTOS = [
  { label: 'Hospital & Medical', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80', category: 'medical' },
  { label: 'Doctor & Patient Care', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80', category: 'medical' },
  { label: 'School & Pupils', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', category: 'education' },
  { label: 'Classroom & Study', url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80', category: 'education' },
  { label: 'Clean Water & Borehole', url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80', category: 'community' },
  { label: 'Solar & Community', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80', category: 'community' },
  { label: 'Church & Worship', url: 'https://images.unsplash.com/photo-1548625361-195972844e13?auto=format&fit=crop&w=1200&q=80', category: 'faith' },
  { label: 'Choir & Ministry', url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80', category: 'faith' },
  { label: 'SACCO & Market Women', url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80', category: 'sacco' },
  { label: 'Produce & Business', url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80', category: 'business' },
  { label: 'Youth Agribusiness', url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1200&q=80', category: 'business' },
  { label: 'Emergency Relief', url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80', category: 'emergency' }
];

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  onClose,
  onCampaignCreated,
}) => {
  const [step, setStep] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<'medical' | 'education' | 'emergency' | 'community' | 'business' | 'faith' | 'sacco'>('medical');
  const [district, setDistrict] = useState('Kampala');
  const [region, setRegion] = useState('Central');
  const [targetAmount, setTargetAmount] = useState<string>('5000000');
  const [story, setStory] = useState('');
  
  // Cause pictures state (multiple images support)
  const [causeImages, setCauseImages] = useState<string[]>([
    PRESET_CAUSE_PHOTOS[0].url
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState('Self');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [beneficiaryEmail, setBeneficiaryEmail] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerPhone, setOrganizerPhone] = useState('');
  const [payoutProvider, setPayoutProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    if (['Kampala', 'Wakiso', 'Mukono', 'Masaka', 'Entebbe'].includes(d)) {
      setRegion('Central');
    } else if (['Jinja', 'Mbale', 'Soroti', 'Tororo', 'Iganga'].includes(d)) {
      setRegion('Eastern');
    } else if (['Gulu', 'Arua', 'Lira'].includes(d)) {
      setRegion('Northern');
    } else {
      setRegion('Western');
    }
  };

  // Add image from URL
  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    if (!causeImages.includes(customImageUrl.trim())) {
      setCauseImages(prev => [...prev, customImageUrl.trim()]);
    }
    setCustomImageUrl('');
  };

  // Add preset photo
  const handleTogglePresetPhoto = (url: string) => {
    if (causeImages.includes(url)) {
      if (causeImages.length > 1) {
        setCauseImages(prev => prev.filter(img => img !== url));
      }
    } else {
      setCauseImages(prev => [...prev, url]);
    }
  };

  // Set as primary/cover
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setCauseImages(prev => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      copy.unshift(selected);
      return copy;
    });
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    if (causeImages.length <= 1) {
      setError('Please keep at least one picture to show your cause.');
      return;
    }
    setCauseImages(prev => prev.filter((_, i) => i !== index));
  };

  // Helper to resize/compress uploaded images to clean, fast base64 data URLs
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string || '');
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(event.target?.result as string || '');
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // File upload handler with compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        try {
          const compressed = await compressImageFile(file);
          if (compressed) {
            setCauseImages(prev => [...prev, compressed]);
          }
        } catch (err) {
          console.error('Error reading image file:', err);
        }
      }
    }
    // reset input so the same file can be re-selected if desired
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || !story.trim() || !organizerName.trim() || !organizerPhone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const data = await api.createCampaign({
        title: title.trim(),
        tagline: tagline.trim() || title.trim().slice(0, 80),
        category,
        region,
        district,
        targetAmount: Number(targetAmount),
        story: story.trim(),
        image: causeImages[0] || PRESET_CAUSE_PHOTOS[0].url,
        images: causeImages.length > 0 ? causeImages : [PRESET_CAUSE_PHOTOS[0].url],
        beneficiaryName: beneficiaryName.trim() || organizerName.trim(),
        beneficiaryRelationship: beneficiaryRelationship.trim() || 'Self',
        beneficiaryPhone: beneficiaryPhone.trim() || organizerPhone.trim(),
        beneficiaryEmail: beneficiaryEmail.trim(),
        organizerName: organizerName.trim(),
        organizerPhone: organizerPhone.trim(),
        payoutProvider,
        payoutPhone: payoutPhone.trim() || organizerPhone.trim()
      });

      if (data.success && data.campaign) {
        onCampaignCreated(data.campaign);
        onClose();
      } else {
        setError('Failed to create campaign');
      }
    } catch (err: any) {
      console.error('Campaign creation error:', err);
      setError(err.message || 'Network error creating campaign. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      <div 
        className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 my-0 sm:my-6 max-h-[95dvh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1 bg-slate-900">
          <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
        </div>
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <h3 className="font-bold text-sm sm:text-lg flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-400" />
              <span>Start a Fundraiser on Kusanya.org</span>
            </h3>
            <p className="text-xs text-slate-400">
              Direct Mobile Money donations via MTN MoMo (*165#) & Airtel Money (*185#)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="bg-slate-50 px-4 sm:px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-600 overflow-x-auto whitespace-nowrap shrink-0">
          <span className={step === 1 ? 'text-emerald-700 font-bold' : ''}>1. Cause & Photos</span>
          <span>→</span>
          <span className={step === 2 ? 'text-emerald-700 font-bold' : ''}>2. Story & Beneficiary</span>
          <span>→</span>
          <span className={step === 3 ? 'text-emerald-700 font-bold' : ''}>3. MoMo Settlement</span>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto">

        {/* Zero Deductions Platform Transparency Banner */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 px-4 sm:px-5 py-2 flex items-center justify-between text-[11px] text-emerald-900">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span><strong>Zero Deductions Model:</strong> 100% of all donations go directly to the cause with 0% platform deductions.</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 text-xs p-3 border-b border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          {/* STEP 1: Basic Cause, Target & Photos */}
          {step === 1 && (
            <div className="space-y-4">
              
              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Select Cause Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'medical', label: 'Medical & Surgery', icon: Stethoscope },
                    { id: 'education', label: 'School Tuition', icon: GraduationCap },
                    { id: 'community', label: 'Water & Solar', icon: HeartHandshake },
                    { id: 'faith', label: 'Church & Ministry', icon: Church },
                    { id: 'sacco', label: 'SACCO & Savings', icon: Landmark },
                    { id: 'emergency', label: 'Emergency Relief', icon: Sparkles },
                    { id: 'business', label: 'Youth Agribusiness', icon: Building2 },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Fundraiser Headline / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mulago Hospital Emergency Pediatric Surgery for Baby Trevor"
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                  required
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Short Tagline (1 sentence summary)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Urgent heart surgery consumables and ICU recovery costs in Kampala."
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* District & Region & Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    District in Uganda
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Fundraising Target (UGX)
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="5000000"
                    min={10000}
                    className="w-full p-2.5 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                    required
                  />
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                    Target: {formatUGX(Number(targetAmount) || 0)} (100% Direct to Cause • Zero Deductions)
                  </span>
                </div>
              </div>

              {/* PICTURES TO SHOW THE CAUSE SECTION */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>Pictures to Show Your Cause ({causeImages.length} attached)</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Add medical admission letters, doctor recommendations, receipts, school fee invoices, or construction site photos to build donor trust.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Photos</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Uploaded / Selected Cause Photos List */}
                {causeImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {causeImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-300 aspect-video bg-slate-900">
                        <img src={imgUrl} alt={`Cause Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        
                        {/* Cover badge */}
                        {idx === 0 ? (
                          <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                            COVER
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            className="absolute top-1 left-1 bg-slate-900/80 hover:bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer opacity-90 group-hover:opacity-100"
                          >
                            Set Cover
                          </button>
                        )}

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer"
                          title="Remove picture"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Custom Image URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Or paste an image URL (e.g. https://...)"
                    className="flex-1 p-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add URL</span>
                  </button>
                </div>

                {/* Preset Cause Photos Selection */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                    Or select from suggested category photos:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {PRESET_CAUSE_PHOTOS.map((preset) => {
                      const isAttached = causeImages.includes(preset.url);
                      return (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => handleTogglePresetPhoto(preset.url)}
                          className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer text-left ${
                            isAttached 
                              ? 'border-emerald-500 ring-2 ring-emerald-400 scale-[0.98]' 
                              : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                          {isAttached && (
                            <div className="absolute inset-0 bg-emerald-900/30 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!title.trim()) {
                      setError('Please provide a fundraiser headline.');
                      return;
                    }
                    setError('');
                    setStep(2);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md cursor-pointer"
                >
                  Next: Cause Story & Details →
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: Story & Beneficiary */}
          {step === 2 && (
            <div className="space-y-4">
              
              {/* Beneficiary details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Beneficiary & Direct Contact Info</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">
                    Displayed on Campaign Page
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Beneficiary Full Name *
                    </label>
                    <input
                      type="text"
                      value={beneficiaryName}
                      onChange={(e) => setBeneficiaryName(e.target.value)}
                      placeholder="e.g. Trevor Sserwadda / Paicho Primary Pupils"
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Relationship to Beneficiary *
                    </label>
                    <input
                      type="text"
                      value={beneficiaryRelationship}
                      onChange={(e) => setBeneficiaryRelationship(e.target.value)}
                      placeholder="e.g. Son / Mother / School Headteacher / SACCO"
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        Beneficiary Contact Phone *
                      </label>
                      {organizerPhone && (
                        <button
                          type="button"
                          onClick={() => setBeneficiaryPhone(organizerPhone)}
                          className="text-[10px] text-emerald-600 hover:underline cursor-pointer"
                        >
                          Use organizer phone
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        value={beneficiaryPhone}
                        onChange={(e) => setBeneficiaryPhone(e.target.value)}
                        placeholder="e.g. +256 772 123456 / 0754 119834"
                        className="w-full pl-8 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                      />
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Enables donors to call, WhatsApp, or send direct encouragement.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Beneficiary Email / Alternative Contact (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={beneficiaryEmail}
                        onChange={(e) => setBeneficiaryEmail(e.target.value)}
                        placeholder="e.g. info@school.ug / patient@gmail.com"
                        className="w-full pl-8 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Story Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Detailed Story & Budget Breakdown
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Be specific with costs in UGX for maximum donor trust
                  </span>
                </div>
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  rows={8}
                  placeholder={`Explain clearly:\n1. Who is receiving help and what happened\n2. Exact budget breakdown in UGX (e.g. Surgery consumables: 15M UGX, ICU: 5M UGX, Medications: 5M UGX)\n3. How funds will be withdrawn via Mobile Money and audited\n4. Thank donors in advance (Webale nnyo / Mukama abawe omukisa)`}
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 leading-relaxed font-normal"
                  required
                />
              </div>

              {/* Story writing tips */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 text-xs space-y-1.5">
                <span className="font-bold text-slate-900 block">💡 Tips for a successful Ugandan fundraiser:</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                  <li>Attach actual cause photos (invoices, hospital badges, project site) from Step 1.</li>
                  <li>State the hospital, school, or SACCO registration name clearly.</li>
                  <li>Share your campaign link on WhatsApp groups and Facebook for rapid community momentum.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← Back to Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!story.trim()) {
                      setError('Please write a story describing your cause.');
                      return;
                    }
                    setError('');
                    setStep(3);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md cursor-pointer"
                >
                  Next: Payout Settlement →
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Organizer & Payout Phone */}
          {step === 3 && (
            <div className="space-y-4">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Instant Mobile Money Disbursement</span>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    All MTN MoMo and Airtel Money donations made to your fundraiser can be withdrawn in real-time to your registered phone number. 100% is paid out directly with zero platform deductions.
                  </p>
                </div>
              </div>

              {/* Organizer Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Organizer Full Name (As registered on Mobile Money ID)
                </label>
                <input
                  type="text"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="e.g. Sarah Nalubega"
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                  required
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Organizer Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={organizerPhone}
                  onChange={(e) => setOrganizerPhone(e.target.value)}
                  placeholder="0772 458912 or 0701 554320"
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                  required
                />
              </div>

              {/* Payout Provider & Number */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Mobile Money Payout Destination
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutProvider('mtn')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      payoutProvider === 'mtn'
                        ? 'bg-yellow-400 text-slate-900 border-yellow-500 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>MTN MoMo (*165#)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutProvider('airtel')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      payoutProvider === 'airtel'
                        ? 'bg-red-600 text-white border-red-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>Airtel Money (*185#)</span>
                  </button>
                </div>

                <input
                  type="tel"
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  placeholder="Registered MoMo Payout Phone (e.g. 0772 458912)"
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 mt-2"
                />
              </div>

              {/* Summary card before launch */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1 text-slate-700">
                <div className="flex justify-between font-medium">
                  <span>Target Amount:</span>
                  <span className="font-bold text-slate-900">{formatUGX(Number(targetAmount) || 0)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Cause Photos Attached:</span>
                  <span className="font-bold text-emerald-700">{causeImages.length} Pictures</span>
                </div>
                <div className="flex justify-between font-medium text-emerald-800">
                  <span>Net Direct to Beneficiary:</span>
                  <span className="font-bold">{formatUGX(Number(targetAmount) || 0)} (100%)</span>
                </div>
              </div>

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← Back to Story
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-full shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing Fundraiser...</span>
                    </>
                  ) : (
                    <span>🚀 Launch Fundraiser Live on Kusanya</span>
                  )}
                </button>
              </div>

            </div>
          )}

        </form>

        </div>

      </div>

    </div>
  );
};

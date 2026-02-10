
import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Users, 
  DollarSign, 
  Package, 
  CheckCircle, 
  Search, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { getDonationImpact } from '../services/geminiService';

interface ActivityLog {
  id: string;
  type: 'volunteer' | 'donation';
  name: string;
  description: string;
  time: string;
}

interface VolunteerDonationProps {
  language: string;
  t: any;
}

const VolunteerDonation: React.FC<VolunteerDonationProps> = ({ language, t }) => {
  const [tab, setTab] = useState<'volunteer' | 'donation'>('volunteer');
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState<{status: string, message: string} | null>(null);

  const [impactAssessment, setImpactAssessment] = useState<string | null>(null);
  const [assessingImpact, setAssessingImpact] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    skills: [] as string[],
    availability: 'Available Immediately',
    donationType: 'funds',
    donationDetails: '',
    amount: ''
  });

  // Mock Activity Feed
  const [activity, setActivity] = useState<ActivityLog[]>([
    { id: '1', type: 'volunteer', name: 'Amit S.', description: 'Registered as Medical Volunteer', time: '5 mins ago' },
    { id: '2', type: 'donation', name: 'Priya K.', description: 'Donated 50 Emergency Kits', time: '12 mins ago' },
    { id: '3', type: 'donation', name: 'Rahul M.', description: 'Pledged ₹5,000 for Relief', time: '45 mins ago' }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill) 
        : [...prev.skills, skill]
    }));
  };

  const handleAssessImpact = async () => {
    if (!formData.amount && !formData.donationDetails) return;
    setAssessingImpact(true);
    try {
      const val = formData.donationType === 'funds' ? formData.amount : formData.donationDetails;
      const res = await getDonationImpact(val, formData.donationType, language);
      setImpactAssessment(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAssessingImpact(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = 'RN-' + Math.floor(1000 + Math.random() * 9000);
    setApplicationId(newId);
    setSubmitted(true);
    
    const newEntry: ActivityLog = {
      id: Date.now().toString(),
      type: tab,
      name: formData.name,
      description: tab === 'volunteer' ? `Registered as ${formData.skills[0] || 'General'} Volunteer` : `Donated to Relief efforts`,
      time: 'Just now'
    };
    setActivity([newEntry, ...activity.slice(0, 4)]);
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.startsWith('RN-')) {
      setTrackingResult({
        status: language === 'hi' ? 'समीक्षा के अधीन' : 'Under Review',
        message: language === 'hi' ? 'आपका आवेदन प्राप्त हो गया है और वर्तमान में हमारे क्षेत्रीय समन्वयकों द्वारा सत्यापित किया जा रहा है।' : 'Your application has been received and is currently being verified by our regional coordinators.'
      });
    } else {
      setTrackingResult({
        status: language === 'hi' ? 'नहीं मिला' : 'Not Found',
        message: language === 'hi' ? 'प्रदान किया गया ट्रैकिंग कोड हमारे रिकॉर्ड से मेल नहीं खाता है। कृपया सत्यापित करें और पुनः प्रयास करें।' : 'The provided tracking code does not match our records. Please verify and try again.'
      });
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setImpactAssessment(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      skills: [],
      availability: 'Available Immediately',
      donationType: 'funds',
      donationDetails: '',
      amount: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Application Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b-2 border-gray-200 bg-white rounded-t-3xl overflow-hidden">
            <button 
              onClick={() => { setTab('volunteer'); setSubmitted(false); }}
              className={`flex-1 px-4 py-4 text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 ${tab === 'volunteer' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Users className="w-4 h-4" />
              {t.community.volunteerReg}
            </button>
            <button 
              onClick={() => { setTab('donation'); setSubmitted(false); }}
              className={`flex-1 px-4 py-4 text-sm font-bold uppercase transition-all flex items-center justify-center gap-2 ${tab === 'donation' ? 'bg-rose-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Heart className="w-4 h-4" />
              {t.community.donationPortal}
            </button>
          </div>

          <div className="glass-panel p-8 min-h-[500px]">
            {submitted ? (
              <div className="py-20 text-center space-y-6 animate-in zoom-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto border-4 border-green-50">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase">{t.common.success}</h3>
                  <p className="text-slate-400 mt-2">{language === 'hi' ? 'आपका आवेदन कोड है:' : 'Your application code is:'} <span className="font-black text-indigo-500 select-all">{applicationId}</span></p>
                </div>
                <div className="pt-6">
                  <button 
                    onClick={resetForm}
                    className="btn-action bg-indigo-600 px-8 py-3 text-xs text-white"
                  >
                    {language === 'hi' ? 'एक और आवेदन जमा करें' : 'Submit Another Application'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-[var(--text-main)]">
                <div className="bg-indigo-500/5 p-4 border-l-4 border-indigo-500 mb-6 rounded-r-xl">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest leading-relaxed">
                    {tab === 'volunteer' 
                      ? (language === 'hi' ? "हमारे रैपिड रिस्पॉन्स नेटवर्क से जुड़ें। स्वयंसेवक आपदा राहत की रीढ़ हैं।" : "Join our rapid response network. Volunteers are the backbone of disaster recovery.") 
                      : (language === 'hi' ? "आपका योगदान प्रभावित क्षेत्रों को तत्काल जीवन रक्षक आपूर्ति प्रदान करता है।" : "Your contributions provide life-saving supplies to impacted regions immediately.")}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 tracking-widest">{language === 'hi' ? 'पूरा कानूनी नाम' : 'Full Legal Name'}</label>
                    <input 
                      required 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-sm rounded-xl focus:border-indigo-500 outline-none" 
                      placeholder={language === 'hi' ? "उदा., राजेश कुमार" : "e.g., Rajesh Kumar"} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 tracking-widest">{language === 'hi' ? 'ईमेल पता' : 'Email Address'}</label>
                    <input 
                      required 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email" 
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-sm rounded-xl focus:border-indigo-500 outline-none" 
                      placeholder="name@example.com" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 tracking-widest">{language === 'hi' ? 'प्राथमिक संपर्क नंबर' : 'Primary Contact No.'}</label>
                    <input 
                      required 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      type="tel" 
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-sm rounded-xl focus:border-indigo-500 outline-none" 
                      placeholder="+91 XXXXX XXXXX" 
                    />
                  </div>
                  {tab === 'volunteer' && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 tracking-widest">{language === 'hi' ? 'तैनाती तत्परता' : 'Deployment Readiness'}</label>
                      <select 
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-sm rounded-xl focus:border-indigo-500 outline-none text-[var(--text-main)]"
                      >
                        <option>{language === 'hi' ? 'तुरंत उपलब्ध' : 'Available Immediately'}</option>
                        <option>{language === 'hi' ? '24 घंटे के भीतर' : 'Within 24 Hours'}</option>
                        <option>{language === 'hi' ? 'केवल सप्ताहांत' : 'Weekends Only'}</option>
                        <option>{language === 'hi' ? 'रिमोट सपोर्ट' : 'Remote Support'}</option>
                      </select>
                    </div>
                  )}
                </div>

                {tab === 'volunteer' ? (
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-widest">{language === 'hi' ? 'विशेषज्ञता और कौशल (सभी लागू चुनें)' : 'Expertise & Skillsets (Select all that apply)'}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['First Aid', 'SAR', 'Cooking', 'Vehicle', 'Data Entry', 'Language', 'Counseling', 'Electrical'].map(skill => (
                        <label 
                          key={skill} 
                          className={`flex items-center gap-2 p-3 border rounded-xl text-[10px] font-bold cursor-pointer transition-all ${formData.skills.includes(skill) ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-[var(--input-bg)] border-[var(--border-panel)] text-slate-400 hover:border-indigo-500/50'}`}
                        >
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 hidden" 
                            checked={formData.skills.includes(skill)}
                            onChange={() => handleSkillToggle(skill)}
                          />
                          <span>{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-3 tracking-widest">{language === 'hi' ? 'योगदान श्रेणी' : 'Contribution Category'}</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'funds', label: language === 'hi' ? 'वित्तीय' : 'Financial', icon: DollarSign },
                          { id: 'items', label: language === 'hi' ? 'सामग्री' : 'Material', icon: Package },
                          { id: 'other', label: language === 'hi' ? 'सेवाएं' : 'Services', icon: Users }
                        ].map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => { setFormData(prev => ({...prev, donationType: type.id})); setImpactAssessment(null); }}
                            className={`p-4 border rounded-2xl text-center transition-all ${formData.donationType === type.id ? 'bg-rose-600/10 border-rose-500 text-rose-400' : 'bg-[var(--input-bg)] border-[var(--border-panel)] text-slate-500 hover:bg-slate-800'}`}
                          >
                            <type.icon className="w-5 h-5 mx-auto mb-2" />
                            <p className="text-[9px] font-black uppercase tracking-widest">{type.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.donationType === 'funds' ? (
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 tracking-widest">{language === 'hi' ? 'गिरवी राशि (₹)' : 'Pledge Amount (₹)'}</label>
                            <input 
                              required
                              name="amount"
                              value={formData.amount}
                              onChange={handleInputChange}
                              type="number" 
                              className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-sm rounded-xl focus:border-rose-500 outline-none" 
                              placeholder="e.g., 1000" 
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 tracking-widest">{language === 'hi' ? 'वस्तुओं का विवरण' : 'Details of Items'}</label>
                            <textarea 
                              required
                              name="donationDetails"
                              value={formData.donationDetails}
                              onChange={handleInputChange}
                              rows={3} 
                              className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-sm rounded-xl focus:border-rose-500 outline-none" 
                              placeholder={language === 'hi' ? "मात्रा, प्रकार सूचीबद्ध करें..." : "List quantities, types..."}
                            ></textarea>
                          </div>
                        )}
                        
                        <div className="flex flex-col gap-4">
                          <button 
                            type="button"
                            onClick={handleAssessImpact}
                            disabled={assessingImpact || (!formData.amount && !formData.donationDetails)}
                            className="flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300 transition-colors disabled:opacity-30"
                          >
                            {assessingImpact ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            {t.community.impactAssessment}
                          </button>
                          
                          {impactAssessment && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[11px] font-bold text-rose-300 leading-relaxed italic animate-in slide-in-from-top-2">
                                "{impactAssessment}"
                            </div>
                          )}
                        </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[var(--border-panel)]">
                  <button 
                    type="submit" 
                    className={`w-full py-5 rounded-2xl text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all ${tab === 'volunteer' ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-rose-600 shadow-rose-600/20'}`}
                  >
                    {t.community.confirmDispatch}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Tracking & Activity */}
        <div className="space-y-6">
          <div className="glass-panel overflow-hidden border-indigo-500/30">
            <div className="bg-indigo-600 text-white px-5 py-3 font-black text-[10px] uppercase flex items-center gap-3 tracking-[0.2em]">
              <Search className="w-4 h-4" />
              {t.community.trackReg}
            </div>
            <div className="p-6 space-y-4">
              <form onSubmit={handleTrack} className="flex gap-2">
                <input 
                  type="text" 
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="RN-XXXX" 
                  className="flex-1 bg-[var(--input-bg)] border border-[var(--border-panel)] rounded-xl px-4 py-3 text-xs uppercase placeholder:lowercase focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-500 transition-all">GO</button>
              </form>
              
              {trackingResult && (
                <div className={`p-4 rounded-2xl border animate-in slide-in-from-top-2 duration-300 ${trackingResult.status === 'Not Found' || trackingResult.status === 'नहीं मिला' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${trackingResult.status === 'Not Found' || trackingResult.status === 'नहीं मिला' ? 'text-rose-500' : 'text-indigo-400'}`}>{trackingResult.status}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 leading-normal">{trackingResult.message}</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel">
            <div className="bg-slate-800/30 px-5 py-3 border-b border-[var(--border-panel)] font-black text-[10px] uppercase flex items-center gap-3 tracking-[0.2em] text-slate-400">
              <Clock className="w-4 h-4 text-indigo-500" />
              {t.community.responseMatrix}
            </div>
            <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar">
              {activity.map((act) => (
                <div key={act.id} className="flex gap-4 items-start border-b border-[var(--border-panel)] pb-4 last:border-0 last:pb-0 group">
                  <div className={`mt-1 p-2 rounded-xl border ${act.type === 'volunteer' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                    {act.type === 'volunteer' ? <Users className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black text-white">{act.name}</span>
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{act.time}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 leading-tight group-hover:text-slate-300 transition-colors uppercase tracking-tight">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDonation;

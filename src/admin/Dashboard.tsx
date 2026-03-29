import React, { useState, useEffect } from 'react';
import { logout, getContent, updateSection, updateCase, createCase, deleteCase, updatePricing, createPricing, deletePricing, updateProcess, createProcess, deleteProcess, updateProblem, createProblem, deleteProblem, updateBenefit, createBenefit, deleteBenefit, updateFaq, createFaq, deleteFaq, uploadFile, getLeads, updateLeadStatus, deleteLead, getLeadStats, getStatusDistribution, getAdminArticles, createArticle, updateArticle, deleteArticle } from '../services/api';
import { 
  Layout, 
  LogOut, 
  ChevronRight, 
  Save, 
  Image as ImageIcon, 
  Plus, 
  X,
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Settings,
  Briefcase,
  DollarSign,
  Zap,
  HelpCircle,
  User,
  MessageSquare,
  Phone,
  Home,
  Monitor,
  Play,
  Mail,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  BarChart as BarChartIcon,
  FileText
} from 'lucide-react';

import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('leads');
  const [data, setData] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const tabs = [
    { id: 'stats', name: 'Аналітика', icon: <BarChartIcon size={20} /> },
    { id: 'leads', name: 'Заявки', icon: <Mail size={20} /> },
    { id: 'articles', name: 'Блог', icon: <FileText size={20} /> },
    { id: 'hero', name: 'Hero', icon: <Home size={20} /> },
    { id: 'problems', name: 'Problems', icon: <AlertCircle size={20} /> },
    { id: 'benefits', name: 'Benefits', icon: <Zap size={20} /> },
    { id: 'speed_roi', name: 'Speed / ROI', icon: <Zap size={20} /> },
    { id: 'cases', name: 'Cases', icon: <Briefcase size={20} /> },
    { id: 'process', name: 'Process', icon: <Monitor size={20} /> },
    { id: 'pricing', name: 'Pricing', icon: <DollarSign size={20} /> },
    { id: 'faq', name: 'FAQ', icon: <HelpCircle size={20} /> },
    { id: 'about', name: 'About', icon: <User size={20} /> },
    { id: 'cta', name: 'CTA', icon: <MessageSquare size={20} /> },
    { id: 'contacts', name: 'Contacts', icon: <Phone size={20} /> },
    { id: 'footer', name: 'Footer', icon: <Layout size={20} /> },
    { id: 'seo', name: 'SEO', icon: <Settings size={20} /> },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contentRes, leadsRes] = await Promise.all([
        getContent(),
        getLeads()
      ]);
      setData(contentRes.data);
      setLeads(leadsRes.data);
    } catch (err) {
      console.error('Failed to fetch content', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const showMessage = (text: string, type: string = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSaveSection = async (section: string, content: any) => {
    setSaving(true);
    try {
      await updateSection(section, content);
      showMessage('Збережено успішно!');
      fetchData();
    } catch (err) {
      showMessage('Помилка при збереженні', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEntity = async (type: string, id: number, entityData: any) => {
    setSaving(true);
    try {
      if (type === 'cases') await updateCase(id, entityData);
      else if (type === 'pricing') await updatePricing(id, entityData);
      else if (type === 'process') await updateProcess(id, entityData);
      else if (type === 'problems') await updateProblem(id, entityData);
      else if (type === 'benefits') await updateBenefit(id, entityData);
      else if (type === 'faq') await updateFaq(id, entityData);
      
      showMessage('Збережено успішно!');
      fetchData();
    } catch (err) {
      showMessage('Помилка при збереженні', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEntity = async (type: string, entityData: any) => {
    setSaving(true);
    try {
      if (type === 'cases') await createCase(entityData);
      else if (type === 'faq') await createFaq(entityData);
      else if (type === 'pricing') await createPricing(entityData);
      else if (type === 'process') await createProcess(entityData);
      else if (type === 'problems') await createProblem(entityData);
      else if (type === 'benefits') await createBenefit(entityData);
      showMessage('Створено успішно!');
      fetchData();
    } catch (err) {
      showMessage('Помилка при створенні', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntity = async (type: string, id: number) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей елемент?')) return;
    setSaving(true);
    try {
      if (type === 'cases') await deleteCase(id);
      else if (type === 'faq') await deleteFaq(id);
      else if (type === 'pricing') await deletePricing(id);
      else if (type === 'process') await deleteProcess(id);
      else if (type === 'problems') await deleteProblem(id);
      else if (type === 'benefits') await deleteBenefit(id);
      showMessage('Видалено успішно!');
      fetchData();
    } catch (err) {
      showMessage('Помилка при видаленні', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const response = await uploadFile(file);
      return response.data.url;
    } catch (err) {
      showMessage('Помилка завантаження файлу', 'error');
      return null;
    }
  };

  const handleUpdateLeadStatus = async (id: number, status: string) => {
    try {
      await updateLeadStatus(id, status);
      showMessage('Статус оновлено');
      fetchData();
    } catch (err) {
      showMessage('Помилка при оновленні статусу', 'error');
    }
  };

  const handleDeleteLead = async (id: number) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю заявку?')) return;
    try {
      await deleteLead(id);
      showMessage('Заявку видалено');
      fetchData();
    } catch (err) {
      showMessage('Помилка при видаленні', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="bg-slate-900 text-white px-2 py-1 rounded font-black text-sm">BRB</div>
          <div className="font-bold text-slate-900">Admin Panel</div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-1">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.name}
              {activeTab === tab.id && <ChevronRight className="ml-auto" size={16} />}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Вийти
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow ml-64 p-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 capitalize">{activeTab.replace('_', ' / ')}</h2>
              <p className="text-slate-500 mt-1">Редагування контенту секції</p>
            </div>
            
            {message.text && (
              <div className={`px-6 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${
                message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}>
                {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                <span className="font-medium">{message.text}</span>
              </div>
            )}
          </div>

          {/* Editor Area */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            {activeTab === 'stats' && (
              <StatsDashboard />
            )}
            {activeTab === 'articles' && (
              <ArticlesEditor 
                onUpload={handleFileUpload}
                saving={saving}
              />
            )}
            {activeTab === 'leads' && (
              <LeadsEditor 
                leads={leads} 
                onUpdateStatus={handleUpdateLeadStatus}
                onDelete={handleDeleteLead}
              />
            )}
            {activeTab === 'hero' && (
              <HeroEditor 
                content={data.content.hero} 
                onSave={(content) => handleSaveSection('hero', content)} 
                onUpload={handleFileUpload}
                saving={saving} 
              />
            )}
            {activeTab === 'about' && (
              <AboutEditor 
                content={data.content.about} 
                onSave={(content) => handleSaveSection('about', content)} 
                onUpload={handleFileUpload}
                saving={saving} 
              />
            )}
            {activeTab === 'cta' && (
              <CTAEditor 
                content={data.content.cta} 
                onSave={(content) => handleSaveSection('cta', content)} 
                saving={saving} 
              />
            )}
            {activeTab === 'contacts' && (
              <ContactsEditor 
                content={data.content.contacts} 
                onSave={(content) => handleSaveSection('contacts', content)} 
                saving={saving} 
              />
            )}
            {activeTab === 'footer' && (
              <FooterEditor 
                content={data.content.footer} 
                onSave={(content) => handleSaveSection('footer', content)} 
                saving={saving} 
              />
            )}
            {activeTab === 'seo' && (
              <SEOEditor 
                content={data.content.seo} 
                onSave={(content) => handleSaveSection('seo', content)} 
                onUpload={handleFileUpload}
                saving={saving} 
              />
            )}
            {activeTab === 'speed_roi' && (
              <SpeedROIEditor 
                content={data.content.speed_roi} 
                onSave={(content) => handleSaveSection('speed_roi', content)} 
                saving={saving} 
              />
            )}
            {activeTab === 'cases' && (
              <CasesEditor 
                items={data.cases} 
                header={data.content.cases_header}
                onSaveHeader={(content) => handleSaveSection('cases_header', content)}
                onSave={(id, data) => handleSaveEntity('cases', id, data)} 
                onCreate={(data) => handleCreateEntity('cases', data)}
                onDelete={(id) => handleDeleteEntity('cases', id)}
                onUpload={handleFileUpload}
                saving={saving} 
              />
            )}
            {activeTab === 'pricing' && (
              <PricingEditor 
                items={data.pricing} 
                header={data.content.pricing_header}
                onSaveHeader={(content) => handleSaveSection('pricing_header', content)}
                onSave={(id, data) => handleSaveEntity('pricing', id, data)} 
                onCreate={(data) => handleCreateEntity('pricing', data)}
                onDelete={(id) => handleDeleteEntity('pricing', id)}
                saving={saving} 
              />
            )}
            {activeTab === 'faq' && (
              <FAQEditor 
                items={data.faq} 
                header={data.content.faq_header}
                onSaveHeader={(content) => handleSaveSection('faq_header', content)}
                onSave={(id, data) => handleSaveEntity('faq', id, data)} 
                onCreate={(data) => handleCreateEntity('faq', data)}
                onDelete={(id) => handleDeleteEntity('faq', id)}
                saving={saving} 
              />
            )}
            {activeTab === 'process' && (
              <ProcessEditor 
                items={data.process} 
                header={data.content.process_header}
                onSaveHeader={(content) => handleSaveSection('process_header', content)}
                onSave={(id, data) => handleSaveEntity('process', id, data)} 
                onCreate={(data) => handleCreateEntity('process', data)}
                onDelete={(id) => handleDeleteEntity('process', id)}
                saving={saving} 
              />
            )}
            {activeTab === 'problems' && (
              <ProblemsEditor 
                items={data.problems} 
                header={data.content.problems_header}
                onSaveHeader={(content) => handleSaveSection('problems_header', content)}
                onSave={(id, data) => handleSaveEntity('problems', id, data)} 
                onCreate={(data) => handleCreateEntity('problems', data)}
                onDelete={(id) => handleDeleteEntity('problems', id)}
                saving={saving} 
              />
            )}
            {activeTab === 'benefits' && (
              <BenefitsEditor 
                items={data.benefits} 
                header={data.content.benefits_header}
                onSaveHeader={(content) => handleSaveSection('benefits_header', content)}
                onSave={(id, data) => handleSaveEntity('benefits', id, data)} 
                onCreate={(data) => handleCreateEntity('benefits', data)}
                onDelete={(id) => handleDeleteEntity('benefits', id)}
                saving={saving} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LeadsEditor = ({ leads, onUpdateStatus, onDelete }: { leads: any[], onUpdateStatus: (id: number, status: string) => void, onDelete: (id: number) => void }) => {
  const [filter, setFilter] = useState('all');

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true;
    return lead.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-600';
      case 'contacted': return 'bg-yellow-100 text-yellow-600';
      case 'closed': return 'bg-green-100 text-green-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">Заявки ({leads.length})</h3>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
          >
            <option value="all">Всі</option>
            <option value="new">Нові</option>
            <option value="contacted">В роботі</option>
            <option value="closed">Закриті</option>
          </select>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Mail className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-medium">Заявок поки немає</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-accent/30 transition-all group">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{lead.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Phone size={14} /> {lead.contact}</span>
                      <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(lead.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={lead.status}
                    onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider outline-none border-none cursor-pointer ${getStatusColor(lead.status)}`}
                  >
                    <option value="new">Нова</option>
                    <option value="contacted">В роботі</option>
                    <option value="closed">Закрита</option>
                  </select>
                  <button 
                    onClick={() => onDelete(lead.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                {lead.plan && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Тариф:</span>
                    <span className="text-sm font-bold text-accent">{lead.plan}</span>
                  </div>
                )}
                {lead.source && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Джерело:</span>
                    <span className="text-sm text-slate-600">{lead.source}</span>
                  </div>
                )}
                {lead.message && (
                  <div className="pt-2 border-t border-slate-50">
                    <p className="text-slate-700 text-sm leading-relaxed">{lead.message}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Sub-Editors ---

const SectionHeaderEditor = ({ content, onSave, saving, title = "Заголовок секції", fields = [] }: any) => {
  const [form, setForm] = useState(content || {});
  
  useEffect(() => {
    setForm(content || {});
  }, [content]);

  return (
    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 mb-12 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <SaveButton onClick={() => onSave(form)} loading={saving} />
      </div>
      <div className="grid gap-6">
        {fields.map((field: any) => (
          field.type === 'textarea' ? (
            <Textarea 
              key={field.key} 
              label={field.label} 
              value={form[field.key] || ''} 
              onChange={(v) => setForm({...form, [field.key]: v})} 
            />
          ) : (
            <Input 
              key={field.key} 
              label={field.label} 
              value={form[field.key] || ''} 
              onChange={(v) => setForm({...form, [field.key]: v})} 
            />
          )
        ))}
      </div>
    </div>
  );
};

const HeroEditor = ({ content, onSave, onUpload, saving }: any) => {
  const [form, setForm] = useState(content);
  return (
    <div className="space-y-6">
      <Input label="Заголовок" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      <div className="space-y-1">
        <Textarea label="Підзаголовок" value={form.subtitle} onChange={(v) => setForm({...form, subtitle: v})} />
        <p className="text-xs text-slate-400 italic">Порада: Текст після 3-го рядка буде прихований під кнопкою "докладніше".</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Текст кнопки 1" value={form.primaryButtonText} onChange={(v) => setForm({...form, primaryButtonText: v})} />
        <Input label="Текст кнопки 2" value={form.secondaryButtonText} onChange={(v) => setForm({...form, secondaryButtonText: v})} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Бейдж 1" value={form.badge1} onChange={(v) => setForm({...form, badge1: v})} />
        <Input label="Бейдж 2" value={form.badge2} onChange={(v) => setForm({...form, badge2: v})} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Лейбл 'Докладніше'" value={form.readMoreLabel} onChange={(v) => setForm({...form, readMoreLabel: v})} />
        <Input label="Лейбл 'Згорнути'" value={form.collapseLabel} onChange={(v) => setForm({...form, collapseLabel: v})} />
      </div>
      <div className="border-t border-slate-100 pt-6">
        <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Візуальний потік (Hero Visual)</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Крок 1: Лейбл" value={form.flowLabel1} onChange={(v) => setForm({...form, flowLabel1: v})} />
            <Input label="Крок 1: Назва" value={form.flowLead} onChange={(v) => setForm({...form, flowLead: v})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Крок 2: Лейбл" value={form.flowLabel2} onChange={(v) => setForm({...form, flowLabel2: v})} />
            <Input label="Крок 2: Назва" value={form.flowTelegram} onChange={(v) => setForm({...form, flowTelegram: v})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Крок 3: Лейбл" value={form.flowLabel3} onChange={(v) => setForm({...form, flowLabel3: v})} />
            <Input label="Крок 3: Назва" value={form.flowCRM} onChange={(v) => setForm({...form, flowCRM: v})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Крок 4: Лейбл" value={form.flowLabel4} onChange={(v) => setForm({...form, flowLabel4: v})} />
            <Input label="Крок 4: Назва" value={form.flowReminder} onChange={(v) => setForm({...form, flowReminder: v})} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mt-6 border-t border-slate-50 pt-6">
          <Input label="Текст кнопки 'Докладніше' (Відео)" value={form.moreButtonText} onChange={(v) => setForm({...form, moreButtonText: v})} />
          <VideoPicker label="Відео (YouTube або файл)" value={form.videoUrl} onChange={(v) => setForm({...form, videoUrl: v})} onUpload={onUpload} />
        </div>
      </div>
      <SaveButton onClick={() => onSave(form)} loading={saving} />
    </div>
  );
};

const AboutEditor = ({ content, onSave, onUpload, saving }: any) => {
  const [form, setForm] = useState(content);
  return (
    <div className="space-y-6">
      <Input label="Заголовок" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      <div className="space-y-4">
        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Параграфи</label>
        {form.paragraphs.map((p: string, i: number) => (
          <div key={i} className="flex gap-2">
            <Textarea value={p} onChange={(v) => {
              const newP = [...form.paragraphs];
              newP[i] = v;
              setForm({...form, paragraphs: newP});
            }} />
            <button 
              onClick={() => {
                const newP = form.paragraphs.filter((_: any, idx: number) => idx !== i);
                setForm({...form, paragraphs: newP});
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg h-fit"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button 
          onClick={() => setForm({...form, paragraphs: [...form.paragraphs, '']})}
          className="flex items-center gap-2 text-accent font-bold text-sm"
        >
          <Plus size={16} /> Додати параграф
        </button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Значення досвіду" value={form.experienceValue} onChange={(v) => setForm({...form, experienceValue: v})} />
        <Input label="Лейбл досвіду" value={form.experienceLabel} onChange={(v) => setForm({...form, experienceLabel: v})} />
      </div>
      <div className="space-y-4">
        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Навички (через кому або по одній на рядок)</label>
        <Textarea 
          value={form.skills?.join('\n')} 
          onChange={(v) => setForm({...form, skills: v.split('\n').filter((s: string) => s.trim() !== '')})} 
        />
      </div>
      <ImagePicker label="Фото" value={form.image} onChange={(v) => setForm({...form, image: v})} onUpload={onUpload} />
      <SaveButton onClick={() => onSave(form)} loading={saving} />
    </div>
  );
};

const CTAEditor = ({ content, onSave, saving }: any) => {
  const [form, setForm] = useState(content);
  return (
    <div className="space-y-6">
      <Input label="Заголовок" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      <Textarea label="Підзаголовок" value={form.subtitle} onChange={(v) => setForm({...form, subtitle: v})} />
      <Input label="Текст кнопки" value={form.buttonText} onChange={(v) => setForm({...form, buttonText: v})} />
      <SaveButton onClick={() => onSave(form)} loading={saving} />
    </div>
  );
};

const ContactsEditor = ({ content, onSave, saving }: any) => {
  const [form, setForm] = useState(content);
  return (
    <div className="space-y-6">
      <Input label="Заголовок" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      <Textarea label="Підзаголовок" value={form.subtitle} onChange={(v) => setForm({...form, subtitle: v})} />
      <div className="grid grid-cols-2 gap-6">
        <Input label="Email" value={form.email} onChange={(v) => setForm({...form, email: v})} />
        <Input label="Telegram" value={form.telegram} onChange={(v) => setForm({...form, telegram: v})} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Лейбл імені" value={form.formNameLabel} onChange={(v) => setForm({...form, formNameLabel: v})} />
        <Input label="Placeholder імені" value={form.formNamePlaceholder} onChange={(v) => setForm({...form, formNamePlaceholder: v})} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Лейбл контакту" value={form.formContactLabel} onChange={(v) => setForm({...form, formContactLabel: v})} />
        <Input label="Placeholder контакту" value={form.formContactPlaceholder} onChange={(v) => setForm({...form, formContactPlaceholder: v})} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Лейбл коментаря" value={form.formCommentLabel} onChange={(v) => setForm({...form, formCommentLabel: v})} />
        <Input label="Placeholder коментаря" value={form.formCommentPlaceholder} onChange={(v) => setForm({...form, formCommentPlaceholder: v})} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Текст кнопки форми" value={form.formButtonText} onChange={(v) => setForm({...form, formButtonText: v})} />
        <Input label="Текст кнопки (завантаження)" value={form.formButtonLoadingText} onChange={(v) => setForm({...form, formButtonLoadingText: v})} />
      </div>
      <div className="border-t border-slate-100 pt-6">
        <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Повідомлення про успіх</h4>
        <Input label="Заголовок успіху" value={form.successTitle} onChange={(v) => setForm({...form, successTitle: v})} />
        <Textarea label="Підзаголовок успіху" value={form.successSubtitle} onChange={(v) => setForm({...form, successSubtitle: v})} />
        <Input label="Текст кнопки 'Надіслати ще'" value={form.successButtonText} onChange={(v) => setForm({...form, successButtonText: v})} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Текст помилки" value={form.errorText} onChange={(v) => setForm({...form, errorText: v})} />
        <Input label="Лейбл підказки (Tip)" value={form.tipLabel} onChange={(v) => setForm({...form, tipLabel: v})} />
      </div>
      <SaveButton onClick={() => onSave(form)} loading={saving} />
    </div>
  );
};

const FooterEditor = ({ content, onSave, saving }: any) => {
  const [form, setForm] = useState(content);
  return (
    <div className="space-y-6">
      <Input label="Назва бренду" value={form.brandName} onChange={(v) => setForm({...form, brandName: v})} />
      <div className="grid grid-cols-2 gap-6">
        <Input label="Навігація: Кейси" value={form.navCases} onChange={(v) => setForm({...form, navCases: v})} />
        <Input label="Навігація: Процес" value={form.navProcess} onChange={(v) => setForm({...form, navProcess: v})} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Навігація: Тарифи" value={form.navPricing} onChange={(v) => setForm({...form, navPricing: v})} />
        <Input label="Навігація: FAQ" value={form.navFaq} onChange={(v) => setForm({...form, navFaq: v})} />
      </div>
      <Input label="Текст копірайту" value={form.copyrightText} onChange={(v) => setForm({...form, copyrightText: v})} />
      <div className="grid grid-cols-2 gap-6">
        <Input label="Telegram Link" value={form.telegramLink} onChange={(v) => setForm({...form, telegramLink: v})} />
        <Input label="Telegram Label" value={form.telegramLabel} onChange={(v) => setForm({...form, telegramLabel: v})} />
      </div>
      <SaveButton onClick={() => onSave(form)} loading={saving} />
    </div>
  );
};

const SEOEditor = ({ content, onSave, onUpload, saving }: any) => {
  const [form, setForm] = useState(content);
  return (
    <div className="space-y-6">
      <Input label="Page Title" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      <Textarea label="Meta Description" value={form.description} onChange={(v) => setForm({...form, description: v})} />
      <Input label="OG Title" value={form.ogTitle} onChange={(v) => setForm({...form, ogTitle: v})} />
      <Textarea label="OG Description" value={form.ogDescription} onChange={(v) => setForm({...form, ogDescription: v})} />
      <ImagePicker label="OG Image" value={form.ogImage} onChange={(v) => setForm({...form, ogImage: v})} onUpload={onUpload} />
      <SaveButton onClick={() => onSave(form)} loading={saving} />
    </div>
  );
};

const SpeedROIEditor = ({ content, onSave, saving }: any) => {
  const [form, setForm] = useState(content);
  return (
    <div className="space-y-6">
      <Input label="Заголовок" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      <Textarea label="Підзаголовок" value={form.subtitle} onChange={(v) => setForm({...form, subtitle: v})} />
      <div className="grid grid-cols-2 gap-6">
        <Input label="Префікс стат." value={form.statPrefix} onChange={(v) => setForm({...form, statPrefix: v})} />
        <Input label="Значення стат." value={form.statValue} onChange={(v) => setForm({...form, statValue: v})} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Лейбл стат." value={form.statLabel} onChange={(v) => setForm({...form, statLabel: v})} />
        <Input label="Опис стат." value={form.statDesc} onChange={(v) => setForm({...form, statDesc: v})} />
      </div>
      <Textarea label="Приклад для калькулятора (ROI Example)" value={form.example} onChange={(v) => setForm({...form, example: v})} />
      
      <div className="border-t border-slate-100 pt-6">
        <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Лейбли калькулятора</h4>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Трафік" value={form.labelTraffic} onChange={(v) => setForm({...form, labelTraffic: v})} />
          <Input label="Конверсія" value={form.labelConversion} onChange={(v) => setForm({...form, labelConversion: v})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Середній чек" value={form.labelCheck} onChange={(v) => setForm({...form, labelCheck: v})} />
          <Input label="Поточний дохід" value={form.labelCurrentRevenue} onChange={(v) => setForm({...form, labelCurrentRevenue: v})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Потенційний дохід" value={form.labelPotentialRevenue} onChange={(v) => setForm({...form, labelPotentialRevenue: v})} />
          <Input label="Втрачений прибуток" value={form.labelLostProfit} onChange={(v) => setForm({...form, labelLostProfit: v})} />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Переваги швидкості (Features)</h4>
        <div className="space-y-6">
          {(form.features || []).map((feature: any, i: number) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl relative group">
              <button 
                onClick={() => {
                  const newFeatures = form.features.filter((_: any, idx: number) => idx !== i);
                  setForm({...form, features: newFeatures});
                }}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
              <div className="grid gap-4">
                <Input label="Заголовок переваги" value={feature.title} onChange={(v) => {
                  const newFeatures = [...form.features];
                  newFeatures[i] = { ...feature, title: v };
                  setForm({...form, features: newFeatures});
                }} />
                <Textarea label="Опис переваги" value={feature.desc} onChange={(v) => {
                  const newFeatures = [...form.features];
                  newFeatures[i] = { ...feature, desc: v };
                  setForm({...form, features: newFeatures});
                }} />
              </div>
            </div>
          ))}
          <button 
            onClick={() => setForm({...form, features: [...(form.features || []), { title: '', desc: '' }]})}
            className="flex items-center gap-2 text-accent font-bold text-sm"
          >
            <Plus size={16} /> Додати перевагу
          </button>
        </div>
      </div>
      
      <SaveButton onClick={() => onSave(form)} loading={saving} />
    </div>
  );
};

const CasesEditor = ({ items, header, onSaveHeader, onSave, onCreate, onDelete, onUpload, saving }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const emptyCase = {
    title: '',
    niche: '',
    image: '',
    problem: '',
    detailed_problem: '',
    solution: '',
    detailed_solution: '',
    result: '',
    link: ''
  };

  return (
    <div className="space-y-12">
      <SectionHeaderEditor 
        title="Заголовки секції Кейси"
        content={header}
        onSave={onSaveHeader}
        saving={saving}
        fields={[
          { key: 'title', label: 'Заголовок' },
          { key: 'subtitle', label: 'Підзаголовок', type: 'textarea' },
          { key: 'moreDetailsLabel', label: 'Текст кнопки "Детальніше"' },
          { key: 'visitSiteLabel', label: 'Текст кнопки "Відвідати сайт"' },
          { key: 'visitSiteHint', label: 'Підказка кнопки "Відвідати сайт"' },
          { key: 'problemLabel', label: 'Лейбл "Проблема"' },
          { key: 'solutionLabel', label: 'Лейбл "Рішення"' },
          { key: 'resultLabel', label: 'Лейбл "Результат"' },
          { key: 'closeModalLabel', label: 'Текст кнопки "Закрити"' },
        ]}
      />

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Список кейсів</h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all"
        >
          {showAdd ? <X size={18} /> : <Plus size={18} />}
          {showAdd ? 'Скасувати' : 'Додати кейс'}
        </button>
      </div>

      {showAdd && (
        <div className="p-8 border-2 border-dashed border-accent/30 rounded-[32px] bg-accent/5">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Новий кейс</h4>
          <CaseItemEditor 
            item={emptyCase} 
            onSave={(_, data) => {
              onCreate(data);
              setShowAdd(false);
            }} 
            onUpload={onUpload} 
            saving={saving} 
            isNew
          />
        </div>
      )}

      <div className="space-y-8">
        {items.map((item: any, i: number) => (
          <CaseItemEditor 
            key={i} 
            item={item} 
            onSave={onSave} 
            onDelete={() => onDelete(item.id)}
            onUpload={onUpload} 
            saving={saving} 
          />
        ))}
      </div>
    </div>
  );
};

const CaseItemEditor = ({ item, onSave, onDelete, onUpload, saving, isNew }: any) => {
  const [form, setForm] = useState(item);
  return (
    <div className="p-6 bg-slate-50 rounded-2xl space-y-4 relative group">
      {!isNew && (
        <button 
          onClick={onDelete}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Ніша" value={form.niche} onChange={(v) => setForm({...form, niche: v})} />
        <Input label="Заголовок" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      </div>
      <ImagePicker label="Фото" value={form.image} onChange={(v) => setForm({...form, image: v})} onUpload={onUpload} />
      <Textarea label="Проблема (коротко)" value={form.problem} onChange={(v) => setForm({...form, problem: v})} />
      <Textarea label="Проблема (детально)" value={form.detailed_problem} onChange={(v) => setForm({...form, detailed_problem: v})} />
      <Textarea label="Рішення (коротко)" value={form.solution} onChange={(v) => setForm({...form, solution: v})} />
      <Textarea label="Рішення (детально)" value={form.detailed_solution} onChange={(v) => setForm({...form, detailed_solution: v})} />
      <Input label="Результат" value={form.result} onChange={(v) => setForm({...form, result: v})} />
      <Input label="Посилання" value={form.link} onChange={(v) => setForm({...form, link: v})} />
      <SaveButton onClick={() => onSave(form.id, form)} loading={saving} />
    </div>
  );
};

const PricingEditor = ({ items, header, onSaveHeader, onSave, onCreate, onDelete, saving }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const emptyPlan = {
    name: '',
    price: '',
    label: '',
    featured: false,
    features: [''],
    result_text: '',
    modal_title: '',
    modal_subtitle: '',
    modal_tip: ''
  };

  return (
    <div className="space-y-12">
      <SectionHeaderEditor 
        title="Заголовки секції Тарифи"
        content={header}
        onSave={onSaveHeader}
        saving={saving}
        fields={[
          { key: 'title', label: 'Заголовок' },
          { key: 'subtitle', label: 'Підзаголовок', type: 'textarea' },
          { key: 'selectPlanLabel', label: 'Текст кнопки "Обрати тариф"' },
          { key: 'resultLabel', label: 'Лейбл результату' },
        ]}
      />
      
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Список тарифів</h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all"
        >
          {showAdd ? <X size={18} /> : <Plus size={18} />}
          {showAdd ? 'Скасувати' : 'Додати тариф'}
        </button>
      </div>

      {showAdd && (
        <div className="p-8 border-2 border-dashed border-accent/30 rounded-[32px] bg-accent/5">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Новий тариф</h4>
          <PricingItemEditor 
            item={emptyPlan} 
            onSave={(_, data) => {
              onCreate(data);
              setShowAdd(false);
            }} 
            saving={saving} 
            isNew
          />
        </div>
      )}

      <div className="space-y-8">
        {items.map((item: any, i: number) => (
          <PricingItemEditor 
            key={i} 
            item={item} 
            onSave={onSave} 
            onDelete={() => onDelete(item.id)}
            saving={saving} 
          />
        ))}
      </div>
    </div>
  );
};

const PricingItemEditor = ({ item, onSave, onDelete, saving, isNew }: any) => {
  const [form, setForm] = useState(item);
  return (
    <div className="p-6 bg-slate-50 rounded-2xl space-y-4 relative group">
      {!isNew && (
        <button 
          onClick={onDelete}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Назва" value={form.name} onChange={(v) => setForm({...form, name: v})} />
        <Input label="Ціна" value={form.price} onChange={(v) => setForm({...form, price: v})} />
      </div>
      <Input label="Лейбл" value={form.label} onChange={(v) => setForm({...form, label: v})} />
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={form.featured} onChange={(e) => setForm({...form, featured: e.target.checked})} />
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Популярний</label>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Фічі (по одній на рядок)</label>
        <Textarea value={form.features.join('\n')} onChange={(v) => setForm({...form, features: v.split('\n')})} />
      </div>
      <Input label="Результат" value={form.result_text} onChange={(v) => setForm({...form, result_text: v})} />
      
      <div className="border-t border-slate-200 pt-4 mt-4 space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Контент модального вікна</h4>
        <Input label="Заголовок модалки" value={form.modal_title} onChange={(v) => setForm({...form, modal_title: v})} />
        <Textarea label="Підзаголовок модалки" value={form.modal_subtitle} onChange={(v) => setForm({...form, modal_subtitle: v})} />
        <Input label="Підказка (Tip)" value={form.modal_tip} onChange={(v) => setForm({...form, modal_tip: v})} />
      </div>

      <SaveButton onClick={() => onSave(form.id, form)} loading={saving} />
    </div>
  );
};

const ProcessEditor = ({ items, header, onSaveHeader, onSave, onCreate, onDelete, saving }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const emptyStep = { step_number: '', title: '', description: '' };

  return (
    <div className="space-y-12">
      <SectionHeaderEditor 
        title="Заголовки секції Процес"
        content={header}
        onSave={onSaveHeader}
        saving={saving}
        fields={[
          { key: 'title', label: 'Заголовок' },
          { key: 'subtitle', label: 'Підзаголовок', type: 'textarea' },
          { key: 'stepLabel', label: 'Лейбл "Крок"' },
        ]}
      />

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Список кроків</h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all"
        >
          {showAdd ? <X size={18} /> : <Plus size={18} />}
          {showAdd ? 'Скасувати' : 'Додати крок'}
        </button>
      </div>

      {showAdd && (
        <div className="p-8 border-2 border-dashed border-accent/30 rounded-[32px] bg-accent/5">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Новий крок</h4>
          <ProcessItemEditor 
            item={emptyStep} 
            onSave={(_, data) => {
              onCreate(data);
              setShowAdd(false);
            }} 
            saving={saving} 
            isNew
          />
        </div>
      )}

      <div className="space-y-8">
        {items.map((item: any, i: number) => (
          <ProcessItemEditor 
            key={i} 
            item={item} 
            onSave={onSave} 
            onDelete={() => onDelete(item.id)}
            saving={saving} 
          />
        ))}
      </div>
    </div>
  );
};

const ProcessItemEditor = ({ item, onSave, onDelete, saving, isNew }: any) => {
  const [form, setForm] = useState(item);
  return (
    <div className="p-6 bg-slate-50 rounded-2xl space-y-4 relative group">
      {!isNew && (
        <button 
          onClick={onDelete}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Номер" value={form.step_number} onChange={(v) => setForm({...form, step_number: v})} />
        <Input label="Заголовок" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      </div>
      <Textarea label="Опис" value={form.description} onChange={(v) => setForm({...form, description: v})} />
      <SaveButton onClick={() => onSave(form.id, form)} loading={saving} />
    </div>
  );
};

const ProblemsEditor = ({ items, header, onSaveHeader, onSave, onCreate, onDelete, saving }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const emptyProblem = { title: '', description: '' };

  return (
    <div className="space-y-12">
      <SectionHeaderEditor 
        title="Заголовки секції Проблеми"
        content={header}
        onSave={onSaveHeader}
        saving={saving}
        fields={[
          { key: 'title', label: 'Заголовок' },
          { key: 'subtitle', label: 'Підзаголовок', type: 'textarea' },
        ]}
      />

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Список проблем</h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all"
        >
          {showAdd ? <X size={18} /> : <Plus size={18} />}
          {showAdd ? 'Скасувати' : 'Додати проблему'}
        </button>
      </div>

      {showAdd && (
        <div className="p-8 border-2 border-dashed border-accent/30 rounded-[32px] bg-accent/5">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Нова проблема</h4>
          <ProblemItemEditor 
            item={emptyProblem} 
            onSave={(_, data) => {
              onCreate(data);
              setShowAdd(false);
            }} 
            saving={saving} 
            isNew
          />
        </div>
      )}

      <div className="space-y-8">
        {items.map((item: any, i: number) => (
          <ProblemItemEditor 
            key={i} 
            item={item} 
            onSave={onSave} 
            onDelete={() => onDelete(item.id)}
            saving={saving} 
          />
        ))}
      </div>
    </div>
  );
};

const ProblemItemEditor = ({ item, onSave, onDelete, saving, isNew }: any) => {
  const [form, setForm] = useState(item);
  return (
    <div className="p-6 bg-slate-50 rounded-2xl space-y-4 relative group">
      {!isNew && (
        <button 
          onClick={onDelete}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      )}
      <Input label="Заголовок" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      <Textarea label="Опис" value={form.description} onChange={(v) => setForm({...form, description: v})} />
      <SaveButton onClick={() => onSave(form.id, form)} loading={saving} />
    </div>
  );
};

const BenefitsEditor = ({ items, header, onSaveHeader, onSave, onCreate, onDelete, saving }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const emptyBenefit = { icon_name: '', title: '', result: '' };

  return (
    <div className="space-y-12">
      <SectionHeaderEditor 
        title="Заголовки секції Переваги"
        content={header}
        onSave={onSaveHeader}
        saving={saving}
        fields={[
          { key: 'title', label: 'Заголовок' },
          { key: 'subtitle', label: 'Підзаголовок', type: 'textarea' },
        ]}
      />

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Список переваг</h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all"
        >
          {showAdd ? <X size={18} /> : <Plus size={18} />}
          {showAdd ? 'Скасувати' : 'Додати перевагу'}
        </button>
      </div>

      {showAdd && (
        <div className="p-8 border-2 border-dashed border-accent/30 rounded-[32px] bg-accent/5">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Нова перевага</h4>
          <BenefitItemEditor 
            item={emptyBenefit} 
            onSave={(_, data) => {
              onCreate(data);
              setShowAdd(false);
            }} 
            saving={saving} 
            isNew
          />
        </div>
      )}

      <div className="space-y-8">
        {items.map((item: any, i: number) => (
          <BenefitItemEditor 
            key={i} 
            item={item} 
            onSave={onSave} 
            onDelete={() => onDelete(item.id)}
            saving={saving} 
          />
        ))}
      </div>
    </div>
  );
};

const BenefitItemEditor = ({ item, onSave, onDelete, saving, isNew }: any) => {
  const [form, setForm] = useState(item);
  return (
    <div className="p-6 bg-slate-50 rounded-2xl space-y-4 relative group">
      {!isNew && (
        <button 
          onClick={onDelete}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      )}
      <Input label="Іконка (Lucide name)" value={form.icon_name} onChange={(v) => setForm({...form, icon_name: v})} />
      <Input label="Заголовок" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      <Textarea label="Результат" value={form.result} onChange={(v) => setForm({...form, result: v})} />
      <SaveButton onClick={() => onSave(form.id, form)} loading={saving} />
    </div>
  );
};

const FAQEditor = ({ items, header, onSaveHeader, onSave, onDelete, onCreate, saving }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  return (
    <div className="space-y-12">
      <SectionHeaderEditor 
        title="Заголовки секції FAQ"
        content={header}
        onSave={onSaveHeader}
        saving={saving}
        fields={[
          { key: 'title', label: 'Заголовок' },
          { key: 'subtitle', label: 'Підзаголовок', type: 'textarea' },
        ]}
      />
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Список запитань</h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
        >
          <Plus size={18} /> Додати запитання
        </button>
      </div>

      {showAdd && (
        <div className="p-6 bg-white border-2 border-accent/20 rounded-2xl space-y-4">
          <h4 className="font-bold text-slate-900">Нове запитання</h4>
          <Input label="Запитання" value={newFaq.question} onChange={(v) => setNewFaq({...newFaq, question: v})} />
          <Textarea label="Відповідь" value={newFaq.answer} onChange={(v) => setNewFaq({...newFaq, answer: v})} />
          <div className="flex gap-3">
            <button 
              onClick={async () => {
                await onCreate(newFaq);
                setNewFaq({ question: '', answer: '' });
                setShowAdd(false);
              }}
              disabled={saving}
              className="px-6 py-2 bg-accent text-white rounded-xl font-bold disabled:opacity-50"
            >
              Створити
            </button>
            <button onClick={() => setShowAdd(false)} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold">Скасувати</button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {items.map((item: any, i: number) => (
          <FAQItemEditor key={i} item={item} onSave={onSave} onDelete={onDelete} saving={saving} />
        ))}
      </div>
    </div>
  );
};

const FAQItemEditor = ({ item, onSave, onDelete, saving }: any) => {
  const [form, setForm] = useState(item);
  return (
    <div className="p-6 bg-slate-50 rounded-2xl space-y-4 relative group">
      <button 
        onClick={() => onDelete(item.id)}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
      >
        <Trash2 size={18} />
      </button>
      <Input label="Запитання" value={form.question} onChange={(v) => setForm({...form, question: v})} />
      <Textarea label="Відповідь" value={form.answer} onChange={(v) => setForm({...form, answer: v})} />
      <SaveButton onClick={() => onSave(form.id, form)} loading={saving} />
    </div>
  );
};

// --- UI Components ---

const Input = ({ label, value, onChange, type = "text" }: any) => (
  <div>
    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
    />
  </div>
);

const Textarea = ({ label, value, onChange, rows = 3 }: any) => (
  <div>
    {label && <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">{label}</label>}
    <textarea
      rows={rows}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all resize-none"
    />
  </div>
);

const ImagePicker = ({ label, value, onChange, onUpload }: any) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await onUpload(e.target.files[0]);
      if (url) onChange(url);
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-start gap-4">
        <div className="w-32 h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center relative group">
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="text-slate-400" size={32} />
          )}
          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <Plus className="text-white" size={24} />
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
        </div>
        <div className="flex-grow">
          <Input label="URL зображення" value={value} onChange={onChange} />
          <p className="text-xs text-slate-400 mt-2">Можна вставити посилання або завантажити файл</p>
        </div>
      </div>
    </div>
  );
};

const StatsDashboard = () => {
  const [leadStats, setLeadStats] = useState<any[]>([]);
  const [statusDist, setStatusDist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [leadsRes, statusRes] = await Promise.all([
          getLeadStats(),
          getStatusDistribution()
        ]);
        setLeadStats(leadsRes.data);
        setStatusDist(statusRes.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent" /></div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Динаміка заявок (30 днів)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}}
                  tickFormatter={(str) => {
                    if (!str) return '';
                    const parts = str.split('-');
                    return parts.length >= 3 ? `${parts[2]}.${parts[1]}` : str;
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" fill="#F27D26" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Статуси заявок</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                >
                  {statusDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {statusDist.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                <span className="text-sm font-medium text-slate-600 capitalize">{entry.status}: {entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ArticlesEditor = ({ onUpload, saving }: any) => {
  const [articles, setArticles] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await getAdminArticles();
      setArticles(res.data);
    } catch (err) {
      console.error('Failed to fetch articles', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form: any) => {
    try {
      if (form.id) {
        await updateArticle(form.id, form);
      } else {
        await createArticle(form);
      }
      setEditing(null);
      fetchArticles();
    } catch (err) {
      console.error('Failed to save article', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Ви впевнені?')) return;
    try {
      await deleteArticle(id);
      fetchArticles();
    } catch (err) {
      console.error('Failed to delete article', err);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent" /></div>;

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{editing.id ? 'Редагувати статтю' : 'Нова стаття'}</h3>
          <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Заголовок" value={editing.title} onChange={(v) => setEditing({...editing, title: v, slug: editing.id ? editing.slug : v.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')})} />
          <Input label="Slug (URL)" value={editing.slug} onChange={(v) => setEditing({...editing, slug: v})} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Категорія" value={editing.category} onChange={(v) => setEditing({...editing, category: v})} />
          <div className="flex items-center gap-2 pt-8">
            <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({...editing, is_published: e.target.checked})} />
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Опубліковано</label>
          </div>
        </div>

        <Textarea label="Короткий опис (Excerpt)" value={editing.excerpt} onChange={(v) => setEditing({...editing, excerpt: v})} />
        <Textarea label="Контент (Markdown)" value={editing.content} onChange={(v) => setEditing({...editing, content: v})} rows={10} />
        
        <ImagePicker label="Обкладинка" value={editing.image} onChange={(v) => setEditing({...editing, image: v})} onUpload={onUpload} />
        
        <SaveButton onClick={() => handleSave(editing)} loading={saving} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Статті блогу</h3>
        <button 
          onClick={() => setEditing({ title: '', slug: '', excerpt: '', content: '', image: '', category: 'Маркетинг', is_published: false })}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus size={16} /> Додати статтю
        </button>
      </div>

      <div className="grid gap-4">
        {articles.map((article) => (
          <div key={article.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden">
                {article.image && <img src={article.image} className="w-full h-full object-cover" />}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{article.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">{article.category}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${article.is_published ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                    {article.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(article)} className="p-2 text-slate-400 hover:text-accent hover:bg-white rounded-lg transition-all"><Settings size={18} /></button>
              <button onClick={() => handleDelete(article.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VideoPicker = ({ label, value, onChange, onUpload }: any) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await onUpload(e.target.files[0]);
      if (url) onChange(url);
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-start gap-4">
        <div className="w-32 h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center relative group">
          {value && !value.includes('youtube.com') && !value.includes('youtu.be') ? (
            <video src={value} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-400">
              <Play size={32} />
              <span className="text-[10px] font-bold uppercase">Video</span>
            </div>
          )}
          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <Plus className="text-white" size={24} />
            <input type="file" className="hidden" onChange={handleFileChange} accept="video/*" />
          </label>
        </div>
        <div className="flex-grow">
          <Input label="URL відео" value={value} onChange={onChange} />
          <p className="text-xs text-slate-400 mt-2">YouTube посилання або завантаження файлу (до 50MB)</p>
        </div>
      </div>
    </div>
  );
};

const SaveButton = ({ onClick, loading }: any) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="btn-primary py-3 px-8 flex items-center gap-2"
  >
    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
    Зберегти зміни
  </button>
);

export default Dashboard;

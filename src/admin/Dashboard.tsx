import React, { useState, useEffect } from 'react';
import { logout, getContent, updateSection, updateCase, createCase, deleteCase, updatePricing, updateProcess, updateProblem, updateBenefit, updateFaq, createFaq, deleteFaq, uploadImage } from '../services/api';
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
  Monitor
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('hero');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const tabs = [
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
      const response = await getContent();
      setData(response.data);
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
      showMessage('Видалено успішно!');
      fetchData();
    } catch (err) {
      showMessage('Помилка при видаленні', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const response = await uploadImage(file);
      return response.data.imageUrl;
    } catch (err) {
      showMessage('Помилка завантаження фото', 'error');
      return null;
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
          {tabs.map(tab => (
            <button
              key={tab.id}
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
            {activeTab === 'hero' && (
              <HeroEditor 
                content={data.content.hero} 
                onSave={(content) => handleSaveSection('hero', content)} 
                saving={saving} 
              />
            )}
            {activeTab === 'about' && (
              <AboutEditor 
                content={data.content.about} 
                onSave={(content) => handleSaveSection('about', content)} 
                onUpload={handleImageUpload}
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
                onUpload={handleImageUpload}
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
                onSave={(id, data) => handleSaveEntity('cases', id, data)} 
                onCreate={(data) => handleCreateEntity('cases', data)}
                onDelete={(id) => handleDeleteEntity('cases', id)}
                onUpload={handleImageUpload}
                saving={saving} 
              />
            )}
            {activeTab === 'pricing' && (
              <PricingEditor 
                items={data.pricing} 
                onSave={(id, data) => handleSaveEntity('pricing', id, data)} 
                saving={saving} 
              />
            )}
            {activeTab === 'faq' && (
              <FAQEditor 
                items={data.faq} 
                onSave={(id, data) => handleSaveEntity('faq', id, data)} 
                onCreate={(data) => handleCreateEntity('faq', data)}
                onDelete={(id) => handleDeleteEntity('faq', id)}
                saving={saving} 
              />
            )}
            {activeTab === 'process' && (
              <ProcessEditor 
                items={data.process} 
                onSave={(id, data) => handleSaveEntity('process', id, data)} 
                saving={saving} 
              />
            )}
            {activeTab === 'problems' && (
              <ProblemsEditor 
                items={data.problems} 
                onSave={(id, data) => handleSaveEntity('problems', id, data)} 
                saving={saving} 
              />
            )}
            {activeTab === 'benefits' && (
              <BenefitsEditor 
                items={data.benefits} 
                onSave={(id, data) => handleSaveEntity('benefits', id, data)} 
                saving={saving} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Editors ---

const HeroEditor = ({ content, onSave, saving }: any) => {
  const [form, setForm] = useState(content);
  return (
    <div className="space-y-6">
      <Input label="Заголовок" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      <Textarea label="Підзаголовок" value={form.subtitle} onChange={(v) => setForm({...form, subtitle: v})} />
      <div className="grid grid-cols-2 gap-6">
        <Input label="Текст кнопки 1" value={form.primaryButtonText} onChange={(v) => setForm({...form, primaryButtonText: v})} />
        <Input label="Текст кнопки 2" value={form.secondaryButtonText} onChange={(v) => setForm({...form, secondaryButtonText: v})} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Бейдж 1" value={form.badge1} onChange={(v) => setForm({...form, badge1: v})} />
        <Input label="Бейдж 2" value={form.badge2} onChange={(v) => setForm({...form, badge2: v})} />
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
          <Textarea key={i} value={p} onChange={(v) => {
            const newP = [...form.paragraphs];
            newP[i] = v;
            setForm({...form, paragraphs: newP});
          }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Значення досвіду" value={form.experienceValue} onChange={(v) => setForm({...form, experienceValue: v})} />
        <Input label="Лейбл досвіду" value={form.experienceLabel} onChange={(v) => setForm({...form, experienceLabel: v})} />
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
        <Input label="Лейбл контакту" value={form.formContactLabel} onChange={(v) => setForm({...form, formContactLabel: v})} />
      </div>
      <Input label="Текст кнопки форми" value={form.formButtonText} onChange={(v) => setForm({...form, formButtonText: v})} />
      <SaveButton onClick={() => onSave(form)} loading={saving} />
    </div>
  );
};

const FooterEditor = ({ content, onSave, saving }: any) => {
  const [form, setForm] = useState(content);
  return (
    <div className="space-y-6">
      <Input label="Copyright" value={form.copyright} onChange={(v) => setForm({...form, copyright: v})} />
      <Input label="Telegram Link" value={form.telegramLink} onChange={(v) => setForm({...form, telegramLink: v})} />
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
      <div className="grid grid-cols-3 gap-6">
        <Input label="Значення стат." value={form.statValue} onChange={(v) => setForm({...form, statValue: v})} />
        <Input label="Лейбл стат." value={form.statLabel} onChange={(v) => setForm({...form, statLabel: v})} />
        <Input label="Опис стат." value={form.statDesc} onChange={(v) => setForm({...form, statDesc: v})} />
      </div>
      <SaveButton onClick={() => onSave(form)} loading={saving} />
    </div>
  );
};

const CasesEditor = ({ items, onSave, onCreate, onDelete, onUpload, saving }: any) => {
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
        {items.map((item: any) => (
          <CaseItemEditor 
            key={item.id} 
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

const PricingEditor = ({ items, onSave, saving }: any) => {
  return (
    <div className="space-y-12">
      {items.map((item: any) => (
        <PricingItemEditor key={item.id} item={item} onSave={onSave} saving={saving} />
      ))}
    </div>
  );
};

const PricingItemEditor = ({ item, onSave, saving }: any) => {
  const [form, setForm] = useState(item);
  return (
    <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
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
      <SaveButton onClick={() => onSave(form.id, form)} loading={saving} />
    </div>
  );
};

const ProcessEditor = ({ items, onSave, saving }: any) => {
  return (
    <div className="space-y-12">
      {items.map((item: any) => (
        <ProcessItemEditor key={item.id} item={item} onSave={onSave} saving={saving} />
      ))}
    </div>
  );
};

const ProcessItemEditor = ({ item, onSave, saving }: any) => {
  const [form, setForm] = useState(item);
  return (
    <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Номер" value={form.step_number} onChange={(v) => setForm({...form, step_number: v})} />
        <Input label="Заголовок" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      </div>
      <Textarea label="Опис" value={form.description} onChange={(v) => setForm({...form, description: v})} />
      <SaveButton onClick={() => onSave(form.id, form)} loading={saving} />
    </div>
  );
};

const ProblemsEditor = ({ items, onSave, saving }: any) => {
  return (
    <div className="space-y-12">
      {items.map((item: any) => (
        <ProblemItemEditor key={item.id} item={item} onSave={onSave} saving={saving} />
      ))}
    </div>
  );
};

const ProblemItemEditor = ({ item, onSave, saving }: any) => {
  const [form, setForm] = useState(item);
  return (
    <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
      <Input label="Заголовок" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      <Textarea label="Опис" value={form.description} onChange={(v) => setForm({...form, description: v})} />
      <SaveButton onClick={() => onSave(form.id, form)} loading={saving} />
    </div>
  );
};

const BenefitsEditor = ({ items, onSave, saving }: any) => {
  return (
    <div className="space-y-12">
      {items.map((item: any) => (
        <BenefitItemEditor key={item.id} item={item} onSave={onSave} saving={saving} />
      ))}
    </div>
  );
};

const BenefitItemEditor = ({ item, onSave, saving }: any) => {
  const [form, setForm] = useState(item);
  return (
    <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
      <Input label="Іконка (Lucide name)" value={form.icon_name} onChange={(v) => setForm({...form, icon_name: v})} />
      <Input label="Заголовок" value={form.title} onChange={(v) => setForm({...form, title: v})} />
      <Textarea label="Результат" value={form.result} onChange={(v) => setForm({...form, result: v})} />
      <SaveButton onClick={() => onSave(form.id, form)} loading={saving} />
    </div>
  );
};

const FAQEditor = ({ items, onSave, onDelete, onCreate, saving }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  return (
    <div className="space-y-12">
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
        {items.map((item: any) => (
          <FAQItemEditor key={item.id} item={item} onSave={onSave} onDelete={onDelete} saving={saving} />
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

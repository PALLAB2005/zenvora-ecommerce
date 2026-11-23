import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/DataUI';
import { Input, Label, Textarea } from '../../components/ui/FormControls';
import { SafeImage } from '../../components/ui/SafeImage';
import { BRAND_IMAGES } from '../../data/seedData';
import { useToastStore } from '../../store/useToastStore';

export function AboutPage() {
  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
            Our Philosophy
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717] [text-wrap:balance]">
            Precision objects, fulfilled directly by the ateliers that craft them.
          </h1>
          <p className="text-base text-[#737373] leading-relaxed">
            Founded between Copenhagen and Kyoto, KOVA Atelier connects independent industrial lighting mills, acoustic engineers, and ceramicists directly with modern studios. By bypassing traditional wholesale layers, every piece ships directly from its maker with full traceability.
          </p>
        </div>
        <div className="lg:col-span-6 aspect-[16/10] rounded-2xl overflow-hidden border border-[#E5E5E5] bg-[#F8F8F7]">
          <SafeImage
            src={BRAND_IMAGES.hero}
            alt="KOVA Atelier studio interior"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Copenhagen & Aarhus',
            body: 'CNC-milled 6061 aluminum luminaires and acoustic enclosures built to serviceable repair standards.',
          },
          {
            title: 'Kyoto Kiln Collective',
            body: 'Small-batch iron-speckled stoneware and PID pour-over vessels calibrated for daily temperature stability.',
          },
          {
            title: 'Oslo Everyday Carry',
            body: 'Recycled 1680D ballistic nylon packs and anodized workspace trays engineered for decades of transit.',
          },
        ].map((atelier) => (
          <div key={atelier.title} className="bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl p-7">
            <h2 className="text-lg font-bold text-[#171717]">{atelier.title}</h2>
            <p className="mt-2 text-sm text-[#737373] leading-relaxed">{atelier.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export function ContactPage() {
  const pushToast = useToastStore((s) => s.pushToast);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || message.trim().length < 10) {
      pushToast({
        title: 'Please complete all fields',
        description: 'Include a valid email and message of at least 10 characters.',
        variant: 'error',
      });
      return;
    }
    pushToast({
      title: 'Message sent to KOVA Concierge',
      description: 'Our studio support team responds within 1 business day.',
      variant: 'success',
    });
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Contact Concierge</h1>
          <p className="text-sm text-[#737373] leading-relaxed">
            Questions about trade studio orders, warranty support, or order dispatch? Reach our operations desk directly.
          </p>
          <div className="space-y-4 pt-4 border-t border-[#E5E5E5] text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[#2563EB]" />
              <span>concierge@kovaatelier.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-[#2563EB]" />
              <span>+1 (415) 555-0100</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-[#2563EB]" />
              <span>Bredgade 45, Copenhagen / San Francisco</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-4">
          <div>
            <Label htmlFor="contact-name">Your Name</Label>
            <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Clara Jensen" />
          </div>
          <div>
            <Label htmlFor="contact-email">Email Address</Label>
            <Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="clara@example.com" />
          </div>
          <div>
            <Label htmlFor="contact-msg">How can we help?</Label>
            <Textarea id="contact-msg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Order ID, trade inquiry, or product question..." />
          </div>
          <Button type="submit" variant="primary" size="lg">
            Send Inquiry
          </Button>
        </form>
      </div>
    </div>
  );
}

export function PoliciesPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get('tab') || 'shipping';
  const [tab, setTab] = useState(initial);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Store Policies</h1>
        <p className="mt-1.5 text-sm text-[#737373]">
          Transparent terms governing workshop dispatch, 30-day returns, and data privacy.
        </p>
      </div>

      <Tabs
        activeId={tab}
        onChange={(id) => {
          setTab(id);
          setParams({ tab: id });
        }}
        tabs={[
          { id: 'shipping', label: 'Shipping' },
          { id: 'returns', label: 'Returns & Refunds' },
          { id: 'privacy', label: 'Privacy' },
          { id: 'terms', label: 'Terms of Sale' },
        ]}
      />

      <div className="bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-4 text-sm text-[#525252] leading-relaxed">
        {tab === 'shipping' && (
          <>
            <h2 className="text-lg font-bold text-[#171717]">Insured Direct Dispatch</h2>
            <p>Orders over $150 qualify for complimentary standard insured shipping (3–5 business days). Priority Air Express (1–2 business days) is available for a flat $24 fee.</p>
            <p>Once assigned to the originating partner workshop, tracking numbers are published directly to your Account Orders and public Track Order portal.</p>
          </>
        )}
        {tab === 'returns' && (
          <>
            <h2 className="text-lg font-bold text-[#171717]">30-Day Studio Trial & Returns</h2>
            <p>Items may be returned within 30 days of delivery in original packaging. Initiate a return request directly from your order detail page; approved refunds are processed back to your original payment method within 3–5 business days.</p>
          </>
        )}
        {tab === 'privacy' && (
          <>
            <h2 className="text-lg font-bold text-[#171717]">Privacy & Order Data</h2>
            <p>Contact and delivery information is shared exclusively with the assigned partner atelier and courier required to fulfill your order. KOVA Atelier never sells customer data.</p>
          </>
        )}
        {tab === 'terms' && (
          <>
            <h2 className="text-lg font-bold text-[#171717]">Terms of Sale & Warranty</h2>
            <p>All architectural lighting and studio audio electronics carry a 3-year hardware warranty covering manufacturing and component defects under normal studio use.</p>
          </>
        )}
      </div>
    </div>
  );
}

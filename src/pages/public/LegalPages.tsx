import { Link } from 'react-router-dom'

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Legal</p>
      <h1 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mt-1">Last updated: to be confirmed by administration.</p>

      <Section title="1. Information we collect">DANU Orthopaedic Center collects only the information needed to provide specialist orthopaedic care, schedule appointments, and operate the centre. This includes identification, contact, appointment, clinical and billing information.</Section>
      <Section title="2. How we use information">We use personal information to deliver healthcare services, coordinate appointments, communicate about care, comply with legal obligations and improve safety.</Section>
      <Section title="3. Sharing">Personal information is only shared with authorised staff and, where required, with laboratories, imaging providers and referral partners. We never sell personal data.</Section>
      <Section title="4. Your rights">You may request to access or correct your personal information, subject to local regulation. Contact reception to make a request.</Section>
      <Section title="5. Security">We use role-based access control, audit logging, encrypted transport and storage, and restricted document access. Where security incidents occur we notify affected individuals in line with applicable law.</Section>
      <Section title="6. Contact">For privacy concerns contact reception.</Section>

      <p className="mt-8 text-sm text-slate-500">This template is a placeholder and should be reviewed and finalised by qualified counsel before production launch.</p>
      <div className="mt-6"><Link to="/" className="btn btn-ghost">← Back to home</Link></div>
    </div>
  )
}

export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Legal</p>
      <h1 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">Terms of Use</h1>
      <p className="text-sm text-slate-500 mt-1">Last updated: to be confirmed by administration.</p>

      <Section title="1. Acceptance">Use of this website and the DANU platform constitutes acceptance of these terms.</Section>
      <Section title="2. Medical disclaimer">Content on this site is for general information and does not replace professional medical advice. For emergencies contact local emergency services.</Section>
      <Section title="3. Accounts">You are responsible for safeguarding your account credentials. Notify us immediately of any unauthorised access.</Section>
      <Section title="4. Prohibited use">You agree not to misuse the platform (unauthorised access, interference, scraping, or other harmful behaviour).</Section>
      <Section title="5. Liability">To the extent permitted by law, DANU is not liable for indirect or consequential damages arising from use of the platform.</Section>
      <Section title="6. Governing law">These terms are governed by the laws of Ethiopia.</Section>
      <p className="mt-8 text-sm text-slate-500">This template is a placeholder and should be reviewed and finalised by qualified counsel before production launch.</p>
      <div className="mt-6"><Link to="/" className="btn btn-ghost">← Back to home</Link></div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-navy-800">{title}</h2>
      <p className="text-slate-700 leading-relaxed mt-1 text-sm">{children}</p>
    </section>
  )
}

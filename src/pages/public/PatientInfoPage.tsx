export default function PatientInfoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Patient information</p>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">What to bring and what to expect</h1>
      </header>
      <section className="grid md:grid-cols-2 gap-5">
        {[
          ['Before your visit', 'Bring an ID, a list of current medications, and any previous imaging or reports related to your concern.'],
          ['During your visit', 'Your clinician will take a full history and examine you. Ask anything — informed care is better care.'],
          ['Privacy', 'Your records are protected by role-based access. Staff only see what they need to do their job.'],
          ['After your visit', 'A care plan and any required follow-up will be coordinated by reception.'],
        ].map(([t, d]) => (
          <article key={t} className="card p-6">
            <h2 className="font-semibold text-navy-800 text-lg">{t}</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{d}</p>
          </article>
        ))}
      </section>
      <section className="card p-6 mt-8 bg-amber-50 border-amber-200 text-sm text-amber-900">
        <strong>Note.</strong> Pricing is communicated once a service is confirmed during scheduling.
      </section>
    </div>
  )
}

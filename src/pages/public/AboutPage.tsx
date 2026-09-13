import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-teal-600">About DANU</p>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">An orthopaedic centre built for Ethiopia.</h1>
        <p className="mt-3 text-slate-600 max-w-3xl">
          DANU Orthopaedic Center exists to bring international-standard specialist
          orthopaedic care to patients and families in Addis Ababa and beyond.
        </p>
      </header>
      <section className="grid md:grid-cols-3 gap-5">
        {[
          ['Mission', 'Provide accessible specialist orthopaedic care, education and rehabilitation pathways.'],
          ['Approach', 'Evidence-based protocols, secure records, and humane communication with every patient.'],
          ['Integrity', 'We publish only verified information about our people and the care we deliver.'],
        ].map(([title, body]) => (
          <article key={title} className="card p-6">
            <h2 className="font-display font-extrabold text-navy-800 text-lg">{title}</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{body}</p>
          </article>
        ))}
      </section>
      <section className="mt-12 card p-8">
        <h2 className="text-2xl font-display font-extrabold text-navy-800">Leadership principles</h2>
        <ul className="mt-4 grid sm:grid-cols-2 gap-4 text-sm text-slate-700">
          {[
            'Patient safety first.',
            'Honesty over claims.',
            'Privacy by design.',
            'Education for patients and clinicians.',
            'Operational excellence.',
            'Long-term partnerships with Ethiopian healthcare.',
          ].map(item => (
            <li key={item} className="flex gap-2 items-start"><span className="w-2 h-2 mt-2 rounded-full bg-teal-500" /> {item}</li>
          ))}
        </ul>
      </section>
      <div className="text-center mt-12">
        <Link to="/appointment" className="btn btn-primary">Book a Consultation</Link>
      </div>
    </div>
  )
}

import AdminConsole from '@/components/AdminConsole';
export const dynamic='force-dynamic';
export default function Admin(){return <section className="content-page admin-page"><span className="eyebrow">INTERNAL OPERATIONS</span><h1>Verification desk</h1><p>Published information requires evidence and an independent reviewer. Clinical protocols require a licensed clinician. All staff actions require an assigned role and MFA.</p><AdminConsole/></section>;}

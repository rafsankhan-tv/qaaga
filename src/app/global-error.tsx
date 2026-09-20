'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'sans-serif', background: '#f8fafc', color: '#0f172a' }}>
          <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center', background: '#ffffff', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>একটি অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে</h2>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1.25rem' }}>অনুগ্রহ করে পেজটি আবার রিফ্রেশ করুন বা কিছুক্ষণ পর চেষ্টা করুন।</p>
            {error?.digest && (
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem', fontFamily: 'monospace' }}>Code: {error.digest}</p>
            )}
            <button
              type="button"
              onClick={() => reset()}
              style={{ padding: '0.625rem 1.25rem', background: '#7c3aed', color: '#ffffff', fontSize: '0.875rem', fontWeight: 500, borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}


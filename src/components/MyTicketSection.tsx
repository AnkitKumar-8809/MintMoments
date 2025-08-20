import { useState } from 'react';
import StatusCard from './StatusCard';

export default function MyTicketSection() {
  const [manualId, setManualId] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>('');

  return (
    <section id="myticket" className="container pt-10 px-4 md:px-8">
      <div
        className="rounded-3xl shadow-xl p-8 md:p-10 border border-green-300 bg-[#93C572] text-black"
      >
        {/* Heading with mint background */}
        <h2 className="text-3xl font-bold mb-6 text-center">
          <span
            style={{
              color: '#000',
              padding: '0.5rem 1rem',
              }}
          >
            View My Ticket
          </span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Input Field */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm" style={{ color: 'black' }}>
              Enter Token ID
            </label>
            <input
              className="w-full py-2 px-3 rounded-lg bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="e.g. 1" style={{color: 'black'}}
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
            />
          </div>

          {/* Load Button */}
          <div className="flex items-end">
            <button
              className="w-full py-2 rounded-lg border border-green-600 bg-green-600 text-black font-semibold hover:bg-green-300 transition"
              onClick={() => setSelectedId(manualId)}
            >
              Load Ticket
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-black/60">
          Tip: If your contract supports enumeration, you can extend this to auto‑detect owned token IDs.
        </div>

        {/* Status Card */}
        <div className="mt-6">
          {selectedId && <StatusCard tokenId={selectedId} />}
        </div>
      </div>
    </section>
  );
}

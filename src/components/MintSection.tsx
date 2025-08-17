import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ABI, CONTRACT_ADDRESS, CHAIN_EXPLORER } from '../config/contract'
import { useEffect, useState } from 'react'
import { shortAddr } from '../lib/format'
import { megaETHTestnet } from '../lib/wagmi'

export default function MintSection() {
  const { address, isConnected } = useAccount()
  const [eventId, setEventId] = useState<number>(1)
  const [tier, setTier] = useState<number>(1)
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined)

  const { writeContract, data, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  useEffect(() => { if (data) setHash(data) }, [data])

  const onMint = () => {
    if (!isConnected) { alert('Connect your wallet first'); return }
    writeContract({
      abi: ABI, address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: 'mintTicket',
      args: [BigInt(eventId), Number(tier)],
      chain: megaETHTestnet,
      account: address
    })
  }

  return (
    <section id="mint" className="space-y-4">
      <h2 className="text-2xl font-bold">Mint Ticket</h2>
      <div className="card p-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Event</label>
            <select className="select w-full" value={eventId} onChange={e => setEventId(Number(e.target.value))}>
              <option value={1}>Innovate‑A‑Thon • Day 1</option>
              <option value={2}>Innovate‑A‑Thon • Day 2</option>
              <option value={3}>Innovate‑A‑Thon • Finale</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Ticket Tier</label>
            <select className="select w-full" value={tier} onChange={e => setTier(Number(e.target.value))}>
              <option value={1}>General</option>
              <option value={2}>VIP</option>
              <option value={3}>Backstage</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={onMint} className="btn btn-primary w-full" disabled={isPending || isConfirming}>
              {isPending ? 'Confirm in wallet...' : isConfirming ? 'Minting...' : 'Mint Ticket'}
            </button>
          </div>
        </div>
        {error && <div className="text-red-400 text-sm">Error: {error.message.slice(0,160)}</div>}
        {hash && (
          <div className="text-sm text-white/70">
            Tx: <a href={`${CHAIN_EXPLORER}/tx/${hash}`} target="_blank" rel="noreferrer">{ shortAddr(hash) }</a>
            {' '}— {isConfirmed ? '✅ Confirmed' : '⏳ Pending'}
          </div>
        )}
        <div className="text-xs text-white/50">Connected: {address ? shortAddr(address) : '—'}</div>
      </div>
    </section>
  )
}

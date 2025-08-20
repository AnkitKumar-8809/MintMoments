import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ABI, CONTRACT_ADDRESS, CHAIN_EXPLORER } from '../config/contract'
import { useEffect, useState } from 'react'
import { shortAddr } from '../lib/format'
import { megaETHTestnet } from '../lib/wagmi'
import { Heading1 } from 'lucide-react'

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
    <>
      {/* Section 1: What is an NFT Ticket */}
      <section className="bg-[#0021479c] py-12">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
            <div className="md:w-2/3 text-white space-y-6 animate__animated animate__fadeIn animate__delay-1s">
              <h2 className="text-3xl font-semibold text-green-300">What Is an NFT Ticket?</h2>
              <p className="text-lg font-medium">
                Non-Fungible (non-interchangeable) token tickets use blockchain encryption to provide ticket buyers with unique digital codes which can be used to authenticate ticket purchases. This is designed to make tickets difficult to forge, reducing phony ticket sales and improving event security.
              </p>
              <p className="text-lg font-medium">
                Blockchain technology makes forgery difficult by creating an encrypted, linked set of records that are timestamped and verified. This ensures that each ticket is traceable, verifiable, and impossible to forge.
              </p>
            </div>
            <div className="md:w-1/3 flex justify-center items-center animate__animated animate__fadeIn animate__delay-2s">
              <img
                src="https://videos.openai.com/vg-assets/assets%2Ftask_01jz0m7y4tfjntqe84z1cz95et%2F1751294291_img_0.webp?st=2025-08-18T17%3A29%3A43Z&se=2025-08-24T18%3A29%3A43Z&sks=b&skt=2025-08-18T17%3A29%3A43Z&ske=2025-08-24T18%3A29%3A43Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=aa5ddad1-c91a-4f0a-9aca-e20682cc8969&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=vdt4f85NkW7ot%2FVBq2PBKJhyvlfNjqT15OiE26NVf88%3D&az=oaivgprodscus"
                alt="NFT Ticket"
                className="w-full h-full object-cover rounded-md"
                style={{ aspectRatio: '1' }}  // Ensures the image is square
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How NFT Event Tickets Work */}
      <section className="bg-[#0021479c] py-12">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center text-center md:text-left">
            <div className="md:w-1/3 flex justify-center items-center animate__animated animate__fadeIn animate__delay-1s">
              <video
                className="rounded-md shadow-lg w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                style={{ aspectRatio: '1' }} // Ensures video is square
                src="https://videos.openai.com/vg-assets/assets%2Ftask_01jt0wyn3zfjy9aa9t6w4m8jc2%2Ftask_01jt0wyn3zfjy9aa9t6w4m8jc2_genid_30400a1a-0e84-41e9-842d-d28847009ed5_25_04_29_13_55_937875%2Fvideos%2F00000_412365910%2Fmd.mp4?st=2025-08-18T18%3A24%3A43Z&se=2025-08-24T19%3A24%3A43Z&sks=b&skt=2025-08-18T18%3A24%3A43Z&ske=2025-08-24T19%3A24%3A43Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=aa5ddad1-c91a-4f0a-9aca-e20682cc8969&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=GJXlNMyJvw8lRYA2rJGrBUqUdN3cJWE%2FQDH6%2BbGcN7E%3D&az=oaivgprodscus"
              />
            </div>
            <div className="md:w-2/3 text-white space-y-6 animate__animated animate__fadeIn animate__delay-2s">
              <h2 className="text-3xl font-semibold mint text-green-300">How NFT Event Tickets Work</h2>
              <p className="text-lg font-medium">
                NFT tickets use blockchain for secure, traceable authentication, preventing forgery. The process combines smartphone cameras and facial recognition for identity verification. Here's how it works with Incode ID:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-lg">
                <li>Buyer registers and submits ID (e.g., driver's license) via smartphone.</li>
                <li>A selfie is taken for facial recognition verification.</li>
                <li>An NFT ticket is issued in under 2 minutes.</li>
                <li>At the event, entry and purchases are verified through a scan of the digital ticket and face.</li>
              </ol>
              <p className="text-lg font-medium">
                This ensures secure ticketing and seamless access, payments, and VIP features at events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Benefits of NFT Ticketing with Incode ID */}
      <section className="bg-[#0021479c] py-12">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center text-center md:text-left">
            <div className="md:w-2/3 text-white space-y-6 animate__animated animate__fadeIn animate__delay-1s">
              <h2 className="text-3xl font-semibold text-green-300">Benefits of NFT Ticketing with Incode ID</h2>
              <p className="text-lg font-medium">
                NFT ticketing offers a secure and cost-effective solution for events by leveraging blockchain to prevent fraud, control resale prices, and enable ongoing royalties. Digital tickets are cheaper, produced instantly, and easily accessible via cloud or app, reducing the risk of loss or damage.
              </p>
              <p className="text-lg font-medium">
                Incode ID enhances NFT ticketing with secure, seamless identity verification. Users authenticate with a selfie, ensuring smooth entry and access, providing an added layer of security.
              </p>
            </div>
            <div className="md:w-1/3 flex justify-center items-center animate__animated animate__fadeIn animate__delay-2s">
              <video
                className="rounded-md shadow-lg w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                style={{ aspectRatio: '1' }}  // Ensures video is square
                src="https://videos.openai.com/vg-assets/assets%2Ftask_01jnpf3sk2fd9v0bkmta2wfhya%2Ftask_01jnpf3sk2fd9v0bkmta2wfhya_genid_b7ef53c6-fe56-479f-b025-c690ad9f1668_25_03_06_19_48_843624%2Fvideos%2F00000_468408655%2Fmd.mp4?st=2025-08-18T18%3A24%3A52Z&se=2025-08-24T19%3A24%3A52Z&sks=b&skt=2025-08-18T18%3A24%3A52Z&ske=2025-08-24T19%3A24%3A52Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=aa5ddad1-c91a-4f0a-9aca-e20682cc8969&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=oxdLsRHcieoVQr5koly%2F8yy%2FVsqN2QHQx4JMUTrppZ8%3D&az=oaivgprodscus"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Mint Ticket */}
      <section id="mint" className="bg-[#93C572] py-10 text-center rounded-3xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Mint Ticket</h1>
        <div className="card p-6 space-y-4 bg-white/20 shadow-xl rounded-xl">

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-black/70">Event</label>
              <select className="select w-full text-black" value={eventId} onChange={e => setEventId(Number(e.target.value))}>
                <option value={1}>Innovate‑A‑Thon • Day 1</option>
                <option value={2}>Innovate‑A‑Thon • Day 2</option>
                <option value={3}>Innovate‑A‑Thon • Finale</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-black/70">Ticket Tier</label>
              <select className="select w-full text-black" value={tier} onChange={e => setTier(Number(e.target.value))}>
                <option value={1}>General</option>
                <option value={2}>VIP</option>
                <option value={3}>Backstage</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={onMint} className="w-full py-2 rounded-lg border border-green-600 bg-green-600 text-black font-semibold hover:bg-green-300 transition" disabled={isPending || isConfirming}>
                {isPending ? 'Confirm in wallet...' : isConfirming ? 'Minting...' : 'Mint Ticket'}
              </button>
            </div>
          </div>
          {error && <div className="text-red-400 text-sm">Error: {error.message.slice(0, 160)}</div>}
          {hash && (
            <div className="text-sm text-black/70">
              Tx:{' '}
              <a href={`${CHAIN_EXPLORER}/tx/${hash}`} target="_blank" rel="noreferrer">
                {shortAddr(hash)}
              </a>{' '}
              — {isConfirmed ? '✅ Confirmed' : '⏳ Pending'}
            </div>
          )}
          <div className="text-xs text-black/50">Connected: {address ? shortAddr(address) : '—'}</div>
        </div>
      </section>
    </>
  )
}

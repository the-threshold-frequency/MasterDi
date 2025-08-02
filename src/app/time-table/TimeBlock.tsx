export default function TimeBlock({ block, day, slot, onClick }) {
  return (
    <div
      className="border border-neon p-2 min-h-[80px] text-xs bg-[#1a1a1a] hover:bg-[#222] transition cursor-pointer"
      onClick={() => onClick(block, day, slot)}
    >
      {block ? (
        <>
          <div className="font-bold text-neon">{block.subject}</div>
          {block.comment && <div className="italic text-gray-400">{block.comment}</div>}
        </>
      ) : (
        <span className="text-gray-600">+ Add</span>
      )}
    </div>
  )
}

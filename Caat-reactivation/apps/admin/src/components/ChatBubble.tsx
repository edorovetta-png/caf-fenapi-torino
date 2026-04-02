export default function ChatBubble({
  direction,
  text,
  time,
  type,
}: {
  direction: "in" | "out";
  text: string;
  time?: string;
  type?: string;
}) {
  const isOut = direction === "out";
  return (
    <div className={`flex ${isOut ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
          isOut
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-slate-100 text-slate-800 rounded-bl-md"
        }`}
      >
        {type === "audio" && <span className="text-xs opacity-70">🎤 Audio trascritto: </span>}
        {text}
        {time && (
          <p className={`text-[10px] mt-1 ${isOut ? "text-blue-200" : "text-slate-400"}`}>
            {time}
          </p>
        )}
      </div>
    </div>
  );
}

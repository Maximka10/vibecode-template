import { ChatWindow, Message } from "@/components/chat/ChatWindow";

export default function ChatTab({
  orderId,
  adminId,
  initialMessages,
}: {
  orderId: string;
  adminId: string;
  initialMessages: Message[];
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 overflow-hidden">
      <ChatWindow
        orderId={orderId}
        currentUserId={adminId}
        currentUserRole="admin"
        initialMessages={initialMessages}
        height="h-[calc(100vh-260px)]"
      />
    </div>
  );
}

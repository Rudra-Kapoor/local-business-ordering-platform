import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { getSocket } from "../../lib/socket";
import type { OrderChatMessage } from "../../lib/types";
import { Button } from "../ui/Button";
import { cn, formatDateTime } from "../../lib/utils";

export function OrderChatBox({
  orderId,
  title,
}: {
  orderId: string;
  title: string;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState("");

  const chatQuery = useQuery({
    queryKey: ["orderChat", { orderId }],
    queryFn: async () => {
      const res = await api.get<{ orderId: string; messages: OrderChatMessage[] }>(
        `/orders/${orderId}/chat`
      );
      return res.data;
    },
    enabled: !!orderId,
  });

  useEffect(() => {
    if (!orderId) return;
    const socket = getSocket();
    socket.emit("joinRoom", { type: "order", id: orderId });

    const handler = (msg: OrderChatMessage) => {
      if (String(msg.orderId) !== String(orderId)) return;
      qc.setQueryData<{ orderId: string; messages: OrderChatMessage[] }>(
        ["orderChat", { orderId }],
        (prev) => {
          if (!prev) return { orderId, messages: [msg] };
          const exists = prev.messages.some((m) => m._id === msg._id);
          if (exists) return prev;
          return { ...prev, messages: [...prev.messages, msg] };
        }
      );
    };

    socket.on("chatMessage", handler);
    return () => {
      socket.off("chatMessage", handler);
    };
  }, [orderId, qc]);

  const send = useMutation({
    mutationFn: async () => {
      const message = text.trim();
      if (!message) throw new Error("Type a message");
      const res = await api.post<OrderChatMessage>(`/orders/${orderId}/chat`, {
        message,
      });
      return res.data;
    },
    onSuccess: (msg) => {
      setText("");
      qc.setQueryData<{ orderId: string; messages: OrderChatMessage[] }>(
        ["orderChat", { orderId }],
        (prev) => {
          if (!prev) return { orderId, messages: [msg] };
          const exists = prev.messages.some((m) => m._id === msg._id);
          if (exists) return prev;
          return { ...prev, messages: [...prev.messages, msg] };
        }
      );
    },
  });

  const messages = chatQuery.data?.messages ?? [];

  const body = useMemo(() => {
    if (chatQuery.isLoading) {
      return <div className="text-sm text-slate-600">Loading chat…</div>;
    }
    if (chatQuery.isError) {
      return (
        <div className="text-sm text-rose-700">
          {(chatQuery.error as Error).message}
        </div>
      );
    }
    if (!messages.length) {
      return (
        <div className="text-sm text-slate-600">
          No messages yet. Ask a question about this order.
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {messages.map((m) => {
          return (
            <div key={m._id} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {typeof m.senderId === "string" ? m.senderRole : m.senderId.name}
                </div>
                <div className="text-xs text-slate-500">{formatDateTime(m.createdAt)}</div>
              </div>
              <div className={cn("mt-1 text-sm text-slate-800")}>{m.message}</div>
            </div>
          );
        })}
      </div>
    );
  }, [chatQuery.error, chatQuery.isError, chatQuery.isLoading, messages]);

  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <Button variant="secondary" size="sm" onClick={() => chatQuery.refetch()}>
          Refresh
        </Button>
      </div>

      <div className="max-h-72 overflow-auto pr-1">{body}</div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <textarea
          className="min-h-11 w-full resize-none rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
          placeholder="Write a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button
          className="sm:w-32"
          isLoading={send.isPending}
          onClick={() => send.mutate()}
        >
          Send
        </Button>
      </div>
    </div>
  );
}


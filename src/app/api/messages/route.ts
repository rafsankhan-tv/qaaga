import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuthenticatedSupabase } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const SendMessageSchema = z.object({
  threadId: z.string().min(1),
  text: z.string().trim().min(1).max(2000),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuthenticatedSupabase(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await auth.supabase
    .from('threads')
    .select('*, messages(*)')
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Unable to load messages.' }, { status: 502 });

  const threads = (data || []).map((t: any) => ({
    id: t.id,
    hostName: t.host_name,
    listingTitle: t.listing_title,
    listingImage: t.listing_image,
    unread: Boolean(t.unread),
    messages: Array.isArray(t.messages) ? t.messages.map((m: any) => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      time: m.time,
    })) : [],
  }));

  return NextResponse.json({ threads, status: threads.length ? 'ok' : 'empty' });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedSupabase(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const parsed = SendMessageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid message payload.' }, { status: 400 });

  const { threadId, text } = parsed.data;
  const email = auth.user.email!.toLowerCase();

  const { data: thread, error: threadError } = await auth.supabase
    .from('threads')
    .select('id,host_email,guest_email')
    .eq('id', threadId)
    .maybeSingle();

  if (threadError || !thread) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });

  const sender = thread.host_email?.toLowerCase() === email
    ? 'host'
    : thread.guest_email?.toLowerCase() === email
      ? 'guest'
      : null;

  if (!sender && auth.user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'You are not a participant in this conversation.' }, { status: 403 });
  }

  const { data: message, error } = await auth.supabase.from('messages').insert({
    thread_id: threadId,
    sender: sender || 'admin',
    sender_email: email,
    text,
    time: new Date().toISOString(),
  }).select().single();

  if (error || !message) return NextResponse.json({ error: 'Message could not be sent.' }, { status: 502 });

  const { error: updateError } = await auth.supabase
    .from('threads')
    .update({ last_message: text, updated_at: new Date().toISOString() })
    .eq('id', threadId);

  if (updateError) return NextResponse.json({ error: 'Message sent, but conversation state could not be updated.' }, { status: 502 });

  return NextResponse.json({ success: true, message }, { status: 201 });
}

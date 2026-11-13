import { NextRequest, NextResponse } from 'next/server';
import { MessageSchema } from '@/lib/validations';
import { getSupabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ threads: [], status: 'error' });
  }

  try {
    const { data, error } = await supabase
      .from('threads')
      .select('*, messages(*)')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ threads: [], status: 'error', error: error.message });
    }

    const threads = Array.isArray(data)
      ? data.map((t: any) => ({
          id: t.id,
          hostName: t.host_name,
          listingTitle: t.listing_title,
          listingImage: t.listing_image,
          unread: Boolean(t.unread),
          messages: Array.isArray(t.messages)
            ? t.messages.map((m: any) => ({
                id: m.id,
                sender: m.sender,
                text: m.text,
                time: m.time,
              }))
            : [],
        }))
      : [];

    return NextResponse.json({ threads, status: threads.length > 0 ? 'ok' : 'empty' });
  } catch (err: any) {
    return NextResponse.json({ threads: [], status: 'error', error: err?.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = MessageSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid message payload', details: validated.error.format() },
        { status: 400 }
      );
    }

    const { threadId, sender, text, time } = validated.data;
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    await supabase.from('messages').insert({
      thread_id: threadId,
      sender,
      text,
      time,
    });

    await supabase
      .from('threads')
      .update({
        last_message: text,
        updated_at: new Date().toISOString(),
      })
      .eq('id', threadId);

    return NextResponse.json({
      success: true,
      message: { id: `msg-${Date.now()}`, sender, text, time },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

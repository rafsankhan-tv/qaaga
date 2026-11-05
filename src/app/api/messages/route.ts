import { NextRequest, NextResponse } from 'next/server';
import { MessageSchema } from '@/lib/validations';
import { getSupabase } from '@/lib/supabaseClient';
import { INITIAL_THREADS } from '@/data/listings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('threads')
        .select('*, messages(*)')
        .order('updated_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const threads = data.map((t: any) => ({
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
        }));
        return NextResponse.json({ threads });
      }
    } catch {
      // fallback
    }
  }

  return NextResponse.json({ threads: INITIAL_THREADS });
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

    if (supabase) {
      try {
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
      } catch (dbErr) {
        console.warn('Notice: Supabase message insert exception:', dbErr);
      }
    }

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

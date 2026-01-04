import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET - Fetch all chat sessions with messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const status = searchParams.get('status');
    const sessionId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch single session with messages
    if (sessionId) {
      const sessions = await sql`
        SELECT * FROM chat_sessions WHERE id = ${sessionId}
      `;

      if (sessions.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const messages = await sql`
        SELECT * FROM chat_messages
        WHERE session_id = ${sessionId}
        ORDER BY created_at ASC
      `;

      const session = sessions[0];
      return NextResponse.json({
        session: {
          id: session.id,
          visitorId: session.visitor_id,
          source: session.source,
          status: session.status,
          pageUrl: session.page_url,
          referrer: session.referrer,
          device: session.device,
          startedAt: session.started_at,
          endedAt: session.ended_at,
          messages: messages.map((m: Record<string, unknown>) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: m.created_at,
          })),
        }
      });
    }

    // Fetch all sessions
    let sessions;
    if (source && source !== 'all' && status && status !== 'all') {
      sessions = await sql`
        SELECT cs.*,
               (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) as message_count,
               (SELECT content FROM chat_messages WHERE session_id = cs.id AND role = 'user' ORDER BY created_at ASC LIMIT 1) as preview
        FROM chat_sessions cs
        WHERE source = ${source} AND status = ${status}
        ORDER BY started_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (source && source !== 'all') {
      sessions = await sql`
        SELECT cs.*,
               (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) as message_count,
               (SELECT content FROM chat_messages WHERE session_id = cs.id AND role = 'user' ORDER BY created_at ASC LIMIT 1) as preview
        FROM chat_sessions cs
        WHERE source = ${source}
        ORDER BY started_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (status && status !== 'all') {
      sessions = await sql`
        SELECT cs.*,
               (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) as message_count,
               (SELECT content FROM chat_messages WHERE session_id = cs.id AND role = 'user' ORDER BY created_at ASC LIMIT 1) as preview
        FROM chat_sessions cs
        WHERE status = ${status}
        ORDER BY started_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      sessions = await sql`
        SELECT cs.*,
               (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) as message_count,
               (SELECT content FROM chat_messages WHERE session_id = cs.id AND role = 'user' ORDER BY created_at ASC LIMIT 1) as preview
        FROM chat_sessions cs
        ORDER BY started_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    // Get total count
    const countResult = await sql`SELECT COUNT(*) as total FROM chat_sessions`;
    const total = Number(countResult[0]?.total || 0);

    // Get stats
    const statsResult = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE started_at >= CURRENT_DATE) as today,
        COALESCE(AVG((SELECT COUNT(*) FROM chat_messages WHERE session_id = chat_sessions.id)), 0) as avg_messages
      FROM chat_sessions
    `;

    const transformedSessions = sessions.map((s: Record<string, unknown>) => ({
      id: s.id,
      visitorId: s.visitor_id,
      source: s.source,
      status: s.status,
      pageUrl: s.page_url,
      device: s.device,
      messageCount: Number(s.message_count || 0),
      preview: s.preview ? String(s.preview).substring(0, 100) + (String(s.preview).length > 100 ? '...' : '') : 'Geen berichten',
      startedAt: s.started_at,
      endedAt: s.ended_at,
    }));

    return NextResponse.json({
      sessions: transformedSessions,
      total,
      stats: {
        total: Number(statsResult[0]?.total || 0),
        active: Number(statsResult[0]?.active || 0),
        today: Number(statsResult[0]?.today || 0),
        avgMessages: Math.round(Number(statsResult[0]?.avg_messages || 0)),
      },
      limit,
      offset,
    });
  } catch (error) {
    console.error('Chats GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats', sessions: [] },
      { status: 500 }
    );
  }
}

// POST - Create a new chat session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      visitorId,
      source = 'widget',
      pageUrl,
      referrer,
      device,
      userAgent,
    } = body;

    if (!visitorId) {
      return NextResponse.json(
        { error: 'Visitor ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO chat_sessions (visitor_id, source, page_url, referrer, device, user_agent)
      VALUES (${visitorId}, ${source}, ${pageUrl || null}, ${referrer || null}, ${device || null}, ${userAgent || null})
      RETURNING id, visitor_id, source, started_at
    `;

    // Log activity
    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES (
        'chat',
        'Chat gesprek gestart',
        ${pageUrl || 'Onbekende pagina'},
        ${JSON.stringify({ sessionId: result[0]?.id, source })}
      )
    `;

    return NextResponse.json({
      session: {
        id: result[0]?.id,
        visitorId: result[0]?.visitor_id,
        source: result[0]?.source,
        startedAt: result[0]?.started_at,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Chats POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    );
  }
}

// PUT - Update session (end it) or add message
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, action, message } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (action === 'end') {
      // End the session
      const result = await sql`
        UPDATE chat_sessions
        SET status = 'completed', ended_at = NOW()
        WHERE id = ${sessionId}
        RETURNING id, status, ended_at
      `;

      if (result.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json({ session: result[0] });
    }

    if (action === 'message' && message) {
      // Add a message
      const result = await sql`
        INSERT INTO chat_messages (session_id, role, content)
        VALUES (${sessionId}, ${message.role}, ${message.content})
        RETURNING id, role, content, created_at
      `;

      return NextResponse.json({
        message: {
          id: result[0]?.id,
          role: result[0]?.role,
          content: result[0]?.content,
          createdAt: result[0]?.created_at,
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Chats PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update chat' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a chat session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Messages will be cascade deleted due to foreign key
    const result = await sql`
      DELETE FROM chat_sessions WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chats DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat session' },
      { status: 500 }
    );
  }
}

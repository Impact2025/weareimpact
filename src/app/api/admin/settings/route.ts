import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// Default settings
const defaultSettings = {
  profile: {
    name: 'Vincent van Munster',
    email: 'v.munster@weareimpact.nl',
  },
  notifications: {
    emailNewLead: true,
    emailNewChat: false,
    emailWeeklyReport: true,
    browserNotifications: true,
  },
  ai: {
    chatEnabled: true,
    scannerEnabled: true,
    bookingEnabled: true,
    maxTokens: '400',
    temperature: '0.7',
  },
};

// GET - Fetch admin settings
export async function GET() {
  try {
    // Try to get existing settings
    const result = await sql`
      SELECT settings FROM admin_settings WHERE id = 1
    `;

    if (result.length > 0 && result[0].settings) {
      return NextResponse.json(result[0].settings);
    }

    // Return defaults if no settings exist
    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error('Settings GET error:', error);
    // If table doesn't exist, return defaults
    return NextResponse.json(defaultSettings);
  }
}

// PUT - Update admin settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Merge with defaults to ensure all fields exist
    const settings = {
      profile: { ...defaultSettings.profile, ...body.profile },
      notifications: { ...defaultSettings.notifications, ...body.notifications },
      ai: { ...defaultSettings.ai, ...body.ai },
    };

    // Upsert settings (insert or update)
    await sql`
      INSERT INTO admin_settings (id, settings, updated_at)
      VALUES (1, ${JSON.stringify(settings)}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        settings = ${JSON.stringify(settings)},
        updated_at = NOW()
    `;

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

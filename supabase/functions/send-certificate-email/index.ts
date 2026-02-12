import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured, skipping email');
      return new Response(JSON.stringify({ success: true, skipped: true, message: 'Email service not configured yet' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { username, score, totalQuestions, percentage, difficulty, certificateId } = await req.json();

    const verifyUrl = `https://s-quiz.lovable.app/verify/${certificateId}`;
    const diffColor = difficulty === 'easy' ? '#4ade80' : difficulty === 'medium' ? '#facc15' : '#f87171';

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background: linear-gradient(135deg, #1e293b 0%, #312e81 50%, #1e293b 100%); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 16px; padding: 40px; text-align: center; }
        .trophy { font-size: 64px; margin-bottom: 16px; }
        h1 { color: #22d3ee; font-size: 28px; margin-bottom: 8px; }
        .subtitle { color: #94a3b8; font-size: 16px; margin-bottom: 24px; }
        .score-box { background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0; }
        .score { font-size: 48px; font-weight: bold; color: #22d3ee; }
        .details { color: #94a3b8; font-size: 14px; margin-top: 8px; }
        .cert-id { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 12px; margin: 20px 0; color: #f59e0b; font-family: monospace; font-size: 14px; }
        .verify-btn { display: inline-block; background: linear-gradient(to right, #d97706, #f59e0b); color: #0f172a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 16px; }
        .footer { color: #64748b; font-size: 12px; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="trophy">🏆</div>
          <h1>Congratulations, ${username}! 🎉</h1>
          <p class="subtitle">You've successfully passed the Cyber Security Awareness Quiz!</p>
          
          <div class="score-box">
            <div class="score">${percentage}%</div>
            <div class="details">${score} out of ${totalQuestions} correct</div>
            <div class="details">Difficulty: <span style="color: ${diffColor}; text-transform: capitalize; font-weight: bold;">${difficulty}</span></div>
          </div>
          
          <p style="color: #e2e8f0;">Your certificate has been issued and is ready for download.</p>
          
          <div class="cert-id">Certificate ID: ${certificateId}</div>
          
          <a href="${verifyUrl}" class="verify-btn">🔗 Verify Your Certificate</a>
          
          <p class="footer">
            This certificate can be verified at any time using the link above.<br/>
            Cyber Security Awareness Quiz &bull; ${new Date().getFullYear()}
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Cyber Quiz <onboarding@resend.dev>',
        to: [user.email],
        subject: `🏆 Congratulations ${username}! You Passed the Cyber Security Quiz!`,
        html: emailHtml,
      }),
    });

    const resData = await res.json();
    if (!res.ok) {
      console.error('Resend error:', resData);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: resData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, emailId: resData.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Temporary file - disabled to avoid static build export errors.
export const dynamic = 'force-static';
export async function GET() {
  return new Response(JSON.stringify({ status: 'disabled' }), {
    headers: { 'content-type': 'application/json' }
  });
}

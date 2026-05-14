import { Resend } from "resend";

type DrawEmailInput = {
  to: string;
  groupName: string;
  maxPrice: number;
  giverName: string;
  receiverName: string;
  receiverSuggestions: string | null;
  message: string | null;
  groupUrl: string;
};

export async function sendDrawEmail(input: DrawEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return {
      id: null,
      error: "Faltan RESEND_API_KEY o RESEND_FROM_EMAIL",
    };
  }

  const resend = new Resend(apiKey);
  const suggestions = input.receiverSuggestions?.trim()
    ? input.receiverSuggestions
    : "Todavía no ha añadido sugerencias.";

  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: `Tu amigo invisible en ${input.groupName}`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #111827; color: #f9fafb; padding: 32px;">
        <div style="max-width: 560px; margin: 0 auto; background: #fff7ed; color: #431407; border-radius: 28px; padding: 32px;">
          <p style="text-transform: uppercase; letter-spacing: 0.16em; font-size: 12px; color: #9a3412; margin: 0 0 12px;">Amigo invisible</p>
          <h1 style="font-size: 32px; line-height: 1.1; margin: 0 0 20px;">${escapeHtml(input.giverName)}, te ha tocado regalar a ${escapeHtml(input.receiverName)}</h1>
          <p style="font-size: 18px; line-height: 1.6; margin: 0 0 16px;">Grupo: <strong>${escapeHtml(input.groupName)}</strong></p>
          <p style="font-size: 18px; line-height: 1.6; margin: 0 0 16px;">Precio máximo: <strong>${input.maxPrice.toFixed(2)} €</strong></p>
          <div style="background: #fed7aa; border-radius: 18px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px; font-weight: 700;">Sugerencias de ${escapeHtml(input.receiverName)}</p>
            <p style="white-space: pre-line; margin: 0; line-height: 1.6;">${escapeHtml(suggestions)}</p>
          </div>
          ${input.message ? `<p style="line-height: 1.6;"><strong>Mensaje del organizador:</strong><br>${escapeHtml(input.message)}</p>` : ""}
          <a href="${input.groupUrl}" style="display: inline-block; margin-top: 20px; padding: 14px 18px; border-radius: 999px; background: #111827; color: #fff7ed; text-decoration: none; font-weight: 700;">Abrir Friendoo</a>
        </div>
      </div>
    `,
  });

  if (error) {
    return { id: null, error: error.message };
  }

  return { id: data?.id ?? null, error: null };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
